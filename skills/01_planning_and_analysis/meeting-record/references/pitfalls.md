# 踩過的雷 — meeting-record skill

從航空城進度會議 (2026-05-27) 6 輪打回票收斂出的雷區。

---

## 1. 標題雷

❌ `高鐵一路326號 #39 會議紀錄（2026-05-27）`
- 場地名 ≠ 會議名
- `#39` 流水號沒人記得
- 「會議紀錄」四個字是廢話

✅ `航空城進度會議（2026-05-27）— AI 預審 / 管線生成 週進度`

**避雷**：標題格式 = `{會議正式名}（{日期}）— {本次重點主題}`

---

## 2. Tags 含日期雷

❌ `tags: ["航空城", "會議紀錄", "AI預審", "管線生成", "知識庫", "2026-05"]`

**Why**：日期靠 created_at 排序就好。日期當 tag 會累積到爆炸（每個月都生一個新 tag）。

✅ `tags: ["航空城", "會議紀錄", "AI預審", "管線生成", "知識庫"]`

---

## 3. 與會欄帶角色括號雷

❌ `與會：龍哥（生成 API）、諺庭（管線前端）、家宏（AI 預審 / 水理 / CSV / 3D）...`
- 角色已經在各議題下標「負責：XXX」
- 與會欄重複寫只是噪音

✅ `與會：龍哥、諺庭、俊毅、家宏、tina、建成、Benson`

---

## 4. 同音字錯認雷

語音轉文字會把人名認錯：

| 逐字稿出現 | 實際 | 後果 |
|---|---|---|
| 燕婷 | 諺庭 | 整份分派錯人 |
| 嘉紅、家紅 | 家宏 | 同上 |
| 軍、軍意 | 俊毅 | 同上 |
| 婷婷 | 諺庭（少見） | 同上 |

**避雷**：**Phase 1 開工前必問**：「逐字稿出現的這幾個名字 X、Y、Z，正確姓名是？」

---

## 5. AI 生圖做投影片雷

❌ 用 GPT Image 2 / DALL-E 生帶中文字的投影片
- 小字會破
- 字距不準
- 對齊偏移
- 改不動（要整張重生）
- 收費

✅ HTML / CSS + Playwright headless chromium
- 100% 銳利
- 免費
- 秒級回饋
- 改一個字 → re-render 5 秒搞定

**避雷**：投影片用 templates/slide_common.css + slide_*.html 範本，跑 scripts/render_slides.py

---

## 6. 旁白寫太精簡雷

❌ 「俊毅這週要做 4 件事：自審環節、Word 範本、圖名辨識、9 項複核。」（30 秒結束）

✅ 每件事都要展開：
- 現況是什麼問題
- 為什麼這樣決議（脈絡 / 誰提出 / 為什麼是這個方案）
- 細節怎麼做（PDF 下載、紅框標記、重新上傳…）
- 負責人下手點

每張投影片至少 5 分鐘旁白才叫飽和。

**避雷**：寫旁白前先 grep 逐字稿找該議題的所有討論段，把脈絡都寫進旁白。

---

## 7. 「責任分派總表」雷

❌ 在會議紀錄裡塞一張「依負責人 aggregate 所有任務」的大表
- 那是 PM dashboard 範疇
- 會議紀錄是 per-meeting event，不該扮演 PM 工具

✅ 各議題下標「負責：XXX」OK
✅ 結尾「下次必交清單（依負責人）」OK（因限定下次會議前）
❌ 全局 by-person 任務總表 NOT OK

---

## 8. 頁尾自我交代雷

❌ 在 note 末尾寫：
```
原始逐字稿見附件「XXX.md」
備註：本份彙整已校正「預神→預審」「省合→審核」...
```

**Why**：附件已掛 EKB attached_files 區、讀者自己看得到。錯字校正對照是 AI 工作筆記，不是讀者價值。會增加噪音。

✅ Note 結束在「延後議題」最後一項，乾淨收尾。

---

## 9. EKB upload size 雷

