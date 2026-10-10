# 圖面證據表

## 如何讀取來源編號

`E` 是 Evidence（證據）的縮寫，後面的數字是本圖冊證據表的索引。例如 `E09` 指向下表所列的 `HomeService.cs` 第 83–113 行及其內容摘要。圖中的「來源：E09」表示該節點或連線是根據這段程式碼整理；它不是流程步驟、錯誤碼或資料庫欄位。若同一處標有多個 E 編號，代表該說明由多個程式位置共同支持。行號是方便定位的範圍，來源版本以 `source-manifest.json` 的 SHA-256 為準。

下表的 E## 為已觀察到的原始碼證據；DB 約束與正式 APP 行為仍未知。

|證據編號|位置|內容摘要|
|---|---|---|
|E01|`ViewModels/Home/HomeViewModel.cs:1–154`|DTO／驗證屬性；HomeViewModel 本身為空類別|
|E02|`Program.cs:19–45`|HTTP middleware 與 MVC conventional route|
|E03|`Startup.cs:11–63`|記憶體 Session、Cookie、MVC、WCF、DI|
|E04|`Controllers/HomeController.cs:33–87`|AccessToken：參數、帳號、grant_type、refresh 分支|
|E05|`Controllers/HomeController.cs:102–146`|ExternalLogin 與取消授權|
|E06|`Controllers/HomeController.cs:159–213`|LoginAPP：Token、帳號、水號、Session、Dashboard|
|E07|`Controllers/HomeController.cs:215–261`|核發 AES/Base64Url Token；六個月驗證|
|E08|`Controllers/HomeController.cs:263–370`|回應 DTO、callback query、expires_in、Base64Url|
|E09|`Domain/Service/HomeService.cs:83–113`|以 B_ACCOUNT 的 PWD／APP_REFRESH_TOKEN 比對|
|E10|`Domain/Service/HomeService.cs:73–81`|有效帳號查詢；沒有 LOGIN_TYPE／水表檢查|
|E11|`Domain/Service/HomeService.cs:121–150`|全部有效綁定水號與覆寫 Token 欄位|
|E12|`Domain/Service/HomeService.cs:115–119`|以 APWD 驗證 APP V4 帳密|
|E13|`Controllers/HomeController.cs:1308–1380`|Session 寫入與一次性驗證碼驗證|
|E14|`Common/Attributes/SessionAuthorization.cs:1–21`|UserName Session 決定登入授權|
|E15|`../../SqlData/DapperDataAccess.cs:14–111`|參照專案：WCF ChannelService Query／Execute|
|E16|`Controllers/HomeController.cs:693–767`|DenyAppAcounnt：舊格式 Token 與 LOGIN_TYPE 更新|
|E17|`Controllers/HomeController.cs:372–691`|#if false：不啟用的舊版 APP 流程|
|E18|`Controllers/HomeController.cs:1193–1224`|CreateValidate：JPEG 與五分鐘 Session 驗證碼|
|E19|`Views/Home/ExternalLogin.cshtml:1–75`|授權 HTML、hidden fields、CSRF、captcha、取消|
|E20|`Common/Security/PasswordHashUtil.cs:28–79`|PBKDF2 驗證，失敗後兼容舊 AES 密碼|
|E21|`Models/Entity/B_ACCOUNT.cs:1–24`|帳號 C# model；不是 SQL DDL|
|E22|`Models/Entity/B_ACCOUNT_WATER_NO.cs:1–20`|水號綁定 C# model；不是 SQL DDL|
|E23|`Controllers/BasicController.cs:1–12`|SessionAuthorization／自動 CSRF Filter|
|E24|`Controllers/DashboardController.cs:23–64`|Dashboard 繼承 BasicController；首頁入口|
|E25|`Domain/Extensions/DapperDataAccessExtensions.cs:1–20`|IDapperDataAccess singleton 注入|
|E26|`Domain/Service/HomeService.cs:281–292`|DenyAccountFromApp 僅更新 LOGIN_TYPE=0|
|E27|`Controllers/HomeController.cs:1038–1042`|Logout 僅移除 UserName Session|
|E28|`Common/Extension/AESEncryption.cs:69–191`|AES 與由固定字串衍生的 Key／IV；不公開祕密值|
|E29|`../../SqlData/DapperDataAccess.cs:119–170`|SYS_LOG 前置寫入；可能早於主 Query／Execute 失敗|
|E30|`Common/Extension/AspNetUser.cs:6–128`|IAspNetUser 讀取 Session|
|E31|`Views/Home/LoginAppAuthFailed.cshtml:1–23`|LoginAPP 錯誤為 HTML 頁面|
|E32|`TWNPPublic.csproj:1–25`|實際 target 為 net6.0|
|E33|`Domain/Service/HomeService.cs:11–21`|HomeService 注入 dataAccess 與 IAspNetUser|
|E34|`Controllers/ContextController.cs:1–95`|MVC 基底 Controller 與 MessageAPI 回應包裝|
|E35|`Domain/Service/HomeService.cs:556–612`|IHomeService 介面契約|
|E36|`Controllers/HomeController.cs:20–31`|HomeController 的繼承、欄位與建構式|

