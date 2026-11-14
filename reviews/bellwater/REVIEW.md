# Last Ferry review — Bellwater Cove

## Disposition

**Ready for Bellwater playtest.** Production build, TypeScript and all 46 unit checks pass. The full browser suite passed 37/37; after one Bellwater-only label correction, all nine affected scenarios passed again on the final source. All 18 final Bellwater screenshots were inspected at native size, with a 29.08-second uninterrupted rescue recording retained locally. No confirmed outstanding defect remains in the tested coverage. The user's judgment of puzzle variety and enjoyment is next.

## Source and scope

- Repository: https://github.com/EDLMGit/Lastferry
- Draft PR: https://github.com/EDLMGit/Lastferry/pull/1; branch `m1-first-crossing`, base `main`.
- Reviewed starting HEAD / comparison base: `e9c81d620df5fca0983965e80c348260fb3518e9`, the user-specified contextual-interface review. Starting tree was clean, fetched implementation branch matched, and no newer user work was present.
- Final evidence belongs to that HEAD plus the documented working tree, retained in `tested-changes.patch`. The 56-file `source-manifest.json` snapshot was taken at `2026-10-22T08:25:47.206Z`; SHA-256 `46db5c9503f1f276aa07e7d5e871fb6dc2717221adb5b2164d268487bc3b7e7f`. It covers runtime, tests, dependency lockfile, levels and authoritative instructions. Review metadata, README and STATUS are outside the source hash. Packaging compares committed content to this source rather than relabeling captures as post-commit evidence.
- The full 37-check run belongs to the earlier 56-file hash `157a57a50a953020592f063e468cedee181ddf471cd393be735040e538f74f00`, archived in `full-suite/` with source, patch, results and selected capture attribution. The only later runtime change is a desktop Bellwater label placement branch; removing it reconstructs the exact earlier `src/main.ts` hash. The other changes are its focused Bellwater test and an asset-ledger date correction. `regression-reuse.json` records this comparison: 53/56 files identical, 28 unaffected browser scenarios reused, all nine Bellwater scenarios and all 18 Bellwater PNGs repeated. Reused media retain their actual earlier source.
- Scope: bounded responsive/input prerequisites, one authored Bellwater puzzle and modest scenery, small Holding → Bellwater sequence, baseline preservation and requested verification. The new task explicitly advances beyond the original M1 stop.
- Main is preserved at `386de54d20fdd4a513a06115471d70bf94738cc0`. Normal push and draft PR update are authorized; no force push or merge.
- `packaging-audit.json` compares all 56 source files against the staged commit: 55 exact, one instruction file with CRLF-to-LF normalization only. All 27 selected PNGs, including the two prerequisite captures, match exactly. Installed dependencies, configuration, disposable outputs and all raw recordings are excluded. `build-manifest.json` records hashes of the tested production artifacts.

## What changed

Bellwater's exact six-edge loop and Bell Pier branch are in `data/bellwater.level.json`. The ferry starts empty at Harbor; Tansy and Lark wait at Low Pier, Bram at Bell Pier. Small level-owned names feed local actions, subsets, status, forecasts, Help, accessible labels and the ending. Existing Pip/Rue/Moss names remain in the older coves.

The decision is which route to use outward and homeward as the shallow channel deepens, and whether to spend an unloading action while passing Harbor before the second pickup. Rules and consequences remain explicit; the interface does not prescribe a plan. Eight ten-action development witnesses retain both asymmetric routes, four legitimate Wait placements and both separate rabbit-boarding orders. A Wait is optional; longer harmless play after everyone is aboard stays legal. Difficulty and enjoyment remain hypotheses for the user's playtest.

Capacity, passenger costs, draft bands, action costs, tide schedule, action-before-rise order, current-depth validation, preview behavior and complete Undo are unchanged. No reducer, session or dependency change was needed. First Crossing and Holding Pier data and witnesses remain unchanged.

The triangular inlet has a low sandy reed shore, a rear rocky shore with a bronze bell frame, and safe lighthouse Harbor. Small explicit `src/scene/layout.ts` settings replace only necessary fixed scenery/camera choices; `src/scene/scenery.ts` retains the cottage and adds original bell/reed geometry. Species ordering preserves existing deck anchors, coat variants and transfer offsets while supporting the new IDs. Shared water remains the existing shader. The larger environment pass is deferred.

Holding Pier is the default. Its ending offers keyboard-accessible Next cove with the brief coast transition, while retaining Undo and Restart. Bellwater opens fresh at `/?cove=bellwater`; Menu selects all three coves. First Crossing remains explicit at `/?cove=first-crossing`. Bellwater's ending acknowledges its neighbors without claiming the whole story is finished.

## Environment and commands

