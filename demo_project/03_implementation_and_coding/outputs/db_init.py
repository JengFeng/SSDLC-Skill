"""
db_init.py — SQLite 資料庫初始化腳本
建立所有資料表與初始資料
用法：python db_init.py
"""
import sqlite3
import os
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.getenv("DB_PATH", os.path.join(os.path.dirname(os.path.abspath(__file__)), "hr_system.db"))

SCHEMA_SQL = """
-- ============================================================================
-- 員工基本資料管理系統 — 資料庫 DDL (SQLite)
-- ============================================================================

CREATE TABLE IF NOT EXISTS departments (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL UNIQUE,
    parent_id       INTEGER REFERENCES departments(id),
    manager_id      INTEGER,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS employees (
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_code               TEXT NOT NULL UNIQUE,
    name_zh                     TEXT NOT NULL,
    name_en                     TEXT,
    id_number_enc               BLOB,
    id_number_hash              TEXT,
    birth_date_enc              BLOB,
    gender                      TEXT CHECK (gender IN ('M','F','O')),
    email_company               TEXT NOT NULL UNIQUE,
    email_personal              TEXT,
    phone_mobile                TEXT,
    phone_extension             TEXT,
    address_registered_enc      BLOB,
    address_contact_enc         BLOB,
    emergency_contact_name_enc  BLOB,
    emergency_contact_phone_enc BLOB,
    emergency_contact_relation  TEXT,
    department_id               INTEGER NOT NULL REFERENCES departments(id),
    title                       TEXT NOT NULL,
    hire_date                   TEXT NOT NULL,
    employment_type             TEXT DEFAULT '全職'
                                CHECK (employment_type IN ('全職','兼職','約聘','實習')),
    salary_enc                  BLOB,
    bank_code_enc               BLOB,
    bank_account_enc            BLOB,
    status                      TEXT NOT NULL DEFAULT '在職'
                                CHECK (status IN ('在職','留停','離職')),
    leave_date                  TEXT,
    leave_reason_enc            BLOB,
    performance_rating_enc      BLOB,
    ad_username                 TEXT UNIQUE,
    password_hash               TEXT,
    last_login                  TEXT,
    login_attempts              INTEGER NOT NULL DEFAULT 0,
    locked_until                TEXT,
    role                        TEXT NOT NULL DEFAULT 'employee'
                                CHECK (role IN ('employee','hr_specialist','hr_manager','admin')),
    active                      INTEGER NOT NULL DEFAULT 1,
    created_at                  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at                  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_hire_date ON employees(hire_date);
CREATE INDEX IF NOT EXISTS idx_employees_ad_username ON employees(ad_username);
CREATE INDEX IF NOT EXISTS idx_employees_email_company ON employees(email_company);

CREATE TABLE IF NOT EXISTS employee_history (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id     INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    change_type     TEXT NOT NULL
                    CHECK (change_type IN ('報到','調職','升遷','調薪','離職','復職','資料異動')),
    change_date     TEXT NOT NULL,
    old_value       TEXT,
    new_value       TEXT,
    reason          TEXT,
    operator_id     INTEGER REFERENCES employees(id),
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_history_employee ON employee_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_history_date ON employee_history(change_date);
CREATE INDEX IF NOT EXISTS idx_history_type ON employee_history(change_type);

CREATE TABLE IF NOT EXISTS employee_education (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id     INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    school_name     TEXT NOT NULL,
    major           TEXT,
    degree          TEXT CHECK (degree IN ('高中','學士','碩士','博士','其他')),
    start_date      TEXT,
    end_date        TEXT,
    attachment_path TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_education_employee ON employee_education(employee_id);

CREATE TABLE IF NOT EXISTS employee_experience (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id     INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    company_name    TEXT NOT NULL,
    title           TEXT,
    start_date      TEXT,
    end_date        TEXT,
    description     TEXT,
    attachment_path TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_experience_employee ON employee_experience(employee_id);

CREATE TABLE IF NOT EXISTS employee_certification (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id     INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    cert_name       TEXT NOT NULL,
    issuing_org     TEXT,
    issue_date      TEXT,
    expiry_date     TEXT,
    cert_number     TEXT,
    attachment_path TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cert_employee ON employee_certification(employee_id);
CREATE INDEX IF NOT EXISTS idx_cert_expiry ON employee_certification(expiry_date);

CREATE TABLE IF NOT EXISTS audit_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id        INTEGER REFERENCES employees(id),
    actor_username  TEXT NOT NULL,
    actor_ip        TEXT NOT NULL,
    action          TEXT NOT NULL
                    CHECK (action IN ('CREATE','READ','UPDATE','DELETE','LOGIN','LOGOUT','EXPORT','VIEW_SENSITIVE')),
    resource_type   TEXT NOT NULL,
    resource_id     INTEGER,
    old_value       TEXT,
    new_value       TEXT,
    description     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_log(resource_type, resource_id);

INSERT OR IGNORE INTO departments (id, name) VALUES
    (1, '總經理室'),
    (2, '人力資源部'),
    (3, '資訊技術部'),
    (4, '財務會計部'),
    (5, '業務行銷部'),
    (6, '研發設計部');
"""


def init_db():
    """初始化 SQLite 資料庫：建立所有資料表與索引"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")

    # 使用 executescript 一次性執行所有 DDL（避免分割語句問題）
    try:
        conn.executescript(SCHEMA_SQL)
    except Exception as e:
        print(f"⚠️ 初始化警告: {e}")

    conn.commit()
    conn.close()
    print(f"✅ SQLite 資料庫初始化完成：{DB_PATH}")


if __name__ == "__main__":
    init_db()
