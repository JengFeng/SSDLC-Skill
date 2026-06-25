# AI 協作專案範本規格書 (template_skill.md)

本文件定義了符合 SSDLC 軟體工程與 Harness Engineering 規範的標準專案範本結構。未來的 AI 協作代理或治具系統應直接讀取本範本，依據使用者選定的技能（Skill）與對話輸入，自動初始化專案目錄與對應的交付檔案。

---

## 一、 標準專案目錄結構範本 (Standard Directory Template)

任何新專案初始化時，皆須建立以下目錄結構與基本組態：

```text
[PROJECT_ROOT]/
│
├── .agents/                                    # 專案客製化規則與配置目錄
│   └── AGENTS.md                               # 專案規章守則 (全局連貫性大循環、組態管理與測試同步)
│
├── .vscode/                                    # IDE 整合設定
│   └── tasks.json                              # VS Code 自動化防線工作設定檔
│
├── 01_planning_and_analysis/                   # 規劃與需求分析階段
│   ├── SKILL.md                                # 階段自定義與整合技能定義
│   ├── inputs/                                 # 人類原始需求輸入區
│   │   └── .gitkeep
│   └── outputs/                                # AI 萃取與正規化規格輸出區
│       └── .gitkeep
│
├── 02_system_design/                           # 系統設計階段
│   ├── SKILL.md                                # 系統設計階段技能定義
│   ├── inputs/                                 # 設計變更與限制輸入區
│   │   └── .gitkeep
│   └── outputs/                                # 設計模型與可執行規格輸出區
│       └── .gitkeep
│
├── 03_implementation_and_coding/               # 開發編碼階段
│   ├── SKILL.md                                # 開發階段技能定義
│   ├── inputs/                                 # 實作 Bug 與回饋輸入區
│   │   └── .gitkeep
│   └── outputs/                                # 實作任務清單與單元測試輸出區
│       └── .gitkeep
│
├── 04_testing/                                 # 測試驗證階段
│   ├── SKILL.md                                # 測試階段技能定義
│   ├── inputs/                                 # 測試不通過與 Bug 紀錄區
│   │   └── .gitkeep
│   └── outputs/                                # 圖表化與機讀版測試報告輸出區
│       └── .gitkeep
│
├── 05_deployment/                              # 部署發布階段
│   ├── SKILL.md                                # 部署階段技能定義
│   ├── inputs/                                 # 環境配置與金鑰輸入區
│   │   └── .gitkeep
│   └── outputs/                                # 建置產物清單與簽章報告輸出區
│       └── .gitkeep
│
├── 06_maintenance/                             # 維護監控階段
│   ├── SKILL.md                                # 維護階段技能定義
│   ├── inputs/                                 # 線上異常與修補需求輸入區
│   │   └── .gitkeep
│   └── outputs/                                # 故障分析與修補日誌輸出區
│       └── .gitkeep
│
├── AGENTS.md                                   # 根目錄規則引導檔 (指向 .agents/AGENTS.md)
├── memory.md                                   # 專案腦力激盪與歷程紀錄檔
├── traceability_matrix.md                      # 根目錄全域需求追溯矩陣 (RTM)
└── system_specification.md                     # 根目錄活的系統規格說明書 (含 Gherkin 規格)
```

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

本專案的全局連貫性大循環、組態管理、測試同步與開發階段 Skill 配置規範，已統一收錄於專案規章中：

👉 **請讀取詳細規章**：[.agents/AGENTS.md](file:///.agents/AGENTS.md)

所有 AI 代理與治具系統，執行任務前必須強制讀取上述路徑之規章，確保遵循專案開發紀律。
```

---

## 三、 AI 協作對話與執行協議 (AI Collaboration Protocol)

未來的 AI 協作代理在處理新專案或新需求時，必須遵循以下對話與產出流程：

### 步驟一：對話引導與需求收集
AI 必須引導使用者以口述或文字提供原始需求，並將其整理成 `inputs/REQ_YYYYMMDD_HHMMSS.md`，其格式必須符合以下 Entity 結構：
```markdown
# 原始需求記錄點 (REQ_[時間])
*   **提出者 (Reporter)**：使用者名稱 / 時間
*   **實體與屬性 (Entity & Attributes)**：該需求涉及的資料主體與欄位說明。
*   **業務規則與約束 (Business Rules)**：具體邏輯。
```

### 步驟二：載入階段技能與產出
當使用者指定特定技能（Skill）或進入特定開發階段時，AI 必須：
1.  **讀取 Skill 規範**：讀取對應階段的 `[階段]/SKILL.md`，明確 Planner、Generator、Evaluator 的職責與注意事項。
2.  **執行任務與產出**：依據日常循環 SOP，將產出檔案寫入對應階段的 `outputs/` 目錄中，嚴禁將檔案散落在規格外目錄。
3.  **註冊需求追溯**：將新功能手動寫入根目錄的 `traceability_matrix.md` 與 `system_specification.md`。
