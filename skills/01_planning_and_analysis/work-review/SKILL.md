---
name: work-review
description: "工作整合報告（合一 daily / weekly）。整合三源：Outlook（email + 行事曆）、EIP 工項系統、LINE 群組對話。依觸發詞決定時間範圍與 LINE 區塊是否啟用。觸發詞：「每日報告」「工作檢核」「今日待辦」「daily review」「幫我看信」「今天要做什麼」「週報」「本週重點」「這週還沒派」「team review」「最近怎樣」。"
---

# 工作整合報告 Skill（review）

整合 Outlook + EIP + LINE 三源，依觸發詞決定**時間範圍**與**是否啟用 LINE 區塊**，產出 CEO 級工作檢核報告。

## Mode 切換規則（依觸發詞）

| 觸發詞 | 時間範圍 | LINE 區塊 |
|---|---|---|
| 每日報告 / 今日待辦 / 幫我看信 / daily review | 過去 1 天 + 未來 2 週 | ❌ 不跑 |
| 工作檢核 / 今天要做什麼 | 過去 1 週 + 未來 2 週 | ❌ 不跑 |
| 週報 / 本週重點 / 這週還沒派 / team review | 過去 7 天 | ✅ 跑 |
| 最近怎樣 | 自動判斷（看上次跑 review 是多久前） | ✅ 跑（若 > 3 天） |

LINE 區塊啟用時，會讀 `review.yml` 列的 DB 路徑與群組白名單，套用 6 步 SOP。首次跑時若無 `review.yml`，跑 **init wizard**（見 §十）。

---

## 一、觸發時機

使用者說以下任一：
- **Daily mode**（不跑 LINE）：「每日報告」「工作檢核」「今日待辦」「outlook review」「daily review」「幫我看信」「看一下 email」「今天要做什麼」「這週有什麼」「工作彙整」
- **Weekly mode**（含 LINE）：「週報」「本週重點」「這週還沒派」「team review」「最近怎樣」（後者若距上次跑 review > 3 天才啟用 LINE）

---

## 二、資料來源

### 1. Outlook（本機 COM 介面）

```python
import win32com.client
outlook = win32com.client.Dispatch('Outlook.Application')
ns = outlook.GetNamespace('MAPI')
```

**行事曆**（過去兩週 + 未來兩週）：
- `ns.GetDefaultFolder(9)` → Calendar
- 篩選：`[Start] >= "MM/DD/YYYY" AND [Start] <= "MM/DD/YYYY"`
- `IncludeRecurrences = True`
- 只保留 ResponseStatus = 1（主辦）或 3（已接受）
- 記錄：日期、時間、主旨、地點、主辦人、回覆狀態

**Email**（過去兩週）：
- `ns.GetDefaultFolder(6)` → Inbox
- 篩選：`[ReceivedTime] >= "MM/DD/YYYY"`
- 過濾排除：EIP 通知（請假/公告/日報/表單匯總/文件中心）、系統自動信（妥善率/驗證碼/VPN密碼）、電子報、廣告
- 記錄：日期、寄件人、主旨、重要性、內文前 150 字

### 2. EIP 工項系統（HTTP API）

```python
import requests, json
resp = requests.post(
    'https://your-server.example.com
    data={
        'action': 'fetch',
        'status': json.dumps(['未開始', '進行中', '待測試'], ensure_ascii=False)
    }
)
data = resp.json()
items = [it for it in data.get('data', []) if it.get('status') in ('未開始', '進行中', '待測試')]
```

工項連結格式：`https://your-server.example.com

### 3. LINE 群組對話（weekly mode 才啟用）

讀取 `{working_dir}/.claude-projects/review.yml` 或 `~/.claude/projects/{project_slug}/review.yml` 設定檔，依列出的 DB 路徑與群組白名單掃描。

```python
# 由 line_scan.py 處理
import sqlite3, yaml
cfg = yaml.safe_load(open('review.yml'))
for src in cfg.get('line_sources', []):
    db = sqlite3.connect(src['db_path'])
    groups = src.get('groups', [])  # 空 = 全部
    # SELECT FROM chat_msg_cache WHERE source_name IN (groups) AND created_at >= last_7_days
