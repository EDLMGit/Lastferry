# Last Ferry — Boat wake and water response

## Active task

Make the ferry's movement through the water a satisfying part of playing Last Ferry. The user wants a more noticeable wake, meaningful slow travel and captivating water interaction.

Deliver one coherent departure → crossing → docking treatment, judged in the actual game at native phone size. The ferry should feel as though it gently parts and disturbs the water. Preserve the calm coastal miniature, luminous teal sea and readable puzzle.

This is the next active implementation task. The lighthouse refinement is accepted. Local Codex implements; ChatGPT reviews the handoff and publishes the reviewed result to the existing private phone Site.

## Baseline and continuity

- Repository: https://github.com/EDLMGit/Lastferry
- Branch: `m1-first-crossing`; PR #1 stays draft; main stays unchanged.
- Reviewed game SHA: `0ee7d685071179b82ec2a599fac2f818251d0e54`.
- The same game SHA was published successfully on 2026-10-23 to https://last-ferry-playtest.abumech.chatgpt.site.
- Published Site source SHA: `273aa4a9900ca8a302b8708f356a2dc83dac7acd`. This includes hosting metadata and differs from the game SHA.
- Independent review passed production build/typecheck and 156/156 unit tests; the contributor's 12 focused browser passes and committed images were audited. No physical Android/native-GPU result is implied.
- The repository's existing project-state/deployment text predates that publication. Correct its reviewed/live baseline using the confirmed values above, then keep the next implementation SHA separate from the live SHA.

Read `AGENTS.md`, `docs/PROJECT_STATE.md`, this task, `docs/ART_DIRECTION.md`, and the relevant scene/test code before editing. Preserve newer or unrelated work if the checkout has advanced; do not reset to the baseline. This task supersedes the completed lighthouse task's restriction against changing wake/water interaction or sailing timing.

## What the current source establishes

| Area | Current implementation |
| --- | --- |
| Wake | One preallocated, world-space ribbon in `src/scene/effects.ts`, emitted from a stern offset. |
| Visibility | Flat muted green; peak vertex alpha 0.16 before lateral feathering. |
| History | Samples expire after 720 ms; maximum 31 points and 1.8 world units. Sampling occurs after more than 0.045 units of displacement. |
| Width | Approximately 0.11 units at birth, widening toward 0.51 before expiry. |
| Water response | `CoastalWater` already provides analytic surface normals, submerged detail, pearl sheen and Harbor reflection. It receives no boat-position/speed interaction. |
| Travel timing | Active `restrainedTiming`: clamp(800 + 140 × canonical path length, 1200, 2300) milliseconds. The exported `slowerTiming` preset is not active. |
| Easing | `journeyProgress` already supplies gentle departure/deceleration. |
| Reduced motion | Moves settle in 30 ms; wake emission/history are suppressed. |

Source-grounded diagnosis: the age, sample-count and distance limits together keep the wake short, particularly at low speed. Its uniform color gives little sense of displaced water. Increasing one opacity or length constant alone will not deliver the requested experience.

Inspect `src/scene/effects.ts`, `water.ts`, `water-shader.ts`, `world.ts`, `motion.ts`, `transitions.ts` and `paths.ts`. The implementation may be refactored locally where that makes ownership and lifecycle clearer.

## Visual direction

### Departure: establish water contact

As horizontal movement begins, introduce a small soft bow crescent and a compact stern disturbance. Let their strength grow with actual movement. They should emerge from the visible hull at the waterline, including when the ferry is loaded.

Use pearl/seafoam highlights and a restrained teal body. Keep the yellow ferry the focal point. The effect should feel gentle and substantial.

### Crossing: leave a readable, curved trail

Create a continuous wake that follows the actual travelled course. Start with softly diverging, broken pearl crests and a subtle central water disturbance. Older sections spread and dissolve in place as the ferry moves onward.

