# Last Ferry — Bellwater Cove

## Current task and working agreement

Continue on `m1-first-crossing` from the reviewed contextual-interface commit `e9c81d620df5fca0983965e80c348260fb3518e9`, preserving any newer user work. Follow AGENTS.md and the existing authorized Git workflow. PR #1 remains draft; main remains unchanged.

This is the current task after the contextual-interface pass. It explicitly advances beyond the original M1 stopping point. Complete the bounded fixes, one new authored cove, its modest environmental identity, and the verification/handoff described here. Do not stop after the first fix to request another task.

## Product decision

Keep Holding Pier as the introductory puzzle and preserve its solution. Build **Bellwater Cove**, a second main puzzle with a different planning problem, using the existing rules and controls.

The next larger milestone after Bellwater is a shared environment pass across the two main coves: water, shallows, shore contact, lighting and restrained arrival detail. Do not undertake that broader visual overhaul in this task. Bellwater still needs enough authored scenery to feel like a new place and explain its routes.

We are testing puzzle variety before adding another mechanic. Bellwater's difficulty and enjoyment are hypotheses for the user's playtest; neither its action count nor a solver proves them.

## A. Resolve the bounded responsive issue first

An independent review reproduced a local-action-card defect at intermediate landscape heights.

**Reproduction at 844 × 500:** open `/?cove=holding-pier`, let Moss ashore, then try to use the map's Sail to Shallows button. The stretched `#local-context` section covers the button and intercepts its pointer input. At 1024 × 600, the same card stretches into the forecast area.

**Cause:** compact landscape CSS applies through 600 px height, setting local context to bottom anchoring with no centering transform. `positionMap()` in `src/main.ts` switches to compact positioning only through 480 px, so it supplies desktop inline top/left values between 481 and 600 px. These rules conflict.

Use a consistent layout condition and clear stale inline positioning when compact layout owns the card. Keep the card at its intended content height and prevent overlap with route targets or forecast. A review-browser-only change from the JavaScript 480 px condition to 600 px restored the nine-action Holding Pier rescue at both sizes; this is a candidate direction, not a committed fix or a complete regression result.

Retain a focused regression that performs the real unloading and sailing actions at 844 × 500, checks local controls/forecast at 1024 × 600, and exercises a resize across the breakpoint. Preserve the existing 1440 × 900, 844 × 390 and 780 × 390 layouts and the baseline cove.

Before content work, run the relevant current interaction checks. The independent Linux/Chromium 141 review also encountered input/capture timeouts in the broad suite, whereas the contributor reported a full pass in Chromium 156. In particular, recheck rapid Confirm taps on the baseline phone boarding card and loss → Undo → safe boarding under reduced motion. Investigate any reproducible failure; do not weaken state assertions, add arbitrary sleeps or silently relabel the independent full run as passed. A timeout alone is not proof of a gameplay defect.

Repeated Confirm input must commit exactly one action and must not activate a newly exposed background control or open an unintended dialog. Check normal animation and reduced motion, recording input spacing so delayed automation is not misclassified as a rapid double tap. The independent no-recording follow-up passed both production rescues but timed out in all three longer contextual scenarios; it does not establish that recording was the cause or that the full browser suite passed.

## B. Author Bellwater's exact puzzle

Level ID: `bellwater`. Display title: **Bellwater Cove**.

The ferry starts empty at Harbor. Two rabbits, **Tansy** and **Lark**, wait at Low Pier. A sheep, **Bram**, waits at Bell Pier. Reuse the existing rabbit/sheep models. These are new neighbors, so the introductory passengers do not become inexplicably stranded again.

Use stable level-local passenger IDs. Add only the small amount of level-owned naming metadata needed for the new residents and locations; preserve Pip, Rue and Moss in the existing coves. Status, action labels, subset warnings, accessible names, forecasts and endings must use the active level's names.

### Rules retained

