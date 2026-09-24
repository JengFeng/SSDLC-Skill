<#
.SYNOPSIS
    SSDLC 框架主動掃描修復引擎
    替代 @optimize Group 5.5 的硬編碼檢查，改為動態掃描 + 自動修復。
    確保 README.md 的標準結構 tree、倉庫結構 table 與實際檔案系統完全一致。
#>

param(
    [string]$RootPath = ".",
    [switch]$DryRun,
    [switch]$VerboseOutput
)

$ErrorActionPreference = "Stop"
$fixes = @()
$warnings = @()

Push-Location $RootPath

# Helper: find next ## heading after a given position (line-start only, ignores ###)
function Find-NextHeading {
    param([string]$Text, [int]$StartPos)
    $rx = [regex]::new('^## ', [System.Text.RegularExpressions.RegexOptions]::Multiline)
    $m = $rx.Match($Text, $StartPos)
    if ($m.Success) { return $m.Index } else { return $Text.Length }
}

function Write-Fix { param($msg) $script:fixes += $msg; if ($VerboseOutput) { Write-Host "[FIX] $msg" -ForegroundColor Green } }
function Write-Warn { param($msg) $script:warnings += $msg; Write-Host "[WARN] $msg" -ForegroundColor Yellow }

# ═══════════════════════════════════════════
# STEP 0: 前置檢查 - README.md 是否存在且非空
# ═══════════════════════════════════════════
$readmePath = "README.md"
if (-not (Test-Path $readmePath)) {
    Write-Warn "README.md 不存在，嘗試從 Git 恢復..."
    $restored = git show HEAD:README.md 2>$null
    if ($restored) {
        $restored | Set-Content $readmePath -Encoding UTF8
        Write-Fix "README.md 從 Git HEAD 恢復"
    } else {
        Write-Error "無法恢復 README.md，終止掃描"
        Pop-Location; exit 1
    }
}

$readme = [System.IO.File]::ReadAllText($readmePath, [System.Text.Encoding]::UTF8)
if ($readme.Length -lt 100) {
    Write-Warn "README.md 內容異常短 ($($readme.Length) bytes)，從 Git 恢復..."
    $restored = git show HEAD:README.md 2>$null
    if ($restored) {
        [System.IO.File]::WriteAllText($readmePath, $restored, [System.Text.Encoding]::UTF8)
        $readme = $restored
        Write-Fix "README.md 從 Git HEAD 恢復（原檔案異常短）"
    }
}

# ═══════════════════════════════════════════
# STEP 1: 掃描實際檔案系統
# ═══════════════════════════════════════════
$actualDirs = (Get-ChildItem -Directory | Where-Object { $_.Name -notmatch '^\.git$|^\.codex$|^node_modules$|^__pycache__$' }).Name | Sort-Object
$actualFiles = (Get-ChildItem -File | Where-Object { $_.Name -notmatch '\.pyc$' }).Name | Sort-Object

if ($VerboseOutput) {
    Write-Host "[SCAN] Dirs: $($actualDirs -join ', ')"
    Write-Host "[SCAN] Files: $($actualFiles -join ', ')"
}

# ═══════════════════════════════════════════
# STEP 2: 解析 README 倉庫結構 table
# ═══════════════════════════════════════════
$tableDirs = @()
$tableFiles = @()
$inTable = $false

$idx = $readme.IndexOf("## 📂 倉庫結構")
if ($idx -ge 0) {
    $nextIdx = Find-NextHeading $readme ($idx + 1)
    if ($nextIdx -lt 0) { $nextIdx = $readme.Length }
    $tableSection = $readme.Substring($idx, $nextIdx - $idx)
    
    foreach ($line in ($tableSection -split '\r?\n')) {
        if ($line -match '^\| `([^`]+)` \|') {
            $e = $matches[1]
            if ($e.EndsWith('/')) { 
                $tableDirs += $e.TrimEnd('/')
            } elseif ($e -match '\.\w+$') {
                $tableFiles += $e
            }
        }
    }
}

# ═══════════════════════════════════════════
# STEP 3: 解析標準專案目錄結構 tree
# ═══════════════════════════════════════════
$treeDirs = @()
$treeIdx = $readme.IndexOf('## 📁 標準專案目錄結構')
if ($treeIdx -ge 0) {
    $treeEnd = Find-NextHeading $readme ($treeIdx + 1)
    if ($treeEnd -lt 0) { $treeEnd = $readme.Length }
    $treeSection = $readme.Substring($treeIdx, $treeEnd - $treeIdx)
    
    foreach ($line in ($treeSection -split '\r?\n')) {
        # Only match top-level dirs (├── dirname/ or └── dirname/)
        # These lines start with exactly ├── or └── (not nested │   ├──)
        if ($line -match '^[├└]── ([\w._-]+)/') {
            $treeDirs += $matches[1]
        }
    }
}

# ═══════════════════════════════════════════
# STEP 4: 修復 - 倉庫結構 table vs 實際
# ═══════════════════════════════════════════
$needTableUpdate = $false

