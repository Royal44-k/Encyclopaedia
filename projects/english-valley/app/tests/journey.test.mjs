import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  applyEvent, createInitialState, createJourneyStore, getAvailableEvents, getDialogueCues,
} from '../src/core/journey.js';

const storageKey = 'english-valley.journey.v1';
const scene = { mode: 'same_pc_group', layoutVersion: 'layout-test', assetManifestVersion: 'assets-test' };
const cast = { activeCastMei: true, activeCastNoor: true, activeCastRowan: true, activeCastSam: true };
const mediaReady = { threeCardSourcesValid: true, referencedMediaDurable: true };
const transform = { position: [1, 0, 2], rotation: [0, 0, 0, 1], scale: [1, 1, 1] };
const placement = { targetSurfaceAcceptsCover: true, coverOrientationValid: true, placementBlocksRoute: false };
const returnCard = {
  locationId: 'loc.bare_bed', whenText: 'After the next rain', question: 'Where does the soil go?',
  whatToObserve: 'The shallow channel', participants: '', realWorldConnection: '',
};

function dispatch(state, event, input = {}, context = {}, id = `command-${state.revision + 1}`) {
  return applyEvent(state, { id, event, input }, context);
}

function start() {
  return dispatch(createInitialState(), 'SESSION_OPENED', scene, { sceneBindingsReady: true });
}

function fieldwork() {
  const bridge = dispatch(start(), 'BRIDGE_RECORD_OPENED', {}, { bridgePairFullyOpened: true });
  return dispatch(bridge, 'INVESTIGATE_NOW');
}

function walk(state, destination) {
  const moving = dispatch(state, 'MOVE_REQUESTED', { destination });
  return dispatch(moving, 'MOVE_ARRIVED', {}, { destinationReached: true });
}

function receipt(state, lineId) {
  return dispatch(state, 'DIALOGUE_CONTENT_PRESENTED', { lineId }, {
    presentedDialogueId: lineId, dialogueDeliveryValidated: true,
  });
}

function model() {
  let state = fieldwork();
  state = walk(state, 'loc.upper_stream');
  state = dispatch(state, 'UPPER_RECORD_OPENED', {}, { upperPairFullyOpened: true });
  state = walk(state, 'loc.bare_bed');
  state = dispatch(state, 'PATH_RECORD_OPENED', {}, { sourcePathInspected: true });
  state = walk(state, 'loc.greenhouse');
  state = dispatch(state, 'ASK_MEI_NEUTRALLY', {}, cast);
  state = dispatch(state, 'CONTINUE_MEI_INTERVIEW');
  for (const lineId of ['T03S.007', 'T03S.009', 'T03S.011']) state = receipt(state, lineId);
  state = dispatch(state, 'MEI_INTERVIEW_RECORDED');
  state = walk(state, 'loc.bare_bed');
  state = dispatch(state, 'ASSEMBLE_COMPARISON');
  state = dispatch(state, 'STAGING_READY', {}, cast);
  return dispatch(state, 'COMPARISON_OPENED');
}

function trial(state, position) {
  const selected = dispatch(state, 'COVER_POSITION_SELECTED', { position });
  const running = dispatch(selected, 'TRIAL_REQUESTED');
  return dispatch(running, 'TRIAL_COMPLETED', { runId: running.fields['model.activeRunId'] },
    { modelAnimationFinished: true });
}

function proposal() {
  return dispatch(trial(model(), 'source_cover_zone'), 'PROPOSAL_SAVED', { note: '' });
}

function confirmPurpose(state) {
  return dispatch(state, 'PURPOSE_AND_POSITION_CONFIRMED', {
    purpose: 'cover_exposed_source_soil', position: 'source_cover_zone',
  }, cast);
}

function carried() {
  const requested = dispatch(confirmPurpose(proposal()), 'IMPLEMENTATION_REQUESTED');
  const checked = dispatch(requested, 'MATERIALS_CHECKED');
  return dispatch(checked, 'MATERIAL_PICKED_UP');
}

function memoryStorage(initial = null) {
  let value = initial;
  return {
    rejectWrite: false,
    getItem(key) { return key === storageKey ? value : null; },
    setItem(key, next) {
      assert.equal(key, storageKey);
      if (this.rejectWrite) throw new Error('quota');
      value = next;
    },
    removeItem(key) { assert.equal(key, storageKey); value = null; },
  };
}

