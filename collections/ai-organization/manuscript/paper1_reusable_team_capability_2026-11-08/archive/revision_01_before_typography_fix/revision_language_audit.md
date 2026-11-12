# 双语措辞精审：建议统一修订的 8 处

核对日期：2026-11-08。审校对象为本目录 `manuscript_zh.md`、`manuscript_en.md` 当前版本（文件修改时间均为 12:33:50），并对照 `sources.json`、`additional_sources.json` 和 `report_casebook.md`。这里只提供修订建议，未修改生产稿，也未新增事实或来源。行号指当前 Markdown 源文件；重新排版后应以段落内容定位。

整体上，两语论证结构和方法边界一致。需要优先处理的是摘要的证据语气、假设情景的明示、中文尚存的原件歧义，以及“运行—判断—回传”之间的表达。下面其余建议主要使文字具体、简洁，避免把限定条件变成重复的自我辩护。

## 1. 摘要：把报告所述过程与机制解释分开

位置：两稿第 5 行。

原句：

> 腾讯研究院报告中的共享 Skill 表明，一项跟踪任务可以经共同调用与迭代进入日常工作，但没有揭示个人方法转为团队实践的完整过程。

> A shared Skill described in a Tencent Research Institute report illustrates how repeated use and revision can bring a tracking task into everyday work, without revealing the full transition from personal method to team practice.

问题：“表明……可以经……”及 “illustrates how … can bring” 容易把报告描述的先后过程读成共享与迭代促成日常使用的解释。S09 支持团队调用、修改和节后持续使用，没有追踪个人方法转化的起点或识别作用机制。

建议替换：

> 腾讯研究院报告记载，一项 AI 动态追踪 Skill 经团队共同使用和修改，在假期结束后仍继续使用。这一案例为研究方法的持续复用提供了线索，但未追踪个人方法转为团队实践的完整过程。

> A Tencent Research Institute report describes a team using and revising an AI news-tracking Skill and continuing to use it after the holiday. This account provides a starting point for studying sustained reuse, but does not trace the full transition from personal method to team practice.

图 1 图注中的“图示还原这些动作”也可微调为“图示概括报告记载的动作”／“The figure summarizes the reported actions”，避免暗示掌握了完整现场过程。图注其余证据边界可保留。

## 2. 第 1 节：明确第 73 页是假设情景，去掉“具名”这个无关限定

位置：两稿第 17 行后两句。

原句：

> 报告第 73 页还用新同事加入小组的场景……后一段是作者对日常机制的场景式说明，并非一位具名员工的访谈实录。

> Page 73 of the report also presents a scenario … This is an illustrative account of an everyday arrangement, not an interview transcript from an identified employee.

问题：这可能让读者以为材料来自匿名员工的真实经历。casebook 已确认原报告明确以“假设你刚加入”展开；最准确也最简洁的写法是直接标明假设，不需要讨论访谈是否具名。

建议用一句替换上述两句：

> 报告第 73 页还以新同事加入小组的假设情景，说明他如何接到可运行的 Skill，使用、修改，再将改动送回。[S09]

> Page 73 also uses a hypothetical newcomer scenario to illustrate receiving a runnable Skill from a colleague, using and modifying it, and returning the changes.[S09]

## 3. 第 3 节：中文仍暗示报告公开过 Skill 原件，与英文不等义

位置：两稿第 43 行。

中文原句：

> 以下“每日 AI 简报方法页”是本文提出的设计示意，并非报告公开的 Skill 原件。

英文已经写为：

> The “daily AI briefing method sheet” below is an illustrative design; the report does not provide the original Skill.

问题：中文“并非报告公开的……原件”仍预设了原件曾经公开。英文修正已经到位，只需让中文与之对应。

建议中文替换：

> 以下“每日 AI 简报方法页”是本文提出的设计示意；报告并未公开该 Skill 的原始材料。

英文可保持原句。图 2 图注已明确设计示意身份，无需再扩展解释。

## 4. 第 1 节：完成任务不是“交接有效”的单独因果证据

位置：两稿第 23 行，三种证据的并列句。

原句：

> 制作者成功完成任务，是方法可能有用的证据；接收者能完成自己的任务，是交接有效的证据；后续任务和条件变化时仍能继续使用，则需要进一步解释。

> A maker's successful task completion suggests that a method may be useful; a recipient's completion of their own task provides evidence about the handover; continued use on later tasks and under changed conditions requires further explanation.

问题：中文比英文更强；接收者可能凭原有能力完成任务，且观察到复用也不等于识别了交接安排的作用。该段只需区分观察对象，无须提前判定有效。

建议替换：

> 制作者完成任务，说明方法在原场景中可能有用；接收者借助该方法完成自己的任务，提供了复用的直接证据；它能否适用于后续任务和变化的条件，仍需继续观察。

> A maker's task completion suggests that the method may be useful in its original setting. A recipient completing their own task with the method provides direct evidence of reuse. Whether it remains usable on subsequent tasks and under changed conditions requires further observation.

这里保留描述层面的证据，因果比较继续由第 5 节承担。

## 5. 第 2 节：去掉“只有实际使用才会发现条件”的必要性断言

位置：两稿第 29 行末句。

原句：

> 只有当接收者把它用于自己的任务，双方原先没有说出的条件才可能显现。

