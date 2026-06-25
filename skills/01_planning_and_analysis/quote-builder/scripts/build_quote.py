#!/usr/bin/env python
"""
Quote Builder — 產生政府/企業案標準格式報價單 .xlsx

用法 1（CLI + JSON config）：
  python build_quote.py --output out.xlsx --client "桃園市政府" --project "AI智慧栽培系統" --config items.json

用法 2（import）：
  from build_quote import build_quote
  build_quote(output, client, project, items, mgmt_pct=0.05, tax_pct=0.05)

items 格式（list of dict）：
  [
    {"name": "工項名稱", "unit": "月", "qty": 4.0, "price": 50000, "note": "備註"},
    {"name": "雲端AI服務租賃(首年)", "unit": "年", "qty": 1, "price": 200000, "note": "..."},
    ...
  ]
"""
import argparse, json, os, shutil, sys
from copy import copy
from openpyxl import load_workbook
from openpyxl.utils import get_column_letter

SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE = os.path.join(SKILL_DIR, "templates", "base_template.xlsx")


def _grab_styles(ws):
    """從 base_template 抓所有需要的 cell style 樣板。"""
    return {
        't1':      copy(ws['A1']._style),
        't2':      copy(ws['A2']._style),
        't3':      copy(ws['A3']._style),
        'header':  copy(ws['A4']._style),
        'idx':     copy(ws['A6']._style),
        'name':    copy(ws['B6']._style),
        'unit':    copy(ws['C6']._style),
        'qty':     copy(ws['D6']._style),
        'price':   copy(ws['E6']._style),
        'total':   copy(ws['F6']._style),
        'note':    copy(ws['G6']._style),
        'subA':    copy(ws['A26']._style),
        'subF':    copy(ws['F26']._style),
        'mgmtA':   copy(ws['A27']._style),
        'mgmtB':   copy(ws['B27']._style),
        'mgmtC':   copy(ws['C27']._style),
        'mgmtE':   copy(ws['E27']._style),
        'mgmtF':   copy(ws['F27']._style),
        'grandA':  copy(ws['A29']._style),
        'grandF':  copy(ws['F29']._style),
    }


