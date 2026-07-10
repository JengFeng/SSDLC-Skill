# 時序圖 (Sequence Diagram)

> 生成日期：2026-06-29 | Phase 02 系統設計
> 工具：Mermaid + PlantUML

---

## 一、AD SSO 單一登入流程

### Mermaid

```mermaid
sequenceDiagram
    actor User as 使用者
    participant Browser as 瀏覽器
    participant App as Flask 應用
    participant AD as Windows AD<br/>(LDAPS)
    participant DB as PostgreSQL
    participant Audit as 稽核日誌

    User->>Browser: 進入系統首頁
    Browser->>App: GET /
    App-->>Browser: 302 導向 /auth/login
    Browser->>App: GET /auth/login
    App-->>Browser: 顯示登入頁面<br/>(AD SSO 按鈕 + 本機備援)

    User->>Browser: 點選「AD 登入」
    Browser->>App: GET /auth/sso/redirect
    App-->>Browser: 302 至 AD 登入頁面
    Note over Browser,AD: 若已加入網域則自動帶入

    Browser->>AD: LDAPS Bind Request<br/>(sAMAccountName + Password)
    AD-->>Browser: LDAP Bind Result

    Browser->>App: GET /auth/callback?ticket=xxx
    App->>AD: LDAP Search<br/>(查詢使用者屬性、群組)
    AD-->>App: 使用者屬性<br/>(memberOf: HR_Specialist_Group)

    App->>DB: SELECT * FROM employees<br/>WHERE ad_username = ?
    DB-->>App: 使用者資料

    Note over App: 建立 Session<br/>寫入 role (由 AD 群組對應)

    App->>Audit: INSERT audit_log<br/>(action=LOGIN, ip=xxx)
    App-->>Browser: 302 導向首頁
    Browser-->>User: 顯示員工列表（依角色）
```

---

## 二、本機備援登入（AD 無法連線時）

### Mermaid

```mermaid
sequenceDiagram
    actor User as 使用者
    participant App as Flask 應用
    participant DB as PostgreSQL
    participant Audit as 稽核日誌

    User->>App: POST /api/v1/auth/login/local<br/>{ email, password }

    App->>DB: SELECT * FROM employees<br/>WHERE email_company = ? AND active = TRUE
    DB-->>App: 使用者資料

    alt 帳戶已鎖定
        App-->>User: 423 Locked<br/>「帳戶已鎖定，請 15 分鐘後再試」
    else 帳戶未鎖定
        Note over App: bcrypt.verify(password, password_hash)
        alt 密碼正確
            App->>DB: UPDATE employees<br/>SET login_attempts=0, last_login=NOW()
            Note over App: 建立 Session
            App->>Audit: INSERT audit_log (LOGIN)
            App-->>User: 200 OK + User Info
        else 密碼錯誤
            App->>DB: UPDATE employees<br/>SET login_attempts = login_attempts + 1
            alt login_attempts >= 5
                App->>DB: UPDATE employees<br/>SET locked_until = NOW() + 15min
                App-->>User: 423 Locked
            else login_attempts < 5
                App-->>User: 401 Unauthorized<br/>「帳號或密碼錯誤」
            end
        end
    end
```

---

## 三、RBAC 查詢員工（欄位級遮蔽）

### Mermaid

```mermaid
sequenceDiagram
    actor HR as HR 專員
    participant API as Flask API
    participant RBAC as RBAC 模組
    participant Crypto as 加密模組
    participant DB as PostgreSQL
    participant Audit as Audit Log

    HR->>API: GET /api/v1/employees/5<br/>Authorization: Session

    API->>RBAC: check_permission(user, 'employees', 'read')
    RBAC-->>API: role=hr_specialist → 允許

    API->>DB: SELECT * FROM employees WHERE id=5
    DB-->>API: 原始資料（含加密欄位）

    API->>Crypto: decrypt(id_number_enc, birth_date_enc, ...)
    Crypto-->>API: 解密後明文

    API->>RBAC: filter_fields(role=hr_specialist, data)
    Note over RBAC: 遮蔽 salary_enc, bank_*,<br/>leave_reason_enc,<br/>performance_rating_enc
    RBAC-->>API: 過濾後資料（無薪資欄位）

    API->>Audit: INSERT audit_log<br/>(action=READ, resource=employees:5)
    API-->>HR: 200 OK<br/>（已遮蔽機敏欄位）
```

---

## 四、員工調職完整流程（含異動記錄）

### Mermaid

```mermaid
sequenceDiagram
    actor HR as HR 專員
    participant API as Flask API
    participant DB as PostgreSQL
    participant Audit as Audit Log

    HR->>API: POST /api/v1/employees/5/history<br/>{ change_type: "調職", ... }

    Note over API: 驗證 RBAC (hr_specialist+)

    API->>DB: BEGIN TRANSACTION

    API->>DB: SELECT * FROM employees WHERE id=5
    DB-->>API: 目前資料 (old_value)

    API->>DB: INSERT INTO employee_history<br/>(employee_id, change_type, change_date,<br/> old_value, new_value, reason, operator_id)

    API->>DB: UPDATE employees<br/>SET department_id=3, title='資深工程師',<br/>updated_at=NOW()<br/>WHERE id=5

    API->>Audit: INSERT audit_log<br/>(action=UPDATE, old=new, resource=employees:5)

    API->>DB: COMMIT

    API-->>HR: 201 Created<br/>「調職記錄已建立」
```

