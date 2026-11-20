# Cove interface browser verification

24 distinct browser cases pass across the retained runs. This is not a claim of one clean combined run: the first 24-case run passed 23 and exposed one portrait keyboard focus defect. The affected cases and three further portrait repetitions pass after its narrow recovery fix.

## Environment and identity

- Windows, Node 24.15.0, Playwright 1.64.1, Chromium 156.0.8078.4, SwiftShader, DPR 1. Phone input is Chromium touch emulation, not physical Android.
- Browser tests and capture use the actual development game at `http://127.0.0.1:5230`; the untouched reviewed runtime was isolated at port 5231 for baseline captures. The tests drive native controls and read diagnostic state; they do not inject a solved puzzle state.
- The cold audio cases launch with interaction-required autoplay policy and passive CDP reads (`userGesture:false`) before the first completed touch. Held resume and denial scenarios are explicitly simulated; actual fullscreen entry is tested separately.
- Starting Git identity: `8052cfcd67f2e56cf3258243618c4ce125d51c4b` plus the recorded working tree. Captures are not retroactively attributed to the later handoff commit.
- Initial full browser source manifest: [browser-final/source-manifest.json](browser-final/source-manifest.json), hash `a0592e663967d1bb59557a50284c092fa806b7e9f604cf9c56f03269bd9a8312`.
- After the focus fix: [browser-focus-guard/source-manifest.json](browser-focus-guard/source-manifest.json), hash `e3736e6d7b77ef076c94c94ee9312e62386ac28eb22616bd4bb276bda0174b30`.
- Touch capture runtime hash: `ea0fb018bb39362f6b0157363eca4a093194c4e8cbef03e789463fd3cc2ba264`. Final gameplay runtime hash in the same scope: `3b034e49033689ad8748ae865fc8c9bfcb5b7480c622f4eb7bc76e3fa3991d59`.
- [source-reuse.json](source-reuse.json) verifies that replacing only `focusAvailable` with its prior three-line function reconstructs the captured `main.ts` bytes exactly. The mouse/touch screenshots and recording never exercise the later keyboard-only recovery branch. Developer inventory/gallery metadata has a separate scope.

## Executed results

| Run | Result | Evidence |
| --- | --- | --- |
| Initial nested icon and label checks | 2/2 passed, 12.1 s; exploratory source | [Original JSON](development/nested-initial/automation-results.json) |
| Focused combined browser run | 23 passed, 1 failed, 358.0 s | [Original JSON](browser-final/automation-results.json), [original focus failure](browser-final/original-focus-failure.md) |
| Instrumented focus investigation | Three candidate and three baseline semantic sequences restored focus; additional per-Tab observation changed cadence, so this did not clear the failure | [Traces](focus-reproduction/results.json) |
| Same input sequence, synchronous event tracing | 2 passed, 1 failed, 26.0 s; reproduced naturally without CPU throttling or extra keyboard delays | [Original JSON](focus-reproduction/unchanged-input/automation-results.json), [failure trace](focus-reproduction/unchanged-input/nested-390x844.json), [failure context](focus-reproduction/unchanged-input/failure-context.md) |
| Affected verification after recovery guard | 3/3 passed, 71.3 s: both new phone cases and the desktop cross-cove keyboard case | [JSON](browser-focus-guard/automation-results.json) |
| Exact portrait sequence repeated after guard | 3/3 passed, 20.1 s; repetitions are not additional distinct cases | [JSON](browser-focus-repeat/automation-results.json) |
| Matched capture sequences | Five complete Holding rescues at 844×390, 780×320, 390×844, 360×740 and 1440×900; no page errors; source guard passed | [Capture manifest](after/capture-manifest.json), [matched comparison](matched-comparisons.json) |

The new nested cases tap the center of decorative SVGs and visible labels, check one committed action/history entry, Undo, native button ownership, stable button nodes, state-dependent icons, distinct lighthouse/recenter meanings, and ordinary Tab/Shift+Tab, Space, Enter and Escape. Passenger choices remain buttons with `aria-pressed`; deselecting everyone disables confirmation.

Existing passing coverage includes all five phone layout sizes, actual landscape and portrait rescue with mixed subsets, safe tide-boundary boarding, tide Undo, terminal Undo/redelivery, bounded touch panning, marker alignment, viewport rotation, nearby Wait/losing Sail confirmations, Bellwater rescue, and First Crossing's seven-action natural-keyboard rescue plus terminal Undo.

Audio checks cover cold completed touch in Holding and First Crossing, saved mute, explicit Enable, pending resume resolve/reject, Retry and Mute ownership, explicit Settings mute, late completion during a finger gesture and held Space. Dynamic sound glyph/label assertions were added at those actual states. Real fullscreen entry/exit/re-entry in pending and running audio states retains a visible open menu, subset selection and focus across portrait rotation and external exit. Enter/exit glyphs follow actual API state. The short-landscape rejected API/manual-copy case is a labeled simulation, not an actual browser rejection claim.

Reduced Motion is exercised by the passing rotation case. The separate integrated surface observation records all 13 sampled controls with zero transition duration after selecting Reduced in Settings; see [contrast.json](contrast.json). No new decorative frame loop, shader pass, remote icon/font request or broad backdrop blur was added.

## The focus finding and correction

The failing portrait sequence naturally Tabs through map stops before opening Let ashore. Map focus can schedule a camera change; under one delivery cadence the camera ends at Rabbit Pier while the boat's still-visible previous-frame button receives focus. After cancelling the preview, the current layout correctly hides that offscreen dock. The former focus helper tried to focus it because it still had a rectangle. The failure trace ends with empty active-element ID, `dock.hidden=false`, computed visibility `hidden`, and camera focus `rabbit-pier`.

