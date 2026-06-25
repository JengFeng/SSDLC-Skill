---
name: project-pulse
description: |
  專案問答 / 專案把脈 — 把「問某專案的某主題」變成跨四層分層作答的單一入口。當使用者問「{專案} {主題}」這種句式，例如「桃園水情 路面淹水機制」「航空城 影像辨識怎麼做」「XX 案 OO 機制是什麼 / 怎麼運作 / 做到哪 / 有什麼特色 / 跟別人差在哪」，或想快速掌握某專案某功能 / 議題 / 機制的現況時啟用。本 skill 是「組合技能（組合劑）」：自己不撈資料，而是調度 ekb-note（EKB 定案知識）、eip-item-builder（EIP 工項指派）、eip-line-radar（LINE 討論）、專案資料夾掃描 四個來源，依「資料成熟度」分四層作答並標示可信度。預設**漸進式**：先打 EKB 秒回第一段，使用者要「還在喬什麼 / 誰在做 / 最新討論」才往下展開其他層 —— 不一次四層全撈（慢）。鐵則：**只講資料裡真有的，查無就說查無，絕不用訓練知識唬爛。**
---

# project-pulse — 專案問答 / 專案把脈

> 你丟一句「{專案} {主題}」→ 我按四層分層作答，每層標成熟度。
> 完整設計理念見 `references/architecture.md`；各源 API 規格見 `references/data-sources.md`；專案名↔ID 對照見 `references/project-mapping.md`。

---

## 一、這是什麼（定位）

**組合技能（指揮 ↔ 樂手）**：本 skill 不重造任何撈取功能，它是「指揮」，把使用者現有的「樂手 skill」按四層漸進式調度起來合奏成一個答案。

```
你問「桃園水情 路面淹水機制」
        ↓
🎯 project-pulse（指揮）= 把問題拆成四層、分頭去借樂手、再合起來
        ↓ 分頭去問（借用現有 skill，不重做）
📗 既定事實  · EKB 筆記      ← 借 ekb-note         ✅ 定案
📋 指派中    · EIP 工項      ← 借 eip-item-builder  🔵 進行中
💬 討論中    · LINE/Outlook  ← 借 eip-line-radar    ⚠️ 未定案
📁 研究中    · 專案資料夾    ← 檔案掃描            🔬 探索中
        ↓ 合起來
🎵 分層作答 + 各標成熟度（可選輸出暖色 HTML，可推 Discord）

🤖 handover = 後台工作記憶（不是樂手）：記住查過什麼、跨 session 不重挖
```

---

## 二、四層資料模型（按成熟度，越上面越硬）

| 層 | 你想知道的 | 來源 / 樂手 | 成熟度標籤 |
|---|---|---|---|
| 📗 **既定事實** | 機制是什麼、定案了什麼 | EKB 筆記（借 `ekb-note`） | ✅ 定案 |
| 📋 **指派中** | 誰在做、什麼狀態、期限 | EIP 工項（借 `eip-item-builder`） | 🔵 進行中 |
| 💬 **討論中** | 還在喬什麼、誰還沒回 | LINE / Outlook（借 `eip-line-radar`） | ⚠️ 未定案 |
| 📁 **研究中** | 開發中的草稿、POC | 專案資料夾檔案 | 🔬 探索中 |

> **handover 不是第五層**，它是「AI 工作層」：①交班（跨 session 記進度）②把 LINE 討論挖成結構化訊號暫存（`LINE → handover → EKB` 的中間態）。對使用者透明，不要當第五個源去翻。

**為什麼分層**：不同成熟度的資料混在一起會失真。查知識喝「結晶」（EKB 已定案），別撈「整缸溶液」（LINE 原始對話又雜又跨案）。詳見 `references/architecture.md`。

---

## 三、漸進式查詢 SOP（核心 — 預設行為）

> Benson 鐵則：**先打 EKB、秒回第一段，不要一次四層全撈**（慢）。

```
第 1 段（預設、秒回）─────────────────────────
  只打 EKB：python scripts/ekb_query.py "{專案}" "{主題關鍵字}"
  → 有命中：整理成「📗 定案答案」回覆，附 note 連結
  → 0 命中：老實說「EKB 查無」，並提示東西可能在別層，問要不要往下展開

第 2 段（使用者要更深才展開）──────────────────
  觸發：使用者說「還在喬什麼 / 誰在做 / 最新討論 / 往下找 / 展開」
  → python scripts/deep_fetch.py "{專案}" "{主題關鍵字}"
  → 補上 📋 EIP 工項（指派中）、💬 LINE（討論中·標未定案）、📁 資料夾（研究中）

第 3 段（要正式報告才做）──────────────────────
  python scripts/render_answer.py  → 暖色分層 HTML，可 Start-Process 開 / 推 Discord
```

