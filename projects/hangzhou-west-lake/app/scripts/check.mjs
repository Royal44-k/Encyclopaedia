import {readdirSync} from 'node:fs';import {spawnSync} from 'node:child_process';
for(const f of readdirSync('src').filter(x=>x.endsWith('.js'))){const r=spawnSync(process.execPath,['--check','src/'+f],{stdio:'inherit'});if(r.status)process.exit(r.status);}
const r=spawnSync(process.execPath,['--test',...readdirSync('tests').filter(x=>x.endsWith('.test.mjs')).map(x=>'tests/'+x)],{stdio:'inherit'});process.exit(r.status);
