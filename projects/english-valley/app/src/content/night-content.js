// Exact original NPC dialogue from docs/design/v6/episodes/T02.md.
// Learner examples below are optional and are never played as learner speech.
const rows = [
  ['T02.001','ROWAN','There it is again.','又响了。'],
  ['T02.003','ROWAN',"I heard it near the stairs. I couldn't see what moved.",'我在楼梯附近听见了，但没看见什么东西动了。'],
  ['T02.005','ROWAN',"Let's listen from the other side.",'我们去另一侧听听。'],
  ['T02.006','MEI','The shadow looked much larger from my doorway.','从我门口看，影子大得多。'],
  ['T02.008','MEI','Here. I thought it had a long neck.','就在这里。我还以为它有一条长脖子。'],
  ['T02.010','SAM',"I hung a moving piece there this afternoon. I didn't hear it from inside.",'我今天下午在那里挂了个会动的装置。在屋里没听见这个声音。'],
  ['T02.011','ROWAN',"We know something moved. We haven't explained every sound yet.",'我们知道有东西动了，但还没解释所有声音。'],
  ['T02.013','SAM',"I'll hold it. Tell me what changes.",'我来固定住。告诉我有什么变化。'],
  ['T02.015','ROWAN',"Keep that part still. I'm going to listen by the stairs.",'先让那个部件保持不动。我到楼梯边听听。'],
  ['T02.016','SAM',"This piece touches the metal when it turns. I'll move them farther apart.",'这个部件转动时会碰到金属片。我把它们移开一点。'],
  ['T02.018','ROWAN','We can explain the tapping now. What would you check next?','现在我们能解释轻敲声了。接下来你想检查什么？'],
  ['T02.020','NARR','The tapping has stopped. A quieter sound remains.','轻敲声停了，还有一种更轻的声音。'],
  ['T02.022','ROWAN',"Let's mark where we listened. We can return here.",'把我们听声音的位置记下来。以后可以回来。'],
  ['T02.023','SAM','The board makes that sound when I step here. Listen again.','我踩在这里时，这块木板会发出那个声音。再听听。'],
  ['T02.025','MEI',"Next time, I'll look from more than one place.",'下次我会换几个位置看看。'],
  ['T02.026','SAM','May I borrow your moving piece for this evening?','我今晚可以借用你的活动作品吗？'],
];
export const nightLines = Object.freeze(Object.fromEntries(rows.map(([id,speaker,english,chinese])=>[id,Object.freeze({id,speaker,english,chinese,origin:'project_original',source:'docs/design/v6/episodes/T02.md'})])));
export const nightCues = Object.freeze({
  entry:['T02.001','T02.003'], otherSide:['T02.005'], doorway:['T02.006','T02.008'],
  askSam:['T02.010'], hold:['T02.013'], stillIncomplete:['T02.011'],
  stairsWhileHeld:['T02.015'], separate:['T02.016'], tappingOnly:['T02.018'],
  quieterSound:['T02.020'], unresolved:['T02.022'], board:['T02.023'],
  reflection:['T02.025'], loanRequest:['T02.026'],
});
export const nightSupports = Object.freeze({
  observation:[
    {english:'I heard tapping. Then something creaked.',chinese:'我听见轻敲声，接着有东西吱呀响。',when:'Both sound types were actually presented.'},
    {english:'I heard it near…',chinese:'我在……附近听见了。'},
  ],
  inference:[
    {english:'It might be something in the wind.',chinese:'也许是有什么东西被风吹动了。',source:'T02.004'},
    {english:'I think… because I noticed…',chinese:'我认为……，因为我注意到……。'},
    {english:"I still don't have enough information.",chinese:'我的信息还不够。',source:'T02.021'},
  ],
  comparison:[
    {english:'Could we hold this part still?',chinese:'我们能把这个部件固定住吗？',source:'T02.012'},
    {english:"The tapping stopped. The creak didn't.",chinese:'轻敲声停了，吱呀声没有停。',when:'Held comparison actually presented both conditions.',source:'T02.014'},
    {english:'Could we try it once before you move it?',chinese:'移开之前，我们能再试一次吗？',source:'T02.017'},
  ],
  explanation:[
    {english:'The two sounds had different causes.',chinese:'这两种声音的原因不同。',when:'Both causes were demonstrated.'},
    {english:"The boards near the stairs. I haven't checked them yet.",chinese:'楼梯附近的木板。我还没检查过。',when:'Board cause remains untested.',source:'T02.019'},
  ],
});
// Captions describe the heard event, without revealing an untested cause.
export const nightSoundDescriptions = Object.freeze({
  tap:{english:'A short, light tap.',chinese:'一下短促的轻敲声。'},
  creak:{english:'A lower, drawn-out creak.',chinese:'一阵较低、拖长的吱呀声。'},
});
export const nightLanguageSources = Object.freeze([
  {term:'tap / tapping',url:'https://www.oxfordlearnersdictionaries.com/definition/english/tap_1',scope:'Quick, light contact; -ing form tapping. Entry actually read.'},
  {term:'creak',url:'https://www.oxfordlearnersdictionaries.com/definition/english/creak_2',scope:'A sound associated with a moving door or a wooden floor underfoot. Noun entry actually read.'},
  {term:'might',url:'https://learnenglishteens.britishcouncil.org/grammar/b1-b2-grammar/modals-deduction',scope:'Possibility rather than established observation. Actual grammar explanation read; the source lesson story is not copied.'},
]);
