---
name: Reverse_Skill_CodeRestore
description: Phase 03 逆向模式 — 從既有原始碼分析模組結構、API 路由、資料庫 Schema、第三方依賴，產出程式碼層級的完整分析文件。
---
## 共通執行防線

- 預設唯讀分析來源專案；不得修改、格式化、建置、安裝依賴、啟動服務或執行來源專案程式碼。測試執行須先取得使用者明確同意，並在隔離環境執行。
- 不讀取或複製密鑰、token、私鑰、憑證、真實個資或 `.env` 值。只記錄檔案存在與變數名稱；輸出前遮蔽疑似敏感字串。
- 所有路徑使用來源根目錄相對路徑；忽略 `.git`、建置輸出、快取、依賴套件與大型二進位檔，除非使用者指定納入。
- 每項結論標示 `觀察`、`推論` 或 `待確認`，附來源檔案/符號/行號（可取得時）、信心與限制。不得把推論寫成已確認需求或安全保證。
- 保留既有交付物；新產物只寫入指定的 `outputs/phase_NN_reverse/` 或 `outputs/phase_NN/`。不得覆寫來源或既有輸出，除非使用者明確指定。
- 缺少輸入、解析器不支援或證據不足時，記錄缺口並降低結論信心；只有阻斷必要下游工作的缺項才暫停。啟用 IO 管理時，Evaluator 依逆向 IO YAML 驗證必要產物與來源追溯。


## 一、定位

本子 Skill 為逆向工程的**起點**，負責分析使用者提供的原始碼，產出程式碼層級的結構化分析結果，供 Phase 02 逆向使用。

**逆向方向**：Phase 03（程式碼）→ 產出分析文件 → 供 Phase 02 逆向使用

---

## 二、觸發條件

- 被主控 Orchestrator `@reverse` 自動調度
- 或手動觸發：`@reverse-code [專案路徑]`

---

## 三、輸入需求

| 項目 | 說明 | 必填 |
|:-----|:-----|:-----|
| 原始碼目錄 | 舊專案完整原始碼路徑 | ✅ |
| 語言/框架偵測 | 自動偵測或使用者指定 | 自動 |
| 資料庫 DDL | 若有，提供 DB 結構 | 可選 |

---

## 四、執行流程

### Step 1：環境偵測與素材掃描

1. 掃描目錄結構，偵測專案類型（Python/Node.js/Java/Go/.NET 等）
2. 識別主要框架（Flask/Django/Express/Spring/...）
3. 掃描是否存在：原始碼、Dockerfile、docker-compose、SQL DDL、測試目錄
4. 產出 `scan_report.json`（專案概覽）

### Step 2：程式碼靜態分析

僅使用不執行來源程式的靜態解析器；工具不存在時以有限度人工靜態檢視並記錄限制，不安裝工具或依賴。依偵測到的語言選擇對應工具：

| 語言 | 工具 | 分析內容 |
|:-----|:-----|:---------|
| Python | ast 模組 / tree-sitter | 函數/類別/裝飾器/路由 |
| JavaScript/TypeScript | TypeScript Compiler API / tree-sitter | 函數/類別/路由/型別 |
| Java | javap / tree-sitter | 類別/方法/註解 |
| Go | go/ast | 函數/結構體/路由 |
| .NET | Roslyn / reflection | 類別/方法/屬性 |

分析產出：
- `module_list.json`：模組清單（檔名、路徑、職責描述）
- `class_function_list.json`：類別與函數清單
- `dependency_list.json`：第三方依賴清單（package.json / requirements.txt / go.mod）

### Step 3：API 路由匯整

掃描框架特定的路由裝飾器/註解：

| 框架 | 路由標記 |
|:-----|:---------|
| Flask | `@app.route()` |
| Django | `urlpatterns` |
| Express | `app.get/post/put/delete()` |
| Spring | `@GetMapping/@PostMapping` |
| Gin | `router.GET/POST()` |

產出：
- `api_routes.json`：完整 API 路由清單
  ```json
  {
    "method": "GET",
    "path": "/api/users",
    "handler": "get_users",
    "file": "routes/user.py",
    "params": ["page", "limit"]
  }
  ```

### Step 4：資料庫 Schema 反推

- 若有 DDL 檔案 → 直接解析
- 若無 DDL → 從 ORM Model 反推：
  - SQLAlchemy：掃描 `Column()` 定義
  - Django ORM：掃描 `models.py`
  - Prisma：解析 `schema.prisma`
  - TypeORM：掃描 `@Entity()` 裝飾器

產出：
- `db_schema_raw.sql`：僅在有可追溯 ORM/DDL 證據時產出的候選 DDL
- `table_list.json`：資料表清單（名稱、欄位、型態、關聯）

### Step 5：程式碼分析摘要

彙整以上分析結果，產出：
- `code_analysis.md`：程式碼分析報告（含觀察/推論/待確認、證據位置、信心與限制）
  - 專案概覽（語言、框架、依賴數量）
  - 模組架構摘要
  - API 端點統計
  - 資料表統計
  - 已識別的安全模式（若可見）

---

## 五、輸出清單

| 檔案 | 說明 | 供誰使用 |
|:-----|:-----|:---------|
| `scan_report.json` | 專案掃描概覽 | 主控 Orchestrator |
| `module_list.json` | 模組清單 | Phase 02 逆向 |
| `class_function_list.json` | 類別/函數清單 | Phase 02 逆向 |
| `api_routes.json` | API 路由清單 | Phase 02 逆向 |
| `db_schema_raw.sql` | 反推的 DB Schema | Phase 02 逆向 |
| `table_list.json` | 資料表清單 | Phase 02 逆向 |
| `dependency_list.json` | 第三方依賴清單 | Phase 02 逆向 |
| `code_analysis.md` | 程式碼分析報告 | 所有後續階段 |

---

## 六、與現有框架的整合

### 6.1 Planner 職責
- 確認原始碼目錄可達
- 選擇適合的靜態分析工具
- 規劃分析順序（先掃描結構 → 再分析程式碼 → 最後匯整）

### 6.2 Generator 職責
- 依序執行各分析步驟
- 產出所有結構化 JSON 檔案
- 儲存至 `outputs/phase_03_reverse/`

### 6.3 Evaluator 職責
- 驗證 JSON 檔案語法正確性
- 驗證模組清單與實際目錄結構一致
- 驗證 API 路由無重複
- 驗證 DB Schema 與來源證據一致；不可推測未知欄位

---

## 七、錯誤處理

| 錯誤類型 | 處理方式 |
|:---------|:---------|
| 無法偵測語言 | 詢問使用者指定語言 |
| ORM Model 無法解析 | 標註為待人工補正，不阻斷流程 |
| API 路由掃描不完整 | 標註已掃描比例，提醒人工確認 |
| 依賴檔案缺失 | 標註為未知，不阻斷流程 |
