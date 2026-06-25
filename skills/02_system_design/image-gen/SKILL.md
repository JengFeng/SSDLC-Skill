---
name: image-gen
description: "通用 AI 圖片生成 Skill。當使用者需要生成圖片、插圖、模擬畫面、架構圖、流程圖、概念圖時啟用。預設使用 GPT Image 2，支援中文渲染與寫實場景。觸發詞：「生成圖片」「產圖」「生圖」「畫一張」「模擬畫面」「架構圖」「概念圖」「插圖」。"
---

# AI 圖片生成 Skill

通用圖片生成能力，**預設使用 GPT Image 2**（OpenAI 最新生圖模型），中文文字渲染準確度接近 100%，可供任何專案使用。

---

## 一、執行流程（最重要 — 不可跳過）

**每次生圖前必須執行以下流程：**

### Step 1 — 需求確認

使用者描述需要什麼圖後，列出建議方案：

```
📷 圖片生成建議：
┌──────────────────────────────────────────────┐
│ 圖片：{圖片名稱}                               │
│ 類型：{架構圖/模擬畫面/場景圖/icon/流程圖...}    │
│ 需要中文：{是/否}                               │
│ 建議模型：GPT Image 2（預設）                   │
│ 建議等級：{low / medium / high}                 │
│ 預估尺寸：{1024x1024 / 1536x1024 / 1024x1536}   │
│ 預估費用：USD ${金額} (≈NT${金額})              │
└──────────────────────────────────────────────┘
確認生成？或要換等級/尺寸？
```

### Step 2 — 使用者確認

等使用者回覆「OK」「確認」「好」才生成。使用者可以：
- 調整等級（例如「用 low 就好」「升 high」）
- 調整尺寸（例如「改正方形」）
- 修改內容
- 取消

### Step 3 — 生成並回報

生成完畢後回報：實際路徑、實際費用、預覽（如有）。

---

## 二、預設模型：GPT Image 2

**Model ID：`gpt-image-2`**
**環境變數：`OPENAI_API_KEY`**

### 完整定價表

| 品質 | 1024x1024 | 1024x1536 / 1536x1024 | 適用 |
|------|-----------|----------------------|------|
| **low** | $0.006 (~NT$0.20) | **$0.005 (~NT$0.16)** | 草稿、場景底圖 |
| **medium** | $0.053 (~NT$1.7) | **$0.041 (~NT$1.3)** | 政府提案、有中文、重要圖（**主力**）|
| **high** | （需確認）| （需確認）| 封面、主視覺 |

> ⚠️ **奇特定價現象**：GPT Image 2 在 low/medium 等級下，**非正方形（1536x1024 / 1024x1536）比正方形便宜**，與其他模型相反。橫式架構圖優先選 1536x1024。

### 關鍵特性（實測 2026-04-24 驗證）

| 能力 | 表現 |
|------|------|
| 繁體中文長標題 | ✅ 100% 準確（架構圖標題、層名） |
| 中文小標籤 | ✅ 95%+ 準確（4-8 字標籤）|
| 中文段落式內容 | ✅ 可渲染（24+ 子項目實測全對）|
| Overlay 小字中文（< 10px）| ⚠️ 仍會破字（CCTV 攝影機編號 overlay）|
| 寫實場景細緻度 | ✅ 高（雨天、水流、街燈反射、鏡頭水滴）|
| 設計排版 | ✅ 政府提案級水準 |

---

## 三、模型選擇決策樹

```
需要圖片 →
├─ 是 icon/小圖示？ → SVG（免費，見 Section 五）
├─ 純極致省錢草稿？ → GPT Image 2 low 1536x1024（NT$0.16）
├─ 一般用途（有/無中文）？ → GPT Image 2 medium 1536x1024（NT$1.3）⭐主力
├─ 細節要求高（封面/主視覺）？ → GPT Image 2 high 1536x1024（待確認）
└─ overlay 含小字中文？ → Nano Banana 2（仍是備援，見 Section 七）
```

**預設策略：GPT Image 2 + medium + 1536x1024（橫式）= NT$1.3，CP 值最高。**

---

## 四、API 呼叫方式（GPT Image 2 為主）

### 標準呼叫

```python
import openai, base64, os

def gen_image(prompt, output_path, size="1536x1024", quality="medium"):
    """GPT Image 2 圖片生成（預設醒目主力）"""
    client = openai.OpenAI()
    result = client.images.generate(
        model="gpt-image-2",
        prompt=prompt,
        quality=quality,        # low / medium / high
        size=size,              # 1024x1024 / 1536x1024 / 1024x1536
        n=1,
    )
    img_data = base64.b64decode(result.data[0].b64_json)
    with open(output_path, 'wb') as f:
        f.write(img_data)
    print(f"OK: {output_path} (quality={quality}, size={size})")
    return True
```

### 批次生成（一次多張）

