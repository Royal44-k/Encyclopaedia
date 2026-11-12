"""Scenario expansion and paired language edits; all new cash amounts are assumptions."""
from pathlib import Path
import json, re
R=Path(__file__).resolve().parent
B=R.parent/'health_value_ai_revised'
D=json.loads((B/'content_bilingual.json').read_text(encoding='utf-8'))

def paired(page,index,zh,en):
    D['zh']['pages'][str(page)][0]['paragraphs'][index]=zh
    D['en']['pages'][str(page)][0]['paragraphs'][index]=en

D['zh']['abstract']='多拿一笔加班费、少花一些做饭时间，或借助人工智能更快完成任务，都是容易看见的收益。伴随这些收益的睡眠变化、身体负担和恢复时间，却未必进入同一笔账。本文结合健康资本、时间配置、健康可行能力与决策分析，提出健康后果比较框架：在共同期限内比较现实可行的方案，分别记录资源与时间、健康与功能、主观体验、能力与自主性，再结合个人目标判断取舍。框架区分状态测量、结果预测和价值评价，保留各项结果的单位、发生时点及不确定性。人工智能使这一区分尤为必要：任务提速不一定增加休息，辅助条件下的表现改善也不等于独立能力提高。本文通过单日与连续加班、日常饮食、数字休闲等案例，说明如何将这些差异纳入比较，并提出关于时间收益分配、效果持续性和决策质量的可检验命题。评价的目的，是帮助人们看清选择的条件与后果，而非给健康标出统一价格，或规定所有人应当如何生活。'
D['en']['abstract']='Overtime pay, time saved on meals and faster AI-assisted work offer readily visible gains. Changes in sleep, physical burden and recovery time may be less visible in the same decision. Drawing on health capital, time allocation, health capability and decision analysis, we propose a framework for comparing health-related consequences. Feasible alternatives are compared over a common horizon across resources and time, health and functioning, experience, and capability and agency, before differences are appraised against personal priorities. The framework separates measurement, prediction and appraisal while retaining units, timing and uncertainty. This distinction matters in the AI era: faster tasks need not create more rest, and better assisted performance need not imply improved independent ability. Cases involving single-day and repeated overtime, everyday food choices and digital leisure illustrate the approach. We develop testable propositions concerning the allocation of time gains, persistence of effects and decision quality. The purpose is to clarify the conditions and consequences of choices, rather than assign health a universal price or prescribe a common way of life.'

