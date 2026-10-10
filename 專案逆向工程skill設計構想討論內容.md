# 專案逆向工程 Skill：設計構想與落地狀態

> 盤點日期：2026-10-10。本文已由 2026-07-16 的初始討論稿改寫為決策與實作狀態摘要，避免歷史提案被誤讀為目前框架行為。實際操作請以本文「目前實作」欄的框架文件為準。

## 核心目的

協助使用者從文件不完整的既有專案中，依來源證據還原程式現況、API 與資料流程、設計圖及需求候選，保留推論和未知，再由人員確認候選規格後，接回 SSDLC 順向關卡。逆向分析的產物是可追溯候選資料，不代表業務需求已核准，也不代表系統已執行或安全驗證通過。

## 設計決策與實作狀態

| 主題 | 初始構想 | 目前決策與狀態 | 依據 |
|---|---|---|---|
| 階段定位 | 新增 Phase 00，或作為六階段前置作業 | **已決定不新增 Phase 00。** 逆向工程是跨階段 Skill，沿用既有 Phase 01–06。 | [`docs/CORE_RULES.md`](docs/CORE_RULES.md)、[`skills/00_cross_phase/reverse_engineering/SKILL.md`](skills/00_cross_phase/reverse_engineering/SKILL.md) |
| 逆向順序 | 由程式碼回推六階段交付物 | **核心流程已實作：Phase 03 → 02 → 01** 蒐證並形成候選；經 Phase 01 人工確認後，才依正向關卡推進後續階段。 | [主 Skill](skills/00_cross_phase/reverse_engineering/SKILL.md)、[IO 契約](skills/00_cross_phase/reverse_engineering/io_files/) |
| 子 Skill | 建立需求、設計、程式、測試、部署、維運六個逆向子 Skill | **六個子 Skill 已建立。** Phase 04–06 僅可盤點既有測試、部署及營運素材；這不代表測試已執行、部署已驗證或正式維運已完成。 | [逆向子 Skills](skills/00_cross_phase/reverse_engineering/sub_skills/) |
| 輸入與交付物 | 收集來源碼、DDL、測試及部署材料，轉換成標準文件 | **六階段 IO YAML 均已建立**，以 `id`、`path`、`required` 描述輸入及交付物；但目前 `check_reverse_alignment.py` 指出 Phase 04–06 缺少 `phase`、`mode`、`path_base` 欄位，完整對齊尚未通過，列入待辦 #6。來源不足時保留未知；缺少 DDL 不會阻止 API 或架構候選分析，也不得捏造資料庫結構。 | [IO 契約](skills/00_cross_phase/reverse_engineering/io_files/)、[完整性檢查器](scripts/check_reverse_skill_integrity.py)、[對齊檢查器](scripts/check_reverse_alignment.py) |
| 新手引導 | 讓使用者選擇逆向範圍並補足資訊 | **`@guide reverse` 已實作。** AI 先盤點素材並提出有依據的入口候選，一輪最多問一個白話問題；「不知道」會記成未知，不要求新手先掌握技術術語。 | [引導 SOP](skills/00_cross_phase/reverse_engineering/GUIDED_REVERSE_SOP.md)、[命令文件](docs/commands_reference.md) |
| 證據與人工審核 | 自動比對產物、標出缺口並交由人員修正 | **證據分層與人工審核閘口已實作。** 程式觀察、文件契約、使用者確認、AI 推論、衝突與未知需分開記錄；需求核准前，正向規格維持候選狀態。 | [主 Skill](skills/00_cross_phase/reverse_engineering/SKILL.md)、[`docs/CORE_RULES.md`](docs/CORE_RULES.md) |
| POC 範例 | 以小型既有專案驗證流程 | **靜態流程 POC 已有案例。** 公開版整理於 [`project_demos/`](project_demos/README.md)，並已去識別化。它不驗證所有自動化構想，也不包含正式服務測試或安全核准。 | [Project Demo 索引](project_demos/README.md) |

## 初始提案的處置

以下項目曾出現在初始構想稿中，但目前不是框架已提供的功能或規則。不得在使用說明中描述成已存在：

| 初始提案 | 目前處置 | 原因／目前做法 |
|---|---|---|
| 缺少特定素材即鎖定 Skill、提供多選清單及自動衝突檢核 | **逆向專屬規則未實作** | 目前先盤點已有素材、揭露缺口與限制，再依實際階段及授權處理；未設定「沒有 DDL 就禁止設計分析」等硬性規則。一般 Skill 衝突規則仍依框架既有規範。 |
| Evaluator 自動重試三次 | **逆向專屬重試機制未實作** | 框架一般 PDCA 局部重試規則依 [`docs/CORE_RULES.md`](docs/CORE_RULES.md) 執行；逆向流程沒有額外建立初始提案中的素材缺口重試計數器或三次後自動升級機制。 |
| 自動把所有逆向交付物上傳到全域 Agent MD | **未建立逆向專屬同步器** | 一般階段檢核與報告仍依 [`docs/CORE_RULES.md`](docs/CORE_RULES.md) 的全域同步規則；逆向證據產物保存在指定專案，並以 SSOT 交接及檢查維持追溯。 |
| 逆向完成後自動切換為順向模式 | **未採用** | 進入後續階段仍受人工核准及既有階段關卡控制。 |
| 逆向專用 JSON 設定（`skillId`、`retryConfig`、`agentSync` 等） | **未採用** | 目前使用主 Skill、各階段 IO YAML、`phase_gates.json`（若專案有此欄位）及正向 SSOT；沒有上述 JSON 設定契約。 |
| AI 僅可排版，不可推演或分析 | **已由證據分層原則取代** | AI 可協助分析和提出候選推論，但必須標明證據、信心及未知；不得把推論寫成觀察事實，也不得自行核准業務規則。 |

## POC 範圍與限制

目前 POC 案例以靜態來源整理流程、設計與需求候選，並示範 DFD／STRIDE 威脅分析。檢查結果為：`check_reverse_skill_integrity.py --project "Demo Project 3"` 通過；`check_spec_integrity.py --mode D --project "Demo Project 3"` 為 23 項通過、0 項失敗（另有 Phase 02 outputs 目錄不存在的警告）；`check_reverse_alignment.py` 仍有 Phase 04–06 IO metadata 不一致，詳見待辦 #6。這些結果沒有證明以下初始檢核點已完成：自動互斥規則、逆向專屬三次重試、全域自動同步、完整六階段自動掃描或順向自動切換。POC 未執行來源系統、正式服務請求、建置、部署或資料庫連線；候選結果仍須由業務、開發、資料庫及資安負責人審閱。

公開案例只分享去識別化方法和候選情境；真實來源碼、端點、檔案路徑、行號及原始簡報不放在公開案例資料夾。

## 後續仍可評估的工作

- 若要增加自動素材檢核或重試機制，應先定義失敗分類、停止條件、人工覆核點與重跑副作用，再獨立評估。
- 若要擴充完整 Phase 04–06 的逆向盤點，須分別驗證 IO 契約與輸出品質；靜態清單不可替代真實測試、部署或營運驗證。
- 任何新增的自動同步或階段切換都須遵守專案範圍、人工核准及唯讀逆向原則。

## 歷史來源

本文件源自 2026-07-16 的逆向工程 Skill 設計討論。原提案中未採用的自動化構想保留於「初始提案的處置」作為決策紀錄；目前操作方式以本文件引用的框架規範和 Skill 為準。
