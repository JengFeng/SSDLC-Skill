---
name: ekb-note-tts
description: 把 EKB 知識庫的某篇筆記「配上 AI 講解語音」。當 Benson 說「把這篇配音」「配講解」「唸給我聽」「這篇做成語音」「note <id> 配音」，或給一個 EKB note id / url 要做成語音講解時啟用。流程：讀筆記 → Claude 親自寫口語講稿 → Edge TTS / ElevenLabs 產 mp3 → 上傳並掛成該筆記的 narration（獨立於內文，note.php 內文上方會出現「🎧 本篇講解」播放器）。預設 HsiaoChen 微軟免費語音、零成本。
---

# ekb-note-tts — 幫 EKB 筆記配 AI 講解語音

## 這是什麼
針對「每一篇筆記」產生一段**口語講解配音**，獨立掛在筆記旁（不污染可編輯內文）。
note.php 會在內文上方顯示「🎧 本篇講解」原生播放器；owner 頁與分享唯讀頁都能聽。

## 觸發詞
「把這篇配音」「配講解」「唸給我聽」「做成語音」「note `<id>` 配音」「這篇講一遍給我聽」+ 通常帶 note id 或 note.php url。

## 環境（已就緒，不用問使用者）
- `$env:EKB_TOKEN`、`$env:EKB_BASE_URL`（= `https://your-server.example.com/EIP/ekb`）
- python + `edge-tts` + `ffmpeg`（變速用）
- 複用 `~/.claude/skills/proposal-narration/scripts/tts.py`（voices.yaml 聲音清單 / 破音字表 / atempo 變速）

## 流程 SOP

### 1. 讀筆記
```
GET {EKB_BASE_URL}/api/notes.php?id=<ID>     header: X-EKB-Token: $EKB_TOKEN
```
取 `data.title` 與 `data.content_text`（已是乾淨純文字）。

### 2. 寫口語講稿 ★品質關鍵（Claude 親自寫，不是把原文硬唸）
把筆記改寫成「講給人聽」的旁白，存成 UTF-8 `.txt`（例：`C:\github\EIP\temp\note<ID>_script.txt`）。守則：
- 開場一句點題：「這篇筆記在講⋯，我幫你把重點講一遍。」
- 條列 / 表格 / 心智圖 → 改寫成**連貫口語句子**，不要照符號唸
- 展開縮寫與英文（SVG→向量圖、logo→標誌、PM→專案經理…）；不要唸出 markdown 符號 / 原始 URL / 程式碼
- 台灣口語、自然連接詞（「那」「再來」「重點是」「總結一下」）
- 結尾總結一句
- 抓重點即可，一般 800–1500 字 ≈ 2–4 分鐘

> 這步決定好不好聽。**直接硬唸筆記原文 = 難聽**（試過，被打槍）。一定要先改寫成講稿。

### 3+4. 產 mp3 + 上傳 + 掛載（一支 script 全包）
```powershell
$env:PYTHONIOENCODING="utf-8"
python "$env:USERPROFILE\.claude\skills\ekb-note-tts\scripts\narrate_note.py" `
  --note-id <ID> --script "C:\github\EIP\temp\note<ID>_script.txt" --voice E --speed 1.3
```
- `--voice E` = HsiaoChen 微軟**免費**女聲（預設）；`B` = Tiffy_TW（ElevenLabs 付費、最佳）；其餘見 `proposal-narration/references/voices.yaml`
- `--speed` 預設 `1.3`
- 自動：**卸掉舊講解（一篇一個）→ 上傳 → 掛成 `relation='narration'`（`append_to_content=false`，不進內文）**
- `--keep-old` 可保留舊講解

### 5. 回報
給 Benson 筆記頁 URL + 試聽 URL，提醒重整看「🎧 本篇講解」。

## 設計重點 / 踩過的坑
- **不要在前端用瀏覽器 `speechSynthesis` 唸**：zh-TW 機械音太差、逐句頓，被打槍。要走後端 TTS 產連續 mp3。
- 講解音檔以 `ekb_note_files.relation='narration'`、`append_to_content=false` 掛載 → **獨立於可編輯內文**。
- `EKBNote::syncFiles()` 已改成只自動管理 `relation='attachment'`，所以**編輯內文存檔不會誤刪講解音檔**。
- note.php 內文上方「🎧 本篇講解」只認 `relation='narration'` 的 audio 檔。
- 換聲音 / 語速 → 重跑覆蓋（自動先卸舊）。
- DB：`ekb_note_files.relation` enum 已含 `narration`。
- 部署：EKB 改動要 `cp` 到 `Z:\EIP`（NAS）。相關 EKB API 規格見 EKB api-docs；TTS 來源見 proposal-narration。
