"""Read-only check of the reverse-engineering Skill and one project's handoff."""

from __future__ import annotations

import argparse
import hashlib
import subprocess
import sys
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "skills/00_cross_phase/reverse_engineering"
DIAGRAM = ROOT / "skills/00_cross_phase/diagram-design"
DIAGRAM_VENDOR_SHA256 = "9a7d8eb0f341e321b64f996cb7ffaabb8c549cfd6f8723f848daab777ee9e0d0"
STAGE_DIRS = (
    "01_planning_and_analysis", "02_system_design", "03_implementation_and_coding",
    "04_testing", "05_deployment", "06_maintenance",
)
PHASE_DIRS = {
    1: "phase_01_reverse",
    2: "phase_02_reverse",
    3: "phase_03_reverse",
}


def check(project: Path) -> list[str]:
    errors: list[str] = []
    for path in (DIAGRAM / "SKILL.md", DIAGRAM / "vendor/SKILL.md", DIAGRAM / "LICENSE"):
        if not path.is_file():
            errors.append(f"缺少 Diagram Design 資料：{path}")
    vendor_skill = DIAGRAM / "vendor/SKILL.md"
    if vendor_skill.is_file() and hashlib.sha256(vendor_skill.read_bytes()).hexdigest() != DIAGRAM_VENDOR_SHA256:
        errors.append("Diagram Design vendor SKILL.md 與固定上游版本不同")
    for stage in STAGE_DIRS:
        entry = ROOT / "skills" / stage / "diagram-design/SKILL.md"
        if not entry.is_file():
            errors.append(f"缺少圖形階段入口：{entry}")
        elif "../../00_cross_phase/diagram-design/SKILL.md" not in entry.read_text(encoding="utf-8"):
            errors.append(f"圖形階段入口未連到跨階段 Skill：{entry}")
    main = SKILL / "SKILL.md"
    if not main.is_file() or not main.read_text(encoding="utf-8").startswith("---\n"):
        errors.append("主 Skill 缺少有效前置 YAML 區塊")
    for number in range(1, 7):
        io_path = SKILL / "io_files" / f"phase_{number:02d}_reverse_io.yaml"
        child = list((SKILL / "sub_skills").glob(f"phase_{number:02d}_*/SKILL.md"))
        if len(child) != 1:
            errors.append(f"Phase {number:02d} 子 Skill 數量錯誤：{len(child)}")
        elif not child[0].read_text(encoding="utf-8").startswith("---\n"):
            errors.append(f"Phase {number:02d} 子 Skill 缺少前置 YAML 區塊")
        if not io_path.is_file():
            errors.append(f"缺少 IO：{io_path}")
            continue
        try:
            io = yaml.safe_load(io_path.read_text(encoding="utf-8"))
            if not isinstance(io, dict) or not all(isinstance(io.get(k), list) for k in ("inputs", "outputs")):
                raise ValueError("inputs/outputs 必須是清單")
            for kind in ("inputs", "outputs"):
                names: set[str] = set()
                for item in io[kind]:
                    if (not isinstance(item, dict)
                            or not isinstance(item.get("id"), str)
                            or not isinstance(item.get("path"), str)
                            or not isinstance(item.get("required"), bool)):
                        raise ValueError(f"{kind} 項目缺少 id/path/required")
                    item_id = item["id"]
                    if item_id in names:
                        raise ValueError(f"{kind} 重複：{item_id}")
                    names.add(item_id)
                    if len(child) == 1 and kind == "outputs" and item_id not in child[0].read_text(encoding="utf-8"):
                        errors.append(f"Phase {number:02d} 子 Skill 未記載 IO 產物：{item_id}")
                    if number in PHASE_DIRS and kind == "outputs" and item["required"]:
                        target = project / Path(item["path"])
                        if not target.is_file():
                            errors.append(f"缺少必需逆向產物：{target}")
        except (OSError, yaml.YAMLError, ValueError) as exc:
            errors.append(f"IO 格式錯誤 {io_path}: {exc}")

    spec_path = project / "specs/executable_spec.yaml"
    try:
        spec = yaml.safe_load(spec_path.read_text(encoding="utf-8"))
        project_approval = spec["project"].get("approval_status")
        for key in ("phase_02_design", "phase_03_implementation", "phase_04_testing", "phase_05_deployment", "phase_06_maintenance"):
            if project_approval == "pending" and (spec[key]["status"] != "pending" or spec[key]["evaluator"]["passed"] is not False):
                errors.append(f"{key} 在整體契約待核准時不可標成完成")
    except (OSError, yaml.YAMLError, KeyError, TypeError) as exc:
        errors.append(f"正向 SSOT 缺失或結構錯誤：{exc}")
    diagram_dir = project / "outputs/diagrams"
    diagram_files = sorted(p for p in diagram_dir.glob("*.html") if p.name != "index.html")
    if diagram_files:
        checker = DIAGRAM / "vendor/scripts/self_check.py"
        result = subprocess.run([sys.executable, str(checker), *(str(p) for p in diagram_files)],
                                capture_output=True, text=True, encoding="utf-8", errors="replace")
        if result.returncode:
            errors.append(f"圖面靜態檢查失敗：{result.stdout.strip()} {result.stderr.strip()}")
    return errors


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", required=True, help="要核對的 SSDLC 專案目錄；可使用框架內相對路徑或外部絕對路徑")
    args = parser.parse_args()
    project_arg = Path(args.project).expanduser()
    project_path = (project_arg if project_arg.is_absolute() else ROOT / project_arg).resolve()
    if not project_path.is_dir():
        parser.error(f"專案目錄不存在：{project_path}")
    failures = check(project_path)
    for issue in failures:
        print("FAIL:", issue)
    print(f"Reverse Skill/IO/交接靜態檢查：{6} 階段，{len(failures)} 錯誤")
    sys.exit(bool(failures))
