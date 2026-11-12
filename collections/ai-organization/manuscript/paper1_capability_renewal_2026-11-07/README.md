# 第一篇论文的写作准备包

**选定方向：谁有机会学会纠错？生成式AI团队中的任务分配与专长接续。**

日期：2026-11-07。目标读者：Nature Human Behaviour 等期刊的行为科学读者。类型：Perspective。当前已完成选题收窄、论证蓝图、逐段结构，并按用户后续授权完成中英文全文与排版制作；没有新实证结果，也未投稿。请优先阅读[完整稿交付说明](./final_manuscript/交付说明.md)。本目录其余文件记录前期准备与审查过程。

## 推荐阅读顺序

1. [01_第一篇论文选题与论证蓝图.md](./01_第一篇论文选题与论证蓝图.md)：题目、与腾讯报告的关系、贡献边界、证据、四条命题、测量、公开资料路线及中文摘要。
2. [02_逐段写作结构与论据安排.md](./02_逐段写作结构与论据安排.md)：21段的任务、证据和衔接，约3,800英文词的作者工作预算。
3. [concise_evidence_ledger.md](./concise_evidence_ledger.md) 与 [source_manifest.json](./source_manifest.json)：E01–E20精选文献的定位、支持范围与阅读状态。
4. [presubmission_proposal.md](./presubmission_proposal.md)：英文摘要、广泛意义和简纲；仅本地草稿，未发送。
5. [figure1_conceptual_framework.png](./figure1_conceptual_framework.png)：概念图预览；[SVG矢量版](./figure1_conceptual_framework.svg)可编辑、导出。所有箭头均为拟议关系，没有虚构数据。

## 如何理解概念图

AI工作设计改变任务如何分配；分配可能改变谁获得诊断、修复和反馈经历；这些经历可能形成不同的成员×错误类别能力覆盖；覆盖对团队恢复的影响还依赖协调、外部支持、共享错误及未来任务。

图中的“当前交付”单独测量。AI辅导和模拟练习作为可能的补偿路径进入框架。比较应预先规定任务与资源，不按处理后的产出筛选或匹配团队。图为论证辅助，不是已经识别的因果模型。

## 审查附件

- [learning_evidence.md](./learning_evidence.md) / [learning_sources.json](./learning_sources.json)：七项核心学习相关来源的详细审读。
- [venue_and_theory_audit.md](./venue_and_theory_audit.md)：官方提案流程、格式核查缺口与理论近邻。
- [adversarial_review.md](./adversarial_review.md)：反证、报告物理页码、公开材料局限及最初反向审查。其较宽研究议程以01主稿的最终收窄为准。
- [final_review.md](./final_review.md)：主蓝图终审及局部修订记录。

此前的跨领域选题与57项来源库位于 ../../research/ai_superteams_research_agenda_2026-11-07/；本包精选与第一篇直接相关的材料，没有把所有旧来源视为本文必引文献。

## 证据和作者核验状态

原始PDF作为问题与组织案例来源；原始学术文献分别承担实验、质性、综述或理论论证。文件明确区分已发表研究、预印本、摘要阅读和原文定向阅读。AI交叉审查不能替代署名作者核验，所有来源的human verification均为pending。

最近邻初筛已经发现重大重叠，故不声称首次提出产出与未来专长的冲突。关于成员分配与未来纠错覆盖的候选增量，仍需在完整阅读最近邻后确认。没有开展系统综述、元分析、复制分析、公众数据采集或真人实验。没有编造作者身份、资助、伦理审批、数据可得性或录用预期。

## 工作流程与软件说明

本轮使用Scientific Writing、Scientific Critical Thinking、Scientific Brainstorming等科研技能指导证据分层、原创性反向审查和写作组织；并行AI审读的输出已与原始来源阅读范围对照。下列引用只记录工作流程来源，不作为本论文关于AI团队的实证证据：

Kassis, T., Agarwal, V., He, Y., Patel, D., & Brueckner, A. M. (2026). *Scientific Agent Skills: A Library of Procedural Knowledge for Research Agents*. arXiv:2609.00065. [DOI](https://doi.org/10.48550/arXiv.2609.00065)。2026-11-07核对记录，最新版本v2；无已确认的正式期刊版本。

概念图由本地Python标准库脚本build_figure.py生成SVG，使用bundled Node.js的sharp渲染PNG；没有使用经验数据或图像生成模型。导出后进行了视觉检查。正式论文的AI使用披露应由作者根据实际使用和届时期刊规则准确撰写，不将此说明直接当作已批准的投稿声明。
