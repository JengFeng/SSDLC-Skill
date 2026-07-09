# 技能歸類技能 (Skill Categorizer)

本文件定義了將外部下載的技能檔案（例如來自 `anthropics/skills` 或 `github-skills`）自動歸類至安全軟體開發生命週期六階段（通稱 SSDLC）各階段與全域共用分類的標準作業流程。

## 安全軟體開發生命週期（SSDLC）階段與共用分類定義
本專案依據專案最高指導原則，將開發流程與技能管理劃分為以下六個階段與一個全域共用分類：
1. `01_planning_and_analysis` (第一階段：規劃與需求分析)
2. `02_system_design` (第二階段：系統設計)
3. `03_implementation_and_coding` (第三階段：開發與編碼)
4. `04_testing` (第四階段：測試驗證)
5. `05_deployment` (第五階段：部署發布)
6. `06_maintenance` (第六階段：維護與營運)
7. `00_cross_phase` (跨階段全域共用)

## 技能分類規則與映射表

### 1. 01_planning_and_analysis
* **適用技能**：需求場景拆解、訪談整理、文件結構化、通用文件處理、增強版文檔技能合集與靜態文檔建置。
* **技能清單**：`langchain`、`llamaindex`、`docling`、`docusaurus`、`doc-coauthoring`、`internal-comms`、`docx`、`xlsx` / `pdf` / `pptx`、`document-skills`（docx/pdf/pptx/xlsx 增強合集）。

### 2. 02_system_design
* **適用技能**：架構圖、流程圖、UML 圖表、資料庫設計、API 規格產生以及前端視覺色彩規範。
* **技能清單**：`mermaid`、`plantuml`、`prisma`、`openapi_generator`、`frontend-design`、`theme-factory`、`brand-guidelines`、`canvas-design`、`algorithmic-art`、`slack-gif-creator`、`brand`、`design`、`design-system`、`ui-styling`、`banner-design`。

### 3. 03_implementation_and_coding
* **適用技能**：AI 輔助寫碼、本地編譯、代碼規格語法與排版檢核、多模組整合管理。
* **技能清單**：`continue_dev`、`codellama`、`eslint`、`prettier`、`nx`、`web-artifacts-builder`、`mcp-builder`、`claude-api`、`skill-creator`、`code-simplifier`、`ui-styling`。

### 4. 04_testing
* **適用技能**：單元測試、前後端驗證、UI 自動化測試、API 與 Web 服務之 Schema 驗證、單機應用程式 UI 測試、安全漏洞靜態掃描與覆蓋率分析。
* **技能清單**：`playwright`、`selenium`、`cypress`、`robot_framework`、`pytest`、`jest`、`sonarqube`、`coverage_py`、`webapp-testing`、`systematic-debugging`。

### 5. 05_deployment
* **適用技能**：成品建置與打包、組態管理配置、遠端批次部署與反向代理組態生成。
* **技能清單**：`docker`、`ansible`、`nginx_config_generator`。

### 6. 06_maintenance
* **適用技能**：線上故障分析、進程異常修復、運行日誌收集與格式化、指標監控告警。
* **技能清單**：`elk_stack`、`prometheus_grafana`、`opentelemetry`、`logparser`。

### 7. 00_cross_phase
* **適用技能**：跨階段全域共用技能，用於腦力激盪、自主迭代研究、TDD 測試驅動開發、計畫撰寫、網頁資料擷取、完成前驗證、複雜多 Agent 協作工作流、版本控制、程式碼差異比對以及跨格式文件轉 Markdown。
* **技能清單**：`langgraph`、`git`、`diffsync`、`autoresearch`、`brainstorming`、`firecrawl`、`test-driven-development`、`verification-before-completion`、`writing-plans`、`ralph-loop`、`using-superpowers`、`llm-council`、`ui-ux-pro-max`、`slides`、`markitdown`。

## 執行步驟 SOP（完整版）

當新增外部 Skill 時，AI 代理必須依序執行以下全部步驟。本 SOP 設計為可被 AI 代理自主讀取並執行，無需人類逐步驟引導。

