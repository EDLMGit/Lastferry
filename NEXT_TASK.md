# Last Ferry — water, shores and smooth journeys

## Current task and working agreement

Continue on `m1-first-crossing` from the reviewed Bellwater commit `7efe98654fa3df01fcb8338c6c28e664e5712ca1`, preserving any newer user work. Follow AGENTS.md and the existing Git workflow. Keep PR #1 draft and main unchanged.

This is the authorized task after Bellwater. It advances beyond the original M1 stopping point. Complete the shared route/environment work and verification below, then perform the usual commit/push/draft-PR handoff. Do not stop after the route change to request another task.

The user likes the new map overall and notices that the dotted travel paths have sharp, straight-segment turns. Proceed with the planned visual milestone across **Holding Pier and Bellwater**, preserving **First Crossing** as a playable regression case. The intended result is a visibly more composed coastal miniature with smoother journeys and convincing water/shore contact through the existing tides.

## Preserve the game we have

Keep the existing puzzles, default Holding Pier entry, Next cove progression, Menu selection, named residents and complete Undo. Preserve capacity, load/draft bands, base depths, action costs, tide schedule, boarding/flood event order, previews, successful alternatives and failed-plan consequences. Keep the current contextual controls, compact dialogs, callouts and recent responsive/input protections.

Keep graph nodes and their coordinates, connections, pier locations and flood elevations fixed. Interior route-control geometry may be adjusted where necessary for smoothness, clearance and separation; this is presentation geometry, never a shortcut, new junction or changed action cost. Keep the current overall cove compositions. Decorative coastline refinements should stay inside the validated land/clearance envelope; include any protruding new rock or scenery in actual clearance checks.

No additional cove, mechanic, campaign system, new control scheme or asset-library expansion belongs in this milestone.

## A. Give the routes and ferry one coherent curved course

### Review findings

The current dotted routes are literal `edge.waypointsXZ` polylines in `src/scene/world.ts`. `src/scene/motion.ts` linearly interpolates the ferry's position along the same straight segments; only its heading softens near corners. Bellwater's Harbor–Bell passage is the clearest example, especially when highlighted after the second rise.

There is also a strict interior intersection between `harbor-shallows` and `harbor-bell` near X = −3.190769, Z = 1.081538. It lies away from their shared Harbor endpoint and can imply an extra junction. The current hull-clearance test does not check edge/edge crossings; the independent design validator's crossing check is specific to First Crossing.

### Required implementation

Create a small, cached canonical path representation per edge and use it for the visible route, selected/blocked emphasis, ferry position, motion tangent and clearance validation. A bounded local corner-rounding construction is suitable; choose the simplest implementation that satisfies the outcomes below. Inspect spline overshoot explicitly if using interpolating curves.

- Preserve exact stopping endpoints. Round interior bends into gentle, deliberate courses. Straight two-point passages may remain straight. A move still ends at one selected stop; never smooth across separate actions into automatic travel through another node.
- Resolve Bellwater's unmarked crossing through modest interior control-point changes. Check the resulting network for unintended intersections, coincident stretches or contacts with another stop. Shared-node departures must remain clear and separate beyond the actual junction.
- Keep routes outside land and piers with the modeled ferry's full rotated footprint, including docking turns. Retain the established departure/arrival clearance behavior rather than aligning the hull to a tangent while still against a jetty.
- Sample by traveled distance or an equivalent stable arc-length approximation. Dashes should have consistent spacing through bends; the ferry should not surge at control points. Preserve the existing brief acceleration/deceleration and responsive journey duration, approximately the current 780 ms for a move.
- Traverse the same canonical curve in reverse, with the corresponding reversed tangent. Avoid constructing two different courses for opposite directions.
- Keep heading continuous through interior bends, including angle wrap. Restore the expected stable docked pose at endpoints. Passengers remain attached to the deck throughout travel, draft changes and cancellation.
- Keep path shape identical for ordinary, highlighted and blocked states. Retain text/shape cues for availability; use restrained emphasis with readable contrast at both phone widths.
- Keep solid phone label leaders visually distinct from dotted navigable paths. Those leaders identify labels; they are not routes and do not need route-style curves.

