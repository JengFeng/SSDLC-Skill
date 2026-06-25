"""mem_viewer.py — 全域 Web viewer for ALL handover.db across projects
單例跑在 localhost:37777，自動掃描所有 .handover/handover.db、頂部下拉切換專案。

啟動：
    python tools/mem_viewer.py

UI 框架：Bootstrap 5 + Bootstrap Icons (CDN)
主題：functional-neutral（白底、極細邊框、留白為主）
"""
from __future__ import annotations

import json
import os
import re
import sqlite3
import sys
from datetime import datetime, timedelta
from pathlib import Path

try:
    from flask import Flask, request, jsonify, render_template_string, redirect, url_for, abort
except ImportError:
    print("缺 flask，先 pip install flask")
    sys.exit(1)


# ===== Config =====
PORT = int(os.environ.get("MEM_VIEWER_PORT", "37777"))
ROOTS_CONFIG = Path.home() / ".handover_roots.txt"
DEFAULT_ROOTS_FALLBACK = [
    r"C:\Users\benso\Desktop\CLAUDE COWORK\PROJECTS",
    r"C:\github",
]


def load_roots() -> list[str]:
    """讀 ~/.handover_roots.txt；沒有/讀失敗就 fallback 到預設"""
    if ROOTS_CONFIG.exists():
        try:
            lines = ROOTS_CONFIG.read_text(encoding='utf-8').splitlines()
            roots = [ln.strip() for ln in lines if ln.strip() and not ln.strip().startswith('#')]
            if roots:
                return roots
        except Exception as e:
            print(f"  [warn] 讀 {ROOTS_CONFIG} 失敗：{e}，用預設")
    return DEFAULT_ROOTS_FALLBACK


DEFAULT_ROOTS = load_roots()


def discover_projects() -> dict[str, Path]:
    """掃所有 .handover/handover.db 並回傳 {project_name: db_path}"""
    found = {}
    for root in DEFAULT_ROOTS:
        rp = Path(root)
        if not rp.exists():
            continue
        for sub in rp.iterdir():
            if not sub.is_dir():
                continue
            cand = sub / ".handover" / "handover.db"
            if cand.exists():
                found[sub.name] = cand
    return dict(sorted(found.items()))


def detect_default_project(projects: dict) -> str | None:
    """預設選哪個專案：優先 CWD 所在的，否則第一個找到的"""
    cwd = Path.cwd().resolve()
    for d in [cwd, *cwd.parents]:
        for name, dbp in projects.items():
            if dbp.parent.parent == d:
                return name
    return next(iter(projects)) if projects else None


PROJECTS = discover_projects()
DEFAULT_PROJECT = detect_default_project(PROJECTS)
app = Flask(__name__)


def get_current_project() -> str | None:
    """從 query param 抓專案、沒給就用預設"""
    p = request.args.get("project")
    if p and p in PROJECTS:
        return p
    return DEFAULT_PROJECT


def conn_for(project: str | None, read_only=True):
    if not project or project not in PROJECTS:
        return None
    db = PROJECTS[project]
    if read_only:
        c = sqlite3.connect(f"file:{db}?mode=ro", uri=True, timeout=2)
    else:
        c = sqlite3.connect(db, timeout=2)
    c.row_factory = sqlite3.Row
    return c


# ===== Search helper =====
def has_fts(c) -> bool:
    try:
        c.execute("SELECT 1 FROM handover_fts LIMIT 1")
        return True
    except sqlite3.OperationalError:
        return False


def search_handover(c, query: str, ftypes: list[str], statuses: list[str],
                    recent_days: int | None, limit: int, offset: int = 0) -> tuple[list[dict], int]:
    """回傳 (rows, total_count)。"""
    chinese_run = max((len(m.group()) for m in re.finditer(r'[一-鿿]+', query)), default=0)
    ascii_run   = max((len(m.group()) for m in re.finditer(r'[A-Za-z0-9_@\-\.]+', query)), default=0)
    use_fts = has_fts(c) and (chinese_run >= 3 or ascii_run >= 3)

    where_extra, params_extra = [], []
    if ftypes:
        where_extra.append(f"h.session_type IN ({','.join(['?']*len(ftypes))})")
        params_extra.extend(ftypes)
    if statuses:
        where_extra.append(f"h.status IN ({','.join(['?']*len(statuses))})")
        params_extra.extend(statuses)
    if recent_days:
        thr = (datetime.now() - timedelta(days=recent_days)).strftime('%Y-%m-%d %H:%M:%S')
        where_extra.append("COALESCE(h.updated_at, h.created_at) >= ?")
        params_extra.append(thr)
    extra = (" AND " + " AND ".join(where_extra)) if where_extra else ""

    rows: dict[int, dict] = {}
    total = 0
    if query and use_fts:
        try:
            safe = query.replace('"', '""')
            count_sql = f"""
                SELECT COUNT(*) FROM handover_fts f JOIN handover h ON h.id = f.rowid
                WHERE handover_fts MATCH ? {extra}
            """
            total = c.execute(count_sql, [f'"{safe}"', *params_extra]).fetchone()[0]
            sql = f"""
                SELECT h.*, rank AS score, 'fts' AS via
                FROM handover_fts f JOIN handover h ON h.id = f.rowid
                WHERE handover_fts MATCH ? {extra}
                ORDER BY rank LIMIT ? OFFSET ?
            """
            for r in c.execute(sql, [f'"{safe}"', *params_extra, limit, offset]):
                rows[r['id']] = dict(r)
        except sqlite3.OperationalError:
            pass
    if query and (not rows or chinese_run < 3):
        pat = '%' + query.replace('%', r'\%').replace('_', r'\_') + '%'
        like_where = """(h.topic LIKE ? ESCAPE '\\' OR h.completed LIKE ? ESCAPE '\\' OR
                        h.decisions LIKE ? ESCAPE '\\' OR h.blocked LIKE ? ESCAPE '\\' OR
                        h.next_steps LIKE ? ESCAPE '\\' OR h.lessons_learned LIKE ? ESCAPE '\\' OR
                        h.conversation_summary LIKE ? ESCAPE '\\')"""
        if not use_fts:
            total = c.execute(f"SELECT COUNT(*) FROM handover h WHERE {like_where} {extra}",
                              [pat]*7 + params_extra).fetchone()[0]
        sql = f"""
            SELECT h.*, 0.0 AS score, 'like' AS via
            FROM handover h
            WHERE {like_where} {extra}
            ORDER BY h.updated_at DESC LIMIT ? OFFSET ?
        """
        for r in c.execute(sql, [pat]*7 + params_extra + [limit, offset]):
            if r['id'] not in rows:
                rows[r['id']] = dict(r)
    if not query:
        total = c.execute(f"SELECT COUNT(*) FROM handover h WHERE 1=1 {extra}", params_extra).fetchone()[0]
        sql = f"""
            SELECT h.*, 0.0 AS score, 'all' AS via FROM handover h
            WHERE 1=1 {extra}
            ORDER BY h.updated_at DESC LIMIT ? OFFSET ?
        """
        for r in c.execute(sql, [*params_extra, limit, offset]):
            rows[r['id']] = dict(r)
    return list(rows.values()), total


