# Last Ferry — Sailing direction and water trails

## Disposition and active goal

The water-motion pass at `8b874adccfc1d65af569b81fade548f0368645b0` is functionally verified but **not visually accepted**. The user reports unnecessary rotation at stops and water effects that feel attached to particular points on the boat.

Correct both in one contained pass: the ferry should settle facing a direction justified by its journey or berth, and the visible waves it creates should spread through the water independently after release.

The previous brief requested a bow crescent and stern disturbance and carried forward the old endpoint behavior. This correction explicitly revises those art/presentation requirements. Preserve the useful bounded wake architecture and calmer timing.

## Source, live build and workflow

- Repository: https://github.com/EDLMGit/Lastferry
- Branch: `m1-first-crossing`; PR #1 remains draft; main remains unchanged.
- Implementation to refine: `8b874adccfc1d65af569b81fade548f0368645b0`.
- Last accepted and published game: `0ee7d685071179b82ec2a599fac2f818251d0e54`.
- Existing owner-private phone Site: https://last-ferry-playtest.abumech.chatgpt.site
- Last confirmed Site source: `273aa4a9900ca8a302b8708f356a2dc83dac7acd`.
- Independent fresh build/typecheck and 163/163 unit tests pass for 8b874ad. Contributor browser evidence supports 17 passes plus one corrected affected-case rerun, covering 18 distinct cases. These results do not establish perceptual acceptance.
- This review does not publish 8b874ad. Implement the correction, return a new handoff, then ChatGPT reviews and publishes the accepted result.

Read `AGENTS.md`, `docs/PROJECT_STATE.md`, this task, relevant art guidance, `reviews/water-motion/REVIEW.md`, `COMPARISON.md` and `SELECTED_FRAMES.md`. Preserve newer/unrelated work. This file is the active task and supersedes conflicting requirements in the completed wake brief and the old all-stops-broadside tests.

## Confirmed diagnosis

### Heading

`src/scene/motion.ts` blends toward the route tangent away from endpoints, then blends back to the same `fromAngle` near every destination. `World.sync()` assigns `Math.PI / 2` at every node. Together they return the ferry to the same orientation at piers, Shallows, Cut and buoys.

This policy predates the new wake. Normal arrival usually turns during the approach; it is not necessarily a one-frame completion snap. Removing only the sync assignment leaves the approach turn; changing only the approach blend leaves a completion reset.

The current path and browser tests intentionally enforce this old policy. Replace that artistic contract while retaining meaningful continuity and clearance checks.

### Water

The historical stern trail already stores world-space samples. Do not describe the whole wake as parented to the boat.

The bow crescent and complete stern ellipse are rebuilt from the live position/heading every frame in `wake.ts`. `finish()` records a time/strength but no release pose, so their docking fade is also hull-relative. It restores strength from the journey's peak, which can create another accent after deceleration.

The trail shader places bright crests in two fixed lateral bands. Breaking those bands with a distance sinusoid leaves a repeated paired-dash appearance. The selected phone frames support the impression of fixed accents and rails; local raw videos remain unavailable to the remote reviewer.

Navigation rings and dotted routes are separate accepted controls. Preserve their purpose and visibility.

## Priority 1 — Natural stopping and departure headings

### Free-water stops

Classify stops using the level's pier relationship, not the presence of a buoy prop. Cut, Shallows and buoys are free-water nodes.

- Arrive aligned with the final course tangent and retain that settled heading.
- Inspection, selection, Wait, Settings and other nonmove actions retain the settled heading.
- On the next movement, begin from that actual pose and turn toward the newly chosen course.
- An immediate reversal legitimately requires a maneuver. Use a brief, controlled low-speed turn or backing departure within the existing movement budget. Keep angular motion continuous and avoid prolonged sideways sliding.
- Choose the shortest angular change, with a deterministic tie for an exact 180-degree reversal. Keep angles unwrapped through sampling/emission so crossing ±π cannot create an unintended long rotation.

### Real piers

A berth can justify alignment. The current pier shafts run along world Z; the ferry stops 0.9 units seaward of their tips. The current safe broadside axis is world X, giving two candidate headings, +π/2 and -π/2.

Use the safe berth orientation nearest the incoming course, then make only the required final alignment during the approach. Derive/declare that policy from the actual berth geometry. Do not align the long hull with the pier shaft merely because it points toward land.

Validate both opposite berth headings and the full approach/departure rotation. Their safety is an implementation requirement, not assumed from the existing +π/2 tests. Preserve the current route centerlines and boat stopping positions; no route-graph redesign is requested.

Hold heading through boarding, unloading and Wait. Check the bridge-to-deck path on both boat sides: animals must reach their real deck anchors without crossing the cabin/railings or jumping during reparenting. Adjust local transfer presentation only as needed for the valid berth poses; keep contact timing, passenger conservation and action rules.

### One presentation pose contract

