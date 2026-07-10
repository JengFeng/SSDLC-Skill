# ER 圖 (Entity Relationship Diagram)

> 生成日期：2026-06-29 | Phase 02 系統設計
> 對應 DDL：`db_schema.sql`

---

## 完整 ER 圖

```mermaid
erDiagram
    departments ||--o{ employees : "belongs_to"
    departments ||--o| employees : "managed_by"
    departments ||--o{ departments : "parent_of"
    employees ||--o{ employee_history : "has_history"
    employees ||--o{ employee_education : "has_education"
    employees ||--o{ employee_experience : "has_experience"
    employees ||--o{ employee_certification : "has_certification"
    employees ||--o{ audit_log : "generates"

    departments {
        int id PK "部門編號"
        varchar name UK "部門名稱"
        int parent_id FK "上級部門"
        int manager_id FK "部門主管"
        timestamptz created_at "建立時間"
        timestamptz updated_at "更新時間"
    }

    employees {
        int id PK "員工編號"
        varchar employee_code UK "工號"
        varchar name_zh "中文姓名"
        varchar name_en "英文姓名"
        bytea id_number_enc "🔴 身分證字號(加密)"
        varchar id_number_hash "身分證雜湊(唯一)"
        bytea birth_date_enc "🔴 出生日期(加密)"
        char gender "性別(M,F,O)"
        varchar email_company UK "公司Email"
        varchar email_personal "個人Email"
        varchar phone_mobile "手機"
        varchar phone_extension "分機"
        bytea address_registered_enc "🔴 戶籍地址(加密)"
        bytea address_contact_enc "🔴 通訊地址(加密)"
        bytea emergency_contact_name_enc "🔴 緊急聯絡人(加密)"
        bytea emergency_contact_phone_enc "🔴 緊急聯絡電話(加密)"
        varchar emergency_contact_relation "緊急聯絡人關係"
        int department_id FK "部門ID"
        varchar title "職稱"
        date hire_date "到職日"
        varchar employment_type "聘僱類型"
        bytea salary_enc "🔴🔴 薪資(加密)"
        bytea bank_code_enc "🔴🔴 銀行代碼(加密)"
        bytea bank_account_enc "🔴🔴 銀行帳號(加密)"
        varchar status "狀態(在職,留停,離職)"
        date leave_date "離職日"
        bytea leave_reason_enc "🔴🔴 離職原因(加密)"
        bytea performance_rating_enc "🔴🔴 績效評核(加密)"
        varchar ad_username UK "AD帳號"
        varchar password_hash "密碼雜湊(bcrypt)"
        timestamptz last_login "最後登入"
        int login_attempts "登入失敗次數"
        timestamptz locked_until "鎖定至"
        varchar role "角色(employee,hr_specialist,hr_manager,admin)"
        bool active "啟用狀態"
        timestamptz created_at "建立時間"
        timestamptz updated_at "更新時間"
    }

    employee_history {
        bigint id PK "紀錄編號"
        int employee_id FK "員工編號"
        varchar change_type "異動類型"
        date change_date "異動日期"
        jsonb old_value "異動前內容"
        jsonb new_value "異動後內容"
        text reason "異動原因"
        int operator_id FK "操作人"
        timestamptz created_at "🔒 記錄時間(不可改)"
    }

    employee_education {
        int id PK "紀錄編號"
        int employee_id FK "員工編號"
        varchar school_name "學校名稱"
        varchar major "科系"
        varchar degree "學位"
        date start_date "就學起始"
        date end_date "就學結束"
        varchar attachment_path "附件路徑"
        timestamptz created_at "建立時間"
        timestamptz updated_at "更新時間"
    }

    employee_experience {
        int id PK "紀錄編號"
        int employee_id FK "員工編號"
        varchar company_name "公司名稱"
        varchar title "職稱"
        date start_date "在職起始"
        date end_date "在職結束"
        text description "工作描述"
        varchar attachment_path "附件路徑"
        timestamptz created_at "建立時間"
        timestamptz updated_at "更新時間"
    }

    employee_certification {
        int id PK "紀錄編號"
        int employee_id FK "員工編號"
        varchar cert_name "證照名稱"
        varchar issuing_org "發證單位"
        date issue_date "發證日期"
        date expiry_date "有效期限"
        varchar cert_number "證照編號"
        varchar attachment_path "附件路徑"
        timestamptz created_at "建立時間"
        timestamptz updated_at "更新時間"
    }

    audit_log {
        bigint id PK "紀錄編號"
        int actor_id FK "操作人ID"
        varchar actor_username "操作人帳號"
        inet actor_ip "操作人IP"
        varchar action "操作類型"
        varchar resource_type "資源類型"
        int resource_id "資源ID"
        jsonb old_value "異動前值"
        jsonb new_value "異動後值"
        text description "操作描述"
        timestamptz created_at "🔒 記錄時間(不可改)"
    }
```

---

## 機敏等級圖例

| 標記 | 等級 | 欄位 | 誰可讀 |
|:---|:---|:---|:---|
| 🔴🔴 | 極機敏 | 薪資、銀行帳號、離職原因、績效評核 | 僅 HR 主管 / admin |
| 🔴 | 機敏 | 身分證字號、出生日期、地址、手機、緊急聯絡人 | HR 專員 / HR 主管 / admin |
| （無標記） | 一般 | 姓名、Email、部門、職稱、到職日 | 全體員工（依 RBAC） |
| 🔒 | 不可竄改 | employee_history, audit_log | Append-Only，禁止 UPDATE/DELETE |

---

## 資料關聯摘要

| 父表 | 子表 | 關係 | 級聯 |
|:---|:---|:---|:---|
| departments | employees (department_id) | 1:N | 不級聯（部門不可隨意刪除） |
| employees | departments (manager_id) | 1:1 | SET NULL |
| departments | departments (parent_id) | 自參照 | 不級聯 |
| employees | employee_history | 1:N | CASCADE（員工刪除時歷史保留？→ CASCADE） |
| employees | employee_education | 1:N | CASCADE |
| employees | employee_experience | 1:N | CASCADE |
| employees | employee_certification | 1:N | CASCADE |
| employees | audit_log | 1:N | SET NULL（保留日誌） |
