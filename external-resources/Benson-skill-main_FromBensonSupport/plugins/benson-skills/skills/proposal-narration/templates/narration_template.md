# ============================================================
# proposal-narration / narration_template.md
# ------------------------------------------------------------
# 講稿範本。每個專案複製一份命名為 narration.md，跟 pptx 同目錄。
#
# 三個區塊：
#   1. Meta — 專案基本資訊（聲音 / 時長 / 來源 pptx）
#   2. Direction — 用戶給的「每頁敘述說明」（一兩句 keyword 即可）
#   3. Scripts — Claude 依 Direction + 看 PPT 視覺生成的完整講稿
#
# 工作流：
#   1. 用戶填 Meta + Direction（每頁一句話）
#   2. Claude 看 pptx + Direction → 生成 Scripts → 用戶 review
#   3. Claude 跑 TTS + ffmpeg → mp4
#   4. 用戶看 mp4 → 直接改 Scripts 對應頁 → 重跑
# ============================================================

## Meta

```yaml
project: 專案名稱（例：Benson 115 農工中心）
pptx_path: 相對或絕對路徑（例：專案管理/簡報/AI農業智慧栽培簡報_Benson.pptx）
voice_key: B               # 從 voices.yaml 取（A/B/C/D/E/F/G/H/I/J/K/L）
duration_target_min: 10    # 目標時長：10 / 20 / 30
speed: 1.5                 # 語速倍率 (預設 1.5, 範圍 0.5–2.0；走 ffmpeg atempo 變速不變調)
subtitles: true            # 字幕開關 (預設 true)；false 跳過字幕產生，輸出純 mp4
last_updated: 2026-05-04
```

---

## Direction（用戶填，一頁一句即可）

```yaml
P1: 開場 / 介紹 AI 農業主題 / 從靠天吃飯到靠數據吃飯
P2: 為什麼做這件事 / 68% 用水數字 / 兩主軸 + 五面向
P3: 楊梅田 3.4 公頃 / 放流水首創 / 強調 ESG / 碳吉米
P4: 系統技術全景 / 4 層架構 / LLM 統一推論
P5: 株高量測 / ArUco 標記 / 60cm 結果 / 誤差 5%
P6: 綠覆率 / HSV 色相分割 / 89.1% / 雙軌驗證
P7: 葉色 LCC / Level 3 / 對應氮肥
P8: APP 首頁 / 三色燈號 / AI 三項數值 / LINE 推送 / 用 6 段式
P9: AI 田間助理 / 台語可問 / 15 篇文獻引證 / 可審計
P10: 歷史趨勢 / GDD 曲線 / 30 日燈號 / 報告匯出
P11: 低門檻 / 傳統 vs AI 對比 / 雲端運算 / 推廣性
P12: GDD 概念 / 三階段 / MGDD 修飾
P13: 兩層判斷因子 / 環境氣象 + AI 知識庫
P14: RAG+LLM 5 步驟流程 / SHAP 拆解
P15: 複合式 AI / 準確率 60-70% → 85-90%
P16: SHAP 因子貢獻 / 為什麼黃燈 75%
P17: 量化效益 / 三省二減 / ESG
P18: 收尾 / 痛點 + 雙贏 / 謝謝
```

**寫法提示**：
- 一頁不超過 1-2 行
- 列「想強調什麼」而非「逐字稿」
- 標出特殊要求（例「P8 用 6 段式」「P3 強調 ESG」）

---

## Scripts（Claude 生成，用戶 review 微調）

> 這個區塊由 Claude 依 Direction + **逐頁看 PPT 視覺**自動填入。用戶看完可直接編輯文字微調。
>
> **★ 每頁的 `## P{n}` header 下方有 `[approved: no]` marker — 用戶 review 過該頁 OK 後改為 `[approved: yes]`，pipeline.py 才會跑該頁 TTS。任一頁未 approved → 整個 pipeline 拒絕跑。這是防止 AI 亂寫直接合成的硬閘門。**

### P1
[approved: no]
[visual_check: Claude 看 P1 圖後填的視覺描述（一行）]
{Claude 生成的完整講稿}

### P2
[approved: no]
[visual_check: ...]
{...}

### P3
[approved: no]
[visual_check: ...]
{...}

（以下每頁類推 P4-P18）

---

## Notes（可選）

- 特定詞要強調：
- 不要提到的詞：
- 偏好風格（嚴肅/輕鬆/活潑/沉穩）：
- 其他：

---

## 版本歷史

- 2026-05-04: 初版
