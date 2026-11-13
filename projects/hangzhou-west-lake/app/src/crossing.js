const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
export const inkStages=[
{end:.08,name:'滴墨',title:'一滴，落入湖山',text:'今朝的湖光，落在一纸江南。'},
{end:.25,name:'晕染',title:'烟水，漫过光阴',text:'墨随水行，千年的边界渐渐洇开。'},
{end:.32,name:'淡化',title:'留白，容下千年',text:'繁华隐去，纸上仍有湖山。'},
{end:.47,name:'描摹',title:'山形，重回纸上',text:'远山与长堤，顺着笔意浮现。'},
{end:.62,name:'勾勒',title:'街巷，渐有轮廓',text:'檐角、柳岸、舟桥，一笔一笔相逢。'},
{end:.78,name:'涂色',title:'淡彩，染上人间',text:'草木青，屋瓦暖，烟火从纸上醒来。'},
{end:.9,name:'聚焦',title:'向着，画里走去',text:'循着一条长堤，听见市井的声音。'},
{end:1,name:'显现',title:'今夕，共此西湖',text:'画卷已开，等你来走。'}];
export const inkStageAt=p=>inkStages.find(v=>p<v.end)||inkStages.at(-1);
export class Crossing{
 constructor(canvas,assets,{onWelcome,onProgress}){Object.assign(this,{canvas,assets,onWelcome,onProgress,progress:0,playing:true,done:false});this.ctx=canvas.getContext('2d',{alpha:false});this.layer=document.createElement('canvas');this.mask=document.createElement('canvas');this.outline=this.makeOutline(assets.song);this.mono=document.createElement('canvas');this.mono.width=1440;this.mono.height=480;const m=this.mono.getContext('2d');m.fillStyle='#f2ecdf';m.fillRect(0,0,1440,480);m.filter='grayscale(1) contrast(.82) brightness(1.2)';m.drawImage(assets.song,0,0,1440,480);this.resize();}
 makeOutline(img){const a=document.createElement('canvas');a.width=1440;a.height=480;const c=a.getContext('2d',{willReadFrequently:true});c.drawImage(img,0,0,a.width,a.height);const d=c.getImageData(0,0,a.width,a.height),o=c.createImageData(a.width,a.height);for(let y=1;y<a.height-1;y++)for(let x=1;x<a.width-1;x++){const i=(y*a.width+x)*4,edge=Math.abs(d.data[i]-d.data[i+4])+Math.abs(d.data[i]-d.data[i+a.width*4]);o.data[i]=32;o.data[i+1]=31;o.data[i+2]=28;o.data[i+3]=Math.min(230,edge*4.2);}c.putImageData(o,0,0);return a;}
 resize(){this.w=innerWidth;this.h=innerHeight;this.dpr=Math.min(devicePixelRatio||1,1.5);this.canvas.width=this.w*this.dpr;this.canvas.height=this.h*this.dpr;this.layer.width=this.mask.width=this.w;this.layer.height=this.mask.height=this.h;}
 seek(p){this.progress=clamp(p);this.done=false;if(p<.99)document.querySelector('#welcome').hidden=true;}
 contour(c,x,y,r,phase=0){c.beginPath();for(let i=0;i<=240;i++){const a=i/240*Math.PI*2,v=1+Math.sin(a*5+phase)*.095+Math.cos(a*9-phase*.5)*.045+Math.sin(a*17+phase)*.019,px=x+Math.cos(a)*r*v,py=y+Math.sin(a)*r*.73*v;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();}
 drop(c,x,y,r,fall){c.save();c.translate(x,y);c.fillStyle='#080808';c.beginPath();c.moveTo(0,-r*(2.4+fall));c.bezierCurveTo(-r*.2,-r*.5,-r*1.15,-r*.05,-r,.55*r);c.bezierCurveTo(-r*.85,r*1.6,r*.85,r*1.6,r,.55*r);c.bezierCurveTo(r*1.15,-r*.05,r*.2,-r*.5,0,-r*(2.4+fall));c.fill();const g=c.createRadialGradient(-r*.3,r*.2,0,-r*.3,r*.2,r*.8);g.addColorStop(0,'#98989870');g.addColorStop(1,'#08080800');c.fillStyle=g;c.beginPath();c.ellipse(-r*.25,r*.3,r*.4,r*.56,-.3,0,Math.PI*2);c.fill();c.restore();}
 render(dt,reduced=false){if(this.playing&&!this.done)this.progress=clamp(this.progress+dt/18);const p=this.progress,c=this.ctx,w=this.w,h=this.h,z=.84+.16*ease((p-.78)/.22),hh=h*z,ww=hh*3,x=(w-ww)/2,y=(h-hh)*.65;
  c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle='#eee6d3';c.fillRect(0,0,w,h);
  c.save();c.globalAlpha=1-ease((p-.18)/.34);c.drawImage(this.assets.modern,x,y,ww,hh);c.restore();
  if(p<.09){const q=p/.09,fall=q*q;c.save();c.fillStyle='rgba(20,17,13,'+(.05+q*.1)+')';c.beginPath();c.ellipse(w*.5,h*.55,38-q*12,10-q*3,0,0,Math.PI*2);c.fill();this.drop(c,w*.5,h*(.18+fall*.37),Math.min(w,h)*.031,q*.45);c.restore();}
  if(p>=.08&&p<.56){const q=clamp((p-.08)/.48),cx=w*.5,cy=h*.55;
   // A dark local ink heart dissolves into thin rings, never a full-screen black fill.
   if(p<.23){const local=clamp((p-.08)/.15),r=Math.min(w,h)*(.028+.055*ease(local));c.save();c.globalAlpha=(1-ease(local))*.65;c.fillStyle='#090909';this.contour(c,cx,cy,r,local);c.fill();c.restore();}
   for(let i=0;i<5;i++){const age=clamp((q-i*.072)/.72);if(age<=0||age>=1)continue;const r=(.035+age*1.05)*Math.hypot(w,h);c.save();c.strokeStyle='rgba(35,39,34,'+((1-age)*.19)+')';c.lineWidth=1.2+(1-age)*1.6;this.contour(c,cx,cy,r,q*.6+i*.09);c.stroke();c.strokeStyle='rgba(255,253,244,'+((1-age)*.5)+')';c.lineWidth=2;this.contour(c,cx,cy,r+4,q*.6+i*.09);c.stroke();c.restore();}
  }
  if(p>.105){const l=this.layer.getContext('2d');l.clearRect(0,0,w,h);l.globalCompositeOperation='source-over';l.drawImage(this.mono,x,y,ww,hh);l.globalCompositeOperation='destination-in';const r=Math.max(1,Math.hypot(w,h)*ease((p-.105)/.36)),g=l.createRadialGradient(w*.5,h*.55,r*.35,w*.5,h*.55,r);g.addColorStop(0,'#000');g.addColorStop(.68,'#000000d0');g.addColorStop(1,'#00000000');l.fillStyle=g;l.fillRect(0,0,w,h);l.globalCompositeOperation='source-over';c.save();c.globalAlpha=ease((p-.105)/.13);c.drawImage(this.layer,0,0);c.restore();}
  if(p>.25&&p<.8){c.save();c.globalAlpha=Math.sin(clamp((p-.25)/.55)*Math.PI)*.29;c.drawImage(this.outline,x,y,ww,hh);c.restore();}
  if(p>.53){const l=this.layer.getContext('2d');l.clearRect(0,0,w,h);l.globalCompositeOperation='source-over';l.drawImage(this.assets.song,x,y,ww,hh);l.globalCompositeOperation='destination-in';const q=ease((p-.53)/.29),r=Math.hypot(w,h)*q;const g=l.createRadialGradient(w*.5,h*.55,Math.max(0,r*.45),w*.5,h*.55,Math.max(1,r));g.addColorStop(0,'#000');g.addColorStop(.7,'#000000e0');g.addColorStop(1,'#00000000');l.fillStyle=g;l.fillRect(0,0,w,h);l.globalCompositeOperation='source-over';c.drawImage(this.layer,0,0);if(p>.8){c.save();c.globalAlpha=ease((p-.8)/.15);c.drawImage(this.assets.song,x,y,ww,hh);c.restore();}}
  const veil=c.createLinearGradient(0,0,0,h*.36);veil.addColorStop(0,'#eee6d3dc');veil.addColorStop(1,'#eee6d300');c.fillStyle=veil;c.fillRect(0,0,w,h*.36);this.onProgress(p,inkStageAt(p));if(p>=1&&!this.done){this.done=true;this.onWelcome();}
 }
}
