---
name: bootstrap-ui
description: 用 Bootstrap 5.3+ 建立前端 UI 與互動式 HTML 雛形。當使用者要做雛形／原型／POC 畫面、模擬畫面、網頁前端、後台管理介面、UI 元件（表單、表格、導覽列、卡片、Modal、Dashboard 版面），或說「做個雛形」「畫面長這樣」「弄個前端 demo」「用 Bootstrap 排版」「響應式網頁」時啟用——這是 Benson 互動式 HTML 雛形的預設工具。依需求生成符合 Bootstrap 規範的 HTML/CSS/JS，避免重造元件。
compatibility: Requires Bootstrap 5.3.8(or above)
metadata: 
  author: eric@gis.tw
license: MIT
---

# Bootstrap UI

## Overview

這項技能提供 Bootstrap UI 建構，避免重新設計和開發 Component，使用者提供前端畫面需求，需求中可能受限於 Bootstrap 的元件和功能，將根據需求生成對應的HTML、CSS 和 JavaScript 代碼，並確保生成的代碼符合 Bootstrap 的規範和最佳實踐。

## Analysis Guidelines

- 使用者提供 HTML、CSS 或圖片需求: [image-or-html](/references/analyze/image-or-html.md)
- 使用者提供文件或文字描述需求: [prompt](/references/analyze/prompt.md)
- Agent Design: [ui-design](/references/design/ui-design.md)

## Themes

如果使用者不喜歡 Bootstrap 的預設樣式，可參考 Themes

- Pragmatic: [pragmatic](/references/themes/pragmatic.md)
- Functional Neutral: [functional-neutral](/references/themes/functional-neutral.md)
- Glassmorphism: [glassmorphism](/references/themes/glassmorphism.md)

## Plugins

實作任何功能前，確認以下 plugin 是否有對應可用。

- table: [table](/references/plugins/table.md)
