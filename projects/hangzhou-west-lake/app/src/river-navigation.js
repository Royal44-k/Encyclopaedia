import {riverCenter,smooth,limit} from './journey-space.js';
import {bankEdge} from './river-habitat.js';
// A berth parallel to the bank, with a hull-wide clearance and a fender gap.
export const berth={z:240,x:Math.min(...Array.from({length:29},(_,i)=>bankEdge(233+i*.4,1)))-2.25,halfLength:3.1,halfWidth:.8};
export const jetty={x:berth.x+1.28,z:234,length:11.2,width:7};
function location(progress){let z=5+limit(progress)*235;if(progress>.82){const q=(progress-.82)/.18;z=197.7+42.3*(q+q*q-q*q*q);}const q=smooth((z-197.7)/42.3),center=riverCenter(z);return {x:center+(berth.x-center)*q,z};}
export function boatPose(progress){const a=location(progress),before=location(Math.max(0,progress-.0001)),after=location(Math.min(1,progress+.0001));const yaw=progress>=1?0:Math.atan2(after.x-before.x,after.z-before.z);return {...a,yaw};}
export function hullClearance(pose){let min=Infinity;for(const along of [-3.1,-1.5,0,1.5,3.1])for(const side of [-.8,.8]){const x=pose.x+Math.sin(pose.yaw)*along+Math.cos(pose.yaw)*side,z=pose.z+Math.cos(pose.yaw)*along-Math.sin(pose.yaw)*side;min=Math.min(min,bankEdge(z,1)-x,x-bankEdge(z,-1));if(z>=jetty.z&&z<=jetty.z+jetty.length)min=Math.min(min,jetty.x-x);}return min;}
export class RiverFlock {
 constructor(){this.birds=[{z:42,x:-1.7,type:0},{z:101,x:2.8,type:0},{z:105,x:1.2,type:0},{z:149,x:-2.1,type:1},{z:151,x:-.8,type:1},{z:217,x:2.3,type:0}].map((b,i)=>({...b,id:i,x:riverCenter(b.z)+b.x,homeZ:b.z,vx:0,vz:0,heading:i%2?.6:2.6,alert:0,side:b.x<0?-1:1}));this.time=0;this.reactions=0;}
 update(dt,boat,moving){this.time+=dt;for(const b of this.birds){const dx=b.x-boat.x,dz=b.z-boat.z,d=Math.hypot(dx,dz),risk=moving&&d<16&&dz>-5?1-smooth((d-5)/11):0;if(risk>.05&&b.alert<=.05)this.reactions++;b.alert+=(risk-b.alert)*Math.min(1,dt*2);const targetX=bankEdge(b.z,b.side)-b.side*1.3,escape=Math.sign(targetX-b.x),speed=.18+b.alert*1.9;let tx=Math.cos(this.time*.09+b.id)*.13,tz=Math.sin(this.time*.07+b.id)*.10;if(b.alert>.04){tx=escape*speed;tz=(dz>=0?.55:-.32)*speed;}const blend=Math.min(1,dt*1.1);b.vx+=(tx-b.vx)*blend;b.vz+=(tz-b.vz)*blend;b.x+=b.vx*dt;b.z+=b.vz*dt;b.x=limit(b.x,bankEdge(b.z,-1)+.9,bankEdge(b.z,1)-.9);const target=Math.atan2(b.vx,b.vz),angle=Math.atan2(Math.sin(target-b.heading),Math.cos(target-b.heading));b.heading+=angle*Math.min(1,dt*2.3);}}
 pace(boat){const near=this.birds.some(b=>Math.abs(b.x-boat.x)<2&&b.z>boat.z&&b.z-boat.z<11);return near?.58:1;}
 snapshot(){return {reactions:this.reactions,birds:this.birds.map(({id,x,z,vx,vz,alert,heading})=>({id,x,z,vx,vz,alert,heading}))};}
}
