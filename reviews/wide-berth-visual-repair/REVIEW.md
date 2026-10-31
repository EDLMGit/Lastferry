# Wide Berth visual repair

## Disposition and source

Implementation commit: **`9aab76f180b6bf5bd859414001ea4fd5b3a87639`**. [Packaging audit](packaging-audit.json): all73 tested runtime files match committed content (65 exact,8 newline-only),101 selected media are byte-exact, and12 supplied package inputs are unchanged. The following handoff commit changes audit/continuity metadata only. Its full final pushed SHA is recorded in PR1 and the handoff; no runtime changes follow verification.

Implementation and focused verification are complete. This is WIDE_BERTH_VISUAL_REPAIR_01, correcting the user-rejected presentation at `45ab9768792ddd3a8dffb67da6c332f8fe2234ff`. The existing puzzle/campaign foundation remains. Prior functional passes did not establish visual acceptance. Human acceptance awaits the user's playtest.

Started clean on `m1-first-crossing` in `C:\Users\ernes\Documents\last-ferry-codex-starter\Lastferry`. The exact supplied task originally resolved at `C:\Users\ernes\Documents\last-ferry-codex-starter\LAST_FERRY_WIDE_BERTH_VISUAL_REPAIR_PACKAGE\NEXT_TASK_WIDE_BERTH_VISUAL_REPAIR.md`; the unchanged package is retained beside package.json. The direction PNG was opened and inspected as concept art. It is neither a shipped background nor runtime evidence.

The final implementation and handoff commits are recorded separately in the packaging audit and PR#1. Captures belong to their recorded working-tree hashes, not a later commit by assertion. Baseline server5277 serves an isolated archive of45ab976; current app5270 serves the implementation. Review: https://github.com/EDLMGit/Lastferry/pull/1 . No deployment; main remains `386de54d20fdd4a513a06115471d70bf94738cc0`.

## Changes and visual observations

The ferry is a compact larger sibling of the original: shaped yellow hull/freeboard, substantial red cabin/roof/windows/chimney, purposeful deck and unchanged full-size animals. Final measured model footprint is2.390×4.136, versus the rejected approximately2.94×4.88 rendered outline; these are observed dimensions, not an acceptance ratio. Stable automatic banks fit every legal roster, including five bodies/six spaces. A short fitted gangway shares the real transfer endpoints.

Six-neighbor shore space is on supported land/quay in staggered banks with a central path. Timber has fitted seams and supports; High Quay is stone. The same graph is authored within24.8×19.55world units instead of31.5×27.5. Four actual compatible coast outlines and scoped shore treatments distinguish Harbor, working Wide Berth, angled High Quay and the pointed shell/reed spit. The generated board does not supply coordinates or mechanics.

The current marker is outside the boat and other endpoint hit areas, with a stable camera/state offset and boundary leader. Its identity, one semantic/tab stop and 44/48px targets remain. Wide dock controls reserve space before labels and prefer open water over landmarks. A Wide-only phone Play frame includes the ferry and local shore group, reserving their actual dock/deck envelope through transfers and bobbing; framing interpolates through the existing sailing plan. Four-space framing, manual pan, free inspection, Overview and Home retain their existing paths.

| Concern | Actual comparison and observation | Evidence |
| --- | --- | --- |
| Ferry proportion | First internal full/five-body phone views show a stronger cabin and smaller useful floor; actual body/foot checks exposed and corrected curved-bow support and rail-turn contact before final verification | `first-corrected/390x844-full-wide-play.png`, `first-corrected/390x844-five-shell-play.png`; final matrix is separately source-indexed |
| Animal visibility | Current cue no longer masks the sheep. First shore rows still hid rear rabbit bodies; final arrangement staggers front/rear banks without shrinking animals | Rejected `../wide-berth/close/390x844-six-spaces.png`; internal `first-corrected/390x844-six-ashore-play.png`; final native frames |
| Shore support | Groups stand on actual smoothed top, compact stone/timber and clear paths. Early tree/rock overlap was detected from rendered prop geometry and moved to flanks | `gates/shore-props-first.txt`, `gates/land-final-bow.txt` |
| Pier/gangway | Continuous fitted timber/stone replaces fence-like gaps and the broad apron; short boards cover the actual crossed path. Both headings and all dry tides are checked | `ferry-profile-observations.json`, final dock/transfer evidence |
| Cove composition | Four different compatible silhouettes, reduced spatial bounds and free Overview; initial High Quay label obscured its island and was moved using land avoidance | `land-mechanics-audit.json`; matched baseline/final Overview frames |
| Water/contact | Dry attached feet at draft4, real gate/bridge endpoints and hull-derived released wake retain the original policies | Actual production geometry tests, full-load frames and normal-speed sequence |
| Launch | Shared quay/waterline/boat/feet anchors remove floating foundations and Nell/roof overlap. First portrait revision cropped stern/helper; final native frames retain both | [LAUNCH_OBSERVATIONS.md](LAUNCH_OBSERVATIONS.md), `launch-baseline/`, `launch-final/` |
| Layout/recovery | Released Play/Overview/pan/Back to boat and native rotation are exercised; actual touch/keyboard markers and nearby controls remain the interaction surface | Focused browser results and final matrix |

