@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo   員工基本資料管理系統 — 雙軌測試執行
echo   執行時間：%date% %time%
echo ============================================
echo.

:: ========== 步驟 1：初始化測試帳號 ==========
echo [1/4] 初始化測試帳號...
python seed_data.py
echo.

:: ========== 步驟 2：啟動 Flask 伺服器 ==========
echo [2/5] 啟動 Flask 測試伺服器...
cd /d "%~dp0..\..\03_implementation_and_coding\outputs"
start "" python app.py
timeout /t 4 /nobreak >nul
echo         Flask 已啟動 (http://127.0.0.1:5000)
echo.

:: ========== 步驟 2：執行 API 測試 (pytest) ==========
echo [2/4] 執行 API 功能測試 (pytest)...
cd /d "%~dp0"
python -m pytest test_employee_crud.py -v --tb=short 2>&1 | tee api_test_output.txt
echo.

:: ========== 步驟 3：執行 UI 測試 (Playwright) ==========
echo [3/4] 執行 UI 互動測試 (Playwright)...
python -m pytest test_ui.py -v --tb=short 2>&1 | tee ui_test_output.txt
echo.

:: ========== 步驟 4：清理並開啟報告 ==========
echo [4/4] 清理測試環境...
taskkill /F /IM python.exe /T 2>nul

echo.
echo ============================================
echo   測試執行完畢！
echo   - API 測試輸出：api_test_output.txt
echo   - UI  測試輸出：ui_test_output.txt
echo   - 完整報告　　：test_results.md
echo ============================================
echo.

:: 嘗試開啟測試報告
if exist "test_results.md" (
    echo 正在開啟測試報告...
    start "" "test_results.md"
)

echo.
echo 按任意鍵關閉此視窗...
pause >nul
