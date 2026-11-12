import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createWorkshopStore, WORKSHOP_STORAGE_KEY } from '../src/core/workshop.js';
import { moduleRegistry } from '../src/content/module-registry.js';

function memoryStorage(initial = null) {
  const values = new Map(initial === null ? [] : [[WORKSHOP_STORAGE_KEY, initial]]);
  return {
    values, failKey: null,
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { if (key === this.failKey) throw new Error('quota'); values.set(key, value); },
  };
}

function started(storage = memoryStorage()) {
  const store = createWorkshopStore(storage);
  store.dispatch('BEGIN');
  return { store, storage };
}

test('T01 saves a partial draft independently of the creek, restores paused, and keeps undo', () => {
  const { store, storage } = started();
  storage.values.set('english-valley.journey.v1', 'unchanged creek record');
  store.dispatch('SET_PART', { slot: 'body', part: 'ring' });
  store.dispatch('SET_PART', { slot: 'accent', part: 'cloth' });
  store.dispatch('SET_JOINT', { joint: 'pivot' });
  store.dispatch('SET_MOVING', { moving: true });
  store.dispatch('ROTATE', { delta: -15 });
  const resumed = createWorkshopStore(storage);
  assert.equal(resumed.state.stage, 'make');
  assert.equal(resumed.state.artwork.rotation, 345);
  assert.equal(resumed.state.artwork.parts.accent, 'cloth');
  assert.equal(resumed.state.moving, false);
  assert.equal(resumed.canUndo, true);
  resumed.dispatch('UNDO');
  assert.equal(resumed.state.artwork.rotation, 0);
  assert.equal(storage.getItem('english-valley.journey.v1'), 'unchanged creek record');
});

test('T01 rejects incompatible joints and accents without altering the previous object', () => {
  const { store, storage } = started();
  assert.throws(() => store.dispatch('SET_PART', { slot: 'accent', part: 'cap' }), /body/i);
  assert.throws(() => store.dispatch('SET_JOINT', { joint: 'pivot' }), /body/i);
  store.dispatch('SET_PART', { slot: 'body', part: 'tin' });
  const before = storage.getItem(WORKSHOP_STORAGE_KEY);
  assert.throws(() => store.dispatch('SET_JOINT', { joint: 'pivot' }), /heavy/i);
  assert.equal(storage.getItem(WORKSHOP_STORAGE_KEY), before);
  store.dispatch('SET_PART', { slot: 'body', part: 'ring' });
  store.dispatch('SET_JOINT', { joint: 'pivot' });
  assert.throws(() => store.dispatch('SET_PART', { slot: 'body', part: 'tin' }), /heavy/i);
});

test('T01 removing a body removes unsupported parts and undo restores the structure without starting it', () => {
  const { store } = started();
  store.dispatch('SET_PART', { slot: 'body', part: 'branch' });
  store.dispatch('SET_PART', { slot: 'accent', part: 'fan' });
  store.dispatch('SET_JOINT', { joint: 'pivot' });
  store.dispatch('SET_MOVING', { moving: true });
  store.dispatch('SET_PART', { slot: 'body', part: null });
  assert.deepEqual(store.state.artwork.parts, { body: null, accent: null });
  assert.equal(store.state.artwork.joint, 'fixed');
  assert.equal(store.state.moving, false);
  const revision = store.state.artwork.revision;
  store.dispatch('UNDO');
  assert.equal(store.state.artwork.parts.body, 'branch');
  assert.equal(store.state.artwork.parts.accent, 'fan');
  assert.equal(store.state.artwork.joint, 'pivot');
  assert.equal(store.state.moving, false);
  assert.equal(store.state.artwork.revision, revision + 1);
});

