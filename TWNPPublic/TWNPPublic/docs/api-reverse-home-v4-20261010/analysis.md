# 外部 APP API 逆向分析：Home APP V4

分析日期：2026-10-10。範圍：使用者指定的 TWNPPublic 專案，以 `ViewModels/Home/HomeViewModel.cs` 為追查起點，追至 HTTP 路由、Controller、Service、直接參照的 SqlData WCF client、資料庫欄位與網站 Session。

閱讀入口：[離線圖冊 index.html](index.html)。要求的 Swimlane、Process、Flowchart、Data-flow、ER、DB Schema、Architecture、Sequence、State、UML Class 共 10 種，拆成 18 張可獨立開啟的 HTML，附 SVG。每張圖的來源與元素對照可展開，也集中於 [evidence.md](evidence.md)。

頁面與圖面預設調整為接近上一版網頁縮放至 75% 的大小，建議瀏覽器維持 100%。每張圖上方提供文字大小控制：小 60%、中 75%、大 100%；「自訂」可手動輸入任意正百分比（含小數），按 Enter 或套用，沒有固定選項或人工設定的上限。百分比仍以上一版 100% 為基準；圖框、連線與間距同步縮放，保持原有換行並避免文字放大後重疊，較寬的圖可左右捲動。各圖設定互不影響，重新開啟回到 75%。空白、零、負數或無效數值不會套用，保留前次有效大小並提示修正。控制功能可在整合圖冊及獨立 HTML 離線使用；直接開啟 SVG 檔則顯示預設 75% 大小的靜態圖。

本報告為「原始碼現況」的逆向還原，沒有把程式現況當成已核准的業務需求。只新增分析文件；未更改 Controller、Service、View、DB、套件或既有圖表。沒有建立或覆寫專案需求 SSOT。

## 1. 先看結論

1. `HomeViewModel.cs` 包含請求／回應 DTO；`HomeViewModel` 本身是空類別。實際 APP V4 HTTP 入口在 `HomeController`。
2. 此專案實際 target 是 **.NET 6 / ASP.NET Core MVC**，不是從作業規範列舉的 .NET 8／10 推定版本。資料存取透過 **HomeService → IDapperDataAccess → WCF → SQL Server**。這條流程沒有 EF Core DbContext。[E01、E02、E03、E15、E32]
3. APP V4 分為「取得或換發金鑰」與「持金鑰登入網站」。授權成功只存金鑰，不建立網站登入 Session；`LoginAPP` 才建立 Session。[E04–E08、E13]
4. API 回應混合 **HTML、302 Redirect、少數條件下 JSON**。它是自訂 MVC 介接；`authorization_code` 雖使用這個字串，程式沒有回傳中介授權碼再交換 Token，不宜直接當成標準 OAuth 2.0／JWT。[E04、E05、E07、E08]
5. APP 驗證密碼使用 **B_ACCOUNT.APWD**，V4 `access_token` 寫入 **B_ACCOUNT.PWD**，`refresh_token` 寫入 **B_ACCOUNT.APP_REFRESH_TOKEN**。同帳號的新組會覆寫舊組；沒有獨立 Token 表的證據。[E09、E11、E12]
6. 傳入 `water_no` 為必填，但 V4 Token 查詢只是將參數投影成 DTO 的 WATER_NO，不檢查綁定。登入取得帳號所有有效水號，排序後選 **第一筆** 作為目前水號。[E06、E09、E11]

## 2. 入口與資料流追蹤

