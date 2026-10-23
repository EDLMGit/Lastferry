# Last Ferry — Art Direction

## Intent and milestone

Make a small coastal world that feels carefully made and worth looking after. The player should read the puzzle immediately, then notice the charming details. M1 is **one polished, playable cove**: a yellow ferry with a red cabin, one sheep, two rabbits, and a lighthouse refuge. The broader aspiration is a finite, authored story of roughly twelve puzzles and one to two hours; that is context, not an M1 content requirement.

Use actual 3D terrain, structures, ferry, and animals. Generated concept images establish mood, shapes, and composition; they are not screenshot backgrounds or a substitute for a playable scene. Their exact realism is not a promise of a pixel-identical real-time result.

### Reference order

1. [`first-crossing.png`](../references/first-crossing.png): primary guide for the cove, visual hierarchy, ferry, and inviting coastal atmosphere.
2. [`original-concept.png`](../references/original-concept.png): secondary guide for miniature character and coastal charm.
3. [`drowned-orchard.png`](../references/drowned-orchard.png): future mood only; cooler water, vulnerable land, and restrained tension.
4. [`sanctuary-ending.png`](../references/sanctuary-ending.png): future mood only; warm light and the satisfaction of arrival.

The implemented level data and rules determine coordinates, connections, depth, tide, passenger occupancy, and available actions. Never copy invented numbers, extra passengers, decorative routes, or UI claims from an image.

## Forms, materials, and color

Aim for a handcrafted coastal miniature: rounded terrain edges, gently irregular stone, thick wooden boards, simplified foliage, and soft painted surfaces. A few intentional seams and asymmetries are more useful than dense texture noise. Avoid a generic collection of unmodified cubes, glossy toy plastic, photoreal vegetation, or excessively faceted terrain.

The ferry must read first as a yellow hull and red cabin. Give it a shaped bow, visible gunwale, open passenger deck, and a few substantial details. Its passengers must remain distinguishable from both the deck and shoreline. The sheep reads through a cream wool mass and darker face; rabbits through upright ears, compact bodies, and slightly different poses. Do not introduce visual differences that imply unimplemented abilities.

Starting palette; tune it in the rendered scene rather than treating these as exact reference samples:

| Role | Suggested color | Use |
| --- | --- | --- |
| Deep water | `#285F73` | Clear navigable water; restrained variation |
| Shallows | `#81C9C9` | Readable sandbanks and coastline |
| Sand | `#E8D8B6` | Soft light shoreline |
| Rock | `#8E9D99` | Quiet support for the focal objects |
| Grass | `#A6B68A` | Muted coastal green |
| Ferry hull | `#E7B84B` | Principal moving focal point |
| Cabin | `#B95045` | Recognizable warm accent |
| Wool and trim | `#F6EDDC` | Animals, lighthouse, selected details |
| UI ink | `#213F4B` | Text and strong outlines |
| Caution accent | `#A65338` | Sparse warnings, always with text or shape |

Use matte or softly rough materials with subtle color variation. Keep metal accents small. Ensure interactive states and text have adequate contrast in the final UI; palette membership alone does not establish accessibility.

## Camera, framing, and readable scale

The cove-interface pass separates freestanding place names from small light markers at the actual route endpoints. Each name and its marker belong to one semantic button and one Tab stop. The visible ring is small; its stationary hit area is normally 48 pixels, reducing to 44 for close neighboring endpoints. Names retain compact dark text backings without a large pill. Current, selected, remote, shallow and flood-risk states use shapes and written inspection alongside color. Harbor keeps its modest Home cue.

Use one consistent deep teal surface, warm ivory text and fine sand/brass borders for the HUD, forecast, location callout, Menu, passenger preview and ending. Seafoam identifies ordinary actions; warm amber identifies selection and warnings. Text-bearing surfaces use enough opacity for the brightest scene regions. Focus rings have dark keylines, and warnings retain their real written consequences. No blur, pulse or scene-lighting change is needed.

Docked passenger controls sit near the ferry and gangplank: Board points toward the ferry, Let ashore points toward the pier, and Bring home marks Harbor unloading. A short verb accompanies each directional SVG. They open the existing subset preview and never transfer passengers immediately. Names, dock controls and route callouts avoid figures, global controls, one another and opening touches. A selected current place remains inspectable for free. Modal presentation suppresses underlying local cards and dock controls; cancellation retains logical selection and returns focus safely. The dark success panel leaves Harbor and the delivered passengers visible.

The stable full-canvas fit reclaims water behind the HUD while protecting the complete future-loaded route envelope. Use lateral space before shrinking the cove for a corner control; selection itself never pans or zooms. Holding's Stone island uses the existing sparse rocky vocabulary; Harbor stays sheltered and Rabbit Pier retains its cottage. The lantern has a compact pale warm core within an amber surface, darker supports and local warm gallery/tower spill. Depth testing remains enabled; the roof must occlude light normally. Ordinary play retains this local illumination. The Harbor homecoming below adds a won-only sweep; no bloom or global lighting change is introduced.

