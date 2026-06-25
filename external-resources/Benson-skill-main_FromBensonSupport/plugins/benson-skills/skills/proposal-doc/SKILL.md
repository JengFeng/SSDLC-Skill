---
name: proposal-doc
description: "撰寫「服務建議書」文件的專屬 skill（內建反 AI 痕跡）。當使用者提到「寫建議書」「服務建議書」「提案文件」「寫提案」「RFP回應」，或丟出需求書/招標文件要求產出建議書時啟用。內建「禁用句型結構」（擬人化無主詞 / 二元對立 / 否定排比 / 空泛宣稱 / 極端詞）與交付前五維評分閘，去除 AI 味、提升精煉度與專業度。輸出為 .docx 完整服務建議書，套用固定模板（資安、公司簡介）並依需求書客製核心方案章節。"
---

# 服務建議書撰寫 Skill

依據需求書（RFP / 招標文件）自動生成完整的服務建議書 `.docx`，固定章節套模板、核心方案依需求客製撰寫。

---

## 一、寫作風格規則

### 語言與用語
- 繁體中文，台灣用語
- 禁用大陸用語：軟件→軟體、視頻→影片、鏈接→連結、信息→資訊、網絡→網路、用戶→使用者、登錄→登入、獲取→取得、文件夾→資料夾、應用程序→應用程式、彈窗→彈出視窗、報錯→出現錯誤

### 禁用詞彙
- 深入探討 / 深度剖析 / 全面 / 綜合 / 強健 / 穩健(robust)
- 賦能 / 賦予能力(empower) / 利用(utilize，直接說「用」)
- 令人興奮的 / 值得注意的是 / 總之 / 綜上所述 / 毫無疑問
- 無縫(seamless，說「順暢」) / 打造(說「做」「建」「設計」)
- 痛點(說「問題」「困難」) / 落地(說「實際執行」「上線」)
- 生態系統(除非真的在講生態) / 賦予…新的可能
- 開場清喉嚨：眾所周知 / 不難發現 / 在當今…的時代 / 隨著…的發展（提案直接破題，不鋪陳）
- 空心強調：不僅…更… / 毋庸置疑 / 不可否認

### 禁用句型結構（AI 痕跡）

提案最容易露 AI 味的不是用詞，是句型。以下五類一律改寫：

1. **擬人化無主詞（最重要）** — 讓系統/資料/效益自己做動作，藉此迴避「誰做、怎麼做」。
   - ❌ 系統將大幅提升監測效率，資料分析能力獲得強化。
   - ✅ 本團隊以 YOLO 模型自動辨識淹水影像，將每場人工判讀從 30 分鐘縮短至 2 分鐘內。
   - 口訣：每個效益句都要能回答「誰、用什麼、做了什麼、量化結果」。
2. **二元對立「不是X，而是Y」** — 直接講 Y。
   - ❌ 我們要解決的不是技術問題，而是管理問題。
   - ✅ 本案核心是強化跨單位的通報管理流程。
3. **否定排比「不是A、不是B、而是C」** — 直接講 C。
   - ❌ 這不是監控系統，不是資料庫，而是決策中樞。
   - ✅ 本平台整合監控、資料與告警，提供防汛決策依據。
4. **空泛宣稱「效益顯著/影響深遠/至關重要」** — 補上數據。
   - ❌ 導入後效益顯著，對防災工作影響深遠。
   - ✅ 導入後預警發布從 15 分鐘縮短至 3 分鐘，每年減少約 N 次延誤通報。
5. **極端詞充權威（完全/所有/永不/絕對）** — 改成可驗證範圍。
   - ❌ 本系統完全自動化所有流程，永不漏報。
   - ✅ 本系統自動處理 90% 例行告警，異常由值班人員複核。

### 刻意不採用（提案語境會踩雷，與 Stop Slop 等通用反 slop 規則的差異）

下列規則對英文部落格/短文成立，但搬到正式繁中建議書會出事，本 skill **刻意不納入**：
- 砍光所有副詞 → 提案需要分寸詞（適度、必要時、初步階段），砍光反而失準
- 禁三項以上列舉 → 提案本來就要逐條列功能/需求，要列清楚
- 禁破折號/碎句、禁疑問詞開頭 → 英文正字法規則，中文不適用
- 極短格言體（LinkedIn 金句風）→ 與「每章要厚實、要贏過對手」直接衝突，本身是另一種 AI 味
- 被動語態一律禁 → 主詞不重要時（如引用法規、既有架構）被動是對的，視情況保留

