# Story production acceptance

This pass brings the approved illustrated presentation into the real journey. Its acceptance depends on what a player sees, reads, hears and controls on a phone, as well as preservation of campaign and puzzle state. Passing automated checks does not establish artistic approval.

## 1. What must be present

- The actual root journey, without `?cove=`, presents the approved three-shot opening: finite actions of approximately 6, 6 and 7 seconds, followed by composed resting frames. Preserve the accepted artwork, visual hierarchy and captions rather than substituting distant gameplay-model gestures.
- A compact Harbor connection of approximately five seconds uses the same player, with the rescued trio safe and a deliberate visual acknowledgment before Bellwater. Treat this new composition as awaiting human review.
- Normal-motion captions appear as complete phrases after the approximately 1,050 ms visual lead. Use a brief fade, not a typewriter effect. `Read story` exposes all scene copy immediately.
- Reduced Motion shows each shot's composed endpoint and caption immediately. The same shot navigation remains available.
- Quiet finite cues support visible events. The accepted score remains continuous through story transitions. Missing narration is a normal supported state: no voice file, waiting spinner or broken voice control is required.

## 2. Behavioral checks with meaningful assertions

Use focused controller/state tests for these contracts. Prefer assertions about observable state and scheduled work over tests that merely repeat implementation arithmetic.

| Contract | Required result |
|---|---|
| Intermediate `Next` | Changes only the shot, without waiting for its action to finish. Cancels obsolete cues. Does not acknowledge a scene, write campaign progress, enter gameplay or execute a puzzle action. |
| Final continuation | `Take the helm` / `Continue to Bellwater` is available immediately upon reaching the final shot. Only this explicit app-owned action acknowledges the scene, once, and enters the correct untouched cove. |
| `Skip animation` | From an unfinished scene, shows its final composed endpoint and complete copy. Does not acknowledge it, accept a rescue or enter gameplay. |
| Replay | Replays the selected shot, or the whole scene when `Replay scene` is offered. Clears obsolete cues; does not stack sound, callbacks or progression writes. |
| Backgrounding | Settles the current shot and cancels pending/active story cues. Returning stays on that shot, without a delayed sound burst or automatic next shot. |
| Motion change | Enabling Reduced Motion settles the current shot, shows its caption and cancels obsolete cues. Disabling it does not unexpectedly replay the scene. |
| Read story / Settings | Opening either settles only the current shot and cancels pending cues. Closing or Escape returns to that held shot and its trigger focus, without skipping the whole scene or acknowledging it. |
| Pending-scene restore | Restores the final readable static endpoint, complete scene copy and `Replay scene`. Does not silently acknowledge. Preserve the current checkpoint schema; no per-shot resume is required. |
| Exit / destruction | Scene rendering and sound work stop on continuation, leaving the journey, replacement, page teardown and disposal. No orphan frame loop, observer or voice remains. |

Exercise rapid repeated `Next`, Replay and final continuation sufficiently to establish idempotence. Do not claim the inherited precise ≤180 ms touch-input limitation is resolved unless it is actually measured and fixed.

## 3. Protect the real game and checkpoints

Verify the canonical Holding start after the opening: ferry at Stone, Moss aboard, Pip and Rue at Rabbit Pier, tide 0, turn 0, and unchanged initial Undo history. Illustrated water movement and ferry approach must not alter authoritative state. Compare level data and puzzle rules against the baseline; incidental refactoring does not authorize mechanic changes.

Keep `opening` and `another-bell`, existing cove identities and the current journey storage format. A shot transition is not a checkpoint. Reloading an unacknowledged scene must retain its pending checkpoint; reloading a playable cove retains the existing documented cove-boundary behavior.

Run an actual UI Holding rescue, terminal Undo and redelivery. Confirm that the Harbor scene opens only after the player's explicit continuation from victory, and that complete in-session Undo remains available before that action. Continue through the connection, complete Bellwater using actual controls and verify its existing end-of-journey behavior.

Open explicit `?cove=` review/practice entrances independently, including First Crossing, and verify they do not replace campaign progress. Exercise existing invalid/unavailable-storage handling through focused tests; preserve recoverable prior bytes and honest checkpoint messaging.