## 外部 APP 到網站及資料庫的架構

類型：Architecture。SqlData 為 csproj 直接參照的外部依賴，僅追查其呼叫邊界。WCF 伺服端／SQL DDL 未提供；SQL 執行邊界用虛線標示。net6.0；沒有把本流程畫成 EF Core 或 JWT。

|元素|類型|來源|
|---|---|---|
|外部 APP／瀏覽器 / form POST / callback|node|E04, E19|
|HomeController / AccessToken / ExternalLogin；LoginAPP|node|E04, E05, E06|
|HomeService / IHomeService；帳號、密碼、Token、水號|node|E09, E10, E11, E12|
|DapperDataAccess / IDapperDataAccess；WCF client|node|E15, E25|
|SQL Server TWN / B_ACCOUNT；B_ACCOUNT_WATER_NO|node|E09, E11|
|記憶體 Session / .TWNP.Session；UserName / CurrentWaterNo|node|E03, E13|
|DashboardController / BasicController；SessionAuthorization|node|E14, E23, E24|
|app → home：HTTP FORM|relationship|E04, E05, E06|
|home → svc：SERVICE|relationship|E33|
|svc → proxy：SQL + PARAM|relationship|E15, E33|
|proxy → db：WCF → SQL ?|relationship|E09, E11, E15|
|home → session：SET SESSION|relationship|E06, E13|
|session → dash：AUTH FILTER|relationship|E14, E23|

## 首次授權：責任與交接

類型：Swimlane。主成功路徑；錯誤分支見 Flowchart。APP callback 的實際接收／保存實作未提供，圖中最後一步僅代表伺服器導向指定 URI。 泳道壓縮 Service／WCF 的往返；精確訊息先後見 Sequence。

|元素|類型|來源|
|---|---|---|
|送出授權請求 / authorization_code|node|E04|
|回傳授權頁 / ExternalLogin|node|E04|
|輸入帳密／驗證碼 / AntiForgeryToken|node|E19|
|檢查授權請求 / Captcha + Account|node|E05|
|驗證 APWD / PasswordHashUtil|node|E12, E20|
|核發金鑰 / IssueAppToken|node|E07|
|覆寫金鑰欄位 / PWD / refresh|node|E11|
|導向 callback / result=200|node|E08|
|a → b|relationship|E04|
|b → c|relationship|E04, E19|
|c → d|relationship|E19, E05|
|d → e|relationship|E05, E12, E20|
|e → f|relationship|E12, E20, E07|
|f → g|relationship|E07, E11|
|g → h|relationship|E11, E08|

## 首次授權：步驟、輸入輸出與工具

類型：Process。使用 vendor 的 fit 公式；WB=HTTP 表單／回應，DB=持久化資料，TB=查詢結果。密碼與 Token 只標示欄位名，不展示真值。回傳頁面與 callback 跨請求，詳見 Sequence。

