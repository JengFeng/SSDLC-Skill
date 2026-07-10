"""
health_check.py — 系統健康檢查腳本
用法：python health_check.py
檢查資料庫完整性、檔案結構、關鍵設定
"""
import sqlite3
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.getenv("DB_PATH", "hr_system.db")

CHECKS = []


def check(label):
    """裝飾器：記錄檢查結果"""
    def decorator(func):
        def wrapper():
            try:
                result = func()
                CHECKS.append({"label": label, "status": "✅", "detail": result})
            except Exception as e:
                CHECKS.append({"label": label, "status": "❌", "detail": str(e)})
        return wrapper
    return decorator


@check("SQLite 資料庫連線")
def check_db_connectivity():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("SELECT 1")
    conn.close()
    return "連線正常"


@check("資料表完整性 (7 張表)")
def check_tables():
    expected = {"departments", "employees", "employee_history",
                "employee_education", "employee_experience",
                "employee_certification", "audit_log"}
    conn = sqlite3.connect(DB_PATH)
    tables = {r[0] for r in conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()}
    conn.close()
    missing = expected - tables
    if missing:
        raise Exception(f"缺少資料表: {', '.join(missing)}")
    return f"所有 {len(expected)} 張表完整"


@check("部門預設資料")
def check_departments():
    conn = sqlite3.connect(DB_PATH)
    count = conn.execute("SELECT COUNT(*) FROM departments").fetchone()[0]
    conn.close()
    if count == 0:
        raise Exception("部門資料為空，請執行 db_init.py")
    return f"{count} 個部門"


@check("員工帳號")
def check_employees():
    conn = sqlite3.connect(DB_PATH)
    count = conn.execute("SELECT COUNT(*) FROM employees").fetchone()[0]
    conn.close()
    if count == 0:
        return "⚠️ 尚無員工帳號，請執行 create_admin.py"
    return f"{count} 位員工"


@check("稽核日誌")
def check_audit_log():
    conn = sqlite3.connect(DB_PATH)
    count = conn.execute("SELECT COUNT(*) FROM audit_log").fetchone()[0]
    conn.close()
    return f"{count} 筆記錄"


@check("資料庫檔案大小")
def check_db_size():
    if not os.path.exists(DB_PATH):
        raise Exception("資料庫檔案不存在")
    size_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    return f"{size_mb:.2f} MB"


@check(".env 環境變數")
def check_env():
    if not os.path.exists(".env"):
        raise Exception(".env 檔案不存在")
    from dotenv import dotenv_values
    config = dotenv_values(".env")
    required = ["SECRET_KEY", "DB_PATH", "ENCRYPTION_KEY"]
    missing = [k for k in required if not config.get(k)]
    if missing:
        raise Exception(f"缺少變數: {', '.join(missing)}")
    return "環境變數完整"


def run():
    print("=" * 60)
    print("  員工基本資料管理系統 — 健康檢查")
    print(f"  檢查時間：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print()

    for check in CHECKS:
        print(f"  {check['status']} {check['label']}: {check['detail']}")

    print()
    errors = sum(1 for c in CHECKS if c["status"] == "❌")
    if errors == 0:
        print("✅ 所有檢查通過！系統狀態健康。")
    else:
        print(f"⚠️ {errors} 項檢查未通過，請檢視上方詳細資訊。")

    return errors


if __name__ == "__main__":
    sys.exit(run())
