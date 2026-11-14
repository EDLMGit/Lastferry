# Last Ferry — atmosphere review

## Disposition

**Ready for atmosphere playtest, with listening quality pending.** Implementation, affected verification and actual gameplay/media review are complete for the stated environment. All three accepted puzzles remain playable. The actual runtime musical phrase is captured; no speaker-listening or native-phone performance claim is made.

## Source and scope

- Repository: https://github.com/EDLMGit/Lastferry; draft PR https://github.com/EDLMGit/Lastferry/pull/1; branch `m1-first-crossing`.
- Reviewed starting HEAD/comparison base: `7346b91c23331b7c1e8ad4b147c8fa4006767a89`, explicitly named in the new NEXT_TASK. Starting checkout was clean; remote implementation ref matched. Main is `386de54d20fdd4a513a06115471d70bf94738cc0`.
- Final tested source is that HEAD plus the identified working tree, frozen in [source-manifest.json](source-manifest.json): **76 files, SHA-256 `9315d3d214bb1a07c76557f6e6e89643f7be3a3efc52309e7ad98886db543668`**. The initial full browser run and audio recording retain [initial-source-manifest.json](initial-source-manifest.json), hash `243726bfadb6f5e2979b6d9aa6c3c7a4ad76b50660a9789a60d40ecc7b36377c`. The two corrected checks used [pre-amber-source-manifest.json](pre-amber-source-manifest.json), hash `e9788367f34b51c1c0bd1cfa229bc996ea548e48794d1e5d345fec6557c72ed3`: only those two test files changed. Final changes then touch two water modules for the lamp reflection and one DEV-only tuning setter/type import in main. Rules, controls, timing, audio, unit tests, docs and dependencies remain identical. The retained tested patch and packaging comparison identify the eventual commit without relabeling earlier evidence.
- BEFORE captures were made before runtime edits, with their own manifest and exact runtime comparison to the reviewed environment source. New unimported tooling/task documentation did not affect that build. Timing/water candidate comparisons are exploratory working-tree evidence; final AFTER evidence uses the frozen implementation.
- Scope: luminous evening water, bounded explicit seabed, chosen path-length travel pacing, tide/recovery integration, unobscured ferry/local controls, and one original continuous instrumental proposal. All three cove data, rules, session history, canonical route geometry, capacity/depth/action/tide/event order and dependencies remain unchanged. No code comments added.

## Environment and commands

Windows, Node 24.15.0/npm 11.12.1; Three 0.186.1, TypeScript 7.0.2, Vite 8.3.4, Vitest 5.0.5, Playwright 1.64.1/Chromium 156.0.8078.4. Browser evidence uses headless SwiftShader software WebGL, DPR 1, mouse/natural keyboard and Chromium emulated touch. Native screenshots: 1440×900, 844×390, 780×390. These are not physical-phone or native-GPU results.

```powershell
npm ci
npm run dev
npm run build
npm run preview
```

