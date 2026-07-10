# 階段規格參照 (spec_ref.md) — 02_system_design

> 本檔案定義系統設計階段執行前必須讀取的 SSOT 規格路徑。
> AI 代理執行前必須先讀取本檔案中列出的所有規格，未讀取即執行者，Evaluator 判定為 B 類錯誤。

## 必讀規格清單

| 優先序 | 檔案路徑 | 說明 |
|:---|:---|:---|
| 1 | `../specs/executable_spec.yaml` | YAML SSOT 母版（唯一資料源） |
| 2 | `../specs/features/requirements.feature` | Gherkin BDD 可執行規格 |
| 3 | `../01_planning_and_analysis/outputs/formal_requirements.md` | 正規化需求規格書 |
| 4 | `../01_planning_and_analysis/reg/requirement_tracker.md` | 需求追蹤表 |
| 5 | `../.agents/AGENTS.md` | 專案規章守則 |
| 6 | `../traceability_matrix.md` | 全域需求追溯矩陣 |
| 7 | `../phase_gates.json` | 階段關卡管控檔案 |
