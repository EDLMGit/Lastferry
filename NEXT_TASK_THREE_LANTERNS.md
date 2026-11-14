# THREE_LANTERNS_01 — optional mastery for the accepted coves

## Outcome and baseline

Implement the three-lantern result system in the existing game. The player has accepted the repaired Orchard Landing at `9933303178da04cac93ddc820ef55e181286d983` and asked to continue. Preserve that puzzle and the accepted visual, audio and phone interaction work.

Start from that runtime plus this task/continuity commit on `m1-first-crossing`, preserving newer or unrelated work. Read this root task, `AGENTS.md`, active `docs/PROJECT_STATE.md`, `docs/DIFFICULTY_AND_MASTERY.md`, and the [preparation review](reviews/three-lanterns-preparation/REVIEW.md) / [verified target rationale](reviews/three-lanterns-preparation/TARGETS.md). Inspect the existing Session, actual completion/navigation handlers, strict Journey record and asset catalog before implementation.

Complete the feature and focused evidence. Make ordinary architecture, layout and icon decisions independently. This task defines player behavior and acceptance boundaries, not a prescribed code structure.

All eight existing Practice entries are eligible. The six matching Journey coves share their bests with Practice. Orchard remains Practice-only; First Crossing remains independent training. Keep the Journey order, checkpoint schema and existing save history. Orchard's illustrated entry and completed-six continuation are a separate next task. Do not create a cove, rebalance a puzzle, add a mechanic, change sailing, redesign the ferry or deploy.

## 1. Three cumulative lanterns

| Result | Requirement |
| --- | --- |
| **One — rescued** | Every required passenger is home. |
| **Two — efficient** | Everyone home within the cove's authored action target; Undo is allowed. |
| **Three — without Undo** | The same efficient rescue with zero successful Undos during this attempt. |

Every rescue retains full story progression, arrival and eventual ending. No lantern gates, lives, currency, score penalties, real-time targets or confirmation prompts. Undo stays unlimited and never spends a tide turn.

Use the final winning State's existing action count. Discarded branches are removed by ordinary Undo and do not increase that final route count. Count successful Undos separately from rewindable puzzle State. Busy, unavailable or rejected Undo inputs do not count. A committed mistaken action corrected by Undo does count; do not special-case its reason.

Restart or actual entry into a new playable cove starts a fresh attempt. Settings, Sound, Motion, Tips, camera, free inspection, hiding, rotation, fullscreen, menus and animation recovery neither affect eligibility nor reset the attempt. A clean replay after learning is valid mastery, not a claim of first-try understanding.

### Accepted targets

These are authored targets backed by exact production-rule search and committed witnesses. They are not difficulty scores or automatically minimum-plus-one.

| Cove | Proved minimum | Efficient target |
| --- | ---: | ---: |
| First Crossing — independent Practice | 7 | **8** |
| Holding Pier | 9 | **9** |
| Bellwater | 10 | **10** |
| Driftwood Yard | 12 | **12** |
| Two Shelters | 11 | **12** |
| Wide Berth | 12 | **14** |
| Reef Return | 10 | **11** |
| Orchard Landing | 12 | **13** |

Wide's longer outer approach, Reef's early heavy delivery and Orchard's Spring Steps retrieval remain efficient alternatives. Driftwood's fifteen-action delivery order remains a full rescue but does not meet its efficiency target; it adds a home trip after the same critical rescue plan. Do not alter accepted data to manufacture three possible rating outcomes or a larger numerical difficulty curve.

## 2. A reversible victory and a deliberate acceptance

Show the current result when the existing visible arrival completes. It is provisional while terminal Undo remains available. Terminal Undo withdraws that result, increments successful Undo history and restores ordinary play. Redelivery computes a new result from the same attempt. Never reduce an earlier accepted best.

Accept a provisional result once when the player actually leaves the completed attempt through an existing action:

- Continue story.
- Actual Next cove or Practice cove navigation.
- Confirmed Return home.
- Successful Restart of the won attempt.

Opening **Choose a cove** currently only opens the menu. It does not leave the attempt and must not accept a result. Neither do Settings, Escape, Return to arrival, closing a dialog, a cancelled Home confirmation or a rejected/busy transition. A repeated input must not create duplicate acceptance.

No extra Save or Claim button. Keep the existing primary continuation. Explain briefly, where the current checkpoint policy belongs, that continuing, leaving or restarting keeps the result. Reloading/closing before acceptance follows the existing cove-boundary model; do not add pagehide acceptance or mid-puzzle resume.

Only genuine playable attempts can earn a result. Restored Home/story Harbor backgrounds, mounting a cove, loading an old completed save and scene transitions must not manufacture wins or scores.

## 3. Persistent bests without changing Journey saves

Use a separate versioned results store, keyed by stable cove identity and puzzle/scoring revision. Keep the strict Journey record, migration backups and existing explicit campaign continuation intact. Do not widen the Journey identity set just to rate First Crossing or Orchard.

Each best is one actual accepted run. Prefer higher lantern count, then fewer final actions, then fewer successful Undos; retain the existing entry on an exact tie. Never combine actions from one run with Undo history from another. A poorer replay cannot replace a better result.

