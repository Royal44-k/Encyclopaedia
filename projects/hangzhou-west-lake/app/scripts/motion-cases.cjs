const {webkit}=require('C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');const fs=require('fs');
const publicChunks=['https://motionsites.ai/assets/prompts-CNnWOeD8.js'];
(async()=>{const b=await webkit.launch({headless:true});try{const p=await b.newPage();await p.goto('https://motionsites.ai',{waitUntil:'domcontentloaded',timeout:60000});const paths=await p.locator('script[src]').evaluateAll(s=>s.map(x=>x.src).filter(x=>x.includes('/assets/')));for(const url of publicChunks){const r=await p.request.get(url);const txt=await r.text();fs.writeFileSync('reference-review/v3/motion-public-bundle.js',txt);const hits=[...txt.matchAll(/.{0,90}(?:heritage|Heritage|ink-|fluid|Fluid|liquid|Liquid).{0,180}/g)].map(x=>x[0]);console.log([...txt.matchAll(/id:`[^`]+`,title:`[^`]+`/g)].map(x=>x[0]).join('\n'));}}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});


