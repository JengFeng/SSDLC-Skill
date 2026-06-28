"""Employee Management System - Security Enhanced (Phase 2 General Baseline)
 — Flask + SQLite CRUD (實作產出)"""
import sqlite3, logging, os, hashlib, secrets, re, datetime

APP_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(APP_DIR)

LOG_DIR = os.path.join(APP_DIR, "logs")
os.makedirs(LOG_DIR, exist_ok=True)

logging.basicConfig(
    filename=os.path.join(LOG_DIR, "app.log"),
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    encoding="utf-8"
)
logger = logging.getLogger(__name__)

from flask import Flask, render_template, request, redirect, url_for, flash, session

app = Flask(__name__, template_folder=os.path.join(APP_DIR, "templates"))
app.secret_key = secrets.token_hex(32)  # Random per-process (sessions valid for one run)

DB = os.path.join(APP_DIR, "employee.db")
# ---- Security (Phase 2 General Baseline) ----
SALT = b"ssdlc_secure_salt_2026"
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 15

def hash_password(password):
    return hashlib.sha256(SALT + password.encode()).hexdigest()

def validate_input(value, field=""):
    if not value:
        return value
    cleaned = re.sub(r'[<>"' + "'" + r'\\;]', '', value)
    if cleaned != value:
        logger.warning(f"Input filtered: {field}={value[:30]}...")
    return cleaned

@app.after_request
def security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


def login_required(f):
    """Decorator: redirect to /login if not authenticated"""
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            flash("Please login first", "error")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated


def gdb():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c

def init_db():
    with gdb() as c:
        c.execute("""
            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                department TEXT NOT NULL,
                title TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL DEFAULT '',
                hire_date TEXT NOT NULL,
                last_login TEXT,
                login_attempts INTEGER DEFAULT 0,
                locked_until TEXT,
                active INTEGER DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now','localtime')),
                updated_at TEXT DEFAULT (datetime('now','localtime'))
            )
        """)
        # Create default admin if no users exist
        count = c.execute("SELECT COUNT(*) FROM employees").fetchone()[0]
        if count == 0:
            c.execute(
                "INSERT INTO employees (name,department,title,email,password_hash,hire_date) VALUES (?,?,?,?,?,?)",
                ("SystemAdmin", "IT", "Administrator", "admin@demo.local",
                 hash_password("Admin@1234"),
                 "2026-01-01")
            )
            logger.info("Default admin: admin@demo.local / Admin@1234")
    logger.info("Database initialized (secure schema)")

@app.route("/login", methods=["GET", "POST"])
def login():
    """Login with password verification"""
    if request.method == "POST":
        email = validate_input(request.form.get("email", "").strip(), "email")
        password = request.form.get("password", "")
        with gdb() as c:
            user = c.execute(
                "SELECT * FROM employees WHERE email=? AND active=1", (email,)
            ).fetchone()
        if not user:
            flash("Invalid credentials", "error")
            return render_template("login.html")
        # Check lockout
        if user["locked_until"]:
            from datetime import datetime
            lock_end = datetime.fromisoformat(user["locked_until"])
            if lock_end > datetime.now():
                flash("Account locked. Try again later.", "error")
                return render_template("login.html")
        # Verify password
        if hash_password(password) != user["password_hash"]:
            attempts = (user["login_attempts"] or 0) + 1
            with gdb() as c:
                if attempts >= MAX_LOGIN_ATTEMPTS:
                    from datetime import datetime, timedelta
                    locked = (datetime.now() + timedelta(minutes=LOCKOUT_MINUTES)).isoformat()
                    c.execute(
                        "UPDATE employees SET login_attempts=?, locked_until=? WHERE id=?",
                        (attempts, locked, user["id"])
                    )
                    flash(f"Account locked for {LOCKOUT_MINUTES} minutes", "error")
                else:
                    c.execute(
                        "UPDATE employees SET login_attempts=? WHERE id=?",
                        (attempts, user["id"])
                    )
            flash(f"Invalid password ({attempts}/{MAX_LOGIN_ATTEMPTS})", "error")
            return render_template("login.html")
        # Success
        with gdb() as c:
            from datetime import datetime
            c.execute(
                "UPDATE employees SET login_attempts=0, locked_until=NULL, last_login=? WHERE id=?",
                (datetime.now().isoformat(), user["id"])
            )
        session["user_id"] = user["id"]
        session["user_name"] = user["name"]
        logger.info(f"Login: {email}")
        flash(f"Welcome, {user['name']}!", "success")
        return redirect(url_for("index"))
    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    flash("Logged out", "success")
    return redirect(url_for("login"))


