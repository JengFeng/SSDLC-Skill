# EIP Progress MCP Server 詳細分析與遷移建議

> 來源：`C:\github\EIP\progress\mcp-server\server.py`（1776 行、65KB、25 個 tools）
> 分析日期：2026-04-24
> 目的：評估從「MCP 工具」遷移到「直接 API 呼叫」的可行性與方案

---

## 一、架構總覽

### 本質
```
MCP Server (server.py)  →  httpx.post / get  →  https://your-server.example.com/EIP/progress/api/*.php  →  MariaDB
```

MCP server 本身不持有業務邏輯，**就是一層 HTTP wrapper**。真正的系統在 PHP 後端。

### 關鍵事實
| 項目 | 內容 |
|------|------|
| 基礎 URL | `https://your-server.example.com/EIP/progress`（可用 env `BASE_URL` 覆寫） |
| 認證 | **無**（匿名 HTTP 即可呼叫，已驗證） |
| 請求格式 | POST: `application/x-www-form-urlencoded`（**不是 JSON body**），僅檔案上傳用 multipart |
| 回應格式 | 全部 JSON：`{"status": "success\|error\|warning", "data": ..., "message": ...}` |
| SSL | NAS 自簽憑證 → `verify=False` |
| 依賴 | `httpx`, `python-dotenv`, `mcp[fastmcp]` |

---

## 二、Endpoints 地圖（共 8 個 PHP）

| # | Endpoint | 方法 | Actions | 用途 |
|---|----------|------|---------|------|
| 1 | `/api/fetch_projects.php` | GET | — | 列專案 |
| 2 | `/api/users_api.php` | GET | — | 列成員 |
| 3 | `/api/items_api.php` | POST | `fetch`, `create`, `update`, `delete`, `updateTodoList` | 工項 CRUD |
| 4 | `/api/item_edit_api.php` | POST | `create`, `save`, `fetch` | 工項富文本 |
| 5 | `/api/upload.php` | POST(multipart) | `upload` | 檔案上傳 |
| 6 | `/api/project_members_api.php` | POST | `addMember`, `removeMember` | 工項指派成員 |
| 7 | `/api/item_tasks_api.php` | POST | `fetch`, `create`, `update`, `delete`, `reorder` | 任務分工 |
| 8 | `/api/project_api.php` | POST | `fetch_wiki`, `update_wiki`, `fetch_wiki_pages`, `fetch_wiki_page`, `create_wiki_page`, `update_wiki_page`, `delete_wiki_page` | 專案知識庫（舊 + 新） |

---

## 三、25 Tools 分類與 signature

### 3.1 查詢類（無副作用）
| Tool | Endpoint+action | 參數 |
|------|----------------|------|
| `list_projects` | GET fetch_projects | 無 |
| `list_members` | GET users_api | 無 |
| `fetch_items` | POST items_api action=fetch | project_id?, item_id?, status?(List), member_id? |
| `fetch_item_detail` | POST item_edit_api action=fetch | items_id |
| `get_todo_list` | POST items_api action=fetch + 解析 todo_list 欄位 | item_id |
| `fetch_item_tasks` | POST item_tasks_api action=fetch | item_id, status?, layer?, assignee?, priority?, sprint? |
| `fetch_project_wiki` | POST project_api action=fetch_wiki | project_id |
| `fetch_wiki_pages` | POST project_api action=fetch_wiki_pages | project_id |
| `fetch_wiki_page` | POST project_api action=fetch_wiki_page | page_id |
| `content_format_guide` / `get_content_format_guide` | 純本地字串，無 API 呼叫 | 無 |

### 3.2 工項建立/修改/刪除
| Tool | Endpoint+action | 特別欄位 |
|------|----------------|---------|
| `create_item` | POST items_api action=create | project_id, item_name, description, status, priority, item_type, start_date, end_date, member_id |
| `update_item` | POST items_api action=update | item_id(id), item_name, status, priority, start_date, end_date, description, phase（未傳值以空字串送出，API 保留原值） |
| `delete_item` | POST items_api action=delete | id |
| `update_item_content` | POST item_edit_api action=save | items_id, content, is_published, is_permanent, publish_start?, publish_end? |
| `update_todo_list` | POST items_api action=updateTodoList | id, description, `todos[i][name]` / `todos[i][completed]` / `todos[i][completed_sa]` |
| `upload_document` | POST upload.php (multipart) | item_id, document_type_id=1, file=(name, bytes, mime) |
| `add_item_member` | POST project_members_api action=addMember | item_id, user_id |
| `remove_item_member` | POST project_members_api action=removeMember | item_id, user_id |

