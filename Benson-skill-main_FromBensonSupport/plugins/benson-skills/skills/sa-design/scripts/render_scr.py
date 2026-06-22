# -*- coding: utf-8 -*-
"""畫面規格書(05)：scr_result.json {list:{screens}, specs[]} -> 暖色 HTML。"""
import json, sys, html
import doc_common as dc

src = sys.argv[1] if len(sys.argv) > 1 else "scr_result.json"
dst = sys.argv[2] if len(sys.argv) > 2 else "05_畫面規格書.html"
R = json.load(open(src, encoding="utf-8"))
screens = (R.get("list") or {}).get("screens") or R.get("screens") or []
specs = R.get("specs", []) or []
spec_by = {s.get("scr_code"): s for s in specs if s.get("scr_code")}

import os
# 讀 fs_result.json 建 FS→相關資料表 對映：畫面層只顯示「碰到哪幾張表」總覽，
# 欄位級對應仍由下方「畫面元素→API→資料表.欄位」負責，兩者摘要 vs 明細不重複。
_fs2tbl = {}
_fp = os.path.join(os.path.dirname(os.path.abspath(src)), "fs_result.json")
if os.path.exists(_fp):
    try:
        _fd = json.load(open(_fp, encoding="utf-8"))
        _specs = _fd.get("specs", []) or []
        _byfs = {x.get("fs_code"): x for x in _specs if x.get("fs_code")}
        for _f in (_fd.get("fnlist", {}).get("functions", []) or []):
            _c = _f.get("fs_code")
            _t = (_byfs.get(_c, {}).get("related_tables")) or _f.get("related_tables") or []
            if _c and _t:
                _fs2tbl[_c] = _t
    except Exception:
        pass


def scr_tables(sc):
    """聚合此畫面對應 FS 的相關資料表（去重保序）。"""
    seen, out = set(), []
    for rf in (sc.get("related_fs") or []):
        for t in _fs2tbl.get(rf, []) or []:
            if t not in seen:
                seen.add(t); out.append(t)
    return out


def esc(x):
    return html.escape(str(x if x is not None else "")).strip()


def cell(x):
    x = str(x if x is not None else "").strip()
    return esc(x) if x else "—"


def fs_links(codes):
    """把 FS 代碼連到 04 功能規格書對應錨點（render_fs 每張功能卡 id=<FS>）。"""
    codes = [c for c in (codes or []) if str(c).strip()]
    if not codes:
        return "—"
    return "、".join(f'<a href="04_功能規格書.html#{esc(c)}"><code>{esc(c)}</code></a>' for c in codes)


body = []
# 1 畫面清單
body.append('<div class="sec"><h2><span class="n">1</span>畫面清單（SCR ↔ FS ↔ API）</h2><table><thead><tr><th>SCR</th><th>畫面名稱</th><th>端</th><th>對應功能 FS</th><th>雛形對照</th></tr></thead><tbody>')
for sc in screens:
    body.append(f'<tr><td><a href="#{esc(sc.get("scr_code"))}"><code>{esc(sc.get("scr_code"))}</code></a></td><td>{cell(sc.get("name"))}</td><td>{cell(sc.get("end"))}</td><td>{fs_links(sc.get("related_fs"))}</td><td class="mut">{cell(sc.get("prototype_ref"))}</td></tr>')
body.append("</tbody></table></div>")

# 2 逐畫面規格
body.append('<div class="sec"><h2><span class="n">2</span>畫面規格明細（逐畫面 · 逐元素）</h2>')
for sc in screens:
    s = spec_by.get(sc.get("scr_code")) or {}
    body.append(f'<div class="card fn" id="{esc(sc.get("scr_code"))}">')
    body.append(f'<h3 style="margin-top:2px"><code>{esc(sc.get("scr_code"))}</code>　{esc(sc.get("name"))}</h3>')
    body.append(f'<p>{esc(s.get("brief") or sc.get("brief"))}</p>')
    body.append(f'<img class="shot" src="screens/{esc(sc.get("scr_code"))}.png" alt="模擬畫面" onerror="this.remove()">')
    # 畫面層摘要（每畫面都顯示）：對應功能(連 04) / 關聯 API / 相關資料表(由 FS 聚合)
    ra = sc.get("related_apis", []) or []
    tbls = scr_tables(sc)
    meta = []
    if sc.get("related_fs"):
        meta.append("對應功能：" + fs_links(sc.get("related_fs")))
    if ra:
        meta.append("關聯 API：" + " ".join("<code>" + esc(a) + "</code>" for a in ra))
    if tbls:
        meta.append("相關資料表：" + " ".join('<span class="tag">' + esc(t) + "</span>" for t in tbls))
    if sc.get("prototype_ref"):
        meta.append('<span class="mut">雛形對照：' + esc(sc.get("prototype_ref")) + "</span>")
    if meta:
        body.append('<div style="font-size:13.5px;line-height:1.9">' + "<br>".join(meta) + "</div>")
    if s.get("layout"):
        body.append(f'<p class="mut" style="font-size:14px"><b>版面</b>：{esc(s.get("layout"))}</p>')
    els = s.get("elements", []) or []
    if els:
        body.append("<table><thead><tr><th>元素</th><th>元件型別</th><th>必填</th><th>資料來源/綁定</th><th>驗證</th><th>互動行為</th></tr></thead><tbody>")
        for e in els:
            body.append("<tr><td>" + cell(e.get("name")) + "</td><td>" + cell(e.get("type")) + "</td><td>" + cell(e.get("required")) + "</td><td>" + cell(e.get("source_binding")) + "</td><td>" + cell(e.get("validation")) + "</td><td>" + cell(e.get("interaction")) + "</td></tr>")
        body.append("</tbody></table>")
    em = s.get("element_api_map", []) or []
    if em:
        body.append('<div class="mut" style="font-size:14px;margin:8px 0 2px">畫面元素 → API → 資料表.欄位</div>')
        body.append("<table><thead><tr><th>元素</th><th>API</th><th>資料表.欄位</th></tr></thead><tbody>")
        for m in em:
            body.append("<tr><td>" + cell(m.get("element")) + "</td><td><code>" + esc(m.get("api")) + "</code></td><td>" + cell(m.get("table_field")) + "</td></tr>")
        body.append("</tbody></table>")
    if s.get("after_submit"):
        body.append(f'<div style="margin-top:6px;font-size:14px"><b>送出後行為</b>：{esc(s.get("after_submit"))}</div>')
    body.append("</div>")
body.append("</div>")

n = len(screens)
summary = f"本畫面規格書逐畫面、逐元素定義本系統 {n} 個畫面的元件型別、資料綁定、驗證與互動，並附「畫面元素→API→資料表.欄位」對應，前端工程師可照刻。"
stats = f"{n} 個畫面 · 逐元素規格"
out = dc.page("05", "畫面規格書", summary, stats, "".join(body), "05")
open(dst, "w", encoding="utf-8").write(out)
print(f"OK -> {dst} | screens={n} specs={len(specs)}")
