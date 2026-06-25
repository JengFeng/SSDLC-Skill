# -*- coding: utf-8 -*-
"""把 Workflow A 產的正規模型(result.json) 確定性轉成 render_sa.py 吃的 sa_spec.json。
ER mermaid 與資料字典皆由同一份 entities 生成 → 保證一致。
用法: python transform.py result.json sa_spec.json
"""
import json, sys, html

src = sys.argv[1] if len(sys.argv) > 1 else "result.json"
dst = sys.argv[2] if len(sys.argv) > 2 else "sa_spec.json"
R = json.load(open(src, encoding="utf-8"))
M = R.get("model", R)  # 容許直接給 model
ents = M.get("entities", [])
rels = M.get("relationships", [])
# 依模組分組排序：相關的表排在一起，資料字典／ER 不會跳來跳去
_modord = {m.get("name"): i for i, m in enumerate(M.get("modules", []) or [])}
ents = sorted(ents, key=lambda e: _modord.get(e.get("module"), 999))

# ---- mermaid 第三段引號的安全化：半形 / ( ) 會破壞 mermaid 10.x ----
def mer_desc(s):
    if not s:
        return ""
    s = html.unescape(str(s))
    s = s.replace('"', "”").replace("/", "／").replace("(", "（").replace(")", "）")
    s = s.replace("[", "（").replace("]", "）").replace("{", "（").replace("}", "）")
    s = s.replace(":", "：").replace(";", "；").replace(",", "，")
    return s.strip()

# 概念型別 -> mermaid token（小寫即可）
def mer_type(t):
    t = (t or "nvarchar").strip().lower()
    return t if t else "nvarchar"

# 概念型別 + 長度 -> MS SQL 型別字串（資料字典用）
def mssql_type(f):
    t = (f.get("type") or "nvarchar").strip().lower()
    ln = (f.get("length") or "").strip()
    key = (f.get("key") or "").strip().upper()
    name = (f.get("name") or "").strip().lower()
    if t in ("int",):
        if key == "PK" and name in ("id",):
            return "INT IDENTITY(1,1)"
        return "INT"
    if t in ("bigint",):
        return "BIGINT IDENTITY(1,1)" if key == "PK" else "BIGINT"
    if t in ("nvarchar", "varchar", "string"):
        return f"NVARCHAR({ln})" if ln else "NVARCHAR(MAX)"
    if t in ("datetime", "datetime2"):
        return "DATETIME"
    if t in ("date",):
        return "DATE"
    if t in ("decimal", "numeric", "money"):
        return f"DECIMAL({ln})" if ln else "DECIMAL(18,2)"
    if t in ("bit", "bool", "boolean"):
        return "BIT"
    if t in ("tinyint",):
        return "TINYINT"
    if t in ("float", "double"):
        return "FLOAT"
    if t in ("uniqueidentifier", "guid"):
        return "UNIQUEIDENTIFIER"
    return t.upper()

# ---------- ① ER mermaid ----------
lines = ["erDiagram"]
for r in rels:
    fr = (r.get("from") or "").strip()
    to = (r.get("to") or "").strip()
    card = (r.get("card") or "||--o{").strip()
    label = mer_desc(r.get("label") or "關聯")
    if fr and to:
        lines.append(f'    {fr} {card} {to} : "{label}"')
for e in ents:
    tbl = (e.get("table") or "").strip()
    if not tbl:
        continue
    _title = (e.get("title") or "").strip().replace('"', "").replace("[", "（").replace("]", "）")
    lines.append(f'    {tbl}["{_title} · {tbl}"] {{' if _title else f"    {tbl} {{")
    for f in e.get("fields", []):
        nm = (f.get("name") or "").strip()
        if not nm:
            continue
        ty = mer_type(f.get("type"))
        key = (f.get("key") or "").strip().upper()
        key = key if key in ("PK", "FK", "UK") else ""
        desc = f.get("desc") or ""
        fk = (f.get("fk_ref") or "").strip()
        if key == "FK" and fk and ("→" not in desc) and ("->" not in desc):
            desc = f"{desc}（{fk}）"
        d = mer_desc(desc)
        keytok = f" {key}" if key else ""
        lines.append(f'        {ty} {nm}{keytok} "{d}"')
    lines.append("    }")
er_mermaid = "\n".join(lines)

# ---------- ② 資料字典 ----------
def esc(s):
    return html.escape(html.unescape(str(s if s is not None else ""))).strip()

def cell(v):
    v = (v if v is not None else "")
    v = str(v).strip()
    return esc(v) if v else "—"

data_dict = []
for e in ents:
    tbl = (e.get("table") or "").strip()
    title = (e.get("title") or "").strip()
    purpose = (e.get("purpose") or "").strip()
    rows = ""
    for f in e.get("fields", []):
        nm = (f.get("name") or "").strip()
        if not nm:
            continue
        ty = mssql_type(f)
        ln = (f.get("length") or "").strip()
        key = (f.get("key") or "").strip().upper()
        fk = (f.get("fk_ref") or "").strip()
        keydisp = key if key in ("PK", "FK", "UK") else ""
        if key == "FK" and fk:
            keydisp = f"FK<br><small>{esc(fk)}</small>"
        req = "必填" if (f.get("required") or "").upper() == "Y" else "—"
        rows += (
            "<tr>"
            f"<td><code>{esc(nm)}</code></td>"
            f"<td>{cell(f.get('desc'))}</td>"
            f"<td>{esc(ty)}</td>"
            f"<td>{cell(ln)}</td>"
            f"<td>{keydisp or '—'}</td>"
            f"<td>{req}</td>"
            f"<td>{cell(f.get('default'))}</td>"
            f"<td>{cell(f.get('validation'))}</td>"
            f"<td>{cell(f.get('note'))}</td>"
            "</tr>"
        )
    tbl_html = (
        f'<p style="margin:4px 0 8px;font-size:15px"><b>用途</b>：{esc(purpose)}</p>'
        '<table><thead><tr>'
        '<th>欄位名</th><th>中文說明</th><th>型別</th><th>長度/精度</th>'
        '<th>PK/FK/UK</th><th>必填</th><th>預設</th><th>驗證規則</th><th>備註</th>'
        f'</tr></thead><tbody>{rows}</tbody></table>'
    )
    data_dict.append({"table": tbl, "title": title, "module": (e.get("module") or ""), "html": tbl_html})

# ---------- 組裝 sa_spec.json ----------
n_tbl = len(data_dict)
n_api = R.get("endpointCount") or 0
n_extra = len(R.get("extra", []) or [])
stats = f"{n_tbl} 張資料表"
if n_api:
    stats += f" · 約 {n_api} 支 API"
stats += f" · {len(rels)} 條關聯"
if n_extra:
    stats += f" · {n_extra} 張狀態/循序圖"

spec = {
    "system": M.get("system", "本系統"),
    "summary": M.get("summary", ""),
    "stats": stats,
    "er_mermaid": er_mermaid,
    "data_dict": data_dict,
    "arch_mermaid": R.get("arch_mermaid", ""),
    "api_html": R.get("api_html", ""),
    "extra": R.get("extra", []) or [],
}
json.dump(spec, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"OK -> {dst}  | {n_tbl} 張表, {len(rels)} 關聯, {n_extra} extra 圖")
