# Atmosphere browser and media verification

## Source identity

The initial full browser run used HEAD `7346b91c23331b7c1e8ad4b147c8fa4006767a89` plus the implementation identified by `initial-source-manifest.json`, SHA-256 `243726bfadb6f5e2979b6d9aa6c3c7a4ad76b50660a9789a60d40ecc7b36377c`.

The corrected checks retain `affected/source-manifest.json`, SHA-256 `e9788367f34b51c1c0bd1cfa229bc996ea548e48794d1e5d345fec6557c72ed3`. Exactly two browser test files changed from the initial manifest; runtime, level data, unit checks and authoritative documents were identical at that point.

Final material verification and final screenshots use `source-manifest.json`, SHA-256 `9315d3d214bb1a07c76557f6e6e89643f7be3a3efc52309e7ad98886db543668`. The later changes are confined to the Harbor reflection in `water.ts`/`water-shader.ts` and a development-only tuning hook in `main.ts`. The final capture tool independently verified that all runtime file hashes remained unchanged across its execution; its runtime-only hash is `e75642155182dd408e52e5bf5bb062277b6304f52d034f3b2c488332ab82eb28`.

The before captures use the reviewed implementation at the same base HEAD. Their active runtime files exactly match `reviews/environment/source-manifest.json`; before runtime hash `dd0e930127a11d3bcc6592b7540928c908ba51277ba760b8e80b09d66814869a`. New, unimported modules and documentation did not affect that baseline. Earlier captures are not relabeled as the final source.

## Actual checks

Environment: Node 24, Playwright 1.64.1, Chromium 156.0.8078.4, Windows, SwiftShader software WebGL, DPR 1. Development URL `http://127.0.0.1:5180`; production `http://127.0.0.1:4180`. Tests use one worker. Phone checks emulate touch and viewport dimensions, rather than physical phone hardware.

| Execution | Result | Evidence |
| --- | --- | --- |
| Fresh full browser run, `npm run test:e2e` | Exit 1: 46 passed, 2 failed, 0 skipped, 0 flaky, 19.7 minutes | `initial-automation-results.json` and `initial-source-manifest.json` |
| Corrected affected checks, `npx playwright test tests/e2e/atmosphere.spec.ts tests/e2e/environment.spec.ts --grep 'longest crossings\|visible curved courses'` | Exit 0: 2 passed, 1.6 minutes | `affected/automation-results.json` and `affected/source-manifest.json` |
| Final reflection affected checks, `npx playwright test tests/e2e/environment.spec.ts tests/e2e/production.spec.ts --grep 'shores, free forecast\|reduced motion keeps calm water\|production bundle'` | Exit 0: 3 passed, 48.5 seconds | `final-affected/automation-results.json` and `final-affected/source-manifest.json` |
| Matched before capture tool | Exit 0: 9 actual gameplay PNGs, 2 original-speed recordings, both rescues and tide Undo | `before/capture-manifest.json` |
| Matched after capture tool | Exit 0: 9 actual gameplay PNGs, 2 original-speed recordings, both rescues and tide Undo; no page errors; source guard passed | `after/capture-manifest.json` |

This is a full 46/48 run, 2/2 corrected checks, then 3/3 checks after the isolated reflection refinement, not a clean full 48/48 rerun on the final source. The final capture tool also repeats both complete rescues, tide Undo and loaded phone views. Both original failures remain in the report and their local videos/error contexts remain in `raw/initial-failures/`.

The first failing check attempted to start the longest passage on action 8 while Bram still waited at Bell Pier. The game correctly opened an immediate-loss confirmation, so no animation ran and the test collected no samples. The corrected test checks that warning, explicitly confirms the real loss, verifies the final tide phase and normal completion, and undoes to action 7. It does not alter the level or bypass confirmation.

The second failing check assumed every surviving wake point belonged to the currently active edge. A 720 ms wake legitimately remains as the ferry enters the next connected passage. The corrected check associates each point with its actual emission frame and course. It retains the original maximum course distance of 0.721, checks the exact stern position and emission water height, and adds bounds of 720 ms age, 31 points and 1.8 world units total trail length. It does not widen the course tolerance.

All original input, state and viewport assertions remain. The 180-second budgets accommodate longer composite journeys; the full run had no timeouts. Successful checks include:

- Actual Holding Pier and Bellwater rescues, shared First Crossing regression, both tide boundaries, tide Undo and terminal Undo, passenger subsets, losing alternatives and cove progression.
- Natural Tab, Shift+Tab, Enter and Escape; mouse and emulated touch; rapid Confirm and double-tap protection; free inspection and modal safety.
- Strict viewport and control checks at 1440×900, 844×390 and 780×390, plus existing 844×500 and 1024×600 breakpoint cases.
- Full loaded-ferry/aboard-passenger bounds excluded from the docked Harbor card after clamping, transfer card hidden during sailing, calm destination status and a reachable 44 px Sound control during normal transit at all three target viewports.
- Longest crossing in both directions completes normally before recovery; final 550 ms tide phase leaves the earlier crossing at the original water height; complete tide Undo; simulated hide/show completes exactly once without a later recovery callback.
- Reduced transitions complete normally at about 30 ms, with frozen water time and no wake; existing deck attachment checks pass during boarding, Moss-only unloading, bobbing, tide and Undo.
- Stalled-rAF fallback reconciles the committed state without spending another action.
- Audio intentional activation, persisted muted reload without an AudioContext, live master mute during travel, clock suspension/resume, repeated toggles, and one musical clock through Undo and Restart.

