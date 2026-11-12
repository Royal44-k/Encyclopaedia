import * as THREE from 'three';
import topology from './human-topology.json' with { type: 'json' };

// Anatomical head/hand surfaces derived from MakeHuman hm08 (CC0).
// All clothed bodies, hair, accessories and character-specific alterations are authored here.
const V = (x,y,z) => new THREE.Vector3(x,y,z);
const profiles = {
  Noor: { skin:0xb78b70, coat:0x344c60, inner:0xd6c7a8, trousers:0x4b504b, hair:0x292522, scale:.95, width:.90, face:[.98,.98,1], phase:.3, bag:0xa97745 },
  Rowan:{ skin:0xa87859, coat:0x52664a, inner:0xd1c7ac, trousers:0x4b4a3e, hair:0x392c24, scale:1.055, width:1.03, face:[1.03,1.04,1], phase:1.4 },
  Mei:  { skin:0xc99f81, coat:0x798879, inner:0xe0d8c7, trousers:0x9c876c, hair:0x252420, scale:1, width:.94, face:[.95,.98,.98], phase:2.2 },
  Sam:  { skin:0xb98b70, coat:0x4d5c43, inner:0xddd1b9, trousers:0x4c473e, hair:0x514137, scale:1.06, width:1.14, face:[1.09,1.02,1.04], phase:3.1 },
  Iris: { skin:0xc39a7b, coat:0x647c8b, inner:0xe3d3b5, trousers:0x48534b, hair:0x3d2c25, scale:.96, width:.89, face:[.94,.97,.97], phase:4.1, bag:0x876f52 },
};

function loftGeometry(profile, sides=24) {
  const positions=[],uvs=[],indices=[];
  for(let j=0;j<profile.length;j++) {
    const [y,rx,rz,cz=0,cx=0]=profile[j];
    for(let i=0;i<=sides;i++) {
      const a=i/sides*Math.PI*2;
      positions.push(cx+Math.cos(a)*rx,y,cz+Math.sin(a)*rz);
      uvs.push(i/sides,j/(profile.length-1));
      if(j&&i){const b=j*(sides+1)+i;indices.push(b,b-1,b-sides-2,b,b-sides-2,b-sides-1);}
    }
  }
  for(const end of [0,profile.length-1]){const [y,rx,rz,cz=0,cx=0]=profile[end];const c=positions.length/3;positions.push(cx,y,cz);uvs.push(.5,.5);for(let i=0;i<sides;i++){const a=end*(sides+1)+i;end===0?indices.push(c,a+1,a):indices.push(c,a,a+1);}}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  if(profile[1][0]>profile[0][0])for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();
  return g;
}

