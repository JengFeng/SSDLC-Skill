# 四個資料源的撈法與規格（2026-06-13 POC 實測）

> 每個源「怎麼打、回什麼、有什麼坑」。坑都是 POC 真的踩過的，照抄別再踩。

---

## 1. 📗 EKB 筆記（既定事實 ✅）— 主力，漸進式第一段只打這個

- **Base**：`https://your-server.example.com/EIP/ekb`（env `EKB_BASE_URL`）
- **認證**：header `X-EKB-Token: $env:EKB_TOKEN`
- **列表**：`GET /api/notes.php?list=1&project_id={N}&q={關鍵字}&limit=100`
- **單篇**：`GET /api/notes.php?id={id}` → 含 `content`(HTML)、`content_text`(純文字，適合 regex)、`tags[]`
- **專案清單**：`GET /api/projects.php` → `{id,name}`

**⚠️ 坑（POC 踩過）：**
1. **回傳包兩層**：`{"status":"success","data":{"items":[...],"total":N}}` → 要取 `data.items`，不是 `data`。POC 第一版 unwrap 漏解一層，導致明明有資料卻撈到 0。
2. **`tags=` 參數無效**：列表的 tag 過濾被忽略，要按 tag 撈得繞 Notebook 或逐篇讀 `tags`。
3. **無時間範圍參數**：沒有 `created_from/to`，列表已回 `created_at/updated_at` → client 端自己篩、自己按 `created_at` 重排（預設近 `updated_at` 排序，舊筆記被編輯會插隊）。
4. **`project_id=N` 撈不到 → fallback `q={專案名}` 全文搜尋**。
5. 列表 item **不含 `tags`** 欄；`total` 實測為空，分頁靠 items 數量判斷。

**會議紀錄解析**（meeting-record 產的 note 慣例 HTML）：決議＝`<li><b>決議</b>…`、負責人＝同 ul 的 `<b>負責</b>`、待辦＝`<h2>★ 下次會議</h2>` 下「必交清單（依負責人）」`<ol>`。用詞會漂移（「必交清單」vs「近期必交」），regex 要寬鬆。

> helper 可直接 import：`meeting-record/scripts/ekb_publish.py`（已封裝 token header）。

---

## 2. 📋 EIP 工項（指派中 🔵）

- **Base**：`https://your-server.example.com/EIP/progress/api/`（免認證、**form-encoded**、自簽憑證 `verify=False` / curl `-k`）
- **撈工項**：`POST items_api.php`　data=`action=fetch&project_id={N}`
- **專案清單**：`GET fetch_projects.php`
- **欄位**：`id, item_name, description, status(未開始/進行中/已完成/待測試), end_date, actual_end_date, priority, item_type, project_members("id: 名字"字串), todo_list(JSON KPI), update_time`

**⚠️ 坑：**
1. **「逾期」非系統狀態**，自己算：`end_date < today AND status != '已完成'`（且 end_date 可能為空 → 判不了）。
2. status 篩選要傳 **JSON 字串**：`status=["未開始","進行中"]`；不支援 NOT IN。
3. 不帶 project_id 會回**全系統**工項（量大）。
4. `project_members` 是 `"1: Benson, 18: Genewu"` 字串，要自己 split parse。
5. 無 `updated_since`，看不出近期改了什麼欄位（只有單一 `update_time`）。

> helper 樣板見 `eip-item-builder/SKILL.md`（httpx verify=False, form-encoded）。

---

## 3. 💬 LINE / Outlook（討論中 ⚠️）— 標「未定案」

- **本機 SQLite**：`{cwd}/.handover/handover.db`，或中央庫 `PROJECTS\LINE\.handover\handover.db`（最全：333 訊號 + 7,286 訊息）
  - `chat_msg_cache`：原始訊息（created_at, display_name, source_id, source_name, content）
  - `handover` 表：已挖掘訊號（`session_type` in decision/blocker/commitment/incident），`extra_json` 含 `"project"` 標籤
- **群組對照**：`GET /EIP/LINE/api/list_groups.php?project_id={N}` → source_ids（與 EIP **同一套 project_id**）
- **live fallback**：`line_messages_api.php?advanced_query=1&source_ids=&date_from=`

**⚠️ 坑：**
1. **跨案污染**：關鍵字撈 `chat_msg_cache` 會撈到別案（撈「楊梅」會混到桃園水情/出流管制）→ 一定要用 `source_id`(該專案群組) 或 `extra_json.project` 過濾。
2. **訊號挖掘會落後**：看 `sync_state` 的 `global.last_extraction_ts` vs `chat_sync.last_ts`，落後時近幾天訊號還沒結構化 → 退回原始訊息現場看。
3. 中文 2 字 live FULLTEXT 搜不到 → 撈回本機 LIKE 過濾。
4. Outlook（email/行事曆）需本機 win32com，且無專案標記 → 暫列 v2，要做得靠每專案關鍵字。

> 整套方法已封裝在 `eip-line-radar`，本 skill 直接借它。

---

## 4. 📁 專案資料夾（研究中 🔬）

- 路徑：`C:\Users\benso\Desktop\CLAUDE COWORK\PROJECTS\{資料夾}\`
- 標準分類（file-organizer）：`系統開發/`、`待確認/`、`專案管理/`、`會議記錄/`
- 撈法：掃最近改動的檔（`Get-ChildItem -Recurse | Sort LastWriteTime`），給「最近動了什麼檔、有什麼草稿/POC」概況，不強求結構。

**⚠️ 坑：命名不一致** —— 邏輯專案名（桃園水情）≠ 資料夾名（可能是「115 整合平台」之類），無對照表，要人工對映或在 `project-mapping.md` 補。

---

## 5. 🤖 handover（AI 工作層，非內容源）

- `handover` 表 Mode A（交班：sdd/debug/discussion）+ Mode B（事實：decision/blocker/commitment/incident/knowledge…）
- 是 `LINE → handover → EKB` 的中間態（見 architecture.md 結晶比喻）
- 本 skill 用它當後台：記住這題查過什麼、跨 session 不重挖。**不對使用者呈現成「第五層」。**