---

## PlantUML 原始碼（完整流程）

### 一、AD SSO 單一登入流程

```plantuml
@startuml
actor 使用者 as User
participant "瀏覽器" as Browser
participant "Flask 應用" as App
participant "Windows AD\n(LDAPS)" as AD
database "PostgreSQL" as DB
participant "稽核日誌" as Audit

User -> Browser: 進入系統首頁
Browser -> App: GET /
App -> Browser: 302 導向 /auth/login
Browser -> App: GET /auth/login
App -> Browser: 顯示登入頁面\n(AD SSO 按鈕 + 本機備援)

User -> Browser: 點選「AD 登入」
Browser -> App: GET /auth/sso/redirect
App -> Browser: 302 至 AD 登入頁面
note right: 若已加入網域則自動帶入

Browser -> AD: LDAPS Bind Request\n(sAMAccountName + Password)
AD -> Browser: LDAP Bind Result

Browser -> App: GET /auth/callback?ticket=xxx
App -> AD: LDAP Search\n(查詢使用者屬性、群組)
AD --> App: 使用者屬性\n(memberOf: HR_Specialist_Group)

App -> DB: SELECT * FROM employees\nWHERE ad_username = ?
DB --> App: 使用者資料

App -> App: 建立 Session\n寫入 role (由 AD 群組對應)

App -> Audit: INSERT audit_log\n(action=LOGIN, ip=xxx)
App --> Browser: 302 導向首頁
Browser --> User: 顯示員工列表（依角色）
@enduml
```

---

## 二、本機備援登入（AD 無法連線時）

```plantuml
@startuml
actor 使用者 as User
participant "Flask 應用" as App
database "PostgreSQL" as DB
participant "稽核日誌" as Audit

User -> App: POST /api/v1/auth/login/local\n{ email, password }

App -> DB: SELECT * FROM employees\nWHERE email_company = ? AND active = TRUE
DB --> App: 使用者資料

App -> App: 檢查 locked_until > NOW()?
alt 帳戶已鎖定
    App --> User: 423 Locked\n「帳戶已鎖定，請 15 分鐘後再試」
else 帳戶未鎖定
    App -> App: bcrypt.verify(password, password_hash)
    alt 密碼正確
        App -> DB: UPDATE employees\nSET login_attempts=0, last_login=NOW()
        App -> App: 建立 Session
        App -> Audit: INSERT audit_log (LOGIN)
        App --> User: 200 OK + User Info
    else 密碼錯誤
        App -> DB: UPDATE employees\nSET login_attempts = login_attempts + 1
        alt login_attempts >= 5
            App -> DB: UPDATE employees\nSET locked_until = NOW() + 15min
            App --> User: 423 Locked
        else login_attempts < 5
            App --> User: 401 Unauthorized\n「帳號或密碼錯誤」
        end
    end
end
@enduml
```

---

## 三、RBAC 查詢員工（欄位級遮蔽）

```plantuml
@startuml
actor "HR 專員" as HR
participant "Flask API" as API
participant "RBAC 模組" as RBAC
participant "加密模組" as Crypto
database "PostgreSQL" as DB
participant "Audit Log" as Audit

HR -> API: GET /api/v1/employees/5\nAuthorization: Session

API -> RBAC: check_permission(user, 'employees', 'read')
RBAC --> API: role=hr_specialist → 允許

API -> DB: SELECT * FROM employees WHERE id=5
DB --> API: 原始資料（含加密欄位）

API -> Crypto: decrypt(id_number_enc, birth_date_enc, ...)
Crypto --> API: 解密後明文

API -> RBAC: filter_fields(role=hr_specialist, data)
note right: 遮蔽 salary_enc, bank_*, \nleave_reason_enc, performance_rating_enc
RBAC --> API: 過濾後資料（無薪資欄位）

API -> Audit: INSERT audit_log\n(action=READ, resource=employees:5)
API --> HR: 200 OK\n（已遮蔽機敏欄位）
@enduml
```

---

## 四、員工調職完整流程（含異動記錄）

```plantuml
@startuml
actor "HR 專員" as HR
participant "Flask API" as API
database "PostgreSQL" as DB
participant "Audit Log" as Audit

HR -> API: POST /api/v1/employees/5/history\n{\n  change_type: "調職",\n  new_value: {department_id: 3, title: "資深工程師"},\n  change_date: "2026-07-01",\n  reason: "部門擴編調任"\n}

API -> API: 驗證 RBAC (hr_specialist+)

API -> DB: BEGIN TRANSACTION

API -> DB: SELECT * FROM employees WHERE id=5
DB --> API: 目前資料 (old_value)

API -> DB: INSERT INTO employee_history\n(employee_id, change_type, change_date,\n old_value, new_value, reason, operator_id)

API -> DB: UPDATE employees\nSET department_id=3, title='資深工程師',\nupdated_at=NOW()\nWHERE id=5

API -> Audit: INSERT audit_log\n(action=UPDATE, old=new, resource=employees:5)

API -> DB: COMMIT

API --> HR: 201 Created\n「調職記錄已建立」
@enduml
```
