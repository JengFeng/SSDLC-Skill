#!/usr/bin/env python3
"""SBOM Generator — Software Bill of Materials (CycloneDX JSON)
Usage: python scripts/security/generate_sbom.py [project_dir]
"""
import subprocess, sys, os, json
from datetime import datetime

def generate_sbom(target):
    print("="*50)
    print("  SBOM Generator")
    print("="*50)
    
    sbom = {
        "bomFormat": "CycloneDX",
        "specVersion": "1.4",
        "serialNumber": f"urn:uuid:{os.urandom(16).hex()[:8]}",
        "version": 1,
        "metadata": {
            "timestamp": datetime.now().isoformat(),
            "component": {
                "name": os.path.basename(os.path.abspath(target)),
                "type": "application"
            }
        },
        "components": []
    }
    
    # Try pip freeze
    try:
        result = subprocess.run(["pip", "freeze"], capture_output=True, text=True, cwd=target)
        for line in result.stdout.split("\n"):
            line = line.strip()
            if "==" in line and not line.startswith("#"):
                name, version = line.split("==", 1)
                sbom["components"].append({
                    "type": "library",
                    "name": name,
                    "version": version,
                    "purl": f"pkg:pypi/{name}@{version}"
                })
    except Exception:
        pass
    
    # Try requirements.txt
    req_file = os.path.join(target, "requirements.txt")
    if os.path.exists(req_file):
        with open(req_file) as f:
            for line in f:
                line = line.strip()
                if "==" in line and not line.startswith("#"):
                    name, version = line.split("==", 1)
                    if not any(c["name"] == name for c in sbom["components"]):
                        sbom["components"].append({
                            "type": "library",
                            "name": name,
                            "version": version
                        })
    
    print(f"Components: {len(sbom['components'])}")
    
    output_path = os.path.join(target, "outputs", "sbom.json") if os.path.isdir(os.path.join(target, "outputs")) else "sbom.json"
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(sbom, f, indent=2)
    print(f"SBOM: {output_path}")
    return output_path

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    generate_sbom(target)