# 員工基本資料管理系統 — AI 代理開發規則 (AGENTS.md)

> **專案**：員工基本資料管理系統（Employee HR Management System）
> **技術棧**：Python 3.12+ / Flask 3.x / SQLite / Bootstrap 5 / Chart.js
> **部署**：本機 Flask 開發伺服器（`http://localhost:5000`）
> **SSDLC 狀態**：全部 6 階段已完成 ✅

本文件定義本專案在 SSDLC 開發生命週期中，各 AI 代理（Planner、Generator、Evaluator）必須嚴格遵守的行為準則。

---

## 一、全局連貫性工程規範

本專案採用「外層全域 Agent + 內層階段 PDCA 迴圈」雙層架構。

### 1.1 外層：全域主控 Global Agent

- **全域掌控**：負責 SSDLC 六階段的全域需求追溯、規格同步、版本同步。
- **階段切換**：每階段驗證穩定後，封存 Baseline。前一階段產生 Baseline 方可進入下一階段。
- **SSOT 完整性檢查**：
  1. 階段完成後 → 執行交叉一致性檢查
  2. 進入下一階段前 → 執行追溯鏈完整性檢查
  3. 若檢查異常 → 產出報告，詢問使用者「退回修正」或「直接放行」
  4. 檢查通過後 → 寫入 `phase_gates.json`（`ssot_integrity_checked: true`）

### 1.2 內層：六階段 PDCA 閉環

每一階段獨立執行 Plan → Generator → Evaluator：

| 角色 | 職責 |
|:---|:---|
| **Planner** | 承接上階段交付物，定義目標與交付物，執行 Skill 選取與衝突檢核 |
| **Generator** | 唯一執行層，遵循「只執行、不判斷、不檢查、不修改」鐵律 |
| **Evaluator** | 成果規格檢核、流程軌跡完整性檢核、自動化測試驗證 |

---

## 二、規格書同步與 SSOT 規範

### 2.1 三軌規格架構

| 軌道 | 檔案 | 格式 | 讀者 |
|:---|:---|:---|:---|
| 結構化可執行規格 | `specs/executable_spec.yaml` | YAML | AI |
| 行為化可執行規格 | `specs/features/requirements.feature` | Gherkin | AI |
| 人可讀系統規格書 | `system_specification.md` | Markdown | 人類 |

### 2.2 階段銜接機制 (spec_ref.md)

- 每個階段的 `inputs/` 目錄必須包含 `spec_ref.md`，記錄本階段必讀的 SSOT 規格路徑。
- AI 代理執行前必須先讀取 `spec_ref.md` 中列出的所有規格。
- 未讀取即執行者 → Evaluator 判定為 B 類錯誤。

### 2.3 SSOT 完整性檢查點

| 檢查點 | 時機 | 檢查內容 |
|:---|:---|:---|
| **A** | 階段啟動時 | spec_ref.md 指向的檔案是否存在、YAML 有效性、Feature 場景數一致 |
| **B** | 階段完成時 | 產出與 SSOT 定義的需求/API/資料模型一致、Mermaid 語法正確 |
| **C** | 跨階段交接時 | spec_ref.md 存在、追溯鏈完整 |
| **D** | Git 提交前 | 規格完整性掃描、executable_spec.yaml vs 目錄結構 |

---

## 三、版本管控與組態管理

### 3.1 Git 規範

- 所有開發在非 `main` 分支上進行，禁止直接推送 `main`。
- 每次提交確保 `traceability_matrix.md` 狀態最新。
- 階段交接或發布時建立 `git tag`（格式 `baseline-vX.Y.Z`）。

### 3.2 本機快照與備份

- 快照存放於各階段 `snapshots/`，保留最近 5 筆，自動清理舊資料。
- 資料庫備份存放於 `06_maintenance/outputs/backups/`，保留最近 30 份。
- 備份腳本：`python 06_maintenance/outputs/backup.py`

---

## 四、代理基本行為守則

### 4.1 Planner（規劃代理）

- 任何需求變更或 Bug 修復，必須先更新規格書並產出任務清單。
- 規劃時明確定義「系統不做什麼」，防止生成冗餘程式碼。

### 4.2 Generator（執行代理）

- 嚴格依照任務清單與規格進行開發，禁止擅自修改系統架構。
- 最小變更原則：僅修改與任務相關的程式碼，禁止重構無關模組。
- 完成後自動呼叫驗證指令。

### 4.3 Evaluator（審查代理）

- 客觀且挑剔地逐條對照規格與品質。評分未達標者一律退回。
- 只審查，不改稿。

---

## 五、錯誤分級與重試機制

