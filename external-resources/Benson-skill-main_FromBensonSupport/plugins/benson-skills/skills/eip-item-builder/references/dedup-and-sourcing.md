# 建檔前查重 + 來源溯源 / 防重複（完整機制）

> 何時讀：執行第二階段建檔的 Step 1.5（查重，mandatory）與後置記帳時。
> 摘要：建檔前雙路查重（Tier A 精準 msg_ids / Tier B name 模糊），任一命中就停下問使用者；建檔後 idempotent 記帳到 handover。

---

## Step 1.5｜建檔前查重（mandatory 全文）


**目的**：避免同一段 LINE 對話 / 同一個需求重複建工項。**任何來源**都要跑（LINE、Email、手動口頭交辦皆然）。

**兩路並查（任一命中就停下來問使用者）：**

```python
import sqlite3, json, os
from pathlib import Path

DB = os.environ.get("EIP_LINE_DB") or str(Path.cwd() / ".handover" / "handover.db")

# ===== Tier A：source_fingerprint 精準比對（上游有給 source_payload 時必跑）=====
def check_by_fingerprint(candidate_fp: dict) -> list:
    """回傳 [(handover_id, eip_item_id, topic, overlap_count), ...]"""
    if not candidate_fp or not candidate_fp.get('msg_ids'):
        return []
    cand_ids = set(str(x) for x in candidate_fp['msg_ids'])
    c = sqlite3.connect(DB); c.row_factory = sqlite3.Row
    try:
        rs = c.execute("""
            SELECT id, topic, extra_json FROM handover
            WHERE session_type='workflow' AND topic LIKE '%-EIP:%'
        """).fetchall()
    except sqlite3.OperationalError:
        return []  # 表還沒建
    hits = []
    for r in rs:
        try:
            meta = json.loads(r['extra_json'] or '{}')
        except json.JSONDecodeError:
            continue
        fp_ids = set(str(x) for x in (meta.get('source_fingerprint',{}).get('msg_ids') or []))
        overlap = cand_ids & fp_ids
        if overlap:
            hits.append((r['id'], meta.get('eip_item_id'), r['topic'], len(overlap)))
    c.close()
    return hits

# ===== Tier B：name + project 模糊比對（保底，每次都跑）=====
def check_by_name(item_name: str, project_id: str, days: int = 60) -> list:
    """打 EIP fetch_items API 撈同專案近 N 天工項，找名字相似的"""
    import httpx
    cli = httpx.Client(timeout=30, verify=False)
    r = cli.post("https://your-server.example.com/EIP/progress/api/items_api.php",
                 data={"action": "fetch", "project_id": str(project_id)}).json()
    items = r.get('data', []) or []
    # 簡單啟發：去掉常見 noise 後，name 4 字以上 substring 命中
    name_core = item_name.replace('【', '').replace('】', '').replace('系統', '').strip()
    hits = []
    for it in items:
        existing = (it.get('item_name','') or '')
        # 雙向 substring 比對（≥4 字）
        for chunk_len in (8, 6, 4):
            for i in range(len(name_core) - chunk_len + 1):
                chunk = name_core[i:i+chunk_len]
                if chunk in existing:
                    hits.append((it.get('id'), it.get('item_name'), it.get('status'), chunk))
                    break
            else:
                continue
            break
    return hits

# ===== 整合執行 =====
fp_hits = check_by_fingerprint(SOURCE_PAYLOAD.get('source_fingerprint') if SOURCE_PAYLOAD else None)
name_hits = check_by_name(ITEM_NAME, PROJECT_ID)

if fp_hits:
    # 精準命中 → 強制停下來
    msg = "🚨 來源 msg_ids 命中已存在的工項：\n"
    for ho_id, eip_id, topic, cnt in fp_hits:
        msg += f"  - handover #{ho_id} → EIP #{eip_id} ({cnt} 則重疊) {topic}\n"
    msg += "\n要繼續建新的？(Y) / 補資料到既有工項？(N) / 取消？(C)"
    raise DuplicateDetected(msg)

if name_hits:
    # 模糊命中 → 也要停（誤判率高，但寧可問）
    msg = f"⚠️ 同專案近 60 天有名字相似的工項：\n"
    for eip_id, name, status, chunk in name_hits[:5]:
        msg += f"  - EIP #{eip_id} [{status}] {name}  (命中片段：「{chunk}」)\n"
    msg += "\n是同一件事嗎？建新的(Y) / 補到既有(N) / 取消(C)"
    raise DuplicateDetected(msg)
```

