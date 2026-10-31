# Browser verification record

All runs used one Playwright worker and one GPU browser at a time, Windows 11 Pro, Node 24.15.0, Playwright 1.64.1/Chromium 156.0.8078.4, SwiftShader and DPR 1. Phone input is Chromium touch emulation at 844×390 or 780×390, not a physical device. The preserved raw directories contain original test sources, patches, videos and failure contexts; compact machine reports remain alongside this record.

## Source-separated executions

| Execution | Exact source manifest | Actual result | Meaning |
| --- | --- | --- | --- |
| Initial affected checks, frozen 5187 | `initial-browser/source-manifest.json`, 89 files, `397035fba4b94779f01b0180b5b392c90b0d76415cfb1059d69ca5ce53fd7829` | 11 passed, 2 failed, 13 selected, 7.4 minutes | Initial working implementation. The intended new selection tests were omitted by an anchored grep. |
| New selection checks, frozen 5189 | `corrected-browser/source-manifest.json`, 90 files, `cc4dc35adbf6599f89700e3b087741ace21245b0c511d8e3c0e46201173ad57e` | 3 passed, 2 failed, 26.8 seconds | Three viewport/picking cases passed. Timing and compatibility-click assumptions failed; neither was presented as a runtime failure. |
| Later affected checks, frozen 5190 | `final-browser/source-manifest.json`, 90 files, `5a16864563aea3fa762f62cfdec5610b71428689534784372f9f7d3577d4b6cf` | 7 passed, 2 failed, 9 selected, 125.3 seconds | A second prompt local action was swallowed after instant reduced-motion arrival. One Sail timing check still missed its required interval. |
| Final input correction, frozen 5191 | `postfix-browser/source-manifest.json`, 90 files, `c3ff67efa9eb873470772b0b6de75648989d66fca001ac791598cbf254f55aa2` | 8 passed, 1 failed, 9 selected, 79.2 seconds | Both tight intent/repeat regressions and lifecycle passed. One legacy rapid-Confirm timing precondition was missed. |
| Dispatch-clock correction, same runtime | `rapid-clock-check/source-manifest.json`, 90 files, `4b3a27c263a06258429237666915a57327e34804f1add0d925c94137544ae2fc` | 1 passed, 1 failed, 8.3 seconds | Normal rapid Confirm passed; reduced case still missed the strict interval. |
| Bounded final timing attempt, same runtime | `rapid-final-check/source-manifest.json`, 90 files, `931df97f2c13f6ec065f437f0dcc05673e44e4920525f85f6f791db6df1a7d92` | 1 failed precondition, 1 selected, 3.5 seconds | Correct game and modal outcome; 244.6ms dispatch interval did not exercise the ≤180ms condition. No further retries. |

The initial thirteen included real rescues in all three coves, natural Tab/Shift+Tab/Enter/Escape navigation, both phone widths, loss confirmation, subset previews, tide Undo, rapid Confirm, hidden-page recovery and the production bundle without debug globals or external asset requests. Their passing results retain this earlier source identity. The later nine re-executed affected crossing timing, reduced-motion arrival, 780-pixel contextual rescue, production First Crossing rescue, normal/reduced rapid Confirm, final 844-pixel ray selection, lifecycle and the tight Sail regression.

## Preserved failures and corrections

