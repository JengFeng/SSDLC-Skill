# 員工基本資料管理系統 — 系統功能規格書 (SRS)

> **文件版本**：v0.3 | **日期**：2026-07-10 | **階段**：Phase 01 重新分析
> **需求來源**：HR 需求訪談（2026-06-29）| **SSOT**：[specs/executable_spec.yaml](specs/executable_spec.yaml)
> **重分析說明**：依據使用者指示，重新由 inputs 子目錄原始需求進行分析，確認 SRS 與原始需求完整對齊
> **上次版本**：v0.2（2026-06-29 Phase 02 完成）

---

## 一、緒論

### 1.1 目的
本文件為「員工基本資料管理系統」之系統功能規格書（SRS），依據 HR 需求訪談內容撰寫，界定系統之功能需求、非功能需求、資料模型、API 介面與安全規範。供開發團隊作為設計與驗收之共同依據。

### 1.2 範圍
本系統為企業級 Web 應用程式，提供人資部門進行員工基本資料之全生命週期管理。涵蓋新進報到、異動記錄、RBAC 權限控管、AD SSO 整合、人事報表與稽核軌跡。符合台灣《個人資料保護法》規範。

### 1.3 SSOT 可執行規格
本專案採用一源多用 (SSOT) 架構，以 `specs/executable_spec.yaml` 為唯一資料源。行為規格定義於 `specs/features/requirements.feature`（Gherkin BDD）。

---

## 二、整體描述

### 2.1 產品功能摘要

| 編號 | 功能 | 優先級 | 說明 |
|:---|:---|:---|:---|
| REQ-001 | 員工主檔 CRUD | P0 | 20+ 欄位的新增/查詢/修改/刪除，含搜尋與分頁 |
| REQ-002 | 員工生命週期管理 | P0 | 調職/升遷/調薪/離職異動軌跡（Append-Only） |
| REQ-003 | 學經歷與證照管理 | P1 | 多筆學歷/經歷/證照 + 附件上傳（PDF/JPG ≤5MB） |
| REQ-004 | 員工自助服務 (ESS) | P1 | 員工自行修改聯絡欄位（手機/地址/緊急聯絡人） |
| REQ-005 | 角色權限控管 (RBAC) | P0 | 三層角色 + 欄位級 ACL |
| REQ-006 | 人事報表與統計 | P1 | 年資/部門/壽星/離職率 + Chart.js 圖表 |
| REQ-007 | 資料匯出 (Excel) | P1 | .xlsx 匯出，依角色權限遮蔽 |

### 2.2 使用者角色

| 角色 | 權限範圍 |
|:---|:---|
| 一般員工 (employee) | 檢視個人資料、修改聯絡欄位（ESS） |
| HR 專員 (hr_specialist) | 全體員工基本資料 CRUD、學經歷管理、無薪資/評核權限 |
| HR 主管 (hr_manager) | 全欄位讀寫（含薪資/評核/離職原因）、報表、稽核日誌 |
| 系統管理員 (admin) | 全權限 + 稽核日誌查詢 |

### 2.3 技術棧

| 層 | 技術 |
|:---|:---|
| 後端 | Python 3.12+ / Flask 3.x |
| 資料庫 | SQLite（WAL 模式 + 外鍵約束） |
| 前端 | Bootstrap 5 + Jinja2 SSR + Chart.js |
| 認證 | Windows AD SSO (LDAPS) + bcrypt 本機備援 |
| 加密 | AES-256 (cryptography.Fernet) |
| 測試 | pytest (API) + Playwright (UI) |

---

## 三、功能需求詳細說明

### 3.1 REQ-001：員工主檔 CRUD

- **列表頁** (`GET /`)：顯示所有員工，支援關鍵字搜尋（姓名/部門/Email）、部門與狀態篩選、分頁
- **新增** (`POST /add`)：20+ 欄位表單，含必填驗證、Email/工號唯一性檢查、機敏欄位 AES-256 加密
- **編輯** (`POST /edit/<id>`)：預填表單，支援基本資料與機敏欄位（依 RBAC）
- **檢視** (`GET /view/<id>`)：唯讀明細頁，含學經歷/證照/異動歷程子頁
- **刪除** (`POST /delete/<id>`)：軟刪除（active=false），記錄稽核日誌

### 3.2 REQ-002：生命週期管理

- 異動歷程以 `employee_history` 表儲存（Append-Only，禁止 UPDATE/DELETE）
- 支援異動類型：調職、升遷、調薪、離職、復職
- 每筆記錄含：異動前值(JSONB)、異動後值(JSONB)、原因、操作人
- 員工明細頁可查看完整異動時間軸

### 3.3 REQ-003：學經歷與證照

- 三張子表：`employee_education`、`employee_experience`、`employee_certification`
- 每項支援附件上傳（PDF/JPG/PNG，上限 5MB）
- 證照支援有效期限追蹤（過期警示）

### 3.4 REQ-004：員工自助服務 (ESS)

- **檢視個人資料**：一般員工登入後可檢視個人完整資料
- **修改聯絡欄位**：可修改非機密聯絡欄位（手機號碼、通訊地址、緊急聯絡人姓名與電話）
- **權限限制**：無法修改薪資、評核等機敏欄位
- **稽核日誌**：修改須記錄稽核日誌

#### 可修改欄位

| 欄位 | 可修改 | 說明 |
|:---|:---:|:---|
| phone_mobile | ✅ | 手機號碼 |
| address_contact | ✅ | 通訊地址 |
| emergency_contact_name | ✅ | 緊急聯絡人姓名 |
| emergency_contact_phone | ✅ | 緊急聯絡人電話 |
| emergency_contact_relation | ✅ | 緊急聯絡人關係 |
| salary | ❌ | 薪資（極機敏） |
| performance_rating | ❌ | 績效評核（極機敏） |
| leave_reason | ❌ | 離職原因（極機敏） |

