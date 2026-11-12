from pathlib import Path
import sys, json, re, html, subprocess
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, Table, TableStyle
import reportlab.lib.textsplit as cjk_textsplit
import reportlab.platypus.paragraph as cjk_paragraph
# ReportLab's Japanese-oriented defaults omit Chinese full-width punctuation.
# Extend line-start prohibition locally, without changing bundled libraries.
cjk_textsplit.ALL_CANNOT_START += '，；：！？）》】」』”’、。'
cjk_paragraph.ALL_CANNOT_START = cjk_textsplit.ALL_CANNOT_START
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from PIL import Image
from pypdf import PdfReader
from academic_content import TITLE,SUBTITLE,DATE,PAGES,APPENDICES,REF_IDS

ROOT=Path(__file__).resolve().parent
AS=ROOT/'assets'; OUT=ROOT/'output'; QA=ROOT/'qa_academic'
OUT.mkdir(exist_ok=True); QA.mkdir(exist_ok=True)
pdfmetrics.registerFont(TTFont('CN','C:/Windows/Fonts/simsun.ttc',subfontIndex=0))
pdfmetrics.registerFont(TTFont('CNB','C:/Windows/Fonts/msyhbd.ttc',subfontIndex=0))
pdfmetrics.registerFontFamily('CN',normal='CN',bold='CNB',italic='CN',boldItalic='CNB')
W,H=A4; M=52; CW=W-2*M
INK=colors.HexColor('#161C1C'); GRAY=colors.HexColor('#546362'); TEAL=colors.HexColor('#176B69')
PALE=colors.HexColor('#EFF5F2'); WARM=colors.HexColor('#F8F4EC'); ORANGE=colors.HexColor('#B46743'); LINE=colors.HexColor('#D9DEDA')
PREFLIGHT='--preflight' in sys.argv
pdfpath=(QA/'preflight.pdf') if PREFLIGHT else (OUT/'健康生活方式_学术修订版.pdf')
c=canvas.Canvas(str(pdfpath),pagesize=A4,pageCompression=1)
c.setTitle(TITLE+'｜'+SUBTITLE);c.setAuthor('');c.setSubject('健康生活方式的证据综合与情境化分析')
# References are renumbered by first occurrence in the full manuscript.
original_refs=json.loads((ROOT/'academic_references.json').read_text(encoding='utf-8'))
lookup={r['number']:r for r in original_refs}
order=[]
def collect(obj):
 if isinstance(obj,str):
  for hit in re.finditer(r'\[(\d+(?:,\d+)*)\]',obj):
   for n in map(int,hit.group(1).split(',')):
    if n not in order:order.append(n)
 elif isinstance(obj,dict):
  for value in obj.values():collect(value)
 elif isinstance(obj,(list,tuple)):
  for value in obj:collect(value)
collect(PAGES+APPENDICES)
assert set(order)==set(range(1,20)),order
number_map={old:new for new,old in enumerate(order,1)}
def renumber(obj):
 if isinstance(obj,str):
  return re.sub(r'\[(\d+(?:,\d+)*)\]',lambda m:'['+','.join(map(str,sorted(number_map[int(n)] for n in m.group(1).split(','))))+']',obj)
 if isinstance(obj,dict):return {k:renumber(v) for k,v in obj.items()}
 if isinstance(obj,list):return [renumber(v) for v in obj]
 if isinstance(obj,tuple):return tuple(renumber(v) for v in obj)
 return obj
PAGES=renumber(PAGES);APPENDICES=renumber(APPENDICES)
refs=[{'number':i+1, 'source_number':n, **{k:v for k,v in lookup[n].items() if k!='number'}} for i,n in enumerate(order)]
(ROOT/'academic_reference_index.json').write_text(json.dumps(refs,ensure_ascii=False,indent=2),encoding='utf-8')
report=[];md=['# '+TITLE,'','## '+SUBTITLE,'',DATE,'']

def style(size=10.7,leading=None,color=INK,bold=False):
 return ParagraphStyle('s',fontName='CNB' if bold else 'CN',fontSize=size,leading=leading or size*1.72,textColor=color,wordWrap='CJK',splitLongWords=True,spaceAfter=0,allowWidows=0,allowOrphans=0)
def pdraw(text,x,yt,w=CW,size=10.7,leading=None,color=INK,bold=False):
 p=Paragraph(text,style(size,leading,color,bold));_,h=p.wrap(w,H);p.drawOn(c,x,yt-h);return h
def clean(s):
 return html.escape(s).replace('\n','<br/>')
