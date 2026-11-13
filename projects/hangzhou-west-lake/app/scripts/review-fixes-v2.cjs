const fs=require('fs');let s=fs.readFileSync('src/scene.js','utf8');s=s.replace('drawRig,passengerPose','drawRig,passengerPose,drawRower');
const start=s.indexOf("    const row=['cruising','approaching']"),end=s.indexOf('    c.restore();\n  }\n  docks',start);if(start<0||end<0)throw Error('row block');
s=s.slice(0,start)+"    const row=['cruising','approaching'].includes(b.phase);drawRower(c,this.assets.hero[3],-width*.33,deck,111*ratio,t,row);\n    c.strokeStyle='#748e7448';c.lineWidth=1;for(let i=0;i<4;i++){c.beginPath();c.ellipse(0,8+i*4,width*(.4+i*.03),4+i*2,0,0,Math.PI);c.stroke();}\n"+s.slice(end);fs.writeFileSync('src/scene.js',s);
let a=fs.readFileSync('src/app.js','utf8');a=a.replace('Math.max(.52,Math.min(.9,innerWidth/innerHeight/3))','Math.min(.9,innerWidth/innerHeight/3)');fs.writeFileSync('src/app.js',a);
let w=fs.readFileSync('src/weather.js','utf8');w=w.replace("+(snow?0:t*22))%w", "+(snow?0:t*22))%w");w=w.replace("const k=i+layer*99,x=(seed(k+5)*w+Math.sin(t*.35+k)*(snow?15:2)+w-(snow?0:t*22))%w","const k=i+layer*99,x=((seed(k+5)*w+Math.sin(t*.35+k)*(snow?15:2)+w-(snow?0:t*22))%w+w)%w");fs.writeFileSync('src/weather.js',w);
let v=fs.readFileSync('src/visits.js','utf8');
v=v.replace("$('#visitReset').onclick=()=>{this.progress=0;this.targetPan=0;this.targetPitch=0;this.walking=false;this.updateUI();};","$('#visitReset').onclick=()=>this.open(this.data,this.returnMode);");
v=v.replace("$('#visitWeather').onclick=()=>{this.weather=this.weather==='rain'?'clear':'rain';this.audio.update(true,this.weather==='rain');this.updateUI();};","$('#visitWeather').onclick=async()=>{if(this.loading)return;if(this.weather==='snow'&&!await this.switchImage(this.data.image))return;this.weather=this.weather==='rain'?'clear':'rain';this.audio.update(true,this.weather==='rain');this.updateUI();};");
v=v.replace("loading:this.loading,action:","image:this.img?.src?.split('/').pop(),loading:this.loading,action:");
fs.writeFileSync('src/visits.js',v);

