# APP 介接登入 API：引導式逆向工程 POC 與分享素材

> 用途：逐步驗證新手是否能在 AI 引導下，從原始碼理解 APP 登入 API，先讀圖，再整理設計與需求。內容同時作為約 10 頁內部技術分享簡報的素材底稿。
>
> 原則：白話優先；每項技術結論都附來源；程式現況、推論、待確認問題分開記錄。靜態分析不等於正式 API、資料庫或安全測試。

## POC 範圍

- 專案：TWNPPublic
- 使用者指定追查起點：`ViewModels/Home/HomeViewModel.cs`
- 功能範圍：APP V4 取得／換發金鑰、登入表單驗證、callback、`LoginAPP` 建立網站 Session 及進入 Dashboard。
- 不在本次 POC 範圍：修改程式、呼叫正式 API、連線正式資料庫、驗證手機 APP 實際行為。
- 主要既有素材：`analysis.md`、`evidence.md`、18 張 SVG 圖表、`source-manifest.json`。

## 新手引導流程驗證紀錄

| 步驟 | AI 引導使用者做什麼 | 本次狀態 | 分享時可說明 |
|---|---|---|---|
| 1. 說明想看懂什麼 | 用一句話描述系統或功能；不知道細節也可以 | 已提供：APP 介接登入 API | 不必先會寫規格或找出所有程式入口 |
| 2. 提供原始碼位置 | 貼上專案路徑，若知道入口也可提供 | 已有專案路徑與 `HomeViewModel.cs` | 使用者知道起點時可加速；不知道時由 AI 搜尋可能入口 |
| 3. AI 先找入口 | 找 DTO、Controller Action、Service 與資料來源 | 已由既有逆向報告完成靜態追蹤 | DTO 是資料形狀；真正 HTTP 入口在 `HomeController` |
| 4. 先看少數核心圖 | 優先選架構、泳道／流程、循序／資料流 | 已有 18 張圖，可測試如何精簡呈現 | 不要求新手先選圖形種類；AI 依問題選圖 |
| 5. 用白話帶讀圖 | 解釋每個角色與箭頭，再讓使用者修正 | 本輪進行中 | 不懂可直接問；AI 將程式名詞翻成使用者語言 |
| 6. 從圖整理需求候選 | 區分「程式目前如此」與「業務希望如此」 | 待逐步確認 | 未確認的規則保持待確認，不寫成已核准需求 |
| 7. 收尾並整理教材 | 記錄引導成效、卡點、證據與待補資訊 | 持續累積 | 簡報以約 10 頁、白話說明為目標 |

## 已有程式證據（待 POC 導讀）

| 編號 | 白話摘要 | 來源 |
|---|---|---|
| E01 | `HomeViewModel` 檔案放著 APP 請求／回應資料模型；它本身不是 HTTP 入口 | `ViewModels/Home/HomeViewModel.cs` |
| E04 | `AccessToken` 開始處理 APP 要求授權或換發金鑰 | `Controllers/HomeController.cs:33–87` |
| E05 | `ExternalLogin` 顯示帳密／驗證碼表單並處理使用者授權 | `Controllers/HomeController.cs:102–146` |
| E06 | `LoginAPP` 驗證 Token，建立網站 Session 並導向 Dashboard | `Controllers/HomeController.cs:159–213` |
| E07–E08 | 程式產生 Token，並將結果組成 callback 回應 | `Controllers/HomeController.cs:215–370` |
| E09–E12 | Service 查詢帳號／Token、驗證密碼、讀取水號及更新 Token 欄位 | `Domain/Service/HomeService.cs:73–150` |
| E15 | 資料存取經由外部 SqlData WCF client 呼叫 | `../../SqlData/DapperDataAccess.cs:71–87` |
| E19 | 登入表單包含 hidden 欄位、驗證碼與 Anti-Forgery Token | `Views/Home/ExternalLogin.cshtml:1–75` |
| E32 | 專案 target 為 .NET 6 | `TWNPPublic.csproj:1–25` |

