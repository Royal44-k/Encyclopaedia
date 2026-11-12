from pathlib import Path
import json,re,zipfile,collections,subprocess,sys,hashlib
import pypdfium2 as pdfium
import pdfplumber
from lxml import etree
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parent
Q=R/'qa'; Q.mkdir(exist_ok=True)
NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
results={}
for lang in ['zh','en']:
    f=R/'deliverables'/f'paper2_{lang}.docx'
    with zipfile.ZipFile(f) as z:
        root=etree.fromstring(z.read('word/document.xml'))
        media=[x for x in z.namelist() if x.startswith('word/media/')]
        external_images=[x for x in root.xpath('//a:blip',namespaces=NS) if x.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}link')]
        assert len(media)==3 and not external_images
        body_bold=[]
        for p in root.xpath('//w:body/w:p',namespaces=NS):
            styles=p.xpath('./w:pPr/w:pStyle/@w:val',namespaces=NS)
            if styles:continue
            for run in p.xpath('./w:r',namespaces=NS):
                bold=run.xpath('./w:rPr/w:b[not(@w:val="0")]',namespaces=NS)
                if bold:body_bold.append(''.join(run.xpath('.//w:t/text()',namespaces=NS)))
        assert not body_bold,body_bold
    pdf=R/'deliverables'/f'paper2_{lang}.pdf'
    doc=pdfium.PdfDocument(str(pdf)); frames=[]; pageinfo=[]
    for n in range(len(doc)):
        page=doc[n]; im=page.render(scale=1.8).to_pil().convert('RGB')
        im.save(Q/f'{lang}_page_{n+1:02d}.png')
        thumb=im.copy();thumb.thumbnail((306,396));frames.append(thumb)
    sheet=Image.new('RGB',(326*4,432*((len(frames)+3)//4)), '#dbe1e4');dr=ImageDraw.Draw(sheet)
    for n,im in enumerate(frames):
        x=(n%4)*326+10;y=(n//4)*432+24;sheet.paste(im,(x,y));dr.text((x,y-18),f'{lang.upper()} / {n+1}',fill='#18313a')
    sheet.save(Q/f'{lang}_contact.png')
    with pdfplumber.open(pdf) as p:
        text='\n'.join(x.extract_text() or '' for x in p.pages)
        assert 'Richard T.Millian' in text and 'Hangzhou Normal University' in text
        assert '[R0' not in text and '[FIGURE' not in text and 'CAPTION' not in text
        assert len(re.findall(r'\b\d+\.',text))>=12
        for i,page in enumerate(p.pages):
            chars=[c for c in page.chars if 40<c['top']<740]
            outside=[c['text'] for c in chars if c['x0']<54 or c['x1']>558]
            pageinfo.append({'page':i+1,'fonts':dict(collections.Counter(c['fontname'] for c in chars)),'images':len(page.images),'outside_horizontal_margins':''.join(outside),'characters':len(chars)})
        (Q/f'{lang}_extracted.txt').write_text(text,encoding='utf-8')
    results[lang]={'pages':len(doc),'embedded_docx_images':len(media),'external_images':len(external_images),'body_bold_runs':body_bold,'page_checks':pageinfo,'pdf_sha256':hashlib.sha256(pdf.read_bytes()).hexdigest()}
    doc.close()
audits=[]
for f in (R/'figures').glob('*.svg'):
    r=subprocess.run([sys.executable,'D:/Thesis-Paper/.agents/skills/nature-figure/scripts/audit_svg_schematic.py',str(f),'--min-pt','8','--max-pt','12','--max-width-mm','183','--json'],capture_output=True,text=True,encoding='utf-8')
    audits.append(json.loads(r.stdout))
(Q/'svg_audit.json').write_text(json.dumps(audits,indent=2,ensure_ascii=False),encoding='utf-8')
(Q/'delivery_checks.json').write_text(json.dumps(results,indent=2,ensure_ascii=False),encoding='utf-8')
print(json.dumps({k:{'pages':v['pages'],'images':v['embedded_docx_images'],'body_bold':len(v['body_bold_runs'])} for k,v in results.items()}))
