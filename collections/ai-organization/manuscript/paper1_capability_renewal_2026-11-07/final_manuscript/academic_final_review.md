# 冻结英文稿的学术终审：四项必要修改

日期：2026-11-07。审查对象：manuscript_en.md；读取时SHA256为`E99C34650E8D6A4BE82090BD641E74DE86A4CD7F60AE6B043C63602B34F61F95`。本审查未改英文或中文稿。位置以冻结稿的标题和段首为主，行号作辅助。

**总体判定：方法边界足够严谨，可继续完成论文；但在对外使用前，应补经典交叉训练前例、明确AI部署情境，并让一个方向明确的交互预测成为论证中心。** 当前的问题已不是把个体实验误写成团队证据，而是防御性说明占用了阐明理论用途的篇幅。全文含图注等部分出现57次独立单词“not”、9次“rather than”；这只是编辑定位线索，不是机械质量评分。

## 1. 必须补入交叉训练的直接前例

位置：What learning evidence establishes中“The organizational question also has substantial precedents”（约第31行）之后；Table 1亦应增加或扩展团队学习一行。

E21的作者、年、卷期、页码与候选DOI已核准。原始摘要报告两项真人团队模拟实验（45与49组），涉及交叉训练、共享团队互动模型、协调和绩效。它足以说明本文所述团队学习路径有直接实证传统；不能仅以交互记忆文献替代这条更近的来源。完整记录与书目见additional_sources.json。未取得完整方法，避免据摘要声称因果中介已被独立识别。[原始摘要](https://pubmed.ncbi.nlm.nih.gov/11916213/)

可插入：

> Cross-training research provides a direct precedent for linking experience across roles to team cognition and performance. In two team experiments, Marks and colleagues found that cross-training strengthened shared team-interaction models, with coordination linking these models to performance; findings concerning the required training depth varied. [E21] The present agenda places such established questions within AI-mediated work and specifies the diagnostic experiences, later capabilities and deployment conditions to compare.

不必追加大量经典文献，也不要因只拿到摘要便忽略E21。其结果不直接验证本文拟议矩阵或人员暂缺效应；同样，本文也不能把这些一般团队学习关系再写作原创发现。

## 2. 补强“为什么现在研究AI部署”，而非给一般轮换培训加AI标签

位置：Routing experience and recording capability中“AI can alter both sides of this allocation”（约第45行）。当前四组比较多数保持AI固定，实际识别的是AI环境中的分配或教学安排效应。这个范围合理，但正文应主动说明：AI在这里提供了哪些可配置的工作步骤，而不是暗示一个AI独有的心理机制。

建议替换该段：

> Generative AI makes production and instruction configurable within the same workflow: a system can supply a candidate artifact, propose a repair and provide practice material. [E11,E13,E14] A deployment can deliver the repaired artifact directly or expose a verified sequence of failed tests, revisions and feedback to selected members. These choices determine who encounters the uncertainty surrounding a correction. The proposed studies examine such deployment choices by recording which diagnostic steps remain available to people and testing the capabilities that develop from them. The same workflow can also supply substitute rehearsal, whose value depends on transfer to unfamiliar cases.

这里“verified sequence”应指可核查的测试、实际修改和反馈记录，不能把模型生成的解释当作其真实推理过程。此段是从已有研究形成的部署分析，不是宣称所有AI系统或团队已呈现该规律。保持AI固定的设计能检验上述部署安排；要断言AI相对于其他工具导致额外影响，需要另有相应对照。

## 3. 将中心预测改为随机分配规则×人员可用性的方向性交互

位置：When capability coverage matters to recovery中“The empirical target is the interaction between capability distribution…”（约第73行）。目前“分布重要、特定挑战可能更重要”偏弱，也容易把处理后的能力分布与随机干预混为同一估计对象。

建议替换：

> A central prediction is that the recovery advantage of broader error-class exposure over concentrated specialization will be larger when a prespecified baseline specialist is unavailable than when the full team is present. This prediction applies to the error classes targeted by training and assumes sufficient preparation to benefit from both arrangements. The primary causal comparison is the interaction between randomized routing and independently assigned member availability. Capability assessments test whether the expected member–class changes occurred; recovery is measured separately. Concentrated specialization may remain faster with the complete team, and a precise absence of the predicted interaction would count against this account in the tested setting.

此比较超过“多练习会更好”，因为它约束练习总量并允许专门化在完整团队中占优。它仍与经典交叉训练及适应研究相邻，应称具体的拟议检验。交互需直接估计，不能以两组显著性不同代替；不应将缺席者选成处理后成绩最高的人。

## 4. 将重复防御压缩成清楚的贡献表述，保留有实质识别意义的限制

位置：Delivery and future responsibility末段“Our proposed contribution…”（约第19行）；证据节末段“Together, these accounts…”（约第33行）；分配节约第59行的“It operationalizes…”；Figure 2正文约第75行。

建议用下段替换第19行贡献段，并删除第33行重复总括：

> This Perspective connects workplace learning and team cross-training to three linked observations in AI-mediated work: who encounters a diagnostic problem, what each member can subsequently do, and how the team recovers under a specified change in personnel or task demands. Its contribution is a coordinated measurement and testing agenda. The comparisons hold training resources and support as stable as practicable while varying the allocation of experience, allowing researchers to examine the developmental consequences of deployment choices alongside delivery costs.

同时删除约第59行重复的“It operationalizes existing arguments about allocation; it does not establish a new mechanism by construction.”；原创性限制已在引言、近邻段和状态说明交代。Figure 2正文可压缩为：

> Figure 2 illustrates why an aggregate capability count leaves recovery under a specified absence unresolved. Both matrices contain six qualifying cells, but only B retains coverage of every error class when member 1 is absent. The figure motivates separate tests of capability distribution and collective recovery.

图注继续保留思想示例、阈值、协调与非实证性质的说明。**不要删掉**等效检验、处理后匹配、组合干预和中介识别的限制；这些内容改变研究能回答的问题，应保留在方法相关位置。也无需逐篇来源反复附加同一句“尚未证明团队接续”，可在证据节末尾或表1集中说明证据的层级。

## 执行边界

本次只新增E21一条书目记录；检索中出现的其他文献未追加到主稿证据库。未改冻结英文、未改中文、未上传稿件。建议主任务在统一修订英文后同步中文与哈希，避免译稿对应失效。修订后的文章仍宜标为整合性的Perspective，不应转成新理论首发宣言。
