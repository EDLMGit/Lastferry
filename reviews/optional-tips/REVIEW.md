# Optional tips

Task OPTIONAL_TIPS_01 starts from `e8e0c8d360c29246b8d9a8fd202950ebfba55329`, a clean fast-forward above accepted game `8fc0d35f772af73adf06a9dff112b749cbad233a`. The publication receipt remains private Site version 16.

Tips defaults Off for fresh and existing players without a saved preference. Home Options and the play Settings use the same native Off/On choice. It has its own local storage key and stays usable in the current session when storage fails.

Off removes predictions about future losses and proactive comparisons of a selected transfer load against other passages. Actual load, draft, action cost, route depth/direction, forecasts and deadlines stay available. Legal single-passenger transfers act directly. On restores the existing guidance. Actual committed losses explain what happened and offer Undo in either mode.

The native preference is labeled Tips with Off and On values. It is available through the existing Home Options and play Settings. Toggling consumes no action or Undo entry, and Undo leaves it selected. A missing, invalid or unreadable saved value starts Off. The pure copy helpers retain their older default argument for existing callers; every application call supplies the shared preference explicitly.

Ready for review of this scoped interface change. No new gameplay defect remains from the focused checks. The private Site still serves accepted game `8fc0d35f772af73adf06a9dff112b749cbad233a`, version 16; this pass is not deployed.

## Matched actual phone views

| Decision | Tips Off | Tips On |
| --- | --- | --- |
| Wide Berth, legal losing Sail, portrait | [Off](phone/wide-berth/390x844-losing-sail-off.png) | [On](phone/wide-berth/390x844-losing-sail-on.png) |
| Wide Berth, same Sail, short landscape | [Off](phone/wide-berth/780x320-losing-sail-off.png) | [On](phone/wide-berth/780x320-losing-sail-on.png) |
| Reef Return, loaded Wait at the final turn, portrait | [Off](phone/reef-return/390x844-losing-wait-off.png) | [On](phone/reef-return/390x844-losing-wait-on.png) |
| Reef Return, same Wait, short landscape | [Off](phone/reef-return/780x320-losing-wait-off.png) | [On](phone/reef-return/780x320-losing-wait-on.png) |
| Wide mixed subset | [Off](phone/wide-berth/390x844-mixed-subset-off.png) | [On](phone/wide-berth/390x844-mixed-subset-on.png) |
| Reef mixed subset | [Off](phone/reef-return/780x320-mixed-subset-off.png) | [On](phone/reef-return/780x320-mixed-subset-on.png) |
| Genuinely shallow passage, same factual reason | [Off](phone/reef-return/780x320-blocked-off.png) | [On](phone/reef-return/780x320-blocked-on.png) |

These pairs use identical puzzle states at native 390×844 and 780×320 CSS pixels, DPR 1. They show real touch-emulated Chromium gameplay. The live water and lighting keep running between captures.

Native inspection found readable Tips choices and complete commit controls at both sizes. The portrait examples show complete consequence paragraphs. Short landscape retains the existing scrollable dialog body: long Tips On consequences and Settings help can require scrolling, while Back/Confirm remain in the fixed footer. This pass does not claim every paragraph is simultaneously visible at 320px height.

The Wide comparison stages one rabbit aboard at High Quay before the first reversal. Tips On names the resulting shortage of homeward trips and shows Sail anyway. Off leaves the current and tide facts in view, with ordinary Sail. The Reef comparison keeps the full boat at Cairn Quay before action 9. Off shows the resulting tide and depth. On additionally explains that the boat would be unable to reach a dry landing.

After committing those actions, both settings show the actual loss and offer Undo. The Wide single-rabbit Let ashore test commits directly with Tips Off. With Tips On, that same legal losing action opens the existing warning chooser. A real multi-passenger choice keeps its subset controls in both modes. [Actual Wide loss with Tips Off](phone/wide-berth/390x844-actual-loss-off.png) · [Actual Reef loss with Tips Off](phone/reef-return/780x320-actual-loss-off.png) · [Short-landscape Settings](phone/wide-berth/780x320-settings-off.png)

## Verification

- Production build and TypeScript passed with Node 24.15.0 on Windows. Vite retains the existing large-chunk warning. [Build](build.txt)
- All 66 relevant unit cases in eight files passed. Coverage includes copy, location facts, direct transfers, Motion preference compatibility, production witnesses for both repaired coves and the new preference. The witnesses produce identical per-action state and complete Undo snapshots under Off and On. [Unit results](units.txt)
- All 79 asset families validated. Only the existing `ui.dialogs` inventory entry changed. The existing gallery labels its warning specimen Tips On. [Validation](assets.txt) · [Inventory](../../assets/catalog.json)
- Browser checks compare Off/On on both phone sizes, commit actual losing choices and undo them, inspect blocked routes, change subsets and clear stale warnings. Portrait runs replay the complete 12-action Wide and 10-action Reef rescues under both preferences. A separate short-landscape production run completes Reef with default Tips Off, including loss, tide Undo and terminal Undo without development APIs.
- Natural Tab, Shift+Tab, Enter, native select navigation and Escape reach Home Settings and return focus to Options. The preference survives Settings reopening, restart, cove changes and reload. A second browser context denies Tips reads and writes while preserving an in-session choice. Both check byte-identical Journey saves and no Journey-storage writes.

