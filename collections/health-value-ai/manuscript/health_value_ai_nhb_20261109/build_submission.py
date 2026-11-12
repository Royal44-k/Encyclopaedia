"""Editable author manuscripts and scientific figure sources for NHB Perspective."""
from pathlib import Path
import json,re,copy,csv
from docx import Document
from docx.shared import Pt,Mm,RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH,WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics import renderPDF,renderSVG
from reportlab.graphics.shapes import Drawing,String,Group,Rect,Line,Polygon
from reportlab.lib.colors import HexColor
import pypdfium2 as pdfium
R=Path(__file__).resolve().parent
D=json.loads((R/'content_nhb.json').read_text(encoding='utf-8'))
REFS=json.loads((R/'references.json').read_text(encoding='utf-8'));RM={x['id']:x for x in REFS}
WEB={'E003','E008','E010','E016','E025'}
ABBR={'Journal of Political Economy':'J. Polit. Econ.','The Economic Journal':'Econ. J.','American Journal of Public Health':'Am. J. Public Health','Journal of the European Economic Association':'J. Eur. Econ. Assoc.','The Quarterly Journal of Economics':'Q. J. Econ.','American Psychologist':'Am. Psychol.','Value in Health':'Value Health','Journal of Consumer Research':'J. Consum. Res.','Nature Medicine':'Nat. Med.','Proceedings of the National Academy of Sciences':'Proc. Natl Acad. Sci. USA','American Economic Review':'Am. Econ. Rev.','BMC Medical Informatics and Decision Making':'BMC Med. Inform. Decis. Mak.','Cochrane Database of Systematic Reviews':'Cochrane Database Syst. Rev.','Nature Human Behaviour, Advance online publication':'Nat. Hum. Behav.','Environment International':'Environ. Int.','Cell Metabolism':'Cell Metab.','JAMA Internal Medicine':'JAMA Intern. Med.'}
F=Path('C:/Windows/Fonts')
for name,file in [('Serif','times.ttf'),('SerifBold','timesbd.ttf'),('SerifItalic','timesi.ttf'),('Sans','arial.ttf'),('SansBold','arialbd.ttf'),('CNHei','simhei.ttf'),('CNSong','simsun.ttc'),('Symbols','seguisym.ttf')]:pdfmetrics.registerFont(TTFont(name,str(F/file),subfontIndex=0))
from figures_original import make_figures
from figures_revised import make_revisions
from figure_translations import TRANSLATIONS
INK=HexColor('#182B35');TEAL=HexColor('#176C70');BLUE=HexColor('#3262A3');RUST=HexColor('#B85834');PURPLE=HexColor('#7E60A4');GRAY=HexColor('#536775');GRID=HexColor('#C8D4D8')
WIDTH=165/25.4*72

def strings(g):
    if isinstance(g,String):yield g
    for c in getattr(g,'contents',[]):yield from strings(c)

def repair(g):
    for i,ob in enumerate(getattr(g,'contents',[])):
        if not isinstance(ob,String):repair(ob);continue
        glyphs=pdfmetrics.getFont(ob.fontName).face.charToGlyph
        if all(ord(ch) in glyphs for ch in ob.text):continue
        runs=[]
        for ch in ob.text:
            f=ob.fontName if ord(ch) in glyphs else 'Sans'
            assert ord(ch) in pdfmetrics.getFont(f).face.charToGlyph,(ch,ob.text)
            if runs and runs[-1][0]==f:runs[-1][1]+=ch
            else:runs.append([f,ch])
        widths=[pdfmetrics.stringWidth(t,f,ob.fontSize) for f,t in runs]
        x=ob.x-(sum(widths)/2 if ob.textAnchor=='middle' else sum(widths) if ob.textAnchor=='end' else 0)
        group=Group()
        for (f,t),w in zip(runs,widths):
            z=copy.copy(ob);z.x=x;z.text=t;z.fontName=f;z.textAnchor='start';group.add(z);x+=w
        g.contents[i]=group

