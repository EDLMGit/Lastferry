# Verification history

These are separate executions at recorded working-tree sources. Later passes do not erase earlier failures. Every browser directory retains `results.txt`, `automation-results.json` and `source-manifest.json`; large originals remain under ignored `raw/`. The final report identifies which results apply to the final runtime.

| Execution | Actual result | Finding and resolution |
| --- | --- | --- |
| Initial default-worker units | 183 passed, 5 timed out | Existing 5000ms timeouts, without a failed geometry/rules assertion. Parallel workers and development browsers were active; causation is unproven. Bounded-worker reruns pass all188 with unchanged thresholds. [Original](development/initial-unit-failure.txt). |
| `browser-initial` | 0 passed, 2 failed | Active-development Back measurement became inconclusive; Fullscreen fixture used checkbox API on a button. Corrected to actual `aria-pressed`. |
| `browser-final` | 10 passed, 3 failed | Real subset-panel shift22.39px fixed by stable transfer height; remote inspection blocked Unload after rotation/return, fixed by clearing it on Back. Resource fixture warmed equivalent inspection cycles before equality comparison. |
| `browser-corrected` | 14 passed, 1 failed | Repeat fixture assumed Back remained visible after Play recovery; conditional activation corrected. Exact repeated-resource assertions retained. |
| `browser-complete` | 16 passed | Clean run at its recorded earlier runtime; subsequent projection/cache refinements require affected reruns. |
| `browser-regression` | 7 passed, 1 failed | Old exact Overview restoration assertion conflicts with intentional useful Play after Undo. Updated contract retains fixed angle, normal arrival factor, active-subject bounds, markers and picking. |
| `browser-recovery-rerun` | 1 passed | Affected homecoming recovery passes. |
| `browser-selection-regression` | 0 passed, 2 failed | Old Sail-card coordinate co-location no longer applies; only that assertion removed. Second trusted-input sequence took277.3ms versus180ms. Timing threshold retained. |
| `browser-intent-rerun` | 3 passed | Actual-target drag and both trusted-input cases pass at this source; recorded gaps58.1/84.2/118.6ms. |
| Independent water-anchor audit | Real defect found | Logical DOM markers lagged actual tide-following3D targets by up to10.56px. Project at actual water height and invalidate overlays during tide motion; flush pending layout after scene transforms and before rendering. [Original measurement](marker-water-anchor-audit.json). |
| `browser-projection-final` | 15 passed, 2 failed | Immediate Back observation mixed future camera state with pre-paint DOM. Wait two paint boundaries and atomically sample actual Object3D matrix, camera and DOM; tolerances unchanged. |
| `browser-anchor-rerun` | 2 passed | Affected360×740 and independent marker check pass. Maximum marker axis error0.01560CSSpx, including nonvacuous midrise and both settled tides. |
| `browser-preservation-final` | 7 passed, 4 failed | Delivered-frame heading step1.6368rad versus0.85; trusted sequences2752.9/255.1ms versus180; victory duck timing8ms versus5. These checks failed. |
| `browser-timing-rerun` | 1 passed, 3 failed | Victory passes. Heading0.851234rad still exceeds0.85 over66.7ms; input194/437ms still exceed180. Exact planner agreement is supplementary evidence, not a smoothness pass. |
| `performance-initial` | Failed fixture | Attempted hidden Back; no useful benchmark. |
| `performance` | Completed diagnostic | Quiet matched comparison shows excess dynamic Play layout:379 layouts. Leads to bounded measurement batching/cache and guarded unchanged writes. |
| `performance-cached` | Completed comparison | Same final states/resources. Play83 layouts; total layout12.592ms versus current baseline14.307ms. Software-frame distributions remain variable; see report. |

Final post-cache executions: `browser-cache-final` passes17/17 in4.3min. `browser-cache-timing` passes1/4 (victory) and fails3/4: heading1.425683rad versus0.85 over99.9ms; input230.2/377.6ms versus180ms. These final failures remain explicit limitations; no more timing retries or threshold changes. Exact source145-file hash `efead79bb0648b70f15a0560a830bc906c58a89f7682e6779dc19a8b9a6d4f57`. All old timing thresholds, geometry/readability limits and gameplay assertions remain. No timing failure is renamed a pass.

Capture-method failures are also retained: `after/capture.json` completed stills but the recording stopped when headless Chromium refused emulated resize while actually fullscreen. `after-complete/capture.json` completed Holding but its Bellwater helper failed on a hidden target. `phone-bellwater/capture.json` records the corrected helper's completed Bellwater run. Final captures use a new directory, not overwritten attempts.

Five historical framing files now explicitly select Whole cove before full-network assertions. The entire legacy browser suite was not run; unrelated old `#sound` selectors and historical selection expectations are not claimed verified. The focused checks exercise the current interface directly.
