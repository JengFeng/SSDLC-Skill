---
name: ui-design
description: Bootstrap UI 實作階段的自訂 CSS 與 Component 設計準則。
---

# UI Design Guidelines

本文件在 analyze 階段完成 Component Mapping 後適用,定義自訂 CSS 與 Component 的實作準則。所有規則以 Bootstrap 官方最佳實踐為基礎。

## 核心原則

依下列順序優先選擇:

1. **CSS Variables 優先於硬碼** — 使用 `--bs-body-bg`、`--bs-border-color` 等原生變數,確保 dark mode 自動連動。
2. **Utilities 優先於自訂 CSS** — 減少 `style` 屬性或自訂 class。
3. **擴展現有 Component 優先於新建** — 避免過度設計與不必要的複雜性。
4. **功能性優先於裝飾性** — 不影響功能或視覺正確性的樣式不新增。

## 自訂 CSS 決策樹

新增任何自訂樣式前,依序確認:

```text
需要新增樣式?
│
├─ ① 是否影響功能或視覺正確性?
│    └─ 否 → 不新增 (裝飾性效果不是必要)
│    └─ 是 → 進入 ②
│
├─ ② Bootstrap 是否已有對應元件、plugin 或 utility 組合?
│    └─ 有 → 直接使用,禁止自訂
│    └─ 無 → 進入 ③
│
├─ ③ 所需顏色 / 尺寸 / 透明度是否已在 :root 定義?
│    └─ 有 → 引用既有變數,禁止重複定義
│    └─ 無 → 先在 :root 新增變數,再於 class 中引用
│
└─ ④ 自訂時只覆寫不足的部分,並註明理由:
     「Bootstrap [元件名] 缺少 [具體功能],故自訂 [最小範圍]」
```

### 強制條款

- 主題切換(dark / light)的色彩差異,一律透過覆寫 `:root` 變數實現,禁止對個別 class 重複宣告顏色。
- 禁止在 component class 內出現 hardcoded `rgba` / `hex` / `px`,若該數值與現有變數等價。
- 完成樣式撰寫後,自我審查 CSS 數值,確認無任何可替換為變數的殘留硬碼。

## 命名慣例

### CSS Variables

命名規則: `--bs-*`

```css
:root {
  --bs-custom-spacer: 4rem;
}
```

顏色變數必須同時提供 HEX 與 RGB 兩種色彩空間(後者供 `rgba()` 使用):

```css
:root {
  --bs-brand-color: #0d6efd;
  --bs-brand-color-rgb: 13, 110, 253;
}
```

### 自訂 Component Class (OOCSS)

格式: `.base`、`.base-{variant}`、`.base-{size}`

```css
.card-glass          /* base */
.card-glass-primary  /* variant */
.card-glass-lg       /* size */
```

### Responsive Breakpoints

格式: `{property}-{breakpoint}-{value}`,breakpoint 使用 Bootstrap 標準 `sm / md / lg / xl / xxl`。

```css
.gap-md-4
.m-lg-6
```

### Component Events

格式: `[action].bs.[component]`,與 Bootstrap 原生事件命名一致。

```text
hide.bs.modal
show.bs.offcanvas
```

## Component 實作模式

### JavaScript 模組

依專案需求選擇,兩者擇一,不要混用:

**IIFE (無打包工具環境)**

```js
(function () {
  class Component {
    /* ... */
  }
  window.Component = Component;
})();
```

**ES6 Module (有打包工具環境)**

```js
export default class Component {
  /* ... */
}
```

### Accessibility

- 使用語義化 HTML (`<nav>`、`<main>`、`<button>` 等) 取代無語義 `<div>`。
- 互動元件加上適當 ARIA 屬性 (`aria-label`、`aria-expanded`、`aria-controls` 等)。

### 公開事件

開合類元件必須實現 Events,方便外部監聽:

```js
const componentEl = document.getElementById('componentId');
componentEl.addEventListener('hide.bs.component', event => {
  // do something...
});
```

## Utilities 擴充

- **重複使用原則**: 當 Bootstrap 既有 utility 不足時擴充。例:Bootstrap spacing 最大到 `5`,若需要更大,新增 `.m-6`、`.m-7`。
- **獨立檔案**: 建立 `utilities.css`,以最高優先級覆蓋其他樣式,引用順序放在所有其他 CSS 之後。

## 對照範例

### 範例 1: 新增 spacing

```css
/* ❌ 硬碼 */
.my-section { margin-top: 32px; }

/* ❌ 重複定義 Bootstrap 既有變數 */
:root { --my-spacer: 1rem; }

/* ✅ 引用既有變數;若需要更大,依 Utilities 擴充原則 */
.my-section { margin-top: var(--bs-spacer-4); }
```

### 範例 2: 新增品牌色

```css
/* ❌ 只定義 HEX,rgba() 無法使用 */
:root { --bs-brand: #7c3aed; }
.card-brand { background: rgba(124, 58, 237, 0.1); } /* 又硬碼 */

/* ✅ HEX + RGB 雙寫,rgba() 引用變數 */
:root {
  --bs-brand: #7c3aed;
  --bs-brand-rgb: 124, 58, 237;
}
.card-brand { background: rgba(var(--bs-brand-rgb), 0.1); }
```

### 範例 3: dark mode 色彩切換

```css
/* ❌ 對個別 class 重複宣告 */
.card-custom { background: #fff; }
[data-bs-theme="dark"] .card-custom { background: #1a1a1a; }

/* ✅ 覆寫 :root 變數,class 引用同一變數 */
:root { --bs-card-bg: #fff; }
[data-bs-theme="dark"] { --bs-card-bg: #1a1a1a; }
.card-custom { background: var(--bs-card-bg); }
```

## 參考

如專案根目錄存在 `DESIGN.md`,以該檔的色票與設計 token 為最高優先級。