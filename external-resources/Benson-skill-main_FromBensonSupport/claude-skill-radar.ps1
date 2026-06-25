#requires -Version 5.1
<#
.SYNOPSIS
  跨機 ~/.claude/skills 更新時間雷達。
.DESCRIPTION
  每台電腦跑一次，把本機每個 skill 的「最後更新時間 + 內容指紋」寫成 manifest，
  丟進 <repo>\.claude-sync\（隨 Synology 同步到另一台）。兩台都跑過後，
  任一台再跑就會印出跨機比對表：誰較新 / 誰缺 / 內容是否一致。
.PARAMETER ScanOnly
  只更新本機 manifest，不印比對表。
.EXAMPLE
  .\claude-skill-radar.ps1
#>
[CmdletBinding()]
param([switch]$ScanOnly)

$ErrorActionPreference = 'Stop'
$SkillsRoot  = Join-Path $env:USERPROFILE '.claude\skills'
$ExchangeDir = Join-Path $PSScriptRoot '.claude-sync'
New-Item -ItemType Directory -Force -Path $ExchangeDir | Out-Null

if (-not (Test-Path $SkillsRoot)) { throw "找不到 skills 目錄: $SkillsRoot" }

# ---- 1. 掃描本機 skills，建 manifest ----
$machine = $env:COMPUTERNAME
$items = foreach ($dir in Get-ChildItem -LiteralPath $SkillsRoot -Directory) {
    $files = Get-ChildItem -LiteralPath $dir.FullName -Recurse -File -ErrorAction SilentlyContinue
    if (-not $files) { continue }
    $mtime = ($files | Measure-Object LastWriteTimeUtc -Maximum).Maximum
    # 內容指紋：對每個檔 (相對路徑 + MD5) 串接後再 hash，與 mtime 無關 → 真內容比對
    $sb = New-Object System.Text.StringBuilder
    foreach ($f in ($files | Sort-Object FullName)) {
        $rel = $f.FullName.Substring($dir.FullName.Length)
        $h   = (Get-FileHash -LiteralPath $f.FullName -Algorithm MD5).Hash
        [void]$sb.Append("$rel|$h;")
    }
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($sb.ToString())
    $md5   = [System.Security.Cryptography.MD5]::Create()
    $hash  = ([System.BitConverter]::ToString($md5.ComputeHash($bytes)) -replace '-','').Substring(0,12)
    [pscustomobject]@{
        name  = $dir.Name
        mtime = $mtime.ToString('o')
        files = $files.Count
        hash  = $hash
    }
}

$manifest = [pscustomobject]@{
    machine      = $machine
    generated_at = (Get-Date).ToUniversalTime().ToString('o')
    skills_root  = $SkillsRoot
    skills       = @($items)
}
$outFile = Join-Path $ExchangeDir "skills.$machine.json"
$manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $outFile -Encoding UTF8
Write-Host "[radar] 本機 manifest 已更新：$outFile  ($(@($items).Count) skills，機器=$machine)" -ForegroundColor Green

if ($ScanOnly) { return }

# ---- 2. 讀所有機器 manifest，跨機比對 ----
$manifests = @(Get-ChildItem -LiteralPath $ExchangeDir -Filter 'skills.*.json' |
    ForEach-Object { Get-Content -LiteralPath $_.FullName -Raw | ConvertFrom-Json })
$machines = @($manifests | ForEach-Object { $_.machine })
Write-Host "`n[radar] 納入比對的機器：$($machines -join ', ')" -ForegroundColor Cyan
if ($manifests.Count -lt 2) {
    Write-Host "  ⚠ 目前只有 1 台的 manifest。到另一台跑一次本腳本，等 Synology 同步後再回來跑，就能比對。" -ForegroundColor Yellow
}

$allSkills = @($manifests.skills.name | Sort-Object -Unique)
$rows = foreach ($s in $allSkills) {
    $row = [ordered]@{ skill = $s }
    $hashes = @(); $present = @()
    foreach ($m in $manifests) {
        $rec = $m.skills | Where-Object name -eq $s
        if ($rec) {
            $row[$m.machine] = ([datetime]$rec.mtime).ToLocalTime().ToString('MM-dd HH:mm')
            $hashes += $rec.hash; $present += $m
        } else {
            $row[$m.machine] = '—缺—'
        }
    }
    if ($present.Count -lt $manifests.Count) {
        $row['狀態'] = '⚠缺漏'
    } elseif (@($hashes | Sort-Object -Unique).Count -le 1) {
        $row['狀態'] = '一致'
    } else {
        $newest = ($present | Sort-Object { [datetime]($_.skills | Where-Object name -eq $s).mtime } -Descending |
                   Select-Object -First 1).machine
        $row['狀態'] = "≠ $newest 較新"
    }
    [pscustomobject]$row
}
$rows | Format-Table -AutoSize

$problem = @($rows | Where-Object { $_.'狀態' -ne '一致' })
if ($manifests.Count -ge 2) {
    if ($problem.Count) {
        Write-Host "⚠ 需處理的 skill（$($problem.Count)）：" -ForegroundColor Yellow
        $problem | ForEach-Object { Write-Host ("  - {0,-24} {1}" -f $_.skill, $_.'狀態') }
    } else {
        Write-Host "✓ 兩台所有 skill 一致" -ForegroundColor Green
    }
}
