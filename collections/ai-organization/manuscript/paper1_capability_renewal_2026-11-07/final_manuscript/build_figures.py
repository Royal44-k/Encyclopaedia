"""Original conceptual diagrams. Figure 2 is a logical example, not empirical data."""
from pathlib import Path
from html import escape

OUT = Path(__file__).resolve().parent / 'figures'
OUT.mkdir(exist_ok=True)

def start(h):
    return [f'''<svg xmlns="http://www.w3.org/2000/svg" width="1140" height="{h}" viewBox="0 0 1140 {h}">
<defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10Z" fill="#52697d"/></marker></defs>
<rect width="1140" height="{h}" fill="white"/><style>text{{font-family:Arial,'Microsoft YaHei',sans-serif;fill:#162d3b}}.title{{font-size:34px;font-weight:700}}.head{{font-size:28px;font-weight:700}}.body{{font-size:26px}}.small{{font-size:24px;fill:#455a6c}}.arrow{{fill:none;stroke:#52697d;stroke-width:3;stroke-dasharray:9 7;marker-end:url(#a)}}</style>''']

def txt(p,x,y,lines,css='body',anchor='middle',gap=36):
    for i,s in enumerate(lines):
        p.append(f'<text x="{x}" y="{y+i*gap}" class="{css}" text-anchor="{anchor}">{escape(s)}</text>')

def box(p,x,y,w,h,head,lines,fill='#edf3f8'):
    p.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="13" fill="{fill}" stroke="#aebfcc" stroke-width="2"/>')
    txt(p,x+w/2,y+39,[head],'head')
    txt(p,x+w/2,y+80,lines)

def arrow(p,d):
    p.append(f'<path d="{d}" class="arrow"/>')

def write(p,name):
    (OUT/name).write_text('\n'.join(p+['</svg>']),encoding='utf-8')

for lang in ['en','zh']:
    zh=lang=='zh'
    p=start(1040)
    txt(p,40,48,['从任务分配到团队恢复' if zh else 'From task routing to collective recovery'],'title','start')
    txt(p,40,91,['概念框架  所有箭头均为待检验关系' if zh else 'Conceptual framework · Every arrow denotes a hypothesis'],'small','start')
    box(p,385,145,370,155,'任务分配' if zh else 'Task routing', ['谁处理哪类错误','在流程的哪个环节'] if zh else ['Who handles which error?', 'At which stage?'])
    box(p,25,145,300,155,'当前交付' if zh else 'Current delivery', ['质量  时间  成本','需独立测量'] if zh else ['Quality · time · cost', 'Measured separately'],'#f5f1e8')
    box(p,385,365,370,155,'学习经历' if zh else 'Learning experiences', ['诊断与修复尝试','可验证的反馈'] if zh else ['Diagnosis and repair', 'Verifiable feedback'])
    box(p,25,365,300,155,'学习条件' if zh else 'Learning conditions', ['先备知识  难度','反馈质量'] if zh else ['Prior skill · difficulty', 'Feedback quality'],'#f4f6f8')
    box(p,815,365,300,155,'替代练习' if zh else 'Substitute practice', ['AI辅导与模拟','须检验迁移效果'] if zh else ['AI tutoring · rehearsal', 'Transfer requires testing'],'#edf6f1')
    box(p,385,585,370,155,'能力覆盖' if zh else 'Capability coverage', ['成员 × 错误类型','共同新任务与规定工具'] if zh else ['Member × error class', 'Common tests · tool rules'])
    box(p,385,805,370,155,'团队恢复' if zh else 'Collective recovery', ['预设变化条件下的测试','质量  用时  协调成本'] if zh else ['Predefined disruptions', 'Quality · time · cost'])
    box(p,815,805,300,155,'团队条件' if zh else 'Team conditions', ['协调与外部支持','共同误判与任务需求'] if zh else ['Coordination · support', 'Shared errors · demands'],'#f4f6f8')
    for y in [300,520,740]: arrow(p,f'M570 {y+6} L570 {y+56}')
    arrow(p,'M379 222 L331 222')
    arrow(p,'M331 442 L379 442')
    arrow(p,'M809 442 L761 442')
    arrow(p,'M809 882 L761 882')
    txt(p,40,1015,['覆盖并不等于团队可靠性  图中没有实证测量结果' if zh else 'Coverage is not team reliability. No empirical measurements are shown.'],'small','start')
    write(p,f'figure1_{lang}.svg')

    p=start(890)
    txt(p,40,48,['相同平均值可以对应不同能力覆盖' if zh else 'Equal totals can conceal different coverage'],'title','start')
    txt(p,40,91,['逻辑示例  非研究数据  非模型估计' if zh else 'Logical illustration only · Not data or model estimates'],'small','start')
    matrices=[[[1,1,1],[1,1,0],[1,0,0]],[[1,1,0],[0,1,1],[1,0,1]]]
    for j,(left,m) in enumerate(zip([50,625],matrices)):
        txt(p,left+215,160,['配置 A' if j==0 else '配置 B'] if zh else ['Configuration A' if j==0 else 'Configuration B'],'head')
        for k in range(3):txt(p,left+150+k*100,218,[(f'错误{k+1}' if zh else f'Error {k+1}')],'small')
        for i,row in enumerate(m):
            txt(p,left+40,286+i*85,[f'成员{i+1}' if zh else f'M{i+1}'],'small')
            for k,v in enumerate(row):
                cx,cy=left+150+k*100,276+i*85
                p.append(f'<circle cx="{cx}" cy="{cy}" r="16" fill="{"#255b72" if v else "white"}" stroke="#255b72" stroke-width="3"/>')
        txt(p,left+215,535,['达标单元总数  6' if zh else 'Six qualifying cells in total'],'body')
        txt(p,left+215,580,['预设成员1暂缺后' if zh else 'With member 1 unavailable'],'small')
        counts=[sum(m[i][k] for i in [1,2]) for k in range(3)]
        for k,c in enumerate(counts):
            color='#f2e8dc' if c==0 else '#edf3f8'
            p.append(f'<rect x="{left+105+k*100}" y="610" width="90" height="65" rx="8" fill="{color}" stroke="#aebfcc"/>')
            txt(p,left+150+k*100,653,[str(c)],'head')
        txt(p,left+215,719,['各错误类剩余达标人数' if zh else 'Qualifying members per error class'],'small')
    txt(p,40,788,['实心圆表示假定达到预设的任务能力标准  空心圆表示未达到' if zh else 'Filled circle: stipulated task criterion met. Open circle: criterion not met.'],'small','start')
    txt(p,40,832,['此比较不说明工作分配产生了这些格局  也不证明B的整体表现更好' if zh else 'No claim that routing caused these patterns, or that B performs better overall.'],'small','start')
    write(p,f'figure2_{lang}.svg')
print('Four conceptual SVG files created')
