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

## 歷史備份（已清理）

2026-07-11 執行自動清理，保留最新 5 份，刪除 36 個舊版備份。
原始備份涵蓋 2026-06-27 ~ 2026-07-08 期間的框架建置階段調整紀錄。

## 2026-10-10 備份紀錄補充

`threat-modeling` Skill 與索引更新未建立 pre-change 備份。執行時工作樹已有其他未提交變更，為避免把混合狀態誤記為修改前快照，保留目前內容並以 Git 差異追溯。本次未執行 `@optimize`。
