-- ============================================================================
-- 員工基本資料管理系統 — 資料庫 DDL (PostgreSQL 16)
-- 生成日期：2026-07-10 | Phase 02 系統設計（重新生成）
-- 來源：SSOT specs/executable_spec.yaml + formal_requirements.md
-- 編碼：UTF-8
-- ============================================================================

-- 擴充功能啟用
CREATE EXTENSION IF NOT EXISTS pgcrypto;        -- 欄位級加密
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID 生成

-- ============================================================================
-- 1. departments（部門主檔）
-- ============================================================================
CREATE TABLE departments (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    parent_id       INTEGER REFERENCES departments(id),
    manager_id      INTEGER,  -- FK to employees.id (added after employees)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE departments IS '部門主檔：支援多層級組織樹（parent_id 自參照）';
COMMENT ON COLUMN departments.name IS '部門名稱（全系統唯一）';
COMMENT ON COLUMN departments.parent_id IS '上級部門 ID（NULL=頂層部門）';
COMMENT ON COLUMN departments.manager_id IS '部門主管（FK→employees.id）';

-- ============================================================================
-- 2. employees（員工主檔）
-- ============================================================================
CREATE TABLE employees (
    id                          SERIAL PRIMARY KEY,
    employee_code               VARCHAR(20)  NOT NULL UNIQUE,
    name_zh                     VARCHAR(50)  NOT NULL,
    name_en                     VARCHAR(100),
    -- 🔴 機敏欄位（AES-256 加密儲存）
    id_number_enc               BYTEA,           -- 身分證字號（加密）
    id_number_hash              VARCHAR(64),     -- SHA-256(身分證字號) 供唯一性比對
    birth_date_enc              BYTEA,           -- 出生日期（加密）
    gender                      CHAR(1) CHECK (gender IN ('M','F','O')),
    email_company               VARCHAR(100) NOT NULL UNIQUE,
    email_personal              VARCHAR(100),
    phone_mobile                VARCHAR(20),
    phone_extension             VARCHAR(10),
    -- 🔴 機敏：地址（加密）
    address_registered_enc      BYTEA,
    address_contact_enc         BYTEA,
    -- 🔴 機敏：緊急聯絡人（加密）
    emergency_contact_name_enc  BYTEA,
    emergency_contact_phone_enc BYTEA,
    emergency_contact_relation  VARCHAR(20),
    -- 組織資訊
    department_id               INTEGER NOT NULL REFERENCES departments(id),
    title                       VARCHAR(50)  NOT NULL,
    hire_date                   DATE NOT NULL,
    employment_type             VARCHAR(20) DEFAULT '全職'
                                CHECK (employment_type IN ('全職','兼職','約聘','實習')),
    -- 🔴 極機敏：薪資與銀行（加密）
    salary_enc                  BYTEA,
    bank_code_enc               BYTEA,
    bank_account_enc            BYTEA,
    -- 狀態與離職
    status                      VARCHAR(20) NOT NULL DEFAULT '在職'
                                CHECK (status IN ('在職','留停','離職')),
    leave_date                  DATE,
    -- 🔴 極機敏：離職原因與評核（加密）
    leave_reason_enc            BYTEA,
    performance_rating_enc      BYTEA,
    -- 系統整合
    ad_username                 VARCHAR(100) UNIQUE,  -- AD SSO 對應
    -- 本機備援認證
    password_hash               VARCHAR(255),         -- bcrypt hash
    last_login                  TIMESTAMPTZ,
    login_attempts              INTEGER NOT NULL DEFAULT 0,
    locked_until                TIMESTAMPTZ,
    -- RBAC
    role                        VARCHAR(20) NOT NULL DEFAULT 'employee'
                                CHECK (role IN ('employee','hr_specialist','hr_manager','admin')),
    active                      BOOLEAN NOT NULL DEFAULT TRUE,
    -- 時間戳
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE employees IS '員工主檔：含加密機敏欄位、AD SSO 整合、RBAC 角色';
COMMENT ON COLUMN employees.id_number_enc IS '🔴 AES-256 加密：身分證字號';
COMMENT ON COLUMN employees.id_number_hash IS 'SHA-256(身分證字號)：供唯一性檢查（不可逆）';
COMMENT ON COLUMN employees.salary_enc IS '🔴 AES-256 加密：薪資（極機敏，僅 HR 主管可讀）';
COMMENT ON COLUMN employees.bank_account_enc IS '🔴 AES-256 加密：銀行帳號';
COMMENT ON COLUMN employees.ad_username IS 'Windows AD sAMAccountName（SSO 對應鍵）';

-- 索引
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_hire_date ON employees(hire_date);
CREATE INDEX idx_employees_ad_username ON employees(ad_username);
CREATE INDEX idx_employees_email_company ON employees(email_company);

-- ============================================================================
-- 3. employee_history（異動歷程 — Append-Only，不可修改/刪除）
-- ============================================================================
CREATE TABLE employee_history (
    id              SERIAL PRIMARY KEY,
    employee_id     INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    change_type     VARCHAR(30) NOT NULL
                    CHECK (change_type IN ('調職','升遷','調薪','離職','復職','資料異動')),
    change_date     DATE NOT NULL,
    old_value       JSONB,
    new_value       JSONB,
    reason          TEXT,
    operator_id     INTEGER REFERENCES employees(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- ⚠️ 無 updated_at：歷史記錄不可修改
);

COMMENT ON TABLE employee_history IS '🔒 Append-Only 異動歷程：不可修改、不可刪除（僅 INSERT）';
COMMENT ON COLUMN employee_history.old_value IS '異動前資料 (JSONB)';
COMMENT ON COLUMN employee_history.new_value IS '異動後資料 (JSONB)';
COMMENT ON COLUMN employee_history.operator_id IS '操作人（FK→employees.id）';

CREATE INDEX idx_history_employee ON employee_history(employee_id);
CREATE INDEX idx_history_date ON employee_history(change_date);
CREATE INDEX idx_history_type ON employee_history(change_type);

-- ⚠️ 防竄改 Trigger：禁止 UPDATE / DELETE
CREATE OR REPLACE FUNCTION prevent_history_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'employee_history 為 Append-Only 表，禁止修改或刪除記錄';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_history_readonly
    BEFORE UPDATE OR DELETE ON employee_history
    FOR EACH ROW EXECUTE FUNCTION prevent_history_modification();

-- ============================================================================
-- 4. employee_education（學歷）
-- ============================================================================
CREATE TABLE employee_education (
    id              SERIAL PRIMARY KEY,
    employee_id     INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    school_name     VARCHAR(200) NOT NULL,
    major           VARCHAR(200),
    degree          VARCHAR(30) CHECK (degree IN ('高中','學士','碩士','博士','其他')),
    start_date      DATE,
    end_date        DATE,
    attachment_path VARCHAR(500),  -- 附件檔案路徑（NAS/檔案伺服器）
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE employee_education IS '員工學歷紀錄：支援多筆';
CREATE INDEX idx_education_employee ON employee_education(employee_id);

-- ============================================================================
-- 5. employee_experience（工作經歷）
-- ============================================================================
CREATE TABLE employee_experience (
    id              SERIAL PRIMARY KEY,
    employee_id     INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    company_name    VARCHAR(200) NOT NULL,
    title           VARCHAR(100),
    start_date      DATE,
    end_date        DATE,
    description     TEXT,
    attachment_path VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE employee_experience IS '員工工作經歷：支援多筆';
CREATE INDEX idx_experience_employee ON employee_experience(employee_id);

-- ============================================================================
-- 6. employee_certification（證照）
-- ============================================================================
CREATE TABLE employee_certification (
    id              SERIAL PRIMARY KEY,
    employee_id     INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    cert_name       VARCHAR(200) NOT NULL,
    issuing_org     VARCHAR(200),
    issue_date      DATE,
    expiry_date     DATE,
    cert_number     VARCHAR(100),
    attachment_path VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE employee_certification IS '員工專業證照：支援多筆';
CREATE INDEX idx_cert_employee ON employee_certification(employee_id);
CREATE INDEX idx_cert_expiry ON employee_certification(expiry_date);

-- ============================================================================
-- 7. audit_log（稽核日誌 — Append-Only）
-- ============================================================================
CREATE TABLE audit_log (
    id              BIGSERIAL PRIMARY KEY,
    actor_id        INTEGER REFERENCES employees(id),
    actor_username  VARCHAR(100) NOT NULL,
    actor_ip        INET NOT NULL,
    action          VARCHAR(20) NOT NULL
                    CHECK (action IN ('CREATE','READ','UPDATE','DELETE','LOGIN','LOGOUT','EXPORT','VIEW_SENSITIVE')),
    resource_type   VARCHAR(50) NOT NULL,
    resource_id     INTEGER,
    old_value       JSONB,
    new_value       JSONB,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- ⚠️ 無 updated_at：稽核日誌不可修改
);

COMMENT ON TABLE audit_log IS '🔒 稽核軌跡：記錄所有 CRUD + 檢視行為，Append-Only';

CREATE INDEX idx_audit_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_created ON audit_log(created_at);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);

-- 防竄改 Trigger
CREATE TRIGGER trg_audit_readonly
    BEFORE UPDATE OR DELETE ON audit_log
    FOR EACH ROW EXECUTE FUNCTION prevent_history_modification();

-- ============================================================================
-- Foreign Key 補完（circular reference）
-- ============================================================================
ALTER TABLE departments
    ADD CONSTRAINT fk_department_manager
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

-- ============================================================================
-- 自動更新 updated_at Trigger
-- ============================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_employees_updated_at
    BEFORE UPDATE ON employees FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_departments_updated_at
    BEFORE UPDATE ON departments FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_education_updated_at
    BEFORE UPDATE ON employee_education FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_experience_updated_at
    BEFORE UPDATE ON employee_experience FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_certification_updated_at
    BEFORE UPDATE ON employee_certification FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- 預設資料：初始部門
-- ============================================================================
INSERT INTO departments (name) VALUES
    ('總經理室'),
    ('人力資源部'),
    ('資訊技術部'),
    ('財務會計部'),
    ('業務行銷部'),
    ('研發設計部')
ON CONFLICT (name) DO NOTHING;
