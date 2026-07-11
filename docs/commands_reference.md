# AI 協作對話指令集參照表 (Command Reference)

本文件整理了專案中所有可用的對話指令。未來協作時，除了手動打字，您亦可直接用語音或口語進行操作：

#### ⭐ 指令集查詢與框架優化

- 說出「**讀取指令集**」、「**查詢可用指令**」或「**叫出指令對照表**」→ AI 代理自動呈獻此參照表。
- 說出「**幫我執行駕馭工程框架優化檢查**」、「**Harness Optimization**」、「**對齊所有**」、「**對齊架構**」、「**幫我對齊架構**」、「**檢查全案關聯**」、「**規範落實度檢查**」或「**CORE_RULES 落差掃描**」→ ⚠️ 框架建造者專用。AI 代理將顯示警告提示，確認後依序執行 10 大檢查組（含 CORE_RULES 規範 vs 實際落實落差掃描）的全域檔案關聯性地毯式檢查與修復。
- 說出「**執行增量架構對齊**」、「**只對異動檔案做架構對齊**」或「**增量檢查框架**」→ AI 代理自動執行 `@optimize --incremental`，僅對 Git diff 異動檔案及其關聯檔案執行檢查，大幅降低 Token 消耗。
- 說出「**切換角色**」、「**我是建造者**」或「**我是開發者**」→ AI 代理自動執行 `@role`，切換使用者角色。`builder` 可執行 `@optimize`、`@unlock`；`developer` 為預設角色，僅允許一般指令。新專案 `@init` 時預設為 `developer`，需調整框架時切到 `builder`，改完切回。

#### 🚀 專案初始化與階段管理

- 說出「**檢查規格**」、「**CheckSpec**」、「**規格完整性**」或「**四規格檢查**」→ AI 代理自動執行 @CheckSpec，檢查四種規格（結構化可執行規格、行為可執行規格、SRS、RTM）的完整性與交叉一致性。
- 說出「**檢查 REQ-003**」、「**確認 REQ-005 有沒有對齊**」、「**只檢查第三個需求**」→ AI 代理自動執行 @CheckSpec --req REQ-003，僅針對指定需求執行四向交叉檢查。
- 說出「**強制解鎖階段 {N}**」、「**跳過階段關卡**」→ ⚠️ 框架建造者專用。AI 代理顯示警告提示，確認後強制解鎖指定階段。

#### 🏗️ 基線與快照管理

- 說出「**建立基線**」、「**新建 Baseline**」、「**儲存專案快照**」→ AI 代理自動執行 @baseline，建立可獨立執行的完整專案快照，並於建立完成後自動觸發基線可執行性驗證（run.bat 語法、Python 匯入、模板完整性檢查）。
- 說出「**對 Phase 02 建立基線**」、「**只建這個階段的基線**」→ AI 代理自動執行 `@baseline --phase 02`，僅對指定階段建立基線。
- 說出「**建立完整專案基線**」、「**彙整所有階段建基線**」→ AI 代理自動執行 `@baseline --project`，彙整所有階段最終內容。
- 說出「**建立最新版基線**」→ AI 代理自動執行 `@baseline --latest`，自動遞增版本號。
- 說出「**比對基線差異**」、「**baseline diff**」、「**比較版本差異**」、「**v1 跟 v2 差在哪**」→ AI 代理自動執行 `@baseline-diff`，比對兩個 Baseline 版本之間的四規格差異（executable_spec.yaml、requirements.feature、system_specification.md、traceability_matrix.md），產出結構化差異報告，並自動標註破壞性變更（如需求移除、API 刪除等 ⚠️）。
- 說出「**建立快照**」、「**存快照**」或「**記錄點**」→ AI 代理自動執行 @snapshot，建立即時 git diff patch 快照與 SHA-256 檔案清單，保留最近 5 筆。
- 說出「**對 Phase 03 建立快照**」→ AI 代理自動執行 `@snapshot --phase 03`，僅對指定階段建立快照。
- 說出「**回溯快照**」、「**還原快照**」、「**退回上一步**」、「**載入快照**」、「**回復到之前的快照**」或「**復原工作目錄**」→ AI 代理自動執行 @restore，列出可用快照並引導回溯還原。

#### 🔧 Skill 查詢與導入

- 說出「**帶通用 Skill**」、「**混搭 G**」或「**加通用 git**」→ AI 代理引導以 `G` 前綴混搭通用 Skill 導入。
- 說出「**導入這個外部 Skill**」、「**把這個 Skill 加入內建**」、「**import-skill**」、「**收錄成內建 Skill**」→ AI 代理自動執行 `@import-skill <skill-name>`。
- 說出「**列出可匯入 Skill**」、「**有哪些外部 Skill 可匯入**」→ AI 代理自動執行 `@import-skill-list`。
- 說出「**移除內建 Skill**」、「**把 Skill 退回外部資源**」→ AI 代理自動執行 `@import-skill-remove <skill-name>`。

#### 📂 IO 檔案管理

- 說出「**檢查 IO**」、「**IO 勾稽**」→ AI 代理自動執行 @io，以指定階段為中心進行跨階段 IO 勾稽檢查。
- 說出「**設定 IO**」、「**定義 IO 檔案**」→ AI 代理自動執行 @io set，互動式定義或修改階段 IO 檔案。
- 說出「**查看 IO**」、「**顯示 IO 檔案**」→ AI 代理自動執行 @io show，檢視指定階段的 IO 檔案清單。
- 說出「**比對 IO**」、「**IO 差異**」→ AI 代理自動執行 @io diff，比對兩個階段的 IO 檔案差異。
- 說出「**列出 IO**」、「**各階段 IO**」→ AI 代理自動執行 @io list，列出各階段預設 IO 速查表。

#### 🤖 引導式協作

- 說出「**開始引導**」、「**引導我**」、「**帶我做**」、「**下一步做什麼**」或「**guide me**」→ AI 代理自動執行 @guide，啟動當前（或指定）階段的引導式協作對話。
- 說出「**關閉引導**」、「**停止引導**」→ AI 代理自動執行 @guide off，退出引導模式。
- 說出「**引導進度**」、「**我做到哪裡了**」→ AI 代理自動執行 @guide status，顯示引導進度。
- 說出「**下一步**」、「**跳過這步**」→ AI 代理自動執行 @guide next，前進到下一個引導步驟。

