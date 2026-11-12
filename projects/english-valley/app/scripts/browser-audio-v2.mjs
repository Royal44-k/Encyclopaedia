import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const runtime=process.env.PLAYWRIGHT_MODULE||'C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const {chromium}=await import(pathToFileURL(runtime).href);
const url=process.env.APP_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--enable-unsafe-swiftshader']});
await mkdir('artifacts',{recursive:true});
const context=await browser.newContext({viewport:{width:1440,height:960},deviceScaleFactor:1});
await context.addInitScript(()=>{
  // This is the previous version's default. The new entry must migrate it once.
  if(!sessionStorage.audioTestSeeded){localStorage.setItem('english-valley.preferences.v1',JSON.stringify({sound:false,reduced:true,chinese:true,quality:'standard'}));sessionStorage.audioTestSeeded='1';}
  const rawBuffers=new WeakMap(),decodedBuffers=new WeakMap(),records=[],contexts=[],masters=[];
  const fetchOriginal=window.fetch;
  window.fetch=async(...args)=>{const response=await fetchOriginal(...args);const read=response.arrayBuffer.bind(response);response.arrayBuffer=async()=>{const data=await read();rawBuffers.set(data,new URL(typeof args[0]==='string'?args[0]:args[0].url,location.href).pathname);return data;};return response;};
  const AC=window.AudioContext||window.webkitAudioContext;
  const createSource=AC.prototype.createBufferSource,decode=AC.prototype.decodeAudioData,createGain=AC.prototype.createGain;
  AC.prototype.decodeAudioData=function(data,...rest){const src=rawBuffers.get(data);const result=decode.call(this,data,...rest);result?.then(buffer=>decodedBuffers.set(buffer,src));return result;};
  const masterByContext=new WeakMap();
  AC.prototype.createGain=function(...args){const gain=createGain.apply(this,args);if(!masterByContext.has(this)){const analyser=this.createAnalyser();gain.connect(analyser);const master={context:this,analyser,data:new Float32Array(analyser.fftSize)};masterByContext.set(this,master);masters.push(master);contexts.push(this);}return gain;};
  AC.prototype.createBufferSource=function(...args){
    const source=createSource.apply(this,args),audioContext=this,start=source.start.bind(source),stop=source.stop.bind(source);
    const record={src:null,startedAt:null,stoppedAt:null,endedAt:null,peak:0,loop:false,duration:null};
    source.start=(...parameters)=>{const analyser=audioContext.createAnalyser();source.connect(analyser);const data=new Float32Array(analyser.fftSize);Object.assign(record,{src:decodedBuffers.get(source.buffer)||'unknown',startedAt:audioContext.currentTime,loop:source.loop,duration:source.buffer?.duration});records.push(record);const measure=()=>{analyser.getFloatTimeDomainData(data);for(const value of data)record.peak=Math.max(record.peak,Math.abs(value));};const timer=setInterval(measure,25);source.addEventListener('ended',()=>{measure();record.endedAt=audioContext.currentTime;clearInterval(timer);analyser.disconnect();},{once:true});return start(...parameters);};
    source.stop=(...parameters)=>{record.stoppedAt=audioContext.currentTime;return stop(...parameters);};return source;
  };
  window.__audioProbe={records,contexts,snapshot:()=>records.map(record=>({...record})),outputPeak:()=>Math.max(0,...masters.map(master=>{master.analyser.getFloatTimeDomainData(master.data);return Math.max(...master.data.map(Math.abs));}))};
});
const page=await context.newPage(),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const action=name=>page.locator(`[data-action="${name}"]`).first();
const click=name=>action(name).click({timeout:25000});
const expectNode=id=>page.waitForFunction(id=>JSON.parse(localStorage.getItem('english-valley.journey.v1'))?.nodeId===id,id,{timeout:25000});
const walkFinished=()=>page.locator('.walk-note').waitFor({state:'detached',timeout:25000});
const probe=()=>page.evaluate(()=>__audioProbe.snapshot());
const count=src=>page.evaluate(src=>__audioProbe.records.filter(r=>r.src===src).length,src);
const voiced=(src,after=0)=>page.waitForFunction(({src,after})=>__audioProbe.records.filter(r=>r.src===src).length>after&&__audioProbe.records.filter(r=>r.src===src).at(-1).peak>.0003,{src,after},{timeout:25000});
const finish=src=>page.waitForFunction(src=>{const r=__audioProbe.records.filter(r=>r.src===src).at(-1);return r&&r.endedAt!==null;},src,{timeout:25000});
async function travel(id){await page.locator(`[data-action="travel"][data-location="${id}"]`).click();await walkFinished();await page.waitForFunction(id=>JSON.parse(localStorage.getItem('english-valley.journey.v1')).fields['navigation.currentLocation']===id,id);}
let manifest,build;
try{
  const response=await page.request.get(`${url}audio/manifest.json`);assert.equal(response.status(),200);manifest=await response.json();
  assert.ok(Object.keys(manifest.lines||{}).length>=25,'Final recorded voices are not ready; run after the asset/build signal.');
  const roles=['NOOR','ROWAN','MEI','SAM','NARR'];assert.equal(new Set(roles.map(role=>manifest.voices[role]?.voiceId)).size,5);
  await page.goto(url,{waitUntil:'networkidle'});await action('begin').waitFor();await page.locator('[data-action="begin"]:not(:disabled)').waitFor({timeout:60000});build=await page.locator('script[type="module"][src]').getAttribute('src');
  assert.equal((await probe()).length,0,'No audible source may start before the initial gesture.');
  await click('begin');await expectNode('j.bridge_record');await walkFinished();
  const noor=manifest.lines['T03S.029'].src,rowan=manifest.lines['T03S.030'].src;
  await voiced(noor);await finish(noor);await voiced(rowan);await finish(rowan);
  assert.equal(await count(noor),1);assert.equal(await count(rowan),1);
  const preferences=await page.evaluate(()=>JSON.parse(localStorage.getItem('english-valley.preferences.v1')));
  assert.equal(preferences.audioVersion,2);assert.equal(preferences.sound,true);assert.equal(preferences.muted,false);
  checks.push({name:'automatic entry and old preference migration',passed:true,first:noor,second:rowan});

  await click('settings');await page.locator('[data-pref="chinese"]').uncheck();await page.locator('[data-pref="chinese"]').check();await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>document.activeElement?.dataset.action),'settings');
  assert.equal(await count(noor),1);assert.equal(await count(rowan),1);
  checks.push({name:'settings rerender does not replay; keyboard focus restored',passed:true});

  await page.locator('[data-action="speak"][data-id="T03S.029"]').click();await voiced(noor,1);
  await click('toggle-sound');await page.waitForFunction(()=>document.body.dataset.audioState==='muted');
  await page.waitForFunction(()=>__audioProbe.outputPeak()<.0001,{timeout:5000});
  assert.ok((await probe()).filter(r=>r.src===noor).at(-1).stoppedAt!==null);
  await click('toggle-sound');await voiced(noor,2);
  checks.push({name:'manual replay and master mute/unmute affect actual audio',passed:true});

  await click('settings');await page.locator('[data-pref="sound"]').uncheck();
  assert.equal(await page.evaluate(()=>document.body.dataset.audioMusic),'bridge');
  assert.ok((await probe()).filter(r=>r.src===noor).at(-1).stoppedAt!==null);
  await page.locator('[data-pref="music"]').uncheck();await page.waitForFunction(()=>!document.body.dataset.audioMusic);
  const beforeVoice=await count(noor);await page.locator('[data-pref="sound"]').check();await voiced(noor,beforeVoice);
  assert.equal(await page.evaluate(()=>document.body.dataset.audioMusic),'');
  await page.locator('[data-pref="music"]').check();await page.waitForFunction(()=>document.body.dataset.audioMusic==='bridge');await click('close');
  checks.push({name:'speech and music controls remain independent',passed:true});

  await click('evidence-bridge');await click('record-evidence');await click('investigate');await expectNode('j.fieldwork');
  await travel('loc.upper_stream');await voiced(manifest.lines['C1.A01'].src);
  await page.waitForFunction(()=>document.body.dataset.audioMusic==='upper');
  await click('evidence-upper');await click('record-evidence');
  await travel('loc.bare_bed');await voiced(manifest.lines['C1.A02'].src);await click('evidence-path');await click('record-evidence');
  await travel('loc.greenhouse');await click('ask-mei');await expectNode('j.mei_neutral');await voiced(manifest.lines['T03S.007'].src);
  await click('mei-continue');await expectNode('j.mei_followup');await page.waitForFunction(()=>JSON.parse(localStorage.getItem('english-valley.journey.v1')).fields['delivery.T03S.011']);await click('mei-record');
  await travel('loc.bare_bed');await click('assemble');await walkFinished();await click('stage-model');await click('open-model');await expectNode('j.model');await walkFinished();
  await page.locator('[data-action="model-position"][data-position="source_cover_zone"]').click();await click('run-trial');await page.waitForFunction(()=>JSON.parse(localStorage.getItem('english-valley.journey.v1')).fields['model.trials'].length===1);
  await click('save-proposal');await walkFinished();await click('agree-plan');await click('implement');await expectNode('j.materials');await page.waitForFunction(()=>document.body.dataset.audioMusic==='placement');
  const samIds=Object.entries(manifest.lines).filter(([,line])=>line.speaker==='SAM').map(([id])=>id);
  const visibleSam=await page.locator('[data-line]').evaluateAll((els,samIds)=>els.map(el=>el.dataset.line).find(id=>samIds.includes(id)),samIds);
  assert.ok(visibleSam,'Materials scene must contain a Sam line.');await voiced(manifest.lines[visibleSam].src);
  await page.screenshot({path:'artifacts/audio-v2-materials.png',fullPage:true});
  const records=await probe();
  for(const role of roles){const urls=new Set(Object.values(manifest.lines).filter(line=>line.speaker===role).map(line=>line.src));assert.ok(records.some(r=>urls.has(r.src)&&r.peak>.0003),`No measured recorded speech for ${role}`);}
  const musicKeys=['bridge','upper','greenhouse','model','placement'];for(const key of musicKeys)assert.ok(records.some(r=>r.src===manifest.music[key].src&&r.peak>.0003),`Missing actual scene music ${key}`);
  checks.push({name:'five distinct recorded voice identities and changing scene music',passed:true,roles,musicKeys});

  await click('pause');await expectNode('j.end_paused');await voiced(manifest.lines['C1.A05'].src);
  checks.push({name:'saved scene automatically speaks after pause',passed:true});
  await page.setViewportSize({width:390,height:844});assert.equal(await action('toggle-sound').isVisible(),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await click('toggle-sound');await page.waitForFunction(()=>document.body.dataset.audioState==='muted');await click('toggle-sound');await page.screenshot({path:'artifacts/audio-v2-mobile.png',fullPage:true});
  checks.push({name:'mobile master sound control remains available',passed:true});
  await page.setViewportSize({width:1440,height:960});await click('settings');await click('new-confirm');await click('new-visit');await action('begin').waitFor();await page.waitForFunction(()=>document.body.dataset.audioMusic==='arrival');
  checks.push({name:'new visit returns to arrival music',passed:true});
  assert.deepEqual(errors,[]);
  await writeFile('artifacts/audio-integration-v2.json',JSON.stringify({passed:true,build,checks,errors,voices:manifest.voices,audioSources:await probe()},null,2));
  console.log(JSON.stringify({passed:true,build,checks:checks.length,errors}));
}catch(error){await page.screenshot({path:'artifacts/audio-v2-failure.png',fullPage:true}).catch(()=>{});await writeFile('artifacts/audio-integration-v2.json',JSON.stringify({passed:false,build,error:error.message,checks,errors,audioSources:await probe().catch(()=>[])},null,2));console.error(error);process.exitCode=1;}
finally{await context.close();await browser.close();}
