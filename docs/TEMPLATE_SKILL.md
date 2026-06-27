# AI 協作專案範本規格書 (TEMPLATE_SKILL.md)

本文件定義了符合 SSDLC 軟體工程與 Harness Engineering 規範的標準專案範本結構。未來的 AI 協作代理或治具系統應直接讀取本範本，依據使用者選定的技能（Skill）與對話輸入，自動初始化專案目錄與對應的交付檔案。

---

## 一、 標準專案目錄結構範本 (Standard Directory Template)

任何新專案初始化時，皆須建立以下目錄結構與基本組態：

```text
[PROJECT_ROOT]/
│
├── .agents/                                    # 專案客製化規則與配置目錄
│   └── AGENTS.md                               # 專案規章守則 (頂部強制關聯 docs/CORE_RULES.md 指導守則，定義防線)
│
├── .vscode/                                    # IDE 整合設定
│   └── tasks.json                              # VS Code 自動化防線工作設定檔
│
├── baseline/                                   # 專案組態基準與本機快照備份存放區
│   └── .gitkeep
│
├── docs/                                       # 專案核心說明文件與問題記錄區
│   ├── bug/                                    # bug 歷程記錄存放資料夾
│   │   └── .gitkeep
│   ├── reg/                                    # 需�├── 02_system_design/                           # 第二階段：系統設計─ AGENTS.md                               # 專案規章守則 (頂部強制關聯 docs/CORE_RULES.md 指導守則，定義防線)
│
├── .vscode/                                    # IDE 整合設定
│   └── tasks.json                              # VS Code 自動化防線工作設定檔
│
├── baseline/                                   # 專案組態基準與本機快照備份存放區
│   └── .gitkeep
│
├── docs/                                       # 專案核心說明文件與問題記錄區
│   ├── bug/                                    # bug 歷程記錄存放資料夾
│   │   └── .gitkeep
│   ├── reg/                                    # 需求歷程記錄存放資料夾
│   │   └── .gitkeep
│   ├── CORE_RULES.md                           # 最高指導框架原則
│   ├── TEMPLATE_SKILL.md                       # 專案範本規格書
│   ├── commands_reference.md                   # 指令集參照表
│   └── Harness_Optimization_SKILL.md           # 專案框架優化技能 (口語或指令觸發地毯式檢查優化)
│
├── 01_planning_and_analysis/                   # 第一階段：規劃與需求分析
│   ├── SKILL.md                                # 階段自定義與整合技能定義
│   ├── inputs/                                 # 人類原始需求輸入區
│   │   └── .gitkeep
│   ├── outputs/                                # AI 萃取與正規化規格輸出區
│   │   └── .gitkeep
│   ├── snapshots/                              # 執行快照備份區 (保留最近 5 筆)
│   │   └── .gitkeep
│   └── logs/                                   # 錯誤日誌、對話紀錄與版本差異記錄區
│       └── .gitkeep
│
├── 02_system_design/                           # 第二階段：系統設計
│   ├── SKILL.md                                # 系統設計階段技能定義
│   ├── inputs/                                 # 設計變更與限制輸入區
│   │   └── .gitkeep
│   ├── outputs/                                # 設計模型與可執行規格輸出區
│   │   └── .gitkeep
│   ├── snapshots/                              # 執行快照備份區 (保留最近 5 筆)
│   │   └── .gitkeep
│   └── logs/                                   # 錯誤日誌、對話紀錄與版本差異記錄區
│       └── .gitkeep
│
├── 03_implementation_and_coding/               # 第三階段：開發與編碼
│   ├── SKILL.md                                # 開發階段技能定義
│   ├── inputs/                                 # 實作 Bug 與回饋輸入區
│   │   └── .gitkeep
│   ├── outputs/                                # 實作任務清單與單元測試輸出區
│   │   └── .gitkeep
│   ├── snapshots/                              # 執行快照備份區 (保留最近 5 筆)
│   │   └── .gitkeep
│   └── logs/                                   # 錯誤日誌、對話紀錄與版本差異記錄區
│       └── .gitkeep
│
├── 04_testing/                                 # 第四階段：測試驗證
│   ├── SKILL.md                                # 測試階段技能定義
│   ├── inputs/                                 # 測試不通過與 Bug 紀錄區
│   │   └── .gitkeep
│   ├── outputs/                                # 圖表化與機讀版測試報告輸出區
│   │   └── .gitkeep
│   ├── snapshots/                              # 執行快照備份區 (保留最近 5 筆)
│   │   └── .gitkeep
│   └── logs/                                   # 錯誤日誌、對話紀錄與版本差異記錄區
│       └── .gitkeep
│
├── 05_deployment/                              # 第五階段：部署發布
│   ├── SKILL.md                                # 部署階段技能定義
│   ├── inputs/                                 # 環境配置與金鑰輸入區
│   │   └── .gitkeep
│   ├── outputs/                                # 建置產物清單與簽章報告輸出區
│   │   └── .gitkeep
│   ├── snapshots/                              # 執行快照備份區 (保留最近 5 筆)
│   │   └── .gitkeep
│   └── logs/                                   # 錯誤日誌、對話紀錄與版本差異記錄區
│       └── .gitkeep
│
├── 06_maintenance/                             # 第六階段：維護監控
│   ├── SKILL.md                                # 維護階段技能定義
│   ├── inputs/                                 # 線上異常與修補需求輸入區
│   │   └── .gitkeep
│   ├── outputs/                                # 故障分析與修補日誌輸出區
│   │   └── .gitkeep
│   ├── snapshots/                              # 執行快照備份區 (保留最近 5 筆)
│   │   └── .gitkeep
│   └── logs/                                   # 錯誤日誌、對話紀錄與版本差異記錄區
│       └── .gitkeep
│
├── AGENTS.md                                   # 根目錄規則引導檔 (指向 .agents/AGENTS.md)
├── memory.md                                   # 專案腦力激盪與歷程紀錄檔
├── traceability_matrix.md                      # 根目錄全域需求追溯矩陣 (RTM)
└── system_specification.md                     # 根目錄活的系統規格說明書 (含 Gherkin 規格)
```

