#!/usr/bin/env python3
"""Security Scan Runner — SAST (bandit) + Dependency Audit (pip-audit)
Usage: python scripts/security/run_security_scan.py [target_dir]
"""
import subprocess, sys, os, json
from datetime import datetime

def run_bandit(target):
    """Run Bandit SAST scanner"""
    print("\n" + "="*50)
    print("  BANDIT SAST Scan")
    print("="*50)
    try:
        result = subprocess.run(
            ["bandit", "-r", target, "-f", "json", "-ll", "-q"],
            capture_output=True, text=True, timeout=120
        )
        if result.returncode == 0:
            print("PASS: No security issues found")
            return {"status": "pass", "issues": 0, "details": []}
        data = json.loads(result.stdout) if result.stdout else {"results": []}
        issues = data.get("results", [])
        high = [i for i in issues if i.get("issue_severity") == "HIGH"]
        med = [i for i in issues if i.get("issue_severity") == "MEDIUM"]
        print(f"FAIL: {len(high)} HIGH, {len(med)} MEDIUM")
        for i in high[:5]:
            print(f"  HIGH: {i.get('filename')}:{i.get('line_number')} - {i.get('issue_text')}")
        return {"status": "fail", "issues": len(issues), "high": len(high), "details": high[:10]}
    except FileNotFoundError:
        print("SKIP: bandit not installed (pip install bandit)")
        return {"status": "skip", "reason": "bandit not installed"}
    except json.JSONDecodeError:
        print(f"WARN: bandit output parse error")
        return {"status": "warn", "issues": -1}

def run_pip_audit():
    """Run pip-audit dependency scan"""
    print("\n" + "="*50)
    print("  pip-audit Dependency Scan")
    print("="*50)
    try:
        result = subprocess.run(
            ["pip-audit", "--format", "json"],
            capture_output=True, text=True, timeout=120
        )
        if result.returncode == 0:
            print("PASS: No vulnerable dependencies")
            return {"status": "pass", "vulns": 0}
        data = json.loads(result.stdout) if result.stdout else {"dependencies": []}
        vulns = data.get("dependencies", [])
        print(f"FAIL: {len(vulns)} vulnerable dependencies")
        for v in vulns[:5]:
            print(f"  {v.get('name')} {v.get('version')}: {v.get('vulns', [{}])[0].get('id', '?')}")
        return {"status": "fail", "vulns": len(vulns), "details": vulns[:10]}
    except FileNotFoundError:
        print("SKIP: pip-audit not installed (pip install pip-audit)")
        return {"status": "skip", "reason": "pip-audit not installed"}

def main():
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    print(f"Security Scan: {target}")
    print(f"Time: {datetime.now().isoformat()}")
    
    results = {}
    results["bandit"] = run_bandit(target)
    results["pip_audit"] = run_pip_audit()
    
    # Summary
    print("\n" + "="*50)
    print("  SCAN SUMMARY")
    print("="*50)
    passed = all(r.get("status") in ("pass", "skip") for r in results.values())
    for name, r in results.items():
        status = r.get("status", "?")
        icon = {"pass": "PASS", "fail": "FAIL", "skip": "SKIP", "warn": "WARN"}.get(status, "?")
        print(f"  {icon}: {name}")
    
    # Output JSON report
    report = {
        "timestamp": datetime.now().isoformat(),
        "target": target,
        "results": results,
        "overall": "pass" if passed else "fail"
    }
    report_path = os.path.join(target, "outputs", "security_scan_report.json") if os.path.isdir(target) else "security_scan_report.json"
    os.makedirs(os.path.dirname(report_path) if os.path.dirname(report_path) else ".", exist_ok=True)
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\nReport: {report_path}")
    
    return 0 if passed else 1

if __name__ == "__main__":
    sys.exit(main())