These observations distinguish technical geometry, actual frame inspection and later user acceptance. Held launch frames use trusted Pause/Resume to identify beats reliably; they are not uninterrupted playback evidence. The normal-motion recording is indexed separately.

## Verification

Environment: Windows, Node24.15.0/npm11.12.1, Chromium156.0.8078.4, SwiftShader, DPR1. Mouse/natural keyboard/emulated touch. Native390×844 and780×320; additional320×740,844×390,1440×900 and1782×1225. No physical Android, hardware listening or native GPU claim.

Commands: `npm run build` (includes TypeScript), `npm run typecheck`, `npm run test:unit -- --maxWorkers=2`, `npm run check:assets`, and selected `npm run test:e2e -- <spec>` with `PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright`, dev5270, production5276 and a distinct `LAST_FERRY_REVIEW_DIR` per run. Baseline comparisons use dev5277. Exact commands and original results remain in gates and automation JSON.

- Final build/typecheck: passed (`gates/build-ready.txt`); existing bundle-size advisory remains.
- Final full units: **388/388 passed**, 41 files, unchanged timeouts (`gates/unit-ready.txt`). Asset validation: **79 unique families passed** (`gates/assets-ready.txt`).
- Final native browser matrix: **5/5 passed** (`gates/browser-ready.txt`), including both actual 19-action six-ashore rescues, all requested Overview aspects, current/focus/touch checks, pan/rotation/Undo and the original Driftwood regression.
- Full units: original387-case run had385passes/2failures. One new fixture used the package's documentary `world_contract` key as a runtime key; it now compares every locked field to actual `world`. The catalog check correctly failed while this new report path was absent. Original logs retained; corrected gate recorded separately.
- Ferry:15/15 focused checks pass. All59legal memberships, every legal transfer subset, actual body/roof/rail/stationary-body clearance, real foot-mesh support, both berth headings, dry tides/all4drafts, stable identities, winning-arrival boundary and hull-matched wake.
- Land:4/4 focused checks pass after final bow change. Actual occupied hull/appendages and pier meshes swept in both directions/reachable headings; .45route clearance retained. Distinct fan-compatible outlines, actual tree/rock/landmark clearance against shore groups/transfers, and lighthouse/shed foundation support.
- Launch baseline2/2 and final2/2 pass; eight native beginning/release/glide/endpoint frames each. Registry/caption/cue/duration and earlier accepted drawings remain unchanged. Final frames inspected at native size; matching uses the same beat/viewport, not identical milliseconds.
- Final integrated journey **2/2**, lifecycle **4/4** and production **1/1** pass. Both actual13-/14-action strategies, subset-loss correction, both tide boundaries, tide/terminal Undo, fresh/historical save boundaries, story intent, original coves, fullscreen/rotation and built-game six-choice fit are covered. These are separate batches, detailed in [BROWSER_CHECKS.md](BROWSER_CHECKS.md).

The >2× dimension predicate and broad-pier-only support predicate encoded the rejected design. They were replaced with actual roster fit, named obstacle bounds, actual foot support across authored walkable surfaces and native composition evidence. No real collision or .45route margin was relaxed. Old four-space factories/data and the supplied non-spatial lock are checked separately.

## Original failures and corrections

Original failing logs, automation results, source manifests and representative defect frames are versioned. Repeated internal iteration outtakes remain local under the review's scoped ignore rules; final-candidate frames replace them for current-source review. Raw recorder output and disposable builds remain ignored. Original tool logs retain their trailing whitespace; scoped source/test/documentation whitespace checks pass.

Retain original logs. Ferry iterations caught unsupported rear shore feet, a rotating sheep at a rail tip, tan rabbit ear clearance in the central shore aisle, a toe beyond the T head and curved bow. Corrections changed actual support/path/gate/bow geometry with full animal size. Land iterations caught turn sweeps against compact crossheads, passenger/prop overlap and supported-foundation placement; routes now bow away before turning and props stand clear.

The first browser comparison used an unsupported JSON import in the Playwright harness. A later fixture redundantly pressed Back to boat just as Play view automatically hid it; the corrected harness uses one released camera action. The real short-landscape dock/target overlap remains separately identified in `original-failures/dock-over-map.md`; it was not dismissed as that fixture race. Source edits/capture stalls during early iterations are not final evidence. The launch's original observer lag and incomplete recordings are explicitly retained in its observations.

## Final native corrections and evidence

A later **4/4 functional pass still had visible failures**: six neighbors at High Quay were behind the short-landscape HUD, and a dock action covered Harbor's lighthouse. Native inspection found both. Local subject framing and terrain-aware dock placement corrected them; new assertions require the actual ferry and every local body inside the unobscured scene. All final phone frames were reopened at native size. [VISUAL_OBSERVATIONS.md](VISUAL_OBSERVATIONS.md) distinguishes original failures, corrected observations and human acceptance.

