# handover.db Schema 參考

> 位置：`{cwd}/.handover/handover.db`（或 `$EIP_LINE_DB`）
> 用途：本機 SQLite，存 LINE 訊息 cache + handover 訊號 + 同步檢查點
> 最後 schema 確認：2026-05-16

---

## 表清單

| 表 | 用途 | 筆數（snapshot） |
|---|---|---|
| `chat_msg_cache` | LINE 原始訊息本機 cache | 3,107（4/18 ~ 5/16） |
| `handover` | 訊號挖掘結果（決策/卡點/帳密/知識/承諾等） | 257 |
| `handover_fts` | handover 表的 FTS5 全文索引（中文搜尋用） | 257 |
| `sync_state` | 增量同步檢查點 + 各專案處理進度 | 23 |
| `file_activity` | Claude session 檔案異動 log | 101 |
| `config` | 雜項設定 | 1 |
| `handover_fts_*` | FTS5 內部表（不直接查） | - |

---

## `chat_msg_cache` — LINE 訊息本機 cache（主要查詢對象）

| 欄位 | 型別 | 說明 |
|---|---|---|
| `message_id` | TEXT PK | LINE 訊息唯一 ID |
| `user_id` | TEXT | 發訊者 LINE user ID（Uxxx） |
| `display_name` | TEXT | 發訊者顯示名稱 |
| `source_type` | TEXT | `group` / `room` / `user` |
| `source_id` | TEXT | LINE 群組/房間 ID（Cxxx）— **主鍵，永遠用這個** |
| `source_name` | TEXT | 群組名稱（會改名，僅供顯示） |
| `content` | TEXT | 文字內容；filetype != text 時為檔名 |
| `filetype` | TEXT | `text` / `image` / `video` / `audio` / `file` |
| `file_path` | TEXT | 下載 URL（filetype != text 時自動拼） |
| `created_at` | TEXT | 訊息建立時間 `YYYY-MM-DD HH:MM:SS` |
| `cached_at` | TIMESTAMP | 寫入本機 cache 的時間 |
| `extracted_to_handover` | INTEGER | 是否已挖訊號進 handover 表（0/1） |

### 常用查詢範例

```sql
-- 某群某段時間
SELECT created_at, display_name, content, filetype
FROM chat_msg_cache
WHERE source_id = 'Cxxx'
  AND created_at >= '2026-05-10'
  AND created_at <  '2026-05-17'
ORDER BY created_at ASC;

-- 跨群（依專案，需先打 list_groups.php?project_name= 取 source_ids）
SELECT created_at, source_name, display_name, content
FROM chat_msg_cache
WHERE source_id IN ('Cxxx','Cyyy','Czzz')
  AND created_at >= '2026-05-10'
ORDER BY created_at ASC;

-- @mention 我（{username} 換成使用者顯示名）
SELECT created_at, source_name, display_name, content
FROM chat_msg_cache
WHERE (content LIKE '%@{username}%' OR content LIKE '%＠{username}%')
  AND created_at >= datetime('now','-7 days')
ORDER BY created_at DESC;

-- 檔案訊息
SELECT created_at, source_name, display_name, filetype, content, file_path
FROM chat_msg_cache
WHERE filetype != 'text'
  AND source_id IN (...)
ORDER BY created_at DESC;

-- 群組訊息量 Top 10（某段期間）
SELECT source_name, COUNT(*)
FROM chat_msg_cache
WHERE created_at >= '2026-05-01'
GROUP BY source_id, source_name
ORDER BY 2 DESC
LIMIT 10;
```

---

## `handover` — 訊號挖掘結果

