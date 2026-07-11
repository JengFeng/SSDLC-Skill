---
name: 05_deployment
description: 部署階段，負責建置成品打包、多服務依賴部署、伺服器組態自動產生、遠端批次部署、數位簽章寫入及部署環境型態完整性（SHA-256）驗證。
---

# 部署階段技能規範 (05_deployment)

本技能定義了開發團隊在部署階段的標準作業程序（SOP）與代理職責。

> ⚠️ **最高指導框架原則**：本規範受 [CORE_RULES.md](../../../docs/CORE_RULES.md) 管轄，所有代理行為必須遵循 PDCA 閉環與錯誤分級重試機制。

## 一、 代理人職責規範

### 0. 安全防護整合（條件式）

> 本節僅在 `phase_gates.json` 中 `security_baseline.enabled` 為 `true` 時啟用。

*   **適用安全構面**：構面 3（營運持續計畫）、構面 6（系統與通訊保護）
*   **對應參考文件**：`external-resources/Security-Principles/references/03_bcp.md`、`06_comm_protection.md`


### 1. Planner (規劃代理)
    1.  **Skill 上下文推薦**：分析部署環境與需求，主動向使用者推薦：
        - CI/CD 管線需求 → 推薦 `circleci`（自動化建置與部署）
        - Expo/React Native → 推薦 `expo-deployment`（App Store/Play Store 上架）
        - 使用者決定採用、跳過、或換其他 Skill。不可未確認即載入。
    1.  設計部署步驟與環境設定，規劃多服務之間的依賴部署順序，並制定若部署失敗時的快速回滾（Rollback）方案。**[條件式]** 若 `security_baseline.enabled` 為 `true`，額外規劃：資料備份排程（RPO定義）、SSL/TLS 憑證配置、資料庫連線字串加密、關閉不必要的服務與埠口。
*   **驗收標準**：部署清單中必須定義明確的 Rollback 步驟（如還原資料庫與程式碼至指定 Baseline），以及多服務依賴拓樸圖。

### 2. Generator (執行代理)
*   **核心鐵律**：**只執行、不判斷、不檢查、不修改**。
*   **任務**：
    1.  執行編譯與自動化建置，產出可部署之成品。
    2.  依據多服務依賴順序，執行批次部署。
    3.  透過基礎設施即代碼（IaC）工具自動產生伺服器組態（包含反向代理與負載平衡配置）。
    4.  對建置產出的二進位檔案進行數位簽章寫入。
    5.  產出建置清單 `outputs/build_manifest.json`，計算並記錄所有組態項目檔案的 SHA-256 雜湊值（Hash）。
    6.  產出數位簽章與建置結果報告 `outputs/signature_status.json`。
    7.  **[條件式] 安全部署
*   **[條件式] Secret 管理**：若 `security_baseline.enabled` 為 `true`，部署時強制執行：
    1. 所有密鑰（API Key、DB 密碼、Session Secret）必須透過環境變數或 Secret Manager 注入，禁止寫入程式碼或設定檔。
    2. `.env` 檔案必須加入 `.gitignore`，並提供 `.env.example` 範本（不含真實密鑰）。
    3. 檢查 `scripts/security/pre_commit_secrets.py` 是否已安裝為 Git pre-commit hook。
    4. 產生 SBOM（`python scripts/security/generate_sbom.py`）。執行**：若 `security_baseline.enabled` 為 `true`，執行：HTTPS/TLS 1.2+ 配置、資料庫連線字串加密、備份排程設定、安全組態鎖定（關閉不必要的服務與埠口），產出 `outputs/security_deploy_report.md`。
    7.  完成後儲存執行快照至根目錄的 `snapshots/` 目錄。

### 3. Evaluator (審查代理)
*   **任務**：型態完整性與可用度驗證。
*   **審查重點**：
    *   **組態基準比對 (30%)**：重新計算當前實體檔案的 SHA-256 雜湊值，並比對 `build_manifest.json` 中的紀錄，確保檔案未被外部篡改或遺漏。
    *   **可用度核對 (30%)**：自動呼叫 Health Check API，執行煙霧測試（Smoke Test），確認部署後的系統基本功能正常。
    *   **數位簽章校驗 (20%)**：驗證二進位檔的證書簽章是否有效。
    *   **組態正確性 (10%)**：驗證 IaC 產生的伺服器組態（反向代理、負載平衡）是否正確生效。
    *   **部署安全完整性 (10%)**（條件式）：若 `security_baseline.enabled` 為 `true`，確認 HTTPS/TLS 正確配置、備份排程已啟用、連線字串已加密、不必要的服務已關閉。若未啟用則此項權重合併至組態正確性。
*   **錯誤分類與重試**（依 CORE_RULES.md 規範）：
    *   **A 類錯誤**（建置失敗、API 逾時、網路連線中斷、部署環境暫時異常）：局部重試最多 3 次，僅退回 Generator。
    *   **B 類錯誤**（SHA-256 雜湊不匹配、數位簽章無效、伺服器組態衝突、部署架構錯誤）：立即升級全域迭代，上限 2 輪。

---

## 二、 輸入與輸出規範

*   **輸入路徑 (`inputs/`)**：存放此階段人類輸入的環境配置參數與金鑰，以及 SSOT 規格（`specs/executable_spec.yaml`）。
*   **輸出路徑 (`outputs/`)**：
    *   `build_manifest.json`：建置組態項目清單（含 SHA-256）。
    *   `signature_status.json`：數位簽章驗證結果。
    *   `deployment_topology.md`：多服務部署拓樸與依賴關係圖。

*   **🔒 安全產出（條件式）**：若 `security_baseline.enabled` 為 `true`，額外產出：
    *   `outputs/sbom.json` — 軟體物料清單（CycloneDX 格式）
    *   `outputs/.env.example` — 環境變數範本（不含真實密鑰）
    *   `outputs/security_deployment_checklist.md` — 部署安全檢核表（TLS、憑證、Secret 管理、防火牆規則）

> 📋 **IO 檔案管理（選擇性功能）**：
> 若使用者已透過以下任一方式啟用 IO 檔案合約管理：
> ① `@init` 時同意啟用 ② `@io set [phase]` ③ `@[phase] in:/out:` 快速定義語法，
> 則
> 本階段的 inputs/outputs 定義將由 `io_files.yaml` 取代上述預設值，
> Planner / Generator / Evaluator 須遵循
> [00_cross_phase/SKILL.md 第六節](../00_cross_phase/SKILL.md) 的合約管理規範。
> 若未啟用，本段不適用，照上述預設值執行。

