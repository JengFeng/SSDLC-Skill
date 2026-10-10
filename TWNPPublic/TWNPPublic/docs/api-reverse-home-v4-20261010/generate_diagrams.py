"""Generate evidence-linked, offline HTML/SVG diagrams with Python standard library.

Layout follows cathrynlavery/diagram-design v2.6 (installed SSDLC vendor).
Only documentation in this directory is written; application source is read-only.
"""
from pathlib import Path
from html import escape
import hashlib
import json
import math
import re
import xml.etree.ElementTree as ET
from diagram_readability import render as readable_svg
from diagram_controls import CSS as CONTROL_CSS, SCRIPT as CONTROL_SCRIPT, toolbar

OUT = Path(__file__).resolve().parent
ROOT = OUT.parent.parent
PAPER, INK, MUTED, ACCENT = '#f7faf9', '#243d42', '#60777a', '#089bab'
CSS = """
:root{--paper:#f7faf9;--ink:#243d42;--muted:#60777a;--accent:#089bab}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:'Geist','Microsoft JhengHei','Segoe UI',sans-serif}
main{max-width:1440px;margin:auto;padding:40px 32px}h1,h2{font-family:'Instrument Serif','Noto Serif TC',Georgia,serif;font-weight:500}
h1{font-size:36px;margin:8px 0 16px}h2{font-size:28px;margin:8px 0 16px}h3{font-size:16px}
p,li{line-height:1.8}a{color:#087d8b}code,.eyebrow{font-family:'Geist Mono',Consolas,monospace}.eyebrow{font-size:11px;letter-spacing:.12em;color:var(--muted)}
section{padding:28px 0;border-top:1px solid #d5e2df;scroll-margin-top:20px}nav{line-height:2.2}nav a{display:inline-block;margin-right:20px}
.diagram{width:100%;overflow-x:auto;background:#fff;border:1px solid #d5e2df;border-radius:6px;padding:12px}
svg{display:block;width:100%;height:auto;min-width:0}table{border-collapse:collapse;width:100%;margin:16px 0;font-size:13px}
th,td{border-bottom:1px solid #d5e2df;text-align:left;padding:10px;vertical-align:top}th{background:#edf4f2}
.note{border-left:3px solid var(--accent);padding:12px 20px;background:#edf7f6}.foot{font-size:12px;color:var(--muted)}
details{margin:16px 0}summary{cursor:pointer;color:#087d8b}footer{border-top:1px solid #d5e2df;margin-top:32px;padding-top:16px}
@media print{main{padding:0}nav{display:none}.diagram{border:0;padding:0}svg{min-width:0}section{break-before:page}details>*{display:block}a{color:inherit}}
"""
SVG_CSS = """
.node{fill:#fff;stroke:#98b4b5;stroke-width:1.2}.focal{fill:#e8f6f6;stroke:#089bab;stroke-width:1.5}
.name{font-family:'Geist','Microsoft JhengHei',sans-serif;font-size:16px;font-weight:700;fill:#182f34}
.sub,.member,.tag,.label,.source{font-family:'Geist Mono','Microsoft JhengHei',monospace;fill:#40595d}
.sub,.member{font-size:13px}.tag{font-size:12px;font-weight:700}.label{font-size:10.5px;font-weight:700}.source{font-size:11px;font-weight:700}.group{font-family:'Geist','Microsoft JhengHei',sans-serif;font-size:17px;font-weight:700;fill:#182f34}
.edge{fill:none;stroke:#60777a;stroke-width:1.2}.sep{stroke:#d5e2df;stroke-width:1}.zone{fill:#f0f6f4;stroke:#d5e2df;stroke-width:1}
"""

CSS += """
table{font-size:16px}.eyebrow,.foot{font-size:14px;color:#304e54}
@media print{svg{min-width:0!important}}
"""
# Match the user's preferred previous page at 75% browser zoom, without requiring
# a browser-wide zoom setting. SVG uses the same explicit default percentage.
CSS += """
body{font-size:12px}main{max-width:none;width:100%;padding:24px clamp(12px,2vw,32px)}
h1{font-size:27px;margin:6px 0 12px}h2{font-size:21px;margin:6px 0 12px}h3{font-size:12px}
section{width:100%;padding:21px 0;scroll-margin-top:15px}.diagram{padding:9px}
table{font-size:12px;margin:12px 0}th,td{padding:7.5px}
.eyebrow,.foot{font-size:10.5px}.note{padding:9px 15px}
details{margin:12px 0}footer{margin-top:24px;padding-top:12px}
"""
CSS += CONTROL_CSS

# Locations refer to the snapshot captured in source-manifest.json.
EVIDENCE = {
 'E01': ('ViewModels/Home/HomeViewModel.cs', 1, 154, 'DTO／驗證屬性；HomeViewModel 本身為空類別'),
 'E02': ('Program.cs', 19, 45, 'HTTP middleware 與 MVC conventional route'),
 'E03': ('Startup.cs', 11, 63, '記憶體 Session、Cookie、MVC、WCF、DI'),
 'E04': ('Controllers/HomeController.cs', 33, 87, 'AccessToken：參數、帳號、grant_type、refresh 分支'),
 'E05': ('Controllers/HomeController.cs', 102, 146, 'ExternalLogin 與取消授權'),
 'E06': ('Controllers/HomeController.cs', 159, 213, 'LoginAPP：Token、帳號、水號、Session、Dashboard'),
 'E07': ('Controllers/HomeController.cs', 215, 261, '核發 AES/Base64Url Token；六個月驗證'),
 'E08': ('Controllers/HomeController.cs', 263, 370, '回應 DTO、callback query、expires_in、Base64Url'),
 'E09': ('Domain/Service/HomeService.cs', 83, 113, '以 B_ACCOUNT 的 PWD／APP_REFRESH_TOKEN 比對'),
 'E10': ('Domain/Service/HomeService.cs', 73, 81, '有效帳號查詢；沒有 LOGIN_TYPE／水表檢查'),
 'E11': ('Domain/Service/HomeService.cs', 121, 150, '全部有效綁定水號與覆寫 Token 欄位'),
 'E12': ('Domain/Service/HomeService.cs', 115, 119, '以 APWD 驗證 APP V4 帳密'),
 'E13': ('Controllers/HomeController.cs', 1308, 1380, 'Session 寫入與一次性驗證碼驗證'),
 'E14': ('Common/Attributes/SessionAuthorization.cs', 1, 21, 'UserName Session 決定登入授權'),
 'E15': ('../../SqlData/DapperDataAccess.cs', 14, 111, '參照專案：WCF ChannelService Query／Execute'),
 'E16': ('Controllers/HomeController.cs', 693, 767, 'DenyAppAcounnt：舊格式 Token 與 LOGIN_TYPE 更新'),
 'E17': ('Controllers/HomeController.cs', 372, 691, '#if false：不啟用的舊版 APP 流程'),
 'E18': ('Controllers/HomeController.cs', 1193, 1224, 'CreateValidate：JPEG 與五分鐘 Session 驗證碼'),
 'E19': ('Views/Home/ExternalLogin.cshtml', 1, 75, '授權 HTML、hidden fields、CSRF、captcha、取消'),
 'E20': ('Common/Security/PasswordHashUtil.cs', 28, 79, 'PBKDF2 驗證，失敗後兼容舊 AES 密碼'),
 'E21': ('Models/Entity/B_ACCOUNT.cs', 1, 24, '帳號 C# model；不是 SQL DDL'),
 'E22': ('Models/Entity/B_ACCOUNT_WATER_NO.cs', 1, 20, '水號綁定 C# model；不是 SQL DDL'),
 'E23': ('Controllers/BasicController.cs', 1, 12, 'SessionAuthorization／自動 CSRF Filter'),
 'E24': ('Controllers/DashboardController.cs', 23, 64, 'Dashboard 繼承 BasicController；首頁入口'),
 'E25': ('Domain/Extensions/DapperDataAccessExtensions.cs', 1, 20, 'IDapperDataAccess singleton 注入'),
 'E26': ('Domain/Service/HomeService.cs', 281, 292, 'DenyAccountFromApp 僅更新 LOGIN_TYPE=0'),
 'E27': ('Controllers/HomeController.cs', 1038, 1042, 'Logout 僅移除 UserName Session'),
 'E28': ('Common/Extension/AESEncryption.cs', 69, 191, 'AES 與由固定字串衍生的 Key／IV；不公開祕密值'),
 'E29': ('../../SqlData/DapperDataAccess.cs', 119, 170, 'SYS_LOG 前置寫入；可能早於主 Query／Execute 失敗'),
 'E30': ('Common/Extension/AspNetUser.cs', 6, 128, 'IAspNetUser 讀取 Session'),
 'E31': ('Views/Home/LoginAppAuthFailed.cshtml', 1, 23, 'LoginAPP 錯誤為 HTML 頁面'),
 'E32': ('TWNPPublic.csproj', 1, 25, '實際 target 為 net6.0'),
 'E33': ('Domain/Service/HomeService.cs', 11, 21, 'HomeService 注入 dataAccess 與 IAspNetUser'),
 'E34': ('Controllers/ContextController.cs', 1, 95, 'MVC 基底 Controller 與 MessageAPI 回應包裝'),
 'E35': ('Domain/Service/HomeService.cs', 556, 612, 'IHomeService 介面契約'),
 'E36': ('Controllers/HomeController.cs', 20, 31, 'HomeController 的繼承、欄位與建構式'),
}


