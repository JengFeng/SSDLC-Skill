# 技能歸類技能 (Skill Categorizer)

本文件定義了將外部下載的技能檔案（例如來自 `anthropics/skills` 或 `Benson-skill`）自動歸類至軟體生命週期（SSDLC）各階段的標準作業流程。

## 軟體開發生命週期（SSDLC）6 個階段定義
本專案依據 `template_skill.md` 規範，將開發流程劃分為以下 6 個階段：
1. `01_planning_and_analysis` (規劃與需求分析階段)
2. `02_system_design` (系統設計階段)
3. `03_implementation_and_coding` (系統開發與實作階段)
4. `04_testing` (測試階段)
5. `05_deployment` (部署階段)
6. `06_maintenance` (維護階段)

## 技能分類規則與映射表

### 1. 01_planning_and_analysis
* **適用技能**：協同文件撰寫、內部溝通與通用文件/數據處理。
* **技能清單**：`doc-coauthoring`、`internal-comms`、`docx`、`xlsx`、`pdf`、`pptx`。

### 2. 02_system_design
* **適用技能**：前端視覺設計、主題配色、品牌規範、靜態藝術設計與演算法生成。
* **技能清單**：`frontend-design`、`theme-factory`、`brand-guidelines`、`canvas-design`、`algorithmic-art`、`slack-gif-creator`。

### 3. 03_implementation_and_coding
* **適用技能**：前端編碼、MCP 伺服器建置、API 參數調校與自訂 AI 技能。
* **技能清單**：`web-artifacts-builder`、`mcp-builder`、`claude-api`、`skill-creator`。

### 4. 04_testing
* **適用技能**：自動化 UI 驗證、網頁測試與除錯。
* **技能清單**：`webapp-testing`。

### 5. 05_deployment
* **適用技能**：自動化建置、寫入數位簽章與部署環境驗證。
* *(目前無對應技能)*

### 6. 06_maintenance
* **適用技能**：線上故障分析、熱修補程式編寫。
* *(目前無對應技能)*

## 執行步驟 SOP

當觸發此技能時，請執行以下步驟：
1. **建立目錄結構**：若 `skills/` 目錄下尚未建立上述 6 個階段的子資料夾，請使用 PowerShell 建立它們。
2. **複製並歸類檔案**：將外部資源資料夾（例如 `external-resources/anthropics-skills/skills/`）中的各技能資料夾，複製到 `skills/` 下對應的子資料夾中。
3. **加註來源並更新索引表**：
   * 在 `skills/README.md` 中，列出 6 大階段的標題與其下的技能。
   * 每個技能皆須提供其功能用途說明。
   * 每個技能皆須加註其來源出處，包含 **[本機外部資源目錄]** 與 **[原始 GitHub 倉庫]** 的連結。
   * 本機外部資源目錄格式：`file:///d:/00AI協作/SSDLC_Skill/external-resources/anthropics-skills/skills/<skill-name>`
   * 原始 GitHub 倉庫格式：`https://github.com/anthropics/skills/tree/main/skills/<skill-name>`
