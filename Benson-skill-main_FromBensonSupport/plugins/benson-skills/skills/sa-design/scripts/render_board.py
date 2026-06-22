# -*- coding: utf-8 -*-
"""★ 開發任務看板（00）：把功能清單變成可追蹤任務 + 直連各文件段落。
這是「操作層」——讓工程師知道『現在做哪個任務、看哪份文件』，是完整套件的必出項。

用法: python render_board.py [functions.json] [輸出.html]
functions.json = 功能規格產出的 {fnlist:{functions[],fn_modules[]}, specs[]}（與 render_fs.py 同源）。
可選同目錄 screens.json / tests.json 供深連 05/07（無則略過該連結）。

前提：04/05 規格文件渲染時要對每支功能/畫面加錨點 id（id=FS_code / id=SCR_code），看板才能深連到段落。
"""
import json, sys, html, os
from collections import Counter
import doc_common as dc


def load(p):
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return {}


SRC = sys.argv[1] if len(sys.argv) > 1 else "fs_result.json"
DST = sys.argv[2] if len(sys.argv) > 2 else "00a_開發任務看板.html"
D = load(SRC)
fl = D.get("fnlist", D)
funcs = fl.get("functions", [])
modules = fl.get("fn_modules", [])

# 可選：畫面 / 測試 來源（供深連）
base = os.path.dirname(os.path.abspath(SRC))
screens = (load(os.path.join(base, "scr_result.json")).get("list") or {}).get("screens") \
    or (load(os.path.join(base, "screens.json")).get("list") or {}).get("screens") or []
tcs = load(os.path.join(base, "test_result.json")).get("test_cases") \
    or load(os.path.join(base, "tests.json")).get("test_cases") or []

fs2scr = {}
for sc in screens:
    for rf in (sc.get("related_fs") or []):
        fs2scr.setdefault(rf, []).append(sc.get("scr_code"))
fs2tc = Counter(t.get("fs_code") for t in tcs)

SA, FS_DOC, SCR_DOC, TC_DOC = dc.fname("03"), dc.fname("04"), dc.fname("05"), dc.fname("08")


def esc(x):
    return html.escape(str(x if x is not None else "")).strip()


EXTRA_CSS = """
.bar{position:sticky;top:46px;z-index:40;background:var(--card);border:1px solid var(--line);border-radius:12px;
padding:10px 16px;margin:10px 0 16px;font-size:16px;font-weight:700;box-shadow:0 3px 12px rgba(120,90,50,.06)}
.bar .seg{display:inline-block;margin-right:14px}
.btodo{color:var(--mut)} .bdo{color:var(--warn)} .bdone{color:var(--ok)}
table.bd{width:100%;border-collapse:collapse;font-size:15px;background:var(--card);border:1px solid var(--line);
border-radius:10px;overflow:hidden;margin:6px 0 18px}
table.bd th,table.bd td{padding:9px 11px;border-bottom:1px solid var(--line);vertical-align:middle;text-align:left}
table.bd th{background:var(--soft);font-size:13px;white-space:nowrap}
.stbtn{cursor:pointer;user-select:none;border:none;border-radius:999px;padding:5px 13px;font-size:13.5px;font-weight:700;white-space:nowrap;min-width:74px}
.st0{background:#eee6da;color:#9a8b78} .st1{background:#f7eccf;color:#b5811f} .st2{background:#e2efdd;color:#4f7a4e}
.dlink{display:inline-block;text-decoration:none;background:var(--soft);color:#b5611f;border-radius:6px;padding:2px 9px;font-size:12.5px;margin:1px 3px 1px 0;white-space:nowrap}
.dlink:hover{background:var(--acc);color:#fff}
.tnm{font-weight:600}
.ttag{display:inline-block;background:var(--soft);color:var(--mut);border-radius:5px;padding:1px 6px;font-size:11.5px;margin:1px 2px 1px 0}
"""

body = [f"<style>{EXTRA_CSS}</style>"]
body.append('<div class="bar" id="bar">載入進度…</div>')
body.append('<p class="mut" style="font-size:15px">用法：左欄狀態可點切換 <b>待開發 → 開發中 → 完成</b>（記在你瀏覽器，不上傳）；右欄連結直接跳到該功能的規格段落。<b>由上往下做</b>就是開工順序。</p>')


def stbtn(key):
    return f'<button class="stbtn st0" data-k="{esc(key)}">待開發</button>'


# 代號說明（可收合）：第一次看的工程師不用猜 FN/FS/SCR/TC/W#.# 是什麼
body.append('<details style="margin:6px 0 8px;background:var(--card);border:1px solid var(--line);'
            'border-radius:12px;padding:6px 14px">'
            '<summary style="cursor:pointer;font-weight:700;font-size:16px;padding:6px 0">'
            '🔖 代號說明（FN／FS／SCR／TC／T0-x／W#.# 是什麼）</summary>'
            '<p class="mut" style="font-size:14px;margin:6px 0">追溯脊椎：'
            '<code>R</code>需求 → <code>FN/FS</code>功能 → <code>SCR</code>畫面 → <code>TC</code>測試，'
            '同一條鏈把各文件串起來。</p>'
            + dc.legend_table() + '</details>')

