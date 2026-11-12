import assert from 'node:assert/strict';
import test from 'node:test';
import { createAudioDirector } from '../src/audio/audio-director.js';

const lines = {a:{speaker:'NOOR',english:'Look at the water.'}, b:{speaker:'ROWAN',english:'What changed?'}, c:{speaker:'MEI',english:'I saw a channel.'}, support:{speaker:'LEARNER',english:'I think…'}};
const manifest = {lines:{a:{src:'/a.mp3'},b:{src:'/b.mp3'},c:{src:'/c.mp3'}},music:{bridge:{src:'/bridge.wav',ambience:'stream'},garden:{src:'/garden.wav'}},ambience:{stream:{src:'/stream.wav'}}};
const settle=async()=>{for(let i=0;i<15;i++)await Promise.resolve();};
function fixture({blocked=false,missing=[],speechSynthesis=null,SpeechSynthesisUtterance,fetchOverride}={}){
 const sources=[],gains=[],requests=[],errors=[],speakers=[];
 let rejectResume=blocked;
 const param=()=>({value:1,setValueAtTime(v){this.value=v;},cancelScheduledValues(){},setTargetAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;}});
 const context={currentTime:0,state:'suspended',destination:{},resume:async()=>{if(rejectResume)throw Object.assign(new Error('gesture required'),{name:'NotAllowedError'});context.state='running';},close:async()=>{context.state='closed';},createGain(){const g={gain:param(),connect(){},disconnect(){}};gains.push(g);return g;},createBufferSource(){const s={connect(node){s.destination=node;},disconnect(){},start(){s.started=true;},stop(){s.stopped=true;},onended:null,buffer:null,loop:false};sources.push(s);return s;},decodeAudioData:async data=>({id:new TextDecoder().decode(data),duration:5})};
 const director=createAudioDirector({lines,manifest,onError:e=>errors.push(e),onSpeaker:(s,e)=>speakers.push([s,e]),platform:{createContext:()=>context,fetch:async url=>{requests.push(url);return fetchOverride?.(url)??{ok:!missing.includes(url),status:missing.includes(url)?404:200,arrayBuffer:async()=>new TextEncoder().encode(url).buffer};},document:null,speechSynthesis,SpeechSynthesisUtterance}});
 return {director,context,sources,gains,requests,errors,speakers,allow:()=>{rejectResume=false;},speech:()=>sources.filter(s=>!s.loop&&s.started&&!s.stopped)};
}
test('a trusted unlock starts scene speech once and preserves visible order across rerenders',async()=>{
 const f=fixture();f.director.enterScene({key:'bridge-1',mood:'bridge',lineIds:['a','b','support']});await settle();assert.equal(f.sources.length,0);
 assert.equal(await f.director.unlock(),true);await settle();assert.equal(f.speech().length,1);assert.equal(f.speech()[0].buffer.id,'/a.mp3');
 f.director.present({key:'bridge-1',lineIds:['a','b','support']});await settle();assert.equal(f.requests.filter(x=>x==='/a.mp3').length,1);
 f.speech()[0].onended();await settle();assert.equal(f.director.getState().currentId,'b');
 f.speech().at(-1).onended();await settle();assert.equal(f.director.getState().speaking,false);
 f.director.present({key:'bridge-1',lineIds:['a','b']});await settle();assert.equal(f.director.getState().currentId,null);f.director.dispose();
});
test('scene changes cancel the old line and its queue; replay works for an already delivered line',async()=>{
 const f=fixture();await f.director.unlock();f.director.enterScene({key:'bridge',mood:'bridge',lineIds:['a','b']});await settle();const old=f.speech()[0];
 f.director.enterScene({key:'garden',mood:'garden',lineIds:['c']});await settle();assert.equal(old.stopped,true);assert.equal(f.director.getState().currentId,'c');old.onended?.();await settle();assert.equal(f.director.getState().currentId,'c');
 f.speech().at(-1).onended();await settle();await f.director.replay('c');await settle();assert.equal(f.director.getState().currentId,'c');assert.equal(f.requests.filter(x=>x==='/c.mp3').length,1);f.director.dispose();
});
test('speech ducks music; independent voice mute retains the unfinished cue',async()=>{
 const f=fixture();await f.director.unlock();f.director.enterScene({key:'bridge',mood:'bridge',lineIds:['a']});await settle();assert.equal(f.director.getState().ducked,true);
 f.director.setEnabled(false);assert.equal(f.director.getState().speaking,false);assert.equal(f.director.getState().enabled,false);assert.equal(f.speech().length,0);
 f.director.setEnabled(true);await settle();assert.equal(f.director.getState().currentId,'a');f.speech().at(-1).onended();await settle();assert.equal(f.director.getState().ducked,false);
 f.director.setVolumes({music:.22,speech:.8,ambience:.1});assert.equal(f.director.getState().volumes.music,.22);f.director.setMusicEnabled(false);assert.equal(f.director.getState().musicEnabled,false);f.director.dispose();
});
test('autoplay refusal is visible and a later trusted unlock retries the same queued scene',async()=>{
 const f=fixture({blocked:true});f.director.enterScene({key:'bridge',mood:'bridge',lineIds:['a']});assert.equal(await f.director.unlock(),false);assert.equal(f.director.getState().blocked,true);assert.equal(f.sources.length,0);assert.equal(f.errors.length,1);
 f.allow();assert.equal(await f.director.unlock(),true);await settle();assert.equal(f.director.getState().blocked,false);assert.equal(f.director.getState().currentId,'a');f.director.dispose();
});
test('a missing recorded asset reports failure, remains retryable, and does not claim speech played',async()=>{
 const missing=['/a.mp3'];const f=fixture({missing});await f.director.unlock();f.director.enterScene({key:'bridge',mood:'bridge',lineIds:['a']});await settle();assert.equal(f.director.getState().speaking,false);assert.equal(f.director.getState().failedLineId,'a');assert.ok(f.errors.some(e=>e.lineId==='a'));
 missing.length=0;await f.director.replay('a');await settle();assert.equal(f.director.getState().currentId,'a');assert.equal(f.requests.filter(x=>x==='/a.mp3').length,2);f.director.dispose();
});
test('visibility suspension stops sound and resumes only the unfinished cue, without replaying a completed one',async()=>{
 const f=fixture();await f.director.unlock();f.director.enterScene({key:'bridge',mood:'bridge',lineIds:['a','b']});await settle();f.speech()[0].onended();await settle();assert.equal(f.director.getState().currentId,'b');
 f.director.suspend();assert.equal(f.director.getState().suspended,true);assert.equal(f.speech().length,1); // ended fake sources retain their started flag; current b stopped
 await f.director.resume();await settle();assert.equal(f.director.getState().currentId,'b');assert.equal(f.requests.filter(x=>x==='/a.mp3').length,1);f.director.dispose();
});
test('a late audio download cannot resurrect speech after a scene change',async()=>{
 let resolveOld;
 const f=fixture({fetchOverride:url=>url==='/a.mp3'?new Promise(resolve=>{resolveOld=resolve;}):null});
 await f.director.unlock();f.director.enterScene({key:'old',mood:'bridge',lineIds:['a','b']});await settle();
 f.director.enterScene({key:'new',mood:'garden',lineIds:['c']});await settle();assert.equal(f.director.getState().currentId,'c');
 resolveOld({ok:true,arrayBuffer:async()=>new TextEncoder().encode('/a.mp3').buffer});await settle();
 assert.equal(f.speech().some(s=>s.buffer.id==='/a.mp3'),false);assert.equal(f.director.getState().currentId,'c');f.director.dispose();
});
test('different scene beds replace one another, voice mute leaves music active, and master mute stops all beds',async()=>{
 const f=fixture();await f.director.unlock();f.director.enterScene({key:'bridge',mood:'bridge',lineIds:['a']});await settle();
 assert.equal(f.director.getState().musicPlaying,'bridge');assert.equal(f.director.getState().ambiencePlaying,'stream');
 f.director.setEnabled(false);assert.equal(f.director.getState().musicPlaying,'bridge');
 f.director.enterScene({key:'garden',mood:'garden',lineIds:[]});await settle();assert.equal(f.director.getState().musicPlaying,'garden');assert.equal(f.director.getState().ambiencePlaying,null);
 f.director.setMuted(true);assert.equal(f.director.getState().musicPlaying,null);assert.equal(f.director.getState().ambiencePlaying,null);f.director.dispose();
});
test('device fallback uses distinct English voices and does not count a queued utterance as spoken',async()=>{
 const utterances=[];const available=[{name:'Microsoft Ryan',voiceURI:'ryan',lang:'en-GB'},{name:'Microsoft David',voiceURI:'david',lang:'en-US'},{name:'Microsoft Sonia',voiceURI:'sonia',lang:'en-GB'}];
 const f=fixture({speechSynthesis:{getVoices:()=>available,speak:u=>utterances.push(u),cancel(){}},SpeechSynthesisUtterance:class {constructor(text){this.text=text;}}});
 f.director.setManifest({});await f.director.unlock();f.director.enterScene({key:'fallback',mood:'bridge',lineIds:['a','b','c']});await settle();
 assert.equal(f.director.getState().speaking,false);assert.equal(f.director.getState().degradedVoice,true);
 const chosen=[];for(let i=0;i<3;i++){const u=utterances[i];chosen.push(u.voice.voiceURI);u.onstart();assert.equal(f.director.getState().speaking,true);u.onend();await settle();}
 assert.equal(new Set(chosen).size,3);assert.deepEqual(f.director.getState().completedIds,['a','b','c']);f.director.dispose();
});


