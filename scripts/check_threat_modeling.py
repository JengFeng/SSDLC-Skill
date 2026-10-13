"""Check conditional threat-model delivery; never approve or mutate a project."""

import argparse
import json
from pathlib import Path, PureWindowsPath

import yaml


def is_required(gates):
    flags = [gates.get("security_baseline", {}).get("enabled", False)]
    settings = gates.get("threat_modeling", {})
    flags += [settings.get("requested", False), settings.get("selected", False)]
    if any(not isinstance(flag, bool) for flag in flags):
        raise ValueError("安全基準與威脅建模開關須為布林值")
    return any(flags)


def safe_path(root, value):
    if not isinstance(value, str) or not value.strip():
        raise ValueError("威脅模型路徑須為非空字串")
    if PureWindowsPath(value).drive or PureWindowsPath(value).is_absolute():
        raise ValueError("威脅模型須使用專案根相對路徑")
    target = (root / value).resolve()
    if not target.is_relative_to(root.resolve()):
        raise ValueError("威脅模型路徑超出專案")
    return target


def check(project, phase=None, mode="D"):
    root = Path(project).resolve()
    issues, notes = [], []
    try:
        gate_file = root / "phase_gates.json"
        gates = json.loads(gate_file.read_text(encoding="utf-8-sig")) if gate_file.exists() else {}
        required = is_required(gates)
        if not required:
            return [], ["威脅模型為選用；不因缺少模型阻擋階段"]
        spec_file = root / "specs/executable_spec.yaml"
        spec = yaml.safe_load(spec_file.read_text(encoding="utf-8-sig")) if spec_file.exists() else {}
        spec = spec or {}
        reverse = gates.get("reverse_engineering", {})
        if reverse.get("enabled", False):
            completed = {str(p).zfill(2) for p in reverse.get("completed_phases", [])}
            if "02" not in completed:
                return [], ["逆向 Phase 02 尚未完成；模型列為必要交付待辦"]
            path = "outputs/phase_02_reverse/threat_model.md"
        else:
            design = spec.get("phase_02_design", {})
            projection = spec.get("phases", {})
            gate_design = gates.get("phases", {}).get("02_system_design", {})
            completed = design.get("status") == "completed" or gate_design.get("status") == "completed"
            completed = completed or any(str(k).startswith("02") and v.get("status") == "completed" for k, v in projection.items())
            at_delivery = phase == "02" and mode in ("B", "C")
            later_phase = phase in ("03", "04", "05", "06")
            if not (completed or at_delivery or later_phase):
                return [], ["Phase 01／Phase 02 規劃中；模型為 Phase 02 必要交付待辦"]
            path = design.get("outputs", {}).get("threat_model")
            contract_path = None
            for name in ("io_files.yaml", "io_files.override.yaml"):
                file = root / "02_system_design" / name
                if file.exists():
                    contract = yaml.safe_load(file.read_text(encoding="utf-8-sig")) or {}
                    for item in contract.get("outputs", []):
                        if item.get("id") == "threat_model.md":
                            contract_path = item.get("path")
                            safe_path(root, contract_path)
            if path and contract_path and safe_path(root, path) != safe_path(root, contract_path):
                issues.append("威脅模型的 SSOT 與 IO 路徑不一致")
            path = contract_path or path or "02_system_design/outputs/threat_model.md"
        target = safe_path(root, path)
        if not target.is_file() or not target.read_text(encoding="utf-8-sig").strip():
            issues.append(f"必要威脅模型缺失或為空：{path}")
        else:
            notes.append(f"必要威脅模型存在：{path}；品質與控制驗證仍須另行審查")
    except (OSError, ValueError, TypeError, AttributeError, yaml.YAMLError) as exc:
        issues.append(f"威脅模型條件／路徑檢查失敗：{exc}")
    return issues, notes


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", required=True)
    parser.add_argument("--phase", choices=["01", "02", "03", "04", "05", "06"])
    parser.add_argument("--mode", default="D", choices=["A", "B", "C", "D", "E", "S"])
    args = parser.parse_args()
    errors, notes = check(args.project, args.phase, args.mode)
    for note in notes:
        print(f"[PASS] {note}")
    for error in errors:
        print(f"[FAIL] {error}")
    raise SystemExit(bool(errors))
