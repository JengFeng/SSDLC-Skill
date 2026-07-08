---
name: Harness Optimization
description: 執行整個駕馭工程的框架優化。當使用者說「幫我執行駕馭工程框架優化檢查」或「Harness Optimization Skill」時觸發，進行地毯式之檔案關聯性、格式與排版優化。
---

# 執行整個駕馭工程的框架優化 (Harness Optimization)

本技能定義了當使用者口語化提出「幫我執行駕馭工程框架優化檢查」或「Harness Optimization Skill」時，AI 協作代理必須執行的地毯式檢查與優化 SOP。此流程旨在確保腦力激盪過程中，各核心檔案的關聯性不致斷裂，且排版防線完整。

---

> ⚠️ **框架建造者專用指令**：本技能僅限 SSDLC 框架建造者在設計/調整框架範本時使用。專案開發者（在個別工作目錄內開發應用程式者）不應呼叫此指令。執行前 AI 代理必須確認目前工作目錄為框架根目錄，並顯示警告提示取得使用者確認。

## 一、 核心檢查對照與關聯防線 (Linkage & Consistency)

AI 代理必須依序對以下 11 大檢查組（涵蓋 20+ 組核心檔案與目錄）進行地毯式關聯性檢查，發現不一致或超連結失效時，必須立即進行同步優化：

### 1. 最高指導守則防線 (`docs/CORE_RULES.md`)
*   **檢查點**：
    1. 確認所有規章文件（`.agents/AGENTS.md`、`AGENTS.md`、`TEMPLATE_SKILL.md`）頂部皆有關聯宣告指向本文件，且均視其為最高指導框架原則。
    2. 確認內容為平台無關的「通用進程駐留」、「檔案鎖定檢核」、「雙軌日誌」等通則，無殘留 Windows 特定描述。
    3. 確認 6 個開發階段已對正為「第一階段：規劃與需求分析」至「第六階段：維護與營運」的顯性中文標記。
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

### 4. 系統設計產出完整性檢查 (02_system_design/outputs/)
*   **檢查點（附加於第 3 組 TEMPLATE_SKILL.md 防線）**：
    1. 確認 02_system_design/outputs/ 至少包含七項標準產出：db_schema.sql、er_diagram.md、api_spec.md、ui_prototype.html、use_case_diagram.md、activity_diagram.md、sequence_diagram.md。
    2. 確認 er_diagram.md 使用 Mermaid erDiagram 語法，欄位與 db_schema.sql 一致。
    3. 確認 ui_prototype.html 為可獨立開啟的互動式 HTML 雛型（Bootstrap 或等效框架）。


### 5. 可執行規格 YAML SSOT 防線 (`specs/executable_spec.yaml`)
*   **檢查點（附加於第 3 組 TEMPLATE_SKILL.md 防線）**：
    1. 確認 `specs/executable_spec.yaml` 存在且為有效 YAML 語法。
    2. 確認 YAML 包含全部 9 個頂層區塊：`project`、`phase_01~06`、`traceability`、`change_log`。
    3. 確認各階段 `status` 欄位值在允許範圍內（`pending` / `in_progress` / `completed`）。
    4. 確認已完成階段的 `evaluator.passed` 為 `true` 且 `baseline` 欄位非空。
    5. 確認 `project.version` 與 `change_log` 最新版本一致。
    6. 確認跨階段一致性：下游 `inputs` 引用的檔案路徑存在於上游 `outputs` 中。
    7. 確認 `specs/README.md` 存在，內容包含雙格式架構說明。

