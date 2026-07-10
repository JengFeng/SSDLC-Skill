# 可執行規格目錄 (Executable Specification)

本目錄實現記憶中定義的「雙格式規格」架構：

```
人類可讀層 (Human Layer)                    機器可讀層 (Machine Layer)
─────────────────────────                   ─────────────────────────
system_specification.md  ←──自動生成───   executable_spec.yaml (SSOT)
(傳統 SRS, IEEE 830)                       (YAML, 結構化資料)
        ↑                                         ↑
        │                                         │
  甲方/人類閱讀                               AI 代理讀取/寫入
```

## 設計原則

### 一源多用 (SSOT)
- **`executable_spec.yaml`** 是唯一資料源
- 所有 6 個階段的 AI 代理（Planner/Generator/Evaluator）皆以此檔案作為主要讀取/寫入對象
- `system_specification.md` 由此檔案自動生成，永不手動編輯

### 階段間資料流
```
executable_spec.yaml
    │
    ├─ 01 Planner 讀取 → 規劃需求
    ├─ 01 Generator 寫入 requirements section
    ├─ 01 Evaluator 寫入 evaluator.scores + passed
    │
    ├─ 02 Planner 讀取 phase_01.requirements → 規劃設計
    ├─ 02 Generator 寫入 database / api sections
    ├─ 02 Evaluator 寫入 evaluator.scores + passed
    │
    ├─ ...
    │
    └─ 06 Evaluator 寫入 final evaluator.scores
```

## 目錄結構

| 檔案 | 用途 |
|:---|:---|
| `executable_spec.yaml` | YAML SSOT 母版（AI 代理主要讀寫對象） |
| `features/requirements.feature` | Gherkin BDD 可執行規格（由 YAML 自動生成） |
| `README.md` | 本說明文件 |
