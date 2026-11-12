import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createNightInquiry,NIGHT_SEQUENCE_SECONDS} from '../src/world/night-inquiry.js';
const setup=()=>{const scene=new THREE.Scene();const night=createNightInquiry(scene,()=>.3);night.setState({location:'stairs'});return {scene,night};};
function advance(night){for(let i=0;i<100;i++)night.update(.1);}
test('T02 contacts and board flex produce two distinct physical sources in fixed sequence',async()=>{
 const {night}=setup(),events=[];const done=night.start({},e=>events.push(e));advance(night);assert.equal(await done,true);
 assert.equal(events.filter(e=>e.kind==='tap').length,5);assert.equal(events.filter(e=>e.kind==='creak').length,2);
 assert.notDeepEqual(night.source.tap,night.source.creak);assert.ok(events.every(e=>e.time<NIGHT_SEQUENCE_SECONDS));assert.equal(night.pivot.rotation.z,0);night.dispose();
});
test('holding freezes device and separating contact stops taps without deleting board evidence',async()=>{
 const {night}=setup();for(const config of [{held:true},{separated:true},{held:true,board:true}]){
 const events=[];const done=night.start(config,e=>events.push(e));night.update(.7);if(config.held)assert.equal(night.pivot.rotation.z,0);advance(night);assert.equal(await done,true);assert.equal(events.filter(e=>e.kind==='tap').length,0);assert.equal(events.filter(e=>e.kind==='creak').length,2);
 }night.dispose();
});
test('stopping or leaving cancels the physical sequence and does not emit late sources',async()=>{
 const {night}=setup(),events=[];let pending=night.start({},e=>events.push(e));night.update(.1);night.stop();advance(night);assert.equal(await pending,false);assert.equal(events.length,0);
 pending=night.start({},e=>events.push(e));night.setState(null);assert.equal(await pending,false);assert.equal(night.root.visible,false);night.dispose();
});
test('T02 uses a real shadow lamp, finite geometry and the same named treehouse attachments',()=>{
 const {scene,night}=setup();assert.equal(night.lamp.isSpotLight,true);assert.equal(night.lamp.castShadow,true);assert.ok(night.wall.receiveShadow);assert.ok(night.pivot.getWorldPosition(new THREE.Vector3()).x<-12.85,'outside conservatory footprint');
 scene.traverse(o=>{if(o.geometry){for(const n of o.geometry.attributes.position.array)assert.ok(Number.isFinite(n));}});night.dispose();assert.equal(scene.children.length,0);
});
