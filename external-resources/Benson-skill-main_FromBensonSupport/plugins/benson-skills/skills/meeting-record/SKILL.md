---
name: meeting-record
description: 把會議逐字稿（語音轉文字 .md）變成完整的會議紀錄資產 — 結構化 EKB note + HTML/CSS 投影片 + 1.5x 配音介紹影片，一條龍跑完。當使用者丟出會議逐字稿 .md 或 .txt、或說「會議紀錄」「整理會議」「彙整會議」「開會記錄」「逐字稿彙整」「會議影片」「跨進度會議流程」時啟用。預設產出三件套：(a) EKB note 含結構化紀錄、(b) 5 張 HTML 投影片、(c) Tiffy_TW 配音 1.5x 介紹影片。涵蓋從台灣腔語音轉文字錯字校正、議題結構化、責任分派、到 EKB 上傳、軟刪舊版的完整流程。
---

# meeting-record Skill

把會議逐字稿變成「EKB 知識資產 + 投影片 + 介紹影片」的一條龍 pipeline。

## 何時觸發

**啟用**：使用者丟出 `.md` / `.txt` 逐字稿、或說「會議紀錄」「整理會議」「彙整這份會議」「開會記錄」「跨進度會議」「會議影片」。

**不啟用**：只是想把 PPTX 配音 → 用 [[proposal-narration]]；只是要 EKB note 整理（不是會議）→ 直接打 EKB API。

---

## 四階段 Pipeline

```
Phase 1  逐字稿 → 結構化紀錄 → EKB note     ★ 必跑
Phase 2  結構化紀錄 → HTML/CSS 投影片         ★ 預設跑
Phase 3  投影片 + 旁白稿 → 1.5x 配音影片      ★ 預設跑（可說「不要影片」skip）
Phase 4  全部上 EKB + 軟刪舊版                ★ 必跑
```

---

## Phase 1 — 逐字稿 → EKB note

### Step 1.1 完整讀逐字稿
- **絕對不能只讀「會議記錄」段**——個別發言、爭論過程、口語化的決策理由都在逐字稿，會議記錄會刪掉
- 整篇可能塞成一段沒換行 → 用 `Read` offset/limit 切段讀完
- 如果 >2000 行或超 token，分段讀，全部讀完才開始彙整

### Step 1.2 問使用者三件事（**這三個錯了整份都會錯**）
1. **會議正式名稱**（例：「航空城進度會議」）——不要從場地名推（「高鐵一路 326 號」是地址不是會議）
2. **與會名單 + 角色對照**——語音轉文字常出同音字錯誤（諺庭/燕婷、家宏/嘉紅、俊毅常被聽成軍）
3. **EIP 專案 id**——`GET /api/projects.php` 列出來給 user 挑

### Step 1.3 校正語音錯字
看 `references/pronunciation-corrections.yaml`，常見：
- 預神／預成／玉省／玉神 → 預審
- 省／省合／神／送神 → 審／審核／送審
- 祭師／計時／祭事 → 技師
- 曼林／慢林 → 曼寧
- 短線（管線上下文） → 管線
- 武器 → 伺服器

### Step 1.4 結構化 EKB note 內容
看 `references/ekb-format.md` 的格式規則。**摘要**：
- 標題：「{會議名}（{日期}）— {本次重點}」（**不要流水號**）
- 與會欄：**純名單**（不要括號加角色）
- 每議題：`現況 → 決議 → 負責人` 三段式
- 結尾：必交清單（依負責人） + 延後議題
- **不要**：責任分派總表（PM 範疇）、頁尾自我交代（附件 / 校正對照表）
- Tags：**禁日期類**（例 `2026-05` 不准）

### Step 1.5 上傳 EKB
POST `/api/notes.php`，含 `eip_project_id`、tags、change_reason。

---

## Phase 2 — HTML/CSS 投影片

**絕對不要 AI 生圖**（GPT Image 2 / DALL-E / 任何）。中文小字會破，沒救。

### Step 2.1 規劃投影片 — 兩種模式（v1.2）

