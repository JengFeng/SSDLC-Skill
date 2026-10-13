# 軟體開發流程技能目錄索引表

本目錄依據 [TEMPLATE_SKILL.md](../docs/TEMPLATE_SKILL.md) 所定義的安全軟體開發生命週期六階段（SSDLC）分類技能。技能依階段及跨階段用途歸類，並加註來源以方便追溯。

---

## 1. 規劃與需求分析
本階段技能用於專案初期的需求釐清、文件協作、數據處理、提案報價與內部資訊傳遞。


*   **[[73] reverse_engineering](00_cross_phase/reverse_engineering/SKILL.md)**：對指定舊專案按 Phase 03→02→01 逆向蒐證，再回灌專案根正向 Phase 01 SSOT，依核准關卡推進 Phase 02→06。六個子 Skill 分別處理程式、設計、需求、測試、部署與維運；後三者的靜態盤點不算執行驗證。
    *   **追溯來源**：本專案自行設計（2026-08-07）
    *   **指令**：@reverse [專案路徑]、@reverse-code、@reverse-design、@reverse-requirements
    *   **口語觸發**：「逆向分析這個專案」「從程式碼反推需求」「還原舊專案文件」

*   **[diagram-design](00_cross_phase/diagram-design/SKILL.md)**：MIT 開源圖形 Skill，來源為 [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design)，固定版本 2.6／commit `dc1ace47b99a419e42d01a03cb6ace5346efa8ae`。跨階段主 Skill 保留原始版型與工具；Phase 01～06 各設有階段入口，分別對應使用案例／旅程、UML／ER／架構、模組呼叫、測試流程、部署拓撲、運維流程。圖中事實要能追溯來源，未知內容維持候選。

### Anthropic 官方技能
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


### GitHub 推薦開源工具技能
* **[[07] langchain](skills/01_planning_and_analysis/langchain)**：需求場景拆解、語意整理與鏈式呼叫工具。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/01_planning_and_analysis/langchain) / [原始 GitHub 倉庫](https://github.com/langchain-ai/langchain)
* **[[08] llamaindex](skills/01_planning_and_analysis/llamaindex)**：文件數據索引萃取與關鍵需求擷取工具。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/01_planning_and_analysis/llamaindex) / [原始 GitHub 倉庫](https://github.com/run-llama/llama_index)
* **[[09] docling](skills/01_planning_and_analysis/docling)**：各式複雜文件（PDF, Word等）轉換為標準 Markdown 格式工具。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/01_planning_and_analysis/docling) / [原始 GitHub 倉庫](https://github.com/DS4SD/docling)
* **[[10] docusaurus](skills/01_planning_and_analysis/docusaurus)**：需求文件靜態版本網站建置與版本化管理。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/01_planning_and_analysis/docusaurus) / [原始 GitHub 倉庫](https://github.com/facebook/docusaurus)


### GitHub 推薦開源文檔技能合集
* **[[11] document-skills](skills/01_planning_and_analysis/document-skills)**：增強版文件處理技能合集，涵蓋 docx、pdf、pptx、xlsx 四種格式的進階操作、OOXML 底層編輯、HTML 轉換與試算表重算。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/01_planning_and_analysis/document-skills) / [原始 GitHub 倉庫](https://github.com/appautomaton/document-SKILLs)

## 2. 系統設計
本階段技能用於前端 UI 原型設計、配色、品牌風格套用、系統分析（SA/SD）設計與簡報與提案影音輔助。### 本專案自行設計
* **[threat-modeling](02_system_design/threat-modeling/SKILL.md)**：以 DFD 與信任邊界為基礎，按 OWASP 四步主線搭配 STRIDE，建立可追溯的威脅、風險排序、控制措施與驗證工作。
  * **必要交付**：分析交付前主動建立／更新完整代碼與中文說明對照清單，涵蓋實際編號與縮寫並提供查閱連結；詳見 Skill 的重要規範。
  * **方法來源與可讀狀態**：[來源整理](02_system_design/threat-modeling/references/source-basis.md)

### Anthropic 官方技能
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


### GitHub 推薦開源工具技能
* **[[18] mermaid](skills/02_system_design/mermaid)**：以文字繪製專案流程圖、系統架構圖與狀態圖。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/02_system_design/mermaid) / [原始 GitHub 倉庫](https://github.com/mermaid-js/mermaid)
* **[[19] plantuml](skills/02_system_design/plantuml)**：產生精確 UML 類別圖、序列圖與部署圖的標準設計工具。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/02_system_design/plantuml) / [原始 GitHub 倉庫](https://github.com/plantuml/plantuml)
* **[[20] prisma](skills/02_system_design/prisma)**：資料庫實體關係圖 (ER Model)、Schema 與 SQL DDL 產生工具。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/02_system_design/prisma) / [原始 GitHub 倉庫](https://github.com/prisma/prisma)
* **[[21] openapi_generator](skills/02_system_design/openapi_generator)**：自動產生符合 OpenAPI 規格的 API 文件與介面程式碼。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/02_system_design/openapi_generator) / [原始 GitHub 倉庫](https://github.com/OpenAPITools/openapi-generator)


### UI/UX Pro Max 設計智慧技能
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
* **[[28] open-design](skills/02_system_design/open-design)**：AI 設計引擎 Skill 合集 — 涵蓋前端/UI/動畫/影片/簡報/PDF/品牌/3D。 🌐 雙歸屬（Phase 02 系統設計 + Phase 03 開發實作）
  * **追溯來源**：[本機外部資源目錄](../external-resources/open-design) / [原始 GitHub 倉庫](https://github.com/nexu-io/open-design)

## 3. 開發與編碼
本階段技能用於開發任務管理、程式碼實作、MCP 伺服器建置、API 規格查詢與自訂技能管理。

### Anthropic 官方技能
* **[[27] web-artifacts-builder](skills/03_implementation_and_coding/web-artifacts-builder)**：網頁應用建置。使用 React、Tailwind CSS 與 shadcn/ui 設計多組件的前端應用。
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/web-artifacts-builder) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/web-artifacts-builder)
* **[[28] mcp-builder](skills/03_implementation_and_coding/mcp-builder)**：MCP 伺服器建置。使用 Python 或 Node.js/TypeScript 開發 Model Context Protocol 伺服器以對接外部服務。
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/mcp-builder) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/mcp-builder)
* **[[29] claude-api](skills/03_implementation_and_coding/claude-api)**：Claude API 整合指引。提供 API 參數、計價、Tokens 計算與快取的參考手冊。
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/claude-api) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/claude-api)
* **[[30] skill-creator](skills/03_implementation_and_coding/skill-creator)**：AI 技能開發。建立新技能、測試與優化 SKILL.md 的觸發精準度。
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/skill-creator) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/skill-creator)

