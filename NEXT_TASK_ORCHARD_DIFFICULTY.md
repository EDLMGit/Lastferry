# ORCHARD_DIFFICULTY_01 — strengthen the existing seventh-cove candidate

> **Completed and accepted · 14 November 2026.** Implementation `9933303178da04cac93ddc820ef55e181286d983` passed the scoped independent review and the player reports that it feels good. The current assignment is root [NEXT_TASK_THREE_LANTERNS.md](NEXT_TASK_THREE_LANTERNS.md). The original repair brief below remains historical; it does not authorize further rebalancing.

## Outcome and source

Repair **Orchard Landing in place** at `?cove=orchard-landing`. The player likes Orin but finds this puzzle easier than Wide Berth and Reef Return. Preserve the new character and accepted presentation; make the planning worthy of the intended seventh cove.

Start from implementation `fb5806a7a129984290c54a9f54e08d5171d0d3d3` and safely incorporate this task commit on `m1-first-crossing`. Preserve newer/unrelated work. The live Site remains version **19**, game `f0ffe2c12f1cc0e42ad7ef10a4b57dd29097c731`. The Orchard puzzle is not difficulty-accepted or integrated into Journey.

Read this root task, `AGENTS.md`, active `docs/PROJECT_STATE.md`, `docs/DIFFICULTY_AND_MASTERY.md`, `docs/GAMEPLAY_RULES.md`, current campaign progression, and [the independent review](reviews/orchard-difficulty-review/REVIEW.md). The previous Orchard brief is completed history.

Complete a working repair and focused evidence. Choose the exact map, loading arrangements, values and implementation independently; do not stop after writing a proposal.

## Why the current puzzle needs revision

The current three passengers total exactly six spaces. All three passages share the same depth. Its two shortest ten-action sequences exchange the smaller pickups, then merge into the same state at action five. No temporary unloading is required. After returning to the safe orchard at action six, every immediately legal action still preserves some winning continuation.

Orin's third space genuinely matters, but chiefly as the opening prohibition on boarding him. The player has already learned to leave a heavy neighbor until later. Completing the collection loop does not sustain the accepted preceding level's planning demands.

Use the review's production-rule analysis as evidence. State counts and action counts are diagnostic, not automatic difficulty ratings.

## 1. Author a connected planning problem

The revised cove must require the player to connect **an earlier load/position decision to a later retrieval or crossing obligation**. Orin's three-space cost must remain consequential beyond merely preventing the first departure.

Write the intended reasoning chain in plain language, then make the actual puzzle support it. For example, a future load limits the usable exit; preserving that exit changes which passenger can be moved or where someone must wait earlier. This is an illustration of a dependency, not a required map or solution.

Require consequential choices that interact, with at least one sensible, immediately legal plan whose later failure can be explained from the visible facts. Demonstrate meaningful Undo back to the decision that caused it. A rejected shallow movement, an obligatory Wait or a tighter deadline alone does not satisfy the repair.

The puzzle may have one insightful solution family or several. Do not force multiple strategies, one unique optimal action order, extra moves or a numerical search-space quota. Swapping two equivalent pickups is not a distinct strategy. A safe alternative can be valid if it has its own meaningful tradeoff.

Keep the cove compact. You may change Orchard's topology, route depths, current phases, tide/flood timing, starting arrangement and supporting cast as needed. Reuse established species and assets; do not add a species or increase body count as a substitute for reasoning. Keep Orin at three spaces and the accepted six-space ferry. Maintain a recognizable orchard setting.

Use the existing deterministic rules and **at most one scheduled current passage**. No new ferry, falling-tide system, passenger power, packing grid, global action cap, real-time pressure or solution-aware runtime oracle. Keep factual inspection and schedules with Tips Off. Complete Undo remains unrestricted.

## 2. Verify the mathematical claim

Use production `legalActions` and `reduce`, not a parallel hand-written game. Reuse the existing solver approach where useful.

