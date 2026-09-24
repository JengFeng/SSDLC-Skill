# 逆向工程 Skill 補強註記（2026-09-24）

本頁記錄本次公開修改的理由、行為與驗證結果。逆向工程分析的輸出是**候選基線**；需求層結論須由熟悉原系統的人審核。

## 修改範圍

| 檔案 | 修改註記 |
|:-----|:---------|
| `skills/00_cross_phase/reverse_engineering/SKILL.md` | 統一 Phase 03→02→01 的證據還原順序、Phase 01 人工審核閘口、Phase 04→05→06 現況盤點與進度狀態。 |
| `sub_skills/phase_01~06_*/SKILL.md` | 加入共同的來源唯讀、敏感資料保護、證據引用與不確定性標記規則；各階段補正過度推論與執行條件。 |
| `io_files/phase_01~06_reverse_io.yaml` | 對齊各階段輸入、必要產物、可選產物與缺少素材時的表示方式。 |
| `.agents/AGENTS.md`、`docs/commands_reference.md`、`README.md`、`skills/README.md` | 同步 `@reverse` 與 `@guide reverse` 的執行規則、口語觸發及使用說明。 |
| `phase_gates.json` | 說明逆向模式狀態與人工審核關卡；未經確認不得預先標記完成。 |
| `待辦事項.md`、`memory.md`、`backups/BACKUP_MANIFEST.md` | 記錄設計決策、待辦狀態與變更前備份。 |

## 行為說明

1. **來源專案唯讀**：預設只做靜態分析，不執行程式碼、測試、建置或部署，也不安裝依賴。只有使用者明確同意且隔離環境可用時，Phase 04 才能執行測試。
2. **證據與推論分開**：報告標示「觀察／推論／待確認」、來源位置、信心與限制。API 路由、資料表或架構不能直接證明業務需求或安全保證。
3. **Phase 01 人工審核**：SSOT 四規格先以候選稿產出；使用者確認前，不解鎖下游、不標記已核准、不建立已驗證 Baseline。
4. **Phase 04–06 現況盤點**：整理既有測試、部署與維運素材；缺少證據時標示未知，不產生虛構的覆蓋率、環境參數或操作步驟。
5. **敏感資料**：只記錄設定檔存在與必要的變數名稱，不讀取或輸出密鑰、憑證及個資值。
6. **可檢查的契約**：逆向 IO 範本加入 `id` 與專案相對 `path`，由 `check_spec_integrity.py --mode E` 在啟用 IO 管理時驗證。Phase 04–06 的人工核准閘口始終生效。

## 驗證與後續

- 六份 IO YAML 與 `phase_gates.json` 皆可解析；`git diff --check` 通過。
- PR 審查補強後，使用臨時專案驗證 Phase 01 待審核／已核准、IO 未啟用／已啟用，以及缺少 `spec_ref.md` 的閘口行為。
- `python scripts/check_spec_integrity.py` 全掃描結果：5 項通過、8 項缺失。缺少 `specs/features/requirements.feature` 與 00–06 階段的 `inputs/spec_ref.md`；另警告 `02_system_design/outputs` 不存在。這些是目前框架根目錄的既有缺項，尚須另行處理。
- 小型既有專案 POC 尚未執行，因此本次只驗證文件與設定一致性，尚未驗證實際專案的還原品質。
- 本次未引入 Benson Skill。
