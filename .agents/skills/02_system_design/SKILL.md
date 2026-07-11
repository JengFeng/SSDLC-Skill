---
name: 02_system_design
description: 系統設計階段，負責承接正規化需求並產出七項標準設計交付物：DB Schema、ER 圖、API 規格、UI 雛型、使用案例圖、活動圖、時序圖（Mermaid 格式優先，瀏覽器可直接渲染）。
---

# 系統設計階段技能規範 (02_system_design)

本技能定義了開發團隊在系統設計階段的標準作業程序（SOP）與代理職責。

> ⚠️ **最高指導框架原則**：本規範受 [CORE_RULES.md](../../../docs/CORE_RULES.md) 管轄，所有代理行為必須遵循 PDCA 閉環與錯誤分級重試機制。

## 一、 代理人職責規範

### 0. 安全防護整合（條件式）

> 本節僅在 `phase_gates.json` 中 `security_baseline.enabled` 為 `true` 時啟用。
> 若未啟用，Planner/Generator/Evaluator 照原流程執行，不受影響。

*   **適用安全構面**：構面 1（存取控制）、構面 4（識別與鑑別）、構面 6（系統與通訊保護）
*   **對應參考文件**：`external-resources/Security-Principles/references/01_access_control.md`、`04_auth.md`、`06_comm_protection.md`


### 1. Planner (規劃代理)
*   **任務**：
    1.  讀取 01 階段輸出的 `outputs/formal_requirements.md` 與 `reg/requirement_tracker.md`，以及 SSOT 規格（`specs/executable_spec.yaml`、`specs/features/requirements.feature`），作為設計輸入。
    2.  根據需求規格規劃七項標準設計產出（DB Schema、ER 圖、API 規格、UI 雛型、3 UML 圖）。
    2.5. **🔍 系統類型判定（必須執行）**：Planner 必須根據 Phase 01 的 `outputs/formal_requirements.md` 分析系統類型，判定本專案屬於以下哪一類：
        - **前端型**：含使用者介面（網頁/App/桌面應用）→ `ui_prototype.html` 為**必填產出**
        - **純 API/後端型**：無前端介面，僅提供 API 服務 → `ui_prototype.html` 為**可選/跳過**
        - **混合型**：同時含前端與後端 → `ui_prototype.html` 為**必填產出**
        判定結果必須明確記錄於規劃清單中（`system_type: "frontend" | "backend" | "hybrid"`），供 Generator 與 Evaluator 參照。
        **⚠️ 若判定為前端型或混合型但 Planner 未選取任何 UI 設計 Skill**，AI 代理必須主動提醒：「本專案含前端介面，建議選取 `frontend-app-builder` 或其他 UI 設計 Skill。是否仍要跳過？」由使用者確認後方可繼續。
    3.  選定本階段適用的 Skill（資料庫設計、API 設計、UI 設計、UML 繪圖）。**UI 設計 Skill 推薦**：Planner 應分析對話上下文與需求規格，若專案涉及前端介面、網頁、或使用者互動，**主動向使用者推薦**載入 `frontend-app-builder` Skill（產出高品質、現代化介面雛型：漸層背景、動畫、SVG 圖示、Google Fonts、RWD）。使用者可決定採用、跳過、或選用其他 UI Skill。若專案為純 API/後端則不推薦。
    4.  **[條件式] 安全設計規劃**：若 `security_baseline.enabled` 為 `true`，讀取構面 1/4/6 控制措施，規劃 RBAC 角色矩陣、認證流程、加密架構（TLS/憑證/資料加密），納入設計簡報。
    4.  定義各設計產出的格式標準（Mermaid .md 優先，可保留 .puml 原始檔）。
*   **驗收標準**：設計規劃清單中必須明確指定七項產出的負責 Skill、輸出格式、以及產出間的相互引用關係。

### 2. Generator (執行代理)

*   **多 Skill 聯合產出規則**：當 Planner 階段同時選取了 mermaid 與 plantuml 兩種繪圖 Skill 時，Generator 必須同時產出兩種格式的圖表，不得擇一輸出。各圖表格式優先級如下：