function cards(sourceId = null, caption = '') {
  return [1, 2, 3].map(slot => ({
    slot, sourceId: slot === 1 ? sourceId : null, caption: slot === 1 ? caption : '', audioBlobId: null,
  }));
}

function cueIds(state, trigger, context, kind) {
  return getDialogueCues(state, trigger, context).filter(cue => cue.kind === kind).flatMap(cue => cue.ids);
}

test('entry rejects wrong-order trial and requires an explicit loader gate', () => {
  const initial = createInitialState();
  assert.throws(() => dispatch(initial, 'TRIAL_REQUESTED'));
  assert.throws(() => dispatch(initial, 'SESSION_OPENED', scene));
  assert.throws(() => dispatch(initial, 'SESSION_OPENED', { ...scene, layoutVersion: '' }, { sceneBindingsReady: true }));
  assert.equal(initial.revision, 0);
  assert.equal(start().nodeId, 'j.bridge_record');
});

test('cleanup leaves water untouched and queues cast-gated global feedback', () => {
  const before = fieldwork();
  assert.throws(() => dispatch(before, 'LITTER_REMOVED'));
  const after = dispatch(before, 'LITTER_REMOVED', {}, { cleanupActionFinished: true });
  assert.equal(after.fields['world.litterRemoved'], true);
  assert.equal(after.fields['world.waterAppearance'], 'authored_brown_at_recorded_visit');
  assert.equal(after.fields['evidence.records'].at(-1).observationProvenance, 'visible_prop_removal_only');
  assert.deepEqual(cueIds(after, 'LITTER_REMOVED', {}, 'performed'), []);
  assert.deepEqual(cueIds(after, 'cast_arrived', { activeCastNoor: true }, 'performed'), ['T03S.001']);
  assert.deepEqual(cueIds(receipt(after, 'T03S.001'), 'scene_resumed', cast, 'performed'), ['T03S.002']);
  assert.equal(before.fields['world.litterRemoved'], false);
});

test('explicit question cues follow the committed intent without a second node entry', () => {
  const hook = dispatch(start(), 'BRIDGE_RECORD_OPENED', {}, { bridgePairFullyOpened: true });
  assert.deepEqual(cueIds(hook, 'ASK_WATER_COLOUR_QUESTION', cast, 'performed'), []);
  const asked = dispatch(hook, 'ASK_WATER_COLOUR_QUESTION', {}, cast);
  assert.deepEqual(cueIds(asked, 'ASK_WATER_COLOUR_QUESTION', cast, 'performed'), ['T03S.006']);
  assert.deepEqual(cueIds(asked, 'node_enter', cast, 'performed'), []);
});

test('shared evidence keeps peer provenance and does not move the player', () => {
  const before = fieldwork();
  assert.throws(() => dispatch(before, 'UPPER_RECORD_SHARED', {}, { sharedEvidencePresented: true, sharedEvidenceId: 'C1-E03' }));
  const after = dispatch(before, 'UPPER_RECORD_SHARED', {}, { sharedEvidencePresented: true, sharedEvidenceId: 'C1-E02' });
  assert.equal(after.fields['navigation.currentLocation'], 'loc.stream_bridge');
  assert.equal(after.fields['evidence.upper'], 'peer_shared');
  assert.deepEqual(after.fields['evidence.records'].at(-1), {
    eventId: 'command-4', evidenceId: 'C1-E02', origin: 'peer_shared', locationId: 'loc.upper_stream',
    storyDayId: 'visit.return.01', observationProvenance: 'authored_fictional_teaching_scene',
  });
});

test('moving fieldwork can pause but cannot record arrival or open an interview prematurely', () => {
  const moving = dispatch(walk(fieldwork(), 'loc.greenhouse'), 'MOVE_REQUESTED', { destination: 'loc.bare_bed' });
  const available = getAvailableEvents(moving, cast);
  assert.ok(!available.includes('ASK_MEI_DIRECTLY'));
  assert.ok(!available.includes('EXPLAIN_CURRENT_RECORDS'));
  assert.ok(!available.includes('MOVE_ARRIVED'));
  assert.ok(available.includes('PAUSE_SAVED'));
});

