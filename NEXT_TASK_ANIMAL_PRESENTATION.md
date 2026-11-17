# ANIMAL_PRESENTATION_01 — finished animals, clear passenger choices and a welcoming arrival

> **Completed and reviewed · 17 November 2026.** Implementation `26ca0a4f7b42c3f9e809f4a6558b0df8dc0c9139` is published in Site version 22. The user positively receives this iteration. [TERNHAVEN_JOURNEY_01](NEXT_TASK_TERNHAVEN_JOURNEY.md) is now active; preserve the original animal brief below as history. [Independent review](reviews/animal-presentation/INDEPENDENT_REVIEW.md) · [Receipt](reviews/animal-presentation/deployment-confirmation.json)

## Outcome and order

Refine Last Ferry's actual animal models and the two places where players inspect them closely: passenger choices and the rescued group in the arrival bubble. The user supplied [arrival](reviews/animal-presentation/baseline/user-arrival.png) and [offboarding](reviews/animal-presentation/baseline/user-offboarding.png) screenshots and asks for a finish comparable to the new lanterns.

**Do this pass first. TERNHAVEN_JOURNEY_01 is queued and has not been sent to Codex.** Keep its brief for the following reviewed pass. This assignment adds no Journey scene, registry entry, save migration or puzzle.

Reviewed runtime is `a2740e61ec5a782f558ea6caad4181466d04e9f7`; latest preceding guidance is `946fab5cc6288bfcfb8d78e796ea342449178328`. Work on `m1-first-crossing`, incorporating this task commit and newer user work safely. Do not reset or force-push. PR #1 remains draft and GitHub main unchanged.

Read current AGENTS, active project state, ART_DIRECTION, the appearance resolver, model/export pipeline, arrival and transfer components, catalog and [planning review](reviews/animal-presentation/PLANNING_REVIEW.md). The old portrait task's prohibition on changing animal geometry is superseded by this explicit user request. Refine the animals while preserving their identities, practical fit and behavior.

The current Site stays at **version 21**, game a2740e6, hosting `ea3bed5c0aaf41e4ba516e4621da0f81119e652b`, with its existing custom private audience. Local Codex implements and hands off; ChatGPT reviews and publishes separately.

## 1. Finish the shared animal family

Use the established handcrafted coastal miniature style: soft intentional forms, matte painted surfaces, clear silhouettes and a gentle expression. Improve the actual `animal(species, variant)` source used on the ferry and shores, then derive UI art from that same source.

| Appearance | Preserve | Finish to pursue |
| --- | --- | --- |
| Cream rabbit | Cream coat, upright ears, compact body/feet | Joined cheeks and muzzle, readable nose/eyes, tapered ears and neatly attached inner ears. |
| Tan rabbit | Tan coat and distinct ear splay | The same construction quality; inner-ear shapes follow the actual outer-ear angle. |
| Sheep | Cream wool, darker face/ears, four supported legs | A coherent wool mass with a few purposeful rounded curls, a readable gentle muzzle and eyes, clean face/ear separation. |
| Brown beaver | Brown fur, lighter muzzle/chest, round ears, teeth, flat tail | Deliberate cheeks/paws, integrated teeth and a recognizable broad tail that still fits its existing space. |
| Chestnut deer | Orin/Juniper's chestnut coat, cream muzzle, spots, short forked antlers and four hooves | Cleaner head/neck/muzzle transitions, warm readable eyes, tidy ears and antler contours. |

Use restrained eye highlights and shape definition where they read at phone scale. Expressiveness should come from forms, face and an inviting settled pose. A new rig, wardrobe, per-character accessory system, animated portrait renderer or facial-animation framework is unnecessary.

Keep the five appearance keys and current full-level/passenger-ID resolver. Named neighbors continue sharing their established appearance; names, species and space costs remain data. Preserve cream/tan identity when only one rabbit remains offered or aboard.

### Keep geometry changes local and physically honest

The exported `ball()`, `box()`, `cylinder()` and `mat()` helpers also build the ferry/world. Add animal-local geometry or material ownership, or a small animal-only module preserving the public factory, rather than globally changing shared primitive resolution, cached materials or scene lighting.

Preserve root species naming, Y-up, positive-Z facing, the foot-contact origin and current world scales: rabbits `[1.25,1.65,1.25]`; other species `[1.15,1.5,1.15]`. Keep established apparent size and practical clearance envelopes. Shape refinement is authorized; shrinking animals, moving seats, enlarging the ferry or loosening collision tolerances to hide fit failures is not a solution.

Keep usable contact geometry and the existing `beaver-flat-tail`, `deer-hoof` and `deer-antler` semantics. World bounds use real geometry, so oversized ears/tails/antlers can also change camera fit and hit rectangles. Inspect actual body separation and foot support through boarding and unloading.