This is a focused shared geometry change, not a general navigation engine or level editor. Cache geometry at level load; avoid rebuilding curves/materials each frame.

### Keep shallow-water presentation aligned

The current shader separately builds shallow bands from raw waypoint segments and has a fixed `shallowSegments[16]` representation. Dense curve samples cannot simply be inserted into that unchanged array. Replace or adapt this with a deliberately bounded representation, such as a small generated mask or bounded approximation suitable for these coves.

The shallow presentation should agree with the curved passages and neighboring banks. The reducer's authored depths remain authoritative. Visual water color must never determine legal travel, create a shortcut or suggest a connection absent from the graph.

## B. Make the water calm and coastal

Retain the art brief's inviting coastal-miniature style and established blue/teal palette. Keep the yellow ferry, red cabin and passenger silhouettes prominent.

Replace the all-over repeated fine diagonal highlights with **broad color variation and sparse, irregular groups of quiet highlights**. Allow substantial open water to stay visually calm. On phones, the water texture should be clearly subordinate to route dots, focus/selection indicators and passenger silhouettes.

Give the deeper outer water, shallow passages and shore-adjacent water a coherent relationship. Use a modest authored seabed/bank treatment so shallow regions feel like part of the inlet rather than luminous paint following a route centerline. Support the existing dry, shallow, navigable and flooded states without pretending that every visible patch is a playable path.

Use a small, predictable rendering approach appropriate to the current Three.js app. Slow, low-amplitude surface motion and a few restrained highlights are enough. Favor simple geometry/materials or bounded shaders over fluid simulation, heavy reflections, new post-processing stacks or dependency changes. Evaluate the result at native phone scale, not only enlarged desktop captures.

## C. Design water contact for all three tide states

The current pale shore pieces sit at a fixed initial height and disappear under the first rise. After the second rise, Low Pier's shore becomes isolated reed tips and rocks, while the Bell shore loses its surface below the boulders. Preserve the flooding; improve how it looks.

For tide 0, 1 and 2, provide coherent **exposed, wet and submerged** treatment:

- Exposed shore has a deliberate sand/rock edge and restrained contact detail where water actually meets it.
- As water rises, wetness/contact follows the real coast and exposed rocks. Avoid a floating outline around the old dry footprint.
- Flooded low ground reads as submerged terrain beneath the remaining reeds/rocks. A simple authored color or geometry treatment is sufficient; realistic refraction is unnecessary. Keep a grounded sense of the shore that used to be there.
- Flooded piers remain unmistakably flooded at the exact rule threshold. Do not raise their elevations or preserve a dry-looking boarding surface to improve the picture.
- Contact detail remains secondary to routes. Foam and wake must not create dotted outlines that resemble new paths.

Use the actual rendered water height during the existing transition, then settle to the exact state. Undo across either rise must immediately restore the correct shore, water, foam, submerged treatment and ferry state. Restart, level selection and animation cancellation must also clear stale effects.

The forecast remains a free preview of the real next tide. Any updated shoreline preview must correspond to that tide without changing committed state or obscuring its compact explanation.

## D. Refine a few shapes and add restrained travel/arrival detail

Preserve each cove's identity. Holding Pier keeps its lighthouse, stone holding point and rabbit shore. Bellwater keeps its triangular inlet, low reed shore and rocky bell landmark.

Refine selected shore contours, reed groupings and rock silhouettes. Break the regular ring of identical detail and repeated layered rims where it is most visible. Keep these changes within the existing footprint/clearance constraints and away from passengers, piers, route junctions and labels. Improve grouping and materials rather than increasing prop density.

Tune warm late-afternoon light, matte material response and gentle contact shadows. Keep cabin sides, animals and flooded pier states readable. Preserve the stable orthographic camera and existing framing; make only the small adjustments required by actual new render bounds.

Add a **short fading wake** that follows the ferry's actual curved course and stops emitting when travel ends. Keep it visually separate from the navigation line and avoid long-lived trails. Add one restrained **warm Harbor light response on successful delivery**, using the existing lighthouse/refuge. It should make completion feel acknowledged without delaying the next action or creating a new screen.

