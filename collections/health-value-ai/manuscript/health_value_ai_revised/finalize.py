"""Local semantic audit and delivery packaging for the revised editions."""
from pathlib import Path
import json,re,zipfile,hashlib,unicodedata
from pypdf import PdfReader
from lxml import etree
from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parent
D=json.loads((ROOT/'content_bilingual.json').read_text(encoding='utf-8'))
STATUS=json.loads((ROOT/'internal_status.json').read_text(encoding='utf-8'))
NUM=STATUS['references']
def cite(t):
    return re.sub(r'(?:\[@E\d+\])+',lambda m:'['+', '.join(str(x) for x in sorted({NUM[e] for e in re.findall(r'E\d+',m.group())}))+']',t)
def norm(t):
    return re.sub(r'\s+','',unicodedata.normalize('NFKC',t)).replace('_','').replace('\u00ad','')
def plain(t):return re.sub('<[^>]+>','',cite(t))
validation={}
for lang in ['en','zh']:
    d=D[lang]
    prose=[d['abstract']]+[p for secs in d['pages'].values() for sec in secs for p in sec['paragraphs'] if not p.startswith(('Δx_i','Δz_j','ΔW ='))]
    captions=list(d['captions'].values())+[t['caption'] for t in d['tables'].values()]
    for kind,path in [('pdf',ROOT/f'Health_value_AI_{lang.upper()}.pdf'),('word',ROOT/'qa'/f'Word_{lang.upper()}.pdf')]:
        reader=PdfReader(path)
        text=norm(''.join(p.extract_text() for p in reader.pages))
        missing=[i for i,p in enumerate(prose) if norm(plain(p)) not in text]
        missing_captions=[i for i,p in enumerate(captions) if norm(plain(p)) not in text]
        assert not missing,(lang,kind,'prose',missing)
        assert not missing_captions,(lang,kind,'captions',missing_captions)
        assert len(reader.pages)==11,(lang,kind,len(reader.pages))
        for unwanted in ['Declarations','Source notes','声明','来源说明','Altman','Mason Matthew','Scientific Agent Skills','AI 辅助了']:
            assert norm(unwanted) not in text,(lang,kind,unwanted)
        validation[lang+'_'+kind]={'pages':11,'complete_prose_paragraphs':len(prose),'complete_captions':len(captions)}
    with zipfile.ZipFile(ROOT/f'Health_value_AI_{lang.upper()}.docx') as archive:
        xml=etree.fromstring(archive.read('word/document.xml'))
        ns={'m':'http://schemas.openxmlformats.org/officeDocument/2006/math'}
        eqtext=''.join(xml.xpath('//m:t/text()',namespaces=ns))
        assert '∀' in eqtext and '∃' in eqtext
        assert len(xml.findall('.//m:oMath',ns))==3
assert len(NUM)==26 and 'E023' not in NUM
for name in ['figure_data.csv','additional_evidence_data.csv']:
    assert (ROOT/name).read_bytes()==(ROOT.parent/'health_value_ai_final_bilingual'/name).read_bytes()

README='''# 中英文修订稿

中文题目：人工智能时代的健康经济价值：跨期权衡与评价框架

English title: Health economic value in the AI era: a framework for intertemporal choice

中英文各含 PDF 阅读版与 Word 可编辑版，均为 11 页，包含 8 幅图、3 张表、3 个展示公式及 26 条参考文献。

本轮重写中文摘要及九节论述，减少直译术语与重复限定；删去声明和来源说明；重绘框架、评价层次、指标、验证设计与制度分配五幅图；调整中文字号、行距与图注字重；同步英文中的概念和结构修改。文献数值与假设案例沿用原始记录。

`content_bilingual.json` 为双语内容源，`references.json` 保留文献与定位，两个 CSV 保存数值。`figures` 包含每图 SVG、PDF 和 300 dpi PNG；`build.py` 与三个 figures 脚本可从当前内容源重新生成四份稿件。所需环境为 Python、ReportLab、python-docx、pypdfium2 和 Windows 字体，运行 `python -X utf8 build.py`。

`editorial_reading.json` 为中文措辞参考的内部阅读记录，注明实际访问范围；其条目没有被用来新增实证估计。`qa.py` 用于渲染和结构核查，Word 导出由 `export_word_pdf.ps1` 完成。
'''
(ROOT/'README.md').write_text(README,encoding='utf-8')
audit={'date':'2026-11-07','semantic_checks':validation,'bibliography_count':26,'numerical_data_unchanged':True,'removed_sections_checked':True,'human_scientific_verification_complete':False,'new_empirical_validation':False,'renderer':'LibreOffice unavailable; actual Word COM export plus PDFium rendering used for DOCX inspection.','visual_inspection':'See visual_review.json for inspected pages and scope.','editorial_reading':'editorial_reading.json records access depth; no claim that all referenced originals were reread.'}
(ROOT/'qa'/'final_audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf-8')
sheet=Image.new('RGB',(1100,745),'#e8edef')
for j,page in enumerate([1,6]):
    im=Image.open(ROOT/'qa'/'ZH'/f'page{page:02}.png').convert('RGB');im.thumbnail((535,700))
    sheet.paste(im,(j*550+(550-im.width)//2,25))
    ImageDraw.Draw(sheet).text((j*550+15,8),f'Chinese edition / page {page}',fill='#364c57')
sheet.save(ROOT/'preview.png')
files=['README.md','content_bilingual.json','references.json','figure_data.csv','additional_evidence_data.csv','figure_localization.json','build.py','figures_original.py','figure_translations.py','figures_revised.py','manuscript_en.md','manuscript_zh.md','editorial_reading.json']
with zipfile.ZipFile(ROOT/'Figures_and_editable_sources.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for name in files:archive.write(ROOT/name,name)
    for p in (ROOT/'figures').rglob('*'):
        if p.is_file():archive.write(p,p.relative_to(ROOT))
outputs=[ROOT/f'Health_value_AI_{lang}.{fmt}' for lang in ['ZH','EN'] for fmt in ['pdf','docx']]+[ROOT/'Figures_and_editable_sources.zip']
manifest={p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in outputs}
(ROOT/'delivery_manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps({'semantic_checks':validation,'bibliography':26,'data_unchanged':True,'deliverables':list(manifest)},ensure_ascii=False))