**每次回覆都要明示資料新鮮度與層級**，讓使用者一眼分得出「哪些是定案、哪些還在喬」。

---

## 四、絕對鐵則：不唬爛

- **只講資料裡真有的。** EKB/EIP/LINE 查無 → 老實說查無，**絕不用訓練知識瞎掰**一套「一般怎麼做」。
- 實測案例：問「農工 稻熱病預測」→ 三層全 0 命中 → 正確回答是「查無此題，農工(桃園智慧農場)實際在做的是楊梅田水位/影像辨識」，**不是**掰一套稻熱病預測機制。
- 「查無」本身就是有用的答案（揭露缺口）。例：某專案 EKB 掛零 = 定案知識還沒沉澱，可提示用 `ekb-note` 整理。

---

## 五、觸發時機（自動啟用）

- 「{專案} {主題}」問句：「桃園水情 路面淹水機制」「航空城 影像辨識」「整合平台 登入機制怎麼做的」
- 「XX 案的 OO 是什麼 / 怎麼運作 / 做到哪 / 有什麼特色 / 跟別人差在哪 / 用什麼技術」
- 想快速掌握某專案某功能 / 議題 / 機制的現況、來龍去脈
- 「幫我了解一下 XX 案的 YY」「XX 專案的 YY 進度」（單一主題深入，非全專案儀表板）

**不該由本 skill 處理（讓給鄰居）**見第七節。

---

## 六、專案名解析

使用者講的是專案「名稱」（桃園水情、農工、航空城），三系統用「project_id」。對照表在 `references/project-mapping.md`（EKB / EIP / LINE 共用同一套 project_id）。

- 解析順序：查對照表 → 查無則即時打 `fetch_projects.php` / EKB `projects.php` 模糊比對 → 仍不確定列候選問一次。
- 別名範例：「農工」=「桃園智慧農場」(id=2)；「整合平台」=「水利署整合平台」(id=9)。

---

## 七、與鄰居 skill 的分工（防觸發撞車）

| 使用者意圖 | 走哪個 skill |
|---|---|
| 問「某專案某主題」要完整理解 | **project-pulse（本 skill）** |
| 只想「存一篇筆記 / 查筆記有沒有提到 X」 | `ekb-note` |
| 只想「某 LINE 群最近講什麼 / 誰 @ 我」 | `eip-line-radar` |
| 只想「建一個工項 / 查某工項」 | `eip-item-builder` |
| 「交班 / 接著做 / 昨天做到哪」 | `handover` |
| 「這週工作報告 / daily / weekly」 | `work-review` |

判斷口訣：**問「某專案某主題的來龍去脈」→ 本 skill；單一動作（存/查/建/交班）→ 各自 skill。**

本 skill 內部其實是「借用」上述樂手 skill 的撈取方法（見 `scripts/`），所以不是搶工作，是站在它們肩膀上。

---

## 八、檔案結構

```
project-pulse/
├── SKILL.md                    # 本檔
├── README.md                   # 使用說明
├── references/
│   ├── architecture.md         # 四層架構 + handover 定位 + 漸進式 + 結晶比喻（設計聖經）
│   ├── data-sources.md         # 四個源的 API / 查法規格（實測）
│   └── project-mapping.md      # 專案名 ↔ project_id 對照（三系統共用）
└── scripts/
    ├── ekb_query.py            # 第 1 段：只打 EKB（漸進式快答）
    ├── deep_fetch.py           # 第 2 段：四層展開
    └── render_answer.py        # 第 3 段：暖色分層 HTML
```

---

## 九、環境依賴

- `EKB_TOKEN` / `EKB_BASE_URL`（預設 `https://your-server.example.com/EIP/ekb`）— EKB API
- EIP 工項：`https://your-server.example.com/EIP/progress/api/`（免認證，form-encoded，自簽憑證 verify=False）
- LINE：本機 `{cwd}/.handover/handover.db` 的 `chat_msg_cache` + `handover` 表（借 eip-line-radar 方法），或 `LINE` 專案中央庫 `PROJECTS\LINE\.handover\handover.db`
- Python 3 標準庫即可（urllib + sqlite3 + ssl），無第三方依賴；截圖用 playwright（channel=msedge）
