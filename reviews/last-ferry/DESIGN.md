# Gathering the last four

The empty ferry starts at Lantern Buoy, between the two pickup shores and the approach to Harbor. Pipit and Rill are the cream and tan rabbits at Lace Landing. Mallow the sheep and Osier the beaver wait together at Quilt Quay. These four occupy all six spaces. Each has a fixed appearance keyed to the passenger ID. [Level data](../../data/last-ferry.level.json)

## What the water allows

Ribbon Cut connects the two pickup landings directly. At the starting tide it has depth 2. Two rabbits need exactly that much. A sheep and a beaver need depth 3. If the captain boards the larger pair first, the map offers deep water around Lantern Buoy. Reaching Lace Landing that way uses action four. The tide rises after docking, so the receiving berth is ready for all four neighbors on action five.

| First group | Load when leaving the first pier | Way to the other pair | Everyone aboard | All ashore at Harbor |
| --- | --- | --- | --- | --- |
| Pipit and Rill | 2 spaces, needs depth 2 | Across Ribbon Cut | Action 4 | Action 7 |
| Mallow and Osier | 4 spaces, needs depth 3 | Back around Lantern Buoy | Action 5 | Action 8 |

Both plans end with two separate Sail actions and Bring home. The player can take their time at the buoy, inspect Harbor, sail the lamp channel, and stay alongside the dock until they choose to disembark. [Playable action sequences](../../data/last-ferry/witnesses.json)

## What changed in play

The prototype had a second rise on action eight. On the roundabout trip the four animals were already on deck on action five, yet the sign read “Lace Landing floods” and “Nobody waiting there.” During the last approach, a one-action countdown still pointed back across the water. This development run captured its loaded level. The start and end fingerprints differ by one developer gallery edit. [Prototype full ferry](play/prototype/390x844/04-full-deck.png) · [Prototype last approach](play/prototype/390x844/06-last-approach.png) · [Run record](play/prototype/390x844/run.json)

The finished cove keeps the rise on action four and ends the schedule there. It still opens the shallower receiving berth for the second pickup. The forecast settles, the buoy marks the turn, and the light and the four passengers carry the final two passages. Earlier pickups remain safe even if the player takes a longer route.

## Production proof

`node reviews/last-ferry/proof.mjs` walks all legal actions from the shipped starting state using the production reducer. The graph has 1,057 distinct configurations and 5,072 legal transitions. A reverse search from the won states reaches all 1,057 configurations. Waiting indefinitely before or after pickup cannot cost a rescue. For this search passenger lists are sets, and turns after the final rise are equivalent because no rule changes again. There is no search cutoff.

The minimum is seven. Both first pickups shown above attain the shortest remaining rescue from that exact loaded state. Every reachable full-ferry configuration is at the final water level. Another Wait leaves its legal future identical. The checked route from each full-ferry position takes at most two sails followed by the player’s explicit Harbor unload. These counts are developer evidence. Last Ferry has no lantern target. [Proof and source hashes](proof.json) · [Rule and Undo tests](../../tests/unit/last-ferry.test.ts)