test('direct blame still reaches the whole transcript with separate persistent receipts', () => {
  const direct = dispatch(walk(fieldwork(), 'loc.greenhouse'), 'ASK_MEI_DIRECTLY', {}, cast);
  assert.deepEqual(cueIds(direct, 'node_enter', cast, 'performed'), ['T03S.012']);
  const followup = dispatch(direct, 'CONTINUE_MEI_INTERVIEW');
  const lines = ['T03S.007', 'T03S.009', 'T03S.011'];
  assert.deepEqual(cueIds(followup, 'scene_resumed', {}, 'transcript'), lines);
  assert.throws(() => dispatch(followup, 'MEI_INTERVIEW_RECORDED'));
  assert.throws(() => receipt(followup, 'T03S.026'));
  const partial = receipt(followup, 'T03S.007');
  const reopened = createJourneyStore(memoryStorage(JSON.stringify(partial)));
  assert.equal(reopened.state.fields['delivery.T03S.007'], true);
  const completed = dispatch(receipt(receipt(reopened.state, 'T03S.009'), 'T03S.011'), 'MEI_INTERVIEW_RECORDED');
  assert.equal(completed.fields['interview.heard'], true);
  assert.equal(completed.fields['evidence.records'].at(-1).evidenceId, 'C1-E04');
});

test('authored trials retain the same baseline and do not install cover or clear water', () => {
  let state = model();
  for (const [position, result] of [
    ['no_cover', 'no_difference'], ['unrelated_zone', 'no_difference'], ['source_cover_zone', 'less_source_soil_shown'],
  ]) {
    state = trial(state, position);
    const record = state.fields['model.trials'].at(-1);
    assert.deepEqual([record.position, record.result, record.baselinePosition, record.conditionsId],
      [position, result, 'no_cover', 'fixed_scene_A']);
    assert.equal(state.fields['world.coverInstalled'], false);
    assert.equal(state.fields['world.waterAppearance'], 'authored_brown_at_recorded_visit');
    assert.deepEqual(cueIds(state, 'TRIAL_COMPLETED', cast, 'optional_learner_support'),
      { no_cover: [], unrelated_zone: ['T03S.021'], source_cover_zone: ['T03S.020'] }[position]);
    assert.ok(!cueIds(state, 'TRIAL_COMPLETED', cast, 'performed').includes('T03S.022'));
  }
});

test('cancelled and interrupted trials ignore late completions and preserve earlier trials', () => {
  const completed = trial(model(), 'unrelated_zone');
  const firstRun = dispatch(completed, 'TRIAL_REQUESTED');
  const cancelled = dispatch(firstRun, 'TRIAL_CANCELLED');
  const secondRun = dispatch(cancelled, 'TRIAL_REQUESTED');
  const available = getAvailableEvents(secondRun, { modelAnimationFinished: true });
  assert.ok(available.includes('TRIAL_COMPLETED'));
  assert.throws(() => dispatch(secondRun, 'TRIAL_COMPLETED', { runId: firstRun.fields['model.activeRunId'] },
    { modelAnimationFinished: true }));
  const adapter = memoryStorage(JSON.stringify(secondRun));
  const reopened = createJourneyStore(adapter);
  assert.equal(reopened.state.fields['model.phase'], 'idle');
  assert.equal(reopened.state.fields['model.activeRunId'], null);
  assert.equal(reopened.state.acceptedEvents.at(-1).event, 'INTERRUPTED_TRIAL_RECOVERED');
  assert.deepEqual(reopened.state.fields['model.trials'], completed.fields['model.trials']);
  assert.equal(createJourneyStore(adapter).state.revision, reopened.state.revision);
});

test('paused draft restores its transform and installation requires all geometry checks', () => {
  const carry = carried();
  assert.throws(() => dispatch(carry, 'DRAFT_POSITION_UPDATED', {
    zone: 'source_cover_zone', transform: { ...transform, rotation: [0, 0, 0, 2] },
  }));
  const draft = dispatch(carry, 'DRAFT_POSITION_UPDATED', { zone: 'source_cover_zone', transform });
  const paused = dispatch(draft, 'PAUSE_SAVED', { note: 'Check the height' });
  const reopened = createJourneyStore(memoryStorage(JSON.stringify(paused)));
  reopened.dispatch('RESUME_SAVED');
  assert.equal(reopened.state.nodeId, 'j.placement');
  assert.equal(reopened.state.fields['implementation.materialState'], 'draft_placed');
  assert.deepEqual(reopened.state.fields['implementation.draftTransform'], transform);
  assert.equal(reopened.state.fields['world.coverInstalled'], false);
  assert.throws(() => reopened.dispatch('COVER_INSTALLED', {}, { ...placement, placementBlocksRoute: true }));
  reopened.dispatch('COVER_INSTALLED', {}, placement);
  assert.deepEqual(reopened.state.fields['world.coverTransform'], transform);
  assert.equal(reopened.state.nodeId, 'j.explain');
  assert.ok(cueIds(reopened.state, 'node_enter', cast, 'optional_learner_support').includes('T03S.034'));
});

