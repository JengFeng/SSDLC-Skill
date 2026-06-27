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



## 傳統 SA 多格式 vs YAML SSOT 單一母版

### 傳統作法：各階段各自產出不同格式，跨階段查詢靠人肉
```
01 規劃 → Word │ 02 設計 → Visio+Excel │ 03 開發 → 純程式碼
04 測試 → Excel │ 05 部署 → Confluence │ 06 維護 → Word
```
問「REQ_005 測試過了沒」→ 翻 4 份文件，數分鐘。

### YAML SSOT：本專案的作法
```
executable_spec.yaml 單一檔案貫穿六階段
phase_01.requirements[4] → phase_02.database → phase_03.modules → phase_04.test_results → traceability.matrix[4]
```
問「REQ_005 測試過了沒」→ AI 代理查一個欄位，0.1 秒回答：`TC_003 + TC_UI_004，已驗證 ✅`

### 實際效益（本專案示範）
| 查詢 | 傳統 | YAML SSOT |
|:---|:---|:---|
| 10 項需求完整追溯 | 翻 traceability_matrix.md 逐行比對 | `traceability.matrix[*].status` |
| 6 階段評分總覽 | 各階段 outputs/ 各自翻閱 | `phase_0*_*.evaluator.scores` |
| 版本歷程 | 看 git log | `change_log` 6 版結構化記錄 |
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