Both effects are presentation only. They must reset correctly on Undo, Restart, level change and cancelled transitions. Reduced motion disables decorative loops/wake movement and presents any arrival response calmly; the existing one-commit input protection must remain independent of animation duration.

## E. Validate the actual changed renderer and paths

Keep verification focused on the risks this task creates. Build/typecheck and run the relevant unit/browser coverage against the implemented source. Existing successful contributor runs establish the starting baseline; they do not validate a changed shared renderer.

### Geometry and rule preservation

1. Unit-check canonical paths: exact endpoints, finite/valid samples, stable distance progression, reverse traversal of the same geometry and continuous interior position/heading. Check degenerate segments safely; do not add invisible excursions to make a test pass.
2. Update the existing full-ferry clearance checks to sample the **production curved path and heading**, in both directions for every edge in all three coves. Checking the obsolete polyline or only the boat center is insufficient. Retain required route margin and check newly refined geometry as well as pier decks.
3. Check actual route geometry for unintended interior crossings/contacts, including the reported Harbor–Bell/Harbor–Shallows case. Compare enough of the real curves to catch overshoot; a check of endpoints alone is insufficient.
4. Preserve the existing reducer witnesses, tide boundaries, conservation, safe/losing subset consequences and complete Undo. Verify that presentation changes have not altered graph topology, base depths, costs or winning alternatives.

### Actual UI and motion

- Complete a real-interface rescue in Holding Pier and Bellwater, plus a baseline First Crossing regression using the shared renderer. Include Bellwater's Harbor–Bell journey and at least one outer-route turn in both directions.
- Inspect actual motion to establish that the ferry follows its visible line and steers smoothly. Include departure/arrival near piers, loaded passengers and the fading wake. A state-only assertion or a still image does not establish smooth motion.
- Check tide 0, 1 and 2 and Undo across both rises, including Bellwater's submerged low shore and Bell shore. Check terminal Undo and the arrival-effect reset.
- Retain natural keyboard and emulated-touch access, free inspection, selected-subset dialogs, one accepted action per input and the measured normal/reduced-motion repeat-Confirm protection.
- Review both main coves at 1440 × 900, 844 × 390 and 780 × 390. Preserve essential text, 44 px targets, passenger silhouettes, named stops, warning fit and label separation. Recheck the intermediate-height placement/resizing affected by scene bounds.
- Confirm normal default → Next cove → Bellwater and Menu/Restart still reset to the intended scene. Verify one rescue in a production build without debug controls or external runtime assets.

Reuse static geometry/materials where practical. Record before/after draw calls, triangle counts and any measured runtime change under the same environment. Investigate a material regression; do not infer physical-phone frame rates from software-rendered automation or turn this task into speculative performance infrastructure.

## F. Evidence and final handoff

Capture matched before/after views using the same state, viewport and framing where practical. Select a compact useful set rather than a large near-duplicate gallery:

- Bellwater's highlighted Harbor–Bell course and one outer bend.
- Holding Pier and Bellwater at their relevant tide states, particularly the submerged shores.
- Both main coves at phone scale, including the constrained 780 px layout.
- A clear successful arrival and an Undo-restored state.

Inspect the selected images at native size and use a short uninterrupted actual-play recording to assess route motion, water and wake. Keep raw video local if external upload is unavailable; report that limit honestly. Do not substitute concept art or assert motion quality from screenshots alone.

Update the art/technical notes and asset ledger for the actual changes. Preserve historical captures under their original source identity. Update STATUS and provide a compact review report with exact source/commands/results, evidence paths, environment and remaining uncertainties. Clearly distinguish fresh checks, justified reused results and unverified devices/engines. A shared-renderer change does not inherit the previous label-only rationale for reusing 28 scenarios automatically.

Complete the normal commit/push and draft PR update. Return the final SHA, source/remote equality, main/draft status, concise changes, verification, representative gameplay screenshots and recording location. Do not merge or mark the PR ready.

The user will playtest the smoother journey and visual feel. Finish this environment milestone before proposing more content or mechanics.
