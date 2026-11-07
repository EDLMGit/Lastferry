# Two Shelters Practice candidate — review

## Disposition

Independent playable candidate for user review, not an accepted campaign replacement. The root Journey remains Holding → Bellwater → Driftwood → Wide. Private Site version14/game `2e4f99268da4691b315fe8467d9e539cda15e927` is unchanged; this pass does not deploy.

The original four-space ferry carries Hazel and Bracken, two beavers using the existing model and two-space cost. Mica is an existing cream-rabbit archetype with a new independent name. Low Landing is convenient but its later flood constrains retrieval order. High Refuge requires an initial crossing and allows a mixed first delivery safely. Both are verified choices; neither introduces a rule or arbitrary action deadline. [DESIGN.md](DESIGN.md) records the exact contract, four winning witnesses and concrete losing alternatives. Human playtest must decide whether this is satisfying enough to become C4.

## Source and environment

- Repository/PR: https://github.com/EDLMGit/Lastferry / https://github.com/EDLMGit/Lastferry/pull/1; branch `m1-first-crossing`, PR remains draft.
- Implementation commit: `e4694baeeb0ef64f6c1c0fada3b3e9027bddf277`. `packaging-audit.json` matches all 77 captured source/data/package inputs to that Git content: 70 byte-exact and seven differing only in CRLF normalization. All 53 selected native image/movie files match Git byte-for-byte. The following handoff commit adds only this audit, report/continuity text and the final machine-readable browser result.
- Started clean at continuity `98f9713b1a69474b4066cca8f336cb8c4ca21a50`, preserving reviewed runtime `2e4f99268da4691b315fe8467d9e539cda15e927`. No reset. Main remains `386de54d20fdd4a513a06115471d70bf94738cc0`.
- Exact task originally resolved at `C:/Users/ernes/Documents/last-ferry-codex-starter/LAST_FERRY_TWO_SHELTERS_PROTOTYPE_PACKAGE/NEXT_TASK_TWO_SHELTERS_PROTOTYPE.md`; the unchanged supplied package is retained beside package.json in the actual `Lastferry` Git root.
- Evidence was captured from that base plus identified working-tree changes, before commit. `final/source-before.json` and `source-after.json` identify runtime/data/package inputs; the packaging audit ties those inputs to committed Git content. Earlier attempts remain explicitly historical.
- Windows, Node 24.15.0, npm 11.12.1, Playwright Chromium 156.0.8078.4 / ANGLE SwiftShader, DPR 1. Mouse, normal keyboard and emulated touch; no physical phone claim.
- Native viewports:390×844,780×320,320×740,844×390,1440×900. Dev URL `http://127.0.0.1:5270/?cove=two-shelters`; unchanged root Journey `http://127.0.0.1:5270/`.

## Implementation and preservation

One authored four-node level reuses the existing lighthouse, cottage, stone/bell refuge, reeds, water and portraits. Routes use the same canonical curves for motion, dots, highlighting and depth. The deep return goes west of the shallow bank, preserving truthful geography and deeper node pockets. The Reed node was brought north after native portrait inspection to reduce empty water above the active group.

Candidate-only automatic deck anchors fit two unchanged beaver bodies on the original ferry. Subset changes move an already-aboard anchor during the existing transfer presentation. Separate shore lanes and a short fitted wooden connection support sequential transfers; ordinary four-space coves and Wide retain their prior models, anchors and transfer paths. Animals are not shrunk. Geometry checks use actual model meshes, both berth headings and all original draft bands. Sampled contact is not foot IK or a continuous swept-volume proof.

The shared registry adds Practice only. Story identifiers/order, launch, progression validator, save format and all five prior level contracts are unchanged. The candidate cannot be acknowledged as a campaign cove. Save-isolation checks retain exact representative record bytes; merely viewing Practice/Home does not write a checkpoint.

All79 asset IDs remain. Existing families record reuse and candidate provenance; no species, portrait family, boat, story scene or decorative image background was created. `preservation-review.json` records protected inputs and the narrow candidate-only label branch. Earlier source, publication receipts and negative Wide difficulty/visual feedback remain intact.

## Verification

