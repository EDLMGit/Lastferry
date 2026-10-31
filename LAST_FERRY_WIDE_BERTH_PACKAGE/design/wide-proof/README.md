# Wide Berth — proposed mechanical contract and proof

**Status:** one proposed C4 encounter for the six-space milestone, not shipped content. Baseline: `7e324e88827857469bf348fca311548344d03da6`. No production file was edited by this proof. The JSON deliberately omits world geometry; it must not be installed as a complete playable level without authoring and checking that geometry.

## Decision

**Carry the first six-space group home through deep water and return for the second landing just in time, or leave a deliberate subset safely at High Quay so a lighter rescue can use the shortcut.**

The first group is six spaces, so the new ferry's benefit is demonstrated before the tradeoff. The four-space ferry could not perform this pickup. The common opening takes the loaded boat along the forgiving deep Wide Berth–High Quay passage. The fork at High Quay then makes the draft-four band matter while another required pair still waits at a landing with a known flood time.

Two full successful plans differ in the critical rescue, not just in an optional delivery after everybody is safe. The full-load plan delivers the first group before rescuing the low pair. The staging plan rescues the low pair before making any delivery. A slower safe variation and two optional entry pauses are also demonstrated.

This replaces the earlier C4 concept of an entirely forgiving introductory cove with a substantial, single authored challenge. It introduces the six-space boat and fourth draft band only: no new species, current, action budget, packing rule, real-time timer or hidden exception. Its relative difficulty and appeal still require human playtesting.

## Exact contract

Five nodes, five ordinary bidirectional edges, four piers. All destination berths/waypoints have base depth **4**. All moves, boards, unloads and Waits cost one action. A board or unload may select any nonempty legal subset, as in the production rules.

| Ferry load in spaces | Required draft |
| ---: | ---: |
| 0 | 1 |
| 1–2 | 2 |
| 3–4 | 3 |
| 5–6 | 4 |

| Passage | Base depth | Depth at tide 0 / 1 / 2 |
| --- | ---: | --- |
| Harbor ↔ High Quay | 2 | 2 / 3 / 4 |
| High Quay ↔ Shell Landing | 2 | 2 / 3 / 4 |
| High Quay ↔ Wide Berth | 4 | 4 / 5 / 6 |
| High Quay ↔ Outer Buoy | 4 | 4 / 5 / 6 |
| Outer Buoy ↔ Harbor | 4 | 4 / 5 / 6 |

The two-edge High Quay → Outer Buoy → Harbor route is the deep alternative to the one-edge Harbor shortcut. Outer Buoy has no pier. High Quay is the safe staging pier, not a second delivery destination.

| Pier | Elevation | Initial waiting group | Flood behavior |
| --- | ---: | --- | --- |
| Harbor | 3 | Empty | Delivery; dry through the final tide |
| High Quay | 3 | Empty | Safe staging; dry through the final tide |
| Wide Berth | 1 | Alder, Clover, Poppy, Wren: **6 spaces** | Floods after action **5** |
| Shell Landing | 2 | Sorrel, Finch: **2 spaces** | Floods after action **10** |

Initial tide is 0. Rise to 1 after action 5; rise to 2 after action 10; remain at 2 afterward. Current action legality uses current tide. Apply the selected action, then increment the turn, apply any tide rise, check flooded waiting passengers, and check victory. This is the unchanged reducer order. Boarding a whole waiting group on its flood action saves it. Merely arriving on that action leaves it waiting and loses.

Start at Harbor, empty. All six named neighbors must be delivered to Harbor. Capacity counts eight total required spaces spread across the six neighbors; it does not allow all eight aboard at once.

| Stable new ID / display name | Species | Spaces | Initial pier | Explicit existing appearance |
| --- | --- | ---: | --- | --- |
| `alder` / Alder | Sheep | 2 | Wide Berth | `sheep-wool` |
| `clover` / Clover | Sheep | 2 | Wide Berth | `sheep-wool` |
| `poppy` / Poppy | Rabbit | 1 | Wide Berth | `rabbit-cream` |
| `wren` / Wren | Rabbit | 1 | Wide Berth | `rabbit-tan` |
| `sorrel` / Sorrel | Rabbit | 1 | Shell Landing | `rabbit-cream` |
| `finch` / Finch | Rabbit | 1 | Shell Landing | `rabbit-tan` |

These are proposed new neighbors using established species and appearance families. Pip, Rue, Moss, Tansy, Lark, Bram, Nell, Fern and Oat remain rescued; none is silently stranded again. Explicit passenger IDs and appearance fields must remain stable under list reordering; existing mappings are preserved.

## Two distinct critical plans

Both begin with this readable six-space pickup:

| Action | Move / transfer | Result |
| ---: | --- | --- |
| 1 | Harbor → High Quay | Empty |
| 2 | High Quay → Wide Berth | Empty |
| 3 | Board Alder, Clover, Poppy and Wren together | **6 spaces, draft 4**; four bodies |
| 4 | Wide Berth → High Quay | Full load crosses depth 4 safely; low pair still waiting |

### A. Full delivery by the deep route — 13-action witness

| Action | Move / transfer | Why it matters |
| ---: | --- | --- |
| 5 | High Quay → Outer Buoy | Full draft 4 uses base-depth-4 passage; first rise follows this action |
| 6 | Outer Buoy → Harbor | The full group returns by the deep detour |
| 7 | Deliver all four first-group neighbors | A satisfying six-space first delivery |
| 8 | Harbor → High Quay | Empty return through depth 3 |
| 9 | High Quay → Shell Landing | Arrive before the second rise |
| 10 | Board Sorrel and Finch together | Last-safe boarding; the pier floods after they are aboard |
| 11 | Shell Landing → High Quay | Two spaces aboard |
| 12 | High Quay → Harbor | Return |
| 13 | Deliver Sorrel and Finch | Won |

One extra action before the low pair is boarded makes this exact full-delivery plan fail. This is a consequence of the occupied low landing, not a global action limit. A blocked click adds no action.

### B. Stage the sheep, rescue early, return light — 14-action witness

| Action | Move / transfer | Why it matters |
| ---: | --- | --- |
| 5 | Unload Alder and Clover at High Quay | Stage 4 spaces safely; retain Poppy and Wren, load 2; first rise follows |
| 6 | High Quay → Shell Landing | Reach the low pair with room aboard |
| 7 | Board Sorrel and Finch | Four rabbits now use **4 spaces, draft 3**; low pier is clear three actions before its flood |
| 8 | Shell Landing → High Quay | Depth 3 supports the loaded return |
| 9 | High Quay → Harbor | The one-edge shortcut is exactly **depth 3**, while the ferry is draft 3 |
| 10 | Deliver all four rabbits | Second rise; all remaining neighbors are safely staged |
| 11 | Harbor → High Quay | Empty |
| 12 | Board Alder and Clover | Four spaces |
| 13 | High Quay → Harbor | Return |
| 14 | Deliver both sheep | Won |

This shares the first pickup with A, then changes both staging and rescue/delivery order while the low pair is still endangered. It is not merely an optional late delivery variant. The extra action in its full witness buys an earlier low-pair rescue.

Two extra entry Waits can still be recovered by this staging approach: board the wide group at action 5, reach High Quay at 6, stage at 7, and board the low pair at 9. That 16-action witness is included. It establishes concrete opening slack, not a claim that every arbitrary detour is recoverable.

## Temptations, blocked actions and recovery

| Choice | Verified consequence |
| --- | --- |
| Take the direct Harbor shortcut with the six-space group at High Quay, turn 4 | Blocked: depth 2 is below draft 4. State, turn, history and busy flag remain unchanged. |
| Wait once at that fork for the first rise, then try the full shortcut | Still blocked: depth 3 is below draft 4. |
| Wait with the full first group until the shortcut reaches depth 4 | Shell Landing floods at action 10 while Sorrel and Finch still wait; lost. The same failure occurs after safely staging the first group and then waiting. |
| At turn 9, move through depth 3 because the next action will raise it to 4 | Rejected. Move legality cannot anticipate the post-action rise. |
| Take the full deep route after one extra Wait | Arrive at Shell Landing on action 10; its pair is still waiting and floods before a boarding action. Undo to the fork and the timely full plan succeeds. |
| Rescue the low pair first | Earliest route reaches Wide Berth on action 5; its waiting group floods before boarding. |
| Take only four spaces from Wide Berth and return | The left-behind sheep is still waiting when the first rise arrives; lost. |
| At High Quay, unload just one rabbit | Remaining load is 5 spaces, still draft 4. The depth-3 route to Shell Landing stays blocked. |
| At last-safe low boarding, select only Sorrel | Finch is left waiting and the action loses. Terminal Undo restores the exact pre-boarding state; selecting both then completes the winning plan. |

There is also a legitimate five-body variation: stage one sheep, retain four spaces, pick up both low rabbits to reach six spaces, then Wait at Shell Landing until the second rise. The full return is initially blocked, but both endangered piers are already empty, so those three Waits are harmless. Return five bodies occupying six spaces, deliver them, and collect the staged sheep. This 17-action witness is included because it is a legal state the implementation must render. It does **not** let initial waiting dissolve the puzzle: the earlier six-space rescue and deliberate staging have already happened.

No global limit should be added to forbid harmless late waiting. After the required groups are aboard, safely staged or delivered, later thinking and safe actions remain legal under the existing rules.

## Forecast and presentation requirements