#### 🛡️ 資安防護

- 說出「**載入資安構面**」、「**導入安全防護**」或「**只加存取控制和日誌**」→ AI 代理自動執行 @security-load，列出構面清單或依指定等級/構面導入。
- 說出「**執行資安檢核**」、「**資通安全稽核**」或「**安全檢核**」→ AI 代理自動執行 @security-check，依專案選定等級進行 7 構面逐項比對，產出檢核報告。

#### 🌐 外部資源管理

- 說出「**引入外部 Skill**」、「**新增第三方資源**」、「**下載新的 Skill**」、「**加入外部 Skill**」→ AI 代理自動執行 @external-resource add，依 `external-resources/SKILL.md` 工作流程下載、登記並合規檢查外部第三方資源。
- 說出「**移除外部 Skill**」、「**刪除第三方資源**」→ AI 代理自動執行 @external-resource remove，清理指定外部資源的目錄、資源清單與 `.gitignore` 規則。
- 說出「**查看外部資源**」、「**列出第三方 Skill**」→ AI 代理自動執行 @external-resource list，列出所有外部資源的名稱、來源、授權與狀態。


---

## 一、 核心指令對照表

| 指令語法 | 參數說明 | 系統行為 (AI 代理動作) | 範例 |
| :--- | :--- | :--- | :--- |
| **`@[階段]`** | `00` 到 `06` 的階段雙位數代碼 | 掃描庫中該階段所有可用 Skill，按字母/數字順序為其編配雙位數快捷編號。同時顯示 `skills/00_cross_phase/` 通用 Skill（`G01`, `G02` ...）。以「快捷編號 — 實體名稱 — 用途描述」富資訊格式列出。 | `@02` |
| **`@[階段]/[快捷],G[快捷],...`** | `G` 前綴 = `00_cross_phase` 通用 Skill，可與階段快捷混搭 | 混搭導入。階段專屬 Skill 與通用 Skill（`G` 前綴）可混合以逗號串接。通用 Skill 從 `skills/00_cross_phase/` 部署至指定階段。**⚠️ 防呆同上**。 | `@02/01,G01,G03` |
| **`in:` / `out:` 快速語法** | `in:`=輸入，`out:`=輸出，`?`=可選 | Skill 選定後一行定義 IO。`@03 in: api_spec, db_schema, ui?` | `@03 in: api_spec, db_schema, ui?` |
| **`@backup`** | 無 | 手動建立框架核心檔案備份至 `backups/`（保留最近 5 份），更新 `BACKUP_MANIFEST.md` | `@backup` |
| **`@baseline [--phase NN] [--project] [--latest]`** | `--phase NN`：指定階段 / `--project`：彙整全部 / `--latest`：自動遞增版本 / 無參數：當前階段 | 建立可獨立執行的完整專案快照至 `baseline/` 目錄。`--phase NN` 僅對指定階段建立基線至 `baseline/phase-{NN}/baseline-v{N}/`；`--project` 彙整所有階段最終內容至 `baseline/`；`--latest` 自動遞增版本號。含原始碼、模板、資料庫、部署腳本，保留最近 3 份，舊版自動清理。**🔍 建立完成後自動執行基線可執行性驗證。** **🔄 自動觸發**：每次階段 Evaluator 通過後自動執行（等同 `@baseline --phase {當前階段}`）。口語觸發：「建立基線」、「新建 Baseline」、「對 Phase 02 建立基線」、「建立最新版基線」。 | `@baseline --phase 02` |
| **`@baseline-diff [v1] [v2]`** | `v1` `v2`：指定版本 / 單一版本：自動比對前一版 / 無參數：列出版本供選擇 | 比對兩個 Baseline 版本之間的四規格差異（executable_spec.yaml、requirements.feature、system_specification.md、traceability_matrix.md），產出結構化差異報告。自動標註破壞性變更（需求移除、API 刪除等）。口語觸發：「比對基線差異」「baseline diff」「比較版本差異」。 | `@baseline-diff v1 v2` |
| **`@CheckSpec [--req REQ-NNN]`** | 無：全量檢查 / `--req REQ-003`：僅檢查指定需求 | 檢查四種規格（executable_spec.yaml / requirements.feature / system_specification.md / traceability_matrix.md）的完整性與交叉一致性，產出摘要報告。口語觸發：「檢查規格」「CheckSpec」「規格完整性」「四規格檢查」。 | `@CheckSpec` |
| **`@external-resource add <URL>`** | GitHub repo 連結 | 將外部第三方 Skill 下載至 `external-resources/` 目錄，自動更新資源清單、`.gitignore` 排除規則與 `url.txt` 索引。完整工作流程參照 `external-resources/SKILL.md`。口語觸發：「引入外部 Skill」「新增第三方資源」「下載新的 Skill」。 | `@external-resource add https://github.com/owner/repo` |
| **`@external-resource list`** | 無 | 列出 `external-resources/` 下所有第三方資源的名稱、來源、授權與狀態。口語觸發：「列出外部資源」「查看第三方 Skill」。 | `@external-resource list` |
| **`@external-resource remove <名稱>`** | Skill 目錄名稱 | 移除指定外部第三方 Skill，同步清理 `README.md` 資源清單、`.gitignore` 規則與 `url.txt`。口語觸發：「移除外部 Skill」「刪除第三方資源」。 | `@external-resource remove ui-ux-pro-max-skill` |
| **`@guide [phase]`** | phase: `01`~`06`，省略=當前階段 | 啟動引導式協作對話。依 5 個關卡（目標確認→輸入設定→Skill 選取→輸出定義→開始執行）逐步引導，自動整合 IO 管理。口語觸發：「開始引導」「引導我」「帶我做」。 | `@guide 02` |
| **`@guide off`** | 無 | 退出引導模式，已完成項目保持不變。口語觸發：「關閉引導」「停止引導」。 | `@guide off` |
| **`@guide status`** | 無 | 查看當前階段引導進度（已完成/待完成關卡）。口語觸發：「引導進度」「我做到哪裡了」。 | `@guide status` |
| **`@guide next`** | 無 | 跳過/完成當前步驟，前進下一個引導步驟。口語觸發：「下一步」「跳過這步」。 | `@guide next` |
| **`@help`** | 無 | 立即顯示本指令集參照表的完整內容，方便快速查閱所有可用指令與語法。 | `@help` |
| **`@import-skill <skill-name>`** | Skill 目錄名稱 | 將 `external-resources/` 中指定外部 Skill 匯入 `skills/` 成為框架內建 Skill。自動執行歸類判斷、複製目錄、更新三檔。口語觸發：「導入 Skill」「收錄成內建 Skill」。 | `@import-skill markitdown` |
| **`@import-skill-list`** | 無 | 掃描 `external-resources/` 與 `skills/`，列出尚未匯入框架內建的外部 Skill 清單。口語觸發：「列出可匯入 Skill」。 | `@import-skill-list` |
| **`@import-skill-remove <skill-name>`** | Skill 目錄名稱 | 從 `skills/` 移除指定內建 Skill，回退至外部資源池，並同步更新三檔。口語觸發：「移除內建 Skill」「把 Skill 退回外部資源」。 | `@import-skill-remove markitdown` |
| **`@init [相對路徑]`** | 新專案的建立路徑 | 讀取專案範本結構，在指定路徑下建立完整的 SSDLC 目錄與必要之基礎控制檔案。建立完成後依序引導：(1) 詢問是否啟用階段級 Baseline（預設否），(2) 詢問是否導入資安防護基準 Security-Principles（選定 general/medium/high），(3) 詢問是否立即配置各階段 Skill（展示可用快捷編號清單）。 | `@init ./my_new_project` |
| **`@[階段]/[快捷編號]`** | 階段代碼與特定的雙位數快捷編號 | AI 代理將快捷編號還原為實體名稱後，直接將該 Skill 的檔案部署至專案對應目錄，並將 instructions 動態追加合併至該階段的 `SKILL.md` 中。**⚠️ 🚫 強制防呆：導入前強制檢查當前目錄是否為已初始化之 SSDLC 專案，若非專案目錄則強制中止、嚴禁繞過，提示使用者先執行 `@init`。** | `@01/01` |
| **`@[階段]/[快捷編號_1],[快捷編號_2]`** | 逗號相連的多個快捷編號 | 聯合導入。依次部署多個 Skill，並將它們的 instructions 以各自標題獨立封裝追加合併至目標 `SKILL.md`。**⚠️ 防呆：導入前須確認當前目錄為已初始化之專案（具備 `traceability_matrix.md`、`system_specification.md` 及 SSDLC 階段目錄），否則強制中止、嚴禁繞過，提示使用者必須先執行 `@init [路徑]` 建立專案後再導入。** | `@02/01,02` |
| **`@io [phase]`** | phase: `01`~`06` | 跨階段 IO 勾稽檢查。雙向檢查上游輸出是否滿足下游輸入。 | `@io 02` |
| **`@io diff [A] [B]`** | 兩個階段代碼（`01`~`06`） | 比對兩個階段 IO 檔案差異（新增 / 移除 / 變更）。 | `@io diff 02 03` |
| **`@io list [phase]`** | phase: `00`~`06`，省略 = 全顯示 | 列出各階段預設 IO 速查表，供快速瀏覽與選取。 | `@io list` |
| **`@io set [phase]`** | phase: `00`~`06` | 互動式設定階段 IO 檔案。顯示編號清單，使用者勾選保留項目。 | `@io set 03` |
| **`@io show [phase]`** | phase: `00`~`06` | 檢視指定階段的 IO 檔案清單（inputs / outputs）。 | `@io show 03` |
| **`@optimize [--incremental] [--files <清單>]`** | 無：全量 / `--incremental`：增量 / `--files`：指定檔案 | ⚠️ **框架建造者專用**。觸發 Harness Optimization。先執行 `scripts/align_framework.ps1` 動態掃描，再執行 10 大檢查組。`--incremental` 透過 Git diff 僅檢查異動檔案及其關聯檔案；`--files` 僅對指定檔案執行關聯檢查。**需 `@role builder` 方可執行。** 口語觸發：「對齊架構」「執行增量架構對齊」「只對異動檔案做架構對齊」。 | `@optimize --incremental` |
| **`@restore`** | `latest` / `N`（1~5） / `YYYYMMDD-HHMMSS` | 回溯工作目錄至指定執行快照。自動 `git stash` 保留未提交變更 → `git apply` 載入差異補丁 → SHA-256 驗證還原完整性。口語觸發：「回溯快照」「還原快照」「退回上一步」。 | `@restore latest` |
| **`@role [builder/developer]`** | `builder` / `developer` / 無參數=顯示當前角色 | 切換使用者角色。`builder` 可執行 `@optimize`、`@unlock`；`developer` 為預設角色，僅允許一般指令。`@init` 時預設為 `developer`。口語觸發：「切換角色」「我是建造者」「我是開發者」。 | `@role builder` |
| **`@security-check [等級]`** | `general` / `medium` / `high` | 載入對應等級之資安防護基準檢核表（Security-Principles Skill），根據當前 SSDLC 階段篩選適用構面，**參照 `check_scope_per_domain.md` 逐項比對**系統產出是否符合控制措施要求，產出 `outputs/security_check_report.md`（**報告格式參照 `security_check_report_template.md`**）。構面 8（非軟體因子）在軟體專案中預設標記為不適用。**⚠️ 檢核報告強制包含階段性限制免責聲明**：非軟體因素導致未符合之項目須明確標註原因。口語觸發：「執行資安檢核」「資通安全稽核」「以普級防護基準檢查」。 | `@security-check medium` |
| **`@security-load [等級] [構面1,構面2,...]`** | 等級：`general` / `medium` / `high`；構面：`1`~`8`（逗號分隔，省略=全選）；無參數=列出構面清單 | 於任一階段中途導入資安防護基準，支援選定特定構面。執行相容性檢查後寫入當前階段 `SKILL.md`，並更新 `phase_gates.json`。口語觸發：「載入資安構面」「只加存取控制」「導入安全防護」。 | `@security-load medium 1,4,6` |
| **`@snapshot [--phase NN] [--latest] [--project]`** | `--phase NN`：指定階段 / `--latest`：自動遞增版本 / `--project`：全域（預設） | 手動建立即時快照（git diff patch + SHA-256 清單）。`--phase NN` 僅對指定階段建立快照至 `snapshots/phase-{NN}/`；`--latest` 自動遞增版本號；`--project` 等同無參數。每個目錄保留最近 5 筆。口語觸發：「建立快照」「存快照」「對 Phase 02 建立快照」「存最新版快照」。 | `@snapshot --phase 02` |
| **`@stages`** | 無 | 立即輸出 SSDLC 六大開發階段與跨階段全域共用分類（00_cross_phase）的代碼及中文名稱對照表。 | `@stages` |
| **`@unlock [階段代碼]`** | `01` 到 `06` 的階段雙位數代碼 | ⚠️ **框架建造者專用**。強制解鎖指定階段的關卡限制。適用情境：框架調試、緊急 Hotfix、階段重建。**專案開發者日常流程中永遠不需使用。** 執行前顯示警告提示，確認後解鎖並記錄於 `phase_gates.json` 與 `logs/ai_adjustment_*.md`。 | `@unlock 03` |
| 指令語法 | 參數說明 | 系統行為 (AI 代理動作) | 範例 |

