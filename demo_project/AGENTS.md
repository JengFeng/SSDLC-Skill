# 員工基本資料管理系統 — 專案開發規則 (AGENTS.md)

👉 **AI 代理執行前必須讀取**：[.agents/AGENTS.md](.agents/AGENTS.md)

本專案採用 SSDLC 六階段開發流程，所有 AI 代理與治具系統須嚴格遵循 `.agents/AGENTS.md` 中定義的行為準則，包含：

- 全局連貫性工程（PDCA 閉環 + SSOT 三軌規格）
- Planner / Generator / Evaluator 角色紀律
- A/B 類錯誤分級重試機制
- 技術棧約束（Python Flask + SQLite + Bootstrap 5）
- 安全規範（RBAC / AES-256 / CSP / 資安防護基準普級）

> **規格監控**：執行 `python scripts/check_spec_integrity.py --mode S` 進行四規格交叉一致性檢查。詳見 [.agents/AGENTS.md](.agents/AGENTS.md)。

---

## 專案層級補充規則

### 測試報告自動同步

> 本規則補充 `.agents/AGENTS.md` §2.2.5 中 Phase 04 的同步規範，確保 `test_results.md` 隨每次測試執行保持最新。

1.  **pytest 執行後**：Generator 必須自動解析 pytest 輸出（通過/失敗/跳過數量），將結果更新至 `04_testing/outputs/test_results.md` 的「API 測試結果」章節，並更新執行日期。
2.  **Playwright 執行後**：Generator 必須自動解析 Playwright 輸出，將結果更新至 `04_testing/outputs/test_results.md` 的「UI 測試結果」章節，並更新執行日期。
3.  **修復歷程記錄**：若測試失敗後經程式碼修正而通過，須在對應章節的「修復歷程」表格中記錄：案例名稱、問題描述、修復方案。
4.  **報告日期戳**：每次更新 `test_results.md` 後，必須更新報告頂部的執行時間戳。
5.  **Evaluator 檢查點**：Phase 04 Evaluator 審查時，須比對 `test_results.md` 日期與 `outputs/` 目錄下測試腳本的最後修改日期。若報告日期早於測試腳本修改日期，判定為報告過期，列為 B 類錯誤。
