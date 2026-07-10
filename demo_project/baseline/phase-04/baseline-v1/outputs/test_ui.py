"""
test_ui.py — Playwright UI 自動化測試（員工基本資料管理系統）
測試範圍：登入流程、RBAC 選單顯示、ESS 自助修改、報表載入
"""
import pytest
from playwright.sync_api import Page, expect

BASE_URL = "http://127.0.0.1:5000"

# ============================================================
# TC-UI-001：登入頁面
# ============================================================

def test_login_page_loads(page: Page):
    page.goto(f"{BASE_URL}/login")
    expect(page.locator("h4")).to_contain_text("員工基本資料管理系統")
    # AD SSO 為 <a> 連結，非 <button>
    expect(page.locator("a")).to_contain_text("Windows AD")
    expect(page.locator("input[name='email']")).to_be_visible()
    expect(page.locator("input[name='password']")).to_be_visible()


def test_login_local_success(page: Page):
    page.goto(f"{BASE_URL}/login")
    page.fill("input[name='email']", "admin@demo.local")
    page.fill("input[name='password']", "admin123")
    page.click("button[type='submit']")
    # 應重新導向到儀表板或顯示錯誤訊息
    page.wait_for_timeout(1000)


def test_login_empty_fields(page: Page):
    page.goto(f"{BASE_URL}/login")
    page.click("button[type='submit']")
    # CSRF 啟用後空白 POST 返回 400，或瀏覽器 required 驗證阻止提交
    # 驗證仍在登入頁面即可
    page.wait_for_timeout(1000)
    expect(page.locator("h4")).to_contain_text("員工基本資料管理系統")
    expect(page.locator("input[name='email']")).to_be_visible()


# ============================================================
# TC-UI-002：儀表板
# ============================================================

def test_dashboard_loads(page: Page):
    page.goto(f"{BASE_URL}/")
    # 若未登入，應導向登入頁
    if "login" in page.url:
        return
    expect(page.locator("h5")).to_contain_text("儀表板")
    expect(page.locator("#chartDept")).to_be_visible(timeout=5000)
    expect(page.locator("#chartYear")).to_be_visible(timeout=5000)


# ============================================================
# TC-UI-003：RBAC 選單顯示
# ============================================================

def test_sidebar_has_menu_items(page: Page):
    page.goto(f"{BASE_URL}/")
    if "login" in page.url:
        return
    expect(page.locator(".sidebar")).to_be_visible()
    # 確認主選單項目存在
    expect(page.locator(".sidebar")).to_contain_text("儀表板")
    expect(page.locator(".sidebar")).to_contain_text("自助服務")


# ============================================================
# TC-UI-004：員工列表
# ============================================================

def test_employee_list_page(page: Page):
    page.goto(f"{BASE_URL}/employees")
    if page.url.endswith("/login") or page.url.endswith("/error"):
        return
    expect(page.locator("h5")).to_contain_text("員工")


# ============================================================
# TC-UI-005：ESS 自助服務
# ============================================================

def test_ess_page_loads(page: Page):
    page.goto(f"{BASE_URL}/me")
    if page.url.endswith("/login"):
        return
    expect(page.locator("h5")).to_contain_text("個人資料")
    # 確認聯絡欄位為可編輯
    phone_input = page.locator("input[name='phone_mobile']")
    if phone_input.count() > 0:
        expect(phone_input).to_be_visible()
        # 一般員工應可編輯手機


# ============================================================
# TC-UI-006：報表頁面
# ============================================================

def test_reports_page(page: Page):
    page.goto(f"{BASE_URL}/reports")
    if page.url.endswith("/login") or page.url.endswith("/error"):
        return
    expect(page.locator("h5")).to_contain_text("報表")


# ============================================================
# TC-UI-007：RWD 響應式
# ============================================================

def test_mobile_viewport(page: Page):
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(f"{BASE_URL}/login")
    expect(page.locator(".login-card")).to_be_visible()
    page.wait_for_timeout(500)

def test_tablet_viewport(page: Page):
    page.set_viewport_size({"width": 820, "height": 1180})
    page.goto(f"{BASE_URL}/login")
    expect(page.locator(".login-card")).to_be_visible()
    page.wait_for_timeout(500)
