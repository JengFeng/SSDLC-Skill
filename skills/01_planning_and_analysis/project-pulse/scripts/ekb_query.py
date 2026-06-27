# -*- coding: utf-8 -*-
"""漸進式查詢【第 1 段】：只打 EKB（快）。多數問題這段就夠。
用法:
  python ekb_query.py <project_id或專案名> "<主題關鍵字,逗號分隔>"
例:
  python ekb_query.py 1 "路面淹水,預測淹水,致災門檻"
  python ekb_query.py 桃園水情 "路面淹水"
輸出: JSON（hit_count / notes 清單 / 前 3 篇全文）給 Claude 判讀。
hit_count=0 → 老實回「EKB 查無」，問使用者要不要 deep_fetch 展開其他層。
"""
import json, os, sys, urllib.request, urllib.parse, ssl
sys.stdout.reconfigure(encoding="utf-8")
EKB = os.environ.get("EKB_BASE_URL", "https://your-server.example.com/ekb")
TOK = os.environ.get("EKB_TOKEN", "")
ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
def hg(u): return urllib.request.urlopen(urllib.request.Request(u, headers={"X-EKB-Token": TOK}), context=ctx, timeout=40).read().decode("utf-8", "replace")

# 簡易別名→id（完整見 references/project-mapping.md；查無時打 projects.php）
ALIAS = {"桃園水情": 1, "水情": 1, "農工": 2, "桃園智慧農場": 2, "楊梅田": 2, "楊梅": 2,
         "出流": 3, "桃園出流管制": 3, "三維": 4, "整合平台": 9, "水利署整合平台": 9,
         "文資": 10, "觀測站": 11, "南投雨水": 13, "下水道": 16, "桃園污水下水道": 16,
         "水門": 17, "創視平台": 22, "彰化雨水": 22, "台水": 23, "系統整合": 25,
         "航空城": 28, "台北市水情辨識": 30, "海循": 31}
def resolve(s):
    if str(s).isdigit(): return int(s)
    if s in ALIAS: return ALIAS[s]
    try:
        for p in (json.loads(hg(EKB + "/api/projects.php")).get("data") or {}).get("items", []):
            if s in p.get("name", "") or p.get("name", "") in s: return p["id"]
    except Exception: pass
    return None

def main():
    if len(sys.argv) < 2:
        print('用法: python ekb_query.py <project_id或名> "<關鍵字,逗號>"'); return
    pid = resolve(sys.argv[1])
    kws = [k.strip() for k in (sys.argv[2] if len(sys.argv) > 2 else "").split(",") if k.strip()]
    out = {"input": sys.argv[1], "project_id": pid, "keywords": kws, "notes": [], "full": []}
    seen = {}
    if pid:
        try:
            for n in (json.loads(hg(EKB + f"/api/notes.php?list=1&project_id={pid}&limit=100")).get("data") or {}).get("items", []):
                seen[n["id"]] = n
        except Exception as e: out["err_pid"] = str(e)
    for k in kws:
        try:
            for n in (json.loads(hg(EKB + "/api/notes.php?list=1&q=" + urllib.parse.quote(k) + "&limit=30")).get("data") or {}).get("items", []):
                seen[n["id"]] = n
        except Exception: pass
    def score(n):
        blob = (n.get("title", "") + (n.get("summary") or ""))
        return (1 if n.get("eip_project_id") == pid else 0, sum(k in blob for k in kws))
    notes = sorted(seen.values(), key=score, reverse=True)
    out["hit_count"] = len(notes)
    out["notes"] = [{"id": n["id"], "title": n.get("title"), "pid": n.get("eip_project_id"),
                     "created": n.get("created_at"), "src": n.get("source_ref"), "summary": n.get("summary")} for n in notes[:12]]
    for n in notes[:3]:
        try:
            d = json.loads(hg(EKB + f"/api/notes.php?id={n['id']}")); d = d.get("data", d) if isinstance(d, dict) else d
            out["full"].append({"id": n["id"], "title": n.get("title"), "src": n.get("source_ref"),
                                "note_url": f"{EKB}/note.php?id={n['id']}", "text": (d.get("content_text") or "")[:6000]})
        except Exception: pass
    print(json.dumps(out, ensure_ascii=False, indent=1))

if __name__ == "__main__": main()
