"""T02 asset identity/signal checks and an actual-recording audition file."""
from pathlib import Path
import re,json,math,hashlib,wave,array
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'app/public/audio'
manifest=json.loads((OUT/'night-manifest.json').read_text(encoding='utf-8'))
expected={}
for line in (ROOT/'docs/design/v6/episodes/T02.md').read_text(encoding='utf-8').splitlines():
    c=[s.strip() for s in line.strip('|').split('|')]
    if len(c)>=4 and re.fullmatch(r'T02\.\d{3}',c[0]) and c[1]!='LEARNER':expected[c[0]]=(c[1],c[2])
assert manifest['status']=='ready' and set(manifest['lines'])==set(expected) and len(expected)==16
for ident,row in manifest['lines'].items():
    assert (row['speaker'],row['text'])==expected[ident]
    assert row['voiceId']==manifest['voices'][row['speaker']]['voiceId']
metrics={}
allfiles={**manifest['lines'],**manifest['music'],**manifest['ambience'],**manifest['effects']}
for ident,row in allfiles.items():
    path=ROOT/'app/public'/row['src'].lstrip('/')
    with wave.open(str(path),'rb') as f:
        sr,ch,width=f.getframerate(),f.getnchannels(),f.getsampwidth()
        data=array.array('h',f.readframes(f.getnframes()))
    assert width==2 and ch in (1,2)
    assert sr==(32000 if ident in manifest['music'] or ident in manifest['ambience'] else 24000)
    peak=max(abs(v) for v in data)/32768;rms=math.sqrt(sum(float(v)*v for v in data)/len(data))/32768
    assert .005<peak<.99 and rms>.001,(ident,peak,rms)
    metrics[ident]=dict(src=row['src'],bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest(),sampleRate=sr,channels=ch,seconds=round(len(data)/ch/sr,3),peakDbFS=round(20*math.log10(peak),2),rmsDbFS=round(20*math.log10(rms),2))
    if ident in manifest['music'] or ident in manifest['ambience']:
        seam=max(abs(data[c]-data[-ch+c])/32768 for c in range(ch));assert seam<.08,(ident,seam)
        metrics[ident]['loopSeamSampleDelta']=round(seam,6)
assert len({v['voiceId'] for v in manifest['voices'].values()})==4
assert metrics['tap']['sha256']!=metrics['creak']['sha256']
assert metrics['night']['sha256']!=metrics['night_reflection']['sha256']
with wave.open(str(OUT/'night-voice-preview.wav'),'wb') as output:
    output.setnchannels(1);output.setsampwidth(2);output.setframerate(24000)
    for path in ['voice/T02.003.wav','voice/T02.006.wav','voice/T02.013.wav','effects/night_tap.wav','effects/night_creak.wav']:
        with wave.open(str(OUT/path),'rb') as source:output.writeframes(source.readframes(source.getnframes()))
        output.writeframes(b'\0\0'*24000)
report=dict(date='2026-11-08',status='passed_text_identity_and_signal_checks',recordedLines=16,learnerLinesRecorded=0,castVoices=4,newMusicFiles=2,newAmbienceFiles=1,newEffects=2,files=metrics,totalBytes=sum(v['bytes'] for v in metrics.values()),subjectiveListening=False,teacherPronunciationApproval=False)
(OUT/'night-validation.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='files'}))
