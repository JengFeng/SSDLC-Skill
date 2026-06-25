#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""FortiGate .conf 解析器 → JSON"""
import json, re, sys, os

def parse_conf(path):
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        lines = f.read().splitlines()

    meta = {'file': os.path.basename(path)}
    for ln in lines[:20]:
        m = re.match(r'#config-version=([^:]+):.*user=(\S+)', ln)
        if m:
            meta['config_version'] = m.group(1)
            meta['exported_by'] = m.group(2)
        m = re.match(r'#buildno=(\d+)', ln)
        if m:
            meta['buildno'] = m.group(1)

    sections = {}
    globals_ = {}
    stack = []  # 每個元素: ('config', name) or ('edit', name, item_dict, inner_config_name)

    for raw in lines:
        line = raw.strip()
        if not line or line.startswith('#'):
            continue

        m = re.match(r'^config\s+(.+)$', line)
        if m:
            name = m.group(1).strip()
            stack.append(('config', name))
            if len([x for x in stack if x[0] == 'config']) == 1:
                sections.setdefault(name, [])
            continue

        if line == 'end':
            # 彈出最後一個 config（連帶任何遺漏的 edit）
            while stack and stack[-1][0] != 'config':
                stack.pop()
            if stack:
                stack.pop()
            continue

        m = re.match(r'^edit\s+(.+)$', line)
        if m:
            ename = m.group(1).strip().strip('"')
            top_cfg = None
            for x in stack:
                if x[0] == 'config':
                    top_cfg = x[1]
                    break
            # 內層 config（最後一個 config）
            inner_cfg = None
            for x in reversed(stack):
                if x[0] == 'config':
                    inner_cfg = x[1]
                    break
            item = {'_name': ename, '_fields': {}, '_sub': {}}

            # 找最近的父 edit
            parent_edit = None
            for x in reversed(stack):
                if x[0] == 'edit':
                    parent_edit = x[2]
                    break
            if parent_edit is not None:
                parent_edit['_sub'].setdefault(inner_cfg, []).append(item)
            else:
                sections.setdefault(top_cfg, []).append(item)

            stack.append(('edit', ename, item, inner_cfg))
            continue

        if line == 'next':
            while stack and stack[-1][0] != 'edit':
                stack.pop()
            if stack:
                stack.pop()
            continue

        m = re.match(r'^set\s+(\S+)\s*(.*)$', line)
        if m:
            key = m.group(1); val = m.group(2).strip()
            target = None
            for x in reversed(stack):
                if x[0] == 'edit':
                    target = x[2]['_fields']; break
            if target is None:
                top_cfg = None
                for x in stack:
                    if x[0] == 'config':
                        top_cfg = x[1]; break
                if top_cfg:
                    target = globals_.setdefault(top_cfg, {})
            if target is not None:
                target[key] = val
            continue

    return {'meta': meta, 'sections': sections, 'globals': globals_}


def summarize(data):
    s = data['sections']; g = data['globals']
    return {
        'hostname': g.get('system global', {}).get('hostname', '').strip('"'),
        'alias':    g.get('system global', {}).get('alias', '').strip('"'),
        'mgmt_ip':  g.get('system global', {}).get('management-ip', '').strip('"'),
        'timezone': g.get('system global', {}).get('timezone', ''),
        'language': g.get('system global', {}).get('language', ''),
        'counts': {
            'firewall_policy':   len(s.get('firewall policy', [])),
            'firewall_address':  len(s.get('firewall address', [])),
            'firewall_addrgrp':  len(s.get('firewall addrgrp', [])),
            'firewall_vip':      len(s.get('firewall vip', [])),
            'firewall_service':  len(s.get('firewall service custom', [])),
            'interface':         len(s.get('system interface', [])),
            'admin':             len(s.get('system admin', [])),
            'user_local':        len(s.get('user local', [])),
            'user_group':        len(s.get('user group', [])),
            'static_route':      len(s.get('router static', [])),
            'dhcp_server':       len(s.get('system dhcp server', [])),
            'vpn_ssl_portal':    len(s.get('vpn ssl web portal', [])),
            'cert_local':        len(s.get('vpn certificate local', [])),
            'cert_ca':           len(s.get('vpn certificate ca', [])),
            'webfilter_profile': len(s.get('webfilter profile', [])),
            'av_profile':        len(s.get('antivirus profile', [])),
            'ips_sensor':        len(s.get('ips sensor', [])),
            'app_list':          len(s.get('application list', [])),
        }
    }