## 原始 API 規格 PDF 對照（POC 第 1 輪）

提供的 PDF 可抽取出 5 頁文字。檔名標示 V4.2，但封面標題寫「API 說明 V4.1」；本 POC 依使用者指示，先把這份附件當成要對照的原始規格，版本標示差異另列待釐清。

| 主題 | PDF 原始規格 | 目前原始碼觀察 | 狀態 |
|---|---|---|---|
| 取得金鑰 | `POST /Home/AccessToken`，使用者同意並通過帳密驗證後提供 access／refresh token；PDF 標示回傳 JSON | 首次授權先顯示登入表單；成功後呼叫 callback URI，將結果欄位放在 query string 並回 HTTP redirect。沒有 redirect URI 時才回 JSON | **需確認介接契約**：文件的 JSON 與程式的 callback redirect 不一致；需確認 APP 實際怎麼接結果 |
| 帳號與水號 | `account_no` 是登入帳號；`water_no` 是要查用水量的綁定水號 | 帳號查詢確認 B_ACCOUNT 有效；程式不比較 `water_no`，登入時取有效水號清單第一筆 | 使用者確認會員帳號等於唯一水號，因此正常情境預期一致；程式本身沒有強制這項資料規則 |
| 帳號不存在 | PDF 的情境描述提到帳號或用戶水號不存在 | 目前 `GetAppV4Account` 查的是有效 B_ACCOUNT；不查智慧水表資料，也不以傳入水號查找 | **條件範圍不一致**：result 1002 的程式觸發條件比 PDF 描述窄 |
| 登入網站 | PDF 說 `LoginAPP` 驗證 Access Token 後顯示首頁，回傳 HTML | Action 成功後重新導向 `/Dashboard/Index`；瀏覽器跟隨後可看到首頁 HTML | **使用者結果大致相符、HTTP 細節不同**：PDF 未說明中間 302 redirect |
| LoginAPP 的 1004 | PDF 將 1004 描述為 Access Token 驗證錯誤；使用者確認其他登入失敗也可用同碼 | 程式對 Token 無效、帳號不存在或有效水號清單為空，都回 1004 頁面 | **使用者確認共用 1004 可接受**；錯誤訊息尾端驚嘆號不同是程式實作細節 |
| 到期時間 | PDF 說 Access Token 核發六個月後到期，`expires_in` 為到期時間字串 | 程式以核發時間加六個月檢查；回應值格式為 `yyyyMMddHHmmss` | **大致相符** |

### POC 第 1 輪結論

- 新手不需要先看懂所有程式；拿 PDF 的一個 API 區塊，就能和圖表、Controller、Service 逐項比對。
- 最先浮現的不是程式能否跑，而是「規格預期 JSON，程式成功分支在有 callback 時做 redirect」：規格與程式尚未對齊。
- 使用者已確認 V4.2 是本次規格基準；PDF 封面仍印 V4.1，列為文件本身的標示問題。
- 本輪依據 PDF 第 1–5 頁文字、`HomeController.cs:37–87, 133–135, 163–212, 263–302`、`HomeService.cs:73–149` 及 E04–E12。

### 第一個問題已回答：介接預期為 JSON

使用者確認以 **V4.2** 為本次比對基準，且預期 `AccessToken` API 直接回 JSON。PDF 檔名寫 V4.2，但封面仍寫 V4.1；保留文件版本標示問題。

程式證據顯示 `AppAccessTokenV4RequestVm.redirect_uri` 有 `[Required]`。正常成功授權會帶 callback URI；此時 helper 回 HTTP redirect，並把結果欄位放在 callback URL query string。程式的 JSON 分支只在 `redirect_uri` 為空白時執行；空白會使必要欄位驗證失敗，因此這不能證明成功授權會直接回 JSON。

目前結論：**V4.2 規格預期與這份原始碼的成功回應方式不一致**。可能是程式與文件版本不同，或實際部署版本不同；沒有 HTTP 執行紀錄前，不選定原因。

