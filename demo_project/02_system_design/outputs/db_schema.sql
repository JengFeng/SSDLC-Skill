CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
    department TEXT NOT NULL, title TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE, hire_date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    updated_at TEXT DEFAULT (datetime('now','localtime')));
