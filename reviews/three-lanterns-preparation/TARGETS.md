# Three-lantern action targets — independent audit

**Source:** EDLMGit/Lastferry at `9933303178da04cac93ddc820ef55e181286d983`. **Reviewed:** 14 November 2026. This read-only audit documents the accepted authored efficient-action targets. It changes no game or save.

The audit freshly enumerated the eight existing coves using their production `legalActions` and `reduce`. It verified twenty exact Git blobs and replayed all **24 committed winning witnesses**. All replayed actions were accepted and all witnesses ended won. Node v24.22.1 was used; the only source adaptation adds the `.ts` extension to the reducer's two temporary loader module specifiers.

| Cove | Proved minimum | Accepted target | Reason |
| --- | ---: | ---: | --- |
| First Crossing — optional Practice | 7 | **8** | Includes the two seven-action approaches and the authored eight-action Harbor-first route. |
| Holding Pier | 9 | **9** | The canonical nine-action rescue captures the useful staging/retrieval plan without an extra delivery or idle turn. |
| Bellwater | 10 | **10** | All eight committed witnesses take ten actions: both route directions, several useful tide waits and separate rabbit boarding all qualify. |
| Driftwood Yard | 12 | **12** | Rewards the grouped final delivery. The fifteen-action rabbits-first delivery stays valid but adds a home trip after the same critical rescue plan. |
| Two Shelters | 11 | **12** | Includes low refuge, high refuge and the twelve-action high-refuge mixed-first plan. |
| Wide Berth | 12 | **14** | Includes both the inner-channel twelve-action plan and the fourteen-action deep outer approach with a different early group. |
| Reef Return | 10 | **11** | Includes the gather-first plan and the distinct early-heavy-delivery approach. |
| Orchard Landing | 12 | **13** | Includes the accepted staging and Spring Steps retrieval plans. The player has accepted the repair and this developer target is now adopted. |

## The one deliberate exclusion

Driftwood's `stage-nell-deliver-rabbits-first` witness has fifteen actions. Its own description identifies it as the **same critical rescue plan**, followed by a different safe delivery order, rather than another distinct critical strategy. A target of twelve makes combining the final homeward load the efficiency achievement. The fifteen-action rescue still earns the ordinary rescue lantern and full story progress.

This is a conscious authored choice. Do not silently choose fifteen just because it is the longest supplied successful witness; equally, do not present twelve as the only legitimate rescue. If the product direction decides every supplied delivery order should qualify, fifteen is a feasible alternative, but it reduces this cove's efficiency distinction.

## Interpretation

Targets are not all minimum-plus-one and are not maxima over arbitrary winning paths. Some equal the optimum because the accepted useful strategies already fit it; others include a strategically different authored route. Infinite harmless waits remain legal, so “all successful paths qualify” would not be a meaningful efficiency target.

The minimums and replays are mathematical facts for these exact inputs. The accepted target values are design decisions, not measurements of human difficulty. No browser, visual or physical-device checks were performed by this audit.

First Crossing should remain an optional Practice record, separate from the eventual twelve-cove Journey total. Orchard can now earn mastery in Practice after its positive player acceptance without changing Journey order or save bytes.

## Artifacts and reproduction

- `SOURCE_MANIFEST.json`: twenty pinned source/data/witness blobs.
- `target-audit.mjs`: portable Node 24 review script.
- `TARGET_AUDIT.json`: eight graph summaries, target decisions and all replayed witnesses.

Keep the manifest beside the script. From a checkout containing the reviewed runtime and witness files:

```sh
node /path/to/target-audit.mjs --repo . --out /tmp/last-ferry-lantern-targets
```

The script fails if the pinned source differs. It copies the real reducer and loader/data to a temporary directory, adapts module resolution only, and removes those temporary files afterward. It normalizes turn values only beyond the last scheduled rise, where the present rules have identical future behavior. There is no search-depth cutoff.

## Source paths

All links are pinned to the reviewed implementation:

- [First Crossing replays](https://github.com/EDLMGit/Lastferry/tree/9933303178da04cac93ddc820ef55e181286d983/data/replays)
- [Holding witness](https://github.com/EDLMGit/Lastferry/blob/9933303178da04cac93ddc820ef55e181286d983/data/experiments/holding-pier-solution.json)
- [Bellwater witnesses](https://github.com/EDLMGit/Lastferry/blob/9933303178da04cac93ddc820ef55e181286d983/data/bellwater/witnesses.json)
- [Driftwood witnesses](https://github.com/EDLMGit/Lastferry/blob/9933303178da04cac93ddc820ef55e181286d983/data/driftwood-yard/witnesses.json)
- [Two Shelters witnesses](https://github.com/EDLMGit/Lastferry/blob/9933303178da04cac93ddc820ef55e181286d983/data/two-shelters/witnesses.json)
- [Wide witnesses](https://github.com/EDLMGit/Lastferry/blob/9933303178da04cac93ddc820ef55e181286d983/data/wide-berth/witnesses.json)
- [Reef witnesses](https://github.com/EDLMGit/Lastferry/blob/9933303178da04cac93ddc820ef55e181286d983/data/reef-return/witnesses.json)
- [Orchard witnesses](https://github.com/EDLMGit/Lastferry/blob/9933303178da04cac93ddc820ef55e181286d983/data/orchard-landing/witnesses.json)

