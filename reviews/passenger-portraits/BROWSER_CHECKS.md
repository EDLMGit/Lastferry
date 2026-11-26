# Passenger portraits — focused browser verification

All six final browser cases pass in one completed run. All six final actual UI capture runs pass. Original fixture failures and interrupted development evidence remain explicit below; this is not an all-history-green or physical-device claim.

## Environment and source

Windows, Node 24.15.0, Playwright 1.64.1, Chromium 156.0.8078.4, SwiftShader, DPR 1. Phone sizes use Chromium touch emulation and ordinary browser wheel scrolling for lower content. The existing Segoe UI / Arial / sans-serif stack computes essential text at 16px; no Android-font result is inferred.

The baseline is exact reviewed Git `23a644aba24e6479b9d82a106a745d15c3f8c7dc`, isolated by `git archive` in `.cache/portrait-baseline` and served at port 5251. Parent installed modules resolve normally; no dependency installation or worktree reset was required. The current development app is port 5250. The fresh production server at 4196 supplies the inherited configuration's second-server readiness; these browser scenarios use the development base URL.

[Before source](before/source.json) and [after source](after/source.json) identify exact runtime inputs and capture/measurement helpers. The final after-capture runtime hash is **`cffea82a6bef375e586f646c4e4d231b703f90514b4818e9d9d613b259af2378`**. All runtime files were unchanged after all captures and remained exact after the browser run. The [scoped browser source record](browser/sources.json) was written after the run and says so; it does not invent a pre-run timestamp. Tests were frozen before the final six-case launch. The root packaging audit ties source and selected evidence to the final Git objects.

## Actual interface captures and fit

Six complete Holding rescues use actual controls at 844×390, 780×320, 390×844, 360×740, 320×740 and 1440×900. Eight states per size produce 48 final native PNGs: ordinary play, one sheep before unloading, both rabbits before boarding, losing rabbit subset, normally scrolled full warning, all three aboard at Harbor before Confirm, normally scrolled future consequence, and arrival.

Each run includes the real safe boarding/tide rise, tide Undo/reboarding, Harbor 0/1/2/3 selected states, cancellation, victory, terminal Undo and redelivery. No solved state is injected. Before Confirm the turn, tide, passengers, history, HUD and view remain unchanged, and no arrival or victory-music reduction starts. Confirm and dialog position stay within the existing 1px tolerance through all subset changes.

[Final capture measurements](after/capture-manifest.json) retain individual text-node `Range.getClientRects()` checks from the preceding pass. Every line must fit its choice's content box; normal wrapping is allowed. Nested `scrollWidth/clientWidth` checks cover the dialog/content/preview/group/title/warning/result/choice descendants. A hidden scrollbar never excuses excess width. New portrait measurements verify decoded 256×256 sources, fixed 44×44 display, complete containment inside the choice, decorative empty alt/non-draggable/non-pointer semantics and no overlap with the selected check. Every ordinary real-passenger tile remains 62px high.

[Matched comparisons](matched-comparisons.json) compare the same committed state at ordinary play, sheep choice, rabbit boarding and Harbor before Confirm. All actual framing fields match exactly at all six sizes; HUD height is unchanged and initial ferry-width ratio is exactly 1. Independent natural runs accumulate different view revision counters, which are recorded separately. They are not camera coordinates. Natural water/lighthouse phase is not time locked.

At 780×320 the final 144px grid minimum fits two 144.5px tiles in the actual 296px passenger group, keeping all three portraits and their full labels visible in two rows. The 320px portrait view stacks one column. Lower warnings/consequences deliberately scroll vertically on constrained screens, while Close and Confirm stay reachable. [Short-phone Harbor](after/780x320-harbor-preview.png), [full warning](after/780x320-warning-scrolled.png), [future consequences](after/780x320-harbor-consequence.png), [narrow Harbor](after/320x740-harbor-preview.png).

Native inspection of the supplied sources and actual gameplay is separately recorded by the root/identity review; this report does not substitute geometry assertions for visual judgment. The portrait board and gallery remain design evidence, not gameplay captures.

## Six fresh browser cases

[Automation results](browser/automation-results.json): **6/6 PASS in one 3.9-minute run**.

