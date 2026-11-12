import {enableLessonNavigation} from './lesson-navigation.mjs';
import {chromium} from 'file:///C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const origin=process.env.APP_URL||'http://127.0.0.1:5173/';
const output=process.env.ARTIFACTS_DIR||'artifacts/immersive';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:960}});enableLessonNavigation(page);const errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>localStorage.setItem('english-valley.preferences.v1',JSON.stringify({reduced:true,muted:true,audioVersion:2})));
await mkdir(output,{recursive:true});
try {
for(const module of ['T01','C1']){
 await page.goto(new URL(`?module=${module}`,origin).href,{waitUntil:'networkidle'});
 const a=module==='T01'?'data-work-action':'data-action';await page.locator(`[${a}="begin"]:not(:disabled)`).waitFor({timeout:90000});await page.locator(`[${a}="begin"]`).click();await page.locator('.walk-note').waitFor({state:'detached'});
 if(module==='T01'){await page.locator('[data-work-action="part"][data-part="ring"]').click();await page.locator('[data-work-action="slot"][data-slot="accent"]').click();await page.locator('[data-work-action="part"][data-part="cloth"]').click();}
 await page.screenshot({path:`${output}/${module}-desktop.png`});
 const bounds=await page.evaluate(()=>{const c=document.querySelector('#valley').getBoundingClientRect(),d=document.querySelector('#immersive-dock').getBoundingClientRect();return {scene:{x:c.x,y:c.y,width:c.width,height:c.height,bottom:c.bottom},dock:{y:d.y,height:d.height},overlap:c.bottom>d.y+.5};});
 if(bounds.overlap)throw Error('Scene overlaps controls');
 await page.locator('[data-immersive="fullscreen"]').click();await page.waitForTimeout(100);if(!await page.evaluate(()=>Boolean(document.fullscreenElement)))throw Error('Fullscreen did not enter');await page.keyboard.press('f');await page.waitForTimeout(100);if(await page.evaluate(()=>Boolean(document.fullscreenElement)))throw Error('Fullscreen did not exit');await page.locator('[data-immersive="scenic"]').click();await page.screenshot({path:`${output}/${module}-scenic.png`});await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:844});const mobile=await page.evaluate(()=>{const c=document.querySelector('#valley').getBoundingClientRect(),d=document.querySelector('#immersive-dock').getBoundingClientRect();return {noOverlap:c.bottom<=d.y+.5,noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth};});if(!mobile.noOverlap||!mobile.noHorizontalOverflow)throw Error('Mobile layout bounds');await page.screenshot({path:`${output}/${module}-mobile.png`});await page.setViewportSize({width:1440,height:960});
 const build=await page.locator('script[type=module][src]:not([src="/@vite/client"])').getAttribute('src');checks.push({module,build,desktop:bounds,mobile,fullscreenEnterExit:true,scenicRestore:true});console.log(module,JSON.stringify(bounds));
}
if(errors.length)throw Error('Unexpected browser errors');
await writeFile(`${output}/layout-study.json`,JSON.stringify({passed:true,origin,errors,checks,scope:'Browser layout study at the recorded origin and entry build.'},null,2));console.log(JSON.stringify({passed:true,errors}));
}catch(error){await writeFile(`${output}/layout-study.json`,JSON.stringify({passed:false,origin,errors,checks,error:error.message},null,2));throw error;}finally{await browser.close();}
