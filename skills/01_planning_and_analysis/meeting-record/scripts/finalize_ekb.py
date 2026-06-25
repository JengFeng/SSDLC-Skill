"""
meeting-record / scripts / finalize_ekb.py
============================================
Phase 4 收尾：
1. proposal-narration 跑完後會自建一個新 EKB note 並把 PNG/mp4/srt 都 attach 上去
2. 我們需要把這些 file_id 全部 reattach 到 Phase 1 建好的會議紀錄 note
3. PATCH 會議紀錄 note 的 content、把投影片 inline + 影片 inline + 下載按鈕
4. 軟刪 pipeline 自建的重複 note

Usage:
    python finalize_ekb.py \
        --note-id 132 \
        --dup-note-id 133 \
        --png-ids 49,50,51,52,53 \
        --full-mp4-id 54 \
        --preview-mp4-id 55 \
        --srt-id 56 \
        --duration 16:40 \
        --full-mb 25.5 \
        --content-html-path 會議紀錄_note_draft.html \
        --captions "P1 封面;P2 系統範圍;P3 警戒;P4 硬體;P5 時程"

Env:
    EKB_TOKEN, EKB_BASE_URL
"""
import argparse
import sys
from pathlib import Path

# 允許從本目錄當模組跑、也允許單檔執行
sys.path.insert(0, str(Path(__file__).parent))
from ekb_publish import (
    attach_file, patch_note, build_slide_figures_html, build_video_html,
    _h, _base,
)
import requests


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--note-id", type=int, required=True,
                    help="Phase 1 會議紀錄 note id（要被 reattach 的那個）")
    ap.add_argument("--dup-note-id", type=int, required=True,
                    help="pipeline 自建的重複 note id（要軟刪的）")
    ap.add_argument("--png-ids", required=True,
                    help="5 張投影片 file_id，逗號分隔，依 P1→P5 順序")
    ap.add_argument("--full-mp4-id", type=int, required=True)
    ap.add_argument("--preview-mp4-id", type=int, required=True)
    ap.add_argument("--srt-id", type=int, default=None)
    ap.add_argument("--duration", default="??:??",
                    help="影片時長 mm:ss")
    ap.add_argument("--full-mb", type=float, default=0.0)
    ap.add_argument("--content-html-path", required=True,
                    help="Phase 1 寫好的會議紀錄 HTML 檔路徑")
    ap.add_argument("--captions", default=None,
                    help="5 張投影片 caption，分號分隔；不給就用預設")
    ap.add_argument("--change-reason", default="附上會議投影片 + 配音介紹影片")
    args = ap.parse_args()

    png_ids = [int(x) for x in args.png_ids.split(",")]
    if len(png_ids) != 5:
        sys.exit(f"ERR: png-ids 必須 5 個（收到 {len(png_ids)}）")

    if args.captions:
        captions = args.captions.split(";")
        if len(captions) != 5:
            sys.exit(f"ERR: captions 必須 5 個（收到 {len(captions)}）")
    else:
        captions = [
            "P1 封面 — 議題 overview",
            "P2 議題一",
            "P3 議題二",
            "P4 議題三+四",
            "P5 必交清單 + 延後議題",
        ]

    base_html_path = Path(args.content_html_path)
    if not base_html_path.exists():
        sys.exit(f"ERR: content-html-path 不存在: {base_html_path}")
    base_html = base_html_path.read_text(encoding="utf-8")

    # 1. attach 全部 8 個 file_id 到目標 note
    all_ids = png_ids + [args.full_mp4_id, args.preview_mp4_id]
    if args.srt_id:
        all_ids.append(args.srt_id)
    print(f"=== 1. Attach {len(all_ids)} files to note #{args.note_id} ===")
    for fid in all_ids:
        try:
            attach_file(args.note_id, fid, relation="attachment", append_to_content=False)
            print(f"  attached file #{fid}")
        except requests.HTTPError as e:
            print(f"  skip file #{fid}: {e.response.status_code} {e.response.text[:120]}")

    # 2. 包 inline HTML + PATCH
    print("\n=== 2. Patch note content with inline slides + video ===")
    slides_block = build_slide_figures_html([
        {"id": fid, "name": f"p{i+1}.png", "caption": cap}
        for i, (fid, cap) in enumerate(zip(png_ids, captions))
    ])
    video_block = build_video_html(
        preview_id=args.preview_mp4_id,
        full_id=args.full_mp4_id,
        duration_mmss=args.duration,
        full_size_mb=args.full_mb,
        srt_id=args.srt_id,
    )
    new_content = base_html + slides_block + video_block
    patch_note(args.note_id, new_content, change_reason=args.change_reason)
    print(f"  note #{args.note_id} content updated")

    # 3. 軟刪 pipeline 自建的 dup note
    print(f"\n=== 3. Soft-delete duplicate note #{args.dup_note_id} ===")
    r = requests.delete(
        f"{_base()}/api/notes.php?id={args.dup_note_id}",
        headers=_h(),
        timeout=30,
    )
    if r.ok:
        print(f"  note #{args.dup_note_id} soft-deleted")
    else:
        print(f"  soft-delete fail: {r.status_code} {r.text[:200]}")

    print(f"\n✅ Done. EKB note: {_base()}/note.php?id={args.note_id}")


if __name__ == "__main__":
    main()
