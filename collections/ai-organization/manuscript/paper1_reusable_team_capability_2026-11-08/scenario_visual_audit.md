# 图示叙事与日常交接情境审查

日期：2026-11-08。只读审查范围：manuscript_zh.md、manuscript_en.md、report_casebook.md及build_figures.py。未联网扩展，未改正文、脚本或图文件。本记录核查的是文本与构图语义；以下替换尚未重新渲染，应用后仍须检查字号、换行及拥挤程度。

## 结论

三图的基本分工清楚：图1还原报告动作，图2展示作者设计，图3提出未来比较。主文也已区别腾讯p37的报告叙述、p73的假设新同事情境与作者设计示意。无需再把三个图讲成一条已经得到验证的因果链。

最值得修改的是图3条件标签与正文设计的对应，以及图2“可调整部分”目前不够具体。另有两处中英含义可更精确：测试/preview和失败样例/failed example。新增情境不宜继续冒充腾讯案例细节，应与报告场景视觉分隔。

## 两个可直接选用的日常情境

以下均为**作者设计示意，不是腾讯报告事实，不是观察数据**。情境中的结果只是设定，不能据此主张其发生频率或普遍性。每段中文说明均在60–100字符内；计数包括标点、不含小标题。

### 情境A：纪要生成了，还不能直接外发

**English heading: The notes are generated, but not ready to send**

**中文说明（86字符，80个汉字）：** 项目助理把内部周会纪要工具交给同事。同事用它整理客户沟通记录，顺利生成了保留内部简称和未定方案的纪要。输出可供内部跟进，却不宜原样外发；接收者仍需按读者核对内容与确认状态。

**English:** A project assistant shares a tool for internal weekly meeting notes. A colleague uses it to summarize a client discussion and successfully generates notes that retain internal shorthand and undecided proposals. The output can support internal follow-up, but is not ready to send unchanged. The recipient still needs to check the content and what has been confirmed for the intended audience.

**叙事用途：** 解释“能运行≠适用”。这里不是把运行报错或所有模型错误重新命名为知识转移失败；同一输出可能适合内部跟进，却不适合直接外发。最自然的位置是第2节现有简报例子之后，或作为图2旁的一则独立小注。不要再加虚构员工姓名、公司、工时和效果量。

### 情境B：个人补丁还没到下一班

**English heading: A personal fix has not reached the next shift**

**中文说明（82字符，75个汉字）：** 一位客服发现共享回复工具漏写退换货条件，便在自己的副本中补上。下一班同事仍从旧入口运行，遗漏再次出现。需要核查改动，并让后续使用者取得更新版，而不只是确认有人改过。

**English:** A support agent notices that a shared reply tool omits return and exchange conditions and adds them to a personal copy. The next shift still opens the old version, so the omission recurs. The change needs checking and must reach later users; confirming that someone edited a copy is not enough.

**叙事用途：** 解释“个人修改≠团队获得修订”。关键观察不是提交次数，而是修改经过核查后，下一位同事实际拿到什么版本。最自然的位置是第4节“修改回传只是开始”的段落附近，或图2返回箭头旁。此例不要求所有修改合并成唯一版本；岗位变体仍可保留，但要能被对应使用者找到。

两则情境适合择位插入或合成一只小侧栏，不宜同时挤进现有图2方法表，削弱主案例。正文若已足够长，也可仅用于图旁说明而不扩写两个完整案例段落。

## 图2：具体字段与中英文对应

位置均为build_figures.py的fig2()。下面区分需对齐的文字与可保留的简写。

| 位置 | 现有内容与问题 | 建议中文替换 | 对应英文替换 |
|---|---|---|---|
| “交付样例”第二行 | “通过样例/失败样例”与“acceptable/failed example”容易把输出不合格与程序运行失败混同 | 配合格与不合格的输出样例 | Show acceptable and unacceptable outputs |
| “边界判断”第一行 | 中文是“宣布、测试与正式发布”，英文是“announcement, preview and release”；preview未必等于测试，两稿不宜默认为同义 | 区分宣布、测试与正式发布（可保留） | Separate announcement, testing and release |
| “修改与维护”第二行 | 图注称含“可调整部分”，但当前只说“岗位变体”，没有让读者看到一个具体调整入口 | 主题与时间窗可调；其他改动可协商 | Adjust topic/window; discuss other changes |
| 底部返回箭头说明 | 现有“更新或保留变体”省略了主文要求的核查；英文还省略中文“决定”的含义，容易画成提交即更新 | 回传问题与改动；核查后更新共享材料或保留岗位变体 | Review returned issues and changes; update shared material or keep role-specific variants |

上述“主题与时间窗”只是新闻简报的设计示意，不能声称腾讯原始Skill已有这些选项，也不应升格成所有工作的必填字段。底部仍保留变体，避免把“共同修订”画成强制统一。