def cite(s):
 return re.sub(r'\[(\d+(?:,\d+)*)\]',lambda m:'<font color="#176B69">'+m.group(0)+'</font>',clean(s))
def base(num,kicker,title,cover=False):
 c.setFillColor(colors.white);c.rect(0,0,W,H,fill=1,stroke=0)
 c.setFillColor(TEAL);c.rect(0,H-4,W,4,fill=1,stroke=0)
 c.setFont('CN',8);c.setFillColor(GRAY)
 c.drawString(M,30,'中国成年人健康生活方式的日常实施')
 c.drawRightString(W-M,30,f'{num:02d}  /  13')
 if not cover:
  pdraw(kicker,M,H-33,size=9.2,color=TEAL,bold=True)
  pdraw(title,M,H-61,size=20,leading=29,bold=True)
 return H-112
def imagebox(name,yt,maxh):
 aliases={'literacy.png':'figure1_health_literacy_academic.png','ssass.png':'figure2_ssass_stroke_academic.png'}
 path=AS/aliases.get(name,name)
 if not path.exists():
  if PREFLIGHT:
   c.setFillColor(WARM);c.rect(M,yt-maxh,CW,maxh,fill=1,stroke=0)
   pdraw('插图排版占位  仅内部检查',M+15,yt-15,CW-30,11,18,GRAY)
   return maxh
  raise FileNotFoundError(path)
 with Image.open(path) as im: iw,ih=im.size
 scale=min(CW/iw,maxh/ih);dw,dh=iw*scale,ih*scale
 c.drawImage(str(path),M+(CW-dw)/2,yt-dh,width=dw,height=dh,mask='auto')
 return dh
def textbox(title,text,y,fill=PALE):
 pt=Paragraph(cite(text),style(10.2,17.2));_,th=pt.wrap(CW-28,H)
 h=th+47
 c.setFillColor(fill);c.roundRect(M,y-h,CW,h,5,fill=1,stroke=0)
 pdraw(clean(title),M+14,y-10,CW-28,10.2,16,INK,True)
 pt.drawOn(c,M+14,y-33-th)
 return h
def table(headers,rows,widths,y):
 widths=[CW*v/sum(widths) for v in widths]
 data=[[Paragraph(clean(z),style(9.6,15,colors.white,True)) for z in headers]]
 data += [[Paragraph(clean(z),style(9.6,16)) for z in row] for row in rows]
 t=Table(data,colWidths=widths,hAlign='LEFT')
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),TEAL),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('BOX',(0,0),(-1,-1),.5,LINE),('INNERGRID',(0,0),(-1,-1),.5,LINE),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,PALE])]))
 _,h=t.wrap(CW,H);t.drawOn(c,M,y-h);return h
def timeline(items,y):
 n=len(items);gap=10;sw=(CW-gap*(n-1))/n;h=88
 for j,(title,desc) in enumerate(items):
  x=M+j*(sw+gap)
  c.setFillColor(PALE);c.roundRect(x,y-h,sw,h,4,fill=1,stroke=0)
  pdraw(title,x+10,y-10,sw-20,12,18,TEAL,True)
  pdraw(desc,x+10,y-36,sw-20,9.7,16)
 return h
def comb(y):
 items=[('能力','知识与操作技能\n身体能力'),('机会','物理环境\n社会条件'),('动机','反思性判断\n自动化过程')]
 h=102;gap=12;sw=(CW-2*gap)/3
 for i,(a,b) in enumerate(items):
  x=M+i*(sw+gap)
  c.setFillColor(PALE if i!=1 else WARM);c.roundRect(x,y-h,sw,h,5,fill=1,stroke=0)
  pdraw(a,x+14,y-12,sw-28,14,20,INK,True)
  pdraw(clean(b),x+14,y-43,sw-28,10.2,18)
 y2=y-h-16
 c.setStrokeColor(TEAL);c.setLineWidth(1)
 c.line(W/2,y2+10,W/2,y2-3)
 c.line(W/2,y2-3,W/2-3,y2+2);c.line(W/2,y2-3,W/2+3,y2+2)
 pdraw('实施条件识别 → 策略选择 → 过程评价',M,y2-10,CW,11,18,TEAL,True)
 return h+51