>
> **⚠️ 修正範圍規則**：`builder` **只能修正框架根目錄**的內容（`.agents/`、`docs/`、`skills/`、`scripts/`、`specs/` 等框架主體），**不能直接修正專案目錄**內的內容。在專案中發現框架問題時，應透過「待辦事項」機制反饋到框架根目錄的 `待辦事項.md`，而非當下直接修改框架。
> - **專案歸專案**：專案目錄下的 `@` 指令都是專案層級操作，不觸及框架主體。
> - **反饋走待辦**：專案中發現框架問題 → 記錄到 `待辦事項.md` → 日後修正框架。
> - **目錄辨識**：AI 代理執行指令前自動掃描 `docs/` 下的框架專屬檔案（`CORE_RULES.md`、`commands_reference.md`、`TEMPLATE_SKILL.md`、`Harness_Optimization_SKILL.md`）判斷是框架根目錄還是專案目錄。

### SSDLC 階段代碼參照

| 代碼 | 階段名稱 | 目錄 |
| :--- | :--- | :--- |
| `00` | 跨階段全域共用 | `00_cross_phase/` |
| `01` | 規劃與需求分析 | `01_planning_and_analysis/` |
| `02` | 系統設計 | `02_system_design/` |
| `03` | 開發與編碼 | `03_implementation_and_coding/` |
| `04` | 測試驗證 | `04_testing/` |
| `05` | 部署發布 | `05_deployment/` |
| `06` | 維護與營運 | `06_maintenance/` |

