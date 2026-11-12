from pathlib import Path
import json, re, html, subprocess
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, KeepTogether, PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
import reportlab.lib.textsplit as textsplit
import reportlab.platypus.paragraph as paragraph_module
from pypdf import PdfReader
from PIL import Image as PILImage
from manuscript_content import TITLE, SUBTITLE, ABSTRACT, KEYWORDS, BLOCKS, APPENDIX

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'output'; QA=ROOT/'qa'
OUT.mkdir(exist_ok=True);QA.mkdir(exist_ok=True)
textsplit.ALL_CANNOT_START += '，；：！？）》】」』”’、。'
paragraph_module.ALL_CANNOT_START=textsplit.ALL_CANNOT_START
pdfmetrics.registerFont(TTFont('Song','C:/Windows/Fonts/simsun.ttc',subfontIndex=0))
pdfmetrics.registerFont(TTFont('Hei','C:/Windows/Fonts/msyhbd.ttc',subfontIndex=0))
pdfmetrics.registerFontFamily('Song',normal='Song',bold='Hei',italic='Song',boldItalic='Hei')
W,H=A4; M=55; CW=W-2*M
INK=colors.HexColor('#182322'); TEAL=colors.HexColor('#1E6762'); GRAY=colors.HexColor('#50615F'); RULE=colors.HexColor('#C2CECA')

library={}
for r in json.loads((ROOT.parent/'academic_references.json').read_text(encoding='utf-8')):
    library[f'OLD{r["number"]:02d}']=r
for r in json.loads((ROOT/'中文证据.json').read_text(encoding='utf-8')):
    library[r['id']]=r
for r in json.loads((ROOT/'国际证据.json').read_text(encoding='utf-8'))['文献']:
    library[r['id']]={**r,'url':r['urls'][0]}
library['ALCOHOL_MR']={
 'authors':['Millwood IY','Walters RG','Mei XW'], 'title':'Conventional and genetic evidence on alcohol and vascular disease aetiology: a prospective study of 500 000 men and women in China',
 'year':2019,'journal':'The Lancet','volume':'393','issue':'10183','pages':'1831-1842','doi':'10.1016/S0140-6736(18)31772-0',
 'url':'https://pmc.ncbi.nlm.nih.gov/articles/PMC6497989/',
 'citation':'Millwood IY, Walters RG, Mei XW, et al. Conventional and genetic evidence on alcohol and vascular disease aetiology: a prospective study of 500 000 men and women in China[J]. The Lancet, 2019, 393(10183): 1831-1842. DOI: 10.1016/S0140-6736(18)31772-0.',
 'access':'PMC全文；核验遗传分析与常规观察性分析的区别。'
}
keys=[]
def walk(x):
 if isinstance(x,str):
  for match in re.finditer(r'\[@([A-Za-z0-9_,]+)\]',x):
   for key in match.group(1).split(','):
    assert key in library,key
    if key not in keys:keys.append(key)
 elif isinstance(x,(list,tuple)):
  for value in x:walk(value)
walk(BLOCKS+APPENDIX)
nums={k:i+1 for i,k in enumerate(keys)}
def cite(s):
 return re.sub(r'\[@([A-Za-z0-9_,]+)\]',lambda m:'['+','.join(str(nums[k]) for k in m.group(1).split(','))+']',s)
def markup(s):
 t=html.escape(cite(s)).replace('\n','<br/>')
 return re.sub(r'\[(\d+(?:,\d+)*)\]',r'<super><font color="#1E6762">[\1]</font></super>',t)
def st(name,size=10.5,leading=18.2,**kw):
 base=dict(fontName='Song',fontSize=size,leading=leading,textColor=INK,wordWrap='CJK',spaceAfter=7,allowWidows=0,allowOrphans=0)
 base.update(kw);return ParagraphStyle(name,**base)
