"""Original vector illustrations; no generated observations or copied journal art."""
import math
from reportlab.graphics.shapes import Drawing, Group, Line, Rect, Circle, Ellipse, String, PolyLine, Polygon, Path
from reportlab.lib.colors import HexColor, Color

INK=HexColor('#182B35'); MUTED=HexColor('#576B75'); GRID=HexColor('#CCD7DB')
TEAL=HexColor('#157F82'); BLUE=HexColor('#3A64A0'); RUST=HexColor('#B76040'); PURPLE=HexColor('#806799'); GOLD=HexColor('#BE963C')
PALE=HexColor('#EFF5F5'); WHITE=HexColor('#FFFFFF'); W=522

def t(g,x,y,s,size=9,bold=False,col=INK,anchor='start'):
    g.add(String(x,y,s,fontName='SansBold' if bold else 'Sans',fontSize=size,fillColor=col,textAnchor=anchor))
def lines(g,x,y,ss,size=9,leading=12,col=INK,anchor='start'):
    for k,s in enumerate(ss):t(g,x,y-k*leading,s,size,col=col,anchor=anchor)
def ln(g,x1,y1,x2,y2,col=GRID,sw=.7,dash=None):
    ob=Line(x1,y1,x2,y2,strokeColor=col,strokeWidth=sw)
    if dash:ob.strokeDashArray=dash
    g.add(ob)
def rect(g,x,y,w,h,fill=PALE,stroke=None,r=0):g.add(Rect(x,y,w,h,rx=r,ry=r,fillColor=fill,strokeColor=stroke,strokeWidth=.8))
def arrow(g,x1,y1,x2,y2,col=MUTED,sw=1):
    ln(g,x1,y1,x2,y2,col,sw);a=math.atan2(y2-y1,x2-x1)
    g.add(Polygon([x2,y2,x2-5*math.cos(a)+2.5*math.sin(a),y2-5*math.sin(a)-2.5*math.cos(a),x2-5*math.cos(a)-2.5*math.sin(a),y2-5*math.sin(a)+2.5*math.cos(a)],fillColor=col,strokeColor=None))
def panel(g,x,y,letter,title):
    t(g,x,y,letter,11,True);t(g,x+17,y,title,10,True)
def circle(g,x,y,r,fill=None,stroke=GRID,sw=1):g.add(Circle(x,y,r,fillColor=fill,strokeColor=stroke,strokeWidth=sw))

def human(g,x,y,scale=1,col=BLUE):
    """Stylized whole-person silhouette with no diagnostic localization."""
    a=Group();a.add(Circle(0,58,12,fillColor=HexColor('#DCE8EE'),strokeColor=col,strokeWidth=1.1))
    p=Path(fillColor=HexColor('#E9F0F3'),strokeColor=col,strokeWidth=1.2)
    p.moveTo(-7,44);p.curveTo(-22,42,-24,31,-27,15);p.lineTo(-32,-6);p.curveTo(-33,-12,-27,-14,-24,-9)
    p.lineTo(-15,18);p.lineTo(-13,-12);p.lineTo(-15,-53);p.curveTo(-14,-60,-5,-59,-5,-52);p.lineTo(0,-17)
    p.lineTo(5,-52);p.curveTo(5,-59,14,-60,15,-53);p.lineTo(13,-12);p.lineTo(15,18);p.lineTo(24,-9)
    p.curveTo(27,-14,33,-12,32,-6);p.lineTo(27,15);p.curveTo(24,31,22,42,7,44);p.closePath()
    a.add(p);a.scale(scale,scale);a.translate(x/scale,y/scale);g.add(a)

