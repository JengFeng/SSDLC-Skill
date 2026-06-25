#!/usr/bin/env python3
"""
yt_fetch.py — 給 ekb-note skill 的 YouTube 抓取器
============================================================
貼一個 YouTube 連結 → 下載音訊(mp3) + 抓 metadata + faster-whisper 中文轉錄
→ 印出 JSON 給 agent 彙整成 EKB note。

用法:
    python yt_fetch.py <youtube_url> [out_dir] [--no-transcribe] [--model small]

輸出 (stdout, JSON):
    { title, url, uploader, duration_sec, mp3_path, transcript, transcribed_by }

依賴:
    yt-dlp (CLI 或 pip 模組), ffmpeg, faster-whisper (可選, 沒裝就跳轉錄)
環境已驗證: yt-dlp ✓ / ffmpeg ✓ / faster_whisper ✓
"""
import sys, os, json, subprocess, shutil, re

def log(*a):
    print(*a, file=sys.stderr, flush=True)

def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace', **kw)

def yt_dlp_cmd():
    # 優先系統 yt-dlp，否則 python -m yt_dlp
    if shutil.which('yt-dlp'):
        return ['yt-dlp']
    return [sys.executable, '-m', 'yt_dlp']

def fetch_meta(url):
    r = run(yt_dlp_cmd() + ['--dump-json', '--no-playlist', '--skip-download', url])
    if r.returncode != 0:
        raise RuntimeError(f'yt-dlp metadata 失敗: {r.stderr[:300]}')
    j = json.loads(r.stdout.strip().splitlines()[0])
    return {
        'title': j.get('title', 'YouTube 影片'),
        'url': j.get('webpage_url', url),
        'uploader': j.get('uploader') or j.get('channel') or '',
        'duration_sec': j.get('duration') or 0,
        'description': (j.get('description') or '')[:2000],
    }

def download_audio(url, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    out_tmpl = os.path.join(out_dir, '%(title).80s.%(ext)s')
    r = run(yt_dlp_cmd() + [
        '-x', '--audio-format', 'mp3', '--audio-quality', '5',
        '--no-playlist', '-o', out_tmpl, '--print', 'after_move:filepath', url
    ])
    if r.returncode != 0:
        raise RuntimeError(f'yt-dlp 下載失敗: {r.stderr[:300]}')
    # --print after_move:filepath 會印出最終路徑
    path = None
    for line in r.stdout.strip().splitlines():
        line = line.strip()
        if line.lower().endswith('.mp3') and os.path.exists(line):
            path = line
    if not path:  # fallback: 找 out_dir 內最新 mp3
        mp3s = [os.path.join(out_dir, f) for f in os.listdir(out_dir) if f.lower().endswith('.mp3')]
        if mp3s:
            path = max(mp3s, key=os.path.getmtime)
    if not path:
        raise RuntimeError('找不到下載後的 mp3')
    return path

def transcribe(mp3_path, model_size='small'):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        log('[skip] faster-whisper 未安裝，跳過轉錄')
        return None, None
    log(f'[whisper] 載入模型 {model_size} (CPU int8)…')
    os.environ.setdefault('HF_HUB_DISABLE_SYMLINKS_WARNING', '1')
    model = WhisperModel(model_size, device='cpu', compute_type='int8')
    # language=None → 自動偵測 (中文/英文影片都適用)
    segments, info = model.transcribe(mp3_path, language=None, vad_filter=True)
    log(f'  偵測語言: {info.language} ({info.language_probability:.0%})')
    lines = []
    for seg in segments:
        ts = int(seg.start)
        lines.append(f'[{ts//60:02d}:{ts%60:02d}] {seg.text.strip()}')
    return '\n'.join(lines), f'faster-whisper/{model_size} ({info.language})'

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    flags = [a for a in sys.argv[1:] if a.startswith('--')]
    if not args:
        log('用法: python yt_fetch.py <youtube_url> [out_dir] [--no-transcribe] [--model small]')
        sys.exit(1)
    url = args[0]
    out_dir = args[1] if len(args) > 1 else os.path.join(os.getcwd(), 'yt_download')
    do_tx = '--no-transcribe' not in flags
    model_size = 'small'
    for f in flags:
        if f.startswith('--model'):
            model_size = f.split('=')[-1] if '=' in f else 'small'

    log(f'[1/3] 抓 metadata: {url}')
    meta = fetch_meta(url)
    log(f'  「{meta["title"]}」 {meta["duration_sec"]}s by {meta["uploader"]}')

    log('[2/3] 下載音訊 (mp3)…')
    mp3 = download_audio(url, out_dir)
    size_mb = os.path.getsize(mp3) / 1024 / 1024
    log(f'  → {mp3} ({size_mb:.1f} MB)')

    transcript, by = (None, None)
    if do_tx:
        log('[3/3] 轉錄 (中文)… 長片需數分鐘')
        transcript, by = transcribe(mp3, model_size)
        if transcript:
            log(f'  轉錄完成 ({len(transcript)} 字)')
    else:
        log('[3/3] 略過轉錄 (--no-transcribe)')

    result = {
        'title': meta['title'],
        'url': meta['url'],
        'uploader': meta['uploader'],
        'duration_sec': meta['duration_sec'],
        'description': meta['description'],
        'mp3_path': mp3,
        'mp3_mb': round(size_mb, 1),
        'transcript': transcript,
        'transcribed_by': by,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
