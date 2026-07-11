---
name: 04_testing
description: 測試驗證階段，負責雙軌測試執行（pytest API 測試 + Playwright UI 測試）、Bug 追蹤與分類、測試覆蓋率報告產出，以及回歸測試策略制定。
---

# 測試驗證階段技能規範 (04_testing)

本技能定義了開發團隊在測試驗證階段的標準作業程序（SOP）與代理職責。

> ⚠️ **最高指導框架原則**：本規範受 [CORE_RULES.md](../../../docs/CORE_RULES.md) 管轄，所有代理行為必須遵循 PDCA 閉環與錯誤分級重試機制。

## 一、 代理人職責規範

### 0. 安全防護整合（條件式）

> 本節僅在 `phase_gates.json` 中 `security_baseline.enabled` 為 `true` 時啟用。

*   **適用安全構面**：構面 5（系統與服務獲得—測試階段）、構面 7（系統與資訊完整性）
*   **對應參考文件**：`external-resources/Security-Principles/references/05_acquisition.md`、`07_integrity.md`


### 1. Planner (規劃代理)
*   **任務**：
    1.  讀取 03 階段輸出的原始碼與單元測試結果 `outputs/unit_test_results.xml`，以及 SSOT 規格（`specs/executable_spec.yaml`、`specs/features/requirements.feature`），作為測試輸入。
    2.  根據 `reg/requirement_tracker.md` 的需求追溯鏈，規劃雙軌測試範圍（API 端點覆蓋 + UI 互動覆蓋）。
    3.  **Skill 上下文推薦**：分析專案類型與測試需求，主動向使用者推薦：
    - 有前端/瀏覽器 UI → 推薦 `Playwright`（預錄腳本自動化測試，高覆蓋率）
    - 純 API/後端 → 推薦 `pytest`（API 端點測試）
    - 遇到 Bug/測試失敗 → 推薦 `systematic-debugging`（系統性除錯）
    - 欲採用測試先行 → 推薦 `test-driven-development`（TDD 紅綠重構循環）
    - 使用者決定採用、跳過、或換其他 Skill。不可未確認即載入。
    4.  **[條件式] 安全測試規劃**：若 `security_baseline.enabled` 為 `true`，讀取構面 5/7 控制措施，選定 SAST 工具（如 Bandit/SonarQube）、弱點掃描工具、滲透測試範圍，納入測試計畫。
    4.  定義測試通過標準（HTTP 狀態碼、回應內容驗證、UI 元素可見性、互動行為正確性）。
*   **驗收標準**：測試計畫中必須明確定義每個 REQ ID 對應的測試案例、預期結果、以及失敗時的 Bug 登錄流程。

### 2. Generator (執行代理)
*   **核心鐵律**：**只執行、不判斷、不檢查、不修改**。
*   **任務**：
    1.  執行 pytest API 功能測試：對所有 API 端點進行請求/回應驗證（狀態碼、回應結構、資料正確性）。
    2.  執行 Playwright 瀏覽器 UI 互動測試：模擬使用者操作流程（表單填寫、按鈕點擊、頁面跳轉）。
    3.  將測試過程中的所有異常與失敗案例記錄為 Bug，登錄至 `bug/bug_tracker.md`（Bug ID、日期、嚴重度、描述、重現步驟）。
    4.  產出雙套測試腳本：`outputs/test_api.py`（pytest）與 `outputs/test_ui.py`（Playwright）。
    5.  完成後儲存執行快照至根目錄的 `snapshots/` 目錄。
    6.  **[條件式] 安全測試執行**：若 `security_baseline.enabled` 為 `true`，執行 SAST 原始碼安全檢測、弱點掃描、OWASP Top 10 漏洞驗證，產出 `outputs/security_test_report.md`。
    7.  **🔄 測試報告自動同步（強制）**：每次 pytest 或 Playwright 執行完成後，必須自動解析測試輸出，將通過/失敗/跳過統計、修復歷程與執行日期更新至 `outputs/test_results.md`。若報告日期早於測試腳本最後修改日期，Evaluator 應判定為報告過期（B 類錯誤）。
    8.  **📦 一鍵測試執行檔產出（強制）**：每次 Generator 執行完成後，必須自動產生 `outputs/run_tests.bat`，讓非開發人員可雙擊執行完整雙軌測試。標準行為：自動啟動 Flask → 執行 pytest API 測試 → 執行 Playwright UI 測試 → 清理 Flask 程序 → 開啟 `test_results.md`。編碼必須為 UTF-8 BOM，首行含 `chcp 65001`，`cd /d "%~dp0"` 指向自身目錄。