| 圖表 | 預設格式 | 選取 plantuml 時追加 | 選取 mermaid 時追加 |
|:---|:---|:---|:---|
| ER 圖 | Mermaid (erDiagram) | PlantUML 版本 | —（已是 Mermaid） |
| 用例圖 | Mermaid (flowchart) | PlantUML 版本 | —（已是 Mermaid） |
| 活動圖 | Mermaid (flowchart) | PlantUML 版本 | —（已是 Mermaid） |
| 時序圖 | Mermaid (sequenceDiagram) | PlantUML 版本 | —（已是 Mermaid） |
| 部署圖 | PlantUML (deployment) | —（已是 PlantUML） | Mermaid 版本 |

    *   **Mermaid 格式優先**：Markdown 原生支援，瀏覽器可直接渲染，為預設輸出格式。
    *   **PlantUML 補充**：若選取 plantuml Skill，則所有圖表產出 Mermaid 版本的同時，額外產出對應 `.puml` 檔。
    *   **強制雙產出**：若 Planner 階段已選取兩種繪圖 Skill，Generator 不得自行判斷「哪種格式較好」而只產出一種。
*   **核心鐵律**：**只執行、不判斷、不檢查、不修改**。
*   **任務**：
    1.  產出資料庫結構定義 `outputs/db_schema.sql`（含所有 Table、欄位型別、PK、FK、索引）。
    2.  產出實體關聯圖 `outputs/er_diagram.md`（Mermaid erDiagram 語法，欄位與 db_schema.sql 一致）。
    3.  產出 API 規格文件 `outputs/api_spec.md`（含端點、Method、參數、回應格式）。
    4.  產出互動式 UI 雛型 `outputs/ui_prototype.html`（**依 Planner 系統類型判定**）：

    **UI 雛形需求覆蓋強制檢查清單**：
    Generator 在產出 `ui_prototype.html` 之前，必須逐項比對 `outputs/formal_requirements.md` 中的所有功能需求（FR/NFR），確認以下類別畫面全部存在於雛形中：

| 需求類別 | 必須包含的畫面/元件 | 檢查 |
|:---|:---|:---:|
| 資料主檔 CRUD | 列表頁 + 新增表單 + 編輯表單 + 唯讀檢視頁 + 刪除確認 | ☐ |
| 業務流程/狀態異動 | 異動歷程列表 + 狀態變更/審核 Modal（若需求規格有此類需求） | ☐ |
| 關聯子表管理 | 一對多子表列表 + 新增/編輯 Modal + 附件上傳區（若需求規格有此類需求） | ☐ |
| 角色權限控制 | 多角色 Sidebar/欄位可見性差異，雛形需可切換展示（若需求規格有此類需求） | ☐ |
| 報表與數據分析 | 報表篩選控制項 + 統計圖表（依需求規格定義之報表類型） | ☐ |
| 資料匯出/匯入 | 匯出/匯入頁面，含篩選條件與格式選擇（若需求規格有此類需求） | ☐ |
| 認證與登入 | 登入頁面（依需求規格定義之認證方式，如 SSO/MFA/本機帳密） | ☐ |
| 稽核與操作記錄 | 稽核日誌查詢頁面，含篩選與異動前後內容顯示（若需求規格有此類需求） | ☐ |
    **⚠️ 以上清單全部勾選後方可提交 Evaluator。任一未勾選者，視為 Generator 未完成執行。**
    5.  產出三份 UML 圖（Mermaid 格式優先）：
        - `outputs/use_case_diagram.md`：使用案例圖
        - `outputs/activity_diagram.md`：活動圖
        - `outputs/sequence_diagram.md`：時序圖
    5.1. **[條件式] PlantUML 開放格式產出**：若 Planner 階段已選取 `plantuml` Skill，額外產出：
        - `outputs/er_diagram.puml`：ER 圖 PlantUML 版本
        - `outputs/use_case_diagram.puml`：使用案例圖 PlantUML 版本
        - `outputs/activity_diagram.puml`：活動圖 PlantUML 版本
        - `outputs/sequence_diagram.puml`：時序圖 PlantUML 版本
    5.2. **[條件式] Excel 資料庫結構產出**：若 Planner 階段已選取 `xlsx` Skill，額外產出：
        - `outputs/db_schema.xlsx`：Excel 多 Sheet 資料庫結構檔（詳見下方格式規範）
    5.3. **⚠️ 選用格式提醒**：若 Planner 階段**未選取** `plantuml` Skill 但使用者期望 `.puml` 輸出，或**未選取** `xlsx` Skill 但使用者期望 `.xlsx` 輸出，Generator 必須主動提醒：「當前階段未選取 plantuml/xlsx Skill，需回到 Planner 重新選取後方可產出對應格式。是否繼續以預設格式產出？」
    5.4. **⚠️ UI 雛型判定提醒**：Generator 執行前必須檢查 Planner 的系統類型判定。若判定為「前端型」或「混合型」但未產出 `ui_prototype.html`，或判定為「純 API/後端型」但使用者仍要求 UI 雛型，Generator 必須主動提醒並確認後再執行。

    **📊 `db_schema.xlsx` 格式規範**：
    
    | Sheet | 名稱 | 欄位 |
    |:---|:---|:---|
    | Sheet 1 | `📋 資料表總覽` | 資料表名稱、中文說明、預估筆數、關聯表 |
    | Sheet 2+ | `[各資料表名稱]` | 欄位名稱、資料型態、長度、允許 NULL、PK、FK 參照、預設值、欄位說明 |
    
    *   **表頭列**：凍結窗格、粗體、灰底
    *   **PK 欄位**：🔑 標記於欄位名稱前
    *   **FK 欄位**：🔗 標記並加註參照表（如 `departments.dept_id`）
    *   **NULL 欄**：✅ 允許 / ❌ 不允許
    *   **每個 Sheet**：自動調整欄寬
    

    6.  完成後儲存執行快照至根目錄的 `snapshots/` 目錄。
    7.  **[條件式] 安全設計產出**：若 `security_baseline.enabled` 為 `true`，額外產出：`outputs/rbac_matrix.md`（角色權限矩陣）、`outputs/auth_flow.md`（認證流程圖）、`outputs/crypto_architecture.md`（加密架構圖）。