### 回應格式的適用範圍（使用者已確認）

- 使用者確認：取得或換發金鑰的 `AccessToken` 成功時，預期直接回 JSON；曾看到 JSON 欄位 `result=200`。
- 使用者確認：`LoginAPP` 是另一個網站登入流程。成功後進入首頁；登入失敗顯示 `1004`。此流程不要求回 AccessToken 的 JSON。
- 使用者也確認：Refresh Token 逾期後重新輸入帳密若失敗，維持在登入表單顯示錯誤。
- 以上是使用者確認的預期流程。工作區程式在 `AccessToken` 成功且有 `redirect_uri` 時仍執行 callback redirect；由於無法測試上線系統，實際部署回應仍以未知處理。

### Callback 網址由誰提供

- 使用者確認：APP 可以在每次呼叫時自行提供 callback 網址。
- 工作區程式把 `redirect_uri` 當成結果轉址目的地，並在網址後附上結果欄位；目前靜態分析沒有找到網域白名單或允許網址檢查。
- 使用者進一步確認：callback 網址不需要限制，APP 可自行指定。這是已確認的業務預期。
- 使用者表示 callback 的預期用途不清楚。AccessToken 成功預期回 JSON，但工作區程式會用 callback 網址轉址並把 Token 放入 query string；用途與回應契約之間的關係列為未知。
- 安全取捨：程式會把含 access／refresh token 的回應欄位附加在 callback 網址 query string 後再轉址。若呼叫者能指定任何網域，使用者授權後的 Token 可能被送到非預期網站。這是依程式資料流識別出的風險，不代表已在正式環境重現。

### 實際測試回饋（使用者口述）

- 使用者回答：曾用 API 工具實際收到 JSON。
- 使用者補充：JSON 內的 `result` 是 **200（成功）**。
- 證據等級：目前是使用者提供的實測回報；尚未取得原始請求／回應、HTTP 狀態碼、callback 設定或工具是否自動跟隨 redirect 的紀錄。
- API 工具可能會自動跟隨 HTTP redirect；若最後的 callback 頁面輸出 JSON，工具畫面看到 JSON 不一定代表 `AccessToken` 起始回應本身就是 JSON。
- 目前更明確的差異：使用者回報成功 JSON；這份工作區原始碼的成功分支在有 callback URI 時回 redirect。需再確認實測環境及 redirect 行為，不能把差異直接歸因為程式版本。
- 使用者無法確認當時 API 工具連的是正式站或測試站；由於系統已上線，本 POC 不對正式環境做直接呼叫，部署環境與原始 HTTP 記錄維持未知。

### 成功回應欄位的靜態對照（沒有舊回應範例）

使用者表示手邊沒有可提供的舊 `AccessToken` 成功回應範例，因此沒有新增實際回應樣本；以下依 V4.2 PDF 與工作區 DTO／Controller 靜態比對，不能當成已在部署環境驗證的 JSON：

|欄位 | 白話意思 | 規格／程式可確認內容 |
|---|---|---|
| `account_no` | 會員帳號 | 回填請求的帳號；程式型別為字串 |
| `water_no` | 水號 | 回填請求的水號；程式型別為字串 |
| `result` | 流程結果碼 | 程式型別為整數；成功為 `200`，它不是 HTTP 狀態碼 |
| `message` | 結果說明 | 首次核發為「核發金鑰成功」，換發為「換發金鑰成功」 |
| `access_token` | APP 後續登入用的金鑰 | 成功時由程式產生；錯誤回應的欄位會是空字串 |
| `expires_in` | Access Token 到期時間 | 程式輸出 `yyyyMMddHHmmss` 字串，是到期時間，不是「剩餘秒數」 |
| `refresh_token` | 用來換發金鑰的 Token | 成功時由程式產生；錯誤回應的欄位會是空字串 |

