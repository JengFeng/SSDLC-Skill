"""LINE chat_msg_cache 6 步 SOP 掃描器（review skill weekly mode 專用）。

Usage:
    from line_scan import scan
    result = scan(config_path='~/.claude/projects/{slug}/review.yml', days=7)
"""
import os
import re
import sqlite3
import yaml
from datetime import datetime, timedelta
from pathlib import Path

BUSINESS_KEYWORDS = [
    '報價', '估價', '議價', '發包', '招標', '單價', '總價', '概算',
    '人月', '預算', '請購', '訪價', '合約', '驗收金額', '經費',
]
MEETING_INVITE_KEYWORDS = [
    '明天討論', '明天下午', '下午開會', '下午一起', '明天一起',
    '議題', '找時間談', '找個空間', '約一下', '安排會議',
    '一起討論', '會議室', '線上會議',
]
MEETING_RESULT_KEYWORDS = [
    '會議紀錄', '結論', '決議', '會議結束', '會議完', '討論完',
    '結論是', '決定', '達成共識',
]
CUSTOMER_CHASE_KEYWORDS = [
    '對方在問', '客戶催', '再詢問', '等回覆', '沒下文', '催',
    '怎麼還沒', '麻煩盡快', '麻煩確認', '請回覆',
]
BENSON_MENTIONS = ['@Benson', '@秉澄', '@蘇小B']
BENSON_USER_PATTERN = re.compile(r'^(benson|蘇小B|秉澄|林秉澄)$', re.I)
AUTO_PUSH_USER = '桃園水情防災通報'
AUTO_PUSH_UNCLOSED_PATTERN = re.compile(r'未開始[:：]\s*(\d+)\s*個')
DISPATCH_PATTERN = re.compile(r'@\S+\s*(麻煩|請|幫我)')


def _expand(p):
    return os.path.expanduser(p) if p else p


def _connect(db_path):
    p = _expand(db_path)
    if not os.path.exists(p):
        raise FileNotFoundError(f'DB not found: {p}')
    conn = sqlite3.connect(p)
    conn.row_factory = sqlite3.Row
    return conn


def _fetch_window(conn, groups, since_dt):
    """撈時間窗內訊息，依 groups 白名單篩。空 groups = 全部。"""
    cur = conn.cursor()
    since = since_dt.strftime('%Y-%m-%d %H:%M:%S')
    if groups:
        placeholders = ','.join('?' * len(groups))
        sql = f"""
            SELECT message_id, user_id, display_name, source_name,
                   content, filetype, created_at
            FROM chat_msg_cache
            WHERE created_at >= ?
              AND filetype = 'text'
              AND source_name IN ({placeholders})
            ORDER BY created_at ASC
        """
        cur.execute(sql, [since, *groups])
    else:
        sql = """
            SELECT message_id, user_id, display_name, source_name,
                   content, filetype, created_at
            FROM chat_msg_cache
            WHERE created_at >= ?
              AND filetype = 'text'
            ORDER BY created_at ASC
        """
        cur.execute(sql, [since])
    return [dict(r) for r in cur.fetchall()]


def _msg_row(msg, priority='yellow'):
    return {
        'ts': msg['created_at'],
        'source_name': msg['source_name'],
        'user': msg.get('display_name') or '(系統)',
        'content': (msg.get('content') or '')[:280],
        'message_id': msg.get('message_id'),
        'priority': priority,
    }


def scan_business(messages):
    """Step 1: 商務 / 報價 keyword 命中 = 紅色高優先。"""
    out = []
    for m in messages:
        c = m.get('content') or ''
        if any(k in c for k in BUSINESS_KEYWORDS):
            out.append(_msg_row(m, 'red'))
    return out


def scan_meeting_followup(messages):
    """Step 2: 會議邀約 → 該群組後 24~72hr 無結論 = 紅旗。"""
    by_group = {}
    for m in messages:
        by_group.setdefault(m['source_name'], []).append(m)

    out = []
    for group, msgs in by_group.items():
        for i, m in enumerate(msgs):
            c = m.get('content') or ''
            if not any(k in c for k in MEETING_INVITE_KEYWORDS):
                continue
            try:
                t = datetime.strptime(m['created_at'], '%Y-%m-%d %H:%M:%S')
            except (ValueError, TypeError):
                continue
            window_end = t + timedelta(hours=72)
            window_start = t + timedelta(hours=24)
            tail = [x for x in msgs[i+1:]
                    if window_start <= _parse(x['created_at'], default=t) <= window_end]
            has_result = any(
                any(k in (x.get('content') or '') for k in MEETING_RESULT_KEYWORDS)
                for x in tail
            )
            if not has_result:
                row = _msg_row(m, 'red')
                row['flag'] = '會議邀約後 24~72hr 無結論訊息'
                out.append(row)
    return out


def _parse(s, default=None):
    try:
        return datetime.strptime(s, '%Y-%m-%d %H:%M:%S')
    except (ValueError, TypeError):
        return default or datetime.min


def scan_customer_chase(messages):
    """Step 3: 客戶催件 keyword。"""
    out = []
    for m in messages:
        c = m.get('content') or ''
        if any(k in c for k in CUSTOMER_CHASE_KEYWORDS):
            out.append(_msg_row(m, 'red'))
    return out