### 寫作語氣
- 專業、務實、具體
- 用短句，直接說重點
- 有觀點時直接說，不迴避
- 不用三個形容詞堆疊
- 不用「首先⋯其次⋯再者⋯最後」的序號式展開
- 不過度用括號補充說明，有話直接寫進句子

### 內容原則
- 每段都要有具體內容，不寫空泛的行銷文案
- 描述技術方案時要說清楚「做什麼、怎麼做、用什麼技術」
- 預期效益要具體可量化，不寫模糊的「提升效率」
- 回應需求書的每個條文，確保沒有遺漏
- **每章都要有專業深度**，內容要厚實，不能草率帶過。寫出來的建議書要能贏過競爭對手
- 寫作定位是「服務建議書」，不是純技術文件。要展現對需求的理解與解決方案的專業度

### 檔案命名
- 輸出檔案名稱用中文，方便使用者核對

---

## 二、圖文搭配原則

- **先文後圖**：一定先寫完文字說明，再放圖片。不要在章節開頭就放圖
- **文字引導圖片**：文字中用「如圖 X-X 所示」帶出圖片，讓讀者知道為什麼要看這張圖
- **圖片標號**：圖片下方放標號文字（如「圖 3-1 整體系統功能需求」），使用者後續在 Word 中改為插入標號以支援交叉參照和目錄
- **圖文呼應**：文字內容要涵蓋圖片中的資訊，不能只放圖不解釋
- **不留佔位符**：不要留下任何【圖：...】，每個需要圖的地方都必須有實際圖片

---

## 三、圖片生成規則（最重要）

### 核心原則：所有圖片都必須經過討論確認後才生成，沒有例外

每張圖約 NT$2.3（$0.07 USD），要確保內容正確再花錢。**禁止未經確認就自行生成圖片。**

### 確認流程

**架構圖 / 流程圖 / 概念圖：**
1. 列出圖片清單（名稱、類型、用途）→ 使用者確認清單
2. 列出每張圖的詳細內容（標題、模組名稱、描述文字、佈局方式）→ 使用者確認內容
3. 使用者說 OK → 才生成

**模擬畫面（更細緻）：**
1. 討論這張畫面要呈現什麼功能
2. 討論畫面上有哪些區塊、擺放位置
3. 討論每個區塊裡的文字內容、數據範例
4. 討論按鈕、選單、標籤等 UI 元素
5. 使用者確認 → 才生成

### 每張圖輸出兩份
- `{圖片主題}_有文字版.png` — Nano Banana 2 生成（中文正確，直接用在建議書）
- `{圖片主題}_純圖片版.png` — gpt-image-1.5 生成（無文字底圖，使用者可自行配文字）

### 圖片來源優先順序
1. 模擬畫面資料夾（如 `{專案}/模擬畫面/`）→ 有就直接用
2. AI 生圖 → 經確認後生成
3. 使用者後續可自行替換

### 生圖模型

**有文字版：Nano Banana 2**（google/gemini-3.1-flash-image-preview via OpenRouter）
- 中文渲染品質最好，費用約 $0.07/張
- 環境變數：OPENROUTER_API_KEY

**純圖片版：gpt-image-1.5**（直接呼叫 OpenAI API）
- 設計感最好，費用 $0.05/張
- 環境變數：OPENAI_API_KEY

| 模型 | 中文標題 | 中文細節 | 設計感 | 費用 |
|------|---------|---------|-------|------|
| Nano Banana 2 | ✅ 正確 | ✅ 大部分正確 | 好 | $0.07 |
| gpt-image-1.5 | ❌ 亂碼 | ❌ 亂碼 | 最好 | $0.05 |
| gpt-5-image | ✅ 正確 | 部分亂 | 好 | $0.24 |

### Nano Banana 2 Prompt 撰寫要點

1. **用英文描述佈局和設計**，中文只出現在實際要渲染的文字內容中
2. **中文標題和標籤用引號括起來**，例如 Bold Chinese text "核心系統"
3. **每個模組的描述項目用 · 符號列點**，明確寫出每一條中文內容
4. **指定字體樣式**：Bold font for title and labels, smaller font for descriptions
5. **強調繁體中文**：All text must be in Chinese Traditional characters (繁體中文)
6. **指定橫式排版**：wide landscape format (16:9 ratio)
7. **風格指定放最後**：Clean flat design, gradient colors, corporate infographic, no watermark, no English text

### Prompt 模板

