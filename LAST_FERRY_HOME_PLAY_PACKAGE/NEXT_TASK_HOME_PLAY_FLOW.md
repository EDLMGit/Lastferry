# Current task — Home, story flow and direct passenger actions

**Task ID:** `HOME_PLAY_FLOW_01`  
**Reviewed baseline:** `d532c62f0f25854387869466572a1ed0cf35a0ac`  
**Repository / branch / PR:** `EDLMGit/Lastferry` / `m1-first-crossing` / draft #1  
**Environment:** Node 24

## 1. Outcome and supersession

Give Last Ferry a complete welcoming entry and a more immediate play loop. The player opens a proper Home screen, presses Play, watches the accepted illustrated story flow naturally, takes the helm and uses clear nearby passenger actions.

The user has not run `TASK_01_STORY_PLAYBACK_AND_MUSIC.md` or `TASK_02_DIRECT_TRANSFERS.md` from the previous flow package. **This assignment replaces both.** The previous `STORY_PRODUCTION_01` pass is already complete. Do not respond that its unchanged hashes finish this new task.

Implement these internal stages in order, verifying dependencies as useful:

1. Home presentation and entry/state routing.
2. Automatic story playback and sound investigation.
3. Direct transfers and compact feedback.
4. Integrated phone verification and complete handoff.

All stages are authorized parts of this single task. Separate internal commits are acceptable, but do not stop for user approval after the Home screen or leave the transfer work merely queued. Routine decisions are yours. Preserve any newer or unrelated work; the reviewed SHA does not authorize a reset.

Read `AGENTS.md`, `docs/PROJECT_STATE.md`, `campaign/STORY_SCENES.md`, relevant gameplay/interaction guidance, this task and its supporting documents. This current user-directed task supersedes historical M1-only scope and the previous story requirement to hold every normal-motion shot until Next. Keep all other applicable project contracts.

## 2. A proper Home screen

Follow `direction/HOME_SCREEN.md` and `contracts/ENTRY_AND_STATE.md`.

The root URL must open a full-screen title composition: **Last Ferry**, **The Long Tide**, a deliberately framed living cove, one prominent Play/Continue action and a small supporting set of Options, Practice and Sound controls. Keep supported fullscreen accessible through the existing shared settings/control pattern.

Use the accepted water, ferry, islands, lighthouse, palette and raised rounded buttons. Compose the landscape menu in a quiet side region; recompose portrait around title, substantial visible scenery and reachable actions. Use measured menu bounds and safe areas to frame the artwork. Preserve a readable ferry and lighthouse on short phones.

The normal Home is not the current central information dialog enlarged to fill the screen. A local gradient or subtle text backing can support contrast while leaving the scene visible. Show only relevant checkpoint/support text. Build information, development counts and future chapter promises do not belong in the main presentation.

Make this background a documented reusable **composition**: source assets, home-only camera framing, decoration visibility, light treatment, viewport layouts and Motion states. Reuse existing asset families. A raster background or external image-generation dependency is unnecessary for this live cove direction.

Normal motion uses the accepted water and restrained boat motion with a stationary composed camera. Reduced Motion presents a clear still frame. Use the existing warm lighthouse base illumination or a narrowly owned presentation treatment; do not simulate a win to make the light glow.

## 3. Entry and save behavior

Home itself reads progress; it does not create, replace, acknowledge or advance a journey.

- **Fresh Play:** one deliberate input creates the opening checkpoint once, activates the existing sound intent and enters the first illustrated shot directly. There is no second Play or tap-to-start gate.
- **Continue:** use the actual checkpoint. A cove resumes from its beginning, with concise truthful copy. A pending scene retains its restored static recap and explicit Replay scene behavior. Do not replay the opening for every Continue.
- **New journey:** retain confirmation before replacing an existing or unreadable record. Cancel preserves stored bytes and settings.
- **Both available coves completed:** offer Play a cove / Practice and New journey; do not imply that future chapters exist or the complete planned campaign has shipped.
- **Unavailable storage:** keep play possible with honest visit-only progress messaging.
- **Options / Practice:** use the existing shared owners and return focus to Home correctly. These actions do not change journey progress.
- **Return Home from an active crossing:** preserve the explicit warning that its unfinished moves and Undo history will restart from the cove checkpoint. Cancelling retains the live session unchanged. Full mid-puzzle resume is outside this task.

Explicit `?cove=` links remain direct independent practice/review entrances. A deliberate Home action from practice must not accept a rescue or overwrite a saved journey.

## 4. Home presentation is not game state

Keep Home, story and gameplay ownership explicit. If Home is no longer held inside the native dialog, update the input barrier: current `blocked()` relies partly on `dialog.open`. Hidden HUD elements alone do not prevent canvas picking, panning or gameplay shortcuts. Covered gameplay controls must be inaccessible/inert, and decorative water must not accept puzzle input.