---


### GitHub 推薦開源工具技能
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


### Anthropic 官方插件技能
* **[[36] code-simplifier](skills/03_implementation_and_coding/code-simplifier)**：程式碼簡化與精煉。在保留所有功能的前提下，提升程式碼清晰度、一致性與可維護性。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/03_implementation_and_coding/code-simplifier) / [原始 GitHub 倉庫](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-simplifier)

### UI/UX Pro Max 前端實作技能
* **[[37] ui-styling](skills/03_implementation_and_coding/ui-styling)**：前端樣式落地實作 — shadcn/ui 元件開發 / Tailwind CSS 工具類 / 響應式佈局 / 暗色模式實作。 🌐 雙歸屬（Phase 02 設計規範 + Phase 03 實作落地）
  * **追溯來源**：[本機外部資源目錄](../external-resources/ui-ux-pro-max-skill/.claude/skills/ui-styling) / [原始 GitHub 倉庫](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)

* **[[38] open-design](skills/03_implementation_and_coding/open-design)**：AI 設計引擎 Skill 合集 — 涵蓋前端/UI/動畫/影片/簡報/PDF/品牌/3D。 🌐 雙歸屬（Phase 02 系統設計 + Phase 03 開發實作）
  * **追溯來源**：[本機外部資源目錄](../external-resources/open-design) / [原始 GitHub 倉庫](https://github.com/nexu-io/open-design)

## 4. 測試驗證
本階段技能用於前端功能自動化測試、後端功能驗證、API 與資安漏洞掃描。

### Anthropic 官方技能
* **[[38] webapp-testing](skills/04_testing/webapp-testing)**：網頁應用測試。利用 Playwright 對本機應用程式進行自動化 UI 驗證、除錯與截圖。
  * **追溯來源**：[本機外部資源目錄](../external-resources/anthropics-skills/skills/webapp-testing) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/webapp-testing)

---


### GitHub 推薦開源工具技能
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


