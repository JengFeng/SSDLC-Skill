# -*- coding: utf-8 -*-
"""
架構圖產生器 — 多模式

模式：
  svg        純 SVG（推薦，可用 Inkscape／draw.io 編輯）
  png        Matplotlib 泳道圖（不可編輯）
  image-gen  輸出一段 prompt 給使用者貼進 image-gen skill（不直接呼叫，避免耦合）
  external   使用者自備圖 → 直接複製到輸出路徑

用法：
    python gen_arch_diagram.py --mode svg --config config.json --output arch.svg
"""
import argparse
import json
import os
import shutil


def gen_svg(config, output_path):
    """純手寫 SVG 泳道圖"""
    a = config.get('architecture', {})
    lanes = a.get('lanes', [
        {'name': '感測器', 'items': []},
        {'name': '現地紀錄器／PC', 'items': []},
        {'name': '文心機房（資訊管理科）', 'items': [], 'drill_target': True},
    ])
    arrows = a.get('arrows', [])
    title = a.get('title', config.get('system_name', '系統架構圖') + ' — 系統架構圖')

    LANE_W = 300
    LANE_H = 600
    total_w = LANE_W * len(lanes) + 60
    total_h = LANE_H + 160

    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{total_w}" height="{total_h}" '
        'viewBox="0 0 {tw} {th}" font-family="Microsoft JhengHei, sans-serif">'.format(tw=total_w, th=total_h),
        '<defs>',
        '<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">',
        '<path d="M 0 0 L 10 5 L 0 10 z" fill="#333"/>',
        '</marker>',
        '</defs>',
        # title
        f'<text x="{total_w//2}" y="35" text-anchor="middle" font-size="22" font-weight="bold">{title}</text>',
    ]

    # Lanes
    for i, lane in enumerate(lanes):
        x = 30 + i * LANE_W
        y = 70
        is_target = lane.get('drill_target', False)
        lane_fill = '#FFF3E0' if is_target else '#FAFAFA'
        svg.append(
            f'<rect x="{x}" y="{y}" width="{LANE_W}" height="{LANE_H}" '
            f'fill="{lane_fill}" stroke="#999" stroke-width="1" stroke-dasharray="4 4"/>')
        svg.append(
            f'<text x="{x + LANE_W//2}" y="{y + 30}" text-anchor="middle" '
            f'font-size="16" font-weight="bold">{lane["name"]}</text>')

        # Items
        items = lane.get('items', [])
        item_h = 90
        item_gap = 20
        total_items_h = len(items) * item_h + (len(items) - 1) * item_gap if items else 0
        start_y = y + 60 + max(0, (LANE_H - 100 - total_items_h) // 2)
        for j, item in enumerate(items):
            iy = start_y + j * (item_h + item_gap)
            ix = x + 30
            iw = LANE_W - 60
            fill = item.get('color', '#FFFFFF')
            stroke = '#C62828' if item.get('highlight') else '#424242'
            sw = 2.5 if item.get('highlight') else 1.3
            svg.append(
                f'<rect x="{ix}" y="{iy}" width="{iw}" height="{item_h}" '
                f'rx="6" ry="6" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')
            # Label (may be multiline)
            labels = item.get('label', '').split('\n')
            lh = 18
            label_start_y = iy + item_h // 2 - (len(labels) - 1) * lh // 2
            for k, line in enumerate(labels):
                svg.append(
                    f'<text x="{ix + iw//2}" y="{label_start_y + k * lh + 5}" '
                    f'text-anchor="middle" font-size="13">{line}</text>')
            if item.get('highlight_note'):
                svg.append(
                    f'<text x="{ix + iw//2}" y="{iy + item_h + 14}" '
                    f'text-anchor="middle" font-size="11" fill="#B71C1C" '
                    f'font-weight="bold">{item["highlight_note"]}</text>')

    # Arrows — simple implementation: from (lane_idx, item_idx) to (lane_idx, item_idx)
    for arr in arrows:
        # arr = {"from": [li, ii], "to": [li, ii], "label": "..."}
        fli, fii = arr['from']
        tli, tii = arr['to']
        fx = 30 + fli * LANE_W + LANE_W - 30
        tx = 30 + tli * LANE_W + 30
        # Compute y by assuming items evenly spread
        def _y(lane_idx, item_idx):
            items = lanes[lane_idx].get('items', [])
            item_h = 90
            item_gap = 20
            total_items_h = len(items) * item_h + (len(items) - 1) * item_gap if items else 0
            y_base = 70
            start_y = y_base + 60 + max(0, (LANE_H - 100 - total_items_h) // 2)
            return start_y + item_idx * (item_h + item_gap) + item_h // 2

        fy = _y(fli, fii)
        ty = _y(tli, tii)
        color = arr.get('color', '#333')
        svg.append(
            f'<line x1="{fx}" y1="{fy}" x2="{tx}" y2="{ty}" '
            f'stroke="{color}" stroke-width="1.8" marker-end="url(#arrow)"/>')
        if arr.get('label'):
            mx = (fx + tx) // 2
            my = (fy + ty) // 2 - 8
            svg.append(
                f'<text x="{mx}" y="{my}" text-anchor="middle" font-size="12" '
                f'fill="{color}">{arr["label"]}</text>')

    # Drill annotation
    note = a.get('drill_note',
        '【本次演練情境】主系統與異地備援機房同時毀損 → 於資訊管理科提供之備援虛擬主機重建環境並還原備份')
    svg.append(
        f'<rect x="30" y="{70 + LANE_H + 20}" width="{total_w - 60}" height="50" '
        f'rx="6" ry="6" fill="#FFF9C4" stroke="#F57C00" stroke-width="1.5"/>')
    svg.append(
        f'<text x="{total_w//2}" y="{70 + LANE_H + 52}" text-anchor="middle" '
        f'font-size="13" fill="#333">{note}</text>')

    svg.append('</svg>')

    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(svg))
    print(f'OK SVG: {output_path}')


def gen_png(config, output_path):
    """Matplotlib 泳道圖 — 同本次專案使用方式"""
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Rectangle
    import matplotlib.font_manager as fm

    for f in ['Microsoft JhengHei', 'Microsoft YaHei', 'SimHei']:
        try:
            fm.findfont(f, fallback_to_default=False)
            plt.rcParams['font.family'] = f
            break
        except Exception:
            continue
    plt.rcParams['axes.unicode_minus'] = False

    a = config.get('architecture', {})
    lanes = a.get('lanes', [])
    n = len(lanes)

    fig, ax = plt.subplots(figsize=(3.5 * n + 2, 8), dpi=180)
    ax.set_xlim(0, 3.5 * n + 2)
    ax.set_ylim(0, 8)
    ax.axis('off')

    title = a.get('title', config.get('system_name', '') + ' — 系統架構圖')
    ax.text((3.5 * n + 2) / 2, 7.8, title, ha='center', va='center',
            fontsize=15, fontweight='bold')

    for i, lane in enumerate(lanes):
        x = 0.3 + i * 3.5
        w = 3.2
        is_target = lane.get('drill_target', False)
        if is_target:
            bg = Rectangle((x, 0.3), w, 6.9, facecolor='#FFF3E0',
                           edgecolor='none', alpha=0.6)
            ax.add_patch(bg)
        ax.plot([x, x], [0.3, 7.2], ls=':', color='#666', lw=1)
        ax.plot([x + w, x + w], [0.3, 7.2], ls=':', color='#666', lw=1)
        ax.text(x + w / 2, 7.4, lane['name'], ha='center', va='center',
                fontsize=13, fontweight='bold')

        items = lane.get('items', [])
        if not items:
            continue
        item_h = 1.0
        gap = 0.3
        total = len(items) * item_h + (len(items) - 1) * gap
        start_y = 4.0 + total / 2 - item_h
        for j, item in enumerate(items):
            iy = start_y - j * (item_h + gap)
            color = item.get('color', '#FFFFFF')
            edge = '#C62828' if item.get('highlight') else '#424242'
            lw = 2.0 if item.get('highlight') else 1.3
            box = FancyBboxPatch((x + 0.3, iy), w - 0.6, item_h,
                                 boxstyle='round,pad=0.05',
                                 facecolor=color, edgecolor=edge,
                                 linewidth=lw)
            ax.add_patch(box)
            ax.text(x + w / 2, iy + item_h / 2, item.get('label', ''),
                    ha='center', va='center', fontsize=10,
                    fontweight='bold' if item.get('highlight') else 'normal')
            if item.get('highlight_note'):
                ax.text(x + w / 2, iy - 0.15, item['highlight_note'],
                        ha='center', va='center', fontsize=9,
                        color='#B71C1C', fontweight='bold')

    note = a.get('drill_note',
        '【本次演練情境】主系統與異地備援機房同時毀損 → 於資訊管理科提供之備援虛擬主機重建環境並還原備份')
    ax.text((3.5 * n + 2) / 2, 0.6, note, ha='center', va='center',
            fontsize=10, color='#333',
            bbox=dict(boxstyle='round,pad=0.4', facecolor='#FFF9C4',
                      edgecolor='#F57C00', linewidth=1.5))

    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
    plt.savefig(output_path, dpi=180, bbox_inches='tight', facecolor='white')
    print(f'OK PNG: {output_path}')


def gen_image_prompt(config, output_path):
    """產出 image-gen skill 要用的 prompt（不直接呼叫，避免 skill 耦合）"""
    a = config.get('architecture', {})
    lanes = a.get('lanes', [])
    lane_desc = '\n'.join(
        f"- {lane['name']}：" + '、'.join(
            item.get('label', '').split('\n')[0] for item in lane.get('items', []))
        for lane in lanes
    )
    prompt = f"""【架構圖 image-gen prompt】
將以下描述貼進 /image-gen skill：

系統：{config.get('system_name', '')}

請繪製一張系統架構圖，{len(lanes)} 個泳道垂直切分，左至右依序為：
{lane_desc}

樣式要求：
- 政府文件用途，風格正式、清晰
- 背景白色，泳道虛線分隔
- 演練還原目標（通常是最右側主機群）用紅框標註並註明「本次演練還原目標」
- 泳道間以箭頭連接，標註資料傳輸協定（HTTPS/MQTT/SFTP 等）
- 底部加一段黃色底紋框，寫演練情境說明

輸出格式：PNG，寬度 1600px 以上。
"""
    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(prompt)
    print(f'OK prompt saved: {output_path}')
    print('Next: 把這段 prompt 貼進 /image-gen skill，產出 PNG 後放到 config.architecture.diagram_path')


def copy_external(config, output_path):
    a = config.get('architecture', {})
    src = a.get('external_diagram_path')
    if not src or not os.path.exists(src):
        print(f'ERROR: external path not found: {src}')
        return
    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
    shutil.copy2(src, output_path)
    print(f'OK copied: {src} → {output_path}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--mode', required=True,
                    choices=['svg', 'png', 'image-gen', 'external'])
    ap.add_argument('--config', required=True)
    ap.add_argument('--output', required=True)
    args = ap.parse_args()

    with open(args.config, 'r', encoding='utf-8') as f:
        config = json.load(f)

    if args.mode == 'svg':
        gen_svg(config, args.output)
    elif args.mode == 'png':
        gen_png(config, args.output)
    elif args.mode == 'image-gen':
        gen_image_prompt(config, args.output)
    elif args.mode == 'external':
        copy_external(config, args.output)


if __name__ == '__main__':
    main()