|層次|程式位置|角色|
|---|---|---|
|資料契約|`ViewModels/Home/HomeViewModel.cs:52` 起|APP V4 請求、表單、回應與 Token DTO；實際定義以 E01 為準|
|HTTP route|`Program.cs:36`|Conventional route：`{controller=Dashboard}/{action=Index}/{id?}`|
|Controller|`Controllers/HomeController.cs:37 / 107 / 163`|AccessToken、ExternalLogin、LoginAPP|
|Service|`Domain/Service/HomeService.cs:73–150`|帳號、Token 比對、APWD 驗證、水號與 Token 更新|
|資料代理|`Domain/Extensions/DapperDataAccessExtensions.cs:12`|注入 `IDapperDataAccess` singleton|
|參照依賴|`../../SqlData/DapperDataAccess.cs:71 / 87`|序列化參數並呼叫 WCF ChannelService.Execute／Query|
|資料物件|`Models/Entity/B_ACCOUNT.cs`、`B_ACCOUNT_WATER_NO.cs`|查詢結果的 C# model；不能視為 SQL DDL|
|網站登入|`Controllers/HomeController.cs:1312`|SetLoginSession；Dashboard 的 BasicController／SessionAuthorization 讀取 UserName|

正式 base URL、反向代理的路徑前綴、WCF 部署節點及 DB instance 不由這些路由推定。報告不列設定檔中的主機、帳密、祕密或真實 Token。

## 3. 可由原始碼確認的 API 契約

以下路徑為 MVC route 的專案內相對路徑。Action 沒有 `[ApiController]` 或 `[FromBody]`；建議按現況用表單送出。直接送 JSON body 不可假定會綁定成功。

|方法／路徑|輸入|主要輸出|來源|
|---|---|---|---|
|POST `/Home/AccessToken`|`grant_type`、`account_no`、`water_no`、`redirect_uri` 必填；`refresh_token` 條件必填|首次授權／refresh 未命中：HTML ExternalLogin；成功或錯誤：302 callback；redirectUri 空白時 helper 回 JSON|E01、E04、E08|
|POST `/Home/ExternalLogin`|`Account`、`Password`、`CapthCode` 必填；`GrantType`、`AccountNo`、`WaterNo`、`RedirectUri` 由 hidden fields 傳回；另含 anti-forgery token|驗證失敗：原 HTML 表單；成功：302 callback 或空 URI 時 JSON|E01、E05、E19|
|GET `/Home/CancelExternalLogin`（View 使用方式）|`account_no`、`water_no`、`redirect_uri`、`grant_type`|302 callback，result=1003；refresh 模式為 1005；URI 空白時 JSON|E05、E19|
|POST `/Home/LoginAPP`|`account_no`、`water_no`、`access_token` 必填|成功：建立 Session 後 302 `/Dashboard/Index`；失敗：HTML LoginAppAuthFailed|E01、E06、E31|
|GET `/Home/CreateValidate`（圖片使用方式）|Session Cookie；沒有表單參數|JPEG 驗證碼；Session 寫入 CaptchaData|E18、E19|
|POST `/Home/DenyAppAcounnt`|舊命名 `WaterNo`、`AccessToken` 必填|MessageAPI JSON；更新 LOGIN_TYPE=0，與 V4 撤銷有差異，見第 9 節|E01、E16、E26|

`CancelExternalLogin` 與 `CreateValidate` 沒有 HTTP method attribute；GET 是 View 實際使用方式，不代表 Controller 明確限制只接受 GET。

### AccessToken／ExternalLogin 的回應欄位

|欄位|型別與實際內容|
|---|---|
|`account_no`、`water_no`|string；回填請求相關值|
|`result`|int；業務結果碼，**不是 HTTP status**|
|`message`|string；結果訊息|
|`access_token`|string；失敗時為空字串|
|`expires_in`|string；實際是 `yyyyMMddHHmmss` 的到期時間，**不是有效秒數**；失敗時空字串|
|`refresh_token`|string；失敗時空字串|

Helper 會把這些欄位逐一 URL encode，串接至 `redirect_uri` 的 query string；URI 已含 `?` 時使用 `&`。程式未處理 URI fragment 的插入位置，也未驗證 callback 白名單。[E08]

