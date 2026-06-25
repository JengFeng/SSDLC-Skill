#!/usr/bin/env bash
# handover_list.sh — 列出 handover
# 用法:
#   bash handover_list.sh --db <path>                  # 預設近 30 天 open
#   bash handover_list.sh --db <path> --all            # 全部含 archived
#   bash handover_list.sh --db <path> --days 365       # 近 N 天
# Windows-safe: 路徑透過 env var 傳入 Python heredoc
set -e

DB_PATH=""
ALL=0
DAYS=30

while [[ $# -gt 0 ]]; do
  case $1 in
    --db) DB_PATH="$2"; shift 2 ;;
    --all) ALL=1; shift ;;
    --days) DAYS="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

[ -z "$DB_PATH" ] && { echo "--db required"; exit 1; }
[ ! -f "$DB_PATH" ] && { echo "[]"; exit 0; }

HANDOVER_DB_PATH="$DB_PATH" HANDOVER_ALL="$ALL" HANDOVER_DAYS="$DAYS" python3 - <<'PYEOF'
import json, os, sqlite3

db = os.environ["HANDOVER_DB_PATH"]
all_flag = os.environ.get("HANDOVER_ALL", "0") == "1"
days = int(os.environ.get("HANDOVER_DAYS", "30"))

conn = sqlite3.connect(db)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

if all_flag:
    cur.execute("""SELECT id, topic, session_type, status, next_steps, updated_at
                   FROM handover ORDER BY updated_at DESC""")
else:
    cur.execute(f"""SELECT id, topic, session_type, status, next_steps, updated_at
                    FROM handover
                    WHERE status = 'open'
                      AND updated_at >= datetime('now', '-{days} days')
                    ORDER BY updated_at DESC""")

rows = [dict(r) for r in cur.fetchall()]
print(json.dumps(rows, ensure_ascii=False, indent=2))
conn.close()
PYEOF
