const {webkit}=require('C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('node:assert/strict');
(async()=>{fs.mkdirSync('verification/v2',{recursive:true});const browser=await webkit.launch({headless:true});const errors=[],failed=[],checks=[];
 try{const p=await browser.newPage({viewport:{width:1440,height:960}});p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
 const wait=ms=>p.waitForTimeout(ms),snap=()=>p.evaluate(()=>westLake.snapshot()),shot=n=>p.screenshot({path:'verification/v2/'+n+'.png'}),ok=x=>{checks.push(x);console.log('PASS '+x);};
 await p.goto('http://127.0.0.1:4173');await p.waitForFunction(()=>window.westLake);assert.equal((await snap()).mode,'modern');await shot('01-modern');
 for(let i=0;i<10;i++){if(i===0)await p.locator('[data-sight="0"]').click();else await p.locator('[data-visit="'+i+'"]').click();await p.waitForFunction(()=>!westLake.snapshot().visit.loading);assert.equal((await snap()).mode,'visit');await p.locator('#visitAction').click();
  if(i===0){await p.waitForFunction(()=>westLake.snapshot().visit.seated);await wait(1400);await shot('02-sudi-bench');await p.locator('#visitAction').click();await p.waitForFunction(()=>!westLake.snapshot().visit.seated);}
  if(i===3){await p.locator('#visitSnow').click();await p.waitForFunction(()=>westLake.snapshot().visit.weather==='snow');await wait(1400);await shot('03-bridge-snow');await p.locator('#visitSnow').click();await p.waitForFunction(()=>westLake.snapshot().visit.weather==='clear');}
  if(i===8){await p.waitForFunction(()=>westLake.snapshot().visit.atTop,{},{timeout:12000});await wait(1400);await shot('04-leifeng-top');}
  if(i===9)await p.waitForFunction(()=>!westLake.snapshot().visit.action,{},{timeout:12000});
  ok('enter and interact: '+i+' '+(await snap()).visit.id);
 }
 await p.locator('[data-visit="3"]').click();await p.waitForFunction(()=>!westLake.snapshot().visit.loading);await p.locator('#visitCanvas').focus();await p.keyboard.down('ArrowUp');await wait(2100);await p.keyboard.up('ArrowUp');assert.ok((await snap()).visit.progress>.08);const stopped=(await snap()).visit.progress;await wait(300);assert.equal((await snap()).visit.progress,stopped);ok('first-person walk and stop');
 await p.locator('#visitWeather').click();await p.locator('#visitShelter').click();assert.equal((await snap()).visit.weather,'rain');await shot('05-rain-umbrella');
 await p.locator('#visitTea').click();await p.waitForFunction(()=>!westLake.snapshot().visit.loading);
 for(let i=1;i<=3;i++){await p.locator('#visitAction').click();await p.waitForFunction(n=>westLake.snapshot().visit.teaStep===n,i,{timeout:8000});}
 assert.ok((await snap()).collection.includes('tea'));await shot('06-longjing');ok('pour, infuse and drink Longjing');
 await p.locator('#visitBack').click();await p.locator('#enterCrossing').click();await p.locator('#crossPlay').click();
 for(const [v,name] of [[20,'滴墨'],[150,'晕染'],[280,'淡化'],[400,'描摹'],[540,'勾勒'],[690,'涂色'],[840,'聚焦'],[950,'显现']]){await p.locator('#crossProgress').evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));},v);await wait(100);assert.ok((await p.locator('#crossEyebrow').textContent()).includes(name));if(v===400||v===690)await shot('07-ink-'+v);}
 ok('eight ink stages and scrubbing');await p.locator('#skipCrossing').click();await wait(600);
 assert.equal(new Set((await snap()).residents).size,48);await p.locator('#wideView').click();await wait(1200);await shot('08-whole-scroll');assert.ok((await snap()).zoom<.6);ok('48 unique residents and broader scroll');
 await p.locator('#follow').click();await p.locator('#world').focus();await p.keyboard.down('ArrowRight');await wait(1400);await p.keyboard.up('ArrowRight');assert.ok((await snap()).heroDistance>50);ok('distance-driven hero gait');
 await p.locator('#hailBoat').click();for(const phase of ['boarding','sitting','cruising','standing','landing','idle']){await p.waitForFunction(phase=>westLake.snapshot().boat.phase===phase,phase,{timeout:40000});if(['boarding','cruising','standing'].includes(phase))await shot('09-boat-'+phase);ok('boat '+phase);}
 assert.ok((await snap()).collection.includes('boat'));
 await p.locator('#returnModern').click();await p.setViewportSize({width:390,height:844});await shot('10-modern-mobile');await p.locator('[data-sight="0"]').click();await p.waitForFunction(()=>!westLake.snapshot().visit.loading);await shot('11-visit-mobile');assert.equal(await p.locator('#visitAction').isVisible(),true);
 for(const id of ['visitAction','visitBack','visitWalk']){const r=await p.locator('#'+id).boundingBox();assert.ok(r.x>=0&&r.x+r.width<=391&&r.y+r.height<=845,id+' fits');}
 await p.locator('#visitTea').click();await p.waitForFunction(()=>!westLake.snapshot().visit.loading);await shot('12-tea-mobile');await p.keyboard.press('Escape');assert.equal((await snap()).mode,'modern');ok('mobile controls and keyboard exit');
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);ok('no browser errors or failed assets');fs.writeFileSync('verification/v2/result.json',JSON.stringify({passed:true,checks,errors,failed},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