|元素|類型|來源|
|---|---|---|
|請求授權 / grant_type=code；APP|node|E04|
|顯示表單 / 有效帳號；MVC View|node|E04, E19|
|n0 → n1|relationship|E04, E19|
|送出帳密 / CSRF + Captcha；HTML form|node|E19|
|n1 → n2|relationship|E19|
|檢查請求 / Captcha / Account；MVC Filter|node|E05, E13|
|n2 → n3|relationship|E05, E13|
|驗證密碼 / APWD；PasswordHash|node|E12, E20|
|n3 → n4|relationship|E12, E20|
|產生 Token / AES / Base64Url；IssueAppToken|node|E07|
|n4 → n5|relationship|E07|
|保存金鑰 / UPDATE account；WCF Execute|node|E11, E15|
|n5 → n6|relationship|E11, E15|
|回 APP / 302 callback；Redirect|node|E08|
|n6 → n7|relationship|E08|

## AccessToken：入口分流

類型：Flowchart。1002 訊息雖為「用戶尚未使用智慧水表」，實際只檢查 B_ACCOUNT 存在且 VALID=1；沒有查 A_PH_METER_LIST。錯誤 result 不是 HTTP status。

|元素|類型|來源|
|---|---|---|
|POST /Home/AccessToken|node|E02, E04|
|ModelState 有效？|node|E01, E04|
|有效帳號存在？|node|E04, E10|
|grant_type？|node|E04|
|回應 result=1001 / 參數錯誤|node|E04, E08|
|回應 result=1002 / 有效帳號不存在|node|E04, E08|
|顯示 ExternalLogin / authorization_code|node|E04, E19|
|进入 refresh 流程 / 見 05 Flowchart|node|E04|
|回應 result=1001 / 不支援的 grant_type|node|E04, E08|
|start → valid|relationship|E04|
|valid → acct：YES|relationship|E04|
|valid → err1：NO|relationship|E04|
|acct → grant：YES|relationship|E04|
|acct → err2：NO|relationship|E04|
|grant → auth：AUTH CODE|relationship|E04|
|grant → refresh：REFRESH|relationship|E04|
|grant → badgrant：OTHER|relationship|E04|

## Refresh Token：直接換發或重新驗證

類型：Flowchart。Refresh 路徑沒有檢查 access_token 是否過期，也没有解析 refresh_token 的時戳；依 DB 值匹配及帳號 VALID=1 判定。

|元素|類型|來源|
|---|---|---|
|進入 refresh 分支|node|E04|
|refresh_token 非空？|node|E04|
|DB refresh 命中？|node|E04, E09|
|IssueAppToken / 覆寫 PWD 與 refresh|node|E07, E11|
|回應 result=200 / 換發金鑰成功|node|E04, E08|
|回應 result=1001 / refresh_token 空白|node|E04, E08|
|顯示 ExternalLogin / GrantType=refresh_token|node|E04, E19|
|entry → nonempty|relationship|E04|
|nonempty → match：YES|relationship|E04|
|nonempty → bad：NO|relationship|E04|
|match → issue：YES|relationship|E04, E09|
|match → relogin：NO|relationship|E04|
|issue → ok|relationship|E04, E07|

## ExternalLogin：驗證與重新顯示頁面

類型：Flowchart。CSRF 由框架先處理，失敗不進入 Action。驗證碼在實際 ValidateCaptcha 呼叫時立即移除；帳密錯誤後也要重新取得驗證碼。各失敗節點不會回傳 1004 callback。