styles={
 'body':st('body',firstLineIndent=21),
 'abstract':st('abstract',10,17,spaceAfter=9),
 'h1':st('h1',13,20,fontName='Hei',spaceBefore=13,spaceAfter=7,keepWithNext=True),
 'h2':st('h2',11.2,18,fontName='Hei',spaceBefore=9,spaceAfter=5,keepWithNext=True),
 'cap':st('cap',8.7,13.5,textColor=GRAY,spaceAfter=8),
 'cell':st('cell',9.2,14.6,spaceAfter=0),
 'th':st('th',9.3,15,fontName='Hei',spaceAfter=0),
 'ref':st('ref',8.7,13.5,spaceAfter=8),
}
story=[];md=['# '+TITLE,'','## '+SUBTITLE,'','**摘要** '+ABSTRACT,'','**关键词** '+KEYWORDS,'']
story.append(Paragraph(TITLE,st('title',23,31,fontName='Hei',spaceAfter=5)))
story.append(Paragraph(SUBTITLE,st('subtitle',13,20,textColor=GRAY,spaceAfter=16)))
story.append(Paragraph('<b>摘要</b>　'+html.escape(ABSTRACT),styles['abstract']))
story.append(Paragraph('<b>关键词</b>　'+html.escape(KEYWORDS),styles['abstract']))
story.append(Spacer(1,5))

