# 24 條真實踩過的雷（跨 24 個版本累積）

任何決策前先翻一遍。**這些不是猜測，是真的踩過**。

| # | 雷 | 解法 |
|---|---|---|
| 1 | OpenAI TTS-HD 中文帶洋腔 | 用 ElevenLabs |
| 2 | ElevenLabs v2 + 預設參數 = 念稿 | 用 v3 + style 0.70 |
| 3 | stab < 0.30 走音 | 守住 0.50 |
| 4 | stab/style 都 1.0 = 機械化 | 守住 0.50/0.70 |
| 5 | Discord 音檔 clone 不夠專業 | 改用 Library Tiffy |
| 6 | 不做破音字 → 簡報→健保 | 一定要過 `apply_pronunciation_fixes()` |
| 7 | 連續 patch pptx 損壞（zip duplicate）| 每次從原檔 copy |
| 8 | PowerPoint COM `Quit()` 偶爾報錯 | try/except 包起來，PDF 通常已 export 成功 |
| 9 | PPTX 被 user 開著鎖檔 | 請 user 關掉，**不要強制刪檔** |
| 10 | 完整 mp4 > 25 MB Discord 不收 | 壓縮 854x crf 34 → 7-9 MB |
| 11 | gpt-image-1 中文錯字爆多 | 用 gpt-image-2 |
| 12 | APP 頁寫功能列表被嫌薄弱 | 用 `templates/app_page_6_steps.md` 6 段式 |
| 13 | v3 audio tag 對中文響應有限 | 改用標點符號（——、……、空行）控制節奏 |
| 14 | python-pptx `notes_text_frame` 為 None | fallback 到 placeholder.text_frame.text 或直接 XML 操作 |
| 15 | 改 P1「我是 XXX」配音 → 換女聲後不適合 | 改成「歡迎來到這場提案 / 主題介紹」 |
| 16 | 砍某 bullet / 某頁，只改音不改視覺 → 觀眾混亂 | **視覺 + 旁白同步改** |
| 17 | 架構圖含 YOLO 但旁白沒提 → 評審 confused | **視覺與旁白要對齊** |
| 18 | 講「水質」但提案要砍水質 → 立場矛盾 | 全篇關鍵詞 grep 掃描，砍乾淨 |
| 19 | 「AND/OR 邏輯閘」描述但案子用 LLM → 技術衝突 | 統一改 LLM 統一推論 |
| 20 | 副標題沒同步更新（封面 P1 的小字） | patch list 要納入 P1 subtitle |
| 21 | 跑完 18 頁才發現 user 本名打錯 | **寫旁白前先確認 user 中文姓名** |
| 22 | 確認對話太多回合 user 不耐 | Step 1 一次到位確認，後面直接動工 |
| 23 | 影片生成完 user 才說「水質還在」 | 動工前先 grep 全 deck 確認關鍵詞清乾淨 |
| 24 | gpt-image high quality 60-90 秒，user 等到不耐 | 跑時就告知預估時間，跑完馬上送預覽 |

---

## 預防性檢查清單（每次動工前）

- [ ] 用戶中文姓名確認過？
- [ ] 全 deck grep 過敏感關鍵詞（已被 user 砍的詞）？
- [ ] 視覺與旁白主題對齊？
- [ ] PPTX 是 user 開著的嗎？（鎖檔風險）
- [ ] pptx 是「原始版」還是「之前 patch 過的」？（連續 patch 損壞風險）

---

## 已被驗證不適合的選擇

詳見 `references/voices.yaml` 的 `not_recommended` 區塊：

- ElevenLabs `eleven_multilingual_v2` / `eleven_turbo_v2_5` / `eleven_flash_v2_5`
- ElevenLabs stability < 0.30
- ElevenLabs stability=1.0 + style=1.0
- OpenAI TTS（中文洋腔，台灣 user 不接受）— 但保留為選項給「英中混合內容」用
- Edge TTS — 不能 clone，但保留為「免費 / 測試」選項