function surfaceTexture(resources) {
  if(typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  const pixels=ctx.createImageData(128,128);
  let seed=731;
  for(let i=0;i<128*128;i++) {seed=(seed*1664525+1013904223)>>>0;const n=120+(seed>>>28)*1.5+(i%2)*4;pixels.data.set([n,n,n,255],i*4);}
  ctx.putImageData(pixels,0,0);
  const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(12,12);resources.add(texture);return texture;
}

export function createCast(scene, resources=new Set()) {
  const weave=surfaceTexture(resources);
  const hairWeave=(()=>{if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');if(!ctx)return null;ctx.fillStyle='#999';ctx.fillRect(0,0,512,256);for(let i=0;i<210;i++){ctx.strokeStyle=`rgb(${65+i%90},${65+i%90},${65+i%90})`;ctx.lineWidth=.5+(i%3)*.3;ctx.beginPath();const x=i*2.43;ctx.moveTo(x,0);ctx.bezierCurveTo(x+5,70,x-4,170,x+3,256);ctx.stroke();}const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;resources.add(t);return t;})();
  function material(color,opts={}) {const m=new THREE.MeshStandardMaterial({color,roughness:.87,...opts});resources.add(m);return m;}
  function mesh(parent,geometry,mat,position=[0,0,0],scale) {
    resources.add(geometry);const m=new THREE.Mesh(geometry,mat);m.position.set(...position);if(scale)m.scale.set(...scale);
    m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }
  const sphere=new THREE.SphereGeometry(1,24,16);resources.add(sphere);
  const rounded=(parent,mat,scale,position)=>mesh(parent,sphere,mat,position,scale);
  function panel(parent,mat,points,depth=.003) {
    const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.002,bevelSize:.002,bevelSegments:2,steps:1});
    return mesh(parent,geo,mat);
  }
  function cord(parent,mat,points,radius=.003) {
    return mesh(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>V(...p))),Math.max(8,points.length*5),radius,6,false),mat);
  }
  function headSurface(p) {
    const g=new THREE.BufferGeometry();const pos=topology.head.positions.map((v,i)=>v*p.face[i%3]);
    if(p===profiles.Mei)for(let i=0;i<pos.length;i+=3){const x=pos[i],y=pos[i+1],z=pos[i+2];const jaw=1-THREE.MathUtils.smoothstep(y,.075,.14);pos[i]*=1-jaw*.10;pos[i+2]-=.003*Math.exp(-((x/.025)**2+((y-.143)/.026)**2));if(y<.13)pos[i+2]-=.002*jaw;}
    if(p===profiles.Noor)for(let i=0;i<pos.length;i+=3){const y=pos[i+1];pos[i]*=1-.04*(1-THREE.MathUtils.smoothstep(y,.085,.15));}
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(topology.head.indices);g.computeVertexNormals();
    const skin=new THREE.Color(p.skin), lip=new THREE.Color(p.skin).multiplyScalar(.67);lip.r*=1.13;
    const colors=[];
    for(let i=0;i<pos.length;i+=3){const x=pos[i],y=pos[i+1],z=pos[i+2];const c=skin.clone();
      const mouth=Math.exp(-((x/.039)**4+((y-.094)/.012)**4))*Math.max(0,Math.min(1,(z-.115)*45));
      c.lerp(lip,mouth*.62);if(p===profiles.Sam){const beard=THREE.MathUtils.smoothstep(y,.04,.065)*(1-THREE.MathUtils.smoothstep(y,.095,.133))*THREE.MathUtils.smoothstep(z,.04,.12);c.lerp(new THREE.Color(0x5c4b3e),beard*.24);}const warmth=Math.exp(-(((Math.abs(x)-.053)/.028)**2+((y-.135)/.021)**2))*Math.max(0,(z-.07)*5);c.r+=warmth*.018;
      colors.push(c.r,c.g,c.b);
    }
    g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));return g;
  }
  function hairSurface(p,name) {
    const original=topology.head.positions;
    const base=new THREE.BufferGeometry();base.setAttribute('position',new THREE.Float32BufferAttribute(original,3));base.setIndex(topology.head.indices);base.computeVertexNormals();
    const baseNormals=base.getAttribute('normal');const positions=[],normals=[],uvs=[];
    const boundary=(v)=>{
      const front=THREE.MathUtils.smoothstep(v.z,-.015,.095);let hairline;
      if(name==='Iris')hairline=.200+.012*Math.sin((v.x-.02)*32);
      else if(name==='Mei')hairline=.207+.024*Math.sin((v.x+.023)*20);
      else if(name==='Noor')hairline=.194+.009*Math.sin(v.x*58)+.007*Math.sin(v.x*103);
      else if(name==='Sam')hairline=.221+Math.min(.023,Math.abs(v.x)*.32)+.003*Math.sin(v.x*17);
      else hairline=.214+.0025*Math.sin(v.x*165);
      return v.y-THREE.MathUtils.lerp(name==='Iris'?.045:name==='Mei'?.105:.145,hairline,front);
    };
    function mix(a,b,t){return {x:THREE.MathUtils.lerp(a.x,b.x,t),y:THREE.MathUtils.lerp(a.y,b.y,t),z:THREE.MathUtils.lerp(a.z,b.z,t),normal:a.normal.clone().lerp(b.normal,t).normalize()};}
    for(let i=0;i<topology.head.indices.length;i+=3){
      let poly=topology.head.indices.slice(i,i+3).map(id=>({x:original[id*3],y:original[id*3+1],z:original[id*3+2],normal:V(baseNormals.getX(id),baseNormals.getY(id),baseNormals.getZ(id))}));
      const clipped=[];for(let j=0;j<poly.length;j++){const a=poly[j],b=poly[(j+1)%poly.length],fa=boundary(a),fb=boundary(b);if(fa>=0)clipped.push(a);if((fa>=0)!==(fb>=0))clipped.push(mix(a,b,fa/(fa-fb)));}poly=clipped;
      for(let j=1;j<poly.length-1;j++)for(const v of [poly[0],poly[j],poly[j+1]]){
        const lift=name==='Noor'?.012:name==='Mei'?.005:name==='Rowan'?.0038:.0025;
        positions.push((v.x+v.normal.x*lift)*p.face[0],(v.y+v.normal.y*lift)*p.face[1],(v.z+v.normal.z*lift)*p.face[2]);normals.push(...v.normal.toArray());uvs.push(Math.atan2(v.x,v.z-.018)/(Math.PI*2)+.5,v.y/.29);
      }
    }
    base.dispose();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));return g;
  }

  return Object.fromEntries(Object.entries(profiles).map(([name,p])=>{
    const group=new THREE.Group();group.name=`cast.${name}`;group.scale.setScalar(p.scale);scene.add(group);
    const torso=new THREE.Group();group.add(torso);
    const cloth=material(p.coat,{bumpMap:weave,bumpScale:.0012});
    const inner=material(p.inner,{bumpMap:weave,bumpScale:.0007});
    const trousers=material(p.trousers,{bumpMap:weave,bumpScale:.0009});
    const skin=material(p.skin,{roughness:.61});const faceMat=material(0xffffff,{roughness:.64,vertexColors:true});
    const hair=material(p.hair,{roughness:.76,bumpMap:hairWeave,bumpScale:.0018});const seam=material(new THREE.Color(p.coat).multiplyScalar(.67));
    const boot=material(name==='Noor'?0x524c45:0x3b352e);const sole=material(0x272b27);const thread=material(0xbab19c);
    const w=p.width;
    mesh(torso,loftGeometry([[.88,.146*w,.094],[.94,.15*w,.108],[1.02,.14*w,.102],[1.13,.145*w,.106],[1.25,.173*w,.117],[1.34,.19*w,.103],[1.39,.187*w,.087],[1.425,.125*w,.070],[1.445,.065,.057]]),cloth);
    mesh(torso,loftGeometry([[1.37,.06,.052],[1.45,.054,.052],[1.48,.048,.048]]),skin);
    const opening=panel(torso,inner,[[-.048,1.425],[.048,1.425],[.02,1.32],[-.02,1.32]]);opening.position.z=.11;
    for(const s of [-1,1]) {
      const collar=panel(torso,cloth,[[s*.045,1.43],[s*.10,1.40],[s*.065,1.31],[s*.025,1.37]]);collar.position.z=.108;
      const pocket=panel(torso,cloth,[[s*.075-.036,1.27],[s*.075+.036,1.27],[s*.075+.033,1.19],[s*.075-.033,1.19]]);pocket.position.z=.117;
      cord(torso,seam,[[s*.04,1.24,.121],[s*.11,1.24,.121]],.0009);
    }
    for(let i=0;i<5;i++)rounded(torso,thread,[.0033,.0033,.002],[.006,1.28-i*.073,.117]);
    cord(torso,seam,[[-.135*w,.91,.065],[0,.9,.102],[.135*w,.91,.065]],.0015);
    if(name==='Sam') {
      const apronMat=material(0xb0a087,{bumpMap:weave,bumpScale:.0013});
      const apron=panel(torso,apronMat,[[-.095,1.30],[.095,1.30],[.146,.76],[-.146,.76]]);apron.position.z=.127;
      cord(torso,apronMat,[[-.082,1.29,.13],[-.065,1.41,-.02],[.065,1.41,-.02],[.082,1.29,.13]],.009);
      const pocket=panel(torso,apronMat,[[-.10,1.06],[.10,1.06],[.095,.94],[-.095,.94]]);pocket.position.z=.137;
      cord(torso,material(0xb89142),[[.056,1.03,.147],[.058,1.12,.143]],.003);
    }
    if(name==='Noor'||name==='Rowan'||name==='Iris'){
      const leather=material(name==='Noor'||name==='Iris'?p.bag:0x75664c);
      cord(torso,leather,[[-.15,1.39,.065],[-.05,1.21,.13],[.16,.98,.09]],.013);
      const bag=mesh(torso,new THREE.BoxGeometry(.15,.19,.065,3,3,2),leather,[.16,.97,.06]);bag.rotation.z=-.12;
      rounded(torso,leather,[.082,.033,.039],[.157,1.067,.065]);
      if(name==='Noor'){
        const camera=mesh(torso,new THREE.BoxGeometry(.075,.044,.028),sole,[.16,1.02,.113]);
        const lens=mesh(camera,new THREE.CylinderGeometry(.014,.017,.014,18),boot,[0,0,.023]);lens.rotation.x=Math.PI/2;
      }else{
        const book=mesh(torso,new THREE.BoxGeometry(.103,.144,.021),material(0xbcae87),[.19,.91,.102]);book.rotation.z=-.14;
      }
    }
    const head=new THREE.Group();head.position.set(0,1.425,-.018);torso.add(head);
    mesh(head,headSurface(p),faceMat);
    mesh(head,hairSurface(p,name),hair);
    if(name==='Mei'){
      rounded(head,hair,[.047,.042,.039],[0,.16,-.080]);
      cord(head,hair,[[-.037,.17,-.09],[0,.19,-.119],[.037,.17,-.09],[0,.133,-.11]],.003);
    }
    const lids=[];
    for(const side of [-1,1]){
      const eyeCenter=[side*.031*p.face[0],.159*p.face[1],.124*p.face[2]];
      const eye=rounded(head,material(0xe5dfd3,{roughness:.4}),[.0137,.012,.0137],eyeCenter);
      rounded(eye,material(name==='Mei'?0x4c4231:0x544e38,{roughness:.48}),[.0067/.0137,.0067/.012,.002/.0137],[0,-.07,1]);
      // Eye child coordinates inherit sphere scale; iris and pupil remain anatomically small.
      rounded(eye,material(0x151b19,{roughness:.2}),[.0027/.0137,.0027/.012,.0015/.0137],[0,-.07,1.10]);
      mesh(head,new THREE.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI*.35),skin,eyeCenter,[.0141,.0132,.0141]);
      const lid=rounded(head,skin,[.0142,.001,.0142],eyeCenter);lid.visible=false;lids.push(lid);
      cord(head,hair,[[side*.015,.179,.149],[side*.032,.182,.146],[side*.052,.176,.129]],.00075);
    }
    const arms=[],legs=[],elbows=[],knees=[],palms=[];
    for(const side of [-1,1]) {
      const leg=new THREE.Group();leg.position.set(side*.084*w,.904,0);group.add(leg);legs.push(leg);
      const hip=new THREE.Bone();const knee=new THREE.Bone();knee.position.y=-.43;hip.add(knee);knees.push(knee);
      const pantsGeometry=loftGeometry([[0,.087*w,.089],[-.06,.087*w,.086],[-.22,.074*w,.078],[-.37,.061,.068],[-.45,.060,.064],[-.51,.064,.062],[-.66,.048,.049],[-.80,.043,.044],[-.825,.044,.044]]);
      const skinIndices=[],weights=[];const pantsVertices=pantsGeometry.getAttribute('position');
      for(let k=0;k<pantsVertices.count;k++){const influence=THREE.MathUtils.smoothstep(-pantsVertices.getY(k),.35,.50);skinIndices.push(0,1,0,0);weights.push(1-influence,influence,0,0);}
      pantsGeometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(skinIndices,4));pantsGeometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));resources.add(pantsGeometry);
      const pantsMesh=new THREE.SkinnedMesh(pantsGeometry,trousers);pantsMesh.castShadow=true;pantsMesh.receiveShadow=true;pantsMesh.add(hip);leg.add(pantsMesh);group.updateMatrixWorld(true);const skeleton=new THREE.Skeleton([hip,knee]);pantsMesh.bind(skeleton);resources.add(skeleton);
      cord(knee,seam,[[side*.046,-.08,.032],[side*.04,-.23,.031],[side*.037,-.37,.029]],.0012);
      rounded(knee,boot,[.048,.054,.105],[0,-.415,.032]);
      rounded(knee,sole,[.05,.018,.108],[0,-.456,.035]);
      for(let j=0;j<3;j++)cord(knee,thread,[[-.024,-.39-j*.012,.086],[.024,-.39-j*.012,.086]],.0015);
      const arm=new THREE.Group();arm.position.set(side*.182*w,1.335,0);arm.rotation.z=side*.085;torso.add(arm);arms.push(arm);
      mesh(arm,loftGeometry([[.05,.01,.02],[.035,.035,.039],[.005,.057,.059],[-.045,.059,.058],[-.17,.052,.052],[-.285,.044,.047]]),cloth);
      const elbow=new THREE.Group();elbow.position.y=-.275;elbow.rotation.x=-.11;arm.add(elbow);elbows.push(elbow);
      mesh(elbow,loftGeometry([[.02,.047,.048],[-.06,.048,.045],[-.13,.043,.041],[-.15,.044,.043]]),cloth);
      mesh(elbow,loftGeometry([[-.14,.036,.035],[-.21,.028,.031],[-.267,.025,.026]]),skin);
      cord(elbow,seam,[[-.042,-.135,.012],[0,-.139,.044],[.042,-.135,.012]],.0022);
      const handGeometry=new THREE.BufferGeometry();const handPositions=[];
      const q=new THREE.Quaternion().setFromUnitVectors(V(.45,-1.15,1.26).normalize(),V(0,-1,0));
      for(let k=0;k<topology.hand.positions.length;k+=3){const pt=V(...topology.hand.positions.slice(k,k+3)).applyQuaternion(q);handPositions.push(pt.x*side,pt.y,pt.z);}
      let ids=[...topology.hand.indices];if(side<0)for(let k=0;k<ids.length;k+=3)[ids[k+1],ids[k+2]]=[ids[k+2],ids[k+1]];
      handGeometry.setAttribute('position',new THREE.Float32BufferAttribute(handPositions,3));handGeometry.setIndex(ids);handGeometry.computeVertexNormals();
      mesh(elbow,handGeometry,skin,[0,-.26,0]);
      const palm=new THREE.Object3D();palm.name=`${name}.palm.${side}`;palm.position.set(0,-.335,.012);elbow.add(palm);palms.push(palm);
    }
    return [name,{group,torso,head,arms,legs,elbows,knees,palms,lids,phase:p.phase,speaking:false,location:null,stage:null}];
  }));
}

