---
name: proposal-narration
description: 把提案 PPTX 轉成「配旁白的 MP4 影片」的完整 pipeline。當使用者說「簡報配音」「旁白影片」「簡報轉影片」「提案配音」「pptx 配音」「整份念過」「簡報加聲音做成 mp4」，或丟一份 pptx/pdf 要做 narrated video 時啟用。預設 ElevenLabs Tiffy_TW + v3，輸出 1080p mp4 + Discord 預覽壓縮版（~9 MB）。內建破音字替換表 + APP 文案模板 + 多 provider 切換（ElevenLabs / Edge / OpenAI）。
---

# 提案簡報旁白影片 Skill

PPTX + 講稿 → MP4 影片。內含跨 24 個版本反覆迭代固化的成功配方。

---

## 一、何時觸發

**啟用**：「簡報配音 / pptx 配音 / 旁白影片 / 簡報轉影片 / 整份念過 / 配音 mp4」、丟 pptx 提到「念過 / 配音」、政府提案 / 客戶簡報要做成影片。

**不要觸發**：只是要轉 PDF（用 PowerPoint COM 直接轉）、單張圖配音（用 ffmpeg 直接做）、含人臉合成的影片（不在範圍）。

---

## 二、用戶角度的 4 步驟

```
Step 1  →  給 pptx + Direction（每頁一句話 keyword）+ 聲音 / 時長
Step 2  →  ★ Claude 逐頁 Read 投影片 PNG → 填 [visual_check] →
           寫 Scripts → user 逐頁標 [approved: yes] (硬閘門)
Step 3  →  等 Claude 跑（10-15 分鐘）→ 收 mp4 + 自動 push 到 EKB
Step 4  →  看 mp4 → 微調哪頁 → 改 narration.md (含改回 approved: no
           review 後再 yes) → 重跑
```

**三道防腦補閘門 (自 v3.1 加，因為 v3.0 出過「俊毅那段 hallucinate」事件)**：

1. **逐頁視覺確認 (Patch A)** — Claude 在寫 Scripts 前必須真的 Read 每張 PPT 的 PNG，
   在每頁 `[visual_check: ...]` 填一行視覺描述。若 Direction 跟 visual_check 對不上
   要主動標 ⚠️ 給 user 看。

2. **講稿 approve lock (Patch B)** — narration.md 每頁有 `[approved: no]`，
   user 沒逐頁改為 yes 之前，pipeline.py 直接 raise RuntimeError 拒絕跑。
   防止 Claude 寫完直接合成 user 沒看過的版本。

3. **EKB 永久回寫 (Patch C)** — pipeline 跑完後自動 upload 每張 PNG + mp4 到 EKB，
   每個 file 的 `extracted_text` 直接寫入 narration + visual_check (含 marker
   `=== 旁白原稿 by proposal-narration ===`)。下次任何 AI 看那篇 EKB note 都
   有真實旁白當 ground truth，extract_status 不再是 pending。

---

## 三、Step 1 確認對話（**必問聲音 + 時長**）

讀取 `references/voices.yaml`，列出所有聲音給用戶選：

```
🎬 旁白影片建議：
  來源 PPTX：{path}
  預估頁數：{n}
  影片長度：標準 10 分鐘 / 正式 20 分鐘
  輸出：1080p MP4 + Discord 壓縮預覽（~9 MB）
  預估費用：USD ~$0.5 / 預估時間：10-15 分鐘

🎙️ 配音聲音選哪個？
  {動態列出 voices.yaml 所有 entry}
```

**規則**：
- ❌ 不要預設聲音 — 一定要問
- ❌ 沒答覆前不要動工
- ✅ 用戶說「同上次」→ 查當前 project 的 memory（`memory/elevenlabs_voice_config.md`）

---

## 四、檔案結構（**動工前先讀**）

