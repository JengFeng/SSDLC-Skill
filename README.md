# SSDLC-Skill：AI 協作安全軟體開發生命週期框架

<p align="center">
  <strong>🏗️ Harness Engineering 駕馭工程 × 六大階段 SSDLC × 94 個 AI 協作 Skill</strong>
</p>

---

## 📌 專案概述

**SSDLC-Skill** 是一套專為 AI 協作開發設計的**安全軟體開發生命週期（Secure Software Development Lifecycle）框架**。它將軟體開發流程正規化為六大核心開發階段，搭配一個跨階段全域共用層（`00`），合計 94 個 AI 協作 Skill，並透過**指令系統**與**口語觸發**讓開發者能自然地與 AI 代理協作。

本框架的核心哲學是 **Harness Engineering（駕馭工程）**：不只為了人類好操作，更為了 AI 好測試。透過一源多用（SSOT）、雙軌測試（pytest + Playwright）、安全防護基準、以及全域連貫性大循環，確保開發過程中的需求追溯、規格一致性、安全合規與品質防線。

內建 **Security-Principles 資安防護基準**，依據數位發展部資通安全署規範，涵蓋 8 大安全構面、80 項軟體控制措施與 14 項非軟體安全因子，支援普/中/高三等級檢核，將安全防護嵌入 SSDLC 各階段 PDCA 閉環，實現**安全左移（Shift Left）**。

---

## 🧩 開發階段架構

本框架包含 **六大核心開發階段**，外加一個 **跨階段全域共用層**（`00`），合計 **94 個** AI 協作 Skill。

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
| `06` | 維護與營運 | ELK Stack、Prometheus、OpenTelemetry、Hotfix |

> **合計 94 個 Skill**：Anthropic 官方 17 個 + GitHub 社群 48 個 + Anthropic 官方插件 2 個

---


---

## 🧠 上下文感知 Skill 推薦對照表

> AI 像有經驗的隊友，發現適用情境就順口問「要不要用這個？」，你可以說好、說不用、或換別的。不強迫。

---

### 📋 規劃與分析（Phase 01）

| 情境關鍵詞 | 推薦 Skill | 說明 |
|:-----------|:-----------|:-----|
| 需求模糊 / 缺口多 | `brainstorming` | 結構化腦力激盪，強制釐清模糊點 |
| 創意發想 / 探索 | `brainstorming` | 腦力激盪與創意展開 |
| 大量文件 / RFP | `langchain` | 文件分析與處理 |
| 簡報製作 | `ppt-master` | AI 原生可編輯 PPTX（圖形/動畫/圖表/語音旁白） |
| | `pptx-generator` | PptxGenJS 程式化簡報生成 |
| | `codex-ppt-skill` | GPT-Image-2 圖片式 PPT |
| | `guizang-ppt-skill` | HTML 翻頁簡報（電子雜誌風/瑞士風） ⚠️ AGPL-3.0 |
| 文件產製 | `minimax-pdf` | PDF 生成 / 填表 / 重排版 |
| | `minimax-docx` | Word 文件建立 / 編輯 / 樣板 |
| | `minimax-xlsx` | Excel 操作 / 分析 / 驗證 |

---

### 🎨 系統設計（Phase 02）

| 情境關鍵詞 | 推薦 Skill | 說明 |
|:-----------|:-----------|:-----|
| UI / 前端 / 網頁 | `frontend-design` | 前端 UI 設計規範與實作 |
| 設計系統 / 品牌規範 | `design-system` | 三層 token 架構（primitive → semantic → component） |
| | `brand-guidelines` | 品牌識別系統設計 |
| | `awesome-design-md` | 73+ 網站 DESIGN.md 設計系統參考 |
| | `open-design` | AI 設計引擎 150+ Skill 合集 |
| 配色 / 字型 / 風格 | `ui-ux-pro-max` | 84 風格 + 161 色板 + 73 字型配對即時查詢 |
| UML / 架構圖 | `mermaid` / `plantuml` | Mermaid 優先，瀏覽器直接渲染 |
| 資料庫 / API 設計 | `prisma` / `openapi_generator` | DB Schema 與 API 規格產生 |
| 多模態內容 | `minimax-multimodal-toolkit` | 影片 / 音樂 / TTS / 圖片生成 |
| 視覺效果 / Shader | `shader-dev` | GLSL 著色器技術（光追 / 流體 / 粒子） |
| 橫幅 / 封面設計 | `banner-design` | 多格式橫幅設計（22 風格） |
| 生成式藝術 | `algorithmic-art` | 生成式藝術與視覺實驗 |

