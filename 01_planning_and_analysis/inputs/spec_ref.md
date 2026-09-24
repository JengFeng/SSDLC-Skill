# Phase 01 規劃與需求分析規格參照範本

> 本檔案是專案初始化用範本。規劃前先讀取下列專案實例規格；範本中的佔位值不得視為真實需求。連結以本檔案所在的 `inputs/` 目錄為起點。

## 必讀規格

| 順序 | 專案根目錄相對路徑 | 用途 |
|:---|:---|:---|
| 1 | [specs/executable_spec.yaml](../../specs/executable_spec.yaml) | 唯一結構化 SSOT；讀取 `phase_01_planning` 及需求清單 |
| 2 | [specs/features/requirements.feature](../../specs/features/requirements.feature) | 由驗收條件產生的行為場景；未產生時保持範本狀態 |
| 3 | [system_specification.md](../../system_specification.md) | 人可讀 SRS；與 YAML 內容交叉核對 |
| 4 | [traceability_matrix.md](../../traceability_matrix.md) | 需求 ID 與來源追溯 |

依 [phase_gates.json](../../phase_gates.json) 確認目前關卡，並遵循 [專案規章](../../.agents/AGENTS.md)。輸入的原始需求須記錄來源；需求核准後才從 YAML 產生行為規格及其餘衍生文件。
