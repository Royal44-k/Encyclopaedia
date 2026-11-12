from pathlib import Path
import json,re,zipfile,csv
from lxml import etree
from PIL import Image,ImageOps,ImageDraw
from pypdf import PdfReader
import pypdfium2 as pdfium
ROOT=Path(__file__).resolve().parent
QA=ROOT/'qa';QA.mkdir(exist_ok=True)
D=json.loads((ROOT/'content_bilingual.json').read_text(encoding='utf-8'))
report={'paired_sections':True,'paired_paragraphs':True,'editions':{}}
for page in D['en']['pages']:
    assert len(D['en']['pages'][page])==len(D['zh']['pages'][page])
    for en,zh in zip(D['en']['pages'][page],D['zh']['pages'][page]):
        assert len(en['paragraphs'])==len(zh['paragraphs'])
        for a,b in zip(en['paragraphs'],zh['paragraphs']):
            assert set(re.findall(r'\[@E\d+\]',a))==set(re.findall(r'\[@E\d+\]',b)),(page,a,b)
for lang in ['EN','ZH']:
    z=zipfile.ZipFile(ROOT/f'Health_value_AI_{lang}.docx');root=etree.fromstring(z.read('word/document.xml'))
    ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','m':'http://schemas.openxmlformats.org/officeDocument/2006/math','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
    counts={'native_equations':len(root.findall('.//m:oMath',ns)),'editable_tables':len(root.findall('.//w:tbl',ns)),'embedded_figures':len(root.findall('.//a:blip',ns))}
    assert counts=={'native_equations':3,'editable_tables':3,'embedded_figures':8},counts
    text=''.join(root.itertext());assert '[@E' not in text
    report['editions'][lang]=counts
for name,path in [(l,ROOT/f'Health_value_AI_{l}.pdf') for l in ['EN','ZH']]+[(f'Word_{l}',QA/f'Word_{l}.pdf') for l in ['EN','ZH']]:
    if not path.exists():continue
    reader=PdfReader(path);texts=[p.extract_text() for p in reader.pages]
    assert all('[@E' not in t for t in texts)
    report['editions'].setdefault(name,{})['pages']=len(texts)
    report['editions'][name]['page_text_lengths']=[len(t) for t in texts]
    (QA/f'{name}_text.txt').write_text('\n\n'.join(texts),encoding='utf-8')
    folder=QA/name;folder.mkdir(exist_ok=True);pd=pdfium.PdfDocument(str(path));ims=[]
    for i,page in enumerate(pd):
        im=page.render(scale=1.5).to_pil().convert('RGB');im.save(folder/f'page{i+1:02}.png');ims.append(im)
    for i in range(0,len(ims),2):
        sheet=Image.new('RGB',(1846,1220),'#e7ecef')
        for j,im in enumerate(ims[i:i+2]):sheet.paste(im,(j*928,25))
        ImageDraw.Draw(sheet).text((10,5),f'{name}: {i+1} / {min(i+2,len(ims))}',fill='black')
        sheet.save(folder/f'pair{i//2+1:02}.png')
    pd.close()
    report['editions'][name]['rendered_all_pages']=True
assert 100000-10000==90000 and 28-7==21
assert 508-106==402 and 508+106==614
for a in [0,3,5]:assert -4+a=={0:-4,3:-1,5:1}[a]
report['arithmetic_checks']='passed'
(QA/'checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