1. Initial atmosphere timing test activated a marker but omitted the new explicit Sail. It correctly observed no transition. Updating the action helper retained its original path, duration, tide-phase and visibility assertions. The later nine passed it.
2. Initial reduced-motion environment test stalled at turn 2/Shallows. A trusted-input probe reproduced the first spatial-fence defect: Sail, deliberate Rabbit Pier selection, then Sail again at 176.0ms left the ferry at Shallows. Retry after 220ms moved it. The first semantic fix permits free selection through a commit fence and clears that fence on a new explicit selection. The 5190 probe reached Rabbit Pier with the two Sail clicks 67.5ms apart. The old frozen runtime, event times and failed artifacts remain in `fence-probe/`.
3. The first new tight Sail check succeeded at turn 3 but its measured interval was 1662ms, outside the ≤180ms precondition. Its coordinate-click revision still measured 1714.6ms in the fixture context. These failures establish no fast-input result. The final check explicitly creates a reduced-motion context and asserts the runtime flag, matching the successful independent 67.5ms probe; the strict interval/old-rectangle/state assertions remain.
4. The first lifecycle harness expected five compatibility `click` events. Disabled Confirm suppressed one correctly. The corrected trace requires five trusted pointer-down/up pairs and exactly one committed Confirm and Sail. Normal and reduced lifecycle both passed on 5190, preserving game/history, focus, selection, transit, Undo, recovery and restart assertions.
5. Later rapid-Confirm reduced setup failed before a Confirm existed: the visible arrived-card Board action did not open its modal. A bounded trusted-coordinate probe reproduced it at 66.4ms after Sail; Board lay inside the previous Sail rectangle. A retry after 220ms opened the modal without changing the game. `final-input-probe/probe.json` records the original source and timing. The final fix limits a commit fence to the actual activation neighborhood intersected with the old control rectangle, consumes newly exposed targets there, and protects that point when placing the arrived card. Dismissal still uses its whole old rectangle. The new regression proves the former Sail point is harmless at 102.7ms and a deliberate Board at its new position opens freely at 152.7ms. No game, history, desired music or camera changes until Confirm. The old overlapping geometry remains in the reproduction rather than being imposed on the improved layout.
6. The legacy reduced rapid-Confirm check still failed a timing precondition after the runtime fix. Original input `timeStamp` can precede its actual capture-phase dispatch substantially in this software browser; both clocks remain recorded. The harness now compares `performance.now()` at dispatch, matching the runtime fence, and uses rAF polling for the same strict idle condition. The final bounded attempt nevertheless took 244.6ms. It is **inconclusive for that precise ≤180ms after-idle scenario**, not a passed check. The independent final lifecycle test actually exercised reduced Confirm at 59.6ms and Sail at 33.9ms from first release to second press, preserving exactly one action/history step and no background modal. Normal lifecycle observed 49.9ms/74.9ms. These are pointer-release-to-next-press intervals; the tight Sail and arrived-card figures are click-to-click.

The environment test now captures the actual ordinary lantern baseline instead of assuming the previous model's literal emissive value. Delivery must strengthen that baseline by its reported response, and Undo/recovery must restore the exact initial lamp, lens and glow. The initial failure was the stalled Board sequence, not this stale literal.

## Interaction and viewport assertions retained

- Actual canvas ray hits for island, noncurrent pier, lighthouse, ferry and Shallows buoy are followed by trusted input. Read-only diagnostics find a visible hit, never set game state. The unmapped First Crossing rock safely clears selection.
- Select/switch/reselect/Close/empty water/hover/focus preserve the full game, history, desired musical arrangement and camera. Only the actual adjacent route receives emphasis.
- Essential text remains at least 14px, targets at least 44px and fully within the viewport. The full static and future loaded-path envelope stays inside the viewport. Independently computed card overlap checks protect the selected place, ferry, passengers and landmarks.
- Passenger subset consequences, deadline warnings, one-step travel, losing-action confirmation, full Undo and original rescue outcomes remain asserted. No outcome or viewport assertion was dropped to accommodate the new interaction.

## Commands

All browser runs set `PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright`, `LAST_FERRY_DEV_PORT` to the recorded frozen source, `LAST_FERRY_PRODUCTION_PORT=4182` and `LAST_FERRY_REVIEW_DIR` to the separate run directory.

```sh
npx playwright test --grep '(^selection |contextual:|Bellwater natural keyboard:|Bellwater (844|780)x390 touch:|production bundle:|Holding Pier: unloading Undo|atmosphere: longest crossings|environment: reduced motion|home refinement: hidden winning|rapid phone Confirm)'
npx playwright test tests/e2e/selection.spec.ts
npx playwright test --grep 'selection (regression:|lifecycle:|phone-844:)|atmosphere: longest crossings|environment: reduced motion|phone-narrow-contextual:|production bundle:|rapid phone Confirm'
```

The first command's `^selection` omission is preserved above. The final nine used the same environment with port 5191:

```sh
npx playwright test --grep 'selection (regression:|lifecycle:|phone-844:|phone-780:)|phone-narrow-contextual:|production bundle:|rapid phone Confirm'
npx playwright test --grep 'rapid phone Confirm'
npx playwright test --grep 'rapid phone Confirm reduced'
```

No full-suite pass is claimed. The current collection contains 60 browser scenarios; focused execution follows the repository rule to stop once changed risks and core rescues are covered. One strict legacy timing precondition remains failed/inconclusive as described above. No reproduced gameplay, selection, overlap or modal defect remains in the final runtime checks. Desktop ordinary/free inspection plus the complete Holding and Bellwater flows, and both phone Bellwater flows, were captured fresh from frozen 5191; production First Crossing was completed in the final nine. Fresh captures use core runtime hash `60617c88dec76b6232459953785cdb27890138cbbb33a9333a2ec05eb076c4d9` and keep this working-tree identity rather than claiming a later commit.
