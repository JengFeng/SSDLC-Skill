---
name: eip-line-radar
description: |
  EIP LINE 雷達 + 訊號挖掘。封裝整套 LINE 對話查詢方法論（SQLite cache / handover 訊號挖掘 / 增量同步 / 月度 digest / 依專案下載 / 彙整工項候選），給 EIP 團隊成員共用。當使用者問「某群最近講什麼」「誰 @ 我」「XX 案在 LINE 怎麼討論」「上週有什麼決策」「最近卡點」「@誰承諾過 X」「撈某群檔案」「下載 OO 案的圖片」「產 4 月 digest」「最近狀況」「近期討論」「彙整工項」「整理工項」「上週有什麼可以建工項」等開放性問題、或需要查詢 / 摘要 / 訊號挖掘 / 彙整 LINE 對話為工項候選時自動啟用。預設先讀本機 SQLite (`{cwd}/.handover/handover.db`)，沒有或被觸發詞要求才打 LINE API。
---

# EIP LINE 雷達 SKILL (line-pulse)

> 給 EIP 團隊共用的 LINE 對話查詢 / 訊號挖掘技能。
> Schema 完整參考見同目錄 `schemas/handover_db_schema.md`，使用文件見 `README.md`。

---

## 環境依賴

### 本機 SQLite cache（主路）

skill **唯讀**讀取 handover-skill 標準位置的 SQLite：

```
{cwd}/.handover/handover.db
```

也可用環境變數覆寫（多專案共用同一份 DB 時）：
- `EIP_LINE_DB` — 指定 DB 絕對路徑

> 群組對照**不**再依賴本地 JSON，改打下方 `list_groups.php` API 動態抓。

### LINE API（fallback / live 模式）

- **Base URL**：`https://your-server.example.com/EIP/LINE/api/`（EIP 內部 NAS，可用環境變數 `LINE_API_BASE` 覆寫）
- **查詢 API**（撈訊息 / 列群組 / @mention）→ **免認證**
- **下載 API**（`file_download_api.php`）→ **需 API Key**
  - 從環境變數 `LINE_DL_API_KEY` 讀
  - 沒設 → 功能 5（下載）停用，提示使用者去問管理員拿 key

### 同步寫入（不在此 skill）

本 skill **唯讀**。SQLite 由各專案自己的同步任務維護（cron / Windows Task / 手動）。本 skill 不負責寫入、不負責排程。

---

## 三層查詢優先序（每個場景都套）

```python
import os
from pathlib import Path

DB = os.environ.get("EIP_LINE_DB") or str(Path.cwd() / ".handover" / "handover.db")

TRIGGER_WORDS = ["即時", "撈一下", "重新撈", "拉一下",
                 "線上資訊", "線上的", "線上查",
                 "打 API", "API 資訊"]

force_live      = any(w in user_query for w in TRIGGER_WORDS)
has_local_cache = os.path.exists(DB)

if force_live:                # ① 強制 live → API
    # 走 line_messages_api.php?advanced_query=1，回覆標 "(live @ HH:MM:SS)"
elif has_local_cache:         # ② 有 cache → SQLite
    # SQL on chat_msg_cache，回覆標 "(cache @ chat_sync.last_ts)"
else:                         # ③ 沒 cache → API
    # API 撈，回覆標 "(無本機 cache，走 API)"
```

**回覆一定要明示走哪條路**，使用者看得到資料新鮮度。

---

## 觸發時機（自動啟用 skill）

- 「某群最近講什麼」「XX 案在 LINE 怎麼討論」「客戶說什麼」
- 「誰 @ 我」「有沒有被找」「最近誰找我」
- 「最近狀況」「近期討論」「這週有什麼事」「上週重點」（開放性問題優先打這個 skill，再考慮工項系統）
- 「上週有什麼決策」「最近卡點」「@誰承諾過 X」（→ 走 handover 表訊號挖掘）
- 「撈某群檔案」「下載 OO 案的圖片」
- 「產 X 月 digest」「整理上個月 LINE 重點」
- 「彙整工項」「整理工項」「上週可以建什麼工項」「有什麼要建工項的」（→ 走**功能 7**，含預先去重）
- 任何要把 LINE 對話轉成工項 / 知識庫的請求（搭 `eip-item-builder`）

---

## 共用 Python 樣板（每個場景都會用到）

