# 軟體開發流程技能目錄索引表

本目錄依據 [TEMPLATE_SKILL.md](file:///d:/00AI協作/SSDLC_Skill/docs/TEMPLATE_SKILL.md) 所定義的 安全軟體開發生命週期六階段（通稱 SSDLC），將 Anthropic 官方（17）、Benson 自建（29）、GitHub 社群（41）、Anthropic 官方插件（1）等來源之技能（共 88 個）進行結構化分類，並加註其原始來源以方便追溯。各階段與其包含的技能說明如下：

---

## 1. 規劃與需求分析
本階段技能用於專案初期的需求釐清、文件協作、數據處理、提案報價與內部資訊傳遞。

### Anthropic 官方技能 (6)
* **[doc-coauthoring](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/doc-coauthoring)**：文件協同撰寫引導。提供結構化工作流以協同撰寫提案、規格書或決策文件。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/anthropics-skills/skills/doc-coauthoring) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring)
* **[internal-comms](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/internal-comms)**：內部溝通撰寫資源。提供狀態報告、事件報告及專案更新等內部通訊文件格式。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/anthropics-skills/skills/internal-comms) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/internal-comms)
* **[docx](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/docx)**：Word 文件處理。讀取、編輯、操作與排版 `.docx` 檔案。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/anthropics-skills/skills/docx) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/docx)
* **[xlsx](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/xlsx)**：Excel 試算表處理。進行資料分析、公式計算、格式化與表格清洗。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/anthropics-skills/skills/xlsx) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/xlsx)
* **[pdf](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/pdf)**：PDF 處理與 OCR。支援 PDF 檔案的拆合、表單填寫與 OCR 文字提取。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/anthropics-skills/skills/pdf) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/pdf)
* **[pptx](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/pptx)**：投影片與簡報製作。建立與編輯簡報投影片。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/anthropics-skills/skills/pptx) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/pptx)

### Benson 自建技能 (12)
* **[grill-me](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/grill-me)**：需求釐清與拷問。在動手開發前，先讀文件並逐點拷問使用者以釐清需求，並將結論回寫。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/grill-me) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/grill-me)
* **[project-pulse](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/project-pulse)**：專案把脈與問答。作為單一專案問答入口，串接知識庫、討論區與工項等來源進行分層作答。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/project-pulse) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/project-pulse)
* **[rfp-builder](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/rfp-builder)**：需求說明書與經費概算表產生器。撰寫系統需求說明書（RFP）與預算表並輸出為 Word 文件。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/rfp-builder) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/rfp-builder)
* **[proposal-doc](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/proposal-doc)**：服務建議書撰寫工具。內建去 AI 痕跡規則，撰寫高品質服務建議書並輸出為 Word 文件。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/proposal-doc) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/proposal-doc)
* **[proposal-pptx](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/proposal-pptx)**：一站式建議簡報產生器。套用大綱框架並內建備忘稿與講者備忘。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/proposal-pptx) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/proposal-pptx)
* **[quote-builder](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/quote-builder)**：報價單產生器。產生政府或企業估價報價單 Excel 檔案，內建多種職級人月單價與管理費稅率計算。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/quote-builder) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/quote-builder)
* **[workplan-doc](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/workplan-doc)**：工作執行計畫書產生器。得標後第一份交付文件，包含需求訪談、導入規章與專案時程規畫。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/workplan-doc) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/workplan-doc)
* **[meeting-record](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/meeting-record)**：會議記錄整理工具。將語音轉文字之會議逐字稿整理為結構化知識庫筆記與 HTML/CSS 簡報。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/meeting-record) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/meeting-record)
* **[file-organizer](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/file-organizer)**：專案文件整理器。將專案中混亂的檔案依據定義的標準結構進行自動化分類。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/file-organizer) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/file-organizer)
* **[work-review](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/work-review)**：工作整合報告。整合 Outlook 信件、行事曆、LINE 與工項紀錄以產出每日（Daily）或每週（Weekly）的工作報告。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/work-review) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/work-review)
* **[bcp-drill-doc](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/bcp-drill-doc)**：BCP 演練紀錄表產生器。自動產生營運持續計畫（BCP）的演練紀錄表文件。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/bcp-drill-doc) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/bcp-drill-doc)
* **[handover](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/handover)**：AI 工作記憶交班。跨會話（Session）、裝置或 AI 代理的記憶與脈絡交班技能。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/handover) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/handover)

