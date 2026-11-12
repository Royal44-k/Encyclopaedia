from pathlib import Path
import json, re, csv, hashlib

root = Path(__file__).resolve().parent
sources = json.loads((root / 'source_manifest.json').read_text(encoding='utf-8'))['sources']
lookup = {s['evidence_id']: s for s in sources}
marker = re.compile(r'\[evidence:([^\]]+)\]|\[@(E\d+)\]')
claims = []

def make_reader(source_name, target_name, offset):
    text = (root / source_name).read_text(encoding='utf-8')
    order = []
    section = ''
    for line in text.splitlines():
        if line.startswith('#'):
            section = line.lstrip('# ')
        ids = []
        for m in marker.finditer(line):
            ids.extend(m.group(1).split(',') if m.group(1) else [m.group(2)])
        for eid in ids:
            assert eid in lookup, eid
            if eid not in order:
                order.append(eid)
        if ids:
            explicit = re.search(r'\[claim:(C\d+)\]', line)
            cid = explicit.group(1) if explicit else f'C{offset:03d}'
            if not explicit:
                offset += 1
            clean = re.sub(r'\[claim:C\d+\]|\[evidence:[^\]]+\]|\[@E\d+\]', '', line)
            digest = hashlib.sha256(' '.join(clean.split()).encode('utf-8')).hexdigest()
            claims.append(dict(claim_id=cid, section=source_name+' / '+section, claim_kind='factual', claim_text_sha256=digest, evidence_ids=';'.join(dict.fromkeys(ids)), verification_status='unverified', uncertainty='not_estimated', analysis_intent='not_applicable'))
    numbers = {eid:i+1 for i,eid in enumerate(order)}
    def cite(m):
        ids = m.group(1).split(',') if m.group(1) else [m.group(2)]
        return ' '.join(f'[{numbers[eid]}]({lookup[eid]["identifiers"]["url"]})' for eid in ids)
    text = marker.sub(cite, text)
    text = re.sub(r'\s*\[claim:C\d+\]', '', text)
    refs = []
    for eid in order:
        s = lookup[eid]
        refs.append(f'{numbers[eid]}. {"; ".join(s["authors"])}. [{s["title"]}]({s["identifiers"]["url"]}). {s["year"]}. 核对范围：{s["ai_check"]["scope"]}。'+ (f' DOI: {s["identifiers"]["doi"]}。' if s['identifiers'].get('doi') else ''))
    text = text.replace('<!-- REFERENCES_GENERATED -->', '\n\n'.join(refs))
    assert not re.search(r'\[claim:|\[evidence:|\[@E|REFERENCES_GENERATED', text)
    (root / target_name).write_text(text, encoding='utf-8')
    return {'file':target_name, 'references':len(order), 'han_characters':len(re.findall(r'[\u4e00-\u9fff]',text))}

results = [make_reader('论文审阅底稿.md','学术观点论文.md',50), make_reader('健康深度文章_写作稿.md','把健康放回日常生活.md',101)]
with (root / 'claims.csv').open('w', encoding='utf-8-sig', newline='') as f:
    fields = ['claim_id','section','claim_kind','claim_text_sha256','evidence_ids','verification_status','uncertainty','analysis_intent']
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    w.writerows(claims)
assert len({c['claim_id'] for c in claims}) == len(claims)
report = {'checked_on':'2026-11-12','structural_checks':'passed','claim_records':len(claims),'source_records':len(sources),'outputs':results,'human_verification':'pending','submission_ready':False,'limits':['结构检查不验证科学正确性','主文已进行AI证据核对，尚无人类作者或同行审阅','未开展系统检索或正式偏倚风险评价']}
(root / '核验记录.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