def icon(g,kind,x,y,s=1,col=TEAL):
    a=Group()
    if kind=='work':
        rect(a,-23,-1,46,28,None,col,2);ln(a,-27,-5,27,-5,col,1.4);ln(a,0,-1,0,-5,col,1.4)
        for z in range(3):ln(a,-15,20-z*6,13-z*5,20-z*6,col,1)
    elif kind=='food':
        circle(a,0,10,20,None,col,1.1);circle(a,0,10,15,None,col,.7)
        a.add(Ellipse(-5,12,6,10,fillColor=HexColor('#B7D9C7'),strokeColor=col,strokeWidth=.7))
        a.add(Ellipse(7,8,5,7,fillColor=HexColor('#E9C393'),strokeColor=RUST,strokeWidth=.7))
        ln(a,-27,-8,-27,27,col,1.3);ln(a,27,-8,27,27,col,1.3)
    elif kind=='digital':
        rect(a,-13,-12,26,43,None,col,3);ln(a,-8,24,8,24,col,.6);circle(a,0,-7,1.3,col,col)
        rect(a,-7,6,20,11,HexColor('#DFEBF0'),None,2);ln(a,-4,13,8,13,col,.8);ln(a,-4,9,4,9,col,.8)
    elif kind=='activity':
        circle(a,0,29,5,None,col,1.5);ln(a,0,23,-4,8,col,2);ln(a,-4,8,8,0,col,2)
        ln(a,8,0,14,-12,col,2);ln(a,-4,8,-13,-10,col,2);ln(a,-1,18,12,15,col,2);ln(a,-1,18,-13,15,col,2)
    elif kind=='clock':
        circle(a,0,8,19,None,col,1.2);ln(a,0,8,0,22,col,1.3);ln(a,0,8,10,2,col,1.3)
    elif kind=='money':
        rect(a,-24,-3,48,26,None,col,2);circle(a,0,10,8,None,col,1);t(a,0,6,'¥',11,True,col,'middle')
        ln(a,-18,9,-13,9,col,1);ln(a,13,9,18,9,col,1)
    elif kind=='mind':
        circle(a,0,10,20,HexColor('#F0EAF4'),col,1)
        for dx,dy in [(-8,17),(5,21),(9,7),(-4,-1)]:circle(a,dx,dy,2.2,col,col)
        ln(a,-8,17,5,21,col);ln(a,5,21,9,7,col);ln(a,-8,17,-4,-1,col);ln(a,-4,-1,9,7,col)
    a.scale(s,s);a.translate(x/s,y/s);g.add(a)

def fig1():
    g=Drawing(W,305)
    panel(g,0,290,'a','Everyday decisions in an AI-mediated environment')
    for x,kind,title,desc,col in [(60,'work','Work','Tasks and pay',TEAL),(194,'food','Food','Cost and preparation',RUST),(328,'digital','Digital life','Information and leisure',BLUE),(462,'activity','Time use','Rest, movement and care',PURPLE)]:
        icon(g,kind,x,247,.8,col);t(g,x,218,title,9.3,True,col,'middle');t(g,x,205,desc,8,col=MUTED,anchor='middle')
    ln(g,0,193,W,193)
    panel(g,0,177,'b','Follow consequences for the person')
    human(g,261,104,.72)
    # Four outcome domains form a ring around a person, not an additive score.
    for x,y,label,desc,col in [(88,137,'Resources and time',['Disposable resources','Activities displaced'],TEAL),(434,137,'Health and functioning',['Physical and mental','Daily functioning'],BLUE),(88,73,'Experience',['Enjoyment and relief','Distress and burden'],RUST),(434,73,'Capabilities and agency',['Unaided ability','Goals and discretion'],PURPLE)]:
        t(g,x,y,label,9.3,True,col,'middle');lines(g,x,y-14,desc,8.5,11,MUTED,'middle')
    for x1,y1,x2,y2,col in [(175,126,224,126,TEAL),(347,126,298,126,BLUE),(175,64,231,64,RUST),(347,64,291,64,PURPLE)]:arrow(g,x1,y1,x2,y2,col,.8)
    ln(g,0,39,W,39)
    t(g,0,22,'c',11,True);t(g,17,22,'Compare feasible alternatives over a shared horizon',10,True)
    t(g,17,7,'Personal priorities • Constraints • Evidence and uncertainty • Effects on others',8.5,col=MUTED)
    return g

