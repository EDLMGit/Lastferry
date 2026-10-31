# Current task — smaller controls, then Driftwood Yard

**Task ID:** `DRIFTWOOD_YARD_01`  
**Reviewed game:** `da1f2686ce6aff8d754e13111447dabb6e1313f0`  
**Observed newer HEAD:** `879c9d1cfb6745ce8a294e4dbba4aa3d984ef4b3`, identical Git tree  
**Repository / branch / PR:** `EDLMGit/Lastferry` / `m1-first-crossing` / draft #1  
**Environment:** Node 24

## 1. Outcome and authority

The user accepts the Home/story/direct-transfer direction, asks for less explanatory dock copy and smaller buttons, and wants to continue the campaign. Deliver a cleaner play surface and the next actual rescue: **Driftwood Yard**, introducing **Nell the boatwright**.

Read the repository guidance, project state, `campaign/CAMPAIGN_DIRECTION.md`, `campaign/PUZZLE_PROGRESSION.md`, `campaign/STORY_SCENES.md` and all supporting documents in this package before editing. This is the new current assignment. `HOME_PLAY_FLOW_01` is complete. Its requirement to put routine cost/depth/consequence prose inside every dock button is explicitly superseded here. Historical M1-only and previous no-new-cove boundaries do not limit this newly authorized slice.

Work on the current branch without resetting newer work. The observed newer HEAD and reviewed handoff share tree `4aa851646f66cb0eda3ee9960ca9c5125170b0e0`. Preserve unrelated changes if the branch has moved again.

Implement these internal stages in order:

1. Compact dock controls and optional inspection facts.
2. Driftwood's level/rule evidence and Nell's asset integration.
3. Authored connection, campaign/save compatibility and actual play.
4. Focused verification, documentation and complete handoff.

All four stages belong to this assignment. Separate internal commits are fine; do not stop after the button cleanup or return another plan instead of the playable cove.

## 2. Compact controls

Follow `contracts/COMPACT_CONTROLS.md`. Routine dock buttons show the existing icon and short named label only: **Board Bram**, **Let Moss ashore**, **Bring Nell home**; group actions use **Board**, **Let ashore** or **Bring home** before the existing subset chooser.

Remove the ordinary `.dock-facts` and `.dock-consequence` rows. In particular, the screenshot's safe tide-boundary boarding should not carry “Bram boards, then the tide rises. Bram is safe aboard.” Nor should group controls explain “Choose passengers” every time. Do not replace this copy with an always-visible panel.

Keep readable full labels and at least 44px effective hit targets, preferably the existing approximately 48px treatment. Make widths content-sized and feed the smaller measured rectangles into existing nearby placement. Do not reduce the whole interface's font or touch scale to obtain smaller controls.

Current load/depth stays in the HUD; ordinary tide timing stays in Forecast. Predicted transfer depth and cost remain available through free current-location inspection and the subset chooser. Ordinary direct actions remain one tap. A preview that actually loses required passengers still warns before commitment and offers free Cancel. Preserve subset choice, group action cost, execution/receipt ownership, input fences, focus and complete Undo.

## 3. The third cove

Follow `design/DRIFTWOOD_PUZZLE.md` and its supplied candidate evidence. The intended insight is:

> A nearby safe mooring can be the right place for a rescued neighbor while the ferry reaches the next low landing before the rise.

Nell uses two spaces. Fern and Oat are new one-space rabbit neighbors. No previously rescued character is stranded again. The ferry still has four spaces and the accepted draft bands. All edges are bidirectional and each accepted action costs one. There is no global move budget, real-time countdown, current rule, cargo collection or character ability.

The candidate is a mechanical contract/proof, not production geometry. Build the actual level data, islands, piers, clear curved passages, labels and authored scenery. Use the selected topology/timing as the starting design. Preserve its distinct staging decision and prove any necessary revision; do not weaken established rules or make a tempting failure disappear simply to obtain a passing rescue. Numeric/layout implementation decisions within this intent are yours, with changed evidence documented.

Replay at least the two supplied successful plans and the meaningful losing/blocked alternatives through the real reducer. Keep witness length separate from game rules and difficulty claims. Confirm conservation, transfer-before-tide ordering, no mutation on rejection and full Undo. Harmless play after all endangered animals are safe remains legal.

Register Driftwood in both the canonical journey and independent practice. `/?cove=driftwood-yard` must open the actual new level rather than fall through to Holding. Existing First Crossing, Holding and Bellwater puzzle data/rules remain unchanged. The next phase's six-space boat is not part of this task.

