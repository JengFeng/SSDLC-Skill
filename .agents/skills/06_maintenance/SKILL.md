---
name: 06_maintenance
description: 維護與營運階段，負責線上運行日誌收集與分析、錯誤原因萃取、系統硬體與效能監控、程式執行軌跡追蹤、熱修補（Hotfix）程式編寫及回歸測試。
---

# 維護與營運階段技能規範 (06_maintenance)

本技能定義了開發團隊在維護與營運階段的標準作業程序（SOP）與代理職責。

> ⚠️ **最高指導框架原則**：本規範受 [CORE_RULES.md](../../../docs/CORE_RULES.md) 管轄，所有代理行為必須遵循 PDCA 閉環與錯誤分級重試機制。

## 一、 代理人職責規範

### 0. 安全防護整合（條件式）

> 本節僅在 `phase_gates.json` 中 `security_baseline.enabled` 為 `true` 時啟用。

*   **適用安全構面**：構面 2（事件日誌與可歸責性）、構面 3（營運持續計畫）、構面 7（系統與資訊完整性）
*   **對應參考文件**：`external-resources/Security-Principles/references/02_audit_logging.md`、`03_bcp.md`、`07_integrity.md`


### 1. Planner (規劃代理)
    1.  **Skill 上下文推薦**：分析維運需求與監控情境，主動向使用者推薦：
        - 需線上錯誤追蹤 → 推薦 `sentry`（即時錯誤監控與事件分析）
        - 系統性效能問題 → 推薦 `systematic-debugging`（根因分析與修復）
        - 使用者決定採用、跳過、或換其他 Skill。不可未確認即載入。
*   **任務**：
    1.  讀取儲存於 `inputs/` 下的線上異常或使用者修補需求 `BUG_*.md` 或 `REQ_*.md`。
    2.  規劃修補程式的影響範圍（Impact Analysis），制定回歸測試策略。
    3.  設定日誌收集範圍與監控指標（如 CPU、記憶體、回應時間、錯誤率）。
    4.  **[條件式] 安全維護
*   **[條件式] 安全回歸檢查**：若 `security_baseline.enabled` 為 `true`，每次維護變更後強制執行：
    1. 重新執行對應等級的 `@security-check`，比對歷史分數，若下降超過 10% → B 類錯誤。
    2. 重新執行 `scripts/security/run_security_scan.py`（SAST + 依賴掃描），新發現的 HIGH 問題 → A 類錯誤。
    3. 產出安全趨勢報告（`outputs/security_trend.md`），記錄每次檢查的分數變化。規劃**：若 `security_baseline.enabled` 為 `true`，讀取構面 2/3/7 控制措施，規劃：日誌審查排程、NTP 校時驗證、日誌完整性雜湊檢查、漏洞修補排程（Critical 7天/High 30天）、定期備份還原測試、備援切換演練。
*   **驗收標準**：分析計畫中必須明確指出本次修補可能會影響的既有功能清單、監控指標閾值，並要求 Evaluator 對其進行加強測試。

### 2. Generator (執行代理)
*   **核心鐵律**：**只執行、不判斷、不檢查、不修改**。
*   **任務**：
    1.  啟用並設定線上運行日誌集中收集與快速檢索分析機制。
    2.  設定系統硬體與效能指標監控（APM），包含分布式調用鏈追蹤與即時視覺化告警。
    3.  設定雜亂日誌的正則篩選與清理格式化規則。
    4.  編寫安全性漏洞修補、修復 Bug（Hotfix）。
    5.  同步更新 `traceability_matrix.md` 及 `system_specification.md`。
    6.  產出修補日誌與異動明細 `outputs/patch_changelog.md`。
    7.  **[條件式] 安全維護
*   **[條件式] 安全回歸檢查**：若 `security_baseline.enabled` 為 `true`，每次維護變更後強制執行：
    1. 重新執行對應等級的 `@security-check`，比對歷史分數，若下降超過 10% → B 類錯誤。
    2. 重新執行 `scripts/security/run_security_scan.py`（SAST + 依賴掃描），新發現的 HIGH 問題 → A 類錯誤。
    3. 產出安全趨勢報告（`outputs/security_trend.md`），記錄每次檢查的分數變化。執行**：若 `security_baseline.enabled` 為 `true`，執行：日誌完整性雜湊簽章、NTP 同步配置、漏洞自動掃描與修補排程、備份還原測試、WAF 規則更新，產出 `outputs/security_maintenance_report.md`。
    7.  完成後儲存執行快照至根目錄的 `snapshots/` 目錄。

### 3. Evaluator (審查代理)
*   **任務**：執行安全防線核對。
*   **審查重點**：
    *   **回歸測試完整性 (30%)**：執行完整的測試案例，確認修補後系統的既有功能皆未損壞。
    *   **監控有效性 (25%)**：確認日誌收集、APM 指標監控與告警機制正常運作。
    *   **錯誤萃取準確性 (25%)**：分析日誌與監控數據，萃取錯誤根本原因，產出故障分析報告 `outputs/incident_report.md`。
    *   **產出物驗證 (10%)**：核對 RTM，確保修補結果已更新至需求鏈條。
    *   **安全維護有效性 (10%)**（條件式）：若 `security_baseline.enabled` 為 `true`，確認日誌完整性保護、NTP 同步、漏洞修補時程合規、備份還原測試通過、WAF 規則有效。若未啟用則此項權重合併至產出物驗證。
*   **錯誤分類與重試**（依 CORE_RULES.md 規範）：
    *   **A 類錯誤**（日誌收集異常、監控指標中斷、API 逾時、環境暫態問題）：局部重試最多 3 次，僅退回 Generator。
    *   **B 類錯誤**（回歸測試失敗、修補引入新缺陷、需求鏈條斷裂、監控架構錯誤）：立即升級全域迭代，上限 2 輪。

---

## 二、 輸入與輸出規範

*   **輸入路徑 (`inputs/`)**：存放此階段由人類或監控系統登錄的 Bug 或新需求 `BUG_*.md` / `REQ_*.md`，以及 SSOT 規格（`specs/executable_spec.yaml`）。
*   **輸出路徑 (`outputs/`)**：
    *   `incident_report.md`：故障分析與根源報告。
    *   `patch_changelog.md`：修補日誌。
    *   `monitoring_dashboard.json`：監控儀表板指標配置。

*   **🔒 安全產出（條件式）**：若 `security_baseline.enabled` 為 `true`，額外產出：
    *   `outputs/security_trend.md` — 安全趨勢報告（歷次 @security-check 分數變化圖）
    *   `outputs/vulnerability_advisory.md` — 漏洞通報與修補記錄（CVE ID、影響評估、修補狀態）

> 📋 **IO 檔案管理（選擇性功能）**：
> 若使用者已透過以下任一方式啟用 IO 檔案合約管理：
> ① `@init` 時同意啟用 ② `@io set [phase]` ③ `@[phase] in:/out:` 快速定義語法，
> 則
> 本階段的 inputs/outputs 定義將由 `io_files.yaml` 取代上述預設值，
> Planner / Generator / Evaluator 須遵循
> [00_cross_phase/SKILL.md 第六節](../00_cross_phase/SKILL.md) 的合約管理規範。
> 若未啟用，本段不適用，照上述預設值執行。

