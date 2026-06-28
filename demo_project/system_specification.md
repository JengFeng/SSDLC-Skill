# 員工基本資料管理系統 — 系統功能規格書 (SRS)

> **文件版本**：v1.1 | **日期**：2026-06-28 | **文件等級**：正式交付

---

## 一、 緒論 (Introduction)

### 1.1 目的
本文件為「員工基本資料管理系統」之系統功能規格書（Software Requirements Specification，SRS），依據 IEEE 830 標準格式撰寫。旨在明確界定系統之功能需求、非功能需求、資料模型、使用者介面與交付標準，供甲方（業主）與乙方（開發團隊）作為系統驗收之共同依據。

### 1.2 範圍
本系統為一輕量級 Web 應用程式，提供企業內部人資管理人員進行員工基本資料之新增、刪除、修改與查詢（CRUD）作業。系統採單機部署架構，內建身分驗證（Email + 密碼）與多層安全防護（參數化查詢、Security Headers、帳戶鎖定、SHA-256 密碼雜湊），適用於中小型企業內部使用。已導入數位發展部《資通系統防護基準驗證實務 v1.3》普級防護基準。

### 1.3 名詞定義
| 術語 | 定義 |
|:---|:---|
| CRUD | 新增 (Create)、查詢 (Read)、修改 (Update)、刪除 (Delete) 四項基本資料操作 |
| SRS | Software Requirements Specification，軟體需求規格書 |
| RTM | Requirements Traceability Matrix，需求追溯矩陣 |
| PRG | Post/Redirect/Get，防止表單重複提交之設計模式 |

### 1.4 SSOT 可執行規格
本專案採用一源多用 (SSOT) 架構，以 `specs/executable_spec.yaml` 為唯一資料源，可自動生成 SRS、RTM、Phase Gates。AI 代理於各階段執行前必須讀取此規格檔案。

### 1.5 參考文件
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
| FEAT_006 | 登入驗證 | P0 | Email + 密碼登入，Session 管理，帳戶鎖定（5次/15分） |
| FEAT_007 | 安全防護 | P0 | Security Headers、參數化查詢、輸入驗證、SHA-256 密碼雜湊 |

### 2.3 使用者特性
| 角色 | 權限 | 說明 |
|:---|:---|:---|
| 系統管理員 | 全部功能 | 預設管理帳號（admin@demo.local），可執行所有 CRUD 操作 |
| 一般使用者 | CRUD | 需先通過身分驗證後方可操作 |

### 2.4 運作環境
| 項目 | 規格 |
|:---|:---|
| 作業系統 | Windows（亦可於 Linux/macOS 運行） |
| Python 版本 | 3.13 以上 |
| 瀏覽器 | Chrome / Edge / Firefox 最新版 |
| 硬體需求 | 1 GB RAM，100 MB 磁碟空間 |

### 2.5 設計與實作限制
- 第一版已實作 Email + 密碼身分驗證（SHA-256 + SALT）
- 保留 active 欄位供未來軟刪除擴充（刪除即物理移除）
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

#### 3.1.6 FEAT_006：登入驗證
- **描述**：使用者須通過 Email + 密碼驗證後方可存取系統功能。
- **輸入**：Email、密碼
- **處理流程**：
  1. 查詢 employees 表確認帳號存在且 active=1
  2. 檢查帳戶是否在鎖定期間（locked_until > now）
  3. SHA-256 + SALT 驗證密碼雜湊
  4. 失敗 → login_attempts +1，達 5 次鎖定 15 分鐘
  5. 成功 → 清除失敗計數，建立 Session，記錄 last_login
- **安全機制**：密碼雜湊儲存、帳戶鎖定、Session 逾時、日誌記錄

