from pathlib import Path
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parent
Q=R/'qa';C=Q/'comparisons';C.mkdir(exist_ok=True)
def pair(a,b,target,left,right):
    a=Image.open(a).convert('RGB');b=Image.open(b).convert('RGB')
    assert a.size==b.size
    w,h=a.size
    sheet=Image.new('RGB',(2*w+12,h+28),'#e8edef')
    sheet.paste(a,(0,28));sheet.paste(b,(w+12,28))
    dr=ImageDraw.Draw(sheet);dr.text((12,8),left,fill='#182B35');dr.text((w+24,8),right,fill='#182B35')
    sheet.save(target)
for lang in ['EN','ZH']:
    for p in range(1,15):
        pair(Q/lang/f'page{p:02}.png',Q/f'Word_{lang}'/f'page{p:02}.png',C/f'{lang}_{p:02}.png',f'{lang} PDF target / {p}',f'{lang} Word export / {p}')
    for p in [2,6,12]:
        pair(R.parent/'health_value_ai_perspective'/'qa'/lang/f'page{p:02}.png',Q/lang/f'page{p:02}.png',C/f'{lang}_before_after_{p:02}.png','Previous edition','Final edition')
for lang,p in [('EN',6),('ZH',12)]:
    a=Image.open(Q/lang/f'page{p:02}.png').crop((60,80,860,620))
    b=Image.open(Q/f'Word_{lang}'/f'page{p:02}.png').crop((60,80,860,620))
    a.save(C/f'{lang}_focus_target.png');b.save(C/f'{lang}_focus_word.png')
    pair(C/f'{lang}_focus_target.png',C/f'{lang}_focus_word.png',C/f'{lang}_focus_compare.png','PDF region','Word region')
print('28 matched full-page comparisons, 6 before/after comparisons, 2 focused comparisons')