**回應形式仍未對齊：**使用者確認的 V4.2 預期是直接收到 JSON，且曾看到 `result=200`；但工作區程式只有在 `redirect_uri` 空白時才回 JSON。`AccessToken` 請求模型又將 `redirect_uri` 設為必填，所以依目前程式路徑，成功核發後會導向 callback，並把以上欄位加在 URL query string。尚無原始 HTTP 記錄可判斷使用者當時看到的是 API 起始回應，或工具跟隨 redirect 後的結果；也無法確認部署程式是否與目前工作區相同。

來源：`AppTokenV4ResponseVm`（`ViewModels/Home/HomeViewModel.cs`）、`CreateAppTokenResponse`／`RedirectWithAppTokenResponse`（`Controllers/HomeController.cs`）、`analysis.md`「AccessToken／ExternalLogin 的回應欄位」及 V4.2 PDF。

給新手看的欄位形狀示意（不是實際擷取的回應；Token 與值均為說明用佔位文字）：

```json
{
  "account_no": "<會員帳號>",
  "water_no": "<水號>",
  "result": 200,
  "message": "核發金鑰成功",
  "access_token": "<Access Token>",
  "expires_in": "<到期時間 yyyyMMddHHmmss>",
  "refresh_token": "<Refresh Token>"
}
```

### 使用者補充的業務資訊：會員帳號與水號

- 使用者補充：此介接傳入的會員帳號會等於水號（`account_no = water_no`）。這是使用者提供的業務資訊，不等於程式本身已檢查兩欄相等。
- PDF 將 `water_no` 描述為要查詢用水量的用戶水號。程式目前會忽略傳入的水號，改用該帳號排序後第一筆有效水號；雖然程式留有「檢查指定水號是否屬於帳號」的註解程式碼，但目前沒有執行。
- 使用者回答：一個會員帳號不會有多個水號。
- 在「單一有效水號」的業務前提下，程式選排序後第一筆預期會是該水號；但這個前提沒有在程式內被明確檢查，且本 POC 不查正式資料庫，因此列為「使用者提供、程式未強制、資料未驗證」。

### 水號推導結果（POC）

原先的疑問是「傳入水號會不會和登入後選用的水號不同」。依使用者補充的業務規則，正常情境下會員帳號等於唯一水號，所以目前選第一筆預期與使用者看到的結果一致。逆向分析仍應保留程式沒有使用／比對傳入 `water_no` 的事實，因為未來若資料不符合單一水號假設，程式本身沒有防線。

### 使用者補充的 Refresh Token 規則

- 使用者確認：Refresh Token 本身也有到期時間。
- PDF 目前明確說明 Access Token 六個月到期、可使用 Refresh Token 換發；沒有寫 Refresh Token 自身的期限長度。
- 原始碼產生 Refresh Token 時，內容包含與 Access Token 相同的核發時間，但 Refresh 流程只查詢資料庫目前保存的 Token 字串，沒有解密時間或檢查 Refresh Token 是否逾期。
- 使用者補充：Refresh Token 的期限是六個月。
- 使用者確認預期行為：Refresh Token 超過六個月後，不可直接換發；使用者須重新輸入帳密完成驗證，成功後再核發一組新的金鑰。
- 原始碼的 6 個月常數用於 Access Token 驗證與回報；Refresh 流程本身沒有做相同的期限驗證。如果資料庫仍保留該 Refresh Token 且帳號有效，程式查詢命中後就會換發新 Token。
- 因此記錄為明確差異：「使用者確認的預期：Refresh Token 六個月到期，逾期後須重新驗證帳密才可核發新金鑰」；「工作區程式：未見 Refresh Token 期限檢查」。這是靜態程式推導，不對上線系統測試。

### 下一個新手問題：使用者取消授權

PDF 說首次授權取消會回 1003，Refresh 重新登入時取消會回 1005。原始碼的 `CancelExternalLogin` 會回傳相應結果，但沒有清除資料庫裡原有 Token 的程式碼。這能說明「本次流程取消」，卻不能證明「舊 Token 被撤銷」。

