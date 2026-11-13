import test from 'node:test';
import assert from 'node:assert/strict';
import {createScullingState,advanceSculling,scullingPose,scullingPoint,SCULLING_ANCHORS} from '../src/sculling-rig.js';

test('sculling coasts to rest without resetting its phase, then resumes from that phase',()=>{
 const motion=createScullingState();
 for(let i=0;i<133;i++)advanceSculling(motion,1/60,true);
 const running=scullingPose(motion,1440,960);
 advanceSculling(motion,1/60,false);
 assert.ok(Math.abs(scullingPose(motion,1440,960).angle-running.angle)<.004);
 for(let i=0;i<600;i++)advanceSculling(motion,1/60,false);
 assert.equal(motion.speed,0);
 const stopped={...motion},rest=scullingPose(motion,1440,960);
 for(let i=0;i<300;i++)advanceSculling(motion,1/60,false);
 assert.deepEqual(motion,stopped,'a stopped oar stays at its actual position');
 advanceSculling(motion,1/60,true);
 assert.ok(motion.phase>=stopped.phase);
 assert.ok(Math.abs(scullingPose(motion,1440,960).angle-rest.angle)<.0002,'restart has no global-clock phase jump');
});

test('stroke timing is independent of frame rate and long inactivity',()=>{
 const atRate=rate=>{const s=createScullingState();for(let i=0;i<rate*3;i++)advanceSculling(s,1/rate,true);for(let i=0;i<rate*2;i++)advanceSculling(s,1/rate,false);return s;};
 const a=atRate(30),b=atRate(120);
 assert.ok(Math.abs(a.phase-b.phase)<1e-9);
 assert.ok(Math.abs(a.speed-b.speed)<1e-9);
 const s=createScullingState();advanceSculling(s,30,false);assert.deepEqual(s,createScullingState());
});

test('both photographed grips and the shaft share one transform around a fixed fulcrum',()=>{
 for(const [w,h] of [[1440,960],[1920,1080],[390,844],[667,375]]){
  const s=createScullingState(),initial=scullingPose(s,w,h);
  for(let i=0;i<240;i++){
   advanceSculling(s,1/60,true);const p=scullingPose(s,w,h),pivot=scullingPoint(p,SCULLING_ANCHORS.pivot);
   assert.ok(Math.hypot(pivot.x-initial.x,pivot.y-initial.y)<1e-8,'fulcrum cannot slide with the hands');
   for(const anchor of [SCULLING_ANCHORS.left,SCULLING_ANCHORS.right]){
    const at=scullingPoint(p,anchor);
    assert.ok(Number.isFinite(at.x)&&Number.isFinite(at.y));
    assert.ok(at.y>h*.40&&at.y<h*.91,'hands stay in the visible foreground');
   }
  }
 }
});

test('reduced motion keeps the held object still without replacing its grip',()=>{
 const s=createScullingState();for(let i=0;i<80;i++)advanceSculling(s,1/60,true);
 const phase=s.phase;for(let i=0;i<120;i++)advanceSculling(s,1/60,true,true);
 assert.equal(s.phase,phase);
});