```python
def gen_batch(jobs, output_dir):
    """jobs: [(prompt, filename, size, quality), ...]"""
    import time
    os.makedirs(output_dir, exist_ok=True)
    for prompt, fname, size, quality in jobs:
        path = os.path.join(output_dir, fname)
        t0 = time.time()
        gen_image(prompt, path, size, quality)
        print(f"  耗時 {time.time()-t0:.1f}s\n")
```

---

## 五、免費方案（Icon 專用）

| 方案 | 費用 | 品質 | 適用 |
|------|------|------|------|
| SVG 內嵌（Lucide / Feather 風格）| 免費 | 向量/銳利 | HTML 頁面 icon |
| react-icons → sharp → PNG | 免費 | 向量轉點陣 | 簡報/文件 icon |
| CSS 純手繪 | 免費 | 幾何圖形 | donut chart、progress bar |

---

## 六、Prompt 撰寫規範（GPT Image 2 最佳化）

### 含中文的圖（架構圖、概念圖）

**核心要點：**
1. **用英文描述佈局與設計**，中文只出現在要渲染的文字內容中
2. 中文標題與標籤用引號括起來：`Bold Chinese text "核心系統"`
3. 子項目用 `·` 或 bullet 列點，明確寫出每個中文內容
4. 強調繁體中文：`All text must be Chinese Traditional characters (繁體中文)`
5. 指定字體樣式：`Bold sans-serif font for title and labels`
6. 指定橫式排版：`Wide landscape format (16:9 ratio)`
7. 加結尾品質要求：`Government tender quality, no watermark, no English in main labels`

**模板：**
```
Generate a wide landscape infographic image (16:9 ratio).

White background. Professional corporate infographic for a government IT proposal document.

Title at top center, large bold dark navy Chinese text: "{title}"
Subtitle below in smaller gray Chinese: "{subtitle}"

{layout_description_with_chinese_content}

Bottom of image, small gray Chinese text: "{caption}"

Style requirements:
- All text in Chinese Traditional characters (繁體中文)
- Bold sans-serif font for title and labels
- Clean flat design, gradient colored {shapes}
- Ample white space between modules
- Government tender quality
- No watermark, no English in main labels (only acronyms allowed)
- Wide landscape 16:9 format
```

### 純圖片版（無中文文字）

```
Professional {layout_type} diagram with NO TEXT at all.
{layout_description}
ABSOLUTELY NO TEXT anywhere in the image. No labels, no titles, no characters of any language.
Only icons, shapes, and lines. Leave space for text.
Clean white background, flat design, gradient colors, modern and professional.
No watermark.
```

### 寫實場景（CCTV、UI mockup）

```
Realistic {scene_type} screenshot of {scene_description}.
Camera angle: {angle}. Time overlay in corner showing "{timestamp}".
{weather_condition}. Resolution: 1920x1080 HD security camera quality.
Slight fisheye lens effect. Night vision / IR mode if nighttime.
No watermark. Photorealistic style.
```

---

## 七、備援模型（特殊情境才用）

GPT Image 2 涵蓋 95% 場景，以下備援只在特殊需求時使用：

### Nano Banana 2（OpenRouter）— overlay 小字中文較穩

```python
import requests, base64, json, re, os

def gen_nano_banana(prompt, output_path):
    """備援：當 GPT Image 2 的小字中文 overlay 破字時用"""
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
    raw = json.dumps(response.json(), ensure_ascii=False, default=str)
    match = re.search(r'data:image/[^;]+;base64,([A-Za-z0-9+/=]+)', raw)
    if match:
        img_bytes = base64.b64decode(match.group(1))
        with open(output_path, 'wb') as f:
            f.write(img_bytes)
        return True
    return False

# 費用：~$0.07 (~NT$2.3)
```

### 其他舊模型參考定價

> ⚠️ 以下模型已被 GPT Image 2 取代，僅作參考。新案不再選用。

| 模型 | 1024x1024 medium | 取代原因 |
|------|------------------|---------|
| `gpt-image-1-mini` | $0.011 | 中文不行 |
| `gpt-image-1.5` | $0.034 | 中文不行 |
| `gpt-image-1` | $0.042 | 已過時 |
| DALL-E 3 / 2 | — | 已 deprecated（2026/05/12 下架）|

### Google Imagen 4.0（特殊比例需求才用）

```python
from google import genai

def gen_imagen(prompt, output_path, model="imagen-4.0-fast-generate-001", aspect_ratio="16:9"):
    client = genai.Client()
    result = client.models.generate_images(
        model=model, prompt=prompt,
        config=dict(number_of_images=1, output_mime_type="image/png",
                    aspect_ratio=aspect_ratio)
    )
    for img in result.generated_images:
        with open(output_path, 'wb') as f:
            f.write(img.image.image_bytes)
        return True
    return False
```

---

## 八、常用圖片類型對照表

