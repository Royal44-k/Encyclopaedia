// Original project dialogue from docs/design/v6/episodes/T01.md.
// Learner examples below are optional supports, never auto-spoken as the learner.
const rows = [
  ['T01.001', 'SAM', 'That one nearly escaped. Here.', '差点让它溜走了。给你。'],
  ['T01.002', 'IRIS', 'Turn it over. The other side looks different.', '翻过来看看。另一面看起来不一样。'],
  ['T01.003', 'SAM', 'You can try things before you give them a name.', '先试试看，不急着给它起名字。'],
  ['T01.005', 'SAM', "Try this joint. It turns, but it won't hold a heavy piece.", '试试这个连接件。它能转动，但承不住太重的部件。'],
  ['T01.006', 'IRIS', 'Wait. Let me look before you tell me.', '等等，先让我看看，再告诉我。'],
  ['T01.007', 'IRIS', 'What should I look at first?', '你想让我先看哪一部分？'],
  ['T01.009', 'IRIS', 'Oh, I was looking at the shape. Show me the movement.', '哦，我刚才在看形状。让我看看它怎么动。'],
  ['T01.010', 'SAM', 'If we put this here—', '要是把这个放在这里——'],
  ['T01.012', 'SAM', 'Sorry. Show me your idea first.', '抱歉，先让我看看你的想法。'],
  ['T01.013', 'IRIS', 'Do you want people to understand it straight away?', '你希望别人一眼就看懂它吗？'],
  ['T01.015', 'IRIS', 'Then give them one thing to notice.', '那就留一个值得他们留意的地方。'],
  ['T01.016', 'SAM', 'Where would you like to try it?', '你想把它放到哪里试试看？'],
  ['T01.018', 'IRIS', "It looks different when I'm standing here.", '站在这里看，它又不一样了。'],
  ['T01.019', 'SAM', 'Shall I leave the title blank for now?', '作品名要不要暂时留空？'],
  ['T01.020', 'NARR', 'The empty label is still beside it. Someone has stopped to look.', '空白展签还放在旁边。有人停下来观看。'],
  ['T01.022', 'IRIS', 'Let me try another angle before I answer.', '回答之前，让我换个角度看看。'],
  ['T01.023', 'SAM', 'Would you like a suggestion, or a little more time?', '你想听个建议，还是再自己试一会儿？'],
  ['T01.025', 'IRIS', 'We can show it without a title.', '没有名字，也可以展出。'],
  ['T01.026', 'SAM', "I'll keep the pieces together until you decide.", '我会把这些部件放在一起，等你决定。'],
  ['T01.027', 'IRIS', "There's one empty stand by the path. What are we putting on it?", '小路旁还空着一个展台。我们放什么呢？'],
  ['T01.028', 'SAM', 'I saved these pieces when we cleared the workshop. Have a look.', '上次整理工坊时，我留下了这些零件。来看看。'],
  ['T01.029', 'IRIS', 'A window? I keep looking through the middle. Is that what you had in mind?', '一扇窗？我一直在看中间的空隙。你原来是这样想的吗？'],
  ['T01.030', 'IRIS', "A flowerpot? Wait, there's no room for a plant. What am I missing?", '花盆？等等，上面没有种植物的地方。我是不是漏看了什么？'],
  ['T01.031', 'IRIS', 'It reminds me of a tiny tree. But you turned it this way for a reason, right?', '它让我想到一棵小树。不过你把它朝这边摆，是有原因的吧？'],
  ['T01.032', 'IRIS', 'Oh! I was watching the outline. The whole shape changes when it turns.', '哦！我刚才只顾着看轮廓了。转起来时，整个形状都在变。'],
  ['T01.033', 'IRIS', "I missed that side. Now I want to walk around it before I decide what it is.", '刚才没看到这一面。现在我想绕着看一圈，再想它到底是什么。'],
  ['T01.034', 'IRIS', "All right, I won't give the answer away. I'll ask the next person what they see.", '好，我先不说答案。我会问下一个人，看到了什么。'],
  ['T01.035', 'SAM', 'That ring held a flowerpot together. The pot broke, but I kept the ring.', '这个圆环原来箍着一个花盆。花盆碎了，我把圆环留了下来。'],
  ['T01.036', 'SAM', 'I used to keep screws in that tin. They kept rolling under the bench.', '我以前把螺丝放在那个铁罐里，免得它们滚到工作台下面。'],
  ['T01.037', 'SAM', 'That branch was left after the trees were pruned. Iris liked the crooked end.', '修剪树木时留下了这根枝条。Iris 喜欢它弯曲的那一头。'],
  ['T01.038', 'IRIS', 'People coming along the path will see this side first. Let me stand where they would.', '沿小路走过来的人，会先看到这一面。我站到他们的位置看看。'],
  ['T01.039', 'IRIS', "Here, people can walk around it. The flowers change what I notice first.", '在这里，人可以绕着它走。旁边的花也会影响我最先注意到什么。'],
  ['T01.040', 'IRIS', "Right. I'm your first visitor. What would you like me to try?", '好了，我是你的第一位观众。你想让我试着怎么欣赏它？'],
  ['T01.041', 'IRIS', "I'll wait for it to turn before I tell anyone what I see. I nearly missed the best part.", '我得等它转过来，再告诉别人我看到了什么。刚才差点错过了。'],
  ['T01.042', 'IRIS', "I'll bring the next visitor round to this side. I wonder if we'll see the same thing.", '下次有人来，我会带他绕到这一边。不知道我们想到的会不会一样。'],
  ['T01.043', 'IRIS', "You can tell me your idea later. I want to hear what someone else sees first.", '你的想法可以一会儿再告诉我。我想先听听别人看到了什么。'],
  ['T01.044', 'IRIS', "I've got an old biscuit tin at home. I keep paintbrushes in it. It already has another job.", '我家也有个旧饼干罐。我把画笔放在里面，它已经有新用途了。'],
  ['T01.045', 'SAM', "Then keep using it. We don't have to put everything on a stand.", '那就接着用吧。用不着把每样东西都搬上展台。'],
  ['T01.046', 'IRIS', "Will you leave me a few words for the label? Something you'd like a visitor to notice.", '给我留几句话写在展签上吧？说说你想让观众注意到什么。'],
];

