# The ferry at Wick

On turn six, the ferry noses back into Wick Landing empty. Flax is home, the bridge is open, and two rabbits are standing beside the boat. There are six spaces. Across Wick Race, Sorbus waits at Lantern Steps. His steps flood in two actions. The rabbits' landing has six actions left.

Boarding is available. The question is whether the ferry has time to stop. The deadline, current direction, individual loads and number of passages are public with Tips Off. A player can inspect all of them without spending an action.

<details>
<summary>How the two plans work</summary>

**Use the signal.** Leave the rabbits at Wick and sail with Flax through the depth-two inlet. Swing the bridge before its quay floods and take Flax home. Return to Wick on action six. Sail straight across to Lantern Steps on seven and board Sorbus on eight. Boarding completes before the flood. Wick Race turns back toward the waiting rabbits, so the ferry can sail back, take them aboard and deliver the five-space group. The minimum is **13 actions**.

**Leave room.** Take just one rabbit with Flax. There are still three spaces for Sorbus. Board him at Lantern Steps just as the distant signal quay floods. The full ferry follows the outer floats to Harbor. Come back along the outside as the race turns toward Wick. Board the last rabbit on action twelve, when Wick floods and the current turns outward again. Sail back around the outside. This wins in **17**, the minimum when the bridge must stay closed. Either rabbit can be the first one aboard. The signal-first route takes the family together later; this route brings one home early and returns for the other.

The six-space ferry already established for this part of the story is essential. Flax uses two, the two rabbits one each, and Sorbus three. Boarding both rabbits at the opening uses only four of six spaces, but the ferry then draws three in a depth-two inlet and has only two places for a three-space deer down the deeper race. The visible opening choice changes which route can still work.

**What the attractive stop costs.** On the signal-first route, boarding both rabbits at turn six is legal and leaves the crossing playing at turn seven. There are six legal actions from there. Every one leaves Sorbus ashore when his steps flood on eight, including sailing to him. Undo the loss and then the boarding, sail to him instead and the same rise happens with Sorbus safe aboard. Trying the initial all-rabbits pickup instead also enters a still-playing state with no winning continuation. The shortest sample demonstration returns home with the opening load, only to see the Steps flood while coming back along the outer floats.

</details>

## What changed during development

| Tested arrangement | What it asked | Decision |
| --- | --- | --- |
| Earlier bridge demonstration | Both rabbits could board with Flax by action two. The two routes changed the trip home. | Keep the signal, clear opening and reversible passage. Put another neighbor on a second threatened shore. |
| Four landings with Flax at a permanently dry Signal Quay | Putting Flax ashore freed space for the rabbits and deer. Even suppressing the winch until both occupied landings flooded still admitted a rescue. | Drop this arrangement. The quay was a safe warehouse and the bridge could wait until the rescue work was over. |
| Wick start, low signal and Steps flooding on action nine | The signal-first plan could return to Wick on six, board both rabbits on seven, sail on eight and collect Sorbus on nine. | Advance the Steps flood and the reversal one action. With a deadline of eight, the player has to sail past a legal pickup to reach the earlier deadline. |

The dry-quay and action-nine arrangements are mechanics comparisons using the production rules, kept outside the playable registry. The final graph uses all six stops around one ring. Harbor and the signal form its inner gate. Wick faces the new deer landing across the turning race. The dry quays, tide schedule and available spaces determine who can be returned for. Ternhaven established staging before retrieval, and Drowned Orchard required sizing a load for the last return. Here the timing of an optional one-use signal changes the pickup order even with a completely empty boat.

## Rule evidence

The breadth-first traversal uses the production `legalActions` and `reduce`. It explores waits, partial transfers, dropped or staged passengers, both bridge states and every legal move. Keys preserve passenger identities, each berth's waiting set, boat location, load membership, delivered set, bridge, outcome, loss facts and tide. After action twelve all future rules depend on the same final tide, so equal states at later turns have identical successors. Before twelve the exact turn is part of the key. There is no depth limit. Undo is checked separately by the actual session and UI tests; undoing is a way to reconsider a committed choice.

| Condition | Reachable states | Legal transitions | Minimum actions to win |
| --- | ---: | ---: | ---: |
| Actual cove | 3,170 | 8,618 | 13 |
| Keep bridge closed throughout | 2,113 | 5,928 | 17 |
| Start with the bridge open | 2,718 | 7,900 | 12 |
| Board both rabbits on turn one | 1,752 | 4,868 | No win |
| Same turn-one commitment with bridge already open | 2,320 | 6,569 | 14 total |
| Board both on Wick return, turn seven | 7 | 6 | No win |

For the fixed-open check, the only change to the initial state is `bridgeOpen: true`. All original depths, currents, passengers and deadlines still apply. Flax can be delivered without spending the winch action. The ferry then reaches the *same* empty-boat Wick position a turn earlier. Gathering both rabbits there **and then** collecting Sorbus on action eight wins. On the actual map, sailing to Sorbus is the only winning action from the turn-six fork. The closed comparison forbids only the open action and exhausts that subgraph. The two terminal winning state classes in the unrestricted search distinguish bridge open/closed; there are many possible sequences.

Run `node --experimental-transform-types reviews/lantern-reach-difficulty/proof.mjs` from the repository root. The result includes the full production traces, source hashes, both counterfactuals and the tested prototype settings. [Proof program](proof.mjs) · [Full results](proof.json) · [Playable witnesses](../../data/lantern-reach/witnesses.json)
