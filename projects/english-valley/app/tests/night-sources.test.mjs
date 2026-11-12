import test from 'node:test';
import assert from 'node:assert/strict';
import { createNightSources } from '../src/audio/night-sources.js';

function fake({deferred=false,refuse=false,stereo=true}={}) {
  const sources=[],gains=[],panners=[],errors=[],listeners={};let resolveFetch;
  const param=()=>({value:0,setTargetAtTime(value){this.value=value;}});
  class Context {
    constructor(){this.currentTime=0;this.state='suspended';this.destination={};}
    async resume(){if(refuse)throw new Error('Gesture needed');this.state='running';}
    async close(){this.state='closed';}
    createGain(){const node={gain:param(),connect(){},disconnect(){this.disconnected=true;}};gains.push(node);return node;}
    createBufferSource(){const events={};const source={buffer:null,connect(){},disconnect(){this.disconnected=true;},addEventListener(k,f){events[k]=f;},start(){this.started=true;},stop(){this.stopped=true;events.ended?.();}};sources.push(source);return source;}
    createStereoPanner(){if(!stereo)return undefined;const p={pan:param(),connect(){},disconnect(){this.disconnected=true;}};panners.push(p);return p;}
    async decodeAudioData(){return {duration:.5};}
  }
  const doc={hidden:false,addEventListener(k,f){listeners[k]=f;},removeEventListener(k){delete listeners[k];}};
  const response={ok:true,arrayBuffer:async()=>new ArrayBuffer(8)};
  const fetcher=()=>deferred?new Promise(resolve=>resolveFetch=resolve):Promise.resolve(response);
  const player=createNightSources({onError:e=>errors.push(e.message),platform:{AudioContext:Context,fetch:fetcher,document:doc}});
  return {player,sources,gains,panners,errors,doc,hide(){doc.hidden=true;listeners.visibilitychange?.();},show(){doc.hidden=false;listeners.visibilitychange?.();},resolve(){resolveFetch(response);}};
}

test('night sounds require unlock and use bounded source pan/gain',async()=>{
  const f=fake();assert.equal(await f.player.play({kind:'tap'}),false);assert.equal(f.sources.length,0);
  assert.equal(await f.player.unlock(),true);assert.equal(await f.player.prepare(),true);
  assert.equal(await f.player.play({kind:'tap',pan:99,gain:3}),true);
  assert.equal(f.panners[0].pan.value,1);assert.equal(f.gains.at(-1).gain.value,1);assert.equal(f.sources[0].started,true);
  assert.equal(await f.player.play({kind:'unknown'}),false);f.player.dispose();
});
test('night source stop cancels a late decoded contact, not just active nodes',async()=>{
  const f=fake({deferred:true});await f.player.unlock();const pending=f.player.play({kind:'tap'});f.player.stop();f.resolve();assert.equal(await pending,false);assert.equal(f.sources.length,0);f.player.dispose();
});
test('night source mute and hidden-page stop discard effects without stale replay',async()=>{
  const f=fake();await f.player.unlock();await f.player.play({kind:'creak'});f.player.setMuted(true);assert.equal(f.sources[0].stopped,true);assert.equal(f.player.getState().active,0);assert.equal(await f.player.play({kind:'tap'}),false);
  f.player.setMuted(false);await f.player.play({kind:'tap'});f.hide();assert.equal(f.sources[1].stopped,true);assert.equal(await f.player.play({kind:'creak'}),false);f.show();assert.equal(f.sources.length,2);assert.equal(f.player.getState().active,0);f.player.dispose();
});
test('night sound unlock failure is explicit and stereo fallback retains the cue',async()=>{
  const rejected=fake({refuse:true});assert.equal(await rejected.player.unlock(),false);assert.match(rejected.errors[0],/Gesture/);rejected.player.dispose();
  const mono=fake({stereo:false});await mono.player.unlock();assert.equal(await mono.player.play({kind:'creak',pan:-1}),true);mono.player.setVolume(.3);assert.equal(mono.gains[0].gain.value,.3);mono.player.dispose();assert.equal(await mono.player.play({kind:'tap'}),false);
});