# 4a: 實際有但 table 無 → 補入
foreach ($d in $actualDirs) {
    if ($d -notin $tableDirs) {
        Write-Warn "Table missing dir: $d"
        $needTableUpdate = $true
    }
}
foreach ($f in $actualFiles) {
    if ($f -notin $tableFiles) {
        Write-Warn "Table missing file: $f"
        $needTableUpdate = $true
    }
}

# 4b: Table 有但實際無 → 警告
foreach ($d in $tableDirs) {
    if ($d -notin $actualDirs) {
        Write-Warn "Orphan in table: $d/ (table has but filesystem doesn't)"
    }
}
foreach ($f in $tableFiles) {
    if ($f -notin $actualFiles) {
        Write-Warn "Orphan in table: $f (table has but filesystem doesn't)"
    }
}

if ($needTableUpdate) {
    Write-Fix "Rebuilding 倉庫結構 table from actual filesystem..."
    # Rebuild the full table section
    $newTable = @"

## 📂 倉庫結構

| 路徑 | 用途 |
|:---|:---|
"@
    # Dirs
    $dirDescriptions = @{
        '.agents' = '專案規章守則（AGENTS.md）與 7 階段 Skill 定義'
        '.vscode' = 'IDE 整合設定（tasks.json 自動化防線工作設定檔）'
        'baseline' = '獨立可執行專案快照（run.bat + app.py + requirements.txt）'
        'demo_project' = '完整驗證用示範專案（Flask + SQLite 員工管理 CRUD，已導入普級資安防護基準）'
        'docs' = '核心文件（CORE_RULES、TEMPLATE_SKILL、commands_reference、Harness_Optimization_SKILL）'
        'external-resources' = '外部 Skill 原始來源備份，含 Security-Principles 資安防護基準'
        'logs' = '全域錯誤日誌（A/B 類）、對話紀錄、迭代日誌'
        'outputs' = '跨階段安全產出彙整區（SBOM、安全檢核報告、安全掃描報告）'
        'scripts' = '輔助腳本 + 🔒 安全工具鏈（align_framework.ps1、pre_commit_secrets.py、run_security_scan.py 等）'
        'skills' = '88 個 Skill 實體（含 README.md 與歸類索引）'
        'snapshots' = '全域執行快照（snapshot_*.md + diff_*.patch，保留最近 5 筆）'
        'specs' = '可執行規格 SSOT（executable_spec.yaml、system_specification.md）'
    }
    
    foreach ($d in ($actualDirs | Sort-Object)) {
        $desc = if ($dirDescriptions.ContainsKey($d)) { $dirDescriptions[$d] } else { "(待定義)" }
        $newTable += "| ``$d/`` | $desc |`n"
    }
    
    $newTable += @"

| 根目錄檔案 | 用途 |
|:---|:---|
"@
    $fileDescriptions = @{
        '.gitignore' = 'Git 忽略規則（排除 __pycache__、.env、*.db 等）'
        'AGENTS.md' = '專案入口規章（指向 .agents/AGENTS.md 與 docs/CORE_RULES.md）'
        'memory.md' = '全域記憶檔（開發歷程、決策記錄、Skill 建立記錄）'
        'phase_gates.json' = '階段關卡狀態（各階段鎖定/完成 + security_baseline 安全區塊）'
        'README.md' = '本檔案：專案總覽與使用說明'
        'system_specification.md' = '系統功能規格書 SRS（IEEE 830 標準）'
        'traceability_matrix.md' = '全域需求追溯矩陣（RTM，六階段對應）'
    }
    
    foreach ($f in ($actualFiles | Sort-Object)) {
        $desc = if ($fileDescriptions.ContainsKey($f)) { $fileDescriptions[$f] } else { "(待定義)" }
        $newTable += "| ``$f`` | $desc |`n"
    }

    # Replace old table section
    $oldIdx = $readme.IndexOf('## 📂 倉庫結構')
    $oldNext = Find-NextHeading $readme ($oldIdx + 1)
    if ($oldNext -lt 0) { $oldNext = $readme.Length }
    
    $readme = $readme.Substring(0, $oldIdx) + $newTable + $readme.Substring($oldNext)
}

# ═══════════════════════════════════════════
# STEP 5: Cross-reference - tree dirs vs table dirs
# ═══════════════════════════════════════════
# Project dirs exist in TEMPLATE_SKILL.md tree but not in repo root - exclude from warnings
$projectOnlyDirs = @("00_cross_phase","01_planning_and_analysis","02_system_design","03_implementation_and_coding","04_testing","05_deployment","06_maintenance")
$treeOnly = $treeDirs | Where-Object { $_ -notin $tableDirs -and $_ -notin $actualDirs -and $_ -notin $projectOnlyDirs }
# 標準專案 tree 與框架倉庫 table 描述不同根目錄；僅檢查 tree 的額外宣告。

if ($treeOnly) {
    Write-Warn "Tree has dirs not in table: $($treeOnly -join ', ')"
}

