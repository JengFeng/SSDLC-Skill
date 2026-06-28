# 正規化需求規格書

> 生成日期：2026-06-28 | 階段：Phase 01 規劃與需求分析
> 來源：使用者口述 + grill-me 釐清

## 功能需求

| 編號 | 功能 | 描述 | 優先級 | 安全關聯 |
|:---|:---|:---|:---|:---|
| REQ-001 | 員工列表 | 顯示所有員工，支援關鍵字搜尋（姓名/部門/Email） | P0 | — |
| REQ-002 | 新增員工 | 表單輸入（姓名/部門/職稱/Email/到職日），Email 唯一 | P0 | 輸入驗證、SQLi 防禦 |
| REQ-003 | 修改員工 | 點擊編輯 → 表單預載資料 → 儲存更新 | P0 | 輸入驗證 |
| REQ-004 | 刪除員工 | 點擊刪除 → 確認對話框 → 硬刪除 | P0 | CSRF 防護 |
| REQ-005 | 登入驗證 | Email + 密碼登入，Session 管理 | P0 | 密碼雜湊、帳戶鎖定、Session 逾時 |
| REQ-006 | 安全防護 | Security Headers、輸入過濾、參數化查詢 | P0 | OWASP Top 10 |

## 非功能需求

| 編號 | 項目 | 規格 |
|:---|:---|:---|
| NFR-001 | 效能 | 列表載入 < 500ms |
| NFR-002 | 可用性 | RWD 響應式，支援手機/平板/桌機 |
| NFR-003 | 安全性 | 普級資安防護基準 (General)，90%+ 符合率 |
| NFR-004 | 瀏覽器 | Chrome/Firefox/Edge 最新兩版 |

## 資料模型

| 欄位 | 型別 | 約束 | 說明 |
|:---|:---|:---|:---|
| id | INTEGER | PK, AUTOINCREMENT | 員工編號 |
| name | TEXT | NOT NULL | 姓名 |
| department | TEXT | NOT NULL | 部門 |
| title | TEXT | NOT NULL | 職稱 |
| email | TEXT | NOT NULL, UNIQUE | Email |
| password_hash | TEXT | NOT NULL DEFAULT '' | 密碼雜湊 (SHA-256) |
| hire_date | TEXT | NOT NULL | 到職日 |
| last_login | TEXT | — | 最後登入時間 |
| login_attempts | INTEGER | DEFAULT 0 | 登入失敗次數 |
| locked_until | TEXT | — | 鎖定至 (ISO 8601) |
| active | INTEGER | DEFAULT 1 | 啟用狀態 |
| created_at | TEXT | DEFAULT now | 建立時間 |
| updated_at | TEXT | DEFAULT now | 更新時間 |

## 技術棧

| 層 | 技術 |
|:---|:---|
| 後端 | Python 3.13 + Flask 3.x |
| 資料庫 | SQLite |
| 前端 | Jinja2 + 內嵌 CSS（frontend-app-builder 設計） |
| 測試 | pytest (API) + Playwright (UI) |
| 安全 | SHA-256 密碼雜湊、參數化查詢、Security Headers |