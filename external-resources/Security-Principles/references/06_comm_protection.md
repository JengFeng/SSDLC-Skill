# 構面 6：系統與通訊保護 (System & Communications Protection)

> 資料來源：資通系統防護基準驗證實務 v1.3 §2.6

## 控制措施類別

### 6.1 傳輸之機密性與完整性（項次 67-72）

| 項次 | 控制措施 | 適用等級 |
|------|---------|:---:|
| 67 | 身分驗證及資料傳輸應採用加密協定（HTTPS/TLS 1.2+） | 普/中/高 |
| 68 | 應使用公鑰憑證（SSL/TLS 憑證）保護傳輸安全 | 普/中/高 |
| 69 | 遠端管理應採用加密連線（SSH / RDP with TLS） | 普/中/高 |
| 70 | 應停用不安全的加密協定（SSL 2.0/3.0、TLS 1.0/1.1） | 中/高 |
| 71 | 應使用強密碼套件（Cipher Suites），避免使用已知弱點之演算法 | 中/高 |
| 72 | 應考量後量子加密（Post-Quantum Cryptography）支援 | 高 |

**TLS 設定建議**：
- 最低版本：TLS 1.2
- 建議版本：TLS 1.3
- 停用：SSL 2.0, SSL 3.0, TLS 1.0, TLS 1.1
- 憑證：2048-bit RSA 以上 或 ECC（如 ECDSA P-256）

**驗證工具**：
- Nmap (
map --script ssl-enum-ciphers)
- SSL Labs Server Test
- OpenSSL (openssl s_client)

### 6.2 資料儲存之安全（項次 73-75）

| 項次 | 控制措施 | 適用等級 |
|------|---------|:---:|
| 73 | 資料庫連線字串（Connection String）應以加密方式儲存，不得明文 | 普/中/高 |
| 74 | 機敏性資料應加密儲存於資料庫 | 中/高 |
| 75 | 應使用金鑰管理機制（HSM 或金鑰保管服務）保護加密金鑰 | 高 |

**Windows 平台實務**：
- 使用 spnet_regiis 加密 web.config 中的 connectionStrings
- IIS：使用「IIS 伺服器憑證」管理 SSL 憑證

**資料庫加密**：
- 機敏欄位：AES-256 加密
- 金鑰管理：Windows DPAPI / Azure Key Vault / HSM

## SSDLC 階段對應

- **Phase 2 系統設計**：設計加密架構、選擇 TLS 版本與密碼套件
- **Phase 3 開發編碼**：實作 HTTPS 強制導向、連線字串加密、SSH 設定
- **Phase 5 部署發布**：安裝 SSL 憑證、設定 TLS 最低版本、停用不安全協定
- **Phase 6 維護監控**：憑證到期監控、TLS 版本定期檢測
