# APP 介接登入 API：規格到程式的逆向追溯

## 目的

本文件把「廠商使用的 API 規格」與「TWNPPublic 工作區原始碼」逐項對照，示範如何從程式證據產生中間設計文件，再整理成需求候選。讀者不必先懂逆向工程；先看流程，再看每個結論的來源即可。

這是靜態反推文件，不代表正式環境已驗證，也不修改目前系統行為。

## 證據來源與可信範圍

| 標記 | 代表什麼 | 本案例 |
|---|---|---|
| **SPEC** | 使用者指定為基準的外部規格 | 附件檔名標示 V4.2；封面文字仍印 V4.1。使用者確認本次以 V4.2 為準。|
| **CODE** | 工作區目前可讀到的程式行為 | `HomeController`、`HomeService`、ViewModel、Session 與既有證據表。|
| **USER** | 使用者提供的業務資訊或既有實測回憶 | 使用者說明會員帳號會等於水號；曾以 API 工具看到 `result=200` 的 JSON。|
| **UNKNOWN** | 現有來源無法回答 | 使用者無法確認實測環境；沒有 API 原始請求／HTTP 回應、APP 端程式、資料庫 DDL 或部署版本指紋。|

**不可混為一談：**使用者回報曾看到 JSON 是有價值的執行線索，但缺少原始記錄，所以尚不能確定回應是 API 起始回應，或 API 工具自動跟隨轉址後取得的 callback 頁面。

## 從 PDF 流程圖還原出來的主線

```text
APP 要求金鑰
  → 網站檢查帳號
  → 使用者同意並通過帳密驗證
  → APP 取得金鑰
  → APP 將帳號、水號、access_token 送到 LoginAPP
  → 網站驗證金鑰並顯示系統首頁
```

這條主線來自規格文件的「AccessToken 取得／更新金鑰」與「LoginAPP 驗證登入」兩段。程式細節及分支需回到來源對照表查證。

## API 規格與原始碼對照表