paired(2,0,
'一笔加班费能否让生活过得更好，不能只看到账金额。同样是增加收入，有人延长白天工作，有人连续上夜班，也有人借助 AI 提高效率。三种安排对睡眠、精力和家庭时间的影响可能不同。比较应从具体生活出发：钱增加了多少，时间用在何处，第二天还能否正常工作、学习或照顾家人。图 1 将这些问题组织为共同框架，图 2 区分其中的测量、预测与评价。',
'Whether overtime pay improves life cannot be judged from the payment alone. Extra income may come from longer daytime work, repeated night shifts or greater efficiency with AI. These arrangements may differ in their implications for sleep, energy and family time. Comparison starts with concrete questions: how much money is gained, where time goes, and whether the person can work, study or care for family the next day. Figure 1 organizes these questions into a common framework; Figure 2 separates measurement, prediction and appraisal.')
paired(3,0,
'体检单可以告诉人们血糖处在什么范围，却不能直接回答一项选择是否值得。检测描述当前状态，干预研究估计改变饮食后可能出现的结果，而是否愿意为此付出金钱、时间或口味上的代价，还取决于个人目标。测量、预测和评价因此各有依据。参考区间不是人的价值尺度，群体研究的平均结果也不能直接当作个人的未来。',
'A laboratory report can describe a blood glucose level, but cannot by itself establish whether a choice is worthwhile. Measurement describes the current state; intervention research estimates possible consequences of changing diet; willingness to bear costs in money, time or taste depends on personal priorities. Measurement, prediction and appraisal therefore require different justifications. Reference ranges do not rank human worth, and average study results do not directly specify an individual future.')
paired(6,0,
'选择指标，先要说清准备作什么决定。比较一顿晚餐，可能需要了解价格、准备时间和饱腹感；比较一个月的夜班，则还要关注睡眠、白天功能和恢复安排。把所有体检项目都放进评价，未必比选准几项关键指标更有帮助。应先确认备选方案可行、观察期限一致，再按基线状况和主要关切选择指标。图 4 给出这一选择的层次。',
'Measures should follow the decision. A dinner comparison may require price, preparation time and satiety; night-work comparisons also need sleep, functioning and recovery. Select relevant measures rather than every available test, after establishing feasible alternatives, a common horizon and baseline conditions. Figure 4 organizes these measurement levels.')
paired(6,2,
'身体指标需要说明测量的对象和实际意义。血糖、血脂、血压、肌力、视力和皮肤症状分别回答不同问题，笼统的“血液质量”不能代替它们。即使数值变化，也要结合基线、测量条件和适宜范围解释。皮肤不适或外观变化可以影响感受与交往，但不能仅凭肤色、头发或体形判断内部器官的状态。身体与心理相互联系，具体联系仍需测量；健康状况的差异更不能成为衡量人的尊严与价值的尺度。',
'Glucose, lipids, blood pressure, strength, vision and skin symptoms answer different questions; blood quality is too vague. Changes require interpretation against baseline, measurement conditions and appropriate ranges. Appearance may affect experience but cannot establish internal organ status. Physical–psychological relationships require measurement, and differences in health must not become a ranking of human dignity or worth.')

# Clarify what the workplace study could not observe.
D['zh']['pages']['5'][0]['paragraphs'][0]=D['zh']['pages']['5'][0]['paragraphs'][0].replace('优选估计显示','主分析显示')+' 研究未掌握薪酬数据，生产率增益因而不能直接解释为劳动者收入增长。[@E026]'
D['en']['pages']['5'][0]['paragraphs'][0]+=' The study lacked compensation data, so productivity gains cannot directly be interpreted as increased worker income.[@E026]'

# Rename figures once, preserving first-appearance numbering.
fmap={6:7,7:10,8:11}
def renumber(t):
    t=re.sub(r'图 ([678])(?!\d)',lambda m:'图 '+str(fmap[int(m[1])]),t)
    return re.sub(r'(Figure|Fig\.) ([678])(?!\d)',lambda m:m[1]+' '+str(fmap[int(m[2])]),t)
for lang,d in D.items():
    for secs in d['pages'].values():
        for sec in secs:sec['paragraphs']=[renumber(p) for p in sec['paragraphs']]
    d['captions']={str(fmap.get(int(k),int(k))):renumber(v) for k,v in d['captions'].items()}
    old=d['pages'];d['pages']={k:v for k,v in old.items() if int(k)<8}
    d['pages']['12']=old['9'];d['pages']['13']=old['10']
    # Existing monthly case, retained separately from the new daily comparison.
    monthly=old['8'][0]['paragraphs'][:3]
    monthly[0]=monthly[0].replace(' 元（4）',' 元').replace(' (4)','')
    d['pages']['9']=[{'heading':'案例二　把一周与一个月放在同一期限内比较' if lang=='zh' else 'Case 2  Comparing a week with a month', 'paragraphs':monthly}]

