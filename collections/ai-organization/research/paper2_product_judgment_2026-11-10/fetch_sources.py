from pathlib import Path
import json, urllib.request, urllib.parse, concurrent.futures, re
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'source_checks';OUT.mkdir(exist_ok=True)
DOIS=['10.1002/smj.3580','10.1287/orsc.2023.17590','10.1287/mnsc.2021.4209','10.1287/mnsc.1080.0877','10.1287/mnsc.2024.06909','10.1109/TEM.2024.3484750','10.3724/SP.J.1042.2026.2121','10.1016/j.jbusres.2018.01.063','10.1037/0022-0663.95.2.393','10.1509/jm.14.0057']
URLS={f'crossref_{i+1:02}':'https://api.crossref.org/works/'+urllib.parse.quote(d,safe='/') for i,d in enumerate(DOIS)}
URLS.update({'kostis':'https://biopen.bi.no/bi-xmlui/bitstream/handle/11250/3172555/Too%20much%20AI%20Hype_2024.pdf?isAllowed=y&sequence=4','tao':'https://journal.psych.ac.cn/xlkxjz/CN/abstract/abstract7912.shtml','transfer':'https://groups.psych.northwestern.edu/gentner/papers/GentnerLoewensteinThompson03.pdf'})
def fetch(k,u):
    try:
        req=urllib.request.Request(u,headers={'User-Agent':'AcademicResearch/1.0'})
        with urllib.request.urlopen(req,timeout=30) as f:b=f.read();ct=f.headers.get('Content-Type','');url=f.url
        suffix='.pdf' if b.startswith(b'%PDF') else '.json' if 'json' in ct else '.html'
        (OUT/(k+suffix)).write_bytes(b)
        rec={'key':k,'url':u,'resolved_url':url,'status':'saved','bytes':len(b),'file':k+suffix}
        if k.startswith('crossref'):
            m=json.loads(b)['message'];rec.update(title=m.get('title'),authors=[a.get('given','')+' '+a.get('family','') for a in m.get('author',[])],year=m.get('published'),volume=m.get('volume'),issue=m.get('issue'),page=m.get('page'))
        if k=='tao':rec['pdf_links']=re.findall(r'(?:href|src)=[\"\']([^\"\']*(?:pdf|PDF|getPDF)[^\"\']*)',b.decode('utf-8','ignore'))
        if suffix=='.pdf':
            import fitz
            doc=fitz.open(stream=b,filetype='pdf');s='\n'.join(f'\nPAGE {i+1}\n'+p.get_text() for i,p in enumerate(doc));(OUT/(k+'.txt')).write_text(s,encoding='utf-8');rec['pages']=len(doc)
        return rec
    except Exception as e:return {'key':k,'url':u,'status':'failed','error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:results=list(pool.map(lambda kv:fetch(*kv),URLS.items()))
(OUT/'log.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(results,ensure_ascii=False,indent=2))