```
proposal-narration/
├── SKILL.md                              ← 你正在讀
├── scripts/
│   ├── tts.py                            ← TTS 統一介面（多 provider）
│   └── pipeline.py                       ← 完整 pipeline（CLI 可直接跑）
├── templates/
│   ├── narration_template.md             ← 講稿範本（Meta + Direction + Scripts）
│   ├── app_page_6_steps.md               ← APP / 服務頁 6 段式文案模板
│   └── chapter_transitions.yaml          ← 章節過場頁旁白（20+ 分鐘版用）
└── references/
    ├── voices.yaml                       ← 12 個聲音清單（user 可編輯）
    ├── pronunciation_fixes.yaml          ← 破音字替換表（user 可加詞）
    └── pitfalls.md                       ← 24 條真實踩過的雷
```

---

## 五、各檔案用途速查

| 任務 | 讀哪個 |
|---|---|
| 列聲音給用戶選 | `references/voices.yaml` |
| 加新聲音 / 用戶要編 | 引導編輯 `references/voices.yaml` |
| 寫講稿前看模板 | `templates/narration_template.md` |
| APP / 服務頁文案要打動人 | `templates/app_page_6_steps.md` |
| 20+ 分鐘版加章節過場 | `templates/chapter_transitions.yaml` |
| TTS 前必過破音字 | `references/pronunciation_fixes.yaml` |
| 加新破音字（user 回報念錯了） | 在 `references/pronunciation_fixes.yaml` 加 entry |
| 動工前避雷檢查 | `references/pitfalls.md` |
| 跑完整 pipeline | `scripts/pipeline.py` |
| 程式只用 TTS（單頁測試） | `scripts/tts.py` |

---

## 六、講稿工作流（含三道閘門）

1. 用戶 `cp templates/narration_template.md → {專案}/narration.md`
2. 用戶填 Meta（聲音 / 時長 / **speed (預設 1.5)**）+ Direction（每頁一句 keyword）
3. **★ Claude 逐頁 Read pptx 轉出的 PNG**（pipeline 內 `extract_pages_to_png` 先跑），
   每頁填 `[visual_check: <視覺描述>]` 跟 Direction 對齊驗證。
   不一致 → 標 ⚠️ 跟 user 確認 keyword 還是視覺哪個是對的。
4. Claude 寫 Scripts（每頁仍維持 `[approved: no]`）
5. **★ 用戶逐頁 review** Scripts 跟 visual_check：對的 → 改 `[approved: yes]`；
   不對的 → 直接改 Scripts 文字 → 改 `[approved: yes]`
6. Claude 跑 `python scripts/pipeline.py {pptx} {narration.md}`
   - 任一頁 `[approved: no]` → 直接 RuntimeError 拒絕（閘門 B）
   - 全 approved → 跑 TTS → ffmpeg atempo speed → 合成 mp4
   - 產 `.srt` (按句切，時間軸從各頁 audio 長度估算) → ffmpeg burn-in 進
     `full_subtitled.mp4` (硬字幕)；preview 也走字幕版
   - **自動 upload mp4 + 字幕版 mp4 + .srt + 每張 PNG 到 EKB**，extracted_text 寫好旁白稿（閘門 C）
7. 用戶看 mp4 → 哪頁要改 → 編輯 narration.md（記得改回 approved: no 再 yes）→ 重跑

**關鍵**：講稿是獨立檔，跟 pptx 同目錄一起版控。微調直接改 markdown，不用 Claude 重寫。
**閘門不可繞**：Claude 不能用 `allow_unapproved=True` 偷跑 — 那參數是給人 emergency 用的，用了會印警告。

---

## 七、跑 pipeline

直接呼叫 `scripts/pipeline.py`：

```python
import sys
sys.path.insert(0, os.path.expanduser("~/.claude/skills/proposal-narration"))
from scripts.pipeline import run

result = run(
    pptx_path="專案管理/簡報/Benson.pptx",
    narration_md_path="專案管理/簡報/narration.md",
    voice_key="B",  # 從 voices.yaml 選，預設讀 narration.md 的 voice_key
    work_dir="video/output_v1",
)
# result = {full_mp4, preview_mp4, n_pages, full_mb, preview_mb}
```

或 CLI：
```bash
python scripts/pipeline.py Benson.pptx narration.md B video/v1
```

---

