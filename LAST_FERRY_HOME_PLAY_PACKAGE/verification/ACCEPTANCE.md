# Acceptance — Home, story and direct play

**Current task:** `HOME_PLAY_FLOW_01`, implemented through `NEXT_TASK_HOME_PLAY_FLOW.md`.

This is one combined assignment. Complete Home, story playback/audio work, direct transfers and integrated verification before the final handoff. The earlier two unstarted flow tasks are superseded; their separate stopping points do not apply. Use internal milestones and meaningful checks without requesting another user approval between them.

## 1. Home is the actual entrance

Test the real local root URL without `?cove=`. A standalone preview is not evidence of game integration.

On a fresh visit, Home must show the intended cove composition, readable title, Play, Options and the specified secondary navigation. The ferry/lighthouse remain visible; gameplay HUD, routes, markers, inspection cards and transfer controls are absent from the Home presentation. Decorative water or scenery must not receive puzzle actions.

Verify active-screen ownership, not only CSS appearance. Keyboard shortcuts, taps through transparent areas, held inputs and closing Options must not activate covered gameplay. Hidden gameplay controls must not remain in the focus order. Options and other secondary views return focus to their opener without resetting the journey or camera unexpectedly.

Home motion does not spend turns, change tides, board/deliver passengers or trigger victory. Reduced Motion supplies a composed still presentation. Home rendering resumes appropriately after Options and stops or yields when the illustrated story covers it. Returning to gameplay restores routes, markers, HUD, picking and normal camera behavior.

## 2. Journey and save-state cases

Use focused state tests plus representative actual UI checks:

| Starting state | Required result |
| --- | --- |
| No saved journey | Merely opening Home creates no campaign record. Play explicitly creates/enters the opening. |
| Saved cove checkpoint | Continue names the destination and enters its original starting state. Keep honest cove-boundary wording; do not imply mid-puzzle resume. |
| Saved pending scene | Continue preserves the specified readable restored scene/recap and explicit replay/final handoff. It does not acknowledge itself. |
| Both available coves complete | Present the specified available-cove/new-journey options honestly. Do not imply another playable cove or completion of the planned twelve-cove story. |
| Existing journey replaced | New journey requires explicit replacement confirmation. Cancel preserves the saved record and preferences. |
| Invalid/unsupported saved record | Preserve recoverable stored bytes and the established recovery message. Viewing Home, Options or Practice must not silently replace them. |
| Storage unavailable | Allow the supported in-memory journey with clear, proportionate messaging. Do not claim progress will survive closing. |
| Return Home during a crossing | Preserve the warning that unfinished moves/Undo will be discarded. Cancel returns to the same live crossing; confirm follows the documented checkpoint policy. |
| Explicit `?cove=` entrance / Practice | Keep independent review/practice behavior and verify campaign progress is unchanged. |

Keep the existing strict checkpoint schema, stable scene/cove IDs and explicit rescue acceptance. Home navigation and illustration changes are not checkpoints.

## 3. One actual integrated journey

Capture an uninterrupted sequence through real controls:

**Home → Play as the first trusted input → automatic opening → held final picture → Take the helm → Let Moss ashore → Undo → actual Holding rescue → Bring home → terminal Undo/redelivery → explicit continuation → Harbor scene → Bellwater entry.**

Use the rescue to include passenger subset selection and Undo across a tide rise. Complete an actual Bellwater rescue in this sequence or a separate uninterrupted run. First Crossing remains independently available; use focused coverage for any affected shared transfer behavior there.

After the opening, assert the original Holding start: ferry at Stone, Moss aboard, Pip and Rue at Rabbit Pier, tide 0, turn 0, four-space capacity with Moss occupying two, and original Undo history. No home or story action may manufacture a puzzle move.

The direct Moss action must open no redundant transfer dialog and produce exactly one accepted action/history entry: turn 1, tide 0, Moss waiting safely at Stone, load 0 and required depth 1. One corresponding receipt appears. Undo restores the original state and clears obsolete feedback.

## 4. Story, audio and fresh input

