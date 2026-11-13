// A continuous cloth mesh extends the photographed sleeve. Grip and object
// vertices stay fixed; only cloth beyond the cuff receives displacement.
const meshes=new WeakMap();
const clamp=x=>Math.max(0,Math.min(1,x));
function warp(x,y,w,h,kind){const X=x/w,Y=y/h;let q=0,dx=0,dy=0;
 if(kind==='fan'&&X>.56&&Y>.72){q=(x+y*.7-1560)/220;dx=1600;dy=3000;}
 if(kind==='glass'&&X>.38&&Y>.50){q=(x+y-1445)/340;dx=1500;dy=1400;}
 if(kind==='bowl'&&Y>.44){const left=X<.5,xx=left?x:w-x;q=(y-xx*.835-323)/370;dx=left?-1200:1200;dy=1450;}
 if(kind==='whisk'&&X>.43&&Y>.40){q=(X+Y-1.16)/.48;const gate=clamp((X-.43)/.08);q*=gate*gate*(3-2*gate);dx=w*1.8;dy=h*2.5;}
 if(kind==='pot'&&X<.33&&Y>.53){q=(Y-X*.8-.53)/.37;dx=-w*1.8;dy=h*2.3;}
 if(kind==='grinder'&&Y>.52){const left=X<.5,xx=left?X:1-X;q=(Y-xx*.5-.52)/.38;dx=w*(left?-.7:.7);dy=h*1.5;}
 q=clamp(q);q=q*q*(3-2*q);return {x:x+q*dx,y:y+q*dy};
}
export function drawSleevedSprite(c,im,kind){
 let byKind=meshes.get(im);if(!byKind){byKind=new Map();meshes.set(im,byKind);}let tiles=byKind.get(kind);
 if(!tiles){tiles=[];const nx=16,ny=20;for(let row=0;row<ny;row++)for(let col=0;col<nx;col++){const x=col*im.width/nx,y=row*im.height/ny,w=im.width/nx,h=im.height/ny,src=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],dst=src.map(([a,b])=>warp(a,b,im.width,im.height,kind));tiles.push({x,y,w,h,src,dst,flat:src.every(([a,b],i)=>a===dst[i].x&&b===dst[i].y)});}byKind.set(kind,tiles);}
 c.save();c.beginPath();for(const tile of tiles)if(tile.flat)c.rect(tile.x-.1,tile.y-.1,tile.w+.2,tile.h+.2);c.clip();c.drawImage(im,0,0);c.restore();
 for(const {x,y,w,h,src,dst,flat} of tiles){if(flat)continue;
  for(const ids of [[0,1,3],[1,2,3]]){const [a,b,d]=ids.map(i=>dst[i]),[u,v,z]=ids.map(i=>src[i]),det=(v[0]-u[0])*(z[1]-u[1])-(z[0]-u[0])*(v[1]-u[1]);
   const A=((b.x-a.x)*(z[1]-u[1])-(d.x-a.x)*(v[1]-u[1]))/det,B=((b.y-a.y)*(z[1]-u[1])-(d.y-a.y)*(v[1]-u[1]))/det,C=((d.x-a.x)*(v[0]-u[0])-(b.x-a.x)*(z[0]-u[0]))/det,D=((d.y-a.y)*(v[0]-u[0])-(b.y-a.y)*(z[0]-u[0]))/det;
   c.save();c.beginPath();const cx=(a.x+b.x+d.x)/3,cy=(a.y+b.y+d.y)/3;for(const [i,p]of[a,b,d].entries()){const f=1+.45/Math.max(1,Math.hypot(p.x-cx,p.y-cy)),xx=cx+(p.x-cx)*f,yy=cy+(p.y-cy)*f;i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.closePath();c.clip();c.transform(A,B,C,D,a.x-A*u[0]-C*u[1],a.y-B*u[0]-D*u[1]);c.drawImage(im,0,0);c.restore();
  }
 }
}