new={
'8':{
'zh':('七、典型情境中的权衡',[
'<b>案例一：200 元日薪与夜间加班补贴。</b>设普通日薪为 200 元；工作到凌晨两点另补 400 元，通宵另补 1,000 元。为便于比较，设金额均已扣税费，普通日薪不变，则当天净收入分别为 200、600 和 1,200 元（图 6）。若 400 元和 1,000 元实际指当天总收入，增量就分别是 200 元和 800 元。先分清日薪、补贴与总收入，才能避免在起点上算错账。',
'钱款明确以后，还需把时间安排写完整：几点开始工作，次日几点起床，是否仍要上班，通勤和照护能否调整。同样在凌晨两点结束工作，次日可休息与清晨必须到岗，是两个不同的方案。不能仅凭结束时刻推定睡眠时长，也不能只比较加班当晚，而遗漏次日的功能与恢复。',
'“是否赚了”的判断还取决于收入用途。补贴若用于支付房租或照护费用，可能解除眼前困难；即便如此，也仍应记录疲劳、活动受限和其他负担。反过来，未出现明显不适，也不足以确认没有影响。可先将确定的收入增量、需要观察的功能变化和仍未知的长期后果并列，允许当事人说明哪些损失不可接受。',
'两种备选方案以外，往往还有可以协商的安排，例如减少连续夜班、设置次日休息或允许中途退出。将这些条件纳入比较，讨论便从“健康值多少钱”转向“怎样在满足收入需要的同时保留更多健康与生活空间”。这些安排是待评估的选项，其效果仍需实际资料支持。']),
'en':('Trade-offs in everyday settings',[
'<b>Case 1: daily pay and overnight supplements.</b> Suppose ordinary daily pay is CNY 200, with an additional CNY 400 for working until 02:00 or CNY 1,000 for working through the night. Assuming all amounts are net of tax and ordinary pay is unchanged, daily income is CNY 200, 600 or 1,200 (Fig. 6). If CNY 400 and 1,000 instead denote total daily pay, the increments are CNY 200 and 800. Distinguishing base pay, supplements and total income prevents an initial accounting error.',
'The schedule must then be specified: when work starts, when the person must rise the next day, whether another shift follows, and whether commuting or care duties can change. Finishing at 02:00 with a day off is a different option from finishing at 02:00 before an early shift. An end time alone does not establish sleep duration, and comparison should extend beyond the work episode to subsequent functioning and recovery.',
'Whether the person gains also depends on what the money enables. Paying rent or care costs may relieve an immediate difficulty; fatigue, restricted activities and other burdens still belong in the comparison. Conversely, the absence of obvious discomfort does not establish an absence of effects. Confirmed income changes, functioning that needs observation and unknown longer-term consequences can be listed separately, allowing the person to identify losses they regard as unacceptable.',
'Negotiable arrangements may enlarge the choice set: fewer consecutive night shifts, protected time off or the ability to stop. Including them turns a question about the price of health into a comparison of ways to meet income needs while preserving health and valued activities. These are options to evaluate; their effects require evidence.'])},
'10':{
'zh':('案例三　晚餐的价格之外',[
'比较一份方便购买的晚餐与一顿自己准备的饭，不能只看食材或标价。假设两种安排分别持续四周，应把食材和外卖费用、采购与烹调时间、清理负担、口味及可持续性一并列出（图 8）。有厨房、下班时间固定的人，与轮班工作、缺少做饭条件的人，面对的可行选项并不相同。',
'“垃圾食品”是日常用语，不是足够明确的研究暴露。研究需要说明食品组成、加工分类、摄入量和持续时间，不能将外卖一概视为超加工食品，也不能将家庭烹饪等同于营养均衡。Hall 等的供餐试验观察到能量摄入差异，但短期葡萄糖耐量和连续血糖监测结果未见显著组间差异；这既不证明长期无影响，也不支持“每项内部指标必然更差”。[@E019]',
'这个案例的经济含义在于，准备一餐饭也消耗时间和劳动。家庭内部由谁采购、烹调和清洗，应当进入记录；便利带来的时间收益，同样值得评价。实用的比较可以从少量可持续的调整开始，例如改变可获得的菜品组合、减少准备负担，再观察饮食体验与相关结果，而不是先要求当事人接受一种理想化菜单。']),
'en':('Case 3  Beyond the price of dinner',[
'Comparing a convenient purchased dinner with a meal prepared at home requires more than ingredients or price. Suppose the alternatives are maintained for four weeks. Food expenditure, shopping, cooking and cleaning time, taste and feasibility all enter the comparison (Fig. 8). A person with a kitchen and predictable hours faces different options from a shift worker with limited cooking facilities.',
'Junk food is an everyday label rather than a sufficiently defined research exposure. Food composition, processing category, intake and duration need specification: takeaway is not synonymous with ultra-processed food, nor home cooking with a balanced diet. Hall and colleagues observed an energy-intake difference, but no significant between-diet differences in short-term glucose tolerance or continuous glucose measures. This neither establishes long-term equivalence nor supports deterioration in every internal measure.[@E019]',
'The economic point is that preparing a meal also uses time and labour. Who shops, cooks and cleans within the household belongs in the account, alongside the time gained from convenience. A practical comparison can begin with feasible changes in available meal combinations or preparation burden, followed by observation of eating experience and relevant outcomes, rather than requiring an idealized menu in advance.'])},
'11':{
'zh':('案例四　屏幕、陪伴与一个晚上的去向',[
'假设晚饭后有两小时可自由安排：看短剧或玩游戏、与 AI 交谈、读书、散步或见朋友，都是候选活动（图 9）。评价首先要弄清它们替代了什么。对一个人而言，游戏可能挤占原定睡眠；对另一个人而言，同样的活动可能替代独处时的无聊。不能只按“线上”或“线下”为活动排序，也不能把每一分钟闲暇都要求为提高生产率服务。',
'比较可以从当晚延伸到次日及随后数周，分别询问：活动当时是否愉快，结束后是否仍感到满足，能否按原计划停止，第二天能否完成自己重视的事情。若关注注意力，应明确测量持续注意、任务切换还是记忆；“耐心值”也需要转化为具体行为，不能凭看了多久短视频就判定认知能力下降。上述问题用于组织观察，并非已经确立的因果路径。',
'AI 陪伴还需要区分即时支持与持续改变。已有研究记录到互动后的孤独缓解，但对长期效果的判断仍受随访与对照设计限制。[@E013] 在具体案例中，可观察它是否补充原有支持、是否伴随睡眠推迟，以及使用者能否自主结束互动。由此得到的评价应尊重愉悦和支持本身的价值，也保留调整使用方式的空间。',
'同一原则适用于 AI 饮食或医疗建议。一次回答听起来可信，和使用者据此作出恰当决定，是不同的结果；医疗场景实验已经显示模型单独作答与人机互动表现之间的差距。[@E014] 研究应检验使用者能否理解建议、识别适用范围并采取恰当行动，而不能用回答的流畅程度代替效果。']),
'en':('Case 4  Screens, companionship and an evening',[
'Suppose two hours after dinner are discretionary. Short dramas or games, AI conversation, reading, walking and meeting friends are candidate activities (Fig. 9). Appraisal first asks what each displaces. Gaming may displace intended sleep for one person and otherwise unstimulating time alone for another. Online and offline activities cannot be ranked by their labels alone, and leisure need not justify every minute through increased productivity.',
'Observation can extend from the evening to the next day and subsequent weeks: was the activity enjoyable, did satisfaction persist, could the person stop as planned, and could they carry out valued activities the next day? Attention needs a specified construct, such as sustained attention, switching or memory. Patience likewise needs a defined behaviour; viewing duration alone cannot diagnose cognitive decline. These questions organize observation rather than establish causal pathways.',
'AI companionship also calls for separating immediate support from persistent change. Research has recorded post-interaction loneliness relief, while follow-up and comparator design constrain conclusions about persistence.[@E013] A case comparison can examine whether use supplements existing support, accompanies later sleep, and remains under the user’s control. Appraisal can recognize enjoyment and support as valuable while preserving scope to change use.',
'The same principle applies to AI food or medical advice. A credible-sounding answer and an appropriate user decision are different outcomes; medical-scenario experiments have demonstrated a gap between models acting alone and human–AI interactions.[@E014] Evaluation should examine understanding, recognition of applicability and appropriate action, rather than treating verbal fluency as effectiveness.'])}}

