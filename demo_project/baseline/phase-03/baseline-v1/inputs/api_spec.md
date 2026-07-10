# API 規格書 (API Specification)

> 生成日期：2026-06-29 | Phase 02 系統設計
> 基礎路徑：`/api/v1`
> 格式：JSON | 認證：AD SSO Session / Bearer Token

---

## 一、認證與授權

### 1.1 登入（AD SSO）

| 方法 | 端點 | 說明 | 權限 |
|:---|:---|:---|:---|
| GET | `/auth/login` | AD SSO 登入頁（302 至 AD 登入） | 公開 |
| GET | `/auth/callback` | AD 認證回呼端點 | 公開 |
| POST | `/auth/login/local` | 本機備援登入（Email + 密碼） | 公開 |
| POST | `/auth/logout` | 登出，清除 Session | 已登入 |

### 1.2 本機備援登入

```
POST /api/v1/auth/login/local
Content-Type: application/json

Request:
{
    "email": "user@company.com",
    "password": "********"
}

Response 200:
{
    "token": "session-token",
    "user": {
        "id": 1,
        "name_zh": "王小明",
        "role": "hr_specialist",
        "department": "人力資源部"
    }
}

Response 401:
{ "error": "帳號或密碼錯誤" }

Response 423:
{ "error": "帳戶已鎖定，請於 15 分鐘後再試", "locked_until": "2026-06-29T14:30:00Z" }
```

---

## 二、員工主檔 (Employees) — REQ-001

| 方法 | 端點 | 說明 | 權限 |
|:---|:---|:---|:---|
| GET | `/employees` | 員工列表（分頁 + 搜尋 + 排序） | HR 專員+ / 主管+ |
| GET | `/employees/:id` | 單一員工詳細資料 | 依 RBAC（本人可看自己） |
| POST | `/employees` | 新增員工（新進報到） | HR 專員+ |
| PUT | `/employees/:id` | 更新員工資料（全欄位） | HR 專員+ |
| PATCH | `/employees/:id` | 部分更新員工資料 | 依 RBAC |
| DELETE | `/employees/:id` | 刪除員工（軟刪除→active=false） | HR 主管+ |

### 2.1 員工列表

```
GET /api/v1/employees?page=1&per_page=50&q=王&department_id=2&status=在職&sort=hire_date&order=desc

Response 200:
{
    "total": 150,
    "page": 1,
    "per_page": 50,
    "data": [
        {
            "id": 1,
            "employee_code": "EMP001",
            "name_zh": "王小明",
            "department": { "id": 2, "name": "人力資源部" },
            "title": "HR 專員",
            "email_company": "xiaoming@company.com",
            "hire_date": "2020-03-15",
            "status": "在職"
        }
    ]
}
```

### 2.2 單一員工（依角色遮蔽欄位）

```
GET /api/v1/employees/1

Response 200 (HR 主管視角 — 全欄位):
{
    "id": 1,
    "employee_code": "EMP001",
    "name_zh": "王小明",
    "name_en": "Wang Xiao Ming",
    "id_number": "A123****89",          // 部分遮蔽
    "birth_date": "1990-05-20",
    "gender": "M",
    "email_company": "xiaoming@company.com",
    "email_personal": "personal@mail.com",
    "phone_mobile": "0912****67",
    "phone_extension": "1234",
    "address_registered": "台北市****",
    "address_contact": "新北市****",
    "emergency_contact": {
        "name": "王大華",
        "phone": "0933****88",
        "relation": "父親"
    },
    "department": { "id": 2, "name": "人力資源部" },
    "title": "HR 專員",
    "hire_date": "2020-03-15",
    "employment_type": "全職",
    "salary": 45000,                     // 🔴 僅 HR 主管
    "bank": { "code": "004", "account": "****5678" },
    "status": "在職",
    "ad_username": "xiaoming",
    "role": "hr_specialist",
    "created_at": "2020-03-15T09:00:00Z"
}

Response 200 (一般員工視角 — 僅本人可看，部分欄位遮蔽):
{
    "id": 1,
    "employee_code": "EMP001",
    "name_zh": "王小明",
    "department": { "id": 2, "name": "人力資源部" },
    "title": "HR 專員",
    "email_company": "xiaoming@company.com",
    "phone_extension": "1234",
    "hire_date": "2020-03-15",
    "status": "在職"
    // ⚠️ salary, bank, id_number 等機敏欄位不顯示
}
```

