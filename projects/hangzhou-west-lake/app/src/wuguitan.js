import {drawCorridor,drawPavilion} from './river-architecture.js';
import {boatPose,hullClearance,berth,jetty,RiverFlock} from './river-navigation.js';
import {humanArt} from './human-art.js';
import {createScullingState,advanceSculling,drawSculling} from './sculling-rig.js';
import {landingPose,drawRiverLight,drawWaterBirds,shorelinePavilion} from './river-life.js';
import {Perspective,riverCenter,riverWidth,riverStops,smooth,limit} from './journey-space.js';
import {VisitWorld} from './visit-world.js';
import {RiverHabitat,bankEdge} from './river-habitat.js';
export const riverVisit={id:'wuguitan',name:'乌龟潭',en:'BEYOND THE SCROLL · INTO THE GREEN',image:'shuangfeng',place:'湖西秘境 · 景行桥—乌龟潭—浴鹄湾',season:'当代 · 湖西新绿',kind:'river',action:'停橹 · 细看水鸟',route:['景行桥影','曲水林荫','浴鹄湾'],detail:'乌龟潭位于杨公堤西侧，经景行桥连西里湖，南侧水港通浴鹄湾。永福桥为三孔石梁桥，霁虹廊属于浴鹄湾。本段以真实地貌为依据压缩创作水路意境，非实测导航；由船工操舟，体验摇橹为互动演绎。',source:'https://hznews.hangzhou.com.cn/chengshi/content/2023-02/12/content_8469034.htm',sourceName:'杭州发布 · 西湖管委会资料'};
export class Wuguitan{
 constructor(){this.phase='sailing';this.landingTime=0;this.mooringTime=0;this.flock=new RiverFlock();this.foliage=new VisitWorld();this.habitat=new RiverHabitat();this.rowing=false;this.sculling=createScullingState();this.stern=0;this.lookAt=null;this.lastCall=0;}
 render(v,c,w,h,dt){
  if(v.progress>=.9999&&this.phase==='sailing'){this.phase='moored';v.progress=1;v.destination=1;v.walking=false;this.rowing=false;v.status('已缓缓靠上湖西埠头。点击「起身离船」，扶舷上岸，再回望来时水路。');v.updateUI();}
  if(this.phase==='disembarking'){this.landingTime=Math.min(6.5,this.landingTime+dt);if(this.landingTime>=6.5){this.phase='ashore';v.complete();v.status('双脚落在岸上，回望水路。可留一幅湖山，也可打开沿岸风物继续环湖。');v.updateUI();}}
  const hull=boatPose(v.progress),z=hull.z,heading=hull.yaw,pose=landingPose(this.landingTime),cam={x:hull.x+pose.across,y:pose.eye+smooth(this.landingTime/6.5)*.4,z:z+pose.forward,yaw:heading+v.pan*.95-pose.yaw*1.7,pitch:v.pitch*.55};this.hull=hull;this.clearance=hullClearance(hull);if(this.phase!=='sailing')this.mooringTime+=dt;this.flock.update(dt,hull,v.walking);this.pace=this.flock.pace(hull);
  this.stern+=(Number(this.rowing)-this.stern)*Math.min(1,dt*1.8);cam.y+=this.stern*.48;cam.z-=this.stern*3.5;
  advanceSculling(this.sculling,dt,this.rowing&&v.walking&&this.phase==='sailing',v.reduced.matches);
  const p=new Perspective(c,w,h,cam);this.cam=cam;const t=v.reduced.matches?0:v.t;
  const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#e3e8d7');sky.addColorStop(.45,'#c3d3ba');sky.addColorStop(1,'#617c64');c.fillStyle=sky;c.fillRect(0,0,w,h);
  // Distant hills are deliberately low; no invented vertical karst mountains.
  for(let layer=0;layer<3;layer++){c.fillStyle=['#97b3a3','#789b85','#66896e'][layer];c.beginPath();c.moveTo(0,h*.5);for(let x=0;x<=w+8;x+=8){const xx=x/w*7+heading+v.pan*.25;c.lineTo(x,h*(.43-Math.sin(xx+layer)*.028-Math.sin(xx*2.3+layer)*.018+layer*.018));}c.lineTo(w,h*.56);c.lineTo(0,h*.56);c.fill();}
  const water=c.createLinearGradient(0,h*.49,0,h);water.addColorStop(0,'#9fb4a0');water.addColorStop(.3,'#809d83');water.addColorStop(1,'#49765f');c.fillStyle=water;c.fillRect(0,h*.5,w,h*.5);
  if(v.riverWater){c.save();c.globalAlpha=.43;c.globalCompositeOperation='soft-light';const im=v.riverWater,offset=(z*.013)%1;for(let i=0;i<3;i++){const y=h*.49+(i-offset)*h*.26;c.drawImage(im,im.width*.28,im.height*.53,im.width*.44,im.height*.22,-w*.1-v.pan*w*.05,y,w*1.2,h*.27);}c.restore();}
  drawRiverLight(v,c,p,w,h,z,t);this.habitat.banks(p,z);
  // Water reflection bands occupy world space and flow past the hull.
  for(let i=0;i<180;i++){const zz=z+.5+(i/180)**2*95,cc=riverCenter(zz),r=riverWidth(zz),x=cc+Math.sin(i*4.3)*r*.83;const a=p.point([x,-.02,zz]);if(!a)continue;const len=(.12+Math.sin(i*1.8)**2*.65)*a.scale;c.strokeStyle=i%3?'#c0cfa539':'#274b3d40';c.lineWidth=Math.min(2.5,.05*a.scale);c.beginPath();c.moveTo(a.x-len,a.y+Math.sin(t*1.1+i)*1.3);c.lineTo(a.x+len,a.y+Math.sin(t*1.1+i)*1.3);c.stroke();}
  this.habitat.objects(p,this.foliage,z,t,()=>this.bridge(p,55),()=>this.yongfu(p,172),()=>this.corridor(p,282));
  if(v.walking&&v.progress>.3&&v.t-this.lastCall>18){this.lastCall=v.t;v.audio.effect('bird',Math.sin(z)*.65);}
  const bridgeDistance=Math.abs(z-55),shade=1-smooth(bridgeDistance/5);if(shade>0){c.fillStyle=`rgba(15,24,19,${shade*.46})`;c.fillRect(0,0,w,h);}
  drawWaterBirds(v,c,p,z,t);if(pose.boatAlpha<1){c.save();c.globalAlpha=1-pose.boatAlpha;this.tiedBoat(p);c.restore();}this.dock(p);if(z>180)drawPavilion(p,bankEdge(255,1)+4,255);
  c.save();c.globalAlpha=pose.boatAlpha;this.boat(c,w,h,this.stern);c.restore();
  if(v.closeLook){const g=c.createLinearGradient(0,h*.75,0,h);g.addColorStop(0,'#d9e3cb00');g.addColorStop(1,'#d9e3cb33');c.fillStyle=g;c.fillRect(0,h*.75,w,h*.25);}
  this.chapter=riverStops.filter(s=>v.progress>=s.at-.035).at(-1)||riverStops[0];
 }
 tiedBoat(p){const x=berth.x;const rim=[[x, .28,236.7],[x+.78,.28,238],[x+.78,.28,241],[x,.28,242.6],[x-.78,.28,241],[x-.78,.28,238]];p.polygon(rim,'#a28b64','#4f4b39');for(let i=0;i<6;i++){const a=rim[i],b=rim[(i+1)%6];p.polygon([a,b,[b[0],-.07,b[2]],[a[0],-.07,a[2]]],'#655c43');}for(let i=0;i<18;i++){const a=i/18*Math.PI,b=(i+1)/18*Math.PI,xx=x+Math.cos(a)*.8,xxx=x+Math.cos(b)*.8,y=.35+Math.sin(a)*1.1,yy=.35+Math.sin(b)*1.1;p.polygon([[xx,y,238],[xxx,yy,238],[xxx,yy,240.9],[xx,y,240.9]],i%3?'#5a5d4b':'#7c7e63','#b0ac8560');}p.flush();p.line([[x+.7,.3,239.5],[x+1.2,.37,240]],'#aaa182',1.5);}
 dock(p){if(p.cam.z<150)return;const x=jetty.x;for(let i=0;i<16;i++){const z=jetty.z+i*.7;p.box(x,.29,z,jetty.width,.12,.66,i%3?'#a59978':'#b0a17f');for(let g=0;g<3;g++)p.line([[x+.05,.415,z+.12+g*.16],[x+jetty.width,.415,z+.14+g*.16]],g%2?'#dcc9a443':'#665b4733',.7);}for(const z of [234,238,242,245])p.box(x+.08,-.45,z,.18,1,.18,'#756e53');if(this.phase!=='sailing'){const reach=smooth(this.mooringTime/.8)*1.28;p.box(x-reach,.31,239.2,reach+.4,.12,.9,'#c4b18c');}p.flush();}
 reeds(p,x,z,side){for(let j=0;j<9;j++){const xx=x+Math.sin(j*2)*.5;const a=p.point([xx,0,z+j*.1]),b=p.point([xx+side*.12,.45+(j%3)*.18,z+j*.1]);if(!a||!b)continue;p.c.strokeStyle='#a4af6f';p.c.lineWidth=Math.max(.6,a.scale*.018);p.c.beginPath();p.c.moveTo(a.x,a.y);p.c.quadraticCurveTo(b.x+side*8,b.y,b.x,b.y);p.c.stroke();}}
 bridge(p,z){const cc=riverCenter(z);if(z-p.cam.z<-4||z-p.cam.z>120)return;
  // Jingxing is an arched masonry bridge; Yongfu below is a separate beam bridge.
  for(let i=0;i<28;i++){const a=i/28*Math.PI,b=(i+1)/28*Math.PI;
   const inner=t=>[cc+Math.cos(t)*6.2,.25+Math.sin(t)*3.65],outer=t=>[cc+Math.cos(t)*6.9,.25+Math.sin(t)*4.3];
   const ia=inner(a),ib=inner(b),oa=outer(a),ob=outer(b),color=['#9da48a','#a3ab91','#919d85','#a9af95'][i%4];
   for(const zz of [z,z+3.4])p.polygon([[...ia,zz],[...ib,zz],[...ob,zz],[...oa,zz]],color,'#5d6e535c');
   p.polygon([[...ia,z],[...ib,z],[...ib,z+3.4],[...ia,z+3.4]],'#747f67','#5d6e5350');
   p.polygon([[...oa,z],[...ob,z],[...ob,z+3.4],[...oa,z+3.4]],'#b0b59b','#67745a50');
   if(i%2===0){p.box(oa[0],oa[1],z,.13,.7,.15,'#a7ae94');p.box(oa[0],oa[1],z+3.2,.13,.7,.15,'#a7ae94');}
   p.polygon([[oa[0],oa[1]+.64,z],[ob[0],ob[1]+.64,z],[ob[0],ob[1]+.76,z],[oa[0],oa[1]+.76,z]],'#adb39a');
  }
  for(const side of [-1,1])p.box(cc+side*6.8-(side<0?18:0),-.2,z,18,.65,3.4,'#8a987b');p.flush();
 }
 yongfu(p,z){const cc=riverCenter(z)-riverWidth(z)-4;if(z<p.cam.z-4)return;for(let i=0;i<4;i++)p.box(cc+i*3,-.2,z,.5,2,.7,'#9ba185');p.box(cc,1.7,z,9.5,.32,.9,'#b5b69a');for(let i=0;i<3;i++){p.polygon([[cc+i*3+.4,1.1,z],[cc+i*3+.4,1.7,z],[cc+i*3+1,1.7,z]],'#9ba185');p.polygon([[cc+i*3+3,1.1,z],[cc+i*3+3,1.7,z],[cc+i*3+2.4,1.7,z]],'#9ba185');}p.flush();}
 corridor(p,z){drawCorridor(p,riverCenter(z),z);}
 duck(c,p,x,z,t){const a=p.point([x+Math.sin(t*.3)*.4,.07,z]);if(!a||a.scale>220)return;const s=a.scale*.15;c.save();c.translate(a.x,a.y);c.fillStyle='#5c654b';c.beginPath();c.ellipse(0,0,s*1.5,s*.6,0,0,6.29);c.fill();c.fillStyle='#d0c3a2';c.beginPath();c.arc(s,-s*.6,s*.4,0,6.29);c.fill();c.strokeStyle='#c9d5ac66';c.beginPath();c.ellipse(-s,3,s*3,s*.7,0,0,6.29);c.stroke();c.restore();}
 boat(c,w,h,stern){
  const g=c.createLinearGradient(0,h*.68,0,h);g.addColorStop(0,'#a88b60');g.addColorStop(1,'#594d36');c.fillStyle=g;c.strokeStyle='#554d38';c.lineWidth=2;
  c.beginPath();c.moveTo(w*.5,h*.76);c.bezierCurveTo(w*.36,h*.82,w*.26,h*.94,w*.2,h*1.08);c.lineTo(w*.8,h*1.08);c.bezierCurveTo(w*.74,h*.94,w*.64,h*.82,w*.5,h*.76);c.fill();c.stroke();c.save();c.clip();c.strokeStyle='#d1b5823b';c.lineWidth=.65;for(let i=0;i<85;i++){const xx=w*(.20+i*.007);c.beginPath();c.moveTo(w*.5+(xx-w*.5)*.08,h*.77);c.bezierCurveTo(xx+w*.02,h*.89,xx-w*.01,h*.98,xx,h*1.08);c.stroke();}c.restore();
  for(let j=0;j<6;j++){const y=h*(.79+j*.042),ww=w*(.015+j*.047);c.strokeStyle='#493e2b88';c.beginPath();c.moveTo(w*.5-ww,y);c.lineTo(w*.5+ww,y);c.stroke();}
  c.save();c.globalAlpha*=1-stern;const roof=c.createLinearGradient(0,0,0,h*.2);roof.addColorStop(0,'#4b4934');roof.addColorStop(1,'#898266');c.fillStyle=roof;c.beginPath();c.moveTo(0,0);c.lineTo(w,0);c.lineTo(w,h*.23);c.bezierCurveTo(w*.76,-h*.06,w*.24,-h*.06,0,h*.23);c.closePath();c.fill();c.save();c.clip();c.strokeStyle='#b3a07835';c.lineWidth=.7;for(let line=0;line<90;line++){const yy=line*h*.0035;c.beginPath();c.moveTo(0,yy);c.bezierCurveTo(w*.24,yy-h*.22,w*.76,yy-h*.22,w,yy);c.stroke();}c.strokeStyle='#3b3b2b26';for(let i=0;i<110;i++){c.beginPath();c.moveTo(w*i/110,0);c.lineTo(w*i/110+w*.015,h*.23);c.stroke();}c.restore();c.strokeStyle='#b1a07865';c.lineWidth=2;for(let i=0;i<4;i++){c.beginPath();c.moveTo(0,h*(.06+i*.045));c.bezierCurveTo(w*.25,-h*(.18-i*.04),w*.75,-h*(.18-i*.04),w,h*(.06+i*.045));c.stroke();}const shade=c.createLinearGradient(0,0,0,h*.2);shade.addColorStop(0,'#4c4e3970');shade.addColorStop(1,'#4c4e3900');c.fillStyle=shade;c.fillRect(0,0,w,h*.2);c.restore();
  if(stern>.02)drawSculling(c,humanArt('sculling-hands'),this.sculling,w,h,smooth(stern));
 }
}

