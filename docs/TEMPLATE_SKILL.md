# AI 協作專案範本規格書 (TEMPLATE_SKILL.md)


> 👉 **最高指導框架原則**：本範本規格書受 [CORE_RULES.md](CORE_RULES.md) 管轄，所有目錄結構與配置定義皆不得與其衝突。

本文件定義了符合 SSDLC 軟體工程與 Harness Engineering 規範的標準專案範本結構。未來的 AI 協作代理或治具系統應直接讀取本範本，並依據使用需求建立標準專案目錄。

## 一、 標準專案目錄結構

```text
[PROJECT_ROOT]/
│
├── .agents/                                    # 專案客製化規則與配置目錄
│   └── AGENTS.md                               # 專案規章守則
│
├── .vscode/                                    # IDE 整合設定
│   └── tasks.json                              # VS Code 自動化防線工作設定檔
│
├── docs/                                       # 專案核心說明文件區
│   ├── CORE_RULES.md                           # 最高指導框架原則
│   ├── TEMPLATE_SKILL.md                       # 專案範本規格書
│   ├── commands_reference.md                   # 指令集參照表
│   └── Harness_Optimization_SKILL.md           # 專案框架優化技能 (口語或指令觸發地毯式檢查優化)
│
├── specs/                                      # 可執行規格目錄（YAML SSOT 母版 + Gherkin .feature）
│   ├── README.md                               # 雙格式架構說明
│   ├── executable_spec.yaml                    # YAML 可執行規格母版（唯一資料源 - SSOT）
│   └── features/                               # Gherkin .feature BDD 可執行規格
│       └── .gitkeep
│
├── baseline/                                   # 全域組態基準存放區（全域 Baseline 保留最近 5 份；階段 Baseline (baseline/phase-{NN}/baseline-v{N}/) 為可選功能）
│   └── .gitkeep
│
├── snapshots/                                  # 全域執行快照備份區 (保留最近 5 筆)
│   └── .gitkeep
│
├── logs/                                       # 全域日誌區（conversation_*.md 對話紀錄 + ai_adjustment_*.md AI 調整紀錄 + iteration_log.md 迭代日誌 + 應用程式日誌）
│   ├── .gitkeep
│   └── iteration_log.md                        # 迭代日誌（Generator/Evaluator 完成後自動寫入）
│
├── phase_gates.json                            # 階段關卡管控檔案（記錄各階段完成狀態、Baseline 參照、切換權限）
│
│
├── 00_cross_phase/                            # 跨階段全域共用 Skill 存放區
│   ├── SKILL.md                                # 跨階段 Skill 整合定義
│   ├── inputs/                                 # 跨階段需求與配置輸入區
│   │   └── .gitkeep
│   └── outputs/                                # 跨階段產出與報告輸出區
│       └── .gitkeep
│
├── 01_planning_and_analysis/                   # 第一階段：規劃與需求分析
│   ├── SKILL.md                                # 階段自定義與整合技能定義
│   ├── inputs/                                 # 原始需求輸入區（使用者口述、訪談紀錄等）
│   │   └── .gitkeep
│   ├── reg/                                    # 需求歷程記錄區（統一 traceability_matrix.md 表格 + grill-me 對話記錄）
│   │   └── .gitkeep
│   └── outputs/                                # AI 萃取與正規化規格輸出區（🔒 安全啟用時追加：security_requirements.md）
│       └── .gitkeep
│
├── 02_system_design/                           # 第二階段：系統設計
│   ├── SKILL.md                                # 系統設計階段技能定義
│   ├── inputs/                                 # 設計輸入區（承接 01 階段 outputs 正規化規格）
│   │   └── .gitkeep
│   └── outputs/                                # 設計模型與可執行規格輸出區（標準七項產出；🔒 安全啟用時追加：threat_model.md）
│       └── .gitkeep
│
├── 03_implementation_and_coding/               # 第三階段：開發與編碼
│   ├── SKILL.md                                # 開發階段技能定義
│   ├── inputs/                                 # 開發輸入區（承接 02 階段 outputs 設計規格）
│   │   └── .gitkeep
│   └── outputs/                                # 實作任務清單與單元測試輸出區（🔒 安全啟用時追加：security_check_report.md、security_scan_report.json）
│       └── .gitkeep
│
├── 04_testing/                                 # 第四階段：測試驗證
│   ├── SKILL.md                                # 測試階段技能定義
│   ├── inputs/                                 # 測試輸入區（承接 03 階段 outputs 原始碼）
│   │   └── .gitkeep
│   ├── bug/                                    # bug 歷程記錄區（統一 bug_tracker.md 表格，以 ID/日期/嚴重度/根因/修復/狀態追蹤）
│   │   └── .gitkeep
│   └── outputs/                                # 測試報告輸出區（標準產出：pytest API 測試腳本、Playwright UI 測試腳本、測試結果報告；🔒 安全啟用時追加：dast_report.md、zap_report.html）
│       └── .gitkeep
│
├── 05_deployment/                              # 第五階段：部署發布
│   ├── SKILL.md                                # 部署階段技能定義
│   ├── inputs/                                 # 部署輸入區（承接 04 階段 outputs 測試報告與驗證碼）
│   │   └── .gitkeep
│   └── outputs/                                # 建置產物清單與簽章報告輸出區（🔒 安全啟用時追加：sbom.json、.env.example、security_deployment_checklist.md）
│       └── .gitkeep
│
├── 06_maintenance/                             # 第六階段：維護與營運
│   ├── SKILL.md                                # 維護階段技能定義
│   ├── inputs/                                 # 維護輸入區（承接 05 階段 outputs 部署配置）
│   │   └── .gitkeep
│   └── outputs/                                # 故障分析與修補日誌輸出區（🔒 安全啟用時追加：security_trend.md、vulnerability_advisory.md）
│       └── .gitkeep
│
├── traceability_matrix.md                      # 全域需求追溯矩陣 (RTM) — 根目錄直觀查閱
├── system_specification.md                    # 系統功能規格書 SRS（六章完整結構，可交付甲方）
├── AGENTS.md                                   # 根目錄規則引導檔 (指向 .agents/AGENTS.md)
├── memory.md                                   # 專案腦力激盪與歷程紀錄檔
```



