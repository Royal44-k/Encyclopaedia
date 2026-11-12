import * as THREE from 'three';

// One authored, repeatable observation condition. Times identify physical
// contacts, not a randomly repeating mystery soundtrack.
export const NIGHT_SEQUENCE_SECONDS = 6.4;
export const NIGHT_TAPS = Object.freeze([.75,1.50,2.25,4.25,5.00]);
export const NIGHT_CREAKS = Object.freeze([3.15,5.75]);

export function createNightInquiry(scene, ground=()=>0) {
  const resources=new Set(),root=new THREE.Group();root.name='t02.treehouse.inquiry';root.visible=false;scene.add(root);
  const mat=(color,options={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.76,...options});resources.add(m);return m;};
  const mesh=(geo,material,pos,parent=root)=>{resources.add(geo);const m=new THREE.Mesh(geo,material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  const box=(material,size,pos,parent=root)=>mesh(new THREE.BoxGeometry(...size),material,pos,parent);
  const rod=(material,a,b,r=.025,parent=root)=>{const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),d=vb.clone().sub(va);const m=mesh(new THREE.CylinderGeometry(r,r,d.length(),12),material,va.add(vb).multiplyScalar(.5).toArray(),parent);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;};
  const bytes=new Uint8Array(64*128*4);for(let y=0;y<128;y++)for(let x=0;x<64;x++){const c=170+28*Math.sin(x*.84+Math.sin(y*.05))+10*Math.sin(x*13+y*.14);bytes.set([c,c,c,255],(y*64+x)*4);}
  const grain=new THREE.DataTexture(bytes,64,128);grain.needsUpdate=true;grain.wrapS=grain.wrapT=THREE.RepeatWrapping;resources.add(grain);
  const wood=mat(0xa28c67,{map:grain,bumpMap:grain,bumpScale:.01});
  const oldWood=mat(0x685d49,{map:grain});
  const metal=mat(0x879994,{metalness:.78,roughness:.29});
  const brass=mat(0xb89b59,{metalness:.7,roughness:.32});
  const ink=mat(0x28413d),warm=mat(0xffe4a1,{emissive:0xffc968,emissiveIntensity:1.8});
  const cx=-15.5,cz=-6.8,gy=ground(cx,cz),hingeY=gy+2.43;
  // The windscreen is fastened to the existing foundation posts below the
  // treehouse, not a detached shadow stage or a second building.
  for(let i=0;i<17;i++)box(wood,[.24,3.15,.065],[-17.75+i*.244,gy+1.5,-8.96]);
  for(const y of [gy+.12,gy+2.9])box(oldWood,[4.2,.1,.1],[-15.8,y,-8.88]);
  for(const x of [-17.7,-13.8])for(const y of [gy+.12,gy+2.9])mesh(new THREE.SphereGeometry(.025,8,6),brass,[x,y,-8.80]);
  const wall=root.children[0];wall.name='obj.treehouse.lower_windscreen';
  // Device hangs from a bracket bolted to the front post; the pivot is a
  // visible bearing and every moving part remains a child of that bearing.
  rod(oldWood,[-14.11,gy,-8.93],[-14.11,hingeY+.22,-8.93],.075);
  rod(oldWood,[-14.11,hingeY+.16,-8.93],[cx,hingeY+.16,cz],.055);
  rod(brass,[cx,hingeY+.16,cz],[cx,hingeY,cz],.015);
  const pivot=new THREE.Group();pivot.position.set(cx,hingeY,cz);root.add(pivot);pivot.name='obj.t02.moving_piece';
  mesh(new THREE.TorusGeometry(.058,.018,10,24),brass,[0,0,0],pivot);
  rod(metal,[0,0,0],[0,-1.05,0],.022,pivot);
  mesh(new THREE.TorusGeometry(.23,.027,12,42),metal,[0,-1.05,0],pivot);
  const neck=rod(metal,[0,-.60,0],[.30,-.23,0],.018,pivot);
  mesh(new THREE.SphereGeometry(.078,16,12),brass,[.31,-.22,0],pivot);
  const leaf=mesh(new THREE.SphereGeometry(1,16,8),metal,[-.15,-.76,0],pivot);leaf.scale.set(.23,.09,.025);leaf.rotation.z=.45;
  const contactOffset=Math.sin(.52)*1.05+Math.cos(.52)*.257+.0225;
  const plate=box(metal,[.045,.55,.20],[cx+contactOffset,hingeY-Math.cos(.52)*1.05,cz]);plate.name='obj.t02.strike_plate';
  rod(ink,[cx+contactOffset,gy,cz],[cx+contactOffset,hingeY-.55,cz],.024);
  rod(ink,[cx+contactOffset,hingeY-.55,cz],[cx+contactOffset+.5,hingeY-.55,cz],.018);
  const gripTarget=new THREE.Object3D();gripTarget.name='obj.t02.hand_contact';gripTarget.position.set(.23,-1.05,.035);pivot.add(gripTarget);
  const collar=mesh(new THREE.CylinderGeometry(.12,.14,.04,28),brass,[cx+contactOffset,gy+.02,cz]);
  const lampPos=[cx-.12,gy+.82,-4.20];
  rod(ink,[lampPos[0],ground(lampPos[0],lampPos[2]),lampPos[2]],lampPos,.045);
  const housing=mesh(new THREE.CylinderGeometry(.18,.13,.24,24),ink,lampPos);housing.rotation.x=Math.PI/2;
  mesh(new THREE.CircleGeometry(.125,24),warm,[lampPos[0],lampPos[1],lampPos[2]-.125]).rotation.y=Math.PI;
  const lamp=new THREE.SpotLight(0xffdfa2,34,13,.67,.18,1.4);lamp.position.set(...lampPos);lamp.target.position.set(cx,gy+1.7,-8.96);lamp.castShadow=true;
  lamp.shadow.mapSize.set(1024,1024);lamp.shadow.bias=-.00003;lamp.shadow.normalBias=.006;lamp.shadow.focus=1;
  root.add(lamp,lamp.target);lamp.name='light.t02.same_source_shadow';
  const conservatoryGlow=new THREE.PointLight(0xffce88,19,17,1.8);conservatoryGlow.position.set(-9.2,2.1,-2.8);root.add(conservatoryGlow);
  const stairY=ground(-13.48,-3.17)+.21;
  const board=box(wood,[1.54,.055,.26],[-13.48,stairY,-3.17]);board.name='obj.treehouse.first_board';
  const boardMark=box(brass,[.21,.003,.11],[-13.48,stairY+.029,-3.17]);
  const grounds={stairs:[-16.25,ground(-16.25,-3.2),-3.2],other:[-18.7,ground(-18.7,-7),-7],doorway:[-13.8,ground(-13.8,-3.7),-3.7],workshop:[-17.7,ground(-17.7,12),12]};
  const source={tap:[cx+contactOffset,hingeY-Math.cos(.52)*1.05,cz],creak:[-13.48,stairY,-3.17]};
  let active=false,state=null,run=null,lastPulse=0;
  function resetPose(){pivot.rotation.z=0;board.position.y=stairY;board.rotation.x=0;boardMark.position.y=stairY+.029;lastPulse=0;}
  function stop(){if(run){const resolve=run.resolve;run=null;resetPose();resolve(false);}return false;}
  function setState(value){state=value;active=!!value;root.visible=active;if(!active)stop();plate.position.x=cx+contactOffset+(state?.separated?.45:0);resetPose();}
  function start(options={},onEvent=()=>{}){
    stop();if(!active)return Promise.resolve(false);
    const config={held:!!options.held,separated:!!options.separated,board:!!options.board};
    plate.position.x=cx+contactOffset+(config.separated?.45:0);
    const events=[...(!config.held&&!config.separated?NIGHT_TAPS.map(time=>({time,kind:'tap'})):[]),...NIGHT_CREAKS.map(time=>({time,kind:'creak'}))].sort((a,b)=>a.time-b.time);
    return new Promise(resolve=>{run={config,onEvent,resolve,time:0,index:0,events};});
  }
  function update(dt){
    if(!run)return false;
    const current=run;current.time=Math.min(NIGHT_SEQUENCE_SECONDS,current.time+Math.max(0,Math.min(.12,dt)));const t=current.time;
    const arc=Math.max(0,...NIGHT_TAPS.map(at=>Math.abs(t-at)<.34?.52*Math.cos((t-at)*Math.PI/.68):0));
    pivot.rotation.z=current.config.held?0:arc;
    const pulse=Math.max(0,...NIGHT_CREAKS.map(at=>Math.abs(t-at)<.32?Math.cos((t-at)*Math.PI/.64):0));
    board.position.y=stairY-.022*pulse;board.rotation.x=.018*pulse;boardMark.position.y=board.position.y+.029;lastPulse=pulse;
    while(current.index<current.events.length&&current.events[current.index].time<=t){const event=current.events[current.index++];current.onEvent({...event,position:[...source[event.kind]],gain:1,pan:event.kind==='tap'?.3:-.35});}
    if(t===NIGHT_SEQUENCE_SECONDS){run=null;resetPose();current.resolve(true);}
    return true;
  }
  return {root,pivot,plate,board,lamp,wall,gripTarget,grounds,source,hingeY,groundY:gy,center:[cx,gy+1.6,cz],
    setState,start,stop,update,get running(){return !!run;},get boardPulse(){return lastPulse;},get sequenceConfig(){return run?.config||null;},
    dispose(){stop();scene.remove(root);lamp.shadow.dispose();for(const r of resources)r.dispose();}};
}
