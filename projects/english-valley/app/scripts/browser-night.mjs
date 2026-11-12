import {enableLessonNavigation,checkCompletePassage} from './lesson-navigation.mjs';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE||'C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').href);
const origin=process.env.APP_URL||'http://127.0.0.1:4173/';
const folder=process.env.ARTIFACTS_DIR||'artifacts/night';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.EDGE_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:1440,height:960},deviceScaleFactor:1});
context.setDefaultTimeout(60000);context.setDefaultNavigationTimeout(120000);
await context.addInitScript(()=>{
  if(!sessionStorage.nightTestSeed){localStorage.setItem('english-valley.preferences.v1',JSON.stringify({audioVersion:2,sound:true,music:true,ambience:true,muted:false,reduced:true,chinese:true}));sessionStorage.nightTestSeed='1';}
  // Observe the real decoded buffer and the final node feeding the audio output.
  // A fetched file, or a buffer played through a silent master, is insufficient.
  const raw=new WeakMap(),decoded=new WeakMap(),graph=new WeakMap(),records=[];
  const fetchOriginal=window.fetch;
  window.fetch=async(...args)=>{
    const response=await fetchOriginal(...args),read=response.arrayBuffer.bind(response);
    response.arrayBuffer=async()=>{const data=await read();raw.set(data,new URL(args[0] instanceof Request?args[0].url:String(args[0]),location.href).pathname);return data;};
    return response;
  };
  const AC=window.AudioContext||window.webkitAudioContext;
  const decode=AC.prototype.decodeAudioData,createSource=AC.prototype.createBufferSource,connect=AudioNode.prototype.connect;
  AudioNode.prototype.connect=function(to,...args){if(to instanceof AudioNode){if(!graph.has(this))graph.set(this,new Set());graph.get(this).add(to);}return connect.call(this,to,...args);};
  AC.prototype.decodeAudioData=function(data,...rest){const src=raw.get(data),promise=decode.call(this,data,...rest);promise?.then(buffer=>decoded.set(buffer,src));return promise;};
  function outputNode(node,destination,seen=new Set()){
    if(seen.has(node))return null;seen.add(node);
    for(const next of graph.get(node)||[]){if(next===destination)return node;const found=outputNode(next,destination,seen);if(found)return found;}
    return null;
  }
  AC.prototype.createBufferSource=function(...args){
    const source=createSource.apply(this,args),start=source.start.bind(source),ctx=this;
    source.start=(...params)=>{
      const terminal=outputNode(source,ctx.destination),sourceMeter=ctx.createAnalyser(),outputMeter=ctx.createAnalyser(),silent=ctx.createGain();
      silent.gain.value=0;source.connect(sourceMeter);sourceMeter.connect(silent);
      if(terminal){terminal.connect(outputMeter);outputMeter.connect(silent);}silent.connect(ctx.destination);
      const data=new Float32Array(sourceMeter.fftSize),out=new Float32Array(outputMeter.fftSize);
      const record={src:decoded.get(source.buffer)||null,sourcePeak:0,outputPeak:0,outputConnected:Boolean(terminal),ended:false,startedAt:ctx.currentTime,wallStarted:performance.now(),duration:source.buffer?.duration||0};records.push(record);
      const sample=()=>{sourceMeter.getFloatTimeDomainData(data);for(const value of data)record.sourcePeak=Math.max(record.sourcePeak,Math.abs(value));outputMeter.getFloatTimeDomainData(out);for(const value of out)record.outputPeak=Math.max(record.outputPeak,Math.abs(value));};
      const timer=setInterval(sample,10);
      source.addEventListener('ended',()=>{sample();record.ended=true;record.endedAt=ctx.currentTime;clearInterval(timer);sourceMeter.disconnect();outputMeter.disconnect();silent.disconnect();try{terminal?.disconnect(outputMeter);}catch{}},{once:true});
      return start(...params);
    };
    return source;
  };
  window.__nightAudio=records;
});
const page=await context.newPage();enableLessonNavigation(page);const errors=[],checks=[],snapshots=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
const b=(action,extra='')=>page.locator(`[data-night-action="${action}"]${extra}`).first();
const click=action=>b(action).click({timeout:30000});
const ready=()=>page.locator('[data-night-action="begin"]:not(:disabled)').waitFor({timeout:90000});
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('english-valley.night.v1')));
const rawNight=()=>page.evaluate(()=>localStorage.getItem('english-valley.night.v1'));
const settled=()=>page.locator('.walk-note').waitFor({state:'detached',timeout:90000});
const idle=()=>page.waitForFunction(()=>document.body.dataset.nightRun==='idle',{},{timeout:90000});
const runCount=n=>page.waitForFunction(n=>JSON.parse(localStorage.getItem('english-valley.night.v1'))?.observations.length===n,n,{timeout:90000});
const sourceRecords=()=>page.evaluate(()=>__nightAudio.filter(row=>row.src?.startsWith('/audio/effects/night_')));
const voice=id=>page.waitForFunction(id=>__nightAudio.some(row=>row.src===`/audio/voice/${id}.wav`&&row.sourcePeak>.0003&&row.outputPeak>.0003),id,{timeout:60000});
const screenshot=async name=>{await checkCompletePassage(page);const path=`${folder}/${name}.png`;await page.screenshot({path,fullPage:true});snapshots.push(path);};
const travel=async location=>{await b('travel',`[data-location="${location}"]`).click({timeout:30000});await page.waitForFunction(location=>JSON.parse(localStorage.getItem('english-valley.night.v1'))?.location===location,location);await settled();};
const run=async count=>{await click('listen');await runCount(count);await idle();};
const latest=async()=>{const s=await saved();return s.observations.at(-1);};
async function checkSceneSpace(label){
  const rects=await page.evaluate(()=>{const r=el=>{const b=el.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height,bottom:b.bottom,right:b.right};};return{scene:r(document.querySelector('#valley')),dock:r(document.querySelector('#immersive-dock')),overflow:document.documentElement.scrollWidth>innerWidth,width:innerWidth,height:innerHeight};});
  assert.equal(rects.overflow,false,`${label}: horizontal page overflow`);
  assert.ok(rects.scene.height>180,`${label}: the visible 3D scene collapsed`);
  assert.ok(rects.scene.bottom<=rects.dock.y+1,`${label}: controls overlap the 3D scene`);
  checks.push(`${label}: scene and lesson occupy separate on-screen rectangles`);
}
async function checkDialog(label){
  const bounds=await page.locator('dialog[open]').evaluate(el=>{const r=el.getBoundingClientRect(),scene=document.querySelector('#valley').getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,sceneBottom:scene.bottom,w:innerWidth,h:innerHeight};});
  assert.ok(bounds.x>=-1&&bounds.y>=0&&bounds.right<=bounds.w+1&&bounds.bottom<=bounds.h+1,`${label}: modal exceeds the viewport`);
  assert.ok(bounds.sceneBottom<=bounds.y+1,`${label}: modal covers the scene`);
}
let build,audioEvidence=[];
try{
  const url=new URL(origin);url.searchParams.set('module','T02');await page.goto(url.href,{waitUntil:'networkidle'});await ready();
  build=await page.locator('script[type="module"][src]:not([src="/@vite/client"])').getAttribute('src');
  assert.equal(await page.evaluate(()=>__nightAudio.length),0,'No voice or effects before the trusted entry gesture');
  await screenshot('01-entry');await checkSceneSpace('Desktop entry');
  await click('begin');await runCount(1);await idle();await voice('T02.001');await voice('T02.003');
  assert.deepEqual({kind:(await latest()).kind,tap:(await latest()).tapCount,creak:(await latest()).creakCount},{kind:'baseline',tap:5,creak:2});
  const baseline=await sourceRecords();assert.equal(baseline.filter(r=>r.src.endsWith('night_tap.wav')).length,5);assert.equal(baseline.filter(r=>r.src.endsWith('night_creak.wav')).length,2);
  assert.ok(baseline.every(r=>r.outputConnected&&r.sourcePeak>.0003&&r.outputPeak>.0003),'Both kinds of physical contact must produce non-silent output, not only fetched buffers');
  await page.waitForFunction(()=>__nightAudio.some(r=>r.src==='/audio/music/night.wav'&&r.outputPeak>.0003));
  const rowan=await page.evaluate(()=>__nightAudio.find(r=>r.src==='/audio/voice/T02.001.wav'));assert.ok(rowan.wallStarted>Math.max(...baseline.map(r=>r.wallStarted)),'The first spoken interpretation follows the source sequence');
  assert.equal(await page.locator('#night-event-list > span').count(),7);assert.deepEqual((await saved()).verified,{tap:false,board:false});
  await screenshot('02-baseline');checks.push('Trusted entry automatically presents 5 taps and 2 creaks with real PCM, matching captions, music and Rowan speech');
  const firstVoiceCount=await page.evaluate(()=>__nightAudio.filter(r=>r.src==='/audio/voice/T02.001.wav').length);await click('language');await click('language');assert.equal(await page.evaluate(()=>__nightAudio.filter(r=>r.src==='/audio/voice/T02.001.wav').length),firstVoiceCount);
  if(process.argv.includes('--smoke')){assert.deepEqual(errors,[]);audioEvidence=await page.evaluate(()=>__nightAudio);await writeFile(`${folder}/browser-night-smoke.json`,JSON.stringify({passed:true,build,checks,errors,audioEvidence,snapshots},null,2));console.log(JSON.stringify({passed:true,build,checks:checks.length}));}
  else{
    // Hearing two accounts must not silently certify either cause.
    await travel('workshop');await voice('T02.010');assert.equal((await saved()).testimony.device,true);assert.deepEqual((await saved()).verified,{tap:false,board:false});
    await travel('doorway');await voice('T02.008');assert.equal((await saved()).testimony.shadow,true);assert.deepEqual((await saved()).verified,{tap:false,board:false});
    await click('photo');await page.locator('dialog[open] img').waitFor();await checkDialog('Desktop photograph');
    const photo=await page.locator('dialog[open] img').getAttribute('src');assert.match(photo,/^data:image\/jpeg;base64,/);assert.ok(Buffer.from(photo.split(',')[1],'base64').length>10000,'A screenshot must contain actual scene image data');
    const imageSize=await page.locator('dialog[open] img').evaluate(img=>({width:img.naturalWidth,height:img.naturalHeight}));assert.ok(imageSize.width>=300&&imageSize.height>=180);await screenshot('03-viewpoint-photo');await page.keyboard.press('Escape');
    await click('journal');await checkDialog('Desktop notebook');await page.locator('#night-note').fill('I heard two kinds of sound. Mei saw a shadow, but that does not explain both sounds.');await click('save-note');await page.keyboard.press('Escape');
    const downloadPromise=page.waitForEvent('download');await click('export');const download=await downloadPromise;const exported=JSON.parse(await readFile(await download.path(),'utf8'));assert.equal(exported.photograph,photo);assert.match(exported.record.note,/two kinds of sound/);
    checks.push('Sam and Mei accounts remain separate from proof; viewpoint JPEG and learner words survive export');
    await travel('stairs');await click('finish');await page.waitForFunction(()=>document.body.dataset.nightStage==='end');assert.equal((await saved()).outcome,'open');assert.deepEqual((await saved()).verified,{tap:false,board:false});await voice('T02.022');await screenshot('04-question-kept');await click('resume');await settled();
    checks.push('An unresolved ending preserves a question without inventing a cause');
    // Stopping a partial experiment must neither certify nor save it later.
    const beforeStop=(await saved()).observations.length;await click('listen');await page.waitForFunction(()=>document.body.dataset.nightRun==='running');await click('stop');await idle();await page.waitForTimeout(6800);assert.equal((await saved()).observations.length,beforeStop);
    checks.push('Interrupted source sequence stays unrecorded after its original finish time');
    await click('hold');await settled();assert.equal((await saved()).held,true);await voice('T02.013');await run(2);assert.deepEqual({kind:(await latest()).kind,tap:(await latest()).tapCount,creak:(await latest()).creakCount},{kind:'held',tap:0,creak:2});assert.deepEqual((await saved()).verified,{tap:true,board:false});
    await click('finish');await page.waitForFunction(()=>document.body.dataset.nightStage==='end');assert.equal((await saved()).outcome,'tapping');assert.equal((await saved()).held,false);await screenshot('05-partial-explanation');await click('resume');await settled();
    // Re-enter held state so the board action must visibly release Sam first.
    await click('hold');await settled();assert.equal((await saved()).verified.board,false);const boardStart=await page.evaluate(()=>performance.now());await click('board');await runCount(3);await idle();assert.equal((await saved()).held,false);assert.equal((await saved()).boardTest,true);await voice('T02.023');
    const boardSounds=(await sourceRecords()).filter(r=>r.wallStarted>=boardStart);assert.equal(boardSounds.filter(r=>r.src.endsWith('night_creak.wav')).length,2);
    const boardLine=await page.evaluate(()=>__nightAudio.find(r=>r.src==='/audio/voice/T02.023.wav'));assert.ok(boardLine.wallStarted>Math.max(...boardSounds.map(r=>r.wallStarted)),'Sam explains the board after the automatic demonstration, not before it');
    assert.deepEqual({kind:(await latest()).kind,tap:(await latest()).tapCount,creak:(await latest()).creakCount},{kind:'board',tap:5,creak:2});assert.deepEqual((await saved()).verified,{tap:true,board:true});await screenshot('06-both-checked');
    checks.push('Fixed-part comparison yields 0/2, partial ending remains honest, and an actual released board test yields 5/2 and two verified causes');
    // Fail only the persistent write boundary; keep the renderer, run and reducer real.
    await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='english-valley.night.v1'&&window.__failNightWrites)throw new DOMException('Quota','QuotaExceededError');return original.call(this,key,value);};window.__failNightWrites=true;});
    await click('listen');await page.waitForFunction(()=>document.body.dataset.nightRun==='unsaved',{},{timeout:90000});assert.equal((await saved()).observations.length,3);assert.equal(await b('travel').isDisabled(),true);await screenshot('07-unsaved-comparison');
    const playedBeforeRetry=(await sourceRecords()).length;await page.evaluate(()=>window.__failNightWrites=false);await click('retry-run');await runCount(4);await idle();assert.equal((await sourceRecords()).length,playedBeforeRetry,'Retrying storage must not invent a second acoustic observation');checks.push('Quota failure keeps a pending completed run; retry saves it without replay or duplicate records');
    await click('finish');await page.waitForFunction(()=>document.body.dataset.nightStage==='end');assert.equal((await saved()).outcome,'both');await page.waitForFunction(()=>__nightAudio.some(r=>r.src==='/audio/music/night_reflection.wav'&&r.outputPeak>.0003));await screenshot('08-two-causes');
    // Mobile modals keep their own reserved dock instead of covering the actors.
    await page.setViewportSize({width:390,height:844});await checkSceneSpace('Mobile ending');await click('journal');await checkDialog('Mobile notebook');assert.equal(await page.locator('.night-records tbody tr').count(),4);await screenshot('09-mobile-notebook');await page.keyboard.press('Escape');
    await click('settings');await checkDialog('Mobile sound settings');await page.locator('[data-night-pref="music"]').uncheck();await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('english-valley.preferences.v1')).music),false);await screenshot('10-mobile-ending');checks.push('Desktop and mobile photographs, notebook and sound settings remain inside the viewport and below the scene');
    await page.setViewportSize({width:1440,height:960});audioEvidence=await page.evaluate(()=>__nightAudio);const nightRaw=await rawNight();
    await click('modules');assert.equal(await page.locator('.module-card').count(),12);assert.equal(await page.locator('.module-enter').count(),3);await screenshot('11-three-live-chapters');
    await page.locator('.module-enter[href="?module=C1"]').click();await page.locator('[data-action="begin"]:not(:disabled)').waitFor({timeout:90000});await page.locator('[data-action="begin"]').click();await settled();await page.waitForFunction(()=>localStorage.getItem('english-valley.journey.v1')!==null);const c1Raw=await page.evaluate(()=>localStorage.getItem('english-valley.journey.v1'));assert.equal(await rawNight(),nightRaw);
    await page.locator('[data-action="modules"]').click();await page.locator('.module-enter[href="?module=T01"]').click();await page.locator('[data-work-action="begin"]:not(:disabled)').waitFor({timeout:90000});await page.locator('[data-work-action="begin"]').click();await settled();await page.waitForFunction(()=>localStorage.getItem('english-valley.workshop.v1')!==null);const workRaw=await page.evaluate(()=>localStorage.getItem('english-valley.workshop.v1'));assert.equal(await rawNight(),nightRaw);
    await page.locator('[data-work-action="modules"]').click();await page.locator('.module-enter[href="?module=T02"]').click();await ready();await click('begin');await settled();assert.equal((await saved()).stage,'end');assert.equal((await saved()).outcome,'both');assert.equal(await rawNight(),nightRaw);assert.equal(await page.evaluate(()=>localStorage.getItem('english-valley.journey.v1')),c1Raw);assert.equal(await page.evaluate(()=>localStorage.getItem('english-valley.workshop.v1')),workRaw);checks.push('Menu has 12 stories and 3 playable chapters; real C1/T01 visits leave the direct T02 record and each other intact');
    assert.deepEqual(errors,[]);await writeFile(`${folder}/browser-night.json`,JSON.stringify({passed:true,build,checks,errors,audioEvidence,snapshots},null,2));console.log(JSON.stringify({passed:true,build,checks:checks.length,errors}));
  }
}catch(error){await screenshot('failure').catch(()=>{});audioEvidence=await page.evaluate(()=>window.__nightAudio||[]).catch(()=>[]);await writeFile(`${folder}/browser-night.json`,JSON.stringify({passed:false,build,checks,error:error.message,stack:error.stack,errors,audioEvidence,snapshots},null,2));console.error(error);process.exitCode=1;}
finally{await context.close().catch(()=>{});await browser.close().catch(()=>{});}
