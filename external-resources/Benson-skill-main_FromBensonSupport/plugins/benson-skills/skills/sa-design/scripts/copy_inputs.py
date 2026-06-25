# -*- coding: utf-8 -*-
"""把既有的「需求說明書」與「雛形」複製進套件資料夾，命名 01_/02_，讓選單連得到。
產完整套件時務必跑這支（既有檔是搬進來、不是重新生成）。

用法: python copy_inputs.py <需求書路徑> <雛形路徑> [輸出資料夾=.]
  需求書可為 .pdf/.docx；雛形為 .html。任一來源不存在就略過該項。
"""
import sys, shutil, os

req = sys.argv[1] if len(sys.argv) > 1 else ""
proto = sys.argv[2] if len(sys.argv) > 2 else ""
out = sys.argv[3] if len(sys.argv) > 3 else "."
os.makedirs(out, exist_ok=True)
done = []

if req and os.path.exists(req):
    ext = os.path.splitext(req)[1] or ".pdf"
    dst = os.path.join(out, "01_需求說明書" + ext)
    shutil.copy(req, dst)
    done.append(os.path.basename(dst))
elif req:
    print("⚠ 需求書來源不存在:", req)

if proto and os.path.exists(proto):
    dst = os.path.join(out, "02_雛形畫面.html")
    shutil.copy(proto, dst)
    done.append(os.path.basename(dst))
elif proto:
    print("⚠ 雛形來源不存在:", proto)

print("複製完成:", "、".join(done) if done else "（無來源檔，未複製）")
print("注意：若需求書是 .docx 而非 .pdf，doc_common 的 NAV 第 01 項預設指向 01_需求說明書.pdf，副檔名不同時請一併調整 NAV 或先轉 PDF。")
