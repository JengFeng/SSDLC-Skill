#!/usr/bin/env python3
"""
YAML SSOT → system_specification.md 自動生成器
依據 CORE_RULES.md 三-2 規範，從 executable_spec.yaml 自動生成人類可讀的 SRS 文件。

用法: python generate_srs.py [specs/executable_spec.yaml] [輸出路徑]
預設: 讀取 specs/executable_spec.yaml，輸出 system_specification.md
"""

import yaml
import sys
from datetime import datetime

def load_spec(path="specs/executable_spec.yaml"):
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def generate_srs(spec, output_path="system_specification.md"):
    proj = spec["project"]
    p01 = spec["phase_01_planning"]
    p02 = spec["phase_02_design"]
    p03 = spec["phase_03_implementation"]
    p04 = spec["phase_04_testing"]
    p05 = spec["phase_05_deployment"]
    p06 = spec["phase_06_maintenance"]
    trace = spec.get("traceability", {}).get("matrix", [])
    changelog = spec.get("change_log", [])

    lines = []
    lines.append(f"# {proj['name']} — 系統功能規格書 (SRS)")
    lines.append("")
    lines.append(f"> **文件版本**：{proj['version']} | **日期**：{proj['last_updated']} | **自動生成自** `specs/executable_spec.yaml`")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 一、 緒論")
    lines.append("")
    lines.append(f"### 1.1 目的")
    lines.append(f"{proj.get('description', '（未定義）')}")
    lines.append("")
    lines.append("### 1.4 參考文件")
    lines.append("| 文件 | 路徑 |")
    lines.append("|:---|:---|")
    lines.append(f"| 需求追溯矩陣 | `traceability_matrix.md` |")
    lines.append(f"| 需求追蹤表 | `{p01['outputs'].get('requirement_tracker', '—')}` |")
    lines.append(f"| 正規化規格 | `{p01['outputs'].get('formal_requirements', '—')}` |")
    lines.append(f"| 測試報告 | `{p04['outputs'].get('test_results', '—')}` |")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 二、 整體描述")
    lines.append("")
    lines.append("### 2.2 產品功能摘要")
    lines.append("| 功能編號 | 功能名稱 | 優先級 | 說明 |")
    lines.append("|:---|:---|:---|:---|")
    for req in p01.get("requirements", []):
        lines.append(f"| {req['id']} | {req['description'][:30]} | {req['priority']} | {req.get('source', '—')} |")
    lines.append("")
    lines.append("### 2.4 運作環境")
    modules = p03.get("modules", [])
    if modules:
        deps = ", ".join(modules[0].get("dependencies", []))
        lines.append(f"- 技術棧：{deps}")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 三、 具體需求")
    lines.append("")
    for req in p01.get("requirements", []):
        lines.append(f"### 3.1.{req['id'][-3:]} {req['description'][:40]}")
        lines.append(f"- **優先級**：{req['priority']}")
        lines.append(f"- **來源**：{req.get('source', '—')}")
        lines.append("- **驗收條件**：")
        for ac in req.get("acceptance_criteria", []):
            lines.append(f"  - {ac}")
        lines.append("")

    if p02.get("api", {}).get("endpoints"):
        lines.append("### 3.2 外部介面需求")
        lines.append("| 方法 | 端點 | 說明 |")
        lines.append("|:---|:---|:---|")
        for ep in p02["api"]["endpoints"]:
            lines.append(f"| {ep['method']} | `{ep['path']}` | {ep.get('description', '—')} |")
        lines.append("")

    if p02.get("database", {}).get("tables"):
        lines.append("### 3.3 資料庫需求")
        for table in p02["database"]["tables"]:
            lines.append(f"#### {table['name']} 資料表")
            lines.append("| 欄位 | 型別 | 約束 |")
            lines.append("|:---|:---|:---|")
            for col in table.get("columns", []):
                lines.append(f"| {col['name']} | {col['type']} | {col.get('constraints', '—')} |")
            lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## 五、 驗收標準")
    lines.append("")
    lines.append("| 項目 | 標準 | 狀態 |")
    lines.append("|:---|:---|:---|")
    api = p04.get("test_results", {}).get("api", {})
    ui = p04.get("test_results", {}).get("ui", {})
    api_status = "[OK]" if api.get("failed", 1) == 0 and api.get("total", 0) > 0 else "[...]"
    ui_status = "[OK]" if ui.get("failed", 1) == 0 and ui.get("total", 0) > 0 else "[...]"
    lines.append(f"| API 測試 | pytest {api.get('passed',0)}/{api.get('total',0)} PASS | {api_status} |")
    lines.append(f"| UI 測試 | Playwright {ui.get('passed',0)}/{ui.get('total',0)} PASS | {ui_status} |")
    trace_verified = sum(1 for t in trace if t.get("status") == "已驗證")
    lines.append(f"| 需求追溯 | {trace_verified}/{len(trace)} 項已驗證 | {'[OK]' if trace_verified == len(trace) else '[!]'} |")
    design_count = len([v for v in p02.get("outputs", {}).values() if v])
    lines.append(f"| 設計產出 | {design_count} 項 | {'[OK]' if design_count >= 7 else '[!]'} |")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 六、 附錄")
    lines.append("")
    lines.append("### B. 變更紀錄（自動生成自 YAML change_log）")
    lines.append("| 版本 | 日期 | 階段 | 摘要 |")
    lines.append("|:---|:---|:---|:---|")
    for cl in changelog:
        lines.append(f"| {cl['version']} | {cl['date']} | {cl['phase']} | {cl.get('summary', '—')} |")
    lines.append("")
    lines.append(f"> [!] 本文件由 `scripts/generate_srs.py` 從 `specs/executable_spec.yaml` 自動生成。")
    lines.append(f"> 生成時間：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}。請勿手動編輯。")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"[OK] 已生成 {output_path}")
    print(f"   來源: specs/executable_spec.yaml")
    print(f"   需求數: {len(p01.get('requirements', []))}")
    print(f"   API 端點: {len(p02.get('api', {}).get('endpoints', []))}")
    print(f"   變更紀錄: {len(changelog)} 版")

if __name__ == "__main__":
    spec_path = sys.argv[1] if len(sys.argv) > 1 else "specs/executable_spec.yaml"
    out_path = sys.argv[2] if len(sys.argv) > 2 else "system_specification.md"
    spec = load_spec(spec_path)
    generate_srs(spec, out_path)

