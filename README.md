# SSDLC-Skill：AI 協作安全軟體開發生命週期框架

<p align="center">
  <strong>🏗️ Harness Engineering 駕馭工程 × 六大階段 SSDLC × 88 個 AI 協作 Skill</strong>
</p>

---

## 📌 專案概述

**SSDLC-Skill** 是一套專為 AI 協作開發設計的**安全軟體開發生命週期（Secure Software Development Lifecycle）框架**。它將軟體開發流程正規化為六大核心開發階段，搭配一個跨階段全域共用層（`00`），合計 88 個 AI 協作 Skill，並透過**指令系統**與**口語觸發**讓開發者能自然地與 AI 代理協作。

本框架的核心哲學是 **Harness Engineering（駕馭工程）**：不只為了人類好操作，更為了 AI 好測試。透過一源多用（SSOT）、雙軌測試（pytest + Playwright）、安全防護基準、以及全域連貫性大循環，確保開發過程中的需求追溯、規格一致性、安全合規與品質防線。

內建 **Security-Principles 資安防護基準**，依據數位發展部資通安全署規範，涵蓋 8 大安全構面、80 項軟體控制措施與 14 項非軟體安全因子，支援普/中/高三等級檢核，將安全防護嵌入 SSDLC 各階段 PDCA 閉環，實現**安全左移（Shift Left）**。

---

## 🧩 開發階段架構

本框架包含 **六大核心開發階段**，外加一個 **跨階段全域共用層**（`00`），合計 **88 個** AI 協作 Skill。

### 🌐 跨階段全域共用

| 代碼 | 名稱 | 核心職責 |
|:---|:---|:---|
| `00` | 跨階段全域共用 | 適用所有階段的通用工具（Git、LangGraph、DiffSync） |

### 🧩 六大核心開發階段

| 代碼 | 階段名稱 | 核心職責 |
|:---|:---|:---|
| `01` | 規劃與需求分析 | 需求釐清、文件協作、提案報價、訪談記錄 |
| `02` | 系統設計 | DB Schema、ER 圖、API 規格、UI 雛型、UML 圖 |
| `03` | 開發與編碼 | AI 輔助程式碼實作、Linter、Formatter、單元測試 |
| `04` | 測試驗證 | pytest、Playwright、Cypress、SonarQube、覆蓋率 |
| `05` | 部署發布 | Ansible、Docker、Nginx 組態、SHA-256 簽章驗證 |
| `06` | 維護監控 | ELK Stack、Prometheus、OpenTelemetry、Hotfix |

> **合計 88 個 Skill**：Anthropic 官方 17 個 + Benson 自建 28 個 + GitHub 社群 41 個 + Anthropic 官方插件 2 個

---


---

## 🧠 上下文感知 Skill 推薦對照表

> AI 像有經驗的隊友，發現適用情境就順口問「要不要用這個？」，你可以說好、說不用、或換別的。不強迫。

| 階段 | 情境關鍵詞 | 推薦 Skill | 說明 |
|:---|:---|:---|:---|
| **01 規劃** | 需求模糊/缺口多 | `grill-me` | 結構化缺口拷問，強制釐清模糊點 |
| | 創意發想/探索 | `brainstorming` | 腦力激盪與創意展開 |
| | 大量文件/RFP | `langchain` | 文件分析與處理 |
| **02 設計** | UI/前端/網頁/畫面 | `frontend-app-builder` | 高品質現代化 UI（漸層/動畫/SVG/RWD） |
| | 資料視覺化/圖表 | `build-web-data-visualization` | 圖表選擇與設計 |
| | UML/架構圖 | `mermaid` / `plantuml` | Mermaid 優先，瀏覽器直接渲染 |
| **03 開發** | React/Next.js | `react-best-practices` | 效能最佳化（memo/Suspense/Image） |
| | shadcn/ui 組件 | `shadcn` | 組件管理與樣式設計 |
| | Postgres/Supabase | `supabase-postgres-best-practices` | 查詢最佳化與索引設計 |
| | Stripe 金流 | `stripe-best-practices` | API 選擇與安全整合 |
| **04 測試** | 前端/瀏覽器 UI | `Playwright` | 預錄腳本自動化測試，高覆蓋率 |
| | API/後端 | `pytest` | API 端點測試與回歸 |
| | Bug/測試失敗 | `systematic-debugging` | 系統性根因分析與修復 |
| | 測試先行/TDD | `test-driven-development` | 紅綠重構循環 |
| **05 部署** | CI/CD 管線 | `circleci` | 自動化建置、測試、部署 |
| | Expo/App 上架 | `expo-deployment` | App Store/Play Store 發佈 |
| **06 維護** | 線上錯誤追蹤 | `sentry` | 即時錯誤監控與事件分析 |
| | 效能/瓶頸問題 | `systematic-debugging` | 根因分析與 Hotfix |
| **全域** | 安全/資安檢核 | `Security-Principles` | 資通系統防護基準（普/中/高） |

