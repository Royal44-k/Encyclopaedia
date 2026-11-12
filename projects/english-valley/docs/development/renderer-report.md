# First journey renderer

The Three.js adapter owns the shared scene cameras, light and fog, pointer picking, evidence framing, runoff trays, and the four procedural speaking figures. Geometry, terrain height, saved placement validation and the water shader come from the environment module.

The opening view frames the greenhouse, ring garden, workshop and bridge. Map opens a wider view of the same scene. Place-to-place transitions follow the environment's garden paths, the main bridge and the eastern bank. Reduced motion applies the same arrival positions on the next rendered frame. Dialogue readiness follows the proxy figures reaching their speaking positions. These figures provide blocking and basic stride animation for the prototype. Facial acting, hand contact, gaze choreography and the final models remain production work.

The baseline and candidate trays share rain, water route and playback progress. The candidate plate can rest over the source or in the unrelated area. Only the source-cover case uses fewer soil particles. The miniatures never alter the shared stream or the actual cover. The installed-cover evidence camera reads the same field geometry that shows a confirmed placement.

The two bridge records use the same fixed camera. The historical appearance is applied for a single render, then the adapter restores the previous camera, canvas resolution, trial presentation and current observation. Dated records omit the session's speaking figures. Evidence is rendered at 800 × 480 and stored as JPEG at quality 0.78. The frame files contain actual browser renders from the current scene.

The adapter uses ACES filmic tone mapping, sRGB output, a low-intensity PMREM environment and a warm directional key with PCF shadows. Standard and high cap device pixel ratio at 1.5 and 2, with 1024 and 2048 shadow maps. Static shadows are reused and walking shadows update on a limited cadence. The reduced-motion idle view draws again when scene or settings change. Context loss suspends rendering, resolves pending actions as interrupted and allows the browser to restore the view.

## Checks

- Node syntax check and production build completed. The app's state suite passed 19 tests. Vite reported a bundle-size advisory.
- A missing-WebGL harness exercised the safe adapter, with failed navigation, null evidence and false cast readiness.
- A 1440 × 900 headless Edge test with ANGLE SwiftShader exercised actual WebGL initialization, travel, cast readiness, pickup, placement validation, evidence rendering, model comparison, cancellation and return. It checked that evidence restored the original canvas dimensions and that bridge and trial variants produced different JPEGs. That software rendering setup establishes functionality. Classroom hardware frame timing and sustained interactive performance still need measurement.
- The visual captures were inspected for the greenhouse and bridge framing, the bottle and water clues, the cover on the agreed soil, and both comparison trays. Review source and installation records together with their story labels.

[Renderer source](../../app/src/world/renderer.js) · [Overview frame](../../app/artifacts/renderer-overview.png) · [Bridge record](../../app/artifacts/renderer-bridge_now.jpg) · [Path record](../../app/artifacts/renderer-path.jpg) · [Installed cover record](../../app/artifacts/renderer-installed.jpg) · [Runoff comparison record](../../app/artifacts/renderer-trial.jpg)
