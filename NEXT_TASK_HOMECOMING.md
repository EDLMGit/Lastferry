# Last Ferry — Next task: Harbor homecoming

## Outcome

Make arriving at Harbor feel like a small, calm celebration: a slowly sweeping lighthouse light, a brief acknowledgment from the rescued animals, a restrained arrival composition, and a compact completion card with the appropriate next action and Settings.

The user accepts the sound for now. This is the next presentation pass. Complete it autonomously within the existing architecture, preserve the accepted game, and supply reviewable evidence.

## Source and continuity

- Repository: https://github.com/EDLMGit/Lastferry
- Branch: `m1-first-crossing`; PR #1 remains draft.
- Reviewed baseline: `c82ba896e690c82b731f63dc1fba0a6380ef61e1`.
- That game version is now published at https://last-ferry-playtest.abumech.chatgpt.site with the existing owner-private audience.
- Read `AGENTS.md`, `docs/PROJECT_STATE.md`, this task, and the applicable scene/UI/audio guidance. Read `reviews/victory-mix/REVIEW.md` for the accepted audio lifecycle.
- The accompanying `docs/PROJECT_STATE.md` is the compact continuity record. Keep it current with this task's actual outcome; keep detailed implementation history in `STATUS.md` and the review report.
- Inspect the checkout before work. If newer work exists, preserve it and compare it with this baseline; do not reset the branch to this SHA.
- This explicitly requested task supersedes historical milestone limits for the features below. Older task files are context, not a combined backlog to implement.

## Creative direction

The arrival should feel like everyone has reached safety. Warm amber light, a small animal gesture and a closer view are enough. Use the accepted dark teal, ivory and warm border treatment. Keep the water and Harbor visible behind the ending.

No confetti, fireworks, bouncing rewards, new score system, achievements, camera orbit, new music or new level belongs in this pass.

### 1. A real, slow lighthouse sweep

- On a completed rescue, introduce one softly visible amber sweep rotating around the lantern, approximately one revolution every 20 seconds. Tune visually if necessary; it should be perceptible and unhurried.
- Start the sweep at the existing visible-arrival hook or later. The reducer commits won before unloading finishes; that early state change must not begin the celebration. Use won state for persistence and cleanup after the visible start.
- Rotate the beam or light presentation, not the lighthouse building. The current lantern is an omnidirectional PointLight: rotating that light alone will not create a visible sweep.
- Integrate a small, inexpensive beam/sweep representation with the current lantern, arrival glow and reflection. Keep its intensity restrained; do not wash out the lighthouse or flicker across the interface.
- The sweep persists while the authoritative state is won, including when the completion card is closed or Settings is open. Partial delivery, losing states and ordinary play retain the accepted lighting.
- Exclude decorative beam geometry from picking and camera-fit bounds. Reuse bounded geometry/materials; no shadow-casting spotlight, new water render pass, full-screen bloom or volumetric ray marching.
- Under reduced motion use a steady warm light, with no rotation or pulsing.
- Undo, Restart, cove changes and disposal cleanly restore the correct ordinary presentation.

### 2. One brief animal acknowledgment

- Start the distinct celebration only after final disembarkation has finished and passengers have reached their canonical Harbor positions.
- Rabbits may each make one small hop, slightly staggered. Give sheep a gentler body bob or grounded acknowledgment that reads as heavier.
- Earlier delivered animals can join once. No animal celebrates while still crossing the gangplank, hovering over the boat, or clipped through the shore.
- Keep the total finite reaction around 1–1.5 seconds. End in canonical position and rotation; no repeated bouncing.
- Apply presentation offsets from known resting transforms. Do not mutate passenger state, occupancy, turn count, tide, rules or canonical anchors.
- This is a visual gesture: retain the accepted wood-contact timing and single victory cue. Do not create extra impact sounds or trigger the cue from individual hops.
- Reduced motion gives static, settled animals. Enabling it during a celebration settles movement immediately.

### 3. A modest arrival camera move, subject to phone fit

Implement a small Harbor push-in/reframe as a real camera adjustment: target roughly 8–10% magnification over about one second, preserving the current viewing angle. Begin after disembarkation, and allow it to overlap the brief animal reaction.

This is conditional on a good composition. The full lighthouse, rescued animals, ferry and usable completion controls must fit. Reserve space for the actual completion card. Clamp the move or use no zoom at short phone sizes where it cannot fit; document the choice. Do not trade phone usability for a mandatory effect.

