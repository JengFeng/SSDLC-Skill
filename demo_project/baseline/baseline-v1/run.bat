@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   員工管理系統 (Baseline v1)
echo   正在啟動伺服器，請稍候...
echo ============================================
start "" python app.py
timeout /t 3 /nobreak >nul
start http://127.0.0.1:5000
echo.
echo 系統已就緒！瀏覽器應已自動開啟。
echo 完成後按任意鍵關閉伺服器...
pause >nul
taskkill /F /IM python.exe /T 2>nul