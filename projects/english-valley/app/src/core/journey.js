import contract from '../../../docs/design/v6/first-journey-flow-v6_1.json' with { type: 'json' };

const storageKey = 'english-valley.journey.v1';
const nodes = new Map(contract.nodes.map(node => [node.id, node]));
const unknown = Symbol('unavailable operand');
const explanationEvents = new Set(['EXPLANATION_DRAFT_SAVED', 'EXPLANATION_SAVED']);
const sources = new Map(contract.publicEvidenceCatalog.records.map(record => [record.sourceId, record]));
const mediaEvents = {
  trial: 'TRIAL_COMPLETED', implementation: 'COVER_INSTALLED', cleanup: 'LITTER_REMOVED',
};

function isRecord(value) {
  if (value === null || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function freeze(value) {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function sameValue(left, right) {
  if (left === right) return true;
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false;
  if (Array.isArray(left) !== Array.isArray(right)) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length &&
    keys.every(key => Object.hasOwn(right, key) && sameValue(left[key], right[key]));
}

function matches(value, schema) {
  if (typeof schema === 'string') return matches(value, { type: schema });
  if (schema.union) return schema.union.some(type => matches(value, type));
  if (schema.enum) return schema.enum.includes(value);
  if (schema.object) {
    return isRecord(value) &&
      Object.keys(value).every(key => Object.hasOwn(schema.object, key)) &&
      Object.entries(schema.object).every(([key, type]) =>
        Object.hasOwn(value, key) ? matches(value[key], type) : !schema.allRequired);
  }
  if (schema.arrayOf) {
    return Array.isArray(value) &&
      (schema.length === undefined || value.length === schema.length) &&
      Array.from(value).every(item => matches(item, schema.arrayOf)) &&
      (!schema.uniqueBy || new Set(value.map(item => item[schema.uniqueBy])).size === value.length) &&
      (!schema.requiredSlots || schema.requiredSlots.every(slot => value.some(item => item.slot === slot)));
  }
  const { type } = schema;
  if (Object.hasOwn(contract.types, type)) return matches(value, contract.types[type]);
  if (type.endsWith('[]')) return matches(value, { arrayOf: type.slice(0, -2) });
  const vector = /^number\[(\d+)\]$/.exec(type);
  if (vector) {
    return Array.isArray(value) && value.length === Number(vector[1]) &&
      Array.from(value).every(number => Number.isFinite(number) &&
        (schema.minimumExclusive === undefined || number > schema.minimumExclusive)) &&
      (schema.units !== 'normalized_quaternion' || Math.abs(Math.hypot(...value) - 1) < 1e-6);
  }
  switch (type) {
    case 'enum': return schema.values.includes(value);
    case 'string': return typeof value === 'string' && value.length >= (schema.minLength ?? 0);
    case 'boolean': return typeof value === 'boolean';
    case 'null': return value === null;
    case 'integer': return Number.isSafeInteger(value) && value >= (schema.minimum ?? -Infinity);
    default: throw new Error(`Unknown contract type ${type}`);
  }
}

function validateRecord(value, schema, label) {
  if (!isRecord(value)) throw new Error(`${label} must be an object`);
  for (const key of Object.keys(value)) {
    if (!Object.hasOwn(schema, key)) throw new Error(`Unknown ${label} key ${key}`);
    if (!matches(value[key], schema[key])) throw new Error(`Invalid ${label} key ${key}`);
  }
  for (const [key, type] of Object.entries(schema)) {
    if (type.required && !Object.hasOwn(value, key)) throw new Error(`Missing ${label} key ${key}`);
  }
}

function read(expression, env) {
  if (Object.hasOwn(expression, 'literal')) return expression.literal;
  if (Object.hasOwn(expression, 'field')) {
    if (!Object.hasOwn(env.fields, expression.field)) throw new Error(`Unknown field ${expression.field}`);
    return env.fields[expression.field];
  }
  if (Object.hasOwn(expression, 'input')) return env.input?.[expression.input];
  if (Object.hasOwn(expression, 'context')) return env.context[expression.context];
  if (Object.hasOwn(expression, 'projection')) {
    if (expression.projection !== 'model.trials.trialId') throw new Error('Unknown projection');
    return env.fields['model.trials'].map(record => record.trialId);
  }
  return Object.fromEntries(Object.entries(expression).map(([key, value]) => [key, read(value, env)]));
}

function guard(condition, env) {
  const { op } = condition;
  switch (op) {
    case 'always': return true;
    case 'eq':
    case 'ne': {
      const operands = [condition.left, condition.right];
      const values = operands.map(operand => {
        if (!env.input && Object.hasOwn(operand, 'input')) return unknown;
        const value = read(operand, env);
        return value === undefined && env.attestedDelivery && Object.hasOwn(operand, 'context') ? unknown : value;
      });
      if (values.includes(undefined)) return false;
      if (values.includes(unknown)) return unknown;
      return op === 'eq' ? values[0] === values[1] : values[0] !== values[1];
    }
    case 'all':
    case 'any': {
      const results = condition.args.map(child => guard(child, env));
      const decisive = op === 'any';
      if (results.includes(decisive)) return decisive;
      return results.includes(unknown) ? unknown : !decisive;
    }
    default: throw new Error(`Unknown contract guard ${op}`);
  }
}

function transitions(nodeId) {
  const node = nodes.get(nodeId);
  if (!node) throw new Error(`Unknown journey node ${nodeId}`);
  return [...node.transitions, ...contract.globalTransitions.filter(rule => rule.from.includes(nodeId))];
}

function environment(snapshot, input, context, eventId) {
  return {
    fields: snapshot.fields,
    input,
    context: { ...context, currentNodeId: snapshot.nodeId, ...(eventId ? { eventId } : {}) },
  };
}

export function createInitialState() {
  return freeze({
    schemaVersion: contract.schemaVersion,
    nodeId: contract.entryNode,
    revision: 0,
    fields: Object.fromEntries(Object.entries(contract.fields).map(([key, field]) =>
      [key, structuredClone(field.initial)])),
    acceptedEvents: [],
  });
}

function sourceIsEligible(snapshot, sourceId) {
  if (sourceId === null) return true;
  const rule = contract.publicEvidenceCatalog.learnerMediaEligibility.find(item => sourceId.startsWith(item.sourcePrefix));
  if (!rule) return false;
  if (rule.requiresField) return sources.has(sourceId) && rule.allowedValues.includes(snapshot.fields[rule.requiresField]);
  const prefix = rule.sourcePrefix.slice(0, -1);
  const id = sourceId.slice(rule.sourcePrefix.length);
  return snapshot.acceptedEvents.some(record => record.id === id && record.event === mediaEvents[prefix]);
}

function validateDependencies(snapshot, event, env) {
  if (explanationEvents.has(event) && !env.input.cards.every(card => sourceIsEligible(snapshot, card.sourceId))) {
    throw new Error('Explanation includes a source that is unavailable');
  }
  if (event !== 'DIALOGUE_CONTENT_PRESENTED') return;
  const { lineId } = env.input;
  const node = nodes.get(snapshot.nodeId);
  const cue = [...node.dialogue, ...contract.globalDialogue].find(item => item.deliveryField && item.ids.includes(lineId));
  const transcript = node.readableTranscript;
  const transcriptAvailable = transcript?.ids.includes(lineId) && guard(transcript.when, env) === true;
  // The presentation adapter attests the cast and trigger at delivery time.
  const cueAvailable = cue && guard(cue.when, { ...env, attestedDelivery: true }) !== false;
  if (!cue || env.fields[cue.deliveryField] || (!transcriptAvailable && !cueAvailable)) {
    throw new Error(`Dialogue ${lineId} has no pending receipt at this node`);
  }
}

function commit(snapshot, id, event, input, context) {
  if (!Object.hasOwn(contract.events, event)) throw new Error(`Unknown journey event ${event}`);
  const definition = contract.events[event];
  validateRecord(input, definition.inputSchema, 'input');
  validateRecord(context, contract.contextFields, 'context');
  const env = environment(snapshot, input, context, id);
  const eligible = transitions(snapshot.nodeId).filter(rule => rule.event === event && guard(rule.when, env) === true);
  if (eligible.length !== 1) throw new Error(`Event ${event} has ${eligible.length} eligible transitions from ${snapshot.nodeId}`);
  validateDependencies(snapshot, event, env);
  const target = eligible[0].to;
  const nodeId = typeof target === 'string' ? target : read(target, env);
  if (!nodes.has(nodeId) || (target.field === 'resume.nodeId' && nodes.get(nodeId).kind === 'terminal')) {
    throw new Error(`Invalid target node ${nodeId}`);
  }
  const effects = [...definition.effects];
  if (definition.effectCases) {
    const cases = definition.effectCases.filter(item => guard(item.when, env) === true);
    if (cases.length !== 1) throw new Error(`Event ${event} must select exactly one effect case`);
    effects.push(...cases[0].effects);
  }
  const fields = { ...snapshot.fields };
  for (const effect of effects) {
    const { op, field } = effect;
    const previous = fields[field];
    switch (op) {
      case 'assign':
        fields[field] = structuredClone(read(effect.value, env));
        break;
      case 'increment':
        fields[field] = previous + effect.by;
        break;
      case 'appendOnce': {
        const item = read(effect.value, env);
        if (!previous.some(record => record[effect.uniqueBy] === item[effect.uniqueBy])) {
          fields[field] = [...previous, structuredClone(item)];
        }
        break;
      }
      default: throw new Error(`Unknown contract effect ${op}`);
    }
    if (!Object.hasOwn(contract.fields, field) || !matches(fields[field], contract.fields[field])) {
      throw new Error(`Invalid effect on ${field}`);
    }
  }
  return freeze({
    schemaVersion: snapshot.schemaVersion,
    nodeId,
    revision: snapshot.revision + 1,
    fields,
    acceptedEvents: [...snapshot.acceptedEvents, {
      id, event, input: structuredClone(input), context: structuredClone(context),
      fromNodeId: snapshot.nodeId, toNodeId: nodeId,
    }],
  });
}

function replay(events) {
  let state = createInitialState();
  const ids = new Set();
  for (const record of events) {
    if (!record || typeof record.id !== 'string' || !record.id.trim() || ids.has(record.id)) {
      throw new Error('Invalid or repeated command ID in save');
    }
    ids.add(record.id);
    state = commit(state, record.id, record.event, record.input, record.context);
  }
  return state;
}

export function applyEvent(snapshot, { id, event, input = {}, expectedRevision, schemaVersion }, context = {}) {
  if (typeof id !== 'string' || !id.trim()) throw new Error('A stable command ID is required');
  if (snapshot.schemaVersion !== contract.schemaVersion ||
      (schemaVersion !== undefined && schemaVersion !== snapshot.schemaVersion)) {
    throw new Error('Journey schema version mismatch');
  }
  const duplicateIndex = snapshot.acceptedEvents.findIndex(record => record.id === id);
  if (duplicateIndex !== -1) {
    const duplicate = snapshot.acceptedEvents[duplicateIndex];
    if (duplicate.event !== event || !sameValue(duplicate.input, input)) throw new Error(`Conflicting command ID ${id}`);
    if (duplicateIndex === snapshot.acceptedEvents.length - 1) return snapshot;
    return replay(snapshot.acceptedEvents.slice(0, duplicateIndex + 1));
  }
  if (expectedRevision !== undefined && expectedRevision !== snapshot.revision) {
    throw new Error(`Expected revision ${expectedRevision}, found revision ${snapshot.revision}`);
  }
  return commit(snapshot, id, event, input, context);
}

export function getAvailableEvents(snapshot, context = {}) {
  const { input, ...trusted } = context;
  validateRecord(trusted, contract.contextFields, 'context');
  const env = environment(snapshot, input, trusted);
  const available = new Set();
  for (const rule of transitions(snapshot.nodeId)) {
    if (guard(rule.when, env) === false) continue;
    if (input !== undefined) {
      try {
        validateRecord(input, contract.events[rule.event].inputSchema, 'input');
        validateDependencies(snapshot, rule.event, env);
      } catch {
        continue;
      }
    }
    available.add(rule.event);
  }
  return [...available];
}

export function getDialogueCues(snapshot, trigger = 'node_enter', context = {}) {
  validateRecord(context, contract.contextFields, 'context');
  const node = nodes.get(snapshot.nodeId);
  const last = snapshot.acceptedEvents.at(-1);
  const actualTrigger = trigger === 'node_enter'
    ? last?.fromNodeId !== last?.toNodeId
    : trigger === 'cast_arrived' || trigger === 'scene_resumed' || last?.event === trigger;
  const env = environment(snapshot, last?.input, context, last?.id);
  const cues = [...node.dialogue, ...contract.globalDialogue].filter(cue =>
    (cue.kind === 'optional_learner_support' ||
      (node.kind !== 'terminal' && actualTrigger && cue.triggerOn?.includes(trigger))) &&
    guard(cue.when, env) === true);
  if (node.readableTranscript && guard(node.readableTranscript.when, env) === true) {
    cues.push({ ...node.readableTranscript, kind: 'transcript' });
  }
  return structuredClone(cues);
}

function parseSave(raw) {
  if (raw === null) return createInitialState();
  const snapshot = JSON.parse(raw);
  if (snapshot?.schemaVersion !== contract.schemaVersion || !Array.isArray(snapshot.acceptedEvents)) {
    throw new Error('Unsupported or incomplete journey save');
  }
  const rebuilt = replay(snapshot.acceptedEvents);
  if (!sameValue(snapshot, rebuilt)) throw new Error('Saved revision or fields do not match the accepted events');
  return rebuilt;
}

export function createJourneyStore(storage) {
  let state = createInitialState();
  let loadError = null;
  let raw = null;
  let recoveryId = null;
  let pending = null;

  function write(next) {
    const json = JSON.stringify(next);
    storage.setItem(storageKey, json);
    raw = json;
    state = next;
  }

  function recoverTrial() {
    write(applyEvent(state, { id: recoveryId, event: 'INTERRUPTED_TRIAL_RECOVERED' }, { sessionReopened: true }));
    recoveryId = null;
    loadError = null;
    return state;
  }

  try {
    storage ??= globalThis.localStorage;
    if (!storage) throw new Error('Journey storage is unavailable');
    raw = storage.getItem(storageKey);
    state = parseSave(raw);
    if (state.fields['model.phase'] === 'running') {
      recoveryId = `recover-${state.fields['model.activeRunId']}-${state.revision}`;
      recoverTrial();
    }
  } catch (error) {
    loadError = error;
  }

  return {
    get state() { return state; },
    get loadError() { return loadError; },
    dispatch(event, input = {}, context = {}) {
      if (loadError && !(recoveryId && event === 'INTERRUPTED_TRIAL_RECOVERED')) throw loadError;
      const { eventId, expectedRevision = state.revision, ...trusted } = context;
      const retryId = pending?.event === event && sameValue(pending.input, input) ? pending.id : undefined;
      const id = eventId ?? retryId ?? globalThis.crypto.randomUUID();
      const latest = storage.getItem(storageKey);
      if (latest !== raw) {
        raw = latest;
        pending = null;
        recoveryId = null;
        try {
          state = parseSave(raw);
        } catch (error) {
          loadError = error;
          throw error;
        }
        loadError = null;
        if (state.acceptedEvents.some(record => record.id === id)) {
          return applyEvent(state, { id, event, input, expectedRevision }, trusted);
        }
        throw new Error(`Saved revision changed to ${state.revision}. Review it and retry.`);
      }
      if (recoveryId) return recoverTrial();
      const duplicate = state.acceptedEvents.some(record => record.id === id);
      const next = applyEvent(state, { id, event, input, expectedRevision }, trusted);
      if (duplicate) return next;
      pending = next.acceptedEvents.at(-1);
      write(next);
      pending = null;
      return state;
    },
    reset() {
      if (!storage) throw loadError ?? new Error('Journey storage is unavailable');
      storage.removeItem(storageKey);
      state = createInitialState();
      loadError = null;
      raw = null;
      recoveryId = null;
      pending = null;
      return state;
    },
    exportJSON() { return raw ?? JSON.stringify(state); },
  };
}
