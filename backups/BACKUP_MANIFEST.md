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
| `reverse_engineering_pre_20260924-153000/`（20 檔） | 2026-09-24 | 本機逆向工程 Skill 補強前備份；保留原目錄結構，不納入公開提交 |

## 歷史備份（已清理）

2026-07-11 執行自動清理，保留最新 5 份，刪除 36 個舊版備份。
原始備份涵蓋 2026-06-27 ~ 2026-07-08 期間的框架建置階段調整紀錄。
