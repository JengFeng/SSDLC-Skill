# eip-line-radar — Skill 說明

給 **EIP 團隊成員共用**的 LINE 對話查詢與訊號挖掘 skill。任何 Claude Code session（不限 working dir）都能套同一套邏輯。

---

## 為什麼有這個 skill

EIP 的 LINE 子系統累積了：
- 本機 SQLite cache（每 30 分鐘自動同步 LINE → 數千則訊息）
- 訊號挖掘（決策 / 卡點 / 承諾 / 知識）
- handover_fts 中文全文索引（解 LINE API 中文 2 字搜不到的 bug）
- 一整套查詢工具

把整套策略結晶成 skill，到處能用，自動偵測 cache 是否在本機。

---

## 範圍（6 大功能）

| # | 功能 | 主要 SQL/工具 |
|---|---|---|
| 1 | **訊息查詢** | SQL on `chat_msg_cache` |
| 2 | **訊號挖掘** | SQL on `handover` + `handover_fts` |
| 3 | **同步狀態檢查** | 讀 `sync_state`（不寫入）|
| 4 | **月度 Digest** | SQL 自組 |
| 5 | **依專案下載** | `file_download_api.php` |
| 6 | **跨群 / 跨專案趨勢** | SQL aggregate |

---

## 三層查詢優先序

```
1. 觸發詞偵測（強制 API）
   「即時 / 撈一下 / 線上資訊 / api 資訊」
   → 直接走 line_messages_api.php

2. 自動偵測 SQLite cache
   {cwd}/.handover/handover.db 存在 → 走本機（快）
   不存在 → fallback API

3. 必須走 API 的特殊情境
   - 下載實體檔案（cache 沒檔案實體）
   - SQLite 路徑不存在
```

---

## 環境變數

| 變數 | 用途 | 預設 | 必要 |
|---|---|---|---|
| `EIP_LINE_DB` | SQLite DB 絕對路徑 | `{cwd}/.handover/handover.db` | 否 |
| `LINE_API_BASE` | LINE API base URL | `https://your-server.example.com/EIP/LINE/api/` | 否 |
| `LINE_DL_API_KEY` | 下載 API 認證 key | （無，下載功能停用） | 下載時必要 |

API key 需要的話，去問 EIP 管理員拿。

---

## 檔案

```
~/.claude/skills/eip-line-radar/
├── SKILL.md                          ← 主入口（Claude 讀）
├── README.md                         ← 本檔（人讀）
└── schemas/
    └── handover_db_schema.md         ← 表結構 + SQL 範例完整版
```

---

## 跨機器使用

**有 SQLite cache 的機器：** ✅ 全功能可用，SQLite 快路

**沒 cache 的機器：**
- ✅ 觸發詞「即時 / 撈一下 / 線上資訊」可用 → 走 API
- ✅ 沒觸發詞時 skill 偵測 SQLite 不存在 → 自動 fallback API
- ❌ 訊號挖掘 (功能 2)、digest (功能 4) 在沒 cache 的機器**功能受限**（需 handover 表）

換機器要全功能 = 把 `.handover/handover.db` 同步過去 + 設定自動同步任務。

---

## 驗收測試（Verification）

開**新的** Claude Code session 跑 6 題對應 6 大功能：

| # | 測試題 | 預期 |
|---|---|---|
| 1 | 「{專案名} 案最近 LINE 講什麼」 | SQL on chat_msg_cache，回覆標 "(cache @ ...)" |
| 2 | 「上週有什麼決策」 | SELECT FROM handover WHERE session_type='decision' |
| 3 | 「同步狀態怎樣」 | 讀 sync_state 報 cache last_ts |
| 4 | 「產 4 月 digest」 | SQL 自組 digest |
| 5 | 「下載 {專案名} 案的圖片」 | file_download_api.php（需 LINE_DL_API_KEY） |
| 6 | 「即時撈一下今天的 LINE」 | 強制 line_messages_api.php，回覆標 "(live @ ...)" |

跑通 6/6 = skill 完成。

---

## 注意事項

1. **唯讀** — Skill 從不寫入 handover.db。寫入由各專案自己的同步任務負責。
2. **嚴禁假性回沒有** — cache 找不到要主動說「cache 到 X 點，要更確定請說『即時』」。
3. **資料來源要明示** — 每次回覆標 `(cache @ ts)` / `(live @ ts)` / `(無本機 cache)`。
4. **群會改名 → 永遠用 source_id**，source_name 只給人類看。
5. **群組對照走 API（list_groups.php）** — 不再依賴本地 JSON snapshot。

---

## 風險 / 已知限制

1. **EIP API 改 schema 會壞 skill**：兩邊耦合。若 `chat_msg_cache` 加欄位、或 `list_groups.php` 改 response 格式，skill 內 SQL/解析要跟著改。
2. **chat_msg_cache 沒 FTS** — 中文搜尋用 `LIKE`（小資料量 OK，大量會慢）。改用 handover_fts MATCH 走 FTS5 中文搜尋。
3. **下載功能需 API Key**：`LINE_DL_API_KEY` 沒設就停用，提示使用者去拿 key。

---

## 相關文件 / Skill

| 資源 | 用途 |
|---|---|
| `~/.claude/LINE_API_REFERENCE.md` | LINE API 完整規格（API live fallback 用） |
| `~/.claude/skills/eip-item-builder/` | LINE 對話 → EIP 工項時呼叫 |
| `~/.claude/skills/handover-skill/` | 把對話挖成 handover row 時呼叫 |

---

## 維護

改動 SKILL.md / schemas 後不需要重啟 Claude Code — 下次觸發時自動載入。

升級 schema 對應步驟：
1. 確認新 schema
2. 更新 `schemas/handover_db_schema.md`
3. 檢查 SKILL.md 內 SQL 範例是否需跟著改
4. 改 README.md 風險段（若新增依賴）