**規則**：
- `fp_hits` 命中 → **絕對停**，由使用者決定（這是精準命中，極少誤判）
- `name_hits` 命中 → **也停**，但容許使用者說「不是同一件事」後繼續（誤判率高）
- 兩 tier 都沒命中 → 進 Step 1
- 完全沒 source_payload 也要跑 Tier B（純手動建檔也要保底）
- DB 不存在或表不存在 → 跳過查重（第一次跑、新專案），但要在對話告訴使用者「無 handover 可比對」

---

## 來源溯源 + 防重複（通用機制）

**🚨 強制規則：每次 `create_item` 成功後，都要寫一筆 handover row 記錄來源。每次 `create_item` 之前，都要查 handover 比對來源指紋避免重複。** 不分上游是 LINE、Email、手動、口頭討論——一律照做。

### 標準 handover row 格式

寫入 `{cwd}/.handover/handover.db`（或 `EIP_LINE_DB` 指定路徑）的 `handover` 表。

**真實 schema（handover-skill v2，2026-05-16 對齊後）：**

| 欄位 | 用途 |
|---|---|
| `session_type` | 固定填 `workflow` |
| `topic` | `{Source}-EIP: {工項標題}` — 例：`LINE-EIP: 路淹站水位計測試`、`Email-EIP: ...`、`Manual-EIP: ...` |
| `status` | 固定填 `completed` |
| `conversation_summary` | 一句話摘要（list 顯示用）|
| `extra_json` | **JSON 字串**，存完整 source payload（schema 見下方）|
| `priority` | 對齊工項優先：`高` / `中` / `低` |
| `due_date` | 工項死線（沒就 `''`）|
| `related_ids` | 可選，串相關 EIP item_id |
| `created_at` / `updated_at` | `datetime('now')` |

> ⚠️ **handover 表沒有 `body` 欄位**！舊版文件曾寫 `body=YAML`，那是錯的。真實 schema 用 `conversation_summary` (摘要) + `extra_json` (JSON payload) 分開存。

**`extra_json` 內容 schema（JSON 字串）：**

```json
{
  "eip_item_id": 12345,
  "eip_project": "桃園水情",
  "source": "line",
  "source_fingerprint": {
    "msg_ids": ["613457", "613458"]
  },
  "source_meta": {
    "source_id": "Cxxx",
    "source_name": "群名",
    "msg_time_range": ["2026-05-12 09:26:00", "2026-05-12 17:29:00"],
    "participants": ["蘇小B", "劉俊毅"]
  },
  "attachments": [
    {"path": "C:/.../downloads/...", "filetype": "image"}
  ],
  "created_at": "2026-05-16T12:00:00"
}
```

依 `source` 不同的 fingerprint：
- `source=line`：`{"msg_ids": [...]}`
- `source=email`：`{"message_id": "<xxx@mail.gmail.com>"}`
- `source=manual`：`null`（手動建檔不防重複）
- `source=other`：自訂 key

### 前置查重 SOP（Step 1 之前必跑）

呼叫端（如 eip-line-radar）若有傳 `source_fingerprint`：

```python
import sqlite3, json, os
from pathlib import Path

DB = os.environ.get("EIP_LINE_DB") or str(Path.cwd() / ".handover" / "handover.db")
c = sqlite3.connect(DB); c.row_factory = sqlite3.Row

rows = c.execute("""
  SELECT id, topic, extra_json FROM handover
  WHERE session_type='workflow' AND topic LIKE '%-EIP:%'
""").fetchall()

candidate_fp = {'msg_ids': ['613457', '613458']}   # 上游傳入
for r in rows:
    try:
        meta = json.loads(r['extra_json'] or '{}')
    except json.JSONDecodeError:
        continue
    existing_fp = meta.get('source_fingerprint') or {}
    if existing_fp.get('msg_ids'):
        overlap = set(str(x) for x in candidate_fp.get('msg_ids', [])) & \
                  set(str(x) for x in existing_fp['msg_ids'])
        if overlap:
            print(f"⚠️ 來源 {overlap} 已開過 EIP #{meta['eip_item_id']}")
            # 停下來問使用者：追加 / 仍新開 / 取消
```

