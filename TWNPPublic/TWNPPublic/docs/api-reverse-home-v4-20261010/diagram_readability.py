"""Large-type SVG layout, preserving all evidence and diagram semantics."""
import re
import math
import unicodedata
import xml.etree.ElementTree as ET
from diagram_controls import DEFAULT_PERCENT

NS = '{http://www.w3.org/2000/svg}'
ET.register_namespace('', 'http://www.w3.org/2000/svg')
SIZES = {'name':22, 'sub':18, 'member':16, 'label':16, 'tag':14, 'source':14, 'group':22}
STYLE = '''
.name{font-size:22px;font-weight:700;fill:#183b43}
.sub{font-size:18px;font-weight:500;fill:#304e54}
.member,.label{font-size:16px;font-weight:600;fill:#304e54}
.tag,.source{font-size:14px;font-weight:600;fill:#304e54}
.group{font-size:22px;font-weight:700;fill:#183b43}
.node{stroke:#6f9699;stroke-width:1.8}.focal{stroke:#087e8c;stroke-width:2.2}
.edge{stroke:#3f6269;stroke-width:1.8}.sep{stroke:#b4cdca;stroke-width:1.2}
'''


def scales(diagram):
    if diagram.kind in ('Process','Data-flow'):return 2,2.5
    if diagram.kind=='Swimlane':return 1.5,2.25
    if diagram.kind=='Sequence':return 1,1.5
    if diagram.kind in ('Architecture','Flowchart'):return 1,2
    if diagram.kind in ('ER','DB Schema','UML Class'):return 1,2.2
    return 1,1.7


def text_width(value, size):
    return sum(size * (1 if unicodedata.east_asian_width(c) in ('W','F') else .64) for c in value)


def wrap(value, width, size):
    lines=[]
    remaining=value.strip()
    while remaining:
        end=1
        while end<len(remaining) and text_width(remaining[:end+1],size)<=width:end+=1
        if end<len(remaining):
            split=max(remaining.rfind(sep,0,end) for sep in (' ','/','、','|'))
            if split>=end//2:end=split+1
        lines.append(remaining[:end].rstrip())
        remaining=remaining[end:].lstrip()
    return lines or ['']


def set_lines(node, lines, x, baseline, size, centered=False):
    node.text=None
    for child in list(node):node.remove(child)
    step=size*1.6
    first=baseline-(len(lines)-1)*step/2 if centered else baseline
    node.set('x',f'{x:g}');node.set('y',f'{first:g}')
    for i,line in enumerate(lines):
        span=ET.SubElement(node,NS+'tspan',{'x':f'{x:g}','y':f'{first+i*step:g}'})
        span.text=line


def source_label(value):
    return '來源：'+value.removeprefix('來源：').replace(' · ','、')


