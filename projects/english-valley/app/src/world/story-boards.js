/** Physical image boards. Pictures illustrate the visit but never commit evidence. */
export function createStoryBoards(THREE, parent, groundHeight, register) {
 const group=new THREE.Group();group.name='story-boards';parent.add(group);
 const materials=[],textures=[],boards=[];
 const wood=new THREE.MeshStandardMaterial({color:0x71543d,roughness:.87});materials.push(wood);
 const paper=new THREE.MeshStandardMaterial({color:0xf0e8cf,roughness:.93});materials.push(paper);
 const box=(p,size,pos,mat=wood)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;p.add(m);return m;};
 function board({x,z,angle,title,caption,keys,action,location}) {
  const stand=new THREE.Group();stand.position.set(x,groundHeight(x,z),z);stand.rotation.y=angle;group.add(stand);
  for(const side of [-1,1])box(stand,[.065,1.4,.065],[side*.49,.7,0]);
  box(stand,[1.25,.83,.065],[0,1.26,0]);
  const canvas=globalThis.document?.createElement('canvas');
  let texture,ctx;
  if(canvas){canvas.width=1024;canvas.height=680;ctx=canvas.getContext('2d');texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;textures.push(texture);}
  const face=new THREE.Mesh(new THREE.PlaneGeometry(1.16,.75),texture?new THREE.MeshStandardMaterial({map:texture,roughness:1}):paper);
  if(texture)materials.push(face.material);
  face.position.set(0,1.26,.036);stand.add(face);register(face,action,location);
  boards.push({canvas,ctx,texture,title,caption,keys});
 }
 board({x:25.7,z:26.6,angle:-.12,title:'THE EAST BRIDGE',caption:'Same viewpoint / two moments',keys:['bridge_before','bridge_now'],action:'evidence_bridge',location:'loc.stream_bridge'});
 board({x:26.7,z:1.4,angle:.18,title:'FURTHER UPSTREAM',caption:'A second place to look closely',keys:['upper'],action:'evidence_upper',location:'loc.upper_stream'});
 board({x:33.45,z:15.2,angle:-.75,title:'THE COVER',caption:'Material illustration / look at the weave',keys:['material'],action:'material_study',location:'loc.bare_bed'});
 // A visible destination for the bottle rather than an unexplained disappearance.
 const basket=new THREE.Group();basket.name='obj.litter.container';basket.position.set(16.15,groundHeight(16.15,25.8)+.21,25.8);parent.add(basket);
 for(let i=0;i<16;i++){
  const a=i*Math.PI/8;const slat=box(basket,[.045,.42,.025],[Math.sin(a)*.2,0,Math.cos(a)*.2]);slat.rotation.y=a;
 }
 for(const y of [-.17,.17]){const hoop=new THREE.Mesh(new THREE.TorusGeometry(.208,.012,6,32),wood);hoop.rotation.x=Math.PI/2;hoop.position.y=y;basket.add(hoop);}
 box(basket,[.33,.025,.33],[0,-.2,0]);
 const loaded=new Map();let disposed=false;
 const load=src=>{if(!loaded.has(src))loaded.set(src,new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=src;}));return loaded.get(src);};
 async function setImages(images) {
  await Promise.all(boards.map(async b=>{
   if(!b.ctx)return;
   const imgs=await Promise.all(b.keys.map(k=>images[k]?load(images[k]):null));if(disposed)return;
   const c=b.ctx;c.fillStyle='#ece5d1';c.fillRect(0,0,1024,680);
   c.fillStyle='#42533e';c.font='600 40px Georgia';c.fillText(b.title,48,72);
   c.fillStyle='#9b957d';c.fillRect(48,96,928,2);
   const width=(928-(imgs.length-1)*18)/imgs.length;
   imgs.forEach((img,i)=>{const x=48+i*(width+18),y=122,h=430;c.fillStyle='#c5c6ac';c.fillRect(x,y,width,h);if(img){const r=Math.max(width/img.width,h/img.height),sw=width/r,sh=h/r;c.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,x,y,width,h);}c.strokeStyle='#fff9';c.lineWidth=8;c.strokeRect(x,y,width,h);});
   c.fillStyle='#66705a';c.font='25px Georgia';c.fillText(b.caption,48,605,928);
   c.font='18px system-ui';c.fillText('ENGLISH VALLEY / FIELD NOTES',48,647);b.texture.needsUpdate=true;
  }));
 }
 function dispose(){disposed=true;for(const t of textures)t.dispose();for(const m of materials)m.dispose();loaded.clear();}
 return {group,setImages,dispose};
}
