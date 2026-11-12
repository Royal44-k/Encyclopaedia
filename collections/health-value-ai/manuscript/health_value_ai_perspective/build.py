"""Deterministic local PDF and editable Word editions from matched bilingual content."""
from pathlib import Path
import json,re,copy,sys,base64
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph,Table,TableStyle
import reportlab.platypus.paragraph as rl_paragraph
import reportlab.lib.textsplit as rl_textsplit
from reportlab.graphics import renderPDF,renderSVG
from reportlab.graphics.shapes import String,Group
import pypdfium2 as pdfium
from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.enum.section import WD_SECTION_START
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from figures_original import make_figures
from figure_translations import TRANSLATIONS
from figures_revised import make_revisions
from figures_cases import make_case_figures

ROOT=Path(__file__).resolve().parent
# Extend ReportLab's Japanese-oriented line-start exclusions for Chinese punctuation.
rl_paragraph.ALL_CANNOT_START += '，：；！？）》】”’'
rl_textsplit.ALL_CANNOT_START += '，：；！？）》】”’'
D=json.loads((ROOT/'content_bilingual.json').read_text(encoding='utf-8'))
REFS=json.loads((ROOT/'references.json').read_text(encoding='utf-8'))
RM={r['id']:r for r in REFS}
F=Path('C:/Windows/Fonts')
for name,file in [('Serif','times.ttf'),('SerifBold','timesbd.ttf'),('SerifItalic','timesi.ttf'),('Sans','arial.ttf'),('SansBold','arialbd.ttf'),('Display','georgiab.ttf'),('CNSong','simsun.ttc'),('CNHei','simhei.ttf'),('Symbols','seguisym.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(F/file),subfontIndex=0))
for family,bold,italic in [('Serif','SerifBold','SerifItalic'),('Sans','SansBold','Sans'),('CNSong','CNHei','CNSong'),('CNHei','CNHei','CNHei')]:
    pdfmetrics.registerFontFamily(family,normal=family,bold=bold,italic=italic,boldItalic=bold)
W=522;INK=colors.HexColor('#182B35');GRID=colors.HexColor('#CCD7DB')
PAGE_COUNT=14
PAGEFIG={1:1,2:2,4:3,6:4,7:5,8:6,9:7,10:8,11:9,12:10,13:11}
PAGETABLE={3:'1',5:'2',12:'3'}
def ordered_text(lang):
    d=D[lang];out=[d['abstract']]
    for page in range(1,PAGE_COUNT+1):
        if page in PAGEFIG:out.append(d['captions'][str(PAGEFIG[page])])
        if page in PAGETABLE:
            t=d['tables'][PAGETABLE[page]];out.extend([t['caption']]+[c for row in t['rows'] for c in row])
        for s in d['pages'].get(str(page),[]):out.extend(s['paragraphs'])
    return out
ORDER=list(dict.fromkeys(re.findall(r'\[@(E\d+)\]','\n'.join(ordered_text('en')))))
assert set(ORDER)==set(RM),(set(RM)-set(ORDER))
assert set(re.findall(r'\[@(E\d+)\]','\n'.join(ordered_text('zh'))))==set(ORDER)
NUM={e:i+1 for i,e in enumerate(ORDER)}
def cite(t):
    return re.sub(r'(?:\[@E\d+\])+',lambda m:'['+', '.join(str(x) for x in sorted({NUM[e] for e in re.findall(r'E\d+',m.group())}))+']',t)
def plain(t):return re.sub('<[^>]+>','',cite(t))
def markup(t):
    t=re.sub(r'([xz])_([ijk])',r'\1<sub>\2</sub>',cite(t))
    t=escape(t)
    for tag in ['b','sub','i']:t=t.replace('&lt;'+tag+'&gt;','<'+tag+'>').replace('&lt;/'+tag+'&gt;','</'+tag+'>')
    return t.replace('\n','<br/>')
def reftext(e):
    r=RM[e];a=r['authors'].rstrip('.')+'.';title=r['title']
    if not title.endswith(('.', '?', '!')):title+='.'
    vol=r['journal']+(' '+r.get('volume','') if r.get('volume') else '')+(', '+r.get('pages','') if r.get('pages') else '')
    url='https://doi.org/'+r['doi'] if r.get('doi') else r['url']
    return f"{NUM[e]}. {a} {title} {vol} ({r.get('year') or 'n.d.'}). {url}"
def strings(node):
    if isinstance(node,String):yield node
    for child in getattr(node,'contents',[]):yield from strings(child)
def repair_figure_glyphs(node):
    # Mixed runs preserve genuine mathematical minus signs in CJK labels.
    for i,ob in enumerate(getattr(node,'contents',[])):
        if not isinstance(ob,String):repair_figure_glyphs(ob);continue
        glyphs=pdfmetrics.getFont(ob.fontName).face.charToGlyph
        if all(ord(ch) in glyphs for ch in ob.text):continue
        runs=[]
        for ch in ob.text:
            font=ob.fontName if ord(ch) in glyphs else 'Sans'
            assert ord(ch) in pdfmetrics.getFont(font).face.charToGlyph,(ob.text,ch)
            if runs and runs[-1][0]==font:runs[-1][1]+=ch
            else:runs.append([font,ch])
        widths=[pdfmetrics.stringWidth(txt,font,ob.fontSize) for font,txt in runs]
        x=ob.x-(sum(widths)/2 if ob.textAnchor=='middle' else sum(widths) if ob.textAnchor=='end' else 0)
        group=Group()
        for (font,txt),width in zip(runs,widths):
            part=copy.copy(ob);part.x=x;part.text=txt;part.fontName=font;part.textAnchor='start';group.add(part);x+=width
        node.contents[i]=group
FIGS={};localization=[]
for lang in ['en','zh']:
    original=make_figures();revised=make_revisions(lang);original.update(revised)
    figs={};folder=ROOT/'figures'/lang;folder.mkdir(parents=True,exist_ok=True)
    for oldn,g in original.items():
        if lang=='zh' and oldn not in revised:
            for ob in strings(g):
                before=ob.text
                if before in TRANSLATIONS:ob.text=TRANSLATIONS[before]
                elif re.fullmatch(r'[+−]?\d+ h',before):ob.text=before[:-2]+' 小时'
                elif re.search('[A-Za-z]{3}',before):raise ValueError('Untranslated figure text: '+before)
                if re.search('[\u4e00-\u9fff]',ob.text):ob.fontName='CNHei'
                localization.append({'figure':{6:7,7:10,8:11}.get(oldn,oldn),'en':before,'zh':ob.text})
        figs[{6:7,7:10,8:11}.get(oldn,oldn)]=g
    figs.update(make_case_figures(lang))
    for n,g in sorted(figs.items()):
        repair_figure_glyphs(g)
        renderPDF.drawToFile(g,str(folder/f'figure{n}.pdf'))
        renderSVG.drawToFile(g,str(folder/f'figure{n}.svg'))
        if n in [6,8,9]:
            key={6:'work',8:'food',9:'leisure'}[n]
            asset=ROOT/'illustrations'/f'{key}.png'
            svg=folder/f'figure{n}.svg'
            svg.write_text(svg.read_text(encoding='utf-8').replace(str(asset), 'data:image/png;base64,'+base64.b64encode(asset.read_bytes()).decode('ascii')),encoding='utf-8')
        pdf=pdfium.PdfDocument(str(folder/f'figure{n}.pdf'))
        pdf[0].render(scale=300/72).to_pil().save(folder/f'figure{n}.png',dpi=(300,300));pdf.close()
    FIGS[lang]=figs
(ROOT/'figure_localization.json').write_text(json.dumps(localization,ensure_ascii=False,indent=2),encoding='utf-8')

LAYOUT=[]
def styles(lang):
    cn=lang=='zh';serif='CNSong' if cn else 'Serif';sans='CNHei' if cn else 'Sans';bold='CNHei' if cn else 'SansBold'
    common={'textColor':colors.black,'wordWrap':'CJK' if cn else None}
    return {
    'equation':ParagraphStyle('equation',fontName='Serif',fontSize=10.5,leading=17,spaceAfter=8,alignment=1,textColor=colors.black),
    'body':ParagraphStyle('body',fontName=serif,fontSize=11 if cn else 10.3,leading=16 if cn else 12.9,spaceAfter=7 if cn else 6,allowWidows=0,allowOrphans=0,**common),
    'heading':ParagraphStyle('heading',fontName=bold,fontSize=12 if cn else 11.4,leading=16 if cn else 14,spaceBefore=4,spaceAfter=9,keepWithNext=True,**common),
    'caption':ParagraphStyle('caption',fontName=sans,fontSize=8.6 if cn else 8.4,leading=12 if cn else 10.6,spaceAfter=8,**common),
    'abstract':ParagraphStyle('abstract',fontName=serif,fontSize=10.6 if cn else 11,leading=15 if cn else 14.2,**common),
    'small':ParagraphStyle('small',fontName=serif,fontSize=9.2,leading=12 if cn else 11.4,spaceAfter=6,**common),
    'reference':ParagraphStyle('reference',fontName='Serif',fontSize=8.6,leading=10.7,spaceAfter=6,textColor=INK),
    'cell':ParagraphStyle('cell',fontName=sans,fontSize=8.7 if cn else 8.6,leading=12 if cn else 11,**common),
    'cellhead':ParagraphStyle('cellhead',fontName=bold,fontSize=8.9,leading=12 if cn else 11,**common)}
def fill(items,w,h):
    rest=list(items);drawn=[];used=0
    while rest:
        p=rest[0];_,ph=p.wrap(w,max(1,h-used));gap=p.getSpaceAfter()
        if p.getKeepWithNext() and len(rest)>1 and ph+gap+28>h-used:break
        if ph+gap<=h-used+.01:drawn.append((p,ph,gap));used+=ph+gap;rest.pop(0)
        else:
            parts=p.split(w,max(0,h-used-gap))
            if len(parts)>1:
                first=parts[0];_,fh=first.wrap(w,h-used);drawn.append((first,fh,0));used+=fh;rest=parts[1:]+rest[1:]
            break
    return drawn,rest,used
def columns(c,items,top,lang,bottom=49):
    cw=251;low=1;high=top-bottom
    for _ in range(17):
        mid=(low+high)/2;a,r,_=fill(items,cw,mid);b,left,_=fill(r,cw,mid)
        if left:low=mid
        else:high=mid
    h=min(top-bottom,high+.4);a,r,ua=fill(items,cw,h);b,left,ub=fill(r,cw,h)
    if left:
        required=top-bottom
        while left and required<1000:
            required+=5;_,rr,_=fill(items,cw,required);_,left,_=fill(rr,cw,required)
        raise RuntimeError(f'{lang} page {c.getPageNumber()} overflow; top={top:.1f}, available={top-bottom:.1f}, required={required:.1f}')
    for col,blocks in enumerate([a,b]):
        y=top
        for p,ph,gap in blocks:p.drawOn(c,45+col*271,y-ph);y-=ph+gap
    LAYOUT.append({'language':lang,'page':c.getPageNumber(),'column_heights':[ua,ub],'bottom':top-max(ua,ub)})
def at(c,p,y,x=45,width=W):
    _,h=p.wrap(width,2000);p.drawOn(c,x,y-h);return y-h-p.getSpaceAfter()
def pdf_edition(lang):
    d=D[lang];S=styles(lang);cn=lang=='zh'
    def p(t,s='body'):
        if t.startswith(('Δx_i','Δz_j','ΔW =')):s='equation'
        m=markup(t)
        for symbol in '∀∃':m=m.replace(symbol,f'<font name="Symbols">{symbol}</font>')
        if cn:
            fallback='Sans' if s in ['caption','cell','cellhead','heading'] else 'Serif'
            m=m.replace('−',f'<font name="{fallback}">−</font>')
        return Paragraph(m,S[s])
    c=canvas.Canvas(str(ROOT/f'Health_value_AI_{lang.upper()}.pdf'),pagesize=(612,792),pageCompression=1)
    c.setTitle(d['title']);c.setAuthor('Richard T. Millian');c.setSubject('Perspective')
    def header(n):
        c.setFillColor(colors.HexColor('#176C70'));c.setFont('SansBold',8.5)
        c.drawString(45,759,'Perspective');c.setFillColor(colors.black)
        c.setFont('CNHei' if cn else 'Sans',8);c.drawRightString(567,759,'人工智能时代的健康经济价值' if cn else 'Health economic value in the AI era')
        c.setStrokeColor(GRID);c.setLineWidth(.65);c.line(45,751,567,751)
        c.setFont('Sans',8);c.drawString(45,29,'Richard T. Millian');c.drawRightString(567,29,f'{n} / {PAGE_COUNT}')
    def fig(n,y):
        g=FIGS[lang][n];renderPDF.draw(g,c,45,y-g.height)
        return at(c,p(d['captions'][str(n)],'caption'),y-g.height-5)-7
    def table(n,y):
        t=d['tables'][n];y=at(c,p(t['caption'],'caption'),y)
        widths={'1':[104,216,202],'2':[137,214,171],'3':[137,208,177]}[n]
        rows=[[p(v,'cellhead' if i==0 else 'cell') for v in row] for i,row in enumerate(t['rows'])]
        tab=Table(rows,colWidths=widths,hAlign='LEFT')
        tab.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#EDF1F2')),('LINEABOVE',(0,0),(-1,0),.8,INK),('LINEBELOW',(0,0),(-1,0),.5,INK),('LINEBELOW',(0,1),(-1,-1),.35,GRID),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
        _,h=tab.wrap(W,2000);tab.drawOn(c,45,y-h);return y-h-14
    for n in range(1,PAGE_COUNT+1):
        header(n);y=733
        if n==1:
            st=ParagraphStyle('title',fontName='CNHei' if cn else 'Display',fontSize=27 if cn else 26,leading=35 if cn else 29,wordWrap='CJK' if cn else None,textColor=colors.black)
            y=at(c,Paragraph(escape(d['title']).replace('：','：<br/>') if cn else escape(d['title']),st),y)-15
            c.setFont('SansBold',10.5);c.drawString(45,y,'Richard T. Millian');y-=16
            c.setFont('CNHei' if cn else 'Sans',9.5);c.drawString(45,y,'杭州师范大学' if cn else 'Hangzhou Normal University');y-=23
            y=at(c,p(d['abstract'],'abstract'),y)-15;y=fig(1,y)
            if y<46:raise RuntimeError(f'{lang} title page overflow {y}')
            LAYOUT.append({'language':lang,'page':1,'bottom':y})
        elif n==PAGE_COUNT:
            y=at(c,p('参考文献' if cn else 'References','heading'),y)-3
            items=[p(reftext(e),'reference') for e in ORDER]
            columns(c,items,y,lang)
        else:
            if n in [8,9,10,11]:
                y=at(c,p(d['pages'][str(n)][0]['heading'],'heading'),y)-5
            if n in PAGEFIG:y=fig(PAGEFIG[n],y)
            if n in PAGETABLE:y=table(PAGETABLE[n],y)
            items=[]
            for sec in d['pages'].get(str(n),[]):items+=([] if n in [8,9,10,11] else [p(sec['heading'],'heading')])+[p(t) for t in sec['paragraphs']]
            columns(c,items,y,lang)
        c.showPage()
    c.save()

def word_edition(lang):
    d=D[lang];cn=lang=='zh';doc=Document()
    for ob in list(doc.styles.element.iter(qn('w:pBdr'))):ob.getparent().remove(ob)
    def fonts(style,latin,east):
        style.font.name=latin;f=style.element.get_or_add_rPr().get_or_add_rFonts();f.set(qn('w:eastAsia'),east)
        for k in ['asciiTheme','hAnsiTheme','eastAsiaTheme','cstheme']:
            if qn('w:'+k) in f.attrib:del f.attrib[qn('w:'+k)]
    normal=doc.styles['Normal'];fonts(normal,'Times New Roman','宋体');normal.font.size=Pt(11 if cn else 10.3)
    normal.paragraph_format.line_spacing=Pt(16) if cn else 1.08;normal.paragraph_format.space_after=Pt(6 if cn else 5);normal.paragraph_format.widow_control=True
    for name,size in [('Title',27 if cn else 26),('Heading 1',12),('Heading 2',10.5)]:
        st=doc.styles[name];fonts(st,'Georgia' if name=='Title' else 'Arial','黑体');st.font.size=Pt(size);st.font.bold=not cn;st.font.color.rgb=RGBColor(0,0,0)
        st.paragraph_format.space_before=Pt(4);st.paragraph_format.space_after=Pt(7);st.paragraph_format.keep_with_next=True
    def section(sec,cols=1):
        sec.page_width=Inches(8.5);sec.page_height=Inches(11);sec.left_margin=sec.right_margin=Inches(.625);sec.top_margin=Inches(.66);sec.bottom_margin=Inches(.62)
        sec.header_distance=sec.footer_distance=Inches(.29);cc=sec._sectPr.find(qn('w:cols'));cc.set(qn('w:num'),str(cols));cc.set(qn('w:space'),'400')
        grid=sec._sectPr.find(qn('w:docGrid'))
        if grid is not None:sec._sectPr.remove(grid)
    def newpage():
        if doc.sections[-1]._sectPr.find(qn('w:cols')).get(qn('w:num'))=='2':section(doc.add_section(WD_SECTION_START.CONTINUOUS),1)
        section(doc.add_section(WD_SECTION_START.NEW_PAGE),1)
    def cols():section(doc.add_section(WD_SECTION_START.CONTINUOUS),2)
    section(doc.sections[0])
    h=doc.sections[0].header.paragraphs[0];h.text='Perspective  |  人工智能时代的健康经济价值' if cn else 'Perspective  |  Health economic value in the AI era'
    for r in h.runs:r.font.name='Arial';r.font.size=Pt(8);r._element.get_or_add_rPr().get_or_add_rFonts().set(qn('w:eastAsia'),'黑体')
    f=doc.sections[0].footer.paragraphs[0];f.text='Richard T. Millian    ';f.alignment=WD_ALIGN_PARAGRAPH.RIGHT
    field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');f._p.append(field)
    for r in f.runs:r.font.size=Pt(8)
    def dp(t,style=None,size=None,sans=False):
        p=doc.add_paragraph(style=style)
        for seg in re.split(r'(<b>.*?</b>)',cite(t)):
            if not seg:continue
            for token in re.split(r'([xz]_[ijk])',re.sub('<[^>]+>','',seg)):
                if re.fullmatch(r'[xz]_[ijk]',token):p.add_run(token[0]);r=p.add_run(token[2]);r.font.subscript=True
                else:r=p.add_run(token)
                if seg.startswith('<b>'):r.bold=not cn
                if size:r.font.size=Pt(size)
                if sans:r.font.name='Arial';r._element.get_or_add_rPr().get_or_add_rFonts().set(qn('w:eastAsia'),'黑体')
        return p
    def dc(t):
        p=dp(t,size=8.6 if cn else 8.5,sans=True);p.paragraph_format.line_spacing=Pt(12) if cn else 1.05;p.paragraph_format.space_after=Pt(8)
    def df(n):
        pic=doc.add_picture(str(ROOT/'figures'/lang/f'figure{n}.png'),width=Inches(7.25));pic._inline.docPr.set('descr',plain(d['captions'][str(n)]))
        # Inline illustrations need automatic line height; fixed CJK body leading clips them.
        picture_paragraph=doc.paragraphs[-1];picture_paragraph.paragraph_format.line_spacing=1
        picture_paragraph.paragraph_format.space_after=Pt(5)
        dc(d['captions'][str(n)])
    def equation(t):
        p=doc.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.CENTER
        m=OxmlElement('m:oMath')
        for token in re.split(r'([xz]_[ijk])',t):
            if re.fullmatch(r'[xz]_[ijk]',token):
                sub=OxmlElement('m:sSub')
                for tag,txt in [('m:e',token[0]),('m:sub',token[2])]:
                    e=OxmlElement(tag);r=OxmlElement('m:r');v=OxmlElement('m:t');v.text=txt;r.append(v);e.append(r);sub.append(e)
                m.append(sub)
            else:
                r=OxmlElement('m:r');v=OxmlElement('m:t');v.text=token
                if re.search('[\u4e00-\u9fff]',token):
                    pr=OxmlElement('w:rPr');rf=OxmlElement('w:rFonts');rf.set(qn('w:eastAsia'),'宋体');pr.append(rf);r.append(pr)
                r.append(v);m.append(r)
        p._p.append(m)
    def dt(n):
        info=d['tables'][n];dc(info['caption']);widths={'1':[104,216,202],'2':[137,214,171],'3':[137,208,177]}[n]
        tab=doc.add_table(rows=1,cols=3);tab.autofit=False
        for j,w in enumerate(widths):tab.columns[j].width=Inches(w/72)
        for i,row in enumerate(info['rows']):
            cells=tab.rows[0].cells if i==0 else tab.add_row().cells
            tr=cells[0]._tc.getparent().get_or_add_trPr();tr.append(OxmlElement('w:cantSplit'))
            if i==0:tr.append(OxmlElement('w:tblHeader'))
            for j,(cell,txt) in enumerate(zip(cells,row)):
                cell.width=Inches(widths[j]/72);p=cell.paragraphs[0];p.text=plain(txt)
                p.paragraph_format.line_spacing=Pt(12) if cn else 1.05;p.paragraph_format.space_before=Pt(4);p.paragraph_format.space_after=Pt(4)
                for r in p.runs:r.font.name='Arial';r.font.size=Pt(8.7 if cn else 8.5);r.bold=i==0 and not cn;r._element.get_or_add_rPr().get_or_add_rFonts().set(qn('w:eastAsia'),'黑体')
                if i==0:sh=OxmlElement('w:shd');sh.set(qn('w:fill'),'EDF1F2');cell._tc.get_or_add_tcPr().append(sh)
        borders=OxmlElement('w:tblBorders')
        for side in ['top','bottom','insideH']:
            e=OxmlElement('w:'+side);e.set(qn('w:val'),'single');e.set(qn('w:sz'),'4');e.set(qn('w:color'),'BAC5CA');borders.append(e)
        tab._tbl.tblPr.append(borders);gap=doc.add_paragraph();gap.paragraph_format.space_after=Pt(0);gap.paragraph_format.line_spacing=Pt(3);gap.add_run().font.size=Pt(3)
    for page in range(1,PAGE_COUNT+1):
        if page>1:newpage()
        if page==1:
            dp(d['title'].replace('：','：\n') if cn else d['title'],'Title');dp('Richard T. Millian');dp('杭州师范大学' if cn else 'Hangzhou Normal University')
            dp(d['abstract']);df(1)
        elif page==PAGE_COUNT:
            cols();dp('参考文献' if cn else 'References','Heading 1')
            for e in ORDER:
                p=dp(reftext(e),size=8.6);p.paragraph_format.line_spacing=Pt(10.7);p.paragraph_format.space_after=Pt(6)
        else:
            if page in [8,9,10,11]:dp(d['pages'][str(page)][0]['heading'],'Heading 1')
            if page in PAGEFIG:df(PAGEFIG[page])
            if page in PAGETABLE:dt(PAGETABLE[page])
            cols()
            for sec in d['pages'].get(str(page),[]):
                if page not in [8,9,10,11]:dp(sec['heading'],'Heading 1')
                for t in sec['paragraphs']:
                    if t.startswith(('Δx_i','Δz_j','ΔW =')):equation(t)
                    else:dp(t)
    doc.core_properties.title=d['title'];doc.core_properties.author='Richard T. Millian';doc.core_properties.subject='Perspective'
    doc.save(ROOT/f'Health_value_AI_{lang.upper()}.docx')

for lang in ['en','zh']:
    pdf_edition(lang)
    if '--pdf-only' not in sys.argv:word_edition(lang)
    d=D[lang];md='# '+d['title']+'\n\nRichard T. Millian\n\n'+('杭州师范大学' if lang=='zh' else 'Hangzhou Normal University')+'\n\n## '+('摘要' if lang=='zh' else 'Abstract')+'\n\n'+d['abstract']+'\n\n'
    for n in range(1,PAGE_COUNT+1):
        if n in PAGEFIG:
            fi=PAGEFIG[n];md+=f'![Figure {fi}](figures/{lang}/figure{fi}.png)\n\n'+plain(d['captions'][str(fi)])+'\n\n'
        if n in PAGETABLE:
            tab=d['tables'][PAGETABLE[n]];md+=plain(tab['caption'])+'\n\n'
            for i,row in enumerate(tab['rows']):md+='| '+' | '.join(plain(c).replace('\n','; ') for c in row)+' |\n'+('|---|---|---|\n' if i==0 else '')
            md+='\n'
        for sec in d['pages'].get(str(n),[]):md+='## '+sec['heading']+'\n\n'+'\n\n'.join(sec['paragraphs'])+'\n\n'
    md+='## '+('参考文献' if lang=='zh' else 'References')+'\n\n'+'\n\n'.join(reftext(e) for e in ORDER)+'\n'
    (ROOT/f'manuscript_{lang}.md').write_text(cite(md),encoding='utf-8')
(ROOT/'layout_checks.json').write_text(json.dumps(LAYOUT,indent=2),encoding='utf-8')
(ROOT/'internal_status.json').write_text(json.dumps({'article_type':'Conceptual Perspective','human_verification_complete':False,'submission_ready':False,'original_participant_data':False,'paired_languages':['en','zh'],'references':NUM,'figures_per_edition':11,'tables_per_edition':3,'source_version':'health_value_ai_revised','reader_facing_metadata_placeholders':False},indent=2),encoding='utf-8')
print(json.dumps({'created':['Health_value_AI_EN.pdf','Health_value_AI_EN.docx','Health_value_AI_ZH.pdf','Health_value_AI_ZH.docx'],'pages_each_pdf':PAGE_COUNT,'references':len(ORDER),'layout':LAYOUT},ensure_ascii=False))