def weekgrid(y):
 days=['一','二','三','四','五','六','日'];gap=6;sw=(CW-6*gap)/7;h=139
 for i,day in enumerate(days):
  x=M+i*(sw+gap)
  c.setFillColor(PALE if i<5 else WARM);c.roundRect(x,y-h,sw,h,4,fill=1,stroke=0)
  pdraw('周'+day,x+8,y-9,sw-16,10,16,INK,True)
  if i<5:
   pdraw('30',x+8,y-37,sw-16,22,27,TEAL,True)
   pdraw('分钟<br/>中等强度<br/>有氧活动',x+8,y-69,sw-16,8.8,15)
  else:pdraw('弹性<br/>休息或<br/>合适的活动',x+8,y-42,sw-16,9.3,17)
 y2=y-h-12
 pdraw('30分钟 × 5天 = 150分钟',M,y2,CW,16,24,TEAL,True)
 pdraw('肌肉强化安排：周二、周六；具体内容依据身体能力确定。',M,y2-31,CW,10.2,17)
 return h+64
def worksheet(items,y):
 h=37*len(items)
 for i,(label,_) in enumerate(items):
  yy=y-i*37
  pdraw(label,M,yy-5,155,9.9,17)
  c.setStrokeColor(LINE);c.line(M+160,yy-27,W-M,yy-27)
 return h

