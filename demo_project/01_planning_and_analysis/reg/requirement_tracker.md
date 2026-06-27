# 需求追蹤表 (Requirement Tracker)

> 本表為 Stage 01 規劃與需求分析階段之統一需求記錄。所有需求均記錄於此，持續追加。

| REQ ID | 提出日期 | 來源 | 優先級 | 描述 | 對應設計 (02) | 對應實作 (03) | 對應測試 (04) | 狀態 |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| REQ_001 | 2026-06-27 | 使用者口述 | P0 | 員工列表查詢（含關鍵字搜尋：姓名/部門/Email） | [api_spec.md](../02_system_design/outputs/api_spec.md) GET / | [app.py](../03_implementation_and_coding/outputs/app.py) index() | TC_001, TC_004, TC_UI_001, TC_UI_003 | ✅ 已驗證 |
| REQ_002 | 2026-06-27 | 使用者口述 | P0 | 新增員工（表單輸入，全欄位必填，Email 唯一性檢查） | [api_spec.md](../02_system_design/outputs/api_spec.md) POST /add | [app.py](../03_implementation_and_coding/outputs/app.py) add() | TC_002, TC_007, TC_UI_002, TC_UI_007 | ✅ 已驗證 |
| REQ_003 | 2026-06-27 | 使用者口述 | P0 | 修改員工資料（編輯既有員工所有欄位） | [api_spec.md](../02_system_design/outputs/api_spec.md) POST /edit | [app.py](../03_implementation_and_coding/outputs/app.py) edit() | TC_005, TC_UI_005 | ✅ 已驗證 |
| REQ_004 | 2026-06-27 | 使用者口述 | P0 | 刪除員工（含確認對話框，硬刪除） | [api_spec.md](../02_system_design/outputs/api_spec.md) POST /delete | [app.py](../03_implementation_and_coding/outputs/app.py) delete() | TC_006, TC_UI_006 | ✅ 已驗證 |
| REQ_005 | 2026-06-27 | grill-me 釐清 | P0 | Email 唯一性：重複時拒絕並提示使用者 | [db_schema.sql](../02_system_design/outputs/db_schema.sql) UNIQUE | [app.py](../03_implementation_and_coding/outputs/app.py) IntegrityError 處理 | TC_003, TC_UI_004 | ✅ 已驗證 |
| REQ_006 | 2026-06-27 | 設計規範 | P1 | ER 模型正規化（Mermaid erDiagram） | [er_diagram.md](../02_system_design/outputs/er_diagram.md) | [db_schema.sql](../02_system_design/outputs/db_schema.sql) | — | ✅ 設計完成 |
| REQ_007 | 2026-06-27 | 設計規範 | P1 | UI 畫面雛型（Bootstrap HTML，三畫面） | [ui_prototype.html](../02_system_design/outputs/ui_prototype.html) | `templates/` | — | ✅ 設計完成 |
| REQ_008 | 2026-06-27 | 設計規範 | P1 | 用例分析（Actor + Use Case 圖） | [use_case_diagram.md](../02_system_design/outputs/use_case_diagram.md) | [api_spec.md](../02_system_design/outputs/api_spec.md) | — | ✅ 設計完成 |
| REQ_009 | 2026-06-27 | 設計規範 | P1 | 業務流程（CRUD 活動圖） | [activity_diagram.md](../02_system_design/outputs/activity_diagram.md) | [app.py](../03_implementation_and_coding/outputs/app.py) CRUD | — | ✅ 設計完成 |
| REQ_010 | 2026-06-27 | 設計規範 | P1 | MVC 互動（新增員工循序圖） | [sequence_diagram.md](../02_system_design/outputs/sequence_diagram.md) | [app.py](../03_implementation_and_coding/outputs/app.py) add() | TC_002 | ✅ 設計完成 |

## 狀態說明
- ✅ 已驗證：需求已通過測試驗證
- ✅ 設計完成：設計產出已完成
- 🔄 開發中：正在實作
- ⏳ 待規劃：已記錄尚未開始
- ❌ 已取消：經評估不再需要

## 優先級說明
- P0：核心功能，必須實現
- P1：重要功能，應實現
- P2：次要功能，可排後
