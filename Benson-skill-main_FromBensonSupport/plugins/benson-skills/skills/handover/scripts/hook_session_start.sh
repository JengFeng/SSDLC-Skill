#!/usr/bin/env bash
# hook_session_start.sh — Claude Code SessionStart hook
# 在新 session 開始時：
#   1. 找當前 working_dir 的 .handover/handover.db
#   2. 撈最近 open 的 handover row（無論 Mode A/B）
#   3. 輸出給 Claude（藉由 hook stdout 注入 conversation 開頭）
#
# 用法（settings.json 自動呼叫，不需手動）：
#   { "type": "command", "command": "bash C:/Users/benso/.claude/skills/handover-skill/scripts/hook_session_start.sh" }
#
# 退出碼 0 = 正常；non-0 = hook 失敗（不影響 Claude 啟動，僅記錄）
set -e

# 找 DB
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
DB="$PROJECT_DIR/.handover/handover.db"

# 沒 DB 時，判斷是不是「真的專案資料夾」決定要不要 auto-init
# 判斷依據：有 .git / CLAUDE.md / 常見 config 檔
if [ ! -f "$DB" ]; then
    is_project=0
    for marker in ".git" "CLAUDE.md" "package.json" "pyproject.toml" "Cargo.toml" "go.mod" "composer.json" ".claude"; do
        if [ -e "$PROJECT_DIR/$marker" ]; then
            is_project=1
            break
        fi
    done

    if [ "$is_project" = "1" ]; then
        # auto-init
        SCRIPT_DIR="$(dirname "$0")"
        bash "$SCRIPT_DIR/init_db.sh" "$DB" >/dev/null 2>&1 || exit 0
        echo "🆕 [handover] 偵測到專案資料夾、自動建好 .handover/handover.db"
    else
        # 不是專案資料夾、靜默退出
        exit 0
    fi
fi

# 確保 DB 真的有了
[ ! -f "$DB" ] && exit 0

HANDOVER_DB_PATH="$DB" python3 - <<'PYEOF' 2>/dev/null || exit 0
import os, sqlite3
from datetime import datetime, timedelta

db = os.environ["HANDOVER_DB_PATH"]
conn = sqlite3.connect(db)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# 撈最近 open + 最近 7 天 active 的 row
since = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d %H:%M:%S')
rows = list(cur.execute("""
    SELECT id, topic, session_type, status, completed, next_steps, blocked, updated_at
    FROM handover
    WHERE status = 'open' AND updated_at >= ?
    ORDER BY updated_at DESC
    LIMIT 5
""", (since,)))

if not rows:
    raise SystemExit(0)

# 輸出給 Claude
print("📂 [handover] 最近 open 的 row（過去 7 天）：")
print()
for r in rows:
    print(f"  [#{r['id']} {r['session_type']}] {r['topic']}")
    if r['next_steps']:
        ns = (r['next_steps'][:120] + '...') if len(r['next_steps']) > 120 else r['next_steps']
        print(f"     → {ns}")
    if r['blocked']:
        bl = (r['blocked'][:80] + '...') if len(r['blocked']) > 80 else r['blocked']
        print(f"     ⚠ {bl}")

# 統計 stale row（>90 天沒 review）
stale = cur.execute("""
    SELECT COUNT(*) FROM handover
    WHERE status='open' AND COALESCE(last_reviewed_at, updated_at) < datetime('now', '-90 days')
""").fetchone()[0]
if stale > 0:
    print(f"\n💤 提醒：有 {stale} 筆 open row 超過 90 天沒 review，可能要 archive 或更新。")

conn.close()
PYEOF