test('T01 permits an untitled display, preserves ask-first permission, and moves one original back to edit', () => {
  const { store } = started();
  store.dispatch('SET_PART', { slot: 'body', part: 'ring' });
  store.dispatch('SHARE');
  store.dispatch('SET_INTENT', { intent:'shape' });
  store.dispatch('SET_VIEW', { view:'side' });
  store.dispatch('DEMONSTRATE');
  store.dispatch('REPLY');
  store.dispatch('SET_LABEL', { title: '', note: 'Look from the side.', permission: 'ask' });
  store.dispatch('PLACE');
  store.dispatch('TRY_SITE', { location:'flower' });
  store.dispatch('OBSERVE_SITE');
  store.dispatch('DISPLAY', { location: 'flower' });
  store.dispatch('ASK_VISITOR', { topic:'invitation' });
  store.dispatch('FINISH');
  assert.equal(store.state.stage, 'end');
  assert.equal(store.state.artwork.title, '');
  assert.equal(store.state.artwork.location, 'flower');
  assert.equal(store.state.artwork.permission, 'ask');
  assert.equal(store.state.artwork.status, 'displayed');
  const id = store.state.artwork.id;
  store.dispatch('REOPEN');
  assert.equal(store.state.artwork.id, id);
  assert.equal(store.state.artwork.location, 'workshop');
  assert.equal(store.state.artwork.status, 'draft');
  assert.equal(store.state.stage, 'make');
});

test('T01 can keep unfinished pieces without forcing a title, explanation or display', () => {
  const { store, storage } = started();
  store.dispatch('STORE');
  assert.equal(store.state.stage, 'end');
  assert.equal(store.state.artwork.status, 'stored');
  assert.equal(store.state.artwork.location, 'workshop');
  const resumed = createWorkshopStore(storage);
  assert.equal(resumed.state.artwork.status, 'stored');
  resumed.dispatch('REOPEN');
  assert.equal(resumed.state.stage, 'make');
  assert.throws(() => resumed.dispatch('SHARE'), /body/i);
});

test('T01 a failed write publishes neither state nor undo changes and can be retried', () => {
  const { store, storage } = started();
  const before = store.state;
  storage.failKey = WORKSHOP_STORAGE_KEY;
  assert.throws(() => store.dispatch('SET_PART', { slot: 'body', part: 'ring' }), { code: 'storage-write' });
  assert.equal(store.state, before);
  assert.equal(store.canUndo, false);
  storage.failKey = null;
  store.dispatch('SET_PART', { slot: 'body', part: 'ring' });
  assert.equal(store.state.artwork.revision, 1);
  assert.equal(store.canUndo, true);
});

test('T01 malformed or incompatible saved state is preserved until an explicit archived recovery', () => {
  for (const raw of ['{broken', JSON.stringify({ schemaVersion: 99 }), JSON.stringify({ schemaVersion: 1, state: { stage: 'end' }, history: [] })]) {
    const storage = memoryStorage(raw);
    const store = createWorkshopStore(storage);
    assert.ok(store.loadError);
    assert.equal(store.exportRaw(), raw);
    assert.throws(() => store.dispatch('BEGIN'), { code: 'load-blocked' });
    assert.equal(storage.getItem(WORKSHOP_STORAGE_KEY), raw);
    store.recover();
    assert.equal(store.loadError, null);
    assert.equal(store.state.stage, 'entry');
    const backups = [...storage.values.entries()].filter(([key]) => key.startsWith(`${WORKSHOP_STORAGE_KEY}.recovery.`));
    assert.equal(backups.length, 1);
    assert.equal(backups[0][1], raw);
  }
});

test('T01 recovery never destroys the original if archive or new-save writes fail', () => {
  const raw = '{damaged';
  const storage = memoryStorage(raw);
  const store = createWorkshopStore(storage);
  const normalWrite = storage.setItem;
  storage.setItem = function (key, value) { if (key.includes('.recovery.')) throw new Error('quota'); normalWrite.call(this, key, value); };
  assert.throws(() => store.recover(), { code: 'storage-write' });
  assert.equal(storage.getItem(WORKSHOP_STORAGE_KEY), raw);
  assert.ok(store.loadError);
  storage.setItem = normalWrite;
  storage.failKey = WORKSHOP_STORAGE_KEY;
  assert.throws(() => store.recover(), { code: 'storage-write' });
  assert.equal(storage.getItem(WORKSHOP_STORAGE_KEY), raw);
  assert.ok(store.loadError);
});

