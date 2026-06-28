# 實體關聯圖 (ER Diagram) — Enhanced

> Phase 02: System Design | 2026-06-28 | Security-General Baseline

## 單一實體：employees

```mermaid
%%{init: {"er": {"fontSize": 18, "layoutDirection": "TB"}, "themeVariables": {"fontSize": "18px"}}}%%
erDiagram
    EMPLOYEES {
        INTEGER id PK "員工編號(AUTOINCREMENT)"
        TEXT name "姓名 NOT NULL"
        TEXT department "部門 NOT NULL"
        TEXT title "職稱 NOT NULL"
        TEXT email UK "Email NOT NULL UNIQUE"
        TEXT password_hash "密碼雜湊 SHA-256"
        TEXT hire_date "到職日 NOT NULL"
        TEXT last_login "最後登入時間"
        INTEGER login_attempts "登入失敗次數 DEFAULT 0"
        TEXT locked_until "帳戶鎖定截止 ISO8601"
        INTEGER active "啟用狀態 DEFAULT 1"
        TEXT created_at "建立時間 DEFAULT now"
        TEXT updated_at "更新時間 DEFAULT now"
    }
```

## 索引策略

| 索引名稱 | 欄位 | 用途 |
|:---|:---|:---|
| idx_employees_email | email | 登入查詢、唯一性檢查 |
| idx_employees_department | department | 部門篩選加速 |
| idx_employees_active | active | 快速過濾在職員工 |

## 設計考量

- **單一實體**：內部小工具無需正規化到多表，簡化開發與維護
- **安全欄位內嵌**：password_hash、login_attempts、locked_until 直接放在 employees 表中，簡化 JOIN
- **軟刪除支援**：active 欄位保留未來軟刪除擴充空間
- **審計追蹤**：created_at / updated_at 自動填入，last_login 記錄最後活動
