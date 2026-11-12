import {enableLessonNavigation,checkCompletePassage} from './lesson-navigation.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE || 'C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').href);
const origin=process.env.APP_URL||'http://127.0.0.1:4173/';
const folder=process.env.ARTIFACTS_DIR||'artifacts/workshop-story-recovery';await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:1440,height:960},deviceScaleFactor:1});
await context.addInitScript(()=>{
  if(!sessionStorage.workTestSeed){localStorage.setItem('english-valley.preferences.v1',JSON.stringify({audioVersion:2,sound:true,music:true,ambience:true,muted:false,reduced:location.search.includes('motionTest')?false:true,chinese:true}));sessionStorage.workTestSeed='1';}
  const raw=new WeakMap(),decoded=new WeakMap(),records=[];
  const fetchOriginal=window.fetch;
  window.fetch=async(...args)=>{const r=await fetchOriginal(...args),read=r.arrayBuffer.bind(r);r.arrayBuffer=async()=>{const data=await read();raw.set(data,new URL(typeof args[0]==='string'?args[0]:args[0].url,location.href).pathname);return data;};return r;};
  const AC=window.AudioContext||window.webkitAudioContext,decode=AC.prototype.decodeAudioData,createSource=AC.prototype.createBufferSource;
  AC.prototype.decodeAudioData=function(data,...rest){const src=raw.get(data),p=decode.call(this,data,...rest);p?.then(b=>decoded.set(b,src));return p;};
  AC.prototype.createBufferSource=function(...args){const source=createSource.apply(this,args),start=source.start.bind(source),ctx=this;source.start=(...params)=>{const analyser=ctx.createAnalyser();source.connect(analyser);const data=new Float32Array(analyser.fftSize),record={src:decoded.get(source.buffer),peak:0,ended:false,startedAt:ctx.currentTime,duration:source.buffer?.duration};records.push(record);const interval=setInterval(()=>{analyser.getFloatTimeDomainData(data);for(const x of data)record.peak=Math.max(record.peak,Math.abs(x));},25);source.addEventListener('ended',()=>{record.ended=true;record.endedAt=ctx.currentTime;clearInterval(interval);analyser.disconnect();},{once:true});return start(...params);};return source;};
  window.__workAudio=records;
});
const page=await context.newPage();enableLessonNavigation(page);const errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const b=(a,extra='')=>page.locator(`[data-work-action="${a}"]${extra}`).first();
const click=a=>b(a).click({timeout:30000});
const ready=()=>page.locator('[data-work-action="begin"]:not(:disabled)').waitFor({timeout:90000});
const settled=()=>page.locator('.walk-note').waitFor({state:'detached',timeout:30000});
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('english-valley.workshop.v1'))?.state);
const shot=async name=>{await checkCompletePassage(page);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(r)))));return page.screenshot({path:`${folder}/${name}.png`,fullPage:true});};
const voice=id=>page.waitForFunction(id=>window.__workAudio.some(r=>r.src===`/audio/voice/${id}.wav`&&r.peak>.0003),id,{timeout:30000});
let build;
try{
 await page.goto(`${origin}?module=T01&motionTest=1`,{waitUntil:'networkidle'});await ready();build=await page.locator('script[type="module"][src]:not([src="/@vite/client"])').getAttribute('src');await click('begin');await settled();
 await b('part','[data-part="ring"]').click();await b('part','[data-part="branch"]').click();await click('undo');assert.equal((await saved()).artwork.parts.body,'ring');assert.equal(await page.locator('[data-work-line="T01.037"]').count(),0);assert.equal(await page.locator('[data-work-line="T01.035"]').count(),1);
 await click('remove');assert.equal((await saved()).artwork.parts.body,null);assert.equal(await page.locator('#story-panel .dialogue').count(),0);checks.push('Undo and removal clear obsolete material speech and subtitles');
 await b('part','[data-part="ring"]').click();await b('joint','[data-joint="pivot"]').click();await click('share');await settled();await b('intent','[data-intent="movement"]').click();await settled();
 async function lose(){await page.evaluate(()=>{window.__loss=document.querySelector('#valley').getContext('webgl2').getExtension('WEBGL_lose_context');if(!__loss)throw Error('Context loss extension unavailable');__loss.loseContext();});await page.waitForTimeout(3300);}
 async function restore(){await page.evaluate(()=>__loss.restoreContext());await page.waitForFunction(()=>!document.querySelector('.error-note'),{},{timeout:30000});await settled();}
 await click('demonstrate');await lose();assert.equal((await saved()).story.demonstrated,false);assert.equal((await saved()).moving,false);assert.equal(await page.locator('[data-work-line="T01.032"]').count(),0);await restore();await click('demonstrate');await settled();assert.equal((await saved()).story.demonstrated,true);checks.push('Actual WebGL loss cancels unobserved demonstration; restore requires a new successful attempt');
 await click('reply');await settled();await click('place');await settled();await b('try-site','[data-location="path"]').click();await settled();await click('display');await settled();
 await b('visitor','[data-topic="invitation"]').click();await lose();assert.equal((await saved()).story.visitor,null);assert.equal(await b('finish').count(),0);assert.equal(await page.locator('[data-work-line="T01.041"]').count(),0);await restore();await b('visitor','[data-topic="invitation"]').click();await settled();assert.equal((await saved()).story.visitor,'invitation');await checkCompletePassage(page);await shot('recovered-visitor');await click('finish');await settled();assert.equal((await saved()).story.finished,true);checks.push('Visitor motion also cancels on context loss, then completes after replay on the same work');
 assert.deepEqual(errors,[]);await writeFile(`${folder}/recovery.json`,JSON.stringify({passed:true,build,normalMotion:true,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks:checks.length,errors}));
}catch(error){await shot('failure').catch(()=>{});await writeFile(`${folder}/recovery.json`,JSON.stringify({passed:false,build,checks,error:error.message,errors},null,2));console.error(error);process.exitCode=1;}
finally{await context.close().catch(()=>{});await browser.close().catch(()=>{});}