Practice may improve the same matching-revision best without writing, normalizing or advancing Journey progress. New Journey preserves mastery. Orchard's Practice result should be reusable when its identical puzzle/scoring revision later joins Journey. First Crossing remains outside the eventual twelve-cove campaign total. Do not display a total this pass.

Legacy saves establish completed rescues, not action/Undo history. Preserve their existing completion and unlocks. Leave mastery unrated until a new scored replay; use a small “Not yet rated,” or “Rescued · not yet rated” when that rescue is already known. Do not invent zero Undos, action counts or an incomplete synthetic best.

Validate stored results. Invalid, incompatible or inaccessible mastery data must not break play or mutate Journey saves. A write failure must not prevent campaign continuation; keep the accepted result/best usable in the current session and report persistence honestly through existing unobtrusive status patterns. No anti-cheat service or new account system.

A future puzzle rebalance or scoring-target change increments the relevant revision. Rendering-only changes do not. Preserve earlier historical evidence.

## 4. Small, legible presentation

Use the existing result card, Practice list and compact pre-play/menu disclosure:

- Three small warm lanterns on the victory card, with a plain-text accessible equivalent.
- Final actions and successful Undos for **this rescue**. Distinguish a different **best rescue**.
- A compact best marker on existing Practice rows; full cove names and touch targets still fit.
- The action target and all three requirements inspectable before committing to a run, without a strategy hint or solution.
- Existing Continue/Next action primary, replay secondary, terminal Undo available.

Keep the ordinary map HUD unchanged. No persistent score bar, countdown, automatic “lantern lost” message, new sidebar or rating screen between coves. Use the accepted cove palette and existing lantern family if readable at phone scale. If a new asset family is needed, add its source, gallery/provenance and catalog entry together. Do not add reward sounds or change accepted victory/music mixing.

Filled/unfilled states must be distinguishable beyond color. Preserve keyboard focus, native controls, screen-reader names, Reduced Motion and Sound intent. Optional motion is brief and never delays controls. Check 390×844, 780×320 and a 320px-wide portrait fit; let the content determine the compact layout.

## 5. Focused verification and actual play

Cover the shared scoring/session/storage logic and the actual lifecycle. Reuse current helpers; add tests for meaningful failure modes, not source-text assertions or mirrored implementation.

Demonstrate:

1. Over-target rescue = one; efficient rescue with successful Undo = two; efficient zero-Undo rescue = three. Both accepted 12- and 13-action Orchard routes qualify for efficiency. Driftwood's existing fifteen-action witness is a verified over-target fixture. Do not force every cove to demonstrate every rating; any extra test actions belong only in a safe test sequence.
2. Successful Undo history survives ordinary, tide and terminal rewinds. Rejected/busy inputs do not change it. Restart resets only after it succeeds.
3. A provisional three-lantern win can be undone and redelivered as two. Opening/cancelling menus or Settings does not save it. Actual continuation, confirmed Home, cove navigation or completed Restart accepts once.
4. A saved best survives reload, a worse replay and New Journey. The displayed current result does not pretend the worse attempt earned the saved best.
5. Legacy completion remains earned and unrated; restored scenes award nothing. Explicit `?cove=` and root Practice runs leave representative in-progress, completed and historical Journey save bytes untouched.
6. Corrupt/blocked mastery storage keeps play, current-session results and campaign continuation usable. Revision handling cannot silently present an incompatible best.
7. Actual phone controls complete an Orchard rescue and a Journey rescue. Include accepted-result persistence, terminal Undo/redelivery, natural keyboard focus and return from Settings. Match portrait and short landscape evidence to the final source.

Use Node 24. Run the production build, TypeScript, relevant unit/session/progress checks and asset validation. Shared Session/continuation changes warrant their affected regression coverage. Exercise at least one complete route on the minified production build. Broaden tests only for a concrete changed dependency or unresolved risk.

Inspect native result/Practice/criteria frames at the stated phone sizes and a desktop smoke view. Provide one uninterrupted actual rescue-to-acceptance sequence with runtime audio using the existing capture pipeline. Screenshots and DOM checks alone do not prove interaction or audio quality. Do not substitute synthetic states for the required actual play. Record original failures, reruns and their exact source; distinguish Chromium emulation from a physical phone. Human visual/listening approval remains separate.

## 6. Handoff and continuity

Update active project state, difficulty/mastery implementation status, asset records only for content actually changed, and `reviews/three-lanterns/REVIEW.md`. Keep preparation proofs as immutable source-pinned evidence; do not regenerate them over unrelated runtime changes.

Commit and push to `m1-first-crossing`, verify the exact remote SHA, update PR #1 while keeping it draft, and leave `main` unchanged. Preserve unrelated local work. Do not deploy or change the Site's custom private audience. The last confirmed Site remains version 19, game `f0ffe2c12f1cc0e42ad7ef10a4b57dd29097c731`.

Return the exact final SHA, concise implementation/review summary, verification results and retained failures, native phone result/Practice frames, uninterrupted actual sequence and local root / Orchard URLs. State plainly that the six-cove Journey remains unchanged and Orchard remains Practice-only.
