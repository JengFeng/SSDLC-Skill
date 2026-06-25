#!/usr/bin/env bash
# hook_stop.sh — Claude Code Stop hook
# Session 結束時：
#   檢查最近 30 分鐘有沒有寫過 handover row
#   沒寫 → 輸出提醒（出現在下次 session 開頭、用戶會看到）
set -e

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
DB="$PROJECT_DIR/.handover/handover.db"

[ ! -f "$DB" ] && exit 0

HANDOVER_DB_PATH="$DB" python3 - <<'PYEOF' 2>/dev/null || exit 0
import os, sqlite3

db = os.environ["HANDOVER_DB_PATH"]
conn = sqlite3.connect(db)
cur = conn.cursor()

# 30 分鐘內有寫 row 嗎？
n = cur.execute("""
    SELECT COUNT(*) FROM handover
    WHERE created_at >= datetime('now', '-30 minutes')
       OR updated_at >= datetime('now', '-30 minutes')
""").fetchone()[0]

if n == 0:
    # 看當前 mode：auto 才提醒（learning 模式本來就靠對話）
    mode = cur.execute("SELECT value FROM config WHERE key='mode'").fetchone()
    if mode and mode[0] == 'auto':
        print("⚠️ [handover] 這次 session 沒有寫任何 handover row。下次開 session 時建議檢查是否漏記重要訊號。")

conn.close()
PYEOF
