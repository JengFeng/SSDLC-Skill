#!/usr/bin/env bash
# handover_close.sh — 關閉(open → closed)或 archive(→ archived)
# 用法:
#   bash handover_close.sh --db <path> --id <id>               # close
#   bash handover_close.sh --db <path> --id <id> --archive     # archive
# Windows-safe: 路徑透過 env var 傳入 Python heredoc
set -e

DB_PATH=""
ID=""
ARCHIVE=0

while [[ $# -gt 0 ]]; do
  case $1 in
    --db) DB_PATH="$2"; shift 2 ;;
    --id) ID="$2"; shift 2 ;;
    --archive) ARCHIVE=1; shift ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

[ -z "$DB_PATH" ] && { echo "--db required"; exit 1; }
[ -z "$ID" ] && { echo "--id required"; exit 1; }

NEW_STATUS="closed"
[ $ARCHIVE -eq 1 ] && NEW_STATUS="archived"

HANDOVER_DB_PATH="$DB_PATH" HANDOVER_ID="$ID" HANDOVER_STATUS="$NEW_STATUS" python3 - <<'PYEOF'
import os, sqlite3
db = os.environ["HANDOVER_DB_PATH"]
idv = int(os.environ["HANDOVER_ID"])
status = os.environ["HANDOVER_STATUS"]
conn = sqlite3.connect(db)
cur = conn.cursor()
cur.execute("UPDATE handover SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?", (status, idv))
conn.commit()
print(f"id={idv} status={status}")
conn.close()
PYEOF
