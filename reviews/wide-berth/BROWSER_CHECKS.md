# Wide Berth browser execution ledger

Node24.15.0/npm11.12.1; Chromium156.0.8078.4/SwiftShader/DPR1 on Windows. Real application controls; touch is emulated. Dev5270, final production5276. Each run's automation JSON retains its exact argv and environment. All use `npm run test:e2e -- <file> [-g <selection>]`, `PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright`, `LAST_FERRY_DEV_PORT=5270`, and `LAST_FERRY_REVIEW_DIR=reviews/wide-berth/<run>`; production also `LAST_FERRY_PRODUCTION_PORT=5276`.

| Run / gate | Actual result | Meaning |
| --- | --- | --- |
| `visual-preflight.txt` | fail | Unfrozen development/HMR interruption; not final gameplay evidence |
| `initial/`, `gates/browser-initial.txt` | 2pass/1fail | Historical2/3 save continuation and scene lifecycle pass; original fullscreen window resize fails at protocol level |
| `lifecycle/`, `gates/browser-lifecycle.txt` | 1/1pass | Same actual fullscreen entry, metrics-emulated portrait while fullscreen, exit; original profiles/Help/reduced/keyboard coverage |
| `play-initial/`, `gates/browser-play-initial.txt` | 2pass/1fail | Earned Driftwood→launch→Wide deep and portrait staging pass; six-option short-landscape capacity text genuinely clips |
| `close/`, `gates/browser-close.txt` | 1pass/1fail | Close portrait launch/full staging passes; subsequent six-option assertion finds overly broad background+modal requirement locator |
| `chooser/`, `gates/browser-chooser.txt` | 2/2pass | Final five-body/six-neighbor selection, fallback,5size fit and free critical-route inspection |
| `production/`, `gates/browser-production.txt` | fail | Same broad locator defect in production harness; retained |
| `production-final/`, `gates/browser-production-final.txt` | 1/1pass | Actual built game, noDEV state injection/bridge, reachable six-neighbor chooser at5sizes and complete19-action variation |
| `recovery/`, `gates/browser-recovery.txt` | aborted fixture | Second measured handoff tap opened a free forecast; scripted next action blocked. Only identified test process tree stopped; user servers preserved |
| `recovery-final/`, `gates/browser-recovery-final.txt` | fail | Restart succeeds; fixture queried development bridge before new cove document initialized |
| `recovery-corrected/`, `gates/browser-recovery-corrected.txt` | 1/1pass | Actual repeated handoff, Restart, cove-picker recovery, clean4space profile/wake/history and unchanged campaign bytes; URL/new-document readiness wait fixes fixture race |

Eight distinct dev cases pass across those retained runs, plus one production case. This does not combine failures into a claim of a fresh8/8batch. The scoped CSS correction affects only large-group short-landscape chooser spacing; earlier principal rescue/launch views do not use that selector. Current source comparison is in `source-audit.json`; production and corrected chooser exercise the changed surface. [Recovery results](recovery-corrected/RESULT.md) distinguish the two actual trusted494.5ms handoff taps from the inherited precise180ms bound.

Tests added in `tests/e2e/wide-berth.spec.ts` cover actual movement/transfer/inspection, full-load blocked exits, both tides, subset loss/Undo/correction, deep13/staging14/five-body17, terminal Undo/redelivery, exact legacy bytes/recap/predecessor, natural keyboard, Reduced Motion, shared Sound intent, controlled visibility settlement, fullscreen and image failure. `wide-berth-production.spec.ts` checks actual production portrait/shortlandscape/desktop chooser text, nested overflow, image loads and final delivery. Production sequence is a longer legal staging variation, not an assertion that13is the only valid length.

Busy double activation is measured266.9ms, not the requested35ms. The inherited≤180ms touch bound remains unverified. Fullscreen orientation uses CDP metrics after native entry because Chromium refuses changing native window bounds while fullscreen; physical device rotation is not claimed. No hardware listening, other browser or actual Android performance result is inferred.
