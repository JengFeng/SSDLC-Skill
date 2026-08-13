# TWNPPublic 開發文件

本文件依目前程式碼靜態分析整理，目標是讓新進或接手開發者快速理解系統結構、主要流程與維護注意事項。

## 1. 系統概述

`TWNPPublic` 是 ASP.NET Core MVC 網站，主要提供用戶登入、用水儀表板、用水量/指針查詢、警示設定、使用者資料維護與地圖圖層查詢。前端以 Razor View 搭配 jQuery、Bootstrap、ECharts、FullCalendar、FancyBox、Select2 與 EzMap/EzLayer 等靜態資源實作。

系統採典型 MVC 分層：

- `Controllers/`：HTTP 入口、Session 驗證、頁面與 JSON API。
- `Domain/Service/`：商業邏輯與資料存取封裝。
- `Models/Entity/`：資料表/外部 API 對應模型。
- `Models/SqlFunctions/`：SQL function 或 stored procedure 結果模型。
- `ViewModels/`：頁面與 API 回傳資料模型。
- `Views/`：Razor 頁面與 Partial View。
- `wwwroot/`：CSS、JavaScript、地圖圖資、圖片、字型等靜態資源。
- `Common/`：共用 Attribute、加密、Session 使用者資訊、驗證碼等工具。
- `Middleware/`：全域請求中介軟體。

## 2. 技術棧與相依套件

專案檔：`TWNPPublic.csproj`

- .NET：`net6.0`
- MVC：ASP.NET Core MVC + Razor Views
- 資料存取：`Dapper`，並透過 `SqlData` 專案提供的 WCF client 呼叫後端服務
- SQLite：`Microsoft.Data.Sqlite`，用於用水指針資料更新/回寫相關流程
- Excel 匯出：`DotNetCore.NPOI`
- Logging：`NLog.Extensions.Logging`
- API 文件工具：`Swashbuckle.AspNetCore` 已引用，但目前啟動流程未看到 Swagger middleware
- 前端主要函式庫：jQuery、Bootstrap、ECharts、FullCalendar、FancyBox、Select2、FooTable、Air Datepicker、EzMap/EzLayer

外部專案參考：

- `..\..\SqlData\SqlData.csproj`

## 3. 啟動與路由

啟動入口在 `Program.cs`：

1. 建立 `WebApplicationBuilder`
2. 載入 `appsettings.json`
3. 呼叫 `Startup.ConfigureServices(builder.Services, configuration)`
4. 加入 `GlobalDataMiddleware`
5. 啟用 Session、HTTPS 轉址、靜態檔案、Routing、Authorization、CookiePolicy
6. 設定路由

預設路由：

```text
{controller=Dashboard}/{action=Index}/{id?}
```

Areas 路由：

```text
{area:exists}/{controller=Home}/{action=Index}/{id?}
```

本機啟動設定在 `Properties/launchSettings.json`：

- HTTPS：`https://localhost:7048`
- HTTP：`http://localhost:5048`
- IIS Express：`http://localhost:62409/`，SSL port `44335`

## 4. 設定檔

主要設定在 `appsettings.json`：

| Key | 用途 |
| --- | --- |
| `DapperWcfUrl` | Dapper WCF 服務網址，注入為 `IDapperDataAccess` |
| `SQLWcfUrl` | SQL WCF 服務網址，注入為 `ISqlData` |
| `MeterRecordSqllite` | SQLite 檔案路徑格式，預設 `D:\{0}.sqlite` |
| `urlPrefix` | 由 `GlobalDataMiddleware` 放入 `HttpContext.Items["urlPrefix"]` |
| `Environment` | 自訂環境標記，目前為 `Development` |
| `NLog` | 檔案型 logging 設定，輸出到 `${basedir}/logs/sqlite-${shortdate}.log` |

目前 `appsettings.json` 內有正式/測試 WCF URL 註解，實際啟用值為 localhost：

```json
"DapperWcfUrl": "http://localhost/TWN_WCF/DapperService.svc",
"SQLWcfUrl": "http://localhost/TWN_WCF/SqlService.svc"
```

注意：Session cookie 設定 `CookieSecurePolicy.Always`，本機用 HTTP 測試時可能遇到 Session cookie 不送出的問題，建議使用 HTTPS profile。

## 5. 依賴注入

`Startup.ConfigureServices` 註冊項目：

