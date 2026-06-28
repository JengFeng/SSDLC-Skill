# Phase 3 設計簡報 — 安全需求傳遞

> 來源：Phase 2 系統設計產出
> 傳遞日期：2026-06-28

## 一、設計產出參照

| 文件 | 路徑 | 安全相關內容 |
|------|------|------------|
| API 規格 | `02_system_design/outputs/api_spec.md` | CIA 需求、OWASP 對照、密碼政策、帳戶鎖定、TLS |
| DB Schema | `02_system_design/outputs/db_schema.sql` | password_hash(bcrypt)、last_login、login_attempts、locked_until |
| 用例圖 | `02_system_design/outputs/use_case_diagram.md` | RBAC 角色權限矩陣 |
| UI 雛型 | `02_system_design/outputs/ui_prototype.html` | 密碼遮蔽輸入框 |

## 二、安全實作要求（構面 1/2/4/5/6）

### 必須實作項目
1. **密碼驗證**：登入頁面 + 密碼雜湊比對（SHA-256 + Salt）
2. **Session 管理**：Flask session + login_required 裝飾器
3. **帳戶鎖定**：連續失敗 5 次鎖定 15 分鐘
4. **輸入驗證**：SQL Injection / XSS 防範（正則過濾）
5. **安全 Headers**：nosniff、DENY、XSS-Protection
6. **錯誤遮蔽**：統一回應格式，不洩漏內部資訊
7. **DB 安全欄位**：password_hash、last_login、login_attempts、locked_until、active
8. **TLS 要求**：HTTPS 強制（Strict-Transport-Security header）

### 對應檢核表
- 普級檢核表：`external-resources/Security-Principles/assets/checklist_medium.md`
- 適用構面：1（存取控制）、2（事件日誌）、4（識別與鑑別）、5（系統與服務獲得）、6（系統與通訊保護）