---


### GitHub 推薦開源工具技能 (4)
* **[[01] langchain](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/langchain)**：需求場景拆解、語意整理與鏈式呼叫工具。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/01_planning_and_analysis/langchain) / [原始 GitHub 倉庫](https://github.com/langchain-ai/langchain)
* **[[02] llamaindex](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/llamaindex)**：文件數據索引萃取與關鍵需求擷取工具。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/01_planning_and_analysis/llamaindex) / [原始 GitHub 倉庫](https://github.com/run-llama/llama_index)
* **[[03] docling](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/docling)**：各式複雜文件（PDF, Word等）轉換為標準 Markdown 格式工具。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/01_planning_and_analysis/docling) / [原始 GitHub 倉庫](https://github.com/DS4SD/docling)
* **[[04] docusaurus](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/docusaurus)**：需求文件靜態版本網站建置與版本化管理。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/01_planning_and_analysis/docusaurus) / [原始 GitHub 倉庫](https://github.com/facebook/docusaurus)


### GitHub 推薦開源文檔技能合集 (1)
* **[[19] document-skills](file:///d:/00AI協作/SSDLC_Skill/skills/01_planning_and_analysis/document-skills)**：增強版文件處理技能合集，涵蓋 docx、pdf、pptx、xlsx 四種格式的進階操作、OOXML 底層編輯、HTML 轉換與試算表重算。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/01_planning_and_analysis/document-skills) / [原始 GitHub 倉庫](https://github.com/appautomaton/document-SKILLs)

## 2. 系統設計
本階段技能用於前端 UI 原型設計、配色、品牌風格套用、系統分析（SA/SD）設計與簡報配音。

### Anthropic 官方技能 (6)
* **[frontend-design](file:///d:/00AI協作/SSDLC_Skill/skills/02_system_design/frontend-design)**：前端 UI 視覺設計引導。協助規劃字型排版與視覺方向，避免模板化設計。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/anthropics-skills/skills/frontend-design) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/frontend-design)
* **[theme-factory](file:///d:/00AI協作/SSDLC_Skill/skills/02_system_design/theme-factory)**：配色主題工具。提供 10 種預設配色與字型主題，可套用至簡報、網頁或文件。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/anthropics-skills/skills/theme-factory) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/theme-factory)
* **[brand-guidelines](file:///d:/00AI協作/SSDLC_Skill/skills/02_system_design/brand-guidelines)**：品牌色彩規範。套用 Anthropic 官方配色與字型等設計標準。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/anthropics-skills/skills/brand-guidelines) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/brand-guidelines)
* **[canvas-design](file:///d:/00AI協作/SSDLC_Skill/skills/02_system_design/canvas-design)**：靜態視覺與海報設計。用於建立高品質的 PNG 與 PDF 靜態藝術海報。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/anthropics-skills/skills/canvas-design) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/canvas-design)
* **[algorithmic-art](file:///d:/00AI協作/SSDLC_Skill/skills/02_system_design/algorithmic-art)**：演算法藝術生成。使用 p5.js 與隨機參數生成互動式視覺藝術。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/anthropics-skills/skills/algorithmic-art) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/algorithmic-art)
* **[slack-gif-creator](file:///d:/00AI協作/SSDLC_Skill/skills/02_system_design/slack-gif-creator)**：動畫 GIF 產生器。製作與驗證適用於 Slack 的動態 GIF 規格。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/anthropics-skills/skills/slack-gif-creator) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/slack-gif-creator)

### Benson 自建技能 (7)
* **[bootstrap-ui](file:///d:/00AI協作/SSDLC_Skill/skills/02_system_design/bootstrap-ui)**：Bootstrap 互動式原型設計。使用 Bootstrap 5 快速建立前端 UI 與互動式 HTML 雛形畫面。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/bootstrap-ui) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/bootstrap-ui)
* **[sa-design](file:///d:/00AI協作/SSDLC_Skill/skills/02_system_design/sa-design)**：系統分析設計（SA/SD）。吃 HTML 雛形，反推並產生實體關係模型（ER Model）、資料字典、系統架構圖與 API spec 文件。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/sa-design) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/sa-design)
* **[easymap](file:///d:/00AI協作/SSDLC_Skill/skills/02_system_design/easymap)**：GIS 圖台開發助理。針對 Easymap 7 GIS 圖台提供開發支援與架構設計輔助。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/easymap) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/easymap)
* **[image-gen](file:///d:/00AI協作/SSDLC_Skill/skills/02_system_design/image-gen)**：通用圖片生成。配合 AI 繪圖工具生成相關專案示意圖或 UI 設計參考圖。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/image-gen) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/image-gen)
* **[proposal-narration](file:///d:/00AI協作/SSDLC_Skill/skills/02_system_design/proposal-narration)**：簡報配音影片產生器。將提案簡報 PPTX / PDF 轉為含有自動生成語音旁白的 MP4 影音檔。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/proposal-narration) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/proposal-narration)
* **[ekb-note-tts](file:///d:/00AI協作/SSDLC_Skill/skills/02_system_design/ekb-note-tts)**：知識庫筆記配音。將 EKB 知識庫內的筆記轉換為配上 AI 語音講解的語音資源。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/ekb-note-tts) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/ekb-note-tts)
* **[ai-news-video](file:///d:/00AI協作/SSDLC_Skill/skills/02_system_design/ai-news-video)**：AI 新聞影音產出。自動抓取每週 AI 新聞並產出影片腳本、配音配樂與 MP4 檔案。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/ai-news-video) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/ai-news-video)

---


### GitHub 推薦開源工具技能 (4)
* **[[01] mermaid](file:///d:/00AI協作/SSDLC_Skill/skills/02_system_design/mermaid)**：以文字繪製專案流程圖、系統架構圖與狀態圖。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/02_system_design/mermaid) / [原始 GitHub 倉庫](https://github.com/mermaid-js/mermaid)
* **[[02] plantuml](file:///d:/00AI協作/SSDLC_Skill/skills/02_system_design/plantuml)**：產生精確 UML 類別圖、序列圖與部署圖的標準設計工具。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/02_system_design/plantuml) / [原始 GitHub 倉庫](https://github.com/plantuml/plantuml)
* **[[03] prisma](file:///d:/00AI協作/SSDLC_Skill/skills/02_system_design/prisma)**：資料庫實體關係圖 (ER Model)、Schema 與 SQL DDL 產生工具。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/02_system_design/prisma) / [原始 GitHub 倉庫](https://github.com/prisma/prisma)
* **[[04] openapi_generator](file:///d:/00AI協作/SSDLC_Skill/skills/02_system_design/openapi_generator)**：自動產生符合 OpenAPI 規格的 API 文件與介面程式碼。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/02_system_design/openapi_generator) / [原始 GitHub 倉庫](https://github.com/OpenAPITools/openapi-generator)


## 3. 開發與編碼
本階段技能用於開發任務管理、程式碼實作、MCP 伺服器建置、API 規格查詢與自訂技能管理。

### Anthropic 官方技能 (4)
* **[web-artifacts-builder](file:///d:/00AI協作/SSDLC_Skill/skills/03_implementation_and_coding/web-artifacts-builder)**：網頁應用建置。使用 React、Tailwind CSS 與 shadcn/ui 設計多組件的前端應用。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/anthropics-skills/skills/web-artifacts-builder) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/web-artifacts-builder)
* **[mcp-builder](file:///d:/00AI協作/SSDLC_Skill/skills/03_implementation_and_coding/mcp-builder)**：MCP 伺服器建置。使用 Python 或 Node.js/TypeScript 開發 Model Context Protocol 伺服器以對接外部服務。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/anthropics-skills/skills/mcp-builder) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/mcp-builder)
* **[claude-api](file:///d:/00AI協作/SSDLC_Skill/skills/03_implementation_and_coding/claude-api)**：Claude API 整合指引。提供 API 參數、計價、Tokens 計算與快取的參考手冊。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/anthropics-skills/skills/claude-api) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/claude-api)
* **[skill-creator](file:///d:/00AI協作/SSDLC_Skill/skills/03_implementation_and_coding/skill-creator)**：AI 技能開發。建立新技能、測試與優化 SKILL.md 的觸發精準度。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/anthropics-skills/skills/skill-creator) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/skill-creator)

### Benson 自建技能 (7)
* **[project-dev-manager](file:///d:/00AI協作/SSDLC_Skill/skills/03_implementation_and_coding/project-dev-manager)**：專案開發管理。管理與追蹤開發任務，從需求討論、程式碼修改到開發進度控管的標準流程。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/project-dev-manager) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/project-dev-manager)
* **[eip-item-builder](file:///d:/00AI協作/SSDLC_Skill/skills/03_implementation_and_coding/eip-item-builder)**：EIP 工項自動建置。直接對接 EIP 內部工項追蹤系統進行工項的自動派案與紀錄。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/eip-item-builder) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/eip-item-builder)
* **[ekb-note](file:///d:/00AI協作/SSDLC_Skill/skills/03_implementation_and_coding/ekb-note)**：EKB 知識庫讀寫工具。提供讀取與寫入 Benson 自建 EKB 知識庫（系統分析筆記與開發規範紀錄）的端點。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/ekb-note) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/ekb-note)
* **[fortigate-api-spec](file:///d:/00AI協作/SSDLC_Skill/skills/03_implementation_and_coding/fortigate-api-spec)**：FortiGate REST API 查詢。提供 FortiOS API 規格與參數的快速查閱，輔助整合式開發。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/fortigate-api-spec) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/fortigate-api-spec)
* **[fortigate-qa](file:///d:/00AI協作/SSDLC_Skill/skills/03_implementation_and_coding/fortigate-qa)**：FortiGate 設定檔自然語言問答。解析 FortiGate 備份設定檔並進行安全規則問答與設定除錯。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/fortigate-qa) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/fortigate-qa)
* **[benson-skill-sync](file:///d:/00AI協作/SSDLC_Skill/skills/03_implementation_and_coding/benson-skill-sync)**：技能同步與封裝工具。一鍵將本機 `~/.claude/skills` 下的新技能自動複製、打包、產生 README 並推送至 GitHub Marketplace。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/benson-skill-sync) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/benson-skill-sync)
* **[project-dashboard](file:///d:/00AI協作/SSDLC_Skill/skills/03_implementation_and_coding/project-dashboard)**：專案進度儀表板。自動掃描專案目錄並產出包含 WBS、甘特圖、專案資產與健檢報告的互動式進度網頁。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/project-dashboard) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/project-dashboard)

---


### GitHub 推薦開源工具技能 (5)
* **[[01] continue_dev](file:///d:/00AI協作/SSDLC_Skill/skills/03_implementation_and_coding/continue_dev)**：本機 AI 輔助寫碼、語境理解與程式產生套件。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/03_implementation_and_coding/continue_dev) / [原始 GitHub 倉庫](https://github.com/continuedev/continue)
* **[[02] codellama](file:///d:/00AI協作/SSDLC_Skill/skills/03_implementation_and_coding/codellama)**：本地離線代碼編譯、語法生成與程式碼自動補全核心。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/03_implementation_and_coding/codellama) / [原始 GitHub 倉庫](https://github.com/facebookresearch/codellama)
* **[[03] eslint](file:///d:/00AI協作/SSDLC_Skill/skills/03_implementation_and_coding/eslint)**：代碼語法與靜態邏輯檢核，維護團隊代碼品質。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/03_implementation_and_coding/eslint) / [原始 GitHub 倉庫](https://github.com/eslint/eslint)
* **[[04] prettier](file:///d:/00AI協作/SSDLC_Skill/skills/03_implementation_and_coding/prettier)**：代碼風格美化與自動格式化，避免排版衝突。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/03_implementation_and_coding/prettier) / [原始 GitHub 倉庫](https://github.com/prettier/prettier)
* **[[05] nx](file:///d:/00AI協作/SSDLC_Skill/skills/03_implementation_and_coding/nx)**：大型專案多模組與依賴關係的整合管控工具。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/03_implementation_and_coding/nx) / [原始 GitHub 倉庫](https://github.com/nrwl/nx)


### Anthropic 官方插件技能 (1)
* **[[16] code-simplifier](file:///d:/00AI協作/SSDLC_Skill/skills/03_implementation_and_coding/code-simplifier)**：程式碼簡化與精煉。在保留所有功能的前提下，提升程式碼清晰度、一致性與可維護性。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/03_implementation_and_coding/code-simplifier) / [原始 GitHub 倉庫](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-simplifier)

## 4. 測試驗證
本階段技能用於前端功能自動化測試、後端功能驗證、API 與資安漏洞掃描。

### Anthropic 官方技能 (1)
* **[webapp-testing](file:///d:/00AI協作/SSDLC_Skill/skills/04_testing/webapp-testing)**：網頁應用測試。利用 Playwright 對本機應用程式進行自動化 UI 驗證、除錯與截圖。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/anthropics-skills/skills/webapp-testing) / [原始 GitHub 倉庫](https://github.com/anthropics/skills/tree/main/skills/webapp-testing)

### Benson 自建技能 (1)
* **[service-sqa](file:///d:/00AI協作/SSDLC_Skill/skills/04_testing/service-sqa)**：自主系統與資安檢測。模擬品質保證工程師（QA）對 PHP Web App 執行功能驗證、越權測試、CRUD 完整性以及安全弱點掃描。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/service-sqa) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/service-sqa)

---


### GitHub 推薦開源工具技能 (8)
* **[[01] playwright](file:///d:/00AI協作/SSDLC_Skill/skills/04_testing/playwright)**：主流 UI 自動化測試與跨瀏覽器兼容性回歸測試套件。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/04_testing/playwright) / [原始 GitHub 倉庫](https://github.com/microsoft/playwright)
* **[[02] selenium](file:///d:/00AI協作/SSDLC_Skill/skills/04_testing/selenium)**：傳統網頁與多瀏覽器的自動化測試與兼容性回歸測試工具。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/04_testing/selenium) / [原始 GitHub 倉庫](https://github.com/SeleniumHQ/selenium)
* **[[03] cypress](file:///d:/00AI協作/SSDLC_Skill/skills/04_testing/cypress)**：前端單頁面應用 (SPA) 的快速自動化回歸測試框架。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/04_testing/cypress) / [原始 GitHub 倉庫](https://github.com/cypress-io/cypress)
* **[[04] robot_framework](file:///d:/00AI協作/SSDLC_Skill/skills/04_testing/robot_framework)**：基於關鍵字驅動的通用自動化測試與驗收框架。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/04_testing/robot_framework) / [原始 GitHub 倉庫](https://github.com/robotframework/robotframework)
* **[[05] pytest](file:///d:/00AI協作/SSDLC_Skill/skills/04_testing/pytest)**：Python 單元測試與多功能測試驗證框架。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/04_testing/pytest) / [原始 GitHub 倉庫](https://github.com/pytest-dev/pytest)
* **[[06] jest](file:///d:/00AI協作/SSDLC_Skill/skills/04_testing/jest)**：JavaScript / TypeScript 的單元測試與 Mock 驗證工具。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/04_testing/jest) / [原始 GitHub 倉庫](https://github.com/jestjs/jest)
* **[[07] sonarqube](file:///d:/00AI協作/SSDLC_Skill/skills/04_testing/sonarqube)**：專案原始碼安全漏洞、壞味道與代碼品質靜態掃描。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/04_testing/sonarqube) / [原始 GitHub 倉庫](https://github.com/SonarSource/sonarqube)
* **[[08] coverage_py](file:///d:/00AI協作/SSDLC_Skill/skills/04_testing/coverage_py)**：Python 測試覆蓋率分析與未涵蓋代碼報告器。
* **[[09] systematic-debugging](file:///d:/00AI協作/SSDLC_Skill/skills/04_testing/systematic-debugging)**：系統化除錯方法。在遇到任何 bug、測試失敗或非預期行為時，於提出修復方案之前先進行根因分析。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/04_testing/systematic-debugging) / [原始 GitHub 倉庫](https://github.com/obra/superpowers)
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/04_testing/coverage_py) / [原始 GitHub 倉庫](https://github.com/nedbat/coveragepy)


## 5. 部署發布
本階段技能用於自動化建置、寫入數位簽章與部署環境型態比對。
* *(目前尚無對應技能 - 待擴充)*

---


### GitHub 推薦開源工具技能 (3)
* **[[01] docker](file:///d:/00AI協作/SSDLC_Skill/skills/05_deployment/docker)**：容器化服務打包、鏡像製作與多服務 Docker Compose 部署。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/05_deployment/docker) / [原始 GitHub 倉庫](https://github.com/docker/docker-ce)
* **[[02] ansible](file:///d:/00AI協作/SSDLC_Skill/skills/05_deployment/ansible)**：伺服器自動化組態管理、主機配置與遠端批次部署。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/05_deployment/ansible) / [原始 GitHub 倉庫](https://github.com/ansible/ansible)
* **[[03] nginx_config_generator](file:///d:/00AI協作/SSDLC_Skill/skills/05_deployment/nginx_config_generator)**：Web 伺服器反向代理與負載平衡組態檔自動產生器。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/05_deployment/nginx_config_generator) / [原始 GitHub 倉庫](https://github.com/nginx/nginx)


## 6. 維護監控
本階段技能用於系統上線後的資安內部稽核準備，以及線上運行訊號與討論輿情監控。

### Benson 自建技能 (2)
* **[isms-audit-prep](file:///d:/00AI協作/SSDLC_Skill/skills/06_maintenance/isms-audit-prep)**：資安稽核準備助理。引導完成內部資安稽核流程準備，產出查檢清單 Excel 文件。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/isms-audit-prep) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/isms-audit-prep)
* **[eip-line-radar](file:///d:/00AI協作/SSDLC_Skill/skills/06_maintenance/eip-line-radar)**：EIP LINE 訊號雷達。掃描與挖掘上線後相關 LINE 群組討論，執行問題通報與輿情監控。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/Benson-skill-main_FromBensonSupport/plugins/benson-skills/skills/eip-line-radar) / [原始 GitHub 倉庫](https://github.com/MMBenson/Benson-skill/tree/main/plugins/benson-skills/skills/eip-line-radar)


### GitHub 推薦開源工具技能 (4)
* **[[01] elk_stack](file:///d:/00AI協作/SSDLC_Skill/skills/06_maintenance/elk_stack)**：線上日誌集中化收集、Elasticsearch 檢索與日誌異常分析。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/06_maintenance/elk_stack) / [原始 GitHub 倉庫](https://github.com/elastic/elasticsearch)
* **[[02] prometheus_grafana](file:///d:/00AI協作/SSDLC_Skill/skills/06_maintenance/prometheus_grafana)**：系統硬體指標與服務效能監控、即時 Grafana 圖表告警機制。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/06_maintenance/prometheus_grafana) / [原始 GitHub 倉庫](https://github.com/prometheus/prometheus)
* **[[03] opentelemetry](file:///d:/00AI協作/SSDLC_Skill/skills/06_maintenance/opentelemetry)**：雲原生 APM 效能瓶頸、調用鏈分佈式追蹤系統。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/06_maintenance/opentelemetry) / [原始 GitHub 倉庫](https://github.com/open-telemetry/opentelemetry-specification)
* **[[04] logparser](file:///d:/00AI協作/SSDLC_Skill/skills/06_maintenance/logparser)**：雜亂日誌自動清理、正則篩選與格式化輸出分析。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/06_maintenance/logparser) / [原始 GitHub 倉庫](https://github.com/Microsoft/LogParser-Studio-References)

## 跨階段全域共用 Skill
本階段技能用於跨階段的狀態管理、版本控制與程式碼差異比對。

### GitHub 推薦開源工具技能 (3)
* **[[01] langgraph](file:///d:/00AI協作/SSDLC_Skill/skills/00_cross_phase/langgraph)**：複雜狀態多 Agent 協作工作流的圖形狀態管理引擎。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/00_cross_phase/langgraph) / [原始 GitHub 倉庫](https://github.com/langchain-ai/langgraph)
* **[[02] git](file:///d:/00AI協作/SSDLC_Skill/skills/00_cross_phase/git)**：全域版本控制、分支管理與 Baseline 基線封存追溯工具。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/00_cross_phase/git) / [原始 GitHub 倉庫](https://github.com/git/git)
* **[[03] diffsync](file:///d:/00AI協作/SSDLC_Skill/skills/00_cross_phase/diffsync)**：跨階段專案原始碼版本差異對比與同步工具。
* **[[04] autoresearch](file:///d:/00AI協作/SSDLC_Skill/skills/00_cross_phase/autoresearch)**：自主目標導向迭代循環。自動修改、驗證、保留/丟棄，針對任意指標進行最佳化，靈感來自 Karpathy。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/00_cross_phase/autoresearch) / [原始 GitHub 倉庫](https://github.com/uditgoenka/autoresearch)
* **[[05] brainstorming](file:///d:/00AI協作/SSDLC_Skill/skills/00_cross_phase/brainstorming)**：創意發想引導。在任何創意工作前探索使用者意圖、需求與設計方向。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/00_cross_phase/brainstorming) / [原始 GitHub 倉庫](https://github.com/obra/superpowers)
* **[[06] firecrawl](file:///d:/00AI協作/SSDLC_Skill/skills/00_cross_phase/firecrawl)**：網頁內容擷取、截圖、結構化資料提取、網頁搜尋與文件網站爬蟲。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/00_cross_phase/firecrawl) / [原始 GitHub 倉庫](https://github.com/BexTuychiev/firecrawl-claude-code-skill)
* **[[07] test-driven-development](file:///d:/00AI協作/SSDLC_Skill/skills/00_cross_phase/test-driven-development)**：測試驅動開發流程。在撰寫實作程式碼之前先寫測試。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/00_cross_phase/test-driven-development) / [原始 GitHub 倉庫](https://github.com/obra/superpowers)
* **[[08] verification-before-completion](file:///d:/00AI協作/SSDLC_Skill/skills/00_cross_phase/verification-before-completion)**：完成前驗證。在聲稱工作完成、修復或通過之前執行驗證命令並確認輸出。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/00_cross_phase/verification-before-completion) / [原始 GitHub 倉庫](https://github.com/obra/superpowers)
* **[[09] writing-plans](file:///d:/00AI協作/SSDLC_Skill/skills/00_cross_phase/writing-plans)**：撰寫實作計畫。在接觸程式碼之前，先制定多步驟任務的規格與需求。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/00_cross_phase/writing-plans) / [原始 GitHub 倉庫](https://github.com/obra/superpowers)
* **[[10] ralph-loop](file:///d:/00AI協作/SSDLC_Skill/skills/00_cross_phase/ralph-loop)**：自主 AI 開發循環。自動化修改→測試→驗證→保留/丟棄的迭代流程，具備智慧退出偵測。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/00_cross_phase/ralph-loop) / [原始 GitHub 倉庫](https://github.com/frankbria/ralph-claude-code)
* **[[11] using-superpowers](file:///d:/00AI協作/SSDLC_Skill/skills/00_cross_phase/using-superpowers)**：Skill 尋找與使用引導。教導 AI 代理如何在對話中主動發現、呼叫與使用可用技能。
  * **追溯來源**：[本機外部資源目錄](file:///d:/00AI協作/SSDLC_Skill/external-resources/github-skills/00_cross_phase/using-superpowers) / [原始 GitHub 倉庫](https://github.com/obra/superpowers)