Implement a coherent plan with independent starting and destination headings. Sample it deterministically from progress, with an exact final pose; do not make rest orientation depend on the last frame delivered by the renderer.

Keep orientation in the presentation/controller layer, separate from puzzle rules. Preserve the visual heading through every completion and restoration path:

- Record pre-action presentation pose only when the action is accepted.
- Determine the intended final pose before animation can fail or be interrupted.
- Nonmove actions carry their prior heading.
- Undo restores the paired pre-action pose when gameplay Undo succeeds.
- Restart/cove changes clear presentation history and use a deterministic initial pose.
- Normal completion, hidden-tab settlement, Reduced interruption, recovery timeout and animation-error synchronization all resolve to the same planned final pose, with one unlock.
- Invalid actions and free inspection add no presentation-history entries.

A small presentation snapshot stack aligned with accepted transactions is suitable; no persistence subsystem or new gameplay state is required. If using a parallel stack, centralize its updates and verify its agreement with accepted Undo history. The target pose must survive fallback paths that call `world.sync(session.state)` without a successfully created transition.

## Priority 2 — Water that is left behind

Start by removing the complete travelling stern ellipse and substantially quieting the persistent bow outline. A small waterline contact while moving is reasonable; it should support the effect rather than dominate it.

Build the readable motion from a few broad, soft, open wave crests emitted as the ferry displaces water:

- Capture each release position, direction, birth time and strength in world space.
- After birth, its X/Z movement and shape depend on its own age and release data. Later hull translation or yaw must not drag it around.
- Let crests spread outward, relax and fade. Use the travelled curve and actual horizontal movement to choose their initial direction; the visible hull can determine a plausible birth location.
- Use gently varied lengths and breakup with stable per-release variation. Avoid a regularly spaced pair of bright dashed rails, closed ornaments and fine shimmer.
- Retain a restrained teal body and pearl/seafoam crests within the accepted palette. Judge width and contrast at native phone size.
- Idle bobbing, pure tide/draft changes and an in-place steering adjustment produce no travel wake. A controlled backing departure should be visually consistent with its movement direction.
- Keep existing released crests independent when another valid journey begins. Use bounded segment/event ownership, without connecting old and new positions with a strip.

Let residual travelling water supply the docking finish first. If a separate settling event improves the real phone view, snapshot its release pose and evolve it independently. Its intensity must flow continuously from recent movement; do not restart a conspicuous hull ornament using the trip's peak strength.

Normal action completion restores controls immediately while finite water tails finish. Undo, Restart, cove changes, discontinuous synchronization, hidden/recovered transitions and Reduced clear transient water state. Interrupted movement must not trigger a new docking flourish.

## Keep the current pace and accepted scene

Hold `clamp(1000 + 200 × path length, 1600, 3000) ms` for normal sailing during this correction. The reviewed examples are roughly 1.9 seconds for the short route and 2.8 seconds for the long one. This isolates direction and water behavior; no automatic further slowdown.

Fit necessary departure/berth steering within that action budget. Preserve the established easing where compatible, while allowing a narrow movement/heading profile adjustment to make the maneuver coherent. Boarding, unloading, Wait, the final tide phase, Reduced duration, recovery margin and audio event timing retain their accepted contracts.

Keep the luminous sea, shallow detail, Harbor reflection, new lighthouse light, homecoming camera/animals, interface and score. The rejected local-normal experiment need not be repeated. A full water/renderer rewrite or extra full-screen effect is not part of this correction.

## Architecture and performance

Reuse the fixed pool/preallocated mesh approach. Short-lived wave events can share bounded geometry and buffers. Tune the allocation to the chosen treatment and report the final cap; avoid per-wave meshes, per-frame materials/textures or another animation loop.

Retain the coast mask, depth testing, water-relative height, disabled depth writes and exclusion from picking/camera bounds. Released X/Z history remains independent while Y follows a tide rise. Inspect land/pier overlap and transparent overlap brightness.

Changing yaw can alter full-hull clearance even with an unchanged centerline. Use the production heading plan and actual reachable start headings for geometry checks, including both berth variants and reverse departures. Check the full ferry footprint, not only its center.

The existing camera envelope is radius-based. Inspect phone framing and passenger readability, but do not redesign the camera automatically.

Compare warmed baseline/candidate idle and active movement in the same viewport/DPR/renderer. Check bounded resource counts and a short frame-interval sample; investigate a demonstrated new regression. Keep the known SwiftShader limits separate from physical Android performance.

## Work order and visual decision

1. Capture the current arrival → rest → next-departure sequence at one free-water node and one real pier, including a reversal.
2. Correct heading ownership and restoration first. Finish both berth transfer checks.
3. Replace the fixed water accents/paired-rail treatment with released crests, using the corrected motion.
4. Watch the complete sequence at ordinary playback speed and native phone size. Choose one coherent treatment independently.
5. Run the focused checks below, update continuity and return the reviewable handoff.

This is a correction to an open milestone, not a new feature milestone. Do not ask the user to tune parameters or recruit additional playtesters.

