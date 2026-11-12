from pathlib import Path
from zipfile import ZipFile
import json,re,hashlib
from lxml import etree
from pypdf import PdfReader

R=Path(__file__).resolve().parent
CITE=re.compile(r'\[((?:[A-Z]\d{2})(?:\s*,\s*[A-Z]\d{2})*)\]')
manifest=json.loads((R/'build_manifest.json').read_text(encoding='utf-8'))
report={'manuscripts':{},'human_verification':'pending','submission_ready':False}
seq={}
for lang in ['zh','en']:
    text=(R/f'manuscript_{lang}.md').read_text(encoding='utf-8')
    assert not re.search(r'待编号|\[报告|\bTODO\b|\bTBD\b',text),lang+' unresolved placeholder'
    assert not re.search(r'Codex|OpenAI|AI disclosure|人工独立完成|检测率低于',text,re.I),lang+' production text in manuscript'
    seq[lang]=CITE.findall(text)
    assert [int(x) for x in re.findall(r'\[FIGURE([123])\]',text)]==[1,2,3]
    assert len(re.findall(r'^CAPTION[123][:：]',text,re.M))==3
    target=R/'deliverables'/f'paper1_{lang}.docx'
    with ZipFile(target) as z:
        xml=etree.fromstring(z.read('word/document.xml'))
        ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
        assert len(xml.findall('.//w:drawing',ns))==3
        document_text=''.join(xml.itertext())
        assert 'CAPTION1' not in document_text and '[FIGURE' not in document_text
        assert not re.search(r'\[[AS]\d{2}\]',document_text)
        styles=etree.fromstring(z.read('word/styles.xml'))
        assert not styles.findall('.//w:pBdr',ns)
        assert not any('theme' in a.lower() for rf in styles.findall('.//w:rFonts',ns) for a in rf.attrib),'theme fonts can override explicit font names'
    pdf=PdfReader(str(R/'deliverables'/f'paper1_{lang}.pdf'))
    texts=[p.extract_text() or '' for p in pdf.pages]
    actual_fonts=set()
    for page in pdf.pages:
        for f in page['/Resources'].get('/Font',{}).values():actual_fonts.add(str(f.get_object().get('/BaseFont','')))
    assert not any('MS-Gothic' in n or 'Calibri' in n for n in actual_fonts),(lang,actual_fonts)
    assert all(len(t)>90 for t in texts),lang+' blank or near-blank page'
    assert '参考文献' in ''.join(texts) if lang=='zh' else 'References' in ''.join(texts)
    out={'pages':len(pdf.pages),'figures':3,'references':len(manifest['references']),'citation_groups':len(seq[lang]),'pdf_fonts':sorted(actual_fonts),'source_sha256':hashlib.sha256((R/f'manuscript_{lang}.md').read_bytes()).hexdigest()}
    if lang=='zh':out['han_characters']=len(re.findall(r'[\u4e00-\u9fff]',text))
    else:out['words_including_captions']=len(re.findall(r"[A-Za-z]+(?:['-][A-Za-z]+)*",CITE.sub('',text)))
    report['manuscripts'][lang]=out
assert seq['zh']==seq['en'],(seq['zh'],seq['en'])
assert set(re.findall(r'[AS]\d{2}',','.join(seq['zh'])))==set(manifest['references'])
checks=json.loads((R/'qa'/'reader'/'checks.json').read_text(encoding='utf-8'))
assert not checks['consoleErrors'] and all(v is not False for v in checks.values())
report['reader']=checks
report['bilingual_citation_sequences_match']=True
report['source_references_close']=True
report['notes']='Mechanical checks complement separate page-image inspection; they do not certify scientific truth or journal acceptance.'
(R/'qa'/'delivery_checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
