---
name: 02_system_design
description: 系統設計階段，負責將需求規格轉譯為 UI Model、ER Model、Table Schema、API 規格書及可執行 BDD feature 檔案。
---

# 系統設計階段技能規範 (02_system_design)

本技能定義了開發團隊在系統設計階段的標準作業程序（SOP）與代理職責。

## 一、 代理人職責規範

### 1. Planner (規劃代理)
*   **任務**：設計軟體系統架構，決定資料流向與模組邊界。規劃交互檢核大綱，確保 UI、資料結構與 BDD 規格在邏輯上具備完整的對照性。
*   **驗收標準**：規劃檢核清單，強制要求檢驗 API 欄位與資料庫 Table 欄位之一致性。

### 2. Generator (執行代理)
*   **任務**：
    1.  讀取 `01_planning_and_analysis/outputs/requirements.yaml`。
    2.  設計實體資料表並產生 MSSQL 腳本 `outputs/db_schema.sql`，同步產生 Markdown 格式的資料字典 `outputs/data_dictionary.md`。
    3.  使用 Mermaid 語法繪製資料庫關係圖 `outputs/er_model.mermaid`。
    4.  遵循 API 優先設計原則，撰寫符合 Swagger / OpenAPI 格式的 API 規格書 `outputs/openapi.yaml`。
    5.  定義頁面欄位與元件狀態 `outputs/ui_model.json`，並產出 HTML UI 雛形網頁 `outputs/ui_prototype.html`。
    6.  自動將需求轉化為 Gherkin 語法的 BDD 可執行規格 `outputs/system_spec.feature`，並將其合併寫入根目錄下的 `system_specification.md`。
    7.  繪製系統設計的 UML 圖表（包含 `outputs/use_case.mermaid`、`outputs/sequence.mermaid`、`outputs/class.mermaid`、`outputs/activity_flow.mermaid`、`outputs/business_flow.mermaid`）。
    8.  執行交互檢檢核，產出 `outputs/cross_check_report.md`。

### 3. Evaluator (審查代理)
*   **任務**：逐項審核 `outputs/` 中的所有設計文件。
*   **審查重點**：
    *   確認 UI 雛型中的欄位 `id` 與 `ui_model.json` 完全一致。
    *   確認 API 規格（`openapi.yaml`）中的參數型態與 MSSQL 資料表欄位型態一致。
    *   確認 `cross_check_report.md` 的檢核結果為 100% 通過。
    *   確認根目錄的 `system_specification.md` 與新設計的 Feature 檔案同步。

---

## 二、 輸入與輸出規範

*   **輸入路徑 (`inputs/`)**：存放此階段人類輸入的設計變更或特殊限制說明。
*   **輸出路徑 (`outputs/`)**：
    *   `ui_model.json` / `ui_prototype.html`
    *   `er_model.mermaid` / `db_schema.sql` / `data_dictionary.md`
    *   `openapi.yaml`
    *   `system_spec.feature` / `cross_check_report.md`
    *   `use_case.mermaid` / `sequence.mermaid` / `class.mermaid` / `activity_flow.mermaid` / `business_flow.mermaid`
