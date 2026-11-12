"""Typeset the bilingual Perspective with figures at the point of argument."""
from pathlib import Path
import re,json,hashlib
from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'deliverables';OUT.mkdir(exist_ok=True)
META=json.loads((ROOT/'editorial_metadata.json').read_text(encoding='utf-8'))
CITE=re.compile(r'\[((?:[A-Z]\d{2})(?:\s*,\s*[A-Z]\d{2})*)\]')

def read_sources():
    data=json.loads((ROOT/'sources.json').read_text(encoding='utf-8'))
    entries=data if isinstance(data,list) else data.get('sources',data.get('records',[]))
    extra=ROOT/'additional_sources.json'
    if extra.exists():entries+=json.loads(extra.read_text(encoding='utf-8'))
    return {s['id']:s for s in entries}

S=read_sources()
md_zh=(ROOT/'manuscript_zh.md').read_text(encoding='utf-8')
order=[]
for m in CITE.finditer(md_zh):
    order.extend(x for x in re.findall(r'[A-Z]\d{2}',m[1]) if x not in order)
assert set(order)<=set(S),set(order)-set(S)
nums={s:i+1 for i,s in enumerate(order)}

def font(st,name,size,east=None,bold=False):
    # Built-in Word styles retain theme fonts that override literal names.
    # Start with clean character properties, including complex-script weight.
    old=st.element.find(qn('w:rPr'))
    if old is not None:st.element.remove(old)
    st.font.name=name;st.font.size=Pt(size);st.font.color.rgb=RGBColor(0,0,0)
    st.font.bold=bold;st.font.italic=False;st.font.underline=False
    rp=st.element.get_or_add_rPr();rf=rp.get_or_add_rFonts()
    for a in ['ascii','hAnsi','cs']:rf.set(qn('w:'+a),name)
    rf.set(qn('w:eastAsia'),east or name)
    for tag,val in [('szCs',str(int(st.font.size.pt*2))),('bCs','1' if bold else '0'),('iCs','0')]:
        el=OxmlElement('w:'+tag);el.set(qn('w:val'),val);rp.append(el)
    lang=OxmlElement('w:lang');lang.set(qn('w:val'),'en-US');lang.set(qn('w:eastAsia'),'zh-CN');rp.append(lang)

def normalise(t):
    return t.replace('**','').replace('\u2011','-')

def inline(p,t,small=False):
    t=normalise(t);pos=0
    for m in CITE.finditer(t):
        p.add_run(t[pos:m.start()])
        r=p.add_run('['+', '.join(str(nums[x]) for x in re.findall(r'[A-Z]\d{2}',m[1]))+']')
        r.font.color.rgb=RGBColor.from_string('247C73')
        pos=m.end()
    p.add_run(t[pos:])
    if small:
        for r in p.runs:r.font.size=Pt(9.5)

def field(p,instr):
    f=OxmlElement('w:fldSimple');f.set(qn('w:instr'),instr);p._p.append(f)

def href(p,label,url):
    h=OxmlElement('w:hyperlink');h.set(qn('r:id'),p.part.relate_to(url,'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',is_external=True))
    r=OxmlElement('w:r');pr=OxmlElement('w:rPr')
    for tag,val in [('color','247C73'),('sz','19')]:
        v=OxmlElement('w:'+tag);v.set(qn('w:val'),val);pr.append(v)
    rf=OxmlElement('w:rFonts');rf.set(qn('w:ascii'),'Times New Roman');rf.set(qn('w:hAnsi'),'Times New Roman');pr.append(rf);r.append(pr)
    t=OxmlElement('w:t');t.text=label;r.append(t);h.append(r);p._p.append(h)

def ref(e,lang='en'):
    s=S[e]
    if s.get('formatted_reference_'+lang):return s['formatted_reference_'+lang]
    if s.get('formatted_reference'):return s['formatted_reference']
    a=s.get('authors',[])
    if isinstance(a,list):a='; '.join(a)
    return f"{a}. {s['title']}. {s.get('venue',s.get('journal',''))} ({s['year']})."

