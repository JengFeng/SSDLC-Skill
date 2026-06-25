# -*- coding: utf-8 -*-
"""功能規格書(04)：fs_result.json (workflow 回傳 {fnlist, specs}) -> 暖色 HTML。"""
import json, sys, html
import doc_common as dc

src = sys.argv[1] if len(sys.argv) > 1 else "fs_result.json"
dst = sys.argv[2] if len(sys.argv) > 2 else "04_功能規格書.html"
R = json.load(open(src, encoding="utf-8"))
FL = R.get("fnlist", {})
specs = R.get("specs", []) or []
spec_by_fs = {s.get("fs_code"): s for s in specs if s.get("fs_code")}
spec_by_fn = {s.get("fn_code"): s for s in specs if s.get("fn_code")}

import os
# 讀 scr_result.json 取 FS→畫面(SCR) 對應，供嵌入模擬畫面截圖 screens/<SCR>.png
_fs2scr = {}
_sp = os.path.join(os.path.dirname(os.path.abspath(src)), "scr_result.json")
if os.path.exists(_sp):
    try:
        _sd = json.load(open(_sp, encoding="utf-8"))
        for _s in ((_sd.get("list") or {}).get("screens") or []):
            for _rf in (_s.get("related_fs") or []):
                _fs2scr.setdefault(_rf, []).append(_s.get("scr_code"))
    except Exception:
        pass


def esc(x):
    return html.escape(str(x if x is not None else "")).strip()


def cell(x):
    x = str(x if x is not None else "").strip()
    return esc(x) if x else "—"


def _msafe(s):
    s = str(s or "")
    for a, b in [('"', "”"), ("/", "／"), ("(", "（"), (")", "）"), ("[", "（"), ("]", "）"),
                 ("{", "（"), ("}", "）"), (":", "："), (";", "；"), (",", "，"), ("|", "｜")]:
        s = s.replace(a, b)
    s = s.strip()
    return (s[:30] + "…") if len(s) > 30 else s


def flow_diagram(steps):
    steps = [x for x in (steps or []) if str(x).strip()]
    if len(steps) < 2:
        return ""
    nodes = "\n    ".join(f's{i}["{i+1}. {_msafe(x)}"]' for i, x in enumerate(steps))
    edges = " --> ".join(f"s{i}" for i in range(len(steps)))
    return f'<div class="mermaid">\nflowchart TD\n    {nodes}\n    {edges}\n</div>'


modules = FL.get("fn_modules", [])
funcs = FL.get("functions", [])
body = []

# 1 系統功能結構
body.append('<div class="sec"><h2><span class="n">1</span>系統功能結構（FN 編碼）</h2>')
body.append('<p class="mut">編碼規則：FN 採「分類分段」—— FN1x／FN2x／FN3x… 各對應一個模組（非流水號）。</p>')
for m in modules:
    mc = m.get("fn_code", "")
    body.append(f'<h3>{esc(m.get("name") or mc)}</h3>')
    if m.get("note"):
        body.append(f'<p class="mut" style="font-size:14px">{esc(m.get("note"))}</p>')
    row = []
    for f in funcs:
        fc = f.get("fn_code", "")
        if fc.startswith(mc) and fc != mc:
            row.append(f'<a href="#{esc(f.get("fs_code"))}" style="text-decoration:none"><span class="tag fn">{esc(fc)}</span> {esc(f.get("name"))}</a>')
    if row:
        body.append('<div style="margin:4px 0 6px">' + "　".join(row) + "</div>")
body.append("</div>")

# 2 FN↔FS 對照
fmap = FL.get("fn_fs_map", [])
if fmap:
    body.append('<div class="sec"><h2><span class="n">2</span>FN ↔ FS 編碼對照表</h2><table><thead><tr><th>FN</th><th>FS</th><th>功能名稱</th></tr></thead><tbody>')
    for r in fmap:
        body.append(f'<tr><td><a href="#{esc(r.get("fs"))}"><code>{esc(r.get("fn"))}</code></a></td><td><a href="#{esc(r.get("fs"))}"><code>{esc(r.get("fs"))}</code></a></td><td>{cell(r.get("name"))}</td></tr>')
    body.append("</tbody></table></div>")

# 3 NFR
nfr = FL.get("nfr", [])
if nfr:
    body.append('<div class="sec"><h2><span class="n">3</span>非功能性需求（NFR）</h2><table><thead><tr><th>代碼</th><th>類別</th><th>需求</th></tr></thead><tbody>')
    for n in nfr:
        body.append(f'<tr><td><code>{esc(n.get("code"))}</code></td><td>{cell(n.get("category"))}</td><td>{cell(n.get("requirement"))}</td></tr>')
    body.append("</tbody></table></div>")