- `IHttpContextAccessor`：Singleton
- `IAspNetUser` -> `AspNetUser`：Scoped
- `IHomeService` -> `HomeService`：Transient
- `IDashboardService` -> `DashboardService`：Transient
- `IAlertService` -> `AlertService`：Transient
- `IUserManageService` -> `UserManageService`：Transient
- `IQualityService` -> `QualityService`：Transient
- `IHttpClientFactory`：`services.AddHttpClient()`
- `ISqlData`：由 `AddWcfData(SQLWcfUrl)` 註冊 Singleton
- `IDapperDataAccess`：由 `AddWcfDapper(DapperWcfUrl)` 註冊 Singleton

資料存取擴充：

- `Domain/Extensions/WcfDataExtensions.cs`
- `Domain/Extensions/DapperDataAccessExtensions.cs`

## 6. 驗證與 Session

受保護頁面多半繼承 `BasicController`，而 `BasicController` 標記 `[SessionAuthorization]`。`SessionAuthorization` 只檢查：

```text
Session["UserName"] 是否存在
```

若不存在，導向 `Home/Login`。

`AspNetUser` 會從 Session 讀取下列使用者狀態：

| Session Key | 用途 |
| --- | --- |
| `UserName` | 登入帳號 |
| `UserId` | 帳號流水號 |
| `CurrentWaterNo` | 目前選取水號 |
| `WaterNo` | 使用者可用水號清單，JSON 格式 |
| `StartDate` | 目前水號可查詢起始日期 |
| `EndDate` | 目前水號可查詢結束日期 |
| `CaptchaData` | 驗證碼資料 |

登入成功或外部 token 驗證成功後，`HomeController` 會透過內部方法寫入這些 Session 值。

## 7. Controller 與功能模組

### HomeController

未繼承 `BasicController`，負責公開入口與登入流程。

主要功能：

- 一般登入：`GET/POST Home/Login`
- APP 登入/綁定：`POST Home/LoginAPP`、`GET/POST Home/LoginAPPs`
- 外部 Token 導頁：`Home/Index`、`Home/Note`、`Home/DetailsTable`
- 產生 AccessToken：`POST Home/AccessToken`
- 取消 APP 授權：`POST Home/DenyAppAcounnt`
- 登出：`Home/Logout`
- 驗證碼：`Home/CreateValidate`
- 忘記/重設密碼：`GET/POST Home/ResetPw`

### DashboardController

首頁與用水儀表板核心。繼承 `BasicController`，需 Session。

主要功能：

- 首頁：`Dashboard/Index`
- 儀表板主資料：`GetDashMainData`
- 水費/帳單資料：`GetWaterFee2`、`GetWaterFee3`
- 詳細表格 FancyBox：`Fancybox_detailsTable`
- 用水圖表：`Fancybox_chart`、`LoadWaterUseAnalyzer`、`GetDashWaterAnalyer`
- 表格與圖表：`Fancybox_tableChart`、`WaterNoteTableChart*`
- 記事與逐時備註：`ListedNotes`、`UpdateHourNote`
- 異常狀態與公告：`ListedExceptionState`、`ListedNews`
- 切換水號：`ListedUserWaterNos`、`ChangeUserWaterNos`
- 密碼更新：`GET/POST Dashboard/UpdatePw`
- 地址/座標：`GetCurrentAddress`、`GetCurrentLatAndLon`
- 聯絡人：`GetContactPersonData`

### QualityController

用水量、用水指針與資料回寫/匯出。

主要功能：

- 水質查詢入口：`WaterQuality`
- 用水指針查詢：`UseWaterQuery`、`UseWaterQueryPin`
- 用水量查詢：`UseWaterQueryNew`
- 圖表查詢：`POST UseWaterChart`
- 用水資料查詢：`POST QueryWaterTypeData`
- 回寫狀態檢查與執行：`POST CheckOptCondition`
- Excel 匯出：`POST ExporttoExcelTable`、`POST ExporttoExcelChart`
- 檔案下載：`Download`

### UserManageController

使用者帳號與水號設定。

主要功能：

- 使用者設定頁：`UserSettings`、`UserSettingsNew`
- 取得使用者資料：`GetUserInfo`
- 取得水號清單：`ListedUserWaterNo`
- 更新使用者資料：`POST UpdateUserInfo`
- 建立使用者：`POST CreatUserInfo`
- 刪除水號：`POST DeleteUserWaterNo`
- 載入警示設定：`LoadAlertSet`
- 查詢水號核許日期：`GetPhMeterQualifyDate`

### AlertController

警示條件設定。

主要功能：

- 警示設定頁：`AlertSettings`
- 讀取指定水號警示設定：`LoadAlertSet`
- 儲存警示設定：`POST SaveAlertSet`