def build(lang):
    zh=lang=='zh';source=ROOT/f'manuscript_{lang}.md'
    if not source.exists():return
    md=source.read_text(encoding='utf-8')
    assert set(re.findall(r'\[([A-Z]\d{2})\]',md))<=set(S)
    blocks=re.split(r'\n\s*\n',md.strip())
    caps={}
    for b in blocks:
        m=re.match(r'(?:\[?CAPTION([123])\]?\s*[:：]?|<!--\s*CAPTION([123])\s*-->)\s*(.*)',b,re.S)
        if m:caps[int(m[1] or m[2])]=m[3]
    assert len(caps)==3,(lang,caps.keys())
    # Keep large illustrations near their discussion without leaving half a
    # printed page blank. Prose order is identical to the reading edition.
    for marker,section,paragraph in [('[SCENE1]','## 2.',3),('[FIGURE2]','## 3.',5),('[SCENE2]','## 4.',2)]:
        blocks.remove(marker)
        start=next(i for i,b in enumerate(blocks) if b.startswith(section))
        candidates=[]
        for j in range(start+1,len(blocks)):
            if blocks[j].startswith('## '):break
            if not blocks[j].startswith(('CAPTION','[FIGURE','[SCENE','#')):candidates.append(j)
        blocks.insert(candidates[paragraph-1]+1,marker)
    doc=Document();sec=doc.sections[0]
    # Remove theme selection from all styles and defaults, including linked
    # character styles. The template's ja-JP setting selects MS Gothic.
    for rf in doc.styles.element.iter(qn('w:rFonts')):
        for a in list(rf.attrib):
            if 'theme' in a.lower():del rf.attrib[a]
    theme_lang=doc.settings.element.find(qn('w:themeFontLang'))
    if theme_lang is not None:
        theme_lang.set(qn('w:val'),'en-US');theme_lang.set(qn('w:eastAsia'),'zh-CN')
    defaults=doc.styles.element.find(qn('w:docDefaults')).find(qn('w:rPrDefault')).find(qn('w:rPr'))
    drf=defaults.find(qn('w:rFonts'))
    for a in ['ascii','hAnsi','cs']:drf.set(qn('w:'+a),'Times New Roman')
    drf.set(qn('w:eastAsia'),'SimSun' if zh else 'Times New Roman')
    dl=defaults.find(qn('w:lang'))
    if dl is not None:dl.set(qn('w:eastAsia'),'zh-CN')
    sec.page_width=Inches(8.5);sec.page_height=Inches(11)
    sec.top_margin=Inches(.72);sec.bottom_margin=Inches(.70);sec.left_margin=sec.right_margin=Inches(.83)
    sec.header_distance=Inches(.29);sec.footer_distance=Inches(.30)
    n=doc.styles['Normal'];font(n,'Times New Roman',11.5,'SimSun' if zh else None)
    n.paragraph_format.line_spacing=Pt(18.3 if zh else 14.7)
    n.paragraph_format.space_after=Pt(7)
    n.paragraph_format.widow_control=True
    for sty,sz in [('Title',25),('Subtitle',10.5),('Heading 1',14),('Heading 2',12)]:
        st=doc.styles[sty];font(st,'Arial',sz,'Microsoft YaHei' if zh else None,bold=sty.startswith('Heading'))
        st.paragraph_format.space_before=Pt(15 if sty.startswith('Heading') else 0)
        st.paragraph_format.space_after=Pt(8 if sty!='Title' else 12)
        st.paragraph_format.keep_with_next=True
    for sty in ['Header','Footer','Caption']:
        font(doc.styles[sty],'Arial',9.5,'Microsoft YaHei' if zh else None)
    for sty,sz,bold in [('Author',11,True),('Affiliation',10,False),('Article type',9,False)]:
        st=doc.styles.add_style(sty,WD_STYLE_TYPE.PARAGRAPH)
        font(st,'Arial',sz,'Microsoft YaHei' if zh else None,bold)
        st.paragraph_format.space_after=Pt(5 if sty=='Author' else 10)
        st.paragraph_format.line_spacing=1.15;st.paragraph_format.keep_with_next=True
    doc.styles['Caption'].font.bold=False;doc.styles['Caption'].font.italic=False
    for st in doc.styles:
        for border in list(st.element.iter(qn('w:pBdr'))):border.getparent().remove(border)
    title=next(b[2:].strip() for b in blocks if b.startswith('# '))
    display_title=title if zh else title.replace(' work across a team','\nwork across a team')
    doc.add_paragraph('观点论文' if zh else 'Perspective','Article type')
    doc.add_paragraph(display_title,'Title')
    doc.add_paragraph(META['author'],'Author')
    doc.add_paragraph(META['affiliation'],'Affiliation')
    hp=sec.header.paragraphs[0];hp.text=META['running_header'][lang];hp.style='Header'
    fp=sec.footer.paragraphs[0];fp.alignment=WD_ALIGN_PARAGRAPH.RIGHT;fp.style='Footer';field(fp,'PAGE')
    used_figs=[];used_scenes=[];body_paras=0;mode='body'
    for b in blocks:
        if b.startswith('# '):continue
        if re.match(r'(\[?CAPTION[123]|<!--\s*CAPTION)',b):continue
        if b.startswith('## '):
            h=b[3:].strip()
            if h in ['参考文献','References','图注','Figure legends']:mode='skip';continue
            mode='body'
            h=re.sub(r'^\d+\.\s*','',h).replace('，','').replace('？','').replace('?','')
            doc.add_paragraph(h,'Heading 1');continue
        if mode=='skip':continue
        sm=re.fullmatch(r'\[SCENE([12])\]',b.strip())
        if sm:
            num=int(sm[1]);used_scenes.append(num);scene=META['scenes'][num-1]
            p=doc.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.line_spacing=1.0;p.paragraph_format.keep_with_next=True
            p.paragraph_format.space_before=Pt(10);p.paragraph_format.space_after=Pt(7)
            caption=scene[lang+'_title']+'。 '+scene[lang+'_caption'] if zh else scene[lang+'_title']+'. '+scene[lang+'_caption']
            shape=p.add_run().add_picture(str(ROOT/'illustrations'/scene['file']),width=Inches(5.65))
            shape._inline.docPr.set('descr',caption)
            cp=doc.add_paragraph(style='Caption');cp.paragraph_format.left_indent=Inches(.595);cp.paragraph_format.right_indent=Inches(.595)
            cp.paragraph_format.line_spacing=Pt(13);cp.paragraph_format.space_after=Pt(13);cp.paragraph_format.keep_together=True
            lead=cp.add_run(('情境 '+chr(64+num)+'  ' if zh else 'Scenario '+chr(64+num)+'  ')+scene[lang+'_title']+('。 ' if zh else '. '));lead.bold=True
            cp.add_run(scene[lang+'_caption'])
            continue
        m=re.fullmatch(r'\[FIGURE([123])\]',b.strip())
        if m:
            num=int(m[1]);used_figs.append(num)
            p=doc.add_paragraph();p.paragraph_format.line_spacing=1.0
            p.paragraph_format.space_before=Pt(9);p.paragraph_format.space_after=Pt(5)
            p.paragraph_format.keep_with_next=True
            shape=p.add_run().add_picture(str(ROOT/'figures'/f'figure{num}_{lang}.png'),width=Inches(6.82))
            shape._inline.docPr.set('descr',normalise(caps[num]))
            cp=doc.add_paragraph(style='Caption');inline(cp,(f'图 {num}  ' if zh else f'Figure {num}  ')+caps[num])
            cp.paragraph_format.line_spacing=Pt(13.2 if zh else 12)
            cp.paragraph_format.space_after=Pt(12);cp.paragraph_format.keep_together=True
            continue
        if b.startswith('### '):doc.add_paragraph(b[4:].strip(),'Heading 2');continue
        p=doc.add_paragraph();inline(p,b);body_paras+=1
    assert used_figs==[1,2,3],used_figs
    assert used_scenes==[1,2],used_scenes
    doc.add_paragraph('参考文献' if zh else 'References','Heading 1')
    for e in order:
        p=doc.add_paragraph();p.paragraph_format.line_spacing=Pt(12.5);p.paragraph_format.space_after=Pt(6)
        p.paragraph_format.keep_together=True;p.paragraph_format.left_indent=Inches(.25);p.paragraph_format.first_line_indent=Inches(-.25)
        inline(p,str(nums[e])+'. '+ref(e,lang)+' ',True)
        s=S[e];url=('https://doi.org/'+s['doi']) if s.get('doi') else s.get('url')
        if url and str(url).startswith('http'):href(p,str(url),str(url))
    doc.core_properties.title=title;doc.core_properties.subject='Perspective';doc.core_properties.author=META['author']
    doc.core_properties.keywords='generative AI; knowledge transfer; organizational learning; teamwork; reuse'
    doc.save(OUT/f'paper1_{lang}.docx')
    readable=md
    readable=readable.replace('# '+title,'# '+title+'\n\n'+META['author']+'\n\n'+META['affiliation'],1)
    for scene in META['scenes']:
        n=scene['id'];readable=readable.replace(f'[SCENE{n}]',f'![{scene[lang+"_title"]}](../illustrations/{scene["file"]})\n\n'+scene[lang+'_caption'])
    for num in [1,2,3]:
        readable=readable.replace(f'[FIGURE{num}]',f'![Figure {num}](../figures/figure{num}_{lang}.png)')
        readable=re.sub(r'\[?CAPTION'+str(num)+r'\]?\s*[:：]?\s*','',readable)
    readable=CITE.sub(lambda m:'['+', '.join(str(nums[x]) for x in re.findall(r'[A-Z]\d{2}',m[1]))+']',readable)
    readable+='\n\n## '+('参考文献' if zh else 'References')+'\n\n'+'\n\n'.join(f"{nums[e]}. {ref(e,lang)} "+(('https://doi.org/'+S[e]['doi']) if S[e].get('doi') else (S[e].get('url') or '')) for e in order)+'\n'
    (OUT/f'paper1_{lang}.md').write_text(readable,encoding='utf-8')
    return {'lang':lang,'title':title,'figures':3,'scenarios':2,'author':META['author'],'affiliation':META['affiliation'],'references':len(order),'paragraphs':body_paras,'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest()}

results=[b for lang in ['zh','en'] if (b:=build(lang))]
(ROOT/'build_manifest.json').write_text(json.dumps({'references':nums,'builds':results,'human_verification':'pending','submission_ready':False},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(results,ensure_ascii=False,indent=2))
