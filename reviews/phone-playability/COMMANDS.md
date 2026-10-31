# Executed verification and capture commands

Environment: Windows, Node 24.15.0 / npm 11.12.1, Playwright 1.64.1, Chromium 156.0.8078.4, DPR 1, SwiftShader software WebGL2. Phone contexts emulate touchscreen/mobile; CDP dispatch supplies actual trusted touch gestures. No physical Android, native GPU, other browser engine, or new acoustic listening approval is claimed.

The working tree began at `a93bed3897586fbfa66ed06e54ee2d9685c87be0`. Baseline port 5210 serves an isolated Git archive of that HEAD. Candidate dev 5211 and production 4190 serve the current implementation. The protected accepted runtime is `80545cbabb0496b215cd56f25cfc0113b056da67`. Exact source lists accompany every formal run. Report-only changes do not change game identity.

## Gates

The parent ran the following on Node 24; final structured outcomes and source identity are in [final-gates.json](final-gates.json), [source-manifest.json](source-manifest.json), and [source-reuse.json](source-reuse.json):

```powershell
npm run build
npm run typecheck
npm run test:unit -- --maxWorkers=1
```

Final production build/typecheck passed; final unit suite passed **188/188 across 27 files**, unchanged 5000ms limits, bounded workers. The original 27-worker run had 183 passes and five timeouts; it remains preserved in `development/initial-unit-failure.txt`. Existing build chunk-size warnings remain advisory. No assertion was removed to make the unit suite pass.

## Final browser checks