## 🎮 指令系統

所有指令以 `@` 開頭，支援自然語言口語觸發：

| 指令 | 用途 | 範例 |
|:---|:---|:---|
| `@help` | 顯示完整指令集參照表 | `@help` |
| `@stages` | 列出六大階段代碼對照表 | `@stages` |
| `@00` ~ `@06` | 查看指定階段所有可用 Skill | `@02` |
| `@[階段]/[快捷]` | 導入單個 Skill 至專案 | `@01/03` |
| `@[階段]/[快1],[快2]` | 聯合導入多個 Skill | `@04/01,03,07` |
| `@init [路徑]` | 建立全新 SSDLC 專案目錄 | `@init ./my-app` |
| `@restore [latest\|N\|timestamp]` | 回溯工作目錄至指定快照（SHA-256 驗證 + git diff 補丁還原） | `@restore latest` |
| `@baseline` | 建立可獨立執行專案快照 | `@baseline` |
| `@security-check [general\|medium\|high]` | 載入資安防護基準檢核表，逐項比對並產出報告 | `@security-check medium` |
| `@security-load [等級] [構面1,構面2,...]` | 階段中途彈性導入資安防護基準，可選定構面與等級 | `@security-load medium 1,4,6` |

**自然語言觸發**：說出「載入資安構面」「導入安全防護」、「執行資安檢核」「顯示指令集」、「建立基線」、「執行架構優化」即可觸發對應指令。

---

## 📁 標準專案目錄結構

```
[PROJECT_ROOT]/
├── .agents/                                    # 專案規章守則
│   └── AGENTS.md
├── .vscode/                                    # IDE 整合設定
│   └── tasks.json                              # VS Code 自動化防線工作設定檔
├── docs/                                       # 核心文件
│   ├── CORE_RULES.md                           # 最高指導框架原則
│   ├── TEMPLATE_SKILL.md                       # 專案範本規格書
│   ├── commands_reference.md                   # 指令集參照表
│   └── Harness_Optimization_SKILL.md           # 框架優化技能（口語觸發地毯式檢查）
├── specs/                                       # 可執行規格目錄（YAML SSOT + Gherkin .feature）
│   ├── executable_spec.yaml                    # YAML 可執行規格母版（唯一資料源）
│   └── features/                               # Gherkin .feature BDD 規格
├── 00_cross_phase/                             # 跨階段全域共用
│   ├── SKILL.md                                # 跨階段 Skill 整合定義
│   ├── inputs/                                 # 跨階段輸入區
│   └── outputs/                                # 跨階段輸出區
├── 01_planning_and_analysis/                   # 第一階段：規劃與需求分析
│   ├── SKILL.md                                # 階段 Skill 定義
│   ├── inputs/                                 # 原始需求輸入區
│   ├── reg/                                    # 需求歷程記錄區（requirement_tracker.md）
│   └── outputs/                                # 正規化規格輸出區
├── 02_system_design/                           # 第二階段：系統設計
│   ├── SKILL.md                                # 階段 Skill 定義
│   ├── inputs/                                 # 承接 01 階段 outputs
│   └── outputs/                                # 七項標準產出（DB Schema、ER 圖、API 規格、UI 雛型、3 UML 圖）
├── 03_implementation_and_coding/               # 第三階段：開發與編碼
│   ├── SKILL.md                                # 階段 Skill 定義
│   ├── inputs/                                 # 承接 02 階段 outputs
│   └── outputs/                                # 實作任務清單與單元測試輸出區
├── 04_testing/                                 # 第四階段：測試驗證
│   ├── SKILL.md                                # 階段 Skill 定義
│   ├── inputs/                                 # 承接 03 階段 outputs
│   ├── bug/                                    # Bug 追蹤（bug_tracker.md）
│   └── outputs/                                # pytest + Playwright 測試報告
├── 05_deployment/                              # 第五階段：部署發布
│   ├── SKILL.md                                # 階段 Skill 定義
│   ├── inputs/                                 # 承接 04 階段 outputs
│   └── outputs/                                # 建置產物清單與簽章報告輸出區
├── 06_maintenance/                             # 第六階段：維護監控
│   ├── SKILL.md                                # 階段 Skill 定義
│   ├── inputs/                                 # 承接 05 階段 outputs
│   └── outputs/                                # 故障分析與修補日誌輸出區
├── baseline/                                   # @baseline 建立（含階段 Baseline + 全域 Baseline，各保留最近 3 份）
├── snapshots/                                  # 全域執行快照備份（保留最近 5 筆）
├── logs/                                       # 全域日誌區（對話紀錄 + AI 調整紀錄 + 迭代日誌 + 應用程式日誌）
├── outputs/                                    # 跨階段安全產出彙整區（SBOM、安全檢核報告、安全掃描報告）
├── phase_gates.json                            # 階段關卡管控（各階段完成狀態與切換權限）
├── traceability_matrix.md                      # 全域需求追溯矩陣 (RTM)
├── system_specification.md                     # 系統功能規格書 SRS（IEEE 830 標準）
├── memory.md                                   # 腦力激盪與對話歷程記錄
└── AGENTS.md                                   # 根目錄規則引導（指向 .agents/AGENTS.md）
```

