# -*- coding: utf-8 -*-
"""SA 送審文件套件 共用：暖色樣式 + 頂部導覽列(單一入口) + 頁面外殼。
所有 render_*.py 共用。系統名讀環境變數 SA_SUITE_TITLE（無則用預設）。
檔名採「編號」通用命名，與專案無關，可直接複用。"""
import os, html

SYSTEM_TITLE = os.environ.get("SA_SUITE_TITLE", "（系統名）")

# (編號, 顯示名, 檔名/相對路徑, 是否外部檔)
# 01 需求書、02 雛形 多為既有檔，預設指向專案相對路徑，可於各案調整。
NAV = [
    ("00a", "開發看板", "00a_開發任務看板.html", False),
    ("00b", "SRS整合", "00b_軟體需求規格書SRS.html", False),
    ("00c", "文件健檢", "00c_文件健檢報告.html", False),
    ("01", "需求說明書", "01_需求說明書.pdf", True),
    ("02", "雛形畫面", "02_雛形畫面.html", True),
    ("03", "SA分析", "03_SA系統分析設計.html", False),
    ("04", "功能規格", "04_功能規格書.html", False),
    ("05", "畫面規格", "05_畫面規格書.html", False),
    ("06", "開發WBS", "06_開發任務拆解WBS.html", False),
    ("07", "測試計畫", "07_測試計畫.html", False),
    ("08", "測試案例", "08_測試案例.html", False),
    ("09", "驗收文件", "09_驗收文件.html", False),
]


def fname(code):
    for no, _n, fn, _e in NAV:
        if no == code:
            return fn
    return ""


# 文件相依關係（本套件固定鏈；上游＝輸入自、下游＝被誰引用、追溯碼＝本文件產出的編碼）。
# 總覽(00 portal)與開發看板(00 board)共用同一份，避免兩邊各維護而走鐘。
DEPS = [
    ("01", "需求說明書", "甲方需求／訪談", "03、04", "R（需求碼）"),
    ("02", "雛形畫面", "01", "05", "—（畫面雛形）"),
    ("03", "SA 系統分析設計", "01、02", "04、05、06、07~09、00b", "資料模型／API／資料表"),
    ("04", "功能規格書", "03", "05、06、07~09、00a 看板", "FN／FS"),
    ("05", "畫面規格書", "02、04", "06、07~09、00a 看板", "SCR"),
    ("06", "開發任務拆解 WBS", "04、05", "（排程基準）", "WBS 任務"),
    ("07", "測試計畫", "04、05", "08、09", "測試策略／範圍"),
    ("08", "測試案例", "04、05、07", "00b 追溯", "TC（測試案例）"),
    ("09", "驗收文件", "08", "送審驗收", "UAT／簽核"),
    ("00b", "SRS（整合）", "01、03、04、05、08", "送審", "整合·R→FN→FS→TC"),
    ("00c", "文件健檢", "01～09 全部", "品質佐證", "稽核結果"),
    ("00a", "開發任務看板", "04、05、08", "工程師日常操作", "T0-x／沿用 FS"),
]


# 全套件的編碼／代號圖例（追溯鏈 R→FN→FS→SCR→TC 為脊椎；各碼的意義/出處/範例）。
# 看板與總覽共用，讓第一次看的工程師不必猜代號。
CODE_LEGEND = [
    ("R", "需求項——一切追溯的起點", "01 需求書 ▸ 各文件回溯", "R-01"),
    ("FN", "功能模組／功能（FN1x 各代表一個模組，非流水號）", "04 功能規格", "FN11"),
    ("FS", "功能規格項——一支功能一碼，工程師照刻的最小單位", "04 功能規格", "FS-001"),
    ("SCR", "畫面——一個畫面一碼", "05 畫面規格", "SCR-P01"),
    ("TC", "測試案例", "08 測試案例", "TC-001"),
    ("UAT", "使用者驗收情境（各角色實機驗收）", "09 驗收文件", "UAT-01"),
    ("NFR", "非功能性需求（效能／安全／可用性等）", "04 ／ SRS", "NFR-01"),
    ("T0-x", "地基任務——建資料表／API 骨架，全部接這層，最先做", "00a 開發看板", "T0-1"),
    ("W#.#", "WBS 開發任務——可排程／估時／追相依", "06 WBS", "W1.1"),
    ("表名前綴", "資料表命名：模組前綴_用途；跨模組共用表用全域前綴", "03 SA 資料字典", "INSP_／SATIS_／GLOBAL_"),
]


