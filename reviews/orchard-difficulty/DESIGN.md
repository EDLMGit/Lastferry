# Orchard Landing · the Harbor trip chooses Orin’s escort

The old Orchard asked when to pick up Orin. Once both small neighbors reached his landing, the boat could wait for depth four and bring everyone home together. Both shortest ten-action routes reached the same state on turn five.

The repaired Orchard asks **who must already be home when the ferry reaches Orin?** The tide that makes the reach deep enough for a five-space load also turns it against the ferry. During the only outward flow the passage has depth three. Orin can come back with Medlar (3 + 1, draft 3). He cannot come back with Pomme (3 + 2, draft 4). That later obligation tells the player which neighbor to deliver on the first trip, when either neighbor alone fits the Harbor route. [Independent before audit](../orchard-difficulty-review/REVIEW.md) · [Authored level](../../data/orchard-landing.level.json)

## Four landings, three neighbors

The empty ferry starts at Spring Steps with Pomme the sheep and Medlar the tan rabbit. Orin waits on the high orchard landing. Harbor and Orchard stay dry. Spring Steps and Cider Quay both flood after action nine, so neither can shelter an escort indefinitely.

| Passage | Low tide, through action 9 | Middle tide, actions 10–12 | Final tide, from action 13 |
| --- | --- | --- | --- |
| Spring Steps ↔ Cider Quay | Depth 3, either direction | Depth 4 | Depth 5 |
| Cider Quay ↔ Harbor | Depth 2, either direction | Depth 3 | Depth 4 |
| Pomona Reach | Quay → Orchard, depth 2 | Orchard → Quay, depth 3 | Quay → Orchard, depth 4 |

The action completes before the tide changes. On the ninth action the boat can still enter Orchard. On the twelfth it can still leave. All these depths, directions, flood times and passenger costs are available with Tips Off. Passage curves, berth positions, ferry, species models and independent Practice entry retain their existing identities. Wide’s cream rabbit is still Sorrel.

## Two ways to prepare the same final load

| Action | Stage Medlar · 12 actions | Return to Spring Steps · 13 actions |
| --- | --- | --- |
| 1 | Board Pomme and Medlar together. | Board only Pomme. |
| 2 | Sail to Cider Quay. | Sail to Cider Quay. |
| 3 | Let only Medlar ashore. | Sail to Harbor. |
| 4 | Sail to Harbor with Pomme. | Bring Pomme home. |
| 5 | Bring Pomme home. | Return to Cider Quay. |
| 6 | Return to Cider Quay. | Sail to Spring Steps. |
| 7 | Board Medlar at the quay. | Board Medlar at the steps. |
| 8 | Cross inward to Orchard. | Return to Cider Quay. |
| 9 | Board Orin. The tide turns. | Cross inward to Orchard as the tide turns. |
| 10 | Cross outward with Orin and Medlar. | Board Orin. |
| 11 | Sail to Harbor. | Cross outward with Orin and Medlar. |
| 12 | Bring both home. | Sail to Harbor. |
| 13 | | Bring both home. |

The staged plan spends a transfer at Cider Quay to avoid revisiting Spring Steps. The other plan leaves Medlar at the original landing, saves the temporary unload and requires the extra outward visit under a closing tide. Both require the same load partition. The choice of where to retrieve the rabbit affects when the boat can reach Orchard. Splitting a transfer or waiting at a dry pier does not create a third strategy. [Production action witnesses](../../data/orchard-landing/witnesses.json)

## The tempting wrong choice

With both neighbors at the quay on turn two, either can be put ashore. Put Pomme ashore and bring Medlar home first. Retrieving Pomme and crossing inward with her costs exactly the same as the successful staging plan. Board Orin on turn nine. The reducer still reports a playing state, with five spaces aboard and depth four needed. The outward reach offers only three. Letting a neighbor wait at Orchard leaves no second outward trip to retrieve them. Waiting for depth four ends the rescue when the current points inward for good on turn twelve.

The first irreversible planning error in that branch was the legal sheep unload on turn three. Reversing the states through Undo back to turn two lets the player change the subset and complete the rescue. Delivering only the rabbit and stopping at Harbor also fails to satisfy the outstanding rescue. An ordinary detour cannot reach Orin because Pomona Reach is his landing’s only edge.

## What the production graph establishes

The exhaustive search walks `legalActions` and `reduce` for the shipped level. After the final turn boundary it keys states by final tide, location, status and each passenger’s exact location. Every future depth, direction, transfer, flood check and objective test is then identical regardless of elapsed turns. This coalesces equivalent waits without truncating the search. [Reproducible audit](audit.mjs) · [Results](audit-results.json) · [Proof and Undo tests](../../tests/unit/orchard-landing.test.ts)

- There are 482 normalized states and 1,311 transitions. The shortest rescue takes **12 actions**, with one optimal action sequence. Those counts measure this graph and establish the minimum.
- Across all winning continuations, the first delivery is Pomme alone. The inward reach always carries Medlar alone on action 8 or 9. The outward reach always carries Orin and Medlar on action 10, 11 or 12. Removing any one of those required transitions from an otherwise exhaustive search leaves no rescue.
- The staged witness has one low-tide action to spare before entering Orchard. The direct-delivery witness uses that last inward opportunity on action 9. An initial Wait still allows a 13-action rescue. Two initial Waits leave none. On the staged witness just after boarding Orin at turn 9, all five legal immediate actions still admit a continuation. After two waits only sailing outward preserves the rescue.
- The last consequential deadline is getting the correct pair out of Pomona Reach. Once through it on action 10–12 with Pomme home, the ferry can take its time on the Harbor side. There is no move limit.
- A developer copy charging Orin only two spaces restores the reversed partition as a second optimal rescue. The same wrong sequence through turn nine now holds four spaces at depth three; it crosses outward, sails to Harbor and delivers on turn twelve. The optimum stays twelve. His third space changes who must already be home.
- Raising just the opening Harbor depth from two to three admits both smaller neighbors together on the first delivery. Removing just the current admits a 15-action recovery from the five-space turn-nine state by waiting for deeper water. Neither relaxation is present in the game.

**Candidate efficient-action target: 13.** The shortest staging route qualifies. The second, equally deliberate strategy qualifies on its last timely inward crossing; a target of 12 would reject it. Within 13 actions the audit found 19 sequences that retrieve Medlar from the quay (one of length 12) and one sequence that returns to the steps. The counts include harmless order changes, split transfers and waits. A longer rescue still wins. This number is developer evidence for a future review of mastery targets. The player’s difficulty judgment and eventual C7 story placement remain open.
