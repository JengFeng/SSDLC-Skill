# Benson Skills

Benson 自建的 Claude Code skill 集合，跨平台同步用。

Repo：https://github.com/MMBenson/Benson-skill
本機路徑：`C:\Users\benso\Desktop\CLAUDE COWORK\PROJECTS\benson-skill`

---

## 安裝

### Claude Code CLI（推薦）

```powershell
# 1. 設 GITHUB_TOKEN（Private repo 必要，給 auto-update 用）
$env:GITHUB_TOKEN = "ghp_xxxxxxxxxxxxxxxxxxxx"   # 個人在 ~/Documents/PowerShell/profile.ps1 永久設

# 2. 加 marketplace + 裝 plugin
claude plugin marketplace add MMBenson/Benson-skill
claude plugin install benson-skills@benson-skill
```

或在互動式 Claude Code 內：
```
/plugin marketplace add MMBenson/Benson-skill
/plugin install benson-skills@benson-skill
```

裝完所有 20 個 skill 都有了。觸發名 namespace 是 `benson-skills:<skill-name>`，但 model-invoked skill（看 description 自動觸發）不受影響，直接用口語觸發即可。

### Cowork (Claude Desktop)

理論上同上指令；官方文件未明確說明 Cowork 是否吃 `/plugin marketplace`，需實測。

### claude.ai Chat

官方未明說 marketplace 支援。要手動上傳：到 https://claude.ai/customize/skills 用 + 按鈕上傳常用 skill 的資料夾。

---

## 維運

```powershell
# 改 skill 後（在 ~/.claude/skills/ 改）一鍵同步到 repo + push
cd "C:\Users\benso\Desktop\CLAUDE COWORK\PROJECTS\benson-skill"
.\sync.ps1

# 其他機器 / Cowork 收新版
claude plugin marketplace update
```

---

<!-- SKILLS-LIST-START -->
## 包含的 skill (29)

| Skill | 最近更新 | 用途 |
|---|---|---|
| eip-item-builder | 2026-06-22 | EIP 工項建置技能 |
| ekb-note | 2026-06-21 | 寫入 / 查詢 Benson 的 EKB 知識庫 (https://your-server.example.com/EIP/ekb) |
| sa-design | 2026-06-21 | 系統分析設計（SA/SD）— SDLC 接在「雛形」之後，把需求或雛形畫面變成工程師可直接開發的系統設計 |
| benson-skill-sync | 2026-06-20 | Benson 自建 skill 同步到 GitHub marketplace 的一鍵工具 |
| grill-me | 2026-06-20 | 動手前「先讀文件、再逐點拷問使用者、結論回寫」的需求釐清 skill（grill-with-docs 流派） |
| project-dashboard | 2026-06-19 | 為單一專案產出「互動式進度儀表板」(WBS + 甘特 + 達成率 + 缺漏 + 專案資產 + 資料夾健檢) |
| project-pulse | 2026-06-13 | 專案問答 / 專案把脈 — 把「問某專案的某主題」變成跨四層分層作答的單一入口 |
| bcp-drill-doc | 2026-06-02 | 營運持續計畫（BCP）演練紀錄表產生器 |
| proposal-pptx | 2026-06-02 | 一站式產出「服務建議簡報」的專屬 skill |
| bootstrap-ui | 2026-06-01 | 用 Bootstrap 5.3+ 建立前端 UI 與互動式 HTML 雛形 |
| eip-line-radar | 2026-06-01 | EIP LINE 雷達 + 訊號挖掘 |
| ekb-note-tts | 2026-06-01 | 把 EKB 知識庫的某篇筆記「配上 AI 講解語音」 |
| fortigate-qa | 2026-06-01 | FortiGate 防火牆設定檔自然語言問答 |
| handover | 2026-06-01 | 跨 session / 裝置 / Agent 的 AI 工作記憶技能 |
| proposal-doc | 2026-06-01 | 撰寫「服務建議書」文件的專屬 skill（內建反 AI 痕跡） |
| workplan-doc | 2026-06-01 | 撰寫「工作執行計畫書」的專屬 skill（得標後第一份交付文件） |
| ai-news-video | 2026-05-30 | 抓取本週 AI 新聞並產出 4-7 分鐘 YouTube 影片配音腳本 + 投影片 + mp4（繁體中文台灣用詞） |
| service-sqa | 2026-05-30 | 模擬系統測試人員 (SQA / QA engineer / pentester) 對 Benson 水利監控系統 (se… |
| work-review | 2026-05-30 | 工作整合報告（合一 daily / weekly） |
| meeting-record | 2026-05-27 | 把會議逐字稿（語音轉文字 .md）變成完整的會議紀錄資產 — 結構化 EKB note + HTML/CSS 投影片 +… |
| proposal-narration | 2026-05-27 | 把提案 PPTX 轉成「配旁白的 MP4 影片」的完整 pipeline |
| easymap | 2026-05-22 | Easymap 7 GIS 圖台開發助理 |
| quote-builder | 2026-05-22 | 政府／企業案報價單 (.xlsx) 產生器 |
| fortigate-api-spec | 2026-05-18 | FortiGate / FortiOS 7.2.13 REST API 規格查詢工具 |
| image-gen | 2026-04-24 | 通用 AI 圖片生成 Skill |
| isms-audit-prep | 2026-03-30 | 內部資安稽核準備助理 — 從零到完成的全流程引導 |
| rfp-builder | 2026-03-28 | 撰寫「需求說明書」+ 經費概算表的專屬 skill |
| project-dev-manager | 2026-03-13 | 專案開發管理技能 — 從需求討論到開發追蹤的標準化流程 |
| file-organizer | 2026-02-15 | 專案文件分類與整理工具 (Document Management Specialist)：依據使用者定義的標準文件分類架… |
<!-- SKILLS-LIST-END -->

## 換電腦時的初始化

```powershell
git clone https://github.com/MMBenson/Benson-skill.git "$env:USERPROFILE\Desktop\CLAUDE COWORK\PROJECTS\benson-skill"
claude plugin marketplace add MMBenson/Benson-skill
claude plugin install benson-skills@benson-skill
# 之後對 Claude 說「同步 skill」即可
```

---

## 注意

- 敏感檔（.env / *.key / *.db）已 gitignore，不會進 repo
- handover-skill 在 repo 內叫 `handover`（去掉 -skill 後綴）
- 版本管理：plugin.json 不設 version → 每次 commit 自動算新版（`claude plugin marketplace update` 就能拿到最新）
- Repo 為 Private，安裝端需要 `GITHUB_TOKEN` 環境變數做 background auto-update
