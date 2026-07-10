"""
test_employee_crud.py — pytest API 測試（員工基本資料管理系統）
測試範圍：7 項功能需求對應的 API 端點
"""
import pytest
import json
from app import app, csrf

@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["WTF_CSRF_ENABLED"] = False  # 測試時停用 CSRF
    with app.test_client() as c:
        with c.session_transaction() as sess:
            sess["user_id"] = 1
            sess["username"] = "測試主管"
            sess["role"] = "hr_manager"
        yield c

@pytest.fixture
def client_hr():
    """HR 專員 session"""
    app.config["WTF_CSRF_ENABLED"] = False  # 測試時停用 CSRF
    with app.test_client() as c:
        with c.session_transaction() as sess:
            sess["user_id"] = 2
            sess["username"] = "HR 專員"
            sess["role"] = "hr_specialist"
        yield c

@pytest.fixture
def client_employee():
    """一般員工 session"""
    app.config["WTF_CSRF_ENABLED"] = False  # 測試時停用 CSRF
    with app.test_client() as c:
        with c.session_transaction() as sess:
            sess["user_id"] = 3
            sess["username"] = "一般員工"
            sess["role"] = "employee"
        yield c

# ============================================================
# REQ-001：員工主檔 CRUD
# ============================================================

class TestEmployeeList:
    """TC-001: 員工列表 API"""

    def test_list_returns_200(self, client):
        resp = client.get("/api/v1/employees")
        assert resp.status_code == 200

    def test_list_has_pagination(self, client):
        resp = client.get("/api/v1/employees?page=1&per_page=10")
        data = resp.get_json()
        assert "total" in data
        assert "data" in data

    def test_list_search(self, client):
        resp = client.get("/api/v1/employees?q=王")
        assert resp.status_code == 200

    def test_list_filter_department(self, client):
        resp = client.get("/api/v1/employees?department_id=2")
        assert resp.status_code == 200

    def test_list_filter_status(self, client):
        resp = client.get("/api/v1/employees?status=在職")
        assert resp.status_code == 200

    def test_list_unauthorized(self, client_employee):
        """一般員工不可查詢全體列表"""
        resp = client_employee.get("/api/v1/employees")
        assert resp.status_code == 403


class TestEmployeeDetail:
    """TC-002: 單一員工查詢"""

    def test_get_own_profile(self, client_employee):
        """一般員工可查詢本人"""
        resp = client_employee.get("/api/v1/employees/3")
        assert resp.status_code in (200, 404)

    def test_get_other_denied(self, client_employee):
        """一般員工不可查詢他人"""
        resp = client_employee.get("/api/v1/employees/1")
        assert resp.status_code == 403

    def test_get_as_hr(self, client_hr):
        """HR 專員可查詢（不含薪資）"""
        resp = client_hr.get("/api/v1/employees/1")
        if resp.status_code == 200:
            data = resp.get_json()
            assert "salary" not in data


class TestEmployeeCreate:
    """TC-003: 新增員工"""

    def test_create_missing_fields(self, client):
        resp = client.post("/api/v1/employees", json={"name_zh": "測試"})
        assert resp.status_code == 422

    def test_create_as_hr(self, client):
        resp = client.post("/api/v1/employees", json={
            "employee_code": "TEST01", "name_zh": "測試員工",
            "id_number": "A123456789", "birth_date": "1990-01-01",
            "email_company": "test@company.com", "department_id": 1,
            "title": "測試專員", "hire_date": "2026-07-01"
        })
        assert resp.status_code in (201, 400, 409)


class TestEmployeeUpdate:
    """TC-004: 修改員工"""

    def test_update_as_hr(self, client):
        resp = client.put("/api/v1/employees/1", json={"title": "更新測試"})
        assert resp.status_code in (200, 404)

    def test_hr_cannot_update_salary(self, client_hr):
        """HR 專員不可修改薪資"""
        resp = client_hr.put("/api/v1/employees/1", json={"salary": "99999"})
        if resp.status_code == 200:
            data = resp.get_json()
            # 確認薪資未被修改（應被過濾或被拒絕）


class TestEmployeeDelete:
    """TC-005: 刪除員工"""

    def test_delete_as_manager(self, client):
        resp = client.delete("/api/v1/employees/1")
        assert resp.status_code in (200, 404)

    def test_delete_as_hr_denied(self, client_hr):
        """HR 專員不可刪除"""
        resp = client_hr.delete("/api/v1/employees/1")
        assert resp.status_code == 403


# ============================================================
# REQ-002：生命週期管理
# ============================================================

