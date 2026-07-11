---
name: 03_implementation_and_coding
description: 開發與編碼階段，負責將設計規格拆解為微小任務，進行 AI 輔助程式碼實作、代碼規範檢查、自動格式化、單元測試撰寫以及跨模組依賴整合管理。
---

# 開發與編碼階段技能規範 (03_implementation_and_coding)

本技能定義了開發團隊在開發與編碼階段的標準作業程序（SOP）與代理職責。

> ⚠️ **最高指導框架原則**：本規範受 [CORE_RULES.md](../../../docs/CORE_RULES.md) 管轄，所有代理行為必須遵循 PDCA 閉環與錯誤分級重試機制。

## 一、 代理人職責規範

### 0. 安全防護整合（條件式）

> 本節僅在 `phase_gates.json` 中 `security_baseline.enabled` 為 `true` 時啟用。

*   **適用安全構面**：構面 1（存取控制）、構面 2（事件日誌）、構面 4（識別與鑑別）、構面 5（系統與服務獲得）、構面 6（系統與通訊保護）
*   **對應參考文件**：`external-resources/Security-Principles/references/01_access_control.md`、`02_audit_logging.md`、`04_auth.md`、`05_acquisition.md`、`06_comm_protection.md`


### 1. Planner (規劃代理)
*   **任務**：
    1.  讀取設計階段產出的 `api_spec.md`、`db_schema.sql` 與 `ui_prototype.html`。
    2.  將開發工作拆解為微小的代碼實作任務。
    3.  分析跨模組依賴關係，標註任務間的相依性與整合順序。
    4.  **Skill 上下文推薦**：分析技術棧與設計規格，主動向使用者推薦：
    - React/Next.js 專案 → 推薦 `react-best-practices`（效能最佳化）
    - 使用 shadcn/ui 組件 → 推薦 `shadcn`（組件管理與樣式）
    - Postgres/Supabase 資料庫 → 推薦 `supabase-postgres-best-practices`（查詢最佳化）
    - Stripe 金流整合 → 推薦 `stripe-best-practices`（API 選擇與安全）
    - 使用者決定採用、跳過、或換其他 Skill。不可未確認即載入。
    - 另選定本階段適用的程式碼規範檢查工具（Linter）與自動格式化工具（Formatter）。
    5.  **[條件式] 安全編碼規劃**：若 `security_baseline.enabled` 為 `true`，讀取構面 1/2/4/5/6 控制措施，選定安全編碼規範（OWASP Top 10 防範、輸入驗證、帳號鎖定、日誌框架、HTTPS 強制），納入任務清單 `task_list.json` 的安全需求欄位。
    5.  產出任務清單 `outputs/task_list.json`。
*   **驗收標準**：任務清單中必須明確定義每一項任務的單元測試通過標準（如 Assert 條件）、相依模組清單，以及設定的 Linter/Formatter 規則。

### 2. Generator (執行代理)
*   **核心鐵律**：**只執行、不判斷、不檢查、不修改**。
*   **任務**：
    1.  嚴格依照 `outputs/task_list.json` 的任務項目進行代碼撰寫，優先採用 AI 輔助寫碼與代碼補全以提升效率。
    2.  **UI 設計對齊（關鍵）**：讀取 Phase 02 產出的 `ui_prototype.html`，將其中的 **CSS 設計系統**（變數、顏色、字體、圓角、陰影、動畫）、**佈局結構**（導覽列、統計卡片、表格、表單）以及 **互動設計**（Toast、Modal、搜尋）**完整複製**到實作模板中。所有 Jinja2 模板（base/index/form）必須與 UI 雛型的外觀保持一致，包含但不限於：
        - CSS 自訂屬性（`:root` 變數）
        - 漸層背景與色彩主題
        - Google Fonts 字體（Inter + Noto Sans TC）
        - RWD 響應式斷點
        - SVG 圖示與互動動畫
    3.  維持「最小變更原則」，絕不修改無關的模組。 (執行代理)
*   **核心鐵律**：**只執行、不判斷、不檢查、不修改**。
*   **任務**：
    1.  嚴格依照 `outputs/task_list.json` 的任務項目進行代碼撰寫，優先採用 AI 輔助寫碼與代碼補全以提升效率。
    2.  維持「最小變更原則」，絕不修改無關的模組。
    3.  執行靜態代碼語法與邏輯缺陷檢核（Linter），確保代碼符合規範。
    4.  執行程式風格美化（Formatter），維持代碼排版一致性。
    5.  處理跨模組依賴關係的整合建置，確保各模組介面正確對接。
    6.  編寫對應的單元測試程式碼。
    7.  完成後執行編譯檢查，確認無語法錯誤。
    8.  完成後儲存執行快照至根目錄的 `snapshots/` 目錄。
    9.  **[條件式] 安全實作**：若 `security_baseline.enabled` 為 `true`，實作以下安全控制：帳號鎖定機制（5次/15分）、日誌記錄（含使用者ID+IP+事件類型）、輸入驗證（SQL Injection/XSS防範）、HTTPS 強制導向、密碼雜湊儲存（bcrypt/Argon2）、RBAC 權限檢查。
    10. **[條件式] 自動 SAST 掃描**：若 security_baseline.enabled 為 	rue，程式碼產生後自動執行 python scripts/security/run_security_scan.py <target_dir>。若 bandit 回報 HIGH 或 MEDIUM 等級問題 → A 類錯誤（退回 Generator 修復，最多 3 次）。若 pip-audit 發現已知漏洞相依套件 → B 類錯誤（升級全域迭代）。

