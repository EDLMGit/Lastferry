# Last Ferry review — M1 · 20 October 2026

## Disposition

**Ready for M1**, within the tested Chromium environment.

The implemented cove completes the rescue through real mouse, keyboard and emulated-touch controls. The independent rules, all supplied replays, tide/flood boundaries, previews, undo, presentation locks and production build passed their checks. The actual screenshots were visually inspected, including boarding, full load, raised tide, flooded pier, arrival and phone layouts. No confirmed defects remain in the performed checks. Physical-device/browser coverage and hardware performance remain unverified; this is a local review, not a GitHub approval or a claim about player enjoyment.

## Source and scope

- Repository / PR / branch: local directory `C:/Users/ernes/Documents/last-ferry-codex-starter`; no Git repository, PR or branch.
- Reviewed HEAD: **no commit yet**. Comparison base: none.
- Tested state: newly implemented application/configuration/tests plus the unchanged authoritative level and rules. README, STATUS, asset ledger and this review describe the work. No unrelated source was removed.
- Tested source: [source-manifest.json](source-manifest.json), 36 files, snapshotted **2026-10-20T20:16:43.083Z** (22:16 Europe/Madrid).
- Aggregate SHA-256: `3fbcb8c62bfd933a776cb1836d35430713943a6e6ff400c545146d6e74e7c0df`.
- Evidence belongs to that uncommitted file snapshot. Finalization rehashed the files and confirmed no implementation or test changes after the snapshot. Do not relabel these captures as a later commit without comparison.
- Scope: one six-node tutorial cove, exactly two rabbits and one sheep; no later chapters, extra objectives, publishing or remote actions.
- Tooling limitation encountered: an early Playwright run completed its test bodies but stalled in Windows sandbox web-server process-tree teardown. The final verification prestarted the two servers and reused them; `npm run test:e2e` then exited normally with status 0. One early CSS import error was fixed before the first successful scene checkpoint.

## Environment

| Item | Actual value |
| --- | --- |
| OS | Windows 11 Pro, 10.0.26200, x64 |
| Browser | Playwright Chromium 156.0.8078.4, headless, SwiftShader WebGL 2.0 |
| Runtime / package manager | Node 24.15.0 / npm 11.12.1 |
| Application packages | Three.js 0.186.1, TypeScript 7.0.2, Vite 8.3.4, Vitest 5.0.5, Playwright 1.64.1; exact lockfile retained |
| Desktop | 1440×900 CSS pixels, DPR 1; mouse and separate keyboard-only rescue |
| Phone landscape | 844×390 CSS pixels, DPR 1; Chromium mobile/touch emulation, not a physical phone |
| Portrait | 390×844 CSS pixels, DPR 1; mouse with reduced motion |
| Launch | `npm run dev -- --port 5173`; `npm run serve:test` builds and serves production at 4173 |
| Capture | Playwright real interface clicks/taps/keys, screenshots and unedited browser-context recordings |

[Browser environment](browser-environment.json) retains the user agent and renderer diagnostics. No FPS measurement was made. Software-renderer draw counts are diagnostics, not a mobile hardware performance result.

## Executed checks

All tests were added for this implementation. The supplied design verifier is reported separately.

| Check / command | Result | Observed evidence |
| --- | --- | --- |
| `npm ci` | pass | Lockfile install completed: 51 packages added, 52 audited, 0 vulnerabilities. |
| `npm run dev -- --port 5173` | pass | Actual WebGL app served and operated by the browser suite. |
| `npm run typecheck` | pass | TypeScript completed with exit 0, also invoked by the final build. |
| `npm run build` | pass | Production build completed with exit 0. JS 604.14 kB raw / 157.72 kB gzip; Vite reports its >500 kB chunk warning. |
| `npm run test:unit` | pass | **16/16**, two files. Independent production reducer/session and modeled footprint, not the reference reducer. |
| `npm run test:e2e` | pass | **9/9**, 0 skipped, 0 flaky, 0 unexpected; normal exit 0. [Full browser results](automation-results.json). |
| Real desktop rescue | pass | Seven-turn deep detour, explicit boarding and delivery, win → Undo → win → Restart. |
| Real touch and keyboard rescues | pass | Seven-turn tide-wait witness completed independently with emulated touch and keyboard. Touch double tap boards once. |
| Preview immutability and execution | pass | Open/cancel route and forecast preserve state; loading preview displays 4/4 and draft 3; blocked shallow preview cannot commit. Unit previews agree with reducer outcomes. |
| Tide / deadline boundaries | pass | Units cover pre-rise rejection at turn 3, exact depth equality, safe boarding at turn 8, late arrival, low-pier unload flood, capped tide and rescue beyond turn 8. Browser covers turn-4 change/undo and turn-8 loss/undo/alternate safe boarding. |
| Complete undo and conservation | pass | Units conserve all three identities through every witness; full snapshots restore win/loss and tide. Browser checks state, passenger positions, boat position and water height across tide undo. |
| Input lock and interruption | pass | Desktop double click and touch double tap commit once; Undo/Restart disabled while moving. Visibility cancellation and an intentionally stalled animation release the lock and reconcile the committed state. |
| Subset controls / mute / reduced motion | pass | Keyboard toggles a passenger subset without cost; mute persists through reload; reduced-motion loss/recovery and portrait paths work. Actual speaker listening was not performed. |
| Rendered hull clearance | pass | Convex footprint from actual modeled ferry vertices, including appendages, checked against authored land and main pier decks at **1,212 sampled positions/orientations**, all six edges in both directions. Not a continuous mathematical collision proof. Gangway overlap is intentional. |
| Production runtime | pass | Complete seven-turn rescue using production DOM controls, development inspection global absent, no external asset requests or observed page errors. |
| `node tools/verify-design.mjs` — reference only | pass | **32/32** authored-design checks; 502 canonical states, seven-action shortest witness. This is supplementary and does not stand in for application tests. |
| `node tools/snapshot-evidence.mjs --finalize` | pass | Tested source unchanged; screenshot/video hashes and capture times retained. |

