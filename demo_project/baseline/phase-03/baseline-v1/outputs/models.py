"""
models.py — 資料庫操作層 (sqlite3 + 參數化查詢)
所有 SQL 使用 ? 佔位符，防止 SQL Injection
SQLite WAL 模式，支援 Flask 多執行緒讀寫
"""
import sqlite3
import os
import threading
from config import Config
from crypto_utils import encrypt, decrypt

# 每個執行緒獨立的連線
_local = threading.local()

DB_PATH = Config.DB_PATH

def get_conn():
    """取得當前執行緒的 SQLite 連線（WAL 模式）"""
    if not hasattr(_local, "conn") or _local.conn is None:
        os.makedirs(os.path.dirname(DB_PATH) if os.path.dirname(DB_PATH) else ".", exist_ok=True)
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
        conn.row_factory = sqlite3.Row
        _local.conn = conn
    return _local.conn

def close_conn():
    """關閉當前執行緒的連線"""
    if hasattr(_local, "conn") and _local.conn is not None:
        _local.conn.close()
        _local.conn = None

# ============================================================
# Employees CRUD
# ============================================================

def employee_list(search="", department_id=None, status=None, page=1, per_page=50,
                  include_sensitive=False):
    """員工列表（分頁 + 搜尋 + 篩選）"""
    conn = get_conn()
    conditions = ["1=1"]
    params = []
    if search:
        conditions.append("(name_zh LIKE ? OR email_company LIKE ? OR CAST(department_id AS TEXT) LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
    if department_id:
        conditions.append("department_id = ?")
        params.append(department_id)
    if status:
        conditions.append("status = ?")
        params.append(status)

    where = " AND ".join(conditions)

    total = conn.execute(f"SELECT COUNT(*) FROM employees WHERE {where}", params).fetchone()[0]

    offset = (page - 1) * per_page
    cols = "id, employee_code, name_zh, department_id, title, email_company, hire_date, status"
    rows = conn.execute(
        f"SELECT {cols} FROM employees WHERE {where} ORDER BY id LIMIT ? OFFSET ?",
        params + [per_page, offset]
    ).fetchall()

    return {"total": total, "page": page, "per_page": per_page, "data": [
        {"id": r["id"], "employee_code": r["employee_code"], "name_zh": r["name_zh"],
         "department_id": r["department_id"], "title": r["title"],
         "email_company": r["email_company"], "hire_date": r["hire_date"], "status": r["status"]}
        for r in rows
    ]}

def employee_get(emp_id, include_sensitive=True):
    """取得單一員工完整資料，機敏欄位依 include_sensitive 參數控制"""
    conn = get_conn()
    row = conn.execute("SELECT * FROM employees WHERE id = ?", (emp_id,)).fetchone()
    if not row:
        return None
    data = dict(row)

    result = {
        "id": data["id"], "employee_code": data["employee_code"],
        "name_zh": data["name_zh"], "name_en": data.get("name_en"),
        "gender": data.get("gender"), "email_company": data["email_company"],
        "email_personal": data.get("email_personal"),
        "phone_mobile": data.get("phone_mobile"),
        "phone_extension": data.get("phone_extension"),
        "department_id": data["department_id"], "title": data["title"],
        "hire_date": data.get("hire_date"),
        "employment_type": data.get("employment_type"),
        "status": data["status"], "leave_date": data.get("leave_date"),
        "ad_username": data.get("ad_username"), "role": data["role"],
        "active": bool(data.get("active")),
    }

    # 機敏欄位（需解密）
    if include_sensitive:
        result["id_number"] = decrypt(data.get("id_number_enc"))
        result["birth_date"] = decrypt(data.get("birth_date_enc"))
        result["address_registered"] = decrypt(data.get("address_registered_enc"))
        result["address_contact"] = decrypt(data.get("address_contact_enc"))
        result["emergency_contact_name"] = decrypt(data.get("emergency_contact_name_enc"))
        result["emergency_contact_phone"] = decrypt(data.get("emergency_contact_phone_enc"))
        result["emergency_contact_relation"] = data.get("emergency_contact_relation")
        result["salary"] = decrypt(data.get("salary_enc"))
        result["bank_code"] = decrypt(data.get("bank_code_enc"))
        result["bank_account"] = decrypt(data.get("bank_account_enc"))
        result["leave_reason"] = decrypt(data.get("leave_reason_enc"))
        result["performance_rating"] = decrypt(data.get("performance_rating_enc"))
    return result

def employee_create(data):
    """新增員工"""
    conn = get_conn()
    try:
        cur = conn.execute("""
            INSERT INTO employees (employee_code, name_zh, name_en, id_number_enc, id_number_hash,
                birth_date_enc, gender, email_company, email_personal, phone_mobile, phone_extension,
                address_contact_enc, emergency_contact_name_enc, emergency_contact_phone_enc,
                emergency_contact_relation, department_id, title, hire_date, employment_type,
                salary_enc, bank_code_enc, bank_account_enc, ad_username, role)
            VALUES (?,?,?,?,?, ?,?,?,?,?,?, ?,?,?, ?,?,?,?,?, ?,?,?,?,?)
        """, (
            data["employee_code"], data["name_zh"], data.get("name_en"),
            encrypt(data["id_number"]), data.get("id_number"),
            encrypt(data["birth_date"]), data.get("gender"),
            data["email_company"], data.get("email_personal"),
            data.get("phone_mobile"), data.get("phone_extension"),
            encrypt(data.get("address_contact")),
            encrypt(data.get("emergency_contact_name")),
            encrypt(data.get("emergency_contact_phone")),
            data.get("emergency_contact_relation"),
            data["department_id"], data["title"], data["hire_date"],
            data.get("employment_type", "全職"),
            encrypt(str(data.get("salary"))) if data.get("salary") else None,
            encrypt(data.get("bank_code")),
            encrypt(data.get("bank_account")),
            data.get("ad_username"), data.get("role", "employee")
        ))
        new_id = cur.lastrowid
        # 自動建立報到異動記錄
        import json
        conn.execute("""
            INSERT INTO employee_history (employee_id, change_type, change_date, new_value, operator_id)
            VALUES (?, '報到', ?, ?, ?)
        """, (new_id, data["hire_date"],
              json.dumps({"department": str(data["department_id"]), "title": data["title"]}, ensure_ascii=False),
              data.get("operator_id")))
        conn.commit()
        return new_id
    except Exception:
        conn.rollback()
        raise

def employee_update(emp_id, data):
    """更新員工資料（部分欄位）"""
    conn = get_conn()
    try:
        sets = []
        params = []
        field_map = {
            "name_zh": "name_zh", "name_en": "name_en", "gender": "gender",
            "email_company": "email_company", "email_personal": "email_personal",
            "phone_mobile": "phone_mobile", "phone_extension": "phone_extension",
            "department_id": "department_id", "title": "title",
            "employment_type": "employment_type", "status": "status",
            "leave_date": "leave_date", "ad_username": "ad_username", "role": "role",
        }
        enc_field_map = {
            "id_number": "id_number_enc", "birth_date": "birth_date_enc",
            "address_contact": "address_contact_enc",
            "emergency_contact_name": "emergency_contact_name_enc",
            "emergency_contact_phone": "emergency_contact_phone_enc",
            "emergency_contact_relation": "emergency_contact_relation",
            "salary": "salary_enc", "bank_code": "bank_code_enc",
            "bank_account": "bank_account_enc",
            "leave_reason": "leave_reason_enc",
            "performance_rating": "performance_rating_enc",
        }
        for key, col in field_map.items():
            if key in data and data[key] is not None:
                sets.append(f"{col} = ?")
                params.append(data[key])
        for key, col in enc_field_map.items():
            if key in data and data[key] is not None:
                sets.append(f"{col} = ?")
                params.append(encrypt(str(data[key])))

        if not sets:
            return False
        sets.append("updated_at = datetime('now')")
        params.append(emp_id)
        conn.execute(f"UPDATE employees SET {', '.join(sets)} WHERE id = ?", params)
        conn.commit()
        return True
    except Exception:
        conn.rollback()
        raise

def employee_soft_delete(emp_id):
    """軟刪除員工（active=false）"""
    conn = get_conn()
    cur = conn.execute("UPDATE employees SET active = 0, updated_at = datetime('now') WHERE id = ?", (emp_id,))
    conn.commit()
    return cur.rowcount > 0

# ============================================================
# History (Append-Only)
# ============================================================

def history_list(emp_id):
    conn = get_conn()
    rows = conn.execute("""
        SELECT id, change_type, change_date, old_value, new_value, reason, operator_id, created_at
        FROM employee_history WHERE employee_id = ? ORDER BY change_date DESC
    """, (emp_id,)).fetchall()
    return [dict(r) for r in rows]

def history_create(emp_id, change_type, change_date, old_value, new_value, reason, operator_id):
    conn = get_conn()
    try:
        cur = conn.execute("""
            INSERT INTO employee_history (employee_id, change_type, change_date, old_value, new_value, reason, operator_id)
            VALUES (?,?,?,?,?,?,?)
        """, (emp_id, change_type, change_date, old_value, new_value, reason, operator_id))
        hid = cur.lastrowid
        conn.commit()
        return hid
    except Exception:
        conn.rollback()
        raise

# ============================================================
# Education / Experience / Certification
# ============================================================

def _sub_list(table, emp_id):
    conn = get_conn()
    rows = conn.execute(f"SELECT * FROM {table} WHERE employee_id = ? ORDER BY id", (emp_id,)).fetchall()
    return [dict(r) for r in rows]

def _sub_create(table, emp_id, data):
    conn = get_conn()
    try:
        data = dict(data)
        cols = [k for k in data if data[k] is not None] + ["employee_id"]
        vals = [data[k] for k in data if data[k] is not None] + [emp_id]
        placeholders = ", ".join(["?"] * len(vals))
        cur = conn.execute(f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({placeholders})", vals)
        rid = cur.lastrowid
        conn.commit()
        return rid
    except Exception:
        conn.rollback()
        raise

def _sub_delete(table, rid):
    conn = get_conn()
    cur = conn.execute(f"DELETE FROM {table} WHERE id = ?", (rid,))
    conn.commit()
    return cur.rowcount > 0

def education_list(emp_id): return _sub_list("employee_education", emp_id)
def education_create(emp_id, data): return _sub_create("employee_education", emp_id, data)
def education_delete(rid): return _sub_delete("employee_education", rid)

def experience_list(emp_id): return _sub_list("employee_experience", emp_id)
def experience_create(emp_id, data): return _sub_create("employee_experience", emp_id, data)
def experience_delete(rid): return _sub_delete("employee_experience", rid)

def certification_list(emp_id): return _sub_list("employee_certification", emp_id)
def certification_create(emp_id, data): return _sub_create("employee_certification", emp_id, data)
def certification_delete(rid): return _sub_delete("employee_certification", rid)

# ============================================================
# Departments
# ============================================================

def department_list():
    conn = get_conn()
    rows = conn.execute("SELECT id, name, parent_id, manager_id FROM departments ORDER BY id").fetchall()
    return [dict(r) for r in rows]

# ============================================================
# Audit Log (Append-Only)
# ============================================================

def audit_log(actor_id, actor_username, actor_ip, action, resource_type, resource_id=None,
              old_value=None, new_value=None, description=None):
    import json
    conn = get_conn()
    conn.execute("""
        INSERT INTO audit_log (actor_id, actor_username, actor_ip, action, resource_type, resource_id, old_value, new_value, description)
        VALUES (?,?,?,?,?,?,?,?,?)
    """, (actor_id, actor_username, actor_ip, action, resource_type, resource_id,
          json.dumps(old_value, ensure_ascii=False) if old_value else None,
          json.dumps(new_value, ensure_ascii=False) if new_value else None,
          description))
    conn.commit()

def audit_log_list(page=1, per_page=50, action=None, from_date=None, to_date=None):
    conn = get_conn()
    conditions = ["1=1"]
    params = []
    if action:
        conditions.append("action = ?"); params.append(action)
    if from_date:
        conditions.append("created_at >= ?"); params.append(from_date)
    if to_date:
        conditions.append("created_at <= ?"); params.append(to_date)
    where = " AND ".join(conditions)
    total = conn.execute(f"SELECT COUNT(*) FROM audit_log WHERE {where}", params).fetchone()[0]
    offset = (page - 1) * per_page
    rows = conn.execute(
        f"SELECT * FROM audit_log WHERE {where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
        params + [per_page, offset]
    ).fetchall()
    return {"total": total, "data": [dict(r) for r in rows]}

# ============================================================
# Auth helpers
# ============================================================

def get_user_by_email(email):
    conn = get_conn()
    row = conn.execute("SELECT * FROM employees WHERE email_company = ? AND active = 1", (email,)).fetchone()
    if not row:
        return None
    return dict(row)


def get_user_by_ad(username):
    conn = get_conn()
    row = conn.execute("SELECT * FROM employees WHERE ad_username = ? AND active = 1", (username,)).fetchone()
    if not row:
        return None
    return dict(row)

def update_login_attempts(emp_id, reset=False):
    conn = get_conn()
    if reset:
        conn.execute("UPDATE employees SET login_attempts = 0, last_login = datetime('now') WHERE id = ?", (emp_id,))
    else:
        conn.execute("UPDATE employees SET login_attempts = login_attempts + 1 WHERE id = ?", (emp_id,))
        row = conn.execute("SELECT login_attempts FROM employees WHERE id = ?", (emp_id,)).fetchone()
        attempts = row[0] if row else 0
        if attempts >= Config.MAX_LOGIN_ATTEMPTS:
            lock_minutes = Config.LOCKOUT_MINUTES
            conn.execute(
                f"UPDATE employees SET locked_until = datetime('now', '+{lock_minutes} minutes') WHERE id = ?",
                (emp_id,)
            )
    conn.commit()

# ============================================================
# Reports
# ============================================================

def report_year_distribution():
    conn = get_conn()
    rows = conn.execute("""
        SELECT
            CASE
                WHEN CAST((julianday('now') - julianday(hire_date)) / 365.25 AS INTEGER) < 1 THEN '<1年'
                WHEN CAST((julianday('now') - julianday(hire_date)) / 365.25 AS INTEGER) < 3 THEN '1-3年'
                WHEN CAST((julianday('now') - julianday(hire_date)) / 365.25 AS INTEGER) < 5 THEN '3-5年'
                WHEN CAST((julianday('now') - julianday(hire_date)) / 365.25 AS INTEGER) < 10 THEN '5-10年'
                ELSE '>10年' END AS range_label,
            COUNT(*) as cnt
        FROM employees WHERE status = '在職'
        GROUP BY range_label ORDER BY MIN(hire_date)
    """).fetchall()
    return [{"label": r["range_label"], "count": r["cnt"]} for r in rows]

def report_department_structure():
    conn = get_conn()
    rows = conn.execute("""
        SELECT d.name, COUNT(e.id) as cnt FROM departments d
        LEFT JOIN employees e ON e.department_id = d.id AND e.status = '在職'
        GROUP BY d.id, d.name ORDER BY d.id
    """).fetchall()
    return [{"department": r["name"], "count": r["cnt"]} for r in rows]

def report_birthday_this_month(month=None, department_id=None):
    from datetime import datetime
    if month is None:
        month = datetime.now().month
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, name_zh, department_id, email_company, birth_date_enc FROM employees WHERE status = '在職'"
    ).fetchall()
    result = []
    for r in rows:
        bd_str = decrypt(r["birth_date_enc"])
        if bd_str:
            try:
                bd = datetime.strptime(bd_str, "%Y-%m-%d")
                if bd.month == month:
                    if department_id and r["department_id"] != department_id:
                        continue
                    result.append({"id": r["id"], "name_zh": r["name_zh"],
                                   "department_id": r["department_id"],
                                   "email_company": r["email_company"],
                                   "birthday": f"{bd.month:02d}/{bd.day:02d}"})
            except ValueError:
                pass
    return result

def report_turnover_rate(year=None, department_id=None):
    from datetime import datetime
    if year is None:
        year = datetime.now().year
    conn = get_conn()
    monthly = []
    for m in range(1, 13):
        left = conn.execute("""
            SELECT COUNT(*) FROM employees WHERE status = '離職'
            AND CAST(strftime('%Y', leave_date) AS INTEGER) = ?
            AND CAST(strftime('%m', leave_date) AS INTEGER) = ?
        """, (year, m)).fetchone()[0]
        headcount = conn.execute("SELECT COUNT(*) FROM employees WHERE status = '在職'").fetchone()[0]
        rate = round(left / headcount * 100, 1) if headcount > 0 else 0
        monthly.append({"month": m, "left": left, "headcount": headcount, "rate": rate})
    annual = round(sum(m["left"] for m in monthly) / max(sum(m["headcount"] for m in monthly) / 12, 1) * 100, 1)
    return {"year": year, "monthly": monthly, "annual_rate": annual}
