# -*- coding: utf-8 -*-
"""文件總覽入口（00）：掃描各文件是否已生成，產落地導覽頁（單一入口）。
最上方置頂『00 開發任務看板』為每日操作入口。
用法: python render_portal.py   （輸出 00_文件總覽_閱讀順序.html，與各文件同目錄）"""
import os, html
import doc_common as dc

OUTDIR = os.environ.get("SA_SUITE_DIR", ".")

# (編號, 標題, 檔名, 一句話「看這個要幹嘛」, 外部路徑或 None)
DOCS = [
    ("01", "需求說明書", "01_需求說明書.pdf", "要做什麼、範圍、需求項（甲方確認用）", "01_需求說明書.pdf"),
    ("02", "雛形畫面", "02_雛形畫面.html", "畫面長怎樣（互動雛形）", "02_雛形畫面.html"),
    ("03", "SA 系統分析設計", "03_SA系統分析設計.html", "ER／資料字典／架構／API／狀態圖", None),
    ("04", "功能規格書", "04_功能規格書.html", "每個功能怎麼運作（FN/FS · Use Case 四段）", None),
    ("05", "畫面規格書", "05_畫面規格書.html", "每個畫面每個元素怎麼刻（逐元素綁定 API/欄位）", None),
    ("06", "開發任務拆解 WBS", "06_開發任務拆解WBS.html", "排工／相依／人天／里程碑", None),
    ("07", "測試計畫", "07_測試計畫.html", "驗證範圍／層級／進入退出準則", None),
    ("08", "測試案例", "08_測試案例.html", "逐 FS 測試案例（功能/邊界/權限/例外）", None),
    ("09", "驗收文件", "09_驗收文件.html", "UAT 情境＋三方驗收簽核表", None),
]
EXTRA = [
    ("00b", "軟體需求規格書 SRS（整合）", "00b_軟體需求規格書SRS.html", "把 01/03/04/05 依機關查檢表整合成一份可送審 SRS", None),
    ("00c", "文件健檢報告", "00c_文件健檢報告.html", "跨文件交叉稽核（編碼/欄位/API/追溯一致性）結果", None),
]

extra_css = """
.dcard{display:flex;gap:14px;align-items:flex-start;text-decoration:none;color:var(--ink);
background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:10px 0;
box-shadow:0 3px 12px rgba(120,90,50,.05);transition:.15s}
.dcard:hover{border-color:var(--acc);transform:translateY(-1px);box-shadow:0 6px 18px rgba(120,90,50,.1)}
.dno{flex:0 0 auto;min-width:46px;height:46px;line-height:46px;text-align:center;background:var(--acc);color:#fff;
border-radius:12px;font-weight:700;font-size:15px;padding:0 6px}
.dtitle{font-size:18px;font-weight:700;margin-bottom:2px}
.ddesc{font-size:14.5px;color:var(--mut)}
.grp{font-size:14px;color:var(--acc);font-weight:700;margin:24px 0 4px;letter-spacing:.5px}
"""


def exists(local):
    return os.path.exists(os.path.join(OUTDIR, local))


def card(no, title, local, desc, href):
    ok = (href is not None) or exists(local)
    link = href if href else local
    badge = '<span class="pill ok">已生成</span>' if ok else '<span class="pill warn">待生成</span>'
    cls = "" if ok else ' style="opacity:.55"'
    return (f'<a class="dcard" href="{html.escape(link)}"{cls}>'
            f'<div class="dno">{no}</div>'
            f'<div class="dbody"><div class="dtitle">{html.escape(title)} {badge}</div>'
            f'<div class="ddesc">{html.escape(desc)}</div></div></a>')


body = [f"<style>{extra_css}</style>"]
# 置頂：開發任務看板（每天的操作入口）
if exists("00a_開發任務看板.html"):
    body.append('<a class="dcard" href="00a_開發任務看板.html" style="background:#e9f2e4;margin-top:14px">'
                '<div class="dno" style="background:#5b8c5a">00a</div><div class="dbody">'
                '<div class="dtitle">🗂 開發任務看板 <span class="pill ok">每天開這個</span></div>'
                '<div class="ddesc">把規格變任務 — 現在做哪個功能、點狀態追蹤、直連該功能的 04/05/08 文件段落</div></div></a>')

body.append('<div class="sec" style="margin-top:14px"><h2><span class="n">▸</span>核心開發文件鏈（依序閱讀）</h2>')
body.append('<p class="mut">建議閱讀順序：需求 → 雛形 → SA → 功能規格 → 畫面規格 → WBS → 測試計畫 → 案例 → 驗收。全套錨定同一份資料模型，編碼可互相追溯（R→FN→FS→SCR→TC）。</p>')
for no, title, local, desc, href in DOCS:
    body.append(card(no, title, local, desc, href))
body.append("</div>")

# 文件相依關係表（一張表看清誰依賴誰、各文件產出什麼追溯碼）
body.append('<div class="sec"><h2><span class="n">▸</span>文件相依關係（誰依賴誰 · 追溯碼）</h2>')
body.append('<p class="mut">改了上游就要回看下游：例如 03 SA 的資料模型一動，04／05／06／07 都受影響。全套靠下列追溯碼串起來：'
            '<code>R</code>(需求) → <code>FN/FS</code>(功能) → <code>SCR</code>(畫面) → <code>TC</code>(測試)。</p>')
body.append(dc.dep_table())
body.append("</div>")

body.append('<div class="sec"><div class="grp">送審整合 / 品質佐證</div>')
for no, title, local, desc, href in EXTRA:
    body.append(card(no, title, local, desc, href))
body.append("</div>")

have = sum(1 for d in DOCS + EXTRA if (d[4] is not None) or exists(d[2]))
total = len(DOCS) + len(EXTRA)
summary = f'🟢 系統開發文件套件單一入口，共 {total} 份、已生成 {have} 份。點任一卡片即可開啟；任一文件頂部導覽列亦可互跳。日常開發從上方「開發任務看板」開始。'
stats = f"完整送審套件 · {have}/{total} 份就緒 · 全套錨定同一資料模型"
out = dc.page("00", "文件總覽 · 閱讀順序", summary, stats, "".join(body), "00")
open(os.path.join(OUTDIR, "00_文件總覽_閱讀順序.html"), "w", encoding="utf-8").write(out)
print(f"OK -> 00_文件總覽_閱讀順序.html | {have}/{total} 份就緒")