1. Existing Harbor lifecycle case, 59.4s: actual short-landscape rescue and losing subset scrolling, tide Undo, full text fit, all selection counts, unchanged committed state/effects, stable dialog/footer, partial delivery and full Undo, victory and terminal Undo/redelivery. Natural Tab/Shift+Tab/Space/Enter/Escape, portrait cancellation recovery, native fullscreen entry, external exit and rotation preserve subset, focus and scroll. Nested glyph/name activation and non-action panel taps do not act on the map.
2. New portrait identity case, 1.9min: actual controls show all nine level/passenger combinations across Holding, First Crossing and Bellwater. Holding partially delivers Pip/Moss, then shows Rue alone as tan; Undo restores the full load. Bellwater temporarily boards Tansy alone and reopens Lark alone as tan, undoes that extra action, then follows the accepted rescue with both rabbits and Bram aboard before his deadline. Reverse selection order commits rabbits as Lark/Tansy without changing their appearances. After partial delivery of Tansy/Bram, Lark alone remains tan; Undo and full redelivery win Bellwater. First Crossing shows its two aboard rabbits and Moss's boarding choice through actual interactions. No passenger/level state is injected.
3. New 780×320 delayed/failure case, 19.8s: holds only the actual PNG image request, leaving labels, 44px reserved slot and fixed footer usable before decode; after release, the correct 256px image appears with no geometry change. A failed image becomes a quiet invisible bitmap in the same reserved slot; all text and controls work, reopening is stable, and actual unloading still commits once. Taps at the image, check, name and blank button area each produce exactly one trusted choice click/toggle, with no turn/history/map change. Natural keyboard selection, cancellation and visible focus return pass.
4. The same delayed/failure/input case at 360×740, 13.5s. Button, dialog and footer positions/sizes stay within 0.75px before/after decode, failure, subset changes and reopening; ordinary tiles stay 62px.
5. Existing cold Holding audio case, 6.9s: unmodified native audio under interaction-required autoplay policy, passive pre-gesture diagnostics and first completed trusted touch produce sustained output with one context/scheduler. This is not the controlled held-resume mock. No new listening approval is inferred.
6. Existing supported fullscreen running case, 16.0s: real API entry, visible Menu hit targets, Exit/re-entry and external exit with subset open, then portrait rotation retain selection and state. Native fullscreen is distinct from mocked denial or physical Android. The same shared dialog root/fullscreen engine is retained by source inspection; no portrait overlay is introduced.

[Identity observations](browser/portrait-identities.json), [780 loading](browser/portrait-loading-780x320.json), [360 loading](browser/portrait-loading-360x740.json), [Harbor lifecycle](browser/panel-subsets-lifecycle.json), [native fullscreen](browser/fullscreen-running.json), [cold audio](browser/cold-holding-pier.json).

One scene canvas is present throughout the new identity checks. Each choice uses one ordinary static image and native button; source inspection introduces no portrait context, renderer or render loop. Text, species ordinal and appearance are level/ID owned, not image-file-name or current-list-position guesses.

## Actual image payloads and moving evidence

[First observed image requests](image-transfer.json) record real `PerformanceResourceTiming` image entries, excluding Vite's PNG import modules:

| Variant | Encoded/decoded image bytes | First local transfer bytes |
| --- | ---: | ---: |
| rabbit-cream | 27,139 | 27,439 |
| rabbit-tan | 28,653 | 28,953 |
| sheep-wool | 43,602 | 43,902 |

Total PNG payload is 99,394 bytes. The local first transfers add 300 bytes per response; repeated dialog openings/navigation can use memory/conditional cache responses and are not assumed to download that payload again. Generator/source/alpha provenance is documented separately by the asset review. The offline SVG-derived shading is not described as a live WebGL screenshot.

[Uninterrupted actual gameplay](gameplay-844.webp) preserves the full 38.48-second native 844×390 source recording. The silent 8fps animated WebP has 298 decoded frames, a 38.5-second duration from 20ms endpoint rounding, and 3,005,720 bytes. No cut, crop or speed change. It shows the single sheep, both rabbits, losing subset/full warning, safe tide-boundary boarding, tide Undo, three-passenger Harbor before Confirm, all subset counts, cancellation, delivery and terminal Undo/redelivery. The original VP9 fully decodes and stays local/ignored. [Exact hashes, commands and action times](VIDEO_EVIDENCE.json).

