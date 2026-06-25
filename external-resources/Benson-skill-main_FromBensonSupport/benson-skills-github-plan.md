# Benson Skills — GitHub 同步方案完整實作 Plan

> **給 CLI 端 Claude Code 接手執行**
> 撰寫：2026-05-23，Cowork 端 Claude
> Repo：https://github.com/MMBenson/Benson-skill
> 任務：把本機 31 個 skill 整合進 GitHub，建立 CLI / Cowork / Chat 三平台同步機制

---

## 0. 前情提要（CLI Claude Code 必讀）

### 為什麼需要這個方案
Benson 同時使用三個 Claude 介面：
- **Claude Code CLI**（這個，你）
- **Cowork**（桌面 agent）
- **claude.ai chat**（網頁版）

三個介面 skill 互不相通，改一次要傳三次。這份 plan 是要讓 CLI 當主編輯端，GitHub 當 source of truth，Cowork / Chat 從 GitHub 拉。

### 已驗證的事實（Cowork 端我這幾小時實測過）
1. ❌ Cowork **不支援**指向本機資料夾 / Git URL 當 plugin source
2. ❌ Cowork 直接複製檔案到 `%APPDATA%\Claude\...\skills\` **會被開機 reset**
3. ❌ claude.ai chat sandbox 出站有 allowlist，**連不到內網或私有 git**
4. ❌ Cowork 裝的 plugin 在 claude.ai chat **不會自動同步給 chat 用**（chat 設定頁看得到但對話用不到）
5. ❌ claude.ai chat 的 personal skill **要 UI 一個個傳 zip**，沒有批量
6. ✅ CLI 本機檔案 + symlink 完全可行
7. ✅ Cowork 雙擊 .plugin 安裝完全可行（已成功裝過 benson-skills.plugin 20 個 skill）
8. ✅ Plugin 不能含 nested zip（包括 .docx / .xlsx / .pptx — 它們本質是 zip）

### 已拍板決策（不要再改）
- **Repo**：`https://github.com/MMBenson/Benson-skill`（已建，Private）
- **本機路徑**：`D:\github\benson-skills`（CLI 自選，建議這個）
- **Symlink 策略**：`~/.claude/skills/` → `D:\github\benson-skills\skills\`
- **打包產物**：commit 進 repo（不用 GitHub Releases，方便連結固定）
- **敏感 token**：`.gitignore` 掉，repo 只放 `.env.example`
- **Chat 端**：放棄自動，只挑常用 5-10 個手動傳

---

## 1. Repo 最終結構

```
benson-skills/
├── .gitignore
├── README.md                          ← 給 Benson 看的速查卡
├── CHANGELOG.md                       ← 手寫每次重大變更
├── PLAN.md                            ← 本文件
│
├── skills/                            ← Source of Truth
│   ├── bcp-drill-plan/SKILL.md
│   ├── easymap/SKILL.md
│   ├── eip-item-builder/
│   │   ├── SKILL.md
│   │   └── .env.example
│   ├── ...（共 20 個自建）
│   └── handover/SKILL.md              ← 從 handover-skill 改名
│
├── dist/                              ← 打包產物（commit）
│   ├── benson-skills.plugin           ← Cowork 雙擊裝
│   ├── MANIFEST.txt                   ← 列出包含的 skill + 版本
│   └── individual/                    ← Chat 用，每個 skill 一個 zip
│       ├── bcp-drill-plan.zip
│       ├── easymap.zip
│       └── ...
│
└── scripts/
    ├── build.ps1                      ← 從 skills/ 產 dist/
    ├── push.ps1                       ← build + commit + push 三合一
    └── init-symlink.ps1               ← 首次設定 symlink（一次性）
