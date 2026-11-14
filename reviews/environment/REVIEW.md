# Last Ferry review — water, shores and smooth journeys

## Disposition

**Ready for environment review.** The shared environment and smooth-journey milestone is complete within the stated Windows/Chromium coverage. Build/typecheck and 62 unit checks pass; all 41 browser scenarios passed across the full run and isolated rechecks. The original three time-budget failures remain recorded. Twenty-seven selected gameplay PNGs were inspected at original resolution, and a separate 17.68-second uninterrupted rescue visibly ends in success. A pre-existing minor transit-card occlusion remains documented below. The next action is the user's visual playtest.

## Source and scope

- Repository: https://github.com/EDLMGit/Lastferry
- Draft PR: https://github.com/EDLMGit/Lastferry/pull/1
- Branch: `m1-first-crossing`.
- Reviewed starting HEAD and comparison base: `7efe98654fa3df01fcb8338c6c28e664e5712ca1`, the user's accepted Bellwater revision. The checkout started clean; the fetched implementation branch matched it. No newer user work was replaced.
- Final implementation evidence comes from that HEAD plus the documented working tree. The [64-file source manifest](source-manifest.json) pins SHA-256 `58c5c2deb30c8a8e0e3b7cce0ac8944d7906f224ae4e7a4cf552c76ea0420c1b`. Review metadata, README and STATUS are outside the source hash. The retained [patch](tested-changes.patch) and [packaging audit](packaging-audit.json) identify the committed equivalent without relabeling earlier captures. Final commit/ref equality is recorded separately in the PR and handoff because this review describes the actual precommit evidence source.
- Main is retained at `386de54d20fdd4a513a06115471d70bf94738cc0`. Normal push only; PR remains draft.
- Scope: shared route geometry, water, shore contact, restrained travel/arrival effects and focused renderer verification. Holding Pier remains the default, Bellwater remains Next cove, and First Crossing remains the playable baseline.

## What changed

One cached bounded course per edge now supplies route dots, highlighted/blocked geometry, traveled position and steering. Local quadratic rounding stays inside each corner's control envelope; points are sampled at at most 0.05 world units. The same course reverses without rebuilding. Exact endpoints, broadside docking clearance, brief acceleration/deceleration and the 780 ms journey duration remain.

Bellwater's Harbor–Shallows interior control changes from `[-2.7, 1.2]` to `[-2.7, 2.0]`, removing its unmarked crossing with Harbor–Bell. No stop, connection or rule value changes. The [data preservation audit](data-preservation.json) compares every other level value, endpoints, reducer/session, level loading and dependencies to the reviewed base.

A bounded 256×256 coastal mask replaces the fixed 16-segment shallow shader. It derives broad banks from the actual curved shallow courses and neighboring shores. Quiet blue/teal variation and sparse irregular highlights leave open water calm. Water color remains decorative; authored integer depths still decide travel.

Continuous shore profiles, grouped instanced rocks/reeds, matte material and actual-height wetness replace repeated shore rings. Contact accents track the rendered water during rises. Flooded Low/Rabbit/Bell ground remains visible as submerged terrain; piers retain their authored elevations and flood thresholds. Cached forecast contours describe exposed coasts at the real next tide without moving committed water.

A short ribbon follows the ferry's actual stern positions, fades within 360 ms and stays shorter than 1.55 world units. Successful unloading warms the existing Harbor lamp/lens with a restrained glow. Undo, Restart, level selection and interrupted travel reset effects. Reduced motion removes wake/surface animation and holds a calm arrival response. No new dependency, downloaded asset, mechanic, control scheme or code comment was added.

## Environment and commands

| Item | Actual value |
| --- | --- |
| OS | Windows 11 x64, build 10.0.26200 |
| Runtime | Node 24.15.0 / npm 11.12.1 |
| Packages | Three 0.186.1, TypeScript 7.0.2, Vite 8.3.4, Vitest 5.0.5, Playwright 1.64.1 |
| Browser / renderer | Chromium 156.0.8078.4, headless SwiftShader software WebGL |
| Viewports / pixel ratio | 1440×900; 844×390; 780×390; intermediate-height/resizing cases; DPR 1 |
| Input | Mouse, natural keyboard and Chromium emulated touch; no physical phone |
| Servers | Development 5179, production 4179; source frozen during final checks |

Install/play from a clone with Node 24:

```sh
npm ci
npm run dev
```

Holding Pier opens at the printed URL. Use Next cove or `/?cove=bellwater`; baseline is `/?cove=first-crossing`. Production: `npm run build`, then `npm run preview`.

