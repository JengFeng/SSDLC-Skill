@echo off
chcp 65001 >nul
cd /d "%~dp0..\..\03_implementation_and_coding\outputs"
echo ============================================
echo   Employee Management System v1.1.0
echo   Starting Flask server...
echo ============================================
echo.
echo   Demo Account: admin@demo.local / Admin@1234
echo   URL: http://127.0.0.1:5000
echo.
start "" python app.py
timeout /t 3 /nobreak >nul
start http://127.0.0.1:5000/login
echo Server is ready! Press any key to stop...
pause >nul
taskkill /F /IM python.exe /T 2>nul
