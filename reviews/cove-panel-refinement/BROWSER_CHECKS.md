# Cove panel refinement — browser verification

The reported three-passenger Harbor state is now directly exercised. All five matched baseline viewports reproduced clipped choice text and horizontal overflow. All six final capture runs and all five focused browser cases pass. This does not close the historical timing or physical-device limits.

## Environment and source

Windows, Node 24.15.0, Playwright 1.64.1, Chromium 156.0.8078.4, SwiftShader, DPR 1. Phone input uses Chromium touch emulation; vertical-scrolling observations use the ordinary browser mouse wheel. The computed control font is the existing Segoe UI / Arial / sans-serif system stack at 16px. No Android-font or physical-device result is inferred.

The baseline is exact Git `a4325353cf11cd4edba8d5384b58fe138e4772e3`, isolated in `.cache/cove-panel-baseline` and served at port 5241. Its unchanged dependency declarations and lockfile reuse the parent installation through ordinary Node module resolution. The attempted optional junction was denied and was not required. The current development game is served at port 5240. The production build and native Windows IAB observation are separately recorded by the main review.

[Before source](before/source.json) and [after source](after/source.json) identify the exact inputs and capture helper. Final capture runtime hash is `dcea96f3f613b61c2dd76914ff134407d66d8d4dfab5ff08a6d680042ea2c054`; all source files were unchanged at the end of the six-size capture. [Browser source snapshot](browser/source-manifest.json) records the test/source scope at execution, hash `f53450e776e226d2c7e2b69e90c06911ab44603dd1d70de2a1b928807ba99dc4`. A later packaging audit ties these records to the final committed source without attributing working-tree captures to a future SHA.

## Reproduced baseline and actual text fit

Each baseline run reaches Harbor through real controls at turn 8, tide 2, Pip/Rue/Moss aboard, with all three selected for delivery but **before Confirm**. The screenshot crop supplied with the task is not treated as a viewport measurement.

| Viewport | Actual dialog width | Before preview scroll/client width | After preview scroll/client width |
| --- | ---: | ---: | ---: |
| 844×390 | 360px | 375 / 338 | 338 / 338 |
| 780×320 | 332px | 357 / 310 | 310 / 310 |
| 390×844 | 374px | 382 / 348 | 348 / 348 |
| 360×740 | 344px | 362 / 318 | 318 / 318 |
| 1440×900 | 400px | 397 / 370 | 370 / 370 |

All five originals fail in five concrete places: preview overflow, passenger-group overflow, and each of the three choices' full text exceeding its content box. The older two-rabbit losing-subset state does not fail those checks, explaining why that earlier screen did not expose this bug. These original results and images are preserved in [before/capture-manifest.json](before/capture-manifest.json).

The new [measurement helper](../../tests/e2e/cove-panel-measure.ts) walks each choice's actual text nodes and records every `Range.getClientRects()` line separately. Each line must fit within the choice's content bounds after border and padding. It also checks `scrollWidth` against `clientWidth` on the dialog, content, preview, passenger group, title, result/warning paragraphs, buttons and name/capacity children. A hidden scrollbar cannot turn a failure into a pass. The complete labels remain Pip / 1 space, Rue / 1 space and Moss / 2 spaces. The 62px-high tiles exceed the 48px target floor. Wrapping is legitimate; clipping is not.

All final measurements pass, including the additional real-game **320×740** run. [Matched comparisons](matched-comparisons.json) confirm identical committed Harbor states and selections. Initial ferry width ratio is exactly 1 at all five matched sizes, and the measured HUD heights are unchanged. Natural water and lighthouse phase is not artificially time locked. Images of the scrolled short-phone consequence supplement the initial full-choice image rather than pretending all vertical content fits at once.

## Executed behavior checks

[Five focused browser cases](browser/automation-results.json) pass in one completed run, 1.7 minutes:

1. New Harbor preview case: actual short-landscape rescue; losing subset and ordinary vertical scroll; tide Undo; all three aboard at Harbor; full per-line and nested fit; 0/1/2/3 selections; disabled empty Confirm; fixed dialog edges and confirmation position; unchanged committed state, history, HUD and camera; no early homecoming or victory music reduction; partial delivery and complete Undo; final rescue, terminal Undo and redelivery.
2. Existing portrait nested-control/focus check: decorative icon and label activation, explicit sound intent, normal Tab/Shift+Tab/Space/Enter/Escape and the previously fixed hidden-dock focus recovery. It retains the original full-viewport assertion.
3. Existing real touch pan/picking check: bounded pan, cancellation, view recovery, marker alignment and state conservation.
4. Existing cold Holding audio case: interaction-required browser policy, passive pre-gesture diagnostics and sustained real output after the first completed touch. This is an actual native audio start, not a held-resume mock.
5. Existing supported fullscreen case: actual API entry and Exit/re-entry with a visible open menu, then external exit and rotation with a selected subset retained. Simulated denial is not relabeled as native entry.

