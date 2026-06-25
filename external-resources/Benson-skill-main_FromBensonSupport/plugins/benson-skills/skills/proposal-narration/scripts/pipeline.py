"""
proposal-narration / scripts/pipeline.py
==========================================
Full pipeline: PPTX + narration.md → MP4 (1080p) + Discord preview (~9 MB)

Usage:
    python pipeline.py <pptx_path> <narration_md_path> [<voice_key>] [<work_dir>]

Example:
    python pipeline.py "Benson.pptx" "narration.md" B "video/v1"

Pipeline steps:
    1. PPTX → PDF (PowerPoint COM)
    2. PDF → 每頁 PNG (PyMuPDF dpi=150)
    3. 解析 narration.md → 套破音字
    4. 每頁 TTS（按 voices.yaml 選的 provider，via tts.py）
    5. 每頁 ffmpeg: PNG + mp3 → mp4 (1920x1080)
    6. concat → 完整 mp4
    7. 壓縮 → Discord 預覽版 (854x crf 34)

依賴：python-pptx, pymupdf, pywin32, requests, openai, edge-tts (依需要), pyyaml
"""

import os
import re
import sys
import subprocess
import time
from pathlib import Path

# Windows cp950 預設 codepage 印 emoji (✅ ❌ 📝 🎬) 會炸 UnicodeEncodeError、
# 直接掛掉整個 pipeline。先把 stdout/stderr 強制成 utf-8，後面 print emoji 就安全。
for _stream_attr in ("stdout", "stderr"):
    _s = getattr(sys, _stream_attr, None)
    if _s is not None and hasattr(_s, "reconfigure"):
        try:
            _s.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

# Skill dir 加入 path 以引用 tts.py
SKILL_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(SKILL_DIR))
from scripts.tts import get_voice, tts, apply_pronunciation_fixes  # noqa: E402


# ============================================================
# Step 1: PPTX → PDF → PNG
# ============================================================

def export_pptx_to_pdf(pptx_path: str, pdf_path: str) -> None:
    """PowerPoint COM 把 pptx 存成 pdf。"""
    import win32com.client
    ppt = win32com.client.Dispatch("PowerPoint.Application")
    pres = ppt.Presentations.Open(os.path.abspath(pptx_path), WithWindow=False)
    pres.SaveAs(os.path.abspath(pdf_path), 32)  # 32 = ppSaveAsPDF
    pres.Close()
    try:
        ppt.Quit()
    except AttributeError:
        # 已知偶發錯誤，PDF 通常已成功 export
        pass