def add_blocks(blocks):
 for block in blocks:
  kind=block[0]
  if kind in ('h1','h2'):
   story.append(Paragraph(markup(block[1]),styles[kind]));md.extend([('## ' if kind=='h1' else '### ')+block[1],''])
  elif kind=='p':
   story.append(Paragraph(markup(block[1]),styles['body']));md.extend([cite(block[1]),''])
  elif kind=='figure':
   path=(ROOT/block[1]).resolve()
   with PILImage.open(path) as im:iw,ih=im.size
   img=Image(str(path),width=CW,height=CW*ih/iw)
   story.append(KeepTogether([Spacer(1,6),img,Spacer(1,6),Paragraph(markup(block[2]),styles['cap'])]))
   md.extend(['!['+cite(block[2]).split('。')[0]+'](<'+path.as_posix()+'>)','',cite(block[2]),''])
  elif kind=='table':
   _,title,headers,rows,widths,note=block
   cap=Paragraph(markup(title),styles['cap']);cap.keepWithNext=True;story.append(cap)
   data=[[Paragraph(markup(s),styles['th']) for s in headers]]+[[Paragraph(markup(s),styles['cell']) for s in row] for row in rows]
   tw=[CW*v/sum(widths) for v in widths]
   table=Table(data,colWidths=tw,repeatRows=1,hAlign='LEFT')
   table.setStyle(TableStyle([('LINEABOVE',(0,0),(-1,0),1,TEAL),('LINEBELOW',(0,0),(-1,0),.7,TEAL),('LINEBELOW',(0,-1),(-1,-1),.7,TEAL),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
   story.extend([table,Spacer(1,5),Paragraph(markup(note),styles['cap'])])
   md.extend([cite(title),'','| '+' | '.join(headers)+' |','| '+' | '.join(['---']*len(headers))+' |'])
   md.extend(['| '+' | '.join(cite(z).replace('\n','<br>') for z in row)+' |' for row in rows]);md.extend(['',cite(note),''])
  elif kind=='worksheet':
   rows=[[Paragraph(label,styles['cell']),Paragraph('　　　　　　　　　　　　　　　　　',styles['cell'])] for label in block[1]]
   table=Table(rows,colWidths=[160,CW-160],rowHeights=[30]*len(rows))
   table.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LINEBELOW',(1,0),(1,-1),.4,RULE)]))
   story.append(table);md.extend(['- '+label+'：________' for label in block[1]]+[''])

add_blocks(BLOCKS)
story.append(Spacer(1,8));story.append(Paragraph('参考文献',styles['h1']));md.extend(['## 参考文献',''])
ordered=[]
for key in keys:
 r=library[key];number=nums[key];citation=r['citation']
 # Harmonize available journal metadata without fabricating missing fields.
 if key.startswith('INT'):
  author=r['authors']
  if key=='INT06_OLSON2015':author='Olson R, Crain TL, Bodner TE, et al.'
  if key=='INT03_DAQING2019':author='Gong Q, Zhang P, Wang J, et al.'
  citation=f'{author.rstrip(".")}. {r["title"]}[J]. {r["journal"]}, {r["year"]}, {r["volume"]}({r["issue"]}): {r["pages"]}. DOI: {r["doi"]}.'
 citation=citation.replace('–','-')
 link=html.escape(r['url'],quote=True)
 rs=styles['ref']
 if re.match(r'^[A-Za-z]',citation):rs=st('ref_en',9,13.3,fontName='Times-Roman',wordWrap=None,spaceAfter=8)
 story.append(Paragraph(f'[{number}] '+html.escape(citation)+f' <link href="{link}" color="#1E6762"><font name="Song">[原文]</font></link>',rs))
 md.extend([f'[{number}] '+citation+' [原文]('+r['url']+')',''])
 ordered.append({'number':number,'source_key':key,**r,'citation':citation})
story.append(PageBreak());add_blocks(APPENDIX)

class NumberedCanvas(canvas.Canvas):
 def __init__(self,*args,**kwargs):
  canvas.Canvas.__init__(self,*args,**kwargs);self.states=[]
 def showPage(self):
  self.states.append(dict(self.__dict__));self._startPage()
 def save(self):
  total=len(self.states)
  for state in self.states:
   self.__dict__.update(state)
   self.setFillColor(GRAY);self.setFont('Song',8)
   self.drawString(M,29,TITLE)
   self.drawRightString(W-M,29,f'{self._pageNumber} / {total}')
   canvas.Canvas.showPage(self)
  canvas.Canvas.save(self)
def page_header(c,doc):
 c.saveState();c.setStrokeColor(RULE);c.setLineWidth(.5);c.line(M,H-36,W-M,H-36)
 if doc.page>1:
  c.setFillColor(GRAY);c.setFont('Song',8);c.drawString(M,H-27,SUBTITLE)
 c.restoreState()

pdfpath=OUT/'健康生活方式形成与维持_文献深化稿.pdf'
doc=SimpleDocTemplate(str(pdfpath),pagesize=A4,leftMargin=M,rightMargin=M,topMargin=50,bottomMargin=52,title=TITLE+'：'+SUBTITLE,author='',subject='健康生活方式的叙述性综述')
doc.build(story,onFirstPage=page_header,onLaterPages=page_header,canvasmaker=NumberedCanvas)
mdtext='\n'.join(md)
(OUT/'健康生活方式形成与维持_文献深化稿.md').write_text(mdtext,encoding='utf-8')
(ROOT/'reference_library.json').write_text(json.dumps(ordered,ensure_ascii=False,indent=2),encoding='utf-8')
reader=PdfReader(str(pdfpath));texts=[p.extract_text() for p in reader.pages]
assert all(len(t)>60 for t in texts)
assert not any(t in mdtext for t in ['[@','AI生成','情境化实践框架','辅助工作流文献'])
assert len({r['doi'].lower() for r in ordered if r.get('doi')})==sum(bool(r.get('doi')) for r in ordered)
assert all(1<=n<=len(keys) for n in nums.values())
report={'pages':len(reader.pages),'references':len(keys),'source_keys':keys,'links':sum(len(p.get('/Annots',[])) for p in reader.pages),'text_chars':[len(s) for s in texts]}
(QA/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
poppler=Path(r'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1110-778-0_26.1110.778.0_x64__3k8sg7r9htsxt/dependencies/native/poppler/Library/bin/pdftoppm.exe')
subprocess.run([str(poppler),'-r','120','-png',str(pdfpath),str(QA/'page')],check=True,stdout=subprocess.DEVNULL)
imgs=[QA/f'page-{i}.png' for i in range(1,len(reader.pages)+1)];thumbs=[]
for path in imgs:
 im=PILImage.open(path).convert('RGB');im.thumbnail((298,422));thumbs.append(im)
sheet=PILImage.new('RGB',(1192,448*((len(thumbs)+3)//4)),'#E0E5E3')
for i,im in enumerate(thumbs):sheet.paste(im,((i%4)*298,(i//4)*448))
sheet.save(QA/'contact.png')
print(json.dumps(report,ensure_ascii=True))