test('a scene sharing a music file updates its label and gain without restarting the source',async()=>{
 const f=fixture();f.director.setManifest({...manifest,music:{...manifest.music,placement:{src:'/bridge.wav',gain:.42}}});
 await f.director.unlock();f.director.enterScene({key:'bridge',mood:'bridge',lineIds:[]});await settle();
 const music=f.sources.find(s=>s.loop&&s.buffer.id==='/bridge.wav');assert.ok(music);assert.equal(music.destination.gain.value,1);
 f.director.enterScene({key:'placement',mood:'placement',lineIds:[]});await settle();
 assert.equal(f.director.getState().musicPlaying,'placement');assert.equal(music.destination.gain.value,.42);
 assert.equal(f.sources.filter(s=>s.loop&&s.buffer.id==='/bridge.wav').length,1);assert.equal(music.stopped,undefined);f.director.dispose();
});

test('replaying the first line retains a queued or already speaking second line',async()=>{
 const f=fixture();await f.director.unlock();f.director.enterScene({key:'bridge',mood:'bridge',lineIds:['a','b']});await settle();
 await f.director.replay('a');await settle();assert.deepEqual(f.director.getState().queuedIds,['b']);assert.equal(f.director.getState().currentId,'a');
 f.speech().at(-1).onended();await settle();assert.equal(f.director.getState().currentId,'b');
 const interrupted=f.speech().at(-1);await f.director.replay('a');await settle();assert.equal(interrupted.stopped,true);
 assert.equal(f.director.getState().currentId,'a');assert.deepEqual(f.director.getState().queuedIds,['b']);
 f.speech().at(-1).onended();await settle();assert.equal(f.director.getState().currentId,'b');assert.deepEqual(f.director.getState().queuedIds,[]);
 f.speech().at(-1).onended();await settle();assert.equal(f.director.getState().speaking,false);f.director.dispose();
});
