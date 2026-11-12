import {enableLessonNavigation,checkCompletePassage} from './lesson-navigation.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE || 'C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').href);
const origin=process.env.APP_URL||'http://127.0.0.1:4173/';
const folder=process.env.ARTIFACTS_DIR||'artifacts/workshop';await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:1440,height:960},deviceScaleFactor:1});
await context.addInitScript(()=>{
  if(!sessionStorage.workTestSeed){localStorage.setItem('english-valley.preferences.v1',JSON.stringify({audioVersion:2,sound:true,music:true,ambience:true,muted:false,reduced:true,chinese:true}));sessionStorage.workTestSeed='1';}
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
const shot=async name=>{await checkCompletePassage(page);return page.screenshot({path:`${folder}/${name}.png`,fullPage:true});};
const voice=id=>page.waitForFunction(id=>window.__workAudio.some(r=>r.src===`/audio/voice/${id}.wav`&&r.peak>.0003),id,{timeout:30000});
let build;
try{
  await page.goto(`${origin}?module=T01`,{waitUntil:'networkidle'});await ready();build=await page.locator('script[type="module"][src]:not([src="/@vite/client"])').getAttribute('src');await shot('01-entry');
  assert.equal(await page.evaluate(()=>__workAudio.length),0);
  await click('begin');await settled();await voice('T01.001');await voice('T01.002');await voice('T01.003');
  await page.waitForFunction(()=>__workAudio.some(r=>r.src==='/audio/music/workshop.wav'&&r.peak>.0003));
  checks.push('Automatic distinct Sam/Iris recordings and real workshop music output');
  const count=await page.evaluate(()=>__workAudio.filter(r=>r.src==='/audio/voice/T01.001.wav').length);await click('language');await click('language');assert.equal(await page.evaluate(()=>__workAudio.filter(r=>r.src==='/audio/voice/T01.001.wav').length),count);
  await b('part','[data-part="ring"]').click();await b('slot','[data-slot="accent"]').click();await b('part','[data-part="cloth"]').click();await b('joint','[data-joint="pivot"]').click();await voice('T01.005');
  const slider=page.locator('#work-rotation');await slider.focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');assert.equal((await saved()).artwork.rotation,2);assert.equal(await page.evaluate(()=>document.activeElement.id),'work-rotation');
  await click('move');assert.equal((await saved()).moving,true);await shot('02-making');await click('move');
  await b('slot','[data-slot="body"]').click();await b('part','[data-part="tin"]').click();assert.equal((await saved()).artwork.parts.body,'ring');assert.match(await page.locator('#toast').innerText(),/too heavy/);
  checks.push('Compatible connections, rejected heavy pivot and continuous keyboard rotation');
  if(process.argv.includes('--smoke')){await writeFile(`${folder}/smoke.json`,JSON.stringify({build,errors,checks},null,2));console.log(JSON.stringify({build,errors,checks}));await browser.close();process.exit(errors.length?1:0);}
  await click('share');await settled();await voice('T01.006');await page.locator('.work-photo img').waitFor();await shot('03-iris');
  await b('intent','[data-intent="movement"]').click();await voice('T01.009');await click('move');await click('move');
  await page.locator('#work-note').fill('I used a ring and a piece of cloth. The gap is part of my idea.');await page.locator('#work-permission').selectOption('no');await click('save-label');
  await b('intent','[data-intent="shape"]').click();await settled();assert.equal((await saved()).view,'side');await voice('T01.018');
  const angleLine=await page.evaluate(()=>__workAudio.filter(r=>r.src==='/audio/voice/T01.022.wav').at(-1));assert.ok(angleLine?.ended&&angleLine.endedAt-angleLine.startedAt>=angleLine.duration-.08,'Fast camera arrival must not truncate the first angle line');
  checks.push('Conditional movement response, real observer position and complete queued lines with reduced motion');
  // Failed label write must preserve the words through an unrelated redraw.
  await page.evaluate(()=>{window._set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='english-valley.workshop.v1'&&window.failWorkWrite)throw new DOMException('Quota','QuotaExceededError');return _set.call(this,k,v);};window.failWorkWrite=true;});
  await page.locator('#work-note').fill('A draft kept even if storage is full.');await click('language');assert.equal(await page.locator('#work-note').inputValue(),'A draft kept even if storage is full.');
  assert.notEqual((await saved()).artwork.note,'A draft kept even if storage is full.');await page.evaluate(()=>window.failWorkWrite=false);await click('save-label');assert.equal((await saved()).artwork.note,'A draft kept even if storage is full.');
  await click('language');checks.push('Storage failure does not discard unsaved author words on UI redraw');
  await click('photo');await page.keyboard.press('Escape');
  const downloadPromise=page.waitForEvent('download');await click('export');const download=await downloadPromise;const downloaded=JSON.parse(await readFile(await download.path(),'utf8'));assert.match(downloaded.photograph,/^data:image\/jpeg/);checks.push('Export keeps the actual photograph after a no-op label save');
  await click('place');await settled();await b('display','[data-location="flower"]').click();await settled();await voice('T01.025');await shot('04-flower-exhibition');
  const artwork=(await saved()).artwork;assert.equal(artwork.title,'');assert.equal(artwork.location,'flower');assert.equal(artwork.permission,'no');assert.equal(artwork.status,'displayed');
  const workRaw=await page.evaluate(()=>localStorage.getItem('english-valley.workshop.v1'));
  await click('modules');assert.equal(await page.locator('.module-card').count(),12);assert.equal(await page.locator('.module-enter').count(),3);await shot('05-chapters');await page.locator('.module-enter[href="?module=C1"]').click();
  await page.locator('[data-action="begin"]:not(:disabled)').waitFor({timeout:90000});await page.locator('[data-action="begin"]').click();await settled();const c1Raw=await page.evaluate(()=>localStorage.getItem('english-valley.journey.v1'));assert.equal(await page.evaluate(()=>localStorage.getItem('english-valley.workshop.v1')),workRaw);
  await page.locator('[data-action="modules"]').click();await page.locator('.module-enter[href="?module=T01"]').click();await ready();await click('begin');await settled();assert.equal((await saved()).artwork.id,artwork.id);assert.equal((await saved()).artwork.location,'flower');assert.equal(await page.evaluate(()=>localStorage.getItem('english-valley.journey.v1')),c1Raw);checks.push('Blank-title exhibition, real module menu and independent persistent chapter records');
  await click('reopen');await settled();assert.equal((await saved()).artwork.location,'workshop');await b('joint','[data-joint="fixed"]').click();await b('part','[data-part="tin"]').click();await click('undo');assert.equal((await saved()).artwork.parts.body,'ring');
  await click('store');await settled();assert.equal((await saved()).artwork.status,'stored');await page.reload({waitUntil:'networkidle'});await ready();await click('begin');await settled();assert.equal((await saved()).moving,false);checks.push('Undo, return to one workbench, unfinished storage and paused reload');
  await click('reopen');await settled();await page.setViewportSize({width:390,height:844});await shot('06-mobile-making');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.ok(await b('mute').isVisible());await click('settings');await page.locator('[data-work-pref="music"]').uncheck();await page.keyboard.press('Escape');
  await b('slot','[data-slot="accent"]').click();await b('part','[data-part="fan"]').click();assert.equal((await saved()).artwork.parts.accent,'fan');await click('share');await settled();assert.equal(await b('intent','[data-intent="movement"]').count(),0);await shot('07-mobile-sharing');checks.push('Narrow-screen material tools, sound controls and static-only response');
  // Corrupt data remains byte-for-byte intact until explicit archival recovery.
  await page.evaluate(()=>localStorage.setItem('english-valley.workshop.v1','{unfinished'));await page.reload({waitUntil:'networkidle'});await b('recover').waitFor({timeout:90000});assert.equal(await page.evaluate(()=>localStorage.getItem('english-valley.workshop.v1')),'{unfinished');await click('recover');assert.equal((await saved()).stage,'entry');assert.ok(await page.evaluate(()=>Object.keys(localStorage).some(k=>k.startsWith('english-valley.workshop.v1.recovery.'))));checks.push('Corrupt save is retained then archived only on explicit recovery');
  assert.deepEqual(errors,[]);await writeFile(`${folder}/browser-workshop.json`,JSON.stringify({passed:true,build,checks,errors},null,2));console.log(JSON.stringify({passed:true,build,checks:checks.length,errors}));
}catch(error){await shot('failure').catch(()=>{});await writeFile(`${folder}/browser-workshop.json`,JSON.stringify({passed:false,build,checks,error:error.message,errors},null,2));console.error(error);process.exitCode=1;}
finally{await context.close().catch(()=>{});await browser.close().catch(()=>{});}
