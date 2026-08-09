---
name: Reverse_Skill_TestRestore
description: Phase 04 順向整合 — 逆向工程完成後，整合現有測試檔案，分析測試覆蓋率，標註缺失測試點。
---

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

1. 執行現有測試（若可執行）
2. 產生覆蓋率報告（coverage.py / Istanbul / go test -cover）
3. 識別未覆蓋的模組/函數

產出：
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

### Step 4：測試報告測試報告彙整

彙整所有測試相關資訊，產出：
- `test_restoration_report.md`：測試逆向整合報告

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
| `test_restoration_report.md` | 測試逆向整合報告 |

---

## 五、錯誤處理

| 錯誤類型 | 處理方式 |
|:---------|:---------|
| 無法偵測測試框架 | 標註為未知，跳過覆蓋率分析 |
| 測試無法執行 | 僅做靜態分析，不阻斷流程 |
| 覆蓋率工具不支援 | 標註為待人工補正 |
