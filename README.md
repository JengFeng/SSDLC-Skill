# SSDLC-Skill：AI 協作安全軟體開發生命週期框架

<p align="center">
  <strong>🏗️ Harness Engineering 駕馭工程 × 六大階段 SSDLC × 77 個 AI 協作 Skill</strong>
</p>

---

## 📌 專案概述

**SSDLC-Skill** 是一套專為 AI 協作開發設計的**安全軟體開發生命週期（Secure Software Development Lifecycle）框架**。它將軟體開發流程正規化為七個階段（一個跨階段全域共用 + 六個核心階段），每個階段都配置了專屬的 AI Skill，並透過**指令系統**與**口語觸發**讓開發者能自然地與 AI 代理協作。

本框架的核心哲學是 **Harness Engineering（駕馭工程）**：不只為了人類好操作，更為了 AI 好測試。透過一源多用（SSOT）、雙軌測試（pytest + Playwright）、以及全域連貫性大循環，確保開發過程中的需求追溯、規格一致性與品質防線。

---

## 🧩 七大開發階段

| 代碼 | 階段名稱 | 核心職責 | Skill 數量 |
|:---|:---|:---|:---|
| `00` | 跨階段全域共用 | 適用所有階段的通用工具（Git、LangGraph、DiffSync） | 3 |
| `01` | 規劃與需求分析 | 需求釐清、文件協作、提案報價、訪談記錄 | 18 |
| `02` | 系統設計 | DB Schema、ER 圖、API 規格、UI 雛型、UML 圖 | 12 |
| `03` | 開發與編碼 | AI 輔助程式碼實作、Linter、Formatter、單元測試 | 15 |
| `04` | 測試驗證 | pytest、Playwright、Cypress、SonarQube、覆蓋率 | 13 |
| `05` | 部署發布 | Ansible、Docker、Nginx 組態、SHA-256 簽章驗證 | 8 |
| `06` | 維護監控 | ELK Stack、Prometheus、OpenTelemetry、Hotfix | 8 |

> **合計 77 個 Skill**：Anthropic 官方 17 個 + Benson 自建 29 個 + GitHub 社群 31 個

---

## 🎮 指令系統

所有指令以 `@` 開頭，支援自然語言口語觸發：

| 指令 | 用途 | 範例 |
|:---|:---|:---|
| `@help` | 顯示完整指令集參照表 | `@help` |
| `@stages` | 列出七大階段代碼對照表 | `@stages` |
| `@00` ~ `@06` | 查看指定階段所有可用 Skill | `@02` |
| `@[階段]/[快捷]` | 導入單個 Skill 至專案 | `@01/03` |
| `@[階段]/[快1],[快2]` | 聯合導入多個 Skill | `@04/01,03,07` |
| `@init [路徑]` | 建立全新 SSDLC 專案目錄 | `@init ./my-app` |
| `@baseline` | 建立可獨立執行專案快照 | `@baseline` |

**自然語言觸發**：說出「顯示指令集」、「建立基線」、「執行架構優化」即可觸發對應指令。

---

## 📁 標準專案目錄結構

