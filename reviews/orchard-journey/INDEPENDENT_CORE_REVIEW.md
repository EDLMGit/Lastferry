# Independent Orchard Journey core review

**Reviewed:** `EDLMGit/Lastferry` at `9c7a05785a021538c996f5dcd4b03415d1a35080`, 14 November 2026. **Disposition:** no blocking defect found in the inspected registry, progress compatibility and pure story/mastery lifecycle.

## Exact-source preservation

Thirty-four extracted source, dependency and test files were fetched at the reviewed SHA and verified byte-for-byte against their Git blob hashes. `FRESH_SOURCE_MANIFEST.json` also records SHA-256 values. No source or import adaptation was needed.

All twenty production reducer, level-loader, level-data and witness inputs match the accepted `9933303178da04cac93ddc820ef55e181286d983` audit exactly. Their minimum proofs and accepted routes remain applicable. The complete mastery module and Session remain byte-identical to reviewed `14f128619267e2da81b4108ece2de4da07b50359`. Orchard's shared record is still `orchard-landing@1`, with target **13**, preserving the accepted twelve- and thirteen-action approaches. All eight target identities remain unchanged.

## Fresh bounded execution

| Exact committed test file | Passed | Failed |
| --- | ---: | ---: |
| `orchard-progress.test.ts` | 22 | 0 |
| `story-progress.test.ts` | 64 | 0 |
| `story-presentation.test.ts` | 19 | 0 |
| `mastery.test.ts` | 44 | 0 |
| **Total** | **149** | **0** |

The checks freshly cover exact old-six identity recognition; explicit continuation; raw-byte backups and occupied backup slots; thrown and silent backup/primary write failures; a newer primary checkpoint appearing before or during backup; prior historical routes; all fifteen valid seven-cove boundaries; malformed/future saves; pending-scene recap; bounded cues through Pause/Skip/Reduced Motion/cancellation; real-format accepted Practice mastery surviving the extension; terminal Undo/redelivery and a worse Journey result retaining the earlier best. The mastery suite also replays all twenty-four accepted winning witnesses through Session.

The registry appends Orchard and its entry after Reef. The old-six compatibility rule recognizes the exact known completion and acknowledgment arrays. It uses the distinct `.before-orchard` backup namespace while preserving existing earlier backup slots. Ordinary reads do not migrate the record. Conversion retains the existing checks before and after backing up, and failure keeps the continuation usable for the visit. These findings are consistent with the new focused cases.

Environment: Linux, Node **v24.22.1**, Vitest **5.0.5**. Matching existing local dependencies were reused. This bounded execution did not rerun the five inventory checks, a full build, a browser suite or the full historical unit suite. It therefore reports **149**, separately from the implementation's reported **154** checks including inventory.

## Reproduction and artifacts

From a checkout of the reviewed SHA with its dependencies installed:

```sh
npm run test:unit -- tests/unit/orchard-progress.test.ts tests/unit/story-progress.test.ts tests/unit/story-presentation.test.ts tests/unit/mastery.test.ts --maxWorkers=1 --reporter=json --outputFile=/tmp/last-ferry-orchard-core.json
```

`FRESH_CHECKS.json` is the compact summary; `fresh-core-results.json` retains the complete original fresh Vitest output; `FRESH_SOURCE_MANIFEST.json` pins the extracted inputs. Keep this evidence separate from the earlier source manifests and recordings.

The pure tests establish scene timing and ownership, not the Orchard painting's visual quality or audible effect. Actual navigation/acceptance integration, native image inspection, physical Android performance, speaker listening and spoken screen-reader verification are separate scopes. No repository source, commit, PR, Site or audience was modified by this review.