```python
import sqlite3, os, urllib.request, urllib.parse, json, ssl
from pathlib import Path

DB       = os.environ.get("EIP_LINE_DB") or str(Path.cwd() / ".handover" / "handover.db")
API_BASE = os.environ.get("LINE_API_BASE", "https://your-server.example.com/EIP/LINE/api/")
DL_KEY   = os.environ.get("LINE_DL_API_KEY")    # 沒設就是 None，下載功能停用

_ctx = ssl.create_default_context(); _ctx.check_hostname=False; _ctx.verify_mode=ssl.CERT_NONE

def connect():
    c = sqlite3.connect(DB)        # 唯讀使用，不 commit
    c.row_factory = sqlite3.Row
    return c

def line_api(endpoint, **params):
    """打 LINE API（查詢類免認證）"""
    url = f"{API_BASE.rstrip('/')}/{endpoint}?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=60, context=_ctx) as r:
        obj = json.load(r)
    return obj.get('data', obj) if isinstance(obj, dict) else obj

def project_to_source_ids(project_name: str) -> list[str]:
    """打 list_groups.php 動態抓專案綁定的 source_ids（取代舊的 group_project_map.json）"""
    rows = line_api("list_groups.php", project_name=project_name)
    return [r['source_id'] for r in rows if r.get('source_id')]

def cache_last_ts(c) -> str | None:
    row = c.execute("SELECT value FROM sync_state WHERE key='chat_sync.last_ts'").fetchone()
    return row[0] if row else None
```

---

## 6 大功能 SOP

### 功能 1｜訊息查詢（chat_msg_cache）

**情境：** 「某群 / 某案最近講什麼」「上週 OOO 講什麼」

**SOP：**
1. 解析使用者輸入：是「某群」還是「某案」？「最近」是多久（預設 7 天）？
2. 若是「某案」：`project_to_source_ids(name)` 打 list_groups.php 拿 source_ids
3. SQL on `chat_msg_cache`（範例見 `schemas/handover_db_schema.md`）
4. 過濾雜訊：純圖貼圖、單字回應、bot 通知
5. 整理 timeline + 摘要回覆

**範例 SQL（依專案最近 7 天）：**
```sql
SELECT created_at, source_name, display_name, content, filetype
FROM chat_msg_cache
WHERE source_id IN ('Cxxx','Cyyy',...)   -- from list_groups.php
  AND created_at >= datetime('now','-7 days')
ORDER BY created_at ASC
LIMIT 2000;
```

**範例回覆格式：**
```
📱 {專案名}｜過去 7 天｜共 N 則  (cache @ 2026-05-16 11:00)

🔑 重點：
- [客戶要求] xxx
- [內部討論] xxx

📌 待跟進：
- @{使用者} 被 @ N 次（最關鍵：xxx）

🗂 檔案：
- xxx.pdf (5/14)

—— 要最新狀態請說「即時撈一下」
```

---

### 功能 2｜訊號挖掘（handover 表）

**情境：** 「上週有什麼決策」「最近卡點」「@誰承諾過 X」「過期沒處理的事」

**這條路查 `handover` 表而非 `chat_msg_cache`** — handover 是已經被挖掘整理過的訊號（決策/卡點/承諾等）。

**SOP：**
1. 分辨 session_type：decision / commitment / blocker / incident / completed / knowledge / credential
2. SQL on `handover`（範例見 schema doc）
3. 若使用者問中文關鍵字：用 `handover_fts MATCH` 全文搜尋（解決 LIKE 慢的問題，並支援中文）
4. 整理輸出，標 (id / topic / status / priority / due_date / next_steps)

**範例 SQL（最近 7 天高優先 commitment/blocker/incident）：**
```sql
SELECT id, topic, session_type, priority, due_date, status, next_steps
FROM handover
WHERE session_type IN ('commitment','blocker','incident')
  AND status IN ('open','in-progress','blocked')
  AND updated_at >= datetime('now','-7 days')
ORDER BY
  CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
  updated_at DESC
LIMIT 25;
```

**範例 SQL（FTS5 中文搜尋）：**
```sql
SELECT h.id, h.topic, h.session_type, h.next_steps
FROM handover h
JOIN handover_fts fts ON h.rowid = fts.rowid
WHERE handover_fts MATCH '{關鍵字1} AND {關鍵字2}'
ORDER BY rank;
```

---

### 功能 3｜增量同步狀態（read-only）

**情境：** 「同步狀態」「cache 多新」「上次同步什麼時候」「該不該手動跑同步」

**這個 skill 不做寫入同步** — 寫入由各專案自己的同步任務負責。

**SOP：**
1. 讀 `sync_state.chat_sync.last_ts` → cache 新鮮度
2. 讀 `sync_state.global.last_extraction_ts` → 訊號挖掘進度
3. 計算「距現在多久」
4. 若 > 1 小時，提示使用者：
   - 自動同步可能停了，請檢查專案的 sync 任務
   - 或請使用者用「即時撈一下」打 API 拿最新資料

**回覆範例：**
```
🔄 同步狀態
- chat_msg_cache 最後同步：2026-05-16 11:00（22 分鐘前）✅
- 訊號挖掘到：2026-05-11 16:37（5 天前）⚠️ 需挖新訊號
```

---

### 功能 4｜月度 Digest

**情境：** 「產 4 月 digest」「整理上個月 LINE 重點」

