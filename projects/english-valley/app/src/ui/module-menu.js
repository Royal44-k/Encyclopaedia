import { moduleRegistry } from '../content/module-registry.js';
import './module-menu.css';

const escape = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function openModuleMenu(current = 'C1') {
  document.querySelector('#module-menu')?.remove();
  const dialog = document.createElement('dialog');
  dialog.id = 'module-menu'; dialog.className = 'valley-dialog module-menu';
  dialog.setAttribute('aria-labelledby','module-menu-title');
  dialog.innerHTML = `<form method="dialog"><button class="dialog-close" aria-label="Close chapter menu">×</button></form><div class="eyebrow">One valley · many stories</div><h2 id="module-menu-title">Choose a place to begin.</h2><p class="lead">同一个山谷，不同的故事。切换章节会保留已保存的进度与作品。</p><div class="module-grid">${moduleRegistry.map(item => `<article class="module-card ${item.status==='playable'?'available':''}"><span class="module-id">${escape(item.id==='C1'?'T03 · C1':item.id)}${item.id===current?' · 当前章节':''}</span><h3>${escape(item.title)}</h3><p>${escape(item.subtitle)}</p>${item.status==='playable'?`<a href="${escape(item.href)}" class="module-enter">${item.id===current?'重新进入':'进入故事'} <span aria-hidden="true">↗</span></a>`:'<span class="module-planned">方案已设计 · 尚未开放</span>'}</article>`).join('')}</div><p class="fine">当前开放${moduleRegistry.filter(item=>item.status==='playable').length}个模块；T03完整游园与其余故事按制作计划陆续推进。每章的借展、拍摄等许可仍由作者另行决定。</p>`;
  document.body.append(dialog); dialog.addEventListener('close', () => dialog.remove()); dialog.showModal();
}
