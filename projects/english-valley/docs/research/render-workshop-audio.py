"""Render T01's exact editorial NPC dialogue and two original score loops locally.

Does not rewrite the existing C1 audio manifest, recordings or music.
"""
from pathlib import Path
import json, sys, wave, math, hashlib, time, re, importlib.util

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '.audio-tools/python'))
import numpy as np
import onnxruntime as ort
import espeakng_loader
from kokoro_onnx import Kokoro
from kokoro_onnx.config import EspeakConfig

OUT = ROOT / 'app/public/audio'
SCRIPT = ROOT / 'docs/design/v6/episodes/T01.md'

def lines():
    rows = []
    for line in SCRIPT.read_text(encoding='utf-8').splitlines():
        cells = [cell.strip() for cell in line.strip('|').split('|')]
        if len(cells) >= 4 and re.fullmatch(r'T01\.\d{3}', cells[0]) and cells[1] != 'LEARNER':
            rows.append({'id': cells[0], 'speaker': cells[1], 'text': cells[2], 'direction': cells[3]})
    assert len(rows) >= 19 and len({row['id'] for row in rows}) == len(rows)
    return rows

def main():
    base = json.loads((OUT / 'manifest.json').read_text(encoding='utf-8'))
    manifest = {
        'schemaVersion': 1, 'module': 'T01', 'status': 'rendering',
        'engine': 'offline_kokoro_onnx_stock_voices',
        'voices': {
            'SAM': base['voices']['SAM'], 'NARR': base['voices']['NARR'],
            'IRIS': {'name': 'Bella', 'voiceId': 'af_bella', 'language': 'en-us',
                     'direction': 'Interested, thoughtful student companion; stock voice casting preview, not a claimed child actor.'},
        },
        'lines': {}, 'music': {}, 'ambience': {},
        'provenance': '/audio/workshop-provenance.json',
    }
    metrics = {}
    options = ort.SessionOptions()
    options.intra_op_num_threads = 4
    options.inter_op_num_threads = 1
    session = ort.InferenceSession(str(ROOT / '.audio-tools/models/kokoro-v1.0.int8.onnx'),
                                  sess_options=options, providers=['CPUExecutionProvider'])
    kokoro = Kokoro.from_session(session, str(ROOT / '.audio-tools/models/voices-v1.0.bin'),
        espeak_config=EspeakConfig(lib_path=espeakng_loader.get_library_path(), data_path=espeakng_loader.get_data_path()))
    available = kokoro.get_voices()
    assert all(v['voiceId'] in available for v in manifest['voices'].values())
    speeds = {'SAM': .96, 'IRIS': 1.00, 'NARR': .96}
    for row in lines():
        ident, speaker, text = row['id'], row['speaker'], row['text']
        voice = manifest['voices'][speaker]
        path = OUT / 'voice' / f'{ident}.wav'
        print('Rendering', ident, speaker, voice['voiceId'], flush=True)
        started = time.monotonic()
        samples, sr = kokoro.create(text, voice=voice['voiceId'], speed=speeds[speaker], lang=voice['language'])
        samples = np.asarray(samples, dtype=np.float32).flatten()
        assert np.isfinite(samples).all() and len(samples) > sr * .35, ident
        edge = min(int(sr * .008), len(samples) // 2)
        samples[:edge] *= np.linspace(0, 1, edge)
        samples[-edge:] *= np.linspace(1, 0, edge)
        samples *= min(1.7, .78 / max(float(np.max(np.abs(samples))), .001))
        pcm = (samples * 32767).astype('<i2')
        with wave.open(str(path), 'wb') as f:
            f.setnchannels(1); f.setsampwidth(2); f.setframerate(sr); f.writeframes(pcm.tobytes())
        metrics[ident] = {'duration': round(len(samples)/sr, 3), 'sampleRate': sr, 'channels': 1,
            'peakDbFS': round(20*math.log10(max(float(np.max(np.abs(samples))), 1e-8)), 2),
            'rmsDbFS': round(20*math.log10(max(float(np.sqrt(np.mean(samples*samples))), 1e-8)), 2),
            'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
            'renderSeconds': round(time.monotonic()-started, 2)}
        manifest['lines'][ident] = {'src': f'/audio/voice/{ident}.wav', 'speaker': speaker, 'text': text,
            'voiceId': voice['voiceId'], 'duration': metrics[ident]['duration'], 'origin': 'project_original',
            'direction': row['direction'], 'source': 'docs/design/v6/episodes/T01.md'}
        (OUT / 'workshop-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

    # Reuse only the synthesis functions; render newly authored note sequences.
    spec = importlib.util.spec_from_file_location('valley_score', Path(__file__).with_name('compose-valley-score-v2.py'))
    score = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(score)
    compositions = {
        'workshop': {
            'title': 'An idea without a name', 'bpm': 86, 'lead': 'wood', 'texture': 'arpeggio',
            'chords': [[43,50,57,62],[47,54,57,62],[48,55,59,64],[45,52,59,64]],
            'melody': [(0,74,.7,.13),(1.5,69,.7,.08),(3,71,.9,.1),(5.5,74,1.2,.12),
                       (8,78,.6,.08),(10.5,74,1.1,.1),(13,71,.9,.09),(16.5,76,.8,.11),
                       (18,74,.7,.08),(20,71,1.3,.1),(24,69,.7,.085),(26,67,1.3,.09),(29,69,1.7,.07)],
            'gain': .63, 'instruments': 'Wooden mallets, quietly plucked strings and suspended bass'},
        'workshop_display': {
            'title': 'A different side', 'bpm': 72, 'lead': 'felt', 'texture': 'breathing',
            'chords': [[43,50,57,62],[48,55,59,64],[47,54,57,62],[45,52,59,64]],
            'melody': [(1,74,1.8,.1),(5,71,2,.08),(9,76,1.6,.09),(13.5,74,1.8,.08),
                       (18,71,2.4,.08),(22.5,69,2,.075),(27,67,2.4,.07),(30,69,1.2,.05)],
            'gain': .54, 'instruments': 'Sparse felt piano and slow bowed harmony'},
    }
    for name, c in compositions.items():
        metrics[name] = score.render_score(name,c['bpm'],c['chords'],c['melody'],c['lead'],c['texture'])
        manifest['music'][name] = {'src': f'/audio/music/{name}.wav', 'gain': c['gain'],
            'ambience': 'garden', 'origin': 'project_original_composition', 'title': c['title'],
            'tempoBpm': c['bpm'], 'instruments': c['instruments']}
    manifest['status'] = 'ready'
    (OUT / 'workshop-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n', encoding='utf-8')
    (OUT / 'workshop-audio-metrics.json').write_text(json.dumps(metrics,indent=2)+'\n', encoding='utf-8')
    provenance = {
        'module': 'T01', 'date': '2026-11-08', 'dialogueSource': 'docs/design/v6/episodes/T01.md',
        'scriptSha256': hashlib.sha256(SCRIPT.read_bytes()).hexdigest(),
        'dialogueOrigin': 'Project original, not a textbook quotation',
        'voiceModel': 'https://huggingface.co/hexgrad/Kokoro-82M',
        'stockVoiceTable': 'https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md',
        'localInference': 'https://github.com/thewh1teagle/kokoro-onnx',
        'licenses': ['/audio/licenses/Kokoro-Apache-2.0.txt','/audio/licenses/Kokoro-ONNX-MIT.txt'],
        'recordings': 'Offline synthesized stock voices, no specific person cloned',
        'music': 'Two original note sequences with procedural timbres; no third-party samples',
        'borrowedAmbience': 'Existing original garden ambience; no new duplicate audio file',
        'humanAudition': False, 'teacherApproval': False,
        'cautions': ['Short-utterance generation has known quality limits; waveform checks are not pronunciation review.',
                     'Iris uses a distinct stock voice; this does not establish perceived age or acting quality.'],
    }
    (OUT / 'workshop-provenance.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n', encoding='utf-8')
    print('Ready:', len(manifest['lines']), 'recorded lines,',len(manifest['music']),'original music loops', flush=True)

if __name__ == '__main__':
    main()