@app.route("/")
@login_required
def index():
    q = request.args.get("q", "").strip()
    with gdb() as c:
        if q:
            rows = c.execute(
                "SELECT * FROM employees WHERE name LIKE ? OR department LIKE ? OR email LIKE ? ORDER BY id",
                (f"%{q}%",) * 3
            ).fetchall()
        else:
            rows = c.execute("SELECT * FROM employees ORDER BY id").fetchall()
    return render_template("index.html", employees=rows, query=q)

@login_required
@app.route("/add", methods=["GET", "POST"])
def add():
    if request.method == "POST":
        raw = {k: request.form[k].strip() for k in ["name", "department", "title", "email", "hire_date"]}
        d = {k: validate_input(v, k) for k, v in raw.items()}
        if not all(d.values()):
            flash("所有欄位皆為必填", "error")
            return render_template("form.html", employee=d, action="add")
        try:
            with gdb() as c:
                c.execute(
                    "INSERT INTO employees (name,department,title,email,hire_date) VALUES (?,?,?,?,?)",
                    tuple(d.values())
                )
            logger.info(f"新增員工: {d['name']}")
            flash("員工新增成功", "success")
            return redirect(url_for("index"))
        except sqlite3.IntegrityError:
            flash("電子郵件已存在", "error")
            return render_template("form.html", employee=d, action="add")
    return render_template("form.html", employee={}, action="add")

@app.route("/edit/<int:eid>", methods=["GET", "POST"])
def edit(eid):
    with gdb() as c:
        emp = c.execute("SELECT * FROM employees WHERE id=?", (eid,)).fetchone()
    if not emp:
        flash("員工不存在", "error")
        return redirect(url_for("index"))
    if request.method == "POST":
        raw = {k: request.form[k].strip() for k in ["name", "department", "title", "email", "hire_date"]}
        d = {k: validate_input(v, k) for k, v in raw.items()}
        if not all(d.values()):
            flash("所有欄位皆為必填", "error")
            return render_template("form.html", employee=d, action="edit", eid=eid)
        try:
            with gdb() as c:
                c.execute(
                    "UPDATE employees SET name=?,department=?,title=?,email=?,hire_date=?,updated_at=datetime('now','localtime') WHERE id=?",
                    (*d.values(), eid)
                )
            logger.info(f"更新員工: id={eid}")
            flash("員工資料更新成功", "success")
            return redirect(url_for("index"))
        except sqlite3.IntegrityError:
            flash("電子郵件已存在", "error")
            return render_template("form.html", employee=d, action="edit", eid=eid)
    return render_template("form.html", employee=dict(emp), action="edit", eid=eid)

@app.route("/delete/<int:eid>", methods=["POST"])
def delete(eid):
    with gdb() as c:
        emp = c.execute("SELECT name FROM employees WHERE id=?", (eid,)).fetchone()
        if emp:
            c.execute("DELETE FROM employees WHERE id=?", (eid,))
            logger.info(f"刪除員工: id={eid}, name={emp['name']}")
            flash(f"員工 {emp['name']} 已刪除", "success")
    return redirect(url_for("index"))

if __name__ == "__main__":
    init_db()
    logger.info("App 啟動")
    app.run(debug=True, host="127.0.0.1", port=5000)