---

## 二、 參數防呆與錯誤處理規則


### 1. 快捷編號與逗號 (,) 防呆提醒
*   **觸發條件**：使用者輸入非雙位數快捷編號（如完整資料夾名稱），或使用逗號 `,` 進行多快捷編號導入。
*   **檢核機制**：系統檢核輸入的快捷編號是否在該階段的快捷對照表中。若是聯合導入，依逗號進行分割並逐一檢核。
*   **錯誤提醒與友好提示**：
    *   **完整名稱輸入友好提示**：若使用者輸入完整 Skill 資料夾名稱（如 `@01/skill_categorizer`），系統將提示：「請使用快捷編號進行導入，例如使用 `@01/01` 代替 `@01/skill_categorizer`」。
    *   **前綴字母錯誤提醒**：若 AI 代理在輸出快捷編號清單時誤加字母前綴（如 `S01`、`S02`），系統必須自我修正，移除所有前綴字母，僅保留純雙位數數字（`01`、`02`）。此為 AI 代理內部自我檢核，不需對使用者顯示錯誤訊息。
    *   **無效快捷編號錯誤提醒**：若其中有任何一個快捷編號在該開發階段或通用 Skill 清單中不存在（`G` 前綴 Skill 另行提示），系統將會中止導入，並在對話中提示：「未找到編號為 [未找到的快捷編號] 的 Skill，請確保逗號兩側皆為有效的快捷編號。正確語法範例：`@[階段]/[快捷編號1],[快捷編號2]`」，並同時列出該階段所有可用的快捷編號與實體 Skill 對照清單。

---
### 2. 專案初始化防呆 (Project Init Guard)
*   **觸發條件**：使用者在未經 `@init` 初始化的目錄下執行 `@[階段]/[快捷編號]` 導入指令。
*   **檢核機制**：AI 代理在執行 Skill 導入前，必須檢查當前工作目錄是否為已初始化之專案（根目錄須具備 `traceability_matrix.md`、`system_specification.md` 及 SSDLC 階段目錄結構）。
*   **攔截行為**：若當前目錄非已初始化專案，AI 代理必須強制中止導入、嚴禁以任何形式繞過或繼續，並提示：「當前目錄尚未初始化為 SSDLC 專案，請先執行 `@init [路徑]` 建立專案工作目錄後再導入 Skill。」


### 4. 快照回溯防呆 (Restore Guard)
*   **觸發條件**：使用者執行 `@restore` 指令。
*   **檢核機制**：
    1. 掃描 `snapshots/` 目錄，確認目標快照配對（snapshot_*.md + diff_*.patch）存在。
    2. 若無任何快照，提示：「當前尚無可用快照，請先執行 @baseline 建立基線後再回溯。」
    3. 若指定時間戳的快照不存在，列出最近 5 筆可用快照供選擇。
*   **安全網**：
    1. 回溯前強制顯示警告提示，要求使用者明確確認。
    2. 自動 `git stash` 保留當前未提交變更（stash message：`pre-restore-[timestamp]`）。
    3. `git apply` 失敗時不強制覆蓋，輸出衝突檔案清單供手動處理。
    4. 載入後以 SHA-256 驗證還原完整性，不符時明確列出差異檔案。

