# 任務分工表（item_tasks）

> 何時讀：使用者要「建任務 / 分工 / 拆任務 / 任務清單」，或工項建立流程中要拆子任務時。
> 對應 endpoint：`POST /api/item_tasks_api.php`。注意這跟 Step 6「代辦清單 / 驗收清冊」(`updateTodoList`) 是**兩個不同 endpoint**，別搞混。

### 觸發時機
- 使用者在工項建立流程中提到子任務拆解
- 使用者直接說「建任務」「新增任務」「分工」「拆任務」
- 使用者說「幫我拆成任務」「列出要做的事」

### 第一階段：任務預覽（草稿）

當討論到任務拆解時，自動附在回覆末尾：

```
📋 任務分工表草稿（工項 ID: xxx）
┌─────────┬──────────────────┬─────────┬────────┬──────┬──────┐
│ 任務代號  │ 任務名稱          │ Layer   │ Sprint │ 負責  │ 優先  │
├─────────┼──────────────────┼─────────┼────────┼──────┼──────┤
│ L1-A1   │ 設計 API 架構     │ Layer 1 │ 1      │ xxx  │ 高   │
│ L1-A2   │ 實作登入 API      │ Layer 1 │ 1      │ xxx  │ 高   │
│ L2-A1   │ 業務流程設計       │ Layer 2 │ 2      │ xxx  │ 中   │
│ L4-A1   │ 前端頁面開發       │ Layer 4 │ 2      │ xxx  │ 中   │
└─────────┴──────────────────┴─────────┴────────┴──────┴──────┘
共 4 筆任務。確認後我會批次建立。
```

### 第二階段：批次建立（等使用者確認後執行）

1. **確認工項 ID**
   - 若從工項建立流程延續，用剛建好的 item_id
   - 若使用者指定了 item_id，直接用
   - 若不明確，先 call `items_api.php` action=fetch 查

2. **批次新增任務** — 迴圈 `POST /api/item_tasks_api.php` action=create
   - `task_code` 留空，由前端自動產生：
     - 有 Layer + 子分類 → `L1-A1`, `L2-B3`
     - 有 Layer 無子分類 → `L0-1`, `L3-2`
     - 無 Layer → `T-001`, `T-002`
   - 可選欄位：`layer`, `sub_category`, `sprint`, `status`, `assignee`, `priority`, `depends_on`, `description`, `note`, `checklist`, `link`

3. **回傳結果**
   ```
   ✅ 已建立 N 筆任務到工項 ID=xxx
   分工表連結：https://your-server.example.com/EIP/progress/item_tasks.php?item_id=xxx
   ```

### 任務管理操作

**查詢任務** — 使用者說「查任務」「看分工」「任務進度」
- `POST /api/item_tasks_api.php` action=fetch
- 篩選欄位：`item_id`（必填）, `status`, `layer`, `assignee`, `priority`, `sprint`

**更新任務** — 使用者說「改任務狀態」「更新任務」「任務完成了」
- `POST /api/item_tasks_api.php` action=update，帶 `id` + 要改的欄位
- **⚠️ 空字串 = 清除該欄位**（與 `update_item` 空字串=保留 相反！）
- 若要不動某欄，**乾脆不傳**

**刪除任務** — 使用者說「刪任務」「移除任務」
- `POST /api/item_tasks_api.php` action=delete，帶 `id`（軟刪除）

**重新排序** — 使用者說「調整順序」「重排任務」
- `POST /api/item_tasks_api.php` action=reorder
- bracket 語法：`order[0][id]=10`, `order[0][sort_order]=0`, ...

**更新檢核清單** — 使用者說「加檢核」「更新 checklist」
- 先 fetch 現有 checklist（在 item_tasks 回傳的資料裡）
- `update` action 傳入修改後的 `checklist`（JSON 字串）

---

## 任務欄位判斷規則

| 欄位 | 判斷方式 |
|------|------|
| task_name | 萃取任務核心描述，精簡不超過 30 字 |
| layer | 依任務性質分層（見下方 Layer 對照表） |
| sub_category | 同 Layer 內的功能分群（A~H），同類功能用同一字母 |
| sprint | 依開發順序分配，基礎設施先、上層功能後 |
| status | 預設「待辦」 |
| assignee | 依討論內容指派，可多人逗號分隔 |
| priority | 阻塞其他任務 → 高；一般 → 中；可延後 → 低 |
| depends_on | 若有前置任務，填入**任務代號**（如 L1-A1，逗號分隔，**不是任務 ID**） |
| description | 任務的詳細需求說明 |
| checklist | 若任務可再拆成檢核項目，用 JSON 格式 |

### Layer 對照表

| Layer | 定義 | 常見任務 |
|-------|------|---------|
| Layer 0 | 基礎建設 / 環境設定 | DB schema、伺服器設定、CI/CD、權限設定 |
| Layer 1 | 核心功能模組 | API 開發、核心邏輯、共用元件 |
| Layer 2 | 業務邏輯 / 流程 | 工作流程、審核流程、報表邏輯 |
| Layer 3 | 整合介接 | 第三方 API、資料同步、SSO |
| Layer 4 | 前端 UI / UX | 頁面開發、樣式設計、互動效果 |
| Layer S | 特殊 / 跨層級 | 跨模組整合、效能優化、安全性 |

### 子分類使用建議

同一 Layer 下，按功能模組分群：
- 例如 Layer 1 的 API 模組：
  - A = 使用者相關（登入、註冊、權限）
  - B = 資料 CRUD（工項、專案、文件）
  - C = 通知/推播
  - D = 報表/匯出
- 具體分法依專案需求彈性調整，向使用者確認

### 檢核清單 JSON 格式

```json
[
  {
    "groupName": "前端",
    "items": [
      {"text": "頁面切版", "checked": false},
      {"text": "API 串接", "checked": false},
      {"text": "RWD 測試", "checked": false}
    ]
  },
  {
    "groupName": "後端",
    "items": [
      {"text": "API 開發", "checked": false},
      {"text": "單元測試", "checked": false}
    ]
  }
]
```