Exact final verification setup in this workspace:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $PWD '../.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT = '5179'
$env:LAST_FERRY_PRODUCTION_PORT = '4179'
$env:LAST_FERRY_REVIEW_DIR = 'reviews/environment'
node tools/snapshot-evidence.mjs --review-dir reviews/environment --base 7efe98654fa3df01fcb8338c6c28e664e5712ca1
npm run typecheck
npm run build
npm run test:unit
node tools/verify-design.mjs
npx playwright test --output=.cache/environment-final/playwright
node tools/capture-environment.mjs --phase=after --base=http://127.0.0.1:5179 --output=reviews/environment/after
node tools/snapshot-evidence.mjs --review-dir reviews/environment --finalize
```

A fresh clone may install Chromium into `.cache/ms-playwright` as described in README. This workspace reused its existing parent cache. No dependency reinstall was needed or repeated.

The original full run used no `DEBUG` setting. Exact isolated recheck command, with the same ports/browser cache and `LAST_FERRY_REVIEW_DIR=reviews/environment/rechecks`:

```powershell
$env:DEBUG = 'pw:api'
npx playwright test tests/e2e/bellwater.spec.ts tests/e2e/navigation.spec.ts tests/e2e/responsive.spec.ts --grep 'Bellwater 844x390 touch|phone-narrow-contextual|responsive 1024x600 touch' --timeout=120000 --output=.cache/environment-rechecks/playwright
```

Output was retained with `Tee-Object` in each review folder's `browser-checks.txt`; JSON reporters use the same folder. The narrow contextual test's internal 90-second budget overrides the CLI value. The complete recording used `node .cache/environment-complete-video.mjs`, an ignored capture helper operating actual mouse controls on dev 5179 and validating all frozen source hashes. Its [manifest](complete-recording-manifest.json) retains the exact action trace and environment. The visible success state was held for 30 additional rendered frames before the recorder closed.

## Executed checks

| Check | Actual result | Evidence |
| --- | --- | --- |
| TypeScript | Pass | [Verification output](verification-checks.txt) |
| Production build | Pass | Same output; JS 662.10 kB raw / 173.88 kB gzip; existing >500 kB advisory remains |
| Unit checks | Pass, 62/62 across six files | Same output; includes existing reducer witnesses/searches, conservation, previews, tide order, alternatives and complete Undo |
| Canonical paths and clearance | Pass within those 62 checks | Exact endpoints, finite/degenerate samples, distance/reverse/heading, full rotated modeled ferry in both directions on every edge of all three coves, required 0.45 margin, curve self/inter-edge crossings, coincident stretches and unrelated stops |
| New coast/rock/reed envelope | Pass within those unit checks | Actual geometry vertices and instance/world transforms remain inside the validated land footprint; includes coast triangle samples |
| Rule/data preservation | Pass | `data-preservation.json`; only the one documented interior control differs |
| Reference design model | Pass, 32/32 | Same verification output; reference-model evidence only, not a playable-UI check |
| Full fresh browser run | 38 pass / 3 fail by overall time budget, 18.4 minutes | [Original JSON](automation-results.json), [log](browser-checks.txt), [failure contexts](initial-failure/); no state/geometry/visibility assertion mismatch reported in those three cases |
| Isolated exact-source rechecks | Pass, 3/3 | [Separate JSON](rechecks/automation-results.json) and log; assertions unchanged, narrow 780px case retains its explicit 90-second budget; default-budget cases use CLI `--timeout=120000` |
| Distinct scenario coverage | All 41 scenarios passed across the two executions | All 37 existing scenarios freshly exercised plus four new environment cases; no prior label-only result reuse |

The early stable focused four-case iteration passed before the final freeze. An earlier browser iteration was interrupted by an HMR reset while renderer source was changing. A pre-freeze unit run passed 60 tests and exceeded the default 5-second budget in two clearance checks; [the failure record](initial-failure/unit-timeouts.txt) is retained. The later frozen-source run passed all 62 with the same default budget. These development failures are not relabeled as passed checks. Final checks use frozen source.

The original full-run timeouts occurred while waiting for the repeat safe Bram boarding at turn 8/tide 2 (844px Bellwater), after successful final unloading at turn 9 (780px Holding contextual flow), and during Board Moss in the 1024×600 touch rescue. Each passed when isolated. Their cause is not established; a passing rerun does not erase the original time-budget failures or establish physical-device performance.

Fresh actual UI coverage includes the Holding nine-action rescue and both tempting losses, Bellwater rescues and failed alternatives, First Crossing rescues, required temporary holding, free inspection, selected subsets, both safe boarding boundaries, current-location targets, complete tide and terminal Undo, default → Next → Menu/Restart, and production play in all three coves without debug controls or external runtime assets. Natural Tab/Shift+Tab/Enter/Escape, emulated touch, 44px targets, essential text/viewport assertions, 844×500 and 1024×600 breakpoint resizes, and normal/reduced rapid Confirm protection retain their existing assertions.

Trusted rapid Confirm release-to-second-press gaps were **107.6 ms normal** and **116.9 ms reduced motion**, each accepting one action/history entry and opening no stray dialog. See `rapid-confirm-normal.json` and `rapid-confirm-reduced.json`. Isolated timeout rechecks passed in 34.5 seconds (Bellwater 844 touch), 30.8 seconds (Holding 780 contextual) and 38.1 seconds (1024×600 touch). [Verification summary](verification-summary.json)

The four new browser cases compare the actual rendered route buffers with per-frame ferry position, interior heading and monotonic distance in both Harbor–Bell and outer-bend directions. They check water-relative route/wake/contact heights, exact shore restoration across both rises, free forecast, wake fade, actual lamp/lens/glow, terminal Undo, interrupted travel, Restart, cove selection and reduced-motion calm effects. Loaded passengers remain attached through travel, boarding Moss, Moss-only unloading, bobbing, tide changes and Undo in the retained deck tests.

## Captured gameplay and motion

The before set is [separately attributed](before/capture-manifest.json): its active runtime exactly matches the reviewed Bellwater implementation, runtime hash `349083599871ee79df97f9143a07216c88768f7919506776fdba4aa9fd6d75b2`. Ten selected PNGs include one historical constrained-phone capture reused only after exact runtime/file-hash comparison. Its original source and capture metadata remain intact. Before/after folders must not be relabeled as one implementation.

Historical capture command, executed before renderer integration: `node tools/capture-environment.mjs --phase=before --base=http://127.0.0.1:5178 --output=reviews/environment/before`. That phase's manifest records its own working tree and exact active runtime hashes; the new unimported path module did not alter the running baseline.