Implementation constraints:

- Keep ordinary puzzle framing and sailing pace unchanged.
- The camera is orthographic. Do not CSS-scale the canvas.
- Camera changes must update the projection matrix and `CoastalWater.setView(camera)`.
- `main.ts` currently caches label placement using viewport dimensions only. Invalidate/recompute projected UI for camera changes, or explicitly hide irrelevant map controls during the won composition and restore/reposition them before play resumes.
- Account for resizing, browser-bar height changes and rotation during the won state.
- Restore canonical framing before Undo resumes input. No stale marker coordinates, mismatched picking, dragged labels or cumulative zoom after repeated wins.
- Reduced motion uses the normal stable framing. Changing back to normal motion must not replay the finite arrival.
- The existing render loop should own the animation. Do not add an independent loop or a growing collection of timeouts.

### 4. A compact, useful completion card

Refine the existing completion dialog in the accepted visual style. Let the Harbor remain the focus and avoid a large wall of text.

- Use a clear title such as “Everyone home” or the existing cove-specific equivalent, with one short supporting line.
- Make the genuine next action primary. Holding Pier already progresses to Bellwater through **Next cove**: retain that behavior.
- Bellwater and optional First Crossing have no implemented next chapter. Offer **Choose a cove** rather than inventing a destination, looping under a misleading Next label, or claiming the full planned story is complete.
- Provide **Settings** directly from the ending. Keep **Undo last action**, **Restart**, and a way to close the card reachable.
- While won, the ordinary Menu provides **Return to arrival**, reopening the same completion card without replaying effects. Next cove must remain discoverable after Close.
- Next/Settings/Undo must be usable as soon as the accepted final transfer has completed. The visual celebration is not a new busy state and imposes no extra wait.
- Closing/reopening the card or visiting Settings must not replay the celebration, reset the beam phase, replay sound or restore ordinary music volume.
- The loss presentation remains truthful and usable; do not show a victory celebration on a loss.
- Keyboard focus should land on an appropriate useful action, remain visible and stay within the active dialog. Repeated taps or held keys must not trigger unintended extra actions.

### 5. Small general Settings, shared by play and the ending

Use the existing single native dialog and interface styling; switch its content/view rather than stacking dialogs.

Settings for this pass:

| Setting | Behavior |
| --- | --- |
| Sound | Reuse the current master on/off state and existing persistence. Preserve the always-available sound control and accepted audio activation behavior. |
| Motion | **Follow device** (default) or **Reduced**. Persist the choice locally; safely fall back to Follow device when storage is unavailable or invalid. |

- Make Settings accessible from the ordinary Menu and completion card.
- Resolve one effective motion preference for the scene and CSS. A manual Reduced choice must reach water, sailing/transfer presentation, new celebration and relevant UI transitions; it must not be a celebration-only switch.
- Follow device continues to respond to operating-system preference changes. Reduced remains reduced even if the device preference changes.
- Back returns to the originating menu/ending with sensible focus. Escape from Settings returns one view; Escape/Close from the parent dismisses it. No input leaks through to the map.
- Visiting or changing Settings does not restart the cove, spend an action, reset the score phrase or change won music ducking.
- Do not add volume mixers, graphic-quality presets, accounts or a settings framework.

## Protect the accepted audio and lifecycle

The existing visible-arrival event in `world.ts` calls `effects.arrive()` and `onArrival()` once during the winning unload, after roughly 72% of its progress. In `main.ts`, `onArrival` calls:

```ts
sound.delivery();
sound.settleArrangement();
```

Preserve that accepted sound/duck timing and single event. Do not delay it to the end of the camera move or call it again for the completion card or animal reactions. The finite animal/camera presentation begins after canonical disembarkation; it is separate from the audio hook.

Keep `finish()`'s silent arrangement settlement for recovery. Preserve the current score, cue, wood voices, gain values, 200 ms duck and 700 ms restoration policy. Won music stays quieter while won; leaving won restores it through the established audio path. Generic visual cleanup must not clear persistent won audio intent.

Give the new visual presentation a bounded lifecycle:

- A normal visible rescue plays finite camera/animal movement once, then retains the quiet won presentation.
- Undo/restart/cove change cancels offsets and restores the appropriate framing without altering game rules.
- Hiding the page or context-loss recovery settles finite movement and prevents catch-up hops, delayed camera jumps or replayed audio on return.
- Current hidden-page handling only cancels when `session.busy`; the new post-transfer celebration also needs handling after busy becomes false.
- Dispose owned resources/listeners. Repeated win → Undo → win cycles must not accumulate geometry, listeners, timers or animation work.

