<#
install_scheduler.ps1 — 註冊 Windows Task Scheduler 跑 chat_sync.py

對「當前所在專案」（CWD 必須是專案根、有 .handover/ 資料夾）註冊一個 task，
任務名 `Handover_ChatSync_<project>`、間隔依 chat_api.sync_interval_min 設定（DB 沒設預設 30）。

用法：
  cd <專案根>
  pwsh -ExecutionPolicy Bypass -File ~/.claude/skills/handover-skill/tools/install_scheduler.ps1 -Install
  pwsh -ExecutionPolicy Bypass -File ~/.claude/skills/handover-skill/tools/install_scheduler.ps1 -Status
  pwsh -ExecutionPolicy Bypass -File ~/.claude/skills/handover-skill/tools/install_scheduler.ps1 -RunNow
  pwsh -ExecutionPolicy Bypass -File ~/.claude/skills/handover-skill/tools/install_scheduler.ps1 -Uninstall

  自訂頻率覆寫 DB 設定：
  pwsh -ExecutionPolicy Bypass -File install_scheduler.ps1 -Install -IntervalMinutes 15
#>

param(
    [switch]$Install,
    [switch]$Uninstall,
    [switch]$Status,
    [switch]$RunNow,
    [int]$IntervalMinutes = 0   # 0 = 從 DB 讀
)

$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$ChatSync   = Join-Path $ScriptDir "chat_sync.py"

# 專案：CWD
$ProjectDir = (Resolve-Path ".").Path
$ProjectName = Split-Path -Leaf $ProjectDir
$DB = Join-Path $ProjectDir ".handover\handover.db"

if (-not (Test-Path $DB)) {
    Write-Error "找不到 $DB — 請在專案根目錄執行（必須有 .handover/handover.db）"
    exit 1
}

# 任務名 = 專案名（清掉空白/特殊字元）
$safeName = ($ProjectName -replace '[\s\\/:*?"<>|]', '_')
$TaskName = "Handover_ChatSync_$safeName"

$Python = (Get-Command python -ErrorAction SilentlyContinue).Source
if (-not $Python) { Write-Error "找不到 python"; exit 1 }

function Get-IntervalFromDB {
    param([string]$dbPath)
    $py = "import sqlite3,json; c=sqlite3.connect(r'$dbPath'); r=c.execute(`"SELECT value FROM handover_config WHERE key='chat_api'`").fetchone(); print(json.loads(r[0]).get('sync_interval_min', 30) if r and r[0] else 30)"
    $val = & $Python -c $py 2>$null
    if ($val -match '^\d+$') { return [int]$val } else { return 30 }
}

if ($Install) {
    if ($IntervalMinutes -le 0) { $IntervalMinutes = Get-IntervalFromDB -dbPath $DB }
    if ($IntervalMinutes -lt 1 -or $IntervalMinutes -gt 1440) { Write-Error "interval 1-1440"; exit 1 }

    Write-Host "  Task        : $TaskName"
    Write-Host "  Project     : $ProjectName"
    Write-Host "  DB          : $DB"
    Write-Host "  chat_sync   : $ChatSync"
    Write-Host "  Interval    : $IntervalMinutes 分"

    if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "  舊任務已移除"
    }

    $action = New-ScheduledTaskAction -Execute $Python -Argument "`"$ChatSync`"" -WorkingDirectory $ProjectDir
    $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddSeconds(30) `
        -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes) `
        -RepetitionDuration (New-TimeSpan -Days 365)
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
        -StartWhenAvailable -RunOnlyIfNetworkAvailable `
        -ExecutionTimeLimit (New-TimeSpan -Minutes 5)

    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings `
        -Description "Handover chat_sync for $ProjectName — 每 $IntervalMinutes 分鐘" | Out-Null
    Write-Host "已註冊"
    exit 0
}

if ($Uninstall) {
    if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "已移除：$TaskName"
    } else { Write-Host "找不到 $TaskName" }
    exit 0
}

if ($Status) {
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if (-not $task) { Write-Host "未安裝"; exit 0 }
    $info = Get-ScheduledTaskInfo -TaskName $TaskName
    Write-Host "Task: $TaskName"
    Write-Host "  State        : $($task.State)"
    Write-Host "  Last Run     : $($info.LastRunTime)"
    Write-Host "  Last Result  : $($info.LastTaskResult)"
    Write-Host "  Next Run     : $($info.NextRunTime)"
    $log = Join-Path $ProjectDir ".handover\chat_sync.log"
    if (Test-Path $log) { Write-Host "Last 10 log:"; Get-Content $log -Tail 10 }
    exit 0
}

if ($RunNow) {
    Write-Host "Running chat_sync.py for $ProjectName ..."
    & $Python $ChatSync
    exit $LASTEXITCODE
}

Write-Host @"
用法：
  cd <專案根>
  pwsh -File install_scheduler.ps1 -Install [-IntervalMinutes 30]
  pwsh -File install_scheduler.ps1 -Status
  pwsh -File install_scheduler.ps1 -RunNow
  pwsh -File install_scheduler.ps1 -Uninstall
"@
