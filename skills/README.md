# 軟體開發流程技能目錄索引表

本目錄依據 [TEMPLATE_SKILL.md](../docs/TEMPLATE_SKILL.md) 所定義的 安全軟體開發生命週期六階段（通稱 SSDLC），將 Anthropic 官方（17）、GitHub 社群（48）、Anthropic 官方插件（2）等來源之技能（共 95 個獨立 Skill，其中 docx/pdf/xlsx/pptx/minimax-pdf/minimax-docx/minimax-xlsx/pptx-generator 等 8 個具跨階段通用性，ui-styling 與 open-design 同時歸類於 Phase 02 與 Phase 03，共計 13 個雙歸屬 Skill，markitdown（MIT）歸入 Phase 00 跨格式文件轉 Markdown 工具）進行結構化分類，並加註其原始來源以方便追溯。各階段與其包含的技能說明如下：

---

## 1. 規劃與需求分析
本階段技能用於專案初期的需求釐清、文件協作、數據處理、提案報價與內部資訊傳遞。


*   **[[73] reverse_engineering](00_cross_phase/reverse_engineering/SKILL.md)**：對指定舊專案按 Phase 03→02→01 唯讀蒐證，再回灌專案根正向 Phase 01 SSOT，依人工核准與階段關卡推進 Phase 02→06。六個子 Skill 分別處理程式、設計、需求、測試、部署與維運；後三者的靜態盤點不算執行驗證。
    *   **追溯來源**：本專案自行設計（2026-08-07）
    *   **指令**：@reverse [專案路徑]、@reverse-code、@reverse-design、@reverse-requirements
    *   **口語觸發**：「逆向分析這個專案」「從程式碼反推需求」「還原舊專案文件」

### Anthropic 官方技能 (6)
* **[[01] doc-coauthoring](skills/01_planning_and_analysis/doc-coauthoring)**：文件協同撰寫引導。提供結構化工作流以協同撰寫提案、規格書或決策文件。
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/doc-coauthoring) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring)
* **[[02] internal-comms](skills/01_planning_and_analysis/internal-comms)**：內部溝通撰寫資源。提供狀態報告、事件報告及專案更新等內部通訊文件格式。
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/internal-comms) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/internal-comms)
* **[[03] docx](skills/01_planning_and_analysis/docx)**：Word 文件處理。讀取、編輯、操作與排版 `.docx` 檔案。 🌐 通用

  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/docx) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/docx)
* **[[04] xlsx](skills/01_planning_and_analysis/xlsx)**：Excel 試算表處理。進行資料分析、公式計算、格式化與表格清洗。 🌐 通用

  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/xlsx) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/xlsx)
* **[[05] pdf](skills/01_planning_and_analysis/pdf)**：PDF 處理與 OCR。支援 PDF 檔案的拆合、表單填寫與 OCR 文字提取。 🌐 通用

  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/pdf) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/pdf)
* **[[06] pptx](skills/01_planning_and_analysis/pptx)**：投影片與簡報製作。建立與編輯簡報投影片。 🌐 通用

  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/pptx) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/pptx)

---


