const {webkit,chromium}=require('C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{const p=await b.newPage();p.on('console',m=>console.log(m.type(),m.text()));p.on('pageerror',e=>console.log('ERROR',e.message));await p.goto('http://127.0.0.1:4173');await p.waitForFunction(()=>window.westLake);console.log(await p.evaluate(async()=>{const {LakeAudio}=await import('/src/soundtrack.js');const a=new LakeAudio();try{await a.toggle();return a.snapshot();}catch(e){return {name:e.name,msg:e.message,stack:e.stack};}}));}finally{await b.close();}})().catch(console.error);

