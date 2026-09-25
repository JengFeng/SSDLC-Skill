---
name: Reverse_Skill_DeployRestore
description: Phase 05 正向部署關卡 — 按實際平台解析配置與腳本，產出可追溯拓撲及建置清單；逆向期間僅能盤點。
---

## 一、定位

本子 Skill 在正向 Phase 05 關卡處理部署資料；逆向期間若盤點既有配置，只產生靜態候選，不視為已部署。

**流程位置**：Phase 04 完成 → Phase 05 順向（本 Skill）→ Phase 06

---

## 二、觸發條件

- 正向 Phase 05 進入時調度；`@reverse` 階段可依明示要求只盤點配置
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
| `web.config` / `*.csproj` / IIS 文件 | Windows／.NET 站台、組建與應用程式集區線索 |

產出：
- `deploy_files_manifest.json`：部署檔案清單

### Step 2：部署平台解析

先依實際平台解析 IIS／Windows、容器或其他部署配置。若存在 Dockerfile：
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
| `docker_analysis.md` | 存在 Dockerfile 時的分析報告（可選） |
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
