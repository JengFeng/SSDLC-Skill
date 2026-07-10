"""
app.py — 員工基本資料管理系統 主應用
Python Flask 3.x + SQLite + RBAC + AES-256
"""
import json, io, re, os
import logging
from datetime import datetime, timedelta
from functools import wraps
from flask import (Flask, render_template, request, redirect, url_for,
                   session, flash, jsonify, send_file, abort)
from flask_wtf.csrf import CSRFProtect
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import bcrypt
import openpyxl
from config import Config
from models import (get_user_by_email, update_login_attempts, employee_list,
                    employee_get, employee_create, employee_update, employee_soft_delete,
                    history_list, history_create, education_list, education_create, education_delete,
                    experience_list, experience_create, experience_delete,
                    certification_list, certification_create, certification_delete,
                    department_list, report_year_distribution, report_department_structure,
                    report_birthday_this_month, report_turnover_rate, audit_log, audit_log_list)
from crypto_utils import mask

app = Flask(__name__)
app.config.from_object(Config)
app.secret_key = Config.SECRET_KEY

# CSRF 保護
csrf = CSRFProtect(app)

# 速率限制
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# 結構化日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# ============================================================
# RBAC Helpers
# ============================================================

ROLE_HIERARCHY = {"employee": 0, "hr_specialist": 1, "hr_manager": 2, "admin": 3}
SENSITIVE_FIELDS = {"salary", "bank_code", "bank_account", "leave_reason", "performance_rating"}
ESS_EDITABLE_FIELDS = {"phone_mobile", "address_contact", "emergency_contact_name",
                        "emergency_contact_phone", "emergency_contact_relation", "phone_extension"}

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("login_page"))
        return f(*args, **kwargs)
    return decorated

