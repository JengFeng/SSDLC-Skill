#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""快速查詢：python3 query.py forti.json <command> [args]
   命令：ip <IP>         查 IP 用途
        port <PORT>     查對外開了哪個 port
        wan             列所有對外規則
        admin           列管理者帳號狀況
        risks           列所有風險
        policy <ID>     看單條 policy
        find <關鍵字>    全文搜尋
"""
import json, sys, re, ipaddress

def load(p):
    with open(p,'r',encoding='utf-8') as f: return json.load(f)

def strip(s): return (s or '').replace('"','').strip()

def cmd_ip(d, ip):
    s = d['sections']; g = d['globals']
    hits = []
    # interface IP
    for itf in s.get('system interface', []):
        ipv = strip(itf['_fields'].get('ip',''))
        if ipv and ip in ipv:
            hits.append(('Interface', itf['_name'], f"ip={ipv}"))
    # VIP
    for v in s.get('firewall vip', []):
        ext = strip(v['_fields'].get('extip','')); mp = strip(v['_fields'].get('mappedip',''))
        if ip in ext: hits.append(('VIP-外部', v['_name'], f"extip={ext} → {mp}"))
        if ip in mp:  hits.append(('VIP-內部映射', v['_name'], f"extip={ext} → mappedip={mp}"))
    # address
    for a in s.get('firewall address', []):
        sub = strip(a['_fields'].get('subnet',''))
        st  = strip(a['_fields'].get('start-ip',''))
        en  = strip(a['_fields'].get('end-ip',''))
        if sub and ip in sub: hits.append(('Address-物件', a['_name'], f"subnet={sub}"))
        if st and en:
            try:
                lo = ipaddress.ip_address(st); hi = ipaddress.ip_address(en)
                t = ipaddress.ip_address(ip)
                if lo <= t <= hi: hits.append(('Address-範圍', a['_name'], f"{st} - {en}"))
            except Exception: pass
    # DHCP
    for dh in s.get('system dhcp server', []):
        for r in dh['_sub'].get('ip-range', []):
            st = strip(r['_fields'].get('start-ip','')); en = strip(r['_fields'].get('end-ip',''))
            try:
                lo = ipaddress.ip_address(st); hi = ipaddress.ip_address(en); t = ipaddress.ip_address(ip)
                if lo <= t <= hi: hits.append(('DHCP-Pool', f"dhcp#{dh['_name']}", f"{st}-{en} on {strip(dh['_fields'].get('interface',''))}"))
            except: pass
    # 靜態路由 gateway
    for r in s.get('router static', []):
        gw = strip(r['_fields'].get('gateway',''))
        if ip == gw: hits.append(('Route-Gateway', f"route#{r['_name']}", f"dst={strip(r['_fields'].get('dst',''))}"))
    # SSL VPN pool
    vsl = g.get('vpn ssl settings', {})
    pool = strip(vsl.get('tunnel-ip-pools',''))
    if pool:
        # pool 是 address 名稱
        for a in s.get('firewall address', []):
            if a['_name'] == pool:
                sub = strip(a['_fields'].get('subnet','')); st=strip(a['_fields'].get('start-ip','')); en=strip(a['_fields'].get('end-ip',''))
                if (sub and ip in sub) or (st and en):
                    hits.append(('SSL-VPN-Pool', pool, f"{sub or st+'-'+en}"))

    if not hits:
        print(f"❓ 找不到 {ip} 在設定中的明確定義")
        return
    print(f"🔍 {ip} 的相關設定：")
    for t, n, v in hits:
        print(f"  • [{t}] {n}: {v}")
    # 同時找有引用這 IP 的 policy
    print("\n📋 引用以上物件的 firewall policy：")
    used_names = set(n for _,n,_ in hits)
    found = 0
    for p in d['sections'].get('firewall policy', []):
        f = p['_fields']
        text = ' '.join([f.get('srcaddr',''), f.get('dstaddr',''), f.get('srcintf',''), f.get('dstintf','')])
        if any(n in text for n in used_names):
            found += 1
            print(f"  Policy #{p['_name']} {strip(f.get('name',''))} : {strip(f.get('srcintf',''))}→{strip(f.get('dstintf',''))} {strip(f.get('action','accept'))}")
    if not found: print("  （無）")

def cmd_wan(d):
    s = d['sections']
    wan_intfs = []
    for itf in s.get('system interface', []):
        role = strip(itf['_fields'].get('role',''))
        alias = strip(itf['_fields'].get('alias','')).lower()
        nm = itf['_name'].lower()
        if role == 'wan' or 'wan' in nm or 'internet' in alias or 'wan' in alias:
            wan_intfs.append(itf['_name'])
    print(f"🌐 對外介面: {wan_intfs}\n")
    # VIP（外→內）
    vips = s.get('firewall vip', [])
    if vips:
        print(f"🔁 對外服務發布 (VIP) 共 {len(vips)} 個：")
        for v in vips:
            f = v['_fields']
            print(f"  • {v['_name']}: {strip(f.get('extip',''))}:{strip(f.get('extport','-'))} → {strip(f.get('mappedip',''))}:{strip(f.get('mappedport','-'))} ({strip(f.get('protocol','tcp'))})")
        print()
    # 對外 policy
    print("📋 對外允許的 policy:")
    cnt = 0
    for p in s.get('firewall policy', []):
        f = p['_fields']
        if strip(f.get('status','enable')) == 'disable': continue
        if strip(f.get('action','accept')) != 'accept': continue
        if any(w in strip(f.get('dstintf','')) for w in wan_intfs):
            cnt += 1
            print(f"  #{p['_name']} {strip(f.get('name',''))}: {strip(f.get('srcaddr',''))} → {strip(f.get('dstaddr',''))} svc={strip(f.get('service',''))} nat={strip(f.get('nat','disable'))}")
    if cnt == 0: print("  （無 — 通常表示沒設或介面命名不同）")

def cmd_admin(d):
    for a in d['sections'].get('system admin', []):
        f = a['_fields']
        trust = [k for k in f if k.startswith('trusthost')]
        print(f"👤 {a['_name']}")
        print(f"   profile = {strip(f.get('accprofile',''))}")
        print(f"   2FA     = {strip(f.get('two-factor','disable'))}")
        print(f"   trust   = {', '.join([strip(f[k]) for k in trust]) or '⚠️ 無（任意 IP 可登入）'}")
        print()

def cmd_risks(d):
    for r in d['risks']:
        print(f"[{r['severity'].upper():8}] {r['category']:12} {r['title']}")
        if r['detail']: print(f"           ↳ {r['detail']}")

def cmd_policy(d, pid):
    for p in d['sections'].get('firewall policy', []):
        if p['_name'] == pid:
            print(json.dumps(p, ensure_ascii=False, indent=2))
            return
    print(f"找不到 policy #{pid}")

def cmd_find(d, kw):
    kw_l = kw.lower()
    n = 0
    for sec, items in d['sections'].items():
        for it in items:
            text = it['_name'] + ' ' + ' '.join(f"{k}={v}" for k,v in it['_fields'].items())
            if kw_l in text.lower():
                n += 1
                print(f"[{sec}] {it['_name']}")
                for k,v in it['_fields'].items():
                    if kw_l in str(v).lower() or kw_l in k.lower():
                        print(f"   {k} = {v}")
                if n >= 50:
                    print("…前 50 筆"); return

def cmd_port(d, port):
    port = str(port)
    hits = []
    for v in d['sections'].get('firewall vip', []):
        f = v['_fields']
        ext = strip(f.get('extport','')); mp = strip(f.get('mappedport',''))
        if port in ext.split() or port in mp.split() or port == ext or port == mp:
            hits.append(f"VIP {v['_name']}: ext {ext} → mapped {mp}")
    for s in d['sections'].get('firewall service custom', []):
        f = s['_fields']
        for k in ('tcp-portrange','udp-portrange'):
            if port in (strip(f.get(k,'')) or '').split():
                hits.append(f"Service {s['_name']}: {k}={strip(f.get(k,''))}")
    if not hits:
        print(f"❓ 找不到 port {port} 的直接定義")
    else:
        for h in hits: print('  •', h)

def main():
    d = load(sys.argv[1]); cmd = sys.argv[2]
    if cmd=='ip':     cmd_ip(d, sys.argv[3])
    elif cmd=='wan':  cmd_wan(d)
    elif cmd=='admin':cmd_admin(d)
    elif cmd=='risks':cmd_risks(d)
    elif cmd=='policy':cmd_policy(d, sys.argv[3])
    elif cmd=='find': cmd_find(d, sys.argv[3])
    elif cmd=='port': cmd_port(d, sys.argv[3])
    else: print(__doc__)

if __name__=='__main__': main()
