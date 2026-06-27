param([switch]$Fix)
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root
$issues = @()

$skillsText = Get-Content "skills/README.md" -Raw -Encoding UTF8
$headerLines = ($skillsText -split "`n")[0..5] -join " "

$sTotal = 0; $sAnthropic = 0; $sBenson = 0; $sGithub = 0; $sPlugin = 0

if ($headerLines -match '\uFF08(\d+)\uFF09.*?\uFF08(\d+)\uFF09.*?\uFF08(\d+)\uFF09.*?\uFF08(\d+)\uFF09') {
    $sAnthropic = [int]$Matches[1]
    $sBenson    = [int]$Matches[2]
    $sGithub    = [int]$Matches[3]
    $sPlugin    = [int]$Matches[4]
    if ($headerLines -match '\uFF08\u5171 (\d+)') {
        $sTotal = [int]$Matches[1]
    }
    Write-Host "skills/README.md: total=$sTotal (A=$sAnthropic B=$sBenson G=$sGithub P=$sPlugin)"
} else {
    Write-Host "[BLOCK] Cannot parse skills/README.md header"
    exit 2
}

$rootText = Get-Content "README.md" -Raw -Encoding UTF8

# Banner
if ($rootText -match 'SSDLC . (\d+) . AI') {
    $n = [int]$Matches[1]; if ($n -ne $sTotal) { $issues += "Banner: $n -> $sTotal" }
} else { $issues += "Cannot find banner count" }

# Overview
if ($rootText -match '\*\*(\d+)\s*\w*\*\* AI') {
    $n = [int]$Matches[1]; if ($n -ne $sTotal) { $issues += "Overview: $n -> $sTotal" }
}

# Source breakdown
if ($rootText -match 'Anthropic \S+ \uFF08(\d+)') {
    $n = [int]$Matches[1]; if ($n -ne $sAnthropic) { $issues += "Anthropic: $n -> $sAnthropic" }
}
if ($rootText -match 'Benson \S+ \uFF08(\d+)') {
    $n = [int]$Matches[1]; if ($n -ne $sBenson) { $issues += "Benson: $n -> $sBenson" }
}
$gitMatches = [regex]::Matches($rootText, 'GitHub \S+ \uFF08(\d+)')
foreach ($m in $gitMatches) {
    $n = [int]$m.Groups[1].Value
    if ($n -ne $sGithub -and $n -ne $sPlugin) { $issues += "GitHub: $n -> $sGithub" }
}
if ($sPlugin -gt 0) {
    $plgMatch = [regex]::Match($rootText, '\u63D2\u4EF6.*?\uFF08(\d+)')
    if ($plgMatch.Success) {
        $n = [int]$plgMatch.Groups[1].Value
        if ($n -ne $sPlugin) { $issues += "Plugin: $n -> $sPlugin" }
    }
}

# Total line: "合計 N 個 Skill" = U+5408 U+8A08 N U+500B Skill
$sumMatch = [regex]::Match($rootText, '\u5408\u8A08 (\d+) \u500B Skill')
if ($sumMatch.Success) {
    $n = [int]$sumMatch.Groups[1].Value
    if ($n -ne $sTotal) { $issues += "SumLine: $n -> $sTotal" }
}

# Repo structure: "N 個 Skill 實體" = N U+500B Skill U+5BE6 U+9AD4
$repoMatch = [regex]::Match($rootText, '(\d+) \u500B Skill \u5BE6\u9AD4')
if ($repoMatch.Success) {
    $n = [int]$repoMatch.Groups[1].Value
    if ($n -ne $sTotal) { $issues += "RepoStruct: $n -> $sTotal" }
}

# Seven stages: "七大" = U+4E03 U+5927
if ($rootText -match '\u4E03\u5927') { $issues += "Still says 7 stages (should be 6 core + cross-phase)" }

if ($issues.Count -eq 0) {
    Write-Host "[OK] READMEs synced: total=$sTotal ($sAnthropic+$sBenson+$sGithub+$sPlugin)" -ForegroundColor Green
    exit 0
}
Write-Host ("SYNC ISSUES (" + $issues.Count + "):") -ForegroundColor Yellow
foreach ($i in $issues) { Write-Host "  $i" -ForegroundColor Yellow }
exit $issues.Count