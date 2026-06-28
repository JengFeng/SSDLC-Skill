@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   Employee Management System (Baseline v3)
echo   Starting Flask server, please wait...
echo ============================================
start "" python app.py
timeout /t 3 /nobreak >nul
start http://127.0.0.1:5000
echo.
echo Server is ready! Browser should have opened automatically.
echo Press any key to stop the server...
pause >nul
taskkill /F /IM python.exe /T 2>nul
