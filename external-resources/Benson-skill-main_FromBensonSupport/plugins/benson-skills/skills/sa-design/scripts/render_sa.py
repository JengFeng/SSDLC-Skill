# -*- coding: utf-8 -*-
"""sa_spec.json（Claude 產的 SA 系統分析設計）-> 暖色 HTML SA 文件，mermaid 直接渲染 ER/架構/循序圖。
用法: python render_sa.py [sa_spec.json] [輸出.html]   (預設 ./sa_spec.json -> ./sa_design.html)

sa_spec.json schema:
{
  "system": "XX 管理系統", "summary": "一句話系統總述", "stats": "4 張表 · 18 支 API",
  "er_mermaid": "erDiagram\\n  MEMBER ||--o{ ORDER : 下訂\\n  ...",
  "data_dict": [ {"table":"MEMBER","title":"會員","html":"<table>...資料字典表...</table>"} ],
  "arch_mermaid": "flowchart TD\\n  ...",
  "api_html": "<table>...API spec 表...</table>",
  "extra": [ {"title":"訂單狀態流轉","mermaid":"stateDiagram-v2\\n ..."} ]
}
er_mermaid / arch_mermaid 必填；extra 選配（循序圖/狀態圖）。
"""
import json, sys, os
import doc_common as dc
sys.stdout.reconfigure(encoding="utf-8")

NAV_CSS = """
.nav{position:sticky;top:0;z-index:50;background:rgba(251,246,238,.96);backdrop-filter:blur(6px);border-bottom:1px solid #ece1d2;padding:8px 14px;display:flex;flex-wrap:wrap;gap:5px;align-items:center;box-shadow:0 2px 10px rgba(120,90,50,.05)}
.nav .home{font-weight:700;color:#e8833a;margin-right:6px;text-decoration:none;font-size:16px}
.nav a.item{display:inline-flex;align-items:center;gap:5px;text-decoration:none;color:#4a3f33;background:#fffdf9;border:1px solid #ece1d2;border-radius:999px;padding:4px 11px;font-size:14px;white-space:nowrap}
.nav a.item .no{color:#9a8b78;font-weight:700;font-size:12px}
.nav a.item:hover{border-color:#e8833a;color:#e8833a}
.nav a.item.active{background:#e8833a;color:#fff;border-color:#e8833a}
.nav a.item.active .no{color:#ffe6d2}
.nav a.item.ext::after{content:"↗";font-size:11px;color:#9a8b78}
"""
src = sys.argv[1] if len(sys.argv) > 1 else "sa_spec.json"
dst = sys.argv[2] if len(sys.argv) > 2 else "sa_design.html"
a = json.load(open(src, encoding="utf-8"))

TOC_JS = '''<style>
.toc-float{position:fixed;top:56px;right:14px;width:210px;max-height:84vh;overflow:auto;background:#fffdf9;
border:1px solid #ece1d2;border-radius:12px;padding:10px 12px;font-size:13px;box-shadow:0 4px 16px rgba(120,90,50,.12);z-index:60}
.toc-float .tch{font-weight:700;color:#e8833a;margin-bottom:6px}
.toc-float a{display:block;text-decoration:none;color:#4a3f33;padding:3px 7px;border-radius:6px;line-height:1.35;margin:1px 0}
.toc-float a:hover{background:#f3ebdd;color:#e8833a}
.toc-float a.on{background:#e8833a;color:#fff}
.toc-float a.l1{font-weight:600}
.toc-float a.l2{padding-left:20px;font-size:12px;color:#9a8b78}
@media(max-width:1180px){.toc-float{position:static;width:auto;max-height:none;margin:0 0 16px}}
</style>
<script>
window.addEventListener('load',function(){
  var secs=document.querySelectorAll('.sec'); if(secs.length<1) return;
  var nav=document.createElement('nav'); nav.className='toc-float'; var h='<div class="tch">\\u{1F4D1} \\u5927\\u7DB1</div>'; var marks=[];
  secs.forEach(function(sec,i){
    var hh=sec.querySelector('h2'); if(!hh) return; if(!hh.id) hh.id='sec'+i;
    var n=hh.querySelector('.n'); var num=n?n.textContent.trim():'';
    var t=hh.textContent.trim(); if(num) t=t.slice(num.length).trim();
    h+='<a class="l1" href="#'+hh.id+'">'+(num?num+'. ':'')+t+'</a>'; marks.push(hh);
    sec.querySelectorAll('h3').forEach(function(x,j){ if(!x.id) x.id=hh.id+'_'+j;
      h+='<a class="l2" href="#'+x.id+'">'+x.textContent.trim()+'</a>'; marks.push(x); });
  });
  nav.innerHTML=h; document.body.appendChild(nav);
  var ls=nav.querySelectorAll('a');
  function spy(){ var y=scrollY+130,c=0; marks.forEach(function(el,i){ if(el.getBoundingClientRect().top+scrollY<=y)c=i; });
    ls.forEach(function(a,i){ a.classList.toggle('on',i===c); }); }
  addEventListener('scroll',spy); spy();
});
</script>'''

