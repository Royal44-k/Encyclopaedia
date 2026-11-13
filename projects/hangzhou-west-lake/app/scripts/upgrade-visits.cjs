const fs=require('fs');
const file='src/visits.js',old=fs.readFileSync(file,'utf8'),tea=old.slice(old.indexOf(' drawTea(c,'),old.indexOf(' snapshot(){'));
const head=`import {clamp} from './state.js';
import {drawWeather} from './weather.js';
import {VisitWorld} from './visit-world.js';
import {Wuguitan} from './wuguitan.js';
import {benchPose,smooth,limit,riverStops} from './journey-space.js';
const $=s=>document.querySelector(s),TAU=Math.PI*2;
export class LakeVisit{
 constructor(canvas,{audio,onExit,onTea,onComplete,onCross,reduced}){Object.assign(this,{canvas,audio,onExit,onTea,onComplete,onCross,reduced});this.ctx=canvas.getContext('2d',{alpha:false});this.cache=new Map();this.token=0;this.active=false;this.world=new VisitWorld();this.resize();this.bind();}
 resize(){this.w=innerWidth;this.h=innerHeight;this.dpr=Math.min(devicePixelRatio||1,1.7);this.canvas.width=this.w*this.dpr;this.canvas.height=this.h*this.dpr;}
 async image(name){if(!this.cache.has(name)){const p=new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('此景暂未展开，请重试'));im.src=name==='song-scene'?'/assets/song.webp':'/assets/v2/'+name+'.webp';});this.cache.set(name,p);p.catch(()=>this.cache.delete(name));}return this.cache.get(name);}
 async open(data,returnMode='modern'){
  this.active=true;this.data=data;this.returnMode=returnMode;Object.assign(this,{t:0,progress:0,destination:1,walking:false,pan:0,pitch:0,targetPan:0,targetPitch:0,seated:false,seatMotion:0,seatStart:0,atTop:false,closeLook:false,focusBlend:0,weather:'clear',sheltered:false,actionTime:0,actionKind:null,teaStep:0,waterLevel:0,sip:0,whisk:0,grind:0,wind:.35,moon:0,poem:[],loading:true,error:false,img:null,prev:null});this.river=new Wuguitan();const token=++this.token;this.audio.setScene?.(data.id);
  $('#visit').dataset.kind=data.kind;$('#visitTitle').textContent=data.name;$('#visitEn').textContent=data.en;$('#visitPlace').textContent=data.place;$('#visitSeason').textContent=data.season;$('#visitDetail').textContent=data.detail;$('#visitSource').href=data.source;$('#visitSource').textContent=data.sourceName;$('#visitCulture').hidden=true;$('#visitNav').hidden=returnMode==='song';$('#visitCross').hidden=returnMode==='song'||data.kind==='river';$('#visitTea').hidden=this.isTea||returnMode==='song'||data.kind==='river';$('#visitSnow').hidden=data.id!=='duanqiao';
  const route=data.kind==='river'?riverStops.map(v=>v.name):data.route;$('#visitRoute').innerHTML=route.map((v,i)=>'<button data-route="'+i+'">'+v+'</button>').join('');
  $('#visitRoute').querySelectorAll('button').forEach((b,i)=>b.onclick=()=>this.goTo(data.kind==='river'?riverStops[i].at:i/2));this.makeTools();this.status('正在走近这片湖山…');this.updateUI();
  try{const img=await this.image(data.image);if(this.isTea&&!this.props)this.props=await Promise.all(Array.from({length:6},(_,i)=>this.image('tea-'+i)));if(token!==this.token)return;this.img=img;this.loading=false;this.status(this.isTea?(data.kind==='songtea'?'茶博士：先碾细茶末，再调膏击拂。':'临窗坐下，先为自己沏一杯茶。'):data.kind==='river'?'点击启程，船工带你进入湖西曲水；随时停橹、拖动环顾。':'点选路段或点击开始漫步；再次点击即可停步，拖动画面环顾。');this.updateUI();}catch(e){if(token!==this.token)return;this.loading=false;this.error=true;this.status(e.message);this.updateUI();}
 }
 get isTea(){return ['tea','songtea'].includes(this.data?.kind);}
 get locked(){return this.loading||!!this.actionKind||this.seated||this.isTea||this.atTop||this.data?.kind==='songbirds';}
 close(){this.active=false;this.walking=false;this.token++;this.onExit(this.returnMode);}
 bind(){
  $('#visitBack').onclick=()=>this.close();$('#visitCross').onclick=()=>{this.active=false;this.token++;this.onCross();};$('#visitTea').onclick=()=>this.onTea();
  $('#visitAbout').onclick=()=>{$('#visitCulture').hidden=!$('#visitCulture').hidden;};$('#visitCultureClose').onclick=()=>$('#visitCulture').hidden=true;
  $('#visitAction').onclick=()=>this.action();$('#visitReset').onclick=()=>this.open(this.data,this.returnMode);
  $('#visitWalk').onclick=()=>{this.destination=1;this.setWalking(!this.walking);};
  $('#visitWeather').onclick=async()=>{if(this.loading)return;if(this.weather==='snow'&&!await this.switchImage(this.data.image))return;this.weather=this.weather==='rain'?'clear':'rain';this.audio.update(true,this.weather==='rain');this.updateUI();};$('#visitSnow').onclick=()=>this.toggleSnow();$('#visitShelter').onclick=()=>{this.sheltered=!this.sheltered;this.updateUI();};
  $('#visitSound').onclick=async()=>{try{await this.audio.toggle();this.updateUI();}catch{this.status('声音未能开启，请再试一次。');}};
  let drag=null;this.canvas.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY};this.canvas.setPointerCapture(e.pointerId);};this.canvas.onpointermove=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
   if(this.data.kind==='songtea'&&this.teaStep===0){this.grind=limit(this.grind+Math.hypot(dx,dy)/1700);if(this.grind>=1){this.teaStep=1;this.status('茶末已细，接着注汤调膏。');}this.updateUI();}
   else if(this.data.kind==='songtea'&&this.teaStep===2){this.whisk=limit(this.whisk+Math.hypot(dx,dy)/2200);if(this.whisk>=1){this.teaStep=3;this.complete();this.status('汤花细匀，贴盏而生。宋人从茶沫与水痕中辨茶。');}this.updateUI();}
   else{this.targetPan=clamp(this.targetPan-dx/this.w*1.8,-1,1);this.targetPitch=clamp(this.targetPitch-dy/this.h,-.6,.6);}drag={x:e.clientX,y:e.clientY};};this.canvas.onpointerup=this.canvas.onpointercancel=()=>drag=null;
  this.canvas.onwheel=e=>{e.preventDefault();if(!this.locked){this.destination=clamp(this.progress+e.deltaY*.001,0,1);this.setWalking(true);}};
  window.addEventListener('keydown',e=>{if(!this.active||document.querySelector('dialog[open]'))return;if(e.key==='Escape'){e.preventDefault();this.close();return;}if(e.target.closest('button,input,a,select'))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','s','a','d'].includes(e.key)){e.preventDefault();if(['ArrowUp','w'].includes(e.key)){this.destination=1;this.setWalking(true);}if(['ArrowDown','s'].includes(e.key))this.goTo(Math.max(0,this.progress-.2));if(['ArrowLeft','a'].includes(e.key))this.targetPan=clamp(this.targetPan-.1,-1,1);if(['ArrowRight','d'].includes(e.key))this.targetPan=clamp(this.targetPan+.1,-1,1);}});
  window.addEventListener('keyup',e=>{if(['ArrowUp','w'].includes(e.key))this.setWalking(false);});window.addEventListener('blur',()=>this.setWalking(false));
 }
 goTo(n){if(this.locked)return;this.destination=n;this.closeLook=false;this.targetPitch=0;this.setWalking(true);}
 setWalking(value){this.walking=value&&!this.locked;this.updateUI();}
 status(text){$('#visitStatus').textContent=text;}
 makeTools(){
  const box=$('#visitTools');box.innerHTML='';const k=this.data.kind;const add=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=fn;box.append(b);return b;};
  if(k==='lotus'){const label=document.createElement('label');label.innerHTML='荷风 <input id="lotusWind" type="range" min="0" max="100" value="35" aria-label="荷风强弱">';box.append(label);label.querySelector('input').oninput=e=>{this.wind=+e.target.value/100;this.closeLook=true;};}
  if(k==='moon'){const label=document.createElement('label');label.innerHTML='候月 <input id="moonTime" type="range" min="0" max="100" value="0" aria-label="月升时刻">';box.append(label);label.querySelector('input').oninput=e=>{this.moon=+e.target.value/100;this.closeLook=true;};}
  if(k==='bridge'){add('望外湖',()=>{this.targetPan=-.95;this.status('桥左外湖 · 湖水铺向东南远岸');});add('望北里湖',()=>{this.targetPan=.95;this.status('桥右北里湖 · 白堤与宝石山方向');});}
  if(k==='towers'){add('向左取景',()=>{this.targetPan=-.85;this.closeLook=true;});add('向右取景',()=>{this.targetPan=.85;this.closeLook=true;});}
  if(k==='mist'){add('望南高峰',()=>this.targetPan=-.8);add('望北高峰',()=>this.targetPan=.8);}
  if(k==='tower'){add('湖西山水',()=>{if(this.atTop)this.targetPan=-.85;});add('东岸城市',()=>{if(this.atTop)this.targetPan=.85;});}
  if(k==='river'){add('体验摇橹',()=>{this.river.rowing=!this.river.rowing;box.firstChild.textContent=this.river.rowing?'回篷下坐看':'体验摇橹';this.status(this.river.rowing?'镜头移至船尾。点击行舟开始摇橹，拖动环顾两岸。':'回到篷下乘客视角，静看水岸从身边经过。');});add('留一幅湖山',()=>this.postcard());}
  if(k==='songbirds'){for(const [id,label] of [['willow','听风 · 写柳'],['bird','听莺 · 点鸟'],['boat','听橹 · 添舟']])add(label,()=>{if(!this.poem.includes(id))this.poem.push(id);this.audio.effect(id==='bird'?'bird':'water');this.status(this.poem.length===3?'画扇已成：一枝柳色入湖光，半棹清波带晚香。':'循着声音，添一笔眼前湖山。');if(this.poem.length===3)this.complete();this.updateUI();});}
 }
 updateUI(){if(!this.data)return;const k=this.data.kind,a=$('#visitAction');a.disabled=this.loading||!!this.actionKind;a.textContent=this.error?'重新展开':k==='songtea'?['碾茶成末','注汤调膏','执筅击拂','观汤花 · 咬盏'][this.teaStep]:this.isTea?(this.teaStep===0?'温水入盏':this.teaStep===1?'等叶舒展':this.teaStep===2?'举杯品茗':'再品一口'):k==='river'?(this.closeLook?'继续游湖':'停橹 · 观水鸟'):k==='songbirds'?'收下诗画笺':this.seated?'起身回到堤上':this.atTop?'回到长桥赏夕照':this.closeLook?'收回目光':this.data.action;
  $('#visitWalk').hidden=this.isTea||k==='tower'||k==='songbirds';$('#visitWalk').disabled=this.locked||this.progress>=1;$('#visitWalk').textContent=this.walking?(k==='river'?'停橹看景':'停步看看'):this.progress>=1?'已到此段终点':k==='river'?'启程 · 舟入青境':'开始漫步';$('#visitWalk').setAttribute('aria-pressed',String(this.walking));$('#visitReset').hidden=false;
  $('#visitWeather').setAttribute('aria-pressed',String(this.weather==='rain'));$('#visitSnow').setAttribute('aria-pressed',String(this.weather==='snow'));$('#visitShelter').hidden=this.weather==='clear'||this.isTea||this.atTop||k==='river';$('#visitShelter').textContent=this.sheltered?'收伞':'撑伞';$('#visitProgress').value=this.progress;
  document.querySelectorAll('#visitRoute [data-route]').forEach((b,i)=>{const value=k==='river'?riverStops[i].at:i/2;b.classList.toggle('active',this.progress>=value-.02);b.disabled=this.locked;});
  $('#visitSound').setAttribute('aria-pressed',String(this.audio.enabled));$('#visitSound').textContent=this.audio.enabled?'♫ 关闭配乐':'♫ 开启配乐';
  $('#visitState').textContent=k==='river'?(this.river.chapter?.name||'西里湖 · 启程'):this.actionKind==='sit'||this.actionKind==='stand'?benchPose(this.seatMotion).phase:this.isTea?(k==='songtea'?'宋人点茶 · 茶肆学艺':'龙井清茶 · 临窗闲坐'):this.seated?'倚椅观湖 · 拖动环顾':this.atTop?'雷峰塔环廊 · 北望湖山':this.walking?'漫步中 · 点击停步':this.data.route[Math.min(2,Math.floor(this.progress*2.99))];
  $('#visitMusic').textContent=this.audio.scoreTitle||'';
 }
 async switchImage(name){const token=this.token;this.loading=true;this.updateUI();try{const im=await this.image(name);if(token!==this.token)return false;this.prev=this.img;this.img=im;this.fade=0;return true;}catch(e){if(token===this.token)this.status(e.message);return false;}finally{if(token===this.token){this.loading=false;this.updateUI();}}}
 async toggleSnow(){if(this.loading)return;const next=this.weather==='snow'?'clear':'snow';if(await this.switchImage(next==='snow'?'duanqiao-snow':'duanqiao')){this.weather=next;this.updateUI();}}
 async action(){if(this.error){this.open(this.data,this.returnMode);return;}if(this.loading||this.actionKind)return;this.walking=false;const k=this.data.kind;
  if(k==='bench'){this.seatStart=this.progress*7;this.actionKind=this.seated?'stand':'sit';this.actionTime=0;this.targetPan=0;this.targetPitch=0;this.status(this.seated?'收回目光，起身转回堤上。':'沿步道走到椅旁，俯看座面，转向湖水，再缓缓坐下。');}
  else if(k==='tower'){if(this.atTop){if(await this.switchImage('leifeng-sunset')){this.atTop=false;this.progress=0;}}else{this.actionKind='climb';this.actionTime=0;this.status('越过塔内檐影，随视线升高，湖面在环廊外展开。');this.image('leifeng-top').catch(()=>{});}}
  else if(k==='songtea'){if(this.teaStep===0){this.grind=limit(this.grind+.25);this.status('拖动画面来回碾茶，也可点击四次完成。');if(this.grind>=1)this.teaStep=1;}else if(this.teaStep===1){this.actionKind='songpour';this.actionTime=0;}else if(this.teaStep===2){this.whisk=limit(this.whisk+.2);this.status('来回拖动击拂，或分次点击执筅；茶沫随你的动作细密起来。');if(this.whisk>=1){this.teaStep=3;this.complete();}}else this.status('茶沫细匀，沿盏相咬；宋人的茶趣，在汤花与水痕中。');}
  else if(this.isTea){this.actionKind=this.teaStep===0?'pour':this.teaStep===1?'infuse':'drink';this.actionTime=0;this.audio.effect('water');}
  else if(k==='songbirds'){if(this.poem.length<3)this.status('先听风、莺与橹，画扇会添上对应笔墨。');else this.postcard();}
  else if(k==='river'){this.closeLook=!this.closeLook;this.targetPan=this.closeLook?.48:0;this.targetPitch=this.closeLook?.18:0;this.status(this.closeLook?'停橹片刻，望向水岸。水鸟只在部分水段出现，不追赶、不投喂。':'目光回到航向，随时继续启程。');}
  else if(k==='bell'){this.actionKind='bell';this.actionTime=0;this.audio.effect('bell');this.status('钟楼外静听 · 一声钟，越过林梢，余韵渐远。');}
  else{this.closeLook=!this.closeLook;this.actionTime=0;this.targetPitch=['fish','lotus'].includes(k)&&this.closeLook?.48:0;if(k==='birds'){this.audio.effect('bird',.6);this.targetPan=.6;}if(k==='bridge')this.targetPan=-.85;this.status(({fish:'俯看红鱼池，追随游鱼穿过花影；无需投喂。',lotus:'拨动荷风，叶面随风舒展；也可切换听雨。',moon:'调节候月时刻，月升与碎月带一同变化。',towers:'左右换位取景，观察三座塔的远近关系。',mist:'静候七秒，让云隙慢慢让出山肩。',birds:'一声清啼来自右侧柳枝，转头寻找。',bridge:'停在桥面，转向两侧细看湖岸。'})[k]||'静看湖山。');this.complete();}
  this.updateUI();
 }
 complete(){this.onComplete(this.data);}
 postcard(){const a=document.createElement('a');a.download='杭州西子湖-'+this.data.name+'.png';a.href=this.canvas.toDataURL('image/png');a.click();this.status('此刻湖山已留在画笺里。');}
 render(dt){if(!this.active)return;const c=this.ctx,w=this.w,h=this.h,reduced=this.reduced.matches,k=this.data.kind;this.t+=dt;this.pan+=(this.targetPan-this.pan)*Math.min(1,dt*4);this.pitch+=(this.targetPitch-this.pitch)*Math.min(1,dt*4);this.focusBlend+=(Number(this.closeLook)-this.focusBlend)*Math.min(1,dt*2);
  if(this.walking&&!this.locked){const speed=k==='river'?.013:.075,delta=this.destination-this.progress;this.progress=clamp(this.progress+Math.sign(delta)*Math.min(Math.abs(delta),dt*speed),0,1);if(Math.abs(this.progress-this.destination)<.0001){this.walking=false;this.status(k==='river'?'停橹靠景，拖动环顾这片湖西水色。':'已到目的地，停步看看眼前湖山。');if(this.progress>=.99)this.complete();}this.updateUI();}
  if(this.closeLook&&!this.actionKind)this.actionTime+=dt;
  if(this.actionKind){this.actionTime+=dt;const a=this.actionKind,seconds={sit:9,stand:6,climb:5.5,pour:2.6,songpour:2.6,infuse:3,drink:2.8,bell:7}[a];
   if(a==='sit'||a==='stand'){this.seatMotion=a==='sit'?limit(this.actionTime/seconds):1-limit(this.actionTime/seconds);this.progress=this.seatMotion;this.updateUI();}
   if(a==='pour'||a==='songpour')this.waterLevel=smooth(this.actionTime/seconds);if(a==='drink')this.sip=Math.sin(Math.PI*limit(this.actionTime/seconds));if(a==='climb')this.progress=limit(this.actionTime/seconds);
   if(this.actionTime>=seconds){this.actionKind=null;if(a==='sit'){this.seated=true;this.seatMotion=1;this.complete();}else if(a==='stand'){this.seated=false;this.seatMotion=0;this.progress=0;this.targetPan=0;}else if(a==='climb'){const token=this.token;this.switchImage('leifeng-top').then(ok=>{if(ok&&token===this.token){this.atTop=true;this.progress=1;this.complete();this.updateUI();}});}else if(a==='pour')this.teaStep=1;else if(a==='songpour')this.teaStep=2;else if(a==='infuse')this.teaStep=2;else if(a==='drink'){this.teaStep=3;this.sip=0;this.complete();}else if(a==='bell')this.complete();this.updateUI();}}
  c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle='#e8ddc4';c.fillRect(0,0,w,h);if(!this.img)return;
  if(k==='river'){this.river.render(this,c,w,h,dt);}else{
   const zoom=1.06,scale=Math.max(w/this.img.width,h/this.img.height)*zoom,iw=this.img.width*scale,ih=this.img.height*scale;
   const cam=this.world.camera(this),x=(w-iw)/2-this.pan*Math.max(50,(iw-w)*.46)-(k==='bench'?Math.sin(cam.yaw)*w*.1:0),y=(h-ih)/2-this.pitch*80+(cam.y-1.65)*35;
   c.drawImage(this.img,x,y,iw,ih);if(this.prev&&this.fade<1){this.fade=Math.min(1,this.fade+dt/(reduced?.1:1.8));c.save();c.globalAlpha=1-this.fade;c.drawImage(this.prev,x,y,iw,ih);c.restore();if(this.fade>=1)this.prev=null;}
   this.world.render(this,c,w,h);
  }
  if(this.isTea){this.drawTea(c,w,h,reduced?0:this.t);if(k==='songtea')this.drawRitual(c,w,h);}
  if(k==='songbirds')this.drawPoem(c,w,h);
  drawWeather(c,w,h,reduced?0:this.t,this.weather,{sheltered:this.isTea||this.atTop||k==='river',reduced});if(this.sheltered&&this.weather!=='clear'&&!this.isTea&&!this.atTop)this.umbrella(c,w,h);
  if(this.actionKind==='climb'){const q=this.actionTime/5.5;c.fillStyle='rgba(46,45,32,'+(Math.sin(q*Math.PI)*.9)+')';c.fillRect(0,0,w,h);c.strokeStyle='#b6a77d60';c.lineWidth=5;for(let i=0;i<5;i++){const yy=((i/5+q*1.2)%1)*h;c.beginPath();c.moveTo(0,yy);c.lineTo(w,yy);c.stroke();}c.fillStyle='#eae0bf';c.textAlign='center';c.font='18px serif';c.fillText('登临 · '+Math.min(5,1+Math.floor(q*5))+' 层',w*.5,h*.55);c.textAlign='left';}
 }
 drawRitual(c,w,h){if(this.teaStep===0){const x=w*.48,y=h*.77,r=Math.min(w,h)*.08;c.fillStyle='#a79b80';c.beginPath();c.ellipse(x,y,r*1.8,r*.65,0,0,TAU);c.fill();c.strokeStyle='#726c53';c.lineWidth=7;c.beginPath();c.ellipse(x,y,r*1.5,r*.4,0,0,TAU);c.stroke();c.fillStyle='#8c8166';c.beginPath();c.ellipse(x+Math.sin(this.grind*40)*r*.9,y-r*.3,r*.22,r*.7,0,0,TAU);c.fill();}const p=this.teaStep===0?this.grind:this.teaStep===2?this.whisk:1;c.fillStyle='#faf0d6b0';c.fillRect(w*.36,h*.9,w*.28,3);c.fillStyle='#668164';c.fillRect(w*.36,h*.9,w*.28*p,3);}
 drawPoem(c,w,h){c.save();c.translate(w*.56,h*.65);const r=Math.min(w*.35,h*.34);c.fillStyle='#eee3c6ef';c.strokeStyle='#8e7b54';c.lineWidth=1;c.beginPath();c.moveTo(-r*.65,r*.22);c.quadraticCurveTo(-r*1.1,-r*.65,0,-r*.72);c.quadraticCurveTo(r*1.1,-r*.65,r*.65,r*.22);c.quadraticCurveTo(0,-r*.05,-r*.65,r*.22);c.fill();c.stroke();if(this.poem.includes('willow')){c.strokeStyle='#6c7951';for(let i=0;i<9;i++){c.beginPath();c.moveTo(-r*.55,-r*.44);c.quadraticCurveTo(i*r*.07,-r*.6,i*r*.06-r*.4,r*.02);c.stroke();}}if(this.poem.includes('bird'))this.world.bird(c,r*.12,-r*.34,2,0);if(this.poem.includes('boat')){c.fillStyle='#7f7154';c.beginPath();c.moveTo(r*.13,-r*.02);c.quadraticCurveTo(r*.35,r*.25,r*.65,-r*.02);c.fill();}if(this.poem.length===3){c.font='14px serif';c.fillStyle='#5a5b42';c.fillText('一枝柳色入湖光',-r*.4,-r*.2);}c.restore();}
`;
const tail=` snapshot(){return {id:this.data?.id,kind:this.data?.kind,progress:this.progress,seated:this.seated,seatMotion:this.seatMotion,pose:this.data?.kind==='bench'?benchPose(this.seatMotion):null,atTop:this.atTop,teaStep:this.teaStep,grind:this.grind,whisk:this.whisk,poem:this.poem,weather:this.weather,image:this.img?.src?.split('/').pop(),loading:this.loading,action:this.actionKind,walking:this.walking,returnMode:this.returnMode,closeLook:this.closeLook,river:this.data?.kind==='river'?{chapter:this.river.chapter?.name,stern:this.river.stern,camera:this.river.cam}:null,music:this.audio.scoreTitle};}
}
`;
fs.writeFileSync(file,head+tea+tail);
