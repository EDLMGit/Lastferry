# Reef Return puzzle review

Four new neighbors fill the prepared ferry's six spaces. Heather the sheep and Flick the tan rabbit wait at Wrack Pier. Birch the beaver and Dot the cream rabbit wait at Shell Pool. A rescue asks how much room to leave **under** the boat when it comes back from the pool, and when to commit the combined load to the homeward current.

| Passage | Base depth | Permission |
| --- | ---: | --- |
| Wrack Pier ↔ Cairn Quay | 3 | Both ways |
| Cairn Quay ↔ Shell Pool | 2 | Both ways |
| Cairn Quay → Harbor, across Needle Reef | 3 | Homeward at tides 0 and 1. Harbor → Cairn Quay at tide 2. |

The first rise follows action 3 and floods Wrack Pier. The other three landings stay dry. The second rise follows action 8 and reverses Needle Reef. Every basin has base depth 4. Each edge costs one move. Load bands are 0, 1–2, 3–4 and 5–6 occupied spaces, needing depths 1, 2, 3 and 4 respectively.

## The mixed rescue

| Action | Choice | Consequence |
| ---: | --- | --- |
| 1 | Board Heather and Flick. | The boat occupies three spaces. |
| 2 | Sail to Cairn Quay. | Both are clear of the low pier. |
| 3 | Let Heather ashore. | Heather waits on high ground while the tide rises. Flick stays aboard. |
| 4 | Sail to Shell Pool. | The passage now has depth 3. |
| 5 | Board Birch and Dot. | Two rabbits and one beaver need four spaces and depth 3. |
| 6 | Sail back to Cairn Quay. | The return still fits the pool passage. |
| 7 | Board Heather. | Four bodies use six spaces. |
| 8 | Sail to Harbor. | The boat crosses in the final homeward flow. Once across, the flow reverses. |
| 9 | Bring all four home. | All have disembarked. |

The other tested plan lets both Heather and Flick wait at the quay on action 3 and retrieves both on action 7. Boarding, waiting at a safe landing and thinking involve different costs. One group transfer is one action. A waiting passenger staying put and time spent inspecting the cove consume no additional turns.

## What a wrong plan reveals

- The full collection fits aboard. Take both original neighbors to the quay, wait for the first rise, sail to the pool and board both newcomers. The outbound load needed depth 3. The loaded return needs 4. When the pool finally deepens, Needle Reef carries the boat away from Harbor. Undo can reopen the staging decision.
- Turning for home with the first group leaves Birch and Dot beyond the reef. The ferry cannot sail out again until the last homeward opportunity has already passed. The move preview names the resulting separation and Undo recovers the previous turn.
- Waiting on the quay with the whole group aboard is safe from flooding. Waiting instead of crossing on action 8 still loses the homeward opportunity. Undo restores the complete group at the quay and the last permitted crossing. Once at Harbor with all four, thirty extra Waits still allow a win.

## Production proof

The focused suite replays both routes through `Session.commit`, compares every accepted preview with its following transaction, checks each passenger appears exactly once and undoes each action. It inspects the actual same-endpoint passage permission on both sides of the last tide. A counterfactual ordinary deep connection directly from Shell Pool to Harbor allows an early delivery followed by a second collection. This distinguishes the actual map's restriction from a hidden global deadline.

A breadth-first search enumerates all available movement, all transfer subsets and Wait using production `legalActions` and `reduce`. Its identity includes boat position, passenger locations, outcome and turn through the final rise. Once all future tides are identical, equal states reached by further waiting describe the same future. Search ends upon exhausting distinct reachable states or reaching a win.

The minimum rescue has nine actions. Search found no win that avoids leaving Heather at Cairn Quay, no win that crosses the reef in small loads only and no win using one-at-a-time boarding exclusively. The loaded greedy state at Shell Pool has no winning continuation. The uninterrupted phone rescue establishes that the renderer and real controls can execute the plan. Player feedback determines whether the reversal and mixed return are satisfying.

Implementation and replay sources are [the production rules](../../src/game/rules.ts), [the authored level](../../data/reef-return.level.json), [the witnesses](../../data/reef-return/witnesses.json) and [the focused tests](../../tests/unit/reef-return.test.ts).
