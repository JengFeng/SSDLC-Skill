---
name: Harness Optimization
description: 執行整個駕馭工程的框架優化。當使用者說「幫我執行駕馭工程框架優化檢查」或「Harness Optimization Skill」時觸發，進行地毯式之檔案關聯性、格式與排版優化。
---

# 執行整個駕馭工程的框架優化 (Harness Optimization)

本技能定義了當使用者口語化提出「幫我執行駕馭工程框架優化檢查」或「Harness Optimization Skill」時，AI 協作代理必須執行的地毯式檢查與優化 SOP。此流程旨在確保腦力激盪過程中，各核心檔案的關聯性不致斷裂，且排版防線完整。

---

> ⚠️ **框架建造者專用指令**：本技能僅限 SSDLC 框架建造者在設計/調整框架範本時使用。專案開發者（在個別工作目錄內開發應用程式者）不應呼叫此指令。執行前 AI 代理必須確認目前工作目錄為框架根目錄，並顯示警告提示取得使用者確認。

## 一、 核心檢查對照與關聯防線 (Linkage & Consistency)

AI 代理必須依序對以下 9 大檢查組（涵蓋 20+ 組核心檔案與目錄）進行地毯式關聯性檢查，發現不一致或超連結失效時，必須立即進行同步優化：

### 1. 最高指導守則防線 (`docs/CORE_RULES.md`)
*   **檢查點**：
    1. 確認所有規章文件（`.agents/AGENTS.md`、`AGENTS.md`、`TEMPLATE_SKILL.md`）頂部皆有關聯宣告指向本文件，且均視其為最高指導框架原則。
    2. 確認內容為平台無關的「通用進程駐留」、「檔案鎖定檢核」、「雙軌日誌」等通則，無殘留 Windows 特定描述。
    3. 確認 6 個開發階段已對正為「第一階段：規劃與需求分析」至「第六階段：維護監控」的顯性中文標記。
    4. 確認各階段的核心用途與 Skill 屬性描述，與 `.agents/skills/0*_*/SKILL.md` 中各階段 SKILL.md 的職責定義一致，無缺漏或矛盾。

### 2. 規章鏈與引導防線 (`.agents/AGENTS.md`、`AGENTS.md`、`docs/commands_reference.md`)
*   **檢查點**：
    1. 確認根目錄 `AGENTS.md` 頂部已宣告最高守則，並包含相對超連結指向 `.agents/AGENTS.md`。
    2. 確認 `.agents/AGENTS.md` 頂部包含相對超連結指向 `docs/CORE_RULES.md`，且其內部對話指令協議（`@stages`、`@optimize`、`@[階段]`、`@init`、快捷編號還原、逗號聯合導入、語音喚出）與 `docs/commands_reference.md` 完全一致，無遺漏或矛盾。
    3. 確認 `.agents/AGENTS.md` 中的分級重試規則（A 類重試 3 次、B 類升級全域迭代上限 2 輪）與 `docs/CORE_RULES.md` 及 `docs/TEMPLATE_SKILL.md` 第三節一致。

### 3. 專案範本防線 (`docs/TEMPLATE_SKILL.md`)
*   **檢查點**：
    1. 確認目錄結構樹中的目錄配置與本專案實體目錄一致，包含：
       * 根層級 `docs/` 僅含文件（不含 `bug/`、`reg/`）。
       * 根層級 `00_cross_phase/`（跨階段全域共用）存在且含 `SKILL.md` + `inputs/` + `outputs/`。
       * 根層級 `baseline/`（全域組態基準）、`snapshots/`（全域執行快照）、`logs/`（全域錯誤日誌）存在且註釋正確。
       * `01_planning_and_analysis/reg/`（需求歷程記錄區）存在。
       * `04_testing/bug/`（Bug 歷程記錄區）存在。
       * 各階段僅保留 `SKILL.md`、`inputs/`、`outputs/`（以及 `00_cross_phase` 的標準結構、第一階段的 `reg/`、第四階段的 `bug/`）。
    2. 確認目錄樹下方的 `### 目錄結構組態說明與防線註釋` 包含 9 條註釋，完整涵蓋 CORE_RULES、AGENTS 鏈、Harness_Optimization_SKILL、snapshots/logs、baseline、reg、bug、00_cross_phase。
    3. 確認第三節 `三、 AI 協作對話與執行協議` 中對 `snapshots/`、`logs/`、`baseline/` 的路徑引用已更新為根目錄層級（非各階段內），且 `@stages` 描述包含 `00_cross_phase`。

