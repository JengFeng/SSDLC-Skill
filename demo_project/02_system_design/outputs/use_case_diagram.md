# 員工管理系統 — 用例圖 (Use Case Diagram)

```mermaid
graph LR
    HR["👤 人資管理員"]

    subgraph SYSTEM["員工基本資料管理系統"]
        UC01["查詢員工列表"]
        UC02["搜尋員工"]
        UC03["新增員工<br/>(含 Email 唯一驗證)"]
        UC04["修改員工資料<br/>(含必填驗證)"]
        UC05["刪除員工<br/>(含確認對話框)"]
    end

    HR --> UC01
    HR --> UC02
    HR --> UC03
    HR --> UC04
    HR --> UC05
    UC02 -.->|extend| UC01

    style HR fill:#f9f,stroke:#333
    style UC01 fill:#bbf,stroke:#333
    style UC02 fill:#bbf,stroke:#333
    style UC03 fill:#bfb,stroke:#333
    style UC04 fill:#bfb,stroke:#333
    style UC05 fill:#fbb,stroke:#333
```

## 說明
- 唯一 Actor：人資管理員
- 五個核心用例，搜尋為列表查詢的擴展（extend）
- 三個用例附註邊界條件
