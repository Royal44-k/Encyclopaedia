import * as THREE from 'three';

// T01 is built at the existing west workshop. One artwork group travels to its
// display stand; photographs and future chapters use this same object.
export function createWorkshop(scene, ground = () => 0) {
  const resources = new Set(), targets = [];
  const root = new THREE.Group();root.name='t01.workshop';scene.add(root);
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  function mat(color, options={}) {const m=new THREE.MeshStandardMaterial({color,roughness:.65,...options});resources.add(m);return m;}
  function mesh(parent,geo,material,p=[0,0,0],r=[0,0,0]) {resources.add(geo);const m=new THREE.Mesh(geo,material);m.position.set(...p);m.rotation.set(...r);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(parent,material,size,p,r){return mesh(parent,new THREE.BoxGeometry(...size),material,p,r);}
  function tube(parent,material,pts,r=.008){return mesh(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>V(...p))),24,r,8,false),material);}
  function cylinder(parent,material,rt,rb,h,p,r){return mesh(parent,new THREE.CylinderGeometry(rt,rb,h,40),material,p,r);}
  function texture(kind){
    const n=128,data=new Uint8Array(n*n*4);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      const grain=kind==='cloth'?12*((x%4===0?1:0)+(y%4===0?1:0)):18*Math.sin(x*.46+Math.sin(y*.049)*2)+7*Math.sin(x*1.1+y*.07);
      const c=190+grain+5*Math.sin(x*17+y*31);data.set([c,c,c,255],(x+y*n)*4);
    }
    const t=new THREE.DataTexture(data,n,n);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;resources.add(t);return t;
  }
  const woodMap=texture('wood'), clothMap=texture('cloth');
  const wood=mat(0xb18453,{map:woodMap,bumpMap:woodMap,bumpScale:.008});
  const darkwood=mat(0x715139,{map:woodMap,bumpMap:woodMap,bumpScale:.005});
  const metal=mat(0x858f86,{metalness:.82,roughness:.29});
  const brass=mat(0xb39150,{metalness:.7,roughness:.32});
  const ink=mat(0x374b43,{roughness:.85});
  const paper=mat(0xe5d8ba,{roughness:.93,side:THREE.DoubleSide});
  const cloth=mat(0x7d8f8a,{map:clothMap,bumpMap:clothMap,bumpScale:.0025,roughness:.99,side:THREE.DoubleSide});
  const x=-17.45,z=11.4,baseY=ground(x,z),top=baseY+.98;
  const bench=new THREE.Group();bench.position.set(x,baseY,z);root.add(bench);
  bench.name='obj.workshop.t01.table';
  // Separate planks, pegged legs, stretcher and end-grain. The bench is an
  // extension of the existing porch, not a second building or floating stage.
  for(let i=0;i<5;i++)box(bench,wood,[2.4,.085,.236],[0,.94,(i-2)*.241]);
  for(const dx of [-1.02,1.02])for(const dz of [-.43,.43]){
    box(bench,darkwood,[.10,.91,.11],[dx,.455,dz]);
    cylinder(bench,brass,.013,.013,.108,[dx,.84,dz],[0,0,Math.PI/2]);
  }
  box(bench,darkwood,[2.15,.095,.07],[0,.27,.34]);
  for(const dx of [-1.02,1.02])box(bench,darkwood,[.08,.12,1],[dx,.27,0]);
  // A shallow stock tray belongs to the bench. These loose materials are not
  // additional copies of the authored work or counted as committed parts.
  box(bench,darkwood,[.45,.035,.7],[-.91,1.0,0]);
  for(const dx of [-1.15,-.67])box(bench,wood,[.025,.08,.7],[dx,1.035,0]);
  for(const dz of [-.35,.35])box(bench,wood,[.5,.08,.025],[-.91,1.035,dz]);
  for(let i=0;i<3;i++)cylinder(bench,i===1?brass:metal,.045,.045,.018,[-.91+(i%2)*.09,1.04,-.15+i*.13]);
  box(bench,paper,[.33,.008,.29],[.88,.99,-.13],[0,-.2,0]);
  cylinder(bench,brass,.008,.008,.28,[.87,1.005,-.13],[Math.PI/2,0,.3]);

  const stands={};
  const locations={workshop:[x,top+.01,z],path:[-9.35,ground(-9.35,16.25)+.91,16.25],flower:[-5.9,ground(-5.9,20.5)+.91,20.5]};
  for(const place of ['path','flower']) {
    const [px,py,pz]=locations[place],stand=new THREE.Group();stand.position.set(px,py-.91,pz);stand.name=`t01.stand.${place}`;root.add(stand);stands[place]=stand;
    box(stand,wood,[.92,.065,.70],[0,.88,0]);
    for(const sx of [-.34,.34])for(const sz of [-.24,.24])box(stand,darkwood,[.07,.85,.07],[sx,.425,sz]);
    box(stand,darkwood,[.75,.07,.045],[0,.21,.24]);stand.visible=false;
  }
  const artwork=new THREE.Group();artwork.name='work.t01.player';root.add(artwork);
  box(artwork,darkwood,[.65,.062,.46],[0,.031,0]);
  // Slot and upright bearing remain part of the work when it is relocated.
  cylinder(artwork,brass,.065,.075,.025,[0,.074,0]);
  cylinder(artwork,metal,.018,.022,.31,[0,.24,0]);
  const pivot=new THREE.Group();pivot.position.set(0,.405,0);artwork.add(pivot);
  const body=new THREE.Group();body.name='work.t01.body';body.userData={action:'workshop_body',locationId:'loc.workshop'};pivot.add(body);targets.push(body);
  const accent=new THREE.Group();accent.name='work.t01.accent';accent.userData={action:'workshop_accent',locationId:'loc.workshop'};pivot.add(accent);targets.push(accent);
  const bearing=cylinder(artwork,brass,.038,.038,.085,[0,.405,0],[Math.PI/2,0,0]);
  const label=new THREE.Group();label.position.set(.13,.065,.32);label.rotation.x=-Math.PI/2;artwork.add(label);
  const labelMesh=mesh(label,new THREE.PlaneGeometry(.48,.18),paper,[0,0,0]);
  let labelTexture=null,labelMaterial=null;
  const bodies={};
  for(const name of ['ring','tin','branch']){const g=new THREE.Group();g.name=`body.${name}`;body.add(g);bodies[name]=g;g.visible=false;}
  // Radius .25, with the bottom touching the bearing at local y=0.
  const ring=mesh(bodies.ring,new THREE.TorusGeometry(.25,.017,16,96),metal,[0,.25,0]);
  for(let i=0;i<9;i++)mesh(bodies.ring,new THREE.TorusGeometry(.25,.0017,5,8, .045),brass,[0,.25,.014],[0,0,i*.67+.12]);
  const tin=cylinder(bodies.tin,metal,.166,.166,.30,[0,.17,0]);
  for(const y of [.027,.055,.135,.23,.31])mesh(bodies.tin,new THREE.TorusGeometry(.168,.0032,8,64),metal,[0,y,0],[Math.PI/2,0,0]);
  cylinder(bodies.tin,paper,.151,.151,.001,[0,.322,0]);
  const tinLabel=mesh(bodies.tin,new THREE.CylinderGeometry(.169,.169,.14,48,1,true),mat(0x647e74,{roughness:.9}),[0,.18,0]);
  tube(bodies.branch,darkwood,[[0,0,0],[-.025,.16,0],[.025,.34,.01],[.11,.51,0]],.023);
  tube(bodies.branch,darkwood,[[-.014,.18,0],[-.13,.31,.006],[-.20,.39,0]],.015);
  tube(bodies.branch,darkwood,[[.026,.35,.01],[.15,.38,.03],[.24,.40,.02]],.011);
  const accents={};
  for(const name of ['cap','cloth','fan']){const g=new THREE.Group();g.name=`accent.${name}`;accent.add(g);accents[name]=g;g.visible=false;}
  // All ornaments share a visible hanging eye rather than hovering.
  for(const g of Object.values(accents))tube(g,brass,[[0,0,0],[.006,-.05,0],[0,-.10,0]],.0025);
  const cap=cylinder(accents.cap,mat(0xa85d45,{metalness:.48,roughness:.43}),.064,.066,.021,[0,-.17,0],[Math.PI/2,0,0]);
  for(let i=0;i<20;i++){const a=i*Math.PI/10;cylinder(accents.cap,metal,.004,.004,.02,[Math.cos(a)*.064,-.17+Math.sin(a)*.064,0],[Math.PI/2,0,0]);}
  mesh(accents.cap,new THREE.TorusGeometry(.008,.0018,6,16),brass,[0,-.105,0]);
  const fabric=new THREE.PlaneGeometry(.26,.29,22,24);const fp=fabric.attributes.position;
  for(let i=0;i<fp.count;i++){const u=fp.getX(i),v=fp.getY(i),drop=.145-v;fp.setXYZ(i,u*(.4+.6*drop/.29),v-.245,.025*Math.sin(u*58)*(drop/.29)+.011*Math.cos(drop*21));}
  fabric.computeVertexNormals();mesh(accents.cloth,fabric,cloth);
  tube(accents.cloth,brass,[[-.035,-.102,.001],[0,-.087,0],[.035,-.102,.001]],.003);
  const fanPositions=[],fanIndices=[];
  for(let i=0;i<=16;i++){const a=-Math.PI*.35+i/16*Math.PI*.7;fanPositions.push(0,-.105,0,Math.sin(a)*.22,-.105-Math.cos(a)*.22,(i%2)*.024);if(i)fanIndices.push((i-1)*2,i*2-1,i*2+1);}
  const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(fanPositions,3));fg.setIndex(fanIndices);fg.computeVertexNormals();mesh(accents.fan,fg,paper);
  for(let i=0;i<=16;i+=2){const a=-Math.PI*.35+i/16*Math.PI*.7;tube(accents.fan,darkwood,[[0,-.105,0],[Math.sin(a)*.22,-.105-Math.cos(a)*.22,0]],.0014);}
  let state=null,active=false,phase=0,signature='',lastTitle='';
  function refreshLabel(title='') {
    if(title===lastTitle&&labelTexture)return;lastTitle=title;
    if(typeof document==='undefined')return;
    const c=document.createElement('canvas');c.width=768;c.height=288;const ctx=c.getContext('2d');if(!ctx)return;
    ctx.fillStyle='#eee6d1';ctx.fillRect(0,0,768,288);ctx.strokeStyle='#b1ad98';ctx.lineWidth=3;ctx.strokeRect(16,16,736,256);
    ctx.fillStyle='#354d40';ctx.font='22px sans-serif';ctx.fillText('A WORK IN THE VALLEY',40,65);ctx.font='38px Georgia';
    const s=title||' ';const words=s.split(/\s+/);let line='',y=130;
    for(const w of words){if(ctx.measureText(line+w).width>680&&line){ctx.fillText(line,40,y);line='';y+=48;}line+=w+' ';if(y>224)break;}ctx.fillText(line,40,y);
    if(!title){ctx.strokeStyle='#b7b59d';ctx.beginPath();ctx.moveTo(40,166);ctx.lineTo(610,166);ctx.stroke();}
    labelTexture?.dispose();labelTexture=new THREE.CanvasTexture(c);labelTexture.colorSpace=THREE.SRGBColorSpace;
    if(!labelMaterial){labelMaterial=mat(0xffffff,{side:THREE.DoubleSide});labelMesh.material=labelMaterial;}
    labelMaterial.map=labelTexture;labelMaterial.needsUpdate=true;
  }
  function setArtwork(value) {
    state=value||null;artwork.visible=!!value&&(active||value.status==='displayed'||value.status==='stored');
    if(!value){for(const s of Object.values(stands))s.visible=false;return;}
    const location=locations[value.location]?value.location:'workshop';
    artwork.position.set(...locations[location]);
    artwork.rotation.y=location==='flower'?Math.PI/2:0;
    // Both empty stands exist before the exhibition; the work itself remains a single object.
    for(const [id,stand] of Object.entries(stands))stand.visible=active||(id===location&&artwork.visible);
    for(const [id,g] of Object.entries(bodies))g.visible=id===value.parts?.body;
    for(const [id,g] of Object.entries(accents))g.visible=!!value.parts?.body&&id===value.parts?.accent;
    accent.position.set(value.parts?.body==='branch'?.11:0,value.parts?.body==='tin'?.32:.50,value.parts?.body==='tin'?.185:.025);
    bearing.visible=!!value.parts?.body;
    pivot.rotation.y=THREE.MathUtils.degToRad(Number(value.rotation)||0);
    pivot.rotation.z=0;
    const next=JSON.stringify([value.parts,value.joint]);if(next!==signature){phase=0;signature=next;}
    refreshLabel(value.title||'');
  }
  function setActive(value){active=!!value;setArtwork(state);}
  function update(dt,moving){
    if(!state||!active)return false;
    if(moving&&state.joint==='pivot'&&state.parts?.body&&state.parts.body!=='tin'){
      phase+=dt*1.25;pivot.rotation.y=THREE.MathUtils.degToRad(Number(state.rotation)||0)+Math.sin(phase)*.7;return true;
    }
    return false;
  }
  function focusPoint(){return artwork.position.clone().add(V(0,.45,0));}
  root.visible=true;artwork.visible=false;
  return {root,artwork,targets,locations,bench,setArtwork,setActive,update,focusPoint,
    getState:()=>state, dispose(){scene.remove(root);labelTexture?.dispose();for(const r of resources)r.dispose?.();}};
}
