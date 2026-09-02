# AGENTS.md

## 1. 文件目的

本文件定義 AI Coding Agent 在本專案中的開發規範。

目前主要使用 **OpenAI Codex** 協助開發，但本規範應盡量保持通用，使其他 AI Coding Agent 也能遵循。

AI 的目標不只是「讓程式可以執行」，而是產生：

* 容易閱讀
* 容易維護
* 容易除錯
* 容易測試
* 容易交接
* 符合既有架構

的程式碼。

> 可以執行不是唯一完成標準，可長期維護才是完成標準。

---

# 2. 技術環境

本專案主要技術可能包含：

* C#
* .NET 8 / .NET 10
* ASP.NET Core MVC
* ASP.NET Core Web API
* Entity Framework Core
* SQL Server
* Razor View
* JavaScript
* jQuery
* AJAX
* Bootstrap
* Visual Studio

AI 必須優先沿用專案目前已經使用的技術與寫法。

不得因個人偏好自行更換技術棧。

---

# 3. AI 核心開發原則

所有 AI Coding Agent 必須遵守以下原則。

## 3.1 可讀性優先

優先順序：

1. 正確性
2. 可讀性
3. 可維護性
4. 可除錯性
5. 效能
6. 程式碼簡短

不要為了少寫幾行程式而犧牲可讀性。

如果有兩種寫法：

* A：20 行，但複雜且不容易 Debug
* B：35 行，但流程清楚且容易下 Breakpoint

優先選擇 B。

---

## 3.2 最小修改原則

修改既有功能時：

* 只修改需求需要的地方。
* 不修改與需求無關的程式。
* 不因個人偏好順便重構。
* 不大量重新格式化既有檔案。
* 不任意 Rename Class / Method / Variable。
* 不任意移動既有檔案。
* 不任意改變既有架構。

Bug Fix 應優先尋找最小修改方案。

如果修改 10 行可以解決問題，不要修改 300 行。

---

## 3.3 先理解，再修改

禁止看到需求後立即大量產生程式碼。

修改既有功能前，應先：

1. 找到相關 Controller。
2. 找到相關 Service。
3. 找到相關 Data Access / Repository / DbContext。
4. 找到相關 View / JavaScript。
5. 理解資料流。
6. 找到真正需要修改的位置。
7. 再開始修改。

不得在不了解既有流程的情況下重新實作整套功能。

---

# 4. Codex 工作流程

收到開發需求後，原則上依照以下流程進行。

## Step 1：閱讀規範

先閱讀本 `AGENTS.md`。

---

## Step 2：分析需求

確認：

* 使用者想解決什麼問題？
* 哪些功能會受到影響？
* 是否已有類似功能可以參考？

---

## Step 3：閱讀既有程式

搜尋相關：

* Controller
* Service
* Repository
* DbContext
* DTO
* ViewModel
* Razor View
* JavaScript
* AJAX
* SQL
* Stored Procedure

優先參考專案現有寫法。

---

## Step 4：提出修改方案

中大型修改前，應先整理：

* 現有流程
* 問題位置
* 預計修改檔案
* 修改方式
* 可能影響
* 測試方式

小型且明確的修改可直接處理，但仍須遵守最小修改原則。

---

## Step 5：實作

實作時：

* 沿用既有 Architecture。
* 沿用既有 Coding Style。
* 不自行增加不必要的抽象層。
* 不自行加入新的第三方套件。

---

## Step 6：Build

修改完成後，在環境允許的情況下執行：

```bash
dotnet build
```

不得只因「看起來沒問題」就宣稱可以編譯。

---

## Step 7：Test

如果專案已有 Test Project，在環境允許的情況下執行：

```bash
dotnet test
```

優先執行與修改內容相關的測試。

---

## Step 8：Self Review

完成後重新檢查：

* 是否修改不相關程式？
* 是否有 Null 問題？
* 是否有 Exception 問題？
* 是否有 Async 問題？
* 是否有 DB 效能問題？
* 是否容易 Debug？
* 是否存在更簡單且更容易維護的方式？

---

# 5. Architecture 規範

