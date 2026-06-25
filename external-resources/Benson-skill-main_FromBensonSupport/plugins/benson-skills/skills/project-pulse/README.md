# project-pulse — 專案問答 / 專案把脈

> 你丟一句「**{專案} {主題}**」→ 跨四層分層作答，每層標成熟度。
> 這是「組合技能」：調度 `ekb-note` / `eip-item-builder` / `eip-line-radar` 合奏，自己不重造功能。

---

## 它解決什麼

同一個專案的資料散在 EKB / EIP / LINE / Outlook / 資料夾五個地方，要快卻得自己翻一大輪。本 skill 把它變成「問一句、分層答」的單一入口，而且**先打 EKB 秒回**、要深才展開、查無不唬爛。

## 怎麼觸發

問「某專案的某主題」，例如：
- 「桃園水情 路面淹水機制」「桃園預測淹水有什麼特色」
- 「航空城 影像辨識怎麼做的」
- 「整合平台 違規通知 做到哪了」

## 三段漸進式流程（SKILL.md 第三節）

```bash
# 第 1 段（預設·秒回）：只打 EKB
python scripts/ekb_query.py "桃園水情" "路面淹水,預測淹水,致災門檻"
#   → hit_count>0：整理成「📗 定案答案」回覆
#   → hit_count=0：老實說 EKB 查無，問要不要往下展開

# 第 2 段（使用者要更深才跑）：補 EIP + LINE
python scripts/deep_fetch.py "桃園水情" "路面淹水,預測淹水"
#   → 補 📋 指派中工項、💬 討論中（標未定案）

# 第 3 段（要正式報告才跑）：Claude 把判讀結果填成 answer.json → 渲染
python scripts/render_answer.py answer.json answer.html
#   → 暖色分層 HTML，可 Start-Process 開 / 截圖推 Discord
```

## answer.json schema（給 render_answer.py）

```json
{
  "project": "桃園水情", "topic": "路面淹水機制",
  "tldr": "一句話總結（可含燈號）",
  "layers": [
    {"icon":"📗","name":"既定事實","tag":"✅ 定案","color":"ok","src":"EKB#313","html":"<p>任意 HTML</p>"},
    {"icon":"📋","name":"指派中","tag":"🔵 進行中","color":"blue","src":"EIP","html":"<table>…</table>"},
    {"icon":"💬","name":"討論中","tag":"⚠️ 未定案","color":"warn","src":"LINE","html":"<div class='warnbox'>…</div>"},
    {"icon":"📁","name":"研究中","tag":"🔬 探索中","color":"res","src":"資料夾","html":"…"}
  ],
  "freshness": "LINE cache @ … / EKB·EIP 即時"
}
```
- `color` ∈ `ok / blue / warn / res`（綠/藍/黃/紫）
- 漸進式第一段只有 EKB 命中時，`layers` 可只放一層。

## 鐵則（別忘）

1. **先 EKB、秒回**，不要一次四層全撈（慢）。
2. **不唬爛**：查無就說查無，絕不用訓練知識瞎掰。
3. **LINE 一律標「未定案·僅供參考」**，不跟 EKB 定論混講。
4. 跨源以 `project_id` 為錨（名稱只給人看）。

## 檔案

| 檔 | 用途 |
|---|---|
| `SKILL.md` | 主邏輯（觸發、SOP、樂手分工） |
| `references/architecture.md` | 設計聖經（四層 / handover / 漸進式 / 不唬爛 / 為什麼） |
| `references/data-sources.md` | 四個源的 API 規格與坑（實測） |
| `references/project-mapping.md` | 專案名 ↔ project_id 對照（三系統共用） |
| `scripts/ekb_query.py` | 第 1 段：只打 EKB |
| `scripts/deep_fetch.py` | 第 2 段：四層展開 |
| `scripts/render_answer.py` | 第 3 段：暖色分層 HTML |

## 維護

- 對照表會腐化、別名是推測 → 存疑時以即時 `projects.php` / `fetch_projects.php` 為準（見 project-mapping.md）。
- 來源 = 2026-06-13 與 Benson 的需求討論 + project-pulse-poc 實證。
