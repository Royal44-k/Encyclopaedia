import {drawSleevedSprite} from './sleeve-continuation.js';
import {drawHumanGrip,humanArt} from './human-art.js';
import {limit,smooth} from './journey-space.js';
const TAU=Math.PI*2;
export function teaLayout(w,h){const short=h<520,size=Math.min(w,h)*.2;return {size,bowl:{x:w*.62,y:h*(short?.64:.78)},grind:{x:w*.45,y:h*(short?.57:.69)},pot:{x:w*.35,y:h*(short?.44:.61)}};}

// Jointed first-person forearm and a closed grip. Coordinates are shared with hit testing.
export function grippingHand(c,x,y,size,options={}){drawHumanGrip(c,x,y,size,options);}

export class TeaHands{
 constructor(){this.drag=null;this.roll=0;this.pot=null;this.pulse=0;this.tip={x:0,y:0};this.pouredByHand=false;this.gestures=0;}
 target(v){const l=teaLayout(v.w,v.h);return v.teaStep===0?{x:l.grind.x+this.roll*l.size*.6,y:l.grind.y-l.size*.28,r:l.size*.8}:v.teaStep===1?{...(this.pot||l.pot),r:l.size*.9}:{x:l.bowl.x,y:l.bowl.y-l.size*.47,r:l.size*.8};}
 down(v,x,y){if(v.data.kind!=='songtea'||v.teaStep>2||v.actionKind)return false;const q=this.target(v);if(Math.hypot(x-q.x,y-q.y)>q.r)return false;this.drag={step:v.teaStep,x,y};this.gestures++;return true;}
 move(v,x,y){if(!this.drag)return false;const d=this.drag,dx=x-d.x,dy=y-d.y,l=teaLayout(v.w,v.h);if(d.step!==v.teaStep){this.drag=null;return true;}
  if(d.step===0){this.roll=limit((x-l.grind.x)/l.size,-.75,.75);v.grind=limit(v.grind+Math.min(Math.abs(dx),v.w*.2)/(v.w*1.15));this.pulse=1;if(v.grind>=1){v.teaStep=1;this.drag=null;v.status('茶末已细。抓住左侧汤瓶，移到茶盏上方，稍停即可倾注。');}}
  else if(d.step===1){this.pot={x:limit(x,v.w*.18,v.w*.74),y:limit(y,v.h*.39,v.h*.75)};}
  else{this.tip={x:limit(x-l.bowl.x,-l.size*.22,l.size*.22),y:limit(y-(l.bowl.y-l.size*.47),-l.size*.1,l.size*.1)};v.whisk=limit(v.whisk+Math.min(Math.hypot(dx,dy),v.w*.15)/(Math.min(v.w,v.h)*1.7));this.pulse=1;if(v.whisk>=1){v.teaStep=3;this.drag=null;v.complete();v.status('手起筅落，汤花已成。双手捧盏，举到唇边，慢慢品一口。');}}
  d.x=x;d.y=y;v.updateUI();return true;
 }
 up(){this.drag=null;}
 tick(v,dt){this.pulse=Math.max(0,this.pulse-dt*2.5);if(this.drag?.step===1&&v.teaStep===1&&this.pot){const l=teaLayout(v.w,v.h),dx=this.pot.x-l.bowl.x,dy=this.pot.y-l.bowl.y;this.pouring=dx>-l.size*.85&&dx<l.size*.15&&dy<-l.size*.4&&dy>-l.size*1.7;if(this.pouring){v.waterLevel=limit(v.waterLevel+dt*.48);this.pouredByHand=true;if(v.waterLevel>=1){v.teaStep=2;this.drag=null;this.pouring=false;v.status('汤已入盏。抓住茶筅，来回轻扫，细沫随你的动作生起。');}v.updateUI();}}else this.pouring=false;}
 draw(v,c,w,h){const l=teaLayout(w,h),s=l.size,t=v.reduced.matches?0:v.t;
  if(v.teaStep===0){
   const x=l.grind.x,y=l.grind.y,basin=humanArt('tea-grinder-trough'),grip=humanArt('held-tea-grinder');if(!basin||!grip)return;
   const width=s*2.46,bh=width*basin.height/basin.width,top=y-s*.46,move=this.drag?this.roll:Math.sin(t*7)*this.pulse*.6;
   c.drawImage(basin,x-width/2,top,width,bh);
   // One connected hand/axle/wheel layer moves inside a stationary trough.
   const scale=1-move*.022,gh=width*grip.height/grip.width;
   c.save();c.translate(x,y-s*.90+move*s*.10);c.scale(width*scale/grip.width,gh*scale/grip.height);c.translate(-grip.width/2,0);
   // Exclude the generated soft shadow outside the photographed object edges.
   const cut=new Path2D('M0 705L204 544Q210 488 227 420Q243 353 292 340Q319 327 339 341Q361 327 386 345Q420 336 450 356L489 386L489 467Q507 512 485 547Q438 585 349 593L423 1024L0 1024Z M1536 705L1332 544Q1326 488 1309 420Q1293 353 1244 340Q1217 327 1197 341Q1175 327 1150 345Q1116 336 1086 356L1047 386L1047 467Q1029 512 1051 547Q1098 585 1187 593L1113 1024L1536 1024Z');
   cut.ellipse(774,433,126,416,0,0,TAU);cut.roundRect(104,400,1327,98,45);drawSleevedSprite(c,grip,'grinder');c.restore();
   // Only the trough's central front rim occludes the bottom of the wheel.
   c.save();c.beginPath();c.rect(x-s*.31,top+bh*.63,s*.62,bh*.37);c.clip();c.drawImage(basin,x-width/2,top,width,bh);c.restore();
  }else if(v.teaStep===1||v.actionKind==='songpour'){
   const automatic=v.actionKind==='songpour',pouring=this.pouring||automatic;
   const tilt=pouring?.48*smooth(automatic?limit((v.actionTime-.55)/.55):limit(v.waterLevel/.16)):0;
   let pos=this.pot||l.pot;if(automatic){const q=smooth(Math.min(1,v.actionTime/.9));pos={x:l.pot.x+(l.bowl.x-s*.82-l.pot.x)*q,y:l.pot.y+(l.bowl.y-s*1.03-l.pot.y)*q};}
   const outlet=this.potDrawing(c,pos.x,pos.y,s,tilt,h);
   if(pouring&&outlet&&tilt>.12){
    const end={x:l.bowl.x,y:l.bowl.y-s*.46};c.save();c.lineCap='round';c.strokeStyle='#e9eee0c2';c.lineWidth=2.2;c.beginPath();c.moveTo(outlet.x,outlet.y);c.quadraticCurveTo(outlet.x+(end.x-outlet.x)*.18,end.y-s*.18,end.x,end.y);c.stroke();
    c.strokeStyle='#f6f1cf91';c.lineWidth=.8;c.beginPath();c.ellipse(end.x,end.y,s*(.08+Math.sin(t*7)*.02),s*.025,0,0,TAU);c.stroke();c.restore();
   }
  }else if(v.teaStep===2){
   const whisk=humanArt('held-tea-whisk');if(!whisk)return;
   const x=l.bowl.x+this.tip.x+Math.sin(t*17)*this.pulse*s*.045,y=l.bowl.y-s*.47+this.tip.y,width=s*1.05,hh=width*whisk.height/whisk.width;
   // The whisk and clasping fingers share a single transform around its tip.
   const angle=Math.sin(t*14)*this.pulse*.065,dx=width*(.82-.235),dy=hh*(.65-.955),cuff={x:x+dx*Math.cos(angle)-dy*Math.sin(angle),y:y+dx*Math.sin(angle)+dy*Math.cos(angle)};
   c.save();c.translate(x,y);c.rotate(angle);c.scale(width/whisk.width,hh/whisk.height);c.translate(-whisk.width*.235,-whisk.height*.955);drawSleevedSprite(c,whisk,'whisk');c.restore();
  }
  if(v.teaStep<3&&!this.drag){const target=this.target(v);c.save();c.strokeStyle='#f7edcead';c.lineWidth=1;c.setLineDash([3,6]);c.beginPath();c.ellipse(target.x,target.y,target.r*.65,target.r*.5,0,0,TAU);c.stroke();c.restore();}
 }
 potDrawing(c,x,y,s,tilt,h,sleeve){
  const im=humanArt('held-tea-pot');if(!im)return null;
  const width=s*1.55,hh=width*im.height/im.width,anchor={x:width*.58,y:hh*.55};
  const sx=width*(.08-.58),sy=hh*(.63-.55),cuff={x:x+sx*Math.cos(tilt)-sy*Math.sin(tilt),y:y+sx*Math.sin(tilt)+sy*Math.cos(tilt)};
  c.save();c.translate(x,y);c.rotate(tilt);c.translate(-anchor.x,-anchor.y);c.scale(width/im.width,hh/im.height);drawSleevedSprite(c,im,'pot');c.restore();
  // Calibrated to the actual spout opening, then transformed with the image.
  const dx=width*.947-anchor.x,dy=hh*.105-anchor.y;
  return {x:x+dx*Math.cos(tilt)-dy*Math.sin(tilt),y:y+dx*Math.sin(tilt)+dy*Math.cos(tilt)};
 }
 snapshot(v){return {step:v.teaStep,holding:this.drag?.step??null,pouredByHand:this.pouredByHand,gestures:this.gestures,target:this.target(v)};}
}

