from pathlib import Path
import csv, math
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parent
pdfmetrics.registerFont(TTFont('YaHei', r'C:\Windows\Fonts\msyh.ttc', subfontIndex=0))
pdfmetrics.registerFont(TTFont('YaHeiBold', r'C:\Windows\Fonts\msyhbd.ttc', subfontIndex=0))
INK='#111111'; TEAL='#176B69'; COPPER='#B46743'; MUTED='#5B6A69'; GRID='#D8E0DC'; PALE='#F7F8F4'; SOFT='#8BB3AE'; WHITE='#FFFFFF'

def txt(c,x,y,text,size=16,color=INK,bold=False,align='left'):
    c.setFillColor(HexColor(color)); c.setFont('YaHeiBold' if bold else 'YaHei',size)
    getattr(c, {'left':'drawString','center':'drawCentredString','right':'drawRightString'}[align])(x,y,text)

def line(c,x1,y1,x2,y2,color=GRID,width=1):
    c.setStrokeColor(HexColor(color)); c.setLineWidth(width); c.line(x1,y1,x2,y2)

def base(name,w,h):
    c=canvas.Canvas(str(ROOT/(name+'.pdf')),pagesize=(w,h),pageCompression=1)
    c.setTitle(name); c.setAuthor('')
    c.setFillColor(HexColor(WHITE)); c.rect(0,0,w,h,fill=1,stroke=0)
    return c

def export(c,name):
    c.save()
    pdf=pdfium.PdfDocument(ROOT/(name+'.pdf'))
    page=pdf[0]
    image=page.render(scale=300/72).to_pil()
    image.save(ROOT/(name+'.png'),dpi=(300,300))
    pdf.close()

# Figure 1. One survey, one year, one metric. Do not use a complement sector.
c=base('figure1_health_literacy',720,300)
txt(c,28,269,'2025年居民健康素养水平',24,bold=True)
txt(c,28,246,'全国与城乡的达标比例（%）',14,MUTED)
xp=116; pw=548; axis_y=55
for v in range(0,101,20):
    x=xp+pw*v/100
    line(c,x,axis_y,x,225,GRID,.7)
    txt(c,x,37,str(v),12,MUTED,align='center')
data1=[('全国',33.69,TEAL,203),('城市',36.68,SOFT,145),('农村',30.58,COPPER,87)]
for label,v,color,y in data1:
    txt(c,91,y-6,label,20,INK,label=='全国',align='right')
    c.setFillColor(HexColor(color)); c.rect(xp,y-15,pw*v/100,30,fill=1,stroke=0)
    txt(c,xp+pw*v/100+12,y-7,f'{v:.2f}%',20,INK,True)
line(c,xp,axis_y,xp+pw,axis_y,GRID,.8)
txt(c,28,10,'监测对象：15—69岁常住人口  ·  有效问卷70,451份',12,MUTED)
export(c,'figure1_health_literacy')

# Figure 2. The left panel reports incidence rates; the right panel reports the published rate ratio.
c=base('figure2_ssass_stroke',720,310)
txt(c,28,278,'改变日常供给也能成为干预',24,bold=True)
txt(c,28,254,'SSaSS中国农村高危成人整群随机试验',14,MUTED)
txt(c,28,226,'卒中发生率',16,bold=True)
txt(c,466,226,'代盐组 / 普通盐组',15,bold=True)
line(c,430,67,430,220,GRID,1)
xp=120; pw=267; ymax=212; ymin=92
for v in range(0,41,10):
    x=xp+pw*v/40
    line(c,x,ymin,x,ymax,GRID,.7)
    txt(c,x,75,str(v),12,MUTED,align='center')
for label,value,color,y in [('含钾代盐',29.14,TEAL,181),('普通盐',33.65,COPPER,121)]:
    txt(c,106,y-5,label,15,INK,False,align='right')
    c.setFillColor(HexColor(color)); c.rect(xp,y-14,pw*value/40,28,fill=1,stroke=0)
    txt(c,xp+pw*value/40+8,y-5,f'{value:.2f}',16,INK,True)
txt(c,120,54,'卒中事件 / 1,000人年',13,MUTED)
txt(c,568,192,'率比 0.86',24,TEAL,True,align='center')
txt(c,568,169,'95%CI 0.77—0.96',14,MUTED,align='center')
rmin=.6; rmax=1.2; rx0=466; rw=216; ry=124
def ratx(v): return rx0+(v-rmin)/(rmax-rmin)*rw
line(c,ratx(1),93,ratx(1),148,GRID,1.4)
txt(c,ratx(1),78,'1.0',12,MUTED,align='center')
for v in [.6,.8,1.2]:
    txt(c,ratx(v),78,f'{v:.1f}',12,MUTED,align='center')
    line(c,ratx(v),90,ratx(v),94,GRID,1)
line(c,rx0,92,rx0+rw,92,GRID,.8)
line(c,ratx(.77),ry,ratx(.96),ry,TEAL,3)
line(c,ratx(.77),ry-7,ratx(.77),ry+7,TEAL,2)
line(c,ratx(.96),ry-7,ratx(.96),ry+7,TEAL,2)
c.setFillColor(HexColor(TEAL)); c.circle(ratx(.86),ry,5.5,fill=1,stroke=0)
txt(c,568,54,'1.0表示两组发生率相同',12,MUTED,align='center')
txt(c,28,25,'适用人群：既往卒中，或≥60岁且有高血压。',12,MUTED)
txt(c,28,8,'图中是事件发生率，不能当作每位参与者的患病概率。',12,MUTED)
export(c,'figure2_ssass_stroke')