可以保留的对应：用途与范围/Purpose、输入与访问/Inputs、运行办法/Operation、交付样例/Examples、边界判断/Limits、修改与维护/Maintenance作为短标签大体准确，同行内容补足其意义。英文标签较短本身不是错误，不必仅为逐字对应而扩大列宽。采购或法律判断的排除、未读取材料标记、工具与权限确认、日期和不确定性均保持了设计示意的边界。

“原制作者→方法页→接收同事”的箭头仅适用于作者示意的一次交接，不能倒用来解释腾讯案例的最初发明者。现有副标题“非报告中的原始Skill”应保留。

## 图3：条件、标签与构图语义

位置为build_figures.py的fig3()；对应主文第5节和CAPTION3。

### 1. A组不能简写成没有任务说明

主文A组明确包含“提示词和基本任务说明”，图中当前却写“仅提供提示词/Prompt only”。这会让只看图的读者误以为A组连基本任务信息也没有。

- 中文组内文字建议分两行：`提示词` / `与基本任务说明`。
- 英文建议分两行：`Prompt + basic` / `task instructions`。
- CAPTION3的首句也可相应写为“A为提示词与基本任务说明”；英文“A receives a prompt and basic task instructions”。这是与主文对齐，不是新增实验成分。

### 2. C组应显示它是一项组合支持

主文列出交接、适配和维护支持。中文图只列交接与维护，英文“plus handover support”又进一步隐去了维护；短标签可作为总称，但会削弱B–C比较的实际含义。

- 中文建议三行：`可运行方法` / `加交接、适配` / `与维护支持`。
- 英文建议三行：`Runnable method` / `with handover, adaptation` / `and maintenance support`。
- 图注同步保留“交接、适配和维护/handover, adaptation, and maintenance”三个组成。
- 继续保留“组合干预/bundled intervention”的图注限制，不能把B–C效果专门归于方法页或某个字段。

### 3. 预算相同指上限，不是实际投入已经相等

主文明确“相同资源上限，实际花费可以不同”。当前图中“equal support budget”可理解，但没有显出这一关键限定。

建议替换整行：

**中文：** 固定基础模型、源方法与任务池；设置相同的支持预算上限

**English:** Hold model, source method and task pool constant; set equal support-budget ceilings

不得据这行省略制作说明、答疑和维护的实际时间记录。

### 4. 变化条件不应只画成第三个固定阶段

图中“首次使用→延后再用→单独改变条件”的实线箭头，可能使读者以为时间与条件变化总是绑定。主文实际要求输入变化与工具版本变化分别操纵，并设置同期未变化任务、随机或平衡顺序。

最小调整建议：保留首次到延后的时间关系；去掉“延后再用”指向“单独改变条件”的第二支箭头，把第三列标作一项独立比较：

- 中文标题：`变化对照`；说明两行：`输入变化或版本变化` / `均与同期未变任务比较`。
- English title: `Change comparisons`; two lines: `Input or version changes` / `Compare with unchanged tasks`。
- 正文和图注继续承担“同期与顺序平衡”的完整说明；图中不能展示差异方向或虚构结果。
- 中文CAPTION3的“构成不同观察时点”建议改为“构成不同测量与比较条件”，避免将输入/版本对照等同一个更晚时点。英文现有“Assessments cover…”不必强行加入stage。

### 5. 过程和投入标签：可保留，但有两项可选收紧

“分别观察运行、适用范围判断与修订回传/Track execution, scope judgements and returned revisions separately”含义相符。不过“回传”本身不保证修订经过核查并到达后续使用者。若希望图能独立传达这点，可用：

- 中文：`分别观察运行、适用判断与修订是否进入后续使用`
- English: `Track execution, scope judgments and whether revisions reach later users`

现有“制作者与接收者的总投入/Total effort on both sides”双语一致。若研究实际允许第三位维护者，则应与正文“所有参与者”定义对齐，改为“交接与维护参与者的总投入/Total effort across contributors”，并保持准备、答疑、适配和维护的列举。若维护由原有双方承担，原标签可保留，不必为假想第三人扩展设计。

其余已对齐：拟议研究而非实测数据、首次使用与延后再用、一次只改变输入或工具版本、保留放弃尝试、盲于分组评分、公开仓库不足以提供行为结果。图中的A/B/C字母应始终对应同一组，不将“版本变体”另记为B/C以免混淆。

## 使用边界

本轮只提出两则设计情境及图文对齐建议，没有产生新的文献结论、腾讯案例事实或实验结果。最优先处理的是A组说明、C组组成、变化条件的比较含义；其余属于让图能独立阅读的精确化。所有建议仅写在本文件，生产文件未改。

