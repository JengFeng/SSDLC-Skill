"""Exercise policy boundaries in temporary projects, without live services."""

import json
from pathlib import Path
import tempfile
import subprocess
import sys
import unittest

import yaml

from check_threat_modeling import check


class DeliveryPolicyTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "specs").mkdir()

    def project(self, baseline=False, requested=False, selected=False, status="completed", reverse=None):
        gates = {"security_baseline": {"enabled": baseline}, "threat_modeling": {"requested": requested, "selected": selected}}
        if reverse is not None:
            gates["reverse_engineering"] = {"enabled": True, "completed_phases": reverse}
        (self.root / "phase_gates.json").write_text(json.dumps(gates), encoding="utf-8")
        self.spec = {"phase_02_design": {"status": status, "outputs": {"threat_model": None}}}
        self.save_spec()

    def save_spec(self):
        (self.root / "specs/executable_spec.yaml").write_text(yaml.safe_dump(self.spec), encoding="utf-8")

    def model(self, relative="02_system_design/outputs/threat_model.md", content="# Candidate model"):
        file = self.root / relative
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_text(content, encoding="utf-8")

    def test_disabled_is_optional(self):
        self.project()
        self.assertFalse(check(self.root, "02", "B")[0])

    def test_each_trigger_requires_delivery_even_without_io(self):
        for trigger in ("baseline", "requested", "selected"):
            with self.subTest(trigger=trigger):
                self.project(**{trigger: True})
                self.assertTrue(check(self.root, "02", "B")[0])

    def test_all_trigger_combinations(self):
        for b in (False, True):
            for r in (False, True):
                for s in (False, True):
                    with self.subTest(b=b, r=r, s=s):
                        self.project(b, r, s)
                        self.assertEqual(bool(check(self.root)[0]), b or r or s)

    def test_phase01_and_phase02_planning_do_not_require_finished_model(self):
        self.project(requested=True, status="pending")
        for phase in ("01", "02"):
            self.assertFalse(check(self.root, phase, "A")[0])
        self.assertFalse(check(self.root, None, "D")[0])

    def test_phase02_delivery_and_phase03_start_require_model(self):
        self.project(selected=True, status="pending")
        self.assertTrue(check(self.root, "02", "B")[0])
        self.assertTrue(check(self.root, "03", "A")[0])

    def test_nonempty_model_is_presence_only_and_does_not_mutate_gate(self):
        self.project(selected=True)
        self.model()
        before = (self.root / "phase_gates.json").read_bytes()
        self.assertFalse(check(self.root)[0])
        self.assertEqual(before, (self.root / "phase_gates.json").read_bytes())

    def test_empty_model_fails(self):
        self.project(requested=True)
        self.model(content=" \n")
        self.assertTrue(check(self.root)[0])

    def test_ssot_path(self):
        self.project(selected=True)
        self.spec["phase_02_design"]["outputs"]["threat_model"] = "outputs/custom-model.md"
        self.save_spec()
        self.model("outputs/custom-model.md")
        self.assertFalse(check(self.root)[0])

    def test_override_path_and_ssot_conflict(self):
        self.project(selected=True)
        directory = self.root / "02_system_design"
        directory.mkdir()
        for name, path in (("io_files.yaml", "outputs/old.md"), ("io_files.override.yaml", "outputs/new.md")):
            (directory / name).write_text(yaml.safe_dump({"outputs": [{"id": "threat_model.md", "path": path, "required": False}]}), encoding="utf-8")
        self.model("outputs/new.md")
        self.assertFalse(check(self.root)[0])
        self.spec["phase_02_design"]["outputs"]["threat_model"] = "outputs/old.md"
        self.save_spec()
        self.assertTrue(check(self.root)[0])

    def test_unsafe_path_fails(self):
        self.project(requested=True)
        for path in ("../escape.md", "C:/outside/model.md", "/outside/model.md"):
            self.spec["phase_02_design"]["outputs"]["threat_model"] = path
            self.save_spec()
            self.assertTrue(check(self.root)[0])

    def test_reverse_candidate_delivery(self):
        self.project(requested=True, reverse=["03"])
        self.assertFalse(check(self.root, "02", "E")[0])
        self.project(requested=True, reverse=["03", "02"])
        self.assertTrue(check(self.root, "02", "E")[0])
        self.model("outputs/phase_02_reverse/threat_model.md")
        self.assertFalse(check(self.root, "02", "E")[0])

    def test_spec_integrity_cli_enforces_the_same_condition(self):
        checker = Path(__file__).with_name("check_spec_integrity.py")
        for requested in (False, True):
            self.project(requested=requested)
            result = subprocess.run([sys.executable, "-X", "utf8", str(checker), "--project", str(self.root), "--phase", "02", "--mode", "B"], capture_output=True, text=True, encoding="utf-8")
            self.assertEqual(result.returncode, int(requested), result.stdout + result.stderr)
        self.model()
        result = subprocess.run([sys.executable, "-X", "utf8", str(checker), "--project", str(self.root), "--phase", "02", "--mode", "B"], capture_output=True, text=True, encoding="utf-8")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_legacy_baseline_and_malformed_flags(self):
        self.project()
        gate = self.root / "phase_gates.json"
        gate.write_text(json.dumps({"security_baseline": {"enabled": True}}), encoding="utf-8")
        self.assertTrue(check(self.root)[0])
        gate.write_text(json.dumps({"threat_modeling": {"selected": "false"}}), encoding="utf-8")
        self.assertTrue(check(self.root)[0])


if __name__ == "__main__":
    unittest.main()
