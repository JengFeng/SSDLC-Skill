# 駕馭工程 Harness Engineering | 雙層六階段完整正式規格書 (通則性核心指導守則)

本文件定義了本專案在自動化軟體開發全流程架構與企業級 Agent 工作流中，各 AI 代理（Planner、Generator、Evaluator）與安全軟體開發生命週期各階段都必須嚴格遵循的最高指導框架原則。所有子規章、階段定義與實作規範皆不得與本守則衝突。

---

## 一、 整體雙層解耦架構

本系統採用「外層全域 Agent + 內層階段性局部駕馭工程 PDCA 迴圈」之雙層解耦架構。

### 1. 外層：全域主控 Global Agent（唯一頂層）
作為頂層主控，隨時掌握與監控由內層各階段上傳之檢核結果，負責安全軟體開發生命週期六階段（通稱 SSDLC）的全域掌控、追溯、版本、以及規格同步。
#### 核心職責：
1. 建立跨階段完整需求追溯鏈。
2. 自動同步所有迭代變更至專案規格文件。
3. 永久留存人機對話紀錄、AI 調整紀錄、與迭代日誌。
4. 每階段驗證穩定後，封存 Baseline 穩定可執行版本。
5. 管控階段切換權限：前一階段產生 Baseline，才可進入下一階段。


#### 1-6. 指令集三檔同步強制規則
`.agents/AGENTS.md`、`docs/commands_reference.md` 與根目錄 `README.md` 構成指令系統的三軌文件：
* **`.agents/AGENTS.md`**：AI 代理執行規範（完整步驟、防呆邏輯、安全網機制）
* **`docs/commands_reference.md`**：人類參照表（指令語法、參數、範例、口語觸發）

* **根目錄 `README.md`**：專案入口文件，指令總覽表與自然語言觸發清單

**強制同步規則**：
1. 任何新增或修改的 `@` 指令，必須**同時更新**上述三個檔案。
2. `commands_reference.md` 的核心指令表中，每個指令至少須包含：語法、參數說明、系統行為摘要、使用範例。
3. `.agents/AGENTS.md` 中每個指令至少須包含：指令定義、口語觸發詞彙、AI 代理執行步驟。
4. `@optimize` 檢查必須驗證三檔案的指令清單一致（指令名稱、參數、口語觸發詞彙無遺漏）。
5. 若任一檔案有指令而其他檔案缺失 → 判定為 B 類錯誤（規劃層根源錯誤），立即要求修復。
6. 每個目錄若同時存在 `README.md` 與 `SKILL.md`（排除 `.agents/skills/` 階段模板目錄），兩檔案的內容必須保持同步一致：章節主題、檔案路徑引用、指令名稱、口語觸發詞不得有缺漏或矛盾。`@optimize` 執行時必須自動掃描並比對。