## 4. Nell and the yard

Follow `direction/NELL_AND_YARD.md`. Implement a real beaver with a broad flat tail, warm brown face, small ears and a compact readable body. The current generic nonrabbit/sheep branch is not an acceptable beaver implementation. Keep the established miniature geometry, material and lighting language.

Nell must read consistently at her pier, aboard, during both docking orientations, in the portrait, in the illustrated connection and at Harbor. Use editable original sources and a matching model-derived or otherwise original portrait through the existing portrait pipeline. A renamed sheep, substitute rabbit portrait or blank permanent portrait is not completion. Preserve working full-name/capacity fallback during image failure.

Give new characters explicit stable appearances; preserve every existing mapping and placement ordinal. A subset or passenger-array reorder must not change coat colors. The new three-body group fits the current two-rabbit/one-nonrabbit seating pattern, but the wider tail and body still need actual deck, transfer and tide/Undo inspection. Capacity is not permission to overlap bodies.

Reuse the accepted two-space wooden-contact profile for Nell through deliberate data/cost classification; do not retune the score or effects. Check current sheep-only assumptions in Help, transfer sound and presentation. Help must work when a level has a beaver and rabbits but no sheep.

Give Driftwood a recognizable timber-yard identity with a few clear props and contrasting safe/low landing silhouettes. Reuse existing wood, stone, reeds and water assets; add only the distinctive geometry needed. Do not broadly redo the accepted environment or Home.

## 5. Story and progression

After the player explicitly accepts Bellwater's rescue, play the new **`driftwood-light`** illustrated scene, ending with **Continue to Driftwood**. Use the existing player, caption treatment, autoplay/Pause/Resume, Skip, transcript, Reduced Motion and Sound owner. Author visible character action; a distant idle cove with a timed text panel is insufficient.

This scene introduces Nell at her yard. It does not launch or grant the larger ferry. After the actual third rescue and explicit acceptance, offer an honest available-content endpoint and Home/Practice/Options. Preserve the last rescue's terminal Undo until that acceptance. Do not substitute the planned twelve-cove supper ending.

Follow `contracts/CAMPAIGN_CONTINUITY.md`. The exact valid historical two-cove-complete record needs a narrow compatibility path. Merely viewing Home, Options or Practice must remain read-only. First deliberate Continue into newly available Driftwood persists its pending entry and plays the new scene from the beginning. A subsequent restored pending scene keeps the static-recap policy. Preserve all earlier checkpoints, invalid bytes, settings, storage-failure behavior and practice isolation.

Audit all current hard-coded cove lists, initial query routing, completed-content wording and scene-background dispatch. One shared playable registry should determine availability where practical. Extend the current architecture; a generic routing/save/cinematic framework is unnecessary.

## 6. Evidence and handoff

Complete `verification/ACCEPTANCE.md`. Recreate the supplied Bram control state and inspect the smaller controls in both phone orientations. Earn the Bellwater-to-Driftwood transition through real controls, complete the new rescue, exercise tide/terminal Undo, inspect the new character at native size and record the actual sequence. Distinguish fixtures used for boundary testing from earned journey evidence.

Run production build/typecheck, affected unit/browser checks and asset validation. Preserve all 76 existing family IDs, and register implemented model/portrait/scene/yard additions or updates with editable sources, consumers and evidence. Update the gallery, asset ledger, current project state and canonical campaign/scene/progression documents. Mark obsolete active-task/manual-shot statements as historical without deleting old evidence or publication receipts.

The known portrait-load timeout deserves a focused check when extending portraits: valid bundled paths, stable fallback and no action dependency on image load. Do not claim its cause fixed without reproduction. Preserve inherited layout, heading, precise rapid-touch, physical-device and acoustic limits unless actually verified. Broaden tests only for a concrete changed dependency or remaining risk.

Commit/push to `m1-first-crossing`, update PR #1 while keeping it draft and leave `main` unchanged. Do not deploy. Return the exact final SHA and remote equality, concise review, test/proof results and limits, native phone frames, uninterrupted actual scene/rescue evidence with runtime audio, the local root URL and direct `?cove=driftwood-yard` URL.

After this slice is reviewed and playtested, the next planned task is **A wider deck + the actual six-space ferry + Wide Berth** together. Deer and currents remain later thresholds.
