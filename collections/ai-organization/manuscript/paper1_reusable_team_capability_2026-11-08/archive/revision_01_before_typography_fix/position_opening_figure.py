from pathlib import Path
import re
root=Path(__file__).resolve().parent
for lang in ['zh','en']:
    p=root/f'manuscript_{lang}.md'
    blocks=re.split(r'\n\s*\n',p.read_text(encoding='utf-8').strip())
    caption=next(b for b in blocks if re.match(r'CAPTION1[:：]',b))
    blocks=[b for b in blocks if b!='[FIGURE1]' and b!=caption]
    h=next(i for i,b in enumerate(blocks) if re.match(r'## 1\.',b))
    blocks[h+2:h+2]=['[FIGURE1]',caption]
    lead=blocks[h+1]
    marker=' Skill 可以理解' if lang=='zh' else ' A Skill can be understood'
    if marker in lead:
        a,b=lead.split(marker,1)
        blocks[h+1]=a
        blocks[h+4:h+4]=[(marker+b).strip()]
    p.write_text('\n\n'.join(blocks)+'\n',encoding='utf-8')
print('Placed the reported-practice illustration after the opening case paragraph in both languages.')