- Capacity 4. Each rabbit uses 1 slot; the sheep uses 2.
- Draft: empty = 1; load 1–2 = 2; load 3–4 = 3.
- Every accepted move across one edge, Board selection, Unload selection or Wait costs one action.
- Tide starts at 0, rises to 1 after action 4, then to 2 after action 8. It does not rise further.
- Route/basin depth is base depth plus tide. Equality supports the boat.
- A pier is dry when tide is strictly below its elevation.
- Apply the complete action, then advance the turn/tide and evaluate flooding. Arrival does not include boarding.
- Preserve free inspection, actual selected-subset previews, one-activation safe sailing, dangerous-action confirmation, passenger conservation and complete Undo.
- Win only after all three required passengers are delivered at Harbor. No new move cap, timer, score requirement or mandatory Wait.

### Nodes and piers

Every stopping basin has base depth 3.

| Stop | Pier elevation | Starting passengers / role |
| --- | ---: | --- |
| Harbor | 3 | Empty; safe delivery destination; ferry starts here |
| Shallows | None | Short-route waypoint |
| Low Pier | 1 | Tansy and Lark; boarding can complete on action 4 before the rise |
| West Buoy | None | Outer-route waypoint |
| East Buoy | None | Outer-route waypoint |
| Bell Pier | 2 | Bram; boarding can complete on action 8 before the rise |

### Connections

All six edges are bidirectional. These are the entire route graph; do not add a shortcut during geometry work.

| Edge | Base depth |
| --- | ---: |
| Harbor ↔ Shallows | 1 |
| Shallows ↔ Low Pier | 1 |
| Harbor ↔ West Buoy | 3 |
| West Buoy ↔ East Buoy | 3 |
| East Buoy ↔ Low Pier | 3 |
| Harbor ↔ Bell Pier | 2 |

The two-edge shallow route and three-edge deep route form a loop between Harbor and Low Pier. Bell Pier branches directly from Harbor. There are six stopping nodes, six edges and three islands.

### Intended discovery

The return route can differ from the outward route because the water changes. The player must also consider both pickup deadlines and the cost of delivering passengers when passing through Harbor. Communicate the rules and consequences clearly, while leaving the plan for the player to discover.

Do not add a walkthrough, recommended move, forced highlight sequence or compulsory Wait step. Keep the legitimate alternatives below.

## C. Implementation witnesses — keep these out of player-facing instructions

Two representative ten-action rescues:

| Action | Shallow outward / deep return | Deep outward / shallow return |
| ---: | --- | --- |
| 1 | Harbor → Shallows | Harbor → West Buoy |
| 2 | Shallows → Low Pier | West Buoy → East Buoy |
| 3 | Board both rabbits | East Buoy → Low Pier |
| 4 | Low Pier → East Buoy; tide rises | Board both rabbits; tide rises |
| 5 | East Buoy → West Buoy | Low Pier → Shallows |
| 6 | West Buoy → Harbor | Shallows → Harbor |
| 7 | Harbor → Bell Pier | Harbor → Bell Pier |
| 8 | Board Bram; tide rises after boarding | Board Bram; tide rises after boarding |
| 9 | Bell Pier → Harbor | Bell Pier → Harbor |
| 10 | Deliver everyone | Deliver everyone |

A third valid family takes the shallow route both ways. One Wait before the first shallow return step allows the tide to reach 1. Valid placements include Harbor before departure, Shallows, or Low Pier before or after boarding both rabbits. Boarding the two rabbits separately on actions 3 and 4 also works. Preserve both rabbit-selection orders and these valid alternatives. Longer harmless play after everyone is aboard remains legal.

Meaningful unsuccessful or blocked plans:

- Go to Bell Pier first: the rabbits cannot be boarded before the first rise.
- Use the deep outer route in both directions: reach Harbor on action 7, then Bell Pier on action 8, too late to board Bram.
- Deliver any rabbit before boarding Bram: the transfer consumes the remaining boarding window.
- At Low Pier on action 3 after boarding both rabbits, attempt the shallow return: current depth 1 cannot support draft 2. Inspection must explain the blockage freely; a future rise cannot validate the current move.

The rules prototype was evaluated with the exact checked-out production reducer at the reviewed commit. Complete legal-action reachability found 121 canonical states, shortest rescue 10, and eight shortest action sequences grouped into the route/timing families above. There were zero wins without shallow-route use, zero wins when first sailing toward Bell Pier, and zero wins with delivery before sheep boarding. Wins exist without Wait.

These are design checks, not evidence of a playable Bellwater implementation. Counts depend on canonicalization and should not become brittle UI gates. Preserve the actual witness behavior and constraints. The prototype's coordinates and inherited scenery were provisional; author and validate coherent production geometry rather than copying them.

