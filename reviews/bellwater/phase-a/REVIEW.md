# Bellwater prerequisite — responsive and input checks

**Pass after bounded fixes; content work began after this run.** The source is reviewed HEAD `e9c81d620df5fca0983965e80c348260fb3518e9` plus the Phase A working-tree changes in `tested-changes.patch`. The exact 49-file snapshot is `source-manifest.json`, SHA-256 `5e213ec18a06676bde1e4d29a6388d7e355ad91516344aa2e8cb2966c5278770`. Source stayed unchanged through execution and capture. Later Bellwater content has its own snapshot and verification.

The original compact-layout mismatch was fixed by using the same 600px landscape condition in CSS and map positioning, clearing desktop inline top/left values when compact CSS owns the local card, and keeping its intrinsic width. A strict resize probe then found a small local-card overlap at 1024×601. Desktop placement now chooses a boat-adjacent position clear of map targets, HUD and forecast. A reduced-motion diagnostic also reproduced a second touch, 80.5ms after the first release, opening the newly exposed Unload dialog after the first action finished. Confirmation now uses the existing brief spatial closing fence to prevent that background activation; keyboard input remains unaffected.

Environment: Windows 11, Node 24.15.0, npm 11.12.1, Playwright 1.64.1 / Chromium 156.0.8078.4, SwiftShader, DPR 1. Touch is trusted Chromium emulation. Rapid-input probes run without video and record actual pointer/click timestamps and targets; elapsed automation time is not assumed to be a rapid tap.

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = '../.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT = '5178'
$env:LAST_FERRY_PRODUCTION_PORT = '4178'
$env:LAST_FERRY_REVIEW_DIR = 'reviews/bellwater/phase-a'
npm run build
npm run typecheck
npx playwright test tests/e2e/responsive.spec.ts tests/e2e/game.spec.ts tests/e2e/navigation.spec.ts tests/e2e/production.spec.ts --grep 'responsive|rapid phone Confirm|flood loss|contextual|production bundle'
```

| Check                                                                          | Actual result                                                                                       |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Production build / TypeScript                                                  | Pass; Vite large-bundle advisory retained                                                           |
| Four Holding Pier mouse/touch cases at 844×500 and 1024×600                    | Pass; actual unload → sail before resize, Undo, all breakpoint resizes, complete nine-action rescue |
| Resize through 480/481/600/601, 1440×900, 844×390 and 780×390                  | Pass; natural-height local card, full viewport, no map/forecast overlap                             |
| Three existing contextual desktop / phone scenarios                            | Pass                                                                                                |
| Existing reduced-motion loss → Undo → safe boarding rescue                     | Pass                                                                                                |
| Existing production First Crossing rescue                                      | Pass                                                                                                |
| Rapid normal Confirm, measured release-to-next-press 51.7ms                    | Pass; exactly one history entry, no unintended dialog/action                                        |
| Rapid reduced-motion Confirm after actual animation idle, measured gap 152.8ms | Pass; exactly one history entry, no unintended dialog/action                                        |

Fresh browser result: **11 passed, 0 failed, 0 skipped**, 224.05 seconds, `automation-results.json`. Pointer traces are in `rapid-confirm-normal.json` and `rapid-confirm-reduced.json`. Gameplay screenshots are enumerated in `capture-manifest.json`; the 844×500 touch and 1024×600 mouse unloaded views were inspected at native size and show clear local actions, Shallows and forecast.

Earlier exploratory runs found the two follow-up defects above (initial 3 pass / 4 fail; focused diagnostic 0 pass / 2 fail). Their disposable diagnostics remain locally in `.cache/bellwater-precheck/`; they are not reported as passing. The final run covers both fixes. No state assertions were weakened and no arbitrary waits were added.

The independent Linux / Chromium 141 broad-suite timeouts remain inconclusive. This Windows run does not relabel that run as passed, establish why it timed out or establish that recording caused it. Physical phones, Safari and Firefox were not run.
