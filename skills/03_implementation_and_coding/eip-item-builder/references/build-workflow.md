# 完整流程範本（LINE 來源建檔，最常見場景）

> 何時讀：實際要跑第二階段端到端建檔時，照這支 Python 範本改變數即可（Step 1→1.5→2→2.5→5→6→7→8→後置記帳）。

把這段 copy 出去改幾個變數就能跑。涵蓋 Step 1~8 + handover 記帳 + verify。

```python
"""
LINE 對話 → EIP 工項 完整範本
前置：上游（eip-line-radar 等）已提供 source_payload，附檔已下載到本機
"""
import httpx, sqlite3, json, os, mimetypes
from datetime import datetime
from pathlib import Path

BASE = "https://your-server.example.com/EIP/progress"
DB = os.environ.get("EIP_LINE_DB") or str(Path.cwd() / ".handover" / "handover.db")
cli = httpx.Client(timeout=60, verify=False, follow_redirects=True)
hc = sqlite3.connect(DB)
NOW = datetime.now().isoformat(timespec='seconds')

# ============ 1. 填這些變數（會帶來自上游 / 對話確認） ============
PROJECT_ID = "16"            # 從 fetch_projects.php 確認過
ITEM_NAME = "下水道水保計畫 UPLOAD_A_TECHCHECK 開發"
PRIORITY = "高"              # '高' / '中' / '低'
START_DATE = "2026-05-15"
END_DATE = "2026-06-05"      # 有提到死線才填；沒提到就留 ""，下方會自動補「開始日+2週」
MEMBER_ID = None             # None = 自動跑 get_default_member_id(PROJECT_ID)；要明確指定就填 "1,2,8"

DESCRIPTION = """【前因】
... 為什麼要做 ...

【現況】
... 目前狀態 ...

【後果】
... 不做會怎樣 ...

【目標】
... 驗收條件 ...

【工項來源】
來源：LINE 對話「群名」
時間：2026-05-15 10:10 ~ 13:35
參與者：xxx
反查：handover.db workflow row「LINE-EIP: {ITEM_NAME}」"""
# ⚠️ DESCRIPTION 不可有 emoji，改用 ★ ▲ ● ◆ → ⚠ ✔ ✘

HTML_CONTENT = """<h2>下水道水保計畫 UPLOAD_A_TECHCHECK 開發</h2>
<h3>前因</h3><p>...</p>
<h3>現況</h3><p>...</p><ul><li>...</li></ul>
<h3>後果</h3><ol><li>...</li></ol>
<h3>目標 - 驗收條件</h3>
<table>
  <tr><th>項目</th><th>狀態</th></tr>
  <tr><td>...</td><td>...</td></tr>
</table>
<hr>
<h3>工項來源</h3>
<table>
  <tr><td>來源</td><td>LINE 對話「群名」</td></tr>
  <tr><td>時間</td><td>2026-05-15 10:10 ~ 13:35</td></tr>
  <tr><td>反查</td><td>handover row「LINE-EIP: {ITEM_NAME}」</td></tr>
</table>"""
# ⚠️ HTML_CONTENT 同樣不可有 emoji

ATTACHMENTS = [
    "C:/.../downloads/eip_items/tmp_xxx/file1.docx",
    "C:/.../downloads/eip_items/tmp_xxx/image1.jpg",
]

SOURCE_PAYLOAD = {
    "source": "line",
    "source_fingerprint": {"msg_ids": ["614012048154034399", "..."]},
    "source_meta": {
        "source_id": "Cxxx",
        "source_name": "下水道交接救火隊_REX",
        "msg_time_range": ["2026-05-15 10:10:00", "2026-05-15 13:35:00"],
        "participants": ["蘇小B", "振昌(Rex)"],
    },
    "summary": "一句話摘要（list 顯示用）",
}

# ============ 2. Step 1.5 建檔前查重（Tier A msg_ids + Tier B name 模糊）============
# --- Tier A: source_fingerprint 精準比對 ---
fp_hits = []
try:
    rows = hc.execute("""
        SELECT id, topic, extra_json FROM handover
        WHERE session_type='workflow' AND topic LIKE '%-EIP:%'
    """).fetchall()
    cand_mids = set(str(x) for x in SOURCE_PAYLOAD["source_fingerprint"]["msg_ids"])
    for r in rows:
        try:
            meta = json.loads(r[2] or '{}')
        except json.JSONDecodeError:
            continue
        existing_mids = set(str(x) for x in (meta.get('source_fingerprint',{}).get('msg_ids') or []))
        overlap = cand_mids & existing_mids
        if overlap:
            fp_hits.append((r[0], meta.get('eip_item_id'), r[1], len(overlap)))
except sqlite3.OperationalError:
    pass  # handover 表還沒建

if fp_hits:
    print("🚨 msg_ids 命中已存在工項，停下來：")
    for ho_id, eip_id, topic, cnt in fp_hits:
        print(f"   handover #{ho_id} → EIP #{eip_id} ({cnt} 則重疊) {topic}")
    print("\n請決定：(Y) 建新的 / (N) 補資料到既有 / (C) 取消")
    raise SystemExit(0)  # 等使用者答覆

# --- Tier B: name + project 模糊比對 ---
r_b = cli.post(f"{BASE}/api/items_api.php",
               data={"action":"fetch","project_id":PROJECT_ID}).json()
name_core = ITEM_NAME.replace('【','').replace('】','').replace('系統','').strip()
name_hits = []
for it in (r_b.get('data') or []):
    existing = it.get('item_name','') or ''
    for L in (8, 6, 4):
        if any(name_core[i:i+L] in existing for i in range(max(0, len(name_core)-L+1))):
            name_hits.append((it.get('id'), existing, it.get('status')))
            break
if name_hits:
    print(f"⚠️ 同專案有名字相似工項（誤判率較高）：")
    for eip_id, name, st in name_hits[:5]:
        print(f"   EIP #{eip_id} [{st}] {name}")
    print("\n是同一件事嗎？(Y) 建新 / (N) 補既有 / (C) 取消")
    raise SystemExit(0)

# ============ 3. Step 2 建工項 ============
# 預設管理員：Benson 寫死 + 該專案/群組預設管理員 動態查 line_groups
# 完整邏輯與 Tier 1/Tier 2 分流見「預設管理員自動帶入機制」段落
LIST_GROUPS_API = "https://your-server.example.com/EIP/LINE/api/list_groups.php"

def get_default_member_id(project_id, line_group_source_id=None):
    if line_group_source_id:
        try:
            r = httpx.get(LIST_GROUPS_API, params={"source_id": line_group_source_id},
                          verify=False, timeout=10).json()
            if r and r[0].get('default_member_id'):
                pmid = str(r[0]['default_member_id'])
                return "1" if pmid == "1" else f"1,{pmid}"
        except Exception:
            pass
    try:
        r = httpx.get(LIST_GROUPS_API, params={"project_id": project_id},
                      verify=False, timeout=10).json()
    except Exception:
        return "1"
    pm_set = set()
    for g in r:
        pmid = g.get('default_member_id')
        if not pmid: continue
        pmid = str(pmid)
        if pmid == "1": continue
        pm_set.add(pmid)
    if not pm_set:
        return "1"
    return "1," + ",".join(sorted(pm_set, key=lambda x: int(x)))

if MEMBER_ID is None:
    # 從 LINE 來源建工項時，傳 SOURCE_PAYLOAD["source_meta"]["source_id"] 進去更精準
    src_id = SOURCE_PAYLOAD.get("source_meta", {}).get("source_id") if SOURCE_PAYLOAD else None
    MEMBER_ID = get_default_member_id(PROJECT_ID, src_id)
    print(f"[預設管理員] project={PROJECT_ID} src={src_id} → member_id={MEMBER_ID}")

# 沒給結束日 → 預設「開始日 +2 週」（規則：未提時間限期兩週內完成）
if not END_DATE:
    from datetime import timedelta as _td
    _base = START_DATE if START_DATE else NOW[:10]
    END_DATE = (datetime.strptime(_base, "%Y-%m-%d") + _td(days=14)).strftime("%Y-%m-%d")
    print(f"[預設結束日] 未提供 → 開始日+2週 = {END_DATE}")

data = {
    "action": "create", "project_id": PROJECT_ID,
    "item_name": ITEM_NAME, "description": DESCRIPTION,
    "status": "未開始", "priority": PRIORITY,
    "item_type": "臨時工項",
    "start_date": START_DATE, "end_date": END_DATE,
    "member_id": MEMBER_ID,
}
r = cli.post(f"{BASE}/api/items_api.php", data=data).json()
assert r.get('status') == 'success', f"create_item FAIL: {r}"
item_id = r['item_id']
print(f"[OK] Step 2 create_item → item_id={item_id}")

# ============ 4. Step 2.5 連動建 item_edit 殼 ============
cli.post(f"{BASE}/api/item_edit_api.php",
         data={"action": "create", "items_id": str(item_id)})

# ============ 5. Step 5 寫富文本內容（對話來源強制）============
r = cli.post(f"{BASE}/api/item_edit_api.php", data={
    "action": "save",
    "items_id": str(item_id),
    "content": HTML_CONTENT,
    "is_published": "0",
}).json()
assert r.get('status') == 'success', f"save content FAIL: {r}"
print(f"[OK] Step 5 寫富文本")

# ============ 5.5 Step 6 驗收清冊（跨人協作 / 對話來源建議）============
# 把 Step 5 富文本「目標 - 驗收條件」表格的每列拆成可勾選 KPI
ACCEPTANCE_TODOS = [
    "(俊毅) 子任務 1（顆粒度=一句話可驗）",
    "(俊毅) 子任務 2",
    "(Benson) 整合測試",
    "(Benson) 出獨立估價單給客戶確認",
    "(蔡鎧宇) 驗收簽收",
]
if ACCEPTANCE_TODOS:
    td = {
        "action": "updateTodoList",
        "id": str(item_id),
        "description": f"驗收清冊（KPI）— {len(ACCEPTANCE_TODOS)} 項全綠才結案",
    }
    for i, name in enumerate(ACCEPTANCE_TODOS):
        td[f"todos[{i}][name]"] = name
        td[f"todos[{i}][completed]"] = "false"
        td[f"todos[{i}][completed_sa]"] = "false"
    r = cli.post(f"{BASE}/api/items_api.php", data=td).json()
    assert r.get('status') == 'success', f"updateTodoList FAIL: {r}"
    print(f"[OK] Step 6 驗收清冊 {len(ACCEPTANCE_TODOS)} 項")

# ============ 6. Step 7 上傳附檔 ============
up_ok, up_fail = 0, 0
for fp in ATTACHMENTS:
    if not os.path.exists(fp):
        up_fail += 1; print(f"  [skip] 不存在 {fp}"); continue
    fname = os.path.basename(fp)
    mime = mimetypes.guess_type(fname)[0] or 'application/octet-stream'
    with open(fp, 'rb') as f:
        files = {'file': (fname, f.read(), mime)}
    u = cli.post(f"{BASE}/api/upload.php",
                 data={"action": "upload", "item_id": str(item_id),
                       "document_type_id": "1"}, files=files).json()
    if u.get('status') == 'success': up_ok += 1
    else: up_fail += 1; print(f"  upload fail {fname}: {u}")
print(f"[OK] Step 7 附檔 {up_ok}/{up_ok+up_fail}")

# ============ 7. Step 8 verify（防靜默資料遺失）============
v = cli.post(f"{BASE}/api/items_api.php",
             data={"action": "fetch", "id": str(item_id)}).json()
vd = v.get('data')
if isinstance(vd, list): vd = vd[0] if vd else {}
desc_len = len(vd.get('description', '') or '')
ec = cli.post(f"{BASE}/api/item_edit_api.php",
              data={"action": "fetch", "items_id": str(item_id)}).json()
content_len = len(ec.get('data', {}).get('content', '') or '')
print(f"[verify] description={desc_len} chars, item_edit content={content_len} chars")
assert desc_len > 0, "🚨 description 為空，可能 emoji 觸發 utf8 bug，請改字元"
assert content_len > 0, "🚨 富文本為空，Step 5 沒生效"

# ============ 8. 後置記帳（handover row，idempotent）============
extra = {
    "eip_item_id": item_id,
    "eip_project": "桃園污水下水道",   # 對應 PROJECT_ID 的人話名
    "source": SOURCE_PAYLOAD["source"],
    "source_fingerprint": SOURCE_PAYLOAD["source_fingerprint"],
    "source_meta": SOURCE_PAYLOAD["source_meta"],
    "attachments": [{"path": p,
                     "filetype": "image" if p.lower().endswith(('.jpg','.png','.jpeg')) else "file"}
                    for p in ATTACHMENTS],
    "created_at": NOW,
}
topic = f"{SOURCE_PAYLOAD['source'].upper()}-EIP: {ITEM_NAME}"
extra_json_str = json.dumps(extra, ensure_ascii=False)
try:
    existing = hc.execute("""
        SELECT id FROM handover
        WHERE session_type='workflow' AND topic LIKE '%-EIP:%'
          AND extra_json LIKE ?
    """, (f'%"eip_item_id": {item_id}%',)).fetchone()
    if existing:
        ho_id = existing[0]
        hc.execute("""
            UPDATE handover
            SET topic=?, conversation_summary=?, extra_json=?,
                priority=?, due_date=?, status='completed',
                updated_at=datetime('now')
            WHERE id=?
        """, (topic, SOURCE_PAYLOAD["summary"], extra_json_str,
              PRIORITY, END_DATE or '', ho_id))
        hc.commit()
        print(f"[OK] handover row UPDATED #{ho_id}")
    else:
        hc.execute("""
            INSERT INTO handover (
                session_type, topic, status, conversation_summary,
                extra_json, priority, due_date,
                created_at, updated_at
            ) VALUES ('workflow', ?, 'completed', ?, ?, ?, ?,
                      datetime('now'), datetime('now'))
        """, (topic, SOURCE_PAYLOAD["summary"], extra_json_str,
              PRIORITY, END_DATE or ''))
        hc.commit()
        ho_id = hc.execute("SELECT last_insert_rowid()").fetchone()[0]
        print(f"[OK] handover row INSERTED #{ho_id}")
except Exception as e:
    print(f"⚠️ handover 寫入失敗（請手動補登）: {e}")

# ============ 9. 回報 ============
print(f"\nDONE: EIP #{item_id}")
print(f"  https://your-server.example.com/EIP/progress/itemdetail.php?id={item_id}")
```

**改 4 個區塊就能跑：**
1. 變數區（PROJECT_ID / ITEM_NAME / 日期 / 負責人）
2. DESCRIPTION（4 段敘事 + 工項來源段）
3. HTML_CONTENT（富文本主畫面內容）
4. SOURCE_PAYLOAD + ATTACHMENTS

**保證涵蓋：**
- ✅ Step 1.5 雙路查重（msg_ids 精準 + name 模糊保底，命中即停）
- ✅ 建工項 + 富文本 + 附檔
- ✅ verify（emoji 吃掉 description 會立刻發現）
- ✅ 後置記帳 idempotent（同 eip_item_id 不重複 INSERT）
- ✅ 全部 assert，失敗有錯誤訊息

---