**SOP：**
1. 確認月份（預設上個月）
2. 檢查 `{cwd}/.handover/digests/{YYYY-MM}.md` 是否已存在 → 存在直接讀
3. 不存在 → SQL 撈該月所有訊息 + handover 該月決策/承諾，整理成 7 區塊：
   - 概覽 / 關鍵決策 / 主要事件 / 完成里程碑 / 未解卡點 / 知識點 / 按專案

**Digest 範例 SQL：**
```sql
-- 該月各群訊息量
SELECT source_name, COUNT(*) c FROM chat_msg_cache
WHERE created_at >= '2026-04-01' AND created_at < '2026-05-01'
GROUP BY source_id ORDER BY c DESC;

-- 該月決策
SELECT id, topic, decisions, updated_at FROM handover
WHERE session_type='decision' AND updated_at >= '2026-04-01' AND updated_at < '2026-05-01';

-- 該月新卡點
SELECT id, topic, blocked, updated_at FROM handover
WHERE session_type IN ('blocker','incident') AND created_at >= '2026-04-01' AND created_at < '2026-05-01';
```

---

### 功能 5｜依專案下載檔案

**情境：** 「下載 XX 案的圖片」「撈 OO 案上週的附件到本機」

**前置：** 需設 `LINE_DL_API_KEY` 環境變數。沒設 → 提示使用者去問管理員拿 key，本功能停用。

**SOP：**
1. `project_to_source_ids(project_name)` 取 source_ids
2. SQL on `chat_msg_cache` 撈 `filetype != 'text'` 的訊息（時間範圍 optional）
3. 對每筆呼叫 `file_download_api.php?id=...&api_key={LINE_DL_API_KEY}`（下載 API **必須** 用實際 API，cache 沒檔案實體）
4. 存到 `{cwd}/downloads/{project_name}/{YYYY-MM}/{檔名}`

**範例 Python：**
```python
import urllib.request

def download_file(msg_id: int, save_path: str):
    if not DL_KEY:
        raise RuntimeError("LINE_DL_API_KEY 未設定，無法下載。請設環境變數後重試。")
    url = f"{API_BASE.rstrip('/')}/file_download_api.php?id={msg_id}&api_key={DL_KEY}"
    urllib.request.urlretrieve(url, save_path)
```

**已知陷阱：** `folder` + `file_name` 中文路徑會被 server 端 `sanitizeFolderName()` 砍 → 用 `?id=` 最穩。

---

### 功能 6｜跨群 / 跨專案趨勢分析

**情境：** 「最近三個月哪幾個案最熱」「跨群比較某主題的討論量」

**SOP：**
1. 確認時間範圍
2. SQL aggregate on `chat_msg_cache`（按 source_id / source_name / 月份分組）
3. 若要按專案分群 → 先打 list_groups.php 拿 source_id↔project_name 對照表，再 join 統計結果
4. 提醒使用者：cache 範圍受限於 `chat_sync.last_ts`，更舊資料可能不在 cache

**範例 SQL：**
```sql
SELECT strftime('%Y-%m', created_at) AS month,
       source_name,
       COUNT(*) AS msg_count
FROM chat_msg_cache
WHERE created_at >= datetime('now','-90 days')
GROUP BY month, source_id
ORDER BY month DESC, msg_count DESC;
```

---

### 功能 7｜彙整工項候選（含預先去重）

**情境：** 「彙整工項」「整理工項」「上週可以建什麼工項」「有什麼要建工項的」

**🚨 這個情境的觸發詞就是「彙整 / 整理 / 列候選」 — 跟「直接建一個工項」(鉤子 1) 是不同流程。彙整類請求進來就要主動跑去重，不能列完候選還等使用者問「哪些已經建了」。**

#### ★ Step 0｜範圍宣告（不可省略）

**彙整前**自動跑這段，讓使用者知道「skill 只看當前 cwd」。

```python
import os
from pathlib import Path

# 1. 對話來源 → project_names
groups = line_api("list_groups.php", status="bound")
src_to_proj = {g['source_id']: g.get('project_name','') for g in groups}
project_names = set(src_to_proj.get(sid,'') for sid in source_ids_in_conv if src_to_proj.get(sid))

# 2. 比對 cwd
cwd_base = os.path.basename(os.getcwd())
in_cwd  = [p for p in project_names if p and (p in cwd_base or cwd_base in p)]
out_cwd = [p for p in project_names if p not in in_cwd]

# 3. 強制回覆開頭加範圍宣告
declaration = f"""
📋 彙整範圍宣告
- 當前 cwd: {os.getcwd()}
- 查詢的 handover: {Path.cwd()/'.handover'/'handover.db'}
- 對話涉及專案: {project_names}
- ✅ 在 cwd 內: {in_cwd}  (這些會被查到)
- ⚠️ 在 cwd 外: {out_cwd}  (本次查不到，建議切到對應 cwd 重跑)
"""
print(declaration)  # 必須最先輸出，讓使用者看到掃描範圍
```

