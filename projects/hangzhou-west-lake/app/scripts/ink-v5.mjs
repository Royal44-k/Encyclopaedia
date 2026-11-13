import {readFile,writeFile} from 'node:fs/promises';let s=await readFile('src/crossing.js','utf8');
s=s.replace('1-ease((p-.12)/.20)','1-ease((p-.18)/.34)');
const a=s.indexOf('  if(p>=.085&&p<.43)'),b=s.indexOf('  if(p>.53)',a);if(a<0||b<0)throw Error('ink anchor');
s=s.slice(0,a)+`  if(p>=.08&&p<.56){const q=clamp((p-.08)/.48),cx=w*.5,cy=h*.55;
   // A dark local ink heart dissolves into thin rings, never a full-screen black fill.
   if(p<.23){const local=clamp((p-.08)/.15),r=Math.min(w,h)*(.028+.055*ease(local));c.save();c.globalAlpha=(1-ease(local))*.65;c.fillStyle='#090909';this.contour(c,cx,cy,r,local);c.fill();c.restore();}
   for(let i=0;i<5;i++){const age=clamp((q-i*.072)/.72);if(age<=0||age>=1)continue;const r=(.035+age*1.05)*Math.hypot(w,h);c.save();c.strokeStyle='rgba(35,39,34,'+((1-age)*.19)+')';c.lineWidth=1.2+(1-age)*1.6;this.contour(c,cx,cy,r,q*.6+i*.09);c.stroke();c.strokeStyle='rgba(255,253,244,'+((1-age)*.5)+')';c.lineWidth=2;this.contour(c,cx,cy,r+4,q*.6+i*.09);c.stroke();c.restore();}
  }
  if(p>.105){const l=this.layer.getContext('2d');l.clearRect(0,0,w,h);l.globalCompositeOperation='source-over';l.drawImage(this.mono,x,y,ww,hh);l.globalCompositeOperation='destination-in';const r=Math.max(1,Math.hypot(w,h)*ease((p-.105)/.36)),g=l.createRadialGradient(w*.5,h*.55,r*.35,w*.5,h*.55,r);g.addColorStop(0,'#000');g.addColorStop(.68,'#000000d0');g.addColorStop(1,'#00000000');l.fillStyle=g;l.fillRect(0,0,w,h);l.globalCompositeOperation='source-over';c.save();c.globalAlpha=ease((p-.105)/.13);c.drawImage(this.layer,0,0);c.restore();}
  if(p>.25&&p<.8){c.save();c.globalAlpha=Math.sin(clamp((p-.25)/.55)*Math.PI)*.29;c.drawImage(this.outline,x,y,ww,hh);c.restore();}
`+s.slice(b);await writeFile('src/crossing.js',s);