---

## 🚀 快速開始

### 1. 建立新專案
```
@init ./my-ssdlc-project
```
AI 代理會自動建立完整目錄結構，並引導你配置各階段 Skill。

### 2. 選取階段 Skill
```
@01          # 查看第一階段所有可用 Skill
@01/03       # 導入單一 Skill
@01/01,03,05 # 聯合導入多個 Skill
```

### 3. 選擇資安防護等級
```
# @init 時 AI 代理會詢問是否導入 Security-Principles
# 選定等級（普 general / 中 medium / 高 high）後，
# 安全控制措施自動嵌入各開發階段的 PDCA 閉環
```
亦可於開發中途使用 `@security-load` 彈性導入特定構面。

### 4. 依照階段進行開發
從口述需求 → 正規化規格 → 系統設計 → 程式碼實作 → 雙軌測試 → 部署發布 → 維護監控，每個階段都會留下完整的輸入/輸出記錄。

### 5. 建立 Baseline 快照
```
@baseline
```

---

## 🧪 Demo 專案：員工管理系統

框架內含一個完整的驗證用 demo 專案（`demo_project/`），以 **Python Flask + SQLite + Jinja2** 實作員工基本資料 CRUD 管理頁面，並通過：

- ✅ **10 項需求追溯**（requirement_tracker.md）
- ✅ **7 項設計產出**（DB Schema、ER 圖、API 規格、UI 雛型、3 UML 圖）
- ✅ **雙軌測試全數通過**：pytest（7 API 測試）+ Playwright（7 UI 測試）
- 🔒 **安全驗證全數通過**：登入驗證、Session 管理、帳戶鎖定、SQLi/XSS 防禦、Security Headers（nosniff/DENY/XSS）
- 🔒 **Phase 3 普級檢核 90.5%**（21 項適用，19 項符合）+ SBOM 89 組件 + 威脅模型（STRIDE）+ 12 安全產出文件

---


---

## 🛡️ 資安防護基準

本框架內建 **Security-Principles** 資安防護基準 Skill，依據數位發展部資通安全署《資通系統防護基準驗證實務 v1.3》（115 年 6 月），涵蓋 8 大安全構面，支援普/中/高三等級檢核。

### 8 大安全構面

