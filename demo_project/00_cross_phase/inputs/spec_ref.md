# 可執行規格引用 (Spec Reference)

> 跨階段全域技能執行前，AI 代理必須讀取以下 SSOT 規格檔案。

## 必要讀取

| 規格 | 路徑 | 類型 |
|:---|:---|:---|
| 結構化可執行規格 | [executable_spec.yaml](../specs/executable_spec.yaml) | YAML（需求/API/資料模型/安全控制） |
| 行為可執行規格 | [requirements.feature](../specs/features/requirements.feature) | Gherkin（Given-When-Then 場景） |
| 系統規格書 (SRS) | [system_specification.md](../system_specification.md) | 人可讀 |
| 追溯矩陣 (RTM) | [requirement_tracker.md](../01_planning_and_analysis/reg/requirement_tracker.md) | 需求追溯 |

> 若未讀取上述規格即開始執行，產出可能與整體設計不一致。
