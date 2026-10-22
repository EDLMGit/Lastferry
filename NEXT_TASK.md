# Last Ferry — shallow detail, a light for home, and music that follows the rescue

## Working agreement

Continue on `m1-first-crossing` from reviewed commit **31ad851a97907c8e86aa6f215b78b38caed7c48b**, preserving any newer user work. Use Node 24. Read `AGENTS.md`, this task, `docs/ART_DIRECTION.md`, `docs/ENVIRONMENT.md`, the current audio/scene code, and `reviews/atmosphere/REVIEW.md`.

This is the authorized next milestone beyond the original M1 stopping point. Implement it, verify the affected experience, commit normally, push the existing branch, and update draft PR #1. Keep `main` unchanged and the PR draft. The user remains the playtester. Make routine art and implementation decisions independently and deliver one chosen result.

The user likes the current music and water direction. Treat the original **“Between the lamps”** composition and the luminous evening cove as accepted foundations. This pass should give the scene more convincing material depth, make Harbor recognizable as home from the start, and let the accompaniment respond gently to the rescue's changing situation.

Use Astra for the visual and musical judgment where it is available in the current workflow. Inspect the rendered result and choose the strongest coherent treatment. Do not spend the milestone producing a menu of proposals for the user to select.

## Preserve the accepted experience

Keep all three coves, Holding Pier as default, progression, contextual controls, compact dialogs, accessible interaction, all puzzle rules and complete Undo. Preserve topology, positions, pier elevations, authored navigation depths, load/draft bands, action costs, tide schedule and boarding/flood event order. Decorative seabed depth must remain separate from navigability.

Keep the accepted rounded courses, steering/docking, travel durations, fading wake, ferry/card placement and transit controls. The last pass already established calmer departures and arrivals; this task does not need another speed change.

Preserve the score's 64 BPM, 80-beat/75-second phrase, existing harmony sequence, recognizable motif, spacious rests and general mix. Add a small compatible accompaniment. Retain intentional audio activation, live mute, the accessible Sound control and the user's preference.

Watching, listening, opening a dialog and inspecting remain free. The rules contain flood deadlines and allow play beyond the final rise. Do not introduce an overall turn allowance or real-time pressure.

## 1. Make the shallows look like a place beneath the water

### Review finding

The current open water and connected pearl reflection are a clear improvement. Some coastal margins still read as broad pale halos, and some submerged forms look like soft oval patches. The tide-2 low island especially loses its material identity. Improve the organization of those forms while keeping the calm surface.

Relevant code: `src/scene/seabed.ts`, `src/scene/water.ts`, `src/scene/water-shader.ts` and `src/scene/shore.ts`. The seabed currently repeats two similarly offset patches around each island and uses a broad distance-based coastal shelf.

### Required result

- Shape a narrower, irregular coastal shelf with a clear transition into deeper blue-green water. Vary its width where the island's form suggests sand, a rocky edge or a sheltered pocket. Avoid a uniform pale border around every island.
- Compose a few recognizable submerged sand tongues and darker stone forms connected to the coast. Two or three useful forms in a visible shallow region are enough. Give them distinct edges, orientation and internal value variation at native phone scale; keep fine grain quiet.
- Make the low flooded shore retain a recognizable submerged outline and some ground character. At the next tide it should visibly sit deeper beneath the moving surface. Undo must restore the earlier water/ground relationship.
- Preserve separate reads for the bottom, the water body and reflected sky. Passing wavelets may distort and illuminate the substrate gently without dissolving every form into blur. Keep most open water quiet and deep.
- Rebalance existing caustics, refraction, absorption and coast brightness together. Increasing all strengths is unlikely to improve depth. The current pearl sheen should remain a deliberate broad feature, and Harbor's warm reflection should stay localized.

Use the existing cached fields and material. You may revise the authored field construction and baked color detail, but do not increase texture resolution or add another water render pass. Keep world-space tide height, the orthographic view direction and correct color-space handling intact. The water remains an inexpensive approximation; do not claim it renders real submerged geometry when it samples a decorative field.

## 2. Improve contact and material distinction on existing assets

Focus on the connections the player watches: ferry to water, pier piles to water, shore to sea, and lighthouse to its warm reflection.

