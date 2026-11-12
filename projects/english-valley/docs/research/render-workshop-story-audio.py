"""Append exact T01 story recordings. Preserve the existing score and stock casting."""
from pathlib import Path
import importlib.util, json, hashlib, wave, math
spec=importlib.util.spec_from_file_location('workshop_audio',Path(__file__).with_name('render-workshop-audio.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
manifest=json.loads((m.OUT/'workshop-manifest.json').read_text(encoding='utf-8'))
options=m.ort.SessionOptions();options.intra_op_num_threads=4;options.inter_op_num_threads=1
session=m.ort.InferenceSession(str(m.ROOT/'.audio-tools/models/kokoro-v1.0.int8.onnx'),sess_options=options,providers=['CPUExecutionProvider'])
kokoro=m.Kokoro.from_session(session,str(m.ROOT/'.audio-tools/models/voices-v1.0.bin'),espeak_config=m.EspeakConfig(lib_path=m.espeakng_loader.get_library_path(),data_path=m.espeakng_loader.get_data_path()))
metrics_path=m.OUT/'workshop-story-audio-metrics.json'
metrics=json.loads(metrics_path.read_text(encoding='utf-8')) if metrics_path.exists() else {}
for row in m.lines():
 ident,speaker,text=row['id'],row['speaker'],row['text']
 if ident in manifest['lines'] and manifest['lines'][ident]['text']==text:continue
 voice=manifest['voices'][speaker];print('Render',ident,speaker,flush=True)
 samples,sr=kokoro.create(text,voice=voice['voiceId'],speed=.98 if speaker=='IRIS' else .96,lang=voice['language'])
 samples=m.np.asarray(samples,dtype=m.np.float32).flatten();assert m.np.isfinite(samples).all() and len(samples)>sr*.35
 edge=min(int(sr*.008),len(samples)//2);samples[:edge]*=m.np.linspace(0,1,edge);samples[-edge:]*=m.np.linspace(1,0,edge)
 samples*=min(1.7,.78/max(float(m.np.max(m.np.abs(samples))),.001))
 path=m.OUT/'voice'/f'{ident}.wav'
 with wave.open(str(path),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes((samples*32767).astype('<i2').tobytes())
 metrics[ident]={'duration':len(samples)/sr,'peak':float(m.np.max(m.np.abs(samples))),'rms':float(m.np.sqrt(m.np.mean(samples*samples))),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
 manifest['lines'][ident]={'src':f'/audio/voice/{ident}.wav','speaker':speaker,'text':text,'voiceId':voice['voiceId'],'duration':round(len(samples)/sr,3),'origin':'project_original','direction':row['direction'],'source':'docs/design/v6/episodes/T01.md'}
manifest['status']='ready'
(m.OUT/'workshop-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(m.OUT/'workshop-story-audio-metrics.json').write_text(json.dumps(metrics,indent=2)+'\n',encoding='utf-8')
provenance=json.loads((m.OUT/'workshop-provenance.json').read_text(encoding='utf-8'))
provenance['scriptSha256']=hashlib.sha256(m.SCRIPT.read_bytes()).hexdigest()
provenance['recordedLines']=len(manifest['lines'])
provenance['storyExtension']='T01.027–046: empty stand, material histories, visitor interpretations and everyday reuse; original fictional dialogue.'
(m.OUT/'workshop-provenance.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Saved',len(metrics),'new recordings; total',len(manifest['lines']),flush=True)