Keep all surfaces inside the existing `#app` fullscreen root. Reuse the native dialog owner for secondary views; do not add an iframe or another competing dialog stack. Closing Options must return to Home, not reveal an interactive puzzle or misroute focus.

Home must hide both DOM navigation overlays and the Three.js routes/markers. `setStoryFraming()` only changes framing, and `World.indicate()` can make markers visible again. Own this suppression throughout Home updates and restore normal decoration on gameplay entry.

Reuse one active World/WebGL renderer and one persistent Sound owner. Options/hover/focus changes must not recreate the cove. Existing rebuilds at legitimate cove boundaries may remain. Home camera/light/visibility changes must be reversible and presentation-only: no tide, action, transfer, arrival counter, victory mix or saved-progress mutation.

## 5. Automatic story and music

Follow `contracts/STORY_AND_SOUND.md`.

Fresh normal-motion Play flows through the accepted three opening shots with their finite 6 / 6 / 7-second actions and readable complete captions. Keep Pause/Resume, immediate Next, Replay, Skip and Read story in a compact arrangement. The final picture holds for explicit Take the helm. Harbor likewise holds for Continue to Bellwater. Autoplay never acknowledges a scene.

Preserve elapsed time and consumed cues through Pause/Resume. Secondary views and backgrounding settle/pause only the current shot. Restored pending scenes and Reduced Motion retain readable still behavior. A pointer/key press begun on Play or Next must not become a different action when the surface or final-button meaning changes; require fresh intent at the final handoff without an arbitrary lockout.

The missing-music report is unresolved. Verify **Home → Play as the first trusted input**, without pre-enabling through Options. Music has an independent scheduler and retained logs show activity in one prior tested run; neither proves the user's playback. Verify the score route/output specifically and capture the actual mix. Correct a demonstrated cause; if silence does not reproduce, finish supported improvements and report the issue honestly with relevant support details.

Sound must remain discoverable on Home and in the story. Extend the existing shared Enable/Retry/Mute intent path; current code hard-codes audio-control IDs. Do not introduce duplicate IDs or the capture-phase toggle race. Request activation from the trusted Play input before any asynchronous transition work, preserve remembered mute, and keep one continuous score owner. Preserve the accepted composition, wood effects, victory cue and won-state reduction. Narration recordings remain absent and are not part of this pass.

## 6. Easy pickup, drop-off and home delivery

Follow `contracts/DIRECT_TRANSFERS.md`. Implement all three action kinds within this task:

| Player intent | Routine named action |
| --- | --- |
| Pick up a waiting animal | **Board Moss** or the relevant name |
| Put an animal on an ordinary landing | **Let Moss ashore** |
| Deliver at Harbor | **Bring Moss home** |

A routine valid transfer with one eligible passenger should execute directly through the existing action pipeline. Keep a compact pre-action cost/depth treatment. For several passengers, use a nearby content-sized chooser with portraits/full names/capacities and one named committing action. Preserve free subset choice and one action per transferred group.

Predicted loss needs a concise warning before commitment. Relevant tide, landing and depth consequences remain discoverable before the tap; floating feedback does not replace planning information.

At actual visual completion, show one small themed receipt such as **Moss ashore · 1 action used** and **Needs depth 2 → 1**. Derive it from the accepted transaction and actual draft bands. Keep the persistent HUD authoritative. Feedback must not block input, steal focus, stack across the view or survive Undo/restart/hide/Home/cove changes. Reduced Motion uses a static readable treatment.

Preserve busy/input fences, group cost, disappearing-button focus, transfer animation/audio timing, all three puzzles and complete in-session Undo. Leave sailing, Wait, forecasts and general map inspection intact.

## 7. Verification, continuity and handoff

Complete `verification/ACCEPTANCE.md`, including the actual integrated flow from fresh Home through Play, automatic story, direct transfer/Undo, real rescue with subset choice, Bring home and the Harbor continuation. Check portrait and constrained landscape at native sizes. Inspect the Home background and transfer feedback in motion, not only their DOM bounds.

Run production build/typecheck, meaningful affected unit/browser checks and the asset validator. Preserve the existing 75 family IDs. Register only implemented additions, update reused families/gallery/provenance, and distinguish integration from human visual/audio approval.

Update `docs/PROJECT_STATE.md`, canonical scene and interaction/help documentation. Record the single combined task as current and the unused previous two tasks as superseded. Preserve the inherited overlap, heading, rapid-touch and physical-device limits unless concrete evidence closes them. Retain original failures and explain scoped reruns/reuse.

Commit and push to `m1-first-crossing`, update PR #1 while keeping it draft, and leave `main` unchanged. Do not deploy automatically. Preserve the existing publication receipt/history.

Return exact final SHA/remote equality, concise review, verification and limits, native Home/story/transfer phone frames, an uninterrupted actual sequence with runtime audio, and the local root URL **without `?cove=`**. Report whether missing music was reproduced and what was verified; do not present narration or physical Android approval as delivered.