```

掃描 6 步 SOP（按優先序）：
1. **商務 scan**（最高優先）— 報價／估價／議價／發包／單價／請購／訪價／合約／驗收金額
2. **會議追蹤** — 邀約 keyword（明天討論／下午開會／議題／找時間談）→ 自動查該群組會議日期後 24~72hr 有無結論訊息 → 無 = 紅旗
3. **客戶催件** — 對方在問／客戶催／再詢問／等回覆／沒下文／催／怎麼還沒
4. **@Benson inbox** — `@Benson` `@秉澄` `@蘇小B` 未回應的（按已晾天數排序）
5. **自動推播未 close** — `display_name = 桃園水情防災通報` 訊息中含「未開始 N 個」整週重複出現的項目
6. **已派未追** — 你交辦出去（你發訊息含「@XX 麻煩／請」）後該人沒回報

設定檔範本：
```yaml
# ~/.claude/projects/{slug}/review.yml
line_sources:
  - db_path: ~/Desktop/CLAUDE COWORK/PROJECTS/LINE/.handover/handover.db
    groups:           # 空陣列 = 該 DB 全部群組
      - 桃園水情-現地工程連測
      - 桃園水務局業務_諺庭
  - db_path: ~/Desktop/CLAUDE COWORK/PROJECTS/SEWAGE/.handover/handover.db
    groups: []        # 全部
