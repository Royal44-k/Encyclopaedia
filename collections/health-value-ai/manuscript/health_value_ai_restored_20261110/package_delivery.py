from pathlib import Path
import hashlib,json,zipfile

root=Path(__file__).resolve().parent
archive=root/'Health_value_AI_restored_20261110.zip'
qa_names={'checks.json','final_audit.json','visual_review.md'}
files=[]
for file in sorted(root.rglob('*')):
    if not file.is_file():continue
    rel=file.relative_to(root)
    if '__pycache__' in rel.parts or file.suffix=='.zip' or file.name=='MANIFEST.json':continue
    if rel.parts[0]=='qa' and (len(rel.parts)!=2 or file.name not in qa_names):continue
    files.append(file)
required=[root/f'Health_value_AI_{lang}.{ext}' for lang in ['EN','ZH'] for ext in ['pdf','docx']]
assert all(f in files for f in required)
assert (root/'qa'/'visual_review.md').is_file()
manifest={f.relative_to(root).as_posix():{'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in files}
mf=root/'MANIFEST.json'
mf.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as package:
    for f in files+[mf]:package.write(f,arcname=f.relative_to(root).as_posix())
with zipfile.ZipFile(archive) as package:
    assert package.testzip() is None
    assert all(f.name in package.namelist() for f in required)
print(json.dumps({'archive':str(archive),'files':len(files)+1,'bytes':archive.stat().st_size,'integrity':'passed'},ensure_ascii=False))
