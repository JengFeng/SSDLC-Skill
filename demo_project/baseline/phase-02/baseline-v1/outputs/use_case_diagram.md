# 使用案例圖 (Use Case Diagram)

> 生成日期：2026-07-10 | Phase 02 系統設計（第二次重新生成）
> 來源：SSOT `specs/executable_spec.yaml` + `formal_requirements.md`
> 工具：plantuml + mermaid

---

## Mermaid 格式（角色 × 功能矩陣圖）

```mermaid
flowchart LR
    subgraph Actors["👤 角色"]
        E["🏷️ 一般員工<br/>employee"]
        HR["🏷️ HR 專員<br/>hr_specialist"]
        MGR["🏷️ HR 主管<br/>hr_manager"]
        AD["🔗 Windows AD<br/>外部系統"]
    end

    subgraph UC_Employee["一般員工功能"]
        UC01["🔑 AD 單一登入"]
        UC02["👁️ 檢視個人資料"]
        UC03["✏️ ESS 修改聯絡資訊"]
    end

    subgraph UC_HR["HR 專員功能"]
        UC04["📋 員工主檔 CRUD"]
        UC05["🎓 學經歷管理"]
        UC06["📜 證照管理"]
        UC07["📎 附件上傳"]
        UC08["📅 查詢異動歷程"]
        UC09["🎂 當月壽星報表"]
        UC10["📥 Excel 匯出"]
    end

    subgraph UC_Manager["HR 主管功能"]
        UC11["💰 檢視/編輯薪資"]
        UC12["📊 檢視人事評核"]
        UC13["🚪 檢視離職原因"]
        UC14["📈 年資分佈報表"]
        UC15["🏢 部門人力結構"]
        UC16["📉 離職率統計"]
        UC17["🏗️ 部門管理"]
        UC18["🔍 稽核日誌查詢"]
    end

    E --> UC01
    E --> UC02
    E --> UC03
    HR --> UC01
    HR --> UC04
    HR --> UC05
    HR --> UC06
    HR --> UC07
    HR --> UC08
    HR --> UC09
    HR --> UC10
    MGR --> UC01
    MGR --> UC11
    MGR --> UC12
    MGR --> UC13
    MGR --> UC14
    MGR --> UC15
    MGR --> UC16
    MGR --> UC17
    MGR --> UC18

    UC01 -.->|LDAPS| AD
    UC04 -.->|include| AUDIT["📝 記錄稽核日誌"]
    UC11 -.->|include| AUDIT
    UC05 -.->|include| AUDIT
    UC10 -.->|include| AUDIT

    HR -- "繼承" --> E
    MGR -- "繼承" --> HR
```

---

## PlantUML 原始碼

```plantuml
@startuml
left to right direction

actor "一般員工" as Employee
actor "HR 專員" as HR_Specialist
actor "HR 主管 / 高階主管" as HR_Manager
actor "Windows AD" as AD <<外部系統>>

rectangle "員工基本資料管理系統" {
    ' ── 一般員工 ──
    Employee --> (AD 單一登入)
    Employee --> (檢視個人資料)
    Employee --> (修改聯絡資訊\nESS)

    ' ── HR 專員 ──
    HR_Specialist --> (AD 單一登入)
    HR_Specialist --> (員工主檔維護\nCRUD)
    HR_Specialist --> (學經歷管理)
    HR_Specialist --> (證照管理)
    HR_Specialist --> (附件上傳)
    HR_Specialist --> (查詢異動歷程)
    HR_Specialist --> (當月壽星報表)
    HR_Specialist --> (匯出 Excel)

    ' ── HR 主管 ──
    HR_Manager --> (AD 單一登入)
    HR_Manager --> (檢視 / 編輯薪資)
    HR_Manager --> (檢視人事評核)
    HR_Manager --> (檢視離職原因)
    HR_Manager --> (年資分佈報表)
    HR_Manager --> (部門人力結構報表)
    HR_Manager --> (離職率統計)
    HR_Manager --> (部門管理)
    HR_Manager --> (稽核日誌查詢)

    ' ── 關聯 ──
    (AD 單一登入) ..> AD : LDAPS
    (AD 單一登入) <.. (本機備援登入) : <<extend>>
    (員工主檔維護\nCRUD) ..> (記錄稽核日誌) : <<include>>
    (檢視 / 編輯薪資) ..> (記錄稽核日誌) : <<include>>
    (學經歷管理) ..> (記錄稽核日誌) : <<include>>
    (匯出 Excel) ..> (記錄稽核日誌) : <<include>>
}

HR_Specialist --|> Employee
HR_Manager --|> HR_Specialist
@enduml
```

---

## 使用案例摘要

| 案例 | 參與者 | 說明 | 對應 REQ |
|:---|:---|:---|:---|
| UC-01 | 全部 | AD 單一登入 / 本機備援登入 | NFR-004 |
| UC-02 | 一般員工 | 檢視個人資料 | REQ-004 |
| UC-03 | 一般員工 | ESS 修改聯絡資訊（手機/地址/緊急聯絡人） | REQ-004 |
| UC-04 | HR 專員 | 員工主檔 CRUD（新增/修改/查詢/刪除） | REQ-001 |
| UC-05 | HR 專員 | 學經歷管理（多筆新增/修改/刪除） | REQ-003 |
| UC-06 | HR 專員 | 證照管理 + 附件上傳 | REQ-003 |
| UC-07 | HR 專員 | 查詢員工異動歷程時間軸 | REQ-002 |
| UC-08 | HR 專員 | 當月壽星清單報表 | REQ-006 |
| UC-09 | HR 專員 | Excel 匯出（員工清單/報表） | REQ-007 |
| UC-10 | HR 主管 | 檢視 / 編輯薪資欄位 | REQ-005 |
| UC-11 | HR 主管 | 檢視人事評核與離職原因 | REQ-005 |
| UC-12 | HR 主管 | 年資分佈 / 部門結構 / 離職率報表 | REQ-006 |
| UC-13 | HR 主管 | 部門管理（新增/修改/刪除） | REQ-001 |
| UC-14 | HR 主管 | 稽核日誌查詢 | NFR-003 |
| UC-15 | 系統 | 自動記錄所有 CRUD+檢視行為至 audit_log | NFR-003 |

---

## 角色階層

```
一般員工 (employee)
  └─ HR 專員 (hr_specialist)  ← 繼承一般員工權限 + 擴充 HR 功能
       └─ HR 主管 (hr_manager) ← 繼承 HR 專員權限 + 擴充機敏資料與報表
            └─ 系統管理員 (admin) ← 全權限 + 稽核日誌
```