## Work order and scope control

1. Inspect current hooks, ending, settings/persistence and phone composition. Record material findings briefly.
2. Implement the sweep, finite reactions and ending/settings together with cancellation/reduced motion.
3. Add the small camera move only with correct projected UI and phone-fit behavior. Simplifying or omitting it on a particular viewport is an intentional fallback, not an unfinished feature.
4. Verify the touched behavior and fix confirmed defects.
5. Update `docs/PROJECT_STATE.md`, relevant concise documentation, `STATUS.md` and the review report.

Do not silently expand this task with new levels, mechanics, broader island work, more audio polish, hosting changes or unrelated refactors. Further user feedback will be queued for later passes. Preserve existing user changes.

## Acceptance and verification

Run with Node 24. A fresh production build/typecheck and the unit suite must pass. Add targeted tests for real new risks, such as visual reset, resolved motion preference, settings navigation and camera restoration; avoid tests that merely restate animation constants.

Use the real interface for the following focused evidence. A test hook may expose presentation state for assertions but must not replace playing the rescue.

### Core behavior

- Complete all three existing coves through the UI. Verify one celebration per completed rescue, honest progression and no celebration on partial delivery or loss.
- On Holding Pier, exercise a subset transfer, Undo across a tide rise, final arrival, Settings → Back, Undo from won, and redelivery.
- Check Undo during the finite celebration and after it has settled; also Restart, Next cove and rapid repeat input.
- Check hide/resume during arrival and while already won, plus recovery/context-loss handling where tooling permits. Report simulated events as simulated.
- Preserve the current victory-mix regression checks for one cue, persistent dry/wet reduction, muted completion and restoration. New visuals must not change their accepted timing.

### Motion and interaction

- Verify normal motion, OS reduced motion, manually selected Reduced, persistence across a cove change/reload, and returning to Follow device.
- Verify natural Tab/Shift+Tab, Enter/Space and Escape for ending → Settings → Back, and touch-emulated controls. Do not call touch emulation a physical-phone result.
- Confirm selection, markers and picking align after Undo restores the gameplay camera.
- Keep useful targets at least 44 CSS px with the existing 48 px touch treatment where practical, and essential phone text at least 14 px.

### Viewports and evidence

- Inspect at 1440×900, 844×390 and 780×390; additionally exercise the new ending/settings and zoom fallback at the previously sensitive 780×320 height.
- Inspect the actual moving arrival and settled composition at native size. Screenshots alone cannot establish sweep speed, camera comfort or cancellation.
- Capture a compact set under `reviews/homecoming/`: ordinary baseline, visible arrival, settled ending, Settings, restored play after Undo, and reduced-motion ending, including the short phone composition.
- Keep one uninterrupted real-interface recording showing arrival → Settings → Back → Undo → redelivery, with actual runtime audio if supported. Keep raw media local/ignored by default and state access accurately.
- Tie evidence to the tested source with the established manifest workflow. Preserve failures, describe fixes and rerun affected checks. Reuse unchanged evidence only with a relevant source comparison.
- Compare ordinary-play and won-state resource/draw-call behavior if available; investigate any concrete growth or regression. Do not claim hardware smoothness from software rendering. Do not add a large benchmark project.

The review is not complete if phone controls clip, camera/picking remain stale, passengers retain offsets, arrival repeats unexpectedly, or settings lose state/focus. Physical Android perception/performance remains a separate user playtest; unavailable checks must be named rather than marked passed. Do not rerun every historical suite without a concrete reason.

## Git and handoff

Continue on `m1-first-crossing`. Commit and push the finished task, update existing draft PR #1, and leave main unchanged. Do not force-push, merge, mark the PR ready, or deploy a different build/site as part of this local task.

Return:

- Final full GitHub SHA, remote equality, branch/PR draft status and checkout status.
- What changed, any camera fallback and exact Settings behavior.
- Fresh verification results, relevant reused evidence, unresolved failures and unperformed checks.
- Compact report, screenshot manifest and local recording paths.
- Explicit deployment status: the private Site still contains `c82ba89` unless a separate confirmed publication occurs.

The reviewed new SHA will be published to the same private Site after review. A GitHub push alone does not update the phone build.

