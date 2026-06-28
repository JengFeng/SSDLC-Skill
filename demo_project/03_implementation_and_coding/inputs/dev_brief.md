# 開發簡報 (Dev Brief)

> Phase 03 Input | TDD Methodology | 2026-06-28

## TDD 紅-綠-重構循環

| 循環 | 測試 | 實作 | 狀態 |
|:---|:---|:---|:---|
| 1 | test_login_page_loads | GET /login → 200 | ✅ |
| 2 | test_login_success | POST /login 驗證 | ✅ |
| 3 | test_login_wrong_password | 密碼錯誤處理 | ✅ |
| 4 | test_protected_route_redirects | @login_required | ✅ |
| 5 | test_list_returns_200 | GET / → 列表 | ✅ |
| 6 | test_add_success | POST /add → INSERT | ✅ |
| 7 | test_add_duplicate_email | IntegrityError 處理 | ✅ |
| 8 | test_edit_success | POST /edit/:id | ✅ |
| 9 | test_delete_success | POST /delete/:id | ✅ |
| 10 | test_security_headers | Security Headers | ✅ |

## 實作規範
- **先行測試**：每個功能先寫 pytest 測試，確認測試失敗 (RED)
- **最小實作**：只寫讓測試通過的最小程式碼 (GREEN)
- **重構優化**：測試通過後才重構 (REFACTOR)
- **安全內建**：參數化查詢、輸入驗證、Session 管理從第一行程式碼就納入