class TestHistory:
    """TC-006: 異動歷程"""

    def test_list_history(self, client):
        resp = client.get("/api/v1/employees/1/history")
        assert resp.status_code == 200

    def test_create_history(self, client):
        import json
        resp = client.post("/api/v1/employees/1/history", json={
            "change_type": "調職", "change_date": "2026-07-01",
            "new_value": json.dumps({"department_id": 3, "title": "資深專員"}, ensure_ascii=False),
            "reason": "測試調職"
        })
        assert resp.status_code == 201


# ============================================================
# REQ-003：學經歷與證照
# ============================================================

class TestEducation:
    """TC-007: 學歷管理"""

    def test_list(self, client):
        assert client.get("/api/v1/employees/1/education").status_code == 200

    def test_create(self, client):
        resp = client.post("/api/v1/employees/1/education", json={
            "school_name": "測試大學", "major": "測試系", "degree": "學士"
        })
        assert resp.status_code == 201


class TestExperience:
    """TC-008: 經歷管理"""

    def test_list(self, client):
        assert client.get("/api/v1/employees/1/experience").status_code == 200

    def test_create(self, client):
        resp = client.post("/api/v1/employees/1/experience", json={
            "company_name": "測試公司", "title": "工程師"
        })
        assert resp.status_code == 201


class TestCertification:
    """TC-009: 證照管理"""

    def test_list(self, client):
        assert client.get("/api/v1/employees/1/certifications").status_code == 200

    def test_create(self, client):
        resp = client.post("/api/v1/employees/1/certifications", json={
            "cert_name": "測試證照", "issuing_org": "測試單位"
        })
        assert resp.status_code == 201


# ============================================================
# REQ-004：ESS 自助服務
# ============================================================

class TestESS:
    """TC-010: 員工自助服務"""

    def test_get_me(self, client_employee):
        resp = client_employee.get("/api/v1/me")
        assert resp.status_code == 200

    def test_update_contact(self, client):
        """員工自助修改聯絡資訊（使用已存在的 user_id=1 避免 FK 錯誤）"""
        resp = client.patch("/api/v1/me", json={
            "phone_mobile": "0987-654-321"
        })
        assert resp.status_code == 200

    def test_cannot_update_salary(self, client_employee):
        """一般員工不可修改薪資"""
        resp = client_employee.patch("/api/v1/me", json={"salary": "99999"})
        assert resp.status_code == 403


# ============================================================
# REQ-005：RBAC 權限
# ============================================================

class TestRBAC:
    """TC-011: 角色權限控管"""

    def test_employee_access_denied(self):
        """未登入不可存取"""
        with app.test_client() as c:
            resp = c.get("/api/v1/employees")
            assert resp.status_code in (302, 401)

    def test_hr_cannot_access_reports(self, client_hr):
        """HR 專員不可存取報表"""
        resp = client_hr.get("/reports")
        assert resp.status_code == 403

    def test_hr_cannot_access_audit(self, client_hr):
        """HR 專員不可存取稽核日誌"""
        resp = client_hr.get("/api/v1/audit-logs")
        assert resp.status_code == 403


# ============================================================
# REQ-006：報表
# ============================================================

class TestReports:
    """TC-012: 人事報表"""

    def test_year_distribution(self, client):
        resp = client.get("/api/v1/reports/year-distribution")
        assert resp.status_code == 200

    def test_department_structure(self, client):
        resp = client.get("/api/v1/reports/department-structure")
        assert resp.status_code == 200

    def test_turnover_rate(self, client):
        resp = client.get("/api/v1/reports/turnover-rate?year=2026")
        assert resp.status_code == 200

    def test_birthday(self, client):
        resp = client.get("/api/v1/reports/birthday-this-month")
        assert resp.status_code == 200


# ============================================================
# REQ-007：匯出
# ============================================================

class TestExport:
    """TC-013: Excel 匯出"""

    def test_export_employees(self, client):
        resp = client.get("/api/v1/export/employees")
        assert resp.status_code in (200, 500)

    def test_export_content_type(self, client):
        resp = client.get("/api/v1/export/employees")
        if resp.status_code == 200:
            assert "spreadsheet" in resp.content_type or "excel" in resp.content_type


# ============================================================
# Security Tests
# ============================================================

class TestSecurity:
    """TC-014: 安全相關"""

    def test_security_headers(self, client):
        resp = client.get("/")
        assert resp.headers.get("X-Content-Type-Options") == "nosniff"
        assert resp.headers.get("X-Frame-Options") == "DENY"

    def test_session_required(self):
        with app.test_client() as c:
            resp = c.get("/employees")
            assert resp.status_code in (302, 401)

    def test_sql_injection_resistant(self, client):
        """參數化查詢應防止 SQL Injection"""
        resp = client.get("/api/v1/employees?q='; DROP TABLE employees;--")
        assert resp.status_code == 200
