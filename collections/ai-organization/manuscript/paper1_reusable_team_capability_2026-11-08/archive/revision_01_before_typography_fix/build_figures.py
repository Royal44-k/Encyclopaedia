from pathlib import Path
from html import escape
import json

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'figures';OUT.mkdir(exist_ok=True)
INK='#183332';TEAL='#247C73';LIGHT='#EAF4F1';GREY='#657472';LINE='#C5D6D2';RUST='#B86A42';PALE='#FBF1E8'
W=1400

def text(x,y,s,size=28,fill=INK,weight='normal',anchor='start'):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-weight="{weight}" text-anchor="{anchor}">{escape(s)}</text>'

def lines(x,y,arr,size=26,gap=36,fill=INK,weight='normal',anchor='start'):
    return ''.join(text(x,y+i*gap,s,size,fill,weight,anchor) for i,s in enumerate(arr))

def rect(x,y,w,h,fill='white',stroke=LINE,rx=12):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'

def path(d,color=TEAL,width=3,dash=False):
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linejoin="round" stroke-linecap="round"'+(' stroke-dasharray="9 8"' if dash else '')+'/>'

def arrow(x1,y1,x2,y2,color=TEAL,dash=False):
    return path(f'M{x1} {y1} L{x2} {y2}',color,3,dash)+f'<path d="M{x2-10} {y2-6} L{x2} {y2} L{x2-10} {y2+6}" fill="none" stroke="{color}" stroke-width="3"/>'

def person(cx,cy,scale=1,color=TEAL):
    return f'<g transform="translate({cx} {cy}) scale({scale})"><circle cx="0" cy="-20" r="22" fill="{LIGHT}" stroke="{color}" stroke-width="3"/>'+path('M-40 55 Q-40 13 0 13 Q40 13 40 55',color,3)+'</g>'

def document(cx,cy,color=TEAL):
    return rect(cx-35,cy-40,70,86,LIGHT,color,6)+''.join(path(f'M{cx-20} {cy+d} L{cx+20} {cy+d}',color,3) for d in [-15,2,19])

def calendar(cx,cy):
    return rect(cx-43,cy-35,86,77,LIGHT,TEAL,7)+path(f'M{cx-43} {cy-11} L{cx+43} {cy-11} M{cx-22} {cy-44} L{cx-22} {cy-25} M{cx+22} {cy-44} L{cx+22} {cy-25}')+path(f'M{cx-20} {cy+12} L{cx-5} {cy+26} L{cx+24} {cy-1}',TEAL,4)

def save(n,lang,h,body):
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{h}" viewBox="0 0 {W} {h}"><rect width="1400" height="{h}" fill="white"/><g font-family="Microsoft YaHei, Arial, sans-serif">{body}</g></svg>'
    (OUT/f'figure{n}_{lang}.svg').write_text(svg,encoding='utf-8')

def fig1(lang):
    zh=lang=='zh'
    b=text(36,48,'一项任务怎样跨过假期' if zh else 'A shared task outlasts the holiday',34,INK,'bold')
    b=text(36,92,'腾讯研究院报告中的实践过程' if zh else 'Practice described in the Tencent Research Institute report',25,GREY)+b
    xs=[172,524,876,1228]
    labels=([
      ['假期仍需追踪','AI 新闻动态'],['团队共享','一个 Skill'],['成员每天调用','根据结果迭代'],['假期结束后','继续日常使用']
    ] if zh else [
      ['Track AI news','during the holiday'],['Share a Skill','within the team'],['Use it each day','and revise it'],['Keep using it','after the holiday']
    ])
    for i,x in enumerate(xs):
        b+=f'<circle cx="{x}" cy="212" r="68" fill="{LIGHT}"/>'
        b+=[calendar,document,lambda x,y:person(x,y-5),calendar][i](x,212)
        b+=text(x,321,str(i+1).zfill(2),22,TEAL,'bold','middle')
        b+=lines(x,366,labels[i],28,40,INK,'normal','middle')
        if i<3:b+=arrow(x+87,212,xs[i+1]-87,212)
    b+=path('M53 455 L1347 455',LINE,2)
    b+=text(53,503,'图中展示报告记载的动作，未表示因果效应。' if zh else 'These are reported actions, not estimated causal effects.',27,GREY)
    b+=text(53,544,'报告未公开调用日志、质量对照或维护工时。' if zh else 'Usage logs, comparative quality and maintenance hours were not provided.',25,GREY)
    save(1,lang,580,b)

