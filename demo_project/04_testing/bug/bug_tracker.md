# Bug 追蹤表 (Bug Tracker)

> 本表為 Stage 04 測試階段之統一缺陷追蹤記錄。所有 Bug 均記錄於此，持續追加，不另建獨立檔案。

| Bug ID | 發現日期 | 嚴重度 | 描述 | 重現步驟 | 根因 | 修復方案 | 狀態 | 修復日期 |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| BUG-001 | 2026-06-27 | 中 | pytest fixture teardown 時 `os.remove(DB_PATH)` 拋出 PermissionError | 執行 `pytest test_employee_crud.py`，fixture 清潔階段嘗試刪除 employee.db | Flask `get_db()` 連線在 test fixture teardown 時尚未完全釋放，導致檔案被鎖定 | 改用 `sqlite3.connect()` 直接在 fixture 中清空資料表，不刪除 db 檔案 | ✅ 已修復 | 2026-06-27 |
| BUG-002 | 2026-06-27 | 低 | Playwright `test_ui_empty_validation` 失敗：HTML5 `required` 屬性攔截表單提交 | 執行 Playwright 測試，空白欄位點擊提交時瀏覽器端攔截，Flask 未收到請求 | HTML `<input required>` 在瀏覽器端阻止表單提交，測試無法觸發伺服器端驗證 | 以 `page.evaluate()` 設定 `form.novalidate` 繞過瀏覽器驗證 | ✅ 已修復 | 2026-06-27 |

## 狀態說明
- ✅ 已修復：問題已修正並通過回歸測試
- 🔄 處理中：正在調查或修復中
- ⏳ 待處理：已記錄但尚未開始處理
- ❌ 不予修復：經評估不需修復（附原因）
