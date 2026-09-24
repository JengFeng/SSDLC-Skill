# Phase 03 開發與編碼規格參照範本

> 本檔案是專案初始化用範本。實作前先讀取下列專案實例規格；連結以本檔案所在的 `inputs/` 目錄為起點。

## 必讀規格

| 順序 | 專案根目錄相對路徑 | 用途 |
|:---|:---|:---|
| 1 | [specs/executable_spec.yaml](../../specs/executable_spec.yaml) | 唯一結構化 SSOT；讀取 `phase_02_design` 已核准設計與 `phase_03_implementation` 狀態 |
| 2 | [specs/features/requirements.feature](../../specs/features/requirements.feature) | 核對需求行為及驗收邊界 |
| 3 | [system_specification.md](../../system_specification.md) | 人可讀 SRS 與外部介面摘要 |
| 4 | [traceability_matrix.md](../../traceability_matrix.md) | 需求、設計及實作項目的追溯 |

上游交接：從 YAML 的 `phase_02_design.outputs` 取得 API、資料庫、UI 與圖表等已完成產物路徑。其檔案通常位於 `02_system_design/outputs/`；未產出或未經關卡核准時不得自行補想規格。依 [phase_gates.json](../../phase_gates.json) 確認關卡，並遵循 [專案規章](../../.agents/AGENTS.md)。
