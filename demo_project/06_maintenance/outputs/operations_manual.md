# 員工基本資料管理系統 — 操作維護手冊

> **版本**：v1.0 | **日期**：2026-06-29 | **階段**：Phase 06 維護

---

## 一、日常操作

### 1.1 啟動系統

**Windows**：雙擊 `run.bat` 或於終端機執行：
```batch
cd 03_implementation_and_coding\outputs
run.bat
```

**Linux/Mac**：
```bash
cd 03_implementation_and_coding/outputs
./start.sh
```

### 1.2 停止系統
在終端機按 `Ctrl+C`，Flask 會優雅關閉，SQLite WAL 自動合併。

### 1.3 健康檢查
```bash
cd 06_maintenance/outputs
python health_check.py
```
檢查項目：資料庫連線、7 張表完整性、部門資料、員工數、稽核日誌數、資料庫大小、環境變數。

---

## 二、資料庫備份與還原

### 2.1 自動備份
```bash
cd 06_maintenance/outputs
python backup.py
```
- 備份至 `backups/hr_system_YYYYMMDD_HHMMSS.db`
- 自動保留最近 30 份，清除舊備份
- 備份前執行 WAL checkpoint

### 2.2 列出備份
```bash
python backup.py list
```

### 2.3 手動還原
```bash
copy backups\hr_system_20260629_120000.db hr_system.db
```

### 2.4 設定排程備份（Windows 工作排程器）
```powershell
# 每天中午 12:00 備份
schtasks /create /tn "HR_System_Backup" /tr "C:\Python314\python.exe E:\...\06_maintenance\outputs\backup.py" /sc daily /st 12:00
```

---

## 三、帳號管理

### 3.1 建立初始管理員（首次部署）
```bash
cd 06_maintenance/outputs
python create_admin.py
```
預設帳號：`admin@company.local` / `Admin@123`  
⚠️ 首次登入後立即修改密碼！

### 3.2 重設管理員密碼
```python
# 在 outputs 目錄執行 python
>>> import sqlite3, bcrypt
>>> conn = sqlite3.connect("hr_system.db")
>>> pwd = bcrypt.hashpw("新密碼".encode(), bcrypt.gensalt())
>>> conn.execute("UPDATE employees SET password_hash = ?, locked_until = NULL, login_attempts = 0 WHERE employee_code = 'ADMIN001'", (pwd,))
>>> conn.commit()
>>> conn.close()
```

### 3.3 解鎖被鎖定帳號
```sql
-- 使用 sqlite3 命令列或 DB Browser
UPDATE employees SET locked_until = NULL, login_attempts = 0 WHERE email_company = 'locked@company.local';
```

---

## 四、日誌監控

### 4.1 稽核日誌查詢
瀏覽器：以 `admin` 角色登入 → 稽核日誌頁面，或 API：
```bash
curl http://localhost:5000/api/v1/audit-logs -b cookies.txt
```

### 4.2 直接查詢 SQLite
```bash
sqlite3 hr_system.db "SELECT created_at, actor_username, action, resource_type, description FROM audit_log ORDER BY created_at DESC LIMIT 20"
```

### 4.3 Flask 運行日誌
Flask 開發伺服器日誌直接輸出到終端機（stdout），建議正式環境使用 `gunicorn` 並設定日誌檔：
```bash
gunicorn -w 2 -b 0.0.0.0:5000 --access-logfile logs/access.log --error-logfile logs/error.log app:app
```

---

## 五、常見問題排除

| 問題 | 可能原因 | 解決方案 |
|:---|:---|:---|
| `no such table: departments` | 資料庫未初始化 | `python db_init.py` |
| `ENCRYPTION_KEY 未設定` | .env 遺失或路徑錯誤 | 確認 `.env` 在 outputs 目錄 |
| 登入後 403 Forbidden | RBAC 角色不足 | 確認 `role` 欄位為 `admin` |
| 帳號被鎖定 | 連續 5 次密碼錯誤 | 見 3.3 解鎖指令 |
| 頁面樣式異常 | CDN 無法連線 | 檢查防火牆、改用本機 Bootstrap |
| SQLite database is locked | 並行寫入衝突 | WAL 模式已啟用，若仍發生請重啟 Flask |

---

## 六、安全性維護

### 6.1 金鑰輪替
`ENCRYPTION_KEY`（Fernet）建議每半年輪替：
```python
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
# 將輸出更新到 .env，並重新加密所有機敏欄位
```

### 6.2 Session 安全
- 逾時：30 分鐘（`PERMANENT_SESSION_LIFETIME = 1800`）
- Cookie 設定：HttpOnly + Secure（本機開發 Secure=false）
- 暴力破解防護：5 次失敗鎖定 15 分鐘

### 6.3 依賴套件更新
```bash
pip list --outdated
pip install --upgrade Flask bcrypt cryptography
```

### 6.4 資料保留政策
- 離職員工資料保留 5 年，到期後需手動清理（目前無自動清理機制）
- SQLite 單檔最大約 140 TB，對 HR 系統綽綽有餘

---

## 七、升級路徑建議

| 項目 | 目前 | 建議升級 |
|:---|:---|:---|
| 資料庫 | SQLite | PostgreSQL（>50人時） |
| 伺服器 | Flask dev | Gunicorn + Nginx |
| 認證 | 本機備援 | Windows AD SSO (LDAPS) |
| 監控 | 手動腳本 | Prometheus + Grafana |
| 備份 | 本地檔案 | 異地備份 / S3 |
| HTTPS | 未啟用 | Let's Encrypt 憑證 |
