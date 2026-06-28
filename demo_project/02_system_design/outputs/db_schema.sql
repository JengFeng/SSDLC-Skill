-- Employee Management System - Database Schema
-- Phase 02: System Design | 2026-06-28

CREATE TABLE IF NOT EXISTS employees (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    department      TEXT    NOT NULL,
    title           TEXT    NOT NULL,
    email           TEXT    NOT NULL UNIQUE,
    password_hash   TEXT    NOT NULL DEFAULT '',
    hire_date       TEXT    NOT NULL,
    last_login      TEXT,
    login_attempts  INTEGER DEFAULT 0,
    locked_until    TEXT,
    active          INTEGER DEFAULT 1,
    created_at      TEXT    DEFAULT (datetime('now','localtime')),
    updated_at      TEXT    DEFAULT (datetime('now','localtime'))
);

CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_active ON employees(active);

-- Default admin account (password: Admin@1234, SHA-256 hashed)
-- INSERT handled in app.py init_db()