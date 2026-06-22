---
name: eip-item-builder
description: |
  EIP 工項建置技能。當使用者聊系統需求、功能開發、Bug 修復、維護事項，或提到任何專案名稱時自動彙整工項草稿。當使用者說「加入工項」「建工項」「新增工項」「建任務」「分工」「知識庫」時，依 SOP **直接透過 HTTP API 呼叫 EIP**，完整建立工項、任務分工、代辦清單、富文本內容、檔案上傳、知識庫頁面等。
---

# EIP 工項建置 SKILL

> **架構**：此 skill 直接打 `https://your-server.example.com/EIP/progress/api/*.php`（form-encoded HTTP，無認證）。
> 任何 Claude session / 裝置都能用，**不需要任何伺服器在 session 連線**。
> 本檔只放「綱要 + 鐵則 + 導航」；細節章節拆在 `references/`，依需要再讀（見最下方導航表）。

---

## 觸發時機

以下任一情況自動啟用：
- 使用者聊系統需求、功能開發、Bug、維護、討論事項
- 提到任何專案名稱（桃園水情、觀測站、系統整合 等）
- 使用者說「加入工項」「建工項」「新增工項」
- 使用者說「建任務」「新增任務」「分工」「拆任務」「任務清單」「分工表」
- 使用者說「知識庫」「wiki」「新增頁面」「子頁面」「查知識庫」

---

## 🌐 API 基礎資訊

| 項目 | 內容 |
|------|------|
| BASE_URL | `https://your-server.example.com/EIP/progress` |
| 認證 | **無**（匿名 HTTP 可呼叫） |
| 請求格式 | POST: `application/x-www-form-urlencoded`（**非 JSON body**；僅 upload 用 multipart） |
| 回應格式 | JSON：`{"status": "success\|error\|warning", "data": ..., "message": ..., "item_id": ...}` |
| SSL | NAS 自簽憑證，需 `verify=False` |
| Python 依賴 | `httpx`（若無，先 `python -m pip install httpx`） |

**判讀成功：** `status == "success"`（`update_item` 的 `"warning"` 也算成功）

### 基本呼叫 pattern
```python
import httpx, json
BASE = "https://your-server.example.com/EIP/progress"
cli = httpx.Client(timeout=30, verify=False, follow_redirects=True)

r = cli.get(f"{BASE}/api/fetch_projects.php").json()                    # GET
r = cli.post(f"{BASE}/api/items_api.php",                               # POST (form-encoded)
             data={"action": "create", "project_id": "9", "item_name": "XXX"}).json()
```
> 端到端建檔（多步驟 heredoc）整支範本見 `references/build-workflow.md`。

---

## SOP：兩階段流程（工項建立）

> 🚨 **Step 順序**：**1 → 1.5 → 2 → 2.5 → 3 → 4 → 5 → 6 → 7 → 8 → 後置記帳**
> Step 1.5（查重）、Step 6（代辦/驗收清冊）、Step 8（verify）皆為 **mandatory，不可省略**。

### 第一階段：彙整預覽（每次聊完自動附在回覆末尾）

```
📋 工項摘要（草稿）
專案：xxx
名稱：xxx
優先級：高 / 中 / 低
日期：2026-xx-xx ～ 2026-xx-xx（無明確時間 → 結束日預設開始日+2週，見欄位規則）
成員：xxx（無明確指定則自動帶「Benson + 該專案預設管理員」，預設管理員動態查）
描述（前因 / 現況 / 後果 / 目標 — 工項要能獨立被讀懂，不依賴對話脈絡）：
  前因 / 現況 / 後果 / 目標
富文本（item_edit，複雜案件才展開）：背景 / 證據 / 修改範圍 / 驗收
代辦：- xxx（若有明確步驟）
任務分工：- L1-A: xxx（負責：xxx）（若有討論到子任務拆解）
```

### 第二階段：建立工項（等使用者說「加入工項」後才執行）

> **確認機制**：`create_item` / 寫富文本 / 上傳 三類動作執行前，**先在對話呈現預覽、待使用者確認再做**（直呼 API 無 `confirmed` flag，由對話層守門）。

#### Step 1｜確認專案
沒明確 project_id 就先 `GET /api/fetch_projects.php` 讓使用者確認。對照表見 `references/lookup-tables.md`。**不確定專案歸屬先問，不要猜。**

#### Step 1.5｜建檔前查重（🚨 mandatory）
雙路並查、任一命中就停下問使用者（建新 / 補既有 / 取消）：
- **Tier A**：`source_fingerprint.msg_ids` 精準比對（上游有給 source_payload 才跑）
- **Tier B**：`item_name + project_id` 模糊比對（保底，**每次都跑**，含純手動建檔）

