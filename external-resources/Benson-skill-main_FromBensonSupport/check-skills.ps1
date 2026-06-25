<#
.SYNOPSIS
    以 GitHub (MMBenson/Benson-skill) 為主，檢查本機 ~/.claude/skills 是否為最新。
    用「基準指紋」(merge-base) 判方向，避免把本機未發佈的改動蓋掉。

.DESCRIPTION
    方向：GitHub(repo) -> 本機 ~/.claude/skills（下載 / 對齊）
    這支是「檢查 + 更新本機」用；要把本機修改發佈上 GitHub 請改用 sync.ps1。

    判斷邏輯（逐 skill，用 .skill-sync-state.json 記的「上次對齊指紋」當基準 base）：
      - repo 有、本機沒有                         -> [INSTALL]  抓下來，記 base
      - repo 有、本機有、指紋一致                  -> [OK]      刷新 base
      - 指紋不同、沒有 base（首次比對、無歷史）     -> [UPDATE]  GitHub 為主，直接對齊（備份本機後覆蓋），建立 base
      - 指紋不同、base==本機（本機沒動、GitHub 動了）-> [UPDATE]  GitHub 較新 → 備份本機後覆蓋，更新 base
      - 指紋不同、base==repo（GitHub 沒動、本機動了）-> [本機較新] 不覆蓋 → 收進報告 + LINE 提醒人工 sync
      - 指紋不同、base 兩邊都不等（都改過）         -> [衝突]    不覆蓋 → 收進報告 + LINE
      - 本機有、repo 沒有、且不在「永不發佈」清單    -> [未發佈]  本機獨有新 skill → 收進報告 + LINE

    跑完若有「需人工處理」項目 -> 推播 LINE 提醒 Benson（含電腦名 + 清單）。
    LINE token 走 $env:LINE_PUSH_TOKEN（沒設就只出報告、不推）；對象走 $env:LINE_PUSH_TO（沒設用預設）。

    比對忽略「不會發佈的本機檔」（*.db / *.zip / __pycache__ / promo_* 等），
    覆蓋前一律備份本機到 ~/.claude/.skill-backups/<skill>_<時間>/。

.EXAMPLE
    .\check-skills.ps1                  # 檢查並更新本機到最新（安全：不蓋本機未發佈改動）
    .\check-skills.ps1 -WhatIf          # 只報告差異，不動本機 / 不推 LINE
    .\check-skills.ps1 -WhatIf -Detail  # 只報告，且列到「哪幾個檔不同」
#>
[CmdletBinding()]
param(
    [switch]$WhatIf,
    [switch]$Detail
)

$ErrorActionPreference = "Stop"

$repoRoot   = $PSScriptRoot
$repoSkills = Join-Path $repoRoot "plugins\benson-skills\skills"
$localRoot  = Join-Path $env:USERPROFILE ".claude\skills"
$stateFile  = Join-Path $env:USERPROFILE ".claude\.skill-sync-state.json"
$backupRoot = Join-Path $env:USERPROFILE ".claude\.skill-backups"
$reportFile = Join-Path $env:USERPROFILE ".claude\.skill-sync-report.md"

# 永不發佈的本機 skill（官方 + 個人）——不要被當成「忘了 sync」而誤報
$neverPublish = @(
    'doc-coauthoring','docx','get-api-docs','mcp-builder','pdf','pptx',
    'skill-creator','theme-factory','web-artifacts-builder','webapp-testing','xlsx',
    'novel-memory'
)

Write-Host "`n[Check] benson-skills (GitHub 為主・基準指紋防覆蓋)" -ForegroundColor Cyan
Write-Host "  repo : $repoSkills" -ForegroundColor Gray
Write-Host "  local: $localRoot"  -ForegroundColor Gray

# 1. 先抓 GitHub 最新（master）
Push-Location $repoRoot
Write-Host "  [Pull] git pull --rebase --autostash" -ForegroundColor Gray
git pull --rebase --autostash 2>&1 | Write-Host
$pullExit = $LASTEXITCODE
Pop-Location
if ($pullExit -ne 0) {
    Write-Error "git pull --rebase 失敗（可能有衝突）。請先手動解決，再重跑。"
    exit 1
}

# 比對時要忽略的「本機專屬 / 不發佈」檔案
$ignoreFile = @('*.zip', '*.db', '*.sqlite', '*.sqlite3', '*.pyc',
                'promo_*', 'html_preview.png', 'introduction.html', 'promo_article.md',
                '.env', '.fuse_hidden*')
