# -*- coding: utf-8 -*-
"""漸進式查詢【第 2 段】：使用者要更深才展開 —— 補 EIP 工項 + LINE 討論。
用法:
  python deep_fetch.py <project_id或專案名> "<主題關鍵字,逗號分隔>"
輸出: JSON（eip 指派中工項 / line 原始訊息 + 訊號）給 Claude 判讀分層。
注意: LINE 用 source_id 過濾避免跨案污染；LINE 內容一律標『未定案』。
"""
import json, os, sys, urllib.request, urllib.parse, ssl, sqlite3
sys.stdout.reconfigure(encoding="utf-8")
EKB = os.environ.get("EKB_BASE_URL", "https://your-server.example.com/ekb"); TOK = os.environ.get("EKB_TOKEN", "")
EIP = "https://your-server.example.com/progress/api"
LINE_API = "https://your-server.example.com/line/api"
LINE_DB = os.environ.get("EIP_LINE_DB", r"/path/to/your/handover.db")
ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
def hg(u, h=None): return urllib.request.urlopen(urllib.request.Request(u, headers=h or {}), context=ctx, timeout=40).read().decode("utf-8", "replace")
def hp(u, f): return urllib.request.urlopen(urllib.request.Request(u, data=urllib.parse.urlencode(f).encode()), context=ctx, timeout=40).read().decode("utf-8", "replace")
ALIAS = {"桃園水情": 1, "水情": 1, "農工": 2, "桃園智慧農場": 2, "楊梅田": 2, "楊梅": 2, "出流": 3, "桃園出流管制": 3,
         "三維": 4, "整合平台": 9, "水利署整合平台": 9, "觀測站": 11, "南投雨水": 13, "下水道": 16, "桃園污水下水道": 16,
         "水門": 17, "創視平台": 22, "彰化雨水": 22, "系統整合": 25, "航空城": 28, "台北市水情辨識": 30}
def resolve(s):
    if str(s).isdigit(): return int(s)
    if s in ALIAS: return ALIAS[s]
    try:
        for p in (json.loads(hg(EKB + "/api/projects.php", {"X-EKB-Token": TOK})).get("data") or {}).get("items", []):
            if s in p.get("name", "") or p.get("name", "") in s: return p["id"]
    except Exception: pass
    return None

def main():
    if len(sys.argv) < 2:
        print('用法: python deep_fetch.py <project_id或名> "<關鍵字,逗號>"'); return
    pid = resolve(sys.argv[1])
    kws = [k.strip() for k in (sys.argv[2] if len(sys.argv) > 2 else "").split(",") if k.strip()]
    out = {"input": sys.argv[1], "project_id": pid, "keywords": kws, "eip": [], "line_msgs": [], "line_signals": [], "err": {}}

    # 📋 EIP 工項（指派中）
    try:
        its = json.loads(hp(EIP + "/items_api.php", {"action": "fetch", "project_id": str(pid)}))
        if isinstance(its, dict): its = its.get("data", its)
        for i in its:
            blob = (i.get("item_name", "") + (i.get("description") or ""))
            if (not kws) or any(k in blob for k in kws):
                out["eip"].append({"id": i["id"], "item_name": i.get("item_name"), "status": i.get("status"),
                                   "end_date": i.get("end_date"), "members": i.get("project_members"),
                                   "url": f"{EIP.replace('/api','')}/itemdetail.php?id={i['id']}",
                                   "active": i.get("status") in ("進行中", "待測試", "未開始")})
    except Exception as e: out["err"]["eip"] = str(e)

    # 💬 LINE（討論中·未定案）— 先拿該案 source_ids 避免跨案
    source_ids = []
    try:
        g = json.loads(hg(f"{LINE_API}/list_groups.php?project_id={pid}"))
        if isinstance(g, dict): g = g.get("data", g)
        source_ids = [x.get("source_id") for x in g if x.get("source_id")]
        out["line_groups"] = [x.get("group_name") for x in g]
    except Exception as e: out["err"]["line_groups"] = str(e)
    try:
        con = sqlite3.connect(LINE_DB); con.row_factory = sqlite3.Row; cur = con.cursor()
        if source_ids and kws:
            qm = ",".join("?" * len(source_ids)); likes = " OR ".join(["content LIKE ?"] * len(kws))
            cur.execute(f"SELECT created_at,display_name,source_name,content FROM chat_msg_cache "
                        f"WHERE source_id IN ({qm}) AND ({likes}) ORDER BY created_at DESC LIMIT 40",
                        source_ids + [f"%{k}%" for k in kws])
            out["line_msgs"] = [dict(r) for r in cur.fetchall()]
        # 訊號（可能含鄰案，Claude 判讀時留意）
        if kws:
            likes = " OR ".join(["topic LIKE ? OR decisions LIKE ? OR conversation_summary LIKE ?"] * len(kws))
            params = []
            for k in kws: params += [f"%{k}%", f"%{k}%", f"%{k}%"]
            cur.execute(f"SELECT id,session_type,topic,status,blocked,next_steps,decisions,updated_at "
                        f"FROM handover WHERE session_type IN ('decision','blocker','commitment','incident') "
                        f"AND ({likes}) ORDER BY updated_at DESC LIMIT 20", params)
            out["line_signals"] = [dict(r) for r in cur.fetchall()]
        # 新鮮度
        try:
            cur.execute("SELECT key,value FROM sync_state WHERE key IN ('chat_sync.last_ts','global.last_extraction_ts')")
            out["line_freshness"] = {r["key"]: r["value"] for r in cur.fetchall()}
        except Exception: pass
        con.close()
    except Exception as e: out["err"]["line_db"] = str(e)

    print(json.dumps(out, ensure_ascii=False, indent=1))

if __name__ == "__main__": main()
