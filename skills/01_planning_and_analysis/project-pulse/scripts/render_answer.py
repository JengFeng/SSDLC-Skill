# -*- coding: utf-8 -*-
"""漸進式查詢【第 3 段】：讀 answer.json（Claude 判讀後填的四層）→ 暖色分層 HTML。
用法: python render_answer.py [answer.json] [輸出.html]   (預設 ./answer.json -> ./answer.html)

answer.json schema:
{
  "project": "桃園水情", "topic": "路面淹水機制",
  "tldr": "一句話總結（可含燈號）",
  "layers": [
    {"icon":"📗","name":"既定事實","tag":"✅ 定案","color":"ok","src":"EKB#313","html":"<p>...任意HTML...</p>"},
    {"icon":"📋","name":"指派中","tag":"🔵 進行中","color":"blue","src":"EIP","html":"<table>...</table>"},
    {"icon":"💬","name":"討論中","tag":"⚠️ 未定案","color":"warn","src":"LINE","html":"..."},
    {"icon":"📁","name":"研究中","tag":"🔬 探索中","color":"res","src":"資料夾","html":"..."}
  ],
  "freshness": "LINE cache @ ... / EKB·EIP 即時"
}
color ∈ {ok, blue, warn, res}；layers 可只放有資料的層（漸進式第一段可能只有 ekb 一層）。
"""
import json, os, sys
sys.stdout.reconfigure(encoding="utf-8")
src = sys.argv[1] if len(sys.argv) > 1 else "answer.json"
dst = sys.argv[2] if len(sys.argv) > 2 else "answer.html"
a = json.load(open(src, encoding="utf-8"))

layers = ""
for L in a.get("layers", []):
    layers += f'''<div class="layer c-{L.get('color','ok')}">
<div class="lh"><span class="ic">{L.get("icon","")}</span><span class="nm">{L.get("name","")}</span>
<span class="tag">{L.get("tag","")}</span><span class="src">{L.get("src","")}</span></div>
<div class="lb">{L.get("html","")}</div></div>'''

HTML = f'''<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>{a.get("project","")} · {a.get("topic","")}</title>
<style>
:root{{--bg:#fbf6ee;--card:#fffdf9;--ink:#4a3f33;--mut:#9a8b78;--acc:#e8833a;--line:#ece1d2;
--ok:#5a9367;--okbg:#e9f1ea;--blue:#3f6fa6;--bluebg:#e7eef6;--warn:#cf9326;--warnbg:#fbf2e0;--res:#8a6cae;--resbg:#efe9f6;}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);font:18px/1.6 "Segoe UI","PingFang TC","Microsoft JhengHei",sans-serif}}
.wrap{{max-width:760px;margin:0 auto;padding:24px 20px 50px}}
.q{{color:var(--mut);font-size:15px}}
h1{{font-size:25px;margin:4px 0 4px}}
.sub{{color:var(--mut);font-size:15px;margin-bottom:18px}}
.tldr{{background:var(--card);border:1px solid var(--line);border-left:7px solid var(--acc);border-radius:14px;
padding:16px 20px;font-size:19px;box-shadow:0 4px 16px rgba(120,90,50,.06);margin-bottom:22px}}
.layer{{background:var(--card);border:1px solid var(--line);border-radius:14px;margin-bottom:16px;overflow:hidden;
box-shadow:0 3px 12px rgba(120,90,50,.06);border-left:6px solid var(--lc)}}
.c-ok{{--lc:var(--ok);--tb:var(--okbg);--tc:var(--ok)}} .c-blue{{--lc:var(--blue);--tb:var(--bluebg);--tc:var(--blue)}}
.c-warn{{--lc:var(--warn);--tb:var(--warnbg);--tc:var(--warn)}} .c-res{{--lc:var(--res);--tb:var(--resbg);--tc:var(--res)}}
.lh{{display:flex;align-items:center;gap:10px;padding:13px 18px;border-bottom:1px solid var(--line)}}
.lh .ic{{font-size:20px}} .lh .nm{{font-weight:800;font-size:18px}}
.lh .tag{{font-size:12.5px;font-weight:700;padding:3px 11px;border-radius:20px;background:var(--tb);color:var(--tc)}}
.lh .src{{margin-left:auto;font-size:13px;color:var(--mut)}}
.lb{{padding:14px 18px;font-size:16.5px}}
.lb h4{{margin:10px 0 5px;font-size:16px;color:var(--acc)}} .lb h4:first-child{{margin-top:0}}
.lb p{{margin:5px 0}} .lb ul{{margin:5px 0;padding-left:22px}} .lb li{{margin:4px 0}}
.lb code{{background:#f0ebe3;padding:1px 7px;border-radius:6px;font-size:14px}}
.lb table{{width:100%;border-collapse:collapse;font-size:15.5px}}
.lb th,.lb td{{padding:8px 10px;text-align:left;border-bottom:1px solid var(--line)}} .lb th{{color:var(--mut);font-size:13px}}
.lb .warnbox{{background:var(--warnbg);border:1px dashed #dcc185;border-radius:8px;padding:8px 12px;margin:7px 0}}
.lb a{{color:var(--acc);text-decoration:none}}
.foot{{margin-top:22px;font-size:13.5px;color:var(--mut);border-top:1px solid var(--line);padding-top:12px}}
</style></head><body><div class="wrap">
<div class="q">🔍 你問：</div>
<h1>{a.get("project","")} · {a.get("topic","")}</h1>
<div class="sub">分層作答 · 越上面越定案，越下面越流動</div>
{'<div class="tldr"><b>一句話：</b>' + a.get("tldr","") + '</div>' if a.get("tldr") else ''}
{layers}
<div class="foot">🤖 handover（後台工作記憶）：記住這題查過什麼、跨 session 不重挖。<br>🕓 {a.get("freshness","")}</div>
</div></body></html>'''

open(dst, "w", encoding="utf-8").write(HTML)
print("OK ->", os.path.abspath(dst))