def extract_pages_to_png(pdf_path: str, out_dir: str, dpi: int = 150) -> int:
    """PDF → 每頁 PNG。回傳頁數。"""
    import fitz
    os.makedirs(out_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    n = doc.page_count
    for i in range(n):
        doc[i].get_pixmap(dpi=dpi).save(f"{out_dir}/p{i+1}.png")
    doc.close()
    return n


# ============================================================
# Step 2: 解析 narration.md
# ============================================================

def parse_narration_md(md_path: str) -> dict:
    """
    解析 narration.md，回傳：
      {
        "voice_key": "B",
        "scripts": {1: "...", 2: "...", ...}
      }

    格式約定：
      - voice_key 在 Meta yaml block
      - Scripts 用 ## P{n} header
    """
    with open(md_path, encoding="utf-8") as f:
        text = f.read()

    # Voice key from Meta yaml
    voice_key = "B"  # default Tiffy_TW
    m = re.search(r"voice_key:\s*(\w+)", text)
    if m:
        voice_key = m.group(1)

    # Speed override (Meta yaml `speed: 1.5` — 沒給就走 tts.py DEFAULT_SPEED)
    speed = None
    m = re.search(r"^\s*speed:\s*([\d.]+)\s*$", text, re.MULTILINE)
    if m:
        speed = float(m.group(1))

    # Subtitles 開關 (Meta yaml `subtitles: true/false`，預設 true)
    subtitles = True
    m = re.search(r"^\s*subtitles:\s*(true|false|yes|no|on|off|1|0)\s*$", text,
                  re.MULTILINE | re.IGNORECASE)
    if m:
        subtitles = m.group(1).lower() in ("true", "yes", "on", "1")

    # Scripts: split by ## P\d+
    # 同時抓 [approved: yes/no] 跟 [visual_check: ...] markers
    # 真正 narration 文字 = body 去掉這些 marker 行 + 前後空白
    scripts = {}
    approvals = {}
    visuals = {}
    h2_pattern = re.compile(r"^##\s*$", re.MULTILINE)  # 用來防止 ## Notes 之類也被吃掉
    pattern = re.compile(r"^###?\s*P(\d+)\s*$", re.MULTILINE)
    matches = list(pattern.finditer(text))
    for i, m in enumerate(matches):
        page_num = int(m.group(1))
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        body = re.split(r"\n##\s|\n---", body)[0].strip()

        # approved marker (預設 no — 沒寫 marker 也視為未 approved，強迫顯式)
        approved = False
        am = re.search(r"\[approved:\s*(yes|true|y)\]", body, re.IGNORECASE)
        if am:
            approved = True
        # visual_check marker (給 visual confirm patch 用)
        vm = re.search(r"\[visual_check:\s*(.+?)\]", body)
        visual = vm.group(1).strip() if vm else None

        # 把 marker 行從 body 移除，剩下才是純 narration 文字
        clean = re.sub(r"^\s*\[approved:[^\]]*\]\s*$", "", body, flags=re.MULTILINE | re.IGNORECASE)
        clean = re.sub(r"^\s*\[visual_check:[^\]]*\]\s*$", "", clean, flags=re.MULTILINE | re.IGNORECASE)
        clean = clean.strip()

        if clean:
            scripts[page_num] = clean
            approvals[page_num] = approved
            if visual:
                visuals[page_num] = visual

    return {
        "voice_key": voice_key,
        "speed": speed,
        "subtitles": subtitles,
        "scripts": scripts,
        "approvals": approvals,
        "visuals": visuals,
    }


def check_approvals(narration: dict, allow_override: bool = False) -> None:
    """檢查所有頁是否 [approved: yes]。未 approve 直接 raise，除非 allow_override=True。

    用途：防止 AI 寫完 narration 直接跑 pipeline 合成，user 還沒 review。
    """
    pending = [n for n, ok in sorted(narration["approvals"].items()) if not ok]
    if not pending:
        return
    msg = (
        f"\n[Pipeline 拒絕跑] 以下 {len(pending)} 頁還沒 [approved: yes]\n"
        f"   未 approve: P{', P'.join(str(n) for n in pending)}\n\n"
        f"請逐頁 review narration.md，確認該頁講稿與 PPT 視覺對齊後，\n"
        f"把該頁的 [approved: no] 改為 [approved: yes]。\n"
        f"全部 approve 後再重跑 pipeline。\n\n"
        f"(若要強制跳過 — 不建議 — 可用 run(..., allow_unapproved=True))"
    )
    if allow_override:
        # 安全 print：stdout 編碼可能是 cp950，用 errors=replace 不要因為 emoji 中斷
        try: print(msg)
        except UnicodeEncodeError: print(msg.encode('utf-8', 'replace').decode('utf-8', 'replace'))
        try: print("[WARN] allow_unapproved=True，強制續跑。")
        except UnicodeEncodeError: pass
        return
    raise RuntimeError(msg)


# ============================================================
# Step 3-4: TTS
# ============================================================

def generate_all_tts(scripts: dict, voice: dict, audio_dir: str) -> None:
    """每頁套破音字 + TTS。"""
    os.makedirs(audio_dir, exist_ok=True)
    print(f"\n=== TTS: {voice['name']} ({voice['provider']}, {voice['cost']}) ===")
    for n, raw in sorted(scripts.items()):
        text = apply_pronunciation_fixes(raw)
        out = f"{audio_dir}/p{n}.mp3"
        t0 = time.time()
        ok = tts(text, out, voice)
        flag = "✅" if ok else "❌"
        print(f"  p{n}: {len(text)}c {time.time()-t0:.1f}s {flag}")


# ============================================================
# Step 5-6: ffmpeg per-page mp4 + concat
# ============================================================

def build_per_page_mp4(pages_dir: str, audio_dir: str, n_pages: int) -> None:
    """每頁 PNG + mp3 → mp4 (1920x1080)。"""
    print("\n=== Build per-page mp4 ===")
    for n in range(1, n_pages + 1):
        cmd = [
            "ffmpeg", "-y", "-loglevel", "error", "-loop", "1",
            "-i", f"{pages_dir}/p{n}.png",
            "-i", f"{audio_dir}/p{n}.mp3",
            "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p",
            "-vf", "scale=1920:-2,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:white",
            "-c:a", "aac", "-b:a", "192k", "-shortest",
            f"{audio_dir}/p{n}.mp4",
        ]
        subprocess.run(cmd, check=True)


# ============================================================
# 字幕 (.srt) 生成 + 燒進影片
# ============================================================

def _probe_duration(mp3_path: str) -> float:
    """用 ffprobe 拿 mp3 長度 (秒)。"""
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", mp3_path],
        capture_output=True, text=True, check=True,
    )
    return float(r.stdout.strip())


