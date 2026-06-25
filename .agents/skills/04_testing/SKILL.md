---
name: 04_testing
description: 測試階段，負責規劃測試案例，運行 BDD/API/UI/單機應用自動化測試治具，並產生交互驗證與追溯矩陣報告。
---

# 測試階段技能規範 (04_testing)

本技能定義了開發團隊在測試階段的標準作業程序（SOP）與代理職責。

## 一、 代理人職責規範

### 1. Planner (規劃代理)
*   **任務**：設計全面測試計劃。確認當前測試案例（BDD Feature/單元測試）完整覆蓋根目錄下的 `traceability_matrix.md` 與 `system_specification.md`。
*   **驗收標準**：若發現任何需求缺少測試覆蓋，必須在 `04_testing/inputs/` 中建立 Bug 記錄檔，標示測試漏洞。

### 2. Generator (執行代理)
*   **任務**：
    1.  根據步驟零所選定的測試應用介面類型，執行自動化測試治具：
        *   **網頁 UI 自動化**：執行 `behave` / SpecFlow，透過 Selenium 模擬網頁操作並比對 MSSQL 資料表。
        *   **API 介面測試**：對 `openapi.yaml` 進行 Contract Test 合約測試，驗證 JSON 回傳 Schema。
        *   **純演算法邏輯**：執行單元測試 Assert 斷言。
        *   **單機應用程式**：執行 UI 自動化測試（Windows App Driver）。
    2.  匯出 AI 讀取版測試報告 `outputs/test_report.json`。
    3.  匯出人讀版圖表化網頁報告 `outputs/test_report.html`。
    4.  自動更新根目錄的 `system_specification.md` 的測試狀態，以及 `traceability_matrix.md` 的驗證狀態。

### 3. Evaluator (審查代理)
*   **任務**：分析測試報告。
*   **審查重點**：
    *   確認 `test_report.json` 中無任何失敗的場景（Scenarios）。
    *   若有測試失敗，分析其根本原因，並根據「異常退回矩陣」定位 Bug 來源，建立 `BUG_*.md` 記錄檔，將其派發至對應的階段（如 Generator 或 Planner）進行退回修復。

---

## 二、 輸入與輸出規範

*   **輸入路徑 (`inputs/`)**：存放此階段發現的測試案例不通過或 Bug 紀錄 `BUG_*.md`。
*   **輸出路徑 (`outputs/`)**：
    *   `test_report.json`：AI 讀取版測試報告。
    *   `test_report.html`：人讀版測試報告。