| Item                     | Actual value                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| OS / browser             | Windows 11; Playwright 1.64.1 Chromium 156.0.8078.4, headless SwiftShader                             |
| Runtime / packages       | Node 24.15.0, npm 11.12.1; TypeScript 7.0.2, Vite 8.3.4, Vitest 5.0.5, Three.js 0.186.1               |
| Desktop                  | 1440×900, DPR 1, mouse and natural keyboard                                                           |
| Phone landscape          | 844×390 and 780×390, DPR 1, emulated Chromium touch                                                   |
| Responsive prerequisites | 844×500 and 1024×600, mouse/touch; resize through 480/481/600/601px and existing viewports            |
| Servers / capture        | Vite development 5178; built production 4178; Playwright actual WebGL screenshots and local recording |

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = '../.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT = '5178'
$env:LAST_FERRY_PRODUCTION_PORT = '4178'
$env:LAST_FERRY_REVIEW_DIR = 'reviews/bellwater'
npm run typecheck
npm run build
npm run test:unit -- --reporter=default --reporter=json --outputFile=reviews/bellwater/unit-results.json
node tools/verify-design.mjs
npm run test:e2e
npx playwright test tests/e2e/bellwater.spec.ts
```

The existing cache was reused. A fresh clone can install Chromium into `.cache/ms-playwright` as documented in README. Build files and installed dependencies remain ignored.

## Executed checks

| Check                                                     | Result                               | Evidence / observation                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                                       | Pass                                 | Final pinned source                                                                                                                                                                                                                                                                                  |
| `npm run build`                                           | Pass                                 | Final source, includes TypeScript; JS 634.28kB raw / 166.25kB gzip; existing >500kB bundle advisory remains                                                                                                                                                                                          |
| `npm run test:unit …`                                     | Pass                                 | 46/46, five files, `unit-results.json`                                                                                                                                                                                                                                                               |
| Bellwater production reducer witnesses                    | Pass                                 | All eight ten-action families; actual preview/execution equality and passenger conservation                                                                                                                                                                                                          |
| Current-depth blockage and both boarding deadlines        | Pass                                 | Action-3 shallow return stays free and invalid; boarding resolves safely on actions 4 and 8                                                                                                                                                                                                          |
| Bell first, deep both ways, any early rabbit delivery     | Pass                                 | Fail at the intended waiting-passenger deadline; subset IDs retained                                                                                                                                                                                                                                 |
| Full Session Undo and legal harmless late play            | Pass                                 | Every snapshot through both rises and win restored; no compulsory Wait or action cap                                                                                                                                                                                                                 |
| Canonical production reducer reachability                 | Pass                                 | 403 states with monotonic route/history flags, shortest 10; zero wins without shallow use, Bell first or early delivery. Counts describe this search, not a UI gate; `bellwater-reachability.json`                                                                                                   |
| Holding Pier production reducer regression                | Pass                                 | 154 canonical states, shortest 9, zero wins bypassing temporary holding                                                                                                                                                                                                                              |
| Actual ferry geometry clearance                           | Pass                                 | All three coves. Bellwater: modeled convex footprint, 1,001 production-motion samples in each direction of all six edges, zero island/pier overlaps                                                                                                                                                  |
| Active level wording / old resident preservation          | Pass                                 | Presentation unit tests, names overrides and actual selected-subset consequences                                                                                                                                                                                                                     |
| `node tools/verify-design.mjs`                            | Pass, reference only                 | 32/32; baseline reference BFS 502 canonical states, shortest 7, horizon 12. This is not UI evidence                                                                                                                                                                                                  |
| `npm run test:e2e` full suite                             | Pass                                 | 37/37, zero failed/skipped/flaky, 578.27 seconds, `full-suite/automation-results.json`                                                                                                                                                                                                               |
| Final `npx playwright test tests/e2e/bellwater.spec.ts`   | Pass                                 | 9/9 affected scenarios, zero failed/skipped/flaky, `automation-results.json`; all requested Bellwater captures repeated                                                                                                                                                                              |
| Actual mouse, natural keyboard and emulated touch rescues | Pass                                 | Both ten-action asymmetric routes; free blocked inspection, two tide boundaries, selected-Lark loss/recovery, full tide/terminal Undo, three losing plans, Next/Menu reset, production without debug controls                                                                                        |
| Existing coves and responsive/input checks                | Pass, reused after scoped correction | Baseline/Holding rescues, current boat controls, free inspection, subsets, complete Undo, keyboard, deck attachment, reduced motion, production; 844×500 and 1024×600 mouse/touch rescues with resizes. Full-run trusted repeat gaps 32.7ms normal / 129.4ms reduced; one commit and no stray dialog |
| Native-size screenshot and recording inspection           | Pass for stated coverage             | All 18 final Bellwater PNGs plus seven selected older-cove/responsive captures; full-frame video samples and actual monotonic UI trace                                                                                                                                                               |

## Captured gameplay

`capture-manifest.json` records timestamps, viewports, input, hashes and original source for **25 selected gameplay PNGs**: 18 final Bellwater captures plus seven reused older-cove/responsive captures. These are actual WebGL captures. No concept art substitutes for gameplay. The final Bellwater images were all inspected at native 1440×900, 844×390 or 780×390 size.

| State                                   | Desktop                                                      | Phone 844 / 780                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Start / full framing                    | [start](bellwater-desktop-start.png)                         | [844](bellwater-phone-844-start.png), [780](bellwater-phone-780-start.png)                                              |
| Free blocked shallow return at action 3 | [blocked return](bellwater-desktop-blocked-return.png)       | Selected-subset and route inspection also exercised in phone checks                                                     |
| Critical boarding                       | [Bram at action 8](bellwater-desktop-critical-boarding.png)  | Rabbits at action 4: [844](bellwater-phone-844-critical-boarding.png), [780](bellwater-phone-780-critical-boarding.png) |
| Actual one-rabbit loss warning          | Not captured separately                                     | [844](bellwater-phone-844-subset-warning.png), [780](bellwater-phone-780-subset-warning.png)                            |
| After first rise                        | [desktop](bellwater-desktop-after-rise.png)                  | [844](bellwater-phone-844-after-rise.png), [780](bellwater-phone-780-after-rise.png)                                    |
| Second pickup / rise                    | [after second rise](bellwater-desktop-after-second-rise.png) | Bram preview: [844](bellwater-phone-844-sheep-boarding.png), [780](bellwater-phone-780-sheep-boarding.png)              |
| Completed rescue                        | [success](bellwater-desktop-success.png)                     | [844](bellwater-phone-844-success.png), [780](bellwater-phone-780-success.png)                                          |

The seven retained regression images show Holding's start, phone critical boarding and success; First Crossing's desktop start and phone loading; and the two responsive unloaded states. Their individual records link the original full-suite source and `regression-reuse.json`. Remaining generated images stay in the ignored local cache.

**Uninterrupted recording:** `raw/bellwater-uninterrupted.webm`, 29.08 seconds, 1440×900, VP9, 25fps, silent. One actual UI session shows shallow outward travel, rabbit boarding, free blocked return inspection, deep return, both rises, Bram boarding, arrival and delivery after ten accepted actions. No cuts, speed changes or state injection. Complete Undo is tested separately. `video-inspection.json` records native-size decoded samples at 2, 8, 15 and 28 seconds. The video stays ignored locally and is unavailable in a fresh clone; no external upload was performed. Older regression recordings retain their earlier source in the manifest.

Visual verification: **complete for the stated coverage**. The corrected desktop after-rise view now leaves clear space above the rabbits' ears. Full landmarks and passenger silhouettes remain identifiable at both phone widths; essential consequences and confirmation fit.

The prerequisite report in `phase-a/REVIEW.md` retains its distinct earlier source, all 11 actual browser results and two selected responsive gameplay screenshots. Additional generated prerequisite images remain locally in `.cache/bellwater-phase-a-extra/`.

## Findings and resolution

The original 481–600px mismatch was fixed before content work and its current mouse/touch paths passed. Strict prerequisite checks then found a partial local-card overlap at 1024×601 and a reduced-motion repeat Confirm opening the exposed Unload dialog 80.5ms after release. Desktop boat-adjacent placement and the existing spatial closing fence now cover these cases. The final pre-content run passed all 11 checks with measured normal/reduced gaps of 51.7ms/152.8ms and no unintended dialog or action. No assertions were weakened or arbitrary sleeps added.

Bellwater phone labels initially inherited crowded baseline positions. Authored callouts now separate the six stops from landmarks and passengers. Native inspection also found an 8px desktop East Buoy/forecast overlap when the turn-7 forecast wrapped. Labels now reserve clearance from the actual forecast bounds; desktop and phone tests assert no group/local/forecast intersection at the affected states. After the 37-check run, native inspection found the Low Pier row covering rabbit ear tips at East Buoy. Its Bellwater-only desktop placement now reserves space above the actual aboard passenger bounds. A focused rendered-bounds guard and all nine repeated Bellwater scenarios pass; all six desktop captures were independently re-inspected with no remaining concrete visual finding.

One exploratory mouse capture was invalidated by an HMR reset during integration. It was rerun successfully on stable source; that timeout is not treated as a gameplay defect or counted as a passed initial run. The final suite starts from the separate frozen snapshot above.

## Remaining uncertainty and next action

- Physical phones, Safari, Firefox, platform font differences, native GPU performance, screen-reader speech and audio on speakers were not verified. Touch is emulated; no performance guarantee is claimed.
- Independent Linux / Chromium 141 broad-suite timeouts remain inconclusive. These Windows results neither relabel that run nor establish its cause or a recording-related explanation.
- Fresh `npm ci` was not repeated; dependencies and lockfile are unchanged. The documented build uses the installed locked dependency set.
- The broader shared environment pass, campaign systems and further coves remain outside scope. Puzzle satisfaction awaits the user playtest.
- Next: user playtest of Bellwater, then decide the planned shared environment pass. The authorized handoff commits/pushes the audited implementation normally and updates draft PR #1. The final SHA and verified remote equality are supplied in the PR and chat handoff; main stays unchanged. No review approval, merge or readiness transition is requested.
