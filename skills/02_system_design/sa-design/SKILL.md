---
name: sa-design
description: |
  系統分析設計（SA/SD）— SDLC 接在「雛形」之後，把需求或雛形畫面變成工程師可直接開發的系統設計。**只要使用者要做系統設計，或說**「系統分析」「做 SA」「SA/SD」「ER Model／ER 圖」「資料模型／資料庫設計／資料表設計／資料字典」「系統架構圖」「API spec／API 設計」「把雛形變系統設計」「需求轉規格」「SRS／軟體需求規格書」「整套系統開發文件」「這個畫面後端怎麼設計」**，就務必啟用本 skill**（即使沒明講「SA」，把畫面或需求轉成可開發規格也算）。特色：吃得下 bootstrap-ui 的雛形 HTML，從表單欄位／表格／按鈕反推資料模型與 API。核心產出＝一份暖色 HTML 的 SA 系統分析設計（ER／資料字典／系統架構圖／API spec）；可按需擴成完整可送審文件套件（功能規格/畫面規格/WBS/測試/SRS整合/文件健檢＋開發任務看板），逐份生成、逐份確認。範圍閘清單、逐份 SOP、渲染腳本見 SKILL.md 內文與 references/srs-and-cross-audit.md。
---

# sa-design — 系統分析設計（SA/SD）

> 你給「雛形畫面」或「一段需求」→ 我產出工程師能直接開發的 SA 系統分析設計：ER Model、資料字典、系統架構圖、API spec，組成一份暖色 HTML SA 文件。
> 方法論見 `references/methodology.md`；mermaid 範本見 `references/mermaid-patterns.md`；資料字典/API 格式見 `references/output-templates.md`。

---

## 一、定位：SDLC 接在「雛形」之後

```
需求／提案 → 🖼️ 雛形(bootstrap-ui) → 🧩 系統分析(本 skill) → 👷 開發(project-dev-manager/eip-item-builder) → 🧪 測試(service-sqa) → 📄 交付(workplan-doc)
```

- **雛形**回答「畫面長怎樣」；**系統分析**回答「畫面背後 → 資料怎麼存(ER)、系統怎麼搭(架構)、前後端怎麼接(API)」。
- **核心特色 = 從雛形反推**：吃 bootstrap-ui 產的 HTML，從表單欄位 → 資料表欄位、從表格/清單 → 實體、從按鈕/操作 → API 端點。這就是「延續性」—— 不從零開始，接著雛形做。

---

## ★ 範圍閘：列出文件清單給使用者「勾選」（不要自己二選一，也不要不問就全產）

> 接案第一件事：**把下面這份「可產文件清單」攤給使用者，問「要產哪幾份？」讓他挑。** 別自作主張只生一份、也別不問就全產。

**可產文件清單（讓使用者勾選）：**

| # | 檔案 | 內容 | 依賴 |
|---|------|------|------|
| 03 | `03_SA系統分析設計.html` | ER Model／資料字典／系統架構圖／API spec ＋狀態圖（**地基，其他多依賴它**） | 雛形/需求 |
| 04 | `04_功能規格書.html` | FN/FS＋Use Case 四段＋輸入欄位表（功能卡帶 `id=FS` 錨點） | 03 |
| 05 | `05_畫面規格書.html` | 逐畫面逐元素＋元素→API→欄位（畫面卡帶 `id=SCR` 錨點） | 03＋雛形 |
| 06 | `06_開發任務拆解WBS.html` | 階段／任務／人天／相依／里程碑 | 04 |
| 07 | `07_測試計畫.html` | 測試策略／範圍／類型／進入退出準則 | 04 |
| 08 | `08_測試案例.html` | 逐 FS 測試案例（功能/邊界/權限/例外），TC 連 04 | 04 |
| 09 | `09_驗收文件.html` | UAT 情境＋三方驗收簽核表 | 08 |
| 00b | `00b_軟體需求規格書SRS.html` | 依機關查檢表整合 01/03/04/05 為送審 SRS | 03/04/05 |
| 00c | `00c_文件健檢報告.html` | 跨文件交叉稽核（程式硬檢查＋語意） | 所選各份 |
| **00a** ★ | `00a_開發任務看板.html` | 規格變任務＋可點狀態＋深連 04/05/08；**工程師每天開的入口（強烈建議勾）** | 04/05/08 |

