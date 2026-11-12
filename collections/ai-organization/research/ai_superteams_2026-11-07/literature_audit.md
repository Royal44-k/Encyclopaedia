# 人机团队、集体智能与公开数据：独立文献核验

核验日期：2026-11-07（Asia/Shanghai）。用途：为“个人AI增益如何转化为团队净价值”的 Nature Human Behaviour 选题提供原始证据、反证与数据可行性判断。这里是定向文献审计，不声称穷尽检索，也不声称任何建议已被证明新颖。

## 先给判断

1. **不能把个人增益、人机二元协同、真实多人团队增益混为一谈。** 文献里“team”“collective”可以指一个人与AI、互动的人类小组，也可以只指独立创作者的产出池。三者对应的因果问题不同。
2. “更强AI不必然带来更强团队”已经有直接实验和元分析；“AI降低集体多样性”也已有明确反证。仅提出这两点，达不到新颖性要求。
3. 对只用公开数据的方案，最大约束是：**最贴近组织协作机制的研究，常没有核实可立即复用的微观数据。** 目前可访问文件目录最清晰的是短篇故事实验和在线艺术平台研究；它们研究的是独立产出构成的集合，不能冒充互动团队。
4. 两篇常被按早期版本引用的论文已在2026年正式发表：Cybernetic Teammate；Navigating the Jagged Technological Frontier。写作时必须锁定版本，尤其不要混用前者的776和791两种样本口径。

## 数据核验等级

- **A：实际文件目录或README已读。** 已能确认数据/代码文件的存在与大致结构；本次没有下载全部数据并复现，因此不等于“运行验证通过”。
- **B：作者明确声明开放且给出仓库，但本次未能读取文件。** 不可在计划中视为已取得。
- **C：作者明确表示按请求提供，或仅代码公开。** 不符合“只依赖已公开微观数据”的直接二次分析前提。
- **D：本次未找到或未核实研究数据入口。** 不代表数据绝对不存在。

## 11项优先证据

### 1. 人机协同的基准：组合未必胜过较强一方

