#!/usr/bin/env bash
# handover_show.sh — 顯示指定 id 的完整 handover(所有欄位)
# 用法: bash handover_show.sh --db <path> --id <id>
#       不給 id 則顯示最近 open 的那筆
# Windows-safe: 路徑透過 env var 傳入 Python heredoc
set -e

DB_PATH=""
ID=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --db) DB_PATH="$2"; shift 2 ;;
    --id) ID="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

[ -z "$DB_PATH" ] && { echo "--db required"; exit 1; }
[ ! -f "$DB_PATH" ] && { echo "{}"; exit 0; }

HANDOVER_DB_PATH="$DB_PATH" HANDOVER_ID="$ID" python3 - <<'PYEOF'
import json, os, sqlite3

db = os.environ["HANDOVER_DB_PATH"]
conn = sqlite3.connect(db)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

id_val = os.environ.get("HANDOVER_ID", "")
if id_val:
    cur.execute("SELECT * FROM handover WHERE id = ?", (int(id_val),))
else:
    cur.execute("SELECT * FROM handover WHERE status='open' ORDER BY updated_at DESC LIMIT 1")

row = cur.fetchone()
print(json.dumps(dict(row) if row else {}, ensure_ascii=False, indent=2))
conn.close()
PYEOF
