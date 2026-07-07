# 需求追溯矩陣 (RTM)

> 更新：2026-06-28 | Phase 01 → 06 全程追溯

| REQ ID | 需求描述 | 01規劃 | 02設計 | 03開發 | 04測試 | 05部署 | 06維護 |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| REQ-001 | 員工列表 + 搜尋 | ✅ | ✅ | ✅ | ✅ TC-001~003 | ✅ | ✅ |
| REQ-002 | 新增員工 | ✅ | ✅ | ✅ | ✅ TC-004~005 | ✅ | ✅ |
| REQ-003 | 修改員工 | ✅ | ✅ | ✅ | ✅ TC-006 | ✅ | ✅ |
| REQ-004 | 刪除員工 | ✅ | ✅ | ✅ | ✅ TC-007 | ✅ | ✅ |
| REQ-005 | 登入驗證 | ✅ | ✅ | ✅ | ✅ TC-UI-001 | ✅ | ✅ |
| REQ-006 | 安全防護 | ✅ | ✅ | ✅ | ✅ SAST/DAST | ✅ | ✅ |

## 測試案例對照

| TC ID | 對應 REQ | 測試類型 | 描述 |
|:---|:---|:---|:---|
| TC-001 | REQ-001 | pytest | GET / 回傳 200 + 列表 |
| TC-002 | REQ-001 | pytest | GET /?q=keyword 搜尋 |
| TC-003 | REQ-001 | Playwright | UI 列表顯示 + 搜尋框 |
| TC-004 | REQ-002 | pytest | POST /add 成功新增 |
| TC-005 | REQ-002 | pytest | POST /add Email 重複 → 400 |
| TC-006 | REQ-003 | pytest | POST /edit/:id 成功更新 |
| TC-007 | REQ-004 | pytest | POST /delete/:id 成功刪除 |
| TC-UI-001 | REQ-005 | Playwright | 登入頁面 → 成功登入 → 列表 |
| TC-UI-002 | REQ-005 | Playwright | 錯誤密碼 → 鎖定提示 |
| TC-UI-003 | REQ-006 | Playwright | Security Headers 檢查 |