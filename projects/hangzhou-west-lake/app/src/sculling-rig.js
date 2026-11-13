// Registration points in the single 1536 × 1024 hands-and-oar photograph.
// The fingers, wooden shaft and sleeves are never animated as separate layers.
export const SCULLING_ANCHORS=Object.freeze({
 pivot:Object.freeze({x:1470,y:315}),
 left:Object.freeze({x:440,y:530}),
 right:Object.freeze({x:1030,y:410})
});

export function createScullingState(){return {phase:0,speed:0};}

export function advanceSculling(state,dt,moving,reduced=false){
 const step=Math.min(.1,Math.max(0,Number.isFinite(dt)?dt:0));
 if(reduced){state.speed=0;return state;}
 const target=moving?1:0,tau=moving?.42:.56,decay=Math.exp(-step/tau),old=state.speed;
 // Integrate the exponential exactly, so cadence does not depend on frame rate.
 state.phase+=1.62*(target*step+(old-target)*tau*(1-decay));
 state.speed=target+(old-target)*decay;
 if(!moving&&state.speed<.0001)state.speed=0;
 return state;
}

export function scullingPose(state,w,h){
 const scale=w/(w<700&&h>w?850:1320);
 const x=w*.5+(SCULLING_ANCHORS.pivot.x-735)*scale;
 const y=h*.78-(530-SCULLING_ANCHORS.pivot.y)*scale;
 const angle=Math.sin(state.phase)*.065;
 const reach=1+Math.sin(state.phase)*.012,roll=1+Math.sin(state.phase*2)*.008;
 const cos=Math.cos(angle),sin=Math.sin(angle);
 return {x,y,angle,scale,a:cos*scale*reach,b:sin*scale*reach,c:-sin*scale*roll,d:cos*scale*roll};
}

export function scullingPoint(p,source){
 const dx=source.x-SCULLING_ANCHORS.pivot.x,dy=source.y-SCULLING_ANCHORS.pivot.y;
 return {x:p.x+p.a*dx+p.c*dy,y:p.y+p.b*dx+p.d*dy};
}

export function drawSculling(c,image,state,w,h,alpha=1){
 if(!image||alpha<=0)return;
 const p=scullingPose(state,w,h),pivot=SCULLING_ANCHORS.pivot;
 c.save();c.globalAlpha*=alpha;
 c.transform(p.a,p.b,p.c,p.d,p.x,p.y);
 c.drawImage(image,-pivot.x,-pivot.y,1536,1024);
 c.restore();
}
