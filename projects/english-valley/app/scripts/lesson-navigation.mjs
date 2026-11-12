import assert from 'node:assert/strict';
// Test driver for the visible section controls. It never force-clicks hidden UI.
export function enableLessonNavigation(page){
 const proto=Object.getPrototypeOf(page.locator('body'));if(proto.__lessonNavigation)return;proto.__lessonNavigation=true;
 const click=proto.click;
 async function reveal(locator){
  if(!await locator.count()||await locator.isVisible())return;
  const pane=await locator.evaluate(el=>el.closest('[data-lesson-pane]')?.dataset.lessonPane).catch(()=>null);if(!pane)return;
  const p=locator.page(),tab=p.locator(`[data-lesson-view="${pane}"]`);
  if(await tab.isVisible())await click.call(tab,{});
  for(let i=0;i<20&&!await locator.isVisible();i++){
   const direction=await locator.evaluate(el=>{const pager=el.closest('[data-lesson-pane]')?.querySelector('.lesson-pages');if(!pager||pager.hidden)return null;const target=[...el.closest('[data-lesson-pane]').children].find(x=>x.contains(el));const visible=[...el.closest('[data-lesson-pane]').children].find(x=>x!==pager&&!x.hasAttribute('data-page-hidden'));return target&&visible&&(target.compareDocumentPosition(visible)&Node.DOCUMENT_POSITION_FOLLOWING)?'prev':'next';});
   if(!direction)break;const next=p.locator(`[data-lesson-pane="${pane}"] [data-lesson-page="${direction}"]`);if(!await next.isEnabled())break;await click.call(next,{});
  }
 }
 for(const method of ['click','fill','focus','selectOption','check','uncheck','waitFor']){
  const original=proto[method];proto[method]=async function(...args){if(method!=='waitFor'||!args[0]?.state||args[0].state==='visible')await reveal(this);return original.apply(this,args);};
 }
}
export async function checkCompletePassage(page){
 if(await page.locator('dialog[open],#overlay-root .overlay').count()||!await page.locator('#story-panel .dialogue').count())return;
 const previous=await page.locator('#immersive-dock').getAttribute('data-view');
 const talk=page.locator('[data-lesson-view="dialogue"]');if(await talk.isVisible())await talk.click();
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const result=await page.evaluate(()=>[...document.querySelectorAll('#story-panel .dialogue')].map(el=>{const r=el.getBoundingClientRect();let p=el;const errors=[];while(p&&p!==document.body){const s=getComputedStyle(p),b=p.getBoundingClientRect();if(s.display==='none'||s.visibility==='hidden')errors.push('hidden');if(['auto','scroll'].includes(s.overflowY)&&p.scrollHeight>p.clientHeight+1)errors.push('scroll');if(['hidden','clip','auto','scroll'].includes(s.overflowY)&&(r.bottom>b.bottom+1||r.top<b.top-1))errors.push('clipped');p=p.parentElement;}if(!r.height||r.top<0||r.bottom>innerHeight)errors.push('offscreen');return {text:el.querySelector('p')?.textContent,errors};}));
 assert.ok(result.every(row=>!row.errors.length),`Complete dialogue failed: ${JSON.stringify(result)}`);
 if(previous&&previous!=='dialogue'){const restore=page.locator(`[data-lesson-view="${previous}"]`);if(await restore.isVisible())await restore.click();}
}
