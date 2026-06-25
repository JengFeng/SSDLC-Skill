# 專案知識庫（Wiki）操作

> 何時讀：使用者說「知識庫 / wiki / 新增頁面 / 子頁面 / 查知識庫」。

### 觸發時機
- 使用者說「查知識庫」「看知識庫」「wiki」→ `fetch_wiki_pages` + `fetch_wiki_page`
- 使用者說「新增頁面」「加一頁」「建子頁面」→ `create_wiki_page`
- 使用者說「更新知識庫」「改頁面」→ 先 `fetch_wiki_page` 讀取，再 `update_wiki_page` 更新
- 使用者說「刪頁面」→ `delete_wiki_page`

### 知識庫內容格式
內容為 **Editor.js JSON**，非 HTML。範例：
```json
{
  "time": 1773550000000,
  "blocks": [
    {"type": "header", "data": {"text": "標題", "level": 2}},
    {"type": "paragraph", "data": {"text": "內文"}},
    {"type": "table", "data": {"withHeadings": true, "content": [["欄1","欄2"],["值1","值2"]]}},
    {"type": "list", "data": {"style": "unordered", "items": ["項目1","項目2"]}},
    {"type": "checklist", "data": {"items": [{"text": "待辦", "checked": false}]}},
    {"type": "code", "data": {"code": "SELECT * FROM table"}},
    {"type": "quote", "data": {"text": "引言", "caption": "來源"}},
    {"type": "delimiter", "data": {}}
  ],
  "version": "2.29.1"
}
```

### 知識庫連結
- 頁面：`https://your-server.example.com/EIP/progress/project_wiki.php?project_id={pid}&page_id={page_id}`
- 若無 page_id 則自動載入第一個根頁面

---

