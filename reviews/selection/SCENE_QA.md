# Scene presentation review

The scene changes preserve the accepted water, contact materials, canonical courses, timing and passenger deck anchors. Holding's Stone island now uses the existing rocky style; Harbor remains a sheltered garden and Rabbit Pier retains its cottage. Bellwater's reeds and bell shore are unchanged.

## Selection and framing

Terrain, shore rocks, grouped island decoration, piers and landmarks are registered against authored pier island/node identities. A gesture raycasts this bounded set; water, glow and shadow are excluded. The ferry uses its current projected bounds, and named waypoints retain a 44-pixel picking diameter. First Crossing's unmapped central rock is explicitly noninteractive rather than assigned to a nearby destination. Ray-hit diagnostics distinguish island, pier, landmark, waypoint and ferry; the visible interface uses the same node identity.

Selected-place emphasis is independent of the current location and temporary focus/hover emphasis. A remote or current place can retain its selected dock ring. Only a real adjacent edge receives passage emphasis; no remote route is invented.

The stable fit caches static geometry and the complete canonical-path envelope at construction. Loaded ferry bounds are derived from the actual hull meshes and all passenger meshes at their deck anchors, with authored maximum tide, visual draft and bob range. Resize projects those cached points. Selection, travel and tide do not recompute the camera. The fit first uses available horizontal translation to clear the bottom-right forecast before reducing scale, preserving the HUD and viewport margins. The canvas extends beneath the interface; its actual CSS and buffer dimensions are exposed separately.

## Native comparisons

Before editing, the accepted Holding desktop and Bellwater 844×390 ordinary captures in `reviews/refinement/after/` were inspected at original size. The old phone cove was small and the lantern read mainly as a pale band under its roof.

Two exploratory capture sessions remain local and separately attributed:

- `raw/initial-visual/manifest.json`: 27 actual live-game screenshots, all six Holding/Bellwater desktop/phone contexts and current/safe/remote/blocked selections. Zero console/page errors; recorded source files remained unchanged. Native inspection found a long current-location leader and a fit that shrank the phone scene around the forecast despite unused left space.
- `raw/translation-visual/manifest.json`: 18 phone views at 844×390 and 780×390, zero errors and unchanged source. Native inspection selected the horizontal-translation fit: the complete projected envelope grew from 370 to 532 pixels wide for Holding at 844, and from 312 to 461 for Bellwater. At 780 it grew from 359 to 472 and from 303 to 440. All captured card-placement diagnostics reported zero protected overlaps. The compact current, blocked and remote cards remained clear of passengers and defining landmarks. A remaining hint/selector overlap and redundant last route line were reported to the interface owner.

The second session preceded the final correction from a guessed ferry radius to derived loaded-mesh bounds. Its images are exploratory evidence, not relabeled final captures. Final-source screenshots and verification are recorded separately in this review directory.

## Lantern

The lamp anchor is now immediately in front of the visible lantern instead of inside an opaque cylinder. A pale compact core sits within a warmer amber source, with dark supports and a slightly more open roof. The glow keeps ordinary depth testing, so roof/tower occlusion remains real. The existing light has a local range; cloned gallery, upper-tower and roof materials provide restrained nearby warmth without changing shared house or cabin materials. Water reflection still derives from the same explicit anchor, with the accepted shader and extent preserved.

The permanent model emissive baseline is recorded by the effect instance. Reset restores that baseline; visible delivery adds its existing transient response, and cancellation/recovery settles without replay. The actual ordinary muted phone images show the lantern clearly before any selection. No bloom, beam, new shadow-casting light or extra scene pass was added. A focused regression checks scoped materials and retained normal occlusion; visual approval depends on native gameplay inspection rather than those values.

## Final native review

**Selected final presentation accepted for playtest; no further visual changes requested.** All **22 final PNGs** under `after/`, the **four selected baseline PNGs** under `before/`, and both additional 780×390 critical-boarding/after-rise PNGs under `phone-critical/` were individually inspected at original size. Final capture runtime is `60617c88dec76b6232459953785cdb27890138cbbb33a9333a2ec05eb076c4d9`; `after/source-manifest.json` records its frozen source, and `phone-critical/capture-manifest.json` retains the separate test-source attribution for the same runtime. Baseline reuse remains attributed through `before/source-reuse-audit.json`.

- The ordinary overview has visible place names and modest markers without repeated action tiles. Stone's sparser, stony island reads differently from Harbor's garden and Rabbit Pier's cottage. The complete lighthouse, bell, waiting animals, route endpoints and loaded ferry remain clear in the inspected desktop and phone states.
- The final deep-teal `.66` card surface keeps text, borders and controls readable while allowing the underlying water tones to remain perceptible. Current, safe, shallow and remote cards show their relevant facts without the earlier clipped redundant route line. The explicit Sail control, disabled shallow state, named passenger actions and Close control remain distinct. The subset modal's stronger backing is appropriate; the selected passengers, resulting boat depth, flood consequence and Confirm remain readable.
- Distant cards now use paired short endpoint stubs and matching selected borders. They no longer draw a continuous line across intermediate stops that could resemble a fictional passage. Nearby short connectors remain easy to associate with their card. Remote selection retains its identity without inventing an adjacent route.
- At both 844×390 and 780×390, all six Bellwater stops remain identifiable with cards open or closed. Cards and forecast remain inside the viewport and clear of the loaded ferry and landmark silhouettes. The critical Holding phone preview states that both rabbits board before the rise; after-rise facts show them safe aboard and explain why transfers are unavailable at the flooded pier.
- The ordinary muted lantern has a visible pale core, amber surround and darker supporting structure; the source reads before selection and stays secondary to the ferry. Warm upper-tower/gallery detail and the local reflection remain coherent. Delivery and terminal-Undo images retain the light's identity; Undo returns the playing appearance and clears the contextual card. The screenshots do not isolate a transient intensity peak or establish exactly-once timing; the separate behavioral checks cover that lifecycle.

All **12 already-extracted original-resolution video frames** under `after/raw/decoded/` were also inspected: Holding at 5, 16, 24, 31, 39 and 46 seconds; Bellwater at 3, 12, 19, 25, 30 and 34 seconds. They depict ordinary planning, free inspection, a clear sailing ferry with its card hidden, boarding/tide aftermath, local options on arrival, loaded Harbor and successful delivery. The cove framing stays consistent between these depicted states, and both final success cards leave the ferry and delivered animals clear.

These are native still/ordered-frame observations, not a claim of physical-device playback smoothness or audible review. Source and input tests, complete stream decode results, performance measurements and media limitations remain separately recorded. No runtime edits or additional GPU/browser work were performed during this final image review.
