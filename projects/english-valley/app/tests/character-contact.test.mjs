import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createCast,animateCharacter} from '../src/world/characters.js';
import {reachArm} from '../src/world/character-contact.js';
const setup=()=>{const scene=new THREE.Scene(),resources=new Set(),actor=createCast(scene,resources).Sam;actor.group.position.set(-15.03,.3,-6.6);actor.group.rotation.y=-1.7;return {actor,resources,scene};};
test('a world-space hand contact preserves both limb lengths and reaches the target',()=>{
 const {actor}=setup();animateCharacter(actor,0,1);actor.group.updateMatrixWorld(true);
 const target=actor.group.localToWorld(new THREE.Vector3(.12,1.25,.46));const result=reachArm(actor,1,target);
 assert.ok(result.reached);assert.ok(result.error<.0001);assert.ok(actor.palms[1].getWorldPosition(new THREE.Vector3()).distanceTo(target)<.0001);
 assert.ok(Math.abs(actor.elbows[1].position.length()-.275)<1e-9);assert.ok(Math.abs(actor.palms[1].position.length()-Math.hypot(.335,.012))<1e-9);
});
test('speech does not pull a held hand away and release restores the regular pose',()=>{
 const {actor}=setup();const target=actor.group.localToWorld(new THREE.Vector3(.10,1.3,.45));actor.speaking=true;
 for(let t=0;t<4;t+=.1){animateCharacter(actor,0,t);assert.ok(reachArm(actor,1,target).error<.0001);}
 animateCharacter(actor,0,0);assert.ok(actor.palms[1].getWorldPosition(new THREE.Vector3()).distanceTo(target)>.1);assert.equal(actor.arms[1].rotation.y,0);
});
test('unreachable or invalid targets cannot stretch the character or produce NaNs',()=>{
 const {actor}=setup();const far=new THREE.Vector3(20,20,20);const result=reachArm(actor,1,far);assert.equal(result.reached,false);assert.ok(result.error>1);assert.ok(actor.arms[1].quaternion.toArray().every(Number.isFinite));assert.throws(()=>reachArm(actor,1,new THREE.Vector3(NaN,0,0)),/finite/);
});
