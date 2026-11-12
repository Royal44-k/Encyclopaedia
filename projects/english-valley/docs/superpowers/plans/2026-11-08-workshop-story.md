# T01 complete exhibition story — implementation plan

**Goal:** Continue the existing workshop into one playable encounter: an empty garden stand, an old part with a history, an author's work, Iris's concrete first impression, a visible demonstration, a trial exhibition, a visitor's response, and a saved ending.

**Architecture:** Extend the existing atomic workshop store to schema 2, keeping the storage key and artwork identity. The controller presents only actions relevant to the current conversation. The same Three.js work moves through the existing garden. Add exact original voice recordings to the local voice bank.

**Spec:** `docs/design/v6/episodes/T01.md`, supplemented by this causal flow and the user's rejection of production prose in the student experience.

**Tech stack:** Existing Three.js, Vite, vanilla JS, local Kokoro stock voices; no new dependency.

Ruling: continue in this workspace (no Git repository) under the user's standing authorization. The approved art direction stays. Finish this chapter before expanding the chapter list. Original story facts about materials are fictional valley history, not quotations from the textbook.

## Design

Keep valley greens, cream paper, brass and wood, existing serif headings and readable sans-serif dialogue. The signature is the same object seen and understood differently, not a progress scoreboard. Current dialogue remains fully visible. Compact screens use existing view tabs and whole-section pages.

Iris is preparing an exhibition and has one empty stand. Sam has kept a ring, a tin and a branch. Selecting a body reveals its previous use through Sam. Iris first sees a window / flowerpot / little tree, according to the actual body. The author can show a different angle, demonstrate a working pivot, or invite another interpretation. Iris must actually see the change before the label and exhibition open. The author writes a label, tries either garden stand and looks from the visitor's position before committing. Iris returns as the first visitor: a material question or an invitation to look produces a different response. Completion saves the encounter and work; storing unfinished is a pause, not an invented completed exhibition.

## Tasks / ledger

- [x] State: gated conversation/demonstration, label, site trial and visitor/ending; atomic saves, old-save migration, interrupted demonstration, rework invalidation, stale-tab protection.
- [x] Content: remove student-facing production prose; body-specific opening and response; optional English supports and exact local recordings with source audit.
- [x] Scene/UI: one work, visible empty stands, visitor views, real scene photographs, focused dialogue actions and complete-text responsive layout.
- [x] Verify: domain and asset tests; complete dynamic and static branches through real browser actions, reload and failed-write recovery, full dialogue visibility; build, fresh review, delivery record.

## Acceptance

No skipping from construction straight to completion. No fake interpretation of free text. No movement claim for static work. No completion on failed persistence. Existing work and authored text survive migration. Reopening invalidates prior encounter progress but preserves author words and identity. No change to C1/T02 story saves. Every new spoken cue has a matching subtitle and local audio. Performance/voice acting quality remains a human review matter, not a claim inferred from audio decoding.

## Verification ledger

2026-11-08: all 6 new state tests observed failing before implementation, then passing. Full suite: 82 pass. Three production browser story routes complete. Fresh reviewer reproduced two P2 issues (context loss credits unseen motion; undo retains old material line). Fixed with scene-epoch cancellation and cue reconciliation; targeted actual WebGL loss plus undo/removal browser test passes for both demonstration locations. Final routes also cover native label write failure, reload, three body/intent variants, narrow automatic dialogue selection, both trial sites, old-save migration and independent C1/T02 records. See docs/development/workshop-story-delivery.md.

Ruling: snapshot driver waits for settled render frames after restoring lesson tabs; the initially blank capture was taken during canvas resize. Repeated stable capture has actual geometry. No production claim of cinematic character acting or full material freedom. No repository exists here, so no merge, commit, worktree cleanup or publication is performed.
