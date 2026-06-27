# AI 調整紀錄 (AI Adjustment Log) — Demo Project

| 時間戳 | 決策類型 | 原始狀態 | 調整後狀態 | 理由 |
|:---|:---|:---|:---|:---|
| 2026-06-27 12:00 | 需求釐清 | 口語「不要讓Email重複」 | 正規化為 UNIQUE 約束 + IntegrityError 處理 | grill-me 對話萃取 |
| 2026-06-27 13:00 | 格式選擇 | 考慮 PlantUML .puml | 採用 Mermaid .md（瀏覽器直接渲染） | 降低工具依賴 |
| 2026-06-27 14:00 | 架構決策 | 考慮前後端分離 | 採用 SSR（Jinja2 模板） | 簡化部署，單檔案即可運行 |
| 2026-06-27 15:00 | Bug 修復 | 搜尋無結果時顯示空白表格 | 顯示「尚無員工資料」提示 | BUG_001 修復 |
| 2026-06-27 16:00 | 路徑修正 | traceability_matrix.md 引用 .puml | 改為 .md | 框架標準化（@optimize 執行） |
