import './immersive.css';
import './complete-dialogue.css';
// Keep the complete passage in original order; speech only changes emphasis.
export function mountImmersiveShell({canvas=document.querySelector('#valley'),root=document.querySelector('#app')}={}) {
  document.body.classList.add('immersive','complete-dialogue');
  const chrome=document.createElement('div');chrome.className='immersive-controls';
  chrome.innerHTML='<button type="button" data-immersive="scenic" aria-pressed="false">View only</button><button type="button" data-immersive="fullscreen" aria-pressed="false" title="Fullscreen · F">⛶ <span>Fullscreen</span></button><span class="sr-only" role="status" data-immersive-status></span>';document.body.append(chrome);
  let scenic=false,previousFocus=null,view='dialogue',sceneKey='',hadDialogue=false,frame=0,disposed=false;
  const pages=new Map(),names={dialogue:'Conversation · 对话',context:'Place · 地点',actions:'Next steps · 操作',tools:'Workbench · 材料',sounds:'Sound notes · 声音'};
  function schedule(){if(!frame&&!disposed)frame=requestAnimationFrame(()=>{frame=0;layout();});}
  function updateFullscreen(){const active=Boolean(document.fullscreenElement),b=chrome.querySelector('[data-immersive=fullscreen]');b.setAttribute('aria-pressed',String(active));b.innerHTML=`${active?'⊡':'⛶'} <span>${active?'Exit fullscreen':'Fullscreen'}</span>`;schedule();}
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{chrome.querySelector('[data-immersive-status]').textContent='Fullscreen is unavailable here. The complete lesson remains available in this window.';}}
  function setScenic(value){scenic=Boolean(value);document.body.classList.toggle('scenic-view',scenic);root.inert=scenic;const b=chrome.querySelector('[data-immersive=scenic]');b.textContent=scenic?'Restore controls':'View only';b.setAttribute('aria-pressed',String(scenic));if(scenic){previousFocus=document.activeElement;b.focus();}else if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});schedule();}
  function updateSpeech(){const id=document.body.dataset.audioLine;root.querySelectorAll('#story-panel .dialogue').forEach(el=>el.classList.toggle('current-line',(el.dataset.line||el.dataset.workLine||el.dataset.nightLine)===id));schedule();}
  function paginate(pane,budget,key){
    let pager=pane.querySelector(':scope > .lesson-pages');let items=[...pane.children].filter(el=>el!==pager);items.forEach(el=>el.removeAttribute('data-page-hidden'));if(pager)pager.hidden=true;
    // A student's long note is unbounded prose, not one indivisible screen.
    // Preserve every word and punctuation mark across explicit reading pages.
    for(const item of items){
      if(!item.matches('p,.photo-note,.node-note')||item.querySelector('input,button,textarea,select')||item.getBoundingClientRect().height<=budget-55)continue;
      const original=item.textContent;if(!original.trim())continue;
      const graphemes=new Intl.Segmenter(undefined,{granularity:'grapheme'});
      const segments=[...new Intl.Segmenter(undefined,{granularity:'word'}).segment(original)].flatMap(x=>x.segment.length>80?[...graphemes.segment(x.segment)].map(c=>c.segment):[x.segment]),fragments=[];let offset=0;
      while(offset<segments.length){let low=1,high=segments.length-offset,best=1;while(low<=high){const mid=Math.floor((low+high)/2);item.textContent=segments.slice(offset,offset+mid).join('');if(item.getBoundingClientRect().height<=Math.max(60,budget-65)){best=mid;low=mid+1;}else high=mid-1;}
        const fragment=item.cloneNode(false);fragment.dataset.noteFragment='true';fragment.textContent=segments.slice(offset,offset+best).join('');fragments.push(fragment);offset+=best;
      }
      item.replaceWith(...fragments);
    }
    items=[...pane.children].filter(el=>el!==pager);
    if(pane.scrollHeight<=budget||!items.length)return;
    const groups=[];let group=[],height=0;
    for(const item of items){const s=getComputedStyle(item);if(s.display==='none')continue;const h=item.getBoundingClientRect().height+parseFloat(s.marginTop||0)+parseFloat(s.marginBottom||0)+8;if(group.length&&height+h>budget-42){groups.push(group);group=[];height=0;}group.push(item);height+=h;}if(group.length)groups.push(group);if(groups.length<2)return;
    if(!pager){pager=document.createElement('nav');pager.className='lesson-pages';pager.setAttribute('aria-label','Complete sections');pager.innerHTML='<button type="button" data-lesson-page="prev">← Previous</button><span aria-live="polite"></span><button type="button" data-lesson-page="next">Next →</button>';pane.prepend(pager);}
    let selected=Math.min(pages.get(key)||0,groups.length-1);const focused=groups.findIndex(group=>group.some(el=>el.contains(document.activeElement)));if(focused>=0)selected=focused;
    pages.set(key,selected);pager.hidden=false;pager.dataset.pageKey=key;pager.dataset.total=groups.length;pager.firstElementChild.disabled=selected===0;pager.lastElementChild.disabled=selected===groups.length-1;
    const label=`${selected+1} / ${groups.length}`;if(pager.children[1].textContent!==label)pager.children[1].textContent=label;groups.forEach((group,i)=>group.forEach(el=>{if(i!==selected)el.setAttribute('data-page-hidden','');}));
  }
  function layout(){
    const dock=root.querySelector('#immersive-dock'),panel=root.querySelector('#story-panel');if(!dock||scenic)return;
    const style=getComputedStyle(document.body),header=parseFloat(style.getPropertyValue('--scene-header')),nav=parseFloat(style.getPropertyValue('--scene-nav')),narrow=innerWidth<900,maxHeight=innerHeight-header-nav-(innerHeight<600?80:narrow?150:230);
    document.body.classList.remove('lesson-focused');root.querySelectorAll('[data-page-hidden]').forEach(el=>el.removeAttribute('data-page-hidden'));root.querySelectorAll('.lesson-pages').forEach(el=>el.hidden=true);
    const focused=narrow||dock.getBoundingClientRect().height>maxHeight;document.body.classList.toggle('lesson-focused',focused);
    const available=[...dock.querySelectorAll('[data-lesson-pane]')].filter(el=>el.dataset.lessonPane==='dialogue'?Boolean(el.querySelector('.dialogue')):el.children.length).map(el=>el.dataset.lessonPane);
    if(!available.includes(view))view=available.includes('dialogue')?'dialogue':available.includes('actions')?'actions':'context';dock.dataset.view=view;
    for(const b of dock.querySelectorAll('[data-lesson-view]')){b.hidden=!available.includes(b.dataset.lessonView);b.setAttribute('aria-pressed',String(b.dataset.lessonView===view));}
    if(focused&&!panel.classList.contains('hero')){const pane=dock.querySelector(`[data-lesson-pane="${view}"]`);if(pane&&view!=='dialogue')paginate(pane,Math.max(140,maxHeight-70),`${sceneKey}:${view}`);}
    const target=`${Math.ceil(dock.getBoundingClientRect().height)}px`;if(document.body.style.getPropertyValue('--lesson-dock')!==target)document.body.style.setProperty('--lesson-dock',target);
  }
  function sync(){
    const panel=root.querySelector('#story-panel');if(!panel)return;const focused=document.activeElement,key=panel.querySelector('h2')?.textContent||'';
    const hasDialogue=Boolean(panel.querySelector('.dialogue'));if(hasDialogue&&!hadDialogue)view='dialogue';hadDialogue=hasDialogue;
    if(key!==sceneKey){sceneKey=key;view=panel.querySelector('.dialogue')?'dialogue':'actions';pages.clear();}
    if(!panel.dataset.immersiveReady){
      panel.dataset.immersiveReady='true';const context=document.createElement('div');context.className='immersive-context';context.dataset.lessonPane='context';
      const dialogue=document.createElement('div');dialogue.className='immersive-dialogue';dialogue.dataset.lessonPane='dialogue';dialogue.setAttribute('aria-label','Complete conversation');
      const current=document.createElement('div');current.className='immersive-current';dialogue.append(current);
      const actions=document.createElement('div');actions.className='immersive-actions';actions.dataset.lessonPane='actions';
      for(const child of [...panel.children]){if(child.classList.contains('dialogue'))current.append(child);else if(child.matches('.eyebrow,h2,.lead,.cn,.scene-picture,.error-note'))context.append(child);else actions.append(child);}
      if(!current.children.length){dialogue.replaceChildren();panel.classList.add('without-dialogue');}panel.append(dialogue,context,actions);
      const dock=document.createElement('div');dock.id='immersive-dock';dock.setAttribute('aria-label','Complete lesson content below the scene');const tabs=document.createElement('nav');tabs.className='lesson-views';tabs.setAttribute('aria-label','Lesson views');tabs.innerHTML=Object.entries(names).map(([id,label])=>`<button type="button" data-lesson-view="${id}" aria-pressed="${view===id}">${label}</button>`).join('');root.append(dock);dock.append(tabs,panel);
      const tray=root.querySelector('.material-tray'),tools=root.querySelector('.work-view-tools');if(tray||tools){const work=document.createElement('div');work.className='immersive-work-tools';work.dataset.lessonPane='tools';if(tools)work.append(tools);if(tray)work.append(tray);dock.append(work);dock.classList.add('has-work-tools');}
    }
    document.body.classList.toggle('immersive-workbench',Boolean(root.querySelector('.material-tray')));document.body.classList.toggle('immersive-entry',panel.classList.contains('hero'));
    if(focused?.isConnected&&focused!==document.body){const pane=focused.closest('[data-lesson-pane]');if(pane)view=pane.dataset.lessonPane;focused.focus({preventScroll:true});}updateSpeech();layout();
  }
  function click(e){const action=e.target.closest('[data-immersive]')?.dataset.immersive;if(action==='fullscreen')void fullscreen();if(action==='scenic')setScenic(!scenic);const tab=e.target.closest('[data-lesson-view]');if(tab){view=tab.dataset.lessonView;layout();}const page=e.target.closest('[data-lesson-page]');if(page){const pager=page.closest('.lesson-pages');pages.set(pager.dataset.pageKey,Math.max(0,Math.min(Number(pager.dataset.total)-1,(pages.get(pager.dataset.pageKey)||0)+(page.dataset.lessonPage==='next'?1:-1))));layout();if(page.disabled){const other=pager.querySelector('button:not(:disabled)');other?.focus({preventScroll:true});}}}
  const key=e=>{if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable=true]'))return;if(e.key.toLowerCase()==='f'){e.preventDefault();void fullscreen();}if(e.key==='Escape'&&scenic){e.preventDefault();setScenic(false);}};
  const observer=new MutationObserver(schedule);observer.observe(root,{childList:true,subtree:true,characterData:true});const sizes=new ResizeObserver(schedule);sizes.observe(root);document.fonts?.ready.then(schedule);
  chrome.addEventListener('click',click);root.addEventListener('click',click);root.addEventListener('toggle',schedule,true);window.addEventListener('resize',schedule);document.addEventListener('keydown',key);document.addEventListener('fullscreenchange',updateFullscreen);updateFullscreen();sync();
  return {sync,resize:schedule,updateSpeech,setScenic,dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();sizes.disconnect();chrome.remove();root.removeEventListener('click',click);root.removeEventListener('toggle',schedule,true);window.removeEventListener('resize',schedule);document.removeEventListener('keydown',key);document.removeEventListener('fullscreenchange',updateFullscreen);root.inert=false;document.body.style.removeProperty('--lesson-dock');document.body.classList.remove('immersive','complete-dialogue','scenic-view','immersive-workbench','immersive-entry','lesson-focused');}};
}