DIAG_JS = '''<script>
window.addEventListener('load',function(){
  function openFull(svg,title){
    var w=window.open('','_blank'); if(!w) return;
    var c=svg.cloneNode(true); c.removeAttribute('width'); c.removeAttribute('height'); c.style.width='100%'; c.style.height='100%';
    var d='<!doctype html><meta charset="utf-8"><title>'+(title||'\\u5716')+'</title>'+
      '<style>html,body{margin:0;height:100%;background:#fbf6ee;overflow:hidden}#bx{width:100vw;height:100vh}'+
      '.hint{position:fixed;top:10px;left:12px;z-index:9;background:#fffdf9;border:1px solid #ece1d2;border-radius:8px;padding:5px 11px;font:13px Microsoft JhengHei,sans-serif;color:#4a3f33}</style>'+
      '<div class="hint">\\u6EFE\\u8F2A\\u7E2E\\u653E\\uFF0F\\u62D6\\u66F3\\u5E73\\u79FB\\uFF0F\\u53F3\\u4E0A\\u63A7\\u5236\\u9215</div><div id="bx">'+c.outerHTML+'</div>'+
      '<scr'+'ipt src="https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/dist/svg-pan-zoom.min.js"></scr'+'ipt>'+
      '<scr'+'ipt>window.onload=function(){var e=document.querySelector("#bx svg");if(window.svgPanZoom)svgPanZoom(e,{controlIconsEnabled:true,fit:true,center:true,minZoom:0.2,maxZoom:30});};</scr'+'ipt>';
    w.document.write(d); w.document.close();
  }
  document.querySelectorAll('.mermaid').forEach(function(m){
    var svg=m.querySelector('svg'); if(!svg) return;
    var w0=(svg.viewBox&&svg.viewBox.baseVal&&svg.viewBox.baseVal.width)||svg.getBoundingClientRect().width; var s=1;
    function apply(){ svg.style.width=(w0*s)+'px'; svg.style.height='auto'; svg.style.maxWidth='none'; }
    var bar=document.createElement('div'); bar.className='zoombar';
    bar.innerHTML='<button title="\\u7E2E\\u5C0F">\\uFF0D</button><button title="\\u91CD\\u8A2D">\\u27F3</button><button title="\\u653E\\u5927">\\uFF0B</button><button title="\\u5168\\u87A2\\u5E55\\u53E6\\u958B" style="width:auto;padding:0 9px">\\u26F6 \\u5168\\u87A2\\u5E55</button>';
    var b=bar.querySelectorAll('button');
    b[0].onclick=function(){ s=Math.max(s-0.25,0.4); apply(); };
    b[1].onclick=function(){ s=1; apply(); };
    b[2].onclick=function(){ s=Math.min(s+0.25,4); apply(); };
    var ti=''; var sec=m.closest('.sec'); if(sec){var h2=sec.querySelector('h2'); if(h2) ti=h2.textContent.trim();}
    b[3].onclick=function(){ openFull(svg,ti); };
    m.prepend(bar); apply();
  });
});
</script>'''

