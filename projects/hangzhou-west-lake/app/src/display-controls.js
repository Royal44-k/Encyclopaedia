export function setupDisplayControls({toast}){
 const root=document.documentElement;
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(root.requestFullscreen)await root.requestFullscreen({navigationUI:'hide'});else if(root.webkitRequestFullscreen)root.webkitRequestFullscreen();else throw Error('Unsupported');}catch{toast('当前窗口限制系统全屏。请在独立浏览器打开预览，再点「全屏」或按 F11。');}}
 function sync(){const active=!!(document.fullscreenElement||document.webkitFullscreenElement);document.querySelectorAll('[data-fullscreen]').forEach(b=>{b.setAttribute('aria-pressed',String(active));b.setAttribute('aria-label',active?'退出设备全屏':'进入设备全屏');b.title=active?'退出全屏（Esc）':'铺满设备屏幕';if(!b.id||b.id!=='fullscreen')b.textContent=active?'退出全屏':'全屏 ⛶';});}
 document.querySelectorAll('[data-fullscreen]').forEach(b=>b.onclick=fullscreen);document.addEventListener('fullscreenchange',sync);document.addEventListener('webkitfullscreenchange',sync);sync();
 document.body.insertAdjacentHTML('beforeend','<dialog id="panoramaDialog"><header><div><p class="eyebrow">全卷游目 · 今日杭州</p><h2>把一湖山水，看完整。</h2></div><button id="panoramaClose" aria-label="关闭全景">×</button></header><div class="panorama-strip"><img src="/assets/modern.webp" alt="完整现代西湖长卷"></div><footer><p>展卷全景显示整幅画面；设备全屏让浏览器铺满屏幕。</p><button id="panoramaFullscreen" class="primary" data-fullscreen>全屏 ⛶</button></footer></dialog>');
 const dialog=document.querySelector('#panoramaDialog');document.querySelector('#panoramaClose').onclick=()=>dialog.close();document.querySelector('#panoramaFullscreen').onclick=fullscreen;
 return {overview:()=>dialog.showModal(),fullscreen};
}
