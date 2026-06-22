# EKB 筆記慣例（ekb-note skill）

## 來源 source_ref 前綴全表

建 note 必填 `source_ref`，讓人在 note.php「📥 來源」欄一眼知道從哪來。

| 來源類型 | 格式範例 |
|---|---|
| 💬 LINE 對話 | `💬 LINE：{群組名} · {日期範圍}` |
| 🎙️ 會議逐字稿 | `🎙️ 會議逐字稿：{會議名} {YYYY-MM-DD} ({原檔名})` |
| 🤖 AI 產製 | `🤖 AI 產製：{工具名} {產出物}` |
| 📎 檔案萃取 | `📎 檔案萃取：{檔名}` |
| 📺 YouTube / 影音 | `📺 YouTube：{影片標題} ({url})` |
| 🔗 網頁 / 外部連結 | `🔗 網頁：{標題} ({url})` |
| 📚 EIP Wiki 轉入 | `📚 EIP Wiki 轉入：{原頁名}` |
| 📧 Email / Outlook | `📧 Outlook：{主旨}` |
| ✍️ 手動建立 | `✍️ 手動建立` |

## 標題規則（違反會被打回票）

格式：`{主題} — {重點}`
- ❌ 日期前置：`2026-05-27 航空城會議`
- ❌ 場地名：`高鐵一路326號 會議`
- ❌ 流水號：`#39`
- ✅ `航空城進度會議（2026-05-27）— AI 預審 / 管線生成 週進度`（會議類可帶日期在括號）
- ✅ `Anthropic Building Effective Agents — agent 設計反模式`

## 標籤規則

- **建前先 `GET /api/tags.php` 比對**，能用既有就用，不要建近義變體（`AI Agent` vs `AI-Agent`）
- 用「概念」：客戶名 / 技術 / 主題；不要用日期或流水號
- 結構化語意用命名空間：`doctype:會議紀錄` `audit:弱掃` `lc:航空城:SA` `asset:資安章節`

## content 是 HTML

- 用 `<h2>` `<h3>` `<ul>` `<li>` `<p>` `<b>`，不是純文字 / markdown
- 重點標色 inline：紅 `color:#c00`(卡關) / 藍 `color:#0066cc`(決議) / 紫 `color:#9333ea`(待決策)

## 多媒體 Step 0（有檔案才做）

| 類型 | 做法 | 完成 marker |
|---|---|---|
| 圖片 | `WebFetch files.php?id=X&download=1&inline=1` → multimodal OCR + 描述 → PATCH `extracted_text` | — |
| PDF 內嵌圖 | 下載 → `pdftoppm -png -r 150` → 逐頁 multimodal → append | `=== PDF 子圖分析 by Claude Code` |
| 音檔 / 影片 | 下載 → faster-whisper 中文轉錄 → PATCH | `=== 逐字稿 by Claude Code` |

PATCH `extracted_text` 後 `extract_status` 自動變 `done`。

## YouTube 抓取（scripts/yt_fetch.py）

```bash
python scripts/yt_fetch.py "<youtube_url>" [out_dir] [--model small|medium] [--no-transcribe]
```
輸出 JSON：`{title, url, uploader, duration_sec, description, mp3_path, mp3_mb, transcript, transcribed_by}`
- 用系統 yt-dlp + ffmpeg 下載 mp3，faster-whisper 中文轉錄（CPU int8）
- 長片轉錄要數分鐘 → 先告訴使用者預計時間
- 沒裝 faster-whisper 會跳轉錄（transcript=null），改用描述 + 章節資訊

## 重點心智圖 spec（scripts/mindmap_svg.py）

長筆記放一張心智圖在頂端更好讀。spec 範例：
```json
{
  "root": "AI Agent\n+ Harness",
  "tagline": "Agent = 怎麼幹活 | Harness = 幹得靠譜",
  "branches": [
    {"title": "①工具調用", "color": "#0284c7", "items": ["AI 套殼 + 給工具", "AI 自己判斷調哪個"]},
    {"title": "②ReAct 循環", "color": "#16a34a", "items": ["思考 → 行動 → 觀察", "不斷重複到 OK"]},
    {"title": "③Harness 防護網", "color": "#dc2626", "items": ["格式清洗", "參數校驗", "用代碼卡反覆犯的錯"]}
  ]
}
```
- 5±2 個分支、每分支 3-5 點最好讀；color 用 #RRGGBB（不給會自動配色）
- `python scripts/mindmap_svg.py spec.json` → SVG → 包 `<div style="overflow-x:auto;">…</div>` 嵌進 content 頂端
- 冪等更新：PATCH 前用 regex 移除舊的 `<h2>🧠 重點心智圖</h2>...</div>` 區塊再插新的

## 常見雷
- 上傳 mp4/大檔受 prod PHP `upload_max_filesize` 限制（目前 32M）→ 大檔放本機路徑、note 內註明，或只傳壓縮版
- mime 被偵測成 octet-stream → content 內手動把 `<a class="ekb-attachment">` 改成 `<img>`
- 寫入動作前先一句話告訴使用者再執行

## ⚠️ Windows 打 EKB API 的編碼坑（Git Bash / cmd 上的 agent 必看）