**手動建檔（source=manual）跳過查重**——使用者明確指示開新工項就直接開。

### 後置記帳 SOP（Step 8 之後 / 整個 SOP 結尾必跑）

**🚨 Idempotent 規則**：同 `eip_item_id` 只能有一筆 handover row。先 SELECT 看有沒有，**有就 UPDATE 補上 source 資訊**（手動補關聯場景），**沒才 INSERT**。

```python
import json, sqlite3
extra = {
    'eip_item_id': item_id,
    'eip_project': project_name,
    'source': source_type,                # 'line' / 'email' / 'manual' / ...
    'source_fingerprint': fingerprint,
    'source_meta': source_meta,
    'attachments': attachments_list,
    'created_at': now_iso,
}
topic = f"{source_type.upper()}-EIP: {item_name}"
extra_json_str = json.dumps(extra, ensure_ascii=False)

try:
    # 1. 查同 eip_item_id 是否已有 row（用 LIKE 搜 extra_json，避免漏判）
    existing = c.execute("""
        SELECT id FROM handover
        WHERE session_type='workflow'
          AND topic LIKE '%-EIP:%'
          AND extra_json LIKE ?
    """, (f'%"eip_item_id": {item_id}%',)).fetchone()

    if existing:
        # 2a. 已有 → UPDATE 補資料（覆蓋舊的 extra_json，因為 source 可能變新更完整）
        ho_id = existing[0]
        c.execute("""
            UPDATE handover
            SET topic=?, conversation_summary=?, extra_json=?,
                priority=?, due_date=?, status='completed',
                updated_at=datetime('now')
            WHERE id=?
        """, (topic, summary_one_liner, extra_json_str,
              priority, due_date or '', ho_id))
        c.commit()
        print(f"handover row UPDATED: id={ho_id} (補資料到既有 row)")
    else:
        # 2b. 沒有 → INSERT 新 row
        c.execute("""
            INSERT INTO handover (
                session_type, topic, status, conversation_summary,
                extra_json, priority, due_date,
                created_at, updated_at
            ) VALUES (
                'workflow', ?, 'completed', ?, ?, ?, ?,
                datetime('now'), datetime('now')
            )
        """, (topic, summary_one_liner, extra_json_str,
              priority, due_date or ''))
        c.commit()
        ho_id = c.execute("SELECT last_insert_rowid()").fetchone()[0]
        print(f"handover row INSERTED: id={ho_id}")
except Exception as e:
    print(f"⚠️ handover 寫入失敗: {e}")
    # 不要靜默吞掉，提示使用者手動補登
```

**為什麼用 LIKE 搜 extra_json 而非加新欄位？**
- 加 `eip_item_id` 為 first-class 欄位要 migration（影響現有 257 筆 handover row）
- LIKE 比對 `"eip_item_id": NNN` 字串模式夠精準（JSON dump 格式固定）
- 未來真有效能問題再加 index / column

> 寫入失敗（DB 鎖住、權限等）**不要靜默吞掉** → 提示使用者「工項建好了但溯源紀錄寫入失敗，請手動補登或檢查 DB」。

### 反查 SOP（給工項 ID → 找來源）

當使用者問「工項 #XXX 怎麼來的」「#YYY 是哪段對話開的」：

```sql
SELECT topic, conversation_summary, extra_json FROM handover
WHERE session_type='workflow'
  AND topic LIKE '%-EIP:%'
  AND extra_json LIKE '%"eip_item_id": 12345%';
```

依 `source` 分流：
- `source=line` → 把 `source_fingerprint.msg_ids` + `source_meta.msg_time_range` 餵給 **eip-line-radar** 撈原訊息 + 附檔
- `source=email` → 用 `source_fingerprint.message_id` 查信箱
- `source=manual` → 回「手動建檔，無對話來源；建檔備註：{source_meta.note}」
- 完全找不到 → 「handover 沒有溯源紀錄，可能是這個機制上線前建的工項，或繞過了 SOP」

### 上游 skill 對接約定

- **eip-line-radar** → 傳 `source=line` + `msg_ids` + `msg_time_range` + 群組資訊
- **未來 email skill** → 傳 `source=email` + `message_id` + thread/subject
- **使用者直接叫我建** → `source=manual` + 簡短 note（例：「Benson 口頭交辦」）
- 沒有任何上游 → 預設 `source=manual`，note 留空

---

