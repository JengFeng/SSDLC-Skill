@echo off
chcp 65001 >nul
REM ============================================================
REM  員工基本資料管理系統 — Windows 本機啟動腳本
REM  資料庫：SQLite (hr_system.db)
REM  用法：直接雙擊 run.bat 或在終端機執行 run.bat
REM ============================================================
cd /d "%~dp0"

echo ============================================================
echo  員工基本資料管理系統 — 本機啟動
echo ============================================================
echo.

REM 檢查 Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [錯誤] 找不到 Python，請先安裝 Python 3.12+
    pause
    exit /b 1
)

echo [1/3] 安裝依賴套件...
pip install -r requirements.txt -q
if %errorlevel% neq 0 (
    echo [錯誤] 套件安裝失敗
    pause
    exit /b 1
)

echo [2/3] 初始化 SQLite 資料庫...
python db_init.py
if %errorlevel% neq 0 (
    echo [錯誤] 資料庫初始化失敗
    pause
    exit /b 1
)

echo [3/3] 啟動 Flask 應用程式...
echo.
echo   本機存取：http://localhost:5000
echo   停止服務：按 Ctrl+C
echo.
python app.py

pause
