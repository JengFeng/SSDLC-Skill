# -*- coding: utf-8 -*-
"""
ekb-note-tts / narrate_note.py
------------------------------------------------------------------
給一篇 EKB 筆記的「口語講稿」→ 產 mp3 → 上傳 EKB → 掛成該筆記的 narration
（relation='narration'、append_to_content=False → 獨立於內文，note.php 會顯示「🎧 本篇講解」）。

講稿由 Claude 先讀懂筆記、改寫成口語後存成 .txt 再餵進來；
這支只負責 TTS + 上傳 + 掛載（卸舊掛新）。

用法:
  python narrate_note.py --note-id 144 --script note144_script.txt [--voice E] [--speed 1.3]

需要環境變數: EKB_TOKEN, EKB_BASE_URL
複用: ~/.claude/skills/proposal-narration/scripts/tts.py
"""
import os, sys, argparse, requests

sys.path.insert(0, os.path.join(os.path.expanduser("~"), ".claude", "skills", "proposal-narration", "scripts"))
from tts import get_voice, tts, apply_pronunciation_fixes  # noqa: E402

BASE = os.environ.get("EKB_BASE_URL", "https://your-server.example.com/EIP/ekb").rstrip("/")
TOKEN = os.environ.get("EKB_TOKEN")
H = {"X-EKB-Token": TOKEN or ""}


def api_get(path):
    r = requests.get(f"{BASE}{path}", headers=H, timeout=60)
    r.raise_for_status()
    return r.json()["data"]


def api_post_json(path, body):
    r = requests.post(f"{BASE}{path}", headers={**H, "Content-Type": "application/json"},
                      json=body, timeout=120)
    r.raise_for_status()
    return r.json()["data"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--note-id", type=int, required=True)
    ap.add_argument("--script", required=True, help="口語講稿 .txt 路徑（Claude 先寫好）")
    ap.add_argument("--voice", default="E", help="voices.yaml key：E=HsiaoChen免費(預設) / B=Tiffy_TW付費")
    ap.add_argument("--speed", type=float, default=1.3)
    ap.add_argument("--keep-old", action="store_true", help="不卸除舊講解（預設一篇一個，會先卸舊）")
    args = ap.parse_args()

    if not TOKEN:
        sys.exit("缺少 EKB_TOKEN 環境變數")

    with open(args.script, encoding="utf-8") as f:
        text = f.read().strip()
    if not text:
        sys.exit("講稿是空的")

    # 1) TTS
    voice = dict(get_voice(args.voice))
    voice["speed"] = args.speed
    out_mp3 = os.path.join(os.path.dirname(os.path.abspath(args.script)),
                           f"note{args.note_id}_narration.mp3")
    print(f"[1/4] TTS  voice={voice['name']} ({voice['provider']}) speed={args.speed} chars={len(text)}")
    if not tts(apply_pronunciation_fixes(text), out_mp3, voice):
        sys.exit("TTS 失敗")
    print(f"      -> {out_mp3} ({os.path.getsize(out_mp3)} bytes)")

    # 2) 卸舊講解（一篇一個）
    if not args.keep_old:
        note = api_get(f"/api/notes.php?id={args.note_id}")
        for af in note.get("attached_files", []):
            if af.get("relation") == "narration":
                print(f"[2/4] 卸除舊講解 file #{af['id']}")
                api_post_json(f"/api/notes.php?id={args.note_id}&op=detach_file",
                              {"file_id": int(af["id"]), "remove_from_content": False})
    else:
        print("[2/4] keep-old：保留舊講解")

    # 3) 上傳新 mp3
    print("[3/4] 上傳 mp3 …")
    with open(out_mp3, "rb") as fp:
        up = requests.post(f"{BASE}/api/files.php", headers=H,
                           files={"file": (os.path.basename(out_mp3), fp, "audio/mpeg")}, timeout=180)
    up.raise_for_status()
    file_id = up.json()["data"]["id"]
    print(f"      -> file #{file_id}")

    # 4) 掛成 narration（append_to_content=False → 不進可編輯內文）
    print("[4/4] 掛成 narration …")
    api_post_json(f"/api/notes.php?id={args.note_id}&op=attach_file",
                  {"file_id": file_id, "relation": "narration", "append_to_content": False})

    print(f"\n[OK] 筆記 #{args.note_id} 已掛上講解。")
    print(f"  筆記頁: {BASE}/note.php?id={args.note_id}")
    print(f"  試聽:   {BASE}/api/files.php?id={file_id}&download=1&inline=1")


if __name__ == "__main__":
    main()