---

### 💻 開發與編碼（Phase 03）

| 情境關鍵詞 | 推薦 Skill | 說明 |
|:-----------|:-----------|:-----|
| React / Next.js | `frontend-dev` | 全端前端開發（UI / 動畫 / AI 媒材） |
| Android 開發 | `android-native-dev` | Android Kotlin / Compose |
| iOS 開發 | `ios-application-dev` | iOS UIKit / SwiftUI |
| 跨平台開發 | `flutter-dev` | Flutter 跨平台 |
| React Native | `react-native-dev` | React Native / Expo |
| 全端 / 後端 | `fullstack-dev` | REST API / Auth / 即時 / DB 整合 |
| Tailwind / 響應式 | `ui-styling` | shadcn + Tailwind + 無障礙 |
| Claude API 整合 | `claude-api` | Anthropic API 使用指南 |
| MCP 伺服器 | `mcp-builder` | Model Context Protocol 建置 |
| 程式碼品質 | `eslint` / `prettier` | 語法檢查與格式化 |
| Web Artifacts | `web-artifacts-builder` | Web 元件快速產製 |

---

### 🧪 測試驗證（Phase 04）

| 情境關鍵詞 | 推薦 Skill | 說明 |
|:-----------|:-----------|:-----|
| 前端 / 瀏覽器 UI | `playwright` | 預錄腳本自動化測試 |
| API / 後端 | `pytest` | API 端點測試與回歸 |
| Bug / 測試失敗 | `systematic-debugging` | 系統性根因分析與修復 |
| 測試先行 / TDD | `test-driven-development` | 紅綠重構循環 |
| UI 驗收 / 視覺 QA | `vision-analysis` | AI 視覺分析 / UI 審查 / OCR |
| 覆蓋率分析 | `coverage_py` | Python 測試覆蓋率分析 |

---

### 🚀 部署發布（Phase 05）

| 情境關鍵詞 | 推薦 Skill | 說明 |
|:-----------|:-----------|:-----|
| 容器化 | `docker` | 容器建置與部署 |
| 自動化部署 | `ansible` | 遠端批次部署 |
| 反向代理 | `nginx_config_generator` | Nginx 組態生成 |

---

### 🔧 維護與營運（Phase 06）

| 情境關鍵詞 | 推薦 Skill | 說明 |
|:-----------|:-----------|:-----|
| 日誌分析 | `elk_stack` / `logparser` | 日誌收集與格式化 |
| 效能監控 | `prometheus_grafana` / `opentelemetry` | 指標監控與告警 |

---

### 🌐 全域共用（Phase 00）

| 情境關鍵詞 | 推薦 Skill | 說明 |
|:-----------|:-----------|:-----|
| 安全 / 資安檢核 | `Security-Principles` | 資通系統防護基準（普 / 中 / 高） |
| 簡報 / 投影片 | `slides` | HTML 簡報 + Chart.js（跨階段通用） |
| 版本控制 | `git` | Git 操作與工作流 |
| 跨格式文件轉換 | `markitdown` | PDF / Word / PPTX / Excel 轉 Markdown |
| 程式碼差異同步 | `diffsync` | 跨階段產出物差異比對 |
| 自主迭代研究 | `autoresearch` | AI 自主研究與分析 |
| 計畫撰寫 | `writing-plans` | 結構化計畫文件產製 |
| 完成前驗證 | `verification-before-completion` | 交付前完整性檢查 |


## 🎮 [指令系統](docs/commands_reference.md)

