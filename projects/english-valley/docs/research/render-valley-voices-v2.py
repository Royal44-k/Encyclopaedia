"""Offline stock-voice recordings; exact editorial words, never cloned voices."""
from pathlib import Path
import json, sys, wave, math, hashlib, time
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'.audio-tools/python'))
import numpy as np
import onnxruntime as ort
import espeakng_loader
from kokoro_onnx import Kokoro
from kokoro_onnx.config import EspeakConfig

OUT=ROOT/'app/public/audio'
ARRIVALS={
'C1.A01': 'The water looks different here. Keep this view in mind when you return to the bridge.',
'C1.A02': 'A shallow channel runs from the flower bed towards the stream. Follow it with your eyes.',
'C1.A03': 'Mei was working here before the rain. What would you like to ask her?',
'C1.A04': 'Take a closer look at the cover. Which part of the bed would you protect?',
'C1.A05': 'Your notes are safe. There is still a question to come back to.',
'C1.A06': 'Both trays start in the same way. Choose a position and watch what happens.'}

def script_lines():
    flow=json.loads((ROOT/'docs/design/v6/first-journey-flow-v6_1.json').read_text(encoding='utf-8'))
    index=json.loads((ROOT/'docs/design/v6/dialogue-reference-index.json').read_text(encoding='utf-8'))
    rows={row['id']:row for row in index['tableLines']}
    ids=set()
    for cues in [*[n['dialogue'] for n in flow['nodes']],flow.get('globalDialogue',[])]:
        for cue in cues:
            if cue['kind']!='optional_learner_support':ids.update(cue['ids'])
    result=[rows[i] for i in sorted(ids)]
    result += [{'id':i,'speaker':'NARR','english':text,'origin':'project_original_arrival'} for i,text in ARRIVALS.items()]
    return result

def main():
    manifest=json.loads((OUT/'manifest.json').read_text(encoding='utf-8'))
    options=ort.SessionOptions();options.intra_op_num_threads=4;options.inter_op_num_threads=1
    session=ort.InferenceSession(str(ROOT/'.audio-tools/models/kokoro-v1.0.int8.onnx'),sess_options=options,providers=['CPUExecutionProvider'])
    kokoro=Kokoro.from_session(session,str(ROOT/'.audio-tools/models/voices-v1.0.bin'),espeak_config=EspeakConfig(lib_path=espeakng_loader.get_library_path(),data_path=espeakng_loader.get_data_path()))
    speeds={'NOOR':1.00,'ROWAN':.96,'MEI':.97,'SAM':.96,'NARR':.96}
    metrics={}
    for row in script_lines():
        ident,speaker,text=row['id'],row['speaker'],row['english']
        voice=manifest['voices'][speaker]
        path=OUT/'voice'/f'{ident}.wav'
        print('Rendering',ident,speaker,voice['voiceId'],flush=True)
        started=time.monotonic()
        samples,sr=kokoro.create(text,voice=voice['voiceId'],speed=speeds[speaker],lang=voice['language'])
        samples=np.array(samples,dtype=np.float32).flatten()
        assert np.isfinite(samples).all() and len(samples)>sr*.35,ident
        # Gentle edge taper and fixed peak headroom; do not alter words or pitch.
        n=min(int(sr*.008),len(samples)//2)
        samples[:n]*=np.linspace(0,1,n);samples[-n:]*=np.linspace(1,0,n)
        peak=np.max(np.abs(samples));samples*=min(1.7,.78/max(float(peak),.001))
        pcm=(samples*32767).astype('<i2')
        with wave.open(str(path),'wb') as f:
            f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes(pcm.tobytes())
        metrics[ident]={'duration':round(len(samples)/sr,3),'sampleRate':sr,'peakDbFS':round(20*math.log10(max(float(np.max(np.abs(samples))),1e-8)),2),'rmsDbFS':round(20*math.log10(max(float(np.sqrt(np.mean(samples*samples))),1e-8)),2),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'renderSeconds':round(time.monotonic()-started,2)}
        manifest['lines'][ident]={'src':f'/audio/voice/{ident}.wav','speaker':speaker,'text':text,'voiceId':voice['voiceId'],'duration':metrics[ident]['duration'],'origin':row['origin']}
        (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    manifest['status']='ready';manifest['engine']='offline_kokoro_onnx_stock_voices'
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (OUT/'voice-metrics.json').write_text(json.dumps(metrics,indent=2)+'\n',encoding='utf-8')
    print('Completed',len(metrics),'verbatim clips',flush=True)

if __name__=='__main__':main()
