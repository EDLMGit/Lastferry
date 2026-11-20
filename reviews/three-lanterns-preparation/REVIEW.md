# Three-lantern preparation and Orchard acceptance

**Reviewed:** 14 November 2026. **Runtime baseline:** `9933303178da04cac93ddc820ef55e181286d983`. This preparation changes task/design/continuity and review evidence only.

## Decision

The player reports that repaired Orchard feels good and asks to continue. Record the puzzle and its current presentation as accepted for continued development. The next assignment is [THREE_LANTERNS_01](../../NEXT_TASK_THREE_LANTERNS.md), implementing the existing optional mastery concept while preserving all puzzles. Orchard's illustrated entry and six-to-seven Journey continuation remain a separate later task; C8 is not commissioned.

The live Site remains version 19, game `f0ffe2c12f1cc0e42ad7ef10a4b57dd29097c731`, with its existing custom private audience. This review neither publishes nor changes access.

## Fresh review of the Orchard repair

Compared exact source and the repair report, inspected the committed 390×844 subset choice and 780×320 return-crossing images, and independently reran its production-rule graph audit under Node v24.22.1.

- Reproduced 482 normalized states, 1,311 transitions and the 12-action minimum.
- Replayed the separate 13-action Spring Steps retrieval strategy.
- Confirmed the first Harbor delivery changes who can accompany Orin: Orin plus Medlar needs depth three; Orin plus Pomme needs depth four, which arrives only after the outward current reverses.
- The counterfactual reducing Orin to two spaces lets the formerly failing plan win. His third space therefore affects the later dependency, beyond merely being a new character.
- A wrong staging choice can remove every winning continuation at action three, before the explicit cutoff at action twelve. This supports meaningful planning and Undo; it does not make search statistics a measure of human difficulty.
- The only shared runtime-file changes in the repair are two Orchard-gated Medlar placement coordinates. Other cove data, production rules and Journey/progress implementation are unchanged.
- Orchard's Medlar remains tan; Wide's Sorrel remains cream. In the two inspected native stills, passenger faces and the relevant controls are readable.

The exact reducer/loader/data SHA256 values match the committed Orchard audit. [Implementation review](../orchard-difficulty/REVIEW.md) · [Orchard design and proof](../orchard-difficulty/DESIGN.md)

Build, broader units/browser runs and recorded playback remain the implementation handoff's reported checks; this review did not rerun them or claim physical-device, acoustic or native-GPU validation. The human feedback is acceptance of the current feel, not certification of every inherited limit.

## Authored targets

The separate fresh all-cove production-rule audit verified twenty exact Git blobs, enumerated all eight current coves and replayed twenty-four committed winning witnesses. [Targets and rationale](TARGETS.md) · [Pinned source manifest](SOURCE_MANIFEST.json) · [Executable audit](target-audit.mjs) · [Results](TARGET_AUDIT.json)

Accepted efficient-action targets: First Crossing 8; Holding 9; Bellwater 10; Driftwood 12; Two Shelters 12; Wide 14; Reef 11; Orchard 13. The proved minimums are respectively 7, 9, 10, 12, 11, 12, 10, 12.

These targets deliberately include distinct accepted alternatives, rather than copying every minimum. Driftwood's fifteen-action delivery order stays a full rescue but adds a home trip after the same critical plan; twelve rewards grouping the final load. The target decision is authored, not a mathematical proof of fun.

## Lifecycle review and contract

Source inspected: `src/game/session.ts`, `src/main.ts`, `src/campaign/progress.ts` and `src/campaign/registry.ts` at the exact baseline.

The existing Session rewinds State and has no attempt-level mastery data. The Journey schema is exact and should not acquire score fields. The registry exposes six Journey coves and eight Practice entries.

A won Practice **Choose a cove** action currently opens a menu; terminal Undo remains possible. Therefore only actual departure/continuation accepts a provisional result, never menu opening, cancellation, Settings or visibility lifecycle. Existing restored Harbor worlds used for Home/story presentation are cosmetic and must not manufacture awards.

The task resolves these behaviors:

- Successful Undo count lives outside reversible State; final actions come from the actual winning State.
- One rescued / two within target / three within target without successful Undo.
- Provisional result until actual continuation, navigation, confirmed Home or successful completed Restart.
- Best records represent one actual accepted run and never regress; separate revisioned storage leaves Journey untouched.
- Historical rescues stay completed and unrated until a scored replay, with no invented statistics.
- All eight Practice coves eligible; six Journey matches share their bests. Orchard remains Practice; First Crossing remains outside any future campaign total.
- Minimal result/list/disclosure UI, no map score bar, no change to accepted music or arrival.

## Limits and next gate

The task is ready for implementation; lantern runtime/UI does not exist in this preparation commit. Review actual phone-sized results, acceptance/Undo behavior and persistent bests before accepting the feature. After that, commission Orchard's truthful story entry and historical-save continuation separately, then assess C8's distinct planning role.
