#!/usr/bin/env bash
# init_db.sh — 初始化 handover SQLite DB (Windows-safe: path via env var)
# 用法: bash init_db.sh <db_path>
set -e

DB_PATH="$1"
[ -z "$DB_PATH" ] && { echo "usage: init_db.sh <db_path>"; exit 1; }

mkdir -p "$(dirname "$DB_PATH")"

HANDOVER_DB_PATH="$DB_PATH" python3 - <<'PYEOF'
import sqlite3, os
db = os.environ["HANDOVER_DB_PATH"]
conn = sqlite3.connect(db)
cur = conn.cursor()

# 主表：handover(Layer 1 + Layer 2 + v2 選配欄位)
cur.execute("""
CREATE TABLE IF NOT EXISTS handover (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,
    session_type TEXT,
    status TEXT DEFAULT 'open',
    completed TEXT,
    decisions TEXT,
    blocked TEXT,
    next_steps TEXT,
    lessons_learned TEXT,
    attempted_approaches TEXT,
    conversation_summary TEXT,
    device TEXT,
    branch TEXT,
    working_dir TEXT,
    test_status TEXT,
    subscription_account TEXT,
    extra_json TEXT,
    priority TEXT,
    due_date TEXT,
    related_ids TEXT,
    last_reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# 向後相容：如果既有 DB 還沒加 v2 欄位，補上(要在 CREATE INDEX 之前)
def ensure_column(table, col, coltype):
    cur.execute(f"PRAGMA table_info({table})")
    cols = [r[1] for r in cur.fetchall()]
    if col not in cols:
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {col} {coltype}")

for col, coltype in [
    ("priority", "TEXT"),
    ("due_date", "TEXT"),
    ("related_ids", "TEXT"),
    ("last_reviewed_at", "TIMESTAMP"),
]:
    ensure_column("handover", col, coltype)

# Indexes(在確保欄位存在後才建)
cur.execute("CREATE INDEX IF NOT EXISTS idx_status ON handover(status)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_updated ON handover(updated_at DESC)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_topic ON handover(topic)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_priority ON handover(priority)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_due_date ON handover(due_date)")

# Config 表：存 mode 等設定
cur.execute("""
CREATE TABLE IF NOT EXISTS handover_config (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
cur.execute("INSERT OR IGNORE INTO handover_config (key, value) VALUES ('mode', 'learning')")

# Sync state 表：Mode B 增量同步檢查點
cur.execute("""
CREATE TABLE IF NOT EXISTS sync_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# 向後相容：舊版 config 表資料搬到 handover_config
cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='config'")
if cur.fetchone():
    try:
        cur.execute("INSERT OR IGNORE INTO handover_config (key, value) SELECT key, value FROM config")
    except Exception:
        pass

conn.commit()
conn.close()
print(f"DB initialized: {db}")
PYEOF
