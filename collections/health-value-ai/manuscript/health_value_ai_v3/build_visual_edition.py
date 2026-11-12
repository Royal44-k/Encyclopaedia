"""Create an illustrated scientific reading edition; all processing is local."""
from pathlib import Path
import copy, csv, hashlib, json, math, re
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.graphics.shapes import Drawing, Line, Rect, Circle, String, PolyLine, Polygon, Path as GPath
from reportlab.graphics import renderPDF, renderSVG
import pypdfium2 as pdfium
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.section import WD_SECTION_START
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT=Path(__file__).resolve().parent
OLD=ROOT.parent/'health_value_ai_v1'
ASSETS=ROOT/'figures';ASSETS.mkdir(exist_ok=True)
FONTS=Path('C:/Windows/Fonts')
for name,file in [('Serif','times.ttf'),('SerifBold','timesbd.ttf'),('SerifItalic','timesi.ttf'),('Sans','arial.ttf'),('SansBold','arialbd.ttf'),('Display','georgiab.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(FONTS/file)))
pdfmetrics.registerFontFamily('Serif',normal='Serif',bold='SerifBold',italic='SerifItalic',boldItalic='SerifBold')
pdfmetrics.registerFontFamily('Sans',normal='Sans',bold='SansBold',italic='Sans',boldItalic='SansBold')
BLACK=colors.HexColor('#101820');GRAY=colors.HexColor('#59646b');LIGHT=colors.HexColor('#d9e0e3')
TEAL=colors.HexColor('#177e89');BLUE=colors.HexColor('#3d5f93');ORANGE=colors.HexColor('#c5633f');PURPLE=colors.HexColor('#7b668f')
PALE=colors.HexColor('#f1f5f6')
W=522

def text(g,x,y,s,size=9,font='Sans',color=BLACK,anchor='start'):
    g.add(String(x,y,s,fontName=font,fontSize=size,fillColor=color,textAnchor=anchor))
def line(g,x1,y1,x2,y2,color=LIGHT,width=.7,dash=None):
    ob=Line(x1,y1,x2,y2,strokeColor=color,strokeWidth=width)
    if dash:ob.strokeDashArray=dash
    g.add(ob)
def arrow(g,x1,y1,x2,y2,color=GRAY):
    line(g,x1,y1,x2,y2,color,1)
    angle=math.atan2(y2-y1,x2-x1);back=6
    pts=[x2,y2,x2-back*math.cos(angle)+3*math.sin(angle),y2-back*math.sin(angle)-3*math.cos(angle),x2-back*math.cos(angle)-3*math.sin(angle),y2-back*math.sin(angle)+3*math.cos(angle)]
    g.add(Polygon(pts,fillColor=color,strokeColor=None))
def rect(g,x,y,w,h,fill=None,stroke=LIGHT,sw=.7):g.add(Rect(x,y,w,h,fillColor=fill,strokeColor=stroke,strokeWidth=sw))
def icon(g,kind,x,y,col=TEAL):
    # Original outline symbols, not biological or diagnostic images.
    if kind=='time':
        g.add(Circle(x,y,13,strokeColor=col,fillColor=None,strokeWidth=1.7));line(g,x,y,x,y+8,col,1.7);line(g,x,y,x+7,y-4,col,1.7)
    elif kind=='health':
        g.add(PolyLine([x-17,y,x-9,y,x-5,y+10,x+1,y-10,x+7,y+6,x+11,y,x+17,y],strokeColor=col,strokeWidth=1.9))
    elif kind=='experience':
        rect(g,x-15,y-8,30,22,None,col,1.5);g.add(PolyLine([x-9,y-8,x-9,y-15,x-1,y-8],strokeColor=col,strokeWidth=1.5))
        for dx in [-8,0,8]:g.add(Circle(x+dx,y+3,1.5,fillColor=col,strokeColor=None))
    elif kind=='agency':
        g.add(Circle(x,y+7,6,fillColor=None,strokeColor=col,strokeWidth=1.5));line(g,x,y+1,x,y-14,col,1.5)
        line(g,x-14,y-2,x+14,y-2,col,1.5);line(g,x,y-14,x-8,y-21,col,1.5);line(g,x,y-14,x+8,y-21,col,1.5)

def figure1():
    g=Drawing(W,220)
    text(g,0,205,'a',11,'SansBold');text(g,18,205,'Define feasible alternatives',10.5,'SansBold')
    text(g,18,187,'Common horizon  ·  Actual ability to refuse  ·  Relevant perspective',9)
    line(g,0,175,W,175)
    text(g,0,158,'b',11,'SansBold');text(g,18,158,'Keep distinct consequences visible',10.5,'SansBold')
    xs=[65,196,327,458]
    domains=[('time','Resources and time',['Net income and total work','Activities enabled or displaced'],TEAL),
             ('health','Health and functioning',['Symptoms and daily function','Relevant clinical outcomes'],BLUE),
             ('experience','Experience',['Enjoyment, relief or distress','During and after the activity'],ORANGE),
             ('agency','Capabilities and agency',['Assisted and unaided ability','Goals and actual discretion'],PURPLE)]
    for x,(ic,title,notes,col) in zip(xs,domains):
        icon(g,ic,x,125,col);text(g,x,95,title,9.1,'SansBold',anchor='middle')
        for k,s in enumerate(notes):text(g,x,79-k*12,s,8.2,anchor='middle')
    line(g,0,52,W,52)
    text(g,0,32,'c',11,'SansBold');text(g,18,32,'Appraise the trade-off',10.5,'SansBold')
    text(g,18,15,'Personal goals + constraints',9)
    arrow(g,205,24,244,24)
    text(g,258,32,'Evidence, uncertainty and explanation',10,'SansBold')
    text(g,258,15,'An unresolved ordering is an admissible result',9)
    return g

def figure2():
    g=Drawing(W,217)
    text(g,0,202,'a',11,'SansBold');text(g,17,202,'AI task savings and total work',10,'SansBold')
    text(g,17,187,'240 minutes saved in each scenario',8.8)
    x0,x1,y0,y1=36,286,54,171
    sy=lambda v:y0+(v+270)/390*(y1-y0)
    for tick in [-240,-120,0,120]:
        line(g,x0,sy(tick),x1,sy(tick),LIGHT,.5)
        text(g,x0-6,sy(tick)-3,str(tick).replace('-','−'),8,anchor='end')
    line(g,x0,sy(0),x1,sy(0),GRAY,.9)
    for x,added,net in [(78,0,-240),(160,180,-60),(242,300,60)]:
        zero=sy(0);end=sy(net);col=TEAL if net<0 else ORANGE
        rect(g,x-18,min(zero,end),36,abs(end-zero),col,None)
        text(g,x,end-12 if net<0 else end+7,f'{net:+d}'.replace('-','−'),10,'SansBold',anchor='middle')
        text(g,x,35,str(added),8.5,anchor='middle')
    text(g,160,18,'Added task time (minutes)',9,anchor='middle')
    text(g,36,174,'Change in total work (minutes)',8.2)
    line(g,307,12,307,213,LIGHT,.8)
    text(g,325,202,'b',11,'SansBold');text(g,342,202,'Align the comparison horizon',9.7,'SansBold')
    text(g,325,182,'A shared 28-day window',9)
    text(g,325,158,'A   7 overtime days · CNY 10,000',8.6,'SansBold')
    text(g,325,115,'B   28 overtime days · CNY 100,000',8.6,'SansBold')
    for yy,n in [(136,7),(93,28)]:
        for j in range(28):rect(g,325+j*6.7,yy,5.6,12,TEAL if j<n else PALE,None)
    text(g,325,70,'B minus A',8.5)
    text(g,325,51,'+21 overtime days',11,'SansBold')
    text(g,325,34,'+CNY 90,000',11,'SansBold')
    text(g,325,16,'Supplements; ordinary earnings held equal',7.7)
    return g

def figure3():
    g=Drawing(W,215)
    specs=[('a','Long working hours',TEAL),('b','Controlled diet trial',ORANGE),('c','Sleep extension trial',BLUE)]
    for j,(label,title,col) in enumerate(specs):
        x=j*178;text(g,x,200,label,11,'SansBold');text(g,x+16,200,title,9.5,'SansBold')
        if j>0:line(g,x-10,14,x-10,212,LIGHT,.7)
    # RR is on a log scale; intervals are not converted into absolute risks.
    lo,hi=0.9,1.8;xx=lambda v:19+(math.log(v)-math.log(lo))/(math.log(hi)-math.log(lo))*132
    for t in [1,1.2,1.5,1.8]:
        line(g,xx(t),71,xx(t),67,GRAY);text(g,xx(t),53,str(t),8,anchor='middle')
    line(g,19,71,151,71,GRAY);line(g,xx(1),80,xx(1),143,GRAY,.6,[2,2])
    line(g,xx(1.13),112,xx(1.61),112,TEAL,2)
    for t in [1.13,1.61]:line(g,xx(t),107,xx(t),117,TEAL,1.2)
    g.add(Circle(xx(1.35),112,3.5,fillColor=TEAL,strokeColor=TEAL))
    text(g,85,164,'RR 1.35',15,'SansBold',anchor='middle');text(g,85,146,'95% CI 1.13–1.61',9,anchor='middle')
    text(g,85,35,'Stroke incidence · log scale',8.4,anchor='middle')
    text(g,85,19,'≥55 versus 35–40 hours/week',8,anchor='middle')
    # Independent kcal/day contrasts; interval meanings intentionally remain distinct.
    for j,est,a,b,ci,col in [(1,508,402,614,'±1 SE (106)',ORANGE),(2,-270,-393,-147,'95% CI −393 to −147',BLUE)]:
        base=j*178;fx=lambda v:base+13+(v+500)/1250*134
        line(g,base+13,71,base+147,71,GRAY)
        for t in [-500,0,500]:
            line(g,fx(t),71,fx(t),67,GRAY);text(g,fx(t),53,str(t).replace('-','−'),8,anchor='middle')
        line(g,fx(0),80,fx(0),143,GRAY,.6,[2,2]);line(g,fx(a),112,fx(b),112,col,2)
        for v in [a,b]:line(g,fx(v),107,fx(v),117,col,1.2)
        g.add(Circle(fx(est),112,3.5,fillColor=col,strokeColor=col))
        text(g,base+80,164,f'{est:+d} kcal/day'.replace('-','−'),13.4,'SansBold',anchor='middle')
        text(g,base+80,146,ci,8.8,anchor='middle')
        text(g,base+80,35,'Energy intake difference (kcal/day)',7.9,anchor='middle')
    text(g,258,19,'Ultra-processed versus unprocessed',7.7,anchor='middle')
    text(g,436,19,'Change relative to control',8,anchor='middle')
    return g

def figure4():
    g=Drawing(W,180)
    text(g,0,164,'a',11,'SansBold');text(g,17,164,'Common factual information and feasible options',10,'SansBold')
    line(g,17,153,505,153,LIGHT)
    arrow(g,261,147,261,132);line(g,126,130,396,130,GRAY,1)
    arrow(g,126,130,126,115);arrow(g,396,130,396,115)
    text(g,126,101,'Established guide',11,'SansBold',anchor='middle')
    text(g,126,85,'Active comparator',9,anchor='middle')
    text(g,396,101,'Same guide + proposed module',11,'SansBold',anchor='middle')
    text(g,396,85,'Time allocation · consequences · uncertainty',8.5,anchor='middle')
    arrow(g,126,76,126,60);arrow(g,396,76,396,60);line(g,126,59,396,59,GRAY,1)
    arrow(g,261,59,261,43)
    for x,title,sub in [(87,'Understanding','Independent scoring'),(261,'Transfer','Unfamiliar decision'),(435,'Burden','Time and non-completion')]:
        text(g,x,28,title,10.5,'SansBold',anchor='middle');text(g,x,12,sub,8.7,anchor='middle')
    return g

from figures_v3 import make_figures
figures=make_figures()
for n,g in figures.items():
    renderPDF.drawToFile(g,str(ASSETS/f'figure{n}.pdf'))
    renderSVG.drawToFile(g,str(ASSETS/f'figure{n}.svg'))
    pd=pdfium.PdfDocument(str(ASSETS/f'figure{n}.pdf'))
    pd[0].render(scale=300/72).to_pil().save(ASSETS/f'figure{n}.png',dpi=(300,300));pd.close()

source=(OLD/'manuscript_en.source.md').read_text(encoding='utf-8')
refs=json.loads((OLD/'references.json').read_text(encoding='utf-8'))
sections={}
for part in source.split('## ')[1:]:
    name,body=part.split('\n',1);sections[name.strip()]=body.strip()
title=source.splitlines()[0][2:]
sections['Abstract']=sections['Abstract'].split('\n\nKeywords:')[0]
sections['AI assistance']='OpenAI Codex assisted public-source retrieval, evidence organization, drafting, language revision and document preparation. Scientific Agent Skills workflows informed this process.[@E023] No AI system is listed as an author.'
sections['Funding']='This work was supported by Altman in a personal capacity. The sponsor had no role in research design, manuscript preparation or the decision to seek publication.'
sections['Competing interests']='The author declares no competing interests.'
sections['Data and code availability']='No new participant-level data were collected or analysed. Numerical findings are attributed to the original studies. Hypothetical examples, figure data and the scripts used to prepare the illustrations accompany this article.'
sections.pop('Author contributions and acknowledgements',None)
sections.pop('Ethics and consent',None)
sections['Contact']='Administrative contact: Mason Matthew, assistant; e1237966@outlook.com.'
sections['Why AI changes the comparison']=sections['Why AI changes the comparison'].replace('This example contains no health coefficient.','Figure 3b displays three hypothetical allocations. This example contains no health coefficient.')
sections['Why AI changes the comparison']=sections['Why AI changes the comparison'].replace('Earlier research on Facebook deactivation likewise illustrates', 'Table 2 compares the levels at which these AI outcomes are assessed. Earlier research on Facebook deactivation likewise illustrates')
sections['A comparative health consequence profile']=sections['A comparative health consequence profile'].replace('Table 1 specifies','Table 1 specifies')
sections['Applications and limits of inference']=sections['Applications and limits of inference'].replace('The financial increment is calculable under those assumptions;', 'Figure 6 aligns the comparison window. The financial increment is calculable under those assumptions;').replace('Table 2 preserves the principal design and interpretation limits.','Figure 5 shows selected estimates with their reported uncertainty.')
sections['Testing whether the framework improves decisions']=sections['Testing whether the framework improves decisions'].replace('This design tests the added package, including its burden.','Figure 7 summarizes the comparison. This design tests the added package, including its burden.')
captions={
1:'<b>Figure 1 | Health economic value across everyday decisions.</b> Work, food, digital life and time use enter a common comparison. Four consequence domains remain distinct. The figure organizes assessment; links do not represent estimated causal effects.',
2:'<b>Figure 2 | Measurement, prediction and appraisal.</b> <b>a,</b> Each operation asks a different question. <b>b,</b> A qualitative illustration of dominance and trade-offs. Positions are schematic and carry no numerical units. A two-dimensional picture cannot establish dominance if other relevant consequences or uncertainty overturn the comparison.',
3:'<b>Figure 3 | Task savings and the allocation of a day.</b> <b>a,</b> The accounting identity includes prompting, verification and rework in T1, additional tasks in A and other work-time changes in B. <b>b,</b> Hypothetical 24-hour budgets with an 8-hour baseline workday, a 4-hour task saving and B = 0. Non-work time is not assigned a health effect.',
4:'<b>Figure 4 | A map of candidate measurement domains.</b> <b>a,</b> The silhouette organizes examples; it does not localize psychological constructs or diagnose organs. Measures are selected for the decision and population, not administered as a universal panel. WHO-5 concerns two-week mental well-being.[@E017] <b>b,</b> Exposure, observed state and valued consequences occupy different roles; summing them can double-count a pathway. ICF informs the distinction between functioning and context.[@E016]',
5:'<b>Figure 5 | Selected estimates with their original uncertainty.</b> <b>a,</b> Stroke incidence from seven cohorts, follow-up 1–20 years.[@E018] <b>b,</b> Energy intake in a 20-person inpatient crossover diet trial.[@E019] <b>c,</b> Energy intake change versus control in a sleep-extension trial; 81 randomized, 80 in the reported analysis set.[@E020] <b>d,</b> Relevant-condition identification in hypothetical medical scenarios: control versus pooled AI assistance.[@E014] Bars denote 95% CIs in a, c and d; ±1 SE in b. Ratio axes are logarithmic. RR and OR are distinct; neither is an absolute probability change. No effects are pooled or converted to a personal health price.',
6:'<b>Figure 6 | Align the overtime alternatives.</b> Both options cover 28 days; supplements are assumed net and ordinary earnings equal. Option B adds CNY 90,000 and 21 overtime days. The timeline and arithmetic are hypothetical. Exposure, baseline state, recovery and later outcomes require additional evidence before an overall appraisal.',
7:'<b>Figure 7 | An active-control evaluation of the proposed module.</b> Both groups receive common facts and an established guide. The added package would be evaluated through understanding, transfer and burden, with follow-up of people who discontinue use. These are proposed procedures and outcomes, not trial results.',
8:'<b>Figure 8 | Conditions of choice and the distribution of consequences.</b> Workplace, platform, household and service conditions enter the available choice set. Individual, household and societal accounts can answer different questions. The diagram organizes institutional questions; arrows do not establish causal estimates or a hierarchy of whose interests count.'
}

table1=[['Domain','Minimum record','Interpretation'],
 ['Decision','Feasible alternatives; refusal; shared horizon','Nominal options may be unavailable'],
 ['Resources and time','Incremental money; total work; displaced activities','Task savings do not imply health gains'],
 ['Health and functioning','Relevant symptoms, function or clinical outcomes','Biomarkers do not rank human worth'],
 ['Experience','Enjoyment, relief or distress; during and after','Immediate benefit may not persist'],
 ['Capabilities and agency','Unaided ability; valued goals; actual discretion','Assistance is compatible with autonomy'],
 ['Evidence and appraisal','Population; comparator; horizon; uncertainty; goals','Unknown is distinct from zero']]
table1caption='<b>Table 1 | Minimum comparison record.</b> Proposed fields, not a validated scale. Health capability, ICF, WHO-5, MCDA and decision-quality research inform the distinctions.[@E004][@E016][@E017][@E009][@E021]'
table2=[['AI setting','Finding in the cited study','Limit of inference'],
 ['Professional writing\n453 participants [@E011]','Shorter task time and improved output quality','No full-day time-use or health estimate'],
 ['Companionship\nSeven-day Study 3 [@E013]','Immediate loneliness relief; no demonstrated persistent pre-interaction improvement','Differential attrition; non-time-matched control'],
 ['Medical information\n1,298 people [@E014]','Control versus pooled AI: relevant-condition identification OR 1.76 (95% CI 1.45–2.13)','Up to two scenarios per person; no clinical morbidity outcome']]
table2caption='<b>Table 2 | AI outcomes at different levels.</b> Selected studies; no pooled effect or participant-level reanalysis. OR is an odds ratio, not a probability increase.'
notes='Hall et al. has a meal-level correction (doi:10.1016/j.cmet.2019.05.020), retaining the quoted total-intake result. Bean et al. has an axis-label correction (doi:10.1038/s41591-026-04404-8), without changing the quoted OR. Tasali et al.’s analysis set includes one post-randomization exclusion and outcome-specific missingness. The published Noy–Zhang sample is used.'

sections['From market rewards to personal welfare'] += '\n\nFigure 1 locates the comparison across everyday settings. Figure 2 separates the observation of a state, prediction under alternatives and appraisal of what those consequences mean to the person.'
sections['Why AI changes the comparison']=sections['Why AI changes the comparison'].replace('(1)','(3)').replace('Equation (1)','Equation (3)')
sections['Formal representation of the comparison']='For compact notation, let x_i(a;τ) denote the consequence profile for person i under feasible option a at time τ. Its components record resources, time allocation, physical and mental functioning, experience and capabilities in their own units. For components with a defensible numerical scale, define the contrast with alternative b:\n\nΔx_i(a,b;τ) = x_i(a;τ) − x_i(b;τ).  (1)\n\nEquation (1) defines a contrast, not a prediction model. Categorical changes remain descriptive. The record attaches a source, uncertainty description and observation horizon to each component. A trajectory can be retained where timing matters; an endpoint alone need not represent the full experience. Table 1 lists the minimum record.\n\nIf all relevant criteria can be oriented so that larger values are preferred, a strictly dominates b in the Pareto sense if and only if the resulting vector z satisfies:\n\nΔz_j ≥ 0 for all j; Δz_k > 0 for some k.  (2)\n\nThis ordering is conditional on the completeness of the criteria, defensible preference directions and uncertainty that does not overturn the inequalities. It does not assign a universal favourable direction to blood-test values. When dimensions conflict, or the assumptions fail, a trade-off or unresolved ordering remains. No weights, price or estimated health coefficient are supplied by these definitions.'
sections['A comparative health consequence profile']=sections['A comparative health consequence profile'].replace('There is no universally favourable direction for every laboratory value.', 'There is no universally favourable direction for every laboratory value. Figure 4 maps examples of distinct constructs, including symptoms, metabolic indicators and independent task performance; these are candidate domains, not a recommended universal screening panel.')
sections['Applications and limits of inference']=sections['Applications and limits of inference'].replace('Figure 6 aligns the comparison window.', 'Figure 6 aligns the comparison window. Under these assumptions, the financial contrast is ΔY = 100,000 − 10,000 = 90,000 CNY (4).')
sections['Structural implications and boundaries']=sections['Structural implications and boundaries'].replace('Individual decision support has a limited remit.', 'Individual decision support has a limited remit. Figure 8 places the person within institutional conditions and separates the accounts of different actors.')

# Preserve the preceding draft's reference numbers while retaining stable evidence IDs.
order=list(dict.fromkeys(re.findall(r'\[@(E\d+)\]',source)))
numbers={e:i+1 for i,e in enumerate(order)};refmap={r['id']:r for r in refs}
def cite(t):
    return re.sub(r'(?:\[@E\d+\])+',lambda m:'['+', '.join(str(x) for x in sorted({numbers[e] for e in re.findall(r'E\d+',m.group())}))+']',t)
def plain(t):return re.sub('<[^>]+>','',cite(t))
def markup(t):
    t=cite(t)
    t=re.sub(r'([xz])_([ijk])',r'\1<sub>\2</sub>',t)
    return re.sub(r'\*\*(.*?)\*\*',r'<b>\1</b>',escape(t)).replace('&lt;b&gt;','<b>').replace('&lt;/b&gt;','</b>').replace('&lt;sub&gt;','<sub>').replace('&lt;/sub&gt;','</sub>')
def reftext(e):
    r=refmap[e];a=r['authors'];a+= '' if a.endswith('.') else '.'
    t=r['title'];t+='' if t.endswith(('.', '?','!')) else '.'
    v=r['journal']+(' '+r['volume'] if r['volume'] else '')+(', '+r['pages'] if r['pages'] else '')
    yr=str(r['year']) if r['year'] else 'n.d.'
    url='https://doi.org/'+r['doi'] if r['doi'] else r['url']
    return f'{numbers[e]}. {a} {t} {v} ({yr}). {url}'

S={
 'body':ParagraphStyle('body',fontName='Serif',fontSize=10.3,leading=12.9,textColor=BLACK,spaceAfter=6,allowWidows=0,allowOrphans=0),
 'heading':ParagraphStyle('heading',fontName='SansBold',fontSize=11.4,leading=14,spaceBefore=5,spaceAfter=7,textColor=colors.black,keepWithNext=True),
 'caption':ParagraphStyle('caption',fontName='Sans',fontSize=8.4,leading=10.6,spaceAfter=8,textColor=BLACK),
 'abstract':ParagraphStyle('abstract',fontName='Serif',fontSize=11,leading=14.2,textColor=BLACK),
 'reference':ParagraphStyle('reference',fontName='Serif',fontSize=8.5,leading=10.4,spaceAfter=5,textColor=BLACK),
 'cell':ParagraphStyle('cell',fontName='Sans',fontSize=8.6,leading=11,textColor=BLACK),
 'cellhead':ParagraphStyle('cellhead',fontName='SansBold',fontSize=8.8,leading=11,textColor=BLACK)
}
def para(t,style='body'):return Paragraph(markup(t),S[style])
def body(name,omit_first=False,start=None,end=None,heading=True):
    ps=sections[name].split('\n\n')
    if omit_first:ps=ps[1:]
    if start is not None or end is not None:ps=ps[start:end]
    items=[para(name,'heading')] if heading else []
    for p in ps:
        if p.startswith('ΔW ='):p='ΔW = −S + A + B.  (3)'
        items.append(para(p))
    return items
def fill(items,w,h):
    rest=list(items);drawn=[];used=0
    while rest:
        p=rest[0];_,ph=p.wrap(w,max(1,h-used));gap=p.getSpaceAfter()
        if p.getKeepWithNext() and len(rest)>1 and ph+gap+26>h-used:break
        if ph+gap<=h-used+0.01:
            drawn.append((p,ph,gap));used+=ph+gap;rest.pop(0)
        else:
            parts=p.split(w,max(0,h-used-gap))
            if len(parts)>1:
                first=parts[0];_,fh=first.wrap(w,h-used);drawn.append((first,fh,0));used+=fh;rest=parts[1:]+rest[1:]
            break
    return drawn,rest,used
layout_log=[]
def columns(c,items,top,bottom=55,x=45,width=W,gutter=20):
    cw=(width-gutter)/2;maxh=top-bottom
    low=1;high=maxh
    for _ in range(16):
        mid=(low+high)/2
        a,rest,_=fill(items,cw,mid);b,remaining,_=fill(rest,cw,mid)
        if remaining:low=mid
        else:high=mid
    h=min(maxh,high+.4);a,rest,ua=fill(items,cw,h);b,remaining,ub=fill(rest,cw,h)
    if remaining:
        required=maxh
        while required<800:
            required+=10
            _,testrest,_=fill(items,cw,required);_,testleft,_=fill(testrest,cw,required)
            if not testleft:break
        total=sum(p.wrap(cw,2000)[1]+p.getSpaceAfter() for p in items)
        raise RuntimeError(f'Page {c.getPageNumber()} overflow: {len(remaining)} items, available={maxh:.1f}, required~{required:.1f}, total={total:.1f}, colwidth={cw}, itemlengths={[len(p.text) for p in items]}')
    for col,itemscol in enumerate([a,b]):
        yy=top
        for p,ph,gap in itemscol:p.drawOn(c,x+col*(cw+gutter),yy-ph);yy-=ph+gap
    layout_log.append({'page':c.getPageNumber(),'top':top,'column_heights':[ua,ub],'bottom':top-max(ua,ub)})

def at(c,p,y,x=45,width=W):
    _,h=p.wrap(width,1000);p.drawOn(c,x,y-h);return y-h-p.getSpaceAfter()
def page(c,n,label='PERSPECTIVE'):
    c.setFillColor(colors.black);c.setFont('SansBold',8);c.drawString(45,759,label)
    c.setFont('Sans',8);c.drawRightString(567,759,'Health economic value in the AI era')
    c.setStrokeColor(LIGHT);c.setLineWidth(.65);c.line(45,751,567,751)
    c.setFont('Sans',8);c.drawString(45,29,'Richard T. Millian');c.drawRightString(567,29,str(n))
def drawfig(c,n,y):
    g=figures[n];renderPDF.draw(g,c,45,y-g.height)
    return at(c,para(captions[n],'caption'),y-g.height-5)-7
def table_object(rows,widths):
    vals=[[para(cell.replace('\n','<br/>'),'cellhead' if i==0 else 'cell') for cell in row] for i,row in enumerate(rows)]
    # Restore intentional line breaks after XML escaping in para.
    vals=[[Paragraph(markup(cell).replace('&lt;br/&gt;','<br/>'),S['cellhead' if i==0 else 'cell']) for cell in row] for i,row in enumerate([[c.replace('\n','<br/>') for c in r] for r in rows])]
    t=Table(vals,colWidths=widths,repeatRows=1,hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#edf1f2')),('LINEABOVE',(0,0),(-1,0),.8,GRAY),('LINEBELOW',(0,0),(-1,0),.5,GRAY),('LINEBELOW',(0,1),(-1,-1),.35,LIGHT),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)]))
    return t
def drawtable(c,rows,caption,y,widths):
    y=at(c,para(caption,'caption'),y);t=table_object(rows,widths);_,h=t.wrap(W,1000);t.drawOn(c,45,y-h);return y-h-15

pdf=ROOT/'Health_value_AI_Illustrated.pdf'
c=canvas.Canvas(str(pdf),pagesize=(612,792),pageCompression=1)
c.setTitle(title);c.setAuthor('Richard T. Millian');c.setSubject('Health economics Perspective with conceptual and source-reported figures')
page(c,1)
y=730
title_style=ParagraphStyle('title',fontName='Display',fontSize=26,leading=29,textColor=colors.black)
y=at(c,Paragraph(escape(title),title_style),y)-14
c.setFont('SansBold',10.5);c.drawString(45,y,'Richard T. Millian');y-=15
c.setFont('Sans',9.5);c.drawString(45,y,'Hangzhou Normal University');y-=22
y=at(c,para(sections['Abstract'],'abstract'),y)-10
y=drawfig(c,1,y)
if y<48:raise RuntimeError(f'Page 1 overflow {y}')
layout_log.append({'page':1,'bottom':y});c.showPage()
page(c,2);y=drawfig(c,2,734);columns(c,body('From market rewards to personal welfare'),y);c.showPage()
page(c,3);y=drawtable(c,table1,table1caption,734,[103,217,202]);columns(c,body('Valuation without a universal price'),y);c.showPage()
page(c,4);y=drawfig(c,3,734);columns(c,body('Formal representation of the comparison')+body('Why AI changes the comparison',end=3),y);c.showPage()
page(c,5);y=drawtable(c,table2,table2caption,734,[130,222,170]);columns(c,body('Why AI changes the comparison',start=3,heading=False)+body('A comparative health consequence profile',end=2),y,bottom=45);c.showPage()
page(c,6);y=drawfig(c,4,734);columns(c,body('A comparative health consequence profile',start=2,heading=False),y);c.showPage()
page(c,7);y=drawfig(c,5,734);columns(c,body('Applications and limits of inference',end=1),y);c.showPage()
page(c,8);y=drawfig(c,6,734);columns(c,body('Applications and limits of inference',start=1,heading=False),y);c.showPage()
page(c,9);y=drawfig(c,7,734);columns(c,body('Testing whether the framework improves decisions',end=4),y,bottom=45);c.showPage()
page(c,10);y=drawfig(c,8,734);items=body('Testing whether the framework improves decisions',start=4,heading=False)+body('Structural implications and boundaries')

columns(c,items,y);c.showPage()
page(c,11,'REFERENCES');items=[para('<b>'+name+'.</b> '+sections[name],'reference') for name in ['Data and code availability','Funding','Competing interests','AI assistance','Contact']]
items += [para('References','heading')]+[para(reftext(e),'reference') for e in order]
items += [para('Source notes','heading'),para(notes,'reference')]
columns(c,items,733);c.showPage();c.save()

# Editable companion with the same scientific content and visual components.
doc=Document()
for ob in list(doc.styles.element.iter(qn('w:pBdr'))):ob.getparent().remove(ob)
normal=doc.styles['Normal'];normal.font.name='Times New Roman';normal.font.size=Pt(10.3)
normal.paragraph_format.line_spacing=1.08;normal.paragraph_format.space_after=Pt(5)
normal.paragraph_format.widow_control=True
for name,size in [('Title',26),('Heading 1',12),('Heading 2',10.5)]:
    st=doc.styles[name];st.font.name='Arial';st.font.size=Pt(size);st.font.bold=True;st.font.color.rgb=RGBColor(0,0,0)
    st.paragraph_format.space_before=Pt(6);st.paragraph_format.space_after=Pt(6);st.paragraph_format.keep_with_next=True
    fonts=st.element.get_or_add_rPr().get_or_add_rFonts()
    for key in ['asciiTheme','hAnsiTheme','eastAsiaTheme','cstheme']:
        if qn('w:'+key) in fonts.attrib:del fonts.attrib[qn('w:'+key)]
doc.styles['Title'].font.name='Georgia'

def setsection(sec,cols=1):
    sec.page_width=Inches(8.5);sec.page_height=Inches(11)
    sec.left_margin=sec.right_margin=Inches(.625);sec.top_margin=Inches(.66);sec.bottom_margin=Inches(.62)
    sec.header_distance=sec.footer_distance=Inches(.29)
    col=sec._sectPr.find(qn('w:cols'));col.set(qn('w:num'),str(cols));col.set(qn('w:space'),'320')
def newpage():
    current=doc.sections[-1]._sectPr.find(qn('w:cols'))
    if current.get(qn('w:num'))=='2':
        # End the two-column section continuously so Word balances its columns.
        setsection(doc.add_section(WD_SECTION_START.CONTINUOUS),1)
    setsection(doc.add_section(WD_SECTION_START.NEW_PAGE),1)
def two_cols():setsection(doc.add_section(WD_SECTION_START.CONTINUOUS),2)
setsection(doc.sections[0])
header=doc.sections[0].header.paragraphs[0];header.text='PERSPECTIVE  |  Health economic value in the AI era'
for r in header.runs:r.font.name='Arial';r.font.size=Pt(8);r.font.color.rgb=RGBColor(0,0,0)
f=doc.sections[0].footer.paragraphs[0];f.text='Richard T. Millian';f.alignment=WD_ALIGN_PARAGRAPH.RIGHT
f.add_run('    ');fld=OxmlElement('w:fldSimple');fld.set(qn('w:instr'),'PAGE');f._p.append(fld)
for r in f.runs:r.font.size=Pt(8)
def dp(t,style=None):
    p=doc.add_paragraph(style=style)
    for seg in re.split(r'(<b>.*?</b>)',cite(t)):
        if not seg:continue
        
        for token in re.split(r'([xz]_[ijk])',re.sub('<[^>]+>','',seg)):
            if re.fullmatch(r'[xz]_[ijk]',token):
                p.add_run(token[0]);r=p.add_run(token[2]);r.font.subscript=True
            else:r=p.add_run(token)
            if seg.startswith('<b>'):r.bold=True
    return p
def dc(t):
    p=dp(t);p.paragraph_format.line_spacing=1.05;p.paragraph_format.space_after=Pt(8)
    for r in p.runs:r.font.name='Arial';r.font.size=Pt(8.5)
def df(n):
    pic=doc.add_picture(str(ASSETS/f'figure{n}.png'),width=Inches(7.25));pic._inline.docPr.set('descr',plain(captions[n]));dc(captions[n])
def db(name,omit_first=False,start=None,end=None,heading=True):
    if heading:dp(name,'Heading 1')
    ps=sections[name].split('\n\n')
    if omit_first:ps=ps[1:]
    if start is not None or end is not None:ps=ps[start:end]
    for p in ps:
        if p.startswith(('ΔW =','Δx_i','Δz_j')):
            q=doc.add_paragraph();q.alignment=WD_ALIGN_PARAGRAPH.CENTER
            eq='ΔW = −S + A + B.  (3)' if p.startswith('ΔW =') else p
            m=OxmlElement('m:oMath')
            for token in re.split(r'([xz]_[ijk])',eq):
                if re.fullmatch(r'[xz]_[ijk]',token):
                    sub=OxmlElement('m:sSub')
                    for tag,txt in [('m:e',token[0]),('m:sub',token[2])]:
                        el=OxmlElement(tag);rr=OxmlElement('m:r');tt=OxmlElement('m:t');tt.text=txt;rr.append(tt);el.append(rr);sub.append(el)
                    m.append(sub)
                else:
                    rr=OxmlElement('m:r');tt=OxmlElement('m:t');tt.text=token;rr.append(tt);m.append(rr)
            q._p.append(m)
        else:dp(p)

def dt(rows,caption,widths):
    dc(caption);t=doc.add_table(rows=1,cols=3);t.autofit=False
    for j,w in enumerate(widths):t.columns[j].width=Inches(w/72)
    for i,row in enumerate(rows):
        cells=t.rows[0].cells if i==0 else t.add_row().cells
        pr=cells[0]._tc.getparent().get_or_add_trPr();pr.append(OxmlElement('w:cantSplit'))
        if i==0:pr.append(OxmlElement('w:tblHeader'))
        for j,(cell,txt) in enumerate(zip(cells,row)):
            cell.width=Inches(widths[j]/72);p=cell.paragraphs[0];p.text=plain(txt)
            p.paragraph_format.line_spacing=1.05;p.paragraph_format.space_after=Pt(4);p.paragraph_format.space_before=Pt(4)
            for r in p.runs:r.font.name='Arial';r.font.size=Pt(8.5);r.bold=i==0
            if i==0:
                sh=OxmlElement('w:shd');sh.set(qn('w:fill'),'EDF1F2');cell._tc.get_or_add_tcPr().append(sh)
    b=OxmlElement('w:tblBorders')
    for side in ['top','bottom','insideH']:
        e=OxmlElement('w:'+side);e.set(qn('w:val'),'single');e.set(qn('w:sz'),'4');e.set(qn('w:color'),'BAC5CA');b.append(e)
    t._tbl.tblPr.append(b);doc.add_paragraph().paragraph_format.space_after=Pt(0)
dp(title,'Title');dp('Richard T. Millian');dp('Hangzhou Normal University')
dp(sections['Abstract']);df(1)
newpage();df(2);two_cols();db('From market rewards to personal welfare')
newpage();dt(table1,table1caption,[103,217,202]);two_cols();db('Valuation without a universal price')
newpage();df(3);two_cols();db('Formal representation of the comparison');db('Why AI changes the comparison',end=3)
newpage();dt(table2,table2caption,[130,222,170]);two_cols();db('Why AI changes the comparison',start=3,heading=False);db('A comparative health consequence profile',end=2)
newpage();df(4);two_cols();db('A comparative health consequence profile',start=2,heading=False)
newpage();df(5);two_cols();db('Applications and limits of inference',end=1)
newpage();df(6);two_cols();db('Applications and limits of inference',start=1,heading=False)
newpage();df(7);two_cols();db('Testing whether the framework improves decisions',end=4)
newpage();df(8);two_cols();db('Testing whether the framework improves decisions',start=4,heading=False);db('Structural implications and boundaries')
newpage();two_cols()
for name in ['Data and code availability','Funding','Competing interests','AI assistance','Contact']:
    p=dp('<b>'+name+'.</b> '+sections[name]);p.paragraph_format.line_spacing=1;p.paragraph_format.space_after=Pt(5)
    for r in p.runs:r.font.size=Pt(8.5)
dp('References','Heading 1')
for e in order:
    p=dp(reftext(e));p.paragraph_format.line_spacing=1;p.paragraph_format.space_after=Pt(5)
    for r in p.runs:r.font.size=Pt(8.5)
dp('Source notes','Heading 2');p=dp(notes)
for r in p.runs:r.font.size=Pt(8.5)
doc.core_properties.title=title;doc.core_properties.author='Richard T. Millian'
doc.save(ROOT/'Health_value_AI_Illustrated.docx')

# Readable source and evidence record, separate from publication-looking pages.
mainnames=['Abstract','From market rewards to personal welfare','Valuation without a universal price','Formal representation of the comparison','Why AI changes the comparison','A comparative health consequence profile','Applications and limits of inference','Testing whether the framework improves decisions','Structural implications and boundaries','Data and code availability','Funding','Competing interests','AI assistance','Contact']
md='# '+title+'\n\nRichard T. Millian\n\nHangzhou Normal University\n\n'+'\n\n'.join('## '+name+'\n\n'+sections[name] for name in mainnames)
md+='\n\n## Figures\n\n'+'\n\n'.join(re.sub('<[^>]+>','',captions[n])+f'\n\n![Figure {n}](figures/figure{n}.png)' for n in figures)
for rows,cap in [(table1,table1caption),(table2,table2caption)]:
    md+='\n\n'+re.sub('<[^>]+>','',cap)+'\n\n'+'\n'.join('| '+' | '.join(c.replace('\n','; ') for c in row)+' |'+ ('\n|---|---|---|' if i==0 else '') for i,row in enumerate(rows))
md+='\n\n## Source notes\n\n'+notes
(ROOT/'manuscript_en.source.md').write_text(md+'\n',encoding='utf-8')
(ROOT/'manuscript_en.md').write_text(cite(md)+'\n\n## References\n\n'+'\n\n'.join(reftext(e) for e in order)+'\n',encoding='utf-8')
(ROOT/'references.json').write_text(json.dumps(refs,ensure_ascii=False,indent=2),encoding='utf-8')
with (ROOT/'figure_data.csv').open('w',encoding='utf-8-sig',newline='') as f:
    wr=csv.writer(f);wr.writerow(['figure','panel','evidence_id','quantity','estimate','lower','upper','interval','unit','status'])
    wr.writerows([[5,'d','E014','relevant_condition_identification_OR',1.76,1.45,2.13,'95% CI','odds ratio','source_reported; control versus pooled AI'],[5,'a','E018','stroke_incidence_RR',1.35,1.13,1.61,'95% CI','relative risk','source_reported'],[5,'b','E019','energy_intake_difference',508,402,614,'estimate +/- one SE; SE=106','kcal/day','endpoints derived from source-reported estimate and SE'],[5,'c','E020','energy_intake_change_vs_control',-270,-393,-147,'95% CI','kcal/day','source_reported'],[3,'b','E900','work_change_no_added_tasks',-240,'','','none','minutes','hypothetical'],[3,'b','E900','work_change_180_added',-60,'','','none','minutes','hypothetical'],[3,'b','E900','work_change_300_added',60,'','','none','minutes','hypothetical'],[6,'a','E900','extra_supplement',90000,'','','none','CNY','hypothetical'],[6,'a','E900','extra_overtime_days',21,'','','none','days','hypothetical']])
with (ROOT/'figure_data.csv').open('a',encoding='utf-8',newline='') as f:
    wr=csv.writer(f)
    for name,work,nonwork in [('baseline',8,16),('no_added_tasks',4,20),('three_added_hours',7,17),('five_added_hours',9,15)]:
        wr.writerow([3,'b','E900',name+'_work',work,'','','none','hours','hypothetical'])
        wr.writerow([3,'b','E900',name+'_nonwork',nonwork,'','','none','hours','hypothetical'])
    for name,value,unit in [('common_horizon',28,'days'),('option_A_overtime',7,'days'),('option_B_overtime',28,'days'),('option_A_supplement',10000,'CNY'),('option_B_supplement',100000,'CNY')]:
        wr.writerow([6,'a','E900',name,value,'','','none',unit,'hypothetical'])
(ROOT/'layout_checks.json').write_text(json.dumps(layout_log,indent=2),encoding='utf-8')
(ROOT/'internal_status.json').write_text(json.dumps({'submission_ready':False,'human_verification_complete':False,'reader_facing_placeholders_omitted_at_user_request':True,'visual_design':'Original layout informed by inspected published Perspectives; no publisher branding or publication status asserted','source_version':'health_value_ai_v2','reference_numbers':numbers},indent=2),encoding='utf-8')
print(json.dumps({'pdf_pages':11,'figures':8,'tables':2,'references':len(refs),'layout':layout_log}))
