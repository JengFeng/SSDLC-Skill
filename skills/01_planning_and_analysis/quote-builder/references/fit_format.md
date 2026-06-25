# FIT 公司專用報價單格式（準線智慧科技）

`scripts/build_fit_quote.py` 產出的格式，依 FT26050006 版型。與政府案「經費明細表」格式並存。

## 何時用 FIT 格式

- 對外以「準線智慧科技」名義出的商業報價單（非政府標案經費概算）
- 客戶是民間公司／工程行／設計公司
- 需要公司抬頭、業務聯絡人、客戶用印回傳區
- 觸發詞補充：「公司報價單」「FIT 格式」「對外報價」「給客戶的報價單」

> 政府標案經費概算（含廠商管理費、天干序號）仍用 `build_quote.py`。

## 與政府案格式的差異

| 項目 | 政府案 (build_quote.py) | FIT (build_fit_quote.py) |
|---|---|---|
| 抬頭 | 客戶機關名稱 | 公司 logo 列 + 報價單號區塊 |
| 表頭欄 | 編號/內容/單位/數量/單價/總價/備註 | 項次/項目及說明/數量/單位/單價/金額 |
| 加成 | 合計 + 廠商管理費5% + 營業稅5% | 小計 + 稅額5%（**無管理費**） |
| 序號 | 天干（一二三）含管理費列 | 阿拉伯數字；大項才用天干 |
| 結尾 | — | 5 點備註 + 客戶用印回傳區 |

## config JSON 結構

```json
{
  "header": {
    "client_name":     "種籽設計有限公司",
    "client_tax_id":   "28363609",
    "contact":         "卓小姐",
    "contact_phone":   "04-22085548",
    "invoice_address": "台中市北區梅亭街 428 號 2 樓",
    "project":         "海洋科技互動展覽系統",
    "quote_no":        "FT26050006",
    "quote_date":      "2026/5/20",
    "valid_until":     "2026/6/20",
    "sales":           "吳昭明",
    "ext":             "5703",
    "email":           "jamin@gis.tw"
  },
  "groups": [
    {
      "title": "雲端伺服器",
      "items": [
        {"name": "雲端伺服器租賃", "desc": ["115/05/21 至 115/10/21 止"],
         "qty": 5, "unit": "月", "price": 8000}
      ]
    },
    {
      "title": "現場網路建置及設定與連線測試費",
      "items": [
        {"name": "工業級 4G LTE 行動通訊路由器",
         "desc": ["強固金屬外殼質感，寬溫無風扇設計。"],
         "qty": 1, "unit": "台", "price": 21400}
      ]
    }
  ],
  "notes": null,
  "tax_pct": 0.05
}
```

## 欄位說明

### header（基本資料區）

| key | 對應欄 | 說明 |
|---|---|---|
| `client_name` | 客戶名稱 | 客戶公司全銜 |
| `client_tax_id` | 客戶統編 | 8 碼 |
| `contact` / `contact_phone` | 聯絡人 / 聯絡電話 | 客戶端窗口 |
| `invoice_address` | 發票地址 | |
| `project` | 專案名稱 | |
| `quote_no` | 報價單號 | FT 編號規則，例 `FT26050006` |
| `quote_date` / `valid_until` | 報價日期 / 報價有效期 | 慣例有效期 = 報價日 +30 天 |
| `sales` / `ext` / `email` | 業務聯絡人 / 分機 / 電子信箱 | 出單業務 |

### groups（工項分組）

- 一份報價由多個 `group`（大項）組成，每組一個 `title`。
- `title` 設為 `""`（空字串）→ 不畫大項列，工項直接平鋪。**單一工項的小報價建議用空 title。**
- 大項列序號自動帶天干（一、二、三…）；工項 `項次` 是跨組連續阿拉伯數字。

### item（單一工項）

| key | 必填 | 說明 |
|---|---|---|
| `name` | ✅ | 工項標題，放儲存格第一行 |
| `desc` | 否 | list[str] 或 str；每條前面自動加「•」項目符號 |
| `qty` | 預設 1 | 數量 |
| `unit` | 預設 "式" | 月/台/式/次/支/站… |
| `price` | ✅ | 單價（金額欄 = 數量×單價，自動帶公式） |

### notes（備註）

- `null` 或不給 → 套用 FIT 制式 5 點備註（含緊急維修支援費 12,000 元條款）。
- 給 list[str] → 整組覆寫。

## 公司固定資訊

`build_fit_quote.py` 內建 `COMPANY` dict（公司名、地址、電話、網址）。
公司資訊異動時改該 dict，或在 config 傳 `company` 局部覆寫。

## CLI 用法

```bash
python ~/.claude/skills/quote-builder/scripts/build_fit_quote.py \
  --output "澎湖縣現地影像上傳系統調整_報價.xlsx" \
  --config fit_quote.json
```

## Python 直呼用法

```python
import sys
sys.path.insert(0, r"C:\Users\benso\.claude\skills\quote-builder\scripts")
from build_fit_quote import build_fit_quote

result = build_fit_quote(
    output="out.xlsx",
    header={...},
    groups=[{"title": "", "items": [{"name": "...", "qty": 1, "unit": "式", "price": 20000}]}],
)
print(result)  # {'小計': ..., '稅': ..., '總計': ...}
```

## 注意事項

- `項次` 與大項天干序號腳本自動編，不要寫進 config。
- 金額欄（F）自動帶 `=C*E` 公式，不要在 item 填 `amount`。
- FIT 格式**沒有廠商管理費**；若硬要利潤，灌進單價，不另列管理費行。
- logo 圖目前以「公司名稱文字」呈現；若日後拿到 logo 圖檔，於 `build_fit_quote.py` 公司抬頭段以 `ws.add_image()` 補上。
