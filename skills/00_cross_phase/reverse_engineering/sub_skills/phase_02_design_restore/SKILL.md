---
name: Reverse_Skill_DesignRestore
description: Phase 02 逆向模式 — 從 Phase 03 逆向產出（模組清單、API 路由、DB Schema）反推系統設計文件，包含 ER 圖、API Spec、系統架構圖、Use Case 圖。
---

## 一、定位

本子 Skill 為逆向工程的**第二步**，從 Phase 03 的程式碼分析結果反推系統設計層級的文件。

**逆向方向**：Phase 03 產出 → 反推 → Phase 02 設計文件 → 供 Phase 01 逆向使用

---

## 二、觸發條件

- 被主控 Orchestrator `@reverse` 自動調度（Phase 03 完成後）
- 或手動觸發：`@reverse-design [Phase 03 產出目錄]`

---

## 三、輸入需求

| 項目 | 說明 | 必填 |
|:-----|:-----|:-----|
| `module_list.json` | Phase 03 逆向產出 | ✅ |
| `api_routes.json` | Phase 03 逆向產出 | ✅ |
| `db_schema_raw.sql` | Phase 03 逆向產出（若有） | 可選 |
| `table_list.json` | Phase 03 逆向產出 | ✅ |
| `code_analysis.md` | Phase 03 逆向產出 | ✅ |

---

## 四、執行流程

### Step 1：ER 圖反推

從 `table_list.json` 與可用的 DDL 證據生成 ER 圖：

1. 只有明確 FK／ORM 設定才能確認關聯；命名相似僅能列為候選
2. 使用 Mermaid `erDiagram` 語法生成 ER 圖
3. 主鍵、外鍵、欄位型別與關聯類型有證據才標為已確認；只有表名時產出候選清單和待決說明

產出：
- `er_diagram.md`：Mermaid 格式 ER 圖
- `er_description.md`：ER 圖文字說明

### Step 2：API Spec 反推

從 `api_routes.json` 生成 API 規格：

1. 整理路由清單（Method + Path + Handler）
2. 沿 UI／Razor／JavaScript → Controller → Service／函式庫 → 資料／外部服務 → Session／回應追蹤請求、分支及副作用
3. 產出 OpenAPI 3.0 候選規格；未知欄位、HTTP 狀態、認證與環境網址不得臆測成已確認契約

產出：
- `api_spec.md`：API 規格文件（Markdown 格式）
- `api_spec.yaml`：OpenAPI 3.0 YAML（若有結構化資訊）

### Step 3：系統架構圖反推

從 `module_list.json` 和 `dependency_list.json` 生成架構圖：

1. 識別模組間的呼叫關係
2. 識別外部依賴（第三方服務、資料庫、快取）
3. 使用 Mermaid `graph TD` 語法生成架構圖

產出：
- `system_architecture.md`：系統架構圖 + 文字說明

### Step 4：Use Case 圖反推

從 API 路由和模組結構推使用者場景：

1. 從 API 路由識別使用者操作（CRUD）
2. 角色須有授權檢查、使用者文件或 UI 證據；路由名稱僅作候選線索
3. 以環境支援的 UML／SVG 或 Mermaid 流程圖呈現 Use Case；生成後檢查渲染結果

產出：
- `use_case_diagram.md`：Use Case 圖
- `use_case_list.json`：Use Case 清單

### Step 5：活動圖與時序圖反推

從程式碼流程生成活動圖和時序圖：

1. 從主要 API handler 追蹤執行流程
2. 識別分支、迴圈、錯誤處理
3. 生成活動圖（activity diagram）
4. 對重要場景生成時序圖（sequence diagram）

產出：
- `activity_diagram.md`：活動圖
- `sequence_diagram.md`：時序圖

需要可單獨預覽的 UML 類別／順序／使用案例與操作流程圖時，使用 `skills/00_cross_phase/diagram-design/SKILL.md`；圖形仍須遵守本 Skill 的來源、候選與未知標記。

---

## 五、輸出清單

| 檔案 | 說明 | 供誰使用 |
|:-----|:-----|:---------|
| `er_diagram.md` | Mermaid ER 圖 | Phase 01 逆向 |
| `er_description.md` | ER 圖文字說明 | Phase 01 逆向 |
| `api_spec.md` | API 規格文件 | Phase 01 逆向 |
| `api_spec.yaml` | OpenAPI 3.0 YAML | Phase 01 逆向 |
| `system_architecture.md` | 系統架構圖 | Phase 01 逆向 |
| `use_case_diagram.md` | Use Case 圖 | Phase 01 逆向 |
| `use_case_list.json` | Use Case 清單 | Phase 01 逆向 |
| `activity_diagram.md` | 活動圖 | Phase 01 逆向 |
| `sequence_diagram.md` | 時序圖 | Phase 01 逆向 |

---

## 六、與現有框架的整合

### 6.1 與 Phase 02 正常模式的關係
逆向產物可進入追溯鏈作為設計候選；正向 Phase 02 仍須依已核准的 Phase 01 需求審查後才成為設計基線。

### 6.2 Planner 職責
- 讀取 Phase 03 逆向產出
- 規劃設計反推順序（ER → API → 架構 → Use Case → 活動/時序）
- 確認哪些文件可自動生成、哪些需人工補正

### 6.3 Generator 職責
- 依序執行各反推步驟
- 產出所有 Mermaid 圖表和規格文件
- 儲存至 `outputs/phase_02_reverse/`

### 6.4 Evaluator 職責
- 驗證 Mermaid 語法正確性
- 驗證 ER 圖欄位與 DB Schema 一致
- 驗證 API Spec 與路由清單一致
- 驗證架構圖模組與 module_list 一致

---

## 七、錯誤處理

| 錯誤類型 | 處理方式 |
|:---------|:---------|
| DB Schema 無法解析 | 標註為待人工補正，ER 圖標記「待確認」 |
| API 結構無法推斷 | 僅產出路由清單，不產出請求/回應結構 |
| 模組關聯不明確 | 產出初步架構圖，標記「待人工確認」 |
| Use Case 無法推斷 | 跳過 Use Case 圖，不阻斷流程 |
