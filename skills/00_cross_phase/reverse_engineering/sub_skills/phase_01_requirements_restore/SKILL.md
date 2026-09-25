---
name: Reverse_Skill_RequirementsRestore
description: Phase 01 逆向模式 — 從 Phase 02 逆向產出（ER 圖、API Spec、架構圖、Use Case）反推需求文件、SSOT 四規格、追溯矩陣。逆向完成後切換順向流程。
---

## 一、定位

本子 Skill 是逆序蒐證終點。從 Phase 02 設計證據建立需求候選及四規格草稿，接著將其回灌專案根正向 Phase 01 SSOT；逆向完成不等於需求核准。

**逆向方向**：Phase 02 產出 → 反推 → Phase 01 需求文件 → 完成逆向 → 切換順向

---

## 二、觸發條件

- 被主控 Orchestrator `@reverse` 自動調度（Phase 02 完成後）
- 或手動觸發：`@reverse-requirements [Phase 02 產出目錄]`

---

## 三、輸入需求

| 項目 | 說明 | 必填 |
|:-----|:-----|:-----|
| `er_diagram.md` | Phase 02 逆向產出 | ✅ |
| `api_spec.md` | Phase 02 逆向產出 | ✅ |
| `system_architecture.md` | Phase 02 逆向產出 | ✅ |
| `use_case_diagram.md` | Phase 02 逆向產出 | 可選 |
| `use_case_list.json` | Phase 02 逆向產出 | 可選 |
| `code_analysis.md` | Phase 03 逆向產出 | ✅ |

---

## 四、執行流程

### Step 1：需求萃取

從設計文件反推功能需求：

1. 按使用者任務與業務能力整合 API 端點；多端點可屬同一需求，一端點也可能涉及多條規則
2. 從 Use Case 提取使用者場景需求
3. 從 ER 圖提取資料模型需求
4. 從系統架構提取有證據的非功能約束；沒有量測或業務文件時標成待決，不創造效能、可用性或安全性門檻
5. 為關鍵操作寫出 UI 入口、Controller 分支、函式庫、資料存取及 Session／回應的先後順序，附來源檔案與行號

產出：
- `formal_requirements.md`：結構化需求文件

### Step 2：Gherkin 場景生成

將功能需求轉為行為化規格：

1. 依需求與操作路徑建立 Gherkin 場景，覆蓋成功、分支和錯誤；場景不必與端點一對一
2. 每個 Use Case 生成 Happy Path + Edge Case
3. 使用 Given-When-Then 格式

產出：
- `requirements.feature`：Gherkin 格式行為規格

### Step 3：SSOT 四規格生成

產出完整 SSOT 四規格：

1. `executable_spec.yaml`：結構化可執行規格
   - project 資訊
   - phase_01~06 區塊；逆向結果標記為候選，正向階段依真實 Evaluator 狀態保持 `in_progress` 或 `pending`
   - traceability 區塊
   - change_log 區塊

2. `requirements.feature`：行為化規格（Step 2 產出）

3. `system_specification.md`：系統規格書（IEEE 830 格式）
   - 從需求文件 + 設計文件彙整
   - 包含：系統概述、功能需求、非功能需求、介面需求

4. `traceability_matrix.md`：需求追溯矩陣
   - 需求 ID → 設計元素 → 程式碼模組
   - 雙向追溯：正向（需求→設計→程式碼）+ 逆向（程式碼→設計→需求）

### Step 4：逆向工程完成標記

1. 標記逆向蒐證已完成，逐項列出候選、衝突與未知
2. 產出逆向工程摘要報告
3. 將逆向草稿回灌專案根 YAML，更新衍生四規格並執行靜態完整性檢查
4. 業務決議未取得時保留 `approval_status: pending`；文件整理及可追溯性檢查可繼續

產出：
- `reverse_engineering_report.md`：逆向工程完成報告
- `reverse_completion_summary.json`：完成狀態摘要

---

## 五、輸出清單

| 檔案 | 說明 | 供誰使用 |
|:-----|:-----|:---------|
| `formal_requirements.md` | 結構化需求文件 | SSOT 追溯鏈 |
| `executable_spec.yaml` | 結構化可執行規格 | SSOT 追溯鏈（核心） |
| `requirements.feature` | Gherkin 行為規格 | SSOT 追溯鏈 |
| `system_specification.md` | 系統規格書（IEEE 830） | SSOT 追溯鏈 |
| `traceability_matrix.md` | 需求追溯矩陣 | SSOT 追溯鏈 |
| `reverse_engineering_report.md` | 逆向工程完成報告 | 使用者 |
| `reverse_completion_summary.json` | 完成狀態摘要 | 主控 Orchestrator |

---

## 六、SSOT 四規格交叉檢查

逆向草稿及專案根四規格必須通過 `@CheckSpec` 的結構和追溯檢查；通過不代表業務語義或執行結果已獲驗證：

1. **executable_spec.yaml**：需求 ID 唯一、無缺失欄位
2. **requirements.feature**：Gherkin 語法正確、每個需求有對應場景
3. **system_specification.md**：章節完整、與 executable_spec 一致
4. **traceability_matrix.md**：每個需求有追溯鏈、無孤立節點

若檢查不通過，標記為 B 類錯誤，要求修正後重新檢查。

---

## 七、與現有框架的整合

### 7.1 逆向完成後的切換流程

```
Phase 03→02→01 逆向候選
    → 專案根正向 Phase 01 YAML／Feature／SRS／RTM
    → 業務契約決議與 Phase 01 Evaluator
    → Phase 02 設計 → Phase 03 實作
    → Phase 04 測試 → Phase 05 部署 → Phase 06 維運
```

### 7.2 與 @guide 的整合
正向 Phase 01～03 的關卡與基線完成後，才可透過 `@guide 04` 啟動 Phase 04 引導式協作。

### 7.3 與 @security-load 的整合
逆向完成後，可透過 `@security-load` 導入資安防護基準，對逆向成果進行安全檢核。

---

## 八、人工審核閘口

在 Phase 01 業務核准關卡整理決議資料：

1. 顯示逆向成果摘要（需求數量、追溯鏈完整度）
2. 標註自動生成 vs 人工補正的內容
3. 列出需要業務方裁定的契約衝突；決議前不得將對應需求標成已核准
4. 持續完成不依賴決議的文件與 Skill 完整性工作

**原因**：需求層級的反推最容易有偏差，必須有人工審核確保正確性。