### 3.3 任務分工（item_tasks）
| Tool | Endpoint+action | 特別欄位 |
|------|----------------|---------|
| `create_item_task` | POST item_tasks_api action=create | item_id, task_name, task_code="", layer, sub_category, sprint?, status, assignee, priority, depends_on, description, note, checklist(JSON str), link |
| `update_item_task` | POST item_tasks_api action=update | task_id(id) + 任何要改的欄位（**None=不傳、空字串=清除**） |
| `delete_item_task` | POST item_tasks_api action=delete | id |
| `reorder_item_tasks` | POST item_tasks_api action=reorder | `order[i][id]`, `order[i][sort_order]` |

### 3.4 知識庫（Wiki）
舊版（`projects.project_doc` 欄位）：
- `fetch_project_wiki` / `update_project_wiki` — 整頁 Editor.js JSON

新版（獨立 `project_wiki_pages` 表，樹狀）：
- `fetch_wiki_pages` / `fetch_wiki_page` / `create_wiki_page` / `update_wiki_page` / `delete_wiki_page`

新版 delete 支援 `recursive` 參數（True=連子孫、False=只本頁、子頁面變根頁面）

---

## 四、客戶端邏輯（MCP 層做的事，遷移後需轉移）

### 4.1 確認機制（非 API，而是 MCP wrapper 邏輯）
三個會動資料的 tool 有「兩段式確認」：
- `create_item` / `update_item_content` / `upload_document`
- `confirmed=False`（預設）→ 回傳預覽文字，**不打 API**
- `confirmed=True` + `confirm_note=非空` → 才真的打 API

遷移時可選：
- **(a) 保留**：helper CLI 也做 preview/confirm 兩段
- **(b) 移除**：直接由 Claude 在聊天室詢問使用者後執行（更簡潔）

### 4.2 檔案自動搜尋（upload_document）
若未提供 `file_path`，會依序搜尋：
```python
Path.home() / "Downloads"
Path.home() / "Desktop"
Path.home() / "Documents"
```
遷移時：helper CLI 可保留相同行為。

### 4.3 成員對照表（硬編碼，line 1010-1020）
```python
MEMBER_MAP = {
    "Benson": 1, "Rexyang": 2, "Nicklin": 3, "Derekliu": 4,
    "Louisliu": 5, "Genewu": 18, "Leo": 22, "Tinawu": 24, "Mileszhang": 25,
}
```
建議：**遷移後改用 `list_members` 動態查詢**（MCP server 裡 SKILL.md 已建議這樣做，但 `MEMBER_MAP` 還留著）

### 4.4 工項存在性驗證（_get_item_by_id）
`update_item_content` / `upload_document` 在執行前會先 fetch 確認工項存在。遷移時可保留此檢查。

### 4.5 自動建立 item_edit 記錄
`create_item` 成功後，會**自動再打一次** `item_edit_api action=create` 以建立富文本記錄（並取得 uuid 做公開連結）。遷移時要保留這個連動。

### 4.6 複雜表單編碼（非 JSON）
這兩個操作需要用 bracket 語法：
- **todos**: `todos[0][name]=xxx&todos[0][completed]=true&...`
- **reorder**: `order[0][id]=10&order[0][sort_order]=0&...`

httpx 的 `data=dict` 可直接處理這種 key，但要注意：`todos` **用 dict（不能用 tuple list）**（server.py 註解明確提到某些環境 tuple list 會 bytes 錯誤）。

---

## 五、回應格式規律

```jsonc
// 成功
{
  "status": "success",
  "data": [...] | {...} | null,
  "item_id": 1471,       // create_item 特有
  "message": "..."       // 偶爾有
}

// 失敗
{
  "status": "error",
  "message": "錯誤描述"
}

// update_item 有特殊狀態
{ "status": "warning", ... }  // 也視為成功
```

---

## 六、遷移策略（3 選 1）

### 🏆 方案 A：Python CLI helper（推薦）
結構：
```
~/.claude/skills/eip-item-builder/
├── SKILL.md                  # 改寫為「透過 Bash 呼叫 helper」
├── scripts/
│   ├── eip_api.py            # argparse CLI，subcommand 對應每 tool
│   ├── eip_common.py         # 共用 HTTP client、verify=False、response parse
│   └── batch.py              # 批次建立 items + tasks（依 JSON plan）
└── API_ANALYSIS.md           # 本文件（參考）
```

CLI 介面設計：
```bash
# 查詢類
python scripts/eip_api.py list-projects
python scripts/eip_api.py list-members
python scripts/eip_api.py fetch-items --project 9 --status 進行中
python scripts/eip_api.py fetch-item-tasks --item 1471

# 建立/修改
python scripts/eip_api.py create-item --project 9 --name "..." --priority 高
python scripts/eip_api.py update-item --id 1471 --status 進行中
python scripts/eip_api.py create-task --item 1471 --name "..." --layer "Layer 1" --sub A --sprint 1
python scripts/eip_api.py update-task --id 999 --status 已完成

# 批次（最重要，今天的用例）
python scripts/eip_api.py batch --plan batch_plan.json

# 內容 / 檔案
python scripts/eip_api.py save-content --item 1471 --html-file content.html
python scripts/eip_api.py upload --item 1471 --file C:\Users\benso\Desktop\xxx.pdf
```

