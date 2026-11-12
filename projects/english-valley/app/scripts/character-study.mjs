import { chromium } from 'file:///C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--enable-unsafe-swiftshader']});
try {
 const page=await browser.newPage({viewport:{width:1600,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/character-study',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0"><canvas id="study" style="width:100vw;height:100vh"></canvas></body>'}));
 const origin=process.env.APP_URL||'http://127.0.0.1:5173';
 await page.goto(`${origin}/character-study`);
 const stats=await page.evaluate(async()=>{
  const THREE=await import('/node_modules/three/build/three.module.js');
  const {createCast,animateCharacter}=await import('/src/world/characters.js');
  const scene=new THREE.Scene();scene.background=new THREE.Color('#d6ddcd');
  const renderer=new THREE.WebGLRenderer({canvas:document.querySelector('canvas'),antialias:true});
  renderer.setSize(1600,1000);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  scene.add(new THREE.HemisphereLight(0xe3eaf3,0x78816b,1.2));
  const sun=new THREE.DirectionalLight(0xffe2c4,2.5);sun.position.set(3,8,5);scene.add(sun);
  const cast=createCast(scene);Object.entries(cast).forEach(([name,a],i)=>{a.group.position.x=(i-1.5)*1.05;a.group.rotation.y=-.13;animateCharacter(a,0,2);});
  const camera=new THREE.PerspectiveCamera(34,1.6,.05,50);camera.position.set(1.7,2.25,6.6);camera.lookAt(0,.97,0);renderer.render(scene,camera);
  window.study={scene,camera,renderer,cast,animateCharacter};return renderer.info.render;
 });
 await page.screenshot({path:'artifacts/characters-v2-study.png'});
 for(const name of ['Noor','Rowan','Mei','Sam']) {
  await page.evaluate(name=>{const {camera,renderer,scene,cast}=window.study;Object.values(cast).forEach(a=>a.group.visible=false);const a=cast[name];a.group.visible=true;const x=a.group.position.x,scale=a.group.scale.y;camera.position.set(x+.18,1.73*scale,.85*scale);camera.lookAt(x,1.58*scale,0);camera.fov=32;camera.updateProjectionMatrix();renderer.render(scene,camera)},name);
  await page.screenshot({path:`artifacts/characters-v2-${name.toLowerCase()}-close.png`});
 }
 await page.evaluate(()=>{const {scene,renderer}=window.study;scene.traverse(o=>{o.geometry?.dispose();});renderer.dispose();});
 await page.evaluate(async()=>{const {createValley}=await import('/src/world/renderer.js');await new Promise(resolve=>{window.valleyStudy=createValley(document.querySelector('canvas'),{onReady:resolve});});window.valleyStudy.setReducedMotion(true);await window.valleyStudy.goTo('model');window.valleyStudy.setModel({active:true,position:'source_cover_zone',running:false,progress:1});});
 await page.waitForTimeout(200);
 await page.screenshot({path:'artifacts/characters-v2-in-world.png'});
 await writeFile('artifacts/characters-v2-check.json',JSON.stringify({errors,isolatedCastStats:stats,scope:'Anatomical cast study and actual shared-world model camera; software renderer, not classroom performance benchmark'},null,2));
 console.log(JSON.stringify({stats,errors}));if(errors.length)process.exitCode=1;
}finally{await browser.close();}