Two known integration traps need care:

- `World.presentStory()` currently finds Moss's head using direct child positions. Preserve the behavior, or make a small semantic-head adaptation if a new hierarchy requires it; verify restoration.
- Existing foot-support checks select low meshes. Merging every foot into a tall body can make that selection empty. Require nonempty contact evidence and correct measurement; a vacuous passing check is not support validation.

Keep the separately authored illustrated story scenes coherent with the same identities and palette. No story-art rewrite belongs here.

## 2. Two coherent static views from the same models

The existing rabbit/sheep images are head/upper-chest crops; beaver/deer images fit complete figures. Their shared fixed-size UI boxes exaggerate this difference. The current offline SVG renderer also produces visibly faceted shading. Correct both composition and finish.

Produce two deliberate profiles for each of the five appearances:

| Profile | Consumer | Required framing |
| --- | --- | --- |
| Choice portrait | Board, Let ashore, Bring home | Head and upper chest; recognizable face and characteristic ears/antlers; comparable perceived prominence across species. |
| Arrival figure | Rescued group | Complete figurine, including supported feet and defining tail/antlers, with a common ground line and coherent apparent scale within the group. |

These are **ten reusable derivatives from five shared appearances**, not ten separately designed characters or one image per name. Use ordinary transparent images at runtime. Keep live names, space costs, selection ticks and panel decoration in DOM/CSS.

Use one documented bake recipe and lighting/color treatment for the family. Prefer a bounded offline capture of the actual Three.js model with smooth normals and controlled matte lighting if the SVG projection cannot achieve the intended finish. An offline renderer/export harness is allowed; it must not create another runtime canvas, import pipeline or game engine. Keep rendering claims accurate: simplified SVG projection is not a screenshot of production WebGL.

Regenerate images from the revised factory. Do not stretch, non-uniformly scale, trace or hand-retouch mismatched old rasters into a new family. Keep the same character identity between world and UI. Camera/crop can differ by profile and species without distorting the model. Retain intact identifying ear/antler shapes and a useful face size.

Use bounded high-quality outputs, normally transparent 256px RGBA images. If a larger derivative is visibly necessary at the actual display size, document it and keep payload/resource costs proportionate. Inspect transparent edges on ordinary and selected teal surfaces, not just a checkerboard.

Record source/model/module hashes, scale source, renderer/version, generation recipe, camera, lighting/color settings, output dimensions, hashes and profile-to-appearance mapping. Preserve historical manifests/evidence rather than rewriting their origin.

## 3. Make the rescued group feel composed

Keep the centered arrival bubble, successful original lantern crown, heading, result summary, existing actions and coastal palette. Refine the crew region into a compact, welcoming group whose figures use its available space purposefully.

Give the three-neighbor group more presence and a shared visual baseline; eliminate the large empty frame around small mismatched pictures. All figures and their associated names must remain individually readable. Four- and six-neighbor groups may use balanced rows as space requires. Recompose across portrait and short landscape; do not use one oversized layout then shrink everything.

Keep the entire real rescued cast: required IDs intersected with actual delivered IDs, including Sedge's early delivery in Ternhaven. Names remain live text immediately associated with the correct figure. No selection or space-cost badges belong on the celebration group.

Preserve safe-bound measurement and centering, with stable bounds within each state. A deliberately more compact authored card may have different dimensions from the current version. Keep coherent Harbor framing and reserved image dimensions. Loading/failure must retain a stable named slot. Avoid face overlap, clipped ears/feet/names, horizontal scrolling or a carousel that hides rescued neighbors. Keep current and previous-best lanterns distinct and storage notices visible.

The existing finite arrival animation can settle the refined content. Reopening, Settings, Details, rotation, visibility and fullscreen must retain their current behavior. No extra celebration owner or continuous character bouncing is needed. Reduced Motion shows the settled group immediately.

## 4. Polish passenger selection, including offboarding

Apply the choice portraits consistently to **Board passengers**, **Let passengers ashore** and **Bring passengers home**. Offboarding is the user's immediate example; all consumers of the shared component should have the same finish.

Make the face useful within each card, with the full name, exact space cost and a distinct selected state. Start from the current compact tile and improve the framing before adding size. Modest portrait/tile growth is allowed where native phone measurements support it; the old 44px prescription is no longer an absolute ceiling. Do not shrink essential text or touch targets to accommodate decoration.

Preserve one native `aria-pressed` passenger button per tile. The portrait/copy/tick belong to that same control; no extra click handlers or nested buttons. Selected fill/rim and tick should be clear without dimming unselected faces to invisibility. Keep selected/unselected geometry identical, keyboard focus visible and focus restoration after preview rerender.

