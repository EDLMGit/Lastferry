# Two Shelters — design and production-rule proof

Task: TWO_SHELTERS_PROTOTYPE_01. Independent Practice candidate only. The root Journey, story order and saves are unchanged. This is a playable hypothesis for the proposed C4, not an accepted campaign replacement.

## Intended discovery

The convenient Low Landing can shelter Hazel and Bracken, but that choice commits the return journey to an order: bring the rabbit Mica home first, then return for both larger neighbors together. Using the spare capacity for one larger neighbor on the first return looks efficient and is legal; it costs the action needed to retrieve the other before the second rise. High Refuge costs an initial crossing and allows that mixed first delivery safely. Its protection remains useful after the later rise.

Both shelters are real successful choices. The difference is the plan each shelter permits, rather than one obviously compulsory safe pier. Capacity matters together with a shelter's later safety and the cost of retrieving its occupants. This is not a score or shortest-route challenge. Human playtest must still judge whether discovering it is satisfying.

The initial three-body/four-space hypothesis was not retained: once the later group was aboard, the complete original cast would fit, removing the retrieval-order tension. The chosen three-body cast uses two existing beaver archetypes and one rabbit, totaling five spaces in the unchanged four-space ferry; it requires no new rule or packing interaction.

## Exact non-spatial contract

| Fact | Authored value |
| --- | --- |
| Ferry | Original four-space model; capacity 4 |
| Draft | Empty 1; load 1–2 needs 2; load 3–4 needs 3 |
| Tide | Starts 0; rises to 1 after action 4 and to 2 after action 9 |
| Basins | All four have base depth 3 |
| Harbor | Elevation 3; final delivery |
| Low Landing | Elevation 2; floods after action 9 |
| High Refuge | Elevation 3; remains dry throughout |
| Reed Pier | Elevation 1; floods after action 4 |
| Deep passages | Harbor–Low Landing, Harbor–High Refuge, Low Landing–High Refuge: base depth 3 |
| Shallow passages | Low Landing–Reed Pier, High Refuge–Reed Pier: base depth 1 |
| Start | Ferry at Low Landing with Hazel (beaver, 2) and Bracken (beaver, 2) aboard |
| Waiting | Mica (cream rabbit, 1) at Reed Pier |
| Actions | Move, selected Board, selected Unload and Wait each cost one action; free inspection costs none |

All passages are bidirectional. All three neighbors are visible and required from the start. Tide and flood information come from these actual authored values; no hidden arrival trigger, later spawn, extra action limit or real-time pressure exists. All names are new independent-candidate identities. Geometry is authored separately in `data/two-shelters.level.json`; it cannot change this proof contract implicitly.

## Successful production-reducer witnesses

The exact machine-readable actions are in `data/two-shelters/witnesses.json` and are replayed through the real `validate`, `preview`, `reduce` and `Session` implementation.

| Action | Low shelter, rabbit home first | High shelter, mixed first delivery |
| ---: | --- | --- |
| 1 | Let Hazel and Bracken ashore at Low Landing | Sail to High Refuge |
| 2 | Sail to Reed Pier | Let Hazel and Bracken ashore |
| 3 | Board Mica | Sail to Reed Pier |
| 4 | Wait; the tide rises with Mica aboard | Board Mica, then the tide rises |
| 5 | Sail to Low Landing | Sail to High Refuge |
| 6 | Sail to Harbor | Board Hazel |
| 7 | Bring Mica home | Sail to Harbor |
| 8 | Sail to Low Landing | Bring Mica and Hazel home |
| 9 | Board Hazel and Bracken, then the tide reaches the now-empty landing | Sail to High Refuge; Bracken remains safe as the tide rises |
| 10 | Sail to Harbor | Board Bracken |
| 11 | Bring Hazel and Bracken home: won | Sail to Harbor |
| 12 | — | Bring Bracken home: won |

The low witness may replace actions 1–4 with: let Hazel ashore, let Bracken ashore, sail to Reed Pier, board Mica. That separate-subset witness also wins in 11 actions and exercises atomic boarding before flooding. High Refuge also supports the rabbit-home-first order in 11 actions; it is verified as a third witness, without claiming that every delivery permutation is a distinct puzzle solution.

## Tempting alternatives and non-bypass checks

- **Deliver the already-complete starting group first:** sail Harbor, unload both, sail Low Landing, sail Reed Pier. The fourth action arrives but does not board. The rise strands Mica. A visit through High Refuge takes the same minimum number of actions and cannot rescue them sooner.
- **Wait for enough water while loaded:** after four Waits Reed Pier floods with Mica still waiting. Both shallow approaches are blocked initially, and unloading only one larger neighbor still leaves draft 2 against depth 1. Invalid attempts change no turn, tide or Undo history.
- **Take a larger neighbor with the rabbit from Low Landing:** after returning at action 5, boarding Hazel at action 6 is legal and raises the load to three spaces. Harbor 7, delivery 8, Low Landing 9 strands Bracken before boarding. Swapping Hazel and Bracken has the same consequence. Exhaustive production-state traversal from either action-6 state finds no forward win; Undo is the recovery.
- **Delay the final approach by one action:** sailing High Refuge, unloading, waiting and then arriving at Reed Pier on action 4 strands Mica. Arrival cannot include boarding.
- **Retrieve only one larger neighbor at the low shelter's final boundary:** boarding Hazel on action 9 strands Bracken. Boarding both first, then applying the rise, is safe.
- **Bypass temporary unloading:** exhaustive traversal of production `legalActions` and `reduce`, excluding only non-Harbor Unload actions, finds no win. The traversal normalizes elapsed turns only after the final authored rise, when future rules are time-invariant. It has no finite player/search deadline and does not invent an additional loss condition.

The first pre-scenery production-reducer experiment used the same graph and timing with two rabbits (four bodies, six total spaces). The mechanical proof passed, but model inspection favored the bounded three-body/five-space version to preserve the small ferry. A subsequent transfer inspection retained two beavers and one rabbit at those same costs; their slimmer bodies avoid widening the dock for a turning sheep. The final production unit run reproved all successful strategies, both irrecoverable greedy states, collection-home-first failure and the no-staging result with Mica alone. Focused tests retain these meaningful behaviors, passenger conservation, nonmutating previews and complete Undo of every witness, including both tide boundaries and terminal delivery. Actual UI execution and visual acceptance are reported separately in `REVIEW.md`; the mechanical proof does not substitute for them.