```
[PROJECT_ROOT]/
├── .agents/                     # 專案規章守則
│   └── AGENTS.md
├── docs/                        # 核心文件
│   ├── CORE_RULES.md            # 最高指導框架原則
│   ├── TEMPLATE_SKILL.md        # 專案範本規格書
│   └── commands_reference.md    # 指令集參照表
├── 00_cross_phase/              # 跨階段全域共用 Skill
├── 01_planning_and_analysis/    # 第一階段：規劃與需求分析
│   ├── reg/                     # 需求歷程記錄（requirement_tracker.md）
│   ├── inputs/                  # 原始需求輸入
│   └── outputs/                 # 正規化規格輸出
├── 02_system_design/            # 第二階段：系統設計
│   ├── inputs/                  # 承接 01 階段 outputs
│   └── outputs/                 # 七項標準產出（DB Schema、ER 圖、API 規格、UI 雛型、3 UML 圖）
├── 03_implementation_and_coding/ # 第三階段：開發與編碼
├── 04_testing/                  # 第四階段：測試驗證
│   ├── bug/                     # Bug 追蹤（bug_tracker.md）
│   └── outputs/                 # pytest + Playwright 測試報告
├── 05_deployment/               # 第五階段：部署發布
├── 06_maintenance/              # 第六階段：維護監控
├── baseline/                    # 可獨立執行快照（@baseline 建立，保留最近 3 份）
├── logs/                        # 全域錯誤日誌
├── snapshots/                   # 全域執行快照備份（保留最近 5 筆）
├── traceability_matrix.md       # 全域需求追溯矩陣 (RTM)
├── system_specification.md      # 系統功能規格書 SRS（IEEE 830 標準）
├── memory.md                    # 腦力激盪與對話歷程記錄
└── AGENTS.md                    # 根目錄規則引導（指向 .agents/AGENTS.md）
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

### 3. 依照階段進行開發
從口述需求 → 正規化規格 → 系統設計 → 程式碼實作 → 雙軌測試 → 部署發布 → 維護監控，每個階段都會留下完整的輸入/輸出記錄。

### 4. 建立 Baseline 快照
```
@baseline
```

---

## 🧪 Demo 專案：員工管理系統

框架內含一個完整的驗證用 demo 專案（`demo_project/`），以 **Python Flask + SQLite + Jinja2** 實作員工基本資料 CRUD 管理頁面，並通過：

- ✅ **10 項需求追溯**（requirement_tracker.md）
- ✅ **7 項設計產出**（DB Schema、ER 圖、API 規格、UI 雛型、3 UML 圖）
- ✅ **雙軌測試全數通過**：pytest（7 API 測試）+ Playwright（7 UI 測試）

---

## 🛡️ 核心設計原則

| 原則 | 說明 |
|:---|:---|
| **一源多用 (SSOT)** | 規格書即測試，需求追溯矩陣統一管理 |
| **雙軌測試** | pytest（API）+ Playwright（UI），確保後端與前端互動品質 |
| **三層規章鏈** | `AGENTS.md → .agents/AGENTS.md → docs/CORE_RULES.md` |
| **階段間交付物傳遞** | 每階段 outputs 自動成為下一階段 inputs |
| **全域連貫性大循環** | 階段產出提交前觸發跨階段交叉驗證 |
| **Mermaid UML 優先** | 所有設計圖使用 Mermaid .md 格式，可直接在瀏覽器渲染 |

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
| `.agents/` | 框架規章守則與階段 Skill 定義 |
| `skills/` | 77 個 Skill 實體（含 README.md 與歸類索引） |
| `docs/` | 核心文件（CORE_RULES、TEMPLATE_SKILL、commands_reference、Harness_Optimization_SKILL） |
| `demo_project/` | 完整驗證用示範專案（Flask + SQLite 員工管理 CRUD） |
| `external-resources/` | 外部 Skill 原始來源備份 |

---

## 📄 授權與來源

本專案為開源專案，基於以下 GitHub 開放原始碼資源進行整合與歸類：

- **Anthropic 官方 Skills**：取自 [anthropics/skills](https://github.com/anthropics/skills) 開源倉庫（17 個）
- **Anthropic 官方插件**：取自 [claude-plugins-official](https://github.com/anthropics/claude-plugins-official)（1 個）
- **Benson 自建 Skills**：取自 Benson 個人開源倉庫（29 個）  
  > ⚠️ **注意**：Benson 自建 Skill 的原始倉庫連結需經 Benson 本人授權後方可公開存取。
- **GitHub 社群 Skills**：取自各開放原始碼專案（41 個）

本框架的 SSDLC 階段架構設計與 Skill 歸類方法為原創整理成果，Skill 內容著作權歸屬各原始開源專案。

---

<p align="center">
  <sub>Built with Harness Engineering · Powered by AI Collaboration</sub>
</p>
