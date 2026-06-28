### grill-me 釐清結果

| 問題 | 回答 |
|------|------|
| 查詢方式？ | 關鍵字搜尋（姓名/部門/Email） |
| 新增欄位？ | 姓名、部門、職稱、Email、到職日，全必填 |
| Email 規則？ | 唯一值，重複時拒絕 |
| 刪除方式？ | 硬刪除 + 確認對話框 |
| 前端框架？ | Jinja2 模板，SSR |
| 身分驗證？ | 需要登入（Email + 密碼） |
| 安全需求？ | 普級資安防護基準（SQLi/XSS 防禦、Security Headers、帳戶鎖定） |
| UI 設計？ | 採用 frontend-app-builder 現代化設計（漸層/動畫/SVG/RWD） |
| 技術棧？ | Python 3.13 + Flask 3.x + SQLite + pytest + Playwright |