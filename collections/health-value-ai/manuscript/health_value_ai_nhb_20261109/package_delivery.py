from pathlib import Path
import csv, hashlib, json, re, zipfile

R = Path(__file__).resolve().parent
D = json.loads((R/'content_nhb.json').read_text(encoding='utf-8'))
report = json.loads((R/'build_report.json').read_text(encoding='utf-8'))

with (R/'additional_evidence_data.csv').open(encoding='utf-8-sig', newline='') as f:
    reader = csv.DictReader(f)
    fields, rows = reader.fieldnames, list(reader)
for row in rows:
    row['location'] = row['location'].replace('Table 2', 'Supplementary Table 2')
with (R/'Additional_Source_Data.csv').open('w', encoding='utf-8-sig', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fields)
    writer.writeheader(); writer.writerows(rows)

for lang in ('en', 'zh'):
    cn = lang == 'zh'
    lines = ['# '+('支持材料目录与扩展图图注' if cn else 'Supporting-file inventory and extended-data legends'), '',
        D[lang]['title'], '',
        ('三张补充表与四幅扩展图均已在主稿引用。扩展图同时提供独立图源，供编辑按文件类别接收。' if cn else
         'Three supplementary tables and four extended-data figures are cited in the main text. Extended-data figures are also supplied individually for editorial file classification.'), '',
        '| '+('项目 | 文件位置' if cn else 'Item | File location')+' |', '|---|---|',
        f'| Supplementary Tables 1–3 | Supporting_information_{lang.upper()}.docx / .pdf |',
        f'| Extended Data Figs. 1–4 | figures/{lang}/ExtendedDataFig1–4.svg / .pdf / .png |',
        '| Source data | Source_Data.csv; Additional_Source_Data.csv |', '',
        '## '+('扩展图图注' if cn else 'Extended-data figure legends'), '']
    for n, cap in D[lang]['extended_captions'].items():
        assert not re.search(r'\[@E\d+\]',cap)
        cap = re.sub(r'</?b>', '**',cap)
        lines += [('**扩展数据图 ' if cn else '**Extended Data Fig. ')+n+'.** '+cap, '']
    (R/f'Inventory_and_extended_legends_{lang.upper()}.md').write_text('\n'.join(lines), encoding='utf-8')

paths = [p for p in R.iterdir() if p.is_file() and p.suffix in {'.docx','.pdf','.json','.csv','.md','.py','.ps1'}
         and p.name != 'delivery_manifest.json' and not p.name.startswith('~$')]
paths += list((R/'figures').rglob('*.svg')) + list((R/'figures').rglob('*.pdf')) + list((R/'figures').rglob('*.png'))
paths += [R/'qa'/'audit.json', R/'qa'/'visual_review.md']
manifest = {'date':'2026-11-09','article_type':'Perspective','proposed_venue':'Nature Human Behaviour',
    'author_signoff':False,'submitted':False,'files':[
        {'path':p.relative_to(R).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
        for p in sorted(paths)]}
(R/'delivery_manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
paths.append(R/'delivery_manifest.json')
target=R/'NHB_Perspective_delivery.zip'
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(paths):z.write(p,p.relative_to(R).as_posix())
with zipfile.ZipFile(target) as z:
    assert z.testzip() is None
    names=set(z.namelist())
    for stem in ['Health_value_NHB_EN','Health_value_NHB_ZH','Supporting_information_EN','Supporting_information_ZH']:
        for ext in ['docx','pdf']:assert stem+'.'+ext in names
    assert len([n for n in names if n.startswith('figures/')])==48
print(json.dumps({'zip':str(target),'bytes':target.stat().st_size,'files':len(paths),'validated':True},ensure_ascii=False))
