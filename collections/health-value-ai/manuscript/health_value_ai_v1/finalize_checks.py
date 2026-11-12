"""Finalize local packaging checks after actual page inspection."""
from pathlib import Path
import json, hashlib, re, subprocess, sys
from collections import Counter

root=Path(__file__).resolve().parent
skill=Path('C:/Users/lenovo/.codex/skills/scientific-writing/scripts')
for script,args,name in [
    ('validate_manifest.py',[str(root/'source_manifest.json'),'--kind','source'],'source_schema_check.json'),
    ('check_references.py',[str(root/'source_manifest.json')],'reference_syntax_check.json')]:
    result=subprocess.run([sys.executable,str(skill/script),*args],capture_output=True,text=True,encoding='utf-8')
    data=json.loads(result.stdout);assert data['status']=='pass',data
    (root/'qa'/name).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
audit=json.loads((root/'qa'/'claim_audit.json').read_text(encoding='utf-8-sig'))
codes=Counter(x['code'] for x in audit['issues'])
assert set(codes)=={'CLAIM_NOT_VERIFIED','UNVERIFIED_CITATION_MARKER','UNVERIFIED_CLAIM_EVIDENCE'},codes
checks=json.loads((root/'qa'/'document_checks.json').read_text(encoding='utf-8'))
assert checks['pages']==16
checks['visual_review']={'status':'completed','reviewer':'AI assistant visual inspection','date':'2026-11-06',
  'pages':list(range(1,17)),'final_changed_pages_reinspected':[13,15,16],
  'remaining_pages':'identical image hashes to the inspected preceding render',
  'scientific_author_approval':'not inferred'}
(root/'qa'/'document_checks.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf-8')
required=['Health_value_AI_Perspective.docx','Health_value_AI_Perspective.pdf','manuscript_en.md',
  '中文导读与修改说明.md','目标期刊建议.md','Supplementary_notes.md','README.md','质量检查记录.md',
  'references.json','reference_mapping.csv','claims.csv','source_manifest.json','scenario_arithmetic.json',
  'figure1_workflow.svg','figure1_workflow.png']
inventory=[]
for name in required:
    p=root/name;assert p.is_file() and p.stat().st_size>0,name
    inventory.append({'file':name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
missing=[]
for doc in ['README.md','中文导读与修改说明.md','目标期刊建议.md','Supplementary_notes.md','质量检查记录.md']:
    for link in re.findall(r'\]\(([^)]+)\)',(root/doc).read_text(encoding='utf-8')):
        if not link.startswith(('https://','http://','#')) and not (root/link).exists():missing.append((doc,link))
assert not missing,missing
(root/'deliverable_inventory.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'deliverables_present':len(inventory),'local_links':'pass','layout_pages_reviewed':16,
 'reference_schema_and_syntax':'pass','claim_hash_and_registration_errors':0,
 'human_verification':'pending','submission_ready':False},ensure_ascii=False))