The new case also enters real fullscreen from the open menu before the rescue, returns through the same dialog, and later exits with a three-passenger partial selection open. The same selected state, focused passenger and scroll position survive exit; portrait rotation recomputes placement without losing selection. Natural keyboard cancellation returns to visible Let ashore/Bring home. Tapping the decorative glyph, live name, and non-action panel text does not commit an extra action or select the map underneath. [Detailed observations](browser/panel-subsets-lifecycle.json).

The six final capture runs independently complete Holding through the actual interface. Every run exercises the losing rabbit subset, tide Undo, all Harbor subset counts, cancellation, arrival and terminal Undo/redelivery. No solved state is injected. The before-Confirm checks hold turn 8, tide 2, all passengers aboard, history length 8 and Home 0/3 until commitment; homecoming remains inactive, celebration count zero, camera factor 1 and victory music target 1. The new copy says “Everyone will be safely home at Harbor” and labels the projection “After this action.” See [after/capture-manifest.json](after/capture-manifest.json).

## Original failures and limits

The first exploratory current 780×320 run passed its layout, subset and pre-commit assertions, then unexpectedly reset to turn 0 after a recorded successful redelivery. A developer catalog write occurred during that exact interval. A Vite reload from the gallery graph is plausible but was not proven because the original run did not trace navigation. The result is retained as an **inconclusive concurrent-development run**, not a gameplay pass or a confirmed input defect. After freezing all sources, a traced repeat and all six final runs passed without changing gameplay or adding action delays. [Preparation record and original failure](PREPARATION.json).

The optional junction denial, one duplicate server-start attempt against an already-running port, and a first source-manifest write before its output directory existed were setup issues, not game failures. The source snapshot succeeded after creating its directory. The five final browser cases did not fail.

The existing selected-card/dock overlap, prior delivered-heading observation and ≤180ms rapid-touch condition remain open. This pass does not recategorize old mouse/touch timing misses. The new fixed sheet deliberately permits vertical scrolling on short screens; Close and Confirm remain available. Physical Android, alternate engines, native-GPU performance, different platform fonts, new listening and comprehensive accessibility certification remain unverified. Unchanged rules and existing units protect the other coves; this pass does not claim a fresh full rescue in both other coves.

## Moving evidence

[Uninterrupted gameplay](gameplay-844.webp) is the complete 38.8-second native 844×390 interface recording, with Menu/Settings, rescue, warning scrolling, three-passenger pre-confirmation, subset toggles, cancellation, arrival and Undo/redelivery. The silent animated WebP samples 8fps with no cuts, crop or speed change; endpoint rounding gives 38.75 seconds. All 300 frames decode. The original VP9 also decodes without errors and remains local/ignored. [Hashes, action times and source](VIDEO_EVIDENCE.json).

## Exact commands

From the repository root, with Node 24:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='../.cache/ms-playwright'
node tools/capture-cove-panel.mjs --base=http://127.0.0.1:5241 --source=.cache/cove-panel-baseline --baseline=true --output=reviews/cove-panel-refinement/before
node tools/capture-cove-panel.mjs --base=http://127.0.0.1:5240 --sizes=780x320 --output=reviews/cove-panel-refinement/development/initial-fit
node tools/capture-cove-panel.mjs --base=http://127.0.0.1:5240 --sizes=780x320 --output=reviews/cove-panel-refinement/development/traced-fit
node tools/capture-cove-panel.mjs --base=http://127.0.0.1:5240 --sizes=844x390,780x320,390x844,360x740,1440x900,320x740 --output=reviews/cove-panel-refinement/after

$env:LAST_FERRY_DEV_PORT='5240'
$env:LAST_FERRY_PRODUCTION_PORT='4195'
$env:LAST_FERRY_REVIEW_DIR='reviews/cove-panel-refinement/browser'
npx playwright test tests/e2e/cove-panel.spec.ts tests/e2e/cove-ui-assets.spec.ts tests/e2e/phone-playability.spec.ts tests/e2e/phone-audio-fullscreen.spec.ts --grep 'cove panel final preview|cove assets nested activation 390|phone camera input|phone audio cold holding-pier|phone supported fullscreen running' --output=.cache/cove-panel-browser
```

The browser cases use port 5240. The existing port 4195 preview satisfies the inherited test configuration's second-server readiness; production rendering is separately observed. Required before/after and supplemental screenshots are source-tied in their manifests. If packaging moves unselected duplicates to a local ignored archive, the review's archive map records their original names and hashes.