### 2.3 新增員工

```
POST /api/v1/employees
Content-Type: application/json

Request:
{
    "employee_code": "EMP099",
    "name_zh": "張小華",
    "id_number": "B123456789",
    "birth_date": "1995-08-12",
    "gender": "F",
    "email_company": "xiaohua@company.com",
    "phone_mobile": "0912345678",
    "department_id": 2,
    "title": "初級專員",
    "hire_date": "2026-07-01",
    "employment_type": "全職"
}

Response 201:
{
    "id": 99,
    "message": "員工新增成功"
}

Response 409:
{ "error": "員工工號或 Email 已存在" }
```

---

## 三、員工異動歷程 (History) — REQ-002

| 方法 | 端點 | 說明 | 權限 |
|:---|:---|:---|:---|
| GET | `/employees/:id/history` | 查詢員工完整異動時間軸 | HR 專員+ |
| POST | `/employees/:id/history` | 新增異動記錄（調職/升遷/調薪/離職） | HR 專員+ |

```
GET /api/v1/employees/1/history

Response 200:
{
    "employee_id": 1,
    "history": [
        {
            "id": 5,
            "change_type": "調職",
            "change_date": "2025-01-01",
            "old_value": { "department": "資訊技術部", "title": "工程師" },
            "new_value": { "department": "人力資源部", "title": "HR 專員" },
            "reason": "部門需求調任",
            "operator": "陳主管",
            "created_at": "2025-01-01T10:00:00Z"
        }
    ]
}
```

> ⚠️ employee_history 僅支援 INSERT（Append-Only），不提供 PUT/DELETE。

---

## 四、學經歷與證照 — REQ-003

### 4.1 學歷

| 方法 | 端點 | 說明 | 權限 |
|:---|:---|:---|:---|
| GET | `/employees/:id/education` | 員工學歷列表 | HR 專員+ |
| POST | `/employees/:id/education` | 新增學歷 | HR 專員+ |
| PUT | `/education/:eid` | 修改學歷 | HR 專員+ |
| DELETE | `/education/:eid` | 刪除學歷 | HR 專員+ |

### 4.2 工作經歷

| 方法 | 端點 | 說明 | 權限 |
|:---|:---|:---|:---|
| GET | `/employees/:id/experience` | 員工經歷列表 | HR 專員+ |
| POST | `/employees/:id/experience` | 新增經歷 | HR 專員+ |
| PUT | `/experience/:eid` | 修改經歷 | HR 專員+ |
| DELETE | `/experience/:eid` | 刪除經歷 | HR 專員+ |

### 4.3 證照

| 方法 | 端點 | 說明 | 權限 |
|:---|:---|:---|:---|
| GET | `/employees/:id/certifications` | 員工證照列表 | HR 專員+ |
| POST | `/employees/:id/certifications` | 新增證照 | HR 專員+ |
| PUT | `/certifications/:cid` | 修改證照 | HR 專員+ |
| DELETE | `/certifications/:cid` | 刪除證照 | HR 專員+ |

### 4.4 附件上傳

| 方法 | 端點 | 說明 | 權限 |
|:---|:---|:---|:---|
| POST | `/attachments/upload` | 上傳附件（PDF/JPG, ≤5MB） | HR 專員+ |
| GET | `/attachments/:fid` | 下載附件 | 依 RBAC |

---

## 五、員工自助服務 (ESS) — REQ-004

| 方法 | 端點 | 說明 | 權限 |
|:---|:---|:---|:---|
| GET | `/me` | 檢視個人完整資料 | 已登入 |
| PATCH | `/me` | 修改個人非機密欄位 | 已登入（限聯絡欄位） |

