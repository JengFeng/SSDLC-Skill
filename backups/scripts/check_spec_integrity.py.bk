#!/usr/bin/env python3
"""SSOT 規格完整性檢查腳本 (Spec Integrity Check)

檢查點：
  A - 階段啟動前：規格檔案是否存在、YAML 是否有效
  B - 階段完成後：產出與 SSOT 一致性
  C - 跨階段交接：追溯鏈完整性
  D - Git 提交前：目錄結構 vs YAML 定義一致性
  E - @io：跨階段契約輸入輸出勾稽
  S - @CheckSpec：四規格完整性與交叉一致性（結構化+行為+SRS+RTM）

用法：
  python scripts/check_spec_integrity.py [--phase 01-06] [--mode A|B|C|D|E|S]
"""

import os
import sys
import yaml
import argparse
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class SpecIntegrityChecker:
    def __init__(self, target_phase=None, mode="D", project=None):
        self.target_phase = target_phase
        self.mode = mode
        self.issues = []
        self.passes = []
        self.project_base = self._resolve_project(project)

    def _resolve_project(self, project):
        """解析專案根目錄：接受 --project 參數，未指定時自動偵測當前工作目錄"""
        if project:
            if os.path.isabs(project):
                return project
            return os.path.join(ROOT, project)

        # 自動偵測：從當前工作目錄向上尋找 SSDLC 專案根目錄
        cwd = os.getcwd()
        check_dir = cwd
        while True:
            has_tm = os.path.exists(os.path.join(check_dir, "traceability_matrix.md"))
            has_ss = os.path.exists(os.path.join(check_dir, "system_specification.md"))
            has_specs = os.path.isdir(os.path.join(check_dir, "specs"))
            if has_tm and has_ss and has_specs:
                return check_dir
            parent = os.path.dirname(check_dir)
            if parent == check_dir:
                break
            check_dir = parent

        print("[WARN] 無法自動偵測 SSDLC 專案，使用預設 demo_project/")
        return os.path.join(self.project_base)

    def log(self, level, msg):
        prefix = {"OK": "  [PASS]", "WARN": "  [WARN]", "ERR": "  [FAIL]"}
        print(f"{prefix.get(level, '[INFO]')} {msg}")
        if level == "ERR":
            self.issues.append(msg)
        else:
            self.passes.append(msg)

    def check_ssot_files_exist(self):
        """檢查點 A：SSOT 規格檔案是否存在"""
        print("\n=== 檢查點 A：規格檔案存在性 ===")
        files = [
            "specs/executable_spec.yaml",
            "specs/features/requirements.feature",
            "system_specification.md",
            "specs/README.md",
        ]
        for f in files:
            fp = os.path.join(self.project_base, f)
            if os.path.exists(fp):
                self.log("OK", f"存在: {f}")
            else:
                self.log("ERR", f"缺失: {f}")

    def check_yaml_valid(self):
        """檢查 executable_spec.yaml 是否有效"""
        print("\n=== YAML 有效性檢查 ===")
        yaml_path = os.path.join(self.project_base, "specs", "executable_spec.yaml")
        try:
            with open(yaml_path, encoding="utf-8") as f:
                spec = yaml.safe_load(f)
            reqs = len(spec.get("requirements", []))
            phases = len(spec.get("phases", {}))
            self.log("OK", f"YAML 有效: {reqs} 需求, {phases} 階段")
            return spec
        except Exception as e:
            self.log("ERR", f"YAML 無效: {e}")
            return None

    def check_spec_ref_files(self):
        """檢查所有階段的 spec_ref.md"""
        print("\n=== spec_ref.md 完整性 ===")
        phases = ["00_cross_phase"] + [f"{i:02d}_{s}" for i, s in [
            (1,"planning_and_analysis"),(2,"system_design"),(3,"implementation_and_coding"),
            (4,"testing"),(5,"deployment"),(6,"maintenance")
        ]]
        for p in phases:
            ref = os.path.join(self.project_base, p, "inputs", "spec_ref.md")
            if os.path.exists(ref):
                with open(ref, encoding="utf-8") as f:
                    c = f.read()
                has_yaml = "executable_spec.yaml" in c
                has_feat = "requirements.feature" in c
                has_srs = "system_specification.md" in c
                if has_yaml and has_feat and has_srs:
                    self.log("OK", f"{p}/inputs/spec_ref.md 內容完整")
                else:
                    missing = []
                    if not has_yaml: missing.append("executable_spec.yaml")
                    if not has_feat: missing.append("requirements.feature")
                    if not has_srs: missing.append("system_specification.md")
                    self.log("ERR", f"{p}/inputs/spec_ref.md 缺少: {', '.join(missing)}")
            else:
                self.log("ERR", f"缺失: {p}/inputs/spec_ref.md")

    def check_phase_outputs(self):
        """檢查點 B：階段產出 vs SSOT 定義"""
        print("\n=== 檢查點 B：階段產出一致性 ===")
        spec = self.check_yaml_valid()
        if not spec: return

        phases = spec.get("phases", {})
        phase_map = {
            "01": "01_planning", "02": "02_design", "03": "03_implementation",
            "04": "04_testing", "05": "05_deployment", "06": "06_maintenance"
        }
        dir_map = {
            "01": "01_planning_and_analysis", "02": "02_system_design",
            "03": "03_implementation_and_coding", "04": "04_testing",
            "05": "05_deployment", "06": "06_maintenance"
        }

        for phase_key, phase_data in phases.items():
            key = phase_key[:2]
            dir_name = dir_map.get(key)
            if not dir_name: continue

            outputs = phase_data.get("outputs", [])
            base = os.path.join(self.project_base, dir_name)
            for out in outputs:
                if out == "templates/":
                    tpl_dir = os.path.join(base, "templates")
                    if os.path.isdir(tpl_dir):
                        self.log("OK", f"Phase {key}: {out} 目錄存在")
                    else:
                        self.log("ERR", f"Phase {key}: {out} 目錄缺失")
                    continue

                fp = os.path.join(base, "outputs", out)
                if os.path.exists(fp):
                    self.log("OK", f"Phase {key}: {out}")
                else:
                    alt = os.path.join(base, "reg", out)
                    alt2 = os.path.join(base, "bug", out)
                    if os.path.exists(alt):
                        self.log("OK", f"Phase {key}: {out} (in reg/)")
                    elif os.path.exists(alt2):
                        self.log("OK", f"Phase {key}: {out} (in bug/)")
                    else:
                        self.log("ERR", f"Phase {key}: {out} 缺失")

    def check_mermaid_syntax(self):
        """檢查 Mermaid 圖表語法"""
        print("\n=== Mermaid 語法檢查 ===")
        diagram_dir = os.path.join(self.project_base, "02_system_design", "outputs")
        if not os.path.isdir(diagram_dir):
            self.log("WARN", "02_system_design/outputs 目錄不存在")
            return

        bt = b"```"
        for f in sorted(os.listdir(diagram_dir)):
            if not f.endswith(".md") or "diagram" not in f:
                continue
            fp = os.path.join(diagram_dir, f)
            with open(fp, "rb") as fh:
                raw = fh.read()
            opens = raw.count(bt + b"mermaid")
            total = raw.count(bt)
            closes = total - opens
            if opens > 0 and closes >= opens:
                self.log("OK", f"{f}: Mermaid 語法正確 (open={opens}, close={closes})")
            elif opens > 0:
                self.log("ERR", f"{f}: Mermaid 關閉標記缺失 (open={opens}, close={closes})")

    def check_traceability(self):
        """檢查點 C：追溯鏈完整性"""
        print("\n=== 檢查點 C：追溯鏈 ===")
        rtm_path = os.path.join(self.project_base, "01_planning_and_analysis", "reg", "requirement_tracker.md")
        if not os.path.exists(rtm_path):
            self.log("ERR", "requirement_tracker.md 缺失")
            return

        with open(rtm_path, encoding="utf-8") as f:
            rtm = f.read()

        for i in range(1, 7):
            tag = f"REQ-00{i}"
            count = rtm.count(tag)
            if count >= 2:
                self.log("OK", f"{tag} 已追溯")
            else:
                self.log("ERR", f"{tag} 追溯不足 (出現 {count} 次)")

    def check_feature_gherkin(self):
        """檢查 requirements.feature 的 Gherkin 語法與場景數"""
        print("\n=== Gherkin 語法與場景檢查 ===")
        feat_path = os.path.join(self.project_base, "specs", "features", "requirements.feature")
        if not os.path.exists(feat_path):
            self.log("ERR", "requirements.feature 缺失")
            return 0
        with open(feat_path, encoding="utf-8") as f:
            content = f.read()
        scenarios = [l for l in content.split("\n") if l.strip().startswith("Scenario:") or l.strip().startswith("場景:")]
        feature_count = len([l for l in content.split("\n") if l.strip().startswith("Feature:") or l.strip().startswith("功能:")])
        self.log("OK", f"Gherkin 結構: {feature_count} Feature, {len(scenarios)} Scenario")
        return len(scenarios)

    def check_srs_references(self):
        """檢查 system_specification.md 是否參照所有需求"""
        print("\n=== SRS 需求參照完整性 ===")
        srs_path = os.path.join(self.project_base, "system_specification.md")
        if not os.path.exists(srs_path):
            self.log("ERR", "system_specification.md 缺失")
            return
        with open(srs_path, encoding="utf-8") as f:
            content = f.read()
        missing = []
        for i in range(1, 7):
            tag = f"REQ-00{i}"
            if tag not in content:
                missing.append(tag)
        if missing:
            self.log("ERR", f"SRS 缺少需求參照: {', '.join(missing)}")
        else:
            self.log("OK", "SRS 包含所有 REQ-001 ~ REQ-006 參照")

    def check_cross_spec_consistency(self):
        """檢查四種規格之間的交叉一致性"""
        print("\n=== 四規格交叉一致性 ===")

        yaml_path = os.path.join(self.project_base, "specs", "executable_spec.yaml")
        yaml_count = 0
        if os.path.exists(yaml_path):
            try:
                with open(yaml_path, encoding="utf-8") as f:
                    spec = yaml.safe_load(f)
                yaml_count = len(spec.get("requirements", []))
            except:
                pass

        feat_path = os.path.join(self.project_base, "specs", "features", "requirements.feature")
        feat_count = 0
        if os.path.exists(feat_path):
            with open(feat_path, encoding="utf-8") as f:
                content = f.read()
            feat_count = len([l for l in content.split("\n") if l.strip().startswith("Scenario:") or l.strip().startswith("場景:")])

        if yaml_count > 0 and feat_count > 0:
            # Check YAML requirement IDs appear in feature file
            feat_path2 = os.path.join(self.project_base, "specs", "features", "requirements.feature")
            with open(feat_path2, encoding="utf-8") as f:
                feat_content = f.read()
            missing_in_feat = []
            for i in range(1, yaml_count + 1):
                tag = f"REQ-00{i}"
                if tag not in feat_content:
                    missing_in_feat.append(tag)
            if missing_in_feat:
                self.log("ERR", f"Feature 缺少需求參照: {', '.join(missing_in_feat)}")
            else:
                self.log("OK", f"YAML 需求 ({yaml_count}) 全數參照於 Feature ({feat_count} Scenario)")

        rtm_path = os.path.join(self.project_base, "01_planning_and_analysis", "reg", "requirement_tracker.md")
        if os.path.exists(rtm_path) and yaml_count > 0:
            with open(rtm_path, encoding="utf-8") as f:
                rtm = f.read()
            untraced = []
            for i in range(1, yaml_count + 1):
                if f"REQ-00{i}" not in rtm:
                    untraced.append(f"REQ-00{i}")
            if untraced:
                self.log("ERR", f"RTM 缺少追溯: {', '.join(untraced)}")
            else:
                self.log("OK", f"RTM 完整追溯所有 {yaml_count} 項 YAML 需求")

        srs_path = os.path.join(self.project_base, "system_specification.md")
        if os.path.exists(srs_path) and os.path.exists(rtm_path):
            with open(srs_path, encoding="utf-8") as f:
                srs = f.read()
            with open(rtm_path, encoding="utf-8") as f:
                rtm = f.read()
            srs_ok = all(f"REQ-00{i}" in srs for i in range(1, yaml_count + 1)) if yaml_count else False
            rtm_ok = all(f"REQ-00{i}" in rtm for i in range(1, yaml_count + 1)) if yaml_count else False
            if srs_ok and rtm_ok:
                self.log("OK", "SRS - RTM 雙向參照一致")
            else:
                if not srs_ok: self.log("ERR", "SRS -> RTM 方向不一致")
                if not rtm_ok: self.log("ERR", "RTM -> SRS 方向不一致")



    def check_contract_io(self):
        """檢查點 E：跨階段契約輸入輸出勾稽"""
        skills_base = os.path.join(ROOT, ".agents", "skills")
        phases_order = [
            "01_planning_and_analysis", "02_system_design",
            "03_implementation_and_coding", "04_testing",
            "05_deployment", "06_maintenance"
        ]

        # Load all contracts
        contracts = {}
        for phase_dir in phases_order:
            contract_path = os.path.join(skills_base, phase_dir, "io_files.yaml")
            if not os.path.exists(contract_path):
                self.log("WARN", f"${phase_dir}/io_files.yaml 不存在，跳過")
                continue
            try:
                with open(contract_path, encoding="utf-8") as f:
                    contracts[phase_dir] = yaml.safe_load(f)
            except Exception as e:
                self.log("ERR", f"${phase_dir}/io_files.yaml 解析失敗: ${e}")
                continue

        if len(contracts) < 2:
            self.log("WARN", "契約數量不足（需至少 2 份），跳過 IO 勾稽")
            return

        # Check upstream -> downstream alignment
        print("\n--- 需求（上游輸出）vs 消費（下游輸入）對齊 ---")
        for i, phase_dir in enumerate(phases_order):
            if phase_dir not in contracts:
                continue
            current = contracts[phase_dir]

            # Check inputs: does upstream produce what we need?
            for inp in current.get("inputs", []):
                if not inp.get("required", True):
                    continue
                found = False
                # Look backwards through upstream phases
                for j in range(i - 1, -1, -1):
                    upstream = contracts.get(phases_order[j])
                    if not upstream:
                        continue
                    for out in upstream.get("outputs", []):
                        out_path = os.path.normpath(
                            os.path.join(skills_base, phases_order[j], out["path"])
                        )
                        inp_path = os.path.normpath(
                            os.path.join(skills_base, phase_dir, inp["path"])
                        )
                        if out_path == inp_path:
                            found = True
                            break
                    if found:
                        break
                if found:
                    self.log("OK", f"${inp['id']}: ${phase_dir} input ← 上游已宣告輸出")
                else:
                    self.log("WARN", f"${inp['id']}: ${phase_dir} 需要但上游無階段宣告此輸出")

            # Check outputs: do actual files exist?
            for out in current.get("outputs", []):
                if not out.get("required", True):
                    continue
                out_path = os.path.join(skills_base, phase_dir, out["path"])
                # Normalize and check existence (skip directories, check only files)
                if out_path.endswith("/"):
                    if os.path.isdir(out_path):
                        self.log("OK", f"${out['id']}: 目錄存在 ${out['path']}")
                    else:
                        self.log("WARN", f"${out['id']}: 目錄不存在 ${out['path']}（可能尚未產出）")
                elif os.path.exists(out_path):
                    self.log("OK", f"${out['id']}: 檔案存在 ${out['path']}")
                else:
                    self.log("WARN", f"${out['id']}: 檔案不存在 ${out['path']}（可能尚未產出）")

        # Check default contract file existence for all phases
        print("\n--- 契約檔案存在性 ---")
        all_phases = ["00_cross_phase"] + phases_order
        for p in all_phases:
            cp = os.path.join(skills_base, p, "io_files.yaml")
            if os.path.exists(cp):
                self.log("OK", f"${p}/io_files.yaml 存在")
            else:
                self.log("ERR", f"${p}/io_files.yaml 缺失")


    def check_contract_io(self):
        """檢查點 E：跨階段契約輸入輸出勾稽"""
        skills_base = os.path.join(ROOT, ".agents", "skills")
        phases_order = [
            "01_planning_and_analysis", "02_system_design",
            "03_implementation_and_coding", "04_testing",
            "05_deployment", "06_maintenance"
        ]

        # Load all contracts
        contracts = {}
        for phase_dir in phases_order:
            contract_path = os.path.join(skills_base, phase_dir, "io_files.yaml")
            if not os.path.exists(contract_path):
                self.log("WARN", f"{phase_dir}/io_files.yaml 不存在，跳過")
                continue
            try:
                with open(contract_path, encoding="utf-8") as f:
                    contracts[phase_dir] = yaml.safe_load(f)
            except Exception as e:
                self.log("ERR", f"{phase_dir}/io_files.yaml 解析失敗: {e}")
                continue

        if len(contracts) < 2:
            self.log("WARN", "契約數量不足（需至少 2 份），跳過 IO 勾稽")
            return

        # Check upstream -> downstream alignment
        print("\n--- 上游輸出 vs 下游輸入對齊 ---")
        for i, phase_dir in enumerate(phases_order):
            if phase_dir not in contracts:
                continue
            current = contracts[phase_dir]

            # Check inputs: does upstream produce what we need?
            for inp in current.get("inputs", []):
                if not inp.get("required", True):
                    continue
                found = False
                for j in range(i - 1, -1, -1):
                    upstream = contracts.get(phases_order[j])
                    if not upstream:
                        continue
                    for out in upstream.get("outputs", []):
                        out_path = os.path.normpath(
                            os.path.join(skills_base, phases_order[j], out["path"])
                        )
                        inp_path = os.path.normpath(
                            os.path.join(skills_base, phase_dir, inp["path"])
                        )
                        if out_path == inp_path:
                            found = True
                            break
                    if found:
                        break
                if found:
                    self.log("OK", f"{inp['id']}: {phase_dir} input <- 上游已宣告輸出")
                else:
                    self.log("WARN", f"{inp['id']}: {phase_dir} 需要但上游無宣告")

            # Check outputs: do actual files exist?
            for out in current.get("outputs", []):
                if not out.get("required", True):
                    continue
                out_path = os.path.join(skills_base, phase_dir, out["path"])
                if out_path.endswith("/"):
                    if os.path.isdir(out_path):
                        self.log("OK", f"{out['id']}: 目錄存在 {out['path']}")
                    else:
                        self.log("WARN", f"{out['id']}: 目錄不存在 {out['path']}")
                elif os.path.exists(out_path):
                    self.log("OK", f"{out['id']}: 檔案存在 {out['path']}")
                else:
                    self.log("WARN", f"{out['id']}: 檔案不存在 {out['path']}")

        # Check contract file existence for all phases
        print("\n--- 契約檔案存在性 ---")
        all_phases = ["00_cross_phase"] + phases_order
        for p in all_phases:
            cp = os.path.join(skills_base, p, "io_files.yaml")
            if os.path.exists(cp):
                self.log("OK", f"{p}/io_files.yaml 存在")
            else:
                self.log("ERR", f"{p}/io_files.yaml 缺失")


    def print_spec_summary(self):
        """輸出四規格摘要報告"""
        print("\n" + "=" * 60)
        print("  @CheckSpec 四規格摘要報告")
        print("=" * 60)

        specs = [
            ("結構化可執行規格", "executable_spec.yaml", "YAML（需求/API/資料模型/安全控制）"),
            ("行為可執行規格",   "requirements.feature",    "Gherkin（Given-When-Then 場景）"),
            ("系統規格書 (SRS)",  "system_specification.md",  "人可讀"),
            ("追溯矩陣 (RTM)",   "requirement_tracker.md",   "需求追溯"),
        ]

        for name, fname, desc in specs:
            fp = os.path.join(self.project_base, fname) if fname != "requirement_tracker.md" \
                else os.path.join(self.project_base, "01_planning_and_analysis", "reg", "requirement_tracker.md")
            status = "存在" if os.path.exists(fp) else "缺失"
            print(f"  {name}")
            print(f"     檔案: {fname}")
            print(f"     類型: {desc}")
            print(f"     狀態: {status}")
            print()

    def run(self):
        mode_names = {"A":"規格存在性","B":"產出一致性","C":"追溯鏈","D":"全掃描","E":"@io 跨階段契約","E":"@io 跨階段契約","S":"@CheckSpec 四規格"}
        print(f"SSOT 規格完整性檢查 - {datetime.now().isoformat()}")
        print(f"   模式: {self.mode} ({mode_names.get(self.mode, self.mode)}) | 目標階段: {self.target_phase or '全部'}")
        print("=" * 50)

        if self.mode in ("A", "D"):
            self.check_ssot_files_exist()
            self.check_spec_ref_files()
            self.check_mermaid_syntax()
        if self.mode in ("B", "D"):
            self.check_phase_outputs()
        if self.mode in ("C", "D"):
            self.check_traceability()

        
        if self.mode == "E":
            print("\n" + "=" * 50)
            print("  Mode E：@io 跨階段契約勾稽")
            print("=" * 50)
            self.check_contract_io()

        if self.mode == "E":
            print("\n" + "=" * 50)
            print("  Mode E：@io 跨階段契約 IO 勾稽")
            print("=" * 50)
            self.check_contract_io()

        if self.mode == "S":
            print("\n" + "=" * 50)
            print("  @CheckSpec 模式：四規格完整性 + 交叉一致性")
            print("=" * 50)
            self.check_ssot_files_exist()
            self.check_feature_gherkin()
            self.check_srs_references()
            self.check_traceability()
            self.check_cross_spec_consistency()
            self.print_spec_summary()

        print("\n" + "=" * 50)
        print(f"結果: {len(self.passes)} 通過, {len(self.issues)} 失敗")
        if self.issues:
            print("\n失敗項目:")
            for i in self.issues:
                print(f"  - {i}")
            return 1
        print("所有檢查通過。")
        return 0

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SSOT Spec Integrity Checker")
    parser.add_argument("--project", default=None, help="目標專案目錄（未指定時自動偵測）")
    parser.add_argument("--phase", default=None, help="目標階段 (01-06)")
    parser.add_argument("--mode", default="D", choices=["A","B","C","D","E","S"], help="檢查模式 (S=@CheckSpec 四規格)")
    args = parser.parse_args()

    checker = SpecIntegrityChecker(target_phase=args.phase, mode=args.mode, project=args.project)
    sys.exit(checker.run())