| 欄位 | 型別 | 說明 |
|---|---|---|
| `id` | INTEGER PK AI | |
| `topic` | TEXT NOT NULL | 主題（名詞片語 或 動詞片語） |
| `session_type` | TEXT | `decision` / `commitment` / `blocker` / `incident` / `credential` / `completed` / `knowledge` / `workflow` / `document` / `sdd` / `debug` / `discussion` / `admin` |
| `status` | TEXT | 一般訊號用 `open` / `in-progress` / `blocked` / `closed`（預設 `'open'`）；**`session_type='workflow'` 的 LINE-EIP rows 固定用 `'completed'`**（語意：「EIP 工項已建好且 `extra_json.eip_item_id` 必有值」），與一般訊號的「結案」是不同維度，查詢時記得分流 |
| `completed` | TEXT | 已完成項目（多行） |
| `decisions` | TEXT | 決定了什麼 |
| `blocked` | TEXT | 卡住什麼 |
| `next_steps` | TEXT | 下一步要做什麼 |
| `lessons_learned` | TEXT | 經驗教訓 |
| `attempted_approaches` | TEXT | 試過的方法 |
| `conversation_summary` | TEXT | 對話摘要 |
| `device` | TEXT | 哪台機器（desktop/laptop） |
| `branch` | TEXT | git branch |
| `working_dir` | TEXT | 工作目錄 |
| `test_status` | TEXT | 測試狀態 |
| `subscription_account` | TEXT | （帳密類訊號用） |
| `extra_json` | TEXT | 額外 JSON 結構 |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `priority` | TEXT | `critical` / `high` / `medium` / `low` |
| `due_date` | TEXT | 期限 |
| `related_ids` | TEXT | 關聯 id（逗號分隔） |
| `last_reviewed_at` | TIMESTAMP | |

### 常用查詢範例

```sql
-- 高優先 + 開啟中的承諾/卡點/事件
SELECT id, topic, session_type, priority, due_date, next_steps
FROM handover
WHERE session_type IN ('commitment','blocker','incident')
  AND status IN ('open','in-progress','blocked')
ORDER BY
  CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
  updated_at DESC
LIMIT 25;

-- 期限到了 / 過期的
SELECT id, topic, due_date, status, next_steps
FROM handover
WHERE due_date IS NOT NULL AND due_date != ''
  AND status IN ('open','in-progress','blocked')
  AND due_date <= date('now')
ORDER BY due_date ASC;

-- 最近 7 天更新的
SELECT id, session_type, topic, priority, status, updated_at
FROM handover
WHERE updated_at >= datetime('now','-7 days')
ORDER BY updated_at DESC
LIMIT 40;

-- 某專案的訊號（topic 或 summary 包含關鍵字）
SELECT id, session_type, topic, status, next_steps
FROM handover
WHERE topic LIKE '%{專案名}%'
   OR conversation_summary LIKE '%{專案名}%'
ORDER BY updated_at DESC;
```

### LINE-EIP rows 勾稽（`session_type='workflow'`）

這類 row 由 `eip-item-builder` 寫，固定 `status='completed'`，`extra_json` 內含：
- `eip_item_id` — 工項主鍵（**勾稽 EIP 用**）
- `source_fingerprint.msg_ids` — 原 LINE message_id 列表（**查重用**）
- `source_meta` — 群組 / 時間範圍 / 參與者
- `attachments[].path` — 已下載到本機的檔案路徑（反查時直接讀，不重打 download API）

**Idempotent 保證**：同一個 `eip_item_id` 只會有一筆 row（builder 寫入時 SELECT-then-UPDATE/INSERT）。

```sql
-- 查所有已建的 LINE-EIP 工項
SELECT id, topic,
       json_extract(extra_json, '$.eip_item_id') AS eip_id,
       json_extract(extra_json, '$.eip_project') AS project,
       json_extract(extra_json, '$.source')      AS source,
       priority, due_date, updated_at
FROM handover
WHERE session_type='workflow' AND topic LIKE '%-EIP:%'
ORDER BY updated_at DESC;

-- 反查：給 EIP item_id 找來源 row
SELECT id, topic, conversation_summary, extra_json
FROM handover
WHERE session_type='workflow'
  AND extra_json LIKE '%"eip_item_id": 1554%';

-- 查重：給一組候選 msg_ids，看哪些已建過工項
-- （Python 端做：撈所有 LINE-EIP rows → json.loads(extra_json) → 比對 msg_ids overlap）
SELECT id, topic, extra_json FROM handover
WHERE session_type='workflow' AND topic LIKE '%-EIP:%';
```

