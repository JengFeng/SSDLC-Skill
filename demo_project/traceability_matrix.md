# 需求追溯矩陣 (RTM)
## 一、 需求追溯表
| 編號 | 原始輸入 | 規格 (01) | 設計 (02) | 實作 (03) | 測試 (04) | 狀態 |
|:---|:---|:---|:---|:---|:---|:---|
| REQ_001 | reg/requirement_tracker.md | formal_requirements.md | api_spec.md GET / | app.py index() | TC_001,004 + TC_UI_001,003 | [已驗證] |
| REQ_002 | reg/requirement_tracker.md | formal_requirements.md | api_spec.md POST /add | app.py add() | TC_002,007 + TC_UI_002,007 | [已驗證] |
| REQ_003 | reg/requirement_tracker.md | formal_requirements.md | api_spec.md POST /edit | app.py edit() | TC_005 + TC_UI_005 | [已驗證] |
| REQ_004 | reg/requirement_tracker.md | formal_requirements.md | api_spec.md POST /delete | app.py delete() | TC_006 + TC_UI_006 | [已驗證] |
| REQ_005 | grill-me | Email 唯一 | db_schema.sql UNIQUE | IntegrityError | TC_003 + TC_UI_004 | [已驗證] |
| REQ_006 | 設計規範 | ER 模型 | er_diagram.md | db_schema.sql | — | [設計完成] |
| REQ_007 | 設計規範 | UI 雛型 | ui_prototype.html | templates/ | — | [設計完成] |
| REQ_008 | 設計規範 | 用例 | use_case_diagram.md | api_spec.md | — | [設計完成] |
| REQ_009 | 設計規範 | 流程 | activity_diagram.md | app.py CRUD | — | [設計完成] |
| REQ_010 | 設計規範 | 互動 | sequence_diagram.md | app.py add() | TC_002 | [設計完成] |
## 二、 Skill 導入
| 日期 | 指令 | Skill |
|:---|:---|:---|
| 2026-06-27 | @01/07 | grill-me |
| 2026-06-27 | @02/03,10,12 | bootstrap-ui + mermaid + plantuml |
## 三、 傳遞鏈
| 傳遞 | 上游 | 下游 | 狀態 |
|:---|:---|:---|:---|
| 01→02 | formal_requirements.md | design_brief.md | ✅ |
| 02→03 | 7 項設計產出 | dev_brief.md | ✅ |
| 03→04 | app.py + templates | test_brief.md | ✅ |
| 04→05 | test_results.md (7/7) | deploy_brief.md | ✅ |
| 05→06 | requirements.txt + run.bat | maintenance_brief.md | ✅ |

| 2026-06-27 | @04/04 | playwright（瀏覽器 UI 自動化測試） |
| 2026-06-28 | @security-check (general/medium/high) | Security-Principles (資安防護基準 7構面/80項) |