def legend_table():
    """編碼／代號圖例 HTML。"""
    rows = ['<table><thead><tr><th style="width:78px">代號</th><th>意義</th>'
            '<th>出自／用於</th><th>範例</th></tr></thead><tbody>']
    for code, mean, where, ex in CODE_LEGEND:
        rows.append(f'<tr><td><code>{html.escape(code)}</code></td><td>{html.escape(mean)}</td>'
                    f'<td class="mut">{html.escape(where)}</td><td><code>{html.escape(ex)}</code></td></tr>')
    rows.append("</tbody></table>")
    return "".join(rows)


def dep_table():
    """文件相依關係表 HTML（誰依賴誰 · 各文件產出的追溯碼）。"""
    rows = ['<table><thead><tr><th style="width:62px">文件</th><th>名稱</th>'
            '<th>依賴（輸入自 ▸ 上游）</th><th>被誰使用（下游 ▸）</th><th>產出追溯碼</th></tr></thead><tbody>']
    for no, title, up, down, code in DEPS:
        rows.append(f'<tr><td><code>{no}</code></td><td>{html.escape(title)}</td>'
                    f'<td class="mut">{html.escape(up)}</td><td class="mut">{html.escape(down)}</td>'
                    f'<td><code>{html.escape(code)}</code></td></tr>')
    rows.append("</tbody></table>")
    return "".join(rows)


