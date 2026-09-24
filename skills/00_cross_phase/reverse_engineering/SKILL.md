---
name: ReverseEngineering
description: 對既有專案進行唯讀證據分析，依 Phase 03→02→01 還原可追溯的程式、設計與需求基線，再經使用者確認後選擇性整理 Phase 04→05→06 的測試、部署與維運現況。
---

# 逆向工程 Reverse Engineering — 主控 Orchestrator

## 一、定位與適用範圍

本 Skill 分析既有專案並產生可追溯的文件基線；它不宣稱能從程式碼確定原始商業意圖。`00_cross_phase` 是目錄分類，不建立 Phase 00。預設來源唯讀，輸出隔離於指定專案的 `outputs/`。不引入 Benson Skill 或其內容。

## 二、觸發與啟動

- 指令：`@reverse <專案路徑> [--phase 03,02,01,04,05,06]`；未指定階段時執行完整流程。
- 口語：「逆向分析這個專案」「幫我從程式碼反推需求」「還原舊專案文件」。
- 不用於新專案從零規劃、單純程式碼審查或只要求修 Bug。
- 開始前確認來源路徑可讀、輸出路徑、排除目錄、可用素材及是否允許執行測試（預設不允許）。不要求使用者重述可由檔案判定的資訊。
- 不覆寫來源或已有產物；遇到同名輸出先採用新版本/新目錄並報告。執行 `--phase 04`、`05`、`06` 或相應單階段指令前，一律先以 `python scripts/check_spec_integrity.py --project <專案路徑> --mode E --phase NN` 驗證人工審核閘口；未核准即拒絕執行。

## 三、流程與人工關卡

1. **Phase 03 程式碼盤點**：靜態、唯讀掃描；產出清單及來源證據。
2. **Phase 02 設計還原**：只從已盤點證據形成設計描述，明示推論及不確定性。
3. **Phase 01 需求基線**：從可觀察行為和設計推導候選需求，產出 SSOT 草案與追溯鏈。
4. **強制人工審核閘口**：呈現需求、信心、缺口與推論；使用者確認前不得標記 Phase 01 完成、建立已驗證 Baseline、解鎖下游或自動進入 Phase 04。
5. **Phase 04、05、06**：經確認後依序盤點測試、部署、運維現況；是現況盤點，不代表執行測試、部署或修改系統。每階段完成後依正常 Evaluator 與專案規章檢查。
6. **交接**：保留逆向模式標記及證據鏈，只有使用者確認的需求才可作為已核准 SSOT；其餘維持候選/待確認。由使用者決定何時開始一般順向 SSDLC 變更。

可指定階段做局部盤點；Phase 02/01 若其上游產物不足，必須標示輸入缺口，不可假稱完整。

## 四、輸出與追溯要求

每階段輸出至 `outputs/phase_NN_reverse/`（Phase 04–06 為 `outputs/phase_NN/`），依各子 Skill 的產物清單工作；當 `phase_gates.json` 的 `io_management.enabled=true` 時，以對應逆向 IO YAML 的 `id`/`path`/`required` 契約檢查產物及跨階段引用。IO 管理未啟用時不以缺少契約產物阻斷流程，但人工審核閘口仍強制生效。每份報告包含範圍、掃描時間、排除項、方法、證據引用、觀察/推論/待確認、限制與未解析項。跨階段以穩定 ID 對應：程式符號/端點/資料表 → 設計元素 → 候選需求 → 測試/部署/運維證據。無證據的欄位明確留空或標示未知，不捏造。

## 五、狀態管理、錯誤與停止

更新專案 `phase_gates.json` 的 `reverse_engineering` 狀態（enabled、mode、current_phase、completed_phases、approval_status、approved_at）；僅在專案內檔案已存在且使用者授權修改專案追蹤狀態時更新。`approval_status` 為 `not_started`、`pending`、`approved` 或 `rejected`；產出候選需求後設為 `pending`，只在使用者明確確認後設為 `approved`，並把相同 `approved_at` 寫入 `outputs/phase_01_reverse/reverse_completion_summary.json`。拒絕時設為 `rejected` 並清除核准時間；重新修訂則回到 `pending`。不得直接把所有六階段標為 completed；Phase 01 只在核准後加入 completed_phases。`@reverse status` 唯讀顯示狀態；`@reverse stop` 停止後續工作並保留已產生檔案。

遵循 CORE_RULES 的 A/B 分級與重試上限。證據不足或外部工具不可用是限制，不得以重試掩飾；需求/設計矛盾列為待釐清。

## 六、框架整合

- 各子 Skill 遵循 Planner → Generator → Evaluator；Evaluator 驗證產物、來源證據與 SSOT 交叉一致性；啟用 IO 管理時執行 `check_spec_integrity.py --mode E` 驗證逆向 IO YAML。
- Phase 01 四規格完成後執行 `@CheckSpec`；任何未通過項不標記為通過。人工核准後建立 Phase 04–06 的 `inputs/spec_ref.md`，指向已核准的 SSOT；若有既存規格，先比對再更新，不直接覆寫。
- 使用者確認前，產物是逆向候選基線；確認後依專案規章執行必要的 SSOT 完整性檢查與 Baseline 流程。
- Security-Principles 可用於後續安全檢核；靜態掃描只能記錄可見證據，不代表已完成安全驗證。

## 七、範例

```text
@reverse D:/legacy_app
@reverse D:/legacy_app --phase 03,02
@reverse status
@reverse stop
```
