import {smooth,limit} from './journey-space.js';
export function sipPose(t){const lift=smooth((t-.8)/1.6),lower=smooth((t-3.5)/1.6),near=lift*(1-lower),contact=smooth((t-1.55)/.5)*(1-smooth((t-3.9)/.3)),swallow=Math.sin((t-2)*Math.PI*2.1)*contact;return {near,grip:smooth(t/.8)*(1-smooth((t-5.1)/1)),tilt:near*.105+swallow*.008,bob:swallow*.003,done:t>=6.1,phase:t<.8?'伸手接盏':t<2.4?'握稳举杯':t<3.5?'轻抿一口':t<5.1?'缓缓放回':'松手归位'};}
export function fanPose(t){const enter=smooth(t/1.15),exit=smooth((t-6.8)/1.2),envelope=smooth((t-.9)/.8)*(1-smooth((t-5.9)/1.1)),wave=Math.sin((t-1.3)*Math.PI*1.12)*envelope;return {enter,angle:wave*.18,scaleX:1-Math.abs(wave)*.19,drift:Math.sin(t*2.1-.4)*envelope*.014,breeze:envelope*(.45+Math.abs(wave)*.55),done:t>=8,rest:limit(exit)};}

// One registration for the vessel on the table, in the hands, and at the lips.
// The cup stays still until both the reach and grip have completed.
export function teaVesselFrame(kind,w,h,t=0){
 const song=kind==='songtea',pose=sipPose(t),n=pose.near,m=Math.min(w,h),diam=m*(song?.2:.17),nativeWidth=song?600:510;
 const rest={x:w*(song?.62:.58),y:h*(song?(h<520?.64:.78):(h<520?.73:.857)),scale:diam/nativeWidth};
 const closeScale=Math.min(w*(song?.76:.65),m*(song?.80:.63))/nativeWidth;
 const lipY=h*(h<520?.50:song?.64:.68),nearBase=lipY+closeScale*(song?315:370);
 return {...pose,x:rest.x+(w*.5-rest.x)*n,y:rest.y+(nearBase-rest.y)*n+pose.bob*h,scale:rest.scale+(closeScale-rest.scale)*n,angle:pose.tilt*(song?1:-.65),ax:song?724:398,ay:song?515:530,diam,rest};
}
