#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""組裝單一 HTML 查詢頁：內嵌 JSON + Vis.js 拓樸 + 風險面板 + diff"""
import json, sys, base64, gzip, os, html as H

template = r"""<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<title>FortiGate Config Explorer — __HOSTNAME__</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  :root{
    --bg:#0f1419; --panel:#1a2129; --border:#2a3441; --text:#e6edf3;
    --muted:#7d8590; --acc:#58a6ff; --ok:#3fb950; --warn:#d29922; --err:#f85149;
    --crit:#ff4d4f; --high:#ff7a45; --med:#faad14; --low:#9ca3af;
  }
  *{box-sizing:border-box}
  body{margin:0;font:13px/1.5 -apple-system,"Segoe UI","Microsoft JhengHei",sans-serif;background:var(--bg);color:var(--text)}
  header{display:flex;align-items:center;gap:16px;padding:10px 16px;background:var(--panel);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50}
  header h1{margin:0;font-size:16px;font-weight:600}
  header .meta{color:var(--muted);font-size:12px}
  .tabs{display:flex;gap:2px;background:var(--panel);border-bottom:1px solid var(--border);padding:0 8px;overflow-x:auto;white-space:nowrap}
  .tabs button{background:transparent;color:var(--muted);border:0;border-bottom:2px solid transparent;padding:10px 14px;cursor:pointer;font:inherit}
  .tabs button.active{color:var(--acc);border-bottom-color:var(--acc)}
  .tabs button:hover{color:var(--text)}
  .container{padding:16px;max-width:1600px;margin:0 auto}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
  .card{background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:12px}
  .card .label{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.5px}
  .card .num{font-size:24px;font-weight:700;color:var(--acc);margin-top:4px}
  .card .sub{color:var(--muted);font-size:11px}
  input[type=search],select{background:var(--bg);color:var(--text);border:1px solid var(--border);padding:8px 10px;border-radius:6px;font:inherit;width:100%}
  table{width:100%;border-collapse:collapse;background:var(--panel);border-radius:8px;overflow:hidden}
  th{background:#222b35;text-align:left;padding:8px 10px;font-weight:600;font-size:12px;color:var(--muted);border-bottom:1px solid var(--border);position:sticky;top:42px;cursor:pointer;user-select:none}
  th:hover{color:var(--acc)}
  td{padding:7px 10px;border-bottom:1px solid #222b35;vertical-align:top;font-size:12px}
  tr:hover{background:#1f2731}
  .pill{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600}
  .pill.accept{background:#1b4332;color:#3fb950}
  .pill.deny{background:#4d1f1f;color:#f85149}
  .pill.crit{background:#5a1a1a;color:#ff4d4f}
  .pill.high{background:#5a3a1a;color:#ff7a45}
  .pill.med{background:#544314;color:#faad14}
  .pill.low{background:#2a313c;color:#9ca3af}
  .pill.on{background:#1b4332;color:#3fb950}
  .pill.off{background:#3a3a3a;color:#7d8590}
  code{font-family:ui-monospace,"Cascadia Code",Consolas,monospace;font-size:11.5px;color:#79c0ff}
  .filterbar{display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap}
  .filterbar > *{flex:1;min-width:160px}
  .scroll{max-height:calc(100vh - 240px);overflow:auto;border:1px solid var(--border);border-radius:8px}
  details{background:var(--panel);border:1px solid var(--border);border-radius:6px;margin-bottom:6px}
  details summary{padding:8px 10px;cursor:pointer;font-weight:600}
  details[open] summary{border-bottom:1px solid var(--border)}
  details .body{padding:10px;font-family:ui-monospace,Consolas,monospace;font-size:11.5px;white-space:pre-wrap;color:#c9d1d9}
  #topo{height:calc(100vh - 180px);background:var(--panel);border:1px solid var(--border);border-radius:8px}
  .risk{display:flex;gap:10px;padding:10px;border-bottom:1px solid var(--border);align-items:flex-start}
  .risk:hover{background:#1f2731}
  .risk .sev{flex:0 0 70px;text-align:center}
  .risk .body{flex:1}
  .risk .body .title{font-weight:600}
  .risk .body .detail{color:var(--muted);font-size:11.5px;margin-top:2px}
  .toolbar{display:flex;gap:8px;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap}
  .counts{color:var(--muted);font-size:12px}
  button.btn{background:#222b35;color:var(--text);border:1px solid var(--border);padding:6px 12px;border-radius:6px;cursor:pointer;font:inherit}
  button.btn:hover{background:#2a3441}
  .empty{padding:40px;text-align:center;color:var(--muted)}
  textarea.diff-in{width:100%;height:120px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:8px;font:11.5px ui-monospace,Consolas,monospace}
  .diff-row{padding:2px 8px;font:11.5px ui-monospace,Consolas,monospace}
  .diff-add{background:rgba(63,185,80,.15);color:#7ee787}
  .diff-del{background:rgba(248,81,73,.15);color:#ffa198}
  .diff-eq{color:#7d8590}
</style>
</head>
<body>
<header>
  <h1>🔥 FortiGate Config Explorer</h1>
  <div class="meta" id="metaBar"></div>
  <div style="flex:1"></div>
  <button class="btn" onclick="document.documentElement.requestFullscreen?.()">⛶</button>
</header>
<div class="tabs" id="tabs">
  <button data-tab="dashboard" class="active">📊 總覽</button>
  <button data-tab="risks">⚠️ 風險檢測</button>
  <button data-tab="policy">🛡️ Firewall Policy</button>
  <button data-tab="address">📍 Address / Group</button>
  <button data-tab="vip">🔁 VIP</button>
  <button data-tab="service">🔧 Service</button>
  <button data-tab="interface">🔌 Interface</button>
  <button data-tab="route">🗺️ Static Route</button>
  <button data-tab="admin">👤 Admin</button>
  <button data-tab="user">👥 User / Group</button>
  <button data-tab="vpn">🔐 VPN</button>
  <button data-tab="dhcp">📡 DHCP</button>
  <button data-tab="utm">🛡 UTM Profiles</button>
  <button data-tab="topo">🗺 拓樸圖</button>
  <button data-tab="raw">🔍 全文搜尋</button>
  <button data-tab="diff">📑 多版本 Diff</button>
</div>

<div class="container">
  <div id="view"></div>
</div>

<script id="data" type="application/json">__DATA__</script>
<script>
const DATA = JSON.parse(document.getElementById('data').textContent);
const S = DATA.sections, G = DATA.globals, SUM = DATA.summary, RISKS = DATA.risks;
const $ = (q,el=document)=>el.querySelector(q);
const $$ = (q,el=document)=>el.querySelectorAll(q);
document.getElementById('metaBar').textContent =
  `${SUM.hostname || '-'} • ${SUM.mgmt_ip || '-'} • ${DATA.meta.config_version || ''} • build ${DATA.meta.buildno || ''} • by ${DATA.meta.exported_by || ''}`;

const stripQ = s => (s||'').toString().replace(/^"|"$/g,'').replace(/"\s+"/g,', ');

// ============ Renderers ============
function table(headers, rows, opts={}){
  if(!rows.length) return `<div class="empty">沒有資料</div>`;
  const ths = headers.map((h,i)=>`<th data-col="${i}">${h} <span class="muted">⇅</span></th>`).join('');
  const trs = rows.map(r=>`<tr>${r.map(c=>`<td>${c==null?'':c}</td>`).join('')}</tr>`).join('');
  return `<div class="scroll"><table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
}
function pill(text, cls){return `<span class="pill ${cls}">${text}</span>`}

// ============ Dashboard ============
function viewDashboard(){
  const c = SUM.counts;
  const cards = [
    ['Hostname', SUM.hostname, SUM.alias],
    ['管理 IP', SUM.mgmt_ip, ''],
    ['Firewall Policy', c.firewall_policy, '條規則'],
    ['Address', c.firewall_address, `groups: ${c.firewall_addrgrp}`],
    ['VIP', c.firewall_vip, ''],
    ['Service (custom)', c.firewall_service, ''],
    ['Interface', c.interface, ''],
    ['Static Route', c.static_route, ''],
    ['Admin 帳號', c.admin, ''],
    ['Local User', c.user_local, `groups: ${c.user_group}`],
    ['DHCP Server', c.dhcp_server, ''],
    ['SSL VPN Portal', c.vpn_ssl_portal, ''],
    ['本機憑證', c.cert_local, `CA: ${c.cert_ca}`],
    ['Webfilter Profile', c.webfilter_profile, ''],
    ['AV Profile', c.av_profile, ''],
    ['IPS Sensor', c.ips_sensor, ''],
    ['Application List', c.app_list, ''],
    ['風險點', RISKS.length, '前往風險檢測'],
  ];
  const grid = cards.map(([l,n,s])=>`<div class="card"><div class="label">${l}</div><div class="num">${n||0}</div><div class="sub">${s||''}</div></div>`).join('');
  return `<div class="grid">${grid}</div>
  <div class="card" style="margin-top:16px">
    <div class="label">設備資訊</div>
    <pre style="margin:6px 0 0;color:#c9d1d9;font:12px ui-monospace,Consolas,monospace">${JSON.stringify({meta:DATA.meta, summary:SUM}, null, 2)}</pre>
  </div>`;
}

// ============ Risks ============
function viewRisks(){
  const byCat = {};
  RISKS.forEach(r => { (byCat[r.category]=byCat[r.category]||[]).push(r); });
  const sevOrder = {critical:0,high:1,medium:2,low:3};
  const list = RISKS.slice().sort((a,b)=>sevOrder[a.severity]-sevOrder[b.severity]);
  const sevPill = s => pill(s.toUpperCase(), s==='critical'?'crit':s==='high'?'high':s==='medium'?'med':'low');
  const rows = list.map(r => `
    <div class="risk">
      <div class="sev">${sevPill(r.severity)}</div>
      <div class="body">
        <div class="title">[${r.category}] ${H.escape ? '' : ''}${r.title.replace(/</g,'&lt;')}</div>
        <div class="detail">${(r.detail||'').replace(/</g,'&lt;')} ${r.ref?`<code>${r.ref}</code>`:''}</div>
      </div>
    </div>`).join('');
  const summary = Object.entries(byCat).map(([k,v])=>`<span class="pill low">${k} ×${v.length}</span>`).join(' ');
  return `<div class="card" style="margin-bottom:12px">
    <div class="label">風險總計 ${RISKS.length} 項</div>
    <div style="margin-top:6px">${summary}</div>
  </div>
  <div class="scroll">${rows || '<div class="empty">✅ 沒有偵測到風險</div>'}</div>`;
}

// ============ 通用列表（含搜尋／排序） ============
let _sort = {col:0, dir:1};
function listView(items, columns, options={}){
  // columns = [{label, get:(item)=>val, render?:(v,it)=>html}]
  const id = 'tbl' + Math.random().toString(36).slice(2,8);
  const html = `
    <div class="toolbar">
      <input type="search" id="${id}_q" placeholder="🔍 搜尋…（任意欄位）" style="max-width:400px">
      <div class="counts" id="${id}_cnt"></div>
    </div>
    <div id="${id}_tbl"></div>`;
  setTimeout(()=>{
    const q = document.getElementById(id+'_q');
    const tblWrap = document.getElementById(id+'_tbl');
    const cnt = document.getElementById(id+'_cnt');
    function render(){
      const kw = (q.value||'').toLowerCase();
      let rows = items.map(it => columns.map(c => c.get(it)));
      if(kw) rows = rows.filter(r => r.some(v => (v==null?'':String(v)).toLowerCase().includes(kw)));
      rows.sort((a,b)=>{
        const va=a[_sort.col],vb=b[_sort.col];
        const na=parseFloat(va),nb=parseFloat(vb);
        if(!isNaN(na)&&!isNaN(nb)) return (na-nb)*_sort.dir;
        return String(va||'').localeCompare(String(vb||''),'zh')*_sort.dir;
      });
      const renderedRows = rows.map(r => r.map((v,i)=>{
        const col=columns[i]; return col.render?col.render(v,r):v;
      }));
      tblWrap.innerHTML = table(columns.map(c=>c.label), renderedRows);
      cnt.textContent = `${rows.length} / ${items.length} 筆`;
      tblWrap.querySelectorAll('th').forEach((th,i)=>{
        th.onclick = ()=>{ if(_sort.col===i)_sort.dir*=-1; else {_sort.col=i;_sort.dir=1;} render(); };
      });
    }
    q.oninput = render; render();
  },0);
  return html;
}

function f(it,k,def=''){ return stripQ(it._fields[k]||def); }

// ============ 各分頁 ============
function viewPolicy(){
  return listView(S['firewall policy']||[], [
    {label:'ID', get:it=>+it._name},
    {label:'Name', get:it=>f(it,'name',it._name)},
    {label:'Status', get:it=>f(it,'status','enable'),
      render:v=>pill(v, v==='enable'?'on':'off')},
    {label:'Action', get:it=>f(it,'action','accept'),
      render:v=>pill(v.toUpperCase(), v==='accept'?'accept':'deny')},
    {label:'SrcIntf', get:it=>f(it,'srcintf')},
    {label:'DstIntf', get:it=>f(it,'dstintf')},
    {label:'SrcAddr', get:it=>f(it,'srcaddr')},
    {label:'DstAddr', get:it=>f(it,'dstaddr')},
    {label:'Service', get:it=>f(it,'service')},
    {label:'Schedule', get:it=>f(it,'schedule','always')},
    {label:'NAT', get:it=>f(it,'nat','disable'),
      render:v=>pill(v, v==='enable'?'on':'off')},
    {label:'Log', get:it=>f(it,'logtraffic','utm')},
    {label:'Comments', get:it=>f(it,'comments')},
  ]);
}
function viewAddress(){
  return listView(S['firewall address']||[], [
    {label:'Name', get:it=>it._name},
    {label:'Type', get:it=>f(it,'type','ipmask')},
    {label:'Value', get:it=>f(it,'subnet')||f(it,'start-ip')+(f(it,'end-ip')?'-'+f(it,'end-ip'):'')||f(it,'fqdn')||f(it,'country')||''},
    {label:'Interface', get:it=>f(it,'associated-interface')},
    {label:'Comment', get:it=>f(it,'comment')},
  ]) + `<h3 style="margin-top:20px">Address Group (${(S['firewall addrgrp']||[]).length})</h3>` +
  listView(S['firewall addrgrp']||[], [
    {label:'Group Name', get:it=>it._name},
    {label:'Members', get:it=>f(it,'member')},
    {label:'Comment', get:it=>f(it,'comment')},
  ]);
}
function viewVip(){
  return listView(S['firewall vip']||[], [
    {label:'Name', get:it=>it._name},
    {label:'External IP', get:it=>f(it,'extip')},
    {label:'Mapped IP', get:it=>f(it,'mappedip')},
    {label:'Ext Intf', get:it=>f(it,'extintf','any')},
    {label:'Protocol', get:it=>f(it,'protocol','tcp')},
    {label:'Ext Port', get:it=>f(it,'extport')},
    {label:'Mapped Port', get:it=>f(it,'mappedport')},
    {label:'Comment', get:it=>f(it,'comment')},
  ]);
}
function viewService(){
  return listView(S['firewall service custom']||[], [
    {label:'Name', get:it=>it._name},
    {label:'Protocol', get:it=>f(it,'protocol','TCP/UDP/SCTP')},
    {label:'TCP Port', get:it=>f(it,'tcp-portrange')},
    {label:'UDP Port', get:it=>f(it,'udp-portrange')},
    {label:'ICMP', get:it=>f(it,'icmptype')+(f(it,'icmpcode')?'/'+f(it,'icmpcode'):'')},
    {label:'Category', get:it=>f(it,'category')},
    {label:'Comment', get:it=>f(it,'comment')},
  ]);
}
function viewInterface(){
  return listView(S['system interface']||[], [
    {label:'Name', get:it=>it._name},
    {label:'Type', get:it=>f(it,'type','physical')},
    {label:'VDOM', get:it=>f(it,'vdom','root')},
    {label:'IP', get:it=>f(it,'ip')},
    {label:'Mode', get:it=>f(it,'mode','static')},
    {label:'Status', get:it=>f(it,'status','up'),
      render:v=>pill(v, v==='up'?'on':'off')},
    {label:'AllowAccess', get:it=>f(it,'allowaccess'),
      render:v=>{
        const danger = ['telnet'].some(t=>v.includes(t));
        const warn = v.split(' ').includes('http');
        return danger? pill(v,'crit') : warn? pill(v,'med') : v;
      }},
    {label:'Role', get:it=>f(it,'role','undefined')},
    {label:'Member', get:it=>f(it,'member')},
    {label:'Alias', get:it=>f(it,'alias')},
    {label:'Desc', get:it=>f(it,'description')},
  ]);
}
function viewRoute(){
  return listView(S['router static']||[], [
    {label:'Seq', get:it=>+it._name},
    {label:'Destination', get:it=>f(it,'dst','0.0.0.0 0.0.0.0')},
    {label:'Gateway', get:it=>f(it,'gateway')},
    {label:'Device', get:it=>f(it,'device')},
    {label:'Distance', get:it=>f(it,'distance','10')},
    {label:'Status', get:it=>f(it,'status','enable')},
    {label:'Comment', get:it=>f(it,'comment')},
  ]);
}
function viewAdmin(){
  return listView(S['system admin']||[], [
    {label:'Username', get:it=>it._name},
    {label:'Profile', get:it=>f(it,'accprofile')},
    {label:'2FA', get:it=>f(it,'two-factor','disable'),
      render:v=>pill(v, v==='disable'?'off':'on')},
    {label:'Trusthost1', get:it=>f(it,'trusthost1')},
    {label:'Trusthost2', get:it=>f(it,'trusthost2')},
    {label:'PKI', get:it=>f(it,'peer-auth','disable')},
    {label:'Comments', get:it=>f(it,'comments')},
  ]);
}
function viewUser(){
  return listView(S['user local']||[], [
    {label:'Username', get:it=>it._name},
    {label:'Type', get:it=>f(it,'type','password')},
    {label:'Status', get:it=>f(it,'status','enable')},
    {label:'Email', get:it=>f(it,'email-to')},
    {label:'2FA', get:it=>f(it,'two-factor','disable')},
  ]) + `<h3 style="margin-top:20px">User Group</h3>` +
  listView(S['user group']||[], [
    {label:'Name', get:it=>it._name},
    {label:'Type', get:it=>f(it,'group-type','firewall')},
    {label:'Members', get:it=>f(it,'member')},
  ]);
}
function viewVpn(){
  return `<h3>SSL VPN Portal</h3>` +
  listView(S['vpn ssl web portal']||[], [
    {label:'Name', get:it=>it._name},
    {label:'Tunnel Mode', get:it=>f(it,'tunnel-mode','enable')},
    {label:'Web Mode', get:it=>f(it,'web-mode','disable')},
    {label:'IP Pool', get:it=>f(it,'ip-pools')},
    {label:'Split Tunnel', get:it=>f(it,'split-tunneling','enable')},
  ]) + `<h3 style="margin-top:20px">本機憑證</h3>` +
  listView(S['vpn certificate local']||[], [
    {label:'Name', get:it=>it._name},
    {label:'Comments', get:it=>f(it,'comments')},
    {label:'Source', get:it=>f(it,'source','factory')},
  ]) + `<h3 style="margin-top:20px">SSL VPN 全域</h3>` +
  `<div class="card"><pre style="margin:0;font:12px ui-monospace">${JSON.stringify(G['vpn ssl settings']||{}, null, 2)}</pre></div>`;
}
function viewDhcp(){
  return listView(S['system dhcp server']||[], [
    {label:'ID', get:it=>+it._name},
    {label:'Interface', get:it=>f(it,'interface')},
    {label:'Range', get:it=>{
      const subs = it._sub['ip-range']||[];
      return subs.map(r=>`${stripQ(r._fields['start-ip'])} - ${stripQ(r._fields['end-ip'])}`).join('<br>');
    }},
    {label:'Netmask', get:it=>f(it,'netmask')},
    {label:'Gateway', get:it=>f(it,'default-gateway')},
    {label:'DNS', get:it=>f(it,'dns-server1')+' '+f(it,'dns-server2')},
    {label:'Lease', get:it=>f(it,'lease-time','604800')},
    {label:'Status', get:it=>f(it,'status','enable')},
  ]);
}
function viewUtm(){
  const sections = [
    ['Webfilter Profile', 'webfilter profile'],
    ['Antivirus Profile', 'antivirus profile'],
    ['IPS Sensor', 'ips sensor'],
    ['Application List', 'application list'],
    ['DNS Filter', 'dnsfilter profile'],
    ['DLP Sensor', 'dlp sensor'],
    ['File Filter', 'file-filter profile'],
    ['Emailfilter', 'emailfilter profile'],
  ];
  return sections.map(([title, key])=>{
    const items = S[key]||[];
    return `<h3>${title} (${items.length})</h3>` + listView(items, [
      {label:'Name', get:it=>it._name},
      {label:'Comment', get:it=>f(it,'comment')||f(it,'comments')},
      {label:'欄位數', get:it=>Object.keys(it._fields).length},
    ]);
  }).join('');
}

// ============ Topology ============
function viewTopo(){
  const html = `<div class="toolbar">
    <span class="counts">介面、靜態路由、DHCP 視覺化（拖曳節點可移動）</span>
    <button class="btn" onclick="renderTopo()">🔄 重新布局</button>
  </div>
  <div id="topo"></div>`;
  setTimeout(renderTopo, 50);
  return html;
}
function renderTopo(){
  const topo = document.getElementById('topo');
  if(!topo) return;
  topo.innerHTML = '';
  // 簡單 SVG 拓樸：FortiGate 中心 → 各介面 → 路由
  const interfaces = (S['system interface']||[]).filter(i=>{
    const ip = f(i,'ip'); return ip && ip!=='0.0.0.0 0.0.0.0';
  });
  const routes = S['router static']||[];
  const W = topo.clientWidth, H = topo.clientHeight;
  const cx = W/2, cy = H/2;
  const svg = `<svg width="${W}" height="${H}" style="display:block">
    <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 0,10 z" fill="#58a6ff"/></marker></defs>
    <circle cx="${cx}" cy="${cy}" r="40" fill="#1b4332" stroke="#3fb950" stroke-width="2"/>
    <text x="${cx}" y="${cy-5}" text-anchor="middle" fill="#3fb950" font-weight="700" font-size="13">FortiGate</text>
    <text x="${cx}" y="${cy+12}" text-anchor="middle" fill="#7ee787" font-size="10">${SUM.hostname}</text>
    ${interfaces.map((itf,i)=>{
      const ang = (i/interfaces.length)*Math.PI*2 - Math.PI/2;
      const r = Math.min(W,H)/2 - 90;
      const x = cx + Math.cos(ang)*r, y = cy + Math.sin(ang)*r;
      const ip = f(itf,'ip');
      const allow = f(itf,'allowaccess');
      const danger = allow.includes('telnet');
      const color = danger? '#ff4d4f' : '#58a6ff';
      return `
        <line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${color}" stroke-width="1.5" marker-end="url(#arr)"/>
        <rect x="${x-70}" y="${y-22}" width="140" height="44" rx="6" fill="#1a2129" stroke="${color}"/>
        <text x="${x}" y="${y-7}" text-anchor="middle" fill="#e6edf3" font-size="11" font-weight="600">${itf._name}</text>
        <text x="${x}" y="${y+8}" text-anchor="middle" fill="#7d8590" font-size="10">${ip.split(' ')[0]||''}</text>
        <text x="${x}" y="${y+20}" text-anchor="middle" fill="${danger?'#ff4d4f':'#9ca3af'}" font-size="9">${allow||'-'}</text>`;
    }).join('')}
    <text x="20" y="20" fill="#7d8590" font-size="11">靜態路由 ${routes.length} 條</text>
  </svg>`;
  topo.innerHTML = svg;
}

// ============ 全文搜尋 ============
function viewRaw(){
  const html = `
  <div class="toolbar">
    <input type="search" id="rawQ" placeholder="🔍 在所有區塊中搜尋…（會搜全部欄位的值）" style="max-width:600px">
    <div class="counts" id="rawCnt"></div>
  </div>
  <div id="rawOut" class="scroll" style="padding:8px"></div>`;
  setTimeout(()=>{
    const q = document.getElementById('rawQ');
    const out = document.getElementById('rawOut');
    const cnt = document.getElementById('rawCnt');
    function run(){
      const kw = (q.value||'').toLowerCase();
      if(!kw){ out.innerHTML=''; cnt.textContent=''; return; }
      const results = [];
      Object.entries(S).forEach(([sec, items])=>{
        items.forEach(it=>{
          const hit = it._name.toLowerCase().includes(kw) ||
                      Object.entries(it._fields).some(([k,v])=>k.toLowerCase().includes(kw) || String(v).toLowerCase().includes(kw));
          if(hit) results.push([sec, it]);
        });
      });
      cnt.textContent = `命中 ${results.length} 項`;
      out.innerHTML = results.slice(0,500).map(([sec,it])=>`
        <details>
          <summary><span class="pill low">${sec}</span> ${it._name}</summary>
          <div class="body">${Object.entries(it._fields).map(([k,v])=>`<div><span style="color:#79c0ff">${k}</span> = ${String(v).replace(/</g,'&lt;')}</div>`).join('')}</div>
        </details>`).join('') + (results.length>500?'<div class="empty">…前 500 筆，請再縮小範圍</div>':'');
    }
    q.oninput = run;
  },0);
  return html;
}

// ============ Diff ============
function viewDiff(){
  return `
  <div class="card" style="margin-bottom:10px">
    <div class="label">多版本比對</div>
    <div class="sub" style="margin-top:4px">把另一份 .conf 全文貼到下方，會比對 firewall policy / address / admin 等關鍵段落的「新增 / 移除 / 修改」。</div>
  </div>
  <textarea class="diff-in" id="diffIn" placeholder="貼上另一份 .conf 的全文…"></textarea>
  <div class="toolbar">
    <button class="btn" onclick="runDiff()">▶ 開始比對</button>
    <span class="counts" id="diffCnt"></span>
  </div>
  <div id="diffOut"></div>`;
}
function runDiff(){
  const text = document.getElementById('diffIn').value;
  if(!text.trim()){ document.getElementById('diffOut').innerHTML='<div class="empty">請先貼上對照的設定檔</div>'; return;}
  // 簡易解析：抓 config X / edit Y / set k v / next / end
  const other = parseSimple(text);
  const targets = ['firewall policy','firewall address','firewall vip','system interface','system admin','router static','firewall service custom'];
  let out = '';
  let total = {add:0,del:0,mod:0};
  targets.forEach(sec=>{
    const A = Object.fromEntries((S[sec]||[]).map(it=>[it._name, it._fields]));
    const B = Object.fromEntries((other[sec]||[]).map(it=>[it._name, it._fields]));
    const added = Object.keys(B).filter(k=>!(k in A));
    const removed = Object.keys(A).filter(k=>!(k in B));
    const modified = Object.keys(A).filter(k=>k in B && JSON.stringify(A[k])!==JSON.stringify(B[k]));
    total.add+=added.length; total.del+=removed.length; total.mod+=modified.length;
    out += `<details ${added.length+removed.length+modified.length?'open':''}><summary>${sec} — <span class="pill on">+${added.length}</span> <span class="pill crit">-${removed.length}</span> <span class="pill med">~${modified.length}</span></summary><div class="body">`;
    added.forEach(k=> out += `<div class="diff-row diff-add">+ ${k}</div>`);
    removed.forEach(k=> out += `<div class="diff-row diff-del">- ${k}</div>`);
    modified.forEach(k=>{
      out += `<div class="diff-row diff-eq">~ ${k}</div>`;
      Object.keys({...A[k],...B[k]}).forEach(field=>{
        if(A[k][field]!==B[k][field]){
          out += `<div class="diff-row diff-del">    - ${field} = ${A[k][field]||'(無)'}</div>`;
          out += `<div class="diff-row diff-add">    + ${field} = ${B[k][field]||'(無)'}</div>`;
        }
      });
    });
    out += `</div></details>`;
  });
  document.getElementById('diffCnt').textContent = `新增 ${total.add} / 移除 ${total.del} / 修改 ${total.mod}`;
  document.getElementById('diffOut').innerHTML = out;
}
function parseSimple(text){
  const lines = text.split(/\r?\n/);
  const out = {};
  const stack = [];
  for(const raw of lines){
    const l = raw.trim();
    if(!l || l.startsWith('#')) continue;
    let m;
    if((m = l.match(/^config\s+(.+)$/))){ stack.push({type:'config',name:m[1]}); if(stack.filter(x=>x.type==='config').length===1) out[m[1]] = out[m[1]]||[]; continue;}
    if(l==='end'){ while(stack.length && stack[stack.length-1].type!=='config') stack.pop(); stack.pop(); continue;}
    if((m = l.match(/^edit\s+(.+)$/))){
      const name = m[1].replace(/^"|"$/g,'');
      const topCfg = stack.find(x=>x.type==='config')?.name;
      const item = {_name:name, _fields:{}};
      const parentEdit = [...stack].reverse().find(x=>x.type==='edit');
      if(!parentEdit && topCfg) (out[topCfg]=out[topCfg]||[]).push(item);
      stack.push({type:'edit', item}); continue;
    }
    if(l==='next'){ while(stack.length && stack[stack.length-1].type!=='edit') stack.pop(); stack.pop(); continue;}
    if((m = l.match(/^set\s+(\S+)\s*(.*)$/))){
      const e = [...stack].reverse().find(x=>x.type==='edit');
      if(e) e.item._fields[m[1]] = m[2].trim();
    }
  }
  return out;
}

// ============ 路由 ============
const views = {
  dashboard: viewDashboard, risks: viewRisks, policy: viewPolicy, address: viewAddress,
  vip: viewVip, service: viewService, interface: viewInterface, route: viewRoute,
  admin: viewAdmin, user: viewUser, vpn: viewVpn, dhcp: viewDhcp, utm: viewUtm,
  topo: viewTopo, raw: viewRaw, diff: viewDiff,
};
function show(tab){
  document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  document.getElementById('view').innerHTML = (views[tab]||viewDashboard)();
}
document.getElementById('tabs').addEventListener('click', e=>{
  if(e.target.dataset.tab) show(e.target.dataset.tab);
});
show('dashboard');
</script>
</body>
</html>
"""

with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
js = json.dumps(data, ensure_ascii=False).replace('</', '<\\/')
hostname = data['summary']['hostname']
html_out = template.replace('__DATA__', js).replace('__HOSTNAME__', hostname)
with open(sys.argv[2], 'w', encoding='utf-8') as f:
    f.write(html_out)
print(f"OK: {sys.argv[2]}  size={os.path.getsize(sys.argv[2])/1024:.1f} KB")