def txt(x, y, value, cls='name', anchor='middle'):
    return f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}">{escape(str(value))}</text>'


def rect(x, y, w, h, cls='node', rx=6, extra=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" class="{cls}" {extra}/>'


def label(x, y, value):
    # Labels have an opaque mask; caller places baseline 11px above horizontal stroke.
    width = max(24, len(value) * 5.6 + 12)
    return f'<g data-label="true"><rect x="{x-width/2:g}" y="{y-12}" width="{width:g}" height="15" fill="{PAPER}" rx="2"/>{txt(x,y,value,"label")}</g>'


def rounded_path(points):
    points = [point for i, point in enumerate(points) if i == 0 or point != points[i-1]]
    result = f'M {points[0][0]},{points[0][1]}'
    for i, point in enumerate(points[1:], 1):
        prev = points[i-1]
        if i < len(points)-1:
            nxt = points[i+1]
            a = math.dist(prev, point)
            b = math.dist(point, nxt)
            radius = min(8, a/2, b/2)
            before = (point[0] + (prev[0]-point[0])*radius/a, point[1] + (prev[1]-point[1])*radius/a)
            after = (point[0] + (nxt[0]-point[0])*radius/b, point[1] + (nxt[1]-point[1])*radius/b)
            result += f' L {before[0]:g},{before[1]:g} Q {point[0]},{point[1]} {after[0]:g},{after[1]:g}'
        else:
            result += f' L {point[0]},{point[1]}'
    return result


class Diagram:
    def __init__(self, slug, title, kind, desc, note, width=1280, height=720):
        self.slug, self.title, self.kind, self.desc, self.note = slug, title, kind, desc, note
        self.width, self.height = width, height
        self.background, self.edges, self.nodes = [], [], []
        self.elements, self.boxes, self.routes, self.labels = [], {}, [], []

    def record(self, name, refs, role):
        assert refs and all(ref in EVIDENCE for ref in refs), (name, refs)
        self.elements.append({'element': name, 'role': role, 'evidence': refs})

    def box(self, key, x, y, w, h, name, lines, refs, focal=False, shape='rect', tag=''):
        assert all(v % 4 == 0 for v in (x, y, w, h))
        self.boxes[key] = (x, y, w, h)
        self.record(name + (' / ' + '；'.join(lines) if lines else ''), refs, 'node')
        cls = 'focal' if focal else 'node'
        if shape == 'diamond':
            node = f'<polygon points="{x+w/2},{y} {x+w},{y+h/2} {x+w/2},{y+h} {x},{y+h/2}" class="{cls}"/>'
        else:
            node = rect(x,y,w,h,cls,20 if shape=='oval' else 6)
        node += f'<title>{escape(name)} | {escape(", ".join(refs))}</title>'
        if tag:
            node += txt(x+12,y+16,tag,'tag','start')
        name_y = y+28 if tag else y+26
        node += txt(x+w/2,name_y,name)
        for i, line in enumerate(lines):
            node += txt(x+w/2,name_y+19+i*15,line,'sub')
        node += txt(x+w-10,y+h-9,'來源：'+' · '.join(refs),'source','end')
        self.nodes.append(f'<g data-node="{escape(key)}">{node}</g>')

    def port(self, key, side, offset=0):
        x,y,w,h = self.boxes[key]
        return {'left':(x,y+h/2+offset),'right':(x+w,y+h/2+offset),'top':(x+w/2+offset,y),'bottom':(x+w/2+offset,y+h)}[side]

    def edge(self, start, end, refs, name='', via=(), a='right', b='left', oa=0, ob=0, dashed=False, marker='arrow', at=None):
        points = [self.port(start,a,oa), *via, self.port(end,b,ob)]
        for p,q in zip(points,points[1:]):
            assert p[0]==q[0] or p[1]==q[1], (self.slug,start,end,p,q)
        self.record(f'{start} → {end}'+('：'+name if name else ''),refs,'relationship')
        self.routes.append({'from':start,'to':end,'points':points})
        dash = 'stroke-dasharray="5 4"' if dashed else ''
        mark = f'marker-end="url(#{self.slug}-{marker})"' if marker else ''
        self.edges.append(f'<path class="edge" d="{rounded_path(points)}" {dash} {mark}><title>{escape(name)} | {escape(", ".join(refs))}</title></path>')
        if name:
            if at is None:
                p,q = points[0],points[1]
                at = ((p[0]+q[0])/2,(p[1]+q[1])/2-11)
            self.edges.append(label(*at,name))

    def table(self, key,x,y,w,name,rows,refs,cls=False,focal=False):
        height = 56+len(rows)*24
        self.boxes[key] = (x,y,w,height)
        self.record(name+' / '+'；'.join(rows),refs,'class' if cls else 'table')
        body = rect(x,y,w,height,'focal' if focal else 'node')
        body += txt(x+w/2,y+24,name)
        body += f'<line class="sep" x1="{x}" y1="{y+36}" x2="{x+w}" y2="{y+36}"/>'
        for i,row in enumerate(rows):
            yy = y+52+i*24
            if row == '---':
                body += f'<line class="sep" x1="{x}" y1="{yy-8}" x2="{x+w}" y2="{yy-8}"/>'
            else:
                body += txt(x+12,yy,row,'member','start')
        body += txt(x+w-12,y+height-7,'來源：'+' · '.join(refs),'source','end')
        self.nodes.append(f'<g data-node="{key}">{body}</g>')

    def render_svg(self):
        s = self.slug
        defs = f'''<defs><style>{SVG_CSS}</style>
<marker id="{s}-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="{MUTED}"/></marker>
<marker id="{s}-open" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="none" stroke="{MUTED}"/></marker>
<marker id="{s}-triangle" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 Z" fill="{PAPER}" stroke="{MUTED}"/></marker></defs>'''
        legend = f'<line class="sep" x1="32" y1="{self.height-52}" x2="{self.width-32}" y2="{self.height-52}"/>'
        legend += txt(32,self.height-28,'來源 E##：E = Evidence（證據），數字是索引，非步驟／錯誤碼；完整檔名與行號見下方「來源編號索引」。','source','start')
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.width} {self.height}" role="img" aria-labelledby="{s}-title {s}-desc"><title id="{s}-title">{escape(self.title)}</title><desc id="{s}-desc">{escape(self.desc)}</desc>{defs}{"".join(self.background)}{"".join(self.edges)}{"".join(self.nodes)}{legend}</svg>'
        return readable_svg(svg,self)

    def evidence_html(self):
        refs = sorted({e for element in self.elements for e in element['evidence']})
        rows = ''.join(f'<tr><td>{ref}</td><td><code>{escape(EVIDENCE[ref][0])}:{EVIDENCE[ref][1]}–{EVIDENCE[ref][2]}</code></td><td>{escape(EVIDENCE[ref][3])}</td></tr>' for ref in refs)
        mapping = ''.join(f'<tr><td>{escape(e["element"])}</td><td>{escape(e["role"])}</td><td>{", ".join(e["evidence"])}</td></tr>' for e in self.elements)
        return f'<details><summary>來源編號索引與圖面元素對照（{len(self.elements)} 個元素）</summary><p>圖中的「來源：E09」表示該節點或連線有 E09 這筆程式碼證據。下表可用編號查到原始檔、行號及該段程式的摘要；多個編號表示有多處程式共同支持。</p><table><thead><tr><th>證據編號</th><th>原始碼位置</th><th>內容摘要</th></tr></thead><tbody>{rows}</tbody></table><table><thead><tr><th>節點／關係／欄位</th><th>種類</th><th>來源編號</th></tr></thead><tbody>{mapping}</tbody></table></details>'

    def section(self):
        return f'<section id="{self.slug}"><p class="eyebrow">{escape(self.kind)} · 原始碼逆向分析</p><h2>{escape(self.title)}</h2><p>{escape(self.desc)}</p>{toolbar(self.slug)}<div class="diagram" id="{self.slug}-frame" tabindex="0" role="region" aria-label="{escape(self.title)}，可捲動的自適應圖表">{self.render_svg()}</div><p class="foot">圖面預設依頁面可用寬度自動 fit，視窗大小改變時會重新調整。文字大小按鈕以目前圖框寬度為基準；超過 100% 時可左右捲動。來源編號不是步驟或錯誤碼；較小框的來源放在滑鼠提示與下方證據表。</p><p class="note">{escape(self.note)}</p>{self.evidence_html()}</section>'