# ===== Layout =====
LAYOUT = r"""
<!doctype html>
<html lang="zh-Hant" data-bs-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ title }} — Handover Memory</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
<style>
  :root {
    --bs-neutral-bg: #ffffff;
    --bs-neutral-bg-rgb: 255, 255, 255;
    --bs-neutral-surface: #f9fafb;
    --bs-neutral-border: #e5e7eb;
    --bs-neutral-border-strong: #d1d5db;
    --bs-neutral-muted: #9ca3af;
    --bs-neutral-secondary: #6b7280;
    --bs-neutral-primary: #111827;
    --bs-neutral-accent: #2563eb;
    --bs-neutral-accent-rgb: 37, 99, 235;
    --bs-neutral-accent-subtle: #eff6ff;
    --bs-neutral-accent-2: #7c3aed;
    --bs-neutral-warn: #f59e0b;
    --bs-neutral-warn-subtle: #fef3c7;
    --bs-neutral-danger: #dc2626;
    --bs-neutral-success: #16a34a;
    --bs-body-bg: var(--bs-neutral-bg);
    --bs-body-color: var(--bs-neutral-primary);
    --bs-border-color: var(--bs-neutral-border);
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft JhengHei", "PingFang TC", system-ui, sans-serif;
    color: var(--bs-neutral-primary);
    background: var(--bs-neutral-surface);
  }
  .navbar-neutral {
    background: rgba(var(--bs-neutral-bg-rgb), 0.92);
    backdrop-filter: saturate(180%) blur(20px);
    border-bottom: 0.5px solid var(--bs-neutral-border);
  }
  .nav-tab-neutral {
    color: var(--bs-neutral-secondary);
    text-decoration: none;
    padding: 0.375rem 0.875rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    transition: all .15s;
    font-weight: 500;
  }
  .nav-tab-neutral:hover { background: var(--bs-neutral-surface); color: var(--bs-neutral-primary); }
  .nav-tab-neutral.active { background: var(--bs-neutral-primary); color: #fff; }
  .card-neutral {
    background: var(--bs-neutral-bg);
    border: 0.5px solid var(--bs-neutral-border);
    border-radius: 0.875rem;
  }
  .stat-mini { padding: 1.25rem; text-align: center; }
  .stat-mini .stat-num { font-size: 1.875rem; font-weight: 600; color: var(--bs-neutral-primary); line-height: 1; }
  .stat-mini .stat-lbl { font-size: 0.75rem; color: var(--bs-neutral-muted); margin-top: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .row-link { cursor: pointer; transition: background .12s; }
  .row-link:hover { background: var(--bs-neutral-surface) !important; }
  .type-badge {
    font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 0.4rem; text-transform: uppercase;
    letter-spacing: 0.04em; font-weight: 500; display: inline-block;
  }
  .type-knowledge { background: #dbeafe; color: #1e40af; }
  .type-incident  { background: #fee2e2; color: #991b1b; }
  .type-decision  { background: #ede9fe; color: #5b21b6; }
  .type-blocker   { background: #ffedd5; color: #9a3412; }
  .type-commitment{ background: #d1fae5; color: #065f46; }
  .type-completed { background: #e5e7eb; color: #374151; }
  .type-credential{ background: #fce7f3; color: #9d174d; }
  .type-workflow  { background: #fef9c3; color: #854d0e; }
  .type-document  { background: #cffafe; color: #155e75; }
  .type-sdd       { background: #ede9fe; color: #5b21b6; }
  .type-debug     { background: #fee2e2; color: #991b1b; }
  .type-discussion{ background: #f3f4f6; color: #4b5563; }
  .type-admin     { background: #f3f4f6; color: #4b5563; }
  .status-badge {
    font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 0.4rem;
    font-weight: 500; display: inline-block;
  }
  .status-open    { background: #d1fae5; color: #065f46; }
  .status-closed  { background: #e5e7eb; color: #374151; }
  .status-archived{ background: #f3f4f6; color: #6b7280; }
  code.gray-mono {
    font-family: ui-monospace, "SF Mono", Consolas, monospace;
    font-size: 0.75rem; color: var(--bs-neutral-muted);
    background: var(--bs-neutral-surface); padding: 0.1rem 0.4rem; border-radius: 0.25rem;
  }
  .modal-content { border-radius: 1rem; border: 0.5px solid var(--bs-neutral-border); }
  .empty-state { padding: 3rem; text-align: center; color: var(--bs-neutral-muted); }
  .table-neutral th { font-weight: 600; color: var(--bs-neutral-secondary); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 0.5px solid var(--bs-neutral-border); }
  .table-neutral td { vertical-align: middle; border-bottom: 0.5px solid var(--bs-neutral-border); font-size: 0.875rem; }
  .table-neutral tbody tr:last-child td { border-bottom: 0; }
</style>
</head>
<body>

<nav class="navbar navbar-neutral sticky-top px-3 py-2">
  <div class="container-fluid d-flex align-items-center gap-3 flex-wrap">
    <a class="navbar-brand fw-semibold mb-0 d-flex align-items-center gap-2" href="/?project={{ project|urlencode }}">
      <i class="bi bi-folder2-open text-primary"></i>
      Handover Memory
    </a>

    <div class="dropdown">
      <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
        <i class="bi bi-collection me-1"></i>{{ project or '— 無專案 —' }}
      </button>
      <ul class="dropdown-menu">
        {% for p in projects %}
        <li><a class="dropdown-item {{ 'active' if p == project else '' }}" href="?project={{ p|urlencode }}">{{ p }}</a></li>
        {% endfor %}
      </ul>
    </div>

    <div class="d-none d-md-flex gap-1 ms-auto">
      <a href="/?project={{ project|urlencode }}"          class="nav-tab-neutral {{ 'active' if active=='index' else '' }}">總覽</a>
      <a href="/projects?project={{ project|urlencode }}"  class="nav-tab-neutral {{ 'active' if active=='projects' else '' }}">跨專案</a>
      <a href="/digests?project={{ project|urlencode }}"   class="nav-tab-neutral {{ 'active' if active=='digests' else '' }}">月度 Digest</a>
      <a href="/sync?project={{ project|urlencode }}"      class="nav-tab-neutral {{ 'active' if active=='sync' else '' }}">同步狀態</a>
      <a href="/file-activity?project={{ project|urlencode }}" class="nav-tab-neutral {{ 'active' if active=='fa' else '' }}">文件活動</a>
      <a href="/settings?project={{ project|urlencode }}"  class="nav-tab-neutral {{ 'active' if active=='settings' else '' }}">⚙️ 設定</a>
    </div>
  </div>
</nav>

<main class="container-fluid py-4 px-md-5">
  {{ body|safe }}
</main>

<div class="modal fade" id="rowModal" tabindex="-1">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content" id="modalContent"></div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
const PROJECT = {{ project|tojson }};

const TYPE_LABEL = {sdd:'規格設計', debug:'除錯', discussion:'討論', admin:'雜務',
  incident:'事件', decision:'決策', credential:'帳密', commitment:'承諾',
  blocker:'卡點', completed:'完成', knowledge:'知識', workflow:'流程', document:'文件'};
const STATUS_LABEL = {open:'進行中', closed:'已關閉', archived:'封存'};

async function openRow(id) {
  const r = await fetch('/api/row/' + id + '?project=' + encodeURIComponent(PROJECT));
  const data = await r.json();
  if (!data.id) return alert('找不到 row');
  const types = Object.keys(TYPE_LABEL);
  const statuses = Object.keys(STATUS_LABEL);
  const html = `
    <div class="modal-header">
      <h5 class="modal-title">#${data.id} 編輯 row</h5>
      <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3"><label class="form-label small text-secondary text-uppercase">topic</label>
        <input id="f-topic" class="form-control" value="${esc(data.topic||'')}"></div>
      <div class="row mb-3 g-2">
        <div class="col-md-4"><label class="form-label small text-secondary text-uppercase">type</label>
          <select id="f-session_type" class="form-select form-select-sm">${types.map(t=>`<option value="${t}" ${t===data.session_type?'selected':''}>${TYPE_LABEL[t]} ${t}</option>`).join('')}</select></div>
        <div class="col-md-4"><label class="form-label small text-secondary text-uppercase">status</label>
          <select id="f-status" class="form-select form-select-sm">${statuses.map(s=>`<option value="${s}" ${s===data.status?'selected':''}>${STATUS_LABEL[s]} ${s}</option>`).join('')}</select></div>
        <div class="col-md-4"><label class="form-label small text-secondary text-uppercase">priority</label>
          <input id="f-priority" class="form-control form-control-sm" value="${esc(data.priority||'')}"></div>
      </div>
      <div class="mb-2"><label class="form-label small text-secondary text-uppercase">completed</label>
        <textarea id="f-completed" class="form-control" rows="3">${esc(data.completed||'')}</textarea></div>
      <div class="mb-2"><label class="form-label small text-secondary text-uppercase">decisions</label>
        <textarea id="f-decisions" class="form-control" rows="2">${esc(data.decisions||'')}</textarea></div>
      <div class="mb-2"><label class="form-label small text-secondary text-uppercase">blocked</label>
        <textarea id="f-blocked" class="form-control" rows="2">${esc(data.blocked||'')}</textarea></div>
      <div class="mb-2"><label class="form-label small text-secondary text-uppercase">next_steps</label>
        <textarea id="f-next_steps" class="form-control" rows="2">${esc(data.next_steps||'')}</textarea></div>
      <div class="mb-2"><label class="form-label small text-secondary text-uppercase">lessons_learned</label>
        <textarea id="f-lessons_learned" class="form-control" rows="2">${esc(data.lessons_learned||'')}</textarea></div>
      <div class="row mb-2 g-2">
        <div class="col-md-6"><label class="form-label small text-secondary text-uppercase">due_date</label>
          <input id="f-due_date" class="form-control form-control-sm" value="${esc(data.due_date||'')}"></div>
        <div class="col-md-6"><label class="form-label small text-secondary text-uppercase">last_reviewed_at</label>
          <input id="f-last_reviewed_at" class="form-control form-control-sm" value="${esc(data.last_reviewed_at||'')}"></div>
      </div>
      <div class="text-muted small">created: ${data.created_at} · updated: ${data.updated_at}</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">取消</button>
      <button class="btn btn-sm btn-outline-secondary" onclick="markReviewed(${data.id})">標 reviewed</button>
      <button class="btn btn-sm btn-outline-warning" onclick="archiveRow(${data.id})">archive</button>
      <button class="btn btn-sm btn-primary" onclick="saveRow(${data.id})">儲存</button>
    </div>`;
  document.getElementById('modalContent').innerHTML = html;
  new bootstrap.Modal(document.getElementById('rowModal')).show();
}
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

async function saveRow(id) {
  const fields = ['topic','session_type','status','priority','completed','decisions','blocked','next_steps','lessons_learned','due_date','last_reviewed_at'];
  const body = {};
  for (const f of fields) body[f] = document.getElementById('f-'+f).value;
  const r = await fetch('/api/row/' + id + '?project=' + encodeURIComponent(PROJECT), {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
  const data = await r.json();
  if (data.ok) { bootstrap.Modal.getInstance(document.getElementById('rowModal')).hide(); location.reload(); }
  else alert('save failed: ' + JSON.stringify(data));
}
async function markReviewed(id) {
  await fetch('/api/row/'+id+'/review?project=' + encodeURIComponent(PROJECT), {method:'POST'});
  location.reload();
}
async function archiveRow(id) {
  if (!confirm('Archive #' + id + '?')) return;
  await fetch('/api/row/'+id+'/archive?project=' + encodeURIComponent(PROJECT), {method:'POST'});
  location.reload();
}
</script>
</body>
</html>
"""


