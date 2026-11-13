import {limit,smooth,benchPose} from './journey-space.js';
export function imageCamera(v){
 const k=v.data.kind,p=v.progress,walk=['bridge','bench','birds'].includes(k),seat=k==='bench'?v.seatMotion:0;
 return {zoom:1.055+(walk?p*.19:0),driftX:(k==='bridge'?.035:k==='birds'?-.07:.025)*p,driftY:walk?p*.032:0,seat,pan:v.pan,pitch:v.pitch};
}
// Camera movement remains within the painted architecture. No duplicate bridge or road mesh.
export function drawPaintedScene(v,c,w,h){const im=v.img,k=v.data.kind,a=imageCamera(v),walk=['bridge','bench','birds'].includes(k),scale=Math.max(w/im.width,h/im.height)*a.zoom,iw=im.width*scale,ih=im.height*scale;
 const x=limit((w-iw)/2-v.pan*Math.max(32,(iw-w)*.36)-a.driftX*w,w-iw,0),y=limit((h-ih)/2-v.pitch*60-a.driftY*h,h-ih,0);
 if(walk&&a.seat<.45){const bands=52;for(let i=0;i<bands;i++){const yy=i/bands*h,dy=h/bands+1,depth=limit((yy/h-.43)/.57),extra=v.progress*depth*.055,sx=(x-w*.5)*extra+x,sw=iw*(1+extra),sy=(yy-y)/scale,sh=dy/scale;if(sy<0||sy+sh>im.height)continue;c.drawImage(im,0,sy,im.width,sh,sx,yy,sw,dy);}}
 else if(k==='songbirds'&&v.breeze>.01&&!v.reduced.matches){for(let i=0;i<54;i++){const yy=i*h/54,dy=h/54+1,sy=(yy-y)/scale,shift=Math.sin(v.t*1.2+i*.12)*v.breeze*(yy<h*.55?3:1.5);if(sy>=0&&sy+dy/scale<=im.height)c.drawImage(im,0,sy,im.width,dy/scale,x+shift,yy,iw,dy);}}
 else c.drawImage(im,x,y,iw,ih);
 if(k==='bench'&&v.benchLake&&a.seat>.38){const q=smooth((a.seat-.38)/.42),pose=benchPose(a.seat,v.seatStart||0),lake=v.benchLake,sc=Math.max(w/lake.width,h/lake.height)*1.13;c.save();c.globalAlpha=q;c.drawImage(lake,(w-lake.width*sc)/2-v.pan*72-Math.sin(pose.yaw)*w*.035,(h-lake.height*sc)/2+(pose.y-1.02)*55,lake.width*sc,lake.height*sc);c.restore();}
 if(v.prev&&v.fade<1){v.fade=Math.min(1,v.fade+v.frameDt/(v.reduced.matches?.1:1.8));c.save();c.globalAlpha=1-v.fade;c.drawImage(v.prev,x,y,iw,ih);c.restore();if(v.fade>=1)v.prev=null;}
}
export function drawDriftingMist(c,w,h,t,clearing){const fade=1-smooth(clearing/12),alpha=.025+fade*.16;c.save();c.fillStyle=`rgba(231,238,226,${alpha*.19})`;c.fillRect(0,0,w,h);for(let i=0;i<7;i++){const xx=((i*.28+t*.009)%1.65-.3)*w,yy=h*(.12+(i%4)*.22)+Math.sin(t*.075+i)*h*.09;c.save();c.translate(xx,yy);c.scale(1,.32+(i%3)*.1);const r=w*(.38+(i%3)*.1),g=c.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,`rgba(240,244,231,${alpha})`);g.addColorStop(.45,`rgba(237,243,229,${alpha*.52})`);g.addColorStop(1,'rgba(239,243,232,0)');c.fillStyle=g;c.fillRect(-r,-r,r*2,r*2);c.restore();}c.restore();}