test('T01 a temporarily unreadable save blocks edits and recovers by rereading without replacing it', () => {
  const { store, storage } = started();
  store.dispatch('SET_PART', { slot: 'body', part: 'branch' });
  const original = storage.getItem(WORKSHOP_STORAGE_KEY);
  const normalRead = storage.getItem;
  storage.getItem = () => { throw new Error('Storage unavailable'); };
  const blocked = createWorkshopStore(storage);
  assert.equal(blocked.loadError.code, 'storage-read');
  assert.equal(blocked.canRecover, false);
  assert.throws(() => blocked.dispatch('BEGIN'), { code: 'load-blocked' });
  assert.throws(() => blocked.recover(), { code: 'load-blocked' });
  storage.getItem = normalRead;
  blocked.retryLoad();
  assert.equal(blocked.loadError, null);
  assert.equal(blocked.state.artwork.parts.body, 'branch');
  assert.equal(storage.getItem(WORKSHOP_STORAGE_KEY), original);
});

test('T01 rejects invalid input and static movement without silently rewriting student text', () => {
  const { store } = started();
  store.dispatch('SET_PART', { slot: 'body', part: 'ring' });
  assert.throws(() => store.dispatch('SET_MOVING', { moving: true }), /pivot/i);
  assert.throws(() => store.dispatch('SET_INTENT', { intent: 'movement' }), /pivot/i);
  assert.throws(() => store.dispatch('ROTATE', { delta: Infinity }), /delta/i);
  assert.throws(() => store.dispatch('SET_LABEL', { title: 'x'.repeat(81), note: '', permission: 'ask' }), /title/i);
  assert.throws(() => store.dispatch('SET_PART', { slot: 'body', part: '__proto__' }), /part/i);
  const note = 'My words — not a score.\nAnother view.';
  store.dispatch('SET_LABEL', { title: '', note, permission: 'no' });
  assert.equal(store.state.artwork.note, note);
  assert.throws(() => { store.state.artwork.note = 'changed'; }, TypeError);
});

test('T01 bounded undo ignores no-op changes and does not undo labels or later placement', () => {
  const { store, storage } = started();
  store.dispatch('SET_PART', { slot: 'body', part: 'ring' });
  const before = store.state;
  store.dispatch('SET_PART', { slot: 'body', part: 'ring' });
  assert.equal(store.state, before);
  for (let index = 0; index < 40; index++) store.dispatch('ROTATE', { delta: 15 });
  assert.equal(JSON.parse(storage.getItem(WORKSHOP_STORAGE_KEY)).history.length, 32);
  store.dispatch('SET_LABEL', { title: 'Maybe a doorway', note: '', permission: 'no' });
  store.dispatch('UNDO');
  assert.equal(store.state.artwork.title, 'Maybe a doorway');
  store.dispatch('SHARE');
  assert.throws(() => store.dispatch('UNDO'), /make/i);
});

test('module registry keeps twelve real chapters and only makes implemented entries playable', () => {
  assert.equal(moduleRegistry.length, 12);
  assert.equal(new Set(moduleRegistry.map(item => item.id)).size, 12);
  assert.deepEqual(moduleRegistry.filter(item => item.status === 'playable').map(item => item.id).sort(), ['C1', 'T01', 'T02']);
  assert.ok(moduleRegistry.filter(item => item.status === 'planned').every(item => item.href === null));
  assert.ok(moduleRegistry.find(item => item.id === 'C1').subtitle.includes('完整游园待制作'));
});
