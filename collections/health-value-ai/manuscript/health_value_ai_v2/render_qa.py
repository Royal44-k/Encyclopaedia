from pathlib import Path
import sys, json, re, hashlib
from zipfile import ZipFile
from pypdf import PdfReader
import pypdfium2 as pdfium
from PIL import Image,ImageDraw

root=Path(__file__).resolve().parent
word='--word' in sys.argv
pdf=root/'qa'/'Word_render.pdf' if word else root/'Health_value_AI_Illustrated.pdf'
dest=root/'qa'/('word_pages' if word else 'reading_pages');dest.mkdir(parents=True,exist_ok=True)
reader=PdfReader(str(pdf));d=pdfium.PdfDocument(str(pdf))
alltext='';pages=[]
for i in range(len(d)):
    d[i].render(scale=1.65).to_pil().convert('RGB').save(dest/f'page-{i+1:02}.png')
    t=reader.pages[i].extract_text() or '';alltext+=t+'\n';pages.append({'page':i+1,'characters':len(t)})
(dest/'text.txt').write_text(alltext,encoding='utf-8')
for token in ['to be supplied','remains pending','Author review draft','full name to','permission for any published acknowledgement']:
    assert token.lower() not in alltext.lower(),token
tokens=['1.35','1.13','1.61','90,000','Richard T. Millian','Altman']
if word:
    # Figure labels are pixels in Word. Verify the actual embedded originals,
    # then inspect the page render rather than pretending text extraction sees them.
    with ZipFile(root/'Health_value_AI_Illustrated.docx') as z:
        embedded={hashlib.sha256(z.read(n)).hexdigest() for n in z.namelist() if n.startswith('word/media/')}
    for n in range(1,5):assert hashlib.sha256((root/'figures'/f'figure{n}.png').read_bytes()).hexdigest() in embedded
else:tokens+=['508','106','270','393','147']
for token in tokens:
    assert token in alltext,token
assert '\ufffd' not in alltext
assert '[@E' not in alltext
for start in range(0,len(d),4):
    sheet=Image.new('RGB',(1220,1580),'#e6e8e9');draw=ImageDraw.Draw(sheet)
    for i in range(start,min(start+4,len(d))):
        im=Image.open(dest/f'page-{i+1:02}.png');im.thumbnail((588,745))
        x=(i-start)%2*610+(610-im.width)//2;y=(i-start)//2*790+25
        sheet.paste(im,(x,y));draw.text((x,y-18),f'Page {i+1}',fill='black')
    sheet.save(dest/f'overview-{start//4+1}.png')
report={'pages':len(d),'page_metrics':pages,'placeholder_and_numeric_checks':'pass','visual_review':'not recorded by this script'}
(dest/'checks.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
