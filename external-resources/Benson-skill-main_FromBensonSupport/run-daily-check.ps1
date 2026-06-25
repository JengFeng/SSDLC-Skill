<#
.SYNOPSIS
    排程用包裝：每天自動跑 check-skills.ps1（GitHub 為主，對齊本機 skill），輸出寫入 log。
    由 Windows 排程工作 "BensonSkillCheck" 每天中午呼叫。
#>
$ErrorActionPreference = 'Continue'
$log = Join-Path $PSScriptRoot 'check-skills.log'

# 排程 process 不一定繼承到 User 級環境變數 -> 明確補載 LINE token（不寫死，避免上 git 外洩）
if (-not $env:LINE_PUSH_TOKEN) {
    $env:LINE_PUSH_TOKEN = [Environment]::GetEnvironmentVariable('LINE_PUSH_TOKEN', 'User')
}

"`n===== $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') =====" | Add-Content -Path $log -Encoding UTF8
try {
    & (Join-Path $PSScriptRoot 'check-skills.ps1') *>> $log
    "[exit] check-skills.ps1 完成" | Add-Content -Path $log -Encoding UTF8
} catch {
    "[ERROR] $($_.Exception.Message)" | Add-Content -Path $log -Encoding UTF8
}

# 只保留最近 ~500 行，避免 log 無限長
try {
    $lines = Get-Content -Path $log -Encoding UTF8 -EA 0
    if ($lines.Count -gt 500) {
        $lines[-500..-1] | Set-Content -Path $log -Encoding UTF8
    }
} catch {}
