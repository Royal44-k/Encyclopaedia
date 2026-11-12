from pathlib import Path
import json,re
R=Path(__file__).resolve().parent
p=R/'content_bilingual.json'
d=json.loads(p.read_text(encoding='utf-8'))
for lang in ('en','zh'):
    for row in d[lang]['tables']['2']['rows'][1:]:
        lines=row[0].split('\n')
        if len(lines)==2 and '[@' in lines[1]:
            marker=re.search(r'\[@E\d+\]',lines[1]).group()
            row[0]=lines[0]+' '+marker+'\n'+lines[1].replace(marker,'').rstrip()
p.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8')
print('Table citations positioned after study names.')