```

無 `review.yml` → 跑 §十 init wizard。`line_sources: []`（明確設成空）→ 跳過 LINE 區塊不問。

---

## 三、資料呈現原則

**Outlook 和 EIP 各自獨立呈現，不做強制關聯。**

- Email 歸 Email 段落，依分類列出
- EIP 工項歸 EIP 段落，依專案分組
- 行事曆歸行程段落，依日期排列
- **不要用關鍵字硬配對 email 和 EIP 工項**（容易出錯）
- 管理摘要由 AI 綜合判斷撰寫，但不在卡片上標註「📧 關聯 email」

未來若有精確的 ID 對應機制（例如 email 裡提到工項 ID），才啟用關聯標註。

---

## 四、HTML 報告格式（重要）

### 固定模板檔案（必須使用，不要從零生成）

報告和儀表板都有固定的 HTML 模板，存在 skill 資料夾裡：
- **報告模板**：`~/.claude/skills/review/template_report.html`
- **儀表板模板**：`~/.claude/skills/review/template_dashboard.html`

**執行時必須先讀取模板，分析其 HTML 結構（div 排列、CSS 樣式、卡片格式），然後按照模板的結構生成新報告。不要自己發明排版。**

模板使用方式：
1. 讀取模板 HTML
2. 分析其結構（哪些 section、每個 section 的卡片格式、CSS 樣式）
3. 用相同的 HTML 結構 + CSS 樣式，填入當天的真實資料
4. 保持模板的排版、配色、字級、間距完全一致

### 設計規則（模板已遵循，僅供參考）
- `<meta name="viewport" content="width=device-width, initial-scale=1">`
- **完全不用 `<table>`** — 全部 div 卡片式排版
- All inline CSS
- Max width 720px 置中
- Font: -apple-system, "Microsoft JhengHei", sans-serif
- 背景 #f0f2f5，卡片白底圓角陰影
- 右下角浮動返回頂部按鈕

### 報告結構（按順序）

**Header**
- 漸層藍色背景
- 標題：📋 每日工作整合報告
- 副標：日期 | Outlook + EIP 整合檢核

**B. 關鍵數字（2x2 grid）**
- 🔴 緊急待辦: N
- 📧 Email 待跟進: N
- 📅 未來行程: N
- 📋 EIP 未完成工項: N
- **每個數字可點擊跳轉到對應段落**（用 HTML 錨點 `<a href="#section-x">`）

**A. 管理摘要**
6 張彩色 mini card，每張有標題色條 + 條列式重點：

1. **💡 建議今日優先處理**（深藍 #1a365d）← 放最前面
   - 編號列出 Top 5 優先事項
2. **📅 行程總覽**（藍 #2b6cb0）
   - 未來兩週重點行程條列
3. **🔴 緊急事項**（紅 #c53030）
   - 需立即處理的條列
4. **📧 Email 與報價追蹤**（橘 #dd6b20）
   - 重要 email 條列
5. **🔒 資安與維運**（綠 #2f855a）
   - 資安相關條列
6. **⏪ 過去兩週會議**（紫 #6b46c1）
   - 主辦場次、外訓場次、待確認紀錄

**C. 🔴 緊急行動清單**
- 紅色左邊框卡片
- 每段有小總結 summary bar

**D. 📅 未來兩週行程**
- 每天一個 day header（藍色左邊框 = 未來、紅色 = 緊急）
- 每場會議一張卡片（時間 + 主旨 + 備註）
- 重要會議加準備事項 prep box（紅色左邊框）
- 小總結：本週 N 場 | 下週 N 場

**E. 📋 EIP 工項追蹤**
- **整體文字總結**（放在最前面，管理級摘要）：全局概況、需立即關注的高風險項、待外部配合事項、建議優先處理
- 每個專案一張卡片：
  - 專案名稱 + 數量 badge
  - 優先級統計 summary bar
  - **專案文字小總結**（1-2 句描述目前狀況與重點）
  - 每筆工項：左邊框顏色（紅=高、橙=中、灰=低）+ 狀態 + **可點擊連結到 EIP**
  - 連結格式：`<a href="https://your-server.example.com" target="_blank" style="color:#2b6cb0;">{item_name}</a>`
  - **不標註 email 關聯**（不做強制比對）
- 小總結：共 N 筆 | 🔴 高 N 筆 | 涉及 N 專案

**F. 📧 過去兩週 Email 追蹤**
- 分 5 類：專案執行、報價採購、合作溝通、資安維運、人事行政
- 每類有小總結（N 封 | 需行動 N 封）
- 每封 email 一張卡片（日期 + 寄件人 + 主旨 + 狀態 badge）

**G. ⏪ 過去兩週會議回顧**
- 每天 day header + 會議卡片
- 只列已確認出席的（已接受/主辦）
- 標註後續狀態（❓待確認 / ✅已完成 / 外訓 / 內訓）
- 小總結：N 場 | 主辦 N 場 | 外訓 N 場 | 待確認 N 場

**H. 📱 LINE 本週重點**（**僅 weekly mode 啟用**，daily mode 不出現此區塊）
- 6 子卡（按優先序）：
  1. 💰 **商務／報價／請購**（橘 #dd6b20）
  2. 📅 **會議追蹤**（紫 #6b46c1）— 邀約後無結論訊息標紅
  3. 📞 **客戶催件**（紅 #c53030）
  4. 📥 **@Benson inbox 未回**（橙 #ed8936）— 按已晾天數降序
  5. 🔁 **自動推播未 close**（灰 #4a5568）
  6. 🎯 **已派未追**（藍 #2b6cb0）
- 每筆訊息格式：`[YYYY-MM-DD HH:MM] {群組} | {當事人}: {內容前 140 字}`
- 紅 🔴 高優先（硬截止 7 天內 / 客戶催 / 連續晾 > 3 天）
- 黃 🟡 中優先（會議無結論 / inbox 1-3 天）
- 綠 🟢 低優先（已派團隊但等回報）
- 小總結：本週 N 條紅 / N 條黃 / N 條綠

**Footer**
- 下次檢核建議時間
- Generated by Claude Code

---

## 五、儀表板更新 + 備份

### 更新儀表板
每次執行 review 時，同時重新生成儀表板 HTML 並上傳覆蓋：
```python
requests.post(
    'https://your-server.example.com
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_TOKEN',
    },
    json={'html': dashboard_html, 'key': 'dashboard'}
)
# 固定網址：https://your-server.example.com
```

儀表板內容：所有 skill 清單、MCP 連線、記憶項目、API Key 狀態、重要路徑。
掃描 `~/.claude/skills/`、`~/.claude/projects/*/memory/`、`~/.claude/.mcp.json`、`~/.claude/settings.json` 自動產出。

### 加密備份
每次執行時自動打包所有 Claude Code 設定，AES-256 加密上傳：
```python
import pyzipper, os, datetime

password = b'YOUR_BACKUP_PASSWORD'
claude_dir = os.path.expanduser('~/.claude')
today = datetime.datetime.now().strftime('%Y%m%d')
zip_path = f'claude_backup_{today}.zip'

# 備份：skills/、projects/*/memory/、CLAUDE.md、.mcp.json、settings.json
with pyzipper.AESZipFile(zip_path, 'w', compression=pyzipper.ZIP_DEFLATED, encryption=pyzipper.WZ_AES) as zf:
    zf.setpassword(password)
    # ... walk and add files