# Theme icons: no pictorial data; line-only semantic navigation assets.
def path(c,points,color=TEAL,width=2.8,close=False,fill=False):
    p=c.beginPath(); p.moveTo(*points[0])
    for pt in points[1:]: p.lineTo(*pt)
    if close:p.close()
    c.setStrokeColor(HexColor(color));c.setLineWidth(width)
    if fill:c.setFillColor(HexColor(color))
    c.drawPath(p,stroke=1,fill=int(fill))

def icon(c,k,cx,cy,s=1):
    c.saveState(); c.translate(cx,cy);c.scale(s,s)
    c.setStrokeColor(HexColor(TEAL));c.setLineWidth(2.8);c.setLineCap(1);c.setLineJoin(1)
    if k==0:
        c.circle(0,0,18,stroke=1,fill=0);c.circle(0,0,11,stroke=1,fill=0)
        for xx in [-29,-25,-21]: c.line(xx,18,xx,7)
        path(c,[(-29,7),(-25,3),(-21,7)]); c.line(-25,3,-25,-21)
        path(c,[(27,18),(27,-21)]); path(c,[(27,18),(22,11),(22,1),(27,1)])
    elif k==1:
        c.circle(5,20,5,stroke=1,fill=0)
        path(c,[(0,12),(-8,0),(1,-5),(9,-21)])
        path(c,[(1,11),(12,3),(23,5)])
        path(c,[(-8,0),(-17,-12),(-29,-12)])
        path(c,[(0,9),(-14,11),(-21,3)])
    elif k==2:
        # bed and small crescent moon
        path(c,[(-29,-12),(-29,9),(-27,9),(-27,-4),(29,-4),(29,-12)])
        path(c,[(-27,6),(-15,6),(-12,-4)]); path(c,[(-12,7),(25,7),(29,-4)])
        c.arc(4,14,23,33,90,270); c.arc(11,16,25,33,90,180)
    elif k==3:
        # head profile and mind dots, not medical diagnostic imagery
        p=c.beginPath(); p.moveTo(-14,-21);p.lineTo(-14,-7);p.curveTo(-31,9,-16,29,1,27);p.curveTo(16,26,20,15,19,8);p.lineTo(27,-1);p.lineTo(18,-1);p.lineTo(18,-12);p.lineTo(7,-12);p.lineTo(7,-21)
        c.drawPath(p,stroke=1,fill=0)
        for x,y in [(-7,12),(3,17),(8,7)]: c.circle(x,y,2.1,stroke=1,fill=0)
        line(c,-5,13,1,16,TEAL,2);line(c,4,15,7,9,TEAL,2)
    elif k==4:
        c.circle(-13,13,7,stroke=1,fill=0);c.circle(13,13,7,stroke=1,fill=0)
        c.arc(-29,-24,3,4,0,180);c.arc(-3,-24,29,4,0,180)
        path(c,[(-29,-8),(-29,-18),(-1,-18)]);path(c,[(29,-8),(29,-18),(1,-18)])
        path(c,[(-6,-4),(0,-10),(6,-4)],COPPER)
    elif k==5:
        path(c,[(-28,1),(0,25),(28,1)]);path(c,[(-23,2),(-23,-22),(23,-22),(23,2)])
        path(c,[(-6,-22),(-6,-6),(6,-6),(6,-22)])
        # leaf above side wall
        p=c.beginPath();p.moveTo(12,7);p.curveTo(8,20,20,25,28,25);p.curveTo(28,14,22,8,12,7)
        c.drawPath(p,stroke=1,fill=0); c.line(12,7,24,21)
    c.restoreState()

labels=['饮食','活动','睡眠','心理','关系','环境']
c=base('health_theme_icons',720,125)
for k,label in enumerate(labels):
    x=60+k*120
    icon(c,k,x,78,.85)
    txt(c,x,25,label,18,INK,True,align='center')
export(c,'health_theme_icons')
for k,label in enumerate(labels):
    c=base(f'icon_{k+1}',90,90); icon(c,k,45,45,1.15); export(c,f'icon_{k+1}')

with (ROOT/'figure1_data.csv').open('w',encoding='utf-8-sig',newline='') as f:
    writer=csv.writer(f); writer.writerow(['year','population','health_literacy_percent','source'])
    for label,v,_,_ in data1:writer.writerow([2025,label,v,'https://wjw.shanxi.gov.cn/xwzx/szyw/202601/t20260108_10035120.shtml'])
with (ROOT/'figure2_data.csv').open('w',encoding='utf-8-sig',newline='') as f:
    writer=csv.writer(f);writer.writerow(['outcome','group','rate_per_1000_person_years','rate_ratio_intervention_vs_control','ci95_low','ci95_high','source'])
    writer.writerow(['stroke','salt_substitute',29.14,0.86,0.77,0.96,'https://pubmed.ncbi.nlm.nih.gov/34459569/'])
    writer.writerow(['stroke','regular_salt',33.65,'reference','','','https://pubmed.ncbi.nlm.nih.gov/34459569/'])
print('Created 2 data figures and 7 icon assets as PDF and PNG at 300 dpi.')