必須優先遵循專案既有 Architecture。

如果專案目前使用：

```text
Controller
    ↓
Service
    ↓
Repository / EF Core
    ↓
SQL Server
```

則繼續使用此架構。

不得因為 AI 認為其他架構「比較先進」就自行改成：

* Clean Architecture
* CQRS
* MediatR
* Event Sourcing
* Generic Repository
* Unit Of Work
* Microservices

除非需求明確要求。

---

# 6. Controller 規範

Controller 主要負責：

* 接收 HTTP Request
* Model Validation
* 呼叫 Service
* 回傳 View / JSON / HTTP Response

Controller 不應包含：

* 大量商業邏輯
* 大量資料處理
* 大型 SQL
* 複雜 EF Core Query
* 大量重複邏輯

Controller Action 應保持容易閱讀。

---

# 7. Service 規範

商業邏輯原則上放在 Service。

Service Method：

* 一個 Method 應有明確責任。
* Method 名稱必須清楚描述用途。
* 避免超長 Method。
* 複雜流程可拆成有意義的 private method。

Method 建議盡量控制在約 20～50 行。

這不是硬性限制。

如果拆分反而造成：

* 過度抽象
* 流程難追
* Method 數量過多

則不需要為了行數強制拆分。

---

# 8. C# Coding Rules

## 命名

使用清楚且有意義的名稱。

推薦：

```csharp
employeeList
departmentId
currentUserId
existingRecord
```

避免：

```csharp
a
b
tmp
data1
obj1
x
```

---

## Async / Await

非同步 Method 使用 `Async` suffix。

例如：

```csharp
GetEmployeeAsync()
UpdateEmployeeAsync()
DeleteEmployeeAsync()
```

禁止：

```csharp
.Result
.Wait()
```

除非有非常明確且合理的原因。

Async 流程應盡量維持 async all the way。

---

## Null Handling

必須考慮 Null。

不要假設：

* DB 一定查得到資料。
* Request 一定有值。
* Session 一定存在。
* API 一定回傳完整資料。

Null Handling 必須清楚。

不要為了消除 Compiler Warning 大量使用：

```csharp
!
```

---

# 9. LINQ 規範

LINQ 優先考慮可讀性，而不是程式碼最短。

簡單 LINQ 可以直接使用。

例如：

```csharp
var activeEmployees = employees
    .Where(x => x.IsActive)
    .ToList();
```

如果 LINQ 包含大量：

* Join
* GroupBy
* SelectMany
* Aggregate
* 多層 Select
* 巢狀 Lambda
* 複雜匿名型別

應評估拆成數個步驟。

目標是讓工程師可以：

* 查看中間結果
* 下 Breakpoint
* 使用 Watch
* 快速找到錯誤資料

---

# 10. Entity Framework Core 規範

查詢資料時注意：

* N+1 Query
* 不必要的 Include
* 不必要的 ToList
* 大量資料一次載入記憶體
* Client-side processing
* Tracking 成本

純查詢且不需要修改 Entity 時，優先評估：

```csharp
AsNoTracking()
```

但必須依照實際情境決定。

禁止在迴圈內重複查詢 DB，例如：

```csharp
foreach (var employee in employees)
{
    var department = await db.Departments
        .FirstOrDefaultAsync(...);
}
```

應評估是否可以一次取得需要的資料。

---

# 11. SQL Server 規範

SQL 必須：

* 容易閱讀
* 容易維護
* 注意效能
* 使用 Parameter
* 避免 SQL Injection

禁止直接把使用者輸入拼進 SQL。

避免：

```sql
SELECT *
```

除非確實需要所有欄位。

複雜 SQL 應注意：

* WHERE 條件
* JOIN 條件
* Index
* Execution Plan
* 大量 Scan
* 重複 Query
* Sorting
* Grouping
* Function 對 Index 的影響

AI 無法確認實際 Execution Plan 時，不得直接宣稱 SQL 效能一定良好。

---

# 12. Transaction 規範

多筆相關 DB 修改必須評估 Transaction。

尤其：

