"""
crypto_utils.py — AES-256 加解密工具
使用 cryptography.Fernet (AES-256-CBC + HMAC)
"""
from cryptography.fernet import Fernet
from config import Config

_fernet = None

def _get_fernet():
    global _fernet
    if _fernet is None:
        key = Config.ENCRYPTION_KEY
        if not key:
            raise RuntimeError("ENCRYPTION_KEY 未設定，請檢查 .env")
        _fernet = Fernet(key.encode() if isinstance(key, str) else key)
    return _fernet

def encrypt(plaintext: str) -> bytes:
    """加密明文字串，回傳 Fernet token (bytes)"""
    if plaintext is None:
        return None
    return _get_fernet().encrypt(plaintext.encode("utf-8"))

def decrypt(ciphertext) -> str | None:
    """解密 Fernet token，回傳明文字串"""
    if ciphertext is None:
        return None
    if isinstance(ciphertext, memoryview):
        ciphertext = bytes(ciphertext)
    return _get_fernet().decrypt(ciphertext).decode("utf-8")

def mask(value: str, show: int = 4) -> str:
    """部分遮蔽字串，保留前 show 個字元，其餘以 * 取代"""
    if not value:
        return ""
    if len(value) <= show:
        return value
    return value[:show] + "*" * (len(value) - show)