def _split_chinese_sentences(text: str, max_chars: int = 24) -> list:
    """按中文標點切句，並把超長句再切到 ≤ max_chars。"""
    text = re.sub(r"\s+", " ", text).strip()
    parts = [s.strip() for s in re.split(r"[。！？!?\n]+", text) if s.strip()]
    out = []
    for p in parts:
        if len(p) <= max_chars:
            out.append(p)
            continue
        # 二次切：用逗號 / 頓號 / 分號
        sub = [s.strip() for s in re.split(r"[，、；,;]", p) if s.strip()]
        if sub and max(len(s) for s in sub) <= max_chars:
            out.extend(sub)
        else:
            # 還是太長 → 硬切
            for i in range(0, len(p), max_chars):
                out.append(p[i:i + max_chars])
    return out


def _fmt_srt_ts(sec: float) -> str:
    h = int(sec // 3600); m = int((sec % 3600) // 60)
    s = int(sec % 60); ms = int(round((sec - int(sec)) * 1000))
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def generate_srt(narration: dict, audio_dir: str, out_srt: str) -> None:
    """產整支影片的 .srt — 每頁 narration 按句切，時間軸用各頁 mp3 長度估算。"""
    cur = 0.0
    idx = 1
    entries = []
    for n in sorted(narration["scripts"].keys()):
        mp3 = f"{audio_dir}/p{n}.mp3"
        if not os.path.exists(mp3):
            continue
        page_dur = _probe_duration(mp3)
        sentences = _split_chinese_sentences(narration["scripts"][n])
        if not sentences:
            cur += page_dur
            continue
        total_chars = sum(len(s) for s in sentences)
        # 平均每字秒數 (略保留 0.05 秒緩衝避免字幕跨頁)
        sec_per_char = (page_dur - 0.05) / max(1, total_chars)
        seg_start = cur
        for s in sentences:
            seg_dur = max(0.8, len(s) * sec_per_char)
            seg_end = min(cur + page_dur, seg_start + seg_dur)
            entries.append((idx, seg_start, seg_end, s))
            seg_start = seg_end
            idx += 1
        cur += page_dur

    with open(out_srt, "w", encoding="utf-8") as f:
        for i, st, ed, txt in entries:
            f.write(f"{i}\n{_fmt_srt_ts(st)} --> {_fmt_srt_ts(ed)}\n{txt}\n\n")
    print(f"  📝 字幕 .srt 產出 ({len(entries)} 條): {out_srt}")


def burn_subtitles(input_mp4: str, srt_path: str, output_mp4: str,
                   font_size: int = 24) -> None:
    """用 ffmpeg subtitles filter 把 .srt 燒進影片 (硬字幕，所有播放器都看得到)。

    原則：不擋畫面 — 字型小 + 半透明黑底條 + 貼底邊。
    1920x1080 預設 FontSize=24 (約佔畫面高 2.2%)，MarginV=24 (緊貼底邊)。
    """
    srt_esc = srt_path.replace("\\", "/").replace(":", "\\:")
    style = (
        f"FontName=Microsoft JhengHei,FontSize={font_size},"
        f"PrimaryColour=&H00FFFFFF,"           # 白字
        f"OutlineColour=&H80000000,"            # 半透明黑外框
        f"BackColour=&H80000000,"               # 半透明黑底
        f"BorderStyle=3,"                       # 3 = 用 BackColour 填底框（包字後面）
        f"Outline=1,Shadow=0,"
        f"Alignment=2,MarginV=24"               # 2 = 底部置中 / MarginV 24 貼底
    )
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", input_mp4,
         "-vf", f"subtitles='{srt_esc}':force_style='{style}'",
         "-c:v", "libx264", "-crf", "20", "-preset", "medium",
         "-c:a", "copy",
         output_mp4],
        check=True,
    )


