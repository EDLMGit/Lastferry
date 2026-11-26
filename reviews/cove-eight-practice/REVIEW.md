# Ternhaven — COVE_EIGHT_PRACTICE_01

## Disposition

**Ready for candidate review; not accepted or deployed.** The required production proof, focused automated checks and actual UI rescues are complete. Human difficulty, handheld presentation and eventual Journey/target acceptance remain for review and playtesting.

## Scope and source

One independent unscored Practice candidate, `?cove=ternhaven`, extends the existing list to nine. The seven-cove Journey, its saves, the eight accepted mastery identities and every earlier puzzle remain unchanged. The candidate reuses the six-space ferry and existing animals, portraits, water, current, controls and audio.

Starting source: `e3bef3da3f655a4c9671e0500d356a83fe96786b` on `m1-first-crossing`, safely fast-forwarded from the clean local checkout after fetching origin. It includes the newer publication continuity. Evidence from this pass belongs to that HEAD plus the source manifest's working-tree changes; the final commit is reported separately in the handoff.

Repository: [EDLMGit/Lastferry](https://github.com/EDLMGit/Lastferry). [Draft PR #1](https://github.com/EDLMGit/Lastferry/pull/1). The [131-input source manifest](source/c1ed244aef5d0c7f235d111258bc28658ade82086df5427f2228537aafdc783d.json) identifies runtime digest `c1ed244aef5d0c7f235d111258bc28658ade82086df5427f2228537aafdc783d`. It also records the browser-helper hashes. The original helper revision is retained with the first failures. Documentation and encoding-script fallback-directory cleanup after capture do not change game inputs.

The minified entry is `index-Brb746hC.js`, SHA-256 `dbc74f6bfad5d3d857967fa1d0a1172aedbac7214547a76291bb2bfc4b943415`. Build, catalog and protection hashes are in [checks.json](checks.json) and [preservation.json](preservation.json). Forty-one protected inputs, including the prior level/witness data, core rules, mastery, progress and audio, match the task baseline after text line-ending normalization. The seven Journey definitions are identical. All 81 existing asset IDs are retained; thirteen existing families document candidate use. No new asset family, portrait output, species, boat model or story scene was introduced. [Asset ledger](../../docs/ASSET_LEDGER.md) · [Catalog](../../assets/catalog.json)

[Staged verification](staged-verification.json) confirms all 131 captured runtime inputs match the final staged source. Six text files differ in Git only by CRLF/LF normalization; no gameplay or asset bytes changed otherwise. The capture remains attributed to the recorded working tree rather than retroactively relabeled as a post-commit run.

## Design

[Design and production proof](DESIGN.md) · [Reproducible audit](audit.mjs) · [Machine-readable audit](audit-results.json) · [Witnesses](../../data/ternhaven/witnesses.json)

The proved minimum is **13 actions**. The proposed efficient target is **14**, for later review only; it is not registered as a scoring target. High Bank permits later retrieval, whereas Tern Steps requires the group to leave before action ten. Sedge must reach Harbor on the first flow, freeing enough room for the remaining six spaces. The choice of staging place determines whether to collect Willow light first or use the deep route with the staged group aboard.

High Bank's 14-action plan collects Willow before retrieving Juniper/Fennel. The low/deep 14-action plan retrieves Juniper/Fennel first and reaches Willow by the deep link, boarding on action ten before the flood. The legitimate 13-action plan collects Willow light and sails directly to Tern Steps for the boundary pickup. All three were completed through actual UI controls.

The tempting low plan is still recoverable after Willow boards on action eight. Returning via Tern Buoy on action nine removes every winning continuation while the state remains playing; reaching Tern Steps on ten floods the waiting group. Two Undos restore action eight and the direct approach wins. Independently, leaving only Juniper early leaves a depth-three boat facing depth-two water; three Undos after the real capacity loss restore the initial unloading decision. Exhaustive continuation graphs and isolated elevation/depth counterfactuals establish these claims without adding a runtime solvability detector. Search counts are coverage, not a human difficulty rating.

## Verification record

Node **24.15.0**, npm **11.12.1**, Windows, Chromium **156.0.8078.4**, ANGLE SwiftShader, DPR 1. Phone input is emulated touch, with normal keyboard navigation for recovery and terminal Undo. Native viewports: **390×844**, **780×320**, **320×740**, plus **1440×900** desktop smoke. The portrait rescue and selected recording use normal motion; landscape production and recovery checks use Reduced Motion. Tips remained Off. [Exact configuration, commands and results](ENVIRONMENT.json)

| Check | Result | Evidence |
| --- | --- | --- |
| `npm run build` and standalone `npm run typecheck` | **Passed** | Fresh minified entry and CSS hashes in [checks.json](checks.json); existing >500 kB bundle warning remains. |
| `npm run check:assets` | **Passed: 81 families** | All IDs preserved. Gallery portraits and both candidate deck specimens inspected at 390px; specimens are not gameplay evidence. |
| Focused production rules, mastery, progress, seats, transfers, shore/route geometry | **Passed: 226/226, no skips** | Nine test files and exact command in [unit-results.json](unit-results.json) / [checks.json](checks.json). Includes old completed-six continuation and all accepted scoring targets. |
| Complete production-rule enumeration and actual Session witnesses | **Passed** | 347 canonical states, 874 transitions, minimum 13; three witnesses, independent counterfactuals, subset conservation, tide/terminal Undo and recovery in [audit-results.json](audit-results.json). |
| Six distinct browser cases | **Passed after three harness corrections/reruns** | First run: three passed / three failed passenger-array-order assertions. [Original results](original-runs/browser-first.json). Affected three reran and passed with runtime unchanged: [development-results.json](development-results.json). |
| Real rescue, minified production | **Passed** | 780×320 Home → ninth Practice entry → low/deep 14-action rescue, with no development state API. |
| Real normal-motion rescue and Undo | **Passed** | 390×844 high-bank14, both current/tide facts, tide Undo, terminal Undo/redelivery, direct transfers and native group chooser. |
| Both tempting mistakes and recovery | **Passed** | Early wrong subset → real capacity loss → keyboard Undo3 → correct plan; low return via buoy → real flood → Undo2 → direct13 rescue. |
| Practice/mastery isolation and lifecycle | **Passed** | Exact in-progress/completed-seven save bytes and accepted Orchard best unchanged; no unscored best writes; Restart/Home/reload, free inspection, nine entries/eight targets, 320px Settings/orientation and actual fullscreen entry. |
| Uninterrupted actual recording with runtime audio | **Passed** | Additional normal-motion portrait test repeat; full media decode 691/691 frames. [Recording results](recording-results.json), [media audit](MEDIA.json). |
| Physical Android, human difficulty/listening, spoken screen reader | **Not run** | Android explicitly deferred; emulation and signal measurements cannot substitute. |

Build/typecheck/source preservation were verified against the same runtime inputs used by the screenshots and recordings. The whole historical browser suite was not rerun; unchanged source and the focused shared regression checks define coverage.

## Actual native gameplay evidence

All images are unmodified runtime screenshots. [EVIDENCE.json](EVIDENCE.json) retains 25 PNG hashes and observations: native gameplay frames plus three actual element captures for portrait identity inspection. The gallery and first-cove concept reference are not gameplay evidence.

| View/state | Evidence | Observation |
| --- | --- | --- |
| Portrait ordinary Play / Whole cove | [Play](390x844/start-play.png), [Overview](390x844/start-whole.png) | Large starting crew and Willow in Play. Overview exposes all five named stops; animals are naturally smaller there. |
| Choice and factual forecast | [Portrait staging](390x844/staging-preview.png), [landscape staging](780x320/staging-preview.png), [forecast](390x844/forecast.png) | Full names, portraits, capacities, depth4→2, selected subset and named commit fit. Forecast lists both current changes, exact depths and low-land deadlines with Tips Off. |
| First rise / homeward delivery | [Portrait](390x844/after-tide.png), [landscape](780x320/after-tide.png) | Sedge remains aboard after the boundary crossing; explicit Bring home is still required. |
| Wrong early choice and recovery | [Blocked depth](recovery/blocked-early-load.png), [restored choice](recovery/early-choice-restored.png) | Factual depth comparison and exact early state recovered with keyboard Undo. |
| Lost later access and recovery | [Still playing at nine](low-recovery/missed-retrieval-still-playing.png), [flood](low-recovery/flood-outcome.png), [restored direct approach](low-recovery/direct-approach-restored.png) | Honest distinction between legal but unwinnable state and reported flood; Willow remains aboard after recovery. |
| Ordinary unscored victory | [Portrait](390x844/rescue.png), [short landscape](780x320/rescue.png), [redelivery](390x844/redelivery.png) | Four safe neighbors and actual action count; no lantern result. Undo/Restart remain available. |
| Nearby narrow portrait / desktop | [320px Play](320x740/start-play.png), [Practice list](320x740/practice-list.png), [desktop](desktop/start-play.png) | Essential controls fit, native scrolling exposes all Practice entries, candidate is clearly unscored. |

Native-size inspection found no clipped chooser labels or page/dialog horizontal overflow. Short-landscape Play crops the top of High Bank while keeping its dock/name usable; some remote stops are outside local Play and remain available through Whole cove/free inspection. The normal Harbor arrival partly occludes the sheep behind the beaver; all four models are supported and the safe count/identities remain truthful. These are recorded composition limits, not an assertion of human visual acceptance.

A supplemental actual-UI replay checked the final three-passenger delivery chooser after a small recording image prompted a portrait-identity check. Immediate and settled image sources correctly map Willow to beaver, Juniper to deer and Fennel to tan rabbit, all loaded at 256px and displayed at 44px. No portrait defect was reproduced and no runtime change was made. [Final preview and mapping](portrait-check/mapping.json) · [Native delivery chooser](portrait-check/final-delivery.png) · [Passed supplemental check](portrait-check/results.json).

[**Uninterrupted 70.8-second portrait rescue with actual runtime audio**](390x844/rescue.mp4). This includes staging, the early delivery, tide Undo/replay, Willow pickup, retrieval, arrival and terminal Undo/redelivery. No injected state, splicing, speed change, interpolation, overlay or gain change. The 3.76 MB MP4 retains all 691 delivered frames and their native intervals; maximum delivered-frame gap is **0.3833 seconds**. Audio is the existing Sound master, Opus encoded to AAC at unchanged levels. [MEDIA.json](MEDIA.json) records hashes, levels, alignment and full decode. Raw frames/audio stay local and ignored. Source frames at several stages and the held final arrival were visually inspected; this does not establish speaker listening or physical-device performance.

Reproduce with Node 24: `npm ci`, `npm run dev -- --port 5270 --strictPort`. [Local Ternhaven](http://127.0.0.1:5270/?cove=ternhaven) · [Unchanged root Journey](http://127.0.0.1:5270/). The checked-in browser test and documented environment reproduce verification; `LAST_FERRY_C8_RECORD_ONLY=1` omits concurrent still capture while retaining gameplay assertions.

## Original failures and repairs

The first authored spatial layout failed two physical checks: the High Bank course crossed a reef rock and the Reed Landing departure clipped a pier during rotation; shore shells also overlapped Juniper. The course was routed east of the reef, the shallow arrival was given open turning water, and existing reed/shell accents were repositioned behind the waiting group. A second run found reeds against Sedge; moving that local decoration rearward resolved it. No animal scale, hull collision assertion or accepted cove geometry was weakened. Original JSON logs are retained with the final verification evidence.

The first registry batch found one expected eight-to-nine Practice assertion and two inherited six-cove Journey assertions. The latter were already stale after accepted Orchard integration. They now assert the exact seven Journey identities and nine Practice identities; the eight scored entries remain separately asserted. New test-only TypeScript incompatibilities (`toSorted` with the project's library target and insufficient action narrowing) were corrected without changing compiler settings or runtime rules.

The first browser run's three failures compared passenger array order literally after the UI offered the same valid subset in roster order. The shared state checker already checked sorted identities plus every other state field. The development helper now returns the actual checked runtime state, so subsequent inspection and Undo still compare exact snapshots. No runtime ordering, selection, timing or rule was changed. [Original browser report and helper hashes](original-runs/README.md), [geometry/registry originals](original), [audit/tooling failures](ORIGINAL_FAILURES.md).

The first attempt to start the local server found port5270 already in use. The existing correct server was reused and the candidate opened successfully; no process or unrelated local work was removed. Earlier Orchard capture gaps of 3.55 and 5.85 seconds and historical timing limitations remain in their original reviews, not reclassified as fixed by this capture.

The staged whitespace check initially flagged trailing spaces in copied browser-error Markdown and extra final blank lines. Only that display whitespace was trimmed; the original browser-result JSON and failure messages are retained unchanged. The final staged check passes.

## Publication and limits

No deployment. The private Site remains **version 20**, game `9c7a05785a021538c996f5dcd4b03415d1a35080`, hosting source `ffc5eebfd8520735b231ffe6fedf1b3a54757f9a`, with its existing private audience. [Receipt](../orchard-journey/deployment-confirmation.json)

The user explicitly deferred the Android playtest. Chromium emulation, production-rule enumeration and native screenshots do not establish physical Android performance, human difficulty, listening or spoken screen-reader acceptance. Candidate Journey placement and target acceptance remain open; C9–C12 and narration recordings are outside this pass. Prior review failures and publication history remain retained.