### 步驟 0：前置準備 — 掃描並讀取新 Skill

1. **掃描 `external-resources/`**：列出所有尚未歸類至 `skills/` 的外部技能目錄。
2. **讀取每個新 Skill 的 `SKILL.md`**：取得其 YAML frontmatter 中的 `name`、`description` 欄位，以及內文中的「When to Use / When to Apply」章節（若有），以理解技能核心用途。

### 步驟 1：階段歸類判斷（核心邏輯）

對每個新 Skill，依序比對以下規則以決定歸屬階段。若一個技能同時符合多個階段的條件，則應歸入所有符合的階段（雙歸屬或多歸屬）。

#### 1.1 關鍵字比對法

讀取 Skill 的 `description` 與 `SKILL.md` 內文，與各階段的「**適用技能**」描述進行語意比對：

| 階段 | 比對關鍵字（含中英文） | 典型技能範例 |
|:---|:---|:---|
| `01_planning_and_analysis` | 需求/requirement、文件/document、訪談/interview、提案/proposal、RFP、結構化/structured | langchain, docling, docx |
| `02_system_design` | 設計/design、架構/architecture、圖/diagram、UI/前端視覺、配色/color、字型/typography、API 規格、DB/Schema、UML、ER | mermaid, prisma, frontend-design |
| `03_implementation_and_coding` | 開發/implementation、程式碼/code、編譯/compile、語法/lint、格式化/format、組件/component、Tailwind、shadcn | eslint, prettier, continue_dev |
| `04_testing` | 測試/test、QA、驗證/verify、除錯/debug、覆蓋率/coverage、掃描/scan | playwright, pytest, sonarqube |
| `05_deployment` | 部署/deploy、打包/build/package、容器/docker、伺服器/server、上架/publish | docker, ansible |
| `06_maintenance` | 監控/monitor、日誌/log、維運/ops、告警/alert、熱修/hotfix、BCP | elk_stack, prometheus |
| `00_cross_phase` | 通用/universal、跨階段/cross-phase、全域/global、簡報/slides、知識庫/knowledge-base、搜尋引擎/search | git, brainstorming, ui-ux-pro-max |

#### 1.2 全域性判斷（是否歸入 00_cross_phase）

技能應**同時**歸入 `00_cross_phase` 的條件（滿足任一即歸入）：
- ✅ 技能在多個 SSDLC 階段有明確使用場景（≥3 個階段）
- ✅ 技能的核心功能不依賴特定階段的上下文（如設計知識庫、簡報工具）
- ✅ 技能為其他多個技能的基礎依賴（如 `ui-ux-pro-max` 被 `banner-design` 依賴）
- ✅ 技能為通用文書/查詢/搜尋工具

#### 1.3 雙歸屬判斷

若技能同時滿足：
- 一個特定階段的分類條件（如 02 的前端視覺設計）
- 且也滿足另一個階段的實作條件（如 03 的 Tailwind 組件開發）

則該技能應**同時複製到兩個階段目錄**，並在 README 中標註「🌐 雙歸屬」。

#### 1.4 相依性檢查

若 Skill 的 `description` 或內文中明確宣告依賴其他技能（如 `Uses ui-ux-pro-max`），則：
- 被依賴的技能應優先歸入 `00_cross_phase`（作為基礎層）
- 依賴方技能在 README 中必須標註 `⚠️ 依賴 <skill-name>`

### 步驟 2：複製技能至 skills/ 目錄

1. **建立目標目錄**：若 `skills/<phase>/` 下尚無該技能目錄，則建立之。
2. **複製完整內容**：將外部資源中的技能目錄（含 `SKILL.md`、`references/`、`templates/` 等）完整複製到 `skills/<phase>/<skill-name>/`。
3. **雙歸屬處理**：若判定為雙歸屬，則同時複製到兩個階段目錄。

### 步驟 3：更新 skills/README.md

本步驟須更新兩部分：**開頭摘要段落** 與 **各階段技能條目**。兩者皆不可遺漏。

#### 3-A. 更新開頭摘要段落（第一段）

`skills/README.md` 開頭段落為全文件的總覽摘要，每次新增 Skill 後必須同步更新以下全部欄位：