雖然 `redirect_uri` 在 AccessToken request 上為 Required，helper 保留空 URI → JSON 的分支；因此「可回 JSON」不代表傳空 URI 就能完成授權。正常必填驗證會先失敗。ExternalLogin 的 RedirectUri 沒有 Required 屬性，契約驗證強度不同。[E01、E04、E05、E08]

### 業務結果與錯誤呈現

|result|觸發情境|實際呈現|
|---|---|---|
|200|首次授權／重新驗證成功／直接 refresh 成功|callback：核發或換發金鑰成功|
|1001|AccessToken ModelState 失敗、grant_type 不支援、refresh_token 空白|callback 或 JSON fallback|
|1001|LoginAPP ModelState 失敗|HTML：「授權驗證失敗(1001)!」|
|1002|GetAppV4Account 無有效帳號|callback：「用戶尚未使用智慧水表」；實際未查智慧水表表|
|1003|取消首次授權|callback：「不同意或取消授權」|
|1004|LoginAPP DB token 未命中／解密或期限失敗／帳號不存在／有效水號清單空|HTML，訊息中的驚嘆號數量區分分支；沒有 1004 callback|
|1005|取消 refresh 重新驗證|callback：「更新金鑰驗證失敗」|

ExternalLogin 表單欄位、Captcha、帳號一致性或密碼失敗，是 ModelState 錯誤後重新顯示頁面，不使用上述 callback 結果碼。CSRF 失敗由 MVC 在 Action 前拒絕；實際 HTTP 錯誤頁面仍須執行確認。[E05、E19]

## 4. 首次授權流程

1. APP 以表單 POST AccessToken，送 `grant_type=authorization_code`、會員帳號、水號與 callback URI。
2. MVC 驗證 Required。失敗回 1001。Service 查 `[TWN].[dbo].[B_ACCOUNT]`，條件只有 `B_ACCOUNT=@AccountNo AND VALID=1`；未找到回 1002。
3. Controller 回 ExternalLogin HTML：預填／readonly 帳號；hidden fields 保留 AccountNo、WaterNo、GrantType、RedirectUri。
4. 頁面請求 CreateValidate。產生五位驗證碼，Session 記錄 CaptchaData，有效期限設定五分鐘，回 JPEG。
5. 使用者提交帳密、驗證碼及 anti-forgery token。外部頁面與圖片／POST 必須維持同一 Session Cookie。
6. ExternalLogin 依序檢查 ModelState、驗證碼、`AccountNo==Account`、`ValidateAppV4Password`。
7. 驗證碼一旦被 ValidateCaptcha 讀取就立即移除；檢查過期、Session ID、忽略大小寫的碼值。不應把程式註解「原子性」視為已證明的併發保證。
8. Service 讀取 APWD；PasswordHashUtil 先以 PBKDF2-SHA256 驗證，失敗後嘗試 legacy AES 密碼比對。
9. IssueAppToken 產生 access／refresh，覆寫帳號的 PWD／APP_REFRESH_TOKEN。此處沒有新增帳號、綁定水號或建立網站登入 Session。
10. 導向 callback，`result=200`，message 為核發金鑰成功。APP 接收／保存的實作未提供。

對照圖：02 Swimlane、03 Process、04／06 Flowchart、08 Data-flow、12 Sequence。

## 5. 金鑰內容、保存與期限

Access 的加密前文字為 `account_no + '_' + yyyyMMddHHmmss`，經 AES 加密及 Base64Url 轉換。Refresh 的加密前文字再加 `_refresh_` 與 16 bytes 隨機值的十六進位字串。祕密 key 僅指出程式位置，不列值。[E07、E28]

有效期限以伺服器 `DateTime.Now` 核發時刻加 **六個曆月**。沒有 UTC、時區偏移或 Unix timestamp 欄位；不是固定 180 天。LoginAPP 解析加密內容最後一個底線後的時戳，比對帳號與 `Now <= issuedAt.AddMonths(6)`；解析失敗回 false。[E07]

