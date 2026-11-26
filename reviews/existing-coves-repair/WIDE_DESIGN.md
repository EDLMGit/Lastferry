# Wide Berth, repaired at its existing ID

The safe quay is the place to split the rescue. Beacon Reef has room under the keel for **only two spaces** on the first homeward tide. After that crossing the current lets the empty ferry go back out. On the final homeward tide it can carry six spaces, once. Eight spaces need delivery. The first load can be one sheep or two rabbits, and a trip with a single rabbit leaves too much offshore for the return.

| Passage | Low-water depth | How the crew can use it |
| --- | ---: | --- |
| High Quay – Harbor, Beacon Reef | 2 | Homeward at tide 0. Outward at tide 1. Homeward permanently at tide 2. |
| Wide Berth – High Quay | 4 | The complete first landing can leave on the deep approach. |
| High Quay – Shell Landing | 1 | A short shallow arm. Empty on the way out and two rabbits on the way back fit at tide 1. |
| High Quay – Outer Buoy – Shell Landing | 4 on each leg | The long deep way for a heavier load. Both ends meet the pickup banks. |

The same six neighbors use their existing models and appearances. Alder, Clover, Poppy and Wren occupy six spaces at the low Wide Berth where the ferry starts empty. Sorrel and Finch occupy two spaces at Shell Landing. Wide Berth floods after action 4. Shell Landing floods after action 10. High Quay and Harbor stay dry. Both tide changes follow the committed action.

## Two retrieval orders

1. **Use the short shell channel.** Board the complete first landing. Sail to High Quay, let the two sheep wait there and carry the two rabbits to Harbor on action 4. Deliver them. Sail back out to High Quay, then to Shell Landing. Board the second rabbit pair. Return up the shallow arm with those two spaces and board the sheep. Sail home with the full ferry and unload on action 12.
2. **Collect the quay first.** Board the same first landing and sail to High Quay. Leave Clover and the two rabbits there. Sail home with Alder on action 4, deliver him and return to the quay. Board the four staged spaces before visiting Shell. They are too heavy for the shallow arm. Sail to Outer Buoy, then Shell Landing. Board its pair on action 10 before their pier floods. Five bodies now use six spaces. Return via Outer Buoy and High Quay, cross Beacon Reef and deliver on action 14.

The second order makes Outer Buoy useful to a loaded boat. Its old deep connection straight to Harbor allowed the player to bypass the entire return problem.

## Attempts that reveal the rule

- The first full load cannot sail from High Quay to Harbor at tide 0. Draft is 4 and the reef has depth 2. Free inspection shows the mismatch without spending an action.
- Waiting with everyone safe on dry ground does not buy more voyages. Stage the first four neighbors at the quay and wait on action 4. Eight offshore spaces have only one homeward trip left. Taking the long deep way instead of using that first window produces the same cutoff.
- Sending only one rabbit through is insufficient. Seven offshore spaces still need the final six-space trip. The action preview predicts the shortfall. Undo restores both the ferry load and the first homeward tide.
- Missing Shell Landing's flood still strands its waiting passengers. Leaving some people behind on the last trip also loses even if their landing is dry, because the current will not carry the ferry back for them.
- Once two spaces have reached Harbor and the remaining six have cleared Shell Landing, waiting at High Quay can be harmless. A production replay waited 100 extra actions before the final delivery.
- Reinstating the old deep Outer Buoy–Harbor passage *in a counterfactual test* makes all-six safe parking viable again. The reducer permits parking all six bodies at High Quay, waiting 100 actions, then delivering them in two trips through that extra connection.

## Production checks

Both complete witnesses replay through the production Session with every predicted state compared against its committed result. Each action costs exactly one turn, every identity is conserved and every Undo returns the full previous snapshot. The first witness carries two rabbits on the opening, the second carries one sheep. Their later pickup order and approach differ.

Breadth-first enumeration uses production legal actions, all allowed subsets and the actual reducer. Normalization keeps the exact turn up to the last tide change, then coalesces equivalent later states. Exhaustive search found a minimum of 12 actions and no win that skips an exact two-space opening, skips staging at High Quay or omits a six-space homeward run.

For an unavoidable current, removing its edge identifies the Harbor bank. Following every remaining phase in order gives an optimistic maximum number of homeward trips. It allows arbitrary time per phase and a full load per trip. A required offshore load larger than that maximum can never be carried home. This proof only applies when removing that one edge actually splits the route network. An ordinary deep bypass invalidates the proof. The rule predicts and explains this definite capacity loss before commitment; full reachability enumeration is a developer check, not a hidden in-game judge.

[Authored level](../../data/wide-berth.level.json) · [Exact actions](../../data/wide-berth/witnesses.json) · [Production replay and counterexamples](../../tests/unit/wide-berth.test.ts)
