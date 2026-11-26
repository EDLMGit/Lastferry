# Orchard Landing — independent difficulty audit

**Reviewed game:** `fb5806a7a129984290c54a9f54e08d5171d0d3d3` · **13 November 2026**  
**Scope:** independent production-rule graph analysis and source review, plus root inspection of two committed native phone frames. No fresh browser playthrough, physical-phone performance test or listening test was performed.

## Review decision

Orin's character direction has positive player feedback. **Orchard's difficulty is not accepted as the next Journey step.** Keep it in Practice and repair the existing cove under [ORCHARD_DIFFICULTY_01](../../NEXT_TASK_ORCHARD_DIFFICULTY.md). The new [difficulty and three-lantern contract](../../docs/DIFFICULTY_AND_MASTERY.md) records the intended progression and later optional reward feature; stars do not substitute for this repair.

## Finding

The player's report of a difficulty dip is consistent with Orchard's structure. The new deer creates a real arithmetic constraint, but the puzzle concentrates its reasoning into one opening lesson and a single collection loop. The two reported pickup orders do not produce two different later plans.

At the authored cost of three spaces, Orin cannot leave through the initial depth-2 passage. The existing implementation tests establish that changing only his cost to two permits taking him first and skipping the return to the orchard. His third space therefore matters. That fact alone does not establish a step up from the accepted Wide and Reef puzzles.