`AppTokenInfoDto.EXPIRES_AT` 在新核發時有賦值，但保存 SQL 沒有持久化這個欄位，Token 查詢 SELECT 也沒有回填它。實際到期檢查是解析 Token。資料庫 WATER_NO 欄位亦非該 Token 查詢的綁定證據，因它是 `@WaterNo AS WATER_NO`。[E07、E09、E11]

每次核發執行一個 UPDATE，沒有多表交易的證據。`SaveAppV4TokenToPwd` 回傳 void，忽略 Execute 的 affected rows；不能保證回應 200 就已更新到一筆資料。WCF 或記錄寫入例外也可能使主流程提前失敗。[E11、E15、E29]

新核發通常使舊組失效，但 access 只使用秒級時間戳而沒有隨機數；同帳號同一秒加上固定 Key／IV 會得到相同 access 值。因此圖中的「覆寫」不應解讀成每次必定產生不同 access。Refresh 有隨機部分。[E07、E28]

## 6. Refresh 流程

1. 表單 POST AccessToken，`grant_type=refresh_token`；先經過同樣的 Required 與有效帳號檢查。
2. refresh_token 空白回 1001。非空時 Trim 後查 B_ACCOUNT：帳號、VALID=1、APP_REFRESH_TOKEN 精確匹配。
3. 未命中時回 ExternalLogin HTML，GrantType 仍為 refresh_token；使用者重新進行帳密／Captcha 驗證。沒有直接回 refresh 錯誤碼。
4. 命中時不要求帳密、不檢查 access 過期、不解密 refresh 時戳，直接 IssueAppToken 覆寫 PWD／APP_REFRESH_TOKEN。
5. callback result=200，message=換發金鑰成功。取消重新驗證時為 1005。

程式没有單次 refresh 的 compare-and-swap 或 transaction 條件：UPDATE 只比對帳號與 VALID，未把舊 refresh 放入 UPDATE WHERE。併發是否被 WCF／DB 額外控制未知，不宣稱單次使用保證。[E04、E09、E11]

對照圖：05 Flowchart、13 Sequence、15 Token State。

## 7. LoginAPP 到 Dashboard

1. APP／WebView POST LoginAPP，送 account_no、water_no、access_token。
2. ModelState 失敗回 LoginAppAuthFailed HTML（1001）。
3. Trim access，查 B_ACCOUNT 的帳號、VALID=1、PWD 精確匹配。DTO 的 WATER_NO 只是參數投影。
4. 解密 Token，比對帳號與六個月期限。任一失敗回 1004 HTML。
5. 再查有效帳號，取得 B_ACCOUNT_SN、ST_DATE、EN_DATE。
6. 用 B_ACCOUNT_SN 查全部 `B_ACCOUNT_WATER_NO` 且 VALID=1，`ORDER BY WATER_NO`。方法接受 WaterNo 但沒有使用它。
7. 清單空回 1004；非空則映射 F_B_LOGIN_WaterNo，NICK_NAME_SHOW 空值轉 `"0"`。
8. 用 `WaterNos.First().WATER_NO` 作 CurrentWaterNo。明確檢查传入水號是否在清單的程式被註解，沒有執行。
9. 建立六個 Session key 後 302 `/Dashboard/Index`。
10. Dashboard 繼承 BasicController；SessionAuthorization 檢查 UserName 非空。BasicController 的 AutoValidateAntiforgeryToken 保護其修改型方法，這個基底 Filter 並沒有套用到直接繼承 ContextController 的 HomeController。

|Session key|來源與用途|
|---|---|
|UserName|有效帳號的 B_ACCOUNT；SessionAuthorization 以此決定已登入|
|CurrentWaterNo|帳號有效水號排序後第一筆|
|WaterNo|全部有效水號的 F_B_LOGIN_WaterNo List 序列化 JSON|
|UserId|B_ACCOUNT_SN.ToString()|
|StartDate|ST_DATE.ToString()；null nullable DateTime 會得到空字串|
|EndDate|EN_DATE.ToString()；同上|