1. **來源細項統計數字**：`Anthropic 官方（N）、GitHub 社群（N）、Anthropic 官方插件（N）` → 根據實際新增的 Skill 來源遞增對應數字。
2. **技能總數**：`共 N 個獨立 Skill` → 遞增總數。
3. **雙歸屬技能清單與計數**：`其中 <skill-A>/<skill-B>/... 等 N 個具跨階段通用性` → 若新增了雙歸屬技能，必須在此列出技能名稱並更新計數。格式範例：`其中 docx/pdf/xlsx/pptx/file-organizer 等 5 個具跨階段通用性，ui-styling 同時歸類於 Phase 02 與 Phase 03，共計 6 個雙歸屬 Skill`。
4. **新增技能群組摘要**（若有）：若新增的技能來自同一個來源套件（如 UI/UX Pro Max 7 個子技能），應在開頭段落中簡述。格式範例：`本次新增 nextlevelbuilder/ui-ux-pro-max-skill（MIT v2.6.2）之 7 個設計智慧技能，歸入 Phase 00/02/03`。

#### 3-B. 在各階段區塊下新增技能條目

在 `skills/README.md` 中對應的階段區塊下：

1. **若該來源類別尚無子標題**：建立新子標題（如 `### UI/UX Pro Max 設計智慧技能 (N)`）。
2. **新增技能條目**：依現有格式新增，包含：
   - 可點擊的本機路徑連結（`skills/<phase>/<skill-name>`）
   - 技能功能用途描述
   - 來源出處（**本機外部資源目錄** + **原始 GitHub 倉庫**）
   - 路徑規則：從 `skills/README.md` 出發，所有連結必須使用 repo-root 相對路徑；技能連結使用 `skills/<phase>/<skill-name>`，本機外部資源連結使用 `../external-resources/...`，跨目錄文件連結使用 `../docs/...` 或 `../.agents/...`，嚴禁使用 Windows 絕對路徑或 `file:///`。
   - 若有雙歸屬，加註 `🌐 雙歸屬（Phase XX + Phase YY）`
   - 若有依賴，加註 `⚠️ 依賴 <skill-name>`
3. **順序編號**：若該條目有快捷編號（如 `[[13] ui-ux-pro-max]`），確保編號與 `00_cross_phase/SKILL.md` 中的快捷編號一致。

### 步驟 4：更新 SKILLS歸類.md（本檔案）

1. **在對應階段的「技能清單」中新增技能名稱**，格式為 `` `skill-name` ``，用 `、` 分隔。
2. **若新增了新的「適用技能」類型描述**（例如之前沒有的設計智慧搜尋），更新該階段的「適用技能」描述。

### 步驟 5：更新根 README.md

1. **更新 Skill 總數**：搜尋並替換所有 Skill 總數（如 88→95），包含：
   - Banner 行
   - 專案概述段
   - 來源統計段（GitHub 社群 N 個）
   - 倉庫結構段
2. **評估上下文感知推薦表**：檢查「## 🧠 上下文感知 Skill 推薦對照表」，判斷新 Skill 是否需要加入：
   - 新 Skill 的使用場景是否為高頻操作？
   - 新 Skill 是否填補了推薦表中的空白情境？
   - 若符合條件，在對應階段新增推薦條目（含情境關鍵詞、Skill 名稱、簡短說明）
3. **更新近期更新記錄**：在 README.md 底部的新增記錄中加入此次 Skill 導入摘要。

### 步驟 6：最終一致性驗證

1. **三檔交叉驗證**：確保以下三處數字一致：
   - 根 `README.md` 的總數
   - `skills/README.md` 開頭段落的總數
   - 實際 `skills/` 目錄下 SKILL.md 的唯一數量（`Get-ChildItem -Recurse -Filter SKILL.md | Group-Object DirectoryName` 扣除雙歸屬重複）
2. **執行對齊架構檢查**：執行 `@optimize`（Harness Optimization）進行全案關聯性檢查。
3. **執行規格完整性檢查**：執行 `python scripts/check_spec_integrity.py --mode B`。