The correction only handles keyboard recovery to Board/Let ashore when the dock is not intentionally hidden. It flushes pending layout and, if the dock is visually hidden, frames the current location and flushes again before the existing focus call. It changes no puzzle state or ordinary touch camera behavior. All four post-fix portrait observations finish with a visible, focused Let ashore at Stone. The original assertion remains; full viewport visibility was added. [Native portrait focus capture](browser-focus-guard/nested-390x844-focus-0.png).

## Screenshots and moving evidence

All 20 final game PNGs were inspected at native size: ordinary play, selected Stone, mixed rabbit subset and arrival at each required viewport. Before/after pairs have identical committed game states; ordinary boat width is exactly unchanged at all five sizes. Ambient water and lighthouse phase are natural, not locked to an artificial clock. [Inspection record](native-inspection-checks.json).

The capture manifest records upright Board/Unload glyphs at actual `+π/2` and `−π/2` berths, and Board / Let ashore / Bring home at their correct piers. The supplied specimen and developer gallery are design evidence, not substitutes for these game captures.

[Uninterrupted native-size gameplay](gameplay-844.webp) shows the whole 844×390 touch sequence, including local inspection, temporary unloading, mixed subset warning, boarding at the tide boundary, tide Undo, Harbor delivery and terminal Undo/redelivery. Its original 27.8-second VP9 file is retained locally under `after/raw/`. The animated WebP samples eight frames per second without cuts or speed change; the 27.75-second duration differs by 50 ms of endpoint frame rounding. All 218 WebP frames and the original video decode successfully. The recording is silent visual evidence, not an acoustic listening result. [Source, hashes and conversion details](VIDEO_EVIDENCE.json).

## Original limitations retained

- The prior delivered-heading observation of 1.425683 radians over 99.9 ms remains open. No steering threshold or sailing timing was changed or re-evaluated here.
- The rapid-touch ≤180 ms condition remains unverified. This pass does not convert the old 377.6/622.5 ms sequences or the no-click native-gesture experiment into passes. The previous mouse timing history remains intact.
- On short landscape and portrait, the selected current-location fact card can cover the dock action. This is present in both the reviewed 8052 baseline and this pass. Close remains reachable and exposes the action; it was not redesigned during the restyle. The desktop secondary selection hint also partly sits beneath Whole cove in both versions.
- Physical Android, other browser engines, native-GPU performance, browser font/platform variants and new speaker listening are not independently verified by these emulations. User acceptance of the published version 10 remains separate evidence.
- The first exploratory candidate capture failed its source-stability guard because concurrent CSS and catalog edits occurred. It is development evidence only; stable final captures replaced it. The initially bounded baseline run was intentionally interrupted while the package was missing; later isolated captures completed the required coverage. [Preparation record](PREPARATION.json).
- Unselected or duplicate images may be retained under ignored `raw/` with their original hashes and path mapping. Consult `archive-map.json` for packaging moves. Original JSON results, failures and source records remain preserved.

## Exact commands

Common environment for the browser runs, from the repository root:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='../.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT='5230'
$env:LAST_FERRY_PRODUCTION_PORT='4192'
```

The browser tests above use the development server. The retained port 4192 preview only satisfied the existing test configuration's server readiness; these cases make no production-endpoint requests. Production build and native supported-surface verification are recorded separately in the main review.

```powershell
$env:LAST_FERRY_REVIEW_DIR='reviews/cove-ui-assets/browser-final'
npx playwright test tests/e2e/cove-ui-assets.spec.ts tests/e2e/phone-playability.spec.ts tests/e2e/phone-audio-fullscreen.spec.ts --grep 'cove assets nested|phone layout|phone rescue|phone camera input|phone rotation|phone nearby decisions|desktop and other coves|phone audio cold holding-pier|phone audio cold first-crossing|phone saved mute|phone controlled resume|phone controlled pending mute|phone controlled explicit touch intent|phone controlled held Space|phone supported fullscreen pending|phone supported fullscreen running|phone fullscreen mocked rejected' --output=.cache/cove-ui-browser-final

$env:LAST_FERRY_REVIEW_DIR='reviews/cove-ui-assets/focus-reproduction/unchanged-input'
npx playwright test tests/e2e/cove-ui-assets.spec.ts --grep 'nested activation 390' --repeat-each=3 --output=.cache/cove-ui-focus-repro

$env:LAST_FERRY_REVIEW_DIR='reviews/cove-ui-assets/browser-focus-guard'
npx playwright test tests/e2e/cove-ui-assets.spec.ts tests/e2e/phone-playability.spec.ts --grep 'cove assets nested|desktop and other coves' --output=.cache/cove-ui-focus-guard

$env:LAST_FERRY_REVIEW_DIR='reviews/cove-ui-assets/browser-focus-repeat'
npx playwright test tests/e2e/cove-ui-assets.spec.ts --grep 'nested activation 390' --repeat-each=3 --output=.cache/cove-ui-focus-repeat

node tools/capture-cove-ui.mjs --base=http://127.0.0.1:5230 --output=reviews/cove-ui-assets/after
```

Baseline source and exact capture commands are retained in `before/source.json`, `before-portrait/source.json` and `before-rest/source.json`. The archived baseline's 53 runtime/data/build source files were checked byte-for-byte against reviewed Git 8052.
