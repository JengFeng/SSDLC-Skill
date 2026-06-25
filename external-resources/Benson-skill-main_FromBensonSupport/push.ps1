<#
.SYNOPSIS
    發佈「直接在 repo 內改好的 skill」到 GitHub —— 純 git，不從 ~/.claude 覆蓋。

.DESCRIPTION
    用途：當你直接編輯 repo 內 plugins/benson-skills/skills/... 的檔（不是改 ~/.claude/skills）。
    與 sync.ps1 的差別：
      - sync.ps1  = ~/.claude/skills  →  repo（單向覆蓋，會刪掉 repo 內 source 沒有的檔）
      - push.ps1  = 只推 repo 現有工作目錄的改動（你直接改的就推上去，不覆蓋）
    動作：
      1. git pull --rebase --autostash（先對齊遠端）
      2. 自動 bump plugin.json version (patch +1) —— 讓 Cowork 端認得更新
      3. git add -A + commit + push

.EXAMPLE
    .\push.ps1
    .\push.ps1 -Message "sa-design: 補強 cross_audit"
#>

[CmdletBinding()]
param(
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"
$repoRoot = $PSScriptRoot
Set-Location $repoRoot

Write-Host "`n[Push] 發佈 repo 內現有改動（不碰 ~/.claude）" -ForegroundColor Cyan

# 1. 先對齊遠端
Write-Host "  [Pull] git pull --rebase --autostash" -ForegroundColor Gray
git pull --rebase --autostash 2>&1 | Write-Host
if ($LASTEXITCODE -ne 0) {
    Write-Error "git pull --rebase 失敗（可能有衝突）。先手動解決再重跑。"
    exit 1
}

# 2. 有沒有變更？沒有就不動
$status = git status --porcelain
if (-not $status) {
    Write-Host "  [Skip] 沒變更，不 commit" -ForegroundColor Yellow
    exit 0
}

# 3. 自動 bump plugin.json version (patch +1)
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

# 4. commit + push
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$commitMsg = if ($Message) { "$Message ($timestamp)" } else { "Publish repo edits: $timestamp" }

git add -A
git commit -m $commitMsg
if ($LASTEXITCODE -ne 0) { Write-Error "git commit 失敗"; exit 1 }

git push
if ($LASTEXITCODE -ne 0) { Write-Error "git push 失敗"; exit 1 }

Write-Host "`n[Done] Pushed: $commitMsg" -ForegroundColor Cyan
Write-Host "  Cowork 端：重整 marketplace 後 Update 鈕會亮" -ForegroundColor Yellow
