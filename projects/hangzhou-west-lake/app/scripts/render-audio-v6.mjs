import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {scores,scoreEvents} from '../src/scores.js';
const rate=22050,TAU=Math.PI*2,out=new URL('../assets/audio/',import.meta.url);
await mkdir(out,{recursive:true});
function wav(data,sampleRate=rate){const b=Buffer.alloc(44+data.length*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(sampleRate,24);b.writeUInt32LE(sampleRate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(data.length*2,40);for(let i=0;i<data.length;i++)b.writeInt16LE(Math.round(Math.max(-1,Math.min(1,data[i]))*32767),44+i*2);return b;}
let seed=718;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296*2-1;};
function addNote(data,n,at){const f=440*2**((n.midi-69)/12),count=Math.ceil((n.duration+1)*rate),start=Math.round(at*rate),delay=Math.max(2,Math.round(rate/f)),string=new Float32Array(delay);for(let i=0;i<delay;i++)string[i]=rand();let prev=0;
 for(let i=0;i<count;i++){const t=i/rate,attack=1-Math.exp(-t/(n.voice==='silk'?.004:.13));let y;
  if(n.voice==='silk'){const j=i%delay,next=(j+1)%delay;y=string[j];string[j]=(string[j]+string[next])*.4975;y=y*.7+Math.sin(TAU*f*t)*Math.exp(-t*1.6)*.3;}
  else if(n.voice==='bell')y=(Math.sin(TAU*f*t)+.22*Math.sin(TAU*f*2.01*t)*Math.exp(-t)+.10*Math.sin(TAU*f*3.97*t)*Math.exp(-t*2))*.6;
  else{const vibrato=.009*Math.sin(TAU*4.2*t)*Math.min(1,t*2),phase=TAU*f*t+vibrato;prev=.82*prev+.18*rand();y=(Math.sin(phase)+.19*Math.sin(phase*2)+.055*Math.sin(phase*3)+prev*.12)*.57;}
  const decay=Math.exp(-t/(n.duration*.38)),envelope=attack*decay*Math.min(1,(count-i)/(rate*.16)),value=y*envelope*n.gain*2.2;data[(start+i)%data.length]+=value;
  // A short room response wraps into the loop, preserving tails at its seam.
  for(const [d,g]of [[.127,.18],[.233,.12],[.411,.075],[.739,.04]])data[(start+i+Math.round(d*rate))%data.length]+=value*g;
 }
}
const manifest={version:6,music:{},narration:{}};
for(const [id,s]of Object.entries(scores)){const duration=64*30/s.bpm,data=new Float32Array(Math.round(duration*rate));for(let step=0;step<64;step++)for(const n of scoreEvents(id,step))addNote(data,n,step*30/s.bpm);let peak=0,sum=0;for(const a of data){peak=Math.max(peak,Math.abs(a));sum+=a*a;}const name='music-'+id+'.wav';await writeFile(new URL(name,out),wav(data));manifest.music[id]={url:'/assets/audio/'+name,title:s.title,duration:data.length/rate,peak,rms:Math.sqrt(sum/data.length)};}
const raw=await readFile(new URL('../verification/v6/narration-original.wav',import.meta.url));let format,pcm;
for(let p=12;p+8<=raw.length;){const id=raw.toString('ascii',p,p+4),n=raw.readUInt32LE(p+4);if(id==='fmt ')format={encoding:raw.readUInt16LE(p+8),channels:raw.readUInt16LE(p+10),rate:raw.readUInt32LE(p+12),bits:raw.readUInt16LE(p+22)};if(id==='data')pcm=raw.subarray(p+8,p+8+n);p+=8+n+(n%2);}
if(!pcm||format.encoding!==1||format.bits!==16)throw Error('Unsupported source WAV');
const source=JSON.parse(await readFile(new URL('../assets/v6/voice-source.json',import.meta.url),'utf8')),cues=Object.entries(source.cues);
for(let k=0;k<cues.length;k++){const [id,cue]=cues[k],previous=cues[k-1]?.[1],next=cues[k+1]?.[1];const start=previous?Math.max(cue.start,(previous.end+cue.start)/2):0,end=next?Math.min(cue.end,(cue.end+next.start)/2):source.duration,n=Math.ceil((end-start)*rate),data=new Float32Array(n);for(let i=0;i<n;i++){const f=Math.min(Math.floor((start+i/rate)*format.rate),pcm.length/2/format.channels-1);let sample=0;for(let ch=0;ch<format.channels;ch++)sample+=pcm.readInt16LE((f*format.channels+ch)*2)/32768/format.channels;data[i]=sample*Math.min(1,i/(rate*.006),(n-i)/(rate*.012));}const name='voice-'+id+'.wav';await writeFile(new URL(name,out),wav(data));manifest.narration[id]={url:'/assets/audio/'+name,text:cue.text,sourceStart:start,sourceEnd:end,duration:n/rate};}
await writeFile(new URL('manifest.json',out),JSON.stringify(manifest,null,2));console.log(JSON.stringify({music:Object.keys(manifest.music).length,narration:Object.keys(manifest.narration).length,sourceFormat:format,largestPeak:Math.max(...Object.values(manifest.music).map(x=>x.peak))}));
