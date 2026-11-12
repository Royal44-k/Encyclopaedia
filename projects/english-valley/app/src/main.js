import { mountImmersiveShell } from './ui/immersive-shell.js';
import './ui/styles.css';
import './ui/visit.css';
import { createJourneyStore, getDialogueCues, getAvailableEvents } from './core/journey.js';
import dialogueData from '../../docs/design/v6/dialogue-reference-index.json' with { type: 'json' };
import { createAudioDirector } from './audio/audio-director.js';
import { sceneNarration, narrationFor, moodFor } from './content/scene-narration.js';
import { createSceneMedia } from './ui/scene-media.js';
import './ui/experience-v2.css';
import { openModuleMenu } from './ui/module-menu.js';
import { createWorkshopStore } from './core/workshop.js';

const immersive = mountImmersiveShell();
const $ = (s) => document.querySelector(s);
const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg = (body) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const icons = {
 leaf:svg('<path d="M5 18C1 6 12 3 21 3c0 12-6 19-15 16M4 22 16 9"/>'),
 sun:svg('<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M20 4l-2 2M6 18l-2 2"/>'),
 arrow:svg('<path d="M4 12h15m-6-6 6 6-6 6"/>'),
 map:svg('<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16"/>'),
 book:svg('<path d="M4 3h16v18H4zM8 3v18M12 8h4m-4 4h4"/>'),
 sound:svg('<path d="M4 9h4l5-4v14l-5-4H4zM17 8q5 4 0 8m3-11q7 7 0 14"/>'),
 mute:svg('<path d="M4 9h4l5-4v14l-5-4H4zm13 0 5 6m0-6-5 6"/>'),
 settings:svg('<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/><circle cx="8" cy="18" r="2" fill="currentColor"/>'),
 close:svg('<path d="m6 6 12 12M18 6 6 18"/>'),
 check:svg('<path d="m5 12 4 4L20 5"/>'),
 pause:svg('<path d="M8 5v14M16 5v14"/>'),
 stream:svg('<path d="M2 8q4-5 8 0t8 0 4 0M2 14q4-5 8 0t8 0 4 0M2 20q4-5 8 0t8 0 4 0"/>'),
 camera:svg('<path d="M3 7h5l2-3h5l2 3h4v14H3z"/><circle cx="12" cy="13" r="4"/>'),
 download:svg('<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>'),
 pin:svg('<path d="M19 9c0 6-7 12-7 12S5 15 5 9a7 7 0 0 1 14 0Z"/><circle cx="12" cy="9" r="2"/>'),
};
const names = {NOOR:'Noor',ROWAN:'Rowan',MEI:'Mei',SAM:'Sam',LEARNER:'Your words',NARR:'The valley'};
const lines = Object.fromEntries([...dialogueData.tableLines,...sceneNarration].map(x => [x.id,x]));
const translations = {
 'T03S.029':'石头之间有一个瓶子，水看起来也有些褐色。','T03S.030':'先看看照片。我们也可以随后清走垃圾。',
 'T03S.001':'瓶子不见了，水看起来仍是褐色。','T03S.002':'我们改变了一件事。再看看还有什么正在发生。',
 'T03.014':'这张照片是在同一个地方拍的吗？','T03S.004':'这是下雨前在这里拍的照片。我们可以对照着看。',
 'T03S.006':'单凭水色还不行。我们需要更多信息。','T03S.007':'下雨前我们整理过那块花床，当时还没有把土盖完。',
 'T03S.009':'后来我看见浅沟里有水，但没有看到整场雨。','T03S.011':'我带你看看浅沟从哪里开始。',
 'T03S.012':'我能告诉你我看见的事，但无法仅凭这一处解释全部情况。','T03S.015':'指给我看：你想放在哪里，水又从哪里流过？',
 'T03S.017':'比较两次运行时，你会让哪些条件保持相同？','T03S.019':'这是模型的结果。说清楚到底什么发生了变化。',
 'T03S.022':'好，指给我看。','T03S.031':'你想先保留这份提案，还是把商量好的措施放到现场？',
 'T03S.033':'材料准备好了。指给我看我们确认的位置。','T03S.023':'我们能说已经清理了整条溪流吗？',
 'T03S.026':'选一个下次找得到的位置。下一份记录也留在那里。','T03S.028':'从能观察的事情开始，也问问照料那里的人员。',
};
const locations = {
 'loc.stream_bridge':{name:'East bridge',cn:'溪流木桥',hint:'Compare the photographs',icon:'stream'},
 'loc.upper_stream':{name:'Upstream',cn:'上游观察点',hint:'Look beyond the bridge',icon:'pin'},
 'loc.bare_bed':{name:'The flower bed',cn:'东岸花床',hint:'Follow the shallow channel',icon:'leaf'},
 'loc.greenhouse':{name:'The conservatory',cn:'玻璃温室',hint:'Ask Mei what she saw',icon:'leaf'},
};
const records = {
 'record.bridge.before_rain.v1':{title:'Before the rain',date:'Previous visit · same bridge viewpoint',capture:'bridge_before'},
 'record.bridge.current_round.v1':{title:'At the bridge today',date:'Return visit · observation round 01',capture:'bridge_now'},
 'record.upper.current_round.v1':{title:'Farther upstream',date:'Return visit · observation round 01',capture:'upper'},
 'record.bare_bed.path.v1':{title:'The soil and the channel',date:'Return visit · observation round 01',capture:'path'},
};
const store = createJourneyStore(localStorage);
const PREF_KEY='english-valley.preferences.v1', MEDIA_KEY='english-valley.media.v1', DRAFT_KEY='english-valley.drafts.v1';
function readJSON(key,fallback){try{return JSON.parse(localStorage.getItem(key))||fallback;}catch{return fallback;}}
const storedPreferences=readJSON(PREF_KEY,{});
const prefs={chinese:true,sound:true,music:true,ambience:true,muted:false,speechVolume:.95,musicVolume:.19,ambienceVolume:.13,audioVersion:2,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,quality:'standard',...storedPreferences};
if(storedPreferences.audioVersion!==2)Object.assign(prefs,{sound:true,music:true,ambience:true,muted:false,speechVolume:.95,musicVolume:.19,ambienceVolume:.13,audioVersion:2});
let media=readJSON(MEDIA_KEY,{}), drafts=readJSON(DRAFT_KEY,{});
let valley;
const ui={ready:false,started:false,busy:false,error:null,lines:[],support:[],modal:null,lastFocus:null,modelProgress:0,trialToken:0,pendingTrial:null,commandIds:{},mode:'same_pc_group',speechId:null,audioState:null,audioKey:null,audioOccurrence:0,dialogueOwner:null};
const sceneMedia=createSceneMedia();
const fields=()=>store.state.fields;
const node=()=>store.state.nodeId;
function context(){return {...(valley?.getCastStatus?.()||{}),sceneBindingsReady:ui.ready};}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),4400);}
function button(action,label,style='secondary',extra=''){return `<button type="button" class="${style}" data-action="${action}" ${extra}>${label}</button>`;}
function cn(text){return `<div class="cn">${esc(text)}</div>`;}
function saveAux(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{toast('Storage is full. Export your visit before leaving. 本地存储失败，请先导出。');return false;}}
function setDraft(key,value){drafts[key]=value;saveAux(DRAFT_KEY,drafts);}
function audioOwner(){return `${node()}:${fields()['navigation.currentLocation']}`;}
function effectiveLines(){
 if(ui.lines.length)return ui.lines;
 const id=narrationFor(node(),fields());return id?[id]:[];
}
function refreshAudioUi(state){
 ui.audioState=state;
 document.body.dataset.audioState=state.muted?'muted':state.speaking?'speaking':state.blocked?'blocked':state.unlocked?'ready':'locked';
 document.body.dataset.audioLine=state.currentId||'';
 document.body.dataset.audioMood=state.mood||'';
 document.body.dataset.audioMusic=state.musicPlaying||'';
 document.querySelectorAll('[data-line]').forEach(el=>el.classList.toggle('is-speaking',state.speaking&&el.dataset.line===state.currentId));
 const status=$('#sound-state-label');
 if(status)status.textContent=state.muted?'Sound off':state.blocked?'Tap to enable sound':state.failedLineId?'Voice paused · tap to retry':state.speaking?`${names[state.currentSpeaker]||'Narrator'} · speaking`:state.degradedVoice?'Using a device voice':prefs.music?'Music & nature':'Sound on';
 const modalCaption=$('#modal-spoken-line');if(modalCaption){modalCaption.hidden=!state.speaking;modalCaption.textContent=state.speaking?`${names[state.currentSpeaker]||'Narrator'} · ${lines[state.currentId]?.english||''}`:'';}
 immersive.updateSpeech();
 const chip=$('#sound-state');if(chip){chip.classList.toggle('is-speaking',state.speaking);chip.dataset.line=state.failedLineId||state.currentId||'';}
}
const audio=createAudioDirector({lines,onState:refreshAudioUi,onSpeaker:(speaker)=>{valley?.setSpeaking?.(null,false);if(speaker)valley?.setSpeaking?.(speaker,true);},onError:error=>toast(error.kind==='unlock'?'Tap the sound button to enable audio.':'A sound could not load. You can retry it with the sound button.')});
function applyAudioPreferences(){audio.setEnabled(prefs.sound);audio.setMusicEnabled(prefs.music);audio.setAmbienceEnabled(prefs.ambience);audio.setMuted(prefs.muted);audio.setVolumes({speech:prefs.speechVolume,music:prefs.musicVolume,ambience:prefs.ambienceVolume});}
applyAudioPreferences();
const manifestReady=fetch('/audio/manifest.json').then(r=>{if(!r.ok)throw new Error('Audio manifest unavailable');return r.json();}).then(manifest=>{audio.setManifest(manifest);return manifest;}).catch(()=>null);
function reconcileAudio(){
 if(!ui.started||!ui.ready||ui.busy||fields()['navigation.targetLocation'])return;
 const key=`${ui.audioOccurrence}:${audioOwner()}`;
 audio.enterScene({key,mood:moodFor(node(),fields()),lineIds:effectiveLines()});ui.audioKey=key;
 refreshAudioUi(audio.getState());
}
function syncCues(trigger='node_enter'){
 const cues=getDialogueCues(store.state,trigger,context());
 const nextLines=[...new Set(cues.filter(c=>c.kind==='performed'||c.kind==='transcript').flatMap(c=>c.ids))];
 if(nextLines.length||trigger==='node_enter'){ui.lines=nextLines;ui.dialogueOwner=audioOwner();}
 else if(ui.dialogueOwner!==audioOwner()){ui.lines=[];ui.dialogueOwner=audioOwner();}
 ui.support=[...new Set(cues.filter(c=>c.kind==='optional_learner_support').flatMap(c=>c.ids))];
}
function perform(event,input={},extra={},options={}){
 try{
  const prev=node();store.dispatch(event,input,{...context(),...extra});
  valley?.setWorldState(fields());
  if(!options.quiet){syncCues(prev===node()?event:'node_enter');render();}
  return true;
 }catch(error){toast(error.message||'This action could not be saved. Please try again.');return false;}
}
function presentReceipts(){
 if(!ui.started||ui.busy)return;
 let changed=false;
 for(const id of ui.lines){
  if(!Object.hasOwn(fields(),`delivery.${id}`)||fields()[`delivery.${id}`])continue;
  if(!document.querySelector(`[data-line="${id}"]`))continue;
  try{store.dispatch('DIALOGUE_CONTENT_PRESENTED',{lineId:id},{...context(),presentedDialogueId:id,dialogueDeliveryValidated:true});changed=true;}catch{/* A cue may have expired after an explicit action. */}
 }
 if(changed)render(false);
}
async function speak(id){const unlocked=audio.unlock();prefs.muted=false;prefs.sound=true;applyAudioPreferences();saveAux(PREF_KEY,prefs);await unlocked;await manifestReady;await audio.replay(id);}
function dialogueHTML(){return effectiveLines().map(id=>lines[id]?`<div class="dialogue" data-line="${id}"><div class="speaker">${names[lines[id].speaker]||esc(lines[id].speaker)}<button class="replay" data-action="speak" data-id="${id}" aria-label="Replay ${names[lines[id].speaker]}'s line">${icons.sound}</button></div><p>${esc(lines[id].english)}</p>${(translations[id]||lines[id].chinese)?cn(translations[id]||lines[id].chinese):''}</div>`:'').join('');}
function supports(){return ui.support.length?`<details class="support"><summary>Words if you need them · 表达帮助</summary>${ui.support.map(id=>`<p>${esc(lines[id]?.english||'')}</p>`).join('')}<p class="fine">Your own words are welcome. These are examples.</p></details>`:'';}
function recorded(key){return fields()[key]!==false&&fields()[key]!=='unseen';}
function routeList(){return `<div class="place-list">${Object.entries(locations).map(([id,l])=>{const seen=id==='loc.stream_bridge'?recorded('evidence.bridge'):id==='loc.upper_stream'?recorded('evidence.upper'):id==='loc.bare_bed'?recorded('evidence.path'):fields()['interview.heard'];return `<button class="place ${fields()['navigation.currentLocation']===id?'active':''}" data-action="travel" data-location="${id}" ${ui.busy?'disabled':''}><span>${l.name}<small>${l.hint}</small></span><span class="visit-status">${seen?icons.check:icons.arrow}</span></button>`;}).join('')}</div>`;}
function heading(eyebrow,title,lead=''){return `<div class="eyebrow">${icons.leaf}${eyebrow}</div><h2>${title}</h2>${lead?`<p class="lead">${lead}</p>`:''}`;}
function available(event){return getAvailableEvents(store.state,context()).includes(event);}
function storyContent(){
 const f=fields(), n=node();
 if(!ui.started)return `${heading('A fieldwork story · Unit 13','Why is the stream<br>still brown?','Look closely. Ask questions.<br>Find out what the water can—and cannot—tell us.')}${cn('走进同一个山谷，用英语观察、访查与行动。')}${ui.error?`<p class="error-note">${esc(ui.error)}</p>`:''}<div class="actions">${button('begin',`${n==='j.entry'?'Explore the stream':'Continue your visit'} ${icons.arrow}`,'primary',ui.ready?'':'disabled')}</div>${!ui.ready&&!ui.error?'<div class="loading-row"><i class="loading-indicator"></i>Preparing the living valley…</div>':`<div class="footer-note">A shared-screen English workshop · Year 9</div>`}`;
 if(n.startsWith('j.end_'))return `${heading('Your field journal','A place to return to.','Your visit has been saved on this device. There is still more to notice.')}${cn('记录的是已经发生的事；下次观察仍是待办。')}${n==='j.end_unresolved'?`<p class="photo-note">${esc(f['resume.note']||'An open question has been kept with this visit.')}</p>`:''}<div class="chip-list"><span>${f['world.litterRemoved']?'Bottle removed':'Bottle still present'}</span><span>${f['world.coverInstalled']?'Cover in place':'No cover installed'}</span><span>Follow-up ${f['followup.status']==='planned'?'planned':'not arranged'}</span></div>${dialogueHTML()}<div class="actions stack">${button('resume',`Return to the visit ${icons.arrow}`,'primary')}${button('journal','Open my field journal')}${button('export',`${icons.download} Export this visit`)}</div>`;
 if(f['navigation.targetLocation']&&!ui.busy&&n==='j.fieldwork')return `${heading('A walk left unfinished','Continue along the path.',`You paused at ${esc(locations[f['navigation.currentLocation']].name)}. Your next stop was ${esc(locations[f['navigation.targetLocation']].name)}.`)}<div class="actions">${button('continue-walk','Continue the walk','primary')}</div>${cn('先恢复到已保存的位置，再由你继续这段路。')}`;
 const d=dialogueHTML(), support=supports();
 if(n==='j.bridge_record')return `${heading('The east bridge','Something is different.','The photograph and the stream share the same viewpoint.')}${sceneMedia.card(n,f,media)}${d}<div class="actions stack">${button('evidence-bridge',`${icons.camera} Look at the photographs`,'primary')}${!f['world.litterRemoved']?button('cleanup','Pick up the bottle'):''}</div>${cn('可以先观察，也可以先清理。')}`;
 if(n==='j.bridge_hook')return `${heading('A question worth following','Look a little further.')}${sceneMedia.card(n,f,media)}${d}<div class="actions stack">${button('investigate',`Follow the stream ${icons.arrow}`,'primary')}${button('water-question','Can the colour tell us what is in it?')}${!f['world.litterRemoved']?button('cleanup','Pick up the bottle'):''}${button('evidence-bridge','Look at the photographs again','text-button')}</div>${support}`;
 if(n==='j.fieldwork'){
  const loc=f['navigation.currentLocation'];let actions='';
  if(loc==='loc.stream_bridge')actions=button('evidence-bridge','Open the bridge record','primary')+(!f['world.litterRemoved']?button('cleanup','Pick up the bottle'):'');
  if(loc==='loc.upper_stream')actions=button('evidence-upper','Compare upstream and the bridge','primary');
  if(loc==='loc.bare_bed')actions=button('evidence-path','Trace the shallow channel','primary')+(available('ASSEMBLE_COMPARISON')?button('assemble','Try an idea in the model'): `<p class="node-note">Before a comparison: ${!recorded('evidence.upper')?'look upstream · ':''}${!recorded('evidence.path')?'trace the channel · ':''}${!f['interview.heard']?'ask Mei what she saw':''}</p>`);
  if(loc==='loc.greenhouse')actions=button('ask-mei','Mei, what happened before the rain?','primary')+button('ask-mei-direct','Could this bed explain all of it?','text-button');
  return `${heading('Fieldwork · choose your next stop',locations[loc].name)}${sceneMedia.card(n,f,media)}${d}<div class="actions stack">${actions}</div><div class="story-divider"></div>${routeList()}<div class="actions">${button('explain','Keep what we know so far','text-button')}</div>`;
 }
 if(n==='j.mei_neutral'||n==='j.mei_direct')return `${heading('At the conservatory','What Mei remembers.')}${d}<div class="actions stack">${button('mei-continue','Did you see water running from it?','primary')}</div>${support}`;
 if(n==='j.mei_followup')return `${heading('An account, not the whole story','What did she see?')}${d}${support}<div class="actions stack">${button('mei-record',`Keep Mei’s account ${icons.check}`,'primary')}</div>${cn('记录目击事实，也保留她没有看到的部分。')}`;
 if(n==='j.model_assemble')return `${heading('At the flower bed','Bring an idea to the table.','A small model lets us compare the same rain under different cover positions.')}${d}<div class="actions">${button('stage-model','Gather at the model','primary')}</div>`;
 if(n==='j.model_intro')return `${heading('A controlled comparison','What stays the same?')}${d}${support}<div class="chip-list"><span>Rain setting</span><span>Starting soil</span><span>Running time</span></div><div class="actions">${button('open-model','Try a position','primary')}</div>`;
 if(n==='j.model')return modelPanel(f,d,support);
 if(n==='j.plan_review')return `${heading('From a model to a proposal','What does this result support?','You can try another position, keep a proposal, or agree a small change with Mei.')}${d}<label class="field">A reason you want to keep<textarea data-draft="proposal" placeholder="This result may explain…">${esc(drafts.proposal||f['plan.note'])}</textarea></label><div class="actions stack">${available('PURPOSE_AND_POSITION_CONFIRMED')?button('agree-plan','Agree to cover this exposed soil','primary'):''}${button('keep-proposal','Keep a proposal; do not install')}${button('revise-model','Try another position','text-button')}</div>`;
 if(n==='j.plan_choice')return `${heading('A choice, not a reward','Shall we put it in place?')}${d}<div class="actions stack">${button('implement','Prepare the cover','primary')}${button('keep-proposal','Keep the agreed proposal for later')}</div>${cn('试验结果不会替你自动实施；也不会让溪流马上变清。')}`;
 if(n==='j.materials')return `${heading('At the work table','Check before you carry.')}${sceneMedia.card(n,f,media)}${d}<p class="lead">One fitted cover. The agreed source-soil area. Leave the channel and walking path open.</p><div class="actions stack">${!f['implementation.materialsChecked']?button('check-material','Check the cover and its purpose','primary'):button('pick-material','Lift the checked cover','primary')}</div>`;
 if(n==='j.placement')return `${heading('A change in the valley','Place it with care.','Choose a position on the ground, then confirm. You can move it before you finish.')}${sceneMedia.card(n,f,media)}<div class="choice-grid">${button('place-source',`Cover the exposed soil ${icons.leaf}`,'choice',`data-zone="source_cover_zone"`)}${button('place-unrelated','Try the area beside it','choice',`data-zone="unrelated_zone"`)}</div>${f['implementation.draftZone']?`<p class="node-note">${f['implementation.draftZone']==='source_cover_zone'?'The cover sits on the agreed soil. The path and channel remain open.':'This is beside the source. Move the cover onto the agreed exposed soil.'}</p>`:''}<div class="actions">${f['implementation.materialState']==='draft_placed'?button('install','Confirm the placement','primary'):''}</div>${cn('也可以暂停，保留尚未确认的摆放草稿。')}`;
 if(n==='j.explain')return `${heading('Tell someone what really happened','A small story. An honest one.')}${d}${support}<p class="lead">Choose a record, add your own words, and leave room for what you still do not know.</p><div class="actions stack">${button('editor',`${icons.book} Make a picture note`,'primary')}${button('return-bridge','Return to the same bridge')}${button('save-unresolved','Save an open question','text-button')}</div><div class="saved-strip">${icons.check} ${f['explanation.status']==='empty'?'Your explanation can remain unfinished.':`${f['explanation.status']==='draft'?'Draft':'Picture note'} saved · version ${f['explanation.revision']}`}</div>`;
 if(n==='j.return_to_bridge')return `${heading('The way back','The same path. Another question.','Return to the bridge before arranging the next observation.')}<div class="actions">${button('finish-walk','Continue to the bridge','primary')}</div>`;
 if(n==='j.return_card')return `${heading('At the east bridge again','What will we look for next?')}${d}<div class="actions stack">${button('return-note','Plan the next observation','primary')}${button('finish','Save this visit')}${button('reopen','There is something else I want to check','text-button')}</div><p class="fine">${f['followup.status']==='planned'?'A return is planned. No follow-up observation has happened yet.':'An unfinished question is a useful thing to leave with.'}</p>`;
 return heading('The valley','Take your time.');
}
function modelPanel(f,d,support){
 const positions=[['no_cover','Leave it uncovered','先不放覆盖物'],['unrelated_zone','Beside the soil source','放到旁边无关的位置'],['source_cover_zone','Over the exposed soil','覆盖与浅沟相连的裸土']];
 const previous=positions.find(p=>p[0]===f['model.latestPosition'])?.[1];
 return `${heading('In the model','Where would you put it?','Compare your choice with the unchanged, uncovered tray.')}${d}<div class="choice-grid">${positions.map(([p,t,c])=>`<button class="choice ${f['model.candidatePosition']===p?'selected':''}" data-action="model-position" data-position="${p}" ${f['model.phase']==='running'?'disabled':''}><span>${t}<small class="cn">${c}</small></span>${f['model.candidatePosition']===p?icons.check:''}</button>`).join('')}</div><div class="trial-progress"><i style="width:${Math.round(ui.modelProgress*100)}%"></i></div>${f['model.latestTrialId']?`<p class="fine">Last completed comparison · ${esc(previous)}</p><p class="measure-note">${f['model.latestResult']==='less_source_soil_shown'?'Less soil followed this path.':'No difference in this comparison.'}</p><p class="fine">A model result. The stream outside has not changed.</p>`:''}<div class="actions">${f['model.phase']==='running'?(ui.pendingTrial?button('retry-trial-save','Retry saving this comparison','primary'):'')+button('cancel-trial','Stop this run'):button('run-trial',`${icons.stream} Compare the two trays`,'primary')}${f['model.latestTrialId']&&f['model.phase']!=='running'?button('save-proposal','Keep this as a proposal'):''}</div>${support}${button('explain','Keep an unanswered question','text-button')}`;
}
function render(receipts=true){
 const n=node(), loc=locations[fields()['navigation.currentLocation']];
 document.body.classList.toggle('translation-off',!prefs.chinese);
 document.body.classList.toggle('in-visit',ui.started);
 $('#app').innerHTML=`<header class="topbar"><div class="wordmark"><h1>THE ENGLISH VALLEY</h1><p>A place to notice. A reason to speak.</p><div class="weather">${icons.leaf}<span>SPRING</span><i></i>${icons.sun}<span>AFTER THE RAIN</span></div></div><div class="toolbar">${button('toggle-chinese',prefs.chinese?'EN / 中文':'EN','pill-button',`aria-label="Toggle Chinese support"`)}${button('toggle-sound',prefs.muted?icons.mute:icons.sound,'icon-button sound-toggle',`aria-label="Toggle all sound" aria-pressed="${!prefs.muted}"`)}${button('settings',icons.settings,'icon-button',`aria-label="Settings and classroom options"`)}</div></header>${ui.started?`<div class="stage-tag">FIELD VISIT · ${esc(loc.name)}</div><button id="sound-state" class="sound-state" data-action="audio-status" aria-label="Sound playback and settings"><span class="sound-bars" aria-hidden="true"><i></i><i></i><i></i></span><span id="sound-state-label">Sound on</span></button>`:''}<section id="story-panel" class="story-panel ${ui.started?'':'hero'}" tabindex="-1" aria-label="Story and available actions">${storyContent()}</section>${ui.started?`<div class="map-chip">${icons.pin}${ui.busy?'Following the path…':esc(loc.name)}</div>`:''}${(n==='j.model'||n==='j.model_intro')&&ui.started?`<div class="model-badge">IN THE MODEL · SAME RAIN, SAME START</div>`:''}${ui.busy?'<div class="walk-note"><i class="loading-indicator"></i>Walking through the valley…</div>':''}<nav class="location-nav" aria-label="Field tools"><div class="nav-left">${button('modules','Valley stories','')}${button('overview',`${icons.map} Map`,'')}${button('journal',`${icons.book} Field journal`,'')}${ui.started&&!n.startsWith('j.end_')?button('pause',`${icons.pause} Save & pause`,'exit-link'):''}</div><div class="nav-right">${button('teacher','Classroom notes','')}${button('about','About this visit','')}</div></nav>`;
 if(ui.busy)document.querySelectorAll('#story-panel button').forEach(b=>{b.disabled=true;});
 if(receipts)requestAnimationFrame(presentReceipts);
 immersive.sync();reconcileAudio();refreshAudioUi(audio.getState());
}
function modal(title,body,footer='',drawer=false){
 if(!ui.modal){ui.lastFocus=document.activeElement;ui.lastFocusAction=ui.lastFocus?.dataset?.action;}ui.modal=true;
 $('#overlay-root').innerHTML=`<div class="overlay ${drawer?'drawer-overlay':''}"><section class="modal ${drawer?'drawer':''}" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="modal-header"><div><div class="eyebrow">THE ENGLISH VALLEY · FIELD NOTES</div><h2 id="modal-title">${title}</h2></div>${button('close',icons.close,'close','aria-label="Close dialog"')}</header><div id="modal-spoken-line" class="modal-spoken-line" hidden></div>${body}${footer?`<div class="actions">${footer}</div>`:''}</section></div>`;
 $('#overlay-root .close')?.focus();refreshAudioUi(audio.getState());
}
function closeModal(){ui.modal=false;$('#overlay-root').replaceChildren();const target=ui.lastFocus?.isConnected?ui.lastFocus:ui.lastFocusAction?document.querySelector(`[data-action="${CSS.escape(ui.lastFocusAction)}"]`):$('#story-panel');(target&&!target.disabled?target:$('#story-panel'))?.focus();}
function capture(sourceId,kind,options){if(media[sourceId])return true;const image=valley.captureEvidence(kind,options);if(!image){toast('The scene record is not ready yet. Please try again.');return false;}const next={...media,[sourceId]:{image,title:records[sourceId]?.title||(kind==='trial'?'Model comparison':kind==='installed'?'The cover in place':'The bottle removed'),date:records[sourceId]?.date||'This visit · recorded when completed'}};if(!saveAux(MEDIA_KEY,next))return false;media=next;return true;}
function photo(id){const m=media[id];return `<figure class="evidence-photo">${m?`<img src="${m.image}" alt="${esc(m.title)}"/>`:'<div class="empty">Scene record unavailable</div>'}<figcaption>${esc(m?.title||id)}<small>${esc(m?.date||'')}</small></figcaption></figure>`;}
function showEvidence(kind){
 const ids=kind==='bridge'?['record.bridge.before_rain.v1','record.bridge.current_round.v1']:kind==='upper'?['record.upper.current_round.v1','record.bridge.current_round.v1']:['record.bare_bed.path.v1'];
 for(const id of ids)if(!capture(id,records[id].capture))return;
 const title=kind==='bridge'?'The same place. A different day.':kind==='upper'?'Two places, one observation round.':'Follow the visible path.';
 const prompt=kind==='bridge'?'What has changed? What can a photograph tell us—and what can’t it tell us?':kind==='upper'?'Look at the upstream water, then at the bridge. Does the difference prove a single cause?': 'Find the exposed soil, the shallow channel, and the point where it meets the stream. A connection is a clue, not the whole explanation.';
 const event=kind==='bridge'?'BRIDGE_RECORD_OPENED':kind==='upper'?'UPPER_RECORD_OPENED':'PATH_RECORD_OPENED';
 modal(title,`<div class="evidence-grid">${ids.map(photo).join('')}</div><p class="photo-note">${prompt}</p><p class="fine">An authored record from this valley story. Dates describe the story, not a real-world water measurement.</p>`,button('record-evidence',`Keep this observation ${icons.check}`,'primary',`data-kind="${kind}" data-event="${event}"`));
}
async function walk(location,{repositionOnly=false,model=false}={}){
 if(ui.busy)return;++ui.audioOccurrence;audio.stopSpeech();ui.busy=true;render();
 const result=await valley.goTo(model?'model':location);
 ui.busy=false;
 if(node().startsWith('j.end_')){render();return;}
 if(result){
  if(!repositionOnly&&(node()==='j.return_to_bridge'||fields()['navigation.targetLocation']===location)){perform('MOVE_ARRIVED',{}, {destinationReached:true});syncCues('cast_arrived');render();}
  else {syncCues('cast_arrived');render();}
 }else{toast('The path is not ready. Your progress is preserved.');render();}
}
function bindingsCompatible(){
 const f=fields();
 if(f['session.layoutVersion']!=='unbound'&&(f['session.layoutVersion']!=='valley-layout-3-slice-1'||f['session.assetManifestVersion']!=='authored-scene-1'))return false;
 const draft=f['implementation.draftTransform'];
 if(draft){const check=valley?.validatePlacement?.(draft);if(!check?.coverOrientationValid||check.zone!==f['implementation.draftZone'])return false;}
 if(f['world.coverInstalled']){const check=valley?.validatePlacement?.(f['world.coverTransform']);if(!check?.valid||check.zone!=='source_cover_zone')return false;}
 return true;
}
function showBindingMismatch(){modal('This record does not fit the current scene.',`<p class="lead">Your saved visit is preserved. Its scene version or object positions could not be matched safely. They have not been applied to this valley. Export it before starting a new visit.</p>`,button('export','Export the original record','primary')+button('new-visit','Start a new visit'));}
async function begin(){
 const unlocked=audio.unlock();
 if(!ui.ready)return;
 await Promise.all([unlocked,manifestReady]);applyAudioPreferences();saveAux(PREF_KEY,prefs);
 if(store.loadError){modal('A saved visit needs attention.',`<p class="error-note">${esc(store.loadError.message||store.loadError)}</p><p class="lead">The old record has not been overwritten. Export it before deciding what to do next.</p>`,(fields()['model.phase']==='running'?button('retry-recovery','Retry interrupted-run recovery','primary'):'')+button('export','Export current records')+button('new-visit','Start a new visit'));return;}
 if(!bindingsCompatible()){showBindingMismatch();return;}
 if(node()==='j.entry'&&!perform('SESSION_OPENED',{mode:ui.mode,layoutVersion:'valley-layout-3-slice-1',assetManifestVersion:'authored-scene-1'},{sceneBindingsReady:true}))return;
 ui.started=true;
 if(node().startsWith('j.end_')){render();return;}
 await restoreView();render();
}
async function restoreView(){
 const isModel=['j.model_intro','j.model'].includes(node());
 ui.modelProgress=fields()['model.latestTrialId']&&fields()['model.latestPosition']===fields()['model.candidatePosition']?1:0;
 valley.setModel(modelOptions({active:isModel,running:false}));
 await walk(fields()['navigation.currentLocation'],{repositionOnly:true,model:isModel});
 syncCues('scene_resumed');render();
}
function modelOptions(extra={}){return {active:['j.model_intro','j.model'].includes(node()),position:fields()['model.candidatePosition'],running:fields()['model.phase']==='running',progress:ui.modelProgress,...extra};}
function runTrial(){
 if(!perform('TRIAL_REQUESTED'))return;
 const runId=fields()['model.activeRunId'], position=fields()['model.runningPosition'], token=++ui.trialToken;
 const start=performance.now(), duration=prefs.reduced?700:3800;
 function tick(now){
  if(token!==ui.trialToken||fields()['model.activeRunId']!==runId)return;
  ui.modelProgress=Math.min(1,(now-start)/duration);valley.setModel(modelOptions({position,running:true}));
  const bar=document.querySelector('.trial-progress>i');if(bar)bar.style.width=`${ui.modelProgress*100}%`;
  if(ui.modelProgress<1)requestAnimationFrame(tick);else{
   ui.pendingTrial={id:crypto.randomUUID(),runId,position};completeTrial();
  }
 }requestAnimationFrame(tick);
}
function completeTrial(){
 const pending=ui.pendingTrial;if(!pending||fields()['model.activeRunId']!==pending.runId)return;
 if(!capture(`trial.${pending.id}`,'trial',{position:pending.position,progress:1})){render();return;}
 if(perform('TRIAL_COMPLETED',{runId:pending.runId},{modelAnimationFinished:true,eventId:pending.id})){ui.pendingTrial=null;valley.setModel(modelOptions({running:false,progress:1}));render();}
 else render();
}
function eligibleSources(){
 const f=fields();return Object.keys(media).filter(id=>id.startsWith('record.bridge.')?f['evidence.bridge']==='observed':id.startsWith('record.upper.')?f['evidence.upper']!=='unseen':id.startsWith('record.bare_bed.')?f['evidence.path']!=='unseen':store.state.acceptedEvents.some(e=>id===`trial.${e.id}`&&e.event==='TRIAL_COMPLETED'||id===`implementation.${e.id}`&&e.event==='COVER_INSTALLED'||id===`cleanup.${e.id}`&&e.event==='LITTER_REMOVED'));
}
function editor(){
 const cards=drafts.cards||fields()['explanation.cards'], sources=eligibleSources();
 modal('What would you tell a visitor?',`<p class="lead">Keep a claim, a clue, and something still uncertain. You can leave any frame empty.</p><div class="editor-grid">${cards.map(c=>`<article class="editor-card">${c.sourceId&&media[c.sourceId]?`<img src="${media[c.sourceId].image}" alt="Selected field record"/>`:'<div class="blank-photo">A place for a record</div>'}<div class="inputs"><label>Frame ${c.slot}<select data-card-source="${c.slot}"><option value="">Leave this frame empty</option>${c.sourceId&&!sources.includes(c.sourceId)?`<option value="${esc(c.sourceId)}" selected>Image unavailable — choose another record or leave empty</option>`:""}${sources.map(id=>`<option value="${esc(id)}" ${id===c.sourceId?'selected':''}>${esc(media[id].title)}${id.startsWith('trial.')?' · in the model':''}</option>`).join('')}</select></label><label class="field">Your own words<textarea data-card-caption="${c.slot}" maxlength="1600" placeholder="We noticed… / We still need to…">${esc(c.caption)}</textarea></label></div></article>`).join('')}</div><details class="support"><summary>Something to start with</summary><p>We noticed…</p><p>This may explain…, but…</p><p>In the model…</p><p>We still need to find out…</p></details><div class="editor-footer"><span class="fine">Draft text stays on this device. No automatic score.</span>${button('save-explanation',`Save my picture note ${icons.check}`,'primary')}</div>`);
}
function saveExplanation(){
 const cards=drafts.cards||fields()['explanation.cards'];const allowed=eligibleSources();
 if(cards.some(c=>c.sourceId&&!allowed.includes(c.sourceId))){toast('One record is unavailable. Choose another record or leave that frame empty.');return;}
 if(!saveAux(MEDIA_KEY,media))return;
 if(perform('EXPLANATION_SAVED',{cards},{threeCardSourcesValid:true,referencedMediaDurable:true})){closeModal();toast('Your words and records are saved. 已保存你的图文说明。');}
}
function returnNote(){
 const c=drafts.returnCard||fields()['followup.card']||{locationId:'loc.stream_bridge',whenText:'After the next rain',question:'',whatToObserve:'',participants:'',realWorldConnection:''};
 modal('Leave a plan, not a prediction.',`<p class="lead">What would make a useful next observation? A question can stay open.</p><label class="field">The same observation point<select data-return="locationId">${Object.entries(locations).map(([id,l])=>`<option value="${id}" ${id===c.locationId?'selected':''}>${l.name}</option>`).join('')}</select></label>${[['whenText','When could we return?'],['whatToObserve','What will we look at?'],['question','What do we still want to know?'],['participants','Who could join or help?'],['realWorldConnection','A similar place or question at school']].map(([key,label])=>`<label class="field">${label}<input data-return="${key}" value="${esc(c[key])}" maxlength="700"/></label>`).join('')}<p class="fine">This saves an intention. It does not record a visit that has not happened.</p>`,button('save-return','Keep this plan','primary'));
 drafts.returnCard=c;
}
function journal(){
 const f=fields();modal('Notes from the valley.',`<div class="chip-list"><span>Saved on this device</span><span>${f['session.mode']==='single_bounded_npc'?'Independent visit':'Shared-screen workshop'}</span></div><article class="journal-record"><h3>What we have looked at</h3>${[['evidence.bridge','The bridge photographs'],['evidence.upper','Upstream comparison'],['evidence.path','The soil and channel']].map(([key,label])=>`<p>${label} <span class="status-pill ${f[key]==='unseen'?'pending':''}">${f[key]==='unseen'?'not yet recorded':f[key]==='peer_shared'?'shared by a partner':'observed'}</span></p>`).join('')}<p>Mei’s account <span class="status-pill ${f['interview.heard']?'':'pending'}">${f['interview.heard']?'recorded':'not yet recorded'}</span></p></article><article class="journal-record"><h3>In the model</h3><p>${f['model.trials'].length?`${f['model.trials'].length} completed comparison${f['model.trials'].length>1?'s':''}. These results belong to the model.`:'No completed comparison yet.'}</p></article><article class="journal-record"><h3>In the valley</h3><p>${f['world.litterRemoved']?'The bottle was removed.':'The bottle has not been removed.'}<br>${f['world.coverInstalled']?'The cover was placed on the agreed soil.':'No cover has been installed.'}<br>The water’s appearance has not been changed by these actions.</p></article><article class="journal-record"><h3>Our words</h3>${f['explanation.cards'].some(c=>c.caption)?f['explanation.cards'].filter(c=>c.caption).map(c=>`<p>${esc(c.caption)}</p>`).join('<br>'):'<p>No picture note saved yet. An unfinished visit is still worth keeping.</p>'}</article><article class="journal-record"><h3>Next time</h3>${f['followup.card']?`<p>${esc(f['followup.card'].whenText)} · ${esc(locations[f['followup.card'].locationId].name)}<br>${esc(f['followup.card'].whatToObserve)}<br>${esc(f['followup.card'].question)}</p><span class="status-pill pending">Planned · not yet observed</span>`:'<p>No return plan saved yet.</p>'}</article>${button('export',`${icons.download} Export the visit`,'secondary export')}<p class="fine">Opening a record does not prove understanding. Your teacher or partner can respond to what you actually say or write.</p>`,'',true);
}
function exportVisit(){
 const raw=store.exportJSON();let journey;try{journey=JSON.parse(raw);}catch{journey={unreadableSavedText:raw};}
 const data={journey,media,drafts,exportedAt:new Date().toISOString(),note:'English Valley local classroom visit; fictional world observations, not field measurements.'};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='english-valley-field-journal.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
}
function settings(){
 const toggle=(key,title,help)=>`<label class="settings-row"><span>${title}<small>${help}</small></span><input type="checkbox" data-pref="${key}" ${prefs[key]?'checked':''}/></label>`;
 const volume=(key,title)=>`<label class="settings-row volume-row"><span>${title}</span><input type="range" min="0" max="1" step="0.05" data-pref="${key}" value="${prefs[key]}" aria-label="${title}"/></label>`;
 modal('Make room for your way of learning.',`${toggle('chinese','Chinese support','Optional help beneath the English.')}${toggle('sound','Spoken dialogue','Plays once on arrival. Use a line’s speaker button to hear it again.')}${volume('speechVolume','Dialogue volume')}${toggle('music','Scene music','Different places have their own musical atmosphere.')}${volume('musicVolume','Music volume')}${toggle('ambience','Nature sounds','Water, leaves and birds beneath the conversation.')}${volume('ambienceVolume','Nature volume')}${toggle('reduced','Reduce movement','Use the same viewpoints with shorter transitions.')}<label class="settings-row"><span>Visual detail<small>The clues and outcomes remain the same.</small></span><select data-pref="quality"><option value="standard" ${prefs.quality==='standard'?'selected':''}>Classroom</option><option value="high" ${prefs.quality==='high'?'selected':''}>High detail</option></select></label>${prefs.muted?'<p class="photo-note">All sound is currently muted. Use the speaker at the top to turn it back on.</p>':''}${node()==='j.entry'?`<label class="settings-row"><span>Visit mode</span><select id="visit-mode"><option value="same_pc_group">Together, one screen</option><option value="teacher_projection">Classroom projection</option><option value="single_bounded_npc">Independent visit</option></select></label>`:''}<div class="story-divider"></div>${button('new-confirm','Start a separate new visit','text-button')}<p class="fine">Export your current visit first if you want to keep a copy.</p>`);
}
function teacher(){modal('A conversation, not a click-through.',`<div class="teacher-detail"><h3>The learning moment</h3><p>Ask a partner what they noticed before explaining your own idea. Compare a record, ask Mei about her observation, and revise a claim when the evidence calls for it.</p><h3>A 45-minute first visit</h3><p>Begin at the bridge; collect the bridge, upstream and soil-path records; ask Mei; try one comparison; keep a short explanation and a next step. Installation is optional. If time runs out, save an unfinished question.</p><h3>Two people, different information</h3><p><strong>Field guide:</strong> you know the paths, but not which question interests your companion.<br><strong>Noor:</strong> you want a caption that says what the group really knows. You wonder whether the water looks the same upstream.</p><p>Give these roles separately before sharing the screen. Swap the operator when you reach Mei. Invite every learner to keep one sentence of their own.</p><h3>Listen for</h3><p>A claim, a relevant clue, a limit, and a next step. A short phrase and a pointed-out detail can be a useful start. Do not infer understanding from clicks.</p><h3>教材与语言</h3><p>以人教版九年级 Unit 13 环保主题为主，联系 Unit 3 问询与 Unit 8 推断。请按学校实际教材版次核对。对话为项目原创，正式逐句教师审校与试教仍待完成。</p></div>`);}
async function action(name,el){
 if(name==='modules')return openModuleMenu('C1');
 if(ui.busy&&!['settings','journal','close','export','pause','about','teacher','toggle-chinese','toggle-sound','audio-status','speak'].includes(name))return;
 if(name==='begin')return begin();
 if(name==='close')return closeModal();
 if(name==='settings')return settings();
 if(name==='teacher')return teacher();
 if(name==='journal')return journal();
 if(name==='export')return exportVisit();
 if(name==='speak')return speak(el.dataset.id);
 if(name==='toggle-chinese'){prefs.chinese=!prefs.chinese;saveAux(PREF_KEY,prefs);render();return;}
 if(name==='toggle-sound'){const unlocked=audio.unlock();prefs.muted=!prefs.muted;applyAudioPreferences();saveAux(PREF_KEY,prefs);await unlocked;render();return;}
 if(name==='audio-status'){if(ui.audioState?.blocked){await audio.unlock();reconcileAudio();}else if(ui.audioState?.failedLineId){await speak(ui.audioState.failedLineId);}else settings();return;}
 if(name==='material-study'){modal('Look at the material.',`<img class="material-detail" src="/illustrations/material-cover-v2.png" alt="Tan woven plant-fibre cover and four flat weighting stones"/><p class="photo-note">Look at the weave, the edges and the stones. How could you hold the cover in place while keeping the channel open?</p><p class="fine">A material illustration for this task. This is not a new field observation.</p>`);return;}
 if(name==='about'){modal('A valley worth noticing.',`<p class="lead">A real-time three-dimensional English fieldwork story for secondary-school learners.</p><p class="teacher-detail">This first playable visit implements one part of a twelve-story world. The environment is authored 3D geometry; the observations are fictional teaching records. The model compares a fixed scenario, not measured water quality.</p><p class="teacher-detail">The cast uses anatomical head and hand meshes with original clothing. Dialogue plays automatically with a different voice for each character; music follows the place and task. Fine facial acting, language review and classroom trials remain separate production work.</p><p class="fine">Three.js · Original scene and dialogue · CC0 MakeHuman base meshes · Cormorant Garamond & DM Sans (OFL). All progress remains on this device.</p>`);return;}
 if(name==='overview'){valley.overview();return;}
 if(name==='pause'){if(!perform('PAUSE_SAVED',{note:'Paused by the learner.'}))return;++ui.trialToken;++ui.audioOccurrence;audio.stopSpeech();ui.pendingTrial=null;valley.cancelNavigation?.();valley.setModel({active:false});ui.busy=false;closeModal();render();return;}
 if(name==='resume'){if(perform('RESUME_SAVED'))await restoreView();return;}
 if(name==='continue-walk')return walk(fields()['navigation.targetLocation']);
 if(name==='retry-recovery'){try{store.dispatch('INTERRUPTED_TRIAL_RECOVERED');closeModal();await begin();}catch(e){toast(e.message);}return;}
 if(name==='new-confirm'){modal('Start another visit?',`<p class="lead">The current visit is stored only on this device. Export it before replacing it with a fresh visit.</p>`,button('export','Export first')+button('new-visit','Start fresh','primary'));return;}
 if(name==='new-visit'){try{store.reset();media={};drafts={};saveAux(MEDIA_KEY,media);saveAux(DRAFT_KEY,drafts);ui.started=false;ui.lines=[];ui.support=[];++ui.trialToken;++ui.audioOccurrence;audio.stopSpeech();audio.enterScene({key:`intro:${ui.audioOccurrence}`,mood:'arrival',lineIds:[]});closeModal();valley.setWorldState(fields());valley.setModel({active:false});valley.overview();render();}catch(e){toast(e.message);}return;}
 if(name.startsWith('evidence-'))return showEvidence(name.split('-')[1]);
 if(name==='record-evidence'){
  const event=el.dataset.event,kind=el.dataset.kind;
  if(event==='BRIDGE_RECORD_OPENED'&&node()!=='j.bridge_record'){closeModal();return;}
  const c=kind==='bridge'?{bridgePairFullyOpened:true}:kind==='upper'?{upperPairFullyOpened:true}:{sourcePathInspected:true};
  if(perform(event,{},c))closeModal();return;
 }
 if(name==='cleanup'){
  if(fields()['world.litterRemoved'])return;
  const id=ui.commandIds.cleanup||=crypto.randomUUID();
  ui.busy=true;render();const transferred=await valley.collectBottle?.();ui.busy=false;
  if(transferred&&perform('LITTER_REMOVED',{}, {cleanupActionFinished:true,eventId:id})){delete ui.commandIds.cleanup;if(!capture(`cleanup.${id}`,'bridge_now'))toast('The action is saved, but its photograph is unavailable. You can still describe it in your own words.');}
  else{valley.setWorldState(fields());render();}return;
 }
 if(name==='investigate')return perform('INVESTIGATE_NOW');
 if(name==='water-question')return perform('ASK_WATER_COLOUR_QUESTION');
 if(name==='travel'){
  if(perform('MOVE_REQUESTED',{destination:el.dataset.location}))await walk(el.dataset.location);return;
 }
 if(name==='ask-mei')return perform('ASK_MEI_NEUTRALLY');
 if(name==='ask-mei-direct')return perform('ASK_MEI_DIRECTLY');
 if(name==='mei-continue')return perform('CONTINUE_MEI_INTERVIEW');
 if(name==='mei-record')return perform('MEI_INTERVIEW_RECORDED');
 if(name==='assemble'){if(perform('ASSEMBLE_COMPARISON'))await walk('loc.bare_bed',{model:true});return;}
 if(name==='stage-model'){await walk('loc.bare_bed',{model:true});perform('STAGING_READY');return;}
 if(name==='open-model'){if(!perform('COMPARISON_OPENED'))return;valley.setModel(modelOptions());await walk('loc.bare_bed',{model:true,repositionOnly:true});return;}
 if(name==='model-position'){
  if(fields()['model.candidatePosition']!=='no_cover')perform('MODEL_REPOSITION_REQUESTED');
  perform('COVER_POSITION_SELECTED',{position:el.dataset.position});ui.modelProgress=0;valley.setModel(modelOptions());return;
 }
 if(name==='run-trial')return runTrial();
 if(name==='cancel-trial'){if(!perform('TRIAL_CANCELLED'))return;++ui.trialToken;ui.pendingTrial=null;ui.modelProgress=0;valley.setModel(modelOptions());return;}
 if(name==='retry-trial-save')return completeTrial();
 if(name==='save-proposal'){if(perform('PROPOSAL_SAVED',{note:drafts.proposal||''})){valley.setModel({active:false});await walk('loc.bare_bed',{repositionOnly:true});}return;}
 if(name==='agree-plan')return perform('PURPOSE_AND_POSITION_CONFIRMED',{purpose:'cover_exposed_source_soil',position:'source_cover_zone'});
 if(name==='keep-proposal')return perform('KEEP_AS_PROPOSAL');
 if(name==='revise-model'){if(perform('REVISE_MODEL')){valley.setModel(modelOptions());await walk('loc.bare_bed',{model:true,repositionOnly:true});}return;}
 if(name==='implement')return perform('IMPLEMENTATION_REQUESTED');
 if(name==='check-material')return perform('MATERIALS_CHECKED');
 if(name==='pick-material')return perform('MATERIAL_PICKED_UP');
 if(name==='place-source'||name==='place-unrelated'){
  const zone=el.dataset.zone,transform=valley.getPlacementTransform?.(zone);if(!transform){toast('The placement surface is not ready.');return;}
  return perform('DRAFT_POSITION_UPDATED',{zone,transform});
 }
 if(name==='install'){
  const check=valley.validatePlacement?.(fields()['implementation.draftTransform']);if(!check){toast('Move the cover onto the agreed soil first.');return;}
  const id=ui.commandIds.install||=crypto.randomUUID();const {targetSurfaceAcceptsCover,placementBlocksRoute,coverOrientationValid}=check;
  if(perform('COVER_INSTALLED',{}, {targetSurfaceAcceptsCover,placementBlocksRoute,coverOrientationValid,eventId:id})){delete ui.commandIds.install;if(!capture(`implementation.${id}`,'installed'))toast('The placement is saved. Its photograph could not be kept; a written note is still possible.');}return;
 }
 if(name==='explain'){if(perform('EXPLAIN_CURRENT_RECORDS'))valley.setModel({active:false});return;}
 if(name==='editor')return editor();
 if(name==='save-explanation')return saveExplanation();
 if(name==='save-unresolved'){modal('A question worth coming back to.',`<p class="lead">What is still uncertain? Keep your own question, even if you cannot yet explain the whole story.</p><label class="field">A question or an unfinished thought<textarea data-draft="openQuestion" maxlength="1600" placeholder="We still do not know…">${esc(drafts.openQuestion||'')}</textarea></label><p class="fine">This keeps the evidence collected so far. It does not add a model result, an installation, or a return plan.</p>`,button('confirm-unresolved','Keep this question and save','primary'));return;}
 if(name==='confirm-unresolved'){if(perform('UNRESOLVED_SAVED',{note:drafts.openQuestion||''})){++ui.trialToken;ui.pendingTrial=null;valley.setModel({active:false});closeModal();}return;}
 if(name==='return-bridge'){if(perform('CONTINUE_TO_RETURN_CARD'))await walk('loc.stream_bridge');return;}
 if(name==='finish-walk')return walk('loc.stream_bridge');
 if(name==='return-note')return returnNote();
 if(name==='save-return'){if(perform('RETURN_CARD_SAVED',{card:drafts.returnCard})){closeModal();toast('A return is planned. 下一次观察已约定。');}return;}
 if(name==='finish'){perform('FINISH_SAVED',{note:fields()['followup.status']==='planned'?'Visit saved. Follow-up remains planned.':'Visit saved. No follow-up has been arranged.'});return;}
 if(name==='reopen')return perform('REOPEN_FIELDWORK');
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b&&!b.disabled)Promise.resolve(action(b.dataset.action,b)).catch(error=>toast(error.message));});
document.addEventListener('input',e=>{
 const el=e.target;
 if(el.dataset.draft)setDraft(el.dataset.draft,el.value);
 if(el.dataset.cardCaption){const cards=structuredClone(drafts.cards||fields()['explanation.cards']);cards[Number(el.dataset.cardCaption)-1].caption=el.value;setDraft('cards',cards);}
 if(el.dataset.return){const card={...(drafts.returnCard||fields()['followup.card'])};card[el.dataset.return]=el.value;setDraft('returnCard',card);}
});
document.addEventListener('change',e=>{
 const el=e.target;
 if(el.dataset.cardSource){const cards=structuredClone(drafts.cards||fields()['explanation.cards']);cards[Number(el.dataset.cardSource)-1].sourceId=el.value||null;setDraft('cards',cards);editor();}
 if(el.dataset.pref){void audio.unlock();prefs[el.dataset.pref]=el.type==='checkbox'?el.checked:el.type==='range'?Number(el.value):el.value;applyAudioPreferences();saveAux(PREF_KEY,prefs);valley?.setReducedMotion?.(prefs.reduced);valley?.setQuality?.(prefs.quality);document.body.classList.toggle('translation-off',!prefs.chinese);render();}
 if(el.id==='visit-mode')ui.mode=el.value;
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&ui.modal)closeModal();
 if(e.key==='Tab'&&ui.modal){const list=[...document.querySelectorAll('#overlay-root button:not(:disabled),#overlay-root input,#overlay-root select,#overlay-root textarea,#overlay-root summary')];const first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
});
render();
try{
const {createValley}=await import('./world/renderer.js');
valley=createValley($('#valley'),{
 onReady(){ui.ready=true;ui.error=null;if(bindingsCompatible()){valley?.setWorldState(fields());sceneMedia.prepare(valley);const workshop=createWorkshopStore(localStorage);if(!workshop.loadError)valley?.setArtwork(workshop.state.artwork);}render();},
 onError(error){ui.ready=false;ui.error='The 3D view is unavailable. Please enable WebGL in a current browser, or reload this visit. Your saved record is preserved.';toast(error.message||ui.error);render();},
 onPick(target){
  if(!ui.started||ui.busy)return;
  const map={bottle:'cleanup',evidence_bridge:'evidence-bridge',evidence_upper:'evidence-upper',evidence_path:'evidence-path',mei:'ask-mei',model:'assemble',cover:'pick-material',material_study:'material-study'};
  if(target.action==='model_source'||target.action==='model_unrelated'){if(node()==='j.model')action('model-position',{dataset:{position:target.action==='model_source'?'source_cover_zone':'unrelated_zone'}});return;}
  if(target.locationId!==fields()['navigation.currentLocation']){toast(`Walk to ${locations[target.locationId]?.name||'that place'} first.`);return;}
  const a=map[target.action];if(a)action(a,{dataset:{}}).catch?.(e=>toast(e.message));
 },
});
valley?.setReducedMotion?.(prefs.reduced);valley?.setQuality?.(prefs.quality);
}catch(error){ui.error='The valley could not load. Reload the page to try again. Your saved visit remains on this device.';toast(error.message||ui.error);render();}
window.addEventListener('pagehide',()=>{++ui.trialToken;audio.suspend();});
window.addEventListener('pageshow',event=>{if(event.persisted)void audio.resume();});