Give selected pier piles and the lower hull a restrained wet/contact treatment tied to the actual water height. It should move correctly with tide, ferry draft, bobbing and Undo. Check unloaded and loaded states. A permanently painted horizontal stripe that ignores those transforms is insufficient.

Use the existing shore/rock wetness as a starting point. Prefer small changes to existing materials, vertex colors or inexpensive local shading. Keep the waterline narrow and legible; avoid a dark outline around every object. Limit special attention to Harbor, the ferry and one vulnerable pier before deciding whether the same treatment helps elsewhere.

Distinguish a few existing land surfaces: sandy low ground, rougher stone, subdued grass and wet edges. Break the uniform island-top color in broad, purposeful regions. Low Pier can feel exposed and sandy; Harbor can feel established and sheltered. Preserve island silhouettes, crossing clearances, composition and the readable cabin/passenger shapes.

Materials are shared in the current model helpers. Keep wet or emissive changes scoped to their intended meshes; do not accidentally darken houses or illuminate unrelated objects through a shared material. Add geometry only when the visible improvement justifies its cost. Avoid expanding prop density, particle systems or the asset catalog.

## 3. Give Harbor a persistent identity as home

### Presentation

The destination should be recognizable during ordinary play, including before the first action:

1. A small, steady warm light in the lighthouse lens, supported by the existing soft glow sprite.
2. The existing broken amber reflection, visibly connected to that light and kept secondary to the ferry and routes.
3. A compact **Home** marker within Harbor's existing map label, such as **Harbor · Home**. Include the destination's role in its accessible name without dropping its current passage or location information.

Keep the cue restrained in size and brightness. Its identity should survive a still frame, muted audio and reduced motion. No extra objective panel is needed. Avoid pulsing rings, bouncing arrows, rotating beams, full-scene bloom or new shadow-casting lights.

Derive the destination from `level.objective.deliveryPierId` and its node. The cue describes the delivery objective; it must not imply that a nonadjacent, shallow or otherwise invalid passage is currently available. Preserve Inspect, focus order, disabled/busy behavior, warning states and the existing route status text. Check label placement at both phone widths, especially while Harbor is the current location.

### State and effects

Separate persistent home-light strength from the transient delivery response. The current `CrossingEffects.reset()` hides the glow and zeroes the lens emissive intensity; resetting an action must instead restore the ordinary home-light baseline. A winning delivery can strengthen the same light briefly, then settle into a warm resting state. Preserve the current visible-unloading timing and exactly-once arrival response. Simply reaching Harbor with passengers aboard is not success.

Undo from success restores the appropriate playing appearance; Restart restores the initial baseline. Cancelling/recovering a transition must clear transient effects while preserving destination identity. Reduced motion should use steady states and restrained fades.

`effects.ts` currently finds the lens by an exact material color, while the glow and water reflection assume a lighthouse-local lamp position. If you touch that model or material, expose a small explicit lens/anchor reference and use it consistently. Keep this a local model/effect connection, not a new asset framework.

## 4. Let the accompaniment follow the rescue

### Musical decision

Treat this as a small secondary experiment within the visual milestone. Make one bounded accompaniment proposal and compare it with the accepted mix. Keep it when it adds a clear, restrained improvement; if it makes the music busy or less inviting, retain the accepted base and explain that decision. Complete the visual and Harbor work either way.

Keep “Between the lamps” playing continuously. Add one sparse, soft companion voice whose authored notes fit the existing harmony cells. A little more presence can accompany an approaching occupied-pier deadline; a warmer answering phrase can accompany the journey home. Preserve the gentle character and ample silence. Avoid per-action jingles, drums, ticking, faster tempo or escalating volume while the player thinks.

Use three playing arrangements, plus quiet terminal handling:

| Committed situation | Arrangement |
| --- | --- |
| Ordinary planning, including a distant flood deadline or safe passengers waiting on high ground | Accepted base score; companion absent or barely present |
| A required passenger is still waiting at a pier that will flood in one or two further actions | A restrained, slightly more present chord-compatible companion; the same tempo and calm pulse |
| All required passengers are aboard or already delivered, with at least one still aboard | A warmer consonant answering phrase, giving the return a sense of relief |
| Won | Existing visible-delivery resolution, then a quieter continuing home arrangement |
| Lost | Fade the companion and soften the arrangement gently; preserve continuity and quick recovery through Undo |