def fig2():
    g=Drawing(W,250)
    panel(g,0,235,'a','Three distinct operations')
    for j,(title,ss,col) in enumerate([('MEASURE',['What is observed?','Symptoms, time, income'],TEAL),('PREDICT',['What changes under each option?','Population, comparator, horizon'],BLUE),('APPRAISE',['How does the difference matter?','Goals, constraints, preferences'],PURPLE)]):
        x=j*179;rect(g,x,154,164,60,HexColor(['#E9F4F2','#EAF0F8','#F0ECF5'][j]))
        t(g,x+10,198,title,9.5,True,col);lines(g,x+10,182,ss,8,12)
        if j<2:arrow(g,x+165,183,x+177,183)
    panel(g,0,131,'b','What the profile can and cannot order')
    # Qualitative order diagram: axes deliberately carry no numerical units.
    ox,oy=36,24;arrow(g,ox,oy,211,oy,INK);arrow(g,ox,oy,ox,114,INK)
    t(g,127,7,'More disposable resources',8,col=MUTED,anchor='middle')
    t(g,41,115,'More of a valued functioning',7.8,col=MUTED)
    for x,y,label,col in [(73,47,'A',TEAL),(124,86,'B',BLUE),(180,42,'C',RUST)]:
        circle(g,x,y,4,col,col);t(g,x+8,y-3,label,9,True,col)
    arrow(g,78,51,117,80,BLUE)
    ln(g,126,83,176,46,RUST,.8,[3,3])
    t(g,247,106,'B versus A',9.4,True,BLUE);lines(g,247,92,['A dominance comparison is possible only when','all relevant dimensions and uncertainty allow it.'],8.4,12)
    t(g,247,56,'B versus C',9.4,True,RUST);lines(g,247,42,['More resources and more functioning diverge.','The graph alone cannot supply a preference.'],8.4,12)
    return g

def fig3():
    g=Drawing(W,280)
    panel(g,0,265,'a','Account for all work time')
    labels=[('T0','Without AI'),('T1','Prompt + check + rework'),('S = T0 − T1','Task saving'),('ΔW = −S + A + B','Total work change')]
    for j,(eq,desc) in enumerate(labels):
        x=j*134;t(g,x,240,eq,11.4,True,TEAL if j<3 else RUST);t(g,x,224,desc,7.8,col=MUTED)
    ln(g,0,211,W,211)
    panel(g,0,195,'b','The same task saving can lead to different days')
    t(g,0,180,'Hypothetical 24-hour budgets; 4 hours saved; other work-time change B = 0',8.4,col=MUTED)
    x0=145;scale=325/24
    rows=[('Without AI',8,16,None),('No added tasks',4,20,-4),('3 added hours',7,17,-1),('5 added hours',9,15,1)]
    for i,(label,work,other,change) in enumerate(rows):
        y=145-i*30;t(g,0,y+4,label,9,True if i==0 else False)
        rect(g,x0,y,work*scale,19,BLUE);rect(g,x0+work*scale,y,other*scale,19,HexColor('#D7EBE6'))
        t(g,x0+work*scale/2,y+6,str(work)+' h',8.4,True,WHITE,'middle')
        t(g,x0+(work+other/2)*scale,y+6,str(other)+' h',8.4,col=TEAL,anchor='middle')
        if change is not None:t(g,517,y+5,f'{change:+d} h'.replace('-','−'),9,True,RUST if change>0 else TEAL,'end')
    t(g,145,28,'Work',8.5,True,BLUE);t(g,208,28,'All non-work activities',8.5,True,TEAL)
    t(g,517,28,'Δ work',8.5,True,MUTED,'end')
    t(g,0,7,'Non-work time still needs to be allocated among sleep, care, activity, social contact and leisure.',8.3,col=MUTED)
    return g

def fig4():
    g=Drawing(W,275)
    panel(g,0,260,'a','Match the measure to the construct')
    g.add(Ellipse(258,150,66,85,fillColor=None,strokeColor=GRID,strokeWidth=.8))
    human(g,258,133,1.15)
    # Callouts attach to a whole-person boundary, not to purported brain/organ loci.
    anchors=[(208,205),(308,205),(192,145),(324,145),(216,85),(300,85)]
    entries=[(0,215,'Cognition and attention',['Independent task performance','Perceived difficulty'],PURPLE),
             (350,215,'Mental well-being',['WHO-5: preceding two weeks','Not a diagnostic test'],PURPLE),
             (0,155,'Vision and skin',['Relevant symptoms','Effects on daily activities'],BLUE),
             (350,155,'Metabolic indicators',['Glucose or lipid measures','Only with a defined clinical role'],BLUE),
             (0,95,'Physical capacity',['Muscle function or strength','Activity limitations'],TEAL),
             (350,95,'Experience and agency',['Enjoyment, distress, choice','Goals and actual discretion'],RUST)]
    for i,(x,y,label,ss,col) in enumerate(entries):
        t(g,x,y,label,9,True,col);lines(g,x,y-15,ss,8.2,12)
        ax,ay=anchors[i];ex=166 if x==0 else 341;ey=y-10
        ln(g,ax,ay,(ax+ex)/2,ay,col,.8);ln(g,(ax+ex)/2,ay,ex,ey,col,.8);circle(g,ax,ay,2.6,col,col)
    ln(g,0,58,W,58)
    panel(g,0,43,'b','Keep causes, measurements and consequences separate')
    for x,ss,col in [(0,['Exposure','Sleep schedule • diet • sitting'],TEAL),(185,['Observed state','Symptoms • function • tests'],BLUE),(371,['Valued consequences','Daily life • experience • agency'],RUST)]:
        t(g,x,25,ss[0],9,True,col);t(g,x,10,ss[1],7.7,col=MUTED)
    arrow(g,160,24,177,24);arrow(g,346,24,363,24)
    return g

