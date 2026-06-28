CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    title TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL DEFAULT '',
    hire_date TEXT NOT NULL,
    last_login TEXT,
    login_attempts INTEGER DEFAULT 0,
    locked_until TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    updated_at TEXT DEFAULT (datetime('now','localtime'))
);
-- 安全欄位說明：
-- password_hash: bcrypt 雜湊儲存，禁止明文
-- last_login: 稽核用途，追蹤最後登入時間
-- login_attempts: 登入失敗次數追蹤
-- locked_until: 帳戶鎖定解除時間
-- active: 0=停用 (閒置180天), 1=啟用