# 上傳
requests.post(
    'https://your-server.example.com/api/upload_backup.php',
    headers={'Authorization': 'Bearer YOUR_API_TOKEN'},
    files={'backup': (f'claude_backup_{today}.zip', open(zip_path, 'rb'), 'application/zip')}
)
# 自動保留最近 7 份
```

---

## 六、上傳與通知

### 上傳報告
```python
import requests
response = requests.post(
    'https://your-server.example.com
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_TOKEN',
    },
    json={
        'html': html_content,
        'title': f'每日工作整合報告 {today_str}',
    }
)
url = response.json().get('url')
```

### LINE 推播通知
```python
requests.post(
    'https://api.line.me/v2/bot/message/push',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 82Lta+g1SM1xJjKnO4ICuca1SJTXIynhUJYbe2kyToxvBykUpEV3OL+Tj8oMB7bZkQ6c3vL/hHy4qLai03/ocJoKT5alZPjOr4VFP/roKPOiXGYp1+E85i0+KS/b8s1R75ctyxeDu35hT5XF8wQKJwdB04t89/1O/w1cDnyilFU=',
    },
    json={
        'to': 'U9f13c28b1df2ddbc5a1ed6a7c9358830',
        'messages': [{
            'type': 'text',
            'text': f'📋 每日工作整合報告\n🔴 緊急待辦：{urgent_count} 項\n📋 EIP 未完成：{eip_count} 項\n📧 Email 待跟進：{email_count} 封\n📅 未來行程：{calendar_count} 場\n\n👉 完整報告：{report_url}\n📊 儀表板：https://your-server.example.com 加密備份：{backup_url}'
        }]
    }
)
```

---

## 七、執行流程（每一步都必須完成，不能省略）

### Step 0 — 判斷 mode
依觸發詞決定 daily / weekly mode（見 §一）+ 時間範圍。

### 共通流程
1. 讀取 Outlook 行事曆（前後各兩週）
2. 讀取 Outlook Email（過去兩週，過濾系統通知）
3. 呼叫 EIP API 撈取活躍工項
4. **【Weekly mode 限定】** 跑 `line_scan.py` 掃 LINE chat_msg_cache（讀 review.yml 設定；無設定先跑 §十 init wizard）→ 回傳 6 子卡 dict
5. 各資料獨立呈現，不做強制關聯
6. 生成 HTML 報告（**必須先讀取 template_report.html 模板**）→ Weekly mode 多渲染 H 區塊 → 上傳 save_report → **記住 API 回傳的 url**
7. 更新儀表板 HTML（**必須先讀取 template_dashboard.html 模板**）→ 上傳 save_dashboard
8. **加密備份（不能省略！）**：用 pyzipper AES-256 打包 skills/ + projects/*/memory/ + CLAUDE.md + .mcp.json + settings.json + settings.local.json + RESTORE.md → 上傳 upload_backup
9. LINE 推播通知 — **必須包含三個連結：(1) 報告網址（Step 6 API 回傳的 url）、(2) 儀表板固定網址、(3) 備份檔案網址（Step 8 API 回傳的 url）。絕對不要自己編造 URL**
10. 在 Discord 回覆報告連結 + 儀表板連結 + 備份連結
11. **【Weekly mode 限定】** 跑 §十一 寫回 handover 互動流程

### ⚠ 常見錯誤防範
- **LINE 網址錯誤**：報告 URL 一定從 save_report API 的回傳 JSON 取得 `url` 欄位，格式為 `https://your-server.example.com URL
- **備份被省略**：備份是必要步驟，檔案大小應 > 50KB（包含所有 skill 和記憶），如果 < 20KB 表示備份不完整
- **模板沒讀取**：如果不讀模板就自己生成 HTML，每次格式會不一樣。必須先讀模板再照做
- **EIP 工項沒連結**：每筆工項必須有 `<a href="...itemdetail.php?id={id}">` 可點擊連結
- **LINE 推播缺連結**：LINE 訊息必須包含三個連結 — 報告 URL（save_report 回傳）、儀表板 URL（固定 https://your-server.example.com URL（upload_backup 回傳）。缺一不可

