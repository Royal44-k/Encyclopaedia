from pathlib import Path
from zipfile import ZipFile
import json,re,hashlib
from lxml import etree
from pypdf import PdfReader
from pypdf.generic import ContentStream

R=Path(__file__).resolve().parent
CITE=re.compile(r'\[((?:[A-Z]\d{2})(?:\s*,\s*[A-Z]\d{2})*)\]')
manifest=json.loads((R/'build_manifest.json').read_text(encoding='utf-8'))
meta=json.loads((R/'editorial_metadata.json').read_text(encoding='utf-8'))
report={'manuscripts':{},'human_verification':'pending','submission_ready':False}
seq={}
for lang in ['zh','en']:
    text=(R/f'manuscript_{lang}.md').read_text(encoding='utf-8')
    assert not re.search(r'待编号|\[报告|\bTODO\b|\bTBD\b',text),lang+' unresolved placeholder'
    assert not re.search(r'Codex|OpenAI|AI disclosure|人工独立完成|检测率低于',text,re.I),lang+' production text in manuscript'
    seq[lang]=CITE.findall(text)
    assert [int(x) for x in re.findall(r'\[FIGURE([123])\]',text)]==[1,2,3]
    assert len(re.findall(r'^CAPTION[123][:：]',text,re.M))==3
    assert re.findall(r'\[SCENE([12])\]',text)==['1','2']
    assert not re.search(r'第\s*\d+(?:[–-]\d+)?\s*页|\bpages?\s+\d+',text,re.I),'report page locators remain in reading prose'
    target=R/'deliverables'/f'paper1_{lang}.docx'
    with ZipFile(target) as z:
        xml=etree.fromstring(z.read('word/document.xml'))
        ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
        assert len(xml.findall('.//w:drawing',ns))==5
        media_hashes={hashlib.sha256(z.read(n)).hexdigest() for n in z.namelist() if n.startswith('word/media/')}
        embedded_scenes={scene['file']:hashlib.sha256((R/'illustrations'/scene['file']).read_bytes()).hexdigest() in media_hashes for scene in meta['scenes']}
        assert all(embedded_scenes.values()),'original scene images must be embedded, not linked'
        document_text=''.join(xml.itertext())
        assert 'CAPTION1' not in document_text and '[FIGURE' not in document_text and '[SCENE' not in document_text
        assert meta['author'] in document_text and meta['affiliation'] in document_text
        header=''.join(etree.fromstring(z.read('word/header1.xml')).itertext())
        assert meta['running_header'][lang] in header
        assert not re.search(r'\[[AS]\d{2}\]',document_text)
        styles=etree.fromstring(z.read('word/styles.xml'))
        assert not styles.findall('.//w:pBdr',ns)
        assert not any('theme' in a.lower() for rf in styles.findall('.//w:rFonts',ns) for a in rf.attrib),'theme fonts can override explicit font names'
    pdf=PdfReader(str(R/'deliverables'/f'paper1_{lang}.pdf'))
    texts=[p.extract_text() or '' for p in pdf.pages]
    actual_fonts=set()
    scene_pages=[];stroke_modes=0;all_fonts_embedded=True
    for pn,page in enumerate(pdf.pages,1):
        for f in page['/Resources'].get('/Font',{}).values():
            f=f.get_object();actual_fonts.add(str(f.get('/BaseFont','')))
            descendant=f.get('/DescendantFonts')
            d=(descendant[0].get_object() if descendant else f).get('/FontDescriptor')
            all_fonts_embedded &= bool(d and any(k in d.get_object() for k in ['/FontFile','/FontFile2','/FontFile3']))
        for operands,op in ContentStream(page.get_contents(),pdf).operations:
            if op==b'Tr' and int(operands[0])==2:stroke_modes+=1
        xobjects=page['/Resources'].get('/XObject',{})
        for x in xobjects.values():
            x=x.get_object()
            if x.get('/Subtype')=='/Image' and (x.get('/Width'),x.get('/Height'))==(1536,1024):scene_pages.append(pn)
    assert not any('MS-Gothic' in n or 'Calibri' in n for n in actual_fonts),(lang,actual_fonts)
    assert len(scene_pages)==2,(lang,'two scenario images must appear in the PDF',scene_pages)
    assert stroke_modes==0 and all_fonts_embedded
    assert meta['author'] in texts[0] and meta['affiliation'] in texts[0]
    assert all(len(t)>90 for t in texts),lang+' blank or near-blank page'
    assert '参考文献' in ''.join(texts) if lang=='zh' else 'References' in ''.join(texts)
    out={'pages':len(pdf.pages),'figures':3,'scenarios':2,'embedded_scene_images':embedded_scenes,'pdf_scene_pages':scene_pages,'pdf_stroked_text_modes':stroke_modes,'pdf_fonts_embedded':all_fonts_embedded,'author':meta['author'],'affiliation':meta['affiliation'],'running_header':meta['running_header'][lang],'references':len(manifest['references']),'citation_groups':len(seq[lang]),'pdf_fonts':sorted(actual_fonts),'source_sha256':hashlib.sha256((R/f'manuscript_{lang}.md').read_bytes()).hexdigest()}
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
