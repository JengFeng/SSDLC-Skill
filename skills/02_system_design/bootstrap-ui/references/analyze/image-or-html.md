---
name: image-or-html
description: 分析使用者提供 HTML、CSS 或圖片的方式提供需求，根據這些需求生成 Bootstrap UI 代碼。
---

# Image or HTML Analysis

## Workflow

分類 → 結構分析 → Component Mapping → 實作

### Step 1: 分類

判斷使用者輸入類型，走對應路徑：

- **HTML/CSS** → 跳到 Step 2A
- **圖片（截圖、wireframe、手繪稿）** → 跳到 Step 2B
- **混合（圖片 + 文字補充）** → 以圖片為主，文字作為補充條件，走 Step 2B

### Step 2A: HTML/CSS 結構分析

已有結構化輸入，不需要 ASCII 轉譯。

1. 識別現有 HTML 的佈局結構（grid、flex、container）
2. 盤點已使用的 Bootstrap class 和自訂樣式
3. 標記需要調整或替換的部分
4. 直接產出 Component Mapping 表 → 跳到 Step 3

### Step 2B: 圖片結構分析

將圖片轉為結構化描述，減少視覺雜訊，專注於佈局和元件。

1. **階層樹** — 用樹狀結構描述元素的父子、並列關係：

```text
[page]
  ├─ [navbar]
  │    ├─ [logo]
  │    └─ [nav-links]
  ├─ [main]
  │    ├─ [sidebar: filter-panel]
  │    └─ [content: card-grid]
  │         ├─ [card] × N
  │         └─ [pagination]
  └─ [footer]
```

2. **ASCII Layout** — 在同一步驟內，畫出空間位置關係：

```text
+--------------------------------------+
| [navbar: logo]         [nav-links]   |
+--------+-----------------------------+
| side   | [card] [card] [card]        |
| bar    | [card] [card] [card]        |
|        | [pagination]                |
+--------+-----------------------------+
| [footer]                             |
+--------------------------------------+
```

3. **Component Mapping** — 標註每個區塊對應的 Bootstrap 元件：

```text
navbar       → .navbar.navbar-expand-lg
sidebar      → .offcanvas-lg / .col-3
card-grid    → .row.row-cols-md-3 > .col > .card
pagination   → .pagination
footer       → .container > footer
```

### Step 3: 確認點

判斷是否需要等使用者確認：

- **簡單需求**（單一元件、明確佈局、少於 3 個區塊）→ 在回應中附上 Component Mapping，直接進入實作。
- **複雜需求**（多區塊佈局、互動邏輯、不確定的元件選擇）→ 輸出階層樹 + ASCII Layout + Component Mapping，等使用者確認後再實作。

判斷基準：如果 Component Mapping 中有任何「不確定」或「多種方案可選」的項目，就走確認流程。

### Step 4: 實作

參考 [ui-design](/references/design/ui-design.md) 設計指南。