### Api/LayerController

API 路由為 `api/Layer`，主要供 EzLayer/EzMap 前端讀取圖層資料。

主要功能：

- `GET api/Layer/GetLayerData`
- `GET api/Layer/GetDirectoryData`
- `GET api/Layer/GetBaseMapData`
- `GET api/Layer/GetLayerJsonData`
- `GET api/Layer/ProxyData`
- `GET api/Layer/GetAddressCoordinate`

此 Controller 使用 `ISqlData`，部分 SQL 直接寫在 Controller 內。

## 8. Service 職責

### HomeService

- 帳號登入驗證：呼叫 `spB_LOGIN`
- APP 帳號綁定/更新/停用
- 水號有效性與自動讀表判斷
- 登入紀錄 `B_LOGIN_LOG`
- 忘記密碼寄信佇列 `SEND_MAIL_LIST`
- 同步外部 `WMMMDB.dbo.sttngrp` / `WMMMDB.dbo.im_cmuser` 密碼

### DashboardService

- 首頁彙總資料：`F_B_HOME`、`F_B_HOME_SN`
- 用水圖表：`F_B_CHART`、`F_B_CHART1`、`F_B_CHART2`
- 公告、記事、異常訊息
- 水費/帳單資料：`A_WATERFEE`、`A_WATERFEE2`、`V_A_WATERFEE`
- 水號地址/經緯度
- 指針紀錄查詢與自動切分
- 密碼更新與聯絡人查詢

### QualityService

- 用水圖表查詢
- 用水型態資料查詢
- 回寫狀態檢查：`A_PH_METER_RECORD_COVER_LOG`
- 呼叫外部 API 取得指針資料
- 更新 `A_PH_METER_RECORD_LIST`
- SQLite 檔案相關更新流程

### UserManageService

- 帳號資料查詢/新增/更新
- 水號清單新增/刪除
- 驗證帳號是否可用
- 水號核許日期與水號群組判斷
- 使用者個別水號警示項目 `B_ALART_CODE_SN = 652`
- 同步外部 `WMMMDB` 使用者資料

### AlertService

- 警示設定讀取/儲存
- 依帳號或帳號+水號刪除後重建警示項目
- 讀取警示代碼 `MM_CODE`
- 更新外部 `WMMMDB.dbo.im_cmuser` 聯絡資訊

## 9. 主要資料表/模型

常見資料表或模型：

- `B_ACCOUNT`：使用者帳號
- `B_ACCOUNT_WATER_NO`：帳號綁定水號
- `B_ALART_SETTING`：警示設定
- `B_NEWS`：公告
- `B_NOTE`、`B_NOTE_HOUR`：用水記事與逐時備註
- `B_MESSAGE` / `V_B_MESSAGE`：異常訊息
- `A_WATERFEE`、`A_WATERFEE2`、`V_A_WATERFEE`：水費/帳單/地址相關資料
- `A_PH_METER_RECORD_LIST`：指針紀錄
- `A_PH_METER_RECORD_COVER_LOG`：指針資料回寫紀錄
- `A_PH_METER_QUALIFY_DATE`：水號可查詢日期範圍
- `A_PH_METER_STTNGRP`：水號群組/外部同步判斷
- `MM_CODE`：代碼表
- `SEND_MAIL_LIST`：寄信佇列
- `SYS_LOG`：系統紀錄

SQL function / procedure：

- `spB_LOGIN`
- `F_B_HOME`
- `F_B_HOME_SN`
- `F_B_CHART`
- `F_B_CHART1`
- `F_B_CHART2`

## 10. 前端結構

主要 Layout：

- `Views/Shared/_Layout.cshtml`：一般頁面 layout，載入共用 CSS/JS、選單、水號切換、FancyBox 初始化等。
- `Views/Shared/_Layout_Fancybox.cshtml`：FancyBox 子頁面 layout。
- `Views/Shared/_MenuPartial.cshtml`：主選單與登出、水號切換相關 UI。

主要頁面：

- `Views/Dashboard/Index.cshtml`：首頁儀表板，整合 ECharts、FullCalendar、EzMap/EzLayer。
- `Views/Dashboard/_EzLayerPartial.cshtml`、`_EzMapPartial.cshtml`：地圖圖層 UI。
- `Views/Quality/UseWaterQueryNew.cshtml`：用水量查詢。
- `Views/Quality/UseWaterQueryPin.cshtml`：用水指針查詢、下載、資料回寫。
- `Views/Alert/AlertSettings.cshtml`：警示設定頁。
- `Views/UserManage/UserSettings*.cshtml`：使用者資料維護。
- `Views/Home/Login.cshtml`、`ResetPw.cshtml`、`LoginAPPs.cshtml`：登入/重設密碼/APP 登入。