Use a fixed orthographic camera at approximately **55 degrees above the water plane**. Choose the azimuth around the authored cove so every relevant pier and passage is visible. Do not add camera orbit as a required interaction.

Fit the complete playable cove in mobile landscape and desktop views. Preserve space for controls and device safe areas. Resize through camera framing and UI layout, not by moving gameplay locations. If a narrow viewport needs a different framing, retain clear access to every valid action.

Piers should extend beyond foliage and face a readable direction. Keep trees, roofs, and lighthouse details away from route junctions and waiting animals. Decorate around the route network. A decorative inlet must not resemble an actionable route unless the data permits travel there.

At a representative small landscape viewport such as 844 × 390 CSS pixels, users must identify the ferry, all three passengers, refuge, and actionable piers without zooming. Keep selection rings and destination labels clear of passengers. Increase invisible hit areas instead of enlarging every prop.

## Water, depth, and tide

Water is calm and stylized: broad color fields, quiet highlights, and sparse ripples. Prefer a simple water surface and authored shoreline shapes over fluid simulation. Use discrete tide states from the rules, with authored land exposure and waterlines for each state. The scene must clearly distinguish exposed sand, shallow passage, navigable water, and a flooded boarding point.

Represent increasing load with a modest, readable change in ferry draft. The hull settles; occupants stay correctly attached to the deck. This movement illustrates the model and never computes navigation validity.

Forecasts must display the actual next state. When the implemented interface offers a next-action or tide preview, use a thin shoreline contour, a clear pier waterline, and route emphasis to show its consequences. Pair this with a compact DOM explanation. Do not invent a separate forecast action or another rule. Color alone must not distinguish safe and unavailable routes.

## Light and motion

Use bright, warm late-afternoon light, soft shadows, and enough ambient fill to keep cabin sides and animals readable. This begins the captain's evening journey while preserving the reference's clear, inviting palette. Gentle contact shadows can anchor objects. Avoid hard black ambient occlusion, cinematic depth of field, intense bloom, and reflections that obscure depth cues. Future orchard and sanctuary lighting should not expand M1 scope.

Motion should reward a decision without making the player wait:

| Event | Suggested duration | Treatment |
| --- | --- | --- |
| Ferry journey | Path-length policy below | Gentle departure, steady cruise and calm arrival |
| Boarding, unloading or Wait | 520 ms; successful unloading 900 ms | Prompt transfer and a small visible delivery response |
| Draft adjustment | Final 550 ms, capped by action duration | Smooth vertical settling with attached occupants |
| Tide transition | Final 550 ms, capped by action duration | Waterline and shore contact finish with the action |
| Reduced-motion transition | 30 ms | Exact state feedback without decorative movement |

Use occasional head turns, ear movement, or subtle breathing for personality. Avoid constant synchronized bouncing. Animate a logical turn once; animation callbacks must not trigger additional simulation steps. Follow the technical plan's brief input lock during transitions. After a transition finishes or is cancelled, Undo must restore a coherent scene without stale effects or stranded models.

Honor reduced motion: disable bobbing and decorative loops, minimize travel and tide motion, and retain immediate state feedback. Keep the camera stable.

## Interface and M1 visual acceptance

The refinement gives Harbor a persistent, steady lens and soft glow, plus an objective-derived “Home” marker inside its existing map label. Passage status remains independent of the destination role. The visible delivery response strengthens that same light, then settles; Undo and Restart restore its ordinary baseline.

Selected hull surfaces and Harbor/vulnerable-pier piles use scoped materials that compare world-space height with the actual animated water level. Broad sandy, stony and subdued grass regions vary existing island vertex colors without changing silhouettes. Refined coastal shelves and connected sand/stone forms are decorative field samples, separate from authored passage depths. Native gameplay comparisons and any remaining visual limits are recorded in `reviews/refinement/REVIEW.md`.

Use restrained, keyboard-accessible DOM controls for actions, undo, restart, and state explanations. Provide visible focus, accessible names, and touch targets of at least **44 × 44 CSS pixels**. Canvas targets need equivalent keyboard-operable controls. Show passenger load and tide through the canonical state, not decorative counters.

M1 is visually complete when:

- The cove is rendered as coherent 3D scenery, with finished silhouettes and materials.
- The ferry, sheep, two rabbits, and lighthouse remain recognizable at mobile scale.
- Current and previewed depth, access, load, and occupancy agree with the rules.
- Every action is readable without camera manipulation or relying only on color.
- Turns, undo, restart, and completion leave no stranded models or stale effects.
- Mobile landscape, desktop, keyboard use, and reduced motion remain legible and usable.

Resolve these checks directly during implementation. Additional chapters, cinematic sequences, and large prop collections are outside this milestone.

## Shared environment milestone

The later task in `NEXT_TASK.md` refines the accepted Holding Pier and Bellwater compositions, with First Crossing retained as a playable regression case. Keep the ferry, residents, landmarks and named stops prominent. Calm open water, broad blue/teal fields and sparse irregular highlight groups replace the repeated fine diagonal pattern. Authored banks should feel connected to the coast rather than painted along a route centerline.

