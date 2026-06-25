---
name: proposal-pptx
description: "一站式產出「服務建議簡報」的專屬 skill。包含三件事：(1) 套七大階段內容架構 SOP（Why→How→See→Think→Show→Use→Win），(2) 範本底板 + AI 生成圖片（gpt-image-2）的專業 PPTX 排版，(3) 每張 slide 內建講者備忘稿（標案評選風格，含一句話核心 / 口述劇本 / 關鍵字 / 專家叮嚀 / Q&A 預判），講者開 PowerPoint Presenter View 即可上場。當使用者要做提案簡報、服務建議書、系統提案、功能說明簡報、客戶簡報、講稿備忘錄、評選報告，或提到「簡報範本.pptx」「模擬畫面」「提案」「建議書」「客戶簡報」「功能展示」「講稿」「備忘稿」「演講備忘」「我要上場了」時，一律啟用此 skill。即使使用者只是說「幫我做一份簡報給客戶看」，也應該啟用。"
---

# 服務建議簡報 Skill

一站式產出「**內容架構 + 範本底板 + AI 生成圖片 + 每張 slide 內建講者備忘稿**」的客戶提案簡報。

## 一站式工作流

```
[1] 內容架構  →  套七大階段 SOP（references/seven_stages_sop.md）
                Why → How → See → Think → Show → Use → Win

[2] PPTX 排版 →  範本當背景 + pptxgenjs 疊內容（見下方執行流程）
                同步觸發 image-gen skill 產所需架構圖 / 主視覺（gpt-image-2 high）

[3] 講者備忘稿 →  套標案備忘錄邏輯（references/speaker_memo_prompt.md）
                直接寫進每張 slide 的 notes（PowerPoint Presenter View 上場用）
```

✅ **三件事在本 skill 內一次完成**，產出帶內建備忘稿的 .pptx，講者開 PowerPoint 即可上場。

## 必讀的參考文件（references/）

| 檔案 | 何時讀 |
|---|---|
| `references/seven_stages_sop.md` | [1] 規劃內容架構時 |
| `references/speaker_memo_prompt.md` | [3] 寫每張 slide 備忘稿時 |
| `references/troubleshooting.md` | 遇到 pptxgenjs / 範本 / 字型問題時 |

## 核心策略：範本當背景

這是本 skill 最關鍵的技術決策。不要用 python-pptx 直接改範本 XML（樣式能力太弱），也不要用 pptxgenjs 從零設計（丟失範本風格）。正確做法是**兩者結合**：

1. **範本分析**：用 python-pptx / markitdown 讀取範本結構
2. **範本轉背景圖**：LibreOffice → PDF → pdftoppm → 高解析 PNG（300dpi）
3. **內容產出**：用 pptxgenjs 載入 PNG 當背景，程式疊上所有內容

這樣既保留範本視覺風格（幾何圖形、配色、logo），又能用 pptxgenjs 做出卡片陰影、透明度、icon 等進階樣式。

---

## 使用者輸入

使用者需提供：

1. **服務/系統描述**（文字）：說明要做什麼系統、解決什麼問題
2. **簡報範本 .pptx**（可選）：使用者自備的範本檔案，每次指定路徑即可
3. **模擬畫面資料夾**（可選）：截圖檔名可能是隨機數字，Claude 自動用 view tool 辨識內容

**沒有範本時：** Claude 自行設計簡潔專業的版面，詢問使用者偏好的主色調（預設深藍 #1a365d），使用 pptxgenjs 從零建構。不需要 LibreOffice 轉背景 PNG 那段流程（跳過 Step 2、3）。

---

## 執行流程

### Step 1：環境準備

```bash
# 安裝依賴
pip install "markitdown[pptx]" Pillow python-pptx openai -q
npm config set prefix "$HOME/.npm-global"
npm install -g pptxgenjs react react-dom react-icons sharp 2>/dev/null
```

執行 node 時必須設定：
```bash
export NODE_PATH="$HOME/.npm-global/lib/node_modules"
```

確認環境變數 `OPENAI_API_KEY` 已設定（AI 圖片生成需要）。

### Step 2：分析範本

```bash
# 文字結構
python -m markitdown 簡報範本.pptx

# 縮圖預覽
python C:/Users/benso/.claude/skills/pptx/scripts/thumbnail.py 簡報範本.pptx

# 解包看 XML（需要時）
python C:/Users/benso/.claude/skills/pptx/scripts/office/unpack.py 簡報範本.pptx unpacked/
```