**規則**：
- 即使 `out_cwd` 為空也要宣告（讓使用者知道有檢查）
- `out_cwd` 非空 → 不擅自跨 db 掃，但要明確告訴使用者「該去哪查」
- 後續彙整結果若空，不要說「沒有」— 要說「當前 cwd 的 handover 沒有，可能在 {out_cwd} 專案 cwd 有」

#### ★ Step 1-4｜主流程

```
1. 撈對話 + 主題分群（沿用功能 1）
2. ★ 並行兩路查詢（同時跑，省時間）：
   a. handover 查重 — 只查當前 cwd 的 db ({cwd}/.handover/handover.db)
      → msg_id 精準比對
      → 不跨專案：handover.db 是專案本地的工作記憶，不偷看別專案
   b. fetch_items API — 拉「對話時段 ±7 天」工項
      → 最簡啟發式比對（topic 詞命中 ≥2 個 OR 描述含關鍵字）
3. 每個主題標四種狀態：
   - [未建]                       兩邊都沒
   - [已建 #1552 精準]            handover msg_id 命中
   - [疑似已建 #1234 孤兒]        fetch_items 命中 + handover 無紀錄
                                  ★ 順手問使用者：要補寫 handover 嗎？
   - [部分涵蓋 #999]              handover msg_id 重疊但不完整
4. 完整列出 — 不要替使用者排除已建的
   已建工項可能要「補新訊息進去 / 追進度 / 不動」，由使用者決定
```

#### 為什麼這樣設計（不要動）

| 設計 | 為什麼 |
|---|---|
| 只查 cwd 的 handover.db（不跨專案） | handover.db 是專案本地工作記憶，跨專案查違反隱私邊界。實務上 cwd 就在對應專案目錄，本地查就夠 |
| 並行兩路（不是只查一邊） | handover 精準但漏孤兒；fetch_items 涵蓋廣但模糊。雙源合併才完整 |
| 啟發式用最簡（不上語意） | handover 精準命中靠 msg_id，fetch_items 只補孤兒，沒必要重武器 |
| 漸進回填孤兒（不做一次性回填工具） | 每次彙整順手補一筆，零成本，未來涵蓋率自然變高 |
| 完整列出（不排除已建） | 已建工項可能要補資料 / 追進度，不是建完就結案 |

#### ⚠️ 跨專案查不到 ≠ 沒建

當前 cwd 是 `桃園水情/`，handover 找不到不代表別專案沒建過。如果使用者懷疑「之前在別專案建過」，請他切到對應 cwd 重跑，或人工去 EIP 確認。

skill **絕對不主動跨 cwd 掃別專案的 handover.db**。

#### 範例 Python — 並行兩路查詢

```python
import sqlite3, json, os, urllib.request, urllib.parse, ssl, concurrent.futures
from pathlib import Path

# 1. handover 查重（cwd 的 db，不跨專案）
HANDOVER_DB = os.environ.get("EIP_LINE_DB") or str(Path.cwd() / ".handover" / "handover.db")

def query_handover(candidate_msg_ids: set[str]) -> dict:
    """回傳 {msg_id: (handover_id, eip_item_id, topic)}"""
    c = sqlite3.connect(HANDOVER_DB); c.row_factory = sqlite3.Row
    rs = c.execute("""
        SELECT id, topic, extra_json FROM handover
        WHERE session_type='workflow' AND topic LIKE '%-EIP:%'
    """).fetchall()
    hit = {}
    for r in rs:
        try:
            meta = json.loads(r['extra_json'] or '{}')
        except json.JSONDecodeError:
            continue
        fp_ids = set(str(x) for x in (meta.get('source_fingerprint',{}).get('msg_ids') or []))
        overlap = candidate_msg_ids & fp_ids
        for mid in overlap:
            hit[mid] = (r['id'], meta.get('eip_item_id'), r['topic'])
    c.close()
    return hit

# 2. fetch_items API（啟發式比對）
EIP_BASE = "https://your-server.example.com/EIP"  # 正式站；如需切換用環境變數 EIP_BASE

def query_fetch_items(date_from: str, date_to: str, project_id: str = None) -> list:
    """打 EIP fetch_items API，回所有時段內工項"""
    # endpoint: POST /api/items_api.php action=fetch
    # 詳見 eip-item-builder/SKILL.md
    ...

def heuristic_match(item: dict, topic_keywords: list[str]) -> bool:
    """最簡啟發式：topic 詞命中 ≥2 個 OR description 含關鍵字"""
    text = (item.get('item_name','') + ' ' + item.get('description','')).lower()
    hits = sum(1 for kw in topic_keywords if kw.lower() in text)
    return hits >= 2

# 3. 並行
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:
    f_ho = ex.submit(query_handover, candidate_msg_ids)
    f_eip = ex.submit(query_fetch_items, date_from, date_to)
    handover_hits = f_ho.result()
    eip_items = f_eip.result()

# 4. 合併標狀態（每個主題逐個比對）
# ...
```

