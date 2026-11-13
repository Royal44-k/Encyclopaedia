export const tourChapters = [
 {id:'sudi',name:'堤岸坐春',seal:'春',duration:22,caption:'把脚步放慢，湖山便有了可亲近的尺度。',detail:'沿柳岸走到长椅，转身坐看湖光。'},
 {id:'quyuan',name:'荷风听雨',seal:'夏',duration:18,caption:'一池荷风，一阵细雨。四时不只供人观看，也值得停留。',detail:'从近荷到水榭，让风与雨改变池面。'},
 {id:'crossing',name:'一墨入宋',seal:'墨',duration:20,caption:'让一滴墨，把今日的湖山接回画里的人间。',detail:'墨落、晕染、描摹、设色，穿过今夕。'},
 {id:'song-tea',name:'一盏宋韵',seal:'茶',duration:24,caption:'碾茶、调膏、击拂。文化藏在手上，也留在日常里。',detail:'走入临水茶肆，看茶末化成一盏汤花。'},
 {id:'wuguitan',name:'舟入青境',seal:'舟',duration:40,caption:'桥影之后，西湖还有曲水、湿地与安静的生命。',detail:'回到当代湖西，随舟经过景行桥，进入乌龟潭。'},
 {id:'pinghu',name:'月下收卷',seal:'月',duration:18,caption:'湖山不是旅途的背景。人在其中，也成为风景的一部分。',detail:'候一轮月，把自己的湖山记忆留在画笺上。'}
];

// Advances only on foreground application frames. Loading and pause consume no time.
export class TourClock {
 constructor(){this.reset();}
 reset(index=0){this.index=index;this.elapsed=0;this.paused=false;this.active=false;this.loading=false;}
 advance(dt){if(!this.active||this.paused||this.loading)return false;this.elapsed=Math.min(tourChapters[this.index].duration,this.elapsed+Math.max(0,Math.min(dt,.1)));return this.elapsed>=tourChapters[this.index].duration;}
 get total(){return tourChapters.reduce((n,c,i)=>n+(i<this.index?c.duration:i===this.index?this.elapsed:0),0);}
}