### GitHub 推薦開源工具技能 (4)
* **[[07] langchain](skills/01_planning_and_analysis/langchain)**：需求場景拆解、語意整理與鏈式呼叫工具。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/01_planning_and_analysis/langchain) / [原始 GitHub 倉庫](https://github.com/langchain-ai/langchain)
* **[[08] llamaindex](skills/01_planning_and_analysis/llamaindex)**：文件數據索引萃取與關鍵需求擷取工具。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/01_planning_and_analysis/llamaindex) / [原始 GitHub 倉庫](https://github.com/run-llama/llama_index)
* **[[09] docling](skills/01_planning_and_analysis/docling)**：各式複雜文件（PDF, Word等）轉換為標準 Markdown 格式工具。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/01_planning_and_analysis/docling) / [原始 GitHub 倉庫](https://github.com/DS4SD/docling)
* **[[10] docusaurus](skills/01_planning_and_analysis/docusaurus)**：需求文件靜態版本網站建置與版本化管理。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/01_planning_and_analysis/docusaurus) / [原始 GitHub 倉庫](https://github.com/facebook/docusaurus)


### GitHub 推薦開源文檔技能合集 (1)
* **[[11] document-skills](skills/01_planning_and_analysis/document-skills)**：增強版文件處理技能合集，涵蓋 docx、pdf、pptx、xlsx 四種格式的進階操作、OOXML 底層編輯、HTML 轉換與試算表重算。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/01_planning_and_analysis/document-skills) / [原始 GitHub 倉庫](https://github.com/appautomaton/document-SKILLs)

## 2. 系統設計
本階段技能用於前端 UI 原型設計、配色、品牌風格套用、系統分析（SA/SD）設計與簡報與提案影音輔助。

### Anthropic 官方技能 (6)
* **[[12] frontend-design](skills/02_system_design/frontend-design)**：前端 UI 視覺設計引導。協助規劃字型排版與視覺方向，避免模板化設計。
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/frontend-design) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/frontend-design)
* **[[13] theme-factory](skills/02_system_design/theme-factory)**：配色主題工具。提供 10 種預設配色與字型主題，可套用至簡報、網頁或文件。
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/theme-factory) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/theme-factory)
* **[[14] brand-guidelines](skills/02_system_design/brand-guidelines)**：品牌色彩規範。套用 Anthropic 官方配色與字型等設計標準。
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/brand-guidelines) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/brand-guidelines)
* **[[15] canvas-design](skills/02_system_design/canvas-design)**：靜態視覺與海報設計。用於建立高品質的 PNG 與 PDF 靜態藝術海報。
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/canvas-design) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/canvas-design)
* **[[16] algorithmic-art](skills/02_system_design/algorithmic-art)**：演算法藝術生成。使用 p5.js 與隨機參數生成互動式視覺藝術。
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/algorithmic-art) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/algorithmic-art)
* **[[17] slack-gif-creator](skills/02_system_design/slack-gif-creator)**：動畫 GIF 產生器。製作與驗證適用於 Slack 的動態 GIF 規格。
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/slack-gif-creator) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/slack-gif-creator)

---


