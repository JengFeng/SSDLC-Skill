---
name: Reverse_Skill_OpsRestore
description: Phase 06 正向維運關卡 — 解析既有日誌與監控設定，建立有來源的手冊與流程；逆向期間僅能盤點。
---

## 一、定位

本子 Skill 在正向 Phase 06 關卡整理維運資料；逆向期間可盤點既有配置，未取得營運紀錄時不宣稱監控、SLA 或告警已驗證。

**流程位置**：Phase 05 完成 → Phase 06 順向（本 Skill）→ 逆向工程全部完成

---

## 二、觸發條件

- 正向 Phase 06 進入時調度；`@reverse` 階段可依明示要求只盤點配置
- 或手動觸發：`@reverse-ops [專案路徑]`

---

## 三、執行流程

### Step 1：運維配置掃描

掃描以下檔案（若有）：

| 檔案類型 | 識別目標 |
|:---------|:---------|
| `logging.*` / `log4j.*` / `logback.*` | 日誌框架配置 |
| `prometheus.*` / `grafana.*` | 監控配置 |
| `alertmanager.*` | 告警配置 |
| `supervisord.conf` / `pm2.*` | 進程管理配置 |
| `crontab` / `*.cron` | 定時任務 |
| `README.md` / `INSTALL.md` | 現有文件 |

產出：
- `ops_files_manifest.json`：運維檔案清單

### Step 2：日誌配置解析

1. 識別日誌框架與級別配置
2. 識別日誌輸出路徑與格式
3. 識別日誌輪轉策略

產出：
- `logging_analysis.md`：日誌配置分析

### Step 3：監控配置解析

1. 識別監控指標（CPU、記憶體、請求數等）
2. 識別告警規則
3. 識別儀表板配置

產出：
- `monitoring_analysis.md`：監控配置分析

### Step 4：運維手冊生成

彙整所有運維資訊，產出手冊：
- 日誌查看方式
- 監控儀表板存取
- 常見問題排查
- 備份與還原策略（若有）

產出：
- `ops_runbook.md`：運維手冊
- `ops_restoration_report.md`：運維逆向整合報告

---

## 四、輸出清單

| 檔案 | 說明 |
|:-----|:-----|
| `ops_files_manifest.json` | 運維檔案清單 |
| `logging_analysis.md` | 存在配置時的日誌分析（可選） |
| `monitoring_analysis.md` | 存在配置時的監控分析（可選） |
| `ops_runbook.md` | 運維手冊 |
| `ops_restoration_report.md` | 運維逆向整合報告 |

---

## 五、錯誤處理

| 錯誤類型 | 處理方式 |
|:---------|:---------|
| 無運維配置 | 產出空白模板，標註待補 |
| 日誌配置無法解析 | 標註為待人工補正 |
| 監控配置不完整 | 僅解析可識別的部分 |
