"""Prepare design assets only; no app or renderer. Preserve the vendor originals."""
from pathlib import Path
import json, struct, hashlib, wave

ROOT = Path(__file__).resolve().parents[2]
source = ROOT / 'assets/vendor/kenney-nature/Models/GLTF format'
target = ROOT / 'assets/models/nature-sage'
target.mkdir(parents=True, exist_ok=True)
names = ['tree_default', 'tree_detailed', 'tree_oak', 'tree_cone',
         'tree_pineDefaultA', 'tree_pineTallA', 'tree_small', 'tree_tall',
         'plant_bush', 'plant_bushSmall', 'grass', 'grass_large',
         'flower_redA', 'flower_yellowA', 'flower_purpleA',
         'rock_largeA', 'rock_smallA', 'rock_smallFlatA',
         'lily_large', 'lily_small', 'bridge_wood', 'fence_simple']

def linear(hex_value):
    rgb = [int(hex_value[i:i+2], 16)/255 for i in (1, 3, 5)]
    return [(c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4) for c in rgb] + [1]

def tint(name):
    n = name.lower()
    if n == 'colorred': return '#CFA5AA'
    if n == 'coloryellow': return '#D6C781'
    if n == 'colorpurple': return '#9294AC'
    if n == '_defaultmat': return '#A5AA98'
    if 'flower' in n or 'petal' in n:
        if 'red' in n: return '#CFA5AA'
        if 'yellow' in n: return '#D6C781'
        if 'purple' in n: return '#9294AC'
    if 'wood' in n or 'bark' in n: return '#A77D50'
    if 'rock' in n or 'stone' in n: return '#A5AA98'
    if 'leaf' in n and 'dark' in n: return '#58664B'
    if 'leaf' in n or 'grass' in n or 'green' in n: return '#87947A'
    if 'dirt' in n or 'sand' in n: return '#A29372'
    return None

records = []
for name in names:
    path = source / (name + '.glb')
    if not path.exists(): raise FileNotFoundError(path)
    data = path.read_bytes()
    magic, version, length = struct.unpack_from('<4sII', data)
    assert magic == b'glTF' and version == 2 and length == len(data)
    chunks, pos = [], 12
    while pos < len(data):
        size, typ = struct.unpack_from('<I4s', data, pos)
        payload = data[pos+8:pos+8+size]
        if typ == b'JSON':
            doc = json.loads(payload)
            for material in doc.get('materials', []):
                pbr = material.setdefault('pbrMetallicRoughness', {})
                pbr['metallicFactor'], pbr['roughnessFactor'] = 0, 0.88
                color = tint(material.get('name', ''))
                if color: pbr['baseColorFactor'] = linear(color)
            payload = json.dumps(doc, separators=(',', ':')).encode()
            payload += b' ' * ((-len(payload)) % 4)
        chunks.append(struct.pack('<I4s', len(payload), typ) + payload)
        pos += size + 8
    body = b''.join(chunks)
    out = target / path.name
    out.write_bytes(struct.pack('<4sII', b'glTF', 2, len(body)+12) + body)
    records.append({'file': str(out.relative_to(ROOT)).replace('\\','/'),
                    'bytes': out.stat().st_size,
                    'sha256': hashlib.sha256(out.read_bytes()).hexdigest(),
                    'source': str(path.relative_to(ROOT)).replace('\\','/'),
                    'changes': 'matte roughness, zero metalness, selected palette colors converted from sRGB to linear'})
(target/'selection.json').write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')
audio = ROOT/'assets/audio/pond-report-en-US-prototype.wav'
with wave.open(str(audio)) as wav:
    audio_info = {'durationSeconds': round(wav.getnframes()/wav.getframerate(),2),
                  'sampleRate': wav.getframerate(), 'channels': wav.getnchannels()}
print(json.dumps({'selectedModels':len(records), 'modelBytes':sum(r['bytes'] for r in records), 'audio':audio_info}))