| Check | Result | Actual coverage |
| --- | --- | --- |
| `npm run build` (includes `npm run typecheck`) | Pass | Node 24 production assets and TypeScript. `build-final.txt`. |
| `npm run test:unit` | Pass, 428 tests in 45 files | Production reducer witnesses/non-bypass traversal; all existing units; candidate rule conservation/Undo, seven legal rosters, body/cabin clearance, sampled foot support, canonical route/coast clearance, bank/node-pocket truth and strict Practice isolation. `unit-final.txt`. |
| `npm run check:assets` | Pass, 79 families | All original IDs; nine families updated, other 70 entries unchanged. `assets-final.txt`, `preservation-review.json`. |
| First completed browser batch | Pass, 12/12 | Both real phone rescues, five native sizes, four save-isolation cases, keyboard/touch/fullscreen/rotation, earlier-cove smoke, both production rescues and uninterrupted runtime-audio capture. Retained under `before-busy-correction/` and `browser-before-busy-correction.txt`. |
| Final affected browser batch | Pass, 7/7 in 4.6 minutes | Seven cases are recaptured after the candidate-only busy-ring correction: native sizes, both rescue/Undo routes, keyboard/lifecycle, pan/regression, actual recording and production candidate. Earlier four isolation cases and production Holding are reused with the single presentation-only delta proved by `evidence-reuse-audit.json`. |
| Physical Android/native GPU/other engines/human listening | Not run | Emulated touch and captured audio do not establish these. |

The final browser command uses a one-worker review config with base URL 5270, production preview 5285 and the installed Chromium executable. Exact executed files: `two-shelters.spec.ts`, `two-shelters-isolation.spec.ts`, `two-shelters-production.spec.ts`, `play-readability-production.spec.ts`. The first complete run took 5.8 minutes. The final rerun omits only the unchanged save-isolation and original-Holding production cases.

Reproduce from the committed source with Node 24:

```sh
npm ci
npm run dev -- --port 5270 --strictPort
npm run build
npm run test:unit
npm run check:assets
npm run test:e2e -- tests/e2e/two-shelters.spec.ts tests/e2e/two-shelters-isolation.spec.ts tests/e2e/two-shelters-production.spec.ts
```

The normal Playwright config starts its configured dev/production servers. This review used a local Chromium override because the executable is in the parent workspace cache; no browser executable, installed dependency or build output is committed.

## Native visual observations

The supplied Holding/Driftwood/Wide reference frames were inspected as direction, not counted as new evidence. Final evidence comes from the actual candidate and matched current Holding/Driftwood views. Play is the primary composition; Whole cove provides navigation context and necessarily shows smaller animals.

The initial composition keeps the original ferry and two beavers prominent at a modest cottage landing. Staging leaves both bodies on a short supported pier. At Reed Pier, the rabbit boards before the first flood. Later loaded views retain recognizable silhouettes without expanding the deck. Harbor uses the accepted lighthouse/homecoming presentation. Native inspection and its remaining compromises are recorded with the final captures below.

| Actual frame | Observation |
| --- | --- |
| `final/390x844-start-play.png`, `final/320x740-start-play.png` | Two full-size beavers read on the original deck. Low Landing and High Refuge names stay beside their own markers; the narrower phone no longer puts Low Landing's name above High Refuge. |
| `final/390x844-turn2-play.png` | Both beavers stand on supported timber; the empty ferry and short gangway remain prominent. Transaction feedback reports the completed subset action. |
| `final/390x844-turn4-play.png` | Mica is visibly aboard as Reed Pier floods; forecast turns to the occupied lower shelter. The active group is centered rather than pushed into a bottom corner. |
| `final/390x844-turn9-play.png` | Both beavers return together at the low shelter's last safe boarding boundary; all three remain conserved. |
| `final/780x320-turn2-play.png`, `final/780x320-turn6-play.png` | High Refuge staged and mixed-loaded states: recognisable bodies, short landing relationship, current marker in water instead of on the low cottage. |
| `final/390x844-rescue.png`, `final/780x320-rescue.png` | Actual completed rescues and compact completion card, with original home lighthouse. |
| `final/780x320-overview.png` | Entire authored network, four distinct place groups, honest endpoint leaders. The dock control stays with the current low group. Animals are smaller here; Overview is not the primary art evidence. |
| `final/390x844-holding-matched-play.png`, `final/780x320-driftwood-matched-play.png` | Same viewport/current runtime comparisons, not supplied concept art. Earlier-cove actions and Undo are separately smoked. |

Native inspection is complete for these captured states. Distant landmarks are intentionally cropped in close short-landscape Play; Whole cove and free panning expose them. Some Overview names need short leaders. These are presented as observed composition compromises, not automated aesthetic approval.

The selected uninterrupted movie is `final/actual-two-shelters-rescue.mp4`: 390×844, 317/317 native captured frames, 46.095 seconds of native visual timestamps, approximately 2.15 MB. It contains real subset unloading, the low-shelter strategy, tide Undo/replay and actual final delivery. Existing Sound runtime audio is aligned at its original playback level; no cut, gain adjustment, substituted sound or speed change. The recorded audio tail remains after the last native picture. Full decode and frame-count checks passed; `actual-two-shelters-rescue-encoding.json` records exact clocks and hashes. Sequential original JPEG transfer samples are retained with `motion-inspection.json`: the corrected busy ring no longer covers the animals, and idle identity returns after the transfer. Captured cadence is not a physical-phone performance measurement or human listening approval.