使用者回答：不知道。狀態記為 **待業務確認**；AI 保留未知，不推測取消是否撤銷舊 Token，並繼續分析其他已知流程。

待確認：使用者按取消時，是否只要結束這次授權流程，還是也要讓之前已核發的 Token 失效？

### POC 執行界線

- 由於系統已上線，依使用者指示不對正式 API／資料庫直接測試。
- 本輪以 API 規格 PDF、工作區原始碼、既有逆向圖表及使用者提供的業務資訊進行文件層級反推。
- 所有產物須區分「規格記載」、「程式觀察」、「使用者提供」及「尚未知」四類證據。

### 使用者確認的 LoginAPP 錯誤碼

- 使用者確認：Token 錯誤、帳號查無資料、沒有有效水號等登入失敗，都顯示同一個 1004 即可。
- 因此 PDF 僅舉 Token 錯誤、程式涵蓋更多失敗原因，現在不再視為碼別需求衝突。
- 程式的不同失敗分支仍回傳不同文字標點（驚嘆號數量不同）；使用者只確認共用 1004，不據此推導訊息文案要求。

### 重新輸入帳密失敗時的畫面

- 使用者確認：Refresh Token 逾期後重新輸入帳密，若驗證失敗，維持在登入表單顯示錯誤，不另外回傳 JSON 錯誤碼。
- 這與 `LoginAPP` 的 `1004` 是不同步驟：帳密驗證發生在 `ExternalLogin` 表單；`1004` 用於 APP 呼叫 `LoginAPP` 後的登入驗證失敗。
- 工作區程式在 `ExternalLogin` 驗證失敗時重新顯示表單，和使用者確認的預期一致。錯誤文字內容未另外確認。

## 流程白話版（圖表導讀候選）

1. APP 要求取得或換發金鑰；成功時預期直接收到 JSON（`result=200`）。
2. 首次授權時，網站顯示帳密及驗證碼表單。
3. 驗證成功後，網站更新帳號上的 Token 資料。工作區程式會導向 callback；使用者確認的 V4.2 預期則是直接回 JSON，兩者差異待部署證據核實。
4. APP 再把帳號與 access token 送到 `LoginAPP`。
5. `LoginAPP` 驗證通過後建立網站 Session，再導向 Dashboard；失敗則顯示 1004。

注意：授權拿到 Token 與建立網站登入 Session 是兩個不同步驟。此敘述是程式現況；APP 實際收到 callback 後的處理尚未取得證據。

## 已確認事項與待確認事項

- 已確認：本介接會員帳號等於水號，且一個會員帳號只有一個水號（使用者提供；未以資料庫驗證）。
- 已確認：APP 每次呼叫可自行提供 callback 網址，且不需限制；程式會把 Token 放進該網址的 query string，存在 Token 被送到非預期網站的風險。
- 未知：callback 的預期用途。使用者確認 AccessToken 成功預期回 JSON，但未確認 callback 是否也應接收 Token。
- 已確認：AccessToken 取得／換發成功預期直接回 JSON；`LoginAPP` 是另一個網站登入流程，成功進入首頁，失敗顯示 1004。
- 已確認：LoginAPP 各類登入失敗共用 1004 可以接受。
- 已確認：Refresh Token 六個月到期；逾期後須重新驗證帳密，成功後再核發新金鑰。工作區程式未見 Refresh Token 到期檢查。
- 已確認：逾期後重新輸入帳密若失敗，留在登入表單顯示錯誤；不另外回 JSON。具體錯誤文案未確認。
- 待確認：使用者取消授權是否撤銷既有 Token（使用者回答不知道）。
- 待核實：API 工具曾看到 `result=200` JSON，但無原始 HTTP 記錄，不能確認起始回應或工具跟隨 redirect 的結果。

## 風險觀察與安全界線

以下是靜態分析線索，不宣稱已重現漏洞：