test('confirmed proposal without installation suppresses the undecided example', () => {
  const pending = proposal();
  const unconfirmed = dispatch(pending, 'KEEP_AS_PROPOSAL');
  assert.ok(cueIds(unconfirmed, 'node_enter', {}, 'optional_learner_support').includes('T03S.036'));
  const confirmed = dispatch(confirmPurpose(pending), 'KEEP_AS_PROPOSAL');
  assert.equal(confirmed.fields['plan.purposeAndPositionConfirmed'], true);
  assert.ok(!cueIds(confirmed, 'node_enter', {}, 'optional_learner_support').includes('T03S.036'));
  assert.equal(confirmed.fields['world.coverInstalled'], false);
});

test('saved work accepts blank slots but rejects invalid nested cards and unearned sources', () => {
  const explanation = dispatch(fieldwork(), 'EXPLAIN_CURRENT_RECORDS');
  assert.throws(() => dispatch(explanation, 'EXPLANATION_SAVED', { cards: cards('record.upper.current_round.v1') }, mediaReady));
  assert.throws(() => dispatch(explanation, 'EXPLANATION_SAVED', { cards: cards('trial.not-completed') }, mediaReady));
  const invalidCards = cards();
  invalidCards[2].slot = 1;
  assert.throws(() => dispatch(explanation, 'EXPLANATION_SAVED', { cards: invalidCards }, mediaReady));
  const first = dispatch(explanation, 'EXPLANATION_SAVED', { cards: cards('record.bridge.before_rain.v1', 'Still a question.') }, mediaReady);
  const revised = dispatch(first, 'EXPLANATION_DRAFT_SAVED', { cards: cards(null, ' ') }, mediaReady);
  assert.equal(revised.fields['explanation.history'][0].cards[0].caption, 'Still a question.');
  assert.equal(revised.fields['explanation.status'], 'draft');
  assert.equal(revised.fields['explanation.cards'][0].caption, ' ');
});

test('return requires arrival, with plans and optional receipts independent of finishing', () => {
  const explain = dispatch(fieldwork(), 'EXPLAIN_CURRENT_RECORDS');
  const returning = dispatch(explain, 'CONTINUE_TO_RETURN_CARD');
  assert.throws(() => dispatch(returning, 'RETURN_CARD_SAVED', { card: returnCard }));
  const arrived = dispatch(returning, 'MOVE_ARRIVED', {}, { destinationReached: true });
  const planned = dispatch(arrived, 'RETURN_CARD_SAVED', { card: returnCard });
  assert.deepEqual(cueIds(planned, 'cast_arrived', { activeCastRowan: true }, 'performed'), ['T03S.026']);
  const saved = dispatch(planned, 'FINISH_SAVED', { note: '' });
  assert.equal(saved.nodeId, 'j.end_saved');
  assert.equal(saved.fields['followup.status'], 'planned');
  assert.deepEqual(saved.fields['followup.observations'], []);
});

test('unresolved exit and resume preserve a partial record and the safe anchor', () => {
  const moving = dispatch(fieldwork(), 'MOVE_REQUESTED', { destination: 'loc.greenhouse' });
  const unresolved = dispatch(moving, 'UNRESOLVED_SAVED', { note: 'Where did it come from?' });
  const resumed = dispatch(unresolved, 'RESUME_SAVED');
  assert.equal(resumed.nodeId, 'j.fieldwork');
  assert.equal(resumed.fields['navigation.currentLocation'], 'loc.stream_bridge');
  assert.equal(resumed.fields['navigation.targetLocation'], 'loc.greenhouse');
  assert.equal(resumed.fields['evidence.records'].length, 1);
  assert.equal(resumed.fields['resume.note'], 'Where did it come from?');
});

