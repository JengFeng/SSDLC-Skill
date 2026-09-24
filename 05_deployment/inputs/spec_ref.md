# Phase 05 部署發布規格參照範本

> 本檔案是專案初始化用範本。部署規劃前先讀取下列專案實例規格；連結以本檔案所在的 `inputs/` 目錄為起點。

## 必讀規格

| 順序 | 專案根目錄相對路徑 | 用途 |
|:---|:---|:---|
| 1 | [specs/executable_spec.yaml](../../specs/executable_spec.yaml) | 唯一結構化 SSOT；讀取 `phase_04_testing` 驗證狀態 |
| 2 | [specs/features/requirements.feature](../../specs/features/requirements.feature) | 核對已核准的行為驗收範圍 |
| 3 | [system_specification.md](../../system_specification.md) | 人可讀 SRS、部署與限制摘要 |
| 4 | [traceability_matrix.md](../../traceability_matrix.md) | 需求、測試、部署產物追溯 |

上游交接：從 YAML 的 `phase_04_testing.outputs` 取得已完成的測試結果路徑，並依 `phase_04_testing.bugs` 核對實際缺陷紀錄；未通過驗證時不得把範本檔案當成部署許可。逆向工程模式只盤點既有部署證據，須先通過人工審核閘口。依 [phase_gates.json](../../phase_gates.json) 確認關卡，並遵循 [專案規章](../../.agents/AGENTS.md)。