def cases(lang):
    cn=lang=='zh';g=Drawing(522,412)
    def tx(x,y,en,zh,size=7.7,color=INK,bold=False):g.add(String(x,y,zh if cn else en,fontName='CNHei' if cn else 'SansBold' if bold else 'Sans',fontSize=size,fillColor=color))
    def line(x,y,x2,y2,color=GRID):g.add(Line(x,y,x2,y2,strokeColor=color,strokeWidth=.65))
    def panel(x,y,letter,en,zh):tx(x,y,letter,letter,8.8,INK,True);tx(x+17,y,en,zh,8,INK,True)
    panel(0,397,'a','One day: distinguish pay from supplements','单日比较：区分日薪、补贴与总收入')
    cols=[(8,'Ordinary day','正常工作',200,0),(181,'Until 02:00','工作至凌晨两点',600,400),(354,'Overnight','通宵工作',1200,1000)]
    for x,en,zh,total,extra in cols:
        tx(x,377,en,zh,7.8,BLUE,True)
        tx(x,359,f'CNY 200 + {extra:,}',f'200 元 ＋ {extra:,} 元',7.7)
        tx(x,341,f'= CNY {total:,}',f'＝ {total:,} 元',9,TEAL,True)
        g.add(Rect(x,325,total/1200*143,5,fillColor=TEAL,strokeColor=None))
    tx(8,308,'Record next-day duties, sleep opportunity and recovery.','继续记录次日安排、睡眠机会与恢复过程。',7.7,GRAY)
    line(0,296,522,296)
    panel(0,279,'b','One common horizon: 28 days','共同观察期限：28 天')
    for y,lab,n,amount,col in [(250,'A',7,10000,BLUE),(219,'B',28,100000,RUST)]:
        tx(8,y,lab,lab,8,col,True)
        for j in range(28):g.add(Rect(35+j*11,y-3,8,8,fillColor=col if j<n else HexColor('#E7EDF0'),strokeColor=None))
        tx(355,y,f'{n} days / CNY {amount:,}',f'{n} 天／{amount:,} 元',7.7,col)
    tx(35,195,'Additional supplement: CNY 90,000; additional overtime: 21 days.','补贴多 90,000 元；加班日多 21 天。',7.7,INK,True)
    tx(35,178,'Follow consequences beyond day 28 if they persist.','若影响持续，观察应延伸至第 28 天之后。',7.7,GRAY)
    line(0,166,522,166)
    panel(0,148,'c','Food choices over four weeks','四周饮食选择')
    panel(278,148,'d','Two hours of leisure','两小时闲暇安排')
    line(260,12,260,152)
    pairs=[(124,'Purchase or preparation','购买或自行准备','What activity is displaced?','替代了原本哪项活动？'),(103,'Money + shopping + cleaning time','钱款＋采购与清理时间','Enjoyment and ability to stop','愉悦感与自主停止'),(82,'Taste, satiety and relevant outcomes','口味、饱腹感及相关结果','Sleep and next-day functioning','睡眠与次日功能'),(61,'Who does the unpaid work?','无偿劳动由谁承担？','Does support persist?','支持效果能否持续？')]
    for y,a,b,c,d in pairs:tx(17,y,a,b,7.7);tx(295,y,c,d,7.7)
    tx(17,28,'Feasible alternatives first','先确认方案现实可行',7.7,TEAL,True)
    tx(295,28,'Personal priorities remain explicit','明确保留个人偏好',7.7,PURPLE,True)
    return g

