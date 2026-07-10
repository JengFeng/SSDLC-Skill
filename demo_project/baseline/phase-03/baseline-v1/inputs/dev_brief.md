# 開發交接簡報 (Dev Brief)

> 日期：2026-06-29 | 專案：員工基本資料管理系統
> 階段：Phase 01-04 已完成，Phase 03 開發目錄供工程師接手

---

## 一、專案概述

企業內部 Web 應用，提供人資部門進行員工基本資料的全生命週期管理。含 AD SSO 整合、RBAC 三層權控、AES-256 加密、稽核軌跡。

## 二、技術棧

| 層 | 技術 |
|:---|:---|
| 後端 | Python 3.12+ / Flask 3.x |
| 資料庫 | PostgreSQL 16（pgcrypto + pgAudit） |
| 前端 | Bootstrap 5 + Jinja2 SSR + Chart.js |
| 認證 | Windows AD SSO (LDAPS) + bcrypt 本機備援 |
| 加密 | AES-256 (cryptography.Fernet) |
| 測試 | pytest (API) + Playwright (UI) |

## 三、本目錄已彙整文件

| # | 檔案 | 來源 | 用途 |
|:---|:---|:---|:---|
| 1 | `formal_requirements.md` | Phase 01 | 7 FR + 8 NFR 正規化需求 |
| 2 | `requirement_tracker.md` | Phase 01 | 需求追溯矩陣（Phase 01-04 已追溯） |
| 3 | `user_requirement_raw.md` | Phase 01 | HR 訪談原始紀錄 |
| 4 | `executable_spec.yaml` | SSOT | YAML 唯一資料源（7 REQ + 接受準則） |
| 5 | `requirements.feature` | SSOT | Gherkin BDD 規格（8 Feature × 20 Scenario） |
| 6 | `system_specification.md` | SSOT | 人讀 SRS 規格書（7 章） |
| 7 | `design_brief.md` | Phase 02 | 10 項核心設計決策 + 架構圖 |
| 8 | `db_schema.sql` | Phase 02 | PostgreSQL DDL（7 張表 + Trigger + 預設資料） |
| 9 | `er_diagram.md` | Phase 02 | Mermaid ER 圖（6 實體完整欄位） |
| 10 | `api_spec.md` | Phase 02 | 19+ API 端點規格（RBAC 遮蔽範例） |
| 11 | `use_case_diagram.md` | Phase 02 | PlantUML + Mermaid 用例圖（3 角色 × 15 案例） |
| 12 | `activity_diagram.md` | Phase 02 | PlantUML + Mermaid 活動圖（5 組流程） |
| 13 | `sequence_diagram.md` | Phase 02 | PlantUML + Mermaid 時序圖（4 組時序） |
| 14 | `ui_prototype.html` | Phase 02 | Bootstrap 5 RWD 雛形（10 畫面） |

## 四、已完成的程式碼（`../outputs/`）

| 檔案 | 說明 |
|:---|:---|
| `app.py` | Flask 主應用（35+ 路由、RBAC 裝飾器、Security Headers） |
| `config.py` | 環境變數設定 |
| `models.py` | 資料庫操作層（100% 參數化查詢） |
| `crypto_utils.py` | AES-256 加解密 + 遮蔽工具 |
| `db_init.py` | 資料庫初始化腳本 |
| `run.bat` | Windows 啟動腳本 |
| `requirements.txt` | Python 依賴清單 |
| `templates/` | 10 個 Jinja2 模板 |

## 五、功能需求對照

| REQ | 功能 | API 端點 | 關鍵檔案 |
|:---|:---|:---|:---|
| REQ-001 | 員工 CRUD | `GET/POST/PUT/DELETE /employees` | `models.py:employee_*()` |
| REQ-002 | 生命週期 | `GET/POST /employees/:id/history` | `models.py:history_*()` |
| REQ-003 | 學經歷/證照 | `/employees/:id/education|experience|certifications` | `models.py:_sub_*()` |
| REQ-004 | ESS 自助 | `GET/PATCH /me` | `app.py:ess_page()` |
| REQ-005 | RBAC 權控 | `@require_role` 裝飾器 | `app.py:filter_sensitive()` |
| REQ-006 | 人事報表 | `/reports/*` | `models.py:report_*()` |
| REQ-007 | Excel 匯出 | `/export/*` | `app.py:api_export_*()` |

## 六、待辦 / 已知限制

| 項目 | 說明 |
|:---|:---|
| AD SSO | 目前為 Stub（`/login/ad`），需 IT 提供 LDAPS 參數後整合 `ldap3` 套件 |
| 附件儲存 | 上傳 API 待實作（需確認 NAS/檔案伺服器路徑） |
| 資料庫 | 需先執行 `db_init.py` 建立 PostgreSQL 結構 |
| 加密金鑰 | 需產生 Fernet key：`python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |
| 測試執行 | `pytest test_employee_crud.py -v` / `pytest test_ui.py -v --browser chromium` |

## 七、快速啟動

```bash
# 1. 設定環境變數
cp .env.example .env
# 編輯 .env 填入 DB 密碼與加密金鑰

# 2. 安裝依賴
pip install -r requirements.txt

# 3. 初始化資料庫
python db_init.py

# 4. 啟動應用
python app.py
# 瀏覽器開啟 http://127.0.0.1:5000
```