export class CuratedTour {
 constructor({enter,animate,release,onFinish,audio,reduced}){
  Object.assign(this,{enter,animate,release,onFinish,audio,reduced});this.clock=new TourClock();this.generation=0;
  document.body.insertAdjacentHTML('beforeend',`<dialog id="tourDialog" class="tour-dialog"><header><div><p class="eyebrow">循着一卷湖山，走进三重境界</p><h2>一湖三境</h2></div><button data-tour-close aria-label="关闭导览">×</button></header><p class="tour-lead">今日的闲情，宋时的烟火，湖西的野趣。<br>六幕相连，约两分半；随时可以停下，亲手游湖。</p><div class="tour-chapters">${tourChapters.map((c,i)=>`<button data-tour-chapter="${i}"><small>${String(i+1).padStart(2,'0')}</small><b>${c.seal}</b><span>${c.name}</span><em>${c.detail}</em></button>`).join('')}</div><footer><label class="tour-audio"><input id="tourAudio" type="checkbox">伴着配乐游湖</label><button id="tourStart" class="primary">展开六幕导览 →</button></footer><p class="tour-note">跨四时、往来今夕的艺术游程。不是现实中的单日游路线。</p></dialog><aside id="tourBar" hidden aria-label="六幕导览控制"><div class="tour-ribbon"><span>一湖三境</span><nav aria-label="选择导览章节">${tourChapters.map((c,i)=>`<button data-tour-jump="${i}" title="${c.name}" aria-label="第 ${i+1} 幕：${c.name}">${c.seal}</button>`).join('')}</nav><button id="tourPause">暂停</button><button id="tourTakeover">我来游湖 ↗</button></div><progress id="tourProgress" max="142" value="0" aria-label="六幕导览进度"></progress><p id="tourCaption"></p><span id="tourChapterStatus" class="sr-only" aria-live="polite"></span></aside><div id="chapterVeil" aria-hidden="true"></div><dialog id="tourEnd"><header><div><p class="eyebrow">卷已收，湖山仍在</p><h2>把西湖，带回日常。</h2></div><button data-tour-end-close aria-label="关闭收卷">×</button></header><p>这一程走过春堤、夏荷、宋茶与湖西曲水。接下来，选一处想久留的风景，走出自己的游程。</p><div><button id="tourKeepsake" class="primary">题一张西湖画笺</button><button id="tourExplore">继续自由游湖 →</button></div></dialog>`);
  this.dialog=document.querySelector('#tourDialog');this.bar=document.querySelector('#tourBar');this.veil=document.querySelector('#chapterVeil');
  this.dialog.querySelector('[data-tour-close]').onclick=()=>this.dialog.close();
  document.querySelector('#tourStart').onclick=()=>this.start(0);
  this.dialog.querySelectorAll('[data-tour-chapter]').forEach(b=>b.onclick=()=>this.start(+b.dataset.tourChapter));
  this.bar.querySelectorAll('[data-tour-jump]').forEach(b=>b.onclick=()=>this.change(+b.dataset.tourJump));
  document.querySelector('#tourPause').onclick=()=>this.pause();document.querySelector('#tourTakeover').onclick=()=>this.stop();
  const end=document.querySelector('#tourEnd');end.querySelector('[data-tour-end-close]').onclick=()=>end.close();document.querySelector('#tourExplore').onclick=()=>end.close();document.querySelector('#tourKeepsake').onclick=()=>{end.close();this.onFinish();};
  window.addEventListener('keydown',e=>{if(!this.clock.active||document.querySelector('dialog[open]'))return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();this.stop();}else if(e.code==='Space'&&!e.target.closest('button,input,a')){e.preventDefault();e.stopImmediatePropagation();this.pause();}},true);
 }
 get active(){return this.clock.active;}
 open(){document.querySelector('#tourAudio').checked=this.audio.enabled;this.dialog.showModal();}
 async start(index){this.dialog.close();if(document.querySelector('#tourAudio').checked!==this.audio.enabled){try{await this.audio.toggle();}catch{document.querySelector('#tourChapterStatus').textContent='当前浏览器声音未能启动，仍可静音游览。';}}this.clock.active=true;this.clock.paused=this.reduced.matches;document.body.classList.add('tour-running');this.bar.hidden=false;await this.change(index);}
 async change(index){if(!this.active)return;const token=++this.generation;this.clock.loading=true;this.veil.classList.add('show');this.release();this.clock.index=index;this.clock.elapsed=0;this.paint();
  await new Promise(resolve=>setTimeout(resolve,this.reduced.matches?0:420));if(token!==this.generation)return;
  try{await this.enter(tourChapters[index],()=>token===this.generation);}catch{if(token===this.generation)this.stop();return;}if(token!==this.generation)return;this.clock.loading=false;this.veil.classList.remove('show');this.paint();this.audio.update(!this.clock.paused&&!document.hidden);
 }
 pause(){this.clock.paused=!this.clock.paused;this.audio.update(!this.clock.paused&&!document.hidden);this.paint();}
 stop(){++this.generation;this.clock.active=false;this.clock.loading=false;this.release();this.audio.update(!document.hidden);this.veil.classList.remove('show');document.body.classList.remove('tour-running');this.bar.hidden=true;document.querySelector('body[data-mode="visit"] #visitCanvas,body[data-mode="song"] #world,body[data-mode="crossing"] #cancelCrossing')?.focus({preventScroll:true});}
 update(dt){if(!this.active||this.clock.loading)return;const changed=this.clock.advance(dt);if(!this.clock.paused)this.animate(tourChapters[this.clock.index],this.clock.elapsed,dt);document.querySelector('#tourProgress').value=this.clock.total;if(changed){if(this.clock.index<tourChapters.length-1)this.change(this.clock.index+1);else{this.stop();document.querySelector('#tourEnd').showModal();}}}
 paint(){const c=tourChapters[this.clock.index];this.bar.querySelectorAll('[data-tour-jump]').forEach((b,i)=>b.setAttribute('aria-current',String(i===this.clock.index)));document.querySelector('#tourCaption').textContent=c.caption;document.querySelector('#tourChapterStatus').textContent=`第 ${this.clock.index+1} 幕，${c.name}`;document.querySelector('#tourPause').textContent=this.clock.paused?'继续':'暂停';document.querySelector('#tourPause').setAttribute('aria-pressed',String(this.clock.paused));document.querySelector('#tourProgress').value=this.clock.total;}
 snapshot(){return {active:this.active,index:this.clock.index,elapsed:this.clock.elapsed,paused:this.clock.paused,loading:this.clock.loading};}
}
