import test from 'node:test';
import assert from 'node:assert/strict';
import {teaVesselFrame,sipPose,fanPose} from '../src/hand-motion.js';
test('cup remains on the table until grasp and releases only after returning',()=>{
 for(const kind of ['tea','songtea'])for(const [w,h]of[[1440,960],[390,844],[844,390]]){
  const rest=teaVesselFrame(kind,w,h,0),end=teaVesselFrame(kind,w,h,6.1);
  assert.deepEqual(end.rest,rest.rest);assert.equal(end.x,rest.x);assert.equal(end.y,rest.y);assert.equal(end.scale,rest.scale);
  for(let t=0;t<=6.1;t+=.01){const f=teaVesselFrame(kind,w,h,t);if(f.near>0)assert.ok(f.grip>.9999,'moving vessel must have complete grip');if(f.grip<.9999){assert.equal(f.x,rest.x);assert.equal(f.y,rest.y);assert.equal(f.scale,rest.scale);}}
 }
});
test('fan is held at the same resting pose before and after every replay',()=>{for(const t of [0,8]){const p=fanPose(t);assert.ok(Math.abs(p.angle)<1e-12);assert.equal(p.scaleX,1);assert.ok(Math.abs(p.drift)<1e-12);}});
