"""Create editable bilingual author-review manuscripts from the aligned Markdown."""
from pathlib import Path
import json,re,hashlib
from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT,WD_CELL_VERTICAL_ALIGNMENT

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'deliverables'; OUT.mkdir(exist_ok=True)
sources=json.loads((ROOT.parent/'source_manifest.json').read_text(encoding='utf-8'))
extra=ROOT/'additional_sources.json'
if extra.exists():
    d=json.loads(extra.read_text(encoding='utf-8')); sources+=d if isinstance(d,list) else d.get('sources',[])
S={s['id']:s for s in sources}
en=(ROOT/'manuscript_en.md').read_text(encoding='utf-8')
order=list(dict.fromkeys(re.findall(r'E\d{2}',en.split('## References')[0])))
nums={s:i+1 for i,s in enumerate(order)}
assert all(s in S for s in order),set(order)-set(S)
CITE=re.compile(r'\[(E\d{2}(?:\s*,\s*E\d{2})*)\]')

def plain(t):
    return t.replace('**','').replace('–','-').replace('—','-').replace('\u2011','-')

def numbered(t):
    return CITE.sub(lambda m:'['+', '.join(str(nums[x]) for x in re.findall(r'E\d{2}',m[1]))+']',t)

def font(style,name,size,east=None):
    style.font.name=name; style.font.size=Pt(size); style.font.color.rgb=RGBColor(0,0,0)
    rf=style.element.get_or_add_rPr().get_or_add_rFonts()
    rf.set(qn('w:eastAsia'),east or name)
    for a in ['ascii','hAnsi','cs']:rf.set(qn('w:'+a),name)

def inline(p,t):
    t=plain(t); pos=0
    for m in CITE.finditer(t):
        p.add_run(t[pos:m.start()].rstrip())
        run=p.add_run('\u2060'+',\u2060'.join(str(nums[x]) for x in re.findall(r'E\d{2}',m[1])))
        run.font.superscript=True; run.font.size=Pt(8)
        pos=m.end()
    p.add_run(t[pos:])

def href(p,label,url):
    h=OxmlElement('w:hyperlink'); h.set(qn('r:id'),p.part.relate_to(url,'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',is_external=True))
    r=OxmlElement('w:r'); pr=OxmlElement('w:rPr'); c=OxmlElement('w:color');c.set(qn('w:val'),'255B72');pr.append(c)
    sz=OxmlElement('w:sz');sz.set(qn('w:val'),'19');pr.append(sz)
    rf=OxmlElement('w:rFonts');rf.set(qn('w:ascii'),'Times New Roman');rf.set(qn('w:hAnsi'),'Times New Roman');pr.append(rf);r.append(pr)
    txt=OxmlElement('w:t');txt.text=label;r.append(txt);h.append(r);p._p.append(h)

VENUES={
 'E01':'Automatica 19, 775-779','E02':'Perspectives on Psychological Science 10, 176-199',
 'E03':'Journal of Workplace Learning 13, 209-214','E04':'Administrative Science Quarterly 64, 87-123',
 'E05':'Proceedings of the National Academy of Sciences','E06':'Scientific Reports',
 'E07':'arXiv preprint arXiv:2601.20245, version 2','E08':'The Quarterly Journal of Economics 140, 889-942',
 'E09':'EdWorkingPaper, revised November 2025','E10':'Nature Communications',
 'E11':'Strategic Organization 24','E12':'Human Resource Management Journal 36, 430-440',
 'E13':'arXiv preprint arXiv:2608.11512','E14':'arXiv preprint arXiv:2610.33102',
 'E15':'Journal of Applied Psychology 88, 587-604','E16':'Nature Human Behaviour',
 'E17':'Trends in Cognitive Sciences 20, 676-688','E18':'AI & Society 41, 237-250',
 'E19':'Journal of Organization Design 10, 75-80','E20':'Applied Sciences 16, 10970',
 'E21':'Journal of Applied Psychology 87, 3-13'}

def auth(names):
    out=[]
    for n in names:
        t=n.split(); out.append(t[-1]+', '+''.join(x[0]+'.' for x in t[:-1]))
    return '; '.join(out)

def reference(e):
    s=S[e]; a=auth(s.get('authors') or [])
    venue=VENUES.get(e,s.get('venue',''))
    return f"{a} {s['title']}. {venue} ({s['year']})."

def field(p,instr):
    f=OxmlElement('w:fldSimple');f.set(qn('w:instr'),instr);p._p.append(f)

