---
name: table
description: 這是使用 tanstack table 擴充 Bootstrap Table 的指南。
compatibility: Requires Bootstrap 5.3.8(or above), tanstack table v8.0.0(or above)
---

# Table Component

## Overview

使用 table-helper.js 封裝 tanstack table core，搭配 Bootstrap Table 樣式，提供分頁、排序、欄位過濾等功能。

## Dependencies

- Bootstrap CSS
- @tanstack/table-core（全域變數 `TableCore`）
- table-helper.js: [table-helper](/assets/table-helper.js)（全域變數 `tableHelper`）

引入順序：

```html
<link rel="stylesheet" href="bootstrap.min.css">
<script src="@tanstack/table-core/build/umd/index.production.js"></script>
<script src="table-helper.js"></script>
```

## Quick Start

### HTML 結構

```html
<div id="myTable">
  <table class="table table-vcenter table-nowrap">
    <thead></thead>
    <tbody></tbody>
  </table>
  <!-- 需要分頁時才加 -->
  <ul class="pagination pagination-sm"></ul>
</div>
```

### 基本用法

```js
const { Table } = tableHelper
const { createColumnHelper } = TableCore
const columnHelper = createColumnHelper()

const table = new Table('#myTable', {
  state: {
    pagination: {
      pageIndex: 0,
      pageSize: 10
    }
  }
})

fetch('./api/data')
  .then(res => res.json())
  .then(data => {
    const columns = [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('name', {
        header: '名稱',
        cell: info => info.getValue()
      })
    ]

    table.update({ columns, data })
    table.render()
  })
```

## API

### Constructor

```js
new tableHelper.Table(el, options)
```

- `el` — `string | HTMLElement`，容器元素或 CSS 選擇器。
- `options` — 初始化配置。

#### Options

| 屬性 | 型別 | 必填 | 說明 |
|------|------|------|------|
| data | `Array` | 否 | 初始資料，可稍後透過 `update()` 設定 |
| columns | `Array<ColumnDef>` | 否 | 欄位定義，可稍後透過 `update()` 設定 |
| state | `object` | 否 | 初始狀態，見 State 章節 |
| beforeMounted | `(element, table) => void` | 否 | DOM 掛載前的 hook，可用於註冊事件或修改 DOM |

### Instance Methods

#### `table.update({ columns, data })`

更新欄位定義和資料，更新後需呼叫 `render()` 重新渲染。

```js
table.update({ columns: newColumns, data: newData })
table.render()
```

#### `table.render()`

根據目前的 state 渲染 thead、tbody 和 pagination（若有啟用）。

#### `table.columnFilter(columnId, value)`

設定指定欄位的過濾值，觸發自動重新渲染。

```js
// 篩選 city 欄位
table.columnFilter('city', '台中')

// 清除篩選
table.columnFilter('city', undefined)
```

搭配 input 使用：

```js
document.getElementById('searchInput').addEventListener('input', e => {
  table.columnFilter('name', e.target.value)
})
```

### `table.table`

內部 tanstack table instance，可直接存取所有 tanstack table API。

## State

透過 `options.state` 設定初始狀態。

### Pagination

設定 `state.pagination` 啟用分頁，HTML 需包含 `.pagination` 元素。不傳則不渲染分頁 UI。

```js
state: {
  pagination: {
    pageIndex: 0,  // 起始頁（0-based）
    pageSize: 10   // 每頁筆數
  }
}
```

### onStateChange

監聽 state 變化：

```js
state: {
  pagination: { pageIndex: 0, pageSize: 10 },
  onStateChange: (newState) => {
    console.log('目前頁碼:', newState.pagination.pageIndex)
  }
}
```

## Sorting

排序功能預設啟用，點擊 `<th>` 即可切換排序方向。排序時 `<th>` 會自動加上 `asc` 或 `desc` class，可用 CSS 自訂排序指示器樣式：

```css
th.asc::after  { content: ' ▲'; }
th.desc::after { content: ' ▼'; }
```

## Column 進階配置

### meta.className

透過 `meta.className` 為 `<th>` 和 `<td>` 加上自訂 class：

```js
columnHelper.accessor('amount', {
  header: '金額',
  meta: { className: 'text-end' },
  cell: info => info.getValue().toLocaleString()
})
```

### cell 回傳 DOM Element

`cell` 除了回傳字串，也可回傳 DOM 元素：

```js
columnHelper.accessor('status', {
  header: '狀態',
  cell: info => {
    const badge = document.createElement('span')
    badge.classList.add('badge', info.getValue() === 'active' ? 'bg-success' : 'bg-secondary')
    badge.textContent = info.getValue()
    return badge
  }
})
```

### 操作欄位（display column）

使用 `columnHelper.display` 建立不綁定資料的操作欄位：

```js
columnHelper.display({
  id: 'actions',
  header: '操作',
  cell: info => {
    const btn = document.createElement('button')
    btn.classList.add('btn', 'btn-sm', 'btn-outline-danger')
    btn.textContent = '刪除'
    btn.onclick = () => handleDelete(info.row.original)
    return btn
  }
})
```

## beforeMounted Hook

在 Table 初始化完成、首次 render 之前執行，適合用於前置 DOM 操作：

```js
new Table('#myTable', {
  beforeMounted: (element, table) => {
    // 例如：在表格容器加上 loading 狀態
    element.classList.add('is-loading')
  }
})
```

## 完整範例

```js
const { Table } = tableHelper
const { createColumnHelper } = TableCore
const columnHelper = createColumnHelper()

const table = new Table('#myTable', {
  state: {
    pagination: { pageIndex: 0, pageSize: 5 },
    onStateChange: (state) => {
      console.log('page:', state.pagination.pageIndex)
    }
  },
  beforeMounted: (el) => {
    el.classList.add('is-loading')
  }
})

fetch('./api/users')
  .then(res => res.json())
  .then(data => {
    const columns = [
      columnHelper.accessor('id', {
        header: 'ID',
        meta: { className: 'text-center' },
        cell: info => info.getValue()
      }),
      columnHelper.accessor('name', {
        header: '姓名',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: info => {
          const a = document.createElement('a')
          a.href = `mailto:${info.getValue()}`
          a.textContent = info.getValue()
          return a
        }
      }),
      columnHelper.accessor('status', {
        header: '狀態',
        cell: info => {
          const badge = document.createElement('span')
          badge.classList.add('badge', info.getValue() === 'active' ? 'bg-success' : 'bg-secondary')
          badge.textContent = info.getValue() === 'active' ? '啟用' : '停用'
          return badge
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: '操作',
        cell: info => {
          const btn = document.createElement('button')
          btn.classList.add('btn', 'btn-sm', 'btn-outline-primary')
          btn.textContent = '編輯'
          btn.onclick = () => handleEdit(info.row.original)
          return btn
        }
      })
    ]

    table.update({ columns, data })
    table.render()
    table.table.getColumn('id')?.toggleSorting() // 預設 ID 升冪
    document.getElementById('myTable').classList.remove('is-loading')
  })

// 搜尋
document.getElementById('search').addEventListener('input', e => {
  table.columnFilter('name', e.target.value)
})
```