def fig2(lang):
    zh=lang=='zh'
    b=text(36,48,'同事拿到的可以是一页能用的工作方法' if zh else 'What a colleague can receive with the working method',34,INK,'bold')
    b+=text(36,91,'每日 AI 简报交接示例  ·  作者设计示意，非报告中的原始 Skill' if zh else 'Illustrative daily AI brief handover  ·  Not the original Skill from the report',25,GREY)
    b+=person(124,267,1.15)+lines(124,365,['原制作者'] if zh else ['Initial','maker'],27,38,INK,'normal','middle')
    b+=person(1262,267,1.15)+lines(1262,365,['接收同事'] if zh else ['Receiving','colleague'],27,38,INK,'normal','middle')
    b+=arrow(180,285,260,285)+arrow(1130,285,1204,285)
    b+=rect(279,132,832,652,'white',LINE,4)
    b+=rect(279,132,832,66,LIGHT,LINE,4)
    b+=text(307,176,'每日 AI 简报  /  工作方法与交接说明' if zh else 'DAILY AI BRIEF  /  Method and handover notes',27,INK,'bold')
    rows=([
      ('用途与范围',['供组内了解进展；注明时间窗口','不承担采购或法律判断']),
      ('输入与访问',['可访问的来源链接与发布日期','无法读取的材料单独列出']),
      ('运行办法',['提供共享指令、必要材料与操作步骤','确认同事具备所需工具和权限']),
      ('交付样例',['要点 + 原始链接 + 日期 + 不确定之处','配一个通过样例和一个失败样例']),
      ('边界判断',['区分宣布、测试与正式发布','关键事实未确认时保留待核实标记']),
      ('修改与维护',['写明维护联系人和最近复核日期','岗位特有改动可保留为独立变体'])
    ] if zh else [
      ('Purpose',['Team awareness; state the time window','Exclude purchasing or legal decisions']),
      ('Inputs',['Accessible sources and publication dates','List material that could not be accessed']),
      ('Operation',['Shared instructions, materials and steps',"Check the colleague's tools and access"]),
      ('Examples',['Takeaway + source + date + uncertainty','Include an acceptable and a failed example']),
      ('Limits',['Separate announcement, preview and release','Flag key facts that remain unconfirmed']),
      ('Maintenance',['Name a contact and last review date','Keep role-specific variants when needed'])
    ])
    for i,(label,ls) in enumerate(rows):
        y=198+i*96
        if i>0:b+=path(f'M299 {y} L1091 {y}',LINE,1.5)
        b+=text(307,y+39,label,25,TEAL,'bold')
        b+=lines(493 if zh else 501,y+37,ls,26,33)
    b+=path('M1262 442 L1262 831 L696 831 L696 789',TEAL,3)
    b+=f'<path d="M690 799 L696 789 L702 799" fill="none" stroke="{TEAL}" stroke-width="3"/>'
    b+=text(700,877,'使用中的问题与改动返回团队，由指定人员决定更新或保留变体' if zh else 'Return problems and revisions; a designated maintainer updates or retains variants',25,TEAL,'normal','middle')
    save(2,lang,915,b)

def fig3(lang):
    zh=lang=='zh'
    b=text(36,48,'检验交接方式，而不只检验工具能否运行' if zh else 'Test the handover, not only whether the tool runs',34,INK,'bold')
    b+=text(36,91,'拟议研究设计  ·  图中没有实测数据' if zh else 'Proposed research design  ·  No observed results are shown',25,GREY)
    b+=text(36,147,'固定基础模型、源方法与任务池；预先限定相同支持预算' if zh else 'Hold model, source method and task pool constant; set an equal support budget',27,INK)
    groups=([
      ('A',['仅提供提示词']),('B',['提供可运行方法']),('C',['可运行方法','加交接与维护支持'])
    ] if zh else [('A',['Prompt only']),('B',['Runnable method']),('C',['Runnable method','plus handover support'])])
    for i,(letter,label) in enumerate(groups):
        x=36+i*452
        b+=rect(x,178,424,144,LIGHT if i==2 else 'white',LINE,9)
        b+=text(x+24,221,letter,29,TEAL,'bold')
        b+=lines(x+75,224,label,28,40)
    b+=text(36,378,'在不同任务条件下观察同事能否继续完成工作' if zh else 'Observe colleagues across separate task conditions',28,INK,'bold')
    stages=([
      ('首次使用',['新同事能否启动并交付']),('延后再用',['隔一段时间能否再次完成']),('单独改变条件',['更换输入或工具版本'])
    ] if zh else [('First use',['Can the colleague start and deliver?']),('Delayed reuse',['Can the work be repeated later?']),('Change one condition',['Vary inputs or the tool version'])])
    for i,(title,body) in enumerate(stages):
        x=36+i*452
        b+=text(x+14,434,title,29,TEAL,'bold')
        b+=lines(x+14,477,body,24,32)
        if i<2:b+=arrow(x+390,426,x+434,426)
    b+=path('M36 526 L1364 526',LINE,2)
    b+=text(36,574,'分别观察运行、适用范围判断与修订回传' if zh else 'Track execution, scope judgements and returned revisions separately',27,TEAL)
    b+=text(36,629,'并列报告' if zh else 'Report together',28,INK,'bold')
    b+=document(79,714)
    b+=lines(146,685,['输出质量、关键遗漏与失败','保留放弃使用的记录','由不知道分组的评分者评估'] if zh else ['Quality, omissions and failures','Retain abandoned attempts','Use assessors blind to allocation'],25,39)
    b+=calendar(790,714)
    b+=lines(861,685,['制作者与接收者的总投入','含准备、适配、答疑','以及后续维护'] if zh else ['Total effort on both sides','Include preparation, help,','adaptation and maintenance'],25,39)
    b+=text(36,847,'公开仓库适合研究材料与版本变化；上述行为结果需要另行取得使用证据。' if zh else 'Public repositories reveal artifacts and revisions; behavioural outcomes require use evidence.',25,GREY)
    save(3,lang,885,b)

for lang in ['en','zh']:
    fig1(lang);fig2(lang);fig3(lang)
print(json.dumps({'svg_files':6,'folder':str(OUT)}))
