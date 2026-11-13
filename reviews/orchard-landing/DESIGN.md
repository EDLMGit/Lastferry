# Orchard Landing

Orin is beside the ferry at the safest landing. Picking him up looks like a sensible first move. His three spaces would sink the boat one depth band too far for the only way out. The player must decide when to leave someone safe behind, which neighbors need the first crossing, and which side of Pomona Reach to be on when the stream turns. The relief at the second reversal comes from being in position to bring all three home.

## The four landings

| Stop | At launch | Floods |
| --- | --- | --- |
| Orchard Landing | Empty six-space ferry and Orin, a three-space deer | Stays dry |
| Cider Quay | Pomme, a two-space sheep | After action 7 |
| Spring Steps | Sorrel, a one-space rabbit | After action 4 |
| Harbor | Lighthouse refuge | Stays dry |

Cider Quay branches to each of the other three stops. All three passages begin at depth 2 and deepen to 3, then 4. The stopping basins begin at depth 4. Only Orchard ↔ Quay has a scheduled current. Pomona Reach flows **out of the orchard**, **into the orchard** after action 4, and **out for good** after action 7. Passages are one action each. The ferry and draft bands are the same as Wide Berth and Reef Return. [Authored map](../../data/orchard-landing.level.json)

## Developer witness

| Action | Decision | Result |
| --- | --- | --- |
| 1 | Leave Orchard Landing empty for Cider Quay. | The first outward flow admits a light boat. |
| 2–3 | Sail to Spring Steps and board Sorrel. | One space aboard. |
| 4 | Sail back to Cider Quay. | Spring Steps floods. The stream now runs toward Orin. |
| 5 | Board Pomme. | Together the two neighbors need depth 3. |
| 6 | Cross inward to Orchard Landing. | The depth-3 middle passage carries both while it faces the orchard. |
| 7 | Board Orin. | All six spaces aboard. Cider Quay floods. The stream turns outward at depth 4. |
| 8–10 | Sail to Cider Quay, sail to Harbor, bring all three home. | The flooded berth still permits transit. |

The two smaller neighbors can also be picked up in the opposite order. Pomme travels to the Steps on the initially shallow boat, Sorrel boards on the rise, and the pair returns together. One wait at the start still allows the inward crossing on action 7 itself. At high water the aligned ferry can wait as long as desired. There is no global time limit. [Replayable transactions](../../data/orchard-landing/witnesses.json)

## What the alternatives cost

| First idea | Production-rule consequence |
| --- | --- |
| Board Orin immediately. | Orin alone needs depth 3. The present depth of 2 blocks sailing. Letting him off again spends a second action. By the time the ferry arrives at Spring Steps, Sorrel has flooded. No continuation after this first boarding wins. |
| Deliver the smaller pair as soon as they're aboard. | Harbor is accessible at middle water. Delivering them there on action 7 leaves the boat permanently outside Orin's landing. The reducer reports `RETURN_CUT_OFF` for Orin. Undo twice restores the loaded ferry at the branching quay. |
| Wait safely at the orchard. | One early wait can work. Two waits followed by the trip to Sorrel reach the Steps on the rise, before there is time to board. Waiting for deeper water alone cannot prepare the retrieval. |
| Use an ordinary bypass or several small deliveries. | There is one entrance to the orchard. Every rescue must take both smaller neighbors inward, then depart with all six spaces. Splitting the final unloading at Harbor remains legal. |
| Charge two spaces for the deer in a developer copy. | He can board first, leave in the depth-2 opening, pick up Sorrel on action 4 and Pomme on action 6, wait for depth 4, then sail home. Nine actions suffice without revisiting the orchard. At the authored cost of three, a win without revisiting it is impossible. |

The proof enumerates ordinary production `legalActions` and `reduce`, including every legal subset and Wait. It keys location, passenger locations, status and turn through the last scheduled change. Later turns have identical depths, flow, action choices and outcomes, so the search coalesces them without a move cutoff. The shortest win is ten actions. Re-running with individual transitions forbidden rules out a rescue without an empty outward departure, an inward crossing with Pomme and Sorrel, or a full outward crossing. The transaction replay compares previews to commits and restores every Undo snapshot in reverse. [Executable proof](../../tests/unit/orchard-landing.test.ts)

Driftwood requires selecting a refuge and staging someone there. No temporary unloading is needed in Orchard. Wide reserves an early two-space **homeward** opportunity. Orchard's useful middle crossing runs **away from home**, with the safe deer still waiting. Reef permits an early heavy delivery and another approach to the final rabbit. Orchard has a single entrance to the deer, and an early delivery can put the ferry on the wrong side of it for good.

## Story boundary

The seventh cove is available for Practice playtesting. Its entry premise is “Orin knows every path through the orchard. Tonight, he needs the ferry.” A later integration following acceptance can use the existing illustrated player and explicit completed-six continuation with the original-byte backup. The current six-cove Journey and its earned rescues keep their existing endpoint. Human playtesting will determine whether the preparation and return feel satisfying.
