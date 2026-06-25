# CLAUDE.md — benson-skill（marketplace repo）專屬指引

> 全域 `~/.claude/CLAUDE.md` 的規則**全部仍適用**；本檔只補「這個 repo 專屬」的事，衝突時以本檔為準。

---

## 📌 當前待辦 / 跨機交接（會變動，做完就劃掉；本區隨 Synology 同步給兩台看）

> 更新：2026-06-14

- [ ] **project-dashboard 還沒上 GitHub** — 源檔+commit 只在常駐設備、未 push（常駐設備沒 key）。做法：常駐設備裝 PAT（見下方「GitHub 認證現況」+ EKB #317）後 `git push` 或跑 `sync.ps1`。
- [ ] **常駐設備裝 GitHub PAT** — token 與 headless 寫入指令在 EKB note #317。裝完該機才能 push。
- [ ] **ekb-note 修正待擴散** — `~/.claude/skills/ekb-note/SKILL.md` 在 BENSON 較新（補了 `X-EKB-Token` 認證說明，2026-06-14）；常駐設備那份還是舊的，需補同步 + 進 marketplace。
- [ ] **新檔尚未 commit** — `CLAUDE.md`、`claude-skill-radar.ps1`、`.gitignore`(加 `.claude-sync/`) 已在 BENSON 本機，尚未 commit/push。
- [x] EKB_TOKEN / EKB_BASE_URL 已在 BENSON 設成 Windows User 級全域變數（2026-06-14）。

---

## 這個 repo 是什麼

Benson 自建 Claude Code skill 的 GitHub marketplace 來源：`https://github.com/MMBenson/Benson-skill`（Private）。
`~/.claude/skills/` 內白名單 skill 經 `sync.ps1` 複製進 `plugins/benson-skills/skills/` 後 commit + push，其他機器靠 `claude plugin marketplace update` 收新版。

---

## ⚠️ 最重要：雙機 + Synology 拓樸與陷阱

這個 repo 同時存在**多個 clone**，且其中一份在雲端同步資料夾裡，兩台電腦都會動 → 容易出事。動手前先搞清楚你在哪個 clone。

| Clone 位置 | 說明 |
|---|---|
| `C:\SynologyDrive\0.3.我的專案計畫\2026\benson-skill`（=常駐設備的 `Z:\...`） | **Synology 同步夾**，兩台共用。日常在這裡工作。|
| `C:\Users\benso\Desktop\CLAUDE COWORK\PROJECTS\benson-skill` | README 標示的「官方」clone；不一定每台都有。|

**鐵則 / 已知坑：**

1. **`~/.claude/` 不走 Synology** — 兩台的 `~/.claude/skills`、memory、CLAUDE.md、settings **各自獨立、會分岔**。今天的痛點全來自此（某 skill 改在 A、某 skill 源檔只在 B）。改 skill 前先用下面的「雷達」確認哪台較新。
2. **Synology 同步 `.git` 不可靠** — 工作目錄普通檔會同步，但 `.git`（commit/refs）常嚴重落後或被排除。結果：A 台 commit 了，B 台 working tree 變了卻沒那個 commit、顯示一堆 Modified/untracked。**不要假設 commit 會自己同步到另一台。**
3. **不要兩台同時 commit 同一個 Synology clone** — 兩份分岔的 `.git` 經檔案同步互相覆蓋 = repo 損壞風險。**同一時間只讓一台當 writer。**
4. **push 前先 `git fetch` 比對 origin**；若另一台有未推 commit，先讓它推 / 先 pull --rebase，再動。

---

## GitHub 認證現況（哪台能 push）

| 機器 | GitHub key | 能 push? |
|---|---|---|
| `BENSON`（本機） | GCM 內有 MMBenson token | ✅ |
| 常駐設備 | 原本沒 key，GCM 登入視窗跳不出來卡住 | 需先裝 PAT |

常駐設備裝 key（headless、不跳視窗）的指令 + token 存在 **EKB note #317**（`note.php?id=317`）。做法：
```bash
printf "protocol=https\nhost=github.com\nusername=MMBenson\npassword=<PAT>\n\n" | git credential approve
```

---

## 同步 skill 到 marketplace（push 流程）

優先用 `benson-skill-sync` skill（一條龍）；底層是 `sync.ps1`：

- 白名單 `$mySkills`（sync.ps1 第 28 行）決定哪些 skill 進 marketplace。
- 黑名單（不進）：Anthropic 官方 skill（docx/pdf/pptx/skill-creator/theme-factory/web-artifacts-builder/webapp-testing/xlsx/doc-coauthoring/get-api-docs/mcp-builder）+ 個人 skill（novel-memory）。
- `sync.ps1` 用 `$PSScriptRoot` 自我定位，**從任一 clone 跑都行**；會自動重建 README 的 `<!-- SKILLS-LIST -->`（依更新時間排序，勿手改）。
- ⚠️ **白名單內、本機卻沒有該 skill 源檔 → sync.ps1 會報 missing / 視為要從 marketplace 移除。** 例：`project-dashboard` 在白名單，但只存在常駐設備；在 BENSON 跑 sync 會卡。先確認源檔在不在。
- `sync.ps1` 含 UTF-8 BOM（PowerShell 5.1 跑中文才不亂碼），勿拿掉。

---

## 跨機 skill 更新時間雷達 — `claude-skill-radar.ps1`

知道「兩台每個 skill 的最後更新時間 + 誰較新 / 誰缺」的機制。

```powershell
# 每台都跑一次（產生本機 manifest；兩台都跑過後印跨機比對表）
.\claude-skill-radar.ps1
.\claude-skill-radar.ps1 -ScanOnly   # 只更新本機 manifest、不印表
```

- manifest 寫到 `.claude-sync\skills.<電腦名>.json`（在 `.gitignore`，隨 Synology 同步、不入 git）。
- 狀態判定：內容指紋定「一致/不一致」、更新時間定「誰較新」。
- 只有 1 台 manifest 時狀態全顯示「一致」是正常的（沒得比）；要兩台都跑過才有意義。
- 用途：換機器 / 改完 skill 前，先跑確認沒覆蓋到另一台較新的版本。

---

## 不要做的事

- 不要在沒比對的情況下從某一台 sync/push，蓋掉另一台較新的 skill。
- 不要手動維護 README 的 SKILLS-LIST 區塊（sync.ps1 自動生成）。
- 不要把 `.claude-sync/`、`.handover/`、token 入 git（`.gitignore` 已擋，別繞過）。
- 不要兩台同時對 Synology clone 做 git commit。
