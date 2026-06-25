# sa-design — 系統分析設計（SA/SD）

> 給「雛形畫面」或「一段需求」→ 產出工程師能直接開發的 SA 系統分析設計：**ER Model + 資料字典 + 系統架構圖 + API spec**，組成一份暖色 HTML SA 文件（mermaid 渲染成圖）。

## SDLC 定位（補在這個洞）

```
需求 → 🖼️ 雛形(bootstrap-ui) → 🧩 SA 設計(本 skill) → 👷 開發(project-dev-manager) → 🧪 測試(service-sqa) → 📄 交付(workplan-doc)
```

雛形＝「畫面長怎樣」；SA 設計＝「畫面背後：資料怎麼存、系統怎麼搭、前後端怎麼接」。**核心特色：吃 bootstrap-ui 雛形 HTML，從欄位/操作反推 ER 與架構。**

## 03 SA 系統分析設計的內容（四個區塊）

| # | 產出 | 形式 |
|---|------|------|
| ① | ER Model | mermaid `erDiagram` |
| ② | 資料字典 | 表格（型別/長度/PK-FK/必填/驗證） |
| ③ | 系統架構圖 | mermaid `flowchart` |
| ④ | API spec | 表格 + JSON 範例 |

## 三段流程

```bash
# 1. 抽素材：解析雛形 HTML 的 form/table/按鈕，或需求文字的名詞/動詞
#    （方法論見 references/methodology.md）
# 2. Claude 按方法論產 SA 系統分析設計 → 填成 sa_spec.json（mermaid 範本見 references/mermaid-patterns.md）
# 3. 渲染成暖色 HTML SA 文件（mermaid 直接畫成圖）
python scripts/render_sa.py sa_spec.json sa_design.html
#    → Start-Process 開 / playwright 截圖 / 線上瀏覽 交工程師
```

## sa_spec.json schema

```json
{
  "system": "XX 管理系統",
  "summary": "一句話系統總述",
  "stats": "4 張表 · 18 支 API",
  "er_mermaid": "erDiagram\n  MEMBER ||--o{ ORDER : 下訂\n  ...",
  "data_dict": [ {"table":"MEMBER","title":"會員","html":"<table>…資料字典…</table>"} ],
  "arch_mermaid": "flowchart TD\n  ...",
  "api_html": "<table>…API spec…</table>",
  "extra": [ {"title":"狀態流轉","mermaid":"stateDiagram-v2\n ..."} ]
}
```
`er_mermaid` / `arch_mermaid` 必填；`extra` 選配（循序圖/狀態圖）。

## 鐵則

1. SA 系統分析設計**齊出**（ER②資料字典是同份資料的兩個粒度，一定一起）。
2. 型別**具體**（`NVARCHAR(50)` 不是「字串」），工程師能直接建表。
3. 每個雛形操作都要對到一支 API；每個 FK 都要標「→ 表.欄位」。
4. 預設 MS SQL Server（Benson 主力），暖色產出、正文 ≥18px。

## 與鄰居分工

| 意圖 | skill |
|---|---|
| 雛形/需求 → 技術設計（ER/架構/API） | **sa-design** |
| 互動式雛形畫面 | `bootstrap-ui`（上游） |
| 對甲方的需求書/建議書 | `rfp-builder` / `proposal-doc` |
| 設計拆成開發追蹤 | `project-dev-manager`（下游） |

## 檔案

| 檔 | 用途 |
|---|---|
| `SKILL.md` | 主邏輯（定位/SOP/四產出/分工） |
| `references/methodology.md` | SA 方法論：抽實體→ER→資料字典→架構→API |
| `references/mermaid-patterns.md` | ER/架構/循序/狀態圖 mermaid 範本 |
| `references/output-templates.md` | 資料字典 + API spec 格式 + MS SQL 型別對照 |
| `scripts/render_sa.py` | sa_spec.json → 暖色 HTML（mermaid 渲染） |
