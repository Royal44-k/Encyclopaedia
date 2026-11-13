import test from 'node:test';
import assert from 'node:assert/strict';
import {createJourney,enterSong,walkTo,stepJourney,hailBoat,togglePause,returnModern,collect,restoreCollection} from '../src/state.js';

test('starts modern; entering Song places the visitor on the causeway',()=>{
  const s=createJourney(); assert.equal(s.mode,'modern');
  enterSong(s); assert.equal(s.mode,'song'); assert.equal(s.boat.phase,'idle');
  assert.ok(s.x>=0&&s.x<=1);
});
test('walking clamps targets to land bounds and stops without overshooting',()=>{
  const s=createJourney(); enterSong(s); walkTo(s,5);
  for(let i=0;i<2000;i++)stepJourney(s,.05);
  assert.equal(s.x,.96); assert.equal(s.target,null);
});
test('pause freezes walking and boat progression',()=>{
  const s=createJourney();enterSong(s);walkTo(s,.8);stepJourney(s,.1);
  togglePause(s);const x=s.x;stepJourney(s,2);assert.equal(s.x,x);
  togglePause(s);hailBoat(s);s.x=s.boat.dock;stepJourney(s,.1);
  togglePause(s);const snapshot=JSON.stringify(s.boat);stepJourney(s,10);assert.equal(JSON.stringify(s.boat),snapshot);
});
test('calling a boat completes walking, boarding, cruising and landing',()=>{
  const s=createJourney();enterSong(s);hailBoat(s);
  const seen=new Set();for(let i=0;i<5000;i++){stepJourney(s,.05);seen.add(s.boat.phase);}
  for(const phase of ['approaching','boarding','sitting','cruising','standing','landing','idle'])assert.ok(seen.has(phase),phase);
  assert.ok(s.collection.includes('boat'));assert.equal(s.x,s.boat.destination);
});
test('returning modern cancels all travel without stale targets',()=>{
  const s=createJourney();enterSong(s);hailBoat(s);returnModern(s);
  assert.equal(s.mode,'modern');assert.equal(s.boat.phase,'idle');assert.equal(s.target,null);
  const x=s.x;stepJourney(s,30);assert.equal(s.x,x);
});
test('collection deduplicates and rejects unknown or malformed restored data',()=>{
  const s=createJourney();collect(s,'tea');collect(s,'tea');collect(s,'invalid');
  assert.deepEqual(s.collection,['tea']);
  assert.deepEqual(restoreCollection('{broken'),[]);
  assert.deepEqual(restoreCollection('{"tea":true}'),[]);
  assert.deepEqual(restoreCollection('["tea","tea","bad","boat"]'),['tea','boat']);
});
test('ground clicks cannot divert an already summoned boat approach',()=>{
  const s=createJourney();enterSong(s);hailBoat(s);const dock=s.boat.dock;
  assert.equal(walkTo(s,.9),false);assert.equal(s.target,dock);
});