| 構面 | 控制措施類別 | 項數 | 類型 | 主要適用階段 |
|------|------------|:--:|:--:|------------|
| 1. 存取控制 | 帳號管理、最小權限、遠端存取 | 14 | 軟體 | Phase 2 + Phase 3 |
| 2. 事件日誌與可歸責性 | 記錄事件、日誌內容、校時、保護 | 13 | 軟體 | Phase 3 + Phase 6 |
| 3. 營運持續計畫 | 資料備份、系統備援 | 8 | 軟體 | Phase 5 + Phase 6 |
| 4. 識別與鑑別 | 使用者識別、身分驗證管理 | 12 | 軟體 | Phase 2 + Phase 3 |
| 5. 系統與服務獲得 | SSDLC 全階段、威脅建模、OWASP | 19 | 軟體 | Phase 1~5 |
| 6. 系統與通訊保護 | TLS/HTTPS、憑證管理、資料加密 | 9 | 軟體 | Phase 2 + Phase 3 |
| 7. 系統與資訊完整性 | 漏洞修復、系統監控、輸入驗證、稽核 | 22 | 軟體 | Phase 4 + Phase 6 |
| 8. 組織/實體/供應鏈 | 人力、證照、ISO 27001、機房、委外 | 14 | 非軟體 | 專案啟動前 + Phase 5 |

### 層次全景圖

```
┌──────────────────────────────────────────┐
│  組織管理面                                │
│  人力配置 / 教育訓練 / 專業證照 /           │
│  內部稽核 / 治理成熟度                     │
├──────────────────────────────────────────┤
│  管理制度面                                │
│  ISO 27001 導入驗證 / BCP 演練 /           │
│  危害國家資通安全產品限制                  │
├──────────────────────────────────────────┤
│  SSDLC 軟體開發層（構面 1-7）              │
│  80 項控制措施，嵌入 PDCA 閉環             │
│  存取控制 / 日誌 / 備援 / 驗證 /           │
│  安全獲得 / 通訊保護 / 完整性              │
├──────────────────────────────────────────┤
│  實體環境面                                │
│  機房門禁 / 環境監控 / 媒體銷毀            │
├──────────────────────────────────────────┤
│  供應鏈面                                  │
│  委外廠商評鑑 / 第三方安全檢測             │
└──────────────────────────────────────────┘
```

### 三等級檢核

| 等級 | 檢核表檔案 | 軟體措施 | 適用場景 |
|------|----------|:--:|------|
| 普 (General) | `assets/checklist_general.md` | 58 項 | C 級機關、一般系統 |
| 中 (Medium)  | `assets/checklist_medium.md`  | 70 項 | B 級機關、核心系統 |
| 高 (High)    | `assets/checklist_high.md`    | 80 項 | A 級機關、關鍵基礎設施 |

> **控制措施數量說明**：軟體控制措施總數 80 項，依據數位發展部資通安全署《資通系統防護基準驗證實務 v1.3》第 4 頁原文：「7 個構面、27 類控制措施類別之 **80 項控制措施**」。三等級採累進式設計，非軟體因子 14 項為獨立補充，不計入軟體總數。

### 雙軌運作模式

| 模式 | 指令 | 說明 |
|------|------|------|
| **主動融入** | `@init` 時選用 | 依選定等級將安全控制措施直接嵌入各 SSDLC 階段 PDCA 閉環（安全左移） |
| **事後稽核** | `@security-check <等級>` | 階段完成後逐項比對檢核，產出符合/不符合報告 |
| **彈性導入** | `@security-load <等級> <構面>` | 階段中途導入，可選定特定構面與等級 |

### 非軟體面向安全因子（構面 8）

以下項目不屬於 SSDLC 軟體開發範圍，但為資通系統必要的外部安全前提：

| 面向 | 項目數 | 內容 |
|------|:--:|------|
| 組織管理 | 6 項 | 資安專責人員、教育訓練、專業證照、內部稽核、治理成熟度 |
| 管理制度 | 3 項 | ISO 27001 驗證、BCP 演練、危害國家資通安全產品限制 |
| 實體環境 | 3 項 | 機房門禁、環境監控、媒體銷毀 |
| 供應鏈 | 2 項 | 委外廠商評鑑、第三方安全檢測 |

### 來源文件

原始 PDF 文件存放於 `external-resources/Security-Principles/references/source/`：

| 檔案 | 來源 |
|------|------|
| 資通系統防護基準驗證實務 v1.3 | 國家資通安全研究院（169 頁） |
| 附件1_資通系統防護基準檢核表 v1.3 | 數位發展部資通安全署（27 頁） |
| 資安稽核與個資防護手冊 | 臺北市政風處（44 頁） |
| 資訊使用管理稽核項目表 | 臺北市政府（3 頁） |

## 🛡️ 核心設計原則