export class LotusHands{
 constructor(){this.enabled=false;this.picked=false;this.drag=false;this.pull=0;this.point=null;}
 target(w,h){return {x:w*.60,y:h*.57,r:Math.min(w,h)*.09};}
 down(v,x,y){const p=this.target(v.w,v.h);if(!this.enabled||this.picked||Math.hypot(x-p.x,y-p.y)>p.r)return false;this.drag=true;this.point={x,y};return true;}
 move(v,x,y){if(!this.drag)return false;const p=this.target(v.w,v.h);this.point={x:limit(x,v.w*.3,v.w*.8),y:limit(y,v.h*.43,v.h*.79)};this.pull=limit((y-p.y)/(v.h*.17));if(this.pull>=1){this.picked=true;this.drag=false;v.complete();v.status('掌心留一枝荷香。画中采莲已完成，可题一张画笺。');v.updateUI();}return true;}
 draw(v,c,w,h){if(!this.enabled)return;const home=this.target(w,h),s=Math.min(w,h)*.1,p=this.picked?{x:w*.55,y:h*.68}:this.point||home;
  if(!this.picked){c.strokeStyle='#5b7959';c.lineWidth=2.2;c.beginPath();c.moveTo(home.x+14,h*.87);c.bezierCurveTo(home.x-s*.1,h*.75,p.x+s*.3,p.y+s*.5,p.x,p.y);c.stroke();}else{c.strokeStyle='#66835c';c.lineWidth=3;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+12,p.y+s*1.7);c.stroke();}
  v.world.lotusBloom(c,p.x,p.y,s*.6,v.reduced.matches?0:v.t,.05);grippingHand(c,p.x+4,p.y+s*.7,s*.54,{side:1,angle:.1+this.pull*.15,w,h,loose:!this.drag&&!this.picked});
  if(!this.picked&&!this.drag){c.strokeStyle='#f9ebcaaa';c.lineWidth=1;c.beginPath();c.arc(home.x,home.y,home.r,0,TAU);c.stroke();}
 }
}
