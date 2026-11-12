"""Audit content preservation, numeric identities and the delivered assets."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import csv, hashlib, json, re, unicodedata
from lxml import etree
from PIL import Image
from pypdf import PdfReader

root=Path(__file__).resolve().parent
def norm(t):return ''.join(c for c in unicodedata.normalize('NFKC',t) if c.isalnum()).lower()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
md=(root/'manuscript_en.md').read_text(encoding='utf-8')
body=md.split('## Abstract\n\n',1)[1].split('\n\n## Figures',1)[0]
paras=[p.strip() for p in body.split('\n\n') if p.strip() and not p.startswith('## ')]
with ZipFile(root/'Health_value_AI_Illustrated.docx') as z:
    xml=etree.fromstring(z.read('word/document.xml'))
    ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','m':'http://schemas.openxmlformats.org/officeDocument/2006/math','wp':'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'}
    text='\n'.join(''.join(p.xpath('.//w:t/text() | .//m:t/text()',namespaces=ns)) for p in xml.xpath('//w:p',namespaces=ns))
    media={hashlib.sha256(z.read(n)).hexdigest() for n in z.namelist() if n.startswith('word/media/')}
    assert len(xml.xpath('//w:tbl',namespaces=ns))==2
    assert len(xml.xpath('//m:oMath',namespaces=ns))==3
    assert len(xml.xpath('//wp:docPr[@descr]',namespaces=ns))==8
    for n in range(1,9):assert sha(root/'figures'/f'figure{n}.png') in media
missing=[p[:120] for p in paras if norm(p) not in norm(text)]
assert not missing,('DOCX paragraphs',missing)
reader=PdfReader(str(root/'Health_value_AI_Illustrated.pdf'))
assert len(reader.pages)==11
assert len(PdfReader(str(root/'qa'/'Word_render.pdf')).pages)==11
pdftext='\n'.join(p.extract_text() or '' for p in reader.pages)
pdftext=re.sub(r'PERSPECTIVE\s*Health economic value in the AI era|REFERENCES\s*Health economic value in the AI era','',pdftext)
pdftext=re.sub(r'Richard T\. Millian\s*\d+','',pdftext)
missing=[p[:120] for p in paras if norm(p) not in norm(pdftext)]
assert not missing,('PDF paragraphs',missing)
for forbidden in ['to be supplied','remains pending','Author review draft','[@E','\ufffd']:
    assert forbidden not in pdftext and forbidden not in text
data=list(csv.DictReader((root/'figure_data.csv').open(encoding='utf-8-sig')))
vals={r['quantity']:float(r['estimate']) for r in data}
for prefix in ['baseline','no_added_tasks','three_added_hours','five_added_hours']:
    assert vals[prefix+'_work']+vals[prefix+'_nonwork']==24
assert vals['option_B_supplement']-vals['option_A_supplement']==vals['extra_supplement']==90000
assert vals['option_B_overtime']-vals['option_A_overtime']==vals['extra_overtime_days']==21
for quantity,est,lo,hi in [('stroke_incidence_RR',1.35,1.13,1.61),('energy_intake_difference',508,402,614),('energy_intake_change_vs_control',-270,-393,-147),('relevant_condition_identification_OR',1.76,1.45,2.13)]:
    r=next(r for r in data if r['quantity']==quantity)
    assert (float(r['estimate']),float(r['lower']),float(r['upper']))==(est,lo,hi)

# Four actual final pages, assembled as a reader-facing visual preview.
preview=Image.new('RGB',(1640,2140),'#E7ECEF')
for j,n in enumerate([1,4,6,7]):
    im=Image.open(root/'qa'/'reading_pages'/f'page-{n:02}.png').convert('RGB')
    im.thumbnail((790,1030),Image.Resampling.LANCZOS)
    preview.paste(im,(20+(j%2)*810+(790-im.width)//2,20+(j//2)*1060))
preview.save(root/'preview.png')

report={'pdf_pages':11,'word_export_pages':11,'figures':8,'tables':2,'references':25,
        'numbered_mathematical_expressions':4,'editable_display_equations':3,
        'body_paragraphs_verified':len(paras),'numeric_records':len(data),
        'content_presence':'pass','embedded_figure_integrity':'pass','scenario_arithmetic':'pass',
        'visual_review':'All 11 reading-PDF pages and all 11 Word-export pages inspected. Final figure-4 revision inspected in both; the other ten pages were pixel-identical to the reviewed versions.',
        'scope':'Formatting and internal consistency; does not establish empirical validation of the framework.',
        'sha256':{n:sha(root/n) for n in ['Health_value_AI_Illustrated.pdf','Health_value_AI_Illustrated.docx','figure_data.csv']}}
(root/'qa'/'final_checks.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
with ZipFile(root/'Figures_and_data.zip','w',ZIP_DEFLATED) as z:
    for file in sorted((root/'figures').glob('*')):
        if file.suffix in ['.svg','.pdf','.png']:z.write(file,file.relative_to(root))
    for name in ['figure_data.csv','references.json','README.md','style_references.md']:z.write(root/name,name)
print(json.dumps(report,ensure_ascii=False))