DIAGRAMS = []


def new(slug,title,kind,desc,note,width=1280,height=720):
    diagram = Diagram(slug,title,kind,desc,note,width,height)
    DIAGRAMS.append(diagram)
    return diagram


def architecture():
    d = new('01-architecture','外部 APP 到網站及資料庫的架構','Architecture',
        '外部 APP 透過 MVC HomeController 取得金鑰與登入；HomeService 經 WCF 代理讀寫帳號，登入後改由 Session 存取網站。',
        'SqlData 為 csproj 直接參照的外部依賴，僅追查其呼叫邊界。WCF 伺服端／SQL DDL 未提供；SQL 執行邊界用虛線標示。net6.0；沒有把本流程畫成 EF Core 或 JWT。')
    for key,x,y,name,lines,refs in [
      ('app',40,100,'外部 APP／瀏覽器',['form POST / callback'],['E04','E19']),
      ('home',360,100,'HomeController',['AccessToken / ExternalLogin','LoginAPP'],['E04','E05','E06']),
      ('svc',680,100,'HomeService',['IHomeService','帳號、密碼、Token、水號'],['E09','E10','E11','E12']),
      ('proxy',1000,100,'DapperDataAccess',['IDapperDataAccess','WCF client'],['E15','E25']),
      ('db',1000,396,'SQL Server TWN',['B_ACCOUNT','B_ACCOUNT_WATER_NO'],['E09','E11']),
      ('session',360,396,'記憶體 Session',['.TWNP.Session','UserName / CurrentWaterNo'],['E03','E13']),
      ('dash',680,396,'DashboardController',['BasicController','SessionAuthorization'],['E14','E23','E24'])]:
        d.box(key,x,y,240,112,name,lines,refs,focal=key=='home',tag='COMPONENT')
    d.edge('app','home',['E04','E05','E06'],'HTTP FORM')
    d.edge('home','svc',['E33'],'SERVICE')
    d.edge('svc','proxy',['E15','E33'],'SQL + PARAM')
    d.edge('proxy','db',['E09','E11','E15'],'WCF → SQL ?',a='bottom',b='top',dashed=True,at=(1190,310))
    d.edge('home','session',['E06','E13'],'SET SESSION',a='bottom',b='top',at=(565,310))
    d.edge('session','dash',['E14','E23'],'AUTH FILTER')


def swimlane():
    d = new('02-swimlane','首次授權：責任與交接','Swimlane',
      '從 APP 請求、網站授權頁、使用者輸入，到密碼驗證、資料庫存入金鑰並回到 APP。',
      '主成功路徑；錯誤分支見 Flowchart。APP callback 的實際接收／保存實作未提供，圖中最後一步僅代表伺服器導向指定 URI。')
    lanes = ['外部 APP／瀏覽器','使用者／授權頁','HomeController','HomeService／WCF','SQL Server（邊界）']
    for i,lane in enumerate(lanes):
        y=60+i*104
        d.background.append(rect(32,y,1216,104,'zone',0)+txt(108,y+56,lane,'sub'))
    entries=[('a',200,0,'送出授權請求',['authorization_code'],['E04']),('b',328,2,'回傳授權頁',['ExternalLogin'],['E04']),('c',456,1,'輸入帳密／驗證碼',['AntiForgeryToken'],['E19']),('d',584,2,'檢查授權請求',['Captcha + Account'],['E05']),('e',712,3,'驗證 APWD',['PasswordHashUtil'],['E12','E20']),('f',840,2,'核發金鑰',['IssueAppToken'],['E07']),('g',968,4,'覆寫金鑰欄位',['PWD / refresh'],['E11']),('h',1096,0,'導向 callback',['result=200'],['E08'])]
    for key,x,lane,name,lines,refs in entries:
        d.box(key,x,80+lane*104,112,64,name,lines,refs)
    for left,right in zip(entries,entries[1:]):
        a,b=left[0],right[0]; p=d.port(a,'right'); q=d.port(b,'top' if right[2]>left[2] else 'bottom')
        d.edge(a,b,list(dict.fromkeys(left[5]+right[5])),via=[(q[0],p[1])],b='top' if right[2]>left[2] else 'bottom')
    d.note += ' 泳道壓縮 Service／WCF 的往返；精確訊息先後見 Sequence。'


def pipeline(slug,title,kind,desc,note,lanes,entries):
    # Vendor process/data-flow deterministic fit preset: 140 + n*112 + 28; lanes 80 high.
    d = new(slug,title,kind,desc,note,140+len(entries)*112+28,36+len(lanes)*80+80)
    for i,lane in enumerate(lanes):
        d.background.append(rect(140,36+i*80,d.width-140,80,'zone',0)+txt(70,80+i*80,lane,'sub'))
    for j,(lane,name,sub,tool,refs,chips) in enumerate(entries):
        x,y=148+j*112,44+lane*80
        d.background.append(txt(x+50,16,f'{j+1:02d}','tag')+txt(x+50,30,name,'tag'))
        key=f'n{j}'
        d.box(key,x,y,100,64,name,[sub,tool],refs,focal=j==len(entries)-2)
        d.nodes[-1] = f'<g data-node="{key}">{rect(x,y,100,64,"focal" if j==len(entries)-2 else "node")}<title>{escape(" · ".join(refs))}</title>{txt(x+50,y+18,name)}{txt(x+50,y+31,sub,"sub")}{txt(x+50,y+44,tool,"tag")}</g>'
        if chips[0] and j:
            d.nodes.append(txt(x+6,y+56,'IN:'+chips[0],'tag','start'))
        if chips[1] and j<len(entries)-1:
            d.nodes.append(txt(x+94,y+56,'OUT:'+chips[1],'tag','end'))
        if j:
            prev=entries[j-1][0]
            if prev==lane:
                d.edge(f'n{j-1}',key,refs)
            else:
                p=d.port(f'n{j-1}','right'); q=d.port(key,'top' if lane>prev else 'bottom')
                d.edge(f'n{j-1}',key,refs,via=[(q[0],p[1])],b='top' if lane>prev else 'bottom')
    return d


