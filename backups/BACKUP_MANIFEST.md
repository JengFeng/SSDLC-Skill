# Backups Manifest（備份說明）

本資料夾集中保存 2026-07-07 文件一致性修正過程中的備份檔案，方便之後回溯對應版本。

## 一、本次修正背景
本次修正主要處理跨文件不一致問題，包含：
- 追溯矩陣檔名統一（`requirement_tracker.md` → `traceability_matrix.md`）
- Windows 絕對路徑改為 repo 內相對路徑
- Baseline 命名與保留規則統一
- 第六階段名稱統一為「維護與營運」
- Harness / Template / Skills 文件內容對齊
- 根目錄 `AGENTS.md` 與 `.agents/AGENTS.md` 規則指向修正

## 二、備份歷史紀錄
以下是本次修正過程中建立的備份檔案清單，依時間與用途整理，方便之後對應 Commit 或問題回溯。

### 2-1. 核心規則與腳本備份
- .agents/AGENTS.prehotfix8：.agents/AGENTS.md 第四次備份（CORE_RULES.md 相對路徑修正前，2026-07-08）
- AGENTS_root.prehotfix7：根目錄 AGENTS.md 第三次備份（新增記憶落實條款前，2026-07-08）
- `README.md.bk`：根目錄 README 初版備份
- `AGENTS_root.md.bk`：根目錄 `AGENTS.md` 初版備份
- `AGENTS_root.md.bk2`：根目錄 `AGENTS.md` 第二次備份（修正規格監控指向前）
- `.agents/AGENTS.md.bk`：`.agents/AGENTS.md` 初版備份
- `docs/CORE_RULES.md.bk`：`CORE_RULES.md` 初版備份
- `scripts/check_spec_integrity.py.bk`：`check_spec_integrity.py` 初版備份
- `demo_project/01_planning_and_analysis/reg/requirement_tracker.md.bk`：舊追溯矩陣備份

### 2-2. Docs 修正前備份
- `docs/commands_reference.md.prehotfix`：第一次修正前備份
- `docs/commands_reference.md.prehotfix2`：第二次修正前備份
- `docs/TEMPLATE_SKILL.md.prehotfix`：第一次修正前備份
- `docs/TEMPLATE_SKILL.md.prehotfix2`：第二次修正前備份
- `docs/TEMPLATE_SKILL.md.prehotfix3`：第三次修正前備份
- `docs/Harness_Optimization_SKILL.md.prehotfix`：第一次修正前備份
- `docs/Harness_Optimization_SKILL.md.prehotfix3`：第三次修正前備份
- `docs/Harness_Optimization_SKILL.md.prehotfix4`：第四次修正前備份（語氣規則調整前）

### 2-3. Skills 文件修正前備份
- `skills/README.md.prehotfix`：第一次修正前備份
- `skills/README.md.prehotfix2`：第二次修正前備份（路徑轉換前）
- `skills/SKILLS歸類.md.prehotfix`：第一次修正前備份
- `skills/SKILLS歸類.md.prehotfix2`：第二次修正前備份（SOP 範例調整前）

## 三、備份使用方式
若之後需要回溯：
1. 先於本資料夾找到對應檔案名稱與日期。
2. 以 `.prehotfix`、`.prehotfix2`、`.bk`、`.bk2` 的版本順序判斷時間線。
3. 需要比對差異時，可直接對照目前正式檔案內容與備份內容。

## 四、後續建議
- 若專案持續演進，建議日後重大文件調整前也比照本模式建立 `prehotfix` 備份。
- 若未來需要清理，可優先保留：
  - 最新版 `.bk` / `.bk2`
  - 最後一輪 `.prehotfix` 版本
- 為避免混淆，建議不要同時保留過多中間版本，除非需要完整歷史。



- backups/.agents_skills_00_cross_phase_SKILL.md.prehotfix9：對應檔案修正前備份（2026-07-08）
- backups/.agents_skills_01_planning_and_analysis_SKILL.md.prehotfix9：對應檔案修正前備份（2026-07-08）
- backups/.agents_skills_02_system_design_SKILL.md.prehotfix9：對應檔案修正前備份（2026-07-08）
- backups/.agents_skills_03_implementation_and_coding_SKILL.md.prehotfix9：對應檔案修正前備份（2026-07-08）
- backups/.agents_skills_04_testing_SKILL.md.prehotfix9：對應檔案修正前備份（2026-07-08）
- backups/.agents_skills_05_deployment_SKILL.md.prehotfix9：對應檔案修正前備份（2026-07-08）
- backups/.agents_skills_06_maintenance_SKILL.md.prehotfix9：對應檔案修正前備份（2026-07-08）
- backups/demo_project_.agents_skills_01_planning_and_analysis_SKILL.md.prehotfix9：對應檔案修正前備份（2026-07-08）
- backups/demo_project_.agents_skills_03_implementation_and_coding_SKILL.md.prehotfix9：對應檔案修正前備份（2026-07-08）
- backups/demo_project_.agents_skills_04_testing_SKILL.md.prehotfix9：對應檔案修正前備份（2026-07-08）
- backups/demo_project_.agents_skills_05_deployment_SKILL.md.prehotfix9：對應檔案修正前備份（2026-07-08）
- backups/demo_project_.agents_skills_06_maintenance_SKILL.md.prehotfix9：對應檔案修正前備份（2026-07-08）
- backups/memory.md.prehotfix9：對應檔案修正前備份（2026-07-08）
- backups/demo_project_.agents_AGENTS.md.prehotfix10：對應檔案修正前備份（2026-07-08）
- backups/memory.md.prehotfix10：對應檔案修正前備份（2026-07-08）
