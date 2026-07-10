# 員工基本資料管理系統 — 本機部署指引

> **版本**：v1.0 | **日期**：2026-06-29 | **階段**：Phase 05 部署
> **適用環境**：Windows / Linux / macOS 本機開發執行

---

## 一、系統需求

| 需求 | 規格 |
|:---|:---|
| Python | 3.12+ |
| 作業系統 | Windows 10+ / Linux / macOS |
| 資料庫 | SQLite（內建，無需額外安裝） |
| 硬碟空間 | ~50 MB |
| 記憶體 | 建議 512 MB+ |

---

## 二、快速啟動（3 步驟）

### Windows
```batch
# 雙擊 run.bat
# 或於終端機執行：
run.bat
```

### Linux / macOS
```bash
chmod +x start.sh
./start.sh
```

### 手動啟動
```bash
# 1. 安裝依賴
pip install -r requirements.txt

# 2. 初始化資料庫（僅首次）
python db_init.py

# 3. 啟動應用
python app.py
```

啟動後瀏覽器開啟 **http://localhost:5000**

---

## 三、目錄結構

```
03_implementation_and_coding/outputs/
├── app.py              # Flask 主應用
├── config.py           # 組態設定
├── models.py           # 資料庫操作層（SQLite）
├── crypto_utils.py     # AES-256 加解密
├── db_init.py          # 資料庫初始化腳本
├── .env                # 環境變數（🔒 含加密金鑰）
├── .env.example        # 環境變數範本
├── requirements.txt    # Python 依賴
├── run.bat             # Windows 啟動腳本
├── start.sh            # Linux/Mac 啟動腳本
├── hr_system.db        # SQLite 資料庫檔（啟動後自動產生）
└── templates/          # Jinja2 HTML 模板（11 個頁面）
```

---

## 四、環境變數說明

| 變數 | 說明 | 預設值 |
|:---|:---|:---|
| `SECRET_KEY` | Flask Session 加密金鑰 | `hr-system-dev-secret-20260629` |
| `DB_PATH` | SQLite 資料庫檔案路徑 | `hr_system.db` |
| `ENCRYPTION_KEY` | AES-256 Fernet 金鑰（機敏欄位加密） | 已內建 |
| `AD_SERVER` | AD LDAPS 伺服器（本機開發留空） | （空） |
| `AD_DOMAIN` | AD 網域 | （空） |

---

## 五、首次啟動後

1. 系統自動建立 `hr_system.db`，含 7 張資料表與 6 個預設部門
2. 使用 **本機備援登入**（`/login/local`）
3. 需要手動建立初始管理員帳號（透過 API 或直接操作 SQLite）

### 建立初始管理員（Python 互動式）
```python
# 在 outputs 目錄下執行 python
>>> from db_init import init_db; init_db()
>>> from models import *
>>> from crypto_utils import encrypt
>>> import bcrypt
>>> employee_create({
...     "employee_code": "ADMIN001",
...     "name_zh": "系統管理員",
...     "id_number": "A123456789",
...     "birth_date": "1990-01-01",
...     "email_company": "admin@company.local",
...     "department_id": 1,
...     "title": "系統管理員",
...     "hire_date": "2026-01-01",
...     "role": "admin",
...     "operator_id": None
... })
>>> import sqlite3
>>> conn = sqlite3.connect("hr_system.db")
>>> pwd = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt())
>>> conn.execute("UPDATE employees SET password_hash = ? WHERE employee_code = 'ADMIN001'", (pwd,))
>>> conn.commit()
>>> conn.close()
>>> print("✅ 管理員帳號建立完成：admin@company.local / admin123")
```

---

## 六、停止服務

- 在終端機按 `Ctrl+C`
- SQLite WAL 模式會自動清理暫存檔

---

## 七、資安注意事項

| 項目 | 本機開發 | 正式環境 |
|:---|:---|:---|
| HTTPS | ❌ 未啟用 | ✅ 必須 |
| SECRET_KEY | 開發用固定值 | 隨機生成 |
| AD SSO | 未設定（留空） | LDAPS 整合 |
| 資料庫加密 | Fernet AES-256 | 同左 |
| Session 逾時 | 30 分鐘 | 同左 |