### 5. Baseline 建立後自動驗證防呆 (Baseline Auto-Verify)
*   **觸發時機**：每次 `@baseline` 完成快照建立後自動執行，無需使用者額外呼叫。
*   **語言適配說明**：以下以 Python Flask 專案為範例。若專案使用其他語言或框架（Java / Node.js / Go / C# 等），AI 代理應自動偵測專案技術棧，並將驗證項目替換為對應語言的等效檢查（詳見 CORE_RULES.md 三-4-3 語言適配對照表）。
*   **通用驗證項目**（不限語言，所有專案皆執行）：
    1. **啟動腳本語法檢查**：確認啟動腳本存在、編碼正確、路徑引用有效。
    2. **依賴清單完整性**：確認依賴宣告檔存在且格式正確（`requirements.txt` / `package.json` / `pom.xml` / `go.mod` 等）。
    3. **程式碼編譯或語法檢查**：依技術棧執行（Python: `import`；Java: `javac`；Node.js: `node --check`；Go: `go build`）。
    4. **服務啟動與 HTTP 回應檢查**：背景啟動應用，對其預設埠號發出 HTTP GET，確認回應 200。
    5. **必要資源檔案完整性**：確認專案所需的模板、靜態資源、設定檔等存在。
*   **Python Flask 範例檢查**（`demo_project` 預設）：`run.bat` 語法 → `python -c "import app"` → `http://127.0.0.1:5000` → `templates/*.html` → `requirements.txt` 含 `flask`
*   **失敗處理**：任一檢查失敗即中止並輸出「Baseline 驗證失敗報告」。
*   **成功處理**：所有檢查通過後輸出「✅ Baseline vX 驗證通過」摘要。


## 三、 @unlock 指令使用時機與方式詳解

`@unlock` 是階段關卡系統的**緊急繞道開關**，僅限框架建造者使用。

### 正常流程（不需 @unlock）

```
01 完成 → Evaluator 通過 → phase_gates.json 自動解鎖 02
02 完成 → Evaluator 通過 → phase_gates.json 自動解鎖 03
...→ 06
```

每個階段 Evaluator 判定通過後，全域 Agent 自動把下一階段的 `status` 從 `locked` 改為 `unlocked`。**日常開發完全不需要手動操作。**

### 三種合法使用情境

| 情境 | 說明 | 範例 |
|:---|:---|:---|
| **框架建造者調試** | 正在調整某階段的 SKILL.md 模板，想直接跳到該階段看效果，不想重跑前面所有階段 | `@unlock 03` 直接進入開發階段測試 |
| **緊急 Hotfix** | 06 維護階段發現線上 bug，需立即修補。不需也不能重走 01~05 | `@unlock 06` 直接進入維護階段 |
| **階段重建** | 對 02 設計產出不滿意，想把 02 及之後全部重置，從 02 重新開始 | `@unlock 02` 後手動重置後續階段 |

### 執行步驟

1. 使用者說「強制解鎖階段 03」
2. AI 代理讀取 `phase_gates.json`，確認 03 當前狀態
3. ⚠️ 顯示警告：「強制解鎖將繞過階段關卡檢查，可能導致需求追溯斷裂與規格不一致。確認強制解鎖階段 03？」
4. 使用者確認後：
   - `phase_gates.json` 中 03 的 `status` → `in_progress`
   - 記錄解鎖事件（時間戳、操作者、理由）
   - 寫入 `logs/ai_adjustment_{date}.md`
5. 使用者取消 → 不執行任何變更

### ⚠️ 注意事項

- **不自動建立缺失的階段 Baseline**：解鎖後該階段從空白開始，前置階段的產出須手動確認
- **不自動更新追溯鏈**：跳過的階段在 `traceability_matrix.md` 中不會有對應記錄
- **專案開發者不應使用**：正常開發流程中的階段切換由系統自動管控，不需手動解鎖
- **每次解鎖留下審計記錄**：所有解鎖事件記錄於 `phase_gates.json` 與 `logs/ai_adjustment_*.md`，可供回溯


## 四、 @CheckSpec 指令使用說明

### 檢查的四種規格

| 規格類型 | 檔案 | 讀者 | 說明 |
|:---|:---|:---|:---|
| **結構化可執行規格** | `executable_spec.yaml` | 🤖 AI | YAML 格式，定義需求清單、API 規格、資料模型、安全控制 |
| **行為可執行規格** | `requirements.feature` | 🤖 AI | Gherkin 語法，Given-When-Then 場景描述 |
| **系統規格書 (SRS)** | `system_specification.md` | 👤 人類 | 人可讀的完整系統規格文件 |
| **追溯矩陣 (RTM)** | `traceability_matrix.md` | 🔗 追溯 | 需求與實作的雙向追溯鏈 |

### 檢查項目

| 檢查項目 | 說明 |
|:---|:---|
| **檔案存在性** | 四種規格檔案是否存在於正確路徑 |
| **YAML 有效性** | `executable_spec.yaml` 是否為合法 YAML 語法 |
| **Gherkin 語法** | `requirements.feature` 的 Feature/Scenario 結構是否正確 |
| **SRS 參照完整性** | `system_specification.md` 是否參照所有 REQ 需求 |
| **追溯鏈完整性** | `traceability_matrix.md` 是否追溯所有需求 |
| **交叉一致性** | YAML 需求 ⇄ Feature 場景 ⇄ SRS ⇄ RTM 四向交叉比對 |

### 使用範例

- `@CheckSpec` → 執行四規格完整性與交叉一致性檢查，產出摘要報告
- `@CheckSpec --req REQ-003` → 僅針對 REQ-003 執行增量交叉檢查，快速確認單一需求的四向對齊狀態

### 執行流程

1. AI 代理執行 `python scripts/check_spec_integrity.py --mode S`
2. 依序檢查：檔案存在性 → Gherkin 語法 → SRS 參照 → 追溯鏈 → 交叉一致性
3. 產出四規格摘要報告（含各規格狀態、通過/失敗統計）
4. 若有異常項目，列出清單供使用者檢視

