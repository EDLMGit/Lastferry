# Drowned Orchard — two inward trips, one outward return

**Candidate result: the minimum is 13 actions.** The turning reach starts *homeward*, while the empty ferry and eight spaces of neighbors start on its orchard side. Sail home with too little and one last six-space ferry cannot finish. Carry too much and the first shallow crossing cannot begin. Getting the right load across is only half the problem: the ferry must get back to the orchard side before the last reversal, with the Steps neighbors safe from the rising water.

This is the existing apple country. Harbor remains west of Cider Quay, Orchard Landing east, and Spring Steps south. The old Quay–Steps water is no longer a route. A newly useful eastern passage ties the Steps to Orchard Landing. The quay is underwater before the first action: the ferry can sail through its basin but nobody waits or transfers there. No former passenger needs to be rescued again.

| Location | Opening arrangement | Role after the water changes |
| --- | --- | --- |
| Orchard Landing | Empty six-space ferry, Damson (chestnut deer, 3), Brindle (sheep, 2) | High landing remains safe; the final return must depart from this bank. |
| Spring Steps | Burr (brown beaver, 2), Sloe (cream rabbit, 1) | Both can wait through the first rise, but must have left the Steps by action nine. |
| Cider Quay | Nobody; already flooded | Navigation stop only. No hidden holding space at the quay. |
| Harbor | Nobody | Only delivery point. |

Starting tide is **1**. Waiting piers have elevations 4 (Orchard) and 3 (Steps); the flooded elevation-1 quay is empty and Harbor is elevation 4. All four stopping basins have base depth 4. Pomona Reach has base depth 1: it goes Orchard → Quay through action 5 (depth 2); Quay → Orchard through action 9 (depth 3); finally Orchard → Quay indefinitely (depth 4). The incoming move at each boundary uses the old phase; tide and possible loss resolve afterward. Both ordinary edges have base depth 2. The high initial water is literal level data, not a differently tinted version of the original.

## What the ninth decision adds

In accepted C7 the first delivery makes the remaining passenger a feasible escort for Orin. In C8 an early delivery and temporary refuge determine the later retrieval approach. Here the reach separates **two** offshore landings from home. Players must reserve their only outward crossing for a return to that entire bank. Before the second rise the last six spaces must remain on that side **with** the ferry, yet no one may remain waiting at Spring Steps. Merely staging a particular passenger is neither necessary nor sufficient.

Of eight offshore spaces, at least two must cross in the first trip. Depth 2 also imposes an upper bound of two. The only viable first-crossing loads found by exhaustive enumeration are exactly Brindle or exactly Burr. They share a size, but swapping them is not symmetric: one waits on high ground and the other shares a flood deadline with a rabbit. Both initial plans cost the same **for different reasons**.

| Consequence | Clear the Steps first | Return for the Steps |
| --- | --- | --- |
| First three actions | Sail to Steps; board Burr **and** Sloe; come back to Orchard. | Board Brindle; cross the reach; sail to Harbor. |
| First homeward window | Let Sloe ashore on high Orchard. Two-space Burr can just cross on action 5. | Deliver Brindle on action 4. The ferry reaches Quay on 5, ready for the newly outward current. |
| Outward window | Deliver Burr, return via Quay and cross **on action 9**. On tide 3 the ferry is empty on the Orchard side and the other three are together on safe ground. | Cross on 6; visit Steps and board the pair on 8. On 9 they are aboard at Orchard and Damson is still ashore. An equally short variant boards Damson on 7 and picks up the pair on 9. |
| Final return | Board the three together; cross to Quay, sail Harbor, deliver all. | Add Damson (or sail back from Steps with the full crew); cross to Quay, sail Harbor, deliver all. |

The strategies converge on a full, six-space final trip through a depth-four homeward reach, not on the same passenger partition. They differ in the first obligation, the shore where Sloe spends the outward window, which neighbor is delivered, and where the boat must be at the final change. The Steps-first plan needs a temporary unloading; the Brindle-first plan does not. Neither route includes a wait, repeated inspection, split final delivery or a different ordering of equivalent IDs.

**Proposed efficient target, developer only: 13.** We considered cost *after* finding the branches. Both natural strategies and the alternate carry-Damson-first pickup order finish in 13; these are the only three minimum-length action sequences apart from order inside a single subset. Neither strategy would be penalized by 13. A 14th action is not needed to pay for a genuinely longer staging or approach decision, so we did not add an artificial wait or inflate a witness to justify it. Human playtesting may prefer more latitude. There is no player-facing target or mastery revision for this cove.

## A plausible mistake, and what Undo teaches

