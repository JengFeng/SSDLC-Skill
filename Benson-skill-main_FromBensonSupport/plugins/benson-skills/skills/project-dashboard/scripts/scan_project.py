# -*- coding: utf-8 -*-
"""
專案資料夾盤點 — 輸出 JSON 給 project-dashboard skill 用。
機械事實（統計/近期檔/頂層結構/散落檔），語意對映(WBS↔資料夾)由 Claude 判斷。

用法:
  python scan_project.py "<專案路徑>" [--days 14] [--out <json路徑>]
輸出: JSON（預設印到 stdout，UTF-8）
"""
import os, sys, json, time, argparse

SKIP = {".git", ".handover", "__pycache__", "node_modules", ".vs", ".idea"}
DOC = {"docx", "doc", "pdf", "pptx", "ppt", "xlsx", "xls"}
WEB = {"html", "htm"}
VIDEO = {"mp4", "mov", "avi", "mkv", "webm"}
AUDIO = {"mp3", "m4a", "wav", "ogg"}
IMG = {"png", "jpg", "jpeg", "gif", "svg", "webp"}
CODE = {"py", "js", "ts", "cs", "php", "java", "go", "sql", "css"}
GIS = {"shp", "geojson", "kml", "dwg", "dxf", "tif", "tiff"}

def ext_of(name):
    return name.rsplit(".", 1)[-1].lower() if "." in name else ""

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("path")
    ap.add_argument("--days", type=int, default=14)
    ap.add_argument("--out", default=None)
    a = ap.parse_args()

    root = a.path
    if not os.path.isdir(root):
        print(json.dumps({"error": "not a dir", "path": root}, ensure_ascii=False)); return

    now = time.time()
    cutoff = now - a.days * 86400
    types = {}             # ext -> count
    buckets = {k: 0 for k in ("文件", "模擬畫面", "影片", "語音", "圖片", "程式", "GIS", "其他")}
    total = 0
    recent = []            # 近 N 天新檔
    top = {}               # 頂層資料夾 -> 檔案數
    root_loose = []        # 直接躺在專案根目錄的檔（疑似未歸檔）

    for dp, dns, fns in os.walk(root):
        dns[:] = [d for d in dns if d not in SKIP]
        rel = os.path.relpath(dp, root)
        top_seg = rel.split(os.sep)[0] if rel != "." else "."
        for fn in fns:
            if fn.startswith("~$") or fn.startswith("."):
                continue
            total += 1
            e = ext_of(fn)
            types[e] = types.get(e, 0) + 1
            if e in DOC: buckets["文件"] += 1
            elif e in WEB: buckets["模擬畫面"] += 1
            elif e in VIDEO: buckets["影片"] += 1
            elif e in AUDIO: buckets["語音"] += 1
            elif e in IMG: buckets["圖片"] += 1
            elif e in CODE: buckets["程式"] += 1
            elif e in GIS: buckets["GIS"] += 1
            else: buckets["其他"] += 1
            if top_seg == ".":
                root_loose.append(fn)
            else:
                top[top_seg] = top.get(top_seg, 0) + 1
            try:
                mt = os.path.getmtime(os.path.join(dp, fn))
                if mt >= cutoff:
                    recent.append({"file": (fn if rel == "." else os.path.join(rel, fn)),
                                   "date": time.strftime("%Y-%m-%d", time.localtime(mt))})
            except OSError:
                pass

    recent.sort(key=lambda x: x["date"], reverse=True)
    out = {
        "path": root,
        "total_files": total,
        "by_bucket": buckets,
        "by_ext": dict(sorted(types.items(), key=lambda x: -x[1])),
        "top_level_dirs": dict(sorted(top.items(), key=lambda x: -x[1])),
        "root_loose_files": root_loose[:50],
        "root_loose_count": len(root_loose),
        "recent_files": recent[:40],
        "recent_days": a.days,
    }
    txt = json.dumps(out, ensure_ascii=False, indent=1)
    if a.out:
        open(a.out, "w", encoding="utf-8").write(txt)
        print("written:", a.out)
    else:
        sys.stdout.buffer.write(txt.encode("utf-8"))

if __name__ == "__main__":
    main()