All ten AFTER views are fresh actual gameplay on the frozen implementation. Each matched pair has identical committed state and viewport. Updated render bounds cause at most **2.661 px** difference in a stop's projected position; the camera poses and overall compositions are retained. [Capture index](capture-manifest.json), [native inspection](native-inspection.json), [matched state/framing comparison](performance-comparison.json)

| Matched state | Before | After |
| --- | --- | --- |
| Holding, tide 0 | [view](before/holding-desktop-tide-0.png) | [view](after/holding-desktop-tide-0.png) |
| Holding, tide 1 | [view](before/holding-desktop-tide-1.png) | [view](after/holding-desktop-tide-1.png) |
| Holding, tide 2 | [view](before/holding-desktop-tide-2.png) | [view](after/holding-desktop-tide-2.png) |
| Bellwater outer bend, tide 1 | [view](before/bellwater-desktop-outer-highlight-tide-1.png) | [view](after/bellwater-desktop-outer-highlight-tide-1.png) |
| Bellwater Harbor–Bell, tide 2 | [view](before/bellwater-desktop-harbor-bell-highlight-tide-2.png) | [view](after/bellwater-desktop-harbor-bell-highlight-tide-2.png) |
| Holding 844×390 | [view](before/holding-phone-844-initial.png) | [view](after/holding-phone-844-initial.png) |
| Holding 780×390 | [view](before/holding-phone-780-initial.png) | [view](after/holding-phone-780-initial.png) |
| Bellwater 844×390 | [view](before/bellwater-phone-844-initial.png) | [view](after/bellwater-phone-844-initial.png) |
| Bellwater 780×390 | [view](before/bellwater-phone-780-initial.png) | [view](after/bellwater-phone-780-initial.png) |
| Bellwater constrained subset, 780×390 | [view](before/bellwater-phone-780-constrained.png) | [view](after/bellwater-phone-780-constrained.png) |

Seven targeted fresh views complete the compact 27-PNG set: [success at action 14](environment-journeys-arrival.png), [terminal Undo to loaded Harbor action 13](bellwater-desktop-undo-restored.png), [780px highlighted Harbor–Bell at tide 2](bellwater-phone-780-harbor-bell-highlight.png), [844px safe boarding preview](bellwater-phone-844-critical-boarding.png), [780px after first rise](bellwater-phone-780-after-rise.png), [Holding critical boarding](desktop-contextual-critical-boarding.png), and [First Crossing baseline](checkpoint-a.png). Surplus generated PNGs stay in ignored local cache; historical review folders are unchanged.

