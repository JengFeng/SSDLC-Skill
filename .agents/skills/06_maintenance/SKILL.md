---
name: 06_maintenance
description: 維護與監控階段，負責線上故障分析、編寫熱修補（Hotfix）程式，並執行回歸測試以確保系統穩定性。
---

# 維護與監控階段技能規範 (06_maintenance)

本技能定義了開發團隊在維護與監控階段的標準作業程序（SOP）與代理職責。

## 一、 代理人職責規範

### 1. Planner (規劃代理)
*   **任務**：
    1.  讀取儲存於 `inputs/` 下的線上異常或使用者修補需求 `BUG_*.md` 或 `REQ_*.md`。
    2.  規劃修補程式的影響範圍（Impact Analysis），制定回歸測試策略。
*   **驗收標準**：分析計畫中必須明確指出本次修補可能會影響的既有功能清單，並要求 Evaluator 對其進行加強測試。

### 2. Generator (執行代理)
*   **任務**：
    1.  編寫安全性漏洞修補、修復 Bug。
    2.  同步更新 `traceability_matrix.md` 及 `system_specification.md`。
    3.  產出修補日誌與異動明細 `outputs/patch_changelog.md`。

### 3. Evaluator (審查代理)
*   **任務**：執行安全防線核對。
*   **審查重點**：
    *   **回歸測試 (Regression Testing)**：執行完整的 `behave` 測試案例，確認修補後系統的既有功能皆未損壞（維持綠燈）。
    *   **產出物驗證**：產出故障分析報告 `outputs/incident_report.md`，並核對 RTM，確保修補結果已更新至需求鏈條。

---

## 二、 輸入與輸出規範

*   **輸入路徑 (`inputs/`)**：存放此階段由人類或監控系統登錄的 Bug 或新需求 `BUG_*.md` / `REQ_*.md`。
*   **輸出路徑 (`outputs/`)**：
    *   `incident_report.md`：故障分析與根源報告。
    *   `patch_changelog.md`：修補日誌。