Use one gentle course for navigation dots and ferry travel. Selected and blocked emphasis retain exactly that course. Solid phone label leaders remain visually distinct from navigable dotted lines. Curve smoothing cannot imply a new junction, create a shortcut or skip a stop.

Across tides 0, 1 and 2, exposed shores give way to wet edges and visible submerged ground. Contact detail follows the rendered waterline and exposed rock, with no floating outline of a flooded island. Flooded boarding surfaces remain visibly submerged at the exact rule threshold. Keep the contact accents quiet and grouped, away from route-like dotted outlines.

Refine coast and rock silhouettes inside the existing clearance envelope. Group reeds and small details instead of increasing density. Preserve the fixed camera and framing. A short fading wake follows travel; one warm Harbor light response acknowledges delivery. Both effects reset on Undo, Restart and cancellation, and remain calm under reduced motion. Assess the result at native phone size and in actual movement before declaring visual acceptance.

## Luminous evening atmosphere

Retain the accepted miniature and warm readable land. Give open water a deeper blue-green field, a composed region of pearl-blue sky light and separate sea-glass coastal depth. The surface uses three compatible analytic normal layers; their connected moving reflections should remain calm at native phone scale. Selective irregular sand and rock forms belong beneath the reflection, with absorption increasing as the real waterline rises. Avoid milky coast halos, all-over glitter, route-shaped banks and a dark night treatment.

The existing Harbor lamp casts a small elongated broken amber reflection. Visible successful unloading briefly strengthens this existing warmth. Undo and cancellation restore the appropriate presentation. Reduced motion freezes normals, refraction and lapping while preserving static depth and sheen.

Actual short/long comparison selected `clamp(800 + 140 × canonical length, 1200, 2300)` milliseconds: approximately 1.34 seconds on Holding's short passage and 2.08 seconds on Bellwater's longest outer passage. The slower candidate added time without a clear readability gain in the captured environment. `src/scene/transitions.ts` owns this shipped policy. Approximately 19% of each end provides departure/arrival; the middle holds a steady distance rate. The canonical courses, docking clearance and exact endpoints remain unchanged. A soft wake spreads behind the stern for at most 720 ms and 1.8 world units. Hide the local transfer card during sailing; at rest exclude the full loaded ferry after viewport clamping.

The original instrumental cue “Between the lamps” is a continuous 75-second phrase at 64 BPM: open sustained harmony, a sparse motif, long rests, a slightly fuller middle and a quiet return. Air/water, a soft travel texture and a restrained visible-delivery response support it. Start from intentional activation, keep a live master mute available during transit, and never advance puzzle time through listening. Actual sonic judgment and capture availability belong in the atmosphere review.


## Harbor homecoming

After the visible final arrival, one restrained warm ivory/amber shaft sweeps from the lantern over the accepted 20-second authored turn. Keep a luminous glass source, softly dissolving silhouette and gradual distance falloff; the shaft must become transparent before its geometric far rim. Native phone comparison selected a clean cone proxy with no noise or extra shells. The weaker soft candidate was too faint in some phone orientations; the retained balance increases the body modestly without restoring the old triangular opacity floor.

The existing open cone uses smooth view-space normals and the orthographic camera's parallel direction for edge attenuation. Its front/back additive contribution shares a bounded intensity budget. Keep depth testing so the roof, rails and opaque foreground geometry occlude it; disable effect depth writes. Reuse the small source sprite, with additive warmth while won and its accepted ordinary treatment on reset. Preserve the shader tone-mapping/output conversion, scene exposure and Harbor water response. This is a lightweight scattering appearance proxy, with ordinary geometry-intersection limits, not full volumetric lighting.

The beam stays one decorative draw object excluded from picking and scene-fit bounds; the lighthouse itself stays fixed. Reduced motion keeps the light steady. The accepted cue and persistent quiet won mix retain their existing visible-arrival event. Judge the full sweep in the actual game at native phone size, including foreshortened and tower-occluded views, without a seam, ring, flare burst or hard surface edge. No bloom, shadow spotlight, rotating water decal or extra rendering pass is added. See the technique references and matched evidence in `reviews/lighthouse-light/`.

After canonical disembarkation, rabbits make one small staggered hop and sheep a grounded bob, settling within 1.3 seconds. A one-second orthographic push toward Harbor tries 9% magnification, clamping against the full lighthouse, ferry, passengers and actual compact ending card. At 320-pixel phone height the stable ordinary camera is retained. Reduced motion keeps canonical framing and poses; turning normal motion back on never replays the finite gesture.

The ending uses one short line and a two-column action group. Holding progresses to Bellwater; other coves offer the real cove chooser. Menu can return to the arrival. Shared Settings uses the same native dialog for Sound and Motion, with Follow device or Reduced and Back to its origin. The won composition hides map controls until Undo restores canonical framing and repositions them.