| 原則 | 說明 |
|:---|:---|
| **一源多用 (SSOT)** | 規格書即測試，需求追溯矩陣統一管理 |
| **雙軌測試** | pytest（API）+ Playwright（UI），確保後端與前端互動品質 |
| **三層規章鏈** | `AGENTS.md → .agents/AGENTS.md → docs/CORE_RULES.md` |
| **階段間交付物傳遞** | 每階段 outputs 自動成為下一階段 inputs |
| **全域連貫性大循環** | 階段產出提交前觸發跨階段交叉驗證 |
| **Mermaid UML 優先** | 所有設計圖使用 Mermaid .md 格式，可直接在瀏覽器渲染 |
| **安全左移 (Shift Left)** | 資安防護基準於設計階段即嵌入，非事後補檢 |

---

## ⚠️ 防呆與安全機制

- **@optimize**：限框架建造者使用，執行前強制顯示警告提示
- **專案初始化防呆**：未初始化目錄下禁止導入 Skill，提示先執行 `@init`
- **Git 安全網**：導入 Skill 前自動檢查工作區狀態，必要時建立暫存 baseline
- **重複導入防護**：同名 Skill 提示覆蓋或放棄

---


## 📂 倉庫結構

| 路徑 | 用途 |
|:---|:---|
| `.agents/` | 專案規章守則（AGENTS.md）與 7 階段 Skill 定義 |
| `.vscode/` | IDE 整合設定（tasks.json 自動化防線工作設定檔） |
| `baseline/` | 獨立可執行專案快照（run.bat + app.py + requirements.txt） |
| `demo_project/` | 完整驗證用示範專案（Flask + SQLite 員工管理 CRUD，已導入普級資安防護基準） |
| `docs/` | 核心文件（CORE_RULES、TEMPLATE_SKILL、commands_reference、Harness_Optimization_SKILL） |
| `external-resources/` | 外部 Skill 原始來源備份，含 Security-Principles 資安防護基準 |
| `logs/` | 全域錯誤日誌（A/B 類）、對話紀錄、迭代日誌 |
| `outputs/` | 跨階段安全產出彙整區（SBOM、安全檢核報告、安全掃描報告，@init 時於專案內建立） |
| `scripts/` | 輔助腳本（generate_srs.py、generate_checklist.py）+ 🔒 安全工具鏈 |
| `skills/` | 88 個 Skill 實體（含 README.md 與歸類索引） |
| `snapshots/` | 全域執行快照（snapshot_*.md + diff_*.patch，保留最近 5 筆） |
| `specs/` | 可執行規格 SSOT（executable_spec.yaml、system_specification.md） |

| 根目錄檔案 | 用途 |
|:---|:---|
| `.gitignore` | Git 忽略規則（排除 __pycache__、.env、*.db 等） |
| `AGENTS.md` | 專案入口規章（指向 `.agents/AGENTS.md` 與 `docs/CORE_RULES.md`） |
| `memory.md` | 全域記憶檔（開發歷程、決策記錄、Skill 建立記錄） |
| `phase_gates.json` | 階段關卡狀態（各階段鎖定/完成 + security_baseline 安全區塊） |
| `README.md` | 本檔案：專案總覽與使用說明 |
| `system_specification.md` | 系統功能規格書 SRS（IEEE 830 標準） |
| `traceability_matrix.md` | 全域需求追溯矩陣（RTM，六階段對應） |## 📄 授權與來源

本專案為開源專案，基於以下 GitHub 開放原始碼資源進行整合與歸類：

- **Anthropic 官方 Skills**：取自 [anthropics/skills](https://github.com/anthropics/skills) 開源倉庫（17 個）
- **Anthropic 官方插件**：取自 [claude-plugins-official](https://github.com/anthropics/claude-plugins-official)（2 個）
- **Benson 自建 Skills**：取自 Benson 個人開源倉庫（28 個）  
  > ⚠️ **注意**：Benson 自建 Skill 的原始倉庫連結需經 Benson 本人授權後方可公開存取。
- **GitHub 社群 Skills**：取自各開放原始碼專案（41 個）

本框架的 SSDLC 階段架構設計與 Skill 歸類方法為原創整理成果，Skill 內容著作權歸屬各原始開源專案。

---

<p align="center">
  <sub>Built with Harness Engineering · Powered by AI Collaboration</sub>
</p>


