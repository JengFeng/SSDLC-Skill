# External Resources（外部第三方資源）

本目錄收錄本框架所引用的第三方外部 Skill 與資源。所有原始碼、腳本與第三方組件之智慧財產權均歸各原始作者所有，本框架僅基於其授權條款進行合理使用。

> 完整工作流程與規範定義於 [SKILL.md](SKILL.md)。

---

## 📦 資源清單

| 目錄 | 來源 | 授權 | 說明 |
|:-----|:-----|:-----|:-----|
| `anthropics-skills/` | [anthropics/skills](https://github.com/anthropics/skills) | See `THIRD_PARTY_NOTICES.md` | Anthropic 官方 Skill 合集（17 個） |
| `github-skills/` | GitHub 社群彙整 | — | GitHub 社群 Skill 合集（48 個） |
| `markitdown/` | [microsoft/markitdown](https://github.com/microsoft/markitdown) | MIT | Microsoft 輕量 Markdown 轉換工具（文件/簡報/試算表轉 Markdown） |
| `Security-Principles/` | 本框架自建 | — | 數位發展部資通安全署防護基準 Skill |
| `ui-ux-pro-max-skill/` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | MIT v2.6.2 | UI/UX 設計智慧技能組（7 個） |

---

## 🛠️ 指令操作

本框架提供 `@external-resource` 指令體系管理外部第三方資源，完整規範參照 [SKILL.md](SKILL.md)。

### 引入外部資源

```bash
@external-resource add <GitHub URL>
```

口語觸發：「引入外部 Skill」、「新增第三方資源」、「下載新的 Skill」

AI 代理將依序執行：
1. Clone 來源 repo，確認授權與功能
2. 放置至 `external-resources/<skill-name>/`，建立 `url.txt` 索引
3. 更新本 README 資源清單表格
4. 更新根目錄 `.gitignore` 排除規則
5. 更新引用警語模板
6. 執行 6 項驗證並報告結果

### 移除外部資源

```bash
@external-resource remove <Skill 目錄名稱>
```

口語觸發：「移除外部 Skill」、「刪除第三方資源」

AI 代理將依序執行：
1. 刪除 `external-resources/<skill-name>/` 目錄
2. 從本 README 資源清單表格中移除該列
3. 從引用警語模板中移除該列
4. 從根目錄 `.gitignore` 中移除該目錄的排除規則
5. 向使用者報告清理結果

### 查詢外部資源

```bash
@external-resource list
```

口語觸發：「查看外部資源」、「列出第三方 Skill」

列出所有外部資源的名稱、GitHub 來源、授權類型與功能簡述。

---

## 🔒 API Key 安全聲明

部分第三方 Skill 需要外部 API Key 才能完整使用。這些 Key 存放在各 Skill 目錄下的 `.env` 檔案中，**不會被提交至 Git**。

- 各 Skill 的 API Key 申請方式與額度限制，請參照其 GitHub README
- 配置方式：在各 Skill 目錄下建立 `.env` 檔案，依其文件填入對應的 Key
- ⚠️ **切勿將 API Key 提交至版本控制**（`.gitignore` 已排除所有 `.env` 檔案）

---

## 📋 引用警語模板

> 當其他人引用或 fork 本框架時，請將以下警語複製到其專案的對應位置，以符合第三方資源的授權規範與安全實務。

### 專案根目錄 README.md 追加區塊

```markdown
## ⚠️ 外部第三方資源聲明

本框架使用了以下第三方資源，其智慧財產權歸各原始作者所有：

| 資源 | 來源 | 授權 |
|:-----|:-----|:-----|
| Anthropic Skills | [github.com/anthropics/skills](https://github.com/anthropics/skills) | See THIRD_PARTY_NOTICES.md |
| MarkItDown | [github.com/microsoft/markitdown](https://github.com/microsoft/markitdown) | MIT |
| UI/UX Pro Max | [github.com/nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | MIT v2.6.2 |

- 所有第三方 Skill 的原始碼與詳細授權請參見 `external-resources/` 目錄下各自的 `LICENSE` 與 `THIRD_PARTY_NOTICES.md`。
- 使用第三方 Skill 時，請遵守其原始授權條款。
- 本框架對第三方資源不做任何擔保，使用風險由使用者自行承擔。
```

### .gitignore 追加規則

```gitignore
# 外部第三方 Skill 原始碼（各 Skill 需自行從來源下載）
# 排除原始碼內容，保留 url.txt 和 README.md 索引
external-resources/anthropics-skills/*
!external-resources/anthropics-skills/url.txt
external-resources/github-skills/*
!external-resources/github-skills/url.txt
external-resources/markitdown/*
!external-resources/markitdown/url.txt
external-resources/ui-ux-pro-max-skill/*
!external-resources/ui-ux-pro-max-skill/url.txt
```

> 加入上述規則後，Git 倉庫僅追蹤本 `README.md`、`SKILL.md` 與各子目錄的 `url.txt`，第三方原始碼需從各自的 GitHub 來源下載。

---

## 📥 安裝指引

若他人 fork 或引用本專案後需要使用第三方 Skill，請依各 Skill 的 GitHub 說明文件自行下載安裝。或使用指令一鍵引入：

```bash
@external-resource add https://github.com/owner/repo
```

各 Skill 的完整安裝與設定方式，請參考其 GitHub Repository 的 README。