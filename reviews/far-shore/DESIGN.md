# Which neighbor is coming back out?

At Tide Steps, both Thistle and Button can take the short trip to Harbor alone. Rowan is across the current. Button takes one space, Thistle takes two, and Rowan takes three. In the forecast, Rush Landing can support four occupied spaces on its last dry tide. Someone at Tide Steps will need to ride **away from home** on the ferry's only outward crossing. Who can still be aboard when Rowan steps on? [Winning and losing manifests](../../data/far-shore/witnesses.json)

## What changed on the water

The first production prototype raised the tide after actions six and nine. We delivered Button, came back for Thistle and crossed with her on action six. At Far Bank the **Let Thistle ashore** control and the three actions left on the deadline made the recovery plain. After setting Thistle down, there were exactly two actions left for sailing to Rowan and boarding. All four came home on action fourteen. [Before staging](play/development/390x844/before-staging.png) · [After staging](play/development/390x844/after-staging.png) · [Actual touch run](play/development/390x844/run.json)

The shipped candidate moves the second rise to action eight. The first rise, channels, load bands, passenger placements and landings have the prototype's values. That single turn made the first delivery consequential. On reaching Far Bank there are two actions to reach and board Rowan. Setting Thistle ashore consumes one of them.

The early phone forecast named the turning channel and the closing piers. It omitted the receiving berth's changing load limit and the individual space counts down the coast. The finished free forecast shows both, including the last usable four-space berth. From Rowan's dock, a blocked boarding identifies the required and present depths. The map uses two distinct phone compositions to bring the far passengers into view. [Original forecast](play/development/390x844/opening-forecast.png) · [World and framing](world.md)

## Two arrivals at the same berth

Both trips reach Rush Landing after action seven. Rowan has one action left at the pier. The sheep and rabbit can each reach this stop on the ferry.

| Who rode outward | Free spaces on arrival | Load including Rowan | Depth needed | Berth depth | Boarding Rowan |
| --- | ---: | ---: | ---: | ---: | --- |
| Button, rabbit | 5 | 4 | 3 | 3 | Legal. Rowan steps on before the pier floods. |
| Thistle, sheep | 4 | 5 | 4 | 3 | Unavailable. The rise that would deepen the berth also floods the dock. |

There is one turn of the current, toward home after six. The successful boat collects Peat on the high Far Bank after picking up Rowan. The reach is open for as long as that homeward leg takes. The challenge comes from preparing the remote pickup while making a delivery on the opposite bank. A bridge here would add another control without sharpening that choice.

<details>
<summary>The 13-action rescue</summary>

1. Board Thistle at Tide Steps.
2. Sail to Harbor.
3. Bring Thistle home.
4. Return to Tide Steps.
5. Board Button.
6. Sail outward to Far Bank. The current turns home and Tide Steps floods.
7. Sail to Rush Landing.
8. Board Rowan. Rush Landing floods.
9. Return to Far Bank.
10. Board Peat.
11. Cross homeward to Tide Steps.
12. Sail to Harbor.
13. Bring Button, Rowan and Peat home.

</details>

## Production proof

Run `node reviews/far-shore/proof.mjs` with Node 24 from the Git root. The script calls production `legalActions`, `reduce`, `validate`, `draft` and `load` for the actual level and compares the prototype against its captured level file. The result includes SHA-256 digests of the inputs with normalized LF line endings. [Executable proof](proof.mjs) · [Verified result](proof.json)

The search exhausts a breadth-first queue over 241 reachable state classes and 588 legal transitions. A key retains the ferry stop, each passenger's location, outcome and tide. It keeps the exact action count through the last rise. After that rise the water and rules are constant, so a later repeat of the same situation has exactly the same continuations. Waiting at sea can generate infinitely many longer histories. Breadth-first discovery gives the shortest one in each class. No depth or turn limit stops the search.

The minimum is **13 actions**. Of the six legal initial actions, only boarding Thistle alone leaves a winning continuation. Excluding Thistle alone as the first Harbor delivery exhausts 172 states without a win. Excluding the outward passage with Button aboard exhausts 143. The single terminal winning state counts a shared outcome, not the number of possible input sequences.

A controlled comparison increases **only** the Rush stopping basin by one depth unit. From the same turn-seven position with Thistle aboard, Rowan can then board. The player can pick up Peat and finish on thirteen. Restoring the prototype's ninth-action flood also permits the original Button-first staging rescue on fourteen. These checks isolate the berth and the opportunity to stage a passenger. [Session and Undo tests](../../tests/unit/far-shore.test.ts)

Far Shore has no registered or proposed lantern target. Thirteen describes the fastest reachable rescue under the authored rules. Whether this decision is satisfying as the eleventh cove awaits player feedback.