### 3.5 系統設計產出完整性檢查 (02_system_design/outputs/)
*   **檢查點（附加於第 3 組 TEMPLATE_SKILL.md 防線）**：
    1. 確認 02_system_design/outputs/ 至少包含七項標準產出：db_schema.sql、er_diagram.md、api_spec.md、ui_prototype.html、use_case_diagram.puml、activity_diagram.puml、sequence_diagram.puml。
    2. 確認 er_diagram.md 使用 Mermaid erDiagram 語法，欄位與 db_schema.sql 一致。
    3. 確認 ui_prototype.html 為可獨立開啟的互動式 HTML 雛型（Bootstrap 或等效框架）。

### 4. 專案記憶與追溯防線 (`memory.md`、`traceability_matrix.md`、`system_specification.md`)
*   **檢查點**：
    1. 確認 `memory.md` 記錄了最近一次的結構或規章變更，日期與內容與實際異動一致。
    2. 確認 `traceability_matrix.md` 格式符合 `docs/TEMPLATE_SKILL.md` 第二節中的範本定義（包含 REQ 編號、六階段追溯欄位）。
    3. 確認 `system_specification.md` 格式符合範本定義，包含 IEEE 830 六章完整結構（緒論、整體描述、具體需求、系統特性、驗收標準、附錄）。
    4. 確認 `system_specification.md` 中所有引用之文件（UML 圖、API 規格、DB Schema、UI Prototype）皆已轉換為可點擊之相對超連結，點選後可直達目標檔案。

### 5. Skill 目錄與列表防線 (`skills/README.md`、`skills/SKILLS歸類.md`)
*   **檢查點**：
    1. 確認 `skills/README.md` 內所有 Skill 名稱皆為指向本機 `skills/` 實體路徑的可點擊超連結。
    2. 確認階段名稱為 SSDLC 六階段正名，且包含 `00_cross_phase` 跨階段全域共用分類。
    3. 確認 `skills/SKILLS歸類.md` 中的 7 個分類（6 階段 + 1 全域）與 `skills/README.md` 的實際目錄結構一致，映射清單無缺漏。
    4. **根 README Skill 數量同步檢查**：比對根目錄 `README.md` 底部「授權與來源」段落中的各來源 Skill 數量（Anthropic 官方、Anthropic 官方插件、Benson 自建、GitHub 社群）與 `skills/README.md` 實際歸類數量是否一致。
       * 統計方法：從 `skills/README.md` 中每個 Skill 條目的「原始 GitHub 倉庫」連結，依網域分類計數（`anthropics/skills`、`claude-plugins-official`、`MMBenson`、其他 GitHub 社群）。
       * 若根 `README.md` 數量不一致，自動更新為正確數字並確保總和等於實際 Skill 總數。
       * 同時檢查根 `README.md` 標頭附近的 Skill 總數宣告（如「共 XX 個」）是否與實際目錄數量一致。

### 6. `.agents/skills/` 結構與內容防線 (`.agents/skills/0*_*/SKILL.md`)
*   **檢查點**：
    1. 確認 `.agents/skills/` 目錄結構與 `docs/TEMPLATE_SKILL.md` 完全對齊：包含 `00_cross_phase` 至 `06_maintenance` 共 7 個目錄，以及 `reg/`、`bug/` 等子目錄。
    2. 逐一檢查 00 至 06 各階段目錄下的 `SKILL.md` 是否存在且內容完整。
    3. 逐一比對各階段 `SKILL.md` 中的代理人職責定義，與 `docs/CORE_RULES.md` 中該階段的「核心用途」及「Skill 屬性」是否一致，確保無缺漏（特別注意 AI 輔助寫碼/Linter/Formatter、多服務部署/IaC、日誌收集/APM 監控等近期補強項目）。
    4. 確認 `skills/` 目錄下的 Skill 歸類與 `.agents/skills/` 的階段定義一致，無歸屬錯誤。

### 7. 階段間交付物傳遞鏈防線 (`*_*/inputs/`、`*_*/outputs/`)
*   **檢查點**：
    1. 確認各階段 inputs/ 目錄皆包含承接上游 outputs/ 的 brief 檔案（非僅 .gitkeep）。
    2. 確認 brief 檔案中明確引用上游階段 outputs/ 的具體檔案路徑，形成完整追溯鏈。
    3. 傳遞鏈依序檢查：01→02、02→03、03→04、04→05、05→06，確保無斷鏈。

### 8. 全域日誌與快照防線 (`logs/`、`snapshots/`、`baseline/`)
*   **檢查點**：
    1. 確認專案根目錄 `logs/` 目錄存在且非空（應包含應用程式日誌如 `app.log`）。
    2. 確認 `snapshots/` 目錄存在（保留最近 5 筆快照）。
    3. 確認 `baseline/` 目錄存在且已建立 Git tag（格式 `baseline-vX.Y.Z`）。
    4. 各階段應用程式日誌應統一輸出至全域 `logs/`，不應殘留於各階段 `outputs/` 中。

