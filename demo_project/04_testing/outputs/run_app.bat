@echo off
chcp 65001 >nul
cd /d "%~dp0..\..\03_implementation_and_coding\outputs"

echo ============================================
echo   員工基本資料管理系統 v1.0
echo   啟動 Flask 應用伺服器...
echo ============================================
echo.

:: 初始化測試帳號（若尚未建立）
python seed_data.py

:: 啟動伺服器
start "" python app.py
timeout /t 3 /nobreak >nul
start http://127.0.0.1:5000/login

echo.
echo 伺服器已啟動！瀏覽器將自動開啟登入頁面。
echo.
echo 按任意鍵停止伺服器...
pause >nul

taskkill /F /IM python.exe /T 2>nul
echo 伺服器已停止。
