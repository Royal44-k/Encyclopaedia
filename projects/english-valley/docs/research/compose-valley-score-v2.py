"""Original, deterministic English Valley instrumental loops and ambiences.

No sampled recording, commercial tune or third-party music is used. The score is
composed as notes, phrasing and timbral synthesis. Rendered PCM is a project asset.
"""
from pathlib import Path
import json, math, wave, hashlib
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'app/public/audio'
SR = 32000
RNG = np.random.default_rng(1308)

def write_wav(path, sound):
    sound = sound - sound.mean(axis=0)
    peak = float(np.max(np.abs(sound)))
    sound = sound * (.68 / max(peak, .001))
    pcm = (np.clip(sound, -1, 1) * 32767).astype('<i2')
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), 'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
    return {'duration':round(len(sound)/SR,3),'sampleRate':SR,'channels':2,'peakDbFS':round(20*math.log10(float(np.max(np.abs(pcm)))/32768),2),'rmsDbFS':round(20*math.log10(float(np.sqrt(np.mean((pcm.astype(float)/32768)**2)))),2),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}

def tone(note, duration, instrument, velocity=1):
    t = np.arange(int(SR*duration))/SR
    f = 440 * 2**((note-69)/12)
    out = np.zeros_like(t)
    if instrument == 'felt':
        for h,a in [(1,1),(2,.34),(3,.13),(4,.07),(5,.025)]:
            decay = np.exp(-t*(1.1+h*.4))
            out += a * decay * (np.sin(2*np.pi*f*h*t)+.3*np.sin(2*np.pi*f*h*1.0018*t))
        out *= 1-np.exp(-t*210)
        out += RNG.normal(0,.018,len(t))*np.exp(-t*90)
    elif instrument == 'guitar':
        for h in range(1,9):
            out += np.sin(2*np.pi*f*h*(1+.00009*h*h)*t) * (1/h**1.8) * np.exp(-t*(1.1+h*.52))
        out *= 1-np.exp(-t*300)
    elif instrument == 'wood':
        for ratio,amp,damp in [(1,1,2.4),(4.02,.15,6.3),(9.1,.035,12)]:
            out += np.sin(2*np.pi*f*ratio*t)*amp*np.exp(-t*damp)
        out *= 1-np.exp(-t*350)
    elif instrument == 'flute':
        phase = 2*np.pi*f*t + .08*np.sin(2*np.pi*4.9*t)
        out = np.sin(phase)+.11*np.sin(phase*2)+.026*np.sin(phase*3)
        out *= (1-np.exp(-t*9)) * np.minimum(1,np.maximum(0,(duration-t)/.35))
        out *= .74+.06*np.sin(2*np.pi*.8*t)
    else:
        for h in range(1,7):
            out += np.sin(2*np.pi*f*h*t+.04*h*np.sin(2*np.pi*4.2*t))/(h**2)
        out *= np.minimum(t/.65,1) * np.minimum((duration-t)/.8,1)
        out *= .8+.1*np.sin(2*np.pi*.31*t)
    return out.astype(np.float32) * velocity

def add(loop, sound, at, pan):
    start = int(at*SR)%len(loop)
    stereo = sound[:,None]*np.array([math.cos((pan+1)*math.pi/4), math.sin((pan+1)*math.pi/4)])[None,:]
    while len(stereo):
        n=min(len(stereo),len(loop)-start)
        loop[start:start+n]+=stereo[:n]
        stereo=stereo[n:]; start=0

def render_score(name,bpm,chords,melody,lead,texture):
    beat=60/bpm; duration=32*beat
    mix=np.zeros((round(SR*duration),2),dtype=np.float64)
    for bar,chord in enumerate(chords*2):
        at=bar*4*beat
        add(mix,tone(chord[0]-12,4.5*beat,'bow',.13),at,-.04)
        if texture=='arpeggio':
            for step,k in enumerate([0,2,1,3,2,1]):
                add(mix,tone(chord[k],2.7,'guitar',.09+(step%3)*.01),at+(step*.5+.05)*beat,.32)
        elif texture=='breathing':
            for k,n in enumerate(chord):
                add(mix,tone(n,4.4*beat,'bow',.035),at+k*.025,-.3+k*.2)
        else:
            for k,n in enumerate(chord):
                add(mix,tone(n,4,'felt',.072),at+k*.035,-.35+k*.18)
        if name in ('model','upper'):
            for step in (1.5,3):
                add(mix,tone(chord[(bar+1)%4]+12,1.5,'wood',.045),at+step*beat,.48)
    for beat_at,n,length,velocity in melody:
        add(mix,tone(n,length*beat+.7,lead,velocity),beat_at*beat,-.2)
    # Circular delays keep tail continuity when the music loop wraps.
    dry=mix.copy()
    for seconds,gain in [(.071,.12),(.137,.105),(.229,.082),(.347,.065),(.509,.04)]:
        mix += np.roll(dry,int(seconds*SR),axis=0)[:,::-1] * gain
    return write_wav(OUT/'music'/f'{name}.wav',mix)

