# -*- coding: utf-8 -*-
"""00b 軟體需求規格書 SRS（整合 01/03/04/05，依機關查檢表章節）。純組裝既有資料。"""
import json, html
import doc_common as dc


def load(p):
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return {}


fs = load("fs_result.json"); fl = fs.get("fnlist", {})
model = load("result.json").get("model", {})
spec = load("sa_spec.json")
scr = load("scr_result.json"); screens = (scr.get("list") or {}).get("screens") or []
tst = load("test_result.json")
funcs = fl.get("functions", []); modules = fl.get("fn_modules", []); nfr = fl.get("nfr", [])


def esc(x):
    return html.escape(str(x if x is not None else "")).strip()


def cell(x):
    x = str(x if x is not None else "").strip()
    return esc(x) if x else "—"


body = []


def h(n, t):
    body.append(f'<div class="sec"><h2><span class="n">{n}</span>{t}</h2>')


def he():
    body.append("</div>")


h("1", "前言")
body.append("<p><b>1.1 文件目的</b>：本文件為本系統的軟體需求規格書（SRS），整合需求說明書、系統分析設計、功能規格書、畫面規格書，供開發團隊掌握設計方向、供機關審查需求涵蓋。</p>")
body.append("<p><b>1.2 文件使用者</b>：機關承辦（審查／驗收）、系統分析師、前端／後端工程師、測試人員。</p>")
body.append('<p><b>1.3 相關文件</b>：'
            '<a href="01_需求說明書.pdf">01 需求說明書</a> · '
            '<a href="../互動雛形/index.html">02 雛形畫面</a> · '
            '<a href="03_SA系統分析設計.html">03 SA 系統分析設計</a> · '
            '<a href="04_功能規格書.html">04 功能規格書</a> · '
            '<a href="05_畫面規格書.html">05 畫面規格書</a> · '
            '<a href="06_開發任務拆解WBS.html">06 WBS</a> · '
            '<a href="07_測試計畫.html">07 測試計畫</a> · '
            '<a href="08_測試案例.html">08 測試案例</a> · '
            '<a href="09_驗收文件.html">09 驗收文件</a></p>')
he()

h("2", "概述")
body.append(f'<p><b>2.1 專案目的</b>：{esc((model.get("summary","") or "")[:280])}…（完整模型見 03 SA）。</p>')
body.append("<p><b>2.2 專案範圍</b>：本期專案範圍依需求書與訪談填寫，並明確標示本期交付 vs 既有系統介接邊界。</p>")
he()

h("3", "背景說明")
body.append("<p><b>3.1 現行系統</b>：（現行系統概況依本案填寫）。</p>"
            "<p><b>3.2 現行使用者介面</b>：既有展示網站與監測後台。</p>"
            "<p><b>3.3 硬體環境</b>：HA 主備援分流、VM 虛擬化、NAS 檔案儲存（<i>假設·待 IT 確認</i>）。</p>"
            "<p><b>3.4 軟體環境</b>：C# .NET Core + MS SQL Server，前端 Bootstrap／PWA，LINE 推播（<i>假設·待 IT 確認</i>）。</p>")
he()

h("4", "需求規格")
body.append("<h3>4.1 使用者需求（需求清單）</h3>")
seen = set(); rrows = []
for f in funcs:
    r = f.get("requirement_ref")
    if r and r not in seen:
        seen.add(r); rrows.append((r, f.get("name"), f.get("fs_code")))
body.append("<table><thead><tr><th>需求</th><th>需求說明（功能）</th><th>對應 FS</th></tr></thead><tbody>")
for r, nm, fscode in sorted(rrows):
    body.append(f"<tr><td><code>{esc(r)}</code></td><td>{cell(nm)}</td><td><code>{esc(fscode)}</code></td></tr>")
body.append("</tbody></table>")
if nfr:
    body.append("<h3>4.1.2 非功能性需求（NFR）</h3><table><thead><tr><th>代碼</th><th>類別</th><th>需求</th></tr></thead><tbody>")
    for n in nfr:
        body.append(f"<tr><td><code>{esc(n.get('code'))}</code></td><td>{cell(n.get('category'))}</td><td>{cell(n.get('requirement'))}</td></tr>")
    body.append("</tbody></table>")

