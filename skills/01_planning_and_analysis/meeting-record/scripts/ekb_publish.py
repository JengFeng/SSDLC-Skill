"""
meeting-record / scripts / ekb_publish.py
==========================================
EKB API helper：上傳檔案 + PATCH note 內容 + 軟刪舊版。

Usage:
    from ekb_publish import upload_file, patch_note, soft_delete

Env:
    EKB_TOKEN, EKB_BASE_URL
"""
import os
import json
import requests
from typing import Optional


def _h():
    return {'X-EKB-Token': os.environ['EKB_TOKEN']}


def _hj():
    return {
        'X-EKB-Token': os.environ['EKB_TOKEN'],
        'Content-Type': 'application/json; charset=utf-8',
    }


def _base():
    return os.environ.get('EKB_BASE_URL', 'https://your-server.example.com/EIP/ekb')


def list_projects() -> list:
    """GET /api/projects.php — 回傳可選 EIP 專案清單。"""
    r = requests.get(f"{_base()}/api/projects.php", headers=_h(), timeout=30)
    r.raise_for_status()
    return r.json()['data']['items']


def upload_file(path: str, fixed_name: str, category: str,
                eip_project_id: int) -> int:
    """上傳檔案 + 修正檔名 + 設 category。回傳 file_id。"""
    with open(path, 'rb') as f:
        r = requests.post(
            f"{_base()}/api/files.php",
            headers=_h(),
            files={'file': (os.path.basename(path), f, 'application/octet-stream')},
            data={'eip_project_id': str(eip_project_id)},
            timeout=600,
        )
        r.raise_for_status()
        fid = r.json()['data']['id']

    # PATCH 修正檔名 + category
    patch = {'original_name': fixed_name, 'category': category}
    r2 = requests.patch(
        f"{_base()}/api/files.php?id={fid}",
        headers=_hj(),
        data=json.dumps(patch, ensure_ascii=False).encode('utf-8'),
        timeout=30,
    )
    r2.raise_for_status()
    return fid


def create_note(title: str, content_html: str, eip_project_id: int,
                tags: list, source_ref: Optional[str] = None,
                change_reason: str = "建立會議紀錄") -> int:
    """POST /api/notes.php — 建 note。回傳 note_id。"""
    body = {
        'title': title,
        'content': content_html,
        'eip_project_id': eip_project_id,
        'tags': tags,
        'change_reason': change_reason,
    }
    if source_ref:
        body['source_ref'] = source_ref
    r = requests.post(
        f"{_base()}/api/notes.php",
        headers=_hj(),
        data=json.dumps(body, ensure_ascii=False).encode('utf-8'),
        timeout=60,
    )
    r.raise_for_status()
    return r.json()['data']['id']


def patch_note(note_id: int, content_html: str, change_reason: str,
               tags: Optional[list] = None,
               title: Optional[str] = None) -> dict:
    """PATCH /api/notes.php?id={id} — 更新 note。"""
    body = {'content': content_html, 'change_reason': change_reason}
    if tags is not None:
        body['tags'] = tags
    if title is not None:
        body['title'] = title
    r = requests.patch(
        f"{_base()}/api/notes.php?id={note_id}",
        headers=_hj(),
        data=json.dumps(body, ensure_ascii=False).encode('utf-8'),
        timeout=60,
    )
    r.raise_for_status()
    return r.json()['data']


def attach_file(note_id: int, file_id: int,
                relation: str = 'attachment',
                append_to_content: bool = True) -> dict:
    """POST /api/notes.php?id={id}&op=attach_file。"""
    body = {
        'file_id': file_id,
        'relation': relation,
        'append_to_content': append_to_content,
    }
    r = requests.post(
        f"{_base()}/api/notes.php?id={note_id}&op=attach_file",
        headers=_hj(),
        data=json.dumps(body).encode('utf-8'),
        timeout=30,
    )
    r.raise_for_status()
    return r.json()['data']


def soft_delete(file_id: int) -> None:
    """DELETE /api/files.php?id={id} — 軟刪檔案。"""
    r = requests.delete(
        f"{_base()}/api/files.php?id={file_id}",
        headers=_h(),
        timeout=30,
    )
    r.raise_for_status()


def get_note(note_id: int) -> dict:
    """GET /api/notes.php?id={id}。"""
    r = requests.get(
        f"{_base()}/api/notes.php?id={note_id}",
        headers=_h(),
        timeout=30,
    )
    r.raise_for_status()
    return r.json()['data']


def build_slide_figures_html(uploads: list) -> str:
    """生成 5 張投影片 inline 區塊。
    uploads = [{id, name, caption}, ...]
    """
    html = '\n<hr>\n<h2>📊 會議介紹影片用投影片</h2>\n'
    for u in uploads:
        html += '<figure style="margin:24px 0;">\n'
        html += f'  <img src="api/files.php?id={u["id"]}&download=1&inline=1" '
        html += f'alt="{u["caption"]}" '
        html += 'style="width:100%; max-width:1400px; display:block; margin:0 auto; '
        html += 'border:1px solid #e0e0e0; border-radius:8px;">\n'
        html += f'  <figcaption style="text-align:center; color:#666; '
        html += f'font-size:0.95em; margin-top:8px;">{u["caption"]}</figcaption>\n'
        html += '</figure>\n'
    return html


def build_video_html(preview_id: int, full_id: int,
                     duration_mmss: str, full_size_mb: float,
                     srt_id: Optional[int] = None) -> str:
    """生成影片 inline 播放器 + 下載按鈕區塊。"""
    html = f'\n<hr>\n<h2>🎬 會議介紹影片（旁白 {duration_mmss} / 1.5x）</h2>\n'
    html += '<video controls preload="metadata" '
    html += 'style="width:100%; max-width:960px; display:block; margin:24px auto; '
    html += 'border-radius:8px;">\n'
    html += f'  <source src="api/files.php?id={preview_id}&download=1&inline=1" '
    html += 'type="video/mp4">\n</video>\n'
    html += '<p style="text-align:center; color:#666; font-size:0.9em;">'
    html += '↑ 線上預覽（854p 壓縮版）</p>\n'
    html += '<p style="text-align:center; margin-top:12px;">\n'
    html += f'  <a href="api/files.php?id={full_id}&download=1&attachment=1" '
    html += 'style="display:inline-block; padding:10px 20px; background:#1E3A5F; '
    html += 'color:white; text-decoration:none; border-radius:6px; margin-right:8px;">'
    html += f'⬇ 下載完整版 1080p ({full_size_mb:.0f} MB)</a>\n'
    if srt_id:
        html += f'  <a href="api/files.php?id={srt_id}&download=1&attachment=1" '
        html += 'style="display:inline-block; padding:10px 20px; background:#5B7A99; '
        html += 'color:white; text-decoration:none; border-radius:6px;">'
        html += '⬇ 下載字幕 SRT</a>\n'
    html += '</p>\n'
    return html
