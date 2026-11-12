"""Validate bundled audio and editorial coverage; no subjective listening claim."""
from pathlib import Path
import hashlib,json,wave,math,sys
import numpy as np
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(Path(__file__).parent))
# Read the authoritative contract independently; no model load is needed.
flow=json.loads((ROOT/'docs/design/v6/first-journey-flow-v6_1.json').read_text(encoding='utf-8'))
index=json.loads((ROOT/'docs/design/v6/dialogue-reference-index.json').read_text(encoding='utf-8'))
rows={row['id']:row for row in index['tableLines']}
ids=set()
for cues in [*[n['dialogue'] for n in flow['nodes']],flow.get('globalDialogue',[])]:
    for cue in cues:
        if cue['kind']!='optional_learner_support':ids.update(cue['ids'])
base=ROOT/'app/public/audio'
manifest=json.loads((base/'manifest.json').read_text(encoding='utf-8'))
assert ids <= set(manifest['lines'])
assert len(manifest['voices'])==5
assert len({v['voiceId'] for v in manifest['voices'].values()})==5
for ident in ids:
    assert manifest['lines'][ident]['text']==rows[ident]['english']
    assert manifest['lines'][ident]['speaker']==rows[ident]['speaker']
files={}
for group in ['lines','music','ambience']:
    for entry in manifest[group].values():
        path=ROOT/'app/public'/entry['src'].lstrip('/')
        with wave.open(str(path)) as f:
            sr,ch,n,width=f.getframerate(),f.getnchannels(),f.getnframes(),f.getsampwidth()
            assert width==2
            pcm=np.frombuffer(f.readframes(n),dtype='<i2').astype(np.float32)/32768
        assert n>sr*.3 and np.isfinite(pcm).all()
        assert float(np.max(np.abs(pcm)))<.99
        assert float(np.sqrt(np.mean(pcm*pcm)))>.01
        files[entry['src']]={'seconds':round(n/sr,3),'sampleRate':sr,'channels':ch,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size}
assert len({manifest['music'][key]['src'] for key in ['arrival','bridge','upper','greenhouse','model','reflection']})==6
report={'date':'2026-11-08','status':'passed_asset_structure_and_signal_checks','performedDialogueCovered':len(ids),'originalArrivals':len(manifest['lines'])-len(ids),'distinctVoiceEmbeddings':5,'uniqueMusicFiles':6,'ambienceFiles':2,'fileCount':len(files),'totalBytes':sum(x['bytes'] for x in files.values()),'files':files,'limits':'Metadata, exact script text and digital signal checks; not human listening, pronunciation certification, final acting or classroom intelligibility validation.'}
(base/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='files'},ensure_ascii=False))
