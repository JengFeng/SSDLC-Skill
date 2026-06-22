# -*- coding: utf-8 -*-
"""測試與驗收（拆三份）：test_result.json {test_cases[],uat[]} ->
   07_測試計畫.html / 08_測試案例.html / 09_驗收文件.html。
一支腳本吐三檔，三者同源、互相連結（07 計畫 ▸ 08 案例 ▸ 09 驗收）。"""
import json, sys, html, os, re
import doc_common as dc

src = sys.argv[1] if len(sys.argv) > 1 else "test_result.json"
# 第二參數可給輸出資料夾（預設＝資料來源同層）
outdir = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(src))
if outdir and not os.path.isdir(outdir):
    outdir = os.path.dirname(outdir) or "."
R = json.load(open(src, encoding="utf-8"))
tcs = R.get("test_cases", []) or []
uat = R.get("uat", []) or []
FS_DOC = dc.fname("04")  # 案例的 FS 連到 04 功能卡


def esc(x):
    return html.escape(str(x if x is not None else "")).strip()


def cell(x):
    x = str(x if x is not None else "").strip()
    return esc(x) if x else "—"


# 讀 fs_result.json 取每個 FS 的真實模組名（通用：不寫死任何案的模組）
_fl = {}
_fp = os.path.join(os.path.dirname(os.path.abspath(src)), "fs_result.json")
if os.path.exists(_fp):
    try:
        _d = json.load(open(_fp, encoding="utf-8"))
        for _f in (_d.get("fnlist", {}).get("functions", []) or []):
            if _f.get("fs_code"):
                _fl[_f["fs_code"]] = _f.get("module") or ""
    except Exception:
        pass


def fs_prefix(fs):
    fs = str(fs or "")
    if _fl.get(fs):
        return _fl[fs]
    m = re.match(r"(FS-[A-Za-z]+)", fs)
    return (m.group(1) + " 類") if m else "其他"


def write(code, title, body, summary, stats, mermaid=False):
    out = dc.page(code, title, summary, stats, "".join(body), code, mermaid=mermaid)
    path = os.path.join(outdir, dc.fname(code))
    open(path, "w", encoding="utf-8").write(out)
    print(f"OK -> {dc.fname(code)} | {stats}")


# 模組涵蓋統計（07 範圍 / 08 分組共用）
groups = {}
for t in tcs:
    groups.setdefault(fs_prefix(t.get("fs_code")), []).append(t)
order = list(groups.keys())
n_fs = len({t.get("fs_code") for t in tcs if t.get("fs_code")})

# ============ 07 測試計畫 ============
b = []
b.append('<div class="sec"><h2><span class="n">1</span>測試目的與策略</h2>')
b.append('<p>本測試計畫定義驗證範圍、層級、準則與分工，作為 <a href="' + dc.fname("08") + '">08 測試案例</a> 與 '
         '<a href="' + dc.fname("09") + '">09 驗收文件</a> 的依據。採三層驗證：'
         '①<b>單元/功能測試</b>（逐 FS：功能/邊界/權限/例外）→ ②<b>整合測試</b>（跨模組串接、關鍵流程全鏈）→ '
         '③<b>使用者驗收 UAT</b>（各角色實機情境）。所有案例對應功能規格 FS 與 API，缺陷回填功能規格。</p></div>')

b.append('<div class="sec"><h2><span class="n">2</span>測試範圍</h2>')
b.append(f'<p>本期測試涵蓋 <b>{n_fs}</b> 支功能（FS）、<b>{len(tcs)}</b> 個測試案例、<b>{len(uat)}</b> 項使用者驗收情境，'
         f'分布於下列模組：</p>')
b.append("<table><thead><tr><th>模組</th><th>測試案例數</th></tr></thead><tbody>")
for g in order:
    b.append(f"<tr><td>{esc(g)}</td><td>{len(groups.get(g) or [])}</td></tr>")
b.append(f'<tr><td><b>合計</b></td><td><b>{len(tcs)}</b></td></tr>')
b.append("</tbody></table></div>")

b.append('<div class="sec"><h2><span class="n">3</span>測試類型</h2><table><thead><tr><th>類型</th><th>說明</th></tr></thead><tbody>'
         '<tr><td>功能</td><td>正常輸入下功能行為符合 FS 規格</td></tr>'
         '<tr><td>邊界</td><td>長度／數值／空值等邊界條件</td></tr>'
         '<tr><td>權限</td><td>各角色僅能存取被授權的功能與資料</td></tr>'
         '<tr><td>例外</td><td>錯誤輸入／中斷／重複送出等例外處理</td></tr>'
         '<tr><td>整合</td><td>跨模組串接與關鍵流程全鏈</td></tr>'
         '<tr><td>UAT</td><td>各角色實機情境驗收（見 09）</td></tr>'
         '</tbody></table></div>')

b.append('<div class="sec"><h2><span class="n">4</span>測試環境</h2>'
         '<p class="mut">測試環境與正式環境一致之 VM／資料庫／瀏覽器組合（<i>假設·待 IT 確認</i>）；'
         '使用獨立測試資料庫與去識別化測試資料，不影響正式資料。</p></div>')