- 使用者確認 callback 網址不需限制，APP 可自行指定；工作區程式未找到白名單檢查，且會把 Token 放入 query string。需將 Token 可能送至非預期網站列為安全設計風險；尚未做執行環境驗證。
- 會員單水號規則由使用者確認，但程式不驗證；正式資料是否符合仍未知。
- 取消授權流程與 V4 Token 驗證是否一致需確認。
- 不同 Action 的 CSRF 防護方式不同，需依 APP、WebView 與瀏覽器呼叫方式評估。
- 沒有 SQL DDL、WCF 伺服器及正式 APP callback 接收端證據。

## 10 頁簡報草案

1. 為什麼要做逆向：只有原始碼，想看懂 APP 登入流程。
2. 新手怎麼開始：一句話說明目標、提供專案位置；不知道入口也能開始。
3. AI 怎麼找入口：從資料模型找到真正的 Controller API。
4. 第一張圖：架構圖，辨識 APP、網站、服務、WCF 與資料庫。
5. APP 授權流程：泳道／流程圖說明帳密、驗證碼與 callback。
6. 一般使用者網站登入：登入表單、資料庫驗證、Session 與 Dashboard。
7. 兩種登入方式比較：APP 先取得 Token 再建立 Session；一般使用者登入直接建立 Session。
8. 圖怎麼反推設計：從箭頭、資料欄位和分支整理設計／需求候選。
9. 安全與未知怎麼帶出：以 callback、登入驗證、資料庫黑箱、CSRF 作為有來源或待確認的例子。
10. POC 結果與可複用流程：新手回饋、證據追溯、未驗證項目與下一步。

## POC 完成前需補記

- 新手是否能不看程式碼理解流程圖。
- 哪些術語需要換成更白話的說法。
- AI 是否一次只問一個容易回答的問題。
- 使用者能否用「不知道」繼續，不被流程卡住。
- 圖表是否能幫使用者指出原本不知道的需求問題。
- 本輪對話最後確認的業務規則與未決事項。

## POC 目前狀態

- **已完成一輪靜態逆向：**從 `HomeViewModel` 找到實際 Controller 與 Service，整理首次授權、Refresh、`LoginAPP`、Token 與 Session 流程，並開始對照 V4.2 PDF。
- **已逐步確認的業務預期：**AccessToken 成功預期回 JSON；Refresh Token 六個月到期，逾期後重新驗證帳密；帳號等於唯一水號；LoginAPP 失敗共用 1004；APP 可自行提供不受限制的 callback 網址。
- **已辨識的主要差異／風險：**工作區程式在 AccessToken 成功且有 callback 時會轉址；Refresh 流程未檢查六個月期限；callback 會收到 query string 中的 Token。成功回應七個欄位及型別／用途已依 PDF 和 DTO 靜態整理，沒有舊實際 JSON 樣本。
- **尚未結束：**callback 的設計用途未知；取消授權是否撤銷既有 Token 未知；正式部署和歷史 API 工具回應無法核實。尚未完成 POC 結果收斂、引導體驗回饋及約 10 頁分享簡報。
- **接續工作：**依追溯表整理一份白話的「使用者預期、PDF 規格、工作區程式、未知項目」結論，再把 POC 過程和證據編排成分享簡報。除非取得安全測試環境或既有記錄，不對正式服務做測試。

## 第二案例：一般使用者網站登入（非 APP API）

本案例沿用同一專案和新手逆向方法，但從一般使用者登入頁開始。既有循序圖為 [`一般使用者登入循序圖`](../diagrams/login-sequence.html)，來源對照為 [`登入圖來源證據表`](../diagrams/login-sequence-evidence.md)。這些圖檔及證據表已存在，本次以目前原始碼重新核對其關鍵節點；沒有對系統送出登入請求。

### 白話流程

