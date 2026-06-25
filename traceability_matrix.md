# 需求追溯矩陣 (Requirements Traceability Matrix - RTM)

本文件用以記錄專案中所有需求與設計、實作、測試之間的對照關係。全域連貫性工程（Global Alignment Engineering）會自動稽核本表的追溯完整度，確保無任何贅餘功能或未經測試的規格。

---

## 一、 需求追溯表

| 需求編號 | 原始輸入來源 | 規格定義 (01) | 系統設計 (02) | 開發實作 (03) | 測試案例 (04) | 當前狀態 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `REQ_001` | [REQ_example.md](file:///d:/00AI協作/SSDLC_Skill/01_planning_and_analysis/inputs/REQ_example.md) | `requirements.yaml` §1.1 | `openapi.yaml` `/example`<br>`db_schema.sql` `ExampleTable` | `src/example.py` `do_something()` | `example.feature`<br>Scenario: 正常運行範例 | `[範例初始化]` |

*   *備註：狀態欄位可能之值為：`[已驗證]`、`[測試失敗]`、`[不連貫警告]`、`[贅餘功能/副產物]`。*
