# Arrival bubble — ARRIVAL_BUBBLE_01

## Disposition

**Ready for scoped review.** The centered arrival is implemented, all 185 focused unit checks pass, and all 8 distinct browser cases have passing runs with their source qualifications retained. Final-source native frames and an uninterrupted runtime-audio capture are included. No confirmed application defect remains in the checks performed. Physical-phone and human review remain separate; no deployment accompanies this pass.

## Source and scope

Repository [EDLMGit/Lastferry](https://github.com/EDLMGit/Lastferry), branch `m1-first-crossing`, [draft PR #1](https://github.com/EDLMGit/Lastferry/pull/1). The initially clean checkout at `291d8f2a9570d833709e10815db12bd5c1fe75cc` was fetched and safely fast-forwarded to task/review commit `107b18adedc4f59202eb105a35c2d9676d2752ee`. No reset, force-push or unrelated-work removal occurred.

The actual before captures use an isolated copy of the reviewed minified runtime: main bundle `index-Brb746hC.js`, SHA-256 `dbc74f6bfad5d3d857967fa1d0a1172aedbac7214547a76291bb2bfc4b943415`, source digest `c1ed244aef5d0c7f235d111258bc28658ade82086df5427f2228537aafdc783d`. Task107 changes documentation only relative to that reviewed implementation. [Before source](before/source.json) and per-frame JSON identify the real fourteen-action rescues and environment.

After evidence belongs to task107 plus the identified working changes, not a retroactively assigned commit. The `source/` manifests hash runtime inputs; browser reports separately identify tests, production artifacts and captures. The final runtime-input digest is `2cb42ec4e49efbe62d3f4aa07a5e5d3ec00b08985811fc4485f10c7de58cf0ae` across 135 inputs. [Environment/build identity](ENVIRONMENT.json), [per-case provenance](BROWSER_CHECKS.md) and [staged source verification](STAGED_SOURCE_VERIFICATION.json) identify the final reproducible inputs. All 135 captured inputs match the staged implementation: 128 exact bytes and 7 CRLF-to-LF-only conversions, with no other mismatch. The final Git SHA is reported separately in the handoff and PR. Original attempts and intermediate captures remain under `original-runs/`.

## What changed

- A centered native won-only dialog uses the painted teal surface, a shallow timber-colored crew recess and the original coastal controls. Portrait stacks the composition; landscape places the crew beside the reward/heading/actions. Inner visuals may settle briefly, but the measured outer bounds never animate.
- Three larger original brass/glass lanterns show the **current** rescue. Flame and hollow glass distinguish lit/unlit states beyond color. Compact Practice badges are unchanged. One compact action/Undo line replaces repeated counts; a better previously accepted result stays separate.
- The whole rescued cast comes from `requiredPassengerIds` intersected with the real won delivery state, using the existing pure identity resolver and original portraits. Ternhaven includes Sedge from the earlier delivery, plus Juniper, tan Fennel and Willow. Three-, four- and six-neighbor layouts retain names, unmodified portraits and stable named loading/failure slots.
- Warm forward and original Replay actions retain the established handlers. Undo, Settings, named Close and a quiet Details disclosure remain reachable. Details contains criteria, accepted best and checkpoint policy; persistence failure remains outside the disclosure.
- The actual completed-unload transaction owns one finite inner settle/lantern illumination. Reduced Motion settles immediately. Settings, closing/reopening, rotation and fullscreen do not start a new celebration or accept a result. Existing sound timing, persistent victory reduction, lighthouse and animal response are untouched.
- A won-only camera option uses the coherent whole Harbor frame behind the bubble instead of fitting all models into a narrow leftover strip. The open card intentionally covers much of Harbor; sea margins and small world edges remain. Closing reveals the settled world, and terminal Undo restores ordinary play framing.
- **Only `ternhaven: { revision: 1, target: 14 }` is added to mastery.** All three accepted 13/14/14-action witnesses qualify. No historical unscored score is invented. Earlier targets/bests, nine puzzles, seven Journey identities, backup bytes and Practice isolation are retained.

## Verification

Node **24.15.0**, npm **11.12.1**, Windows; Chromium **156.0.8078.4**, DPR1, touch emulation and natural keyboard, SwiftShader. These are emulated phone views, not physical Android.

| Check | Result | Evidence |
| --- | --- | --- |
| Standalone `npm run typecheck` | Pass | [Final output](typecheck-final.txt) |
| `npm run build` | Pass | [Final output](build-final.txt); existing large-bundle warning retained |
| Session/mastery/progress/homecoming/framing, eight files | **163/163 pass** | [Exact commands and source review](INTEGRATION_SOURCE_REVIEW.md), [output](progress-homecoming-unit-results.txt) |
| Arrival presentation and asset validation, two files | **22/22 pass** | [Asset checks](ASSET_CHECKS.md), [JSON](asset-presentation-results.json) |
| `npm run check:assets` | **82 families pass** | [Output](assets-validation.txt); all 81 prior IDs retained, only Replay added |
| Actual production Session replay of all 3 Ternhaven witnesses | Pass | [Scoring report](SCORING_CHECKS.md), [source-tied results](scoring-replay-results.json); each3 before Undo, each2 after terminal Undo/redelivery |
| Protected puzzle/story/audio/boat inputs | **51 unchanged Git blobs** | [Manifest](protected-source-manifest.json), `node reviews/arrival-bubble/verify-protected.mjs` |
| Actual before rescues at390×844 and780×320 | **2/2 pass** | [Results](before/results.json); no state injection |
| Focused browser checks | **8 distinct cases pass** | [Case/result/source mapping](BROWSER_CHECKS.md); bounded batches, not a single final all-green batch |
| Latest minified build: real 9-action rescue and visible read-failure warning | Pass | [Final result](production-final-results.json), [actual phone frame](production-final/780x320-storage-notice.png) |
| Final-source uninterrupted actual-UI capture | Pass | [Capture result](recording-results.json), [full media audit](MEDIA.json) |

The163 and22 batches are distinct, for185 focused unit checks. The earlier63-case scoring run is a subset of163, not an additional count. Generic unscored fixture/no-write behavior remains covered. No new puzzle search or full campaign replay is claimed; the unchanged [independent Ternhaven proof](../cove-eight-practice/INDEPENDENT_REVIEW.md) remains authoritative for the accepted minimum and strategy decision.

## Native evidence

| View | Before | After |
| --- | --- | --- |
| 390×844 Ternhaven14-action arrival | [Actual before](before/390x844.png) | [Final-source current rescue](gameplay/390x844-three.png) |
| 780×320 same solved state | [Actual before](before/780x320.png) | [Final-source current rescue](gameplay/780x320-three.png) |

The old runtime was unscored and has no crown/cast showcase. New scored runs earn their own results; these frames do not backfill the old attempts. Before uses Reduced Motion; the primary after portrait run uses normal motion with a settled card. The same state/viewport comparison is not a claim of identical lighthouse phase.

Further native phone, desktop, expanded Details, lower-current/prior-best, Undo/redelivery and image-failure frames are indexed in [EVIDENCE.json](EVIDENCE.json). The selected final-source portrait/landscape frames were inspected at native size. The [320px actual Journey result](320x740/journey-two.png), [one-current/prior-three production result](780x320/one-current-best-three.png), [final-source Details](gameplay/390x844-details.png) and [closed Harbor](gameplay/390x844-closed-harbor.png) supplement the paired comparison. Six-neighbor variants are clearly labeled isolated renderer fixtures using real Wide Berth level data, with no live Session or save owner. They supplement required actual Ternhaven/Journey rescues; they are not gameplay evidence.

[**Uninterrupted 14.546-second final approach, arrival and interaction**](390x844/arrival.mp4) retains all 98 delivered native frames, with a largest capture gap of 0.667s. The first eleven rescue actions were played through real controls with Reduced Motion before recording; Settings restored normal motion before the final two passages and unloading. The recording includes Settings/Back, Close, the settled Harbor and reopening. It is a short final sequence, not a complete-rescue movie. There are no cuts, retiming, overlays, interpolated frames or gain adjustment. Runtime audio is captured from the existing Sound master; peak −21.57dB/RMS −35.29dB. [MEDIA.json](MEDIA.json) records alignment, hashes and a complete 98-frame decode. No new composition, narration or fresh acoustic approval is implied.

## Original failures and corrections

- The first new scoring-test batch had62 passes/1 failure from an incorrect registry export name (`campaignCoves` instead of `storyCoves`). Correcting the test import gave63/63; no runtime registry changed. [Record](SCORING_CHECKS.md).
- The first browser measurement counted layout boxes in closed Details and compared font ink against narrow line boxes. The corrected check excludes actually hidden disclosure contents and compares visible text to its card/tile/button bounds. Visible nested overflow remains a strict assertion. Original result/error/source are preserved.
- A subsequent terminal-Undo assertion expected the hidden native dialog DOM to be destroyed. The game correctly closed it and canceled celebration; the test now checks hidden/no active celebration rather than imposing new DOM disposal behavior.
- The320px six-cast fixture found a real Replay label overflow: shared `#app .cove-button` padding/font specificity defeated the intended compact action styling. The smallest scoped selector correction restores the intended spacing and15px text while keeping48px touch height. Original narrow image/diagnostics remain; affected cases are rerun.
- The short-landscape six-neighbor storage-failure notice exceeded the visible bottom. The first spacing reduction was insufficient when the fixture adopted the actual viewport-minus24px height limit. A notice-only compact64px portrait treatment and tighter vertical gaps now reserve space for the visible warning; names and48px controls are retained, and prior-best detail remains in Details. The won-content cap also accounts for both2px borders. Original clipping images/measurements are retained; bounded reruns verify the repair. Native inspection also caught the notice-case Details overlay covering part of Undo; a notice-only bottom reserve fixes it, with actual button-center hit tests in expanded Details.
- The no-watch development server retained pre-spacing CSS in a later batch despite updated source files. Served-source qualification and original results are retained; affected captures/checks restart that owned server before use. They are not relabeled as final-source evidence.
- The first recording attempt was explicitly interrupted after an overlong host run, not labeled a game defect or test timeout. Its 578 delivered frames over 210.10s and 5.18s maximum gap remain in the original audit. The selected bounded capture avoids the long unrecorded preparation and retains its own gaps honestly.
- The first additional minified-warning run was interrupted during a redundant recovery check with a wrong harness locator. Its completed rescue/fit frames remain; correcting the locator and adding a bounded check gave a clean 36.3s passing rerun. No runtime change was needed.
- Tooling-only gallery setup/cache/network-idle attempts and an intermediate concurrent typecheck are retained in [asset notes](ASSET_CHECKS.md). They are not classified as final gameplay defects.

## Assets and continuity

[Inventory delta](asset-inventory-delta.json):81 retained IDs, no removals, one addition **`ui.icon.replay`**. Existing `ui.mastery-lanterns`, `ui.component.panel`, `ui.dialogs` and `ui.passenger-portraits` families document the new consumers and provenance. [Asset ledger](../../docs/ASSET_LEDGER.md), [canonical inventory](../../assets/catalog.json), [shared gallery](../../asset-gallery.html#arrival-bubble). Original new sources are [result lantern](../../assets/ui/result-lantern.svg) and [Replay](../../cove-ui-package/ui/icons/replay.svg). No new portrait outputs, species, WebGL canvas, external icon library or audio asset is added.

## Limits and publication

Physical Android, speaker listening and spoken screen-reader checks are **not run**. Background recovery is emulated; actual fullscreen is checked only on the available Chromium surface. Broad historical browser suites are not claimed passing. Earlier capture/timing limits in [the prior C8 review](../cove-eight-practice/REVIEW.md), [Orchard Journey](../orchard-journey/REVIEW.md) and [three lanterns](../three-lanterns/REVIEW.md) remain historical limits, not fixes implied by this UI pass. Human visual acceptance follows review.

**Not deployed.** Existing private Site version **20**, game `9c7a05785a021538c996f5dcd4b03415d1a35080`, hosting source `ffc5eebfd8520735b231ffe6fedf1b3a54757f9a`, and its custom audience remain unchanged. [Publication receipt](../orchard-journey/deployment-confirmation.json). No recipient details are copied into this report. PR #1 stays draft; GitHub main stays unchanged.

Local installation/play: Node24, `npm ci`, then `npm run dev -- --port 5270 --strictPort`. [Root Journey](http://127.0.0.1:5270/) · [Ternhaven Practice](http://127.0.0.1:5270/?cove=ternhaven).
