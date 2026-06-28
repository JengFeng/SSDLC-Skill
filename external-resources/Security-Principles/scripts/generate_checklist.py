#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_checklist.py — 依資通系統防護等級自動生成對應檢核表

用法：
    python generate_checklist.py <等級> [輸出目錄] [--domains 1,2,4]
    python generate_checklist.py --list-domains

    等級：general | medium | high

範例：
    python generate_checklist.py general
    python generate_checklist.py medium ./outputs/ --domains 1,4,6
    python generate_checklist.py --list-domains
"""

import os
import sys
import re
from datetime import datetime

LEVEL_FILES = {
    "general": "checklist_general.md",
    "medium": "checklist_medium.md",
    "high": "checklist_high.md",
}

LEVEL_NAMES = {
    "general": "普級 (General)",
    "medium": "中級 (Medium)",
    "high": "高級 (High)",
}

LEVEL_ITEM_COUNTS = {
    "general": 58,
    "medium": 70,
    "high": 80,
}

DOMAIN_INFO = [
    ("1", "存取控制", "帳號管理、最小權限、遠端存取", "10", "14", "14"),
    ("2", "事件日誌與可歸責性", "記錄事件、日誌格式、NTP校時、保護", "8", "13", "13"),
    ("3", "營運持續計畫", "RPO/RTO、資料備份、系統備援", "3", "8", "8"),
    ("4", "識別與鑑別", "身分驗證、密碼策略、多因子", "8", "12", "12"),
    ("5", "系統與服務獲得", "SSDLC全階段、威脅建模、OWASP", "11", "19", "19"),
    ("6", "系統與通訊保護", "TLS/HTTPS、憑證、資料加密", "4", "9", "9"),
    ("7", "系統與資訊完整性", "漏洞修復、系統監控、輸入驗證", "7", "7", "7"),
    ("8", "組織/實體/供應鏈", "人力、證照、ISO 27001、機房（非軟體）", "14", "14", "14"),
]


def list_domains():
    """列出 8 大安全構面清單"""
    print("=== 8 大安全構面清單 ===")
    print("")
    print(f"{'編號':<6} {'構面':<22} {'普級':<6} {'中級':<6} {'高級':<6} 說明")
    print("-" * 85)
    for d in DOMAIN_INFO:
        print(f"  {d[0]:<4} {d[1]:<20} {d[3]:<6} {d[4]:<6} {d[5]:<6} {d[2]}")
    print("")
    print("用法：@security-load [等級] [構面1,構面2,...]")
    print("範例：@security-load medium 1,4,6")
    print("")
    print("用法（腳本）：python generate_checklist.py <等級> --domains 1,4,6")
    sys.exit(0)


def main():
    # Handle --list-domains before argparse
    if "--list-domains" in sys.argv:
        list_domains()

    # Parse remaining args manually for simplicity
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    kwargs = {}
    i = 1
    while i < len(sys.argv):
        if sys.argv[i] == "--domains" and i + 1 < len(sys.argv):
            kwargs["domains"] = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--outdir" and i + 1 < len(sys.argv):
            kwargs["outdir"] = sys.argv[i + 1]
            i += 2
        else:
            i += 1

    if not args:
        print("錯誤：請指定防護等級（general / medium / high）")
        print("      或使用 --list-domains 列出構面清單")
        print(f"用法：python {sys.argv[0]} <等級> [輸出目錄] [--domains 1,2,4]")
        sys.exit(1)

    level = args[0].lower()
    if level not in LEVEL_FILES:
        print(f"錯誤：無效的等級 '{level}'。有效值：general, medium, high")
        sys.exit(1)

    out_dir = args[1] if len(args) > 1 else kwargs.get("outdir")
    domains_str = kwargs.get("domains")

    # Parse domain filter
    domains_filter = None
    if domains_str:
        domains_filter = set(int(d.strip()) for d in domains_str.split(",") if d.strip().isdigit())

    # Source file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    src_file = os.path.join(script_dir, "..", "assets", LEVEL_FILES[level])
    if not os.path.exists(src_file):
        print(f"錯誤：找不到來源檢核表：{src_file}")
        sys.exit(1)

    # Output directory
    if not out_dir:
        project_root = os.path.abspath(os.path.join(script_dir, "..", "..", "..", ".."))
        out_dir = os.path.join(project_root, "outputs")
    os.makedirs(out_dir, exist_ok=True)

    # Read and optionally filter content
    with open(src_file, "r", encoding="utf-8") as f:
        content = f.read()

    if domains_filter:
        filtered = []
        current_domain = None
        include = True
        for line in content.split("\n"):
            m = re.match(r'^##\s*構面\s*(\d+)', line)
            if m:
                current_domain = int(m.group(1))
                include = current_domain in domains_filter
            # Also handle appendix sections
            if line.startswith("## 附錄") and domains_filter:
                include = False
            if include:
                filtered.append(line)
        content = "\n".join(filtered)

    # Generate output
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    suffix = ""
    if domains_filter:
        suffix = "_" + "-".join(str(d) for d in sorted(domains_filter))
    out_name = f"security_checklist_{level}{suffix}_{timestamp}.md"
    out_path = os.path.join(out_dir, out_name)

    header = (
        f"<!-- 自動生成於：{datetime.now().isoformat()} -->\n"
        f"<!-- 防護等級：{LEVEL_NAMES[level]} -->\n"
    )
    if domains_filter:
        header += f"<!-- 限定構面：{sorted(domains_filter)} -->\n"
    header += (
        f"<!-- 控制措施總數：{LEVEL_ITEM_COUNTS[level]} 項 -->\n"
        f"<!-- 產生工具：Security-Principles/generate_checklist.py -->\n\n"
    )

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(header + content)

    print(f"[OK] 檢核表已生成：{out_path}")
    print(f"     等級：{LEVEL_NAMES[level]}")
    if domains_filter:
        print(f"     限定構面：{sorted(domains_filter)}")
    return out_path


if __name__ == "__main__":
    main()