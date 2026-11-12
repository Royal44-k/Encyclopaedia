import {enableLessonNavigation} from './lesson-navigation.mjs';
import {chromium} from 'file:///C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const origin=process.env.APP_URL||'http://127.0.0.1:5173/';const output=process.env.ARTIFACTS_DIR||'artifacts/immersive';await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--enable-unsafe-swiftshader']});const page=await browser.newPage({viewport:{width:1440,height:960}});enableLessonNavigation(page);const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>localStorage.setItem('english-valley.preferences.v1',JSON.stringify({reduced:true,muted:true,audioVersion:2})));
try{
for(const module of ['C1','T01']){
 await page.goto(new URL(`?module=${module}`,origin).href,{waitUntil:'networkidle'});const attr=module==='T01'?'data-work-action':'data-action';await page.locator(`[${attr}="begin"]:not(:disabled)`).waitFor({timeout:90000});await page.locator(`[${attr}="begin"]`).click();await page.locator('.walk-note').waitFor({state:'detached'});
 await page.locator(`[${attr}="${module==='C1'?'evidence-bridge':'settings'}"]`).first().click();const selector=module==='C1'?'#overlay-root .modal':'dialog[open]';await page.locator(selector).waitFor();
 for(const size of [{width:1440,height:960},{width:390,height:844}]){
  await page.setViewportSize(size);await page.waitForTimeout(150);
  const bounds=await page.evaluate(selector=>{const a=document.querySelector('#valley').getBoundingClientRect(),b=document.querySelector(selector).getBoundingClientRect();return {sceneBottom:a.bottom,modalTop:b.top,modalBottom:b.bottom,noOverlap:a.bottom<=b.top+.5};},selector);
  if(!bounds.noOverlap)throw Error('Modal covers 3D scene');checks.push({module,width:size.width,...bounds});await page.screenshot({path:`${output}/${module}-modal-${size.width}.png`});
 }
 await page.keyboard.press('Escape');if(await page.locator(selector).count())throw Error('Escape did not close modal');await page.setViewportSize({width:1440,height:960});
}
if(errors.length)throw Error('Unexpected page errors');await writeFile(`${output}/modal-layout-study.json`,JSON.stringify({passed:true,origin,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
}finally{await browser.close();}
