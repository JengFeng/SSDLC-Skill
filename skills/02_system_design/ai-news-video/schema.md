# ai-news-video — SQLite Schema

DB 位置（per-project，與 handover skill 共用）：

```
{PROJECT_DIR}/.handover/handover.db
```

對 ai-news-video 而言，PROJECT_DIR 就是 `C:\Users\benso\Desktop\CLAUDE COWORK\PROJECTS\ai-news-video\`。

所有本 skill 的表都加 `ainews_` 前綴，避免與 handover-skill 的 `sessions` / `sync_state` 等表衝突。
重建 / 補表的 idempotent script 在專案根目錄：`init_db.py`（純標準庫，無依賴）。

---

## 表結構速覽

| 表 | 用途 | 寫入時機 |
|---|---|---|
| `ainews_sources` | 來源清單 + 健康度 | 第一次 init / 新增來源 |
| `ainews_items` | 候選新聞池 | 每週抓取階段 |
| `ainews_scripts` | 產出的腳本 | 腳本生成完成時 |
| `ainews_script_picks` | 選中新聞 ↔ 腳本（含 my_take / prediction） | 每週選 3 則時 |
| `ainews_preferences` | 累積偏好（風格 / 用詞 / 取捨規則） | 使用者明示「以後都這樣」時 |
| `ainews_performance` | 影片發布後 KPI | 發布 24h / 7d / 30d 手動回填 |
| `ainews_fetch_log` | 抓取除錯 + 來源汰換依據 | 每次 fetch（不論成功與否） |
| `ainews_clusters` | **v2**：議題群（5-8 cluster／script，取代固定 3 picks） | cluster 階段 |
| `ainews_cluster_items` | **v2**：cluster ↔ items 多對多關聯 | cluster 階段 |

---

## DDL（與 `init_db.py` 同步）

### 1. `ainews_sources`

```sql
CREATE TABLE ainews_sources (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL UNIQUE,
    url             TEXT    NOT NULL,
    tier            INTEGER NOT NULL CHECK (tier IN (1, 2, 3)),
    fetch_strategy  TEXT    NOT NULL CHECK (fetch_strategy IN ('webfetch', 'search_first')),
    enabled         INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
    success_rate    REAL    NOT NULL DEFAULT 0.0,
    last_fetched_at TEXT,
    total_attempts  INTEGER NOT NULL DEFAULT 0,
    total_hits      INTEGER NOT NULL DEFAULT 0,
    notes           TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

- `tier`：1 = 必抓主流；2 = 選用補位；3 = 預留實驗
- `fetch_strategy`：
  - `webfetch` — 直連 URL 可抓
  - `search_first` — 直連會 403 或是 SPA，先用 WebSearch 找最新文章入口

### 2. `ainews_items`

```sql
CREATE TABLE ainews_items (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    week             TEXT    NOT NULL,                 -- '2026-W21'
    source_id        INTEGER NOT NULL REFERENCES ainews_sources(id),
    fetched_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    title            TEXT    NOT NULL,
    url              TEXT    NOT NULL UNIQUE,
    published_date   TEXT,
    summary          TEXT,
    importance_score INTEGER CHECK (importance_score BETWEEN 1 AND 5),
    category         TEXT CHECK (category IN (
        'model_release','acquisition','policy','tooling','research','business'
    )),
    status           TEXT NOT NULL DEFAULT 'candidate' CHECK (status IN (
        'candidate','selected','rejected','replaced'
    )),
    rejection_reason TEXT
);
```

- `week` 採 ISO 週：`YYYY-W##`（Python: `datetime.date.today().isocalendar()` → `f"{y}-W{w:02d}"`）
- `url` UNIQUE → 跨週去重免疑慮
- `status` 流轉：`candidate → selected / rejected / replaced`

### 3. `ainews_scripts`

```sql
CREATE TABLE ainews_scripts (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    week                  TEXT    NOT NULL UNIQUE,
    generated_at          TEXT    NOT NULL DEFAULT (datetime('now')),
    title_candidates      TEXT,    -- JSON array
    thumbnail_candidates  TEXT,    -- JSON array
    final_title           TEXT,
    word_count            INTEGER,
    duration_sec          INTEGER,
    file_path             TEXT,
    status                TEXT NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','approved','published')),
    youtube_url           TEXT,
    published_at          TEXT
);
```

- 一週一份腳本，`week` UNIQUE
- `title_candidates` / `thumbnail_candidates` 存 JSON，例 `'["標題A","標題B","標題C"]'`

### 4. `ainews_script_picks`（**最有復盤價值的表**）

```sql
CREATE TABLE ainews_script_picks (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    script_id         INTEGER NOT NULL REFERENCES ainews_scripts(id) ON DELETE CASCADE,
    news_item_id      INTEGER NOT NULL REFERENCES ainews_items(id),
    position          INTEGER NOT NULL CHECK (position BETWEEN 1 AND 3),
    my_take           TEXT,
    prediction        TEXT,
    verified_outcome  TEXT,
    verified_at       TEXT,
    UNIQUE (script_id, position)
);
```

- `position` 1/2/3 = 開場主菜 / 第二則 / 收尾
- `prediction`：當週寫下的預測（例：「Claude 4.7 應該會在月底上 API」）
- `verified_outcome` + `verified_at`：之後回填驗證結果 → 半年復盤靠這欄

### 5. `ainews_preferences`

```sql
CREATE TABLE ainews_preferences (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    reason      TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    hit_count   INTEGER NOT NULL DEFAULT 0
);
```

範例 key：`tone`、`avoid_term:AGI`、`prefer_category:tooling`、`opening_style`。

### 6. `ainews_performance`

```sql
CREATE TABLE ainews_performance (
    script_id              INTEGER PRIMARY KEY REFERENCES ainews_scripts(id) ON DELETE CASCADE,
    views_24h              INTEGER,
    views_7d               INTEGER,
    views_30d              INTEGER,
    ctr                    REAL,
    avg_view_duration_sec  INTEGER,
    top_comment_themes     TEXT
);
```

純手動回填。半年後可 JOIN `ainews_script_picks` 算「哪類 category × 哪類 my_take 風格」表現好。

### 7. `ainews_fetch_log`

```sql
CREATE TABLE ainews_fetch_log (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    ts               TEXT    NOT NULL DEFAULT (datetime('now')),
    source_id        INTEGER NOT NULL REFERENCES ainews_sources(id),
    strategy         TEXT,
    http_status      INTEGER,
    items_extracted  INTEGER,
    duration_ms      INTEGER,
    error_msg        TEXT
);
```

每次 fetch 都寫一筆。連續 4 週 `items_extracted = 0` 就該考慮汰換來源。

---

## 範例 SQL

### 抓取階段：列出本週要打的來源

```sql
SELECT id, name, url, fetch_strategy
FROM ainews_sources
WHERE enabled = 1 AND tier = 1
ORDER BY id;
```

### 寫入候選新聞（跨週去重靠 url UNIQUE）

```sql
INSERT OR IGNORE INTO ainews_items
    (week, source_id, title, url, published_date, summary, importance_score, category)
VALUES
    ('2026-W21', 1, 'Claude 4.7 Released', 'https://...', '2026-05-26',
     '官方 release note 摘要', 5, 'model_release');
```

### 選 3 則寫進腳本 picks

```sql
-- 先把選中的 items 標 selected
UPDATE ainews_items SET status = 'selected' WHERE id IN (?, ?, ?);

-- 落腳本
INSERT INTO ainews_scripts (week, title_candidates, thumbnail_candidates, word_count, duration_sec, file_path)
VALUES ('2026-W21', '["標題A","標題B","標題C"]', '["縮圖A","縮圖B"]', 1480, 600, 'scripts/2026-W21.md');

-- 落 picks（含個人觀點、預測）
INSERT INTO ainews_script_picks (script_id, news_item_id, position, my_take, prediction)
VALUES
  (last_insert_rowid(), 101, 1, '這次釋出最大亮點是…', '預期下週會有第三方 benchmark'),
  (last_insert_rowid(), 102, 2, '商業面影響在…',         '估這筆併購會延後到 Q3'),
  (last_insert_rowid(), 103, 3, '開源圈反應將是…',       'community fork 會在 2 週內出現');
```

### 來源健康度更新（每次 fetch 後）

```sql
UPDATE ainews_sources
SET total_attempts  = total_attempts + 1,
    total_hits      = total_hits + :hit,            -- 抓到就 +1
    success_rate    = CAST(total_hits + :hit AS REAL) / (total_attempts + 1),
    last_fetched_at = datetime('now')
WHERE id = :source_id;
```

### 復盤查詢：哪類 category 表現最好

```sql
SELECT
    i.category,
    COUNT(*)                AS picks,
    AVG(p.views_7d)         AS avg_views_7d,
    AVG(p.avg_view_duration_sec) AS avg_watch_sec
FROM ainews_script_picks sp
JOIN ainews_items   i ON i.id = sp.news_item_id
JOIN ainews_scripts s ON s.id = sp.script_id
JOIN ainews_performance p ON p.script_id = s.id
GROUP BY i.category
ORDER BY avg_views_7d DESC;
```

### 復盤查詢：我的預測命中率

```sql
SELECT
    SUM(CASE WHEN verified_outcome LIKE '對%' THEN 1 ELSE 0 END) AS hits,
    SUM(CASE WHEN verified_outcome LIKE '錯%' THEN 1 ELSE 0 END) AS misses,
    COUNT(verified_outcome)                                       AS verified_total
FROM ainews_script_picks
WHERE prediction IS NOT NULL;
```

### 來源汰換訊號：連續 4 週 0 命中

```sql
SELECT s.id, s.name,
       COUNT(*)                            AS attempts_last_4w,
       SUM(fl.items_extracted)             AS hits_last_4w
FROM ainews_fetch_log fl
JOIN ainews_sources s ON s.id = fl.source_id
WHERE fl.ts >= datetime('now', '-28 days')
GROUP BY s.id, s.name
HAVING hits_last_4w = 0
ORDER BY attempts_last_4w DESC;
```

---

## Python 連線範本

```python
import sqlite3
from pathlib import Path

DB = Path.cwd() / ".handover" / "handover.db"

def conn():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row          # 用欄位名取值
    c.execute("PRAGMA foreign_keys = ON")
    return c

with conn() as c:
    rows = c.execute(
        "SELECT id, name, url, fetch_strategy "
        "FROM ainews_sources WHERE enabled = 1 AND tier = 1"
    ).fetchall()
    for r in rows:
        print(r["id"], r["name"], r["fetch_strategy"], r["url"])
```

---

## 重建與遷移

- 加新欄位 / 表 → 改 `init_db.py` 的 `SCHEMA` 列表，重跑即可（`CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS` 都安全）
- 改既有欄位型態 → SQLite 限制大，建議走「新表 → INSERT SELECT → DROP 舊表 → RENAME」流程，另寫一支 migration script，不要硬改 `init_db.py`
- 種子資料只在 `ainews_sources` 為空時 INSERT；若要強制重種，先 `DELETE FROM ainews_sources` 再跑

---

## v2 變更（2026-05-28 上線，對應 `migrate_v2.py`）

W22 跑完後依使用者回饋校準的 schema 變更，已透過 `python migrate_v2.py` 套用：

### 1. `ainews_items` 加兩欄（多軸評分）

```sql
ALTER TABLE ainews_items ADD COLUMN drama_score  INTEGER DEFAULT 0;  -- 1-5 戲劇性
ALTER TABLE ainews_items ADD COLUMN visual_score INTEGER DEFAULT 0;  -- 1-5 視覺潛力
```

選議題時不再只看 importance，三軸總分 → 戲劇性 / 視覺有料的 cluster 優先。

### 2. 新增 `ainews_clusters` + `ainews_cluster_items`（議題群結構）

```sql
CREATE TABLE ainews_clusters (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    script_id   INTEGER NOT NULL,
    position    INTEGER NOT NULL CHECK (position BETWEEN 1 AND 12),
    title       TEXT NOT NULL,        -- 「Anthropic 全面爆發」
    subtitle    TEXT,                  -- 「估值超 OpenAI ＋ Karpathy 加入」
    narrative   TEXT,                  -- 該議題群的串聯敘事
    created_at  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (script_id) REFERENCES ainews_scripts(id) ON DELETE CASCADE,
    UNIQUE (script_id, position)
);
CREATE TABLE ainews_cluster_items (
    cluster_id   INTEGER NOT NULL,
    news_item_id INTEGER NOT NULL,
    PRIMARY KEY (cluster_id, news_item_id),
    FOREIGN KEY (cluster_id) REFERENCES ainews_clusters(id) ON DELETE CASCADE,
    FOREIGN KEY (news_item_id) REFERENCES ainews_items(id) ON DELETE CASCADE
);
```

一個 script 含 5-8 個 cluster，每個 cluster 整合 3-8 則 candidate items。

### 3. `ainews_script_picks.position` CHECK 從 1-3 放寬到 1-12

原 schema 強制每 script 只能 3 picks。但本 skill 改成議題群結構後，picks 表退役為「主題代表新聞」用，仍保留以維持向後相容。CHECK 放寬後可支援未來把 picks 表完全廢掉或拆給 cluster。

### 範例 query

```sql
-- 撈某週的議題群結構
SELECT c.position, c.title, c.subtitle, COUNT(ci.news_item_id) AS n_items
FROM ainews_clusters c
JOIN ainews_scripts s ON s.id = c.script_id
LEFT JOIN ainews_cluster_items ci ON ci.cluster_id = c.id
WHERE s.week = '2026-W22'
GROUP BY c.id
ORDER BY c.position;

-- 三軸總分 top 候選（含未入 cluster 的，可當 Shorts 題目）
SELECT title, importance_score, drama_score, visual_score,
       (importance_score + drama_score + visual_score) AS total
FROM ainews_items
WHERE week = '2026-W22' AND status = 'candidate'
ORDER BY total DESC LIMIT 10;
```
