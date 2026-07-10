# 活動圖 (Activity Diagram)

> 生成日期：2026-06-29 | Phase 02 系統設計
> 工具：Mermaid + PlantUML

---

## 一、新進員工報到流程

### Mermaid

```mermaid
flowchart TD
    subgraph HR["👤 HR 專員"]
        A1["點選「新增員工」"]
        A2["填寫報到表單\n（姓名/身分證/部門/職稱/到職日...）"]
        A3["提交表單"]
        A1 --> A2 --> A3
    end

    subgraph SYS["🖥️ 系統"]
        B1{"驗證必填欄位"}
        B2["回傳錯誤提示"]
        B3{"檢查工號/Email\n唯一性"}
        B4["回傳「工號或 Email\n已存在」"]
        B5["🔒 加密機敏欄位\n(AES-256)"]
        B6["INSERT INTO employees"]
        B7["📝 寫入 audit_log (CREATE)"]
        B8["新增預設異動記錄\n(change_type=報到)"]
        B9["回傳 201 成功"]
    end

    subgraph END["👤 HR 專員"]
        C1["收到成功訊息"]
        C2["（可選）新增學經歷/證照"]
        C1 --> C2
    end

    A3 --> B1
    B1 -->|欄位不完整| B2
    B1 -->|欄位完整| B3
    B3 -->|重複| B4
    B3 -->|不重複| B5 --> B6 --> B7 --> B8 --> B9
    B9 --> C1
```

---

## 二、員工調職 / 升遷流程

### Mermaid

```mermaid
flowchart TD
    subgraph HR["👤 HR 專員"]
        D1["查詢目標員工"]
        D2["點選「異動記錄」\n→「新增異動」"]
        D3["選擇異動類型\n（調職/升遷/調薪）"]
        D4["填寫異動內容\n（新部門/新職稱/新薪資/生效日/原因）"]
        D5["提交異動"]
        D1 --> D2 --> D3 --> D4 --> D5
    end

    subgraph SYS["🖥️ 系統"]
        E1["驗證異動資料"]
        E2["讀取員工目前資料\n(old_value)"]
        E3["📝 INSERT INTO\nemployee_history\n(Append-Only)"]
        E4{"異動類型?"}
        E5["UPDATE employees\nSET department_id, title"]
        E6["UPDATE employees\nSET title"]
        E7["UPDATE employees\nSET salary_enc"]
        E8["📝 寫入 audit_log\n(UPDATE)"]
        E9["回傳 201 成功"]
    end

    D5 --> E1 --> E2 --> E3 --> E4
    E4 -->|調職| E5
    E4 -->|升遷| E6
    E4 -->|調薪| E7
    E5 --> E8
    E6 --> E8
    E7 --> E8
    E8 --> E9
```

---

## 三、離職處理流程

### Mermaid

```mermaid
flowchart TD
    subgraph MGR["👤 HR 主管"]
        F1["查詢目標員工"]
        F2["點選「辦理離職」"]
        F3["填寫離職資訊\n（離職日/離職原因）"]
        F4["提交離職"]
        F1 --> F2 --> F3 --> F4
    end

    subgraph SYS["🖥️ 系統"]
        G1{"驗證離職日\n≥ 最後上班日"}
        G2["回傳錯誤"]
        G3["📝 INSERT INTO\nemployee_history\n(change_type=離職)"]
        G4["UPDATE employees\nSET status='離職',\nleave_date=xx,\nleave_reason_enc=xx"]
        G5["📝 寫入 audit_log\n(UPDATE)"]
        G6["觸發離職通知\n（Email 通知相關部門）"]
        G7["回傳 200 成功"]
    end

    F4 --> G1
    G1 -->|日期無效| G2
    G1 -->|日期有效| G3 --> G4 --> G5 --> G6 --> G7
```

---

## 四、人事報表產出流程

### Mermaid

```mermaid
flowchart TD
    subgraph MGR["👤 HR 主管"]
        H1["進入「報表中心」"]
        H2["選擇報表類型\n（年資/部門結構/離職率）"]
        H3["設定篩選條件\n（年份/部門/月份）"]
        H4["點選「產出報表」"]
        H1 --> H2 --> H3 --> H4
    end

    subgraph SYS["🖥️ 系統"]
        I1{"驗證操作者權限\n(RBAC: hr_manager+)"}
        I2["回傳 403 Forbidden"]
        I3["依篩選條件查詢 DB"]
        I4["計算統計數據"]
        I5["生成 Chart.js 圖表資料"]
        I6["回傳報表 JSON + 圖表"]
        I7{"操作者點選\n「匯出 Excel」?"}
        I8["依 RBAC 遮蔽無權欄位"]
        I9["openpyxl 生成 .xlsx"]
        I10["📝 寫入 audit_log (EXPORT)"]
        I11["回傳二進位檔案下載"]
    end

    H4 --> I1
    I1 -->|無權限| I2
    I1 -->|有權限| I3 --> I4 --> I5 --> I6 --> I7
    I7 -->|是| I8 --> I9 --> I10 --> I11
    I7 -->|否| I12["完成"]
```

---

## 五、RBAC 欄位級授權檢查

### Mermaid

