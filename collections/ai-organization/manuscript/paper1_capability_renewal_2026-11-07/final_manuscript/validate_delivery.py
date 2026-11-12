from pathlib import Path
from zipfile import ZipFile
import json,re,hashlib
from pypdf import PdfReader
from docx import Document
from lxml import etree

R=Path(__file__).resolve().parent
en=(R/'manuscript_en.md').read_text(encoding='utf-8')
zh=(R/'manuscript_zh.md').read_text(encoding='utf-8')
pat=r'\[E\d{2}(?:\s*,\s*E\d{2})*\]'
assert re.findall(pat,en)==re.findall(pat,zh),'Bilingual citation sequences differ'
bm=json.loads((R/'build_manifest.json').read_text(encoding='utf-8'))
refs=bm['reference_mapping']; files=[]
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
for lang,md in [('en',en),('zh',zh)]:
    stem=R/'deliverables'/f'paper1_{lang}'
    for ext in ['.docx','.pdf','.md']:
        p=stem.with_suffix(ext);assert p.exists() and p.stat().st_size>1000
        files.append({'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
    doc=Document(stem.with_suffix('.docx'))
    assert len(doc.inline_shapes)==2
    assert len(doc.tables)==1 and len(doc.tables[0].rows)==7
    alltext='\n'.join(p.text for p in doc.paragraphs)+'\n'+'\n'.join(c.text for row in doc.tables[0].rows for c in row.cells)
    assert not re.search(r'\bE\d{2}\b',alltext),'Internal EID leaked'
    assert 'TODO' not in alltext and '[citation needed]' not in alltext
    with ZipFile(stem.with_suffix('.docx')) as z:
        styles=etree.fromstring(z.read('word/styles.xml'))
        assert not styles.findall('.//w:pBdr',ns),'Paragraph border remains'
        rels=z.read('word/_rels/document.xml.rels').decode()
        assert rels.count('relationships/hyperlink')==len(refs)
    pdf=PdfReader(stem.with_suffix('.pdf'))
    text='\n'.join(p.extract_text() or '' for p in pdf.pages)
    assert not re.search(r'\bE\d{2}\b',text)
    assert len(pdf.pages)>=8
    assert all(len(p.extract_text() or '')>30 for p in pdf.pages),'Empty PDF page'
    for number in refs.values():
        assert re.search(r'\b'+str(number)+r'\.\s',text),'Reference number missing '+str(number)
    rendered=list((R/'qa'/lang).glob('page-*.png'))
    # An earlier render may have left a higher page number; compare expected pages only.
    assert all((R/'qa'/lang/f'page-{i}.png').exists() for i in range(1,len(pdf.pages)+1))

report={
 'date':'2026-11-07','bilingual_citation_sequence_equal':True,
 'citation_groups':len(re.findall(pat,en)),
 'references_in_manuscript':len(refs),
 'figure_count_each':2,'evidence_table_rows_each':6,
 'docx_pdf_content_and_reference_checks':'passed',
 'renderer':'Microsoft Word native PDF export; Poppler page rasterization',
 'visual_review':'pending final page inspection',
 'human_source_verification':'pending','submission_ready':False,
 'files':files
}
(R/'qa_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='files'},ensure_ascii=False,indent=2))
