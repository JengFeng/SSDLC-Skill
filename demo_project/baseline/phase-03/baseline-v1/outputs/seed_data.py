"""
seed_data.py — 初始化測試帳號資料
建立管理員帳號與測試員工資料
用法：python seed_data.py
"""
import sqlite3
import os
import bcrypt
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.getenv("DB_PATH", os.path.join(os.path.dirname(os.path.abspath(__file__)), "hr_system.db"))


def hash_password(password: str) -> str:
    """產生 bcrypt 雜湊"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def seed():
    """建立測試用帳號（增量式：補齊缺密碼 + 新增管理員）"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")

    print("🌱 檢查並建立測試帳號...")

    # 1. 為所有無密碼的員工補上預設密碼
    no_pw = conn.execute(
        "SELECT employee_code, email_company FROM employees WHERE password_hash IS NULL OR password_hash = ''"
    ).fetchall()
    if no_pw:
        default_pw = hash_password("Test@1234")
        conn.execute(
            "UPDATE employees SET password_hash = ? WHERE password_hash IS NULL OR password_hash = ''",
            (default_pw,)
        )
        print(f"   🔧 已為 {len(no_pw)} 位無密碼員工補上預設密碼 Test@1234：")
        for row in no_pw:
            print(f"      - {row[0]} ({row[1]})")

    # 2. 新增管理員帳號（若不存在）
    admin_exists = conn.execute(
        "SELECT COUNT(*) FROM employees WHERE email_company = ?", ("admin@demo.local",)
    ).fetchone()[0]

    if not admin_exists:
        admin_pw = hash_password("Admin@1234")
        conn.execute("""
            INSERT INTO employees (employee_code, name_zh, name_en, email_company, department_id,
                                   title, hire_date, status, role, password_hash, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ("A001", "系統管理員", "Admin User", "admin@demo.local",
              3, "系統管理員", "2026-01-01", "在職", "admin", admin_pw, 1))
        print("   ✅ 新增管理員帳號：admin@demo.local")

    # 3. 新增 HR 經理帳號（若不存在）
    hr_exists = conn.execute(
        "SELECT COUNT(*) FROM employees WHERE email_company = ?", ("hr.demo.local",)
    ).fetchone()[0]

    if not hr_exists:
        hr_pw = hash_password("Hr@1234")
        conn.execute("""
            INSERT INTO employees (employee_code, name_zh, name_en, email_company, department_id,
                                   title, hire_date, status, role, password_hash, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ("A002", "王小明", "Wang, Hsiao-Ming", "hr.demo.local",
              2, "人力資源經理", "2026-01-01", "在職", "hr_manager", hr_pw, 1))
        print("   ✅ 新增 HR 經理帳號：hr.demo.local")

    # 4. 新增一般員工帳號（若不存在）
    emp_exists = conn.execute(
        "SELECT COUNT(*) FROM employees WHERE email_company = ?", ("test@company.com",)
    ).fetchone()[0]

    if not emp_exists:
        emp_pw = hash_password("Test@1234")
        conn.execute("""
            INSERT INTO employees (employee_code, name_zh, email_company, department_id,
                                   title, hire_date, status, role, password_hash, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ("TEST01", "測試員工", "test@company.com",
              5, "行銷專員", "2026-03-01", "在職", "employee", emp_pw, 1))
        print("   ✅ 新增一般員工帳號：test@company.com")

    conn.commit()
    conn.close()

    print("\n✅ 測試帳號準備完成：")
    print("   ┌────────────────┬────────────────────┬──────────────┐")
    print("   │ 角色　　　　　│ 帳號　　　　　　　│ 密碼　　　　│")
    print("   ├────────────────┼────────────────────┼──────────────┤")
    print("   │ 系統管理員　　│ admin@demo.local　 │ Admin@1234　│")
    print("   │ HR 經理　　　 │ hr.demo.local　　 │ Hr@1234　　 │")
    print("   │ 一般員工　　　│ test@company.com　 │ Test@1234　 │")
    print("   └────────────────┴────────────────────┴──────────────┘")


if __name__ == "__main__":
    seed()