|元素|類型|來源|
|---|---|---|
|ModelState 有效？|node|E05, E01|
|Captcha 有效？|node|E05, E13|
|AccountNo=Account？|node|E05|
|APWD 驗證成功？|node|E05, E12, E20|
|重新顯示 ExternalLogin / 欄位錯誤|node|E05, E19|
|model → fail-model：NO|relationship|E05|
|重新顯示 ExternalLogin / 驗證碼錯誤／過期／已使用|node|E05, E19|
|captcha → fail-captcha：NO|relationship|E05|
|重新顯示 ExternalLogin / 帳號與 AccountNo 不一致|node|E05, E19|
|account → fail-account：NO|relationship|E05|
|重新顯示 ExternalLogin / APWD 密碼驗證失敗|node|E05, E19|
|pwd → fail-pwd：NO|relationship|E05|
|核發 → callback 200 / IssueAppToken|node|E05, E07, E08|
|model → captcha：YES|relationship|E05|
|captcha → account：YES|relationship|E05|
|account → pwd：YES|relationship|E05|
|pwd → issue：YES|relationship|E05, E07|

## LoginAPP：Token 到網站登入

類型：Flowchart。IsValidAppToken 會解密並比對帳號與六個月期限。GetAppV4WaterNos 未使用 WaterNo 參數；取全部有效綁定並 ORDER BY WATER_NO，再用 First() 作為 CurrentWaterNo。失敗是 HTML。

|元素|類型|來源|
|---|---|---|
|POST /Home/LoginAPP|node|E02, E06|
|ModelState 有效？|node|E01, E06|
|DB Token + AES 有效？|node|E06, E07, E09|
|帳號與水號清單存在？|node|E06, E10, E11|
|HTML：1001 / LoginAppAuthFailed|node|E06, E31|
|HTML：1004 / Token／帳號／清單失敗|node|E06, E31|
|SetLoginSession / → /Dashboard/Index|node|E06, E13|
|start → model|relationship|E06|
|model → token：YES|relationship|E06|
|model → invalid：NO|relationship|E06|
|token → acct：YES|relationship|E06|
|token → fail：NO|relationship|E06|
|acct → fail：NO|relationship|E06|
|acct → session：YES|relationship|E06|

## Token 資料流：密碼驗證到資料庫欄位

類型：Data-flow。APWD 是驗證密碼，PWD 存 V4 access_token；不是同一欄位。EXPIRES_AT 僅新建 DTO 暫存，圖中沒有新增 Token／授權碼表。成功 callback 包含水號，但 token 密文不包含水號。

|元素|類型|來源|
|---|---|---|
|表單資料 / Account / Password；+ Captcha|node|E19|
|讀取 APWD / 有效帳號；WCF Query|node|E10, E12|
|n0 → n1|relationship|E10, E12|
|密碼比較 / hash 或 legacy AES；PasswordHash|node|E20|
|n1 → n2|relationship|E20|
|Token 資料 / account + timestamp；AES / Base64Url|node|E07, E28|
|n2 → n3|relationship|E07, E28|
|帳號欄位 / PWD / refresh；WCF UPDATE|node|E11, E15|
|n3 → n4|relationship|E11, E15|
|Callback / 200 + Tokens；302 / JSON*|node|E08|
|n4 → n5|relationship|E08|

## 登入資料流：Token 到 Session

類型：Data-flow。Session keys：UserName、CurrentWaterNo、WaterNo(JSON)、UserId、StartDate、EndDate。DB Query 不篩選傳入 water_no；水號清單有值才能 First()。WB=HTTP，TB=物件清單，LS=記憶體 Session。

|元素|類型|來源|
|---|---|---|
|登入請求 / account / water；access_token|node|E06, E01|
|查 Token / PWD + VALID=1；Query B_ACCOUNT|node|E09|
|n0 → n1|relationship|E09|
|檢查 Token / account / 期限；AES decrypt|node|E07|
|n1 → n2|relationship|E07|
|帳號水號 / 全部有效綁定；ORDER WATER_NO|node|E10, E11|
|n2 → n3|relationship|E10, E11|
|轉換清單 / First() 目前水號；F_B_LOGIN list|node|E06|
|n3 → n4|relationship|E06|
|建立 Session / 六個欄位；SetLoginSession|node|E13|
|n4 → n5|relationship|E13|

## APP 介接的邏輯資料關係

類型：ER。1→0..* 是依查詢還原的邏輯關係，SQL PK／FK／唯一性約束未確認。AppTokenInfoDto 不是實體 Token 表；WATER_NO 由 @WaterNo 投影，EXPIRES_AT 未由 token 查詢 SQL 回填。

