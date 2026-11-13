import {clamp} from './state.js';
import {drawRig,passengerPose,drawRower} from './rig.js';
import {drawWeather} from './weather.js';
export const W=4800,H=1600;
const TAU=Math.PI*2;
const seed=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
export function groundY(x){const left=.405,right=.545;return H*(x>left&&x<right?.695-.08*Math.sin((x-left)/(right-left)*Math.PI):.695);}
export class LakeScene{
  constructor(canvas,state,assets){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.state=state;this.assets=assets;this.camera=.48;this.targetCamera=.48;this.zoom=.82;this.targetZoom=.82;this.heroDistance=0;this.lastHeroX=state.x;this.follow=true;this.ripples=[];this.hits=[];this.nightMix=0;this.weatherMix=0;this.npcs=Array.from({length:48},(_,i)=>({x:.035+i/48*.93+seed(i+2)*.006,base:.035+i/48*.93,lane:i%4,id:'resident-'+i,sprite:i,distance:0,height:i>=36&&i<40?82+seed(i+51)*10:101+seed(i+51)*22,phase:seed(i+29)*TAU,speed:i%3!==0?.007+seed(i+99)*.006:0,direction:i%2?1:-1}));this.resize();}
  resize(){this.width=innerWidth;this.height=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.7);this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);this.dpr=dpr;this.updateView();}
  updateView(){this.scale=this.height/H*this.zoom;this.visible=this.width/this.scale/W;const edge=this.visible/2;this.camera=clamp(this.camera,Math.min(.5,edge),Math.max(.5,1-edge));this.offsetX=this.width/2-this.camera*W*this.scale;const anchor=this.state.boat.phase==='idle'?.57:.8;this.offsetY=this.height*(1-this.zoom)*anchor;}
  screen(x,y){return {x:this.offsetX+x*W*this.scale,y:this.offsetY+y*this.scale};}
  world(x,y){return {x:(x-this.offsetX)/this.scale/W,y:(y-this.offsetY)/this.scale};}
  pan(dx){this.follow=false;this.targetCamera=this.camera-dx/(W*this.scale);this.camera=this.targetCamera;this.updateView();this.targetCamera=this.camera;}
  focus(x,follow=false){this.follow=follow;this.targetCamera=clamp(x,0,1);}
  toggleZoom(){this.targetZoom=this.targetZoom>1.2?.7:1.65;}
  ripple(x,y){this.ripples.push({x:x*W,y,t:0});}
  get actorY(){const b=this.state.boat;const y=groundY(this.state.x);if(b.phase==='boarding')return y+(H*.78-y)*clamp(b.t/1.8,0,1);if(['sitting','cruising','standing'].includes(b.phase))return H*.79;if(b.phase==='landing')return H*.78+(y-H*.78)*clamp(b.t/1.8,0,1);return y;}
  render(dt,reduced=false){
    const s=this.state,c=this.ctx;const active=!s.paused&&!document.hidden;const t=s.time,ambient=reduced?0:t;this.heroDistance+=Math.abs(s.x-this.lastHeroX)*W;this.lastHeroX=s.x;
    if(this.follow)this.targetCamera=s.x;
    this.camera+=(this.targetCamera-this.camera)*Math.min(1,dt*3.5);this.zoom+=(this.targetZoom-this.zoom)*Math.min(1,dt*6);this.updateView();
    this.nightMix+=(Number(s.night)-this.nightMix)*Math.min(1,dt*1.2);this.weatherMix+=(Number(s.rain)-this.weatherMix)*Math.min(1,dt*1.5);
    c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle='#e8ddc4';c.fillRect(0,0,this.width,this.height);c.save();c.translate(this.offsetX,this.offsetY);c.scale(this.scale,this.scale);
    const art=this.assets[s.season]||this.assets.song;
    c.drawImage(art,0,0,W,H);
    if(!reduced)this.water(c,art,t);
    this.docks(c);this.hits=[];
    for(const n of this.npcs){if(n.speed&&active&&!reduced){n.x+=n.speed*dt*n.direction;n.distance+=n.speed*dt*W;if(n.x>.965||n.x<.035)n.direction*=-1;}const x=n.x*W;if(Math.abs(n.x-this.camera)>this.visible*.55+.06)continue;this.person(c,n.sprite,x,groundY(n.x)+[-12,-3,6,14][n.lane],n.height,n.direction,n.speed&&!reduced?n.distance:0);this.hits.push({x:n.x,y:groundY(n.x),h:n.height,kind:'npc',sprite:n.sprite});}
    const b=s.boat;
    const cruising=['boarding','sitting','cruising','standing','landing'].includes(b.phase);
    if(!cruising)this.person(c,0,s.x*W,this.actorY,135,s.direction,s.target!==null&&!reduced?this.heroDistance:0,true);
    this.bridgeOcclusion(c,art);
    const idleX=.795+Math.sin(ambient*.035)*.008;
    const bx=(b.phase==='idle'&&b.t<1.8?idleX:b.x)*W,by=H*.81+Math.sin(ambient*1.4)*1.3;
    this.occupiedBoat(c,bx,by,520,b,ambient,cruising);this.boatAnchor=this.lastRowerAnchor;
    if(s.story.active||s.riverPending==='story'){const p=s.story.progress;this.occupiedBoat(c,W*(.33+p*.29),H*.8,380,{phase:s.story.holding?'cruising':'idle',destination:1,dock:0},ambient,false);this.storyAnchor=this.lastRowerAnchor;}
    this.details(c,t,reduced);
    this.ripples=this.ripples.filter(r=>r.t<3.5);for(const r of this.ripples){if(active)r.t+=dt;for(let i=0;i<3;i++){const a=r.t-i*.35;if(a<0)continue;c.strokeStyle=`rgba(73,98,87,${Math.max(0,.33-a*.08)})`;c.lineWidth=1.5;c.beginPath();c.ellipse(r.x,r.y,8+a*65,2+a*13,0,0,TAU);c.stroke();}}
    c.restore();
    if(this.nightMix>.001)this.drawNight(c,ambient);
    if(this.weatherMix>.01)drawWeather(c,this.width,this.height,t,s.season==='winter'?'snow':'rain',{reduced,amount:this.weatherMix});
    if(s.season==='autumn')this.drawSeason(c,ambient,reduced);
    if(s.activity==='birds')this.drawBirds(c,ambient,7);
    const grad=c.createLinearGradient(0,this.height*.86,0,this.height);grad.addColorStop(0,'#e8ddc400');grad.addColorStop(1,s.night?'#263d3660':'#e8ddc432');c.fillStyle=grad;c.fillRect(0,this.height*.86,this.width,this.height*.14);
  }
  person(c,index,x,y,h,dir,distance,main=false){drawRig(c,main?this.assets.hero[0]:this.assets.people[index],x,y,h,dir,distance,!!distance,{main});}
  occupiedBoat(c,x,y,width,b,t,occupied){
    const img=this.assets.boat,ratio=width/520,h=width*img.height/img.width*1.25,dir=b.destination<b.dock?-1:1;
    c.save();c.translate(x,y);c.scale(dir,1);
    c.drawImage(img,-width/2,-h*.86,width,h);
    const deck=-h*.2,seatX=width*.025,seatY=deck-5*ratio;
    if(occupied){const sit=passengerPose(b),phase=b.phase;let hx=width*.31*(1-sit)+seatX*sit,hy=seatY,height=(110-40*sit)*ratio;
      if(phase==='boarding'||phase==='landing'){const p=clamp(b.t/1.8,0,1),q=phase==='boarding'?p:1-p;hx=(this.state.x*W-x)*dir+(width*.31-(this.state.x*W-x)*dir)*q;hy=(groundY(this.state.x)-y)*(1-q)+seatY*q;height=110*ratio;}
      if(sit>.12){const pose=sit>.65?this.assets.hero[1]:this.assets.hero[2],ph=height,pw=ph*pose.width/pose.height;c.drawImage(pose,hx-pw/2,hy-ph,pw,ph);}
      else drawRig(c,this.assets.hero[0],hx,hy,height,1,b.t*64,['boarding','landing'].includes(phase),{main:false});
      if(sit>.8)c.drawImage(img,0,0,img.width,img.height*.34,-width/2,-h*.86,width,h*.34);const sy=img.height*.7;c.drawImage(img,0,sy,img.width,img.height-sy,-width/2,-h*.86+h*.7,width,h*.3);
    }
    this.lastRowerAnchor=this.screen((x-dir*width*.33)/W,y+deck-111*ratio);const row=['cruising','approaching'].includes(b.phase);drawRower(c,this.assets.hero[3],-width*.33,deck,111*ratio,t,row);
    c.strokeStyle='#748e7448';c.lineWidth=1;for(let i=0;i<4;i++){c.beginPath();c.ellipse(0,8+i*4,width*(.4+i*.03),4+i*2,0,0,Math.PI);c.stroke();}
    c.restore();
  }
  docks(c){
    c.save();c.lineWidth=1.2;c.strokeStyle='#69695180';
    for(const x of [.23,.77]){const cx=x*W,top=H*.704;
      const art=this.assets[this.state.season]||this.assets.song;
      for(let i=0;i<7;i++){const y=top+i*17,w=65+i*2;c.drawImage(art,art.width*.25,art.height*.713,art.width*.035,art.height*.022,cx-w/2,y,w,17);c.strokeRect(cx-w/2,y,w,17);c.fillStyle='#31432a12';c.fillRect(cx-w/2,y+12,w,5);}
      c.fillStyle='#766c5399';for(const off of [-43,43]){c.fillRect(cx+off,top-13,5,128);c.beginPath();c.moveTo(cx+off+2,top-20);c.lineTo(cx+off+2,top+110);c.stroke();}
    }c.restore();
  }
  bridgeOcclusion(c,art){
    c.save();c.beginPath();const points=[[.405,.681],[.411,.657],[.442,.612],[.455,.593],[.49,.593],[.513,.623],[.541,.663],[.545,.685],[.545,.713],[.405,.713]];points.forEach(([x,y],i)=>i?c.lineTo(x*W,y*H):c.moveTo(x*W,y*H));c.closePath();c.clip();c.drawImage(art,0,0,W,H);c.restore();
  }
  boat(c,x,y,width,dir,t){const img=this.assets.boat;if(!img)return;c.save();c.translate(x,y);c.scale(dir,1);const h=width*img.height/img.width;c.globalAlpha=.15;c.save();c.translate(0,8);c.scale(1,-.25);c.drawImage(img,-width/2,-h*.8,width,h);c.restore();c.globalAlpha=1;c.drawImage(img,-width/2,-h*.86,width,h);c.strokeStyle='#586e5a48';c.lineWidth=1.5;for(let i=0;i<4;i++){c.beginPath();c.ellipse(10,y*0+(i*5)+4,width*(.33+i*.05),4+i*2,0,0,Math.PI);c.stroke();}c.restore();}
  distantBoat(c,x,y,t){c.save();c.globalAlpha=.5;this.boat(c,x*W,y*H,82,1,t);c.restore();}
  water(c,img,t){
    c.save();c.beginPath();c.rect(0,H*.76,W,H*.24);c.clip();c.globalAlpha=.35;
    for(let j=0;j<55;j++){const y=H*.76+j*(H*.24/55),sh=H*.24/55+.7,dx=Math.sin(t*.8+j*.73)*2.2+Math.sin(j*.3+t*.37)*1.8;c.drawImage(img,0,y/H*img.height,img.width,sh/H*img.height,dx,y,W,sh);}
    c.globalAlpha=1;c.lineWidth=.8;
    for(let i=0;i<110;i++){const x=(seed(i+91)*W+t*(3+seed(i)*4))%W,y=H*(.76+seed(i+151)*.23);const a=.08+Math.sin(t*.7+i)*.035;c.strokeStyle=`rgba(247,238,211,${a})`;c.beginPath();c.ellipse(x,y,18+seed(i+4)*80,1.1,0,0,Math.PI);c.stroke();}c.restore();
  }
  details(c,t,reduced){
    // Steam rises from the open tea counter; varying wisps are drawn in world coordinates.
    c.save();c.lineWidth=1.2;for(let i=0;i<4;i++){const ph=reduced?i/4:(t*.14+i*.25)%1;c.globalAlpha=(1-ph)*.3;c.strokeStyle='#f8edcf';c.beginPath();const x=W*.282+i*3,y=H*.634-ph*35;c.moveTo(x,y+18);c.bezierCurveTo(x-7,y+9,x+7,y-6,x-2,y-18);c.stroke();}c.restore();
    if(this.state.activity==='tea'){const p=this.screen(this.state.x,groundY(this.state.x));/* cup is kept near the visitor in the same drawing plane */c.save();c.fillStyle='#c9bda0';c.strokeStyle='#5c6151';const x=this.state.x*W+20,y=groundY(this.state.x)-79;c.beginPath();c.ellipse(x,y,7,3,0,0,TAU);c.fill();c.stroke();c.restore();}
  }
  drawNight(c,t){
    const n=this.nightMix;c.fillStyle=`rgba(17,37,43,${n*.67})`;c.fillRect(0,0,this.width,this.height);
    c.save();c.globalAlpha=n;const moon=this.screen(.68,H*.15);c.shadowColor='#fff2bd';c.shadowBlur=25;c.fillStyle='#e8dcb2';c.beginPath();c.arc(moon.x,moon.y,17*this.scale,0,TAU);c.fill();c.shadowBlur=0;
    for(const [x,y]of [[.17,.59],[.25,.59],[.31,.61],[.57,.59],[.61,.59],[.67,.60],[.72,.56],[.79,.58]]){const p=this.screen(x,H*y);const r=50*this.scale;const glow=c.createRadialGradient(p.x,p.y,1,p.x,p.y,r);glow.addColorStop(0,'#ffca6b88');glow.addColorStop(.3,'#efaa3b32');glow.addColorStop(1,'#efaa3b00');c.fillStyle=glow;c.fillRect(p.x-r,p.y-r,r*2,r*2);c.fillStyle='#f2cc80';c.fillRect(p.x-3*this.scale,p.y-6*this.scale,6*this.scale,11*this.scale);c.strokeStyle='#896d48';c.strokeRect(p.x-3*this.scale,p.y-6*this.scale,6*this.scale,11*this.scale);}
    for(let i=0;i<40;i++){const x=seed(i+250)*this.width,y=seed(i+300)*this.height*.25;c.fillStyle=`rgba(242,231,184,${.2+Math.sin(t*.5+i)*.1})`;c.fillRect(x,y,1,1);}c.restore();
  }
  drawRain(c,t,reduced){const a=this.weatherMix;c.fillStyle=`rgba(50,73,72,${a*.1})`;c.fillRect(0,0,this.width,this.height);c.save();c.strokeStyle=`rgba(214,224,210,${a*.47})`;c.lineWidth=.8;for(let i=0;i<(reduced?35:180);i++){const v=seed(i+331),y=((seed(i+227)*this.height+(reduced?0:t*(330+v*190)))%(this.height+60))-30,x=(seed(i+123)*this.width-y*.16+this.width)%this.width;c.beginPath();c.moveTo(x,y);c.lineTo(x-4-v*3,y+13+v*10);c.stroke();}c.restore();}
  drawSeason(c,t,reduced){const snow=this.state.season==='winter';c.save();for(let i=0;i<(snow?100:28);i++){const speed=snow?25:18,y=(seed(i+73)*this.height+(reduced?0:t*speed))%this.height,x=(seed(i+67)*this.width+Math.sin(t*.25+i)*16)%this.width;c.globalAlpha=snow?.65:.5;c.fillStyle=snow?'#fffae9':'#9e693f';c.beginPath();c.ellipse(x,y,snow?1.5:3.1,snow?1.2:1.1,snow?0:t*.5+i,0,TAU);c.fill();}c.restore();}
  drawBirds(c,t,count){c.save();c.strokeStyle=this.state.night?'#e6d9b8':'#526553';c.lineWidth=1.1;for(let i=0;i<count;i++){const x=this.width*(.3+i*.06)+Math.sin(t*.33+i)*30,y=this.height*.27+Math.sin(t*.4+i)*18;const wing=Math.sin(t*5+i)*4;c.beginPath();c.moveTo(x-6,y-wing);c.quadraticCurveTo(x-3,y-3,x,y);c.quadraticCurveTo(x+3,y-3,x+6,y-wing);c.stroke();}c.restore();}
}
