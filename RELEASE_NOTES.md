# v1.2.0：文件一致性與連結治理強化

## 版本重點
本次發布聚焦於 SSDLC 框架文件一致性治理，主要處理跨文件連結失效、名詞混用、章節編號衝突與規則邊界不清等問題，提升後續 AI 代理解讀準確度與維護穩定性。

## 本次重點調整
- 統一追溯矩陣名稱為 `traceability_matrix.md`
- 移除 Windows 絕對路徑 `file:///d:/...`，改為 repo 內相對路徑
- 修正 `.agents/skills/` 與 `demo_project/.agents/` 的跨目錄連結
- 統一第六階段名稱為「維護與營運」
- 統一 baseline 命名、保留策略與技術棧描述用語
- 補強 `AGENTS.md` 記憶落實條款，要求後續優化同步更新 `memory.md` 與 `backups/BACKUP_MANIFEST.md`
- 刪除舊檔 `demo_project/01_planning_and_analysis/reg/requirement_tracker.md`，備份保留於 `backups/`

## 主要異動檔案
- `.agents/AGENTS.md`
- `.agents/skills/*/SKILL.md`
- `AGENTS.md`
- `README.md`
- `demo_project/.agents/AGENTS.md`
- `demo_project/.agents/skills/*/SKILL.md`
- `docs/CORE_RULES.md`
- `docs/Harness_Optimization_SKILL.md`
- `docs/TEMPLATE_SKILL.md`
- `docs/commands_reference.md`
- `memory.md`
- `backups/BACKUP_MANIFEST.md`
- `scripts/check_spec_integrity.py`
- `skills/README.md`
- `skills/SKILLS歸類.md`
- `specs/README.md`

## 本次納入的備份紀錄
本次同步提交所有調整備份，包含：
- `.bk / .bk2 / prehotfix*` 系列備份
- `backups/BACKUP_MANIFEST.md`
- 舊追溯矩陣備份 `requirement_tracker.md.bk`

## 建議後續動作
- 後續若持續調整框架文件，建議維持「先備份、再修正、再補 manifest」的流程
- 若日後希望 repo 更精簡，可考慮將歷史備份移到 release 附件或獨立備份分支
- `memory.md` 已補入歷史脈絡說明，建議持續作為 AI 代理執行上下文參考檔

## 對應 Commit
- 主要提交：`docs: AGENTS/Skills/Docs 連結與規則對齊`
- HEAD：`57e7fa21dd3f0b8338b1a57a81f9a0e26d54bafe`
