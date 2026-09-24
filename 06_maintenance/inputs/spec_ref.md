# Phase 06 維護與營運規格參照範本

> 本檔案是專案初始化用範本。維運規劃前先讀取下列專案實例規格；連結以本檔案所在的 `inputs/` 目錄為起點。

## 必讀規格

| 順序 | 專案根目錄相對路徑 | 用途 |
|:---|:---|:---|
| 1 | [specs/executable_spec.yaml](../../specs/executable_spec.yaml) | 唯一結構化 SSOT；讀取 `phase_05_deployment` 產物與 `phase_06_maintenance` 狀態 |
| 2 | [specs/features/requirements.feature](../../specs/features/requirements.feature) | 核對回歸測試與原始驗收行為 |
| 3 | [system_specification.md](../../system_specification.md) | 人可讀 SRS、維運目標與限制 |
| 4 | [traceability_matrix.md](../../traceability_matrix.md) | 需求、部署、事件及修補追溯 |

上游交接：從 YAML 的 `phase_05_deployment.outputs` 取得建置清單、簽章狀態與部署拓撲等已完成產物路徑；未產出時記錄缺口。逆向工程模式只盤點既有維運證據，須先通過人工審核閘口。依 [phase_gates.json](../../phase_gates.json) 確認關卡，並遵循 [專案規章](../../.agents/AGENTS.md)。
