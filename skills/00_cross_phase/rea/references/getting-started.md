# REA 新手使用指南：沒有原始碼也能開始

## 先準備什麼

建立一個獨立案例目錄，例如 `E:/legacy-review`，將可分享的成品、已去識別化紀錄及操作文件放在 `inputs/`。不用先提供完整資料；只有一份 DLL、HAR、手冊或可操作畫面也可開始。保留原始成品，記錄產品版本與取得日期，不要把分析結果寫回目標安裝目錄。

- 有 DLL／EXE／APK／ASAR：先辨識格式，AI 才能選適用分析引擎。
- 有 HAR：這是已儲存的網路請求與回應紀錄，先移除憑證、個資與敏感內容。
- 只有 UI／遠端服務：先說明環境與允許操作；沒有 binary 時不強制 REA。
- 只有文件：先整理文件宣稱與未知，不需要為了開始而安裝 REA。

## 複製這段給 AI

以下是 SSDLC 代理對話指令，不是 PowerShell 命令。請在能讀取本框架與案例目錄的 AI 對話中使用：

```text
@guide reverse E:/legacy-review
這個系統完全沒有原始碼，只有 inputs 裡的 DLL、已去識別化 HAR 和操作手冊。
請依 SSDLC 的 REA Skill 引導我，先盤點來源與版本，只做離線分析。
先幫我理解「登入後查看及匯出自己的資料」這個操作。
缺資料時列為未知；不要啟動程式或重送請求。
```

不知道技術格式或入口也可以說「不知道」。AI 應先檢視材料，逐次只追問最重要的一項缺口，不要求新手先找 Controller、函式或資料表。

如只想整理實作證據，改用 `@reverse-code E:/legacy-review`。如希望建立威脅模型，加上「請建立威脅模型」；這會使威脅模型成為必要交付物，但不自動啟用安全基準。

## 接下來會發生什麼

| 步驟 | AI 工作 | 新手需要確認 |
|---|---|---|
| 來源盤點 | 建立來源 manifest、指紋與操作範圍 | 產品版本、要理解的功能；可回答不知道 |
| 工具準備 | 判斷是否需要 REA、Node 與個別引擎 | 既有允許範圍外的安裝或執行操作 |
| Phase 03 | 成品／紀錄蒐證，保存來源及未知 | 查看能證明與不能證明的項目 |
| Phase 02 | 外部資料流、設計候選；必要時建模 | 確認範圍、角色與關鍵資產 |
| Phase 01 | 需求候選、衝突與追溯整理 | 審閱候選，明確核准後才進正式規格 |

工具缺失、格式不支援或內容混淆時，先交付可取得證據與限制，不宣稱已完整還原。選用 REA 不代表一定可以重新取得原始碼或直接修補第三方軟體。

## 到哪裡看結果

案例內 `outputs/phase_03_reverse/` 包含來源分析及四份無原始碼交付資料：

| 檔案 | 白話用途 |
|---|---|
| `evidence_manifest.json` | 每項證據來自哪裡、哪個版本、怎麼取得 |
| `findings_index.json` | 分析發現與來源證據的對照 |
| `unknowns.json` | 尚未知道什麼，以及哪些未知已取得支持證據 |
| `coverage.json` | 各產物有足夠、部分或不足證據的理由 |

Phase 02 的設計候選在 `outputs/phase_02_reverse/`，另有自己的 coverage.json；必要模型在同目錄 threat_model.md。內部服務或 DB 不可見時可以保持黑箱；空清單不代表系統沒有功能。

Evidence ID 是證據編號；DFD 是資料流圖；coverage 是分析覆蓋說明；unknown 是待確認問題。這些都不等於漏洞已證實、控制通過或階段核准。

## 如何檢查交付資料

以下才是在 SSDLC 框架根目錄執行的 PowerShell 命令：

```powershell
python scripts/check_no_source_evidence.py --project 'E:/legacy-review' --inputs-only
python scripts/check_no_source_evidence.py --project 'E:/legacy-review' --phase 03
python scripts/check_no_source_evidence.py --project 'E:/legacy-review' --phase 02
```

第一行在來源準備後執行；第二行在 Phase 03 交付後執行；第三行在 Phase 02 交付後執行。尚未產生資料時不要把缺檔當成 REA 安裝失敗。靜態檢查通過只表示契約可追溯，仍需審閱內容與按關卡驗證。

## runtime 尚未安裝怎麼辦

本框架提供整合 Skill，沒有自動安裝 REA runtime／MCP／外部引擎。先由 AI 核對格式與環境，再按 [provider 操作與契約](provider-contract.md) 使用固定版本 CLI。一般離線 HAR／managed .NET 為第一輪優先；其他格式與平台需確認支援，未支援不要硬套。

只要讀取現有產物與檢查契約，不需要先安裝 REA。請勿將未經檢查的 HAR 或真實秘密上傳 GitHub；分析摘要也可能被傳送至模型提供者。
