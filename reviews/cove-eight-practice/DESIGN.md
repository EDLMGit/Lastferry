# Ternhaven — C8 Practice design and proof

Ternhaven is an independent, unscored Practice candidate. The seven-cove Journey, accepted targets and save identities do not change. Its question is **whether to leave the waiting group above the tide or beside the deep approach, and how that choice changes the return**. Human difficulty and Journey placement remain unreviewed.

## What Orchard did not require

Orchard asks the player to partition the early delivery so that a later mixed load fits its current crossing. Ternhaven retains a concrete delivery obligation, then makes **the temporary group's location determine which later pickup and return approaches work**. A correct early load alone is insufficient. A safe location alone also fails if the heavy group is collected before the shallow approach to Willow.

There are four familiar bodies, eight total spaces: Juniper the deer (3), Sedge the sheep (2), Fennel the rabbit (1), Willow the beaver (2). Juniper, Sedge and Fennel start aboard the accepted six-space ferry at Tern Buoy; Willow waits at Reed Landing. These are new identities, using accepted species and appearances.

## Authored mechanics

All five stopping basins have base depth 4. Harbor and High Bank have elevation 3; Tern Steps and Reed Landing have elevation 2. Tide rises after actions 4 and 10, to levels 1 and 2. The two low landings therefore flood after action 10. The action is applied before that flood.

| Passage | Base depth | Direction |
| --- | ---: | --- |
| Harbor–Tern Buoy, Tern Reach | 2 | Homeward at tide 0, outward at tide 1, homeward at tide 2 |
| Tern Buoy–High Bank | 4 | Both |
| Tern Buoy–Tern Steps | 4 | Both |
| Tern Buoy–Reed Landing | 1 | Both |
| Tern Steps–Reed Landing | 4 | Both |

This is one current passage, with a phase for every tide. Existing capacity, draft bands, passenger costs, transfer rules and return checks are unchanged. The source of truth is [the level](../../data/ternhaven.level.json); production mechanics are in [rules.ts](../../src/game/rules.ts).

## Three real winning plans

[The committed witnesses](../../data/ternhaven/witnesses.json) replay through the actual reducer and Session. Each starts by moving to its chosen staging landing, leaving Juniper and Fennel there, returning to Tern Buoy, sailing Sedge home on action 4, delivering Sedge, then returning outward on action 6. The early load is two spaces; the later offshore group is six spaces.

| Action | Safe high bank, 14 | Low deep first, 14 | Low direct return, 13 |
| ---: | --- | --- | --- |
| 1 | Sail High Bank | Sail Tern Steps | Sail Tern Steps |
| 2 | Leave Juniper + Fennel | Leave Juniper + Fennel | Leave Juniper + Fennel |
| 3 | Sail Tern Buoy | Sail Tern Buoy | Sail Tern Buoy |
| 4 | Sail Harbor; current turns outward | Same | Same |
| 5 | Bring Sedge home | Same | Same |
| 6 | Sail Tern Buoy | Same | Same |
| 7 | Sail Reed Landing empty | Sail Tern Steps | Sail Reed Landing empty |
| 8 | Board Willow (2) | Board Juniper + Fennel (4) | Board Willow (2) |
| 9 | Sail Tern Buoy lightly loaded | Sail Reed Landing by deep link | Sail Tern Steps directly |
| 10 | Sail High Bank; low landings flood | Board Willow (6), then flood | Board Juniper + Fennel (6), then flood |
| 11 | Board Juniper + Fennel (6) | Sail Tern Steps by deep link | Sail Tern Buoy |
| 12 | Sail Tern Buoy | Sail Tern Buoy | Sail Harbor |
| 13 | Sail Harbor | Sail Harbor | Bring remaining group home |
| 14 | Bring remaining group home | Bring remaining group home | — |

The high route buys retrieval after the flood, but Willow must be collected light before loading the staged four. The low deep-first route instead collects the staged group first, reaches Willow on the deep link, and leaves through that same deep link fully loaded. Both converge at Tern Buoy on action 12, after their consequential choices. They are not symmetric renamings or interchangeable pickup permutations.

The shorter low direct-return route is legitimate freedom discovered by exhaustive search: use the shallow passage light, then return directly from Willow to the low staging group. It collects that group on the final dry action. It is included rather than suppressed to preserve a preferred script.

## Two linked dependencies and their failures

**Initial delivery/load.** At High Bank after action 1, all seven nonempty unloading subsets are legal. Only unloading Juniper + Fennel leaves a winning continuation. Leaving only Juniper is legal on action 2 and the game is still playing, but Sedge + Fennel require depth 3 while Tern Reach has depth 2. Returning to the buoy on action 3 exposes that blocked crossing. Waiting to action 4 reverses the current with all eight spaces still offshore and only one six-space return remaining: production reports `RETURN_CAPACITY`.

The whole continuation graph after the wrong action 2 has 21 canonical states and 45 transitions, with zero wins. This is an exhaustive branch result, not a conclusion from that one failure script. All viable initial Harbor deliveries contain Sedge alone. Some high-bank continuations legitimately delay unloading Sedge until action 6 or 7; the deadline still requires timely Willow pickup.

