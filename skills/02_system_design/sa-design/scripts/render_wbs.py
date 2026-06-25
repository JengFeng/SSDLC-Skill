# -*- coding: utf-8 -*-
"""開發任務拆解 WBS(06)：wbs_result.json {phases,milestones,roles,total_pd,summary} -> 暖色 HTML。"""
import json, sys, html
import doc_common as dc

src = sys.argv[1] if len(sys.argv) > 1 else "wbs_result.json"
dst = sys.argv[2] if len(sys.argv) > 2 else "06_開發任務拆解WBS.html"
R = json.load(open(src, encoding="utf-8"))
phases = R.get("phases", []) or []
milestones = R.get("milestones", []) or []
roles = R.get("roles", []) or []


def esc(x):
    return html.escape(str(x if x is not None else "")).strip()


def cell(x):
    x = str(x if x is not None else "").strip()
    return esc(x) if x else "—"


def pd(x):
    try:
        v = float(x)
        return ("%g" % v)
    except Exception:
        return cell(x)


FS_DOC = dc.fname("04")  # 對應功能連到 04 功能規格（每張功能卡 id=<FS>）
# 全部 WBS 代碼集合：相依欄只把「真的存在的」任務碼做成同篇錨點連結
WBS_CODES = {str(t.get("wbs_code")).strip() for ph in phases for t in (ph.get("tasks") or []) if t.get("wbs_code")}


def wfmt(c):
    """數字開頭的 WBS 碼補 W 前綴顯示（1.1→W1.1）；已是字母碼(T1/A2)維持原樣。"""
    c = str(c if c is not None else "").strip()
    return ("W" + c) if c[:1].isdigit() else c


def dep_links(codes):
    out = []
    for c in (codes or []):
        c = str(c).strip()
        if not c:
            continue
        if c in WBS_CODES:
            out.append(f'<a href="#{esc(wfmt(c))}"><code>{esc(wfmt(c))}</code></a>')
        else:
            out.append(f"<code>{esc(wfmt(c))}</code>")
    return "、".join(out) if out else "—"


def fs_links(codes):
    cs = [str(c).strip() for c in (codes or []) if str(c).strip()]
    if not cs:
        return "—"
    return "、".join(f'<a href="{FS_DOC}#{esc(c)}"><code>{esc(c)}</code></a>' for c in cs)


body = []
total = R.get("total_pd")
if total is None:
    total = sum(float(t.get("effort_pd") or 0) for ph in phases for t in (ph.get("tasks") or []))

# 1 階段與任務
body.append('<div class="sec"><h2><span class="n">1</span>開發階段與任務拆解</h2>')
for i, ph in enumerate(phases, 1):
    ptot = sum(float(t.get("effort_pd") or 0) for t in (ph.get("tasks") or []))
    wk = ph.get("weeks")
    body.append(f'<h3>階段 {i}　{esc(ph.get("name"))} <small>{("· " + esc(wk)) if wk else ""} · 小計 {pd(ptot)} 人天</small></h3>')
    body.append("<table><thead><tr><th>WBS</th><th>任務</th><th>角色</th><th>人天</th><th>相依</th><th>對應功能</th><th>交付物</th></tr></thead><tbody>")
    for t in (ph.get("tasks") or []):
        wc = esc(wfmt(t.get("wbs_code")))
        body.append("<tr id='" + wc + "'><td><code>" + wc + "</code></td><td>" + cell(t.get("name")) + "</td><td>" + cell(t.get("role")) + "</td><td>" + pd(t.get("effort_pd")) + "</td><td class='mut'>" + dep_links(t.get("depends_on")) + "</td><td class='mut'>" + fs_links(t.get("related_fs")) + "</td><td>" + cell(t.get("deliverable")) + "</td></tr>")
    body.append("</tbody></table>")
body.append("</div>")

# 2 里程碑
if milestones:
    body.append('<div class="sec"><h2><span class="n">2</span>里程碑與驗收基準</h2><table><thead><tr><th>里程碑</th><th>週次</th><th>驗收基準</th></tr></thead><tbody>')
    for m in milestones:
        body.append("<tr><td><b>" + cell(m.get("name")) + "</b></td><td>" + cell(m.get("week")) + "</td><td>" + cell(m.get("criteria")) + "</td></tr>")
    body.append("</tbody></table></div>")

# 3 角色工時
if roles:
    body.append('<div class="sec"><h2><span class="n">3</span>角色人天配置</h2><table><thead><tr><th>角色</th><th>人天</th></tr></thead><tbody>')
    for r in roles:
        body.append("<tr><td>" + cell(r.get("role")) + "</td><td>" + pd(r.get("pd")) + "</td></tr>")
    body.append(f"<tr><td><b>合計</b></td><td><b>{pd(total)}</b></td></tr>")
    body.append("</tbody></table></div>")

summary = R.get("summary") or "本 WBS 依 SDLC 階段把本系統的各功能拆為可排程、可估時、可追相依的開發任務。"
if len(summary) > 240:
    summary = summary[:230] + "…"
stats = f"{len(phases)} 階段 · {sum(len(ph.get('tasks') or []) for ph in phases)} 任務 · 約 {pd(total)} 人天 · {len(milestones)} 里程碑"
out = dc.page("06", "開發任務拆解 WBS", summary, stats, "".join(body), "06")
open(dst, "w", encoding="utf-8").write(out)
print(f"OK -> {dst} | phases={len(phases)} total_pd={pd(total)}")
