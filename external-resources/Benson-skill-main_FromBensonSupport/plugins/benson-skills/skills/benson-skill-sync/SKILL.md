---
name: benson-skill-sync
description: Benson 自建 skill 同步到 GitHub marketplace 的一鍵工具。當使用者說「同步 skill」「上傳 skill」「push skill」「sync skill」「skill 改完了」「更新 marketplace」「上 git」「上 github」「我剛改了 XXX skill」「benson-skills 更新」「同步一下」「上傳一下」或任何暗示要把 ~/.claude/skills/ 的變更推到 https://github.com/MMBenson/Benson-skill 的句子時啟用。預設行為：偵測 → sync → commit → push 一條龍跑完，全程不問東問西，只有「發現新 skill 不在白名單」時才停下來問一次。
---

# benson-skill-sync

> 🔴 **鐵律：只要改了任何一個 skill，就一定要跑 `sync.ps1` 推上 GitHub。**
> 原因：skill 編輯在 `~/.claude/skills`，不推上去 → GitHub 沒有、另一台拿不到，且本機下次被每日 `check-skills.ps1` 蓋回舊版。
> （純 `git` 沒用——你的修改在 `~/.claude/skills`，不在 repo 裡；`sync.ps1` 才會把它複製進 repo 再 push。）

把 `~/.claude/skills/` 內的自建 skill 同步到 `MMBenson/Benson-skill` GitHub marketplace。

## 模型：GitHub 為主（master），兩台電腦雙向對齊

Benson 有**多台 Windows 電腦**共用同一個 GitHub repo（`MMBenson/Benson-skill`）。**GitHub 是唯一主庫**。兩個方向、兩支腳本（都在 repo 根，`$PSScriptRoot` 自我定位）：

| 腳本 | 方向 | 用途 | 衝突時 |
|---|---|---|---|
| `sync.ps1` | 本機 → GitHub | **發佈**：把本機改好的 skill 推上去 | 先 `git pull --rebase`，本機真的改了才覆蓋；保留別台 skill |
| `check-skills.ps1` | GitHub → 本機 | **檢查/更新**：本機缺的、跟 GitHub 不同的 → 抓最新覆蓋下來 | **一律 GitHub 為準** |

- 「同步 / 上傳 / 我改好了」 → 跑 `sync.ps1`
- 「檢查 / 更新本機 / 這台是不是最新 / 補齊 skill」 → 跑 `check-skills.ps1`（加 `-WhatIf` 只報告不動本機）
- **排程**：每台電腦排「每天中午 12:00 自動跑 `check-skills.ps1`」自我對齊（見最後一節）。
- ⚠️ GitHub 為準的代價：本機改了 skill **沒先 `sync.ps1` 發佈**，被 `check-skills.ps1`（或排程）跑到就會**被 GitHub 蓋掉**。要改 skill → 改完先 sync 上去。

`check-skills.ps1` 的 LOCAL-ONLY 清單＝本機有、GitHub 沒有的，正常情況就是黑名單那些（官方 + novel-memory），不必處理。

## 觸發後執行順序（不要逐步問使用者，一條龍跑完）

### Step 1：偵測新 skill / 缺失 skill

讀 sync.ps1 的 `$mySkills` 清單（在 `C:\SynologyDrive\0.3.我的專案計畫\2026\benson-skill\sync.ps1`），跟 `$env:USERPROFILE\.claude\skills\` 內的資料夾比對。

**不納入 marketplace 黑名單**（① Anthropic 官方 skill；② 個人／非工作 skill。同事／外部來源的「工作用」自建 skill 仍要納入，例如 bootstrap-ui 是同事 eric 的也要上）：
```
官方:           doc-coauthoring, docx, get-api-docs, mcp-builder, pdf,
                pptx, skill-creator, theme-factory, web-artifacts-builder, webapp-testing, xlsx
