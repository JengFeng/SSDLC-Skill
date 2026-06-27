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
    ├─ 02 Generator 寫入 phase_02.database + api
    ├─ 02 Evaluator 寫入 evaluator.scores
    │
    ... (03~06 同理)
    │
    └─ 全域 Agent 生成 system_specification.md
```

### 格式優勢
| 面向 | 傳統 SRS (Markdown) | 可執行規格 (YAML) |
|:---|:---|:---|
| 人類閱讀 | ✅ 友善 | ⚠️ 需轉換 |
| AI 解析 | ❌ 需 NLP 拆解 | ✅ 直接結構化讀取 |
| 自動化驗證 | ❌ 難 | ✅ schema validation |
| 跨階段傳遞 | ⚠️ 容易遺漏 | ✅ 欄位明確 |
| 版本比對 | ⚠️ 逐行 diff | ✅ 欄位級 diff |
| Token 消耗 | 高（需解析全文） | 低（只讀取所需欄位） |

## 目錄結構
```
specs/
├── README.md                    ← 本檔案
├── executable_spec.yaml         ← YAML 可執行規格母版（SSOT）
└── features/                    ← Gherkin .feature 檔案（BDD 可執行規格）
    └── .gitkeep
```

## 使用方式

### 各階段 AI 代理讀取規範
```yaml
# Planner 讀取範例：取得 01 階段已完成的需求
phase_01_planning.requirements[].description

# Generator 寫入範例：寫入 03 階段原始碼清單
phase_03_implementation.modules:
  - name: "app"
    path: "app.py"
    dependencies: ["flask", "sqlite3"]

# Evaluator 寫入範例：寫入評分
phase_04_testing.evaluator.scores:
  requirement_coverage: 35
  dual_track_pass_rate: 30
```

### 自動生成 SRS
階段完成後，全域 Agent 自動從 `executable_spec.yaml` 生成 `system_specification.md`：
1. 讀取 `executable_spec.yaml` 各階段資料
2. 填入 SRS 範本對應章節
3. 更新版本號與變更紀錄
4. 寫入 Gherkin 狀態（`[已通過]` / `[未通過]`）
