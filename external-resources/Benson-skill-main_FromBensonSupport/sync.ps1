<#
.SYNOPSIS
    把 ~/.claude/skills/ 內 白名單($mySkills)內的自建 skill 同步到 repo 並 push。

.DESCRIPTION
    1. 從 $env:USERPROFILE\.claude\skills\ 複製 白名單($mySkills)內的自建 skill 到 plugins/benson-skills/skills/
    2. handover-skill 改名 handover
    3. 統一 SKILL.md 大寫
    4. 清掉敏感檔 / nested zip / __pycache__ / promo PNG
    5. git add + commit + push

.EXAMPLE
    .\sync.ps1
    .\sync.ps1 -Message "fix proposal-pptx 字體錯誤"
#>

[CmdletBinding()]
param(
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
$src = Join-Path $env:USERPROFILE ".claude\skills"
$dst = Join-Path $repoRoot "plugins\benson-skills\skills"
$stateFile = Join-Path $env:USERPROFILE ".claude\.skill-sync-state.json"

# 與 check-skills.ps1 相同的指紋演算法（push 成功後寫回基準，維持 merge-base 正確）
$ignoreFileSig = @('*.zip', '*.db', '*.sqlite', '*.sqlite3', '*.pyc',
                   'promo_*', 'html_preview.png', 'introduction.html', 'promo_article.md',
                   '.env', '.fuse_hidden*')
$ignoreDirSig  = @('__pycache__', '.git')
function Test-IgnoredSig {
    param([string]$relPath)
    $parts = $relPath -split '[\\/]'
    foreach ($d in $ignoreDirSig)  { if ($parts -contains $d) { return $true } }
    $leaf = $parts[-1]
    foreach ($p in $ignoreFileSig) { if ($leaf -like $p)      { return $true } }
    return $false
}
function Get-DirSig {
    param([string]$dir)
    if (-not (Test-Path $dir)) { return $null }
    $entries = Get-ChildItem $dir -Recurse -File -Force -EA 0 | ForEach-Object {
        $rel = $_.FullName.Substring($dir.Length).TrimStart('\','/')
        if (Test-IgnoredSig $rel) { return }
        $h = (Get-FileHash $_.FullName -Algorithm SHA1).Hash
        "$($rel.ToLower()):$h"
    } | Where-Object { $_ } | Sort-Object
    if (-not $entries) { return "EMPTY" }
    $bytes = [Text.Encoding]::UTF8.GetBytes(($entries -join "`n"))
    $ms = New-Object IO.MemoryStream(,$bytes)
    return (Get-FileHash -InputStream $ms -Algorithm SHA1).Hash
}

$mySkills = @(
    "ai-news-video", "bcp-drill-doc", "benson-skill-sync", "bootstrap-ui", "easymap", "eip-item-builder",
    "eip-line-radar", "ekb-note", "ekb-note-tts", "file-organizer", "fortigate-api-spec", "fortigate-qa",
    "grill-me", "handover",
    "image-gen", "isms-audit-prep", "meeting-record", "project-dashboard", "project-dev-manager", "project-pulse",
    "proposal-doc", "proposal-narration", "proposal-pptx", "quote-builder",
    "rfp-builder", "sa-design", "service-sqa", "work-review", "workplan-doc"
)

Write-Host "`n[Sync] benson-skills" -ForegroundColor Cyan
Write-Host "  src: $src" -ForegroundColor Gray
Write-Host "  dst: $dst" -ForegroundColor Gray

# 0. 先拉遠端（含另一台電腦剛 push 的 skill），避免兩台互相覆蓋 / push 衝突
Push-Location $repoRoot
Write-Host "  [Pull] git pull --rebase --autostash" -ForegroundColor Gray
git pull --rebase --autostash 2>&1 | Write-Host
$pullExit = $LASTEXITCODE
Pop-Location
if ($pullExit -ne 0) {
    Write-Error "git pull --rebase 失敗（可能有衝突）。請先手動解決，再重跑 sync。"
    exit 1
}

# 1. 不整個清空 dst —— 只更新本機有的 skill，保留另一台電腦維護的 skill
New-Item -ItemType Directory -Force -Path $dst | Out-Null

# 2. 同步白名單 skill（雙機防互覆）：
#    本機有          -> 複製 / 覆蓋更新
#    本機無、repo 有   -> 保留不動（多半是另一台電腦的，別誤刪）
#    本機無、repo 也無 -> 列 MISSING 警告
$missing = @()
$preserved = @()
foreach ($s in $mySkills) {
    $srcPath = Join-Path $src $s
    $dstPath = Join-Path $dst $s
    if (Test-Path $srcPath) {
        if (Test-Path $dstPath) { Remove-Item $dstPath -Recurse -Force }
        Copy-Item $srcPath $dstPath -Recurse -Force
    } elseif (Test-Path $dstPath) {
        $preserved += $s
    } else {
        $missing += $s
    }
}
if ($preserved.Count -gt 0) {
    Write-Host "  [保留] 本機無、保留 repo 既有（可能來自另一台電腦）: $($preserved -join ', ')" -ForegroundColor DarkYellow
}
if ($missing.Count -gt 0) {
    Write-Warning "MISSING（白名單有，但本機與 repo 都找不到）: $($missing -join ', ')"
}

# 2b. Prune：repo 內存在、但已不在白名單的 skill -> 刪除（＝刻意移除 skill 的唯一途徑）
Get-ChildItem $dst -Directory | Where-Object { $mySkills -notcontains $_.Name } | ForEach-Object {
    Write-Host "  [移除] 不在白名單，從 marketplace 刪除: $($_.Name)" -ForegroundColor Red
    Remove-Item $_.FullName -Recurse -Force
}

# 3. 清不必要檔
$cleanPatterns = @("*.zip", "*.db", "*.sqlite", "*.sqlite3", "*.pyc")
foreach ($pat in $cleanPatterns) {
    Get-ChildItem $dst -Recurse -File -Filter $pat -EA 0 | Remove-Item -Force
}
Get-ChildItem $dst -Recurse -Directory -Filter "__pycache__" -EA 0 | Remove-Item -Recurse -Force
Get-ChildItem $dst -Recurse -File -Filter ".fuse_hidden*" -Force -EA 0 | Remove-Item -Force

# handover 的 promo / introduction 行銷資產
$handover = Join-Path $dst "handover"
if (Test-Path $handover) {
    Get-ChildItem $handover -File -Filter "promo_*" -EA 0 | Remove-Item -Force
    foreach ($f in @("html_preview.png", "introduction.html", "promo_article.md")) {
        $p = Join-Path $handover $f
        if (Test-Path $p) { Remove-Item $p -Force }
    }
}

# .env -> .env.example
Get-ChildItem $dst -Recurse -File -Filter ".env" -Force -EA 0 | ForEach-Object {
    Move-Item $_.FullName "$($_.FullName).example" -Force
}

# 4. 統一 SKILL.md 大寫
Get-ChildItem $dst -Recurse -File -Filter "skill.md" | ForEach-Object {
    $tmp = Join-Path $_.DirectoryName "_skill_tmp.md"
    Rename-Item $_.FullName $tmp -Force
    Rename-Item $tmp "SKILL.md" -Force
}

# 5. 驗證 SKILL.md 都存在
$bad = @()
Get-ChildItem $dst -Directory | ForEach-Object {
    if (-not (Test-Path (Join-Path $_.FullName "SKILL.md"))) { $bad += $_.Name }
}
if ($bad.Count -gt 0) {
    Write-Error "缺 SKILL.md: $($bad -join ', ')"
    exit 1
}
$skillCount = (Get-ChildItem $dst -Directory).Count
Write-Host "  [OK] $skillCount 個 skill 已同步" -ForegroundColor Green

# 5b. 自動重建 README 的 skill 清單區塊
function Get-SkillShortDesc {
    param([string]$SkillMdPath)
    $raw = Get-Content $SkillMdPath -Raw -Encoding UTF8
    if ($raw -match '(?ms)^---\s*\r?\n(.*?)\r?\n---') {
        $fm = $matches[1]
        if ($fm -match '(?ms)^description:\s*(.+?)(?=\r?\n[A-Za-z_][A-Za-z0-9_-]*\s*:|\r?\n---|\z)') {
            $desc = $matches[1]
            # 處理 YAML block scalar 指示符：description: |  或 description: >
            # 第一行如果只有 | 或 > 就去掉
            $desc = $desc -replace '^\s*[\|>][+-]?\s*\r?\n', ''
            # 折疊所有空白為單空格
            $desc = ($desc -replace '\s+', ' ').Trim()
            # 移除 markdown 強調記號 ** __ *
            $desc = $desc -replace '\*\*|__', '' -replace '(?<!\*)\*(?!\*)', ''
            # 移除開頭殘留的引號 / 縮排記號
            $desc = $desc -replace '^["''>\s]+', ''
            # 取第一句（只用中文「。」「！」為界，避免切到英文版號 / 副檔名）
            $first = ($desc -split '[。！]')[0].Trim()
            # 過濾會破壞 markdown 表格的字元
            $first = $first -replace '\|', '｜' -replace '`', "'"
            # 移除結尾不完整的括號 / 引號
            $first = $first -replace '[\(\["「『]\s*$', ''
            if ($first.Length -gt 60) { $first = $first.Substring(0, 60).TrimEnd() + '…' }
            return $first.Trim()
        }
    }
    return "（無 description）"
}

function Get-SkillUpdated {
    param([string]$SkillDir)
    # 1. 先抓 SKILL.md 版本歷史內第一個 vN.M (YYYY-MM-DD)
    $mdPath = Join-Path $SkillDir "SKILL.md"
    if (Test-Path $mdPath) {
        $raw = Get-Content $mdPath -Raw -Encoding UTF8
        if ($raw -match 'v[\d.]+\s*\((\d{4}-\d{2}-\d{2})\)') {
            return $matches[1]
        }
    }
    # 2. fallback: skill 目錄內所有檔最新 mtime
    $latest = Get-ChildItem $SkillDir -Recurse -File -EA 0 |
              Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($latest) { return $latest.LastWriteTime.ToString('yyyy-MM-dd') }
    return '-'
}

# 用 source 目錄抓日期 (有 SKILL.md 的版本歷史), 表格依 Skill 名排序
$rowsRaw = Get-ChildItem $dst -Directory | Sort-Object Name | ForEach-Object {
    $publishedName = $_.Name
    # handover 在源端叫 handover-skill, 對應回去
    $srcName = $publishedName
    $srcDir = Join-Path $src $srcName
    $shortDesc = Get-SkillShortDesc -SkillMdPath (Join-Path $_.FullName "SKILL.md")
    $updated = Get-SkillUpdated -SkillDir $srcDir
    [PSCustomObject]@{
        Name = $publishedName
        Desc = $shortDesc
        Updated = $updated
    }
}

$rows = $rowsRaw | Sort-Object @{Expression='Updated';Descending=$true}, @{Expression='Name';Descending=$false} | ForEach-Object {
    "| $($_.Name) | $($_.Updated) | $($_.Desc) |"
}

$startMarker = '<!-- SKILLS-LIST-START -->'
$endMarker = '<!-- SKILLS-LIST-END -->'

$skillsBlock = @"
$startMarker
## 包含的 skill ($skillCount)

| Skill | 最近更新 | 用途 |
|---|---|---|
$($rows -join "`r`n")
$endMarker
"@

$readmePath = Join-Path $repoRoot "README.md"
$readme = Get-Content $readmePath -Raw -Encoding UTF8
$startIdx = $readme.IndexOf($startMarker)
$endIdx = if ($startIdx -ge 0) { $readme.IndexOf($endMarker, $startIdx) } else { -1 }
if ($startIdx -ge 0 -and $endIdx -gt $startIdx) {
    $endIdx += $endMarker.Length
    $newReadme = $readme.Substring(0, $startIdx) + $skillsBlock + $readme.Substring($endIdx)
    [System.IO.File]::WriteAllText($readmePath, $newReadme, [System.Text.UTF8Encoding]::new($false))
    Write-Host "  [OK] README skill 清單已重建" -ForegroundColor Green
} else {
    Write-Warning "README 找不到 SKILLS-LIST 區塊 marker，未更新"
}

# 6. git status
Set-Location $repoRoot
$status = git status --porcelain
if (-not $status) {
    Write-Host "  [Skip] 沒變更，不 commit" -ForegroundColor Yellow
    exit 0
}

# 6b. 自動 bump plugin.json version (patch +1) —— 沒 bump 的話 Cowork 端 Update 永遠灰掉
$pluginJsonPath = Join-Path $repoRoot "plugins\benson-skills\.claude-plugin\plugin.json"
if (Test-Path $pluginJsonPath) {
    $pj = Get-Content $pluginJsonPath -Raw -Encoding UTF8
    if ($pj -match '"version"\s*:\s*"(\d+)\.(\d+)\.(\d+)"') {
        $newVer = "$([int]$matches[1]).$([int]$matches[2]).$([int]$matches[3] + 1)"
        $pj = $pj -replace '("version"\s*:\s*")\d+\.\d+\.\d+(")', "`${1}$newVer`${2}"
        [System.IO.File]::WriteAllText($pluginJsonPath, $pj, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  [Ver] plugin.json version -> $newVer" -ForegroundColor Green
    } else {
        Write-Warning "plugin.json 找不到 version 欄位，未自動 bump（Cowork 可能收不到更新）"
    }
}

# 7. commit + push
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$commitMsg = if ($Message) { "$Message ($timestamp)" } else { "Sync skills: $timestamp" }

git add -A
git commit -m $commitMsg
if ($LASTEXITCODE -ne 0) {
    Write-Error "git commit 失敗"
    exit 1
}

git push
if ($LASTEXITCODE -ne 0) {
    Write-Error "git push 失敗"
    exit 1
}

# 7b. push 成功 -> 把已發佈 skill 的指紋寫回基準狀態檔（讓 check-skills 知道「本機=GitHub」，不誤判成本機未發佈）
$state = @{}
if (Test-Path $stateFile) {
    try {
        $obj = Get-Content $stateFile -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($obj) { $obj.PSObject.Properties | ForEach-Object { $state[$_.Name] = $_.Value } }
    } catch { Write-Warning "讀 state 失敗，視為空：$($_.Exception.Message)" }
}
Get-ChildItem $dst -Directory | ForEach-Object { $state[$_.Name] = (Get-DirSig $_.FullName) }
[System.IO.File]::WriteAllText($stateFile, ($state | ConvertTo-Json), [System.Text.UTF8Encoding]::new($false))
Write-Host "  [Ver] 基準指紋已更新 -> $stateFile" -ForegroundColor Green

Write-Host "`n[Done] Pushed: $commitMsg" -ForegroundColor Cyan
Write-Host "  其他機器跑：claude plugin marketplace update" -ForegroundColor Yellow
