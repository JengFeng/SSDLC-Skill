# 員工基本資料管理系統 — 系統功能規格書 (SRS)

> **文件版本**：v1.0 | **日期**：2026-06-27 | **文件等級**：正式交付

---

## 一、 緒論 (Introduction)

### 1.1 目的
本文件為「員工基本資料管理系統」之系統功能規格書（Software Requirements Specification，SRS），依據 IEEE 830 標準格式撰寫。旨在明確界定系統之功能需求、非功能需求、資料模型、使用者介面與交付標準，供甲方（業主）與乙方（開發團隊）作為系統驗收之共同依據。

### 1.2 範圍
本系統為一輕量級 Web 應用程式，提供企業內部人資管理人員進行員工基本資料之新增、刪除、修改與查詢（CRUD）作業。系統採單機部署架構，適用於中小型企業內部使用。

### 1.3 名詞定義
| 術語 | 定義 |
|:---|:---|
| CRUD | 新增 (Create)、查詢 (Read)、修改 (Update)、刪除 (Delete) 四項基本資料操作 |
| SRS | Software Requirements Specification，軟體需求規格書 |
| RTM | Requirements Traceability Matrix，需求追溯矩陣 |
| PRG | Post/Redirect/Get，防止表單重複提交之設計模式 |

### 1.4 參考文件
| 文件 | 路徑 |
|:---|:---|
| 需求追溯矩陣 | [traceability_matrix.md](traceability_matrix.md) |
| 需求追蹤表 | [requirement_tracker.md](01_planning_and_analysis/reg/requirement_tracker.md) |
| 原始需求輸入 | `01_planning_and_analysis/inputs/user_requirement_raw.md` |
| 正規化規格 | `01_planning_and_analysis/outputs/formal_requirements.md` |
| 測試報告 | [test_results.md](04_testing/outputs/test_results.md) |

---

## 二、 整體描述 (Overall Description)

### 2.1 產品觀點
本系統為獨立 Web 應用程式，不依賴外部服務。採用 Python Flask 框架作為應用伺服器，SQLite 作為資料儲存引擎，Jinja2 模板引擎渲染使用者介面。系統架構遵循 MVC（Model-View-Controller）設計模式。

### 2.2 產品功能摘要
| 功能編號 | 功能名稱 | 優先級 | 說明 |
|:---|:---|:---|:---|
| FEAT_001 | 員工列表與搜尋 | P0 | 全列表顯示 + 關鍵字搜尋（姓名/部門/Email） |
| FEAT_002 | 新增員工 | P0 | 表單輸入五項欄位，含必填驗證與 Email 唯一性檢查 |
| FEAT_003 | 修改員工資料 | P0 | 編輯既有員工所有欄位，保留 Email 不變可通過唯一性檢查 |
| FEAT_004 | 刪除員工 | P0 | 確認對話框後硬刪除 |
| FEAT_005 | 操作日誌 | P1 | 所有 CRUD 操作記錄於伺服器日誌檔 |

### 2.3 使用者特性
| 角色 | 權限 | 說明 |
|:---|:---|:---|
| 人資管理員 | 全部功能 | 唯一使用者角色，可執行所有 CRUD 操作 |

### 2.4 運作環境
| 項目 | 規格 |
|:---|:---|
| 作業系統 | Windows（亦可於 Linux/macOS 運行） |
| Python 版本 | 3.13 以上 |
| 瀏覽器 | Chrome / Edge / Firefox 最新版 |
| 硬體需求 | 1 GB RAM，100 MB 磁碟空間 |

### 2.5 設計與實作限制
- 第一版不實作使用者身分驗證（內部工具）
- 不實作軟刪除（刪除即物理移除）
- 前端採伺服器端渲染（SSR），不使用前後端分離架構
- 資料庫採單檔案 SQLite，不支援並行寫入

---

## 三、 具體需求 (Specific Requirements)

### 3.1 功能需求詳細說明

