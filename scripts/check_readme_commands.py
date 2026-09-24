#!/usr/bin/env python3
"""Check the three command documents required by CORE_RULES.md section 1-6."""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def extract_cmdref_commands(cmdref):
    """Extract @commands from commands_reference.md core command table (section 一)."""
    start = cmdref.find("## 一、 核心指令對照表")
    if start < 0:
        return set()
    end = len(cmdref)
    for m in re.finditer(r'^## ', cmdref, re.MULTILINE):
        if m.start() > start:
            end = m.start()
            break
    section = cmdref[start:end]
    
    cmds = set()
    for m in re.finditer(r'\*\*`(@[^`]+)`\*\*', section):
        full = m.group(1)
        # Extract just the command name (before any space or parameter)
        cmd_name = full.split()[0] if ' ' in full else full
        # Exclude parameterized placeholders like @[stage]/[quick]
        if not cmd_name.startswith('@['):
            cmds.add(cmd_name)
    return cmds

def main():
    readme_path = os.path.join(ROOT, "README.md")
    cmdref_path = os.path.join(ROOT, "docs", "commands_reference.md")
    agents_path = os.path.join(ROOT, ".agents", "AGENTS.md")

    if not os.path.exists(readme_path):
        print("[FAIL] README.md not found")
        return 1
    if not os.path.exists(cmdref_path):
        print("[FAIL] docs/commands_reference.md not found")
        return 1
    if not os.path.exists(agents_path):
        print("[FAIL] .agents/AGENTS.md not found")
        return 1

    with open(readme_path, encoding="utf-8") as f:
        readme = f.read()
    with open(cmdref_path, encoding="utf-8") as f:
        cmdref = f.read()
    with open(agents_path, encoding="utf-8") as f:
        agents = f.read()

    cmdref_cmds = extract_cmdref_commands(cmdref)
    print(f"Commands in commands_reference.md core table: {len(cmdref_cmds)}")
    for c in sorted(cmdref_cmds):
        print(f"  {c}")

    anchor = re.search(r'^## 🎮 (?:\[)?指令系統', readme, re.MULTILINE)
    if not anchor:
        print("[FAIL] README.md missing command system section")
        return 1
    idx = anchor.start()

    next_idx = len(readme)
    for m in re.finditer(r'^## ', readme, re.MULTILINE):
        if m.start() > idx:
            next_idx = m.start()
            break
    cmd_section = readme[idx:next_idx]

    table_commands = set()
    for row in re.findall(r'^\|.*\|$', cmd_section, re.MULTILINE):
        if re.match(r'^\|\s*`@', row):
            table_commands.update(re.findall(r'`(@[A-Za-z][\w-]*)', row.split('|')[1]))

    missing = []
    missing_agents = []
    for cmd in sorted(cmdref_cmds):
        if cmd not in table_commands:
            missing.append(cmd)
        if cmd not in agents:
            missing_agents.append(cmd)

    if missing:
        print(f"\n[FAIL] README.md command table missing {len(missing)} command(s):")
        for m in missing:
            print(f"  - {m}")
        print("  Action: manually sync README.md command table")
        return 1
    if missing_agents:
        print(f"\n[FAIL] .agents/AGENTS.md missing {len(missing_agents)} command(s):")
        for command in missing_agents:
            print(f"  - {command}")
        return 1

    print(f"\n[PASS] Three command documents include {len(cmdref_cmds)} commands")
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())
