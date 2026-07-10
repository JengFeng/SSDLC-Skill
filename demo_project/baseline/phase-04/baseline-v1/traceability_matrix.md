# 需求追溯矩陣 (RTM)

> 專案初始化後由 AI 代理自動填入。本檔案記錄需求從規劃到部署的完整追溯鏈。
> 最後更新：2026-07-10（Phase 01 重新分析 + Phase 02 設計產出第二次重新生成 + SRS REQ-004 修復 + Phase 03 程式碼品質改善）

---

## 一、 需求追溯表

| 編號 | 原始輸入 | 規格 (01) | 設計 (02) | 實作 (03) | 測試 (04) | 部署 (05) | 維護 (06) | 狀態 |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| REQ-001 | user_requirement_raw.md | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | 🔄 進行中 |
| REQ-002 | user_requirement_raw.md | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | 🔄 進行中 |
| REQ-003 | user_requirement_raw.md | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | 🔄 進行中 |
| REQ-004 | user_requirement_raw.md | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | 🔄 進行中 |
| REQ-005 | user_requirement_raw.md | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | 🔄 進行中 |
| REQ-006 | user_requirement_raw.md | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | 🔄 進行中 |
| REQ-007 | user_requirement_raw.md | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | 🔄 進行中 |

## 二、 待確認事項 (Open Items) 追溯

| 編號 | 事項 | 優先級 | 確認結果 | 更新日期 |
|:---|:---|:---|:---|:---|
| OI-001 | AD 連線參數 | P0 | ⏳ 待 IT 確認 | 2026-07-10 |
| OI-002 | 附件儲存方式 | P0 | ✅ 檔案伺服器 | 2026-07-10 |
| OI-003 | 薪資系統介接 | P1 | ✅ 僅欄位管理，不介接 | 2026-07-10 |
| OI-004 | 高階主管界定 | P0 | ✅ 處長以上 | 2026-07-10 |
| OI-005 | 員工規模 | P1 | ✅ 小型企業（<50人） | 2026-07-10 |
| OI-006 | 排班系統介接 | P2 | ✅ 不需要介接 | 2026-07-10 |

## 三、 Skill 導入記錄

| 日期 | 指令 | Skill |
|:---|:---|:---|
| 2026-06-29 | @init | Security-Principles（資安防護基準，普級 general） |
| 2026-06-29 | @02/04,05,08,10,11,12,13,17 | brand-guidelines + canvas-design + frontend-design + mermaid + openapi_generator + plantuml + prisma + theme-factory |
| 2026-06-29 | @03/03,13,14,15 | code-simplifier + prettier + project-dashboard + project-dev-manager |
| 2026-06-29 | @04/01,04,05,09,10,11 | coverage_py + playwright + pytest + sonarqube + systematic-debugging + webapp-testing |
| 2026-07-10 | — | 移除 sa-design（Benson 敏感來源清理） |

## 四、 階段傳遞鏈

| 傳遞 | 上游產出 | 下游輸入 | 狀態 |
|:---|:---|:---|:---|
| 01→02 | formal_requirements.md | api_spec.md / db_schema.sql | ✅ |
| 02→03 | api_spec.md / db_schema.sql | app.py / models.py | ✅ |
| 03→04 | app.py / 全模組 | test_employee_crud.py / test_ui.py | ✅ |
| 04→05 | 測試通過報告 | deployment_guide.md / run.bat | ⬜ 尚未執行 |
| 05→06 | 部署上線 | operations_manual.md / backup.py | ⬜ 尚未執行 |

## 五、 重新分析紀錄

| 日期 | 操作 | 說明 |
|:---|:---|:---|
| 2026-07-10 | Phase 01 重新分析 | 依據使用者指示，重新由 inputs 子目錄原始需求進行分析 |
| 2026-07-10 | 待確認事項確認 | 使用者確認 5/6 項待確認事項，1 項待 IT 確認 |
| 2026-07-10 | Phase 02 設計產出第二次重新生成 | 依據 SSOT 與 Phase 01 重新分析結果，第二次重新生成 7 項標準設計交付物 |
| 2026-07-10 | SRS REQ-004 修復 | 補充 system_specification.md 中缺失的 REQ-004 詳細說明章節 |
| 2026-07-10 | Phase 03 程式碼品質改善（完成） | 依據代碼審查報告，導入 CSRF 保護、速率限制、結構化日誌、修正明確匯入、補充型別提示 |
| 2026-07-10 | Phase 04 單元測試（補強完成） | 執行 API 單元測試（pytest），補強測試資料後 38/38 全部通過（100%） |
