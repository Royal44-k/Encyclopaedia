import {drawDriftingMist} from './scenery-motion.js';
import {drawOriole} from './bird-studio.js';
import {Perspective,benchPose,smooth,limit,mix} from './journey-space.js';
const TAU=Math.PI*2;
const treeArt=[];let treeReady;
export function loadTrees(){return treeReady??=Promise.all(Array.from({length:4},(_,i)=>new Promise(resolve=>{const im=new Image();im.onload=()=>{treeArt[i]=im;resolve();};im.onerror=()=>resolve();im.src='/assets/v3/tree-'+i+'.webp';})));}

// Canvas-native scenery is rendered in world coordinates, with independent depths.
export class VisitWorld{
 constructor(){this.trees=new Map();this.look=0;this.wind=0;this.found=new Set();}
 tree(seed=0){
  if(treeArt[seed%4])return treeArt[seed%4];
  if(this.trees.has(seed))return this.trees.get(seed);const im=document.createElement('canvas');im.width=280;im.height=430;const c=im.getContext('2d');let n=seed*973+53;const rand=()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};
  c.strokeStyle='#625f3dd9';c.lineCap='round';c.lineWidth=12;c.beginPath();c.moveTo(138,425);c.bezierCurveTo(145,360,123,255,142,115);c.stroke();
  for(let b=0;b<13;b++){const x=25+rand()*230,y=45+rand()*180;c.lineWidth=2+rand()*3;c.strokeStyle='#666b4270';c.beginPath();c.moveTo(139,300);c.quadraticCurveTo(145,y+20,x,y);c.stroke();
   for(let j=0;j<34;j++){const xx=x+(rand()-.5)*100,yy=y+(rand()-.5)*75;c.fillStyle=['#71824f68','#8e9d5a80','#62774c88','#a7ad6a65'][j%4];c.beginPath();c.ellipse(xx,yy,5+rand()*15,3+rand()*8,rand()*3,0,Math.PI*2);c.fill();}
   for(let j=0;j<5;j++){const xx=x+(j-2)*13;c.strokeStyle='#82945d72';c.lineWidth=.9;c.beginPath();c.moveTo(xx,y);c.quadraticCurveTo(xx+22,y+100,xx+10,y+160+rand()*65);c.stroke();for(let k=0;k<12;k++){c.fillStyle='#8394578f';c.beginPath();c.ellipse(xx+Math.sin(k/12*2)*13,y+k*14+20,2,5,.5,0,Math.PI*2);c.fill();}}
  }this.trees.set(seed,im);return im;
 }
 camera(v){
  if(v.data.kind==='bench'&&(v.seatMotion>0||v.seated)){const a=benchPose(v.seatMotion,v.seatStart||0);return {...a,yaw:a.yaw+v.pan*.52,pitch:a.pitch+v.pitch*.3};}
  return {x:v.pan*1.6,y:v.closeLook?mix(1.65,1.15,v.focusBlend||0):1.65,z:v.progress*10,yaw:v.pan*.32,pitch:v.pitch*.65};
 }
 render(v,c,w,h){
  const k=v.data.kind;if(['tea','songtea','songbirds','river'].includes(k))return;
  if(['bench','bridge','birds','bell'].includes(k)){const p=new Perspective(c,w,h,this.camera(v));this.details(v,c,w,h,p);return;}
  const cam=this.camera(v),p=new Perspective(c,w,h,cam);this.cam=cam;const t=v.reduced.matches?0:v.t;
  const ground=k==='bridge'?'#b6b8a0':k==='bell'?'#aaa78d':'#d5ccb1';
  // Ground and the edge of the lake share a horizon and remain stable when sitting.
  if(k==='bench'||k==='bridge'||k==='bell'){
   for(let z=48;z>cam.z+.4;z-=1.25){const y=k==='bridge'?Math.sin(limit(z/25)*Math.PI)*.34:0;
    p.polygon([[-2.5,y,z],[2.5,y,z],[2.5,y,z+1.25],[-2.5,y,z+1.25]],ground,'#736e5330');
    for(const x of [-1.25,0,1.25])p.polygon([[x,y+.002,z],[x+.012,y+.002,z],[x+.012,y+.002,z+1.25],[x,y+.002,z+1.25]],'#8b897b40');
   }
   for(let z=42;z>cam.z+.5;z-=2.5)for(const side of [-1,1]){
    if(k==='bridge'){const yy=Math.sin(limit(z/25)*Math.PI)*.34;p.box(side*2.5-.07,yy,z,.14,.8,.15,'#b4b9a4');p.box(side*2.5-.05,yy+.62,z,.1,.1,2.5,'#bfc3ad');}
    if(k==='bench'){p.box(side*2.6,0,z,.12,.55,.12,'#a7ab8b');p.box(side*2.6,.48,z,.08,.08,2.5,'#b9b99b');}
   }
   if(k==='bench')this.bench(p);
   p.flush();
   if(k==='bench'||k==='birds')for(let z=42;z>cam.z+1.5;z-=6){p.sprite(this.tree(Math.round(z)%5),-3.35,0,z,6);p.sprite(this.tree(Math.round(z+1)%5),3.5,0,z+3,5.8);}
  }else if(k==='tower'&&v.atTop){
   const rail=new Perspective(c,w,h,{x:v.pan*3,y:1.65,z:0,yaw:v.pan*.16,pitch:v.pitch*.4});
   rail.polygon([[-30,0,2],[30,0,2],[30,0,8],[-30,0,8]],'#b4a68d');for(let x=-24;x<24;x+=1.2){rail.box(x,0,5,.12,1.0,.15,'#8e785b');rail.box(x,.85,5,1.2,.12,.16,'#9d8969');}rail.flush();
  }
  this.details(v,c,w,h,p);
  if(k==='birds'){for(let z=42;z>cam.z+2;z-=8)p.sprite(this.tree(Math.round(z)%4),-4,0,z,6);}
  if(k==='towers'){const tp=new Perspective(c,w,h,{x:v.pan*9,y:1.6,z:v.progress*3,yaw:0,pitch:0});for(const [x,z]of [[-6,30],[7,43],[1,62]])this.stoneTower(tp,x,z);tp.flush();}

 }
 stoneTower(p,x,z){const profile=[[.6,0],[.62,.14],[.4,.2],[.34,.42],[.48,.62],[.5,.88],[.35,1.12],[.31,1.2],[.55,1.26],[.28,1.39],[.23,1.48],[.42,1.55],[.22,1.68],[.26,1.76],[.12,1.9],[.03,2.13]];
  for(let i=0;i<profile.length-1;i++)for(let j=0;j<20;j++){const a=j/20*TAU,b=(j+1)/20*TAU,[r,y]=profile[i],[rr,yy]=profile[i+1],n=Math.round(150+Math.cos(a-.8)*24);p.polygon([[x+Math.cos(a)*r,y,z+Math.sin(a)*r],[x+Math.cos(b)*r,y,z+Math.sin(b)*r],[x+Math.cos(b)*rr,yy,z+Math.sin(b)*rr],[x+Math.cos(a)*rr,yy,z+Math.sin(a)*rr]],'rgb('+n+','+(n+5)+','+(n-15)+')');}
  p.flush();for(let j=0;j<3;j++){const a=Math.PI*1.25+j*.7,b=p.point([x+Math.cos(a)*.45,.83,z+Math.sin(a)*.45]);if(!b)continue;p.c.fillStyle='#384d43';p.c.beginPath();p.c.ellipse(b.x,b.y,b.scale*.08,b.scale*.11,0,0,TAU);p.c.fill();}
 }
 bench(p){
  // Facing east, back on the causeway. Camera turns towards the lake before descending.
  for(let i=0;i<4;i++)p.box(2.1+i*.16,.46,7.7,.14,.065,2.1,'#8b7051');
  for(let i=0;i<3;i++)p.box(2.02,.68+i*.16,7.7,.07,.11,2.1,'#917651');
  for(const z of [7.9,9.45]){p.box(2.15,0,z,.12,.5,.12,'#4c5449');p.box(2.57,0,z,.12,.5,.12,'#4c5449');p.box(2.05,.5,z,.08,.68,.08,'#4c5449');}
 }
 details(v,c,w,h,p){const k=v.data.kind,t=v.reduced.matches?0:v.t,f=v.focusBlend||0;
  if(k==='fish'){
   for(let i=0;i<12;i++){const x=w*(.4+Math.sin(t*.13+i*2.3)*.25),y=h*(.68+Math.cos(t*.16+i)*.13),s=(.5+f*.6)*(12+i%4*3);c.save();c.translate(x,y);c.rotate(Math.cos(t*.13+i*2.3)*.65);c.fillStyle=['#bf5e3dbc','#d69e52a0','#e7d7aaa0'][i%3];c.beginPath();c.ellipse(0,0,s,s*.32,0,0,6.29);c.fill();c.beginPath();c.moveTo(-s*.8,0);c.lineTo(-s*1.5,-s*.36*Math.sin(t*5+i));c.lineTo(-s*1.5,s*.36);c.fill();c.fillStyle='#394437';c.beginPath();c.arc(s*.66,-s*.08,1.3,0,6.29);c.fill();c.restore();}
  }
  if(k==='lotus'){
   const leaves=[[.64,.66,27],[.29,.79,47],[.52,.85,62],[.78,.81,48],[.9,.93,72]];
   for(let i=0;i<leaves.length;i++){const [px,py,size]=leaves[i],sway=Math.sin(t*(.4+v.wind*.8)+i*1.7)*(2+v.wind*11),x=w*px+sway-v.pan*27,y=h*py+Math.cos(t*.7+i)*(1+v.wind*3),r=size*Math.min(1.3,w/1000+.35)*(1+f*.15);c.save();c.globalAlpha=.78;this.lotusLeaf(c,x,y,r,i,t,v.wind);if(i===0||i===3)this.lotusBloom(c,x+r*.3,y-r*.9,r*.42,t,v.wind);c.restore();}
  }
  if(k==='moon'){const x=w*(.62-v.pan*.22+v.moon*.12);c.fillStyle='#f5e9bd';c.shadowColor='#fff4ca';c.shadowBlur=22;c.beginPath();c.arc(x,h*(.36-v.moon*.16),16,0,6.29);c.fill();c.shadowBlur=0;for(let i=0;i<48;i++){const yy=h*(.58+i*.006),width=(5+i*.55)*(1+Math.sin(t*.8+i)*.25);c.strokeStyle=`rgba(235,225,176,${.36-i*.005})`;c.beginPath();c.moveTo(x-width+Math.sin(i*3+t)*12,yy);c.lineTo(x+width+Math.sin(i*3+t)*12,yy);c.stroke();}}
  if(k==='mist')drawDriftingMist(c,w,h,t,v.closeLook?v.actionTime:0);
  if(k==='birds'){const xx=w*(.65+Math.sin(t*.12)*.06-v.pan*.22),yy=h*.34;drawOriole(c,xx,yy,Math.min(w,h)*.025,t);if(v.closeLook){c.strokeStyle='#f7efcc88';c.lineWidth=1;c.beginPath();c.arc(xx,yy,25,0,6.29);c.stroke();}}
  if(k==='bell'&&v.actionKind==='bell'){const r=(v.actionTime%2)/2;c.strokeStyle=`rgba(230,223,183,${(1-r)*.35})`;c.beginPath();c.ellipse(w*.58,h*.47,35+r*w*.33,20+r*h*.14,0,0,6.29);c.stroke();}
 }
 lotusLeaf(c,x,y,r,seed,t,wind){
  c.save();c.translate(x,y);c.rotate(Math.sin(t*.55+seed)*.025*(.3+wind));c.strokeStyle='#5f7659b0';c.lineWidth=Math.max(1,r*.025);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-r*.12,r*.6,-r*.08,r*1.1);c.stroke();
  const g=c.createRadialGradient(-r*.3,-r*.12,r*.05,0,0,r);g.addColorStop(0,'#b7c19a');g.addColorStop(.45,'#8fa77e');g.addColorStop(.84,'#5c8167');g.addColorStop(1,'#3e6657');c.fillStyle=g;c.strokeStyle='#c1caa46b';c.lineWidth=.8;c.beginPath();c.moveTo(0,0);for(let a=.17;a<TAU-.17;a+=.04){const rr=r*(1+Math.sin(a*9+seed)*.035+Math.sin(a*17)*.017);c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr*.43);}c.closePath();c.fill();c.stroke();
  for(let a=.25;a<TAU-.2;a+=.38){c.strokeStyle='#d3d9b44d';c.lineWidth=.7;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(Math.cos(a+.08)*r*.5,Math.sin(a+.08)*r*.2,Math.cos(a)*r*.94,Math.sin(a)*r*.4);c.stroke();for(let j=1;j<4;j++){const d=j/4;c.strokeStyle='#ccdab829';c.beginPath();c.moveTo(Math.cos(a)*r*d,Math.sin(a)*r*d*.43);c.lineTo(Math.cos(a+.17)*r*(d+.1),Math.sin(a+.17)*r*(d+.1)*.43);c.stroke();}}
  c.fillStyle='#d5dfc292';c.beginPath();c.ellipse(-r*.25,-r*.12,r*.038,r*.018,0,0,TAU);c.fill();c.restore();
 }
 lotusBloom(c,x,y,r,t,wind){c.save();c.translate(x+Math.sin(t*.6)*wind*3,y);c.strokeStyle='#637a52';c.lineWidth=1.5;c.beginPath();c.moveTo(0,r*.3);c.quadraticCurveTo(r*.12,r*1.8,r*.08,r*3);c.stroke();for(let layer=0;layer<2;layer++)for(let j=-3;j<=3;j++){c.save();c.rotate(j*.26);const g=c.createLinearGradient(0,-r,0,r*.4);g.addColorStop(0,layer?'#c87e86':'#d6a1a2');g.addColorStop(.5,'#e7beb7');g.addColorStop(1,'#eee0c6');c.fillStyle=g;c.strokeStyle='#a46e7333';c.lineWidth=.6;const len=r*(layer?.78:1.15),wide=r*(layer?.24:.32);c.beginPath();c.moveTo(0,r*.3);c.bezierCurveTo(-wide,0,-wide,-len*.55,0,-len);c.bezierCurveTo(wide,-len*.55,wide,0,0,r*.3);c.fill();c.stroke();c.restore();}c.fillStyle='#d3b66b';c.beginPath();c.ellipse(0,r*.2,r*.18,r*.07,0,0,TAU);c.fill();c.restore();}
 bird(c,x,y,s,t){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#aa9739';c.beginPath();c.ellipse(0,0,7,4,-.2,0,6.29);c.fill();c.fillStyle='#585437';c.beginPath();c.moveTo(-3,-2);c.lineTo(-11,-7-Math.sin(t*4)*2);c.lineTo(2,0);c.fill();c.beginPath();c.moveTo(5,-2);c.lineTo(11,-1);c.lineTo(5,1);c.fill();c.restore();}
}