[Authored design](https://github.com/EDLMGit/Lastferry/blob/fb5806a7a129984290c54a9f54e08d5171d0d3d3/reviews/orchard-landing/DESIGN.md) · [Level data](https://github.com/EDLMGit/Lastferry/blob/fb5806a7a129984290c54a9f54e08d5171d0d3d3/data/orchard-landing.level.json) · [Existing proof tests](https://github.com/EDLMGit/Lastferry/blob/fb5806a7a129984290c54a9f54e08d5171d0d3d3/tests/unit/orchard-landing.test.ts)

## What was independently established

The audit enumerated every production `legalActions` transition through `reduce`, retained terminal outcomes and calculated reverse reachability to a win. It did not reimplement the game rules.

- Orchard has four nodes and three edges, forming one branching quay with three leaf destinations. All three passages have the same base depth, 2.
- Its three passengers total exactly the six-space capacity. A successful route need not choose a transport partition or a temporary unloading.
- There are **two shortest ten-action sequences**. The smaller-neighbor pickup orders merge after action five into the same state: Cider Quay, tide 1, Pomme and Sorrel aboard, Orin waiting at Orchard, nobody delivered.
- The two sequences therefore share the same remaining five actions: cross inward, board Orin, cross outward, sail home, unload.
- On one shortest witness, at **turn six** back at the safe orchard with both smaller neighbors, **all five legal immediate actions preserve some winning continuation**. These include waiting or unloading at the safe landing. After boarding the full group at turn seven, the direct final three actions are unpressured.
- By comparison, on Reef Return's shortest witness at **turn eight**, **only one of seventeen legal actions** preserves a win: the homeward crossing. Loading, direction and the last rise remain coupled until that return.

These are statements about the specified states, not universal claims that every legal future Orchard action remains safe. Leaving Orin behind after the last outward reversal can still lose.

The first Orin boarding is a losing commitment even though the reducer initially leaves the state playing. Likewise, a premature trip home after collecting the smaller pair can remain apparently unfinished until the current makes the loss explicit. These give useful Undo recovery, but an experienced player who reads the initial depth and avoids early delivery can solve the remaining loop quickly.

## Structural comparison

| Cove | Minimum actions | Reachable normalized states | Shortest action sequences |
| --- | ---: | ---: | ---: |
| Holding Pier | 9 | 148 | 1 |
| Bellwater | 10 | 121 | 8 |
| Driftwood Yard | 12 | 237 | 1 |
| Two Shelters | 11 | 475 | 16 |
| Wide Berth | 12 | 1,614 | 3 |
| Reef Return | 10 | 516 | 1 |
| Orchard Landing | 10 | 115 | 2 |

**These columns are not difficulty ratings.** The state count changes with passenger IDs, graph size and equivalent subsets; sequence counts include equivalent identities and commuting orders. Wide's three shortest sequences include its symmetric sheep choices. A single solution may be easy to infer or hard to discover. Minimum actions measure route length, not thought required. Human learning from earlier coves also matters.

## Bounded repair direction

Rework the existing `orchard-landing` puzzle while preserving Orin's accepted identity and the current ferry, mobile presentation and six-cove Journey.

Aim for **two coupled planning decisions**: an early load/position choice should change which later transfer or return remains possible. The three-space deer should matter again after the first exit check. For example, the existing draft bands distinguish Orin plus a rabbit (four spaces, depth 3) from Orin plus a two-space neighbor (five spaces, depth 4). The current uniform passages and one final six-space collection do not ask the player to use that distinction.

That example is a design opportunity, not a proven replacement map. Codex should author and verify the exact arrangement. Do not manufacture difficulty by adding an obligatory Wait, blindly tightening every deadline, increasing moves, or expanding the boat. Keep at most the existing one scheduled-current passage and make the relevant facts freely inspectable.

A useful design review should show the actual earlier choice, the later state it changes, and a plausible alternative whose consequence cannot be understood by looking at only the immediately available action. It should compare ordinary board-everyone / nearest-rescue / small-shuttle behavior against the intended dependency. Valid alternate strategies are welcome; a trivial bypass of the whole idea is not.

The reward system should not substitute for this repair. A demanding rescue puzzle and an optional efficiency target are different design layers. The existing accepted Wide and Reef witnesses include 12/14 and 10/11-action routes respectively. Choosing strict optimum for a highest reward can be intentional, but it should be described as optional route mastery; a legitimate longer strategy still completes the rescue.

## Native-image scope

The root review inspected the committed 390×844 start and 780×320 full-load frames at native size. Orin's chestnut deer/antlers and the established yellow/red ferry are recognizable within the accepted presentation. The reported deer/rabbit lower-body overlap remains visible in the mixed-load projection. Preserve the new character direction and ensure revised decision-relevant groups can be identified; this is not an instruction to redesign the boat or camera. The implementation report also retains the portrait action/tree overlap and unresolved portrait-load timeout.

[Portrait start](https://github.com/EDLMGit/Lastferry/blob/fb5806a7a129984290c54a9f54e08d5171d0d3d3/reviews/orchard-landing/390x844/start-play.png) · [Mixed load](https://github.com/EDLMGit/Lastferry/blob/fb5806a7a129984290c54a9f54e08d5171d0d3d3/reviews/orchard-landing/780x320/orin-aboard.png) · [Original implementation verification and limits](https://github.com/EDLMGit/Lastferry/blob/fb5806a7a129984290c54a9f54e08d5171d0d3d3/reviews/orchard-landing/REVIEW.md)

## Continuity note

The authored Orchard rabbit reuses ID/name `sorrel` / Sorrel with tan appearance, while Wide already rescues Sorrel as a cream rabbit. This is a future Journey continuity collision, not an issue with Orin's design. Give Orchard's supporting rabbit a distinct stable identity and keep the accepted Wide character unchanged before any campaign integration.

## Reproduction and provenance

Artifacts:

- [Source manifest](SOURCE_MANIFEST.json) pins ten exact Git blobs: the reducer, level loader and eight authored level JSON files.
- [Portable audit script](PRODUCTION_GRAPH_AUDIT.mjs) reads those files from a checkout, verifies every blob hash, and runs the real reducer in a temporary directory.
- [Full results](PRODUCTION_GRAPH_RESULTS.json) record source SHA-256 hashes, Node version, all summary counts and witnesses, the highlighted choice profiles, and the independently replayed merge of both Orchard pickup orders.

From a checkout of the reviewed commit, with Node 24:

```sh
node /path/to/PRODUCTION_GRAPH_AUDIT.mjs --repo . --out /tmp/last-ferry-orchard-audit
```

Keep `SOURCE_MANIFEST.json` beside the script. A changed source hash fails rather than silently claiming this review applies to another version.

The sole runtime adaptation changes both `'../levels/level'` module specifiers in a **temporary copy** of `src/game/rules.ts` to `'../levels/level.ts'` for Node's TypeScript resolver. The level loader and JSON bytes remain exact; native Node 24 JSON imports are used. No rule function is rewritten. The temporary directory is removed afterward.

After the last scheduled tide change, the key coalesces later turn values while preserving boat location, status and every passenger location. The current rules have no global action cap and no later scheduled change, so this avoids infinite equivalent waits without imposing a search cutoff. It is not a safe default for future rules with additional time-dependent behavior.

The final verified run used **Node v24.22.1** and reproduced all seven results after exact source-hash verification. The source import adaptation and graph analysis are separate from Codex's reported 520-unit and browser checks; this review does not relabel those checks as independently rerun.

