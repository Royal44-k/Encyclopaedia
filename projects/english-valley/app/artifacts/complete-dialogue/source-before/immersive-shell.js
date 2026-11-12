import './immersive.css';

// A shared, non-overlapping screen contract. Scene pixels and lesson controls
// have separate rectangles; moving a camera never puts an actor behind a card.
export function mountImmersiveShell({canvas=document.querySelector('#valley'),root=document.querySelector('#app')}={}) {
  document.body.classList.add('immersive');
  const chrome=document.createElement('div');chrome.className='immersive-controls';
  chrome.innerHTML='<button type="button" data-immersive="scenic" aria-pressed="false" title="Show the valley without panels">View only</button><button type="button" data-immersive="fullscreen" aria-pressed="false" title="Fullscreen · F">⛶ <span>Fullscreen</span></button><span class="sr-only" role="status" data-immersive-status></span>';
  document.body.append(chrome);
  let scenic=false,previousFocus=null,historyOpen=false;
  const resize=()=>{window.dispatchEvent(new Event('resize'));};
  function updateFullscreen(){const active=Boolean(document.fullscreenElement);const b=chrome.querySelector('[data-immersive=fullscreen]');b.setAttribute('aria-pressed',String(active));b.innerHTML=`${active?'⊡':'⛶'} <span>${active?'Exit fullscreen':'Fullscreen'}</span>`;resize();}
  async function fullscreen(){
    try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else throw new Error('unsupported');}
    catch{chrome.querySelector('[data-immersive-status]').textContent='Fullscreen is unavailable here. The complete lesson remains available in this window.';}
  }
  function setScenic(value){
    scenic=Boolean(value);document.body.classList.toggle('scenic-view',scenic);root.inert=scenic;
    const b=chrome.querySelector('[data-immersive=scenic]');b.textContent=scenic?'Restore controls':'View only';b.setAttribute('aria-pressed',String(scenic));
    if(scenic){previousFocus=document.activeElement;b.focus();}else if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
    resize();
  }
  function updateSpeech(){
    const panel=root.querySelector('#story-panel');if(!panel)return;
    const current=panel.querySelector('.immersive-current'),history=panel.querySelector('.immersive-history-body');
    if(!current||!history)return;
    const all=[...panel.querySelectorAll('.dialogue')];
    const id=document.body.dataset.audioLine;
    const active=all.find(el=>(el.dataset.line||el.dataset.workLine||el.dataset.nightLine)===id)||all.find(el=>el.classList.contains('is-speaking'))||current.querySelector('.dialogue')||all[0];
    if(active&&active.parentElement!==current){for(const node of [...current.children])history.append(node);current.append(active);}
    const caption=root.querySelector('.immersive-mobile-caption');
    if(caption){
      const marker=active?.dataset.line||active?.dataset.workLine||active?.dataset.nightLine||active?.textContent||'';
      caption.hidden=!active;
      if(caption.dataset.cue!==marker){
        caption.dataset.cue=marker;caption.replaceChildren();
        if(active){const speaker=active.querySelector('.speaker')?.cloneNode(true),line=active.querySelector('p')?.cloneNode(true),translation=active.querySelector('.cn')?.cloneNode(true);const replay=speaker?.querySelector('button');if(replay){for(const attr of ['data-action','data-work-action','data-night-action','data-id'])replay.removeAttribute(attr);replay.dataset.immersive='replay';}for(const node of [speaker,line,translation])if(node)caption.append(node);}
      }
    }
    panel.querySelector('.immersive-transcript')?.classList.toggle('no-history',history.children.length===0);
  }
  function sync(){
    const panel=root.querySelector('#story-panel');if(!panel)return;
    const focused=document.activeElement;
    if(!panel.dataset.immersiveReady){
      panel.dataset.immersiveReady='true';
      const context=document.createElement('div');context.className='immersive-context';
      const dialogue=document.createElement('div');dialogue.className='immersive-dialogue';
      const actions=document.createElement('div');actions.className='immersive-actions';
      const current=document.createElement('div');current.className='immersive-current';
      const transcript=document.createElement('details');transcript.className='immersive-transcript';transcript.open=historyOpen;
      transcript.innerHTML='<summary>Earlier lines · 对话记录</summary><div class="immersive-history-body"></div>';
      transcript.addEventListener('toggle',()=>historyOpen=transcript.open);
      let foundDialogue=false;
      for(const child of [...panel.children]){
        if(child.classList.contains('dialogue')){(foundDialogue?transcript.lastElementChild:current).append(child);foundDialogue=true;}
        else if(child.matches('.eyebrow,h2,.lead,.cn,.scene-picture,.error-note'))context.append(child);
        else actions.append(child);
      }
      dialogue.append(current,transcript);panel.append(context,dialogue,actions);
      if(!foundDialogue)panel.classList.add('without-dialogue');
      const dock=document.createElement('div');dock.id='immersive-dock';dock.setAttribute('aria-label','Lesson controls below the scene');
      const caption=document.createElement('div');caption.className='immersive-mobile-caption';caption.hidden=true;
      root.append(dock);dock.append(caption,panel);
      const tray=root.querySelector('.material-tray'),tools=root.querySelector('.work-view-tools');
      if(tray){const primaryActions=actions.querySelector(':scope > .actions');if(primaryActions)context.append(primaryActions);}
      if(tray||tools){const work=document.createElement('div');work.className='immersive-work-tools';if(tools)work.append(tools);if(tray)work.append(tray);dock.append(work);dock.classList.add('has-work-tools');}
    }
    const dock=root.querySelector('#immersive-dock');
    document.body.classList.toggle('immersive-workbench',Boolean(dock?.querySelector('.material-tray')));
    document.body.classList.toggle('immersive-entry',panel.classList.contains('hero'));
    updateSpeech();
    if(focused?.isConnected&&focused!==document.body&&document.activeElement!==focused)focused.focus({preventScroll:true});
  }
  const click=e=>{const action=e.target.closest('[data-immersive]')?.dataset.immersive;if(action==='fullscreen')void fullscreen();if(action==='scenic')setScenic(!scenic);if(action==='replay')root.querySelector('.immersive-current .replay')?.click();};
  const key=e=>{if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable=true]'))return;if(e.key.toLowerCase()==='f'){e.preventDefault();void fullscreen();}if(e.key==='Escape'&&scenic){e.preventDefault();setScenic(false);}};
  chrome.addEventListener('click',click);root.addEventListener('click',click);document.addEventListener('keydown',key);document.addEventListener('fullscreenchange',updateFullscreen);
  updateFullscreen();sync();
  return {sync,resize,updateSpeech,setScenic,dispose(){chrome.remove();root.removeEventListener('click',click);document.removeEventListener('keydown',key);document.removeEventListener('fullscreenchange',updateFullscreen);root.inert=false;document.body.classList.remove('immersive','scenic-view','immersive-workbench','immersive-entry');}};
}
