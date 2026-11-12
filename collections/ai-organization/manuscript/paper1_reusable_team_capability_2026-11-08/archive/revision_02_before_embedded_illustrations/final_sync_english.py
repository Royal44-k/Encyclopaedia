from pathlib import Path
import re,json
R=Path(__file__).resolve().parent;p=R/'manuscript_en.md';t=p.read_text(encoding='utf-8')
replacements={
"According to Tencent Research Institute's report,":"According to page 37 of Tencent Research Institute's report,",
"The report also presents a scenario":"Page 73 of the report also presents a scenario",
"The same report gives concrete examples":"Page 17 of the same report gives concrete examples",
"Anker's Rocket Class, a separate initiative,":"Anker's Rocket Class, a separate initiative described on pages 35–36,",
"share. Organizational routines research":"share.[A03] Organizational routines research",
"particular circumstances. A tool":"particular circumstances.[S01] A tool",
"[知识转移与惯例来源待编号]":"",
"copying the text need not reproduce those conditions. As some work passes":"copying the text need not reproduce those conditions. This relates to theoretical work on how encapsulation changes the visibility of organizational activities.[S03] As some work passes",
"arranging updates may also change. We propose":"arranging updates may also change, raising questions about the organization of human–AI work.[S04] We propose",
"[生成式组织学习来源待编号]":"",
"is a proposed design, not the original Skill disclosed by the report.":"is an illustrative design; the report does not provide the original Skill.",
"Research should compare task repetition, differences, and duration rather than equating documentation length with adequate handover.":"Frequency alone cannot determine whether a method is worth documenting. Theory on capability development also proposes that knowledge codification can benefit infrequent tasks for which experience is difficult to accumulate through repetition. This is a theoretical argument, not an observed effect of the present handover design.[A04] Research should compare task repetition, differences, and duration rather than equating documentation length with adequate handover.",
"[接收者理解与知识转移来源待编号]":" This account builds on research that treats knowledge transfer as a continuing process.[A03]",
"[惯例执行来源待编号]":"[S01]",
"[维护与隐形劳动来源待编号]":"",
"[公开材料来源待编号]":""
}
for old,new in replacements.items():
    assert old in t,old
    t=t.replace(old,new)
t=re.sub(r'\[报告，[^\]]+\]','[S09]',t)
anchor='Conditions left unstated by both parties may become apparent only when recipients apply it to their own tasks.'
newpara='These questions already feature in organizational research on generative AI. Wiesenfeld and Kellogg’s qualitative study examines LLMs in knowledge search, creation, transfer, and forgetting, together with related organizational arrangements.[S02] A field experiment has also directly tested how AI changes individual and team performance on product innovation tasks.[S05] These studies provide a basis for understanding AI in organizations. The latter workshop experiment, however, does not test whether one employee’s method can be handed to another, reused later, and maintained. We focus on that subsequent process.'
assert anchor in t;t=t.replace(anchor,anchor+'\n\n'+newpara)
p.write_text(t,encoding='utf-8')
z=(R/'manuscript_zh.md').read_text(encoding='utf-8')
pattern=r'\[(?:[AS]\d{2})(?:\s*,\s*[AS]\d{2})*\]'
assert re.findall(pattern,z)==re.findall(pattern,t),(re.findall(pattern,z),re.findall(pattern,t))
assert len(re.split(r'\n\s*\n',z.strip()))==len(re.split(r'\n\s*\n',t.strip()))
print(json.dumps({'citation_groups_match':len(re.findall(pattern,t)),'aligned_blocks':len(re.split(r'\n\s*\n',t.strip()))}))