**先判斷使用者要「摘要版」還是「詳細版」**：
- **詳細版（建議預設）** — 一個子主題一張、字大塞實、**張數放開（8-10 張很正常）**。會議豐富就拆多張，**不要硬卡 5 張**。使用者原話「內容太虛、跟摘要一樣，要詳細一點」。
- **摘要版** — 5 張上限、一張一大區塊（使用者明說「我要簡短/摘要版」才用）。

詳細版結構（系列會議參考，一子題一張）：
```
1 封面 + 甫任時程指令(若有)
2 ① 上次事項追蹤（系列第 2 次起，用 slide_tracking.html）
3 議題一-A   4 議題一-B   5 議題二-A   6 議題二-B ...
n 設備/其他 + 下次必交（依負責人，用 slide_next_meeting.html）
```

### Step 2.2 寫 HTML（用 v1.2 詳細版配方）
- 用 `templates/slide_common.css`（v1.2：標題 58 / 卡標 38 / 內文 27、flex 滿版零留白）
- 範本：`slide_cover.html` / `slide_topic.html`（2×2 卡片 + 底部 callout）/ `slide_tracking.html`（四態追蹤）/ `slide_next_meeting.html`（依負責人 6 卡）
- 商務風、5 色 tint 卡片、callout（good 綠 / danger 紅）
- 重點色：紅 hl-red（卡關）、藍 hl-blue（重大決議）、紫 hl-purple（待決策）
- ★ **內容要詳細不要虛**：搬 EKB note 的實際決策（起終點邏輯、>100m、WKT、複製成新方案…），不要寫「改雙層結構」這種摘要話
- ★ **詳細 = 多拆張，不是縮字硬塞**。每張卡片 2-4 行具體決策、用 `.k` 標籤分層
- 詳見 `references/slide-design.md` §D（內容詳細）§E（字級+滿版配方）

### Step 2.3 Playwright render → 1920×1080 PNG
- 用 `scripts/render_slides.py`
- 輸出 `slides/{n}.png`

### Step 2.4 真實看圖、填回 narration.md
- **必做**：對每張 PNG 跑 `Read`、把看到的內容填回 `[visual_check]` 欄位
- 防止寫旁白時腦補圖片內容

---

## Phase 3 — 配音影片

### Step 3.1 寫 narration.md（v3.1 格式）
範本見 `templates/narration.md`。Meta 區：
```yaml
voice_key: B          # Tiffy_TW（ElevenLabs v3 / 預設）
speed: 1.5            # ★ 1.5x atempo 變速不變調
subtitles: false      # ★ 預設關字幕 — 1.5x 速度燒入字幕看起來很糟
duration_min: 25
project: ...
```

**為什麼預設關字幕**：v1.0 預設燒入字幕，但 1.5x 速度下字幕跳得太快、且 .srt 時間軸是估算的（不是精準對齊每句話），視覺效果反而拖累影片質感。`subtitles: false` 後仍會跑 TTS、產出 `full.mp4`，但不產 `full.srt` / `full_subtitled.mp4`。如果有需要做字幕版（給聽障 / 無聲環境播放），單獨改 narration.md `subtitles: true` 重跑即可。
每張 slide：
```
## P{n}
[approved: no]
[visual_check: <真實看過 PNG 後填的視覺描述>]

(旁白本文 — 5 分鐘級深度)
```

### Step 3.2 旁白深度要求
- 每張 ~5 分鐘旁白
- 結構：**現況 → 為什麼這樣決議 → 細節展開 → 負責下手點**
- 不是 punchy bullets，是故事化敘述
- 給沒參會的人聽，聽完掌握完整脈絡

### Step 3.3 等使用者 approve（v3.1 閘）
- 跟使用者展示每張 PNG + 旁白稿
- 使用者把 `[approved: no]` 改成 `[approved: yes]` 才能跑 TTS
- **如果使用者說「直接跑」「不用 review」**，跳過閘直接 flip 全 yes