重點觀察：
- 範本有幾頁？通常 slide1=封面、slide2=內頁
- 配色方案（主色、輔色、強調色）
- 字型
- 幾何裝飾元素的位置（會影響文字擺放）

### Step 3：範本轉背景 PNG

```bash
python C:/Users/benso/.claude/skills/pptx/scripts/office/soffice.py --headless --convert-to pdf 簡報範本.pptx
pdftoppm -png -r 300 簡報範本.pdf tplbg
# 產出 tplbg-1.png（封面）、tplbg-2.png（內頁）...
```

### Step 4：分析截圖（若有提供）

用 Read tool 直接看每張截圖，分析：
- 畫面主要功能（登入/儀表板/列表/表單/報表/錄音/設定...）
- 裝置類型：直式=手機、橫式=平板、寬螢幕=後台
- 對應功能模組
- 建議的功能頁標題

輸出分析清單讓使用者確認：

```
截圖分析結果：
- 1773278009489.jpg → 「會議列表」（手機，直式）
- abc123.png        → 「訂單管理列表」（後台，寬螢幕）
- img_final.png     → 「報表匯出功能」（平板，橫式）
確認無誤後直接產出
```

排序建議：登入/首頁 → 核心功能 → 管理/設定 → 報表/匯出

### Step 5：規劃簡報大綱

詢問使用者目標總頁數（此時對話中已累積系統描述、截圖、功能需求等資訊）：

```
簡報預計幾頁？（參考：精簡 10~12 / 標準 13~17 / 完整 18~25）
```

**使用者只需回覆總頁數**，Claude 自動根據對話中已知的所有資訊（系統描述、截圖、功能模組等），決定每個章節分配幾頁，產出完整大綱讓使用者確認。使用者不需要逐章指定頁數。

章節結構：

| # | 章節 | 說明 |
|---|------|------|
| 1 | 封面 | 系統名稱、副標、提案單位、日期 |
| 2 | 目錄 | 自動列出所有章節 |
| 3 | 客戶痛點 | 現況問題、挑戰、數據佐證（2–4點） |
| 4 | 解決方案概覽 | 一句話解法（具體說做什麼、怎麼做，禁用空泛形容詞）+ 核心價值 3 點 |
| 5 | 系統架構 / 整體框架 | 架構圖文字描述或分層說明 |
| 6–N | 功能說明 | 每個功能模組 1 頁，版面依截圖數量決定 |
| N+1 | 預期成效 | 量化指標、改善前後對比 |
| 末頁 | 結尾 / 聯絡資訊 | 感謝語、聯絡窗口 |

### Step 5.5：AI 圖片生成（可選）

若使用者同意使用 AI 生圖，或簡報缺少視覺素材，執行以下流程。

#### 5.5.1 — 確認需求與等級選擇

先向使用者確認是否要 AI 生圖。**主動建議**，不要被動等待。提出需要生成的圖片清單和推薦等級：

```
本簡報建議生成以下 AI 圖片：

| # | 用途 | 放置位置 | 建議尺寸 |
|---|------|---------|---------|
| 1 | 封面主視覺 | Slide 1 | 1536×1024（橫式）|
| 2 | 系統架構概念圖 | Slide 2 | 1024×1024 |
| 3 | 功能示意圖 ×N | 功能頁（無截圖時） | 1024×1024 |
| 4 | 結尾頁視覺 | 末頁 | 1536×1024（橫式）|

共 N 張圖。**生圖一律委派 `image-gen` skill**（它管模型、品質、費用，預設 GPT Image 2，支援中文渲染）——本 skill 不自己維護模型清單與定價。此處只需與使用者確認：要生哪幾張、各圖尺寸、放哪一頁；費用與等級由 image-gen 當下說明。
```

使用者可選擇：
- 等級（A–E）
- 要生成哪些圖（可跳過不需要的）
- 也可以只選部分圖用 AI 生成，其餘用截圖

#### 5.5.2 — 生成與挑選

**每張圖生成 2 個選項（A/B）**，使用不同 prompt 角度或構圖：

透過 `image-gen` skill 產圖：把「prompt + 尺寸 + 輸出路徑」交給它，模型 / 品質 / API 呼叫都由 image-gen 負責（預設 gpt-image-2 medium）。**每張圖請它產 2 版（A/B）**供使用者挑選，選定的存入 `{workdir}/ai_images/`。

