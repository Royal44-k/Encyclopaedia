"""Assert source/manifest identity and PCM integrity; never claims human audition."""
from pathlib import Path
import re, json, math, hashlib, wave, array

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'app/public/audio'
manifest = json.loads((OUT/'workshop-manifest.json').read_text(encoding='utf-8'))
expected = {}
for line in (ROOT/'docs/design/v6/episodes/T01.md').read_text(encoding='utf-8').splitlines():
    cols = [c.strip() for c in line.strip('|').split('|')]
    if len(cols) >= 4 and re.fullmatch(r'T01\.\d{3}', cols[0]) and cols[1] != 'LEARNER':
        expected[cols[0]] = (cols[1], cols[2])
assert manifest['status'] == 'ready'
assert set(expected) == set(manifest['lines']) and len(expected) == 39
metrics = {}
for ident, row in manifest['lines'].items():
    assert (row['speaker'], row['text']) == expected[ident], ident
    assert row['voiceId'] == manifest['voices'][row['speaker']]['voiceId'], ident
    assert row['speaker'] != 'LEARNER'
    assert row['origin'] == 'project_original'
for ident, row in {**manifest['lines'], **manifest['music']}.items():
    path = ROOT/'app/public'/row['src'].lstrip('/')
    with wave.open(str(path),'rb') as f:
        sr, channels, width = f.getframerate(), f.getnchannels(), f.getsampwidth()
        data = array.array('h',f.readframes(f.getnframes()))
    assert width == 2 and channels in (1,2), ident
    assert sr == (24000 if ident.startswith('T01.') else 32000), ident
    peak = max(abs(v) for v in data)/32768
    rms = math.sqrt(sum(float(v)*v for v in data)/len(data))/32768
    assert .005 < peak < .99 and rms > .001, (ident, peak, rms)
    assert len(data)/channels/sr > .35, ident
    metrics[ident] = {'src':row['src'],'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
        'sampleRate':sr,'channels':channels,'seconds':round(len(data)/channels/sr,3),
        'peakDbFS':round(20*math.log10(peak),2),'rmsDbFS':round(20*math.log10(rms),2)}
    if not ident.startswith('T01.'):
        seam = max(abs(data[channel]-data[-channels+channel])/32768 for channel in range(channels))
        assert seam < .08, (ident, seam)
        metrics[ident]['loopSeamSampleDelta'] = round(seam,6)
assert len({v['voiceId'] for v in manifest['voices'].values()}) == 3
assert manifest['voices']['IRIS']['voiceId'] not in ('am_michael','af_heart','bf_emma','am_puck','bm_george')
assert metrics['workshop']['sha256'] != metrics['workshop_display']['sha256']

# A short actual-recording audition reel, Sam then Iris then their replies.
with wave.open(str(OUT/'workshop-voice-preview.wav'),'wb') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(24000)
    for ident in ['T01.027','T01.028','T01.029','T01.032','T01.044','T01.045']:
        with wave.open(str(OUT/'voice'/f'{ident}.wav'),'rb') as source:
            f.writeframes(source.readframes(source.getnframes()))
        f.writeframes(b'\0\0'*24000)

report={'date':'2026-11-08','status':'passed_text_identity_and_signal_checks','recordedLines':len(expected),
    'learnerLinesRecorded':0,'castVoices':3,'newVoiceIdentity':'IRIS:af_bella','newMusicFiles':2,
    'files':metrics,'totalBytes':sum(m['bytes'] for m in metrics.values()),
    'subjectiveListening':False,'teacherPronunciationApproval':False}
(OUT/'workshop-validation.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='files'}))
