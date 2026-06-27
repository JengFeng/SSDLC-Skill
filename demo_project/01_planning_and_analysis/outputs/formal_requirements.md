# 正規化需求規格書
## 功能清單
| 編號 | 功能 | 優先級 |
|:---|:---|:---|
| REQ_001 | 員工列表 + 關鍵字搜尋 | P0 |
| REQ_002 | 新增員工（必填 + Email 唯一） | P0 |
| REQ_003 | 修改員工資料 | P0 |
| REQ_004 | 刪除員工（確認對話框） | P0 |
## 資料模型
id(PK), name, department, title, email(UK), hire_date, created_at, updated_at
## 技術棧
Python 3.13 + Flask 3.x + SQLite + Jinja2 + pytest
