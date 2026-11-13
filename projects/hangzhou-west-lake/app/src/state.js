export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const memoryIds=['tea','birds','boat','story','song-tea','song-birds','river',...Array.from({length:10},(_,i)=>`scene-${i}`)];
export function restoreCollection(raw){try{const a=JSON.parse(raw);return Array.isArray(a)?[...new Set(a.filter(x=>memoryIds.includes(x)))]:[];}catch{return [];}}
export function createJourney(){return {mode:'modern',x:.23,target:null,direction:1,auto:false,paused:false,time:0,season:'spring',night:false,rain:false,collection:[],activity:null,boat:{phase:'idle',dock:.77,destination:.23,x:.83,t:0},story:{active:false,progress:0,holding:false}};}
export function enterSong(s,x=.48){s.mode='song';s.x=clamp(x,.04,.96);s.target=null;s.auto=false;s.paused=false;s.activity=null;s.boat.phase='idle';}
export function walkTo(s,x){if(s.mode!=='song'||s.boat.phase!=='idle')return false;s.target=clamp(x,.04,.96);s.direction=s.target>=s.x?1:-1;s.activity=null;s.auto=false;return true;}
export function collect(s,id){if(memoryIds.includes(id)&&!s.collection.includes(id)){s.collection.push(id);return true;}return false;}
export function hailBoat(s){if(s.mode!=='song'||s.boat.phase!=='idle')return false;s.boat={phase:'idle',dock:s.x<.5?.23:.77,destination:s.x<.5?.77:.23,x:s.x<.5?.18:.82,t:0};walkTo(s,s.boat.dock);s.boat.phase='approaching';return true;}
export function togglePause(s){s.paused=!s.paused;}
export function returnModern(s){s.mode='modern';s.target=null;s.auto=false;s.activity=null;s.boat.phase='idle';s.story.active=false;s.story.holding=false;s.paused=false;}
export function stepJourney(s,dt){
  if(s.mode!=='song'||s.paused)return;
  dt=clamp(dt,0,.1);s.time+=dt;
  const b=s.boat;
  if(s.story.active){s.story.progress=clamp(s.story.progress+dt*(s.story.holding?.15:-.012),0,1);if(s.story.progress>=1){s.story.active=false;s.story.holding=false;collect(s,'story');}}
  if(s.auto&&b.phase==='idle'&&s.target===null){s.direction=s.x>.95?-1:s.x<.05?1:s.direction;s.target=s.direction>0?.96:.04;}
  if(s.target!==null&&['idle','approaching'].includes(b.phase)){
    const d=s.target-s.x;s.direction=d>=0?1:-1;const dist=dt*.035;
    if(Math.abs(d)<=dist){s.x=s.target;s.target=null;}else s.x+=Math.sign(d)*dist;
  }
  if(b.phase==='approaching'){
    b.x+=(b.dock-b.x)*Math.min(1,dt*1.5);
    if(Math.abs(s.x-b.dock)<.001&&Math.abs(b.x-b.dock)<.003){b.phase='boarding';b.t=0;s.target=null;}
  }else if(b.phase==='boarding'){
    b.t+=dt;if(b.t>=1.8){b.phase='sitting';b.t=0;}
  }else if(b.phase==='sitting'){
    b.t+=dt;if(b.t>=1.1){b.phase='cruising';b.t=0;}
  }else if(b.phase==='cruising'){
    b.t=clamp(b.t+dt/19,0,1);const e=b.t*b.t*(3-2*b.t);b.x=b.dock+(b.destination-b.dock)*e;s.x=b.x;
    if(b.t>=1){b.phase='standing';b.t=0;}
  }else if(b.phase==='standing'){
    b.t+=dt;if(b.t>=1.1){b.phase='landing';b.t=0;}
  }else if(b.phase==='landing'){
    b.t+=dt;if(b.t>=1.8){b.phase='idle';s.x=b.destination;collect(s,'boat');}
  }
}
