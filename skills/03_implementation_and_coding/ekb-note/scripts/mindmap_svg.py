#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
mindmap_svg.py — 產生橫向心智圖 SVG（給 EKB 筆記嵌入用）

文字清晰、可縮放、零外掛依賴（純 SVG，分享連結也能看）。
agent 把一篇筆記的重點整理成 spec → 產 SVG → 嵌進 note content 頂端。

用法:
    python mindmap_svg.py spec.json          # spec 從檔案
    echo '{...}' | python mindmap_svg.py -    # spec 從 stdin
    → SVG 字串印到 stdout

spec.json 格式:
{
  "root": "中心主題\\n(可換行)",
  "tagline": "底部一句話總結 (可省)",
  "branches": [
    {"title": "①分支名", "color": "#0284c7", "items": ["重點1","重點2"]},
    ...
  ]
}
建議 5±2 個分支、每分支 3-5 個重點。color 用 #RRGGBB。

嵌入筆記：把回傳的 SVG 包成 `<div style="overflow-x:auto;">{svg}</div>` 放進 note content，
再 PATCH /api/notes.php?id=X 的 content（記得帶 change_reason）。
"""
import sys, json

PALETTE = ['#0284c7', '#16a34a', '#ca8a04', '#7c3aed', '#dc2626', '#0891b2', '#db2777', '#ea580c']

def esc(s):
    return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

def gen_svg(root, branches, tagline=''):
    PAD = 20; ROOT_W = 150; ROOT_X = PAD
    BR_X = ROOT_X + ROOT_W + 70; BR_W = 360
    HDR_H = 30; ITEM_H = 22; BR_GAP = 16

    def bh(items): return HDR_H + len(items) * ITEM_H + 10
    heights = [bh(b.get('items', [])) for b in branches]
    total_h = sum(heights) + BR_GAP * (len(branches) - 1) if branches else 100
    H = max(total_h + PAD * 2 + 40, 360)
    W = BR_X + BR_W + PAD
    root_cy = PAD + total_h / 2

    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H+50}" '
           f'style="max-width:100%; height:auto; font-family:\'Microsoft JhengHei\',sans-serif; '
           f'background:#fcfcfb; border:1px solid #e5e7eb; border-radius:10px;">']
    y = PAD
    for i, (b, h) in enumerate(zip(branches, heights)):
        title = b.get('title', f'分支{i+1}')
        color = b.get('color') or PALETTE[i % len(PALETTE)]
        items = b.get('items', [])
        cy = y + h / 2
        x1 = ROOT_X + ROOT_W; y1 = root_cy; x2 = BR_X; y2 = cy; mx = (x1 + x2) / 2
        svg.append(f'<path d="M{x1},{y1} C{mx},{y1} {mx},{y2} {x2},{y2}" stroke="{color}" stroke-width="2.5" fill="none" opacity="0.55"/>')
        svg.append(f'<rect x="{BR_X}" y="{y}" width="{BR_W}" height="{h}" rx="8" fill="{color}0d" stroke="{color}" stroke-width="1.5"/>')
        svg.append(f'<rect x="{BR_X}" y="{y}" width="{BR_W}" height="{HDR_H}" rx="8" fill="{color}"/>')
        svg.append(f'<text x="{BR_X+12}" y="{y+20}" fill="#fff" font-size="14.5" font-weight="700">{esc(title)}</text>')
        iy = y + HDR_H + 16
        for it in items:
            svg.append(f'<circle cx="{BR_X+16}" cy="{iy-4}" r="2.5" fill="{color}"/>')
            svg.append(f'<text x="{BR_X+26}" y="{iy}" fill="#374151" font-size="12.5">{esc(it)}</text>')
            iy += ITEM_H
        y += h + BR_GAP

    rh = 64
    svg.append(f'<rect x="{ROOT_X}" y="{root_cy-rh/2}" width="{ROOT_W}" height="{rh}" rx="12" fill="#0f172a"/>')
    for i, line in enumerate(str(root).split('\n')):
        svg.append(f'<text x="{ROOT_X+ROOT_W/2}" y="{root_cy-4+i*20}" fill="#fff" font-size="16" font-weight="800" text-anchor="middle">{esc(line)}</text>')
    if tagline:
        svg.append(f'<text x="{W/2}" y="{H+28}" fill="#475569" font-size="13" font-weight="600" text-anchor="middle">{esc(tagline)}</text>')
    svg.append('</svg>')
    return ''.join(svg)

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    src = sys.argv[1]
    raw = sys.stdin.read() if src == '-' else open(src, encoding='utf-8').read()
    spec = json.loads(raw)
    out = gen_svg(spec['root'], spec.get('branches', []), spec.get('tagline', ''))
    sys.stdout.reconfigure(encoding='utf-8')
    print(out)

if __name__ == '__main__':
    main()
