---
name: project-dashboard
description: 為單一專案產出「互動式進度儀表板」(WBS + 甘特 + 達成率 + 缺漏 + 專案資產 + 資料夾健檢)。當使用者說「做專案儀表板」「更新 XX 儀表板」「這個專案現在做到哪」「專案總表」「進度儀表板」「WBS 甘特」，或要把某個專案資料夾的現況可視化、定期追蹤推進時啟用。核心：掃資料夾 + 讀工作計畫書抽 WBS + 讀 EKB 會議，比對算出達成/缺漏，產暖色互動 HTML 掛到 your-server.example.com。可隨叫隨跑或排程每週自動跑。
---

# 專案進度儀表板 skill

把「一個專案資料夾」變成一頁互動式 HTML 儀表板，讓 Benson **不用翻所有檔案**就知道：今年該做哪些系統(WBS)、達成多少、缺什麼、手邊有哪些資產、資料夾擺得對不對。

> 由來：2026-06-14 與 Benson 從航空城案磨出來的。**鐵則見 memory [[project-status-dashboard]]**：要「掃描+比對+產表」，不要會議記錄彙整；骨架一律錨定他自己的工作計畫書/合約，不可 AI 自己編（他最恨驗證 AI 編的東西）。

## 輸入
- `專案資料夾路徑`（必要，例：`Z:\0.3.我的專案計畫\2026\115 航空城`）
- 該專案的 EKB 名稱 / `eip_project_id`（選用，用來撈會議與決策；不確定就用專案名 q= 搜尋）

## 產出 + 託管架構（定案 2026-06-14）

**規則：一專案 = 一頁(看) + 一檔(改)。** 20+ 個案全照這套，不做迷宮。

