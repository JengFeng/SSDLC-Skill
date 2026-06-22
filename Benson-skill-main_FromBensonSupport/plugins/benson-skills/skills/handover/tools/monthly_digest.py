"""每月精華 digest — rule-based，無 LLM
把指定月份的 handover row 濃縮成 markdown
輸出: .handover/digests/YYYY-MM.md

用法：
  python tools/monthly_digest.py            # 上個月
  python tools/monthly_digest.py 2026-04    # 指定月份
"""
from __future__ import annotations

import json
import re
import sqlite3
import sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path


def find_db() -> Path:
    cur = Path.cwd().resolve()
    for d in [cur, *cur.parents]:
        cand = d / ".handover" / "handover.db"
        if cand.exists():
            return cand
    raise FileNotFoundError("找不到 .handover/handover.db")


def project_of(topic: str) -> str:
    # 用 topic 前綴推 project：『桃園水情 XXX』『南投雨水 YYY』
    m = re.match(r'^([一-鿿]{2,8}(?:雨水|水情|水務局|下水道|觀測站|出流管制|水門|彰化雨水|三維|文資|整合平台|物種|航空城|實習生|楊梅田|準線|系統整合|SideProject|SWMM)?)', topic)
    if m: return m.group(1).strip()
    # fallback: 第一個「空格 / 中文間頓號 / —」之前
    return re.split(r'[\s—–\-—–:：]', topic, 1)[0][:12]


def trim(s: str | None, n: int = 200) -> str:
    if not s: return ""
    s = s.strip().replace("\n", " ⏎ ")
    return s if len(s) <= n else s[:n] + "..."


def main():
    if len(sys.argv) > 1:
        ym = sys.argv[1]
    else:
        # 上個月
        first_of_this_month = datetime.now().replace(day=1)
        last_of_prev = first_of_this_month - timedelta(days=1)
        ym = last_of_prev.strftime("%Y-%m")

    db = find_db()
    out_dir = db.parent / "digests"
    out_dir.mkdir(exist_ok=True)
    out_file = out_dir / f"{ym}.md"

    conn = sqlite3.connect(db)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    rows = [dict(r) for r in cur.execute("""
        SELECT * FROM handover
        WHERE strftime('%Y-%m', COALESCE(updated_at, created_at)) = ?
        ORDER BY updated_at ASC
    """, (ym,))]

    if not rows:
        print(f"❌ {ym} 沒有任何 handover row")
        return 1

    # 分桶
    by_type = defaultdict(list)
    by_project = defaultdict(list)
    for r in rows:
        by_type[r["session_type"] or "unknown"].append(r)
        proj = project_of(r["topic"] or "")
        by_project[proj].append(r)

    # 寫 markdown
    lines = []
    lines.append(f"# 月度精華 — {ym}")
    lines.append("")
    lines.append(f"> 自動產出於 {datetime.now():%Y-%m-%d %H:%M:%S}")
    lines.append(f"> 涵蓋 {len(rows)} 筆 handover row")
    lines.append("")

    # 概覽
    lines.append("## 📊 概覽")
    lines.append("")
    lines.append(f"- **總筆數**：{len(rows)}")
    lines.append(f"- **session_type 分布**：" + " / ".join(f"{t} {len(v)}" for t, v in sorted(by_type.items(), key=lambda x: -len(x[1]))))
    lines.append(f"- **涉及專案**：" + ", ".join(sorted(by_project.keys())))
    closed = sum(1 for r in rows if r["status"] == "closed")
    lines.append(f"- **已 closed**：{closed} / {len(rows)}")
    lines.append("")

    # 1. 關鍵決策 (decisions)
    decisions = by_type.get("decision", [])
    lines.append(f"## ⚖️ 關鍵決策（{len(decisions)}）")
    lines.append("")
    for r in decisions:
        body = trim(r["completed"] or r["topic"], 150)
        lines.append(f"- **#{r['id']}** {r['topic']}")
        if body and body != r["topic"]:
            lines.append(f"  - {body}")
    lines.append("")

    # 2. 主要事件 (incidents)
    incidents = by_type.get("incident", [])
    lines.append(f"## 🚨 主要事件 / 踩坑（{len(incidents)}）")
    lines.append("")
    for r in incidents:
        body = trim(r["completed"] or r["topic"], 150)
        status_icon = "✅" if r["status"] == "closed" else "🔴"
        lines.append(f"- {status_icon} **#{r['id']}** {r['topic']}")
        if body and body != r["topic"]:
            lines.append(f"  - {body}")
    lines.append("")

    # 3. 完成 (completed type or status=closed)
    completed_rows = [r for r in rows if r["status"] == "closed" and r["session_type"] == "completed"]
    lines.append(f"## ✅ 完成里程碑（{len(completed_rows)}）")
    lines.append("")
    for r in completed_rows:
        body = trim(r["completed"] or r["topic"], 150)
        lines.append(f"- **#{r['id']}** {r['topic']}")
        if body and body != r["topic"]:
            lines.append(f"  - {body}")
    lines.append("")

    # 4. 未解卡點 (status=open blockers + commitments)
    open_blockers = [r for r in rows if r["status"] == "open" and r["session_type"] in ("blocker", "commitment")]
    lines.append(f"## 🟡 未解卡點 / 待辦（{len(open_blockers)}）")
    lines.append("")
    for r in sorted(open_blockers, key=lambda x: (x.get("due_date") or "9999", x["id"])):
        body = trim(r.get("next_steps") or r["completed"] or r["topic"], 150)
        due = r.get("due_date")
        prio = (r.get("priority") or "").upper()
        prefix = ""
        if prio == "HIGH": prefix = "🔴 "
        elif prio == "MEDIUM": prefix = "🟡 "
        date_tag = f"（{due} due）" if due else ""
        lines.append(f"- {prefix}**#{r['id']}** {r['topic']} {date_tag}")
        if body and body != r["topic"]:
            lines.append(f"  - → {body}")
    lines.append("")

    # 5. 知識點 (knowledge)
    knowledge = by_type.get("knowledge", [])
    lines.append(f"## 📚 新增知識點（{len(knowledge)}）")
    lines.append("")
    for r in knowledge[:20]:   # 太多就只顯示前 20
        lines.append(f"- **#{r['id']}** {r['topic']}")
    if len(knowledge) > 20:
        lines.append(f"- ... 還有 {len(knowledge) - 20} 筆")
    lines.append("")

    # 6. 帳密記錄 (credential)
    creds = by_type.get("credential", [])
    if creds:
        lines.append(f"## 🔐 帳密記錄（{len(creds)}）")
        lines.append("")
        for r in creds:
            lines.append(f"- **#{r['id']}** {r['topic']}")
        lines.append("")

    # 7. 按專案分組（只列數）
    lines.append(f"## 🗂️ 按專案分布")
    lines.append("")
    for proj, prows in sorted(by_project.items(), key=lambda x: -len(x[1])):
        types_in_proj = Counter(r["session_type"] or "?" for r in prows)
        type_str = " / ".join(f"{t}×{n}" for t, n in types_in_proj.most_common())
        lines.append(f"- **{proj}**（{len(prows)} 筆）— {type_str}")
    lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("*若要更深的人工摘要，可在 Claude Code 內用 `/handover digest` 觸發 LLM 重寫此檔。*")

    out_file.write_text("\n".join(lines), encoding="utf-8")
    print(f"✅ 寫入 {out_file}")
    print(f"   {len(rows)} rows → {len(lines)} lines markdown")
    return 0


if __name__ == "__main__":
    sys.exit(main())
