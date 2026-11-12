from pathlib import Path
import json
from pdf2image import convert_from_path
from pypdf import PdfReader
from PIL import Image,ImageOps,ImageDraw

ROOT=Path(__file__).resolve().parent
POPPLER=r'C:\Users\lenovo\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin'
report={}
for lang in ['en','zh']:
    src=ROOT/'deliverables'/f'paper1_{lang}.pdf'
    if not src.exists():continue
    dest=ROOT/'qa'/lang;dest.mkdir(parents=True,exist_ok=True)
    images=convert_from_path(str(src),dpi=120,poppler_path=POPPLER)
    pages=[]
    reader=PdfReader(str(src))
    for n,(im,page) in enumerate(zip(images,reader.pages),1):
        im.save(dest/f'page-{n}.png')
        text=page.extract_text() or ''
        pages.append({'page':n,'text_chars':len(text),'first':text[:160],'last':text[-180:]})
    for chunk in range(0,len(images),8):
        canvas=Image.new('RGB',(4*310,2*425),'#dce2e8');d=ImageDraw.Draw(canvas)
        for i,im in enumerate(images[chunk:chunk+8]):
            thumb=ImageOps.contain(im,(290,390));x=(i%4)*310+10;y=(i//4)*425+25
            canvas.paste(thumb,(x,y));d.text((x,y-18),str(chunk+i+1),fill='black')
        canvas.save(dest/f'contact-{chunk//8+1}.png')
    report[lang]={'pages':len(images),'page_details':pages}
(ROOT/'qa'/'page_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v['pages'] for k,v in report.items()}))