def cell_border(tc):
    pr=tc.get_or_add_tcPr();b=OxmlElement('w:tcBorders')
    for side in ['top','left','bottom','right','insideH','insideV']:
        v=OxmlElement('w:'+side);v.set(qn('w:val'),'single');v.set(qn('w:sz'),'4');v.set(qn('w:color'),'D9D9D9');b.append(v)
    pr.append(b)
    mar=OxmlElement('w:tcMar')
    for side in ['top','left','bottom','right']:
        v=OxmlElement('w:'+side);v.set(qn('w:w'),'100');v.set(qn('w:type'),'dxa');mar.append(v)
    pr.append(mar)

def parse(md,zh):
    blocks=re.split(r'\n\s*\n',md.strip()); body=[]; captions=[]; table=[]; mode='front'
    for b in blocks:
        if b.startswith('# '): continue
        if b.startswith('## '):
            h=b[3:].strip()
            if h in ['References','参考文献','Draft status','稿件状态','草稿状态']:mode='skip';continue
            if h in ['Figure legends','图注','图例']:mode='figures';continue
            if h.startswith('Table 1') or h.startswith('表1') or h.startswith('表 1'):mode='table';continue
            mode='body';body.append(('h',h));continue
        if mode=='body':body.append(('p',b))
        elif mode=='figures':captions.append(b)
        elif mode=='table' and b.startswith('|'):
            for line in b.splitlines():
                if re.match(r'^\|[\s:|-]+\|$',line):continue
                table.append([x.strip() for x in line.strip().strip('|').split('|')])
    return body,captions,table