Verification used the existing install and local browser cache, not a fresh `npm ci`. Separate owned servers ran `npm run dev -- --port 5180` and `npm run preview -- --port 4180 --strictPort`. For this checkout's existing cache:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = '../.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT = '5180'
$env:LAST_FERRY_PRODUCTION_PORT = '4180'
$env:LAST_FERRY_REVIEW_DIR = 'reviews/atmosphere'
npm run typecheck
npm run build
npm run test:unit
node tools/verify-design.mjs
npm run test:e2e
node tools/capture-atmosphere.mjs --phase=after --base=http://127.0.0.1:5180
```

A fresh clone can instead install Chromium with `npx playwright install chromium` using the README's project-local cache instructions. Holding Pier is default; `/?cove=bellwater` and `/?cove=first-crossing` remain available.

## What changed and why

Water now has three compatible moving normal layers, deliberate pearl sky light with quiet blue-green surrounds, independently visible coastal depth, absorption/distortion beneath the surface and a small broken Harbor reflection. The original coastal mask is retained separately from a new explicit seabed height/albedo field. Orthographic view direction, linear color/data handling and a single output conversion were audited. Two bounded 256² RGBA data textures total 524,288 bytes; one water draw, no reflection target or extra per-frame scene pass. Local authored synthesis/data are documented in the asset ledger.

An initial actual-game material was too milky around coasts. It was revised before selecting **luminous** over the restrained candidate after both coves at desktop and both phone widths, plus an actual idle frame sequence. It keeps darker open regions, connected pearl streaks and sea-glass apron/irregular shallow forms. This is an art judgment from the rendered game, not a numerical test result.

Final inspection found the first amber cue occluded beneath the berth. Its lamp-derived origin is retained, with a soft longer tail toward the camera and modestly stronger warmth. Genuine asserted comparisons on desktop and phones selected strength `.28`, width factor `.24` and forward-tail factor `4.5`; the latter two are Gaussian squared-distance denominators, not lengths. Small broken bands now remain visible beyond the ferry, including on phone. An earlier comparison harness accidentally imported a different Vite module instance; identical tuning values exposed that error, its candidate labels were discarded, and the comparison was repeated through the actual World instance. Preliminary AFTER captures remain ignored under `raw/pre-amber-fix/`; final images and affected checks were refreshed.

Actual short/long crossings selected **`clamp(800 + 140 × canonical length, 1200, 2300)` ms**. Holding Shallows→Rabbit Pier plans 1,335.37ms; Bellwater's longest outer passage plans 2,076.15ms in either direction. The slower comparison plans 1,473.61/2,267.31ms. Six candidate crossings completed normally with zero recovery; ordered original-speed recording frames retain departure, steady cruise and arrival in the shorter policy. [Comparison source, elapsed times and recording identities](timing-comparison/comparison.json). These exploratory clips predate formatting and the separate final tide-phase adjustment; the compared course/time-to-distance policy is unchanged.

The final 550ms, capped by action duration, handles tide and coincident draft independently of crossing length. One authoritative plan drives animation and duration-plus-1,000ms recovery. Guarded completion releases the lock once through normal, cancellation, visibility, error and recovery paths. A softer spreading stern wake lasts at most 720ms/1.8 units; reduced motion freezes decorative time and suppresses it. During sailing, a compact destination status replaces the transfer card. At rest, placement checks full hull/aboard bounds after clamping and tries alternate/compact candidates.

**“Between the lamps”** is an original 75-second/64-BPM cue: ten open voicings, 21 sparse motif notes/rests, a fuller middle and quiet return, soft synthesized voices with reusable air/water and shared reverb. One context/time-based scheduler, owned sources and a live master gain support prompt mute, clean hide/resume and teardown. Undo/Restart keep the base phrase phase and clear action effects. Travel sound follows visible movement; delivery resolves during visible unloading. The compact Sound control stays available in transit. No song, recording, lyric, sample, external service or new dependency is used.

## Executed checks

| Check | Actual result |
| --- | --- |
| Production build / TypeScript | Pass. Existing Vite >500kB chunk advisory remains: JS 686.88kB raw /181.58kB gzip; CSS 8.33/2.64kB. |
| Unit checks | 80/80 pass in nine files. Includes five new timing/placement checks, six water checks and seven audio checks. |
| Separate reference model | 32/32 pass; not runtime/UI evidence. |
| Initial frozen-source browser run | 46/48 pass, two failures, zero timeouts/skips; 19.7 minutes. [Original report](initial-automation-results.json). |
| Corrected affected browser checks | 2/2 pass, exit 0, 1.6 minutes. [Report](affected/automation-results.json). This is not a clean full 48/48 rerun. |
| Final reflection change | 3/3 affected browser checks pass, exit 0, 48.5 seconds: shore/forecast/tide Undo, reduced water/arrival/reset and actual production First Crossing rescue. [Report](final-affected/automation-results.json). Final capture tool also completes Holding and Bellwater rescues, tide Undo and both touch widths; runtime hash guard passes, zero page errors. |
| Final actual gameplay captures and renderer comparison | Pass for stated capture/inspection coverage. Nineteen selected PNGs; original-speed local clips; bounded resources and measured software-renderer cost below. |
| Actual-runtime full-phrase mix | Pass for observable behavior: 82.086-second master-output recording crosses the 75-second phrase boundary; identical idle game state, one context/scheduler, 0 skipped events, peak 13 owned sources /63 graph nodes. Sampled RMS 0.00552–0.02290, peak 0.06509. [Recording provenance and limits](runtime-music-media.json). Sonic judgment remains unverified without listening. |

The two initial browser failures were check assumptions, retained rather than relabeled: the long action-8 tide case omitted the real confirmation for the loss of Bram waiting at Bell Pier; the previous wake assertion compared still-fading points to the new passage rather than their emission passage. Corrections explicitly confirm/assert the real loss and Undo, and associate every wake point with its exact emitted stern/frame/route, retaining the 0.721 course-distance limit and adding lifetime/sample/length bounds. These changes affect only the two failed checks.

Original development outcomes remain separate: the first material was rejected visually; a focused water run had five passes and one 5s constructor timeout under concurrent capture load, followed by a clean whole-suite pass with browsers stopped. Four early browser cases reached passing assertions, but that runner was interrupted during teardown and is not reported as a passed command. Test budgets were deliberately raised to 180s for longer composite journeys; input/state/visibility assertions were not weakened. The prior environment 38-pass/3-timeout run plus isolated rechecks remains historical and is not counted as this milestone's clean execution.

## Captured gameplay and motion

Nineteen selected images: nine matching BEFORE, nine final AFTER and one native frame decoded from the final uninterrupted clip. All selected scene states were inspected at native resolution; ordered idle/crossing/tail frames were inspected separately. [Capture index](capture-manifest.json), [BEFORE source/states](before/capture-manifest.json), [AFTER source/states](after/capture-manifest.json), [derived-frame provenance](derived-media.json), [browser/media detail](BROWSER_QA.md).

| State | Selected final gameplay |
| --- | --- |
| Holding ordinary, shallow apron and open sheen | [Desktop start](after/holding-pier-desktop-ordinary.png) |
| Bellwater ordinary and route network | [Desktop start](after/bellwater-desktop-ordinary.png) |
| Loaded Harbor / flooded low shore at tide 2 | [Holding](after/holding-desktop-flooded-tide-2.png), [Bellwater](after/bellwater-desktop-loaded-tide-2.png) |
| Complete Undo to action 7 / tide 1 | [Restored Holding](after/holding-desktop-undo-tide-1.png) |
| Loaded ferry, practical controls and all stops on phone | [844×390](after/bellwater-phone-844-loaded.png), [780×390](after/bellwater-phone-780-loaded.png) |
| Warm Harbor / visible delivery / success | [Holding](after/holding-desktop-delivery.png), [Bellwater](after/bellwater-desktop-delivery.png) |
| Unobscured ferry in transit | [Original video frame](after/holding-clear-transit-video-frame.png) |

Actual wall-clock, uninterrupted original-speed gameplay recordings include initial idle water, then short/long crossings and complete rescue. No action-state injection, cuts or speed changes. Both decoded tails visibly hold success. Paths: `after/raw/holding-short-crossing-idle.webm` and `after/raw/bellwater-long-crossing-idle.webm`. These videos are silent; they do not verify the soundtrack. The separate actual-runtime master mix is `raw/runtime-music-loop.webm` (82.086-second observed capture), with a full-length MP3 derivative `raw/runtime-music-loop.mp3` (81.984 seconds encoded). It includes the full 75-second phrase and loop boundary. [Audio source/method/hashes/limits](runtime-music-media.json). Videos/audio remain ignored and local, unavailable in a fresh clone; no external upload was performed.

## Renderer measurements

Same idle turn-0 protocol, 1440×900/DPR1, 120 consecutive rAF intervals, same Chromium/SwiftShader environment and inactive audio. [Exact samples and resource comparison](performance-comparison.json).

| Cove | Calls / triangles, before = after | Median ms, before → after | p95 ms, before → after |
| --- | --- | --- | --- |
| Holding | 685 /127,020 | 66.7 → 83.4 | 133.3 → 166.7 |
| Bellwater | 561 /101,960 | 66.6 → 83.3 | 133.2 → 166.6 |

This final run shows about a 25% increase in software frame intervals. Source/resource inspection confirms no extra scene pass, reflection target, per-frame field rebake or active audio graph; the additional water-fragment lookups, normals, absorption and reflected light are a plausible cost, not a proven single bottleneck. The visible depth/light improvement is retained with this measured cost documented. These quantized software observations establish no physical-phone or native-GPU headroom.

## Findings and remaining uncertainty

No confirmed gameplay/control defect remains in the checked coverage. The initial milky coast, hidden amber cue and reported transit/docked-card overlap were addressed and affected evidence refreshed. Musical taste, perceived balance and audible-seam quality await listening to the supplied actual mix. Physical devices, native GPU performance, Safari/Firefox, platform fonts, screen-reader speech and actual OS background/interruption policy beyond simulated visibility/Web Audio suspension remain unverified. The packed seabed is a bounded painterly approximation rather than a second underwater scene; optional static landmark capture was not added. Fresh reinstall was not repeated because dependencies are unchanged.

The authorized handoff uses a normal commit/push and updates draft PR #1, with staged/committed source and image equality checked. Final commit/ref equality is reported in the PR and chat handoff. Main stays unchanged; no merge or ready-for-review action. Stop at this atmosphere milestone for the user's playtest.
