# Driftwood Yard — mechanically proven candidate

This is a proposal for the next authored cove, grounded in the existing campaign direction and the production reducer at `da1f2686ce6aff8d754e13111447dabb6e1313f0`. It is not a shipped level or an art/phone approval.

## The distinct decision

**Get Nell somewhere safe before taking her all the way home.** The nearby High Mooring lets you leave her safely, reach the rabbits with an empty shallow-draft boat, then collect everyone after the rising water opens the loaded return. Taking Nell directly to Harbor seems helpful but uses the one trip you need before the low landing floods.

Holding begins with a passenger already aboard at the safe staging landing. Driftwood asks the player to choose that landing while rescuing someone: nearest refuge versus immediate delivery. It combines familiar ideas, rather than introducing a special beaver ability or merely increasing the passenger count.

### Cast

- **Nell:** beaver, 2 spaces; practical boatwright, broad tail, warm brown face and small rope/tool identity. She starts at the low working yard. Her prepared spare ferry belongs to the later protected-boathouse story milestone; it is not cargo and is not built on the endangered dock during play.
- **Fern:** new cream rabbit, 1 space.
- **Oat:** new tan rabbit, 1 space.

Fern and Oat are new residents. Pip, Rue, Moss, Tansy, Lark and Bram remain safely rescued. Stable appearance IDs must keep each character consistent independently of passenger list order. This cove uses at most two rabbits plus one nonrabbit, fitting the existing anchor-count envelope; Nell still requires a real beaver model, portrait and clearance review.

## Mechanical contract

Five nodes; the original four-space ferry and draft table (0 → 1, 1–2 → 2, 3–4 → 3). All passages are bidirectional and cost one action. No current, global turn budget or real-time deadline.

| Node | Pier elevation | Waiting initially | Berth base depth |
| --- | ---: | --- | ---: |
| Harbor | 3; delivery | None | 3 |
| Driftwood Yard | 1 | Nell | 3 |
| High Mooring | 3; safe staging | None | 3 |
| Shallow Bend | No pier | None | 3 |
| Reed Landing | 1 | Fern and Oat | 3 |

| Passage | Base depth |
| --- | ---: |
| Harbor ↔ Yard | 2 |
| Yard ↔ High Mooring | 2 |
| Harbor ↔ High Mooring | 3 |
| High Mooring ↔ Shallow Bend | 1 |
| Shallow Bend ↔ Reed Landing | 1 |

The ferry starts empty at Harbor. Tide rises from 0 to 1 after action 7, flooding both low landings, then to 2 after action 11. High Mooring and Harbor stay safe. The second rise is scenic relief during the homeward portion, not a hidden remaining rescue deadline.

All three required passengers and both low-land deadlines must be visible/inspectable from the start. The safe mooring needs a clearly higher stone/wood platform and readable temporary-landing identity. This is not a carrying-capacity trap: the complete group fits in four spaces once the channel is deep enough.

## Verified primary witness

| Action | Player action | Result that matters |
| ---: | --- | --- |
| 1 | Harbor → Yard | Reach Nell empty. |
| 2 | Board Nell | Load 2; needs depth 2. |
| 3 | Yard → High Mooring | Bring her to the nearby safe landing. |
| 4 | Let Nell ashore | Empty ferry; needs depth 1. |
| 5 | High Mooring → Shallow Bend | Shallow passage is usable empty. |
| 6 | Shallow Bend → Reed Landing | Reach both rabbits before the rise. |
| 7 | Board Fern and Oat together | Boarding happens before the rise; both are safe aboard when tide becomes 1. |
| 8 | Reed Landing → Shallow Bend | Passage now has depth 2, supporting both rabbits. |
| 9 | Shallow Bend → High Mooring | Return to Nell. |
| 10 | Board Nell | Load 4; needs depth 3. |
| 11 | High Mooring → Harbor | Deep return works; second tide rises safely. |
| 12 | Bring all three home | Win. |

One alternative successful delivery order was also replayed: after action 9, take the rabbits to Harbor and deliver them, then return for Nell. That wins in 15 actions. It shares the critical staging rescue; it is **not** represented as a second distinct pre-deadline strategy.

## Temptations and useful failure

1. **Take Nell straight home.** Harbor → Yard → Board Nell → Harbor → Deliver Nell → High Mooring → Bend → Reed Landing loses on action 7, with Fern and Oat still waiting. The final move must preview their flooding before commitment. Undo restores the earlier live state. Earlier Undo allows choosing the nearby mooring instead.
2. **Collect the rabbits first.** Harbor → High Mooring → Bend → Reed Landing → Board both reaches turn 4 with required depth 2. The return still has depth 1 and is correctly blocked without spending an action. Waiting until the rise leaves Nell at the flooded Yard on action 7. The route inspection and shared forecast reveal this tradeoff beforehand.
3. **Board only one rabbit at the last safe action.** At turn 6, boarding Fern alone is legal but loses after the rise because Oat remains waiting. The existing compact danger confirmation must name Oat; cancellation costs nothing. Boarding both saves them before flooding, under the unchanged action ordering.

## Proof and limits

`driftwood-proof/driftwood-mechanics.proposal.json` contains the exact mechanical candidate; geometry fields are intentionally absent. **Do not copy it into production as a complete `.level.json`.** Author actual world/island/route/berth geometry around the proven graph, then rerun witnesses against the final level. No default empty world or placeholder scene counts as completing the task.

`driftwood-proof/run-proof.mjs` imports the unchanged actual `rules.ts` and `Session` implementation using a loader adapter for bundler-style imports and JSON. Node 24.22.1 ran:

```sh
node --experimental-transform-types run-proof.mjs /absolute/path/to/Lastferry
```

The proof replayed 12- and 15-action successes, compared every preview to committed state, checked conservation and one-action group cost, reversed each accepted action and each full Session history, verified the blocked return spends nothing, and reproduced all three losing alternatives. This proves **mechanical Session state** behavior; it does not establish boat-pose, animation, sound, campaign or browser Undo behavior.

A separate breadth-first traversal used production `legalActions`/`reduce`, a 24-action search horizon and turn-key normalization after the final rise at action 11. It visited 237 unique states and found a first winning sequence of length 12. Equivalent final delivery states collapse; the one normalized winning state does not mean there is only one action sequence. The search horizon is not a gameplay budget. No playtime, perceived difficulty or fun claim follows from these numbers.

Initial plain Node execution failed because Session's TypeScript parameter property requires transform mode; rerunning with the flag above passed without changing production source. No visual or browser check was attempted in this proposal proof.

Before accepting the actual cove, Codex still needs route/hull clearance, beaver/portrait identity, transfer poses, camera/controls in both phone orientations, real full rescue with tide/terminal Undo, save migration/progression, and the user's playtest of the intended insight. Preserve the existing three puzzle data sets unchanged.
