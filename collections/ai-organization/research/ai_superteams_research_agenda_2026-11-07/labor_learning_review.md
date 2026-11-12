# 劳动、技能学习、职业身份与工作体验：证据核验和独立选题

核验日期：2026-11-07（中国时间）。范围：经典机制论文及2023—2026年生成式AI研究。此稿是有目的的原始来源核验与研究议程，不是完成的系统综述；没有穷尽检索，也没有计算新的效应量。

配套清单：[labor_learning_sources.json](./labor_learning_sources.json)。共15项：14项学术论文/工作论文，其中包括1项整合性综述；另有1项实践文章作为问题线索。不能把15项都计为独立实证研究。JSON逐项标注发表状态、实际阅读深度和数据核验范围。经典论文若只读摘要，不在这里伪装为全文精读。

## 一、这组文献改变了哪些判断

**即时任务表现、学习、市场回报和工作体验是四种不同结果。** 写作实验显示即期生产率改善，但这不能直接推出技能积累或工资上涨。学习研究同时包含损害与增益：高中数学中的无保护回答工具、经过教学设计的物理辅导和新编程库学习并非相同处理。[Noy与Zhang](https://www.science.org/doi/10.1126/science.adh2586)、[Bastani等](https://pmc.ncbi.nlm.nih.gov/articles/PMC12232635/)、[Kestin等](https://pmc.ncbi.nlm.nih.gov/articles/PMC12179260/)、[Shen与Tamkin](https://arxiv.org/html/2601.20245v2)。

因此，不宜用一个“AI有益/有害”平均效应统摄这些研究。更有价值的区分是：**人在使用工具时产出得更好，是否也形成了离开工具后仍能调用的能力；而且哪些能力是原有操作技能，哪些是新出现的审查与整合技能。** 后半句目前主要还是待检验命题。自报思考投入下降不能替代客观技能测验；Lee等的调查恰好说明了这个测量边界。[Lee等](https://www.microsoft.com/en-us/research/publication/the-impact-of-generative-ai-on-critical-thinking-self-reported-reductions-in-cognitive-effort-and-confidence-effects-from-a-survey-of-knowledge-workers/)。

**省下局部任务时间并不等于总劳动负担下降。** Dillon等的随机分配研究提供部分工作行为改变的证据；Mazmanian等的自主性悖论说明，个体便利可能改变同事之间的可用性规范。Ranganathan的作者页面进一步提出任务扩张与工作边界变化，但这部分本轮没有核实完整方法，不能用来宣布总体因果效应。[Dillon等公开全文](https://arxiv.org/html/2504.11436v1)、[Mazmanian等](https://pubsonline.informs.org/doi/10.1287/orsc.1120.0806)、[Ranganathan作者研究页](https://www.arunaranganathan.com/research-topics/ai-at-work)。

**劳动力市场结果存在真正需要解释的分歧。** Canaries的2026修订说明把早期职业群体的弱势趋势定位为描述性信号，并交代前趋势、教育控制和数据源敏感性。Humlum–Vestergaard的2026年稿已改题，连接实际采用与行政记录，发现任务重组早于平均收入或记录工时变化；其对企业采用的分析不支持把观察到的年轻人就业下滑简单归因于采用者。这两者的国家、时间、样本、处理定义不同，不能把一个当成对另一个的直接复现或完全否定。[Canaries作者机构页](https://digitaleconomy.stanford.edu/publication/canaries-in-the-coal-mine-six-facts-about-the-recent-employment-effects-of-artificial-intelligence/)、[Humlum–Vestergaard 2026全文](https://www.andershumlum.com/s/chatbots_260313.pdf)。

**专业身份、声誉、社会关系和控制权也必须分开。** Reif等直接测量的是评价与情境判断，不能据此声称职业身份已经遭到破坏。Tang等研究支持考察工作关系的双向变化，但并非全部涉及生成式AI。Kellogg等已经系统提出算法控制框架，“AI既是助手又是管理者”不能作为未经文献对照的新发现。[Reif等](https://doi.org/10.1073/pnas.2426766122)、[Tang等全文](https://www.apa.org/pubs/journals/releases/apl-apl0001103.pdf)、[Kellogg等作者稿](https://angelechristin.com/wp-content/uploads/2020/01/Algorithms-at-Work_Annals.pdf)。

## 二、证据和开放数据审计

A：实际看到目录/文件名或变量字典；仍不等于下载、清洗或成功运行。B：作者声明开放或公共入口存在，但文件内容未核实。C：原研究依赖本轮不可公开取得的企业/行政微观资料。D：本轮未找到或未核实开放原始资料。所有A项还需要许可、匿名化、缺失值和可分析样本审计。本轮没有复现实验或运行作者代码。

| 文献（年） | 发表与阅读边界 | 可公开复用的实际状态 |
|---|---|---|
| [Noy & Zhang（2023）](https://www.science.org/doi/10.1126/science.adh2586) | Science；最终摘要与早期作者稿部分，正式样本453，勿混用早稿444 | B：[OSF入口](https://osf.io/xd7qw/)，文件未核实 |
| [Bastani等（2025）](https://pmc.ncbi.nlm.nih.gov/articles/PMC12232635/) | PNAS；全文方法、结果、数据说明定向阅读 | A：[GitHub](https://github.com/obastani/GenAICanHarmLearning)实际可见final_data.csv、回归目录、文本分析及变量字典 |
| [Kestin等（2025）](https://pmc.ncbi.nlm.nih.gov/articles/PMC12179260/) | Scientific Reports；全文定向阅读 | B：[仓库](https://github.com/HarvardAItutor/Study-Data-v4)存在，文件目录未成功读取 |
| [Shen & Tamkin（2026）](https://arxiv.org/html/2601.20245v2) | arXiv v2；预印本，全文定向阅读 | A但有限：[仓库](https://github.com/safety-research/how-ai-impacts-skill-formation)公开标注对话和任务；未证实全部测验微观数据 |
| [Dillon等（2025）](https://www.nber.org/papers/w33795) | NBER工作论文；读arXiv v1全文部分，不把不同版本效应混写 | C：企业遥测；可提取论文层面的估计 |
| [Reif等（2025）](https://doi.org/10.1073/pnas.2426766122) | PNAS；出版商可检索正文部分，非完整PDF | B：[OSF](https://osf.io/beun6/)本轮403 |
| [Tang等（2023）](https://www.apa.org/pubs/journals/releases/apl-apl0001103.pdf) | Journal of Applied Psychology；出版商PDF定向阅读 | B：有OSF补充入口，不能确认包含全部原始数据 |
| [Humlum & Vestergaard（2026修订）](https://www.andershumlum.com/s/chatbots_260313.pdf) | 工作论文；已读新版摘要、引言、数据和识别说明 | C：丹麦受限行政记录，不是开放个体数据 |
| [Brynjolfsson、Chandar & Chen（2026修订）](https://digitaleconomy.stanford.edu/publication/canaries-in-the-coal-mine-six-facts-about-the-recent-employment-effects-of-artificial-intelligence/) | 工作论文；作者机构修订说明，未通读新PDF | C：ADP资料；公开指标存在的声明不等于微观数据开放 |
| [Mazmanian等（2013）](https://pubsonline.informs.org/doi/10.1287/orsc.1120.0806) | Organization Science；摘要与元数据 | D：无已核验访谈数据 |
| [Beane（2019；2018在线）](https://journals.sagepub.com/doi/full/10.1177/0001839217751692?journalCode=asqa) | Administrative Science Quarterly；摘要与元数据 | D：无已核验民族志原始资料 |
| [Kellogg等（2020）](https://angelechristin.com/wp-content/uploads/2020/01/Algorithms-at-Work_Annals.pdf) | Academy of Management Annals综述；全文框架定向阅读 | 原始个体数据不适用；不能与其纳入研究重复计数 |
| [Autor、Levy & Murnane（2003）](https://doi.org/10.1162/003355303322552801) | QJE；摘要、元数据与作者稿开头 | D：未审计原始复现包 |
| [Lee等（2025）](https://www.microsoft.com/en-us/research/publication/the-impact-of-generative-ai-on-critical-thinking-self-reported-reductions-in-cognitive-effort-and-confidence-effects-from-a-survey-of-knowledge-workers/) | CHI会议论文；官方摘要及PDF入口 | D：无已核验个体数据 |
| [Ranganathan & Ye（2026）](https://hbr.org/2026/02/ai-doesnt-reduce-work-it-intensifies-it) | HBR实践文章；仅核题名信息，实质说明读作者页面 | D：用于产生问题，不作为已核验效应量 |

劳动市场的独立公共资料路径已经确认：[Census CPS公开微观数据与字典入口](https://www.census.gov/programs-surveys/cps/data/datasets.html)、[BLS公开文件说明](https://www.bls.gov/cps/data/public-use-file.htm)和[O*NET可下载数据库](https://www.onetcenter.org/database.html)。当前O*NET为31.0，但研究2022年前后变化应优先锁定相应历史版本，避免用事后技能结构定义事前暴露；[历史版本档案](https://www.onetcenter.org/db_releases.html)已核实。这里确认的是官方供给渠道，并未下载月度样本、完成职业代码映射或验证样本可比性。Census API页面目前要求API key，文件下载与API接口也不能混为一谈。

## 三、五条独立选题

### LL1　何时“完成得更好”会变成“离开AI后学得更差”？

**问题。** 学习者使用AI后的辅助任务表现和无辅助能力是否分离？分离程度能否由回答是否可直接复制、是否要求解释和自主检索来描述，而不是仅用“有没有AI”描述？

**已有认识与可检验缺口。** Bastani、Kestin和Shen已使“AI可能损害学习”“教学设计有影响”不再新颖。可做的增量是统一区分辅助表现、即时无辅助保持、迁移、错误诊断和延迟保持，并透明审计每种结论的证据数量。Beane的实践机会机制可启发编码，但它不是LLM学习效应的直接证据。

**假设。** H1：答案供给型条件更容易出现辅助表现与无辅助表现方向不一致。H2：要求解释/分步尝试的设计可缓和这种分离。H3：若仅改变任务完成速度而不改变练习机会，学习损害较弱。H1/H2跨论文比较首先是调节关联；只有原研究随机化了具体设计，才能作相应因果解释。

**公开资料与最小成稿。** 先审计Bastani的CSV、随机化单位和评分指标，再验证Kestin数据；Shen公开对话可按盲法编码“主动解释、委托、验证”，但先检查是否有合法可连接的测验结果。没有则只做公开过程材料的描述性分析。研究级综合应分层呈现不同对照条件，不应把大学课堂教学和无工具编码视为同一对照；同一人的多次成绩、同一班级和同一论文多个效应需处理依赖性。

**可否证/停止条件。** 如果方向差异完全由基线、测验难度或教学时间解释，不能支持AI特有机制；如果独立实验太少，不做高维元回归。若缺少延迟测验，只能研究即时技能形成。不能声称认知萎缩、永久去技能化或首次发现教学保护措施。

**适配。** 学习科学、教育心理、Learning and Instruction、Computers & Education；若形成跨任务可检验的一般学习机制且有独立验证，再考虑Nature Human Behaviour（NHB），单个公开数据二次切片通常不足。

### LL2　AI节省的时间由谁决定用途：恢复、更多产出，还是更多职责？

**问题。** 同样的单任务加速，为何在一些情境转化为较少工作时间，在另一些情境转化为任务范围和响应要求扩张？

**已有认识与缺口。** 自主性悖论、任务重组和工作扩张已有理论及经验基础。可做的增量是把“省时”的分母明确拆开：单项任务、同类任务组合、整日工时、非工作时间、心理恢复；并检验谁控制节省时间的分配。不能把工作扩张机制命名后当成新理论。

**假设。** H1：局部任务省时与总工时减少之间的关联，受目标是否随生产率上调影响。H2：员工自主决定剩余时间用途时，省时更可能转化为恢复；由组织重设任务与响应标准时，更可能转化为职责增加。H3：收益也可能是工作质量提高且总工时不变，此情形不能归类为增压。

**公开资料与最小成稿。** 在没有企业日志的条件下，做有预注册编码方案的证据综合：逐研究标注时间口径、任务边界、采用强度、观察期、任务分配权是否真的测量。Dillon与Humlum可提供公开论文级结果；HBR/质性研究只作机制线索，不能与随机试验效应等权合并。现有已核实资料不足以直接估计“时间分配权”的因果调节。

**可否证/停止条件。** 若研究没有总工时或恢复指标，不能从邮件时间下降推断减负；若没有任务量增加，也不能从总工时不变推断强度上升。公开研究不足时应形成系统性测量审计或理论稿，不伪装为完成的经验因果论文。

**适配。** 组织行为、劳动过程和工作设计；Human Relations、Journal of Management Studies等方向。NHB需要实际行为机制证据，不能只做效应口径分类。

### LL3　AI使用者的声誉成本来自“偷懒推断”、归功分配，还是专业规范？

**问题。** 当产出质量固定时，AI使用信息如何改变能力、努力与可信度评价？这种评价会不会反过来影响披露、求助和学习机会？

**已有认识与缺口。** Reif等已证明社会评价惩罚及部分边界条件；“AI使用有污名”不是新发现。仍可区分能力判断与努力道德化、职业身份自评与他人声誉、公开披露与实际使用。Beane提示参与实践机会与专业成长相关，但不能直接推出声誉惩罚导致去技能化。

**假设。** H1：在产出固定时，努力判断与能力判断的变化可以分离。H2：如果AI使用被明确视为履职规范，负面努力推断减弱；如果任务强调个人原创或专业责任，评价结构可能不同。H3：使用经验可能改变评价，而不是AI一律带来负向声誉。需要寻找反向或零效应，不能只收集“惩罚”论文。

**公开资料与最小成稿。** 优先核实Reif的OSF是否可访问，重建原有情境及测量变量；若数据开放，仅检验原问卷支持的分解，不把未测量的身份机制补出来。公开研究可做情境编码的证据综合；目前不能保证有足够独立数据支持元分析。未经额外授权或资源安排，不把新的在线实验作为已具备条件。

**可否证/停止条件。** 无法取得OSF且仅有少数摘要时，停止个体数据分析。没有真实职业后果，只能讨论情境评价；同一实验室四项研究不等于跨文化四次独立验证。

**适配。** 社会心理、组织心理、Journal of Applied Psychology、Organizational Behavior and Human Decision Processes、CHI。NHB须有更一般的社会推断机制和外部验证，而不是复述一个已发表效应。

### LL4　“AI让较弱者进步”与“初入职场者机会减少”为何可以同时成立？

**问题。** 个体任务内表现差距缩小，为什么未必伴随就业机会差距缩小？年龄、教育、职业进入与职业存续分别扮演什么角色？

**已有认识与缺口。** 经典任务框架已区分任务替代与互补；Canaries已有年龄差异描述，Humlum已有实际采用检验。新稿应避免再做单一“暴露度×ChatGPT后”的事件图。可审计的增量是明确分解：在岗者任务表现、职业内年龄构成、进入/退出、教育组成与不同数据源覆盖；这些不是同一因变量。

**假设。** H1：教育和行业构成能解释部分表面的年龄×暴露趋势。H2：职业进入和在岗存续可能呈不同变化，横截面存量会混合二者。H3：采用和暴露指标不一致时，不能预期其对应估计一致。这些是描述与识别审计的预期，不是预设AI造成岗位损失。

**公开资料与最小成稿。** 官方CPS月度数据配历史O*NET任务指标，先进行预先指定年龄组、教育控制、职业代码映射、基期、样本权重与前趋势的稳健性分析。若做月度链接，需另外验证轮换组匹配和流失，不可把重复横截面直接称面板。只能用已公开且可复核的暴露评分；本轮尚未审计具体评分文件。不能复现ADP或丹麦限制数据，可用公开汇总估计做跨数据源比较。

**可否证/停止条件。** 若模式对职业映射、教育或趋势选择高度敏感，结论应是估计脆弱性而非替代效应；若没有实际采用或有效外生变化，标题与摘要不得作因果用语。年龄不是经验的完美代理，早期职业也不等于年轻。

**适配。** 劳动经济、ILR Review、Labour Economics及社会分层研究。数据可取得，但识别强度可能弱于表面工作量；对NHB需要连接可检验的人类行为机制，单独宏观趋势审计适配较弱。

### LL5　AI“帮助我工作”与“管理我的工作”是否产生不同社会与心理后果？

**问题。** 工具是由员工主动求助、替代同事互动，还是用于分配、监测和评价员工，是否比笼统的AI接触频率更能解释体验差异？

**已有认识与缺口。** Kellogg等已建立算法控制框架，Tang等已有联结需求与孤独的双向路径；支持/控制、社会替代均不能声称首创。可做的增量是检验现有心理研究是否错误混合了三种暴露，并明确区分自报情绪、行为、睡眠与临床结局。

**假设。** H1：自主求助与被动被监测的自主性结果不同。H2：当AI减少人际接触时，孤独风险更可能出现；当AI释放时间用于人与人协作时，可能出现相反方向。H3：助人行为上升不等于孤独下降，两者可以并存。

**公开资料与最小成稿。** 以公开论文/量表/补充材料建立“谁发起、谁受益、谁有评价权、是否替代人际互动”的暴露编码，再看各类结果是否可分层综合。Tang的OSF尚未证实数据内容，不能预承诺参与者数据重分析。企业监控数据和心理诊断记录不纳入当前资源前提。若独立研究不足，输出证据缺口地图，而不是统计显著性堆积。

**可否证/停止条件。** 如果工具用途、选择权或互动替代未测量，就不能用其解释异质性；若只有单时点自报，不能得出AI致病或改善心理健康的因果结论。工作满意度不能替代心理健康，孤独也不是临床诊断。

**适配。** 组织心理、职业健康心理、Journal of Occupational Health Psychology、Journal of Applied Psychology。NHB需跨情境的一般社会行为机制与可靠识别，公开文献分类本身尚不足。

## 四、在当前资源约束下的选择

| 顺位 | 方向 | 现在可做的工作 | 必须先解决的障碍 |
|---|---|---|---|
| 1 | LL1 学习与表现分离 | 已有一个看见CSV及字典的数据源，可开始数据可用性审计；另有两项不同方向的实验作校准 | 开放文件覆盖、评分可比性、随机化单位、重复测量；不要提前承诺跨域因果机制 |
| 2 | LL4 个体收益与职业机会 | 官方公共微观数据、历史任务资料路径明确 | 暴露评分文件、职业代码映射、前趋势；主要可识别描述性差异 |
| 3 | LL3 声誉与规范 | 复核既有实验及测量边界，扩展相反证据检索 | OSF访问及足够独立研究；身份机制不是现有数据必有变量 |
| 4 | LL2 时间分配 | 文献层面时间口径审计，构造可证伪理论 | 没有已取得的企业微观工作负担数据；分配权调节暂不可直接识别 |
| 5 | LL5 支持、控制与社会关系 | 暴露定义与结局测量的系统证据地图 | 数据开放性和研究数；目前不宜承诺临床或一般因果结论 |

顺位按现有资料的可执行程度排列，不表示理论重要性或投稿成功率。五题应保留为不同学科路径，不建议强行放进一个“超级团队效率”总模型。所有涉及新颖性的表述都应在下一轮扩大检索后再定；本稿没有证实任何题目“无人研究”。

## 五、检索与版本记录

实际核验日为2026-11-07。使用网络检索后优先访问出版商、作者机构、作者个人研究页、arXiv、PMC和作者明确链接的仓库；媒体不能替代原始方法。阅读深度按已经打开并读取的内容标注，403、仓库空壳或API失败均不算数据已取得。

交付前末轮实际提交的检索式如下（不是全部历史浏览日志，不冒充可完全复现的系统检索策略）：

1. `site.census.gov current population survey public use microdata basic monthly data`
2. `site.onetcenter.org database download O NET`
3. `"The Skill Content of Recent Technological Change" "10.1162"`
4. `"AI Doesn’t Reduce Work—It Intensifies It" Ranganathan Ye`

同时逐一打开上表原始论文、作者稿及仓库。最终版本检查特别记录：

- Humlum–Vestergaard使用2026-03-13新题，不继续把2025旧题和较早置信区间当最新结论。
- Canaries依据作者页面2026-08-12修订说明，未把2025报道数字搬入新版结果。
- Shen–Tamkin使用arXiv v2，论文仍为预印本；对话公开不等于全部成绩数据公开。
- Dillon效应依据实际读过的arXiv v1，未与NBER后续修订数字混合。
- Noy–Zhang最终样本与早期作者稿样本明确区分。
- Kestin仓库和Reif OSF的内容仍待取得，不以“论文写开放”替代实际文件审计。