# ═══════════════════════════════════════════
# STEP 6: 必要章節完整性檢查
# ═══════════════════════════════════════════
$requiredSections = @(
    @{name='專案概述'; pattern='## 📌 專案概述'},
    @{name='開發階段架構'; pattern='## 🧩 開發階段架構'},
    @{name='指令系統'; pattern='指令系統'},
    @{name='標準專案目錄結構'; pattern='## 📁 標準專案目錄結構'},
    @{name='快速開始'; pattern='## 🚀 快速開始'},
    @{name='Demo 專案'; pattern='## 🧪 Demo 專案'},
    @{name='資安防護基準'; pattern='## 🛡️ 資安防護基準'},
    @{name='核心設計原則'; pattern='## 🛡️ 核心設計原則'},
    @{name='防呆與安全機制'; pattern='## ⚠️ 防呆與安全機制'},
    @{name='倉庫結構'; pattern='## 📂 倉庫結構'},
    @{name='授權與來源'; pattern='## 📄 授權與來源'}
)

foreach ($sec in $requiredSections) {
    if ($readme -notmatch [regex]::Escape($sec.pattern)) {
        Write-Warn "Missing section: $($sec.name)"
    }
}

# Also check security sub-sections inside 資安防護基準
$securitySubs = @('8 大安全構面', '層次全景圖', '三等級檢核', '雙軌運作模式', '非軟體面向', '來源文件')
foreach ($sub in $securitySubs) {
    if ($readme -notmatch $sub) {
        Write-Warn "Missing security sub-section: $sub"
    }
}

# Check @security-check and @security-load in command table
$cmdSection = ''
$cmdHeading = [regex]::Match($readme, '^## 🎮 (?:\[)?指令系統', [System.Text.RegularExpressions.RegexOptions]::Multiline)
$cmdIdx = if ($cmdHeading.Success) { $cmdHeading.Index } else { -1 }
if ($cmdIdx -ge 0) {
    $cmdEnd = Find-NextHeading $readme ($cmdIdx + 1)
    if ($cmdEnd -lt 0) { $cmdEnd = $readme.Length }
    $cmdSection = $readme.Substring($cmdIdx, $cmdEnd - $cmdIdx)
}

foreach ($cmd in @('@security-check', '@security-load', '@restore', '@baseline', '@init')) {
    if ($cmdSection -and $cmdSection -notmatch [regex]::Escape($cmd)) {
        Write-Warn "Command table missing: $cmd"
    }
}

# ═══════════════════════════════════════════
# STEP 7: 快速開始步驟數檢查
# ═══════════════════════════════════════════
$qsSection = ''
$qsIdx = $readme.IndexOf('## 🚀 快速開始')
if ($qsIdx -ge 0) {
    $qsEnd = Find-NextHeading $readme ($qsIdx + 1)
    if ($qsEnd -lt 0) { $qsEnd = $readme.Length }
    $qsSection = $readme.Substring($qsIdx, $qsEnd - $qsIdx)
    $qsSteps = ([regex]::Matches($qsSection, '### \d+\.')).Count
    if ($qsSteps -lt 5) {
        Write-Warn "Quick start only has $qsSteps steps (expected 5+)"
    }
}

# ═══════════════════════════════════════════
# STEP 8: Code block integrity
# ═══════════════════════════════════════════
$openTicks = ([regex]::Matches($readme, '```')).Count
if ($openTicks % 2 -ne 0) {
    Write-Warn "Unbalanced code blocks: $openTicks markers"
}

# ═══════════════════════════════════════════
# STEP 9: Write back
# ═══════════════════════════════════════════
if (-not $DryRun -and $needTableUpdate) {
    [System.IO.File]::WriteAllText($readmePath, $readme, [System.Text.Encoding]::UTF8)
}

# ═══════════════════════════════════════════
# STEP 10: 指令與逆向工程框架靜態對齊
# ═══════════════════════════════════════════
foreach ($check in @('scripts/check_readme_commands.py', 'scripts/check_reverse_alignment.py')) {
    Write-Host "[CHECK] $check" -ForegroundColor Cyan
    $pyResult = python $check 2>&1
    $pyExit = $LASTEXITCODE
    $pyResult | ForEach-Object { Write-Host "  $_" }
    if ($pyExit -ne 0) {
        Write-Warn "$check failed with exit code $pyExit"
    }
}

# ═══════════════════════════════════════════
# REPORT
# ═══════════════════════════════════════════
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  align_framework.ps1 掃描報告" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  實際目錄 : $($actualDirs.Count)"
Write-Host "  實際檔案 : $($actualFiles.Count)"
Write-Host "  Table 目錄: $($tableDirs.Count)"
Write-Host "  Table 檔案: $($tableFiles.Count)"
Write-Host "  Tree 目錄 : $($treeDirs.Count)"
Write-Host "  修復項目 : $($fixes.Count)"
Write-Host "  警告項目 : $($warnings.Count)"
if ($fixes.Count -gt 0) {
    Write-Host "`n  [FIXED]:" -ForegroundColor Green
    $fixes | ForEach-Object { Write-Host "    $_" -ForegroundColor Green }
}
if ($warnings.Count -gt 0) {
    Write-Host "`n  [WARNINGS]:" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
}
Write-Host ""

$exitCode = if ($warnings.Count -gt 0) { 2 } else { 0 }
Pop-Location
exit $exitCode