body.append("<h3>4.2 系統功能結構（FN）</h3>")
for m in modules:
    mc = m.get("fn_code", "")
    leaves = "　".join(f'<span class="tag fn">{esc(f.get("fn_code"))}</span>{esc(f.get("name"))}' for f in funcs if f.get("fn_code", "").startswith(mc) and f.get("fn_code") != mc)
    body.append(f'<p><b>{esc(m.get("name") or mc)}</b>：{leaves}</p>')

body.append("<h3>4.3 使用案例（Use Case）</h3><table><thead><tr><th>角色</th><th>可執行功能</th></tr></thead><tbody>")
actors = {}
for f in funcs:
    e = f.get("end", "") or ""
    key = "民眾" if "民眾" in e else ("廠商" if "廠商" in e else ("機關" if "機關" in e else "共用/系統"))
    actors.setdefault(key, []).append(f.get("fs_code", "") + " " + (f.get("name") or ""))
for a, fns in actors.items():
    body.append(f"<tr><td>{esc(a)}</td><td>" + "；".join(esc(x) for x in fns) + "</td></tr>")
body.append("</tbody></table>")
body.append('<p class="mut">4.4 事務流程圖：詳見 <a href="03_SA系統分析設計.html">03 SA</a> 關鍵流程／狀態圖與循序圖。</p>')

body.append("<h3>4.5 系統功能模組說明</h3><table><thead><tr><th>FN</th><th>FS</th><th>功能</th><th>說明</th></tr></thead><tbody>")
for f in funcs:
    body.append(f'<tr><td><code>{esc(f.get("fn_code"))}</code></td><td><code>{esc(f.get("fs_code"))}</code></td><td>{cell(f.get("name"))}</td><td style="font-size:13px">{cell((f.get("brief") or "")[:130])}</td></tr>')
body.append("</tbody></table>")
body.append('<p class="mut">逐功能 Use Case 四段、輸入欄位表、處理邏輯詳見 <a href="04_功能規格書.html">04 功能規格書</a>；逐畫面元素詳見 <a href="05_畫面規格書.html">05 畫面規格書</a>。</p>')

body.append("<h3>4.6 系統介面說明</h3><p>對外 REST API（/api/v1），統一回傳 {code,message,data}，認證分 vendor／agency／anon。外部介接：LINE 推播（通知）、NAS（檔案／影像）、其他外部服務（依本案）。詳見 03 SA 的 API spec。</p>")

body.append("<h3>4.7 系統環境架構</h3>")
if spec.get("arch_mermaid"):
    body.append('<div class="mermaid">\n' + spec["arch_mermaid"] + "\n</div>")
else:
    body.append('<p class="mut">架構圖見 03 SA。</p>')
he()

h("5", "附錄")
body.append('<h3>5.2 名詞解釋</h3><table><thead><tr><th>名詞</th><th>說明</th></tr></thead><tbody>'
            '<tr><td colspan="2" class="mut">（名詞解釋依本案補：系統角色、受控清單、專案特定術語；可取自資料模型的實體中文名）</td></tr>'
            '</tbody></table>')
body.append("<h3>5.3 需求追溯表（R → FN → FS → TC）</h3>")
tcmap = {}
for t in (tst.get("test_cases") or []):
    tcmap.setdefault(t.get("fs_code"), []).append(t.get("tc_code"))
body.append("<table><thead><tr><th>需求</th><th>FN</th><th>FS</th><th>功能</th><th>測試案例 TC</th></tr></thead><tbody>")
for f in funcs:
    tcs = "、".join(tcmap.get(f.get("fs_code"), [])) or "—"
    body.append(f'<tr><td>{cell(f.get("requirement_ref"))}</td><td><code>{esc(f.get("fn_code"))}</code></td><td><code>{esc(f.get("fs_code"))}</code></td><td>{cell(f.get("name"))}</td><td class="mut" style="font-size:13px">{esc(tcs)}</td></tr>')
body.append("</tbody></table>")
he()

summary = "本 SRS 依機關軟體需求規格書查檢表結構，整合需求／SA／功能規格／畫面規格為單一可送審文件，並附 R→FN→FS→TC 需求追溯。"
stats = f"5 章 · {len(rrows)} 需求項 · {len(nfr)} NFR"
out = dc.page("00b", "軟體需求規格書 SRS（整合）", summary, stats, "".join(body), "00b", mermaid=True)
open("00b_軟體需求規格書SRS.html", "w", encoding="utf-8").write(out)
print("OK -> 00b SRS整合")