def require_role(min_role: str):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if "user_id" not in session:
                return jsonify({"error": "未登入"}), 401
            user_role = session.get("role", "employee")
            if ROLE_HIERARCHY.get(user_role, 0) < ROLE_HIERARCHY.get(min_role, 0):
                return jsonify({"error": "無權限執行此操作"}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

def get_client_ip() -> str:
    return request.headers.get("X-Forwarded-For", request.remote_addr)

def filter_sensitive(data: dict, role: str) -> dict:
    """依角色過濾機敏欄位"""
    if role in ("hr_manager", "admin"):
        return data
    if role == "hr_specialist":
        return {k: v for k, v in data.items() if k not in SENSITIVE_FIELDS}
    # employee
    safe = {k: v for k, v in data.items()
            if k in ("id","employee_code","name_zh","department_id","title",
                     "email_company","hire_date","status","phone_extension")}
    return safe

# ============================================================
# Auth Routes
# ============================================================

@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/login/local", methods=["POST"])
@limiter.limit("10 per minute")
def login_local():
    email = request.form.get("email", "").strip()
    password = request.form.get("password", "")
    if not email or not password:
        flash("請輸入 Email 與密碼", "danger")
        return redirect(url_for("login_page"))

    user = get_user_by_email(email)
    if not user:
        flash("帳號或密碼錯誤", "danger")
        return redirect(url_for("login_page"))

    if user.get("locked_until"):
        locked_time = datetime.strptime(user["locked_until"], "%Y-%m-%d %H:%M:%S")
        if locked_time > datetime.now():
            flash(f"帳戶已鎖定，請於 {locked_time.strftime('%H:%M')} 後再試", "danger")
            return redirect(url_for("login_page"))

    stored = user.get("password_hash", "")
    if isinstance(stored, str):
        stored = stored.encode()

    pw_ok = bcrypt.checkpw(password.encode(), stored)
    if pw_ok:
        update_login_attempts(user["id"], reset=True)
        session["user_id"] = user["id"]
        session["username"] = user["name_zh"]
        session["role"] = user.get("role", "employee")
        session["department_id"] = user.get("department_id")
        session.permanent = True
        audit_log(user["id"], user["email_company"], get_client_ip(),
                  "LOGIN", "auth", description="本機備援登入成功")
        logger.info(f"使用者 {user['email_company']} 登入成功")
        return redirect(url_for("dashboard"))
    else:
        update_login_attempts(user["id"], reset=False)
        flash("帳號或密碼錯誤", "danger")
        logger.warning(f"使用者 {email} 登入失敗")
        return redirect(url_for("login_page"))

@app.route("/login/ad")
def login_ad():
    """AD SSO 登入（Stub — 實際部署需 LDAPS 整合）"""
    flash("AD SSO 模組尚未設定。請使用備援帳號登入，或設定 AD 連線參數。", "warning")
    return redirect(url_for("login_page"))

@app.route("/logout")
def logout():
    if "user_id" in session:
        audit_log(session["user_id"], session.get("username",""), get_client_ip(), "LOGOUT", "auth")
    session.clear()
    return redirect(url_for("login_page"))

# ============================================================
# Main Pages
# ============================================================

@app.route("/")
@login_required
def dashboard():
    return render_template("dashboard.html",
        user={"name": session["username"], "role": session["role"]})

@app.route("/employees")
@login_required
@require_role("hr_specialist")
def employee_list_page():
    search = request.args.get("q", "")
    dept = request.args.get("department_id", type=int)
    status = request.args.get("status")
    page = request.args.get("page", 1, type=int)
    result = employee_list(search=search, department_id=dept, status=status, page=page)
    return render_template("employees.html", data=result, user_role=session["role"])

@app.route("/employees/add")
@login_required
@require_role("hr_specialist")
def employee_add_page():
    depts = department_list()
    return render_template("employee_form.html", employee=None, departments=depts, mode="add")

@app.route("/employees/<int:emp_id>")
@login_required
def employee_view(emp_id):
    role = session["role"]
    emp = employee_get(emp_id, include_sensitive=(role in ("hr_manager","admin")))
    if not emp:
        flash("員工不存在", "danger")
        return redirect(url_for("employee_list_page"))
    if role == "employee" and emp_id != session["user_id"]:
        abort(403)
    hist = history_list(emp_id)
    edu = education_list(emp_id)
    exp = experience_list(emp_id)
    cert = certification_list(emp_id)
    return render_template("employee_view.html", employee=emp, history=hist,
                           education=edu, experience=exp, certifications=cert,
                           user_role=role)

@app.route("/employees/<int:emp_id>/edit")
@login_required
@require_role("hr_specialist")
def employee_edit_page(emp_id):
    emp = employee_get(emp_id, include_sensitive=True)
    if not emp:
        flash("員工不存在", "danger")
        return redirect(url_for("employee_list_page"))
    depts = department_list()
    hist = history_list(emp_id)
    edu = education_list(emp_id)
    exp = experience_list(emp_id)
    cert = certification_list(emp_id)
    return render_template("employee_form.html", employee=emp, departments=depts, mode="edit",
                           history=hist, education=edu, experience=exp, certifications=cert)

@app.route("/me")
@login_required
def ess_page():
    emp = employee_get(session["user_id"], include_sensitive=False)
    return render_template("ess.html", employee=emp)

@app.route("/reports")
@login_required
@require_role("hr_manager")
def reports_page():
    return render_template("reports.html")

@app.route("/departments")
@login_required
@require_role("hr_manager")
def departments_page():
    depts = department_list()
    return render_template("departments.html", departments=depts)

@app.route("/audit-logs")
@login_required
@require_role("admin")
def audit_logs_page():
    return render_template("audit_logs.html")

# ============================================================
# API Routes — Employees
# ============================================================

@app.route("/api/v1/employees", methods=["GET"])
@login_required
@require_role("hr_specialist")
def api_employee_list():
    result = employee_list(
        search=request.args.get("q",""),
        department_id=request.args.get("department_id", type=int),
        status=request.args.get("status"),
        page=request.args.get("page",1,type=int)
    )
    return jsonify(result)

@app.route("/api/v1/employees", methods=["POST"])
@login_required
@require_role("hr_specialist")
def api_employee_create():
    data = request.get_json()
    required = ["employee_code","name_zh","id_number","birth_date","email_company","department_id","title","hire_date"]
    for f in required:
        if not data.get(f):
            return jsonify({"error": f"缺少必填欄位: {f}"}), 422
    try:
        data["operator_id"] = session["user_id"]
        new_id = employee_create(data)
        audit_log(session["user_id"], session["username"], get_client_ip(),
                  "CREATE", "employees", new_id, description=f"新增員工 #{new_id}")
        return jsonify({"id": new_id, "message": "員工新增成功"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/v1/employees/<int:emp_id>", methods=["GET"])
@login_required
def api_employee_get(emp_id):
    role = session["role"]
    if role == "employee" and emp_id != session["user_id"]:
        return jsonify({"error": "無權限"}), 403
    emp = employee_get(emp_id, include_sensitive=(role in ("hr_manager","admin")))
    if not emp:
        return jsonify({"error": "員工不存在"}), 404
    result = filter_sensitive(emp, role)
    audit_log(session["user_id"], session["username"], get_client_ip(), "READ", "employees", emp_id)
    return jsonify(result)

@app.route("/api/v1/employees/<int:emp_id>", methods=["PUT"])
@login_required
@require_role("hr_specialist")
def api_employee_update(emp_id):
    data = request.get_json()
    role = session["role"]
    # HR 專員不可修改機敏欄位
    if role == "hr_specialist":
        for f in SENSITIVE_FIELDS:
            data.pop(f, None)
    try:
        employee_update(emp_id, data)
        audit_log(session["user_id"], session["username"], get_client_ip(),
                  "UPDATE", "employees", emp_id, description=f"更新員工 #{emp_id}")
        return jsonify({"message": "更新成功"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/v1/employees/<int:emp_id>", methods=["DELETE"])
@login_required
@require_role("hr_manager")
def api_employee_delete(emp_id):
    employee_soft_delete(emp_id)
    audit_log(session["user_id"], session["username"], get_client_ip(),
              "DELETE", "employees", emp_id, description=f"軟刪除員工 #{emp_id}")
    return jsonify({"message": "員工已刪除"})

# ============================================================
# API Routes — History
# ============================================================

@app.route("/api/v1/employees/<int:emp_id>/history", methods=["GET"])
@login_required
@require_role("hr_specialist")
def api_history_list(emp_id):
    return jsonify({"employee_id": emp_id, "history": history_list(emp_id)})

@app.route("/api/v1/employees/<int:emp_id>/history", methods=["POST"])
@login_required
@require_role("hr_specialist")
def api_history_create(emp_id):
    data = request.get_json()
    hid = history_create(emp_id, data["change_type"], data["change_date"],
                         data.get("old_value"), data.get("new_value"),
                         data.get("reason"), session["user_id"])
    # 依異動類型同步更新員工主檔
    ct = data["change_type"]
    nv = data.get("new_value", {})
    if isinstance(nv, str):
        nv = json.loads(nv)
    updates = {}
    if ct == "調職" or ct == "升遷":
        if "department_id" in nv: updates["department_id"] = nv["department_id"]
        if "title" in nv: updates["title"] = nv["title"]
    elif ct == "調薪":
        if "salary" in nv: updates["salary"] = nv["salary"]
    elif ct == "離職":
        updates["status"] = "離職"
        updates["leave_date"] = data["change_date"]
    if updates:
        employee_update(emp_id, updates)
    audit_log(session["user_id"], session["username"], get_client_ip(),
              "CREATE", "employee_history", hid)
    return jsonify({"id": hid, "message": "異動記錄已建立"}), 201

# ============================================================
# API Routes — Education / Experience / Certification
# ============================================================

@app.route("/api/v1/employees/<int:emp_id>/education", methods=["GET"])
@login_required
def api_education_list(emp_id):
    return jsonify(education_list(emp_id))

@app.route("/api/v1/employees/<int:emp_id>/education", methods=["POST"])
@login_required
@require_role("hr_specialist")
def api_education_create(emp_id):
    rid = education_create(emp_id, request.get_json())
    return jsonify({"id": rid}), 201

@app.route("/api/v1/education/<int:rid>", methods=["DELETE"])
@login_required
@require_role("hr_specialist")
def api_education_delete(rid):
    education_delete(rid)
    return jsonify({"message": "已刪除"})

@app.route("/api/v1/employees/<int:emp_id>/experience", methods=["GET"])
@login_required
def api_experience_list(emp_id):
    return jsonify(experience_list(emp_id))

@app.route("/api/v1/employees/<int:emp_id>/experience", methods=["POST"])
@login_required
@require_role("hr_specialist")
def api_experience_create(emp_id):
    rid = experience_create(emp_id, request.get_json())
    return jsonify({"id": rid}), 201

@app.route("/api/v1/experience/<int:rid>", methods=["DELETE"])
@login_required
@require_role("hr_specialist")
def api_experience_delete(rid):
    experience_delete(rid)
    return jsonify({"message": "已刪除"})

@app.route("/api/v1/employees/<int:emp_id>/certifications", methods=["GET"])
@login_required
def api_certification_list(emp_id):
    return jsonify(certification_list(emp_id))

@app.route("/api/v1/employees/<int:emp_id>/certifications", methods=["POST"])
@login_required
@require_role("hr_specialist")
def api_certification_create(emp_id):
    rid = certification_create(emp_id, request.get_json())
    return jsonify({"id": rid}), 201

@app.route("/api/v1/certifications/<int:rid>", methods=["DELETE"])
@login_required
@require_role("hr_specialist")
def api_certification_delete(rid):
    certification_delete(rid)
    return jsonify({"message": "已刪除"})

# ============================================================
# API Routes — ESS
# ============================================================

@app.route("/api/v1/me", methods=["GET"])
@login_required
def api_ess_get():
    emp = employee_get(session["user_id"], include_sensitive=False)
    return jsonify(emp)

@app.route("/api/v1/me", methods=["PATCH"])
@login_required
def api_ess_update():
    data = request.get_json()
    for key in list(data.keys()):
        if key not in ESS_EDITABLE_FIELDS:
            return jsonify({"error": f"您無權修改欄位: {key}"}), 403
    employee_update(session["user_id"], data)
    audit_log(session["user_id"], session["username"], get_client_ip(),
              "UPDATE", "employees", session["user_id"], description="ESS 自助更新")
    return jsonify({"message": "個人資料更新成功"})

# ============================================================
# API Routes — Reports
# ============================================================

@app.route("/api/v1/reports/year-distribution")
@login_required
@require_role("hr_manager")
def api_report_year():
    return jsonify(report_year_distribution())

@app.route("/api/v1/reports/department-structure")
@login_required
@require_role("hr_manager")
def api_report_dept():
    return jsonify(report_department_structure())

@app.route("/api/v1/reports/birthday-this-month")
@login_required
@require_role("hr_specialist")
def api_report_birthday():
    month = request.args.get("month", type=int)
    dept = request.args.get("department_id", type=int)
    return jsonify(report_birthday_this_month(month=month, department_id=dept))

@app.route("/api/v1/reports/turnover-rate")
@login_required
@require_role("hr_manager")
def api_report_turnover():
    year = request.args.get("year", type=int)
    dept = request.args.get("department_id", type=int)
    return jsonify(report_turnover_rate(year=year, department_id=dept))

# ============================================================
# API Routes — Export
# ============================================================

@app.route("/api/v1/export/employees")
@login_required
@require_role("hr_specialist")
def api_export_employees():
    result = employee_list(search=request.args.get("q",""),
                           department_id=request.args.get("department_id", type=int),
                           status=request.args.get("status"), per_page=10000)
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "員工清單"
    ws.append(["工號","姓名","部門ID","職稱","Email","到職日","狀態"])
    for e in result["data"]:
        ws.append([e["employee_code"], e["name_zh"], e.get("department_id",""),
                   e["title"], e["email_company"], e.get("hire_date",""), e.get("status","")])
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    audit_log(session["user_id"], session["username"], get_client_ip(), "EXPORT", "employees")
    return send_file(output, mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                     as_attachment=True, download_name="員工清單.xlsx")

# ============================================================
# API Routes — Departments
# ============================================================

@app.route("/api/v1/departments")
@login_required
def api_department_list():
    return jsonify(department_list())

# ============================================================
# API Routes — Audit Logs
# ============================================================

@app.route("/api/v1/audit-logs")
@login_required
@require_role("admin")
def api_audit_logs():
    result = audit_log_list(
        page=request.args.get("page", 1, type=int),
        action=request.args.get("action"),
        from_date=request.args.get("from"),
        to_date=request.args.get("to")
    )
    return jsonify(result)

# ============================================================
# Error Handlers
# ============================================================

@app.errorhandler(403)
def forbidden(e):
    return render_template("error.html", code=403, message="您沒有權限存取此資源"), 403

@app.errorhandler(404)
def not_found(e):
    return render_template("error.html", code=404, message="找不到此頁面"), 404

# ============================================================
# Security Headers
# ============================================================

@app.after_request
def add_security_headers(resp):
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["X-XSS-Protection"] = "1; mode=block"
    resp.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    resp.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; font-src 'self' https://cdn.jsdelivr.net; img-src 'self' data:"
    return resp

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
