# -*- coding: utf-8 -*-
"""截雛形各畫面 PNG，供 04 功能規格／05 畫面規格 嵌入「模擬畫面截圖」。
用 headless Edge：把雛形複製一份、注入「切到該畫面的 JS」再截圖。

用法: python capture_screens.py <雛形.html> <輸出資料夾> [screens.json] [寬x高]
  screens.json（依雛形填，agent 反推雛形時順手產）：
    [{"name":"SCR-P01","show":"pubGuide()"},
     {"name":"SCR-V03","show":"openSheet(0); vForm()"}]   # show = 切到該畫面要跑的 JS（多句用 ;）
  無 screens.json → 只截雛形預設畫面一張（screen_full.png）。
  寬x高 預設 430x920（行動版直式）；桌面版傳 1280x900。

產物：<輸出資料夾>/<name>.png，render_fs/render_scr 會自動找同名圖嵌入。
注意：雛形若是 IIFE 封裝、切畫面函式非全域，注入會無效 → 該畫面截到預設頁；可改 show 或把函式掛 window。
"""
import json, sys, os, subprocess, urllib.parse

proto = sys.argv[1] if len(sys.argv) > 1 else "02_雛形畫面.html"
outdir = sys.argv[2] if len(sys.argv) > 2 else "screens"
cfg = sys.argv[3] if len(sys.argv) > 3 else ""
wh = sys.argv[4] if len(sys.argv) > 4 else "430x920"
W, H = (wh.split("x") + ["920"])[:2]
os.makedirs(outdir, exist_ok=True)
EDGE = os.environ.get("EDGE_PATH", r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")

screens = []
if cfg and os.path.exists(cfg):
    screens = json.load(open(cfg, encoding="utf-8")) or []
if not screens:
    screens = [{"name": "screen_full", "show": ""}]

proto_html = open(proto, encoding="utf-8").read()
done = []
for s in screens:
    name = str(s.get("name") or "").strip()
    show = (s.get("show") or "").replace("</", "<\\/")
    if not name:
        continue
    inject = ('<script>window.addEventListener("load",function(){try{' + show +
              '}catch(e){};setTimeout(function(){window.scrollTo(0,0);},350);});</script>')
    pdir = os.path.dirname(os.path.abspath(proto))  # temp 放雛形同層，相對資源(img/CSS)才不斷
    tmp = os.path.join(pdir, "_t_cap_" + name + ".html")
    open(tmp, "w", encoding="utf-8").write(proto_html + inject)
    png = os.path.abspath(os.path.join(outdir, name + ".png"))
    url = "file:///" + urllib.parse.quote(os.path.abspath(tmp).replace("\\", "/"), safe="/:")
    try:
        subprocess.run([EDGE, "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
                        f"--window-size={W},{H}", "--virtual-time-budget=6500", f"--screenshot={png}", url],
                       capture_output=True, timeout=40)
    except Exception as e:
        print("截圖失敗", name, e)
    try:
        os.remove(tmp)
    except Exception:
        pass
    if os.path.exists(png):
        done.append(name + ".png")
print(f"截圖完成 {len(done)} 張 -> {outdir}/:", "、".join(done) if done else "（無）")
