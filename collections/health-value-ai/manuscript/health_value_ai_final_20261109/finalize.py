from pathlib import Path
import json,re,hashlib,unicodedata,zipfile
from pypdf import PdfReader
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parent
D=json.loads((R/'content_bilingual.json').read_text(encoding='utf-8'))
NUM=json.loads((R/'internal_status.json').read_text(encoding='utf-8'))['references']
def cite(t):
    return re.sub(r'(?:\[@E\d+\])+',lambda m:'['+', '.join(str(x) for x in sorted({NUM[e] for e in re.findall(r'E\d+',m.group())}))+']',t)
def norm(t):return re.sub(r'\s+','',unicodedata.normalize('NFKC',t)).replace('_','').replace('\u00ad','')
def clean(t):return norm(re.sub('<[^>]+>','',cite(t)))
checks={}
for lang in ['en','zh']:
    d=D[lang]
    prose=[d['abstract']]+[p for ss in d['pages'].values() for s in ss for p in s['paragraphs'] if not p.startswith(('Δx_i','Δz_j','ΔW ='))]
    captions=list(d['captions'].values())+[t['caption'] for t in d['tables'].values()]
    for kind,path in [('PDF',R/f'Health_value_AI_{lang.upper()}.pdf'),('Word',R/'qa'/f'Word_{lang.upper()}.pdf')]:
        pdf=PdfReader(path);text=norm(''.join(p.extract_text() for p in pdf.pages))
        assert len(pdf.pages)==14,(lang,kind,len(pdf.pages))
        assert all('Perspective' in p.extract_text() for p in pdf.pages)
        assert not [i for i,p in enumerate(prose) if clean(p) not in text],(lang,kind,'missing prose')
        assert not [i for i,p in enumerate(captions) if clean(p) not in text],(lang,kind,'missing captions')
        for term in ['Declarations','Source notes','声明','来源说明','Altman','Mason Matthew','Scientific Agent Skills']:
            assert norm(term) not in text,(lang,kind,term)
        for page,ss in d['pages'].items():
            page_text=norm(pdf.pages[int(page)-1].extract_text())
            for s in ss:
                for p in s['paragraphs']:
                    if not p.startswith(('Δx_i','Δz_j','ΔW =')):assert clean(p) in page_text,(lang,kind,page,'page drift')
        checks[lang+'_'+kind]={'pages':14,'complete_prose':len(prose),'complete_captions':len(captions),'page_assignment':'passed'}
for file in ['references.json','figure_data.csv','additional_evidence_data.csv']:
    assert (R/file).read_bytes()==(R.parent/'health_value_ai_perspective'/file).read_bytes(),file
assert len(NUM)==26
audit={'date':'2026-11-09','checks':checks,'unchanged_evidence_files':True,'paired_paragraph_citations':'qa/checks.json','human_scientific_verification':False,'new_empirical_validation':False,'visual_review':'design-qa.md'}
(R/'qa'/'final_audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf-8')
preview=Image.new('RGB',(1440,660),'#e8edef')
for j,(lang,p) in enumerate([('ZH',2),('EN',6),('ZH',10)]):
    im=Image.open(R/'qa'/lang/f'page{p:02}.png').convert('RGB');im.thumbnail((464,620))
    preview.paste(im,(480*j+(480-im.width)//2,25));ImageDraw.Draw(preview).text((480*j+15,8),f'{lang} / page {p}',fill='#182B35')
preview.save(R/'preview.png')
files=['README.md','build.py','figures_original.py','figures_revised.py','figure_translations.py','figures_cases.py','content_bilingual.json','references.json','figure_data.csv','additional_evidence_data.csv','figure_localization.json','manuscript_en.md','manuscript_zh.md','editorial_changes.json','editorial_round_20261107.json','design-qa.md','editorial_methods.md','export_word_pdf.ps1','qa.py','compare_pages.py','finalize.py','internal_status.json','qa/checks.json','qa/final_audit.json']
with zipfile.ZipFile(R/'Figures_and_editable_sources.zip','w',zipfile.ZIP_DEFLATED) as z:
    for f in files:z.write(R/f,f)
    for folder in ['figures','illustrations']:
        for p in (R/folder).rglob('*'):
            if p.is_file():z.write(p,p.relative_to(R))
outputs=[R/f'Health_value_AI_{lang}.{ext}' for lang in ['ZH','EN'] for ext in ['pdf','docx']]+[R/'Figures_and_editable_sources.zip']
manifest={p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in outputs}
(R/'delivery_manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps(audit,ensure_ascii=False))
