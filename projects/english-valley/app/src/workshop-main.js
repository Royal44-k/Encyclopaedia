import { mountImmersiveShell } from './ui/immersive-shell.js';
import './ui/styles.css';
import './ui/visit.css';
import './ui/experience-v2.css';
import './ui/workshop.css';
import { createWorkshopStore } from './core/workshop.js';
import { createAudioDirector } from './audio/audio-director.js';
import { workshopLines, workshopStory } from './content/workshop-content.js';
import { openModuleMenu } from './ui/module-menu.js';

const immersive = mountImmersiveShell();
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button = (action, label, extra = '', style = 'secondary') => `<button type="button" class="${style}" data-work-action="${action}" ${extra}>${label}</button>`;
const bilingual = (en, cn) => `${en}<span class="cn">${cn}</span>`;
const key = 'english-valley.preferences.v1';
let savedPrefs = {}; try { savedPrefs = JSON.parse(localStorage.getItem(key)) || {}; } catch {}
const prefs = { chinese:true, sound:true, music:true, ambience:true, muted:false, speechVolume:.95, musicVolume:.19, ambienceVolume:.13, reduced:matchMedia('(prefers-reduced-motion: reduce)').matches, quality:'standard', ...savedPrefs };
if (savedPrefs.audioVersion !== 2) Object.assign(prefs,{sound:true,music:true,ambience:true,muted:false,audioVersion:2});
const store = createWorkshopStore(localStorage);
const ui = {ready:false,active:false,busy:false,worldPromise:null,error:'',cues:[],cueCount:0,photo:null,labelDraft:null,selection:'body',dialog:null,audio:null,demonstrating:false,sceneEpoch:0};
let valley;
const partNames = {ring:'Old metal ring',tin:'Small tin',branch:'Pruned branch',cap:'Bottle cap',cloth:'Cloth offcut',fan:'Folded card'};
const partChinese = {ring:'旧金属环',tin:'小铁罐',branch:'修剪下的树枝',cap:'瓶盖',cloth:'布料边角',fan:'折叠纸片'};
const partSketch = {
  ring:'<circle cx="30" cy="25" r="17"/><circle cx="30" cy="25" r="12"/>',
  tin:'<ellipse cx="30" cy="11" rx="14" ry="5"/><path d="M16 11v26c0 7 28 7 28 0V11M17 22h26M17 31h26"/>',
  branch:'<path d="m16 43 20-36-9 26 21-10M27 24 14 17"/>',
  cap:'<path d="m30 8 7 4 8 2 1 8 3 7-6 6-3 8-9-1-8 2-5-7-7-5 2-8 1-8 8-3Z"/><circle cx="30" cy="26" r="11"/>',
  cloth:'<path d="m11 10 34 3 5 30-18-6-18 5Z M19 13l7 25M37 15l5 21"/>',
  fan:'<path d="m30 44-23-27 8-10 13 2 12-3 13 14Z M30 44 15 7M30 44 28 9M30 44 40 6"/>',
};
const state = () => store.state;
const movable = () => state().artwork.joint === 'pivot' && state().artwork.parts.body !== 'tin';
function toast(text) { $('#toast').textContent=text; $('#toast').classList.add('visible'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),5000); }
function refreshSound(s) {
  ui.audio=s;
  document.body.dataset.audioLine=s.currentId||'';
  document.body.dataset.audioMusic=s.musicPlaying||'';
  document.body.dataset.audioState=s.muted?'muted':s.speaking?'speaking':s.blocked?'blocked':'ready';
  const status=$('#work-sound-status'); if(status) status.textContent=s.muted?'Sound off':s.blocked?'Tap to enable sound':s.failedLineId?'Voice paused · retry':s.speaking?`${workshopLines[s.currentId]?.speaker || 'Narrator'} · speaking`:'Music & garden';
  document.querySelectorAll('[data-work-line]').forEach(el=>el.classList.toggle('is-speaking',s.speaking && el.dataset.workLine===s.currentId));
  const caption=$('#work-live-caption'); if(caption){caption.hidden=!s.speaking;caption.textContent=s.speaking?workshopLines[s.currentId]?.english||'':'';}
  immersive.updateSpeech();
  const dialogCaption=$('#work-dialog-caption');if(dialogCaption){dialogCaption.hidden=!s.speaking;dialogCaption.textContent=caption?.textContent||'';}
}
const audio = createAudioDirector({lines:workshopLines,onState:refreshSound,onSpeaker:name=>valley?.setSpeaking(name,Boolean(name)),onError:()=>toast('A sound could not load. Use its replay button to retry. 声音加载失败，可点击重听。')});
function applyPreferences() {
  audio.setEnabled(prefs.sound);audio.setMusicEnabled(prefs.music);audio.setAmbienceEnabled(prefs.ambience);audio.setMuted(prefs.muted);
  audio.setVolumes({speech:prefs.speechVolume,music:prefs.musicVolume,ambience:prefs.ambienceVolume});
  valley?.setReducedMotion(prefs.reduced); valley?.setQuality(prefs.quality);
  document.body.classList.toggle('translation-off',!prefs.chinese);
}
applyPreferences();
const manifestReady = Promise.all(['/audio/manifest.json','/audio/workshop-manifest.json'].map(async url=>{const r=await fetch(url);if(!r.ok)throw new Error('Sound library unavailable');return r.json();})).then(([base,chapter])=>{audio.setManifest({...base,...chapter,voices:{...base.voices,...chapter.voices},lines:{...base.lines,...chapter.lines},music:{...base.music,...chapter.music},ambience:{...base.ambience,...chapter.ambience}});return true;}).catch(()=>{ui.error='The workshop sound library could not load. Refresh to retry; the text and tools remain available.';return false;});
function say(ids=[],mood=['visit','end'].includes(state().stage)?'workshop_display':'workshop') {
  ui.cues=ids;
  audio.enterScene({key:`T01:${++ui.cueCount}:${state().stage}`,mood,lineIds:ids});
  render();
  // An incoming reply opens its complete passage on compact screens.
  // Ordinary redraws and volume changes still preserve the learner's selected view.
  if(ids.length&&document.body.classList.contains('lesson-focused')){const tab=$('[data-lesson-view="dialogue"]');tab?.click();tab?.focus({preventScroll:true});}
}
function syncWorld(){ui.worldPromise=Promise.resolve(valley?.setWorkshop(state()));return ui.worldPromise;}
async function settleWorld(){const pending=ui.worldPromise,epoch=ui.sceneEpoch;ui.busy=true;audio.stopSpeech();render();const arrived=await pending;ui.busy=false;render();return arrived!==false&&ui.ready&&epoch===ui.sceneEpoch;}
function dispatch(event,input={},redraw=true){
  try{const previous=state();store.dispatch(event,input);if(previous.artwork.revision!==state().artwork.revision||previous.view!==state().view)ui.photo=null;syncWorld();if(redraw)render();return true;}
  catch(error){toast(error.message);return false;}
}
function rememberPrefs(){try{localStorage.setItem(key,JSON.stringify(prefs));}catch{toast('Sound settings could not be saved.');}applyPreferences();}
function heading(kicker,title,lead=''){return `<div class="eyebrow">${kicker}</div><h2>${title}</h2>${lead?`<p class="lead">${lead}</p>`:''}`;}
function dialogue(){return ui.cues.map(id=>{const line=workshopLines[id];return line?`<div class="dialogue" data-work-line="${id}"><div class="speaker">${esc(line.speaker)}${button('replay','♪',`data-id="${id}" aria-label="Replay ${esc(line.speaker)}'s line"`,'replay')}</div><p>${esc(line.english)}</p><div class="cn">${esc(line.chinese)}</div></div>`:'';}).join('');}
function photoCard(){return ui.photo?`<figure class="scene-picture work-photo"><button data-work-action="photo-large" aria-label="Open the photograph of my work"><img src="${ui.photo}" alt="Your artwork at its current place in the valley"></button><figcaption><strong>${esc(state().artwork.title||'My exhibition piece')}</strong><span>${state().artwork.location==='workshop'?'At the workbench':state().artwork.location==='path'?'Beside the garden path':'At the flower ring'}</span></figcaption></figure>`:'';}
function words(){const a=state().artwork;return `<details class="support"><summary>Find the words · 表达帮助</summary><p>${a.parts.body==='branch'?'This part is made of wood.':'This part is made of metal.'}</p><p>I used ${a.parts.body==='ring'?'an old ring':a.parts.body==='tin'?'an old tin':'a branch'}${a.parts.accent?' and '+({cloth:'a piece of cloth',cap:'a bottle cap',fan:'some folded card'}[a.parts.accent]):''}.</p><p>${movable()?'Watch this part as it turns.':'Look at the shape from this side.'}</p><p>It reminds me of… because…</p></details>`;}
function labels(){const a=ui.labelDraft||state().artwork;return `<div class="label-paper"><span class="label-pin" aria-hidden="true"></span><label class="field">Title · 作品名<input id="work-title" maxlength="80" value="${esc(a.title)}" placeholder="Untitled"></label><label class="field">A few words for your visitor · 写给观众<textarea id="work-note" maxlength="1200" placeholder="Look at… / I used… because… / What does it remind you of?">${esc(a.note)}</textarea></label><label class="field">Borrowing · 借展<select id="work-permission"><option value="ask" ${a.permission==='ask'?'selected':''}>Ask me first · 先问过我</option><option value="no" ${a.permission==='no'?'selected':''}>Keep it here · 留在这里</option></select></label>${button('save-label','Save my label · 保存展签','', 'text-button')}<span id="label-save-status" class="fine">${ui.labelDraft?'Not yet saved.':''}</span></div>`;}
function story(){
  const s=state(),a=s.artwork,h=s.story;
  if(store.loadError)return `${heading('Your work is protected','This record needs attention.','The saved record could not be read. It has not been replaced.')}<p class="error-note">${esc(store.loadError.message)}</p><div class="actions stack">${button('export-raw','Download the original record')}${button('retry-load','Try reading it again')}${store.canRecover?button('recover','Archive the record and start a new draft'):''}</div>`;
  if(!ui.active){const fresh=s.stage==='entry';return `${heading('T01 · 旧物奇想展',fresh?'The empty stand':a.status==='displayed'?'Your place<br>in the garden':'Back at<br>the workbench',fresh?'Iris has a blank label and one empty stand by the garden path. Sam has a drawer full of old parts.':a.status==='displayed'?`Your work is still ${a.location==='path'?'beside the path':'at the flower ring'}. Iris is there too.`:'Your pieces and your label are here. Pick up where you left off.')}<div class="cn">${fresh?'Iris 正在布置花园展览，小路旁还空着一个展台。Sam 拉开了装旧零件的抽屉。':a.status==='displayed'?'作品还在原来的展位上。去看看，也可以带回工坊修改。':'作品和展签都留着，接着上次的想法做。'}</div><div class="actions">${button('begin',fresh?'Meet them at the workbench ↗':'Continue my work ↗',ui.ready?'':'disabled','primary')}</div><p class="fine">Sam & Iris · The west garden</p>${ui.error?`<p class="error-note">${esc(ui.error)}</p>`:''}`;}
  if(s.stage==='make')return `${heading('The west workshop','What goes on<br>the empty stand?',a.parts.body?'Iris is waiting to see what you make.':'Open the drawer. Which piece catches your eye?')}<div class="cn">${a.parts.body?'Iris 还没看到你的作品。做好后叫她过来。':'挑一件旧物，听 Sam 说说它的来历。'}</div>${dialogue()}<div class="connection-tools"><span class="tool-label">Connect the pieces · 连接部件</span><div class="work-two">${button('joint','Fixed · 固定',`data-joint="fixed" aria-pressed="${a.joint==='fixed'}"`)}${button('joint','Turning · 可转动',`data-joint="pivot" aria-pressed="${a.joint==='pivot'}" ${a.parts.body?'':'disabled'}`)}</div>${a.parts.body==='tin'?'<p class="fine">The tin needs the fixed connection. · 铁罐需要固定连接。</p>':''}</div>${a.parts.body?words():''}<div class="actions stack">${button('share','Iris, come and have a look. ↗',a.parts.body?'':'disabled','primary')}${button('ask','Sam, can you help me?')}${button('store','Leave it on the bench for now','','text-button')}</div>`;
  if(s.stage==='share')return `${heading('Iris comes over',h.demonstrated?'Now she sees<br>another side.':'That’s what<br>you see?')}${photoCard()}${dialogue()}${!h.demonstrated?`<div class="intent-options">${button('intent',bilingual('Come round this side.','到这一边看看。'),`data-intent="shape" aria-pressed="${h.response==='shape'}"`,'choice')}${movable()?button('intent',bilingual('Watch what happens when it turns.','看看它转起来会怎样。'),`data-intent="movement" aria-pressed="${h.response==='movement'}"`,'choice'):''}${button('intent',bilingual('What else could it be?','还可能像什么？'),`data-intent="question" aria-pressed="${h.response==='question'}"`,'choice')}</div>${h.response?`<div class="actions">${button('demonstrate',h.response==='movement'?'Turn it for Iris · 转给她看':'Show Iris the other side · 带她换一边看','','primary')}</div>`:''}`:`<div class="actions stack">${button('reply','Let’s write the label. · 去写展签','','primary')}${button('reopen','I want to change something. · 回去改一改')}</div>`}${words()}<div class="actions">${button('store','Leave it on the bench for now','','text-button')}</div>`;
  if(s.stage==='label')return `${heading('Iris has her pencil ready','What should<br>the label say?')}${dialogue()}${labels()}${words()}<div class="actions stack">${button('place','Take it into the garden ↗','','primary')}${button('reopen','Back to the workbench','','text-button')}</div>`;
  if(s.stage==='place')return `${heading('Trying an exhibition spot',a.location==='workshop'?'Let’s take<br>a look outside.':a.location==='path'?'Along the path':'Among the flowers')}${photoCard()}${dialogue()}<div class="site-options">${button('try-site',bilingual('Try the path stand','试放在小路旁'),`data-location="path" aria-pressed="${a.location==='path'}"`,'choice')}${button('try-site',bilingual('Try the flower ring','试放在花圃旁'),`data-location="flower" aria-pressed="${a.location==='flower'}"`,'choice')}</div>${h.trial?`<div class="actions">${button('display',bilingual('Leave it here. Invite Iris over.','就放这里，请 Iris 来看看。'),`data-location="${a.location}"`,'primary')}</div>`:''}<div class="actions">${button('reopen','It needs another change. · 回工坊修改','','text-button')}${button('store','Keep it for another day','','text-button')}</div>`;
  if(s.stage==='visit')return `${heading('The first visitor',h.visitor?'Before you go' :'Iris stops<br>at your stand.')}${photoCard()}${dialogue()}<div class="intent-options">${button('visitor',bilingual('Let me show you how to look at it.','我来带你看看。'),`data-topic="invitation" aria-pressed="${h.visitor==='invitation'}"`,'choice')}${button('visitor',bilingual('Do you keep old things too?','你也会留下旧物吗？'),`data-topic="materials" aria-pressed="${h.visitor==='materials'}"`,'choice')}</div>${h.visitor?`<div class="actions">${button('finish','Leave the exhibition open ↗','','primary')}</div>`:''}`;
  const complete=h.finished,paused=a.status==='stored';
  return `${heading(paused?'Back at the workbench':complete?'The exhibition is open':'Your work in the garden',paused?'Another afternoon':esc(a.title||'Untitled'))}${photoCard()}${dialogue()}<p class="lead">${paused?'Your pieces are together on the bench. Sam will be there when you return.':complete?`Iris first saw ${workshopStory.firstImpression[a.parts.body]}. ${h.response==='movement'?'You showed her how it turns.':'You brought her round to the other side.'} Your work is now ${a.location==='path'?'beside the path':'at the flower ring'}.`:`Your work is ${a.location==='path'?'beside the path':'at the flower ring'}.`}</p>${complete?`<div class="cn">${h.visitor==='materials'?'Iris 的旧饼干罐还在装画笔。你的作品留在了花园里。':'下一位观众会先看到哪一面，又会想到什么？'}</div>`:''}${a.note?`<p class="photo-note">${esc(a.note)}</p>`:''}<div class="actions stack">${button('reopen',paused?'Continue making · 接着做':'Take it back and revise · 带回工坊修改','','primary')}${button('export','Keep my exhibition record · 下载记录')}${button('modules','Back to the valley · 返回山谷')}</div>`;
}
function materials(){const s=state();if(!ui.active||s.stage!=='make')return '';const slot=ui.selection,options=slot==='body'?['ring','tin','branch']:['cap','cloth','fan'];return `<section class="material-tray" aria-label="Materials on the workbench"><div class="tray-heading"><div><span class="eyebrow">Sam’s materials drawer</span><strong>Choose a piece</strong></div><div class="tray-tabs">${button('slot','Body',`data-slot="body" aria-pressed="${slot==='body'}"`)}${button('slot','Detail',`data-slot="accent" aria-pressed="${slot==='accent'}"`)}</div></div><div class="material-items">${options.map(part=>button('part',`<svg viewBox="0 0 60 50" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${partSketch[part]}</svg><span>${partNames[part]}<small class="cn">${partChinese[part]}</small></span>`,`data-part="${part}" data-slot="${slot}" aria-pressed="${s.artwork.parts[slot]===part}" ${slot==='accent'&&!s.artwork.parts.body?'disabled':''}`,'material-piece')).join('')}</div><div class="tray-foot"><span></span>${button('remove','Remove this part',`data-slot="${slot}" ${s.artwork.parts[slot]?'':'disabled'}`,'text-button')}${button('undo','↶ Undo',store.canUndo?'':'disabled','text-button')}</div></section>`;}
function tools(){const s=state();if(!ui.active||!s.artwork.parts.body||['label','visit'].includes(s.stage))return '';return `<div class="work-view-tools" aria-label="View and turn the artwork"><div class="work-two">${button('view','Front view',`data-view="front" aria-pressed="${s.view==='front'}"`,'pill-button')}${button('view','Other side',`data-view="side" aria-pressed="${s.view==='side'}"`,'pill-button')}</div>${['make','share','label','place'].includes(s.stage)?`<div class="turn-controls">${button('rotate','↶',`data-delta="-15" aria-label="Turn artwork left 15 degrees"`,'icon-button')}<label>Turn the work<input id="work-rotation" type="range" min="0" max="359" step="1" value="${s.artwork.rotation}" aria-label="Artwork rotation in degrees"></label>${button('rotate','↷',`data-delta="15" aria-label="Turn artwork right 15 degrees"`,'icon-button')}</div>`:''}<div class="work-two">${movable()&&s.artwork.status!=='stored'?button('move',s.moving?'Ⅱ Stop movement':'▷ Try the movement',`aria-pressed="${s.moving}"`,'pill-button'):''}${button('photo','▧ Photograph my work','','pill-button')}</div></div>`;}
function render(){
  const focus=document.activeElement,action=focus?.dataset?.workAction,details=focus?.dataset,focusId=focus?.id;
  document.body.classList.add('workshop-page');document.body.classList.toggle('in-visit',ui.active);document.body.dataset.workshopStage=state().stage;
  $('#app').innerHTML=`<header class="topbar"><div class="wordmark"><h1>THE ENGLISH VALLEY</h1><p>A place to notice. A reason to speak.</p><div class="weather">T01 <i></i> THE WORKSHOP <i></i> PREPARATION DAY</div></div><div class="toolbar">${button('language',prefs.chinese?'EN / 中文':'EN','','pill-button')}${button('mute',prefs.muted?'♪̸':'♪',`aria-label="Toggle all sound" aria-pressed="${!prefs.muted}"`,'icon-button sound-toggle')}${button('settings','☷','aria-label="Sound and display settings"','icon-button')}</div></header><div class="stage-tag">${ui.active?'THE GARDEN EXHIBITION':'THE EMPTY STAND'}</div>${ui.active?`<button class="sound-state" data-work-action="sound-status"><span id="work-sound-status">Music & garden</span></button>`:''}<section id="story-panel" class="story-panel ${ui.active?'':'hero'}" aria-label="Workshop story and actions" tabindex="-1">${story()}</section>${tools()}${materials()}<div id="work-live-caption" class="work-live-caption" hidden></div><nav class="location-nav"><div class="nav-left">${button('modules','▧ Valley stories','','')}${button('teacher','Classroom notes','','')}</div><div class="nav-right">${ui.active?`<span class="saved-note">● Saved locally · v${state().artwork.revision}</span>`:''}${button('export','↓ Work record','','')}</div></nav>`;
  if(ui.busy){document.querySelectorAll('#app [data-work-action]').forEach(el=>{if(!['mute','settings','language'].includes(el.dataset.workAction))el.disabled=true;});$('#app').insertAdjacentHTML('beforeend',`<div class="walk-note"><i class="loading-indicator"></i>${ui.demonstrating?'Iris is watching…':'Walking with Iris…'}</div>`);}
  if(!ui.ready&&ui.error){document.querySelectorAll('#app [data-work-action]').forEach(el=>{if(!['mute','settings','language','modules','export','export-raw','teacher','retry-load','recover'].includes(el.dataset.workAction))el.disabled=true;});$('#story-panel').insertAdjacentHTML('afterbegin',`<p class="error-note">${esc(ui.error)} ${button('reload','Reload the view','','text-button')}</p>`);}
  if(action){const candidates=[...document.querySelectorAll(`[data-work-action="${action}"]`)];const same=candidates.find(el=>['part','slot','joint','intent','view','delta'].every(k=>!details[k]||el.dataset[k]===details[k]));same?.focus({preventScroll:true});}
  else if(focusId)document.getElementById(focusId)?.focus({preventScroll:true});
  immersive.sync();
  refreshSound(audio.getState());
}
function modal(title,content){
  ui.dialog?.close();
  const d=document.createElement('dialog');d.className='valley-dialog workshop-dialog';d.setAttribute('aria-labelledby','work-dialog-title');
  d.innerHTML=`<form method="dialog"><button class="dialog-close" aria-label="Close dialog">×</button></form><h2 id="work-dialog-title">${title}</h2><p id="work-dialog-caption" class="modal-spoken-line" hidden></p>${content}`;
  document.body.append(d);ui.dialog=d;d.addEventListener('close',()=>{d.remove();if(ui.dialog===d)ui.dialog=null;});d.showModal();refreshSound(audio.getState());
}
function saveLabel(redraw=false){
  const draft=$('#work-title')?{title:$('#work-title').value,note:$('#work-note').value,permission:$('#work-permission').value}:ui.labelDraft;
  if(!draft)return true;
  const success=dispatch('SET_LABEL',draft,false);if(success)ui.labelDraft=null;else ui.labelDraft=draft;
  if(redraw)render();return success;
}
function resumeCues(){
  const s=state(),h=s.story,a=s.artwork;
  if(s.stage==='make')return a.parts.body?[workshopStory.history[a.parts.body]]:['T01.027','T01.028'];
  if(s.stage==='share')return h.demonstrated?[workshopStory.response[h.response]]:[workshopStory.firstLook[a.parts.body]];
  if(s.stage==='label')return ['T01.046'];
  if(s.stage==='place')return h.trial?[h.trial==='path'?'T01.038':'T01.039']:['T01.016'];
  if(s.stage==='visit')return h.visitor?(h.visitor==='materials'?['T01.044','T01.045']:[workshopStory.farewell[h.response]]):['T01.040'];
  return a.status==='stored'?['T01.026']:['T01.018'];
}
function visibleDelay(ms){const epoch=ui.sceneEpoch;return new Promise(resolve=>{let elapsed=0,last=performance.now();function tick(now){if(!ui.ready||epoch!==ui.sceneEpoch||!valley?.getStats().available){resolve(false);return;}if(!document.hidden)elapsed+=Math.min(80,now-last);last=now;if(elapsed>=ms)resolve(true);else requestAnimationFrame(tick);}requestAnimationFrame(tick);});}
async function watchMovement(ms){ui.busy=true;ui.demonstrating=true;render();const observed=await visibleDelay(ms);ui.busy=false;ui.demonstrating=false;if(!observed){dispatch('SET_MOVING',{moving:false});render();}return observed;}
function takePhoto(){
  const result=valley?.captureArtwork();if(!result){toast('The picture could not be captured. Your work is still saved.');return;}
  ui.photo=result;render();
}
function download(data,name){const url=URL.createObjectURL(new Blob([typeof data==='string'?data:JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function act(name,el){
  if(name==='reload'){location.reload();return;}
  if(ui.busy&&!['mute','settings','language'].includes(name))return;
  if(name==='begin'){
    const unlocking=audio.unlock();await manifestReady;await unlocking;
    if(!ui.ready||store.loadError)return;
    const fresh=state().stage==='entry';if(fresh&&!dispatch('BEGIN',{},false))return;
    ui.active=true;if(!fresh)syncWorld();if(!await settleWorld())return;say(resumeCues());if(['share','place','visit','end'].includes(state().stage)&&state().artwork.parts.body)takePhoto();return;
  }
  if(name==='modules'){if(!saveLabel())return;openModuleMenu('T01');return;}
  if(name==='language'){prefs.chinese=!prefs.chinese;rememberPrefs();render();return;}
  if(name==='mute'){void audio.unlock();prefs.muted=!prefs.muted;rememberPrefs();render();return;}
  if(name==='replay'||name==='sound-status'){
    const unlocked=audio.unlock();prefs.muted=false;prefs.sound=true;rememberPrefs();await unlocked;await manifestReady;
    const id=el.dataset.id||ui.audio?.failedLineId||ui.audio?.currentId||ui.cues[0];if(id)await audio.replay(id);return;
  }
  if(name==='settings'){
    modal('The sound of the workshop',`${[['sound','Character voices'],['music','Scene music'],['ambience','Garden sounds'],['reduced','Reduce ambient motion']].map(([k,label])=>`<label class="settings-row"><span>${label}</span><input type="checkbox" data-work-pref="${k}" ${prefs[k]?'checked':''}></label>`).join('')}${[['speechVolume','Voice volume'],['musicVolume','Music volume'],['ambienceVolume','Nature volume']].map(([k,label])=>`<label class="settings-row volume-row"><span>${label}</span><input type="range" min="0" max="1" step=".01" value="${prefs[k]}" data-work-pref="${k}"></label>`).join('')}<p class="fine">进入场面自动播报一次；每句旁的 ♪ 用于重听。静音不影响操作与保存。活动装置只在你点击后转动。</p>`);return;
  }
  if(name==='slot'){ui.selection=el.dataset.slot;render();return;}
  if(name==='part'||name==='remove'){const changed=state().artwork.parts[el.dataset.slot]!==el.dataset.part;if(dispatch('SET_PART',{slot:el.dataset.slot,part:name==='remove'?null:el.dataset.part})&&el.dataset.slot==='body'&&changed)say(name==='remove'?[]:[workshopStory.history[el.dataset.part]]);return;}
  if(name==='joint'){const changed=state().artwork.joint!==el.dataset.joint;if(dispatch('SET_JOINT',{joint:el.dataset.joint})&&changed&&el.dataset.joint==='pivot')say(['T01.005']);return;}
  if(name==='rotate'){dispatch('ROTATE',{delta:Number(el.dataset.delta)});return;}
  if(name==='undo'){if(dispatch('UNDO'))say(state().artwork.parts.body?[workshopStory.history[state().artwork.parts.body]]:[]);return;}
  if(name==='view'){if(!saveLabel())return;const changed=state().view!==el.dataset.view;if(dispatch('SET_VIEW',{view:el.dataset.view})&&changed){if(!await settleWorld())return;if(['place','end'].includes(state().stage)&&state().artwork.status!=='stored')say(['T01.018']);}return;}
  if(name==='move'){dispatch('SET_MOVING',{moving:!state().moving});return;}
  if(name==='ask'){say(['T01.023']);modal('A suggestion, or more time?',`<p class="lead">Sam waits for your choice.</p><div class="actions stack">${button('suggest','Try a turning connection',state().artwork.parts.body&&state().artwork.parts.body!=='tin'?'':'disabled','primary')}${button('more-time','A little more time, please.')}</div>`);return;}
  if(name==='suggest'){ui.dialog?.close();if(dispatch('SET_JOINT',{joint:'pivot'}))say(['T01.005']);return;}
  if(name==='more-time'){ui.dialog?.close();audio.stopSpeech();ui.cues=[];render();return;}
  if(name==='share'){if(dispatch('SHARE')&&await settleWorld()){say([workshopStory.firstLook[state().artwork.parts.body]]);takePhoto();}return;}
  if(name==='intent'){
    if(state().story.response===el.dataset.intent)return;
    if(dispatch('SET_INTENT',{intent:el.dataset.intent})&&await settleWorld())say(el.dataset.intent==='movement'?['T01.009']:el.dataset.intent==='shape'?['T01.022']:['T01.013']);return;
  }
  if(name==='demonstrate'){
    const response=state().story.response;if(!response)return;
    if(response==='movement'){
      if(!dispatch('SET_MOVING',{moving:true}))return;
      if(!await watchMovement(2800))return;
    }else{if(!dispatch('SET_VIEW',{view:'side'})||!await settleWorld())return;}
    if(dispatch('DEMONSTRATE')){if(state().moving)dispatch('SET_MOVING',{moving:false});say([workshopStory.response[response]]);takePhoto();}else render();return;
  }
  if(name==='reply'){if(dispatch('REPLY')&&await settleWorld())say(['T01.046']);return;}
  if(name==='save-label'){if(saveLabel()){$('#label-save-status').textContent=' Saved.';toast('Your label is saved.');}return;}
  if(name==='place'){if(saveLabel()&&dispatch('PLACE')&&await settleWorld())say(['T01.016']);return;}
  if(name==='try-site'){
    if(!dispatch('TRY_SITE',{location:el.dataset.location})||!await settleWorld())return;
    if(!dispatch('SET_VIEW',{view:'side'})||!await settleWorld())return;
    if(dispatch('OBSERVE_SITE')){say([el.dataset.location==='path'?'T01.038':'T01.039']);takePhoto();}return;
  }
  if(name==='display'){if(dispatch('DISPLAY',{location:el.dataset.location})&&await settleWorld()){say(['T01.040'],'workshop_display');takePhoto();}return;}
  if(name==='visitor'){
    const topic=el.dataset.topic;
    if(topic==='invitation'){
      if(state().story.response==='movement'){
        if(!dispatch('SET_MOVING',{moving:true})||!await watchMovement(2400))return;
      }else if(!dispatch('SET_VIEW',{view:'side'})||!await settleWorld())return;
    }else if(state().moving&&!dispatch('SET_MOVING',{moving:false}))return;
    if(dispatch('ASK_VISITOR',{topic}))say(topic==='materials'?['T01.044','T01.045']:[workshopStory.farewell[state().story.response]],'workshop_display');else render();return;
  }
  if(name==='finish'){if(dispatch('FINISH')&&await settleWorld()){say([],'workshop_display');takePhoto();}return;}
  if(name==='store'){if(saveLabel()&&dispatch('STORE')&&await settleWorld()){say(['T01.026'],'workshop_display');if(state().artwork.parts.body)takePhoto();}return;}
  if(name==='reopen'){if(saveLabel()&&dispatch('REOPEN')&&await settleWorld())say([state().artwork.parts.body?workshopStory.history[state().artwork.parts.body]:'T01.028']);return;}
  if(name==='photo'){if(!saveLabel())return;takePhoto();modal('A view of your work',`<img class="material-detail" src="${ui.photo||''}" alt="Photograph of the current artwork">`);return;}
  if(name==='photo-large'){modal('A view of your work',`<img class="material-detail" src="${ui.photo}" alt="Photograph of the current artwork">`);return;}
  if(name==='export'){if(saveLabel())download({chapter:'T01',record:state(),photograph:ui.photo,notice:'Original learner work; ask-first is not lending consent.'},'english-valley-my-work.json');return;}
  if(name==='export-raw'){download(store.exportRaw(),'english-valley-original-workshop-record.json');return;}
  if(name==='retry-load'){store.retryLoad();syncWorld();render();return;}
  if(name==='recover'){store.recover();syncWorld();render();return;}
  if(name==='teacher'){modal('Reading, making, meeting a visitor',`<p class="lead">人教版九年级 Unit 13 Section B 2a–2b，Rethink, Reuse, Recycle!。从材料的旧用途进入创作，再由观众的不同理解促成英语交流。</p><ol class="work-teacher"><li>阅读前：看课文标题和图片，猜一件物品的原材料；阅读后回到原文核对。教材定位见<a href="https://r1-ndr.ykt.cbern.com.cn/edu_product/esp/assets/1961dabe-cab0-456d-b7ac-59b37e271e5d.pkg/pdf.pdf" target="_blank" rel="noopener">国家平台教材文档</a>。</li><li>进入工坊：听 Sam 介绍旧物来历。同伴说出材料和原来的用途，再决定怎样组合。</li><li>Iris 来看：先说自己的联想和理由，再听作者解释。作者带观众换一个角度，或启动可动部件，看看解释是否改变。</li><li>写展签：选取作品的一处细节，写给下一位观众。可用 I used… / It used to… / Look at…，也可先和同伴口述再写。</li><li>展出以后：Iris 的饼干罐还在装画笔。请学生说说家里仍在使用的一件旧物，以及为什么愿意继续留着它。</li></ol><p class="fine">Sam、Iris 的故事和对白是项目原创。课文使用范围请按学校教材版次核对。语言参考：<a href="https://dictionary.cambridge.org/us/dictionary/english/remind-of" target="_blank" rel="noopener">remind someone of</a>；<a href="https://our-languages.canada.ca/en/writing-tips-plus/made-from-made-of-made-with" target="_blank" rel="noopener">made of / made from</a>。</p>`);return;}

}
document.addEventListener('click',e=>{const el=e.target.closest('[data-work-action]');if(el&&!el.disabled)Promise.resolve(act(el.dataset.workAction,el)).catch(error=>toast(error.message));});
document.addEventListener('input',e=>{
  const el=e.target;
  if(['work-title','work-note'].includes(el.id)){ui.labelDraft={title:$('#work-title').value,note:$('#work-note').value,permission:$('#work-permission').value};const status=$('#label-save-status');if(status)status.textContent='Not yet saved.';}
  if(el.id==='work-rotation')valley?.setWorkshop({...state(),artwork:{...state().artwork,rotation:Number(el.value)}});
  if(el.dataset.workPref){prefs[el.dataset.workPref]=el.type==='checkbox'?el.checked:Number(el.value);rememberPrefs();}
});
document.addEventListener('change',e=>{
  if(e.target.id==='work-rotation')dispatch('ROTATE',{delta:Number(e.target.value)-state().artwork.rotation});
  if(['work-title','work-note','work-permission'].includes(e.target.id)){if(saveLabel()){$('#label-save-status').textContent=' Saved.';}}
});
render();
try{
  const {createValley}=await import('./world/renderer.js');
  valley=createValley($('#valley'),{async onReady(){applyPreferences();await syncWorld();ui.error='';ui.ready=true;render();},onError(error){ui.sceneEpoch++;ui.ready=false;audio.stopSpeech();ui.cues=[];ui.error='The 3D view could not load. Your saved work is preserved.';toast(error.message||ui.error);render();},onPick(target){if(ui.active&&!ui.busy&&state().stage==='make'&&target.action?.startsWith('workshop_')){ui.selection=target.action==='workshop_accent'?'accent':'body';render();}}});
}catch(error){ui.error=error.message;render();}
window.addEventListener('pagehide',()=>audio.suspend());
window.addEventListener('pageshow',event=>{if(event.persisted)void audio.resume();});