#### 漸進回填孤兒

當 fetch_items 找到 `[疑似已建 #1234 孤兒]`，順手詢問使用者：

```
⚠️ EIP #1234「易淹水點位 UI 改善」看起來涵蓋這段對話
   但 handover 沒紀錄（可能是手動建的 / 繞了 SOP）
   要不要補寫 handover row？這樣未來查重會更準。
   [是 / 否]
```

確認 → 切換 eip-item-builder 跑「後置記帳」SOP（給 eip_item_id + 重建 source_fingerprint + 補 source_meta）。

#### 範例回覆格式

```
📱 蘇小B｜上週 LINE 訊號彙整工項｜5/9–5/15
   handover 查重: 1 個 db, fetch_items: ±7 天 50 工項
   (live @ 2026-05-16 14:00)

—— 主題列表 ——

A. 【路淹站現地測試 5/15】  [未建] ⭐
   群：桃園現地綜合業務 | 50 則訊息 | timeline 完整
   建議：建工項保留 timeline 給反查

B. 【UI 改善包】  [已建 EIP #1553 精準命中 2 則]
   handover #263 | LINE-EIP: 易淹水點位控管系統 UI 改善包（俊毅）
   建議動作：若有新訊息要補進去，加到 #1553；否則不動

C. 【自主檢查表 API】  [已建 EIP #1552 精準命中 3 則] ⏰ 6/5
   handover #262 | 內容已完整，不動

D. 【某主題】  [疑似已建 EIP #1098 孤兒]
   fetch_items 啟發式命中：item_name 含「水情」「路淹」
   ⚠️ handover 無紀錄 — 要補寫嗎？

—— 統計 ——
- 已建：B, C（精準）
- 疑似已建：D（孤兒，建議補 handover）
- 未建：A
```

---

## 跨模組鉤子

### 鉤子 1｜LINE 對話 → 工項（含防重複 + 附檔 + 反查）

**🚨 強制規則：只要「LINE 對話 → EIP 工項」，下方四步全部都要做。** 即使使用者只說「開個工項」「丟到 EIP」「建檔」等簡短指令，也按完整流程走。

#### ⛓ handover.db 路徑（cwd-based，每專案獨立）

```
EIP_LINE_DB = {cwd}/.handover/handover.db    # 跟 handover-skill 預設一致
```

LINE→EIP 的 handover row **寫到當前 cwd 的 db**（每個專案目錄各自獨立）。

**為什麼這樣設計**：
- handover.db 是專案本地的工作記憶，**不該跨專案查**（隱私邊界）
- 實務上「在 `桃園水情/` 聊桃園水情對話 → 建桃園水情工項」cwd 就在對應專案目錄
- 工項紀錄自然跟著專案分流，未來反查 / 彙整也在同 cwd 操作

當使用者撈完一段 LINE 對話、說「幫我把這段建成工項」時，**整理 + 下載 + 餵料給 `eip-item-builder` skill**。

#### ★ Step 0｜環境檢查（不可省略）

**建工項前**自動跑這段，避免 handover row 寫到錯誤 cwd 導致未來查不到。

```python
import os
from pathlib import Path

# 1. 解析對話來源 → 拿 project_name
groups = line_api("list_groups.php", status="bound")
src_to_proj = {g['source_id']: g.get('project_name','') for g in groups}
project_names = set(src_to_proj.get(sid,'') for sid in source_ids_in_conv if src_to_proj.get(sid))

# 2. 比對 cwd basename
cwd_base = os.path.basename(os.getcwd())  # e.g. "桃園水情" / "技能測試區"

matched = [p for p in project_names if p and (p in cwd_base or cwd_base in p)]

# 3. 三種結果
if not project_names:
    # 對話的群沒登記 project_name，無法檢查 → 提示使用者確認
    warn = "⚠️ 對話來源群未綁定 project_name，無法自動驗證 cwd 是否正確"
elif matched:
    # cwd 符合對話來源專案 → 靜默通過
    pass
else:
    # cwd 跟對話來源專案不符 → 強制警告
    raise EnvironmentCheckFailed(
        f"⚠️ cwd 與對話來源不符\n"
        f"   對話來源專案: {project_names}\n"
        f"   當前 cwd:    {os.getcwd()}\n"
        f"   handover 會寫到 {Path.cwd()/'.handover'/'handover.db'}\n"
        f"   未來在 {project_names} 專案 cwd 彙整會查不到這筆紀錄\n\n"
        f"請選擇：\n"
        f"  (A) 切到對應專案 cwd 重跑（推薦）\n"
        f"  (B) 確認就要寫在當前 cwd（接受未來查不到）\n"
        f"  (C) 取消"
    )
```

