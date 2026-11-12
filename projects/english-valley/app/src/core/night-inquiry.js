export const NIGHT_KEY='english-valley.night.v1';
const locations=['stairs','other','doorway','workshop'];
const clone=value=>structuredClone(value);
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const assert=(valid,message)=>{if(!valid)throw new Error(message);};
export function initialNightState(){return freeze({schemaVersion:1,revision:0,stage:'entry',location:'stairs',held:false,separated:false,boardTest:false,observations:[],testimony:{device:false,board:false,shadow:false},verified:{tap:false,board:false},note:'',outcome:null});}
export function deriveNightEvidence(observations){
  return {
    tap:observations.some(quiet=>['held','separated'].includes(quiet.kind)&&quiet.tapCount===0&&quiet.creakCount>0&&observations.some(base=>base.kind==='baseline'&&base.tapCount>0&&base.location===quiet.location)),
    board:observations.some(row=>row.kind==='board'&&row.board&&row.creakCount>0),
  };
}
const ending=v=>v.tap?(v.board?'both':'tapping'):'open';
function validateObservation(r,index){
  assert(r&&r.id===index+1&&locations.includes(r.location),'Invalid listening position or record identity.');
  assert(['baseline','held','separated','board'].includes(r.kind)&&r.conditions==='fixed-wind','Invalid comparison conditions.');
  for(const k of ['held','separated','board'])assert(typeof r[k]==='boolean','Invalid source state.');
  assert(Number.isInteger(r.tapCount)&&r.tapCount>=0&&r.tapCount<=5&&Number.isInteger(r.creakCount)&&r.creakCount===2,'The sequence did not produce its expected source events.');
  assert((r.held||r.separated)?r.tapCount===0:r.tapCount===5,'The observed taps do not match the apparatus.');
  assert(!(r.held&&r.separated)&&!(r.held&&r.board),'Contradictory source conditions.');
  if(r.kind==='baseline')assert(!r.held&&!r.separated&&!r.board,'This is not an unchanged baseline.');
  if(r.kind==='held')assert(r.held&&!r.separated&&!r.board,'Hold only one part for this comparison.');
  if(r.kind==='separated')assert(r.separated&&!r.held&&!r.board,'The separated comparison must leave the part free.');
  if(r.kind==='board')assert(r.board&&['stairs','other'].includes(r.location),'The board must be tested from a ground observation point.');
}
export function validateNightState(s){
  assert(s&&s.schemaVersion===1&&Number.isSafeInteger(s.revision)&&s.revision>=0,'Unsupported night record.');
  assert(['entry','explore','end'].includes(s.stage)&&locations.includes(s.location),'Invalid night scene.');
  for(const k of ['held','separated','boardTest'])assert(typeof s[k]==='boolean','Invalid apparatus setting.');
  assert(!(s.held&&s.separated),'The held comparison cannot also change the gap.');
  assert(!(s.held&&s.boardTest),'Sam must release the device before stepping on the board.');
  assert(Array.isArray(s.observations)&&s.observations.length<=120,'Invalid observation list.');s.observations.forEach(validateObservation);
  for(const k of ['device','board','shadow'])assert(typeof s.testimony?.[k]==='boolean','Invalid account record.');
  const v=deriveNightEvidence(s.observations);assert(s.verified?.tap===v.tap&&s.verified?.board===v.board,'Verified causes must follow recorded comparisons.');
  assert(typeof s.note==='string'&&s.note.length<=1800,'Keep the note within 1800 characters.');
  assert(s.stage==='end'?s.outcome===ending(v)&&!s.held:s.outcome===null,'The ending does not match the evidence.');
  if(s.stage==='entry')assert(s.observations.length===0&&s.revision===0,'An entry cannot contain a previous visit.');
  return s;
}
function transition(current,event,input){
  const s=clone(current),active=()=>assert(s.stage==='explore','Enter or resume the visit first.');
  const ground=()=>assert(['stairs','other'].includes(s.location),'Use a ground observation point beside the treehouse.');
  switch(event){
    case 'BEGIN':assert(s.stage==='entry','This visit has already begun.');s.stage='explore';break;
    case 'VISIT':active();assert(locations.includes(input.location),'Unknown listening position.');assert(!s.held||['stairs','other'].includes(input.location),'Release the part before leaving Sam at the apparatus.');s.location=input.location;s.boardTest=false;break;
    case 'HOLD':active();ground();assert(typeof input.value==='boolean','Choose whether to hold the part.');s.held=input.value;s.separated=false;s.boardTest=false;break;
    case 'SEPARATE':active();ground();assert(typeof input.value==='boolean','Choose the gap position.');s.separated=input.value;s.held=false;s.boardTest=false;break;
    case 'BOARD':active();ground();assert(typeof input.value==='boolean','Choose whether to test the board.');s.boardTest=input.value;if(input.value)s.held=false;break;
    case 'FACT_HEARD':
      active();assert(['device','board','shadow'].includes(input.fact),'Unknown account.');
      if(input.fact==='shadow')assert(s.location==='doorway','Ask Mei at her observation point.');
      if(input.fact==='board')ground();s.testimony[input.fact]=true;break;
    case 'RUN_COMPLETED':{
      active();assert(s.observations.length<120,'The observation notebook is full. Export it before starting another visit.');
      const row={id:s.observations.length+1,location:s.location,kind:input.kind,held:s.held,separated:s.separated,board:s.boardTest,tapCount:input.tapCount,creakCount:input.creakCount,conditions:'fixed-wind'};
      validateObservation(row,s.observations.length);s.observations.push(row);s.verified=deriveNightEvidence(s.observations);break;
    }
    case 'NOTE':assert(s.stage!=='entry','Enter the visit first.');assert(typeof input.text==='string'&&input.text.length<=1800,'Keep the note within 1800 characters.');s.note=input.text;break;
    case 'FINISH':active();s.stage='end';s.outcome=ending(s.verified);s.held=false;s.boardTest=false;break;
    case 'RESUME':assert(s.stage==='end','This visit is not paused.');s.stage='explore';s.outcome=null;break;
    default:throw new Error(`Unknown night action: ${event}`);
  }
  if(JSON.stringify(s)===JSON.stringify(current))return current;
  s.revision++;validateNightState(s);return freeze(s);
}
export function createNightStore(storage){
  let state=initialNightState(),raw=null,loadError=null;
  function retryLoad(){
    let value;try{value=storage.getItem(NIGHT_KEY);}catch{loadError=new Error('The night record could not be read. Retry without replacing it.');return;}
    raw=value;
    try{state=value===null?initialNightState():freeze(validateNightState(JSON.parse(value)));loadError=null;}catch{loadError=new Error('The night record could not be opened. Its original data has been kept.');}
  }
  function persist(next){
    let latest;try{latest=storage.getItem(NIGHT_KEY);}catch{throw new Error('The existing record could not be read. No changes have been saved.');}
    assert(latest===raw,'This visit was updated in another tab. Reload the record before making another change.');
    const text=JSON.stringify(next);try{storage.setItem(NIGHT_KEY,text);}catch{throw new Error('This change could not be saved. Your last saved record is unchanged. Retry the action.');}
    raw=text;state=next;return state;
  }
  retryLoad();
  return {get state(){return state;},get loadError(){return loadError;},get canRecover(){return !!loadError&&typeof raw==='string';},exportRaw:()=>raw,retryLoad,
    dispatch(event,input={}){assert(!loadError,loadError?.message);const next=transition(state,event,input);return next===state?state:persist(next);},
    recover(){assert(loadError&&typeof raw==='string','Read the original record before trying to archive it.');assert(storage.getItem(NIGHT_KEY)===raw,'The record changed. Reload it before archiving.');let archive=`${NIGHT_KEY}.recovery.${Date.now()}`;while(storage.getItem(archive)!==null)archive+='-';storage.setItem(archive,raw);persist(initialNightState());loadError=null;return state;},
  };
}
