import {clamp} from './state.js';
const TAU=Math.PI*2;
export function gaitAt(distance,h=120){const stride=h*.3,phase=((distance/(stride*2))%1+1)%1;const foot=p=>p<.5?{x:stride*(.5-2*p),lift:0}:{x:stride*(-.5+2*(p-.5)),lift:Math.sin((p-.5)*TAU)*h*.065};return {left:foot(phase),right:foot((phase+.5)%1),bob:Math.cos(phase*TAU*2)*h*.006,phase};}
function joint(hx,hy,fx,fy,length,turn=-1){const dx=fx-hx,dy=fy-hy,d=Math.min(length*1.99,Math.hypot(dx,dy)),a=Math.atan2(dy,dx),bend=Math.acos(clamp(d/(length*2),-1,1));return [hx+Math.cos(a+turn*bend)*length,hy+Math.sin(a+turn*bend)*length];}
function limb(c,pts,color,width){c.strokeStyle='#49493e';c.lineWidth=width+1.2;c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.strokeStyle=color;c.lineWidth=width;c.stroke();}
export function drawRig(c,img,x,y,h,dir,distance,walking,{main=false,color='#b3a587'}={}){if(!img)return;const w=h*img.width/img.height,g=gaitAt(walking?distance:0,h),bob=walking?g.bob:0;c.save();c.fillStyle='#283b3028';c.beginPath();c.ellipse(x,y+2,w*.34,3,0,0,TAU);c.fill();c.translate(x,y+bob);c.scale(dir,1);
for(const [i,f]of [g.left,g.right].entries()){const hx=(i?1:-1)*h*.035,hy=-h*.29,fx=walking?f.x:(i?1:-1)*h*.045,fy=-f.lift,k=joint(hx,hy,fx,fy,h*.165);limb(c,[[hx,hy],k,[fx,fy-h*.025]],i?color:'#827b68',h*.072);c.fillStyle='#393b35';c.beginPath();c.ellipse(fx+h*.025,fy,h*.058,h*.023,0,0,TAU);c.fill();}
c.drawImage(img,0,0,img.width,img.height*.77,-w/2,-h,w,h*.77);c.restore();if(main){c.strokeStyle='#986047a0';c.lineWidth=1.5;c.beginPath();c.ellipse(x,y+5,16,4,0,0,TAU);c.stroke();}}
export function passengerPose(b){if(b.phase==='sitting')return clamp(b.t/1.1,0,1);if(b.phase==='cruising')return 1;if(b.phase==='standing')return 1-clamp(b.t/1.1,0,1);return 0;}
export function rowingPose(t,rowing=true){
 const p=rowing?t*2.3:0,s=Math.sin(p),co=Math.cos(p),hand={x:.16+s*.11,y:-.56+co*.025},pivot={x:-.18,y:-.17};
 const dx=hand.x-pivot.x,dy=hand.y-pivot.y,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
 return {hand,pivot,blade:{x:pivot.x-ux*.91,y:pivot.y-uy*.91},second:{x:hand.x+ux*.10,y:hand.y+uy*.10},wet:rowing&&co>0};
}
export function drawRower(c,img,x,y,h,t,rowing=true){
 if(!img)return;const w=h*img.width/img.height,r=rowingPose(t,rowing);c.save();c.translate(x,y);
 const pt=p=>[p.x*h,p.y*h],hand=pt(r.hand),second=pt(r.second),blade=pt(r.blade);
 c.strokeStyle='#514a36';c.lineWidth=h*.038;c.lineCap='round';c.beginPath();c.moveTo(...second);c.lineTo(...blade);c.stroke();c.strokeStyle='#b3a07a';c.lineWidth=h*.013;c.stroke();
 c.save();c.translate(...blade);c.rotate(Math.atan2(blade[1]-hand[1],blade[0]-hand[0]));c.fillStyle='#7c6b4b';c.beginPath();c.ellipse(0,0,h*.17,h*.037,0,0,TAU);c.fill();c.restore();
 // Keep the painted face, torso and legs; omit the painted static arms.
 c.save();c.beginPath();const poly=[[0,0],[1,0],[1,.20],[.48,.20],[.42,.40],[.64,.56],[.72,1],[0,1]];poly.forEach(([px,py],i)=>i?c.lineTo((px-.5)*w,(py-1)*h):c.moveTo((px-.5)*w,(py-1)*h));c.closePath();c.clip();c.drawImage(img,-w/2,-h,w,h);c.restore();
 for(const [i,target]of [second,hand].entries()){const shoulder=[(i?-.14:-.03)*w,-h*(i?.76:.78)],elbow=joint(...shoulder,...target,h*.28,1);limb(c,[shoulder,elbow],i?'#747b7c':'#576471',h*.13);limb(c,[elbow,target],i?'#c3ab87':'#b29b78',h*.07);c.fillStyle='#c7ae87';c.beginPath();c.ellipse(target[0],target[1],h*.043,h*.035,0,0,TAU);c.fill();}
 if(r.wet){c.strokeStyle='#dae4c380';c.lineWidth=1;c.beginPath();c.ellipse(blade[0],blade[1]+4,12+(Math.sin(t*2.3)+1)*10,3,0,0,TAU);c.stroke();}
 c.restore();
}

