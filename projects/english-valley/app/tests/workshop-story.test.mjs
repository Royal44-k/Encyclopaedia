import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkshopStore,WORKSHOP_STORAGE_KEY} from '../src/core/workshop.js';
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)}};
function start(body='ring'){const db=storage(),s=createWorkshopStore(db);s.dispatch('BEGIN');s.dispatch('SET_PART',{slot:'body',part:body});return {s,db};}
function demonstrate(s,intent='shape'){s.dispatch('SHARE');s.dispatch('SET_INTENT',{intent});if(intent==='movement')s.dispatch('SET_MOVING',{moving:true});else s.dispatch('SET_VIEW',{view:'side'});s.dispatch('DEMONSTRATE');s.dispatch('REPLY');}
function exhibit(s){s.dispatch('PLACE');s.dispatch('TRY_SITE',{location:'flower'});s.dispatch('OBSERVE_SITE');s.dispatch('DISPLAY',{location:'flower'});}
test('a first impression must be answered with a real demonstration before the label and exhibition',()=>{
 const {s}=start();s.dispatch('SHARE');assert.throws(()=>s.dispatch('PLACE'));assert.throws(()=>s.dispatch('REPLY'));s.dispatch('SET_INTENT',{intent:'shape'});assert.throws(()=>s.dispatch('DEMONSTRATE'));s.dispatch('SET_VIEW',{view:'side'});s.dispatch('DEMONSTRATE');s.dispatch('REPLY');assert.equal(s.state.stage,'label');s.dispatch('PLACE');assert.throws(()=>s.dispatch('DISPLAY',{location:'path'}));s.dispatch('TRY_SITE',{location:'path'});assert.throws(()=>s.dispatch('DISPLAY',{location:'path'}));s.dispatch('OBSERVE_SITE');s.dispatch('DISPLAY',{location:'path'});assert.equal(s.state.stage,'visit');assert.throws(()=>s.dispatch('FINISH'));s.dispatch('ASK_VISITOR',{topic:'materials'});s.dispatch('FINISH');assert.equal(s.state.stage,'end');assert.equal(s.state.story.finished,true);
});
test('movement needs an actual running compatible work; rebuilding resets interpretation',()=>{
 const {s}=start();s.dispatch('SET_JOINT',{joint:'pivot'});s.dispatch('SHARE');s.dispatch('SET_INTENT',{intent:'movement'});assert.throws(()=>s.dispatch('DEMONSTRATE'));s.dispatch('SET_MOVING',{moving:true});s.dispatch('DEMONSTRATE');s.dispatch('REPLY');s.dispatch('REOPEN');assert.equal(s.state.story.response,null);assert.equal(s.state.story.demonstrated,false);assert.equal(s.state.moving,false);
});
test('trial locations persist without claiming an exhibition; reload cannot certify an interrupted trial',()=>{
 const {s,db}=start('tin');demonstrate(s);s.dispatch('PLACE');s.dispatch('TRY_SITE',{location:'path'});const r=createWorkshopStore(db);assert.equal(r.state.artwork.location,'path');assert.equal(r.state.artwork.status,'draft');assert.equal(r.state.story.trial,null);assert.throws(()=>r.dispatch('DISPLAY',{location:'path'}));r.dispatch('OBSERVE_SITE');r.dispatch('TRY_SITE',{location:'flower'});assert.equal(r.state.story.trial,null);assert.throws(()=>r.dispatch('DISPLAY',{location:'flower'}));
});
test('failed finish retains the visitor conversation and retry completes the same work',()=>{
 const {s,db}=start();demonstrate(s);exhibit(s);s.dispatch('ASK_VISITOR',{topic:'invitation'});const previous=s.state,write=db.setItem;db.setItem=()=>{throw Error('quota')};assert.throws(()=>s.dispatch('FINISH'),{code:'storage-write'});assert.equal(s.state,previous);db.setItem=write;s.dispatch('FINISH');assert.equal(s.state.story.finished,true);
});
test('old exhibitions migrate without invented visitor history or losing author words',()=>{
 const {s}=start();const old=structuredClone(s.state);delete old.story;old.schemaVersion=1;old.stage='end';Object.assign(old.artwork,{title:'My ring',note:'A window for ants.',location:'path',status:'displayed'});const db=storage(),raw=JSON.stringify({schemaVersion:1,state:old,history:[]});db.setItem(WORKSHOP_STORAGE_KEY,raw);const r=createWorkshopStore(db);assert.equal(r.loadError,null);assert.equal(r.state.artwork.note,'A window for ants.');assert.equal(r.state.story.visitor,null);assert.equal(db.getItem(WORKSHOP_STORAGE_KEY),raw);r.dispatch('REOPEN');assert.equal(r.state.artwork.id,old.artwork.id);assert.equal(r.state.artwork.note,old.artwork.note);
});
test('another tab cannot silently overwrite the latest work',()=>{
 const {s,db}=start(),other=createWorkshopStore(db);s.dispatch('SET_PART',{slot:'accent',part:'cloth'});assert.throws(()=>other.dispatch('SHARE'),{code:'stale-save'});assert.equal(createWorkshopStore(db).state.artwork.parts.accent,'cloth');
});
