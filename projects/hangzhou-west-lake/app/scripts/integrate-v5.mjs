import {readFile,writeFile} from 'node:fs/promises';
async function edit(file,fn){await writeFile(file,fn(await readFile(file,'utf8')));}
function rep(s,a,b){if(!s.includes(a))throw Error('Missing '+a.slice(0,75));return s.replace(a,()=>b);}
await edit('src/visits.js',s=>{
 s="import {TeaHands,LotusHands,teaLayout} from './first-person-hands.js';\nimport {drawFanStudio} from './bird-studio.js';\nimport {drawPaintedScene} from './scenery-motion.js';\n"+s;
 s=rep(s,'onPostcard,reduced','onPostcard,onExplore,reduced');s=rep(s,'onPostcard,reduced','onPostcard,onExplore,reduced');
 s=rep(s,'this.river=new Wuguitan();','this.hands=new TeaHands();this.lotusHands=new LotusHands();this.birdFound=false;this.river=new Wuguitan();');
 s=rep(s,"get locked(){return this.loading", "get locked(){return (this.data?.kind==='river'&&['disembarking','ashore'].includes(this.river?.phase))||this.loading");
 const a=s.indexOf('  let drag=null;'),b=s.indexOf('  this.canvas.onwheel',a);if(a<0||b<0)throw Error('pointer');s=s.slice(0,a)+`  let drag=null;
  this.canvas.onpointerdown=e=>{this.canvas.setPointerCapture(e.pointerId);if(this.loading||this.actionKind)return;if(this.hands.down(this,e.clientX,e.clientY)||this.lotusHands.down(this,e.clientX,e.clientY))return;drag={x:e.clientX,y:e.clientY};};
  this.canvas.onpointermove=e=>{if(this.hands.move(this,e.clientX,e.clientY)||this.lotusHands.move(this,e.clientX,e.clientY))return;if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;this.targetPan=clamp(this.targetPan-dx/this.w*1.8,-1,1);this.targetPitch=clamp(this.targetPitch-dy/this.h,-.6,.6);drag={x:e.clientX,y:e.clientY};};
  this.canvas.onpointerup=this.canvas.onpointercancel=()=>{drag=null;this.hands.up();if(!this.lotusHands.picked){this.lotusHands.drag=false;this.lotusHands.point=null;this.lotusHands.pull=0;}};
`+s.slice(b);
 s=rep(s,"if(e.target.closest('button,input,a,select'))return;", "if(e.target.closest('button,input,a,select'))return;if(e.code==='Space'&&['songtea','lotus','bell'].includes(this.data.kind)){e.preventDefault();this.action();return;}");
 s=rep(s,"const box=$('#visitTools');box.innerHTML='';", "const box=$('#visitTools');box.innerHTML='';");
 s=rep(s,"  if(k==='lotus'){", "  if(k==='tea')add('亲手体验宋人点茶 ↗',()=>this.onExplore('song-tea'));\n  if(k==='lotus'){");
 s=rep(s,"if(k==='river'){add('体验摇橹'", "if(k==='river'){add('沿岸风物与继续环湖',()=>{this.walking=false;this.status('湖西支线之外，还可独立转去苏堤、花港、柳浪和长桥观景。');document.querySelector('#riverPlaces').hidden=!document.querySelector('#riverPlaces').hidden;});add('体验摇橹'");
 s=rep(s,"box.firstChild.textContent=this.river.rowing?", "box.children[1].textContent=this.river.rowing?");
 s=rep(s,"box.lastChild.textContent=quiet?'显示游览工具':'沉浸观景';", "box.lastChild.textContent=quiet?'显示游览工具':'沉浸观景';");
 s=rep(s,"this.audio.effect(id==='bird'?'bird':'water');", "this.audio.playUserEffect(id==='bird'?'bird':'water').catch(()=>{});");
 s=rep(s,"this.updateUI();});}\n }", "this.updateUI();});}\n }");
 s=rep(s,"$('#visit').classList.remove('quiet','tools-open');", "$('#riverPlaces').hidden=true;$('#visit').classList.remove('quiet','tools-open');");
 s=rep(s,"'茶博士：先碾细茶末，再调膏击拂。'", "'双手执碾：抓住画中碾轮，左右推磨。碾细后，持壶移到盏上倾注，再执筅击拂。'");
 s=rep(s,"k==='river'?(this.closeLook?'继续游湖':'停橹 · 观水鸟')", "k==='river'?(this.river.phase==='moored'?'起身 · 离船上岸':this.river.phase==='disembarking'?'正在离船上岸':this.river.phase==='ashore'?'岸边留一张画笺':this.closeLook?'继续游湖':'停橹 · 观水鸟')");
 s=rep(s,"k==='songbirds'?'收下诗画笺':this.seated", "k==='songbirds'?'收下诗画笺':k==='lotus'?(this.lotusHands.picked?'把荷香收入画笺':this.lotusHands.enabled?'采下这一枝（也可拖动）':'伸手 · 画中采莲'):k==='bell'?'听一声晚钟':this.seated");
 s=rep(s,"a.disabled=this.loading||!!this.actionKind;", "a.disabled=this.loading||!!this.actionKind||(k==='river'&&this.river.phase==='disembarking');");
 s=rep(s,"$('#visitWalk').hidden=this.isTea||k==='tower'||k==='songbirds';", "$('#visitWalk').hidden=this.isTea||k==='tower'||k==='songbirds'||k==='bell';");
 s=rep(s,"$('#visitReset').hidden=false;", "$('#visitReset').hidden=k==='bell';");
 s=rep(s,"(this.river.chapter?.name||'西里湖 · 启程')", "(this.river.phase==='ashore'?'已靠岸 · 湖西埠头':this.river.phase==='disembarking'?'扶舷起身 · 缓步上岸':this.river.chapter?.name||'西里湖 · 启程')");
 s=rep(s,"this.data.route[Math.min(2,Math.floor(this.progress*2.99))]", "k==='bell'?'南屏晚钟 · 静听余韵':this.data.route[Math.min(2,Math.floor(this.progress*2.99))]");
 s=rep(s,"else if(k==='songtea'){if(this.teaStep===0)","else if(k==='songtea'){this.hands.pulse=1;if(this.teaStep===0)");
 s=rep(s,"拖动画面来回碾茶，也可点击四次完成。", "抓住碾轮左右推磨；键盘或按钮也可完成相同动作。");
 s=rep(s,"来回拖动击拂，或分次点击执筅；茶沫随你的动作细密起来。", "抓住茶筅来回击拂；茶沫随手腕动作渐渐细密。");
 s=rep(s,"else if(k==='river'){this.closeLook", "else if(k==='river'){if(this.river.phase==='moored'){this.river.phase='disembarking';this.river.landingTime=0;this.status('扶住船舷，缓缓起身，跨过跳板走到岸边。');this.updateUI();return;}if(this.river.phase==='ashore'){this.postcard();return;}this.closeLook");
 s=rep(s,"else if(k==='bell'){this.actionKind='bell';this.actionTime=0;this.audio.effect('bell');", "else if(k==='lotus'){if(this.lotusHands.picked){this.postcard();return;}if(!this.lotusHands.enabled){this.lotusHands.enabled=true;this.status('画中采莲：抓住眼前这枝荷花，轻轻向自己拉近。');}else{this.lotusHands.picked=true;this.complete();this.status('一枝荷香在掌心，可收入画笺。');}}\n  else if(k==='bell'){try{await this.audio.playUserEffect('bell');}catch{this.status('当前浏览器未能启用声音，请再点击一次。');return;}this.actionKind='bell';this.actionTime=0;");
 s=rep(s,"this.audio.effect('bird',.6);this.targetPan=.6;", "this.audio.playUserEffect('bird',.6).catch(()=>{});this.targetPan=.25;");
 s=rep(s,"静候七秒，让云隙慢慢让出山肩。", "薄雾漫过水天，缓缓流动、散开；静候十二秒，看山肩渐明。");
 s=rep(s,"一声清啼来自右侧柳枝，转头寻找。", "莺声来自右侧。拖动视线向右寻找，让柳枝上的黄鹂走近画面中央。");
 s=rep(s,"||'静看湖山。');this.complete();", "||'静看湖山。');if(k!=='birds')this.complete();");
 s=rep(s,"k=this.data.kind;this.t+=dt;", "k=this.data.kind;this.frameDt=dt;this.hands.tick(this,dt);if(k==='birds'&&this.closeLook&&!this.birdFound&&Math.abs(this.pan-.58)<.16){this.birdFound=true;this.complete();this.status('寻到了柳间黄鹂。停留片刻，看它轻转羽翼，听近处的一声清啼。');}this.t+=dt;");
 s=rep(s,"if(this.progress>=.99)this.complete();", "if(this.progress>=.99&&k!=='river')this.complete();");
 const x=s.indexOf('   const zoom=1.06,'),y=s.indexOf('   this.world.render(this,c,w,h);',x);if(x<0||y<0)throw Error('scene background');s=s.slice(0,x)+"   drawPaintedScene(this,c,w,h);\n"+s.slice(y);
 s=rep(s,"if(this.isTea){this.drawTea(c,w,h,reduced?0:this.t);if(k==='songtea')this.drawRitual(c,w,h);}","if(this.isTea){if(k!=='songtea'||this.teaStep>0)this.drawTea(c,w,h,reduced?0:this.t);if(k==='songtea')this.hands.draw(this,c,w,h);}\n  if(k==='lotus')this.lotusHands.draw(this,c,w,h);");
 const q=s.indexOf(' drawPoem(c,w,h){'),r=s.indexOf('\n drawTea(c,w,h,t)',q);s=s.slice(0,q)+' drawPoem(c,w,h){drawFanStudio(this,c,w,h);}\n'+s.slice(r);
 s=rep(s,"const song=this.data.kind==='songtea',lift=this.sip||0,diam=Math.min(w,h)*.17*(1+lift*.45),x=w*.58,y=h*(.857-lift*.22),base=song?3:0", "const song=this.data.kind==='songtea',layout=teaLayout(w,h),lift=this.sip||0,diam=song?layout.size:Math.min(w,h)*.17*(1+lift*.45),x=song?layout.bowl.x:w*.58,y=song?layout.bowl.y:h*(.857-lift*.22),base=song?3:0");
 // Song vessels and tools are rendered by the hand controller; don't draw a second floating kettle/whisk.
 s=s.replaceAll("if(this.actionKind==='pour'||this.actionKind==='songpour')", "if(this.actionKind==='pour')");
 s=s.replaceAll("if(this.actionKind==='whisk'||(song&&this.teaStep===2))", "if(!song&&this.actionKind==='whisk')");
 s=rep(s,"kind:this.data?.kind,active:", "kind:this.data?.kind,hands:this.data?.kind==='songtea'?this.hands.snapshot(this):null,lotus:{enabled:this.lotusHands?.enabled,picked:this.lotusHands?.picked},birdFound:this.birdFound,active:");
 s=rep(s,"{chapter:this.river.chapter?.name,stern:","{phase:this.river.phase,landingTime:this.river.landingTime,chapter:this.river.chapter?.name,stern:");
 return s;
});
await edit('src/visit-world.js',s=>{
 s="import {drawDriftingMist} from './scenery-motion.js';\nimport {drawOriole} from './bird-studio.js';\n"+s;
 s=rep(s,"const cam=this.camera(v),p=new Perspective(c,w,h,cam);", "if(['bench','bridge','birds','bell'].includes(k)){const p=new Perspective(c,w,h,this.camera(v));this.details(v,c,w,h,p);return;}\n  const cam=this.camera(v),p=new Perspective(c,w,h,cam);");
 const a=s.indexOf("  if(k==='mist'){"),b=s.indexOf("  if(k==='birds')",a);s=s.slice(0,a)+"  if(k==='mist')drawDriftingMist(c,w,h,t,v.closeLook?v.actionTime:0);\n"+s.slice(b);
 s=rep(s,"this.bird(c,xx,yy,1.3,t);", "drawOriole(c,xx,yy,Math.min(w,h)*.025,t);");
 return s;
});
await edit('src/app.js',s=>{
 s="import {setupDisplayControls} from './display-controls.js';\n"+s;
 s=rep(s,'let tour,postcard,atlas,','let display,tour,postcard,atlas,');
 s=rep(s,"function overview(){selected=-1;", "function overview(){display.overview();selected=-1;");
 s=rep(s,"onPostcard:()=>postcard.open(),", "onPostcard:()=>postcard.open(),onExplore:id=>openVisit(id==='song-tea'?teaVisits.song:visits.find(v=>v.id===id),id==='song-tea'?'song':'modern'),");
 s=rep(s,"$('#retry').onclick=()=>location.reload();init();", "display=setupDisplayControls({toast});document.querySelectorAll('[data-river-scene]').forEach(b=>b.onclick=()=>openVisit(visits.find(v=>v.id===b.dataset.riverScene)));$('#riverPlacesClose').onclick=()=>$('#riverPlaces').hidden=true;\n$('#retry').onclick=()=>location.reload();init();");
 return s;
});
await edit('index.html',s=>{
 s=rep(s,'<link rel="stylesheet" href="/src/styles-v4.css">','<link rel="stylesheet" href="/src/styles-v4.css"><link rel="stylesheet" href="/src/styles-v5.css">');
 s=rep(s,'展卷全景 <span data-icon="expand"></span></button>','画卷全景 ↔</button><button id="modernFullscreen" data-fullscreen>全屏 ⛶</button>');
 s=rep(s,'<button id="enterWuguitan"','<aside class="home-aside"><button id="enterWuguitan"');s=rep(s,'<span>今夕共西湖</span></p>','<span>今夕共西湖</span></p></aside>');
 s=rep(s,'id="fullscreen" title="全屏"','id="fullscreen" data-fullscreen title="设备全屏"');
 s=rep(s,'<button id="visitAtlas"','<button id="visitFullscreen" data-fullscreen>全屏 ⛶</button><button id="visitAtlas"');
 s=rep(s,'<button id="skipCrossing"','<button id="crossFullscreen" data-fullscreen>全屏 ⛶</button><button id="skipCrossing"');
 s=rep(s,'<nav class="visit-weather"','<aside id="riverPlaces" hidden><button id="riverPlacesClose" aria-label="关闭沿岸风物">×</button><small>沿岸风物 · 分线游湖</small><h3>湖西曲水，环湖有续。</h3><p>本段由西里湖入乌龟潭、浴鹄湾。国宾馆湖岸与苏堤属于外侧湖区；柳浪、长桥等可在此转去独立游览。</p><div><button data-river-scene="huagang">花港观鱼 ↗</button><button data-river-scene="sudi">苏堤春晓 ↗</button><button data-river-scene="liulang">柳浪闻莺 ↗</button><button data-river-scene="leifeng">长桥望夕照 ↗</button></div><small>艺术化选景衔接，非同一条实测游船线路。</small></aside><nav class="visit-weather"');
 return s;
});
await edit('src/visit-data.js',s=>s.replace("action:'坐下听莺'","action:'循声 · 寻莺'").replace("route:['山门一侧','庭院树下','静听钟声']","route:[]").replace("action:'俯身细看荷影'","action:'伸手 · 画中采莲'"));
console.log('V5 scene, hand, display and interaction integration applied');