- 🏠 **入口 = EKB「00 {專案}」hub 筆記**（航空城＝note #140，eip 各案有對應 hub note）。這是 Benson「找得到」的入口。內容＝①一句話現況+燈號 ②📊「開啟戰情室」大按鈕(連 hosted HTML) ③📋執行紀錄(每週跑完追加一行：日期+做了什麼) ④維護說明(指向 _WBS.md)。**hub 筆記不放完整互動內容**（EKB 筆記不跑 JS），只當入口+連結+紀錄。
- 📊 **儀表板 = 自包含互動 HTML**（暖色、無左色條、分頁：WBS可展開／甘特／缺漏／團隊／專案資產／🩺資料夾健檢）。**名稱用「專案進度儀表板」，不要叫「戰情室」(Benson 嫌中二)。**
- 🔒 **託管：用 `Y:\EIP\ekb\pm.php`（已建）+ `storage/pm/{eip_project_id}.html`**。
  - 部署＝把產好的 HTML 覆蓋到 `Y:\EIP\ekb\storage\pm\{eip_project_id}.html`（覆蓋即更新，網址固定不變）。
  - 網址＝`pm.php?id={eip_project_id}`（有 EIP 編號）**或** `pm.php?p={短代號}`（沒編號的案，檔名 `storage/pm/{代號}.html`）。pm.php 沿用 EKB Google 登入(`EKBAuth::requireWebSession`)＝**有認證**、送 no-cache、PHP 直接 echo HTML(手機可渲染、非下載)。
  - **不是每個案都要做**：只對「想追蹤的大案/在跑的案」做(Benson 不會 20+ 案全套)；也不是每案都有 eip_project_id，所以 key 支援編號或代號。
  - ❌ 別再用 `files.php?id=N&download=1&inline=1`：那是下載式 endpoint、有 1hr 快取、手機開不順。也別把含預算/人名/弱點的丟公開 `Y:\` 根目錄。
- ✏️ **改 = 專案根目錄 `_WBS.md`**（系統/負責人/團隊/deadline）。其餘 agent 自動掃。
- 敏感分級：模擬畫面等非敏感可放公開 `Y:\` 根目錄；**含預算/人名/弱點的戰情室一律走有認證的 EKB files.php**（Benson 明確要認證）。
- 每週跑完：重生戰情室(網址不變) → hub 筆記追加一行執行紀錄 → Discord 推網址。

---

## 五步流程（每次跑都照這個）

### 1. 取得 WBS 骨架（=這專案有哪些系統）— 唯一真相來源
**⛔ 強制前提：沒有 `_WBS.md` 就不往下做（不產儀表板）。** 先建一份 + 請 Benson 確認，才繼續。沒 WBS = 不給做。

**每個專案根目錄放一份 `_WBS.md`，這是單一真相來源(single source of truth)**，同時餵：資料夾結構(file-organizer 照它開系統夾)、儀表板骨架、健檢基準。

> 參考樣板（skill 已內建，產出時照這個長）：HTML 版型 `references/dashboard_template.html`(航空城實例)、WBS 格式 `references/wbs_template.md`、真實範例 `Z:\…\115 航空城\_WBS.md`。

- **先讀** 專案根目錄的 `_WBS.md`（格式見 `references/wbs_template.md`）。有就以它為準。
- **沒有就產一份**：讀「工作計畫書 / 服務建議書 / 合約 / 需求書」(`01.工作計畫書/`、`*計畫書*`、`*建議書*`)抽系統/交付項清單 → 寫成 `_WBS.md` 放根目錄，**請 Benson 確認一次**，之後固定當憲法。
  - 航空城範例：7 系統（污水管線設計審查/污水廠審查/生成式設計/PMIS/預測維護/維護管理用戶接管/碳排評估）。
- 連計畫書都沒有 → 從現有資料夾名+文件推一版，每筆標「推定，請確認」。
- WBS 子項目：從會議決策、模擬畫面檔名、技術文件補（這些可在 dashboard 執行時動態補，`_WBS.md` 只需穩定的系統清單+資料夾+負責人+deadline）。

### 2. 掃資料夾（盤點 + 統計 + 結構健檢）
跑 `python scripts/scan_project.py "<專案路徑>" --wbs "系統A,系統B,..." --days 14` →回 JSON：
- 檔案總數、依類型統計（文件/模擬畫面html/影片/圖資/…）
- 近 N 天新檔（→ 新檔動態 + 「本月新增」）
- **結構健檢**：對照 file-organizer 規範（見 `references/taxonomy_ref.md`）—
  - WBS 有但找不到對應系統資料夾 → 缺
  - 根目錄/待確認 堆放未歸檔檔案、不符 L1/L2 → 列出 + 建議跑 file-organizer

### 3. 讀 EKB（撈會議/決策/待辦/缺漏）
- `GET /api/notes.php?list=1&q=<專案名>`（header `X-EKB-Token: $EKB_TOKEN`）→ 找該專案 notes
- 會議類 note 全讀，抽：已拍板決策、懸而未決、欠交/續追(誰/起於哪場/現況)、缺漏
- 統計：知識庫相關筆記數、已結構化會議場次

### 4. 對映 → 算達成/缺漏
- 每個 WBS 系統 × 資料夾實際產出 + 會議進度 → 給燈號(🟢進行多/🟡進行中/🔴未動/缺)與達成%（**目測，標可調**）
- 整體達成、完成/進行/未開工計數
- 缺漏清單（系統級 + 跨會議欠交，紅黃排序）

### 5. 產 HTML + 部署
- 用 `references/dashboard_template.html` 當版型（暖色 `#fbf6ee`/暖褐字/橘 accent、字 18px+、**絕無左色條卡片**、一句話結論+燈號置頂、重點排序>圖表、**不顯示百分比、只用燈號🟢🟡🔴+狀態文字**）。把資料填進去。
- **footer 一定要有「← 回 EKB 專案總覽」back-link**（雙向導覽：hub 筆記→儀表板已有大按鈕，儀表板→hub 也要有）。模板 footer 已內建，**記得把 `note.php?id=140` 的 id 換成本案 hub note id**（航空城＝140）。重跑覆蓋 HTML 時別漏掉，否則 back-link 會不見。
- 分頁（**第一頁固定是「🎯 該動什麼」行動清單**，預設開啟）：🎯該動什麼(依輕重彙整全維度缺漏，看完就知道做什麼) / 📂WBS(可展開) / 📅甘特 / 🔴缺漏 / 👥團隊(讀 _WBS.md) / 🖥️部署狀態(EKB 場地+網路) / 🛡️BCP備援 / 📦交付物齊全度 / 🩺資料夾健檢 / 🆕新檔 / 🗂️結構
- **報告上一定要有「行動清單」**：Benson 要「一打開就看到該做什麼(依輕重)」，不能只散在各分頁。第一頁彙整紅🔴最優先+黃🟡接著做。
- 託管 pm.php 用 `requireWebSession(..., true)`(skipIpCheck)＝**外網也能看**（仍寫死只限 Benson 本人 Google 帳號，別人 403）。
- **部署（定案＝pm.php，不要用舊的 deploy_web.py 公開法）**：
  1. 把產好的 HTML 覆蓋寫到 `Y:\EIP\ekb\storage\pm\{key}.html`（key＝eip_project_id 或短代號）。覆蓋即更新、網址不變。
  2. 網址＝`https://your-server.example.com/EIP/ekb/pm.php?id={eip_project_id}` 或 `?p={代號}`。pm.php 已建好：沿用 EKB Google 登入(有認證)、no-cache、PHP echo HTML(手機可渲染)。
  3. 更新 EKB「00 {專案}」hub 筆記：PATCH 該 note，在「📋執行紀錄」追加一行(日期+做了什麼)。EKB token＝`$EKB_TOKEN`，PATCH `/api/notes.php?id={hub_note_id}`。
  4. （選）Discord 推網址 + 一句摘要。
  - ⚠ pm.php 是加在 Benson 正式 EIP 系統的自製檔；**要動 pm.php 等系統 code 先問 Benson**，並記得 commit 進 EIP git。
  - ❌ 別用 `files.php?id=N&download=1&inline=1`(下載式、1hr 快取、手機開不順)；別把敏感儀表板丟公開 `Y:\` 根目錄。

---

## 重要原則（違反會被 Benson 退）
- **資料夾結構只有一個標準：file-organizer 的 `~/.claude/skills/file-organizer/references/taxonomy.md`。** 每次都「讀那一份」當依據，dashboard 照抄、**嚴禁自己發明另一套結構/編號/夾名**（曾因自創 00_專案管理 把 6_資安管理 吃掉而出包）。`references/taxonomy_ref.md` 只是速查，以原檔為準。系統夾用「現有系統夾名」，不另創編號。
- **金額不上儀表板**（他明令不顯示預算數字）
- 數字一律真實（檔案實際盤點 / EKB 實際筆數），達成%標「目測可調」
- 只講資料裡有的；推定的要標「推定請確認」，不腦補
- 報告風格遵全域偏好：暖色不深色、一句話+燈號優先、字級≥18px、重點排序、附「缺什麼→解鎖什麼」

## 排程（定期自動）
- 建議**每週一早上**重跑（配合進度會議週節奏；天天跑數字變化小反而吵）
- 用 `/schedule` 或 cron 跑：固定專案清單 → 對每個專案跑五步 → 原地覆蓋同網址（內容自新）
- 跑完可推 Discord：「X 專案儀表板已更新：新增 N 檔、Y 系統有進展、Z 個缺漏」

## 模板化（多專案）
航空城是第一支模板。新專案只要給資料夾路徑 → 換 WBS 骨架 → 同一套流程。每案可再微調系統清單與排程。

## 檔案
- `scripts/scan_project.py` — 資料夾盤點 + 統計 + 結構健檢
- `scripts/deploy_web.py` — 部署到 web 根目錄(no-cache PHP wrapper，可選 --auth-pass 密碼閘)
- `references/dashboard_template.html` — 暖色互動版型（航空城實例，**已去左色條**）
- `references/wbs_template.md` — 專案根目錄 `_WBS.md` 的格式範本
- `references/taxonomy_ref.md` — file-organizer L1/L2 規範速查（健檢比對用）
