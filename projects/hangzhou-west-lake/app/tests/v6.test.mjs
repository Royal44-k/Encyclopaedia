import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {boatPose,hullClearance,RiverFlock,jetty} from '../src/river-navigation.js';
import {bankEdge} from '../src/river-habitat.js';
import {sipPose,fanPose} from '../src/hand-motion.js';
test('entire hull clears both banks and the jetty throughout the approach',()=>{let prev=boatPose(0),min=Infinity;for(let i=0;i<=10000;i++){const p=boatPose(i/10000);min=Math.min(min,hullClearance(p));assert.ok(Math.hypot(p.x-prev.x,p.z-prev.z)<.2);prev=p;}assert.ok(min>.3,'hull to bank/jetty minimum: '+min);assert.equal(boatPose(1).yaw,0);assert.ok(boatPose(1).x<jetty.x-.8);const a=boatPose(.999),b=boatPose(1);assert.ok(b.z-a.z<.004,'boat decelerates to rest');});
test('waterbirds steer away gradually and stay within the water boundary',()=>{const flock=new RiverFlock(),b=flock.birds[0],original={x:b.x,z:b.z},boat={x:b.x,z:b.z-9};let previous={...b};for(let i=0;i<180;i++){flock.update(1/60,boat,true);assert.ok(Math.hypot(b.x-previous.x,b.z-previous.z)<.05,'no teleport');assert.ok(b.x>bankEdge(b.z,-1)&&b.x<bankEdge(b.z,1));previous={...b};}assert.ok(flock.reactions>0);assert.ok(Math.hypot(b.x-boat.x,b.z-boat.z)>9);assert.ok(Math.abs(b.x-original.x)>.5);for(let i=0;i<1200;i++)flock.update(1/60,{x:boat.x,z:boat.z-50},false);assert.ok(b.alert<.001);});
test('tea approaches the mouth, makes only small sipping motions, and returns continuously',()=>{assert.equal(sipPose(0).near,0);assert.ok(sipPose(2.4).near>.99);assert.equal(sipPose(6.1).near,0);let last=sipPose(0);for(let t=.01;t<6.1;t+=.01){const p=sipPose(t);assert.ok(Math.abs(p.near-last.near)<.01);assert.ok(Math.abs(p.bob)<.0031);last=p;}});
test('fan has smooth acceleration, three broad strokes and a settled ending',()=>{let reversals=0,last=fanPose(0),sign=0;for(let t=.01;t<8;t+=.01){const p=fanPose(t);assert.ok(Math.abs(p.angle-last.angle)<.02);const next=Math.sign(p.angle);if(sign&&next&&next!==sign)reversals++;if(next)sign=next;last=p;}assert.ok(reversals>=5&&reversals<=8);assert.equal(fanPose(8).breeze,0);assert.ok(Math.abs(fanPose(8).angle)<1e-9);});
test('17 scenes share the licensed full guqin recording and preserve 20 local PCM narration clips',async()=>{
 const {createHash}=await import('node:crypto');
 const m=JSON.parse(fs.readFileSync('assets/audio/manifest.json'));
 assert.equal(Object.keys(m.music).length,17);assert.equal(Object.keys(m.narration).length,20);
 assert.equal(new Set(Object.values(m.music).map(a=>a.url)).size,1,'scenes use one continuous main piece');
 const main=m.music.modern,recording=fs.readFileSync('.'+main.url);
 assert.equal(recording.toString('ascii',0,4),'OggS');assert.equal(recording.length,main.bytes);
 assert.equal(createHash('sha256').update(recording).digest('hex'),main.sha256,'complete original recording is packaged');
 assert.ok(main.duration>430&&main.duration<435);assert.equal(main.license,'CC BY 2.5');
 assert.equal(main.licenseUrl,'https://creativecommons.org/licenses/by/2.5/');assert.match(main.credit,/Charlie Huang/);
 for(const a of Object.values(m.narration)){
  const wav=fs.readFileSync('.'+a.url);assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');assert.equal(wav.readUInt32LE(24),22050);assert.ok(wav.length>40000);assert.ok(Math.abs((wav.length-44)/44100-a.duration)<.001);
 }
});
