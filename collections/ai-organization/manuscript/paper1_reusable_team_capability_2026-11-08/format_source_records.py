from pathlib import Path
import json
R=Path(__file__).resolve().parent
p=R/'sources.json';sources=json.loads(p.read_text(encoding='utf-8'))
refs={
'S01':'Feldman, M. S. & Pentland, B. T. Reconceptualizing organizational routines as a source of flexibility and change. Administrative Science Quarterly 48(1), 94–118 (2003).',
'S02':'Wiesenfeld, B. M. & Kellogg, K. C. Generative organizational learning: Affordances for new modes of knowledge search, creation, transfer, and forgetting with LLMs. Strategic Organization 24(2) (2026; first published online 2025).',
'S03':'Hinds, P. & von Krogh, G. Generative AI, emerging technology, and organizing: Towards a theory of progressive encapsulation. Organization Theory 5(4) (2024).',
'S04':'Puranam, P. Human–AI collaborative decision-making as an organization design problem. Journal of Organization Design 10, 75–80 (2021).',
'S05':"Dell'Acqua, F. et al. The cybernetic teammate: A field experiment on generative AI and teamwork. Organization Science 37(4), 1217–1242 (2026).",
'S06':'Lewis, K. Measuring transactive memory systems in the field: Scale development and validation. Journal of Applied Psychology 88(4), 587–604 (2003).',
'S07':'Lifshitz-Assaf, H. Dismantling knowledge boundaries at NASA: The critical role of professional identity in open innovation. Administrative Science Quarterly (2018).',
'S08':'Adler, P. S. & Borys, B. Two types of bureaucracy: Enabling and coercive. Administrative Science Quarterly 41(1), 61–89 (1996).',
'S09':'Tencent Research Institute. From super individuals to super teams: Emergent pathways of organizational transformation in the AI era. Research report (2026) [in Chinese].'
}
for s in sources:
    s['formatted_reference']=refs[s['id']]
    if s['id']=='S09':s['formatted_reference_zh']='腾讯研究院. 2026 从超级个体到超级团队：AI 时代组织变革的涌现路径研究报告. 研究报告（2026）.'
    if s['id']=='S03':
        s['current_root_read']='2026-11-08: primary publisher full-text introduction, encapsulation argument and team coordination thought experiment opened and read; no claim of empirical support.'
        s['ai_checked_date']='2026-11-08'
    if s['id']=='S05':
        s['authors']=['Fabrizio Dell’Acqua','Charles Ayoubi','Hila Lifshitz','Raffaella Sadun','Ethan Mollick','Lilach Mollick','Yi Han','Jeff Goldman','Hari Nair','Stew Taub','Karim R. Lakhani']
        s['authors_complete']=True
        s['author_note']='Full author list checked by root against the primary publisher page on 2026-11-08; displayed reference uses et al.'
        s['current_root_read']='2026-11-08: publisher author list, publication date and abstract opened; earlier methods reading retained separately.'
        s['ai_checked_date']='2026-11-08'
p.write_text(json.dumps(sources,ensure_ascii=False,indent=2),encoding='utf-8')
print('Added consistent reference display text without altering evidence IDs.')
