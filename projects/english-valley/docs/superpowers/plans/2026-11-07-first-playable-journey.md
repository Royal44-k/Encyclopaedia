# English Valley first playable journey — implementation plan

> For agentic workers: use the subagent-driven-development workflow with independent ownership and a fresh final review. User has explicitly authorised autonomous continuation into this next stage. No additional design approval is needed.

**Goal:** Deliver a local runnable Three.js English Valley journey from bridge discovery through fieldwork, controlled comparison, optional placement, explanation and saved return plans.

**Architecture:** The approved declaration drives an isolated state engine. One shared Three.js world supplies all cameras, evidence views and interactions. Accessible DOM panels provide English dialogue, optional Chinese support, records and editable work. Browser storage preserves confirmed state; no account or external messages.

**Tech stack:** Node 24, vanilla ES modules, Three.js 0.187.0, Vite 8.3.6, Node test runner; browser smoke checks through installed Playwright or available browser control.

**Spec:** `docs/design/v6/implementation-handoff-v6_1.md`, `first-journey-flow-v6_1.json`, `classroom-playthrough-v6_1.md`, `visual-and-sound-direction.md`, `docs/design/world-layout-v3.json`.

## Global constraints

- Same eight anchors and one bridge/greenhouse; map and close views share real geometry.
- Core evidence C1-E01/02/03 plus Mei's own statements; model keeps an unchanged no-cover baseline.
- Cleaning, trial and actual installation are distinct. Water never clears as a reward. Follow-up stays planned.
- English examples never impersonate the student. No grammar keyword gate. Drafts and unknowns can be saved.
- No completed runtime, actor performance or classroom effectiveness claims without the corresponding evidence.
- Frontend palette: deep pine #183c32, sage #879b7e, mist #dce3d6, chalk #f2f1e8, brass #b49a60, ink #24362c. Existing Cormorant Garamond display and DM Sans body; Chinese system sans fallback.
- Layout: full-viewport living valley; restrained top wordmark and location/time, left field notes, lower dialogue when present, compact right journal. No marketing landing-page cards or dashboard layout.
- Signature: move through one garden and return to the very same bridge with evidence and persistent changes.

## Files and interfaces

- `app/src/core/journey.js`: pure reducer and storage. `createInitialState()`, `applyEvent(snapshot,{id,event,input},context)`, `getAvailableEvents(snapshot,context)`, `getDialogueCues(snapshot,trigger,context)`, `createJourneyStore(storage)`.
- Snapshot: `{schemaVersion,nodeId,revision,fields,acceptedEvents}`; `fields` use exact contract keys. Store: `{state,dispatch(event,input,context),reset(),exportJSON()}`. Throw on rejection/save failure; commit only after successful durable write.
- `app/src/world/environment.js`: `createEnvironment(THREE)` returns `{group,anchors,interactables,setWorldState(fields),setObservation(mode),update(dt,time),dispose()}`. Object targets use `userData.action` and `userData.locationId`. No renderer or DOM ownership.
- `app/src/world/renderer.js`: renderer, lighting, cameras, paths, picking, snapshots, quality and resize. `createValley(canvas,{onPick,onArrive})` exposes `goTo(locationId)`, `overview()`, `setWorldState(fields)`, `captureEvidence(kind)`, `setModel(options)`, `dispose()`.
- `app/src/main.js`, `ui/styles.css`: course interface, source dialogues, action wiring, notebook, evidence, model/placement/editor flow and accessibility.
- `app/tests/*.test.mjs`: meaningful state and persistence checks; `app/scripts/browser-check.mjs`: real UI journey and screenshots.

## Task 1 — Domain journey and save safety

- [x] Read the approved contract; write failing tests for wrong-order trial rejection, cleanup without water change, shared provenance, model-vs-world separation, cancelled/late trial, duplicate command, rejected storage write and restored drafts.
- [x] Implement declared guards/effects and typed inputs, cue conditions and durable storage; preserve provided dialogue receipts. Default context must not blindly set all gates true.
- [x] Run Node tests and record failures then passing results. Include direct-blame interview and partial exit paths.

## Task 2 — Consistent three-dimensional environment

- [x] Build one inspectable scene with arched glass conservatory, western workshop, treehouse, flower ring, eastern stream/bare bed/bridge and southern exit.
- [x] Use authored geometry and instanced natural foliage, varied PBR surfaces, stone/wood contact and animated water. Existing low-poly assets are not final hero substitutes.
- [x] Expose real bottle, cover and model placement states; evidence camera variants must restore current world presentation.
- [x] Inspect actual browser frames for map/close-view consistency and readable clues; record what still needs production art.

## Task 3 — Playable classroom flow and interface

- [x] Build bridge introduction, evidence comparisons, route choices, Mei conversation, model placement/results, proposal/field placement, editable explanation, return plan, saved exit and resume.
- [x] Add English/Chinese assistance, dialogue replay, muted/default-safe sound, reduced motion and keyboard-equivalent controls. Speech synthesis, if available, must be labelled preview, never formal actor VO.
- [x] Use actual scene captures as sourced world records, with model/history labels; never use AI concept pictures as screenshots.
- [x] Validate input, distinguish unsaved work, surface storage failure and export data. Verify partial journeys remain truthful.

## Task 4 — Integration, visual review and delivery

- [x] Run domain suite and production build.
- [x] Run real browser main path, partial/no-install path and reload path; inspect desktop and narrower viewport screenshots, console errors and rendering behaviour; record that classroom hardware performance remains unmeasured.
- [x] Fresh reviewer checks spec compliance, scene state, source attribution and practical failure modes. Fix important findings and rerun affected checks.
- [x] Document launch command, actual implemented scope, screenshots, tests and remaining high-fidelity/voice/teaching validation work; update root README without overwriting prior design provenance.

## Review focus

- Out-of-order actions or refreshing mid-trial must not invent installation or an ecological outcome.
- Navigation must not strand an interview; no separate geometry for overview and bridge.
- Student prose must survive editing and must not be inserted into DOM as executable HTML.
- WebGL/audio/storage failure needs a usable explanation or recovery, not an empty screen.
- A slow reader, muted device or keyboard-only student must retain all evidence and an exit.

## Decisions and progress

Ruling: This workspace has no Git repository or existing application. Keep implementation in new `app/` and preserve the design/asset tree; there is no main branch or worktree to modify. Cost if wrong: later repository setup, not lost content.

Ruling: Independent domain and scene tasks may proceed concurrently in disjoint files, per active collaboration instructions. Root owns integration and UI. Cost if interfaces change: one coordination pass.

Ruling: This phase produces a playable authored 3D environment and interaction sample, not a claim of final game-production characters/VO. Quality is assessed through actual output, and any unmet realism target remains explicitly open.


## Delivery record · 2026-11-08

The first playable journey is delivered in `app/`. Twenty domain/scene tests passed, the full browser route passed, and twelve browser recovery/resilience cases passed on the same frozen production bundle. A separate missing-image keyboard regression passed. Actual overview/model frames and a 53.44-second continuous browser recording are preserved. See [delivery and remaining work](../../development/first-playable-delivery.md).

This closes the functional sample stage, not final art or curriculum production. Procedural character figures, hand contact, near-camera natural materials, final voice acting, school-device performance, textbook-printing confirmation and teacher/student trials remain explicit production work. No external publishing was performed.