def concat_to_full_mp4(audio_dir: str, n_pages: int, final_mp4: str) -> float:
    """concat 所有頁 mp4 → 完整 mp4。回傳大小 MB。"""
    listf = f"{audio_dir}/concat.txt"
    with open(listf, "w") as f:
        for n in range(1, n_pages + 1):
            f.write(f"file 'p{n}.mp4'\n")
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
         "-i", listf, "-c", "copy", final_mp4],
        check=True,
    )
    return os.path.getsize(final_mp4) / 1024 / 1024


def make_discord_preview(full_mp4: str, preview_mp4: str) -> float:
    """壓縮成 Discord 上傳上限內的預覽版 (854px / crf 34)。回傳大小 MB。"""
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", full_mp4,
         "-vf", "scale=854:-2",
         "-c:v", "libx264", "-crf", "34", "-preset", "medium",
         "-c:a", "aac", "-b:a", "48k",
         preview_mp4],
        check=True,
    )
    return os.path.getsize(preview_mp4) / 1024 / 1024


# ============================================================
# Main pipeline
# ============================================================

def run(pptx_path: str, narration_md_path: str, voice_key: str = None,
        work_dir: str = "video/narration_output",
        allow_unapproved: bool = False) -> dict:
    """跑完整 pipeline，回傳 {full_mp4, preview_mp4, n_pages}。

    Args:
        allow_unapproved: 預設 False — 任一頁未 [approved: yes] 直接拒絕跑。
                          設 True 強制跳過 (不建議, 會印警告)。
    """
    pptx_path = os.path.abspath(pptx_path)
    work_dir = os.path.abspath(work_dir)
    os.makedirs(work_dir, exist_ok=True)

    # 解析 narration.md
    narration = parse_narration_md(narration_md_path)

    # ★ 閘門 1：approve check (防 AI 寫完直接合成 → user 還沒 review)
    check_approvals(narration, allow_override=allow_unapproved)

    voice = get_voice(voice_key or narration["voice_key"])
    # narration.md 內 `speed:` 覆蓋 voice (沒給就走 tts.DEFAULT_SPEED=1.5)
    if narration.get("speed") is not None:
        voice = dict(voice)  # 不污染 yaml dict
        voice["speed"] = narration["speed"]
    effective_speed = voice.get("speed", 1.5)
    print(f"  Voice: {voice['name']} | Speed: {effective_speed}x")

    # Step 1-2: PPTX → PDF → PNG
    pdf_path = f"{work_dir}/temp.pdf"
    pages_dir = f"{work_dir}/pages"
    print(f"\n=== Step 1-2: PPTX → PDF → PNG ===")
    export_pptx_to_pdf(pptx_path, pdf_path)
    n_pages = extract_pages_to_png(pdf_path, pages_dir)
    print(f"  Extracted {n_pages} pages")

    # 校驗：narration 頁數 vs pptx 頁數
    if set(narration["scripts"].keys()) != set(range(1, n_pages + 1)):
        print(f"⚠️ narration.md 涵蓋 {len(narration['scripts'])} 頁，"
              f"PPTX 有 {n_pages} 頁。請檢查是否漏寫某頁。")

    # Step 3-4: TTS
    audio_dir = f"{work_dir}/audio"
    generate_all_tts(narration["scripts"], voice, audio_dir)

    # Step 5-6: 影片組合
    build_per_page_mp4(pages_dir, audio_dir, n_pages)
    full_mp4 = f"{work_dir}/full.mp4"
    full_size = concat_to_full_mp4(audio_dir, n_pages, full_mp4)
    print(f"\n✅ Full: {full_mp4} ({full_size:.1f} MB)")

    # Step 6.5: 字幕 .srt + 燒進影片 (依 narration.subtitles 決定)
    srt_path = None
    full_subbed_mp4 = None
    full_subbed_size = None
    if narration.get("subtitles", True):
        srt_path = f"{work_dir}/full.srt"
        full_subbed_mp4 = f"{work_dir}/full_subtitled.mp4"
        try:
            generate_srt(narration, audio_dir, srt_path)
            burn_subtitles(full_mp4, srt_path, full_subbed_mp4)
            full_subbed_size = os.path.getsize(full_subbed_mp4) / 1024 / 1024
            print(f"✅ Full (字幕版): {full_subbed_mp4} ({full_subbed_size:.1f} MB)")
        except Exception as e:
            print(f"⚠️ 字幕產製失敗 (主檔無字幕但 mp4 仍可用): {e}")
            srt_path = None
            full_subbed_mp4 = None
    else:
        print("(narration.md: subtitles=false → 跳過字幕產製)")

    # Step 7: 壓縮預覽 (字幕版優先，沒有用無字幕版)
    preview_mp4 = f"{work_dir}/preview.mp4"
    preview_size = make_discord_preview(full_subbed_mp4 or full_mp4, preview_mp4)
    print(f"✅ Preview: {preview_mp4} ({preview_size:.1f} MB)")

    # Step 8 (★ Patch C): 自動 push 到 EKB，每張 PNG + mp4 的 extracted_text 寫真實旁白
    ekb_note_url = None
    if os.environ.get("EKB_TOKEN") and os.environ.get("EKB_BASE_URL"):
        try:
            ekb_note_url = push_to_ekb(
                pages_dir=pages_dir,
                full_mp4=full_mp4,
                preview_mp4=preview_mp4,
                narration=narration,
                voice=voice,
                pptx_path=pptx_path,
                n_pages=n_pages,
            )
            if ekb_note_url:
                print(f"\n📚 EKB note: {ekb_note_url}")
        except Exception as e:
            print(f"\n⚠️ EKB push 失敗 (mp4 已產出，可手動上傳): {e}")
    else:
        print("\n(skip EKB push — 未設 EKB_TOKEN / EKB_BASE_URL)")

    return {
        "full_mp4": full_mp4,
        "full_subtitled_mp4": full_subbed_mp4,
        "srt": srt_path,
        "preview_mp4": preview_mp4,
        "n_pages": n_pages,
        "full_mb": full_size,
        "full_subbed_mb": full_subbed_size,
        "preview_mb": preview_size,
        "ekb_note_url": ekb_note_url,
    }