def render(body, **ctx):
    return render_template_string(LAYOUT,
        body=body,
        projects=list(PROJECTS.keys()),
        project=ctx.get('project') or get_current_project(),
        active=ctx.get('active', ''),
        title=ctx.get('title', 'Handover Memory'),
    )


def escape_html(s):
    return (str(s or '').replace('&','&amp;').replace('<','&lt;')
            .replace('>','&gt;').replace('"','&quot;'))


TYPE_LABELS = {
    # Mode A
    'sdd':         '規格設計',
    'debug':       '除錯',
    'discussion':  '討論',
    'admin':       '雜務',
    # Mode B
    'incident':    '事件',
    'decision':    '決策',
    'credential':  '帳密',
    'commitment':  '承諾',
    'blocker':     '卡點',
    'completed':   '完成',
    'knowledge':   '知識',
    'workflow':    '流程',
    'document':    '文件',
}

STATUS_LABELS = {
    'open':     '進行中',
    'closed':   '已關閉',
    'archived': '封存',
}

TYPE_DESC = {
    'sdd':        '寫 spec、做 SA/SD、討論架構',
    'debug':      '追 bug、stack trace、反覆試',
    'discussion': '純對話、無 code',
    'admin':      '設定、配置、瑣事',
    'incident':   '發生什麼、怎麼處理',
    'decision':   '選了什麼、為什麼',
    'credential': '主機、VPN、各種 key',
    'commitment': '誰答應幾號交什麼',
    'blocker':    '哪裡卡住、在等誰',
    'completed':  '做完的里程碑',
    'knowledge':  '團隊 know-how、規格細節',
    'workflow':   'SOP、定期事項',
    'document':   '關鍵交付物',
}