## In-game comparisons and image inspection

The two timing candidates were recorded through actual mouse controls on a short Holding passage and the longest Bellwater passage in both directions. The exact provisional comparison source and all sampled frames are recorded in `timing-comparison/comparison.json`; its runtime hash is `aa4a590f44d75894f70feec7e1da37f58aaa225e79e27bd58317c396aa987d3d`.

| Candidate | Short planned / observed | Long planned / observed forward and reverse |
| --- | --- | --- |
| Slower | 1473.61 / 1574.8 ms | 2267.31 / 2290.1 and 2352.8 ms |
| Restrained | 1335.37 / 1432.9 ms | 2076.15 / 2105.1 and 2156.2 ms |

All six compared crossings completed normally without fallback. Ordered decoded frames show departure, a steady cruise and settling in both candidates. Restrained retained those phases with less waiting and was selected. The later final-tide-phase correction does not affect these ordinary, nonboundary comparisons.

All 9 before and all 9 final matched after PNGs were inspected at their native resolution. The final views show recognizable landmarks and passenger silhouettes, complete route visibility, clear loaded ferries, usable local actions and the corrected Harbor card placement. Tide 2 visibly submerges the low shore; Undo restores the correct earlier tide state. Shallow forms remain visible beneath the moving surface; broad connected pearl-blue streaks contrast with darker open water and remain separate from the route dots.

Native inspection of the first AFTER batch found the amber cue too hidden beneath the pier and ferry. That complete batch is preserved intact under ignored `raw/pre-amber-fix/`. A genuine development-hook comparison asserted the quiet/tail parameter values before taking desktop and phone delivery/Undo images. The selected lamp-derived tail is now visible below the berth, remains secondary to actors and routes, and responds to delivery. Final screenshots and measurements were recaptured after this correction; the older batch is not presented as final evidence.

Five ordered decoded idle frames spanning about 1–9 seconds were compared for each cove before and after. The current reflected-light bands move coherently against stable land, while the reviewed water is comparatively flat. Ordered short/long crossing frames and a native Bellwater wake frame were also inspected: passengers follow the deck, the transfer card is absent in transit and the short soft wake is distinct from the dotted course. Both final videos were decoded near their last frame; the complete Holding 9-action and Bellwater 14-action success states remain visibly recorded. Contact sheets used for inspection remain disposable in `.cache/atmosphere-review/`; the original-speed recordings remain authoritative.

`after/holding-clear-transit-video-frame.png` is an uncropped 1440×900 frame decoded from a requested seek of 23.137 seconds in the final Holding recording. `derived-media.json` records its exact source and derivation; it is gameplay, not a newly generated image or a concept illustration.

## Rendering measurements

The same protocol sampled 120 consecutive idle rAF intervals at turn 0, 1440×900, DPR 1, normal motion, after more than four rendered frames. Audio had not yet been intentionally activated in the final measurement. These are renderer-only software measurements, not a full audio-mix or native-GPU benchmark.

| Cove | Before median / p95 | After median / p95 | Draw calls before → after | Triangles before → after |
| --- | --- | --- | --- | --- |
| Holding Pier | 66.7 / 133.3 ms | 83.4 / 166.7 ms | 685 → 685 | 127020 → 127020 |
| Bellwater | 66.6 / 133.2 ms | 83.3 / 166.6 ms | 561 → 561 | 101960 → 101960 |

The final measured software frame intervals are about 25% longer in both coves. The data do not establish physical-phone performance headroom or isolate a native GPU bottleneck. Draw calls and triangles are unchanged; the water reports one pass and zero reflection render targets.

## Actual runtime audio evidence and limits

`raw/runtime-music-loop.webm` records the actual running Web Audio master destination for 82.086 seconds of wall time, covering the full 75-second phrase and its loop boundary. It contains the live music and quiet ambience during free idle; it is not offline synthesis and contains no travel or delivery event. The original source is explicitly retained as initial manifest `243726…`. All three audio modules are byte-identical in the final source; later changes affect the two checks, Harbor reflection and development tuning hook. `runtime-music-media.json` records full hashes, source identity, this comparison and the full-length MP3 derivative at `raw/runtime-music-loop.mp3` (81.984 encoded seconds, 48 kHz stereo, no cuts or mix edits).

All 164 half-second samples retained one AudioContext and one scheduler. Maximum owned sources were 13, maximum graph nodes 63, sampled RMS ranged 0.00552–0.02290, sampled peak was 0.06509 and skipped events remained zero. The musical phase advanced through the loop and the game state stayed exactly unchanged while idle.

No dedicated listening tool was available. Signal presence and lifecycle behavior are verified; perceived balance, emotional fit and the audible loop seam require listening. Silent Playwright gameplay videos are kept separate from the actual audio capture. Physical iOS/Safari, native GPU performance, OS audio interruptions and real screen-reader output were not tested; visibility was simulated through the page event. Raw recordings are local review evidence excluded by the repository's ignore rules.