### GitHub 推薦開源工具技能
* **[[48] docker](skills/05_deployment/docker)**：容器化服務打包、鏡像製作與多服務 Docker Compose 部署。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/05_deployment/docker) / [原始 GitHub 倉庫](https://github.com/docker/docker-ce)
* **[[49] ansible](skills/05_deployment/ansible)**：伺服器自動化組態管理、主機配置與遠端批次部署。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/05_deployment/ansible) / [原始 GitHub 倉庫](https://github.com/ansible/ansible)
* **[[50] nginx_config_generator](skills/05_deployment/nginx_config_generator)**：Web 伺服器反向代理與負載平衡組態檔自動產生器。
  * **追溯來源**：[本機外部資源目錄](../external-resources/github-skills/05_deployment/nginx_config_generator) / [原始 GitHub 倉庫](https://github.com/nginx/nginx)


## 6. 維護與營運
本階段技能用於系統上線後的資安內部稽核準備，以及線上運行訊號與討論輿情監控。

### GitHub 推薦開源工具技能
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

### GitHub 推薦開源工具技能

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





### UI/UX Pro Max 全域設計技能
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

---

## 完整技能目錄（依實際 `skills/` 目錄核對）

> 本表列出每個階段目錄中的實際 Skill；跨階段 Skill 會在各所屬階段重複列出。

| 階段 | Skill | 說明 |
|:---|:---|:---|
| `00_cross_phase` 跨階段全域共用 | [`anthropics-skills`](../skills/00_cross_phase/anthropics-skills/SKILL.md) | Anthropic official skills collection: algorithmic-art, brand-guidelines, canvas-design, claude-api, doc-coauthoring, docx, frontend-design, internal-comms, mcp-builder, pdf, pptx, skill-creator, slack-gif-creator, theme-factory, web-artifacts-builder, webapp-testing, xlsx. All sub-skills are distributed across phases. |
| `00_cross_phase` 跨階段全域共用 | [`autoresearch`](../skills/00_cross_phase/autoresearch/SKILL.md) | Autonomous iteration loop: modify, verify, keep/discard against any metric |
| `00_cross_phase` 跨階段全域共用 | [`brainstorming`](../skills/00_cross_phase/brainstorming/SKILL.md) | You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation. |
| `00_cross_phase` 跨階段全域共用 | [`codex-ppt-skill`](../skills/00_cross_phase/codex-ppt-skill/SKILL.md)（雙重歸屬） | GPT-Image-2 PPT Generator: converts articles/reports into image-based PowerPoint presentations. Plans outline and visual style, generates each slide as AI image, assembles into .pptx. Supports Codex, Claude Code, OpenClaw, Hermes Agent. Requires image generation API key. |
| `00_cross_phase` 跨階段全域共用 | [`diffsync`](../skills/00_cross_phase/diffsync/SKILL.md) | 跨階段專案原始碼版本差異對比與同步工具。 |
| `00_cross_phase` 跨階段全域共用 | [`docx`](../skills/00_cross_phase/docx/SKILL.md)（雙重歸屬） | Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files). Triggers include: any mention of 'Word doc', 'word document', '.docx', or requests to produce professional documents with formatting like tables of contents, headings, page numbers, or letterheads. Also use when extracting or reorganizing content from .docx files, inserting or replacing images in documents, performing find-and-replace in Word files, working with tracked changes or comments, or converting content into a polished Word document. If the user asks for a 'report', 'memo', 'letter', 'template', or similar deliverable as a Word or .docx file, use this skill. Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks unrelated to document generation. |
| `00_cross_phase` 跨階段全域共用 | [`firecrawl`](../skills/00_cross_phase/firecrawl/SKILL.md) | Fetch web content, take screenshots, extract structured data, search the web, and crawl documentation sites. Use when the user needs current web information, asks to scrape a URL, wants a screenshot, needs to extract specific data from a page, or wants to learn about a framework or library. |
| `00_cross_phase` 跨階段全域共用 | [`git`](../skills/00_cross_phase/git/SKILL.md) | 全域版本控制、分支管理與 Baseline 基線封存追溯工具。 |
| `00_cross_phase` 跨階段全域共用 | [`github-skills`](../skills/00_cross_phase/github-skills/SKILL.md) | GitHub community skills collection curated from GitHub community contributions. Includes tools for CI/CD, code review, documentation, testing, and more. |
| `00_cross_phase` 跨階段全域共用 | [`guizang-ppt-skill`](../skills/00_cross_phase/guizang-ppt-skill/SKILL.md)（雙重歸屬） | AI Agent HTML slide deck generator: editorial magazine and Swiss international layouts, image prompts, social covers, WebGL presentation runtime. Dual visual system with 10+22 layout templates. Outputs single-file horizontal-flip HTML PPT. |
| `00_cross_phase` 跨階段全域共用 | [`langgraph`](../skills/00_cross_phase/langgraph/SKILL.md) | 複雜狀態多 Agent 協作工作流的圖形狀態管理引擎。 |
| `00_cross_phase` 跨階段全域共用 | [`markitdown`](../skills/00_cross_phase/markitdown/SKILL.md) | 輕量 Python 工具，將各種檔案格式（PDF、Word、PowerPoint、Excel、圖片、HTML、CSV、JSON、XML、ZIP、YouTube、EPub 等）轉換為 Markdown，適用於 LLM 文本分析與跨階段文件前處理。 |
| `00_cross_phase` 跨階段全域共用 | [`minimax-docx`](../skills/00_cross_phase/minimax-docx/SKILL.md)（雙重歸屬） | Professional DOCX creation/editing: OpenXML SDK, three pipelines (create/fill/template), XSD validation. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `00_cross_phase` 跨階段全域共用 | [`minimax-pdf`](../skills/00_cross_phase/minimax-pdf/SKILL.md)（雙重歸屬） | PDF generation: 15 cover styles, form filling, document reformatting, print-ready typography. MiniMax API integration. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `00_cross_phase` 跨階段全域共用 | [`minimax-skills`](../skills/00_cross_phase/minimax-skills/SKILL.md) | MiniMax AI development skills collection: frontend-dev, fullstack-dev, android/ios/flutter/RN dev, shader-dev, minimax-pdf/docx/xlsx, pptx-generator, multimodal toolkit, music gen/playlist, buddy-sings, vision-analysis, gif-sticker-maker. All sub-skills distributed across phases. |
| `00_cross_phase` 跨階段全域共用 | [`minimax-xlsx`](../skills/00_cross_phase/minimax-xlsx/SKILL.md)（雙重歸屬） | Excel file operations: create/read/analyze/edit/validate .xlsx/.xlsm/.csv. XML templates, pandas, zero-format-loss editing. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `00_cross_phase` 跨階段全域共用 | [`pdf`](../skills/00_cross_phase/pdf/SKILL.md)（雙重歸屬） | Use this skill whenever the user wants to do anything with PDF files. This includes reading or extracting text/tables from PDFs, combining or merging multiple PDFs into one, splitting PDFs apart, rotating pages, adding watermarks, creating new PDFs, filling PDF forms, encrypting/decrypting PDFs, extracting images, and OCR on scanned PDFs to make them searchable. If the user mentions a .pdf file or asks to produce one, use this skill. |
| `00_cross_phase` 跨階段全域共用 | [`ppt-master`](../skills/00_cross_phase/ppt-master/SKILL.md)（雙重歸屬） | AI generates natively editable PPTX from any document — native shapes and animations, editable charts and tables, speaker notes with audio narration, custom .pptx template support. Not slide images, real editable PowerPoint. |
| `00_cross_phase` 跨階段全域共用 | [`pptx`](../skills/00_cross_phase/pptx/SKILL.md)（雙重歸屬） | Use this skill any time a .pptx file is involved in any way — as input, output, or both. This includes: creating slide decks, pitch decks, or presentations; reading, parsing, or extracting text from any .pptx file (even if the extracted content will be used elsewhere, like in an email or summary); editing, modifying, or updating existing presentations; combining or splitting slide files; working with templates, layouts, speaker notes, or comments. Trigger whenever the user mentions \"deck,\" \"slides,\" \"presentation,\" or references a .pptx filename, regardless of what they plan to do with the content afterward. If a .pptx file needs to be opened, created, or touched, use this skill. |
| `00_cross_phase` 跨階段全域共用 | [`pptx-generator`](../skills/00_cross_phase/pptx-generator/SKILL.md)（雙重歸屬） | PowerPoint generation: PptxGenJS (cover/TOC/content/section/summary), XML editing, markitdown text extraction. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `00_cross_phase` 跨階段全域共用 | [`ralph-loop`](../skills/00_cross_phase/ralph-loop/SKILL.md) | 用途請參考 SKILL.md。 |
| `00_cross_phase` 跨階段全域共用 | [`reverse_engineering`](../skills/00_cross_phase/reverse_engineering/SKILL.md) | 對指定既有專案先按 Phase 03→02→01 逆向蒐證，再將候選結果遞回正向 Phase 01→02→03 SSOT；保留來源、信心與待決契約，按關卡推進 04→06。 |
| `00_cross_phase` 跨階段全域共用 | [`Security-Principles`](../skills/00_cross_phase/Security-Principles/SKILL.md) | Government cybersecurity defense baseline: vulnerability classification, risk assessment matrices, security checklists for B/C/D-grade agencies. Based on Taiwan NDC cybersecurity regulations. |
| `00_cross_phase` 跨階段全域共用 | [`slides`](../skills/00_cross_phase/slides/SKILL.md) | Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, copywriting formulas, and contextual slide strategies. |
| `00_cross_phase` 跨階段全域共用 | [`test-driven-development`](../skills/00_cross_phase/test-driven-development/SKILL.md) | Use when implementing any feature or bugfix, before writing implementation code |
| `00_cross_phase` 跨階段全域共用 | [`ui-ux-pro-max`](../skills/00_cross_phase/ui-ux-pro-max/SKILL.md) | UI/UX design intelligence for web and mobile. Includes 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart types across 10 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, and HTML/CSS). Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, and check UI/UX code. Projects: website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog, and mobile app. Elements: button, modal, navbar, sidebar, card, table, form, and chart. Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive, skeuomorphism, and flat design. Topics: color systems, accessibility, animation, layout, typography, font pairing, spacing, interaction states, shadow, and gradient. Integrations: shadcn/ui MCP for component search and examples. |
| `00_cross_phase` 跨階段全域共用 | [`ui-ux-pro-max-skill`](../skills/00_cross_phase/ui-ux-pro-max-skill/SKILL.md) | UI/UX Pro Max design intelligence collection: banner-design, brand, design, design-system, slides, ui-styling, ui-ux-pro-max. All sub-skills distributed across Phase 00/02/03. |
| `00_cross_phase` 跨階段全域共用 | [`using-superpowers`](../skills/00_cross_phase/using-superpowers/SKILL.md) | Use when starting any conversation - establishes how to find and use skills, requiring skill invocation before ANY response including clarifying questions |
| `00_cross_phase` 跨階段全域共用 | [`verification-before-completion`](../skills/00_cross_phase/verification-before-completion/SKILL.md) | Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always |
| `00_cross_phase` 跨階段全域共用 | [`writing-plans`](../skills/00_cross_phase/writing-plans/SKILL.md) | Use when you have a spec or requirements for a multi-step task, before touching code |
| `00_cross_phase` 跨階段全域共用 | [`xlsx`](../skills/00_cross_phase/xlsx/SKILL.md)（雙重歸屬） | Use this skill any time a spreadsheet file is the primary input or output. This means any task where the user wants to: open, read, edit, or fix an existing .xlsx, .xlsm, .csv, or .tsv file (e.g., adding columns, computing formulas, formatting, charting, cleaning messy data); create a new spreadsheet from scratch or from other data sources; or convert between tabular file formats. Trigger especially when the user references a spreadsheet file by name or path — even casually (like \"the xlsx in my downloads\") — and wants something done to it or produced from it. Also trigger for cleaning or restructuring messy tabular data files (malformed rows, misplaced headers, junk data) into proper spreadsheets. The deliverable must be a spreadsheet file. Do NOT trigger when the primary deliverable is a Word document, HTML report, standalone Python script, database pipeline, or Google Sheets API integration, even if tabular data is involved. |
| `01_planning_and_analysis` 規劃與需求分析 | [`codex-ppt-skill`](../skills/01_planning_and_analysis/codex-ppt-skill/SKILL.md)（雙重歸屬） | GPT-Image-2 PPT Generator: converts articles/reports into image-based PowerPoint presentations. Plans outline and visual style, generates each slide as AI image, assembles into .pptx. Supports Codex, Claude Code, OpenClaw, Hermes Agent. Requires image generation API key. |
| `01_planning_and_analysis` 規劃與需求分析 | [`doc-coauthoring`](../skills/01_planning_and_analysis/doc-coauthoring/SKILL.md) | Guide users through a structured workflow for co-authoring documentation. Use when user wants to write documentation, proposals, technical specs, decision docs, or similar structured content. This workflow helps users efficiently transfer context, refine content through iteration, and verify the doc works for readers. Trigger when user mentions writing docs, creating proposals, drafting specs, or similar documentation tasks. |
| `01_planning_and_analysis` 規劃與需求分析 | [`docling`](../skills/01_planning_and_analysis/docling/SKILL.md) | 各式複雜文件（PDF, Word等）轉換為標準 Markdown 格式工具。 |
| `01_planning_and_analysis` 規劃與需求分析 | [`docusaurus`](../skills/01_planning_and_analysis/docusaurus/SKILL.md) | 需求文件靜態版本網站建置與版本化管理。 |
| `01_planning_and_analysis` 規劃與需求分析 | [`docx`](../skills/01_planning_and_analysis/docx/SKILL.md)（雙重歸屬） | Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files). Triggers include: any mention of 'Word doc', 'word document', '.docx', or requests to produce professional documents with formatting like tables of contents, headings, page numbers, or letterheads. Also use when extracting or reorganizing content from .docx files, inserting or replacing images in documents, performing find-and-replace in Word files, working with tracked changes or comments, or converting content into a polished Word document. If the user asks for a 'report', 'memo', 'letter', 'template', or similar deliverable as a Word or .docx file, use this skill. Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks unrelated to document generation. |
| `01_planning_and_analysis` 規劃與需求分析 | [`guizang-ppt-skill`](../skills/01_planning_and_analysis/guizang-ppt-skill/SKILL.md)（雙重歸屬） | AI Agent HTML slide deck generator: editorial magazine and Swiss international layouts, image prompts, social covers, WebGL presentation runtime. Dual visual system with 10+22 layout templates. Outputs single-file horizontal-flip HTML PPT. |
| `01_planning_and_analysis` 規劃與需求分析 | [`internal-comms`](../skills/01_planning_and_analysis/internal-comms/SKILL.md) | A set of resources to help me write all kinds of internal communications, using the formats that my company likes to use. Claude should use this skill whenever asked to write some sort of internal communications (status reports, leadership updates, 3P updates, company newsletters, FAQs, incident reports, project updates, etc.). |
| `01_planning_and_analysis` 規劃與需求分析 | [`langchain`](../skills/01_planning_and_analysis/langchain/SKILL.md) | 需求場景拆解、語意整理與鏈式呼叫工具。 |
| `01_planning_and_analysis` 規劃與需求分析 | [`llamaindex`](../skills/01_planning_and_analysis/llamaindex/SKILL.md) | 文件數據索引萃取與關鍵需求擷取工具。 |
| `01_planning_and_analysis` 規劃與需求分析 | [`minimax-docx`](../skills/01_planning_and_analysis/minimax-docx/SKILL.md)（雙重歸屬） | Professional DOCX creation/editing: OpenXML SDK, three pipelines (create/fill/template), XSD validation. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `01_planning_and_analysis` 規劃與需求分析 | [`minimax-pdf`](../skills/01_planning_and_analysis/minimax-pdf/SKILL.md)（雙重歸屬） | PDF generation: 15 cover styles, form filling, document reformatting, print-ready typography. MiniMax API integration. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `01_planning_and_analysis` 規劃與需求分析 | [`minimax-xlsx`](../skills/01_planning_and_analysis/minimax-xlsx/SKILL.md)（雙重歸屬） | Excel file operations: create/read/analyze/edit/validate .xlsx/.xlsm/.csv. XML templates, pandas, zero-format-loss editing. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `01_planning_and_analysis` 規劃與需求分析 | [`pdf`](../skills/01_planning_and_analysis/pdf/SKILL.md)（雙重歸屬） | Use this skill whenever the user wants to do anything with PDF files. This includes reading or extracting text/tables from PDFs, combining or merging multiple PDFs into one, splitting PDFs apart, rotating pages, adding watermarks, creating new PDFs, filling PDF forms, encrypting/decrypting PDFs, extracting images, and OCR on scanned PDFs to make them searchable. If the user mentions a .pdf file or asks to produce one, use this skill. |
| `01_planning_and_analysis` 規劃與需求分析 | [`ppt-master`](../skills/01_planning_and_analysis/ppt-master/SKILL.md)（雙重歸屬） | AI generates natively editable PPTX from any document — native shapes and animations, editable charts and tables, speaker notes with audio narration, custom .pptx template support. Not slide images, real editable PowerPoint. |
| `01_planning_and_analysis` 規劃與需求分析 | [`pptx`](../skills/01_planning_and_analysis/pptx/SKILL.md)（雙重歸屬） | Use this skill any time a .pptx file is involved in any way — as input, output, or both. This includes: creating slide decks, pitch decks, or presentations; reading, parsing, or extracting text from any .pptx file (even if the extracted content will be used elsewhere, like in an email or summary); editing, modifying, or updating existing presentations; combining or splitting slide files; working with templates, layouts, speaker notes, or comments. Trigger whenever the user mentions \"deck,\" \"slides,\" \"presentation,\" or references a .pptx filename, regardless of what they plan to do with the content afterward. If a .pptx file needs to be opened, created, or touched, use this skill. |
| `01_planning_and_analysis` 規劃與需求分析 | [`pptx-generator`](../skills/01_planning_and_analysis/pptx-generator/SKILL.md)（雙重歸屬） | PowerPoint generation: PptxGenJS (cover/TOC/content/section/summary), XML editing, markitdown text extraction. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `01_planning_and_analysis` 規劃與需求分析 | [`xlsx`](../skills/01_planning_and_analysis/xlsx/SKILL.md)（雙重歸屬） | Use this skill any time a spreadsheet file is the primary input or output. This means any task where the user wants to: open, read, edit, or fix an existing .xlsx, .xlsm, .csv, or .tsv file (e.g., adding columns, computing formulas, formatting, charting, cleaning messy data); create a new spreadsheet from scratch or from other data sources; or convert between tabular file formats. Trigger especially when the user references a spreadsheet file by name or path — even casually (like \"the xlsx in my downloads\") — and wants something done to it or produced from it. Also trigger for cleaning or restructuring messy tabular data files (malformed rows, misplaced headers, junk data) into proper spreadsheets. The deliverable must be a spreadsheet file. Do NOT trigger when the primary deliverable is a Word document, HTML report, standalone Python script, database pipeline, or Google Sheets API integration, even if tabular data is involved. |
| `02_system_design` 系統設計 | [`ai-news-video`](../skills/02_system_design/ai-news-video/SKILL.md) | 抓取本週 AI 新聞並產出 4-7 分鐘 YouTube 影片配音腳本 + 投影片 + mp4（繁體中文台灣用詞）。從 15+ 來源廣掃 30+ 候選，**按議題群整合（5-8 個 cluster）而非選 3 則單一新聞**，預設 ElevenLabs Tiffy_TW 1.7× 配音 + 黑底橘色 accent 投影片。觸發詞：「AI 週報」「跑週報」「本週 AI 新聞」「產 YouTube 腳本」「整理本週新聞」。使用者經營不露臉 AI 新聞頻道時務必使用此 skill。 |
| `02_system_design` 系統設計 | [`algorithmic-art`](../skills/02_system_design/algorithmic-art/SKILL.md) | Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or particle systems. Create original algorithmic art rather than copying existing artists' work to avoid copyright violations. |
| `02_system_design` 系統設計 | [`awesome-design-md`](../skills/02_system_design/awesome-design-md/SKILL.md) | Curated collection of 73+ DESIGN.md files extracted from real websites. Drop a DESIGN.md into your project to give AI agents a visual design language covering color palettes, typography, component styles, layout principles, and responsive behavior. Use for design token reference, brand-consistent UI generation, and visual system onboarding. |
| `02_system_design` 系統設計 | [`banner-design`](../skills/02_system_design/banner-design/SKILL.md) | Design banners for social media, ads, website heroes, creative assets, and print. Multiple art direction options with AI-generated visuals. Actions: design, create, generate banner. Platforms: Facebook, Twitter/X, LinkedIn, YouTube, Instagram, Google Display, website hero, print. Styles: minimalist, gradient, bold typography, photo-based, illustrated, geometric, retro, glassmorphism, 3D, neon, duotone, editorial, collage. Uses ui-ux-pro-max, frontend-design, ai-artist, ai-multimodal skills. |
| `02_system_design` 系統設計 | [`brand`](../skills/02_system_design/brand/SKILL.md) | Brand voice, visual identity, messaging frameworks, asset management, brand consistency. Activate for branded content, tone of voice, marketing assets, brand compliance, style guides. |
| `02_system_design` 系統設計 | [`brand-guidelines`](../skills/02_system_design/brand-guidelines/SKILL.md) | Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit from having Anthropic's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply. |
| `02_system_design` 系統設計 | [`buddy-sings`](../skills/02_system_design/buddy-sings/SKILL.md) | AI pet singing: voice identity caching, context-aware themed lyrics, music generation via minimax-music-gen. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `02_system_design` 系統設計 | [`canvas-design`](../skills/02_system_design/canvas-design/SKILL.md) | Create beautiful visual art in .png and .pdf documents using design philosophy. You should use this skill when the user asks to create a poster, piece of art, design, or other static piece. Create original visual designs, never copying existing artists' work to avoid copyright violations. |
| `02_system_design` 系統設計 | [`design`](../skills/02_system_design/design/SKILL.md) | Comprehensive design skill: brand identity, design tokens, UI styling, logo generation (55 styles, Gemini AI), corporate identity program (50 deliverables, CIP mockups), HTML presentations (Chart.js), banner design (22 styles, social/ads/web/print), icon design (15 styles, SVG, Gemini 3.1 Pro), social photos (HTML→screenshot, multi-platform). Actions: design logo, create CIP, generate mockups, build slides, design banner, generate icon, create social photos, social media images, brand identity, design system. Platforms: Facebook, Twitter, LinkedIn, YouTube, Instagram, Pinterest, TikTok, Threads, Google Ads. |
| `02_system_design` 系統設計 | [`design-system`](../skills/02_system_design/design-system/SKILL.md) | Token architecture, component specifications, and slide generation. Three-layer tokens (primitive→semantic→component), CSS variables, spacing/typography scales, component specs, strategic slide creation. Use for design tokens, systematic design, brand-compliant presentations. |
| `02_system_design` 系統設計 | [`frontend-design`](../skills/02_system_design/frontend-design/SKILL.md) | Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults. |
| `02_system_design` 系統設計 | [`gif-sticker-maker`](../skills/02_system_design/gif-sticker-maker/SKILL.md) | GIF sticker creation: photos to 4 animated stickers with captions, Funko Pop style. MiniMax Image & Video API. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `02_system_design` 系統設計 | [`mermaid`](../skills/02_system_design/mermaid/SKILL.md) | 以文字繪製專案流程圖、系統架構圖與狀態圖。 |
| `02_system_design` 系統設計 | [`minimax-multimodal-toolkit`](../skills/02_system_design/minimax-multimodal-toolkit/SKILL.md) | Unified multimodal content: TTS, music, video (text/image-to-video), image generation, FFmpeg media processing via MiniMax APIs. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `02_system_design` 系統設計 | [`minimax-music-gen`](../skills/02_system_design/minimax-music-gen/SKILL.md) | Music generation: vocal songs, instrumentals, covers. Lyrics generation, style vocabulary, streaming playback. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `02_system_design` 系統設計 | [`minimax-music-playlist`](../skills/02_system_design/minimax-music-playlist/SKILL.md) | Personalized playlist generation: taste profiling, themed tracklist, album cover art, iterative refinement. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `02_system_design` 系統設計 | [`open-design`](../skills/02_system_design/open-design/SKILL.md)（雙重歸屬） | Open-source Claude Design alternative with 150+ composable skills for UI generation, prototyping, dashboards, presentations, images, video, and motion graphics. Supports Claude Code, Codex, Cursor, Gemini, and 20+ CLI tools via BYOK. Use for design-driven frontend development, brand-grade DESIGN.md systems, and agent-native design workflows. |
| `02_system_design` 系統設計 | [`openapi_generator`](../skills/02_system_design/openapi_generator/SKILL.md) | 自動產生符合 OpenAPI 規格的 API 文件與介面程式碼。 |
| `02_system_design` 系統設計 | [`plantuml`](../skills/02_system_design/plantuml/SKILL.md) | 產生精確 UML 類別圖、序列圖與部署圖的標準設計工具。 |
| `02_system_design` 系統設計 | [`prisma`](../skills/02_system_design/prisma/SKILL.md) | 資料庫實體關係圖 (ER Model)、Schema 與 SQL DDL 產生工具。 |
| `02_system_design` 系統設計 | [`shader-dev`](../skills/02_system_design/shader-dev/SKILL.md) | GLSL shader techniques: ray marching, SDF modeling, fluid simulation, particles, procedural generation, post-processing. ShaderToy-compatible. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `02_system_design` 系統設計 | [`slack-gif-creator`](../skills/02_system_design/slack-gif-creator/SKILL.md) | Knowledge and utilities for creating animated GIFs optimized for Slack. Provides constraints, validation tools, and animation concepts. Use when users request animated GIFs for Slack like "make me a GIF of X doing Y for Slack. |
| `02_system_design` 系統設計 | [`theme-factory`](../skills/02_system_design/theme-factory/SKILL.md) | Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML landing pages, etc. There are 10 pre-set themes with colors/fonts that you can apply to any artifact that has been creating, or can generate a new theme on-the-fly. |
| `02_system_design` 系統設計 | [`ui-styling`](../skills/02_system_design/ui-styling/SKILL.md)（雙重歸屬） | Create beautiful, accessible user interfaces with shadcn/ui components (built on Radix UI + Tailwind), Tailwind CSS utility-first styling, and canvas-based visual designs. Use when building user interfaces, implementing design systems, creating responsive layouts, adding accessible components (dialogs, dropdowns, forms, tables), customizing themes and colors, implementing dark mode, generating visual designs and posters, or establishing consistent styling patterns across applications. |
| `03_implementation_and_coding` 開發與編碼 | [`android-native-dev`](../skills/03_implementation_and_coding/android-native-dev/SKILL.md) | Android native development: Material Design 3, Kotlin/Jetpack Compose, adaptive layouts, Gradle, accessibility (WCAG), performance. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `03_implementation_and_coding` 開發與編碼 | [`claude-api`](../skills/03_implementation_and_coding/claude-api/SKILL.md) | \|- |
| `03_implementation_and_coding` 開發與編碼 | [`code-simplifier`](../skills/03_implementation_and_coding/code-simplifier/SKILL.md) | Simplifies and refines code for clarity, consistency, and maintainability while preserving all functionality. Focuses on recently modified code unless instructed otherwise. |
| `03_implementation_and_coding` 開發與編碼 | [`codellama`](../skills/03_implementation_and_coding/codellama/SKILL.md) | 本地離線代碼編譯、語法生成與程式碼自動補全核心。 |
| `03_implementation_and_coding` 開發與編碼 | [`continue_dev`](../skills/03_implementation_and_coding/continue_dev/SKILL.md) | 本機 AI 輔助寫碼、語境理解與程式產生套件。 |
| `03_implementation_and_coding` 開發與編碼 | [`eslint`](../skills/03_implementation_and_coding/eslint/SKILL.md) | 代碼語法與靜態邏輯檢核，維護團隊代碼品質。 |
| `03_implementation_and_coding` 開發與編碼 | [`flutter-dev`](../skills/03_implementation_and_coding/flutter-dev/SKILL.md) | Flutter cross-platform: widget patterns, Riverpod/Bloc, GoRouter, performance optimization, testing. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `03_implementation_and_coding` 開發與編碼 | [`frontend-dev`](../skills/03_implementation_and_coding/frontend-dev/SKILL.md) | Full-stack frontend development: premium UI, animations (Framer Motion, GSAP), AI media assets, copywriting (AIDA), generative art (p5.js, Three.js). React/Next.js, Tailwind CSS. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `03_implementation_and_coding` 開發與編碼 | [`fullstack-dev`](../skills/03_implementation_and_coding/fullstack-dev/SKILL.md) | Full-stack backend architecture: REST API, auth (JWT/OAuth), real-time (SSE/WebSocket), database (SQL/NoSQL), production hardening. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `03_implementation_and_coding` 開發與編碼 | [`ios-application-dev`](../skills/03_implementation_and_coding/ios-application-dev/SKILL.md) | iOS development: UIKit, SnapKit, SwiftUI, touch targets, safe areas, Dynamic Type, Dark Mode, Apple HIG compliance. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `03_implementation_and_coding` 開發與編碼 | [`mcp-builder`](../skills/03_implementation_and_coding/mcp-builder/SKILL.md) | Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK). |
| `03_implementation_and_coding` 開發與編碼 | [`nx`](../skills/03_implementation_and_coding/nx/SKILL.md) | 大型專案多模組與依賴關係的整合管控工具。 |
| `03_implementation_and_coding` 開發與編碼 | [`open-design`](../skills/03_implementation_and_coding/open-design/SKILL.md)（雙重歸屬） | Open-source Claude Design alternative with 150+ composable skills for UI generation, prototyping, dashboards, presentations, images, video, and motion graphics. Supports Claude Code, Codex, Cursor, Gemini, and 20+ CLI tools via BYOK. Use for design-driven frontend development, brand-grade DESIGN.md systems, and agent-native design workflows. |
| `03_implementation_and_coding` 開發與編碼 | [`prettier`](../skills/03_implementation_and_coding/prettier/SKILL.md) | 代碼風格美化與自動格式化，避免排版衝突。 |
| `03_implementation_and_coding` 開發與編碼 | [`react-native-dev`](../skills/03_implementation_and_coding/react-native-dev/SKILL.md) | React Native/Expo: components, styling, animations, navigation, state, networking, native capabilities, CI/CD. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `03_implementation_and_coding` 開發與編碼 | [`skill-creator`](../skills/03_implementation_and_coding/skill-creator/SKILL.md) | Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, edit, or optimize an existing skill, run evals to test a skill, benchmark skill performance with variance analysis, or optimize a skill's description for better triggering accuracy. |
| `03_implementation_and_coding` 開發與編碼 | [`ui-styling`](../skills/03_implementation_and_coding/ui-styling/SKILL.md)（雙重歸屬） | Create beautiful, accessible user interfaces with shadcn/ui components (built on Radix UI + Tailwind), Tailwind CSS utility-first styling, and canvas-based visual designs. Use when building user interfaces, implementing design systems, creating responsive layouts, adding accessible components (dialogs, dropdowns, forms, tables), customizing themes and colors, implementing dark mode, generating visual designs and posters, or establishing consistent styling patterns across applications. |
| `03_implementation_and_coding` 開發與編碼 | [`web-artifacts-builder`](../skills/03_implementation_and_coding/web-artifacts-builder/SKILL.md) | Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts. |
| `04_testing` 測試驗證 | [`coverage_py`](../skills/04_testing/coverage_py/SKILL.md) | Python 測試覆蓋率分析與未涵蓋代碼報告器。 |
| `04_testing` 測試驗證 | [`cypress`](../skills/04_testing/cypress/SKILL.md) | 前端單頁面應用 (SPA) 的快速自動化回歸測試框架。 |
| `04_testing` 測試驗證 | [`jest`](../skills/04_testing/jest/SKILL.md) | JavaScript / TypeScript 的單元測試與 Mock 驗證工具。 |
| `04_testing` 測試驗證 | [`playwright`](../skills/04_testing/playwright/SKILL.md) | 主流 UI 自動化測試與跨瀏覽器兼容性回歸測試套件。 |
| `04_testing` 測試驗證 | [`pytest`](../skills/04_testing/pytest/SKILL.md) | Python 單元測試與多功能測試驗證框架。 |
| `04_testing` 測試驗證 | [`robot_framework`](../skills/04_testing/robot_framework/SKILL.md) | 基於關鍵字驅動的通用自動化測試與驗收框架。 |
| `04_testing` 測試驗證 | [`selenium`](../skills/04_testing/selenium/SKILL.md) | 傳統網頁與多瀏覽器的自動化測試與兼容性回歸測試工具。 |
| `04_testing` 測試驗證 | [`sonarqube`](../skills/04_testing/sonarqube/SKILL.md) | 專案原始碼安全漏洞、壞味道與代碼品質靜態掃描。 |
| `04_testing` 測試驗證 | [`systematic-debugging`](../skills/04_testing/systematic-debugging/SKILL.md) | Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes |
| `04_testing` 測試驗證 | [`vision-analysis`](../skills/04_testing/vision-analysis/SKILL.md) | Image analysis: describe, OCR, UI mockup review, chart data extraction, object detection. MiniMax VL API with GPT-4V fallback. Requires MiniMax API Key for full functionality. Source: MiniMax-AI/skills (MIT). |
| `04_testing` 測試驗證 | [`webapp-testing`](../skills/04_testing/webapp-testing/SKILL.md) | Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs. |
| `05_deployment` 部署發布 | [`ansible`](../skills/05_deployment/ansible/SKILL.md) | 伺服器自動化組態管理、主機配置與遠端批次部署。 |
| `05_deployment` 部署發布 | [`docker`](../skills/05_deployment/docker/SKILL.md) | 容器化服務打包、鏡像製作與多服務 Docker Compose 部署。 |
| `05_deployment` 部署發布 | [`nginx_config_generator`](../skills/05_deployment/nginx_config_generator/SKILL.md) | Web 伺服器反向代理與負載平衡組態檔自動產生器。 |
| `06_maintenance` 維護與營運 | [`elk_stack`](../skills/06_maintenance/elk_stack/SKILL.md) | 線上日誌集中化收集、Elasticsearch 檢索與日誌異常分析。 |
| `06_maintenance` 維護與營運 | [`logparser`](../skills/06_maintenance/logparser/SKILL.md) | 雜亂日誌自動清理、正則篩選與格式化輸出分析。 |
| `06_maintenance` 維護與營運 | [`opentelemetry`](../skills/06_maintenance/opentelemetry/SKILL.md) | 雲原生 APM 效能瓶頸、調用鏈分佈式追蹤系統。 |
| `06_maintenance` 維護與營運 | [`prometheus_grafana`](../skills/06_maintenance/prometheus_grafana/SKILL.md) | 系統硬體指標與服務效能監控、即時 Grafana 圖表告警機制。 |
