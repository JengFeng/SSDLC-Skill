---
name: glassmorphism
description: 模擬「霧面玻璃」質感的 UI 設計風格，視覺效果是讓元件看起來像一片半透明的毛玻璃浮在背景之上。
---

# Glassmorphism

- Aurora 高級感、科技感
- 半透明背景 — background: rgba(...) 透明度通常在 10%–30% 之間，讓背景隱約透出來。
- 背景模糊 — backdrop-filter: blur(8px~20px) 這是最關鍵的一步，模糊的是元件後方的內容，而不是元件本身。
- 細邊框 — border: 1px solid rgba(255,255,255, 0.3) 模擬玻璃邊緣的光折射，通常用白色半透明。
- 微陰影 — box-shadow 輕微投影增加浮起感，不宜過重。
- 只會新增class name，覆蓋原本的component css property，例如 .btn-glass 就會覆蓋 .btn 的背景、邊框、陰影等屬性，讓它呈現玻璃質感。

## Class name Guidelines

classname 命名**glass**: 例如 .card-glass、.btn-glass

## Recommend

component: card, button, modal, navbar

## Colors

Light:

| Name           | HEX                    | RGB           |
| -------------- | ---------------------- | ------------- |
| bg-base        | #f0eeff                | 240, 238, 255 |
| glow-purple    | #7c3aed                | 124, 58, 237  |
| glow-blue      | #2563eb                | 37, 99, 235   |
| glow-pink      | #db2777                | 219, 39, 119  |
| glass-fill     | rgba(255,255,255,0.45) | 255, 255, 255 |
| glass-border   | rgba(255,255,255,0.65) | 255, 255, 255 |
| text-primary   | #1e1b4b                | 30, 27, 75    |
| text-secondary | #4c4a7a                | 76, 74, 122   |

Dark:

| Name           | HEX                    | RGB           |
| -------------- | ---------------------- | ------------- |
| bg-base        | #0f0c29                | 15, 12, 41    |
| glow-purple    | #7c3aed                | 124, 58, 237  |
| glow-blue      | #2563eb                | 37, 99, 235   |
| glow-pink      | #db2777                | 219, 39, 119  |
| glass-fill     | rgba(255,255,255,0.08) | 255, 255, 255 |
| glass-border   | rgba(255,255,255,0.18) | 255, 255, 255 |
| text-primary   | #f8fafc                | 248, 250, 252 |
| text-secondary | #cbd5e1                | 203, 213, 225 |
