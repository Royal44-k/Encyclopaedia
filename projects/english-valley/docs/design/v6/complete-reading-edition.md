# English Valley v6.1 · 完整设计阅读本

由分章源文件汇编，便于连贯阅读。修改请回到对应源文件；本文件不代表运行课件或录音定稿。


---

来源：[production-bible.md](production-bible.md)

# English Valley · 故事、人物、交互与视听制作总案 v6.1

2026-11-07。基于已批准的同一山谷视觉与v5教材故事体系，完成本轮深度调研和逐章脚本设计。该版本作为后续预演与开发的设计依据；具体学生体验、演员表演、模型与实时画质尚未验证。

本轮开发准备度复核与实际修改见[v6.1审查与打磨](readiness-and-refinement-v6_1.md)。结论：可以开始第一条完整旅程及共同底座；十二章批量制作仍需真实样板与逐章交接。新增[课堂执行稿](classroom-playthrough-v6_1.md)、[第一旅程交接](implementation-handoff-v6_1.md)、[流程合同](first-journey-flow-v6_1.json)及[分支对白表](dialogue-branch-table.md)。

## 这一版具体做到了哪里

十二章各有独立详稿，包含开场钩子、人物当下愿望、事件发展、可改变的操作、逐句原创对白、关键分支、结束状态、视听调度、语言用途与跨章延续。溪流环保主线另有连续场面，仍属于T03及其后续，不新增脱离世界的第十三关。

六位常驻角色拥有不同的愿望、盲区、动作习惯与声音节奏；两段日常对话让成年人彼此之间的关系在场景里发生。人物不依靠长篇背景介绍才有性格，学生先遇到一个正在做事、会误解也会修正的人。

本轮设计者确定：保留已批准自然主义视觉；采用共同世界中可独立选读的故事；连续旅程围绕准备、到访、回访和告一段落展开；日期、回忆、试验与实施各有明确记录。具体规则见[状态与场景执行](story-state-and-staging.md)。这些是本轮定稿的制作决定，不冒称用户逐项指定。

## 调研带来的取舍

实际阅读三组资料：8项叙事与表演一手文本、9项视觉与音频技术/制作资料、6项教学机构资料；另有6项新增词义与语法核对。阅读范围、全文与片段边界分别登记，未把演讲简介当完整演讲、未把访问受限PDF当已读整书。

- [叙事与表演研究](../../research/narrative-performance-research-v6.md)：从Mobius、inkle、Ghost Pattern、Night School开发者及配音从业者资料中，取用有目的的探索、人物自己的愿望、条件对白、连场试读与可追踪内容的方法。
- [视觉与声音研究](../../research/visual-audio-research-v6.md)：Three.js、Khronos、Filament、MDN和Naughty Dog制作自述，帮助把真实感落实到材质、接触、同源声影与细微表演，并说明技术能力的边界。
- [教学与故事研究](../../research/teaching-story-research-v6.md)：British Council、UT Austin、Cambridge与EEF资料用于信息差、角色动机、配音活动和反馈设计；不把汇总研究效果套到本项目。
- [英语核对与理解支持](../../research/language-notes-v6.md)：原创台词、词义/结构来源、教材定位、正式审校状态分清。

曾考虑把十二章串成统一任务链，或完全自由漫游。前者会削弱每章独特的体验，后者容易缺少探索理由和课堂收束。采用已认可的共同世界结构，给每次进入可看见的愿望和线索，同时允许选择路线、暂存作品和约好回访。没有为扩展规模增加地图建筑。

## 逐章阅读入口

| 详稿 | 开场吸引学生的事 | 主要操作/交流 | 结局完成什么，又留下什么 |
|---|---|---|---|
| [T01旧物奇想展](episodes/T01.md) | 一只滚到桌边的瓶盖、一张空展签 | 拼装、猜作品、作者解释、换视角展示 | 作品有了表达；另一位观众仍可能看出新东西 |
| [T02树屋夜声](episodes/T02.md) | 同一方向传来两种不同声音 | 换站位、比较、固定活动部件 | 已查明的声源讲清；未查明的有下一步 |
| [T03带朋友游园](episodes/T03.md) | 朋友有愿望，地图没有完整答案 | 问偏好、核时间、带路、改道 | 一次自己的游园；桥边问题带来回访 |
| [溪流连续场面](episodes/T03-stream.md) | 清走垃圾后，水色仍未改变 | 访查、对照、模拟、选择实施、复查 | 完成具体行动，保留结果范围与现实延续 |
| [T04意外的新用途](episodes/T04.md) | 摆错的部件投出会变化的形状 | 重复观察、调整、说明给伙伴复现 | 一项自己的发现；用途仍可以继续发展 |
| [T05窗上的故事](episodes/T05.md) | 展开后出现一条意外的空白 | 折剪、修改或保留、解释寓意 | 作者作出选择；另一时刻的光会带来新观看 |
| [T06月下寄语](episodes/T06.md) | 收件人写好了，内容还空着 | 安排受众、寄语、决定分享范围 | 当下意愿清楚；未来回应不预先编造 |
| [T07音乐场景](episodes/T07.md) | 同一段音乐引出两个不同画面 | 重听、布景、交换解释 | 分歧被理解；明天仍可能听出别的东西 |
| [T08失误以后](episodes/T08.md) | 装置早启动了，Iris离开排练 | 倾听、复述、陪伴或暂停、商量再试 | 当前安排明确；关系不靠一句话瞬间修复 |
| [T09第一次做客](episodes/T09.md) | 热情满杯与只想尝一点的请求 | 主客交换、提问、调整欢迎安排 | 一次误会减少；下个客人仍有不同偏好 |
| [T10谈谈梦想](episodes/T10.md) | 草图盖住了同一时段的承诺 | 换位复述、调整具体日程、请求协作 | 一个可试安排或约谈；未来靠经历再修改 |
| [T11山谷小电影](episodes/T11.md) | 少看一秒，动作就变了意思 | 看无声片、配两种对白、剪辑、试映 | 一个能被理解的版本；留出下一次修改 |
| [T12时间盒](episodes/T12.md) | 一个小盒子装不下全部经历 | 选择、说明、归还借展、决定去留 | 本次旅程有收束；未来观察和相遇仍开放 |

## 人设、镜头与声音怎样统一

[人物与表演设定](characters-and-performance.md)规定Sam、Mei、Rowan、Amina、Iris、Noor的动机、弱点、行动和声线。重要时刻用可观察行为表现：Sam伸手后收回；Mei重新看作者的空白；Iris在被听懂后才打开草图；Amina停止摆杯听完请求；Rowan承认记录缺口；Noor愿意把被删的前文剪回去。

[视觉与声音导演稿](visual-and-sound-direction.md)把每章最值得做的画面和声音写具体。视觉冲击优先来自玩家能引起的变化：转动有触感、影子有来源、纸样真的展开、人物真的在听。环境声和音乐有时应让位；留白不能让学生听不清或不知道当前事情是否结束。

旁白不读心，也不替学生宣布感动。NARR为可选观察性叙述，LEARNER为学生表达示例，NPC为固定对白；必要音频描述另行制作。英语的丰富度由不同交际需要带来，同时保留基础短句和按需理解支持。

## 环保教育的完整走线

T03游园发现桥边变化，溪流段沿同一地形访查并修订解释；模型比较帮助设计措施，明确确认与操作后才成为当前世界的实施结果。工坊创作提供资源珍惜与表达机会，T08支持共同工作，T09接待与T11短片使行动面对真实受众；T12留下现实观察和后续邀请。

课堂主线保留发现、思考、访查、线索、方案、动手、复查、现实迁移、意识与呼吁。某些具体问题可能得到改善，有些需要继续观察。音乐、文化与朋友之间的生活也有独立价值，不要求每章末尾统一输出环保口号。

## 后续制作如何使用这套稿

剧本编辑以章节详稿为场面和主表台词来源，分支口播以后以独立分支对白表为编辑源；状态文件管理跨章事实。第一旅程的具体入口、字段、事件与节点以v6.1交接和JSON为准；课堂稿必须对应同一范围。美术与动画按视觉稿和v3世界契约制作，录音按人物稿与逐句意图试读。索引与完整阅读本由源文件生成；审阅报告保留发现时的措辞，不充当当前脚本。若源文件之间出现冲突，先统一事实再录音或做动画，不由制作者各自猜。

第一批以T03内部C1的独立回访课例完成一条从发现到保存的连续体验，检验英语交流、访查、模型、实际操作和回访约定。T01触感与创作、T02声影推断、T05纸样形变、T08人物表演保留为四类专项预演，可按资源并行；它们不替代完整教学体验。此为v6.1修订的生产安排，取代v6只列四类样板的准备顺序；不恢复旧三案例课程规模。

阅读/操作时间、角色反应是否自然、基础学生能否进入故事，都需要学生或教师走读。正式演员录音、配乐许可、原教材印次和语言逐句审校、近景模型、实际浏览器表现尚有生产工作。这些未完成项不被已有设计稿替代。

## 已做的审阅

三路审阅均完整覆盖十二章、溪流段与人物设定，分别检查叙事制作、教学语言和视觉连续性。对模拟/实施混用、提示责任、主客回应、日程数据、借展实体、独处恢复、历史拍摄等具体问题已修订；见[处理记录](review-resolution.md)。审阅是内部设计检查，不是教师认证、演员试听或课堂效果证据。


---

来源：[readiness-and-refinement-v6_1.md](readiness-and-refinement-v6_1.md)

# English Valley v6.1 · 能否进入正式开发，以及本轮实际打磨

2026-11-07。审查对象是现有十二章、溪流连续场面、人设、对白、课堂安排、共同世界与美术交付。没有把概念图当实时画面，也没有把文件检查当学生试玩。

## 我的判断

**可以开始首条完整可玩旅程与共同底座的正式开发；还不适合十二章同时进入精模、正式配音和批量制作。** 已经不缺世界观、案例数量和主要故事，最需要补的是不同工种接手后能做出同一种体验的具体约定，以及学生实际开口、操作和重新思考的机会。

本轮把可以在设计阶段解决的问题直接改进源稿，保留已批准的自然主义视觉、十二个故事和环保教育走线。没有重新扩地图或增加案例。下一步最有价值的证据来自真实可玩的片段、演员连场试读和教师走课，继续增加宏观设想不能代替它们。

| 制作层次 | 当前判断 | 适用范围与边界 |
|---|---|---|
| 共同山谷、人物关系、十二章叙事方向 | 可以作为制作依据 | 同一地形、同一作品与记录身份；具体尺寸仍随共同灰模校准 |
| 第一条完整旅程 | 设计交接已补齐，可以开始实现 | 入口、证据、试验、操作、说明、保存和合法退出；详见配套流程合同 |
| 全部十二章同步批量制作 | 尚不具备条件 | 其余章节仍需逐章转为可执行场面、试读并冻结镜头/资产，不能只按台词编号顺播 |
| 游戏级真实渲染与角色表演 | 目标明确，效果未证实 | 需要同一浏览器中的环境近景、连续移动、手部接触和双人表演样片 |
| 正式教学使用与宣传效果 | 尚未完成验证 | 学校教材印次、逐句语言审校、实际设备与学生体验必须各有记录 |

## 已实际修改的内容

### 角色从“解释教学目的”转为正在做事的人

修改十四条主表对白及相应动作，保留原ID；调整理解支持和引用索引。角色的差异更多由行动与愿望表现，不要求所有人都说漂亮的反思总结。

| 场面 | 原来的问题 | 本轮采用的处理 |
|---|---|---|
| Sam过早替作者修作品，T01.012 | 直接解释自己的心理缺点 | “Sorry. Show me your idea first.” 手在接触前收回，真的等作者动手 |
| Rowan辨认声音，T02.001/015 | 开场先给出“一声还是两声”的题；之后总结观察方法 | 先停下来听，再亲自移到楼梯旁听音，学生有机会更早发现 |
| Mei面对无效位置，T03S.022 | 把修订过程说成教学结论 | “All right. Show me where.” 只在学生提出调整后回应，由学生移动 |
| Iris听另一种音乐解释，T07.014 | 用“我理解你了”整齐收尾 | “I still like mine better. Can we listen to yours again?” 保留不同意见，也愿意再听 |
| Amina接待与看草图，T09.006/T10.018 | 自述热心、反复询问设计意图 | 实际少倒一点；放下日程靠近草图，注意力的转移是情感回报 |

保留需要信息量的长句，例如Iris对下一次被排除的担心、Mei目击范围的限制、具体日程冲突。没有把语言丰富度削成全员短句。T12的现有泛化回应暂予保留：不为了更动人而替未去过工坊的Noor编造共同经历。

### 六处场面更有自己的玩法与收束

- T01先让观众指一个部件并猜，再由作者回应；可动作品以一次真实启动回应解释，静态作品用观看位置回应。
- T02允许学生直接识破；Sam如实回答。查明两个声源时完成揭晓，不在每个结尾再塞一个新谜。
- T05先预测实际切口展开的位置，可折回核对；旁白不先解释“空白像小路”，保留视觉发现。
- T08明确“坐在附近／先离开”可直接行动；不把准确复述某一句作为继续陪伴的资格。
- T09让欢迎卡被一位实际来客试用；没有来客就记待试用，不自动生成满意反馈。
- T11给Noor保留可以被采用的剪辑建议和清楚标为虚构的幽默版本；他有创意，不只负责犯错。

### 把课堂中的英语交流落在具体材料上

新增[首课走读与课堂执行稿](classroom-playthrough-v6_1.md)：45分钟的首次体验安排、可分别发放的英文角色卡、来源明确的证据材料、按需语言支持、十二案的具体表达时刻、退出条和教师观察方式。

任务进度、学生自己记录的表达、教师确实观察到的表现分别保存。点过证据卡不代表已理解；选择示例句不代表独立表达；与真人交流和单人预写回应也不混记。表达可以是短语、指图配说明、书写或口述，语法关键词不负责解锁故事。

45分钟是待演练的课时假设，不要求每组都完成安装或三幅精修作品。按时间保留未解问题与已有表达，后续课再继续访查、实施与复查。

### 把重要分支和操作边界交给开发

原来散在说明里的51条分支，已集中到[分支对白表](dialogue-branch-table.md)，逐条列出说话人、触发条件、回接或结束。与主表共形成342条结构化对白/学生示例记录，仍是编辑稿，不是已经录制的成品。

第一条旅程另有[制作交接稿](implementation-handoff-v6_1.md)与[声明式流程数据](first-journey-flow-v6_1.json)，明确：看过资料、模型运行、搬运摆放、正式安装、作品版本与回访计划分别何时成立；暂停、重复确认、保存失败和恢复如何处理。这只为首条旅程补齐实现依据，不声称其余十一章已经自动变成可运行剧情。

模型采用固定无覆盖基线与所选位置比较，输出有限的预设定性结果，不充当现实水文测量。现场放置只写入“措施已放置”；当下水色保持，后续生态变化需要真正的新记录。

## 第一条完整旅程与四类艺术样板

首条旅程从**同一桥位的独立回访课例**开始：看记录与现场 → 上游、裸土浅沟和Mei访谈 → 一种覆盖措施的比较 → 保留提案或实际放置 → 向同伴解释 → 回桥保存与约定复查。首版不承担整段自由游园或全部章节的制作量，也不编造玩家此前完成过的行动。

这条旅程检验的是“为什么想查、为什么问、为什么做、做完能说清什么”。T01触感、T02声影、T05纸样、T08人物表演仍各有艺术样板，验证后续章节的特殊风险。它们服务同一项目，可以按资源并行；四个漂亮片段本身不能替代完整教学体验。

环保闭环保留完整：发现—思考—访查—证据—方案—操作—复查—联系现实—形成意识—提出具体邀请。首课可以停在待复查；**闭环不等于在一课里表演所有问题都解决了。** 后续应回到同一观察点、检查实际变化，再邀请下一组继续记录一个明确问题。

## 视觉与表演接下来怎样证实

