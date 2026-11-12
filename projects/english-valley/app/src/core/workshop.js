export const WORKSHOP_STORAGE_KEY = 'english-valley.workshop.v1';
const HISTORY_LIMIT = 32;
const bodies = [null, 'ring', 'tin', 'branch'];
const accents = [null, 'cap', 'cloth', 'fan'];
const stages = ['entry', 'make', 'share', 'label', 'place', 'visit', 'end'];
const freshStory = () => ({response:null,demonstrated:false,trial:null,visitor:null,finished:false});

export class WorkshopError extends Error {
  constructor(code, message, cause) { super(message, { cause }); this.name = 'WorkshopError'; this.code = code; }
}

function fail(message) { throw new WorkshopError('invalid-action', message); }
function record(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function exact(value, keys, label) {
  if (!record(value) || Object.keys(value).length !== keys.length || !keys.every(key => Object.hasOwn(value, key))) fail(`Invalid ${label} fields.`);
}
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function choice(value, allowed, label) { if (!allowed.includes(value)) fail(`Invalid ${label}.`); }
function hasBody(artwork) { if (!artwork.parts.body) fail('Choose a body before adding or sharing parts.'); }
function supportsMovement(artwork) { return Boolean(artwork.parts.body && artwork.parts.body !== 'tin' && artwork.joint === 'pivot'); }
function validateStructure(artwork) {
  exact(artwork.parts, ['body', 'accent'], 'parts');
  choice(artwork.parts.body, bodies, 'body part');
  choice(artwork.parts.accent, accents, 'accent part');
  choice(artwork.joint, ['fixed', 'pivot'], 'joint');
  if (!Number.isInteger(artwork.rotation) || artwork.rotation < 0 || artwork.rotation > 359) fail('Invalid rotation.');
  if (!artwork.parts.body && (artwork.parts.accent || artwork.joint !== 'fixed')) fail('A body is required to support the other parts.');
  if (artwork.parts.body === 'tin' && artwork.joint === 'pivot') fail('The tin is too heavy for this pivot joint. Try a fixed joint.');
}

export function createInitialWorkshopState() {
  return freeze({
    schemaVersion: 2, stage: 'entry', story:freshStory(),
    artwork: {
      id: 'work.t01.player', revision: 0, parts: { body: null, accent: null }, joint: 'fixed', rotation: 0,
      title: '', note: '', intent: 'shape', location: 'workshop', permission: 'ask', status: 'draft',
    },
    view: 'front', moving: false,
  });
}

export function validateWorkshopState(state) {
  exact(state, ['schemaVersion', 'stage', 'artwork', 'view', 'moving', 'story'], 'workshop state');
  if (state.schemaVersion !== 2) fail('Unsupported workshop save version.');
  exact(state.story,['response','demonstrated','trial','visitor','finished'],'story');
  choice(state.story.response,[null,'shape','movement','question'],'response');
  choice(state.story.trial,[null,'path','flower'],'trial');
  choice(state.story.visitor,[null,'materials','invitation'],'visitor');
  if(typeof state.story.demonstrated!=='boolean'||typeof state.story.finished!=='boolean')fail('Invalid story progress.');
  if(state.story.demonstrated&&!state.story.response)fail('A demonstration needs an author response.');
  if(['label','place','visit'].includes(state.stage)&&!state.story.demonstrated)fail('Show Iris your idea first.');
  if(state.story.finished&&(state.stage!=='end'||!state.story.visitor||!state.story.demonstrated))fail('The visitor conversation is unfinished.');
  choice(state.stage, stages, 'stage');
  choice(state.view, ['front', 'side'], 'view');
  if (typeof state.moving !== 'boolean') fail('Invalid moving state.');
  const a = state.artwork;
  exact(a, ['id', 'revision', 'parts', 'joint', 'rotation', 'title', 'note', 'intent', 'location', 'permission', 'status'], 'artwork');
  if (a.id !== 'work.t01.player') fail('Unknown artwork identity.');
  if (!Number.isSafeInteger(a.revision) || a.revision < 0) fail('Invalid artwork revision.');
  validateStructure(a);
  if (typeof a.title !== 'string' || a.title.length > 80) fail('The title must be at most 80 characters.');
  if (typeof a.note !== 'string' || a.note.length > 1200) fail('The note must be at most 1200 characters.');
  choice(a.intent, ['shape', 'movement', 'question'], 'intent');
  choice(a.location, ['workshop', 'path', 'flower'], 'location');
  choice(a.permission, ['ask', 'no'], 'permission');
  choice(a.status, ['draft', 'displayed', 'stored'], 'status');
  if ((state.moving || a.intent === 'movement') && !supportsMovement(a)) fail('Movement needs a compatible pivot joint.');
  if (state.stage === 'entry' && (a.parts.body || a.revision !== 0 || a.title || a.note)) fail('An entry save cannot contain an existing work.');
  if (['share', 'label', 'place', 'visit'].includes(state.stage)) hasBody(a);
  if (a.status === 'draft' && ((a.location !== 'workshop' && state.stage !== 'place') || ['end','visit'].includes(state.stage))) fail('A draft belongs in the workshop or a trial exhibition.');
  if (a.status === 'displayed' && (!['visit','end'].includes(state.stage) || a.location === 'workshop' || !a.parts.body)) fail('A displayed work needs one exhibition location.');
  if(state.story.trial && state.story.trial!==a.location)fail('The site observation belongs to another stand.');
  if(state.story.visitor && a.status!=='displayed')fail('A visitor needs an exhibition.');
  if(state.story.response==='movement'&&!supportsMovement(a))fail('Movement needs a compatible pivot joint.');
  if (a.status === 'stored' && (state.stage !== 'end' || a.location !== 'workshop' || state.moving)) fail('Stored pieces must be still in the workshop.');
  return state;
}

function structure(artwork) { return structuredClone({ parts: artwork.parts, joint: artwork.joint, rotation: artwork.rotation }); }
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

function transition(current, currentHistory, event, input) {
  const next = structuredClone(current);
  const history = structuredClone(currentHistory);
  const a = next.artwork;
  const only = (...allowed) => { if (!allowed.includes(current.stage)) fail(`${event} is only available in ${allowed.join(' or ')}.`); };
  const fields = (...keys) => exact(input, keys, `${event} input`);
  let undoable = false;
  switch (event) {
    case 'BEGIN': fields(); only('entry'); next.stage = 'make'; break;
    case 'SET_PART':
      fields('slot', 'part'); only('make'); choice(input.slot, ['body', 'accent'], 'part slot');
      choice(input.part, input.slot === 'body' ? bodies : accents, 'part');
      if (input.slot === 'accent' && input.part !== null) hasBody(a);
      a.parts[input.slot] = input.part;
      if (!a.parts.body) { a.parts.accent = null; a.joint = 'fixed'; next.moving = false; }
      if (!supportsMovement(a) && a.intent === 'movement') a.intent = 'shape';
      validateStructure(a); undoable = true; break;
    case 'SET_JOINT':
      fields('joint'); only('make'); choice(input.joint, ['fixed', 'pivot'], 'joint');
      if (input.joint === 'pivot') hasBody(a);
      a.joint = input.joint; validateStructure(a);
      if (a.joint === 'fixed') { next.moving = false; if (a.intent === 'movement') a.intent = 'shape'; }
      undoable = true; break;
    case 'ROTATE':
      fields('delta'); only('make', 'share', 'label', 'place'); hasBody(a);
      if (!Number.isSafeInteger(input.delta)) fail('Rotation delta must be a finite integer.');
      a.rotation = ((a.rotation + input.delta % 360) % 360 + 360) % 360;
      undoable = current.stage === 'make'; break;
    case 'SET_VIEW':
      fields('view'); only('make', 'share', 'label', 'place', 'visit', 'end'); choice(input.view, ['front', 'side'], 'view'); next.view = input.view; break;
    case 'SET_MOVING':
      fields('moving'); only('make', 'share', 'label', 'place', 'visit', 'end');
      if (typeof input.moving !== 'boolean') fail('Moving must be true or false.');
      if (input.moving && (!supportsMovement(a) || a.status === 'stored')) fail('Movement needs an available compatible pivot joint.');
      next.moving = input.moving; break;
    case 'UNDO':
      fields(); only('make');
      if (!history.length) return { state: current, history: currentHistory };
      Object.assign(a, history.pop()); next.moving = false;
      if (!supportsMovement(a) && a.intent === 'movement') a.intent = 'shape';
      break;
    case 'SHARE': fields(); only('make'); hasBody(a); next.stage = 'share'; next.moving = false; next.view='front';next.story=freshStory(); break;
    case 'SET_INTENT':
      fields('intent'); only('make', 'share'); choice(input.intent, ['shape', 'movement', 'question'], 'intent');
      if (input.intent === 'movement' && !supportsMovement(a)) fail('Movement needs a compatible pivot joint.');
      a.intent = input.intent;
      if(current.stage==='share'){next.story.response=input.intent;next.story.demonstrated=false;next.moving=false;next.view='front';}
      break;
    case 'DEMONSTRATE':
      fields();only('share');
      if(!next.story.response)fail('Tell Iris what to look at first.');
      if(next.story.response==='movement'?!next.moving:next.view!=='side')fail('Let Iris see the movement or the other side first.');
      next.story.demonstrated=true;break;
    case 'REPLY':
      fields();only('share');if(!next.story.demonstrated)fail('Show Iris your idea first.');
      next.stage='label';next.moving=false;break;
    case 'SET_LABEL':
      fields('title', 'note', 'permission'); only('make', 'share', 'label', 'place');
      a.title = input.title; a.note = input.note; a.permission = input.permission; break;
    case 'PLACE': fields(); only('label'); hasBody(a); next.stage = 'place'; next.moving = false; next.story.trial=null; break;
    case 'TRY_SITE':
      fields('location');only('place');choice(input.location,['path','flower'],'exhibition location');a.location=input.location;next.view='front';next.story.trial=null;next.moving=false;break;
    case 'OBSERVE_SITE':
      fields();only('place');choice(a.location,['path','flower'],'trial location');next.story.trial=a.location;break;
    case 'DISPLAY':
      fields('location'); only('place'); hasBody(a); choice(input.location, ['path', 'flower'], 'exhibition location');
      if(next.story.trial!==input.location||a.location!==input.location)fail('Visit this stand with Iris before leaving your work here.');
      next.stage = 'visit'; a.status = 'displayed'; next.moving = false; break;
    case 'ASK_VISITOR':
      fields('topic');only('visit');choice(input.topic,['materials','invitation'],'visitor topic');next.story.visitor=input.topic;break;
    case 'FINISH':
      fields();only('visit');if(!next.story.visitor)fail('Speak with your first visitor before leaving.');next.stage='end';next.story.finished=true;next.moving=false;break;
    case 'STORE':
      fields(); only('make', 'share', 'label', 'place', 'visit', 'end'); next.stage = 'end'; a.location = 'workshop'; a.status = 'stored'; next.moving = false;next.story=freshStory(); break;
    case 'REOPEN':
      fields(); only('make', 'share', 'label', 'place', 'visit', 'end'); next.stage = 'make'; a.location = 'workshop'; a.status = 'draft'; next.moving = false;next.story=freshStory(); break;
    default: fail(`Unknown workshop action: ${String(event)}.`);
  }
  validateWorkshopState(next);
  if (same(current, next)) return { state: current, history: currentHistory };
  if (undoable && !same(structure(current.artwork), structure(a))) {
    history.push(structure(current.artwork));
    if (history.length > HISTORY_LIMIT) history.shift();
  }
  if (!same(current.artwork, a)) {
    if (a.revision === Number.MAX_SAFE_INTEGER) fail('This artwork has reached the revision limit.');
    a.revision++;
  }
  return { state: freeze(next), history };
}

function decode(raw) {
  const saved = JSON.parse(raw);
  exact(saved, ['schemaVersion', 'state', 'history'], 'saved workshop');
  if (saved.schemaVersion === 1) {
    exact(saved.state,['schemaVersion','stage','artwork','view','moving'],'old workshop state');
    if(saved.state.schemaVersion!==1)fail('Unsupported workshop save version.');
    choice(saved.state.stage,['entry','make','share','place','end'],'old stage');
    saved.state={...saved.state,schemaVersion:2,story:freshStory()};
    // An old in-progress exhibition returns to its first conversation, without inventing witnessed actions.
    if(saved.state.stage==='place')saved.state.stage='share';
  } else if (saved.schemaVersion !== 2) fail('Unsupported workshop save version.');
  validateWorkshopState(saved.state);
  if (!Array.isArray(saved.history) || saved.history.length > HISTORY_LIMIT) fail('Invalid undo history.');
  for (const item of saved.history) {
    exact(item, ['parts', 'joint', 'rotation'], 'undo item');
    validateStructure(item);
  }
  // Returning to a saved object never starts its animation without a fresh choice.
  return { state: freeze({ ...saved.state, moving: false }), history: saved.history };
}

export function createWorkshopStore(storage) {
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') throw new TypeError('Workshop storage needs getItem and setItem.');
  let state = createInitialWorkshopState();
  let history = [];
  let loadError = null;
  let raw = null;

  function retryLoad() {
    let stored;
    try { stored = storage.getItem(WORKSHOP_STORAGE_KEY); }
    catch (cause) { loadError = new WorkshopError('storage-read', 'The saved workshop could not be read. Retry when storage is available.', cause); return state; }
    raw = stored;
    try {
      const loaded = stored === null ? { state: createInitialWorkshopState(), history: [] } : decode(stored);
      state = loaded.state; history = loaded.history; loadError = null;
    } catch (cause) {
      loadError = new WorkshopError('invalid-save', 'This workshop save could not be opened. The original has been kept. Export it or archive it before starting again.', cause);
    }
    return state;
  }

  function persist(next, nextHistory) {
    let latest;
    try { latest=storage.getItem(WORKSHOP_STORAGE_KEY); }
    catch(cause){throw new WorkshopError('storage-read','The saved work could not be read. Try again.',cause);}
    if(latest!==raw)throw new WorkshopError('stale-save','This work changed in another tab. Reload to continue with the latest version.');
    const serialized = JSON.stringify({ schemaVersion: 2, state: next, history: nextHistory });
    try { storage.setItem(WORKSHOP_STORAGE_KEY, serialized); }
    catch (cause) { throw new WorkshopError('storage-write', 'The workshop could not be saved. Your previous saved work is unchanged. Retry this action.', cause); }
    state = next; history = nextHistory; raw = serialized;
    return state;
  }

  retryLoad();
  return {
    get state() { return state; },
    get loadError() { return loadError; },
    get canUndo() { return !loadError && state.stage === 'make' && history.length > 0; },
    get canRecover() { return loadError?.code === 'invalid-save' && typeof raw === 'string'; },
    exportRaw() { return raw; },
    retryLoad,
    dispatch(event, input = {}) {
      if (loadError) throw new WorkshopError('load-blocked', loadError.message, loadError);
      const result = transition(state, history, event, input);
      return result.state === state ? state : persist(result.state, result.history);
    },
    recover() {
      if (!loadError) return state;
      if (loadError.code !== 'invalid-save' || typeof raw !== 'string') throw new WorkshopError('load-blocked', 'Read the original save successfully before attempting recovery.', loadError);
      let currentRaw;
      try { currentRaw = storage.getItem(WORKSHOP_STORAGE_KEY); }
      catch (cause) { throw new WorkshopError('storage-read', 'The original save cannot be read safely yet.', cause); }
      if (currentRaw !== raw) {
        retryLoad();
        if (!loadError) return state;
        throw new WorkshopError('load-blocked', 'The stored record changed. Review the newly loaded record before recovery.');
      }
      try {
        const base = `${WORKSHOP_STORAGE_KEY}.recovery.${Date.now()}`;
        let key = base; let suffix = 0;
        while (storage.getItem(key) !== null) key = `${base}.${++suffix}`;
        storage.setItem(key, raw);
      } catch (cause) { throw new WorkshopError('storage-write', 'The original could not be archived. It has not been replaced.', cause); }
      const fresh = persist(createInitialWorkshopState(), []);
      loadError = null;
      return fresh;
    },
  };
}