#### 3.1.7 FEAT_007：安全防護
- **描述**：系統內建多層安全防護，涵蓋 OWASP Top 10 防範。
- **防護措施**：
  | 措施 | 實作 |
  |:---|:---|
  | SQL Injection 防禦 | 100% 參數化查詢（? placeholder） |
  | XSS 防禦 | Jinja2 自動轉義 + validate_input() 字元過濾 |
  | Security Headers | X-Content-Type-Options, X-Frame-Options, X-XSS-Protection |
  | 密碼儲存 | SHA-256 + SALT 雜湊（未來升級 bcrypt） |
  | 帳戶鎖定 | 5 次失敗鎖定 15 分鐘 |
  | Session 管理 | @login_required 保護所有功能路由 |
  | 審計日誌 | app.log 記錄所有 CRUD + 登入/登出 |
- **遵循標準**：數位發展部《資通系統防護基準驗證實務 v1.3》普級 (General)
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
| password_hash | TEXT | NOT NULL DEFAULT '' | 密碼雜湊 (SHA-256) |
| last_login | TEXT | — | 最後登入時間 |
| login_attempts | INTEGER | DEFAULT 0 | 登入失敗次數 |
| locked_until | TEXT | — | 帳戶鎖定截止 (ISO8601) |
| active | INTEGER | DEFAULT 1 | 啟用狀態 |
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
| 測試覆蓋 | pytest 16 項全數通過 (0.35s)，涵蓋率 100% (6/6 REQ) |

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
| 單元測試 | pytest 16/16 PASS | ✅ |
| 安全頭檢查 | Security Headers 3/3 PASS | ✅ |
| 需求追溯 | 6 項需求全追溯 (requirement_tracker.md)（requirement_tracker.md） | ✅ |
| 設計產出 | 8 項設計文件 + STRIDE 威脅模型 | ✅ |
| 文件交付 | SRS + RTM + executable_spec.yaml + test_results.md | ✅ |

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
| v1.1 | 2026-06-28 | 新增身分驗證、安全防護、STRIDE 威脅模型、資安防護基準導入、可執行規格 (SSOT) |


## 八、 資安防護基準 (Security Baseline)

> 本專案已導入 **Security-Principles** Skill（數位發展部資通安全署《資通系統防護基準驗證實務 v1.3》）。
> 完整檢核報告請參閱 `outputs/security_report_*.md`。

### 8.1 採用等級
- **預設防護等級**：中級 (Medium) — 70 項控制措施
- 普級 (58項) 與高級 (80項) 檢核亦已完成，報告可供參考

### 8.2 適用構面與對應階段

| 構面 | 適用階段 | 關鍵要求 |
|------|---------|---------|
| 存取控制 | Phase 2, 3 | 帳號管理、最小權限、遠端存取加密 |
| 事件日誌 | Phase 3, 6 | 日誌記錄、NTP校時、完整性保護 |
| 營運持續 | Phase 5, 6 | RPO/RTO、資料備份、系統備援 |
| 識別與鑑別 | Phase 2, 3 | 身分驗證、密碼策略、多因子 |
| 系統與服務獲得 | Phase 1~5 | 威脅建模、OWASP防範、SAST/DAST |
| 系統與通訊保護 | Phase 2, 3 | HTTPS/TLS、憑證管理、資料加密 |
| 系統與資訊完整性 | Phase 4, 6 | 漏洞修復、系統監控、輸入驗證 |

### 8.3 首次檢核結果 (2026-06-28)

| 等級 | 通過率 | 主要風險 |
|:---|:--:|------|
| 普級 | 8.6% | 無驗證、debug模式、弱密鑰、無HTTPS、無備份 |
| 中級 | 7.1% | +員工個資明文、無SAST、無威脅建模 |
| 高級 | 6.3% | +無SIEM、無HSM、無PQC |

### 8.4 改善路徑
1. **Phase 1**：加入 Flask-Login + 關閉 debug + HTTPS + 備份排程
2. **Phase 2**：RBAC + Session逾時 + 日誌強化 + SAST + SBOM
3. **Phase 3**：MFA + 資料加密 + SIEM + DR Plan + 第三方滲透測試
