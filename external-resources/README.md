# External Resources（外部第三方資源）

本目錄收錄本框架所引用的第三方外部 Skill 與資源。所有原始碼、腳本與第三方組件之智慧財產權均歸各原始作者所有，本框架僅基於其授權條款進行合理使用。

---

## 📦 資源清單

| 目錄 | 來源 | 授權 | 說明 |
|:-----|:-----|:-----|:-----|
| `anthropics-skills/` | [anthropics/skills](https://github.com/anthropics/skills) | See `THIRD_PARTY_NOTICES.md` | Anthropic 官方 Skill 合集（17 個） |
| `Benson-skill-main_FromBensonSupport/` | [Benson Skill](https://github.com/sunavalon/benson-skill) | — | Benson 自建 Skill 合集（28 個） |
| `github-skills/` | GitHub 社群彙整 | — | GitHub 社群 Skill 合集（48 個） |
| `Security-Principles/` | 本框架自建 | — | 數位發展部資通安全署防護基準 Skill |
| `ui-ux-pro-max-skill/` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | MIT v2.6.2 | UI/UX 設計智慧技能組（7 個） |
| `anysearch-skill/` | [anysearch-ai/anysearch-skill](https://github.com/anysearch-ai/anysearch-skill) | Apache 2.0 | 統一即時搜尋引擎 Skill |

---

## 🔒 API Key 安全聲明

部分第三方 Skill 需要外部 API Key 才能完整使用。這些 Key 存放在各 Skill 目錄下的 `.env` 檔案中，**不會被提交至 Git**。

### AnySearch Skill

- 用途：即時網路搜尋、垂直領域搜尋、批次搜尋、網頁內容提取
- API Key 申請：[anysearch.com/console/api-keys](https://anysearch.com/console/api-keys)
- 免費方案：1,000 次請求/天、20 QPS
- 配置方式：在 `anysearch-skill/` 目錄下建立 `.env` 檔，寫入 `ANYSEARCH_API_KEY=你的key`
- ⚠️ 匿名模式也可用，但速率限制較低

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
| UI/UX Pro Max | [github.com/nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | MIT v2.6.2 |
| AnySearch Skill | [github.com/anysearch-ai/anysearch-skill](https://github.com/anysearch-ai/anysearch-skill) | Apache 2.0 |

- 所有第三方 Skill 的原始碼與詳細授權請參見 `external-resources/` 目錄下各自的 `LICENSE` 與 `THIRD_PARTY_NOTICES.md`。
- 使用第三方 Skill 時，請遵守其原始授權條款。
- 部分 Skill 需要外部 API Key（如 AnySearch），請自行申請並配置，**切勿將 API Key 提交至版本控制**。
- 本框架對第三方資源不做任何擔保，使用風險由使用者自行承擔。
```

### .gitignore 追加規則

```gitignore
# 外部第三方 Skill 原始碼（各 Skill 需自行從來源下載）
external-resources/anthropics-skills/
external-resources/Benson-skill-main_FromBensonSupport/
external-resources/github-skills/
external-resources/ui-ux-pro-max-skill/
external-resources/anysearch-skill/
```

> 加入上述規則後，Git 倉庫僅追蹤本 `README.md`（資源清單與警語），第三方原始碼需從各自的 GitHub 來源下載。

---

## 📥 安裝指引

若他人 fork 或引用本專案後需要使用第三方 Skill，請依各 Skill 的 GitHub 說明文件自行下載安裝：

```bash
# AnySearch Skill（範例）
git clone https://github.com/anysearch-ai/anysearch-skill.git external-resources/anysearch-skill
# 申請 API Key: https://anysearch.com/console/api-keys
# 建立 .env: echo "ANYSEARCH_API_KEY=你的key" > external-resources/anysearch-skill/.env
```

各 Skill 的完整安裝與設定方式，請參考其 GitHub Repository 的 README。