個人/非工作:     novel-memory
```
（benson-skill-sync 自己**要**進 marketplace，因為換電腦時要靠它自我引導）

分類（sync.ps1 防雙機互覆機制）：
- **白名單內、本機有** → 正常 sync（複製/更新）
- **白名單內、本機沒有、但 repo 有** → **保留不動**（多半是另一台電腦維護的，不誤刪）
- **白名單內、本機與 repo 都沒有** → MISSING 警告
- **本機有、白名單外、不在黑名單** → 新 skill，**需要問使用者**
- **白名單外、但 repo 內還有** → prune 刪除（＝刻意移除 skill 的唯一途徑：把它從 `$mySkills` 拿掉）

### Step 2：若有新 skill → 問一次

用 AskUserQuestion 列出新 skill 名稱，問「要不要加入 marketplace？」
- 多選 (multiSelect: true)：使用者挑要加哪幾個
- 也可全部不加

若使用者選擇加入 → 用 Edit 工具修改 sync.ps1 的 `$mySkills` 陣列，把新 skill 名稱加進去（按字母排序）。

### Step 3：跑 sync.ps1

```powershell
cd "C:\SynologyDrive\0.3.我的專案計畫\2026\benson-skill"
.\sync.ps1
```

或如果使用者有明確 commit message（剛剛對話有提到「我改了 XXX 的 YYY」）：
```powershell
.\sync.ps1 -Message "<具體改了什麼>"
```

Commit message 推斷規則：
- 使用者只說「同步」「sync」「上 git」→ 不帶 -Message，腳本用預設「Sync skills: <timestamp>」
- 使用者說了具體改動（「我修了 proposal-pptx 的字體 bug」）→ 用 `-Message "fix proposal-pptx 字體 bug"`
- 使用者新增了 skill → 用 `-Message "add skill: xxx, yyy"`

### Step 3b：README 自動重建（sync.ps1 內建，勿手動編）

sync.ps1 在 push 前會自動重建 README.md 的 `<!-- SKILLS-LIST -->` 區塊（「包含的 skill」表格），**依各 skill 最近更新時間排序（新到舊）**。每次 sync 都會刷新，**不要手動維護 README 這塊**——要改排序 / 欄位請改 sync.ps1 的 README 重建段（`Sort-Object Updated -Descending`）。

> 規則：任何 skill 更新後，README 都要保持最新 + 依更新時間排序。跑 sync.ps1 會自動達成；若只改 skill 暫不 sync，可單獨重生 README 的 SKILLS-LIST 區塊。

### Step 4：回報

簡短報告，控制在 5 行內：
- 改動的 skill 數量
- commit SHA 前 12 碼（給其他機器 update 參考）
- 一句話提示：「其他機器跑 `claude plugin marketplace update` 收新版」

## 不要做的事

- 不要重新讀 ~/.claude/skills/ 內每個 SKILL.md 來「分析變更」——讓 git diff 自己處理就好
- 不要主動刪 ~/.claude/skills/ 任何檔案
- 不要在沒有新 skill 時還跑 AskUserQuestion——一條龍跑完就好
- 不要產出長篇報告——使用者要的是「我說一句、它就 push」的體驗
- 不要建議使用者去網頁看 commit——commit SHA 報出來就好

## 常見錯誤處理

- **sync.ps1 報 missing skill**：白名單裡某個 skill 在本機已經被刪了 → 從 `$mySkills` 移除該行，重跑
- **git push 失敗（auth）**：提示使用者檢查 `git config credential.helper`，這台機器原本是 manager-core / Windows Credential Manager
- **git push 失敗（conflict）**：先 `git pull --rebase`，再 push
- **claude plugin marketplace update 在其他機器顯示「up to date」但實際舊**：可能 cache 卡住，叫使用者 `claude plugin marketplace remove benson-skill` 然後重 add

## 相關位置（每台電腦各自獨立 clone）

> 🔴 **架構鐵則：repo 不要放 Synology / Dropbox / OneDrive 等檔案同步資料夾。**
> git 要靠 **GitHub** 同步，不是靠檔案同步。兩台共用同一份被同步的 `.git` → Synology 與 git 兩套機制搶同一個 `.git` → 產生「衝突副本」檔、甚至弄壞 repo。
> **每台電腦各自 `git clone` 一份到本機非同步路徑**，都從 GitHub 拉。

- Repo 本機（建議）：`$env:USERPROFILE\benson-skill`（任何**非同步**路徑都行；`sync.ps1` / `check-skills.ps1` 用 `$PSScriptRoot` 自我定位）
- Skill 編輯來源：`$env:USERPROFILE\.claude\skills\`
- Marketplace 內 skill 目錄：`<repo>\plugins\benson-skills\skills\`
- Remote：`https://github.com/MMBenson/Benson-skill`（Private）

## 新機器初始化（每台電腦只做一次）

**Step 1 — 獨立 clone（非同步路徑）+ 第一次對齊：**
```powershell
git clone https://github.com/MMBenson/Benson-skill.git "$env:USERPROFILE\benson-skill"
cd "$env:USERPROFILE\benson-skill"
.\check-skills.ps1     # 把 GitHub 上所有 skill 裝到本機 ~/.claude/skills
```

**Step 2 — 註冊每日中午 12:00 自我對齊排程（GitHub 為主）：**
```powershell
$exe=(Get-Command pwsh -EA 0).Source; if(-not $exe){$exe=(Get-Command powershell).Source}
$s="$env:USERPROFILE\benson-skill\run-daily-check.ps1"
Register-ScheduledTask -TaskName 'BensonSkillCheck' -Action (New-ScheduledTaskAction -Execute $exe -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$s`"") -Trigger (New-ScheduledTaskTrigger -Daily -At "12:00") -Settings (New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries) -Principal (New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive) -Force
```

**需求 / 注意：**
- **git for windows**：第一次 clone 會要 GitHub 帳密，輸入一次即存進 Windows 認證管理員，之後排程自動 pull 不再問。
- **PowerShell**：5.1（Windows 內建）即可跑，**PS7 非必要**（上面指令找不到 pwsh 會自動退回 `powershell`）；裝 PS7 只是兩台一致比較好。
- ❌ **絕不要**在 Synology / Dropbox 同步資料夾裡跑 git（含 `check-skills.ps1` 的 `git pull`）——會撞車壞 repo。
- 路徑與使用者名稱無關：全用 `$env:USERPROFILE` / `$PSScriptRoot`，換人換機自動指對。