Session 使用 AddDistributedMemoryCache，cookie 名 `.TWNP.Session`，HttpOnly、SameSite=None、Secure=Always、IsEssential=true，IdleTimeout=3600 秒。它是記憶體儲存，不是已證明共享到多節點的分散式持久化。[E03、E13、E14、E23、E30]

報告追蹤到 Dashboard 登入邊界；首頁後續還有 DashboardService 查詢及 SQL functions，未聲稱完整還原所有用水／帳單功能。

對照圖：07 Flowchart、09 Data-flow、14 Sequence、16 Session State。

## 8. 資料庫還原的證據界限

### B_ACCOUNT：C# model 欄位

`B_ACCOUNT_SN:int`、`B_ACCOUNT:string`、`PWD:string`、`APP_REFRESH_TOKEN:string?`、`CREATE_DATE:DateTime`、`LAST_DATE:DateTime`、`EMAIL:string`、`CELL_PHONE:string`、`VALID:decimal`、`APWD:string`、`LOGIN_TYPE:decimal?`、`INITIAL_LOGIN:decimal?`、`INITIAL_APPLOGIN:decimal?`、`DIRECT_APPLOGIN:decimal?`、`ST_DATE:DateTime?`、`EN_DATE:DateTime?`、`USERNAME:string?`。[E21]

### B_ACCOUNT_WATER_NO：C# model 欄位

`B_ACCOUNT_SN:int`、`WATER_NO:string`、`VALID:decimal`、`ST_DATE:DateTime?`、`EN_DATE:DateTime?`、`NICK_NAME:string`、`NICK_NAME_SHOW:decimal?`。另有 V_B_ACCOUNT_WATER_NO 衍生類別增加 NAME_DAES／ADDRESS_DAES，不是 V4 核心查詢所用 model。[E22]

依 SQL 使用可還原「帳號 → 零到多筆綁定水號」的邏輯關係；不能因 C# int／string 就斷言 SQL int／nvarchar 長度、實際 nullable、PK、FK、Unique、索引或 ON DELETE。沒有提供核心兩表的 DDL，故 **不產生猜測的 CREATE TABLE SQL**。[E09–E11、E21、E22]

SqlData client 在部分 Query／Execute 之前寫 SYS_LOG，其條件依 AccountName 是否 null。SYS_LOG 的完整部署 schema 和欄位約束未確認；圖冊不把它捏造成這兩張表的 FK。[E29]

對照圖：10 ER、11 DB Schema。Schema 欄位列顯示 CLR 型別及 `SQL ?`，欄位關係用虛線與「FK / ON DELETE ?」標示。

## 9. 舊版、其他入口與撤銷差異

- `HomeController.cs:372–691` 包在 `#if false`；舊 LoginAPP(LoginAppVm)、LoginAPPs、AccessToken(string WaterNo) 不會編譯。HomeViewModel.cs 中保留 LoginAppVm、Views/Home/LoginAPPs.cshtml 存在，均不等於目前可用的 HTTP Action。[E17]
- **DenyAppAcounnt 仍啟用**（保留原拼字）。它採舊 Base64 處理及 AES 解密，將 token 第一段與 WaterNo 比對，再用 WaterNo 更新對應 B_ACCOUNT.LOGIN_TYPE=0。沒有清空 PWD／APP_REFRESH_TOKEN、沒有 V4 的 account_no model，也沒有 DB Token 比對或到期驗證。[E16、E26]
- V4 GetAppV4Account／Token 查詢不檢查 LOGIN_TYPE，因此不能把 DenyAppAcounnt 成功畫成 V4 Token 已撤銷。V4 token 是 Base64Url 且主體為 account_no，與這個水號／舊 Base64 介接是否相容，需要另外確認。[E09、E10、E16]
- **Logout** 只移除 Session.UserName，沒有清除全部 Session 或撤銷 Token。[E27]
- 另有仍啟用的業務網站深連結：`Index(Token)`、`Note(Token)`、`DetailsTable(Token)`（HomeController.cs:773、857、949）。它們採另一種加密 Token 與短時效驗證再建立 Session，不應混入 APP V4 金鑰流程。本次標示入口但不把其他系統的發 Token 程式或业务用途推定成已知；相關發送端未提供。
- `Controllers/Api/LayerController.cs` 是另一模組的 API 命名空間；本次由指定 Home DTO 追查，沒有把整個專案所有 API 合併為 APP V4。