**優點：**
- ✅ Session / 裝置無關：不綁 MCP 連線
- ✅ Debug 直接：curl 也能直接下
- ✅ 可手動使用：不透過 AI 也能跑批次
- ✅ 同機多 IDE 共用（VS Code、Cursor、Claude Code 都能呼叫）
- ✅ 相同程式碼，改用 `subprocess` 即可被其他 AI 接手

**缺點：**
- ❌ AI 看不到 tool schema（要靠 SKILL.md 描述）
- ❌ 透過 Bash string 組參數，有跳脫風險（中文、引號）→ 可用 `argparse` + `--from-json` 旗標緩解

### 方案 B：Bash / curl 直寫在 SKILL.md
把 curl 範本寫進 SKILL.md，Claude 每次依需求組 curl。

- ✅ 零依賴（無需裝 python 套件）
- ❌ 複雜參數（bracket、multipart、中文編碼）易出錯
- ❌ SKILL.md 膨脹，維護困難

### 方案 C：httpx 直寫（Claude 每次用 heredoc）
每次建立都寫 `python << 'EOF' ... EOF` 在 Bash 裡。

- ✅ 不用維護 CLI
- ❌ 每次 AI 都要重寫邏輯，易漂移
- ❌ 重複成本高

---

## 七、建議的 SKILL.md 新版骨架

```markdown
# EIP 工項建置 Skill（直接 API 版）

## 觸發時機
（維持原有觸發詞）

## 使用方式
所有操作透過 `scripts/eip_api.py` 執行：

### Step 1：確認專案
    python "<skill-path>/scripts/eip_api.py" list-projects

### Step 2：建立工項
    python "<skill-path>/scripts/eip_api.py" create-item \
      --project 9 --name "XXX" --priority 高 --start 2026-05-01 --end 2026-06-30

### Step 3：新增任務
    python "<skill-path>/scripts/eip_api.py" create-task \
      --item {item_id} --name "XXX" --layer "Layer 1" --sub A --sprint 1

### 批次建立（大量工項 + 任務）
    # batch_plan.json: {"items":[{"name":"...", "tasks":[...]}, ...]}
    python "<skill-path>/scripts/eip_api.py" batch --plan batch_plan.json

## 欄位對照
（保留原 Layer / 子分類 / sprint / 專案 ID / 成員 ID 表）

## 確認機制
每次動資料前，先以文字列出將執行內容，取得使用者「建立 / 確認」等語句後再執行。
（由 AI 在聊天室處理，不再依賴 MCP 的 confirmed 參數）
```

---

## 八、風險與 edge cases

| 風險 | 說明 | 對策 |
|------|------|------|
| API 無認證 | 任何能連到 NAS 的都能改工項 | 建議未來加 API Token / IP 白名單 |
| SSL 自簽 | verify=False 長期風險 | 若 NAS 日後換正式憑證，helper 也要更新 |
| 批次無 transaction | 中途失敗只能手動補償 | helper 支援 `--dry-run` 與 `--continue-on-error` |
| 中文 / 引號跳脫 | Bash 組參數時易壞 | 提供 `--from-json <file>` 支援，避開 shell 跳脫 |
| create_item 有連動 | 會自動建 item_edit | helper 依原流程連續呼叫兩個 API |
| update_item 空字串行為 | API 保留原值；但 update_item_task 空字串是「清除」 | helper 要分開處理，在 docstring 註記 |
| MEMBER_MAP 過時 | 硬編碼對照表可能不符實際 | helper 改為呼叫 list_members 動態解析 |
| httpx / dotenv 缺 | Python 環境未裝 | SKILL.md 檢查指令 `python -m pip install httpx` |

---

## 九、建議的執行步驟

1. 建 `scripts/eip_common.py`（共用 HTTP client / response parser）
2. 建 `scripts/eip_api.py`（25 subcommand，覆蓋所有 MCP tool）
3. 建 `scripts/batch.py`（批次建工項 + 任務；依 JSON plan）
4. 改寫 `SKILL.md`（拿掉 MCP 呼叫說明，替換為 CLI 範例）
5. 保留 `C:\github\EIP\progress\mcp-server\server.py` 當備援（**不刪除**）
6. 測試：跑一次 `list-projects` 與 `create-item`（沙盒工項）驗證
7. 全量遷移：更新 Claude Code 的 `.mcp.json` 可選，仍可保留 MCP 走雙軌

---

## 十、結論

這個 server.py 的 MCP 是非常薄的 wrapper，遷移到純 HTTP CLI 工作量低（約 500 行 Python 就能完整覆蓋 25 個 tool）。遷移後 skill 的彈性與可攜性大幅提高，而且可以搭配我今天寫的批次建立腳本，一個檔案就能做到所有事。
