# HTML 內文格式規範 + 批次建立範例

> 何時讀：要寫 item_edit 富文本（HTML）格式，或一次建多工項 + 多任務時。

## HTML 內文格式規範

支援標籤：`<h2>` `<h3>` `<p>` `<strong>` `<em>` `<ul><li>` `<ol><li>` `<hr>` `<br>`

**Checkbox（勾選框）必須用以下格式，不可用 ☐ 符號：**
```html
<p><label class="eip-checkbox"><input type="checkbox"> 未完成項目</label></p>
<p><label class="eip-checkbox"><input type="checkbox" checked> 已完成項目</label></p>
```

**重要**：代辦清單（可被程式穩定查改）**不寫在 HTML 內文**，使用 `update_todo_list` (items_api action=updateTodoList) 管理。

---


---

遇到一次要建 N 個工項、每個下面多個任務時，寫一支腳本跑一次：

```python
import httpx
BASE = "https://your-server.example.com/EIP/progress"
cli = httpx.Client(timeout=30, verify=False, follow_redirects=True)

PROJECT_ID = 9  # 水利署整合平台
MEMBER = "1"    # Benson

ITEMS = [
    {
        "name": "【A】計畫書補件",
        "desc": "描述...",
        "priority": "高",
        "start": "2026-04-24", "end": "2026-06-30",
        "tasks": [
            ("A1 KPI 指標補充", "辨識率 80~90%...", "Layer 2", "A", 1, "高"),
            ("A2 歷年違規趨勢分析", "近 10+ 年...", "Layer 2", "A", 1, "高"),
        ],
    },
]

for item in ITEMS:
    r = cli.post(f"{BASE}/api/items_api.php", data={
        "action": "create", "project_id": str(PROJECT_ID),
        "item_name": item["name"], "description": item["desc"],
        "status": "未開始", "priority": item["priority"],
        "item_type": "臨時工項",
        "start_date": item["start"], "end_date": item["end"],
        "member_id": MEMBER,
    }).json()
    item_id = r["item_id"]

    # 連動：建 item_edit 記錄
    cli.post(f"{BASE}/api/item_edit_api.php",
             data={"action": "create", "items_id": str(item_id)})

    for name, desc, layer, sub, sprint, prio in item["tasks"]:
        cli.post(f"{BASE}/api/item_tasks_api.php", data={
            "action": "create", "item_id": str(item_id),
            "task_name": name, "task_code": "",
            "layer": layer, "sub_category": sub,
            "sprint": str(sprint), "status": "待辦",
            "assignee": "Benson", "priority": prio,
            "description": desc,
        })

    print(f"✅ {item['name']} → item_id={item_id}")
```

---

