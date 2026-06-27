# 階段 04：測試驗證 — Skill 配置

## 已導入 Skill
| 快捷 | Skill | 用途 |
|:---|:---|:---|
| 04 | playwright | 瀏覽器 UI 互動測試 |
| 05 | pytest | API 功能測試 |
| 06 | systematic-debugging | 系統化除錯：根因分析→修復→驗證 |

## 標準產出
- `test_employee_crud.py` — pytest API 測試
- `test_ui_playwright.py` — Playwright 瀏覽器 UI 測試
- `test_results.md` — 雙套測試結果報告
- `bug/bug_tracker.md` — 統一缺陷追蹤表（ID、日期、嚴重度、根因、修復、狀態）

## Bug 追蹤規範
所有測試缺陷統一記錄於 `bug/bug_tracker.md` 單一表格，不另建獨立 .md 檔案。
欄位：Bug ID | 發現日期 | 嚴重度 | 描述 | 重現步驟 | 根因 | 修復方案 | 狀態 | 修復日期
狀態值：✅ 已修復 | 🔄 處理中 | ⏳ 待處理 | ❌ 不予修復
