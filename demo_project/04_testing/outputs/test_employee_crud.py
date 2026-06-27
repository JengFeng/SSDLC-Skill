"""員工管理系統 pytest"""
import sys, os, sqlite3
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "03_implementation_and_coding", "outputs"))
os.chdir(os.path.join(os.path.dirname(__file__), "..", "..", "03_implementation_and_coding", "outputs"))
import pytest; from app import app, init_db, DB as DB_PATH
@pytest.fixture
def client():
    app.config["TESTING"] = True; init_db()
    with sqlite3.connect(DB_PATH) as c: c.execute("DELETE FROM employees")
    yield app.test_client()
def test_empty(client):
    assert "尚無員工資料" in client.get("/").data.decode()
def test_add(client):
    r = client.post("/add", data={"name":"王小明","department":"研發部","title":"工程師","email":"w@ex.com","hire_date":"2025-01-15"}, follow_redirects=True)
    assert "王小明" in r.data.decode() and "成功" in r.data.decode()
def test_dup_email(client):
    client.post("/add", data={"name":"A","department":"X","title":"T","email":"dup@ex.com","hire_date":"2024-01-01"})
    r = client.post("/add", data={"name":"B","department":"Y","title":"T","email":"dup@ex.com","hire_date":"2024-02-02"}, follow_redirects=True)
    assert "已存在" in r.data.decode()
def test_search(client):
    client.post("/add", data={"name":"陳測試","department":"QA","title":"TE","email":"t@ex.com","hire_date":"2024-03-01"})
    assert "陳測試" in client.get("/?q=陳").data.decode()
    assert "尚無" in client.get("/?q=none").data.decode()
def test_edit(client):
    client.post("/add", data={"name":"原始","department":"舊","title":"舊","email":"orig@ex.com","hire_date":"2024-01-01"})
    with sqlite3.connect(DB_PATH) as c: eid = c.execute("SELECT id FROM employees WHERE email='orig@ex.com'").fetchone()[0]
    client.post(f"/edit/{eid}", data={"name":"修改後","department":"新","title":"新","email":"orig@ex.com","hire_date":"2024-06-15"}, follow_redirects=True)
    r = client.get("/"); assert "修改後" in r.data.decode() and "新" in r.data.decode()
def test_delete(client):
    client.post("/add", data={"name":"待刪","department":"X","title":"X","email":"del@ex.com","hire_date":"2024-01-01"})
    with sqlite3.connect(DB_PATH) as c: eid = c.execute("SELECT id FROM employees WHERE email='del@ex.com'").fetchone()[0]
    r = client.post(f"/delete/{eid}", follow_redirects=True)
    assert "已刪除" in r.data.decode() and "尚無" in client.get("/").data.decode()
def test_empty_fields(client):
    r = client.post("/add", data={"name":"","department":"","title":"","email":"","hire_date":""}, follow_redirects=True)
    assert "必填" in r.data.decode()

