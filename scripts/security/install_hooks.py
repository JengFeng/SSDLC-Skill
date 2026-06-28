#!/usr/bin/env python3
"""Install pre-commit secret scanner hook"""
import os, sys, stat, shutil

repo = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
hooks = os.path.join(repo, ".git", "hooks")
if not os.path.exists(hooks):
    print("No .git/hooks found. Run git init first.")
    sys.exit(1)

hook_path = os.path.join(hooks, "pre-commit")
scanner = os.path.join(repo, "scripts", "security", "pre_commit_secrets.py")

hook_script = f'#!/bin/sh\npython "{scanner}"\n'

if os.path.exists(hook_path):
    shutil.copy2(hook_path, hook_path + ".bak")
    print("Existing hook backed up to pre-commit.bak")

with open(hook_path, "w") as f:
    f.write(hook_script)

os.chmod(hook_path, os.stat(hook_path).st_mode | stat.S_IEXEC)
print(f"Pre-commit hook installed: {hook_path}")
print(f"Scanner: {scanner}")