### GitHub 推薦開源工具技能 (4)
* **[[18] mermaid](skills/02_system_design/mermaid)**：以文字繪製專案流程圖、系統架構圖與狀態圖。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/02_system_design/mermaid) / [原始 GitHub 倉庫](https://github.com/mermaid-js/mermaid)
* **[[19] plantuml](skills/02_system_design/plantuml)**：產生精確 UML 類別圖、序列圖與部署圖的標準設計工具。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/02_system_design/plantuml) / [原始 GitHub 倉庫](https://github.com/plantuml/plantuml)
* **[[20] prisma](skills/02_system_design/prisma)**：資料庫實體關係圖 (ER Model)、Schema 與 SQL DDL 產生工具。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/02_system_design/prisma) / [原始 GitHub 倉庫](https://github.com/prisma/prisma)
* **[[21] openapi_generator](skills/02_system_design/openapi_generator)**：自動產生符合 OpenAPI 規格的 API 文件與介面程式碼。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/02_system_design/openapi_generator) / [原始 GitHub 倉庫](https://github.com/OpenAPITools/openapi-generator)


### UI/UX Pro Max 設計智慧技能 (5)
* **[[22] brand](skills/02_system_design/brand)**：品牌識別指南 — 品牌聲音 / 視覺識別 / 訊息框架 / 資產管理 / 一致性檢查。內含 11 份參考文件與品牌模板。
  * **追溯來源**：[本機外部資源目錄](../external-resources/ui-ux-pro-max-skill/.claude/skills/brand) / [原始 GitHub 倉庫](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
* **[[23] design](skills/02_system_design/design)**：通用設計工具包 — Logo 設計（55 風格）/ CIP 企業識別（50 交付物）/ 圖示設計 / 社群素材。
  * **追溯來源**：[本機外部資源目錄](../external-resources/ui-ux-pro-max-skill/.claude/skills/design) / [原始 GitHub 倉庫](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
* **[[24] design-system](skills/02_system_design/design-system)**：Design Token 架構 — 三層 token（primitive→semantic→component）/ CSS 變數 / 元件規格 / Tailwind 整合。
  * **追溯來源**：[本機外部資源目錄](../external-resources/ui-ux-pro-max-skill/.claude/skills/design-system) / [原始 GitHub 倉庫](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
* **[[25] ui-styling](skills/02_system_design/ui-styling)**：前端樣式參考 — shadcn/ui 元件 / Tailwind CSS / 響應式佈局 / 暗色模式 / 無障礙組件。 🌐 雙歸屬（Phase 02 設計規範 + Phase 03 實作落地）
  * **追溯來源**：[本機外部資源目錄](../external-resources/ui-ux-pro-max-skill/.claude/skills/ui-styling) / [原始 GitHub 倉庫](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
* **[[26] banner-design](skills/02_system_design/banner-design)**：多格式橫幅設計 — 22 風格 / 社群+廣告+網頁+印刷 / AI 生成視覺素材。 ⚠️ 依賴 ui-ux-pro-max
  * **追溯來源**：[本機外部資源目錄](../external-resources/ui-ux-pro-max-skill/.claude/skills/banner-design) / [原始 GitHub 倉庫](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)

* **[[27] awesome-design-md](skills/02_system_design/awesome-design-md)**：AI 設計系統文件集合 — 73+ 網站 DESIGN.md，涵蓋色彩/字型/組件/佈局/響應式設計規範。
  * **追溯來源**：[本機外部資源目錄](../external-resources/awesome-design-md) / [原始 GitHub 倉庫](https://github.com/VoltAgent/awesome-design-md)
* **[[28] open-design](skills/02_system_design/open-design)**：AI 設計引擎 Skill 合集 — 150+ Skill，前端/UI/動畫/影片/簡報/PDF/品牌/3D。 🌐 雙歸屬（Phase 02 系統設計 + Phase 03 開發實作）
  * **追溯來源**：[本機外部資源目錄](../external-resources/open-design) / [原始 GitHub 倉庫](https://github.com/nexu-io/open-design)

## 3. 開發與編碼
本階段技能用於開發任務管理、程式碼實作、MCP 伺服器建置、API 規格查詢與自訂技能管理。

### Anthropic 官方技能 (4)
* **[[27] web-artifacts-builder](skills/03_implementation_and_coding/web-artifacts-builder)**：網頁應用建置。使用 React、Tailwind CSS 與 shadcn/ui 設計多組件的前端應用。
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/web-artifacts-builder) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/web-artifacts-builder)
* **[[28] mcp-builder](skills/03_implementation_and_coding/mcp-builder)**：MCP 伺服器建置。使用 Python 或 Node.js/TypeScript 開發 Model Context Protocol 伺服器以對接外部服務。
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/mcp-builder) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/mcp-builder)
* **[[29] claude-api](skills/03_implementation_and_coding/claude-api)**：Claude API 整合指引。提供 API 參數、計價、Tokens 計算與快取的參考手冊。
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/claude-api) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/claude-api)
* **[[30] skill-creator](skills/03_implementation_and_coding/skill-creator)**：AI 技能開發。建立新技能、測試與優化 SKILL.md 的觸發精準度。
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/skill-creator) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/skill-creator)

---


### GitHub 推薦開源工具技能 (5)
* **[[31] continue_dev](skills/03_implementation_and_coding/continue_dev)**：本機 AI 輔助寫碼、語境理解與程式產生套件。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/03_implementation_and_coding/continue_dev) / [原始 GitHub 倉庫](https://github.com/continuedev/continue)
* **[[32] codellama](skills/03_implementation_and_coding/codellama)**：本地離線代碼編譯、語法生成與程式碼自動補全核心。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/03_implementation_and_coding/codellama) / [原始 GitHub 倉庫](https://github.com/facebookresearch/codellama)
* **[[33] eslint](skills/03_implementation_and_coding/eslint)**：代碼語法與靜態邏輯檢核，維護團隊代碼品質。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/03_implementation_and_coding/eslint) / [原始 GitHub 倉庫](https://github.com/eslint/eslint)
* **[[34] prettier](skills/03_implementation_and_coding/prettier)**：代碼風格美化與自動格式化，避免排版衝突。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/03_implementation_and_coding/prettier) / [原始 GitHub 倉庫](https://github.com/prettier/prettier)
* **[[35] nx](skills/03_implementation_and_coding/nx)**：大型專案多模組與依賴關係的整合管控工具。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/03_implementation_and_coding/nx) / [原始 GitHub 倉庫](https://github.com/nrwl/nx)


### Anthropic 官方插件技能 (2)
* **[[36] code-simplifier](skills/03_implementation_and_coding/code-simplifier)**：程式碼簡化與精煉。在保留所有功能的前提下，提升程式碼清晰度、一致性與可維護性。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/03_implementation_and_coding/code-simplifier) / [原始 GitHub 倉庫](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-simplifier)