> 完整程式碼（Tier A/B 函式 + 整合執行 + 規則）見 `references/dedup-and-sourcing.md`。

#### Step 2｜建立工項（`POST /api/items_api.php` action=create）
必填 `project_id` / `item_name`；建議 `description`（前因/現況/後果/目標四段，獨立可讀）。
- `status` 預設 `未開始`；`priority` 預設 `中`；`item_type` 預設 `臨時工項`
- `start_date` 預設今天；**`end_date` 沒提到死線 → 預設開始日 +2 週**（見欄位規則）
- `member_id` 預設 `get_default_member_id(project_id)`（Benson + 該專案預設管理員），多人逗號分隔
  - ⚠️ 此 helper 會打 **LINE 子系統的 `list_groups.php`（跟主 BASE_URL 不同網址）** 動態查該專案預設管理員；Tier 分流與查無 fallback（只掛 Benson）見 `references/lookup-tables.md`
- 🚨 **description 禁用 emoji**（4-byte UTF-8）：DB 是 utf8 非 utf8mb4，含 emoji **會回 success 但欄位存空字串（靜默資料遺失）**。改用 BMP 字元：`★ ▲ ● ◆ ※ → ⚠ ✔ ✘`
- 回應 `{"status":"success","item_id":N}` → **記下 item_id**

#### Step 2.5｜連動建 item_edit 殼（create_item 成功後立刻做）
```python
cli.post(f"{BASE}/api/item_edit_api.php", data={"action": "create", "items_id": str(item_id)})
```

#### Step 3｜指派成員（若有）
先 `GET /api/users_api.php` 取最新清單（**動態查比硬編碼準**），再 `POST /api/project_members_api.php` action=addMember（`item_id`, `user_id`）。
- 🚨 **查無暱稱不可硬幹**：某個被指派的人在 `users_api` + `lookup-tables.md` **兩邊都對不到 user_id** 時，**不要猜、不要默默略過、不要只掛 Benson 就建下去** → 停下來在對話列出「查無的暱稱」**回問使用者，由使用者指定實際要派給誰**（對到哪個 user_id），真的喬不定才先不指派。漏指派 = 派工派給空氣，使用者不會知道。

#### Step 4｜更新工項欄位（若需調整）
`POST /api/items_api.php` action=update，帶 `id` + 要改的欄位。
- 🚨 **未傳/空字串的欄位 = 保留原值**（與 task update 空字串=清除 **相反**！）

#### Step 5｜寫工項富文本內容（🚨 來源是對話/Email/會議 = 強制）
工項頁中間大編輯框 = `item_edit.content`，**沒寫 = 主畫面空白像草稿**。
- 先 `action=fetch` 讀現有 HTML 再改，寫入 `action=save`（欄位 `items_id`, `content`, `is_published`…）
- HTML 格式規範 + 最低結構範本見 `references/examples.md`
- 🚨 **content 同樣禁用 emoji**

#### Step 6｜代辦清單 / 驗收清冊 KPI（🚨 mandatory — 任何工項都要寫）
`POST /api/items_api.php` action=updateTodoList。**這是「驗收清單」，不是普通代辦。**
- 🚨 **別跟「任務分工不用」搞混**：使用者說「任務分工不用」是叫你跳過 `item_tasks_api`（L1-A1 開發拆分），**不是**跳過本 Step（`updateTodoList`）。兩個不同 endpoint。
- 最少 3 條；每條前綴 `(負責人)`；最後 1-2 項固定是「上線測試 / 整合 / 驗收簽收」
- description 寫「驗收清冊（KPI）— N 項全綠才結案」；顆粒度到「一句話可驗」
- 覆蓋式：改既有要先 `action=fetch` merge；bracket 語法 `todos[0][name]`，用 dict 送、`completed` 用字串 `"false"`
- 完整範例見 `references/examples.md` / `references/build-workflow.md`

#### 任務分工（item_tasks）｜可選分支（使用者要「拆任務 / 分工 / 任務清單」時才做）
這不是必跑 Step，但**只要使用者有要求拆分工就在這裡做**（需先有 item_id，故排在工項建好之後）。
- 迴圈 `POST /api/item_tasks_api.php` action=create；`task_code` 留空由系統自動產生
- 分層（Layer 0~S）、子分類、Sprint、批次建立、檢核清單 JSON → 全見 `references/tasks.md`
- 🚨 跟 Step 6「驗收清冊」(`updateTodoList`) 是**兩個不同 endpoint**，別互相取代
- 🚨 task update 的**空字串 = 清除欄位**（與 item update 相反）

