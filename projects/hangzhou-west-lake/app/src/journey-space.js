export const limit=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
export const smooth=n=>{n=limit(n);return n*n*(3-2*n);};
export const mix=(a,b,t)=>a+(b-a)*t;

// Camera poses in metres. An uninterrupted path, not an image replacement.
const seatKeys=[
 [0,0,1.65,0,0,0,'走向长椅'],
 [.38,1.9,1.65,8.2,0,-.06,'走到椅旁'],
 [.54,2.15,1.62,8.6,.18,.50,'俯看椅面'],
 [.70,2.4,1.62,8.65,1.06,.05,'转身望湖'],
 [.88,2.4,1.02,8.65,1.30,.04,'缓缓坐下'],
 [1,2.4,1.02,8.65,1.30,0,'倚椅观湖']
];
export function benchPose(t,start=0){
 t=limit(t);let j=seatKeys.findIndex(v=>v[0]>=t);j=Math.max(1,j);const a=seatKeys[j-1],b=seatKeys[j],q=smooth((t-a[0])/(b[0]-a[0]));
 return {x:mix(a[1],b[1],q),y:mix(a[2],b[2],q),z:mix(a[3],b[3],q)+(1-smooth(t/.38))*start,yaw:mix(a[4],b[4],q),pitch:mix(a[5],b[5],q),phase:b[6]};
}
export function projectPoint(p,cam,w,h){
 const dx=p[0]-cam.x,dz=p[2]-cam.z,cos=Math.cos(cam.yaw||0),sin=Math.sin(cam.yaw||0),xx=dx*cos-dz*sin,zz=dx*sin+dz*cos;
 const dy=p[1]-cam.y,pi=cam.pitch||0,yy=dy*Math.cos(pi)+zz*Math.sin(pi),depth=zz*Math.cos(pi)-dy*Math.sin(pi);
 if(depth<.15)return null;const focal=Math.min(w*.8,h*1.05);return {x:w*.5+xx*focal/depth,y:h*.49-yy*focal/depth,scale:focal/depth,depth};
}
export function clipNear(points,near=.15){const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],insideA=a[2]>=near,insideB=b[2]>=near;if(insideA)out.push(a);if(insideA!==insideB){const q=(near-a[2])/(b[2]-a[2]);out.push([mix(a[0],b[0],q),mix(a[1],b[1],q),near]);}}return out;}
export class Perspective{
 constructor(c,w,h,cam){Object.assign(this,{c,w,h,cam});this.faces=[];}
 point(p){return projectPoint(p,this.cam,this.w,this.h);}
 polygon(points,fill,stroke){const cam=this.cam,cos=Math.cos(cam.yaw||0),sin=Math.sin(cam.yaw||0),cp=Math.cos(cam.pitch||0),sp=Math.sin(cam.pitch||0),f=Math.min(this.w*.8,this.h*1.05);const clipped=clipNear(points.map(p=>{const dx=p[0]-cam.x,dz=p[2]-cam.z,dy=p[1]-cam.y,zz=dx*sin+dz*cos;return [dx*cos-dz*sin,dy*cp+zz*sp,zz*cp-dy*sp];}));if(clipped.length<3)return;const ps=clipped.map(p=>({x:this.w*.5+p[0]*f/p[2],y:this.h*.49-p[1]*f/p[2],depth:p[2]}));this.faces.push({ps,fill,stroke,depth:ps.reduce((s,p)=>s+p.depth,0)/ps.length});}
 box(x,y,z,w,h,d,color='#a39877'){
 const a=[x,y,z],b=[x+w,y,z],e=[x,y+h,z],f=[x+w,y+h,z],g=[x+w,y+h,z+d],k=[x,y+h,z+d];
 this.polygon([a,b,f,e],color,'#3b44322b');this.polygon([b,[x+w,y,z+d],g,f],color,'#3b44322b');this.polygon([e,f,g,k],color,'#eadbc450');this.polygon([a,[x,y,z+d],k,e],color,'#3b44322b');this.polygon([[x,y,z+d],[x+w,y,z+d],g,k],color,'#3b44322b');
  this.polygon([a,b,[x+w,y,z+d],[x,y,z+d]],color,'#3b44322b');
 }
 flush(){const c=this.c;this.faces.sort((a,b)=>b.depth-a.depth);for(const f of this.faces){c.beginPath();f.ps.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=f.fill;c.fill();if(f.stroke){c.strokeStyle=f.stroke;c.lineWidth=.6;c.stroke();}}this.faces=[];}
 line(points,color,width=1){const ps=points.map(p=>this.point(p));if(ps.some(p=>!p))return;const c=this.c;c.beginPath();ps.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
 sprite(im,x,y,z,height,alpha=1){const p=this.point([x,y,z]);if(!p)return;const hh=height*p.scale,ww=hh*im.width/im.height;if(p.x+ww<0||p.x-ww>this.w||hh>this.h*8)return;this.c.save();this.c.globalAlpha=alpha;this.c.drawImage(im,p.x-ww/2,p.y-hh,ww,hh);this.c.restore();}
}

export const riverCenter=z=>Math.sin(z*.038)*9+Math.sin(z*.014)*13;
export const riverWidth=z=>5.2+smooth((z-72)/20)*9-smooth((z-133)/20)*7+smooth((z-195)/30)*11;
export const riverStops=[{at:0,name:'西里湖 · 启程'},{at:.19,name:'景行桥 · 桥影见绿'},{at:.43,name:'乌龟潭 · 曲水深处'},{at:.66,name:'永福桥 · 三孔石梁'},{at:1,name:'浴鹄湾 · 霁虹入画'}];
