"""Behavioral contract tests with synthetic offline inputs; no REA runtime."""

import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from contextlib import redirect_stdout
from io import StringIO

import yaml

from check_no_source_evidence import ROOT, check
from check_spec_integrity import SpecIntegrityChecker


class NoSourceEvidenceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.folder = "outputs/phase_03_reverse/"
        self.save("inputs/sanitized.har", {})
        digest = hashlib.sha256((self.root / "inputs/sanitized.har").read_bytes()).hexdigest()
        self.manifest = {"schema_version": 1, "source_available": False,
                         "sources": [{"source_id": "S1", "kind": "capture", "path": "inputs/sanitized.har", "sha256": digest}],
                         "scope": {"allowed_operations": ["offline_inspect"], "environment": "synthetic fixture"}}
        self.save("inputs/reverse_input_manifest.json", self.manifest)
        self.evidence = {"records": [{"evidence_id": "E1", "source_id": "S1", "provider": "fixture",
                                     "operation": "offline_inspect", "evidence_kind": "historical_capture",
                                     "confidence": "observed", "authority": "historical-reference",
                                     "environment": "fixture", "relationship_coverage": "partial", "limitations": []}]}
        self.save(self.folder + "evidence_manifest.json", self.evidence)
        self.save(self.folder + "findings_index.json", {"findings": [{"finding_id": "F1", "statement": "fixture finding", "evidence_ids": ["E1"], "status": "candidate"}]})
        self.unknowns = {"unknowns": [{"unknown_id": "U1", "question": "server internals?", "status": "open", "evidence_ids": [], "resolution_evidence_ids": []}]}
        self.save(self.folder + "unknowns.json", self.unknowns)
        self.products = []
        self.build_phase("03")

    def save(self, path, value):
        target = self.root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(json.dumps(value), encoding="utf-8")

    def build_phase(self, phase):
        contract = yaml.safe_load((ROOT / f"skills/00_cross_phase/reverse_engineering/io_files/phase_{phase}_reverse_io.yaml").read_text(encoding="utf-8"))
        products = []
        for item in contract["outputs"]:
            if item["required"]:
                self.save(item["path"], [] if item["id"] != "scan_report.json" else {"source_available": False})
                products.append({"product": item["id"], "status": "unknown", "reason": "fixture lacks internals", "evidence_ids": [], "unknown_ids": ["U1"]})
        self.save(f"outputs/phase_{phase}_reverse/coverage.json", {"products": products})
        if phase == "03":
            self.products = products

    def test_unknown_internals_are_valid_handoff(self):
        self.assertEqual(check(self.root), [])

    def test_legacy_source_without_manifest_remains_compatible(self):
        (self.root / "inputs/reverse_input_manifest.json").unlink()
        self.save(self.folder + "scan_report.json", {})
        self.assertEqual(check(self.root), [])

    def test_no_source_scan_cannot_omit_manifest(self):
        (self.root / "inputs/reverse_input_manifest.json").unlink()
        self.assertTrue(check(self.root))

    def test_empty_products_do_not_replace_coverage(self):
        self.save(self.folder + "coverage.json", {"products": []})
        self.assertTrue(check(self.root))

    def test_tampered_source_is_rejected(self):
        self.save("inputs/sanitized.har", {"changed": True})
        self.assertTrue(any("SHA-256" in error for error in check(self.root)))

    def test_unresolved_evidence_link_is_rejected(self):
        self.save(self.folder + "findings_index.json", {"findings": [{"finding_id": "F1", "statement": "x", "status": "candidate", "evidence_ids": ["missing"]}]})
        self.assertTrue(check(self.root))

    def test_static_observed_cannot_assert_execution_without_results(self):
        self.evidence["records"][0]["evidence_kind"] = "controlled_execution"
        self.save(self.folder + "evidence_manifest.json", self.evidence)
        self.assertTrue(any("controlled execution" in error for error in check(self.root)))

    def test_unknown_resolution_requires_evidence(self):
        self.unknowns["unknowns"][0]["status"] = "resolved"
        self.save(self.folder + "unknowns.json", self.unknowns)
        self.assertTrue(check(self.root))

    def test_supported_product_requires_evidence(self):
        self.products[0]["status"] = "supported"
        self.save(self.folder + "coverage.json", {"products": self.products})
        self.assertTrue(check(self.root))

    def test_blackbox_without_binary_is_supported(self):
        self.manifest["sources"] = [{"source_id": "S1", "kind": "blackbox", "target": "fixture service", "environment": "test"}]
        self.save("inputs/reverse_input_manifest.json", self.manifest)
        self.assertEqual(check(self.root), [])

    def test_path_escape_is_rejected(self):
        self.manifest["sources"][0]["path"] = "../outside.har"
        self.save("inputs/reverse_input_manifest.json", self.manifest)
        self.assertTrue(check(self.root))

    def test_phase02_requires_design_coverage(self):
        self.assertTrue(check(self.root, ("02",)))
        self.build_phase("02")
        self.assertEqual(check(self.root, ("02",)), [])

    def test_preflight_only_requires_sources(self):
        (self.root / (self.folder + "coverage.json")).unlink()
        self.assertEqual(check(self.root, require_outputs=False), [])

    def test_mode_e_checks_evidence_when_io_disabled(self):
        self.save(self.folder + "coverage.json", {"products": []})
        checker = SpecIntegrityChecker(target_phase="03", mode="E", project=str(self.root))
        with redirect_stdout(StringIO()):
            checker.check_reverse_contract_io({"reverse_engineering": {"enabled": True, "approval_status": "pending"}, "io_management": {"enabled": False}})
        self.assertTrue(checker.issues)

    def test_mode_e_preserves_phase04_approval_gate(self):
        self.build_phase("02")
        checker = SpecIntegrityChecker(target_phase="04", mode="E", project=str(self.root))
        with redirect_stdout(StringIO()):
            checker.check_reverse_contract_io({"reverse_engineering": {"enabled": True, "approval_status": "pending"}, "io_management": {"enabled": False}})
        self.assertTrue(checker.issues)

    def test_source_declaration_cannot_contradict_scan(self):
        self.manifest["source_available"] = True
        self.save("inputs/reverse_input_manifest.json", self.manifest)
        self.assertTrue(check(self.root))

    def test_invalid_source_link_returns_error_without_crashing(self):
        self.evidence["records"][0]["source_id"] = []
        self.save(self.folder + "evidence_manifest.json", self.evidence)
        self.assertTrue(check(self.root))

    def test_legacy_full_reverse_handoff_still_passes(self):
        from check_reverse_skill_integrity import check as check_reverse
        (self.root / "inputs/reverse_input_manifest.json").unlink()
        self.save(self.folder + "scan_report.json", {})
        for phase in ("01", "02"):
            self.build_phase(phase)
        spec = {"project": {"approval_status": "pending"}}
        for key in ("phase_02_design", "phase_03_implementation", "phase_04_testing", "phase_05_deployment", "phase_06_maintenance"):
            spec[key] = {"status": "pending", "evaluator": {"passed": False}}
        self.save("specs/executable_spec.yaml", spec)
        self.assertEqual(check_reverse(self.root), [])


if __name__ == "__main__":
    unittest.main()