生成後用 Read tool 顯示兩個選項，讓使用者挑選：

```
封面主視覺 — 請挑選偏好的版本：

選項 A：等距視角，展示完整系統架構
[顯示圖片 A]

選項 B：透視角度，強調核心功能
[顯示圖片 B]

請選 A 或 B（或輸入 R 重新生成）
```

**挑選規則：**
- 每張圖最多重新生成 2 次（避免無限迴圈浪費成本）
- 使用者選擇後立即進入下一張
- 所有選定的圖片存入工作資料夾 `{workdir}/ai_images/`

#### 5.5.3 — Prompt 撰寫原則

為確保生成圖片風格一致且適合簡報使用：

1. **色彩指定**：必須在 prompt 中指定從範本萃取的主色（如 `teal #008B8B`），確保圖片配色與簡報一致
2. **白底優先**：指定 `white background` 或 `light background`，避免深色背景與簡報衝突
3. **禁止文字**：一律加 `No text, no labels, no watermark`，避免 AI 生成亂碼文字
4. **風格統一**：同一簡報所有圖片使用相同風格描述（如 `isometric illustration`、`flat design`、`professional engineering`）
5. **用途明確**：prompt 中說明圖片用途（如 `suitable for a professional presentation cover`）

**Prompt 模板（依用途）：**

封面主視覺：
```
Professional isometric illustration of [系統主題描述].
[具體元素描述]. Modern clean style.
Color palette: [主色] as primary, [輔色], white.
No text, no labels, no watermark. White background.
Suitable for a professional presentation cover.
```

功能概念圖：
```
Clean flat illustration of [功能描述].
Show [具體視覺元素]. Isometric style.
[主色] color scheme, white background.
No text, no labels. Professional presentation style.
```

結尾視覺：
```
Minimalist professional illustration: [主題意象].
[具體構圖描述]. Peaceful, clean composition.
[主色] and white color palette, soft gradients.
No text, no watermark. Presentation closing slide style.
```

### Step 6：撰寫 build script 並產出 .pptx

依「功能說明頁版面規則」與「色彩與字型」兩節的規則撰寫 Node.js build script（pptxgenjs）。產檔前先讀 `references/troubleshooting.md` 避開觸發修復模式的雷區。

**若有 AI 生成圖片**，在 build script 中引用 `{workdir}/ai_images/` 資料夾的圖片，依以下規則放置：

- **封面主視覺**：放在封面右側或中央，設為背景層（z-order 最後），不遮擋標題文字
- **功能概念圖**：放在功能說明頁的適當位置（無截圖時取代截圖區域；有截圖時放在輔助位置）
- **結尾視覺**：放在結尾頁中央偏上，設為背景層，文字疊在上方

build script 骨架：載入背景 PNG（有範本時）→ 逐頁 `addSlide` → 依版面規則疊 text / image / 卡片 → `writeFile`；樣式常數見「色彩與字型」節。

### Step 7：QA 檢查

**本步驟是 BLOCKING——validate.py 沒過禁止交付。**

**QA.1 靜態驗證（必跑，5 秒）**

```bash
python scripts/validate.py output.pptx
```

這個驗證會攔下以下會讓 PowerPoint 觸發「修復模式」的致命問題：
- 負的 `cx` / `cy`（line shape 時常踩）→ 修復模式會誤砍無辜 slide 的圖片/文字
- 8 碼 hex 顏色（pptxgenjs 會退化成黑色）
- 壞掉的圖片 r:embed 參照
- python-pptx 無法載入

任何一項 FAIL 都要修掉 build script 重 build，不要直接交檔案。完整踩坑清單見 `references/troubleshooting.md`（產檔前建議讀一次）。

**QA.2 視覺驗證（有 LibreOffice 才跑）**

```bash
# 先檢查有沒有 soffice
command -v soffice || ls "/c/Program Files/LibreOffice/program/soffice.exe"
# 有才跑
soffice --headless --convert-to pdf output.pptx
pdftoppm -jpeg -r 150 output.pdf slide
```

用 view tool 逐頁檢查：
- 文字沒有被範本幾何圖形擋住
- 截圖位置正確、比例正常
- 卡片排列整齊、沒有溢出
- 範本內建頁碼已被遮蓋
- 封面/結尾文字可讀（若有幾何裝飾遮擋，需加半透明面板）