# ============================================================
# Step 8: EKB 整合 (Patch C)
# ============================================================

def push_to_ekb(pages_dir: str, full_mp4: str, preview_mp4: str,
                narration: dict, voice: dict, pptx_path: str, n_pages: int) -> str:
    """跑完 pipeline 後，把所有產出物上傳到 EKB 並寫好 extracted_text。

    每張 PNG / mp4 的 extracted_text 直接寫真實旁白 — 下次 AI 看到這篇 note
    就有 ground truth，不會 hallucinate。
    """
    import requests as _r
    BASE = os.environ["EKB_BASE_URL"].rstrip("/")
    H = {"X-EKB-Token": os.environ["EKB_TOKEN"]}

    def _upload(path: str) -> int:
        with open(path, "rb") as fh:
            r = _r.post(f"{BASE}/api/files.php",
                files={"file": (os.path.basename(path), fh)},
                headers=H, timeout=300)
        r.raise_for_status()
        return r.json()["data"]["id"]

    def _patch_text(file_id: int, text: str) -> None:
        _r.patch(f"{BASE}/api/files.php?id={file_id}",
            headers={**H, "Content-Type": "application/json"},
            json={"extracted_text": text}, timeout=60).raise_for_status()

    project_name = os.path.splitext(os.path.basename(pptx_path))[0]
    note_title = f"{project_name} — 旁白影片 ({n_pages} 頁, {voice['name']}, {voice.get('speed', 1.5)}x)"

    # 建立 note 容器
    intro = (
        f"<h2>旁白影片自動產製紀錄</h2>"
        f"<p><strong>來源 PPTX：</strong>{os.path.basename(pptx_path)}<br>"
        f"<strong>頁數：</strong>{n_pages}<br>"
        f"<strong>配音：</strong>{voice['name']} ({voice['provider']})<br>"
        f"<strong>語速：</strong>{voice.get('speed', 1.5)}x</p>"
    )
    r = _r.post(f"{BASE}/api/notes.php",
        headers={**H, "Content-Type": "application/json"},
        json={"title": note_title, "content": intro,
              "tags": ["proposal-narration", "narrated-video"],
              "source_ref": f"🤖 AI 產製：proposal-narration 旁白影片 ({os.path.basename(pptx_path)})",
              "change_reason": "proposal-narration auto-push"},
        timeout=60)
    r.raise_for_status()
    note_id = r.json()["data"]["id"]
    print(f"  📝 EKB note #{note_id} 建立")

    # 逐頁 upload PNG + PATCH narration 為 extracted_text
    visuals = narration.get("visuals", {})
    scripts = narration["scripts"]
    for n in sorted(scripts.keys()):
        png = f"{pages_dir}/page_{n:02d}.png"
        if not os.path.exists(png):
            png = f"{pages_dir}/p{n}.png"
        if not os.path.exists(png):
            continue
        fid = _upload(png)
        text = (
            f"=== 旁白原稿 by proposal-narration ===\n"
            f"頁次：P{n} / {n_pages}\n"
            f"視覺：{visuals.get(n, '(未填 visual_check)')}\n\n"
            f"=== 旁白文字 ===\n{scripts[n]}\n"
        )
        _patch_text(fid, text)
        # attach 到 note
        _r.post(f"{BASE}/api/notes.php?id={note_id}&op=attach_file",
            headers={**H, "Content-Type": "application/json"},
            json={"file_id": fid, "relation": "source"}, timeout=30)
        print(f"  📎 P{n}: file #{fid} ({os.path.basename(png)}) attached + extracted_text 寫入")

    # upload mp4 (full + preview)
    full_id = _upload(full_mp4)
    all_narration = "\n\n".join(
        f"=== P{n} ===\n{scripts[n]}" for n in sorted(scripts.keys())
    )
    _patch_text(full_id,
        f"=== 旁白逐字稿 by proposal-narration ===\n"
        f"配音：{voice['name']} {voice.get('speed', 1.5)}x\n\n{all_narration}")
    _r.post(f"{BASE}/api/notes.php?id={note_id}&op=attach_file",
        headers={**H, "Content-Type": "application/json"},
        json={"file_id": full_id, "relation": "source"}, timeout=30)
    print(f"  🎬 full mp4: file #{full_id} attached")

    if os.path.exists(preview_mp4):
        prev_id = _upload(preview_mp4)
        _patch_text(prev_id, f"=== preview (壓縮版) — 完整旁白見 file #{full_id} ===")
        _r.post(f"{BASE}/api/notes.php?id={note_id}&op=attach_file",
            headers={**H, "Content-Type": "application/json"},
            json={"file_id": prev_id, "relation": "reference"}, timeout=30)
        print(f"  🎬 preview mp4: file #{prev_id} attached")

    # 字幕 .srt (如果有產) — 給 user 下載外掛
    srt_path = full_mp4.replace("full.mp4", "full.srt")
    if os.path.exists(srt_path):
        srt_id = _upload(srt_path)
        with open(srt_path, encoding="utf-8") as fh:
            srt_text = fh.read()
        _patch_text(srt_id, f"=== 外掛字幕 SubRip — 對應 file #{full_id} ===\n\n{srt_text}")
        _r.post(f"{BASE}/api/notes.php?id={note_id}&op=attach_file",
            headers={**H, "Content-Type": "application/json"},
            json={"file_id": srt_id, "relation": "reference"}, timeout=30)
        print(f"  📝 .srt: file #{srt_id} attached")

    return f"{BASE}/note.php?id={note_id}"


# ============================================================
# CLI
# ============================================================

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python pipeline.py <pptx_path> <narration_md_path> "
              "[<voice_key>] [<work_dir>]")
        sys.exit(1)

    result = run(
        pptx_path=sys.argv[1],
        narration_md_path=sys.argv[2],
        voice_key=sys.argv[3] if len(sys.argv) > 3 else None,
        work_dir=sys.argv[4] if len(sys.argv) > 4 else "video/narration_output",
    )
    print(f"\n🎬 完成：{result}")
