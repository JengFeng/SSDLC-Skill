# items.json 格式規範

## 結構

```json
[
  {
    "name": "工項名稱（中文，可長可短，會放在「內容」欄）",
    "unit": "月",
    "qty": 4.0,
    "price": 50000,
    "note": "備註欄文字（可寫子工項清單、技術細節）"
  },
  ...
]
```

## 欄位說明

| 欄位 | 必填 | 型別 | 範例 | 對應 Excel 欄 |
|---|---|---|---|---|
| `name` | ✅ | string | "AI 影像辨識模組(CV)" | B 欄（內容） |
| `unit` | 預設 "月" | string | "月" / "年" / "式" | C 欄（單位） |
| `qty` | ✅ | number | 4.0 / 1 | D 欄（數量） |
| `price` | ✅ | number | 50000 / 200000 | E 欄（單價） |
| `note` | 預設 "" | string | "含 6 項細工項..." | G 欄（備註） |

> F 欄（總價）由腳本自動填公式 `=D{row}*E{row}`，不要在 JSON 裡填。

## 完整範例（楊梅田 AI 案 / 199 萬版）

```json
[
  {
    "name": "基礎設施與感測資料介接",
    "unit": "月", "qty": 4.0, "price": 50000,
    "note": "黑水活化平台＋APP底層架構、CCTV影像回傳、氣象署API介接、露點與GDD演算法、生長期判定邏輯（含6項細工項）"
  },
  {
    "name": "AI影像辨識模組(CV)",
    "unit": "月", "qty": 5.0, "price": 70000,
    "note": "ArUco標記定位、株高量測、HSV綠覆率、雙演算法交叉驗證、IRRI色卡比對、CNN葉色6級分類（含6項細工項）"
  },
  {
    "name": "AI推論與風險預測模組",
    "unit": "月", "qty": 6.0, "price": 90000,
    "note": "RAG向量庫(15篇/200萬tokens)、5因子推論、LLM Prompt工程、SHAP可解釋AI、EPIRICE+YOLO雙引擎整合（含5項細工項）"
  },
  {
    "name": "平台與APP前端開發",
    "unit": "月", "qty": 4.5, "price": 60000,
    "note": "三色燈號顯示、即時田況儀表板、CCTV+AI標籤即時疊加、GDD累積曲線、風險回顧長條圖、決策報告匯出（含6項細工項）"
  },
  {
    "name": "互動與通知系統",
    "unit": "月", "qty": 3.5, "price": 70000,
    "note": "台語+中文ASR語音輸入、AI田間助理聊天室、RAG文獻引證、APP秒級推播、橘紅燈簡訊發送（含5項細工項）"
  },
  {
    "name": "雲端AI服務租賃(首年)",
    "unit": "年", "qty": 1, "price": 200000,
    "note": "LLM API tokens、GPU推論服務、向量資料庫hosting、雲端VM與物件儲存、ASR語音API、SMS簡訊發送（首年合計）"
  }
]
```

## CLI 用法

```bash
python ~/.claude/skills/quote-builder/scripts/build_quote.py \
  --output "AI作物智慧栽培系統_報價.xlsx" \
  --client "桃園市政府" \
  --project "AI作物智慧栽培系統" \
  --config items.json
```

輸出：

```
輸出檔：AI作物智慧栽培系統_報價.xlsx
合計 = 1,805,000
+管理費 5% = 90,250
+營業稅 5% = 94,762
總計 = 1,990,012
```

## Python 直呼用法

```python
import sys
sys.path.insert(0, r"C:\Users\benso\.claude\skills\quote-builder\scripts")
from build_quote import build_quote

items = [
    {"name": "工項 1", "unit": "月", "qty": 4.0, "price": 50000, "note": "..."},
    # ...
]
result = build_quote(
    output="out.xlsx",
    client="桃園市政府",
    project="XX系統",
    items=items,
)
print(result)  # {'合計': ..., '管理費': ..., '稅': ..., '總計': ...}
```

## 注意事項

- 序號（A 欄編號 1, 2, 3...）腳本自動填，不要在 JSON 裡指定
- 廠商管理費 / 營業稅 / 總計 三行腳本自動生成，**不要**寫進 items
- 若要改 % 比率，在 CLI 用 `--mgmt-pct 0.06` `--tax-pct 0.05`
- 想拆模組小計（詳細版排版）→ 目前腳本只支援精簡版；要擴充見 [SKILL.md Step 2](../SKILL.md)
