"""Validate SSDLC no-source evidence contracts; never execute the target."""

import argparse
import hashlib
import json
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = "inputs/reverse_input_manifest.json"
KINDS = {"document_claim", "static_observation", "historical_capture", "controlled_execution", "analyst_inference"}


def local_path(project, relative):
    if not isinstance(relative, str) or not relative.strip():
        raise ValueError("missing relative path")
    path = Path(relative)
    if path.is_absolute() or ".." in path.parts:
        raise ValueError(f"unsafe path: {relative}")
    target = (project / path).resolve()
    if not target.is_relative_to(project):
        raise ValueError(f"path escapes project: {relative}")
    return target


def check(project, phases=("03",), require_outputs=True):
    project = Path(project).resolve()
    errors = []

    def read(relative):
        try:
            value = json.loads(local_path(project, relative).read_text(encoding="utf-8-sig"))
            if not isinstance(value, dict):
                raise ValueError("JSON root must be object")
            return value
        except (OSError, ValueError) as exc:
            errors.append(f"{relative}: {exc}")
            return {}

    manifest_path = project / MANIFEST
    if not manifest_path.is_file():
        scan = project / "outputs/phase_03_reverse/scan_report.json"
        if scan.is_file():
            try:
                scan_data = json.loads(scan.read_text(encoding="utf-8-sig"))
                if isinstance(scan_data, dict) and scan_data.get("source_available") is False:
                    errors.append("無原始碼案例缺少 reverse_input_manifest.json")
            except (OSError, ValueError):
                errors.append("scan_report.json 無法解析")
        return errors
    manifest = read(MANIFEST)
    if manifest.get("schema_version") != 1 or type(manifest.get("source_available")) is not bool:
        errors.append("manifest requires schema_version=1 and boolean source_available")
    scan_path = project / "outputs/phase_03_reverse/scan_report.json"
    if scan_path.is_file():
        scan = read("outputs/phase_03_reverse/scan_report.json")
        if "source_available" in scan and scan["source_available"] is not manifest.get("source_available"):
            errors.append("scan_report and manifest source_available disagree")
    if manifest.get("source_available") is not False:
        return errors
    scope = manifest.get("scope")
    if not isinstance(scope, dict) or not isinstance(scope.get("allowed_operations"), list) or not scope["allowed_operations"] or not scope.get("environment"):
        errors.append("manifest requires scope.allowed_operations and environment")

    def indexed(document, key, id_key):
        rows = document.get(key)
        if not isinstance(rows, list):
            errors.append(f"{key} must be list")
            return {}
        result = {}
        for row in rows:
            if not isinstance(row, dict) or not isinstance(row.get(id_key), str) or not row[id_key].strip():
                errors.append(f"{key} missing {id_key}")
                continue
            if row[id_key] in result:
                errors.append(f"duplicate {id_key}: {row[id_key]}")
            result[row[id_key]] = row
        return result

    sources = indexed(manifest, "sources", "source_id")
    if not sources:
        errors.append("no-source manifest requires at least one source")
    for source_id, source in sources.items():
        kind = source.get("kind")
        if kind == "blackbox":
            if not source.get("target") or not source.get("environment"):
                errors.append(f"{source_id}: blackbox requires target/environment")
        elif kind in {"artifact", "capture", "document", "configuration", "log"}:
            try:
                target = local_path(project, source.get("path"))
                digest = hashlib.sha256(target.read_bytes()).hexdigest()
                if digest != source.get("sha256"):
                    errors.append(f"{source_id}: source SHA-256 mismatch")
            except (OSError, ValueError) as exc:
                errors.append(f"{source_id}: {exc}")
        else:
            errors.append(f"{source_id}: unsupported source kind")
    if not require_outputs:
        return errors

    folder = "outputs/phase_03_reverse/"
    records = indexed(read(folder + "evidence_manifest.json"), "records", "evidence_id")
    for eid, record in records.items():
        if not isinstance(record.get("source_id"), str) or record["source_id"] not in sources:
            errors.append(f"{eid}: unknown source_id")
        for field in ("provider", "operation", "authority", "environment", "relationship_coverage"):
            if not isinstance(record.get(field), str) or not record[field].strip():
                errors.append(f"{eid}: missing {field}")
        if not isinstance(record.get("limitations"), list):
            errors.append(f"{eid}: limitations must be list")
        if record.get("confidence") not in {"observed", "derived", "inferred"} or record.get("evidence_kind") not in KINDS:
            errors.append(f"{eid}: invalid confidence/evidence_kind")
        if record.get("record_path"):
            try:
                if not local_path(project, record["record_path"]).is_file():
                    raise ValueError("canonical record missing")
            except ValueError as exc:
                errors.append(f"{eid}: {exc}")
        if record.get("evidence_kind") == "controlled_execution":
            execution = record.get("execution", {})
            if not isinstance(execution, dict) or any(not execution.get(k) for k in ("version", "environment", "action", "expected", "actual")):
                errors.append(f"{eid}: controlled execution requires version/environment/action/expected/actual")

    def refs(row, key, index, owner, nonempty=False):
        values = row.get(key)
        if not isinstance(values, list) or (nonempty and not values):
            errors.append(f"{owner}: {key} requires {'nonempty ' if nonempty else ''}list")
        elif any(not isinstance(value, str) or value not in index for value in values):
            errors.append(f"{owner}: unresolved {key}")

    unknowns = indexed(read(folder + "unknowns.json"), "unknowns", "unknown_id")
    for uid, row in unknowns.items():
        if not row.get("question") or row.get("status") not in {"open", "resolved"}:
            errors.append(f"{uid}: question/status invalid")
        refs(row, "evidence_ids", records, uid)
        refs(row, "resolution_evidence_ids", records, uid, row.get("status") == "resolved")
    findings = indexed(read(folder + "findings_index.json"), "findings", "finding_id")
    for fid, row in findings.items():
        if not row.get("statement") or row.get("status") not in {"candidate", "confirmed", "rejected"}:
            errors.append(f"{fid}: statement/status invalid")
        refs(row, "evidence_ids", records, fid, True)
    # Phase 02 consumes Phase 03 evidence; later handoffs retain both coverages.
    phases = set(str(p).zfill(2) for p in phases)
    phases.add("03")
    if phases & {"01", "02", "04", "05", "06"}:
        phases.add("02")
    for phase in sorted(phases & {"03", "02"}):
        prefix = f"outputs/phase_{phase}_reverse/"
        contract = yaml.safe_load((ROOT / f"skills/00_cross_phase/reverse_engineering/io_files/phase_{phase}_reverse_io.yaml").read_text(encoding="utf-8"))
        products = indexed(read(prefix + "coverage.json"), "products", "product")
        for item in contract["outputs"]:
            if item["required"]:
                if not (project / item["path"]).is_file():
                    errors.append(f"missing required product: {item['path']}")
                if item["id"] not in products:
                    errors.append(f"{prefix}: missing coverage for {item['id']}")
        for product, row in products.items():
            status = row.get("status")
            if status not in {"supported", "partial", "unknown", "not_observed", "not_applicable"} or not row.get("reason"):
                errors.append(f"{product}: coverage requires status/reason")
            refs(row, "evidence_ids", records, product, status in {"supported", "partial"})
            refs(row, "unknown_ids", unknowns, product, status in {"unknown", "not_observed"})
            try:
                if not local_path(project, prefix + product).is_file():
                    errors.append(f"{product}: covered product missing")
            except ValueError as exc:
                errors.append(str(exc))
    return errors


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", required=True)
    parser.add_argument("--phase", choices=("03", "02", "01", "04", "05", "06"), default="03")
    parser.add_argument("--inputs-only", action="store_true", help="Check source declaration before producing outputs")
    args = parser.parse_args()
    failures = check(args.project, (args.phase,), not args.inputs_only)
    for error in failures:
        print("FAIL:", error)
    print(f"無原始碼證據契約：{len(failures)} 錯誤（靜態檢查，不代表階段核准）")
    raise SystemExit(bool(failures))