**QA.3 沒 LibreOffice 的 Windows 兜底**

Windows 使用者預設沒 LibreOffice。**不要因此跳過 QA**，改成：
1. QA.1 validate.py 一定要過
2. 用 python-pptx 確認能載入：`python -c "from pptx import Presentation; Presentation('output.pptx')"`
3. 明確提示使用者**手動用 PowerPoint 開檔** 檢查是否跳「發現內容有問題」對話——若有，你的 validate.py 漏檢了某個新的雷區，更新 troubleshooting.md。

---

## 功能說明頁版面規則

### 有截圖時

截圖數量決定版面：

**1 張截圖（手機）**：左圖右文
- 左側 40%：phoneMockup（白框+陰影）
- 右側 55%：功能標題 + 3-4 張 feature cards 垂直排列

**2 張截圖（手機）**：左雙圖右文
- 左側 45%：2 個 phoneMockup 並排
- 右側 50%：4 張 feature cards

**3 張以上截圖**：拆成多頁，每頁最多 2-3 張

**後台截圖（寬螢幕）**：2×2 card grid，卡片內嵌縮小截圖

**平板截圖**：橫向卡片，截圖佔上半、說明佔下半

### 無截圖時

**優先使用 AI 生圖**補充視覺（見 Step 5.5）。若使用者不需要 AI 生圖，才使用全文字版面。

- **有 AI 圖片**：功能名稱（大標）+ AI 概念圖（左側 40%）+ feature cards（右側 55%），版面同「1 張截圖」規則
- **純文字**：功能名稱（大標）+ 說明段落 + 3-5 張 feature cards（2×2 or 垂直排列）

---

## 色彩與字型

從範本萃取配色後，定義常數。以下是預設值（依實際範本調整）：

```javascript
const C = {
  TEAL:       "008B8B",   // 主色（從範本取）
  TEAL_DARK:  "006666",   // 深色變體
  TEAL_LIGHT: "E8F5F3",   // 淺色變體
  GOLD:       "D4A843",   // 強調色
  WHITE:      "FFFFFF",
  CARD_BG:    "FFFFFF",
  TEXT:        "2D3748",   // 主文字
  TEXT_LIGHT:  "5A6A7E",   // 輔文字
  BORDER:     "E2E8F0",   // 邊框
};
const FONT = "Microsoft JhengHei";  // 繁中字型
```

---

## 重要注意事項

### 範本優先
顏色、字型從 `簡報範本.pptx` 萃取，不自行發明設計。

### 文字由 Claude 生成
使用者只需提供方向，Claude 自行撰寫專業提案文字。語氣正式但不僵硬，適合政府機關簡報場合。

**寫作語氣——讓使用者選擇：**

在規劃大綱（Step 5）時，主動詢問使用者偏好的語氣風格：

```
請選擇簡報文字風格：

A 務實派（預設）— 具體說做什麼、怎麼做，不用空泛詞彙
  例：「透過 SWMM 模型自動比對節點高程與實測資料，產出差異報告」

B 商務派 — 務實為主，適度加入商業包裝用語，兼顧專業與說服力
  例：「整合 SWMM 模型檢核與實測資料比對，有效提升審查效率與數據可信度」

C 行銷派 — 強調願景與價值，適合需要「畫大餅」的場合
  例：「打造智慧化水資源管理平台，以數據驅動決策，全面提升管理效能」
```

- 預設選 A（務實派）
- 使用者也可以混搭：例如封面/解決方案用 B，功能說明用 A

### 截圖品質
若截圖解析度太低，說明文字補充，圖片縮小放置。

### 功能頁數量
依截圖數量 + 使用者描述自動決定，不硬性限制。

### 完成後
輸出 .pptx 到使用者工作資料夾，用 `present_files` 或 computer:// link 提供下載。

---

## Reference Files

| 檔案 | 何時讀取 |
|------|---------|
| `references/troubleshooting.md` | **撰寫 build script 前必讀**，列出所有會讓 PowerPoint 觸發修復模式、誤砍內容的雷區（負 cx/cy、8 碼 hex、rectRadius、字型等） |
| `scripts/validate.py` | **Step 7 QA 必跑**，靜態驗證 .pptx 是否有致命問題，沒過禁止交付 |