def render_row_list_html(rows):
    if not rows:
        return '<div class="card-neutral empty-state">沒有 row</div>'
    out = ['<div class="card-neutral table-responsive"><table class="table table-neutral mb-0">']
    out.append('<thead><tr><th class="ps-3">#</th><th>類型</th><th>狀態</th><th>topic</th><th>更新</th><th class="pe-3">via</th></tr></thead><tbody>')
    for r in rows:
        topic = r.get('topic') or ''
        type_ = r.get('session_type') or 'unknown'
        status = r.get('status') or 'open'
        type_label = TYPE_LABELS.get(type_, type_)
        type_desc = TYPE_DESC.get(type_, '')
        status_label = STATUS_LABELS.get(status, status)
        date = (r.get('updated_at') or '')[:10]
        via = r.get('via') or ''
        out.append(f'''
        <tr class="row-link" onclick="openRow({r['id']})">
          <td class="ps-3"><code class="gray-mono">#{r['id']}</code></td>
          <td><span class="type-badge type-{type_}" title="{type_} — {type_desc}">{type_label}</span></td>
          <td><span class="status-badge status-{status}" title="{status}">{status_label}</span></td>
          <td>{escape_html(topic)}</td>
          <td><span class="text-muted small">{date}</span></td>
          <td class="pe-3"><code class="gray-mono">{via}</code></td>
        </tr>''')
    out.append('</tbody></table></div>')
    return ''.join(out)


