from pathlib import Path
import json,re,zipfile,unicodedata,hashlib
from lxml import etree
from pypdf import PdfReader

R=Path(__file__).resolve().parent
D=json.loads((R/'content_bilingual.json').read_text(encoding='utf-8'))
BASE=R.parent/'health_value_ai_final_20261109'
OLD=json.loads((BASE/'content_bilingual.json').read_text(encoding='utf-8'))
NUM=json.loads((R/'internal_status.json').read_text(encoding='utf-8'))['references']
G=r'\[@E\d+\](?:\s*\[@E\d+\])*'
def group(ids):
    a=sorted({NUM[e] for e in ids});out=[];i=0
    while i<len(a):
        j=i
        while j+1<len(a) and a[j+1]==a[j]+1:j+=1
        out+=([str(a[i])+'–'+str(a[j])] if j-i>=2 else [str(v) for v in a[i:j+1]])
        i=j+1
    return ','.join(out)
def cite(t):
    t=re.sub(r'([。；，.!?;])\s*('+G+r')',r'\2\1',t)
    t=re.sub(r'\s+('+G+r')',r'\1',t)
    return re.sub(G,lambda m:group(re.findall(r'E\d+',m.group())),t)
def norm(t):return re.sub(r'\s+','',unicodedata.normalize('NFKC',t)).replace('_','').replace('\u00ad','').replace('\u2060','')
def expected(t):return norm(re.sub('<[^>]+>','',cite(t)))
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
report={}
for lang in ['en','zh']:
    d=D[lang]
    assert d['pages']==OLD[lang]['pages'] and d['abstract']==OLD[lang]['abstract']
    assert d['captions']==OLD[lang]['captions']
    z=zipfile.ZipFile(R/f'Health_value_AI_{lang.upper()}.docx')
    root=etree.fromstring(z.read('word/document.xml'))
    supers=root.xpath('//w:r[w:rPr/w:vertAlign[@w:val="superscript"]]/w:t/text()',namespaces=ns)
    assert len(supers)>20 and all(re.fullmatch(r'[\d,–]+',s) for s in supers)
    assert not re.search(r'\[\d+(?:,\s*\d+)*\]',''.join(root.xpath('//w:t/text()',namespaces=ns)))
    assert root.xpath('//w:r[w:rPr/w:i]/w:t/text()',namespaces=ns)
    items=[d['abstract']]+[p for ss in d['pages'].values() for s in ss for p in s['paragraphs'] if not p.startswith(('Δx_i','Δz_j','ΔW ='))]
    captions=list(d['captions'].values())+[t['caption'] for t in d['tables'].values()]
    for kind,path in [('PDF',R/f'Health_value_AI_{lang.upper()}.pdf'),('Word',R/'qa'/f'Word_{lang.upper()}.pdf')]:
        pdf=PdfReader(path);text=norm(''.join(p.extract_text() for p in pdf.pages))
        assert len(pdf.pages)==14,(lang,kind,len(pdf.pages))
        assert all(expected(t) in text for t in items),(lang,kind,'prose missing')
        assert all(expected(t) in text for t in captions),(lang,kind,'caption missing')
        first=pdf.pages[0].extract_text()
        assert ('摘要' if lang=='zh' else 'Abstract') in first
        assert ('关键词' if lang=='zh' else 'Keywords') in first
        for page,ss in d['pages'].items():
            page_text=norm(pdf.pages[int(page)-1].extract_text())
            for s in ss:
                for p in s['paragraphs']:
                    if not p.startswith(('Δx_i','Δz_j','ΔW =')):assert expected(p) in page_text,(lang,kind,page,'page drift')
        report[lang+'_'+kind]={'pages':14,'full_prose_preserved':len(items),'captions_preserved':len(captions),'page_assignment':'passed','superscript_groups_docx':len(supers),'abstract_and_keywords':True}
for f in ['references.json','figure_data.csv','additional_evidence_data.csv']:
    assert (R/f).read_bytes()==(BASE/f).read_bytes()
assert len(NUM)==26
report['base_content_preserved']=True
report['citation_style']='Nature numbered superscript'
report['human_scientific_signoff']=False
(R/'qa'/'final_audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