SCORES={
 'arrival':(76,[[48,55,59,64],[45,52,55,60],[41,48,57,60],[43,50,57,62]],[(.5,72,1.8,.13),(3,76,1.3,.11),(6,74,2,.12),(10,71,1.5,.1),(13,69,2,.1),(17,72,2,.12),(20,79,1,.09),(22.5,76,1.6,.1),(27,74,2,.1),(30,72,1.3,.08)],'felt','arpeggio'),
 'bridge':(62,[[50,57,60,64],[46,53,60,65],[43,50,57,62],[45,52,59,64]],[(1,69,1.5,.1),(4.5,72,2.1,.085),(10,74,1.5,.095),(13,69,1.2,.065),(17.5,65,2.6,.08),(23,67,1.8,.075),(26.5,64,2,.07)],'felt','breathing'),
 'upper':(84,[[43,50,59,62],[48,55,59,64],[45,52,60,64],[50,57,60,66]],[(.5,74,1.3,.12),(2.5,76,1,.09),(5,79,1.6,.1),(8.5,76,1.7,.11),(12,74,2,.09),(17,71,1,.1),(19,74,1.4,.11),(22,76,1.8,.095),(27,74,2.6,.08)],'flute','arpeggio'),
 'greenhouse':(68,[[41,48,57,60],[45,52,55,60],[46,53,57,62],[48,55,58,64]],[(1,69,1.6,.12),(4,72,1.3,.095),(7,76,1.4,.085),(10.5,74,1.8,.09),(14,72,1.2,.1),(18,69,1.8,.1),(22,70,1.6,.08),(25.5,67,1.2,.09),(29,65,1.8,.08)],'guitar','piano'),
 'model':(92,[[45,52,59,64],[48,55,59,64],[41,48,57,60],[43,50,57,62]],[(0,69,.8,.13),(1.5,72,1,.1),(4,76,1.1,.11),(6.5,74,1,.085),(9,72,1,.11),(12,69,1.1,.095),(16.5,64,1,.09),(18,67,1,.1),(21,69,1.3,.11),(24.5,74,1,.085),(28,72,2,.085)],'wood','arpeggio'),
 'reflection':(66,[[40,47,55,59],[48,55,59,64],[45,52,55,60],[41,48,55,60]],[(1.5,71,2,.1),(5,67,2.2,.085),(10,64,2.6,.1),(15,67,2,.08),(20,69,2.5,.09),(26,67,3,.085),(30,64,1.5,.065)],'felt','breathing')
}

def ambience(kind):
    duration=24; n=SR*duration; t=np.arange(n)/SR
    # Periodic noise via FFT makes true loop seams without crossfade clicks.
    freq=np.fft.rfftfreq(n,1/SR)
    phase=RNG.uniform(0,2*np.pi,len(freq))
    if kind=='stream':
        profile=np.exp(-freq/4200)*np.minimum(freq/240,1)
    else:
        profile=np.exp(-freq/1150)*np.minimum(freq/90,1)
    noise=np.fft.irfft(profile*np.exp(1j*phase),n=n);noise/=np.std(noise)
    amp=.16+.025*np.sin(2*np.pi*t/8)+.03*np.sin(2*np.pi*t/12)
    mix=np.column_stack([noise*amp,np.roll(noise,413)*amp])
    if kind=='garden':
        for at in [2.4,7.1,14.5,19.2]:
            for k in range(2):
                ct=np.arange(int(.19*SR))/SR
                chirp=np.sin(2*np.pi*(2100*ct+1300*ct*ct))*np.sin(np.pi*ct/.19)**2*.09
                add(mix,chirp,at+k*.29,(-1)**k*.6)
    else:
        for at in np.arange(.3,24,1.13):
            ct=np.arange(int(.16*SR))/SR
            bubble=np.sin(2*np.pi*(500*ct+2600*ct*ct))*np.exp(-ct*32)*.07
            add(mix,bubble,float(at),float(RNG.uniform(-.7,.7)))
    return write_wav(OUT/'ambience'/f'{kind}.wav',mix)

if __name__=='__main__':
    metrics={}
    for name,args in SCORES.items():
        metrics[f'music/{name}.wav']=render_score(name,*args)
        print(name,metrics[f'music/{name}.wav']['duration'],flush=True)
    for name in ['garden','stream']:
        metrics[f'ambience/{name}.wav']=ambience(name)
    (OUT/'score-metrics.json').write_text(json.dumps(metrics,indent=2)+'\n',encoding='utf-8')