- **既有輸入（不另產，但要「複製」進套件資料夾）**：01 需求說明書、02 雛形畫面是既有檔；產套件時把它們**複製一份到套件資料夾**並命名 `01_需求說明書.pdf`、`02_雛形畫面.html`，選單才連得到（是搬既有檔，不是重新生成）。**用 `scripts/copy_inputs.py <需求書路徑> <雛形路徑> <套件資料夾>` 一鍵複製，別漏。**
- **（選配）03 加值匯出**：產 03 時可順手 `gen_schema.py` 吐 `db_schema.sql`（CREATE TABLE DDL，與資料字典同源），地基建表直接跑、不用照字典手刻。不算獨立文件、不進清單。
- **顧依賴**：選 04 必先有 03；選看板(00a)建議連 04/05/08；選 00b/00c 要有被整合/被稽核的那幾份。
- **07/08/09 同源**：`render_test.py` 一支跑出三檔（07 計畫 / 08 案例 / 09 驗收），勾測試即三份一起產，三者互連。
- **使用者沒指定 → 就把這清單問他、讓他勾**，不要預設「只做一份」或「全做」。
- 入口層採 00 群：`00`＝文件總覽（render_portal）、`00a`＝開發看板（每天操作）、`00b`＝SRS、`00c`＝健檢；導覽列把 00a/00b/00c 聚在最前同一區，後接 01→09 主鏈。

---

## ★ 選多份時的生成方式：逐份生成、逐份確認（**不要一口氣全產**）

> 文件有依賴先後，且一份錯下游全錯（03 資料模型錯 → 04/05/06/07 全繼承）。所以 **一份生成完 → 給使用者確認 → 再生成下一份**，不要平行噴 8 份（既難審、又一錯全錯、還容易撞速率限制）。

| 序 | 文件 | 依賴 | 確認閘 |
|---|------|------|------|
| 1 | **03 SA 系統分析設計**（資料模型＋API，地基） | 雛形/需求 | ⛔ **務必停下來確認**（23 表/API 對不對；這份錯＝全套錯） |
| 2 | **04 功能規格書** | 03 | ⛔ 確認 |
| 3 | **05 畫面規格書** | 03＋雛形 | ⛔ 確認 |
| 4 | **06 開發任務拆解 WBS** | 04 | 可連續 |
| 5 | **07/08/09 測試計畫·案例·驗收**（render_test 一支吐三檔） | 04 | 可連續 |
| 6 | **00b SRS 整合** | 03/04/05 | 可連續 |
| 7 | **00c 文件健檢** | 全部 | 可連續 |
| 8 | **00a 開發任務看板** | 04/05/08 | 最後產，串起全部 |

- **03、04、05 是地基與行為/畫面，逐份停下來給使用者確認再往下**；下游(06/07/00b/00c/00)較機械，可連續產但仍依序。
- 每份產完用一句話回報「這份做了什麼、要不要調整」，確認 OK 再動下一份。

---

## 二、SOP：從雛形/需求 → SA 系統分析設計（產 03；不論勾幾份，都先做這份打底）

