from pathlib import Path
import json,sys
from pypdf import PdfReader
import pypdfium2 as pdfium
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parent
word='--word' in sys.argv
source=root/'qa'/'Word_render.pdf' if word else root/'Health_value_AI_Illustrated.pdf'
dest=root/'qa'/('word_pages' if word else 'reading_pages');dest.mkdir(parents=True,exist_ok=True)
pdf=pdfium.PdfDocument(str(source));reader=PdfReader(str(source));texts=[]
for i in range(len(pdf)):
    pdf[i].render(scale=1.6).to_pil().convert('RGB').save(dest/f'page-{i+1:02}.png')
    texts.append(reader.pages[i].extract_text() or '')
(dest/'text.txt').write_text('\n'.join(texts),encoding='utf-8')
for start in range(0,len(pdf),4):
    sheet=Image.new('RGB',(1200,1570),'#E8EDEF')
    draw=ImageDraw.Draw(sheet)
    for i in range(start,min(start+4,len(pdf))):
        im=Image.open(dest/f'page-{i+1:02}.png');im.thumbnail((580,750))
        x=(i-start)%2*600+10;y=(i-start)//2*785+25
        sheet.paste(im,(x,y));draw.text((x,y-18),f'Page {i+1}',fill='black')
    sheet.save(dest/f'overview-{start//4+1}.png')
print(json.dumps({'pages':len(pdf),'characters':[len(t) for t in texts]}))