def build(lang):
    zh=lang=='zh'; path=ROOT/f'manuscript_{lang}.md'
    if not path.exists(): return
    md=path.read_text(encoding='utf-8');body,caps,rows=parse(md,zh)
    assert body and len(caps)==2 and len(rows)==7,(lang,len(body),len(caps),len(rows))
    doc=Document();sec=doc.sections[0]
    sec.page_width=Inches(8.5);sec.page_height=Inches(11)
    sec.top_margin=Inches(.78);sec.bottom_margin=Inches(.75);sec.left_margin=sec.right_margin=Inches(.83)
    sec.header_distance=sec.footer_distance=Inches(.32)
    normal=doc.styles['Normal'];font(normal,'Times New Roman',11.5,'SimSun' if zh else None)
    normal.paragraph_format.line_spacing=Pt(18 if zh else 14.5)
    normal.paragraph_format.space_after=Pt(6)
    normal.paragraph_format.widow_control=True
    for st,sz in [('Title',22),('Subtitle',11),('Heading 1',13),('Heading 2',11.5)]:
        font(doc.styles[st],'Arial',sz,'SimHei' if zh else None)
        doc.styles[st].paragraph_format.keep_with_next=True
        doc.styles[st].paragraph_format.space_before=Pt(13 if st.startswith('Heading') else 0)
        doc.styles[st].paragraph_format.space_after=Pt(7)
    for st in ['Caption','Header','Footer']:
        font(doc.styles[st],'Arial',9,'Microsoft YaHei' if zh else None)
    doc.styles['Caption'].font.bold=False
    doc.styles['Caption'].font.italic=False
    for st in doc.styles:
        for border in list(st.element.iter(qn('w:pBdr'))):
            border.getparent().remove(border)
    hp=sec.header.paragraphs[0];hp.text='AI团队的专长接续' if zh else 'Expertise renewal in human AI teams'
    hp.style='Header'
    fp=sec.footer.paragraphs[0];fp.alignment=WD_ALIGN_PARAGRAPH.CENTER
    fp.add_run('作者审阅稿  ·  ' if zh else 'Author-review draft  ·  ');field(fp,'PAGE')
    title='生成式AI团队中的任务分配与专长接续' if zh else 'Task routing and expertise renewal in human AI teams'
    doc.add_paragraph(title,'Title')
    sub=doc.add_paragraph('谁有机会学会纠错' if zh else 'Who learns to recover','Subtitle')
    doc.add_paragraph('前瞻性观点论文  ·  作者审阅版  ·  2026年11月7日' if zh else 'Perspective  ·  Author-review version  ·  7 November 2026','Subtitle')
    for typ,t in body:
        if typ=='h':doc.add_paragraph(plain(t),'Heading 1')
        else:
            p=doc.add_paragraph();inline(p,t)
    if not zh: doc.add_page_break()
    doc.add_paragraph('表1 证据边界与检验方向' if zh else 'Table 1 Evidence boundaries and proposed tests','Heading 1')
    tb=doc.add_table(rows=1,cols=4);tb.alignment=WD_TABLE_ALIGNMENT.CENTER;tb.autofit=False
    widths=[1.28,1.70,1.85,1.93]
    for c,w in zip(tb.columns,widths):c.width=Inches(w)
    for ri,vals in enumerate(rows):
        cells=tb.rows[0].cells if ri==0 else tb.add_row().cells
        trpr=tb.rows[ri]._tr.get_or_add_trPr()
        nosplit=OxmlElement('w:cantSplit');trpr.append(nosplit)
        if ri==0:repeat=OxmlElement('w:tblHeader');trpr.append(repeat)
        for ci,(c,t) in enumerate(zip(cells,vals)):
            c.width=Inches(widths[ci]);c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER;cell_border(c._tc)
            pr=c._tc.get_or_add_tcPr();sh=OxmlElement('w:shd');sh.set(qn('w:fill'),'E7EEF4' if ri==0 else ('F7F9FB' if ri%2==0 else 'FFFFFF'));pr.append(sh)
            p=c.paragraphs[0];p.paragraph_format.space_after=Pt(1);p.paragraph_format.line_spacing=Pt(14 if zh else 12)
            inline(p,t)
            for run in p.runs:run.font.size=Pt(9.5);run.bold=ri==0
    for i,cap in enumerate(caps,1):
        doc.add_page_break()
        doc.add_paragraph(f'图{i}' if zh else f'Figure {i}','Heading 1')
        p=doc.add_paragraph();p.paragraph_format.space_after=Pt(9);p.paragraph_format.line_spacing=1.0
        shape=p.add_run().add_picture(str(ROOT/'figures'/f'figure{i}_{lang}.png'),width=Inches(6.72))
        shape._inline.docPr.set('descr', ('概念流程图，所有箭头均为假说' if i==1 else '非实证的逻辑矩阵示例，相同总量对应不同人员缺席后的覆盖') if zh else ('Conceptual process diagram; all arrows are hypotheses' if i==1 else 'Logical example, not empirical data: equal totals with different coverage after a specified absence'))
        cp=doc.add_paragraph(style='Caption');inline(cp,cap)
        cp.paragraph_format.line_spacing=Pt(13 if zh else 12)
        cp.paragraph_format.keep_together=True
    doc.add_page_break();doc.add_paragraph('参考文献' if zh else 'References','Heading 1')
    for e in order:
        p=doc.add_paragraph();p.paragraph_format.space_after=Pt(4);p.paragraph_format.line_spacing=Pt(12)
        p.paragraph_format.left_indent=Inches(.23);p.paragraph_format.first_line_indent=Inches(-.23)
        p.paragraph_format.keep_together=True
        run=p.add_run(str(nums[e])+'. '+reference(e)+' ');run.font.size=Pt(9.5)
        url='https://doi.org/'+S[e]['doi'] if S[e].get('doi') else S[e]['url']
        href(p,url,url)
    doc.add_paragraph('稿件透明度说明' if zh else 'Manuscript transparency','Heading 1')
    note=('本文为基于公开文献的前瞻性论证与检验议程，不报告新实证数据。OpenAI Codex辅助文献发现与原文定位、证据整理、论证和拟议检验的形成与修订，以及起草、翻译、语言编辑、图表和排版。图2为明确标示的逻辑示例。署名作者尚须核验来源与最终论点，并核定作者信息及投稿声明。' if zh else 'This Perspective develops an argument and testing agenda from public literature and reports no new empirical data. OpenAI Codex assisted literature discovery and source-location checking, evidence organization, conceptual development and proposed tests, drafting, translation, editing, diagrams and document production. Figure 2 is an explicitly labelled logical example. Accountable authors must verify the sources and final claims and confirm authorship and submission declarations.')
    p=doc.add_paragraph(note);p.paragraph_format.line_spacing=Pt(12);p.paragraph_format.space_after=Pt(0);p.paragraph_format.keep_together=True
    for run in p.runs:run.font.size=Pt(9.5)
    doc.core_properties.title=title;doc.core_properties.subject='Perspective author-review manuscript';doc.core_properties.author='';doc.core_properties.keywords='generative AI; expertise renewal; task routing; learning; teams'
    target=OUT/f'paper1_{lang}.docx';doc.save(target)
    final=numbered(md)
    final=re.sub(r'## (References|参考文献)\n.*?(?=\n## |\Z)',lambda m:'## '+m[1]+'\n\n'+'\n\n'.join(str(nums[e])+'. '+reference(e)+' https://doi.org/'+S[e]['doi'] for e in order)+'\n',final,flags=re.S)
    (OUT/f'paper1_{lang}.md').write_text(final,encoding='utf-8')
    return {'language':lang,'paragraphs':len(body),'references':len(order),'figures':len(caps),'table_rows':len(rows)-1,'source_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'docx':str(target)}

results=[r for lang in ['en','zh'] if (r:=build(lang))]
(ROOT/'build_manifest.json').write_text(json.dumps({'reference_mapping':nums,'builds':results,'submission_ready':False},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(results,ensure_ascii=False,indent=2))
