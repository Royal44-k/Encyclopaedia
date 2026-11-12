"""Apply the editorial v6.1 dialogue decisions to their authoritative episode rows."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[2]
episodes = root / 'docs/design/v6/episodes'
changes = {
    'T01.012': ("Sorry. Show me your idea first.", '手在接触前收回，等待作者实际操作，不替他接着完成'),
    'T02.001': ("There it is again.", '轻声后停下听，先让学生描述；按需提示两类声音，不抢先揭示谜的结构'),
    'T02.015': ("Keep that part still. I'm going to listen by the stairs.", '对Sam说前句，移到已定义的楼梯地面听音位；Sam继续固定，同一风条件不变'),
    'T03.018': ("Okay. But I do want to come back.", '仅约定稍后回访时；看一眼桥下再同行，保留自己的主见'),
    'T03S.022': ("All right. Show me where.", '看向玩家所指模型位置，等其移动措施；不替玩家修正，不触发现实实施'),
    'T04.015': ("Not yet. Let me watch it once more.", '可主动重看一次，也可跳过并保持未命名；学生不必照说'),
    'T05.008': ("I was about to cover that gap. Let me look from here.", '放下尚未使用的补片材料，换到作者所指观察位，不擅自盖住原作'),
    'T06.006': ("I'd tell them where they can sit for a while.", '表达自己的具体偏好；未共同游园也成立，不保证来客不会错过任何事情'),
    'T07.004': ("The pause. I kept waiting for the next note.", '指音乐中实际停顿；录音和最终乐段须对应，属于个人体验'),
    'T07.014': ("I still like mine better. Can we listen to yours again?", '保留偏好，提供一次可选重听；可略过，不据此声称理解任意创作'),
    'T08.005': ("I'll stay with the others. Iris went towards the workshop.", 'Amina确实看见Iris离开，自己留下整理排练；由玩家决定是否陪伴'),
    'T09.006': ("Of course. Just a little, then.", '按002已明确的份量实际倒入，不重新询问、不倒满后假装少量'),
    'T10.018': ("Yes. Let me see.", '放下日程，靠近Iris实际展开的第一张草图；先看构图再接话'),
    'T11.020': ("All right. Let's hear what they think.", '确有另一组可试映时转向观众；无人时保存待试映并不播此句，不伪造反馈'),
}
found = set()
for path in episodes.glob('*.md'):
    rows = []
    for line in path.read_text(encoding='utf-8').splitlines():
        m = re.match(r'^\| ((?:T\d{2}S?)\.\d{3}) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$', line)
        if m and m[1] in changes:
            ident, speaker = m[1], m[2]
            assert ident not in found
            found.add(ident)
            english, direction = changes[ident]
            line = f'| {ident} | {speaker} | {english} | {direction} |'
        rows.append(line)
    path.write_text('\n'.join(rows)+'\n', encoding='utf-8')
assert found == set(changes), set(changes)-found
print(f'Edited {len(found)} dialogue rows; IDs preserved.')
