# BACKUP_MANIFEST.md — 備份清單

> 本文件由 AI 代理自動維護，記錄 `backups/` 目錄中的備份歷程。

## 備份規則

- **觸發時機**：每次 `@optimize`（含 `--incremental`、`--files`）執行前自動觸發
- **備份對象**：框架核心檔案（AGENTS.md、CORE_RULES.md、commands_reference.md、README.md、SKILLS歸類.md、skills/README.md）
- **命名規則**：`{原檔名}.backup.{YYYYMMDD-HHmmss}`
- **保留策略**：最多 **5 份**，超過自動刪除最舊的
- **手動備份**：可透過 `@backup` 指令手動觸發

## 目前保留的備份

| 檔案 | 建立時間 | 用途 |
|:-----|:---------|:-----|
| memory.md.prehotfix10 | 2026-07-08 | 第十次修正前備份 |
| memory.md.prehotfix9 | 2026-07-08 | 第九次修正前備份 |
| TEMPLATE_SKILL.md.prehotfix4 | 2026-07-08 | 第四次修正前備份 |
| skills_README.md.prehotfix5 | 2026-07-07 | 第五次修正前備份 |
| executable_spec.yaml.backup.20260925-121457 | 2026-09-25 | 加入檢查器相容投影欄位前的 SSOT 母版 |
| check_spec_integrity.py.backup.20260925-121457 | 2026-09-25 | 修正四規格摘要與中文標題追溯前的完整性檢查器 |
| specs_README.md.backup.20260925-121457 | 2026-09-25 | 補充 SSOT 相容投影說明前的框架規格說明 |
| check_spec_integrity.py.backup.20260925-135234 | 2026-09-25 | 接入每階段唯讀對齊鉤子前的檢查器 |
| agents_AGENTS.md.backup.20260925-135740 | 2026-09-25 | 加入逆向轉正向專案執行前對齊關卡前的代理規章 |
| reverse_skill_before_alignment_20260925/ | 2026-09-25 | 逆向主 Skill、六個子 Skill、IO 契約及框架說明與技能歸類在順序與證據規則修正前的版本 |
| guided_reverse_before_update_20261010/ | 2026-10-10 | 新手引導式通用逆向 SOP 調整前，定點保存主 Skill、@guide 規章、指令參照、README、memory 與備份清單 |
| threat-modeling_before_owasp_community_sync_20261010/ | 2026-10-10 | threat-modeling Skill 與來源整理加入使用者指定 OWASP 官方社群頁面前的版本 |
| reverse_io_metadata_before_fix_20261010/ | 2026-10-10 | Phase 04–06 逆向 IO YAML 補齊 phase/mode/path_base 對齊欄位前的版本 |
| check_spec_integrity.py.backup.20261010-phase02-mermaid | 2026-10-10 | Mermaid 目錄檢查依 Phase 02 pending 狀態調整前的完整性檢查器 |

## 歷史備份（已清理）

2026-07-11 執行自動清理，保留最新 5 份，刪除 36 個舊版備份。
原始備份涵蓋 2026-06-27 ~ 2026-07-08 期間的框架建置階段調整紀錄。

## 2026-10-10 備份紀錄補充

`threat-modeling` Skill 與索引更新未建立 pre-change 備份。執行時工作樹已有其他未提交變更，為避免把混合狀態誤記為修改前快照，保留目前內容並以 Git 差異追溯。本次未執行 `@optimize`。


## 2026-10-13 威脅建模預覽整併前備份

`threat-modeling-preview-before.zip` 保存本次修改前的 Skill、六階段模板、核心規章、SSOT、設定、完整性檢查、逆向契約與記憶／manifest。來源 commit：`ca460180fc20b9b7ff55ce3b200bd660d8982ce5`。用途：本機預覽差異審閱與回溯，不代表六階段專案 Baseline 或階段核准。


## 2026-10-13 README／Mermaid 修正前備份

`threat-model-docs-mermaid-before.zip` 保存 README、App／API 資料流程圖、預覽模型及修正前 memory／manifest。來源：main 的 `1b22a5b`。用途：文件更新紀錄與 Mermaid 節點語法修正的回溯。

## 2026-10-13 REA／無原始碼整合前備份

`rea-no-source-before.zip` 保存此次修改前框架規章、Skill、IO、檢查腳本、索引及 memory／manifest。來源 commit：8e474ee5e736eb2d05ef028a0e112a66820b8960。此為本機框架修改回溯資料（ZIP 依既有規則不入 Git），不代表案例階段 Baseline。


## 2026-10-13 威脅建模主要參考文件同步前備份

`threat-model-glossary-reference-before-20261013-152410.zip` 保存本次規範、範本、主要參考文件、記憶及備份清單的修改前工作區版本。ZIP 保留本機；Git 差異可追溯發布內容。發布使用獨立 worktree，保留原工作區 REA 與案例資料，不宣稱案例 Baseline 或階段核准。

## 2026-10-13 建模面向與分析維度更新前備份

`threat-model-dimensions-before-20261013.zip` 保存本次 14 份既有文件更新前內容，來源 commit：`1c7af61d68b5bee1acd651d942191d1915fe328b`（承接 main 與代碼清單規則）。ZIP 本機留存依既有排除規則不入 Git；新增 modeling-dimensions.md 可由本次提交追溯。不代表案例 Baseline 或階段核准。


## 2026-10-13 威脅建模代碼中文對照規範修改前備份（歷史補登）

`threat-model-glossary-before-20261013-142451.zip` 保存首次加入「完整代碼中文清單必須在分析交付前建立並提供查閱入口」規則前的八份工作區文件。備份包含既有未提交變更，不代表乾淨 Git 基線、案例 Baseline 或階段核准。首次修改當時未推送；後續規範已隨 [PR #11](https://github.com/JengFeng/SSDLC-Skill/pull/11) 合併 main。

本機實體：`E:\00AI協作\SSDLC-skill\backups\threat-model-glossary-before-20261013-142451.zip`。ZIP 依既有規則不入 Git；遠端只有歷程紀錄，不含備份實體。

| ZIP 項目順序 | 原始檔案位置 |
|---|---|
| 1 | `skills/02_system_design/threat-modeling/SKILL.md` |
| 2 | `skills/02_system_design/threat-modeling/references/deliverable-template.md` |
| 3 | `skills/02_system_design/threat-modeling/references/risk-and-review.md` |
| 4 | `skills/00_cross_phase/reverse_engineering/sub_skills/phase_02_design_restore/SKILL.md` |
| 5 | `skills/README.md` |
| 6 | `README.md` |
| 7 | `memory.md` |
| 8 | `backups/BACKUP_MANIFEST.md` |

ZIP SHA-256：`79e52cb12279503869da99fd78a8d7e8badf1a22463be4a9c37a94ab31a84a43`。本次以 ZIP 逐項內容確認順序並通過壓縮完整性檢查。

**還原限制**：此 ZIP 未保留目錄層級，含兩個 `SKILL.md` 及兩個 `README.md`；直接解壓縮可能覆蓋同名檔案。還原須依 ZIP 項目順序與內容辨識，逐項放回上表原始路徑，不能僅按檔名取得內容。這是修改前歷史版本，不應覆蓋 main 的更新版本。

## 2026-10-13 歷史記憶與備份清單補登前備份

`glossary-history-before-20261013.zip` 保存本次補登前的 `memory.md` 與 `backups/BACKUP_MANIFEST.md`，保留原始路徑。本機位於 `E:\00AI協作\SSDLC-backup-history\backups\`，依既有規則不入 Git。此次只補歷史與查閱限制，不修改 Skill 或案例。
