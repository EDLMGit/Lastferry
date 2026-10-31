# NEXT_TASK_WIDE_BERTH_VISUAL_REPAIR

**Task: WIDE_BERTH_VISUAL_REPAIR_01**  
**Reviewed baseline: 45ab9768792ddd3a8dffb67da6c332f8fe2234ff**

## Outcome and priority

Correct the visually rejected Wide Berth presentation before continuing the campaign. Deliver a charming, readable larger ferry, naturally varied islands, credible small landings, visible animals and a grounded illustrated launch. Keep the working puzzle and campaign/save implementation.

The previous assignment specified mechanical safety more strongly than composition. The current result satisfies many functional checks while missing the intended visual hierarchy. This task deliberately replaces the new oversized geometry and its arbitrary size tests. Do not defend or preserve an unwanted proportion merely because a test currently encodes it.

Read repository guidance and the package documents listed in START_HERE. **Open the supplied PNG visually** and inspect current native frames. Refer to `art/VISUAL_TARGET.md` for how to translate the reference into the existing renderer. Make routine choices and complete the correction autonomously; internal visual iteration is not an additional user approval gate.

## 1. Preserve the puzzle; reauthor its space

`verification/mechanics-before.json` records the non-spatial Wide Berth contract at the reviewed SHA. Keep node/edge identities and adjacency, depths/directionality, pier/island flood elevations, six-space draft bands, rise actions 5/10, passenger names/species/costs/appearance, starting groups, objective, action semantics and all four successful witnesses unchanged.

Spatial coordinates, island outlines, dock/berth positions, route control points, safe waiting areas, profile geometry and camera framing may change. Recompute real geometry checks after those changes. Keep the water scale and required route-clearance margin; a reference boat radius is not the actual wide-hull collision proof.

Earlier four-space level data and boat profiles remain intact. Shared marker or support helpers may improve only the necessary behavior, with representative old-cove checks. Do not introduce another level, species, current, capacity rule, seat assignment, randomized layout, global action limit or difficulty change.

## 2. Rebuild the larger ferry's proportions

The current profile grows from beam1.06/length-envelope1.93 to beam2.92/envelope4.90, for capacity4→6. A test requires both rendered dimensions to exceed twice the old ones. That ratio is not a game requirement: remove it.

Design a compact larger sibling of the accepted ferry. Preserve the yellow hull and red cabin, shaped bow, layered hull/freeboard, rounded gunwale, clear window/roof/chimney and restrained dark fenders. Give the cabin enough visual presence that the vessel reads as a working ferry at phone scale. The deck should support its group without a large unused rectangular expanse.

Choose dimensions from real occupants and transfer routes, then judge the silhouette in actual views. Do not replace the old arbitrary ratio with another untested hard ratio. Reauthor hull/deck/profile/seat/gate relationships together; uniformly shrinking the parent group or the animals is insufficient.

Retain all 59 legal roster memberships, including empty; every legal transfer subset; four bodies/six spaces; four rabbits together; and five bodies/six spaces. Species and stable identities remain unchanged. Compact authored banks/staggering are permitted. Passengers remaining aboard must not snap when a subset moves; any necessary repositioning is deterministic and visibly continuous, including Undo/restart restoration. No player packing interaction or extra action.

Keep a credible transfer corridor without solving clearance by leaving a huge unused floor. Check the actual cabin, roof, rails, stationary bodies and feet. Treat real overlapping bodies and unsupported feet as defects. Design rails and current camera/body orientations so heads remain recognizable; retain accepted full-size animal geometry.

At draft four, inspect hull/waterline, dry attached deck, gate and bridge. Derive wake contact and motion bounds from the corrected profile. Preserve the accepted water/wake character, finite release/fade and sailing duration policy; no new shader, bloom, sound or spectacle pass.

## 3. Fix landings, groups and gangways

The current shore helper puts all six global IDs on a 1.1-unit-spaced row even when only two/four wait. Replace this with compact, identity-stable authored waiting/delivered arrangements on real supported land/quay surfaces, with a clear path to the dock.

All reachable legal groups must have room; explicitly cover six neighbors at High Quay and six delivered at Harbor. Replace the assertion that every group must stand inside every giant pier rectangle with actual walkable-surface support and obstacle/transfer checks. This changes the support model, not the required safety.

Docks must read as walking surfaces. The current nine .14-deep planks across 2.2 units leave gaps almost as wide as the boards. Use fitted narrow seams and supported decking, with board count/width derived from the authored run or an equivalent continuous deck construction. Preserve old-cove pier output. High Quay should have a quiet stone landing/edge, not identical timber slats painted gray.

Reauthor berth distance and gate placement before drawing the bridge. Replace the long plain orange rectangle with a short credible gangway, modest thickness and coherent boards/hinge/support. Its endpoints must match the actual animation path. A restrained folded/retracted idle treatment is optional only if deployment, interruption, Undo and Reduced Motion remain coherent. Never hide a traversed gap.