Watch the normal-motion opening advance through all three approved shots without additional taps. Complete captions remain comfortably readable. The final picture holds for explicit Take the helm; Harbor holds for Continue to Bellwater. Autoplay never acknowledges a scene or accepts a rescue.

Exercise Pause before and after a cue, Resume, immediate Next, Replay, Skip, Read story, Options, hide/return, restored scenes and Reduced Motion. Pause preserves elapsed time and revealed copy. Resume cannot repeat consumed cues. Secondary views and long interruptions cannot catch up through unseen shots or produce delayed sound bursts.

Hold a pointer or Space activation across automatic Lantern → Ferry progression. An input that began as Next must not become Take the helm. A fresh final activation must work immediately. Apply the same ownership principle to Home Play transitions and disappearing transfer buttons; retain repeated-click/held-key protection without arbitrary lockouts. Automatic shot changes must not steal focus.

Investigate music with Play as the very first trusted touch, pointer or keyboard activation, without first opening Options or toggling sound. Verify score scheduling and its relevant output route, plus an ordinary runtime mix recording. A running AudioContext, finite effect, source count or nonzero master meter alone does not prove audible music.

Check saved mute, Enable/Retry/Mute intent, pending/blocked resume, cancellation and background recovery. The Home/story sound controls must participate in the existing explicit sound-intent handling; a generic activation listener must not reinterpret the same click as a different toggle. Preserve one persistent Sound owner, accepted composition/phase, victory reduction and its restoration on departure.

The reported silence remains unresolved until reproduced and corrected. If it does not reproduce, finish supported work, retain useful support details and report the remaining limitation honestly. Existing logs showing music voices are not a fresh listening result.

## 5. Transfer decisions and feedback

Verify direct boarding, letting ashore and single-passenger home delivery. For several animals, selection remains free and a compact nearby chooser commits the chosen group once. Empty/invalid selections cannot commit; no silent automatic subset choice is introduced.

At the last safe boarding, choosing only one rabbit must disclose the other rabbit's loss before commitment. Cancelling spends nothing. Deliberate loss and Undo retain the original rules. Test a mixed subset, partial delivery and a load change that leaves the draft band unchanged.

Cost, resulting required depth and relevant tide/landing warnings are available before acting. Floating feedback uses actual transaction values and appears with the visible result, without a guessed second animation timer. It never blocks input, captures focus, covers essential controls or becomes the only persistent source of state information. Announce the result once.

Clear receipts on Undo, restart, hide, Home/cove changes and teardown. Invalid actions, cancelled choices and free inspection produce no cost receipt. Preserve transfer-before-tide ordering, accepted animation/audio timing, terminal Undo and explicit campaign continuation.

## 6. Phone evidence, gates and handoff

Inspect **390×844 portrait and 780×320 short landscape temporally**, with fit checks at 320×740, 844×390 and desktop. Cover Home, Options, story, direct feedback, group selection and arrival. Use native dimensions, safe areas and actual visible viewport. Check the known constrained Bellwater location without claiming inherited overlap or heading issues resolved by unrelated changes.

Exercise native keyboard and touch, orientation changes and fullscreen entry/exit or honest unsupported feedback. Verify no duplicate active World/render loop, story clock, audio scheduler or stale handler across repeated navigation. Keep one active gameplay renderer; do not rebuild it per story shot or create a second background simulation.

Run production build/typecheck, meaningful unit checks, focused browser coverage and asset validation with Node 24. Preserve all 75 existing family IDs; add/update only implemented content. Broaden historical testing only for an affected dependency or concrete remaining risk.

Provide the actual combined sequence with runtime audio at unchanged playback/export levels, representative native frames and exact source/build identity. Avoid a large redundant screenshot matrix. Preserve original failures and distinguish fresh checks from justified reuse. Report listening, physical Android, native GPU, other engines and inherited precise rapid-touch limits accurately.

Return exact final SHA, concise review, results/limitations and local root URL. Keep PR #1 draft, `main` unchanged and publication history intact. No automatic deployment or new Site-version claim belongs to this implementation handoff.
