# 階段規格參照 (spec_ref.md) — 00_cross_phase

> 本檔案定義跨階段全域共用層執行前必須讀取的 SSOT 規格路徑。
> AI 代理執行前必須先讀取本檔案中列出的所有規格，未讀取即執行者，Evaluator 判定為 B 類錯誤。

## 必讀規格清單

| 優先序 | 檔案路徑 | 說明 |
|:---|:---|:---|
| 1 | `../specs/executable_spec.yaml` | YAML SSOT 母版（唯一資料源） |
| 2 | `../specs/features/requirements.feature` | Gherkin BDD 可執行規格 |
| 3 | `../.agents/AGENTS.md` | 專案規章守則 |
| 4 | `../traceability_matrix.md` | 全域需求追溯矩陣 |
| 5 | `../phase_gates.json` | 階段關卡管控檔案 |
