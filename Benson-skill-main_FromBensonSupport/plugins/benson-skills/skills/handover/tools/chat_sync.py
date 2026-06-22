"""chat_sync.py — 通用聊天訊息同步（不限 LINE）

設計：
- 讀 handover.db 的 chat_api config
- 沒設定 / disabled → 直接 exit（其他專案不受影響）
- enabled → 按 API contract 拉訊息、寫進 chat_msg_cache 表
- API contract 任何符合 shape 的都能接（LINE / Slack 自製 wrapper / Discord 自製 wrapper / etc.）

API contract（必須回傳這個 shape）：
  GET {messages_url}?advanced_query=1&date_from=&date_to=&limit=
  →
  {
    "data": [
      {
        "message_id": "...",       (required)
        "source_id":  "...",       (required，群組唯一 key)
        "source_name": "...",      (顯示用)
        "user_id":    "...",
        "display_name": "...",
        "content":    "...",       (純文字訊息或檔名)
        "filetype":   "text|image|video|audio|file",
        "file_path":  "..." or null,
        "created_at": "YYYY-MM-DD HH:MM:SS"
      },
      ...
    ]
  }

Config schema（存在 handover_config 表的 chat_api key、JSON value）：
{
  "enabled": true,
  "messages_url": "https://your-server.example.com/EIP/LINE/api/line_messages_api.php",
  "source_label": "LINE",        // 顯示用：「LINE」「Slack」隨便
  "sync_interval_min": 30,
  "filter_groups": null,         // null=全部、或 ["桃園水情","桃園水務局"]
  "lookback_days": 7             // 第一次跑往回追幾天
}

排程建議：Windows Task Scheduler / cron 每 N 分鐘跑
"""
from __future__ import annotations

import json
import os
import sqlite3
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path

TIMEOUT = 60
PAGE_SIZE = 5000
DEFAULT_LOOKBACK_DAYS = 7
DEFAULT_SOURCE_LABEL = "chat"


def find_db() -> Path | None:
    """從 CWD 往上找 .handover/handover.db"""
    cur = Path.cwd().resolve()
    for d in [cur, *cur.parents]:
        cand = d / ".handover" / "handover.db"
        if cand.exists():
            return cand
    return None


def log(msg: str, log_file: Path | None = None):
    line = f"[{datetime.now():%Y-%m-%d %H:%M:%S}] {msg}"
    print(line, flush=True)
    if log_file:
        try:
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(line + "\n")
        except Exception:
            pass


def get_chat_config(conn: sqlite3.Connection) -> dict | None:
    """讀 handover_config.chat_api、回傳 dict；沒有/disabled 回 None"""
    try:
        row = conn.execute(
            "SELECT value FROM handover_config WHERE key='chat_api'"
        ).fetchone()
    except sqlite3.OperationalError:
        return None
    if not row or not row[0]:
        return None
    try:
        cfg = json.loads(row[0])
    except json.JSONDecodeError:
        return None
    if not cfg.get("enabled"):
        return None
    if not cfg.get("messages_url"):
        return None
    return cfg


