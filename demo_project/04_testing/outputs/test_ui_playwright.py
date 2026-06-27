"""員工管理系統 — Playwright 瀏覽器 UI 互動測試"""
import sys, os, time, pytest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "03_implementation_and_coding", "outputs"))
os.chdir(os.path.join(os.path.dirname(__file__), "..", "..", "03_implementation_and_coding", "outputs"))
from playwright.sync_api import sync_playwright
from app import app, init_db
import sqlite3, threading

BASE = "http://127.0.0.1:5000"
DB = "employee.db"

@pytest.fixture(scope="module")
def browser():
    """啟動 Flask + Playwright browser"""
    # Start Flask in background
    def run(): app.run(host="127.0.0.1", port=5000, debug=False, use_reloader=False)
    t = threading.Thread(target=run, daemon=True); t.start(); time.sleep(1.5)
    init_db()
    with sqlite3.connect(DB) as c: c.execute("DELETE FROM employees")
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True)
        yield b
        b.close()

def new_page(browser):
    p = browser.new_page()
    p.set_default_timeout(5000)
    return p

# TC_UI_001: Page loads and shows empty state
def test_ui_empty_state(browser):
    page = new_page(browser); page.goto(BASE)
    assert page.title() == "員工管理"
    assert page.locator("text=尚無員工資料").is_visible()
    page.close()

# TC_UI_002: Add employee via form
def test_ui_add_employee(browser):
    page = new_page(browser); page.goto(BASE)
    page.click("text=新增員工")
    page.fill("input[name='name']", "王小明")
    page.fill("input[name='department']", "研發部")
    page.fill("input[name='title']", "工程師")
    page.fill("input[name='email']", "wang@ui-test.com")
    page.fill("input[name='hire_date']", "2025-01-15")
    page.click("button[type='submit']")
    page.wait_for_url(BASE + "/")
    assert page.locator("text=王小明").is_visible()
    assert page.locator("text=員工新增成功").is_visible()
    page.close()

# TC_UI_003: Search filters the list
def test_ui_search(browser):
    page = new_page(browser); page.goto(BASE)
    # Already has 王小明 from previous test
    page.fill("input[name='q']", "王")
    page.click("button:has-text('搜尋')")
    assert page.locator("text=王小明").is_visible()
    # Search for non-existent
    page.fill("input[name='q']", "ZZZNOTEXIST")
    page.click("button:has-text('搜尋')")
    assert page.locator("text=尚無員工資料").is_visible()
    page.close()

# TC_UI_004: Duplicate email rejected
def test_ui_duplicate_email(browser):
    page = new_page(browser); page.goto(BASE + "/add")
    page.fill("input[name='name']", "重複測試")
    page.fill("input[name='department']", "QA")
    page.fill("input[name='title']", "TE")
    page.fill("input[name='email']", "wang@ui-test.com")  # same as 王小明
    page.fill("input[name='hire_date']", "2025-02-02")
    page.click("button[type='submit']")
    assert page.locator("text=電子郵件已存在").is_visible()
    page.close()

# TC_UI_005: Edit employee
def test_ui_edit(browser):
    page = new_page(browser); page.goto(BASE)
    page.click("text=編輯")
    page.fill("input[name='name']", "王小明(已修改)")
    page.fill("input[name='title']", "資深工程師")
    page.click("button[type='submit']")
    page.wait_for_url(BASE + "/")
    assert page.locator("text=王小明(已修改)").is_visible()
    assert page.locator("text=資深工程師").is_visible()
    page.close()

# TC_UI_006: Delete with confirm dialog
def test_ui_delete(browser):
    page = new_page(browser); page.goto(BASE)
    page.on("dialog", lambda d: d.accept())  # auto-accept confirm
    page.locator("button:has-text('刪除')").first.click()
    page.wait_for_url(BASE + "/")
    assert page.locator("text=已刪除").is_visible()
    assert page.locator("text=尚無員工資料").is_visible()
    page.close()

# TC_UI_007: Empty field validation shows inline
def test_ui_empty_validation(browser):
    page = new_page(browser); page.goto(BASE + "/add")
    page.evaluate("document.querySelector('form').setAttribute('novalidate','')"); page.click("button[type='submit']")
    assert page.locator("text=所有欄位皆為必填").is_visible()
    page.close()