所有指令以 `@` 開頭，支援自然語言口語觸發：

| 指令 | 用途 | 範例 |
|:---|:---|:---|
| `@00` ~ `@06` | 查看指定階段所有可用 Skill（含通用 Skill G01, G02...） | `@02` |
| `@[階段]/[快捷]` | 導入單個 Skill 至專案 | `@01/03` |
| `@[階段]/[快],G[快],...` | 混搭導入階段 Skill + 通用 Skill（G 前綴） | `@02/01,G01,G03` |
| `in:` / `out:` 快速語法 | 一行定義輸入輸出（`?`=可選） | `@03 in: api_spec, ui?` |
| `@[階段]/[快1],[快2]` | 聯合導入多個 Skill | `@04/01,03,07` |
| `@baseline [--phase NN] [--project] [--latest]` | 建立可獨立執行專案快照。支援指定階段、彙整全案、自動遞增版本號 | `@baseline --phase 02` |
| `@baseline-diff [v1] [v2]` | 比對兩個 Baseline 版本的四規格差異，自動標註破壞性變更 | `@baseline-diff v1 v2` |
| `@CheckSpec` | 檢查四種規格（YAML/Feature/SRS/RTM）完整性與交叉一致性 | `@CheckSpec` |
| `@external-resource add <URL>` | 引入外部第三方 Skill（下載+登記+合規檢查） | `@external-resource add https://github.com/owner/repo` |
| `@external-resource remove <名稱>` | 移除外部第三方 Skill（清理目錄+資源清單+gitignore） | `@external-resource remove ui-ux-pro-max-skill` |
| `@external-resource list` | 列出所有外部資源清單 | `@external-resource list` |
| `@help` | 顯示完整指令集參照表 | `@help` |
| `@import-skill <skill-name>` | 將外部 Skill 匯入框架內建 Skill | `@import-skill markitdown` |
| `@import-skill-list` | 列出可匯入但尚未納入內建的外部 Skill | `@import-skill-list` |
| `@import-skill-remove <skill-name>` | 從內建 Skill 移除並回退至外部資源池 | `@import-skill-remove markitdown` |
| `@init [路徑]` | 建立全新 SSDLC 專案目錄 | `@init ./my-app` |
| `@io [phase]` | 跨階段 IO 勾稽檢查 | `@io 02` |
| `@io show [phase]` | 檢視階段 IO 檔案清單 | `@io show 03` |
| `@io set [phase]` | 互動式設定階段 IO 檔案 | `@io set 03` |
| `@io diff [A] [B]` | 比對兩個階段 IO 檔案差異 | `@io diff 02 03` |
| `@io list [phase]` | 列出各階段預設 IO 速查表 | `@io list` |
| `@optimize [--incremental] [--files]` | ⚠️ 框架建造者專用（需 `@role builder`）：執行全案關聯檢查。`--incremental` 僅檢查異動檔案（口語：「執行增量架構對齊」）；`--files` 指定檔案檢查 | `@optimize --incremental` |
| `@restore [latest\|N\|timestamp]` | 回溯工作目錄至指定快照（SHA-256 驗證 + git diff 補丁還原） | `@restore latest` |
| `@role [builder/developer]` | 切換使用者角色：`builder`（框架建造者）/ `developer`（專案開發者，預設）。💡 自我管理機制：`@init` 預設 `developer`，需調整框架時切到 `builder`，改完切回。⚠️ **四條核心規則**：① 框架歸框架（builder 只能修正框架根目錄）② 專案歸專案（專案指令不觸及框架）③ 反饋走待辦（專案發現框架問題記錄到 `待辦事項.md`）④ 目錄辨識（AI 自動掃描 `docs/` 下框架專屬檔案判斷目錄類型）。 | `@role builder` |
| `@security-check [general\|medium\|high]` | 載入資安防護基準檢核表，逐項比對並產出報告 | `@security-check medium` |
| `@security-load [等級] [構面1,構面2,...]` | 階段中途彈性導入資安防護基準，可選定構面與等級 | `@security-load medium 1,4,6` |
| `@snapshot [--phase NN] [--latest] [--project]` | 手動建立即時快照（git diff + SHA-256）。支援指定階段建立、自動遞增版本號 | `@snapshot --phase 02` |
| `@stages` | 列出六大階段代碼對照表 | `@stages` |
| `@unlock [階段代碼]` | ⚠️ 框架建造者專用（需 `@role builder`）：強制解鎖指定階段關卡 | `@unlock 03` |
| \@backup\ | 手動建立框架核心檔案備份（保留最近 5 份） | \@backup\ |
| \@guide [phase]\ | 啟動 5 關卡引導式協作（目標確認到開始執行），自動整合 IO 管理 | \@guide 02\ |
| \@guide off\ | 退出引導模式 | \@guide off\ |
| \@guide status\ | 查看引導進度 | \@guide status\ |
| \@guide next\ | 前進下一個引導步驟 | \@guide next\ |
| 指令 | 用途 | 範例 |

