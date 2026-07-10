"""
backup.py — SQLite 資料庫備份腳本
用法：python backup.py
自動將 hr_system.db 備份到 backups/ 目錄，保留最近 30 天
"""
import sqlite3
import os
import shutil
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.getenv("DB_PATH", "hr_system.db")
BACKUP_DIR = "backups"
MAX_BACKUPS = 30  # 保留最近 30 份備份


def backup_db():
    if not os.path.exists(DB_PATH):
        print(f"❌ 找不到資料庫檔案: {DB_PATH}")
        return False

    os.makedirs(BACKUP_DIR, exist_ok=True)

    # 產生備份檔名
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"hr_system_{timestamp}.db"
    backup_path = os.path.join(BACKUP_DIR, backup_name)

    # 先執行 checkpoint 確保 WAL 寫入主檔
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute("PRAGMA wal_checkpoint(TRUNCATE)")
        conn.close()
    except:
        pass

    # 複製資料庫
    shutil.copy2(DB_PATH, backup_path)
    print(f"✅ 備份完成：{backup_path}")

    # 清理舊備份（保留最近 MAX_BACKUPS 份）
    cleanup_old_backups()
    return True


def cleanup_old_backups():
    """清理超過 MAX_BACKUPS 的舊備份檔"""
    backups = sorted([
        f for f in os.listdir(BACKUP_DIR)
        if f.startswith("hr_system_") and f.endswith(".db")
    ])
    while len(backups) > MAX_BACKUPS:
        old = backups.pop(0)
        old_path = os.path.join(BACKUP_DIR, old)
        os.remove(old_path)
        print(f"🗑️ 已刪除舊備份：{old}")


def list_backups():
    """列出所有備份檔"""
    if not os.path.exists(BACKUP_DIR):
        print("尚無備份檔。")
        return
    backups = sorted([
        f for f in os.listdir(BACKUP_DIR)
        if f.startswith("hr_system_") and f.endswith(".db")
    ])
    if not backups:
        print("尚無備份檔。")
        return
    print(f"📦 備份清單 ({len(backups)} 份)：")
    for b in backups:
        path = os.path.join(BACKUP_DIR, b)
        size_kb = os.path.getsize(path) / 1024
        print(f"   {b} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "list":
        list_backups()
    else:
        backup()
        list_backups()