ER_LEGEND = '''<div style="background:#f3ebdd;border:1px solid #ece1d2;border-radius:12px;padding:12px 16px;margin:0 0 14px">
<b style="color:#b5611f">關聯符號圖例（mermaid crow's foot — 看 ER 連線前先讀）</b>
<div style="display:flex;gap:24px;flex-wrap:wrap;margin-top:8px">
<div style="flex:1;min-width:280px">
<div style="font-weight:700;margin-bottom:4px">① 線端符號（單端基數）</div>
<table><thead><tr><th>符號</th><th>意義</th></tr></thead><tbody>
<tr><td><code>||</code></td><td>恰好一（必有且僅一）</td></tr>
<tr><td><code>|o</code> / <code>o|</code></td><td>零或一（可選、最多一）</td></tr>
<tr><td><code>|{</code> / <code>}|</code></td><td>一或多（至少一）</td></tr>
<tr><td><code>o{</code> / <code>}o</code></td><td>零或多</td></tr>
</tbody></table></div>
<div style="flex:1;min-width:320px">
<div style="font-weight:700;margin-bottom:4px">② 常見關係組合</div>
<table><thead><tr><th>寫法</th><th>關係</th><th>意義</th></tr></thead><tbody>
<tr><td><code>A ||--|| B</code></td><td><b>一對一 1:1</b></td><td>各一筆（1:1 多半可併回主表）</td></tr>
<tr><td><code>A ||--o{ B</code></td><td><b>一對多 1:N</b></td><td>A 一筆對 B 零或多筆（最常見）</td></tr>
<tr><td><code>A ||--|{ B</code></td><td><b>一對多 1:N</b></td><td>A 一筆對 B 至少一筆</td></tr>
<tr><td><code>A }o--o{ B</code></td><td><b>多對多 M:N</b></td><td>實作需拆關聯表（中間表放兩邊 FK）</td></tr>
<tr><td><code>A |o..o{ B</code></td><td>弱／多型（虛線 <code>..</code>）</td><td>無硬 FK，由應用層維護</td></tr>
</tbody></table></div>
<div style="flex:1;min-width:260px">
<div style="font-weight:700;margin-bottom:4px">③ 欄位鍵別（標在每欄位後）</div>
<table><thead><tr><th>標記</th><th>意義</th></tr></thead><tbody>
<tr><td><code>PK</code></td><td>主鍵（Primary Key，唯一識別一筆）</td></tr>
<tr><td><code>FK</code></td><td>外鍵（Foreign Key，指向其他表；說明標 → 目標表.欄位）</td></tr>
<tr><td><code>UK</code></td><td>唯一鍵（Unique Key，值不可重複）</td></tr>
</tbody></table></div>
</div></div>'''

def mer(code): return f'<div class="mermaid">\n{code}\n</div>' if code else ""

dict_html = ""
_cm = None
for t in a.get("data_dict", []):
    _m = t.get("module", "")
    if _m and _m != _cm:
        dict_html += f'<div class="modhd">▍{_m}</div>'
        _cm = _m
    dict_html += f'<h3>{t.get("table","")} <small>{t.get("title","")}</small></h3>{t.get("html","")}'
extra_html = ""
for e in a.get("extra", []):
    extra_html += f'<div class="sec"><h2>{e.get("title","")}</h2>{mer(e.get("mermaid",""))}</div>'

