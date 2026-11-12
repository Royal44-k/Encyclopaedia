"""Download official release assets in validated HTTP ranges to a local tools cache."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor,as_completed
import urllib.request,json,math,os,sys
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'.audio-tools/models'
BASE.mkdir(parents=True,exist_ok=True)
headers={'User-Agent':'English-Valley-asset-preparation','Accept-Encoding':'identity'}
req=urllib.request.Request('https://api.github.com/repos/thewh1teagle/kokoro-onnx/releases/tags/model-files-v1.0',headers=headers)
with urllib.request.urlopen(req,timeout=30) as r: data=json.load(r)
name=sys.argv[1] if len(sys.argv)>1 else 'kokoro-v1.0.int8.onnx'
assert name in ['kokoro-v1.0.int8.onnx','voices-v1.0.bin']
asset=next(a for a in data['assets'] if a['name']==name)
size=asset['size'];url=asset['browser_download_url'];chunk=4*1024*1024
req=urllib.request.Request(url,headers={**headers,'Range':'bytes=0-1023'})
with urllib.request.urlopen(req,timeout=60) as r:
    assert r.status==206,(r.status,r.headers)
    direct=r.geturl();assert len(r.read())==1024
print('Validated official ranged download',asset['name'],size,flush=True)
def fetch(i):
    start=i*chunk;end=min(size-1,start+chunk-1)
    path=BASE/f'{name}.part{i:03d}'
    if path.exists() and path.stat().st_size==end-start+1:return i
    req=urllib.request.Request(direct,headers={**headers,'Range':f'bytes={start}-{end}'})
    with urllib.request.urlopen(req,timeout=90) as r:
        assert r.status==206
        with path.open('wb') as f:
            while block:=r.read(128*1024):f.write(block)
    assert path.stat().st_size==end-start+1
    print('part',i,'ready',flush=True);return i
count=math.ceil(size/chunk)
with ThreadPoolExecutor(max_workers=8) as ex:
    for f in as_completed([ex.submit(fetch,i) for i in range(count)]):f.result()
dest=BASE/name
with dest.open('wb') as out:
    for i in range(count):
        part=BASE/f'{name}.part{i:03d}'
        with part.open('rb') as f:
            while block:=f.read(1024*1024):out.write(block)
        part.unlink()
assert dest.stat().st_size==size
(BASE/f'{name}.release.json').write_text(json.dumps({'id':asset['id'],'name':asset['name'],'size':size,'digest':asset.get('digest'),'url':url},indent=2)+'\n',encoding='utf-8')
print('Model ready',size,flush=True)