## D. Make Bellwater a distinct place

Create a new inlet composition instead of repeating the current straight row of islands:

- A low sandy/reed-edged shore for the rabbits.
- A higher rocky pickup shore with a small recognizable bell landmark for Bram.
- The safe Harbor/lighthouse destination.
- A legible shallow channel and a visibly deeper outer route.
- A modest change in coast shape, local planting and light/palette, within the existing miniature style.

Use existing geometry/material techniques and reusable assets. The bell is a landmark, not a new gameplay system. Keep decorative routes, water highlights and scenery from implying connections or access that the level data does not provide.

Author island footprints, pier positions, camera framing and route waypoints together. Verify actual ferry clearance in both directions along every route. Do not change topology/depths or squeeze paths through land to fit existing decoration.

The current renderer hardcodes some lighthouse/house positions and special-cases existing pier IDs. Move only the necessary scenery anchors, names and layout settings into level-owned data or a small explicit scene configuration. Make the six-stop framing and label placement work in Bellwater while preserving both older coves. No generic level editor or broad rendering-framework rewrite is needed.

Retain the shared water implementation for this milestone, adding the authored shallow/shore treatment the new puzzle needs. The following shared environment milestone will address repetitive ripples, shoreline/water contact across tides and overall atmosphere across the two main coves.

## E. Provide a small playable sequence

Make Holding Pier the normal default/new-game entry now that it is the accepted introduction. Keep First Crossing available explicitly through its existing query route and Menu as the baseline cove.

On Holding Pier success, add an accessible **Next cove** action that opens Bellwater. Preserve terminal Undo/Restart. Add Bellwater to Menu and make `/?cove=bellwater` open it directly.

A brief transition line is enough: “Further along the coast, two piers still have their lights on.” Show the new cove title and fresh residents. Do not build a campaign map, unlock tree, save system or dialogue framework. Bellwater's completion should acknowledge that its neighbors are safe without pretending the whole game's story is finished.

Update baseline-specific tests to request `?cove=first-crossing` explicitly where necessary; keep their original gameplay assertions. Add a small test of default Holding Pier → success → Next cove → Bellwater initial state.

## F. Verification and handoff

Run build/typecheck and the relevant unit/browser checks against the actual implementation. At minimum establish:

1. The responsive fix restores actual mouse/touch actions and keeps local controls clear at 844 × 500 and 1024 × 600, including resizing. Existing desktop and 390 px-high layouts still work.
2. Holding Pier and First Crossing retain their rescues, input protection, free inspection, subset consequences and complete Undo. Resolve any reproduced baseline interaction failure before proceeding.
3. Bellwater's representative route families win through the real reducer. Its failed alternatives fail for the intended reasons; Wait is not compulsory.
4. An actual-UI Bellwater rescue works with mouse, natural keyboard and emulated touch. Check one valid route through production without debug controls.
5. Boarding on actions 4 and 8 is safe before the respective rise. Invalid shallow inspection costs no time. Subset previews identify the actual passenger left behind. Undo restores passengers, tide, boat, delivered state and outcome through both rises and terminal state.
6. All six destinations, passage highlights, local passenger actions and important warnings are legible at 1440 × 900, 844 × 390 and 780 × 390. Essential consequences and confirmation fit without clipping; retain 14 px essential text and 44 px targets.
7. Scene and ferry clearance checks use the new authored geometry, and level-specific naming/scenery does not break the older coves.
8. Default entry, Menu selection and the Next cove action load the intended level and reset state correctly.

Capture representative actual gameplay: new cove start, blocked shallow return, critical boarding at a rise, changed water/passenger state and completion. Include both phone widths for initial framing and the most constrained preview. Inspect images at native size. Keep an uninterrupted recording locally if supported; no external hosting is required.

Update the rule/level documentation, STATUS and a compact review report. Record exact source identity, actual commands/results, environment and remaining uncertainty. Do not treat reference-model results as actual UI evidence or claim fresh checks that were not rerun. Follow the existing normal push/draft-PR handoff workflow and report the final commit. Main stays unchanged.

Finish Bellwater before adding further levels or mechanics. The user will playtest it; the next direction after that is the planned shared environment pass.