### 3. Evaluator (審查代理)
*   **任務**：進行代碼評審（Code Review）與測試執行。
*   **審查重點**：
    *   **規格符合度 (35%)**：確認程式碼完全按照 `task_list.json` 實作。
    *   **代碼品質與規範 (25%)**：確認通過 Linter 檢查無警告、Formatter 已正確執行、無 Dead Code、邏輯清晰易讀。
    *   **測試涵蓋率 (20%)**：單元測試必須覆蓋所有關鍵業務邏輯分支，並產出 JUnit 格式的測試結果 `outputs/unit_test_results.xml`。
    *   **安全與錯誤處理 (20%)**：確認輸入值有進行安全檢驗、有完整的 Exception Handling、跨模組介面無資安漏洞。**[條件式]** 若 `security_baseline.enabled` 為 `true`，額外檢查：帳號鎖定機制、日誌完整性（人事時地物）、密碼雜湊儲存、HTTPS 實作、RBAC 權限檢查，不符合者判定為 B 類錯誤。
*   **UI 設計一致性檢查（新增）**：比對 Phase 02 `ui_prototype.html` 與實作模板（base/index/form.html），檢查以下項目：
    *   CSS 設計系統是否一致（變數名稱、顏色值、字體、間距）
    *   佈局結構是否對應（導覽列、統計卡片、表格樣式、表單 Grid）
    *   互動組件是否完整（Toast 通知、Modal 確認、搜尋過濾）
    *   若 CSS 設計系統與 UI 雛型偏差超過 30%，判定為 **A 類錯誤**，退回 Generator 重新對齊（最多 3 次）

*   **安全關卡檢查**：若 `security_baseline.enabled` 為 `true` 且安全評分未達 `phase_gates.json` 中 `min_security_score`（預設 70%），則不論其他評分項目結果如何，判定為 **B 類錯誤**，強制退回 Generator 重新實作。安全評分來自：帳號鎖定 ✅/❌、日誌完整性 ✅/❌、密碼雜湊 ✅/❌、HTTPS ✅/❌、RBAC ✅/❌、輸入驗證 ✅/❌（每項 1 分，需達 min_security_score%）。
*   **錯誤分類與重試**（依 CORE_RULES.md 規範）：

    *   **A 類錯誤**（編譯錯誤、Linter 警告、單元測試失敗、跨模組介面接合異常）：局部重試最多 3 次，僅退回 Generator。
    *   **B 類錯誤**（架構設計缺陷、模組間介面不相容、需求與設計矛盾）：立即升級全域迭代，上限 2 輪。

---

## 二、 輸入與輸出規範

*   **輸入路徑 (`inputs/`)**：
    *   承接 Phase 02 設計產出：`api_spec.md`、`db_schema.sql`、`ui_prototype.html`（CSS 設計系統與佈局範本）及 SSOT 規格（`specs/executable_spec.yaml`）
    *   存放此階段發現的 Bug 回饋檔案 `BUG_*.md`。
*   **輸出路徑 (`outputs/`)**：
    *   `task_list.json`：實作任務清單（含模組相依性標註）。
    *   `unit_test_results.xml`：單元測試執行結果報告。
    *   `lint_report.txt`：Linter 代碼規範檢查報告。

*   **🔒 安全產出（條件式）**：若 `security_baseline.enabled` 為 `true`，額外產出：
    *   `outputs/security_check_report.md` — Phase 3 資安防護基準檢核報告（@security-check 產出）
    *   `outputs/security_scan_report.json` — SAST + 依賴掃描報告（run_security_scan.py 產出）

> 📋 **IO 檔案管理（選擇性功能）**：
> 若使用者已透過以下任一方式啟用 IO 檔案合約管理：
> ① `@init` 時同意啟用 ② `@io set [phase]` ③ `@[phase] in:/out:` 快速定義語法，
> 則
> 本階段的 inputs/outputs 定義將由 `io_files.yaml` 取代上述預設值，
> Planner / Generator / Evaluator 須遵循
> [00_cross_phase/SKILL.md 第六節](../00_cross_phase/SKILL.md) 的合約管理規範。
> 若未啟用，本段不適用，照上述預設值執行。