## Captured gameplay

All images below are **actual in-engine gameplay**, never concept art or a reference simulator. Per-file UTC capture times, dimensions, input, hashes and source identity are in [capture-manifest.json](capture-manifest.json).

| State | File | Observation |
| --- | --- | --- |
| Scene checkpoint | [checkpoint-a.png](checkpoint-a.png) | First scene checkpoint retained and refreshed during final verification. |
| Normal play | [normal-play.png](normal-play.png) | Complete cove, yellow/red ferry, two rabbits, sheep, route rings and HUD at turn 0. |
| Loading preview | [loading-preview.png](loading-preview.png) | Moss still ashore; free preview shows proposed 4/4 spaces, draft 3, cut blocked. |
| After tide advances | [after-tide.png](after-tide.png) | Full ferry at South buoy, turn 4, tide 1, shallows now depth 3. |
| Success | [success.png](success.png) | Turn 7, all three ashore at lighthouse steps, empty ferry lifted, completion UI. |
| Phone loading | [phone-loading-preview.png](phone-loading-preview.png) | 844×390 touch layout; full map, current HUD, preview and confirmation visible; Undo available. |
| Phone success | [phone-success.png](phone-success.png) | Same viewport after a real touch rescue; counter labels remain visible following the scroll fix. Sidebar can scroll to supplemental ending details. |
| Portrait | [portrait.png](portrait.png) | 390×844, complete map above controls, orientation suggestion, no horizontal overflow. |
| Flood loss | [flood-loss.png](flood-loss.png) | Executed turn-8 loss; low island/pier submerged, gentle recovery UI. Undo then safe boarding tested. |
| Desktop recording | [raw/desktop-rescue.webm](raw/desktop-rescue.webm) | Unedited 1440×900 run: forecast, preview/cancel, boarding, blocked cut, deep detour, tide rise, Undo, arrival, win undo, repeat win, Restart and mute. About 12 MB; local/ignored. |
| Phone recording | [raw/phone-rescue.webm](raw/phone-rescue.webm) | Unedited 844×390 run: touch selection, load preview, double tap, tide wait/rise/undo, cut route and completion. About 3 MB; local/ignored. |

Visual verification: **complete for the stated screenshot coverage**. The palette, rounded terraced land, shaped ferry and character silhouettes are a deliberately simplified procedural interpretation of the primary reference. No real-device visual or usability study is implied.

## Findings and resolutions

**No confirmed remaining defects in the checks performed.** The following bounded defects were found and fixed during implementation:

### M1-01 — P2 — Ferry briefly clipped a pier while turning

- Source: `src/scene/motion.ts`, `sampleJourney()`; regression check in `tests/unit/clearance.test.ts`.
- Reproduce: sample the cut → harbor arrival and sheep → cut departure with the original early yaw interpolation.
- Expected: the actual oriented hull clears land and the main jetty deck.
- Observed: six sampled poses overlapped the pier polygons; centerline-only clearance did not reveal this.
- Impact: a visible clipping/docking defect despite logically valid movement.
- Resolution: keep the ferry broadside until clear of the pier; finish broadside before docking. All 1,212 sampled poses now pass. Authored graph, coordinates and gameplay values were preserved.

### M1-02 — P2 — Phone overlays and retained scroll hid useful scene/HUD content

- Source: `src/style.css` mobile frame, `src/scene/world.ts` camera framing, and `src/main.ts` selection/terminal/Undo/Restart rendering.
- Reproduce: inspect the early 844×390 frame; complete delivery after scrolling to confirmation.
- Expected: lighthouse and buoys remain within the frame and counter labels remain visible on completion.
- Observed: the early title overlaid the lighthouse, lower controls obscured a buoy, and completion retained sidebar scroll that clipped counter labels.
- Impact: reduced mobile readability; labeled controls remained a workaround.
- Resolution: reserve header/footer space, move mobile utility controls beside the title, frame the whole map, and reset relevant panel scroll positions. Refreshed touch captures were inspected; the phone browser test now asserts `scrollTop === 0` after success.

## Remaining uncertainty and next action

- Not run: physical iOS/Android touch, Safari, Firefox, speakers/headphones, hardware FPS or memory profiling, and a first-time-player enjoyment study. These limit platform/performance and subjective-quality claims, rather than the verified rescue rules.
- Known build note: the conventional Three.js bundle triggers a size advisory; the build passes. No extra asset pipeline or publishing work was added.
- Next action: play or review this local M1 build. Future chapter/progression work is deliberately left in the brief.
- GitHub actions actually taken: **none**. No repository initialization, commit, push, PR, deployment, remote comment or approval.