def flows():
    d=new('04-flowchart-access','AccessToken：入口分流','Flowchart',
      '依序驗證欄位、有效帳號與 grant_type，進入首次授權、換發或錯誤回應。',
      '1002 訊息雖為「用戶尚未使用智慧水表」，實際只檢查 B_ACCOUNT 存在且 VALID=1；沒有查 A_PH_METER_LIST。錯誤 result 不是 HTTP status。')
    for key,y,name,lines,refs,shape in [('start',32,'POST /Home/AccessToken',[],['E02','E04'],'oval'),('valid',136,'ModelState 有效？',[],['E01','E04'],'diamond'),('acct',280,'有效帳號存在？',[],['E04','E10'],'diamond'),('grant',424,'grant_type？',[],['E04'],'diamond')]:
        d.box(key,400,y,240,80,name,lines,refs,shape=shape)
    d.box('err1',848,136,240,80,'回應 result=1001',['參數錯誤'],['E04','E08'])
    d.box('err2',848,280,240,80,'回應 result=1002',['有效帳號不存在'],['E04','E08'])
    d.box('auth',40,424,240,80,'顯示 ExternalLogin',['authorization_code'],['E04','E19'])
    d.box('refresh',848,424,240,80,'进入 refresh 流程',['見 05 Flowchart'],['E04'])
    d.box('badgrant',400,568,240,80,'回應 result=1001',['不支援的 grant_type'],['E04','E08'])
    d.edge('start','valid',['E04'],a='bottom',b='top')
    d.edge('valid','acct',['E04'],'YES',a='bottom',b='top',at=(556,256))
    d.edge('valid','err1',['E04'],'NO')
    d.edge('acct','grant',['E04'],'YES',a='bottom',b='top',at=(556,400))
    d.edge('acct','err2',['E04'],'NO')
    d.edge('grant','auth',['E04'],'AUTH CODE',a='left',b='right')
    d.edge('grant','refresh',['E04'],'REFRESH')
    d.edge('grant','badgrant',['E04'],'OTHER',a='bottom',b='top',at=(556,544))
    d=new('05-flowchart-refresh','Refresh Token：直接換發或重新驗證','Flowchart',
      '有效帳號且 grant_type=refresh_token 後，檢查 refresh_token；資料庫命中則直接覆寫新金鑰，未命中則顯示授權頁。',
      'Refresh 路徑沒有檢查 access_token 是否過期，也没有解析 refresh_token 的時戳；依 DB 值匹配及帳號 VALID=1 判定。')
    d.box('entry',400,48,240,64,'進入 refresh 分支',[],['E04'],shape='oval')
    d.box('nonempty',400,168,240,80,'refresh_token 非空？',[],['E04'],shape='diamond')
    d.box('match',400,312,240,80,'DB refresh 命中？',[],['E04','E09'],shape='diamond')
    d.box('issue',400,464,240,80,'IssueAppToken',['覆寫 PWD 與 refresh'],['E07','E11'],focal=True)
    d.box('ok',400,584,240,64,'回應 result=200',['換發金鑰成功'],['E04','E08'],shape='oval')
    d.box('bad',856,168,240,80,'回應 result=1001',['refresh_token 空白'],['E04','E08'])
    d.box('relogin',856,312,240,80,'顯示 ExternalLogin',['GrantType=refresh_token'],['E04','E19'])
    d.edge('entry','nonempty',['E04'],a='bottom',b='top')
    d.edge('nonempty','match',['E04'],'YES',a='bottom',b='top',at=(560,288))
    d.edge('nonempty','bad',['E04'],'NO')
    d.edge('match','issue',['E04','E09'],'YES',a='bottom',b='top',at=(560,440))
    d.edge('match','relogin',['E04'],'NO')
    d.edge('issue','ok',['E04','E07'],a='bottom',b='top')
    d=new('06-flowchart-external','ExternalLogin：驗證與重新顯示頁面','Flowchart',
      '表單通過 CSRF 後，檢查 ModelState、一次性驗證碼、帳號一致性與 APWD；成功核發金鑰。',
      'CSRF 由框架先處理，失敗不進入 Action。驗證碼在實際 ValidateCaptcha 呼叫時立即移除；帳密錯誤後也要重新取得驗證碼。各失敗節點不會回傳 1004 callback。')
    for key,y,name,refs in [('model',80,'ModelState 有效？',['E05','E01']),('captcha',208,'Captcha 有效？',['E05','E13']),('account',336,'AccountNo=Account？',['E05']),('pwd',464,'APWD 驗證成功？',['E05','E12','E20'])]:
        d.box(key,400,y,240,80,name,[],refs,shape='diamond')
    for key,y,reason in [('model',80,'欄位錯誤'),('captcha',208,'驗證碼錯誤／過期／已使用'),('account',336,'帳號與 AccountNo 不一致'),('pwd',464,'APWD 密碼驗證失敗')]:
        d.box('fail-'+key,848,y,272,80,'重新顯示 ExternalLogin',[reason],['E05','E19'])
        d.edge(key,'fail-'+key,['E05'],'NO')
    d.box('issue',400,600,240,64,'核發 → callback 200',['IssueAppToken'],['E05','E07','E08'],focal=True)
    for a,b in [('model','captcha'),('captcha','account'),('account','pwd')]:
        p=d.port(a,'bottom');q=d.port(b,'top')
        d.edge(a,b,['E05'],'YES',a='bottom',b='top',at=(558,(p[1]+q[1])/2))
    d.edge('pwd','issue',['E05','E07'],'YES',a='bottom',b='top',at=(558,578))
    d=new('07-flowchart-login','LoginAPP：Token 到網站登入','Flowchart',
      '檢查請求與 Token，再取得帳號和有效綁定水號，成功建立 Session 並轉往 Dashboard。',
      'IsValidAppToken 會解密並比對帳號與六個月期限。GetAppV4WaterNos 未使用 WaterNo 參數；取全部有效綁定並 ORDER BY WATER_NO，再用 First() 作為 CurrentWaterNo。失敗是 HTML。')
    for key,y,name,refs,shape in [('start',24,'POST /Home/LoginAPP',['E02','E06'],'oval'),('model',120,'ModelState 有效？',['E01','E06'],'diamond'),('token',264,'DB Token + AES 有效？',['E06','E07','E09'],'diamond'),('acct',408,'帳號與水號清單存在？',['E06','E10','E11'],'diamond')]:
        d.box(key,400,y,240,80,name,[],refs,shape=shape)
    d.box('invalid',848,120,240,80,'HTML：1001',['LoginAppAuthFailed'],['E06','E31'])
    d.box('fail',848,336,240,80,'HTML：1004',['Token／帳號／清單失敗'],['E06','E31'])
    d.box('session',400,552,240,80,'SetLoginSession',['→ /Dashboard/Index'],['E06','E13'],focal=True)
    d.edge('start','model',['E06'],a='bottom',b='top')
    d.edge('model','token',['E06'],'YES',a='bottom',b='top',at=(560,244))
    d.edge('model','invalid',['E06'],'NO')
    d.edge('token','acct',['E06'],'YES',a='bottom',b='top',at=(560,388))
    d.edge('token','fail',['E06'],'NO',via=[(720,304),(720,356)],ob=-20,at=(688,293))
    d.edge('acct','fail',['E06'],'NO',via=[(768,448),(768,396)],ob=20,at=(712,437))
    d.edge('acct','session',['E06'],'YES',a='bottom',b='top',at=(560,532))