Windows 預設碼頁是 **cp950 / Big5**，含中文或 emoji 的請求/回應若不繞過，會被默默弄壞（試錯浪費很多輪）。鐵則：**任何含中文/emoji 的內容，都不要直接走命令列字串**。

| 坑 | 症狀 | 解法 |
|---|---|---|
| ① **request body 走 `python -c "..."` 或 `curl -d`** | 中文/emoji 被 cp950 弄壞；body 裡的 `$150`、`💰` 跑掉 | 先把 JSON **寫進檔案**（Python `json.dump(..., ensure_ascii=False)`），再 `curl --data-binary @file.json`。**不要**把中文塞進 `python -c` 的字串字面值（emoji 尤其會壞） |
| ② **讀 API 回應 `curl ... \| python`（stdin）** | `json.load(sys.stdin)` 報 `JSONDecodeError`（stdin 被 cp950 解碼） | `curl ... -o resp.json` 存檔，再 `json.load(open('resp.json', encoding='utf-8'))`。要 print 中文先 `sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')` |
| ③ **`curl -F file=@中文檔名.pdf` 上傳（Git Bash/cmd）** | DB 報 `Incorrect string value ... original_name`（Big5 bytes 進 utf8 欄位） | **這坑只在 Git Bash/cmd。PowerShell `-Form` 走 UTF-8，直接用中文檔名即可，別套 ASCII 繞法**（套了會讓附件顯示醜英文名）。Git Bash 真要用：`;filename=ascii.pdf` 上傳後，再 `PATCH /api/files.php?id=X {"original_name":"中文.pdf"}` 把顯示名改回中文 |
| ④ **字串比對伺服器回來的 HTML** | 比 `<h2>` 對不到 | server 會自動補錨點 `id`（`<h2 id="...">`）→ 用 `<h2`（不含 `>`）或標題純文字比對，別假設無屬性 |

口訣：**中文一律「檔案進、檔案出」，命令列只放 ASCII。**

## ⚠️ EKB 上傳附件（files.php / attach_file）必踩坑

實戰踩過、會浪費好幾輪的兩個坑：

| 坑 | 症狀 | 解法 |
|---|---|---|
| ⑤ **附件顯示醜英文名**（如 `szh_quote.pdf`）| note.php 附件區與連結文字都用 file 的 `original_name`，attach_file **不能**自訂顯示文字 | 用真實中文檔名上傳（PowerShell 直接可）；若已是英文或要改 → `PATCH /api/files.php?id=X {"original_name":"中文.pdf"}` |
| ⑥ **同一份檔重傳，名字改不掉** | 上傳**依內容雜湊去重**，重傳同位元組回**同一個 file_id**、沿用舊 `original_name` | 別想靠「換名重傳」改名 → 一律用上面的 `PATCH original_name` 改 |
| ⑦ **整篇覆蓋 content 後附件不見了** | server 用 content 裡的 `<a class="ekb-attachment" data-file-id="X">` 標記**同步**附件關聯；你 PATCH 覆蓋掉那段 → 檔案被**脫鉤**，`attached_files` 變 0 | 想自訂附件呈現（如做成明顯下載按鈕），**務必保留 `class="ekb-attachment" data-file-id="X"` 這兩個屬性**，只加 style；或覆蓋後重新 `op=attach_file`。改完 GET 一次確認 `attached_files` 數量沒掉 |

附件流程口訣：**上傳(中文名) → attach → 若改 content 要保留 `ekb-attachment`/`data-file-id` → GET 驗 attached_files 數量。**

### 📎 附件呈現「標準樣式」（之後一律照這個）

server 自動補的附件是底端一行小字 `📄 檔名`，**不明顯**。凡是有附件，**一律在 content 頂端（一句話之後）放一個明顯的綠框下載區**，每個附件做成按鈕、用**中文名＋大小**。直接複製這段、把 `{ID}`/`{中文名}`/`{大小}` 換掉（多個附件就多複製幾個 `<a>`）：

```html
<div style="margin:10px 0 18px;padding:14px 18px;border:2px solid #2e7d6b;border-radius:10px;background:#eaf3ec">
<b style="font-size:16px">📎 商務文件正本（可下載）</b><br>
<a href="api/files.php?id={ID}&download=1&attachment=1" class="ekb-attachment" data-file-id="{ID}" target="_blank" style="display:inline-block;margin:8px 8px 0 0;padding:9px 18px;background:#2e7d6b;color:#fff;text-decoration:none;border-radius:6px;font-weight:700">⬇ {中文名} PDF ({大小})</a>
<a href="api/files.php?id={ID2}&download=1&attachment=1" class="ekb-attachment" data-file-id="{ID2}" target="_blank" style="display:inline-block;margin:8px 8px 0 0;padding:9px 18px;background:#2e7d6b;color:#fff;text-decoration:none;border-radius:6px;font-weight:700">⬇ {中文名2} PDF ({大小2})</a>
</div>
```

鐵則：① 放**頂端**、② 按鈕用**中文名**、③ 每個 `<a>` **必留 `class="ekb-attachment" data-file-id`**（否則 PATCH 後脫鉤）、④ 框用暖綠 `#2e7d6b`／底 `#eaf3ec`（配暖色系，不刺眼）。
