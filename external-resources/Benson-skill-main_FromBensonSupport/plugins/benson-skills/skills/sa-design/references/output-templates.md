# 輸出格式：資料字典 + API spec + 型別對照

> SA 系統分析設計裡 ②資料字典、④API spec 的標準格式，與 MS SQL 型別對照。Claude 產出時照這個填。

---

## ★ 表命名慣例（建表前先定，一眼看出歸屬）

> 看到表名就要能分辨「這是哪個功能的表，還是全域共用」。建模時一律照這套，別用看不出歸屬的裸表名。

| 類型 | 命名 | 範例 |
|---|---|---|
| **功能專屬表** | 用該功能的**前綴**延續命名（同功能前綴一致） | 巡檢 `INSP_FORM`／`INSP_DETAIL`／`INSP_TASK`；滿意度 `SATIS_*`；通知 `NOTIFY_*` |
| **跨功能共用表** | 統一前綴 **`COM_`**（common） | `COM_PARK`、`COM_FACILITY`、`COM_ACCOUNT` |
| 字典／代碼表 | 隨所屬功能前綴；純共用歸 `COM_` | `INSP_FIX_LEVEL`、`COM_DIMENSION` |

規則：
- **一眼分辨**：前綴是功能名 → 功能專屬；前綴是 `COM_` → 全域共用。**別用裸表名**（如 `PARK`），看不出歸屬。
- **同功能的表前綴一致**，且在模型 `modules[]` 歸同一模組 → `transform.py` 依模組排序，資料字典／ER **同功能排在一起、不跳來跳去**。
- 前綴用語意化縮寫（巡檢 INSP、滿意度 SATIS、通知 NOTIFY、共用 COM）；可依案調整，但**同一套文件內一致**。

---

## ② 資料字典格式

每張表一個區塊，標題＝表名（中英），**標題下先放一段「用途」描述**，再接欄位表：

### MEMBER（會員）

> **用途**：系統的會員主檔，存個資與登入狀態；被 ORDER（下訂）、LOGIN_LOG（登入紀錄）等表以 FK 參照。若由多張舊表合併而來，在此註明合併了哪幾張。

| 欄位名 | 中文說明 | 型別 | 長度/精度 | PK/FK | 必填 | 預設 | 驗證規則 | 備註 |
|---|---|---|---|---|---|---|---|---|
| id | 流水號 | INT IDENTITY | — | PK | Y | 自增 | — | 主鍵 |
| name | 姓名 | NVARCHAR | 50 | — | Y | — | 長度1–50 | — |
| phone | 手機 | NVARCHAR | 20 | UK | Y | — | `09\d{8}` | 唯一鍵 |
| status | 狀態 | TINYINT | — | — | Y | 1 | 1啟用/0停用 | 字典 |
| dept_id | 部門 | INT | — | FK | N | — | → DEPT.id | 外鍵 |
| is_deleted | 軟刪 | BIT | — | — | Y | 0 | 0/1 | 邏輯刪除 |
| create_time | 建立時間 | DATETIME | — | — | Y | GETDATE() | — | 慣例欄位 |
| update_time | 更新時間 | DATETIME | — | — | N | — | — | 慣例欄位 |

**要點**：
- **每張表都要有「用途」一句話**（這張表存什麼、跟誰關聯、合併了哪幾張舊表）——對應 ER 的「table 說明」，不可省。
- **欄位要列全**（含 id、慣例時間戳），與 ER 的欄位一致；不是只列關鍵欄。
- FK 一定標「→ 表.欄位」；唯一鍵標 UK；型別具體（`NVARCHAR(50)` 不是「字串」）；驗證可執行（regex/範圍/唯一）。

---

## 型別對照（MS SQL Server 主力 / MySQL 備用）

| 用途 | MS SQL Server | MySQL |
|---|---|---|
| 整數 | `INT` / `BIGINT` | `INT` / `BIGINT` |
| 自增主鍵 | `INT IDENTITY(1,1)` | `INT AUTO_INCREMENT` |
| 短字串 | `NVARCHAR(n)` | `VARCHAR(n)`（utf8mb4） |
| 長文 | `NVARCHAR(MAX)` | `TEXT` / `LONGTEXT` |
| 布林 | `BIT` | `TINYINT(1)` |
| 日期時間 | `DATETIME` / `DATETIME2` | `DATETIME` |
| 日期 | `DATE` | `DATE` |
| 金額/精確小數 | `DECIMAL(18,2)` | `DECIMAL(18,2)` |
| 浮點（座標等） | `FLOAT` / `DECIMAL(9,6)` | `DOUBLE` / `DECIMAL(9,6)` |
| GUID | `UNIQUEIDENTIFIER` | `CHAR(36)` |
| 大型二進位 | `VARBINARY(MAX)`（多半改存 NAS 路徑） | `BLOB`（同上建議） |

> 影像/檔案**別存 DB**，存 NAS 路徑（Benson 慣例），DB 只放 `file_path NVARCHAR(500)`。

---

## ④ API spec 格式

每支端點一列總表 + 關鍵端點附 JSON 範例。

### 端點總表（會員模組）

| 方法 | 路徑 | 說明 | 主要參數 | 成功回傳 | 認證 |
|---|---|---|---|---|---|
| GET | `/api/v1/members` | 會員列表 | `page,size,keyword,status` | `{code,message,data:{items,total}}` | Bearer |
| GET | `/api/v1/members/{id}` | 單筆 | path `id` | `{code,message,data}` | Bearer |
| POST | `/api/v1/members` | 新增 | body（見下） | `201 {data:{id}}` | Bearer |
| PUT | `/api/v1/members/{id}` | 更新 | path `id` + body | `{code,message}` | Bearer |
| DELETE | `/api/v1/members/{id}` | 刪除（軟刪） | path `id` | `{code,message}` | Bearer |
| PUT | `/api/v1/members/{id}/status` | 啟用/停用 | path `id` + `{status}` | `{code,message}` | Bearer |

### 請求/回傳範例（POST 新增）

```json
// Request  POST /api/v1/members
{ "name": "王小明", "phone": "0912345678", "dept_id": 3 }

// Response 201
{ "code": 0, "message": "ok", "data": { "id": 1024 } }

// Error 400
{ "code": 4001, "message": "phone 格式錯誤", "data": null }
```

---

## 共用慣例

- 版本前綴 `/api/v1/`；資源名**複數**。
- 分頁：`?page=1&size=20`，回 `data:{items:[],total:N}`。
- 統一回傳：`{ code, message, data }`（code 0=成功）。
- 認證：`Authorization: Bearer <token>`。
- 時間一律 ISO8601；金額用字串或整數分避免浮點。
- 軟刪：DELETE 實際是 `is_deleted=1`，列表預設濾掉。
