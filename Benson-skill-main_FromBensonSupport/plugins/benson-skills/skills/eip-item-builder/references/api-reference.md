# 25 Tools 完整 API 規格（快速查）

> 何時讀：要查某個 endpoint 的 request/response 欄位。更深的邊界條件見根目錄 `API_ANALYSIS.md`。

## 🔧 25 Tools 完整 API 規格

下列函式名稱為邏輯代稱（便於對照功能），實際都是打對應的 PHP endpoint。

### A. 查詢類（無副作用）

#### 1. `list_projects` — 列出所有專案
- **endpoint**: `GET /api/fetch_projects.php`
- **參數**: 無
- **回應**: `{"data":[{"id","project_name","system_name",...}]}`

#### 2. `list_members` — 列出所有成員（動態查詢）
- **endpoint**: `GET /api/users_api.php`
- **參數**: 無
- **回應**: `{"data":[{"id","username",...}]}`
- **建議**：指派成員前一律先呼叫此 API

#### 3. `fetch_items` — 查詢工項（支援多條件篩選）
- **endpoint**: `POST /api/items_api.php` `action=fetch`
- **參數**:
  - `id` — 單筆查詢
  - `project_id` — 某專案
  - `status` — JSON 字串 `'["進行中","待測試"]'`
  - `member_id` — 某成員
- **回應**: `{"data":[工項陣列]}`

#### 6. `fetch_item_detail` — 讀取工項富文本內容
- **endpoint**: `POST /api/item_edit_api.php` `action=fetch`
- **參數**: `items_id`
- **回應**: `{"data":{"uuid","content","is_published","publish_start","publish_end"}}`

#### 8. `get_todo_list` — 讀取工項代辦清單
- **endpoint**: 同 fetch_items 單筆（`items_api action=fetch id=X`），從回傳資料中取 `todo_list` 欄位（JSON 字串）
- **解析**: `json.loads(item["todo_list"])` → `{"description","todos":[{"name","completed","completed_sa"}]}`

#### 14. `fetch_item_tasks` — 查詢工項任務分工清單
- **endpoint**: `POST /api/item_tasks_api.php` `action=fetch`
- **參數**:
  - `item_id`（必填）
  - `status`, `layer`, `assignee`, `priority`, `sprint`（選填篩選）
- **回應**: `{"data":[{"id","task_code","task_name","layer","sub_category","sprint","status","assignee","priority","depends_on","description","note","checklist","link",...}]}`

---

### B. 工項建立 / 修改 / 刪除

#### 4. `create_item` — 新增工項
- **endpoint**: `POST /api/items_api.php` `action=create`
- **參數**:
  - `project_id`（必填）
  - `item_name`（必填）
  - `description`, `status`, `priority`, `item_type`（預設 `臨時工項`）
  - `start_date`, `end_date`（YYYY-MM-DD）
  - `member_id`（預設用 `get_default_member_id(project_id)` 動態查，回 Benson + 該專案預設管理員；多人逗號分隔）
- **回應**: `{"status":"success", "item_id": N}`
- **⚠️ 後續連動**：建完立刻呼叫 `item_edit_api action=create items_id=N`（建富文本記錄，取得 uuid 做公開連結）

#### 10. `update_item` — 更新工項基本欄位
- **endpoint**: `POST /api/items_api.php` `action=update`
- **參數**: `id`, `item_name`, `status`, `priority`, `start_date`, `end_date`, `description`, `phase`
- **⚠️ 空字串 = 保留原值**（必要時可送空字串來刻意保持）
- **回應**: `status="success"` 或 `status="warning"` 皆視為成功

#### 11. `delete_item` — 軟刪除工項
- **endpoint**: `POST /api/items_api.php` `action=delete`
- **參數**: `id`
- 會把 `is_delete` 設為 `'yes'`，不真正從資料庫移除

#### 5. `update_item_content` — 寫入 / 更新工項富文本（item_edit）
- **endpoint**: `POST /api/item_edit_api.php` `action=save`
- **參數**:
  - `items_id`, `content`（HTML）
  - `is_published`（0/1）, `is_permanent`（0/1）
  - `publish_start`, `publish_end`（`YYYY-MM-DD HH:MM:SS`）
- **SOP**: 修改前先 `action=fetch` 讀回現有 HTML 再改，避免誤刪
- **⚠️ 確認機制**：AI 寫入前先在對話層與使用者確認

#### 9. `update_todo_list` — 新增 / 更新代辦清單（**覆蓋式**）
- **endpoint**: `POST /api/items_api.php` `action=updateTodoList`
- **參數**:
  - `id`（item_id）, `description`
  - `todos[0][name]`, `todos[0][completed]` (`"true"`/`"false"`), `todos[0][completed_sa]`
  - `todos[1][name]`, ...
- **⚠️ 覆蓋式**：新增前先 `get_todo_list` 取現有清單再 append
- **⚠️ 送法**：用 Python dict 單一 key（不能用 tuple list，某些環境會 bytes 錯）

