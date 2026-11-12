/** Scene audio with a user-gesture unlock, one-shot dialogue and independent mixes. */
const clamp = (value, fallback) => Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;
const roleProfiles = {
  NOOR: { names: /brian|guy|ryan|andrew|mark/i, rate: .97, pitch: 1.02 },
  ROWAN: { names: /david|george|daniel|roger|james/i, rate: .92, pitch: .95 },
  MEI: { names: /sonia|susan|jenny|jane|samantha/i, rate: .94, pitch: 1 },
  SAM: { names: /eric|christopher|thomas|arthur|david/i, rate: .91, pitch: .91 },
  IRIS: { names: /aria|emma|sara|zira|salli/i, rate: .98, pitch: 1.03 },
  AMINA: { names: /ava|hazel|joanna|susan|samantha/i, rate: .96, pitch: 1 },
  NARR: { names: /jenny|hazel|sonia|samantha/i, rate: .94, pitch: 1 },
};

export function createAudioDirector({ lines = {}, manifest, onState = () => {}, onSpeaker = () => {}, onError = () => {}, platform = {} } = {}) {
  const lineMap = Array.isArray(lines) ? Object.fromEntries(lines.map(line => [line.id, line])) : lines;
  const fetchFile = platform.fetch ?? globalThis.fetch?.bind(globalThis);
  const createContext = platform.createContext ?? (() => new (globalThis.AudioContext || globalThis.webkitAudioContext)());
  const doc = Object.hasOwn(platform, 'document') ? platform.document : globalThis.document;
  const synth = Object.hasOwn(platform, 'speechSynthesis') ? platform.speechSynthesis : globalThis.speechSynthesis;
  const Utterance = platform.SpeechSynthesisUtterance ?? globalThis.SpeechSynthesisUtterance;
  const later = platform.setTimeout ?? globalThis.setTimeout;
  const clearLater = platform.clearTimeout ?? globalThis.clearTimeout;
  let assets = manifest ?? { lines: {}, music: {}, ambience: {} };
  let disposed = false, context, buses, current = null, generation = 0;
  let queue = [], seen = new Set(), completed = new Set(), voices = {};
  const buffers = new Map(), tracks = { music: null, ambience: null }, trackGenerations = { music: 0, ambience: 0 };
  const liveSources = new Set(), cleanupTimers = new Set();
  const state = {
    enabled: true, musicEnabled: true, ambienceEnabled: true, muted: false, unlocked: false,
    suspended: false, blocked: false, speaking: false, loadingSpeech: false, currentId: null,
    currentSpeaker: null, sceneKey: null, mood: 'arrival', ambience: null, ducked: false,
    failedLineId: null, degradedVoice: false, fallbackReason: null, lastError: null,
    musicPlaying: null, ambiencePlaying: null, volumes: { speech: .95, music: .2, ambience: .14 },
  };
  const active = () => !disposed && state.unlocked && !state.suspended && !state.muted;
  const voiceActive = () => active() && state.enabled;
  const getState = () => ({ ...state, volumes: { ...state.volumes }, queuedIds: queue.slice(), completedIds: [...completed], voices: { ...voices } });
  function emit() { if (!disposed) onState(getState()); }
  function report(error, kind, lineId = null) {
    state.lastError = { kind, lineId, message: error?.message || String(error) };
    onError({ ...state.lastError, retryable: true, cause: error }); emit();
  }
  function ramp(gain, value, seconds = .3) {
    if (!context || !gain) return;
    gain.cancelScheduledValues(context.currentTime);
    gain.setValueAtTime(gain.value, context.currentTime);
    gain.setTargetAtTime(value, context.currentTime, Math.max(.015, seconds / 3));
  }
  function mix() {
    if (!buses) return;
    ramp(buses.master.gain, active() ? 1 : 0, .12);
    ramp(buses.speech.gain, state.enabled ? state.volumes.speech : 0, .1);
    ramp(buses.music.gain, state.musicEnabled ? state.volumes.music * (state.ducked ? .23 : 1) : 0, state.ducked ? .16 : .8);
    ramp(buses.ambience.gain, state.ambienceEnabled ? state.volumes.ambience * (state.ducked ? .5 : 1) : 0, .4);
  }
  function initContext() {
    if (context) return;
    context = createContext();
    buses = Object.fromEntries(['master', 'speech', 'music', 'ambience'].map(key => [key, context.createGain()]));
    buses.master.connect(context.destination);
    for (const key of ['speech','music','ambience']) buses[key].connect(buses.master);
    buses.master.gain.setValueAtTime(0, context.currentTime); mix();
  }
  async function loadBuffer(src) {
    if (!buffers.has(src)) {
      const request = (async () => {
        if (!fetchFile) throw new Error('Audio files cannot be loaded in this browser.');
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timer = later(() => controller?.abort(), 15000);
        try {
          const response = await fetchFile(src, controller ? { signal: controller.signal } : undefined);
          if (!response.ok) throw new Error(`Audio file unavailable (${response.status}): ${src}`);
          return await context.decodeAudioData(await response.arrayBuffer());
        } finally { clearLater(timer); }
      })();
      buffers.set(src, request);
      request.catch(() => { if (buffers.get(src) === request) buffers.delete(src); });
    }
    return buffers.get(src);
  }
  function releaseSource(source) {
    if (!source) return;
    source.onended = null;
    try { source.stop(); } catch { /* Already ended. */ }
    try { source.disconnect(); } catch { /* Disposed by the browser. */ }
    liveSources.delete(source);
  }
  function stopCurrent({ retain = false, clearQueue = false } = {}) {
    ++generation;
    const interrupted = current;
    current = null;
    if (clearQueue) queue = [];
    if (interrupted) {
      releaseSource(interrupted.source);
      if (interrupted.utterance) { interrupted.utterance.onend = null; interrupted.utterance.onerror = null; synth?.cancel(); }
      if (retain && !queue.includes(interrupted.id)) queue.unshift(interrupted.id);
    }
    state.speaking = false; state.loadingSpeech = false; state.currentId = null; state.currentSpeaker = null; state.ducked = false;
    if (interrupted) onSpeaker(null, { speaking: false, lineId: interrupted.id });
    mix(); emit();
  }
  function stopTrack(channel, fade = 0) {
    ++trackGenerations[channel];
    const previous = tracks[channel]; tracks[channel] = null; state[`${channel}Playing`] = null;
    if (!previous) return;
    if (fade && previous.source) {
      ramp(previous.gain.gain, 0, fade);
      const timer = later(() => { releaseSource(previous.source); previous.gain.disconnect(); cleanupTimers.delete(timer); }, fade * 1000 + 60);
      cleanupTimers.add(timer);
    } else { releaseSource(previous.source); previous.gain?.disconnect(); }
  }
  async function syncTrack(channel, key, entry) {
    const src = typeof entry === 'string' ? entry : entry?.src;
    const allowed = active() && state[`${channel}Enabled`];
    if (!src || !allowed) { if (tracks[channel]) stopTrack(channel); return; }
    if (tracks[channel]?.src === src) {
      const existing = tracks[channel], level = entry?.gain ?? 1;
      const changed = existing.key !== key || existing.level !== level;
      existing.key = key; state[`${channel}Playing`] = key;
      if (existing.level !== level) { existing.level = level; ramp(existing.gain.gain, level, .7); }
      if (changed) emit();
      return;
    }
    const token = ++trackGenerations[channel];
    // Keep an existing bed until the replacement has actually decoded.
    try {
      const buffer = await loadBuffer(src);
      if (token !== trackGenerations[channel] || !active() || !state[`${channel}Enabled`]) return;
      stopTrack(channel, 1.7);
      const source = context.createBufferSource(), gain = context.createGain();
      source.buffer = buffer; source.loop = true;
      if (typeof entry?.loopStart === 'number') source.loopStart = entry.loopStart;
      if (typeof entry?.loopEnd === 'number') source.loopEnd = entry.loopEnd;
      gain.gain.setValueAtTime(0, context.currentTime); source.connect(gain); gain.connect(buses[channel]);
      liveSources.add(source); source.start(); ramp(gain.gain, entry?.gain ?? 1, 1.7);
      tracks[channel] = { key, src, source, gain, level: entry?.gain ?? 1 }; state[`${channel}Playing`] = key; emit();
    } catch (error) {
      if (token !== trackGenerations[channel] || disposed) return;
      report(error, channel);
    }
  }
  function syncBeds() {
    if (!context || disposed) return;
    const track = assets.music?.[state.mood] ?? assets.music?.arrival;
    const ambienceKey = state.ambience ?? track?.ambience ?? (state.mood === 'bridge' || state.mood === 'upstream' ? 'stream' : 'garden');
    void syncTrack('music', state.mood, track);
    void syncTrack('ambience', ambienceKey, assets.ambience?.[ambienceKey]);
  }
  function chooseVoices() {
    const available = synth?.getVoices?.().filter(voice => /^en(?:-|_|$)/i.test(voice.lang)) ?? [];
    const used = new Set(); voices = {};
    for (const [role, profile] of Object.entries(roleProfiles)) {
      const free = available.filter(voice => !used.has(voice.voiceURI || voice.name));
      const voice = free.find(voice => profile.names.test(voice.name)) ?? free[0] ?? available.find(voice => profile.names.test(voice.name)) ?? available[0];
      if (voice) { voices[role] = { name: voice.name, voiceURI: voice.voiceURI, shared: used.has(voice.voiceURI || voice.name) }; used.add(voice.voiceURI || voice.name); }
    }
  }
  function finish(id, token, error) {
    if (token !== generation || current?.id !== id) return;
    const previous = current; current = null;
    if (previous.source) { previous.source.onended = null; try { previous.source.disconnect(); } catch {} liveSources.delete(previous.source); }
    state.speaking = false; state.loadingSpeech = false; state.currentId = null; state.currentSpeaker = null; state.ducked = false;
    onSpeaker(null, { speaking: false, lineId: id });
    if (error) { state.failedLineId = id; report(error, 'speech', id); }
    else { completed.add(id); if (state.failedLineId === id) state.failedLineId = null; }
    mix(); emit(); void pump();
  }
  function beginSpeaking(id, speaker, token) {
    if (token !== generation || current?.id !== id) return false;
    if (state.lastError?.kind === 'speech' && state.lastError.lineId === id) state.lastError = null;
    state.loadingSpeech = false; state.speaking = true; state.ducked = true; state.currentSpeaker = speaker;
    onSpeaker(speaker, { speaking: true, lineId: id }); mix(); emit(); return true;
  }
  async function pump() {
    if (!voiceActive() || current || !queue.length) return;
    const id = queue.shift(), line = lineMap[id];
    if (!line || line.speaker === 'LEARNER') { void pump(); return; }
    const token = ++generation;
    current = { id, token, source: null, utterance: null };
    state.currentId = id; state.loadingSpeech = true; state.failedLineId = null; emit();
    const recorded = assets.lines?.[id];
    const src = typeof recorded === 'string' ? recorded : recorded?.src;
    try {
      if (src) {
        const buffer = await loadBuffer(src);
        if (token !== generation || !voiceActive()) return;
        const source = context.createBufferSource(); source.buffer = buffer; source.connect(buses.speech);
        source.onended = () => finish(id, token); current.source = source;
        liveSources.add(source); source.start(); state.degradedVoice = false; state.fallbackReason = null;
        beginSpeaking(id, line.speaker, token);
      } else {
        if (!synth || !Utterance) throw new Error('This line has no recording, and device speech is unavailable. The full text remains readable.');
        chooseVoices();
        const assignment = voices[line.speaker], profile = roleProfiles[line.speaker] ?? roleProfiles.NARR;
        const utterance = new Utterance(line.english ?? line.text ?? '');
        utterance.voice = synth.getVoices().find(voice => voice.voiceURI === assignment?.voiceURI && voice.name === assignment?.name) ?? null;
        utterance.lang = utterance.voice?.lang ?? 'en-GB'; utterance.rate = profile.rate; utterance.pitch = profile.pitch; utterance.volume = state.volumes.speech;
        current.utterance = utterance; state.degradedVoice = true;
        state.fallbackReason = assignment?.shared ? 'The device has too few English voices to separate every character.' : 'A device voice is being used because this line has no recorded performance.';
        utterance.onstart = () => beginSpeaking(id, line.speaker, token);
        utterance.onend = () => finish(id, token);
        utterance.onerror = event => finish(id, token, new Error(`Device speech could not play (${event.error || 'unknown error'}).`));
        synth.speak(utterance); emit();
      }
    } catch (error) { finish(id, token, error); }
  }
  function enqueue(ids = []) {
    for (const id of ids) {
      if (!lineMap[id] || lineMap[id].speaker === 'LEARNER' || seen.has(id)) continue;
      seen.add(id); queue.push(id);
    }
    void pump();
  }
  async function unlock() {
    if (disposed) return false;
    try {
      // Create/resume synchronously in the caller's trusted gesture, before await.
      initContext(); const resumed = context.resume(); await resumed;
      if (disposed) return false;
      state.unlocked = context.state === 'running'; state.blocked = !state.unlocked;
      if (!state.unlocked) throw new Error('Sound is paused by the browser. Click the sound control to enable it.');
      state.lastError = null; mix(); syncBeds(); void pump(); emit(); return true;
    } catch (error) { state.blocked = true; state.unlocked = false; report(error, 'unlock'); return false; }
  }
  function enterScene({ key, mood = state.mood, lineIds = [], ambience = null }) {
    if (disposed) return;
    if (key !== state.sceneKey) {
      stopCurrent({ clearQueue: true }); seen = new Set(); completed = new Set();
      state.sceneKey = key; state.failedLineId = null;
    }
    const changed = state.mood !== mood || state.ambience !== ambience;
    state.mood = mood; state.ambience = ambience;
    if (changed || !tracks.music) syncBeds(); enqueue(lineIds); emit();
  }
  function present({ key = state.sceneKey, lineIds = [] }) {
    if (key !== state.sceneKey || disposed) return;
    enqueue(lineIds);
  }
  async function replay(id) {
    if (!lineMap[id] || lineMap[id].speaker === 'LEARNER' || disposed) return false;
    if (!state.unlocked || state.blocked) { if (!await unlock()) return false; }
    if (!state.enabled || state.muted || state.suspended) return false;
    const remaining = [...new Set([...(current && current.id !== id ? [current.id] : []), ...queue].filter(pendingId => pendingId !== id))];
    stopCurrent({ clearQueue: true }); queue.push(id, ...remaining); state.failedLineId = null; void pump(); return true;
  }
  function setEnabled(value) {
    state.enabled = Boolean(value);
    if (!state.enabled) stopCurrent({ retain: true }); else void pump();
    mix(); emit();
  }
  function setMusicEnabled(value) { state.musicEnabled = Boolean(value); mix(); syncBeds(); emit(); }
  function setAmbienceEnabled(value) { state.ambienceEnabled = Boolean(value); mix(); syncBeds(); emit(); }
  function setMuted(value) {
    state.muted = Boolean(value);
    if (state.muted) stopCurrent({ retain: true }); else void pump();
    mix(); syncBeds(); emit();
  }
  function setVolumes(values = {}) { for (const key of Object.keys(state.volumes)) state.volumes[key] = clamp(values[key], state.volumes[key]); mix(); emit(); }
  function suspend() {
    if (disposed || state.suspended) return;
    state.suspended = true; stopCurrent({ retain: true }); stopTrack('music'); stopTrack('ambience'); mix(); emit();
  }
  async function resume() {
    if (disposed) return;
    state.suspended = false;
    if (context?.state === 'suspended' && state.unlocked) { try { await context.resume(); } catch (error) { state.blocked = true; state.unlocked = false; report(error,'unlock'); } }
    mix(); syncBeds(); void pump(); emit();
  }
  function setManifest(value) { assets = value || {}; buffers.clear(); syncBeds(); void pump(); }
  const visibility = () => { if (doc?.hidden) suspend(); else void resume(); };
  const voicesChanged = () => { chooseVoices(); emit(); };
  doc?.addEventListener?.('visibilitychange', visibility);
  synth?.addEventListener?.('voiceschanged', voicesChanged); chooseVoices();
  return {
    unlock, setEnabled, setMusicEnabled, setAmbienceEnabled, setMuted, setVolumes, enterScene, present, replay,
    stopSpeech: () => stopCurrent({ clearQueue: true }), suspend, resume, setManifest, getState,
    dispose() {
      if (disposed) return;
      stopCurrent({ clearQueue: true }); stopTrack('music'); stopTrack('ambience');
      disposed = true; for (const timer of cleanupTimers) clearLater(timer); cleanupTimers.clear();
      for (const source of liveSources) releaseSource(source);
      doc?.removeEventListener?.('visibilitychange', visibility); synth?.removeEventListener?.('voiceschanged', voicesChanged);
      for (const bus of Object.values(buses ?? {})) bus.disconnect();
      context?.close?.().catch?.(() => {}); buffers.clear();
    },
  };
}