1. 使用者開啟 `/Home/Login`，看到帳號（畫面標示「帳號(水號)」）、密碼、驗證碼欄位。
2. 瀏覽器送出 POST 表單及 Anti-Forgery Token。Controller 先檢查欄位，再檢查 Session 內的驗證碼是否存在、未過期、屬於同一個 Session 且答案正確；失敗就回登入頁。
3. `HomeService` 以使用者名稱查 `B_ACCOUNT` 中有效帳號，並用共用的密碼工具驗證 `APWD`。程式先支援 PBKDF2 密碼雜湊，也保留舊 AES 格式相容檢查。
4. 密碼驗證成功後，Service 再透過 Dapper WCF 呼叫 `dbo.spB_LOGIN`。該程序實際如何確認帳號狀態、挑選水號及決定錯誤原因，原始碼專案中沒有 SQL 定義可查。
5. `LOGIN_STATUS == "OK"` 時，Controller 將帳號、第一筆回傳水號、全部水號清單、使用者序號及日期範圍寫進 Session，接著轉址到 `/Dashboard/Index`。失敗則把服務回傳的訊息放回登入頁。

### 來源索引

| 白話發現 | 程式來源 | 證據狀態 |
|---|---|---|
| GET 顯示登入頁；localhost 分支會預填測試欄位 | `Controllers/HomeController.cs:1048–1064`; `Views/Home/Login.cshtml:1–64` | 程式可見；部署時 Host 是否會進入此分支未驗證 |
| 登入帳號欄標示為「帳號(水號)」；表單有 CSRF token 和驗證碼圖片 | `Views/Home/Login.cshtml:21–58` | 程式／畫面可見 |
| POST 有 Anti-Forgery 驗證；模型先驗帳號與密碼必填 | `Controllers/HomeController.cs:1071–1088`; `ViewModels/Home/HomeViewModel.cs:9–19` | 程式可見；CAPTCHA 手動檢查，不依賴 `[Required]` |
| CAPTCHA 讀取後立即從 Session 移除，檢查 5 分鐘期限、Session ID 和輸入答案 | `Controllers/HomeController.cs:1193–1223, 1334–1380` | 程式可見；正式環境行為未測 |
| 查 `B_ACCOUNT` 的 `VALID=1`，驗證 `APWD`，再呼叫 `spB_LOGIN` | `Domain/Service/HomeService.cs:294–315`; `Common/Security/PasswordHashUtil.cs:28–79` | C# 可見；Stored Procedure 內容未知 |
| 成功後取回傳清單第一筆作目前水號，寫 Session 並轉到 Dashboard | `Controllers/HomeController.cs:1151–1177, 1312–1326` | 程式可見；假設成功清單至少有一筆水號 |
| 受保護 Controller 以 Session 的 `UserName` 是否存在作為登入門檻 | `Common/Attributes/SessionAuthorization.cs:6–19`; `Controllers/BasicController.cs:5–9` | 程式可見；此篩選器沒有角色規則 |
| 登入成功後另以背景工作寫登入紀錄 | `Domain/Service/HomeService.cs:348–354, 386–407` | 程式可見；不等待寫入結果 |

### 和 APP 介接登入的差別

| 比較項目 | APP 介接 | 一般使用者網站 |
|---|---|---|
| 使用入口 | `AccessToken`、`ExternalLogin`、`LoginAPP` | 瀏覽器表單 `POST /Home/Login` |
| 成功的中間憑證 | 核發 Access／Refresh Token，再由 `LoginAPP` 驗證 | 不經 APP Token；帳密驗證和 `spB_LOGIN` 成功後直接寫網站 Session |
| 成功後結果 | `LoginAPP` 建立 Session 並進 Dashboard | 表單登入成功後建立 Session 並轉到 Dashboard |
| 回傳形式 | APP 金鑰契約與 callback／JSON 尚有待核對處 | HTML 表單與 HTTP redirect；不是 AccessToken JSON |
| 共通點 | 帳號資料與密碼驗證使用 `B_ACCOUNT`／`APWD` 相關邏輯 | 使用同一類帳號與密碼資料；後續驗證路徑不同 |

### 邊界、風險與待確認