Author the companion against all ten existing harmony cells and account for the long pad releases that overlap adjacent cells. Use the same small sound palette and shared reverb. Do not introduce a new score per cove. Compare the result with the accepted base at matched listening levels; the new voice should add emotional shape without masking the melody or turning warning states into alarm music.

### Derive pressure from the actual state

Create a small pure derivation from `State` and `Level`, with terminal outcome taking precedence. For each pier holding a required passenger, find the first future authored rise whose level reaches its elevation. The smallest `rise.afterTurn - state.turn` is the relevant occupied-pier deadline. Use the one/two-action window above only while those passengers remain there.

The existing `statusCopy()` in `src/ui/presentation.ts` already expresses this logic. Share a small fact helper where appropriate; do not parse display strings or build a solver for music. Never use a witness length, validation search depth, elapsed seconds, total moves spent or a hypothetical optimal solution as the player's remaining budget.

Important boundaries:

- Boarding happens before the rise caused by that action. A safe boarding on action 4 or 8 must remove the corresponding threat immediately in the resulting state.
- Holding Pier's temporary use of safe high ground must not trigger the homeward arrangement while a required passenger still waits there.
- Bellwater's first rescue removes one deadline; passengers at the other vulnerable pier can still define the next one.
- First Crossing's required passengers have their own pier deadline. The first tide rise does not automatically make every level musically urgent.
- Aboard means safe from pier flooding. Delivered means home. Visiting Harbor does not replace unloading.

Set the desired arrangement on initialization, successful commit, Undo and Restart. Preview, Inspect, hover, invalid input and idle time leave it unchanged. State reconciliation must be idempotent and must not replay the arrival sound.

Store a terminal target when the action commits, but enter the won resting arrangement only after the existing visible-unloading delivery callback. Recovery or cancellation should settle into the committed terminal arrangement without replaying the delivery event. Apply the same distinction to a loss-specific musical change that would otherwise anticipate the visible tide consequence.

### Preserve the musical clock and resource bounds

Keep one AudioContext, one bounded scheduler and the accepted phrase phase. Apply small gain/timbre changes smoothly; introduce new notes on the next suitable beat within a short window, roughly one or two beats. The player should hear a response during the next crossing instead of waiting for the entire 75-second phrase to loop. Actions and animation must never wait for a musical boundary.

Keep only the latest desired arrangement. Rapid commits, Undo or Restart must replace obsolete pending accompaniment changes and gently release obsolete notes. They must not queue a sequence of past moods, restart the base phrase or accumulate another scheduler. Musical phase does not rewind with game state.

The current implementation lives in `src/audio/atmosphere.ts`; `sound.ts` re-exports it. Existing long harmony tails and delivery notes share a bounded source budget. Keep the addition to one or two overlapping companion voices and reserve room for the accepted base and delivery response. Verify that notes are not silently dropped at busy moments. Do not merely raise the source limit.

Keep adaptive accompaniment on a music-owned bus/category. `delivery()` currently clears action effects; it must not accidentally delete the continuing accompaniment. Use a safe gain-ramp/cancellation strategy, feature-detecting APIs where needed. Store the latest desired state even before audio creation or while muted/hidden, so resuming uses the right arrangement without replaying missed events.

Retain live mute, intentional resume, page-hide recovery, cancellation and teardown. Maintain audible event timing: travel follows visible motion, and the delivery resolution follows visible unloading. If actual listening is unavailable, retain an actual runtime mix capture and state that the new layer awaits listening. The user has already approved the existing composition.

## 5. Refine within a measured render budget

The last report measured about 25% longer median/p95 frame intervals in Windows SwiftShader, with unchanged draw counts and triangles. This is useful evidence of a cost increase in that environment, not proof of a native-phone bottleneck. Its audio context was not created during the samples.

Keep one water draw, the two existing 256×256 RGBA fields, no reflection target and no extra scene pass. Do not add a post-processing stack. Make visual improvements primarily by reshaping and replacing work already present.