### 目錄結構組態說明與防線註釋

為了確保新專案在初始化後能具備完整的安全防線，其目錄結構與基本組態必須遵循以下關聯機制：

1. **最高指導框架原則 (`docs/CORE_RULES.md`)**：
   本專案的最高指導守則，定義了跨 SSDLC 階段的雙層解耦架構、PDCA 標準流程與部署環境適配通則。所有專案檔案、技能（Skill）與 AI 代理行為，皆必須以此守則為最高框架原則，絕不得與其衝突。

2. **專案規章守則 (`.agents/AGENTS.md`)**：
   此為專案的實體規章檔案。其頂部必須強制寫入相對路徑超連結以關聯 `docs/CORE_RULES.md` 指導守則，並詳細定義全局連貫性大循環、組態管理、測試同步、分級重試與對話指令協議。

3. **規則引導檔 (`[PROJECT_ROOT]/AGENTS.md`)**：
   置於專案根目錄下，用於引導 AI 代理與治具系統。其內容將直接指向實體規章 `.agents/AGENTS.md`，並明文要求執行任務前必須讀取規章，嚴格遵循最高指導框架原則與對話指令協議。

4. **專案框架優化技能 (`docs/Harness_Optimization_SKILL.md`)**：
   置於 docs 目錄下。當使用者口語化提及「幫我執行駕馭工程框架優化檢查」或「Harness Optimization Skill」時，AI 代理將會自動讀取此 Skill 檔案內容，以地毯式校對與優化專案框架之所有檔案關聯性、格式與排版，維護整個專案的安全防線。

5. **執行快照備份與日誌記錄目錄 (`0*_*/snapshots/` 與 `0*_*/logs/`)**：
   置於各階段目錄下。用於存放內層 PDCA 循環中 Generator 產出的執行快照（由 `snapshots/` 物理儲存，保留最近 5 筆並自動清理）以及 Evaluator 產出的錯誤日誌、版本差異、人機對話紀錄等（由 `logs/` 物理儲存），確保執行軌跡與最終交付物實體分離。

---


## 二、 核心檔案初始化範本 (Core File Templates)

### 1. 需求追溯矩陣範本 (`traceability_matrix.md`)
```markdown
# 需求追溯矩陣 (Requirements Traceability Matrix - RTM)

| 需求編號 | 原始輸入來源 | 規格定義 (01) | 系統設計 (02) | 開發實作 (03) | 測試案例 (04) | 當前狀態 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `REQ_001` | [REQ_example.md](file:///...) | `requirements.yaml` §1.1 | `openapi.yaml`<br>`db_schema.sql` | `src/` 實作代碼 | `system_spec.feature` | `[初始化]` |
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
### ### [狀態：初始化] 可執行規格：FEAT_001_正常流程
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

👉 **最高指導框架原則**：本專案在自動化開發與 Harness 駕馭工程中的最高原則規範，已統一收錄於 docs 目錄下的 [CORE_RULES.md](file:///d:/00AI協作/SSDLC_Skill/docs/CORE_RULES.md)。本文件（AGENTS.md）內的所有子規章與實作內容，皆基於此指導守則進行發展，且絕不得與其衝突。

本專案的全局連貫性大循環、組態管理、測試同步與開發階段 Skill 配置規範，已統一收錄於專案規章中：

👉 **請讀取詳細規章**：[.agents/AGENTS.md](file:///.agents/AGENTS.md)

所有 AI 代理與治具系統，執行任務前必須強制讀取上述路徑之規章，確保遵循專案開發紀律。
```

