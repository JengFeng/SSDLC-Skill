# 威脅模型 (Threat Model)
> 專案：員工基本資料管理系統
> 方法：STRIDE

## 信任邊界
- Web Browser ←→ Flask App (HTTPS)
- Flask App ←→ SQLite DB (本地)

## STRIDE 分析
| 威脅類型 | 威脅描述 | 緩解措施 |
|------|------|------|
| Spoofing | 偽冒 HR 身分登入 | 密碼驗證 + Session + 帳戶鎖定 |
| Tampering | 竄改員工資料 | POST 驗證 + 輸入過濾 |
| Repudiation | 否認操作 | 日誌記錄（logger.info） |
| Info Disclosure | SQL Injection 洩漏 | 參數化查詢 + validate_input() |
| DoS | 大量請求癱瘓 | 帳戶鎖定機制（5次/15分） |
| Elevation | 越權存取 | RBAC + @login_required |