Avoid a full-island-width plank apron. Waiting space belongs mainly to the island/quay, with a compact landing doing the boarding work. Keep one committed action per group and the established transfer/visible-arrival timing and audio lifecycle.

## 4. Give the cove a composed environment

All four current island footprints are translated copies. Author four distinct silhouettes and land uses:

- **Harbor:** asymmetrical sheltered shore, lighthouse as the warm focal point, compact refuge space.
- **Wide Berth:** an elongated or gently hooked working shoreline, modest shed and open waiting area.
- **High Quay:** smaller angled irregular stone/grass mass, visibly dry safe ground.
- **Shell Landing:** low asymmetric shell/reed spit with a clear vulnerable shore.

Use shape, relative size, edge treatment and restrained existing scenery. Rotating four copies or adding more props to the same rectangle does not meet the goal. Preserve gameplay flood elevations and tide-aware contact; the generated board never overrides them.

The current shore top uses a triangle fan around an island center. Prefer distinct irregular convex or compatible star-shaped outlines if retaining that construction. A deeper concavity requires valid triangulation, coast masks, bounds and route checks. The reference's indentation is optional; do not leave hidden triangles filling water merely to imitate it.

Right-size the hull/landings first, then compact and recompose the same five-node graph. The current world grew greatly in both axes, making unchanged animals look tiny in Overview. Avoid solving the whole issue by zoom alone. Keep the shallow shortcut, deep detour and waiting groups legible, with smoothed routes that clear actual land, piers and turning hull.

## 5. Restore character visibility and honest interaction cues

Keep both released camera modes useful. **Play** must show the current boat, active transfer connection and nearby animals clearly. **Whole cove** must explain the network and make occupied shores identifiable; it need not show close-up facial detail everywhere.

The current marker projects onto the boat center and becomes an opaque disk over a sheep face. Preserve a 44px-or-larger accessible target, clear focus, one semantic endpoint/tab stop and true route association, while moving/redrawing the visible current selection cue in nearby water or a quiet water-level treatment. Use a stable leader/contact relation if offset. Keep labels and routine action controls clear of heads and transfer paths. Do not make the marker jump around with bobbing or move confirmation to the opposite screen side.

Inspect current, selected and keyboard-focused states at both berth headings. Revisit default portrait and short-landscape framing after geometry changes: a specially zoomed developer view cannot certify the released Play view. Preserve bounded pan, Whole cove, Back to boat, nearby chooser, fullscreen and existing compact UI style.

## 6. Ground the launch in one composed scene

Keep `a-wider-deck` / `launch` in the current Canvas player. Match the corrected game's hull/cabin/bow proportions in `readyFerry()`.

Replace independent viewport-height placements with shared local anchors for shore/quay, water contact, cleat, ferry waterline/deck and character feet. A low supported landing should meet continuous water; no strip of distant hills/sky under a suspended slab. Keep a credible shore/foundation behind it and modest posts/reflection/contact marks.

At every beat, Nell stands on the quay, visibly separate from the cabin roof. The helpers remain clear and safely ashore. Compose portrait and short landscape deliberately, including caption/control space. The ship glides along the water plane and settles; it never drops from a shelf.

Preserve the existing 8-second release/glide/acknowledgment/settle tracks, exact caption, 1050ms caption cue, 3500ms finite water cue, shared Sound ownership, immediate **Continue to Wide Berth**, Pause/Resume, Skip/Replay, Reduced Motion, transcript and recap. Keep all campaign/save/Practice/Undo boundaries. Earlier accepted scenes remain intact.

## 7. Implement, inspect, then verify

Use internal stages: choose coherent ferry/pier proportions with real full loads; render and inspect them in actual native views; integrate the four shores and camera/marker; recompose launch; then complete focused acceptance. Iterate on visible defects before producing the final report. Do not stop after a gallery specimen or concept image.

Complete `verification/ACCEPTANCE.md`. Re-run actual geometry and both rescue strategies after spatial changes. Removing the arbitrary >2x test and replacing the pier-rectangle proxy is correct; lowering genuine clearance margins or masking failures is not.

Update docs/PROJECT_STATE, ART_DIRECTION, relevant model/cove docs and the asset catalog/ledger/gallery for actual changes. Retain all 79 baseline asset IDs. Record this pass as correcting a visually rejected implementation, not new campaign content. Keep technical results, Codex visual inspection, user acceptance and deployment distinct.

Commit/push **m1-first-crossing**, update **draft PR #1**, leave **main unchanged** and do not deploy. Return the exact final SHA, source-linked review, matched actual native frames, an uninterrupted launch/transfer/rescue sequence, focused verification and remaining limits, plus root Journey and `?cove=wide-berth` URLs.
