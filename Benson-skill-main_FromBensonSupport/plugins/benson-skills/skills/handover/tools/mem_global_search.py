"""mem_global_search.py — 跨專案 unified search

掃描全部 .handover/handover.db、聚合搜尋。

掃描範圍（可用 --roots 覆蓋、或 HANDOVER_PROJECTS_ROOTS 環境變數，分號分隔）：
  - C:\\Users\\benso\\Desktop\\CLAUDE COWORK\\PROJECTS\\*
  - C:\\github\\*

用法：
  python tools/mem_global_search.py "桃園水情"
  python tools/mem_global_search.py "弱掃" --type incident
  python tools/mem_global_search.py "帳密" --recent-days 30
  python tools/mem_global_search.py "VPN" --status open
  python tools/mem_global_search.py "@benson" --json
  python tools/mem_global_search.py --list-dbs
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sqlite3
import sys
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

DEFAULT_ROOTS = [
    r"C:\Users\benso\Desktop\CLAUDE COWORK\PROJECTS",
    r"C:\github",
]


def discover_dbs(roots: list[str]) -> list[Path]:
    """掃所有 root 下的 .handover/handover.db (深度 1 層、不遞迴太深)"""
    found = []
    for root in roots:
        rp = Path(root)
        if not rp.exists():
            continue
        # 直接子資料夾
        for sub in rp.iterdir():
            if not sub.is_dir():
                continue
            cand = sub / ".handover" / "handover.db"
            if cand.exists():
                found.append(cand)
        # root 自己也檢查（萬一 root 本身就是專案）
        cand = rp / ".handover" / "handover.db"
        if cand.exists():
            found.append(cand)
    return sorted(set(found))


def has_fts(conn: sqlite3.Connection) -> bool:
    try:
        conn.execute("SELECT 1 FROM handover_fts LIMIT 1")
        return True
    except sqlite3.OperationalError:
        return False


def search_one(db_path: Path, query: str, ftypes: list[str], statuses: list[str],
               recent_days: int | None, limit: int) -> list[dict]:
    """對一個 DB 跑 search，回傳 list of row dicts"""
    try:
        conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True, timeout=2)
    except sqlite3.OperationalError:
        return []
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # 偵測 FTS5
    use_fts = has_fts(conn)

    # 中文判斷
    chinese_run = max((len(m.group()) for m in re.finditer(r'[一-鿿]+', query)), default=0)
    ascii_run   = max((len(m.group()) for m in re.finditer(r'[A-Za-z0-9_@\-\.]+', query)), default=0)
    use_fts = use_fts and (chinese_run >= 3 or ascii_run >= 3)

    where_extra = []
    params_extra = []
    if ftypes:
        where_extra.append(f"h.session_type IN ({','.join(['?']*len(ftypes))})")
        params_extra.extend(ftypes)
    if statuses:
        where_extra.append(f"h.status IN ({','.join(['?']*len(statuses))})")
        params_extra.extend(statuses)
    if recent_days:
        threshold = (datetime.now() - timedelta(days=recent_days)).strftime('%Y-%m-%d %H:%M:%S')
        where_extra.append("COALESCE(h.updated_at, h.created_at) >= ?")
        params_extra.append(threshold)
    extra_sql = (" AND " + " AND ".join(where_extra)) if where_extra else ""

    rows: dict[int, dict] = {}

    if use_fts:
        try:
            safe = query.replace('"', '""')
            sql = f"""
                SELECT h.id, h.topic, h.session_type, h.status, h.completed,
                       h.updated_at, rank AS score, 'fts' AS via
                FROM handover_fts f JOIN handover h ON h.id = f.rowid
                WHERE handover_fts MATCH ? {extra_sql}
                ORDER BY rank LIMIT ?
            """
            for r in cur.execute(sql, [f'"{safe}"', *params_extra, limit]):
                rows[r['id']] = dict(r)
        except sqlite3.OperationalError:
            pass  # FTS 解析失敗 fallback to LIKE

    if not rows or chinese_run < 3:
        pat = '%' + query.replace('%', r'\%').replace('_', r'\_') + '%'
        sql = f"""
            SELECT h.id, h.topic, h.session_type, h.status, h.completed,
                   h.updated_at, 0.0 AS score, 'like' AS via
            FROM handover h
            WHERE (h.topic LIKE ? ESCAPE '\\' OR h.completed LIKE ? ESCAPE '\\' OR
                   h.decisions LIKE ? ESCAPE '\\' OR h.blocked LIKE ? ESCAPE '\\' OR
                   h.next_steps LIKE ? ESCAPE '\\' OR h.lessons_learned LIKE ? ESCAPE '\\' OR
                   h.conversation_summary LIKE ? ESCAPE '\\') {extra_sql}
            ORDER BY h.updated_at DESC LIMIT ?
        """
        for r in cur.execute(sql, [pat]*7 + params_extra + [limit]):
            if r['id'] not in rows:
                rows[r['id']] = dict(r)

    conn.close()
    return list(rows.values())


def project_name(db_path: Path) -> str:
    """從 .handover 路徑往上推專案名"""
    return db_path.parent.parent.name


def main():
    ap = argparse.ArgumentParser(description="跨專案 handover.db unified search")
    ap.add_argument("query", nargs='?', help="搜尋字串")
    ap.add_argument("--type", help="篩 session_type，逗號分隔（例：incident,decision）")
    ap.add_argument("--status", help="篩 status，逗號分隔（例：open,closed）")
    ap.add_argument("--recent-days", type=int, help="只看最近 N 天")
    ap.add_argument("--limit", type=int, default=10, help="每個 DB 最多回幾筆（預設 10）")
    ap.add_argument("--roots", help="覆蓋預設掃描根目錄（用 ; 分隔）")
    ap.add_argument("--list-dbs", action="store_true", help="只列出找到的 DB、不搜尋")
    ap.add_argument("--json", action="store_true", help="輸出 JSON")
    args = ap.parse_args()

    # 來源
    roots_str = args.roots or os.environ.get("HANDOVER_PROJECTS_ROOTS")
    roots = roots_str.split(";") if roots_str else DEFAULT_ROOTS
    dbs = discover_dbs(roots)

    if args.list_dbs:
        if args.json:
            print(json.dumps({"dbs": [str(d) for d in dbs], "count": len(dbs)}, ensure_ascii=False, indent=2))
        else:
            print(f"找到 {len(dbs)} 個 .handover/handover.db：")
            for d in dbs:
                # 順便顯示 row 數
                try:
                    conn = sqlite3.connect(f"file:{d}?mode=ro", uri=True, timeout=2)
                    n = conn.execute("SELECT COUNT(*) FROM handover").fetchone()[0]
                    conn.close()
                except Exception:
                    n = "?"
                print(f"  [{n:>4} rows] {project_name(d)}  →  {d}")
        return 0

    if not args.query:
        ap.print_help()
        return 1

    ftypes = [x.strip() for x in (args.type or "").split(",") if x.strip()]
    statuses = [x.strip() for x in (args.status or "").split(",") if x.strip()]

    by_project = defaultdict(list)
    for db in dbs:
        proj = project_name(db)
        results = search_one(db, args.query, ftypes, statuses, args.recent_days, args.limit)
        for r in results:
            r['_project'] = proj
            r['_db'] = str(db)
        by_project[proj].extend(results)

    total = sum(len(v) for v in by_project.values())

    if args.json:
        print(json.dumps({
            "query": args.query, "total": total,
            "by_project": {k: v for k, v in by_project.items()}
        }, ensure_ascii=False, indent=2, default=str))
        return 0

    # markdown 輸出
    if total == 0:
        print(f"❌ 找不到「{args.query}」")
        return 0

    print(f"🔍 「{args.query}」找到 {total} 筆，分布在 {len(by_project)} 個專案：\n")
    for proj, rows in sorted(by_project.items(), key=lambda x: -len(x[1])):
        if not rows:
            continue
        print(f"## [{proj}] {len(rows)} 筆")
        for r in rows[:args.limit]:
            via = r.get('via', '?')
            score = r.get('score') or 0
            score_str = f"score={score:.2f}" if isinstance(score, (int, float)) and score else "—"
            updated = (r.get('updated_at') or '')[:10]
            badge = "🟢" if r.get('status') == 'open' else "✅" if r.get('status') == 'closed' else "⚪"
            print(f"  {badge} #{r['id']:>3} [{r['session_type'] or '?':10}] {via} {updated} | {r['topic'][:80]}")
        print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