b.append('<div class="sec"><h2><span class="n">5</span>進入／退出準則</h2><table><thead><tr><th></th><th>準則</th></tr></thead><tbody>'
         '<tr><th style="width:120px">進入準則</th><td>功能開發完成、相關文件（04／05）齊備、測試環境就緒、測試案例審查通過</td></tr>'
         '<tr><th>退出準則</th><td>測試案例全數執行、嚴重缺陷全數修復並複測通過、UAT 情境全通過、符合 NFR</td></tr>'
         '</tbody></table></div>')

b.append('<div class="sec"><h2><span class="n">6</span>缺陷管理</h2>'
         '<p>缺陷依嚴重度分級（阻斷／嚴重／一般／輕微）；修復後須複測，並回填對應功能規格 FS。'
         '驗收前阻斷與嚴重缺陷須清零。</p></div>')

write("07", "測試計畫",
      b,
      f"本測試計畫定義三層驗證範圍與進入／退出準則，涵蓋 {n_fs} 支功能、{len(tcs)} 個測試案例、{len(uat)} 項 UAT，作為 08 案例與 09 驗收的依據。",
      f"{n_fs} 功能 · {len(tcs)} 案例 · {len(uat)} UAT · 三層驗證")

# ============ 08 測試案例 ============
b = []
b.append(f'<div class="sec"><h2><span class="n">1</span>測試案例（共 {len(tcs)} 案）</h2>')
b.append('<p class="mut" style="font-size:14px">依模組分組；每案對應 <a href="' + FS_DOC + '">04 功能規格</a> 的 FS，'
         '點 FS 可跳到該功能行為。測試策略與準則見 <a href="' + dc.fname("07") + '">07 測試計畫</a>。</p>')
for g in order:
    items = groups.get(g)
    if not items:
        continue
    b.append(f'<h3>{esc(g)}　<small>{len(items)} 案</small></h3>')
    b.append("<table><thead><tr><th>TC</th><th>FS</th><th>類型</th><th>標題</th><th>前置</th><th>步驟</th><th>預期結果</th></tr></thead><tbody>")
    for t in items:
        steps = t.get("steps", []) or []
        steps_html = "<ol class='flow' style='font-size:13.5px'>" + "".join(f"<li>{esc(x)}</li>" for x in steps) + "</ol>" if steps else "—"
        fsc = esc(t.get("fs_code"))
        fs_cell = f'<a href="{FS_DOC}#{fsc}"><code>{fsc}</code></a>' if fsc else "—"
        b.append("<tr id='" + esc(t.get("tc_code")) + "'><td><code>" + esc(t.get("tc_code")) + "</code></td><td>" + fs_cell + "</td><td>" + cell(t.get("type")) + "</td><td>" + cell(t.get("title")) + "</td><td class='mut'>" + cell(t.get("precondition")) + "</td><td>" + steps_html + "</td><td>" + cell(t.get("expected")) + "</td></tr>")
    b.append("</tbody></table>")
b.append("</div>")
write("08", "測試案例",
      b,
      f"逐功能設計 {len(tcs)} 個測試案例（功能／邊界／權限／例外），依模組分組、每案對應 FS 與 API，可回溯至 04 功能規格。",
      f"{len(tcs)} 測試案例 · 對應 {n_fs} 支功能")

# ============ 09 驗收文件 ============
b = []
b.append('<div class="sec"><h2><span class="n">1</span>使用者驗收測試 UAT</h2>')
if uat:
    b.append(f'<p>各角色實機情境驗收（{len(uat)} 項），通過為交付驗收依據。測試案例見 '
             '<a href="' + dc.fname("08") + '">08 測試案例</a>。</p>')
    b.append('<table><thead><tr><th>UAT</th><th>驗收情境</th><th>對象</th><th>驗收基準（通過條件）</th></tr></thead><tbody>')
    for u in uat:
        b.append("<tr id='" + esc(u.get("uat_code")) + "'><td><code>" + esc(u.get("uat_code")) + "</code></td><td>" + cell(u.get("scenario")) + "</td><td>" + cell(u.get("actor")) + "</td><td>" + cell(u.get("acceptance_criteria")) + "</td></tr>")
    b.append("</tbody></table>")
else:
    b.append('<p class="mut">UAT 情境待補。</p>')
b.append("</div>")

b.append('<div class="sec"><h2><span class="n">2</span>驗收簽核</h2><table><thead><tr><th>項目</th><th>結果</th><th>簽核</th><th>日期</th></tr></thead><tbody>')
for it in ["功能測試全數通過", "整合測試全鏈通過", "UAT 情境通過", "資安／個資檢核", "效能/相容性符合 NFR"]:
    b.append(f"<tr><td>{it}</td><td>□ 通過　□ 未通過</td><td>＿＿＿＿＿</td><td>＿＿＿＿＿</td></tr>")
b.append("</tbody></table>")
b.append('<p class="mut" style="font-size:14px;margin-top:8px">簽核採三方欄位：承辦單位 / 監造（如有）/ 廠商，依機關規定用印。</p></div>')
write("09", "驗收文件",
      b,
      f"使用者驗收測試（UAT {len(uat)} 項）與三方驗收簽核表，作為本系統交付驗收與用印依據。",
      f"{len(uat)} UAT 情境 · 三方簽核")
