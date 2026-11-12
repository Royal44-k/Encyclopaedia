import './ui/styles.css';
import './ui/visit.css';
import './ui/experience-v2.css';
import './ui/night.css';
import {mountImmersiveShell} from './ui/immersive-shell.js';
import {openModuleMenu} from './ui/module-menu.js';
import {createNightStore} from './core/night-inquiry.js';
import {createWorkshopStore} from './core/workshop.js';
import {createAudioDirector} from './audio/audio-director.js';
import {createNightSources} from './audio/night-sources.js';
import {nightLines,nightSoundDescriptions} from './content/night-content.js';

const $=selector=>document.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(action,label,extra='',style='secondary')=>`<button type="button" class="${style}" data-night-action="${action}" ${extra}>${label}</button>`;
const store=createNightStore(localStorage), state=()=>store.state;
const ui={ready:false,entered:false,busy:false,playing:false,cues:[],cueCount:0,events:[],pending:null,photo:null,error:'',draft:null,dialog:null,token:0};
let valley;
const immersive=mountImmersiveShell();
const prefKey='english-valley.preferences.v1';let oldPrefs={};try{oldPrefs=JSON.parse(localStorage.getItem(prefKey))||{};}catch{}
const prefs={chinese:true,sound:true,music:true,ambience:true,muted:false,speechVolume:.95,musicVolume:.19,ambienceVolume:.13,effectVolume:.7,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,quality:'standard',...oldPrefs};
if(oldPrefs.audioVersion!==2)Object.assign(prefs,{sound:true,music:true,ambience:true,muted:false,audioVersion:2});
const spots={stairs:{name:'By the stairs',cn:'楼梯地面观察位'},other:{name:'The other side',cn:'装置另一侧'},doorway:{name:'Beside the conservatory',cn:'温室西侧 · Mei的观察位'},workshop:{name:'Sam’s workshop',cn:'西侧工坊'}};
const kinds={baseline:'Free movement',held:'Held still',separated:'A wider gap',board:'A deliberate step'};
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),5200);}
function refreshSound(s){
  document.body.dataset.audioLine=s.currentId||'';document.body.dataset.audioMusic=s.musicPlaying||'';document.body.dataset.audioState=s.muted?'muted':s.speaking?'speaking':s.blocked?'blocked':'ready';
  document.querySelectorAll('[data-night-line]').forEach(el=>el.classList.toggle('is-speaking',s.speaking&&el.dataset.nightLine===s.currentId));
  const label=$('#night-sound-status');if(label)label.textContent=s.muted?'Sound off':ui.playing?'Listening to the sources':s.blocked?'Tap to enable sound':s.failedLineId?'Voice paused · retry':s.speaking?`${nightLines[s.currentId]?.speaker||'Narrator'} · speaking`:'Evening in the valley';
  const caption=$('#night-dialog-caption');if(caption){caption.hidden=!s.speaking;caption.textContent=nightLines[s.currentId]?.english||'';}
  immersive.updateSpeech();
}
const audio=createAudioDirector({lines:nightLines,onState:refreshSound,onSpeaker:name=>valley?.setSpeaking(name,Boolean(name)),onError:()=>toast('A voice could not load. Use its replay button to retry.')});
const sources=createNightSources({onError:()=>toast('A source sound could not load. The matching event captions remain available; retry before listening again.')});
function applyPrefs(){audio.setEnabled(prefs.sound);audio.setMusicEnabled(prefs.music);audio.setAmbienceEnabled(prefs.ambience);audio.setMuted(prefs.muted);audio.setVolumes({speech:prefs.speechVolume,music:ui.playing?.035:prefs.musicVolume,ambience:ui.playing?.055:prefs.ambienceVolume});sources.setMuted(prefs.muted);sources.setVolume(prefs.effectVolume);valley?.setReducedMotion(prefs.reduced);valley?.setQuality(prefs.quality);document.body.classList.toggle('translation-off',!prefs.chinese);}
function rememberPrefs(){let saved=true;try{localStorage.setItem(prefKey,JSON.stringify(prefs));}catch{saved=false;toast('The sound settings could not be saved.');}const status=$('#night-settings-status');if(status)status.textContent=saved?'Settings saved.':'These settings work for this visit, but could not be saved. Change a setting again to retry.';applyPrefs();}
applyPrefs();
const manifestReady=Promise.all(['/audio/manifest.json','/audio/night-manifest.json'].map(async url=>{const r=await fetch(url);if(!r.ok)throw Error('Sound library unavailable');return r.json();})).then(([base,chapter])=>{audio.setManifest({...base,...chapter,voices:{...base.voices,...chapter.voices},lines:{...base.lines,...chapter.lines},music:{...base.music,...chapter.music},ambience:{...base.ambience,...chapter.ambience}});return true;}).catch(()=>{ui.error='The sound library could not load. Refresh to retry; the written content is still available.';return false;});
function say(ids=[],mood=state().stage==='end'?'night_reflection':'night'){ui.cues=ids;audio.enterScene({key:`T02:${++ui.cueCount}:${state().location}`,mood,lineIds:ids,ambience:'night_wind'});render();}
function commit(event,input={},redraw=true){try{store.dispatch(event,input);if(redraw)render();return true;}catch(error){toast(error.message);return false;}}
const ground=()=>['stairs','other'].includes(state().location);
const runKind=()=>state().boardTest?'board':state().held?'held':state().separated?'separated':'baseline';
function dialogue(){return ui.cues.map(id=>{const row=nightLines[id];return row?`<div class="dialogue" data-night-line="${id}"><div class="speaker">${esc(row.speaker)}${button('replay','♪',`data-id="${id}" aria-label="Replay ${row.speaker}'s line"`,'replay')}</div><p>${esc(row.english)}</p><div class="cn">${esc(row.chinese)}</div></div>`:'';}).join('');}
const heading=(kicker,title,lead='')=>`<div class="eyebrow">${kicker}</div><h2>${title}</h2>${lead?`<p class="lead">${lead}</p>`:''}`;
function captionList(){return `<div id="night-event-list" class="night-event-list" role="log" aria-label="Matching descriptions of the source events">${ui.events.length?ui.events.map((e,i)=>`<span><i>${i+1}</i>${esc(nightSoundDescriptions[e.kind].english)} <small>${e.pan<-.2?'to the left':e.pan>.2?'to the right':'ahead'}</small><em class="cn">${esc(nightSoundDescriptions[e.kind].chinese)}</em></span>`).join(''):'<span class="fine">Descriptions appear with the same actions that produce the sounds.</span>'}</div>`;}
function listening(){return `<div class="night-listen"><div class="night-conditions"><span>FIXED WIND · SAME DURATION</span><strong>${kinds[runKind()]}</strong></div>${ui.pending?`<p class="error-note">The comparison finished, but its record could not be saved.</p><div class="actions">${button('retry-run','Retry saving the record','','primary')}${button('discard-run','Leave this run unrecorded')}</div>`:button(ui.playing?'stop':'listen',ui.playing?'■ Stop this replay':'▷ Listen & watch again','','primary')}${captionList()}<p class="fine">可重复的固定条件教学情境；声音和文字描述同步。停止或离开时，不写入“已完成观察”。</p></div>`;}
function positionLinks(){return `<div class="night-positions">${Object.entries(spots).map(([id,p])=>button('travel',`${p.name}<small class="cn">${p.cn}</small>`,`data-location="${id}" aria-pressed="${state().location===id}"`,'choice')).join('')}</div>`;}
function controls(){
  const s=state();
  if(s.location==='doorway')return `<div class="actions stack">${button('ask-mei','Ask Mei about the shadow')}${button('photo','Photograph this viewpoint')}${s.testimony.shadow?button('mei-reflect','Compare what Mei could see','','text-button'):''}</div>`;
  if(s.location==='workshop')return `<div class="actions stack">${button('ask-sam','Ask Sam about the moving piece')}${button('photo','Keep a photograph from here')}</div><p class="fine">Sam’s apparatus belongs to Sam. Your T01 work remains where you left it; no borrowing permission is assumed.</p>`;
  return `<div class="night-apparatus"><span class="tool-label">Change one condition · 改变一个条件</span><div class="actions">${button('hold',s.held?'Release the piece':'Ask Sam to hold it',`aria-pressed="${s.held}"`)}${button('separate',s.separated?'Restore the original gap':'Move the metal farther away',`aria-pressed="${s.separated}"`)}${button('board',s.boardTest?'Return to the ordinary replay':s.held?'Release & check the board':'Ask Sam to step on the board',`aria-pressed="${s.boardTest}"`)}</div><p class="fine">${s.boardTest?'Watch the first stair as Sam applies a small load.':s.separated?'The piece can still move. Only the gap has changed.':s.held?'The piece is fixed. The wind condition and the board are unchanged.':'The piece is free, with the original gap.'}</p><div class="actions">${button('ask-sam','Ask Sam directly','','text-button')}${button('photo','Photograph this view','','text-button')}</div></div>`;
}
function support(){return `<details class="support"><summary>Words if you need them · 表达帮助</summary><p>I heard… near…</p><p>It might be…</p><p>I think… because I noticed…</p>${state().verified.tap?'<p>The tapping stopped. The creak didn’t.</p>':''}${state().verified.board&&state().verified.tap?'<p>The two sounds had different causes.</p>':''}<p>I still don’t have enough information.</p><p class="fine">Observation, someone’s account, and an explanation are different kinds of knowledge. 用自己的话表达，不必照读。</p></details>`;}
function story(){
  const s=state();
  if(store.loadError)return `${heading('Your notebook is protected','This record needs attention.',store.loadError.message)}<div class="actions stack">${button('raw','Download the original record')}${button('reload-record','Try reading it again')}${button('recover','Archive the original and start again',store.canRecover?'':'disabled')}</div>`;
  if(!ui.entered)return `${heading('T02 · The treehouse at dusk','There it is again.','Three light taps. A pause. Then two more. From the ground, can you find out what moved?')}<div class="cn">树屋夜声 · 换位置听、看影子、做对照，也可以保留未知。</div><div class="actions">${button('begin',s.stage==='entry'?'Follow the evening path ↗':'Return to my listening notes ↗',ui.ready?'':'disabled','primary')}</div><p class="fine">Year 9 · Unit 8 · An original valley story<br>声音平缓，无惊吓；所有关键声音有同步描述。</p>`;
  if(s.stage==='end'){
    const title=s.outcome==='both'?'Two sounds.<br>Two different causes.':s.outcome==='tapping'?'One sound explained.<br>Another question kept.':'A question worth<br>coming back to.';
    return `${heading('Your evening notebook',title)}${dialogue()}<p class="lead">${s.outcome==='both'?'What changed your mind? Tell a partner which observation helped you distinguish the two sounds.':s.outcome==='tapping'?'Your comparison explains the tapping. The board has not yet had its own controlled check.':s.verified.board?'You checked the board. The tapping still needs its own comparison.':'Keep the place and the sound you want to return to. A good question can stay open.'}</p>${s.note?`<p class="photo-note">${esc(s.note)}</p>`:''}<div class="actions stack">${button('resume','Return to the treehouse','','primary')}${button('journal','Read my listening notebook')}${button('export','Download this visit')}${button('modules','Choose another valley story')}</div>`;
  }
  return `${heading('Listen · look · change one thing',spots[s.location].name,s.location==='doorway'?'The same lamp, the same moving piece, seen from farther away.':s.location==='workshop'?'Ask what Sam actually knows. An account can guide your next check.':'Two kinds of sound can come from the same direction.')}${dialogue()}${listening()}${controls()}${positionLinks()}<div class="night-knowledge"><span>${s.verified.tap?'✓ Tapping checked':'Tapping: still a question'}</span><span>${s.verified.board?'✓ Board checked':'Board: not yet tested'}</span></div>${support()}<div class="actions">${button('journal','Keep my own explanation')}${button('finish','Save what I know so far','','text-button')}</div>`;
}
function render(){
  const active=document.activeElement,focusId=active?.id,focusAction=active?.dataset?.nightAction,focusLocation=active?.dataset?.location;
  document.body.classList.add('night-page');document.body.classList.toggle('in-visit',ui.entered);document.body.dataset.nightStage=state().stage;document.body.dataset.nightLocation=state().location;document.body.dataset.nightRun=ui.playing?'running':ui.pending?'unsaved':'idle';
  $('#app').innerHTML=`<header class="topbar"><div class="wordmark"><h1>THE ENGLISH VALLEY</h1><p>A place to notice. A reason to speak.</p><div class="weather">T02 <i></i> THE TREEHOUSE <i></i> AT DUSK</div></div><div class="toolbar">${button('language',prefs.chinese?'EN / 中文':'EN','','pill-button')}${button('mute',prefs.muted?'♪̸':'♪',`aria-label="Toggle all sound" aria-pressed="${!prefs.muted}"`,'icon-button sound-toggle')}${button('settings','☷','aria-label="Sound and display settings"','icon-button')}</div></header><div class="stage-tag">${esc(spots[state().location].name)} · A GROUND-LEVEL VISIT</div>${ui.entered?`<button class="sound-state" data-night-action="sound-status"><span id="night-sound-status">Evening in the valley</span></button>`:''}<section id="story-panel" class="story-panel ${ui.entered?'':'hero'}" aria-label="Night inquiry and actions" tabindex="-1">${ui.error?`<p class="error-note">${esc(ui.error)}</p>`:''}${story()}</section><nav class="location-nav"><div class="nav-left">${button('modules','Valley stories','','')}${button('journal','Listening notebook','','')}${button('teacher','Classroom notes','','')}</div><div class="nav-right">${ui.entered?`<span class="night-save">Saved locally · v${state().revision}</span>`:''}${button('export','↓ Visit record','','')}</div></nav>`;
  const safe=['stop','mute','settings','language','sound-status'];if(ui.busy||ui.playing||ui.pending)document.querySelectorAll('#app [data-night-action]').forEach(el=>{if(!safe.includes(el.dataset.nightAction)&&!(ui.pending&&['retry-run','discard-run','export'].includes(el.dataset.nightAction)))el.disabled=true;});
  if(ui.busy)$('#app').insertAdjacentHTML('beforeend','<div class="walk-note"><i class="loading-indicator"></i>Following the evening path…</div>');
  immersive.sync();
  // Keep destinations, the live sound transcript and apparatus controls in
  // separate columns so a finished sound log cannot push every action away.
  if(ui.entered&&state().stage==='explore'&&!store.loadError){
    const panel=$('#story-panel'),context=panel.querySelector('.immersive-context'),spoken=panel.querySelector('.immersive-dialogue');
    panel.classList.remove('without-dialogue');
    for(const selector of ['.night-positions','.night-knowledge']){const node=panel.querySelector(selector);if(node)context.append(node);}
    const events=panel.querySelector('.night-event-list');if(events){const notes=document.createElement('div');notes.className='night-source-notes';notes.dataset.lessonPane='sounds';notes.innerHTML='<span class="tool-label">SOUND NOTES · 声音记录</span>';notes.append(events);spoken.append(notes);}
  }
  const focus=focusId?document.getElementById(focusId):focusAction?[...document.querySelectorAll(`[data-night-action="${focusAction}"]`)].find(el=>!focusLocation||el.dataset.location===focusLocation):null;focus?.focus({preventScroll:true});
  refreshSound(audio.getState());
}
function stopRun(){++ui.token;valley?.stopNightSequence();sources.stop();ui.playing=false;applyPrefs();render();}
async function arrive(location){
  if(ui.busy||ui.playing||ui.pending)return;
  if(state().location===location)return;
  if(state().held&&['doorway','workshop'].includes(location)){if(!commit('HOLD',{value:false},false))return;toast('Sam releases the piece before we leave.');}
  ui.busy=true;audio.stopSpeech();sources.stop();render();
  const arrived=await valley.setNightInquiry({...state(),location,boardTest:false});ui.busy=false;
  if(!arrived){render();return;}
  if(!commit('VISIT',{location},false)){await valley.setNightInquiry(state());render();return;}
  ui.photo=null;
  if(location==='doorway'){commit('FACT_HEARD',{fact:'shadow'},false);say(['T02.008']);}
  else if(location==='workshop'){commit('FACT_HEARD',{fact:'device'},false);say(['T02.010']);}
  else say(state().held&&location==='stairs'?['T02.015']:state().verified.tap?(state().verified.board?[]:['T02.018']):['T02.001']);
}
async function run({opening=false}={}){
  if(ui.playing||ui.busy||ui.pending||state().stage!=='explore')return;
  const token=++ui.token;ui.playing=true;ui.events=[];audio.stopSpeech();applyPrefs();render();
  const unlocked=sources.unlock();await unlocked;await sources.prepare();
  if(token!==ui.token)return;
  const current=state(),kind=runKind();
  const complete=await valley.playNightSequence({held:current.held,separated:current.separated,board:current.boardTest},event=>{
    if(token!==ui.token)return;ui.events.push(event);void sources.play(event);
    const list=$('#night-event-list');if(list){list.outerHTML=captionList();$('#night-event-list').scrollTop=10000;}
  });
  if(token!==ui.token)return;
  ui.playing=false;applyPrefs();
  if(!complete){sources.stop();render();return;}
  const input={kind,tapCount:ui.events.filter(e=>e.kind==='tap').length,creakCount:ui.events.filter(e=>e.kind==='creak').length};
  if(!commit('RUN_COMPLETED',input,false)){ui.pending={input,location:current.location,held:current.held,separated:current.separated,boardTest:current.boardTest};render();return;}
  if(opening)say(['T02.001','T02.003']);else afterRun();
}
function afterRun(){
  const s=state();
  if(s.boardTest&&ground()){commit('FACT_HEARD',{fact:'board'},false);say(['T02.023']);}
  else if(s.verified.tap&&!s.verified.board&&ground())say(['T02.018']);
  else if(!s.verified.tap&&!s.verified.board&&ground())say(['T02.011']);
  else say([]);
}
async function apparatus(event,value){
  if(!commit(event,{value},false))return;ui.busy=true;audio.stopSpeech();render();const arrived=await valley.setNightInquiry(state());ui.busy=false;if(!arrived){render();return;}
  if(event==='HOLD'&&value)say(['T02.013']);
  else if(event==='SEPARATE'&&value)say(['T02.016']);
  else if(event==='BOARD'&&value){say([]);await run();}
  else say([]);
}
function openDialog(title,body){ui.dialog?.close();const d=document.createElement('dialog');d.className='valley-dialog night-dialog';d.setAttribute('aria-labelledby','night-dialog-title');d.innerHTML=`<form method="dialog"><button class="dialog-close" aria-label="Close dialog">×</button></form><h2 id="night-dialog-title">${title}</h2><p id="night-dialog-caption" class="modal-spoken-line" hidden></p>${body}`;document.body.append(d);ui.dialog=d;d.addEventListener('close',()=>{d.remove();if(ui.dialog===d)ui.dialog=null;});d.showModal();refreshSound(audio.getState());}
function journal(){
  if(state().stage==='entry'){openDialog('An evening worth listening to.',`<p class="lead">Your notebook will open when you join Rowan by the treehouse. Keep what you notice, what someone tells you, and what you still wonder about.</p><p class="cn">进入树屋故事后，即可记录自己的观察和问题。</p>`);return;}
  const s=state();openDialog('What did you actually notice?',`<div class="night-journal-grid"><div><p class="lead">An account is not the same as a test. Keep your own explanation or your next question.</p><label class="field">My words · 我的解释或问题<textarea id="night-note" maxlength="1800" placeholder="I noticed… / It might be… / I still want to check…">${esc(ui.draft??s.note)}</textarea></label>${button('save-note','Keep my words','','primary')}<p class="fine" id="night-note-status">${ui.draft!==null?'Not yet saved.':'Saved words are kept on this device.'}</p><p class="fine">${s.testimony.device?'Sam’s account about the apparatus heard. ':''}${s.testimony.shadow?'Mei’s viewpoint account heard. ':''}${s.testimony.board?'Sam’s explanation about the board heard.':''}</p></div><div><h3>Completed listening records</h3>${s.observations.length?`<table class="night-records"><thead><tr><th>Place / condition</th><th>Tap</th><th>Creak</th></tr></thead><tbody>${s.observations.map(row=>`<tr><td>${spots[row.location].name}<small>${kinds[row.kind]} · fixed wind</small></td><td>${row.tapCount}</td><td>${row.creakCount}</td></tr>`).join('')}</tbody></table>`:'<p class="fine">No completed replay has been recorded. You can still keep a question.</p>'}</div></div>`);
}
function saveNote(){const text=$('#night-note')?.value??ui.draft;if(text===null||text===undefined)return true;if(commit('NOTE',{text},false)){ui.draft=null;const label=$('#night-note-status');if(label)label.textContent='Saved.';render();return true;}ui.draft=text;const label=$('#night-note-status');if(label){label.textContent='Could not save. Your words are still here. Select “Keep my words” to retry.';label.setAttribute('role','alert');}return false;}
function download(data,name){const url=URL.createObjectURL(new Blob([typeof data==='string'?data:JSON.stringify(data,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function act(action,el){
  if(action==='begin'){
    if(ui.busy||!ui.ready||store.loadError)return;
    ui.busy=true;render();
    const unlockVoice=audio.unlock(),unlockEffects=sources.unlock();await Promise.all([unlockVoice,unlockEffects,manifestReady]);await sources.prepare();
    const firstVisit=state().stage==='entry';
    if(!ui.ready||store.loadError){ui.busy=false;render();return;}
    if(firstVisit&&!commit('BEGIN',{},false)){ui.busy=false;render();return;}
    ui.entered=true;ui.busy=true;render();const arrived=await valley.setNightInquiry(state());ui.busy=false;if(!arrived){render();return;}
    if(firstVisit){say([]);await run({opening:true});}
    else say(state().stage==='end'?(state().outcome==='open'?['T02.022']:[]):state().location==='doorway'?['T02.008']:state().location==='workshop'?['T02.010']:['T02.001','T02.003']);return;
  }
  if(action==='stop'){stopRun();toast('Replay stopped. No observation was added.');return;}
  if(action==='mute'){void audio.unlock();void sources.unlock();prefs.muted=!prefs.muted;rememberPrefs();render();return;}
  if(action==='language'){prefs.chinese=!prefs.chinese;rememberPrefs();render();return;}
  if(action==='settings'){openDialog('Listen comfortably',`${[['sound','Character voices'],['music','Scene music'],['ambience','Evening wind'],['reduced','Reduce ambient motion']].map(([k,label])=>`<label class="settings-row"><span>${label}</span><input type="checkbox" data-night-pref="${k}" ${prefs[k]?'checked':''}></label>`).join('')}${[['speechVolume','Voice volume'],['musicVolume','Music volume'],['effectVolume','Tap and creak volume']].map(([k,label])=>`<label class="settings-row volume-row"><span>${label}</span><input type="range" min="0" max="1" step=".01" data-night-pref="${k}" value="${prefs[k]}"></label>`).join('')}<p id="night-settings-status" class="fine" role="status"></p><p class="fine">关键声源有同等信息的同步字幕。对白与背景音乐在对照期间让位于声源；静音仍可以观察动作和描述。</p>`);return;}
  if(action==='sound-status'||action==='replay'){if(ui.playing)return;const unlocked=audio.unlock();prefs.sound=true;prefs.muted=false;rememberPrefs();await unlocked;const id=el.dataset.id||audio.getState().failedLineId||audio.getState().currentId||ui.cues[0];if(id)await audio.replay(id);return;}
  if(ui.playing||ui.busy)return;
  if(!ui.ready&&['listen','travel','hold','separate','board','photo','resume','finish'].includes(action)){toast('The scene is still preparing.');return;}
  if(ui.pending&&!['retry-run','discard-run','export'].includes(action))return;
  if(action==='listen')return run();
  if(action==='travel')return arrive(el.dataset.location);
  if(action==='hold')return apparatus('HOLD',!state().held);
  if(action==='separate')return apparatus('SEPARATE',!state().separated);
  if(action==='board')return apparatus('BOARD',!state().boardTest);
  if(action==='ask-sam'){if(commit('FACT_HEARD',{fact:'device'},false))say(['T02.010']);return;}
  if(action==='ask-mei'){if(commit('FACT_HEARD',{fact:'shadow'},false))say(['T02.008']);return;}
  if(action==='mei-reflect'){say(['T02.025']);return;}
  if(action==='photo'){ui.photo=valley.captureNightView();if(!ui.photo){toast('The photograph could not be captured.');return;}openDialog('The same place, from here.',`<img class="material-detail" src="${ui.photo}" alt="Actual dusk viewpoint in the same valley"><p class="fine">${spots[state().location].name} · current scene. A photograph alone does not identify a sound.</p>`);return;}
  if(action==='journal'){journal();return;}
  if(action==='save-note'){saveNote();return;}
  if(action==='retry-run'){const p=ui.pending;if(!p)return;const same=['location','held','separated','boardTest'].every(k=>state()[k]===p[k]);if(!same){toast('The listening conditions changed. Leave this run unrecorded and repeat it.');return;}if(commit('RUN_COMPLETED',p.input,false)){ui.pending=null;afterRun();}return;}
  if(action==='discard-run'){ui.pending=null;render();return;}
  if(action==='finish'){if(!saveNote()||!commit('FINISH',{},false))return;ui.busy=true;render();const arrived=await valley.setNightInquiry(state());ui.busy=false;if(!arrived){render();return;}const rowanHere=ground();say(state().outcome==='both'?[]:rowanHere?(state().outcome==='tapping'?['T02.018']:['T02.022']):[],'night_reflection');return;}
  if(action==='resume'){if(commit('RESUME',{},false)){ui.busy=true;render();const arrived=await valley.setNightInquiry(state());ui.busy=false;if(!arrived){render();return;}say([]);}return;}
  if(action==='modules'){if(saveNote()){stopRun();openModuleMenu('T02');}return;}
  if(action==='export'){if(saveNote())download({chapter:'T02',record:state(),photograph:ui.photo,unfinishedReplay:ui.pending?.input||null,notice:'Authored fixed-condition listening scenario; not a real-world structural diagnosis.'},'english-valley-night-notes.json');return;}
  if(action==='raw'){download(store.exportRaw(),'english-valley-original-night-record.json');return;}
  if(action==='reload-record'){store.retryLoad();render();return;}
  if(action==='recover'){store.recover();render();return;}
  if(action==='teacher'){openDialog('Who knows what?',`<p class="lead">人教版九年级Unit 8 Section A 3a–3c的观察与推断主题；本山谷谜题和人物对白为原创，不补写教材中未揭晓的答案。</p><ol class="night-teacher"><li>先听和描述，不急着命名原因。两人交换“我听见的”“别人说的”“我推测的”。</li><li>选择观察位，必要时问Sam或Mei。他们如实说出自己的经历，不故意隐瞒。</li><li>先保留原条件，再固定一个部件；在同一观察位、相同风条件下比较。另一个声响是否仍在？</li><li>木板需要自己的动作对照。只有完成回放才进入观察记录；停止播放不算完成。</li><li>用英语向伙伴说明证据怎样改变判断，也可以记录尚未解答的问题。不会因“未知”扣分。</li></ol><p class="photo-note">轻敲与木响没有暗示结构危险。所有操作在地面等价观察位完成；本情境不构成现实建筑安全判断。</p><p class="fine">T01作品保持原位置，本轮使用Sam的独立装置。悬挂适配和另行借展许可尚未实现。声音使用原创合成与独立角色声线，教师审校与人耳混音试听仍待开展。</p>`);return;}
}
document.addEventListener('click',event=>{const el=event.target.closest('[data-night-action]');if(el&&!el.disabled)Promise.resolve(act(el.dataset.nightAction,el)).catch(error=>toast(error.message));});
document.addEventListener('input',event=>{const el=event.target;if(el.id==='night-note'){ui.draft=el.value;$('#night-note-status').textContent='Not yet saved.';}if(el.dataset.nightPref){prefs[el.dataset.nightPref]=el.type==='checkbox'?el.checked:Number(el.value);rememberPrefs();}});
document.addEventListener('change',event=>{if(event.target.id==='night-note')saveNote();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&ui.playing)stopRun();});
window.addEventListener('pagehide',()=>{++ui.token;valley?.stopNightSequence();sources.stop();audio.suspend();});
window.addEventListener('pageshow',event=>{if(event.persisted)void audio.resume();});
render();
try{
  const {createValley}=await import('./world/renderer.js');
  valley=createValley($('#valley'),{async onReady(){applyPrefs();const works=createWorkshopStore(localStorage);if(!works.loadError)valley.setArtwork(works.state.artwork);const arrived=await valley.setNightInquiry(state());ui.ready=Boolean(arrived);render();},onError(error){ui.ready=false;ui.busy=false;ui.error='The 3D view is unavailable. Reload to retry; your saved records are preserved.';stopRun();toast(error.message);render();},onPick(target){if(!ui.ready||!ui.entered||ui.playing||ui.busy||ui.pending||state().stage!=='explore')return;if(target.action==='night_device'&&ground())void apparatus('HOLD',!state().held);if(target.action==='night_board'&&ground())void apparatus('BOARD',!state().boardTest);}});
}catch(error){ui.error=error.message;render();}