### 6. 專案記憶與追溯防線 (`memory.md`、`traceability_matrix.md`、`system_specification.md`)
*   **檢查點**：
    1. **memory.md 會話記錄完整性檢查（Session Recording）**：
       - 依據 `docs/TEMPLATE_SKILL.md` 第五節「專案記憶記錄協議」，AI 代理必須在每次對話 session 結束時寫入 `memory.md`。
       - 檢查當前 `memory.md` 最後一條記錄的時間戳是否為**本次 session 期間**（與當前系統時間差距 < 24 小時且日期一致）。
       - 若最後記錄時間戳距今超過 24 小時，或無本次 session 的記錄 → ❌ 表示本 session 尚未寫入記錄，需立即補寫。
       - 補寫內容必須包含：本次 session 開始/結束時間、討論主題摘要、關鍵決策、產出檔案清單。
    2. **memory.md 五大區塊完整性檢查**：
       - 確認 `memory.md` 包含五個必要區塊：專案概覽、對話歷程（含時間戳）、關鍵決策紀錄、當前狀態、Git 版本歷程。
       - 任一區塊缺失 → ❌ 需補齊。
    3. 確認 `memory.md` 記錄了最近一次的結構或規章變更，日期與內容與實際異動一致。
    4. 確認 `traceability_matrix.md` 格式符合 `docs/TEMPLATE_SKILL.md` 第二節中的範本定義（包含 REQ 編號、六階段追溯欄位）。
    5. 確認 `system_specification.md` 格式符合範本定義，包含六章完整結構（緒論、整體描述、具體需求、系統特性、驗收標準、附錄）。
    6. 確認 `system_specification.md` 中所有引用之文件（UML 圖、API 規格、DB Schema、UI Prototype）皆已轉換為可點擊之相對超連結，點選後可直達目標檔案。
*   **失敗處理**：檢查點 1 失敗時，自動補寫本次 session 的會話記錄至 `memory.md`；其他檢查點失敗時立即修正。

### 7. Skill 目錄與列表防線 (`skills/README.md`、`skills/SKILLS歸類.md`、根 `README.md` 推薦表)

> 📌 **角色定位**：本檢查組為**最後一致性驗證關卡**，負責偵測並修復因分類階段遺漏導致的數字不一致。新增 Skill 時的同步更新（`skills/README.md` 開頭統計、`skills/SKILLS歸類.md` 清單、根 `README.md` 總數與推薦表）應在分類階段依照 `skills/SKILLS歸類.md` 的「執行步驟 SOP」完成，本檢查僅做最終核對與補救。若本檢查發現不一致，表示 SOP 步驟 3-5 未完整執行。

*   **檢查點**：
    1. 確認 `skills/README.md` 內所有 Skill 名稱皆為指向本機 `skills/` 實體路徑的可點擊超連結。
    2. 確認階段名稱為 SSDLC 六階段正名，且包含 `00_cross_phase` 跨階段全域共用分類。
    3. 確認 `skills/SKILLS歸類.md` 中的 7 個分類（6 階段 + 1 全域）與 `skills/README.md` 的實際目錄結構一致，映射清單無缺漏。
    4. **根 README Skill 數量同步檢查**（強制執行，不可跳過）：
       * **自動化先行**：優先執行 `scripts/check-readme-sync.ps1`，機械比對以下所有數字點。若腳本無法執行，則改以人工逐項比對。
       * **比對基準**：以 `skills/README.md` 標頭行宣告的來源細項數字為準（格式：`Anthropic 官方（N）、GitHub 社群（N）、Anthropic 官方插件（N）…共 N 個`）。
       * **檢查點清單**（根 `README.md` 中以下六處數字必須完全一致）：
         1. **Banner 行**：`六大階段 SSDLC × N 個 AI 協作 Skill` 中的 N。
         2. **專案概述段**：`合計 **N 個** AI 協作 Skill` 中的 N。
         3. **授權與來源段**：Anthropic 官方、Anthropic 官方插件、GitHub 社群各自的數字，以及 `合計 N 個 Skill` 總數。
         4. **倉庫結構段**：`N 個 Skill 實體` 中的 N。
       * **階段數量檢查**：確認根 `README.md` 全文不存在「七大階段」或「七個階段」字樣（僅可出現「六大核心開發階段」或「六階段」）；`00` 跨階段全域共用層不得被描述為獨立階段。
       * **自動修正**：若任何數字不一致，立即以 `skills/README.md` 標頭數字為準，更新根 `README.md` 所有不一致處。
        * **📊 skills/README.md 開頭統計數字驗證**（強制執行）：確認 `skills/README.md` 開頭段落中的來源細項數字（`Anthropic 官方（N）、GitHub 社群（N）、Anthropic 官方插件（N）…共 N 個`）與實際 `skills/` 目錄下各階段的 `SKILL.md` 數量總和一致（扣除雙歸屬重複計數後）。
        * **📋 skills/SKILLS歸類.md 分類清單更新驗證**（強制執行）：當新增外部 Skill 時，必須確認 `skills/SKILLS歸類.md` 中對應階段的「**技能清單**」已包含新增的技能名稱，不可遺漏。各階段清單數量加總應與 `skills/README.md` 宣告的總數一致（允許因雙歸屬導致清單總數 > 唯一技能數）。
        * **🧠 根 README.md 上下文感知推薦表更新評估**（強制執行）：每次新增 Skill 後，必須檢查根 `README.md` 的「## 🧠 上下文感知 Skill 推薦對照表」是否需要更新。評估標準：
          1. 新 Skill 的使用場景是否為高頻操作（如設計/開發/測試階段的常用查詢或實作工具）
          2. 新 Skill 是否填補了推薦表中的空白情境
          3. 若符合條件，必須在對應階段新增推薦條目（含情境關鍵詞、Skill 名稱、說明）
        * **🔢 三檔交叉驗證**（強制執行）：新增 Skill 後，以下三份檔案中的 Skill 總數必須一致：
          - 根 `README.md`（Banner 行 + 專案概述 + 來源段 + 倉庫結構段的 N）
          - `skills/README.md`（開頭段落總數）
          - 實際 `skills/` 目錄檔案數（`Get-ChildItem -Directory -Recurse -Filter "SKILL.md"` 扣除雙歸屬重複）
          不一致時，以實際檔案數為準自動修正兩份 README，並輸出 [WARN] 提醒：「分類階段同步遺漏，已自動補正。請確認 `skills/SKILLS歸類.md` SOP 步驟 3-5 是否完整執行。」

