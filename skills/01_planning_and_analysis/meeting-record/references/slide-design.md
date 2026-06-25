# 投影片設計指南

## 鐵則：**不要用 AI 生圖**

- ❌ GPT Image 2、DALL-E、任何 AI 生圖工具
- ✅ HTML / CSS + Playwright headless chromium

**Why**：AI 生圖的中文小字會破、字距不準、對齊偏移。HTML 渲染 100% 銳利、可逐字精修、免費、秒級回饋。

例外：實景圖、CCTV mockup、寫實場景、概念視覺主視覺 → 用 image-gen / GPT Image 2

---

## 風格規範

### 色彩（5 色區分主題）
- 藍灰 `#5B7A99` — 議題 1 / AI 預審類
- 深綠 `#3F7D5F` — 議題 2 / 系統開發類
- 磚紅 `#B05A52` — 議題 3 / 資料 / CSV / 後端
- 紫 `#7D5BA6` — 議題 4 / 延後 / 待決策
- 暖橘 `#CC8347` — 議題 5 / 知識庫 / 文件管理

### 重點顏色（卡關 / 重大決議 / 待決策）
- 卡關 / 紅燈：`#C0392B`，紅框邊 + 紅底 callout
- 重大決議：`#0066cc` 藍字 + 粗體
- 待 Benson 決策：`#9333ea` 紫字 + 延後標籤

### 字型
- `Noto Sans TC, Microsoft JhengHei, PingFang TC, sans-serif`
- **預設值（不要往下縮）**：
  - 大標題（title-bar .title）50px
  - 卡片標題（.card-title）**32px**（v1.0 的 26px 太小）
  - 內文（.card .row）**24px**（v1.0 的 19px 太小，1920px 寬讀起來吃力）
  - 註腳（footer）18px
- **section-head（議題群組標題）32px** — 不要小於這個值

### 排版鐵則（v1.1 補）

#### A. 字大滿版 > 壓字塞內容
❌ **絕對不要為了把更多內容塞進一張投影片，inline `<style>` 把預設字級往下縮**（例：`.card .row { font-size: 17px }`）
- 1920×1080 viewport 在 YouTube/Discord 縮成 720p / 480p 看，17px 的中文等於變成大約 10-12px 的小字、根本讀不清楚
- 配音影片本來就在說旁白，投影片只是「visual anchor」，字大可讀比塞滿資訊重要 100 倍

✅ **如果內容塞不下，做這三件事之一（按優先順序）**：
1. 砍內容 — 把行文濃縮、刪冗詞、現況/決議/負責三段每段控制在 ≤ 2 行
2. 拆張 — 一張議題群拆成兩張（4 議題拆成 2 + 2）
3. 改版型 — 改用 grid-2 而非 grid-3（卡片變寬 + 行寬更舒服）

#### B. 滿版填滿，不要大片留白
- 主內容區 (`.main`) 高度約 900-950px（扣掉 title-bar 130px 跟 footer），**內容應該往這個高度撐**
- 用 `flex: 1` 讓 grid 區塊垂直撐開
- 卡片有空間時可加 `min-height` 讓視覺均衡
- ❌ 5 張卡片擠在畫面上半、下半空 400px → 視覺空洞
- ✅ 卡片用 grid + flex 撐到滿、垂直 gap 拉開到 20-28px

#### C. 邊距基準
- 1920×1080 (16:9)
- 標題列高度 ~110px（深藍漸層 #1E3A5F → #2C4E7A）
- 主內容區 padding：**36-42px 上下 / 56-64px 左右**（v1.0 的 36/48 偏緊）
- 卡片：白底、圓角 14px、淺灰邊 #E0E0E0、輕陰影
- 卡片 padding：**24px 30px**（v1.0 的 22/26 偏緊）

#### D. ★ 內容要詳細，不要虛（v1.2 重大）

使用者原話：「你的內容也太虛了，根本就跟摘要一樣，我要詳細一點的」。

❌ 投影片寫「改雙層結構」「比較表保留」這種**摘要層級的虛話**——等於沒講。
✅ 寫出**實際決策的具體內容**：`起點＝都計區最高點 / 終點＝污水處理場`、`用戶接管 >100m`、`轉 WKT`、`複製成新方案不動原三個`、`OCR 列相關頁讓技師挑選`…把 EKB note 裡的細節搬上來。

**詳細 ≠ 縮字硬塞。詳細 = 多拆張。**
- ❌ 不要為了詳細又把字縮小、或硬塞進 5 張
- ✅ 一個子主題一張、字大、塞實。會議豐富就用 8-10 張，別卡在 5 張
- 「5 張上限」是**摘要影片**的設定；使用者要「詳細版」時，**張數放開、一子題一張**
- 每張用「2×2 卡片 grid + 底部 callout」撐滿，每張卡片寫 2-4 行具體決策

#### E. ★ 詳細版字級 + 滿版 flex（v1.2，common43.css 配方）

詳細版不要用舊 common.css，改用加大字級 + flex 撐滿的配方（見專案 `slides43/common43.css`）：
- 標題列 `.t` **58px**、`.o`（負責人膠囊）30px
- 卡片標題 `.ct` **38px**、卡片內文 `.li` **27px**（行高 1.5）
- callout 標題 34px、內文 27px
- **滿版關鍵**：`.main{flex:1;display:flex;flex-direction:column}` + `.row2{flex:1}` + `.card{flex:1;min-height:0}` → 卡片自動撐到滿、零留白
- 每行可用 `.k`（min-width 84px 的粗體標籤，如「現況/作法/結論」）讓資訊分層好讀

---

## 5 張投影片結構建議

### Slide 1 — 封面
- 大標 + 副標（會議名 + 日期）
- 與會純名單（圓角灰底 badge）
- 5 個彩色卡片橫排（議題 overview）

### Slide 2 — 議題型（5 個子議題）
- 標題列：「一、{議題標題}」+ 右上負責人膠囊
- 主內容 3+2 grid 卡片
- 每卡：tag 編號 + 標題 + 現況/決議/負責

### Slide 3 — 議題型 + 紅框 callout
- 同 Slide 2 但底部加紅色 callout 框（給卡關／紅燈用）
- callout 用 `linear-gradient(135deg, #FEF2F2 0%, #FFE4E0 100%)` + 紅邊

### Slide 4 — 雙欄合張
- 標題列分割兩色（左磚紅 / 右橘）
- 兩欄獨立卡片
- 右欄可放分工流程圖（直排卡片 + 箭頭）

### Slide 5 — 下次會議
- 標題列「★ 下次會議」
- 左欄 A. 必交清單（依負責人，每人一個區塊，紅標放卡關項目）
- 右欄 B. 延後議題（紫色數字圈 + 議題 + 處理方式）

---

## Playwright 渲染

```python
from playwright.async_api import async_playwright

async with async_playwright() as p:
    browser = await p.chromium.launch()
    ctx = await browser.new_context(
        viewport={"width": 1920, "height": 1080},
        device_scale_factor=1,
    )
    for html_file in html_files:
        page = await ctx.new_page()
        await page.goto(f"file://{abs_path}/{html_file}")
        await page.wait_for_load_state("networkidle")
        await page.screenshot(
            path=f"slides/{name}.png",
            clip={"x":0,"y":0,"width":1920,"height":1080}
        )
        await page.close()
    await browser.close()
```

詳見 `scripts/render_slides.py`。