靜態資源重點：

- `wwwroot/js/EzMap.js`、`wwwroot/js/EzLayer.js`
- `wwwroot/js/Easymap/`
- `wwwroot/uploadFiles/EzLayer/kml/`
- `wwwroot/uploadFiles/EzLayer/icon/`
- `wwwroot/uploadFiles/EzLayer/legend/`
- `wwwroot/js/echarts/`
- `wwwroot/js/fullcalendar-5.10.1/`

## 11. 回傳格式慣例

`ContextController` 提供統一回傳模型：

- `Success(data, message)`
- `Success(message)`
- `Failed(data, message, Status)`
- `Failed(message)`
- `ValidationFailed(modelStateErrors, message)`

多數 AJAX action 會回傳 `Json(Success(...))` 或 `Json(Failed(...))`。前端新增 API 時建議沿用此格式，以維持一致錯誤處理。

## 12. 常用開發流程

### 本機執行

```powershell
dotnet restore
dotnet build
dotnet run --launch-profile TWNPPublic
```

建議使用 HTTPS：

```text
https://localhost:7048
```

### 新增 MVC 功能

1. 在 `ViewModels/` 新增輸入/輸出模型。
2. 在對應 `Domain/Service/` interface 與 implementation 新增商業邏輯。
3. 在 Controller 注入 service 並新增 action。
4. 若為頁面，新增 `Views/{Controller}/{Action}.cshtml`。
5. 若需登入保護，Controller 繼承 `BasicController`。
6. AJAX 回傳使用 `Success` / `Failed` / `ValidationFailed`。

### 新增資料查詢

1. 優先放在 Service，不建議在 Controller 直接寫 SQL。
2. 使用 `IDapperDataAccess.Query<T>` 或 `Execute`。
3. SQL 參數請使用匿名物件，不要字串串接使用者輸入。
4. 結果需要傳到前端時建立 ViewModel，不要直接暴露不必要欄位。

### 新增選單頁

1. Controller 或 Action 加上 `[Menu("顯示名稱")]`。
2. 確認 `_MenuPartial.cshtml` 的選單產生邏輯是否會讀取該 Attribute。
3. 頁面繼承 `_Layout.cshtml`。

## 13. 維護注意事項

- 目前多個服務含大量 inline SQL，修改資料表欄位時要同步檢查 Service、ViewModel、Razor 與前端 JS。
- `LayerController` 有直接 SQL 與 proxy 功能，涉及外部 URL 參數時需特別注意 SSRF 與輸入驗證。
- Session 驗證只檢查 `UserName`，尚未看到角色/權限控管；若後續有管理者功能，需補上授權規則。
- `CookieSecurePolicy.Always` 代表 Session cookie 需安全連線，HTTP 測試可能行為不一致。
- `appsettings.json` 中有 WCF URL 與本機設定，部署前要確認環境值是否正確。
- `DapperWcfUrl` / `SQLWcfUrl` 註冊為 Singleton，服務 URL 變更需重啟網站。
- 密碼更新會同步 `B_ACCOUNT` 與外部 `WMMMDB`，改動前需確認兩邊資料一致性。
- 部分前端頁面引用 CDN，例如 `busy-load`、`moment.js`，離線或內網環境可能載入失敗。
- 專案已有 `NLog` package 與設定，但需確認主機部署時 logs 目錄寫入權限。
- `Swashbuckle.AspNetCore` 已安裝但未啟用 Swagger middleware；若要提供 API 文件需在啟動流程補設定。

## 14. 建議後續補強

- 為核心 service 補單元測試或整合測試，至少覆蓋登入、切換水號、警示儲存、用水查詢與密碼更新。
- 將 `DashboardController` 中大型 action 拆分為更小的 service 方法，降低維護成本。
- 將共用前端 AJAX 與圖表初始化抽到獨立 JS 模組，減少 Razor 內 inline script。
- 對 `ProxyData` 加上允許網域清單、URL scheme 驗證與逾時設定。
- 將環境設定改用 `appsettings.{Environment}.json` 或安全的部署變數，避免正式/測試 URL 混在同一檔。
- 建立資料庫物件文件，至少列出 SQL function/procedure 的輸入、輸出與使用頁面。
