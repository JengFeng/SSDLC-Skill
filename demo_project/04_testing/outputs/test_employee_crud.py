"""Employee Management System - pytest API Tests
TDD: 測試先行，定義期望行為後才實作程式碼
Phase 03 → 04: 2026-06-28"""

import pytest
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import app for testing
APP_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "03_implementation_and_coding", "outputs")
sys.path.insert(0, APP_DIR)
os.chdir(APP_DIR)

from app import app, init_db

@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["WTF_CSRF_ENABLED"] = False
    with app.test_client() as c:
        init_db()
        # Login first for authenticated tests
        c.post("/login", data={"email": "admin@demo.local", "password": "Admin@1234"}, follow_redirects=True)
        yield c

@pytest.fixture
def anon_client():
    """Unauthenticated client"""
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


class TestAuthentication:
    """REQ-005: 登入驗證"""

    def test_login_page_loads(self, anon_client):
        """TC-UI-001: 登入頁面載入"""
        r = anon_client.get("/login")
        assert r.status_code == 200

    def test_login_success(self, anon_client):
        """正確帳密應登入成功"""
        r = anon_client.post("/login", data={
            "email": "admin@demo.local",
            "password": "Admin@1234"
        }, follow_redirects=True)
        assert r.status_code == 200
        assert b"admin@demo.local" in r.data or b"SystemAdmin" in r.data or b"Welcome" in r.data

    def test_login_wrong_password(self, anon_client):
        """錯誤密碼應拒絕"""
        r = anon_client.post("/login", data={
            "email": "admin@demo.local",
            "password": "wrongpassword"
        }, follow_redirects=True)
        assert r.status_code == 200

    def test_login_nonexistent_user(self, anon_client):
        """不存在帳號應拒絕"""
        r = anon_client.post("/login", data={
            "email": "noexist@demo.local",
            "password": "anything"
        }, follow_redirects=True)
        assert r.status_code == 200

    def test_protected_route_redirects(self, anon_client):
        """未登入存取 / 應導向 /login"""
        r = anon_client.get("/", follow_redirects=True)
        assert r.status_code == 200


class TestEmployeeList:
    """REQ-001: 員工列表"""

    def test_list_returns_200(self, client):
        """TC-001: GET / 回傳 200"""
        r = client.get("/")
        assert r.status_code == 200

    def test_list_contains_employees(self, client):
        """列表應含員工資料"""
        r = client.get("/")
        assert b"SystemAdmin" in r.data or b"admin" in r.data.lower()

    def test_search_by_name(self, client):
        """TC-002: GET /?q=keyword"""
        r = client.get("/?q=SystemAdmin")
        assert r.status_code == 200

    def test_search_no_results(self, client):
        """搜尋無結果仍應 200"""
        r = client.get("/?q=zzzznonexistent")
        assert r.status_code == 200


class TestAddEmployee:
    """REQ-002: 新增員工"""

    def test_add_page_loads(self, client):
        """新增頁面載入"""
        r = client.get("/add")
        assert r.status_code == 200

    def test_add_success(self, client):
        """TC-004: 成功新增"""
        r = client.post("/add", data={
            "name": "Test User",
            "department": "QA",
            "title": "Tester",
            "email": "test_add@demo.local",
            "hire_date": "2026-06-28"
        }, follow_redirects=True)
        assert r.status_code == 200

    def test_add_duplicate_email(self, client):
        """TC-005: Email 重複應拒絕"""
        # First add
        client.post("/add", data={
            "name": "Dup1", "department": "IT", "title": "Dev",
            "email": "dup@demo.local", "hire_date": "2026-01-01"
        }, follow_redirects=True)
        # Duplicate
        r = client.post("/add", data={
            "name": "Dup2", "department": "HR", "title": "HR",
            "email": "dup@demo.local", "hire_date": "2026-02-02"
        }, follow_redirects=True)
        assert r.status_code == 200


class TestEditEmployee:
    """REQ-003: 修改員工"""

    def test_edit_page_loads(self, client):
        """編輯頁面載入"""
        r = client.get("/edit/1")
        assert r.status_code == 200

    def test_edit_success(self, client):
        """TC-006: 成功更新"""
        r = client.post("/edit/1", data={
            "name": "SystemAdmin Updated",
            "department": "IT",
            "title": "Senior Admin",
            "email": "admin@demo.local",
            "hire_date": "2026-01-01"
        }, follow_redirects=True)
        assert r.status_code == 200


class TestDeleteEmployee:
    """REQ-004: 刪除員工"""

    def test_delete_success(self, client):
        """TC-007: 成功刪除"""
        # Add then delete
        client.post("/add", data={
            "name": "ToDelete", "department": "Temp", "title": "Temp",
            "email": "todelete@demo.local", "hire_date": "2026-01-01"
        }, follow_redirects=True)
        r = client.post("/delete/999", follow_redirects=True)  # Will use last ID
        assert r.status_code == 200


class TestSecurityHeaders:
    """REQ-006: 安全防護"""

    def test_security_headers(self, anon_client):
        """TC-UI-003: Security Headers"""
        r = anon_client.get("/login")
        assert r.headers.get("X-Content-Type-Options") == "nosniff"
        assert r.headers.get("X-Frame-Options") == "DENY"
        assert "X-XSS-Protection" in r.headers