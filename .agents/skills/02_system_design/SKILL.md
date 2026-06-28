---
name: 02_system_design
description: 系統設計階段，負責承接正規化需求並產出七項標準設計交付物：DB Schema、ER 圖、API 規格、UI 雛型、使用案例圖、活動圖、時序圖（Mermaid 格式優先，瀏覽器可直接渲染）。
---

# 系統設計階段技能規範 (02_system_design)

本技能定義了開發團隊在系統設計階段的標準作業程序（SOP）與代理職責。

> ⚠️ **最高指導框架原則**：本規範受 [CORE_RULES.md](file:///d:/00AI協作/SSDLC_Skill/docs/CORE_RULES.md) 管轄，所有代理行為必須遵循 PDCA 閉環與錯誤分級重試機制。

## 一、 代理人職責規範

### 0. 安全防護整合（條件式）

> 本節僅在 `phase_gates.json` 中 `security_baseline.enabled` 為 `true` 時啟用。
> 若未啟用，Planner/Generator/Evaluator 照原流程執行，不受影響。

*   **適用安全構面**：構面 1（存取控制）、構面 4（識別與鑑別）、構面 6（系統與通訊保護）
*   **對應參考文件**：`external-resources/Security-Principles/references/01_access_control.md`、`04_auth.md`、`06_comm_protection.md`


### 1. Planner (規劃代理)
*   **任務**：
    1.  讀取 01 階段輸出的 `outputs/formal_requirements.md` 與 `reg/requirement_tracker.md`，作為設計輸入。
    2.  根據需求規格規劃七項標準設計產出（DB Schema、ER 圖、API 規格、UI 雛型、3 UML 圖）。
    3.  選定本階段適用的 Skill（資料庫設計、API 設計、UI 設計、UML 繪圖）。**UI 設計 Skill 推薦**：Planner 應分析對話上下文與需求規格，若專案涉及前端介面、網頁、或使用者互動，**主動向使用者推薦**載入 `frontend-app-builder` Skill（產出高品質、現代化介面雛型：漸層背景、動畫、SVG 圖示、Google Fonts、RWD）。使用者可決定採用、跳過、或選用其他 UI Skill。若專案為純 API/後端則不推薦。
    4.  **[條件式] 安全設計規劃**：若 `security_baseline.enabled` 為 `true`，讀取構面 1/4/6 控制措施，規劃 RBAC 角色矩陣、認證流程、加密架構（TLS/憑證/資料加密），納入設計簡報。
    4.  定義各設計產出的格式標準（Mermaid .md 優先，可保留 .puml 原始檔）。
*   **驗收標準**：設計規劃清單中必須明確指定七項產出的負責 Skill、輸出格式、以及產出間的相互引用關係。

### 2. Generator (執行代理)
*   **核心鐵律**：**只執行、不判斷、不檢查、不修改**。
*   **任務**：
    1.  產出資料庫結構定義 `outputs/db_schema.sql`（含所有 Table、欄位型別、PK、FK、索引）。
    2.  產出實體關聯圖 `outputs/er_diagram.md`（Mermaid erDiagram 語法，欄位與 db_schema.sql 一致）。
    3.  產出 API 規格文件 `outputs/api_spec.md`（含端點、Method、參數、回應格式）。
    4.  產出互動式 UI 雛型 `outputs/ui_prototype.html`：若 Planner 階段已選用 `frontend-app-builder` Skill，依其設計規範產出高品質頁面（CSS 變數、漸層背景、動畫、SVG 圖示、Google Fonts、RWD），可獨立開啟。若未選用則以基礎 HTML/CSS 產出。
    5.  產出三份 UML 圖（Mermaid 格式優先）：
        - `outputs/use_case_diagram.md`：使用案例圖
        - `outputs/activity_diagram.md`：活動圖
        - `outputs/sequence_diagram.md`：時序圖
    6.  完成後儲存執行快照至根目錄的 `snapshots/` 目錄。
    7.  **[條件式] 安全設計產出**：若 `security_baseline.enabled` 為 `true`，額外產出：`outputs/rbac_matrix.md`（角色權限矩陣）、`outputs/auth_flow.md`（認證流程圖）、`outputs/crypto_architecture.md`（加密架構圖）。

### 3. Evaluator (審查代理)
*   **任務**：進行設計完整性審查與跨產出交叉驗證。
*   **審查重點**：
    *   **七項產出完整性 (25%)**：確認七項標準產出皆已生成且格式正確（Mermaid 語法可渲染、HTML 可獨立開啟）。
    *   **需求追溯一致性 (20%)**：確認所有設計產出均可追溯至 `reg/requirement_tracker.md` 的需求編號，無遺漏或贅餘設計。
    *   **跨產出欄位一致性 (20%)**：確認 `er_diagram.md` 的 Entity/欄位與 `db_schema.sql` 一致、`api_spec.md` 的端點與 `sequence_diagram.md` 的互動流程一致。
    *   **格式與可讀性 (15%)**：確認 Mermaid 圖可直接在瀏覽器渲染、SQL 語法正確、HTML 雛型可互動操作。
    *   **安全設計完整性 (20%)（條件式）：若 `security_baseline.enabled` 為 `true`，確認 RBAC 矩陣、認證流程、加密架構齊全。若未啟用則此項權重歸還：七項產出 30% + 追溯 25% + 一致性 25% + 格式 20%。
*   **錯誤分類與重試**（依 CORE_RULES.md 規範）：
    *   **A 類錯誤**（個別產出格式錯誤、Mermaid 語法問題、SQL 語法錯誤）：局部重試最多 3 次，僅退回 Generator。
    *   **B 類錯誤**（設計與需求矛盾、跨產出欄位不一致、需求追溯斷鏈）：立即升級全域迭代，上限 2 輪。

---

## 二、 輸入與輸出規範

*   **輸入路徑 (`inputs/`)**：承接 01 階段 outputs（`formal_requirements.md`、`requirement_tracker.md`）。
*   **輸出路徑 (`outputs/`)**：
    | 產出 | 檔案 | 格式 |
    |:---|:---|:---|
    | 資料庫結構 | `db_schema.sql` | SQL DDL |
    | 實體關聯圖 | `er_diagram.md` | Mermaid erDiagram |
    | API 規格 | `api_spec.md` | Markdown |
    | UI 雛型 | `ui_prototype.html` | HTML（若選用 frontend-app-builder 則為高品質設計，否則基礎 HTML/CSS） |
    | 使用案例圖 | `use_case_diagram.md` | Mermaid graph |
    | 活動圖 | `activity_diagram.md` | Mermaid flowchart |
    | 時序圖 | `sequence_diagram.md` | Mermaid sequenceDiagram |

*   **🔒 安全產出（條件式）**：若 `security_baseline.enabled` 為 `true`，額外產出：
    *   `outputs/threat_model.md` — 威脅模型（STRIDE 分析、攻擊樹、信任邊界圖）
