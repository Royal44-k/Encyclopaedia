import {readFile,writeFile} from 'node:fs/promises';
let s=await readFile('src/wuguitan.js','utf8');
let a=s.indexOf('  for(let zz=z+155;'),b=s.indexOf('  // Water reflection bands',a);if(a<0||b<0)throw Error('bank anchor');s=s.slice(0,a)+'  this.habitat.banks(p,z);\n'+s.slice(b);
a=s.indexOf('  for(let zz=Math.ceil(');b=s.indexOf('  const bridgeDistance',a);if(a<0||b<0)throw Error('tree anchor');s=s.slice(0,a)+`  this.habitat.objects(p,this.foliage,z,t,()=>this.bridge(p,55),()=>this.yongfu(p,172),()=>this.corridor(p,245));
  if(v.walking&&v.progress>.3&&v.t-this.lastCall>18){this.lastCall=v.t;v.audio.effect('bird',Math.sin(z)*.65);}
`+s.slice(b);
s=s.replace("'#dce5d7'","'#e3e8d7'").replace("'#bbcdb6'","'#c3d3ba'").replace("'#486f60'","'#617c64'").replace("'#3e6c5a'","'#49765f'");
// Plane seams are softened by low shore vegetation; navigation remains continuous.
await writeFile('src/wuguitan.js',s);
