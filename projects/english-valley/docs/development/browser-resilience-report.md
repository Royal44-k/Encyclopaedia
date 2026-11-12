# First journey browser resilience

The production preview serving `/assets/index-U85a2Duk.js` passed all 12 cases. Edge reported zero unexpected console errors or uncaught page errors.

The regression script drives the production preview in headless Microsoft Edge with Playwright and software WebGL. Each case uses an isolated browser context. The fault cases reject one matching `localStorage.setItem` call and verify the rejected command separately from browser errors. Model cases start from the browser-generated [checkpoint](../../app/artifacts/model-checkpoint.json) after two real comparisons. The incompatible scene case replays that checkpoint with a different layout version in its session-opening command and verifies the resulting save loads through the journey store.

## Checks

| Scenario | Browser and storage assertions |
| --- | --- |
| First session write | Explore stays visible and usable. Retry commits `SESSION_OPENED` once with the original command ID. |
| Bridge media write | The observation cannot be recorded after a failed write. On retry, both images decode in the dialog and match the images in storage before the observation can be recorded. |
| Partial visit | A picture note and one bridge observation survive save, reload and resume. Model trials, installation and follow-up remain absent. |
| Open question | The learner’s question appears on the unresolved terminal screen after reload. Resume returns to the explanation step and retains the question and observed evidence. |
| Malformed journey | Recovery exports the original unreadable text and preserves the stored bytes. |
| Incompatible scene | A replay-valid save from a different layout opens the scene recovery dialog and exports its original record. |
| Paused trial | The different candidate remains selected after resume. It starts at zero progress and the prior completed result remains labelled with its own position. |
| Interrupted trial | A failed recovery write leaves the recovery dialog available. Retry clears the unfinished run with the same recovery command ID and preserves the prior result. |
| Failed pause or cancel | The original run remains active and animation advances after each failed write. Each control retries with the original command ID and leaves the completed trial history intact. |
| Failed completion | The retry control commits exactly one new comparison with the original run and command IDs. Its image is durable and the result survives reload. |
| Narrow layout and keyboard | At 390 CSS pixels, the settings dialog wraps Tab and Shift+Tab. Escape returns focus to the settings button. The settings and bridge evidence dialogs fit without horizontal scrolling. |

The scene check covers an incompatible layout version. Keyboard coverage is limited to the settings dialog and the narrow layout check covers settings and bridge evidence.

## Reproduction

With a production preview serving at `http://127.0.0.1:4173/`, run `node scripts/browser-check.mjs` from `app` to generate a current model checkpoint. Then run `node scripts/browser-resilience.mjs`. Set `APP_URL`, `PLAYWRIGHT_MODULE` or `BROWSER_PATH` for a different preview or local runtime.

[Results and rejected command IDs](../../app/artifacts/resilience-results.json) · [Mobile evidence](../../app/artifacts/resilience-mobile-evidence.png) · [Recovered model](../../app/artifacts/resilience-interrupted-model.png) · [Saved open question](../../app/artifacts/resilience-unresolved-visit.png)
