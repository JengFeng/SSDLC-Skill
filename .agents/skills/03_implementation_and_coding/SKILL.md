---
name: 03_implementation_and_coding
description: 開發與編碼階段，負責將設計規格拆解為微小任務，並依據清單撰寫原始碼與單元測試。
---

# 開發與編碼階段技能規範 (03_implementation_and_coding)

本技能定義了開發團隊在開發與編碼階段的標準作業程序（SOP）與代理職責。

## 一、 代理人職責規範

### 1. Planner (規劃代理)
*   **任務**：
    1.  讀取設計階段產出的 `openapi.yaml`、`db_schema.sql` 與 `ui_model.json`。
    2.  將開發工作拆解為微小的代碼實作任務。
    3.  產出任務清單 `outputs/task_list.json`。
*   **驗收標準**：任務清單中必須明確定義每一項任務的單元測試通過標準（如 Assert 條件）。

### 2. Generator (執行代理)
*   **任務**：
    1.  嚴格依照 `outputs/task_list.json` 的任務項目進行代碼撰寫。
    2.  維持「最小變更原則」，絕不修改無關的模組。
    3.  編寫對應的單元測試程式碼。
    4.  完成後執行編譯檢查，確認無語法錯誤。

### 3. Evaluator (審查代理)
*   **任務**：進行代碼評審（Code Review）與測試執行。
*   **審查重點**：
    *   **規格符合度 (40%)**：確認程式碼完全按照 `task_list.json` 實作。
    *   **程式碼品質 (25%)**：確認無 Dead Code、邏輯清晰易讀。
    *   **測試涵蓋率 (20%)**：單元測試必須覆蓋所有關鍵業務邏輯分支，並產出 JUnit 格式的測試結果 `outputs/unit_test_results.xml`。
    *   **安全與錯誤處理 (15%)**：確認輸入值有進行安全檢驗、有完整的 Exception Handling。

---

## 二、 輸入與輸出規範

*   **輸入路徑 (`inputs/`)**：存放此階段發現的 Bug 回饋檔案 `BUG_*.md`。
*   **輸出路徑 (`outputs/`)**：
    *   `task_list.json`：實作任務清單。
    *   `unit_test_results.xml`：單元測試執行結果報告。
