import test from 'node:test';
import assert from 'node:assert/strict';
import {teaVesselFrame} from '../src/hand-motion.js';
import {scullingPose,scullingPoint} from '../src/sculling-rig.js';
test('portrait and landscape sipping keep the cup rim visibly at mouth height',()=>{for(const [w,h]of[[320,740],[390,844],[667,375],[1440,960]])for(const kind of ['tea','songtea']){const f=teaVesselFrame(kind,w,h,2.7),rim=f.y-f.scale*(kind==='tea'?370:315);assert.ok(rim>h*.45&&rim<h*.74);}});
test('the sculling shaft reaches beyond both viewport edges throughout a stroke',()=>{for(const [w,h]of[[390,844],[667,375],[1440,960],[1920,1080]])for(let phase=0;phase<6.3;phase+=.1){const p=scullingPose({phase},w,h),left=scullingPoint(p,{x:0,y:650}),right=scullingPoint(p,{x:1536,y:300});assert.ok(left.x<0&&right.x>w,'no cropped shaft endpoint inside scene');}});