|元素|類型|來源|
|---|---|---|
|b_ACCOUNT（帳號） / B_ACCOUNT_SN : int；B_ACCOUNT : string；APWD : string（驗證密碼）；PWD : string（access token）；APP_REFRESH_TOKEN : string?；VALID : decimal|table|E21, E09, E12|
|B_ACCOUNT_WATER_NO（綁定） / B_ACCOUNT_SN : int（邏輯关联）；WATER_NO : string；VALID : decimal；NICK_NAME : string；NICK_NAME_SHOW : decimal?|table|E22, E11|
|acct → water：HAS BINDINGS|relationship|E11, E21, E22|
|AppTokenInfoDto（投影） / ACCOUNT_NO / WATER_NO；ACCESS_TOKEN / REFRESH_TOKEN|node|E01, E09|
|acct → dto：PROJECT|relationship|E09|

## 資料庫 Schema：可觀察欄位與未知約束

類型：DB Schema。未提供 DDL：右側標的是已觀察 CLR 型別，不是 SQL 型別。SQL 型別／長度／nullable／PK／FK／indexes／ON DELETE 都待確認，不捏造建表 SQL。只列核心欄位；完整 C# 欄位見分析報告。

|元素|類型|來源|
|---|---|---|
|TWN.dbo.B_ACCOUNT / B_ACCOUNT_SN / CLR int; SQL ?；B_ACCOUNT / CLR string; SQL ?；APWD / CLR string; SQL ?；PWD / CLR string; SQL ?；APP_REFRESH_TOKEN / CLR string?; SQL ?；VALID / CLR decimal; SQL ?；ST_DATE / CLR DateTime?; SQL ?；EN_DATE / CLR DateTime?; SQL ?|table|E09, E11, E21|
|TWN.dbo.B_ACCOUNT_WATER_NO / B_ACCOUNT_SN / CLR int; SQL ?；WATER_NO / CLR string; SQL ?；VALID / CLR decimal; SQL ?；ST_DATE / CLR DateTime?; SQL ?；EN_DATE / CLR DateTime?; SQL ?；NICK_NAME / CLR string; SQL ?；NICK_NAME_SHOW / CLR decimal?; SQL ?|table|E11, E22|
|water → acct：FK / ON DELETE ?|relationship|E11|

## 首次授權的訊息順序

類型：Sequence。合併 WCF／DB 為一條 lifeline，未主張已取得伺服端程式。Captcha 圖片請求與 CSRF 由流程圖／證據說明。authorization_code 是分支名稱；程式沒有中介授權碼交換。

|元素|類型|來源|
|---|---|---|
|APP／瀏覽器|node|E19, E04|
|HomeController|node|E04, E05|
|HomeService|node|E12, E11|
|WCF／DB 邊界|node|E15, E09|
|POST AccessToken / authorization_code|message|E04|
|GetAppV4Account|message|E04, E10|
|Query B_ACCOUNT|message|E10, E15|
|有效帳號|message|E10|
|帳號|message|E10|
|200 HTML ExternalLogin|message|E04, E19|
|POST ExternalLogin + CSRF + Captcha|message|E05, E19|
|ValidateAppV4Password → APWD|message|E12, E20|
|true（含 WCF 查詢與密碼比較）|message|E12|
|IssueAppToken → SaveAppV4TokenToPwd|message|E07, E11|
|Execute UPDATE PWD / refresh|message|E11, E15|
|302 callback query：result=200 + Tokens|message|E05, E08|

## 有效 Refresh Token 的訊息順序

類型：Sequence。主成功路徑。未命中時回 ExternalLogin HTML；參數空白回 1001。Execute 回傳 affected rows，但 SaveAppV4TokenToPwd 沒有檢查此數值。