def run_risk_checks(data):
    s = data['sections']; g = data['globals']
    risks = []
    def add(sev, cat, title, detail='', ref=''):
        risks.append({'severity': sev, 'category': cat, 'title': title, 'detail': detail, 'ref': ref})

    for p in s.get('firewall policy', []):
        f = p['_fields']
        name = (f.get('name', '') or p['_name']).strip('"')
        if f.get('status', 'enable') == 'disable':
            continue
        srcaddr = f.get('srcaddr', ''); dstaddr = f.get('dstaddr', '')
        service = f.get('service', ''); action = f.get('action', 'accept')
        if '"all"' in srcaddr and '"all"' in dstaddr and 'ALL' in service and action == 'accept':
            add('critical', 'Policy', f'Policy #{p["_name"]} ({name}) = any/any/ALL ACCEPT',
                f'srcaddr={srcaddr}, dstaddr={dstaddr}, service={service}', f'policy:{p["_name"]}')
        elif '"all"' in srcaddr and '"all"' in dstaddr and action == 'accept':
            add('high', 'Policy', f'Policy #{p["_name"]} ({name}) src=all dst=all',
                f'service={service}', f'policy:{p["_name"]}')
        if action == 'accept' and f.get('logtraffic', 'utm') == 'disable':
            add('low', 'Policy', f'Policy #{p["_name"]} ({name}) 未啟用流量記錄', 'logtraffic=disable', f'policy:{p["_name"]}')

    for a in s.get('system admin', []):
        f = a['_fields']; name = a['_name']
        if name.lower() in ('admin',):
            add('high', 'Admin', f'存在預設管理者帳號 "{name}"', '建議改名以降低暴力破解風險', f'admin:{name}')
        has_trust = any(k.startswith('trusthost') for k in f)
        if not has_trust:
            add('medium', 'Admin', f'管理者 "{name}" 未設定 trusthost 限制來源 IP', '', f'admin:{name}')
        if f.get('two-factor', 'disable') in ('', 'disable'):
            add('medium', 'Admin', f'管理者 "{name}" 未啟用雙因素驗證', 'two-factor=disable', f'admin:{name}')

    for itf in s.get('system interface', []):
        f = itf['_fields']; name = itf['_name']
        allow = f.get('allowaccess', '')
        toks = allow.split()
        if 'telnet' in toks:
            add('critical', 'Interface', f'介面 "{name}" 允許 Telnet 管理', f'allowaccess={allow}', f'interface:{name}')
        if 'http' in toks and 'https' not in toks:
            add('high', 'Interface', f'介面 "{name}" 僅允許 HTTP 管理（明文）', f'allowaccess={allow}', f'interface:{name}')
        elif 'http' in toks and 'https' in toks:
            add('low', 'Interface', f'介面 "{name}" 同時允許 HTTP 與 HTTPS', '建議僅保留 HTTPS', f'interface:{name}')

    gl = g.get('system global', {})
    if gl.get('admin-https-redirect', 'enable') == 'disable':
        add('medium', 'Global', '未啟用 HTTP→HTTPS 強制轉址', '', 'global')
    if gl.get('strong-crypto', 'enable') == 'disable':
        add('high', 'Global', '未啟用 strong-crypto', '', 'global')

    if 'system password-policy' not in g or g.get('system password-policy', {}).get('status', 'disable') == 'disable':
        add('medium', 'Password', '未啟用密碼政策', '建議啟用最小長度、複雜度', 'password-policy')

    for sn in s.get('system snmp community', []):
        f = sn['_fields']; nm = f.get('name', '').strip('"').lower()
        if nm in ('public', 'private'):
            add('high', 'SNMP', f'SNMP community 使用常見名稱 "{nm}"', '易遭暴力嘗試', f'snmp:{sn["_name"]}')

    vsl = g.get('vpn ssl settings', {})
    if vsl.get('servercert', '').strip('"') in ('Fortinet_Factory', '', 'self-sign'):
        add('high', 'VPN-SSL', f'SSL VPN 使用預設/自簽憑證: {vsl.get("servercert","(空)")}', '', 'vpn ssl')
    if vsl.get('tlsv1-0', 'disable') == 'enable' or vsl.get('tlsv1-1', 'disable') == 'enable':
        add('high', 'VPN-SSL', 'SSL VPN 允許 TLS 1.0/1.1', '應停用舊版 TLS', 'vpn ssl')

    return risks


def main():
    src = sys.argv[1]; out_json = sys.argv[2]
    data = parse_conf(src)
    data['summary'] = summarize(data)
    data['risks'] = run_risk_checks(data)
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    sm = data['summary']
    print(f"OK: {out_json}")
    print(f"  hostname={sm['hostname']} mgmt={sm['mgmt_ip']}")
    for k, v in sm['counts'].items():
        print(f"  {k}: {v}")
    print(f"  risks: {len(data['risks'])}")

if __name__ == '__main__':
    main()
