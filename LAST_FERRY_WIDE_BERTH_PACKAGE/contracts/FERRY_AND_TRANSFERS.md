# WIDE_BERTH_01 — Ferry and transfers

Read with `../NEXT_TASK_WIDE_BERTH.md`. This contract covers the actual six-space ferry and its presentation. Campaign continuity, the launch script and puzzle proof belong to their separate package documents.

## 1. One real larger ferry

Wide Berth introduces a visibly wider/longer passenger deck, retaining the yellow hull, familiar red cabin and existing visual language. Its roster contains six named neighbors: two sheep and four rabbits, totaling eight required spaces. The boat carries at most six spaces: up to five bodies for this roster. “Six spaces” never means six equal-size animals.

Resolve one small presentation profile from the active level before constructing its model. Share the relevant hull/deck, seating, transfer and wake dimensions through that profile. The renderer currently constructs an unconditional `ferry()`; changing capacity alone is insufficient. A narrow four/six-space profile is enough; no fleet framework is needed.

First Crossing practice, Holding Pier, Bellwater and Driftwood retain their original four-space rules, hull, seating, paths and presentation. Story completion must not upgrade those levels. Keep the original default model behavior for existing callers and gallery specimens. Do not add a hull picker, purchases, cargo or another species.

## 2. Capacity is the entire loading rule

Provide deterministic automatic seating for every capacity-legal subset of the authored roster. Selection order must not change character identity, appearance or final seating. Sheep require their real larger footprints; multiple sheep and third/fourth rabbits cannot reuse the current three effective anchors.

An authored layout or small shared placement helper is sufficient. The player never assigns seats, rotates bodies or solves a packing puzzle. Once the reducer accepts a group, presentation must accommodate it without an additional restriction, hidden cost or extra action.

Keep stationary occupants clear of one another, cabin, rails and transfer corridors. Existing occupants must not snap or teleport when somebody boards or leaves. If an assignment changes, define its before/after positions and a harmless transition; changing shared anchors during the existing transfer loop is insufficient because that loop skips passengers who remain aboard. Undo and restart must reconstruct the same positions and attachment hierarchy.

## 3. Transfers, landings and full-load pose

Use the actual profile’s deck height, gates, corridors and bridge reach. Current ordinary/beaver transfer offsets are small-boat assumptions; preserve them for old levels. Verify every legal Wide Berth boarding/unloading selection, including partial unload, reboarding and transfers past passengers who stay aboard, at both supported berth orientations and relevant tide/load combinations.

Bodies must cross a credible pier-to-deck connection without intersecting cabin, rails, stationary neighbors or one another. Keep transfer-before-rise semantics and one committed action for a selected group. Wide choreography may arrange movement within that presentation; it cannot create additional turns or globally retune accepted transfer/sailing timing. Reduced motion must settle to the same valid result without stale effects.

Larger groups also need safe waiting and arrival placement. Check all authored waiting arrangements and all six delivered neighbors on the actual pier/refuge geometry, including full-group unloading. No body may sit in water, overlap another body or disappear beyond the frame.

The new draft bands are 0→1, 1–2→2, 3–4→3 and 5–6→4. Validate complete ordered coverage. The current visual formula places draft four at hull Y `−0.195`; inspect hull/water contact, deck attachment and bridge height there. Gameplay continues to use integer depth and current-tide validation, with equality safe.

## 4. Wake, steering and clearance

The current wake uses fixed longitudinal/lateral extents `.76/.48`; berth steering uses fixed `.45/.55` approach/departure distances. Verify these against the wider model. Parameterize only what its actual geometry requires, preserving original-profile behavior and accepted motion timing.

Wake release must meet the correct displaced-water side during forward, backing and turning travel. Preserve distance-based emission, finite released crests, coast masking, reduced-motion clearing and residual settling. No new arrival pulse or visual/audio flourish is required.

Sweep the actual oriented hull, fenders, rails and material passenger protrusions along the actual smoothed paths, both directions, every reachable departure heading and both berth sides. Check land, piers, turn sweeps and boarding reach. Camera bounds and authored reference-radius/centerline proxies are not collision proof. Fix the new geometry/layout without lowering established clearance thresholds or changing original coves.

## 5. Interface and sound

Derive capacity rejection, Help and draft explanations from the active level. The current overflow message says four spaces and Help omits the 5–6 band. Preserve compact icon/short-label actions, free inspection, native subset choice and deliberate loss warnings. The chooser must fit six options; selecting an overcapacity group must explain the six-space limit without changing state/history. HUD and preview must agree at loads four, five and six.

Inspect full-deck silhouettes, Play/Overview/pan, labels, chooser, compact actions and arrival in native portrait and constrained landscape. Use actual passenger/boat bounds for placement; shrinking all animals is not an acceptable fit fix.

Preserve the existing Sound owner, composition/gains, grouped contact cues and cancellation. Group size cannot stack one sound per body. Undo must restore gameplay/heading/seating and clear stale effects without replaying contacts.

## 6. Evidence and inventory

Extend focused geometry/placement tests using the same production profile and helpers as `World`. Existing deck tests duplicate anchor literals and identify rails at exact old coordinates; copying those assumptions would miss wider obstacles. Cover every legal subset and transfer, draft four, tide-changing transfer, full Undo, wake contact and original-profile preservation. Complement checks with an actual full-load rescue and native moving evidence; neither screenshots nor a design solver establish transfer quality.

Retain all 78 existing asset IDs. Extend the ferry family where appropriate; any justified addition requires catalog, gallery/evidence and ledger provenance in the same change, followed by `check:assets`. Keep implementation, executed verification and human visual/puzzle/audio acceptance distinct. Carry forward unresolved historical limits honestly.