**有文字版（Nano Banana 2）：**
```
Generate a wide landscape infographic image (16:9 ratio).

White background. Professional corporate infographic for a government IT proposal document.

Title at the top center in large bold dark blue Chinese text: "{title}"

{layout_description_with_chinese_content}

Bottom of image, small gray Chinese text: "{caption}"

Style requirements:
- All text must be Chinese Traditional characters (繁體中文)
- Bold font for title and module labels
- Clean flat design, gradient colored {shapes}
- Ample white space between modules for readability
- Professional enough for government tender proposal
- No watermark, no English text
- Wide landscape format (16:9)
```

**純圖片版（gpt-image-1.5）：**
```
Professional {layout_type} infographic diagram template with NO TEXT at all.
{layout_description}
ABSOLUTELY NO TEXT anywhere in the image. No labels, no titles, no characters of any language.
Only icons, shapes, and lines. Leave space for text.
Clean white background, flat design, gradient colors, modern and professional.
No watermark.
```

### API 呼叫方式

**Nano Banana 2（有文字版）：**
```python
import requests, base64, json, re, os

response = requests.post(
    "https://openrouter.ai/api/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
        "Content-Type": "application/json",
    },
    json={
        "model": "google/gemini-3.1-flash-image-preview",
        "messages": [{"role": "user", "content": prompt}],
    },
    timeout=180
)
result = response.json()
raw = json.dumps(result, ensure_ascii=False, default=str)
match = re.search(r'data:image/[^;]+;base64,([A-Za-z0-9+/=]+)', raw)
if match:
    img_bytes = base64.b64decode(match.group(1))
    with open(output_path, 'wb') as f:
        f.write(img_bytes)
```

**gpt-image-1.5（純圖片版）：**
```python
import openai, base64
client = openai.OpenAI()
result = client.images.generate(
    model="gpt-image-1.5", prompt=prompt, quality="medium", size="1536x1024", n=1,
)
img_data = base64.b64decode(result.data[0].b64_json)
with open(output_path, 'wb') as f:
    f.write(img_data)
```

### 常用圖片類型

| 類型 | layout_type | 佈局描述 | 範例 |
|------|------------|---------|------|
| 系統功能需求 | radial mind-map | 中心放射狀分支 | 整體系統功能需求 |
| 規劃設計核心 | hexagonal hub | 中心六角形+周圍模組 | 本計畫系統規劃設計核心 |
| 功能架構圖 | hierarchical tree | 上下層級結構 | 系統功能架構圖 |
| 流程概念圖 | flow diagram with arrows | 箭頭串接流程 | AI運作流程概念示意圖 |
| 設計流程 | horizontal timeline/stages | 階段式時間軸 | 模型開發流程 |
| 策略圖 | central strategy with branches | 中心策略+周圍作法 | 最佳化調整策略 |
| 設計架構 | layered architecture | 分層堆疊結構 | 生成式設計架構 |
| 課題分析 | issue/challenge layout | 課題分區排列 | 待突破之課題 |
| 網路環境架構 | network topology | 主機/網段拓撲 | 雲端/地端架構 |
| 系統整合策略 | convergent diagram | 多來源匯聚中心 | 智慧整合策略圖 |
| 模擬畫面 | UI mockup | Web 應用介面模擬 | 管理平台各功能畫面 |

---

## 四、章節架構（通用骨架）

| 章 | 名稱 | 類型 | 說明 |
|---|------|------|------|
| 1 | 計畫概述 / 專案摘要 | **客製** | 背景、目標、執行構想、預期效益 |
| 2 | 廠商背景與執行實績 | **固定模板** | 公司簡介、團隊、實績 |
| 3 | 整體解決方案 / 建置構想 | **客製（核心）** | 技術架構、功能模組、開發規劃 |
| 4 | 資訊安全與環境建置規劃 | **固定模板** | 開發架構、主機環境、資安測試 |
| 5 | 教育訓練與技術轉移 | **半固定** | 課程規劃、技術移轉 |
| 6 | 工作進度規劃 | **客製** | 工作項目表、甘特圖 |
| 7 | 結論（選用） | **客製** | 團隊優勢、預期效益、加值服務、經費 |

### 第 3 章各節圖片規劃

第 3 章是核心，圖片需求最多。以下為通用規劃，實際依案子需求調整，**所有圖片都必須經過使用者確認後才生成**：

| 節 | 需要的圖 | 圖片類型 |
|---|---------|---------|
| 3-1 整體解決方案 | 功能需求 + 設計核心 + 功能架構圖 | 放射狀/六角形/層級樹 |
| 3-2 建置目標 | 通常純文字即可 | — |
| 3-3 技術架構圖 | 前端/AI運算/平台三區塊 | 分層架構 |
| 3-4 開發情境 | 情境概念示意圖 | 流程/概念圖 |
| 3-5 模型開發 | 開發流程圖 | 流程圖 |
| 3-6 資料蒐集 | 通常純文字即可 | — |
| 3-7 平台功能 | **每個功能模組各一張模擬畫面**（不是一張總覽） | 模擬畫面 |
| 3-8 API 串接 | 通常純文字即可 | — |
| 3-9 效能架構 | 雲端主機部署架構圖 | 網路拓撲 |