### 9. Baseline 可執行性驗證防線 (`baseline/*/run.bat`、`baseline/*/app.py`)
*   **檢查點**：
    1. **run.bat 語法與編碼檢查**：確認 `baseline/` 下各版本 `run.bat` 使用 UTF-8 BOM 編碼、首行含 `chcp 65001`、`cd /d "%~dp0"` 指向自身目錄、結尾含 `taskkill` 清理邏輯。
    2. **Python 匯入檢查**：對每個 baseline 版本執行 `python -c "import <模組>"`（從該 baseline 目錄執行），確認無 `ModuleNotFoundError` 或 `SyntaxError`。
    3. **Flask 啟動測試**：背景啟動 baseline app，對 `http://127.0.0.1:5000` 發出 HTTP GET 請求，確認回應狀態碼為 200，回應內容含 `</html>` 標籤。
    4. **模板完整性檢查**：確認 `baseline/*/templates/` 目錄存在且含 `index.html`、`form.html`、`base.html`，各模板內容為有效 HTML。
    5. **靜態資源檢查**：確認 `baseline/*/requirements.txt` 存在且內含 `flask` 依賴宣告。
    6. **路徑一致性檢查**：確認 baseline 中 `app.py` 使用 `os.path.abspath(__file__)` 絕對路徑（非脆弱相對路徑），日誌與 DB 路徑指向正確的根層級 `logs/` 與自身目錄。
*   **失敗處理**：任一檢查失敗即於對話中輸出「Baseline 可執行性驗證失敗報告」，包含版本號、失敗項目、根因分析、建議修復方案。

## 二、 格式與排版防線 (Formatting & Typesetting)

AI 代理必須檢查上述所有修改檔案是否嚴格符合以下繁體中文排版規範：

1.  **唯一語境**：一律使用台灣繁體中文（如：最佳化、專案、資訊、檔案），嚴禁使用簡體字與大陸用語。
2.  **空格規範**：中文字元與英文、半形數字之間必須保留一個半形空格；全形標點與其他字元之間不加空格；超連結前後保留空格以利閱讀。
3.  **語氣限制**：維持務實冷靜語氣。嚴禁使用 Emoji，且不重複使用標點符號。

---

## 三、 執行步驟與回饋流程 (Execution Steps)

當觸發「執行整個駕馭工程的框架優化」時，AI 代理必須執行以下步驟：

### 步驟一：靜態分析與關聯稽核 (Cross-Audit)
1. 讀取上述 9 大檢查組（含根 README.md 在內共涵蓋 20+ 組核心檔案與目錄）的內容。
2. 比對各超連結路徑，若有實體檔案移動或重命名，必須自動更新所有引用處的超連結。
3. 檢查名詞定義（如 SSDLC 階段名稱、目錄名稱、Skill 名稱）在各檔案間是否一致，列出不連貫的清單。
4. 檢查 `docs/TEMPLATE_SKILL.md` 目錄樹與實際專案目錄結構是否一致。
5. 比對各階段 `SKILL.md` 職責定義與 `docs/CORE_RULES.md` 階段屬性是否一致。

### 步驟二：執行優化與格式修復 (Repair & Optimize)
1. 針對不連貫與失效的連結進行自動代碼修補。
2. 掃描修補全產物中缺失的「中英文半形空格」與「簡體字 / 大陸用語」，進行全域替換。
3. 確保 `docs/TEMPLATE_SKILL.md` 範本中的目錄結構與註釋說明，隨時與實體規章之更新保持一致。
4. 若發現任一階段 `SKILL.md` 內容與其實際 `skills/` 目錄下的技能配置或 `CORE_RULES.md` 定義不一致，自動同步更新。

### 步驟三：執行 Baseline 可執行性驗證 (Baseline Live Verification)
1. 逐一對 `baseline/` 下所有版本執行第 9 組的所有檢查點（run.bat 語法、Python 匯入、HTTP 啟動測試、模板完整性）。
2. 驗證期間若發現端口 5000 被佔用，先 `taskkill` 清理殘留程序後再重試。
3. 若任一 baseline 版本驗證失敗，先嘗試自動修復（修正編碼、路徑、依賴缺失），修復後重新驗證。

### 步驟四：產出報告與同步 Baseline (Report & Sync)
1. 於對話中輸出框架優化成果報告（以「Status + Root Cause + Suggested Fix」格式說明修補處）。
2. 輸出 Baseline 可執行性驗證摘要（各版本 HTTP 狀態碼、模板數量、檢查通過/失敗清單）。
3. 自動建立 Git 暫存基線（Baseline），並在 `memory.md` 載入本次優化之異動紀錄。