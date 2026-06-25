---
name: prompt
description: 分析使用者以文字描述的方式提供需求，根據這些描述生成符合 Bootstrap UI 設計系統。
---

# Text Analysis

## Workflow

需求拆解 → Wireframe → 實作

### Step 1: 需求拆解

1. 從描述中提取：頁面用途、包含哪些區塊、互動行為、資料來源。
2. 區分兩類需求：
   - **可直接映射** → 有明確對應的 Bootstrap Component（如「一個導航欄加三張卡片」）
   - **需要自訂** → Bootstrap 沒有現成元件，需自訂 CSS/JS（如「可拖拽排序的看板」）

### Step 2: Wireframe

用 ASCII 表達佈局，並標註 Component Mapping。

格式規範：

- 用 `+--+` 框線表示區塊邊界
- 用 `[名稱]` 標註元件
- 用 `× N` 標示重複項目
- 在 wireframe 下方附上 Component Mapping 表

範例 — 使用者說「做一個後台的使用者列表頁，有搜尋、表格和分頁」：

```text
+--------------------------------------+
| [navbar: brand + user-menu]          |
+--------+-----------------------------+
| side   | [breadcrumb]                |
| bar    | [search-input]              |
|        | [table: id, name, email,    |
|        |   status, actions]          |
|        | [pagination]                |
+--------+-----------------------------+
```

Component Mapping:

```text
navbar       → .navbar.navbar-dark.bg-dark
sidebar      → .nav.flex-column（或 offcanvas）
breadcrumb   → .breadcrumb
search-input → .input-group > input + button
table        → .table.table-hover（搭配 table-helper.js）
pagination   → .pagination.pagination-sm
```

### Step 3: 確認點

判斷是否需要等使用者確認：

- **簡單需求**（單一元件、明確佈局、少於 3 個區塊）→ 在回應中附上 Wireframe，直接進入實作。
- **複雜需求**（多區塊佈局、互動邏輯、不確定的元件選擇）→ 輸出 Wireframe + Component Mapping，等使用者確認後再實作。

判斷基準：如果 Component Mapping 中有任何「不確定」或「多種方案可選」的項目，就走確認流程。

### Step 4: 實作

參考 [ui-design](/references/design/ui-design.md) 設計指南。
