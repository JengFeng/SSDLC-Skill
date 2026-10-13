# 專案開發規則與防線規範 (AGENTS.md)

👉 **最高指導框架原則**：本專案在自動化開發與 Harness 駕馭工程中的最高原則規範，已統一收錄於 docs 目錄下的 [CORE_RULES.md](docs/CORE_RULES.md)。

本專案的全局連貫性大循環、組態管理、測試同步與 AI 代理對話指令協定，已統一收錄於專案規章中：

👉 **請讀取詳細規章**：[.agents/AGENTS.md](.agents/AGENTS.md)

所有 AI 代理與治具系統，執行任務前必須強制讀取上述路徑之規章，並嚴格遵循「對話指令協議」來執行專案初始化、查詢與 Skill 導入。

> **規格監控**：執行 `python scripts/check_spec_integrity.py` 進行預設 Mode D 全掃描（包含 A/B/C 檢查）；逆向工程依 [.agents/AGENTS.md](.agents/AGENTS.md) 的規範另以 `--mode E --phase NN --project <專案路徑>` 檢查 IO 契約與人工審核閘口。AI 代理執行前必須讀取該文件第二章 2.4「SSOT 完整性監控機制」。

> **文件與程式碼規範對齊**：框架規則以 [CORE_RULES.md](docs/CORE_RULES.md) 為準；修改指令或跨階段 Skill 時，應依 [Harness Optimization](docs/Harness_Optimization_SKILL.md) 核對 `.agents/AGENTS.md`、`docs/commands_reference.md`、`README.md`、Skill、IO 範本及檢查腳本。逆向工程的靜態對齊檢查可執行 `python scripts/check_reverse_alignment.py`。

> **記憶落實**：當專案進行框架檔案優化、規則調整或修正紀錄時，AI 代理應同步更新 `memory.md` 並於 [backups/BACKUP_MANIFEST.md](backups/BACKUP_MANIFEST.md) 補列最新備份歷程，確保後續執行時能快速回溯本次調整方向、原因與影響範圍。

## 威脅建模重要交付規範：代碼中文對照清單

每次建立、更新或審查威脅模型，必須在交付分析成果前主動建立／更新完整「代碼與中文說明對照清單」，不得等待使用者追問。依 [威脅建模 Skill 重要規範](skills/02_system_design/threat-modeling/SKILL.md#重要規範完整代碼與中文說明對照清單必須交付) 執行：

- 逐項說明文件、圖表與追溯表實際使用的 ID、STRIDE 分類與組合、API 結果碼、重要欄位／類別及縮寫，不能只解釋前綴。
- 每項包含代碼原文、分類、中文名稱與白話用途、本案對應行為、來源位置及候選／未知／未驗證限制。
- 預設在模型交付目錄建立 `code_glossary.md`；已有專案清單則沿用更新。模型、成果 README／導覽及最終交付回覆須提供可點擊連結與檔案位置。
- 交付前核對所有實際 ID，並檢查縮寫與重要名稱的語意完整性。缺清單、漏列或定義矛盾時，補齊後再交付；新增、改名或退役同步維護，保留歷史說明。

此規範適用新建、逆向、變更與審查；清單完整不代表威脅確認、控制驗證、需求或階段核准。檢查腳本通過也不能代替此項交付審查。