> **Baseline（基線）vs Snapshot（快照）**：`@baseline` 建立完整專案備份（原始碼+模板+部署腳本），是階段里程碑存檔；`@snapshot` 建立輕量快照（git diff + SHA-256），是修改前的安全記錄點。基線保留最近 3 份，快照保留最近 5 筆。



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
│   ├── reg/                                    # 需求歷程記錄區（traceability_matrix.md）
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
├── 06_maintenance/                             # 第六階段：維護與營運
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

### 0. 前置準備（首次使用必讀）

在使用任何指令之前，先在 AI 開發工具的對話視窗中輸入：
```
請先讀取根目錄下的 AGENTS.md 完成框架初始化設定
```
AI 代理讀取後即會載入本框架的指令協定、Skill 管理規則與階段關卡機制，後繼所有指令即可正常使用。

> **一次性設定**：同一個對話 session 中不需重複執行。開啟新 session 時需重新讀取。

### 1. 建立新專案
```
@init ./my-ssdlc-project
```
AI 代理會自動建立完整目錄結構，並引導你配置各階段 Skill。

> **💡 新手推薦**：`@init` 完成後 AI 代理會詢問「要啟動引導式協作嗎？」，選擇「是」即可進入 5 關卡引導流程（目標確認→輸入設定→Skill 選取→輸出定義→開始執行），自動處理 IO 設定，完全不用記指令。隨時可輸入 `@guide off` 退出。

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

### 4. （選用）定義階段輸入與輸出檔案
```
@io set 02            # 互動式設定 Phase 02 的輸入輸出內容
```
> ⚠️ **此為選用功能**。`@init` 時 AI 代理會詢問是否啟用（或透過 `@guide` 引導模式自動啟用）。啟用後只需執行 `@io set [階段]` 定義該階段的輸入需求與產出承諾即可。**不啟用也不影響開發流程**，新手可直接跳過。後續隨時可透過 `@io set` 啟用。
> 
> 其他可用指令：`@io list`（瀏覽預設 IO 速查表）、`@io [phase]`（跨階段勾稽檢查）、`@io diff [A] [B]`（兩階段 IO 差異比對），依需求選用。

### 5. 依照階段進行開發
從口述需求 → 正規化規格 → 系統設計 → 程式碼實作 → 雙軌測試 → 部署發布 → 維護與營運，每個階段都會留下完整的輸入/輸出記錄。

### 6. 建立 Baseline 快照
```
@baseline
```

---


### 7. 引導式協作（推薦新手使用）
```
@guide 02       # 從 Phase 02 開始引導
@guide          # 從當前階段開始引導
@guide status   # 查看引導進度
@guide next     # 跳到下一步
@guide off      # 關閉引導模式
```

---

## 🤖 引導式協作：使用者體驗流程

> 不確定每個階段要做什麼？讓 AI 像導遊一樣一步一步帶著你走。