def ensure_cache_table(conn: sqlite3.Connection):
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS chat_msg_cache (
            message_id   TEXT PRIMARY KEY,
            user_id      TEXT,
            display_name TEXT,
            source_type  TEXT,
            source_id    TEXT,
            source_name  TEXT,
            content      TEXT,
            filetype     TEXT,
            file_path    TEXT,
            created_at   TEXT,
            cached_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            extracted_to_handover INTEGER DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_chat_msg_created ON chat_msg_cache(created_at);
        CREATE INDEX IF NOT EXISTS idx_chat_msg_source ON chat_msg_cache(source_id);
        CREATE INDEX IF NOT EXISTS idx_chat_msg_extracted ON chat_msg_cache(extracted_to_handover);
    """)
    conn.commit()


def get_checkpoint(conn: sqlite3.Connection, lookback_days: int) -> str:
    """讀 sync_state.chat_sync.last_ts；沒有 → fallback N 天前"""
    row = conn.execute(
        "SELECT value FROM sync_state WHERE key='chat_sync.last_ts'"
    ).fetchone()
    if row and row[0]:
        return row[0]
    fallback = (datetime.now() - timedelta(days=lookback_days)).strftime("%Y-%m-%d %H:%M:%S")
    return fallback


def update_checkpoint(conn: sqlite3.Connection, ts: str):
    conn.execute("""
        INSERT INTO sync_state(key, value, updated_at)
        VALUES('chat_sync.last_ts', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at
    """, (ts,))
    conn.commit()


def fetch_messages(messages_url: str, date_from: str, date_to: str, log_file=None) -> list[dict]:
    """按 API contract 撈訊息"""
    params = {
        "advanced_query": "1",
        "date_from": date_from[:10],
        "date_to":   date_to[:10],
        "order_by": "created_at",
        "order_direction": "ASC",
        "limit": str(PAGE_SIZE),
    }
    sep = "&" if "?" in messages_url else "?"
    url = f"{messages_url}{sep}{urllib.parse.urlencode(params)}"
    log(f"GET {url}", log_file)
    try:
        with urllib.request.urlopen(url, timeout=TIMEOUT) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        log(f"  API error: {e}", log_file)
        return []
    if isinstance(data, dict):
        msgs = data.get("data", [])
    else:
        msgs = data
    log(f"  → {len(msgs)} messages", log_file)
    return msgs


def upsert_messages(conn: sqlite3.Connection, msgs: list[dict],
                    filter_groups: list[str] | None) -> tuple[int, int, int]:
    new = dup = filtered = 0
    cur = conn.cursor()
    for m in msgs:
        mid = m.get("message_id")
        if not mid:
            continue
        sname = m.get("source_name") or ""
        if filter_groups and sname not in filter_groups:
            filtered += 1
            continue
        try:
            cur.execute("""
                INSERT INTO chat_msg_cache
                    (message_id, user_id, display_name, source_type, source_id,
                     source_name, content, filetype, file_path, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                mid,
                m.get("user_id"),
                m.get("display_name"),
                m.get("source_type"),
                m.get("source_id"),
                sname,
                m.get("content"),
                m.get("filetype"),
                m.get("file_path"),
                m.get("created_at"),
            ))
            new += 1
        except sqlite3.IntegrityError:
            dup += 1
    conn.commit()
    return new, dup, filtered


def main():
    db_path = find_db()
    if not db_path:
        log("找不到 .handover/handover.db，退出")
        return 0

    log_file = db_path.parent / "chat_sync.log"

    conn = sqlite3.connect(db_path)
    cfg = get_chat_config(conn)
    if not cfg:
        log("chat_api 未設定 / disabled、跳過", log_file)
        conn.close()
        return 0

    label = cfg.get("source_label") or DEFAULT_SOURCE_LABEL
    log(f"DB: {db_path}", log_file)
    log(f"chat_api enabled (label={label}, url={cfg['messages_url']})", log_file)

    ensure_cache_table(conn)
    lookback = int(cfg.get("lookback_days") or DEFAULT_LOOKBACK_DAYS)
    last = get_checkpoint(conn, lookback)
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log(f"window: {last} → {now}", log_file)

    msgs = fetch_messages(cfg["messages_url"], last, now, log_file)
    if not msgs:
        log("no new messages", log_file)
        update_checkpoint(conn, now)
        conn.close()
        return 0

    msgs = [m for m in msgs if (m.get("created_at") or "") >= last]
    new, dup, filtered = upsert_messages(conn, msgs, cfg.get("filter_groups"))
    log(f"upsert: new={new} dup={dup} filtered={filtered}", log_file)

    update_checkpoint(conn, now)

    total = conn.execute("SELECT COUNT(*) FROM chat_msg_cache").fetchone()[0]
    pending = conn.execute(
        "SELECT COUNT(*) FROM chat_msg_cache WHERE extracted_to_handover=0"
    ).fetchone()[0]
    log(f"cache total={total} | pending extraction={pending}", log_file)

    conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
