# 對話紀錄 (Conversation Log) — Demo Project

## Session: 2026-06-27 員工管理系統開發

### 階段 01：規劃與需求分析
- **使用者**：「我需要一個員工基本資料管理系統，可以新增、刪除、修改、查詢」
- **AI 代理**：讀取需求，執行 grill-me 釐清（Email 唯一性、必填欄位、刪除確認）
- **決策**：確立 5 項 P0 需求 + 5 項 P1 設計需求

### 階段 02：系統設計
- **使用者**：「用 Flask + SQLite，介面簡單就好」
- **AI 代理**：產生 7 項設計產出（DB Schema、ER 圖、API 規格、UI 雛型、3 UML）
- **決策**：Mermaid .md 格式優先，不依賴外部工具

### 階段 03：開發與編碼
- **AI 代理**：實作 app.py（<200 行）+ 3 個 Jinja2 模板
- **技術棧**：Python 3.13 + Flask 3.x + SQLite + Jinja2

### 階段 04：測試驗證
- **AI 代理**：執行雙軌測試
- **結果**：pytest 7/7 + Playwright 7/7 = 14/14 PASS

### 階段 05-06：部署與維護
- **產出**：requirements.txt、run.bat、monitoring_guide.md
- **Baseline**：建立 v1/v2/v3 三版可獨立執行快照