```
使用者：@init ./my_project
  ↓
AI：✅ 專案建立完成！要啟動引導式協作嗎？
  ↓
使用者：好
  ↓
AI：🎯 Phase 01 — 規劃與需求分析
    這個階段的目標是釐清需求，產出結構化規格書...
    
    📥 輸入檔案：
    你目前有原始需求文件嗎？(1) 有，我來上傳  (2) 從對話整理
    ↓
使用者：1
    ↓
AI：📄 請提供 user_requirement_raw.md 的內容或路徑
    
    輸入設定完成！
    
    🔧 Skill 推薦：基於你的需求，建議導入以下 Skill...
    
    📨 輸出檔案（預設 5 項必填）：
    ✅ formal_requirements.md
    ✅ system_specification.md
    ✅ executable_spec.yaml
    ✅ requirements.feature
    ✅ traceability_matrix.md
    要調整嗎？
    ↓
使用者：不用，開始吧
    ↓
AI：🚀 Phase 01 啟動！我們從需求釐清開始...
```

## 🧪 Demo 專案：員工基本資料管理系統

框架內含一個完整的驗證用 demo 專案（`demo_project/`），以 **Python Flask + SQLite + Jinja2** 實作員工基本資料 CRUD 管理頁面，已完成 **Phase 01~04**：

- ✅ **7 項需求追溯**（REQ-001~007，適用 4 階段）+ 6 項待確認事項（OI-001~006）
- ✅ **7 項設計產出**（DB Schema、ER 圖、API 規格、UI 雛型、3 UML 圖）
- ✅ **雙軌測試全數通過**：pytest（**38 API 測試** 100% 通過）+ Playwright（**10 UI 測試** 100% 通過）
- 🔒 **安全檢核 83%**（24 項適用，20 項符合，4 項部分符合）+ OWASP 額外檢查 100% (10/10)
  - ⚠️ 4 項部分符合為非軟體缺陷或需排程功能（部署待設定憟證、帳號關閉排程等）
- 已完成 4 段 Baseline（Phase 01~04），Phase 05~06 待執行
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

### 目錄結構

| 路徑 | 用途 |
|:---|:---|
| `.agents/` | 專案規章守則（AGENTS.md）與 7 階段 Skill 定義 |
| `.github/` | GitHub 設定 |
| `.vscode/` | IDE 整合設定（tasks.json 自動化防線工作設定檔） |
| `backups/` | 框架核心檔案自動備份（@optimize 觸發，保留最近 5 份） |
| `baseline/` | 獨立可執行專案快照（run.bat + app.py + requirements.txt） |
| `demo_project/` | 完整驗證用示範專案（Flask + SQLite 員工管理 CRUD，已導入普級資安防護基準） |
| `docs/` | 核心文件（CORE_RULES、TEMPLATE_SKILL、commands_reference、Harness_Optimization_SKILL） |
| `external-resources/` | 外部 Skill 原始來源備份，含 Security-Principles 資安防護基準 |
| `logs/` | 全域錯誤日誌（A/B 類）、對話紀錄、迭代日誌 |
| `outputs/` | 跨階段安全產出強整區（SBOM、安全檢核報告、安全掃描報告） |
| `scripts/` | 框架核心工具腳本（check_spec_integrity.py 規格完整性檢查、align_framework.ps1 框架對齊引擎、generate_srs.py SRS 自動生成）+ 🔒 安全工具鏈 |
| `skills/` | 94 個 Skill 實體（含 README.md 與歸類索引，13 雙归屬） |
| `snapshots/` | 全域執行快照（snapshot_*.md + diff_*.patch，保留最近 5 筆） |
| `specs/` | 可執行規格 SSOT（executable_spec.yaml、system_specification.md） |

### 根目錄檔案

| 根目錄檔案 | 用途 |
|:---|:---|
| `.gitignore` | Git 忽略規則（排除 __pycache__、.env、*.db 等） |
| `AGENTS.md` | 專案入口規章（指向 .agents/AGENTS.md 與 docs/CORE_RULES.md） |
| `memory.md` | 全域記憶檔（開發歷程、決策記錄、Skill 建立記錄） |
| `phase_gates.json` | 階段關卡状態（各階段鎖定/完成 + security_baseline + guided_workflow） |
| `README.md` | 本檔案：專案總覽與使用說明 |
| `system_specification.md` | 系統功能規格書 SRS（IEEE 830 標準） |
| `traceability_matrix.md` | 全域需求追溯矩陣（RTM，六階段對應） |
| `待辦事項.md` | 未來需求與待辦清單 |
## 📝 近期更新記錄（2026-07-08）

