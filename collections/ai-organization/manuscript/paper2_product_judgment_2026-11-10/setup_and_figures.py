from pathlib import Path
import json,re,html
R=Path(__file__).resolve().parent
for d in ['figures','deliverables','qa']: (R/d).mkdir(exist_ok=True)
checks=R.parents[1]/'research/paper2_product_judgment_2026-11-10/source_checks'
mapping={1:'R02',2:'R03',3:'R04',4:'R05',5:'R06',6:'R07',7:'R08',8:'R10',9:'R11',10:'R12'}
sources=[]
for i,k in mapping.items():
 m=json.loads((checks/f'crossref_{i:02}.json').read_text(encoding='utf-8'))['message']
 authors=[(a.get('given','')+' '+a.get('family','')).strip() for a in m.get('author',[])]
 yr=m['published']['date-parts'][0][0];venue=m['container-title'][0];title=m['title'][0].rstrip('.')
 vol=m.get('volume','');issue=m.get('issue','');pg=m.get('page','')
 if k=='R08':pg='2121–2138'
 tail=(' '+vol+('('+issue+')' if issue else '')+(', '+pg if pg else '')) if vol else ' (advance online publication)'
 ref='; '.join(authors)+'. '+title+'. '+venue+tail+f' ({yr}).'
 sources.append({'id':k,'title':title,'authors':authors,'year':yr,'doi':m['DOI'],'venue':venue,'formatted_reference':ref})