The player must be able to inspect both pier flood actions, current tide, post-action rise and remaining waiting group before committing. Keep the full draft table visible or directly accessible. Display **6 spaces / draft 4**, not a misleading six-animal capacity claim. Show current route depth, required draft and the blocked reason; after the first rise, explicitly distinguish depth-3 shortcuts from deep water.

At the critical High Quay fork, a player should be able to inspect the deep return, the shorter blocked Harbor passage, the route to the waiting low pair, and the safe temporary landing without camera hunting. Name High Quay as safe through both known rises. Boarding and partial-unloading previews must show the resulting load/draft and any immediate flood loss. A confirmation forecast must distinguish arriving at a pier on its flood action from boarding the waiting passengers on that action.

The map has five nodes so this can be authored compactly. The proof does not establish real hull clearance or phone readability. The spatial scene must give both deep-route directions enough room for the larger ferry and preserve readable shallow/deep alternatives; do not squeeze the larger boat into old reference-radius geometry.

## Actual presentation scope this encounter exercises

- Four bodies occupying six spaces during the mandatory opening pickup.
- Four rabbits together on deck in the light-return plan.
- **Five bodies occupying six spaces** in a verified legal successful variation: one sheep and all four rabbits.
- Either sheep aboard/staged independently and every legal passenger subset; stable automatic positions must not depend on rabbit list order or a single generic nonrabbit anchor.
- **All six neighbors may legally wait together at High Quay** after staged transfers. Its shore roster, model positions and transfer paths must accommodate that state, even though the main witnesses do not require it.
- Two same-species sheep with separate identities and four rabbits reusing the existing two appearance families. Existing portrait, scene and model mappings must stay aligned under reorderings.
- Bound this task's seating coverage to every capacity-legal subset of the actual two-sheep/four-rabbit roster, whose maximum aboard is five bodies. A future cove with six one-space passengers must add its own placements and coverage when authored; no six-rabbit fixture or general fleet system is required now.

No new species model is needed. The larger hull, deck, dynamic copy, seating and paths are real implementation work; this proof cannot validate them. The current over-capacity error still says “four passenger spaces.” That is a known existing hardcode to fix in the milestone, not an alteration made by this proof.

## Proof method and limits

To reproduce the proposal check, run from the actual Lastferry repository root with Node 24:

```sh
node --experimental-transform-types LAST_FERRY_WIDE_BERTH_PACKAGE/design/wide-proof/run-proof.mjs .
```

The script imports the **unchanged** production `src/game/rules.ts` and `src/game/session.ts`. Node's TypeScript transform and a loader adapt extensionless imports and JSON loading only. The original four level JSON imports must be present because `src/levels/level.ts` loads them at module initialization. No surrogate reducer or rules reimplementation is used.

The bundled results were produced against the audited baseline source. The runner requires an explicit repository-root argument and writes `proof-results.json` and `witnesses.json` beside itself. Preserve the bundled baseline results before rerunning. `referenceBaseline` identifies the reviewed starting point; `sourceIdentities` identifies the actual files exercised and must be compared if using a newer checkout. The supplied proposal remains the input even after the new level exists. Final implementation acceptance must additionally load and exercise the actual authored level, with its own current source/data identities; rerunning only this candidate is insufficient.

Focused execution checks all four success witnesses, five losing alternatives, five blocked actions, both exact flood-boundary boardings, unchanged previews and rejected actions, busy-input rejection, passenger conservation, complete state Undo after every successful action, terminal Undo, and recovery from a losing branch. Result records include source SHA-256 identities.

The reachability search enumerated **7,620 normalized states**, with **2,169 terminal loss states**, **1 terminal winning state** and **zero depth cutoffs** at an action-depth bound of **26**. One normalized winning state does not mean one solution: all complete rescues end at Harbor with the same delivered identities. The first found successful sequence has 13 actions. Witness lengths are not playtime or difficulty ratings.

The search enumerates actual `legalActions`: Wait, every legal adjacent move, and all nonempty board/unload subsets. Its state key sorts passenger arrays by identity and clamps the turn at 10 after the final authored tide change; actual reducer turns remain unchanged. It also includes a `carriedSix` trace flag. This prevents histories that have and have not demonstrated the new capacity from being conflated for that property. Every surviving state at the first rise has already carried six spaces. Maximum reachable aboard load was 6 spaces and maximum body count was 5. No frontier was cut off by the stated depth bound after normalization.

The complete mechanical graph exploration does not validate spatial routes, hull/passenger dimensions, motion, transfer clearance, scene composition, campaign/save integration, captions, assets, browser behavior, responsive UI, human comprehension, fun or a difficulty increase. Those remain explicit milestone acceptance work.

## Files

- `wide-berth-mechanics.proposal.json`: exact non-spatial contract.
- `run-proof.mjs`: unchanged-production replay and bounded reachability harness.
- `witnesses.json`: machine-readable success and failure action sequences.
- `proof-results.json`: complete traces, boundary checks, normalized search counts and source identities.
