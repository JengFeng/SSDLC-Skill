"""Validate generated documentation without browsers, databases or extra packages."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib
import importlib.util
import json
import re
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from diagram_readability import scales
from diagram_controls import DEFAULT_PERCENT as CONTROLS_DEFAULT_PERCENT, SCRIPT as CONTROL_SCRIPT

OUT = Path(__file__).resolve().parent
ROOT = OUT.parent.parent
SKILL = Path('C:/Users/garyy/.codex/skills/ssdlc-framework/references/framework/skills/00_cross_phase/diagram-design/vendor')


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []
        self.ids = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if 'href' in attrs:
            self.hrefs.append(attrs['href'])


def segments(route):
    return [(a,b) for a,b in zip(route['points'],route['points'][1:]) if a!=b]


def overlapping_lines(left, right):
    # Strictly positive collinear overlap; touching edges are checked as attach points.
    p,q=left; r,s=right
    if p[1]==q[1]==r[1]==s[1]:
        return max(min(p[0],q[0]),min(r[0],s[0])) < min(max(p[0],q[0]),max(r[0],s[0]))
    if p[0]==q[0]==r[0]==s[0]:
        return max(min(p[1],q[1]),min(r[1],s[1])) < min(max(p[1],q[1]),max(r[1],s[1]))
    return False


def main():
    spec=importlib.util.spec_from_file_location('diagram_source',OUT/'generate_diagrams.py')
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    module.build_all()
    files=sorted(OUT.glob('*.html'))
    assert len(files)==19, len(files)
    assert len(module.DIAGRAMS)==18
    expected={'Architecture','Swimlane','Process','Flowchart','Data-flow','ER','DB Schema','Sequence','State','UML Class'}
    assert {d.kind for d in module.DIAGRAMS}==expected
    manifest=json.loads((OUT/'source-manifest.json').read_text(encoding='utf-8'))
    for entry in manifest['sources']:
        raw=(ROOT/entry['file']).read_bytes()
        assert hashlib.sha256(raw).hexdigest()==entry['sha256'],entry['id']+' source changed'
        assert entry['lines'][1]<=len(raw.decode('utf-8-sig',errors='replace').splitlines())
    for file in files:
        content=file.read_text(encoding='utf-8')
        scripts=re.findall(r'<script\b.*?</script>',content,re.S|re.I)
        assert scripts==[f'<script id="diagram-font-controller">{CONTROL_SCRIPT}</script>'],file.name+' unexpected script'
        assert content.count('data-font-controls=')==(18 if file.name=='index.html' else 1),file.name+' missing controls'
        assert '<select' not in content.lower(),file.name+' custom size must allow manual input'
        assert content.count('type="number"')==(18 if file.name=='index.html' else 1),file.name+' missing custom input'
        assert 'http://' not in content.replace('http://www.w3.org/2000/svg',''),file.name
        assert 'https://' not in content,file.name
        parser=Links();parser.feed(content)
        assert len(parser.ids)==len(set(parser.ids)),file.name+' duplicate id'
        for href in parser.hrefs:
            if href.startswith('#'):
                assert href[1:] in parser.ids,(file.name,href)
            else:
                assert (OUT/href).is_file(),(file.name,href)
        for svg in re.findall(r'<svg\b.*?</svg>',content,re.S):
            if file.name!='index.html':
                assert svg==file.with_suffix('.svg').read_text(encoding='utf-8'),file.name+' standalone SVG differs'
            root=ET.fromstring(svg)
            assert root.attrib['data-default-font-percent']==str(CONTROLS_DEFAULT_PERCENT)
            assert root[0].tag.endswith('title')
            ids={node.attrib['id'] for node in root.iter() if 'id' in node.attrib}
            assert root.attrib.get('role')=='img'
            assert all(value in ids for value in root.attrib['aria-labelledby'].split())
            min_x,min_y,width,height=map(float,root.attrib['viewBox'].split())
            assert float(root.attrib['width'])==width*CONTROLS_DEFAULT_PERCENT/100
            assert float(root.attrib['height'])==height*CONTROLS_DEFAULT_PERCENT/100
            assert 'width:100%' in root.attrib.get('style','')
            for node in root.iter():
                tag=node.tag.rsplit('}',1)[-1]
                if tag=='text':
                    x,y=float(node.attrib['x']),float(node.attrib['y'])
                    assert min_x<=x<=min_x+width and min_y<=y<=min_y+height,(file.name,node.text,'text outside')
    for diagram in module.DIAGRAMS:
        module.validate_geometry(diagram)
        assert len(diagram.boxes)<=9,(diagram.slug,'node budget')
        routes=diagram.routes
        attach={}
        for route in routes:
            for key,point in [(route['from'],route['points'][0]),(route['to'],route['points'][-1])]:
                pair=(key,tuple(point))
                assert pair not in attach,(diagram.slug,'shared attach point',pair)
                attach[pair]=True
        for i,left in enumerate(routes):
            for right in routes[i+1:]:
                assert not any(overlapping_lines(a,b) for a in segments(left) for b in segments(right)),(diagram.slug,'overlapping connectors',left['from'],right['from'])
        xml=ET.fromstring(diagram.render_svg())
        for group in xml.iter():
            if group.attrib.get('data-label')!='true':continue
            mask=group[0]
            x,y,w,h=(float(mask.attrib[k]) for k in ('x','y','width','height'))
            for key,(bx,by,bw,bh) in diagram.boxes.items():
                sx,sy=scales(diagram)
                bx,by,bw,bh=bx*sx,by*sy,bw*sx,bh*sy
                assert not (max(x,bx)<min(x+w,bx+bw) and max(y,by)<min(y+h,by+bh)),(diagram.slug,'label overlaps node',key)
    self_check=SKILL/'scripts/self_check.py'
    # The upstream validator only allows its animation controller. Check the
    # static HTML/SVG with our exact, separately verified font controller removed.
    # Do not weaken upstream rules or claim it approved the interactive code.
    with tempfile.TemporaryDirectory(prefix='diagram-static-check-') as temporary:
        static_files=[]
        for file in files:
            static=Path(temporary)/file.name
            content=file.read_text(encoding='utf-8')
            static.write_text(content.replace(f'<script id="diagram-font-controller">{CONTROL_SCRIPT}</script>',''),encoding='utf-8')
            static_files.append(static)
        result=subprocess.run([sys.executable,str(self_check),*[str(file) for file in static_files]],capture_output=True,text=True,encoding='utf-8',errors='replace')
        assert result.returncode==0,result.stdout+result.stderr
    report=f'''# 圖冊驗證紀錄

日期：2026-10-10。靜態驗證，不代表 APP／WCF／DB 執行驗證。

|檢查|結果|
|---|---|
|指定 10 種圖形|通過；18 張獨立圖，19 個 HTML（含整合圖冊）|
|SVG XML / role / title / desc / IDs|通過；index 中各圖 ID 唯一|
|Source manifest|通過；{len(manifest['sources'])} 個證據區段的行號有效，SHA-256 與目前來源一致|
|離線資源與連結|通過；無外部 JS／CSS／圖片／字型依賴；本地導覽檔案存在|
|節點預算／位置／文字座標|通過；每圖不超過 9 個節點，圖面座標有效|
|連線／節點幾何|通過；正交路由、無穿越非端點節點、無重疊共線路徑、無共用連接點|
|Arrow label mask 與節點|通過；遮罩不與節點矩形相交|
|diagram-design vendor self_check.py|通過；19 / 19 HTML 的靜態圖面（移除已核對的字體控制腳本後檢查）|
|互動字體控制|通過；每張圖皆有控制列，HTML 僅含指定的離線控制腳本；實際操作另見瀏覽器量測|
|應用程式 dotnet build|被既有 NuGet 後援資料夾缺失阻擋，未成功編譯|
|應用程式 dotnet test|未實際執行；強制 IsTestProject 後仍受同一 NuGet 環境錯誤阻擋|
|手機 APP、WCF、SQL Server|未執行／未連線|
|HTML／獨立 SVG 一致性|通過；18 張獨立 SVG 與各 HTML 圖面完全一致|
|瀏覽器實際排版與視窗縮放|未執行；本次檢查 SVG 自適應寬度設定與 resize handler，尚未量測實際瀏覽器排版|
|截圖|未執行；以 DOM getBBox() 量測，未產生大型圖片|

原始幾何依 vendor 版型建立；依使用者要求放大字體並重排、換行、裁切多餘留白。頁面主體不再受 1080px 最大寬度限制，SVG 預設填滿可用圖框；視窗大小改變時控制器會重新計算寬度。
預設圖面為圖框寬度的 100%（fit）；小／中／大控制按鈕分別為 60%／75%／100%，自訂改為手動輸入任意正百分比（含小數），按 Enter 或套用。
空白、零、負數及非有限數值不套用，提示修正並保留圖面上次有效大小。
字體與圖框／連線／間距同步按比例縮放，維持換行與文字相對位置；超過 100% 可左右捲動。每張圖設定互不影響。控制功能在整合圖冊與獨立 HTML 中使用；未啟用 JavaScript 時仍以 CSS 填滿頁面寬度；列印時縮至紙張寬度。
上游 self_check 僅允許其既定動畫腳本，故只對移除本次控制腳本的暫存副本執行原檢查；本地驗證另核對完整控制腳本，瀏覽器測試驗證互動行為。
中文以本機 Microsoft JhengHei 等字型替代未安裝的 Geist，標題可替代為本機 serif；沒有下載字型。

重製驗證：`python docs/api-reverse-home-v4-20261010/validate_diagrams.py`。
瀏覽器量測：`python docs/api-reverse-home-v4-20261010/verify_readability_browser.py`（使用環境既有 Playwright／Edge，沒有新增套件）。
'''
    (OUT/'validation.md').write_text(report,encoding='utf-8')
    print(f'PASS: {len(files)} HTML; 18 SVG diagrams; 10 types; {len(manifest["sources"])} evidence ranges; geometry, controller and vendor static checks.')


if __name__=='__main__':
    main()