| 類型 | 定義 | 處理 |
|:---|:---|:---|
| **A 類** | 執行層臨時錯誤（參數錯誤、逾時、連線中斷、DOM 找不到元素） | 局部重試最多 3 次，指數退避。滿 3 次升級為 B 類 |
| **B 類** | 規劃層根源錯誤（需求矛盾、設計缺陷、架構問題） | 全域迭代（重跑完整 PDCA），上限 2 輪。滿 2 輪自動暫停、移交人工 |

---

## 六、專案特有規範

### 6.1 技術棧約束

- **後端**：Python 3.12+ / Flask 3.x（禁止擅自更換框架）
- **資料庫**：SQLite（WAL 模式 + 外鍵約束）— 禁止改用其他資料庫除非需求明確變更
- **前端**：Bootstrap 5 + Jinja2 SSR + Chart.js（禁止引入 React/Vue 等重型框架除非需求明確）
- **認證**：本機備援 bcrypt 登入 + AD SSO stub（待部署後設定 LDAPS）
- **加密**：AES-256 Fernet（`crypto_utils.py`），金鑰存放於 `.env`
- **測試**：pytest（API）+ Playwright（UI）

### 6.2 資料庫操作規範

- 所有 SQL 使用 `?` 佔位符（參數化查詢），嚴禁字串拼接。
- `employee_history` 與 `audit_log` 為 Append-Only，僅允許 INSERT，禁止 UPDATE/DELETE。
- 機敏欄位（身分證、生日、地址、薪資、銀行帳號）必須經 AES-256 加密後儲存。
- 連線管理：每執行緒獨立 `sqlite3.connect()`，WAL 模式。

### 6.3 安全規範

- **登入安全**：5 次失敗鎖定 15 分鐘、Session 30 分鐘逾時
- **RBAC**：四層角色（employee / hr_specialist / hr_manager / admin），API 層欄位級遮蔽
- **CSP 標頭**：`default-src 'self'; script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; font-src 'self' https://cdn.jsdelivr.net; img-src 'self' data:`
- **資安防護基準**：普級 (general)，檢核表 `external-resources/Security-Principles/assets/checklist_general.md`

### 6.4 目錄結構

```
myPrj/
├── AGENTS.md                    # 引導檔 → .agents/AGENTS.md
├── .agents/AGENTS.md            # ⬅ 本檔案（AI 代理必讀）
├── phase_gates.json             # 階段關卡狀態
├── system_specification.md      # 系統規格書（SSOT）
├── traceability_matrix.md       # 需求追溯矩陣
├── memory.md                    # 專案記憶/對話歷程
├── specs/                       # 可執行規格
│   ├── executable_spec.yaml
│   └── features/requirements.feature
├── 01_planning_and_analysis/    # 需求分析
├── 02_system_design/            # 系統設計
├── 03_implementation_and_coding/# 實作編碼（主程式目錄）
│   └── outputs/
│       ├── app.py               # Flask 主應用
│       ├── models.py            # SQLite 資料庫操作層
│       ├── config.py            # 組態設定
│       ├── crypto_utils.py      # AES-256 加解密
│       ├── db_init.py           # 資料庫初始化
│       ├── templates/           # Jinja2 模板（11 頁）
│       ├── .env                 # 環境變數（🔒 含加密金鑰）
│       ├── run.bat              # Windows 啟動腳本
│       ├── start.sh             # Linux/Mac 啟動腳本
│       └── hr_system.db         # SQLite 資料庫
├── 04_testing/                  # 測試驗證
├── 05_deployment/               # 部署
│   └── outputs/deployment_guide.md
└── 06_maintenance/              # 維護
    └── outputs/
        ├── operations_manual.md
        ├── create_admin.py
        ├── backup.py
        └── health_check.py
```

### 6.5 常用指令

| 操作 | 指令 |
|:---|:---|
| 啟動系統 | `run.bat`（Win）/ `./start.sh`（Linux/Mac） |
| 初始化資料庫 | `python db_init.py` |
| 建立管理員 | `python 06_maintenance/outputs/create_admin.py` |
| 備份資料庫 | `python 06_maintenance/outputs/backup.py` |
| 健康檢查 | `python 06_maintenance/outputs/health_check.py` |
| 規格完整性檢查 | `python scripts/check_spec_integrity.py --mode S` |

---

## 七、上下文管理紀律

1. **階段完成後重置上下文**：每個模組或階段任務完成後，立即重置對話上下文。
2. **重置後重新讀取**：必須強制重新讀取本 `AGENTS.md`。
3. **變更前建立基準**：進行任何程式碼或規格變更前，先建立 Baseline。驗證失敗且無法立即修復時，5 分鐘內完全還原。
4. **最小上下文原則**：每次對話僅載入與當前任務相關的檔案，避免多餘資訊干擾。

---

> 📌 **規章版本**：v1.0 | **最後更新**：2026-06-29 | **適用專案**：員工基本資料管理系統 (myPrj)
