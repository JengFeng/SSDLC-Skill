#!/usr/bin/env python3
"""Check README.md command system section consistency with commands_reference.md."""
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

    if not os.path.exists(readme_path):
        print("[FAIL] README.md not found")
        return 1
    if not os.path.exists(cmdref_path):
        print("[FAIL] docs/commands_reference.md not found")
        return 1

    with open(readme_path, encoding="utf-8") as f:
        readme = f.read()
    with open(cmdref_path, encoding="utf-8") as f:
        cmdref = f.read()

    cmdref_cmds = extract_cmdref_commands(cmdref)
    print(f"Commands in commands_reference.md core table: {len(cmdref_cmds)}")
    for c in sorted(cmdref_cmds):
        print(f"  {c}")

    anchor = "## 🎮 指令系統"
    idx = readme.find(anchor)
    if idx < 0:
        print("[FAIL] README.md missing command system section")
        return 1

    next_idx = len(readme)
    for m in re.finditer(r'^## ', readme, re.MULTILINE):
        if m.start() > idx:
            next_idx = m.start()
            break
    cmd_section = readme[idx:next_idx]

    missing = []
    for cmd in sorted(cmdref_cmds):
        if cmd not in cmd_section:
            missing.append(cmd)

    if missing:
        print(f"\n[FAIL] README.md command table missing {len(missing)} command(s):")
        for m in missing:
            print(f"  - {m}")
        print("  Action: manually sync README.md command table")
        return 1

    print(f"\n[PASS] README command table matches ({len(cmdref_cmds)} commands)")
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())
