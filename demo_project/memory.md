# 專案記憶 (Project Memory)

> 本檔案為專案級 AI 協作對話記憶。所有使用者與 AI 代理之間的互動、決策、進度均記錄於此。
> 若對話中斷，下一 session 的 AI 代理必須先讀取本檔案以接續作業。

---

## 一、 專案概覽

| 項目 | 內容 |
|:---|:---|
| 專案名稱 | 員工基本資料管理系統 (Employee CRUD) |
| 建立日期 | 2026-06-27 |
| 當前版本 | baseline-v0.3.0 |
| 技術棧 | Python 3.13 + Flask 3.x + SQLite + Jinja2 + pytest + Playwright |
| 當前階段 | 全階段完成（01～06 已走完一輪） |

---

## 二、 對話歷程 (Session Log)

### Session 1 — 2026-06-27：全流程開發

#### [11:30] @init 專案初始化
- 使用者執行 `@init ./demo_project`
- AI 建立 52 目錄 + 45 追蹤檔的標準 SSDLC 結構
- Git init + baseline-v0.1.0 tag

#### [11:35] 階段 01：規劃與需求分析
- 使用者口述需求：「員工基本資料管理網頁，Python + SQLite，CRUD」
- AI 執行 grill-me 釐清：查詢方式（搜尋）、刪除（硬刪除+確認）、Email（唯一）、前端（Jinja2）、驗證（無）、欄位（全必填）
- 產出：`inputs/user_requirement_raw.md`、`reg/grill_me_session.md`、`reg/requirement_tracker.md`、`outputs/formal_requirements.md`
- 導入 Skill：`@01/07` grill-me、`@01/10` langchain

#### [11:40] 階段 02：系統設計
- AI 產出七項標準設計文件
- 產出：`db_schema.sql`、`er_diagram.md`、`api_spec.md`、`ui_prototype.html`、`use_case_diagram.md`、`activity_diagram.md`、`sequence_diagram.md`
- 導入 Skill：`@02/03,10,12` bootstrap-ui + mermaid + plantuml
- 後續補強：UML 三圖從 .puml 轉換為 Mermaid .md 格式（瀏覽器可直接渲染）

#### [11:45] 階段 03：開發與編碼
- AI 實作 `app.py`（150 行 Flask CRUD）+ 3 個 Jinja2 模板
- app.log 路徑設定為全域 `logs/app.log`

#### [11:50] 階段 04：測試驗證
- pytest API 測試：7/7 PASS（TC_001～TC_007）
- Playwright 瀏覽器 UI 測試：7/7 PASS（TC_UI_001～TC_UI_007）
- 合計：14/14 PASS（4.40s）
- Bug 記錄：BUG-001（teardown 檔案鎖定）、BUG-002（HTML5 required 攔截）
- 導入 Skill：`@04/04` playwright

#### [11:55] 階段 05+06：部署 + 監控
- `requirements.txt`（Flask + pytest）+ `run.bat`（一鍵啟動）
- `monitoring_guide.md`（日誌 + 錯誤處理 + 升級路徑）

#### [12:00] SRS 升級
- `system_specification.md` 從陽春功能清單升級為 IEEE 830 完整 SRS（六章，9.8KB）
- 全案檔案路徑改為可點擊 Markdown 連結

#### [12:10] 框架優化
- traceability_matrix + system_spec 從 `.agents/` 移至根目錄
- Bug 追蹤統一表格化（`bug_tracker.md`）
- 需求追蹤統一表格化（`requirement_tracker.md`）
- `ui_mockup.html` → `ui_prototype.html`（更直覺命名）

#### [12:15] @baseline 指令實作
- 新增 `@baseline` 指令，建立可獨立執行快照
- 當前 baseline：v1（5 files）、v2（4 files）
- `@optimize` 加上「框架建造者專用」嚴謹限制

---

## 三、 關鍵決策紀錄

| 決策 | 內容 | 日期 |
|:---|:---|:---|
| 技術棧 | Python Flask + SQLite + Jinja2（無前端框架） | 2026-06-27 |
| Email 唯一性 | UNIQUE 約束，重複時拒絕並提示 | 2026-06-27 |
| 刪除策略 | 硬刪除 + 瀏覽器確認對話框 | 2026-06-27 |
| 前端渲染 | SSR（伺服器端渲染），不採用前後端分離 | 2026-06-27 |
| 日誌位置 | 全域 `logs/app.log`，非各階段 outputs/ | 2026-06-27 |
| 測試策略 | pytest API + Playwright UI 雙套測試 | 2026-06-27 |
| 文件追蹤 | 需求/bug 統一表格化，不建獨立檔案 | 2026-06-27 |
| 規格文件 | traceability + system_spec 放根目錄直觀查閱 | 2026-06-27 |
| 框架指令 | @baseline（可執行快照）、@optimize（僅建造者） | 2026-06-27 |

---

## 四、 當前狀態

| 階段 | 狀態 | 備註 |
|:---|:---|:---|
| 01 規劃 | ✅ 完成 | 10 項需求全追溯 |
| 02 設計 | ✅ 完成 | 7 項標準產出 |
| 03 開發 | ✅ 完成 | app.py + 3 templates |
| 04 測試 | ✅ 完成 | 14/14 PASS |
| 05 部署 | ✅ 完成 | run.bat 可一鍵啟動 |
| 06 監控 | ✅ 完成 | 日誌機制就緒 |

### 下一步建議
- 啟動 App 測試：`cd 03_implementation_and_coding/outputs && python app.py`
- 瀏覽器開啟 `http://127.0.0.1:5000`
- 如需接續開發，從 Stage 01 reg/requirement_tracker.md 確認需求狀態

---

## 五、 Git 版本歷程

| Tag | 說明 |
|:---|:---|
| baseline-v0.1.0 | @init 初始化 |
| baseline-v0.1.1 | 全流程開發完成 |
| baseline-v0.1.2 | UML .md 格式 + logs 驗證 |
| baseline-v0.2.0 | traceability + system_spec 根目錄化 |
| baseline-v0.2.1 | Playwright UI 測試 |
| baseline-v0.2.2 | 需求/bug 統一表格化 |
| baseline-v0.3.0 | SRS IEEE 830 + 全案連結化 + @baseline |
