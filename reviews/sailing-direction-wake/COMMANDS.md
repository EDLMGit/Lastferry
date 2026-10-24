# Executed commands

Working directory: `C:\Users\ernes\Documents\last-ferry-codex-starter\Lastferry`. Node24.15.0/npm11.12.1. Commands below were executed; repeated runs and original failures are identified rather than presented as a clean suite.

## Gates

```powershell
npm run build
npm run test:unit
npm run typecheck
```

Final runtime build and173/173unit tests pass. Final typecheck follows e2e fixture corrections. [Source reuse](source-reuse.json) confirms identical runtime/build/unit inputs after those corrections.

## Browser checks

Shared environment:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='../.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT='5206'
$env:LAST_FERRY_PRODUCTION_PORT='4189'
```

Each run sets `$env:LAST_FERRY_REVIEW_DIR` to its directory below. Output was retained using `2>&1 | Tee-Object <review-directory>/results.txt`, followed by `exit $LASTEXITCODE`.

| Directory | Command suffix after `node node_modules/@playwright/test/cli.js test` | Actual result |
| --- | --- | --- |
| `browser-initial` | `tests/e2e/sailing-direction-wake.spec.ts` | Interrupted during development; no completed result. |
| `browser-focused` | `tests/e2e/sailing-direction-wake.spec.ts` | Heading/rescue passed; settlement fixture failed; crest case interrupted. |
| `browser-focused-rerun` | `tests/e2e/sailing-direction-wake.spec.ts --grep 'normal, hidden\|released crests'` | Settlement passed; crest observation failed. |
| `browser-crest-rerun` | `tests/e2e/sailing-direction-wake.spec.ts --grep 'released crests'` |1passed. |

The escaped pipe above is Markdown table escaping; the actual grep pattern is `'normal, hidden|released crests'`.

`browser-final`:20passed in one completed run:

```powershell
$env:LAST_FERRY_REVIEW_DIR='reviews/sailing-direction-wake/browser-final'
node node_modules/@playwright/test/cli.js test tests/e2e/environment.spec.ts tests/e2e/homecoming.spec.ts tests/e2e/victory-mix.spec.ts tests/e2e/production.spec.ts tests/e2e/fallback.spec.ts tests/e2e/water-motion.spec.ts tests/e2e/transfer-audio.spec.ts
```

Before each frozen browser run:

```powershell
node tools/snapshot-evidence.mjs --review-dir <review-directory> --base 8b874adccfc1d65af569b81fade548f0368645b0
```

## Natural captures and performance

The browser-cache environment above applies. Captures use actual UI mouse activation in a touch-enabled mobile context; phone behavioral tests independently use taps. No time acceleration or direct game-state injection.

```powershell
node tools/capture-sailing-direction-wake.mjs --base=http://127.0.0.1:5205 --root=.cache/direction-baseline --phase=before --baselineSha=8b874adccfc1d65af569b81fade548f0368645b0
node tools/capture-sailing-direction-wake.mjs --base=http://127.0.0.1:5205 --root=.cache/direction-baseline --phase=before-followup --baselineSha=8b874adccfc1d65af569b81fade548f0368645b0 --stills=false --rest=250
node tools/capture-sailing-direction-wake.mjs --base=http://127.0.0.1:5206 --phase=trial --width=844 --height=390
node tools/capture-sailing-direction-wake.mjs --base=http://127.0.0.1:5206 --phase=after --width=844 --height=390 --stills=false --rest=250
node tools/capture-sailing-direction-wake.mjs --base=http://127.0.0.1:5206 --phase=after --width=780 --height=390 --stills=false --rest=250
node tools/capture-sailing-direction-wake.mjs --base=http://127.0.0.1:5206 --phase=after --width=1440 --height=900 --stills=false --rest=250
node tools/measure-sailing-direction-wake.mjs --baseline=http://127.0.0.1:5205 --candidate=http://127.0.0.1:5206
```

The initial baseline capture fixture and initial performance setup each failed at the real rabbit deadline; their original results are retained. Their corrected reruns pass. Baseline5205 was an isolated exact archive of8b874ad and is now stopped. Candidate dev5206 and fresh production4189 were available at handoff. Reproduction may use different free ports with the same environment overrides.