| 規格項目 | PDF 規格（SPEC） | 工作區原始碼（CODE） | 目前判讀 |
|---|---|---|---|
| AccessToken 方法與路徑 | POST `/Home/AccessToken` | 有 `[HttpPost]` 的 `AccessToken` Action | 相符。來源：PDF p.1、`HomeController.cs:36–37`。|
| 首次授權 | 使用者同意並以帳密驗證後取得金鑰 | `authorization_code` 先回 `ExternalLogin` 表單；POST 後驗證驗證碼、帳號與密碼，再核發 Token | 主旨相符；程式多出明確的表單、Captcha 與 Anti-Forgery 步驟。來源：PDF p.1–2、`HomeController.cs:50–60, 102–135`、`ExternalLogin.cshtml`。|
| AccessToken 成功回應 | PDF 寫 JSON；使用者回憶 API 工具曾看到 `result=200` JSON | 有 `redirect_uri` 時結果放進 callback URL query string 並回 redirect；JSON 分支只在 `redirect_uri` 空白時走，但該欄位標 `[Required]` | 重要差異，待取得既有 HTTP 記錄或確認部署版本；本 POC 不呼叫上線服務。來源：PDF p.1、USER 回憶、`HomeViewModel.cs:65–66`、`HomeController.cs:277–302`。|
| Callback 網址 | 使用者確認 APP 每次呼叫可自行提供 callback 網址，且不需限制；但 callback 預期用途未知 | `redirect_uri` 為必填；helper 把含 Token 的回應欄位附加至該網址並轉址。此路徑未找到白名單檢查 | 使用者確認可不限制網址，未確認是否預期透過 callback 接收 Token。這和 AccessToken 成功直接回 JSON 的預期形成待釐清契約；Token 可能送到非預期位置的風險為靜態分析結果，未在正式環境重現。來源：USER、`HomeViewModel.cs:65–66`、`HomeController.cs:277–302`。|
| 帳號、水號 | PDF 將 `account_no` 定義為會員帳號，`water_no` 為欲查用水量的水號；使用者補充本介接兩者相等，且一個會員帳號只有一個水號 | 帳號查詢依 `account_no` 查有效 `B_ACCOUNT`；水號參數沒有用來比對水號綁定；登入時取查詢結果第一筆有效水號 | 依使用者提供的單一水號規則，正常情境預期一致；程式未強制相等或單一水號條件，資料庫也未在本 POC 驗證。來源：PDF p.1、USER、`HomeService.cs:73–80, 83–97, 121–138`、`HomeController.cs:182–200`。|
| 帳號／水號不存在 | PDF 以帳號或水號不在系統中的情境描述 1002 | `GetAppV4Account` 只查有效 `B_ACCOUNT`；沒有以 `water_no` 查水號是否存在。1002 由查無有效帳號觸發 | 規格文字與程式判斷條件不完全相同。來源：PDF p.2、`HomeController.cs:44–48`、`HomeService.cs:73–80`。|
| Refresh | PDF 說 Access Token 六個月後可用 Refresh Token 換發；使用者確認 Refresh Token 六個月到期，逾期後須重新輸入帳密，通過後才核發一組新金鑰 | 核發時 Refresh Token 與 Access Token 一起含有核發時間；程式常數為 6 個月，但 Refresh 分支只比對帳號目前保存的字串，命中便核發新 Token，未解密或檢查 Refresh Token 的年齡／到期時間 | 預期行為已由使用者確認；工作區程式未看到 Refresh Token 期限檢查。若資料庫仍保存該字串且帳號有效，逾期 Token 仍可能通過字串比對並換發。這是依靜態程式分支推導，非上線測試結果。來源：PDF p.4–5、USER、`HomeController.cs:25, 62–83, 215–232`、`HomeService.cs:99–112`。|
| 取消授權 | 首次授權取消回 1003；取消 Refresh 重新驗證回 1005 | `CancelExternalLogin` 組結果後導回 callback；此 Action 未呼叫資料庫更新或清除 Token | 目前只證明「結束這次授權並回結果」，沒有證據顯示取消會撤銷之前的 Token。使用者表示不知道是否應撤銷，狀態為待業務確認。來源：PDF p.2、p.5、USER、`HomeController.cs:138–145`。|
| LoginAPP 成功 | PDF 說 `LoginAPP` 驗證 Access Token 後顯示首頁；使用者確認這是網站登入流程 | 驗證後設定 Session，redirect 到 `/Dashboard/Index`；之後由首頁回 HTML | 使用者確認網站登入後進首頁的流程；這與 AccessToken 直接回 JSON 是兩個不同步驟。來源：PDF p.2–3、USER、`HomeController.cs:163–212`。|
| LoginAPP 1004 | PDF 說 Access Token 驗證錯誤；使用者確認 Token 錯誤、帳號查無資料、沒有有效水號等登入失敗都可使用同一個 1004 | Token 無效、帳號查不到或有效水號清單為空，都呈現 1004 HTML 頁面 | 使用者確認 `LoginAPP` 失敗顯示 1004；這不是 `AccessToken` 的 JSON 回應碼。訊息字串尾端驚嘆號數量仍不同，但不當成核准的需求。來源：PDF p.3、USER、`HomeController.cs:170–185`、`LoginAppAuthFailed.cshtml:17–19`。|
| 重新驗證帳密失敗 | 使用者確認：Refresh Token 逾期後重新輸入帳密若驗證失敗，維持在登入表單顯示錯誤，不另外回 JSON | `ExternalLogin` 驗證失敗時重新顯示表單；密碼驗證在該流程執行 | 預期與工作區程式相符；具體錯誤文案未確認。這個表單錯誤不使用 `LoginAPP` 的 1004。來源：USER、`HomeController.cs:102–135`、`Views/Home/ExternalLogin.cshtml`。|
| 到期時間 | Access Token 六個月到期；`expires_in` 是 `YYYYMMDDhhmmss` 到期時間 | 以核發時間加六個月；輸出相同格式 | 相符。來源：PDF p.1, 4、`HomeController.cs:304–322`。|

## 中間設計文件怎麼從圖產生

建議依這個順序讓新手讀：

1. **架構圖**：先看 APP、HomeController、HomeService、WCF／資料庫、Session 分別負責什麼。既有圖：`01-architecture.svg`。
2. **流程／泳道圖**：看首次授權、refresh、網站登入各自怎麼走。既有圖：`02-swimlane.svg`、`04-flowchart-access.svg`、`05-flowchart-refresh.svg`、`07-flowchart-login.svg`。
3. **循序圖**：確認請求、表單、Service 與 callback 的先後次序。既有圖：`12-sequence-authorization.svg`、`13-sequence-refresh.svg`、`14-sequence-login.svg`。
4. **資料流圖**：追蹤帳號、水號、Token、Session 從哪裡來、被存在哪裡、再送往何處。既有圖：`08-data-flow-token.svg`、`09-data-flow-session.svg`。
5. **規格追溯表**：把圖上的每個主要分支對應到 PDF 條文和程式行號；不一致時保留差異，不先把圖改成規格或程式任一方的版本。
6. **需求候選**：從流程寫成「當……時，系統應……」的候選需求，標註來源和待確認狀態。使用者核准之前，不回寫成正式 SSOT。

圖的用途是讓人看懂程式證據，不是代替需求審核。每個節點與箭頭需可追溯到來源；沒有證據時標「未知」。

## Phase 01 需求候選（尚未核准）