Aim initially for roughly one to two visible hull lengths during sustained slow travel. This is an art target, not a physics rule. Tune lifetime, distance sampling, history capacity, width and contrast together. A roughly 1.5–2-second visual memory is a useful first trial; select the result from moving phone comparisons.

Give the crests a little broad variation so they read as rippled water. Keep their rhythm slow and their edges soft. Avoid an opaque stripe, razor-thin zigzags, fine glitter or a trail that resembles a high-speed motorboat.

On curves, old wake must remain behind in world space. Smooth joins and bounded width must prevent triangular spikes, gaps and doubled brightness at overlapping segments. The same treatment must work in reverse travel.

### Water interaction: let the existing surface respond

Add a localized response around the travelling hull so the established sheen and shallow detail react subtly to its passage. A small normal perturbation is the preferred first experiment: it can bend/break existing highlights without raising the whole sea or changing the accepted palette.

Evaluate this alongside the shaped trail. Keep it only when the difference is visible at native phone size and its cost is proportionate. The final result needs convincing contact and movement; it does not need every possible layer.

Keep distant water, coastline appearance, substrate readability and Harbor reflection consistent with the accepted baseline. Preserve the route dots and destination markers as clear navigation cues.

### Docking: allow the water to settle

Ease new emission down with deceleration. Let the remaining wake broaden and fade naturally after the ferry stops. A small outward settling ripple can finish the arrival if it improves the sequence; use a finite effect with a clear lifetime.

Restore interaction as soon as the existing action presentation completes. The visual tail must not extend the busy lock. A stationary ferry must not continuously produce travel wake.

## Sailing pace

The user has authorized a calmer travel presentation. Compare the current timing with one slower candidate that gives a representative short Holding Pier route about 1.8 seconds and the long Bellwater outer route about 2.8 seconds. Ordinary move bounds around 1.6–3.0 seconds are a useful starting range. These are proposed tuning targets, not measured final durations.

Watch a short Holding Pier route and a long curved Bellwater route, including repeated trips. Choose the pace that gives the bow, trailing ripples and arrival room to read while keeping the puzzle pleasant to operate. Record actual before/after durations for those routes. These are tuning suggestions, not a requirement to stretch every route to the maximum.

Keep the existing easing unless a demonstrated problem requires a narrow adjustment. Do not add a separate cinematic pause. Preserve:

- The same deterministic action count, outcomes, tide deadlines and route geometry.
- Existing loading/unloading and victory timing, including transfer sound contacts.
- The 30 ms Reduced behavior.
- The final tide-settling phase and recovery timeout derived from the same transition plan. The current plan uses at most 550 ms for tide settling and duration + 1000 ms for recovery.

## Implementation approach and performance

Extend the existing bounded effect architecture first.

1. Use travelled distance and actual horizontal speed to govern emission and strength. Tide elevation, draft changes, idle bobbing and a reset/teleport must not create movement wake.
2. Keep the visible bow/stern anchors aligned with the actual hull pose. Derive trailing direction from real travel where needed; verify near-dock heading changes, rather than assuming the boat's angle always equals the course tangent.
3. Maintain a fixed-capacity sampled history and preallocated geometry. Choose sample spacing/capacity to support the intended trail at the slowest sustained speed. Use smooth joined tangents or equivalent resampling. Reuse temporary vectors/buffers in the frame loop.
4. Keep a small constant-size input for any water-shader interaction: boat position, direction, speed/envelope and, if needed, one bounded settling event. Avoid a per-fragment loop over the full wake history across the whole water surface. Historical trail detail belongs in bounded geometry or another demonstrably economical local treatment.
5. Reuse the installed Three.js/WebGL renderer, render loop and color-management path. Keep effects water-height aware, depth-tested, clear of z-fighting and correctly occluded by hull, docks and land. Prevent expanding crests from visibly painting dry islands.
6. Exclude decorative geometry from picking and camera-fit bounds. Keep resource ownership/disposal explicit. A small bounded extra layer is acceptable if a real comparison justifies it; measure its cost.