def data_models():
    d=new('10-er','APP 介接的邏輯資料關係','ER',
      '有效帳號可取得零到多筆水號綁定；Token 實際存於帳號，DTO 僅為查詢或回應投影。',
      '1→0..* 是依查詢還原的邏輯關係，SQL PK／FK／唯一性約束未確認。AppTokenInfoDto 不是實體 Token 表；WATER_NO 由 @WaterNo 投影，EXPIRES_AT 未由 token 查詢 SQL 回填。')
    d.table('acct',64,160,320,'b_ACCOUNT（帳號）',['B_ACCOUNT_SN : int','B_ACCOUNT : string','APWD : string（驗證密碼）','PWD : string（access token）','APP_REFRESH_TOKEN : string?','VALID : decimal'],['E21','E09','E12'],focal=True)
    d.table('water',864,160,320,'B_ACCOUNT_WATER_NO（綁定）',['B_ACCOUNT_SN : int（邏輯关联）','WATER_NO : string','VALID : decimal','NICK_NAME : string','NICK_NAME_SHOW : decimal?'],['E22','E11'])
    d.edge('acct','water',['E11','E21','E22'],'HAS BINDINGS',dashed=True,marker=None,ob=12)
    d.edges.extend([label(408,249,'1'),label(840,249,'0..*')])
    d.box('dto',464,480,320,112,'AppTokenInfoDto（投影）',['ACCOUNT_NO / WATER_NO','ACCESS_TOKEN / REFRESH_TOKEN'],['E01','E09'])
    d.edge('acct','dto',['E09'],'PROJECT',a='bottom',b='top',via=[(224,440),(624,440)],dashed=True,at=(424,429))
    d=new('11-db-schema','資料庫 Schema：可觀察欄位與未知約束','DB Schema',
      '依服務 SQL 與 Entity models 還原兩張核心資料表的欄位使用，連線落在 B_ACCOUNT_SN 欄位層級。',
      '未提供 DDL：右側標的是已觀察 CLR 型別，不是 SQL 型別。SQL 型別／長度／nullable／PK／FK／indexes／ON DELETE 都待確認，不捏造建表 SQL。只列核心欄位；完整 C# 欄位見分析報告。')
    rows1=['B_ACCOUNT_SN | CLR int; SQL ?','B_ACCOUNT | CLR string; SQL ?','APWD | CLR string; SQL ?','PWD | CLR string; SQL ?','APP_REFRESH_TOKEN | CLR string?; SQL ?','VALID | CLR decimal; SQL ?','ST_DATE | CLR DateTime?; SQL ?','EN_DATE | CLR DateTime?; SQL ?']
    rows2=['B_ACCOUNT_SN | CLR int; SQL ?','WATER_NO | CLR string; SQL ?','VALID | CLR decimal; SQL ?','ST_DATE | CLR DateTime?; SQL ?','EN_DATE | CLR DateTime?; SQL ?','NICK_NAME | CLR string; SQL ?','NICK_NAME_SHOW | CLR decimal?; SQL ?']
    d.table('acct',64,160,384,'TWN.dbo.B_ACCOUNT',rows1,['E09','E11','E21'])
    d.table('water',800,160,384,'TWN.dbo.B_ACCOUNT_WATER_NO',rows2,['E11','E22'])
    # Column-center connection; no FK asserted without DDL.
    d.edge('water','acct',['E11'],'FK / ON DELETE ?',oa=-64,ob=-76,dashed=True,marker=None,a='left',b='right',at=(624,197))


def sequence(slug,title,desc,note,actors,messages):
    d=new(slug,title,'Sequence',desc,note)
    slot = int(1024/(len(actors)-1)/4)*4
    xs=[128+i*slot for i in range(len(actors))]
    for i,(name,refs) in enumerate(actors):
        x=xs[i]
        d.background.append(f'<line class="sep" x1="{x:g}" y1="104" x2="{x:g}" y2="644" stroke-dasharray="4 4"/>')
        d.box(f'a{i}',int(x-96),32,192,64,name,[],refs,tag='LIFELINE')
    for i,(a,b,name,refs,ret) in enumerate(messages):
        y=136+i*44
        d.record(name,refs,'message')
        dash='stroke-dasharray="5 4"' if ret else ''
        if a==b:
            path=rounded_path([(xs[a],y),(xs[a]+64,y),(xs[a]+64,y+20),(xs[a],y+20)])
            d.edges.append(f'<path class="edge" d="{path}" {dash} marker-end="url(#{slug}-arrow)"/>')
            d.edges.append(label(xs[a]+104,y-11,name))
        else:
            d.edges.append(f'<path class="edge" d="M{xs[a]:g},{y} H{xs[b]:g}" {dash} marker-end="url(#{slug}-arrow)"><title>{escape(", ".join(refs))}</title></path>')
            d.edges.append(label((xs[a]+xs[b])/2,y-11,f'{i+1:02d} {name}'))
    return d