HTML = f'''<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>{a.get("system","")} · 系統分析設計</title>
<style>
:root{{--bg:#fbf6ee;--card:#fffdf9;--ink:#4a3f33;--mut:#9a8b78;--acc:#e8833a;--line:#ece1d2;--soft:#f3ebdd;}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);font:18px/1.6 "Segoe UI","PingFang TC","Microsoft JhengHei",sans-serif}}
.wrap{{max-width:1560px;width:94%;margin:0 auto;padding:26px 22px 60px}}
@media(min-width:1180px){{.wrap{{padding-right:232px}}}}
.hd{{color:var(--mut);font-size:14px;letter-spacing:.5px}}
h1{{font-size:27px;margin:4px 0 6px}}
.summary{{background:var(--card);border:1px solid var(--line);border-radius:14px;
padding:16px 20px;font-size:19px;box-shadow:0 4px 16px rgba(120,90,50,.06);margin:12px 0 6px}}
.stats{{color:var(--acc);font-weight:700;font-size:16px;margin-bottom:22px}}
.sec{{margin-top:30px}}
.sec h2{{font-size:20px;border-bottom:2px solid var(--line);padding-bottom:7px;margin-bottom:14px}}
.sec h2 .n{{display:inline-block;background:var(--acc);color:#fff;width:28px;height:28px;line-height:28px;
text-align:center;border-radius:50%;font-size:16px;margin-right:8px}}
h3{{font-size:18px;color:var(--acc);margin:18px 0 6px}} h3 small{{color:var(--mut);font-weight:400}}
.modhd{{font-weight:700;color:var(--acc);font-size:16px;margin:26px 0 2px;border-bottom:1px dashed var(--line);padding-bottom:5px}}
.mermaid{{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;text-align:left;
box-shadow:0 3px 12px rgba(120,90,50,.06);overflow:auto;max-height:88vh;position:relative}}
.mermaid svg{{max-width:none!important;height:auto}}
.zoombar{{position:sticky;top:0;left:0;display:inline-flex;gap:4px;z-index:6;margin-bottom:8px}}
.zoombar button{{cursor:pointer;border:1px solid var(--line);background:var(--soft);color:var(--ink);border-radius:6px;width:32px;height:28px;font-size:16px;font-weight:700;line-height:1}}
.zoombar button:hover{{border-color:var(--acc);color:var(--acc)}}
table{{width:100%;border-collapse:collapse;font-size:16px;background:var(--card);
border:1px solid var(--line);border-radius:10px;overflow:hidden;margin:6px 0 4px}}
th,td{{padding:8px 11px;text-align:left;border-bottom:1px solid var(--line);vertical-align:top}}
th{{background:var(--soft);color:var(--ink);font-size:14px;white-space:nowrap}}
tr:last-child td{{border-bottom:none}}
code{{background:var(--soft);padding:1px 6px;border-radius:5px;font-size:14px}}
.foot{{margin-top:30px;font-size:13px;color:var(--mut);border-top:1px solid var(--line);padding-top:12px}}
{NAV_CSS}</style></head><body>{dc.nav_html("03")}<div class="wrap">

<div class="hd">系統分析設計（SA/SD）</div>
<h1>{a.get("system","")}</h1>
{f'<div class="summary">{a.get("summary","")}</div>' if a.get("summary") else ''}
<div class="stats">{a.get("stats","")}</div>

<div class="sec"><h2><span class="n">1</span>ER Model（實體關係圖）</h2>{ER_LEGEND}{mer(a.get("er_mermaid",""))}</div>

<div class="sec"><h2><span class="n">2</span>資料字典</h2>{dict_html}</div>

<div class="sec"><h2><span class="n">3</span>系統架構圖</h2>{mer(a.get("arch_mermaid",""))}</div>

{f'<div class="sec"><h2><span class="n">4</span>角色與權限（actors / RBAC）</h2>{a.get("roles_html","")}</div>' if a.get("roles_html") else ''}

<div class="sec"><h2><span class="n">5</span>API spec</h2>{a.get("api_html","")}</div>

{extra_html}

<div class="foot">由 sa-design skill 產出 · mermaid 圖可右鍵存圖 / 放網頁服務線上瀏覽。</div>

<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<script>
mermaid.initialize({{
  startOnLoad:true, theme:'base',
  er:{{useMaxWidth:false}}, flowchart:{{useMaxWidth:false}}, sequence:{{useMaxWidth:false}}, state:{{useMaxWidth:false}},
  themeVariables:{{ primaryColor:'#fffdf9', primaryBorderColor:'#e8833a', primaryTextColor:'#4a3f33',
    lineColor:'#b08a5a', secondaryColor:'#f3ebdd', tertiaryColor:'#f3ebdd', fontFamily:'Microsoft JhengHei,sans-serif' }}
}});
</script>
</div></body></html>'''

HTML = HTML.replace("</body>", DIAG_JS + TOC_JS + "</body>")
open(dst, "w", encoding="utf-8").write(HTML)
print("OK ->", os.path.abspath(dst))