A full fluid simulation, new render-target pipeline, engine upgrade, full-screen bloom or global water redesign is outside this task. The objective is the ferry's local interaction with the accepted sea.

Compare warmed baseline and candidate in the same environment at the same viewport, device-pixel ratio and quality. Inspect both idle and active crossing frames, resource/draw counts and a short frame-interval sample. Recheck a suspected regression once under matched conditions; simplify the effect if a repeatable regression is attributable to it. Software rendering does not establish real Android performance. No new benchmark framework is needed.

## Lifecycle requirements

This task changes transient presentation, so exercise these boundaries carefully:

- Natural move completion currently calls `sync(after, true)`. Preserve a finite trailing fade across completion and allow the next action immediately.
- Starting another move must not connect old and new emission with a long artificial strip, especially after the docking heading resets. Separate trail segments or handle continuity explicitly within the fixed budget.
- Undo, Restart, cove changes and discontinuous synchronization clear all movement history, interaction uniforms and pending settling events immediately. Cancellation/recovery synchronizes to the committed after-state, clears those transients, releases the lock exactly once and stops travel audio. It must not schedule a new docking ripple. Only normal completion retains the finite visual tail.
- Hiding/recovering the page must not synthesize unobserved travel. Preserve the existing settlement behavior and handle large time gaps.
- Reduced motion suppresses new wake/ripple/boat-normal animation and clears active decorative motion, including when selected mid-crossing. Returning to Follow device begins from the current pose without replaying history.
- A tide rise moves the effects with the water surface. It must not create extra samples merely because vertical position changed.
- Selecting/inspecting destinations, waiting, loading and unloading do not masquerade as sailing. A finite residual wake from the previous real crossing may finish fading.
- Arrival audio, quieter won-state music, lighthouse sweep, animal acknowledgment, fit-checked arrival camera, completion controls and Settings retain their accepted triggers and behavior.

Keep general game state separate from effect history. Preserve the puzzles, subsets, complete Undo, focus, touch controls, music and all other accepted audio. Do not add a wake settings page or new player controls.

## Work and decision process

1. Record a concise baseline of an actual short route and a longer curved route at phone size. Note duration, load, tide, direction and viewport.
2. Implement the shaped wake and local hull contact at existing timing. Tune in motion at native size.
3. Evaluate the localized water-response candidate and slower timing. Select and finish one coherent combination.
4. Check departure, cruise, turn, deceleration, residual fade and the next action as a continuous sequence. Inspect shallow and deeper water and both course directions.
5. Complete the focused lifecycle checks, record the visual decision and update continuity.

Do not ask the user to choose shader constants or recruit testers. If a rendering/capture capability is unavailable, state the limitation and supply reproducible steps; do not replace visual evidence with test counts.

## Focused verification

Run Node 24 production build/typecheck and the unit suite. Add or adjust targeted tests for changed behavior only: bounded history/resources, stationary/tide/reset suppression, frame-rate-independent progression, fade/clear behavior, and any timing contract that changes.

Existing environment browser checks encode old artistic limits such as 31 points, 720 ms, 1.8 units and an alpha ceiling. Update obsolete tuning assertions intentionally to the selected bounded design. Retain meaningful checks for stern provenance, water-relative height, reverse paths, finite values, cleanup and correct game state. Passing the old numbers would not prove the new wake is visible.

Wake and lighthouse currently share CrossingEffects. Include the existing focused lighthouse/homecoming checks when modifying that class; preserve the accepted light shader and arrival state behavior.

Use actual UI flows for:

- One complete Holding Pier rescue with subset transfers, a tide-boundary Undo, redelivery and the accepted ending.
- One long curved Bellwater crossing in each direction, including the heavier load/shallow-water conditions already supported by the puzzle.
- A First Crossing smoke view to catch layout assumptions.
- Rapid valid follow-up input after docking; no duplicate action, extra delay or stale trail.
- Undo/Restart/cove change and hide/recovery. Exercise a mid-crossing device reduced-motion change under Follow device, using accurately labeled media emulation if needed. Test choosing Reduced in Settings separately at rest; keep the existing busy lock and controls unchanged. Label simulated lifecycle events accurately.