#### 3.1.1 FEAT_001：員工列表與搜尋
- **描述**：進入系統首頁後，顯示所有員工資料之表格列表。提供搜尋框，可依姓名、部門或 Email 進行關鍵字模糊比對。
- **輸入**：關鍵字（可選）
- **處理**：
  1. 若無關鍵字：`SELECT * FROM employees ORDER BY id`
  2. 若有關鍵字：`SELECT * FROM employees WHERE name LIKE ? OR department LIKE ? OR email LIKE ?`
- **輸出**：HTML 表格，含編號、姓名、部門、職稱、Email、到職日、操作按鈕
- **例外**：若無員工資料，顯示「尚無員工資料，請點選新增員工開始建立」

#### 3.1.2 FEAT_002：新增員工
- **描述**：點選「新增員工」按鈕後，進入表單頁面，填寫五項必填欄位後提交。
- **欄位**：
  | 欄位 | 型別 | 驗證規則 |
  |:---|:---|:---|
  | 姓名 | 文字 | 必填，不可空白 |
  | 部門 | 文字 | 必填，不可空白 |
  | 職稱 | 文字 | 必填，不可空白 |
  | 電子郵件 | Email | 必填，格式須符合 email，全系統唯一 |
  | 到職日期 | 日期 | 必填，YYYY-MM-DD 格式 |
- **處理流程**：
  1. 前端 required 驗證（瀏覽器層）
  2. 後端空白檢查 → 不通過則回傳「所有欄位皆為必填」
  3. 後端 Email 唯一性檢查 → 重複則回傳「電子郵件已存在」
  4. 通過 → INSERT 寫入資料庫 → 記錄日誌 → 302 redirect 回首頁
- **成功訊息**：「員工新增成功」
- **錯誤訊息**：「所有欄位皆為必填」、「電子郵件已存在」

#### 3.1.3 FEAT_003：修改員工資料
- **描述**：於列表頁點選目標員工之「編輯」按鈕，進入預填表單頁，修改後提交。
- **處理流程**：同新增，但 SQL 為 UPDATE，且 Email 唯一性檢查排除自身 ID
- **成功訊息**：「員工資料更新成功」
- **例外**：若目標員工不存在，回傳「員工不存在」並返回列表

#### 3.1.4 FEAT_004：刪除員工
- **描述**：於列表頁點選目標員工之「刪除」按鈕，彈出瀏覽器確認對話框。
- **對話框訊息**：「確定要刪除員工 {姓名} 嗎？」
- **處理流程**：確認 → DELETE FROM employees WHERE id=? → 記錄日誌
- **成功訊息**：「員工 {姓名} 已刪除」

#### 3.1.5 FEAT_005：操作日誌
- **描述**：所有 CRUD 操作自動記錄至伺服器日誌檔
- **日誌路徑**：`logs/app.log`
- **格式**：`YYYY-MM-DD HH:MM:SS,mmm [LEVEL] 訊息`
- **記錄事件**：DB 初始化、員工新增、員工修改、員工刪除、HTTP 請求

### 3.2 外部介面需求

#### 3.2.1 使用者介面 (UI)
本系統提供三個畫面，完整 UI 雛型詳見 [ui_prototype.html](02_system_design/outputs/ui_prototype.html)。

| 畫面 | 路徑 | 說明 |
|:---|:---|:---|
| 員工列表 | `GET /` | 表格列表 + 搜尋框 + 新增按鈕 + Flash 訊息 |
| 新增/編輯表單 | `GET /add`、`GET /edit/<id>` | 五欄位表單 + 提交/取消 |
| 刪除確認 | 瀏覽器原生 confirm() | 對話框 |

#### 3.2.2 API 介面
| 方法 | 端點 | 說明 | 請求 | 回應 |
|:---|:---|:---|:---|:---|
| GET | `/` | 員工列表 | Query: `?q=關鍵字` | HTML |
| GET | `/add` | 新增表單 | — | HTML |
| POST | `/add` | 提交新增 | Form: 5 欄位 | 302 → `/` 或 200 錯誤 |
| GET | `/edit/<id>` | 編輯表單 | Path: 員工 ID | HTML |
| POST | `/edit/<id>` | 提交修改 | Form: 5 欄位 | 302 → `/` 或 200 錯誤 |
| POST | `/delete/<id>` | 刪除員工 | Path: 員工 ID | 302 → `/` |