### 3. Evaluator (審查代理)
*   **任務**：進行設計完整性審查與跨產出交叉驗證。
*   **審查重點**：
    *   **七項產出完整性 (25%)**：確認七項標準產出皆已生成且格式正確（依 Planner 系統類型判定：前端/混合型須含 ui_prototype.html，純 API/後端型可跳過）（Mermaid 語法可渲染、HTML 可獨立開啟）。
    *   **條件式產出完整性 (10%)**：若 Planner 已選取 `plantuml` Skill，確認 4 份 `.puml` 圖表皆已生成且語法有效；若 Planner 已選取 `xlsx` Skill，確認 `db_schema.xlsx` 已生成且 Sheet 結構符合格式規範。未選取對應 Skill 則此項自動跳過。
    *   **需求追溯一致性 (20%)**：確認所有設計產出均可追溯至 `reg/requirement_tracker.md` 的需求編號，無遺漏或贅餘設計。
    *   **跨產出欄位一致性 (20%)**：確認 `er_diagram.md` 的 Entity/欄位與 `db_schema.sql` 一致、`api_spec.md` 的端點與 `sequence_diagram.md` 的互動流程一致。
    *   **格式與可讀性 (15%)**：確認 Mermaid 圖可直接在瀏覽器渲染、PlantUML .puml 語法有效（若有選取）、SQL 語法正確、HTML 雛型可互動操作、Excel xlsx Sheet 結構完整（若有選取）。
    *   **安全設計完整性 (20%)（條件式）：若 `security_baseline.enabled` 為 `true`，確認 RBAC 矩陣、認證流程、加密架構齊全。若未啟用則此項權重歸還：七項產出 30% + 追溯 25% + 一致性 25% + 格式 20%。
    *   **UI 需求覆蓋稽核**：Evaluator 必須打開 `outputs/ui_prototype.html`，搜尋以下關鍵 id/class，確認對應畫面存在：
        - `tab-login` 或 `login-page`（登入頁）
        - `tab-profile`（ESS 自助頁）
        - `tab-view-employee`（唯讀檢視頁）
        - `modalAddHistory` / `modalAddEducation` / `modalAddExperience` / `modalAddCert`（新增表單 Modal）
        - 檔案上傳 `<input type="file">` 元件
        - 報表篩選 `<select>` 下拉元件
    若任一缺失，判定為 B 類錯誤，退回 Generator 補齊。

*   **錯誤分類與重試**（依 CORE_RULES.md 規範）：
    *   **A 類錯誤**（個別產出格式錯誤、Mermaid 語法問題、SQL 語法錯誤）：局部重試最多 3 次，僅退回 Generator。
    *   **B 類錯誤**（設計與需求矛盾、跨產出欄位不一致、需求追溯斷鏈）：立即升級全域迭代，上限 2 輪。

---

## 二、 輸入與輸出規範

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

> 📋 **IO 檔案管理（選擇性功能）**：
> 若使用者已透過以下任一方式啟用 IO 檔案合約管理：
> ① `@init` 時同意啟用 ② `@io set [phase]` ③ `@[phase] in:/out:` 快速定義語法，
> 則
> 本階段的 inputs/outputs 定義將由 `io_files.yaml` 取代上述預設值，
> Planner / Generator / Evaluator 須遵循
> [00_cross_phase/SKILL.md 第六節](../00_cross_phase/SKILL.md) 的合約管理規範。
> 若未啟用，本段不適用，照上述預設值執行。

