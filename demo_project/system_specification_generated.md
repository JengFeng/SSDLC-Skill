# 員工基本資料管理系統 — 系統功能規格書 (SRS)

> **文件版本**：1.0.0 | **日期**：2026-06-27 | **自動生成自** `specs/executable_spec.yaml`

---

## 一、 緒論

### 1.1 目的
輕量級 Web CRUD 應用，Python Flask + SQLite + Jinja2，提供員工基本資料新增/刪除/修改/查詢

### 1.4 參考文件
| 文件 | 路徑 |
|:---|:---|
| 需求追溯矩陣 | `traceability_matrix.md` |
| 需求追蹤表 | `01_planning_and_analysis/reg/requirement_tracker.md` |
| 正規化規格 | `01_planning_and_analysis/outputs/formal_requirements.md` |
| 測試報告 | `04_testing/outputs/test_results.md` |

---

## 二、 整體描述

### 2.2 產品功能摘要
| 功能編號 | 功能名稱 | 優先級 | 說明 |
|:---|:---|:---|:---|
| REQ_001 | 員工列表與關鍵字搜尋（姓名/部門/Email 模糊比對） | P0 | 01_planning_and_analysis/inputs/user_requirement_raw.md |
| REQ_002 | 新增員工（五項必填欄位 + Email 唯一性檢查） | P0 | 01_planning_and_analysis/inputs/user_requirement_raw.md |
| REQ_003 | 修改員工資料 | P0 | 01_planning_and_analysis/inputs/user_requirement_raw.md |
| REQ_004 | 刪除員工（確認對話框） | P0 | 01_planning_and_analysis/inputs/user_requirement_raw.md |
| REQ_005 | Email 唯一性約束 | P0 | 01_planning_and_analysis/reg/grill_me_session.md |
| REQ_006 | ER 模型設計 | P1 | 設計規範 |
| REQ_007 | UI 雛型設計 | P1 | 設計規範 |
| REQ_008 | 使用案例設計 | P1 | 設計規範 |
| REQ_009 | 業務流程設計 | P1 | 設計規範 |
| REQ_010 | 互動時序設計 | P1 | 設計規範 |

### 2.4 運作環境
- 技術棧：flask, sqlite3, jinja2

---

## 三、 具體需求

### 3.1.001 員工列表與關鍵字搜尋（姓名/部門/Email 模糊比對）
- **優先級**：P0
- **來源**：01_planning_and_analysis/inputs/user_requirement_raw.md
- **驗收條件**：
  - 首頁顯示所有員工表格列表
  - 搜尋框可依姓名、部門、Email 模糊比對
  - 無員工時顯示提示訊息

### 3.1.002 新增員工（五項必填欄位 + Email 唯一性檢查）
- **優先級**：P0
- **來源**：01_planning_and_analysis/inputs/user_requirement_raw.md
- **驗收條件**：
  - 表單含姓名、部門、職稱、Email、到職日五欄位
  - 所有欄位必填，空白提交顯示錯誤
  - Email 重複時拒絕並顯示提示
  - 成功後 redirect 回首頁

### 3.1.003 修改員工資料
- **優先級**：P0
- **來源**：01_planning_and_analysis/inputs/user_requirement_raw.md
- **驗收條件**：
  - 可編輯既有員工所有欄位
  - 保留 Email 不變時可通過唯一性檢查

### 3.1.004 刪除員工（確認對話框）
- **優先級**：P0
- **來源**：01_planning_and_analysis/inputs/user_requirement_raw.md
- **驗收條件**：
  - 點選刪除彈出瀏覽器確認對話框
  - 確認後物理刪除資料

### 3.1.005 Email 唯一性約束
- **優先級**：P0
- **來源**：01_planning_and_analysis/reg/grill_me_session.md
- **驗收條件**：
  - 資料庫層級 UNIQUE 約束
  - 重複 Email 觸發 IntegrityError

### 3.1.006 ER 模型設計
- **優先級**：P1
- **來源**：設計規範
- **驗收條件**：
  - employees 表含 id/name/department/title/email/hire_date/created_at/updated_at

### 3.1.007 UI 雛型設計
- **優先級**：P1
- **來源**：設計規範
- **驗收條件**：
  - 互動式 HTML 雛型（Bootstrap）
  - 含列表頁、表單頁兩畫面

### 3.1.008 使用案例設計
- **優先級**：P1
- **來源**：設計規範
- **驗收條件**：
  - 人資管理員 × 5 用例（列表/新增/修改/刪除/搜尋）

### 3.1.009 業務流程設計
- **優先級**：P1
- **來源**：設計規範
- **驗收條件**：
  - CRUD 完整業務流程活動圖

### 3.1.010 互動時序設計
- **優先級**：P1
- **來源**：設計規範
- **驗收條件**：
  - 新增員工 MVC 三層互動時序圖

### 3.2 外部介面需求
| 方法 | 端點 | 說明 |
|:---|:---|:---|
| GET | `/` | 員工列表與搜尋 |
| GET | `/add` | 新增表單 |
| POST | `/add` | 提交新增 |
| GET | `/edit/<id>` | 編輯表單 |
| POST | `/edit/<id>` | 提交修改 |
| POST | `/delete/<id>` | 刪除員工 |

### 3.3 資料庫需求
#### employees 資料表
| 欄位 | 型別 | 約束 |
|:---|:---|:---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL |
| department | TEXT | NOT NULL |
| title | TEXT | NOT NULL |
| email | TEXT | NOT NULL UNIQUE |
| hire_date | TEXT | NOT NULL |
| created_at | TEXT | DEFAULT datetime('now','localtime') |
| updated_at | TEXT | DEFAULT datetime('now','localtime') |

---

## 五、 驗收標準

| 項目 | 標準 | 狀態 |
|:---|:---|:---|
| API 測試 | pytest 7/7 PASS | [OK] |
| UI 測試 | Playwright 7/7 PASS | [OK] |
| 需求追溯 | 5/10 項已驗證 | [!] |
| 設計產出 | 7 項 | [OK] |

---

## 六、 附錄

### B. 變更紀錄（自動生成自 YAML change_log）
| 版本 | 日期 | 階段 | 摘要 |
|:---|:---|:---|:---|
| 0.1.0 | 2026-06-27 | 01_planning_and_analysis | 專案初始化，完成 10 項需求正規化 |
| 0.2.0 | 2026-06-27 | 02_system_design | 完成 7 項設計產出（DB Schema + ER + API + UI + 3 UML） |
| 0.3.0 | 2026-06-27 | 03_implementation_and_coding | 完成 Flask CRUD 實作（app.py + 3 templates + SQLite） |
| 0.4.0 | 2026-06-27 | 04_testing | 雙軌測試全數通過（pytest 7/7 + Playwright 7/7） |
| 0.5.0 | 2026-06-27 | 05_deployment | 部署產物準備（requirements.txt + run.bat） |
| 1.0.0 | 2026-06-27 | 06_maintenance | 監控指南完成，全專案交付 |

> [!] 本文件由 `scripts/generate_srs.py` 從 `specs/executable_spec.yaml` 自動生成。
> 生成時間：2026-06-27 19:53:08。請勿手動編輯。