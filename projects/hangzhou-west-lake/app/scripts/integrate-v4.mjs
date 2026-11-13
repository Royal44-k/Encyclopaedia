import {readFile,writeFile} from 'node:fs/promises';
async function edit(file,fn){const text=await readFile(file,'utf8');await writeFile(file,fn(text));}
function replace(text,from,to){if(!text.includes(from))throw Error('Missing anchor: '+from.slice(0,80));return text.replace(from,()=>to);}
await edit('src/app.js',s=>{
 s="import {CuratedTour} from './curated-tour.js';\nimport {LakeAtlas} from './lake-atlas.js';\nimport {LakePostcard} from './postcard.js';\n"+s;
 s=replace(s,'let scene,portal,visit,assets={}', 'let tour,postcard,atlas,tourFired=new Set();\nlet scene,portal,visit,assets={}');
 s=replace(s,"visit.open(data,from);$('#visitCanvas')", "const opening=visit.open(data,from);$('#visitCanvas')");
 s=replace(s,"String(visits[i].id===data.id)));}","String(visits[i].id===data.id)));return opening;}");
 s=replace(s,"function setMode(mode){s.mode=mode;", "function setMode(mode){if(mode!=='visit'&&visit){visit.active=false;visit.walking=false;visit.token++;}s.mode=mode;");
 s=replace(s,"setMode('modern');$('#enterCrossing')", "setMode('modern');$('#enterCrossing')");
 s=replace(s,"const all=[...Object.entries(memories),", "const all=[...Object.entries(memories),");
 s=replace(s,"<article class=\"memory-card ${s.collection.includes(id)?'unlocked':''}\">", "<article class=\"memory-card ${s.collection.includes(id)?'unlocked':''}\"><button class=\"memory-revisit\" data-memory-id=\"${id}\" aria-label=\"前往${v.name}\">前往 ↗</button>");
 s=replace(s,"'完成苏堤过舟的画中故事。')", "id==='song-tea'?'到宋韵茶肆完成碾茶、调膏与击拂。':id==='song-birds'?'循声添笔，完成一柄柳阴诗画扇。':id==='river'?'随舟走完湖西水路，望见浴鹄湾。':'完成苏堤过舟的画中故事。')");
 s=replace(s,"${s.collection.length} / 14", "${s.collection.length} / 17");
 s=replace(s,"段湖山记忆 · 自动留存在此浏览器`;", "段湖山记忆 · 自动留存在此浏览器`;\n  $$('#memoryGrid [data-memory-id]').forEach(b=>b.onclick=()=>{const id=b.dataset.memoryId;$('#collectionDialog').close();if(id.startsWith('scene-'))openVisit(visits[+id.slice(6)]);else if(id==='tea')openVisit(teaVisits.modern);else if(id==='birds')openVisit(visits[5]);else if(id==='song-tea')openVisit(teaVisits.song,'song');else if(id==='song-birds')openVisit(songBirdData(),'song');else if(id==='river')openVisit(riverVisit);else{intoSong(false);$('#'+(id==='boat'?'hailBoat':'story')).click();}});");
 s=replace(s,"openVisit({...visits[5],id:'song-birds',kind:'songbirds',image:'song-scene',name:'柳阴题扇',en:'HEAR THE LAKE, PAINT A FAN',action:'收下诗画笺',place:'宋韵西湖 · 临湖柳阴',season:'宋时 · 柳色清风'},'song')", "openVisit(songBirdData(),'song')");
 s=replace(s,"function act(kind){", "function songBirdData(){return {...visits[5],id:'song-birds',kind:'songbirds',image:'song-scene',name:'柳阴题扇',en:'HEAR THE LAKE, PAINT A FAN',action:'收下诗画笺',place:'宋韵西湖 · 临湖柳阴',season:'宋时 · 柳色清风',detail:'以风、莺和橹声为线索，在扇面添上柳枝、飞鸟与小舟。这是一段宋韵题材原创叙事，并非史料记载的同名民俗；也不将南宋御园设为人人可入的公共公园。',source:'https://www.hzarchives.org.cn/info/4724',sourceName:'杭州市档案馆 · 清波门与聚景园'};}\nfunction act(kind){");
 s=replace(s,"if($$('dialog[open]').length)return;", "if($$('dialog[open]').length||tour?.active)return;");
 s=replace(s,"onComplete:data=>{const i=visits.findIndex(v=>v.id===data.id);if(i>=0)collect(s,'scene-'+i);if(data.kind==='tea'||data.kind==='songtea')collect(s,'tea');if(data.kind==='birds'||data.kind==='songbirds')collect(s,'birds');updateMemory();}","onPostcard:()=>postcard.open(),onComplete:data=>{if(tour?.active)return;const before=s.collection.length,i=visits.findIndex(v=>v.id===data.id);if(i>=0)collect(s,'scene-'+i);if(data.kind==='tea')collect(s,'tea');if(data.kind==='songtea')collect(s,'song-tea');if(data.kind==='birds')collect(s,'birds');if(data.kind==='songbirds')collect(s,'song-birds');if(data.kind==='river')collect(s,'river');updateMemory();if(s.collection.length>before)toast('「'+data.name+'」已收入游历手记');}");
 s=replace(s,"function frame(now){const dt=", "function frame(now){let dt=");
 s=replace(s,"if(s.mode==='song'){stepJourney(s,dt);", "tour?.update(dt);if(tour?.active&&(tour.clock.paused||tour.clock.loading))dt=0;if(s.mode==='song'){stepJourney(s,dt);");
 s=replace(s,"mode:s.mode,x:s.x,camera:", "mode:s.mode,tour:tour?.snapshot(),x:s.x,camera:");
 s=replace(s,"$('#retry').onclick=()=>location.reload();init();",`// Exhibition and free exploration share the same running scenes.
postcard=new LakePostcard({toast,source:()=>({image:s.mode==='song'?scene?.canvas:s.mode==='visit'?visit?.canvas:assets.modern,title:s.mode==='visit'?visit.data.name:s.mode==='song'?'宋韵西湖':'杭州西子湖',subtitle:s.mode==='visit'?visit.data.place:s.mode==='song'?'宋时烟火 · 湖山人间':'一湖山水 · 两重人间'})});
atlas=new LakeAtlas({navigate:data=>openVisit(data),collection:()=>s.collection});
tour=new CuratedTour({audio,reduced,onFinish:()=>postcard.open(),release:()=>{if(visit)visit.walking=false;},enter:async chapter=>{tourFired.clear();if(chapter.id==='crossing'){startCrossing();return;}if(chapter.id==='song-tea'){intoSong(false);await openVisit(teaVisits.song,'song');}else await openVisit(chapter.id==='wuguitan'?riverVisit:visits.find(v=>v.id===chapter.id));if(chapter.id==='quyuan')visit.goTo(.5);if(chapter.id==='wuguitan')visit.setWalking(true);},animate:(chapter,t)=>{
 const once=(key,when,fn)=>{if(t>=when&&!tourFired.has(key)){tourFired.add(key);fn();}};
 if(chapter.id==='sudi'){once('sit',1,()=>visit.action());if(t>11)visit.targetPan=Math.sin((t-11)*.25)*.36;}
 if(chapter.id==='quyuan'){visit.wind=.25+.65*(Math.sin(t*.23)*.5+.5);once('rain',5,()=>{visit.weather='rain';audio.update(true,true);visit.updateUI();});once('rest',11,()=>{visit.walking=false;visit.closeLook=true;});}
 if(chapter.id==='song-tea'){for(let i=0;i<4;i++)once('grind'+i,2+i,()=>visit.action());once('pour',7,()=>visit.action());for(let i=0;i<5;i++)once('whisk'+i,11+i,()=>visit.action());}
 if(chapter.id==='wuguitan'){visit.targetPan=Math.sin(t*.12)*.12;once('rest',35,()=>{visit.walking=false;});}
 if(chapter.id==='pinghu'){visit.moon=Math.min(1,t/15);visit.closeLook=true;}
}});
$('#startTour').onclick=()=>tour.open();$$('[data-open-atlas]').forEach(b=>b.onclick=()=>atlas.open(s.mode==='visit'?visit.data.id:'sudi'));$('#visitPostcard').onclick=()=>postcard.open();$('#saveSketch').onclick=()=>{$('#collectionDialog').close();postcard.open();};
$('#visitTrayToggle').onclick=()=>{const open=$('#visit').classList.toggle('tools-open');$('#visitTrayToggle').setAttribute('aria-expanded',String(open));$('#visitTrayToggle').textContent=open?'收起工具 −':'游湖工具 ＋';};
$('#retry').onclick=()=>location.reload();init();`);
 return s;
});
await edit('src/visits.js',s=>{
 s=replace(s,'onComplete,onCross,reduced','onComplete,onCross,onPostcard,reduced');s=replace(s,'onComplete,onCross,reduced','onComplete,onCross,onPostcard,reduced');
 s=replace(s,"$('#visit').classList.remove('quiet');", "$('#visit').classList.remove('quiet','tools-open');$('#visitTrayToggle').setAttribute('aria-expanded','false');$('#visitTrayToggle').textContent='游湖工具 ＋';");
 s=replace(s,"if(!this.active||document.querySelector('dialog[open]'))return;", "if(!this.active||document.querySelector('dialog[open]')||document.body.classList.contains('tour-running'))return;");
 s=replace(s,"if(this.data.kind==='songtea'&&this.teaStep===0)", "if(this.data.kind==='songtea'&&this.teaStep===0)");
 const start=s.indexOf(' postcard(){');const end=s.indexOf('\n render(dt)',start);if(start<0||end<0)throw Error('postcard anchor');s=s.slice(0,start)+" postcard(){this.onPostcard();}\n"+s.slice(end);
 s=replace(s,"if(!this.img)return;", "if(!this.img){c.fillStyle='#4e6858';c.font='18px KaiTi, serif';c.textAlign='center';c.fillText(this.error?'此景暂未展开，点击重新展开': '湖山渐近，稍候片刻…',w*.5,h*.5);c.textAlign='left';return;}");
 s=replace(s,"kind:this.data?.kind,progress:","kind:this.data?.kind,active:this.active,progress:");
 return s;
});
await edit('src/state.js',s=>replace(s,"['tea','birds','boat','story',", "['tea','birds','boat','story','song-tea','song-birds','river',"));
await edit('src/data.js',s=>replace(s,"export const memories={", "export const memories={'song-tea':{name:'宋茶一盏',text:'碾细茶末，注汤调膏，执筅击拂出细密汤花。',seal:'宋'},'song-birds':{name:'柳阴题扇',text:'听风、听莺、听橹，为湖山添一柄诗画扇。',seal:'扇'},river:{name:'舟入青境',text:'经景行桥进入曲水，沿乌龟潭望向浴鹄湾。',seal:'境'},"));
await edit('index.html',s=>{
 s=replace(s,'<button id="modernTea">','<button data-open-atlas>湖山寻路</button><button id="modernTea">');
 s=replace(s,'</button></section>\n    <button id="enterWuguitan"','</button><button id="startTour" class="tour-entry"><span class="tour-entry-line"></span><span>一湖三境<small>六幕导览 · 约两分半</small></span><span>→</span></button></section>\n    <button id="enterWuguitan"');
 s=replace(s,'<div><button id="visitAbout">','<div><button id="visitAtlas" data-open-atlas>寻路</button><button id="visitAbout">');
 s=replace(s,'<nav class="visit-weather"','<button id="visitTrayToggle" class="visit-tray-toggle" aria-expanded="false">游湖工具 ＋</button><nav class="visit-weather"');
 s=replace(s,'<button id="visitTea">','<button id="visitPostcard">题一张画笺 ↗</button><button id="visitTea">');
 s=replace(s,'<span id="memorySummary"></span><button id="saveSketch"','<span id="memorySummary"></span><button id="saveSketch"');
 s=replace(s,'保存此刻画稿','题一张西湖画笺');
 return s;
});
console.log('Integrated V4 tour, atlas, postcard, journal and lifecycle fixes');