## Original failures and remaining limits

[Preparation record](PREPARATION.json) retains the actual sequence:

- The initial baseline setup call used a not-yet-created working directory and was rejected before commands ran; separate root creation/extraction and server startup succeeded.
- Initial 10rem and 9.25rem grids passed line/containment/rescue checks, but native short-phone inspection showed an avoidable third-row fold. The final 9rem/144px minimum keeps the complete real labels and two-column short-phone layout. All original trial images/manifests remain recorded.
- The first delayed-image fixture held Vite's PNG?import JavaScript module as well as the image, timing out cold page load at the unchanged 180000ms limit. Restricting the fixture to resourceType=image fixed the test setup; the app required no change.
- The first Bellwater mapping fixture spent an extra boarding action, then incorrectly expected play to continue after Bram's correct turn-8 flood loss. The revised real-UI sequence undoes that temporary partial boarding and rescues Bram on time. The original failure and both accompanying loading passes remain retained.
- One capture was interrupted to stop concurrent SwiftShader work while the parent reran unit gates. Its 844 case had passed and 780 had reached Harbor; it remains incomplete development evidence. All six final captures ran afterward from frozen source.
- The initial cross-run comparison erroneously required equal view revision counters. Diagnostic inspection proved all actual camera/framing values, state, HUD and initial ferry width were exact. The final comparison retains the raw counters separately while requiring every actual framing field to match. Existing within-interaction placement/view assertions and tolerances were not weakened.

The parent review separately retains its two original 5000ms geometry-unit timeouts under concurrent browser CPU load and unchanged-limit final unit rerun. No all-history-green claim is made.

Existing constrained card/dock overlap, the prior delivered-heading observation and ≤180ms rapid-touch condition remain open. Physical Android, alternate engines, native-GPU performance, other platform fonts, full accessibility certification and new acoustic judgment are unverified. The full historical browser suite was not rerun. The current six cases and actual captures are fresh; broader unchanged audio/world results are preserved source evidence, not relabeled fresh tests. The private Site remains confirmed version 11 without these portraits; no deployment was performed.

## Exact commands

From the repository root with Node 24:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='../.cache/ms-playwright'
node tools/capture-portraits.mjs --base=http://127.0.0.1:5251 --source=.cache/portrait-baseline --baseline=true --output=reviews/passenger-portraits/before
node tools/capture-portraits.mjs --base=http://127.0.0.1:5250 --sizes=780x320 --output=reviews/passenger-portraits/development/initial-fit
node tools/capture-portraits.mjs --base=http://127.0.0.1:5250 --sizes=780x320 --output=reviews/passenger-portraits/development/grid-refined
node tools/capture-portraits.mjs --base=http://127.0.0.1:5250 --sizes=780x320 --output=reviews/passenger-portraits/development/grid-144
node tools/capture-portraits.mjs --base=http://127.0.0.1:5250 --output=reviews/passenger-portraits/after
node tools/compare-portrait-captures.mjs

$env:LAST_FERRY_DEV_PORT='5250'
$env:LAST_FERRY_PRODUCTION_PORT='4196'
$env:LAST_FERRY_REVIEW_DIR='reviews/passenger-portraits/browser'
npx playwright test tests/e2e/portrait.spec.ts tests/e2e/cove-panel.spec.ts tests/e2e/phone-audio-fullscreen.spec.ts --grep 'portrait identities|portrait loading|cove panel final preview|phone audio cold holding-pier|phone supported fullscreen running' --output=.cache/portrait-browser-final
node tools/finalize-portrait-video.mjs
```

The exact baseline/early-trial capture helper is retained byte-for-byte as `before/capture-tool.txt`; its source filter was subsequently made clearer without changing the UI actions or measurement logic. Its hash matches the original baseline source record. Original browser runs used review directories `development/browser-initial` and `development/browser-refined`, preserving their outcomes rather than overwriting them with the final run.
