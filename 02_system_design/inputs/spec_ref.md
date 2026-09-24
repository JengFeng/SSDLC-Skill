# Phase 02 系統設計規格參照範本

> 本檔案是專案初始化用範本。設計前先讀取下列專案實例規格；連結以本檔案所在的 `inputs/` 目錄為起點。

## 必讀規格

| 順序 | 專案根目錄相對路徑 | 用途 |
|:---|:---|:---|
| 1 | [specs/executable_spec.yaml](../../specs/executable_spec.yaml) | 唯一結構化 SSOT；讀取 `phase_01_planning` 已核准需求與 `phase_02_design` 狀態 |
| 2 | [specs/features/requirements.feature](../../specs/features/requirements.feature) | 核對已核准需求的行為場景 |
| 3 | [system_specification.md](../../system_specification.md) | 人可讀 SRS 與需求邊界 |
| 4 | [traceability_matrix.md](../../traceability_matrix.md) | 對照需求 ID 與設計元素 |

上游交接：從 YAML 的 `phase_01_planning.outputs` 取得正式需求及追蹤表的產物路徑；對應檔案通常位於 `01_planning_and_analysis/outputs/` 與 `reg/`。只有 Phase 01 實際完成並產出檔案後才讀取，不能把預定路徑當成已存在的證據。依 [phase_gates.json](../../phase_gates.json) 確認關卡，並遵循 [專案規章](../../.agents/AGENTS.md)。
