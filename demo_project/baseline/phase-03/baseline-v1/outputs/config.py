"""
config.py — 員工基本資料管理系統 組態設定
"""
import os
import secrets
from dotenv import load_dotenv

# 從 config.py 所在目錄載入 .env（而非 CWD）
_ENV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(_ENV_PATH)

class Config:
    # 生產環境強制使用環境變數，開發環境自動產生隨機金鑰
    SECRET_KEY = os.getenv("SECRET_KEY") or secrets.token_hex(32)
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SECURE = True  # 生產環境需啟用 HTTPS
    SESSION_COOKIE_SAMESITE = "Lax"
    PERMANENT_SESSION_LIFETIME = 1800  # 30 分鐘

    # SQLite
    DB_PATH = os.getenv("DB_PATH", os.path.join(os.path.dirname(os.path.abspath(__file__)), "hr_system.db"))

    # AES-256 加密金鑰 (Fernet)
    ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "")

    # AD SSO (LDAPS)
    AD_SERVER = os.getenv("AD_SERVER", "")
    AD_DOMAIN = os.getenv("AD_DOMAIN", "")
    AD_BASE_DN = os.getenv("AD_BASE_DN", "")
    AD_BIND_USER = os.getenv("AD_BIND_USER", "")
    AD_BIND_PASSWORD = os.getenv("AD_BIND_PASSWORD", "")

    # 安全
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_MINUTES = 15
    MAX_UPLOAD_SIZE_MB = 5
    ALLOWED_UPLOAD_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}

    # 報表
    ITEMS_PER_PAGE = 50
