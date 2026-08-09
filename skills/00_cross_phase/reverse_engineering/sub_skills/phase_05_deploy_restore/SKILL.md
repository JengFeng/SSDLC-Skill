---
name: Reverse_Skill_DeployRestore
description: Phase 05 順向整合 — 逆向工程完成後，解析現有部署腳本、Dockerfile、組態檔，產出部署拓撲圖與建置清單。
---

## 一、定位

本子 Skill 在逆向工程完成後，以順向模式執行 Phase 05 部署發布，解析舊專案中已有的部署相關檔案。

**流程位置**：Phase 04 完成 → Phase 05 順向（本 Skill）→ Phase 06

---

## 二、觸發條件

- 被主控 Orchestrator `@reverse` 自動調度
- 或手動觸發：`@reverse-deploy [專案路徑]`

---

## 三、執行流程

### Step 1：部署檔案掃描

掃描以下檔案（若有）：

| 檔案類型 | 識別目標 |
|:---------|:---------|
| `Dockerfile` / `docker-compose.yml` | 容器化部署配置 |
| `*.sh` / `deploy.*` | 部署腳本 |
| `nginx.conf` / `apache.*` | Web 伺服器配置 |
| `*.yaml` / `*.yml`（K8s） | Kubernetes 部署配置 |
| `Makefile` | 建置腳本 |
| `requirements.txt` / `package.json` | 依賴清單 |
| `.env*` | 環境變數（僅結構，不含密鑰） |

產出：
- `deploy_files_manifest.json`：部署檔案清單

### Step 2：Dockerfile 解析

若存在 Dockerfile：
1. 解析基礎映像、建置階段、公開埠號
2. 識別環境變數、_VOLUME 掛載
3. 產出容器配置摘要

產出：
- `docker_analysis.md`：Dockerfile 分析報告

### Step 3：部署拓撲圖生成

從部署配置生成部署拓撲圖：
1. 識別服務間的網路關係
2. 識別外部依賴（資料庫、快取、第三方服務）
3. 使用 Mermaid `graph TD` 語法生成拓撲圖

產出：
- `deployment_topology.md`：部署拓撲圖

### Step 4：建置清單彙整

彙整所有部署相關資訊：
- 建置步驟
- 環境變數需求
- 外部服務依賴
- 埠號配置

產出：
- `build_manifest.json`：建置清單
- `deployment_report.md`：部署逆向整合報告

---

## 四、輸出清單

| 檔案 | 說明 |
|:-----|:-----|
| `deploy_files_manifest.json` | 部署檔案清單 |
| `docker_analysis.md` | Dockerfile 分析報告 |
| `deployment_topology.md` | 部署拓撲圖 |
| `build_manifest.json` | 建置清單 |
| `deployment_report.md` | 部署逆向整合報告 |

---

## 五、錯誤處理

| 錯誤類型 | 處理方式 |
|:---------|:---------|
| 無部署檔案 | 標註為無部署配置，跳過本階段 |
| Dockerfile 語法異常 | 僅解析可識別的部分 |
| K8s 配置不完整 | 標註已識別的服務，其餘標記待補 |
