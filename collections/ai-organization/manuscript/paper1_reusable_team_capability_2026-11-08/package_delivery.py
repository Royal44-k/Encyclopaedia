from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import csv,re,json,hashlib

R=Path(__file__).resolve().parent
out=R/'deliverables'
audit=json.loads((R/'qa'/'delivery_checks.json').read_text(encoding='utf-8'))
# Remove only obsolete derived page images within this task's exact QA folders.
for lang in ['zh','en']:
    folder=(R/'qa'/lang).resolve();assert folder.is_relative_to((R/'qa').resolve())
    count=audit['manuscripts'][lang]['pages']
    for p in folder.glob('page-*.png'):
        if (m:=re.fullmatch(r'page-(\d+)\.png',p.name)) and int(m[1])>count:
            assert p.resolve().parent==folder
            p.unlink()
rows=[]
for lang in ['zh','en']:
    text=(R/f'manuscript_{lang}.md').read_text(encoding='utf-8')
    for i,b in enumerate(re.split(r'\n\s*\n',text.strip()),1):
        if b.startswith('#') or re.fullmatch(r'\[(?:FIGURE|SCENE)\d\]',b):continue
        ids=re.findall(r'[AS]\d{2}',b)
        rows.append({'language':lang,'block':i,'source_ids':','.join(dict.fromkeys(ids)),
          'category':'source-bound discussion' if ids else 'author synthesis, illustration or proposed research',
          'text_sha256':hashlib.sha256(b.encode()).hexdigest(),'human_verification':'pending'})
with (R/'claim_evidence_map.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.DictWriter(f,fieldnames=rows[0].keys());w.writeheader();w.writerows(rows)
include=[R/'README.md',R/'author_work_record.md',R/'argument_plan.md',R/'report_casebook.md',R/'report_cases.json',R/'sources.json',R/'additional_sources.json',R/'literature_review.md',R/'editorial_design_brief.md',R/'claim_evidence_map.csv',R/'build_manifest.json',R/'qa'/'delivery_checks.json',R/'qa'/'final_quality_record.md']
include+=list(out.glob('*.docx'))+list(out.glob('*.pdf'))+list(out.glob('*.html'))+list(out.glob('*.md'))
include+=[R/f'manuscript_{lang}.md' for lang in ['zh','en']]
include+=list((R/'figures').glob('*.svg'))+list((R/'figures').glob('*.png'))
include+=list((R/'illustrations').glob('*.png'))
include += [R/n for n in ['editorial_metadata.json','reader.css','illustration_provenance.json','revision03_language_changes.json','revision03_design_brief.md','qa/typography_verification.json','qa/revision03_visual.md','qa/reader/platform_fonts.json','qa/reader/checks.json']]
include += [R/n for n in ['build_figures.py','render_figures.cjs','build_documents.py','build_reader.py','export_word_pdf.ps1','render_qa.py','check_reader.cjs','validate_delivery.py','verify_typography.py','package_delivery.py']]
assert all(p.is_file() for p in include),[str(p) for p in include if not p.is_file()]
records=[{'path':p.relative_to(R).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in include]
(R/'delivery_manifest.json').write_text(json.dumps({'date':'2026-11-08','revision':3,'files':records,'status':'bilingual illustrated Perspective review manuscript; scenes embedded in all reading formats; current typography and page checks passed; human source verification pending'},ensure_ascii=False,indent=2),encoding='utf-8')
target=out/'paper1_bilingual_review_package.zip'
with ZipFile(target,'w',ZIP_DEFLATED) as z:
    for p in include+[R/'delivery_manifest.json']:z.write(p,p.relative_to(R).as_posix())
with ZipFile(target) as z:
    assert z.testzip() is None
    names=z.namelist();assert len(names)==len(set(names))
print(json.dumps({'zip':str(target),'files':len(names),'bytes':target.stat().st_size,'pages':{x:audit['manuscripts'][x]['pages'] for x in ['zh','en']}}))
