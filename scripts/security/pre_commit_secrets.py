#!/usr/bin/env python3
"""Pre-commit Secret Scanner"""
import re, sys, os, subprocess

PATTERNS = [
    (r'(?i)(api[_-]?key|api[_-]?secret|access[_-]?key|secret[_-]?key)\s*[:=]\s*["\x27][^"\x27]+["\x27]', "API Key/Secret"),
    (r'(?i)(password|passwd|pwd)\s*[:=]\s*["\x27][^"\x27]+["\x27]', "Hardcoded Password"),
    (r'(?i)(token|auth[_-]?token|bearer)\s*[:=]\s*["\x27][^"\x27]{10,}["\x27]', "Auth Token"),
    (r'(?i)(private[_-]?key|-----BEGIN.*PRIVATE KEY-----)', "Private Key"),
    (r'(?i)(ghp_[a-zA-Z0-9]{36})', "GitHub PAT"),
    (r'(?i)(sk-[a-zA-Z0-9]{32,})', "API Secret Key"),
    (r'(?i)(AKIA[0-9A-Z]{16})', "AWS Access Key"),
]

EXCLUDE_DIRS = {".git", "__pycache__", "node_modules", ".venv", "venv", "baseline", "snapshots"}
EXCLUDE_EXT = {".db", ".sqlite", ".pyc", ".png", ".jpg", ".pdf", ".zip", ".exe"}

def scan_file(filepath):
    issues = []
    ext = os.path.splitext(filepath)[1].lower()
    if ext in EXCLUDE_EXT:
        return issues
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
        for i, line in enumerate(lines, 1):
            for pattern, desc in PATTERNS:
                if re.search(pattern, line):
                    snippet = line.strip()[:50]
                    issues.append(f"  [{desc}] {filepath}:{i} -> {snippet}...")
    except Exception:
        pass
    return issues

def main():
    result = subprocess.run(["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
                          capture_output=True, text=True)
    files = [f.strip() for f in result.stdout.split("\n") if f.strip()]
    if not files:
        return 0
    print("Scanning staged files for secrets...")
    issues = []
    for f in files:
        parts = f.replace("\\", "/").split("/")
        if any(d in parts for d in EXCLUDE_DIRS):
            continue
        issues.extend(scan_file(f))
    if issues:
        print(f"\nBLOCKED: {len(issues)} potential secret(s):")
        for i in issues:
            print(i)
        print("\nCommit blocked.")
        return 1
    print("No secrets detected.")
    return 0

if __name__ == "__main__":
    sys.exit(main())