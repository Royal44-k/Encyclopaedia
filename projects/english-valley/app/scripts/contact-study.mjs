import {chromium} from 'file:///C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const folder='artifacts/complete-dialogue/contact';await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/contact-study',r=>r.fulfill({contentType:'text/html',body:'<body class="immersive" style="margin:0;background:#e7ebdf"><canvas style="position:absolute;top:64px;width:100vw;height:670px"></canvas><p style="position:absolute;top:780px;left:30px;font:24px Georgia">Hand contact · real renderer study</p></body>'}));
try{
 await page.goto('http://127.0.0.1:5173/contact-study');
 await page.evaluate(async()=>{const {createValley}=await import('/src/world/renderer.js');await new Promise(resolve=>window.world=createValley(document.querySelector('canvas'),{onReady:resolve}));world.setReducedMotion(false);await world.setNightInquiry({stage:'explore',location:'stairs',held:true,separated:false,boardTest:false});world.setSpeaking('SAM',true);});
 await page.waitForFunction(()=>world.getStats().nightContact?.reached);const samples=[];
 for(let i=0;i<8;i++){await page.waitForTimeout(180);samples.push(await page.evaluate(()=>world.getStats().nightContact));}
 assert.ok(samples.every(s=>s.error<.005));await page.screenshot({path:`folder/held.png`.replace('folder',folder)});
 await page.evaluate(async()=>{world.setSpeaking(null);await world.setNightInquiry({stage:'explore',location:'other',held:true,separated:false,boardTest:false});});await page.waitForTimeout(200);assert.ok((await page.evaluate(()=>world.getStats().nightContact)).error<.005);await page.screenshot({path:`${folder}/other-side.png`});
 await page.evaluate(async()=>{await world.setNightInquiry({stage:'explore',location:'stairs',held:false,separated:false,boardTest:true});});await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>world.getStats().nightContact),null);await page.screenshot({path:`${folder}/released-board.png`});
 assert.deepEqual(errors,[]);await writeFile(`${folder}/contact-study.json`,JSON.stringify({passed:true,scope:'Real WebGL renderer; target is the actual moving ring, no pose mock.',samples,releaseClearsContact:true,errors},null,2));console.log(JSON.stringify({passed:true,maxError:Math.max(...samples.map(x=>x.error)),errors}));
}catch(e){await page.screenshot({path:`${folder}/failure.png`});await writeFile(`${folder}/contact-study.json`,JSON.stringify({passed:false,error:e.message,errors},null,2));console.error(e);process.exitCode=1;}finally{await browser.close();}