* 新增 Master + Detail
* 同時更新多張 Table
* 更新資料後寫 History
* 扣除 / 增加數量
* 重要狀態轉換

Transaction 範圍不要無限制擴大。

---

# 13. Exception Handling

禁止：

```csharp
try
{
}
catch
{
}
```

也禁止單純吞掉 Exception。

錯誤處理應考慮：

* 是否需要 Log
* 是否需要 rollback
* 是否需要回傳適當訊息
* 是否應交由 Global Exception Handler 處理

不要在每一個 Method 都無意義地包 `try/catch`。

---

# 14. Logging 規範

重要流程應使用 Structured Logging。

例如：

```csharp
_logger.LogInformation(
    "Updating employee. EmployeeId: {EmployeeId}",
    employeeId);
```

錯誤：

```csharp
_logger.LogError(
    ex,
    "Failed to update employee. EmployeeId: {EmployeeId}",
    employeeId);
```

適合記錄：

* UserId
* EmployeeId
* RecordId
* RequestId
* TraceId
* Operation

禁止記錄敏感資訊，例如：

* Password
* Access Token
* Refresh Token
* API Key
* Connection String Password
* 完整身分證字號
* 信用卡資料

---

# 15. Security 規範

開發時必須主動考慮：

* Authentication
* Authorization
* CSRF
* XSS
* SQL Injection
* Input Validation
* File Upload
* Sensitive Data Exposure
* Open Redirect
* IDOR / 權限繞過

ASP.NET Core MVC POST / PUT / DELETE 等修改資料的操作，必須依專案既有機制確認 Anti-Forgery / CSRF 防護。

不得因為 AJAX 呼叫就忽略 CSRF。

---

# 16. JavaScript / jQuery / AJAX 規範

如果既有專案使用 jQuery，不得只因為偏好而改成其他前端框架。

JavaScript 應：

* 保持流程簡單
* 避免大量 Global Variable
* 避免重複 Event Binding
* AJAX 必須處理 Error
* 避免重複送出表單
* 注意 CSRF Token
* 注意 XSS

不要因為功能簡單就引入 React / Vue / Angular 等框架。

---

# 17. 第三方套件規範

AI 不得自行安裝新的：

* NuGet Package
* npm Package
* JavaScript Library

如果認為需要新增 Package，必須先說明：

1. Package 名稱
2. 用途
3. 為什麼既有功能無法完成
4. 不使用 Package 的替代方案
5. 維護風險
6. 相容性風險
7. License 風險

取得同意後再加入。

---

# 18. 禁止過度設計

不要為了 Design Pattern 而使用 Design Pattern。

簡單需求不應自行建立：

```text
Interface
↓
Abstract Base
↓
Factory
↓
Provider
↓
Manager
↓
Service
↓
Repository
```

如果：

```text
Controller
↓
Service
↓
DbContext
```

已經足夠，就保持簡單。

---

# 19. 禁止大規模自行重構

除非需求明確要求，禁止：

* 大量 Rename
* 大量移動檔案
* 更換 Architecture
* 重寫整個 Module
* 更換 ORM
* 更換 JavaScript Framework
* 大量格式化與需求無關的程式
* 把既有可運作程式全部改成 AI 偏好的寫法

---

# 20. 大量修改警戒

如果預計：

* 修改超過 5 個檔案
* 修改超過約 300 行
* 新增新的 Layer
* 新增新的 Architecture
* 新增第三方 Package
* 修改 Database Schema
* 修改大量 Public API

應先說明：

* 為什麼需要
* 修改範圍
* 是否有更小的方案
* 可能風險

再進行大型修改。

此規則不是禁止合理的大型功能，而是避免 AI 在不必要的情況下擴大修改範圍。

---

# 21. Debug Friendly 規範

所有程式碼都必須考慮 Visual Studio Debug 體驗。

程式應容易：

* 下 Breakpoint
* Step Into
* Step Over
* Watch Variable
* 查看中間結果
* 找到 Exception 發生位置

避免：

* 超長 LINQ
* 多層 Lambda
* 過度 Generic
* Reflection
* Dynamic
* 過度抽象
* 一行塞入大量邏輯