新增的[首旅程镜头与表现约定](visual-and-sound-direction.md#首条旅程的五个验收镜头-v61)把画面目标放到可复拍的镜头上：总览到主桥、瓶子移除后仍流动的褐水、Mei的访谈、同条件模型比较、回到同机位。远近景共享地形与状态；相机动起来之后仍要可信。

“逼真”要在接触、尺度、材质、视线与光照上成立：玻璃有结构厚度，物件落在支撑面上，手与道具对应，人物会等学生说完。雾、光晕和电影景深可以营造情绪，但不能遮住线索或掩盖资产问题。录音先连场试读，比较意图与停顿，再冻结分句，避免十二章录完才发现角色都像主持人。

下一批可审核的制作成果是：同一山谷连续可走的灰模、上述镜头的浏览器实际输出、一个能操作保存的完整旅程、T08一段连场表演，以及教师实际走课记录。目标设备未实测前不承诺全开流畅；这也不构成重新选择已批准视觉的理由。

## 仍需完成、但不应继续只写文档的事

| 尚缺证据 | 下一步应取得的具体结果 |
|---|---|
| 真实画质与资产一致性 | 共同灰模确认尺寸和路线；定制近景资产、连续浏览器录屏与同条件截图 |
| 角色是否自然 | 含上下文的连场试读、视线与手部预演；检查玩家沉默或打断时如何接续 |
| 首课是否有趣且够时间 | 教师走课与学生试用，记录他们主动问了什么、哪里需额外解释、谁被操作挤出了交流 |
| 英语与教材最终可靠性 | 核对学校实际版次；逐句检查用法、发音、字幕及场景事实；原创整句不能冒称词典或教材认证 |
| 批量生产可控性 | 首条旅程走通后，按章冻结事件、素材、镜头和配音，复用已证实的共同系统 |

本轮文档核验见[文档检查](preparation-check.json)和[首旅程合同静态检查](first-journey-contract-check.json)。前者检查对白定义、文本编码和本地链接；后者检查字段、输入、节点、对白引用、忽略条件时的结构可达性和世界状态写入者。它们不证明所有条件组合都可执行，也不证明真实渲染、教学成效或正式录音质量。完整内容可连续阅读[更新后的设计阅读本](complete-reading-edition.md)。


---

来源：[characters-and-performance.md](characters-and-performance.md)

# English Valley · 人物与表演设定 v6

2026-11-07。六位虚构常驻角色及叙述方式的制作设定；年龄、经历与表演细节为本轮设计提案。沿用Sam、Mei、Rowan、Amina、Iris，新增Noor作为反复相遇的学生朋友。玩家不被赋予固定性格、家庭经历或国籍。人物不是教材人物的替身。

## Sam · 工坊维护员，42岁

Sam喜欢弄明白东西为什么还能工作。他想留下的是别人愿意自己动手的工坊；但有人卡住时，他总会先伸手帮忙，结果把别人的创作变成自己的解决方案。他收藏一只已经不能修复的小木轮，来自年轻时做坏的舞台车，不把它包装成成功传奇。

第一次见面，他在讲解前用拇指接住滚到桌边的瓶盖，随后递回玩家，不替玩家放进“正确”抽屉。听不懂抽象作品时，他可以坦率说不知道。T01中收回过早伸出的手；T04承认自己没发现光影效果；T08学习等Iris先提出下一步；T12允许学生带走作品，不把留给山谷当成更高尚的选择。

外观：深橄榄工作衬衣、亚麻色围裙，左口袋一支短铅笔；磨损集中在使用部位。手部稳、转身稍慢，沉思时捏一下铅笔末端，不每句循环。语气偏低、松弛，幽默后不自己大笑。关切时减少玩笑，句子更短。不能演成永远睿智的导师。

“What did you have in mind?”录三种情境：初见时真诚询问；发现自己接管作品后轻轻撤回；争论用途时放慢速度确认。情绪变化不靠提高音量。

## Mei · 园丁，36岁

Mei记得许多植物的具体变化，也喜欢把某一盆放到自己觉得最好看的地方。她希望开放日值得期待，因此很难承认那周没有完成所有照料。被问到雨后溪流时，先把手套叠好才回答；这是整理思绪，不能被镜头暗示成说谎证据。

她容易替植物、也替人决定“最适合的位置”。溪流访查中把看见的事和猜想分开；T05被学生说服保留不对称窗饰；T09先问来客想坐哪里。后续看到新问题仍会皱眉，成长不把认真消灭成随和。

外观：灰绿色外套、浅棕长裤、作业留下的少量真实泥点。谈熟悉的植物时语速稍快，不确定时停一下，用具体时间或地点回答。她会笑、会记错、会提出有效反例，不是污染的单一责任人。近景重心是目光从花床移回提问者，不不停看相机。

## Rowan · 巡护与观察记录者，31岁

Rowan擅长发现小差异，喜欢把记录写完整，却容易以为别人也注意到了同样的细节。他不爱长篇解释，但别人没找对位置时会耐心陪着走。册子缺记录来自普通排班空缺，不制造阴谋。

他想让学生自己核对，同时要学会先听学生看到了什么。T02承认某个声源没有解释；溪流段主动指出空白记录；T11阻止过度概括，也保留影片中自己最初猜错的一句。T12留一页空白给后来者，允许新的观看方式。

外观：苔色外套、结实鞋、册子和肩带，不堆满神秘道具。声音清楚、偏中低，短句间留思考空隙；发现有趣细节时突然轻快，并非全程低沉。先看对象，再确认同伴是否跟上，不每走两步回头发任务。

## Amina · 社区活动组织者，40岁

Amina记得别人喜欢怎样喝茶，能把陌生人介绍给彼此。她想让每个人自在，也因此怕冷场，偶尔替别人把一句话说完。T09茶会中，她以为添满杯子就是体贴，来宾却想先尝一点。

T08不替Iris宣布“已经没事了”；T10关心时间承诺，也承认自己的安排过满；T06给未寄出的信留空间。她仍喜欢热闹，并非经过一课便变成沉默的心理辅导员。

外观：暖土色针织外搭、深绿长裤，常用袖口翻折。声音明亮、节奏有变化；询问私事时放轻而不耳语。欢迎陌生人时站侧一点让出入口，认真听时停止摆杯。禁止每句上扬的客服声线。

## Iris · 15岁的学生同伴，擅长画场景和做装置

Iris很快能想象一束光会带来的效果，草图却往往比说明清楚。她希望别人看见自己的想法，不喜欢被当成需要大人照顾的小孩。她会兴奋地讲得很快，也会在作品不按预想运行时把草图压住。她喜欢准备充分，因为怕自己的失误让别人失望。

T01可能误读玩家作品，但愿意重新看；T04比Sam先发现偶然效果；T08对失误难堪，不能靠一句“别难过”立即恢复；T10练习提出做得到的安排。她有自己的笑话，喜欢给草图边角画特别小的观众。

外观：灰蓝外套、暖米色T恤、斜挎速写册，正常青春期体态与自然皮肤材质。语速随投入变化；受挫时先看道具，再找词。主要表演是压住一句话、改变呼吸和手部动作，不默认哭泣。演员应先听对手上一句。

## Noor · 15岁的来访学生，喜欢拍片段和提出意外的问题

Noor能发现普通东西的滑稽之处，常问用途以外的问题，例如作品从背面看像什么。他想找到愿意讲给别人听的小故事，讨厌被“你一定会喜欢”安排满行程。他容易先拍摄后询问，也会学习先征求镜头前的人同意。

T03的偏好可由真人同伴自定；单人默认Noor喜欢会动的作品，想留点坐着聊天的时间。T07与Iris听出不同画面，分歧可以很好玩；T11第一次剪片太急，删掉重要上下文，之后愿意改；T12问一个没有预设答案的问题。角色不因名字绑定某国习俗、口音或宗教。

外观：深蓝轻外套、赭色小包、拍摄设备的固定持握点。声音有轻微笑意，真困惑时不继续卖俏；重点落在自己不知道的东西上。他可以安静，不必每段有俏皮结尾。

## 关系与被看见的变化

Sam与Mei争论物件位置：一个先看结构，一个先看照料。Amina与Rowan在先说清楚、先让人开口之间互相提醒。Iris与Noor互相启发，也可能因拍摄、解释和公开范围产生小分歧。成年人有自己的工作，学生不是他们全部生活的中心。

回忆需有实际经历依据。角色记得“你让那个部件转起来了”“上次还有一种声音没解释”，不反复赞扬玩家拯救山谷。未参与前章者听到公共物件的真实来历；借展、拍摄和寄语许可跟随对象。

## 旁白、玩家与表演记录

旁白是可关闭的观察性引导，不解释角色内心，不替学生总结道理。用于时间变化、离屏动作和必要上下文；信息充分时允许无旁白。另设可访问音频描述，说清有关动作或声源位置，诗意旁白不能代替等价说明。

台词表中NARR是可选旁白；LEARNER是可用但不强迫照读的学生示例；NPC姓名是固定对白。固定对白拥有唯一ID。表演提示描述对象、意图、转变与动作，开心或悲伤只能补充。真人模式允许自己的说法；单人预写分支只承诺明确列出的回应。

录音先按完整小场景试读，再按ID剪辑；关键回应录自然版、收敛版及上下文需要的短版，不用机械变速代替情绪。演员与声音授权后确定声线，不克隆真实个人。正文保留自然语流，另录的学习慢读不替换剧情表演。语速、字幕、重听和暂停通过课堂试听共同调整。

动作与声音共同定时：视线先认出对象；手触物时才发接触音；吸气、停下工作和看向同伴可能早于第一字。环境闲谈可在离开时停下；关键交流可暂停、回看与继续，阅读较慢不被视为故事中的冷漠。

本设定不用于诊断学生人格。人物模型、录音与动画均待制作；表演效果须经试读、预演和试听验证。


---

来源：[T01.md](episodes/T01.md)

# T01 · 旧物奇想展：那个不肯被认出来的东西

教材BK13，U13 Section B 2a–2b；地点为西侧工坊与环形花圃。人物Sam、Iris、玩家。原创主线及关键分支走读稿。建议一课，制作较细时分两课；时间待试教。沿用已检查可用的材料库。

## 从一件小事开始

抽屉拉开，瓶盖滚到桌边，Sam用拇指接住，递给玩家。另一端，Iris把一个旧圆环竖起来，看着它转出的影子。桌上没有标准成品图；一张空展签被纸镇压着。学生先能拿起、翻转或试摆，之后才收到介绍作品的邀请。

本章的愿望是做出一件属于自己的东西；小冲突是观众未必看见作者所想。Sam会过早伸手纠正结构，随后把决定权交还。Iris误读作品可以逗笑双方，但笑点不针对能力。作品不必有实用用途。

## 场面与主线对白

| ID | 角色 | 原创英语 | 调度与表演 |
|---|---|---|---|
| T01.001 | SAM | That one nearly escaped. Here. | 接住后递回；轻松，不夸张 |
| T01.002 | IRIS | Turn it over. The other side looks different. | 她先示范自己的材料，不接管玩家 |
| T01.003 | SAM | You can try things before you give them a name. | 指空展签，转身整理材料 |
| T01.004 | LEARNER | Can these two pieces move together? | 可用图标或自己的问法 |
| T01.005 | SAM | Try this joint. It turns, but it won't hold a heavy piece. | 针对真实连接条件，演示后拆回 |
| T01.006 | IRIS | Wait. Let me look before you tell me. | 玩家选择展示后才出现 |
| T01.007 | IRIS | What should I look at first? | 适用于任何作品；真正询问 |
| T01.008 | LEARNER | This part. I wanted it to move. | 有运动部件时的示例 |
| T01.009 | IRIS | Oh, I was looking at the shape. Show me the movement. | 收起首次判断，靠近但不碰 |
| T01.010 | SAM | If we put this here— | 手伸向连接处，停在接触前 |
| T01.011 | LEARNER | Could I try my idea first? | 请求保留自己的尝试 |
| T01.012 | SAM | Sorry. Show me your idea first. | 手在接触前收回，等待作者实际操作，不替他接着完成 |
| T01.013 | IRIS | Do you want people to understand it straight away? | 不是催作者改到可识别 |
| T01.014 | LEARNER | Not all of it. I want them to ask. | 抽象作品可选回应 |
| T01.015 | IRIS | Then give them one thing to notice. | 提建议，不宣布标准答案 |
| T01.016 | SAM | Where would you like to try it? | 指向真实可用展位 |
| T01.017 | LEARNER | Near the path, where people can see this side. | 选择实际展位后使用 |
| T01.018 | IRIS | It looks different when I'm standing here. | 观众视高；由实际视角触发 |
| T01.019 | SAM | Shall I leave the title blank for now? | 允许作品未命名 |
| T01.020 | NARR | The empty label is still beside it. Someone has stopped to look. | 可选旁白；不替观众解释 |

前段能自由拼装，后段先让真实同伴解释，再让作者说明。单人Iris依据部件状态及学生选择的表达意图回应；不声称理解任意抽象造型。表中移动示例仅在结构存在时用；静态分支改用T01.021–022。

| ID | 角色 | 原创英语 | 分支与回接 |
|---|---|---|---|
| T01.021 | LEARNER | Look at it from this side. What does it remind you of? | 静态作品，不假装有动画 |
| T01.022 | IRIS | Let me try another angle before I answer. | 进入观众视角，再接013 |
| T01.023 | SAM | Would you like a suggestion, or a little more time? | 停滞时由玩家主动请求帮助触发 |
| T01.024 | LEARNER | A little more time, please. | 保留当前构型，撤销提示 |
| T01.025 | IRIS | We can show it without a title. | 作者拒绝命名，也可收回作品 |
| T01.026 | SAM | I'll keep the pieces together until you decide. | 仅在选择暂存后，结束当前课 |

## 交互、光影与声音

观众先指一个实际部件或换一次视角，再说自己看到了什么。作者可以纠正、发笑或保留误读，不必立即作正式介绍。若作品确有可动连接，最后让作者主动启动一次，把解释落到别人看得见的动作；静态作品则由观众移到作者指定位置观看，不补造运动。

英雄近景是圆环转动时高光沿磨损边缘移动，布片落在真实支撑点上；连接反馈由部件接触、轻微阻尼和对应材料声共同完成。先用有限接口保证动作可信。手柄控制、点击选择后旋转和键盘步进都能完成同一操作。连续拖动不必持续说英语。

工坊侧光保留木纹、布纤维与金属区别。停止转动时声响也停，不叠“成功”音效。Iris看作品后再看作者，Sam收回手的动作是本章人物转折。远景人群不在对话中持续大幅挥手。展示处与工坊沿原路连接，作品位置改变后原位不留复制品。

## 收束、后续与课堂

结局可以是命名展示、暂不命名展示或暂存继续做。故事解决了“怎样让别人进入自己的创意”，不要求观众解释一致。最后一位来访者停在另一侧，留下之后会怎样理解的空间；若无人参观，则保持无人版本，不自动写入赞美。

保存作品结构、作者说明、展示/借展许可、位置与版本。T02只可借用符合悬挂和碰撞条件的作品；其余供T03观看、T11拍摄、T12回忆。艺术作品不自动成为环境处理设施。

语言重点是材料、变化、设计意图与澄清。基础支架“This part is… / I used… / Look from…”；进阶可解释观众误读的原因。读课本找一处让自己意外的变化，体验后再比较作者如何把材料和想法说清。观察同伴是否理解，不给创意统一排名。

制作需要：模块与连接点、可取消操作、手部接触动画、展位、短表情与目光动作、对象持久化；完整真实3D与VO待制作。


---

来源：[T02.md](episodes/T02.md)

# T02 · 树屋今晚有声音：还剩下哪一种声音

教材BK08，U8 Section A 3a–3c。树屋、温室门口观察位、西侧工坊。Rowan、Mei、Sam。山谷声源与结局完全原创，教材未揭晓的谜不被补写成课文事实。

## 钩子与空间事实

傍晚沿小路经过树屋，先听见三声轻响，停一下，又有两声。风停时碰撞停，木板偶尔仍吱呀。远处温室门口的Mei见过树屋墙上放大的影子。学生可以先听、先走近或先问；没有强制找齐线索计数。

可解释的碰撞来自Sam挂起的活动装置与一片金属的接触。灯、部件、墙与听音位都有固定位置，灰模阶段需验证视线与投影。另一个短促木响来自平台板件的小幅受力动作；学生未验证前不提前宣布。两种声音的音色、方向和发生条件可区分，配套文字描述给出同等信息。

## 场面与对白

| ID | 角色 | 原创英语 | 表演与动作 |
|---|---|---|---|
| T02.001 | ROWAN | There it is again. | 轻声后停下听，先让学生描述；按需提示两类声音，不抢先揭示谜的结构 |
| T02.002 | LEARNER | I heard tapping. Then something creaked. | 可重听或看声音描述 |
| T02.003 | ROWAN | I heard it near the stairs. I couldn't see what moved. | 指自己的实际听音位 |
| T02.004 | LEARNER | It might be something in the wind. | 猜测不直接变结论 |
| T02.005 | ROWAN | Let's listen from the other side. | 等玩家选择出发 |
| T02.006 | MEI | The shadow looked much larger from my doorway. | 温室观察位；描述经历 |
| T02.007 | LEARNER | Could you show me where you were standing? | 地点可进入或切固定观察位 |
| T02.008 | MEI | Here. I thought it had a long neck. | 对自己的猜想稍觉好笑 |
| T02.009 | LEARNER | From here, I can see the piece that makes that shape. | 仅已看到对应部件时 |
| T02.010 | SAM | I hung a moving piece there this afternoon. I didn't hear it from inside. | 普通疏忽，无阴谋 |
| T02.011 | ROWAN | We know something moved. We haven't explained every sound yet. | 给验证留下空间 |
| T02.012 | LEARNER | Could we hold this part still? | 可点击固定部件，不要求攀爬 |
| T02.013 | SAM | I'll hold it. Tell me what changes. | 操作完成后接触声停止 |
| T02.014 | LEARNER | The tapping stopped. The creak didn't. | 两个声源都观察到时 |
| T02.015 | ROWAN | Keep that part still. I'm going to listen by the stairs. | 对Sam说前句，移到已定义的楼梯地面听音位；Sam继续固定，同一风条件不变 |
| T02.016 | SAM | This piece touches the metal when it turns. I'll move them farther apart. | 请求后才调整；可撤销对照 |
| T02.017 | LEARNER | Could we try it once before you move it? | 保存对照，风条件固定 |
| T02.018 | ROWAN | We can explain the tapping now. What would you check next? | 剩余问题明确 |
| T02.019 | LEARNER | The boards near the stairs. I haven't checked them yet. | 不宣称发现结构风险 |
| T02.020 | NARR | The tapping has stopped. A quieter sound remains. | 仅只解释碰撞的结尾 |

声音观察采用用户可重复触发的教学情境。真实天气仍有独立环境音，但验证回放明确标出固定条件。不会因停留时间短漏掉唯一线索。

| ID | 角色 | 原创英语 | 分支与回接 |
|---|---|---|---|
| T02.021 | LEARNER | I still don't have enough information. | 可在未揭晓时结束本课 |
| T02.022 | ROWAN | Let's mark where we listened. We can return here. | 写观察位置，不写已解谜 |
| T02.023 | SAM | The board makes that sound when I step here. Listen again. | 追加验证后可解释第二声源 |
| T02.024 | LEARNER | So the two sounds had different causes. | 仅两项对照都完成 |
| T02.025 | MEI | Next time, I'll look from more than one place. | 她修订自己的观察方式 |
| T02.026 | SAM | May I borrow your moving piece for this evening? | 前章作者作品适配时，事先请求 |

026被拒绝就用Sam原装置，不能暗中借走。已直接发现声源者不被迫装作不知道，改为向同伴解释如何判断。

Sam被直接问到装置或脚下木板时，如实回答自己知道的事实；不用NPC故意隐瞒拖长谜题。两种声源都已解释时，播放各一次对应动作与声音，由学生向伙伴说明区别后安静收束，不再追问一个新谜。只查明一项和主动保留未知的结尾继续成立。

## 视听与交互重点

从全景靠近时，听见的是同一声源逐渐可辨的音色；无需强制耳机，单声道加方位字幕也可判断。侧灯投下可在换角度后辨认的影子。固定装置时，网格运动、接触事件与声响共同停止，环境风声仍在。Panner式定位不等于真实遮挡；需另外设计墙面后的简化衰减，且不得藏掉必需线索。

色调为已批准山谷的暮蓝与温室暖光，保留路面可读性。无恐怖突响。字幕停留、重听、地面等价观察默认可用。结尾允许听完环境再离开，不自动绕人物旋转展示。

## 收束与语言

三种成立的结束：记录未知、解释碰撞但保留木响、完成两项解释。未知结尾仍归还线索和后续方法；完整结尾留给学生“同一件熟悉物体为何会被看成别的东西”的余味，不再追加虚假幽灵。

重点是区分观察、听说与推断。基础“I heard… / It might be… / Let's check…”；进阶解释证据怎样改变确信程度。重读教材各人物判断，讨论谁知道什么，而非只圈出情态动词。

保存观察位、已验证声源与学生解释。跨章回忆按事实生成；安静时段只在有使用者需求时展开，不强迫每场谜题写环保宣言。


---

来源：[T03.md](episodes/T03.md)

# T03 · 带朋友游园：地图上没写的那一站

教材BK03，U3 Section A 3a–3b；起点为南侧入口，经花圃、工坊、温室，可到东侧主桥。Noor、Amina、玩家。双人信息差是主要玩法；单人使用明确偏好卡和预写回应。

## 钩子与双方愿望

Noor拿着一张折错方向的小地图，第一眼说“原来背面是空的”。他想看会动的作品，也想找地方坐一会儿；向导知道地点和旧时段表，却不知道他想看什么。Amina的新活动告示尚未被抄到地图上。不存在唯一最佳路线。

拟定课堂情境：初始时刻10:40，短装置演示11:00开始，接待桌可随时停留，Noor计划12:00离开；这些是虚构时间，世界时钟按教学阶段推进，不因学生读得慢错过。双人模式可以换成另一组自定偏好。任务中的时间条件必须先告知双方，不能事后制造损失。

## 主线与支路对白

| ID | 角色 | 原创英语 | 动作、条件与表演 |
|---|---|---|---|
| T03.001 | NOOR | I turned the map over. That didn't help. | 把空白背面翻回来，轻松 |
| T03.002 | LEARNER | What would you like to see first? | 先问愿望，无需先报全部地点 |
| T03.003 | NOOR | Something people have made. Does anything move? | 看向实际工坊方向 |
| T03.004 | LEARNER | There are pieces in the workshop. Would you like to start there? | 只有当前确有展示时用 |
| T03.005 | NOOR | Yes. Could we sit somewhere afterwards? | 提出第二个真实条件 |
| T03.006 | LEARNER | We can sit by the flower ring. I'll check when the demonstration starts. | 自己的信息也不完整 |
| T03.007 | AMINA | The demonstration starts at eleven now. The old card says half past ten. | 给明确信息，不设语言陷阱 |
| T03.008 | LEARNER | So we have time to look around before it starts. | 当前早于11:00且所选路线可按约到达时 |
| T03.009 | NOOR | When you say “over there”, which path do you mean? | 由不清楚指路的分支触发 |
| T03.010 | LEARNER | The path beside the greenhouse. I'll show you the turning. | 修复信息，不弹纠错框 |
| T03.011 | NOOR | May I take a picture of this piece? | 作品前停下；需作者许可 |
| T03.012 | LEARNER | Let's check the label and ask the person who made it. | 对象无许可时不自动拍摄 |
| T03.013 | NOOR | I'd like to hear why they made it, too. | 兴趣由现场物件改变 |
| T03.014 | NOOR | Is this the same place as the photograph? | 走到桥边并看过记录后 |
| T03.015 | LEARNER | Yes. The water looks different today. | 只描述可见现象 |
| T03.016 | NOOR | Do you want to look now, or come back after the display? | 真正可选；不变成任务发布者 |
| T03.017 | LEARNER | Let's come back. I'll mark the place. | 保存回访而非已解决 |
| T03.018 | NOOR | Okay. But I do want to come back. | 仅约定稍后回访时；看一眼桥下再同行，保留自己的主见 |
| T03.019 | AMINA | What would you recommend to the next visitors? | 实际交换推荐卡 |
| T03.020 | LEARNER | Start here if you like making things. Leave time to stop and talk. | 示例允许不同意见 |
| T03.021 | NOOR | My favourite part wasn't on the first plan. | 仅路线实际变更时 |
| T03.022 | NARR | The map has a new mark. It is a place to return to. | 仅已记录桥边回访 |

无展品状态用“Sam is working in the workshop. We could ask what he's making.”替代004，固定台词ID为T03.023。若无作者可询问，T03.024由Noor说“I can leave a question for the maker.”，不自动授权。若当场调查，T03.025由玩家说“Let's look now. We can change our plan.”，进入[溪流连续场面](episodes/T03-stream.md)。未经过桥边的路线在离开前可看到同一记录册中的桥位照片与Rowan的观察邀请；不是凭空知道水色。课堂主线在后续一课回到这个地点。

## 走线与3D交互

从入口可看见温室顶和树屋，工坊的实际位置靠左。路径转弯前看见可辨地标；伙伴在分叉处停下等待，不以追赶倒计时制造交流压力。可点地标确认、走一小段带路，或在投屏时让另一组依据说明指图。移动、相机与完整地图均可使用。

推荐卡包含真正选过的地点、一个理由与必要时间；下一组照着找后能留下一个问题。需要删改路线时，已答应的安排会被明确讨论。分支并不要求看完所有NPC，已经知道的开放时间不会强迫再次问。

镜头保持同行的距离。经过展品时允许短暂停留看同伴的观察动作；音乐不在每到一个地点播放奖励段。脚步根据木、石、土改变，温室反射与地图里的建筑一致。所有作品按当前许可及位置出现。

## 结尾与教学

结尾可以是完成约定、共同改道或约好下次；离开时保留一个具体共同记忆。Noor可以对同一展品有不同喜好，不根据英语流利度变成更热情的朋友。

主要语言是问偏好、核实信息、指路和澄清。可用“Do you mean…? / Would you rather…? / If we…”。课堂先给双方不同的信息，再让交流改变路线；交流后选一个确实造成误解的句子共同改写。教材游园对话用于重看人物怎样回应对方，不要求背完才允许出发。


---

来源：[T03-stream.md](episodes/T03-stream.md)

# T03内的溪流连续场面 · 一件好事以后，水还没有变清

这是C1环保探究在十二章中的完整主线段，不新增第十三个独立案例。承接T03当场驻足或之后回访，连接T01工坊、T11公共说明与T12现实回看。英语主题以U13为主，推断与问询调用已学表达。原有C1-E01至E06、ENV01/ENV02及v3机制继续适用；新事件与对白为原创。

## 第一场：两种问题挤在一张照片里

主桥边，瓶子被两块石头夹住，东岸可见褐色水流。玩家清走可见垃圾后，瓶子消失，水色仍在。可以先观察再清理，也能先动手；两条路径汇合时如实保留次序。Rowan不会说“你做错了”。

| ID | 角色 | 原创英语 | 表演与触发 |
|---|---|---|---|
| T03S.001 | NOOR | That bottle is gone. The water still looks brown. | 只有实际清理后 |
| T03S.002 | ROWAN | We changed one thing. Let's find out what else is happening. | 看水路而非面对玩家讲课 |
| T03S.003 | LEARNER | Was it like this before the rain? | 自然追问 |
| T03S.004 | ROWAN | This photo was taken here before the rain. We can compare them. | 提供机位和日期 |
| T03S.005 | LEARNER | The colour is different. Does that tell us what is in the water? | 基础可拆成两句 |
| T03S.006 | ROWAN | Not by itself. We need more information. | 不以外观判饮用或健康 |

## 第二场：Mei知道的，与她不知道的

从桥沿东岸走向裸土花床，可以看见浅沟；从这里到温室能找到Mei。路线保持上游下游关系。Mei被直接归责时会澄清，但仍愿意合作；玩家不用先道歉才解锁证据。

| ID | 角色 | 原创英语 | 表演与触发 |
|---|---|---|---|
| T03S.007 | MEI | We worked on that bed before the rain. I hadn't finished covering the soil. | 先放下手套，给具体时间 |
| T03S.008 | LEARNER | Did you see water running from it? | 区分经历和猜测 |
| T03S.009 | MEI | I saw water in the channel afterwards. I didn't see the whole storm. | 承认观察范围 |
| T03S.010 | LEARNER | Then it may be one source. We should look upstream too. | 不宣布全部归因 |
| T03S.011 | MEI | I'll show you where the channel begins. | 愿意协助，非被审讯后认错 |
| T03S.012 | MEI | I can tell you what I saw. I can't explain everything from this one place. | 直接归责的替代回应，回到008 |
| T03S.013 | ROWAN | There is no entry for Wednesday. I wasn't here to make one. | 日志有缺口时 |
| T03S.014 | LEARNER | So we don't know what it looked like that day. | 空白不变成没问题 |

学生可按不同次序看记录、找水路、询问；已经获得的信息能被同伴分享。照片并列比较时保留日期、机位和条件。证据板仅是可选整理工具，不要求每组拖完固定卡片。

## 第三场：把一种想法放到会经过的水路旁

在教学模拟中，学生选覆盖、建立植被带等候选措施并说明位置理由。方案在相同雨量情境、时长和初始条件下比较。已建立植被的作用明确显示为时间推进后的模拟，不把刚放下的幼苗当成熟植被。这里只显示可解释的移动路径与定性差异，不生成真实净化率。

| ID | 角色 | 原创英语 | 表演与触发 |
|---|---|---|---|
| T03S.015 | SAM | Show me where you plan to put it, and where the water flows. | 指向位置，不替学生摆 |
| T03S.016 | LEARNER | It would pass here. I'd like to try the cover on this area. | 示例按实际所选方案替换 |
| T03S.017 | MEI | What will you keep the same when you compare the two runs? | 询问控制条件 |
| T03S.018 | LEARNER | The rain setting and the starting conditions. | 条件面板提供短语支持 |
| T03S.019 | ROWAN | This is a model result. Let's describe exactly what changed. | 运行结束后，给比较空间 |
| T03S.020 | LEARNER | Less soil moved along this path in the second run. | 仅模型确实出现该结果时 |
| T03S.021 | LEARNER | This position didn't change the result. I want to move it. | 无效位置的正常修订分支 |
| T03S.022 | MEI | All right. Show me where. | 看向玩家所指模型位置，等其移动措施；不替玩家修正，不触发现实实施 |

可撤销、保存两版、重看相同条件；方案未改善时也能结束为“已试验，需继续”，不能选择结束就自动恢复清水。模型试验只保存试验快照，不直接修改当前山谷。

采用方案需另选“在山谷实施”，核对用途与位置，并与Mei确认。之后进入当前东岸的游戏操作：搬运已核对材料、放置、调整、确认完成，才写入世界状态。模拟中已建立植被的效果不能转成现场新苗的即时效果；盖土完成也不宣布整条溪流变清。可只保存提案，稍后实施。实施与复查是两个节点。

| ID | 角色 | 原创英语 | 补充入口与实施分支 |
|---|---|---|---|
| T03S.029 | NOOR | There's a bottle between those stones. The water looks brown too. | 未清理时替代001 |
| T03S.030 | ROWAN | Let's look at the photograph first. We can remove the litter afterwards. | 未清理入口替代002，再接003 |
| T03S.031 | MEI | Would you like to keep this as a proposal, or put the agreed change in place? | 方案用途核对后才出现 |
| T03S.032 | LEARNER | Let's put it in place, then make another observation after rain. | 玩家选择实施，进入搬运与放置 |
| T03S.033 | SAM | The materials are ready. Show me the position we agreed on. | 当前世界操作，不在模型快照内 |
| T03S.034 | LEARNER | It's in place. We still need to see what happens later. | 仅操作完成后；未完成则保存进度 |

## 第四场：准备怎样告诉来访者

| ID | 角色 | 原创英语 | 表演与触发 |
|---|---|---|---|
| T03S.023 | NOOR | Shall we say we've cleaned the whole stream? | 明显想简化影片，语气认真 |
| T03S.024 | LEARNER | We removed the litter and tested a plan. We still need to check what happens later. | 根据实际完成项裁剪 |
| T03S.025 | NOOR | That's longer. But it tells people what we really did. | 接受修改，不忽然变专家 |
| T03S.026 | ROWAN | Choose a place we can find again. We'll keep the next record there. | 约定后续条件与日期 |
| T03S.027 | LEARNER | Could we look for a similar problem at school? | 现实迁移邀请 |
| T03S.028 | MEI | Start with something you can observe, and ask the people who care for it. | 对象具体、可执行 |

结尾回到同一桥位。改变过的物件清楚可见，尚未证明的事不被画面替学生宣布。Noor在拍摄框边留出记录日期的位置，给下一次观察留位置。声景恢复普通流水与脚步，不以满屏开花奖励“生态治愈”。

课堂可分两课：首次观察与访查，随后比较、操作和解释；每课均可在明确记录点收束。学生产出可以是口头说明、三幅带说明的画面或短片，至少包含一个判断、一条相关证据、一个限制和下一步。形式按学生选择，不把同一报告格式设为通关条件。

保存：已清理对象、访查范围、所选措施与版本、模型条件、实际结果、未解决问题、回访约定。T11只能使用这些真实状态；T12区分完成、计划和现实回访记录。


---

来源：[T04.md](episodes/T04.md)

# T04 · 一件小意外的新用途：先别把它摆正

BK06，U6 Section A 3a–3c；工坊到温室展台。Sam、Iris、玩家。原教材的发现叙事提供讲述事件顺序的起点，山谷光影发明为原创，不冒称历史或考古结论。

## 故事与操作

Sam整理展台时，把有开口的形状片放错了支架。转盘经过光源，墙上出现一个会开合的形状。Sam伸手要摆正，Iris先说等一下。学生可以看完一轮，再决定要不要重现。第一次惊喜来自真实部件与光路；不靠答题解锁隐藏成品。

玩家可调整盘的角度、形状片前后与灯的方向，在受限有效范围内制造可解释的不同效果。伙伴只拿到学生给的说明，用自己的观察复现；作者由此发现“像这样”没有说清什么。学生可以做稳定展示，也可保留短暂、难以重复的变化并说明条件。

| ID | 角色 | 原创英语 | 调度与语气 |
|---|---|---|---|
| T04.001 | SAM | That's in the wrong place. I'll move it. | 看支架，手还未触物 |
| T04.002 | IRIS | Wait. Look at the wall. | 兴奋但不尖叫 |
| T04.003 | LEARNER | Can you turn it once more? | 重复发生是学生愿望 |
| T04.004 | SAM | Slowly, or at the same speed? | 操作真的区分速度 |
| T04.005 | LEARNER | Slowly. I want to see when the shape changes. | 光影同步旋转 |
| T04.006 | IRIS | It looked closed, and then it opened. | 描述可见轮廓，不指定艺术解释 |
| T04.007 | SAM | I was looking at the stand. I missed that. | 承认漏看，无训诫 |
| T04.008 | LEARNER | What happens if we move this piece closer? | 提出可执行变化 |
| T04.009 | IRIS | Let's keep the lamp where it is for this try. | 只改一个条件便于说明 |
| T04.010 | SAM | Could you tell me how to make your version? | 把操作者位置让出 |
| T04.011 | LEARNER | Put this piece in front of the wheel. Then turn it halfway. | 与当前构型相符的示例 |
| T04.012 | SAM | In front of it from which side? | 合理澄清，不故意装笨 |
| T04.013 | LEARNER | From the lamp's side. The marked edge faces the wall. | 补参照点 |
| T04.014 | SAM | Now I can repeat it. What will you call it? | Sam按学生说明实际完成复现时 |
| T04.015 | LEARNER | Not yet. Let me watch it once more. | 可主动重看一次，也可跳过并保持未命名；学生不必照说 |
| T04.016 | SAM | We can leave a space on the card. | 实际空标题卡 |
| T04.017 | IRIS | Could we show the first attempt beside this one? | 尊重过程，不只展成功版 |
| T04.018 | LEARNER | Yes. People can see what we changed. | 作者同意才公开 |
| T04.019 | NARR | The pieces are ordinary again when the lamp is off. | 关灯后可选叙述 |
| T04.020 | SAM | Want to switch it on once more before we go? | 轻松余韵，由学生决定 |

复现未成时，T04.021 Iris：“I moved two things. Shall we go back to the last position?”；作者同意则回到保存的变换，T04.022玩家：“Let's change one thing this time.”。学生想保留偶然版时，T04.023 Sam：“Then describe when it happens. It doesn't have to stay the same.”。拒绝展示时，T04.024 Iris：“We can keep the recording in your own notebook.”。所有分支都有明确保存或不保存结果。

## 画面、声音与结尾

近景表现轴心转动、薄片边缘和木支架接触，光斑变化遵循当前几何。首版限定形状片与折叠遮片；彩色透射投影需专门验证受控投影方案，不能假定通用透明材质自动产生正确彩色阴影。未验证前先以真实遮挡轮廓完成核心玩法。

Sam移动前的衣袖声突然停住，留给第一次观察一点空隙。转盘有短摩擦声，旋转停止后没有循环机械音。开放日展示说明可以是过程照片加两句英语，学生选择是否保留失败尝试。结尾用关灯后的普通部件与再次开灯的邀请，留下“用途是否藏在观看方式里”的思考，不让旁白说出答案。

重点语言是顺序、位置和过去事件，基础“First… Then… / It happened when…”；进阶比较偶然发现和有意调整。伙伴能否复现是语言是否清楚的证据。保存部件变换、操作顺序、展示许可；可供T07布景或T11拍摄，未制作时有Sam明确署名的公共样件。材料和光影效果不被解释成净水、节能实验。


---

来源：[T05.md](episodes/T05.md)

# T05 · 让窗上的图案讲故事：展开以后多了一条路

BK05，U5 Section B 2a–2b；工坊与主温室的一扇固定窗。Mei、Iris、玩家。传统艺术介绍与学生原创图案分清，图案寓意由作者说明。

## 开场与转折

Mei拿着旧窗位照片，说空窗可以放一幅整齐的花纹。Iris把折好的纸递给玩家，只能看见局部切口。学生先预测展开后会是什么，再逐层展开；两个原本想相连的形状之间出现一条空白。Mei以为需要补上，作者却可能喜欢那条像小路的空白。

冲突来自是否需要修正，而非把“不完美”统一说成更美。玩家可以补、重剪、旋转或保留；要向另一个人说清选择。最后挂到同一窗位，看见图案与地面影子的关系。

| ID | 角色 | 原创英语 | 调度与表演 |
|---|---|---|---|
| T05.001 | MEI | This window is still empty. What would you put here? | 看实际窗位，再问学生 |
| T05.002 | IRIS | Don't open it yet. What do you think this cut will become? | 递折叠纸，先给观察 |
| T05.003 | LEARNER | It might become two leaves. | 可自由预测 |
| T05.004 | IRIS | Shall we find out? | 等学生展开，无自动抢镜 |
| T05.005 | MEI | There's a gap between them. Would you like to change it? | 询问而非批改 |
| T05.006 | LEARNER | I like the gap. It looks like a path to me. | 仅当前模板有该空白 |
| T05.007 | IRIS | I saw two separate shapes. Now I can see your path. | 意义来自作者解释 |
| T05.008 | MEI | I was about to cover that gap. Let me look from here. | 放下尚未使用的补片材料，换到作者所指观察位，不擅自盖住原作 |
| T05.009 | LEARNER | Could we hold it against the window first? | 先试放再确认 |
| T05.010 | IRIS | A little higher? Or do you want the shadow on this part of the floor? | 两种真实位置 |
| T05.011 | LEARNER | Lower, please. I want people to notice the space in the middle. | 选择依个人表达 |
| T05.012 | MEI | What should the visitors know about it? | 请求展签内容 |
| T05.013 | LEARNER | It's made of paper. I folded it before I cut the shapes. | 基础材料过程 |
| T05.014 | IRIS | And what does that space mean to you? | 留给学生，不预置道德 |
| T05.015 | LEARNER | It could be a way for someone to come in. | 一种原创寓意示例 |
| T05.016 | MEI | Then I'll leave that space clear. | 也在实际摆台中让出窗前区域 |
| T05.017 | NARR | The paper stays at the window. Its shadow reaches across the floor. | 阴影实际存在时 |
| T05.018 | IRIS | We should look at it again at a different time. | 为T06留自然邀请 |

修改分支T05.019玩家：“I want the two sides to meet.”；T05.020 Iris：“Let's unfold the last version before we cut again.”，进入可撤销重做。抽象模板分支T05.021 Mei：“Tell me which part matters most to you.”，替代关于空白的005–008。暂不展示T05.022 Mei：“We can keep the window clear until you're ready.”。不公开寓意T05.023玩家：“I'd like to share the pattern, but keep the meaning private.”；T05.024 Iris：“Then we'll describe how you made it.”。

## 操作与3D制作

展开前让学生指认一个实际切口并预测它展开后的位置；展开后可以沿原折痕折回一次，核对预测。这个动作可略过，不以预测正确才能打开纸样。先让学生发现形状，再出现“两片叶子”或“小路”的个人读法，不能在展开动画前由旁白抢先解释惊喜。

首版明确两种折法、有限切口形状及位置范围，可连续调整切口，不声称支持任意自由切割。展开是同一纸样几何变化，切口和缺口应当守恒；不能点击后换成预制成品图片。需单独验证拓扑、折痕和展开接合。底面、纸厚、轻微纤维、边缘阴影共同表现材质。

放窗后投影与灯/天光一致；夜间回访若需强投影，给出真实灯位，而非假定月光总能投出亮图案。关键轮廓在低画质中仍相同。纸声短轻，展开后留观察空间；Mei的改变通过放下“修正”用的材料和重新看图案体现。

## 收束与教学

可以保留空白、改得连贯或另做版本，都以作者能解释选择和别人能理解为收束。结尾保留“同一图案在不同光线下怎样被理解”的回访空间，不宣称有唯一正确寓意。

语言重点材料、过程、意义。基础“It's made of… / I folded… / It means…to me”；进阶解释为何保留某处。重读教材时区分文本写出的传统意义与自己另赋的意义。保存纸样、窗位、标题和公开范围，T06原样回访，T12只收作者选择公开或自留的版本。


---

来源：[T06.md](episodes/T06.md)

# T06 · 月下，有一封没送出的信

BK02，U2 Section A 3a；后续节庆日期，温室与花圃。Amina、Noor、玩家。教材本轮只取得故事前段，完整神话重述与课文演出台词暂不列为已校对材料；本章完整山谷故事为原创，可在教师实际读书后使用。

## 钩子：写着收件人的空信封

晚间桌上有一封Amina写了一半的寄语，收件人是“下一位来访者”。窗上仍挂着白天的纸样，若玩家未做T05，则明确为公共作品。Amina布置了一个空座位，想替尚未到来的人准备；她却不知道该替对方写什么。学生可以为真实或虚构的人、未来自己、后来者写一句，也可以先只安排一个物件。

不以失去亲人作为默认背景，不强迫私人披露。月下的情绪可以是期待、想念、好奇或轻松。故事冲突是想说的未必需要立刻送出，Amina要学会把“帮忙送达”收回来。

| ID | 角色 | 原创英语 | 调度与语气 |
|---|---|---|---|
| T06.001 | AMINA | I've written who it's for. I haven't written what to say. | 看自己的卡，自嘲而非煽情 |
| T06.002 | NOOR | Do you know who will sit here? | 看空座位 |
| T06.003 | AMINA | Not yet. That's the difficult part. | 允许不知道 |
| T06.004 | LEARNER | Could it be for someone who hasn't visited before? | 一种可选受众 |
| T06.005 | AMINA | Yes. What would help them feel welcome? | 由受众产生内容 |
| T06.006 | NOOR | I'd tell them where they can sit for a while. | 表达自己的具体偏好；未共同游园也成立，不保证来客不会错过任何事情 |
| T06.007 | LEARNER | I might write to my future self instead. | 可切换受众 |
| T06.008 | AMINA | Then you can decide whether anyone else reads it. | 具体交还范围 |
| T06.009 | NOOR | Would you like me to read it, or just help arrange the table? | 许可前不读 |
| T06.010 | LEARNER | Help with the table, please. I'll keep the words private. | 私人分支 |
| T06.011 | AMINA | I almost put it with the cards to send. I'll leave it here. | 收回手，不大篇道歉 |
| T06.012 | LEARNER | It isn't ready to be sent. | 未完成也有意义 |
| T06.013 | AMINA | It can wait. | 一句，留停顿 |
| T06.014 | NOOR | The pattern looks different from this seat. | 实际换位观察 |
| T06.015 | LEARNER | Can we move the lamp a little? | 限制到既定灯位可调角度 |
| T06.016 | AMINA | Let's keep the path lit while we try. | 接入C3具体使用需求 |
| T06.017 | NOOR | Someone is still putting the chairs away. | 真实工作人员尚在场时 |
| T06.018 | LEARNER | We'll leave this light on until they've finished. | 可选安排，不等于全球最优 |
| T06.019 | AMINA | I'll check with them before we close. | 明确后续承担者 |
| T06.020 | NARR | One envelope stays on the table, waiting for its writer. | 仅选择保留时 |

分享分支T06.021玩家：“I'd like you to read this part.”；T06.022 Noor：“Would you like a reply, or would you rather I just listen?”。送达分支T06.023 Amina：“Who should receive it, and when?”，保存意图；不调用现实消息发送工具。空卡分支T06.024玩家：“I don't have the words yet.”；T06.025 Amina：“You can keep the card.”。没有写作也可通过为虚构角色安排座位并解释选择参与，课堂后再补语言。

## 画面与晚间照料

月光是整体天光，窗饰投影由有来历的局部灯按实际方向形成。纸张与信封有手触变形、边缘和封口状态，寄语使用清楚DOM文字或可读贴面，不用模糊纹理充数。近景手部操作可替代真实键入；整段文字不会未经选择展示在大屏。

声景是较远谈话、杯子轻触和夜间环境；不默认催泪配乐。Amina的忙碌在013停一下，远处仍有人收椅子，世界继续。晚间照明沿C3规则按实际使用者安排，不能全部关灯就取得绿色评价。

## 结尾与语言

三种收束：交给明确的故事内受众、选择日期保存、暂留空白。没有强行送达后的万能感谢，也不承诺未来者必然回复。余韵来自尚未写完的关系，同时当前公开范围与后续动作清楚。

核心是受众、心愿、请求和回应，支架“I hope… / I'd like…to… / Would you like me to…?”。文学活动可用课本已读段落讨论表达，学生的替代视角须标为原创。T12只取被选择的内容；私人文字不得自动成为公开毕业影片。


---

来源：[T07.md](episodes/T07.md)

# T07 · 给一段音乐一个场景：我们听见的是同一段吗

BK09，U9 Section B 2a–2b；花圃的小型布景点，可在树屋档案点回看。Iris、Noor、玩家。新增配乐须原创委托或取得可用于课件的许可，不能冒称教材名曲录音。

## 钩子与乐段委托说明

同一段短音乐结束，Iris把椅子朝向远山，Noor却把椅子转向一件很小的作品。两人都觉得音乐适合自己的画面。学生先听，再问为什么；屏幕不先标悲伤或快乐。

待创作乐段约25–35秒，包含可辨的短句、一次停顿和一个有变化的重复，保持多义。具体旋律、音色与速度由作曲试听确定；本稿不是已存在的音频。文字声音描述记声部、先后和停顿，不把“令人伤心”预设为答案。无声模式仍能根据结构进行叙事安排。

| ID | 角色 | 原创英语 | 调度与表演 |
|---|---|---|---|
| T07.001 | IRIS | I thought someone was waiting. | 看向远山，像说自己的想象 |
| T07.002 | NOOR | Really? I thought someone was about to arrive. | 好奇，不嘲笑 |
| T07.003 | LEARNER | Which part made you think that? | 需要重听具体段落 |
| T07.004 | IRIS | The pause. I kept waiting for the next note. | 指音乐中实际停顿；录音和最终乐段须对应，属于个人体验 |
| T07.005 | NOOR | I noticed the phrase that came back. I expected something new after it. | 不宣布谁对 |
| T07.006 | LEARNER | Could we hear that part again? | 重听不推进故事时间 |
| T07.007 | IRIS | Let's each make one small scene. | 只改当前可控布景范围 |
| T07.008 | NOOR | Can I borrow that piece for mine? | 引用实际获许可作品 |
| T07.009 | LEARNER | You can use it here, but please leave the label with it. | 作者选择的示例 |
| T07.010 | IRIS | I can't tell who the empty chair is for. | 描述不知道之处 |
| T07.011 | LEARNER | That's the part I want the visitor to imagine. | 留白是有意选择 |
| T07.012 | NOOR | Would a different light change what we expect? | 实际尝试布景灯预设 |
| T07.013 | LEARNER | It might. Let's compare them before we choose. | 控制同一镜头比较 |
| T07.014 | IRIS | I still like mine better. Can we listen to yours again? | 保留偏好，提供一次可选重听；可略过，不据此声称理解任意创作 |
| T07.015 | NOOR | We could show both, without telling people which to choose. | 公开先征求同意 |
| T07.016 | LEARNER | Let's ask what they noticed first. | 访客有真实表达空间 |
| T07.017 | NARR | The music ends. The two scenes remain. | 无总结道理 |
| T07.018 | IRIS | I want to hear it once more tomorrow. | 指向再理解，而非新谜底 |

不愿透露个人情绪时T07.019玩家：“I'd rather tell a story about an imaginary person.”，T07.020 Iris：“Who is in your scene?”。只做一景时T07.021 Noor：“We can use this scene to compare our ideas.”。无可借作品时T07.022 Noor：“I'll use the objects from the shared box.”，不冒称学生创作。作者收回许可时，公共物件替代且原物归位。

## 交互艺术与表演

布景操作限制在同一小型展示区域：椅子、少量物件、框景和可调灯位。不能为了情绪把整座山谷即时变成另一季节。玩家可微调相机，预览同音乐下两种布置；低动态模式用静态镜头顺序比较。

音乐开始时人物停止说话，听完再回应；讨论与重听互斥，字幕及音轨控制可随时使用。结尾让原声自然止住，保留脚步和环境，不自动叠“感动”音乐。Iris与Noor的不同通过摆椅子、看向的位置和说话重点体现。

## 教学与后续

重点描述偏好与依据，可用“The part that… / It reminds me of… / I understand why…”。先记录自己的解释，再读教材相关语篇中的经历与音乐描述，允许修改或保留，说明变化依据。不能把听后感受当心理测验。

保存布景版本、个人说明、所用音乐许可与作品借展范围。T11可用经同意的场景作影片；开放日双景展出可成立，私人版本也有完整收束。余韵是同一声音被不同人带走不同理解，而非未交代清楚的剧情。


---

来源：[T08.md](episodes/T08.md)

# T08 · 出错以后，下一句是什么：排练还没有结束

BK11，U11 Section B 2a–2e；花圃展示台到工坊侧边。Iris、Noor、Sam、Amina与玩家。课本人物关系用于阅读与比较，本章失误事件为原创。重点是一场能接话的交流，不设情商或好感数值。

## 人物在此刻知道什么

Iris负责展台装置的启动，误把Sam抬手接物当作提示，轮廓投影早了一拍；她看见观众转头，误以为都在责怪自己。Sam知道新提示尚未明确，只觉得需要再排一次。Noor在收设备，没有看见Iris离开的最初几秒。Amina想继续安排工作，容易替她说“等一会就好了”。玩家必须听到Iris的顾虑后，才能知道她并不只是想修好装置。

使用Sam的公共展示装置，不损坏学生珍视的作品。启动失误不由玩家英语错误触发。首次只给观众听到一声短机械起动和几秒停顿，不用哄笑或失败音效。

## 场面与对白

| ID | 角色 | 原创英语 | 听者、动作与情绪转折 |
|---|---|---|---|
| T08.001 | SAM | Hold on. We haven't agreed on the signal. | 朝全组说明，非冲Iris责骂 |
| T08.002 | IRIS | I thought that was it. | 看Sam的手，压住后半句 |
| T08.003 | NOOR | Shall I stop the recording? | 询问当事人，停止未经允许的录制 |
| T08.004 | IRIS | Yes, please. I need a minute. | 自己表达暂停，走到工坊边 |
| T08.005 | AMINA | I'll stay with the others. Iris went towards the workshop. | Amina确实看见Iris离开，自己留下整理排练；由玩家决定是否陪伴 |
| T08.006 | LEARNER | Would you like me to stay, or would you prefer some time alone? | 停在合适距离，不强制坐旁边 |
| T08.007 | IRIS | You can stay. I don't want to go back yet. | 默认愿意陪伴分支 |
| T08.008 | LEARNER | What are you worried about? | 可先陪伴再问，无倒计时 |
| T08.009 | IRIS | That they'll let me stay, but never ask me to do anything again. | 重点落在“ask me”，不哭喊 |
| T08.010 | LEARNER | You're worried they won't trust you with it next time. | 复述具体担心 |
| T08.011 | IRIS | Yes. I kept thinking I should have known. | 抬眼确认被听懂，再低头 |
| T08.012 | LEARNER | Do you want to hear what Sam said, or talk to him yourself? | 不替她决定 |
| T08.013 | IRIS | Could you come with me? I want to ask him. | 愿望从逃开变成提出条件 |
| T08.014 | SAM | We hadn't agreed on a clear signal. I should have checked that with you. | 承担具体责任，不包揽所有 |
| T08.015 | IRIS | I should have checked before I started. I can do that next time. | 自主反思，不被逼认错 |
| T08.016 | LEARNER | Can we try a signal that everyone can see? | 可讨论动作、短口令 |
| T08.017 | NOOR | I'll put the camera down for the first try. | 按当事人需要行动 |
| T08.018 | IRIS | Just us this time. Then I'll decide about the display. | 不承诺立即回公开舞台 |
| T08.019 | SAM | All right. You tell us when you're ready. | 等实际准备，不启动倒数 |
| T08.020 | IRIS | Ready. Let's check the signal once. | 比开场稳，但还未灿烂大笑 |
| T08.021 | NARR | They try again with fewer people watching. | 条件允许才播；结果不保证成功 |

## 三条需要认真写完的分支

**她想独处。** T08.022 Iris：“A little time alone, please.”；T08.023玩家：“I'll be by the workbench if you want me.”。玩家回到工坊另一侧，可以和组员调整装置；稍后由她自己靠近或在下一课留下约谈，不以反复点击逼回。读字幕暂停不算玩家沉默。

**玩家先说没关系。** T08.024玩家：“It's all right. Everyone makes mistakes.”；T08.025 Iris：“I know. I'm worried about what happens next.”。继续给出010或让玩家自己回应；不弹“安慰错误”。这句话可能真诚，但还没回应本次顾虑。

**暂不参加公开展示。** T08.026 Iris：“I'd like to help with the setup, but I don't want to be on stage today.”；T08.027 Amina：“Then let's decide which part you'd like to do.”。她可选择幕后分工，也可本次休息；下一章不突然默认她已经公开演出成功。

独处后本课可结束为“尊重暂停，约定地点”。再次交流由玩家选择回访或教师推进到下一个教学时段触发，不用真实等待分钟数；Iris先在可见距离用T08.028询问：“Could we talk now?”。玩家可现在或稍后回应。没有回访时保持暂停状态，不能后台自动判定她已重返公开展示。

## 近景与声音导演

镜头从公共排练中景过渡到工坊侧边，先交代两人距离；无需贴脸拍难过。Iris用拇指压住草图角，009说到担心被排除时才看玩家。选择“坐在附近”或“先离开”都是可见动作，不要求说出010才能继续；真人对话中得到具体回应后，她的手可放松一点，单人版则仅在玩家主动选择陪伴回应时播放相应预写反应，不用关键词判情绪理解。014由Sam对她说，不向观众发布道德结论。关键帧、目光、呼吸、口型共同表现，不能单用“伤心表情”滑杆。

远处仍有收椅子的声音，但对话清楚。无煽情弦乐贯穿；在她愿意回去时也不突发昂扬主题。演员先连场试读，009、025、018各录不同强度版本，选择能听清且不夸饰的一版。对话可中断、暂停与继续，重新播放不再触发人物离场。

## 结束、教学与持久状态

结局可为共同试排、约好再谈或换幕后角色。每条都交代当下安排，关系仍有未来空间。下一次见面的一句具体邀请比“你是最好的朋友”更有分量。

角色卡写知道的事实、误解、愿望和不愿做的事。真人对话可以用自己的话；单人预写分支允许写第三种回应供同伴/教师讨论，不假装NPC理解任意自由文字。读教材后比较人物如何理解团队，需定位文字依据；不要求相同道德总结。

保存Iris当前参与选择、共同确认的提示、摄影许可和约谈状态。T10不能假定她已恢复全程表演；T11只可使用获准片段，失误录像不能成为取笑素材。主要语言为具体复述、询问意愿、承担部分责任与商量下一步。


---

来源：[T09.md](episodes/T09.md)

# T09 · 第一次做客，也可以问：杯子为什么只倒了一点

BK10，U10 Section B 2a–2b；温室临时接待桌。Amina、Noor、Mei、玩家。故事中的安排属于这一次茶会，不被说成任何国家的统一礼仪。

## 钩子与愿望

Amina准备给每人倒满，Noor轻轻把杯子移近自己，说先一点就好。她以为他不喜欢，开始热情提供更多选择。Noor其实想先尝一口，也怕坐错席位。学生可以扮主人或客人，双方各有一张只说明自身情况的卡；没有“猜外国人习惯”的配对题。

桌上座位、杯子、份量与展品问答都服务真实接待。临时餐食可接入C7：事先了解偏好、少量再添、记录实际剩余而不道德评判。游戏物件为模拟，不让现实学生必须吃完。

| ID | 角色 | 原创英语 | 调度与意图 |
|---|---|---|---|
| T09.001 | AMINA | I'll fill it up for you. | 手持壶停在倒前 |
| T09.002 | NOOR | Just a little to start with, please. | 礼貌但清楚，不羞怯模板 |
| T09.003 | AMINA | Would you prefer something else? | 热心，却误读原因 |
| T09.004 | NOOR | I'd like to try this first. I can ask for more. | 澄清需求 |
| T09.005 | LEARNER | Could we let people choose how much to take? | 调整具体服务安排 |
| T09.006 | AMINA | Of course. Just a little, then. | 按002已明确的份量实际倒入，不重新询问、不倒满后假装少量 |
| T09.007 | NOOR | Is this seat taken? | 真实空位信息在主人卡 |
| T09.008 | LEARNER | This one is free. Would you like to sit near the window? | 按当前座位状态 |
| T09.009 | NOOR | Could I sit where I can see the display? | 偏好改变座位选择 |
| T09.010 | MEI | I'll move this pot so it doesn't block your view. | 挪的是可移盆栽，不改固定地形 |
| T09.011 | NOOR | Who made the piece on that table? | 引用实际展示物 |
| T09.012 | LEARNER | The label tells us. We can ask about the idea behind it. | 无作品时改指公共展项 |
| T09.013 | AMINA | Is there anything we should explain more clearly? | 接受来客反馈 |
| T09.014 | NOOR | I wasn't sure whether I could help myself. | 不是批评某国文化 |
| T09.015 | LEARNER | We could put a short note beside the tray. | 语言产出有真实受众 |
| T09.016 | AMINA | Try writing it for someone who has just arrived. | 两句足够，无格式文章 |
| T09.017 | LEARNER | Please help yourself. You can take a little first and come back for more. | 本次茶会拟定说明 |
| T09.018 | NOOR | Now I know I can help myself. | 对具体信息的反馈 |
| T09.019 | MEI | Shall we keep the note for the next group? | 按作者许可保存 |
| T09.020 | NARR | There is still room at the table, and room for another question. | 可选旁白，非正确礼仪总结 |

玩家选择客人时以Noor为可扮演角色，NPC玩家示例交换为真人表达；不得同时扮双方而假装有信息差。T09.021客人：“I haven't tried this before. Could you tell me about it?”；T09.022主人：“Of course. Would you like a small amount first?”。拒绝饮食T09.023客人：“No, thank you. I'd still like to sit with you.”；T09.024 Amina：“You're very welcome.”，可以全程交流不取食。

## 触感、表演与课堂

壶、杯、托盘有明确握点与放置面；份量变化只影响真实杯中液面，不让同一杯倒两次却液位不变。桌面触碰声与动作匹配，人物倾听时停止整理。温室反射保留透明层次，但不遮住唇部和字幕。镜头从来宾视角看清哪个座位被占、展台被什么挡住。

结束可以是修改欢迎卡、换一个座位或发现自己可以提出问题。Amina不因为一次提醒从此完美接待；下一次仍可能忙，只会更早问一句。用客人的实际使用检验说明是否清楚，不按间接问句数量评分。

真人换角色后，由尚未看过说明的一位同学试用欢迎卡：他能否自己决定先取多少、是否还需询问座位？单人版由Noor先确认自己看懂的具体一句，再按明确的自取选择取少量，不把自由文字当作已被系统完整理解。只有实际有人试用才记“已试用”；无来客时存为待试用，结束不自动播放满意评价。

学习回接：课文中的个人交流经历可以帮助理解初到陌生环境的感受；学生需要区分一家人的习惯、本次约定和广泛文化判断。语言重点为请求、偏好、澄清和邀请。保存欢迎卡、可移盆栽归位安排、份量选择及剩余记录；不保存或推断学生健康信息。


---

来源：[T10.md](episodes/T10.md)

# T10 · 把梦想说给另一个人听：这一周先怎样开始

BK07，U7 Section B 2a–2b；树屋地面档案桌与花圃。Iris、Amina、玩家，可选Noor。Amina只协调山谷活动，不代替家长或学校决定学生全部生活。玩家可参与虚构角色讨论，不披露真实家庭矛盾。

## 钩子与具体冲突

Iris把一张影片草图放在日程上，正好遮住自己答应的布置时段。她希望负责开放日短片；Amina担心的不是“拍片没用”，而是两项承诺落在同一时段，其他人会不知道找谁。Iris以为她又在否定自己的想法。

第一轮先各说愿望和担忧；第二轮换位复述，先请对方补充或确认，再尝试改动安排；仍未说清时可追问、暂缓或请同伴帮助，不以某一句式解锁操作。可改拍摄范围、时间或共同分工，不能把一个人变成无限时间和精力的资源。未确定的安排保持待商量，不演成已获所有人同意。

| ID | 角色 | 原创英语 | 动作与表演 |
|---|---|---|---|
| T10.001 | IRIS | I could make the film. I've already drawn the first three shots. | 兴奋展开草图 |
| T10.002 | AMINA | I want to hear about it. We also need to look at this time slot. | 指被压住的卡，不指责 |
| T10.003 | IRIS | You think I won't finish it. | 一时误读，语速变快 |
| T10.004 | AMINA | I'm worried about the setup you agreed to help with. Both are at the same time. | 限定具体担忧 |
| T10.005 | LEARNER | Could we say what each person wants before we change the plan? | 组织交流 |
| T10.006 | IRIS | I want to make something that tells our story, not just carry things. | 说出被看见的愿望 |
| T10.007 | AMINA | And I need to know who will be at the display when the others arrive. | 责任不被抹去 |
| T10.008 | LEARNER | Iris wants to help make the film. Amina needs to know who will help with the setup. Is that right? | 复述后允许纠正 |
| T10.009 | IRIS | Yes. I don't mind helping with the setup as well. | 缓下来，补充条件 |
| T10.010 | AMINA | I didn't realise that was how the jobs had sounded to you. | 承认自己的表达缺口 |
| T10.011 | LEARNER | Could we try a shorter film and move one recording session? | 一种真实可试的方案 |
| T10.012 | IRIS | I could make one scene first, then decide what else we need. | 控制范围是自己提出 |
| T10.013 | AMINA | When shall we check whether that plan is working? | 有回访，非一次承诺终身 |
| T10.014 | IRIS | After the first session. If it takes longer, I'll change the plan. | 愿意据经历修改 |
| T10.015 | LEARNER | Who needs to know about the change? | 考虑受影响的人 |
| T10.016 | AMINA | Let's ask the others before we move their jobs. | 不替别人承诺 |
| T10.017 | IRIS | Can I show you the first shot now? | 关系回到具体兴趣 |
| T10.018 | AMINA | Yes. Let me see. | 放下日程，靠近Iris实际展开的第一张草图；先看构图再接话 |
| T10.019 | NARR | The sketch and the timetable are both still on the table. | 不宣布梦想获胜 |

若无法调开，T10.020 Amina：“We haven't found a time that works for both jobs yet.”；T10.021 Iris：“Then I'd like to keep the idea and talk again after the setup.”。若选择合作，T10.022 Noor：“I can help with one session. I can't promise the whole afternoon.”，卡片只增加这段明确承诺。若Iris仍不愿公开参与T08，T10.023 Iris：“I'd rather work behind the camera this time.”，故事据此调整，不强行治愈或劝回舞台。

## 交互与视觉

日程卡在同一桌面上移动，重叠表示实际时间冲突；拖动时可听见纸边接触，而非电子游戏警报。键盘选择时段有等价反馈。草图可以单独展开近看，两位角色站位从桌子两侧到共同看草图，体现愿意理解的变化。

Amina不是全程严肃，看到有趣构图可以真笑；Iris也可以承认安排太满。配音转折落在004、010和017，保留不同节奏。桌旁远处的普通活动持续，冲突有现实分量但不被渲染成人生危机。

## 收束与教学

三种结束：同意小范围试行、与同伴协商后合作、保留想法另约时间。都写明目前决定与尚待谁确认；以后只引用实际完成记录。结尾让人想看那张草图后来是否拍成，而非靠一个成功蒙太奇证明立场。

语言重点是公平复述、理由、条件和承诺边界。基础“You're worried about… / I could… / Can we try…?”；进阶区分理解与同意。回到课本比较角色各自理由，不能把教材争论变成支持某一方的投票。保存真实试行安排，接入T11或后续回访。


---

来源：[T11.md](episodes/T11.md)

# T11 · 给山谷拍一段小电影：镜头外还有什么

BK01，U1 Section A 3a–3b；工坊、花圃，允许使用已授权的溪流记录。Noor、Sam、Rowan、玩家。素材均为原创场景或获准学生成果，不使用商业电影片段。

## 开场：同一双手，两种解释

一段无声短片里，Sam把一个作品的部件拆下。只看这一秒，Noor配了一句很戏剧化的解说；向前播放才发现，作者请Sam更换松动连接。这个公共演示片明示为预设拍摄练习，不冒称玩家此前发生的经历。

玩家先根据表情、动作与关键词理解，再给相同画面配两种原创台词。可以幽默，但在公开介绍真实山谷行动时要保留必要背景。自由剪辑限当前授权片段与镜头，不自动取得别人的私人寄语或失误录像。

| ID | 角色 | 原创英语 | 表演与条件 |
|---|---|---|---|
| T11.001 | NOOR | Without the sound, he looks as if he's taking it apart for good. | 看预设片，提出解释 |
| T11.002 | LEARNER | What happened just before this? | 请求更多上下文 |
| T11.003 | SAM | The maker asked me to replace a loose joint. | 指片中动作，不长篇辩白 |
| T11.004 | NOOR | I cut that part out. It seemed less exciting. | 承认剪辑动机，非反派 |
| T11.005 | LEARNER | Could we make two versions and see what people understand? | 开始真正比较 |
| T11.006 | SAM | One can be an invented story. Just make that clear. | 虚构标签与纪录说明分清 |
| T11.007 | LEARNER | First, watch his hands. Then listen to the new line. | 给观众观察任务 |
| T11.008 | NOOR | The words change what I think he's doing. | 看片后回答 |
| T11.009 | LEARNER | Which detail made you change your mind? | 问具体依据 |
| T11.010 | NOOR | The request before he touches the piece. | 只在恢复前文后 |
| T11.011 | ROWAN | What do you want the visitors to understand about our visit? | 转向实际山谷短片 |
| T11.012 | LEARNER | How our first explanation changed. | 有真实修订记录时 |
| T11.013 | NOOR | Could we start with the part that surprised us? | 用好奇开头，非夸大结果 |
| T11.014 | ROWAN | Yes. Keep the date and the place with each record. | 明确跨时段比较 |
| T11.015 | LEARNER | This was our first idea. Here is what we checked next. | 可对应溪流或其他经历 |
| T11.016 | NOOR | Shall we leave the unanswered question at the end? | 有实际未解决问题才用 |
| T11.017 | LEARNER | Yes, and say how we could check it. | 余韵伴随后续方法 |
| T11.018 | SAM | Who would you like to watch it first? | 真实受众而非自动全民点赞 |
| T11.019 | LEARNER | Another group. I want to hear what isn't clear yet. | 先试映 |
| T11.020 | NOOR | All right. Let's hear what they think. | 确有另一组可试映时转向观众；无人时保存待试映并不播此句，不伪造反馈 |
| T11.021 | NARR | The last frame has space for the next observation. | 当前片确有回访安排时 |

无溪流经历时T11.022玩家：“I'd like to tell the story of how this piece changed.”，使用实际作品或明确署名公共素材。只做字幕T11.023 Noor：“We can use captions. You don't have to record your voice.”。作者撤回拍摄许可T11.024 Noor：“I'll remove that shot. We can explain the idea another way.”。删除镜头同步从公开导出范围移除。

## 制作与课堂交互

两版配音可以有一版清楚标为虚构的幽默片段，保留Noor对节奏和观察细节的兴趣。他可建议把同一部件变化前后的近景接在一起；作者可以采纳，也可以保留自己的顺序。纪录版恢复必要前文，另一组实际看过后才记录其理解；没有观众时只标“待试映”。人物不只承担犯错后受教育的功能。

先用三个到五个固定机位与短镜头段落，支持前后顺序、裁剪边界、字幕、配音与停顿；不把首版扩成无限视频编辑器。学生能立刻回看自己的改动，同伴说出理解。若预览依赖当前场景状态，生成时必须冻结对应快照，避免之后移动物件让过去影片改写。

画中画仅在比较时使用。普通语流、短句重听、按需字幕帮助理解；系统不按口音评分。角色声音与画面口型只有在角色可见且实际说该句时同步；旁白画面不强行让角色张嘴。音乐取得授权后才进入可选库，优先让对白清楚。

结尾可为小范围试映、完成一个简短公开版或保存待改；都明确受众和许可。作品欢迎有幽默与不同风格，纪录部分则保持事实范围。语言重点是用动作/关键词理解、叙事顺序与信息修复，回接课本中的学习策略，不能宣称必须靠看电影才能学好英语。

保存片段来源、人物与作品许可、剪辑版本、字幕、配音选择、模拟/现实标记。T12调用作者选择的版本；T08未获准的失误片永不默认加入。


---

来源：[T12.md](episodes/T12.md)

# T12 · 给下一届来访者的时间盒：留下什么，带走什么

BK14，U14 Section B 2a–2b；树屋地面档案点至南侧出口。Rowan、Sam、Noor，其他人物只在实际关系中出现。面向明确后来者回顾经历，时间盒不要求通关全部故事。

## 钩子：盒子放不下整个山谷

Rowan把一个不大的档案盒放上桌，学生看见自己实际保存的几件记录。大作品可以留下照片或草图，原件去留由作者决定。盒盖上没有完成率。学生选择一至三件，也可以只留一个问题；没有经历者可写给首次到访者的观察建议，不自动生成辉煌回忆。

Sam以为学生会把作品留在展台，随口问起，随后意识到作品可以被作者带走。Noor问后来者是否会看懂，这使寄语有了真实受众。

| ID | 角色 | 原创英语 | 表演与条件 |
|---|---|---|---|
| T12.001 | ROWAN | There isn't room for everything. What would you like someone else to find? | 推过盒子，不催毕业总结 |
| T12.002 | LEARNER | This picture. It reminds me of our first idea. | 只指实际存在的记录 |
| T12.003 | NOOR | Will they know what happened next? | 引出照片之后的经历 |
| T12.004 | LEARNER | I'll add the next picture and a short explanation. | 可不选，另用文字 |
| T12.005 | SAM | Are you leaving the piece on display? | 真正询问，不暗示标准答案 |
| T12.006 | LEARNER | I'd like to take it with me. I can leave a drawing. | 原件在世界中相应移出 |
| T12.007 | SAM | Of course. It's yours. | 简短，手从作品上移开 |
| T12.008 | ROWAN | Is this something you did, or something you still plan to do? | 分清状态 |
| T12.009 | LEARNER | It's a plan. We haven't made the next observation yet. | 后续记录尚未发生时 |
| T12.010 | ROWAN | Then let's leave a place for the date when you do. | 不伪造时间 |
| T12.011 | NOOR | What question would you leave for the next visitors? | 面向真实未来受众 |
| T12.012 | LEARNER | What will you notice that we missed? | 一种开放邀请 |
| T12.013 | SAM | Would you like anyone to reply? | 询问回应范围 |
| T12.014 | LEARNER | Yes, but only to this part. | 公开范围选择示例 |
| T12.015 | ROWAN | We'll keep the rest with your own notes. | 对应私人保存，不对外传送 |
| T12.016 | NOOR | I thought I was coming here just to look around. | 仅已共同游园时 |
| T12.017 | LEARNER | What would you come back to see? | 由伙伴愿望结束 |
| T12.018 | NOOR | The next version. Or something I haven't thought of yet. | 真诚，稍有笑意 |
| T12.019 | NARR | The box closes. The path is still there. | 当前故事完成，世界未关闭 |
| T12.020 | ROWAN | Take your time on the way out. | 允许最后停留与回看 |

经历很少时T12.021玩家：“I've only just started. Can I leave a question?”；T12.022 Rowan：“Yes. Say what you would like to find out.”。没有公共分享时T12.023玩家：“I'd like to keep this for myself.”；T12.024 Sam：“Then let's make sure you can find it again.”。没有Noor共同游园记录时016换为T12.025 Noor：“I'd like to see what people add next.”，不假装已有友情历史。

## 结局的画面与声音

盒中物件逐件由学生放入，触感来自纸、木、金属的差异。关键近景不是奖章，而是照片边、日期空格和自己留下的修订。盖合可撤回，系统在确认后保存；视觉动画失败不能丢记录。

离开时镜头回到最初入口的同一方向。依据真实进度可看见自己的展品、窗饰或措施；没有做过的地方保持当前公共状态。山谷不因毕业突然繁花全开。角色说完后保留普通生活声；不默认大合唱或煽情独白。熟悉的物件声若再出现，必须来自仍在现场的对象。

## 完整性与现实迁移

本课完成的是选择、说明和交付范围；未来回应保持未知。时间盒是本地作品档案与课堂交换设计，不默认联网公开、自动发消息或生成陌生人回复。教师组织另一组阅读后，回应以明确的真实记录加入。

完整环保主线须在此前或之后安排一次校园观察回看，记录实际情况与仍未完成的事；不能把存盒当现实问题已经解决。邀请应具体，例如请后来者继续记录同一观察点，而不是空泛呼吁所有人拯救地球。

语言重点回顾、感谢具体帮助与面向受众表达希望；基础“I used to think… / I learned…when… / Thank you for…”；进阶区分计划、经历与变化。重读教材关注受众和演讲目的，自己的作品可以是短寄语、字幕或录音，不强迫统一煽情毕业演说。


---

来源：[story-state-and-staging.md](story-state-and-staging.md)

# 连续旅程、分支与场景执行约定 v6

2026-11-07。用于消除剧本走读与制作分工的歧义。本文是设计合同，不是已运行状态机。八地点、永久地标与材质光照沿用v3世界契约；T编号不等同时间顺序。

## 日期、选章与回访

连续旅程用明确的故事日期与时段推进，课堂阅读、讨论、暂停不消耗人物的约定时间。建议时间线如下；教师可选择片段，但不得悄悄补写没有发生的经历。

| 故事阶段 | 可发生的章节 | 进入与离开规则 |
|---|---|---|
| 开放日前的准备日 | T01、T04、T05、T07、T10；当日稍后T08排练 | 章节间按时段推进；日程协商指向准备日，不与到访日11:00混用 |
| 准备日傍晚 | T02树屋夜声 | 原有作品依许可借展；天光与灯具按同一傍晚配置；结束后不自动进入节庆 |
| 到访日10:40起 | T03游园、11:00装置演示、T09接待 | Noor计划12:00离开。路线选择决定活动次序；教学推进前可修订。静态展品可随时看，定时演示有明确开始时间 |
| 回访日 | T03溪流段、T11拍片与剪辑，也可继续制作 | 初见若约好回访，则Noor按新的回访邀请到场；未邀请时用现有在场角色，不能让他永远留在同一到访日 |
| 后续节庆日期 | T06 | 进入时显示“后续节庆回访”；具体班级日历待教师选定。保留作品版本，植被时间变化不自动等于生态恢复 |
| 本次工作坊告一段落 | T12 | 可在任意已完成的教学段之后进入，只取已经有的记录；不是必须经历所有章节的最终锁 |

T11既能在准备日拍艺术介绍，也能在回访日讲环保过程，台词按真实素材范围选择。T08在开放日之前发生；若后来才单独学习T08，清楚进入“独立课例”，不倒改主旅程。

独立选章创建独立课堂存档，使用署名公共物件及明确初态：人物认识彼此，尚未认识这组玩家；不预设玩家作品、失误、借展或环保成果。老师可导入某组明确选择的前序快照，导入内容列出来。早期章节重玩默认使用副本，重玩不能覆写后来日期、影片或原件。回到当前旅程是继续经历，和重看记录分开。

## 四种记录不可混写

1. 当前世界：对象位置与版本、实际完成的游戏操作、在场人物、日期与灯光。
2. 试验快照：模拟参数、模型结果、试验中的时间推进、所比较版本。试验结束不修改当前世界。
3. 角色与学习记录：玩家真正看过、听过、自己提出的解释与尚未查证的问题。导演知道的人物心理不自动进入玩家日志。
4. 历史作品：拍摄或观察当时的快照、文本、录音、许可与作者。过去的画面不随着现在的物件改变。

溪流模型试验后，明确选择实施并完成搬运、摆放、确认，才把措施写入当前东岸。完成实施不等于后续观测已证明有效。T11/T12分别取“观察过”“试验过”“实施过”“复查过”，任何缺项都不能自动补成完成。

## 章节分支的停靠点

| 章节 | 当课可以结束于 | 下次继续时 |
|---|---|---|
| T01 | 展示、暂存、保留未命名作品 | 当前版本和许可仍在，不再假装第一次拿材料 |
| T02 | 未确定、解释碰撞、解释两声源 | 从未验证的部分继续，已知事实不装作未知 |
| T03 | 完成导览、共同改道、约好回访 | 使用推荐卡与回访日期；过了定时演示要询问下一次 |
| 溪流段 | 仅观察/访查、已试验、已实施待复查、已有后续观察 | 根据真实层级选口头说明，不一律说已清理或已改善 |
| T04 | 可复现样件、保留偶然版本、私人保存 | 取已有构型和说明，独立复现由实际操作者确认 |
| T05 | 保留、重做、暂存；寓意可公开或自留 | 同一窗位与纸样，夜间投影依据实际灯位 |
| T06 | 故事内送交、定日保存、暂留空白 | 作者选择是否打开；不自动发送现实消息 |
| T07 | 一版布景、两版快照、私人解释 | 同一原作仅有一个现场位置，按需换景 |
| T08 | 同意试排、约好再谈、幕后或休息 | 回访/教师推进触发028；可不重述全部私密顾虑，直接商量下一步 |
| T09 | 修改欢迎安排、完成接待、保留待答问题 | 新来客能真的使用卡片，旧偏好不是所有人的默认 |
| T10 | 小范围试行、合作待确认、另约时间 | 检查执行记录，不自动宣布承诺完成 |
| T11 | 小组试映、公开版、待修改 | 快照不变；继续剪辑产生新版本 |
| T12 | 保存自己的档案、部分分享、提出问题 | 允许后来补记录，未来回应不预先编造 |

## 条件台词的明确处理

每句客观陈述检查对象、事件和说者知识范围；不满足时优先沉默、问一个当前成立的问题，或用下表变体。正文表中的条件同样适用。自由创作的名称由可读文字显示；未经验证的名字不自动拼进固定演员音轨。

- T01.008–009仅用于确有可动部分的作品，静态用021–022。T01.020仅在未命名、标签在场且访客实际停步时播放，否则静默，不能为了旁白生成人物。
- T02.008“长脖子”仅用于经过验证的相应影子配置。其他合格构型用T02.027 Mei：“I couldn't see what was making that shape.”；未具备有效视线就不声称她从温室看到了它。灰模调整观察点时保持建筑坐标。
- T03.008只在尚可按约到达演示时用，否则T03.026玩家：“Let's ask when we can see the demonstration next.”。没有选桥边路线者通过真实记录册看到邀请，下一课从该地点进入。
- T03S.001–002仅清理后；029–030用于未清理入口。024仅实际清理并试验后。仅访查用T03S.035玩家：“We compared the records and found a possible source. We haven't tested a plan yet.”；只试验未清理用T03S.036玩家：“We tested a plan in the model. We still need to decide what to put in place.”；只看一处用T03S.037玩家：“We noticed a change. We need more information before we explain it.”。实施后仍用034保留待复查。
- T07.010只在空椅子实际存在时用，否则T07.023 Iris：“What would you like the visitor to notice first?”。T07.017的“两景”指已保存的两个布景画面；一景时不播该旁白。
- T08.009的心理只有她实际说出后才能被玩家日志当事实。她不愿倾诉也可回访时直接提出一次小范围试排，不把披露顾虑当通关条件。
- T09.011的作品必须在当前视线内，有署名或公共来源；没有则问当前桌上实际存在的物件，不读取未做过的创作历史。
- T11.012、015、016、021只在有对应经历和后续问题时用。否则采用022的作品介绍或公共练习素材，不编造改进效果。T12所有回忆按当前存档筛选；无经历用021–022，Noor无共同游园经历用025。

## 交互与物理边界的具体决定

**T01拼装。** 模块自带合法接口、抓握点与兼容类别，轻部件和重部件由资产元数据定义，不模拟未经校准的工程强度。连接前校验，不能接时保持原位并显示具体原因。自由构图由对象操控完成；NPC手只在适配抓握点拿放或演示，不假定任意组合都能被预制手型抓住。布片首版使用少量支撑状态与可控变形，不承诺自由布料模拟。键入与录音仍负责自由语言输入，手势不替代写作。

**T02两声源。** 碰撞的固定前后对照使用同一段风驱动曲线，只改变装置能否运动；声音由接触事件触发。开场板声来自Sam在平台另一侧换脚受力，同一块板和同类受力用于后续示范；可先未看见，但事实已存在。固定装置时板件动作可独立回放，不能恰逢风停就假定证明声源。学生作品只在经过声影验证的构型白名单内借展，原作结构不被偷偷改造。未通过者用Sam公共装置；长脖子证词按实际配置选择。手持作品不能同时作为悬挂声源。

**T05纸样。** 剪出的分离片成为独立物件，落到托盘，不悬空跟随主纸。悬挂需至少一条有效连接；选择透明托底或框架可保留分离构图。补洞使用新增纸片及明确连接，撤销则回旧版本，不能混成同一动作。纸样投影来自当前几何，托底自身材质也进入验证。

**T07两个构想。** 首版只占一个实体布景区；两版保存为可回放快照，现场按次序切换。双景同时公开时，其中一版可显示照片，或使用不同实体；未经许可不能复制同一原件。恢复布景需先核对原件现址和借展范围。

**T11拍摄。** 首版权威历史记录采用已渲染的短视频/帧序列加声音时间线，保存场景与资产版本、相机、天气时刻曝光、对象版本和动画起止、许可、源片段ID。渲染完成前是待完成拍摄，不冒称已保存影片。重新编辑沿同一时间基准；新增公开预览/导出须重新核对许可。撤回后移除相关新公开输出并更新缓存，不能追回用户已自行另存或转交的外部副本。实际编码支持须在原型中验证，必要时用明确帧序列加字幕作为等价首版媒介。

**T12带走作品。** 先结束当前借展：停止相关动作与声音、从挂架或展位拆回、交还，再打包。原位置按选择留公共样件或有日期的照片，不能留复制原件。已获保留许可的历史影片仍可显示过去形态；当前场景必须反映物件离开。

## T10可走读日程实例

以下均为准备日的虚构任务，不是到访日真实钟表倒计时。Iris初始答应10:00–10:20协助Mei布置，又提出同段拍摄；公共试排10:40开始。默认布置需两人中的一位持续协助Mei，不可让Mei一人完成后假装原承诺无代价。

| 资源/任务 | 已知条件 | 可以怎样协商 |
|---|---|---|
| 布置 | 10:00–10:20，Mei需一名伙伴；可另约时间但需Mei确认 | 保留Iris或请求Noor接替，他须明确答应 |
| 第一段拍摄 | 原提案20分钟，可缩成10分钟的单镜头尝试 | Iris可先布置，10:20–10:30拍；此时Sam可协助 |
| Noor | 只可协助10:00–10:20，此后有自己的安排 | 可在该段帮Mei，不能被默认承担整个下午 |
| Sam | 10:20–10:40可协助，10:40参加试排 | 超过10:40的拍摄需要另约，不能重叠占用 |
| 试排 | 10:40开始，参与名单可讨论 | Iris若选择幕后，分工据此更新；休息不被写成在场 |

两条现成可行方案：先履行布置，再做10分钟样片；或经Noor与Mei同意由Noor接替布置，Iris按原20分钟拍摄。两条都可能需要之后完善影片。无法达成时暂存想法，另约时间。评价看安排是否回应真实顾虑，不按唯一排布判分。

## 两段可遇见的日常对话

不另开支线，也不承担必需证据。玩家靠近、两角色都在场且没有关键对话时触发一次；离开可停，日志不写未听到的内容。

| ID | 角色 | 原创英语 | 条件与表演 |
|---|---|---|---|
| AMB.001 | SAM | The stand is level here. | 工坊展位准备，查看底脚 |
| AMB.002 | MEI | It is. But I need to reach the plants behind it. | 指真实照料通道，不反驳结构事实 |
| AMB.003 | SAM | Then let's keep the level spot and leave you a gap. | 一起试另一朝向 |
| AMB.004 | AMINA | I'll explain the whole route before they arrive. | 入口准备，对Rowan说 |
| AMB.005 | ROWAN | Or we could ask what they'd like to see first. | 简短提醒，稍有笑意 |
| AMB.006 | AMINA | You're right. I haven't left a space for that question. | 放下长说明，准备先听 |

这些动作让角色关系在场景里可见；非必要闲谈优先让位给课堂交流，不在同一镜头重叠播放。


---

来源：[dialogue-branch-table.md](dialogue-branch-table.md)

# v6分支对白执行表

2026-11-07。本表将原来散落在章节说明与场面状态说明中的51条分支对白集中为正式的文本编辑源。保留已有ID与原英文，不在本次整理中润色或新增口播。相应说明段落负责解释叙事，分支口播的后续编辑、字幕提取和录音文本以本表为准；尚未代表已录音或经学生试玩验证。

每条独立占一行；角色使用既有大写标识。LEARNER是可替换的学习者表达示例，不要求逐字复述。调度列明确进入条件及回接或收束；未满足条件时不得播出。T09的客人、主人是由学习者承担的不同角色，不能让同一人同时扮演双方来假装信息差。

## T02 · 树屋里的声音

来源：[场面状态与调度](story-state-and-staging.md)；主场面见[T02](episodes/T02.md)。

| ID | 角色 | 原创英语 | 调度与条件 |
|---|---|---|---|
| T02.027 | MEI | I couldn't see what was making that shape. | 其他已经验证可见、但不具备“长脖子”特征的影子构型，替代主线008，再继续辨认声源与影形。Mei必须有从温室观察的有效视线；没有视线时不播放此句，也不声称她见过。调整观察点不得移动建筑坐标。 |

## T03 · 带朋友游园

来源：[T03分支说明](episodes/T03.md)及[场面状态与调度](story-state-and-staging.md)。

| ID | 角色 | 原创英语 | 调度与条件 |
|---|---|---|---|
| T03.023 | LEARNER | Sam is working in the workshop. We could ask what he's making. | 当前工坊没有展品，且Sam正在工坊工作时，替代主线004的展示邀请；之后继续询问Noor的路线意愿，不生成尚不存在的展品。 |
| T03.024 | NOOR | I can leave a question for the maker. | 展品前无法找到作者询问时使用；记录给作者的问题，再继续游园。留言不等于摄影授权，未获许可不拍摄。 |
| T03.025 | LEARNER | Let's look now. We can change our plan. | 桥边看过照片并注意到水色变化后，选择当场调查，替代延后回访的回答；进入溪流连续场面，按是否已经清理选择对应入口，保留已答应的路线安排供重新商量。 |
| T03.026 | LEARNER | Let's ask when we can see the demonstration next. | 当前时刻或所选路线已无法按约到达演示时，替代主线008；核实下一场安排后继续协商路线，不能仍宣称有充足时间。未走桥边者可在离开前通过同一记录册得到照片和回访邀请。 |

## T03内溪流连续场面 · 如实说明已经做到哪一步

来源：[场面状态与调度](story-state-and-staging.md)；主场面见[T03-stream](episodes/T03-stream.md)。三条均用于第四场的对外说明，替代不符合当前完成状态的024，不替代实施完成后的034。

| ID | 角色 | 原创英语 | 调度与条件 |
|---|---|---|---|
| T03S.035 | LEARNER | We compared the records and found a possible source. We haven't tested a plan yet. | 已比较记录并找到可能来源，但只完成访查、尚未试验时使用；接续如实修改公共说明与约定观察点，保存未试验状态，不生成模型结果或已实施记录。 |
| T03S.036 | LEARNER | We tested a plan in the model. We still need to decide what to put in place. | 已在模型中试验、尚未清理且未决定现场实施方案时使用；接续对外说明与后续观察安排。保留模型快照及待决定事项，不把模拟变化写成当前山谷变化。 |
| T03S.037 | LEARNER | We noticed a change. We need more information before we explain it. | 仅观察过一处、还不足以说明来源时使用；接续记录现象及下一步访查安排。不得宣称已经比较记录、确定来源、试验或实施；仍可在明确记录点结束本课。 |

## T04 · 光影装置

来源：[T04分支说明](episodes/T04.md)。

| ID | 角色 | 原创英语 | 调度与条件 |
|---|---|---|---|
| T04.021 | IRIS | I moved two things. Shall we go back to the last position? | 同伴复现未成且确实同时移动了两个对象时使用；先询问作者是否恢复。作者同意后回到已保存的变换，再进入一次只改一个条件的重试；未同意不自动回退。 |
| T04.022 | LEARNER | Let's change one thing this time. | 作者同意恢复且场景已经回到上次保存位置后使用；进入单一条件调整，再让同伴尝试复现，不把台词播放本身当作复现成功。 |
| T04.023 | SAM | Then describe when it happens. It doesn't have to stay the same. | 作者选择保留偶然出现、会变化的版本时使用；转向描述它出现的条件，保留该创作方向，再由作者明确是否保存，不强制改成静止或恒定效果。 |
| T04.024 | IRIS | We can keep the recording in your own notebook. | 作者拒绝公开展示时使用；提供只存个人记录的收束。按作者明确的保存或不保存选择结束，不进入公共展陈或把拒绝视为创作失败。 |

## T05 · 窗上的图样

来源：[T05分支说明](episodes/T05.md)。

| ID | 角色 | 原创英语 | 调度与条件 |
|---|---|---|---|
| T05.019 | LEARNER | I want the two sides to meet. | 作者选择修改当前两侧未相连的图样时使用；接Iris的展开建议，进入可撤销重做。保留原版，不能用一句愿望直接替玩家完成连接。 |
| T05.020 | IRIS | Let's unfold the last version before we cut again. | 接作者想让两侧相连的修改意愿；先展开上次版本，再回到可撤销的剪裁操作。修改后依据实际图样继续说明与展示选择。 |
| T05.021 | MEI | Tell me which part matters most to you. | 采用抽象模板、主线关于空白的005–008不适用时，整体替换该段；让作者说明实际关心的部分，再继续图样说明，不强加“空白”的寓意。 |
| T05.022 | MEI | We can keep the window clear until you're ready. | 作者选择暂不展示时使用；本次窗位保持空置，按作者保存选择结束或继续编辑，不能把图样自动贴上公共窗面。 |
| T05.023 | LEARNER | I'd like to share the pattern, but keep the meaning private. | 作者愿意公开图样、但不公开个人寓意时使用；接Iris的制作过程说明建议，只保留作者允许公开的图样与信息。 |
| T05.024 | IRIS | Then we'll describe how you made it. | 接作者不公开寓意的选择；转入对实际制作步骤的说明，并按该范围展示。不得把私下寓意添加到展签、旁白或后续作品介绍。 |

## T06 · 一张还没有寄出的卡

来源：[T06分支说明](episodes/T06.md)。

| ID | 角色 | 原创英语 | 调度与条件 |
|---|---|---|---|
| T06.021 | LEARNER | I'd like you to read this part. | 作者主动选择分享指定片段时使用；只展示所选片段，接Noor询问回应方式，不默认整张卡都可读。 |
| T06.022 | NOOR | Would you like a reply, or would you rather I just listen? | 作者已经选择让Noor读指定片段后使用；等作者决定回复或倾听，再按该意愿继续，不替作者决定是否公开或送达。 |
| T06.023 | AMINA | Who should receive it, and when? | 作者选择送达意图时使用；记录收件对象和时机，再保存这项意图作为本次收束。不调用现实消息发送工具，也不把意图标成实际已送达。 |
| T06.024 | LEARNER | I don't have the words yet. | 作者目前保留空卡、尚未写出内容时使用；接Amina允许留下卡片的回应。仍可通过替虚构角色安排座位并解释选择参与，不要求先补齐文字才能继续。 |
| T06.025 | AMINA | You can keep the card. | 接作者尚未找到表达的回应；保留空卡并允许本次收束，或转入虚构角色座位活动、课堂后再补语言。不自动生成作者未写出的信。 |

## T07 · 同一段音乐里的两种画面

来源：[T07分支说明](episodes/T07.md)及[场面状态与调度](story-state-and-staging.md)。

| ID | 角色 | 原创英语 | 调度与条件 |
|---|---|---|---|
| T07.019 | LEARNER | I'd rather tell a story about an imaginary person. | 学生不愿透露个人情绪时使用；接Iris询问虚构场景人物，之后照常构建布景，不追问学生的真实经历。 |
| T07.020 | IRIS | Who is in your scene? | 接学生选择虚构人物的意愿；让学生描述场景人物，再回到音乐与布景的联系，不把虚构内容解释为个人情绪披露。 |
| T07.021 | NOOR | We can use this scene to compare our ideas. | 当前只制作并保存了一景时使用；围绕这一个真实场景比较各自解释。不播放声称已有两景的017旁白，也不后台生成第二景。 |
| T07.022 | NOOR | I'll use the objects from the shared box. | 无可借作品，或作者撤回借用许可时使用；用公共物件继续布景。撤回时原作归位，公共物件不能冒称学生作品；之后按真实布景继续比较。 |
| T07.023 | IRIS | What would you like the visitor to notice first? | 当前布景没有空椅子，主线010不成立时替代该问句；让作者指向实际存在的视觉重点，再继续解释与观看，不凭空添加空椅子。 |

## T08 · 排练还没有结束

来源：[T08三条分支与回访说明](episodes/T08.md)。

| ID | 角色 | 原创英语 | 调度与条件 |
|---|---|---|---|
| T08.022 | IRIS | A little time alone, please. | 玩家询问是否陪伴后，Iris选择独处时替代愿意陪伴的主线007；接玩家约定可找到自己的位置，不继续追问顾虑。 |
| T08.023 | LEARNER | I'll be by the workbench if you want me. | 接Iris的独处要求；玩家回工坊另一侧，可和组员调整装置。本课可在“尊重暂停，约定地点”收束，不以反复点击或真实倒计时迫使她回来。 |
| T08.024 | LEARNER | It's all right. Everyone makes mistakes. | 玩家先作一般安慰时使用；接Iris说明对后续的担心，不弹出“安慰错误”或扣分。该句不自动满足对她具体顾虑的回应。 |
| T08.025 | IRIS | I know. I'm worried about what happens next. | 接玩家的一般安慰；继续提供主线010的具体复述支持，或让玩家用自己的话回应。维持她担心下次不再获邀的事实，不当场宣布情绪解决。 |
| T08.026 | IRIS | I'd like to help with the setup, but I don't want to be on stage today. | Iris决定今天不参加公开展示时使用；接Amina讨论分工。保留她对幕后工作的意愿与公开上台的界限，不回接保证公开成功的叙述。 |
| T08.027 | AMINA | Then let's decide which part you'd like to do. | 接Iris提出不公开上台；商量具体幕后分工，也允许本次休息。保存实际参与选择作为本章收束，下一章不得默认她已公开演出成功。 |
| T08.028 | IRIS | Could we talk now? | 独处分支之后，仅玩家选择回访或教师推进到下一教学时段触发；Iris在可见距离主动询问。玩家可现在或稍后回应；未回访保持暂停状态，不后台判定她已重返展示。 |

## T09 · 接待桌边

来源：[T09角色交换与拒绝饮食分支](episodes/T09.md)。

| ID | 角色 | 原创英语 | 调度与条件 |
|---|---|---|---|
| T09.021 | LEARNER | I haven't tried this before. Could you tell me about it? | 学习者扮演客人，以Noor为可扮演角色；真人接替对应客人示例。向另一位主人询问后，等待真实说明或主人回应；不得由同一学习者包办双方来伪造信息差。 |
| T09.022 | LEARNER | Of course. Would you like a small amount first? | 学习者扮演主人，回应客人询问；说明后征求份量意愿，再按对方选择安排。不把提问本身当作客人已经同意试吃或取饮。 |
| T09.023 | LEARNER | No, thank you. I'd still like to sit with you. | 学习者扮演客人并选择不取饮食时使用；接Amina欢迎入座，继续交流。不要求换成接受饮食才能完成接待。 |
| T09.024 | AMINA | You're very welcome. | 接客人拒绝饮食但愿意同坐的表达；让对方参与桌边交流，可全程不取食，再按实际选择完成接待与欢迎卡活动。 |

## T10 · 两件都想做的事

来源：[T10分支说明](episodes/T10.md)。

| ID | 角色 | 原创英语 | 调度与条件 |
|---|---|---|---|
| T10.020 | AMINA | We haven't found a time that works for both jobs yet. | 协商后仍无法调开两项工作时使用；接Iris保留创意并约定稍后再谈。保存未解决的安排，不能写成双方已达成时段共识。 |
| T10.021 | IRIS | Then I'd like to keep the idea and talk again after the setup. | 接当前无法调开工作的结果；保留创意与布置完成后再谈的约定，作为本次收束，不删掉未获安排的想法。 |
| T10.022 | NOOR | I can help with one session. I can't promise the whole afternoon. | 玩家选择通过合作协商安排、Noor提出有限协助时使用；卡片只增加这一段明确承诺，再检查实际可行安排。不扩大成整下午都可帮忙。 |
| T10.023 | IRIS | I'd rather work behind the camera this time. | T08保存的状态仍是不愿公开参与时使用；后续按幕后拍摄工作协商安排，不强行把她劝回舞台，也不假定此前已公开展示成功。 |

## T11 · 镜头没有拍到的那一秒

来源：[T11分支说明](episodes/T11.md)。

| ID | 角色 | 原创英语 | 调度与条件 |
|---|---|---|---|
| T11.022 | LEARNER | I'd like to tell the story of how this piece changed. | 没有溪流经历可供叙述时使用；转用真实存在的作品及其变化，或明确署名的公共素材，继续短片制作。不虚构玩家做过访查、试验或治理。 |
| T11.023 | NOOR | We can use captions. You don't have to record your voice. | 学生选择只做字幕、不录本人声音时使用；进入字幕制作并继续观看、修改和分享选择。不要求补录声音才算完成作品。 |
| T11.024 | NOOR | I'll remove that shot. We can explain the idea another way. | 作者撤回拍摄许可时使用；实际删除相应镜头，并同步从公开导出范围移除，再用获准素材或另一种表达继续编辑。不能只隐藏预览而保留导出镜头。 |

## T12 · 离开以前，再看一次

来源：[T12分支说明](episodes/T12.md)。

| ID | 角色 | 原创英语 | 调度与条件 |
|---|---|---|---|
| T12.021 | LEARNER | I've only just started. Can I leave a question? | 当前实际经历很少、不适合回顾完整旅程时使用；接Rowan邀请提出想了解的问题。不生成未发生的共同记忆或完成记录。 |
| T12.022 | ROWAN | Yes. Say what you would like to find out. | 接初来者提出留下问题的意愿；记录想了解的具体事项，再按真实已有经历收束。不把问题保存视为对应任务已经解决。 |
| T12.023 | LEARNER | I'd like to keep this for myself. | 学生选择不做公共分享时使用；接Sam确认个人保存与找回，不要求发布后才能完成告别。 |
| T12.024 | SAM | Then let's make sure you can find it again. | 接学生选择只为自己保留；明确个人记录及找回位置，再以该保存范围收束。不把私人内容加入公共展签或对外影片。 |
| T12.025 | NOOR | I'd like to see what people add next. | 没有与Noor共同游园的记录时，替代主线016；继续基于当下愿望的告别，不虚构既有友情历史，也不据此补写此前同行经历。 |


---

来源：[visual-and-sound-direction.md](visual-and-sound-direction.md)

# v6.1 · 镜头、交互艺术与声音导演稿

2026-11-07。以已批准的自然主义花园山谷为美术基准，[v3世界契约](../world-art-contract-v3.md)继续约束空间与真实渲染。本稿细化各章的表现重点；当前没有新增模型、正式配音或实时渲染验收结果。

## 统一观看方式

全景展示地理关系，进入地点后保持可辨地标，靠近物件才切操作视角。对话以能看见两人距离、手与目光的中景为主；近景只在观察材料、辨认动作或听见转变时使用。玩家可跳过移动镜头，减少动态模式保持同一空间结果。

同一观察条件共享天光、曝光、湿润状态和灯具。关键对象移动后，声音、阴影、触碰和人物视线共同响应。诗意来自构图、时机与细节，不能拿雾和景深遮住未完成模型。下列都是本项目的导演提案，效果待样板验证。

| 章节 | 最值得制作的一个画面/动作 | 声音与情绪变化 | 应留给学生的空间 |
|---|---|---|---|
| T01 | 瓶盖被接住后递回；自己接合的部件在侧光中转动 | 木、金属、布的差异；Sam从快伸手变成耐心等 | 先摸和试，不立即解释用途 |
| T02 | 换站位，夸大的影子露出真实部件；固定后碰撞停 | 风、碰撞、板声有独立因果；猜测变成有依据的说明 | 能重听和保留未知 |
| T03 | 伙伴在分叉处回头等；视线被实际展品吸引 | 同行脚步与临时停留；好奇、澄清、轻松交流 | 真正决定去哪里和为何改道 |
| 溪流段 | 垃圾消失但泥水仍在；相同机位回看不同记录 | 清理声结束后仍听见流水，留下再问的时刻 | 允许先行动后修订解释 |
| T04 | 盘转过一个角度，轮廓开合；关灯后回到普通零件 | 衣袖动作停住、短摩擦；意外、试探、想再试 | 自己提出一次变化 |
| T05 | 同一折纸逐层展开，空白在地面成为另一种形状 | 纸声短，之后留静；期待、误读、理解 | 保留、修改或不给私人寓意 |
| T06 | 收信的手停住，信封留在作者选的位置 | 茶杯和远处收椅子；忙碌逐渐给安静让位 | 公开范围与送出时机由作者选 |
| T07 | 同一小展台两种构图的快照并置 | 音乐停止后再讨论；惊讶可带轻松分歧 | 同一音乐的不同解释 |
| T08 | Iris听到具体复述后，第一次看向同伴；再把草图打开 | 有控制的呼吸、停顿、远处生活声；从防备到愿意继续说 | 可暂停、独处、决定参与范围 |
| T09 | 满杯动作被一句请求止住；主人先问再倒 | 杯壶轻触；热心、误会、重新倾听 | 真实提出偏好或拒绝取食 |
| T10 | 草图移开，露出重叠日程；最后两者同时留桌 | 纸卡移动；急于解释逐渐变成共同商量 | 保留愿望与尚未达成的意见 |
| T11 | 同一画面切回前一秒，观众改变理解 | 配音重音与停顿改变含义；兴奋后愿意修订 | 幽默、剪辑风格与真实信息范围 |
| T12 | 原件归还、照片入盒；出口仍看见同一世界 | 熟悉而有来历的声音再出现；平静、期待 | 留下、带走与未来问题 |

## 主资产与动作交付

美术需要六位固定角色的统一尺度、服装、骨骼、眼睛和口型/表情控制；重复出现保留身份。人物真实感优先来自可信比例、视线、重心、服装接触与自然光下材质，不强制每个角色使用昂贵扫描或动捕。

近景物件优先组：工坊抽屉与模块/接口；Sam夜声装置及独立板件；透明/遮挡光影片与转盘；纸样、托盘、补片、窗位和托底；信封与桌席；可借展台和布景物；试排提示装置；杯壶与份量状态；日程卡和草图；拍摄设备与档案盒。每件记录源文件、尺寸、材质、枢轴、握点、合法状态和许可。现有通用低模仍是灰模/远景候选，不能计为这些近景资产完成。

动作组包括拿起/取消/归位、转动/接合/拆开、纸样展开、放置/移位、手势与目光、倾听/欲言又止/恢复交谈。每段说明接触事件、可中断点和完成事件。动作取消不复制材料；播放声音或字幕不重复写入操作结果。角色手只覆盖已适配交互，详见[状态与场景约定](story-state-and-staging.md)。

## 真实渲染的制作判断

依据[视觉与音频研究](../../research/visual-audio-research-v6.md)，优先完成线性色彩管线、可信PBR材质、接触与关键动态阴影，再决定高成本玻璃透射、反射和后处理范围。温室整体结构、桥与水路始终一致。高级效果按镜头占比和设备实测分配；T02声影线索、T05纸样轮廓与人物表演不能作为低画质首先删除的内容。

课堂常规档与近景展示档保留相同证据、对象状态、语言和操作结果。降级先作用于远景植被、装饰灯阴影、非关键粒子与反射分辨率。WebGL2为拟定基线；具体版本、课堂设备、首屏与帧耗时目标需在第一组真实样板上锁定，当前不承诺任意设备全开流畅。

## 配音、音乐与混音

六位角色按[人物与表演](characters-and-performance.md)维持声线，具体句子按刚发生的事改变意图。录音先连场试读，再分句收录；关键情绪段比较两版。台词ID连接演员音轨、字幕和脚本，学生示例不全部录成替学生作答的主角音轨。

对白、操作、可判断的环境线索、普通环境与音乐分别调节。关键对白时平顺降低遮蔽声；T02观察声源时音乐让位；T08保留环境存在感但每个词可听清。用户手势启动声音、暂停、重听与音频加载失败均有明确字幕和文字替代。空间定位不能被当作自动具备真实墙体遮挡或声传播。

音乐委托包含：T01手作的轻微节奏可选；T02观察段通常不用配乐；T06留白的短尾声可选；T07独立原创短曲作为学习对象；T08以表演为主；T12可引用已获许可主题片段但不强迫情绪高潮。每首有来源、授权范围、可循环/剪辑区和声部版本。当前没有将合成占位音计作正式配音。

## 首条旅程的五个验收镜头 v6.1

这些镜头服务[第一条完整旅程](implementation-handoff-v6_1.md)，与其余章节共用既定世界。固定机位名称和可见关系，实际焦距、相机位置与景深在同一灰模中调好再锁定；不先凭空填写精确参数。

| 镜头 | 画面与动作 | 听见什么、为什么停顿 | 对照什么才算成立 |
|---|---|---|---|
| J01 · 山谷到主桥 | 选已有总览中的东侧主桥，沿连续地理靠近；温室、东岸花床和同一条溪流始终可定位。独立课例从桥位进入，总览靠近可跳过 | 近处流水逐渐清楚，同行者在可站立位置等候；不以旁白列全部任务 | 总览、行走与近景只有一个桥实例；路向、水流与地标对应；禁用全景图切到另一套无关场景 |
| J02 · 清理之后 | 近看同一瓶子被取入容器，移开手后露出仍然褐色的水；保持可再观察的中景 | 短触碰声结束，流水继续；先给学生发现“仍然如此”的时间，再出现按需追问 | 拾取、接触、瓶子消失与存档一致；水不播放净化闪光，不为戏剧性突然变得更脏 |
| J03 · Mei的目击范围 | 温室门口双人中景，能看到她指向东岸的实际方向；承认没看见整场雨时看向记录，再回到访查者 | 前句清楚回忆，后句自然停顿后说明不知道；不用心虚音色暗示罪责 | 视线、手指与地理相符；学生暂停或重听时人物可以等，不持续夸张点头；字幕不遮嘴 |
| J04 · 同条件比较 | 桌上模型保留实际裸土—浅沟—汇流关系；先静止看位置，再播同条件两侧路径；盖片有厚度与支撑 | 轻触声与动作同起止；Mei在学生提出改位置后才回应，不用失败提示音 | 明确可读“In the model”；无覆盖基线不变；可降装饰粒子但关键路径和结果相同；模型不改变现场水色 |
| J05 · 同一桥位再看 | 沿同一地形回桥；当前场景与早先记录使用对应机位。真实已做的动作、记录日期和模型画面分清 | 角色只对实际做过的事说话；最后保留流水与课堂交流，不以庆祝音乐宣布生态恢复 | 无实施时不出现盖片，无新观察时没有“已复查”；旧照片不随现场修改；减少动态模式保留相同信息 |

调色延续批准全景的低饱和灰绿、湿润石土和温室暖光，近景保留材料层次与清晰边缘。全景雾感不能搬到证据特写中遮住细节；相同天气下不为每个地点另做一种电影滤镜。视觉高潮来自学生能追踪的变化与空间关系，不在每次点击时堆叠镜头推拉、粒子或奖励光效。

本批录音先连读桥位发现、Mei访谈和回桥三个场面。Rowan从邀请观察到认真划清已知范围；Mei从解释自己正在做的事到愿意看学生的建议；Noor保留想拍清楚、想再看一眼的好奇；Sam把注意力放在具体材料和操作上。关键句录平静/略有迟疑两版供上下文选择，不随机切换情绪。最终情绪来自相邻句和动作，不靠人物永久绑定一个音色形容词。

字幕关闭时不隐藏完成任务必需的文字证据；音频关闭时提供同等内容。用户选择减少动态效果时直接切到同一合法机位，不删观察过程。验收同时看静帧与连续录屏，前者查材质构图，后者查时间、接触、等待和镜头衔接。

## 四类专项艺术样板的明确交付

1. T01：同一作品在台面、展台与总览的位置一致，拿放、转动、取消都有接触与声音。
2. T02：固定前后只改变目标部件，声音、影子、动作同源；耳机、投屏和文字模式都能取得线索。
3. T05：两种折法的几何展开、分离片与托底成立，窗位投影对应当前纸样。
4. T08：一段双人连场表演，先做读稿与动作预演，再做面部和口型；同时检查只看画面、只听音轨及完整视听的理解。

每组交真实浏览器录屏、同条件截图、资产版本和设备记录。离线美图、AI概念图与运行画面各自标清。样板用于验证既定方向的实现，不重新要求用户选择已批准的整体风格。


---

来源：[classroom-playthrough-v6_1.md](classroom-playthrough-v6_1.md)

# English Valley v6.1：首课走读与课堂执行稿

日期：2026-11-07。状态：待实现、待试教的设计补充，不是已经完成的教师或学生测试。继承 v6 角色、地理、日历、对白与保存约定；以下英文角色卡和学生任务均为本项目原创，不冒称教材原句。

## 这节课真正要完成的事

面向初三，首课与 `implementation-handoff-v6_1.md`、`first-journey-flow-v6_1.json` 的 `standalone_invited_return` 一致，从 T03 内同一桥位的“独立回访课例”进入 C1：Noor 接受本次同行邀请，Rowan 带着公共记录等候；不预设学生已经完成清理、试验或实施。首批不包含南入口、花圃过场和 11 点演示。学生询问同行者关注的问题，发现“可见垃圾”和“褐色水流”不能当成一个问题，取得三处核心证据并访问 Mei，再用固定无覆盖基线对照本次所选位置，用英语说明做了什么、依据是什么、还不知道什么。

本课按学生已经学习或至少读过教师选定的 U13 环保相关语篇安排。若是第一次接触该语篇，应先单独安排阅读，不把完整课文初学硬塞进这 45 分钟。教师核对实际学校教材版次及原有锚点；课件不擅自复刻未核验的段落。

首课仅提出可以检验的局部解释，不能证明溪流全部问题已经解决。现实访查与雨后复查是后续课的真实待办。T03-stream 的完整版本可继续采用两课安排；本稿是其中范围较小的首次体验。

## 开课配置与分工

**默认：两人共用一台电脑。** 设备运行预写的单机剧情及模型分支。两张不同的纸卡分别交给 A、B；公共屏幕不提前展示双方秘密信息。A 先操作和提问，B 先承担访客角色；进入 Mei 访查时交换职责。学生可以自然表达，不必照念卡面上的支持句。

**四人一机：** 操作者负责按全组决定执行；访查者提出问题；记录者记录原话和条件；观察者检查有没有把推测说成事实。在可选模型重试或说明环节更换操作者，不为了轮换强制增加试验。角色名称是课堂分工，不是额外四个世界人物。

**一台电脑投影：** 教师操作路径与模型，所有学生先两人对话、写下预测，再由若干组汇报理由。教师不以全班齐答代替信息差对话，也不只收集最快一组的答案。

**独立体验：** 使用已有 NPC 预写回答和相同证据。产出记录为“独立回应”；不能因此宣称发生过同伴协商。

**同机共享的来源：** C1-E01 必须在桥位实际打开。C1-E02/E03 可由一名成员在本地资料查看器实际展示带地点、故事日期和来源的完整资料，另一名成员说明自己从同伴处了解到什么；相应记录标 `peer_shared`，不虚构其本人到访。共享不是联网传输，也不是凭一句“我看过了”自动填证据。单人模式不用共享入口。Mei 角色练习后仍需听到或读到系统中的原始陈述，角色卡本身不自动写入 `interview.heard`。

开课前教师确认本地内容已加载、模型基线固定且重试前能重置、字幕和声音可用、保存可恢复。缺少个别声音时可走阅读路径；该次活动不记录为听力表现。设备能否稳定展示三维画面由实际样机测定，本稿不给未经测试的帧率承诺。

## 45 分钟流程：时间是演练假设

| 时间 | 场景与学生行动 | 屏幕/材料 | 教师只在需要时提示 | 留下什么 |
|---|---|---|---|---|
| 0–3 | 从同一东桥开始；两人用卡 G/N 交换“想查什么”与“可以去哪儿”的信息，说一个可见细节和一个疑问。 | 桥位现场、公共路径、不同角色卡；不先给原因。 | “What can you see? What would you like to find out?” | 一条观察或问题及选择访查次序的理由；不评分。 |
| 3–5 | 简短回看已学语篇，找一个行动及其针对的问题，联系到现场。 | 学生自己的教材，教师确认的段落。 | “What problem does this action address?” | 指认一处课文依据。 |
| 5–10 | 打开 C1-E01 桥位雨前/当前记录；选择先看记录或先清理，比较实际清理前后。 | 同机位、有来源记录；可拾取瓶子。 | “What changed? What did not change?” | 原猜想及需要补查的问题；未清理仍可继续。 |
| 10–16 | 访问上游观察点，查看同轮上游/桥位对照；沿东岸查看裸土—浅沟—汇流口。次序可互换，同机共享须展示材料。 | C1-E02、C1-E03 及原地形连续路线。 | “Where does this record come from?” | 两处资料及实际取得方式；不能只凭卡名填完成。 |
| 16–22 | 到温室门口与 Mei 交流；交换卡 I/M 演练问答，再读或听原始陈述核对其观察范围。 | C1-E04、卡 I/M；已取得资料可共同查看。 | “Which part did Mei see herself?” | 一项目击与一项未知；三处证据和访谈均打开才去模型。 |
| 22–25 | 沿原路径到裸土区；人物到位后，指认一次试验的位置并预测。 | TRIAL 说明：无覆盖基线与本次选择；固定条件。 | “What will you change? What will stay the same?” | 一句预测；可选不覆盖、无关区或指定源土表面。 |
| 25–30 | 完成一次并列回放：固定无覆盖基线 vs 本次所选位置；重看同一镜头。 | 已约定的定性情境，不是实时水文预测。 | “Show your partner where you noticed a difference.” | 这一轮真实完成的试验快照及比较；可无差别。 |
| 30–34 | 根据结果保留或修改计划，同伴追问；有时间可再试一个位置。 | 原预测、结果、新说明；每次重试仍对照固定基线。 | “What made you keep or change your plan?” | 一个基于结果的理由；不要求所有位置都玩完。 |
| 34–38 | 保存提案；条件满足且时间允许时，可与 Mei 核对用途和位置后检查材料、搬运、放置、调整、确认。 | 当前山谷与模型明确区分。 | 未实施不得使用“we put it in place”；可只留提案。 | 提案、实施草稿或已实施状态；安装不是必做。 |
| 38–42 | 在当前地点给 Noor 一段据实说明，同伴提出一个追问；三槽画面可用一槽、留白或存草稿。 | 来自真实记录的图片与自由注释/音频。 | “What can we say now? What still needs checking?” | 理想目标为短说明；未完成也可保存已有内容，不锁退出。 |
| 42–45 | 沿同一地形回到桥位，选定下次记录内容，完成简短退出条与保存。 | 原桥位、回访卡。 | 现实迁移只选一个可观察、可询问的问题。 | 下一步及未知；时间不足就保存暂停，不瞬移、不补写完成。 |

**超时处理：** 10 分钟仍在桥位时，教师帮助找到记录入口，不能代写学生结论。22 分钟核心证据或 Mei 陈述尚缺时，继续缺项或进入“仍需了解”的说明与保存，不能删掉 C1-E02 后直接做模型。30 分钟仍未完成一次比较时，仅说明已有证据和下一步，试验与实施留后课。38 分钟进入已有内容的表达；三槽留白、没有安装、没有完整长报告均可收束。45 分钟若尚未走回桥位，保存暂停和原位置，下一课续行；不以赶课为由改写空间或学习事实。

## 可直接印发的英文角色卡

卡片中的“不要提前展示”是分发说明，不是对角色进行欺骗评分。所有信息在相应交流结束后都可以共同查看。

### G — You are the field guide at the east bridge

> You are at the east bridge. The map shows paths to the upstream observation point, the bare flower bed and the greenhouse.
>
> You know that Mei is near the greenhouse. You have not read her account yet.
>
> You do not know which question Noor wants to investigate first, or how much help Noor needs with the map.
>
> Find out what matters to your companion. Agree on where to begin. You will need the records from all three places before trying a model.
>
> You may ask: “What would you like to find out first?” / “Would you like me to show you the path?”

教师附注：公共地图显示真实路径，卡片不构成取得证据。学生可改变访查次序，但模型所需材料不变。首课不打开工坊演示及全游园分支；这些仍属于完整 T03。

### N — You are Noor, returning with the group

> You want to take a photograph near the stream. You want the caption to say what the group really knows.
>
> You wonder whether the water looks the same farther upstream. You also wonder what happened at the bare flower bed.
>
> You do not know these paths well. Ask for help if you need it. You may prefer to look at a place first or speak to Mei first.
>
> Explain which question you would like to start with. Listen to your companion's suggestion.
>
> You may say: “I'd like to find out…” / “Could you show me…?” / “Could we ask Mei first?”

不要求学生把所有疑问同时说完；信息应在问答中出现。Noor 的关切允许多种合理访查次序，不预设唯一正确选择，也不替学生得出原因。

### I — You are asking Mei about the flower bed

> You saw brown water near the east bridge. Removing the bottle did not make the water clear.
>
> You want to find out whether anything at the flower bed could be connected with the water you saw. You have not watched a whole rainstorm here.
>
> Find out what happened at the bed, what Mei saw herself, and what she does not know.
>
> Ask a follow-up question. Do not decide the cause before you have heard her answer.
>
> You may ask: “What happened here before the rain?” / “Did you see…?” / “What happened afterwards?”

如本组尚未清理瓶子，第一段改用：“You saw a bottle and brown water near the east bridge. You have not removed the bottle yet.” 学生可以先访谈再看裸土；卡片不预设已经亲眼看过浅沟。必须由实际进展选择版本，不替学生虚构已完成动作。

### M — You are Mei, the gardener

> You worked on this flower bed before the rain. You had not finished covering the soil.
>
> After the rain, you saw water in the shallow channel. You did not see the whole storm.
>
> You can show where the channel begins. You do not know whether this bed explains everything in the stream.
>
> You want to help the group check its idea. Answer what you know; it is fine to say what you do not know.
>
> You may say: “I saw…” / “I didn't see…” / “I can show you…”

角色扮演者不需要模仿成人口音或自行编造污染源；不会回答的问题保留为访查所得的未知。教师让学生读或听系统中的原脚本作为第二次核对，不能在信息差前先播放完整答案。只有实际呈现了 Mei 的陈述才记录 C1-E04／`interview.heard`，不能凭完成纸卡练习自动通过模型入口。

## 三处核心证据、Mei 陈述与模型：编号不混用

| ID / 类型 | 可见卡面英文 | 学生可做的比较 | 制作必须守住的范围 |
|---|---|---|---|
| C1-E01 / Bridge record | “East bridge — the same viewpoint.” “Before the rain / Return visit.” “Compare what you can see.” | 看同机位可见水色、物件和时间条件。 | 对应正式桥位记录源，故事日期标签与交接目录一致；必须实际打开。画面未制作前标“待制作”；外观不证明水中物质或安全性。 |
| C1-E02 / Upstream comparison | “Upstream and east bridge — observation round 01.” “Compare the two places in the same observation round.” | 比较同轮上游与桥位所见。 | 实际呈现两份有地点、时间与来源的资料。亲自查看标 observed，同机展示后分享标 peer_shared；不能把两轮不同天气拼成同轮。 |
| C1-E03 / Source and path | “Bare soil — shallow channel — stream junction.” “Trace the visible path.” | 指认裸土、浅沟与汇流口的关系，提出可能来源。 | 是可见路径与可能解释，不是证明全部水色的唯一原因。来源与是否本人到访必须标明。 |
| C1-E04 / Mei's account | “Mei worked on the bed before the rain.” “She saw water in the channel afterwards.” “She did not see the whole storm.” | 将访谈与路径对照，区分目击与推测。 | 原陈述实际读到或听到后才记录；不是传感器记录，不足以确认唯一来源。 |
| TRIAL / Model comparison | “This is a model.” “Compare the no-cover baseline with your chosen position.” “Keep the rain setting, starting conditions and running time the same.” | 每轮固定无覆盖基线 vs 本轮选择；可选不覆盖、无关区或指定源土表面。 | 固定版本、同一条件、同一镜头。无覆盖为两侧相同；无关区为源土示意无改变；源土表面为本预设情境中进入浅沟的土壤示意减少。不是经过校准的水文预测，没有真实净化率。 |

模型准入需要 C1-E01、E02、E03 已实际呈现且 C1-E04 的陈述已读到或听到；这只检查信息是否有机会被接触，不判断英语理解是否正确。C1-E05 的 Wednesday 日志缺项保留到完整故事，首课不必制作。没有查看或接收的材料不列入本组已有证据。一次完整比较即可形成提案，反例位置只是可选修订；未取得足够材料可以随时保存未解问题，不能绕过准入继续模型。

## 学生提示与最小产出

提示只在学生需要时打开，不要求按顺序填满四个句型。先允许自己的说法；短语、指图、书写、口述都可支持交流。

> “We noticed…”
>
> “Mei saw…, but she did not see…”
>
> “In our model, … changed when…”
>
> “This may explain…, but we still need to…”
>
> “Our next observation will be…”

模型结果出来后，系统不能自动把示例 “Less soil moved…” 写入学生答案。只有实际运行支持时才可提供该表达作为可选语言帮助；若未改善，可以使用 “We did not notice a change. We want to try…” 并解释下一次改变什么。

**本课只收一份与当前进度相符的小作品：** 理想目标为三至四句简短说明，或图文/口头表达，包含判断、依据、限制与下一步；每点不必是独立完整句。界面的三槽是组织工具，不是必须填满的作业：一幅图、一句尚未解答的问题、留白和草稿都可保存、退出。教师据实记录本次已出现的表达，后课再补；不能为了达标自动填入标准答案。学生可以先两人讨论再分别留一句想保留的话。正式长片留到 T11。

**最小记录字段：** 案例与场面、实际世界/模型状态、学生原话或作品位置、表达方式、支持使用情况、记录来源（学生输入／学生自报口述／教师转记／同伴反馈）、仍未知的问题。口头表达未被教师听到时标“自报”，不伪装成教师观察。语音录制不是前置条件；选择了系统范句可保存但不能自动视为独立表达。

记录入口的学生文字可用：“Keep one sentence that matters to you.” 下方可选 “Write it / Tell my partner / Add a caption”。选择 “Tell my partner” 后只记录参与声明和学生愿意留下的关键词，不生成不存在的转写或自动口语分数。

## 十二案：真正需要听见或看见的学习时刻

以下是实施时必须有承载位置的最小证据，不是十二份统一作业。教师可按课时只选一项；学生不因暂未留存而被锁在场景里。教材定位沿用现有锚点，具体页码与版本由教师确认。

| 案例 | 不可被点击替代的时刻 | 可选学生提示 | 最小产出与回读动作 |
|---|---|---|---|
| T01 旧物创作 | 访客先说看见什么，作者再回应；无标题作品仍有作者意图。 | “What did you notice first?” / “I kept this part because…” | 一处结构/材料选择及访客一次回应；回读 U13 再利用语篇，找出“材料—转化—用途”的一组关系，与自己的作品比较。 |
| T02 夜间声响 | 学生的首次猜想与后来证据相遇，可以保留未知。 | “I thought…, but this sound/photo…” | 一条原猜想、一条支持或改变它的证据；回读 U8 推断语篇，指出人物如何从现象走向解释。 |
| T03 导览及 C1 | 同伴偏好改变路线；模型证据改变或支持提案。 | “Would you rather…?” / “This result supports…, but…” | 路线理由或 C1 四要素说明，按本课重点选择；分别回读 U3 的询问方式或 U13 行动与问题的对应，不能一次要求两份完整报告。 |
| T04 偶然发明 | 一人说清调整方法，另一人能按描述重现；听者可追问。 | “Turn/move… until…” / “Which part do you mean?” | 一段可执行说明及听者一条澄清；回读 U6，比较偶然发现与后续验证的不同作用。先遮住操作者设置，避免纯视觉照抄。 |
| T05 折剪与纹样 | 展开前留预测，展开后解释变化或保留。 | “I expect…” / “When it opens,…” | 一幅预测和一句过程说明；回读 U5，借用一种材料或工艺描述表达自己的做法，不把自创图样说成传统事实。 |
| T06 留给一个人的位置 | 学生决定表达什么、什么可以不公开；别人能理解一个空间安排。 | “This place is for…” / “I'd like to keep the message private.” | 可选择虚构留言、私密留言或公共空间说明；回读教师确认的 U2 材料，比较节日行动如何承载关系，不强制分享个人经历。 |
| T07 音乐与两种场景 | 听者指向一个具体音乐细节；理解别人不等于改成同一感受。 | “Which part made you think that?” | 一个声音细节与一项布景选择的关系；回读 U9 相关经历与音乐描写后保留或修改解释。无声路径记录为结构阅读与表达，不冒认听力。 |
| T08 一次失误之后 | 回应具体误会，并给 Iris 选择继续、稍后说或独处。 | “I thought you meant…” / “Would you like…?” | 两轮自拟交流，或观察者写“已知／未知／下一步”；回读 U11 团队语篇，比较人物如何面对失误与支持。 |
| T09 空着的座位 | 访客真实偏好让主人修改安排；同一偏好不能永远代表所有人。 | “Where would you feel comfortable?” | 一项调整及访客反馈；回读 U10，找出一项需要先了解背景再解释的行为，避免列文化刻板规则。 |
| T10 约定与拍摄 | 学生说出谁受到哪一项安排影响，并提出可执行修改。 | “If we change…, can you still…?” | 一版改动时间表及双方确认；回读 U7，区分表达愿望、理解担忧与协商具体责任。 |
| T11 同一镜头的另一种讲法 | 比较剪辑/字幕前后，观众是否仍会误解 Sam 的动作。 | “What might a viewer think here?” | 同一短片段的两版说明及一个观众反馈；回读 U1 学习方法语篇，选一种方法改进本次表达，并记录实际改变。首轮仅用一小段素材，完整短片另排制作课。 |
| T12 留给后来者 | 选取一件真实做过的作品，说出理解发生在哪里；不把计划写成完成。 | “I used to think…” / “We have not checked… yet.” | 一个具体变化及一个未完成问题；回读 U14 回望语篇，区分泛泛感谢和有事件依据的回忆。没有前史时可以留下愿望，不伪造经历。 |

## T01 与 T08 的课堂补充卡

### T01：让自由创作需要一个真实听者

**Maker 卡：**

> Choose one part you want a visitor to notice. Keep your title to yourself at first, or leave the work untitled. Listen to what your visitor sees. Then explain one choice you made. You may keep your idea, change it, or leave part of it open.

**Visitor 卡：**

> Look before you hear the maker's explanation. Say one thing you notice and ask one question. Do not guess what the maker “really means”. After listening, say what became clearer, or what you still wonder about.

教师观察：访客的理解是否来自作品可见部分；作者是否回应了这名访客的实际问题。最低产出是一问一答，搭建过程不强行插入词汇弹窗。创作尚未完成也可讨论一个连接或材料选择。NPC 无法理解任意造型时明确走预写的部件/意图回应，不假装机器已读懂其象征意义。

### T08：角色有不同所知，不是一组正确情绪

**Iris 卡：**

> Something went wrong during the shared task. You are worried that the others may not want you to join next time. You may talk now, ask for a short pause, or say that you would rather talk later. You do not have to explain everything at once.

**Sam 卡：**

> You know that your hand signal was unclear. You meant one action, but Iris understood another. Explain your part in the mistake. You do not yet know what Iris is most worried about. Ask without deciding how she should feel.

**Friend / Observer 卡：**

> You saw that something went wrong, but you do not know the whole conversation. You can ask, listen, or offer a choice. If you prefer not to act, write two possible lines for this imaginary scene and explain what each line gives the other person room to do.

教师可问：“Which fact did your reply respond to?” “What do you still not know?” “Does the other person have a choice?” 不要求学生讲现实中的受挫经历，不以表演悲伤程度、积极语气或立刻和好作为学习达成。暂停后可留下下一步约定；回访必须由明确动作进入，不能用隐藏倒计时逼对方再次说话。

## 字幕与交流停点示例

这是呈现拆分示例，不改变对白 ID，不代替后续声音导演。长句先按意义拆显示，录音保持自然；实际行长依目标设备校验。

| 原台词 | 显示单元 | 下一步 |
|---|---|---|
| T03S.005 | “The colour is different.” → “Does that tell us what is in the water?” | 给学生先说的空间，再进入 Rowan 的回答；教师可在提问前暂停。 |
| T03S.007 | “We worked on that bed before the rain.” → “I hadn't finished covering the soil.” | 可重听；“before the rain”与花床同屏指认，非自动闪词测验。 |
| T03S.009 | “I saw water in the channel afterwards.” → “I didn't see the whole storm.” | 停在访查者的追问点；第二句是信息边界，不配失败音效。 |
| T03S.024 | 根据实际完成内容显示 “We removed the litter…” / “We tested a plan…” / “We still need to check what happens later.” | 已完成的动作才进入可选支持；学生可以自拟更短说法，不强制朗读系统摘要。 |

字幕支持保持说话人、重听、暂停和短语辅助稳定位置；人物动作与近景镜头不在学生阅读中强行切换。辅助中文按需打开，不盖住证据照片。听说任务中的音乐和环境声在对白时让位，具体混音在样片验证。

## 退出条与教师观察

学生可写三句、说给同伴后留关键词，或由教师转记：

> 1. “One thing we can say now is…”
> 2. “One thing we still do not know is…”
> 3. “Next time, we will check… at…”

“at”可以是具体地点或下一次约定的时间，不要求学生虚构日期。现实延伸只需带走一个观察或访谈计划，例如询问校园绿地由谁维护、雨后在哪个固定点观察；没有实际完成就标为计划，不提交虚构环保成果。

| 观察点 | 已观察到的证据 | 需要帮助时怎么处理 |
|---|---|---|
| 听取他人信息 | 同伴给出的一个细节改变了路线、提问或说明。 | 教师请听者复述一个实际听到的信息，再允许重新决定。 |
| 用依据解释 | 学生指向一张图、Mei 的一句目击或一次模型比较。 | 问“Which record shows that?”，不替学生指定结论。 |
| 区分确定与未知 | 说明中没有把模型当实地结果，或能自己修正。 | 将“model / valley now / next visit”并列，请其指出当前正在说哪一个。 |
| 让英语服务交流 | 自己提出问题、解释选择或回应同伴；可使用短语支持。 | 降低句子长度，允许指图加短语，再尝试让对方理解。 |

教师仅记“已独立观察到／支持后观察到／本次未观察到”及一条原话，不算语法总分，不从点击次数推断理解。未观察到可能是时间、设备、分工或缺少机会，不能直接等同能力不足。

第一次真实试教还应记下：在哪个屏幕停住、教师额外提示了什么、何时开始由一人包办、最终哪些学生留下了自己的话。只有这些记录和设备表现取得后，才能讨论是否调整课时、开放更多路线或扩大十二案生产。


---

来源：[implementation-handoff-v6_1.md](implementation-handoff-v6_1.md)

# 第一条完整旅程的制作交接 v6.1

2026-11-07。依据已确认的共同山谷、十二章叙事和v3地形契约，将第一批开发的含糊处收敛为可执行设计决定。配套文件：[first-journey-flow-v6_1.json](first-journey-flow-v6_1.json)。它是声明式交接数据，不是已经运行的游戏程序。本稿未验证实时渲染、设备性能、配音或课堂效果。

## 本轮生产决定

可以启动这一条完整旅程的灰模、操作原型和内容加载器。十二章精模、正式配音与大量资产生产，等待这条旅程在目标设备和真实课堂中走通后逐章放行。T01的制作手感、T02的声影、T05的纸形变、T08的情感表演继续作为单独艺术试验，不承担证明整条教学体验成立的任务。

首版范围为：**T03同一桥位的短导入 → 三处核心证据与Mei访谈 → 一种覆盖措施的对照 → 可选的提案/实际放置 → 三幅画面解释 → 回到桥位、回访卡和保存。** 这不是第十三章；它是T03内部C1段的一条制作切片，借用T11的据实说明和T12的回看方法。

入口明确显示“独立回访课例”：Noor接受本次同行邀请，Rowan拿着公共记录等候，玩家尚未被记录为完成任何环保行动。这样既能用T03.014–015在桥位产生发现，也不必假装首版已实现整个游园、11点演示或此前的玩家经历。以后嵌入连续T03时，用真实前序存档替换这个公开初态；不能把初态当作学生曾经完成的事。

## 这条旅程怎样实际走通

| 阶段 | 学生真正能做的事 | 写入什么；不推断什么 |
|---|---|---|
| 桥位导入 | 打开同机位雨前/雨后记录；清理瓶子可在查看前后进行；选择调查，或先保存当前发现 | C1-E01记录已查看；C1-E06仅记录实际清走瓶子。水色保持当前观察状态 |
| 开放访查 | 走到上游做同轮对照，沿东岸找裸土—浅沟—汇流口，去温室询问Mei；次序自定 | C1-E02、E03及E04分别记录观察或同伴共享来源；角色说不知道的部分仍是未知 |
| 有限比较 | 一块盖片放在指定源土区、无关区域或暂不覆盖；与相同条件的无覆盖基线并列播放；可撤销、重试、停下 | 每次完成试验得到不可改写快照；未播完或取消不算完成；结果只属于教学模型 |
| 提案与操作 | 保留提案；或与Mei核对用途和位置，再检查材料、搬起、摆放、调整、确认完成 | 看见改善的模型不能自动安装；只有有效现场摆放且确认才写入覆盖物已实施 |
| 据实说明 | 从真实记录选三幅画面，写注释或录音；允许空白、草稿和未解问题，同伴提出一个追问 | 保存学生作品版本；保存不等于老师判定其主张或语言正确 |
| 返回与保存 | 从当前位置沿原地形走回同一桥位，约定看什么、到哪里、何时再看，并联想一个学校里可观察的问题 | 保存“计划回访”。当前水色不为结局自动变清；没有后续观察就不能标“已经复查” |

前三份核心证据为C1-E01桥位记录、C1-E02上游与桥位同轮观察、C1-E03裸土和浅沟路径。Mei的C1-E04仍是必要人物场面，而不是把“获得三个卡片”当作探索全貌。C1-E05树屋日志不属于本批必做资产；其缺页线索在后续完整章节保留。三处资料有任意顺序；共享资料标为“同伴共享”，不冒充本人到访。

进入覆盖比较需要实际打开三处资料并听到或读到Mei的观察范围。这是使用有场地依据的对照工具所需的上下文，不判英语理解正确与否。学生可随时以“仍需了解”结束，不能为了去下个场景被迫交标准句子。讲述发生在现有地点，随后实际走回桥位；小地图、角色和镜头没有另一套地形。

## 一个刻意有限、可复现的教学模型

模型版本固定为`cover_authored_qualitative_1`，条件包为`fixed_scene_A`。它是**预先创作、确定性回放的定性教学情境**，用来比较位置与解释范围；它不是经过校准的水文仿真，也不预测现实中某种覆盖材料的效果。

| 盖片位置 | 同条件无覆盖基线 | 本次画面结果 | 可用解释 |
|---|---|---|---|
| 不覆盖 | 保持不变 | 两侧相同 | 还没有改变对照因素 |
| 无关区域 | 保持不变 | 源土与浅沟示意不变 | 这次放置没有覆盖所选源土，需要修订位置 |
| 指定源土表面 | 保持不变 | 在这个预设情境中，从该处进入浅沟的土壤示意减少 | 这一模型给了我们试行源土覆盖的理由；不能解释整条溪流的全部变化 |

两次回放使用同一雨动画、相同时长、同一初始土壤示意、同一水路。学生可逐步查看，动画不成为阅读时间考试。这里没有数值浓度、净化率、饮用或健康判断，也不让刚放下的幼苗拥有成熟植被作用。实际水体仍保持当前记录的外观；任何后续变化必须另有日期、地点和来源的观察。

目标区绑定`loc.bare_bed`内的裸土表面；浅沟接`east_runoff_junction`，主溪流仍从`loc.upper_stream`经汇流口、主桥到南侧池塘。目标区与无关区的碰撞体、可摆放表面、禁止阻断的水路和通行区域，由同一灰模几何生成并随`layoutVersion`冻结。当前v3坐标仍是待灰模验证的提案，不能把JSON中的语义区域当成已经确定的工程尺寸。

## 对白如何接到场面，而不代替学生行动

配套JSON为每个节点列出可播放的ID及条件。`performed`只用于角色音轨与字幕，`optional_learner_support`是学生可选的示例，不自动变成玩家已经说过的话。说完一句话、字幕结束、跳过或重听均不提交环保行动。

- 桥位使用T03.014–015及T03S.001–006/029–030；001–002由任一合法清理节点触发全局待呈现反馈，不局限于桥位入口；瓶子消失而水色仍褐的画面立即可见。角色未到位的对白保留到实际到场后，保存与离开不必等待。029只在瓶子还在时出现。006只在学生选择“询问颜色能说明什么”的真实追问意图后回应，不分析自由英语关键词。
- 中性问询与直接归责各有入口。T03S.012后仍能听到007、009、011，不靠道歉解锁事实；007、009、011各自持久记录已提供状态；后续访谈始终能打开完整三句字幕，跳过前场或中途恢复都不会丢失007。已经读过的陈述可重看，不重复记成新证据。
- 模型的T03S.020仅适用于预设的“源土示意减少”；021只供已放在无关区域且无差异时使用，无覆盖基线不使用该句。022只响应学生主动选择移动已有盖片，不在试验结束时自动播放。建议只是学生表达支架，不自动证明其理解。
- T03S.031需用途和位置已核对；032表示选择实施，033表示材料操作开始；只有实际完成放置后才可以提供034。
- 说明环节按当前事实挑选024、034–037；036另外要求用途和位置尚未确认，已核对后保留提案者不再被告知“尚未决定”；既没有经历也没有相应素材时保持空白，允许学生自己描述。T03S.035–037属于现有场景约定里的固定变体，索引规范化时保留其语义与ID。

角色必须实际到达说话位置。Mei从温室走到裸土区；Sam在该区的工具桌提供盖片；Noor与Rowan沿同一可行走路径同行。比较场面先调度人物走到位，才播放面向材料的对白。不能靠切镜头让人物瞬移，也不让对话层覆盖学生自己的讨论。听力关闭或配音缺失时，同样信息由字幕可读完成。

## 四种记录与事件合同

JSON声明52个持久字段；状态按世界、证据/访谈、模型、实施草稿、作品、回访分开。图节点是“当前在做什么”，不等于教学达成度。字段中的`observed`表示资料已打开或观察已记录，不能解释为学生已经理解。

| 事件族 | 提交时机与结果 | 必须保持的边界 |
|---|---|---|
| `*_RECORD_OPENED / *_RECORD_SHARED` | 已显示有地点、日期和来源的材料后，保存对应来源 | 同伴共享不是本人到访；不给未听到的角色心理 |
| `LITTER_REMOVED` | 瓶子实际进收集容器后写一次 | 不改水色、不宣称水质改善 |
| `TRIAL_REQUESTED / TRIAL_COMPLETED` | 前者记录正在播放；后者保存模型版本、条件、位置和结果 | 模型完成不写当前山谷；取消或中断不生成结果 |
| `PROPOSAL_SAVED / PURPOSE_AND_POSITION_CONFIRMED` | 提案关联实际试验ID；核对后标明允许试行的用途和位置 | 文字说明可为空或保留疑问；不以关键词判断科学理解 |
| `MATERIAL_* / DRAFT_* / COVER_INSTALLED` | 先检查、搬运、摆放，再检查目标表面、方向及水路/通行不被堵，最后确认 | 草稿物件与正式完成状态分开；不能仅因播放034就安装 |
| `EXPLANATION_*` | 三槽图文/录音明确保存成版本，空槽允许 | 可读草稿、已保存和已评价分开；旧版本不随现场改动 |
| `RETURN_CARD_SAVED` | 保存地点、何时、待问问题、观察内容、参与者和现实联想 | 只写`planned`；本批无事件写入后续观察集合 |
| `PAUSE_SAVED / UNRESOLVED_SAVED / FINISH_SAVED` | 当前事实、作品与恢复点原子保存后进入终点 | 三种终点均不表示生态问题已经解决 |

每个命令包含稳定`eventId/commandId`和`expectedRevision`。一个已接受事件、全部字段改变、新节点、状态版本和必要媒体引用必须同时提交。相同ID且事件名称、内容、模式版本一致的重试返回第一次结果；同ID异内容拒绝；不再清一次垃圾、搬出第二块盖片、增加第二条同一试验。旧版本冲突先读最新存档，不悄悄重放用户操作。

音频/画面文件先持久化，再发布引用它的作品版本。引用源只能是已记录的观察、实际完成试验、实际安装后的画面或带明确来源的公共素材。录制未完成就显示“待保存”，不能把临时内存里的画面称为存档。

存储失败时不提交新节点，也不宣布保存成功；显示重试、保留当前界面和导出可恢复资料的入口。重试沿用原命令ID。刷新只恢复最后一个完整版本，不读半条日志。中断的模型回放先以系统恢复事件回到可重新试验状态，保留此前已完成试验，不生成本次结果。每次试验有独立运行ID；晚到的动画结束消息必须匹配当前运行，不能把被取消的上一轮误写成新一轮结果。

正常暂停保留搬运或摆放草稿及其变换；重新打开时从最近的已保存安全地点开始，明确提示继续路线，材料实例只能有一个。布局版本不一致或草稿姿态失效时保留只读记录，由用户明确选择恢复到工具桌；不可默默移动地标或覆盖旧作品。这里的恢复选择是实际冲突处理，不是日常继续课堂必须经过的审批。

## 同屏课堂的基线

首批明确采用一台电脑的小组协作、教师投屏和单人预写伙伴三种模式。没有默认账号、线上房间、实时语音识别或多端同步。

小组可把观察、询问、操控、记录交给不同成员并轮换，角色职责不固化成按钮顺序。同一公共记录可展示给同伴，界面标明谁共享了什么；英语在同伴间真实发生，应用只保存主动提交的资料和作品。投屏时教师可让各组先讨论，再由代表指图、说明、摆放；教师推进不是系统给全班判“已掌握”。

单人模式使用有范围的预写回应和意图选项。例如Mei区分“询问她看到什么”与“直接归责”，两条路都能获得观察事实；自由文字保留为学生表达，不被假装成NPC已经理解。任何机器未能理解的自由回答都不能阻断通行。

## 第一批资产边界

| 制作对象 | 本批必须具备 | 验收时能看见什么 |
|---|---|---|
| 同一个地形与主桥 | 桥、岸线、桥石间的瓶子、东岸可走路径；同一桥位前后记录机位 | 地图、近景、回桥结尾的位置和朝向一致；无第二座替身桥 |
| 连续水路与裸土 | 上游观察点、东侧裸土、浅沟、汇流口、到桥的可见连续关系；模型用同一几何来源 | 从桥向上游/裸土走时方向成立，浅沟不会穿模或断开；模型范围可辨认 |
| 温室及远景地标 | 温室外立面与Mei所在门口；树屋、工坊、花环等既有位置的可辨轮廓 | 大地图缩近仍是同一建筑；不用制作本批不可进入的全部室内 |
| 四位角色 | Noor、Rowan、Mei、Sam的统一比例、近景皮肤/服装、手与视线；行走、转身、指物、听和说的基础表演 | 手指向真实对象，同行者在转弯处等候，表演可被英语阅读时间打断 |
| 操作道具 | 一块盖片、工具桌、核对标签、抓握/支撑点、可用和禁放区域；同一材料的桌上/搬运/草稿/安装状态 | 搬运到放置有连续实体；撤销和保存不会复制物件；位置不合时解释具体原因 |
| 记录与作品 | 带日期机位的桥位记录、同轮上游记录、路径观察、Mei访谈字幕；三画面编辑与回访卡 | 历史图像保留来源，未发生的安装/清理画面不能作为已经做过的成果出现 |
| 光照与声音 | 同一回访时段的曝光/色温；木石土脚步、局部流水、工具触碰；已审校对白的试配音 | 角色与建筑的光向一致，换镜头不换季节；同一句可重听、配音可关闭 |

PBR材质、玻璃、接触阴影、近景纹理与角色表演是本批真实质量对象；“用了Three.js”不是精良渲染的验收结果。先以目标设备走通镜头、曝光和空间比例，再冻结纹理分辨率、面数、实例化与光影方案。现有概念图和灰模资源不充当最终模型。

本批不制作完整温室室内、十二章全部道具、季节全套植被、成熟植被模型、多端协作、实时视频剪辑或开放域角色AI。它们属于后续明确批次；概念地图的其余地标仍应按共同布局出现，不能任意删改世界比例。

## 首批完成的验收方式

1. **完整走一遍。** 学生能从桥位发现差异，到三处资料和Mei，做一次同条件比较，选择实施或保留提案，解释给别人，再回桥保存。教师能指出每次行动为什么发生，不依靠讲解一个隐藏流程。
2. **三种合法结局。** 仅观察并留下问题、已试验保留提案、已实施待复查，均能结束并重新打开；结尾对白与图片只引用实际经历。
3. **有意制造中断。** 在试验动画、搬运、摆放确认、图片/音频保存时中断，再重开；没有多出一个结果、第二块材料或已恢复的清水。对同一命令重试两次，领域记录只增加一次。
4. **验证模型边界。** 三个放置情境得到文中固定结果；外区无差异能正常修订或结束；仅改位置、不改基线。教师与学生都能辨认“这里显示的是模型”，不能把它误当测得的河水指标。
5. **在实际课堂设备走读。** 至少覆盖目标投屏设备和一台学生可能使用的较低配置设备；记录首屏等待、操作响应、帧时间和文字可读性后再定质量档。声音不可用时仍能完成，慢读、暂停和减少动态效果不改变故事事实。
6. **看学生产出，而非只看操作完成。** 从图文/录音中人工检查其判断、证据、限制与下一步是否能让同伴理解；应用的保存状态不能代替这项教学判断。

本稿把第一批制作的入口、有限模型、事件、退出和资产范围定下来。审美、趣味、真实渲染和教学效果仍需样板证据；补齐这些合同允许开始正式做第一条旅程，不等于已经证明全部十二章可批量复制。

## 独立语义复核后的七项收口

1. 清理无论发生在`bridge_record`、`bridge_hook`还是`fieldwork`，立即保持“瓶子已移走、水色未变”的同景反馈；001/002走全局待呈现队列，角色在桥位且停靠时播放并保存提供记录。
2. 006只响应`ASK_WATER_COLOUR_QUESTION`意图事件；没有追问不预先代答。
3. 022只响应`MODEL_REPOSITION_REQUESTED`，需模型空闲且已有一次实际放置位置；021还须`latestPosition=unrelated_zone`且结果无差异，`no_cover`不适用。
4. Mei的007/009/011分别保存提供位；`MEI_INTERVIEW_RECORDED`仅看三位均为真。后续节点始终提供三句完整字幕，恢复时无需猜之前的音频是否播完。提供位不代表理解或复述正确。
5. 离开`fieldwork`的非终止转场和上游/路径现场观察均要求`navigation.targetLocation=null`；移动中不能进入访谈或说明。暂停/未解保存仍沿既定恢复规则。
6. 玩家到桥即可写回访卡；026/028在各自角色实际到场且该句尚未提供时补播，保存、结束不等他们。已提供记录防止恢复后机械重播。
7. 036要求`plan.purposeAndPositionConfirmed=false`。该位由用途/位置确认写真，保留提案不清除它；保存新提案才重置。已核对却未实施者自由表达，不强塞一条不真实的模板。

这些是设计合同修订，不是运行过的游戏行为。对白总表不增加任何ID。


---

来源：[language-notes-v6.md](../../research/language-notes-v6.md)

# v6原创英语与新增核对记录

2026-11-07。正文对白为项目原创，教材和词典不被列为这些整句的作者。已有v3词汇/句式来源继续可用；本轮新增下列有限核对，不能据此声称全部新台词获得权威机构审校。

| 来源 | 实际阅读范围 | 本次使用 |
|---|---|---|
| [British Council：Modals—deductions about the present](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modals-deductions-about-present) | 官方正文解释及相应例句；不采用用户评论 | T02区分可能性与确信程度；不能因未看到某物就自动使用can't |
| [BBC Learning English：Indirect questions](https://downloads.bbc.co.uk/worldservice/learningenglish/grammarchallenge/pdfs/gc_36_indirect_questions_explanation.pdf) | 2页PDF提取正文，含问句结构说明和表格 | T03请求信息的间接问句内部用陈述语序；不把直接问句一概判不礼貌 |
| [Cambridge：look after](https://dictionary.cambridge.org/dictionary/english/look-after?topic=treating-and-caring-for-people) | 官方搜索索引的照料义与例句；无参数页直开403 | 曾用于T09.006旧稿；v6.1改为更直接的接话，此项保留为研究记录，不再标作当前台词依据 |
| [Cambridge：creak](https://dictionary.cambridge.org/us/dictionary/english/creak) | 官方搜索索引词条的名词、动词释义；未采用外部语料引句 | T02区分木板吱呀与轻碰撞，声学描述需和音频一致 |
| [Cambridge：help](https://dictionary.cambridge.org/dictionary/english/help?q=help%21) | 官方搜索索引help yourself及give/take义项 | T09自取语境，说明欢迎卡能回应来宾实际疑问 |
| [Cambridge：for good](https://dictionary.cambridge.org/dictionary/english/for-good) | 官方搜索索引的永久义、译义及难度标示 | T11自然对白的扩展理解表达，配短释义，不列为所有学生必会输出 |

上表只支持相应词义或结构。未下载词典发音作为课件配音，没有复制网页大段例句。T06教材BK02仍为部分正文，完整原文和学校印次待核对；不因本轮对白丰富就抹去该限制。

## 全章语言使用约定

每章主要追求一种真实交流结果，其余表达可借助字幕、同伴、图片或短释义。LEARNER台词是表达范例，学生可以用更短、更自然于自己的说法。复杂NPC句子用于理解与体验，不自动列入必会输出词表。初三不直接等同CEFR某一级。

| 情境 | 原台词中可能需要帮助的表达 | 按需理解支持；不是强制替换剧情 |
|---|---|---|
| T01.012 Sam收回帮助 | Show me your idea first. | Let me see what you want to try. 他收回手，先等作者做；不要求学生复述 |
| T07.004 Iris描述音乐 | I kept waiting for the next note. | I was still waiting to hear what came next. 结合乐段实际停顿理解 |
| T08.011 Iris后悔 | I should have known. | I feel I ought to have understood it earlier. 可再用中文解释“事后觉得当时应该知道” |
| T08.015 承担具体责任 | I should have checked… | Next time, I'll check first. 另说明原句表达对过去的反思 |
| T11.001 看无声片 | for good | permanently；中文“永久地”，不是“出于好意” |

上表释义为内部编辑支持，for good的永久义另经词典条目核对；词义核对不等于原创整句取得权威机构认证。统一保留英式拼写favourite、colour、realise、practise等；演员可有自然可懂的不同口音，不以口音设定能力或身份高低。

正式录音前按稳定台词ID逐句检查语义、搭配、人物知识范围、字幕长度与听辨难点；修改一句需同步脚本、字幕和音轨。内部编辑审阅已指出并修正若干真实搭配和指代问题，详见[v6审阅处理](review-resolution.md)。实际教师审校与学生试读仍未完成。