```

---

## 2. Skill 分類清單

### 2.1 自建 skill（要包進 repo，共 20 個）

| Skill | 用途 | 備註 |
|---|---|---|
| bcp-drill-plan | BCP 演練計畫產生器 | 含 docx 範本，build 要清掉 |
| easymap | Easymap GIS 圖台開發 | |
| eip-item-builder | EIP 工項建置 | 有 `.env`（API token），要排除 |
| eip-line-pulse | LINE 雷達訊號挖掘 | 可能有 SQLite，要排除 |
| file-organizer | 檔案分類整理 | |
| fortigate-api-spec | FortiGate API 規格 | |
| fortigate-qa | FortiGate 設定 QA | |
| handover-skill | 跨 session 交班 | **改名為 handover** |
| image-gen | AI 圖片生成 | 可能有 API key |
| isms-audit-prep | 資安稽核準備 | 含 xlsx 範本，要清 |
| novel-memory | 小說創作記憶 | |
| project-dev-manager | 專案開發管理 | |
| proposal-doc | 服務建議書 | 含 docx 範本 |
| proposal-narration | 簡報配音 | |
| proposal-pptx | 提案簡報 | 含 pptx 範本 |
| quote-builder | 報價單 | 含 xlsx 範本 |
| review | 工作整合報告 | |
| rfp-builder | 需求說明書 | 含 docx 範本 |
| web-sqa | Web 自主檢測 | |
| webapp-testing | Webapp 測試 | |

### 2.2 官方 skill（黑名單，**不打包**）

```
docx, pdf, pptx, xlsx, mcp-builder, skill-creator, web-artifacts-builder,
doc-coauthoring, bootstrap-ui, theme-factory, get-api-docs, canvas-design,
algorithmic-art, brand-guidelines, internal-comms, slack-gif-creator,
travel-planner, schedule, setup-cowork, consolidate-memory, notion-project-setup
```

> 判斷原則：SKILL.md description 是中文 = 自建；英文 + Anthropic 風格 = 官方

---

## 3. CLI Claude Code 執行步驟（按順序）

### Step 1：盤點現況

```powershell
# 確認 CLI 端 skill 都還在
Get-ChildItem $env:USERPROFILE\.claude\skills -Directory | Select Name
# 應該看到 31 個（20 自建 + 11 官方）
```

### Step 2：Clone repo

```powershell
mkdir D:\github -EA 0
cd D:\github
git clone https://github.com/MMBenson/Benson-skill.git benson-skills
cd benson-skills
```

### Step 3：建立目錄結構

```powershell
mkdir skills, dist, dist\individual, scripts -EA 0
```

### Step 4：搬 skill（從 CLI 本機 → repo）

```powershell
$src = "$env:USERPROFILE\.claude\skills"
$dst = "D:\github\benson-skills\skills"

$mySkills = @(
    "bcp-drill-plan", "easymap", "eip-item-builder", "eip-line-pulse",
    "file-organizer", "fortigate-api-spec", "fortigate-qa", "handover-skill",
    "image-gen", "isms-audit-prep", "novel-memory", "project-dev-manager",
    "proposal-doc", "proposal-narration", "proposal-pptx", "quote-builder",
    "review", "rfp-builder", "web-sqa", "webapp-testing"
)

foreach ($s in $mySkills) {
    if (-not (Test-Path "$src\$s")) { Write-Warning "缺：$s"; continue }
    $destName = if ($s -eq "handover-skill") { "handover" } else { $s }
    Copy-Item "$src\$s" "$dst\$destName" -Recurse -Force
}

# 同時砍掉 .env / token 之類敏感檔
Get-ChildItem $dst -Recurse -File -Include .env, *.key, credentials.json, token.txt -EA 0 |
    ForEach-Object {
        # 留 .env.example，砍真實 .env
        if ($_.Name -eq ".env") {
            Move-Item $_.FullName "$($_.FullName).example.local" -Force
            Write-Host "敏感檔搬走：$($_.FullName)"
        }
    }
```

### Step 5：寫 `.gitignore`

```gitignore
# 敏感檔
**/.env
**/*.key
**/credentials.json
**/token.txt
**/secrets.json

# 暫存
*.tmp
*.bak
*~
build/

# OS
.DS_Store
Thumbs.db
desktop.ini

# 個別 skill 內可能有的測試輸出
**/output/
**/test_*.docx
**/test_*.xlsx

# 不該進 repo 的個人筆記
**/_notes.md
**/_scratch/

# dist 要 commit（給 Cowork / chat 下載），不能在這 ignore
# !dist/ 不需要寫，因為上面沒 ignore 它
```

### Step 6：寫 `scripts/build.ps1`

```powershell
<#
.SYNOPSIS
    從 skills/ 打包成 dist/ 內的 .plugin 與個別 zip