### 8. 根 README.md 內容格式防線 (`README.md`)
*   **前置自動掃描**：執行任何手動檢查前，**必須先執行** `scripts/align_framework.ps1 -VerboseOutput`。
    此腳本以 `Get-ChildItem` 動態掃描實際檔案系統，自動完成以下三項修復，不再依賴手動列舉：
    - **📂 倉庫結構 table**：與實際目錄/檔案逐項比對，缺漏自動補齊（含用途描述）
    - **📁 標準結構 tree vs 倉庫結構 table**：交叉比對目錄清單，不一致則輸出警告
    - **📋 必要章節完整性**：驗證 11 個必要章節 + @security-check/@security-load 指令存在
    - **📏 快速開始步驟數**：確認 5 步驟完整
    - **🔲 Code block 閉合**：檢查反引號配對
*   **檢查點**：腳本執行後，確認根 `README.md` 各區塊內容格式正確、無斷行亂碼、表格與實際目錄結構一致。此組檢查補充 Group 5 僅檢查 Skill 數量、Group 11 僅檢查安全章節的不足。
    1. **🎮 指令系統表格完整性檢查**：
       - 確認 `## 🎮 指令系統` 下方是標準 Markdown 表格（`| 指令 | 用途 | 範例 |`），所有指令皆為 `| ... |` 表格列格式。
       - **嚴禁**指令以 `- **...**` bullet 格式出現在表格中（破壞表格結構）。
       - 讀取 `docs/commands_reference.md` 的「核心指令對照表」（`## 一、 核心指令對照表`），擷取所有 `@` 指令名稱。
       - 逐一比對根 `README.md` 的 `## 🎮 指令系統` 表格列，確認所有指令皆存在且為表格列格式。
       - 若有缺漏 → ❌ 自動補齊至 README.md 指令系統表格中。
       - ⚠️ **嚴禁**以硬編碼列表方式檢查（會隨版本演進而過時），必須以 `commands_reference.md` 為權威來源動態比對。
    2. **🚀 快速開始段落完整性檢查**：
       - 確認 `## 🚀 快速開始` 下方 5 個子步驟（建立新專案、選取階段 Skill、選擇資安防護等級、依照階段進行開發、建立 Baseline 快照）文件齊全。
       - **嚴禁**任何步驟文字中出現殘留跳脫序列（如 `` `n ``、`\n`、`nAI`、`n→`、`n``` 等 C 風格換行符號）。
       - 確認第 3 點「選擇資安防護等級」為純文字段落（非 code block），內容可讀。
    3. **📂 倉庫結構 vs 實際目錄一致性檢查**：
       - 以 `Get-ChildItem -Directory` 掃描根目錄**所有頂層目錄**，以 `Get-ChildItem -File` 掃描根目錄**所有頂層檔案**（排除 `.git`、`node_modules` 等隱藏/非追蹤目錄，但保留 `.agents`、`.vscode`、`.gitignore`）。
       - 逐項比對 `## 📂 倉庫結構` 表格中的「路徑」欄位與實際掃描結果，**以實際結構為權威來源**。
       - 任何存在於實際目錄但表格缺漏的目錄或檔案 → ❌ 需自動補齊至表格，含適當用途說明。
       - 任何存在於表格但實際目錄已不存在的路徑 → ⚠️ 輸出警告並詢問是否移除。
    4. **Markdown 語法正確性檢查**：
       - 確認全文無 ANSI 跳脫碼殘留（如 `[33m`、`[0m`）。
       - 確認所有 code block（` ``` `）正確閉合，無未配對反引號。
       - 確認所有 Markdown 表格列以 `|` 開始與結束。
*   **失敗處理**：任一檢查失敗，立即自動修正（補表格列、刪跳脫序列、補漏列目錄），修正後輸出 `[FIXED]` 摘要。

### 9. `.agents/skills/` 結構與內容防線 (`.agents/skills/0*_*/SKILL.md`)
*   **檢查點**：
    1. 確認 `.agents/skills/` 目錄結構與 `docs/TEMPLATE_SKILL.md` 完全對齊：包含 `00_cross_phase` 至 `06_maintenance` 共 7 個目錄，以及 `reg/`、`bug/` 等子目錄。
    2. 逐一檢查 00 至 06 各階段目錄下的 `SKILL.md` 是否存在且內容完整。
    3. 逐一比對各階段 `SKILL.md` 中的代理人職責定義，與 `docs/CORE_RULES.md` 中該階段的「核心用途」及「Skill 屬性」是否一致，確保無缺漏（特別注意 AI 輔助寫碼/Linter/Formatter、多服務部署/IaC、日誌收集/APM 監控等近期補強項目）。
    4. 確認 `skills/` 目錄下的 Skill 歸類與 `.agents/skills/` 的階段定義一致，無歸屬錯誤。

### 10. 階段間交付物傳遞鏈防線 (`*_*/inputs/`、`*_*/outputs/`)
*   **檢查點**：
    1. 確認各階段 inputs/ 目錄皆包含承接上游的四種規格參照與 brief 檔案（非僅 .gitkeep）：
       - 結構化可執行規格（`executable_spec.yaml`）：確認各階段 spec_ref.md 參照此檔案。
       - 行為可執行規格（`requirements.feature`）：確認各階段 spec_ref.md 參照 Gherkin 場景檔。
       - 系統規格書 SRS（`system_specification.md`）：確認各階段 spec_ref.md 參照人可讀規格書。
       - 追溯矩陣 RTM（`traceability_matrix.md`）：確認各階段可追溯需求鏈。
       - 階段銜接 brief（`design_brief.md` / `spec_ref.md`）：確認明確引用上游階段 outputs/ 的具體檔案路徑。
    2. 確認 brief 檔案中明確引用上游階段 outputs/ 的具體檔案路徑，形成完整追溯鏈。
    3. 傳遞鏈依序檢查：01→02、02→03、03→04、04→05、05→06，確保無斷鏈。

### 11. 安全需求跨階段傳播防線（設計→實作安全繼承檢查）
*   **檢查點**：確保 Phase 2 設計階段定義的安全需求，完整傳播到 Phase 3 實作階段的執行指引中。此組檢查補強 Group 7 僅檢查「檔案存在」的不足。
    1. **安全 brief 傳遞檢查**：
       - 若 `phase_gates.json` 中 `security_baseline.enabled` 為 `true`，則確認 Phase 3 `inputs/` 目錄存在 `design_brief.md`。
       - `design_brief.md` 必須引用 Phase 2 安全設計產出（`api_spec.md` 中的安全需求章節、`db_schema.sql` 中的安全欄位）。
       - 若 brief 不存在或未引用安全需求 → ❌ 自動從 Phase 2 outputs 萃取安全需求補寫。
    2. **專案 SKILL.md 安全繼承檢查**：
       - 逐一檢查 `demo_project/.agents/skills/0*_*/SKILL.md`（或當前專案對應路徑）。
       - 若 `security_baseline.enabled` 為 `true`，則每個階段的專案 SKILL.md 必須包含「安全防護整合（條件式）」段落，內容須引用對應構面的參考文件路徑。
       - 若專案 SKILL.md 為空白或僅含「尚未導入任何 Skill」→ ❌ 自動從框架層 SKILL.md（`.agents/skills/0*_*/SKILL.md`）複製安全整合段落。
    3. **Generator 安全指令可達性檢查**：
    4. **📦 安全產出物完整性檢查**：若 `security_baseline.enabled` 為 `true`，依當前階段檢查必要安全產出：
       - Phase 1：`outputs/security_requirements.md`（CIA 定義 + 威脅建模範圍）
       - Phase 2：`outputs/threat_model.md`（STRIDE 分析 + 攻擊樹）
       - Phase 3：`outputs/security_check_report.md` + `outputs/security_scan_report.json`
       - Phase 4：`outputs/dast_report.md` + `outputs/zap_report.html`（若 ZAP 可用）
       - Phase 5：`outputs/sbom.json` + `outputs/.env.example` + `outputs/security_deployment_checklist.md`
       - Phase 6：`outputs/security_trend.md` + `outputs/vulnerability_advisory.md`
       - 若任一必要產出不存在 → ❌ 提示補產生（呼叫對應腳本或 @security-check）
    5. **🔙 安全回溯完整性檢查**
：若 `security_baseline.enabled` 為 `true` 且存在已完成階段（`phase_gates.json` 中 status=completed），則：
       - 確認所有已完成階段的專案 `SKILL.md` 皆已含「安全防護整合」段落（非僅當前階段）。
       - 若任一已完成階段缺少安全段落 → ❌ 自動補寫（視為中途導入遺漏）。

       - 確認 Phase 3 框架 SKILL.md 中 Generator 的第 9 項「[條件式] 安全實作」存在且內容完整（含帳號鎖定、日誌、輸入驗證、HTTPS、密碼雜湊、RBAC）。
       - 確認 Evaluator 的安全檢查權重（20%）中包含條件式安全檢查項目。
*   **失敗處理**：任一檢查失敗，立即自動補寫 brief 或複製安全段落，修正後輸出 `[FIXED]` 摘要。

### 12. 全域日誌與快照防線 (`logs/`、`snapshots/`、`baseline/`)
*   **檢查點**：
    1. 確認專案根目錄 `logs/` 目錄存在且非空（應包含應用程式日誌如 `app.log`）。
    2. 確認 `snapshots/` 目錄存在且包含 snapshot_*.md + diff_*.patch 配對檔案（保留最近 5 筆）。驗證最新快照的 SHA-256 檔案清單與當前工作目錄一致（無檔案遺漏或雜湊不符）。
    4. 各階段應用程式日誌應統一輸出至全域 `logs/`，不應殘留於各階段 `outputs/` 中。
    5. **@restore 指令交叉引用完整性**：確認以下檔案中皆存在 `@restore` 指令定義與說明：
       * `docs/commands_reference.md`：核心指令表 + 防呆規則
       * `.agents/AGENTS.md`：完整執行規範（Section 6）
       * `README.md`：指令系統表格
       * `docs/CORE_RULES.md`：快照回溯機制提及 `@restore`
    6. 確認 `docs/commands_reference.md` 中的 `@restore` 防呆規則與 `.agents/AGENTS.md` 的執行規範一致（警告提示、git stash、SHA-256 驗證流程）。

    3. **應用程式啟動測試**：依專案技術棧自動偵測啟動方式（例如 Python、Node.js、Java 等），對對應預設端口發出 HTTP GET 請求，確認回應狀態碼為 200，回應內容為有效 HTML。
### 13. Baseline 可執行性驗證防線 (`baseline/*/run.bat`、`baseline/*/app.py`)
    1. **run.bat 語法與編碼檢查**：確認 `baseline/` 下各版本 `run.bat` 使用 UTF-8 BOM 編碼、首行含 `chcp 65001`、`cd /d "%~dp0"` 指向自身目錄、結尾含 `taskkill` 清理邏輯。
    2. **Python 匯入檢查**：對每個 baseline 版本執行 `python -c "import <模組>"`（從該 baseline 目錄執行），確認無 `ModuleNotFoundError` 或 `SyntaxError`。
    3. **應用程式啟動測試**：依專案技術棧自動偵測啟動方式（Python/Node/Java 等），對對應預設端口發出 HTTP GET 請求，確認回應狀態碼為 200，回應內容為有效 HTML。
    4. **模板完整性檢查**：確認 `baseline/*/templates/` 目錄存在且含 `index.html`、`form.html`、`base.html`，各模板內容為有效 HTML。
    5. **靜態資源檢查**：確認 `baseline/*/requirements.txt` 存在且內含 `flask` 依賴宣告。
    6. **路徑一致性檢查**：確認 baseline 中 `app.py` 使用 `os.path.abspath(__file__)` 絕對路徑（非脆弱相對路徑），日誌與 DB 路徑指向正確的根層級 `logs/` 與自身目錄。
*   **失敗處理**：任一檢查失敗即於對話中輸出「Baseline 可執行性驗證失敗報告」，包含版本號、失敗項目、根因分析、建議修復方案。

## 二、 格式與排版防線 (Formatting & Typesetting)

AI 代理必須檢查上述所有修改檔案是否嚴格符合以下繁體中文排版規範：

1.  **唯一語境**：一律使用台灣繁體中文（如：最佳化、專案、資訊、檔案），嚴禁使用簡體字與大陸用語。
2.  **空格規範**：中文字元與英文、半形數字之間必須保留一個半形空格；全形標點與其他字元之間不加空格；超連結前後保留空格以利閱讀。
3.  **語氣限制**：維持務實冷靜語氣。**產出文件（如交付文件、規格書、正式報告）嚴禁使用 Emoji**；框架說明、指令文件與範本中的 Emoji 則允許作為輔助標示，且不重複使用標點符號。

---

## 三、 執行步驟與回饋流程 (Execution Steps)

當觸發「執行整個駕馭工程的框架優化」時，AI 代理必須執行以下步驟：

### 步驟一：靜態分析與關聯稽核 (Cross-Audit)
1. 讀取上述各項檢查模組所涵蓋的所有核心檔案與目錄內容。
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


### 14. CORE_RULES 規範 vs 實際落實落差掃描 (Spec-Implementation Gap Analysis)
*   **檢查點**：此為 @optimize 的收斂性終檢，逐條比對 CORE_RULES.md 中的每一項可執行規範是否已在專案中實際落實。
    1. 掃描 CORE_RULES.md 全文，萃取所有「必須」、「自動」、「強制」等可執行規範條目。
    2. 逐條驗證對應的檔案、目錄、腳本、設定欄位是否存在。
    3. 區分「框架層級範本」（正確應為空白/佔位）與「專案實例」（應有實際內容）。
    4. 產出落差清單：已落實 ✅ / 未落實 ❌ / 無需落實（框架範本）➖。
    5. 落差清單中的 ❌ 項目，依 CORE_RULES 錯誤分類判定為 B 類錯誤。
    6. **安全關卡阻斷機制檢查**：確認 `phase_gates.json` 中 `security_baseline` 包含 `min_security_score` 與 `block_on_fail` 欄位；確認 `CORE_RULES.md` 包含「安全防護關卡阻斷機制」章節；確認 Phase 3 Evaluator 包含安全關卡檢查邏輯。
，需立即修復或標記為已知限制。
*   **檢查範例**：
    | 規範條目 | 狀態 | 說明 |
    |:---|:---|:---|
    | traceability_matrix.md 有實際追溯資料 | ✅ | demo_project 已落實追溯矩陣 |
    | YAML → SRS 自動生成器 | ✅ | scripts/generate_srs.py |
    | logs/ 含對話紀錄 | ✅ | demo_project/logs/conversation_*.md |
    | Baseline 驗證語言無關適配 | ✅ | CORE_RULES 三-4-4 語言對照表 |


### 15. Security-Principles 資安防護基準對齊防線 (`external-resources/Security-Principles/`)
*   **檢查點**：此為 @optimize 的安全專項對齊檢查，確保 Security-Principles Skill 與整體 SSDLC 框架完整融合，檔案、指令、文件三層一致。
    1. **目錄完整性檢查**：確認 `external-resources/Security-Principles/` 下 19 個檔案齊全：
       - `SKILL.md`、`README.md`（雙核心說明檔）
       - `agents/skill.yaml`（UI 中繼資料）
       - `references/` 下 8 份構面參考文件（`01_access_control.md` ~ `08_organizational.md`）
       - `references/source/` 下 4 份原始 PDF
       - `assets/` 下 3 份等級檢核表（`checklist_general.md`、`checklist_medium.md`、`checklist_high.md`）
       - `scripts/generate_checklist.py`（檢核表產生工具）
    2. **指令文件三點一致性檢查**：確認 `@security-check` 與 `@security-load` 在以下三處的參數、行為、口語觸發完全一致：
       - `.agents/AGENTS.md`（Section 9：@security-check、Section 10：@security-load）
       - `docs/commands_reference.md`（指令表格 + 口語觸發詞彙 + 更新日誌）
       - `external-resources/Security-Principles/SKILL.md`（使用方式章節）
    3. **階段 Skill 安全整合檢查**：逐一確認 6 個階段 `SKILL.md`（`01_planning_and_analysis` ~ `06_maintenance`）皆包含「安全防護整合（條件式）」段落，且 `security_baseline.enabled` 條件閘門正確運作。
    4. **phase_gates.json 安全區塊完整性檢查**：確認 `phase_gates.json` 根層級包含 `security_baseline` 區塊，且 `enabled`、`level`、`domains`、`skill_path`、`initialized_at` 欄位結構完整。
    5. **根 README.md 倉庫結構與安全章節自動對齊檢查**：確認根 `README.md` 的 `## 📂 倉庫結構` 表格與實際目錄/檔案完全一致（以 `Get-ChildItem` 動態掃描為準），並包含「🛡️ 資安防護基準」章節，且涵蓋以下全部子章節與內容：
       - 「### 8 大安全構面」總覽表（構面 1-8，構面 7 為 22 項、構面 8 為 14 項非軟體因子，含適用 SSDLC 階段）
       - 「### 層次全景圖」（組織管理面 → 管理制度面 → SSDLC 軟體開發層 → 實體環境面 → 供應鏈面）
       - 「### 三等級檢核」（普58/中70/高80，含適用場景說明）
       - 「### 雙軌運作模式」（主動融入 + 事後稽核 + 彈性導入三模式表格）
       - 「### 資通安全責任等級對照」（含 checklist_general/medium/high 檔名與軟體/非軟體措施數）
       - 「### 非軟體面向安全因子」（組織管理/管理制度/實體環境/供應鏈四面向，共 14 項）
       - 「### 來源文件」（4 份原始 PDF 及其來源機關）
       - @security-check 與 @security-load 雙指令在「🎮 指令系統」表格中存在
       - 口語觸發詞彙含「載入資安構面」「導入安全防護」「執行資安檢核」
    6. **memory.md 安全記錄完整性檢查**：確認 `memory.md` 包含 Security-Principles Skill 建立記錄，涵蓋背景、產出路徑、檔案數量、指令新增等完整歷史。
    7. **跨參考完整性檢查**：
       - Security-Principles 內部 `SKILL.md` ↔ `README.md` 的等級對照表（普58/中70/高80）、構面表格（8構面）、控制措施數量互相一致。
       - `00_cross_phase/SKILL.md` 中 @security-check 與 @security-load 的流程定義，與 `.agents/AGENTS.md` Sections 9-10 一致。
       - 各階段 `SKILL.md` 的安全整合段落引用路徑（`external-resources/Security-Principles/`）正確可達。
    8. **檔案數量一致性檢查**：Security-Principles 目錄實際檔案數（19）與 `README.md`、`SKILL.md`、`memory.md` 中描述的數量一致，無缺漏或殘留。
*   **失敗處理**：任一檢查失敗即於對話中輸出「Security-Principles 對齊失敗報告」，包含失敗項目、根因分析、建議修復方案。涉及指令不一致者，以 `.agents/AGENTS.md` 為權威來源自動修正。

### 步驟四：產出報告與同步 Baseline (Report & Sync)
1. 於對話中輸出框架優化成果報告（以「Status + Root Cause + Suggested Fix」格式說明修補處）。
2. 輸出 Baseline 可執行性驗證摘要（各版本 HTTP 狀態碼、模板數量、檢查通過/失敗清單）。
3. 自動建立 Git 暫存基線（Baseline），並在 `memory.md` 載入本次優化之異動紀錄。