```
PATCH /api/v1/me
Content-Type: application/json

// 一般員工僅可修改以下欄位：
Request:
{
    "phone_mobile": "0987654321",
    "address_contact": "台北市信義區...",
    "emergency_contact_name": "李媽媽",
    "emergency_contact_phone": "0922111222",
    "emergency_contact_relation": "母親"
}

Response 200:
{ "message": "個人資料更新成功" }

Response 403:
{ "error": "您無權修改此欄位" }
```

---

## 六、報表與匯出 — REQ-006, REQ-007

| 方法 | 端點 | 說明 | 權限 |
|:---|:---|:---|:---|
| GET | `/reports/year-distribution` | 年資分佈資料 | HR 主管+ |
| GET | `/reports/department-structure` | 部門人力結構 | HR 主管+ |
| GET | `/reports/birthday-this-month` | 當月壽星清單 | HR 專員+ |
| GET | `/reports/turnover-rate` | 離職率統計 | HR 主管+ |
| GET | `/export/employees` | 匯出員工清單 (.xlsx) | HR 專員+ |
| GET | `/export/report/:type` | 匯出指定報表 (.xlsx) | HR 專員+ |

```
GET /api/v1/reports/turnover-rate?year=2026&department_id=2

Response 200:
{
    "year": 2026,
    "department": "人力資源部",
    "monthly": [
        { "month": 1, "headcount": 25, "left": 1, "rate": 4.0 },
        { "month": 2, "headcount": 26, "left": 0, "rate": 0.0 }
    ],
    "annual_rate": 6.5
}
```

---

## 七、部門管理

| 方法 | 端點 | 說明 | 權限 |
|:---|:---|:---|:---|
| GET | `/departments` | 部門樹狀列表 | HR 專員+ |
| POST | `/departments` | 新增部門 | HR 主管+ |
| PUT | `/departments/:id` | 修改部門 | HR 主管+ |
| DELETE | `/departments/:id` | 刪除部門（無員工時） | HR 主管+ |

---

## 八、稽核日誌（管理者） — NFR-003

| 方法 | 端點 | 說明 | 權限 |
|:---|:---|:---|:---|
| GET | `/audit-logs` | 稽核日誌查詢（分頁/篩選） | admin |

```
GET /api/v1/audit-logs?action=VIEW_SENSITIVE&from=2026-06-01&to=2026-06-30&page=1

Response 200:
{
    "total": 42,
    "data": [
        {
            "id": 1024,
            "actor": "hr_manager@company.com",
            "action": "VIEW_SENSITIVE",
            "resource": "employees:1",
            "description": "檢視員工薪資欄位",
            "ip": "192.168.1.100",
            "created_at": "2026-06-15T14:30:00Z"
        }
    ]
}
```

---

## 九、HTTP 狀態碼總表

| 狀態碼 | 說明 |
|:---|:---|
| 200 | 成功 |
| 201 | 建立成功 |
| 302 | 重新導向（SSO） |
| 400 | 請求參數錯誤 |
| 401 | 未登入 / Token 無效 |
| 403 | 無權限（RBAC 拒絕） |
| 404 | 資源不存在 |
| 409 | 資源衝突（重複） |
| 422 | 驗證失敗（必填/格式） |
| 423 | 帳戶鎖定 |
| 429 | 請求過於頻繁（Rate Limit） |
| 500 | 伺服器錯誤 |

---

## 十、安全規範

| 規範 | 實作 |
|:---|:---|
| 全站 HTTPS | TLS 1.2+，HSTS Header |
| 認證 | AD SSO (LDAPS) + 本機備援 (bcrypt) |
| 授權 | Flask-Principal RBAC + 自訂 @require_role decorator |
| API 速率限制 | Flask-Limiter：登入 5次/分，API 60次/分 |
| 輸入驗證 | Marshmallow Schema 驗證 |
| CORS | 僅允許企業內網來源 |
| Security Headers | CSP, X-Frame-Options, X-Content-Type-Options |
| 稽核 | 所有 API 請求記錄至 audit_log |