At Steps on action 1, all three boarding subsets are legal. Sloe alone leaves the boat shallow enough to sail home; however **only taking both** still has a winning continuation. After boarding Sloe alone on 2 the game is *playing*, not lost. Taking Burr now as a second action leaves a three-space load. Returning to Orchard on 4 and letting Sloe ashore on 5 misses the shallow homeward window. Crossing with Sloe instead leaves seven spaces offshore. In the committed losing witness the actual game reports `RETURN_CAPACITY` on **action 4**, with seven offshore spaces and just one remaining homeward trip. The graph below exhausts *all* continuations from the earlier decision, not just this ending.

| Exact production query | Result |
| --- | --- |
| All futures after action 1 at Steps | Rescue possible in 12 more actions; only one viable next subset. |
| All futures after action 2 boarding only Sloe | 46 states, 93 transitions, 16 playing, 30 lost, zero won. |
| Undo actions 4, 3 and 2 from the actual terminal loss | Exact state at turn 1 restored; completing Steps-first gives a 13-action rescue and 3 successful Undos. |
| Undo at each tide boundary, or undo terminal delivery and redeliver | Prior tide, positions, passengers and state restored; successful-Undo history retained separately. No result/award is created. |

## Constraint checks and bypasses

- **Depth in isolation:** deepening only the Pomona sill by one unit lets the same Sloe-alone turn-two state recover. Board Burr on 3, return to Orchard, cross on 5 with both. Production minimum of the relaxed cove is 12. No hypothetical depth ships.
- **Direction in isolation:** make only Pomona Reach ordinary and bidirectional; keep its shallow depth and the true Steps flood. The Sloe-alone position now wins by collecting Burr, crossing after the extra depth arrives and making another outward trip. Removing the current also removes the reducer’s current-specific loss diagnoses; the audit proves a positive, explicit delivered-state witness, not just the absence of an error message.
- **Flood location in isolation:** raise the Steps pier from elevation 3 to 4 in a separate rules-only copy. Taking *only Burr* on the first Steps visit now succeeds: Sloe can wait past turn nine for the second pickup. It cannot succeed in the shipped cove. This demonstrates the changed shore, over and above the eight-space arithmetic.
- **Earliest collection:** all four need eight spaces, so everyone cannot fit aboard. Six spaces can actually be collected as early as turn 3 (take Damson, sail to Steps, board the pair), but no full-boat state before a first delivery has any rescue. Earliest full-boat state that can still win: turn 9. Boarding the five-space Orchard pair straight away remains recoverable by correcting the load; the audit does not claim that every suboptimal opening is lost.
- **Shuttles and parking:** sending Brindle directly home is a legitimate winning branch, not a bypass: the ferry must still come back over the middle current and reach the threatened Steps in time. Crossing empty immediately loses. Banning all first-phase crossings, parking offshore until permanent high water, or forbidding the middle outward re-entry gives no win. Delivering *after* the first rise is legal (Burr’s branch), so there is no false first-phase Harbor delivery requirement.
- **Ordinary detours:** the Steps–Orchard passage is indispensable to reach both parties, but neither ordinary edge crosses between banks. With Pomona removed from the non-current connectivity graph, Harbor and Quay are disconnected from Orchard and Steps. The audit shows no win if the Steps approach is forbidden; the existing ordinary edges cannot avoid the middle outward crossing. The flooded quay cannot be a temporary shore.

## Reproduce the proof

From the repository root with Node 24: `node --experimental-transform-types reviews/cove-nine-practice/audit.mjs`. Its complete [JSON result](audit-results.json) records the hashed mechanics, sources, load/draft/turn/phase after each action, shortest suffixes, actual Session replays, mistakes, restrictions and isolated relaxed copies. [Committed actions](../../data/drowned-orchard/witnesses.json) · [Candidate data](../../data/drowned-orchard.level.json) · [Focused reducer and Session checks](proof-units.json).

The audit calls production `checkCurrents`, `initial`, `legalActions` (all legal nonempty board/unload subsets), `reduce` and `Session`. A FIFO traversal exhausts the reachable graph; reverse breadth-first distances from all genuine win nodes give the exact minimum from every viable state. **326 states, 880 legal transitions, 85 states with a winning continuation.** No arbitrary search-depth cutoff is applied. Keys contain boat node, tide, turn up to the last change, terminal outcome/reason, delivered set, aboard set and the complete waiting set at every pier. Order inside a location is immaterial to all rule guards. At and after turn nine, no future rise is left, costs are constant, and every action sees the same direction, depths, transfer and outcome tests; the exact later turn cannot alter any successor except its absolute turn. The first FIFO discovery gives the minimum absolute arrival time for each equivalence class. Counts refer to this canonical graph, not the number of ways to play. They do not establish human difficulty.

Two independent no-score checks replayed both plans and terminal redelivery; the focused Vitest suite also covers real tide Undo and genuine loss recovery. The first exploratory command without Node’s transform flag stopped at the existing TypeScript Session constructor parameter property and produced no proof; the documented invocation runs that actual constructor. No gameplay rule or threshold was changed to run the search. Physical play, native images, any browser failures and visual limits are separately reported in [the review](REVIEW.md).