def draw_page(pi,page):
 global md
 y=base(pi,page['kicker'],page['title'],pi==1)
 c.bookmarkPage(f'p{pi}');c.addOutlineEntry(page['title'],f'p{pi}',0,False)
 md+=['## '+page['title'],'']
 if pi==1:
  pdraw('叙述性综述与概念框架',M,H-35,CW,9.2,15,TEAL,True)
  pdraw(TITLE,M,H-73,CW,24,35,INK,True)
  pdraw(SUBTITLE,M,H-115,CW,14,22)
  pdraw(DATE+'  ·  学术修订稿',M,H-151,CW,9.2,15,GRAY)
  y=H-188
  pdraw('摘要',M,y,CW,12,18,INK,True);y-=25
 for block in page['blocks']:
  k=block[0]
  if k=='p':
   size=10.7;lead=18.3
   y-=pdraw(cite(block[1]),M,y,CW,size,lead)+12
   md += [block[1],'']
  elif k=='h':
   y-=5;y-=pdraw(block[1],M,y,CW,13,21,INK,True)+9
   md+=['### '+block[1],'']
  elif k in ('call','scene'):
   y-=textbox(block[1],block[2],y,WARM if k=='scene' else PALE)+14
   md+=['**'+block[1]+'**',block[2],'']
  elif k=='image':
   y-=imagebox(block[1],y,block[2])+7
   aliases={'literacy.png':'figure1_health_literacy_academic.png','ssass.png':'figure2_ssass_stroke_academic.png'}
   md+=['!['+block[1]+']('+str((AS/aliases.get(block[1],block[1])).resolve())+')','']
  elif k=='cap':
   y-=pdraw(cite(block[1]),M,y,CW,8.3,13,GRAY)+15;md += [block[1],'']
  elif k=='table':
   y-=table(block[1],block[2],block[3],y)+16
   md+=['| '+' | '.join(block[1])+' |','| '+' | '.join(['---']*len(block[1]))+' |']+['| '+' | '.join(row)+' |' for row in block[2]]+['']
  elif k=='steps':
   for n,(title,desc) in enumerate(block[1],1):
    c.setFillColor(TEAL);c.circle(M+11,y-11,10,fill=1,stroke=0)
    c.setFillColor(colors.white);c.setFont('CNB',10);c.drawCentredString(M+11,y-15,str(n))
    y-=pdraw(title,M+32,y,CW-32,11.2,19,INK,True)+4
    y-=pdraw(cite(desc),M+32,y,CW-32,10.5,18)+16
    md += [f'{n}. **{title}** {desc}','']
  elif k=='comb':y-=comb(y)+8;md+=['能力（知识、技能和身体条件）、机会（物理与社会条件）、动机（反思性与自动化过程）；实施分析步骤：条件识别、策略选择、过程评价。','']
  elif k=='dayline':
   y-=timeline(block[1],y)+10
   md+=['；'.join(a+'：'+b for a,b in block[1]),'']
  elif k=='weekgrid':y-=weekgrid(y)+8;md+=['周一至周五每天30分钟中等强度有氧活动，共150分钟；周二、周六另安排肌肉强化。','']
  elif k=='worksheet':y-=worksheet(block[1],y)+16;md += [a+'：________' for a,_ in block[1]]+['']
  elif k=='nav':
   # compact contents entry, not a table of narrative paragraphs
   for n,(rng,label) in enumerate(block[1]):
    x=M+(n%2)*(CW/2);yy=y-(n//2)*22
    pdraw(rng+'  '+label,x,yy,CW/2-8,8.6,15,GRAY)
   y-=49
 if pi==1:
  y-=10
  y-=imagebox('生活场景插图.png',y,158)+6
  y-=pdraw('日常生活情境示意（AI生成插图）',M,y,CW,8,12,GRAY)+10
  md+=['![日常生活情境示意]('+str((AS/'生活场景插图.png').resolve())+')','']
 if y<49:raise RuntimeError(f'Page {pi} overflow: bottom={y:.1f}')
 report.append({'page':pi,'title':page['title'],'bottom':round(y,2)})
 c.showPage()

for i,page in enumerate(PAGES,1):draw_page(i,page)

for refpage,(start,end) in enumerate([(1,10),(11,19)],10):
 y=base(refpage,'参考文献','参考文献')
 if refpage==10:
  md+=['## 参考文献','']
  y-=pdraw('按正文首次引用顺序编码；网络资料访问日期为2026年11月12日。',M,y,CW,9,15,GRAY)+18
 for rn in range(start,end+1):
  r=refs[rn-1];url=r['url']
  y-=pdraw('['+str(rn)+'] '+clean(r['citation']),M,y,CW,9.3,15.7)+4
  y-=pdraw(f'<link href="{html.escape(url,quote=True)}" color="#176B69">原文链接</link>',M,y,CW,8.3,13,TEAL)+16
  md += [f'[{rn}] '+r['citation']+' [原文]('+url+')','']
 if refpage==11:
  y-=10
  y-=pdraw('资料与图像说明',M,y,CW,11,18,INK,True)+9
  disclosure='本文未收集原创受试者数据。场景、标签算例及附录日程为分析性示例；统计图依据所引文献的公开数值绘制。两张情境插图由OpenAI内置图像生成工具生成。ChatGPT/Codex用于资料辅助整理、语言编辑、图表绘制与排版。'
  y-=pdraw(disclosure,M,y,CW,9.3,16)+12
  software='辅助工作流文献：Kassis T, Agarwal V, He Y, et al. Scientific Agent Skills: A Library of Procedural Knowledge for Research Agents. 2026. '
  y-=pdraw(software+'<link href="https://arxiv.org/abs/2609.00065" color="#176B69">arXiv:2609.00065</link>.',M,y,CW,8.2,13,GRAY)
  md+=['## 资料与图像说明','',disclosure,'',software+'[arXiv:2609.00065](https://arxiv.org/abs/2609.00065).','']
 if y<49:raise RuntimeError(f'References page {refpage} overflow: {y:.1f}')
 report.append({'page':refpage,'bottom':round(y,2)})
 c.showPage()

for i,page in enumerate(APPENDICES,12):draw_page(i,page)
c.save()
from format_academic_markdown import format_manuscript
if not PREFLIGHT:(OUT/'健康生活方式_学术修订稿.md').write_text(format_manuscript('\n'.join(md)),encoding='utf-8')
reader=PdfReader(str(pdfpath));texts=[p.extract_text() for p in reader.pages]
assert len(reader.pages)==13
assert all(len(t)>100 for t in texts)
for token in ['33.69','3000','2000','150']:
 assert any(token in t for t in texts),token
chartdata=''.join(p.read_text(encoding='utf-8-sig') for p in AS.glob('figure*_data.csv'))
assert all(token in chartdata for token in ['36.68','30.58','29.14','33.65'])
(QA/'layout_report.json').write_text(json.dumps({'pages':len(reader.pages),'layout':report,'links':sum(len(p.get('/Annots',[])) for p in reader.pages),'text_chars':[len(t) for t in texts]},ensure_ascii=False,indent=2),encoding='utf-8')
poppler=Path(r'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1110-778-0_26.1110.778.0_x64__3k8sg7r9htsxt/dependencies/native/poppler/Library/bin/pdftoppm.exe')
prefix='preflight-page' if PREFLIGHT else 'page'
subprocess.run([str(poppler),'-r','120','-png',str(pdfpath),str(QA/prefix)],check=True,stdout=subprocess.DEVNULL)
imgs=sorted(QA.glob(prefix+'-*.png'))
thumbs=[]
for imfile in imgs:
 im=Image.open(imfile).convert('RGB');im.thumbnail((298,422));thumbs.append(im)
contact=Image.new('RGB',(298*4,448*4),'#DEE4E0')
for i,im in enumerate(thumbs):contact.paste(im,((i%4)*298,(i//4)*448))
contact.save(QA/('preflight-contact.png' if PREFLIGHT else 'contact.png'))
print(json.dumps({'pdf':str(pdfpath),'page_count':len(reader.pages),'bottoms':[r['bottom'] for r in report]},ensure_ascii=False))