def sequences():
    actors=[('APP／瀏覽器',['E19','E04']),('HomeController',['E04','E05']),('HomeService',['E12','E11']),('WCF／DB 邊界',['E15','E09'])]
    sequence('12-sequence-authorization','首次授權的訊息順序',
      'APP 先取得授權頁，使用者送出帳密後核發及儲存金鑰，最後由 302 callback 回傳 APP。',
      '合併 WCF／DB 為一條 lifeline，未主張已取得伺服端程式。Captcha 圖片請求與 CSRF 由流程圖／證據說明。authorization_code 是分支名稱；程式沒有中介授權碼交換。',actors,[
      (0,1,'POST AccessToken / authorization_code',['E04'],False),(1,2,'GetAppV4Account',['E04','E10'],False),(2,3,'Query B_ACCOUNT',['E10','E15'],False),(3,2,'有效帳號',['E10'],True),(2,1,'帳號',['E10'],True),(1,0,'200 HTML ExternalLogin',['E04','E19'],True),(0,1,'POST ExternalLogin + CSRF + Captcha',['E05','E19'],False),(1,2,'ValidateAppV4Password → APWD',['E12','E20'],False),(2,1,'true（含 WCF 查詢與密碼比較）',['E12'],True),(1,2,'IssueAppToken → SaveAppV4TokenToPwd',['E07','E11'],False),(2,3,'Execute UPDATE PWD / refresh',['E11','E15'],False),(1,0,'302 callback query：result=200 + Tokens',['E05','E08'],True)])
    sequence('13-sequence-refresh','有效 Refresh Token 的訊息順序',
      'APP 提供 DB 中目前 refresh_token 時，伺服器直接產生並保存下一組 Token，舊組被覆寫。',
      '主成功路徑。未命中時回 ExternalLogin HTML；參數空白回 1001。Execute 回傳 affected rows，但 SaveAppV4TokenToPwd 沒有檢查此數值。',actors,[
      (0,1,'POST AccessToken / refresh_token',['E04'],False),(1,2,'GetAppV4Account',['E04','E10'],False),(2,1,'有效帳號（內含 WCF 查詢）',['E10','E15'],True),(1,2,'GetAppV4TokenByRefreshToken',['E04','E09'],False),(2,3,'Query account + VALID + refresh',['E09','E15'],False),(3,2,'目前 Token DTO',['E09'],True),(2,1,'Token 命中',['E09'],True),(1,2,'IssueAppToken → SaveAppV4TokenToPwd',['E07','E11'],False),(2,3,'Execute UPDATE PWD / refresh',['E11'],False),(3,2,'affected rows（未檢查）',['E11','E15'],True),(2,1,'完成；未檢查更新筆數',['E11'],True),(1,0,'302 callback：200 + 新 Token',['E04','E08'],True)])
    sequence('14-sequence-login','LoginAPP：金鑰驗證後建立網站 Session',
      'APP POST Token，網站比對 DB 與 AES 期限後取帳號水號，写入 Session，瀏覽器再請求受保護的 Dashboard。',
      'Session／Dashboard 合併為網站邊界，六個 Session 欄位見 Data-flow。APP、授權頁與 Dashboard 的 Cookie 如何在手機 WebView 間共享，需要實際 APP 才能驗證。',[
      ('APP／瀏覽器',['E06']),('HomeController',['E06']),('HomeService／WCF',['E09','E11','E15']),('Session／Dashboard',['E13','E14','E24'])],[
      (0,1,'POST LoginAPP：account / water / access',['E06'],False),(1,2,'GetAppV4TokenByAccessToken',['E06','E09'],False),(2,1,'DB token match（或 null）',['E09'],True),(1,1,'AES 帳號與期限驗證',['E07'],False),(1,2,'GetAppV4Account',['E06','E10'],False),(2,1,'有效帳號',['E10'],True),(1,2,'GetAppV4WaterNos：ALL VALID ORDER BY WATER_NO',['E11'],False),(2,1,'完整綁定水號清單',['E11'],True),(1,3,'SetLoginSession；First() 為目前水號',['E06','E13'],False),(1,0,'302 /Dashboard/Index',['E06'],True),(0,3,'GET Dashboard + .TWNP.Session',['E03','E24'],False),(3,0,'SessionAuthorization 通過後回首頁',['E14','E23','E24'],True)])


def states():
    d=new('15-state-token','Token 的可用狀態（由條件推導）','State',
      '以 LoginAPP 是否接受一組 Token 為狀態，呈現六個月期限、覆寫與帳號失效的效果。',
      '這些是依程式條件推導的狀態，沒有資料庫 STATE enum 或排程更新。Refresh 可在 access 過期後換發，只要目前 refresh 匹配且帳號有效；新核發描述新的一組凭證，不是恢復舊值。')
    for key,x,y,name,lines,refs in [
      ('absent',64,80,'沒有可用 V4 金鑰',['需帳密授權'],['E05','E07']),('valid',480,80,'可通過 Token 驗證',['DB 匹配 + VALID=1','Now ≤ issuedAt+6 months'],['E07','E09']),('expired',896,80,'Access 超過期限',['LoginAPP → 1004 HTML'],['E06','E07']),('replaced',64,400,'舊憑證已被覆寫',['舊 access / refresh 不匹配'],['E09','E11']),('disabled',896,400,'帳號 VALID ≠ 1',['查詢無命中'],['E09','E10'])]:
        d.box(key,x,y,240,112,name,lines,refs,focal=key=='valid')
    d.edge('absent','valid',['E05','E07'],'AUTHORIZE')
    d.edge('valid','expired',['E07'],'TIME > 6 MONTH')
    d.edge('valid','replaced',['E07','E11'],'NEW ISSUE',a='bottom',b='top',oa=-64,via=[(536,320),(184,320)],at=(360,309))
    d.edge('valid','disabled',['E09'],'VALID ≠ 1',a='bottom',b='top',oa=64,via=[(664,352),(1016,352)],at=(840,341))
    d.edge('expired','valid',['E04','E09','E11'],'REFRESH MATCH / NEW TOKENS',a='top',b='top',via=[(1016,40),(600,40)],dashed=True,at=(808,29))
    d.edge('replaced','valid',['E04','E05','E07'],'REAUTHORIZE / NEW TOKENS',a='left',b='left',ob=24,via=[(32,456),(32,248),(448,248),(448,160)],dashed=True,at=(256,237))
    d=new('16-state-session','瀏覽器的授權與 Session 狀態','State',
      '外部帳密授權只核發金鑰；LoginAPP 才建立網站登入 Session。取消授權、Logout 與 Session 不存在有不同結果。',
      '推導狀態，不是程式 enum。Session 閒置期限設定為 3600 秒且使用記憶體 cache；實際手機 Cookie／節點重啟後行為需執行驗證。Logout 僅移除 UserName，沒有清除 Token 或全部 Session。')
    for key,x,y,name,lines,refs in [('out',64,80,'尚未登入網站',['UserName 不存在'],['E14']),('form',480,80,'外部授權頁',['等待帳密／驗證碼'],['E04','E19']),('token',896,80,'APP 已取得金鑰',['尚未建立登入 Session'],['E05','E07']),('login',896,400,'網站 Session 已登入',['UserName / 水號清單'],['E06','E13']),('cancel',480,400,'已取消此次授權',['1003 或 refresh 的 1005'],['E05'])]:
        d.box(key,x,y,240,112,name,lines,refs,focal=key=='login')
    d.edge('out','form',['E04'],'AUTH CODE')
    d.edge('form','token',['E05'],'PASSWORD OK')
    d.edge('token','login',['E06','E13'],'LoginAPP [VALID]',a='bottom',b='top',at=(1112,310))
    d.edge('form','cancel',['E05'],'CANCEL',a='bottom',b='top',at=(688,310))
    d.edge('login','out',['E27','E14','E03'],'LOGOUT / SESSION ABSENT',a='bottom',b='bottom',via=[(1016,600),(184,600)],at=(600,589))