.DESCRIPTION
    1. 複製 skills/ 到暫存區
    2. 清掉 nested zip (.zip / .docx / .xlsx / .pptx) — Cowork plugin 不允許
    3. 清掉 .env / token
    4. 產 dist/benson-skills.plugin (Cowork 用)
    5. 產 dist/individual/<skill>.zip 各別包 (Chat 用)
    6. 寫 dist/MANIFEST.txt

.EXAMPLE
    .\scripts\build.ps1
#>

$ErrorActionPreference = "Stop"

$root = Split-Path $PSScriptRoot -Parent
$srcDir = Join-Path $root "skills"
$distDir = Join-Path $root "dist"
$indivDir = Join-Path $distDir "individual"
$buildDir = Join-Path $env:TEMP "benson-skills-build"

$version = Get-Date -Format "yyyy.MM.dd.HHmm"

# 不允許的副檔名（Cowork plugin 規則）
$badExt = @("*.zip", "*.docx", "*.xlsx", "*.pptx", "*.jar", "*.whl", "*.egg")

# 敏感檔
$secretFiles = @(".env", "*.key", "credentials.json", "token.txt", "secrets.json")

Write-Host "`n[Build] benson-skills v$version" -ForegroundColor Cyan

# 1. 清暫存區
if (Test-Path $buildDir) { Remove-Item $buildDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path "$buildDir\skills" | Out-Null
New-Item -ItemType Directory -Force -Path "$buildDir\.claude-plugin" | Out-Null
New-Item -ItemType Directory -Force -Path $distDir | Out-Null
New-Item -ItemType Directory -Force -Path $indivDir | Out-Null

# 2. 複製 skills/ 到暫存區
$skills = Get-ChildItem $srcDir -Directory | Select-Object -ExpandProperty Name
Write-Host "  發現 $($skills.Count) 個 skill" -ForegroundColor Gray
foreach ($s in $skills) {
    Copy-Item "$srcDir\$s" "$buildDir\skills\$s" -Recurse -Force
}

# 3. 清掉不允許的檔案
$removed = 0
foreach ($pattern in ($badExt + $secretFiles)) {
    Get-ChildItem $buildDir -Recurse -File -Filter $pattern -EA 0 | ForEach-Object {
        Remove-Item $_.FullName -Force
        $removed++
    }
}
Write-Host "  清掉 $removed 個敏感/不允許檔案" -ForegroundColor Gray

# 4. 寫 plugin.json
$plugin = @{
    name = "benson-skills"
    version = $version
    description = "Benson 自建 skill 集（共 $($skills.Count) 個）"
    author = @{ name = "Benson" }
} | ConvertTo-Json
Set-Content "$buildDir\.claude-plugin\plugin.json" $plugin -Encoding UTF8

# 5. 產 .plugin（Cowork 用）
$pluginFile = Join-Path $distDir "benson-skills.plugin"
if (Test-Path $pluginFile) { Remove-Item $pluginFile -Force }
Compress-Archive -Path "$buildDir\*" -DestinationPath "$pluginFile.zip" -Force
Move-Item "$pluginFile.zip" $pluginFile -Force
$pluginSize = [math]::Round((Get-Item $pluginFile).Length / 1MB, 2)
Write-Host "  [OK] $pluginFile ($pluginSize MB)" -ForegroundColor Green

# 6. 產個別 zip（Chat 用）
Get-ChildItem $indivDir -Filter "*.zip" -EA 0 | Remove-Item -Force
$count = 0
foreach ($s in $skills) {
    $zipPath = Join-Path $indivDir "$s.zip"
    Compress-Archive -Path "$buildDir\skills\$s" -DestinationPath $zipPath -Force
    $count++
}
Write-Host "  [OK] 產出 $count 個個別 zip 到 $indivDir" -ForegroundColor Green

# 7. 寫 MANIFEST.txt
$manifest = @"
benson-skills v$version
Built: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Total skills: $($skills.Count)

Skills included:
$($skills -join "`n")
"@
Set-Content "$distDir\MANIFEST.txt" $manifest -Encoding UTF8

# 8. 清暫存
Remove-Item $buildDir -Recurse -Force

Write-Host "`n[Done] Build complete." -ForegroundColor Cyan
```

### Step 7：寫 `scripts/push.ps1`

```powershell
<#
.SYNOPSIS
    一鍵：build + git commit + push
#>

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

Write-Host "`n[Push] 開始..." -ForegroundColor Cyan

# 1. Build
& "$PSScriptRoot\build.ps1"

# 2. 檢查是否有變更
$status = git status --porcelain
if (-not $status) {
    Write-Host "[Push] 沒有變更，跳過 commit" -ForegroundColor Yellow
    exit 0
}

# 3. Commit
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
git add -A
git commit -m "Update skills: $timestamp"

# 4. Push
git push origin main

Write-Host "`n[Push] 完成！" -ForegroundColor Green
Write-Host "  下載 .plugin: https://github.com/MMBenson/Benson-skill/raw/main/dist/benson-skills.plugin" -ForegroundColor Yellow
Write-Host "  瀏覽個別 zip: https://github.com/MMBenson/Benson-skill/tree/main/dist/individual" -ForegroundColor Yellow
```

### Step 8：寫 `scripts/init-symlink.ps1`

```powershell
<#
.SYNOPSIS
    首次設定：把 ~/.claude/skills/ 變成 symlink 連到 repo 的 skills/

.DESCRIPTION
    執行前提：以系統管理員身份執行 PowerShell
    （或啟用 Windows 開發者模式以允許非管理員建立 symlink）
#>

$ErrorActionPreference = "Stop"

$claudeSkills = "$env:USERPROFILE\.claude\skills"
$repoSkills = "D:\github\benson-skills\skills"
$backupDir = "$env:USERPROFILE\.claude\skills.bak.$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# 1. 檢查 repo 存在
if (-not (Test-Path $repoSkills)) {
    Write-Error "Repo skills 資料夾不存在：$repoSkills"
    exit 1
}

# 2. 備份現有 skills
if (Test-Path $claudeSkills) {
    Write-Host "備份現有 skills 到 $backupDir" -ForegroundColor Yellow
    Move-Item $claudeSkills $backupDir
}

# 3. 建立 symlink
Write-Host "建立 symlink：$claudeSkills -> $repoSkills" -ForegroundColor Cyan
New-Item -ItemType SymbolicLink -Path $claudeSkills -Target $repoSkills | Out-Null

# 4. 驗證
$link = Get-Item $claudeSkills
if ($link.LinkType -eq "SymbolicLink") {
    Write-Host "`n[OK] Symlink 建立成功" -ForegroundColor Green
    Write-Host "  Source: $claudeSkills" -ForegroundColor Gray
    Write-Host "  Target: $($link.Target)" -ForegroundColor Gray
    Write-Host "`n  備份在：$backupDir" -ForegroundColor Yellow
    Write-Host "  確認沒問題後可以砍掉" -ForegroundColor Yellow
} else {
    Write-Error "Symlink 建立失敗"
    exit 1
}
```

### Step 9：第一次 build + push

```powershell
cd D:\github\benson-skills

# Build
.\scripts\build.ps1

# 檢查 dist/ 內容
ls dist
ls dist\individual | Measure-Object | Select Count  # 應該 20

# Commit + push
git add -A
git commit -m "Initial commit: 20 self-built skills + build scripts"
git push -u origin main
```

### Step 10：建立 symlink（一次性）

```powershell
# 以系統管理員開啟 PowerShell
.\scripts\init-symlink.ps1

# 驗證 CLI 端還看得到 skill
ls $env:USERPROFILE\.claude\skills | Select Name
```

### Step 11：寫 README.md

讓 Benson 之後自己看的速查卡：

```markdown
# Benson Skills

我自建的 Claude skill 集合，CLI/Cowork/Chat 三平台同步用。

## 日常維運

```powershell
cd D:\github\benson-skills

# 改完 skill 後
.\scripts\push.ps1
```

CLI 透過 symlink 直接生效。Cowork / Chat 看下面。

## 三平台安裝

### CLI（自動）
已透過 symlink 連到 `~/.claude/skills/`，本機改完即時生效。

### Cowork
1. 下載 `https://github.com/MMBenson/Benson-skill/raw/main/dist/benson-skills.plugin`
2. 雙擊安裝
3. 開新 chat 才會載入新版

### claude.ai Chat（手動，挑常用的就好）
1. 從 `dist/individual/` 下載需要的 zip
2. 上 `https://claude.ai/customize/skills` 用「+」按鈕上傳
3. 每個 skill 要重複一次

## 自建 skill 清單

（list）

## 注意事項

- 敏感 .env / token 不會進 repo（.gitignore）
- `handover-skill` 在 repo 內叫 `handover`
- Cowork plugin 不能含 .docx / .xlsx / .pptx（build.ps1 會自動清掉）
- 改了 plugin 後要重灌一次 Cowork 才會更新
```

---

## 4. 已知踩坑（CLI 接手前先讀）

### 坑 1：Symlink 權限
Windows 建 symlink 需要：
- 系統管理員身份執行 PowerShell，**或**
- 啟用「開發人員模式」（Settings → For developers → Developer Mode）

### 坑 2：Nested zip
Cowork plugin 不允許含 zip 結構的檔案。包括：
- `.zip` `.jar` `.whl` `.egg`
- **`.docx` `.xlsx` `.pptx`**（這幾個本質是 zip）

build.ps1 已經自動清掉，但**這代表 skill 內如果依賴 template.docx 之類的範本檔，會壞掉**。
解法：
- 短期：把範本另外放（GitHub Releases / Google Drive）
- 長期：改用 markdown 表格定義範本結構，運行時生成

### 坑 3：handover 命名
CLI 端叫 `handover-skill`，Cowork 預設有個 `handover`。
**統一改為 `handover`** 在 repo 內，覆蓋 Cowork 預設的。

### 坑 4：Cowork 改了不會自動更新
Plugin 安裝後是 snapshot。要重灌才會拿到新版。
所以：CLI 改完 push → Benson 要去下載新 plugin 重灌 Cowork。

### 坑 5：Symlink 後 Claude Code 識別
有些版本的 Claude Code 對 symlink 不識別 SKILL.md。
驗證方法：建完 symlink 後重啟 Claude Code，跑 `/help` 看 skill 列表有沒有出現。
如果不行 → 改用「Junction」(`cmd /c mklink /J`)，這個多數系統都吃。

---

## 5. 維運流程（穩定後）

```
[改 skill]
    ↓ (CLI 任何位置改，因為 symlink)
[cd D:\github\benson-skills]
    ↓
[.\scripts\push.ps1]
    ↓ (自動 build + commit + push)
[CLI 立刻生效]   ← symlink 直連
[Cowork] 需要時：開連結 → 下載 .plugin → 雙擊
[Chat] 需要時：開連結 → 下載個別 zip → claude.ai 上傳
```

---

## 6. 不做的事（明確排除）

| 不做 | 為什麼 |
|---|---|
| Plugin marketplace 自動更新 | private repo 要帶 token，太麻煩 |
| EIP 寫 skill registry 模組 | 過度設計，違反關注點分離 |
| NAS 共享掛載 Cowork / Chat | Cowork / Chat 都到不了 |
| Webhook 自動推送 | push.ps1 已經夠快 |
| Chat 自動同步 | Anthropic 不支援 |
| 跨團隊共享 | 第二期，先單人跑通 |
| GitHub Actions CI | YAGNI |

---

## 7. 驗收標準

CLI Claude Code 完成後應該滿足：

- [ ] `D:\github\benson-skills\skills\` 有 20 個自建 skill 資料夾
- [ ] `dist\benson-skills.plugin` 存在，大小 5-15MB
- [ ] `dist\individual\` 有 20 個對應的 zip
- [ ] `dist\MANIFEST.txt` 列出所有 skill
- [ ] `.gitignore` 包含 .env、token 等敏感檔
- [ ] `scripts\` 內三個 .ps1 都可獨立執行不報錯
- [ ] `git log` 看到至少一個 commit
- [ ] `~/.claude/skills/` 是 SymbolicLink，Target 指向 repo
- [ ] 重啟 CLI 後仍能正常觸發 skill
- [ ] GitHub 上 https://github.com/MMBenson/Benson-skill/raw/main/dist/benson-skills.plugin 能下載

---

## 8. 給 CLI Claude Code 的執行指示

1. **先 read 一次本文件**，理解全貌
2. **問 Benson 確認**：
   - 本機 repo 路徑要不要用 `D:\github\benson-skills`？
   - Symlink 還是 Junction？（如果開發者模式沒開就用 Junction）
3. **按 Step 1-11 順序執行**，每完成一步講一下結果
4. **不要自己改決策**，有疑問先問
5. **完成後**用 Step 7 驗收標準勾選一次
6. **最後**給 Benson 一份簡化的「日常維運速查卡」

執行中卡關，**先停下來告訴 Benson**，不要 brute force。

---

完。
