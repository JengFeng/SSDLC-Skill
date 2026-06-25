# 對照表 + 預設管理員自動帶入

> 何時讀：要決定 project_id / member_id，或 create_item 前要自動帶預設管理員時。
> 鐵則：成員指派**優先用 `GET /api/users_api.php` 動態查**，本對照表僅備援/離線參考。

## 專案 ID 對照表

| 專案名稱 | project_id |
|------|------|
| 桃園水情 | 1 |
| 桃園智慧農場 | 2 |
| 桃園出流管制 | 3 |
| 桃園三維 | 4 |
| 水利署整合平台 | 9 |
| 文資監測 | 10 |
| 觀測站 | 11 |
| 地下水汙染監測 | 12 |
| 南投雨水 | 13 |
| 桃園污水下水道 | 16 |
| 桃園水門 | 17 |
| SideProject | 18 |
| 物種分析 | 19 |
| 淺力專案 | 20 |
| 租借會議室系統 | 21 |
| 創視平台 | 22 |
| 台水 | 23 |
| 高風險 | 24 |
| 系統整合 | 25 |
| AI | 26 |
| 筆記 | 27 |
| 航空城 | 28 |

> 若不確定歸哪個專案，先問使用者再建立。對照表可能過時，建議以 `fetch_projects.php` 為準。

---

## 成員 ID 對照表

| 成員 | user_id |
|------|------|
| Benson | 1 |
| Rexyang | 2 |
| Nicklin | 3 |
| Derekliu | 4 |
| Louisliu | 5 |
| Genewu | 18 |
| Leo | 22 |
| Tinawu | 24 |
| Mileszhang | 25 |

> 指派成員**優先呼叫** `users_api.php` 取得最新清單，勿直接依賴上表（成員可能異動）。

---

## 🚨 預設管理員自動帶入機制（每次 create_item 必跑）

**line_groups 表設計：1 LINE 群組 = 1 預設負責人 + 1 對應專案**（多對 1：同一專案可有多個群組，但每個群組各有自己的 預設管理員）。

所以預設管理員的決定要依「是否有群組上下文」分流：

### 規則
- **Benson (id=1) 寫死**，所有工項一定掛 Benson（室主管，全域追蹤）
- **若從 LINE 對話建工項**（上游有 `line_group_id` 或 `source_id`）→ 用**該群組的** `default_member_id`（1-to-1 精準）
- **若手動建工項**（沒群組上下文）→ 從該專案的所有 line_groups 取**多數決 預設管理員**（fallback，可能不準）
- 若 預設管理員 就是 Benson 本人 → `member_id="1"`（不重複掛）
- 若該專案/群組在 line_groups 沒設定 預設管理員 → `member_id="1"`（只掛 Benson）
- 若使用者明確指定 `member_id`（如 `"1,2,8"`）→ 用使用者指定的，不跑動態查

### helper function（寫進 create_item 流程，Step 2 之前呼叫）

`list_groups.php` 原生支援 `?project_id=X` 和 `?source_id=Cxxx` 篩選，直接用 query string，不用本地端 filter。

```python
import httpx

LIST_GROUPS_API = "https://your-server.example.com/EIP/LINE/api/list_groups.php"

def get_default_member_id(project_id: str, line_group_source_id: str = None) -> str:
    """
    回傳 'Benson + 該專案/群組預設管理員' 的 member_id 字串。
    - 永遠包含 Benson (id=1)
    - 優先用 line_group_source_id 精準對到該群組的 default_member_id（API ?source_id=X）
    - 沒群組上下文時退回專案多數決（API ?project_id=X）
    - 失敗 fallback → 只掛 Benson

    參數：
        project_id: EIP project_id（必填）
        line_group_source_id: LINE 群組 source_id（從 SOURCE_PAYLOAD 拿，可選）
    """
    # Tier 1：有群組上下文 → 精準查單群（API 回 ≤1 筆）
    if line_group_source_id:
        try:
            r = httpx.get(LIST_GROUPS_API,
                          params={"source_id": line_group_source_id},
                          verify=False, timeout=10).json()
            if r and r[0].get('default_member_id'):
                pmid = str(r[0]['default_member_id'])
                return "1" if pmid == "1" else f"1,{pmid}"
            print(f"[info] source_id={line_group_source_id} 找不到 預設管理員，退回專案多數決")
        except Exception as e:
            print(f"[warn] Tier 1 查詢失敗 ({e})，退到 Tier 2")

    # Tier 2：手動建（無群組上下文）→ 該專案所有 distinct 預設管理員全部加入
    # 設計：手動建工項時沒辦法知道是「哪個群組來的」，所以該專案各群組設定的
    #      預設管理員一律納入。多人協作時漏掉人比多掛人糟。
    try:
        r = httpx.get(LIST_GROUPS_API,
                      params={"project_id": project_id},
                      verify=False, timeout=10).json()
    except Exception as e:
        print(f"[warn] Tier 2 查詢失敗 ({e})，fallback 只掛 Benson")
        return "1"

    pm_set = set()
    for g in r:
        pmid = g.get('default_member_id')
        if not pmid: continue
        pmid = str(pmid)
        if pmid == "1": continue  # 跳過 Benson，反正會 prepend
        pm_set.add(pmid)

    if not pm_set:
        return "1"  # 該專案沒非 Benson 的預設管理員

    pms_sorted = sorted(pm_set, key=lambda x: int(x))
    return "1," + ",".join(pms_sorted)

# 用法 1：手動建（無群組上下文）
MEMBER_ID = get_default_member_id(PROJECT_ID)

# 用法 2：從 LINE 對話建（有 source_id）
MEMBER_ID = get_default_member_id(PROJECT_ID, SOURCE_PAYLOAD["source_meta"]["source_id"])

print(f"[預設管理員] project={PROJECT_ID} → member_id={MEMBER_ID}")
```

### 不需要對照表

**Benson 寫死、預設管理員 從 API 來**，因此不需要 hardcode 任何 project → 預設管理員 對照表。
要查某專案 預設管理員 直接打 API：
```bash
curl "https://your-server.example.com/EIP/LINE/api/list_groups.php?project_id=9"
```

**從 LINE 來源建工項時務必傳 `line_group_source_id`**，才能精準對到「該群組」的 預設管理員（同專案多群組時，各群組可能 預設管理員 不同）。

---

