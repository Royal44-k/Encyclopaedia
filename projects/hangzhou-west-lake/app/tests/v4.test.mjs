import test from 'node:test';
import assert from 'node:assert/strict';
import {TourClock,tourChapters} from '../src/curated-tour.js';
import {shortText} from '../src/postcard.js';
import {bankEdge,makeHabitat} from '../src/river-habitat.js';
import {riverCenter} from '../src/journey-space.js';
import {collect,createJourney,restoreCollection} from '../src/state.js';

test('curated tour freezes while loading or paused and never skips on large background deltas',()=>{
 const c=new TourClock();c.active=true;for(let n=0;n<100;n++)c.advance(.05);assert.ok(Math.abs(c.elapsed-5)<1e-10);c.paused=true;c.advance(200);assert.ok(Math.abs(c.elapsed-5)<1e-10);c.paused=false;c.loading=true;c.advance(200);assert.ok(Math.abs(c.elapsed-5)<1e-10);c.loading=false;c.advance(200);assert.ok(c.elapsed<5.11);assert.equal(tourChapters.reduce((n,c)=>n+c.duration,0),142);
});
test('tour clock ends exactly at chapter boundary and totals previous chapters correctly',()=>{const c=new TourClock();c.reset(2);c.active=true;let done=false;for(let n=0;n<500;n++)done=c.advance(.1)||done;assert.equal(done,true);assert.equal(c.elapsed,20);assert.equal(c.total,60);});
test('postcard captions are bounded by Unicode characters without cutting surrogate pairs',()=>{assert.equal(shortText('湖🌙'.repeat(30)).length,42);assert.equal(Array.from(shortText('湖🌙'.repeat(30))).length,28);assert.equal(shortText('  湖\n山\u0000  '),'湖 山');assert.equal(shortText('江南诗韵',2),'江南');});
test('river habitat is stable across frames, irregularly spaced and stays outside the navigable centre',()=>{const h=makeHabitat();assert.deepEqual(h,makeHabitat());assert.ok(h.trees.length>100);for(const t of h.trees)assert.ok(Math.abs(t.x-riverCenter(t.z))>5);const steps=h.trees.slice(1,25).map((t,i)=>(t.z-h.trees[i].z).toFixed(2));assert.ok(new Set(steps).size>20);for(let z=0;z<250;z+=.1){assert.ok(bankEdge(z,-1)<riverCenter(z)-4);assert.ok(bankEdge(z,1)>riverCenter(z)+4);assert.ok(Math.abs(bankEdge(z+.01,1)-bankEdge(z,1))<.04);}});
test('ancient and modern tea memories remain independent and old saved journeys migrate intact',()=>{const s=createJourney();collect(s,'tea');collect(s,'song-tea');collect(s,'song-birds');collect(s,'river');assert.equal(s.collection.length,4);assert.deepEqual(restoreCollection('["tea","scene-0","river","unknown","river"]'),['tea','scene-0','river']);});
