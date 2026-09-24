#!/usr/bin/env python3
"""Check the repository's reverse-engineering rules, Skills and IO templates."""

import json
import re
from pathlib import Path, PurePosixPath

import yaml


ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "skills/00_cross_phase/reverse_engineering"
PHASES = ("03", "02", "01", "04", "05", "06")
COMMANDS = ("@reverse", "@reverse-code", "@reverse-design", "@reverse-requirements", "@guide reverse", "@optimize")


def read(path, errors):
    target = ROOT / path
    if not target.is_file():
        errors.append(f"缺少檔案：{path}")
        return ""
    return target.read_text(encoding="utf-8-sig")


def main():
    errors = []
    root_rules = read("AGENTS.md", errors)
    core = read("docs/CORE_RULES.md", errors)
    harness = read("docs/Harness_Optimization_SKILL.md", errors)
    agents = read(".agents/AGENTS.md", errors)
    commands = read("docs/commands_reference.md", errors)
    readme = read("README.md", errors)
    checker = read("scripts/check_spec_integrity.py", errors)
    read("memory.md", errors)
    read("backups/BACKUP_MANIFEST.md", errors)
    read("skills/00_cross_phase/reverse_engineering/SKILL.md", errors)

    for path in ("docs/CORE_RULES.md", ".agents/AGENTS.md", "scripts/check_spec_integrity.py",
                 "scripts/check_reverse_alignment.py", "backups/BACKUP_MANIFEST.md"):
        if path not in root_rules and path not in ("scripts/check_reverse_alignment.py",):
            errors.append(f"根 AGENTS.md 缺少參照：{path}")
    if "8-3. 逆向工程的檔案與審核契約" not in core:
        errors.append("CORE_RULES.md 缺少逆向核心規範")
    if "逆向工程核心規範與檔案對齊防線" not in harness:
        errors.append("Harness Optimization 缺少逆向對齊檢查點")
    for label, content in ((".agents/AGENTS.md", agents), ("docs/commands_reference.md", commands), ("README.md", readme)):
        for command in COMMANDS:
            if command not in content:
                errors.append(f"{label} 缺少指令：{command}")
    if "check_reverse_contract_io" not in checker or "approval_status" not in checker:
        errors.append("Mode E 缺少逆向 IO 或人工審核檢查")

    try:
        gates = json.loads(read("phase_gates.json", errors))
        reverse = gates["reverse_engineering"]
        for key in ("enabled", "mode", "current_phase", "completed_phases", "approval_status", "approved_at", "approval_record", "skill_path"):
            if key not in reverse:
                errors.append(f"phase_gates.json 缺少 reverse_engineering.{key}")
    except (ValueError, KeyError, TypeError) as exc:
        errors.append(f"phase_gates.json 無效：{exc}")

    # 依逆向執行順序檢查引用，避免下游誤把未來階段的產物當作上游輸入。
    prior_outputs = set()
    for phase in PHASES:
        yaml_path = BASE / "io_files" / f"phase_{phase}_reverse_io.yaml"
        skill_paths = list((BASE / "sub_skills").glob(f"phase_{phase}_*/SKILL.md"))
        if len(skill_paths) != 1:
            errors.append(f"Phase {phase} 子 Skill 數量須為 1，實際 {len(skill_paths)}")
        if not yaml_path.is_file():
            errors.append(f"缺少逆向 IO：{yaml_path.relative_to(ROOT)}")
            continue
        try:
            contract = yaml.safe_load(yaml_path.read_text(encoding="utf-8-sig"))
        except yaml.YAMLError as exc:
            errors.append(f"Phase {phase} YAML 無效：{exc}")
            continue
        if not isinstance(contract, dict):
            errors.append(f"Phase {phase} IO 頂層須為 mapping")
            continue
        if str(contract.get("phase")) != phase or contract.get("mode") != "reverse_engineering" or contract.get("path_base") != "project_root":
            errors.append(f"Phase {phase} phase/mode/path_base 不一致")
        phase_outputs = set()
        for direction in ("inputs", "outputs"):
            items = contract.get(direction)
            if not isinstance(items, list):
                errors.append(f"Phase {phase} {direction} 須為清單")
                continue
            ids = set()
            for item in items:
                if not isinstance(item, dict):
                    errors.append(f"Phase {phase} {direction} 項目須為 mapping")
                    continue
                item_id, path = item.get("id"), item.get("path")
                if not isinstance(item_id, str) or not item_id or item_id in ids:
                    errors.append(f"Phase {phase} {direction} id 缺失或重複：{item_id}")
                ids.add(item_id)
                if not isinstance(path, str) or not path or "\\" in path or PurePosixPath(path).is_absolute() or ".." in PurePosixPath(path).parts:
                    errors.append(f"Phase {phase} {direction} path 不安全：{path}")
                if direction == "inputs" and isinstance(path, str) and path.startswith("outputs/") and path not in prior_outputs:
                    errors.append(f"Phase {phase} 上游輸入無對應既有輸出：{path}")
                if not isinstance(item.get("required"), bool):
                    errors.append(f"Phase {phase} {direction} required 須為布林值：{item_id}")
                if direction == "outputs" and isinstance(path, str):
                    phase_outputs.add(path)
                    if PurePosixPath(path).name != item_id:
                        errors.append(f"Phase {phase} 輸出 id/path 檔名不一致：{item_id} / {path}")
        if len(skill_paths) == 1:
            skill = skill_paths[0].read_text(encoding="utf-8-sig")
            match = re.search(r"^## [^\n]*輸出清單[^\n]*\n(.*?)(?=^## |\Z)", skill, re.MULTILINE | re.DOTALL)
            listed = set(re.findall(r"^\|\s*`([^`]+)`\s*\|", match.group(1), re.MULTILINE)) if match else set()
            declared = {item.get("id") for item in contract.get("outputs", []) if isinstance(item, dict)}
            if listed != declared:
                errors.append(f"Phase {phase} 子 Skill 輸出清單與 IO 不一致：Skill={sorted(listed)} IO={sorted(declared)}")
        prior_outputs.update(phase_outputs)

    if errors:
        for error in errors:
            print(f"[FAIL] {error}")
        print(f"逆向框架對齊失敗：{len(errors)} 項")
        return 1
    print("[PASS] 根規章、核心規範、指令、六階段 Skill/IO、審核與 Mode E 對齊")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