### Step 3.4 跑 pipeline（接 proposal-narration）
- 用 python-pptx 包 5 張 PNG → PPTX（`scripts/pack_pptx.py`）
- 跑 `proposal-narration` 的 `scripts/pipeline.py`
- 輸出：full.mp4 / full.srt / full_subtitled.mp4 / preview.mp4

**Windows 啟動方式（重要）**：
- **用 PowerShell 跑，不要走 Git Bash**。Git Bash 在背景啟動 python 容易吃到 Cygwin `add_item ("\??\C:\Program Files\Git", "/", ...) failed, errno 1` 而整個 background task 0 秒掛掉、log 空白，看不出在哪炸。
- 即使 pipeline.py 已自我修正 stdout 為 utf-8（2026-05 後版本），保險起見仍建議呼叫前設 `$env:PYTHONIOENCODING="utf-8"; $env:PYTHONUTF8="1"`。

### Step 3.5 處理常見錯誤

| 症狀 | 原因 | 解法 |
| ---- | ---- | ---- |
| `UnicodeEncodeError: 'cp950' codec can't encode '✅'` | Windows 預設 codepage 印 emoji 炸 | 2026-05 後 pipeline.py 開頭已 `reconfigure(encoding="utf-8")`；舊版需自行設 `PYTHONIOENCODING=utf-8` |
| `PermissionError: [WinError 5] 存取被拒` 在 `os.replace(tmp, mp3_path)` | Windows Defender 即時掃描鎖住剛寫出的 mp3 | 2026-05 後 tts.py `_apply_speed` 已加 8 次 backoff retry；舊版需要外層 monkey-patch `os.replace` 加 retry，**不要直接刪 output dir 重跑**（會重付 ElevenLabs cost） |
| preview.mp4 moov atom 損壞 | ffmpeg 壓縮中斷 | 從 full_subtitled.mp4 重壓 854p |
| full.mp4 > 50 MB 觸發 EKB upload 上限 | bitrate 太高 | crf 28 重壓 |
| Bash background task `exit code 5` 立刻結束 | Git Bash Cygwin fork 失敗 | 改用 PowerShell |

### Step 3.6 ⚠️ proposal-narration 會自動建一個新 EKB note

跑完 `pipeline.py` 後，proposal-narration **會自己呼叫 EKB API 建一個全新的 note**，把所有 PNG / mp4 / srt 都 attach 到那個新 note 上。這跟 meeting-record 預期的「把資產附到 Phase 1 建好的會議紀錄 note」**不一致**。

**後果**：你會看到 EIP 上同一個專案有兩個 note：
- **#A** — Phase 1 建的會議紀錄（結構化內容、無附件）
- **#B** — proposal-narration 自動建的（內容是 narration 文字、含全部附件）

**Phase 4 必須做兩件事補救**：
1. 把 #B 的 attached_files 全部 reattach 到 #A，並把投影片/影片 inline 進 #A 的 content
2. 軟刪 #B 避免重複

Phase 4 已有 `scripts/finalize_ekb.py` 處理這流程，直接呼叫即可。

---

## Phase 4 — 上 EKB + 軟刪

> **重要**：因為 Phase 3 的 `pipeline.py` 已經把 PNG / mp4 / srt 都上傳到 EKB 並 attach 到它自建的新 note，這裡的「上傳」其實是「**reattach**」+「**inline 進 Phase 1 的會議紀錄 note**」+「**軟刪 pipeline 自建的重複 note**」。

### Step 4.0 蒐集 file_id

從 Phase 3 pipeline 的 stdout 撈出 file_id（預設無字幕 → 7 個；若 narration.md `subtitles: true` → 8 個多 .srt）：
```
📎 P1: file #N1 (p1.png) attached + extracted_text 寫入
📎 P2: file #N2 (p2.png) attached + extracted_text 寫入
...
🎬 full mp4: file #N6 attached
🎬 preview mp4: file #N7 attached
📝 .srt: file #N8 attached   ← 只有 subtitles: true 才會有這行
📚 EKB note: .../note.php?id=<dup_note_id>
```

### Step 4.1 呼叫 finalize_ekb.py