def render(source, diagram):
    sx,sy=scales(diagram)
    root=ET.fromstring(source)
    root.set('viewBox',f'0 0 {diagram.width*sx:g} {diagram.height*sy:g}')
    # Let each HTML page fit the available frame; selected sizes above 100% can scroll.
    display_width=diagram.width*sx*DEFAULT_PERCENT/100
    root.set('style','display:block;width:100%;min-width:0;height:auto')
    root.set('data-default-font-percent',str(DEFAULT_PERCENT))
    style=root.find(NS+'defs/'+NS+'style')
    style.text=(style.text or '')+STYLE

    def scale(node):
        if node.tag==NS+'defs':return
        for attr in ('x','x1','x2','width','cx'):
            if attr in node.attrib:node.set(attr,f'{float(node.attrib[attr])*sx:g}')
        for attr in ('y','y1','y2','height','cy'):
            if attr in node.attrib:node.set(attr,f'{float(node.attrib[attr])*sy:g}')
        if 'points' in node.attrib:
            pairs=[tuple(map(float,p.split(','))) for p in node.attrib['points'].split()]
            node.set('points',' '.join(f'{x*sx:g},{y*sy:g}' for x,y in pairs))
        if 'd' in node.attrib:
            parts=[]
            for command,args in re.findall(r'([MLQHV])\s*([^MLQHV]*)',node.attrib['d']):
                numbers=[float(v) for v in re.findall(r'-?\d+(?:\.\d+)?',args)]
                factors=[sx] if command=='H' else [sy] if command=='V' else [sx,sy]
                parts.append(command+' '+','.join(f'{v*factors[i%len(factors)]:g}' for i,v in enumerate(numbers)))
            node.set('d',' '.join(parts))
        for child in node:scale(child)
    scale(root)

    for group in root.iter(NS+'g'):
        key=group.attrib.get('data-node')
        if not key:continue
        ox,oy,ow,oh=diagram.boxes[key]
        x,y,w,h=ox*sx,oy*sy,ow*sx,oh*sy
        texts=[child for child in group if child.tag==NS+'text']
        if any(text.attrib.get('class')=='member' for text in texts):
            for text in texts:
                cls=text.attrib['class'];value=''.join(text.itertext())
                if cls=='source':value=source_label(value)
                lines=wrap(value,w-24,SIZES[cls])
                set_lines(text,lines,float(text.attrib['x']),float(text.attrib['y']),SIZES[cls],centered=cls!='source')
            continue
        source_node=next((t for t in texts if t.attrib.get('class')=='source'),None)
        if source_node is not None and w<200:
            # Source IDs remain in the title and evidence table; small actor headers
            # and swimlane cards need that space for their readable names.
            group.remove(source_node)
            source_node=None
        if source_node is not None:
            value=source_label(''.join(source_node.itertext()))
            if w<200:value=value.replace('來源：','來源 ').replace('、','/')
            refs=wrap(value,w-20,14)
            set_lines(source_node,refs,x+w-10,y+h-12-(len(refs)-1)*16.8,14)
        diamond=any(child.tag==NS+'polygon' for child in group)
        content=[]
        for text in texts:
            cls=text.attrib.get('class')
            if cls=='source':continue
            if cls=='tag' and diagram.kind not in ('Process','Data-flow'):
                group.remove(text)
                continue
            value=''.join(text.itertext())
            content.append((text,wrap(value,w*.68 if diamond else w-24,SIZES[cls]),SIZES[cls]))
        height=sum(len(lines)*size*1.6 for _,lines,size in content)
        if source_node is not None and height+44>h:
            group.remove(source_node)
            source_node=None
        if diamond:
            if source_node is not None:group.remove(source_node)
            reserve=0
        else:reserve=28 if source_node is not None else 40 if diagram.kind in ('Process','Data-flow') else 18
        cursor=y+max(10,(h-reserve-height)/2)
        for text,lines,size in content:
            set_lines(text,lines,x+w/2,cursor+size*1.25,size)
            cursor+=len(lines)*size*1.6

    for group in root.iter(NS+'g'):
        if group.attrib.get('data-label')!='true':continue
        mask,text=group[0],group[1]
        value=''.join(text.itertext())
        x,baseline=float(text.attrib['x']),float(text.attrib['y'])
        baseline+=max(0,11*(sy-1))
        if value=='0..*':x-=16
        left,right=0,diagram.width*sx
        for bx,by,bw,bh in diagram.boxes.values():
            bx,by,bw,bh=bx*sx,by*sy,bw*sx,bh*sy
            if max(baseline-17,by)>=min(baseline+5,by+bh):continue
            if bx+bw<=x:left=max(left,bx+bw)
            if bx>=x:right=min(right,bx)
        available=max(32,2*min(x-left,right-x)-12)
        lines=wrap(value,available-20,16)
        width=max(text_width(line,16) for line in lines)+20
        first=baseline-(len(lines)-1)*25.6
        mask.set('x',f'{x-width/2:g}');mask.set('y',f'{first-17:g}')
        mask.set('width',f'{width:g}');mask.set('height',f'{22+(len(lines)-1)*25.6:g}')
        set_lines(text,lines,x,first,16)
    # Fit the frame to authored content rather than preserving empty slide padding.
    legend_line,legend_text=root[-2],root[-1]
    bounds=[]
    def extent(node, inherited='sub'):
        tag=node.tag.removeprefix(NS)
        if tag=='defs' or node is legend_line or node is legend_text:return
        cls=node.attrib.get('class',inherited)
        if tag=='rect':
            yy=float(node.attrib.get('y',0));bounds.extend([yy,yy+float(node.attrib.get('height',0))])
        elif tag=='line':bounds.extend(float(node.attrib[k]) for k in ('y1','y2'))
        elif tag=='polygon':bounds.extend(float(p.split(',')[1]) for p in node.attrib['points'].split())
        elif tag in ('text','tspan'):
            yy=float(node.attrib['y']);size=SIZES.get(cls,18)
            bounds.extend([yy-size*1.4,yy+size*.4])
        elif tag=='path':
            for command,args in re.findall(r'([MLQHV])\s*([^MLQHV]*)',node.attrib['d']):
                numbers=[float(v) for v in re.findall(r'-?\d+(?:\.\d+)?',args)]
                if command=='V':bounds.extend(numbers)
                elif command!='H':bounds.extend(numbers[1::2])
        for child in node:extent(child,cls)
    extent(root)
    top=max(0,math.floor((min(bounds)-32)/4)*4)
    bottom=math.ceil(max(bounds)/4)*4
    legend_line.set('y1',str(bottom+28));legend_line.set('y2',str(bottom+28))
    legend_text.set('y',str(bottom+60))
    root.set('viewBox',f'0 {top:g} {diagram.width*sx:g} {bottom+84-top:g}')
    root.set('width',f'{display_width:g}')
    root.set('height',f'{(bottom+84-top)*DEFAULT_PERCENT/100:g}')
    return ET.tostring(root,encoding='unicode')
