# SSOT 可執行規格架構定義

> 本文件定義 SSDLC 專案之規格體系架構，為所有 AI 代理與人類開發者之共同依據。

---

## 一、 規格體系總覽

本專案採用 **三軌規格架構**，以 `executable_spec.yaml` 為唯一資料源 (SSOT)：

| 軌道 | 檔案 | 格式 | 讀者 | 用途 |
|:---|:---|:---|:---|:---|
| **結構化可執行規格** | `executable_spec.yaml` | YAML | 🤖 AI | 需求清單、API 端點、資料模型、安全控制、Phase Gates |
| **行為化可執行規格** | `features/requirements.feature` | Gherkin | 🤖 AI | Given-When-Then 驗收場景（可用 behave/pytest-bdd 執行） |
| **人可讀系統規格書** | `../system_specification.md` | Markdown | 👤 人類 | IEEE 830 SRS，專案交付與驗收依據 |

## 二、 測試方法論

本專案採用 **TDD (Test-Driven Development)** 作為唯一測試方法論：

| 項目 | 說明 |
|:---|:---|
| 測試框架 | pytest 9.x |
| 測試檔案 | `../04_testing/outputs/test_employee_crud.py` |
| 測試數量 | 16 項（認證 5 + 列表 4 + 新增 3 + 修改 2 + 刪除 1 + 安全 1） |
| TDD 循環 | RED → GREEN → REFACTOR |
| 需求涵蓋率 | 100% (6/6 REQ) |

> ⚠️ `requirements.feature` 為行為規格定義，非測試執行檔。實際測試由 pytest 執行。

## 三、 各階段規格引用規範

每個階段的 `inputs/spec_ref.md` 明確列出本階段須讀取的規格：

| 階段 | 須讀取的規格 |
|:---|:---|
| Phase 01 規劃 | user_requirement_raw.md |
| Phase 02 設計 | formal_requirements.md + executable_spec.yaml + requirements.feature |
| Phase 03 開發 | api_spec.md + db_schema.sql + ui_prototype.html + executable_spec.yaml |
| Phase 04 測試 | app.py + executable_spec.yaml + requirements.feature |
| Phase 05 部署 | app.py + test_results.md + executable_spec.yaml |
| Phase 06 維護 | app.py + security_deployment_checklist.md + executable_spec.yaml |

## 四、 SSOT 一致性原則

1. **規格先行**：任何變更必須先更新 `executable_spec.yaml`，再修改階段產出
2. **單一資料源**：需求、API、資料模型以 YAML 為準，SRS 由 YAML 衍生
3. **跨階段一致**：Evaluator 每階段檢查產出與 SSOT 一致性，不一致即 B 類錯誤

## 五、 檔案結構

```
specs/
├── README.md                 ← 本文件（規格架構定義）
├── executable_spec.yaml      ← 🤖 SSOT（AI 結構化可執行規格）
└── features/
    └── requirements.feature   ← 🤖 Gherkin（AI 行為化可執行規格）
```
