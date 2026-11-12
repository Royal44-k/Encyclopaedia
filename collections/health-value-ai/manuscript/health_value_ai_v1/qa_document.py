from pathlib import Path
import json, re
from zipfile import ZipFile
from collections import Counter
import pypdfium2 as pdfium
from pypdf import PdfReader
from PIL import Image, ImageDraw, ImageFont

root=Path(__file__).resolve().parent
qa=root/'qa';qa.mkdir(exist_ok=True)
pdf=root/'Health_value_AI_Perspective.pdf'
reader=PdfReader(str(pdf));render=pdfium.PdfDocument(str(pdf))
pages=[]
for i in range(len(render)):
    im=render[i].render(scale=1.6).to_pil().convert('RGB')
    im.save(qa/f'page-{i+1:02d}.png')
    text=reader.pages[i].extract_text() or ''
    (qa/f'page-{i+1:02d}.txt').write_text(text,encoding='utf-8')
    pages.append({'page':i+1,'characters':len(text),'last_lines':text.splitlines()[-5:]})
alltext='\n'.join(p.extract_text() or '' for p in reader.pages)
(qa/'pdf_text.txt').write_text(alltext,encoding='utf-8')
with ZipFile(root/'Health_value_AI_Perspective.docx') as z:
    xml=z.read('word/document.xml').decode()
    assert '[@E' not in xml and '[claim:' not in xml
    assert '<m:oMath>' in xml
    assert 'Mason Matthew' in xml and 'Richard T. Millian' in xml
refs=json.loads((root/'references.json').read_text(encoding='utf-8'))
assert len(refs)==len({r['id'] for r in refs})==25
assert len([r['doi'] for r in refs if r['doi']])==len({r['doi'].lower() for r in refs if r['doi']})
for needle in ['90,000','1.35','508','270','1.76','453','1,298','Altman','Mason Matthew','References']:
    assert needle in alltext,needle
assert '\ufffd' not in alltext
report={'pages':len(reader.pages),'page_metrics':pages,'machine_checks':'passed','visual_review':'pending',
        'renderer':'Microsoft Word PDF export; pypdfium2 page rasterization',
        'scope':'No scientific verification or journal acceptance is inferred from document checks.'}
(qa/'document_checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
for start in range(0,len(render),6):
    sheet=Image.new('RGB',(1050,1450),'#dddddd');d=ImageDraw.Draw(sheet)
    for j in range(start,min(start+6,len(render))):
        im=Image.open(qa/f'page-{j+1:02d}.png');im.thumbnail((495,435))
        x=(j-start)%2*525;y=(j-start)//2*480
        sheet.paste(im,(x+(525-im.width)//2,y+25));d.text((x+20,y+5),f'Page {j+1}',fill='black')
    sheet.save(qa/f'overview-{start//6+1}.png')
print(json.dumps({'pages':len(reader.pages),'page_characters':[p['characters'] for p in pages],'machine_checks':'passed'}))