```powershell
# 預設無字幕 — 不帶 --srt-id
python C:\Users\benso\.claude\skills\meeting-record\scripts\finalize_ekb.py `
  --note-id <Phase1_note_id> `
  --dup-note-id <pipeline自建note_id> `
  --png-ids 49,50,51,52,53 `
  --full-mp4-id 54 `
  --preview-mp4-id 55 `
  --duration "16:40" `
  --full-mb 25.5 `
  --content-html-path "<Phase1 base content path>"

# 若 narration.md 設了 subtitles: true，多帶 --srt-id 56
```

腳本會：
1. attach 全部 8 個 file_id 到 Phase 1 的會議紀錄 note
2. 用 `build_slide_figures_html` + `build_video_html` 包成 inline 區塊、append 到原 content
3. PATCH note + 帶 change_reason
4. DELETE 軟刪 pipeline 自建的 dup_note_id

### Step 4.2 後續軟刪舊版（同 note 多次更新時）
- 若這份會議紀錄之前已上傳過資產（例如重跑 pipeline），找出**舊版**的 PNG/mp4/srt file_id（從更新前的 note attached_files 對照新上傳的差集）
- DELETE 軟刪舊 file_id，避免 EKB 累積垃圾

---

## 檔案結構

```
meeting-record/
├── SKILL.md                          ← 本檔
├── references/
│   ├── ekb-format.md                 ← EKB note 完整格式規則
│   ├── slide-design.md               ← HTML/CSS 投影片設計指南
│   ├── pronunciation-corrections.yaml ← 語音錯字校正表
│   └── pitfalls.md                   ← 踩過的雷 + 解法
├── templates/
│   ├── slide_common.css              ← 投影片共用 CSS
│   ├── slide_topic.html              ← 議題型投影片範本
│   ├── slide_cover.html              ← 封面範本
│   └── narration.md                  ← narration.md v3.1 範本
└── scripts/
    ├── render_slides.py              ← Playwright HTML→PNG
    ├── pack_pptx.py                  ← 5 張 PNG → PPTX
    ├── ekb_publish.py                ← EKB API helpers (attach / patch / soft-delete)
    └── finalize_ekb.py               ← Phase 4 收尾：reattach + inline + 軟刪 dup note
```

---

## 環境依賴

- `OPENAI_API_KEY`（給 [[image-gen]] 用，本 skill 不需要但 EKB upload 可能需要）
- `EKB_TOKEN`、`EKB_BASE_URL`
- `ELEVENLABS_API_KEY`（給 [[proposal-narration]] TTS 用）
- Python：`playwright`, `python-pptx`, `requests`
- Playwright chromium：`playwright install chromium`
- ffmpeg

---

## 跨 skill 整合

- **proposal-narration**：Phase 3 影片產製整段委派給它
- **image-gen**：禁用（避免使用者誤用 AI 生圖做投影片）
- **handover-skill**：跨 session 接手時可保留進度

---

## 版本

- v1.0 (2026-05-27)：初版，從航空城進度會議 review 流程萃取
- v1.1 (2026-05-28)：從海循案啟動會議跑完一輪後補：
    - Phase 3.4 Windows 啟動方式（PowerShell vs Bash + PYTHONIOENCODING）
    - Phase 3.5 雷區表（含 cp950 emoji / Defender 鎖檔 / Git Bash fork crash）
    - Phase 3.6 proposal-narration 自建 note 警示
    - Phase 4 流程改為「reattach + inline + 軟刪 dup note」
    - 新增 `scripts/finalize_ekb.py`
    - 配套：`proposal-narration/scripts/pipeline.py` stdout reconfigure、`tts.py` `_apply_speed` 加 8 次 backoff retry
    - **投影片字級全面放大**（card-title 26→32、row 19→24、section-head 統一 32）
    - **slide_common.css grid-2/grid-3 預設 `flex:1`** 撐滿垂直空間、消除大片留白
    - **slide-design.md 新增「排版鐵則」**：禁 inline 縮字塞內容、強制滿版
    - **預設關字幕**（`subtitles: false`）— 1.5x 速度燒入字幕看起來很糟，視覺反而被拖累