# ===== Routes =====
@app.route('/')
def index():
    project = get_current_project()
    if not project:
        body = '<div class="card-neutral empty-state"><i class="bi bi-folder-x" style="font-size:2rem;"></i><p class="mt-2">沒有找到任何 .handover/handover.db。</p></div>'
        return render(body, active='index', title='— 無專案 —', project=None)
    c = conn_for(project)
    total = c.execute("SELECT COUNT(*) FROM handover").fetchone()[0]
    open_n = c.execute("SELECT COUNT(*) FROM handover WHERE status='open'").fetchone()[0]
    by_type = list(c.execute("SELECT session_type, COUNT(*) n FROM handover GROUP BY session_type ORDER BY n DESC"))
    try:
        stale = c.execute("""
            SELECT COUNT(*) FROM handover
            WHERE status='open' AND COALESCE(last_reviewed_at, updated_at) < datetime('now','-90 days')
        """).fetchone()[0]
    except sqlite3.OperationalError:
        # 舊 DB 沒 last_reviewed_at column
        stale = c.execute("""
            SELECT COUNT(*) FROM handover
            WHERE status='open' AND updated_at < datetime('now','-90 days')
        """).fetchone()[0]
    try: cache_n = c.execute("SELECT COUNT(*) FROM chat_msg_cache WHERE extracted_to_handover=0").fetchone()[0]
    except: cache_n = 0
    try: fa_n = c.execute("SELECT COUNT(*) FROM file_activity WHERE ts >= datetime('now','-30 days')").fetchone()[0]
    except: fa_n = 0

    q = request.args.get('q', '').strip()
    type_f = request.args.get('type', '').strip()
    status_f = request.args.get('status', '').strip()
    try: limit = max(10, min(500, int(request.args.get('limit', '50'))))
    except: limit = 50
    try: page = max(1, int(request.args.get('page', '1')))
    except: page = 1
    offset = (page - 1) * limit

    rows, total_rows = search_handover(c, q,
        [type_f] if type_f else [],
        [status_f] if status_f else [],
        None, limit, offset)
    total_pages = max(1, (total_rows + limit - 1) // limit)

    type_options = ''.join(
        f'<option value="{t[0]}" {"selected" if type_f==t[0] else ""}>{TYPE_LABELS.get(t[0], t[0])} {t[0]} ({t[1]})</option>'
        for t in by_type if t[0]
    )

    body = f'''
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-2"><div class="card-neutral stat-mini"><div class="stat-num">{total}</div><div class="stat-lbl">總筆數</div></div></div>
      <div class="col-6 col-md-2"><div class="card-neutral stat-mini"><div class="stat-num text-success">{open_n}</div><div class="stat-lbl">Open</div></div></div>
      <div class="col-6 col-md-2"><div class="card-neutral stat-mini"><div class="stat-num text-warning">{stale}</div><div class="stat-lbl">90+ 天 stale</div></div></div>
      <div class="col-6 col-md-3"><div class="card-neutral stat-mini"><div class="stat-num text-primary">{cache_n}</div><div class="stat-lbl">LINE 待提取</div></div></div>
      <div class="col-6 col-md-3"><div class="card-neutral stat-mini"><div class="stat-num">{fa_n}</div><div class="stat-lbl">30 天文件活動</div></div></div>
    </div>

    <form method="get" class="card-neutral p-3 mb-3">
      <input type="hidden" name="project" value="{escape_html(project)}">
      <div class="row g-2 align-items-center">
        <div class="col-md"><input type="text" name="q" class="form-control form-control-sm" placeholder="搜尋（中文 ≥3 字走 FTS5、否則 LIKE）" value="{escape_html(q)}"></div>
        <div class="col-md-2"><select name="type" class="form-select form-select-sm"><option value="">所有 type</option>{type_options}</select></div>
        <div class="col-md-2"><select name="status" class="form-select form-select-sm">
          <option value="">所有 status</option>
          <option value="open" {"selected" if status_f=='open' else ''}>進行中 open</option>
          <option value="closed" {"selected" if status_f=='closed' else ''}>已關閉 closed</option>
          <option value="archived" {"selected" if status_f=='archived' else ''}>封存 archived</option></select></div>
        <div class="col-md-auto"><button class="btn btn-sm btn-primary"><i class="bi bi-search"></i> 搜尋</button></div>
      </div>
    </form>
    '''

    # 分頁 query string（保留 q / type / status / limit）
    from urllib.parse import urlencode
    def _page_url(p):
        qs = {'project': project, 'q': q, 'type': type_f, 'status': status_f, 'limit': limit, 'page': p}
        return '/?' + urlencode({k: v for k, v in qs.items() if v not in (None, '')})

    # 視窗化頁碼（最多 7 個）
    pager_html = ''
    if total_pages > 1:
        win_start = max(1, page - 3)
        win_end = min(total_pages, win_start + 6)
        win_start = max(1, win_end - 6)
        items = []
        items.append(f'<li class="page-item {"disabled" if page<=1 else ""}"><a class="page-link" href="{_page_url(page-1)}">«</a></li>')
        if win_start > 1:
            items.append(f'<li class="page-item"><a class="page-link" href="{_page_url(1)}">1</a></li>')
            if win_start > 2:
                items.append('<li class="page-item disabled"><span class="page-link">…</span></li>')
        for p in range(win_start, win_end + 1):
            items.append(f'<li class="page-item {"active" if p==page else ""}"><a class="page-link" href="{_page_url(p)}">{p}</a></li>')
        if win_end < total_pages:
            if win_end < total_pages - 1:
                items.append('<li class="page-item disabled"><span class="page-link">…</span></li>')
            items.append(f'<li class="page-item"><a class="page-link" href="{_page_url(total_pages)}">{total_pages}</a></li>')
        items.append(f'<li class="page-item {"disabled" if page>=total_pages else ""}"><a class="page-link" href="{_page_url(page+1)}">»</a></li>')
        pager_html = f'<nav><ul class="pagination pagination-sm justify-content-center mb-0">{"".join(items)}</ul></nav>'

    show_from = offset + 1 if rows else 0
    show_to = offset + len(rows)
    header_label = ("搜尋結果" if (q or type_f or status_f) else "全部")
    header_count = f"{header_label}：共 {total_rows} 筆 · 顯示 {show_from}–{show_to}（每頁 {limit}）"

    body = body + f'''
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="mb-0 text-secondary">{header_count}</h6>
      <form method="get" class="d-flex gap-2 align-items-center m-0">
        <input type="hidden" name="project" value="{escape_html(project)}">
        <input type="hidden" name="q" value="{escape_html(q)}">
        <input type="hidden" name="type" value="{escape_html(type_f)}">
        <input type="hidden" name="status" value="{escape_html(status_f)}">
        <label class="text-muted small mb-0">每頁</label>
        <select name="limit" class="form-select form-select-sm" style="width:auto" onchange="this.form.submit()">
          {''.join(f'<option value="{n}" {"selected" if limit==n else ""}>{n}</option>' for n in [25,50,100,200,500])}
        </select>
      </form>
    </div>
    {render_row_list_html(rows)}
    <div class="mt-3">{pager_html}</div>
    '''
    c.close()
    return render(body, active='index', title=project, project=project)


@app.route('/api/row/<int:rid>')
def api_get_row(rid):
    project = get_current_project()
    c = conn_for(project)
    if not c: return jsonify({})
    r = c.execute("SELECT * FROM handover WHERE id=?", (rid,)).fetchone()
    c.close()
    return jsonify(dict(r) if r else {})


@app.route('/api/row/<int:rid>', methods=['POST'])
def api_update_row(rid):
    project = get_current_project()
    if not project: return jsonify({"ok": False, "error": "no project"})
    data = request.get_json() or {}
    allowed = ['topic','session_type','status','priority','completed','decisions','blocked',
               'next_steps','lessons_learned','due_date','last_reviewed_at']
    sets, vals = [], []
    for k in allowed:
        if k in data:
            sets.append(f"{k} = ?")
            vals.append(data[k] or None)
    if not sets:
        return jsonify({"ok": False, "error": "no fields"})
    sets.append("updated_at = ?")
    vals.append(datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    vals.append(rid)
    c = conn_for(project, read_only=False)
    c.execute(f"UPDATE handover SET {','.join(sets)} WHERE id=?", vals)
    c.commit(); c.close()
    return jsonify({"ok": True})


@app.route('/api/row/<int:rid>/review', methods=['POST'])
def api_mark_reviewed(rid):
    project = get_current_project()
    if not project: return jsonify({"ok": False})
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    c = conn_for(project, read_only=False)
    c.execute("UPDATE handover SET last_reviewed_at=?, updated_at=? WHERE id=?", (now, now, rid))
    c.commit(); c.close()
    return jsonify({"ok": True})


@app.route('/api/row/<int:rid>/archive', methods=['POST'])
def api_archive(rid):
    project = get_current_project()
    if not project: return jsonify({"ok": False})
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    c = conn_for(project, read_only=False)
    c.execute("UPDATE handover SET status='archived', updated_at=? WHERE id=?", (now, rid))
    c.commit(); c.close()
    return jsonify({"ok": True})


@app.route('/projects')
def projects_page():
    cur = get_current_project()
    q = request.args.get('q', '').strip()
    cards = []
    for proj_name, db_path in PROJECTS.items():
        try:
            c = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True, timeout=2)
            c.row_factory = sqlite3.Row
            n = c.execute("SELECT COUNT(*) FROM handover").fetchone()[0]
            recent = c.execute("SELECT MAX(updated_at) FROM handover").fetchone()[0]
            results = search_handover(c, q, [], [], None, 5)[0] if q else []
            c.close()
        except Exception as e:
            n, recent, results = '?', '?', []

        active_class = 'border-primary' if proj_name == cur else ''
        cards.append(f'''
        <div class="card-neutral p-3 mb-3 {active_class}">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h5 class="mb-0">{escape_html(proj_name)} {'<span class="badge bg-primary ms-1">當前</span>' if proj_name == cur else ''}</h5>
              <code class="gray-mono">{escape_html(str(db_path))}</code>
            </div>
            <a href="?project={escape_html(proj_name)}" class="btn btn-sm btn-outline-secondary">切到此專案</a>
          </div>
          <div class="text-muted small mb-2">{n} rows · 最後活動 {(recent or '')[:10]}</div>
          {render_row_list_html(results) if results else ''}
        </div>''')

    # 根目錄管理 UI
    saved_root_msg = ''
    if request.args.get('roots_saved'):
        saved_root_msg = '<div class="alert alert-success py-2 mb-3"><i class="bi bi-check-circle"></i> 根目錄已更新、專案列表已重新掃描</div>'
    if request.args.get('roots_err'):
        saved_root_msg = f'<div class="alert alert-danger py-2 mb-3"><i class="bi bi-exclamation-circle"></i> 錯誤：{escape_html(request.args.get("roots_err"))}</div>'

    roots_html = ''.join(
        f'''<div class="d-flex align-items-center gap-2 mb-1">
              <code class="gray-mono flex-grow-1">{escape_html(r)}</code>
              <form method="post" action="/api/roots/remove" class="m-0">
                <input type="hidden" name="root" value="{escape_html(r)}">
                <input type="hidden" name="back_project" value="{escape_html(cur or '')}">
                <button class="btn btn-sm btn-outline-danger" onclick="return confirm('移除此根目錄？')"><i class="bi bi-trash"></i></button>
              </form>
            </div>'''
        for r in DEFAULT_ROOTS
    )

    roots_card = f'''
    <div class="card-neutral p-3 mb-3">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h6 class="mb-0"><i class="bi bi-folder2-open me-1"></i>掃描根目錄管理</h6>
        <form method="post" action="/api/roots/rescan" class="m-0">
          <input type="hidden" name="back_project" value="{escape_html(cur or '')}">
          <button class="btn btn-sm btn-outline-primary"><i class="bi bi-arrow-clockwise"></i> 重新掃描</button>
        </form>
      </div>
      <p class="text-muted small mb-2">系統會掃描每個根目錄的「直接子資料夾」是否有 <code>.handover/handover.db</code>。新增/移除根目錄會自動重掃；外部新增專案資料夾後可按右上「重新掃描」刷新。</p>
      <div class="mb-2">{roots_html or '<em class="text-muted small">沒有設定任何根目錄</em>'}</div>
      <form method="post" action="/api/roots/add" class="d-flex gap-2">
        <input type="hidden" name="back_project" value="{escape_html(cur or '')}">
        <input type="text" name="root" class="form-control form-control-sm" placeholder="新增根目錄路徑（例：D:\\work）" required>
        <button class="btn btn-sm btn-primary"><i class="bi bi-plus-lg"></i> 新增</button>
      </form>
      <div class="mt-2 text-muted small">設定檔位置：<code class="gray-mono">{escape_html(str(ROOTS_CONFIG))}</code></div>
    </div>
    '''

    body = f'''
    {saved_root_msg}
    {roots_card}
    <form method="get" action="/projects" class="card-neutral p-3 mb-3">
      <input type="hidden" name="project" value="{escape_html(cur or '')}">
      <div class="d-flex gap-2">
        <input type="text" name="q" class="form-control form-control-sm" placeholder="跨所有專案搜尋..." value="{escape_html(q)}">
        <button class="btn btn-sm btn-primary"><i class="bi bi-search"></i> 全部搜尋</button>
      </div>
    </form>
    <h6 class="mb-2 text-secondary">已掃到 {len(PROJECTS)} 個專案：</h6>
    {''.join(cards)}
    '''
    return render(body, active='projects', title='跨專案 — ' + (cur or ''), project=cur)


@app.route('/api/roots/add', methods=['POST'])
def api_roots_add():
    new_root = (request.form.get('root') or '').strip()
    back = request.form.get('back_project', '')
    if not new_root:
        return redirect(url_for('projects_page', project=back, roots_err='請輸入路徑'))
    if not Path(new_root).exists():
        return redirect(url_for('projects_page', project=back, roots_err=f'路徑不存在：{new_root}'))
    # 寫進 ~/.handover_roots.txt
    existing = DEFAULT_ROOTS.copy()
    if new_root in existing:
        return redirect(url_for('projects_page', project=back, roots_err='此根目錄已存在'))
    existing.append(new_root)
    _save_roots(existing)
    _reload_projects()
    return redirect(url_for('projects_page', project=back, roots_saved='1'))


@app.route('/api/roots/remove', methods=['POST'])
def api_roots_remove():
    target = (request.form.get('root') or '').strip()
    back = request.form.get('back_project', '')
    existing = [r for r in DEFAULT_ROOTS if r != target]
    _save_roots(existing)
    _reload_projects()
    return redirect(url_for('projects_page', project=back, roots_saved='1'))


@app.route('/api/roots/rescan', methods=['POST'])
def api_roots_rescan():
    back = request.form.get('back_project', '')
    _reload_projects()
    return redirect(url_for('projects_page', project=back, roots_saved='1'))


def _save_roots(roots: list[str]):
    """寫進 ~/.handover_roots.txt"""
    lines = [
        "# Handover viewer 掃描根目錄設定",
        "# 每行一個路徑，前面 # 開頭為註解",
        "# 修改後 viewer 重新掃描或重啟才會生效",
        "",
    ] + roots
    ROOTS_CONFIG.write_text("\n".join(lines) + "\n", encoding='utf-8')


def _reload_projects():
    """重新讀 roots 檔 + 重掃 projects"""
    global DEFAULT_ROOTS, PROJECTS
    DEFAULT_ROOTS = load_roots()
    PROJECTS = discover_projects()


@app.route('/sync')
def sync_page():
    project = get_current_project()
    if not project:
        return render('<div class="card-neutral empty-state">沒有專案</div>', active='sync', title='同步狀態', project=None)
    c = conn_for(project)
    rows = list(c.execute("SELECT key, value, updated_at FROM sync_state ORDER BY key"))
    c.close()
    body = '<div class="card-neutral table-responsive"><table class="table table-neutral mb-0"><thead><tr><th class="ps-3">Key</th><th>Value</th><th class="pe-3">Updated</th></tr></thead><tbody>'
    for r in rows:
        body += f'<tr><td class="ps-3"><code class="gray-mono">{escape_html(r["key"])}</code></td><td>{escape_html(r["value"])}</td><td class="text-muted small pe-3">{r["updated_at"]}</td></tr>'
    body += '</tbody></table></div>'
    return render(body, active='sync', title='同步狀態 — ' + project, project=project)


@app.route('/digests')
def digests_page():
    project = get_current_project()
    if not project:
        return render('<div class="card-neutral empty-state">沒有專案</div>', active='digests', title='Digest', project=None)
    db_path = PROJECTS[project]
    digest_dir = db_path.parent / 'digests'
    files = sorted(digest_dir.glob('*.md'), reverse=True) if digest_dir.exists() else []
    if not files:
        body = '<div class="card-neutral empty-state">尚無月度 digest。執行 <code>python ~/.claude/skills/handover-skill/tools/monthly_digest.py</code> 產生。</div>'
    else:
        body = '<div class="card-neutral"><div class="list-group list-group-flush">'
        for f in files:
            mtime = datetime.fromtimestamp(f.stat().st_mtime).strftime('%Y-%m-%d')
            body += f'<a href="/digests/{f.stem}?project={escape_html(project)}" class="list-group-item list-group-item-action d-flex justify-content-between"><span><i class="bi bi-file-text me-2"></i>{escape_html(f.stem)}</span><span class="text-muted small">{mtime}</span></a>'
        body += '</div></div>'
    return render(body, active='digests', title='月度 Digest — ' + project, project=project)


@app.route('/digests/<ym>')
def digest_view(ym):
    project = get_current_project()
    if not project: abort(404)
    db_path = PROJECTS[project]
    digest_file = db_path.parent / 'digests' / f'{ym}.md'
    if not digest_file.exists(): abort(404)
    md = digest_file.read_text(encoding='utf-8')
    html_lines = []
    in_ul = False
    for line in md.split('\n'):
        if line.startswith('# '):
            html_lines.append(f'<h1>{escape_html(line[2:])}</h1>')
        elif line.startswith('## '):
            if in_ul: html_lines.append('</ul>'); in_ul = False
            html_lines.append(f'<h3 class="mt-4">{escape_html(line[3:])}</h3>')
        elif line.startswith('- '):
            if not in_ul: html_lines.append('<ul>'); in_ul = True
            content = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', escape_html(line[2:]))
            html_lines.append(f'<li>{content}</li>')
        elif line.startswith('  - '):
            content = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', escape_html(line[4:]))
            html_lines.append(f'<li class="ms-4 text-muted small">↳ {content}</li>')
        elif line.startswith('> '):
            html_lines.append(f'<blockquote class="border-start border-3 ps-3 text-muted my-2">{escape_html(line[2:])}</blockquote>')
        else:
            if in_ul: html_lines.append('</ul>'); in_ul = False
            if line.strip(): html_lines.append(f'<p>{escape_html(line)}</p>')
    if in_ul: html_lines.append('</ul>')
    body = f'<div class="card-neutral p-4">{"".join(html_lines)}</div>'
    return render(body, active='digests', title=ym + ' — ' + project, project=project)


@app.route('/file-activity')
def fa_page():
    project = get_current_project()
    if not project:
        return render('<div class="card-neutral empty-state">沒有專案</div>', active='fa', title='文件活動', project=None)
    c = conn_for(project)
    try:
        rows = list(c.execute("SELECT * FROM file_activity WHERE ts >= datetime('now','-30 days') ORDER BY ts DESC LIMIT 200"))
        by_ext = list(c.execute("SELECT extension, COUNT(*) n FROM file_activity WHERE ts >= datetime('now','-30 days') GROUP BY extension ORDER BY n DESC"))
    except sqlite3.OperationalError:
        rows = []; by_ext = []
    c.close()

    if not rows:
        body = '<div class="card-neutral empty-state">file_activity 表還沒資料 — Edit/Write 文件後 hook 會自動寫入</div>'
    else:
        ext_html = ' / '.join(f'{e["extension"]}×{e["n"]}' for e in by_ext)
        body = f'<div class="card-neutral p-3 mb-3"><strong>30 天內</strong> {len(rows)} 次操作 — <span class="text-muted small">{ext_html}</span></div>'
        body += '<div class="card-neutral table-responsive"><table class="table table-neutral mb-0"><thead><tr><th class="ps-3">#</th><th>tool</th><th>ext</th><th>檔名</th><th>delta</th><th class="pe-3">時間</th></tr></thead><tbody>'
        for r in rows[:100]:
            tool = r['tool']; delta = r['delta'] or 0; sign = '+' if delta >= 0 else ''
            tool_class = 'bg-warning-subtle text-warning-emphasis' if tool == 'Edit' else 'bg-info-subtle text-info-emphasis'
            body += f'''<tr>
              <td class="ps-3"><code class="gray-mono">#{r["id"]}</code></td>
              <td><span class="type-badge {tool_class}">{tool}</span></td>
              <td><code class="gray-mono">{r["extension"]}</code></td>
              <td>{escape_html(r["file_name"])}<div class="text-muted small">{escape_html(r["file_path"])}</div></td>
              <td><span class="text-muted small">{sign}{delta}</span></td>
              <td class="pe-3"><span class="text-muted small">{(r["ts"] or "")[:16]}</span></td></tr>'''
        body += '</tbody></table></div>'
    return render(body, active='fa', title='文件活動 — ' + project, project=project)


@app.route('/settings', methods=['GET', 'POST'])
def settings_page():
    project = get_current_project()
    if not project:
        return render('<div class="card-neutral empty-state">沒有專案</div>', active='settings', title='設定', project=None)
    c = conn_for(project, read_only=False)
    if request.method == 'POST':
        cfg = {
            "enabled": request.form.get('enabled') == 'on',
            "messages_url": (request.form.get('messages_url') or '').strip(),
            "source_label": (request.form.get('source_label') or '').strip() or 'chat',
            "sync_interval_min": int(request.form.get('sync_interval_min') or 30),
            "filter_groups": [g.strip() for g in (request.form.get('filter_groups') or '').split(',') if g.strip()] or None,
            "lookback_days": int(request.form.get('lookback_days') or 7),
        }
        c.execute("""
            INSERT INTO handover_config(key, value, updated_at)
            VALUES('chat_api', ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at
        """, (json.dumps(cfg, ensure_ascii=False),))
        c.commit(); c.close()
        return redirect(url_for('settings_page', project=project, saved='1'))

    row = c.execute("SELECT value FROM handover_config WHERE key='chat_api'").fetchone()
    cfg = json.loads(row[0]) if row and row[0] else {}
    c.close()

    enabled = cfg.get('enabled', False)
    url = cfg.get('messages_url', '')
    label = cfg.get('source_label', 'chat')
    interval = cfg.get('sync_interval_min', 30)
    groups = cfg.get('filter_groups') or []
    groups_str = ','.join(groups) if groups else ''
    lookback = cfg.get('lookback_days', 7)
    saved_msg = '<div class="alert alert-success py-2 mb-3"><i class="bi bi-check-circle"></i> 設定已儲存</div>' if request.args.get('saved') else ''

    body = f'''
    {saved_msg}
    <div class="card-neutral p-4" style="max-width:760px;">
      <h5 class="mb-1">📡 Chat API 設定（此專案 <code class="gray-mono">{escape_html(project)}</code>）</h5>
      <p class="text-muted small mb-4">設定外部聊天訊息來源（如 LINE）。chat_sync.py 會按這份設定每 N 分鐘拉一次訊息進 chat_msg_cache 表。</p>

      <form method="post">
        <input type="hidden" name="project" value="{escape_html(project)}">

        <div class="form-check form-switch mb-3">
          <input class="form-check-input" type="checkbox" name="enabled" id="enabled" {'checked' if enabled else ''}>
          <label class="form-check-label fw-semibold" for="enabled">啟用 chat_sync</label>
          <small class="text-muted ms-2">關閉的話 chat_sync 不會跑、不會污染這個 DB</small>
        </div>

        <div class="mb-3">
          <label class="form-label small text-secondary text-uppercase">messages_url</label>
          <input type="text" name="messages_url" class="form-control" value="{escape_html(url)}" placeholder="https://your-server/api/messages">
          <small class="text-muted">必須回傳 <code>{{data: [...]}}</code> 格式</small>
        </div>

        <div class="row g-2 mb-3">
          <div class="col-md-4"><label class="form-label small text-secondary text-uppercase">source_label</label>
            <input type="text" name="source_label" class="form-control" value="{escape_html(label)}"></div>
          <div class="col-md-4"><label class="form-label small text-secondary text-uppercase">sync 間隔（分）</label>
            <input type="number" name="sync_interval_min" class="form-control" value="{interval}" min="1" max="1440"></div>
          <div class="col-md-4"><label class="form-label small text-secondary text-uppercase">lookback 天</label>
            <input type="number" name="lookback_days" class="form-control" value="{lookback}" min="1" max="365"></div>
        </div>

        <div class="mb-3">
          <label class="form-label small text-secondary text-uppercase">filter_groups（選填）</label>
          <input type="text" name="filter_groups" class="form-control" value="{escape_html(groups_str)}" placeholder="桃園水情,桃園水務局（逗號分隔；留空=全部）">
          <small class="text-muted">只同步這些 source_name 的訊息；留空 = 全部</small>
        </div>

        <button class="btn btn-primary"><i class="bi bi-save"></i> 儲存設定</button>
      </form>

      <hr class="my-4">
      <h6 class="text-secondary">📡 排程任務</h6>
      <p class="text-muted small">改完 sync_interval_min 後要重新註冊 Windows 工作排程器才會生效：</p>
      <pre class="bg-light p-2 rounded small mb-2"><code>cd "{escape_html(str(PROJECTS[project].parent.parent))}"
powershell -ExecutionPolicy Bypass -File "{escape_html(str(Path(__file__).parent / 'install_scheduler.ps1'))}" -Install</code></pre>
    </div>
    '''
    return render(body, active='settings', title='設定 — ' + project, project=project)


@app.template_filter('urlencode')
def urlencode_filter(s):
    from urllib.parse import quote
    return quote(s) if s else ''


if __name__ == '__main__':
    print(f"\n🌐 Mem Viewer (multi-project) on http://localhost:{PORT}")
    print(f"   Found {len(PROJECTS)} projects:")
    for p, db in PROJECTS.items():
        marker = " ⭐" if p == DEFAULT_PROJECT else ""
        print(f"     - {p}{marker} ({db})")
    print(f"\n   Press Ctrl+C to stop\n")
    app.run(host='127.0.0.1', port=PORT, debug=False)