## 八、動工前必做的檢查（避雷）

1. ☐ 用戶中文姓名確認過？（曾踩雷：把林秉澄叫成楊益松）
2. ☐ 全 deck grep 過敏感關鍵詞？（曾踩雷：影片做完才發現「水質」沒清乾淨）
3. ☐ 視覺與旁白主題對齊？（曾踩雷：架構圖含 YOLO 但旁白沒提）
4. ☐ PPTX 沒被用戶開著？（會鎖檔，請用戶關閉 PowerPoint）
5. ☐ 用「原始」pptx，不是「之前 patch 過的」？（連續 patch 會 zip 損壞）

詳見 `references/pitfalls.md` 全 24 條真實踩過的雷。

---

## 九、環境依賴

本 skill 預期以下環境變數已在 `~/.claude/settings.json` 的 `env` 區塊設好（Claude Code 啟動時自動載入）：

| 環境變數 | 用途 | 沒設會怎樣 |
|---|---|---|
| `ELEVENLABS_API_KEY` | ElevenLabs TTS（A-D voice / 預設）| 用 ElevenLabs 聲音時 raise RuntimeError |
| `OPENAI_API_KEY` | OpenAI TTS（I-L voice）+ gpt-image-2（如要重畫架構圖）| 用 OpenAI 聲音 / 生圖時失敗 |

**Edge TTS（E/F/G voice）不需要 key**，pip install edge-tts 即可。

### 驗證 env 是否載入
```python
import os
print("ELEVENLABS:", "✅" if os.environ.get("ELEVENLABS_API_KEY") else "❌")
print("OPENAI:", "✅" if os.environ.get("OPENAI_API_KEY") else "❌")
```

### Python 依賴
```
pip install python-pptx pymupdf pywin32 requests openai pyyaml edge-tts
```
（Windows 需 PowerPoint 安裝；Mac/Linux 用 LibreOffice headless 替代 PowerPoint COM）

---

## 十、跨 skill 整合

- **proposal-pptx**：產 pptx → 本 skill 接手把 pptx 變影片
- **image-gen**：要重畫架構圖 / 主視覺（用 gpt-image-2，不要 -1）→ 嵌入 pptx 後本 skill 處理
- **handover-skill**：跨 session 接手，本 skill 進度 + narration.md 都可被 handover 保留

---

## 版本歷史

- **v3.1 (2026-05-27)**：三道防腦補閘門 + 預設 1.5x + 字幕。事件：v3.0 在「航空城 5/27
  會議」影片產製時，AI 沒實際看投影片就生 narration，整支影片胡亂講跟主題無關。修補：
  - Patch A：narration.md 每頁加 `[visual_check]`，Claude 必須 Read 過 PNG 才填
  - Patch B：每頁 `[approved: no/yes]`，未全 approve 則 pipeline 拒絕跑
  - Patch C：跑完自動 upload PNG + mp4 + .srt 到 EKB，extracted_text 寫真實旁白
  - 預設語速 1.0 → **1.5**（Benson 偏好），走 ffmpeg atempo 變速不變調，
    可由 narration.md Meta `speed:` 或 voice.speed 覆蓋
  - **字幕**：跑完自動產 `.srt` (中文按句切，時間軸用各頁 mp3 長度估算) 並用 ffmpeg
    `subtitles` filter 燒進 `full_subtitled.mp4` (硬字幕，所有播放器看得到)。
    Discord preview 也用字幕版當來源。.srt 一起 push 到 EKB 給 user 下載外掛字幕。
    可由 narration.md Meta `subtitles: false` 關閉。
    字型樣式：FontSize=24（1920×1080 下約 2% 畫面高）+ 半透明黑底條 + 貼底邊（MarginV=24），
    不擋主視覺。
- **v3.0 (2026-05-04)**：依 Anthropic 官方 progressive disclosure 重構。SKILL.md 砍到 ~150 行只當目錄。code/templates/references 全部拉到子目錄。
- ~~v2.0 (2026-05-04)：完全重寫，657 行~~
- ~~v1.0 (2026-05-04)：初版~~