| 候選 ID | 白話需求 | 依據 | 狀態 |
|---|---|---|---|
| C-REQ-01 | APP 提出首次授權後，系統讓使用者登入並同意授權；成功時 AccessToken 直接回 JSON，提供後續登入使用的 Token。 | SPEC PDF p.1–2；USER 確認直接回 JSON、曾看到 `result=200`；CODE E04、E05、E07–E08 | 使用者確認預期格式；工作區程式有 callback URI 時會 redirect，與預期不同，部署行為仍未知 |
| C-REQ-02 | APP 可用 refresh token 申請換發新 Token；原 Token 不匹配時要求重新驗證帳密。 | SPEC PDF p.4–5；CODE E04、E05、E09、E11 | 候選；需要確認部署行為 |
| C-REQ-03 | APP 提交帳號、水號與 access token 後，系統驗證並顯示首頁。 | SPEC PDF p.2–3；CODE E06、E09–E11、E13–E14；USER 表示帳號等於唯一水號 | 候選；一般情境預期選中唯一水號，但程式未強制此資料規則 |
| C-REQ-04 | Token 到期時間以核發後六個月計算，並用 `YYYYMMDDhhmmss` 表示。 | SPEC PDF p.1、p.4；CODE E07–E08 | 候選；程式與文件目前相符 |
| C-REQ-05 | Refresh Token 核發六個月後到期；到期後須重新輸入帳密，通過驗證才核發一組新金鑰。 | USER 確認期限與逾期處理；CODE Token 內容含核發時間，但 Refresh 查詢未檢查期限 | 使用者已確認預期行為；工作區程式未見逾期拒絕檢查，列為明確實作差異 |
| C-REQ-06 | 使用者取消首次授權時回傳取消結果；取消 Refresh 重新驗證時回傳更新失敗結果。 | SPEC PDF p.2、p.5；CODE E05 | 候選；是否同時撤銷既有 Token，規格與程式均未證明 |
| C-REQ-07 | LoginAPP 的 Token 無效、帳號查無資料或無有效水號等登入失敗，皆回傳 1004。 | SPEC PDF p.3；USER；CODE E06、E31 | 使用者已確認錯誤碼共用可接受；尚未寫入正式需求 SSOT |
| C-REQ-08 | Refresh Token 逾期後重新輸入帳密若驗證失敗，系統留在登入表單顯示錯誤，不另回 JSON 錯誤碼。 | USER；CODE `ExternalLogin` 驗證失敗分支 | 使用者已確認預期；工作區程式行為相符，具體錯誤文案未確認 |
| C-REQ-09 | APP 可在每次呼叫時自行提供 callback 網址，且不限制網址範圍。 | USER；CODE E01、E08 | 使用者已確認此預期；程式路徑未找到白名單檢查。需記錄 Token 隨 callback 傳送的安全風險 |

候選需求只描述需要的業務結果，不把目前實作（例如 302、先選第一個水號）直接寫成「應該如此」。

## 已知限制與待確認事項

- 使用者已說明系統已上線，本 POC 不直接呼叫正式 API／資料庫。
- API 工具的歷史 `result=200` JSON 沒有保存原始請求／回應、HTTP 狀態碼、redirect 設定或環境名稱，故屬使用者回憶，尚不能用來判定工作區程式與部署程式是否相同。
- 使用者確認 APP 每次呼叫可自行提供 callback 網址且不需限制。程式會把 Token 放進 callback query string；靜態分析指出可能送到非預期網站，未做正式環境測試。
- Callback 的預期用途未知。使用者已確認 AccessToken 成功預期直接回 JSON，但未確認 callback 是否也應接收 Token；工作區程式則會把 Token 附加到 callback query string。
- 使用者表示本介接中 `account_no` 會等於 `water_no`，且會員帳號不會有多個水號；屬使用者提供的業務規則，尚未以資料庫或執行環境驗證。
- 使用者確認 Refresh Token 本身六個月到期；逾期後須重新輸入帳密，通過後再核發一組新金鑰。程式核發的 Refresh Token 含核發時間，但 Refresh 分支未解析該時間或檢查有效期限。
- 使用者確認逾期後重新輸入帳密若失敗，維持表單顯示錯誤，不另回 JSON；這與 `LoginAPP` 的 1004 錯誤碼屬於不同流程。
- 程式未檢查該水號是否存在於帳號綁定清單；若使用者提供的資料規則改變，程式可能選取清單中的第一筆而非指定水號。
- PDF 檔名 V4.2 與封面 V4.1 不一致；本文件依使用者指定以 V4.2 作比較基準，原始 PDF 本身仍需更正或補版本紀錄。
- 尚無 SQL DDL、APP 原始碼、正式部署版本指紋或有效測試環境。

## 可放入分享簡報的白話重點

> 一張流程圖可以把程式的路徑講清楚，但不能自動回答「這是不是當初想要的行為」。把 PDF 規格、原始碼和使用者知道的業務規則放在一起對照，差異和待確認事項才會浮出來。

本案例也示範：系統已上線、不能直接測試時，仍可先做有來源的文件逆向；但報告要說明哪些是程式證據，哪些是使用者回憶，哪些仍未知。
