const {webkit}=require('C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
async function run(){const browser=await webkit.launch({headless:true});const p=await browser.newPage({viewport:{width:1440,height:960}});let failed=0;
const tests=[
 ['cancelled tea is not awarded',async()=>{await p.locator('[data-place="tea"]').click();await p.keyboard.press('Escape');await p.waitForTimeout(400);assert.ok(!(await p.evaluate(()=>westLake.snapshot().collection)).includes('tea'));}],
 ['Space activates a focused weather button',async()=>{await p.locator('#rain').focus();await p.keyboard.press('Space');assert.equal(await p.evaluate(()=>westLake.snapshot().rain),true);assert.equal(await p.evaluate(()=>westLake.snapshot().paused),false);}],
 ['Escape exits crossing with focused slider',async()=>{await p.locator('#returnModern').click();await p.locator('#enterCrossing').click();await p.locator('#crossProgress').focus();await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>westLake.snapshot().mode),'modern');}],
 ['window blur freezes auto walking',async()=>{await p.locator('#autoWalk').click();await p.evaluate(()=>window.dispatchEvent(new Event('blur')));const x=await p.evaluate(()=>westLake.snapshot().x);await p.waitForTimeout(600);assert.equal(await p.evaluate(()=>westLake.snapshot().x),x);await p.evaluate(()=>window.dispatchEvent(new Event('focus')));}],
];
try{for(const[name,fn]of tests){await p.goto('http://127.0.0.1:4173');await p.waitForFunction(()=>window.westLake);await p.evaluate(()=>localStorage.clear());await p.locator('#enterCrossing').click();await p.locator('#skipCrossing').click();await p.waitForTimeout(100);try{await fn();console.log('PASS',name);}catch(e){failed++;console.log('FAIL',name,e.message);}}}finally{await browser.close();}if(failed)process.exitCode=1;}
run();