## Focused verification and evidence

Run Node 24 production build/typecheck and the unit suite. Update the old all-stops-π/2 expectations intentionally; retain the safeguards they were covering.

Required behavioral checks:

- Free-water arrival retains its tangent through rest, inspection and Wait; the next move begins at the retained pose.
- Necessary reverse departure follows a continuous, deterministic angular plan and the same action budget.
- Both pier berth headings preserve full-hull/pier/land clearance and convincing boarding/unloading.
- Undo after a move, a nonmove, a tide rise and a winning unload restores the corresponding pose; an alternate next route still works.
- Normal, hidden, Reduced, recovery and error settlements agree on the intended end pose, with one action and one completion.
- A released water crest remains independent when the ferry subsequently turns or moves. Its world evolution, tide height, finite fade and cleanup remain correct.
- Immediate follow-up input, repeated crossings, resets and cove changes produce no extra lock, trail connector or resource growth.
- Accepted lighthouse/homecoming, transfer audio and victory-mix lifecycle remain coherent.

Use the real UI for one complete Holding rescue and the relevant Bellwater routes in both directions. Include a First Crossing smoke view. Use 1440×900, 844×390 and 780×390, plus a 780×320 layout/ending smoke check. Test a device-motion preference change during travel through accurately labeled media emulation; manual Settings can be checked at rest.

Evidence must show more than mid-crossing stills:

- A natural-speed clip of arrival → rest → onward departure at a free-water node.
- A return/reversal and an actual-pier approach/transfer/departure.
- A few closely spaced frames around stopping and the next turn; half-second sampling can miss the key transition.
- One clearly traceable released crest that continues independently as the boat changes pose.
- Restored pose after Undo, plus Reduced/cleanup evidence.
- Matched native before/after route/load/tide/camera views, with actual timing labels.

Retain uninterrupted originals locally/ignored by default and commit a compact selected sequence. State accurately which media the reviewer can access. Tests support lifecycle/geometry claims; moving visual evidence supports the chosen treatment.

## Completion, continuity and Git handoff

Create `reviews/sailing-direction-wake/REVIEW.md` with confirmed causes, chosen heading/berth policy, released-wave treatment, before/after evidence, source identity, exact commands/results, original failures and affected reruns, and device limitations. Describe finite fading separately from actual world-space release.

Update `docs/PROJECT_STATE.md`: lighthouse accepted/published; 8b874ad water pass needs this correction based on user feedback; current active task is this file; other future ideas remain queued. Keep the live game SHA at 0ee7d685 until publication is confirmed. Briefly update relevant art guidance and `STATUS.md`.

Commit/push the completed correction on `m1-first-crossing`, update existing PR #1 while retaining draft status, and leave main unchanged. No merge, force-push or automatic Site publication.

Return the full final SHA, remote equality, working-tree/PR state, concrete visual decision, fresh versus reused checks, accessible evidence and remaining limits. Publication follows ChatGPT review of that new SHA.

## Source references for the diagnosis

- [Current heading sampler](https://github.com/EDLMGit/Lastferry/blob/8b874adccfc1d65af569b81fade548f0368645b0/src/scene/motion.ts)
- [World synchronization and transition lifecycle](https://github.com/EDLMGit/Lastferry/blob/8b874adccfc1d65af569b81fade548f0368645b0/src/scene/world.ts)
- [Wake history, live contacts and docking fade](https://github.com/EDLMGit/Lastferry/blob/8b874adccfc1d65af569b81fade548f0368645b0/src/scene/wake.ts)
- [Current path/heading tests](https://github.com/EDLMGit/Lastferry/blob/8b874adccfc1d65af569b81fade548f0368645b0/tests/unit/paths.test.ts)
- [Ferry clearance tests](https://github.com/EDLMGit/Lastferry/blob/8b874adccfc1d65af569b81fade548f0368645b0/tests/unit/clearance.test.ts)
- [Contributor review](https://github.com/EDLMGit/Lastferry/blob/8b874adccfc1d65af569b81fade548f0368645b0/reviews/water-motion/REVIEW.md)

## Kickoff prompt

Implement NEXT_TASK_SAILING_DIRECTION_AND_WAKE.md at the repository root as the current task. Read AGENTS.md and docs/PROJECT_STATE.md first.

Refine 8b874adccfc1d65af569b81fade548f0368645b0 on m1-first-crossing, preserving newer/unrelated work. The prior water pass is not visually accepted. Fix the universal stop-heading behavior and replace the conspicuous hull-following water accents with independently released crests as specified in the task.

Finish the heading, berth/transfer, Undo/recovery and wave-release work together. Keep the current sailing timing and accepted puzzles, audio, UI, water palette and lighthouse. Make routine implementation decisions independently.

Complete the task's focused checks and natural-speed phone comparisons, commit/push, and update PR #1 while keeping it draft. Leave main unchanged. Return the exact final SHA and review handoff. Publication follows ChatGPT review.