**規則**：
- `matched` → 直接繼續
- 警告 → 必須等使用者選 A/B/C，**不允許 skill 自己決定**
- 選 A → 中止建檔，使用者去切 cwd
- 選 B → 繼續，但回覆要明示「已寫到 `{cwd}`，未來查重要在此 cwd」
- 選 C → 中止

**為什麼不擅自切**：cwd 換了會影響使用者其他正在做的事；切回去也麻煩。skill 只做檢查 + 警告，由使用者決策。

**LINE 端必做五步（後置記帳 / 反查由 eip-item-builder 統一負責；前置查重雙端把關）：**

```
1. 撈對話 timeline，收集所有 msg_id（chat_msg_cache.message_id，19 位數）
2. ★ 預先 msg_ids 查重（gate-1）：先在 line-pulse 內查 handover，命中就停下來問使用者，根本不要呼叫 builder
3. 整理成「前因 / 現況 / 後果 / 目標」四段敘事
4. ★ 下載附檔（必做）：對話中 filetype != 'text' 的訊息全部走 file_download_api.php 下載
5. 切換 eip-item-builder，**附上下列 source payload**（builder 會在 Step 1.5 再跑一次查重 gate-2 + Tier B 名稱模糊比對）
```

**為什麼兩端都查重（雙閘）：**
- gate-1 在 line-pulse：早期攔截，避免使用者已下載一堆附檔才發現重複（浪費 API quota）
- gate-2 在 builder：保底，即使有人不走 line-pulse 直接呼 builder 也擋得住
- 兩 gate 邏輯一致（都查 `source_fingerprint.msg_ids` overlap），不會誤判

#### ★ Step 2 細節｜預先 msg_ids 查重（gate-1）

```python
import sqlite3, json
from pathlib import Path

DB = os.environ.get("EIP_LINE_DB") or str(Path.cwd() / ".handover" / "handover.db")

# 從對話撈出的所有 message_id（19 位數字串）
candidate_mids = set(str(m['message_id']) for m in conv_msgs)

hits = []
try:
    c = sqlite3.connect(DB); c.row_factory = sqlite3.Row
    rs = c.execute("""
        SELECT id, topic, extra_json FROM handover
        WHERE session_type='workflow' AND topic LIKE '%-EIP:%'
    """).fetchall()
    for r in rs:
        try:
            meta = json.loads(r['extra_json'] or '{}')
        except json.JSONDecodeError:
            continue
        existing_mids = set(str(x) for x in (meta.get('source_fingerprint',{}).get('msg_ids') or []))
        overlap = candidate_mids & existing_mids
        if overlap:
            hits.append({
                'handover_id': r['id'],
                'eip_item_id': meta.get('eip_item_id'),
                'topic': r['topic'],
                'overlap_count': len(overlap),
                'overlap_ratio': len(overlap) / len(candidate_mids) if candidate_mids else 0,
            })
    c.close()
except sqlite3.OperationalError:
    pass  # handover 表還沒建

if hits:
    # 命中就停，問使用者
    print("🚨 這段對話已經建過 EIP 工項：")
    for h in hits:
        print(f"   handover #{h['handover_id']} → EIP #{h['eip_item_id']} "
              f"({h['overlap_count']} 則重疊, {h['overlap_ratio']:.0%} 涵蓋) {h['topic']}")
    print("\n選擇：")
    print("  (A) 看既有工項細節（撈出來 review）")
    print("  (B) 補新訊息到既有工項（不建新的）")
    print("  (C) 仍然建一個新工項（少見，例如分階段做）")
    print("  (D) 取消")
    # 等使用者答，未答之前不切 builder
```

**規則：**
- `overlap_ratio ≥ 30%` → 強烈傾向「同一件事」，建議選 B
- `overlap_ratio < 30%` 但仍命中 → 可能是延伸對話，建議選 C 但提醒原 #ID
- 完全沒命中 → 跳過此步直接進步驟 3

**傳給 eip-item-builder 的 source payload：**

```python
{
  'source': 'line',
  'source_fingerprint': {'msg_ids': [613457, 613458, 613459]},
  'source_meta': {
    'source_id': 'C0cf0f642bbdb60f1f46b2f513bd4d835',
    'source_name': '桃園現地綜合業務',
    'msg_time_range': ['2026-05-15 08:33:45', '2026-05-15 09:43:31'],
    'participants': ['蘇小B', '黃建龍', '陳大竹', '岱融'],
  },
  'attachments': [
    {'path': 'C:/.../downloads/eip_items/tmp/image_xxx.jpg', 'filetype': 'image'},
    ...
  ],
  'summary': '5/15 路淹站水位計現地測試指揮（BK 主導）',
}
```

eip-item-builder 拿到這份 payload 後：
- **建檔前**：用 `source_fingerprint.msg_ids` 查 handover 比對重疊 → 重複會擋下來問你
- **建檔後**：自動寫 handover row（topic：`LINE→EIP: {工項名}`）
- **未來反查**：給工項 ID 就能還原這段對話 + 附檔位置（見下方反查段）