|元素|類型|來源|
|---|---|---|
|APP／瀏覽器|node|E19, E04|
|HomeController|node|E04, E05|
|HomeService|node|E12, E11|
|WCF／DB 邊界|node|E15, E09|
|POST AccessToken / refresh_token|message|E04|
|GetAppV4Account|message|E04, E10|
|有效帳號（內含 WCF 查詢）|message|E10, E15|
|GetAppV4TokenByRefreshToken|message|E04, E09|
|Query account + VALID + refresh|message|E09, E15|
|目前 Token DTO|message|E09|
|Token 命中|message|E09|
|IssueAppToken → SaveAppV4TokenToPwd|message|E07, E11|
|Execute UPDATE PWD / refresh|message|E11|
|affected rows（未檢查）|message|E11, E15|
|完成；未檢查更新筆數|message|E11|
|302 callback：200 + 新 Token|message|E04, E08|

## LoginAPP：金鑰驗證後建立網站 Session

類型：Sequence。Session／Dashboard 合併為網站邊界，六個 Session 欄位見 Data-flow。APP、授權頁與 Dashboard 的 Cookie 如何在手機 WebView 間共享，需要實際 APP 才能驗證。

|元素|類型|來源|
|---|---|---|
|APP／瀏覽器|node|E06|
|HomeController|node|E06|
|HomeService／WCF|node|E09, E11, E15|
|Session／Dashboard|node|E13, E14, E24|
|POST LoginAPP：account / water / access|message|E06|
|GetAppV4TokenByAccessToken|message|E06, E09|
|DB token match（或 null）|message|E09|
|AES 帳號與期限驗證|message|E07|
|GetAppV4Account|message|E06, E10|
|有效帳號|message|E10|
|GetAppV4WaterNos：ALL VALID ORDER BY WATER_NO|message|E11|
|完整綁定水號清單|message|E11|
|SetLoginSession；First() 為目前水號|message|E06, E13|
|302 /Dashboard/Index|message|E06|
|GET Dashboard + .TWNP.Session|message|E03, E24|
|SessionAuthorization 通過後回首頁|message|E14, E23, E24|

## Token 的可用狀態（由條件推導）

類型：State。這些是依程式條件推導的狀態，沒有資料庫 STATE enum 或排程更新。Refresh 可在 access 過期後換發，只要目前 refresh 匹配且帳號有效；新核發描述新的一組凭證，不是恢復舊值。

|元素|類型|來源|
|---|---|---|
|沒有可用 V4 金鑰 / 需帳密授權|node|E05, E07|
|可通過 Token 驗證 / DB 匹配 + VALID=1；Now ≤ issuedAt+6 months|node|E07, E09|
|Access 超過期限 / LoginAPP → 1004 HTML|node|E06, E07|
|舊憑證已被覆寫 / 舊 access / refresh 不匹配|node|E09, E11|
|帳號 VALID ≠ 1 / 查詢無命中|node|E09, E10|
|absent → valid：AUTHORIZE|relationship|E05, E07|
|valid → expired：TIME > 6 MONTH|relationship|E07|
|valid → replaced：NEW ISSUE|relationship|E07, E11|
|valid → disabled：VALID ≠ 1|relationship|E09|
|expired → valid：REFRESH MATCH / NEW TOKENS|relationship|E04, E09, E11|
|replaced → valid：REAUTHORIZE / NEW TOKENS|relationship|E04, E05, E07|

## 瀏覽器的授權與 Session 狀態

類型：State。推導狀態，不是程式 enum。Session 閒置期限設定為 3600 秒且使用記憶體 cache；實際手機 Cookie／節點重啟後行為需執行驗證。Logout 僅移除 UserName，沒有清除 Token 或全部 Session。

|元素|類型|來源|
|---|---|---|
|尚未登入網站 / UserName 不存在|node|E14|
|外部授權頁 / 等待帳密／驗證碼|node|E04, E19|
|APP 已取得金鑰 / 尚未建立登入 Session|node|E05, E07|
|網站 Session 已登入 / UserName / 水號清單|node|E06, E13|
|已取消此次授權 / 1003 或 refresh 的 1005|node|E05|
|out → form：AUTH CODE|relationship|E04|
|form → token：PASSWORD OK|relationship|E05|
|token → login：LoginAPP [VALID]|relationship|E06, E13|
|form → cancel：CANCEL|relationship|E05|
|login → out：LOGOUT / SESSION ABSENT|relationship|E27, E14, E03|

