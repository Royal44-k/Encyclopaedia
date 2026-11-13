import fs from 'node:fs';
const edit=(p,fn)=>fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));
function rep(s,a,b){if(!s.includes(a))throw Error(a.slice(0,80));return s.replace(a,()=>b);}
edit('src/visits.js',s=>{
 s=rep(s,'this.birdFound=false;','this.birdFound=false;this.fanMarks={};');
 s=rep(s,"if(!this.poem.includes(id))this.poem.push(id);","if(!this.poem.includes(id)){this.poem.push(id);this.fanMarks[id]=this.t;}");
 s=rep(s,"k==='songbirds'?'收下诗画笺'","k==='songbirds'?(this.poem.length<3?'听声 · 开始题扇':'收下诗画笺')");
 s=rep(s,"if(this.poem.length<3)this.status('先听风、莺与橹，画扇会添上对应笔墨。');","if(this.poem.length<3){$('#visit').classList.add('tools-open');$('#visitTrayToggle').setAttribute('aria-expanded','true');$('#visitTrayToggle').textContent='收起工具 −';this.status('依次选择听风、听莺、听橹，让三种声音落成扇上笔墨。');}");
 s=rep(s,"data.kind==='river'?'点击启程", "data.kind==='songbirds'?'点击「听声 · 开始题扇」，循着风、莺与橹声，亲手添成一柄绢扇。':data.kind==='bell'?'点击「静听晚钟」，即使配乐关闭也能听见悠长钟声。':data.kind==='river'?'点击启程");
 s=rep(s,"if(e.key==='Escape'){e.preventDefault();this.close();return;}","if(e.key==='Escape'){if(document.fullscreenElement)return;e.preventDefault();this.close();return;}");
 s=rep(s,"$('#visitWalk').hidden=", "$('#visit').classList.toggle('handwork',k==='lotus'&&this.lotusHands.enabled);$('#visitWalk').hidden=");
 s=rep(s,"this.river.phase='disembarking';this.river.landingTime=0;", "this.river.phase='disembarking';this.river.rowing=false;this.river.landingTime=0;");
 return s;
});
edit('src/bird-studio.js',s=>{
 for(const key of ['willow','bird','boat'])s=rep(s,`if(v.poem.includes('${key}')){`,`if(v.poem.includes('${key}')){c.save();c.globalAlpha=Math.min(1,(v.t-(v.fanMarks?.${key}??-10))/1.2);`);
 s=rep(s,"c.restore();}}}\n if(v.poem.includes('bird'))", "c.restore();}}c.restore();}\n if(v.poem.includes('bird'))");
 s=rep(s,"r*.13,0);}","r*.13,0);c.restore();}");
 s=rep(s,"by+r*.12);c.stroke();}","by+r*.12);c.stroke();c.restore();}");
 return s;
});
edit('src/first-person-hands.js',s=>rep(s,"const skin=c.createLinearGradient(x-r,y-r,wx,wy)","const skin=c.createLinearGradient(x+nx*r*.4,y+ny*r*.4,x-nx*r*.4,y-ny*r*.4)"));
