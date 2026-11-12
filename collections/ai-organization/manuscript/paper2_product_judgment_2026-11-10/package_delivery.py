from pathlib import Path
import json,hashlib,zipfile,re
from lxml import html
R=Path(__file__).resolve().parent
out=R/'deliverables'
sources=json.loads((R/'sources.json').read_text(encoding='utf-8'))
manifest=json.loads((R/'build_manifest.json').read_text(encoding='utf-8'))
for s in sources:
    for k,v in s.items():
        if k.startswith('formatted_reference'):assert '..' not in v
reader=html.fromstring((out/'illustrated_reader.html').read_text(encoding='utf-8'))
ids=set(reader.xpath('//*[@id]/@id'))
for target in reader.xpath('//a[starts-with(@href,"#")]/@href'):
    assert target[1:] in ids,target
for lang in ['zh','en']:
    assert len(reader.xpath(f'//article[@data-language="{lang}"]//li[starts-with(@id,"{lang}-ref-")]'))==12
    md=(R/f'manuscript_{lang}.md').read_text(encoding='utf-8')
    cited=set()
    for group in re.findall(r'\[((?:R\d{2})(?:,\s*R\d{2})*)\]',md):cited.update(re.findall(r'R\d{2}',group))
    assert cited==set(manifest['references'])
checks=json.loads((R/'qa'/'delivery_checks.json').read_text(encoding='utf-8'))
fonts={lang:sorted({font for p in checks[lang]['page_checks'] for font in p['fonts']}) for lang in ['zh','en']}
files=[]
for f in out.iterdir():
    if f.is_file() and f.suffix in ['.pdf','.docx','.html','.md']:files.append(f)
files.extend((R/'figures').glob('*.svg'));files.extend((R/'figures').glob('*.png'))
for name in ['README.md','author_work_record.md','manuscript_zh.md','manuscript_en.md','sources.json','editorial_metadata.json','build_manifest.json','build_documents.py','build_reader.py','reader.css','setup_and_figures.py','prepare_delivery.py','render_figures.cjs','export_word_pdf.ps1','check_delivery.py','check_reader.cjs','package_delivery.py']:
    files.append(R/name)
for name in ['delivery_checks.json','reader_checks.json','svg_audit.json']:files.append(R/'qa'/name)
inventory={str(f.relative_to(R)).replace('\\','/'):{'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in files}
(R/'qa'/'package_inventory.json').write_text(json.dumps({'files':inventory,'fonts':fonts,'pages':{k:checks[k]['pages'] for k in checks},'manual_page_review':'14 pages reviewed; final references rechecked','submission_ready':False},ensure_ascii=False,indent=2),encoding='utf-8')
files.append(R/'qa'/'package_inventory.json')
archive=out/'paper2_review_bundle_2026-11-10.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for f in files:z.write(f,str(f.relative_to(R)))
with zipfile.ZipFile(archive) as z:assert z.testzip() is None
print(json.dumps({'archive':str(archive),'files':len(files),'bytes':archive.stat().st_size,'fonts':fonts},ensure_ascii=False))
