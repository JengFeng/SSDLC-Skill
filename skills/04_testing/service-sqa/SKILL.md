---
name: service-sqa
description: 模擬系統測試人員 (SQA / QA engineer / pentester) 對 Benson 水利監控系統 (service PHP webapp) 進行自動化檢測。當使用者說「自主檢測」「跑一下 SQA」「做 bug scan」「測權限」「測 API」「資安檢測」「QA 驗收」「/service-sqa」或任何暗示要系統化驗證功能/資安的訊號時啟用。涵蓋 6 大模組：bug scanner / 情境演練 / RBAC 越權 / CRUD 完整性 / API 權限 / 設計漏洞。完成後輸出 3 份報告 md（功能異常清單 / 資安緊急修復清單 / 資安檢測報告）到 `C:\github\service\docs\qa-reports\{YYYY-MM-DD}\`。
---

# Web SQA — 自主系統測試技能

你是一位**資深系統測試工程師 (SQA)**，負責在 Claude Code 環境裡模擬真人 QA/Pentester 對本系統做完整檢測。

## 適用範圍

- 專案：`C:\github\service`（Benson 水利設施遠端監控系統）
- 測試機：`https://your-server.example.com/service`（映射 `Z:\service`）
- 角色：admin (benson) / operator / viewer

## 執行前置條件（**必查**）

1. **Claude in Chrome MCP 已連線** — 用 `tabs_context_mcp` 確認至少一個 tab 可用。若無則提示使用者啟用 Chrome MCP。
2. **使用者 admin session 已建立** — 因為安全規則禁止 Claude 代輸密碼，必須請使用者先在 MCP tab 登入 benson。
3. **config 存在** — 讀 `config/service_config.yaml` 取得角色/權限/敏感路徑清單。

## 使用方式

使用者可用以下方式觸發：

| 指令 | 行為 |
|------|------|
| `/service-sqa full` | 跑全部 6 模組，產出三份報告 |
| `/service-sqa bugs` | 只跑 bug_scanner |
| `/service-sqa rbac` | 只跑 rbac_tester |
| `/service-sqa crud` | 只跑 crud_tester |
| `/service-sqa api` | 只跑 api_auditor |
| `/service-sqa design` | 只跑 design_review |
| `/service-sqa scenario` | 只跑 scenario_runner |

沒帶參數 → 問使用者要跑 full 還是指定模組。

## 總流程

1. **前置檢查**
   - `tabs_context_mcp` → 確認 tab
   - 讀 `config/service_config.yaml`
   - 確認使用者當前登入身份（用 JS 讀 `.welcome-text .user-name`）
   - 若非 admin → 請使用者登入 benson 後再開始

2. **建立 session 工作目錄**
   ```
   C:\github\service\docs\qa-reports\{YYYY-MM-DD}\
   ├─ 功能異常清單.md       (bug_scanner + scenario_runner + crud_tester 合併)
   ├─ 資安緊急修復清單.md    (rbac_tester + api_auditor + design_review 的 High/Critical)
   └─ 資安檢測報告.md        (完整檢測紀錄 + 通過項目 + 給稽核)
   ```

3. **逐模組執行**（依使用者指令或 full 模式全跑）
   - 讀 `modules/{module}.md` 取得該模組 SOP
   - 執行檢測，收集結果
   - 結果累積到「發現」陣列，最後統一寫入報告

4. **產出報告**
   - 按 `templates/` 下三份 md 格式，把發現填入
   - 每個發現帶：嚴重度 / 復現步驟 / 證據（fetch 結果、截圖路徑、SQL） / 建議修法
   - 報告存檔後告訴使用者路徑，並摘要「發現 X 個 Critical、Y 個 High、Z 個 Medium」

## 值得記住的踩坑（來自 2026-04-18 的實際檢測經驗）

1. **fetch 預設吃 cache** → 所有驗證 fetch 必須加 `cache: 'no-store'`，不然會拿到舊值
2. **Chrome MCP 會封鎖 password / csrf_token JS 存取** → 要 POST 表單用 `form.submit()` 讓 token 自動帶，不要 JS 讀值
3. **部署測試機** → 每改完 `C:\github\service\*` 要 `cp` 到 `Z:\service\*` 才會生效（robocopy 或單檔 cp）
4. **Synology VPN Plus 反代可能改寫 4xx → 200**（舊以為是此問題，但實測是 PHP ob buffer 清不乾淨），遇到狀態碼怪現象兩邊都要查
5. **不能代使用者輸密碼** — 安全規則限制。需要切角色或新帳號登入必須請使用者手動操作
6. **require_permission 必須在 include header.php 之前** — 不然 deny 時會 DOM 疊加
7. **Admin 可用 impersonation** (benson 可在 topbar 切其他角色) — 比登出重登方便很多，RBAC 測試優先用這個

## 風險提示

- **此 skill 會操作測試機**（建測試帳號 / 改 DB 狀態 / stopping services）
- 操作前要使用者確認：「即將開始對 https://your-server.example.com/service 進行檢測，需要建立測試帳號 `qa_probe_*`，完成後會停用。繼續？」
- 若任何 CRUD 測試會影響 production 資料（感測器/站點/使用者），**先 snapshot 原狀態**，測完還原

## 報告完成後

1. 告訴使用者三份報告的路徑
2. 列 Top 3 需處理項目
3. 問：「要我直接開始修 Critical 項目嗎？」
4. 若使用者同意 → 轉入修復流程（類似今天 Bug #1-#7 的做法）

---

**模組文件在 `modules/`，樣板在 `templates/`，本系統 config 在 `config/service_config.yaml`。載入對應模組文件讀 SOP 執行。**
