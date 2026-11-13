const fs=require('fs/promises');
const sharp=require('C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{
 const sources=JSON.parse((await fs.readFile('assets/v2/sources.json','utf8')).replace(/^\uFEFF/,''));
 let resident=0;
 for(const [name,file] of Object.entries(sources)){
  if(name.startsWith('residents')||name==='hero-rig'){
   const {width,height}=await sharp(file).metadata(),cols=name==='hero-rig'?2:4,rows=name==='hero-rig'?2:3;
   for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
    const left=Math.floor(col*width/cols),top=Math.floor(row*height/rows),w=Math.floor((col+1)*width/cols)-left,h=Math.floor((row+1)*height/rows)-top;
    const {data,info}=await sharp(file).extract({left,top,width:w,height:h}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let x0=w,y0=h,x1=0,y1=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>85){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
    const out=name==='hero-rig'?'hero-'+(row*cols+col):'resident-'+resident++;
    await sharp(data,{raw:info}).extract({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}).resize({height:600,withoutEnlargement:true}).webp({quality:92,alphaQuality:100}).toFile('assets/v2/'+out+'.webp');
   }
  }else await sharp(file).webp({quality:89}).toFile('assets/v2/'+name+'.webp');
 }
 console.log('Prepared 48 unique residents, 4 hero/boatman poses and 14 scene images.');
})().catch(e=>{console.error(e);process.exitCode=1;});