### 🏗️ 架構強化

| 項目 | 說明 |
|:---|:---|
| **跨階段通用 Skill 體系** | 5 個文件產製 Skill（docx/pdf/xlsx/pptx/file-organizer）複製至 `skills/00_cross_phase/`，支援 G 前綴混搭導入（`@02/01,G01,G03`），任一階段皆可選用通用 Skill |
| **@io 階段 IO 檔案管理** | 新增 `@io show/set/list/diff` 指令體系，`io_files.yaml` 定義階段輸入輸出，支援跨階段勾稽檢查與可選啟用 |
| **活系統規格書全階段同步** | `system_specification.md` 從僅 Phase 01 更新，擴展為 6 階段全部自動同步，確保規格書隨開發進度持續生長 |
| **CORE_RULES 補強** | 補入 IO 管理機制、跨階段 Skill 層、Phase 03/06 規格同步規則，與 AGENTS.md 完全互補 |

### 🔧 功能新增

| 項目 | 說明 |
|:---|:---|
| **Phase 02 PlantUML 輸出** | 追加 4 個 `.puml` 可選輸出（ER/用例/活動/時序圖），選取 plantuml Skill 時自動雙格式產出 |
| **Phase 02 Excel Schema** | 新增 `db_schema.xlsx` 可選輸出（多 Sheet：總覽 + 各資料表欄位定義），選取 xlsx Skill 時產出 |
| **UI 雛型智慧判定** | Planner 自動判定系統類型（前端/後端/混合），決定 `ui_prototype.html` 為必填或可選 |
| **G 前綴通用 Skill 混搭** | 查詢任階段時一併顯示通用 Skill（G01~G16），支援逗號混搭導入 |
| **模板保護機制** | `.agents/skills/[phase]/SKILL.md` 框架範本受嚴格保護，Skill 合併僅發生於專案目錄 |

### 🆕 外部 Skill 新增

| 項目 | 說明 |
|:---|:---|
| **UI/UX Pro Max 技能組** | 新增 7 個設計智慧技能（ui-ux-pro-max/brand/design/design-system/ui-styling/slides/banner-design），來自 [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)（MIT v2.6.2），歸入 Phase 00/02/03 |

### 📋 維護修正

| 項目 | 說明 |
|:---|:---|
| **Phase 06 定義修正** | 從窄化的「監控」修正為完整「維護與營運」（日誌分析 + Hotfix + 回歸測試 + 監控 + BCP） |
| **UI 檢查清單通用化** | Phase 02 SKILL.md 移除 Demo 專案的特定 REQ 編號，改為通用需求類別檢查清單 |
| **AGENTS.md 結構修正** | 修正 Section 12/13 順序、@io list 浮動位置、12.3 指令表漏列 |
| **待辦事項機制** | 新增架構回饋機制，支援開發者將框架問題直接反饋至 `待辦事項.md` |
| **Baseline vs Snapshot 釐清** | 明確定義：Baseline = 完整專案存檔（階段里程碑），Snapshot = 輕量記錄點（修改前安全網） |
| **代理執行模式分析** | 記錄業界四大 AI 代理執行模式比較（Pattern A~D），現階段保留嚴格 PDCA 管線 |

## 📄 授權與來源

| 標案 | 授模 |
|:---|:---|
| SSDLC-Skill 框架本身 | MIT License |
| Security-Principles | MIT License |
| Anthropic Skills | MIT License |
| GitHub Skills | 依各 Skill 授模 |
| MiniMax Skills | MIT License |
| guizang-ppt-skill | AGPL-3.0 |
| Other External Resources | 依各 Repo 授模 |

> 詳細授模詳情請參照各 Skill 目錄下之 LICENSE 或 url.txt。