The named confirmation remains the sole commit for multi-passenger choices. Toggling selection is free, and empty selection cannot commit. Preserve supported single-passenger direct actions. Keep full before/after load/depth and necessary warnings accurate. Routine copy may be arranged more cleanly, but adding explanation or removing decision information is outside this art pass.

The sheet stays near the initiating control using existing placement. Constrained content can scroll while the named commit footer and dismissal remain reachable. Inspect zero, one, several and all selected; long names; both selected states; pending/failed images; and four/six choices on short screens. Avoid image completion or selection changing the card's position or the commit target.

## 5. Protected behavior and resource budget

Keep every level/witness, rules, capacity, draft/current/tide/flood order, Session/Undo, nine scoring targets, accepted bests, Practice isolation and seven-cove Journey unchanged. Preserve all save bytes/backups and the current provisional result boundaries. Close/Details/Settings/Escape/reopen accept nothing; actual navigation/Continue/successful Restart keep their existing owners.

Preserve ferry profiles, seats, docking, movement paths, ordinary camera policy, water, scenery, audio and timings. Only a small demonstrated model-attachment compatibility repair may touch their integration points; explain it and test the affected behavior. Do not alter global helper behavior to improve animals.

Record before/after mesh, triangle and material/draw-call costs for the five appearances and a representative crowded Play frame. Prefer better contours and shading to indiscriminate tessellation. No per-tile WebGL, new heavy runtime dependency, perpetual UI animation or speculative performance framework. Inspect the actual game for rendering stalls; do not call an emulator result physical-phone performance.

## 6. Implementation and verification

Make an internal art checkpoint first: all five revised models together, matched before/after camera/light, both derivative profiles, native-size choice samples and arrival-size samples. Resolve observed readability/style problems there, then finish the actual consumers. This is part of implementation, not a new user-permission gate. A polished gallery alone is not completion.

Use Node 24. Run build/TypeScript, asset validation and focused existing checks for identity, contact/clearance, selection and arrival. Relevant geometry coverage includes deck-volume, Driftwood deck, Two Shelters seating/geometry and wide-ferry rosters/foot support; use affected wide-clearance/story-pose checks where the changed geometry/hierarchy creates risk. Keep real geometry measurements and nonempty contact assertions. Do not weaken old checks to accept intersecting models. If mechanics remain byte-identical, another exhaustive puzzle search is unnecessary.

Required visual/interaction evidence:

- Actual Holding Pier rescue and actual Ternhaven rescue through controls, with at least one on the minified production build. Together they cover all five appearances, both ferry sizes, the three/four-neighbor group and early-delivered Sedge.
- Representative dense small-boat beaver and five-body six-space ferry inspection; six-neighbor arrival may use a clearly labeled renderer fixture. Actual transfer/deck behavior requires real geometry/state, not a result-only image.
- Board, temporary Let ashore and Harbor Bring home; subset selection/cancel; one commit per input; tide Undo and terminal Undo/redelivery; result dismissal/Settings without acceptance; no duplicated/stale portrait or animal after interruption.
- Native 390×844 and 780×320 before/after frames of the supplied three-neighbor result and offboarding state, plus mixed/six-neighbor cases, 320px portrait fit and desktop smoke. Check ordinary browser and one fullscreen/rotation transition. Delayed/failed images must preserve names, layout and control reachability.

Keep matched camera/lighting/state for comparisons, with exact source/build/environment identity. Gallery exports demonstrate art; actual gameplay demonstrates integration. Label fixtures and original failures accurately. Retain one bounded uninterrupted transfer/final-arrival interaction recording with runtime audio and capture-gap metadata through the existing pipeline. No new audio composition or acoustic approval is implied.

Update the existing model, portrait, choice and arrival catalog families, shared gallery, manifests and ASSET_LEDGER. Add a profile variant or family only if the catalog contract requires it; keep all prior IDs and history. Complete acceptance means visibly improved actual models and coherent native UI, as well as technical checks.

## 7. Handoff and following task

Update active state/STATUS/art guidance and add `reviews/animal-presentation/REVIEW.md` with model/export decisions, exact provenance, resource comparison, matching native before/after evidence, actual interactions, original failures and remaining limits. Preserve this planning review and user references.

Commit/push normally, verify the remote SHA and update draft PR #1. Leave main and Site publication/access unchanged. Return the exact SHA, concise findings, checks/limits, useful screenshots/recording and local Journey/Practice URLs.

**Do not start TERNHAVEN_JOURNEY_01 in this pass.** Its scope stays queued for review after this handoff; it will use the finished animal family when commissioned. Current content remains seven Journey coves, nine Practice entrances and nine scoring targets.