---

---

## 五、 @io 階段 IO 檔案指令使用說明

> **使用前提**：本節指令需先在 `@init` 初始化時啟用「輸入與輸出檔案管理」，或之後透過 `@io set` 首次定義 IO 檔案。若未啟用，所有階段不強制規範檔案格式與內容，使用者可自由管理階段間的資料傳遞，不受任何 IO 約束。
>
> **適用對象**：想透過結構化 IO 定義來確保階段間資料傳遞一致性的進階使用者。新手可跳過本節，完全不影響 SSDLC 各階段的正常運作。

### IO 檔案位置

各階段IO 檔案存放在 `.agents/skills/0*_*/io_files.yaml`，範本由框架提供。使用者可透過 `io_files.override.yaml` 進行彈性覆蓋。

### `@io show [phase]`

檢視指定階段的IO 檔案內容，顯示 inputs/outputs 清單、必填/可選狀態。

- `@io show 03` → 檢視 Phase 03 的IO 檔案

### `@io set [phase]`

互動式定義或修改階段IO 檔案。啟動後顯示編號清單，使用者輸入要保留的編號（逗號分隔），未選到的會移除：

```
in:  ① formal_requirements   ② api_spec
     ③ db_schema              ④ ui_prototype?
out: ① src  ② tests  ③ task_list
─────────────────────────────────────────
in:  要哪些？（例: 1,2,3,4）
out: 要哪些？（例: 1,2,3）
```

可混合文字新增項目（如 `in: 1,2,3, deploy_config`）。重新設定後顯示變更摘要，確認後寫入。

**設計原則**：不是逐項微調，而是直接重新選取你想要的項目。

### `@io [phase]`

以指定階段為中心進行跨階段 IO 勾稽，檢查項目：

| 檢查項目 | 說明 |
|:---|:---|
| **上游→本階段** | 本階段宣告的必填 inputs 在上游是否有對應的 outputs |
| **本階段→下游** | 本階段的 outputs 是否滿足所有下游階段的 inputs |
| **檔案存在性** | 各階段宣告的必填產出檔案是否實際存在 |
| **IO 檔案完整性** | 所有階段皆有 io_files.yaml |

### `@io diff [A] [B]`

比對兩個階段的IO 檔案差異，輸出新增/移除/變更項目清單。

### `@io list [phase]`

列出各階段的預設輸入輸出檔案清單。不帶參數時顯示全部階段，帶參數時只顯示指定階段。

#### 各階段預設 IO 速查表

> `?` = 可選項目（optional），無標記 = 必填（required）。安全相關產出（如 rbac_matrix.md、security_*_report.md）在啟用 Security-Principles 時自動追加。
> 編號對應 `@io set` / `@io show` 顯示的順序，可直接用於 `@03 in: 1,2,3` 快速設定。

---

**Phase 01 — 規劃與需求分析**

| 編號 | 種類 | 檔案 | 說明 |
|:---:|:-----|:-----|:-----|
| 1 | in | user_requirement_raw.md `?` | 使用者原始口述需求（可選） |
| 2 | in | RFP 文件 `?` | 需求建議書等參考文件（可選） |
| 1 | out | formal_requirements.md | 正規化需求規格書 |
| 2 | out | system_specification.md | 人可讀 SRS 系統規格書 |
| 3 | out | executable_spec.yaml | AI 可執行結構化規格（SSOT） |
| 4 | out | requirements.feature | AI 可執行行為化規格（Gherkin） |
| 5 | out | traceability_matrix.md | 需求追溯表 |

**Phase 02 — 系統設計**

| 編號 | 種類 | 檔案 | 說明 |
|:---:|:-----|:-----|:-----|
| 1 | in | formal_requirements.md | 正規化需求規格書（來自 Phase 01） |
| 2 | in | traceability_matrix.md | 需求追溯表（來自 Phase 01） |
| 3 | in | executable_spec.yaml | 結構化規格（來自 Phase 01） |
| 4 | in | requirements.feature | 行為化規格（來自 Phase 01） |
| 1 | out | db_schema.sql | 資料庫結構定義（Table、欄位、PK、FK） |
| 2 | out | er_diagram.md | 實體關聯圖（Mermaid erDiagram） |
| 3 | out | api_spec.md | API 規格文件（端點、Method、參數、回應） |
| 4 | out | ui_prototype.html `?*` | 互動式 UI 雛型（`*` 依系統類型判定：有前端介面→必填，純 API 後端→可跳過。Planner 須於設計規劃時明確標示） |
| 5 | out | use_case_diagram.md | 使用案例圖 |
| 6 | out | activity_diagram.md | 活動圖 |
| 7 | out | sequence_diagram.md | 時序圖 |
| 8 | out | er_diagram.puml `?` | ER 圖 PlantUML 格式（需選取 plantuml Skill） |
| 9 | out | use_case_diagram.puml `?` | 使用案例圖 PlantUML 格式（需選取 plantuml Skill） |
| 10 | out | activity_diagram.puml `?` | 活動圖 PlantUML 格式（需選取 plantuml Skill） |
| 11 | out | sequence_diagram.puml `?` | 時序圖 PlantUML 格式（需選取 plantuml Skill） |
| 12 | out | db_schema.xlsx `?` | Excel 資料庫結構（多 Sheet：總覽 + 各資料表欄位定義，需選取 xlsx Skill） |

**Phase 03 — 開發與編碼**

| 編號 | 種類 | 檔案 | 說明 |
|:---:|:-----|:-----|:-----|
| 1 | in | api_spec.md | API 端點定義（來自 Phase 02） |
| 2 | in | db_schema.sql | 資料庫結構（來自 Phase 02） |
| 3 | in | executable_spec.yaml | 結構化規格（SSOT） |
| 4 | in | ui_prototype.html `?` | UI 設計系統（純 API 專案可跳過） |
| 1 | out | src/ | 應用程式原始碼 |
| 2 | out | tests/ | 單元測試程式 |
| 3 | out | task_list.json | 開發任務拆解清單 |
| 4 | out | unit_test_results.xml `?` | 單元測試執行結果（可選） |

