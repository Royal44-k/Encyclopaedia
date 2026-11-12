"""Apply editorial revisions to design text. This is not application code."""
from pathlib import Path

base = Path(__file__).resolve().parents[1] / 'design' / 'v6'
changes = {
 'episodes/T03.md': [
  ('拟定课堂情境：展示11:00开始', '拟定课堂情境：初始时刻10:40，短装置演示11:00开始'),
  ("We can stop by the flower ring. I'll check the display time first.", "We can sit by the flower ring. I'll check when the demonstration starts."),
  ('The short display starts at eleven now. The old card says half past ten.', 'The demonstration starts at eleven now. The old card says half past ten.'),
  ('基于当前教学时段', '当前早于11:00且所选路线可按约到达时'),
 ],
 'episodes/T04.md': [
  ('| T04.014 | IRIS | Now I can repeat it. What will you call it? | 仅复现完成时 |', '| T04.014 | SAM | Now I can repeat it. What will you call it? | Sam按学生说明实际完成复现时 |'),
 ],
 'episodes/T09.md': [
  ('That would have answered my first question.', 'Now I know I can help myself.'),
 ],
 'episodes/T10.md': [
  ('必须让对方确认基本准确，再尝试改动安排。', '先请对方补充或确认，再尝试改动安排；仍未说清时可追问、暂缓或请同伴帮助，不以某一句式解锁操作。'),
  ('Iris wants a creative part. Amina needs a clear arrangement. Is that right?', 'Iris wants to help make the film. Amina needs to know who will help with the setup. Is that right?'),
  ('窗外普通活动持续', '桌旁远处的普通活动持续'),
 ],
 'episodes/T12.md': [
  ('Are you leaving the piece at the display?', 'Are you leaving the piece on display?'),
 ],
 'episodes/T07.md': [
  ('We can compare our ideas around this one.', 'We can use this scene to compare our ideas.'),
 ],
}
for name, pairs in changes.items():
    p = base / name
    s = p.read_text(encoding='utf-8')
    for old,new in pairs:
        if old in s:
            assert s.count(old)==1, (name,old)
            s=s.replace(old,new)
        else:
            assert new in s, (name,old)
    p.write_text(s,encoding='utf-8')
print('Editorial revisions applied.')
