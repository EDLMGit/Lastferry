# Refinement browser verification

All runs used Windows, Node 24.15.0, Playwright Chromium 156, headless SwiftShader, DPR 1, one worker. Desktop is 1440×900; touch phone contexts are 844×390 and 780×390. These are emulated viewports, not physical phones or native-GPU performance measurements. Runtime captures used a frozen copy at port 5185; production verification used the built app at 4180. The frozen final runtime hash is `f48aa67712f913a50af4d527e3936e9b568cbfac86ccddf13e79ab44ba0979f2`, based on HEAD `31ad851a97907c8e86aa6f215b78b38caed7c48b` plus the recorded working-tree changes.

## Commands and original outcomes

The common PowerShell environment was:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='../.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT='5185'
$env:LAST_FERRY_PRODUCTION_PORT='4180'
```

1. `LAST_FERRY_REVIEW_DIR=reviews/refinement/initial-browser` with `npx playwright test --grep 'home refinement:|production bundle:|Holding Pier: unloading Undo|phone-narrow-contextual|atmosphere: longest crossings|atmosphere: audio persistence|environment: reduced motion'`: **6 passed, 6 failed**, 5.5 minutes. Source manifest SHA-256 `25ab25c9e7be71730492b5545098879e1f1dd67024974b5a7631d4d2eb1a090e`. Two new phone assertions expected obsolete nonadjacent text; three new audio assertions expected null/string instead of the documented boolean `pendingTerminal`; one existing navigation assertion expected the old exact Harbor accessible name. Original reports, test source, screenshots and videos are retained under `initial-browser/`, with bulky artifacts in ignored `raw/`.
2. `LAST_FERRY_REVIEW_DIR=reviews/refinement/affected` with `npx playwright test --grep 'home refinement: (844px|780px|reduced motion|actual adaptive|hidden winning)|phone-narrow-contextual'`: **5 passed, 1 failed**, 4.9 minutes. Source manifest SHA-256 `1b7800ee9af3c9de88478e51c3650c30d7f79776311dec5abca9077a2afc6753`. Only the two test files changed; their exact corrections are retained beside the report. The old narrow-phone Cancel double-tap check reopened the underlying Harbor inspection. The failed pair's timing was not instrumented, so its cause remains unproven.
3. `LAST_FERRY_REVIEW_DIR=reviews/refinement/final-modal` with `npx playwright test --grep 'phone-narrow-contextual'`: **0 passed, 1 failed**. A new read-only trace assertion was accidentally placed between the first and second tap, so this harness attempt only executed one tap. The source and failure are retained; it establishes no runtime defect.
4. `LAST_FERRY_REVIEW_DIR=reviews/refinement/modal-verified` with the same single-test command: **1 passed**, 57 seconds. Source manifest SHA-256 `d58db75bf298622f06e94055935be31a547b6ca91bf831c5b36303d63259e13a`. The corrected instrumentation records two trusted clicks at the same `(319,234)` point, 112.2 ms apart. The existing 180 ms closing fence blocks the underlying Harbor inspection. Original state, dialog-closed, viewport, keyboard recovery and passenger-subset assertions remain intact. No runtime change was made for this investigation.

The four commands cover **12 distinct selected checks successfully across initial and affected runs**. This is not a claim that the full browser suite passed cleanly in one run. No unrelated full-suite rerun was performed.

## Verified behavior

- Actual UI Holding Pier and Bellwater rescues, both tide rises and complete Undo; terminal Undo and redelivery; both tempting Holding Pier losing alternatives retain their outcomes. A real production First Crossing rescue passed with development hooks absent.
- Named map targets, current Home context, route inspection, normal keyboard Tab/Shift+Tab/Enter/Space/Escape, touch subset choices and boundary warnings; phone controls remain wholly inside the viewport with the existing readability/touch assertions.
- Persistent Home label and lamp before rescue, loaded arrival, victory, Undo and restart; zero ferry/modal overlap at both phone widths. Contact follows loaded/unloaded hull draft and idle bobbing; reduced motion stays settled.
- Long/reverse crossings and tide transitions retain accepted duration/phase behavior; hidden-page completion does not replay a delivery flash or cue. A hidden winning unload settles to the resting Home state; Undo restores the pre-win state.
- Actual post-master audio recording covers ordinary, deadline, homeward and won arrangements, idle, tide Undo, terminal Undo/redelivery and a complete score loop. See `AUDIO_QA.md` and the audio metadata for observed source/scheduler bounds and limitations.

## Cancel timing investigation

Separate read-only probes preserved in `affected/modal-probe*.json` recorded genuine immediate pairs at 32.8, 104.8, 43.9 and 133.9 ms: all stayed closed. Controlled late final pairs arrived over 1.2 seconds apart and reopened the inspection, outside the 180 ms double-activation fence. The baseline's same pixel was blank. A CDP synthesized two-touch gesture emitted pointer events but no compatibility clicks and was therefore not accepted as a Cancel test. The original failed pair's gap is unknown; the measured 112.2 ms final case verifies the intended rapid-input contract without widening assertions or claiming that original timing was measured.

## Visual and media review

Two matched baseline ordinary views and fifteen final native-size screenshots are retained under `before/` and `after/`. Root and the water-review agent inspected all fifteen final images at native size, including both phone widths and flooded low ground. The selected treatment narrows the shallow shelf and keeps sand/stone attached to the coast; no further visual edits were requested. Original-speed UI recordings, decoded-frame inspection and actual audio captures are linked in `MEDIA_QA.md`. Stills and software rendering do not establish physical-device smoothness or speaker/headphone mix quality.
