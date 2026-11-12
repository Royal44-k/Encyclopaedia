# First journey runtime

The runtime reads the approved v6.1 JSON directly. It evaluates current-node and applicable global transitions, requires one matching guard, resolves all effect operands against the prior revision, then publishes the new node and flat fields as one immutable snapshot. A different input with an already accepted ID is rejected. Reusing the ID with identical input returns the original revision while the store retains any newer state.

## Integration

- `getAvailableEvents(state, context)` returns event names. Missing context fails its gate. A guard that still depends on unavailable input can remain eligible for display. Supply `context.input` to check an actual candidate payload.
- `getDialogueCues(state, trigger, context)` returns cues with `ids` and `kind`. Query `node_enter` on the revision that changed nodes and query a named domain event on the revision that accepted it. Use `cast_arrived` or `scene_resumed` for deferred cues. Optional examples and the complete Mei transcript are returned separately from performed lines. Record presentation only after the eligible content has been provided.
- `createJourneyStore(storage)` uses `english-valley.journey.v1` in browser local storage or an injected synchronous adapter. `dispatch(event, input, context)` accepts an optional `eventId` and `expectedRevision` in its context. If a write fails, the same event and payload reuse the pending ID on retry. State is published after the storage write succeeds.
- A loaded save is reconstructed from its accepted events and checked against the serialized snapshot. Invalid content is kept for export, and `loadError` blocks further writes until explicit reset. A running trial is recovered as a durable system event on load. When this write fails, retry with `dispatch('INTERRUPTED_TRIAL_RECOVERED')`.
- Use the public catalog IDs for observed or shared records. Dynamic explanation sources use `trial.<eventId>`, `implementation.<eventId>` or `cleanup.<eventId>` with their corresponding accepted command ID. The UI supplies provenance for actual frame and audio durability.

## Verification

The first run of `node --test app/tests/journey.test.mjs` failed during import before the runtime existed. After implementation the 17 initial scenarios passed. A subsequent regression test failed on a stale exact-ID retry because the store rejected the changed revision before checking the command ID. The final `npm.cmd test --prefix app` run passed all 19 tests on Node v24.20.0.

The tests exercise order and context gates, cleanup with unchanged water, peer-shared provenance, direct-blame interview and transcript receipts, all three fixed comparisons, cancellation and late callbacks, interrupted-trial recovery, pause and draft restoration, installation checks, valid source references, planned follow-up, unresolved exit and resumption, storage failure, duplicate commands, and stale revisions. A temporary Vite server also returned HTTP 200 for the runtime and the JSON imported from outside the app directory.

## Boundaries

The presentation and renderer adapters attest actual cast presence, location arrival, completed comparison playback, placement geometry, scene version compatibility and media persistence. Domain tests use explicit adapter inputs and cover saved data behavior. Browser rendering and classroom use require their own checks. The local storage store detects revisions already written by another tab. Truly simultaneous writes in separate tabs lack a compare-and-swap operation. The supported classroom modes share one device and one active app session.
