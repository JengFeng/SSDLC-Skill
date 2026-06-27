# 可執行規格目錄 — 員工基本資料管理系統

本目錄實作雙格式規格架構：

| 檔案 | 用途 | 讀者 |
|:---|:---|:---|
| `executable_spec.yaml` | YAML 可執行規格母版（SSOT） | AI 代理（Planner/Generator/Evaluator） |
| `features/requirements.feature` | Gherkin BDD 可執行規格 | 人類 + behave/SpecFlow 測試框架 |
| `../system_specification.md` | 傳統 SRS（IEEE 830，自動生成） | 人類（甲方/PM） |

## 階段狀態
全部 6 階段已完成，詳見 `executable_spec.yaml` 與 `../phase_gates.json`。

## 測試結果
- pytest API: 7/7 ✅
- Playwright UI: 7/7 ✅
- 10 項需求全追溯 ✅


## YAML 母版還原能力

### ✅ 可從此 YAML 完全還原
| 文件 | 來源欄位 |
|:---|:---|
| `system_specification.md` | `project` + `phase_01.requirements` + `phase_02.database/api` + `phase_04.test_results` |
| `traceability_matrix.md` | `traceability.matrix`（10 條） |
| `formal_requirements.md` | `phase_01.requirements`（10 項含驗收條件） |
| `api_spec.md` | `phase_02.api.endpoints`（6 支 API） |
| `test_results.md` | `phase_04.test_results`（14/14 PASS） |
| `requirements.feature` | `phase_01.requirements[].acceptance_criteria` → Gherkin |

### ❌ 不可從 YAML 還原（須從 git 取得原始檔）
| 檔案 | 說明 |
|:---|:---|
| `app.py`、`test_*.py` | YAML 只記錄路徑，原始碼由 git 管理 |
| `db_schema.sql`、`er_diagram.md` 等設計產出 | YAML 記錄結構摘要，完整語法在原始檔 |
| `requirements.txt`、`run.bat` | YAML 記錄路徑 + SHA-256 |

> 💡 此 YAML 是規格層 SSOT，不是全檔案備份。程式碼與圖檔的完整內容由 Git 版本控制管理。