#### ★ 步驟 4 細節｜附檔下載

對話中只要有 `filetype != 'text'`（image / file / video / audio，貼圖跳過）：

```python
import os, urllib.request
from pathlib import Path

DL_KEY = os.environ.get("LINE_DL_API_KEY")
if not DL_KEY:
    raise RuntimeError("LINE_DL_API_KEY 未設定，無法下載附檔。請設環境變數後重試。")

# 建檔前用 tmp 目錄；eip-item-builder 寫 handover 時改名為 item_{id}
save_dir = Path.cwd() / "downloads" / "eip_items" / "tmp_{timestamp}"
save_dir.mkdir(parents=True, exist_ok=True)

attachments = []
for m in conv_msgs:
    if m['filetype'] in ('text', 'sticker'):
        continue
    fname = m.get('file_name') or f"{m['filetype']}_{m['id']}"
    fpath = save_dir / fname
    url = f"{API_BASE}file_download_api.php?id={m['id']}&api_key={DL_KEY}"
    urllib.request.urlretrieve(url, fpath)
    attachments.append({'msg_id': m['id'], 'path': str(fpath), 'filetype': m['filetype']})
```

下載完的 `attachments` 帶進 eip-item-builder 的 source payload（→ 自動上傳成工項附件 + 路徑寫進 handover body）。

#### 反查｜給 EIP 工項 ID → 找原 LINE 對話

當使用者問「工項 #12345 怎麼來的」「#XXX 是哪段對話開的」：

1. **先呼叫 eip-item-builder 的反查 SOP** → 拿到 `source_meta.source_id` + `msg_time_range` + `source_fingerprint.msg_ids`
2. 若 `source != 'line'` → 走 eip-item-builder 的分流（Email / manual / …），不是本 skill 的事
3. 若 `source == 'line'` → 本 skill 接手撈原訊息：

```sql
-- 撈原訊息 + 前後文 ±5 分鐘
SELECT created_at, source_name, display_name, content, filetype
FROM chat_msg_cache
WHERE source_id = ?     -- from source_meta.source_id
  AND created_at BETWEEN datetime(?, '-5 minutes')
                     AND datetime(?, '+5 minutes')
ORDER BY created_at;
```

**回覆格式：**
```
📌 EIP #12345 來源（LINE）
- 群：桃園現地綜合業務
- 時間：2026-05-15 08:33 ~ 09:43
- 觸發訊息 N 則（+ 前後文 M 則）
- 參與者：蘇小B、黃建龍、陳大竹、岱融
- 完整對話：[逐則 timeline]
- 已下載附檔（直接從 handover.body.attachments 讀本機路徑，不重打 API）：
  - image_xxx.jpg → C:/.../downloads/eip_items/item_12345/image_xxx.jpg
  - 034-設施自主檢查表.docx → C:/.../downloads/eip_items/item_12345/034-設施自主檢查表.docx
```

> 反查時**不要重新下載**附檔 — 建檔當下已抓好存本機，直接讀 `body.attachments` 的 path。檔案不見了才補打 file_download_api.php。

### 鉤子 2｜訊號 → handover-skill

若使用者要把某段對話「挖成 handover row」（Mode B 知識/承諾/決策） → 交給 `handover-skill` 處理，不在本 skill 寫 handover 表。

---

## 嚴禁假性回「沒有」

**這條最重要：**

cache 找不到 ≠ 沒有。可能是：
- query 時段 > `sync_state.chat_sync.last_ts`（cache 不夠新）
- source_id 對錯（群改名了 / project 綁定改了 / list_groups 還沒同步）
- 關鍵字寫法不同（中文 LIKE 限制）

**正確流程：**
1. SQL 撈完發現空 → 報「cache 沒找到（cache 到 X 點）」
2. **明示**：「如果你要更確定，請說『即時撈一下』我打 API 確認」
3. **不要直接斷言「沒有」**

---

## 已知陷阱速查