EKB PHP 預設 upload_max_filesize / post_max_size 為 50 MB。

❌ 直接上傳 55+ MB 的 full.mp4 → HTTP 400 "no_file"

✅ ffmpeg 重壓 crf 28 到 ~30 MB（仍然 1080p 可看）：
```bash
ffmpeg -i full.mp4 -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k full_compressed.mp4
```

---

## 10. EKB 圖片 inline 沒生效雷

上傳的 PNG 如果 mime_type 被偵測成 `application/octet-stream`（而不是 `image/png`），attach_file 的 append_to_content 會 fallback 成 `<a class="ekb-attachment">` 連結，**不會 inline 顯示**。

✅ 手動把 content 內的 `<a>` 改成 `<img src="api/files.php?id={X}&download=1&inline=1" style="...">`

---

## 11. PATCH 內容覆寫 attachment index 雷

EKB 的 `ekb_note_files` 表是從 content HTML 內掃 `api/files.php?id=X` 重建的。

❌ PATCH content 時把舊的 attachment HTML 拿掉 → 舊 file 的 attached_files 索引自動消失

✅ 重 PATCH 後要用 `POST /api/notes.php?id={X}&op=attach_file` 把需要保留的附件重新 attach（即使檔案還在 storage）

---

## 12. Windows file lock 雷

ElevenLabs TTS pipeline 跑到 p2+ 時偶發 `PermissionError: [WinError 5]` on `os.replace(tmp, mp3_path)`

**Why**：Windows Defender 即時掃描鎖住剛寫出的 mp3，`os.replace` 失敗

**現況（2026-05 後）**：`proposal-narration/scripts/tts.py` 的 `_apply_speed` 已內建 8 次 exponential backoff retry（0.5s → 4s），絕大多數情況會自動恢復。

❌ **不要用「刪 output dir 重跑」當第一線解法** — 會重付 ElevenLabs TTS cost（一份 25 分鐘旁白要 $4-8 USD）

✅ 如果用的是舊版 tts.py 沒有 retry，外層 wrapper monkey-patch：
```python
import os, time
_real_replace = os.replace
def _retry_replace(src, dst, max_tries=8):
    for i in range(max_tries):
        try: return _real_replace(src, dst)
        except PermissionError:
            if i == max_tries - 1: raise
            time.sleep(0.5 * (i+1))
os.replace = _retry_replace
```

---

## 13. narration.md heading level 雷

`proposal-narration` pipeline.py 的 regex 是 `^##\s*P\d+\s*$`，**只認 h2 不認 h3**。

❌ `### P1` → pipeline 抓不到 → TTS 跑 0 頁

✅ `## P1`（兩個 #）— 雖然 v3.1 範本看起來像 h3，但 pipeline parser 認 h2

如果使用者編輯後 narration.md 用了 `###`，自動全替換成 `##` 再跑。

---

## 14. preview.mp4 moov atom 損壞雷

proposal-narration pipeline 偶發產出損壞的 preview.mp4（壓縮過程被中斷或 Windows 檔案系統問題）

✅ 一律從 `full_subtitled.mp4` 重壓 preview：
```bash
ffmpeg -i full_subtitled.mp4 -vf scale=854:-2 -c:v libx264 -crf 30 -preset medium -c:a aac -b:a 96k preview.mp4
```

---

## 15. Windows cp950 印 emoji 炸雷

`pipeline.py` / `tts.py` 內 print `✅` `❌` `📝` `🎬` 等 emoji 時，Windows 預設 cp950 codepage 會丟 `UnicodeEncodeError`，**整個 pipeline 直接掛掉**、之前跑完的 TTS 結果保留但流程中斷。

**現況（2026-05 後）**：`proposal-narration/scripts/pipeline.py` 開頭已 `sys.stdout.reconfigure(encoding="utf-8", errors="replace")`。

✅ 保險仍建議 PowerShell 啟動前：
```powershell
$env:PYTHONIOENCODING="utf-8"; $env:PYTHONUTF8="1"
python pipeline.py ...
```