### 3. Evaluator (審查代理)
*   **任務**：進行測試結果審查、Bug 分類與回歸測試策略制定。
*   **審查重點**：
    *   **需求測試覆蓋率 (30%)**：確認 `reg/requirement_tracker.md` 中每條需求皆有對應的測試案例，無未測試的需求。
    *   **雙軌測試通過率 (25%)**：確認 pytest 與 Playwright 測試全數通過（或失敗案例已正確登錄為 Bug）。
    *   **Bug 追蹤完整性 (20%)**：確認 `bug/bug_tracker.md` 中所有失敗案例皆有 Bug ID、嚴重度分類、重現步驟、根因分析。
    *   **回歸測試策略 (10%)**：針對修復後的 Bug 制定回歸測試範圍，確保修復不引入新缺陷。
    *   **安全測試通過率 (15%)（條件式）：若 `security_baseline.enabled` 為 `true`，確認 SAST/弱點掃描無 Critical/High 風險。若未啟用則此項權重歸還：需求覆蓋 35% + 雙軌 30% + 回歸 15%。
*   **錯誤分類與重試**（依 CORE_RULES.md 規範）：
    *   **A 類錯誤**（測試環境問題、API 逾時、DOM 元素暫態不可見、網路連線中斷）：局部重試最多 3 次，僅退回 Generator。
    *   **B 類錯誤**（功能缺陷、需求未實作、API 回應結構錯誤、UI 行為不符規格）：登錄為 Bug 後立即升級全域迭代，上限 2 輪。

---

## 二、 輸入與輸出規範

*   **輸入路徑 (`inputs/`)**：承接 03 階段 outputs（原始碼、`unit_test_results.xml`、`task_list.json`），以及 SSOT 規格（`specs/executable_spec.yaml`、`specs/features/requirements.feature`）。
*   **輸出路徑 (`outputs/`)**：
    *   `test_api.py`：pytest API 功能測試腳本。
    *   `test_ui.py`：Playwright 瀏覽器 UI 測試腳本。
    *   `test_results.md`：雙套測試結果報告（含通過/失敗統計、覆蓋率）。
    *   `run_tests.bat`：一鍵雙軌測試執行檔（雙擊即可自動啟動 Flask → 跑 pytest → 跑 Playwright → 清理 → 開啟報告），供非開發人員進行人工 review。
    *   `run_app.bat`：一鍵啟動主程式執行檔（雙擊即可自動啟動 Flask → 開啟瀏覽器 → 登入頁面），供人工 reviewer 直接操作驗證系統功能。
*   **Bug 追蹤 (`bug/`)**：
    *   `bug_tracker.md`：統一缺陷追蹤表（Bug ID | 發現日期 | 嚴重度 | 描述 | 重現步驟 | 根因 | 修復方案 | 狀態 | 修復日期）。

> 📋 **IO 檔案管理（選擇性功能）**：
> 若使用者已透過以下任一方式啟用 IO 檔案合約管理：
> ① `@init` 時同意啟用 ② `@io set [phase]` ③ `@[phase] in:/out:` 快速定義語法，
> 則
> 本階段的 inputs/outputs 定義將由 `io_files.yaml` 取代上述預設值，
> Planner / Generator / Evaluator 須遵循
> [00_cross_phase/SKILL.md 第六節](../00_cross_phase/SKILL.md) 的合約管理規範。
> 若未啟用，本段不適用，照上述預設值執行。

## 三、 Bug 追蹤規範

所有測試缺陷統一記錄於 `bug/bug_tracker.md` 單一表格，不另建獨立 .md 檔案。
| 欄位 | 說明 |
|:---|:---|
| Bug ID | 唯一缺陷編號（格式：BUG_001, BUG_002...） |
| 發現日期 | YYYY-MM-DD |
| 嚴重度 | Critical / Major / Minor / Trivial |
| 描述 | 一句話描述缺陷現象 |
| 重現步驟 | 可重現的操作步驟 |
| 根因 | 缺陷的根本原因分析 |
| 修復方案 | 修復程式碼的簡要說明 |
| 狀態 | ✅ 已修復 / 🔄 處理中 / ⏳ 待處理 / ❌ 不予修復 |

*   **🔒 安全產出（條件式）**：若 `security_baseline.enabled` 為 `true`，額外產出：
    *   `outputs/dast_report.md` — DAST 動態測試報告（HTTP Headers + OWASP ZAP 結果摘要）
    *   `outputs/zap_report.html` — OWASP ZAP 完整掃描報告（若 ZAP 可用）

