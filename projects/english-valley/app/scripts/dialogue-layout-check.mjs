import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'file:///C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const origin=process.env.APP_URL||'http://127.0.0.1:5173/';
const folder=process.env.ARTIFACTS_DIR||'artifacts/complete-dialogue';await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:960}});const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>localStorage.setItem('english-valley.preferences.v1',JSON.stringify({reduced:true,muted:true,audioVersion:2})));
try{
 for(const chapter of ['T01','T02','C1']){
  await page.setViewportSize({width:1440,height:960});await page.goto(new URL(`?module=${chapter}`,origin).href,{waitUntil:'networkidle'});
  const attr=chapter==='T01'?'data-work-action':chapter==='T02'?'data-night-action':'data-action';await page.locator(`[${attr}="begin"]:not(:disabled)`).waitFor({timeout:90000});await page.locator(`[${attr}="begin"]`).click();await page.locator('.walk-note').waitFor({state:'detached',timeout:60000});
  if(chapter==='T02')await page.waitForFunction(()=>document.body.dataset.nightRun==='idle'&&document.querySelectorAll('.dialogue').length>0,{},{timeout:90000});
  for(const [width,height] of [[1440,960],[1366,768],[390,844],[375,667],[844,390]]){
   await page.setViewportSize({width,height});await page.waitForTimeout(400);
   const talk=page.locator('[data-lesson-view="dialogue"]');if(await talk.isVisible())await talk.click();await page.waitForTimeout(200);
   const result=await page.evaluate(()=>{
    const scene=document.querySelector('#valley').getBoundingClientRect(),dock=document.querySelector('#immersive-dock').getBoundingClientRect();
    return {chapter:document.title,width:innerWidth,height:innerHeight,sceneBottom:scene.bottom,dockTop:dock.top,lines:[...document.querySelectorAll('#story-panel .dialogue')].map(el=>{const r=el.getBoundingClientRect();let p=el;const problems=[];while(p&&p!==document.body){const s=getComputedStyle(p),b=p.getBoundingClientRect();if(s.display==='none'||s.visibility==='hidden'||(p.tagName==='DETAILS'&&!p.open))problems.push('hidden');if(['auto','scroll'].includes(s.overflowY)&&p.scrollHeight>p.clientHeight+1)problems.push('scroll');if(['hidden','clip','auto','scroll'].includes(s.overflowY)&&(r.bottom>b.bottom+1||r.top<b.top-1))problems.push('clipped');p=p.parentElement;}if(r.bottom>innerHeight||r.top<0||!r.height)problems.push('offscreen');return {text:el.querySelector('p')?.textContent,problems};})};
   });checks.push(result);await page.screenshot({path:`${folder}/${chapter}-${width}.png`});
   assert.ok(result.lines.length>0,'Dialogue is present');assert.ok(result.lines.every(x=>!x.problems.length),JSON.stringify(result));assert.ok(result.dockTop>=80,'Keep scene and view controls on screen');assert.ok(result.sceneBottom<=result.dockTop+1,'Scene separate from dialogue');
  }
 }
 assert.deepEqual(errors,[]);await writeFile(`${folder}/dialogue-layout.json`,JSON.stringify({passed:true,origin,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks:checks.length,errors}));
}catch(e){await writeFile(`${folder}/dialogue-layout.json`,JSON.stringify({passed:false,origin,checks,errors,error:e.message},null,2));console.error(e.message);process.exitCode=1;}finally{await browser.close();}
