#!/usr/bin/env bash
# handover_write.sh — 寫入或更新交班單
# 用法:
#   bash handover_write.sh --db <path> --json <json_file> [--id <id>]
#   bash handover_write.sh --db <path> --json <json_file>              # 新增
#   bash handover_write.sh --db <path> --json <json_file> --id 12      # 更新
# Windows-safe: 路徑透過 env var 傳入 Python heredoc

set -e

DB_PATH=""
JSON_FILE=""
ID=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --db) DB_PATH="$2"; shift 2 ;;
    --json) JSON_FILE="$2"; shift 2 ;;
    --id) ID="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

[ -z "$DB_PATH" ] && { echo "--db required"; exit 1; }
[ -z "$JSON_FILE" ] && { echo "--json required"; exit 1; }
[ ! -f "$JSON_FILE" ] && { echo "JSON file not found: $JSON_FILE"; exit 1; }

# 初始化 DB(若不存在)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$SCRIPT_DIR/init_db.sh" "$DB_PATH" >/dev/null

HANDOVER_DB_PATH="$DB_PATH" HANDOVER_JSON_FILE="$JSON_FILE" HANDOVER_ID="$ID" python3 - <<'PYEOF'
import json, os, sqlite3, sys

json_file = os.environ["HANDOVER_JSON_FILE"]
with open(json_file, "r", encoding="utf-8") as f:
    data = json.load(f)

db = os.environ["HANDOVER_DB_PATH"]
conn = sqlite3.connect(db)
cur = conn.cursor()

allowed = {"topic","session_type","status","completed","decisions","blocked",
           "next_steps","lessons_learned","attempted_approaches",
           "conversation_summary","device","branch","working_dir",
           "test_status","subscription_account","extra_json",
           "priority","due_date","related_ids","last_reviewed_at"}
data = {k: v for k, v in data.items() if k in allowed and v is not None}

# conversation_summary 強制截 500 字
if "conversation_summary" in data and data["conversation_summary"]:
    data["conversation_summary"] = data["conversation_summary"][:500]

id_val = os.environ.get("HANDOVER_ID", "")
if id_val:
    # UPDATE
    sets = ", ".join([f"{k} = ?" for k in data.keys()])
    sets += ", updated_at = CURRENT_TIMESTAMP"
    vals = list(data.values()) + [int(id_val)]
    cur.execute(f"UPDATE handover SET {sets} WHERE id = ?", vals)
    print(f"Updated id={id_val}")
else:
    # INSERT(topic 必填)
    if "topic" not in data:
        print("ERROR: topic required for new handover", file=sys.stderr)
        sys.exit(1)
    cols = ", ".join(data.keys())
    placeholders = ", ".join(["?"] * len(data))
    cur.execute(f"INSERT INTO handover ({cols}) VALUES ({placeholders})", list(data.values()))
    print(f"Inserted id={cur.lastrowid}")

conn.commit()
conn.close()
PYEOF
