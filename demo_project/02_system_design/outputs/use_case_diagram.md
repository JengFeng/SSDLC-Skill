# 使用案例圖 (Use Case Diagram) — Enhanced

> Phase 02: System Design | 2026-06-28

```mermaid
%%{init: {"flowchart": {"nodeSpacing": 55, "rankSpacing": 65, "padding": 20}, "themeVariables": {"fontSize": "17px"}}}%%
graph TD
    subgraph "👤 使用者角色"
        USER[一般使用者]
    end

    subgraph "🔐 認證系統"
        LOGIN[登入系統] --> VERIFY[驗證 Email + 密碼]
        LOGIN --> LOCKOUT[帳戶鎖定檢查 <br/>5次/15分鐘]
        LOGOUT[登出系統]
    end

    subgraph "📋 員工 CRUD"
        LIST[查看員工列表] --> SEARCH[關鍵字搜尋<br/>姓名/部門/Email]
        ADD[新增員工] --> EMAIL_CHECK[Email 唯一性檢查]
        EDIT[修改員工] --> PRELOAD[表單預載資料]
        DELETE[刪除員工] --> CONFIRM[確認對話框]
    end

    USER --> LOGIN
    USER --> LOGOUT
    USER --> LIST
    USER --> ADD
    USER --> EDIT
    USER --> DELETE

    LIST --> DB[(SQLite 資料庫)]
    ADD --> DB
    EDIT --> DB
    DELETE --> DB
```

## 使用案例說明

| 案例 | 前置條件 | 主要流程 | 後置條件 |
|:---|:---|:---|:---|
| 登入 | 無 | Email+密碼 → 驗證 → Session | 已認證 Session |
| 查詢列表 | 已登入 | GET / → 顯示全部 | 列表頁面 |
| 搜尋 | 已登入 | ?q=關鍵字 → 過濾 | 篩選結果 |
| 新增 | 已登入 | 填表 → 驗證 → INSERT | 新員工記錄 |
| 修改 | 已登入 | 點編輯 → 改資料 → UPDATE | 更新記錄 |
| 刪除 | 已登入 | 點刪除 → 確認 → DELETE | 記錄移除 |