| # | 陷阱 | Workaround |
|---|---|---|
| 1 | 中文 2 字詞 chat_msg_cache 用 LIKE 較慢 | 改用 handover_fts MATCH（FTS5 中文 OK） |
| 2 | LINE API `content_search` 中文 2 字搜不到 | 撈出來本機 Python `in` 過濾 |
| 3 | 群改名是常態 | **永遠用 source_id**，source_name 只給人類看 |
| 4 | chat_msg_cache 沒檔案實體 | 下載必須打 `file_download_api.php` |
| 5 | 下載中文檔名 | 用 `?id=` 不要用 `folder+file_name` |
| 6 | cache 範圍只到 chat_sync.last_ts | 超過此時間要 fallback API |
| 7 | list_groups.php 也是 snapshot | 新群剛綁要等 server 重新查詢，通常無延遲 |
| 8 | API live 回傳格式不一致 | 只有 `advanced_query=1` 有 envelope，其他純陣列 |
| 9 | skill 唯讀 DB | 不要 INSERT/UPDATE chat_msg_cache 或 handover（會跟同步任務衝突） |
| 10 | `LINE_DL_API_KEY` 沒設 | 下載功能停用，提示使用者去問管理員 |
| 11 | handover 欄位是 `extra_json` 不是 `body` | 舊文件曾寫 `body=YAML`，是錯的。schema v2 用 `conversation_summary` (摘要) + `extra_json` (JSON payload) |
| 12 | 查 LINE→EIP row 要用 `topic LIKE '%-EIP:%'` | 不要用 `LIKE '%LINE%'`。topic 格式是 `LINE-EIP: ...` / `Email-EIP: ...`，統一以 `-EIP:` 為 key |
| 13 | `source_fingerprint.msg_ids` 存的是 `message_id`（19 位數）不是 `chat_msg_cache.id`（流水號） | 跟 chat_msg_cache 比對前要先 join 看用哪個欄位。功能 7 比對時用 `message_id`（API 回傳的）|
| 14 | handover.db 是專案本地（cwd-based） | 不跨專案查、不跨專案寫。彙整 / 建工項請在對應專案目錄 (cwd) 操作 |

---

## API live fallback 參考（force_live 或 has_local_cache=False 時）

完整 LINE API 規格見 `~/.claude/LINE_API_REFERENCE.md`。最常用：

```python
# 某群最近
msgs = line_api("line_messages_api.php",
    advanced_query=1, source_id="Cxxx",
    date_from="2026-05-10", date_to="2026-05-17",
    order_by="created_at", order_direction="ASC", limit=2000)

# 多群（用 source_id 比 source_name 安全，名稱會變）
msgs = line_api("line_messages_api.php",
    advanced_query=1, source_ids="Cxxx,Cyyy",
    date_from="2026-05-10", limit=2000)

# @mention（單群限制）
ms = line_api("line_messages_mentions_api.php",
    source_name="{群名}", days=3, prefix="＠", match_mode="contains", limit=200)

# 列群組（取代 group_project_map.json）
groups = line_api("list_groups.php", project_name="{專案名}")
# 或：所有 bound 群組
groups = line_api("list_groups.php", status="bound")
# 或：含未登記（messages 有訊息但 line_groups 沒對應）
groups = line_api("list_groups.php", include_unregistered=1)
```

---

## 注意事項（務必記住）

1. **唯讀** — 從不 INSERT/UPDATE handover.db
2. **永遠用 source_id** — 群會改名
3. **回覆要明示資料來源** — `(cache @ ts)` / `(live @ ts)` / `(無本機 cache)`
4. **嚴禁假性回沒有** — cache 沒找到要說「cache 沒找到，要更確定請說即時」
5. **DB 路徑用環境變數或 cwd 慣例** — 不寫死絕對路徑
6. **下載必走 API + 需 API Key** — chat_msg_cache 沒檔案實體；key 沒設就停用
7. **同步寫入不在本 skill** — 寫入由各專案自己的同步任務負責
8. **彙整工項要主動跑去重** — 「彙整 / 整理 / 列候選」這類觸發詞進來，必走功能 7（並行查 handover + fetch_items），不能列完候選還等使用者問「哪些已建」
9. **完整列出已建工項**（含 EIP ID + topic）→ 不要替使用者排除，已建可能要補資料 / 追進度 / 不動，由使用者決定
10. **handover.db 不跨專案查** — 是專案本地的工作記憶，cwd 在哪就只查那個專案的 db。要查別專案請切 cwd

---

## 環境變數速查

| 變數 | 用途 | 預設 | 必要 |
|---|---|---|---|
| `EIP_LINE_DB` | SQLite DB 絕對路徑（**罕用**：debug 或臨時跨 cwd 操作才設） | `{cwd}/.handover/handover.db` | 否 |
| `LINE_API_BASE` | LINE API base URL | `https://your-server.example.com/EIP/LINE/api/` | 否 |
| `LINE_DL_API_KEY` | 下載 API 認證 key | （無，下載功能停用） | 下載時必要 |

> ⚠️ **handover.db 預設跟著 cwd 走**（每專案獨立）。功能 7 / 鉤子 1 / 反查都只看當前 cwd 的 db，**不跨專案掃描**（隱私邊界）。要查別專案請手動切 cwd。

---

## 參考文件

- 本檔 `SKILL.md` — 主入口、6 大功能 SOP
- 同目錄 `schemas/handover_db_schema.md` — 表 schema + SQL 範例完整版
- 同目錄 `README.md` — 架構說明 + 跨機器注意 + Verification
- 全域 `~/.claude/LINE_API_REFERENCE.md` — LINE API 完整規格
