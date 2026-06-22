# -*- coding: utf-8 -*-
"""（選配·03 的加值匯出）從正規模型直接匯出 MS SQL 建置語法（CREATE TABLE DDL）。
＝資料字典的「可執行版」，地基那步(建表)直接跑、不用照字典手刻。同源，保證跟資料字典一致。

用法: python gen_schema.py [model.json] [db_schema.sql]
model.json 接受 {model:{entities[]}} 或 {entities[]}（與 transform.py 同源）。
字典表 seed 資料（FIX_LEVEL/頻率/面向等列舉）為專案特定，依案於 03 資料字典的列舉欄位補。
"""
import json, sys, re

SRC = sys.argv[1] if len(sys.argv) > 1 else "model.json"
DST = sys.argv[2] if len(sys.argv) > 2 else "db_schema.sql"
data = json.load(open(SRC, encoding="utf-8"))
M = data.get("model", data)
ents = M.get("entities", [])


def col_type(f):
    t = (f.get("type") or "nvarchar").strip().lower()
    ln = (f.get("length") or "").strip()
    key = (f.get("key") or "").strip().upper()
    if t in ("int", "integer"):
        return "INT IDENTITY(1,1)" if key == "PK" else "INT"
    if t == "bigint":
        return "BIGINT IDENTITY(1,1)" if key == "PK" else "BIGINT"
    if t in ("nvarchar", "varchar", "string"):
        return f"NVARCHAR({ln})" if ln else "NVARCHAR(MAX)"
    if t in ("datetime", "datetime2"):
        return "DATETIME"
    if t == "date":
        return "DATE"
    if t in ("decimal", "numeric"):
        return f"DECIMAL({ln})" if ln else "DECIMAL(18,2)"
    if t in ("bit", "bool", "boolean"):
        return "BIT"
    if t == "tinyint":
        return "TINYINT"
    if t in ("float", "double"):
        return "FLOAT"
    if t in ("uniqueidentifier", "guid"):
        return "UNIQUEIDENTIFIER"
    return t.upper()


def default_clause(f):
    d = (f.get("default") or "").strip()
    if not d:
        return ""
    if any(k in d for k in ("GETDATE", "系統時間", "現在時間", "目前時間")):
        return " DEFAULT GETDATE()"
    if re.fullmatch(r"-?\d+", d):
        return f" DEFAULT {d}"
    return ""  # 中文描述型預設值跳過，避免無效 SQL


lines = ["-- 資料庫建置語法（MS SQL Server）— 由 sa-design 正規模型自動匯出",
         f"-- {len(ents)} 張表 · 與 03 資料字典同源", "SET NOCOUNT ON;", "GO", ""]
fks = []

for e in ents:
    tbl = e["table"]
    cols, pk = [], None
    for f in e.get("fields", []):
        nm = f["name"]
        null = "NOT NULL" if (f.get("required") or "").upper() == "Y" else "NULL"
        uk = " UNIQUE" if (f.get("key") or "").upper() == "UK" else ""
        cols.append(f"    [{nm}] {col_type(f)} {null}{default_clause(f)}{uk}")
        k = (f.get("key") or "").upper()
        if k == "PK":
            pk = nm
        if k == "FK":
            m = re.search(r"([A-Za-z][A-Za-z0-9_]+)\.([A-Za-z0-9_]+)", f.get("fk_ref", "") or "")
            if m:
                fks.append((tbl, nm, m.group(1), m.group(2)))
    if pk:
        cols.append(f"    CONSTRAINT [PK_{tbl}] PRIMARY KEY ([{pk}])")
    lines.append(f"CREATE TABLE [{tbl}] (")
    lines.append(",\n".join(cols))
    lines.append(");\nGO\n")

lines.append("-- ===== 外鍵約束 =====")
for tbl, col, rt, rc in fks:
    lines.append(f"ALTER TABLE [{tbl}] ADD CONSTRAINT [FK_{tbl}_{col}] FOREIGN KEY ([{col}]) REFERENCES [{rt}] ([{rc}]);")
lines.append("GO\n")
lines.append("-- ===== 字典表 seed =====")
lines.append("-- 列舉/字典資料（如修繕程度、頻率、滿意度面向）為專案特定，依 03 資料字典的列舉欄位說明補 INSERT。")

open(DST, "w", encoding="utf-8").write("\n".join(lines))
print(f"OK -> {DST} | {len(ents)} 張表 · {len(fks)} 個外鍵（DDL）")