```
Step -1 先決條件拷問（要產「整套系統開發文件」時·動工前先跑，別埋頭就生）
  ⚠ 不是複製 grill-me，是「呼叫 grill-me 技能」＋餵 SA 專屬題庫（見 references/preflight-grill.md）。
  先讀 CLAUDE.md / RFP / 建議書 / 既有系統，列「已知 vs gap」，只逼 4 類 gap：
    A 商務/範圍/報價邊界（收費↔本期↔二期是否對齊）
    B 工期 vs 人天現實（合約工期 ÷ WBS 人天 = 幾人並行，現實嗎）
    C 既有系統整合點（帳號表欄位/既有 API/部署環境，有規格還是只能標假設）
    D 隔離/個資/合規（個資、弱掃、採購限制、資料隔離）
  收斂出「先決條件共識摘要」→ 回寫 CLAUDE.md 決策＋文件標清「已定案 vs 假設待補」。
  需求已明確（RFP＋建議書＋訪談都齊）或使用者說「直接做」→ 跳過。

Step 0 抽素材
  輸入是雛形 HTML → 解析 <form>欄位、<table>欄位、清單、按鈕/操作
  輸入是需求文字 → 抽名詞(→實體)、動詞(→操作/API)、形容詞與限制(→欄位約束)

Step 1 ER Model（先做，其他都靠它）— ⚠ 一定要「完整 ER」
  實體(名詞) → 屬性(欄位) → 關聯(1:1 / 1:N / M:N) → 輕度正規化(到 3NF)
  ★別過度拆表：只有真正「一對多(1:N)／多對多(M:N)」才獨立成表；**1:1 的屬性一律併回主表**，別為了好看硬拆成一堆只有 1~2 欄、跟主表 1:1 的碎表。枚舉／受控清單用字典表 OK，但主表的單值屬性不要拆附表。寧可主表欄位多，也不要碎表滿天飛。
  完整鐵則（見 mermaid-patterns.md ①）：每個實體列【全部欄位】，每欄都帶
  【中文說明】(mermaid 第三段引號)，標【PK/FK/UK】，FK 註明 (→ 目標表.欄位)。
  實體框也要中文：用 alias `TABLE["中文名 · TABLE"]`（mermaid 10.3+ 支援），表名不能只有英文（transform.py 已內建）。
  ★表命名慣例（一眼看出歸屬）：同一功能的表用「功能前綴」延續命名 —— 巡檢 `INSP_*`、滿意度 `SATIS_*`、通知 `NOTIFY_*`…；**跨功能共用的表用統一前綴 `COM_*`**（如 `COM_PARK`、`COM_ACCOUNT`），一眼分辨「功能專屬 vs 全域共用」。並把每表歸入 `modules[]` → transform 依模組排序，資料字典/ER 同模組排在一起、不跳來跳去。
  ❌ 只列關鍵欄、欄位沒說明、FK 沒標指向 = 不合格，要補到完整。
  → mermaid erDiagram（見 mermaid-patterns.md）

Step 2 資料字典（ER 的細節版）
  每張表先寫一句【用途】(這張表存什麼/跟誰關聯/合併了哪幾張舊表)，再列欄位：
  每實體每欄位：欄位名 / 型別(對應 MS SQL：INT/NVARCHAR(n)/DATETIME/BIT/DECIMAL) /
  長度 / PK·FK·UK / 必填 / 預設 / 驗證規則 / 說明
  欄位要與 ER 一致且列全（含 id、時間戳）；不是只列關鍵欄。
  → 表格（見 output-templates.md）

Step 3 系統架構圖
  分層：前端(JS/Bootstrap/Flutter) → API 層 → 服務/業務層 → DB(MS SQL)
  標模組切分、外部介接(LINE/IoT/GIS/第三方 API)、部署(Benson 慣例：HA 主備援/VM)
  → mermaid flowchart（見 mermaid-patterns.md）

Step 3b 角色與權限（roles_html）— 正規 SA 必有，常被漏
  列 actors（哪些角色用系統 / 進入方式 / 職責 / 個資界線）＋ 角色×功能 RBAC 矩陣（誰能做哪些功能）。

Step 3c 業務流程泳道圖＋情境資料流（放 extra[]）
  關鍵跨角色流程 → 泳道圖（flowchart 用 subgraph 當 lane、每角色一條），看出誰交棒給誰；
  關鍵真實情境 → sequenceDiagram 標「資料寫入」（如 INSERT INSP_FORM/INSP_DETAIL、存 NAS file_path、落地 DEFECT、寫 NOTIFICATION_LOG），讓工程師看懂一次操作動到哪些表。

Step 4 API spec
  從「功能 + ER」推端點：每實體 CRUD + 業務操作
  每端點：方法(GET/POST/PUT/DELETE) / 路徑 / 請求參數 / 回傳結構 / 狀態碼
  → 表格 + JSON 範例

Step 5 組裝
  python scripts/render_sa.py sa_spec.json sa_design.html
  → 暖色 HTML SA 文件（mermaid.js 直接把 ①③ 渲染成圖），可 Start-Process 開 / 截圖 / 放網頁服務線上瀏覽

Step 6 交叉稽核自檢（多份文件時必跑·收尾，不靠外部 AI）
  產完／每次改完 → 用 Workflow 跑 scripts/cross_audit.js（改頂部 FILES 路徑）
  先跑 preflight 程式硬檢查(ER漏表/FN-FS對照/懸空錨點/數字口徑/版號)，再 10 維度語意比對
  (功能編碼/畫面追溯/資料表欄位含 ER=字典/API/需求追溯/數字/狀態機+基準/受控詞彙/狀態欄位/商務範圍)
  規則收緊「只抓結構」(排除同義詞/排版，否則 LLM 永遠不收斂)
  真結構問題(高/中)→改 build 腳本重生、修到 0；純用詞(低)→列給使用者判斷
  改完用同一稽核複跑確認收斂。詳見 references/srs-and-cross-audit.md
```

---

## 三、產出風格（依 Benson 全域偏好）