## 10. 從現況可見的風險與待決業務規則

此節為靜態觀察，不代表已發現可重現攻擊或已修改修正。

|觀察|實務影響／需要確認|來源|
|---|---|---|
|water_no 未驗證／不作選取條件|APP 指定水號不一定是登入後顯示水號；先確認它是保留欄位還是應強制綁定|E06、E09、E11|
|1002 與查詢不一致|錯誤訊息說未使用智慧水表，實際只代表有效帳號不存在|E04、E10|
|callback URI 直接 Redirect|未見白名單／與授權請求伺服端綁定，Token 又放 query string；實際信任邊界與暴露範圍需確認|E05、E08、E19|
|Home 的 CSRF 保護各 Action 不一致|ExternalLogin 有 ValidateAntiForgeryToken；AccessToken、LoginAPP、DenyAppAcounnt 沒有同等顯式 Filter。應依 APP 介接方式評估，不能直接照搬網站表單規則|E04–E06、E16、E23|
|固定密碼學材料及秒級 access|程式內有固定字串衍生 Key／IV；access 無隨機數，同秒可能相同。需要確認正式 token 發行契約|E07、E28|
|refresh 沒有自己的期限檢查|只依目前 DB 值與 VALID=1；是否符合預期需业务确认|E04、E09|
|更新筆數未檢查|帳號被同步停用或 DB 無更新時可能仍走成功回應|E11|
|singleton 資料代理包含 mutable Name／ClientIP／Channel|可能跨請求互相影響記錄上下文，需併發執行證據，不直接宣稱已發生|E25、E15、E29、E33|
|例外處理差異|Token 解析例外回 false；Captcha 例外有 LogError；WCF 主呼叫例外可能交給非開發環境全域 Error handler|E02、E07、E13、E15|
|沒有 DB DDL／正式呼叫紀錄|表約束、資料唯一性、實際 HTTP response 與 APP 相容性未驗證|E21、E22|

## 11. Debug 與驗證建議

|症狀|建議斷點／變數|
|---|---|
|APP 取得的是 HTML 而不是 Token JSON|AccessToken:37；檢查 model.grant_type、ModelState、appAccount、appToken；authorization_code 正常就是 HTML|
|refresh 變成授權頁|GetAppV4TokenByRefreshToken:99；檢查帳號 VALID、目前 APP_REFRESH_TOKEN 匹配情形，避免把 Token 真值寫入 Log|
|帳密／Captcha 一直失敗|ExternalLogin:107、ValidateCaptcha:1334；检查 AccountNo==Account、CaptchaData 有無／期限／SessionId；ValidateAppV4Password:115 檢查 APWD 格式|
|LoginAPP 出現 1004|LoginAPP:163；依 token、IsValidAppToken、getAccount、WaterNos.Any() 分支定位|
|登入後水號不符|GetAppV4WaterNos:121；檢查 querysql 不含 WaterNo，以及 WaterNos.First().WATER_NO|
|授權成功卻進不了 Dashboard|SetLoginSession:1312、SessionAuthorization.OnAuthorization:9；查看 UserName 與 Cookie 是否延續到同一 WebView|
|DB 寫入／查詢失敗|HomeService:141、DapperDataAccess.Execute／Query、SYS_LOG；確認例外是否發生在日誌寫入前置流程|
|Deny 成功仍能 V4 登入|DenyAccountFromApp:281 與 Token SQL:83；觀察 LOGIN_TYPE 沒有參與 V4 查詢|

