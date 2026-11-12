"""Package verified final artifacts and transparent reproduction materials."""
from pathlib import Path
import json,re,csv,zipfile,hashlib,unicodedata
from pypdf import PdfReader
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parent
D=json.loads((ROOT/'content_bilingual.json').read_text(encoding='utf-8'))
STATUS=json.loads((ROOT/'internal_status.json').read_text(encoding='utf-8'))
NUM=STATUS['references']
def cite(t):return re.sub(r'(?:\[@E\d+\])+',lambda m:'['+', '.join(str(x) for x in sorted({NUM[e] for e in re.findall(r'E\d+',m.group())}))+']',t)
def norm(t):return re.sub(r'\s+','',unicodedata.normalize('NFKC',t)).replace('_','').replace('\u00ad','')
validation={}
for lang in ['en','zh']:
    d=D[lang]
    paragraphs=[d['abstract']]+[t for sections in d['pages'].values() for sec in sections for t in sec['paragraphs'] if not t.startswith(('Δx_i','Δz_j','ΔW ='))]
    for variant,file in [('pdf',ROOT/f'Health_value_AI_{lang.upper()}.pdf'),('word',ROOT/'qa'/f'Word_{lang.upper()}.pdf')]:
        text=norm(''.join(p.extract_text() for p in PdfReader(file).pages))
        missing=[]
        for i,p in enumerate(paragraphs):
            if norm(cite(p)) not in text:missing.append(i)
        validation[lang+'_'+variant]={'complete_prose_paragraphs':len(paragraphs)-len(missing),'expected':len(paragraphs),'missing':missing}
        assert not missing,(lang,variant,missing)

rows=[['location','evidence_id','quantity','value','unit','status','source_locator'],
['Table 2','E026','overall_sample',5172,'workers','source reported; outcome availability varies','Abstract and section IV.B'],
['Table 2','E026','rounded_productivity_gain',15,'percent','source reported abstract rounding; preferred estimate 15.2%','Abstract; section V.A and Table II column 3'],
['Overtime case','E027','sleep_restriction_randomized',35,'participants','9 + 13 + 13, original group counts','Methods p.118'],
['Overtime case','E027','total_deprivation_experiment',13,'participants','source reported','Methods p.118'],
['Overtime case','E027','restriction_duration',14,'nights','source reported','Abstract and Methods']]
with (ROOT/'additional_evidence_data.csv').open('w',encoding='utf-8-sig',newline='') as f:csv.writer(f).writerows(rows)

