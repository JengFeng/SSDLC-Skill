"""Check the reverse-engineering Skill contracts and, optionally, one handoff."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "skills/00_cross_phase/reverse_engineering"
PHASE_DIRS = {1: "phase_01_reverse", 2: "phase_02_reverse", 3: "phase_03_reverse"}


def check(project: Path | None = None) -> list[str]:
    errors: list[str] = []
    main = SKILL / "SKILL.md"
    if not main.is_file() or not main.read_text(encoding="utf-8-sig").startswith("---"):
        errors.append("主 Skill 缺少有效前置 YAML 區塊")

    for number in range(1, 7):
        io_path = SKILL / "io_files" / f"phase_{number:02d}_reverse_io.yaml"
        children = list((SKILL / "sub_skills").glob(f"phase_{number:02d}_*/SKILL.md"))
        if len(children) != 1:
            errors.append(f"Phase {number:02d} 子 Skill 數量錯誤：{len(children)}")
        elif not children[0].read_text(encoding="utf-8-sig").startswith("---"):
            errors.append(f"Phase {number:02d} 子 Skill 缺少前置 YAML 區塊")
        if not io_path.is_file():
            errors.append(f"缺少 IO 契約：{io_path}")
            continue

        try:
            io = yaml.safe_load(io_path.read_text(encoding="utf-8-sig"))
            if not isinstance(io, dict) or not all(isinstance(io.get(k), list) for k in ("inputs", "outputs")):
                raise ValueError("inputs／outputs 必須是清單")
            child_text = children[0].read_text(encoding="utf-8-sig") if len(children) == 1 else ""
            for kind in ("inputs", "outputs"):
                names: set[str] = set()
                for item in io[kind]:
                    if (not isinstance(item, dict) or not isinstance(item.get("name"), str)
                            or not isinstance(item.get("required"), bool)):
                        raise ValueError(f"{kind} 項目需包含 name 與 required")
                    name = item["name"]
                    if name in names:
                        raise ValueError(f"{kind} 名稱重複：{name}")
                    names.add(name)
                    if kind == "outputs" and name not in child_text:
                        errors.append(f"Phase {number:02d} 子 Skill 未記載 IO 產物：{name}")
                    if project and number in PHASE_DIRS and kind == "outputs" and item["required"]:
                        output = project / "outputs" / PHASE_DIRS[number] / name
                        if not output.is_file():
                            errors.append(f"交接缺少必需逆向產物：{output}")
        except (OSError, yaml.YAMLError, ValueError) as exc:
            errors.append(f"IO 契約格式錯誤 {io_path}: {exc}")

    if project:
        spec_path = project / "specs/executable_spec.yaml"
        try:
            spec = yaml.safe_load(spec_path.read_text(encoding="utf-8-sig"))
            if not isinstance(spec, dict) or not isinstance(spec.get("project"), dict):
                raise ValueError("project 欄位缺失")
        except (OSError, yaml.YAMLError, ValueError, TypeError) as exc:
            errors.append(f"正向 SSOT 缺失或結構錯誤：{exc}")
        gates_path = project / "phase_gates.json"
        try:
            import json

            gates = json.loads(gates_path.read_text(encoding="utf-8-sig"))
            reverse = gates.get("reverse_engineering", {})
            approval = reverse.get("approval_status")
            if approval not in ("not_started", "pending", "approved", "rejected"):
                errors.append("phase_gates.json 的逆向審核狀態無效")
            completed = set(reverse.get("completed_phases", []))
            if approval != "approved" and completed.intersection({"04", "05", "06", 4, 5, 6}):
                errors.append("尚未人工核准，不可將 Phase 04～06 標記完成")
        except (OSError, ValueError, TypeError, AttributeError) as exc:
            errors.append(f"phase_gates.json 缺失或結構錯誤：{exc}")

    return errors


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", type=Path, help="交接檢查的專案目錄；省略時只檢查 Skill 與 IO 契約")
    args = parser.parse_args()
    project_path = args.project.resolve() if args.project else None
    failures = check(project_path)
    for issue in failures:
        print("FAIL:", issue)
    mode = "Skill／IO／交接" if project_path else "Skill／IO"
    print(f"逆向完整性檢查（{mode}）：6 階段，{len(failures)} 錯誤")
    sys.exit(bool(failures))
