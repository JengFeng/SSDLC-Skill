#!/usr/bin/env python3
"""DAST Runner — OWASP ZAP Automation
Usage: python scripts/security/run_dast.py http://127.0.0.1:5000
"""
import subprocess, sys, os, json, time
from datetime import datetime

def run_zap_scan(target_url):
    print("="*50)
    print("  OWASP ZAP DAST Scan")
    print("="*50)
    print(f"Target: {target_url}")
    
    # Check if ZAP is available
    zap_paths = [
        r"C:\Program Files\OWASP\Zed Attack Proxy\zap.bat",
        "/usr/bin/zap.sh",
        "/usr/local/bin/zap.sh",
    ]
    zap_exe = None
    for p in zap_paths:
        if os.path.exists(p):
            zap_exe = p
            break
    
    if not zap_exe:
        print("SKIP: OWASP ZAP not found. Install from https://www.zaproxy.org/")
        print("Manual alternative: open ZAP GUI > Quick Start > Automated Scan")
        return {"status": "skip", "reason": "ZAP not installed"}
    
    # ZAP API scan (headless)
    print(f"Starting ZAP scan (this may take 2-5 minutes)...")
    try:
        # Start ZAP daemon
        zap_dir = os.path.dirname(zap_exe)
        result = subprocess.run(
            [zap_exe, "-cmd", "-quickurl", target_url, "-quickout", "zap_report.html"],
            capture_output=True, text=True, timeout=300, cwd=os.getcwd()
        )
        print("ZAP scan completed")
        return {"status": "completed", "output": "zap_report.html"}
    except subprocess.TimeoutExpired:
        print("WARN: ZAP scan timed out")
        return {"status": "timeout"}
    except Exception as e:
        print(f"ZAP error: {e}")
        return {"status": "error", "reason": str(e)}

def run_quick_dast(target_url):
    """Lightweight HTTP security header check (no ZAP required)"""
    import urllib.request
    print("\n" + "="*50)
    print("  Quick HTTP Security Headers Check")
    print("="*50)
    
    checks = {
        "Strict-Transport-Security": "HSTS enabled",
        "X-Content-Type-Options": "MIME sniffing protection",
        "X-Frame-Options": "Clickjacking protection",
        "X-XSS-Protection": "XSS filter",
        "Content-Security-Policy": "CSP",
    }
    
    results = {}
    try:
        req = urllib.request.Request(target_url)
        resp = urllib.request.urlopen(req, timeout=10)
        for header, desc in checks.items():
            present = header in resp.headers
            results[header] = present
            icon = "PASS" if present else "WARN"
            print(f"  {icon}: {header} ({desc})")
        passed = sum(1 for v in results.values() if v)
        print(f"  Score: {passed}/{len(checks)}")
        return {"status": "done", "score": f"{passed}/{len(checks)}", "details": results}
    except Exception as e:
        print(f"  ERROR: {e}")
        return {"status": "error", "reason": str(e)}

def main():
    target = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:5000"
    print(f"DAST Scan: {target}")
    print(f"Time: {datetime.now().isoformat()}")
    
    quick = run_quick_dast(target)
    zap = run_zap_scan(target)
    
    return 0

if __name__ == "__main__":
    sys.exit(main())