```mermaid
flowchart TD
    START["收到 API 請求"]
    AUTH{"已登入?"}
    ERR401["回傳 401 Unauthorized"]
    ROLE{"查詢使用者 role"}

    START --> AUTH
    AUTH -->|否| ERR401
    AUTH -->|是| ROLE

    ROLE -->|"請求資源=本人"| SELF["允許檢視本人資料\n（機敏欄位部分遮蔽）"]
    ROLE -->|role=admin| FULL["允許全欄位存取"]
    ROLE -->|role=hr_manager| FULL
    ROLE -->|role=hr_specialist| CHK{"請求含薪資/評核欄位?"}
    ROLE -->|role=employee| CHK2{"請求資源=本人\n且僅聯絡欄位?"}

    CHK -->|是| ERR403A["回傳 403 Forbidden\n「無薪資檢視權限」"]
    CHK -->|否| ALLOW_HR["允許存取\n（機敏欄位解密後遮蔽）"]
    CHK2 -->|是| ALLOW_EMP["允許 PATCH 聯絡欄位"]
    CHK2 -->|否| ERR403B["回傳 403 Forbidden"]

    SELF --> EXEC
    FULL --> EXEC
    ALLOW_HR --> EXEC
    ALLOW_EMP --> EXEC

    EXEC["執行請求"]
    AUDIT["📝 寫入 audit_log"]
    EXEC --> AUDIT
```

---

## PlantUML 原始碼（完整流程）

### 一、新進員工報到流程

```plantuml
@startuml
|HR 專員|
start
:點選「新增員工」;
:填寫報到表單\n（姓名/身分證/部門/職稱/到職日...）;
:提交表單;

|系統|
:驗證必填欄位;
if (欄位完整?) then (否)
  :回傳錯誤提示;
  stop
endif
:檢查工號/Email 唯一性;
if (重複?) then (是)
  :回傳「工號或 Email 已存在」;
  stop
endif
:加密機敏欄位 (AES-256);
:INSERT INTO employees;
:寫入 audit_log (CREATE);
:新增預設異動記錄\n(change_type=報到);
:回傳 201 成功;

|HR 專員|
:收到成功訊息;
:（可選）新增學經歷 / 證照;
stop
@enduml
```

---

## 二、員工調職 / 升遷流程

```plantuml
@startuml
|HR 專員|
start
:查詢目標員工;
:點選「異動記錄」→「新增異動」;
:選擇異動類型\n（調職 / 升遷 / 調薪）;
:填寫異動內容\n（新部門/新職稱/新薪資/生效日/原因）;
:提交異動;

|系統|
:驗證異動資料;
:讀取員工目前資料 (old_value);
:INSERT INTO employee_history\n(Append-Only);
if (異動類型=調職?) then (是)
  :UPDATE employees\nSET department_id, title;
elseif (異動類型=升遷?) then (是)
  :UPDATE employees\nSET title;
elseif (異動類型=調薪?) then (是)
  :UPDATE employees\nSET salary_enc;
endif
:寫入 audit_log (UPDATE);
:回傳 201 成功;

|HR 專員|
:確認異動時間軸更新;
stop
@enduml
```

---

## 三、離職處理流程

```plantuml
@startuml
|HR 主管|
start
:查詢目標員工;
:點選「辦理離職」;
:填寫離職資訊\n（離職日/離職原因）;
:提交離職;

|系統|
:驗證離職日 ≥ 最後上班日;
if (日期無效?) then (是)
  :回傳錯誤;
  stop
endif
:INSERT INTO employee_history\n(change_type=離職);
:UPDATE employees SET\nstatus='離職', leave_date=xx,\nleave_reason_enc=xx;
:寫入 audit_log (UPDATE);
:觸發離職通知\n（可選：Email 通知相關部門）;
:回傳 200 成功;

|HR 主管|
:確認員工狀態變更為「離職」;
stop
@enduml
```

---

## 四、人事報表產出流程

```plantuml
@startuml
|HR 主管|
start
:進入「報表中心」;
:選擇報表類型\n（年資/部門結構/離職率）;
:設定篩選條件\n（年份/部門/月份）;
:點選「產出報表」;

|系統|
:驗證操作者權限\n（RBAC: hr_manager+）;
if (無權限?) then (是)
  :回傳 403 Forbidden;
  stop
endif
:依篩選條件查詢 DB;
:計算統計數據;
:生成 Chart.js 圖表資料;
:回傳報表 JSON + 圖表;
if (操作者點選「匯出 Excel」?) then (是)
  :依 RBAC 遮蔽無權欄位;
  :openpyxl 生成 .xlsx;
  :寫入 audit_log (EXPORT);
  :回傳二進位檔案下載;
endif

|HR 主管|
:檢視報表圖表;
:（可選）下載 Excel;
stop
@enduml
```

---

## 五、RBAC 欄位級授權檢查（通用）

```plantuml
@startuml
|系統|
start
:收到 API 請求;
:解析 JWT / Session;
if (已登入?) then (否)
  :回傳 401 Unauthorized;
  stop
endif
:查詢使用者 role;
if (請求資源=本人?) then (是)
  :允許檢視本人資料\n（機敏欄位部分遮蔽）;
elseif (role=admin?) then (是)
  :允許全欄位存取;
elseif (role=hr_manager?) then (是)
  :允許全欄位存取\n（含薪資/評核/離職原因）;
elseif (role=hr_specialist?) then (是)
  if (請求含薪資/評核欄位?) then (是)
    :回傳 403 Forbidden\n「無薪資檢視權限」;
    stop
  else (否)
    :允許存取（機敏欄位解密後遮蔽）;
  endif;
else (role=employee?)
  if (請求資源=本人 且 僅聯絡欄位?) then (是)
    :允許 PATCH 聯絡欄位;
  else (否)
    :回傳 403 Forbidden;
    stop
  endif;
endif
:執行請求;
:寫入 audit_log;
stop
@enduml
```
