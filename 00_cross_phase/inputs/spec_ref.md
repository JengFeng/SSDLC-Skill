# 跨階段全域層規格參照範本

> 本檔案位於框架範本。專案初始化後，執行任何跨階段 Skill 前須先讀取下列專案實例規格；範本內容不代表需求已獲核准。以下連結均以本檔案所在的 `inputs/` 目錄為起點。

## 必讀規格

| 順序 | 專案根目錄相對路徑 | 用途 |
|:---|:---|:---|
| 1 | [specs/executable_spec.yaml](../../specs/executable_spec.yaml) | 結構化 SSOT，確認目前階段及需求狀態 |
| 2 | [specs/features/requirements.feature](../../specs/features/requirements.feature) | 由已核准驗收條件衍生的行為規格 |
| 3 | [system_specification.md](../../system_specification.md) | 由 SSOT 衍生的人可讀系統規格 |
| 4 | [traceability_matrix.md](../../traceability_matrix.md) | 需求跨階段追溯矩陣 |

另須依 [phase_gates.json](../../phase_gates.json) 確認關卡與審核狀態，並遵循 [專案規章](../../.agents/AGENTS.md)。若規格仍為佔位或關卡未核准，應記錄缺口並停止依賴該規格的工作。