| 類型 | 建議模型 | 建議等級 | 建議尺寸 |
|------|---------|---------|---------|
| 系統功能需求 | **GPT Image 2** | medium | 1536x1024 |
| 規劃設計核心 | **GPT Image 2** | medium | 1536x1024 |
| 功能架構圖 | **GPT Image 2** | medium | 1536x1024 |
| 流程概念圖 | **GPT Image 2** | medium | 1536x1024 |
| 開發流程 | **GPT Image 2** | medium | 1536x1024 |
| 網路架構 | **GPT Image 2** | medium | 1536x1024 |
| 工作進度甘特圖 | **GPT Image 2** | medium | 1536x1024 |
| 資料流程 | **GPT Image 2** | medium | 1536x1024 |
| 模擬畫面 (UI mockup) | **GPT Image 2** | low~medium | 1024x1024 |
| 監控場景 (CCTV) | **GPT Image 2** | low~medium | 1024x1024 |
| 草稿底圖 | **GPT Image 2** | low | 1536x1024（最便宜 NT$0.16）|
| Icon 圖示 | SVG 免費 | — | — |

---

## 九、尺寸規格

| 用途 | 建議尺寸 | 費用（medium） | 備註 |
|------|---------|---------------|------|
| 一般主力（橫式架構/功能/甘特圖）| `1536x1024` | NT$1.3 ⭐ | **CP 值最高** |
| 直式架構圖 | `1024x1536` | NT$1.3 | 同價 |
| UI 場景底圖 / 監控截圖 | `1024x1024` | NT$1.7 | 正方形反而較貴 |
| Icon PNG | `256x256` 或 SVG | — | 用 SVG 免費更好 |

**預設策略：橫式 1536x1024 優先（同尺寸最便宜，符合 16:9 排版需求）。**

---

## 十、錯誤處理

| 錯誤 | 原因 | 處理 |
|------|------|------|
| 401 Unauthorized | API key 無效或過期 | 請使用者檢查 `OPENAI_API_KEY` |
| 429 Rate Limit | 呼叫太頻繁 | 等 30 秒後重試 |
| timeout | 圖片生成超時（>180秒）| GPT Image 2 medium 約 60-90 秒，high 可能更久；重試一次仍失敗則降等級 |
| content_policy | prompt 觸發安全過濾 | 調整 prompt 用語後重試 |
| NotFoundError: model | model ID 寫錯 | 確認用 `gpt-image-2`（不是 `gpt-image-2.0`）|

---

## 十一、快速範例

### 政府提案架構圖（主力場景）

```python
gen_image(
    prompt="""Generate a wide landscape infographic (16:9).
White background. Title in bold dark navy Chinese: "整體技術架構圖"
Six horizontal layers, each with bold Chinese label and small tags:
Layer 1 (blue): "前端影像來源層" · "CCTV 監視設備", "RTSP 串流"
Layer 2 (cyan): "影像傳輸與接取層" · "封閉式 VPN 光纖專線"
Layer 3 (green): "AI 辨識運算層" · "NVIDIA GPU", "YOLOv8/v9"
... (more layers)
Style: Government tender quality, no watermark, no English in main labels.""",
    output_path="arch.png",
    size="1536x1024",
    quality="medium"
)
# 費用：$0.041 ≈ NT$1.3
```

### CCTV 監控場景（細節）

```python
gen_image(
    prompt="""Realistic CCTV surveillance screenshot of a flood-prone urban river channel.
Concrete embankment with water level markings, pedestrian bridge, surveillance poles.
Heavy rain, elevated turbid water, debris floating. Time overlay "2026-04-24 17:42:18".
Camera angle: high pole looking down 30 degrees. Photorealistic, slight rain on lens.
No watermark.""",
    output_path="cctv.png",
    size="1024x1024",
    quality="medium"
)
# 費用：$0.053 ≈ NT$1.7
```

### 草稿底圖（最便宜）

```python
gen_image(
    prompt="Realistic CCTV footage of a river with concrete banks, daytime, HD quality, wide angle, no watermark",
    output_path="draft.png",
    size="1536x1024",
    quality="low"
)
# 費用：$0.005 ≈ NT$0.16
```

---

## 十二、實測效果記錄（2026-04-24）

GPT Image 2 medium 1536x1024 在 115 台智光合作案實測：

| 圖名 | 中文標題 | 中文小標籤總數 | 準確率 | 費用 |
|------|---------|---------------|-------|------|
| 整體技術架構圖（6 層）| ✅ 完美 | 18 個 | ~100% | NT$1.3 |
| 系統功能架構圖（6 模組）| ✅ 完美 | 24 個 | ~100% | NT$1.3 |
| 工作進度甘特圖（9 工項 × 12 月）| ✅ 完美 | 9 工項 + 月份對齊 + 期中/期末里程碑 | ~100% | NT$1.3 |

**結論：取代過去「Nano Banana 有文字版 + OpenAI 純圖片版」的雙版工作流，一張到位。**