def figures():
    sizes={}
    for lang in ['en','zh']:
        orig=make_figures();rev=make_revisions(lang)
        gs={'Fig1':rev[2],'Fig2':rev[4],'Fig3':orig[5],'Fig4':cases(lang),'ExtendedDataFig1':rev[1],'ExtendedDataFig2':orig[3],'ExtendedDataFig3':rev[7],'ExtendedDataFig4':rev[8]}
        for key,g in gs.items():
            if lang=='zh' and key in ['Fig3','ExtendedDataFig2']:
                for ob in strings(g):
                    if ob.text in TRANSLATIONS:ob.text=TRANSLATIONS[ob.text]
                    elif re.fullmatch(r'[+−]?\d+ h',ob.text):ob.text=ob.text[:-2]+' 小时'
                    elif re.search('[A-Za-z]{3}',ob.text):raise ValueError('Untranslated figure text: '+ob.text)
                    if re.search('[\u4e00-\u9fff]',ob.text):ob.fontName='CNHei'
            ratio=WIDTH/g.width
            for ob in strings(g):
                ob.fontSize=(8 if re.fullmatch('[a-d]',ob.text) else min(7,max(5.5,ob.fontSize*ratio)))/ratio
            repair(g)
            target=Drawing(WIDTH,g.height*ratio);grp=Group(g);grp.scale(ratio,ratio);target.add(grp)
            folder=R/'figures'/lang;folder.mkdir(parents=True,exist_ok=True)
            renderPDF.drawToFile(target,str(folder/(key+'.pdf')));renderSVG.drawToFile(target,str(folder/(key+'.svg')))
            pdf=pdfium.PdfDocument(str(folder/(key+'.pdf')));pdf[0].render(scale=300/72).to_pil().save(folder/(key+'.png'),dpi=(300,300));pdf.close()
            sizes[lang+'_'+key]={'width_mm':165,'height_pt':target.height,'standard_label_pt':[5.5,7],'panel_label_pt':8}
    return sizes

def compact(nums):
    nums=sorted(set(nums));out=[];i=0
    while i<len(nums):
        j=i
        while j+1<len(nums) and nums[j+1]==nums[j]+1:j+=1
        out.append(str(nums[i])+'–'+str(nums[j]) if j-i>=2 else ','.join(str(n) for n in nums[i:j+1]))
        i=j+1
    return ','.join(out)

def alltext(d,supp=False):
    if not supp:
        for s in d['sections']:yield from s['paragraphs']
        yield from d['captions'].values()
    else:
        # Supplementary tables precede extended-data illustrations in the supporting file.
        for t in d['tables'].values():
            yield t['caption']
            for row in t['rows']:yield from row
        yield from d['extended_captions'].values()

def number_map(d,supp=False):
    order=[e for e in dict.fromkeys(re.findall(r'\[@(E\d+)\]','\n'.join(alltext(d,supp)))) if e not in WEB]
    return {e:i+1 for i,e in enumerate(order)}