---

## 五、執行流程

### Step 1 — 讀取需求書

使用者提供 RFP / 需求書（Word、PDF 或口述），讀取後摘要：
```
專案資訊摘要：
- 案名：___
- 甲方：___
- 預算：___
- 期程：___
- 核心需求：1. ___ 2. ___ 3. ___
- 交付項目：___
- 驗收條件：___
```
呈給使用者確認。

### Step 2 — 產出建議書大綱

規劃完整章節大綱（含第 3 章子章節），讓使用者確認後再動筆。

### Step 3 — 逐章撰寫

**第 1 章（客製）：** 背景、目標、執行構想、預期效益
**第 2 章（固定模板）：** 讀取 `_templates/proposal/section_company.md`，微調團隊描述
**第 3 章（核心客製，最重要）：**
- 3-1：需求理解 → 圖 → 設計核心說明 → 圖 → 模組拆分 → 圖 → 總結
- 後續各節：每節實質內容，具體說明做法
- 每寫完一節，呈給使用者確認後再繼續
**第 4 章（固定模板）：** 讀取 `_templates/proposal/section_security.md`，依案微調
**第 5 章（半固定）：** 讀取 `_templates/proposal/section_training.md`，依案調整
**第 6 章（客製）：** 工作項目表、甘特圖描述
**第 7 章（選用）：** 團隊優勢、效益彙整、加值服務、經費

### Step 4 — 圖片規劃與生成

1. 掃描全文，列出所有需要圖片的位置
2. **列出圖片清單和詳細內容，呈給使用者確認**
3. 使用者確認後，一次生成所有圖片（每張兩份：有文字版+純圖片版）
4. 插入 docx，確保每張圖前有引導文字、圖後有標號

### Step 5 — 組裝輸出 .docx

用 python-docx 組裝，套用樣式範本：

| 用途 | Word 樣式名稱 |
|------|-------------|
| 章標題 | Heading 1 |
| 節標題 | Heading 2 |
| 小節標題 | 標題3-小節1-1-1 |
| 子節標題 | Heading 4 |
| 內文主要 | 內文二 |
| 內文次要 | 內文2 |
| 圖標題 | 標號表名 |
| 表標題 | Caption |

頁面設定：A4，上下 2.5cm，左右 1.9cm。

### Step 6 — QA 檢查 + 交付前評分閘

**先過檢查清單：**

- [ ] 需求書的每個條文都有對應回應
- [ ] 沒有使用禁用詞彙
- [ ] 沒有禁用句型結構（擬人化無主詞 / 二元對立 / 否定排比 / 空泛宣稱 / 極端詞）
- [ ] 台灣用語正確
- [ ] 章節編號連續正確
- [ ] 圖表編號正確
- [ ] 所有圖片位置都有實際圖片
- [ ] 每張圖前有引導文字、圖後有標號

**再做交付前評分閘：** 逐章自評五維（每維 1-5 分），低於 20/25 的章節必須改寫。

| 維度 | 問什麼 |
|------|--------|
| 具體度 | 每段有「做什麼/怎麼做/用什麼技術」+ 可量化效益？ |
| 主詞明確 | 有沒有擬人化無主詞句（系統/效益自己做動作）？ |
| 句型 | 有沒有二元對立 / 否定排比 / 空泛宣稱 / 極端詞？ |
| 用語 | 台灣用語、無禁用詞、無大陸詞？ |
| 回應需求 | 是否逐條對應需求書條文，無遺漏？ |

此閘是給人 review 的紅旗清單，不是自動退稿；分數低代表該章 AI 味重或空泛，需重寫。

---

## 六、範本與輸出位置

### 固定模板
```
C:\Users\benso\Desktop\CLAUDE COWORK\PROJECTS\_templates\proposal\
├── section_security.md      ← 資安章節
├── section_company.md       ← 公司簡介/團隊/實績
└── section_training.md      ← 教育訓練
```

### 輸出位置
```
C:\Users\benso\Desktop\CLAUDE COWORK\PROJECTS\{專案名稱}\
├── 待確認\
│   ├── {專案名}_服務建議書_draft.docx
│   ├── {專案名}_服務建議書_draft.md
│   ├── {圖片主題}_有文字版.png
│   └── {圖片主題}_純圖片版.png
```
