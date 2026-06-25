# -*- coding: utf-8 -*-
"""
BCP docx 增量修訂工具 — 對既有 docx 套用一組修正

用法：
    python patch_bcp_docx.py --input v1.docx --fixes fixes.json --output v2.docx

fixes.json 格式：
{
  "replace_paragraph_startswith": [
    {"prefix": "觀測站資料接收為本署", "new": "觀測站資料接收服務為本署..."}
  ],
  "replace_text": [
    {"find": "AP與DB 角色", "replace": "AP 與 DB 角色"}
  ],
  "replace_cell": [
    {"table_index": 4, "row": 3, "col": 3, "new_text": "資訊管理科"}
  ],
  "append_cell_text_if_missing": [
    {"table_index": 5, "row": 1, "col": 2, "contains": "備援", "fallback_new_text": "..."}
  ],
  "insert_paragraphs_after_startswith": [
    {"prefix": "3. RPO", "paragraphs": ["", "【本次演練情境說明】", "本次..."]}
  ]
}
"""
import argparse
import json
import os
from copy import deepcopy
from docx import Document
from docx.oxml.ns import qn


def set_text_keep_format(p, new_text):
    runs = p.runs
    if not runs:
        p.add_run(new_text)
        return
    runs[0].text = new_text
    for r in runs[1:]:
        r._element.getparent().remove(r._element)


def set_cell_text_keep_format(cell, new_text):
    paras = cell.paragraphs
    for pp in paras[1:]:
        pp._element.getparent().remove(pp._element)
    set_text_keep_format(paras[0], new_text)


def apply_fixes(doc, fixes):
    changes = 0

    # 1. replace paragraph by prefix
    for rule in fixes.get('replace_paragraph_startswith', []):
        for p in doc.paragraphs:
            if p.text.startswith(rule['prefix']):
                set_text_keep_format(p, rule['new'])
                changes += 1
                break

    # 2. replace text anywhere in paragraphs / cells
    for rule in fixes.get('replace_text', []):
        needle, sub = rule['find'], rule['replace']
        for p in doc.paragraphs:
            if needle in p.text:
                set_text_keep_format(p, p.text.replace(needle, sub))
                changes += 1
        for t in doc.tables:
            for row in t.rows:
                for cell in row.cells:
                    if needle in cell.text:
                        set_cell_text_keep_format(
                            cell, cell.text.replace(needle, sub))
                        changes += 1

    # 3. replace specific cell
    for rule in fixes.get('replace_cell', []):
        ti, ri, ci = rule['table_index'], rule['row'], rule['col']
        try:
            cell = doc.tables[ti].rows[ri].cells[ci]
            set_cell_text_keep_format(cell, rule['new_text'])
            changes += 1
        except IndexError:
            print(f'WARN: cell [{ti}][{ri}][{ci}] not found')

    # 4. insert paragraphs after a matching paragraph
    for rule in fixes.get('insert_paragraphs_after_startswith', []):
        prefix = rule['prefix']
        texts = rule['paragraphs']
        for i, p in enumerate(doc.paragraphs):
            if p.text.startswith(prefix):
                para_elem = p._element
                parent = para_elem.getparent()
                idx = list(parent).index(para_elem)
                src_runs = para_elem.findall(qn('w:r'))
                for txt in texts:
                    new_p = deepcopy(para_elem)
                    for r in new_p.findall(qn('w:r')):
                        new_p.remove(r)
                    if src_runs:
                        r_clone = deepcopy(src_runs[0])
                        for t_elem in r_clone.findall(qn('w:t')):
                            r_clone.remove(t_elem)
                        t_new = r_clone.makeelement(qn('w:t'), {})
                        t_new.text = txt
                        r_clone.append(t_new)
                        new_p.append(r_clone)
                    else:
                        r = new_p.makeelement(qn('w:r'), {})
                        t_new = r.makeelement(qn('w:t'), {})
                        t_new.text = txt
                        r.append(t_new)
                        new_p.append(r)
                    idx += 1
                    parent.insert(idx, new_p)
                    changes += 1
                break

    return changes


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--input', required=True)
    ap.add_argument('--fixes', required=True)
    ap.add_argument('--output', required=True)
    args = ap.parse_args()

    with open(args.fixes, 'r', encoding='utf-8') as f:
        fixes = json.load(f)
    doc = Document(args.input)
    n = apply_fixes(doc, fixes)
    os.makedirs(os.path.dirname(args.output) or '.', exist_ok=True)
    doc.save(args.output)
    print(f'OK: {n} changes applied → {args.output}')


if __name__ == '__main__':
    main()
