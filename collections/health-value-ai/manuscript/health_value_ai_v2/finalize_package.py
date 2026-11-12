"""Check the delivered document content and assemble its local preview."""
from pathlib import Path
from zipfile import ZipFile
import hashlib, json, re, unicodedata
from lxml import etree
from PIL import Image
from pypdf import PdfReader
import pypdfium2 as pdfium

root = Path(__file__).resolve().parent

# Align the source-table order with the already correctly numbered layouts.
for name in ['manuscript_en.md', 'manuscript_en.source.md']:
    path = root / name
    txt = path.read_text(encoding='utf-8')
    a, b, c = txt.index('\n\nTable 2 |'), txt.index('\n\nTable 1 |'), txt.index('\n\n## Source notes')
    if a < b:
        txt = txt[:a] + txt[b:c] + txt[a:b] + txt[c:]
        path.write_text(txt, encoding='utf-8')

with ZipFile(root / 'Health_value_AI_Illustrated.docx') as z:
    xml = etree.fromstring(z.read('word/document.xml'))
    ns = {'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    # Restrict extraction to displayed paragraph text rather than field metadata.
    docx_text = '\n'.join(''.join(p.xpath('.//w:t/text()', namespaces=ns)) for p in xml.xpath('//w:p', namespaces=ns))
    media = [n for n in z.namelist() if n.startswith('word/media/')]

def normalize(txt):
    return ''.join(c for c in unicodedata.normalize('NFKC', txt) if c.isalnum()).lower()

md = (root / 'manuscript_en.md').read_text(encoding='utf-8')
body = md.split('## Abstract\n\n', 1)[1].split('\n\n## Figures', 1)[0]
paragraphs = [p.strip() for p in body.split('\n\n') if p.strip() and not p.startswith('## ') and not p.startswith('ΔW =')]
word_normalized = normalize(docx_text)
missing_word = [p[:110] for p in paragraphs if normalize(p) not in word_normalized]
assert not missing_word, missing_word

reading_pdf = PdfReader(str(root / 'Health_value_AI_Illustrated.pdf'))
word_pdf = PdfReader(str(root / 'qa' / 'Word_render.pdf'))
assert len(reading_pdf.pages) == len(word_pdf.pages) == 9
assert len(media) == 4
reading_text = '\n'.join(p.extract_text() or '' for p in reading_pdf.pages)
pdf_normalized = normalize(reading_text)
missing_pdf = [p[:110] for p in paragraphs if normalize(p) not in pdf_normalized]
# A paragraph can cross a page footer/header; these tokens are stripped explicitly.
if missing_pdf:
    clean = re.sub(r'PERSPECTIVE\s*\|\s*Health economic value in the AI era', '', reading_text)
    clean = re.sub(r'Richard T\. Millian\s*\d+', '', clean)
    pdf_normalized = normalize(clean)
    missing_pdf = [p[:110] for p in paragraphs if normalize(p) not in pdf_normalized]
assert not missing_pdf, missing_pdf

# Confirm the final PDF has the same pixels as the individually inspected pages.
pdf = pdfium.PdfDocument(str(root / 'Health_value_AI_Illustrated.pdf'))
for i in range(len(pdf)):
    actual = pdf[i].render(scale=1.65).to_pil().convert('RGB')
    inspected = Image.open(root / 'qa' / 'reading_pages' / f'page-{i+1:02}.png').convert('RGB')
    assert actual.size == inspected.size and actual.tobytes() == inspected.tobytes(), i + 1

preview = Image.new('RGB', (1640, 1067), '#e7ebed')
for j, n in enumerate([1, 6]):
    im = Image.open(root / 'qa' / 'reading_pages' / f'page-{n:02}.png').convert('RGB')
    im.thumbnail((790, 1027), Image.Resampling.LANCZOS)
    preview.paste(im, (20 + 810*j + (790-im.width)//2, 20))
preview.save(root / 'preview.png')

report = {
    'reading_pdf_pages':9, 'word_render_pages':9,
    'figures':4, 'tables':2, 'references':25,
    'body_paragraphs_checked':len(paragraphs),
    'body_presence_in_docx':'pass', 'body_presence_in_reading_pdf':'pass',
    'final_pdf_pixels_match_inspected_pages':True,
    'visual_review':{
        'reading_pdf':'All nine pages inspected as rendered images.',
        'docx':'All nine pages inspected from the Microsoft Word PDF export.',
        'findings':'No clipped text, overlapping content, missing figures or unreadable labels observed.'
    },
    'checks_scope':'Content presence, pagination and visual rendering; not independent scientific validation.',
    'sha256':{name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in ['Health_value_AI_Illustrated.pdf','Health_value_AI_Illustrated.docx','figure_data.csv']}
}
(root / 'qa' / 'final_checks.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False))
