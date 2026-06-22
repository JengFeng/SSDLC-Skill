#!/usr/bin/env bash
# handover_mode.sh — 讀 / 設定當前模式
# 用法:
#   bash handover_mode.sh --db <path>                            # 查看
#   bash handover_mode.sh --db <path> --set learning|auto|silent # 設定
# Windows-safe: 路徑透過 env var 傳入 Python heredoc
set -e

DB_PATH=""
SET_MODE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --db) DB_PATH="$2"; shift 2 ;;
    --set) SET_MODE="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

[ -z "$DB_PATH" ] && { echo "--db required"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$SCRIPT_DIR/init_db.sh" "$DB_PATH" >/dev/null

if [ -n "$SET_MODE" ]; then
  case "$SET_MODE" in
    learning|auto|silent) ;;
    *) echo "Invalid mode: $SET_MODE (must be learning|auto|silent)"; exit 1 ;;
  esac
fi

HANDOVER_DB_PATH="$DB_PATH" HANDOVER_SET_MODE="$SET_MODE" python3 - <<'PYEOF'
import os, sqlite3
db = os.environ["HANDOVER_DB_PATH"]
set_mode = os.environ.get("HANDOVER_SET_MODE", "")
conn = sqlite3.connect(db); cur = conn.cursor()
if set_mode:
    cur.execute("INSERT OR REPLACE INTO handover_config (key, value, updated_at) VALUES ('mode', ?, CURRENT_TIMESTAMP)", (set_mode,))
    conn.commit()
    print(f"mode={set_mode}")
else:
    cur.execute("SELECT value FROM handover_config WHERE key='mode'")
    row = cur.fetchone()
    print(f"mode={row[0] if row else 'learning'}")
conn.close()
PYEOF
