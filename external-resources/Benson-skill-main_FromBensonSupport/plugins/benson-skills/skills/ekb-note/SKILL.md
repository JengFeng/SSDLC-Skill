---
name: ekb-note
description: 寫入 / 查詢 Benson 的 EKB 知識庫 (https://your-server.example.com/EIP/ekb)。當使用者說「記一下」「存成筆記」「記到知識庫」「丟進 EKB」「存起來」「把這個整理成筆記」「這篇文章/影片/逐字稿/連結存一下」「我之前有記過 XXX 嗎」「查一下筆記」「EKB 有沒有提到 OO」，或丟一段內容/URL/檔案要存進知識庫時啟用。自動結構化成 note + 設好來源(source_ref)/標籤/專案，寫入前先比對既有標籤避免亂建。介紹型/概念多/較長的內容要**寫厚**（結構化分層＋重點心智圖＋表格化清單），不要只寫一兩句敷衍。AI 寫、人讀；用 $env:EKB_TOKEN 直接打 HTTP API，server 不打 LLM。
---

# EKB 筆記 skill

把內容存進 / 查出 Benson 的企業知識庫。核心哲學：**AI 寫、人讀** — 你用 token 直接打 REST API，推論在你這端。

- Base URL：`https://your-server.example.com/EIP/ekb`（`$env:EKB_BASE_URL`）
- Token：`$env:EKB_TOKEN`（PowerShell）/ `$EKB_TOKEN`（bash）— **帶 token 跳 IP 白名單、任何地方可用，不要問使用者要 token**
- **認證方式**：HTTP header `X-EKB-Token: <token>`（⚠️ 不是 `Authorization: Bearer`，用 Bearer 會吃 401）。分享連結改用 `?share={share_token}` query，免 header。
- 完整 API：需要時 `WebFetch https://your-server.example.com/EIP/ekb/api/spec.md.php`（永遠最新）

---

## 先決定深度（寫之前 30 秒判斷 — 最重要的一步）

筆記的價值＝日後查得到、看得懂、配得上內容。**動筆前先判斷這篇屬於哪種**，深度差很多，別一律當「快速收錄」隨手寫薄：

| 這篇是… | 深度 | 怎麼做 |
|---|---|---|
| 介紹一個系統/技能/工具/方法、彙整逐字稿或文章、概念多、內容長 | **厚版** | 走 W3 結構化 ＋ **必加 W6 心智圖** ＋ 清單一律用 `<table>`，照下方「介紹型版型」分層 |
| 單一想法、一句話結論、單一事實/決策/帳密/連結 | 薄版 | 走 W1，一兩段講完即可，不必心智圖 |

判斷口訣：**「值得花時間做出來的東西，就值得一張心智圖＋分層介紹」**；隨手一句話才走薄版。**拿不準就寫厚的**——使用者嫌厚的機率遠低於嫌敷衍。

**介紹型版型**（厚版預設骨架，依內容增減；每段都要有實質內容，不要只放標題）：
1. 🧠 **重點心智圖**（W6，頂端）
2. **一句話總結**（這是什麼、最關鍵的價值）
3. **緣起 / 解決什麼痛點**（為什麼存在）
4. **它在幹嘛**（輸入 → 過程 → 產出）
5. **組成 / 清單**（用 `<table>`：項目、內容、角色）
6. **逐項解說**（每個組成在講什麼、給誰看、價值）
7. **特色 / 設計理念**
8. **實例 / 規模**（具體數字最有說服力）
9. **怎麼用**（觸發、前提、注意）
10. **限制 / 缺口**

> ⚠️ 反例（別這樣）：使用者花一整天做的技能，只回一份三段式摘要、沒心智圖、清單用 bullet。這會被退。skill 已把版型備好，照做就是。

## 先決定歸檔（parent_id）— 跟「決定深度」一起，寫之前判斷

每篇筆記寫入前要**歸好位**（設 `parent_id`）：別丟根層、別等人手動拖。**完整規範見 `references/taxonomy.md`**，核心：

**鐵則**（口訣：換個專案還用得到、且不是某案交付物嗎？）
- 屬於某專案 → `00 {專案}`　｜　不屬專案但重要的議題 → `01–08`　｜　不確定 → `09 草稿`

**01–09**：01 方法・範本・培訓｜02 技術・AI 研究｜03 提示詞・Loop 工程｜04 資安｜05–07 預留｜08 學習・文獻（多配 `待研究`）｜09 草稿

**怎麼設 parent_id**：以資料夾**名稱**為準 → `GET /api/notes.php?list=1&q={如 "04 資安"}` 比對 title 拿 id → POST 帶 `parent_id`。**找不到對應資料夾就問使用者或暫掛 09，不要留根層。**

另疊兩個標籤維度（跟資料夾正交）：**型態標籤**（系統分析/會議紀錄/報價/測試/SRS…**直接寫詞、不加 `doctype:` 前綴**，也別掛太泛的「技術文件/手冊」）、收集未消化的加 `待研究`（→「📚 待研究」Notebook）。

## 四大工作流

### W1 快速收錄（薄版才用 — 先確認不是介紹型/較長內容）
使用者丟一段**簡短**內容 / 想法 / 連結 → 存成一篇 note。**若內容其實是介紹型或較長 → 別用 W1，改走厚版（見上方深度判斷）。**

1. **想標題** — `{主題} — {重點}`，不要日期前置、不要流水號、不要場地名
2. **比對既有標籤**（★ 必做，見下方治理鐵則）：先 `GET /api/tags.php` 拿現有 tag，**能用既有就用，別建近義新 tag**
3. **設來源** `source_ref`（必填好習慣，依類型前綴 — 見 `references/conventions.md`）
4. **歸檔判斷**（決定 `parent_id` — 見上方「先決定歸檔」＋ `references/taxonomy.md`）：屬專案→`00 {專案}`；跨專案議題→`01–08`；不確定→`09`。順手掛 `doctype:`、收集未消化的加 `待研究`
5. **問/推專案**：要掛 EIP 專案就 `GET /api/projects.php` 拿 id；純個人筆記免
6. **寫入前先一句話**告訴使用者「我要把這存成筆記：歸到 {00/01–08/09} / `doctype:X` / 標籤 Y / 來源 Z」再 POST
7. `POST /api/notes.php` body `{title, content(HTML), parent_id, tags[], source_ref, eip_project_id?, change_reason}`
8. 回 `note.php?id={id}` 連結 + 摘要寫了什麼

### W2 查詢 / 召回舊筆記
「我之前記過 XXX 嗎」「EKB 有沒有提到 OO」。

- 全文 + 標籤：`GET /api/notes.php?list=1&q={關鍵字}` 或 `list.php?tags=a,b&tagmode=and`
- 命中後可 `GET /api/notes.php?id={id}` 看全文 → 摘要給使用者 + 附 `note.php?id=` 連結
- 找不到就老實說沒有，別腦補

### W3 原始材料 → 結構化筆記
丟文章 / 逐字稿 / PDF / 截圖 / YouTube → 整理成有結構的 note。

1. 有檔案/圖/影/音 → 先跑 **Step 0 預處理**（看 `references/conventions.md` 的多媒體段）：圖→multimodal OCR、音影→whisper、PDF→pdftoppm 看子圖，都 PATCH 回寫 `extracted_text`
2. 把原始材料整理成結構化 HTML（標題層次 / 重點 / 條列），**不要逐字照貼**
3. **（厚版必做）加重點心智圖**放筆記頂端，一眼掌握 — 見下方 W6
4. source_ref 標明出處（📺 YouTube / 🔗 網頁 / 🎙️ 逐字稿 / 📎 檔案）
5. POST note + attach 原始檔（`op=attach_file`）

### W6 重點心智圖（厚版必做，不是選配）
**只要是介紹型/概念多/較長的厚版筆記，就一定產一張**橫向心智圖 SVG 嵌在頂端，讓人一眼掌握全貌：

1. 把重點整理成 spec（中心主題 + 5±2 個分支，每分支 3-5 點），存成 json
2. `python scripts/mindmap_svg.py spec.json` → 得 SVG 字串（文字清晰、可縮放、零外掛、分享連結也能看）
3. 包成 `<div style="overflow-x:auto;">{svg}</div>`，放進 note content 頂端（通常在「一句話」之後）
4. PATCH /api/notes.php 的 content（帶 change_reason）。重跑時用 regex 移除舊心智圖再插新的（冪等）

spec 範例見 `references/conventions.md`。

### W4 自動標籤 + 關聯
- **寫入前**：`GET /api/tags.php` → 新 note 的 tag 優先用清單裡既有的；真的沒有才建新
- **寫入後**：`GET /api/tags.php?related={新note_id}` → 告訴使用者「這篇跟 #X #Y 相關」
- 想自動歸主題庫：`tag-admin` 有「📓 一鍵建 notebook」，或 POST notebook 帶 `scope_config.rules.tag_names=[該tag]`

### W5 YouTube → 筆記（貼連結，全自動）
使用者貼 YouTube 連結說「彙整 / 存起來」：

1. 跑 `python scripts/yt_fetch.py "<url>" <work_dir>` → 下載 mp3 + faster-whisper 中文轉錄，回 JSON（title/url/transcript/mp3_path…）
   - 長片先告訴使用者「這片 N 分鐘，轉錄約 K 分鐘」
2. 拿 transcript **彙整成結構化 note**（重點 / 章節 / 金句 / 待辦），不要逐字貼
3. `POST /api/notes.php`：
   - `source_ref` = `📺 YouTube：{標題} ({url})`
   - tags：先 `GET /api/tags.php` 比對既有；主題 tag + `doctype:影音筆記`
4. 上傳 mp3 當附件：`POST /api/files.php`（multipart）→ 拿 file_id → `op=attach_file`
   - ⚠ mp3 > 32MB 會被 prod 擋 → 改放本機路徑 + note 內註明，或用 ffmpeg 壓過再傳
5. 回 `note.php?id=` 連結 + 重點摘要

> 環境已驗證有 yt-dlp / ffmpeg / faster-whisper。沒 whisper 時 yt_fetch 會跳轉錄，改用影片描述 + 章節彙整。

---

## 🚨 標籤治理鐵則（最重要 — 違反會把標籤空間搞亂）

**建 note 前一定先 `GET /api/tags.php` 比對。** Benson 是唯一天天用 AI 灌 note 的人，標籤漂移的病灶就是 agent 隨手建近義 tag。規則：

- 命中既有 tag（含大小寫/空白/符號變體）→ **用原本那個名字**，不要建 `AI-Agent` vs `AI Agent` vs `ai agent`
- 真的沒有才建新 tag
- tag 用「概念」（客戶名 / 技術 / 主題），不要用日期（`2026-05`）或流水號（`#39`）— 日期靠 created_at 排序
- 結構化語意用命名空間：`doctype:會議紀錄` `audit:弱掃` `lc:航空城:SA` `asset:資安章節`

---

## 來源 source_ref（必填）

讓人一眼知道筆記從哪來。類型前綴速查（完整在 `references/conventions.md`）：
💬 LINE｜🎙️ 會議逐字稿｜🤖 AI 產製｜📎 檔案萃取｜📺 YouTube｜🔗 網頁｜📚 EIP Wiki｜📧 Outlook｜✍️ 手動

---

## 行為鐵則
- **每篇都要歸位**：建立筆記一定設 `parent_id`（見「先決定歸檔」/ `references/taxonomy.md`），**別留根層**；判斷不出來才暫掛 `09 草稿` 並告知
- content 是**完整 HTML**（`<h2>` `<ul>` `<p>` 等），不是純文字 / markdown
- 預設用 `op=append` 追加；整篇 `PATCH` 覆蓋一定填 `change_reason`
- 寫入動作前先一句話告訴使用者要做什麼，再執行
- 看完圖務必 PATCH 回寫 `extracted_text`，不要看完就忘
- **有附件 → 一律照「標準樣式」**：頂端綠框下載按鈕、中文檔名、保留 `class="ekb-attachment" data-file-id`（範本與三個附件坑見 `references/conventions.md`）。檔名要中文用 `PATCH /api/files.php?id=X {original_name}`；別在 PowerShell 套 ASCII 繞法
- 標題禁忌：日期前置 / 場地名 / 流水號 `#39`
- 找不到資料就說沒有，不腦補

---

## 檔案
- `references/taxonomy.md` — **歸檔/分類規範**（00 專案 + 01–09、核心鐵則、`parent_id` 解析、doctype、待研究）
- `references/conventions.md` — 來源前綴全表 / 標題規則 / 多媒體 Step 0 / 常見雷
- 完整 API：`WebFetch api/spec.md.php`（永遠最新，不用記）
