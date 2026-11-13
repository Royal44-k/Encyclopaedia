import {riverCenter,riverWidth,limit} from './journey-space.js';
export const bankEdge=(z,side)=>riverCenter(z)+side*(riverWidth(z)+Math.sin(z*.69+side)*.27+Math.sin(z*.23+side*2)*.44);
function random(seed){let n=seed>>>0;return()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};}
export function makeHabitat(){const rand=random(47213),trees=[],plants=[],stones=[];
 for(const side of [-1,1])for(let layer=0;layer<3;layer++){let z=-12;while(z<360){z+=3.5+rand()*8+layer*2.5;const x=bankEdge(z,side)+side*(1.1+layer*5+rand()*3.5);trees.push({x,z,height:4.6+rand()*3.5+layer*.6,variant:Math.floor(rand()*4),mirror:rand()>.5,layer});}}
 for(let z=-5;z<360;z+=2.5){for(const side of [-1,1]){const zz=z+rand()*2;plants.push({x:bankEdge(zz,side)+side*(rand()*.7-.1),z:zz,height:.35+rand()*.75,seed:Math.floor(rand()*10),side});if(rand()>.58)stones.push({x:bankEdge(zz,side)+side*.12,z:zz,width:.22+rand()*.5,height:.12+rand()*.2});}}
 return {trees,plants,stones};
}

export class RiverHabitat {
 constructor(){Object.assign(this,makeHabitat());this.tufts=new Map();}
 tuft(seed){if(this.tufts.has(seed))return this.tufts.get(seed);const im=document.createElement('canvas');im.width=220;im.height=180;const c=im.getContext('2d'),rand=random(seed*117+38);for(let j=0;j<65;j++){const x=16+rand()*190,y=155+rand()*20,xx=x+(rand()-.5)*65,yy=25+rand()*118;c.strokeStyle=['#6b855dba','#8f9d62bc','#577450b0','#acaf73a3'][j%4];c.lineWidth=.7+rand()*2;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(xx+15,(y+yy)*.5,xx,yy);c.stroke();if(j%12===0&&seed%3===0){c.fillStyle='#e0dfc4b5';c.beginPath();c.ellipse(xx,yy,3,8,.6,0,Math.PI*2);c.fill();}}this.tufts.set(seed,im);return im;}
 banks(p,z){if(!this.groundPattern){const tile=document.createElement('canvas');tile.width=256;tile.height=256;const a=tile.getContext('2d'),rand=random(819);a.fillStyle='#657c59';a.fillRect(0,0,256,256);for(let i=0;i<1400;i++){a.fillStyle=['#82936a48','#445f4a42','#b4b18522','#3b604b25'][i%4];const x=rand()*256,y=rand()*256;a.fillRect(x,y,1+rand()*4,1+rand()*3);}this.groundPattern=p.c.createPattern(tile,'repeat');}for(let zz=z+170;zz>z-2;zz-=1.6){const next=zz+1.68;for(const side of [-1,1]){const x=bankEdge(zz,side),xn=bankEdge(next,side),rise=.22+Math.sin(zz*.16)**2*.18;
   p.polygon([[x,0,zz],[xn,0,next],[xn+side*2.1,.32,next],[x+side*2.1,rise,zz]],'#6c8061');
   p.polygon([[x+side*2,.31,zz],[xn+side*2,.32,next],[xn+side*55,.7,next],[x+side*55,.7,zz]],this.groundPattern);
   p.polygon([[x-side*.09,-.045,zz],[xn-side*.09,-.045,next],[xn+side*.16,.06,next],[x+side*.16,.06,zz]],'#8b9877');
   // Broken areas of leaf litter and shadow soften the bank without a tiled texture.
   if(Math.sin(zz*.73+side)>.1)p.polygon([[x+side*.4,.09,zz],[xn+side*.8,.14,next],[xn+side*2.9,.34,next],[x+side*3.2,.36,zz]],'#89966e42');
  }}p.flush();}
 objects(p,foliage,z,t,drawBridge,drawYongfu,drawCorridor){const c=p.c,items=[];for(const tree of this.trees)if(tree.z>z-3&&tree.z<z+150)items.push({...tree,type:'tree'});for(const plant of this.plants)if(plant.z>z+.3&&plant.z<z+70)items.push({...plant,type:'plant'});for(const stone of this.stones)if(stone.z>z+.5&&stone.z<z+45)items.push({...stone,type:'stone'});items.push({z:56,type:'bridge'},{z:172,type:'yongfu'},{z:282,type:'corridor'});items.sort((a,b)=>b.z-a.z);
  for(const o of items){if(o.type==='bridge'){drawBridge();continue;}if(o.type==='yongfu'){drawYongfu();continue;}if(o.type==='corridor'){drawCorridor();continue;}const q=p.point([o.x,.15,o.z]);if(!q)continue;
   if(o.type==='tree'){const im=foliage.tree(o.variant),hh=o.height*q.scale,ww=hh*im.width/im.height;if(q.x+ww<0||q.x-ww>p.w||hh>p.h*7)continue;const fade=1-limit((o.z-z-30)/170)*.7;
    // Individual trees overlap at irregular distances; gaps leave sky and water visible.
    c.save();c.globalAlpha=fade;c.translate(q.x,q.y);c.transform(1,0,Math.sin(t*.55+o.z)*.006,1,0,0);if(o.mirror)c.scale(-1,1);c.drawImage(im,-ww/2,-hh,ww,hh);c.restore();
    // Narrow, interrupted reflection, kept on the water side of the shore.
    if(o.layer===0&&q.scale<95){const water=p.point([bankEdge(o.z,o.x>riverCenter(o.z)?1:-1),-.02,o.z]);if(water){c.save();c.globalAlpha=.1;c.translate(water.x,water.y);c.scale(o.mirror?-1:1,-.42);c.drawImage(im,-ww*.4,-hh,ww*.8,hh);c.restore();}}
   }else if(o.type==='plant'){const im=this.tuft(o.seed),wind=Math.sin(t*.75+o.z)*.04;const h=o.height*q.scale,w=h*im.width/im.height;c.save();c.translate(q.x,q.y);c.transform(1,0,wind,1,0,0);c.globalAlpha=.95;c.drawImage(im,-w/2,-h,w,h);c.restore();}
   else{const rw=o.width*q.scale*.62,rh=o.height*q.scale*.78;c.save();c.translate(q.x,q.y);const stone=c.createLinearGradient(-rw,-rh,rw,rh);stone.addColorStop(0,'#b4baa0');stone.addColorStop(.4,'#949f83');stone.addColorStop(1,'#536d57');c.fillStyle=stone;c.beginPath();c.moveTo(-rw,0);c.lineTo(-rw*.72,-rh*.66);c.lineTo(-rw*.27,-rh);c.lineTo(rw*.36,-rh*.87);c.lineTo(rw*.84,-rh*.46);c.lineTo(rw,rh*.16);c.quadraticCurveTo(0,rh*.5,-rw,0);c.fill();c.strokeStyle='#d0d1b24a';c.lineWidth=.7;c.beginPath();c.moveTo(-rw*.65,-rh*.57);c.lineTo(-rw*.2,-rh*.77);c.lineTo(rw*.35,-rh*.68);c.stroke();c.strokeStyle='#31533a4d';c.beginPath();c.moveTo(-rw,1);c.quadraticCurveTo(0,rh*.5,rw,1);c.stroke();c.restore();}
  }
 }
}
