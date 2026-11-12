# 国内研究、科学学与创业：补充研读备忘录

检索日期：2026-11-07。对应来源表：china_science_entrepreneurship_sources.json。10项来源包含4篇中文期刊文章、4篇科学学原始研究/方法争议文章、2篇创业研究；其中创业预印本与正式论文分列，方法评论与经验研究不混算。实际阅读深度逐条记录。

## 这组证据改变了哪些认识

**国内文献已经提供了具体机制，不能只放在背景段。** 梁宇畅等（2024，C01）研究第三方对AI使用者的评价，李育辉、薛嘉欣（2026，C02）区分启发式与捷径式使用，林俐、朱晶晶（2025，C04）关注数字化工作重塑。它们分别对应社会归因、使用策略、工作过程；不能合并成“AI提升创新”这一单向结论。C01为情景实验加访谈，C02为多来源追踪，C04为质性建构，证据能力不同。

**论文发表地点与研究地理来源不是同一个维度。** Hao等（2026，S01）是中国与国际团队合作的Nature研究；中外文献应在同一问题下对话。不能以中国样本与国外样本的差异直接证明文化差异，因为任务、模型、时间、设计和招募往往同时不同。

**“个人变强、集体变窄”已是有力的现有研究命题。** S01已经把AI应用与个人科研影响、研究空间分布连接起来；Wu等（2019，S02）早已讨论团队规模与创新类型。新研究必须进入团队边界、依赖网络、知识来源或识别/测量改进等更具体问题，不能再把“AI个体收益可能不等于集体收益”作为首次发现。

**“单人创业增长、团队仍有优势”也已经有人直接研究。** Kim等（2026，E02）覆盖Product Hunt发布；Otis等（2026，E01）用随机实验分析经营表现。可继续追问试验进入怎样转化为持续经营、建议选择怎样变为行动、组织内部人少是否意味着外部依赖更集中。但平台maker、产品排名、产品更新、公司员工、存活和收入是不同构念，不能相互替代。

## 四个可继续推进的问题

1. **小团队是否只是把认知分工外包了？** 将署名人数与外部代码、模型、数据集及跨领域知识来源分开，比较人员结构与依赖结构的变化。可用开放论文元数据加可核实的软件/数据引用；先做人工编码验证。仅凭引用多样性不能证明实际认知多样性，作者数缩小不能证明AI导致缩编。与T13对应。
2. **哪些公开数据基础设施扩展了科学探索，哪些把注意力吸向少数热门问题？** 使用可追踪的数据集公开时间与论文依赖，构建描述性机制图谱。公开时间内生、领域热度共同变化，若没有可信比较设计，只报告关联。与T14对应。
3. **低门槛创业之后，持续经营能力来自哪里？** 不重复单人发布数量和榜单排名，转向一年后继续维护、用户支持、团队转变及对外服务依赖。先验证这些指标与经营的关联，未有真实营收或用户留存时避免“成功率”措辞。与T15、T16对应。
4. **AI的社会惩罚是否改变了知识扩散？** 国内C01与Reif等PNAS研究已触及AI评价惩罚。可以研究组织鼓励使用与同事负面评价并存时，知识贡献者是否选择不披露使用过程，以及这是否影响他人学到的方法；公开披露材料只能测可见行为，不能识别隐藏使用的发生率。与T08对应。

这些是待检验提案，未产生任何新实证结果。全文细读仍须围绕最终选择的一题继续，不以“跨领域来源多”替代主问题的文献完整性。

## 测量争议与排除记录

- **保留双方观点。** Holst等（2026，S03）指出颠覆性测量的数据问题；Park等（2026，S04）明确反驳部分解释。此处只将它们作为需要数据审计和多指标验证的理由，不宣布哪方已最终正确，也不说Wu等2019研究已经被推翻。
- **排除不可靠证据。** Aidan Toner-Rodgers的《Artificial Intelligence, Scientific Discovery, and Product Innovation》不纳入有效证据库。[MIT Economics于2025-05-16的声明](https://economics.mit.edu/news/assuring-accurate-research-record)明确表示不信任相关数据和研究，并要求撤回。网络搜索仍能返回其原始正面结论，所以特别记录排除理由。
- **排除未成功辨认的PDF。** NSFC旧链接重定向到主页，未取得原论文内容，不将搜索片段当成已读文献。
- **保留访问限制。** 南开论文PDF入口未成功读取，只读原刊摘要；Nature部分页面认证失败，Hao论文改读清华作者机构托管PDF及GitHub；不能声称完整获取全部期刊全文。

## 数据入口审计

| 入口 | 本轮实际核查 | 可做什么 | 仍不能承诺 |
|---|---|---|---|
| [OpenAlex当前文档](https://help.openalex.org/api/)及[公开快照](https://help.openalex.org/access/sync/) | 官方API、许可和快照页面 | 开放学术元数据、引用与作者关系；CC0数据，API服务有额度 | 旧版免费限额不能沿用；链接全文另有版权；引用完整性须校验 |
| [AI-Impacts-Science](https://github.com/tsinghua-fib-lab/AI-Impacts-Science) | 目录及README，指向Zenodo15779090与分类模型 | 为AI论文分类、代码与数据获取提供入口 | Zenodo目录本轮未成功读取；尚未重跑；不保证所有WoS/JCR衍生资料可免费重建 |
| Product Hunt | 只读E02中的变量定义及设计 | 表明平台中存在产品发布和maker可见资料 | 未核实最新批量访问许可或作者完整数据包；不能保证零成本取得历史总体 |
| E01肯尼亚实验 | 读正式论文设计、结果、机制段落 | 研究级效应与设计编码 | 未确认参与者级开放数据，不能把RCT论文开放等同数据开放 |

## 本组实际检索式与追踪

通用网络检索，不是对CNKI、Web of Science、Scopus的全库检索。以下为本组保留的主要实际请求；返回结果未进行系统综述式双人筛选，因此不报告PRISMA数量。

- site.cnki.net 生成式人工智能 人机协同 组织 管理世界
- site.nankai.edu.cn 生成式人工智能 员工 创造力 管理学报
- site.kjjb.org 人工智能 组织韧性 人机协同 生成式
- site.nature.com artificial intelligence scientific research teams innovation 2025 2026
- "人工智能驱动的组织管理范式革命"
- "人工智能驱动的组织管理范式革命" site:manu68.magtech.com.cn
- "使用生成式人工智能对员工创造力评价的影响" "实验" "名"
- "生成式人工智能使用的前因" "林俐"
- "Artificial intelligence tools expand scientists" "Code availability"
- "Artificial intelligence tools expand scientists" "arxiv"
- "Small teams disrupt" "2019" "data availability"
- site.nature.com/articles/s41586-019-0941-9 "Lingfei" "Dashun"
- "Dataset artefacts can partially drive the measured decline in disruption" authors
- site.nature.com/articles/s41586-026-10787-y "Abstract"
- site.nature.com/articles/s41586-026-10788-x "Reply" "Park"
- Otis generative AI entrepreneurs Kenya randomized experiment Management Science 2025 2026
- "The Uneven Impact" "06909" "data" "github"
- site.economics.mit.edu "Statement" "Artificial Intelligence, Scientific Discovery"
- "OpenAlex" "data" "CC0" API

按题名追到原刊、作者机构稿或预印本，关键方法再定向读取。没有保存搜索引擎所有返回结果，不将这份可追踪的选题研读记录描述成可穷尽复现的系统检索。