### 3.3 資料庫需求
#### 3.3.1 ER 圖
詳見 [er_diagram.md](02_system_design/outputs/er_diagram.md)

#### 3.3.2 資料表結構 (employees)
| 欄位 | 型別 | 約束 | 說明 |
|:---|:---|:---|:---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 員工編號 |
| name | TEXT | NOT NULL | 姓名 |
| department | TEXT | NOT NULL | 部門 |
| title | TEXT | NOT NULL | 職稱 |
| email | TEXT | NOT NULL, UNIQUE | 電子郵件 |
| hire_date | TEXT | NOT NULL | 到職日期 (YYYY-MM-DD) |
| created_at | TEXT | DEFAULT datetime('now','localtime') | 建立時間 |
| updated_at | TEXT | DEFAULT datetime('now','localtime') | 更新時間 |

#### 3.3.3 DDL
詳見 [db_schema.sql](02_system_design/outputs/db_schema.sql)

### 3.4 非功能需求
| 需求 | 指標 |
|:---|:---|
| 可用性 | 單一使用者操作，頁面回應時間 < 2 秒 |
| 可靠性 | 應用程式崩潰後重啟不遺失已提交資料（SQLite 持久化） |
| 可維護性 | 原始碼 < 200 行 Python，單一檔案部署 |
| 日誌審計 | 所有 CRUD 操作記錄於 logs/app.log |
| 測試覆蓋 | pytest 7 項 + Playwright 7 項，共 14 項測試全數通過 |

### 3.5 安全性需求
- Email 唯一性約束防止資料重複
- 刪除操作含確認對話框防止誤刪
- 表單輸入必填驗證防止不完整資料

---

## 四、 UML 系統模型

| 圖型 | 連結 | 說明 |
|:---|:---|:---|
| 用例圖 | [use_case_diagram.md](02_system_design/outputs/use_case_diagram.md) | 人資管理員 × 5 用例 |
| 活動圖 | [activity_diagram.md](02_system_design/outputs/activity_diagram.md) | CRUD 完整業務流程 |
| 循序圖 | [sequence_diagram.md](02_system_design/outputs/sequence_diagram.md) | 新增員工 MVC 三層互動 |
| ER 圖 | [er_diagram.md](02_system_design/outputs/er_diagram.md) | 資料庫實體關係 |

---

## 五、 驗收標準

| 項目 | 標準 | 狀態 |
|:---|:---|:---|
| 單元測試 | pytest 7/7 PASS | ✅ |
| UI 測試 | Playwright 7/7 PASS | ✅ |
| 需求追溯 | 10 項需求全追溯（requirement_tracker.md） | ✅ |
| 設計產出 | 7 項標準設計文件 | ✅ |
| 文件交付 | 本 SRS + traceability_matrix.md + test_results.md | ✅ |

---

## 六、 附錄

### A. 文件架構索引
```
[PROJECT_ROOT]/
├── system_specification.md          ← 本文件（SRS 系統功能規格書）（SRS 系統功能規格書）
├── [traceability_matrix.md](traceability_matrix.md) ← RTM 需求追溯矩陣 需求追溯矩陣
├── 01_planning_and_analysis/
│   ├── inputs/user_requirement_raw.md
│   ├── reg/requirement_tracker.md   ← 需求追蹤表（10 項）
│   ├── reg/grill_me_session.md
│   └── outputs/formal_requirements.md
├── 02_system_design/outputs/        ← 7 項設計產出
├── 03_implementation_and_coding/outputs/ ← app.py + templates
├── 04_testing/
│   ├── outputs/test_results.md      ← 測試報告（14/14）
│   └── bug/bug_tracker.md           ← Bug 追蹤表
└── 05_deployment/outputs/           ← requirements.txt + run.bat
```

### B. 變更紀錄
| 版本 | 日期 | 變更內容 |
|:---|:---|:---|
| v1.0 | 2026-06-27 | 初版，依據 IEEE 830 標準撰寫完整 SRS |
