# -*- coding: utf-8 -*-
"""
⚠️ 已棄用(2026-06-14)：正式託管改用 Y:\\EIP\\ekb\\pm.php + storage/pm/{key}.html（有 EKB 登入認證）。
   本檔是早期「公開 Y:\\ 根目錄」法，僅留作非敏感頁(如純模擬畫面)的選項，敏感儀表板別用。
   詳見 SKILL.md「產出+託管架構」。

把儀表板 HTML 部署到 your-server.example.com 網站根目錄(Y:\\)，用 PHP wrapper 強制 no-cache。
URL = https://your-server.example.com/pm/<slug>/

用法:
  python deploy_web.py "<本機html路徑>" <slug> [--webroot "Y:\\pm"] [--auth-pass <密碼>]

注意:
  - 網站根目錄是「公開」的(nginx)，slug 請用不可猜亂碼。
  - 內部含預算/人名/弱點 → 建議帶 --auth-pass 加一道簡易密碼閘(session)。
  - 更新時用同一個 slug 重跑 → 覆蓋 dashboard.html，URL 不變、內容自新。
"""
import os, sys, shutil, argparse

PHP_NOCACHE = """<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");
"""

PHP_AUTH = """// --- 簡易密碼閘 ---
session_start();
$PASS = %r;
if (isset($_GET['logout'])) { session_destroy(); header("Location: ./"); exit; }
if (isset($_POST['p'])) { if (hash_equals($PASS, $_POST['p'])) $_SESSION['ok']=1; }
if (empty($_SESSION['ok'])) {
  echo '<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">';
  echo '<body style="font-family:sans-serif;background:#fbf6ee;color:#4a3f33;display:flex;height:100vh;align-items:center;justify-content:center">';
  echo '<form method=post style="background:#fff;padding:28px 32px;border-radius:14px;box-shadow:0 4px 16px rgba(120,90,40,.12)">';
  echo '<div style="font-size:18px;margin-bottom:12px">🔒 專案儀表板</div>';
  echo '<input name=p type=password placeholder="密碼" style="font-size:16px;padding:8px 12px;border:1px solid #ecd9bf;border-radius:8px">';
  echo '<button style="font-size:16px;padding:8px 18px;margin-left:8px;background:#e8862e;color:#fff;border:0;border-radius:8px">進入</button>';
  echo '</form></body>'; exit;
}
"""

PHP_TAIL = """readfile(__DIR__ . "/dashboard.html");
"""

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    ap.add_argument("slug")
    ap.add_argument("--webroot", default=r"Y:\pm")
    ap.add_argument("--auth-pass", default=None)
    a = ap.parse_args()

    if not os.path.isfile(a.html):
        print("ERROR: html not found:", a.html); sys.exit(1)

    dest = os.path.join(a.webroot, a.slug)
    os.makedirs(dest, exist_ok=True)
    shutil.copyfile(a.html, os.path.join(dest, "dashboard.html"))

    php = PHP_NOCACHE
    if a.auth_pass:
        php += PHP_AUTH % a.auth_pass
    php += "?>\n" + PHP_TAIL
    with open(os.path.join(dest, "index.php"), "w", encoding="utf-8") as f:
        f.write(php)

    print("deployed:", dest)
    print("URL: https://your-server.example.com/pm/%s/" % a.slug)
    if not a.auth_pass:
        print("WARN: 公開無密碼，slug 請確保不可猜；敏感資料建議加 --auth-pass")

if __name__ == "__main__":
    main()
