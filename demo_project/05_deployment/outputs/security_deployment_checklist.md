# 安全部署檢查清單 (Security Deployment Checklist)

> Phase 05: Deployment | Security-General Baseline | 2026-06-28

## 部署前安全檢查

| # | 檢查項目 | 狀態 | 說明 |
|:---|:---|:---|:---|
| 1 | debug=False | PASSED | 部署時關閉 Flask debug 模式 |
| 2 | secret_key 隨機生成 | PASSED | secrets.token_hex(32) 每次重啟更換 |
| 3 | Security Headers | PASSED | nosniff / DENY / XSS-Protection |
| 4 | 參數化查詢 | PASSED | 所有 SQL 使用 ? placeholder |
| 5 | 輸入驗證 | PASSED | validate_input() 過濾特殊字元 |
| 6 | 密碼雜湊 | PASSED | SHA-256 + SALT |
| 7 | 帳戶鎖定 | PASSED | 5 次失敗鎖定 15 分鐘 |
| 8 | Session 管理 | PASSED | @login_required 保護所有路由 |
| 9 | 日誌記錄 | PASSED | app.log 記錄 CRUD + 登入 |
| 10 | 相依套件鎖定 | PASSED | requirements.txt 含版本 |
| 11 | .env 保護 | PASSED | .env.example 不含真實密碼 |
| 12 | 管理員帳號 | PASSED | 預設 admin@demo.local / Admin@1234 |

## 部署指令
\\\atch
cd baseline\baseline-v5
run.bat
\\\

## 安全性評估
- 安全基準: General (普級)
- 符合率: 90.5% (37/41 項目通過)
- STRIDE 威脅緩解: 8/8 已完成