- 暖色系（暖米白底 #fbf6ee、暖褐字 #4a3f33、橘 accent）、正文 ≥18px。
- mermaid 圖：ER 用 `erDiagram`、架構用 `flowchart TD`、流程/循序選配用 `sequenceDiagram`。
- 文件頂端放「一句話系統總述 + 此設計涵蓋幾張表/幾支 API」。
- 資料字典、API spec 用清楚表格，工程師可直接照建。
- **完整度優先**：ER 每欄附中文說明＋PK/FK/UK，每張表附「用途」描述；寧可詳盡，不要只給縮圖式骨架。

---

## 四、與鄰居 skill 的分工

| 意圖 | skill |
|------|-------|
| 把需求/雛形變**系統設計**（ER/架構/API） | **sa-design（本 skill）** |
| 畫**互動式雛形**畫面 | `bootstrap-ui`（上游） |
| 寫**對甲方的需求書/估價** | `rfp-builder`（對外文件，非內部設計） |
| 寫**對甲方的服務建議書** | `proposal-doc` |
| 把設計**拆成開發事項追蹤** | `project-dev-manager`（下游） |
| 系統做完**測試/資安檢測** | `service-sqa`（更下游） |

判斷：**要 ER/資料表/架構/API 這種「給工程師的技術設計」→ 本 skill；要給甲方看的文件 → rfp/proposal。**

---

## 五、檔案結構

```
sa-design/
├── SKILL.md
├── README.md
├── references/
│   ├── preflight-grill.md         # ★Step -1：動工前先決條件拷問題庫（指向 grill-me，非複製）—商務/工期/整合點/合規 4 類
│   ├── methodology.md             # SA 方法論：抽實體→ER→資料字典→架構→API 的完整推導
│   ├── mermaid-patterns.md        # ER/架構/循序/狀態圖的 mermaid 範本（可直接套）
│   ├── output-templates.md        # 資料字典欄位定義 + API spec 格式 + MS SQL 型別對照
│   └── srs-and-cross-audit.md     # ★升級層：機關 SRS 查檢表結構＋工程師可照刻深度＋10 維度交叉稽核自檢
└── scripts/
    ├── render_sa.py               # SA 系統分析設計：sa_spec.json → 暖色 HTML SA 文件（含 mermaid.js 渲染）
    ├── cross_audit.js             # ★交叉稽核自檢 Workflow 腳本（v2：preflight 程式硬檢查＋10 維度，改頂部 FILES 即用）
    │  — 以下為「完整送審套件」用（B 層級）—
    ├── doc_common.py              # ★共用：暖色樣式＋頂部導覽列＋頁面外殼（系統名讀 env SA_SUITE_TITLE，檔名編號通用）
    ├── render_board.py            # ★★ 開發任務看板(00a)：功能→可追蹤任務＋深連文件（操作層核心）
    ├── render_portal.py           # （選配）文件總覽頁；看板已是入口，通常不需要
    ├── render_fs.py               # 功能規格書(04)：FN/FS＋Use Case＋輸入欄位表（卡片加 id=FS 錨點）
    ├── render_scr.py              # 畫面規格書(05)：逐畫面逐元素＋元素→API→欄位（卡片加 id=SCR 錨點）
    ├── render_wbs.py              # WBS(06)：階段/任務/人天/相依/里程碑
    ├── render_test.py             # 一支吐三檔：07 測試計畫 / 08 測試案例 / 09 驗收文件
    ├── render_srs.py              # SRS整合(00b)：依機關查檢表整合 01/03/04/05
    ├── render_audit.py            # 文件健檢(00c)：preflight 硬檢查＋語意稽核結果
    ├── transform.py               # 正規模型 → ER mermaid＋資料字典（同源生成，保證 ER↔字典一致）
    ├── gen_schema.py              # （選配·03 加值）正規模型 → CREATE TABLE DDL（資料字典的可執行版，地基直接跑）
    └── copy_inputs.py             # 把既有 需求書+雛形 複製進套件資料夾命名 01_/02_（選單才連得到）
```

> ⭐ 升級層（完整系統開發文件套件 8 份 + 操作層看板 + 自動自檢）：見 `references/srs-and-cross-audit.md`。單份 SA 是基本盤；要交完整套件時 **逐份生成、逐份確認**（03 地基先確認再往下），並**必出 `00a 開發任務看板`(render_board.py)** 這個操作層入口，最後跑 `scripts/cross_audit.js` 自檢（v2 先程式硬掃再 LLM 語意）。

---

## 六、環境

- 純產出 skill，無外部 API 依賴。
- mermaid 渲染走 HTML + mermaid.js CDN（瀏覽器/playwright 渲染），截圖用 playwright channel=msedge。
- 預設資料庫型別對照 **MS SQL Server**（Benson 主力），需要時可切 MySQL。
