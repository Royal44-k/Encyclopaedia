import {drawSleevedSprite} from './sleeve-continuation.js';
import {teaVesselFrame} from './hand-motion.js';
import {smooth} from './journey-space.js';
const art={};let pending;
const newArt=['held-fan','sculling-hands','tea-bowl','tea-glass','tea-glass-empty','held-tea-pot','held-tea-whisk','tea-grinder-trough','held-tea-grinder','reach-glass','reach-bowl'];
export function loadHumanArt(){if(!pending)pending=Promise.all(['hand-grip','tea-cup-hands','silk-fan','tea-grinder','tea-pot','tea-whisk','longjing-hand',...newArt].map(id=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{art[id]=im;resolve(im);};im.onerror=()=>reject(Error('手作素材未能展开，请重新进入'));im.src='/assets/'+(newArt.includes(id)?'v7/':'v6/')+id+'.webp';}))).catch(e=>{pending=null;throw e;});return pending;}
export const humanArt=id=>art[id];
export function drawHumanGrip(c,x,y,size,{side=1,angle=0}={}){const im=art['hand-grip'];if(!im)return;const scale=size/125;c.save();c.translate(x,y);c.rotate(angle);c.scale(side*scale,scale);const join=Math.round(im.height*.8);c.drawImage(im,0,0,im.width,join,-300,-320,im.width,join);c.drawImage(im,0,join,im.width,im.height-join,-300,join-320,im.width,im.height);c.restore();}

// Reach layers contain only skin and cloth. Once contact is made the complete
// photographed grip is used under the very same transform as the vessel.

function teaHandsImage(c,im,song){drawSleevedSprite(c,im,song?'bowl':'glass');}
function reachHand(c,im,key,dx,dy,opacity){if(!im)return;c.save();c.translate(dx,dy);c.globalAlpha*=opacity;if(key!=='glass'){c.beginPath();c.rect(key==='left'?-10000:724,-10000,10724,30000);c.clip();}teaHandsImage(c,im,key!=='glass');c.restore();}
export function drawTeaVessel(v,c,w,h){
 const song=v.data.kind==='songtea',active=['songsip','drink'].includes(v.actionKind),frame=teaVesselFrame(v.data.kind,w,h,active?v.actionTime:0),{x,y,scale,angle,ax,ay,grip,near}=frame;
 const bare=art[song?'tea-bowl':'tea-glass'],held=art[song?'tea-cup-hands':'longjing-hand'];if(!bare||!held)return;
 c.save();c.fillStyle='#2f291d20';c.globalAlpha=1-near;c.beginPath();c.ellipse(frame.rest.x,frame.rest.y+4,frame.diam*.56,frame.diam*.075,0,0,Math.PI*2);c.fill();c.restore();
 c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);c.translate(-ax,-ay);
 const contact=smooth((grip-.90)/.10),gap=1-grip;
 if(grip>0&&contact<1){const opacity=Math.min(1,grip*4);if(song){reachHand(c,art['reach-bowl'],'left',-gap*640,gap*850,opacity);reachHand(c,art['reach-bowl'],'right',gap*640,gap*850,opacity);}else reachHand(c,art['reach-glass'],'glass',gap*690,gap*890,opacity);}
 c.save();c.globalAlpha=1-contact;
 if(!song&&v.waterLevel<1){c.drawImage(art['tea-glass-empty'],0,0);if(v.waterLevel>0){c.save();c.beginPath();c.rect(0,520-490*v.waterLevel,1448,1086);c.clip();c.drawImage(bare,0,0);c.restore();}}else c.drawImage(bare,0,0);
 if(song&&v.whisk<1){c.globalAlpha=(1-contact)*(1-v.whisk);const g=c.createRadialGradient(680,215,20,724,228,290);g.addColorStop(0,v.waterLevel?'#a5ad7f':'#46402f');g.addColorStop(1,v.waterLevel?'#6c7652':'#201e17');c.fillStyle=g;c.beginPath();c.ellipse(724,232,270,110,0,0,Math.PI*2);c.fill();}
 c.restore();
 if(contact>0){c.save();c.globalAlpha=contact;teaHandsImage(c,held,song);c.restore();}
 c.restore();
 if(v.waterLevel>0&&near<.8){c.save();c.strokeStyle='#fff4e3';c.lineWidth=.8;for(let i=0;i<3;i++){const a=(v.t*.2+i/3)%1;c.globalAlpha=(1-a)*.25;const yy=y-frame.diam*(.9+a*.55);c.beginPath();c.moveTo(x+(i-1)*frame.diam*.13,yy);c.bezierCurveTo(x-12,yy-15,x+14,yy-30,x,yy-45);c.stroke();}c.restore();}

 if(!song&&v.actionKind==='pour'){
  const q=smooth(Math.min(v.actionTime/.6,(2.6-v.actionTime)/.6)),px=x-frame.diam*1.1-(1-q)*w*.8,py=y-frame.diam*1.3+(1-q)*h*.5,im=art['held-tea-pot'],width=frame.diam*1.55,hh=width*im.height/im.width,tilt=q*.48;
  c.save();c.translate(px,py);c.rotate(tilt);c.translate(-width*.58,-hh*.55);c.scale(width/im.width,hh/im.height);drawSleevedSprite(c,im,'pot');c.restore();
  if(q>.8){const dx=width*(.947-.58),dy=hh*(.105-.55),ox=px+dx*Math.cos(tilt)-dy*Math.sin(tilt),oy=py+dx*Math.sin(tilt)+dy*Math.cos(tilt);c.strokeStyle='#dce9d2c2';c.lineWidth=2;c.beginPath();c.moveTo(ox,oy);c.quadraticCurveTo(ox,y-frame.diam*.7,x,y-frame.diam*.5);c.stroke();}
 }
 v.teaGripFrame={...frame,contact,asset:song?'tea-bowl':'tea-glass'};
}
export const drawHeldTea=drawTeaVessel;
export const drawLongjingSip=drawTeaVessel;
