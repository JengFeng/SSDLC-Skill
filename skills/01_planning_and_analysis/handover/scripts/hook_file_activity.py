"""hook_file_activity.py — PostToolUse Edit/Write hook
記錄 Claude Code session 中碰過的文件，提供 SA 文件流追蹤。

寫進 working_dir/.handover/handover.db 的 file_activity 表
資料夾不在 .handover/ 結構就靜默退出（不污染非專案目錄）

過濾規則（避免 noise）：
  - 跳過 .git/ 內檔案
  - 跳過 node_modules/、__pycache__/、.venv/
  - 跳過 .tmp_* 開頭（暫存檔）
  - 跳過暫存記憶體類副檔名（.pyc、.log）

只記副檔名屬於文件類：
  - 文件: .docx, .pptx, .xlsx, .pdf, .md, .txt, .rtf
  - 程式: .py, .php, .js, .ts, .html, .css, .sh, .ps1, .bat, .sql
  - 設定: .json, .yaml, .yml, .toml, .ini, .env

Hook 會收到 stdin JSON 格式的 tool_use 事件：
  {
    "tool_name": "Edit" | "Write",
    "tool_input": {"file_path": "...", "old_string": "...", "new_string": "..."},
    "tool_response": {...}
  }
"""
from __future__ import annotations

import json
import os
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

DOC_EXTS = {
    # documents
    '.docx', '.pptx', '.xlsx', '.pdf', '.md', '.txt', '.rtf',
    # code
    '.py', '.php', '.js', '.ts', '.tsx', '.jsx', '.html', '.css', '.scss',
    '.sh', '.ps1', '.bat', '.sql', '.go', '.rs', '.java', '.c', '.cpp', '.h',
    # config
    '.json', '.yaml', '.yml', '.toml', '.ini', '.env', '.conf',
}

SKIP_DIRS = {'.git', 'node_modules', '__pycache__', '.venv', 'venv', '.next', 'dist', 'build'}
SKIP_PREFIXES = ('.tmp_', '~$')


def find_db() -> Path | None:
    """從當前 cwd 往上找 .handover/handover.db；找不到回 None"""
    cur = Path.cwd().resolve()
    for d in [cur, *cur.parents]:
        cand = d / ".handover" / "handover.db"
        if cand.exists():
            return cand
    return None


def should_track(file_path: str) -> bool:
    p = Path(file_path)
    name = p.name
    if name.startswith(SKIP_PREFIXES):
        return False
    if p.suffix.lower() not in DOC_EXTS:
        return False
    parts = set(p.parts)
    if parts & SKIP_DIRS:
        return False
    return True


def ensure_table(conn: sqlite3.Connection):
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS file_activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            tool TEXT,                    -- Edit / Write
            file_path TEXT,
            file_name TEXT,
            extension TEXT,
            old_len INTEGER,
            new_len INTEGER,
            delta INTEGER,                -- new_len - old_len
            session_id TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_fa_ts ON file_activity(ts DESC);
        CREATE INDEX IF NOT EXISTS idx_fa_path ON file_activity(file_path);
        CREATE INDEX IF NOT EXISTS idx_fa_name ON file_activity(file_name);
    """)
    conn.commit()


def main():
    # 讀 stdin JSON（hook 約定）
    try:
        payload = json.loads(sys.stdin.read())
    except Exception:
        return 0  # 沒 payload 就靜默結束

    tool = payload.get('tool_name', '')
    if tool not in ('Edit', 'Write'):
        return 0

    inp = payload.get('tool_input') or {}
    file_path = inp.get('file_path', '')
    if not file_path:
        return 0
    if not should_track(file_path):
        return 0

    db = find_db()
    if not db:
        return 0  # 沒專案 DB 就靜默退出

    try:
        conn = sqlite3.connect(db, timeout=2)
        ensure_table(conn)

        old_len = len(inp.get('old_string', '') or '')
        new_len = len(inp.get('new_string', '') or inp.get('content', '') or '')
        delta = new_len - old_len

        p = Path(file_path)
        conn.execute("""
            INSERT INTO file_activity (tool, file_path, file_name, extension, old_len, new_len, delta, session_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            tool, file_path, p.name, p.suffix.lower(),
            old_len, new_len, delta,
            os.environ.get('CLAUDE_SESSION_ID', '')
        ))
        conn.commit()
        conn.close()
    except Exception:
        pass  # 任何錯誤都靜默吞掉（不能影響主對話流程）

    return 0


if __name__ == "__main__":
    sys.exit(main())
