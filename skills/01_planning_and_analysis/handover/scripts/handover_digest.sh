#!/usr/bin/env bash
# handover_digest.sh — 撈某期間的 handover,產出 JSON 給 AI 做摘要
# 用法:
#   bash handover_digest.sh --db <path> --period monthly --ym 2026-04
#   bash handover_digest.sh --db <path> --period annual --year 2026
#
# 輸出 JSON(給 AI 讀取後產出 markdown digest)
# Windows-safe: 路徑透過 env var 傳入 Python heredoc
set -e

DB_PATH=""
PERIOD=""
YM=""
YEAR=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --db) DB_PATH="$2"; shift 2 ;;
    --period) PERIOD="$2"; shift 2 ;;
    --ym) YM="$2"; shift 2 ;;
    --year) YEAR="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

[ -z "$DB_PATH" ] && { echo "--db required"; exit 1; }
[ -z "$PERIOD" ] && { echo "--period required (monthly|annual)"; exit 1; }

HANDOVER_DB_PATH="$DB_PATH" HANDOVER_PERIOD="$PERIOD" HANDOVER_YM="$YM" HANDOVER_YEAR="$YEAR" python3 - <<'PYEOF'
import json, os, sqlite3, sys

db = os.environ["HANDOVER_DB_PATH"]
period = os.environ["HANDOVER_PERIOD"]
ym = os.environ.get("HANDOVER_YM", "")
year = os.environ.get("HANDOVER_YEAR", "")

conn = sqlite3.connect(db)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

if period == "monthly":
    if not ym:
        print('{"error":"--ym required for monthly (e.g. 2026-04)"}')
        sys.exit(1)
    cur.execute("""SELECT * FROM handover
                   WHERE strftime('%Y-%m', updated_at) = ?
                   ORDER BY updated_at ASC""", (ym,))
elif period == "annual":
    if not year:
        print('{"error":"--year required for annual (e.g. 2026)"}')
        sys.exit(1)
    cur.execute("""SELECT * FROM handover
                   WHERE strftime('%Y', updated_at) = ?
                   ORDER BY updated_at ASC""", (year,))
else:
    print(f'{{"error":"invalid period: {period}"}}')
    sys.exit(1)

rows = [dict(r) for r in cur.fetchall()]
print(json.dumps({"period": period, "ym": ym, "year": year, "count": len(rows), "rows": rows},
                 ensure_ascii=False, indent=2))
conn.close()
PYEOF