### 4. 專案規章守則範本 (`.agents/AGENTS.md`)
```markdown
# 專案開發規則與防線規範 (AGENTS.md)

👉 **最高指導框架原則**：本專案在自動化開發與 Harness 駕馭工程中的最高原則規範，已統一收錄於 docs 目錄下的 [CORE_RULES.md](file:///d:/00AI協作/SSDLC_Skill/docs/CORE_RULES.md)。本文件（AGENTS.md）內的所有子規章與實作內容，皆基於此指導守則進行發展，且絕不得與其衝突。

本文件定義了本專案在 SSDLC 開發生命週期中，各 AI 代理（Planner、Generator、Evaluator）必須嚴格遵守的全局行為準則，特別是「全局連貫性檢核與修正大工程」、「版本管控與組態管理」、「活系統規格書同步」以及「部署環境適配」的執行規範。
```

---

## 三、 AI 協作對話與執行協議 (AI Collaboration Protocol)

未來的 AI 協作代理在處理新專案或新需求時，必須嚴格遵循以下對話、執行與驗證協議，以確保開發流程符合最高指導框架原則（`docs/CORE_RULES.md`）與專案開發紀律。

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
*   **Generator 階段 (PDCA-D)**：作為唯一執行層，嚴格遵守「只執行、不判斷、不檢查、不修改」之鐵律。完成後儲存本機絕對路徑之快照至各該階段的 `snapshots/` 目錄。
*   **Evaluator 階段 (PDCA-C & PDCA-A)**：執行成果驗證與流程完整性雙層 Check。
*   **結果自動上傳**：每一輪局部 PDCA 完成後，該階段之完整檢核結果（包含配置參數、執行快照、錯誤日誌、版本差異、對話紀錄與驗證報告等，存放在 `snapshots/` 與 `logs/` 目錄）必須自動上傳並同步更新至全域主控 Agent，全域 Agent 將同步更新需求追溯鏈、規格文件、對話紀錄與新版 Baseline 穩定版本，以利其封存 Baseline 版本並維持全域需求追溯。

### 3. 錯誤二分類與分級重試協議 (Error Handling & Retry)
在 Evaluator 階段若發現異常，AI 必須遵循以下防線規則進行處理：
*   **A 類錯誤（執行層臨時錯誤）**：
    *   包括參數錯誤、環境超時、DOM 找不到元素、執行短暫衝突、網路中斷、權限異常等。
    *   **處置協議**：允許局部重試最多 3 次（回溯點僅退回 Generator，不重跑 Plan）。新錯誤重置計數器。滿 3 次失敗則升級為 B 類錯誤處理。
*   **B 類錯誤（規劃層根源錯誤）**：
    *   包括 Skill 互斥、需求矛盾、設計缺陷、架構問題等。
    *   **處置協議**：直接跳過局部重試，立即升級全域迭代（重跑該階段完整 PDCA）。全域自動迭代上限為 2 輪，滿 2 輪仍失敗則自動暫停並移交人工處理。

### 4. AI 代理對話指令協議 (AI Conversation Protocol)
AI 代理在與使用者對話時，必須主動識別並代為執行以下對話指令：
*   **`@stages`**：輸出正名對正後的 SSDLC 六階段與 `all_cross_phase` 全域共用技能分類清單。
*   **`@[階段雙位數代碼]`** (如 `@01`)：掃描可用 Skill，動態解析其 `SKILL.md` 中的 `description` 欄位並分配雙位數快捷編號（由 `01` 開始）進行列表呈現。
*   **`@[階段雙位數代碼]/[快捷編號]`** 或 **`@[階段雙位數代碼]/[編號1],[編號2]`**：
    1.  自動呼叫 Git 建立暫存 Git tag Baseline，確保安全網。
    2.  將快捷編號還原為實體 Skill 資料夾名稱，將檔案部署至目標目錄。
    3.  將各 Skill 的 instructions 與規範動態合併追加至該階段目錄下的 `SKILL.md` 中。
    4.  在 `traceability_matrix.md` 中一次性登錄此批導入。
*   **`@init [相對路徑]`**：建立完整的 SSDLC 目錄結構與檔案，建立完畢後必須自動續接啟動 01 到 06 階段的 Skill 配置引導流，協助使用者選取 Skill。

### 5. 自然語言與語音喚出協議 (Natural Language Trigger)
*   當 AI 代理識別到類似的口語或語音輸入時，必須主動執行對應動作：
    1.  當識別到類似「讀取指令集」、「查詢可用指令」、「我想看指令參照表」或「叫出指令對照表」等語音或口語輸入時，必須自動使用檔案讀取工具，在對話中呈現 [docs/commands_reference.md](file:///d:/00AI協作/SSDLC_Skill/docs/commands_reference.md) 的完整內容。
    2.  當識別到類似「幫我執行駕馭工程框架優化檢查」、「Harness Optimization Skill」、「執行架構優化」或「進行全案關聯性檢查」等語意時，必須自動讀取並執行 docs 目錄下的 [Harness_Optimization_SKILL.md](file:///d:/00AI協作/SSDLC_Skill/docs/Harness_Optimization_SKILL.md) 內容，對專案的各核心檔案之關聯與排版進行地毯式優化。