---

## 七、Email 過濾規則

### 排除的寄件人
EIP, 經濟部水利署-水情影像雲端平台, iotwra@wra.gov.tw, CPS@mail.ardswc.gov.tw, 文化資產氣象資訊系統, 國泰世華銀行, 中華電信台中文心IDC, 恆逸台中教育訓練中心, 網管人網站電子報, 新電子科技雜誌, 新電子/新通訊/網管人雜誌, 安聯人壽, TrendAI™, PTC, 地政整合資訊服務共享協作平台, Noreplies

### 排除的主旨關鍵字
請假單_通知, 公告「, 個人日報, 表單匯總, 文件中心新文件, 內訓課程, 妥善率, 驗證碼, IDC機房, 免費報名, 出勤檢核, 104應徵履歷, 限定報名, 安全性快訊

### 保留的 EIP 通知（例外）
- 含「待簽」→ 保留
- 含「未打卡」→ 保留

---

## 八、專案 ID 對照表（供 EIP API 使用）

| 專案名稱 | project_id |
|---------|-----------|
| 桃園水情 | 1 |
| 觀測站 | 11 |
| 航空城 | 28 |
| 系統整合 | 25 |
| 水利署整合平台 | 9 |
| 桃園出流管制 | 3 |
| 南投雨水 | 13 |

注意：不做 email ↔ EIP 的強制關聯。各自獨立呈現。

---

## 九、注意事項

1. Outlook COM 只能在本機跑，不能遠端
2. EIP API 無認證，直接 POST 呼叫
3. HTML 報告不用 table，全部卡片式 div
4. 報告要 RWD 手機友善
5. EIP 工項要有可點擊連結
6. 管理摘要的「建議今日優先處理」放最前面
7. 每個段落都要有小總結 summary bar

---

## 十、Init Wizard（Weekly mode 首次跑、`review.yml` 不存在時）

當 weekly mode 觸發、找不到 `~/.claude/projects/{project_slug}/review.yml` 時，用 Discord 對話式問答建立設定：

**Wizard 流程**：

1. **Q1**：「這個專案要不要綁 LINE？」
   - 是 → 進 Q2
   - 否 → 寫 `line_sources: []` 存檔，跳過 LINE 區塊