export const workshopLines = Object.freeze(Object.fromEntries(rows.map(([id, speaker, english, chinese]) =>
  [id, Object.freeze({ id, speaker, english, chinese, origin: 'project_original', source: 'T01.md' })])));

export const workshopCues = Object.freeze({
  entry: ['T01.027', 'T01.028'],
  make: [],
  pivotHelp: ['T01.005'],
  share: ['T01.006', 'T01.007'],
  movement: ['T01.009'],
  static: ['T01.022'],
  question: ['T01.013', 'T01.015'],
  display: ['T01.016'],
  changedView: ['T01.018'],
  title: ['T01.019'],
  unnamed: ['T01.025'],
  help: ['T01.023'],
  interrupted: ['T01.010'],
  ownIdea: ['T01.012'],
  stored: ['T01.026'],
  // Only when a blank label and an actual visitor are both visible.
  visitorAtBlankLabel: ['T01.020'],
});

export const workshopStory = Object.freeze({
  firstLook: {ring:'T01.029',tin:'T01.030',branch:'T01.031'},
  history: {ring:'T01.035',tin:'T01.036',branch:'T01.037'},
  response: {shape:'T01.033',movement:'T01.032',question:'T01.034'},
  farewell: {shape:'T01.042',movement:'T01.041',question:'T01.043'},
  firstImpression: {ring:'a window',tin:'a flowerpot',branch:'a tiny tree'},
});

export const workshopSupports = Object.freeze({
  making: [
    { english: 'This part is made of metal.', chinese: '这一部分是金属做的。', when: 'Only point to a metal part.' },
    { english: 'I used an old ring and a piece of cloth.', chinese: '我用了一个旧圆环和一块布。', when: 'Change the materials to match your own work.' },
    { english: 'Can these two pieces move together?', chinese: '这两个部件能一起动吗？', source: 'T01.004' },
    { english: 'Could I try my idea first?', chinese: '能让我先试试自己的想法吗？', source: 'T01.011' },
  ],
  movement: [
    { english: 'This part. I wanted it to move.', chinese: '这一部分。我想让它动起来。', source: 'T01.008' },
    { english: 'The ring turns, while the base stays still.', chinese: '圆环转动，底座保持不动。', when: 'Only if the ring really turns.' },
  ],
  shape: [
    { english: 'Look at it from this side. What does it remind you of?', chinese: '从这边看看。它让你想起了什么？', source: 'T01.021' },
    { english: 'You noticed the shape. I was thinking about the space inside it.', chinese: '你注意到了形状。我想的是它里面的空间。', when: 'Use only if this matches your intention.' },
  ],
  question: [
    { english: 'Not all of it. I want them to ask.', chinese: '不必全部看懂。我想让他们提问。', source: 'T01.014' },
    { english: 'There is more than one way to look at it.', chinese: '看它的方式不止一种。' },
  ],
  display: [
    { english: 'Near the path, where people can see this side.', chinese: '放在小路旁，让大家能看到这一面。', source: 'T01.017' },
    { english: 'Please ask me before borrowing it.', chinese: '借用之前请先问我。' },
    { english: 'I would like to keep working on it.', chinese: '我还想接着做。' },
  ],
});

export const workshopMaterials = Object.freeze({
  ring: { name: 'Old metal ring', chinese: '旧金属圆环', material: 'metal', note: 'Light enough for this turning joint. The centre stays open.' },
  tin: { name: 'Empty tin', chinese: '旧铁罐', material: 'metal', note: 'This piece needs the fixed joint; it is too heavy for the small turning joint.' },
  branch: { name: 'Pruned branch', chinese: '落枝', material: 'wood', note: 'An uneven shape with two different sides.' },
  cap: { name: 'Bottle cap', chinese: '瓶盖', material: 'metal', note: 'A small detail you can point out to a visitor.' },
  cloth: { name: 'Cloth offcut', chinese: '余布', material: 'fabric', note: 'A soft edge, hanging from its attachment.' },
  fan: { name: 'Folded card', chinese: '折叠旧卡纸', material: 'paper', note: 'Folded edges catch the light as the work turns.' },
});

export const workshopLanguageSources = Object.freeze([
  { title: 'Oxford Advanced Learner’s Dictionary · joint (object connection)', url: 'https://www.oxfordlearnersdictionaries.com/definition/english/joint_2', scope: 'Read the object-connection sense and joint between construction; not body-joint teaching.' },
  { title: 'Language Portal of Canada · made from / made of / made with', url: 'https://our-languages.canada.ca/en/writing-tips-plus/made-from-made-of-made-with', scope: 'Read the official usage note: made of identifies material. Supports the optional metal-part sentence, not the whole dialogue.' },
  { title: 'Cambridge Dictionary · joint', url: 'https://dictionary.cambridge.org/dictionary/english/joint', scope: 'Connection sense; official search index only, page returned 403.' },
  { title: 'Cambridge English Grammar Today · made of / from / out of / with', url: 'https://dictionary.cambridge.org/grammar/british-grammar/made-of-made-from-made-with', scope: 'Official search index; page returned 403. Grammar support, not authorship of project dialogue.' },
]);
