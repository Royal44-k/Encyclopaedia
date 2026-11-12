import { chromium } from 'file:///C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/workshop-study',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0"><canvas id="study" style="width:100vw;height:100vh"></canvas><div style="position:fixed;left:36px;top:170px;width:300px;padding:30px;background:#ebeadae8;color:#243f35;border-radius:20px;font:24px Georgia">T01 · Workshop<br><small style="font:14px sans-serif">Renderer composition study<br>Left space reserved for actual UI</small></div></body>'}));
 await page.goto('http://127.0.0.1:5173/workshop-study');
 await page.evaluate(async()=>{
  const {createValley}=await import('/src/world/renderer.js');await new Promise(resolve=>{window.valley=createValley(document.querySelector('canvas'),{onReady:resolve});});
  window.valley.setReducedMotion(true);
  window.work={stage:'make',artwork:{id:'work.t01.player',revision:1,parts:{body:'ring',accent:'cloth'},joint:'pivot',rotation:12,title:'A little question',note:'',intent:'movement',location:'workshop',permission:'ask',status:'draft'},view:'front',moving:false};
  await window.valley.setWorkshop(window.work);
 });
 await mkdir('artifacts/t01',{recursive:true});await page.waitForTimeout(200);
 await page.screenshot({path:'artifacts/t01/workshop-scene-front.png'});
 await page.evaluate(async()=>await window.valley.workshopView('side'));await page.waitForTimeout(200);await page.screenshot({path:'artifacts/t01/workshop-scene-side.png'});
 const photo=await page.evaluate(()=>window.valley.captureArtwork());if(photo)await writeFile('artifacts/t01/workshop-artwork-capture.jpg',Buffer.from(photo.split(',')[1],'base64'));
 await page.evaluate(async()=>{window.work={...window.work,stage:'end',artwork:{...window.work.artwork,status:'displayed',location:'flower'}};await window.valley.setWorkshop(window.work);});
 await page.waitForTimeout(200);await page.screenshot({path:'artifacts/t01/workshop-scene-flower.png'});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);await page.screenshot({path:'artifacts/t01/workshop-scene-mobile.png'});
 await writeFile('artifacts/t01/workshop-scene-check.json',JSON.stringify({errors,scope:'Isolated renderer study with placeholder left panel, not final app UI',stats:await page.evaluate(()=>window.valley.getStats())},null,2));
 console.log(JSON.stringify({errors}));if(errors.length)process.exitCode=1;
}finally{await browser.close()}