2. **Q2**：「要綁哪幾個 LINE DB？貼 SQLite 檔絕對路徑（可一次多個用換行分隔）」
   - 預設候選列出已知路徑：`~/Desktop/CLAUDE COWORK/PROJECTS/LINE/.handover/handover.db`
   - 收到路徑後驗證：開啟 DB → 確認有 `chat_msg_cache` 表
   - 失敗 → 報錯重問

3. **Q3**（每個 DB 各問一次）：「這個 DB 要看哪些群組？」
   - 先跑 `SELECT DISTINCT source_name FROM chat_msg_cache ORDER BY MAX(created_at) DESC` 列出該 DB 全部群組
   - 用 Discord 列出讓 Benson 回「全部 / 數字編號逗號分隔挑選 / 群組名稱換行貼」
   - 全部 → `groups: []`（空陣列）
   - 挑選 → `groups: [...]`

4. **寫檔**：`~/.claude/projects/{project_slug}/review.yml`

5. **確認**：把 yaml 內容貼給 Benson 看「設定如下，繼續跑 review 嗎？」

`project_slug` 取法：working_dir 路徑取代 `/` `\\` `:` 為 `-`，例：`C:\Users\benso\Desktop\CLAUDE COWORK\PROJECTS\LINE` → `C--Users-benso-Desktop-CLAUDE-COWORK-PROJECTS-LINE`（與 ~/.claude/projects/ 既有 slug 規則一致）。

**重設**：Benson 說「重設 review LINE 綁定」「重跑 review wizard」→ 刪 `review.yml` 後重跑 wizard。

---

## 十一、寫回 handover（Weekly mode 跑完互動）

報告產出 + Discord 推播後，**追問**：

> 「本週掃出 N 條紅色（M 條黃色）值得寫進 handover.db。要寫嗎？選擇：全部寫 / 挑編號寫 / 不用」

依回應：
- **全部寫** → 把所有🔴條目 INSERT 進 LINE 主專案 `.handover/handover.db` 的 `handover` 表
- **挑編號寫** → 列每條紅黃編號讓 Benson 回 `1,3,7` 之類，只 INSERT 選中的
- **不用** → 跳過

INSERT 規則（依條目來源類型對應 session_type）：
| 來源 | session_type | priority |
|---|---|---|
| 商務／報價 | `commitment` | high or urgent（依 due 緊迫度） |
| 會議追蹤無結論 | `blocker` | medium |
| 客戶催件 | `commitment` | high |
| @Benson inbox > 3 天 | `commitment` | medium |
| 已派未追 | `commitment` | medium |
| 自動推播未 close | `blocker` | low |

每筆寫入：
- `topic`：簡短一句描述（從訊息抓重點）
- `next_steps`：原訊息全文
- `due_date`：若訊息含明確日期，取出寫入；否則 NULL
- `created_at`：訊息原始時間（不是寫入時間）
- `extra_json`：`{"source_group": "...", "user": "...", "message_id": "..."}`

寫完跑 `UPDATE sync_state SET value=CURRENT_TIMESTAMP WHERE key='global.last_extraction_ts'`。

---

## 十二、實作細節

### `line_scan.py` 介面契約

```python
# 由 skill 流程呼叫
from line_scan import scan
result = scan(
    config_path='~/.claude/projects/{slug}/review.yml',
    days=7,  # 時間窗
)
# result schema:
# {
#   'business': [{...}, ...],     # 商務／報價
#   'meeting_followup': [...],    # 會議無結論
#   'customer_chase': [...],      # 客戶催件
#   'inbox_pending': [...],       # @Benson 未回
#   'auto_push_unclosed': [...],  # 自動推播未 close
#   'dispatched_untracked': [...], # 已派未追
#   'summary': {'red': N, 'yellow': N, 'green': N},
# }
# 每個 item: {'ts': '...', 'source_name': '...', 'user': '...', 'content': '...', 'priority': 'red|yellow|green'}
```
