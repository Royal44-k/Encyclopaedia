import test from 'node:test';
import assert from 'node:assert/strict';
import {benchPose,projectPoint,riverWidth,riverCenter,riverStops,clipNear} from '../src/journey-space.js';
test('bridge underside crossing near plane remains a clipped polygon',()=>{const p=clipNear([[-10,2,-1],[10,2,-1],[10,2,2],[-10,2,2]]);assert.equal(p.length,4);assert.ok(p.every(v=>v[2]>=.15));assert.equal(clipNear([[0,1,-2],[1,1,-2],[1,2,-1]]).length,0);});
import {scoreFor,scoreEvents,scores} from '../src/scores.js';
test('ten sights have separate authored scores, valid notes and sparse phrasing',()=>{const ids=['sudi','quyuan','pinghu','duanqiao','huagang','liulang','santan','shuangfeng','leifeng','nanping'];assert.equal(new Set(ids.map(i=>JSON.stringify(scoreFor(i)))).size,10);for(const id of Object.keys(scores))for(let i=0;i<64;i++)for(const n of scoreEvents(id,i)){assert.ok(n.midi>=24&&n.midi<100);assert.ok(n.duration>0&&n.gain<.2);}assert.notEqual(scoreFor('song-tea').title,scoreFor('beishan').title);});
test('bench approach, look down, turn, sit retain continuous world position',()=>{
 let prev=benchPose(0);for(let i=1;i<=1000;i++){const a=benchPose(i/1000);for(const k of ['x','y','z','yaw','pitch'])assert.ok(Math.abs(a[k]-prev[k])<.08,k);prev=a;}
 assert.equal(benchPose(0).y,1.65);assert.equal(benchPose(1).y,1.02);assert.ok(benchPose(.54).pitch>.4);assert.ok(benchPose(.7).yaw>1);assert.equal(benchPose(1).z,8.65);
});
test('forward movement gives near objects greater parallax than distant objects',()=>{const c={x:0,y:1.6,z:0,yaw:0,pitch:0},d={...c,z:2};const near=projectPoint([2,0,8],c,1440,960),n2=projectPoint([2,0,8],d,1440,960),far=projectPoint([2,0,80],c,1440,960),f2=projectPoint([2,0,80],d,1440,960);assert.ok(n2.x-near.x>(f2.x-far.x)*10);assert.equal(projectPoint([0,0,-2],c,1440,960),null);});
test('lake-west route alternates narrow passage with open water and never jumps',()=>{assert.ok(riverWidth(115)>riverWidth(30)*2);assert.equal(riverStops.at(-1).at,1);for(let z=1;z<240;z++)assert.ok(Math.abs(riverCenter(z)-riverCenter(z-.01))<.02);});
