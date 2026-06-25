#!/usr/bin/env bash
# handover_search.sh — 全文搜尋 handover.db (FTS5 trigram + LIKE fallback)
# 用法: bash handover_search.sh --db <path> --q <query> [--limit 20] [--type knowledge,decision] [--status open]
# 邏輯:
#   1. 查詢含任何 ASCII 字元或 ≥3 字 → FTS5 trigram MATCH（含 rank 排序）
#   2. 否則（純 2 字中文如「弱掃」「稽核」「帳密」）→ LIKE fallback
#   3. 兩個都試、合併去重、按相關性排序
# 輸出: JSON array of {id, topic, snippet, session_type, status, last_at, score}
set -e

DB_PATH=""
Q=""
LIMIT="20"
TYPE=""
STATUS=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --db) DB_PATH="$2"; shift 2 ;;
    --q) Q="$2"; shift 2 ;;
    --limit) LIMIT="$2"; shift 2 ;;
    --type) TYPE="$2"; shift 2 ;;
    --status) STATUS="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

[ -z "$DB_PATH" ] && { echo "--db required"; exit 1; }
[ -z "$Q" ] && { echo "--q required"; exit 1; }
[ ! -f "$DB_PATH" ] && { echo "[]"; exit 0; }

HANDOVER_DB_PATH="$DB_PATH" \
HANDOVER_Q="$Q" \
HANDOVER_LIMIT="$LIMIT" \
HANDOVER_TYPE="$TYPE" \
HANDOVER_STATUS="$STATUS" \
python3 - <<'PYEOF'
import json, os, re, sqlite3

db = os.environ["HANDOVER_DB_PATH"]
q  = os.environ["HANDOVER_Q"].strip()
limit  = int(os.environ.get("HANDOVER_LIMIT") or "20")
ftypes = [x.strip() for x in (os.environ.get("HANDOVER_TYPE") or "").split(",") if x.strip()]
statuses = [x.strip() for x in (os.environ.get("HANDOVER_STATUS") or "").split(",") if x.strip()]

conn = sqlite3.connect(db)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# 偵測 FTS5 是否已建好
has_fts = False
try:
    cur.execute("SELECT 1 FROM handover_fts LIMIT 1")
    has_fts = True
except sqlite3.OperationalError:
    has_fts = False

# 判斷 query 適合 trigram 還是 LIKE
# trigram 至少需要 3 個 token char。中文字元算 1 個。
def char_kind(ch):
    if ch.isascii() and (ch.isalnum() or ch in "_-@."): return 'a'
    o = ord(ch)
    # CJK Unified Ideographs
    if 0x4E00 <= o <= 0x9FFF: return 'c'
    return 'x'

cleaned = ''.join(ch for ch in q if char_kind(ch) != 'x' or ch == ' ')
chinese_run = max((len(m.group()) for m in re.finditer(r'[一-鿿]+', cleaned)), default=0)
ascii_run   = max((len(m.group()) for m in re.finditer(r'[A-Za-z0-9_@\-\.]+', cleaned)), default=0)
use_fts = has_fts and (chinese_run >= 3 or ascii_run >= 3)

# 篩選條件 SQL
where_extra = []
params_extra = []
if ftypes:
    where_extra.append(f"h.session_type IN ({','.join(['?']*len(ftypes))})")
    params_extra.extend(ftypes)
if statuses:
    where_extra.append(f"h.status IN ({','.join(['?']*len(statuses))})")
    params_extra.extend(statuses)
extra_sql = (" AND " + " AND ".join(where_extra)) if where_extra else ""

results_by_id = {}

# Path 1: FTS5
if use_fts:
    safe = q.replace('"', '""')
    fts_query = f'"{safe}"'
    sql = f"""
        SELECT h.id, h.topic, h.session_type, h.status, h.completed, h.next_steps,
               h.created_at, h.updated_at, rank AS score, 'fts' AS via
        FROM handover_fts f JOIN handover h ON h.id = f.rowid
        WHERE handover_fts MATCH ?
        {extra_sql}
        ORDER BY rank LIMIT ?
    """
    try:
        for r in cur.execute(sql, [fts_query, *params_extra, limit]):
            results_by_id[r['id']] = dict(r)
    except sqlite3.OperationalError:
        pass  # FTS query syntax error → fall through to LIKE

# Path 2: LIKE fallback (對 2 字中文 / FTS 失敗時補強)
if not results_by_id or chinese_run < 3:
    pat = '%' + q.replace('%', r'\%').replace('_', r'\_') + '%'
    sql = f"""
        SELECT h.id, h.topic, h.session_type, h.status, h.completed, h.next_steps,
               h.created_at, h.updated_at, 0.0 AS score, 'like' AS via
        FROM handover h
        WHERE (
            h.topic LIKE ? ESCAPE '\\' OR
            h.completed LIKE ? ESCAPE '\\' OR
            h.decisions LIKE ? ESCAPE '\\' OR
            h.blocked LIKE ? ESCAPE '\\' OR
            h.next_steps LIKE ? ESCAPE '\\' OR
            h.lessons_learned LIKE ? ESCAPE '\\' OR
            h.conversation_summary LIKE ? ESCAPE '\\'
        )
        {extra_sql}
        ORDER BY h.updated_at DESC LIMIT ?
    """
    for r in cur.execute(sql, [pat]*7 + params_extra + [limit]):
        if r['id'] not in results_by_id:
            results_by_id[r['id']] = dict(r)

# 組 snippet（取第一個 hit 欄位的 100 字 + 高亮）
def make_snippet(row, q):
    for f in ('topic','completed','decisions','blocked','next_steps','lessons_learned','conversation_summary'):
        v = row.get(f) or ''
        if q in v:
            i = v.find(q)
            start = max(0, i - 30)
            end   = min(len(v), i + len(q) + 60)
            s = v[start:end]
            if start > 0: s = '...' + s
            if end < len(v): s = s + '...'
            return f"[{f}] {s}"
    # 沒命中欄位就回 topic 前 80 字
    return (row.get('topic') or '')[:80]

out = []
for r in results_by_id.values():
    out.append({
        'id': r['id'],
        'topic': r['topic'],
        'session_type': r['session_type'],
        'status': r['status'],
        'snippet': make_snippet(r, q),
        'updated_at': r['updated_at'],
        'via': r['via'],
        'score': r.get('score', 0.0),
    })

# fts 結果先、like 結果後
out.sort(key=lambda x: (0 if x['via']=='fts' else 1, x['score'] or 0))
out = out[:limit]

print(json.dumps({
    "query": q,
    "use_fts": use_fts,
    "count": len(out),
    "results": out
}, ensure_ascii=False, indent=2))

conn.close()
PYEOF
