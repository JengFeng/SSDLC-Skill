# API 規格
| 方法 | 路徑 | 說明 |
|:---|:---|:---|
| GET | / | 列表 + 搜尋(?q=) |
| GET/POST | /add | 新增表單 |
| GET/POST | /edit/<id> | 編輯表單 |
| POST | /delete/<id> | 刪除 |

---

## 🔒 安全需求規格 (CIA + OWASP)

### 機密性 (Confidentiality)
- 所有 API 端點強制使用 HTTPS / TLS 1.2+
- 身分驗證資訊（密碼）禁止明文傳輸
- 資料庫連線字串由環境變數管理，禁止寫入程式碼

### 完整性 (Integrity)
- 所有輸入參數進行伺服器端驗證（SQL Injection / XSS 防範）
- 資料寫入操作（新增/修改/刪除）使用 POST 方法

### 可用性 (Availability)
- API 回應時間目標 < 2 秒
- 錯誤時僅回傳統一 JSON 格式：`{"error": "簡短訊息", "code": "ERR_CODE"}`，不洩漏系統內部資訊

### OWASP Top 10 對照
| OWASP 風險 | 對應控制措施 |
|-----------|------------|
| A03:2021 Injection | 使用參數化查詢（SQLite ? placeholder） |
| A07:2021 Identification Failures | 帳戶鎖定（5 次失敗 / 15 分鐘）、密碼複雜度政策 |
| A02:2021 Cryptographic Failures | HTTPS/TLS 1.2+、bcrypt 密碼雜湊 |
| A05:2021 Security Misconfiguration | 環境變數管理 DB 連線、關閉 debug 模式 |

---

## 🔑 帳號與密碼政策

| 政策 | 規格 |
|------|------|
| 密碼複雜度 | 最少 8 字元，含大小寫字母 + 數字 |
| 密碼效期 | 90 天強制變更 |
| 密碼歷史 | 禁止與前 3 次相同 |
| 首次登入 | 強制變更預設密碼 |
| 帳戶鎖定 | 連續失敗 5 次後鎖定 15 分鐘 |
| 閒置停用 | 連續 180 天未登入自動禁用 |
| 共用禁止 | 禁止共用帳號，一人一帳號 |

---

## 🔐 傳輸安全

| 要求 | 規格 |
|------|------|
| 傳輸協定 | HTTPS / TLS 1.2 以上 |
| 憑證管理 | 使用公鑰憑證（CA 簽發） |
| 遠端管理 | SSH 加密連線 |