- `dbo.spB_LOGIN` 定義與資料庫資料未提供；不能僅根據 C# Model 宣稱資料庫規則。
- 成功分支呼叫 `F_B_LOGIN_WaterNos.First()`；若資料庫回 `LOGIN_STATUS == "OK"` 但水號清單為空，靜態上有例外風險，實際資料是否可能如此未知。
- 使用者已確認：一般網站登入的帳號也固定等於會員唯一水號。這是業務確認；目前程式仍是信任 `spB_LOGIN` 回傳清單並取第一筆，未在 C# 明確檢查數量或相等關係；正式資料尚未查證。
- `Startup.cs:25–33` 將 Session 閒置期限設為 3600 秒。使用者確認一般網站閒置一小時後重新登入符合預期。Session 過期後，受保護頁面在下一次請求時會因 `UserName` 不存在而導回登入；若有背景請求延長 Session 或部署有其他設定，實際使用者體驗仍需核實。
- `SessionAuthorization` 逾時時只導回登入頁；程式未傳遞「閒置逾時」原因或顯示專用訊息。使用者已確認預期提示文字為「登入已逾時，請重新登入」；這是需求預期，工作區程式目前未實作此訊息。
- `SessionAuthorization` 也未把原本要求的網址帶到登入頁；登入成功時固定導向 Dashboard。使用者已確認成功後固定前往 Dashboard 符合預期，因此不把返回原頁列為需求缺口。
- 一般帳號查無資料、密碼不符或 `spB_LOGIN` 沒有回傳資料時，`HomeService` 回傳相同的通用訊息。使用者確認其他帳號／密碼驗證失敗（包括 `spB_LOGIN` 回傳非 `OK`）也要統一顯示「登入失敗，請確定您的帳號密碼」。但目前 C# 對非 `OK` 分支直接把 `LOGIN_STATUS` 當成訊息，因此與預期有差異；Stored Procedure 定義缺失，實際狀態文字未知。
- 使用者確認：欄位未填、驗證碼錯誤／過期仍保留各自明確的提示；統一文案只用於帳號與密碼驗證相關失敗。這與目前程式的 ModelState、CAPTCHA 個別提示方式一致。
- `localhost` 分支會預填測試帳號與密碼欄位。這是程式碼可見的開發便利設定；尚未檢查部署 Host 設定及其是否可能在非本機情境觸發。
- 這次只做靜態逆向，沒有真實登入、連正式資料庫或驗證部署行為。

### 新手引導演練紀錄

- 使用者只指定「一般使用者登入」這項功能，沒有提供額外 Controller 或 Service 入口；AI 從專案結構找到 `Home/Login`，再由表單追到 Controller、Service、資料庫登入程序、Session 與 Dashboard。
- 展示的圖表沿用既有網站登入循序圖，並回查圖面證據表；步驟來源已與目前程式行號核對。
- 使用者確認一般網站帳號也固定等於會員唯一水號；這項使用者提供資訊已與 APP 情境分開記錄，未冒充資料庫驗證結果。
- 使用者確認 Session 閒置一小時後重新登入符合一般網站預期，並希望逾時時顯示「登入已逾時，請重新登入」。
- 使用者確認成功登入後固定前往 Dashboard；程式現況相符。
- 使用者確認一般登入的帳號／密碼驗證失敗統一顯示「登入失敗，請確定您的帳號密碼」，成功固定前往 Dashboard；欄位與驗證碼錯誤維持各自提示。程式的登入目的地及表單提示現況符合預期，但逾時提示尚未實作，且 `spB_LOGIN` 非 `OK` 時仍顯示 `LOGIN_STATUS`，與預期不符。
- 新手引導回饋：使用者能用「是」確認規則，並透過簡短選擇補足錯誤訊息範圍；AI 應把新答案落到明確的流程分支，避免把「所有錯誤」誤套到欄位與驗證碼提示。
- 演練僅為靜態檢視；未提交帳密、未呼叫登入頁，也未連線資料庫。