Inspect 1440×900, 844×390 and 780×390; include a 780×320 smoke check for the existing short-screen layout and ending. Verify wake visibility at native phone size before using a crop.

Capture uninterrupted normal-speed before/after short and curved crossings, with the full interface visible and at least two seconds after docking. Retain one natural in-game sequence showing tide/Undo cleanup and one Reduced result. Comparison stills should use the same route, load, tide, camera and normalized journey progress; explicitly distinguish phase-matched stills from real-time recordings when duration changes. Do not slow down exported footage to sell the effect.

Use the existing evidence tooling. Keep raw media local/ignored by default, commit a compact selected frame sequence and accessible review index, and say which recordings the reviewer can actually access.

## Acceptance and handoff

The pass is ready when:

- The wake is clearly visible during ordinary phone play and follows the ferry through curves.
- Bow contact and wake feel coherent with the existing surface at the chosen calm pace; any retained local shader response supports that treatment.
- Docking leaves a finite, soft settling tail while controls become available normally.
- Navigation, submerged terrain, tide readability and accepted arrival remain clear.
- No false wake, discontinuity, resource growth, changed puzzle result or attributable unresolved performance regression is demonstrated in the exercised checks.

Create `reviews/water-motion/REVIEW.md` with the chosen visual treatment, actual timing decision, source references, concise before/after media index, exact tested source identity, commands/results, original failures and affected reruns, and device/rendering limits. Keep new versus reused evidence explicit.

Update `docs/PROJECT_STATE.md`: lighthouse light accepted and published; boat wake/water response is the current task; unspecified future feedback remains queued. Briefly update art guidance and `STATUS.md`.

Commit/push the completed pass to `m1-first-crossing` and update existing draft PR #1. Preserve main; no merge or force-push. Return full SHA, remote equality, checkout status, chosen timing/effects, checks, accessible screenshots/recording paths and limitations. State that the new pass awaits ChatGPT review and separate publication to the same private Site; pushing GitHub does not update the phone build.

## Primary references

These inform the proposed implementation; they do not establish that this particular game will meet a device-performance target. Use installed-version APIs.

- [Three.js — How to update Things](https://threejs.org/manual/pages/how-to-update-things.html): preallocate attribute buffers, update their contents and draw only the active range.
- [Mark Finch / Cyan Worlds — Effective Water Simulation from Physical Models, GPU Gems](https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-1-effective-water-simulation-physical-models): analytic surface normals and local moving disturbances. Adapting those principles inside Last Ferry's existing shader is our implementation proposal; the chapter's full rendering pipeline is not required.
- [Unity Technical Content Team — The HDRP water system in Unity 2022 LTS](https://discussions.unity.com/t/the-hdrp-water-system-in-unity-2022-lts/359727): conceptual separation of bow/surface deformation and local foam. Borrow the visual distinction, not Unity packages.
- [Mozilla — WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices): bounded resource budgets, draw batching and avoiding unnecessary fragment work.

## Kickoff prompt

Implement the task in NEXT_TASK_WATER_MOTION.md at the repository root. Read AGENTS.md and docs/PROJECT_STATE.md first, then use NEXT_TASK_WATER_MOTION.md as the active scope. Start from the current m1-first-crossing checkout; the reviewed baseline is 0ee7d685071179b82ec2a599fac2f818251d0e54. Preserve newer/unrelated work.

Deliver the more readable curved wake, convincing hull/water contact and finite docking fade, and compare a modestly slower crossing pace in the actual game. Complete the task's phone-size moving comparisons and focused verification. Preserve accepted gameplay, UI, audio and lighthouse behavior.

Make routine implementation/art decisions independently. Commit and push the completed pass to m1-first-crossing, update PR #1 while keeping it draft, and leave main unchanged. Return the exact SHA and review handoff described in the task. Publication follows ChatGPT review.