建議後續有正式測試環境時覆蓋：正常首次授權、空參數、不支援 grant、無帳號、錯誤／已使用／逾期 Captcha、帳號不一致、錯密碼、refresh 命中／不命中／取消、access 錯誤／過期、有效水號空、多水號排序、跨 WebView Cookie、更新零筆、WCF 錯誤、併發 refresh。需使用測試資料，不在分析階段呼叫正式外部 API 或修改 DB。

## 12. 實際執行結果與限制

- `dotnet build TWNPPublic.csproj --no-restore -v quiet`：**失敗**，MSB4018／NuGet.Packaging.Core.PackagingException；既有 assets 指向不存在的 `C:\Program Files (x86)\Microsoft Visual Studio\Shared\NuGetPackages`。
- `dotnet test ../TWNPPublicTests/TWNPPublicTests.csproj --no-restore`：命令回 0 但沒有測試执行摘要，不能視為 passed。再以 `-p:IsTestProject=true` 檢查，遭同一 NuGet 後援資料夾錯誤阻擋；**沒有實際執行測試**。
- 已觀察測試專案目前只有三項 AES helper 測試，沒有 Home APP V4 API 的自動測試；不得將 helper 測試當成整個 API 驗證。
- 未修復 NuGet 環境、未新增套件、未啟動網站、未連線 WCF／SQL Server、未驗證手機 APP 的 callback 或 Cookie。正式執行行為仍待確認。
- 圖表使用安裝版 cathrynlavery/diagram-design v2.6 vendor；來源 commit 與遠端 HEAD 觀察記錄於 source-manifest.json。依 its type references 自行排版 inline SVG，而非假稱使用該專案提供自動讀 C# 的工具。
- 圖面 XML、來源行號／SHA-256、離線資源、accessible SVG、連線及節點幾何的檢查結果見 [validation.md](validation.md)。字體調整後已用 Edge 實際渲染並量測 1536／960px 視窗的文字範圍、最小字體及重疊；未擷取大型截圖。

## 13. 產物與重製

`index.html`：18 張圖整合圖冊。`01-*.html` 至 `18-*.html`：各圖獨立檔。對應 `.svg` 可插入文件。`diagrams.json`：圖面節點／關係／來源。`source-manifest.json`：來源指紋。`evidence.md`：逐圖來源對照。`generate_diagrams.py`、`validate_diagrams.py`：僅使用 Python 標準函式庫，方便在原始碼變更後重新產圖與驗證。

執行（專案根目錄）：

```powershell
python docs/api-reverse-home-v4-20261010/generate_diagrams.py
python docs/api-reverse-home-v4-20261010/validate_diagrams.py
```

既有 `docs/diagrams/` 的未追蹤圖表已保留。本目錄為此次新增分析案例，不覆寫前一次產物。

## 14. 字體與來源編號說明

依閱讀回饋，18 張 SVG 與 19 個 HTML 已統一改善：區塊標題 22px、說明 18px、欄位與箭頭 16px、來源及次要標記 14px；加深文字／線段、長文字換行，並裁去上下多餘留白。密集圖採橫向捲動以保留實際字體大小。

「來源：E09、E11」的 E 是 Evidence（證據），數字是本圖冊的證據索引，**不是步驟、錯誤碼或欄位值**。E09 對應 HomeService.cs:83–113 的 Token 比對查詢；E10 對應 :73–81 的有效帳號查詢；E11 對應 :121–150 的有效水號與 Token 更新。每張圖下方展開「來源編號索引與圖面元素對照」即可查閱詳細來源。

較小的角色框／泳道卡片會把來源移至 tooltip 與證據表；資訊仍完整保留。排版重製由 `diagram_readability.py` 完成，使用 Python 標準函式庫。瀏覽器量測工具 `verify_readability_browser.py` 使用環境已安裝的 Playwright 與 Edge，只讀本機圖檔、不下載套件或截圖。