## Controller、Service 與依賴的類別結構

類型：UML Class。只列目前 APP V4 相關成員。虚線空心三角＝實作；實線空心三角＝繼承；虛線開放箭頭＝使用依賴。成員的 + / - 是實際 public / private。完整 UML 圖例：繼承 △、實作 - - △、依賴 - - >、關聯 →、聚合 ◇、組合 ◆；本圖只使用前三種。

|元素|類型|來源|
|---|---|---|
|HomeController / - homeService: IHomeService；---；+ AccessToken(model): IActionResult；+ ExternalLogin(model): IActionResult；+ LoginAPP(model): IActionResult；- IssueAppToken(...): AppTokenInfoDto；- IsValidAppToken(...): bool|class|E04, E05, E06, E07|
|«interface» IHomeService / + GetAppV4Account(...): b_ACCOUNT?；+ ValidateAppV4Password(...): bool；+ GetAppV4TokenByAccessToken(...)；+ GetAppV4TokenByRefreshToken(...)；+ SaveAppV4TokenToPwd(...): void|class|E35|
|ContextController / + Success(...): MessageAPI；+ Failed(...): MessageAPI|class|E34|
|HomeService / - dataAccess: IDapperDataAccess；- _aspNetUser: IAspNetUser；---；+ ValidateAppV4Password(...): bool；+ GetAppV4WaterNos(...): List；+ SaveAppV4TokenToPwd(...): void|class|E11, E12, E33|
|«interface» IDapperDataAccess / + Query<T>(sql, parameters): List<T>；+ Execute(sql, parameters): int|class|E15|
|«static» PasswordHashUtil / + VerifyPassword(...): bool；+ VerifyPasswordOrLegacyAes(...): bool|class|E20|
|home → iface：USES|relationship|E33|
|home → context：EXTENDS|relationship|E36|
|svc → iface：IMPLEMENTS|relationship|E33|
|svc → data：USES|relationship|E33, E15|
|svc → pwd：USES|relationship|E12, E20|

## API 請求、回應與查詢 DTO

類型：UML Class。資料模型無繼承關係；只畫依賴，不把 DTO 畫成資料表。每個欄位仍由實際 ViewModel 對照。+ N more 明示被省略欄位，完整契約見報告。 UML 圖例同 17：本圖只使用依賴 - - >。

|元素|類型|來源|
|---|---|---|
|AppAccessTokenV4RequestVm / + grant_type: string [Required]；+ refresh_token: string?；+ account_no: string [Required]；+ water_no: string [Required]；+ redirect_uri: string [Required]|class|E01|
|HomeController / + AccessToken(request): IActionResult；+ ExternalLogin(form): IActionResult；+ LoginAPP(request): IActionResult|class|E04, E05, E06|
|LoginAppV4Vm / + account_no: string [Required]；+ water_no: string [Required]；+ access_token: string [Required]|class|E01|
|ExternalLoginViewModel / + Account / Password: string [Required]；+ CapthCode: string [Required]；+ GrantType / AccountNo: string；+ WaterNo / RedirectUri: string|class|E01, E19|
|AppTokenV4ResponseVm / + account_no / water_no: string；+ result: int; message: string；+ access_token: string?；+ expires_in / refresh_token: string?|class|E01, E08|
|AppTokenInfoDto / + ACCOUNT_NO / WATER_NO: string；+ ACCESS_TOKEN / REFRESH_TOKEN: string；+ EXPIRES_AT: DateTime；+ VALID: decimal?|class|E01, E09|
|home → request：USES|relationship|E04, E01|
|home → login：USES|relationship|E06, E01|
|home → response：RETURNS|relationship|E08, E01|
|home → external：USES|relationship|E05, E01|
|home → dto：USES|relationship|E07, E01|