#### 7. `upload_document` — 上傳檔案到工項
- **endpoint**: `POST /api/upload.php`（multipart）
- **form 欄位**: `action=upload`, `item_id`, `document_type_id=1`
- **files**: `file=(filename, bytes, mime_type)`
- **自動搜尋路徑**（若未提供絕對路徑）：
  1. `C:\Users\benso\Desktop\`
  2. `C:\Users\benso\Downloads\`
  3. `C:\Users\benso\Documents\`
- `document_name` 選填，預設用原始檔名
- 可多次呼叫上傳多個檔案
- **⚠️ 確認機制**：AI 上傳前先在對話層與使用者確認

#### 12. `add_item_member` — 指派成員到工項
- **endpoint**: `POST /api/project_members_api.php` `action=addMember`
- **參數**: `item_id`, `user_id`
- **SOP**: 指派前先 `list_members` 取最新清單

#### 13. `remove_item_member` — 從工項移除成員
- **endpoint**: `POST /api/project_members_api.php` `action=removeMember`
- **參數**: `item_id`, `user_id`

---

### C. 任務分工表（item_tasks）

#### 15. `create_item_task` — 新增任務
- **endpoint**: `POST /api/item_tasks_api.php` `action=create`
- **參數**:
  - `item_id`（必填）, `task_name`（預設 `新任務`）, `task_code=""`（系統自動產生）
  - `layer`（Layer 0~4 / Layer S）, `sub_category`（A~H）, `sprint`（數字）
  - `status`（預設 `待辦`）, `assignee`, `priority`
  - `depends_on`（任務代號逗號分隔如 `L1-A1,L2-B2`）
  - `description`, `note`, `checklist`（JSON 字串）, `link`
- **回應**: `{"status":"success", "data":{"id","task_code",...}}`

**task_code 自動產生規則**：
- 有 Layer + 子分類 → `L1-A1`, `L2-B3`
- 有 Layer 無子分類 → `L0-1`, `L3-2`
- 無 Layer → `T-001`, `T-002`

#### 16. `update_item_task` — 更新任務欄位
- **endpoint**: `POST /api/item_tasks_api.php` `action=update`
- **參數**: `id` + 任何要改的欄位
- **⚠️ 空字串 = 清除該欄位**（與 `update_item` 行為相反）
- 若不想動某欄位，**乾脆不傳**
- 改 `checklist` 前先 `fetch_item_tasks` 取現有 checklist

#### 17. `delete_item_task` — 軟刪除任務
- **endpoint**: `POST /api/item_tasks_api.php` `action=delete`
- **參數**: `id`

#### 18. `reorder_item_tasks` — 批次重新排序
- **endpoint**: `POST /api/item_tasks_api.php` `action=reorder`
- **bracket 語法**:
  - `order[0][id]=10`, `order[0][sort_order]=0`
  - `order[1][id]=11`, `order[1][sort_order]=1`, ...
- `sort_order` 0 起始，越小越前面

---

### D. 專案知識庫（Wiki） — 新舊版共存

#### 19. `fetch_project_wiki` — 讀取舊版知識庫內容（向下相容）
- **endpoint**: `POST /api/project_api.php` `action=fetch_wiki`
- **參數**: `project_id`
- **回應**: `{"data":{"project_name","project_doc"(Editor.js JSON 字串)}}`

#### 20. `update_project_wiki` — 更新舊版知識庫（向下相容）
- **endpoint**: `POST /api/project_api.php` `action=update_wiki`
- **參數**: `project_id`, `content`（Editor.js JSON 字串）

#### 21. `fetch_wiki_pages` — 取得專案知識庫頁面樹
- **endpoint**: `POST /api/project_api.php` `action=fetch_wiki_pages`
- **參數**: `project_id`
- **回應**: `{"data":[{"id","parent_id","title","sort_order",...}]}`

#### 22. `fetch_wiki_page` — 取得單一知識庫頁面內容
- **endpoint**: `POST /api/project_api.php` `action=fetch_wiki_page`
- **參數**: `page_id`
- **回應**: `{"data":{"title","content"(Editor.js JSON)}}`

#### 23. `create_wiki_page` — 新增知識庫頁面
- **endpoint**: `POST /api/project_api.php` `action=create_wiki_page`
- **參數**: `project_id`, `title`, `parent_id`（選填，無=根頁面）
- **回應**: `{"data":{"id": N}}`

#### 24. `update_wiki_page` — 更新知識庫頁面
- **endpoint**: `POST /api/project_api.php` `action=update_wiki_page`
- **參數**: `page_id`, `title`（選填）, `content`（選填，Editor.js JSON 字串）
- **至少傳一個** title 或 content

#### 25. `delete_wiki_page` — 刪除知識庫頁面
- **endpoint**: `POST /api/project_api.php` `action=delete_wiki_page`
- **參數**: `page_id`, `recursive`（`1`=連同子孫全刪、`0`=只刪此頁，子頁變根頁面）

---

