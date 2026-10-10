# 一般網站帳密登入：圖面證據表

圖表：[login-sequence.html](login-sequence.html)

## 圖中元素與原始碼依據

| 圖中元素／步驟 | 原始碼證據 | 說明 |
|---|---|---|
| 登入頁載入與登入 ViewModel | `TWNPPublic/Controllers/HomeController.cs:1048-1064`; `TWNPPublic/Views/Home/Login.cshtml:1-64`; `TWNPPublic/ViewModels/Home/HomeViewModel.cs:9-19` | GET `Login` 回登入頁；模型包含帳號、密碼、驗證碼欄位。 |
| 驗證碼產生與前置條件 | `TWNPPublic/Controllers/HomeController.cs:1193-1224`; `TWNPPublic/Controllers/HomeController.cs:1334-1380`; `TWNPPublic/Views/Home/Login.cshtml:47-57` | 圖片端點產生驗證碼並存 `CaptchaData`；POST 驗證時會讀取後移除，檢查期限、SessionId 和輸入值。 |
| POST 路由、Anti-Forgery 與 ModelState | `TWNPPublic/Controllers/HomeController.cs:1071-1087`; `TWNPPublic/Views/Home/Login.cshtml:21-23`; `TWNPPublic/ViewModels/Home/HomeViewModel.cs:9-19` | POST 使用 `ValidateAntiForgeryToken`；欄位不合法時直接回登入頁。 |
| POST 的 CAPTCHA 檢查 | `TWNPPublic/Controllers/HomeController.cs:1108-1117`; `TWNPPublic/Controllers/HomeController.cs:1334-1380` | CAPTCHA 不通過時加入驗證錯誤並回登入頁。 |
| Controller 呼叫登入服務 | `TWNPPublic/Controllers/HomeController.cs:1146-1148`; `TWNPPublic/Domain/Service/HomeService.cs:304-357` | 傳入帳號、密碼與用戶端 IP，接收成功旗標、訊息及使用者資料。 |
| 查詢有效帳號 | `TWNPPublic/Domain/Service/HomeService.cs:294-302` | 以參數化查詢 `B_ACCOUNT`，並限定 `VALID=1`。 |
| C# 密碼驗證 | `TWNPPublic/Domain/Service/HomeService.cs:306-310`; `TWNPPublic/Common/Security/PasswordHashUtil.cs:28-79` | 先驗證 PBKDF2 格式，若不符再比對舊 AES 格式。 |
| 呼叫資料庫登入程序 | `TWNPPublic/Domain/Service/HomeService.cs:312-357`; `TWNPPublic/Startup.cs:45-47`; `TWNPPublic/docs/DEVELOPMENT.md:73,101-102,228` | 透過 `IDapperDataAccess`（註冊為 Dapper WCF 服務）呼叫 `dbo.spB_LOGIN`，將回傳值映射為 `F_B_LOGIN`。專案內沒有 Stored Procedure 定義。 |
| 成功／失敗分支 | `TWNPPublic/Controllers/HomeController.cs:1148-1185` | 成功時建立 Session 並導向 Dashboard；失敗時以 `result.Message` 回登入頁。 |
| Session 欄位與受保護頁面 | `TWNPPublic/Controllers/HomeController.cs:1151-1177`; `TWNPPublic/Controllers/HomeController.cs:1312-1326`; `TWNPPublic/Common/Attributes/SessionAuthorization.cs:6-19`; `TWNPPublic/Controllers/BasicController.cs:6-8` | 成功後設定帳號、水號、使用者序號與日期；授權篩選器只以 Session 的 `UserName` 是否存在判斷是否導回登入。 |
| Session 設定 | `TWNPPublic/Startup.cs:22-33`; `TWNPPublic/Program.cs:26` | Session Cookie 設為 HttpOnly、Secure Always；程式管線啟用 Session。 |
| 登入紀錄 | `TWNPPublic/Domain/Service/HomeService.cs:348-375`; `TWNPPublic/Domain/Service/HomeService.cs:386-407` | 登入成功後以背景工作寫入登入紀錄，不等待寫入完成。 |

## 目前程式可確認的流程

1. POST 先檢查 ModelState 和 CAPTCHA；任一失敗都直接回登入頁。
2. `HomeService` 查詢有效帳號，接著由 `PasswordHashUtil` 驗證密碼。
3. 密碼通過後仍呼叫 `dbo.spB_LOGIN`；實際資料庫規則不在此原始碼內，因此圖中將它標為黑箱。
4. `LOGIN_STATUS == "OK"` 時，Controller 以回傳水號建立 Session，最後導向 `/Dashboard/Index`。

## 值得留意的邊界

- `spB_LOGIN` 的 SQL 定義不在此專案中；若要解析其帳號狀態、水號清單與拒絕原因，還需要該 Stored Procedure 定義或資料庫端文件。程式是透過已註冊的 Dapper WCF `IDapperDataAccess` 呼叫，不是 Controller 直接連資料庫。
- 成功分支使用 `F_B_LOGIN_WaterNos.First()`（`HomeController.cs:1151-1162`）；目前程式假設成功結果至少有一個水號。
- 登入成功後的登入紀錄以未等待的背景工作執行；記錄失敗不會回滾登入結果。
- `localhost` 分支會預填測試帳號與密碼欄位（`HomeController.cs:1050-1057`; `Login.cshtml:36-43`）；圖表未呈現這項開發便利設定。

## 範圍

只畫一般網站帳密登入；APP / 外部 Token 登入分別從 `LoginAPP`、`ExternalLogin` 等端點進入，未併入本圖。圖表配色沿用 `wwwroot/css/Login.css` 的青綠色 `#089BAB`，只套用於產出的 HTML，不修改網站 CSS 或全域 Diagram Design 設定。
