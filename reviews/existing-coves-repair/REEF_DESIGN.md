# Reef Return

Heather the sheep and Birch the beaver begin aboard at Cairn Quay. Dot, the cream rabbit, waits at Wrack Pier. Flick, the tan rabbit, waits at Shell Pool. The four neighbors occupy six spaces. The ferry has two approaches to Harbor, a deep tidal reef and a shallow passage through the pool. Sending a heavy group home early changes which side the ferry can approach the last rabbit from.

| Passage | Base depth | Direction |
| --- | ---: | --- |
| Cairn Quay–Wrack Pier | 2 | Both ways |
| Cairn Quay–Shell Pool | 1 | Both ways |
| Shell Pool–Harbor | 1 | Both ways |
| Needle Reef between Harbor and Cairn Quay | 3 | Toward Cairn Quay at low water, toward Harbor at the middle tide, toward Cairn Quay at high water |

Wrack floods **after action 3**. Cairn Quay and Shell Pool flood **after action 9**. Harbor stays dry. The first pickup requires a lighter boat at low water. At the middle tide, two small rabbits together still fit through the pool passage. A beaver and a rabbit do not. The actual goal is still delivery at Harbor.

## Two different rescues through the same cove

| Turn | Gather the rabbits and bring one full boat home | Deliver the larger group and approach the pool from Harbor |
| ---: | --- | --- |
| 1 | Leave **both** larger animals at Cairn Quay. | Leave **Heather** at Cairn Quay and keep Birch aboard. |
| 2 | Sail to Wrack. | Sail to Wrack. |
| 3 | Board Dot, then Wrack floods. | Board Dot, then Wrack floods. |
| 4 | Sail to Cairn Quay with Dot alone. | Sail to Cairn Quay with Birch and Dot. |
| 5 | Sail to Shell Pool through the shallow inner passage. | Board Heather. Five spaces are aboard. |
| 6 | Board Flick. Both rabbits together need depth 2. | Take the deep reef to Harbor with Heather, Birch and Dot. |
| 7 | Return to Cairn Quay. | Bring all three home. |
| 8 | Board Heather and Birch. All six spaces are aboard. | Head out light through the shallow Harbor–pool passage. |
| 9 | Cross the reef home, then its direction reverses. | Board Flick before her pier floods. |
| 10 | Bring everyone home. | Return through the pool passage as the reef runs the other way. |
| 11 | | Bring Flick home. |

The early decision changes the gathering route, the load at the reef, the number of deliveries and the side from which the ferry visits Shell Pool. If the boat returns from Wrack carrying Birch and Dot, the inner shoal excludes it. Production search found no rescue from that position that could postpone Harbor until after collecting Flick.

## Alternatives and relief

- **Collect without lightening.** The initial four-space load needs depth 3. Wrack's passage has depth 2. Waiting until it deepens strands Dot at the first rise.
- **Park everyone at Cairn Quay.** On the gather route, let the two rabbits ashore on turn 8 instead of boarding the two larger animals. All four can stand on the quay. No remaining sequence can rescue them. Waiting floods the pier. Boarding all four on turn 9 saves them from that flood but leaves the full ferry facing outflow and a depth-3 alternate return.
- **Wait aboard for the deeper water.** Wait with the full load on turn 9. The current now points outward along the wide passage, and the shallow passage still has only depth 3. The boat needs 4. No dry landing remains within that loaded boat's reach. The actual preview and terminal state explain the loss; Undo gives the homeward crossing back.
- **Try small shuttles by the ordinary passage.** The route stays inspectable and usable for suitable loads. Searching every legal transfer subset found no win bypassing the homeward reef and no win whose Harbor crossings all carried four spaces or fewer. The shallow route works when paired with the earlier five-space reef delivery.
- **Wait once everyone is across.** The item that expires is the route. Thirty more waits at Harbor with everyone aboard still permit delivery.

The existing solver check for a permanent directional cutoff works on directed topology. At design trial it allowed a full ferry to wait forever after the last reversal because a bidirectional line still connected the islands on paper. Searching from that position found no win. The added final-tide check traverses *actual passages* using the current loaded boat's production movement validator. It ends the rescue only when an aboard required neighbor cannot reach even one dry landing for a transfer. Before the plateau a later change could help, so this check does not run. In a counterfactual with one reachable dry high landing at Wrack, the very same late ferry can actually split its load there and finish by the pool route.

## What was measured

The two developer witnesses replay through the actual session, with every preview compared to its accepted result, all passenger identities conserved, and every complete snapshot recovered in reverse. The production breadth-first search uses every legal action and subset. Its state identity preserves the turn until the last rise and merges equivalent states after that. The shortest rescue takes ten actions. Suppressing full-load returns yields the eleven-action relay. Suppressing all homeward reef crossings exhausts 272 states, restricting all Harbor crossings to four spaces or fewer exhausts 424, and forbidding temporary unloading exhausts four. These counts include terminal states. Human playtest determines whether the choices are readable and satisfying.

[Authored level](../../data/reef-return.level.json) · [Winning and losing witnesses](../../data/reef-return/witnesses.json) · [Rule and Undo checks](../../tests/unit/reef-return.test.ts) · [Preview and direction checks](../../tests/unit/reef-return-presentation.test.ts)
