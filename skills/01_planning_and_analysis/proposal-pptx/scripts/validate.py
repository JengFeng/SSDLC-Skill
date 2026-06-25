"""Static validation for pptxgenjs-produced .pptx files.

Catches the common failure modes that make PowerPoint trigger "repair mode"
(which silently strips content from innocent slides, not just the broken one).

Usage:
    python scripts/validate.py <path_to.pptx>

Exit code 0 = clean. Exit code 1 = found issues.
"""
import sys
import os
import re
import zipfile
from pathlib import Path


CHECKS = []


def check(name):
    def deco(fn):
        CHECKS.append((name, fn))
        return fn
    return deco


@check("XML parses for every slide")
def c_xml_parse(zf, slide_xmls):
    import xml.etree.ElementTree as ET
    errors = []
    for name, data in slide_xmls.items():
        try:
            ET.fromstring(data)
        except ET.ParseError as e:
            errors.append(f"{name}: {e}")
    return errors


@check("No negative cx / cy (triggers PowerPoint repair mode)")
def c_negative_dims(zf, slide_xmls):
    errors = []
    pat = re.compile(rb'c[xy]="(-\d+)"')
    for name, data in slide_xmls.items():
        for m in pat.finditer(data):
            errors.append(f"{name}: negative dimension {m.group(0).decode()}")
    return errors


@check("No 8-digit hex colors (pptxgenjs falls back to black)")
def c_bad_hex(zf, slide_xmls):
    errors = []
    # look for srgbClr val with 8 hex digits (valid is 6)
    pat = re.compile(rb'srgbClr val="([0-9A-Fa-f]{8})"')
    for name, data in slide_xmls.items():
        for m in pat.finditer(data):
            errors.append(f"{name}: 8-digit hex {m.group(1).decode()}")
    return errors


@check("Every r:embed reference maps to a media file")
def c_media_refs(zf, slide_xmls):
    errors = []
    names = set(zf.namelist())
    for name, data in slide_xmls.items():
        rels_name = f"ppt/slides/_rels/{Path(name).name}.rels"
        if rels_name not in names:
            continue
        rels = zf.read(rels_name).decode("utf-8", "ignore")
        for m in re.finditer(r'Id="(rId\d+)"\s+Type="[^"]*image[^"]*"\s+Target="([^"]+)"', rels):
            rid, target = m.group(1), m.group(2)
            # resolve relative path
            abs_target = os.path.normpath(os.path.join("ppt/slides", target)).replace("\\", "/")
            if abs_target not in names:
                errors.append(f"{name}: {rid} → {target} (not in zip)")
    return errors


@check("python-pptx can load the file")
def c_pptx_load(zf, slide_xmls):
    try:
        from pptx import Presentation
    except ImportError:
        return ["python-pptx not installed; skipping load test"]
    tmp = zf.filename
    try:
        p = Presentation(tmp)
        list(p.slides)  # force iteration
        return []
    except Exception as e:
        return [f"python-pptx load failed: {e}"]


@check("No rotated+flipped small shapes (triggers PowerPoint repair mode)")
def c_rotated_flipped(zf, slide_xmls):
    errors = []
    # match <a:xfrm flipH="1" rot="..."> or flipV + rot
    pat = re.compile(
        rb'<a:xfrm\b[^>]*?(?:flipH="1"|flipV="1")[^>]*?rot="\d+"'
        rb'|<a:xfrm\b[^>]*?rot="\d+"[^>]*?(?:flipH="1"|flipV="1")'
    )
    for name, data in slide_xmls.items():
        for m in pat.finditer(data):
            errors.append(f"{name}: rotated+flipped xfrm — {m.group(0)[:80].decode(errors='replace')}")
    return errors


@check("No zero-size shapes (w=0 or h=0 with visible content)")
def c_zero_size(zf, slide_xmls):
    errors = []
    pat = re.compile(rb'<a:ext cx="(\d+)" cy="(\d+)"/>')
    for name, data in slide_xmls.items():
        for m in pat.finditer(data):
            cx, cy = int(m.group(1)), int(m.group(2))
            # allow the root group which is always 0/0
            if cx == 0 or cy == 0:
                # check if this is inside grpSpPr (allowed) or an actual shape
                start = max(0, m.start() - 200)
                context = data[start:m.end()].decode("utf-8", "ignore")
                if "<p:grpSpPr>" in context and "</p:grpSpPr>" not in context[-50:]:
                    continue
                # skip if both zero (common for grpSp)
                if cx == 0 and cy == 0:
                    continue
                errors.append(f"{name}: shape ext cx={cx} cy={cy}")
    # dedupe per slide, only report first 3
    seen = set()
    out = []
    for e in errors:
        slide = e.split(":")[0]
        if slide not in seen:
            seen.add(slide)
            out.append(e)
    return out[:10]


def main(pptx_path):
    if not os.path.exists(pptx_path):
        print(f"error: file not found: {pptx_path}")
        return 2

    print(f"Validating: {pptx_path}\n")

    all_issues = []
    with zipfile.ZipFile(pptx_path) as zf:
        slide_xmls = {
            n: zf.read(n) for n in zf.namelist()
            if n.startswith("ppt/slides/slide") and n.endswith(".xml")
        }
        print(f"Found {len(slide_xmls)} slides\n")

        for name, fn in CHECKS:
            issues = fn(zf, slide_xmls)
            if issues:
                print(f"[FAIL] {name}")
                for i in issues[:5]:
                    print(f"    - {i}")
                if len(issues) > 5:
                    print(f"    ... and {len(issues) - 5} more")
                all_issues.extend((name, i) for i in issues)
            else:
                print(f"[PASS] {name}")

    print()
    if all_issues:
        print(f"✗ {len(all_issues)} issue(s) found — fix before delivery")
        return 1
    print("✓ All checks passed")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python validate.py <pptx>")
        sys.exit(2)
    sys.exit(main(sys.argv[1]))