sources.append({'id':'R01','title':'从超级个体到超级团队：AI时代组织变革的涌现路径','authors':['腾讯研究院'],'year':2026,'venue':'研究报告','formatted_reference_zh':'腾讯研究院. 从超级个体到超级团队：AI时代组织变革的涌现路径. 研究报告 (2026).','formatted_reference_en':'Tencent Research Institute. From Super Individuals to Super Teams: Emergent Pathways of Organizational Change in the AI Era. Research report (2026; in Chinese).','url':None})
sources.append({'id':'R09','title':'Using LLMs for Market Research','authors':['James Brand','Ayelet Israeli','Donald Ngwe'],'year':2026,'venue':'HBS Working Paper 23-062','formatted_reference':'James Brand; Ayelet Israeli; Donald Ngwe. Using LLMs for Market Research. Harvard Business School Working Paper 23-062 (revised 30 April 2026).','url':'https://www.hbs.edu/ris/Publication%20Files/23-062_1f58623a-ee21-44b9-a262-276047bc5543.pdf'})
(R/'sources.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2),encoding='utf-8')
meta={'author':'Richard T.Millian','affiliation':'Hangzhou Normal University','running_header':{'zh':'让产品尝试留下可检验的经验','en':'Learning that carries into the next product'},'scenes':[],'subtitle':{'zh':'AI辅助产品探索中的科学学习与跨项目迁移','en':'Scientific learning and transfer across product projects'}}
(R/'editorial_metadata.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8')
old=R.parent/'paper1_reusable_team_capability_2026-11-08'
s=(old/'build_documents.py').read_text(encoding='utf-8')
a=s.index('    # Keep large illustrations');b=s.index('    doc=Document()',a);s=s[:a]+s[b:]
s=s.replace("    assert used_scenes==[1,2],used_scenes","    assert used_scenes==[],used_scenes")
s=s.replace("'scenarios':2","'scenarios':0").replace('paper1_','paper2_')
s=s.replace("    doc.add_paragraph(display_title,'Title')","    doc.add_paragraph(display_title,'Title')\n    doc.add_paragraph(META['subtitle'][lang],'Subtitle')")
s=s.replace("generative AI; knowledge transfer; organizational learning; teamwork; reuse","generative AI; product judgment; experimentation; customer discovery; learning transfer")
(R/'build_documents.py').write_text(s,encoding='utf-8')
(R/'export_word_pdf.ps1').write_text((old/'export_word_pdf.ps1').read_text(encoding='utf-8').replace('paper1_','paper2_'),encoding='utf-8')

INK='#18313a';TEAL='#247c73';PALE='#e7f1ef';LINE='#b6c7ca';PAPER='#ffffff';SAND='#f6f2e9'
class Figure:
 def __init__(self,h):
  self.h=h;self.p=[f'<svg xmlns="http://www.w3.org/2000/svg" width="491pt" height="{h}pt" viewBox="0 0 491 {h}"><defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="{TEAL}"/></marker></defs><rect width="491" height="{h}" fill="white"/>']
 def text(self,x,y,lines,size=10,bold=False,anchor='start'):
  if isinstance(lines,str):lines=[lines]
  self.p.append(f'<text x="{x}" y="{y}" font-family="Arial, Microsoft YaHei" font-size="{size}" fill="{INK}" text-anchor="{anchor}" font-weight="{700 if bold else 400}">')
  for i,t in enumerate(lines):self.p.append(f'<tspan x="{x}" dy="{0 if i==0 else size*1.5}">{html.escape(t)}</tspan>')
  self.p.append('</text>')
 def box(self,id,x,y,w,h,fill=PALE):self.p.append(f'<rect id="{id}" x="{x}" y="{y}" width="{w}" height="{h}" rx="4" fill="{fill}" stroke="{LINE}" stroke-width="0.7"/>')
 def arrow(self,x1,y1,x2,y2,dash=False):self.p.append(f'<path d="M{x1} {y1} L{x2} {y2}" fill="none" stroke="{TEAL}" stroke-width="1.2"'+(' stroke-dasharray="4 3"' if dash else '')+' marker-end="url(#arrow)"/>')
 def line(self,x1,y1,x2,y2):self.p.append(f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{LINE}" stroke-width="0.8"/>')
 def save(self,n,lang):(R/'figures'/f'figure{n}_{lang}.svg').write_text(''.join(self.p)+'</svg>',encoding='utf-8')
for lang in ['zh','en']:
 z=lang=='zh'
 f=Figure(244)
 f.text(12,17,'一次低使用结果，三种不同解释' if z else 'One low-use result, three possible explanations',12,True)
 f.box('observation',12,34,467,37,SAND)
 f.text(245,57,'试用者喜欢演示，但很少再次使用' if z else 'Users like the demonstration but rarely return',11,anchor='middle')
 xs=[12,173,334]
 labels=[['任务很少发生','检查最近真实任务','重新评估目标客户'],['使用过程受阻','观察配置与接入','验证实施支持价值'],['现有替代已经足够','比较实际取舍','检验差异是否重要']] if z else [['The task is infrequent','Check recent task history','Reassess the segment'],['Setup blocks adoption','Observe the workflow','Test implementation help'],['Alternatives are adequate','Observe actual choices','Test the value difference']]
 for j,x in enumerate(xs):
  f.arrow(x+72,73,x+72,91);f.box('cause'+str(j),x,96,145,119)
  f.text(x+10,117,labels[j][0],10,True);f.line(x+10,129,x+135,129)
  f.text(x+10,151,labels[j][1],9.5);f.text(x+10,190,labels[j][2],9.5)
 f.text(12,236,'说明情境  /  原因可以并存，下一项证据应能区分解释' if z else 'Illustrative scenario / Causes may coexist; seek discriminating evidence',9)
 f.save(1,lang)
 f=Figure(251);f.text(12,18,'先明确未知，再选择验证方式' if z else 'Start with the uncertainty that matters',12,True)
 heads=['问题与购买流程','体验与交互','复杂工作流程'] if z else ['Problem and purchase','Experience and interaction','A complex workflow']
 body=[['先接触目标客户','任务何时发生？','谁决定并付款？'],['先做最小原型','客户能否完成任务？','体验暴露什么障碍？'],['持续参与和迭代','方案怎样进入日常？','新客户是否也适用？']] if z else [['Contact customers first','When does the task arise?','Who decides and pays?'],['Build a minimal prototype','Can users finish the task?','What blocks the experience?'],['Iterate with customers','How does the product fit?','Does it work for new users?']]
 risks=['避免只听假设性意愿','避免用演示评价需求','避免围绕少数人定制'] if z else ['Check actual behaviour','Separate appeal from need','Check representativeness']
 for j,x in enumerate(xs):
  f.box('route'+str(j),x,38,145,171,PALE if j==1 else '#f4f6f6');f.text(x+9,60,heads[j],10,True);f.line(x+9,73,x+136,73)
  f.text(x+9,98,body[j][0],9.5);f.text(x+9,127,body[j][1:],9.2);f.text(x+9,192,risks[j],8.8)
 f.text(12,231,'候选匹配关系  /  同等资源比较，允许循环组合' if z else 'Proposed matches / Compare resources and allow sequences to change',9)
 f.save(2,lang)
 f=Figure(247);f.text(12,18,'下一项目，检验经验是否真正迁移' if z else 'The next project tests whether learning transfers',12,True)
 f.box('project-a',12,40,139,80,'#f4f6f6');f.text(23,60,'项目 A' if z else 'Project A',11,True);f.text(23,83,['事前预测','实际证据与替代解释'] if z else ['Prior predictions','Evidence and alternatives'],9.5)
 f.box('conditional-rule',176,40,139,80,PALE);f.text(187,60,'条件性经验' if z else 'Conditional inference',11,True);f.text(187,83,['保留关系及适用条件','注明来源和不确定性'] if z else ['Retain conditions','Keep sources and uncertainty'],9.2)
 f.box('project-b',340,40,139,80,'#f4f6f6');f.text(351,60,'项目 B' if z else 'Project B',11,True);f.text(351,83,['条件仍然成立吗？','新预测与新证据'] if z else ['Do the conditions hold?','New predictions and evidence'],9.2)
 f.arrow(153,80,172,80);f.arrow(317,80,336,80)
 f.box('match',12,144,226,52);f.text(23,164,'行业不同，关系可能相同' if z else 'Different industry, similar conditions',10,True);f.text(23,183,'检验旧经验的适用性' if z else 'Test whether the inference transfers',9.5)
 f.box('mismatch',253,144,226,52,SAND);f.text(264,164,'外观相似，条件可能改变' if z else 'Similar surface, changed conditions',10,True);f.text(264,183,'避免机械套用旧结论' if z else 'Check for negative transfer',9.5)
 f.text(12,228,'待检验过程  /  以新的判断行为评价学习，而非记录篇幅' if z else 'Proposed process / Evaluate new decisions rather than document length',9)
 f.save(3,lang)
print('Prepared 12 references, document builder, and 6 editable SVGs')