### UI/UX Pro Max 前端實作技能 (1)
* **[[37] ui-styling](skills/03_implementation_and_coding/ui-styling)**：前端樣式落地實作 — shadcn/ui 元件開發 / Tailwind CSS 工具類 / 響應式佈局 / 暗色模式實作。 🌐 雙歸屬（Phase 02 設計規範 + Phase 03 實作落地）
  * **追溯來源**：[本機外部資源目錄](../external-resources/ui-ux-pro-max-skill/.claude/skills/ui-styling) / [原始 GitHub 倉庫](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)

* **[[38] open-design](skills/03_implementation_and_coding/open-design)**：AI 設計引擎 Skill 合集 — 150+ Skill，前端/UI/動畫/影片/簡報/PDF/品牌/3D。 🌐 雙歸屬（Phase 02 系統設計 + Phase 03 開發實作）
  * **追溯來源**：[本機外部資源目錄](../external-resources/open-design) / [原始 GitHub 倉庫](https://github.com/nexu-io/open-design)

## 4. 測試驗證
本階段技能用於前端功能自動化測試、後端功能驗證、API 與資安漏洞掃描。

### Anthropic 官方技能 (1)
* **[[38] webapp-testing](skills/04_testing/webapp-testing)**：網頁應用測試。利用 Playwright 對本機應用程式進行自動化 UI 驗證、除錯與截圖。
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/webapp-testing) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/webapp-testing)

---


### GitHub 推薦開源工具技能 (9)
* **[[39] playwright](skills/04_testing/playwright)**：主流 UI 自動化測試與跨瀏覽器兼容性回歸測試套件。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/04_testing/playwright) / [原始 GitHub 倉庫](https://github.com/microsoft/playwright)
* **[[40] selenium](skills/04_testing/selenium)**：傳統網頁與多瀏覽器的自動化測試與兼容性回歸測試工具。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/04_testing/selenium) / [原始 GitHub 倉庫](https://github.com/SeleniumHQ/selenium)
* **[[41] cypress](skills/04_testing/cypress)**：前端單頁面應用 (SPA) 的快速自動化回歸測試框架。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/04_testing/cypress) / [原始 GitHub 倉庫](https://github.com/cypress-io/cypress)
* **[[42] robot_framework](skills/04_testing/robot_framework)**：基於關鍵字驅動的通用自動化測試與驗收框架。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/04_testing/robot_framework) / [原始 GitHub 倉庫](https://github.com/robotframework/robotframework)
* **[[43] pytest](skills/04_testing/pytest)**：Python 單元測試與多功能測試驗證框架。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/04_testing/pytest) / [原始 GitHub 倉庫](https://github.com/pytest-dev/pytest)
* **[[44] jest](skills/04_testing/jest)**：JavaScript / TypeScript 的單元測試與 Mock 驗證工具。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/04_testing/jest) / [原始 GitHub 倉庫](https://github.com/jestjs/jest)
* **[[45] sonarqube](skills/04_testing/sonarqube)**：專案原始碼安全漏洞、壞味道與代碼品質靜態掃描。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/04_testing/sonarqube) / [原始 GitHub 倉庫](https://github.com/SonarSource/sonarqube)
* **[[46] coverage_py](skills/04_testing/coverage_py)**：Python 測試覆蓋率分析與未涵蓋代碼報告器。
* **[[47] systematic-debugging](skills/04_testing/systematic-debugging)**：系統化除錯方法。在遇到任何 bug、測試失敗或非預期行為時，於提出修復方案之前先進行根因分析。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/04_testing/systematic-debugging) / [原始 GitHub 倉庫](https://github.com/obra/superpowers)
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/04_testing/coverage_py) / [原始 GitHub 倉庫](https://github.com/nedbat/coveragepy)


## 5. 部署發布
本階段技能用於自動化建置、寫入數位簽章與部署環境型態比對。
* *(目前尚無對應技能 - 待擴充)*

---


### GitHub 推薦開源工具技能 (3)
* **[[48] docker](skills/05_deployment/docker)**：容器化服務打包、鏡像製作與多服務 Docker Compose 部署。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/05_deployment/docker) / [原始 GitHub 倉庫](https://github.com/docker/docker-ce)
* **[[49] ansible](skills/05_deployment/ansible)**：伺服器自動化組態管理、主機配置與遠端批次部署。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/05_deployment/ansible) / [原始 GitHub 倉庫](https://github.com/ansible/ansible)
* **[[50] nginx_config_generator](skills/05_deployment/nginx_config_generator)**：Web 伺服器反向代理與負載平衡組態檔自動產生器。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/05_deployment/nginx_config_generator) / [原始 GitHub 倉庫](https://github.com/nginx/nginx)


## 6. 維護與營運
本階段技能用於系統上線後的資安內部稽核準備，以及線上運行訊號與討論輿情監控。

### GitHub 推薦開源工具技能 (4)
* **[[51] elk_stack](skills/06_maintenance/elk_stack)**：線上日誌集中化收集、Elasticsearch 檢索與日誌異常分析。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/06_maintenance/elk_stack) / [原始 GitHub 倉庫](https://github.com/elastic/elasticsearch)
* **[[52] prometheus_grafana](skills/06_maintenance/prometheus_grafana)**：系統硬體指標與服務效能監控、即時 Grafana 圖表告警機制。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/06_maintenance/prometheus_grafana) / [原始 GitHub 倉庫](https://github.com/prometheus/prometheus)
* **[[53] opentelemetry](skills/06_maintenance/opentelemetry)**：雲原生 APM 效能瓶頸、調用鏈分佈式追蹤系統。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/06_maintenance/opentelemetry) / [原始 GitHub 倉庫](https://github.com/open-telemetry/opentelemetry-specification)
* **[[54] logparser](skills/06_maintenance/logparser)**：雜亂日誌自動清理、正則篩選與格式化輸出分析。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/06_maintenance/logparser) / [原始 GitHub 倉庫](https://github.com/Microsoft/LogParser-Studio-References)

## 跨階段全域共用 Skill
本階段 Skill 涵蓋跨階段通用工具（版本控制、多 Agent 協作、文件產製、TDD 流程等），適用於所有 SSDLC 開發階段。


### 文件產製類通用 Skill（5）— 同時歸類於 Phase 01 規劃與需求分析

> 以下 Skill 具備跨階段通用性，可在任一 SSDLC 階段選用。於 Phase 01 中亦保留原位，不影響既有流程。

* **[[55] docx](skills/00_cross_phase/docx)**：Word 文件處理。讀取、編輯、操作與排版 `.docx` 檔案。🌐 通用
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/docx) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/docx)