for page,versions in new.items():
    for lang,(heading,paragraphs) in versions.items():
        D[lang]['pages'][page]=[{'heading':heading,'paragraphs':paragraphs}]
for lang in ['en','zh']:
    D[lang]['pages']=dict(sorted(D[lang]['pages'].items(),key=lambda kv:int(kv[0])))
    D[lang]['captions']['6']=('<b>图 6 | 当天收入与夜间安排。</b>情境插画。假设日薪为 200 元，400 元和 1,000 元均为额外净补贴，故总收入为 600 元和 1,200 元。图像不代表真实受试者或健康结果。' if lang=='zh' else '<b>Fig. 6 | Daily income and overnight schedules.</b>Conceptual illustration. With CNY 200 base pay and additional net supplements of CNY 400 or 1,000, totals are CNY 600 or 1,200. The image does not depict study participants or measured health outcomes.')
    D[lang]['captions']['8']=('<b>图 8 | 一顿饭涉及的资源与生活条件。</b>情境插画。购餐与自行准备都需要结合具体食品、时间、劳动分担和可获得性评价；图中不预设健康结果。' if lang=='zh' else '<b>Fig. 8 | Resources and circumstances behind a meal.</b>Conceptual illustration. Purchased and home-prepared meals require appraisal of the actual food, time, labour and availability; health outcomes are not assigned by the image.')
    D[lang]['captions']['9']=('<b>图 9 | 闲暇活动及其后续影响。</b>情境插画。数字互动、阅读、活动与交往均为备选安排，须结合替代活动、体验持续性和自主性比较。' if lang=='zh' else '<b>Fig. 9 | Leisure activities and what follows.</b>Conceptual illustration. Digital interaction, reading, movement and social contact are alternatives to compare in terms of displacement, persistence of experience and agency.')