test('duplicate command returns its original result without publishing it over newer state', () => {
  const adapter = memoryStorage();
  const store = createJourneyStore(adapter);
  const first = store.dispatch('SESSION_OPENED', scene, { sceneBindingsReady: true, eventId: 'stable', expectedRevision: 0 });
  const second = store.dispatch('BRIDGE_RECORD_OPENED', {}, { bridgePairFullyOpened: true });
  const reopened = createJourneyStore(adapter);
  assert.deepEqual(reopened.dispatch('SESSION_OPENED', scene, { eventId: 'stable', expectedRevision: 0 }), first);
  assert.deepEqual(reopened.state, second);
  assert.throws(() => reopened.dispatch('SESSION_OPENED', { ...scene, mode: 'teacher_projection' }, { eventId: 'stable' }));
  assert.deepEqual(reopened.state, second);
});

test('failed storage write keeps the committed state and retries with the same command ID', () => {
  const adapter = memoryStorage();
  const store = createJourneyStore(adapter);
  adapter.rejectWrite = true;
  assert.throws(() => store.dispatch('SESSION_OPENED', scene, { sceneBindingsReady: true }), /quota/);
  assert.equal(store.state.revision, 0);
  assert.equal(adapter.getItem(storageKey), null);
  adapter.rejectWrite = false;
  store.dispatch('SESSION_OPENED', scene, { sceneBindingsReady: true });
  assert.equal(store.state.acceptedEvents.length, 1);
  assert.deepEqual(JSON.parse(store.exportJSON()), createJourneyStore(adapter).state);
});

test('invalid save stays intact until explicit reset', () => {
  const bad = JSON.stringify({ ...start(), revision: 9 });
  const adapter = memoryStorage(bad);
  const store = createJourneyStore(adapter);
  assert.ok(store.loadError);
  assert.equal(store.exportJSON(), bad);
  assert.throws(() => store.dispatch('SESSION_OPENED', scene, { sceneBindingsReady: true }));
  assert.equal(adapter.getItem(storageKey), bad);
  store.reset();
  assert.equal(adapter.getItem(storageKey), null);
  assert.equal(store.loadError, null);
  assert.equal(store.state.revision, 0);
});

test('stale store reloads the committed revision without replaying the action', () => {
  const adapter = memoryStorage();
  const first = createJourneyStore(adapter);
  const stale = createJourneyStore(adapter);
  first.dispatch('SESSION_OPENED', scene, { sceneBindingsReady: true });
  assert.throws(() => stale.dispatch('PAUSE_SAVED', { note: 'old tab' }), /revision/i);
  assert.deepEqual(stale.state, first.state);
  assert.equal(stale.state.fields['resume.note'], '');
});

test('a stale retry of an already committed command returns the original result', () => {
  const adapter = memoryStorage();
  const first = createJourneyStore(adapter);
  const stale = createJourneyStore(adapter);
  const initialWrite = first.dispatch('SESSION_OPENED', scene, { sceneBindingsReady: true, eventId: 'known' });
  first.dispatch('BRIDGE_RECORD_OPENED', {}, { bridgePairFullyOpened: true });
  assert.deepEqual(stale.dispatch('SESSION_OPENED', scene, { eventId: 'known', expectedRevision: 0 }), initialWrite);
  assert.deepEqual(stale.state, first.state);
});

test('interrupted trial stays recoverable when the recovery write fails', () => {
  const running = dispatch(trial(model(), 'unrelated_zone'), 'TRIAL_REQUESTED');
  const raw = JSON.stringify(running);
  const adapter = memoryStorage(raw);
  adapter.rejectWrite = true;
  const store = createJourneyStore(adapter);
  assert.match(store.loadError.message, /quota/);
  assert.equal(store.exportJSON(), raw);
  assert.deepEqual(store.state, running);
  assert.throws(() => store.dispatch('TRIAL_CANCELLED'));
  adapter.rejectWrite = false;
  store.dispatch('INTERRUPTED_TRIAL_RECOVERED');
  assert.equal(store.loadError, null);
  assert.equal(store.state.fields['model.phase'], 'idle');
  assert.equal(store.state.fields['model.trials'].length, 1);
});
