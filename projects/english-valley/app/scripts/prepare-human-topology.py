"""Derive only clothed-character head and hand surfaces from the CC0 hm08 asset.

Run from app/. The downloaded upstream OBJ is retained for provenance in assets/vendor.
This is a geometry conversion, not the MakeHuman application or its source code.
"""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parents[2]
source = root / 'assets/vendor/makehuman/base.obj'
vertices, faces, group = [], [], ''
for line in source.read_text(encoding='utf-8').splitlines():
    if line.startswith('v '):
        vertices.append(list(map(float, line.split()[1:4])))
    elif line.startswith('g '):
        group = line[2:]
    elif line.startswith('f '):
        faces.append((group, [int(v.split('/')[0])-1 for v in line.split()[1:]]))

def extract(predicate, transform):
    polygons = [f for name, f in faces if name == 'body' and all(predicate(vertices[i]) for i in f)]
    ids = sorted({i for face in polygons for i in face})
    remap = {v:i for i,v in enumerate(ids)}
    return {
        'positions':[round(a,6) for i in ids for a in transform(vertices[i])],
        'indices':[remap[v] for face in polygons for k in range(1,len(face)-1) for v in (face[0],face[k],face[k+1])],
    }

head = extract(lambda v:v[1]>5.70, lambda v:[v[0]*.1,(v[1]-5.70)*.1,v[2]*.1])
# Remove the clavicle fringe while retaining a stable index order for authored hair.
indices = head['indices']
head['indices'] = [indices[j] for i in range(0,len(indices),3)
                   if all(head['positions'][indices[k]*3+1]>.038 for k in range(i,i+3))
                   for j in range(i,i+3)]
hand = extract(lambda v:v[0]>3.73 and v[1]<2.64 and v[2]>1.45,
               lambda v:[(v[0]-4.315)*.1,(v[1]-2.45)*.1,(v[2]-1.75)*.1])
data = {'source':'MakeHuman hm08 base mesh; CC0; derived head and hand only',
        'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'head':head,'hand':hand}
output = root/'app/src/world/human-topology.json'
output.write_text(json.dumps(data,separators=(',',':')),encoding='utf-8')
print(output)