**Complete uninterrupted recording:** `reviews/environment/raw/environment-uninterrupted.webm` — **17.68 seconds**, VP9, 1440×900, 25 fps, silent, 4,749,828 bytes. SHA-256 `16439445745e3306ff439d072315a12b52a14f81609628cfbda8f2e614403c74`. Fourteen actual UI actions include both directions on Harbor–Bell and the outer bend, both rises, boarding and delivery. There are no cuts, speed changes or state injection. The decoded tail visibly shows Home 3/3 and the success terminal. [Recording provenance](complete-recording-manifest.json), [tail inspection](complete-tail-review.json)

The separate BEFORE/AFTER matched-motion WebMs remain local under their phase `raw/` folders (35.68 and 29.08 seconds). The AFTER encoded tail ends before visible final delivery, despite its UI trace reaching won; it is motion-comparison evidence, **not** the complete-rescue clip. Twelve selected AFTER and four prior reverse-transit frames were individually reviewed at native 1440×900 after decoding at 4 fps. Actual per-frame rendered-buffer/pose/tangent checks supplement that temporal inspection. This is not a claim of real-time native-GPU video playback. [Media review](media-review.json)

Visual verification is **complete for the stated screenshots, temporal samples and actual browser coverage**. The encoded 25 fps cadence is not a measured game frame rate.

## Same-environment renderer measurements

Idle turn 0, 1440×900, DPR 1, normal motion, 120 consecutive `requestAnimationFrame` intervals after more than four rendered frames; same Chromium/SwiftShader environment and protocol before/after. No other browser verification ran concurrently with the AFTER sample.

| Cove | Draw calls, before → after | Triangles, before → after | Median interval, before → after | 95th percentile, before → after |
| --- | --- | --- | --- | --- |
| Holding Pier | 1,020 → 685 | 230,892 → 127,020 | 133.3 → 83.3 ms | 150.0 → 99.9 ms |
| Bellwater | 1,214 → 561 | 215,012 → 101,960 | 116.6 → 66.7 ms | 133.4 → 133.4 ms |

Draw calls and triangle counts fall, and no material timing regression appears in this protocol; Bellwater's tail interval stays unchanged. Batching and removal of repeated shore detail reduce render work. These observations do not establish physical-phone frame rates. Production JS increases from 634.28/166.25 kB to 662.10/173.88 kB raw/gzip; the existing Vite chunk advisory remains. [Raw measurements](performance-comparison.json)

## Findings

No confirmed new course, water, shore-state, wake or deck-attachment defect remains in the performed checks.

**ENV-01 — P3 — pre-existing local-card occlusion during travel.** After Bellwater boarding action 8, sail Bell Pier → Harbor with the full boat. The disabled Harbor local-action card can briefly overlap the ferry's top/ear area during transit; it is clear at the dock. The prior implementation also shows this occurrence. The comparison is documented by BEFORE frame 107 (~26.5 s) and AFTER frames 86–87 (~21.25–21.5 s) in the matched recordings. Four-fps samples do not establish exact duration or prove a duration improvement. Source: `src/main.ts`, `positionMap`. Gameplay/input and passenger anchoring are unaffected. This pass preserves the accepted contextual controls; the minor existing presentation limitation remains explicit.

## Remaining uncertainty and next action

The user's playtest will assess visual feel. Software-rendered automation does not establish physical-phone frame rates. Physical devices, Safari/Firefox, platform-font variation, screen-reader speech and audio on speakers remain unverified. The independent Linux/Chromium 141 broad-suite timeouts remain historical and inconclusive; these Windows checks establish neither their result nor cause. Raw videos remain local ignored files and are unavailable in a fresh clone unless separately transferred.

The implementation, documentation, selected screenshots and verification records are prepared for the authorized normal commit/push and draft-PR update. The packaging audit verifies **64 source files** (63 exact bytes, one NEXT_TASK instruction file with CRLF-to-LF normalization only) and **all 27 selected image hashes** against staged Git content. Dependencies, local configuration, disposable build/test output and the three selected raw videos are excluded. The postcommit audit checks the resulting commit, clean checkout and unchanged main. Final SHA, remote equality and PR draft status are reported in the handoff. No merge, ready-for-review action, external publication or additional content milestone is included.
