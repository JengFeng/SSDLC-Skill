"""
proposal-narration / tts.py
============================
TTS provider 統一介面。skill.md 不再內嵌 code，引用此檔即可。

Usage:
    from tts import get_voice, tts, apply_pronunciation_fixes

    voice = get_voice("B")  # Tiffy_TW
    text = apply_pronunciation_fixes(raw_script)
    tts(text, "out.mp3", voice)

Provider 支援：
    - elevenlabs (付費)
    - edge_tts (免費)
    - openai (按字計費)

設定檔來源：
    - voices.yaml             — 聲音清單
    - pronunciation_fixes.yaml — 破音字替換表
"""

import os
import asyncio
import subprocess
from pathlib import Path
import yaml
import requests

# Benson 預設偏好：1.5 倍語速 (可由 voice.speed 或 narration.md Meta 覆蓋)
DEFAULT_SPEED = 1.5

SKILL_DIR = Path(__file__).parent.parent
REFS_DIR = SKILL_DIR / "references"


# ============================================================
# Config loaders
# ============================================================

def _load_yaml(filename: str) -> dict:
    with open(REFS_DIR / filename, encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_voices() -> dict:
    return _load_yaml("voices.yaml")


def load_pronunciation_fixes() -> list:
    cfg = _load_yaml("pronunciation_fixes.yaml")
    return cfg["fixes"]


# ============================================================
# Voice picker
# ============================================================

def get_voice(user_choice: str) -> dict:
    """
    從 voices.yaml 取對應 voice entry。

    Args:
        user_choice: key (A/B/C/...) 或 voice name 部分匹配 (Tiffy / KuoYu)

    Returns:
        voice dict（含 voice_id / provider / model / settings）

    Raises:
        ValueError: 找不到對應聲音
    """
    cfg = load_voices()
    voices = cfg["voices"]

    # 1. 用 key 精確比對
    upper = user_choice.strip().upper()
    for v in voices:
        if v["key"].upper() == upper:
            return v

    # 2. 用 name 模糊比對
    lower = user_choice.strip().lower()
    for v in voices:
        if lower in v["name"].lower():
            return v

    raise ValueError(
        f"找不到聲音 '{user_choice}'。可用選項：\n  "
        + "\n  ".join(f"{v['key']}. {v['name']}" for v in voices)
    )


# ============================================================
# Pronunciation fix
# ============================================================

def apply_pronunciation_fixes(text: str) -> str:
    """套破音字 / 縮寫 / 音譯替換表。TTS 前必過。"""
    fixes = load_pronunciation_fixes()
    for entry in fixes:
        text = text.replace(entry["from"], entry["to"])
    return text


# ============================================================
# TTS dispatcher
# ============================================================

def tts(text: str, out_path: str, voice: dict) -> bool:
    """
    統一介面。按 voice['provider'] 分派到對應實作。
    跑完 provider 後若 voice.speed != 1.0，過一道 ffmpeg atempo 變速不變調。

    Args:
        text: 旁白文字（建議已過 apply_pronunciation_fixes）
        out_path: 輸出 mp3 路徑
        voice: 從 get_voice() 取得的 dict (可含 speed 欄位; 缺則用 DEFAULT_SPEED)

    Returns:
        是否成功
    """
    provider = voice["provider"]
    impls = {
        "elevenlabs": _tts_elevenlabs,
        "edge_tts": _tts_edge,
        "openai": _tts_openai,
    }
    if provider not in impls:
        raise ValueError(f"未知 provider: {provider}")
    if not impls[provider](text, out_path, voice):
        return False

    speed = float(voice.get("speed", DEFAULT_SPEED))
    if abs(speed - 1.0) > 0.01:
        _apply_speed(out_path, speed)
    return True


def _apply_speed(mp3_path: str, speed: float) -> None:
    """用 ffmpeg atempo filter 變速不變調 (pitch 不變, 只改語速)。

    atempo 單次接受 0.5–2.0，超過範圍要鏈式 (1.5 直接走、3.0 = atempo=2,atempo=1.5)。
    """
    chain = []
    s = float(speed)
    while s > 2.0:
        chain.append("atempo=2.0"); s /= 2.0
    while s < 0.5:
        chain.append("atempo=0.5"); s /= 0.5
    chain.append(f"atempo={s:.3f}")
    af = ",".join(chain)

    tmp = mp3_path + ".speed.mp3"
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", mp3_path, "-filter:a", af, "-vn",
             "-codec:a", "libmp3lame", "-q:a", "2", tmp],
            check=True, capture_output=True,
        )
        # Windows Defender 即時掃描會短暫鎖住剛寫出的 mp3、讓 os.replace 失敗
        # → exponential-ish backoff retry，最多 ~10 秒；仍失敗則保留原檔（速度未套）
        import time as _t
        last_err = None
        for i in range(8):
            try:
                os.replace(tmp, mp3_path)
                last_err = None
                break
            except PermissionError as e:
                last_err = e
                _t.sleep(0.5 * (i + 1))
        if last_err is not None:
            print(f"[speed FAIL] os.replace 鎖檔 retry 用盡：{last_err}")
            if os.path.exists(tmp):
                try: os.remove(tmp)
                except OSError: pass
    except subprocess.CalledProcessError as e:
        print(f"[speed FAIL] ffmpeg atempo={af}: {e.stderr.decode('utf-8','replace')[:200]}")
        if os.path.exists(tmp):
            os.remove(tmp)
        # 不 raise — 速度沒套到照樣輸出原檔，影片仍可產出
    except FileNotFoundError:
        print("[speed SKIP] 系統無 ffmpeg，速度未調整")