README='''# 中英文论文定稿

题目：人工智能时代的健康经济价值与跨期选择

English title: Health economic value and intertemporal choice in the age of artificial intelligence

## 阅读文件

- `Health_value_AI_EN.pdf`：英文图文版，12 页。
- `Health_value_AI_EN.docx`：英文可编辑版，12 页。
- `Health_value_AI_ZH.pdf`：中文图文版，12 页。
- `Health_value_AI_ZH.docx`：中文可编辑版，12 页。

两种语言包含对应的摘要、42 段正文（含 3 个展示公式）、8 幅原创图、3 张表及 27 条参考文献。中文图中文字、图注、表格和声明已本地化；参考文献保留原文书目信息。正文另含一项加班补贴算式。论文按概念性 Perspective 撰写；它提出比较程序与可检验命题，没有将文献数据或假设案例表述为作者完成的实验。

## 本轮实质修订

重新组织核心贡献，使“经济回报如何转化为实际生活后果”贯穿定义、形式表达、案例与制度讨论。明确健康经济价值不等同于总体福祉或人的价值，区分测量、预测和价值判断，并处理重复计量、偏好异质性和不确定性。

补入 QJE 的 AI 真实工作场所研究和受控睡眠限制研究，平衡 AI 收益与风险；补充可被削弱或否定的研究命题表。加班案例统一为 28 天时间窗口，并说明恢复和长期后果需要独立证据。全文保留原有数据区间的含义，没有构造通用健康价格。

## 图表与复现材料

`figures/en` 与 `figures/zh` 包含逐图 SVG、PDF 矢量版及 300 dpi PNG。`figure_data.csv` 区分文献报告数据、由标准误计算的绘图区间和假设算例。`additional_evidence_data.csv` 记录新增研究的数字与定位。

`content_bilingual.json` 是两种语言的共同内容源；`references.json` 保存文献、链接、阅读深度、定位和限制；`figure_localization.json` 保存图中文字对应关系。`build.py`、`figures_original.py` 和 `figure_translations.py` 可重新生成稿件和图表。环境使用 Python 的 ReportLab、python-docx、pypdfium2 及 Windows 字体；运行 `python -X utf8 build.py`。`qa.py` 与 `export_word_pdf.ps1` 用于版面核查；渲染所用 Word PDF 属于检查文件。

PDF 与 DOCX 分别进行了实际页面渲染检查。两种格式排版存在正常细微差异，科学内容保持对应。定稿文件沿用原创学术版式，没有使用出版社标识或宣称已发表。
'''
(ROOT/'README.md').write_text(README,encoding='utf-8')
audit={'date':'2026-11-06','this_round_primary_sources_checked':[
{'id':'E026','url':'https://academic.oup.com/qje/article/140/2/889/7990658','sections':'Abstract, sample construction IV.B, empirical strategy IV.C, results V.A, Table II','checks':['5172 overall workers','staggered rollout is not random assignment','preferred productivity estimate 15.2%, abstract rounds to 15%','different outcome availability']},
{'id':'E027','url':'https://www.med.upenn.edu/uep/assets/user-content/documents/VanDongen2003CumulativeCost.pdf','sections':'Original PDF pp.117–118 abstract and Methods','checks':['48 total across two experiments, not 48 randomized to restriction','35 restriction participants (9+13+13)','13 total-deprivation participants','time in bed differs from actual sleep duration','cognitive performance is not direct neuronal destruction measurement']},
{'id':'E024','url':'https://pubmed.ncbi.nlm.nih.gov/42745006/','sections':'Metadata and abstract only','checks':['comprehension, agency, accountability and proportionality','no claim of full-text inspection']},
{'id':'E023','url':'https://arxiv.org/abs/2609.00065','sections':'Metadata and abstract','checks':['title, five authors, DOI','workflow disclosure only, not substantive health evidence']}],
'inherited_evidence_register':'references.json retains source-specific access and caveats from v3; this round does not assert all 27 originals were fully reread',
'human_verification_complete':False,'conceptual_framework_empirically_validated':False,
'renderer':'Bundled render_docx.py attempted for both documents; missing packaged soffice.exe. Word COM export and PDFium rasterization used for actual DOCX page inspection.',
'visual_repairs':['CJK mathematical minus and bullet font fallback','Chinese line-start punctuation exclusions','automatic paragraph height for inline Word illustrations'],
'semantic_checks':validation}
(ROOT/'qa'/'final_audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf-8')

# Actual-page overview, not a mock-up.
sheet=Image.new('RGB',(860,1120),'#e7ecef');draw=ImageDraw.Draw(sheet)
for col,lang in enumerate(['EN','ZH']):
    for row,page in enumerate([1,7]):
        im=Image.open(ROOT/'qa'/lang/f'page{page:02}.png').convert('RGB');im.thumbnail((410,530))
        x=col*430+(430-im.width)//2;y=22+row*555;sheet.paste(im,(x,y));draw.text((col*430+15,y-16),f'{lang} / {page}',fill='#364c57')
sheet.save(ROOT/'preview.png')

include=['README.md','content_bilingual.json','references.json','figure_data.csv','additional_evidence_data.csv','figure_localization.json','build.py','figures_original.py','figure_translations.py','manuscript_en.md','manuscript_zh.md']
with zipfile.ZipFile(ROOT/'Figures_data_and_sources.zip','w',zipfile.ZIP_DEFLATED) as z:
    for name in include:z.write(ROOT/name,name)
    for file in (ROOT/'figures').rglob('*'):
        if file.is_file():z.write(file,file.relative_to(ROOT))
manifest={p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in [ROOT/f'Health_value_AI_{l}.{e}' for l in ['EN','ZH'] for e in ['pdf','docx']]+[ROOT/'Figures_data_and_sources.zip']}
(ROOT/'delivery_manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps({'semantic_checks':validation,'delivery':manifest},ensure_ascii=False))
