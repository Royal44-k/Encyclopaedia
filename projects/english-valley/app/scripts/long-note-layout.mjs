import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'file:///C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {enableLessonNavigation} from './lesson-navigation.mjs';
const origin=process.env.APP_URL||'http://127.0.0.1:5173/',folder=process.env.ARTIFACTS_DIR||'artifacts/complete-dialogue/long-note';await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--enable-unsafe-swiftshader']});const page=await browser.newPage({viewport:{width:390,height:667}});enableLessonNavigation(page);const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>localStorage.setItem('english-valley.preferences.v1',JSON.stringify({muted:true,reduced:true,audioVersion:2})));
const b=a=>page.locator(`[data-night-action="${a}"]`).first(),checks=[];
try{
 await page.goto(new URL('?module=T02',origin).href);await page.locator('[data-night-action=begin]:not(:disabled)').waitFor({timeout:90000});await b('begin').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('english-valley.night.v1'))?.observations.length===1,{},{timeout:90000});
 for(const text of [('I noticed the tapping stopped, while the quieter sound remained. ').repeat(30).slice(0,1798),'A'.repeat(1798)]){
  await b('journal').click();await page.locator('#night-note').fill(text);await b('save-note').click();await page.keyboard.press('Escape');
  if(await b('finish').count())await b('finish').click();await page.locator('.walk-note').waitFor({state:'detached'});
  await page.locator('[data-lesson-view=actions]').click();await page.waitForTimeout(300);
  const original=await page.locator('.photo-note').allTextContents();assert.equal(original.join(''),text,'Every character is preserved across complete note pages');
  let index=0;do{
   const bounds=await page.evaluate(()=>{const d=document.querySelector('#immersive-dock').getBoundingClientRect();return {top:d.top,bottom:d.bottom,sceneHeight:document.querySelector('#valley').getBoundingClientRect().height,tabsTop:document.querySelector('.lesson-views').getBoundingClientRect().top,visibleNotes:[...document.querySelectorAll('.photo-note')].filter(x=>getComputedStyle(x).display!=='none').map(x=>({bottom:x.getBoundingClientRect().bottom,top:x.getBoundingClientRect().top})),height:innerHeight};});assert.ok(bounds.top>=100,JSON.stringify(bounds));assert.ok(bounds.visibleNotes.every(r=>r.top>=bounds.top&&r.bottom<=bounds.bottom),JSON.stringify(bounds));checks.push(bounds);await page.screenshot({path:`${folder}/${text.startsWith('I')?'words':'unbroken'}-${index++}.png`});
   const next=page.locator('[data-lesson-pane=actions] [data-lesson-page=next]');if(!await next.count()||!await next.isEnabled())break;await next.focus();await page.keyboard.press('Enter');assert.ok(await page.evaluate(()=>document.activeElement?.dataset.lessonPage),'Keyboard stays on page navigation');await page.waitForTimeout(100);
  }while(index<20);
 }
 assert.deepEqual(errors,[]);await writeFile(`${folder}/long-note-layout.json`,JSON.stringify({passed:true,checks,errors},null,2));console.log(JSON.stringify({passed:true,pages:checks.length,errors}));
}catch(e){await page.screenshot({path:`${folder}/failure.png`});await writeFile(`${folder}/long-note-layout.json`,JSON.stringify({passed:false,error:e.message,checks,errors},null,2));console.error(e);process.exitCode=1;}finally{await browser.close();}
