---
name: Reverse_Skill_RequirementsRestore
description: Phase 01 逆向模式 — 從 Phase 02 逆向產出（ER 圖、API Spec、架構圖、Use Case）反推需求文件、SSOT 四規格、追溯矩陣。逆向完成後切換順向流程。
---
## 共通執行防線

- 預設唯讀分析來源專案；不得修改、格式化、建置、安裝依賴、啟動服務或執行來源專案程式碼。測試執行須先取得使用者明確同意，並在隔離環境執行。
- 不讀取或複製密鑰、token、私鑰、憑證、真實個資或 `.env` 值。只記錄檔案存在與變數名稱；輸出前遮蔽疑似敏感字串。
- 所有路徑使用來源根目錄相對路徑；忽略 `.git`、建置輸出、快取、依賴套件與大型二進位檔，除非使用者指定納入。
- 每項結論標示 `觀察`、`推論` 或 `待確認`，附來源檔案/符號/行號（可取得時）、信心與限制。不得把推論寫成已確認需求或安全保證。
- 保留既有交付物；新產物只寫入指定的 `outputs/phase_NN_reverse/` 或 `outputs/phase_NN/`。不得覆寫來源或既有輸出，除非使用者明確指定。
- 缺少輸入、解析器不支援或證據不足時，記錄缺口並降低結論信心；只有阻斷必要下游工作的缺項才暫停。Evaluator 依 IO YAML 驗證必要產物與來源追溯。


## 一、定位

本子 Skill 為逆向工程的**最後一步（逆序終點）**，從 Phase 02 的設計文件反推需求層級的文件，產出完整的 SSOT 四規格，逆向工程至此完成，後續切換順向流程。

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

1. 從 API Spec 產生候選功能需求；一個端點不必然等於一項業務需求，應按證據聚合並標記推論
2. 從 Use Case 提取使用者場景需求
3. 從 ER 圖提取資料模型需求
4. 只記錄架構可支持的非功能觀察；無量測或明確配置證據時不得宣稱效能/可用性/安全需求

產出：
- `formal_requirements.md`：結構化需求文件

### Step 2：Gherkin 場景生成

將功能需求轉為行為化規格：

1. 每個 API 端點生成對應的 Gherkin 場景
2. 每個 Use Case 生成 Happy Path + Edge Case
3. 使用 Given-When-Then 格式

產出：
- `requirements.feature`：Gherkin 格式行為規格

### Step 3：SSOT 四規格生成

產出完整 SSOT 四規格：

1. `executable_spec.yaml`：結構化可執行規格
   - project 資訊
   - phase_01~06 區塊（逆向標記 `status: reverse_engineered`）
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

1. 標記所有逆向產出為 `reverse_engineered`
2. 產出逆向工程摘要報告
3. 詢問使用者是否確認逆向成果
4. 確認後切換至順向流程

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

逆向產出的四規格必須通過 `@CheckSpec` 檢查：

1. **executable_spec.yaml**：需求 ID 唯一、必填欄位完整，且每項需求帶有證據/推論狀態
2. **requirements.feature**：Gherkin 語法正確、每個需求有對應場景
3. **system_specification.md**：章節完整、與 executable_spec 一致
4. **traceability_matrix.md**：每個需求有追溯鏈、無孤立節點

若檢查不通過，標記為 B 類錯誤，要求修正後重新檢查。

---

## 七、與現有框架的整合

### 7.1 逆向完成後的切換流程

```
逆向工程完成
    │
    ├── 使用者確認逆向成果
    │
    ├── 自動觸發 @baseline（封存逆向成果）
    │
    ├── phase_gates.json 狀態更新：
    │   phase_01: { status: "completed", mode: "reverse_engineered" }
    │   phase_02: { status: "completed", mode: "reverse_engineered" }
    │   phase_03: { status: "completed", mode: "reverse_engineered" }
    │
    └── 切換至順向流程：Phase 04 → Phase 05 → Phase 06
```

### 7.2 與 @guide 的整合
逆向完成後，可透過 `@guide 04` 啟動 Phase 04 的引導式協作，開始順向流程。

### 7.3 與 @security-load 的整合
逆向完成後，可透過 `@security-load` 導入資安防護基準，對逆向成果進行安全檢核。

---

## 八、人工審核閘口

Phase 01 逆向完成後，**強制暫停**等待使用者確認：

1. 顯示逆向成果摘要（需求數量、追溯鏈完整度）
2. 標註自動生成 vs 人工補正的內容
3. 詢問：「逆向成果是否正確？要修正嗎？」
4. 使用者確認後才將需求標記為已核准；未確認前不得切換、完成標記或建立已驗證基線

**原因**：需求層級的反推最容易有偏差，必須有人工審核確保正確性。
