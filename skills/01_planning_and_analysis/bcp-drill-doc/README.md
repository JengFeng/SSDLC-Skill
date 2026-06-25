# bcp-drill-doc — BCP 演練計畫書產生器

本 skill 協助撰寫、檢視、修訂政府 ISMS／稽核相關的「營運持續計畫（BCP）演練紀錄表」。

## 快速上手

### 情境 A：從零產生

```
使用者：「幫我寫 XX 系統的 BCP 演練計畫」
```

Claude 會：
1. 跳出一次問完問卷（★ 必答 / ◇ 有就更好）
2. 收集完資訊後產 .docx + 架構圖
3. 最後列出所有預設值供使用者 review

### 情境 B：Review 既有文件

```
使用者：「幫我看這份演練計畫」「顧問退件了幫我看哪裡不對」
（附 docx）
```

Claude 會：
1. 跑靜態檢查
2. 按 🔴🟡🟢 分級列清單
3. 問「要我直接 patch 這版嗎？」

### 情境 C：增量修訂

```
使用者：「剛剛那些問題你全部幫我改」「按 review 結果 gen 一個修訂版」
```

Claude 會：
1. 接收既有 docx + 修正清單
2. 保留原格式修補
3. 輸出修訂版

## 腳本直接使用

```bash
# 從 config 產生
python scripts/gen_bcp_docx.py --config config.json --output ./output/MySystem_BCP.docx

# 架構圖（SVG）
python scripts/gen_arch_diagram.py --mode svg --config config.json --output ./output/arch.svg

# Review
python scripts/review_bcp_docx.py --input ./input/existing.docx

# Patch
python scripts/patch_bcp_docx.py --input ./input/v1.docx --fixes fixes.json --output ./output/v2.docx
```

## 依賴

```
python-docx
matplotlib  # for PNG mode
Pillow      # for PNG mode
```

## 相關文件

- `skill.md` — 完整 SOP 與規則
- `checklist/必備欄位.md` — ISMS BCP 必備章節
- `checklist/退件常見點.md` — 顧問實戰挑過的點
- `examples/example_config.json` — 完整配置範例
