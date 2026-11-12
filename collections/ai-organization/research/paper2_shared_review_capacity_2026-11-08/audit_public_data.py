"""Small, read-only feasibility probes of public AIDev metadata and samples."""
from pathlib import Path
import urllib.request, json, hashlib, datetime

ROOT = Path(__file__).resolve().parent
RAW = ROOT/'data_audit'; RAW.mkdir(exist_ok=True)
HEADERS = {'User-Agent':'Academic-feasibility-audit/1.0'}
def get(url,name,limit=2000000):
    req=urllib.request.Request(url,headers=HEADERS)
    try:
        with urllib.request.urlopen(req,timeout=40) as f:
            content=f.read(limit+1)
            if len(content)>limit:raise RuntimeError('Response exceeded audit size limit')
            status=f.status
        p=RAW/name;p.write_bytes(content)
        return {'url':url,'status':status,'path':p.name,'bytes':len(content),'sha256':hashlib.sha256(content).hexdigest()}
    except Exception as e:return {'url':url,'error':type(e).__name__+': '+str(e)}

record={'purpose':'Metadata and limited field feasibility only; no effect estimation', 'date':datetime.datetime.now().astimezone().isoformat(),'requests':[]}
record['requests'].append(get('https://huggingface.co/api/datasets/hao-li/AIDev/refs','refs.json'))
record['requests'].append(get('https://huggingface.co/api/datasets/hao-li/AIDev/tree/v3','tree_v3.json'))
record['requests'].append(get('https://huggingface.co/datasets/hao-li/AIDev/resolve/v3/README.md','README_v3.md'))
for config in ['pull_request','human_pull_request','pr_reviews','pr_timeline']:
    record['requests'].append(get('https://datasets-server.huggingface.co/rows?dataset=hao-li%2FAIDev&config='+config+'&split=train&offset=0&length=20',config+'_sample_main.json'))
(RAW/'request_log.json').write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
for item in record['requests']:
    print(json.dumps(item,ensure_ascii=False))