> Conditions left unstated by both parties may become apparent only when recipients apply it to their own tasks.

问题：“只有……才”／“only when” 排除了事前讨论、审阅或演示中发现条件的可能。A03、S01 支持转移与执行需要情境化分析，并不支持这一必要条件。

建议替换：

> 接收者把它用于自己的任务时，双方原先没有说出的条件可能逐渐显现。

> Applying the method to recipients' own tasks may reveal conditions that neither party had made explicit.

## 6. 第 2 节：把“同步转移”写成具体问题，并避免用打开成品代替运行方法

位置：两稿第 37 行末两句、第 39 行首句。

原句：

> 我们提出分别观察方法能否执行、接收者如何判断适用范围，以及改动怎样回到共同材料。三者能否同步转移，构成比“多写文档有没有帮助”更具体的问题。

> We propose separately observing whether a method executes, how recipients judge its applicability, and how revisions return to shared materials. Whether these transfer together is a more specific question than whether additional documentation helps.

问题：执行、判断和回传是不同活动，不是三份可以一起“转移”的知识。“比……更具体”也只是评价自己的提问，未增加论证。紧接着的“简报能被第二人顺利打开”又把阅读成品与运行方法混在一起，削弱了本文的具体工作场景。

建议替换第 37 行末两句：

> 我们因此分别考察三个问题：同事能否运行这套方法，能否判断它何时适用，以及有用的修改能否进入其他同事随后使用的版本。

> We therefore distinguish three questions: can a colleague run the method, judge when it applies, and return useful revisions to the version others subsequently use?

建议替换第 39 行首句：

> 例如，同事已经能用共享方法生成一份简报，最初的制作者便可能认为交接结束。

> For example, a colleague may already be able to generate a briefing with the shared method, leading its maker to regard the handover as complete.

这是对已有假设例子的澄清，不增加腾讯案例事实。

## 7. 第 3、5 节：将不明确的“入口”和“源方法”改为可理解的动作与对象

位置：第 3 节第 47 行；第 5 节第 83、87、91、101 行及相应图内文字。

原句：

> 这种方法页还应让接收者看见调整入口。

> The sheet should also make routes for adjustment visible.

建议替换：

> 方法页还应说明哪些部分可以修改，以及同事可以向谁提出修改需求。

> The guide should also explain which elements can be changed and whom colleagues can approach to request a revision.

后面已有“哪些选项可以自行改变、哪些会影响他人”的具体说明，建议合并相邻重复句，不再连续两次使用“入口”。同一段中的工具依赖、更新责任和个人副本／共享版本区别应保留。

研究设计处建议统一：

| 现用词 | 建议中文 | 建议英文 | 原因 |
|---|---|---|---|
| 源方法／source method | 原始工作方法 | underlying working method | 明确是各条件共同出发的方法，不是来源材料或研究方法 |
| 共同的基础模型／a common foundation model | 相同的 AI 模型 | the same AI model | 此处需要表达控制条件相同，无须额外限定模型分类 |
| 任务池／task pool | 任务集合 | set of tasks | 对广泛读者更直接 |

正文、图 3 图注及图中文字宜同步。资源“上限相同而实际投入可不同”的现有解释应保持，不改成实际工时相同。

## 8. 两处防御性尾句可以缩短，同时保留真正的证据限制

位置 A：两稿第 39 行末句。

原句：

> 生成式 AI 的研究价值在于考察能够以日常语言制作和修改的方法，如何在不同岗位间移动，而不是把知识转移本身宣布为新现象。

> The research opportunity lies in studying how methods that can be created and modified in everyday language move between roles, rather than declaring knowledge transfer itself a new phenomenon.

建议替换：

> 对生成式 AI，可以进一步考察以日常语言制作和修改的工作方法如何在不同岗位间被使用和调整。

> In generative AI settings, research can examine how methods created and modified in everyday language are used and adapted across roles.

前文已交代知识转移、惯例和近期 AI 研究，也保留了“传统自动化中同样存在”的一句；无需再否认一个本文没有提出的首创主张。

位置 B：两稿第 53 行 A04 理论说明。

原句：

> 关于能力形成的理论提出，低频、难以从反复实践中积累经验的任务也可能从知识编码中受益；这是一项理论主张，并非本交接方案的实证效果。[A04]

> Theory on capability development also proposes that knowledge codification can benefit infrequent tasks for which experience is difficult to accumulate through repetition. This is a theoretical argument, not an observed effect of the present handover design.[A04]

建议替换：

> 能力形成理论提示，低频任务难以通过反复实践积累经验，也可能从知识编码中受益。[A04]

> Theory on capability development suggests that codification may also benefit infrequent tasks, for which experience is difficult to accumulate through repetition.[A04]

“理论提示”／“Theory … suggests” 已保留证据性质。本稿没有报告新实验的叙述，后一句重复否认自己的设计已有实证，没有必要。这里不删低频任务可能受益的反例，也不把 A04 写成实证发现。

---

修订时建议保留的必要限定：腾讯案例未证明个人起源、单次双人交接仅为局部证据、公开仓库不等于员工行为、B/C 为组合干预、随机分组分析、时间与任务变化的区分，以及质量和全体投入并列评价。这些不是可随意删除的“防御句”。上述 8 项不要求改变选题、增加案例或补出新结果。
