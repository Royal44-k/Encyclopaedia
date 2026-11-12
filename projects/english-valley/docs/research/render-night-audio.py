"""T02 exact NPC recordings and original dusk score/source sounds, rendered locally."""
from pathlib import Path
import json, sys, re, wave, math, hashlib, importlib.util, time
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'.audio-tools/python'))
import numpy as np
import onnxruntime as ort
import espeakng_loader
from kokoro_onnx import Kokoro
from kokoro_onnx.config import EspeakConfig
OUT=ROOT/'app/public/audio'
SCRIPT=ROOT/'docs/design/v6/episodes/T02.md'

def lines():
    result=[]
    for row in SCRIPT.read_text(encoding='utf-8').splitlines():
        cells=[s.strip() for s in row.strip('|').split('|')]
        if len(cells)>=4 and re.fullmatch(r'T02\.\d{3}',cells[0]) and cells[1]!='LEARNER':
            result.append(dict(id=cells[0],speaker=cells[1],text=cells[2],direction=cells[3]))
    assert len(result)==16
    return result

def write_mono(path,samples,sr=24000,peak=.62):
    samples=np.asarray(samples,dtype=np.float32).flatten()
    assert np.isfinite(samples).all() and len(samples)>sr*.1
    n=min(int(sr*.006),len(samples)//2)
    samples[:n]*=np.linspace(0,1,n);samples[-n:]*=np.linspace(1,0,n)
    samples*=min(1.7,peak/max(float(np.max(np.abs(samples))),.0001))
    pcm=(samples*32767).astype('<i2');path.parent.mkdir(parents=True,exist_ok=True)
    with wave.open(str(path),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes(pcm.tobytes())
    return dict(duration=round(len(samples)/sr,3),sampleRate=sr,channels=1,
        peakDbFS=round(20*math.log10(max(float(np.max(np.abs(samples))),1e-9)),2),
        rmsDbFS=round(20*math.log10(max(float(np.sqrt(np.mean(samples*samples))),1e-9)),2),
        bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest())

def main():
    base=json.loads((OUT/'manifest.json').read_text(encoding='utf-8'))
    manifest=dict(schemaVersion=1,module='T02',status='rendering',engine='offline_kokoro_onnx_stock_voices',
        voices={role:base['voices'][role] for role in ['ROWAN','MEI','SAM','NARR']},lines={},music={},ambience={},effects={},provenance='/audio/night-provenance.json')
    options=ort.SessionOptions();options.intra_op_num_threads=4;options.inter_op_num_threads=1
    session=ort.InferenceSession(str(ROOT/'.audio-tools/models/kokoro-v1.0.int8.onnx'),sess_options=options,providers=['CPUExecutionProvider'])
    kokoro=Kokoro.from_session(session,str(ROOT/'.audio-tools/models/voices-v1.0.bin'),espeak_config=EspeakConfig(lib_path=espeakng_loader.get_library_path(),data_path=espeakng_loader.get_data_path()))
    metrics={}
    for row in lines():
        ident,speaker,text=row['id'],row['speaker'],row['text'];voice=manifest['voices'][speaker]
        print('Recording',ident,speaker,flush=True);started=time.monotonic()
        samples,sr=kokoro.create(text,voice=voice['voiceId'],speed=.96,lang=voice['language'])
        metrics[ident]=write_mono(OUT/'voice'/f'{ident}.wav',samples,sr,.78)
        metrics[ident]['renderSeconds']=round(time.monotonic()-started,2)
        manifest['lines'][ident]=dict(src=f'/audio/voice/{ident}.wav',speaker=speaker,text=text,
            voiceId=voice['voiceId'],duration=metrics[ident]['duration'],origin='project_original',direction=row['direction'],source='docs/design/v6/episodes/T02.md')
    spec=importlib.util.spec_from_file_location('valley_score',Path(__file__).with_name('compose-valley-score-v2.py'))
    score=importlib.util.module_from_spec(spec);spec.loader.exec_module(score)
    compositions={
      'night':dict(title='Between the leaves',bpm=64,lead='felt',texture='breathing',
        chords=[[50,57,64,69],[48,55,62,67],[45,52,59,64],[43,50,57,62]],
        melody=[(1,69,1.5,.07),(7,72,2,.05),(12,67,2.5,.055),(18,64,2,.06),(25,67,2.6,.05),(29,69,1.8,.04)],gain=.42,
        instruments='Sparse soft piano and quiet open-string harmony; no alarm stings'),
      'night_reflection':dict(title='Two ordinary sounds',bpm=68,lead='guitar',texture='breathing',
        chords=[[43,50,59,62],[48,55,59,64],[45,52,59,64],[43,50,57,62]],
        melody=[(1,67,1.8,.08),(5.5,71,1.8,.065),(10,74,2.4,.06),(16,72,2,.055),(22,69,2.6,.06),(28,67,2,.045)],gain=.47,
        instruments='Soft plucked strings and relaxed sustained chords'),
    }
    for key,c in compositions.items():
        metrics[key]=score.render_score(key,c['bpm'],c['chords'],c['melody'],c['lead'],c['texture'])
        manifest['music'][key]=dict(src=f'/audio/music/{key}.wav',gain=c['gain'],ambience='night_wind',title=c['title'],tempoBpm=c['bpm'],instruments=c['instruments'],origin='project_original_composition')
    # Smooth periodic low-frequency wind, deliberately without clue-like impacts.
    sr=score.SR;n=sr*24;t=np.arange(n)/sr;rng=np.random.default_rng(2102)
    freq=np.fft.rfftfreq(n,1/sr);phase=rng.uniform(0,2*np.pi,len(freq))
    profile=np.exp(-freq/950)*np.minimum(freq/75,1)
    noise=np.fft.irfft(profile*np.exp(1j*phase),n=n);noise/=noise.std()
    envelope=.18+.024*np.sin(2*np.pi*t/12)+.017*np.sin(2*np.pi*t/8)
    wind=np.column_stack([noise*envelope,np.roll(noise,347)*envelope])
    metrics['night_wind']=score.write_wav(OUT/'ambience/night_wind.wav',wind)
    manifest['ambience']['night_wind']=dict(src='/audio/ambience/night_wind.wav',gain=.22,origin='project_original_synthesis')
    # One short contact per file; rhythm and source position are controlled by the world.
    sr=24000;t=np.arange(int(sr*.46))/sr
    tap=np.zeros_like(t)
    for frequency,amplitude,decay in [(940,1,17),(1527,.3,28),(2173,.12,42)]:
        tap+=amplitude*np.sin(2*np.pi*frequency*t)*np.exp(-t*decay)
    tap*=1-np.exp(-t*500)
    metrics['tap']=write_mono(OUT/'effects/night_tap.wav',tap,sr,.54)
    t=np.arange(int(sr*1.04))/sr
    phase=2*np.pi*np.cumsum(130+70*np.sin(np.pi*t/1.04)+17*np.sin(2*np.pi*5*t))/sr
    friction=(np.sin(phase)+.22*np.sin(phase*2.03)+.06*np.sin(phase*4.07))
    friction*=.45+.55*np.sin(2*np.pi*19*t+.3*np.sin(2*np.pi*3*t))**2
    grain=rng.normal(0,.09,len(t));grain=np.convolve(grain,np.ones(11)/11,mode='same')
    creak=(friction+grain)*np.sin(np.pi*t/1.04)**1.6
    metrics['creak']=write_mono(OUT/'effects/night_creak.wav',creak,sr,.46)
    for kind in ['tap','creak']:
        manifest['effects'][kind]=dict(src=f'/audio/effects/night_{kind}.wav',duration=metrics[kind]['duration'],origin='project_original_synthesis',description='A single light contact' if kind=='tap' else 'A single slow board-like friction sound')
    manifest['status']='ready'
    (OUT/'night-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (OUT/'night-audio-metrics.json').write_text(json.dumps(metrics,indent=2)+'\n',encoding='utf-8')
    provenance=dict(module='T02',date='2026-11-08',dialogueSource='docs/design/v6/episodes/T02.md',scriptSha256=hashlib.sha256(SCRIPT.read_bytes()).hexdigest(),
        dialogueOrigin='Project original; not textbook quotation or textbook mystery solution',voiceModel='https://huggingface.co/hexgrad/Kokoro-82M',
        localInference='https://github.com/thewh1teagle/kokoro-onnx',licenses=['/audio/licenses/Kokoro-Apache-2.0.txt','/audio/licenses/Kokoro-ONNX-MIT.txt'],
        roleContinuity='Existing Rowan/Mei/Sam/NARR stock voice embeddings, no identity cloning',
        music='Two original note sequences using procedural timbres; no third-party samples',
        effects='Original mono synthesis; contact timing belongs to the 3D scene, not this recording',
        ambience='Periodic low-frequency wind synthesis, no recorded location claim',humanAudition=False,teacherApproval=False)
    (OUT/'night-provenance.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('Ready',len(manifest['lines']),'NPC lines, 2 music loops, wind and two contact effects',flush=True)

if __name__=='__main__':main()
