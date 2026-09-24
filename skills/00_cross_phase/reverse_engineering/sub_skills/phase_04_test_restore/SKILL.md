---
name: Reverse_Skill_TestRestore
description: Phase 04 順向整合 — 逆向工程完成後，整合現有測試檔案，分析測試覆蓋率，標註缺失測試點。
---
## 共通執行防線

- 預設唯讀分析來源專案；不得修改、格式化、建置、安裝依賴、啟動服務或執行來源專案程式碼。測試執行須先取得使用者明確同意，並在隔離環境執行。
- 不讀取或複製密鑰、token、私鑰、憑證、真實個資或 `.env` 值。只記錄檔案存在與變數名稱；輸出前遮蔽疑似敏感字串。
- 所有路徑使用來源根目錄相對路徑；忽略 `.git`、建置輸出、快取、依賴套件與大型二進位檔，除非使用者指定納入。
- 每項結論標示 `觀察`、`推論` 或 `待確認`，附來源檔案/符號/行號（可取得時）、信心與限制。不得把推論寫成已確認需求或安全保證。
- 保留既有交付物；新產物只寫入指定的 `outputs/phase_NN_reverse/` 或 `outputs/phase_NN/`。不得覆寫來源或既有輸出，除非使用者明確指定。
- 缺少輸入、解析器不支援或證據不足時，記錄缺口並降低結論信心；只有阻斷必要下游工作的缺項才暫停。啟用 IO 管理時，Evaluator 依逆向 IO YAML 驗證必要產物與來源追溯。


## 一、定位

本子 Skill 在逆向工程完成後（Phase 01~03 逆向結束），以順向模式執行 Phase 04 測試驗證，整合舊專案中已有的測試檔案。

**流程位置**：Phase 01 逆向完成 → Phase 04 順向（本 Skill）→ Phase 05 → Phase 06

---

## 二、觸發條件

- 被主控 Orchestrator `@reverse` 自動調度（Phase 01 逆向完成後）
- 或手動觸發：`@reverse-test [專案路徑]`

---

## 三、執行流程

### Step 1：現有測試掃描

1. 掃描測試目錄（tests/、test/、*_test.*、test_*.*）
2. 偵測測試框架（pytest、Jest、Mocha、JUnit、Go testing）
3. 識別測試類型（單元測試、整合測試、E2E 測試）

產出：
- `existing_tests.json`：現有測試清單
- `test_framework_report.json`：測試框架偵測結果

### Step 2：測試覆蓋率分析

1. 預設不執行測試；只有使用者明確同意且隔離環境可用時才執行。不得安裝依賴、改動來源或觸碰正式服務。
2. 產生覆蓋率報告（coverage.py / Istanbul / go test -cover）
3. 識別未覆蓋的模組/函數

產出（若有授權且可執行）：
- `coverage_report.md`：覆蓋率分析報告
- `uncovered_modules.json`：未覆蓋模組清單

### Step 3：缺失測試標註

比對 `module_list.json`（Phase 03 逆向產出）與現有測試：

1. 標註有測試覆蓋的模組
2. 標註無測試覆蓋的模組
3. 標註測試品質（僅存在 vs 有斷言 vs 有邊界測試）

產出：
- `test_gap_analysis.md`：測試缺口分析
- `missing_tests.json`：缺失測試清單

### Step 4：測試報告彙整

彙整所有測試相關資訊，產出：
- `test_restoration_report.md`：測試現況整合報告

---

## 四、輸出清單

| 檔案 | 說明 |
|:-----|:-----|
| `existing_tests.json` | 現有測試清單 |
| `test_framework_report.json` | 測試框架偵測結果 |
| `coverage_report.md` | 覆蓋率分析報告 |
| `uncovered_modules.json` | 未覆蓋模組清單 |
| `test_gap_analysis.md` | 測試缺口分析 |
| `missing_tests.json` | 缺失測試清單 |
| `test_restoration_report.md` | 測試現況整合報告 |

---

## 五、錯誤處理

| 錯誤類型 | 處理方式 |
|:---------|:---------|
| 無法偵測測試框架 | 標註為未知，跳過覆蓋率分析 |
| 未獲執行授權/測試無法執行 | 僅做靜態盤點，明確標示未執行，不阻斷盤點流程 |
| 覆蓋率工具不支援 | 標註為待人工補正 |
