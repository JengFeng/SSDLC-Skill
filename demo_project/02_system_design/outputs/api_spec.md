# API 規格文件 (Enhanced)

> Phase 02: System Design | 2026-06-28 | Security-General Baseline

## 端點總覽

| Method | Path | 描述 | 認證 | 安全 |
|:---|:---|:---|:---|:---|
| GET | /login | 登入頁面 | 無 | Rate-limit 建議 |
| POST | /login | 登入驗證 | 無 | 帳戶鎖定、密碼雜湊 |
| GET | /logout | 登出並清除 Session | Session | Session.clear() |
| GET | / | 員工列表 (支援 ?q= 搜尋) | Session | @login_required |
| GET | /add | 新增員工表單 | Session | @login_required |
| POST | /add | 新增員工 (form data) | Session | 輸入驗證、Email 唯一 |
| GET | /edit/<id> | 編輯員工表單 (預載) | Session | @login_required |
| POST | /edit/<id> | 更新員工 | Session | 輸入驗證 |
| POST | /delete/<id> | 刪除員工 | Session | CSRF 防護 |

## 回應格式

### POST /login (登入成功)
- Status: 302 → /
- Session: user_id, user_name
- Flash: "Welcome, {name}!"

### POST /login (登入失敗)
- Status: 200 (重新渲染 login.html)
- Flash error: "Invalid credentials" / "Account locked"

### GET / (員工列表)
- Status: 200
- 渲染 index.html，傳入 employees (list of dict) + query (str)

### POST /add (新增員工)
- Request Body: form data (name, department, title, email, hire_date)
- 成功: 302 → / + flash success
- 失敗 (Email 重複): 200 + flash error "電子郵件已存在"
- 失敗 (必填缺漏): 200 + flash error "所有欄位皆為必填"

### POST /edit/<id> (更新員工)
- Request Body: form data (name, department, title, email, hire_date)
- 成功: 302 → / + flash success
- 失敗 (Email 重複): 200 + flash error

### POST /delete/<id> (刪除員工)
- Request Body: 無 (表單 POST)
- 成功: 302 → / + flash success
- 記錄: app.log

## 全域安全標頭

| Header | Value |
|:---|:---|
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| X-XSS-Protection | 1; mode=block |

## 錯誤處理統一格式
- Flash message (category: "error" | "success")
- 記錄至 logs/app.log
- HTTP 狀態碼依情境 (200/302/400/401)