export function animateCharacter(actor,stride=0,time=0) {
  const step=Math.sin(time*7.6)*stride;
  actor.arms.forEach((arm,i)=>arm.rotation.set(0,0,(i===0?-1:1)*.085));
  actor.elbows.forEach(elbow=>elbow.rotation.set(0,0,0));
  actor.torso.rotation.x=0;
  actor.legs[0].rotation.x=step;actor.legs[1].rotation.x=-step;
  actor.knees[0].rotation.x=Math.max(0,-step)*.75;actor.knees[1].rotation.x=Math.max(0,step)*.75;
  actor.arms[0].rotation.x=-step*.6;actor.arms[1].rotation.x=step*.6;
  actor.elbows[0].rotation.x=-.11-Math.abs(step)*.24;actor.elbows[1].rotation.x=-.11-Math.abs(step)*.24;
  actor.torso.position.y=Math.abs(step)*.018+Math.sin(time*1.65+actor.phase)*.0014;
  actor.torso.rotation.z=Math.sin(time*7.6)*stride*.018;
  actor.head.rotation.y=Math.sin(time*.35+actor.phase)*.035;
  actor.head.rotation.x=actor.speaking?Math.sin(time*5+actor.phase)*.017:-.015;
  if(!stride&&actor.speaking){actor.arms[1].rotation.x=-.13-Math.sin(time*2.1)*.06;actor.elbows[1].rotation.x=-.28-Math.sin(time*2.1)*.08;}
  const blink=(time+actor.phase)%4.9;for(const lid of actor.lids){lid.visible=blink>.04&&blink<.16;lid.scale.y=blink<.1?.008:.004;}
}
