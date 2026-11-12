from pathlib import Path

root = Path(__file__).resolve().parent
s = (root / 'build_book.py').read_text(encoding='utf-8')
s = s.replace('from reportlab.platypus import Paragraph, Table, TableStyle', '''from reportlab.platypus import Paragraph, Table, TableStyle
import reportlab.lib.textsplit as cjk_textsplit
import reportlab.platypus.paragraph as cjk_paragraph
# ReportLab's Japanese-oriented defaults omit Chinese full-width punctuation.
# Extend line-start prohibition locally, without changing bundled libraries.
cjk_textsplit.ALL_CANNOT_START += '，；：！？）》】」』”’、。'
cjk_paragraph.ALL_CANNOT_START = cjk_textsplit.ALL_CANNOT_START''')
s = s.replace('from book_content import TITLE,SUBTITLE,DATE,PAGES,REF_IDS', 'from academic_content import TITLE,SUBTITLE,DATE,PAGES,APPENDICES,REF_IDS')
s = s.replace("QA=ROOT/'qa'", "QA=ROOT/'qa_academic'")
s = s.replace("'C:/Windows/Fonts/msyh.ttc'", "'C:/Windows/Fonts/simsun.ttc'")
s = s.replace("'把健康放回日常生活_正式图文版.pdf'", "'健康生活方式_学术修订版.pdf'")
s = s.replace("'把健康放回日常生活_正式文字稿.md'", "'健康生活方式_学术修订稿.md'")
s = s.replace("'figure1_health_literacy.png'", "'figure1_health_literacy_academic.png'")
s = s.replace("'figure2_ssass_stroke.png'", "'figure2_ssass_stroke_academic.png'")
s = s.replace("c.setAuthor('AI辅助撰写');c.setSubject('循证健康生活论述与日常场景实践')", "c.setAuthor('');c.setSubject('健康生活方式的证据综合与情境化分析')")
start=s.index("source=json.loads(")
end=s.index('\ndef style(',start)
s=s[:start]+'''# References are renumbered by first occurrence in the full manuscript.
original_refs=json.loads((ROOT/'academic_references.json').read_text(encoding='utf-8'))
lookup={r['number']:r for r in original_refs}
order=[]
def collect(obj):
 if isinstance(obj,str):
  for hit in re.finditer(r'\\[(\\d+(?:,\\d+)*)\\]',obj):
   for n in map(int,hit.group(1).split(',')):
    if n not in order:order.append(n)
 elif isinstance(obj,dict):
  for value in obj.values():collect(value)
 elif isinstance(obj,(list,tuple)):
  for value in obj:collect(value)
collect(PAGES+APPENDICES)
assert set(order)==set(range(1,20)),order
number_map={old:new for new,old in enumerate(order,1)}
def renumber(obj):
 if isinstance(obj,str):
  return re.sub(r'\\[(\\d+(?:,\\d+)*)\\]',lambda m:'['+','.join(map(str,sorted(number_map[int(n)] for n in m.group(1).split(','))))+']',obj)
 if isinstance(obj,dict):return {k:renumber(v) for k,v in obj.items()}
 if isinstance(obj,list):return [renumber(v) for v in obj]
 if isinstance(obj,tuple):return tuple(renumber(v) for v in obj)
 return obj
PAGES=renumber(PAGES);APPENDICES=renumber(APPENDICES)
refs=[{'number':i+1, 'source_number':n, **{k:v for k,v in lookup[n].items() if k!='number'}} for i,n in enumerate(order)]
(ROOT/'academic_reference_index.json').write_text(json.dumps(refs,ensure_ascii=False,indent=2),encoding='utf-8')
report=[];md=['# '+TITLE,'','## '+SUBTITLE,'',DATE,'']
''' +s[end:]
s=s.replace("c.rect(0,H-9,W,9", "c.rect(0,H-4,W,4")
s=s.replace("'健康生活  /  循证论述与情境实践'", "'中国成年人健康生活方式的日常实施'")
s=s.replace('size=22,leading=30', 'size=20,leading=29')
s=s.replace("('能力','知道怎样做\\n具备相应技能'),('机会','有时间与场所\\n有人提供支持'),('动机','认同它的意义\\n有具体触发情境')", "('能力','知识与操作技能\\n身体能力'),('机会','物理环境\\n社会条件'),('动机','反思性判断\\n自动化过程')")
s=s.replace("'选择一个可行行动 → 观察体验 → 调整条件'", "'实施条件识别 → 策略选择 → 过程评价'")
s=s.replace("'示例另在周二、周六安排适合自己的肌肉强化活动。'", "'肌肉强化安排：周二、周六；具体内容依据身体能力确定。'")
start=s.index('for pi,page in enumerate(PAGES,1):')
end=s.index('\nfor refpage,',start)
block=s[start:end]
block=block.replace('for pi,page in enumerate(PAGES,1):', 'def draw_page(pi,page):\n global md')
block=block.replace("'健康科学专题  /  叙述性综述与实践框架'", "'叙述性综述与概念框架'")
block=block.replace('H-73,CW,31,43','H-73,CW,24,35')
block=block.replace('H-122,CW,12.6,21','H-115,CW,14,22')
block=block.replace("DATE+'  ·  正式图文版'", "DATE+'  ·  学术修订稿'")
block=block.replace('H-154,CW,9.2,15','H-151,CW,9.2,15')
block=block.replace("  y-=imagebox('生活场景插图.png',y,170)+6\n  y-=pdraw('情境插画  /  AI生成，非真实人物或病例',M,y,CW,8,12,GRAY)+16\n",'')
block=block.replace('size=10.1 if pi==1 else 10.7;lead=17 if pi==1 else 18.3', 'size=10.7;lead=18.3')
block=block.replace("  elif k=='comb':y-=comb(y)+8;md+=['能力（知识技能）、机会（时间场所支持）与动机（意义及情境）共同用于诊断行动障碍。','']", "  elif k=='comb':y-=comb(y)+8;md+=['能力（知识、技能和身体条件）、机会（物理与社会条件）、动机（反思性与自动化过程）；实施分析步骤：条件识别、策略选择、过程评价。','']")
block=block.replace(" if pi==1 and y>114:\n  imagebox('health_theme_icons.png',y-5,48)\n  y-=57", " if pi==1:\n  y-=10\n  y-=imagebox('生活场景插图.png',y,158)+6\n  y-=pdraw('日常生活情境示意（AI生成插图）',M,y,CW,8,12,GRAY)+10\n  md+=['![日常生活情境示意]('+str((AS/'生活场景插图.png').resolve())+')','']")
s=s[:start]+block+s[end:]
start=s.index('for refpage,')
end=s.index('reader=PdfReader',start)
s=s[:start]+'''for i,page in enumerate(PAGES,1):draw_page(i,page)

for refpage,(start,end) in enumerate([(1,10),(11,19)],10):
 y=base(refpage,'参考文献','参考文献')
 if refpage==10:
  md+=['## 参考文献','']
  y-=pdraw('按正文首次引用顺序编码；网络资料访问日期为2026年11月12日。',M,y,CW,9,15,GRAY)+18
 for rn in range(start,end+1):
  r=refs[rn-1];url=r['url']
  y-=pdraw('['+str(rn)+'] '+clean(r['citation']),M,y,CW,9.3,15.7)+4
  y-=pdraw(f'<link href="{html.escape(url,quote=True)}" color="#176B69">原文链接</link>',M,y,CW,8.3,13,TEAL)+16
  md += [f'[{rn}] '+r['citation']+' [原文]('+url+')','']
 if refpage==11:
  y-=10
  y-=pdraw('资料与图像说明',M,y,CW,11,18,INK,True)+9
  disclosure='本文未收集原创受试者数据。场景、标签算例及附录日程为分析性示例；统计图依据所引文献的公开数值绘制。两张情境插图由OpenAI内置图像生成工具生成。ChatGPT/Codex用于资料辅助整理、语言编辑、图表绘制与排版。'
  y-=pdraw(disclosure,M,y,CW,9.3,16)+12
  software='辅助工作流文献：Kassis T, Agarwal V, He Y, et al. Scientific Agent Skills: A Library of Procedural Knowledge for Research Agents. 2026. '
  y-=pdraw(software+'<link href="https://arxiv.org/abs/2609.00065" color="#176B69">arXiv:2609.00065</link>.',M,y,CW,8.2,13,GRAY)
  md+=['## 资料与图像说明','',disclosure,'',software+'[arXiv:2609.00065](https://arxiv.org/abs/2609.00065).','']
 if y<49:raise RuntimeError(f'References page {refpage} overflow: {y:.1f}')
 report.append({'page':refpage,'bottom':round(y,2)})
 c.showPage()

for i,page in enumerate(APPENDICES,12):draw_page(i,page)
c.save()
from format_academic_markdown import format_manuscript
if not PREFLIGHT:(OUT/'健康生活方式_学术修订稿.md').write_text(format_manuscript('\\n'.join(md)),encoding='utf-8')
''' +s[end:]
(root/'build_academic.py').write_text(s,encoding='utf-8')
print('Prepared build_academic.py')