def classes():
    d=new('17-uml-class-components','Controller、Service 與依賴的類別結構','UML Class',
      'HomeController 繼承 ContextController 並使用 IHomeService；HomeService 實作介面，使用資料代理與密碼工具。',
      '只列目前 APP V4 相關成員。虚線空心三角＝實作；實線空心三角＝繼承；虛線開放箭頭＝使用依賴。成員的 + / - 是實際 public / private。完整 UML 圖例：繼承 △、實作 - - △、依賴 - - >、關聯 →、聚合 ◇、組合 ◆；本圖只使用前三種。')
    specs=[
      ('home',64,56,320,'HomeController',['- homeService: IHomeService','---','+ AccessToken(model): IActionResult','+ ExternalLogin(model): IActionResult','+ LoginAPP(model): IActionResult','- IssueAppToken(...): AppTokenInfoDto','- IsValidAppToken(...): bool'],['E04','E05','E06','E07']),
      ('iface',480,56,320,'«interface» IHomeService',['+ GetAppV4Account(...): b_ACCOUNT?','+ ValidateAppV4Password(...): bool','+ GetAppV4TokenByAccessToken(...)','+ GetAppV4TokenByRefreshToken(...)','+ SaveAppV4TokenToPwd(...): void'],['E35']),
      ('context',896,56,320,'ContextController',['+ Success(...): MessageAPI','+ Failed(...): MessageAPI'],['E34']),
      ('svc',480,408,320,'HomeService',['- dataAccess: IDapperDataAccess','- _aspNetUser: IAspNetUser','---','+ ValidateAppV4Password(...): bool','+ GetAppV4WaterNos(...): List','+ SaveAppV4TokenToPwd(...): void'],['E11','E12','E33']),
      ('data',64,408,320,'«interface» IDapperDataAccess',['+ Query<T>(sql, parameters): List<T>','+ Execute(sql, parameters): int'],['E15']),
      ('pwd',896,408,320,'«static» PasswordHashUtil',['+ VerifyPassword(...): bool','+ VerifyPasswordOrLegacyAes(...): bool'],['E20'])]
    for key,x,y,w,name,rows,refs in specs:d.table(key,x,y,w,name,rows,refs,cls=True,focal=key=='home')
    d.edge('home','iface',['E33'],'USES',dashed=True,marker='open',oa=-24,ob=0,via=[(432,144),(432,144)])
    d.edge('home','context',['E36'],'EXTENDS',a='top',b='top',via=[(224,24),(1056,24)],marker='triangle',at=(640,13))
    d.edge('svc','iface',['E33'],'IMPLEMENTS',a='top',b='bottom',dashed=True,marker='triangle',at=(720,368))
    d.edge('svc','data',['E33','E15'],'USES',a='left',b='right',oa=-36,ob=12,dashed=True,marker='open')
    d.edge('svc','pwd',['E12','E20'],'USES',oa=-36,ob=12,dashed=True,marker='open')
    d=new('18-uml-class-contracts','API 請求、回應與查詢 DTO','UML Class',
      '依 HomeViewModel.cs 還原啟用中的 APP V4 請求、表單、回應及內部 Token DTO，Controller 連結為使用依賴。',
      '資料模型無繼承關係；只畫依賴，不把 DTO 畫成資料表。每個欄位仍由實際 ViewModel 對照。+ N more 明示被省略欄位，完整契約見報告。 UML 圖例同 17：本圖只使用依賴 - - >。')
    for key,x,y,name,rows,refs in [
      ('request',64,48,'AppAccessTokenV4RequestVm',['+ grant_type: string [Required]','+ refresh_token: string?','+ account_no: string [Required]','+ water_no: string [Required]','+ redirect_uri: string [Required]'],['E01']),
      ('home',480,48,'HomeController',['+ AccessToken(request): IActionResult','+ ExternalLogin(form): IActionResult','+ LoginAPP(request): IActionResult'],['E04','E05','E06']),
      ('login',896,48,'LoginAppV4Vm',['+ account_no: string [Required]','+ water_no: string [Required]','+ access_token: string [Required]'],['E01']),
      ('external',64,416,'ExternalLoginViewModel',['+ Account / Password: string [Required]','+ CapthCode: string [Required]','+ GrantType / AccountNo: string','+ WaterNo / RedirectUri: string'],['E01','E19']),
      ('response',480,416,'AppTokenV4ResponseVm',['+ account_no / water_no: string','+ result: int; message: string','+ access_token: string?','+ expires_in / refresh_token: string?'],['E01','E08']),
      ('dto',896,416,'AppTokenInfoDto',['+ ACCOUNT_NO / WATER_NO: string','+ ACCESS_TOKEN / REFRESH_TOKEN: string','+ EXPIRES_AT: DateTime','+ VALID: decimal?'],['E01','E09'])]:d.table(key,x,y,320,name,rows,refs,cls=True,focal=key=='home')
    d.edge('home','request',['E04','E01'],'USES',a='left',b='right',oa=-24,ob=-48,dashed=True,marker='open')
    d.edge('home','login',['E06','E01'],'USES',oa=-24,ob=-24,dashed=True,marker='open')
    d.edge('home','response',['E08','E01'],'RETURNS',a='bottom',b='top',dashed=True,marker='open',at=(720,328))
    d.edge('home','external',['E05','E01'],'USES',a='bottom',b='top',oa=-96,via=[(544,352),(224,352)],dashed=True,marker='open',at=(384,341))
    d.edge('home','dto',['E07','E01'],'USES',a='bottom',b='top',oa=96,via=[(736,384),(1056,384)],dashed=True,marker='open',at=(904,373))


def build_all():
    architecture();swimlane()
    pipeline('03-process','首次授權：步驟、輸入輸出與工具','Process',
      '將外部 APP、Controller、Service 和資料端的責任按主成功路徑排列，並標出輸入輸出的資料形式。',
      '使用 vendor 的 fit 公式；WB=HTTP 表單／回應，DB=持久化資料，TB=查詢結果。密碼與 Token 只標示欄位名，不展示真值。回傳頁面與 callback 跨請求，詳見 Sequence。',
      ['外部 APP／頁面','HomeController','HomeService','WCF／SQL 邊界'],[
      (0,'請求授權','grant_type=code','APP',['E04'],(None,'WB')),
      (1,'顯示表單','有效帳號','MVC View',['E04','E19'],('WB','WB')),
      (0,'送出帳密','CSRF + Captcha','HTML form',['E19'],('WB','WB')),
      (1,'檢查請求','Captcha / Account','MVC Filter',['E05','E13'],('WB','WB')),
      (2,'驗證密碼','APWD','PasswordHash',['E12','E20'],('WB','TB')),
      (1,'產生 Token','AES / Base64Url','IssueAppToken',['E07'],('TB','WB')),
      (3,'保存金鑰','UPDATE account','WCF Execute',['E11','E15'],('WB','DB')),
      (1,'回 APP','302 callback','Redirect',['E08'],('DB',None))])
    flows()
    pipeline('08-data-flow-token','Token 資料流：密碼驗證到資料庫欄位','Data-flow',
      '帳密與驗證碼轉為 access／refresh，再存入帳號欄位，最後回傳 APP 指定 URI。',
      'APWD 是驗證密碼，PWD 存 V4 access_token；不是同一欄位。EXPIRES_AT 僅新建 DTO 暫存，圖中沒有新增 Token／授權碼表。成功 callback 包含水號，但 token 密文不包含水號。',
      ['APP／授權頁','HomeController','HomeService','WCF／DB 邊界'],[
      (0,'表單資料','Account / Password','+ Captcha',['E19'],(None,'WB')),
      (2,'讀取 APWD','有效帳號','WCF Query',['E10','E12'],('WB','TB')),
      (2,'密碼比較','hash 或 legacy AES','PasswordHash',['E20'],('TB','TB')),
      (1,'Token 資料','account + timestamp','AES / Base64Url',['E07','E28'],('TB','WB')),
      (3,'帳號欄位','PWD / refresh','WCF UPDATE',['E11','E15'],('WB','DB')),
      (1,'Callback','200 + Tokens','302 / JSON*',['E08'],('DB',None))])
    pipeline('09-data-flow-session','登入資料流：Token 到 Session','Data-flow',
      'Token 驗證成功後，全部有效水號轉為 F_B_LOGIN_WaterNo 清單，取第一筆水號並建立登入 Session。',
      'Session keys：UserName、CurrentWaterNo、WaterNo(JSON)、UserId、StartDate、EndDate。DB Query 不篩選傳入 water_no；水號清單有值才能 First()。WB=HTTP，TB=物件清單，LS=記憶體 Session。',
      ['APP／瀏覽器','HomeController','HomeService／WCF','Session／網站'],[
      (0,'登入請求','account / water','access_token',['E06','E01'],(None,'WB')),
      (2,'查 Token','PWD + VALID=1','Query B_ACCOUNT',['E09'],('WB','TB')),
      (1,'檢查 Token','account / 期限','AES decrypt',['E07'],('TB','TB')),
      (2,'帳號水號','全部有效綁定','ORDER WATER_NO',['E10','E11'],('TB','TB')),
      (1,'轉換清單','First() 目前水號','F_B_LOGIN list',['E06'],('TB','TB')),
      (3,'建立 Session','六個欄位','SetLoginSession',['E13'],('TB','LS'))])
    data_models();sequences();states();classes()


