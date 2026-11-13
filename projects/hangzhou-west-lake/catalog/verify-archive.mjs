import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const expectedHash=fs.readFileSync(path.join(root,'catalog/manifest.sha256'),'utf8').trim().split(/\s+/)[0];
if(hash(path.join(root,'catalog/asset-manifest.csv'))!==expectedHash)throw Error('Manifest SHA-256 mismatch');
function fields(line){const cells=[];let cell='',quoted=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(quoted&&line[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){cells.push(cell);cell='';}else cell+=c;}cells.push(cell);return cells;}
const rows=fs.readFileSync(path.join(root,'catalog/asset-manifest.csv'),'utf8').trimEnd().split('\n').slice(1).map(fields);
const expected=new Set(),issues=[];
for(const [category,rel,bytes,sha256]of rows){
  const target=path.resolve(root,rel);
  if(!target.startsWith(root)||rel.includes('..'))throw Error('Unsafe manifest path');
  expected.add(rel);
  if(!fs.existsSync(target))issues.push({rel,error:'missing'});
  else if(fs.statSync(target).size!==Number(bytes)||hash(target)!==sha256)issues.push({rel,error:'content changed'});
}
const ignored=new Set(['catalog/asset-manifest.csv','catalog/manifest.sha256']);
function inspect(dir,prefix=''){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const rel=prefix+e.name;if(['app/dist','app/node_modules','.git'].includes(rel))continue;if(e.isDirectory())inspect(path.join(dir,e.name),rel+'/');else if(!ignored.has(rel)&&!expected.has(rel)&&!rel.endsWith('.log'))issues.push({rel,error:'unindexed file'});}}
inspect(root);
console.log(JSON.stringify({passed:issues.length===0,filesChecked:rows.length,issues},null,2));
if(issues.length)process.exitCode=1;
