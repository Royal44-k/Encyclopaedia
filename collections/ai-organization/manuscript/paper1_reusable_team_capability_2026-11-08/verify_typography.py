"""Verify the delivered glyphs as well as the declared Word styles."""
from pathlib import Path
from zipfile import ZipFile
from collections import Counter
from datetime import datetime
import hashlib, json, re
from lxml import etree
import pdfplumber
from pypdf import PdfReader
from pypdf.generic import ContentStream

R = Path(__file__).resolve().parent
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
report = {'revision': 3, 'checked_at': datetime.now().astimezone().isoformat(), 'artifacts': {}}
for lang in ['zh', 'en']:
    docx = R/'deliverables'/f'paper1_{lang}.docx'
    pdf = R/'deliverables'/f'paper1_{lang}.pdf'
    with ZipFile(docx) as z:
        styles = etree.fromstring(z.read('word/styles.xml'))
        theme = [a for rf in styles.findall('.//w:rFonts', NS) for a in rf.attrib if 'theme' in a.lower()]
        assert not theme
        active = {}
        for s in styles.findall('w:style', NS):
            sid = s.get('{'+NS['w']+'}styleId')
            if sid in ['Normal','Title','Heading1','Caption','Header','Footer','Author','Affiliation','Articletype']:
                active[sid] = {etree.QName(c).localname: {etree.QName(k).localname:v for k,v in c.attrib.items()} for c in s.findall('w:rPr/*',NS)}
    reader = PdfReader(pdf)
    fonts, modes = {}, Counter()
    for page in reader.pages:
        for f in page['/Resources'].get('/Font', {}).values():
            f = f.get_object()
            desc = f.get('/DescendantFonts')
            d = (desc[0].get_object() if desc else f).get('/FontDescriptor').get_object()
            fonts[str(f['/BaseFont'])] = {'weight': d.get('/FontWeight'), 'embedded': any(k in d for k in ['/FontFile','/FontFile2','/FontFile3'])}
        for operands, op in ContentStream(page.get_contents(), reader).operations:
            if op == b'Tr': modes[str(int(operands[0]))] += 1
    with pdfplumber.open(pdf) as p:
        chars = [c for page in p.pages for c in page.chars if c['text'].strip()]
    headings = Counter(c['fontname'] for c in chars if abs(c['size']-14)<.15)
    titles = Counter(c['fontname'] for c in chars if abs(c['size']-25)<.15)
    body = [c for c in chars if abs(c['size']-11.5)<.12]
    han = Counter(c['fontname'] for c in body if re.search('[\u4e00-\u9fff]', c['text']))
    latin = Counter(c['fontname'] for c in body if re.search('[A-Za-z0-9]', c['text']))
    checks = {
        'no_theme_font_attributes': not theme,
        'no_ms_gothic_or_calibri': not any('Gothic' in f or 'Calibri' in f for f in fonts),
        'all_pdf_fonts_embedded': all(f['embedded'] for f in fonts.values()),
        'no_fill_stroke_simulated_bold': modes.get('2', 0) == 0,
        'headings_use_true_bold': bool(headings) and all('Bold' in f for f in headings),
        'main_title_regular_by_design': bool(titles) and all('Bold' not in f for f in titles),
        'main_body_han_simsun': bool(han) and all('SimSun' in f for f in han) if lang == 'zh' else None,
        'main_body_latin_times': bool(latin) and all('TimesNewRoman' in f for f in latin),
    }
    assert all(v is not False for v in checks.values()), (lang, checks)
    report['artifacts'][lang] = {
        'pdf_sha256': hashlib.sha256(pdf.read_bytes()).hexdigest(),
        'docx_sha256': hashlib.sha256(docx.read_bytes()).hexdigest(),
        'page_count': len(reader.pages), 'active_word_styles': active,
        'pdf_font_resources': fonts, 'text_rendering_mode_counts': dict(modes),
        'heading_character_fonts': dict(headings), 'title_character_fonts': dict(titles),
        'body_han_character_fonts': dict(han), 'body_latin_character_fonts': dict(latin),
        'checks': checks,
    }
report['scope'] = 'Fresh current-file OOXML, PDF font-resource, text-rendering and extracted-glyph checks. Rasterized figure lettering is covered by separate visual review.'
report['result'] = 'PASS; full-page visual review is recorded separately in revision03_visual.md.'
(R/'qa'/'typography_verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({k:v['checks'] for k,v in report['artifacts'].items()}, ensure_ascii=False))