* **[[56] xlsx](skills/00_cross_phase/xlsx)**：Excel 試算表處理。進行資料分析、公式計算、格式化與表格清洗。🌐 通用
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/xlsx) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/xlsx)

* **[[57] pdf](skills/00_cross_phase/pdf)**：PDF 處理與 OCR。支援 PDF 檔案的拆合、表單填寫與 OCR 文字提取。🌐 通用
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/pdf) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/pdf)

* **[[58] pptx](skills/00_cross_phase/pptx)**：投影片與簡報製作。建立與編輯簡報投影片。🌐 通用
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/pptx) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/pptx)

### GitHub 推薦開源工具技能 (11)

* **[[59] langgraph](skills/00_cross_phase/langgraph)**：複雜狀態多 Agent 協作工作流的圖形狀態管理引擎。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/00_cross_phase/langgraph) / [原始 GitHub 倉庫](https://github.com/langchain-ai/langgraph)
* **[[60] git](skills/00_cross_phase/git)**：全域版本控制、分支管理與 Baseline 基線封存追溯工具。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/00_cross_phase/git) / [原始 GitHub 倉庫](https://github.com/git/git)
* **[[61] diffsync](skills/00_cross_phase/diffsync)**：跨階段專案原始碼版本差異對比與同步工具。
* **[[62] autoresearch](skills/00_cross_phase/autoresearch)**：自主目標導向迭代循環。自動修改、驗證、保留/丟棄，針對任意指標進行最佳化，靈感來自 Karpathy。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/00_cross_phase/autoresearch) / [原始 GitHub 倉庫](https://github.com/uditgoenka/autoresearch)
* **[[63] brainstorming](skills/00_cross_phase/brainstorming)**：創意發想引導。在任何創意工作前探索使用者意圖、需求與設計方向。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/00_cross_phase/brainstorming) / [原始 GitHub 倉庫](https://github.com/obra/superpowers)
* **[[64] firecrawl](skills/00_cross_phase/firecrawl)**：網頁內容擷取、截圖、結構化資料提取、網頁搜尋與文件網站爬蟲。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/00_cross_phase/firecrawl) / [原始 GitHub 倉庫](https://github.com/BexTuychiev/firecrawl-claude-code-skill)
* **[[65] test-driven-development](skills/00_cross_phase/test-driven-development)**：測試驅動開發流程。在撰寫實作程式碼之前先寫測試。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/00_cross_phase/test-driven-development) / [原始 GitHub 倉庫](https://github.com/obra/superpowers)
* **[[66] verification-before-completion](skills/00_cross_phase/verification-before-completion)**：完成前驗證。在聲稱工作完成、修復或通過之前執行驗證命令並確認輸出。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/00_cross_phase/verification-before-completion) / [原始 GitHub 倉庫](https://github.com/obra/superpowers)
* **[[67] writing-plans](skills/00_cross_phase/writing-plans)**：撰寫實作計畫。在接觸程式碼之前，先制定多步驟任務的規格與需求。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/00_cross_phase/writing-plans) / [原始 GitHub 倉庫](https://github.com/obra/superpowers)
* **[[68] ralph-loop](skills/00_cross_phase/ralph-loop)**：自主 AI 開發循環。自動化修改→測試→驗證→保留/丟棄的迭代流程，具備智慧退出偵測。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/00_cross_phase/ralph-loop) / [原始 GitHub 倉庫](https://github.com/frankbria/ralph-claude-code)
* **[[69] using-superpowers](skills/00_cross_phase/using-superpowers)**：Skill 尋找與使用引導。教導 AI 代理如何在對話中主動發現、呼叫與使用可用技能。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/00_cross_phase/using-superpowers) / [原始 GitHub 倉庫](https://github.com/obra/superpowers)





### UI/UX Pro Max 全域設計技能 (2)
* **[[70] ui-ux-pro-max](skills/00_cross_phase/ui-ux-pro-max)**：設計智慧搜尋引擎 — Python 搜尋引擎 + 14 個 CSV 資料庫（84 風格 / 161 色板 / 73 字型配對 / 99 UX 指南 / 25 圖表類型 / 17 技術棧）。支援 `product`/`style`/`typography`/`color`/`landing`/`chart`/`ux` 七大領域即時查詢。 ⚠️ 為其他 UI/UX 技能的基礎依賴。
  * **追溯來源**：[本機外部資源目錄](../external-resources/ui-ux-pro-max-skill/.claude/skills/ui-ux-pro-max) / [原始 GitHub 倉庫](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
* **[[71] slides](skills/00_cross_phase/slides)**：HTML 簡報製作 — Chart.js 資料視覺化 / 文案公式 / 版型策略 / 響應式簡報。所有階段皆可用於製作專案簡報。
  * **追溯來源**：[本機外部資源目錄](../external-resources/ui-ux-pro-max-skill/.claude/skills/slides) / [原始 GitHub 倉庫](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
* **[[72] markitdown](skills/00_cross_phase/markitdown)**：跨格式文件轉 Markdown。將 PDF/Word/PPTX/Excel/圖片/HTML/CSV/JSON/XML/ZIP/YouTube/EPub 等格式轉換為結構化 Markdown，適用於 LLM 文本分析與跨階段文件前處理。
  * **追溯來源**：[本機外部資源目錄](../external-resources/markitdown) / [原始 GitHub 倉庫](https://github.com/microsoft/markitdown)

---

## 通用性評估指南

> 後續新增 Skill 時，依以下原則判斷是否需同時歸類於跨階段全域層：

| 評估維度 | 判斷標準 | 範例 |
|:---|:---|:---|
| **多階段使用頻率** | 該 Skill 是否在 ≥3 個 SSDLC 階段有明確使用場景？ | docx：Phase 01 需求書 → 02 設計文件 → 04 測試報告 → 06 維運手冊 |
| **階段無關性** | 該 Skill 的核心功能是否不依賴特定階段的上下文？ | file-organizer：檔案歸納不涉及特定階段邏輯 |
| **文件產製屬性** | 是否為通用文書/簡報/試算表產出工具？ | pdf/pptx/xlsx：所有階段都可能產出正式交付物 |

**歸類原則**：
- ✅ 符合上述條件 → 同時歸類於原階段 **與** `00_cross_phase`（兩邊各保留一份）
- ❌ 僅在單一階段使用 → 僅歸類於該階段
- ⚠️ 不確定 → 先歸類於原階段，實際使用後再評估是否提升為通用