These variables were used for all formal browser commands:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='../.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT='5211'
$env:LAST_FERRY_PRODUCTION_PORT='4190'
$env:LAST_FERRY_REVIEW_DIR='reviews/phone-playability/browser-cache-final'
node tools/snapshot-evidence.mjs --review-dir reviews/phone-playability/browser-cache-final --base a93bed3897586fbfa66ed06e54ee2d9685c87be0
node node_modules/@playwright/test/cli.js test tests/e2e/phone-playability.spec.ts
```

The new review directory was created before snapshotting. An initial shell attempt omitted that directory and aborted before tests; it was corrected without a source change. Final result: **17/17 passed in 4.3 minutes**, one worker. Source hash `efead79bb0648b70f15a0560a830bc906c58a89f7682e6779dc19a8b9a6d4f57` (145 inputs). Results: [browser-cache-final/results.txt](browser-cache-final/results.txt), structured automation results and per-case JSON. Coverage includes all five phone sizes, landscape/portrait full UI rescues with subsets and tide Undo, bounded pan/live-target release, picking, natural keyboard, preview anchors, rotation while selected/open/traveling, real app-root fullscreen entry/UI exit/reentry/external exit, mocked rejection/unavailable, desktop/other coves, won Overview, synthesized cutout/VisualViewport offsets, and independent actual Object3D marker projection through both tides.

```powershell
$env:LAST_FERRY_REVIEW_DIR='reviews/phone-playability/browser-cache-timing'
node tools/snapshot-evidence.mjs --review-dir reviews/phone-playability/browser-cache-timing --base a93bed3897586fbfa66ed06e54ee2d9685c87be0
node node_modules/@playwright/test/cli.js test tests/e2e/selection.spec.ts tests/e2e/sailing-direction-wake.spec.ts tests/e2e/victory-mix.spec.ts --grep 'selection regression|direction: free-water|victory mix: visible final arrival'
```

Result: **1 passed / 3 failed**, same runtime/source, no retry after this final run. Victory lifecycle passed. The unchanged 0.85rad maximum-per-sample heading threshold measured 1.42568rad over 99.9ms, with a 100ms maximum adjacent sample gap. Trusted new-Sail and local-action gaps measured 230.2ms / 377.6ms against the unchanged 180ms requirement. Correct trusted order/committed state was retained, but the intended short timing window was not exercised. These checks are failed, not waived. [Failure summary](browser-cache-timing/failure-summary.json) and all original contexts are retained. The exact unchanged accepted heading planner reproduces the observed angles within `8.88e-16rad`; that does not establish smooth native-GPU delivery or turn the threshold into a pass.

Seven other preservation cases passed on the immediately preceding marker-corrected runtime: real production rescue, two homecoming recovery/settings paths, transfer-audio UI, settled heading/recovery, released crests, and actual fullscreen. Final 17 reran/enhanced fullscreen; final victory was rerun after the label cache. [Verification history](VERIFICATION_HISTORY.md) distinguishes original failures, test-contract updates, affected reruns and source reuse. Do not describe all 27 cases as one clean passing invocation.

## Quiet measured-layout comparison

```powershell
node .cache/measure-phone-layout.mjs
node .cache/measure-phone-layout-cached.mjs
```

Each is one sequential baseline / candidate Play / candidate Overview comparison at 844×390 with the same actual UI preparation, state, two crossings, warmed rAFs, and Chrome Performance counters. No video, screenshots, geometry arrays or heading sampler was active. Exact executable helper sources, results and source lists are retained under [performance/](performance/) and [performance-cached/](performance-cached/). Initial failed setup is kept separately in `performance-initial/`.

The bounded label-measure cache reduced candidate Play layouts from 379 to 83 and sampled layout duration from 31.605ms to 12.592ms. In the final matched run baseline had 47 layouts / 14.307ms, candidate Play 83 / 12.592ms, Overview 23 / 4.115ms; final states and resources matched. Software frame timing remained variable: active baseline median49.9ms/p95 83.3/max133.3, Play50/p95 100/max150, Overview49.9/p95 83.3/max133.5. This diagnoses and addresses repeated DOM layout; it is not a device-performance benchmark.

## Matched stills, actual play and moving evidence

```powershell
node tools/capture-phone-playability.mjs --phase=before --root=.cache/phone-baseline --base=http://127.0.0.1:5210 --output=reviews/phone-playability/before
node tools/capture-phone-playability.mjs --phase=after --base=http://127.0.0.1:5211 --output=reviews/phone-playability/final-capture --previews=true --sequence=true --sequenceShots=false --bellwater=true --homecoming=true
node tools/capture-phone-playability.mjs --phase=after --base=http://127.0.0.1:5211 --output=reviews/phone-playability/native-sequence --sizes=none --sequence=true --sequenceShots=false --sequenceFullscreen=false --sequenceRotation=false
```

Baseline was originally captured at four required sizes; `before-extra/` adds 780×390 and `before-previews/` records actual preview activation. Consult each `source.json` for its exact invocation. Final captures passed their assertions, source remained unchanged, and no page errors occurred. This includes matched normal/preview native images at all five sizes, a complete Holding nine-action rescue with Play victory at 844×390 / 390×844 / 780×320, and Bellwater's actual 14-action phone rescue with full-load outer passages sampled at quarter/later/arrival and all active subjects in frame. Camera/inspection never injected game state or altered elapsed action rules.

Runtime hash is `0d6bf4dc2707ef88b9b1402fa51e2a7aa23581dc0fce8f60b4aea4f278d91b89` for both final capture groups. Final manifest differences from browser checks are capture-helper-only additions (homecoming and optional recording flags); [source reuse](source-reuse.json) checks the runtime equality.

```powershell
C:\ffmpeg\bin\ffprobe.exe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height,avg_frame_rate -of json reviews/phone-playability/native-sequence/raw/phone-uninterrupted.webm
C:\ffmpeg\bin\ffmpeg.exe -v error -i reviews/phone-playability/native-sequence/raw/phone-uninterrupted.webm -f null NUL
C:\ffmpeg\bin\ffmpeg.exe -v warning -ss 1.5 -i reviews/phone-playability/native-sequence/raw/phone-uninterrupted.webm -vf fps=15 -c:v libwebp_anim -quality 72 -loop 0 -an -y reviews/phone-playability/phone-journey.webp
```

Both full VP9 originals decode with exit0. The final ordinary-browser original is 13.64 seconds, 844×390, 25fps, 2,188,586 bytes. Its compact animated excerpt omits 1.5 seconds of initial screencast fitted-frame startup, then retains native size and natural timing: 12.132 seconds, 1,660,000 bytes. Fullscreen/rotation in the earlier full original are fitted into the fixed recorder surface, so they are supported by actual native stills and API results, not presented as native moving comparisons. [MEDIA.json](MEDIA.json), [COMPARISON.md](COMPARISON.md) and [native inspection](native-inspection.json) give exact hashes, dimensions and limits. Full originals remain local under ignored `raw/`; selected PNGs and animated WebP are committed.