Document, before and after:

- The central inference and connected decisions, including where a legal early choice changes a later possibility.
- A complete winning witness, its action count and a shortest-path proof when feasible.
- The genuine strategy families, collapsing harmless waits, symmetric passengers, commuting pickups and split final delivery.
- Relevant tempting plans and bypass checks: immediate collection, routine small deliveries, safe-pier waiting and ordinary alternative routes.
- Which constraints enforce the intended insight. Check the relevant counterfactual, including Orin at two spaces, without changing shipped rules.
- Schedule slack and the point at which the meaningful rescue constraints have been resolved. Do not extend danger artificially after the last substantive decision just to lengthen the level.

If universal claims rely on normalized post-final-tide states, explain why future behavior is equivalent. State limits if a search is bounded. A long witness or many losing states is not proof of a satisfying challenge.

Record a **candidate efficient-action target** and justify it against the proved minimum and meaningful alternatives. This is developer evidence for the future lantern feature, not an action limit, UI hint or shipped rating. Do not implement rewards in this task.

The repaired puzzle should ask more of a player who already understands Wide/Reef. Human acceptance remains necessary; do not call it definitively harder merely because tests pass.

## 3. Preserve the accepted game and character

Keep all six Journey coves, their level data/rules/witnesses, scenes, save schema and earned history unchanged. Orchard remains the eighth Practice entrance. Do not create another cove ID or append Orchard to Journey yet.

Preserve Orin's accepted chestnut deer model/portrait, the six-space ferry and fitted docks, water, sound, sailing, homecoming and phone controls. Adapt automatic seating/transfer only where the revised legal groups require it. Check actual mixed-load faces and support; the known Orin/rabbit projection overlap must not hide a decision-relevant passenger.

Fix the candidate's supporting-rabbit identity collision: Wide already rescues **Sorrel**, a cream rabbit, while Orchard reuses that ID/name with a tan appearance. Give Orchard a distinct stable neighbor identity; leave Wide's Sorrel unchanged. Update candidate data, witnesses, labels and identity documentation consistently.

Maintain nearby names, destination-named Sail, local transfer controls, Play/Whole cove, Zoom, panning, keyboard semantics, Sound/Motion intent and portrait/landscape support. Do not use a layout overhaul to conceal a larger or unreadable puzzle.

## 4. Focused verification

Run production build, TypeScript, relevant rules/level tests and asset validation. Broaden regression testing only for shared code actually changed.

Complete the revised rescue through real controls at 390×844 and 780×320. Include the meaningful wrong-plan recovery, a tide/current transition, a mixed/subset transfer where relevant, final delivery and terminal Undo. Check touch and the relevant keyboard path. Inspect normal Play and Whole cove at native size.

Confirm Orchard Practice leaves in-progress and completed-six Journey bytes unchanged. Verify the accepted Wide/Reef witnesses and any shared seating/transfer behavior affected by the repair.

Retain one uninterrupted actual rescue with runtime audio, selected native frames, a concise design comparison and source identity. Preserve original failed runs and distinguish fresh checks from reused results. Do not claim physical-phone approval or human difficulty acceptance from emulation.

## 5. Handoff and boundaries

Update `STATUS.md`, active project state and the candidate's design/evidence. Keep the twelve-cove progression and three-lantern concept in `docs/DIFFICULTY_AND_MASTERY.md` consistent with the actual result. Update asset records only for content actually changed.

Commit and push to `m1-first-crossing`, verify remote equality, update PR #1 while keeping it draft, and leave `main` unchanged. **Do not deploy.** Preserve the existing Site's custom private audience and publication history.

Return exact final SHA; the before/after planning distinction; proof, witness and candidate target; focused verification and limitations; actual phone frames/recording; and root Journey plus Orchard local links.

No new level, reward implementation, illustrated entry or Journey/save migration is part of this pass.