# 文件相依（可收合）：工程師改某份文件前，先看會牽動哪些下游
body.append('<details style="margin:6px 0 14px;background:var(--card);border:1px solid var(--line);'
            'border-radius:12px;padding:6px 14px">'
            '<summary style="cursor:pointer;font-weight:700;font-size:16px;padding:6px 0">'
            '📑 文件相依關係（改了上游 → 回看下游）</summary>'
            '<p class="mut" style="font-size:14px;margin:6px 0">追溯鏈：'
            '<code>R</code>需求 → <code>FN/FS</code>功能 → <code>SCR</code>畫面 → <code>TC</code>測試。'
            '例：03 SA 資料模型一動，04／05／06／07 都要回看。</p>'
            + dc.dep_table() + '</details>')

# 群組 0：地基（資料庫 + API 骨架，出自 03 SA）
body.append('<div class="sec"><h2><span class="n">0</span>地基：建資料庫與 API 骨架 <small>（先做，全部接這層）</small></h2>')
body.append('<table class="bd"><thead><tr><th style="width:96px">狀態</th><th>任務</th><th>做什麼</th><th>看哪份</th></tr></thead><tbody>')
for code, name, what in [
    ("T0-1", "建立資料表", "照 03 SA「資料字典」逐表 CREATE TABLE（型別/長度/PK-FK 都標好）"),
    ("T0-2", "Seed 字典資料", "把受控清單（程度/方式/頻率/面向等字典表）建初始資料"),
    ("T0-3", "建 API 骨架＋認證", "照 03 API spec scaffold controllers/DTO，統一回傳，依角色認證"),
]:
    body.append(f'<tr><td>{stbtn(code)}</td><td><code>{code}</code></td>'
                f'<td><span class="tnm">{esc(name)}</span><br><span class="mut" style="font-size:13px">{esc(what)}</span></td>'
                f'<td><a class="dlink" href="{SA}">03 SA ▸</a></td></tr>')
body.append("</tbody></table></div>")

# 功能任務（依 fn_modules 分群；無則整批）
groups = []
if modules:
    for m in modules:
        mc = m.get("fn_code", "")
        items = [f for f in funcs if (f.get("module") == m.get("name")) or (f.get("fn_code", "").startswith(mc) and f.get("fn_code") != mc)]
        if items:
            groups.append((m.get("name") or mc, items))
else:
    groups.append(("功能任務", funcs))

n = 0
for gname, items in groups:
    n += 1
    body.append(f'<div class="sec"><h2><span class="n">{n}</span>{esc(gname)} <small>（{len(items)} 個功能任務）</small></h2>')
    body.append('<table class="bd"><thead><tr><th style="width:96px">狀態</th><th>FN/FS</th><th>功能任務</th><th>看哪份文件</th></tr></thead><tbody>')
    for f in items:
        fs, fn = f.get("fs_code"), f.get("fn_code")
        links = [f'<a class="dlink" href="{FS_DOC}#{esc(fs)}">04 行為 ▸</a>']
        for sc in fs2scr.get(fs, []):
            links.append(f'<a class="dlink" href="{SCR_DOC}#{esc(sc)}">05 {esc(sc)} ▸</a>')
        ntc = fs2tc.get(fs, 0)
        links.append(f'<a class="dlink" href="{TC_DOC}">08 測試{("·" + str(ntc) + "案") if ntc else ""} ▸</a>')
        tbls = "".join(f'<span class="ttag">{esc(t)}</span>' for t in (f.get("related_tables") or [])[:6])
        body.append(f'<tr><td>{stbtn(fs)}</td><td><code>{esc(fn)}</code><br><code>{esc(fs)}</code></td>'
                    f'<td><span class="tnm">{esc(f.get("name"))}</span><br>{tbls}</td>'
                    f'<td>{"".join(links)}</td></tr>')
    body.append("</tbody></table></div>")

body.append("""
<script>
const KEY='sa_dev_status_'+location.pathname;
const S=JSON.parse(localStorage.getItem(KEY)||'{}');
const ST=[['待開發','st0'],['開發中','st1'],['完成','st2']];
function paint(el){const i=S[el.dataset.k]||0;el.textContent=ST[i][0];el.className='stbtn '+ST[i][1];}
function bar(){const els=document.querySelectorAll('.stbtn');let d=0,p=0;els.forEach(e=>{const i=S[e.dataset.k]||0;if(i===2)d++;else if(i===1)p++;});
document.getElementById('bar').innerHTML='<span class="seg bdone">✅ 完成 '+d+'</span><span class="seg bdo">🔨 開發中 '+p+'</span><span class="seg btodo">⏳ 待開發 '+(els.length-d-p)+'</span><span class="seg">／ 共 '+els.length+' 任務</span>';}
document.querySelectorAll('.stbtn').forEach(el=>{paint(el);el.onclick=()=>{S[el.dataset.k]=((S[el.dataset.k]||0)+1)%3;localStorage.setItem(KEY,JSON.stringify(S));paint(el);bar();};});
bar();
</script>
""")

ntotal = len(funcs) + 3
summary = f'🗂 把規格變任務：共 {ntotal} 個開發任務（3 地基 + {len(funcs)} 功能）。由上往下做，狀態可點、進度存瀏覽器；每列直連該功能的 04 行為／05 畫面／08 測試。'
stats = f"{ntotal} 個任務 · 地基 3 + 功能 {len(funcs)} · 點狀態追蹤進度"
out = dc.page("00a", "開發任務看板", summary, stats, "".join(body), "00a")
open(DST, "w", encoding="utf-8").write(out)
print(f"OK -> {DST} | {ntotal} 任務（{len(groups)} 群組）")
