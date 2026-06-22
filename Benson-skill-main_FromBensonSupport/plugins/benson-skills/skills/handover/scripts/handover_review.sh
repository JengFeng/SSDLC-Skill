#!/usr/bin/env bash
# handover_review.sh — 過期提醒 + mark reviewed
# 用法:
#   bash handover_review.sh --db <path>                       # 列出超過 90 天沒 review 的 open row
#   bash handover_review.sh --db <path> --days 180            # 自訂天數
#   bash handover_review.sh --db <path> --mark-reviewed <id>  # 把該 row 標記為 reviewed = 現在時間
#   bash handover_review.sh --db <path> --archive <id>        # 把該 row archive（status=archived）
set -e

DB_PATH=""
DAYS="90"
MARK_ID=""
ARCHIVE_ID=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --db) DB_PATH="$2"; shift 2 ;;
    --days) DAYS="$2"; shift 2 ;;
    --mark-reviewed) MARK_ID="$2"; shift 2 ;;
    --archive) ARCHIVE_ID="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

[ -z "$DB_PATH" ] && { echo "--db required"; exit 1; }
[ ! -f "$DB_PATH" ] && { echo "{}"; exit 0; }

HANDOVER_DB_PATH="$DB_PATH" \
HANDOVER_DAYS="$DAYS" \
HANDOVER_MARK_ID="$MARK_ID" \
HANDOVER_ARCHIVE_ID="$ARCHIVE_ID" \
python3 - <<'PYEOF'
import json, os, sqlite3
from datetime import datetime, timedelta

db = os.environ["HANDOVER_DB_PATH"]
days = int(os.environ.get("HANDOVER_DAYS") or "90")
mark_id = os.environ.get("HANDOVER_MARK_ID") or ""
archive_id = os.environ.get("HANDOVER_ARCHIVE_ID") or ""

conn = sqlite3.connect(db)
conn.row_factory = sqlite3.Row
cur = conn.cursor()
now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

# 動作模式：mark / archive
if mark_id:
    cur.execute("UPDATE handover SET last_reviewed_at = ?, updated_at = ? WHERE id = ?",
                (now, now, int(mark_id)))
    conn.commit()
    print(json.dumps({"action": "mark_reviewed", "id": int(mark_id), "ts": now}, ensure_ascii=False))
    raise SystemExit(0)

if archive_id:
    cur.execute("UPDATE handover SET status = 'archived', updated_at = ? WHERE id = ?",
                (now, int(archive_id)))
    conn.commit()
    print(json.dumps({"action": "archive", "id": int(archive_id), "ts": now}, ensure_ascii=False))
    raise SystemExit(0)

# 列表模式：找出過期 open row
threshold = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d %H:%M:%S')

# 規則：
# - status='open'
# - last_reviewed_at IS NULL → 用 updated_at 算
# - 否則用 last_reviewed_at 算
# - 比 threshold 還早的列出
sql = """
    SELECT
        id, topic, session_type, status,
        COALESCE(last_reviewed_at, updated_at) AS effective_review_at,
        updated_at, created_at,
        CAST(julianday('now') - julianday(COALESCE(last_reviewed_at, updated_at)) AS INTEGER) AS days_since_review
    FROM handover
    WHERE status = 'open'
      AND COALESCE(last_reviewed_at, updated_at) < ?
    ORDER BY effective_review_at ASC
"""
rows = [dict(r) for r in cur.execute(sql, (threshold,))]

# 統計：knowledge / credential / workflow / decision 等可能過期就過期、incident/blocker/commitment 比較動態應該更早提醒
type_buckets = {}
for r in rows:
    t = r['session_type'] or 'unknown'
    type_buckets.setdefault(t, []).append(r)

result = {
    "threshold_days": days,
    "threshold_at":   threshold,
    "stale_count":    len(rows),
    "by_type":        {t: len(v) for t, v in sorted(type_buckets.items())},
    "rows":           rows[:50],   # 最多回 50 筆，太多就分批
    "truncated":      len(rows) > 50,
}
print(json.dumps(result, ensure_ascii=False, indent=2))
conn.close()
PYEOF