> 📌 **詳細自動化執行機制與觸發規則**，請參見 [第三節](#三-外層全域主控-agent-自動化機制與追溯同步規範)。

### 2. 內層：安全軟體開發生命週期六階段（通稱 SSDLC）各階段定義與 Skill 屬性
安全軟體開發生命週期切割為六階段，通稱 SSDLC。每一階段獨立執行一套完整的 Plan → Generator → Evaluator 閉環，且各階段具備明確之核心用途與對應 Skill 之重要屬性特性：

1. **第一階段：規劃與需求分析**
   * **核心用途**：需求萃取、訪談整理、文件結構化與版本化管理。
   * **採用 Skill 之重要屬性與特性**：具備語意拆解、長文本關鍵需求擷取、結構化 Markdown 轉換，以及文件版本化控制與靜態文檔網站生成能力。
2. **第二階段：系統設計**
   * **核心用途**：系統架構圖、業務流程圖、UML 圖表、資料庫實體關係模型（ERM）、Schema、SQL DDL，以及 API 規格書之設計。
   * **採用 Skill 之重要屬性與特性**：支援代碼繪圖（例如流程圖、時序圖與部署圖）、資料庫對映模型定義、以及自動化 API 規格定義生成。
3. **第三階段：開發與編碼**
   * **核心用途**：程式碼實作、代碼補全與生成、代碼規範檢查、自動格式化以及多模組關係管理。
   * **採用 Skill 之重要屬性與特性**：具備本機 AI 輔助寫碼與語境理解、靜態代碼語法與邏輯缺陷檢核（Linter）、程式風格美化（Formatter）以及跨模組依賴關係的整合建置能力。
4. **第四階段：測試驗證**
   * **核心用途**：單元測試、前後端功能驗證、Web UI 自動化測試、API 與 Web 服務測試（如 OpenAPI/Swagger 規格檢驗）、傳統單機版應用程式（Desktop App）UI 自動化測試、安全漏洞靜態掃描與測試覆蓋率分析。
   * **採用 Skill 之重要屬性與特性**：具備瀏覽器與 DOM 元素操作自動化模擬、API 與 Web 服務之 Schema 驗證與 HTTP 請求響應檢核、單機應用程式 UI 視窗與控制項自動化驅動、單元測試與 Mock 模擬、安全性漏洞防線掃描以及測試代碼覆蓋率分析。
5. **第五階段：部署發布**
   * **核心用途**：建置成品打包、多服務依賴部署、伺服器組態自動產生與遠端批次部署。
   * **採用 Skill 之重要屬性與特性**：支援本機進程或容器化服務打包、基礎設施即代碼（IaC）的遠端自動化組態、以及伺服器反向代理與負載平衡配置之自動生成。
6. **第六階段：維護與營運**
   * **核心用途**：線上運行日誌收集與分析、錯誤原因萃取、系統硬體與效能監控、程式執行軌跡追蹤、熱修補（Hotfix）程式編寫及回歸測試。
   * **採用 Skill 之重要屬性與特性**：具備日誌集中收集與快速檢索分析、效能指標（APM）與分布式調用鏈追蹤、即時指標監控與視覺化告警機制、以及雜亂日誌的正則篩選與清理。

---

### 3. 跨階段全域共用 Skill 層（00_cross_phase）

> 部分 Skill 具備跨階段通用性（如文書產製 docx/pdf/xlsx/pptx、版本控制 git、腦力激盪 brainstorming 等），不歸屬於任一特定階段，可在所有 SSDLC 階段選用。

#### 3-1. 架構原則

1. **雙歸類機制**：具備跨階段通用性的 Skill 同時存在於原階段目錄與 `skills/00_cross_phase/`，兩邊皆保留完整副本。
2. **G 前綴混搭**：在任一階段（`@01`~`@06`）查詢或導入 Skill 時，通用 Skill 以 `G` 前綴快捷編號（G01, G02...）一併顯示，支援與階段專屬 Skill 以逗號混搭導入（如 `@02/01,03,G01,G04`）。
3. **通用性判斷標準**：Skill 在 ≥3 個階段有明確使用場景、不依賴特定階段上下文、或具文書產製屬性者，應評估納入跨階段層。
4. **原位保留**：通用 Skill 在原階段目錄的副本保持不變，不影響既有的階段專屬導入流程。



## 二、 內層局部駕馭工程 | 通用標準流程

### 1. 固定 PDCA 對映
* **Plan** = PDCA-P 規劃定義。
* **Generator** = PDCA-D 純執行。
* **Evaluator** = PDCA-C 檢核 + PDCA-A 迭代修正。

### 2. Plan 階段（規劃、選模、靜態檢核）
所有階段通用作業：
1. 承接上階段交付物與 Baseline 版本。
2. 定義本階段目標、交付物與驗證標準。
3. 使用者可複選多個 Skill 模組。
4. 依黑白名單執行靜態衝突檢查。
5. 若選取互斥 Skill，直接判定為 B 類根源錯誤，不進入執行，以節省 Token。

### 3. Generator 階段（唯一執行層）
#### 核心鐵律：
* **只執行、不判斷、不檢查、不修改**。
#### 強化機制：
1. 執行中動態監控模組衝突、參數覆蓋與流程矛盾。
2. 執行完成後自動儲存執行快照至根目錄的 `snapshots/` 目錄。
3. 執行完成後自動將階段執行摘要寫入根目錄的 `logs/iteration_log.md`（含時間戳、階段名稱、執行 Skill 清單、產出檔案清單）。

### 4. Evaluator 階段（雙層驗證 + 錯誤分級 + 分級重試）
#### 4-1. 雙層 Check 驗證
1. **成果驗證**：輸出是否符合階段規格。
2. **流程驗證**：所有 Skill 是否完整執行、無跳步、無中斷。

#### 4-2. 錯誤二分類（核心省 Token 機制）
* **A 類：執行層臨時錯誤**
  * 包含：參數錯誤、環境問題、API 超時、DOM 找不到元素、執行短暫衝突、網路連線中斷、權限異常等。
  * 處理方式：允許局部重試最多 3 次（退回 Generator）。

---

## 安全防護關卡阻斷機制 (Security Gate Enforcement)

若專案啟用 Security-Principles（`security_baseline.enabled = true`）：

*   **最低安全分數門檻**：每階段 Evaluator 審查時，安全評分需達 `phase_gates.json` 中 `min_security_score`（預設 70%），未達標 → **B 類錯誤**，強制退回 Generator，不得進入下一階段。
*   **Phase 3 強制檢核**：Phase 3 完成前必須執行 `@security-check`，符合率低於門檻 → B 類錯誤。
*   **安全回歸防線**：Phase 4/5/6 Evaluator 若安全分數較前一階段下降超過 10% → B 類錯誤，需回溯修正。
*   **例外處理**：使用者可透過 `@unlock` 加註安全豁免理由，記錄於 `memory.md`。

* **B 類：規劃層根源錯誤**
  * 包含：Skill 互斥、需求矛盾、設計缺陷、架構問題等。
  * 處理方式：直接跳過局部重試，立即升級全域迭代。

#### 4-3. 分級重試機制
1. 僅 A 類錯誤可局部重試。
2. 回溯點：只退回 Generator，不動 Plan。
3. 同一錯誤最多連續 3 次重試。
4. 新錯誤重置計數器。
5. 重試採用指數退避，避免 API 限流。
6. 滿 3 次失敗 → 升級全域 Action。

#### 4-4. Action 全域迭代
1. 重跑該階段完整 PDCA。
2. 全域自動迭代上限：2 輪。
3. 滿 2 輪仍失敗 → 自動暫停、移交人工處理。

#### 4-5. Evaluator 通過後觸發全域同步（銜接外層 Agent）
Evaluator 判定本階段產出通過（所有審查項目達標）後，**自動觸發**下列外層全域主控 Agent 作業（詳見第三節）：
1. 更新 `traceability_matrix.md`（本階段需求追溯狀態寫回）。
2. 更新 `system_specification.md`（本階段測試/驗收狀態寫回）。
3. 歸檔本階段對話紀錄與 AI 調整紀錄至 `logs/`。
4. 建立本階段 Baseline（`baseline/phase-{NN}/baseline-v{N}/`）。
5. 釋放下一階段切換權限（更新 `phase_gates.json`）。

---

## 三、 外層全域主控 Agent 自動化機制與追溯同步規範

本節定義外層全域主控 Agent 在接收到內層各階段 Evaluator 通過訊號後，必須自動執行的五大作業之具體觸發條件、執行步驟與輸出格式。

### 1. 跨階段需求追溯鏈自動化（責任 1）

#### 1-1. 觸發時機
* **主觸發**：任一階段 Evaluator 判定通過（所有審查項目達標）。
* **輔助觸發**：`@baseline` 指令執行後、階段 Skill 導入後（`@[階段]/[快捷]`）。

#### 1-2. 執行步驟
1. **讀取階段交付物**：掃描本階段 `outputs/` 目錄，提取所有產出檔案清單。
2. **自動產生 REQ 編號**（若為全新需求）：
   * 格式：`REQ_{三位流水號}`（如 REQ_001、REQ_002）。
   * 從 `traceability_matrix.md` 現有最大編號 +1 開始遞增。
   * 若本階段為 01（規劃），則為每個正規化需求建立新的 REQ 條目。
   * 若本階段為 02~06，則在既有 REQ 條目對應欄位填入本階段產出路徑。
3. **寫回追溯矩陣**：
   * 更新 `traceability_matrix.md` 中對應 REQ 的本階段欄位（規格定義 / 系統設計 / 開發實作 / 測試案例 / 部署驗證 / 維護記錄）。
   * 自動計算並更新「當前狀態」欄位：所有跨階段欄位皆有對應產出 → `[已驗證]`；部分缺漏 → `[不連貫警告]`。
4. **輸出連貫性報告**：
   * 產出 `logs/alignment_report_{YYYYMMDD-HHMMSS}.md`，記錄本次追溯更新摘要（新增/更新 REQ 數量、跨階段連貫狀態、缺漏項目清單）。

#### 1-3. 需求追溯表欄位規範
| 欄位 | 填入時機 | 格式 |
|:---|:---|:---|
| 需求編號 | 01 階段 Planner | `REQ_{NNN}` |
| 原始輸入來源 | 01 階段 Planner | 檔案路徑（如 `inputs/user_requirement_raw.md`） |
| 規格定義 (01) | 01 Evaluator 通過 | 對應 `outputs/` 檔案路徑 |
| 系統設計 (02) | 02 Evaluator 通過 | 對應 `outputs/` 檔案路徑 |
| 開發實作 (03) | 03 Evaluator 通過 | 對應 `outputs/` 或原始碼路徑 |
| 測試案例 (04) | 04 Evaluator 通過 | 對應測試案例 ID |
| 部署驗證 (05) | 05 Evaluator 通過 | SHA-256 驗證狀態 |
| 維護記錄 (06) | 06 Evaluator 通過 | Hotfix/監控事件 ID |
| 當前狀態 | 每次更新後自動計算 | `[已驗證]` / `[測試失敗]` / `[不連貫警告]` |

### 2. 規格文件自動同步機制（責任 2）

#### 2-1. 觸發時機
* **主觸發**：任一階段 Evaluator 判定通過。
* **輔助觸發**：Skill 導入後、Baseline 建立後。

#### 2-2. 自動同步對象與規則
`system_specification.md` 中下列章節將自動更新：

| 章節 | 同步時機 | 同步內容 |
|:---|:---|:---|
| 文件版本與日期 | 每次 Evaluator 通過 | 遞增版號（v1.0 → v1.1 → ...），更新日期 |
| 二、整體描述 > 產品功能摘要 | 01 Evaluator 通過 | 從 `formal_requirements.md` 萃取功能編號與說明 |
| 三、具體需求 > 功能需求詳細說明 | 01 Evaluator 通過 | 從 `formal_requirements.md` 寫入每個 FEAT 的描述/輸入/輸出/例外 |
| 三、具體需求 > 外部介面需求 | 02 Evaluator 通過 | 從 `api_spec.md` 寫入 API 端點表 |
| 三、具體需求 > 資料庫需求 | 02 Evaluator 通過 | 從 `er_diagram.md` + `db_schema.sql` 萃取 ER 圖連結與 DDL |
| 四、UML 系統模型 | 02 Evaluator 通過 | 更新四項 UML 圖表連結與說明 |
| 三、具體需求 > 技術架構需求 | 03 Evaluator 通過 | 從專案產出萃取技術棧（語言/框架/資料庫）、模組結構、關鍵實作決策 |
| 五、驗收標準 > 狀態欄位 | 04/05 Evaluator 通過 | 寫入 pytest/Playwright 通過數、SHA-256 驗證結果 |
| 六、附錄 A 維運需求 | 06 Evaluator 通過 | 從維護記錄萃取 Hotfix 歷程、回歸測試結果、營運監控指標（CPU/記憶體/回應時間/錯誤率）及維運 SLA |
| 六、附錄 B 變更紀錄 | 每次 Evaluator 通過 | 自動追加一行變更紀錄（日期 + 階段 + 版號 + 摘要） |

#### 2-3. Gherkin 狀態寫回機制
若 `system_specification.md` 中包含 Gherkin 語法的 Scenario（`gherkin` 程式碼區塊），Evaluator 必須在測試完成後：
1. 解析測試結果，將每個 Scenario 的執行狀態寫回該 Scenario 標題後方。
2. 格式：`場景: XXX [已通過]` 或 `場景: XXX [未通過]`。
3. Evaluator 拒絕合併任何仍包含 `[未通過]` 狀態 Scenario 的規格文件。

### 3. 全域日誌與對話紀錄留存機制（責任 3）

#### 3-1. 日誌目錄與檔案結構
全域 `logs/` 目錄下必須維護以下三類紀錄檔案：

| 檔案 | 內容 | 寫入時機 | 格式 |
|:---|:---|:---|:---|
| `iteration_log.md` | 每次 PDCA 迭代的執行摘要 | Generator 完成後、Evaluator 完成後 | Markdown 表格（時間戳 + 階段 + 代理 + 動作 + 結果） |
| `conversation_{YYYYMMDD-HHMMSS}.md` | 本次對話 session 的完整人機對話記錄 | 每次對話 session 結束（或階段完成）時 | 純文字，含時間戳標記的問答對 |
| `ai_adjustment_{YYYYMMDD-HHMMSS}.md` | AI 代理在執行過程中的自主調整決策記錄 | AI 代理每次做出自主判斷或調整時 | Markdown 表格（時間 + 決策類型 + 原始狀態 + 調整後狀態 + 理由） |

#### 3-2. 對話紀錄自動歸檔規則
1. **歸檔觸發**：每個對話 session 結束，或當前階段 Evaluator 判定通過時，AI 代理必須自動將本 session 的完整對話內容（去除重複與無效訊息）歸檔為 `logs/conversation_{timestamp}.md`。
2. **最小留存內容**：每筆對話紀錄至少包含：
   * Session 開始/結束時間戳。
   * 使用者提出的所有指令與決策。
   * AI 代理的關鍵回應與執行摘要。
   * 本 session 中產出或修改的檔案清單。
3. **清理規則**：`logs/` 目錄下僅保留最近 20 筆對話紀錄與 20 筆 AI 調整紀錄。當超過上限時，自動合併最舊的 10 筆為一個彙整檔（`archive_{date_range}.md`）後刪除原始檔。

#### 3-3. AI 調整紀錄寫入規範
AI 代理在執行過程中，每當做出以下自主判斷時，必須即時追加一筆紀錄至 `logs/ai_adjustment_{date}.md`：
* 自動修正檔案路徑或超連結。
* 自動調整 Skill 配置參數。
* 自動重試 A 類錯誤。
* 自動升級 B 類錯誤至全域迭代。
* 格式：`| 時間戳 | 決策類型 | 原始狀態 | 調整後狀態 | 調整理由 |`

### 4. 每階段 Baseline 封存機制（責任 4）

#### 4-1. 階段級 Baseline（Phase Baseline）
不同於專案全域的 `@baseline` 指令，**階段級 Baseline** 是階段切換的前置條件：

* **觸發時機**：本階段 Evaluator 判定通過後自動觸發。
* **存放路徑**：`baseline/phase-{NN}/baseline-v{N}/`（例如 `baseline/phase-01/baseline-v1/`、`baseline/phase-03/baseline-v2/`）。
* **包含內容**：
  * 本階段 `outputs/` 目錄完整複本。
  * 本階段 `SKILL.md`（含已導入的 Skill 配置）。
  * `MANIFEST.md`：階段 Baseline 版本資訊（建立時間、Git commit hash、Evaluator 評分摘要、需求追溯狀態）。
  * `snapshot_*.md` + `diff_*.patch`：本階段的執行快照配對。
* **保留規則**：每個階段僅保留最近 3 份 Baseline。當第 4 份產生時，自動清理最舊版本。

#### 4-3. 專案全域 Baseline（Project Baseline — 現有 @baseline 指令）
保留現有 `@baseline` 指令行為，但新增以下規則：
* 全域 Baseline 僅在所有 6 個階段皆完成（皆有階段 Baseline）後方可建立。
* 若任一階段缺少階段 Baseline，`@baseline` 指令須提示：「以下階段尚未建立階段 Baseline：{階段清單}。請先完成該階段 PDCA 後再建立全域 Baseline。」
* 全域 Baseline 的 MANIFEST.md 必須彙整所有 6 個階段 Baseline 的版本資訊。

#### 4-4. Baseline 驗證規則（語言無關，自動適配）
每次階段 Baseline 建立後，必須自動執行以下驗證並記錄結果於 MANIFEST.md。AI 代理須自動偵測專案技術棧，選用對應語言的等效檢查：

**通用驗證項目**（所有專案皆執行）：
1. **啟動腳本語法檢查**：確認啟動腳本存在、編碼正確、路徑引用有效。Windows 檢查 `run.bat` 的 `chcp 65001`；Linux/macOS 檢查 `run.sh` 的 shebang。
2. **依賴清單完整性**：確認依賴宣告檔存在且格式正確（`requirements.txt` / `package.json` / `pom.xml` / `go.mod` 等，依技術棧而定）。
3. **程式碼編譯或語法檢查**：依技術棧執行對應檢查（Python: `import`；Java: `javac`；Node.js: `node --check`；Go: `go build`；C#: `dotnet build`）。
4. **服務啟動與 HTTP 回應檢查**：背景啟動應用程式，對其預設埠號發出 HTTP GET，確認回應 200。
5. **必要資源檔案完整性**：確認專案所需的模板、靜態資源、設定檔等存在（檔案清單依專案類型而定）。
6. **檔案雜湊一致性**：計算並記錄所有產出檔案的 SHA-256 雜湊值，與前次 Baseline 比對。

**語言適配對照**（AI 代理自動判定）：

| 技術棧 | 依賴檔 | 編譯/語法檢查 | 預設埠號 | 資源目錄 |
|:---|:---|:---|:---|:---|
| Python Flask | `requirements.txt` | `python -c "import app"` | 5000 | `templates/` |
| Node.js Express | `package.json` | `node --check server.js` | 3000 | `views/` 或 `public/` |
| Java Spring Boot | `pom.xml` | `mvn compile` | 8080 | `src/main/resources/` |
| Go | `go.mod` | `go build ./...` | 8080 | `static/` |
| C# .NET | `.csproj` | `dotnet build` | 5000 | `wwwroot/` |

**失敗處理**：任一檢查失敗即標記 Baseline 為「驗證未通過」，不釋放階段切換權限，並輸出失敗報告（含失敗項目、根因分析、建議修復方案）。

### 5. 階段切換權限管控機制（責任 5）

#### 5-1. 階段關卡檔案（Phase Gate）
專案根目錄下維護一個 `phase_gates.json` 檔案，用於記錄各階段的切換狀態：

```json
{
  "project": "專案名稱",
  "last_updated": "YYYY-MM-DDTHH:MM:SS",
  "phases": {
    "01_planning_and_analysis": {
      "status": "completed",
      "baseline": "baseline/phase-01/baseline-v1/",
      "evaluator_score": { "coverage": 40, "clarity": 30, "traceability": 20, "format": 10 },
      "completed_at": "YYYY-MM-DDTHH:MM:SS"
    },
    "02_system_design": {
      "status": "in_progress",
      "baseline": null,
      "completed_at": null
    },
    "03_implementation_and_coding": { "status": "locked" },
    "04_testing": { "status": "locked" },
    "05_deployment": { "status": "locked" },
    "06_maintenance": { "status": "locked" }
  }
}
```

#### 5-2. 階段切換檢核流程
AI 代理在進入任一階段（N）之前，必須執行以下關卡檢查：

1. **讀取 `phase_gates.json`**，確認階段 N-1 的 `status` 為 `completed` 且 `baseline` 欄位非空。
2. **若階段 N-1 未完成**：
   * 強制中止，顯示：「🛑 階段 {N-1} 尚未完成。請先完成該階段的 PDCA 閉環並建立階段 Baseline 後，再進入階段 {N}。」
   * 不允許任何繞過行為。
3. **若階段 N-1 已完成**：
   * 將階段 N 的 `status` 更新為 `in_progress`。
   * 顯示：「✅ 階段 {N-1} 已完成且 Baseline 已封存。現在進入階段 {N}。」
4. **首次進入階段 01**：無前置階段，直接將狀態設為 `in_progress`。

#### 5-3. 人工強制解鎖（Manual Override）
* **適用情境**：緊急 Hotfix、框架建造者維護、階段重建。
* **觸發方式**：框架建造者口語指令「強制解鎖階段 {N}」或 `@unlock {N}`。
* **安全機制**：
  1. 顯示警告：「⚠️ 強制解鎖將繞過階段關卡檢查，可能導致需求追溯斷裂與規格不一致。確認強制解鎖階段 {N}？」
  2. 確認後在 `phase_gates.json` 中記錄解鎖事件（含時間戳、操作者、理由）。
  3. 解鎖後不自動建立缺失的階段 Baseline。
  4. 在 `logs/ai_adjustment_{date}.md` 中記錄此次強制解鎖。

#### 5-4. 階段重建（Phase Rebuild）
若需重跑已完成階段：
* **觸發**：框架建造者口語指令「重建階段 {N}」。
* **行為**：
  1. 將該階段及所有後續階段的 `status` 重置為 `locked`。
  2. 清除該階段及後續階段的 `baseline` 參照。
  3. 輸出受影響的階段清單與 REQ 清單，供使用者確認。
  4. 確認後，從該階段重新開始 PDCA。

### 6. 全域 Agent 觸發摘要（Five-Point Automation Checklist）

本節為外層全域主控 Agent 五大自動化作業的執行順序與相依關係總覽：

```
Evaluator 判定本階段通過
         │
         ├─→ [1] 更新 traceability_matrix.md（追溯鏈寫回）
         │         └─ 輸出 logs/alignment_report_{ts}.md
         │
         ├─→ [2] 更新 system_specification.md（規格同步寫回）
         │         └─ 含 Gherkin 狀態回寫
         │
         ├─→ [3] 歸檔對話紀錄與 AI 調整紀錄
         │         ├─ logs/conversation_{ts}.md
         │         ├─ logs/ai_adjustment_{ts}.md
         │         └─ logs/iteration_log.md（追加）
         │
         ├─→ [4] 建立階段 Baseline
         │         ├─ baseline/phase-{NN}/baseline-v{N}/
         │         ├─ MANIFEST.md（含 SHA-256 驗證）
         │         └─ snapshot + diff pair
         │
         └─→ [5] 釋放下一階段權限
                   └─ 更新 phase_gates.json（N → completed, N+1 → unlocked）
```

> ⚠️ **執行順序強制規則**：上述五項作業必須依序執行。任一步驟失敗（如 SHA-256 驗證不通過），則中止後續步驟，該階段標記為「待修復」，不釋放下一階段權限。


### 7. 可執行規格母版（YAML SSOT）雙格式架構（責任 1+2 的基礎設施）

本專案採用「雙格式規格」架構：YAML 可執行規格為唯一資料源（SSOT），人類可讀的傳統 SRS 由此自動生成。

#### 7-1. 架構定位

> 💡 **YAML 母版的邊界**：YAML 是規格層 SSOT，可自動生成所有人類閱讀的規格文件（SRS、RTM、Gherkin），但不儲存程式碼或圖檔的完整內容。程式碼原始檔（`.py`、`.sql`、`.html`）與設計圖檔（Mermaid 程式碼）仍由 Git 版本控制管理。YAML 記錄這些檔案的路徑、結構摘要與 SHA-256 雜湊值，供追溯驗證之用。

```
specs/executable_spec.yaml (SSOT)  ←── AI 代理唯一讀寫源
        │
        ├── 自動生成 → system_specification.md (人類閱讀)
        ├── 自動生成 → traceability_matrix.md (追溯矩陣)
        └── 自動生成 → specs/features/*.feature (Gherkin BDD)
```
* **YAML 母版**：單一檔案涵蓋全部 6 個階段的結構化資料。Planner 讀取、Generator 寫入產出、Evaluator 寫入評分。
* **Markdown SRS**：由全域 Agent 在每次階段完成後從 YAML 自動生成，永不手動編輯。
* **Gherkin .feature**：從 YAML 中的需求與驗收條件自動轉換為 BDD 可執行規格。

#### 7-2. YAML 母版結構規範
`specs/executable_spec.yaml` 必須包含以下頂層區塊，各階段 AI 代理依職責讀寫對應區塊：

| YAML 區塊 | 讀取者 | 寫入者 | 內容 |
|:---|:---|:---|:---|
| `project` | 所有階段 | 全域 Agent | 專案名稱、版本、當前階段 |
| `phase_01_planning` | 01 Planner, 02 Planner | 01 Generator, 01 Evaluator | 需求清單、正規化規格、評分 |
| `phase_02_design` | 02 Planner, 03 Planner | 02 Generator, 02 Evaluator | 資料庫、API、UML 產出、評分 |
| `phase_03_implementation` | 03 Planner, 04 Planner | 03 Generator, 03 Evaluator | 模組清單、單元測試、評分 |
| `phase_04_testing` | 04 Planner, 05 Planner | 04 Generator, 04 Evaluator | API/UI 測試結果、Bug 清單、評分 |
| `phase_05_deployment` | 05 Planner, 06 Planner | 05 Generator, 05 Evaluator | 部署產物 SHA-256、評分 |
| `phase_06_maintenance` | 06 Planner | 06 Generator, 06 Evaluator | 監控指標、事件清單、評分 |
| `traceability` | 全域 Agent | 全域 Agent | 自動彙整的追溯矩陣 |
| `change_log` | 全域 Agent | 全域 Agent | 版本變更紀錄 |

#### 7-3. 階段間資料傳遞規則（以 YAML 為唯一介面）
1. **上游寫入**：階段 N 的 Generator 將產出寫入 `phase_0N_*.outputs` 與對應結構化欄位（如 `requirements`、`modules`、`test_results`）。
2. **下游讀取**：階段 N+1 的 Planner 從 `phase_0N_*.outputs` 與結構化欄位讀取上游產出，作為本階段輸入。
3. **禁止跨格式查詢**：下游階段不得直接讀取上游的 Markdown 檔案（如 `formal_requirements.md`）；必須透過 YAML 母版取得結構化資料。
4. **容錯機制**：若 YAML 中對應欄位為空，Planner 應提示「上游階段尚未完成」，並中止規劃。

#### 7-4. 自動生成規則
全域 Agent 在每次 Evaluator 通過後執行自動生成：
1. **生成 system_specification.md**：
   * 從 `project` 區塊取得基本資訊。
   * 從 `phase_01_planning.requirements` 填充功能摘要與具體需求章節。
   * 從 `phase_02_design.database` + `api` 填充資料庫與 API 章節。
   * 從 `phase_04_testing.test_results` 填充驗收標準狀態。
   * 更新 `change_log` 並寫入 SRS 變更紀錄。
2. **生成 traceability_matrix.md**：
   * 從 `traceability.matrix` 與各階段 `outputs` 欄位自動彙整。
3. **生成 Gherkin .feature**：
   * 從 `phase_01_planning.requirements` 中每個需求的 `acceptance_criteria` 轉換為 Given/When/Then 語句。

#### 7-5. YAML Schema 驗證
每次 YAML 母版被寫入前，必須通過以下自動化驗證（由 Evaluator 執行）：
1. **結構完整性**：所有必要區塊與欄位存在且非空（`project.name`、各階段 `status`、`evaluator.passed`）。
2. **格式正確性**：YAML 語法有效、列舉值在允許範圍內（`status: [pending, in_progress, completed]`）。
3. **跨階段一致性**：下游階段的 `inputs` 引用的檔案路徑，必須存在於上游階段的 `outputs` 中。
4. **版本遞增**：`project.version` 在每次寫入時必須較前次版本遞增。
5. 驗證失敗則標記為 B 類錯誤，退回 Planner 重新規劃。

---


### 8. 階段間 IO 檔案管理機制（@io 體系）

> 階段間輸入與輸出的顯式定義為框架級設計決策，確保上下游資料傳遞可追溯、可驗證。

#### 8-1. 核心原則

1. **選擇性啟用**：階段 IO 管理為選用功能，於 `@init` 初始化時詢問使用者是否啟用（`io_management.enabled`）。預設為關閉，新手友善。
2. **顯式定義**：啟用後，每個階段透過 `io_files.yaml` 定義 `inputs`（輸入需求）與 `outputs`（產出承諾），支援 `required: true/false` 標記必填與可選。
3. **覆蓋機制**：專案可透過 `io_files.override.yaml` 覆蓋預設定義，框架預設值保持不變。
4. **上游滿足下游**：上游階段的 `outputs` 必須涵蓋所有下游階段的 `inputs`（必填項），`io_files.yaml` 中的 `from_phase` 為建議來源而非強制來源。
5. **跨階段勾稽**：`@io [phase]` 指令雙向檢查（向上：上游輸出 → 本階段輸入；向下：本階段輸出 → 下游輸入）。

#### 8-2. 與既有一級規格的關係

本機制與「階段間資料傳遞規則（三-7-3）」的 YAML 介面互補：
- YAML（`executable_spec.yaml`）定義**結構化資料**的傳遞格式
- `io_files.yaml` 定義**檔案層級**的輸入輸出依存關係
- 兩者共同構成 SSOT 的完整追溯鏈




### 9. 引導式協作機制（Guided Workflow）

> 引導式協作是本框架為新手系統分析師設計的**對話式引導機制**，透過 5 個關卡逐步帶領使用者完成每個階段的工作，並將 IO 檔案設定自動掛鉤在引導流程中。

#### 9-1. 核心原則

1. **MIT（Minimum Interaction Threshold）**：用最少的互動讓使用者完成最大價值的工作。
2. **IO 掛鉤**：引導流程的關卡 2（輸入確認）和關卡 4（輸出定義）自動整合 @io 體系，啟動引導時 io_management.enabled 自動設為 true。
3. **可中斷可恢復**：任何階段都能中途加入引導，進度記錄於 phase_gates.json 的 guided_workflow 區塊。
4. **可隨時關閉**：使用者可透過 @guide off 退出引導模式。

#### 9-2. 五關卡引導結構（每階段通用）

| 關卡 | 名稱 | 引導內容 | IO 掛鉤 |
|:----:|:-----|:---------|:--------|
| 1 | 🎯 目標確認 | AI 說明本階段「要做什麼」、「產出什麼」、「需要什麼前置」 | 無 |
| 2 | 📥 輸入檔案確認 | 引導使用者確認本階段需要的輸入檔案，自動帶入預設值 | ✅ 自動對應 io_files.yaml inputs |
| 3 | 🔧 Skill 選取 | 根據目標和 I/O 需求，推薦最適合的 Skill 組合 | 無 |
| 4 | 📤 輸出檔案定義 | 引導使用者確認本階段要產出的交付物，自動帶入預設值 | ✅ 自動對應 io_files.yaml outputs |
| 5 | 🚀 開始執行 | 確認一切就緒，開始該階段的實際工作 | 自動觸發 @io [phase] 勾稽 |

#### 9-3. 與 @io 體系的整合

- 引導模式啟動時，io_management.enabled 自動設為 true，無需另外啟用。
- 關卡 2 自動讀取 @io list [phase] 的預設輸入清單，以編號方式呈現供使用者選取。
- 關卡 4 自動讀取 @io list [phase] 的預設輸出清單，使用者確認後自動寫入 io_files.yaml。
- 關卡 5 完成後自動觸發 @io [phase] 進行跨階段勾稽，確認上下游對齊。

#### 9-4. 階段關卡狀態更新

引導進度記錄於 phase_gates.json 的 guided_workflow 區塊：

    "guided_workflow": {
      "enabled": false,
      "current_phase": null,
      "current_step": null,
      "completed_steps": [],
      "started_at": null,
      "last_active": null
    }


### 三-5. 自動備份機制（@optimize 觸發）

每次執行 `@optimize`（含 `--incremental`、`--files` 參數）時，AI 代理必須在執行檢查前自動完成以下備份流程：

1. **備份對象**：框架核心檔案（`.agents/AGENTS.md`、`docs/CORE_RULES.md`、`docs/commands_reference.md`、`README.md`、`skills/SKILLS歸類.md`、`skills/README.md`）
2. **命名規則**：`{原檔名}.backup.{YYYYMMDD-HHmmss}`
3. **保留策略**：`backups/` 目錄最多保留 **5 份**備份，超過時自動刪除最舊的
4. **清單更新**：備份完成後更新 `backups/BACKUP_MANIFEST.md`

## 四、 快照管理與日誌儲存規則

### 1. 階段檢核結果自動向上回傳
在安全軟體開發生命週期各階段應用軟體工程之 Plan、Generator、Evaluator 流程後，該階段之完整檢核結果必須自動上傳至上一層之全域主控 Agent，以利其隨時掌握與稽核全局狀態。
* **本階段上傳內容包含**：
  * 本階段所有 Skill 配置參數。
  * 執行快照（存放於根目錄的 `snapshots/` 目錄）。
  * 錯誤日誌、人機對話紀錄與版本差異（存放於根目錄的 `logs/` 目錄，記錄臨時錯誤、對話與程式碼 Baseline 差異）。
  * 階段交付物與驗證報告（存放於本階段的 `outputs/` 目錄）。
* **全域 Agent 接收並同步更新**：
  * 需求追溯鏈（更新至根目錄的 `traceability_matrix.md`）。
  * 規格文件（更新至根目錄的 `system_specification.md`）。
  * 對話紀錄與變更日誌（歸檔至根目錄的 `logs/` 目錄）。
  * 階段 Baseline（建立於根目錄的 `baseline/phase-{NN}/baseline-v{N}/`）。
  * 階段關卡狀態（更新至根目錄的 `phase_gates.json`）。

### 2. 快照與日誌儲存規則

* **快照格式**：每次階段完成或 `@baseline` 執行後，自動於 `snapshots/` 產生一對快照檔案：
  - `snapshot_YYYYMMDD-HHMMSS.md`：快照索引，包含 Git HEAD commit hash、完整檔案清單與 SHA-256 雜湊值、執行階段上下文（階段名稱、測試結果、需求追溯狀態）
  - `diff_YYYYMMDD-HHMMSS.patch`：`git diff HEAD` 的完整差異補丁，用於快速回溯還原
* **回溯還原**：AI 代理可透過 `@restore` 指令讀取最新快照的 SHA-256 檔案清單，與當前工作目錄比對後載入差異補丁，直接還原至快照點狀態，不需重跑 Plan 階段，大幅降低 Token 消耗。
* **快照保留規則**：`snapshots/` 目錄下僅保留最近 5 筆快照配對（snapshot_*.md + diff_*.patch）。當產生第 6 筆時，自動清理最舊的一對檔案，防止儲存空間膨脹。
* **日誌記錄規則**：根目錄的 `logs/` 目錄下必須詳實記錄 A 類與 B 類錯誤日誌、執行時的版本差異（例如程式碼與 Baseline 的 diff）、人機對話紀錄（`conversation_*.md`）、AI 調整紀錄（`ai_adjustment_*.md`）、迭代日誌（`iteration_log.md`），並定期輪轉清理（參見第三節第 3 條）。
* **系統固定限制**：系統固定關閉任何降級模式與輕量備援機制，Token 控制完全依靠「快照複用 + 錯誤分類 + 迭代次數上限」。

---

## 五、 部署環境適配與進程守護通則

為了確保系統在各類實體、虛擬或雲端部署環境下運行的穩定性，系統應遵循以下環境適配通則：

1. **執行進程駐留與守護機制**
   * 部署與執行環境應啟用進程駐留與守護，關閉閒置自動回收，並妥善設定閒置逾時，確保長連線或長時間任務不致因環境回收而中斷。
   * 支援在執行環境異常重啟後的任務自我復原與狀態重建。

2. **環境權限與檔案鎖定前置檢核**
   * 系統在 Plan 階段必須前置檢核存取路徑編碼與檔案鎖定狀態。
   * 確保 Generator 具有足夠的檔案讀寫權限，且 Evaluator 具備站台或介面的匿名存取與授權，防止權限不足導致執行異常。

3. **雙軌日誌審計追溯**
   * 系統必須啟用運行站台/進程日誌，與作業系統系統事件日誌（或同等的系統級事件審計日誌）之雙軌記錄機制，以支援全面的問題追溯與運行軌跡檢驗。

4. **互斥部署環境靜態檢核**
   * 若系統中存在彼此衝突的部署操作（例如容器化部署與實體進程部署），此類架構與環境之衝突應在 Plan 階段進行靜態檢核，並直接判定為 B 類錯誤予以攔截，避免環境配置產生衝突。