All **six distinct browser cases pass** across the recorded runs. The [first batch](browser.txt) passed 5/6, including production and all four cove/size combinations. Its [original JSON](iterations/first-browser-results.json) retains the failed Settings case. The [final recheck](recheck.txt) passed 3/3: corrected Settings lifecycle plus the two Reef camera recaptures. [Final recheck JSON](phone/automation-results.json)

The [source capture](tested-source.json), [runtime diff](runtime.patch) and [media audit](MEDIA.json) identify the actual tested working tree above the continuity baseline and compare its files with the staged Git content. The accepted mechanics, scene, audio, campaign sources, level data and version-16 receipt are checked for changes against that baseline. Initial evidence was captured 7 November; the final Reef/Settings recheck was captured 10 November on the identical runtime source. The media audit records those files together without relabeling either run as captured from a later commit.

Reproducible commands from the repository root (PowerShell, Node 24):

```powershell
npm run build
npm run check:assets
npm run test:unit -- tests/unit/optional-tips.test.ts tests/unit/presentation.test.ts tests/unit/location.test.ts tests/unit/reef-return-presentation.test.ts tests/unit/direct-transfer.test.ts tests/unit/motion-preference.test.ts tests/unit/wide-berth.test.ts tests/unit/reef-return.test.ts --maxWorkers=1 --reporter=dot
$env:LAST_FERRY_DEV_PORT='5270'
$env:LAST_FERRY_PRODUCTION_PORT='5290'
$env:LAST_FERRY_REVIEW_DIR='reviews/optional-tips/phone'
npm run test:e2e -- optional-tips.spec.ts optional-tips-production.spec.ts
npm run test:e2e -- optional-tips.spec.ts --grep 'shared Tips|reef-return Tips'
```

This environment used installed Playwright Chromium under `../.cache/ms-playwright`, selected with `PLAYWRIGHT_BROWSERS_PATH`. The six browser cases and 12 preference unit cases are new; the other 54 unit cases are existing checks. Browser version, viewport, reduced-motion mode and touch input are recorded beside each capture. Screenshots use the real UI, and rescues commit through its controls; read-only development state snapshots support the assertions. The production rescue uses the built app without development APIs.

## Original failures and limits

The first new unit run passed 11 of 12. Its failed expectation searched for “current” in an existing blocked-route explanation that instead names the direction. The corrected assertion checks the direction. The retained record is explicitly a summary of the actual tool output. [Unit observation](iterations/first-unit.txt)

The first short-landscape browser attempt failed when an exact label locator did not resolve the nested select. The accessibility tree correctly exposed a Tips combobox. The corrected test checks that role and exact accessible name. The failed runner stalled during its preview-server cleanup and was stopped after preserving the failure. Later runs use a separately running preview. [Original browser log](iterations/browser-label.txt) · [Failure context](iterations/browser-label-context.md)

The first six-case browser batch passed five cases and timed out in the Settings test. That test incorrectly expected reloading root Home → Practice to return to the game; root reload correctly returns Home. It now verifies the remembered preference through Home Options, reenters Practice, then tests a direct cove reload. A diagnostic attempt also hit a 10-second navigation timeout during cold loading, before testing Settings. Action timeouts remain 10 seconds; navigation has its own 60-second bound and the overall case retains its original 180-second bound. The diagnostic runner stalled during server cleanup and was stopped by its verified process ID. These are retained test/setup failures, not removed gameplay failures. [First batch](browser.txt) · [Original Settings context](iterations/settings-timeout.md) · [Diagnostic log](iterations/settings-debug.txt)

The original Reef Wait captures used different camera modes despite identical game state. Both Reef cases were rerun with an explicit Play view before each comparison; the first mismatched frame is retained in [iterations](iterations/unmatched-reef-camera.png). The runtime source was unchanged by these test-only corrections.

The full historical browser/geometry suites, a physical phone and spoken screen-reader output were not rerun for this interface change. Phone evidence uses Chromium with touch emulation and SwiftShader. Inherited portrait-loading, constrained-overlap, delivered-heading, precise rapid-touch, performance and acoustic limits remain outside this pass and are retained in project continuity. Source/document whitespace checks pass; generated logs and the source patch retain their original whitespace. This pass leaves the version-16 private publication as recorded. Human review of the optional-tips presentation is pending.

## Local play

Run `npm ci` with Node 24, then `npm run dev -- --host 127.0.0.1 --port 5270`. Open [Home](http://127.0.0.1:5270/), [Wide Berth](http://127.0.0.1:5270/?cove=wide-berth) or [Reef Return](http://127.0.0.1:5270/?cove=reef-return). Use Menu → Settings → Tips in a cove or Options on Home.
