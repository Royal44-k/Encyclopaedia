// Original scene orientation, not textbook quotations or learner answers.
export const sceneNarration = [
 {id:'C1.A01',speaker:'NARR',english:'The water looks different here. Keep this view in mind when you return to the bridge.',chinese:'这里的水看起来不同。回到桥边时，可以再对照这个视角。'},
 {id:'C1.A02',speaker:'NARR',english:'A shallow channel runs from the flower bed towards the stream. Follow it with your eyes.',chinese:'一条浅沟从花床通向溪流。用目光沿着它看看。'},
 {id:'C1.A03',speaker:'NARR',english:'Mei was working here before the rain. What would you like to ask her?',chinese:'下雨前，Mei在这里工作。你想问她什么？'},
 {id:'C1.A04',speaker:'NARR',english:'Take a closer look at the cover. Which part of the bed would you protect?',chinese:'仔细看看覆盖物。你会保护花床的哪一部分？'},
 {id:'C1.A05',speaker:'NARR',english:'Your notes are safe. There is still a question to come back to.',chinese:'记录已保存。还有一个问题，值得回来继续寻找答案。'},
 {id:'C1.A06',speaker:'NARR',english:'Both trays start in the same way. Choose a position and watch what happens.',chinese:'两个托盘的初始条件相同。选择一个位置，看看会发生什么。'},
];

export function narrationFor(node, fields) {
 if(node.startsWith('j.end_')) return 'C1.A05';
 if(node==='j.materials') return 'C1.A04';
 if(node==='j.model_assemble'||node==='j.model_intro') return 'C1.A06';
 if(node==='j.fieldwork') return ({'loc.upper_stream':'C1.A01','loc.bare_bed':'C1.A02','loc.greenhouse':'C1.A03'})[fields['navigation.currentLocation']]||null;
 return null;
}

export function moodFor(node, fields) {
 if(node.startsWith('j.end_')||['j.return_card','j.explain','j.return_to_bridge'].includes(node))return 'reflection';
 if(['j.model_assemble','j.model_intro','j.model','j.plan_review'].includes(node))return 'model';
 if(['j.materials','j.placement','j.plan_choice'].includes(node))return 'placement';
 if(node.startsWith('j.mei_'))return 'greenhouse';
 if(node==='j.entry')return 'arrival';
 return ({'loc.stream_bridge':'bridge','loc.upper_stream':'upper','loc.greenhouse':'greenhouse','loc.bare_bed':'placement'})[fields['navigation.currentLocation']]||'arrival';
}