$ignoreDir  = @('__pycache__', '.git')

function Test-Ignored {
    param([string]$relPath)
    $parts = $relPath -split '[\\/]'
    foreach ($d in $ignoreDir)  { if ($parts -contains $d) { return $true } }
    $leaf = $parts[-1]
    foreach ($p in $ignoreFile) { if ($leaf -like $p)      { return $true } }
    return $false
}

# 算 skill 目錄的內容指紋（相對路徑(小寫)+每檔 SHA1，排序後再 hash）
function Get-DirSig {
    param([string]$dir)
    if (-not (Test-Path $dir)) { return $null }
    $entries = Get-ChildItem $dir -Recurse -File -Force -EA 0 | ForEach-Object {
        $rel = $_.FullName.Substring($dir.Length).TrimStart('\','/')
        if (Test-Ignored $rel) { return }
        $h = (Get-FileHash $_.FullName -Algorithm SHA1).Hash
        "$($rel.ToLower()):$h"
    } | Where-Object { $_ } | Sort-Object
    if (-not $entries) { return "EMPTY" }
    $bytes = [Text.Encoding]::UTF8.GetBytes(($entries -join "`n"))
    $ms = New-Object IO.MemoryStream(,$bytes)
    return (Get-FileHash -InputStream $ms -Algorithm SHA1).Hash
}

# 取 skill 目錄的「每檔指紋表」；給 -Detail 列檔案層級差異
function Get-DirFileMap {
    param([string]$dir)
    $map = @{}
    if (-not (Test-Path $dir)) { return $map }
    Get-ChildItem $dir -Recurse -File -Force -EA 0 | ForEach-Object {
        $rel = $_.FullName.Substring($dir.Length).TrimStart('\','/')
        if (Test-Ignored $rel) { return }
        $map[$rel.ToLower()] = (Get-FileHash $_.FullName -Algorithm SHA1).Hash
    }
    return $map
}

# 比兩個指紋表，回傳差異描述（repo獨有 / 本機獨有 / 內容不同）
function Get-FileDiffs {
    param($repoMap, $localMap)
    $diffs = @()
    foreach ($k in (@($repoMap.Keys) + @($localMap.Keys) | Sort-Object -Unique)) {
        $r = $repoMap[$k]; $l = $localMap[$k]
        if     (-not $l)   { $diffs += "repo獨有 : $k" }
        elseif (-not $r)   { $diffs += "本機獨有: $k" }
        elseif ($r -ne $l) { $diffs += "內容不同: $k" }
    }
    return $diffs
}

# 以 GitHub 版覆蓋本機（保留本機專屬檔如 *.db / promo_*，只蓋掉會發佈的內容）
function Update-LocalFromRepo {
    param([string]$repoDir, [string]$localDir)
    New-Item -ItemType Directory -Force -Path $localDir | Out-Null
    Get-ChildItem $localDir -Recurse -File -Force -EA 0 | ForEach-Object {
        $rel = $_.FullName.Substring($localDir.Length).TrimStart('\','/')
        if (Test-Ignored $rel) { return }
        $repoCounterpart = Join-Path $repoDir $rel
        if (-not (Test-Path $repoCounterpart)) { Remove-Item $_.FullName -Force }
    }
    Get-ChildItem $repoDir -Recurse -File -Force -EA 0 | ForEach-Object {
        $rel = $_.FullName.Substring($repoDir.Length).TrimStart('\','/')
        $target = Join-Path $localDir $rel
        New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
        Copy-Item $_.FullName $target -Force
    }
}

# 覆蓋前備份本機該 skill（避免任何意外）
function Backup-LocalSkill {
    param([string]$localDir, [string]$name)
    if (-not (Test-Path $localDir)) { return }
    $stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $bdir = Join-Path $backupRoot "${name}_$stamp"
    New-Item -ItemType Directory -Force -Path $bdir | Out-Null
    Copy-Item (Join-Path $localDir '*') $bdir -Recurse -Force -EA 0
    Write-Host "      [備份] 本機舊版 -> $bdir" -ForegroundColor DarkGray
}

# 讀 / 寫「上次對齊指紋」狀態（每台各自，不進 git）
function Load-State {
    $h = @{}
    if (Test-Path $stateFile) {
        try {
            $obj = Get-Content $stateFile -Raw -Encoding UTF8 | ConvertFrom-Json
            if ($obj) { $obj.PSObject.Properties | ForEach-Object { $h[$_.Name] = $_.Value } }
        } catch { Write-Warning "讀 state 失敗，視為空：$($_.Exception.Message)" }
    }
    return $h
}
function Save-State {
    param($state)
    $json = ($state | ConvertTo-Json)
    [System.IO.File]::WriteAllText($stateFile, $json, [System.Text.UTF8Encoding]::new($false))
}

# LINE 推播提醒（token 沒設就略過）
function Send-LineNotify {
    param([string]$Text)
    $token = $env:LINE_PUSH_TOKEN
    if (-not $token) {
        Write-Host "  [LINE] 未設 `$env:LINE_PUSH_TOKEN -> 略過推播（已出報告）" -ForegroundColor DarkYellow
        return $false
    }
    $to = if ($env:LINE_PUSH_TO) { $env:LINE_PUSH_TO } else { 'U9f13c28b1df2ddbc5a1ed6a7c9358830' }
    $body = @{ to = $to; messages = @(@{ type = 'text'; text = $Text }) } | ConvertTo-Json -Depth 6
    try {
        Invoke-RestMethod -Method Post -Uri 'https://api.line.me/v2/bot/message/push' `
            -Headers @{ Authorization = "Bearer $token" } `
            -ContentType 'application/json; charset=utf-8' `
            -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) | Out-Null
        Write-Host "  [LINE] 已推播提醒給 Benson" -ForegroundColor Green
        return $true
    } catch {
        Write-Warning "LINE 推播失敗：$($_.Exception.Message)"
        return $false
    }
}

if (-not (Test-Path $repoSkills)) { Write-Error "repo skills 目錄不存在：$repoSkills"; exit 1 }

$state = Load-State

$install = @(); $update = @(); $ok = @()
$needHuman = @()         # 需人工：本機較新 / 衝突 / 無基準
$detailMap = @{}
$script:lineSent = $false

# 2. 逐 skill 比對（以 repo 為主清單）
Get-ChildItem $repoSkills -Directory | ForEach-Object {
    $name     = $_.Name
    $repoDir  = $_.FullName
    $localDir = Join-Path $localRoot $name

    $sigRepo = Get-DirSig $repoDir

    if (-not (Test-Path $localDir)) {
        $install += $name
        if (-not $WhatIf) {
            Update-LocalFromRepo -repoDir $repoDir -localDir $localDir
            $state[$name] = $sigRepo
        }
        return
    }

    $sigLocal = Get-DirSig $localDir
    if ($sigRepo -eq $sigLocal) {
        $ok += $name
        if (-not $WhatIf) { $state[$name] = $sigRepo }
        return
    }

    # 指紋不同 -> 用 base 判方向
    $base = $state[$name]
    if ($Detail) { $detailMap[$name] = Get-FileDiffs (Get-DirFileMap $repoDir) (Get-DirFileMap $localDir) }

    if ((-not $base) -or ($base -eq $sigLocal)) {
        # 無基準（首次比對、無歷史 -> GitHub 為主，直接對齊）
        # 或 本機沒動、GitHub 動了（GitHub 較新）
        # -> 都是「以 GitHub 為準更新本機」（覆蓋前先備份，之後就有 base 保護）
        $update += $name
        if (-not $WhatIf) {
            Backup-LocalSkill -localDir $localDir -name $name
            Update-LocalFromRepo -repoDir $repoDir -localDir $localDir
            $state[$name] = $sigRepo
        }
    }
    elseif ($base -eq $sigRepo) {
        # GitHub 沒動、本機動了 -> 本機有未發佈改動 -> 不蓋，提醒
        $needHuman += [PSCustomObject]@{ Name = $name; Why = '本機有未發佈改動（記得跑 sync.ps1）' }
    }
    else {
        # 兩邊都動過 -> 衝突
        $needHuman += [PSCustomObject]@{ Name = $name; Why = '本機與 GitHub 都改過（衝突，需人工合併）' }
    }
}

# 3. 本機有、repo 沒有的 skill；排除「永不發佈」清單 -> 其餘視為未發佈新 skill
$repoNames = (Get-ChildItem $repoSkills -Directory).Name
$unpublishedNew = @()
Get-ChildItem $localRoot -Directory -EA 0 | Where-Object {
    $repoNames -notcontains $_.Name -and $neverPublish -notcontains $_.Name
} | ForEach-Object { $unpublishedNew += $_.Name }

if (-not $WhatIf) { Save-State $state }

# 4. 報告
Write-Host "`n===== 檢查結果 =====" -ForegroundColor Cyan
$verb = if ($WhatIf) { "需安裝" } else { "已安裝" }
if ($install.Count) { Write-Host "  [INSTALL] $verb（本機原本沒有）: $($install -join ', ')" -ForegroundColor Green }
$verb2 = if ($WhatIf) { "需更新" } else { "已更新" }
if ($update.Count)  { Write-Host "  [UPDATE]  $verb2（GitHub 為準：本機沒動／首次對齊，已備份後覆蓋）: $($update -join ', ')" -ForegroundColor Yellow }
if ($ok.Count)      { Write-Host "  [OK]      已是最新（$($ok.Count)）: $($ok -join ', ')" -ForegroundColor DarkGray }
foreach ($h in $needHuman) {
    Write-Host "  [需人工]  $($h.Name)：$($h.Why)" -ForegroundColor Magenta
}
if ($unpublishedNew.Count) {
    Write-Host "  [未發佈]  本機獨有、GitHub 沒有（要上傳請跑 sync.ps1）: $($unpublishedNew -join ', ')" -ForegroundColor Magenta
}

if ($Detail -and $detailMap.Count) {
    Write-Host "`n[檔案層級差異]" -ForegroundColor Cyan
    foreach ($n in ($detailMap.Keys | Sort-Object)) {
        Write-Host "  == $n ==" -ForegroundColor White
        $detailMap[$n] | ForEach-Object { Write-Host "     $_" }
    }
}

# 5. 只有「需人工」(本機較新 / 衝突) 才寫報告 + 推 LINE。
#    本機獨有的新 skill 僅在 console 提示、不推 LINE：多半是個人 / 不發佈 skill（且它永遠不會被覆蓋、不會丟），
#    天天推等於洗版。真要發佈跑 sync.ps1 即可。
$humanCount = $needHuman.Count
if ($humanCount -gt 0) {
    $stampNow = Get-Date -Format 'yyyy-MM-dd HH:mm'
    $rep = @("# Skill 同步提醒（$env:COMPUTERNAME）", "", "時間：$stampNow", "",
             "## 本機較新 / 衝突（已暫停覆蓋，請人工處理）")
    foreach ($h in $needHuman) { $rep += "- **$($h.Name)**：$($h.Why)" }
    $rep += ""
    $rep += "→ 跑 ``sync.ps1`` 發佈，或自行確認。"
    [System.IO.File]::WriteAllText($reportFile, ($rep -join "`r`n"), [System.Text.UTF8Encoding]::new($false))
    Write-Host "`n  [報告] $reportFile" -ForegroundColor Cyan

    if (-not $WhatIf) {
        $lines = @("⚠️ Claude Skill 同步提醒（$env:COMPUTERNAME）", "")
        $lines += "以下 skill 本機較新／衝突，已暫停覆蓋，請人工處理："
        foreach ($h in $needHuman) { $lines += "• $($h.Name)：$($h.Why)" }
        $lines += ""
        $lines += "→ 在該機跑 sync.ps1 發佈，或自行確認。"
        $script:lineSent = Send-LineNotify -Text ($lines -join "`n")
    }
}

# 6. 結尾
$changed = $install.Count + $update.Count
if ($WhatIf) {
    Write-Host "`n[WhatIf] 僅檢查，未實際更新 / 未推 LINE。需更新 $changed 個、需人工 $humanCount 個。" -ForegroundColor Cyan
} elseif ($changed -gt 0 -or $humanCount -gt 0) {
    $notifyNote = if ($humanCount -gt 0) { if ($script:lineSent) { '（已出報告 + 已推 LINE）' } else { '（已出報告；LINE 未推，檢查 $env:LINE_PUSH_TOKEN）' } } else { '' }
    Write-Host "`n[Done] 更新 $changed 個；需人工 $humanCount 個$notifyNote。" -ForegroundColor Cyan
    Write-Host "  （Claude Code 載入的 marketplace 版另跑：claude plugin marketplace update）" -ForegroundColor DarkGray
} else {
    Write-Host "`n[Done] 本機已是最新，無需更新。" -ForegroundColor Cyan
}
