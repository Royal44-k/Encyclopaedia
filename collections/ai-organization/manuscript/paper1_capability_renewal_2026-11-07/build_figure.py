"""Build a conceptual SVG using only the Python standard library. No empirical data."""
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parent
parts = ['''<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="980" viewBox="0 0 1600 980">
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#586a7d"/></marker></defs>
<rect width="1600" height="980" fill="#ffffff"/>
<style>text{font-family:Arial,Helvetica,sans-serif;fill:#192c3e}.title{font-size:35px;font-weight:700}.sub{font-size:21px;fill:#546477}.head{font-size:22px;font-weight:700}.body{font-size:21px}.note{font-size:20px;fill:#546477}.arrow{fill:none;stroke:#586a7d;stroke-width:2.5;stroke-dasharray:8 7;marker-end:url(#arrow)}</style>
''']

def text(x, y, lines, css='body', anchor='middle', gap=30):
    for i, line in enumerate(lines):
        parts.append(f'<text x="{x}" y="{y+i*gap}" class="{css}" text-anchor="{anchor}">{escape(line)}</text>')

def box(x, y, w, h, title, lines, fill='#eef3f8'):
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{fill}" stroke="#c8d3dd" stroke-width="1.5"/>')
    text(x+w/2,y+38,[title], 'head')
    text(x+w/2,y+78,lines)

def arrow(path):
    parts.append(f'<path d="{path}" class="arrow"/>')

text(60,60,['Who learns to recover?'], 'title', 'start')
text(60,100,['Task routing, learning experiences and the distribution of expertise'], 'sub', 'start')
box(60,150,240,110,'Current delivery',['Quality · time · cost'],'#f4f1e9')
text(460,195,['Conceptual framework', 'All arrows are proposed relationships,', 'not established causal effects.'], 'sub', 'start',30)
box(60,330,240,175,'AI work design',['What is automated?', 'What remains visible?', 'What can be checked?'])
box(360,330,240,175,'Task routing',['Which member?', 'Which error class?', 'Which work stage?'])
box(660,330,240,175,'Learning experience',['Attempt a diagnosis', 'Try a repair', 'Receive valid feedback'])
box(960,330,240,175,'Capability coverage',['Member × error class', 'Common novel tests', 'Specified tool access'])
box(1260,330,280,175,'Collective recovery',['Separate team tests', 'Defined disruptions', 'Quality and cost'])
for a,b in [(300,360),(600,660),(900,960),(1200,1260)]:
    arrow(f'M {a+5} 420 L {b-8} 420')
arrow('M 180 324 L 180 267')
box(330,630,290,130,'Learning conditions',['Prior skill · difficulty', 'Feedback quality'],'#f6f7f9')
box(660,630,290,130,'Substitute practice',['AI tutoring and rehearsal', 'Transfer must be tested'],'#edf6f2')
box(1110,630,430,130,'Collective conditions',['Coordination · outside support', 'Shared errors · future task demands'],'#f6f7f9')
arrow('M 540 623 L 720 513')
arrow('M 805 623 L 805 513')
arrow('M 1400 623 L 1400 513')
text(65,797,['Allocation may reinforce existing expertise; wider coverage need not improve every team outcome.'], 'note', 'start')
parts.append('<rect x="60" y="825" width="1480" height="94" rx="12" fill="#f4f6f8"/>')
text(85,861,['Design comparison: predefine the AI version, task pool, baseline composition and resource budget.'], 'note', 'start')
text(85,893,['Measure delivery and learning together. Do not match groups on post-treatment performance.'], 'note', 'start')
text(60,953,['Figure 1 · Conceptual proposal only · No measurements, estimated effects or simulated outcomes are shown.'], 'note', 'start')
parts.append('</svg>')
(ROOT/'figure1_conceptual_framework.svg').write_text('\n'.join(parts),encoding='utf-8')
print('Created figure1_conceptual_framework.svg')