The future addition of another cove needs a deliberate migration for current completed journeys. Record that dependency; do not invent future levels or change saves speculatively in this pass.

## 4. Native phone fit and controls

Inspect actual browser output at **320×740, 390×844, 780×320 and 844×390**, plus a **1440×900** desktop sanity check. Capture at native CSS dimensions; do not resize images to conceal overflow. Use **390×844 portrait and the constrained 780×320 landscape** for detailed temporal checks and the others for fit checks, rather than duplicating every scenario across every viewport.

The approved 780×320 inline preview used a 330 px-tall root. Do not copy that height into production. Fit the visible viewport, safe areas and critical controls. Account for browser chrome and fullscreen changes without assuming fullscreen succeeds.

Check artwork, readable captions, navigation and transcript together: no clipped final action, unwanted page scrolling, caption under a control, tiny character staging or displaced dialog. Portrait may put captions below the picture; short landscape must maintain its deliberate quiet text area. Inspect opening beginning, intermediate action and resting endpoint, plus the Harbor endpoint.

Use real touch events for navigation and native keyboard Tab/Shift+Tab, Enter and Escape for applicable controls. Verify visible focus, accessible names, sensible focus after Skip/Read story/Replay, and no accidental activation of covered gameplay. Keep story UI within the app's fullscreen/dialog surface. Exercise portrait/landscape resize and fullscreen enter/exit or honest unsupported feedback without losing scene or campaign state.

Assert that each illustration exposes its concise shot description through the accessible view/canvas and updates it on shot changes, without announcing every frame or duplicating the visible caption. Text and controls must remain meaningful when the artwork cannot be seen.

## 5. Runtime and sound checks

Use the existing audio owner and user activation flow. Verify audible playback from an ordinary root-journey gesture; do not bypass autoplay restrictions in the reviewed evidence. Check mute, unmute, hide/resume, early Next, Skip, Replay and final continuation. Canceled cues must not reappear later. Muting must affect all story sound, while unmuting must not restart a completed cue.

Capture actual runtime audio at unchanged playback/export levels. Verify decoding and report whether listening was performed. Do not normalize, boost or replace the recording with separately rendered sound and call it runtime evidence.

The current story clock is driven by `world.onFrame`. If covered WebGL drawing is paused, verify that the story still advances and that gameplay rendering resumes correctly. Repeated scene entry/exit must not accumulate render loops or audio schedulers. Keep the gameplay world and state; no rebuild per shot. Inspect actual phone motion for stalls without claiming native-GPU performance from software rendering.

## 6. Focused execution and evidence

Run the repository's production build, TypeScript check, unit tests and asset validation using its actual scripts. Add focused browser checks for the changed contracts and real rescues. Run more historical coverage only when a concrete changed dependency or failure warrants it; a full historical matrix is not an automatic requirement.

Provide one uninterrupted real root-journey sequence with runtime audio covering the opening, Holding rescue, terminal Undo/redelivery, Harbor connection and Bellwater entry. Capture Bellwater's real rescue and ending in that sequence or a separate uninterrupted recording. Retain large raw media locally/ignored; commit compact review media and representative native frames following repository conventions.

Record source/build identity, viewport, motion/sound settings and the actions represented. Include enough beginning/intermediate/endpoint frames to judge movement, caption timing and composition. A screenshot of the final frame alone cannot demonstrate the scene. Preserve original failures and distinguish unchanged-source retries from corrected-code reruns. Reuse valid unaffected evidence with an explicit reason instead of fabricating a fresh full-suite pass.

## 7. Review handoff

Return the exact final SHA, actual root playable URL **without `?cove=`**, concise changes, focused results and limitations, links to native frames and uninterrupted recordings, and the updated asset inventory. Preserve existing inventory IDs and update `ui.story-presentation` truthfully. Add only assets implemented in this pass.

Distinguish automated success, visual inspection, listening and human approval. Keep physical Android, native GPU, other engines and inherited overlap/heading/rapid-touch limitations explicitly unverified or open unless this work produces evidence resolving them. Do not claim the private Site has changed; publication is a separate reviewed step.