### 目錄結構組態說明與防線註釋

1.  **最高指導守則**：docs/CORE_RULES.md 為全案的框架原則。所有規章文件的頂部皆有關聯宣告指向本文件。
2.  **AGENTS.md 規章鏈**：根目錄 AGENTS.md → .agents/AGENTS.md → docs/CORE_RULES.md，形成三層規章鏈。
3.  **階段間交付物傳遞鏈（Stage Handoff Chain）**：各階段的 inputs/ 必須包含承接自上一階段 outputs/ 的交付物摘要記錄。傳遞順序為：
    *   **01 outputs（正規化規格）→ 02 inputs（設計輸入）**
    *   **02 outputs（設計規格）→ 03 inputs（開發輸入）**
    *   **03 outputs（原始碼）→ 04 inputs（測試輸入）**
    *   **04 outputs（測試報告）→ 05 inputs（部署輸入）**
    *   **05 outputs（部署配置）→ 06 inputs（維護輸入）**
    *   每個 inputs/ 目錄下的 brief 檔案必須明確引用上游 outputs/ 的具體檔案路徑，確保追溯鏈不中斷。
4.  **Harness_Optimization_SKILL.md**：口語觸發地毯式檢查時執行全專案框架優化。
5.  **全域 snapshots/ 與 logs/**：存放於根目錄層級。
   * **snapshots/**：每次執行 `@baseline` 或階段完成後自動產生快照，格式為一對檔案：
     - `snapshot_YYYYMMDD-HHMMSS.md`：快照索引，含 Git HEAD、完整檔案清單與 SHA-256 雜湊值、執行階段上下文
     - `diff_YYYYMMDD-HHMMSS.patch`：與 Git HEAD 的差異補丁（`git diff HEAD`），用於快速回溯
   * **回溯機制**：發現執行問題時，AI 代理可讀取最新快照的檔案清單與 SHA-256，比對當前狀態後載入差異補丁還原工作目錄，不需重跑整個 Plan。
   * **保留規則**：snapshots/ 僅保留最近 5 筆快照配對，第 6 筆產生時自動清理最舊的一對。
   * **logs/**：各階段錯誤日誌、版本差異與對話紀錄統一輸出至此。
6.  **baseline/**：全域 Git tag 基準存放區，保留最近 5 筆穩定版本。
7.  **reg/**：存放於  1_planning_and_analysis/ 下，為腦力激盪與口述需求的歷史記錄區。
8.  **bug/**：存放於  4_testing/ 下，為測試缺陷歷史記錄區（重現步驟、修復歷程）。
9.  **🔒 安全產出物**：若 `security_baseline.enabled` 為 `true`，各階段 outputs/ 需額外產出安全相關文件（標註 🔒 者）。詳見各階段 SKILL.md 輸出路徑規範。`n9.  **00_cross_phase/**：跨階段全域共用 Skill，用於版本控制、多 Agent 協作與程式碼差異同步等通用任務。
## 二、 核心檔案初始化範本 (Core File Templates)

### 1. 需求追溯矩陣範本 (`traceability_matrix.md`)
```markdown
# 需求追溯矩陣 (Requirements Traceability Matrix - RTM)

| 需求編號 | 原始輸入來源 | 規格定義 (01) | 系統設計 (02) | 開發實作 (03) | 測試案例 (04) | 當前狀態 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `REQ_001` | REQ_example.md | `requirements.yaml` §1.1 | `openapi.yaml`<br>`db_schema.sql` | `src/` 實作代碼 | `system_spec.feature` | `[初始化]` |
```

### 2. 活的系統規格說明書範本 (`system_specification.md`)
```markdown
# 系統功能規格說明書 (Living Documentation)

## 【第一部分：人類閱讀區】
### 一、 系統功能清單 (Feature List)
| 功能編號 | 模組名稱 | 功能說明 | 當前狀態 |
| :--- | :--- | :--- | :--- |
| `FEAT_001` | 範功能模組 | 描述此模組提供之功能。 | `[初始化]` |

### 二、 功能細項說明
#### 1. 範功能模組 (`FEAT_001`)
*   **功能描述**：高階描述。
*   **業務邏輯與約束**：
    *   業務規則項目一。

## 【第二部分：機器執行區】
### [狀態：初始化] 可執行規格：FEAT_001_正常流程
```gherkin
# language: zh-TW
功能: 範功能模組
  場景: 正常流程
    假設 條件
    當 動作
    那麼 結果
```
```

### 3. 專案規則引導檔範本 (`AGENTS.md`)
```markdown
# 專案開發規則與防線規範 (AGENTS.md)

👉 **最高指導框架原則**：本專案在自動化開發與 Harness 駕馭工程中的最高原則規範，已統一收錄於 docs 目錄下的 [CORE_RULES.md](CORE_RULES.md)。本文件（AGENTS.md）內的所有子規章與實作內容，皆基於此指導守則進行發展，且絕不得與其衝突。

本專案的全局連貫性大循環、組態管理、測試同步與開發階段 Skill 配置規範，已統一收錄於專案規章中：

👉 **請讀取詳細規章**：[.agents/AGENTS.md](../.agents/AGENTS.md)

所有 AI 代理與治具系統，執行任務前必須強制讀取上述路徑之規章，並嚴格遵循「對話指令協議」來執行專案初始化、查詢與 Skill 導入。
```

---

## 三、 AI 協作對話與執行協議 (AI Collaboration Protocol)

AI 協作代理在處理新專案或新需求時，必須嚴格遵循以下對話、執行與驗證協議，以確保開發流程符合最高指導框架原則（`docs/CORE_RULES.md`）與專案開發紀律。

### 1. 需求收集與追溯協議 (Requirements & Traceability)
*   **步驟一：對話引導與需求收集**
    AI 必須引導使用者提供原始需求，並將其整理為 `01_planning_and_analysis/inputs/REQ_YYYYMMDD_HHMMSS.md`，其格式必須符合以下 Entity 結構：
    *   **提出者 (Reporter)**：使用者名稱 / 時間
    *   **實體與屬性 (Entity & Attributes)**：該需求涉及的資料主體與欄位說明。
    *   **業務規則與約束 (Business Rules)**：具體邏輯。
*   **步驟二：註冊需求追溯**
    新需求確立後，AI 必須在根目錄的 `traceability_matrix.md` 中註冊新需求編號（如 `REQ_001`），並在系統設計與實作完成後，將對應的變更與測試狀態寫回 `system_specification.md`。

### 2. 階段 PDCA 執行與結果上傳協議 (PDCA & Data Sync)
在各個 SSDLC 階段執行任務時，AI 必須在該階段目錄下遵循 Plan → Generator → Evaluator 的 PDCA 閉環：
*   **Plan 階段 (PDCA-P)**：承接上階段交付物與 Baseline，確認目標，執行 Skill 複選，並進行環境與部署衝突檢核。
*   **Generator 階段 (PDCA-D)**：作為唯一執行層，嚴格遵守「只執行、不判斷、不檢查、不修改」之鐵律。完成後儲存本機絕對路徑之快照至根目錄的 `snapshots/` 目錄。
*   **Evaluator 階段 (PDCA-C & PDCA-A)**：執行成果驗證與流程完整性雙層 Check。
*   **結果自動上傳**：每一輪局部 PDCA 完成後，該階段之完整檢核結果（包含配置參數、執行快照、錯誤日誌、版本差異、對話紀錄與驗證報告等，存放在根目錄的 `snapshots/` 與 `logs/` 目錄）必須自動上傳並同步更新至全域主控 Agent，全域 Agent 將同步更新需求追溯鏈、規格文件、對話紀錄與新版 Baseline 穩定版本（存放於根目錄的 `baseline/`），以利其封存 Baseline 版本並維持全域需求追溯。

### 3. 錯誤二分類與分級重試協議 (Error Handling & Retry)
在 Evaluator 階段若發現異常，AI 必須遵循以下防線規則進行處理：
*   **A 類錯誤（執行層臨時錯誤）**：
    *   包括參數錯誤、環境超時、DOM 找不到元素、執行短暫衝突、網路中斷、權限異常等。
    *   **處置協議**：允許局部重試最多 3 次（回溯點僅退回 Generator，不重跑 Plan）。新錯誤重置計數器。滿 3 次失敗則升級為 B 類錯誤處理。
*   **B 類錯誤（規劃層根源錯誤）**：
    *   包括 Skill 互斥、需求矛盾、設計缺陷、架構問題等。
    *   **處置協議**：直接跳過局部重試，立即升級全域迭代（重跑該階段完整 PDCA）。全域自動迭代上限為 2 輪，滿 2 輪仍失敗則自動暫停並移交人工處理。

### 5. 專案記憶記錄協議 (memory.md)
*   **強制記錄**：AI 代理在專案開發過程中，必須即時將以下事件寫入根目錄 `memory.md`：
    *   每次對話 session 的開始與結束時間（含討論主題摘要、關鍵決策、產出檔案清單）
    *   每個 `@` 指令的執行（@init、@[階段]、@baseline 等）
    *   每個階段的開始與完成，含產出檔案清單
    *   每項關鍵技術決策（技術棧選擇、架構決策、規則變更）
    *   每個 Bug 的發現與修復
    *   當前進度與下一步建議
*   **記錄粒度**：每次有意義的對話段落結束時必須寫入一筆記錄，單一 session 可含多筆記錄。不可只在 session 完全結束時才補寫。
*   **接續機制**：若對話中斷，下一 session 的 AI 代理必須先完整讀取 `memory.md`，以還原專案狀態後繼續作業。
*   **格式**：Markdown，含專案概覽、對話歷程（時間戳）、關鍵決策、當前狀態、Git 版本歷程五節。
*   **@optimize 自動檢查**：`Harness_Optimization_SKILL.md` Group 4 將檢查 `memory.md` 最後記錄時間戳是否在本次 session 期間，若無則自動補寫本次會話記錄。



### 4.5 上下文感知 Skill 推薦協議 (Context-Aware Skill Recommendation)

> **設計原則**：Skill 不應強制綁定。AI 代理根據對話上下文**主動推薦**，由使用者決定。

*   **觸發情境對照**：
    | 關鍵詞 | 推薦 Skill | 說明 |
    |:---|:---|:---|
    | UI/前端/網頁/畫面/登入頁 | `frontend-app-builder` | 高品質現代化 UI（漸層/動畫/SVG/RWD） |
    | 圖表/資料視覺化/儀表板 | `build-web-data-visualization` | 圖表選擇與設計 |
    | 安全/資安/弱點/滲透 | Security-Principles | 資安防護基準檢核 |
*   **推薦流程**：AI 分析上下文 → 1-2 句簡述推薦原因 → 使用者（採用/跳過/換其他）→ 不可未確認即載入

### 4. AI 代理對話指令協議 (AI Conversation Protocol)
AI 代理在與使用者對話時，必須主動識別並代為執行以下對話指令：
*   **`@stages`**：輸出正名對正後的 SSDLC 六階段與 `00_cross_phase` 全域共用技能分類清單。
*   **`@[階段雙位數代碼]`** (如 `@01`)：掃描可用 Skill，動態解析其 `SKILL.md` 中的 `description` 欄位並分配雙位數快捷編號（由 `01` 開始）進行列表呈現。
*   **`@[階段雙位數代碼]/[快捷編號]`** 或 **`@[階段雙位數代碼]/[編號1],[編號2]`**：
    1.  自動呼叫 Git 建立暫存 Git tag Baseline，確保安全網。
    2.  將快捷編號還原為實體 Skill 資料夾名稱，將檔案部署至目標目錄。
    3.  將各 Skill 的 instructions 與規範動態合併追加至該階段目錄下的 `SKILL.md` 中。
    4.  在 `traceability_matrix.md` 中一次性登錄此批導入。
*   **`@init [相對路徑]`**：建立完整的 SSDLC 目錄結構與檔案，建立完畢後必須自動續接啟動 01 到 06 階段的 Skill 配置引導流，協助使用者選取 Skill。

### 5. 自然語言與語音喚出協議 (Natural Language Trigger)
*   當 AI 代理識別到類似的口語或語音輸入時，必須主動執行對應動作：
    1.  當識別到類似「讀取指令集」、「查詢可用指令」、「我想看指令參照表」或「叫出指令對照表」等語音或口語輸入時，必須自動使用檔案讀取工具，在對話中呈現 [commands_reference.md](commands_reference.md) 的完整內容。
    2.  當識別到類似「幫我執行駕馭工程框架優化檢查」、「Harness Optimization Skill」、「執行架構優化」或「進行全案關聯性檢查」等語意時，必須自動讀取並執行 docs 目錄下的 [Harness_Optimization_SKILL.md](Harness_Optimization_SKILL.md) 內容，對專案的各核心檔案之關聯與排版進行地毯式優化。