# ============================================================
# Provider implementations
# ============================================================

def _tts_elevenlabs(text: str, out_path: str, voice: dict) -> bool:
    """ElevenLabs API。需要 ELEVENLABS_API_KEY。"""
    KEY = os.environ.get("ELEVENLABS_API_KEY")
    if not KEY:
        raise RuntimeError("缺少 ELEVENLABS_API_KEY 環境變數")

    H = {"xi-api-key": KEY, "Content-Type": "application/json"}
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice['voice_id']}?output_format=mp3_44100_128"
    body = {
        "text": text,
        "model_id": voice["model"],          # eleven_v3
        "voice_settings": voice["settings"],  # stab/sim/style/boost
        "language_code": "zh",
    }
    r = requests.post(url, headers=H, json=body, timeout=180)
    if r.ok:
        with open(out_path, "wb") as f:
            f.write(r.content)
        return True
    print(f"[ElevenLabs FAIL] {r.status_code}: {r.text[:200]}")
    return False


def _tts_edge(text: str, out_path: str, voice: dict) -> bool:
    """Microsoft Edge TTS。免費、需 `pip install edge-tts`。"""
    import edge_tts

    async def _run():
        c = edge_tts.Communicate(text, voice["voice_id"])
        await c.save(out_path)

    try:
        asyncio.run(_run())
    except Exception as e:
        print(f"[Edge TTS FAIL] {e}")
        return False
    return os.path.exists(out_path)


def _tts_openai(text: str, out_path: str, voice: dict) -> bool:
    """OpenAI TTS。需要 OPENAI_API_KEY。~$0.030/1k chars (tts-1-hd)。"""
    from openai import OpenAI
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    try:
        r = client.audio.speech.create(
            model=voice["model"],     # tts-1-hd
            voice=voice["voice_id"],  # nova / onyx / shimmer / alloy
            input=text,
        )
        r.write_to_file(out_path)
        return True
    except Exception as e:
        print(f"[OpenAI TTS FAIL] {e}")
        return False


# ============================================================
# CLI test entry
# ============================================================

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python tts.py <voice_key_or_name> <text>")
        print("Example: python tts.py B '大家好，我是林秉澄'")
        sys.exit(1)

    voice = get_voice(sys.argv[1])
    text = apply_pronunciation_fixes(" ".join(sys.argv[2:]))
    print(f"Voice: {voice['name']} ({voice['provider']}, {voice['cost']})")
    print(f"Text: {text}")
    out = "test_output.mp3"
    if tts(text, out, voice):
        print(f"✅ Saved: {out}")
    else:
        print("❌ Failed")