def estimate_panel(g,x,y,letter,title,design,estimate,lo,hi,xmin,xmax,ticks,log,headline,interval,comparison,col):
    panel(g,x,y,letter,title);t(g,x+17,y-15,design,8,col=MUTED)
    t(g,x+17,y-40,headline,17,True,col);t(g,x+17,y-57,interval,8.5)
    fx=lambda v:x+30+((math.log(v)-math.log(xmin))/(math.log(xmax)-math.log(xmin)) if log else (v-xmin)/(xmax-xmin))*187
    yy=y-100;ln(g,x+30,yy-22,x+217,yy-22,MUTED)
    zero=1 if log else 0
    if xmin<=zero<=xmax:ln(g,fx(zero),yy-17,fx(zero),yy+18,MUTED,.7,[2,2])
    ln(g,fx(lo),yy,fx(hi),yy,col,2)
    for v in [lo,hi]:ln(g,fx(v),yy-5,fx(v),yy+5,col,1.2)
    circle(g,fx(estimate),yy,3.6,col,col)
    for tick in ticks:
        xx=fx(tick);ln(g,xx,yy-22,xx,yy-26,MUTED);t(g,xx,yy-38,str(tick).replace('-','−'),8,col=MUTED,anchor='middle')
    lines(g,x+17,y-160,comparison,8.2,11)

def fig5():
    g=Drawing(W,420)
    estimate_panel(g,0,405,'a','Long working hours','7 cohorts • 162,644 participants',1.35,1.13,1.61,.9,1.8,[1,1.2,1.5,1.8],True,'RR 1.35','95% CI 1.13–1.61',['Stroke incidence; log ratio scale','≥55 versus 35–40 hours/week'],TEAL)
    estimate_panel(g,270,405,'b','Diet composition','Randomized crossover • 20 adults',508,402,614,-500,750,[-500,0,500],False,'+508 kcal/day','±1 SE (106 kcal/day)',['Energy intake difference','Ultra-processed versus unprocessed'],RUST)
    ln(g,0,215,W,215);ln(g,255,226,255,410)
    estimate_panel(g,0,192,'c','Sleep extension','81 randomized • 80 in analysis set',-270,-393,-147,-500,750,[-500,0,500],False,'−270 kcal/day','95% CI −393 to −147',['Energy intake change versus control','Short-sleeping adults with overweight'],BLUE)
    estimate_panel(g,270,192,'d','AI medical information','Randomized study • 1,298 people',1.76,1.45,2.13,.8,2.5,[1,1.5,2],True,'OR 1.76','95% CI 1.45–2.13',['Relevant-condition identification','Control versus pooled AI; log ratio scale'],PURPLE)
    ln(g,255,15,255,197)
    return g