Inspect plausible costs as you touch them. Static seabed-detail math can potentially be baked into the existing field; view/light invariants can potentially be supplied as uniforms. The GPU compiler may already optimize some expressions, so retain changes based on measured results and visual equivalence rather than counting source lines. Preserve orthographic geometry, color conversion and actual tide behavior.

Field construction is a separate CPU startup cost. Independent review found repeated full water construction exceeded 5-second unit budgets in this environment; all errors were timeouts. Inspect the bounded per-texel coast/segment and patch calculations, precompute reusable values, and avoid rebuilding fields during update/Undo. Keep any optimization local and preserve meaningful field samples and invariants. Do not weaken assertions to hide slow setup.

Compare the new result with `31ad851` using the same available browser, viewport, DPR, scene/state and measurement protocol. Measure idle render cost separately from an audio-enabled crossing, and note field construction time separately from steady rendering. Investigate a repeatable regression; use a second matched comparison if the first is noisy or contradictory. Do not introduce an arbitrary universal FPS gate or expand this into a general engine rewrite.

## 6. Verify the changed experience and hand it back

Run the normal build/typecheck and relevant existing tests. Add focused tests for the new state derivation and audio lifecycle risks. A test that repeats a tuning constant does not establish visual or musical quality.

Cover deadline removal by boarding at the exact boundary, safe temporary unloading, Bellwater's remaining second threat, homeward versus delivered, lost/won Undo, previews having no effect, and long idle leaving simulation and arrangement state unchanged. Exercise rapid state changes during scheduled accompaniment and a phrase boundary with bounded sources and no duplicate scheduler.

Use the real interface for complete Holding Pier and Bellwater rescues, both tide rises and Undo, plus a First Crossing shared-presentation regression. Inspect Harbor from the initial state, while unavailable, while current, during a loaded arrival, at delivery and after Undo/Restart. Check 1440×900, 844×390 and 780×390, natural keyboard, emulated touch, and reduced motion. Retain the accepted modal safety, ferry/card clearance and one-action-per-input behavior.

Choose a compact evidence set tied to the final source:

- Matched before/after ordinary views of Holding and Bellwater, with a shallow region and Harbor visible.
- A flooded low shore and its Undo-restored state.
- Native phone views showing the Home marker, readable routes and the loaded ferry.
- One uninterrupted original-speed sequence showing idle water, departure, tide/Undo and delivery.
- An actual audio-enabled sample covering ordinary, near-deadline, homeward and delivery states, including an Undo and some idle listening. Include the loop boundary in this sample or one short separate capture if needed.

Listen to the actual runtime mix where tooling permits. Report listening separately from source/scheduler checks. Raw media may remain ignored/local; give precise paths and provenance. Do not relabel silent rescue videos as audio evidence or past captures as new results.

Preserve original failures. If a bounded exhaustive test needs a larger budget or serial execution in a slow environment, report the original outcome, reason, exact settings and affected rerun. Keep fresh, reused and corrected results distinct. Stop optional testing once the concrete changed risks are covered.

Update `STATUS.md`, relevant art/environment/audio notes and any asset provenance. Put the implementation review and selected evidence in a new directory such as `reviews/refinement/`. Complete the established normal commit/push and draft-PR update. Return the final SHA, remote equality, main/draft status, concise change summary, actual verification, selected captures, recordings and remaining limits.

Success means that the shallow water has recognizable form, the assets feel seated in the scene, Harbor quietly reads as home throughout play, and the accepted music gently follows rescue and relief. Finish this pass before adding levels or mechanics.

## Technical references

- [Audiokinetic: music states](https://www.audiokinetic.com/library/2024.1.2_8726/?id=states_tab_music_objects&source=Help) describes state-dependent gain/filter changes at musical boundaries. It is a design reference; implementation stays in the existing Web Audio code.
- [MDN: setTargetAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime) explains smooth parameter transitions on the audio clock. Its time constant is not the total fade duration.
- [MDN: cancelAndHoldAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/cancelAndHoldAtTime) documents cancellation and limited browser availability. Use compatible behavior or a fallback.
- [Three.js: color management](https://threejs.org/manual/pages/color-management.html) remains relevant when changing the cached field or shader output.

Keep useful existing water research in `docs/ENVIRONMENT.md`; this milestone does not require installing another editor, engine or audio middleware.
