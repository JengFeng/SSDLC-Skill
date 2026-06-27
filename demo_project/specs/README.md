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
