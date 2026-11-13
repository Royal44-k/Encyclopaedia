# Implementation record — 2026-11-09 West Lake

Modern and Song art generated and inspected. Summer/autumn variants, people atlas and boat completed. Winter generation stalled; original generation cancelled and retried. No replacement art will be described as a finished winter variant.

State tests: initial six passed; a regression proved that ground clicks could divert a summoned boat, then passed after approaches became non-divertible. Seven state tests now pass.

Fresh independent review found seven concrete interaction issues. Fixed boat diversion, premature activity collection, passenger zoom anchoring, focused-control keyboard handling, window-blur animation/audio, pinch-to-drag coordinates, and reduced-motion ambient clock. Four browser regression cases were observed failing and then passing (cancel tea, focused weather Space, Escape on crossing slider, blur auto-walk).

Ruling: use an independent Canvas implementation and original art because reference reuse permission is absent. Cost: no claim of exact rendering or animation parity.

Ruling: use the user-selected main journey scope; reference's separate experimental pages are excluded. Cost: this is not a full clone of every file/experiment in that repository.

Ruling: existing workspace had no product or Git repository. Build directly in the authorized workspace, without introducing Git state or a worktree.

Pending: final actual-asset browser acceptance, screenshots and static build.

Final: winter retry succeeded and the actual winter asset is used. All seven state tests pass. Full browser acceptance passed modern/scene selection, crossing cancellation, ancient entry, walking, seasons, night/rain/pause, rowing story, complete boat journey, collection/export, persistence, and desktop/mobile rendering. The final smoke run additionally verified automatic crossing to welcome, guide question, guide-to-tea, actual winter/snow, and reduced-motion entry. No browser page errors or failed asset requests in final smoke.

Final: four browser regression tests passed again against actual assets. Screenshots inspected, a decorative distant boat overlapping architecture was removed, pier textures and night control contrast corrected. Final build: 20 files, 3.44 MB; distributable ZIP 3,562,787 bytes. Local preview remains at http://127.0.0.1:4173. No remote deployment performed.