---

## 16. Git Bash background fork crash 雷

Claude Code 在 Windows 用 Bash tool 跑 `python ... &` 時偶發 `fatal error - add_item ("\??\C:\Program Files\Git", "/", ...) failed, errno 1`，**background task 0 秒掛掉、log 空白**，看不出在哪炸。

**Why**：Cygwin fork() 在某些 Git Bash 安裝路徑下會失敗

✅ **Windows 跑 pipeline 一律用 PowerShell tool**：
```powershell
Set-Location "..."; python pipeline.py ... 2>&1 | Tee-Object -FilePath log.txt
```

---

## 17. proposal-narration 自建新 EKB note 雷

`proposal-narration/scripts/pipeline.py` 跑完後**會自己呼叫 EKB API 建一個全新 note**（叫 #B），把 PNG / mp4 / srt 都 attach 到 #B 上。**這跟 meeting-record 預期「資產接到 Phase 1 建好的會議紀錄 note（#A）」不一致**。

❌ 不處理 → EIP 上同一個專案會有兩份 note：
- #A：結構化會議紀錄、**沒附件**
- #B：narration 純文字、**附件全部在這**

✅ Phase 4 跑 `meeting-record/scripts/finalize_ekb.py`：
1. 從 pipeline stdout 撈 8 個 file_id（5 PNG + full mp4 + preview mp4 + srt）
2. 全部 reattach 到 #A
3. PATCH #A content 加 inline `<figure>` + `<video>` 區塊
4. 軟刪 #B

**Why 不直接改 proposal-narration**：那個 skill 也有 standalone 使用情境（提案配音、不接 meeting-record），那情境下自建 note 是合理行為。修在 meeting-record 端負責收尾比較乾淨。

---

## 18. 會議沒延續性 / 沒追蹤上次事項雷（重大）

❌ 把每份會議紀錄當「一次性事件」彙整，只寫本次討論，**沒有回顧「上次必交事項做了沒」**。

**Why**：會議是一條系列。上次的必交清單／延後議題就是這次的追蹤事項，沒做完的會一路 roll-forward。少了追蹤，會議紀錄變成散沙、無法問責、看不出進度。使用者原話：「我覺得會議記錄應該就是會延續，而且沒做完的應該持續追蹤」。

✅ 系列會議第 2 次起，**每份紀錄頂部固定「① 上次事項追蹤表」**（負責 / 上次事項 / 狀態(完成/進行中/未動/續追) / 本次進展），未完成項 roll-forward 進文末「下次必交」。詳見 `ekb-format.md §A2`。判斷狀態要對照逐字稿誠實標，沒談到就標「本次未動」。

---

## 19. 「解決方案」只寫表面結論、沒分析解法邏輯雷（重大）

❌ 議題討論出「具體解法」時，彙整只寫表面結論（如「提供範本＋手動輸入＋不適用 checkbox」），把真正的解法邏輯（為什麼這樣解、怎麼運作、分幾階段）整個漏掉。

**Why**：會議的價值就在「怎麼解決問題」。只寫結論等於把最有資訊量的部分丟掉。使用者原話：「不是提供了一個解決方案，你怎麼沒分析到」。

✅ 遇到「解法／方案」要展開分析：① 痛點本質（為什麼難）② 核心解法怎麼運作 ③ 容錯／退路 ④ 分幾階段（先做什麼、什麼列第二階段）⑤ 待確認。範例（航空城 #43 圖名比對）：核心解法＝「缺圖時靠 OCR 列出 PDF 哪幾頁相關、讓技師自己挑選/打勾」，而不是只寫「手動輸入圖名」。
- **做法**：寫議題前，先用關鍵字（解法/方案/怎麼做/OCR/比對…）grep 逐字稿，把該議題所有討論段抓出來，確認有沒有「解法邏輯」被埋在口語裡。必要時對逐字稿跑一輪「專挖解決方案」的二次萃取。