The first uninterrupted Driftwood trial was stopped when the relocated Reeds current cue covered Shallow Bend. A bounded reproduction retained the 15s interception error and DOM hit-owner proof. Current placement now avoids other actual targets; all five centers resolve to their own endpoints, and the named-touch return passes. Existing integration locators now have bounded 15s timeouts. This was a real regression, not a fixture failure.

The new frame branch also exposed 13 constructor-bypass fixtures without the production ferry profile. They now initialize the real profile. The final quiet 388-case suite passes; no runtime guard or test timeout was weakened. A final physical audit strengthened prop checks to use exact production yaw for boarding/unloading, both berths and every dry tide/draft. See [PHYSICAL_CHECKS.md](PHYSICAL_CHECKS.md) for all 59 memberships, 956 legal transfer combinations, actual support/sweep sampling and explicit tolerance limits.

Matched actual state pairs:

- State3/full load: [before](../wide-berth/close/390x844-six-spaces.png) → [after](final-candidate/390x844-full-wide-play.png).
- State7/five bodies: [before](../wide-berth/chooser/390x844-five-bodies.png) → [after](final-candidate/390x844-five-shell-play.png).
- State12/six ashore: [before](../wide-berth/chooser/390x844-six-ashore.png) → [portrait](final-candidate/390x844-six-ashore-play.png) and [short landscape](final-candidate/780x320-six-ashore-play.png).
- [Loaded opposite berth](final-candidate/780x320-full-quay-play.png), [Overview](final-candidate/780x320-empty-overview.png), [focused marker](final-candidate/780x320-recovery-focused.png), [staged controls](final-candidate/780x320-staged-controls.png), [completion](final-candidate/780x320-six-delivered.png).
- [Portrait launch release](launch-final/390x844-release.png) and [landscape held endpoint](launch-final/780x320-end.png), with all eight source-indexed beat pairs in LAUNCH_OBSERVATIONS.md.

[MEDIA.json](MEDIA.json) verifies matching states and source hashes. Geometry/local framing changes are intentional; these use released Play/Overview, without cropping or developer-only camera proof. The supplied direction board is not game evidence. Whole-cove passengers are small silhouettes and some short-landscape names have long crossing leaders. Local Play may crop distant landmarks; Overview exposes the whole cove.

Ten existing inventory entries changed in place: model.ferry, model.pier-kit, terrain.coast, scenery.rocks, environment.wide-berth, motion.transfer, effect.wake, ui.map-markers, ui.component.location-name and story.illustrations. All 79 IDs remain; no new family, species, shader or audio. The developer gallery derives the actual corrected model/anchors and its caption describes the current specimen.

## Uninterrupted actual recordings

- [Earned Driftwood → launch → Wide deep rescue](journey-final/actual-launch-rescue.mp4): **93.961s**, 780×320, 518 delivered frames, 4,644,893 bytes. Starts at a labelled legitimate Driftwood cove-start checkpoint; Driftwood12 and Wide13 are then earned through actual controls, including subset loss, tide/terminal Undo and explicit four-cove acceptance.
- [Fresh launch → complete staging rescue](journey-final/actual-close-staging.mp4): **63.835s**, 390×844, 308 delivered frames, 3,125,704 bytes. Starts from the exact historical three-cove completion fixture; it does not claim to earn Driftwood again. Includes the actual14-action staging strategy and Undo/redelivery.

Native timestamps are sorted, every delivered frame retained and actual master-output audio aligned without cuts, speed changes, boost, normalization or replacement music. Both actual launch interruption arrays are empty. Full ffmpeg decode and muted Chromium playback/near-end decoded-frame checks pass for both movies (`journey-final/media-browser-check.json`). `motion-index.json` records inspected native source frames across release/glide/endpoint and final transfer/rest. This is source-indexed motion evidence, not human real-time listening approval.

Delivered frame intervals average180.9/206.3ms, with maxima4.950/4.800s that include held static endpoints/capture delays. These are not physical-phone FPS or proof of a motion stall of that duration. Original raw frames/audio stay local and ignored; the two selected MP4s and manifests are versioned for remote review.

## Remaining limits and play

Physical Android/other engines/fonts/screen readers, native-GPU performance and human art/pacing/puzzle/acoustic acceptance remain unverified. Sparse software capture and stalls are not phone FPS. Inherited intermittent portrait loading, constrained Bellwater overlap, delivered-heading and precise≤180ms touch bounds are not closed by unrelated geometry passes. Runtime Sound/composition/gains and accepted water/sailing policies remain unchanged. No new species, cove, current, packing mechanic or real-time deadline.

Local Journey: http://127.0.0.1:5270/ . Independent Wide Berth: http://127.0.0.1:5270/?cove=wide-berth . Install/run: `npm ci`, then `npm run dev -- --port 5270 --strictPort`.

PR#1 stays draft, main unchanged, no force push and **no deployment**. Last confirmed private Site remains version12, game `1a85874883af5caa59f6294a75495eccf2afebbc`, hosting `e87c5c5baa53a39001c5a89b07b59aab2ad150fc`. Publication receipt/history retained; this repair awaits review.
