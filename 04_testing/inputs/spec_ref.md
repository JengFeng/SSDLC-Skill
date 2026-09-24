# Phase 04 測試驗證規格參照範本

> 本檔案是專案初始化用範本。測試規劃前先讀取下列專案實例規格；連結以本檔案所在的 `inputs/` 目錄為起點。

## 必讀規格

| 順序 | 專案根目錄相對路徑 | 用途 |
|:---|:---|:---|
| 1 | [specs/executable_spec.yaml](../../specs/executable_spec.yaml) | 唯一結構化 SSOT；讀取驗收條件與 `phase_03_implementation` 產物 |
| 2 | [specs/features/requirements.feature](../../specs/features/requirements.feature) | 已核准需求對應的 Given/When/Then 場景 |
| 3 | [system_specification.md](../../system_specification.md) | 人可讀 SRS 與驗收標準 |
| 4 | [traceability_matrix.md](../../traceability_matrix.md) | 需求到測試案例的追溯 |

上游交接：從 YAML 的 `phase_03_implementation.outputs` 取得實作與單元測試產物路徑；需確認實體檔案及來源版本。逆向工程模式另須先通過 Phase 01 人工審核閘口。依 [phase_gates.json](../../phase_gates.json) 確認關卡，並遵循 [專案規章](../../.agents/AGENTS.md)。
