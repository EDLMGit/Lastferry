# Short landscape viewport check

The reviewed `fa07368b803a992712a5126b85862c5b91dbcf3a` source reproduces a real clipping defect at **780×320**. The game/canvas is 360 px high because of its minimum height. The lower forecast button occupies y=298–354 in a 320 px viewport: only 22 of its 56 px are visible, and its center is outside the viewport. At **844×390**, that button is fully visible.

The correction is one CSS rule inside the existing short-landscape media query: `.game { min-height: 0; }`. This lets the existing `100svh` height determine the available scene space. It does not change camera code, location selection, action logic, or portrait layout. At 780×320, the forecast now occupies y=258–314 and its entire 56 px touch target is visible. The established 844×390 layout retains its dimensions.

## Evidence identity

- Original source: exact Git archive of `fa07368b803a992712a5126b85862c5b91dbcf3a`, served on `http://127.0.0.1:5192/`.
- Comparison and focused-test source: that same archive with **only `src/style.css` changed** to include the landscape correction. It intentionally excludes the concurrently developed transfer sound changes; these screenshots do not establish the new sound behavior.
- Original runtime/data/config SHA-256 manifest identity: `60617c88dec76b6232459953785cdb27890138cbbb33a9333a2ec05eb076c4d9`.
- Corrected runtime/data/config SHA-256 manifest identity: `2b8ff4f99d6a1bb53a8ef0cb6f31d441d741e6f9064264fca2d3b2afb1107b5b`.
- Per-file source hashes, screenshot hashes, UTC capture times, geometry, and source stability checks are in `phone-before/manifest.json` and `phone-after/manifest.json`. Focused-test provenance is in `phone-focused/manifest.json`.
- Environment: Windows, Node 24.15.0, headless Chromium 156.0.8078.4, SwiftShader WebGL, DPR 1, Playwright touch/mobile emulation. One browser ran at a time. **No physical Android device was tested.**

## Actual checks

| Check | Result |
| --- | --- |
| Original 780×320 regression assertion | **Failed as expected on the unmodified baseline**: game height expected 320, received 360. Preserved in `phone-before/assertions/automation-results.json` and `error-context.md`; not replaced by the passing run. |
| Original 844×390 geometry | Passed: forecast/current action/preview controls fit the viewport. |
| Corrected 780×320 and 844×390 comparison | Passed: ordinary view, selected-current card, unloading preview, and forecast dialog show no clipped recorded controls. |
| Focused browser checks | **2 passed**, 1.7 minutes total. `tests/e2e/transfer-phone.spec.ts`, results in `phone-focused/automation-results.json`. |
| Touch and natural keyboard | Passed: actual taps; Tab/Shift+Tab, Enter, Escape; forecast inspection; selection; unloading preview cancellation/focus recovery; confirmation. No test `.focus()` calls. |
| Transfer/Undo/rescue | Passed at both sizes: temporary unloading, full Undo, passenger subset loss preview without committing, both rabbits boarding across the tide rise, full Undo/replay across that rise, nine-action rescue, keyboard terminal Undo. |
| Reachability/readability | Passed: initial forecast/all four map selectors/global Undo, current unloading/boarding, preview Cancel/Confirm, passenger choices, and terminal Undo/Restart are fully in the viewport with at least 44 px targets; essential tested control text is at least 14 px. Existing ancestor-clipping assertions are retained. |
| Browser errors | None recorded by the focused checks. |

The focused run used `npx playwright test tests/e2e/transfer-phone.spec.ts --config .cache/transfer-phone.config.ts` against the isolated archive server. The temporary config only selected that server and the report output folder; the committed spec runs with the standard repository configuration too. Set `LAST_FERRY_REVIEW_DIR` to a new folder when rerunning so earlier evidence remains intact.

The temporary config resolved its JSON reporter output relative to `.cache`. Both original reports were recovered from `.cache/reviews/transfer-audio/` and copied byte-for-byte into the documented review paths. `phone-report-retention.json` records original locations, hashes and original result statistics. No test was rerun or result status rewritten during that repair.

## Native-size inspection

Actual game screenshots were inspected at native dimensions. Selected comparison images retained for Git:

- `phone-before/780x320-current.png`: original cropped forecast.
- `phone-after/780x320-current.png`: corrected selected-current action and complete forecast.
- `phone-after/780x320-preview.png`: corrected modal controls and readable wrapping.
- `phone-after/844x390-current.png`: established-size comparison.

The later integrated run supplies the retained rescue evidence in `browser-initial/`: `780x320-critical-boarding.png`, `780x320-after-rise.png`, `780x320-success.png`, and their 844×390 equivalents. Its two phone checks passed in 36.605 s and 39.361 s. `preservation-audit.json` compares its source archive against the final working tree: all phone UI, rendering and test files match; the only runtime difference removes an unloading sound contact. These screenshots and checks remain attributed to the original integrated source manifest, not relabelled as new final-source captures.

Earlier isolated-run screenshots remain available locally in `phone-focused/raw/extra-captures/`. Unselected baseline and CSS comparison images are similarly retained under each folder's `raw/extra-captures/`. These raw directories are ignored by Git. `media-retention.json` maps every original screenshot path to its current local path and preserves each SHA-256. Original source/capture manifests and baseline assertion results remain unchanged.

At 780×320 the selected location card can cover part of Harbor while open. It remains dismissible, its action is fully visible, and all four map targets are visible in the ordinary view. This pass keeps the accepted card-placement behavior and corrects the reproduced viewport overflow only. Safe-area insets, real phone browser chrome, speaker balance, thermal performance, and device-specific fonts remain unverified. No speculative safe-area or graphics changes were added.

This focused phone run was muted and has no audio recording. Audio evidence and final integrated-source verification are recorded separately in the milestone review.
