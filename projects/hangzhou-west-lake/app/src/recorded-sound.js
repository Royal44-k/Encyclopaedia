// Local audio files: the finished exhibition has no speech or music API dependency.
export class RecordedSound {
 constructor(ctx,output){this.ctx=ctx;this.output=output;this.cache=new Map();this.scene='modern';this.musicToken=0;this.musicStarts=0;this.voiceToken=0;this.enabled=true;this.voiceEnabled=true;this.active=true;this.speaking=null;this.error=null;this.manifest=fetch('/assets/audio/manifest.json').then(r=>{if(!r.ok)throw Error('音频清单未载入');return r.json();});this.manifest.catch(e=>this.error=e.message);this.voiceGain=ctx.createGain();this.voiceGain.gain.value=.82;this.voiceAnalyser=ctx.createAnalyser();this.voiceAnalyser.fftSize=256;this.voiceGain.connect(this.voiceAnalyser);this.voiceAnalyser.connect(ctx.destination);}
 async buffer(url){if(!this.cache.has(url)){const promise=fetch(url).then(r=>{if(!r.ok)throw Error('声音文件未载入');return r.arrayBuffer();}).then(b=>this.ctx.decodeAudioData(b));this.cache.set(url,promise);promise.catch(()=>this.cache.delete(url));}return this.cache.get(url);}
 async musicBuffer(entry){
  const b=await this.buffer(entry.url);
  if(b.musicPrepared||!entry.playback)return b;
  // The historic recording has a DC offset. Remove it before applying the
  // envelope so starting, stopping and looping cannot turn it into a thump.
  const alpha=Math.exp(-2*Math.PI*(entry.playback.highpassHz||35)/b.sampleRate);
  const fadeIn=(entry.playback.fadeIn||1.8)*b.sampleRate,fadeOut=(entry.playback.fadeOut||2.6)*b.sampleRate;
  let peak=0,energy=0;
  for(let channel=0;channel<b.numberOfChannels;channel++){
   const d=b.getChannelData(channel);let previous=d[0],filtered=0;
   for(let i=0;i<d.length;i++){
    const input=d[i];filtered=alpha*(filtered+input-previous);previous=input;
    const envelope=Math.min(1,i/fadeIn,(d.length-1-i)/fadeOut);
    d[i]=filtered*envelope;peak=Math.max(peak,Math.abs(d[i]));
   }
  }
  const scale=Math.min(1,(entry.playback.peakCeiling||.7)/peak);
  for(let channel=0;channel<b.numberOfChannels;channel++){
   const d=b.getChannelData(channel);for(let i=0;i<d.length;i++){d[i]*=scale;energy+=d[i]*d[i];}
  }
  b.musicPrepared=true;b.musicStats={peak:peak*scale,rms:Math.sqrt(energy/(b.length*b.numberOfChannels)),highpassHz:entry.playback.highpassHz||35};
  return b;
 }
 async sceneMusic(id){
  this.scene=id;const token=++this.musicToken;
  try{
   const m=await this.manifest,entry=m.music[id]||m.music.modern;
   // Scene changes must not replay the introduction or overlap the same recording.
   if(token!==this.musicToken||this.track?.url===entry.url)return;
   const b=await this.musicBuffer(entry);
   if(token!==this.musicToken||this.track?.url===entry.url)return;
   const old=this.track,gain=this.ctx.createGain(),source=this.ctx.createBufferSource();
   source.buffer=b;source.loop=true;source.connect(gain);gain.connect(this.output);
   gain.gain.value=0;gain.gain.setTargetAtTime(this.speaking?.2:1,this.ctx.currentTime,1.2);
   source.start();this.track={source,gain,url:entry.url,title:entry.title,credit:entry.credit,startedAt:this.ctx.currentTime,duration:b.duration,mastering:b.musicStats};this.musicStarts++;
   if(old){old.gain.gain.setTargetAtTime(0,this.ctx.currentTime,.5);setTimeout(()=>{old.source.stop();old.source.disconnect();old.gain.disconnect();},2600);}
   this.error=null;
  }catch(e){this.error=e.message;}
 }
 duck(value){this.track?.gain.gain.setTargetAtTime(value,this.ctx.currentTime,.2);}
 cancelVoice(){this.voiceToken++;this.voice?.stop();this.voice=null;this.speaking=null;this.duck(1);}
 async narrate(id){this.cancelVoice();if(!this.voiceEnabled||!this.active)return 0;const token=this.voiceToken;try{const m=await this.manifest,entry=m.narration[id];if(!entry)return 0;const b=await this.buffer(entry.url);if(token!==this.voiceToken||!this.voiceEnabled||!this.active)return 0;const source=this.ctx.createBufferSource();source.buffer=b;source.connect(this.voiceGain);this.voice=source;this.speaking=id;this.duck(.2);source.onended=()=>{source.disconnect();if(this.voice===source){this.voice=null;this.speaking=null;this.duck(1);}};source.start();return b.duration;}catch(e){this.error=e.message;return 0;}}
 setActive(active){if(!active)this.cancelVoice();this.active=active;this.voiceGain.gain.setTargetAtTime(active?.82:0,this.ctx.currentTime,.06);}
 snapshot(){const data=new Float32Array(256);this.voiceAnalyser.getFloatTimeDomainData(data);return {voicePeak:Math.max(...data.map(Math.abs)),file:this.track?.url,title:this.track?.title,credit:this.track?.credit,mastering:this.track?.mastering,musicStarts:this.musicStarts,musicPosition:this.track?(this.ctx.currentTime-this.track.startedAt)%this.track.duration:0,speaking:this.speaking,voiceEnabled:this.voiceEnabled,ducked:!!this.speaking,error:this.error,loaded:this.cache.size};}
}
