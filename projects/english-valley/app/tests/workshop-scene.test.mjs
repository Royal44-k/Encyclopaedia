import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createWorkshop } from '../src/world/workshop.js';

const work=(extra={})=>({id:'work.t01.player',revision:1,parts:{body:'ring',accent:'cloth'},joint:'pivot',rotation:25,title:'',note:'',intent:'movement',location:'workshop',permission:'ask',status:'draft',...extra});
function setup(){const scene=new THREE.Scene();return {scene,module:createWorkshop(scene,()=>.4)};}

test('the same artwork moves to a real display stand without leaving a duplicate',()=>{
 const {scene,module:m}=setup();m.setActive(true);m.setArtwork(work());const object=m.artwork;
 m.setArtwork(work({location:'flower',status:'displayed'}));
 assert.equal(m.artwork,object);assert.deepEqual(object.position.toArray(),m.locations.flower);
 let count=0;scene.traverse(o=>{if(o.name==='work.t01.player')count++});assert.equal(count,1);
 assert.equal(scene.getObjectByName('t01.stand.flower').visible,true);assert.equal(scene.getObjectByName('t01.stand.path').visible,true);m.dispose();
});
test('inactive C1 world only shows committed display or stored work',()=>{
 const {module:m}=setup();m.setArtwork(work());assert.equal(m.artwork.visible,false);
 m.setArtwork(work({status:'displayed',location:'path'}));assert.equal(m.artwork.visible,true);
 m.setArtwork(null);assert.equal(m.artwork.visible,false);m.dispose();
});
test('parts update in place and accents cannot float without a body',()=>{
 const {module:m}=setup();m.setActive(true);m.setArtwork(work());
 assert.equal(m.artwork.getObjectByName('body.ring').visible,true);
 m.setArtwork(work({parts:{body:null,accent:'cloth'}}));assert.equal(m.artwork.getObjectByName('accent.cloth').visible,false);
 m.setArtwork(work({parts:{body:'tin',accent:'cap'}}));assert.equal(m.artwork.getObjectByName('body.ring').visible,false);assert.equal(m.artwork.getObjectByName('body.tin').visible,true);m.dispose();
});
test('only a lightweight body on a pivot moves; static and tin choices stay fixed',()=>{
 const {module:m}=setup();m.setActive(true);m.setArtwork(work());const pivot=m.artwork.getObjectByName('work.t01.body').parent;
 const angle=pivot.rotation.y;assert.equal(m.update(.2,true),true);assert.notEqual(pivot.rotation.y,angle);
 for(const spec of [{joint:'fixed'},{parts:{body:'tin',accent:'cap'}}]){m.setArtwork(work(spec));const before=pivot.rotation.y;assert.equal(m.update(.2,true),false);assert.equal(pivot.rotation.y,before)}m.dispose();
});
test('workshop models have finite surfaces and fixed shared-world anchors',()=>{
 const {scene,module:m}=setup();assert.deepEqual(m.locations.workshop,[-17.45,1.39,11.4]);
 let triangles=0;scene.traverse(o=>{if(o.geometry){assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3}});
 assert.ok(triangles>10000);assert.ok(triangles<150000);m.dispose();assert.equal(scene.children.length,0);
});