def setup(lang,supp):
    cn=lang=='zh';doc=Document();sec=doc.sections[0]
    sec.page_width=Mm(210);sec.page_height=Mm(297);sec.top_margin=Mm(22);sec.bottom_margin=Mm(22);sec.left_margin=Mm(22.5);sec.right_margin=Mm(22.5);sec.header_distance=Mm(10);sec.footer_distance=Mm(10)
    specs={'Normal':('Times New Roman','宋体',12,False,24),'Title':('Arial','黑体',18,True,24),'Subtitle':('Arial','宋体',10,False,14),'Heading 1':('Arial','黑体',14,True,18),'Heading 2':('Arial','黑体',12,True,16),'Abstract':('Times New Roman','宋体',11,False,17),'Caption':('Arial','宋体',10,False,14),'Reference':('Times New Roman','宋体',10.5,False,14),'Table Text':('Arial','宋体',10,False,14),'Table Title':('Arial','黑体',11,True,15)}
    for name,(latin,east,size,bold,leading) in specs.items():
        st=doc.styles[name] if name in doc.styles else doc.styles.add_style(name,1)
        st.font.name=latin;st.font.size=Pt(size);st.font.bold=bold;st.font.italic=False;st.font.color.rgb=RGBColor(0,0,0)
        st._element.get_or_add_rPr().get_or_add_rFonts().set(qn('w:eastAsia'),east)
        for attr in list(st._element.get_or_add_rPr().get_or_add_rFonts().attrib):
            if attr.endswith('Theme'):del st._element.get_or_add_rPr().get_or_add_rFonts().attrib[attr]
        for tag in ['w:spacing','w:position','w:caps','w:smallCaps']:
            for el in st._element.get_or_add_rPr().findall(tag,{'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}):el.getparent().remove(el)
        for el in st._element.get_or_add_pPr().findall(qn('w:pBdr')):el.getparent().remove(el)
        pf=st.paragraph_format;pf.line_spacing=Pt(leading);pf.space_before=Pt(0);pf.space_after=Pt(0);pf.widow_control=True
        if name=='Normal':pf.first_line_indent=Pt(24 if cn else 18);pf.space_after=Pt(0)
        else:pf.first_line_indent=Pt(0)
        if name.startswith('Heading'):pf.space_before=Pt(14);pf.space_after=Pt(6);pf.keep_with_next=True
        if name=='Title':pf.space_after=Pt(12);pf.keep_with_next=True
        if name=='Abstract':pf.space_after=Pt(12)
        if name=='Caption':pf.space_before=Pt(6);pf.space_after=Pt(6)
        if name=='Reference':pf.left_indent=Pt(18);pf.first_line_indent=Pt(-18);pf.space_after=Pt(6)
    for style in ['Header','Footer']:
        st=doc.styles[style];st.font.name='Arial';st.font.size=Pt(8);st.font.color.rgb=RGBColor(0,0,0);st.paragraph_format.tab_stops.clear_all()
        st.paragraph_format.first_line_indent=Pt(0)
        st._element.get_or_add_rPr().get_or_add_rFonts().set(qn('w:eastAsia'),'黑体')
    h=sec.header.paragraphs[0];h.paragraph_format.tab_stops.add_tab_stop(Pt(WIDTH),WD_TAB_ALIGNMENT.RIGHT)
    h.text='Perspective\t'+('补充材料' if cn and supp else 'Supporting information' if supp else '健康经济价值' if cn else 'Health economic value')
    f=sec.footer.paragraphs[0];f.alignment=WD_ALIGN_PARAGRAPH.RIGHT
    for ins in ['PAGE','NUMPAGES']:
        if ins=='NUMPAGES':f.add_run(' / ')
        fld=OxmlElement('w:fldSimple');fld.set(qn('w:instr'),ins);f._p.append(fld)
    if not supp:
        ln=OxmlElement('w:lnNumType');ln.set(qn('w:countBy'),'5');ln.set(qn('w:restart'),'continuous');ln.set(qn('w:distance'),'180');sec._sectPr.append(ln)
    settings=doc.settings._element
    upd=OxmlElement('w:updateFields');upd.set(qn('w:val'),'true');settings.append(upd)
    doc.core_properties.author='Richard T. Millian';doc.core_properties.title=D[lang]['title'];doc.core_properties.subject='Perspective'
    return doc

class AuthorFile:
    def __init__(self,lang,supp=False):
        self.lang=lang;self.cn=lang=='zh';self.supp=supp;self.d=D[lang];self.doc=setup(lang,supp);self.num=number_map(self.d,supp);self.seenweb=set();self.bookid=0;self.citation_count=0;self.crossrefs=[]
    def field(self,p,instr,text):
        el=OxmlElement('w:fldSimple');el.set(qn('w:instr'),instr)
        rr=OxmlElement('w:r');tt=OxmlElement('w:t');tt.text=text;rr.append(tt);el.append(rr);p._p.append(el)
    def ordinary(self,p,text,bold=False,italic=False):
        # Cross-references are native REF fields; labels remain at normal baseline.
        pattern=r'((?:Extended Data Fig\.|Supplementary Table|Fig\.|扩展数据图|补充表|图)\s*)(\d+)([a-d]?)'
        last=0
        for m in re.finditer(pattern,text):
            self.literal(p,text[last:m.start()],bold,italic)
            lab=m[1];n=m[2];key=('ED' if 'Extended' in lab or '扩展' in lab else 'ST' if 'Supplementary' in lab or '补充' in lab else 'F')+n
            self.literal(p,lab,bold,italic)
            if (self.supp and key.startswith('F')) or (not self.supp and key.startswith(('ED','ST'))):self.literal(p,n,bold,italic)
            else:self.field(p,'REF '+key+' \\h',n)
            self.literal(p,m[3],bold,italic);self.crossrefs.append(key+m[3]);last=m.end()
        self.literal(p,text[last:],bold,italic)
    def literal(self,p,text,bold=False,italic=False):
        for tok in re.split(r'([xz]_[ijk]|T_[01])',text):
            if not tok:continue
            if re.fullmatch(r'[xz]_[ijk]|T_[01]',tok):
                r=p.add_run(tok[0]);r.italic=True
                r=p.add_run(tok[2]);r.font.subscript=True;r.italic=True
            else:r=p.add_run(tok)
            if bold:r.bold=True
            if italic:r.italic=True
    def rich(self,p,text):
        if not self.cn:text=re.sub(r'</b>(?=[A-Za-z])','</b> ',text)
        # Merge adjacent groups, trim the preceding gap and attach before sentence punctuation.
        group=r'\[@E\d+\](?:\s*\[@E\d+\])*'
        text=re.sub(r'([.。；;，,])\s*('+group+')',lambda m:m[2].rstrip()+m[1],text)
        text=re.sub(r'\s+(?=\[@E\d+\])','',text)
        bold=False;italic=False
        for tok in re.split(r'('+group+r'|</?b>|</?i>)',text):
            if not tok:continue
            if tok=='<b>':bold=True;continue
            if tok=='</b>':bold=False;continue
            if tok=='<i>':italic=True;continue
            if tok=='</i>':italic=False;continue
            ids=re.findall(r'\[@(E\d+)\]',tok)
            if ids:
                ns=[self.num[e] for e in ids if e not in WEB]
                if ns:
                    r=p.add_run(compact(ns));r.font.superscript=True;self.citation_count+=1
                for e in ids:
                    if e in WEB and e not in self.seenweb:
                        p.add_run(('（' if self.cn else ' (')+RM[e]['url']+('）' if self.cn else ')'));self.seenweb.add(e)
                if tok.endswith(' '):p.add_run(' ')
            else:self.ordinary(p,tok,bold,italic)
    def p(self,text,style='Normal',first=False):
        p=self.doc.add_paragraph(style=style);self.rich(p,text)
        if first and not self.cn:p.paragraph_format.first_line_indent=Pt(0)
        return p
    def no_line_num(self,p):
        x=OxmlElement('w:suppressLineNumbers');p._p.get_or_add_pPr().append(x)
    def title(self):
        self.no_line_num(self.p(self.d['title'],'Title'))
        a=self.p('Richard T. Millian','Subtitle');self.no_line_num(a)
        for r in a.runs:r.bold=True;r.font.size=Pt(11)
        a=self.p('杭州师范大学' if self.cn else 'Hangzhou Normal University','Subtitle');self.no_line_num(a);a.paragraph_format.space_after=Pt(12)
        if self.supp:
            self.p('补充材料' if self.cn else 'Supporting information','Heading 1')
            self.p('含补充表 1–3、扩展数据图 1–4及补充参考文献。' if self.cn else 'Supplementary Tables 1–3, Extended Data Figs. 1–4 and Supplementary References.','Abstract')
        else:
            self.no_line_num(self.p('摘要' if self.cn else 'Abstract','Heading 2'))
            self.no_line_num(self.p(self.d['abstract'],'Abstract'))
    def equation(self,t):
        n=re.search(r'\((\d+)\)\s*$',t)[1];t=re.sub(r'\.\s*\(\d+\)\s*$','',t)
        p=self.doc.add_paragraph();pf=p.paragraph_format;pf.first_line_indent=Pt(0);pf.line_spacing=Pt(24);pf.space_before=Pt(6);pf.space_after=Pt(6)
        pf.tab_stops.add_tab_stop(Pt(WIDTH/2),WD_TAB_ALIGNMENT.CENTER);pf.tab_stops.add_tab_stop(Pt(WIDTH),WD_TAB_ALIGNMENT.RIGHT)
        p.add_run('\t');m=OxmlElement('m:oMath')
        for tok in re.split(r'([xz]_[ijk]|T_[01])',t):
            if not tok:continue
            if re.fullmatch(r'[xz]_[ijk]|T_[01]',tok):
                sub=OxmlElement('m:sSub')
                for tag,txt in [('m:e',tok[0]),('m:sub',tok[2])]:
                    el=OxmlElement(tag);rr=OxmlElement('m:r');tt=OxmlElement('m:t');tt.text=txt;rr.append(tt);el.append(rr);sub.append(el)
                m.append(sub)
            else:
                rr=OxmlElement('m:r');tt=OxmlElement('m:t');tt.text=tok;rr.append(tt);m.append(rr)
        p._p.append(m);p.add_run('\t('+n+')')
    def caption(self,key,text):
        p=self.doc.add_paragraph(style='Caption')
        lab=('扩展数据图 ' if self.cn else 'Extended Data Fig. ') if key.startswith('ED') else ('补充表 ' if self.cn else 'Supplementary Table ') if key.startswith('ST') else ('图 ' if self.cn else 'Fig. ')
        n=re.search(r'\d+',key)[0];p.add_run(lab).bold=True
        self.bookid+=1;bm=OxmlElement('w:bookmarkStart');bm.set(qn('w:id'),str(self.bookid));bm.set(qn('w:name'),key);p._p.append(bm)
        seq='ExtendedDataFigure' if key.startswith('ED') else 'SupplementaryTable' if key.startswith('ST') else 'Figure'
        self.field(p,'SEQ '+seq+' \\* ARABIC',n)
        end=OxmlElement('w:bookmarkEnd');end.set(qn('w:id'),str(self.bookid));p._p.append(end)
        p.add_run(' | ').bold=True;self.rich(p,text);self.no_line_num(p)
        return p
    def figure(self,key,caption):
        self.doc.add_page_break()
        p=self.doc.add_paragraph();p.paragraph_format.first_line_indent=Pt(0);p.paragraph_format.line_spacing=1;p.paragraph_format.keep_with_next=True;p.paragraph_format.space_after=Pt(3)
        folderkey=key.replace('ED','ExtendedDataFig').replace('F','Fig',1) if key.startswith('F') else key.replace('ED','ExtendedDataFig')
        pic=p.add_run().add_picture(str(R/'figures'/self.lang/(folderkey+'.png')),width=Mm(165))
        pic._inline.docPr.set('descr',re.sub(r'<[^>]+>|\[@E\d+\]','',caption));self.no_line_num(p)
        self.caption(key,caption)
    def table(self,n,info):
        self.doc.add_page_break();cap=self.caption('ST'+n,info['caption']);cap.paragraph_format.keep_with_next=True
        table=self.doc.add_table(rows=0,cols=3);table.autofit=False
        for col,w in zip(table.columns,[39,65,61]):col.width=Mm(w)
        borders=OxmlElement('w:tblBorders')
        for side in ['top','bottom']:
            e=OxmlElement('w:'+side);e.set(qn('w:val'),'single');e.set(qn('w:sz'),'8');e.set(qn('w:color'),'000000');borders.append(e)
        for side in ['left','right','insideV','insideH']:
            e=OxmlElement('w:'+side);e.set(qn('w:val'),'nil');borders.append(e)
        table._tbl.tblPr.append(borders)
        for i,row in enumerate(info['rows']):
            cells=table.add_row().cells;tr=cells[0]._tc.getparent().get_or_add_trPr();tr.append(OxmlElement('w:cantSplit'))
            if i==0:tr.append(OxmlElement('w:tblHeader'))
            for cell,txt,w in zip(cells,row,[39,65,61]):
                cell.width=Mm(w);p=cell.paragraphs[0];p.style=self.doc.styles['Table Text'];p.paragraph_format.space_before=Pt(6);p.paragraph_format.space_after=Pt(6);self.rich(p,txt)
                if i==0:
                    for r in p.runs:r.bold=True
                    bord=OxmlElement('w:tcBorders');ed=OxmlElement('w:bottom');ed.set(qn('w:val'),'single');ed.set(qn('w:sz'),'4');ed.set(qn('w:color'),'000000');bord.append(ed);cell._tc.get_or_add_tcPr().append(bord)
        note=('AI，人工智能；OR，比值比；CI，置信区间。' if self.cn else 'AI, artificial intelligence; OR, odds ratio; CI, confidence interval.') if n=='2' else ('ICF，国际功能、残疾和健康分类；WHO-5，世界卫生组织五项心理福祉指数；MCDA，多准则决策分析。' if self.cn else 'ICF, International Classification of Functioning, Disability and Health; WHO-5, World Health Organization-Five Well-Being Index; MCDA, multicriteria decision analysis.') if n=='1' else ''
        if note:self.p(note,'Caption')
    def refs(self):
        if self.supp:self.doc.add_page_break()
        self.p('补充参考文献' if self.cn and self.supp else 'Supplementary references' if self.supp else '参考文献' if self.cn else 'References','Heading 1')
        for e,n in self.num.items():
            r=RM[e];p=self.doc.add_paragraph(style='Reference')
            p.add_run(str(n)+'. '+r['authors'].rstrip('.')+'. ')
            if e=='E017':
                z=p.add_run(r['title']);z.italic=True;p.add_run(' (World Health Organization, 2024). WHO/UCN/MSD/MHE/2024.01.');continue
            p.add_run(r['title'].rstrip('.')+'. ')
            journal='Nat. Hum. Behav.' if r['journal']=='Nature Human Behaviour' else ABBR.get(r['journal'],r['journal']).replace(', Advance online publication','')
            z=p.add_run(journal);z.italic=True
            vol=r.get('volume','')
            if vol:
                v=re.match(r'(\d+)(.*)',vol)
                p.add_run(' ');p.add_run(v[1] if v else vol).bold=True
                if v and v[2]:p.add_run(v[2])
            if r.get('pages'):p.add_run(', '+r['pages'])
            p.add_run(' ('+str(r['year'])+').')
            if r.get('doi'):p.add_run(' https://doi.org/'+r['doi'])
    def build(self):
        self.title()
        if not self.supp:
            for s in self.d['sections']:
                if s['level']>0:self.p(s['heading'],'Heading '+str(s['level']))
                if s.get('case_heading'):self.p(s['case_heading'],'Heading 2')
                for i,t in enumerate(s['paragraphs']):
                    if t.startswith(('Δx_i','Δz_j','ΔW =')):
                        self.doc.paragraphs[-1].paragraph_format.keep_with_next=True
                        self.equation(t)
                    else:self.p(t,first=i==0)
            self.refs()
            for n,c in self.d['captions'].items():self.figure('F'+n,c)
        else:
            for n,t in self.d['tables'].items():self.table(n,t)
            for n,c in self.d['extended_captions'].items():self.figure('ED'+n,c)
            self.refs()
        name=('Supporting_information_' if self.supp else 'Health_value_NHB_')+self.lang.upper()
        self.doc.save(R/(name+'.docx'))
        return {'file':name+'.docx','references':self.num,'numbered_reference_count':len(self.num),'web_sources_in_text':sorted(self.seenweb),'superscript_groups':self.citation_count,'crossreferences':self.crossrefs}

if __name__=='__main__':
    sizes=figures();report={}
    for lang in ['en','zh']:
        for supp in [False,True]:report[lang+('_support' if supp else '_main')]=AuthorFile(lang,supp).build()
    assert report['en_main']['references']==report['zh_main']['references']
    assert report['en_support']['references']==report['zh_support']['references']
    report['figures']=sizes
    report['word_counts']={l:{'abstract':len(re.findall(r'\b[\w-]+\b',d['abstract'])),'main':len(re.findall(r'\b[\w-]+\b',' '.join(t for s in d['sections'] for t in s['paragraphs'])))} for l,d in D.items()}
    (R/'build_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k not in ['figures']},ensure_ascii=False))
