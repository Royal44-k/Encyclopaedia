"""Build a reference index and reading edition from authored design Markdown."""
import json, re
from pathlib import Path

root = Path(__file__).resolve().parents[2]
base = root / 'docs/design/v6'
episodes = [base/'episodes'/f'T{i:02d}.md' for i in range(1,13)]
episodes.insert(3,base/'episodes/T03-stream.md')
sources = episodes + [base/'story-state-and-staging.md', base/'dialogue-branch-table.md']
id_pattern = r'(?:T\d{2}S?|AMB)\.\d{3}'
row_pattern = re.compile(r'^\| ('+id_pattern+r') \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$')
rows, references = {}, {}
for p in sources:
    for n,line in enumerate(p.read_text(encoding='utf-8').splitlines(),1):
        for ident in re.findall(id_pattern,line):
            references.setdefault(ident,[]).append({'file':str(p.relative_to(root)).replace('\\','/'),'line':n,'context':line})
        m=row_pattern.match(line)
        if m:
            ident,speaker,english,direction=m.groups()
            assert ident not in rows, ('duplicate_line_definition',ident)
            rows[ident]={'id':ident,'speaker':speaker.strip(),'english':english.strip(),'direction':direction.strip(),'file':str(p.relative_to(root)).replace('\\','/'),'line':n,'origin':'project_original','status':'editorial_design_draft_not_recorded'}
inline=[{'id':i,'kind':'inline_branch_reference','locations':r} for i,r in sorted(references.items()) if i not in rows]
index={'version':'6.1','date':'2026-11-07','purpose':'Structured editorial dialogue reference, not runtime implementation or a locked recording script. Branch text is authoritative in dialogue-branch-table.md; first-journey-flow-v6_1.json supplies the first journey contract only.','episodeCount':12,'embeddedEnvironmentalSequenceCount':1,'tableLines':list(rows.values()),'inlineBranchReferences':inline,'allReferencedIds':sorted(references)}
(base/'dialogue-reference-index.json').write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def fix_links(text, original):
    def repl(m):
        target=m.group(1)
        if target.startswith(('https://','http://','#','mailto:')):
            return m.group(0)
        path,sep,frag=target.partition('#')
        resolved=(original.parent/path).resolve()
        return ']('+resolved.as_posix()+(sep+frag if sep else '')+')'
    return re.sub(r'\]\(([^)]+)\)',repl,text)

reading=[base/'production-bible.md',base/'readiness-and-refinement-v6_1.md',base/'characters-and-performance.md',*episodes,base/'story-state-and-staging.md',base/'dialogue-branch-table.md',base/'visual-and-sound-direction.md',base/'classroom-playthrough-v6_1.md',base/'implementation-handoff-v6_1.md',root/'docs/research/language-notes-v6.md']
chunks=['# English Valley v6.1 · 完整设计阅读本\n\n由分章源文件汇编，便于连贯阅读。修改请回到对应源文件；本文件不代表运行课件或录音定稿。\n']
for p in reading:
    chunks.append('\n---\n\n来源：['+p.name+']('+p.as_posix()+')\n\n'+fix_links(p.read_text(encoding='utf-8'),p))
(base/'complete-reading-edition.md').write_text('\n'.join(chunks),encoding='utf-8')

missing=[]
for p in [root/'README.md',*base.rglob('*.md')]:
    s=p.read_text(encoding='utf-8')
    assert '\ufffd' not in s, ('encoding',str(p))
    for target in re.findall(r'\]\(([^)]+)\)',s):
        if target.startswith(('http://','https://','#','mailto:')):continue
        dest=Path(target.split('#')[0])
        if not dest.is_absolute():dest=p.parent/dest
        if not dest.exists():missing.append({'file':str(p),'link':target})
report={'date':'2026-11-07','episodeFiles':12,'embeddedEnvironmentalSequenceFiles':1,'uniqueReferencedDialogueIds':len(references),'structuredTableLines':len(rows),'inlineBranchIds':len(inline),'localLinkIssues':missing,'status':'passed_document_integrity' if not missing else 'needs_link_fix','scope':'Document integrity only. No classroom, voice, model or runtime validation.'}
(base/'preparation-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
assert not missing, missing
