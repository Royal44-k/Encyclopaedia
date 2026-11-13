const seed=n=>{const x=Math.sin(n*127.1+39.8)*43857.54;return x-Math.floor(x);};
export function drawWeather(c,w,h,t,type,{sheltered=false,reduced=false,amount=1}={}){
 if(type==='clear'||!amount)return;
 c.save();c.globalAlpha=amount;
 const snow=type==='snow';
 c.fillStyle=snow?'#c5d4df14':'#314c5429';c.fillRect(0,0,w,h);
 if(sheltered){c.beginPath();c.rect(w*.15,h*.04,w*.7,h*.63);c.clip();}
 const fog=c.createLinearGradient(0,h*.25,0,h*.76);fog.addColorStop(0,snow?'#ebf0ec20':'#c1cdd52b');fog.addColorStop(1,'#d8e0dc00');c.fillStyle=fog;c.fillRect(0,0,w,h);
 if(!reduced)for(let layer=0;layer<3;layer++){
  const count=snow?26+layer*12:35+layer*23,speed=snow?12+layer*15:260+layer*170;
  c.lineWidth=.55+layer*.45;c.strokeStyle=`rgba(231,241,235,${.16+layer*.14})`;
  for(let i=0;i<count;i++){const k=i+layer*99,x=((seed(k+5)*w+Math.sin(t*.35+k)*(snow?15:2)+w-(snow?0:t*22))%w+w)%w,y=(seed(k+61)*h+t*speed*(.8+seed(k)) )%(h+40)-20;
   if(snow){c.fillStyle=`rgba(255,255,250,${.35+layer*.2})`;c.beginPath();c.ellipse(x,y,.7+layer*.7,.6+layer*.6,.3,0,Math.PI*2);c.fill();}
   else{c.beginPath();c.moveTo(x,y);c.lineTo(x-2-layer*2,y+7+layer*6);c.stroke();}
  }
 }
 if(!snow&&!reduced){for(let i=0;i<22;i++){const p=(t*.65+seed(i+300))%1,x=seed(i+350)*w,y=h*(.58+seed(i+380)*.37);c.strokeStyle=`rgba(221,237,227,${(1-p)*.24})`;c.lineWidth=.8;c.beginPath();c.ellipse(x,y,2+p*15,.5+p*3,0,0,Math.PI*2);c.stroke();}}
 c.restore();
}