#### API 端點

| 方法 | 端點 | 說明 | 權限 |
|:---|:---|:---|:---|
| GET | `/me` | 檢視個人完整資料 | 已登入 |
| PATCH | `/me` | 修改個人非機密欄位 | 已登入（限聯絡欄位） |

#### 驗收標準

| 編號 | 準則 |
|:---|:---|
| AC-ESS-01 | 一般員工可修改手機、通訊地址、緊急聯絡人 |
| AC-ESS-02 | 一般員工無法修改薪資、評核等機敏欄位 |
| AC-ESS-03 | 修改後稽核日誌於 1 秒內可見完整軌跡 |

### 3.5 REQ-005：RBAC 權控

- 三層角色繼承：employee → hr_specialist → hr_manager → admin
- API 層欄位級遮蔽：依 role 過濾回應中的機敏欄位
- 前端 UI 依角色顯示/隱藏選單項目與欄位

### 3.6 REQ-006：人事報表

| 報表 | 類型 | 篩選條件 |
|:---|:---|:---|
| 年資分佈 | 長條圖 | 部門 |
| 部門人力結構 | 圓餅圖 | — |
| 當月壽星清單 | 表格 | 月份、部門 |
| 離職率統計 | 折線圖 | 年度、月份、部門 |

---

## 四、資料庫需求

### 4.1 資料表

| 表 | 說明 | 記錄類型 |
|:---|:---|:---|
| departments | 部門主檔（支援樹狀結構） | CRUD |
| employees | 員工主檔（20+ 欄位，含加密欄位） | CRUD |
| employee_history | 異動歷程 | Append-Only |
| employee_education | 學歷 | CRUD |
| employee_experience | 工作經歷 | CRUD |
| employee_certification | 證照 | CRUD |
| audit_log | 稽核日誌 | Append-Only |

> 完整 DDL 詳見 [db_schema.sql](02_system_design/outputs/db_schema.sql)
> ER 圖詳見 [er_diagram.md](02_system_design/outputs/er_diagram.md)

---

## 五、API 介面

> 完整 API 規格詳見 [api_spec.md](02_system_design/outputs/api_spec.md)

| 群組 | 端點數 | 說明 |
|:---|:---|:---|
| 認證 | 3 | AD SSO + 本機備援登入/登出 |
| 員工 | 6 | CRUD + 列表搜尋 |
| 異動歷程 | 2 | 查詢 + 新增（不可修改刪除） |
| 學經歷/證照 | 10 | 三類子資源 CRUD |
| ESS | 2 | 個人資料檢視 + 修改 |
| 報表 | 4 | 年資/部門/壽星/離職率 |
| 匯出 | 2 | 員工清單 + 報表匯出 |
| 部門 | 2 | 列表 + 新增 |
| 稽核 | 1 | 日誌查詢 |

---

## 六、非功能需求

| 編號 | 需求 | 規格 |
|:---|:---|:---|
| NFR-001 | 個資法合規 | 台灣《個人資料保護法》完全合規 |
| NFR-002 | 資料加密 | AES-256 欄位級 + bcrypt 密碼 + TLS 1.2+ |
| NFR-003 | 稽核軌跡 | audit_log Append-Only，含帳號/時間/IP/異動前後值 |
| NFR-004 | AD SSO | LDAPS 整合 Windows AD，群組對應 RBAC 角色 |
| NFR-005 | 效能 | 單筆查詢 ≤2s，報表 ≤5s |
| NFR-006 | RWD | PC/平板/手機三斷點 |
| NFR-007 | Session 安全 | 30min 逾時，5 次失敗鎖定 15min |
| NFR-008 | 資料保留 | 離職資料保留 5 年 |

---

## 六之一、待確認事項 (Open Items)

> 最後更新：2026-07-10（使用者確認）

| 編號 | 事項 | 優先級 | 確認結果 |
|:---|:---|:---|:---|
| OI-001 | AD 連線參數（Base DN、Bind Account） | P0 | ⏳ 待 IT 確認 |
| OI-002 | 附件儲存方式 | P0 | ✅ 檔案伺服器 |
| OI-003 | 薪資系統介接 | P1 | ✅ 僅欄位管理，不介接 |
| OI-004 | 高階主管界定 | P0 | ✅ 處長以上 |
| OI-005 | 員工規模 | P1 | ✅ 小型企業（<50人） |
| OI-006 | 排班系統介接 | P2 | ✅ 不需要介接 |

---

## 七、驗收標準

| 編號 | 準則 | Gherkin 場景 |
|:---|:---|:---|
| AC-01 | HR 專員可於 1 分鐘內完成新進員工建檔 | `requirements.feature` REQ-001 場景1 |
| AC-02 | 異動後稽核日誌 1 秒內可見 | REQ-002 場景1 |
| AC-03 | 一般員工無法存取他人機敏資料 | REQ-005 場景3 |
| AC-04 | AD 網域帳號無縫登入 | NFR-004 場景1 |
| AC-05 | 主管 3 次點擊內取得報表並匯出 | REQ-006 場景1 |
| AC-06 | 手機瀏覽器可完成所有核心操作 | NFR-006 |

---

> **SSOT 參照**：[specs/executable_spec.yaml](specs/executable_spec.yaml) | [specs/features/requirements.feature](specs/features/requirements.feature)
> **追溯矩陣**：[01_planning_and_analysis/reg/requirement_tracker.md](01_planning_and_analysis/reg/requirement_tracker.md)
