import {readFile,writeFile} from 'node:fs/promises';
let s=await readFile('src/visit-world.js','utf8');
const a=s.indexOf("  if(k==='lotus')for"),b=s.indexOf("  if(k==='moon')",a);if(a<0||b<0)throw Error('lotus anchor');
s=s.slice(0,a)+`  if(k==='lotus'){
   const leaves=[[.64,.66,27],[.29,.79,47],[.52,.85,62],[.78,.81,48],[.9,.93,72]];
   for(let i=0;i<leaves.length;i++){const [px,py,size]=leaves[i],sway=Math.sin(t*(.4+v.wind*.8)+i*1.7)*(2+v.wind*11),x=w*px+sway-v.pan*27,y=h*py+Math.cos(t*.7+i)*(1+v.wind*3),r=size*Math.min(1.3,w/1000+.35)*(1+f*.15);c.save();c.globalAlpha=.78;this.lotusLeaf(c,x,y,r,i,t,v.wind);if(i===0||i===3)this.lotusBloom(c,x+r*.3,y-r*.9,r*.42,t,v.wind);c.restore();}
  }
`+s.slice(b);
const before=' bird(c,x,y,s,t)';const i=s.indexOf(before);if(i<0)throw Error('bird anchor');s=s.slice(0,i)+` lotusLeaf(c,x,y,r,seed,t,wind){
  c.save();c.translate(x,y);c.rotate(Math.sin(t*.55+seed)*.025*(.3+wind));c.strokeStyle='#5f7659b0';c.lineWidth=Math.max(1,r*.025);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-r*.12,r*.6,-r*.08,r*1.1);c.stroke();
  const g=c.createRadialGradient(-r*.3,-r*.12,r*.05,0,0,r);g.addColorStop(0,'#b7c19a');g.addColorStop(.45,'#8fa77e');g.addColorStop(.84,'#5c8167');g.addColorStop(1,'#3e6657');c.fillStyle=g;c.strokeStyle='#c1caa46b';c.lineWidth=.8;c.beginPath();c.moveTo(0,0);for(let a=.17;a<TAU-.17;a+=.04){const rr=r*(1+Math.sin(a*9+seed)*.035+Math.sin(a*17)*.017);c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr*.43);}c.closePath();c.fill();c.stroke();
  for(let a=.25;a<TAU-.2;a+=.38){c.strokeStyle='#d3d9b44d';c.lineWidth=.7;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(Math.cos(a+.08)*r*.5,Math.sin(a+.08)*r*.2,Math.cos(a)*r*.94,Math.sin(a)*r*.4);c.stroke();for(let j=1;j<4;j++){const d=j/4;c.strokeStyle='#ccdab829';c.beginPath();c.moveTo(Math.cos(a)*r*d,Math.sin(a)*r*d*.43);c.lineTo(Math.cos(a+.17)*r*(d+.1),Math.sin(a+.17)*r*(d+.1)*.43);c.stroke();}}
  c.fillStyle='#d5dfc292';c.beginPath();c.ellipse(-r*.25,-r*.12,r*.038,r*.018,0,0,TAU);c.fill();c.restore();
 }
 lotusBloom(c,x,y,r,t,wind){c.save();c.translate(x+Math.sin(t*.6)*wind*3,y);c.strokeStyle='#637a52';c.lineWidth=1.5;c.beginPath();c.moveTo(0,r*.3);c.quadraticCurveTo(r*.12,r*1.8,r*.08,r*3);c.stroke();for(let layer=0;layer<2;layer++)for(let j=-3;j<=3;j++){c.save();c.rotate(j*.26);const g=c.createLinearGradient(0,-r,0,r*.4);g.addColorStop(0,layer?'#c87e86':'#d6a1a2');g.addColorStop(.5,'#e7beb7');g.addColorStop(1,'#eee0c6');c.fillStyle=g;c.strokeStyle='#a46e7333';c.lineWidth=.6;const len=r*(layer?.78:1.15),wide=r*(layer?.24:.32);c.beginPath();c.moveTo(0,r*.3);c.bezierCurveTo(-wide,0,-wide,-len*.55,0,-len);c.bezierCurveTo(wide,-len*.55,wide,0,0,r*.3);c.fill();c.stroke();c.restore();}c.fillStyle='#d3b66b';c.beginPath();c.ellipse(0,r*.2,r*.18,r*.07,0,0,TAU);c.fill();c.restore();}
`+s.slice(i);await writeFile('src/visit-world.js',s);