> ⚠️ SQLite `json_extract` 在 numeric value 上回 INTEGER，要比較字串時記得 cast。msg_ids 內部存的是字串（19 位 LINE message_id）。

---

## `handover_fts` — FTS5 全文索引

FTS5 虛擬表，**索引 handover 表這 7 欄**：
- `topic`, `completed`, `decisions`, `blocked`, `next_steps`, `lessons_learned`, `conversation_summary`

### 用法（解 LINE API 中文 2 字搜不到的 bug）

```sql
-- FTS5 中文搜尋（推薦給 handover 表用）
SELECT h.id, h.topic, h.session_type, h.next_steps
FROM handover h
JOIN handover_fts fts ON h.rowid = fts.rowid
WHERE handover_fts MATCH '{關鍵字1} OR {關鍵字2}'
ORDER BY rank;

-- 多關鍵字 AND
WHERE handover_fts MATCH '{專案名} AND {主題詞}'
```

⚠️ FTS5 是**索引 handover 表**，不是 chat_msg_cache。
chat_msg_cache 想做中文搜尋 → 用 `LIKE '%關鍵字%'`（小資料量 OK）。

---

## `sync_state` — 增量同步檢查點

key/value 表，**重點 keys：**

| key | 用途 |
|---|---|
| `global.last_extraction_ts` | 上次從 cache 挖訊號到哪個時間 |
| `global.last_session_date` | 上次開 session 的日期 |
| `global.last_handover_id` | 上次最大的 handover id |
| `global.total_entries` | handover 總筆數備忘 |
| `global.notes` | 全域註記 |
| `chat_sync.last_ts` | chat_msg_cache 最後同步到哪（後台 sync 寫的） |
| `project.{NAME}.extracted_through` | 各專案處理到哪天 |

### 範例

```sql
-- 看 cache 最後同步時間
SELECT value FROM sync_state WHERE key = 'chat_sync.last_ts';

-- 看上次挖訊號到哪
SELECT value FROM sync_state WHERE key = 'global.last_extraction_ts';

-- 看所有專案進度
SELECT key, value FROM sync_state WHERE key LIKE 'project.%';
```

---

## `file_activity` — Claude session 檔案異動 log

| 欄位 | 型別 | 說明 |
|---|---|---|
| `id` | INTEGER PK | |
| `ts` | TIMESTAMP | 時間 |
| `tool` | TEXT | `Write` / `Edit` / `NotebookEdit` 等 |
| `file_path` | TEXT | 絕對路徑 |
| `file_name` | TEXT | 檔名 |
| `extension` | TEXT | 副檔名 |
| `old_len` / `new_len` / `delta` | INTEGER | 字元數變化 |
| `session_id` | TEXT | Claude session ID |

通常**不需要查**，這是 hook 寫的，給後續分析用。

---

## 群組 → 專案對照（走 API，不再用本地 JSON）

打 `list_groups.php` 動態抓，response 範例見 SKILL.md 共用樣板。

```python
def project_to_source_ids(project_name: str) -> list[str]:
    rows = line_api("list_groups.php", project_name=project_name)
    return [r['source_id'] for r in rows if r.get('source_id')]
```

常用查詢：
- `?project_name={專案名}` — 該專案綁定的群
- `?status=bound` — 所有正常綁定的群
- `?include_unregistered=1` — 含 messages 有訊息但 line_groups 沒登記的群
- `?source_id=Cxxx` — 單群查詢

---

## 已知限制

1. **chat_msg_cache 範圍只到 `sync_state.chat_sync.last_ts`** — 更新的訊息要走 API
2. **list_groups.php 也是 snapshot**，新群剛綁定 / 改 project 後可能要等 server cache（通常無延遲）
3. **handover 表 FTS 中文搜尋 OK**；chat_msg_cache **沒** FTS，中文搜尋用 `LIKE`
4. **唯讀原則** — Skill 從不寫入此 DB，寫入由各專案自己的同步任務 / handover-skill 負責