`MEDIA.json` indexes selected native files and distinguishes final evidence from retained historical attempts. The old movie under `before-busy-correction/` is superseded and is never presented as the corrected result.

## Original failures and corrections

- The first three-body/four-space proposal did not force retrieval order and was rejected mechanically. A four-body/six-space version passed the rule proof but crowded the original ferry. The final three-body/five-space roster retains the decision. The intermediate sheep/beaver cast required more turning space; two unchanged existing beavers fit without a new model or enlarged ferry.
- Initial actual hull/coast tests found approach collisions, rock overhang and a lighthouse foundation mismatch. Authored paths/footprints were corrected. Moving the deep return away from the shallow approach restored the bank. Logs remain in `attempt1/` and `geometry-first-failure.json`.
- Initial deck/body and moving-bystander checks failed. The final automatic seat shifts, sequential phase allocation and separated shore lanes resolve those sampled collisions. Original logs remain in `original-failures/seating-first.txt` and `transfer-bystanders-first.txt`.
- An expensive recursive geometry probe was interrupted: inconclusive. Bounded endpoint/midpoint actual-foot support checks replaced it; this does not claim continuous physics coverage.
- One early UI rescue observed turn0 after its first transfer. That source was under refinement; the original assertion remains in `original-failures/first-ui-rescue.md`, not relabeled as a passed run. Isolated retries completed both subset unloads. Later interrupted runs identified a test-helper race: after switching to Play, the helper tried to tap a disappearing Back to boat control. The helper now waits for the Play state without that second tap. `original-failures/rescue-debug.txt` is retained. These interruptions were not established runtime defects.
- Native preview inspection found a High Refuge label associated with the low cottage, a 320px label displaced above the wrong island, and a short-Overview dock action placed far from its boat. Candidate-only placement now uses the existing safe viewport without the extra inset, avoids other island silhouettes for the current marker, reserves the dock before names and uses local fallback. Its dock may use 2px clear separation while retaining actual protected rectangles and 44px-or-larger touch areas. Older callers keep their original 8px separation. Prettier's unrelated main.ts wrapping was removed; `formatting-cleanup.json` records equal parsed structure for that cleanup.
- The first complete-source browser batch passed eight cases before its smoke script waited for Unload at Driftwood's empty starting ferry. That test was interrupted, not passed; `browser-first-source.txt` and `first-complete-source/` preserve its results. The corrected smoke sails to the yard and boards Nell before Undo. The movie had not started in that interrupted batch.
- During final recapture, catalog references temporarily pointed to the not-yet-created final screenshots after the earlier folder was retained under `first-complete-source/`. Asset validation and one of 428 unit checks failed on those missing evidence paths. Both original outputs remain under `original-failures/*before-recapture.txt`; final validation is rerun after the files exist. No inventory check was weakened or bypassed.
- Sequential native transfer frames then exposed the existing current-location ring briefly covering an aboard animal while input was locked. The final candidate-only guard hides that current ring/name during the action and restores it after completion/cancellation. This is the only runtime delta after the 12-case batch. Its original movie/frames remain under `before-busy-correction/`; they are superseded moving evidence. Seven affected cases and the movie are recaptured on the correction. The four save-isolation cases and original-Holding production rescue remain applicable: the guard only changes Two Shelters' current marker visibility during its busy presentation, with no state, input, campaign or earlier-cove behavior change.
- The first packaging-byte audit hit Node's default 1MB child-output buffer while reading the 2.15MB committed movie. Raising that read buffer to32MB completed the exact-byte comparison; no media or runtime changed. Authored source/documentation whitespace checks pass; intentional supplied Markdown hard breaks and untouched tool-output whitespace remain in the original inputs/logs.

## Remaining limits

Human acceptance of puzzle difficulty, visual feeling and listening remains pending. Chromium touch emulation is not physical Android, native-GPU performance, other engines/fonts or screen-reader verification. Inherited portrait loading, constrained Bellwater overlap, delivered-heading and precise ≤180ms repeated-input timing limitations remain open; this task does not claim to close them. No new audio composition or timing change was made. Recorded runtime sound is evidence of capture/routing, not human listening approval.

The twelve-cove plan remains proposed beyond accepted content. Two Shelters has not replaced Wide, moved the launch or migrated any save. Stop here for candidate playtest; later route/save integration is separate.
