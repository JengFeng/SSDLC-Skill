# {會議名稱} {日期} — 介紹影片旁白稿 (v3.1)

## Meta

```yaml
voice_key: B            # Tiffy_TW (ElevenLabs v3 女聲 / 台灣腔)
speed: 1.5              # ★ 預設 1.5x (ffmpeg atempo 變速不變調)
subtitles: false        # ★ 預設關字幕 — 燒入字幕在 1.5x 速度下視覺很差
duration_min: 25        # 5 張 × 5 分鐘
date: YYYY-MM-DD
project: {專案名}
last_updated: YYYY-MM-DD
```

---

## Direction（每頁主軸 keyword）

- P1：開場 / 議題 overview / 與會
- P2：議題一（核心議題）
- P3：議題二（含子議題群）
- P4：議題三 + 議題四（短議題合張）
- P5：下次必交清單 + 延後議題

---

## Scripts

> 每頁 `[approved: no]` → user 必須逐頁 review，OK 後改為 `[approved: yes]`，pipeline 才會跑。
> `[visual_check]` 為 Claude 真實看過 PNG 後填的視覺描述（不是腦補）。

## P1
[approved: no]
[visual_check: <跑完 render_slides.py 後用 Read 看 P1 PNG，把實際看到的內容填這裡>]

歡迎各位收聽 {YYYY 年 MM 月 DD 日} {專案名} 的進度會議週報。

{展開：誰主持、為何開會、本次重點 3-5 點}

接下來這 {25} 分鐘，我會逐一展開這 {5} 大議題的細節。每個議題我會講「現況是什麼」、「決議了什麼」、「為什麼這樣決」、「誰下手負責」。

## P2
[approved: no]
[visual_check: <填>]

{議題一展開 — 每個子議題寫: 現況 → 為什麼這樣決議 → 細節 → 負責人。約 5 分鐘}

## P3
[approved: no]
[visual_check: <填>]

{議題二展開}

## P4
[approved: no]
[visual_check: <填>]

{議題三＋四展開}

## P5
[approved: no]
[visual_check: <填>]

{下次必交清單，按人列。最後 B 區延後議題}

---

## Notes

- 1.5x 語速：採 v3.1 預設，ffmpeg atempo 變速不變調
- 字幕：v3.1 會自動產 .srt 並燒進 full_subtitled.mp4
- EKB 自動 push：跑完 pipeline 後每張 PNG + mp4 + .srt 都會帶 extracted_text 寫進 EKB