CSS = """
:root{--bg:#fbf6ee;--card:#fffdf9;--ink:#4a3f33;--mut:#9a8b78;--acc:#e8833a;--line:#ece1d2;--soft:#f3ebdd;
--ok:#5b8c5a;--warn:#c9962e;--bad:#c2562f;}
*{box-sizing:border-box}
[id]{scroll-margin-top:64px}
body{margin:0;background:var(--bg);color:var(--ink);font:18px/1.65 "Segoe UI","PingFang TC","Microsoft JhengHei",sans-serif}
.nav{position:sticky;top:0;z-index:50;background:rgba(251,246,238,.96);backdrop-filter:blur(6px);
border-bottom:1px solid var(--line);padding:8px 14px;display:flex;flex-wrap:wrap;gap:5px;align-items:center;
box-shadow:0 2px 10px rgba(120,90,50,.05)}
.nav .home{font-weight:700;color:var(--acc);margin-right:6px;text-decoration:none;font-size:16px}
.nav a.item{display:inline-flex;align-items:center;gap:5px;text-decoration:none;color:var(--ink);
background:var(--card);border:1px solid var(--line);border-radius:999px;padding:4px 11px;font-size:14px;white-space:nowrap}
.nav a.item .no{color:var(--mut);font-weight:700;font-size:12px}
.nav a.item:hover{border-color:var(--acc);color:var(--acc)}
.nav a.item.active{background:var(--acc);color:#fff;border-color:var(--acc)}
.nav a.item.active .no{color:#ffe6d2}
.nav a.item.ext::after{content:"↗";font-size:11px;color:var(--mut)}
.wrap{max-width:1560px;width:94%;margin:0 auto;padding:22px 22px 70px}
@media(min-width:1180px){.wrap{padding-right:232px}}
.hd{color:var(--mut);font-size:14px;letter-spacing:.5px}
h1{font-size:27px;margin:4px 0 6px}
.summary{background:var(--card);border:1px solid var(--line);border-radius:14px;
padding:15px 20px;font-size:19px;box-shadow:0 4px 16px rgba(120,90,50,.06);margin:12px 0 6px}
.stats{color:var(--acc);font-weight:700;font-size:16px;margin-bottom:18px}
.sec{margin-top:28px}
.sec h2{font-size:20px;border-bottom:2px solid var(--line);padding-bottom:7px;margin-bottom:14px}
.sec h2 .n{display:inline-block;background:var(--acc);color:#fff;min-width:28px;height:28px;line-height:28px;
text-align:center;border-radius:14px;font-size:14px;margin-right:8px;padding:0 6px}
h3{font-size:18px;color:var(--acc);margin:20px 0 6px}
h3 small{color:var(--mut);font-weight:400}
table{width:100%;border-collapse:collapse;font-size:16px;background:var(--card);
border:1px solid var(--line);border-radius:10px;overflow:hidden;margin:6px 0 10px}
th,td{padding:8px 11px;text-align:left;border-bottom:1px solid var(--line);vertical-align:top}
th{background:var(--soft);color:var(--ink);font-size:14px;white-space:nowrap}
tr:last-child td{border-bottom:none}
code{background:var(--soft);padding:1px 6px;border-radius:5px;font-size:14px}
.card{background:var(--card);border:1px solid var(--line);border-radius:13px;padding:16px 18px;margin:12px 0;
box-shadow:0 3px 12px rgba(120,90,50,.05)}
.card.fn{}
.shot{max-width:300px;width:100%;border:1px solid var(--line);border-radius:10px;box-shadow:0 3px 12px rgba(120,90,50,.08);margin:8px 0;display:block}
.tag{display:inline-block;background:var(--soft);color:var(--ink);border-radius:6px;padding:1px 8px;font-size:13px;margin:1px 3px 1px 0}
.tag.fn{background:#fdebdb;color:#b5611f;font-weight:700}
.flow{margin:4px 0 4px 4px;padding-left:18px}
.flow li{margin:3px 0}
.mut{color:var(--mut)}
.pill{display:inline-block;border-radius:999px;padding:2px 10px;font-size:13px;font-weight:700}
.pill.ok{background:#e7f0e3;color:var(--ok)} .pill.warn{background:#f7eccf;color:var(--warn)} .pill.bad{background:#f6ddcf;color:var(--bad)}
.mermaid{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;text-align:left;
box-shadow:0 3px 12px rgba(120,90,50,.06);overflow:auto;max-height:88vh;position:relative}
.mermaid svg{max-width:none!important;height:auto}
.zoombar{position:sticky;top:0;left:0;display:inline-flex;gap:4px;z-index:6;margin-bottom:8px}
.zoombar button{cursor:pointer;border:1px solid var(--line);background:var(--soft);color:var(--ink);border-radius:6px;width:32px;height:28px;font-size:16px;font-weight:700;line-height:1}
.zoombar button:hover{border-color:var(--acc);color:var(--acc)}
.foot{margin-top:34px;font-size:13px;color:var(--mut);border-top:1px solid var(--line);padding-top:12px}
"""


def nav_html(active):
    parts = ['<div class="nav">']
    for no, name, href, ext in NAV:
        cls = "item" + (" active" if no == active else "") + (" ext" if ext else "")
        parts.append(f'<a class="{cls}" href="{html.escape(href)}"><span class="no">{no}</span>{html.escape(name)}</a>')
    parts.append("</div>")
    return "".join(parts)