def fig6():
    g=Drawing(W,290)
    panel(g,0,275,'a','Use the same 28-day comparison window')
    x0=131;step=12
    for i,(title,n,total) in enumerate([('Option A',7,'CNY 10,000'),('Option B',28,'CNY 100,000')]):
        y=232-i*48;t(g,0,y+7,title,10,True);t(g,0,y-7,total,9,col=TEAL if i==0 else BLUE)
        for j in range(28):rect(g,x0+j*step,y,10,17,(TEAL if i==0 else BLUE) if j<n else HexColor('#E6ECEE'))
    for day in [1,7,14,21,28]:t(g,x0+(day-1)*step+5,163,str(day),8,col=MUTED,anchor='middle')
    t(g,485,163,'day',8,col=MUTED)
    rect(g,131,142,9,9,TEAL);t(g,145,142,'Overtime',8);rect(g,227,142,9,9,HexColor('#E6ECEE'));t(g,241,142,'No overtime',8)
    ln(g,0,127,W,127)
    panel(g,0,110,'b','The financial difference is computable')
    icon(g,'money',29,72,.8,TEAL);t(g,63,81,'ΔY = 100,000 − 10,000 = 90,000 CNY',12,True,TEAL)
    t(g,63,62,'Net supplements; ordinary earnings held equal; 21 more overtime days',8,col=MUTED)
    panel(g,0,39,'c','The health comparison requires an additional evidential step')
    t(g,17,20,'Exposure and baseline state',8.7,True,BLUE);arrow(g,196,23,220,23,BLUE)
    t(g,231,20,'Recovery and later outcomes',8.7,True,BLUE);arrow(g,406,23,429,23,BLUE)
    t(g,440,20,'Appraisal',8.7,True,PURPLE)
    return g

def fig7():
    g=Drawing(W,285)
    panel(g,0,270,'a','Test the added value of the comparison module')
    t(g,261,246,'COMMON FACTS + FEASIBLE OPTIONS',10,True,INK,'middle')
    arrow(g,261,238,261,221);ln(g,125,220,398,220,MUTED);arrow(g,125,220,125,204);arrow(g,398,220,398,204)
    rect(g,15,150,220,49,HexColor('#EBF1F7'));rect(g,287,150,220,49,HexColor('#E7F3EE'))
    t(g,125,180,'Established guide',11,True,BLUE,'middle');t(g,125,164,'Active comparator',8.5,col=MUTED,anchor='middle')
    t(g,397,180,'Same guide + proposed module',10,True,TEAL,'middle');t(g,397,164,'Time • consequences • uncertainty',8.3,col=MUTED,anchor='middle')
    arrow(g,125,149,125,135);arrow(g,398,149,398,135);ln(g,125,134,398,134,MUTED);arrow(g,261,134,261,119)
    for x,title,ss,col in [(80,'UNDERSTANDING',['Independent scoring','Comparator, horizon, uncertainty'],BLUE),(261,'TRANSFER',['Unfamiliar decision','Does learning generalize?'],TEAL),(444,'BURDEN',['Time and non-completion','Include people who stop using it'],RUST)]:
        t(g,x,104,title,9.5,True,col,'middle');lines(g,x,89,ss,8.2,12,MUTED,'middle')
    ln(g,0,59,W,59);panel(g,0,43,'b','Specify what would count against the proposal')
    lines(g,17,27,['No added understanding  •  Failure to transfer  •  Excess burden  •  Unequal access',
                    'A preferred lifestyle or lower-paid job is not a correctness criterion.'],8.6,13)
    return g

def fig8():
    g=Drawing(W,235)
    panel(g,0,220,'a','Individual choices sit within institutional conditions')
    for x,title,ss,col in [(80,'WORKPLACES',['Work intensity','Ability to refuse'],BLUE),(261,'PLATFORMS',['Interface and incentives','Available alternatives'],PURPLE),(443,'HOUSEHOLDS AND SERVICES',['Care demands','Information and access'],TEAL)]:
        t(g,x,190,title,8.6,True,col,'middle');lines(g,x,175,ss,8.4,12,MUTED,'middle')
        arrow(g,x,148,x,131,col)
    ln(g,80,130,443,130);arrow(g,261,130,261,116)
    human(g,58,74,.43,BLUE)
    t(g,108,106,'A person compares feasible alternatives',11,True)
    lines(g,108,89,['Income, time, functioning, experience and capability','Choice support can reveal a constraint; it does not remove it.'],9,13)
    ln(g,0,47,W,47);panel(g,0,30,'b','Track who receives gains and who bears burdens')
    t(g,17,11,'Individual account',8.7,True,BLUE);arrow(g,130,14,150,14)
    t(g,163,11,'Household account',8.7,True,TEAL);arrow(g,282,14,302,14)
    t(g,315,11,'Organizational and societal account',8.7,True,PURPLE)
    return g

def make_figures():return {i:f() for i,f in enumerate([fig1,fig2,fig3,fig4,fig5,fig6,fig7,fig8],1)}