D['zh']['tables']['2']['rows'][1][2]='未测量全天时间配置与健康'
D['en']['tables']['2']['rows'][1][2]='Full-day allocation and health not measured'
for key in ['6','8','9']:
    D['en']['captions'][key]=D['en']['captions'][key].replace('</b>Conceptual','</b> Conceptual')
def spaces(value):
    if isinstance(value,str):return re.sub(r'(?<=[A-Za-z.?!;:])(\[@E\d+\])',r' \1',value)
    if isinstance(value,list):return [spaces(x) for x in value]
    if isinstance(value,dict):return {k:spaces(v) for k,v in value.items()}
    return value
D['en']=spaces(D['en'])

# Preserve reference mappings from the underlying edition. Confirm all inserted IDs.
refs=json.loads((B/'references.json').read_text(encoding='utf-8'))
ids={r['id']:r['title'] for r in refs}
assert 'Ultra-processed diets' in ids['E019'],ids['E019']
assert 'AI companions' in ids['E013'],ids['E013']
assert 'Reliability' in ids['E014'],ids['E014']
for r in refs:
    if r['id']=='E019':
        r['read_depth']='Original full-text sections reopened 2026-11-07: Summary, Results, Glucose Tolerance, Limitations and STAR Methods.'
        r['locator']='PMC7946062, Glucose Tolerance (Figure 4); Limitations of Study; energy-intake results and original figure.'
        r['caveat']='No significant glucose differences are not evidence of equivalence. Provided meals do not estimate household price/time choice effects.'
(R/'references.json').write_text(json.dumps(refs,ensure_ascii=False,indent=2),encoding='utf-8')
(R/'content_bilingual.json').write_text(json.dumps(D,ensure_ascii=False,indent=2),encoding='utf-8')
print('Paired scenario content prepared.')