TOC_JS = '''<style>
.toc-float{position:fixed;top:62px;right:14px;width:200px;max-height:80vh;overflow:auto;background:#fffdf9;
border:1px solid #ece1d2;border-radius:12px;padding:10px 12px;font-size:13px;box-shadow:0 4px 16px rgba(120,90,50,.12);z-index:40}
.toc-float .tch{font-weight:700;color:#e8833a;margin-bottom:6px}
.toc-float a{display:block;text-decoration:none;color:#4a3f33;padding:3px 7px;border-radius:6px;line-height:1.35;margin:1px 0}
.toc-float a:hover{background:#f3ebdd;color:#e8833a}
.toc-float a.on{background:#e8833a;color:#fff}
.toc-float a.l1{font-weight:600}
.toc-float a.l2{padding-left:20px;font-size:12px;color:#9a8b78}
@media(max-width:1180px){.toc-float{display:none}}
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


def page(doc_no, doc_title, summary, stats, body, active, mermaid=False, version="v1.0"):
    mer = ""
    if mermaid:
        mer = """<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<script>mermaid.initialize({startOnLoad:true,theme:'base',
er:{useMaxWidth:false},flowchart:{useMaxWidth:false},sequence:{useMaxWidth:false},state:{useMaxWidth:false},
themeVariables:{primaryColor:'#fffdf9',primaryBorderColor:'#e8833a',primaryTextColor:'#4a3f33',
lineColor:'#b08a5a',secondaryColor:'#f3ebdd',tertiaryColor:'#f3ebdd',fontFamily:'Microsoft JhengHei,sans-serif'}});
window.addEventListener('load',function(){function openFull(svg,ti){var w=window.open('','_blank');if(!w)return;var c=svg.cloneNode(true);c.removeAttribute('width');c.removeAttribute('height');c.style.width='100%';c.style.height='100%';var d='<!doctype html><meta charset="utf-8"><title>'+(ti||'圖')+'</title><style>html,body{margin:0;height:100%;background:#fbf6ee;overflow:hidden}#bx{width:100vw;height:100vh}.hint{position:fixed;top:10px;left:12px;z-index:9;background:#fffdf9;border:1px solid #ece1d2;border-radius:8px;padding:5px 11px;font:13px Microsoft JhengHei,sans-serif;color:#4a3f33}</style><div class="hint">滾輪縮放／拖曳平移／右上控制鈕</div><div id="bx">'+c.outerHTML+'</div><scr'+'ipt src="https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/dist/svg-pan-zoom.min.js"></scr'+'ipt><scr'+'ipt>window.onload=function(){var e=document.querySelector("#bx svg");if(window.svgPanZoom)svgPanZoom(e,{controlIconsEnabled:true,fit:true,center:true,minZoom:0.2,maxZoom:30});};</scr'+'ipt>';w.document.write(d);w.document.close();}document.querySelectorAll('.mermaid').forEach(function(m){var svg=m.querySelector('svg');if(!svg)return;var w0=(svg.viewBox&&svg.viewBox.baseVal&&svg.viewBox.baseVal.width)||svg.getBoundingClientRect().width;var s=1;function apply(){svg.style.width=(w0*s)+'px';svg.style.height='auto';svg.style.maxWidth='none';}var bar=document.createElement('div');bar.className='zoombar';bar.innerHTML='<button title="縮小">－</button><button title="重設">⟳</button><button title="放大">＋</button><button title="全螢幕另開" style="width:auto;padding:0 9px">⛶ 全螢幕</button>';var b=bar.querySelectorAll('button');b[0].onclick=function(){s=Math.max(s-0.25,0.4);apply();};b[1].onclick=function(){s=1;apply();};b[2].onclick=function(){s=Math.min(s+0.25,4);apply();};var ti='';var sec=m.closest('.sec');if(sec){var h2=sec.querySelector('h2');if(h2)ti=h2.textContent.trim();}b[3].onclick=function(){openFull(svg,ti);};m.prepend(bar);apply();});});</script>"""
    sm = f'<div class="summary">{summary}</div>' if summary else ""
    st = f'<div class="stats">{stats}</div>' if stats else ""
    return f"""<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(doc_title)}｜{html.escape(SYSTEM_TITLE)}</title><style>{CSS}</style></head><body>
{nav_html(active)}
<div class="wrap">
<div class="hd">{html.escape(SYSTEM_TITLE)} · 系統開發文件套件 · {version}</div>
<h1>{doc_no}　{html.escape(doc_title)}</h1>
{sm}{st}
{body}
<div class="foot">{html.escape(SYSTEM_TITLE)} 開發文件套件 · 由 sa-design 技能產出 · 全套錨定同一資料模型 · 放網頁服務即可線上瀏覽。</div>
</div>{mer}{TOC_JS}</body></html>"""
