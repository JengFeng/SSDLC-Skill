"""file_activity_report.py — 看 SA 文件流統計

用法：
  python tools/file_activity_report.py            # 本月
  python tools/file_activity_report.py 2026-04    # 指定月份
  python tools/file_activity_report.py --recent 7 # 最近 7 天
"""
import argparse, sqlite3, sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path


def find_db():
    cur = Path.cwd().resolve()
    for d in [cur, *cur.parents]:
        cand = d / ".handover" / "handover.db"
        if cand.exists():
            return cand
    raise FileNotFoundError(".handover/handover.db not found")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ym", nargs="?", help="YYYY-MM (預設本月)")
    ap.add_argument("--recent", type=int, help="最近 N 天")
    args = ap.parse_args()

    db = find_db()
    conn = sqlite3.connect(db)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # 確認表存在
    try:
        cur.execute("SELECT 1 FROM file_activity LIMIT 1")
    except sqlite3.OperationalError:
        print("❌ file_activity 表還沒有，hook 還沒被觸發過。寫一份檔案後再來看。")
        return 1

    if args.recent:
        threshold = (datetime.now() - timedelta(days=args.recent)).strftime('%Y-%m-%d %H:%M:%S')
        rows = list(cur.execute("SELECT * FROM file_activity WHERE ts >= ? ORDER BY ts DESC", (threshold,)))
        title = f"最近 {args.recent} 天"
    else:
        ym = args.ym or datetime.now().strftime("%Y-%m")
        rows = list(cur.execute("SELECT * FROM file_activity WHERE strftime('%Y-%m', ts) = ? ORDER BY ts DESC", (ym,)))
        title = ym

    if not rows:
        print(f"📭 {title} 沒有任何檔案活動")
        return 0

    print(f"📂 SA 文件活動 — {title}")
    print(f"   總操作數：{len(rows)}")

    # 按副檔名分
    by_ext = Counter(r['extension'] for r in rows)
    print(f"\n   按副檔名：")
    for ext, n in by_ext.most_common():
        print(f"     {ext:8} × {n}")

    # 按 tool
    by_tool = Counter(r['tool'] for r in rows)
    print(f"\n   按工具：" + " / ".join(f"{t}×{n}" for t, n in by_tool.most_common()))

    # Top 檔案（按操作次數）
    by_file = Counter(r['file_name'] for r in rows)
    print(f"\n   Top 10 檔案（按碰過次數）：")
    for f, n in by_file.most_common(10):
        # 抓最後 path
        last_path = next((r['file_path'] for r in rows if r['file_name'] == f), '')
        print(f"     {n:>3}× {f}")
        print(f"          {last_path}")

    # 字數變化
    total_delta = sum((r['delta'] or 0) for r in rows)
    pos = sum(r['delta'] for r in rows if r['delta'] and r['delta'] > 0)
    neg = sum(r['delta'] for r in rows if r['delta'] and r['delta'] < 0)
    print(f"\n   累計字數變化：+{pos:,} / {neg:,} = net {total_delta:+,}")

    # 按日
    by_day = defaultdict(int)
    for r in rows:
        d = (r['ts'] or '')[:10]
        by_day[d] += 1
    print(f"\n   按日：")
    for d, n in sorted(by_day.items(), reverse=True)[:14]:
        bar = '▓' * min(n, 50)
        print(f"     {d}  {n:>3}  {bar}")

    conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
