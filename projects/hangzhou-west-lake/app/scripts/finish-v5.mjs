import fs from 'node:fs';
function edit(path,fn){fs.writeFileSync(path,fn(fs.readFileSync(path,'utf8')));}
function rep(s,a,b){if(!s.includes(a))throw Error('Missing anchor '+a.slice(0,70));return s.replace(a,()=>b);}
edit('src/soundtrack.js',s=>{
 s=rep(s,'this.gain.connect(a.destination);','this.gain.connect(a.destination);this.fxGain=a.createGain();this.fxGain.gain.value=.72;this.fxAnalyser=a.createAnalyser();this.fxAnalyser.fftSize=256;this.fxGain.connect(this.fxAnalyser);this.fxAnalyser.connect(a.destination);this.effectCount=0;');
 s=rep(s,'this.rainGain.gain.setTargetAtTime(rain?', 'this.fxGain.gain.setTargetAtTime(active?.72:0,this.ctx.currentTime,.08);this.rainGain.gain.setTargetAtTime(rain?');
 s=rep(s,' effect(kind,pan=0){if(!this.ctx||!this.enabled||!this.active)return;const a=this.ctx,t=a.currentTime;'," async playUserEffect(kind,pan=0){this.init();if(!this.ctx)throw Error('Audio unavailable');await this.ctx.resume();this.active=true;this.fxGain.gain.setTargetAtTime(.72,this.ctx.currentTime,.015);this.effect(kind,pan,true);}\n effect(kind,pan=0,force=false){if(!this.ctx||(!this.enabled&&!force)||!this.active)return;const a=this.ctx,t=a.currentTime,bus=force?this.fxGain:this.gain;this.lastEffect=kind;this.effectCount++;");
 const start=s.indexOf(' effect(kind'),end=s.indexOf(' snapshot()',start);let fx=s.slice(start,end).replaceAll('connect(this.gain)','connect(bus)');fx=fx.replace('g.connect(this.reverb);','if(!force)g.connect(this.reverb);');s=s.slice(0,start)+fx+s.slice(end);
 s=rep(s,'snapshot(){return {scene:',"snapshot(){const samples=new Float32Array(256);this.fxAnalyser?.getFloatTimeDomainData(samples);const fxPeak=Math.max(...samples.map(Math.abs));return {effects:this.effectCount||0,lastEffect:this.lastEffect,fxPeak,context:this.ctx?.state,scene:");return s;
});
edit('src/wuguitan.js',s=>{
 s="import {landingPose,drawRiverLight,drawWaterBirds,shorelinePavilion} from './river-life.js';\n"+s;
 s=rep(s,"import {RiverHabitat}","import {RiverHabitat,bankEdge}");
 s=rep(s,'constructor(){this.foliage=',"constructor(){this.phase='sailing';this.landingTime=0;this.foliage=");
 s=rep(s,'  const z=5+v.progress*235,center=riverCenter(z),heading=Math.atan2(riverCenter(z+6)-center,6),cam={x:center,y:1.08,z,yaw:heading+v.pan*.95,pitch:v.pitch*.55};',`  if(v.progress>=.9999&&this.phase==='sailing'){this.phase='moored';v.walking=false;this.rowing=false;v.status('已缓缓靠上湖西埠头。点击「起身离船」，扶舷上岸，再回望来时水路。');v.updateUI();}
  if(this.phase==='disembarking'){this.landingTime=Math.min(6.5,this.landingTime+dt);if(this.landingTime>=6.5){this.phase='ashore';v.complete();v.status('双脚落在岸上，回望水路。可留一幅湖山，也可打开沿岸风物继续环湖。');v.updateUI();}}
  const z=5+v.progress*235,center=riverCenter(z),heading=Math.atan2(riverCenter(z+6)-center,6),dock=smooth((v.progress-.89)/.11),pose=landingPose(this.landingTime),mooringX=bankEdge(240,1)-2.5,cam={x:center+(mooringX-riverCenter(240))*dock+pose.across,y:pose.eye+smooth(this.landingTime/6.5)*.4,z:z+pose.forward,yaw:heading*(1-dock*.7)+v.pan*.95-pose.yaw*1.7,pitch:v.pitch*.55};`);
 s=rep(s,'  this.habitat.banks(p,z);','  drawRiverLight(v,c,p,w,h,z,t);this.habitat.banks(p,z);');
 s=rep(s,'  this.duck(c,p,riverCenter(118)+2,118,t);this.duck(c,p,riverCenter(124)-2,124,t+1.8);\n  this.boat(c,w,h,t,v.walking,this.stern);','  drawWaterBirds(v,c,p,z,t);this.dock(p);if(z>180)shorelinePavilion(p,bankEdge(252,1)+5,252);\n  c.save();c.globalAlpha=pose.boatAlpha;this.boat(c,w,h,t,v.walking,this.stern);c.restore();');
 s=rep(s,' reeds(p,x,z,side){',` dock(p){if(p.cam.z<150)return;const x=bankEdge(240,1);for(let i=0;i<16;i++){const z=234+i*.7;p.box(x-1.7,.29,z,6,.12,.66,i%3?'#a59978':'#b0a17f');}for(const z of [234,238,242,245])p.box(x-1.6,-.45,z,.18,1,.18,'#756e53');p.box(x-3,.31,239,2.8,.12,1.2,'#c4b18c');p.flush();}
 reeds(p,x,z,side){`);
 s=s.replaceAll('c.globalAlpha=1-stern','c.globalAlpha*=1-stern').replaceAll('c.globalAlpha=stern','c.globalAlpha*=stern');return s;
});
edit('src/river-habitat.js',s=>rep(s,'c.translate(q.x,q.y);if(o.mirror)', 'c.translate(q.x,q.y);c.transform(1,0,Math.sin(t*.55+o.z)*.006,1,0,0);if(o.mirror)'));
edit('src/app.js',s=>rep(s,'display=setupDisplayControls({toast});',"$('#visit').append($('#riverPlaces'));display=setupDisplayControls({toast});"));
