import {chromium} from 'file:///C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('artifacts/night-study',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/night-study',r=>r.fulfill({contentType:'text/html',body:'<body class="immersive" style="margin:0;background:#e3e5db"><canvas style="position:absolute;top:64px;width:100vw;height:630px"></canvas><div style="position:absolute;top:714px;left:28px;font:24px Georgia;color:#234">Renderer study · unobstructed stage; not final UI</div></body>'}));
try{
 await page.goto('http://127.0.0.1:5173/night-study');
 await page.evaluate(async()=>{const {createValley}=await import('/src/world/renderer.js');await new Promise(resolve=>{window.study=createValley(document.querySelector('canvas'),{onReady:resolve});});study.setReducedMotion(true);await study.setNightInquiry({stage:'explore',location:'stairs',held:false,separated:false,boardTest:false});});
 for(const location of ['stairs','other','doorway','workshop']){
  await page.evaluate(async location=>{await study.setNightInquiry({stage:'explore',location,held:false,separated:false,boardTest:false});},location);
  await page.waitForTimeout(180);await page.screenshot({path:`artifacts/night-study/${location}.png`});
 }
 await page.evaluate(async()=>{await study.setNightInquiry({stage:'explore',location:'stairs',held:false,separated:false,boardTest:true});window.observed=[];window.played=study.playNightSequence({board:true},e=>observed.push(e));});
 await page.waitForTimeout(780);await page.screenshot({path:'artifacts/night-study/contact.png'});
 const events=await page.evaluate(async()=>{await played;return observed;});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{document.querySelector('canvas').style.height='354px';});await page.waitForTimeout(200);await page.screenshot({path:'artifacts/night-study/mobile.png'});
 await page.evaluate(async()=>{await study.setNightInquiry(null);await study.setWorkshop({stage:'make',artwork:{id:'work.t01.player',parts:{body:'ring',accent:'cloth'},joint:'pivot',rotation:0,title:'',note:'',location:'workshop',status:'draft'},view:'front',moving:false});});await page.waitForTimeout(150);await page.screenshot({path:'artifacts/night-study/workshop-mobile.png'});
 await writeFile('artifacts/night-study/result.json',JSON.stringify({errors,events},null,2));console.log(JSON.stringify({errors,eventCount:events.length}));if(errors.length)process.exitCode=1;
}finally{await browser.close();}
