#!/bin/bash
# ============================================================
#  員工基本資料管理系統 — Linux/Mac 本機啟動腳本
#  資料庫：SQLite (hr_system.db)
#  用法：chmod +x start.sh && ./start.sh
# ============================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================================"
echo " 員工基本資料管理系統 — 本機啟動"
echo "============================================================"
echo ""

# 檢查 Python
if ! command -v python3 &> /dev/null; then
    echo "[錯誤] 找不到 python3，請先安裝 Python 3.12+"
    exit 1
fi

echo "[1/3] 安裝依賴套件..."
pip install -r requirements.txt -q

echo "[2/3] 初始化 SQLite 資料庫..."
python3 db_init.py

echo "[3/3] 啟動 Flask 應用程式..."
echo ""
echo "   本機存取：http://localhost:5000"
echo "   停止服務：按 Ctrl+C"
echo ""

# 開發模式（debug=False 為安全考量）
python3 app.py
