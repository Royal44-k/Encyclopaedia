const escapeText=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createSceneMedia() {
 const previews={};
 let prepared=false;
 function prepare(valley) {
  if(prepared)return;
  for(const kind of ['bridge_before','bridge_now','upper','path']) {
   const image=valley.captureEvidence(kind);
   if(image)previews[kind]=image;
  }
  prepared=Boolean(previews.bridge_now);
  valley.setStoryImages?.({...previews,material:'/illustrations/material-cover-v2.png'});
 }
 function card(node,fields,media={}) {
  if(['j.materials','j.placement'].includes(node))return `<figure class="scene-picture material-picture"><button data-action="material-study" aria-label="Open the material study"><img src="/illustrations/material-cover-v2.png" alt="A tan woven plant-fibre cover and four flat weighting stones on a potting bench"/></button><figcaption><strong>A closer look at the cover</strong><span>Material illustration · not an observation</span></figcaption></figure>`;
  let kind,action,title;
  if(['j.bridge_record','j.bridge_hook'].includes(node)){kind='bridge_now';action='evidence-bridge';title='The east bridge · this visit';}
  if(node==='j.fieldwork'){
   const loc=fields['navigation.currentLocation'];
   if(loc==='loc.upper_stream'){kind='upper';action='evidence-upper';title='Upstream · the same round';}
   if(loc==='loc.bare_bed'){kind='path';action='evidence-path';title='The soil, the channel, the stream';}
  }
  if(!kind)return '';
  const key=kind==='bridge_now'?'record.bridge.current_round.v1':kind==='upper'?'record.upper.current_round.v1':'record.bare_bed.path.v1';
  const src=media[key]?.image||previews[kind];
  if(!src)return '';
  return `<figure class="scene-picture"><button data-action="${action}" aria-label="Open ${escapeText(title)}"><img src="${src}" alt="${escapeText(title)}"/></button><figcaption><strong>${title}</strong><span>Open the full record to look closely</span></figcaption></figure>`;
 }
 return {prepare,card,getPreviews:()=>({...previews})};
}
