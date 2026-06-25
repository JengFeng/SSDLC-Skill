# proposal-pptx 踩坑記錄

實戰中累積的 pptxgenjs + PowerPoint 相容性地雷。產檔前讀一次，產檔後一定要跑 `scripts/validate.py`。

---

## 🚨 致命地雷：負的 cx / cy（會觸發 PowerPoint 修復模式）

### 症狀
- 使用者開檔時 PowerPoint 跳「發現內容有問題」的修復對話
- 點「修復」後，**不只出錯的 slide 被砍，其他無辜 slide 的圖片/文字也會被清空**（PowerPoint 修復邏輯很保守）
- 縮圖面板仍顯示原始內容（修復前快取），但主編輯區一片空白
- python-pptx / unzip 看 XML 都 OK，只有 PowerPoint 開會壞 → 容易漏檢

### 發生條件
任何 `addShape` 傳入負的 `w` 或 `h`：

```js
// ❌ 錯誤：當 p2.y < p1.y 時 h 變成負的
s.addShape("line", {
  x: p1.x, y: p1.y,
  w: p2.x - p1.x,
  h: p2.y - p1.y,   // 可能是負值！
  line: { color: "008B8B", width: 3 },
});
```

### 正確寫法
使用絕對值 + `flipV` / `flipH`：

```js
const dx = p2.x - p1.x;
const dy = p2.y - p1.y;
s.addShape("line", {
  x: Math.min(p1.x, p2.x),
  y: Math.min(p1.y, p2.y),
  w: Math.abs(dx),
  h: Math.abs(dy),
  flipV: dy < 0,
  flipH: dx < 0,
  line: { color: "008B8B", width: 3 },
});
```

### 自動偵測
`scripts/validate.py` 會 grep `cx="-` / `cy="-`，有就直接 fail。

---

## 🚨 Fill color 必須是 6 碼 hex

### 錯誤
```js
fill: { color: "00000000" }   // ❌ 8 碼，pptxgenjs 會退化成 "000000"（黑色），不是透明
fill: { color: "#008B8B" }    // ❌ 不要加 #
fill: { color: "transparent" } // ❌ 不支援
```

### 正確
- 有色：`fill: { color: "008B8B" }`（純 6 碼 RGB）
- 無填：`fill: { type: "none" }` 或整個 `fill` 屬性不要寫
- 警示：build 時出現 `"XXXXXXXX" is not a valid scheme color or hex RGB!` → 一定要修

---

## 🚨 旋轉 + flip 的 shape 會觸發 PowerPoint 修復模式

### 症狀
同負 cx/cy 那條：PowerPoint 開檔時跳「發現內容有問題」，點修復後部分 slide 被清空。

### 發生條件
對 `addShape` 同時使用 `rotate`（如 `rotate: 270`）+ `flipH: true` 時，小尺寸 shape（w/h < 0.5 英寸）更容易觸發。PowerPoint 的幾何驗證對「小尺寸 + 90/270 度旋轉 + 翻轉」組合特別挑剔。

### 正確作法
**箭頭／連接符用文字符號代替，不要用旋轉的 shape**：

```js
// ❌ 易觸發修復模式
s.addShape("rightTriangle", {
  x, y, w: 0.14, h: 0.18,
  fill: { color: "8B95A5" },
  flipH: true, rotate: 270,
});

// ✅ 穩定可靠
s.addText("▶", {
  x, y, w: 0.2, h: 0.3, fontSize: 14,
  color: "8B95A5", fontFace: "Microsoft JhengHei", bold: true,
  align: "center", valign: "middle",
});
// 其他箭頭字元：→ ▶ ➜ ➤ ◀ ▲ ▼
```

### validate.py 新增檢查（v2 擴充）
如果你看到 pptx 內有 `rot="16200000"` / `rot="5400000"` 之類的大數值，PowerPoint 遲早會抱怨。建議 validate.py 升級：grep `<a:xfrm[^>]*rot=` 作為 warning。

---

## 🚨 rectRadius 單位

`rectRadius` 是**圓角半徑佔短邊的比例**（0~0.5），不是 EMU 也不是英寸。

- `rectRadius: 0.08` → 輕微圓角（推薦卡片用）
- `rectRadius: 0.5` → 半圓（膠囊形）
- `rectRadius: 1.0+` → **會變成圓餅 / pill，造成版面錯亂**

---

## 🚨 Windows 上沒 LibreOffice 怎麼 QA

Skill 原本 QA 步驟假設有 `soffice`（LibreOffice）可轉 PDF。Windows 上常常沒裝。

### 兜底順序
1. 試 `soffice --headless --convert-to pdf`（Linux / Mac / 有裝的 Win）
2. 沒有就跑 `python scripts/validate.py <pptx>` 做結構驗證
3. 結構驗證過後，**明確提示使用者手動用 PowerPoint 開檔視覺檢查**
4. 不要因為沒法自動轉 PDF 就跳過 QA

---

## 🚨 圖片檔名/路徑帶中文

Windows 上 `path.join(__dirname, "圖片", "cover.png")` 沒問題，但**某些 Node 版本 + 特殊編碼**下會炸。保險作法：

- AI 生成的圖片統一放 `ai_images/` 用英文檔名
- 使用者截圖檔名隨便（Claude 會重命名）

---

## 🚨 Chinese font 必須明確指定

pptxgenjs 預設 font 是 Calibri，在 PowerPoint 中文版開啟時繁中會回退成新細明體（難看）。

```js
const FONT = "Microsoft JhengHei";   // 繁中最穩
// 或 "PingFang TC" / "Source Han Sans TC"
```

所有 `addText` 都要帶 `fontFace: FONT`，否則會混字型。

---

## 🚨 Text 文字框高度不夠會被截斷

pptxgenjs 不會自動收納溢出文字。設 `h` 時要留 buffer，或用 `autoFit: true`（較新版本才有）。

文字多的卡片建議：
- 小字（fontSize 10~11）+ 多行：每行約 0.32 英寸
- 中字（fontSize 13~14）：每行約 0.4 英寸
- 大字（fontSize 20+）：每行 0.55+ 英寸

---

## 🚨 addImage 的 sizing 參數

有時我們希望圖片固定長寬比塞進指定框，但寫錯會出現 `w: 0, h: 0` 的幽靈圖片：

```js
// ❌ 壞寫法（會產生 0 尺寸圖片）
s.addImage({ path, x, y, w: 0, h: 0, sizing: { type: "contain", w: 0, h: 0 } });

// ✅ 正確：要嘛明確給 w/h
s.addImage({ path, x, y, w: 6.5, h: 3.2 });

// ✅ 或用 sizing 但給目標框尺寸
s.addImage({ path, x, y, sizing: { type: "contain", w: 6.5, h: 3.2 } });
```

---

## ✅ Pre-flight checklist（產檔後必跑）

```bash
# 1. 靜態驗證
python scripts/validate.py 輸出檔.pptx

# 2. python-pptx load test
python -c "from pptx import Presentation; p=Presentation('輸出檔.pptx'); print('slides:', len(p.slides))"

# 3. 若有 soffice，轉 PDF 視覺 QA
soffice --headless --convert-to pdf 輸出檔.pptx

# 4. 提示使用者手動開 PowerPoint 驗收
```

全綠才交付，**不要跳過 validate.py**。