**Phase 04 — 測試驗證**

| 編號 | 種類 | 檔案 | 說明 |
|:---:|:-----|:-----|:-----|
| 1 | in | src/ | 原始碼（來自 Phase 03） |
| 2 | in | executable_spec.yaml | 結構化規格（SSOT） |
| 3 | in | requirements.feature | 行為化規格（驗收場景） |
| 4 | in | traceability_matrix.md | 需求追溯表（確認測試覆蓋） |
| 5 | in | unit_test_results.xml `?` | 單元測試結果（供回歸參照） |
| 1 | out | test_api.py | pytest API 功能測試腳本 |
| 2 | out | test_ui.py `?` | Playwright UI 測試腳本（無 UI 可跳過） |
| 3 | out | test_results.md | 測試結果報告（通過/失敗/覆蓋率） |
| 4 | out | bug_tracker.md | Bug 登錄追蹤表 |

**Phase 05 — 部署發布**

| 編號 | 種類 | 檔案 | 說明 |
|:---:|:-----|:-----|:-----|
| 1 | in | src/ | 原始碼（來自 Phase 03） |
| 2 | in | db_schema.sql | 資料庫初始化腳本（來自 Phase 02） |
| 3 | in | executable_spec.yaml | 結構化規格（SSOT） |
| 4 | in | env_config `?` | 環境配置參數與金鑰（人類輸入） |
| 1 | out | build_manifest.json | 建置組態清單（含 SHA-256） |
| 2 | out | signature_status.json | 數位簽章驗證結果 |
| 3 | out | deployment_topology.md | 多服務部署拓樸圖 |

**Phase 06 — 維護與營運**

| 編號 | 種類 | 檔案 | 說明 |
|:---:|:-----|:-----|:-----|
| 1 | in | BUG_*.md `?` | 線上異常或修補需求（可選） |
| 2 | in | REQ_*.md `?` | 使用者新增需求（可選） |
| 3 | in | executable_spec.yaml | 結構化規格（SSOT） |
| 1 | out | incident_report.md | 故障分析與根源報告 |
| 2 | out | patch_changelog.md | 修補日誌與異動明細 |
| 3 | out | monitoring_dashboard.json | 監控儀表板指標配置 |

#### 使用方式

```
@io list              # 顯示全部階段 IO 速查表
@io list 03           # 只顯示 Phase 03 的 IO
```

#### 使用時機

| 情境 | 操作 |
|:------|:------|
| 第一次設定 IO，不知道有哪些選項 | `@io list` 看速查表 |
| 選完 Skill 後想確認預設 IO | `@io list 03` |
| 想直接套用預設值 | 看到清單後按 Enter 採用 |
| 想微調預設值 | `@io list 03` 看完後用 `@io set 03` 調整 |




### `in:` / `out:` 快速語法

Skill 選定後，可直接用一行指令定義該階段的輸入輸出，不需要進互動對話。

#### 方式一：用編號（最快）

先跑 `@io show [phase]` 看當前編號清單，然後：

```
@03 in: 1,2,3           # 保留 in 的第 1,2,3 項，其他移除
@03 out: 1,2            # 保留 out 的第 1,2 項，其他移除
```

#### 方式二：用檔名

```
@03 in: formal_requirements, api_spec, db_schema
@03 out: src, tests, task_list
```

#### 方式三：編號 + 文字混合

```
@03 in: 1,2,3, deploy_config       # 保留 1,2,3 + 新增 deploy_config（必填）
@03 out: 1,2, docs?                # 保留 1,2 + 新增 docs（可選）
```

#### 可選符號 `?`

檔名後加 `?` 表示該項目為可選（optional），不加則為必填（required）：

```
@02 out: db_schema, api_spec, ui_prototype?, rbac_matrix?
#              必填          必填          可選            可選
```

#### 使用時機

| 情境 | 用哪個 |
|:------|:------|
| 已經知道編號，想快速改 | `@03 in: 1,2,3` |
| 不想記編號，直接打檔名 | `@03 in: api_spec, db_schema` |
| 想保留大部分 + 加幾個新的 | `@03 in: 1,2,3, deploy_config` |
| 第一次設定，不知道有哪些選項 | 先用 `@io show 03` 查看，再用 `@io set 03` 互動設定 |

### IO 檔案定義標準流程

1. 使用者執行 `@[phase] [skill_codes]` 選定 Skill
2. AI 代理根據模板 `io_files.yaml` 自動建議 IO 清單
3. 使用者確認或調整（透過編號重新設定）
4. 寫入 `io_files.yaml`（或 `io_files.override.yaml` 覆蓋層）
5. 後續可隨時透過 `@io set` 修改、`@io` 檢查

### 使用範例

- `@03 01,02` → 選 Skill + 自動引導 IO 定義
- `@03 in: api_spec, db_schema, ui?` → 快速定義輸入
- `@03 out: src, tests, task_list` → 快速定義輸出
- `@io 02` → 檢查 Phase 02 上下游 IO 對齊
- `@io show 03` → 查看 Phase 03 IO 檔案
- `@io diff 02 03` → 比對 Phase 02 與 03 IO 檔案差異


---

## 六、 @snapshot 即時快照指令

### `@snapshot`

手動建立即時快照。快照是一份**輕量的時間點記錄**，包含 git diff patch 與檔案 SHA-256 清單，用於 git 操作前的安全網或臨時記錄點。

- 存放於 `snapshots/` 目錄
- 保留最近 5 筆
- 檔案格式：`snapshot_YYYYMMDD-HHMMSS.md` + `diff_YYYYMMDD-HHMMSS.patch`

#### Baseline（基線）vs Snapshot（快照）差異