**Vaccaro, Almaatouq & Malone (2024). When combinations of humans and AI are useful: A systematic review and meta-analysis. Nature Human Behaviour 8, 2293–2303.** [期刊原文](https://www.nature.com/articles/s41562-024-02024-1)；[PMC全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC11659167/)；DOI: 10.1038/s41562-024-02024-1。

- 方法：预注册系统综述/元分析，106项实验、370个效应量；检索覆盖2020-01-01至2023-06-30，要求同时具有人类单独、AI单独、组合三个条件。
- 结果：组合相对较强单独条件的平均效应为 Hedges’ g = −0.23，95% CI [−0.39, −0.07]；决策任务与内容生成任务不同，且受人类和AI基准相对强弱调节。
- 边界：文献截至2023年中，不能直接代表2026年代理系统；主要估计“组合超过较强一方”而非“多人组织在引入AI后的净产出”。解释/置信度调节不显著不等于它们永远无用；研究间调节也不是机制随机实验。
- 数据 **B**：[OSF wrq7c](https://osf.io/wrq7c/?view_only=b9e1e86079c048b4bfb03bee6966e560)。期刊明确声明数据与代码均在此；报告分析使用R/metafor。普通OSF页、带view_only页和OSF API均无法经本次web工具读取，PowerShell联网也受限。**尚未核实具体文件名、变量、授权或可成功运行。**

### 2. 直接组织场景：单人+AI可达到双人团队的部分效果

**Dell’Acqua et al. (2026). The Cybernetic Teammate: A Field Experiment on Generative AI and Teamwork. Organization Science 37(4), 1217–1242.** [正式原文](https://pubsonline.informs.org/doi/10.1287/orsc.2025.20702)；DOI: 10.1287/orsc.2025.20702。[2025工作论文](https://www.nber.org/papers/w33641)题名为 *…Reshaping Teamwork and Expertise*。

- 版本：正式在线发表2026-06-12；正式文分析791名P&G专业人员，776名具有完整任务后问卷。2×2：个人/研发与商业双人组 × 无AI/有AI；一天的实际产品创新工作坊。
- 支持：个人+AI的质量达到无AI双人团队；AI输出更跨职能；情绪自报改善。
- 边界：不能据此断言AI与人类团队存在超加性；该研究没有AI单独组，也不是长期组织实验。团队+AI对团队无AI的均值比较和顶端结果要分别处理。“积极情绪”不等于长期人际信任或凝聚力。
- 数据 **D**：[补充材料页](https://pubsonline.informs.org/doi/suppl/10.1287/orsc.2025.20702)只核实到 `orsc.2025.20702.sm1.pdf`。本次未核实公开原始提案、互动日志、评分微观数据或代码包；不能承诺基于其微观资料做公开数据重分析。

### 3. 知识分布是关键边界，中央AI的信息优势不能当纯协同

**Zercher, Jussupow, Benke & Heinzl (online 2025; volume 2026). How Can Teams Benefit From AI Team Members? Exploring the Effect of Generative AI on Decision-Making Processes and Decision Quality in Team–AI Collaboration. Journal of Organizational Behavior 47(8), 1369–1396.** [原文](https://onlinelibrary.wiley.com/doi/10.1002/job.2898)；DOI: 10.1002/job.2898。

- 方法：预注册探索性实验；215人、81队；隐藏信息人员选择任务；定量结果结合讨论视频/聊天的质性分析。
- 支持与反证：拥有集中知识的AI组决策更准确；AI只掌握非对称局部知识时没有胜过人类组。支持“能否整合分布知识”比“是否接入AI”更有解释力。
- 边界：学生、德语、短时任务；前两组各三名人类，第三组两名人类，知识配置与人类成员数并非完全独立。不能把差异都解释成协调机制。
- 数据 **C**：原文 Data Availability Statement 明示数据和聊天机器人Alex的Python代码 **available from the authors upon request**；不是已公开下载。

### 4. 个体更强但团队变差：已有直接协调失败证据

**Dell’Acqua, Kogut & Perkowski (2025; accepted version 2023). Super Mario Meets AI: Experimental Effects of Automation and Skills on Team Performance and Coordination. Review of Economics and Statistics 107(4), 951–966.** [DOI](https://doi.org/10.1162/rest_a_01328)；[作者SSRN工作论文页面](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3746564)。

- 方法：Nintendo Switch协作游戏中的实验室“企业”，随机引入自动化队友/新成员；本次可读作者摘要核实设计与方向，正式稿样本量未从可访问的原始发布页核实，故不以转载数字作为已核实样本。
- 反证：即使自动化队友单独表现更强，引入它仍降低团队表现、增加协调失败，且降低信任与努力；短期和低/中技能团队更明显。
- 边界：传统游戏自动化代理而非LLM；短回合动作协调和开放式知识工作机制不同。不能将其数值效应直接移植到生成式AI。
- 数据 **B/D边界**：[Harvard Dataverse DOI 10.7910/DVN/C6XWVL](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/C6XWVL)。定位到名为replication data的仓库入口，但仓库页返回JavaScript反机器人检查，未读文件清单；目前只能称“候选复现仓库”，不能宣称数据已经取得。

### 5. 个人生产率增益的有力证据，不能自动上推团队协同

**Brynjolfsson, Li & Raymond (2025). Generative AI at Work. Quarterly Journal of Economics 140(2), 889–942.** [原文](https://academic.oup.com/qje/article/140/2/889/7990658)；DOI: 10.1093/qje/qjae044。

- 方法：客服助手分批部署；5,172名客服、约300万次聊天；主要结果为客服个人/月层面的每小时解决问题数。
- 支持：平均生产率提高15%，新手和较低技能人员获益较大；高技能者部分质量指标小幅下降。
- 边界：不是随机化的多人团队协作试验；团队标识和知识扩散解释不等于已经估计团队协同或组织净利润。不能引用早版14%替代终版15%。
- 数据 **C（只公开代码已核实）**：[Dataverse](https://doi.org/10.7910/DVN/FSV1X7)。检索可读清单为7个文件：6个`.do`及README，总约47.9KB；期刊也仅声称公开复现代码。没有核实到客服微观数据。标题“Replication Data”不应误读为原始数据开放。

### 6. 个体创意提高与总体同质化可同时发生，且数据最好核实

**Doshi & Hauser (2024). Generative AI enhances individual creativity but reduces the collective diversity of novel content. Science Advances 10(28), eadn5290.** [期刊原文](https://doi.org/10.1126/sciadv.adn5290)；[PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11244532/)。

- 方法：293名保留写作者随机分配无AI/可请求1个GPT-4故事构思/最多5个；600名评价者，3,519次故事评价。
- 支持：AI构思可改善故事评分，特别是原本创造力较弱者；AI辅助故事之间更相似。
- 边界：八句短篇故事、独立生产，不是互动团队；相似性不是经济福利，也不等同于每个故事质量差；AI构思获取和共同信息暴露不可忽略。
- 数据 **A（清单实际可读）**：[Dryad](https://datadryad.org/dataset/doi:10.5061/dryad.qfttdz0pm)、[Zenodo镜像](https://zenodo.org/records/11654403)、[ZIP内部目录](https://zenodo.org/records/11654403/preview/GenAI_creativity_scripts.zip?include_deleted=0)。确认 `creators.dta`、`evaluators_stories.dta`、原始writer/evaluator CSV、Stata分析脚本和相似度Python脚本。README提供使用预处理数据的路径；全量重建需要OpenAI API和外部GloVe资源。未执行复现。

### 7. 明确反例：动态传播中高AI暴露可提高集体多样性

**Ashkinaze, Mendelsohn, Qiwei, Budak & Gilbert (2025; preprint 2024). How AI Ideas Affect the Creativity, Diversity, and Evolution of Human Ideas: Evidence From a Large, Dynamic Experiment. Collective Intelligence Conference 2025.** DOI: [10.1145/3715928.3737481](https://doi.org/10.1145/3715928.3737481)；[作者全文v3](https://arxiv.org/html/2401.13481v3)。

- 方法：844人、48国、3,414次保留回答；物品替代用途任务；此前回答继续成为下一批人的例子；操纵AI想法暴露和来源披露。
- 反证：高暴露增加总体多样性和其变化速度，未提高个体创意；并非“只要AI介入就同质化”。
- 边界：志愿招募、短文本、动态文化传播而非同步组织团队；创造力依赖既有模型评分，语义多样性也不是任务收益。
- 数据 **D**：作者全文可读，未找到本实验明确数据/代码仓库。文中 `massivetexts/llm_aut_study` 是评分器/既有AUT数据来源，**不是本实验844名参与者的数据**，不可混淆。

### 8. 输入多样化反例，但远非“提示词解决了同质化”的定论

**Wan & Kalman (2026). Diverse AI personas can mitigate the homogenization effect in human-AI collaborative ideation. Computers in Human Behavior: Artificial Humans 8, 100289.** [正式原文](https://doi.org/10.1016/j.chbah.2026.100289)；[接受稿及附录](https://arxiv.org/pdf/2504.13868)。

- 方法：10个persona生成300个故事构思；100人招募，排除后97篇故事；无/1/最多5构思三个条件。
- 结果与边界：有保持多样性、部分分析改善多样性的迹象；作者明确承认小样本、功效不足、等价证据不确定。没有同一实验中“普通AI输入”人类写作组，所以跨论文对比不能隔离persona本身的因果效应。也不是互动团队研究。
- 数据 **C/D**：接受稿有persona和部分构思示例；第30页说明完整构思清单须联系通讯作者。本次未核实公开97篇故事的微观数据或完整可下载包。不要拿2025预印本中的相似度数值替代2026接受稿数值。

### 9. “数量效应”已经被研究，集体新颖性不能只看总量

**Zhou, Lee & Gu (2025). Who expands the human creative frontier with generative AI: Hive minds or masterminds? Science Advances.** DOI: [10.1126/sciadv.adu5800](https://doi.org/10.1126/sciadv.adu5800)；[全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC12407059/)。

- 方法：31,076名艺术创作者、2021年8月—2023年12月共27个月；匹配与事件研究/双重差分；用作品内容表征的凸包测量创意边界。
- 结论：AI采用者贡献更多新颖作品，主要由数量提高驱动；单件贡献前沿的概率存在稀释。对“AI促进集体创造力”的总量判断提出重要分母问题。
- 边界：观察性识别仍依赖未观察混杂假设；凸包顶点是操作化的新颖性，不能宣称历史意义的创新；平台创作者集合不是组织团队。
- 数据 **A**：[Dryad](https://datadryad.org/dataset/doi:10.5061/dryad.xpnvx0ksf)。已读166.94MB的 `Hiveminds-Masterminds.zip` 清单及README：`posts`含匿名ID、时间和UMAP；`users`含采用标记与既有产出；`baseline`提供外部参照。尚未下载运行；**不能假设含原图、原始文本或全部高维表征**。

### 10. 2026前沿：先由人构思再让AI润色，与AI直接构思不同

**Dong & Yakura (2026). Human diversity fuels collective creativity that large language models cannot simulate or sustain. arXiv preprint v1, submitted 2026-07-29.** [摘要页](https://arxiv.org/abs/2607.26899)；[全文](https://arxiv.org/pdf/2607.26899)；DOI: 10.48550/arXiv.2607.26899。

- 方法：644名写作者、351名独立评价者；英语母语/非母语 × 无AI/AI构思/AI润色；写作任务及语言比较有预注册，LLM模拟池比较属后加分析。
- 结果：AI构思压缩集合多样性，AI润色较能保留；在所测试模型和任务中，基于真人背景的persona模拟池仍未达到真人多样性。
- 边界：**尚未核实同行评审发表**；母语使用是自选而非随机；作者明确说独立写作池不等于互动团队；不能把题名扩张为“任何未来AI都无法模拟人类多样性”。
- 数据 **B**：作者声明全部数据、材料、代码在 [OSF amgx9](https://osf.io/amgx9/overview?view_only=46c491afd0ba40fc91f361aa2b53be79)，本次未核验实际文件。

### 11. 2026前沿：AI可能影响人—人沟通，但最新版本收缩了时间机制结论

**Nixon et al. (2026). The Social Cost of an AI Teammate: How an Artificial Teammate Reshapes Human-Human Communication in Small-Team Decision-Making. arXiv v2, revised 2026-10-30.** [摘要与版本史](https://arxiv.org/abs/2607.27179)；[v2全文](https://arxiv.org/html/2607.27179v2)。

- 方法：33个配置团队（16个两人+AI、17个三人）；80名招募、75名分析；道德困境文字讨论，群体沟通分析和问卷。
- 结果：AI较占话语量，学生间回应/社会影响及归属等更低；是值得跟进的人际成本证据。
- 边界：人类成员数不同，且存在未填补席位/流失；小样本与自报；**v2已不再断言成本“从一开始即存在”，其时间分析不能确定何时出现**。不要引用旧摘要覆盖新版本。未核实同行评审接受。
- 数据 **D**：可读方法与平台介绍，未核实公开聊天记录、评分数据或完整复现包；不能直接规划公开微观数据分析。

## 三个仅依赖公开文献/数据的候选题，以及否决条件

### 方向A：从个人增益到团队增益的“估计量错位”——分层证据综合

**问题**：现有研究里，多少“团队增益”只是个人辅助、信息量优势或增加成员/资源？在固定评价指标下，AI的边际收益是否随任务相互依赖、知识分散与协调方式而改变？

**执行**：以NHB元分析文献表为起点，更新至2026-11-07；从公开全文双人独立编码：人类人数、是否同步互动、任务互赖、共同目标、AI知识覆盖、追加/替换AI、是否AI独立基准、总劳动时间/令牌预算、均值与尾部结果。优先使用文章公开的均值、SD、SE，不把作者按请求数据当必需条件。

**估计量**：分别报告辅助增益 `H+AI − H`、人机协同 `H+AI − max(H, AI)`、真实团队AI边际效应 `T+AI − T`。在同一2×2设计和同一结果尺度下，可估计交互 `[(T+AI)−T]−[(I+AI)−I]`；它不是全组织净收益，也不能跨异质量纲直接相减。成本只在原研究报告足够信息时估计。

**贡献门槛/批判**：元分析NHB已有，协调损失也早有直接证据；“更新年份+换标题”不够。必须形成有辨别力的机制分类并找到足够真正团队研究。跨研究调节不能作因果中介。若多数研究缺失基准或资源指标，应交付证据缺口地图/概念方法稿，不能强做“团队协同的总体效应”。这是与主报告最贴合但最依赖前期可行性审计的方向。

### 方向B：AI增益的集合价值是否只是“生产更多”——固定预算的组合收益重分析

**问题**：在固定产出数量、评价预算或选用容量时，AI带来的质量增益能否抵消产出相关性/冗余？团队最终只能选少量方案时，个人平均评分与可选方案集合的价值是否分离？

**执行**：优先Doshi–Hauser真实数据文件；以Zhou–Lee–Gu的公开帖子/用户表作不同生态的外部检验。预注册固定集合大小的抽样、最佳项/前k项质量、语义覆盖、尾部质量与结果稳健性；区分增加产量和改变每次尝试分布。处理同一作者/评价者的依赖，避免把全部文本对当独立样本。

**贡献门槛/批判**：Zhou等已经分解产量和稀释，Doshi等已经指出个体—集合冲突。新贡献须是可预先规定的选择容量/评价成本条件，而非重复“均值↑多样性↓”。若没有真实选择或成本资料，只能报告不同决策规则下的情景值，不能称为已识别的团队净福利。所有“名义团队”或重采样集合必须明确不是实际互动团队。与NHB的适配来自一般行为机制，不是堆复杂模型。

### 方向C：多样性结论为什么方向相反——测量与流程的联合复现

**问题**：同质化结论有多少来自测量口径（平均余弦、到中心距离、覆盖/尾部），多少来自AI介入位置（构思/润色）、输入异质性或动态传播？

**执行**：先对A等级数据做统一测量；若Dong–Yakura的OSF成功取得，再加入其原文明确的人类构思/AI润色对比。使用已公开人类评分来检验多样性是否仅由低质文本或长度差异推动；做分层bootstrap与预注册多指标敏感性分析。Ashkinaze和Wan只在取得并核验公开原始数据后纳入微观整合，否则作为文献级比较。

**贡献门槛/批判**：输入多样化、AI润色与传播链都已有相关研究，不能声称首次发现。不同论文中的模型、任务、样本同时变化，不能凭跨研究差异认定流程因果机制；“多样性指标不一致”也未必构成NHB贡献。若公开数据无法覆盖至少两种流程和多个任务，应缩为严格的单研究复现/测量审计，换更匹配期刊，而非制造综合性结论。

## 建议下一步与停止规则

1. 最先尝试下载并审查NHB OSF、Doshi ZIP、Zhou ZIP：文件可读、许可证、匿名ID、条件、结果和缺失情况；记录哈希与版本。未完成前，不承诺“数据可立即分析”。
2. 做一页研究层级表：个人辅助；一个人与AI的协调；至少两名人类与AI互动；独立产出池；纯AI群体。检索结果分别归类，禁止以“team”词频代替构念判断。
3. 方向A先做小样本人工编码可行性审计；若真正多人研究过少，交互效应不可比较，则停止总体效应合并。方向B若只有UMAP无法验证高维距离稳定性，明确限制测量主张。方向C若关键公开数据拿不到，不把“可按请求”当已可用。
4. 本次没有发现足以支持“组织净收益已被识别”的公共微观证据链；可支撑的是有明确边界的二次分析或严谨证据综合。Nature Human Behaviour是目标而非既定可达结论。

## 额外近邻：需要在正式新颖性检索时加入

- [Navigating the Jagged Technological Frontier](https://doi.org/10.1287/orsc.2025.21838)：正式2026-03-11在线，Organization Science 37(2), 403–423；早期2023工作论文不能算另一项独立研究。
- [Collaborating with AI Agents: Field Experiments on Teamwork, Productivity, and Performance](https://arxiv.org/abs/2503.18238)：2025预印本，摘要称2,310人营销团队实验及实际广告测试；本次未深审版本/数据，不能作已核实可重用样本。
- [Incentives shape how humans co-create with generative AI](https://arxiv.org/abs/2604.03529)：2026预印本，提示“激励调节同质化”已有人做，选题不能预设该机制空白。
- [The agentic shift: Making human-AI coordination work by addressing two critical junctures](https://doi.org/10.1016/j.bushor.2025.12.001)：基于37项实证研究的协调综合，2025-12在线；不是新原始实验，但会影响“首次统一协调框架”类新颖性主张。

本审计未将搜索摘要当作数据下载成功；全部候选数据的实物读取/复现状态已单列。搜索与网页可访问性反映本次工具环境，不代表仓库永久不可用。