# 4 逐功能規格
body.append('<div class="sec"><h2><span class="n">4</span>功能規格明細（逐功能 · Use Case）</h2>')
for f in funcs:
    s = spec_by_fs.get(f.get("fs_code")) or spec_by_fn.get(f.get("fn_code")) or {}
    body.append(f'<div class="card fn" id="{esc(f.get("fs_code"))}">')
    body.append(f'<h3 style="margin-top:2px"><span class="tag fn">{esc(f.get("fn_code"))}</span> <code>{esc(f.get("fs_code"))}</code>　{esc(f.get("name"))}</h3>')
    body.append(f'<p>{esc(s.get("brief") or f.get("brief"))}</p>')
    for _sc in _fs2scr.get(f.get("fs_code"), [])[:2]:
        body.append(f'<img class="shot" src="screens/{esc(_sc)}.png" alt="模擬畫面" onerror="this.remove()">')
    rows = []
    actors = "、".join(s.get("actors", []) or [])
    if actors:
        rows.append(("使用者", esc(actors)))
    if s.get("pre_condition"):
        rows.append(("前置條件", esc(s.get("pre_condition"))))
    bf = s.get("basic_flow", []) or []
    if bf:
        rows.append(("主要流程", '<ol class="flow">' + "".join(f"<li>{esc(x)}</li>" for x in bf) + "</ol>"))
    if s.get("post_condition"):
        rows.append(("後置條件", esc(s.get("post_condition"))))
    if s.get("processing_logic"):
        rows.append(("處理邏輯", esc(s.get("processing_logic"))))
    if s.get("outputs"):
        rows.append(("輸出/產出", esc(s.get("outputs"))))
    if rows:
        body.append("<table><tbody>")
        for k, v in rows:
            body.append(f'<tr><th style="width:118px">{k}</th><td>{v}</td></tr>')
        body.append("</tbody></table>")
    _fd = flow_diagram(bf)
    if _fd:
        body.append('<div class="mut" style="font-size:14px;margin:8px 0 2px">流程圖</div>' + _fd)
    inp = s.get("inputs", []) or []
    if inp:
        body.append('<div class="mut" style="font-size:14px;margin:8px 0 2px">輸入欄位說明</div>')
        body.append("<table><thead><tr><th>欄位</th><th>說明</th><th>長度</th><th>R/W</th><th>預設</th><th>屬性</th><th>備註</th></tr></thead><tbody>")
        for x in inp:
            body.append("<tr><td><code>" + esc(x.get("field")) + "</code></td><td>" + cell(x.get("desc")) + "</td><td>" + cell(x.get("length")) + "</td><td>" + cell(x.get("rw")) + "</td><td>" + cell(x.get("default")) + "</td><td>" + cell(x.get("attr")) + "</td><td>" + cell(x.get("note")) + "</td></tr>")
        body.append("</tbody></table>")
    exc = s.get("exceptions", []) or []
    if exc:
        body.append('<div class="mut" style="font-size:14px;margin:8px 0 2px">例外處理</div><table><thead><tr><th>情境</th><th>處理方式</th></tr></thead><tbody>')
        for x in exc:
            body.append("<tr><td>" + cell(x.get("cond")) + "</td><td>" + cell(x.get("handling")) + "</td></tr>")
        body.append("</tbody></table>")
    rt = s.get("related_tables") or f.get("related_tables") or []
    ra = s.get("related_apis") or f.get("related_apis") or []
    rr = s.get("req_ref") or f.get("requirement_ref")
    rel = []
    if rt:
        rel.append("關聯資料表：" + " ".join('<span class="tag">' + esc(t) + "</span>" for t in rt))
    if ra:
        rel.append("關聯 API：" + " ".join("<code>" + esc(a) + "</code>" for a in ra))
    if rr:
        rel.append("需求追溯：<code>" + esc(rr) + "</code>")
    if rel:
        body.append('<div style="margin-top:8px;font-size:14px;line-height:1.9">' + "<br>".join(rel) + "</div>")
    body.append("</div>")
body.append("</div>")

# 5 需求追溯
body.append('<div class="sec"><h2><span class="n">5</span>需求追溯表（R → FN → FS）</h2><table><thead><tr><th>需求</th><th>FN</th><th>FS</th><th>功能</th></tr></thead><tbody>')
for f in funcs:
    body.append(f'<tr><td>{cell(f.get("requirement_ref"))}</td><td><code>{esc(f.get("fn_code"))}</code></td><td><code>{esc(f.get("fs_code"))}</code></td><td>{cell(f.get("name"))}</td></tr>')
body.append("</tbody></table></div>")

n_fn = len(funcs)
n_fs = len({f.get("fs_code") for f in funcs})
summary = FL.get("summary") or "本功能規格書承接 SA 系統分析設計的資料模型與 API，逐功能定義行為、輸入、處理邏輯與例外，工程師可照刻。"
if len(summary) > 240:
    summary = summary[:230] + "…"
stats = f"{len(modules)} 大模組 · {n_fn} 支功能(FN) · {n_fs} 份 FS"
out = dc.page("04", "功能規格書", summary, stats, "".join(body), "04", mermaid=True, version=FL.get("version", "v1.0 · 2026-06"))
open(dst, "w", encoding="utf-8").write(out)
print(f"OK -> {dst} | FN={n_fn} FS={n_fs} specs={len(specs)}")