def scan_inbox_pending(messages, now=None):
    """Step 4: @Benson 訊息且 Benson 後續沒回 = 黃/紅（依晾天數）。"""
    now = now or datetime.now()
    by_group = {}
    for m in messages:
        by_group.setdefault(m['source_name'], []).append(m)

    out = []
    for group, msgs in by_group.items():
        for i, m in enumerate(msgs):
            c = m.get('content') or ''
            if not any(mn in c for mn in BENSON_MENTIONS):
                continue
            dn = (m.get('display_name') or '')
            if BENSON_USER_PATTERN.match(dn):
                continue  # Benson 自己發的不算
            t = _parse(m['created_at'])
            benson_replied = any(
                BENSON_USER_PATTERN.match(x.get('display_name') or '') and
                _parse(x['created_at']) > t
                for x in msgs[i+1:]
            )
            if benson_replied:
                continue
            days_pending = (now - t).days if t != datetime.min else 0
            priority = 'red' if days_pending > 3 else 'yellow'
            row = _msg_row(m, priority)
            row['days_pending'] = days_pending
            out.append(row)
    out.sort(key=lambda r: r.get('days_pending', 0), reverse=True)
    return out


def scan_auto_push_unclosed(messages):
    """Step 5: 桃園水情防災通報「未開始 N 個」整週重複 = 沒人 close。"""
    by_group_item = {}
    for m in messages:
        if (m.get('display_name') or '') != AUTO_PUSH_USER:
            continue
        c = m.get('content') or ''
        if not AUTO_PUSH_UNCLOSED_PATTERN.search(c):
            continue
        item_lines = re.findall(r'[•・]\s*(.+?)(?:\n|$)', c)
        for line in item_lines:
            key = (m['source_name'], line.strip())
            by_group_item.setdefault(key, []).append(m)

    out = []
    for (group, item), msgs in by_group_item.items():
        if len(msgs) < 2:
            continue  # 只出現一次不算重複
        last = msgs[-1]
        row = _msg_row(last, 'green')
        row['content'] = f'重複未 close ({len(msgs)} 次): {item}'
        out.append(row)
    return out


def scan_dispatched_untracked(messages):
    """Step 6: Benson 派工後該人沒回報 = 已派未追。"""
    by_group = {}
    for m in messages:
        by_group.setdefault(m['source_name'], []).append(m)

    out = []
    for group, msgs in by_group.items():
        for i, m in enumerate(msgs):
            dn = m.get('display_name') or ''
            if not BENSON_USER_PATTERN.match(dn):
                continue
            c = m.get('content') or ''
            mention_match = DISPATCH_PATTERN.search(c)
            if not mention_match:
                continue
            mention = re.search(r'@(\S+)', c)
            if not mention:
                continue
            mentionee = mention.group(1)
            t = _parse(m['created_at'])
            replied = any(
                mentionee in (x.get('display_name') or '') and _parse(x['created_at']) > t
                for x in msgs[i+1:]
            )
            if not replied:
                out.append(_msg_row(m, 'green'))
    return out


def scan(config_path, days=7, now=None):
    """主入口 — 跑 6 步 SOP，回 dict。"""
    cfg_path = _expand(config_path)
    if not os.path.exists(cfg_path):
        raise FileNotFoundError(f'review.yml not found: {cfg_path} (run init wizard)')
    with open(cfg_path, 'r', encoding='utf-8') as f:
        cfg = yaml.safe_load(f) or {}

    sources = cfg.get('line_sources') or []
    if not sources:
        return _empty_result()

    now = now or datetime.now()
    since = now - timedelta(days=days)
    all_msgs = []
    for src in sources:
        try:
            conn = _connect(src['db_path'])
        except FileNotFoundError as e:
            print(f'[warn] {e}')
            continue
        try:
            msgs = _fetch_window(conn, src.get('groups') or [], since)
            all_msgs.extend(msgs)
        finally:
            conn.close()

    result = {
        'business': scan_business(all_msgs),
        'meeting_followup': scan_meeting_followup(all_msgs),
        'customer_chase': scan_customer_chase(all_msgs),
        'inbox_pending': scan_inbox_pending(all_msgs, now=now),
        'auto_push_unclosed': scan_auto_push_unclosed(all_msgs),
        'dispatched_untracked': scan_dispatched_untracked(all_msgs),
    }
    red = sum(1 for cat in result.values() for r in cat if r.get('priority') == 'red')
    yellow = sum(1 for cat in result.values() for r in cat if r.get('priority') == 'yellow')
    green = sum(1 for cat in result.values() for r in cat if r.get('priority') == 'green')
    result['summary'] = {'red': red, 'yellow': yellow, 'green': green,
                         'total_msgs_scanned': len(all_msgs)}
    return result


def _empty_result():
    return {
        'business': [], 'meeting_followup': [], 'customer_chase': [],
        'inbox_pending': [], 'auto_push_unclosed': [], 'dispatched_untracked': [],
        'summary': {'red': 0, 'yellow': 0, 'green': 0, 'total_msgs_scanned': 0},
    }


if __name__ == '__main__':
    import json
    import sys
    cfg = sys.argv[1] if len(sys.argv) > 1 else '~/.claude/projects/test/review.yml'
    days = int(sys.argv[2]) if len(sys.argv) > 2 else 7
    r = scan(cfg, days=days)
    print(json.dumps(r, ensure_ascii=False, indent=2, default=str))
