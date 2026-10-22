# Luminous evening cove

`NEXT_TASK.md` owns the current atmosphere scope. Holding Pier, Bellwater and First Crossing retain their accepted compositions, canonical courses, stops, elevations, rules and complete Undo. The earlier course/shore implementation remains attributed to `reviews/environment/REVIEW.md`; fresh atmosphere evidence belongs to `reviews/atmosphere/REVIEW.md`.

## Water and light

Deep blue-green open water surrounds a composed pearl-blue reflected-sky region. Three low-amplitude analytic normal layers move its connected streaks; the shader receives the scene's actual sky/sun colors and direction. Its view vector is the constant orthographic world direction. The existing Harbor lamp contributes a secondary elongated broken amber reflection, gently strengthened at visible delivery and restored on Undo/cancellation.

The retained 256×256 coast mask describes shore/bank relationships. Its nearby-land elevation channel is not seabed height. A separate 256×256 linear albedo/height field supplies a continuous coastal apron, selected irregular sand/rock forms and formerly dry submerged ground. The shader estimates the bottom along the view ray, weakens distortion at land contact and applies depth absorption with the real animated water height. Substrate and sheen strengths are independent. Decorative depth never changes authored navigation depths or paints a route-center stripe.

One bounded material draws the water. Two local RGBA data fields total 524,288 bytes; no reflection render target, full-scene extra pass or external asset is added. Linear palette/data treatment and the installed tone/output conversion chunks are applied deliberately once. Owned resources are disposed on page teardown. Actual-phone performance remains unverified.

## Journeys and clear silhouettes

The cached canonical course still drives dots, emphasis, distance-sampled ferry motion, continuous heading and full-ferry clearance. Only time-to-distance mapping changes: gentle symmetric 19% departure/arrival ramps with a steady middle. Exact endpoints, reverse courses and docking clearance remain intact. The review records actual short/long comparisons and the selected policy from `src/scene/transitions.ts`.

One plan supplies animation and duration-plus-1,000ms recovery. Tide and coincident draft settle in a separate phase capped at 550ms, finishing no later than the action. Transfers/Wait remain prompt. Completion, cancellation, visibility reconciliation, error and recovery synchronize committed state and release the lock exactly once. No input queues a second action.

During travel the local passenger card is hidden and a compact “Sailing to …” status remains. At rest card placement checks the projected full ferry and aboard passengers after viewport clamping, plus map/HUD/forecast obstacles, then tries alternate positions or a compact card. Controls retain accessible focus and touch areas.

A softly feathered wake follows the actual stern, widens with age and is bounded to 720ms, 1.8 world units and 31 samples. It stops emitting at arrival and clears on reconciliation/Undo/Restart. Reduced motion keeps 30ms transitions, freezes normal/refraction/lapping time and suppresses wake; static depth and sheen remain.

## Shallow detail, contact and home

The shallow-detail refinement retains two 256² RGBA fields and one water draw. Coastal width now varies with island form and sheltered pockets; compact coast-connected sand tongues and angular stone forms replace repeated soft oval patches. Broad material variation is baked into the existing albedo field. Precomputed contour segments, squared-distance rejection and bounded patch tests reduce CPU field setup; fields remain immutable through rendering, preview and Undo. There is no reflection target or additional scene pass.

The ferry's two lower hull surfaces and selected Harbor/vulnerable-pier piles clone their materials and use actual world height against the shared animated water uniform. The narrow contact treatment follows draft, bobbing, tide and Undo without affecting cabin/house materials. Existing island vertices carry broad sand, stone and grass regions; silhouettes and geometry counts remain intact.

The lighthouse model exposes its lens, existing lamp and anchor explicitly. Glow and water reflection share that world anchor. Action reset restores the steady home light; delivery adds its transient response, while terminal Undo restores the playing baseline. The map Home role comes from the level delivery objective and retains current/adjacent/blocked/remote statuses.

## Sound and free thought

“Between the lamps” is an original 75-second phrase at 64 BPM. Ten authored open harmonies, 21 sparse motif notes, long rests and a fuller middle return quietly. Reusable air/water and reverb buffers support small synthesized voices. Travel texture follows visible movement; delivery responds during visible unloading. There is no connection between music phase and puzzle turns.

The refinement retains one sparse companion proposal that follows committed occupied-pier deadlines and homeward passenger safety. It preserves the accepted score, phrase and sound palette; terminal responses wait for visible consequences. [Audio notes](AUDIO.md) describe all five arrangements, shared harmony-tail pitches, latest-target scheduling and resource bounds. Listening is separate from lifecycle/signal checks and remains explicitly pending in the actual-runtime evidence report.

Intentional activation respects persisted mute. One AudioContext-time scheduler and owned sources keep the graph bounded. Music, ambience and action effects pass through a live master mute, including scheduled tails. Undo/Restart preserve the base phrase and clear action effects. Hide/interruption suspends scheduling without backlog; teardown releases resources. A compact Sound control stays reachable in transit. Availability, actual-runtime audio evidence and any listening limitation are stated in the review.

## Verification boundary

The selection pass extends the canvas behind the existing HUD/forecast and uses stable authored scene/passage framing. This intentionally increases rendered pixels; matched review measurements record viewport, CSS canvas and drawing-buffer resolution. Compare those fresh baseline/final pairs separately from the older per-frame diagnostic sampler. Local lantern/core/receiver changes add bounded geometry/material work while the accepted water shader, fields, reflection extent, musical clock and sailing timings stay unchanged. Free selection changes only presentation, and no additional scene pass or expensive panel backdrop filter is used.

The selection comparison adds23.3% desktop pixels and51.2% phone pixels. Its no-video SwiftShader desktop p95 is worse, while both phone samples retain16.7ms median/33.4ms p95. A one-off baseline-sized canvas diagnostic has mixed desktop tails, so it does not isolate a lantern or coverage cause. No native-GPU performance claim follows; see `reviews/selection/RENDERER_QA.md` and its exact timestamp records.

Unit checks cover canonical routes/clearance, timing progression and bounded recovery/tide phases, post-clamp placement, explicit seabed/depth/color resources and audio lifecycle. The existing reducer witnesses, losses, subsets, conservation and complete Undo remain required.

Actual interface checks cover all three rescues, loaded travel in both directions, both rises/Undo, terminal Undo, named inspection, keyboard and emulated touch, reduced motion, visibility recovery, rapid Confirm and docked Harbor placement at 1440×900, 844×390 and 780×390. Production play must work without development controls or external assets.

Matched source-attributed images, original-speed crossings/idle water and an actual-runtime full-phrase audio sample support review. Native still/temporal inspection and live audio behavior are reported separately from listening judgment. Before/after draw calls, triangles and 120-frame intervals use the same software renderer and viewport. They establish no physical-device frame-rate guarantee.

Current selection results, source identities, captures and limitations are in `reviews/selection/REVIEW.md`. The prior shallow/contact/audio result stays in `reviews/refinement/REVIEW.md`: its field construction improved while Holding's idle p95 remained higher. No overall smoothness improvement is claimed; historical evidence retains its original source.
