"""員工管理系統 — Flask + SQLite CRUD (Baseline v2)"""
import sqlite3, logging, os, sys

# 確保從 app.py 所在目錄執行，所有相對路徑以此為基準
APP_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(APP_DIR)

# 日誌寫入 demo_project/logs/
LOG_DIR = os.path.join(APP_DIR, "..", "..", "logs")
os.makedirs(LOG_DIR, exist_ok=True)

logging.basicConfig(
    filename=os.path.join(LOG_DIR, "app.log"),
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    encoding="utf-8"
)
logger = logging.getLogger(__name__)

from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = "demo-baseline-v2"

DB = os.path.join(APP_DIR, "employee.db")

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
                hire_date TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now','localtime')),
                updated_at TEXT DEFAULT (datetime('now','localtime'))
            )
        """)
    logger.info("資料庫初始化完成")

@app.route("/")
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

@app.route("/add", methods=["GET", "POST"])
def add():
    if request.method == "POST":
        d = {k: request.form[k].strip() for k in ["name", "department", "title", "email", "hire_date"]}
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
        d = {k: request.form[k].strip() for k in ["name", "department", "title", "email", "hire_date"]}
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
    logger.info("Baseline v2 啟動")
    app.run(debug=True, host="127.0.0.1", port=5000)