---

# 22. 註解規範

註解應說明「為什麼」，而不是重複程式碼本身。

不好的註解：

```csharp
// 設定 employeeId
employeeId = employee.Id;
```

有價值的註解：

```csharp
// 舊系統可能存在沒有 DepartmentId 的歷史資料，因此這裡必須保留 Null 處理。
```

不要大量產生沒有資訊價值的 AI 註解。

---

# 23. 測試規範

修改功能後至少思考：

* 正常流程
* Null
* 空資料
* 無權限
* 錯誤輸入
* 重複送出
* DB 查不到資料
* DB 更新失敗
* 邊界值
* Exception

如果已有 Unit Test / Integration Test 架構，優先沿用。

不得為了一個小修改自行建立全新的大型 Testing Architecture。

---

# 24. 修改既有功能時的優先順序

遇到 Bug 時依序：

```text
重現問題
↓
找到入口
↓
追蹤資料流
↓
找到 Root Cause
↓
評估影響範圍
↓
最小修改
↓
Build
↓
Test
↓
Review
```

不要使用：

```text
看到 Bug
↓
猜原因
↓
重寫整個功能
```

---

# 25. 不確定時禁止猜測

如果 AI 無法確定：

* Business Rule
* Database Schema
* 權限規則
* API 行為
* 欄位用途
* 歷史程式設計原因

應先：

1. 搜尋既有程式。
2. 搜尋相同 Pattern。
3. 查看 Model / DB 使用方式。
4. 明確指出仍不確定的部分。

不得把猜測當成事實直接修改。

---

# 26. 完成後回報格式

完成開發後，請使用容易閱讀的方式回報。

## 修改內容

說明：

* 修改哪些檔案
* 修改哪些功能

## 修改原因

說明為什麼需要這些修改。

## 測試結果

例如：

```text
dotnet build：成功
dotnet test：成功，32 passed
```

如果無法執行，必須明確說明：

```text
未執行：目前環境無法連線測試資料庫。
```

不得假裝已經測試。

## 影響範圍

說明可能受到影響的功能。

## Debug 建議

指出發生問題時建議檢查：

* 哪個 Controller Action
* 哪個 Service Method
* 哪個 Query
* 哪個 JavaScript Event
* 哪些變數

## 尚未確認事項

如果有無法確認的事情，必須明確列出。

---

# 27. AI Self Review Checklist

完成前確認：

* [ ] 是否遵守最小修改原則？
* [ ] 是否修改了不相關的程式？
* [ ] 是否沿用既有 Architecture？
* [ ] 是否容易閱讀？
* [ ] 是否容易 Debug？
* [ ] 是否有過長 Method？
* [ ] 是否有過度複雜 LINQ？
* [ ] 是否正確處理 Null？
* [ ] 是否正確處理 Exception？
* [ ] Async / Await 是否正確？
* [ ] 是否可能有 N+1 Query？
* [ ] SQL 是否有 Injection 風險？
* [ ] 是否有 CSRF / XSS 等安全問題？
* [ ] Logging 是否合理？
* [ ] 是否記錄敏感資訊？
* [ ] Transaction 是否合理？
* [ ] 是否新增不必要的 Package？
* [ ] 是否可以用更簡單的方式完成？
* [ ] 是否完成 Build？
* [ ] 是否完成相關 Test？
* [ ] 是否清楚說明無法驗證的部分？

---

# 28. 最終原則

本專案不追求 AI 產生最多程式碼。

我們希望 AI：

```text
理解既有系統
    ↓
找到真正問題
    ↓
提出簡單方案
    ↓
進行最小修改
    ↓
驗證修改結果
    ↓
留下容易維護的程式
```

任何 AI 產生的程式碼，都應該達到以下標準：

> 三個月後由另一位工程師開啟 Visual Studio，
> 能快速理解程式流程、設定 Breakpoint、找到問題並安全修改。

如果某個方案雖然「比較先進」，但會讓後續維護與 Debug 更困難，優先選擇較簡單、清楚、成熟的方案。
