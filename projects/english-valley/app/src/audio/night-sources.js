const files = Object.freeze({tap:'/audio/effects/night_tap.wav',creak:'/audio/effects/night_creak.wav'});
const bounded = (n,lo,hi,fallback) => Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):fallback;

/** Short source sounds triggered by the world's actual contact events.
 * Stereo position is a teaching cue, not a simulation of physical occlusion.
 * No sound is queued through mute, a hidden page, or stop().
 */
export function createNightSources({onError=()=>{},platform={}}={}) {
  const Context=platform.AudioContext||globalThis.AudioContext||globalThis.webkitAudioContext;
  const fetcher=platform.fetch||globalThis.fetch?.bind(globalThis);
  const doc=platform.document||globalThis.document;
  const buffers=new Map(),loading=new Map(),active=new Set();
  let context=null,master=null,unlocked=false,muted=false,volume=.65,disposed=false,epoch=0;
  function mix(){if(master)master.gain.setTargetAtTime(muted||doc?.hidden?0:volume,context.currentTime,.015);}
  function report(error){onError(error);}
  async function unlock(){
    if(disposed)return false;
    try{
      if(!context){if(!Context)throw new Error('Web Audio is unavailable.');context=new Context();master=context.createGain();master.connect(context.destination);mix();}
      await context.resume();unlocked=context.state==='running';return unlocked;
    }catch(error){unlocked=false;report(error);return false;}
  }
  async function load(kind){
    if(buffers.has(kind))return buffers.get(kind);
    if(loading.has(kind))return loading.get(kind);
    const promise=(async()=>{
      const response=await fetcher(files[kind]);if(!response.ok)throw new Error(`Could not load the ${kind} sound.`);
      const data=await response.arrayBuffer();const buffer=await context.decodeAudioData(data);
      if(!disposed)buffers.set(kind,buffer);return buffer;
    })();
    loading.set(kind,promise);
    try{return await promise;}finally{if(loading.get(kind)===promise)loading.delete(kind);}
  }
  function release(record){
    if(!active.delete(record))return;
    record.source.disconnect();record.gain.disconnect();record.panner?.disconnect();
  }
  async function play({kind,pan=0,gain=1}={}){
    if(!files[kind]||disposed||muted||!unlocked||doc?.hidden)return false;
    const token=epoch;
    try{
      const buffer=await load(kind);
      if(disposed||muted||doc?.hidden||!unlocked||token!==epoch)return false;
      const source=context.createBufferSource(),level=context.createGain();
      source.buffer=buffer;level.gain.value=bounded(gain,0,1,1);
      const panner=context.createStereoPanner?.();
      if(panner){panner.pan.value=bounded(pan,-1,1,0);source.connect(level);level.connect(panner);panner.connect(master);}
      else{source.connect(level);level.connect(master);}
      const record={source,gain:level,panner};active.add(record);
      source.addEventListener('ended',()=>release(record),{once:true});source.start();return true;
    }catch(error){if(!disposed&&token===epoch)report(error);return false;}
  }
  function stop(){epoch++;for(const record of [...active]){try{record.source.stop();}catch{}release(record);}}
  function setMuted(value){muted=Boolean(value);if(muted)stop();mix();}
  function setVolume(value){volume=bounded(value,0,1,volume);mix();}
  const visibility=()=>{if(doc?.hidden)stop();mix();};
  doc?.addEventListener?.('visibilitychange',visibility);
  return {unlock,play,stop,setMuted,setVolume,
    // Prepare during the entry gesture so a first contact does not wait for fetch.
    async prepare(){if(!unlocked||disposed)return false;try{await Promise.all(Object.keys(files).map(load));return !disposed;}catch(error){if(!disposed)report(error);return false;}},
    getState:()=>({unlocked,muted,volume,active:active.size,disposed}),
    dispose(){if(disposed)return;stop();disposed=true;doc?.removeEventListener?.('visibilitychange',visibility);master?.disconnect();context?.close()?.catch?.(()=>{});buffers.clear();loading.clear();},
  };
}
