"""
create_admin.py — 建立初始管理員帳號
用法：python create_admin.py
首次部署後執行一次即可
"""
import sqlite3
import os
import sys

# 加入 outputs 目錄到路徑，以便載入 crypto_utils
OUTPUTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
                           "03_implementation_and_coding", "outputs")
sys.path.insert(0, OUTPUTS_DIR)
os.chdir(OUTPUTS_DIR)

import bcrypt
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.getenv("DB_PATH", "hr_system.db")

# ============================================================
# 設定區 — 請依實際需求修改
# ============================================================
ADMIN_DATA = {
    "employee_code": "ADMIN001",
    "name_zh": "系統管理員",
    "id_number": "A123456789",
    "birth_date": "1990-01-01",
    "email_company": "admin@company.local",
    "department_id": 1,      # 總經理室
    "title": "系統管理員",
    "hire_date": "2026-01-01",
    "role": "admin",
}
ADMIN_PASSWORD = "Admin@123"  # ⚠️ 首次登入後請立即修改


def create_admin():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys=ON")

    # 檢查是否已存在
    existing = conn.execute(
        "SELECT id FROM employees WHERE employee_code = ?", (ADMIN_DATA["employee_code"],)
    ).fetchone()
    if existing:
        print(f"⚠️ 管理員帳號已存在 (ID: {existing[0]})，跳過建立。")
        conn.close()
        return

    # 加密密碼
    password_hash = bcrypt.hashpw(ADMIN_PASSWORD.encode(), bcrypt.gensalt())

    try:
        from crypto_utils import encrypt
        cur = conn.execute("""
            INSERT INTO employees (employee_code, name_zh, id_number_enc, id_number_hash,
                birth_date_enc, gender, email_company, department_id, title, hire_date, role,
                password_hash, ad_username)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            ADMIN_DATA["employee_code"],
            ADMIN_DATA["name_zh"],
            encrypt(ADMIN_DATA["id_number"]),
            ADMIN_DATA["id_number"],  # hash for unique check
            encrypt(ADMIN_DATA["birth_date"]),
            "O",  # gender
            ADMIN_DATA["email_company"],
            ADMIN_DATA["department_id"],
            ADMIN_DATA["title"],
            ADMIN_DATA["hire_date"],
            ADMIN_DATA["role"],
            password_hash,
            "admin",  # ad_username
        ))
        admin_id = cur.lastrowid

        # 建立報到異動記錄
        import json
        conn.execute("""
            INSERT INTO employee_history (employee_id, change_type, change_date, new_value, operator_id)
            VALUES (?, '報到', ?, ?, NULL)
        """, (admin_id, ADMIN_DATA["hire_date"],
              json.dumps({"department": str(ADMIN_DATA["department_id"]),
                          "title": ADMIN_DATA["title"]}, ensure_ascii=False)))

        conn.commit()
        print(f"✅ 管理員帳號建立成功！")
        print(f"   ID: {admin_id}")
        print(f"   Email: {ADMIN_DATA['email_company']}")
        print(f"   密碼: {ADMIN_PASSWORD}")
        print(f"   ⚠️ 請立即登入並修改預設密碼！")
    except Exception as e:
        conn.rollback()
        print(f"❌ 建立失敗: {e}")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    create_admin()
