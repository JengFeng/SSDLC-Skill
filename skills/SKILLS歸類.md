# 技能歸類技能 (Skill Categorizer)

本文件定義了將外部下載的技能檔案（例如來自 `anthropics/skills`、`Benson-skill` 或 `github-skills`）自動歸類至安全軟體開發生命週期六階段（通稱 SSDLC）各階段與全域共用分類的標準作業流程。

## 安全軟體開發生命週期（SSDLC）階段與共用分類定義
本專案依據專案最高指導原則，將開發流程與技能管理劃分為以下六個階段與一個全域共用分類：
1. `01_planning_and_analysis` (第一階段：規劃與需求分析)
2. `02_system_design` (第二階段：系統設計)
3. `03_implementation_and_coding` (第三階段：開發與編碼)
4. `04_testing` (第四階段：測試驗證)
5. `05_deployment` (第五階段：部署發布)
6. `06_maintenance` (第六階段：維護監控)
7. `00_cross_phase` (跨階段全域共用)

## 技能分類規則與映射表

### 1. 01_planning_and_analysis
* **適用技能**：需求場景拆解、訪談整理、文件結構化、通用文件處理與靜態文檔建置。
* **技能清單**：`langchain`、`llamaindex`、`docling`、`docusaurus`、`doc-coauthoring`、`internal-comms`、`docx`、`xlsx` / `pdf` / `pptx`。

### 2. 02_system_design
* **適用技能**：架構圖、流程圖、UML 圖表、資料庫設計、API 規格產生以及前端視覺色彩規範。
* **技能清單**：`mermaid`、`plantuml`、`prisma`、`openapi_generator`、`frontend-design`、`theme-factory`、`brand-guidelines`、`canvas-design`、`algorithmic-art`、`slack-gif-creator`。

### 3. 03_implementation_and_coding
* **適用技能**：AI 輔助寫碼、本地編譯、代碼規格語法與排版檢核、多模組整合管理。
* **技能清單**：`continue_dev`、`codellama`、`eslint`、`prettier`、`nx`、`web-artifacts-builder`、`mcp-builder`、`claude-api`、`skill-creator`。

### 4. 04_testing
* **適用技能**：單元測試、前後端驗證、UI 自動化測試、API 與 Web 服務之 Schema 驗證、單機應用程式 UI 測試、安全漏洞靜態掃描與覆蓋率分析。
* **技能清單**：`playwright`、`selenium`、`cypress`、`robot_framework`、`pytest`、`jest`、`sonarqube`、`coverage_py`、`webapp-testing`、`systematic-debugging`。

### 5. 05_deployment
* **適用技能**：成品建置與打包、組態管理配置、遠端批次部署與反向代理組態生成。
* **技能清單**：`docker`、`ansible`、`nginx_config_generator`。

### 6. 06_maintenance
* **適用技能**：線上故障分析、進程異常修復、運行日誌收集與格式化、指標監控告警。
* **技能清單**：`elk_stack`、`prometheus_grafana`、`opentelemetry`、`logparser`、`isms-audit-prep`、`eip-line-radar`。

### 7. 00_cross_phase
* **適用技能**：跨階段全域共用技能，用於腦力激盪、自主迭代研究、TDD 測試驅動開發、計畫撰寫、網頁資料擷取、完成前驗證、複雜多 Agent 協作工作流、版本控制以及程式碼差異比對。
* **技能清單**：`langgraph`、`git`、`diffsync`、`autoresearch`、`brainstorming`、`firecrawl`、`test-driven-development`、`verification-before-completion`、`writing-plans`。

## 執行步驟 SOP

當觸發此技能時，請執行以下步驟：
1. **建立目錄結構**：若 `skills/` 目錄下尚未建立上述六個開發階段與全域共用子資料夾（`00_cross_phase`），請使用指令建立它們。
2. **複製並歸類檔案**：將外部資源資料夾（如 `external-resources/github-skills/<分類>/`）中的各技能資料夾，複製到 `skills/` 下對應的子資料夾中。
3. **加註來源並更新索引表**：
   * 在 [skills/README.md](file:///d:/00AI協作/SSDLC_Skill/skills/README.md) 中，列出各開發階段與全域共用分類的標題與其下的技能。
   * 每個技能皆須提供其功能用途說明。
   * 每個技能皆須加註其來源出處，包含 **[本機外部資源目錄]** 與 **[原始 GitHub 倉庫]** 的連結。
   * 本機外部資源目錄格式範例：`file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/00_cross_phase/<skill-name>`
   * 原始 GitHub 倉庫格式範例：`https://github.com/langchain-ai/langgraph`