def build_quote(output, client, project, items, mgmt_pct=0.05, tax_pct=0.05,
                sheet_title=None):
    """
    items: list of dict, 每項含 name/unit/qty/price/note
    回傳：dict {合計, 管理費, 稅, 總計}
    """
    if not os.path.exists(TEMPLATE):
        raise FileNotFoundError(f"Template not found: {TEMPLATE}")

    shutil.copy(TEMPLATE, output)
    wb = load_workbook(output)
    ws = wb.active

    if sheet_title:
        ws.title = sheet_title[:31]  # Excel sheet name limit

    S = _grab_styles(ws)
    col_widths = {get_column_letter(c): ws.column_dimensions[get_column_letter(c)].width
                  for c in range(1, 8)}

    # 清空
    for mr in list(ws.merged_cells.ranges):
        ws.unmerge_cells(str(mr))
    for row in ws.iter_rows():
        for cell in row:
            cell.value = None
    for col, w in col_widths.items():
        if w:
            ws.column_dimensions[col].width = w

    # 標題列
    ws['A1'] = client; ws['A1']._style = S['t1']; ws.merge_cells('A1:F1')
    ws['A2'] = f'「{project}」' if not project.startswith('「') else project
    ws['A2']._style = S['t2']; ws.merge_cells('A2:F2')
    ws['A3'] = '經費明細表'; ws['A3']._style = S['t3']; ws.merge_cells('A3:F3')

    # 表頭
    for i, h in enumerate(['編號', '內容', '單位', '數量', '單價', '總價', '備註'], start=1):
        ws.cell(row=4, column=i, value=h)._style = S['header']

    # 工項列
    r = 5
    for idx, it in enumerate(items, start=1):
        ws.cell(row=r, column=1, value=idx)._style = S['idx']
        ws.cell(row=r, column=2, value=it['name'])._style = S['name']
        ws.cell(row=r, column=3, value=it.get('unit', '月'))._style = S['unit']
        ws.cell(row=r, column=4, value=it['qty'])._style = S['qty']
        ws.cell(row=r, column=5, value=it['price'])._style = S['price']
        ws.cell(row=r, column=6, value=f'=D{r}*E{r}')._style = S['total']
        ws.cell(row=r, column=7, value=it.get('note', ''))._style = S['note']
        r += 1

    # 合計
    he = r
    ws.cell(row=he, column=1, value='合計')._style = S['subA']
    ws.merge_cells(start_row=he, start_column=1, end_row=he, end_column=5)
    ws.cell(row=he, column=6, value=f'=SUM(F5:F{he-1})')._style = S['subF']
    r += 1

    # 廠商管理費（中文天干序號接續 items 編號之後）
    mg = r
    n = len(items)
    ws.cell(row=mg, column=1, value=_zh_num(n + 1))._style = S['mgmtA']
    ws.cell(row=mg, column=2, value=f'廠商管理費用利潤(約{int(mgmt_pct*100)}%)')._style = S['mgmtB']
    ws.cell(row=mg, column=3, value='式')._style = S['mgmtC']
    ws.cell(row=mg, column=5, value=f'=F{he}*{mgmt_pct}')._style = S['mgmtE']
    ws.cell(row=mg, column=6, value=f'=E{mg}')._style = S['mgmtF']
    r += 1

    # 營業稅
    tx = r
    ws.cell(row=tx, column=1, value=_zh_num(n + 2))._style = S['mgmtA']
    ws.cell(row=tx, column=2, value=f'營業稅{int(tax_pct*100)}%')._style = S['mgmtB']
    ws.cell(row=tx, column=3, value='式')._style = S['mgmtC']
    ws.cell(row=tx, column=5, value=f'=(F{he}+F{mg})*{tax_pct}')._style = S['mgmtE']
    ws.cell(row=tx, column=6, value=f'=E{tx}')._style = S['mgmtF']
    r += 1

    # 總計
    gt = r
    ws.cell(row=gt, column=1, value='總 計')._style = S['grandA']
    ws.merge_cells(start_row=gt, start_column=1, end_row=gt, end_column=5)
    ws.cell(row=gt, column=6, value=f'=F{he}+F{mg}+F{tx}')._style = S['grandF']

    wb.save(output)

    # 驗算
    sub = sum(it['qty'] * it['price'] for it in items)
    mg_v = sub * mgmt_pct
    tx_v = (sub + mg_v) * tax_pct
    return {
        '合計': sub,
        '管理費': mg_v,
        '稅': tx_v,
        '總計': sub + mg_v + tx_v,
    }


_ZH_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
              '十一', '十二', '十三', '十四', '十五']
def _zh_num(n):
    return _ZH_DIGITS[n] if n < len(_ZH_DIGITS) else str(n)


def main():
    p = argparse.ArgumentParser(description="Build .xlsx quote in 政府案 format")
    p.add_argument('--output', '-o', required=True, help="輸出 .xlsx 路徑")
    p.add_argument('--client', '-c', required=True, help="客戶機關名稱（例：桃園市政府）")
    p.add_argument('--project', '-p', required=True, help="專案名稱")
    p.add_argument('--config', required=True, help="items JSON 檔路徑")
    p.add_argument('--mgmt-pct', type=float, default=0.05, help="廠商管理費比率 (default 0.05)")
    p.add_argument('--tax-pct', type=float, default=0.05, help="營業稅比率 (default 0.05)")
    p.add_argument('--sheet-title', default=None, help="工作表名稱 (可選)")
    args = p.parse_args()

    with open(args.config, 'r', encoding='utf-8') as f:
        items = json.load(f)

    result = build_quote(args.output, args.client, args.project, items,
                         args.mgmt_pct, args.tax_pct, args.sheet_title)
    print(f"輸出檔：{args.output}")
    print(f"合計 = {result['合計']:,}")
    print(f"+管理費 {int(args.mgmt_pct*100)}% = {result['管理費']:,.0f}")
    print(f"+營業稅 {int(args.tax_pct*100)}% = {result['稅']:,.0f}")
    print(f"總計 = {result['總計']:,.0f}")


if __name__ == '__main__':
    main()