#### Step 7｜上傳附檔（若有）
`POST /api/upload.php`（multipart）。沒給路徑時依序搜 Desktop / Downloads / Documents 比對檔名。

#### Step 8｜建檔後 verify（🚨 必跑，防靜默資料遺失）
建完一律 `fetch` 回 description / content 檢查長度（EIP API 有靜默失敗 bug，不 verify = 不知資料壞了）。range 見 `references/build-workflow.md` 的 verify 段。
**最後一定回傳連結：**
- 工項：`https://your-server.example.com/EIP/progress/itemdetail.php?id={item_id}`
- 分工表：`https://your-server.example.com/EIP/progress/item_tasks.php?item_id={item_id}`

#### 後置記帳（🚨 必跑，idempotent）
寫一筆 handover row 溯源；寫入前先查 `extra_json LIKE '%"eip_item_id": N%'` → 有就 UPDATE、沒才 INSERT（避免同工項兩筆）。詳見 `references/dedup-and-sourcing.md`。
> 🚨 handover 表**沒有 `body` 欄位**，用 `conversation_summary` + `extra_json`。

---

## 查詢工項常用篩選

`POST /api/items_api.php` action=fetch：

| 情境 | 參數 |
|------|------|
| 查某專案所有工項 | `project_id=X` |
| 查未完工 | `status=["未開始","進行中","待測試"]`（JSON 字串） |
| 查單一工項 | `id=X` |
| 查某成員工項 | `member_id=X` |
| 組合篩選 | `project_id=X`, `member_id=Y`, `status=[...]` |

**不支援 NOT IN**，要排除某狀態請列出其他狀態。

---

## 欄位判斷規則（工項）

| 欄位 | 判斷方式 |
|------|------|
| 工項名稱 | 萃取討論核心主題，精簡不超過 20 字 |
| **工項描述 description** | **必寫敘事式內文，「前因 / 現況 / 後果 / 目標」四段**，~300-600 字，獨立可讀（未來開卡的人不必回翻對話）。禁止只列 bullet 交差。複雜案件另用 item_edit 富文本展開（證據/log/修改範圍/驗收）。 |
| 專案 | 從討論內容推斷，對照 `references/lookup-tables.md` |
| 優先級 | 客戶要求/上線壓力/Bug → 高；一般功能 → 中；文件/雜項 → 低 |
| 狀態 | 預設「未開始」，可選：未開始 / 進行中 / 已完成 / 待測試 |
| 工項類型 item_type | 預設「臨時工項」 |
| 開始日期 | 預設今天 |
| 結束日期 | 有提到時間則填入；**否則預設「開始日 +2 週」**（不再留空，限期兩週內完成） |
| 負責人 | 預設 `get_default_member_id(project_id)`（Benson + 該專案預設管理員，動態查 line_groups） |

---

## 🚨 鐵則速查（最容易害死人的）

1. **查重 (1.5) / 驗收清冊 (6) / verify (8) 三個 mandatory**，無例外。
2. **emoji 禁用**（description / item_edit content）→ DB utf8 會靜默吃成空字串，改用 BMP 字元。
3. **「任務分工不用」≠「驗收清冊不用」** → 不同 endpoint，別跳錯 Step 6。
4. **空字串語意相反**：`update_item` 空=保留；`update_item_task` 空=清除。
5. **建完一定 verify + 回傳工項/分工表連結。**
6. **bracket 語法**（`todos[0][name]` / `order[0][id]`）用 Python dict 送，勿用 tuple list。
7. **不確定專案歸屬先問，不要猜**；指派成員先 `users_api` 動態查，**查無暱稱 → 回問使用者指定要派誰，別默默漏人**（見 Step 3）。
8. **缺套件**：`python -m pip install httpx`。

---

## 📂 導航表（細節在 references/）

| 何時讀 | 檔案 |
|--------|------|
| 跑端到端建檔（照範本改變數） | `references/build-workflow.md` |
| Step 1.5 查重程式碼 + 後置記帳溯源 | `references/dedup-and-sourcing.md` |
| 任務分工（item_tasks）SOP / Layer / 檢核清單 | `references/tasks.md` |
| 專案 ID / 成員 ID 對照表 + 預設管理員 helper | `references/lookup-tables.md` |
| 某 endpoint 的 request/response 欄位（快速查） | `references/api-reference.md` |
| HTML 富文本格式 + 批次建多工項範例 | `references/examples.md` |
| 知識庫 / wiki 操作 | `references/wiki.md` |
| 更深的 API 邊界條件 | `API_ANALYSIS.md`（根目錄） |
