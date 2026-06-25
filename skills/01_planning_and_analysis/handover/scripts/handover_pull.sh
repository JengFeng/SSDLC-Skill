#!/usr/bin/env bash
# handover_pull.sh — 拉最近 open 的 handover(或依 topic/id)
# 用法:
#   bash handover_pull.sh --db <path>                    # 最近 open
#   bash handover_pull.sh --db <path> --topic "XXX"      # 按 topic 搜
#   bash handover_pull.sh --db <path> --id 12            # 按 id
# Windows-safe: 路徑透過 env var 傳入 Python heredoc，避免反斜線觸發 unicodeescape
set -e

DB_PATH=""
TOPIC=""
ID=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --db) DB_PATH="$2"; shift 2 ;;
    --topic) TOPIC="$2"; shift 2 ;;
    --id) ID="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

[ -z "$DB_PATH" ] && { echo "--db required"; exit 1; }
[ ! -f "$DB_PATH" ] && { echo "{}"; exit 0; }

HANDOVER_DB_PATH="$DB_PATH" HANDOVER_TOPIC="$TOPIC" HANDOVER_ID="$ID" python3 - <<'PYEOF'
import json, os, sqlite3

db = os.environ["HANDOVER_DB_PATH"]
conn = sqlite3.connect(db)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

id_val = os.environ.get("HANDOVER_ID", "")
topic_val = os.environ.get("HANDOVER_TOPIC", "")

if id_val:
    cur.execute("SELECT * FROM handover WHERE id = ?", (int(id_val),))
elif topic_val:
    cur.execute("SELECT * FROM handover WHERE topic LIKE ? ORDER BY updated_at DESC LIMIT 1",
                (f"%{topic_val}%",))
else:
    cur.execute("SELECT * FROM handover WHERE status = 'open' ORDER BY updated_at DESC LIMIT 1")

row = cur.fetchone()
if row:
    print(json.dumps(dict(row), ensure_ascii=False, indent=2))
else:
    print("{}")

conn.close()
PYEOF
