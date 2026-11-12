"""Venue-specific editing; preserve scientific evidence IDs and numerical claims."""
from pathlib import Path
import json,re,copy
R=Path(__file__).resolve().parent
D=json.loads((R/'content_bilingual.json').read_text(encoding='utf-8'))
OUT={}
for lang,d in D.items():
    cn=lang=='zh';p=copy.deepcopy(d['pages'])
    if cn:
        p['2'][0]['paragraphs'][0]=p['2'][0]['paragraphs'][0].replace('借助 AI','借助人工智能（AI）').replace('图 1 将这些问题纳入同一框架，图 2 区分测量、预测与评价。','图 1 区分测量、预测与评价，扩展数据图 1 汇总比较框架。')
        p['3'][0]['paragraphs'][2]=p['3'][0]['paragraphs'][2].replace('多准则决策分析','多准则决策分析（MCDA）')
        p['5'][0]['paragraphs'][0]+=' 补充表 2 汇总不同研究的设计、结局与适用范围。'
        p['5'][0]['paragraphs'][3]=p['5'][0]['paragraphs'][3].replace('；图 5d 展示对照组相对 AI 辅助组的病情识别结果','，研究比较了对照组与 AI 辅助组的病情识别结果')
        p['6'][0]['paragraphs'][3]=p['6'][0]['paragraphs'][3].replace('WHO-5 反映','世界卫生组织五项心理福祉指数（WHO-5）反映')
    else:
        p['2'][0]['paragraphs'][0]=p['2'][0]['paragraphs'][0].replace('efficiency with AI','efficiency with artificial intelligence (AI)').replace('Figure 1 brings these questions together; Figure 2 separates measurement, prediction and appraisal.','Fig. 1 separates measurement, prediction and appraisal; Extended Data Fig. 1 brings the comparison framework together.')
        p['3'][0]['paragraphs'][2]=p['3'][0]['paragraphs'][2].replace('multicriteria decision analysis','multicriteria decision analysis (MCDA)')
        p['5'][0]['paragraphs'][0]+=' Supplementary Table 2 summarizes study designs, outcomes and scope.'
        p['5'][0]['paragraphs'][3]=p['5'][0]['paragraphs'][3].replace('; Figure 5d shows identification in the control group relative to pooled AI assistance',', with identification compared between control and pooled AI assistance')
        p['6'][0]['paragraphs'][1]=p['6'][0]['paragraphs'][1].replace('The ICF helps','The International Classification of Functioning, Disability and Health (ICF) helps')
        p['6'][0]['paragraphs'][3]=p['6'][0]['paragraphs'][3].replace('WHO-5 records','The World Health Organization-Five Well-Being Index (WHO-5) records')
    # Do not remap already-revised introduction. Other original cross-references map by number.
    fmap={3:('Extended Data Fig. 2','扩展数据图 2'),4:('Fig. 2','图 2'),5:('Fig. 3','图 3'),6:('Fig. 4a','图 4a'),7:('Fig. 4b','图 4b'),8:('Fig. 4c','图 4c'),9:('Fig. 4d','图 4d'),10:('Extended Data Fig. 3','扩展数据图 3'),11:('Extended Data Fig. 4','扩展数据图 4')}
    for page,ss in p.items():
        for sec in ss:
            sec['heading']=re.sub(r'^[一二三四五六七八九十]+、','',sec['heading'])
            for i,t in enumerate(sec['paragraphs']):
                if page!='2':
                    patt=r'图\s*(\d+)([a-d]?)' if cn else r'(?:Figure|Fig\.)\s*(\d+)([a-d]?)'
                    t=re.sub(patt,lambda m:fmap[int(m[1])][1 if cn else 0]+m[2],t)
                # Supplementary tables use their own explicit namespace.
                if cn:t=re.sub(r'(?<!补充)表\s*(\d+)',r'补充表 \1',t)
                else:t=re.sub(r'(?<!Supplementary )Table\s*(\d+)',r'Supplementary Table \1',t)
                # Define subscripts consistently in prose and equations.
                t=re.sub(r'\bT([01])\b',r'T_\1',t)
                t=re.sub(r'([xz])_([ijk])',r'\1_\2',t)
                sec['paragraphs'][i]=t
    # First section is an unheaded introduction; cases use second-level headings.
    sections=[]
    for page,ss in p.items():
        for s in ss:
            s['source_page']=int(page)
            s['level']=0 if page=='2' else 2 if page in ['9','10','11'] else 1
            if page=='8':
                title='案例一　日薪与夜间加班补贴' if cn else 'Case 1  Daily pay and overnight supplements'
                s['case_heading']=title
                s['paragraphs'][0]=re.sub(r'^<b>.*?</b>\s*','',s['paragraphs'][0])
            if page=='13':
                ending=s['paragraphs'][-2:];s['paragraphs']=s['paragraphs'][:-2]
                s['heading']='制度条件与分配' if cn else 'Institutions and distribution'
                sections.append(s)
                sections.append({'heading':'结语与展望' if cn else 'Conclusions and outlook','level':1,'paragraphs':ending,'source_page':13})
            else:sections.append(s)
    captions={}
    for new,old in [(1,2),(2,4),(3,5)]:
        cap=d['captions'][str(old)]
        cap=re.sub(r'(?:Fig\.|图)\s*\d+\s*\|\s*','',cap)
        captions[str(new)]=cap
    captions['3']+=(' RR，风险比；OR，比值比；CI，置信区间；SE，标准误。' if cn else ' RR, risk ratio; OR, odds ratio; CI, confidence interval; SE, standard error.')
    captions['4']=(
        '<b>日常选择的共同比较基准。</b>a，单日收入假设：普通日薪 200 元，额外补贴 400 元或 1,000 元，对应总收入 600 元或 1,200 元。b，以 28 天为共同期限，加班 7 天与 28 天的补贴分别为 1 万元与 10 万元；差额为 9 万元，并多出 21 个加班日。c，饮食比较同时记录钱款、准备与清理时间、体验及后续状态。d，比较两小时闲暇活动时，记录活动替代了什么，以及当晚、次日和后续的结果。a、b 为假设情境的算术比较；c、d 为观察项目，不代表实测效应。'
        if cn else
        '<b>A common basis for everyday comparisons.</b>a, Hypothetical daily income: CNY 200 base pay plus supplements of CNY 400 or 1,000 yields totals of CNY 600 or 1,200. b, Within a common 28-day horizon, supplements of CNY 10,000 for seven overtime days and CNY 100,000 for 28 days differ by CNY 90,000 and 21 overtime days. c, Food comparisons include expenditure, preparation and cleaning time, experience and subsequent states. d, Two-hour leisure choices require recording displaced activities and outcomes that evening, the next day and later. Panels a and b show hypothetical arithmetic; c and d identify observations, not estimated effects.')
    extended={}
    for new,old in [(1,1),(2,3),(3,10),(4,11)]:
        extended[str(new)]=re.sub(r'(?:Fig\.|图)\s*\d+\s*\|\s*','',d['captions'][str(old)])
    tables=copy.deepcopy(d['tables'])
    first_cells=(['专业写作 [@E011]\n随机研究；453 人','客户服务 [@E026]\n分阶段部署；5,172 人','AI 陪伴 [@E013]\n持续 7 天的研究 3','医疗场景 [@E014]\n1,298 人'] if cn else ['Professional writing [@E011]\nRandomized; n = 453','Customer support [@E026]\nStaggered rollout; n = 5,172','AI companionship [@E013]\nSeven-day Study 3','Medical scenarios [@E014]\nn = 1,298'])
    for row,value in zip(tables['2']['rows'][1:],first_cells):row[0]=value
    for n,tab in tables.items():
        tab['caption']=re.sub(r'(?:Table|表)\s*\d+\s*\|\s*','',tab['caption'])
    abstract=(
        '加班收入、便利饮食和人工智能（AI）提高的任务效率容易计入收益，相伴的睡眠变化、身体负担和恢复时间却常被遗漏。本文结合健康资本、时间配置、健康可行能力与决策分析，提出健康后果比较框架。在共同期限内，框架比较现实可行的方案，分别记录资源与时间、健康与功能、主观体验、能力与自主性，并依据个人目标评价取舍。测量、预测和评价各有依据，各项结果保留原有单位、发生时点及不确定性。任务提速未必增加休息，辅助表现改善也未必提高独立能力。本文以加班、饮食和数字休闲为例，说明比较方法，并提出关于时间收益分配、效果持续性和决策质量的可检验命题。框架旨在帮助人们理解选择的条件与后果，允许不同处境下的个人保留不同偏好。'
        if cn else
        'Overtime pay, convenient meals and faster work with artificial intelligence (AI) offer visible gains in money or time. Changes in sleep, physical burden and recovery may receive less attention. Drawing on health capital, time allocation, health capability and decision analysis, this Perspective proposes a framework for comparing health-related consequences. It compares feasible options over a common horizon, recording resources and time, health and functioning, experience, and capabilities and agency before appraisal against personal priorities. Measurement, prediction and judgement remain distinct; outcomes retain their units, timing and uncertainty. Faster tasks need not create more rest, and better assisted performance need not improve independent ability. Cases involving overtime, food choices and digital leisure illustrate the comparison. Testable propositions concern time allocation, persistence of effects and decision quality. The framework clarifies choices and consequences while allowing priorities to differ across people and circumstances.')
    OUT[lang]={'title':'人工智能时代的健康经济价值与跨期选择' if cn else 'Health economic value and choice in the age of artificial intelligence','abstract':abstract,'sections':sections,'captions':captions,'extended_captions':extended,'tables':tables}
(R/'content_nhb.json').write_text(json.dumps(OUT,ensure_ascii=False,indent=2),encoding='utf-8')
print({l:len(re.findall(r'\b[\w-]+\b',v['abstract'])) for l,v in OUT.items()})