| | **@snapshot 快照** | **@baseline 基線** |
|:--|:-------------------|:--------------------|
| 概念 | Ctrl+Z 記錄點（輕量） | 遊戲存檔（完整） |
| 內含 | git diff patch + SHA-256 清單 | 原始碼 + 模板 + 資料庫 + 部署腳本 |
| 用途 | 修改前存個記錄點，出事快速回溯 | 階段里程碑，可獨立執行部署 |
| 觸發 | 手動 `@snapshot` / Generator 完成後自動 | 手動 `@baseline` / Evaluator 通過後自動 |
| 存放 | `snapshots/` | `baseline/phase-{NN}/baseline-v{N}/` |
| 保留 | 最近 5 筆 | 最近 3 份 |
| 大小 | 小（數 KB ~ 數 MB） | 大（完整專案） |

#### 使用範例

```
@snapshot              # 立即建立快照
```

**口語觸發**：「建立快照」「存快照」「記錄點」。

#### 流程

1. AI 代理執行 `git diff HEAD` 產出差異補丁
2. 計算所有追蹤檔案的 SHA-256 雜湊
3. 寫入 `snapshots/snapshot_YYYYMMDD-HHMMSS.md`（索引）+ `diff_YYYYMMDD-HHMMSS.patch`（補丁）
4. 若超過 5 筆，自動清理最舊的一對檔案

---

## 七、 指令集擴充歷史記錄

> 依時間順序排列，最早的在前。

*   **2026-06-26 (初版)**：
    *   確立全對話指令協議，完全免除本機 Python 腳本依賴。
    *   新增 @stages 階段查詢指令。
    *   新增 @[階段] 查詢時自動動態解析 YAML Frontmatter 中的 description 欄位以輸出富資訊清單。
    *   新增 + 加號創合導入與融合機制。
    *   新增加號創合導入防呆提醒與校對邏輯。
    *   新增 @init 執行後自動啟動各開發階段的 Skill 配置引導對話。
    *   新增自然語言與語音語意喚起 commands_reference.md 對照表機制。

*   **2026-06-26 (快捷與分雤符簡化改版)**：
    *   將 Skill 導入方式全面改為「雙位數快簡編號」對照。
    *   將多 Skill 聯合導入的分雤連接符號由加號 + 改為逗號 , 。
    *   調整防呆提醒機制，新增對完整 Skill 名稱的友好簍錯提醒。

*   **2026-06-27 (Baseline 自動驗證強化)**：
    *   @baseline 建立完成後自動執行基緑可執行性驗證，run.bat 語法、Python 匯入、HTTP 啟動測試、模板完整性）。

*   **2026-06-27 (@help 指令新增)**：
    *   新增 @help 指令，快速顯示指令集參照表。

*   **2026-06-27 (框架優化指令新增)**：
    *   新增 @optimize 指令，觸發 Harness_Optimization_SKILL.md 地櫿c式全案關聯檢查與修復。

*   **2026-06-28 (@CheckSpec 四規格完整性檢查)**：
    *   新增 @CheckSpec 指令，檢查四種規格的完整性與交叉一致性。
    *   強化 check_spec_integrity.py：新增 Gherkin 語法檢查、SRS 參照檢查、四規格交叉一致性檢查。
    *   新增模式 S（@CheckSpec 四規格），支援中英文 Gherkin 關鍵字。

*   **2026-06-28 (@security-load 弹性導入)**：
    *   新增 @security-load 指令，支援中途選定等級與特定構面導入安全防護。

*   **2026-06-28 (資安防護基準整合)**：
    *   新增 @security-check 指令，支援 general/medium/high 三等級資安檢核。
    *   @init 流程擴充：加入「是否導入資安防護基準」討問步驟。
    *   整合 Security-Principles Skill，涵該數位發展部資通安全署 7 構面 80 項控制措施。

*   **2026-07-01 (@io 階段IO 檔案體系)**：
    *   新增 7 份 io_files.yaml（Phase 00~06），定義各階段的 inputs/outputs IO 檔案。
    *   新增 @io show/set/diff 三個子指令與 @io 勾稽檢查指令。
    *   新增 in: / out: 快速定義語法（? 可選符號）。

*   **2026-07-08 (@external-resource 外部資源管理工作流程)**：
    *   新增 @external-resource add/remove/list 指令體系，支援外部第三方 Skill 的引入、移除與列表查詢。

*   **2026-07-08 (指令集全面重排)**：
    *   口語指令區依功能分為 7 組。
    *   核心指令對照表 27 筆 A-Z 排序。
    *   新增 SSDLC 階段代碼參照對照表。

*   **2026-07-09 (@CheckSpec 增量檢查 + check_spec_integrity 五項優化)**：
    *   @CheckSpec 新增 --req REQ-NNN 參數，支援鑲導單一需求做增量四向交叉檢查。
    *   check_spec_integrity.py 五項優化：動態需求數量、修復建議提示、Scenario 結構檢查、標題關鍵字比對、增量檢查模式。

*   **2026-07-09 (@import-skill 外部 Skill 匯入體系)**：
    *   新增 @import-skill 指令，將 external-resources/ 中指定 Skill 匯入 skills/ 成為框架內建。
    *   新增 @import-skill-list 指令，掃描並列出尚未匯入的外部 Skill 清單。
    *   新增 @import-skill-remove 指令，將內建 Skill 退回外部資源池。

*   **2026-07-10 (@baseline/@snapshot 階段化參數 + @role 角色權限)**：
    *   @baseline 新增 --phase NN、--project、--latest 參數。
    *   @snapshot 新增 --phase NN、--latest、--project 參數。
    *   新增 @role 指令，控制 @optimize、@unlock 的角色權限（builder/developer）。
    *   @optimize 新增 --incremental 與 --files 參數。

*   **2026-07-11 (@backup/@restore 備份與回溯機制)**：
    *   新增 @backup 指令，手動建立框架核心檔案備份至 backups/（保留最近 5 份）。
    *   新增 @restore 指令，支援 latest/N/YYYYMMDD-HHMMSS 三種回溯方式。
    *   @optimize 執行時自動觸發備份。

*   **2026-07-11 (@guide 引導式協作系統)**：
    *   新增 @guide [phase] 指令，啟動 5 關卡引導式協作。
    *   新增 @guide off、@guide status、@guide next 三個子指令。
    *   引導啟動時自動整合 IO 管理，關卡 2/4 自動帶入預設值。