**Placement/return access.** Both High Bank and Tern Steps are valid early staging choices. With either placement, reaching Willow empty at action 7 and boarding on action 8 remains viable. From Reed Landing, returning via the buoy on action 9 is correct for the high-bank plan but loses every continuation for the low-bank plan: it cannot both reach the low steps and board the waiting group before the action-10 flood. The state is still playing on action 9. All five descendants are exhausted; four are terminal losses and none is a win. Sailing to Tern Steps on action 10 visibly floods Juniper and Fennel before another transfer is possible.

The low-bank plan remains viable through action 8 because the direct deep approach to Tern Steps can still save it. It is the action-9 approach choice, rather than the mere initial low placement, that removes the last winning continuation.

**The high route is not automatically solved by its safe landing.** Boarding Juniper + Fennel first at High Bank on action 8 also loses every continuation, while the state is still playing. At the buoy on action 9 the shallow passage has depth 2 against draft 3. Waiting for deeper water floods Willow after action 10; taking the deep detour cannot board Willow in time. The complete branch has 15 states, 26 transitions and zero wins. Merely visiting High Bank on action 7 is still recoverable: the commitment is boarding the heavy group on action 8.

## Isolated developer counterfactuals

The audit changes one mechanical value per developer copy; neither copy is shipped.

| Change only | Previously failing plan | Result |
| --- | --- | --- |
| Tern Steps elevation 2 → 3 | Low staging, Willow first, return via buoy on action 9 | Can reach steps on action 10, board on 11 and win on 14 |
| Tern Reach base depth 2 → 3 | Leave only Juniper on action 2; take Sedge + Fennel home first | Can cross on action 4, collect Willow light, return for Juniper and win on 14 |

Thus the location deadline independently causes the low approach failure, and the initial load/depth comparison independently causes the wrong-subset failure. Changing the location does not fix the wrong early load. Changing the early depth does not remove the low landing's action-10 flood.

## Bypasses and useful freedom

All checks use the complete production action set, including every nonempty passenger subset, waiting and all ordinary detours.

- No temporary unloading: no win. The opening full load cannot cross the current, and collecting all eight spaces aboard is impossible.
- No early partial Harbor delivery: no win. Eight offshore spaces cannot use the single final six-space homeward trip.
- Park or wait until the final tide before making any pickup: no win; Willow floods. An opening wait is also already unwinnable, although the runtime does not invent an early solver-based loss.
- Avoid the shallow passage entirely: the low deep-first witness still wins in 14. This is an intended alternative.
- Avoid the deep link entirely: the high-bank witness still wins in 14. The full boat never needs the shallow Reed return on that route.
- Forbid initial high-bank staging: minimum remains 13. Forbid initial low staging: minimum becomes 14. Both locations carry real winning strategies.
- At Reed Landing with the full six-space load after action 10, the direct passage has depth 3 versus draft 4. That move is blocked, but the deep return through Tern Steps remains legal. This state is **not** described as unwinnable.

## Exact proof and proposed target

Run from the repository root with Node 24:

```powershell
node --experimental-transform-types reviews/cove-eight-practice/audit.mjs > reviews/cove-eight-practice/audit-results.json
npx vitest run tests/unit/ternhaven.test.ts
```

The audit uses production `legalActions`, `reduce`, `preview` and `Session`; it does not implement alternative game rules. Breadth-first enumeration exhausts 347 canonical states and 874 transitions. Reverse distance from all wins proves **minimum 13**, including exhaustion of every shorter path. No arbitrary depth cutoff is used. The level's historical `searchDepthLimit` metadata does not bound this audit.

Time is retained exactly through action 10. Afterwards all tide/current phases are final. The key retains tide, boat location, status/loss, all passenger identities and locations, and delivery state, while normalizing only the now-irrelevant absolute turn. Future production legality and outcomes are equivalent on this plateau. Distances count additional actions normally. Attempt Undo history is verified separately through Session and is not a puzzle-state transition.

The proposed efficient target is **14**, separate from the proved minimum of 13. It admits both strategically different fourteen-action plans as well as the direct thirteen-action approach; no artificial delay or poor plan was added to justify the number. The target remains only in developer evidence. Ternhaven is absent from the accepted mastery table and has no lantern result or best-storage write.

The audit records source SHA-256 values and a mechanics-only digest in [audit-results.json](audit-results.json). World authoring may change geometric source hashes without changing this mechanical proof; the audit is rerun against the final file. Counts describe coverage, not human difficulty.

## Undo and verification boundary

The production Session replays all three winners with pure preview/commit agreement and passenger conservation, then performs terminal Undo and redelivery. The early wrong-subset branch is played to its real action-4 capacity loss; three successful Undos restore the exact action-1 state, including tide, aboard identities and waiting groups. Choosing the correct subset then wins. The focused tests also recover the low approach error from terminal flood to action 8, choose the direct route and win; they undo/replay both tide boundaries and enumerate all seven final unloading subsets.

`tests/unit/ternhaven.test.ts`: 8 tests passed. The mathematical audit does not establish phone composition, human challenge, Android touch or listening quality. The parent [review](REVIEW.md) records actual UI evidence and remaining device limits. Original authoring/harness errors are retained in [ORIGINAL_FAILURES.md](ORIGINAL_FAILURES.md).
