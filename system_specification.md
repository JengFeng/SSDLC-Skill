# 系統功能規格書 (SRS) — 範本

> 依據 IEEE 830 標準格式。專案初始化後由 AI 代理依實際專案內容自動填入。

---

## 一、 緒論 (Introduction)

### 1.1 目的
<專案初始化後自動填入：本規格書旨在界定 {系統名稱} 之功能與非功能需求，供甲乙雙方作為驗收依據。>

### 1.2 範圍
<專案初始化後自動填入：系統邊界與涵蓋範圍。>

### 1.3 名詞定義
| 術語 | 定義 |
|:---|:---|
| <專案初始化後自動填入> | <專案初始化後自動填入> |

### 1.4 參考文件
| 文件 | 路徑 |
|:---|:---|
| 需求追溯矩陣 | `traceability_matrix.md` |
| 需求追蹤表 | `01_planning_and_analysis/reg/requirement_tracker.md` |
| 測試報告 | `04_testing/outputs/test_results.md` |

---

## 二、 整體描述 (Overall Description)

### 2.1 產品觀點
<專案初始化後自動填入：系統架構、技術棧、部署模式。>

### 2.2 產品功能摘要
| 功能編號 | 功能名稱 | 優先級 | 說明 |
|:---|:---|:---|:---|
| <專案初始化後自動填入> |

### 2.3 使用者特性
| 角色 | 權限 | 說明 |
|:---|:---|:---|
| <專案初始化後自動填入> |

### 2.4 運作環境
<專案初始化後自動填入：OS、硬體、瀏覽器、相依套件。>

### 2.5 設計與實作限制
<專案初始化後自動填入：技術限制、架構決策。>

---

## 三、 具體需求 (Specific Requirements)

### 3.1 功能需求詳細說明
> 專案初始化後，每個 FEAT 包含：描述、輸入、處理流程、輸出、例外處理、成功/錯誤訊息。

### 3.2 外部介面需求
> 使用者介面 (UI) + API 端點規格。

### 3.3 資料庫需求
> ER 圖 + Schema DDL + 資料表欄位定義。

### 3.4 非功能需求
> 可用性、可靠性、可維護性、日誌審計、測試覆蓋。

### 3.5 安全性需求
> 驗證規則、防呆機制、資料保護措施。

---

## 四、 UML 系統模型

| 圖型 | 檔案路徑 | 說明 |
|:---|:---|:---|
| 用例圖 | [use_case_diagram.md](02_system_design/outputs/use_case_diagram.md) | <專案初始化後自動填入> |
| 活動圖 | [activity_diagram.md](02_system_design/outputs/activity_diagram.md) | <專案初始化後自動填入> |
| 循序圖 | [sequence_diagram.md](02_system_design/outputs/sequence_diagram.md) | <專案初始化後自動填入> |
| ER 圖 | [er_diagram.md](02_system_design/outputs/er_diagram.md) | <專案初始化後自動填入> |

---

## 五、 驗收標準

| 項目 | 標準 | 狀態 |
|:---|:---|:---|
| API 測試 | pytest 全數通過 | <專案初始化後自動填入> |
| UI 測試 | Playwright 全數通過 | <專案初始化後自動填入> |
| 需求追溯 | 全數需求已追溯 | <專案初始化後自動填入> |
| 設計產出 | 七項標準設計文件 | <專案初始化後自動填入> |

---

## 六、 附錄

### A. 文件架構索引
```
[PROJECT_ROOT]/
├── system_specification.md          ← 本文件（SRS）
├── traceability_matrix.md           ← RTM
├── 01_planning_and_analysis/reg/requirement_tracker.md
├── 02_system_design/outputs/        ← 7 項設計產出
├── 04_testing/outputs/test_results.md
└── 04_testing/bug/bug_tracker.md
```

### B. 變更紀錄
| 版本 | 日期 | 變更內容 |
|:---|:---|:---|
| v1.0 | <日期> | 初版 SRS |


## 八、 資安防護基準 (Security Baseline) — 範本

> 本專案支援 **Security-Principles** Skill（數位發展部資通安全署《資通系統防護基準驗證實務 v1.3》）。
> 專案初始化後，由 `@init` 流程詢問是否導入，選定等級後自動填入本節。

### 8.1 採用等級
<專案初始化後自動填入：general / medium / high>

### 8.2 適用構面與對應階段

| 構面 | 適用階段 | 關鍵要求 |
|------|---------|---------|
| 存取控制 | Phase 2, 3 | 帳號管理、最小權限、遠端存取加密 |
| 事件日誌 | Phase 3, 6 | 日誌記錄、NTP校時、完整性保護 |
| 營運持續 | Phase 5, 6 | RPO/RTO、資料備份、系統備援 |
| 識別與鑑別 | Phase 2, 3 | 身分驗證、密碼策略、MFA |
| 系統與服務獲得 | Phase 1~5 | 威脅建模、OWASP、SAST/DAST |
| 系統與通訊保護 | Phase 2, 3 | HTTPS/TLS、憑證管理、資料加密 |
| 系統與資訊完整性 | Phase 4, 6 | 漏洞修復、系統監控、輸入驗證 |

### 8.3 檢核方式
- 初始化：`@init` → 選定等級 → `generate_checklist.py <等級>` → 寫入 `outputs/`
- 階段中途：`@security-check <等級>` → 載入檢核表 → 逐項比對 → 產出 `security_check_report.md`
- 口語觸發：「執行資安檢核」「資通安全稽核」