def html_page(title,body):
    return f'<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>{escape(title)}</title><style>{CSS}</style></head><body><main>{body}<noscript><p>目前顯示完整的預設大小圖面；啟用 JavaScript 後可使用文字大小按鈕。</p></noscript><footer class="foot">2026-10-10 · 靜態逆向蒐證；尚未驗證正式 APP／WCF／DB。依 cathrynlavery/diagram-design MIT v2.6 製作；無外部字型下載，使用本機字型 fallback。</footer></main><script id="diagram-font-controller">{CONTROL_SCRIPT}</script></body></html>'


def validate_geometry(diagram):
    # Detect non-endpoint-node transit for every authored orthogonal segment.
    errors=[]
    for route in diagram.routes:
        for key,(x,y,w,h) in diagram.boxes.items():
            if key in (route['from'],route['to']):continue
            for p,q in zip(route['points'],route['points'][1:]):
                if p[0]==q[0] and x<p[0]<x+w and max(min(p[1],q[1]),y)<min(max(p[1],q[1]),y+h):errors.append(f'{route["from"]}->{route["to"]} crosses {key}')
                if p[1]==q[1] and y<p[1]<y+h and max(min(p[0],q[0]),x)<min(max(p[0],q[0]),x+w):errors.append(f'{route["from"]}->{route["to"]} crosses {key}')
    for key,(x,y,w,h) in diagram.boxes.items():
        if x<0 or y<0 or x+w>diagram.width or y+h>diagram.height-52:errors.append(f'{key} out of diagram bounds')
    if errors:raise ValueError(diagram.slug+': '+'; '.join(errors))


def main():
    build_all()
    inventory=[]
    for diagram in DIAGRAMS:
        validate_geometry(diagram)
        svg=diagram.render_svg()
        ET.fromstring(svg)
        page=html_page(diagram.title,diagram.section())
        (OUT/(diagram.slug+'.html')).write_text(page,encoding='utf-8')
        (OUT/(diagram.slug+'.svg')).write_text(svg,encoding='utf-8')
        inventory.append({'slug':diagram.slug,'title':diagram.title,'type':diagram.kind,'size':[diagram.width,diagram.height],'display_viewBox':ET.fromstring(svg).attrib['viewBox'],'notes':diagram.note,'elements':diagram.elements,'boxes':diagram.boxes,'routes':diagram.routes})
    refs_html=''.join(f'<tr><td><a href="#{d.slug}">{d.kind}</a></td><td><a href="{d.slug}.html">{escape(d.title)}</a></td><td><a href="{d.slug}.svg">SVG</a></td></tr>' for d in DIAGRAMS)
    intro='''<p class="eyebrow">TWNPPUBLIC · REVERSE ENGINEERING · APP V4</p><h1>外部 APP 介接逆向分析圖冊</h1>
<p>以 HomeViewModel.cs 為追查起點；實際入口是 HomeController 的 /Home/AccessToken、/Home/ExternalLogin、/Home/LoginAPP。圖冊包含要求的 10 種圖，共 18 張，從授權到 Session 登入的現況皆可回指原始碼。</p>
<p><strong>如何讀來源編號：</strong>圖中「來源：E09」的 E 代表 Evidence（證據），09 是圖冊證據表的索引。它表示這個區塊或連線的說明可由 E09 所列原始碼支持；不是執行步驟、錯誤碼或資料庫欄位。以 E09 為例，索引指向 <code>Domain/Service/HomeService.cs</code> 第 83–113 行，摘要是以 <code>B_ACCOUNT</code> 的 <code>PWD</code>／<code>APP_REFRESH_TOKEN</code> 比對。每張圖下方展開「來源編號索引與圖面元素對照」即可由編號查檔名、行號和摘要；該表再下一部分會列出此圖哪些節點或連線引用了各證據。</p>
<p class="note">最重要的差異：HomeViewModel 不是 HTTP 入口；此介接採 MVC 表單、HTML 與 Redirect；舊程式 #if false 不啟用。Token 寫入 B_ACCOUNT.PWD／APP_REFRESH_TOKEN，密碼核對 APWD。water_no 未用於綁定驗證，登入取全部有效水號的第一筆。</p>
<p><a href="analysis.md">完整分析、API 契約、Debug 建議及待確認事項</a> · <a href="evidence.md">證據與圖表對照</a> · <a href="source-manifest.json">來源指紋</a> · <a href="diagrams.json">可重製图面資料</a></p>
<p class="foot">可直接離線開啟。圖冊與 18 個獨立圖表頁會依頁面可用寬度自動 fit，調整瀏覽器視窗時也會同步重算。文字大小按鈕以目前圖框寬度為基準：小 60%、中 75%、大 100%；自訂可輸入任意正百分比再套用，超過 100% 時可左右捲動。Ctrl+F 可查詢方法或表名；展開每張圖下方的證據表查看來源。</p>'''
    (OUT/'index.html').write_text(html_page('外部 APP API 逆向分析圖冊',intro+'<table><thead><tr><th>圖形</th><th>主題／獨立 HTML</th><th>向量檔</th></tr></thead><tbody>'+refs_html+'</tbody></table>'+''.join(d.section() for d in DIAGRAMS)),encoding='utf-8')
    (OUT/'diagrams.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2),encoding='utf-8')
    sources=[]
    for ref,(path,start,end,description) in EVIDENCE.items():
        actual=ROOT/path
        raw=actual.read_bytes()
        total=len(raw.decode('utf-8-sig',errors='replace').splitlines())
        assert start<=total and end<=total,(ref,path,end,total)
        sources.append({'id':ref,'file':path,'lines':[start,end],'sha256':hashlib.sha256(raw).hexdigest(),'description':description,'scope':'referenced dependency boundary' if path.startswith('../') else 'specified project'})
    manifest={'captured_date':'2026-10-10','scope':'Home APP V4 integration; static evidence only','diagram_design':{'repository':'https://github.com/cathrynlavery/diagram-design','installed_version':'2.6','installed_vendor_commit':'dc1ace47b99a419e42d01a03cb6ace5346efa8ae','remote_head_observed':'cdfdc9686cd7465da70b68b036581833b503810c','license':'MIT','note':'Uses installed vendor instructions; remote HEAD is provenance observation, not claimed downloaded renderer.'},'sources':sources}
    (OUT/'source-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    evidence='# 圖面證據表\n\n## 如何讀取來源編號\n\n`E` 是 Evidence（證據）的縮寫，後面的數字是本圖冊證據表的索引。例如 `E09` 指向下表所列的 `HomeService.cs` 第 83–113 行及其內容摘要。圖中的「來源：E09」表示該節點或連線是根據這段程式碼整理；它不是流程步驟、錯誤碼或資料庫欄位。若同一處標有多個 E 編號，代表該說明由多個程式位置共同支持。行號是方便定位的範圍，來源版本以 `source-manifest.json` 的 SHA-256 為準。\n\n下表的 E## 為已觀察到的原始碼證據；DB 約束與正式 APP 行為仍未知。\n\n|證據編號|位置|內容摘要|\n|---|---|---|\n'
    evidence+=''.join(f'|{ref}|`{path}:{start}–{end}`|{description}|\n' for ref,(path,start,end,description) in EVIDENCE.items())
    for d in DIAGRAMS:
        evidence+=f'\n## {d.title}\n\n類型：{d.kind}。{d.note}\n\n|元素|類型|來源|\n|---|---|---|\n'
        evidence+=''.join(f'|{e["element"].replace("|","/")}|{e["role"]}|{", ".join(e["evidence"])}|\n' for e in d.elements)
    (OUT/'evidence.md').write_text(evidence,encoding='utf-8')
    print(f'Generated {len(DIAGRAMS)} diagrams (HTML + SVG), index, inventory, evidence and source manifest.')


if __name__=='__main__':
    main()
