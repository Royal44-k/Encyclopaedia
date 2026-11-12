"""Local, deterministic manuscript packaging. No network calls or participant data."""
from pathlib import Path
import csv, hashlib, json, re, textwrap
from xml.sax.saxutils import escape
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT

ROOT = Path(__file__).resolve().parent
DATE = '2026-11-06'

def write_json(name, obj):
    (ROOT / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

refs = json.loads((ROOT/'references.json').read_text(encoding='utf-8'))
extra = [
 {'id':'E024','authors':'Ivic, R. K., Ratzan, S. C. & Parker, R. M.',
  'title':'Building health-literate artificial intelligence','journal':'Nature Human Behaviour',
  'volume':'','pages':'Advance online publication','year':2026,'doi':'10.1038/s41562-026-02595-1',
  'url':'https://pubmed.ncbi.nlm.nih.gov/42745006/', 'kind':'journal_article',
  'read_depth':'R1 primary abstract and indexed bibliographic record',
  'locator':'Abstract, four components; PubMed PMID 42745006',
  'caveat':'Full text could not be opened through publisher access. Cite only the stated framework; a detailed novelty comparison remains necessary.'},
 {'id':'E025','authors':'EuroQol Research Foundation',
  'title':'What is the difference between the EQ-5D descriptive system, the EQ VAS and the EQ-5D index values?',
  'journal':'EuroQol','volume':'','pages':'','year':2023,'doi':'',
  'url':'https://euroqol.org/faq/what-is-the-difference-between-the-eq-5d-5l-descriptive-system-the-eq-vas-and-the-eq-5d-index-values/',
  'kind':'webpage','read_depth':'R2 official instrument explanation',
  'locator':'Description, index value sets and EQ VAS distinction; posted 29 June 2023',
  'caveat':'No new value set, licensing permission or mapping from sleep loss to QALYs is established here.'}
]
for r in extra:
    if r['id'] not in {x['id'] for x in refs}: refs.append(r)
for r in refs:
    if r['id']=='E005': r['volume']='11 (Suppl. 1)'
    if r['id']=='E021': r['volume']='13 (Suppl. 2)'
write_json('references.json',refs)
by_id = {r['id']:r for r in refs}
src = (ROOT/'manuscript_en.source.md').read_text(encoding='utf-8')
order = list(dict.fromkeys(re.findall(r'\[@(E\d+)\]',src)))
assert set(order)==set(by_id), (set(order)-set(by_id),set(by_id)-set(order))
number={e:i+1 for i,e in enumerate(order)}

def cite(text):
    def repl(m):
        ids=re.findall(r'E\d+',m.group())
        return '['+', '.join(str(n) for n in sorted({number[e] for e in ids}))+']'
    return re.sub(r'(?:\[@E\d+\])+',repl,text)

def reference(r):
    venue=r['journal']
    if r['volume']: venue+=' '+r['volume']
    if r['pages']: venue+=', '+r['pages']
    year=str(r['year']) if r['year'] else 'n.d.'
    link='https://doi.org/'+r['doi'] if r['doi'] else r['url']
    access='' if r['doi'] else ' Accessed 6 November 2026.'
    authors=r['authors'] if r['authors'].endswith('.') else r['authors']+'.'
    title=r['title'] if r['title'].endswith(('.', '?', '!')) else r['title']+'.'
    return f"{authors} {title} {venue} ({year}). {link}.{access}"

clean=cite(src)
refs_text='\n\n## References\n\n'+'\n\n'.join(f'{number[e]}. {reference(by_id[e])}' for e in order)+'\n'
(ROOT/'manuscript_en.md').write_text(clean+refs_text,encoding='utf-8')
with (ROOT/'reference_mapping.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.DictWriter(f,fieldnames=['reference_number','evidence_id','doi','title','read_depth','locator','caveat']);w.writeheader()
    for e in order:
        r=by_id[e];w.writerow({'reference_number':number[e],'evidence_id':e,**{k:r[k] for k in ['doi','title','read_depth','locator','caveat']}})

# The schematic is original and does not imply a fitted causal model.
W,H=1950,1800
im=Image.new('RGB',(W,H),'white');d=ImageDraw.Draw(im)
fontroot=Path('C:/Windows/Fonts')
def font(sz,bold=False): return ImageFont.truetype(str(fontroot/('arialbd.ttf' if bold else 'arial.ttf')),sz)
svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">', '<rect width="100%" height="100%" fill="white"/>']
def txt(x,y,t,size=38,bold=False):
    d.text((x,y),t,fill='#111111',font=font(size,bold))
    svg.append(f'<text x="{x}" y="{y+size}" font-family="Arial,sans-serif" font-size="{size}" font-weight="{700 if bold else 400}">{escape(t)}</text>')
def box(x,y,w,h,title,lines,shade='#f2f4f5'):
    d.rectangle((x,y,x+w,y+h),fill=shade,outline='#59636b',width=3)
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{shade}" stroke="#59636b" stroke-width="3"/>')
    txt(x+30,y+24,title,39,True)
    for j,line in enumerate(lines):txt(x+30,y+85+j*49,line,34)
def arrow(y1,y2):
    x=W//2;d.line((x,y1,x,y2),fill='#333333',width=5);d.polygon([(x,y2),(x-15,y2-24),(x+15,y2-24)],fill='#333333')
    svg.append(f'<path d="M {x} {y1} L {x} {y2} M {x-15} {y2-24} L {x} {y2} L {x+15} {y2-24}" fill="none" stroke="#333333" stroke-width="5"/>')
box(90,30,1770,220,'1  Define the comparison',[
    'Feasible alternatives • Common calendar horizon • Individual or societal perspective',
    'Ability to refuse • Baseline circumstances • Relevant people affected'])
arrow(250,305)
box(90,315,855,240,'2a  Resources and time',[
    'Incremental money and total work', 'Checking, rework and added tasks','Activities displaced or enabled'])
box(1005,315,855,240,'2b  Health and functioning',[
    'Decision-relevant symptoms and function','Observed follow-up and recovery','Clinical outcomes where appropriate'])
box(90,585,855,240,'2c  Experience',[
    'Enjoyment, relief and distress','During and after the activity','Immediate and persistent effects'])
box(1005,585,855,240,'2d  Capabilities and agency',[
    'Assisted and unaided performance','Valued goals and perceived volition','Actual discretion and constraints'])
box(90,855,1770,180,'Evidence accompanies every predicted consequence',[
    'Population • Comparator • Outcome • Horizon • Uncertainty • Unknowns'],shade='#ffffff')
arrow(1035,1090)
box(90,1100,1770,230,'3  Appraise with the person',[
    'Explain the trade-off using stated goals and constraints',
    'Permit unresolved ordering; aggregate only with defensible preference assumptions'])
arrow(1330,1385)
box(90,1395,1770,230,'4  Test the added decision support',[
    'Compare with established support using the same factual information',
    'Assess understanding, transfer and burden; a chosen lifestyle is not the criterion'])
txt(90,1680,'Proposed assessment sequence • No participant data • Arrows are procedural',32)
svg.append('</svg>')
im.save(ROOT/'figure1_workflow.png',dpi=(300,300))
(ROOT/'figure1_workflow.svg').write_text('\n'.join(svg),encoding='utf-8')

# Word layout: portable review manuscript, not a publisher's production design.
doc=Document();sec=doc.sections[0]
for el in list(doc.styles.element.iter(qn('w:pBdr'))):
    el.getparent().remove(el)
sec.page_width=Inches(8.5);sec.page_height=Inches(11)
sec.top_margin=sec.bottom_margin=Inches(0.85)
sec.left_margin=sec.right_margin=Inches(1)
sec.header_distance=sec.footer_distance=Inches(.35)
normal=doc.styles['Normal'];normal.font.name='Times New Roman';normal.font.size=Pt(12)
normal.paragraph_format.line_spacing=1.5
normal.paragraph_format.space_after=Pt(6)
normal.paragraph_format.widow_control=True
for n,sz in [('Title',20),('Heading 1',14),('Heading 2',12)]:
    st=doc.styles[n];st.font.name='Times New Roman';st.font.size=Pt(sz);st.font.color.rgb=RGBColor(0,0,0)
    st.font.bold=True;st.paragraph_format.space_before=Pt(12);st.paragraph_format.space_after=Pt(6)
    st.paragraph_format.keep_with_next=True
header=sec.header.paragraphs[0]
header.text='Health economic value in the AI era | Author review draft'
header.runs[0].font.size=Pt(9);header.paragraph_format.line_spacing=1
foot=sec.footer.paragraphs[0];foot.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=foot.add_run();field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');r._r.addnext(field)
ln=OxmlElement('w:lnNumType');ln.set(qn('w:countBy'),'5');ln.set(qn('w:restart'),'continuous');ln.set(qn('w:distance'),'180');sec._sectPr.append(ln)
doc.core_properties.title=src.splitlines()[0][2:]
doc.core_properties.author='Richard T. Millian'
doc.core_properties.subject='Conceptual Perspective for author review'
doc.core_properties.keywords='health economics, artificial intelligence, time allocation, decision support'

def inline(p,s):
    for i,t in enumerate(re.split(r'(\*\*.*?\*\*)',s)):
        if not t:continue
        r=p.add_run(t[2:-2] if t.startswith('**') else t)
        if t.startswith('**'):r.bold=True
    return p

def addtable(lines):
    rows=[[x.strip() for x in l.strip('|').split('|')] for l in lines if not re.match(r'^\|[-: |]+\|$',l)]
    table=doc.add_table(rows=1,cols=3);table.alignment=WD_TABLE_ALIGNMENT.CENTER;table.autofit=False
    widths=[1.72,2.32,2.46]
    for col,w in zip(table.columns,widths):col.width=Inches(w)
    for i,row in enumerate(rows):
        cells=table.rows[0].cells if i==0 else table.add_row().cells
        trPr=cells[0]._tc.getparent().get_or_add_trPr()
        no=OxmlElement('w:cantSplit');trPr.append(no)
        if i==0:
            rep=OxmlElement('w:tblHeader');trPr.append(rep)
        for j,(cell,t) in enumerate(zip(cells,row)):
            cell.width=Inches(widths[j]);cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.TOP
            p=cell.paragraphs[0];inline(p,t)
            p.paragraph_format.line_spacing=1.06;p.paragraph_format.space_after=Pt(2);p.paragraph_format.space_before=Pt(2)
            for r in p.runs:r.font.size=Pt(10.5);r.bold=(i==0) or r.bold
            pr=cell._tc.get_or_add_tcPr();mar=OxmlElement('w:tcMar')
            for side in ['top','left','bottom','right']:
                el=OxmlElement('w:'+side);el.set(qn('w:w'),'85');el.set(qn('w:type'),'dxa');mar.append(el)
            pr.append(mar)
            if i==0:
                sh=OxmlElement('w:shd');sh.set(qn('w:fill'),'EDEDED');pr.append(sh)
    borders=OxmlElement('w:tblBorders')
    for side in ['top','left','bottom','right','insideH','insideV']:
        e=OxmlElement('w:'+side);e.set(qn('w:val'),'single');e.set(qn('w:sz'),'4');e.set(qn('w:color'),'B0B0B0');borders.append(e)
    table._tbl.tblPr.append(borders)

lines=clean.splitlines();i=0
while i<len(lines):
    line=lines[i].strip();i+=1
    if not line:continue
    if line.startswith('|'):
        group=[line]
        while i<len(lines) and lines[i].startswith('|'):group.append(lines[i]);i+=1
        addtable(group);continue
    if line.startswith('# '):doc.add_paragraph(line[2:],'Title');continue
    if line.startswith('## '):
        name=line[3:]
        heading=doc.add_paragraph(name,'Heading 1')
        if name in ['Abstract','Figure 1','Table 1','Table 2']:heading.paragraph_format.page_break_before=True
        if name=='Figure 1':
            doc.add_picture(str(ROOT/'figure1_workflow.png'),width=Inches(6.5))
            doc.paragraphs[-1].paragraph_format.space_after=Pt(8)
        continue
    if line.startswith('### '):doc.add_paragraph(line[4:],'Heading 2');continue
    if line.startswith('ΔW ='):
        p=doc.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.CENTER
        math=OxmlElement('m:oMath');run=OxmlElement('m:r');t=OxmlElement('m:t');t.text='ΔW = −S + A + B';run.append(t);math.append(run);p._p.append(math)
        p.add_run('     (1)');continue
    p=doc.add_paragraph();inline(p,line)
    if line.startswith('Perspective |'):p.runs[0].font.size=Pt(11)
    if line.startswith('Proposed corresponding author:'):
        p.paragraph_format.line_spacing=1.15
        note=doc.add_paragraph('Conceptual framework and research agenda. No original participant data or empirical validation of the proposed framework are reported. Scientific content and declarations require author review.')
        note.paragraph_format.space_before=Pt(30);note.paragraph_format.line_spacing=1.15
        for r in note.runs:r.font.size=Pt(11)
ref_heading=doc.add_paragraph('References','Heading 1');ref_heading.paragraph_format.page_break_before=True
for e in order:
    p=doc.add_paragraph(f'{number[e]}. {reference(by_id[e])}')
    p.paragraph_format.line_spacing=1.05;p.paragraph_format.space_after=Pt(7)
    p.paragraph_format.left_indent=Inches(.27);p.paragraph_format.first_line_indent=Inches(-.27)
    for r in p.runs:r.font.size=Pt(10.5)
doc.save(ROOT/'Health_value_AI_Perspective.docx')

# Source manifest explicitly keeps human verification pending.
sources=[]
kind_map={'instrument':'guideline','guidance':'guideline','book_chapter':'chapter','classic':'journal_article'}
allowed={'journal_article','book','chapter','conference_paper','dataset','software','preprint','report','policy','guideline','registry','webpage','other'}
for r in refs:
    kind=kind_map.get(r['kind'],r['kind']);kind=kind if kind in allowed else 'webpage'
    sources.append({'evidence_id':r['id'],'title':r['title'],'authors':[r['authors']], 'year':r['year'],
       'source_type':kind,'confidentiality':'public','identifiers':{'doi':r['doi'],'isbn':'','pmcid':'','pmid':'','url':r['url']},
       'locator':r['locator'],'verification':{'source_opened':True,'status':'unverified','verified_by':'','verified_on':''}})
# E900/E901 are provenance for proposals and declarations, not empirical evidence or references.
for eid,title,loc,conf in [('E900','Author-proposed framework and hypothetical illustrations','manuscript_en.source.md; build_manuscript.py','restricted'),('E901','User-provided authorship and sponsorship information','Conversation replies on 6 November 2026; authorship_record.json','restricted')]:
    sources.append({'evidence_id':eid,'title':title,'authors':[],'year':2026,'source_type':'other',
        'confidentiality':conf,'identifiers':{'doi':'','isbn':'','pmcid':'','pmid':'','url':''},'locator':loc,
        'verification':{'source_opened':True,'status':'unverified','verified_by':'','verified_on':''}})
write_json('source_manifest.json',{'schema_version':'1.0','sources':sources})

# Sentence-level audit copy. Adjacent sentence citations remain context; final human mapping is pending.
section='Title page';claims=[];aud=[];idx=0
for line in src.splitlines():
    if line.startswith('#'):
        section=line.lstrip('# ').strip();aud.append(line);continue
    if not line.strip() or line.startswith('|---'):aud.append(line);continue
    if line.startswith('Perspective |'):aud.append('### '+line);continue
    if line.startswith('Keywords:'):aud.append(line);continue
    context_ids=list(dict.fromkeys(re.findall(r'\[@(E\d+)\]',line)))
    # A table row is a compound result record (design, estimate and boundary) retained as one unit.
    units=[line] if line.startswith('|') else re.split(r'(?<=[.!?])\s+(?=[A-Z])',line)
    for unit in units:
        if not unit.strip():continue
        idx+=1;cid=f'C{idx:03d}'
        ids=list(dict.fromkeys(re.findall(r'\[@(E\d+)\]',unit))) or context_ids
        declaration=section in ['Funding','Competing interests','Author contributions and acknowledgements'] or section==src.splitlines()[0][2:]
        if declaration:ids=ids or ['E901'];kind='declaration'
        elif ids:kind='numeric' if re.search(r'\d',re.sub(r'\[@E\d+\]','',unit)) else 'factual'
        else:ids=['E900'];kind='interpretive'
        normalized=' '.join(re.sub(r'\[@E\d+\]','',unit).split())
        claims.append({'claim_id':cid,'section':section,'claim_kind':kind,'claim_text_sha256':hashlib.sha256(normalized.encode()).hexdigest(),
            'evidence_ids':';'.join(ids),'verification_status':'unverified','uncertainty':'not_estimated','analysis_intent':'not_applicable'})
        aud.append(unit+f' [claim:{cid}] [evidence:{",".join(ids)}]')
    aud.append('')
(ROOT/'manuscript_en.audit.md').write_text('\n'.join(aud)+'\n',encoding='utf-8')
with (ROOT/'claims.csv').open('w',encoding='utf-8',newline='') as f:
    w=csv.DictWriter(f,fieldnames=list(claims[0]));w.writeheader();w.writerows(claims)
write_json('authorship_record.json',{
 'status':'user_declared_draft','author':{'name':'Richard T. Millian','affiliation':'Hangzhou Normal University','email':None,'final_approval':False,'credit_statement':None},
 'administrative_contact':{'name':'Mason Matthew','role':'assistant, not a coauthor','email':'e1237966@outlook.com','acknowledgement_permission':None},
 'funding':{'name_as_supplied':'Altman','type':'individual','full_identity':None,'role':'User states sponsor provided support only and had no participation','support_details':None},
 'competing_interests':'User declares none; funding separately disclosed',
 'external_transmission':'No manuscript submission, editor contact or external manuscript upload performed'})
write_json('manuscript_status.json',{'document_id':'health-value-ai-v1','date':DATE,'study_design':'conceptual_perspective','draft_status':'author_review_draft',
 'submission_ready':False,'human_source_verification_complete':False,'reporting_guideline':'Narrative conceptual Perspective; no claim of PRISMA, CONSORT or CHEERS compliance',
 'data':'No original participant data; numerical findings belong to cited studies; scenarios are hypothetical',
 'missing':['author correspondence email','full sponsor identity and support details','author contribution statement and final approval','human source and claim sign-off','final journal-specific formatting']})

abstract=src.split('## Abstract\n\n')[1].split('\n\nKeywords:')[0]
body=src.split('## From market rewards to personal welfare')[1].split('## Data and code availability')[0]
def wc(t):return len(re.findall(r"\b[\w]+(?:[’'-][\w]+)*\b",re.sub(r'\[@E\d+\]','',t)))
metrics={'abstract_words':wc(abstract),'main_text_words_including_headings':wc(body),'references':len(refs),'main_tables':2,'main_figures':1,'audit_units':len(claims),
 'word_count_method':'Regex words; main excludes abstract, declarations, displays and references. Journal/Word counters may differ.'}
write_json('build_metrics.json',metrics)
print(json.dumps(metrics))
