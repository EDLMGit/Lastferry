# HOME_PLAY_FLOW_01 — review handoff

Ready for ChatGPT review of the combined Home, story flow and direct-transfer pass. All internal stages are implemented. Human visual/pacing/listening acceptance remains separate. No deployment.

## Source and scope

Started clean on `m1-first-crossing` at reviewed `d532c62f0f25854387869466572a1ed0cf35a0ac`. The exact supplied task resolved to `C:/Users/ernes/Documents/last-ferry-codex-starter/LAST_FERRY_HOME_PLAY_PACKAGE/NEXT_TASK_HOME_PLAY_FLOW.md`; the actual Git root is its sibling `Lastferry/`. The package is retained byte-for-byte under this repository's `LAST_FERRY_HOME_PLAY_PACKAGE/`. This task replaces both unstarted flow/feedback assignments; the prior illustrated production assignment was already complete.

Captures were made from that baseline **plus working-tree changes**, not from an invented later commit. Per-run manifests retain all 68 runtime/data/dependency file hashes and timestamps. The final `handoff/` recording/phone frames and `cold-entry/` checks match all final runtime entries exactly. `source-audit.json` records scoped reuse of earlier portrait/full-label/subset/fullscreen results: only receipt placement, closing More after Skip and a redundant pure keyboard-intent assignment changed afterward; affected checks were repeated. Implementation commit and committed-blob comparison are in `packaging-audit.json`.

PR: https://github.com/EDLMGit/Lastferry/pull/1 — remains draft against unchanged `main` (`386de54d20fdd4a513a06115471d70bf94738cc0`). No puzzle JSON, reducer, checkpoint schema, model, painter, accepted score, wood, water/wake, sailing timing or heading algorithm was changed.

## What changed

- **Home:** fullscreen live Holding composition, full ferry/lighthouse, measured title/menu exclusions, quiet landscape side menu and portrait art between title/actions. Warm Play/Continue, Options, Practice, shared Sound, honest checkpoint/invalid/visit-only/completed copy. Home reads progress without writing it. Covered gameplay is inert and explicitly blocked; route/marker suppression persists across World updates. Options/Practice preserve the same renderer. Existing native dialog and `#app` fullscreen root remain shared.
- **Story:** fresh trusted Play enters the approved opening directly and requests the existing Sound intent synchronously. Normal shots progress at their existing 6/6/7-second endpoints. Pause/Resume retains elapsed time and consumed cues. Next/Replay/Skip/Read/Options, restored recap and Reduced Motion remain available; only final Take the helm / Continue to Bellwater acknowledge. A held Next pointer/Space cannot become a final handoff when the shot changes. The approved painter, captions and Harbor scene are unchanged.
- **Transfers:** safe single-passenger Board / Let ashore / Bring home act directly through `execute()`. Multiple passengers keep native pressed choices, portraits, full labels and one named group commit. Empty selections cannot commit; real loss warnings remain before commitment. Cost, resulting depth and relevant tide/landing facts appear before the action. Compact choosers replace the fixed height; short landscape fits three final-delivery choices in one row. Dock placement searches clear space around figures and map targets.
- **Feedback:** one receipt comes from the accepted transaction and appears at `finish()` on actual visual completion, with an optional changed depth band. It neither intercepts input nor takes focus, avoids faces/controls/map names, and clears on Undo/restart/hide/Home/cove change/disposal. Reduced Motion holds it still. Existing status announcement is coalesced rather than duplicated.
- **Inventory/help:** all 75 prior family IDs preserved; only `ui.home-composition` added (76 total). Reused story/dialog/action/choice families updated; gallery links the real root without a second World. Authored recipe: `docs/HOME_COMPOSITION.md`; exact inventory delta: `catalog-changes.json`. README, in-game Help, canonical story and continuity updated.

## Verification

Environment: Windows, Node 24.15.0, npm 11.12.1, Playwright Chromium 156.0.8078.4 with SwiftShader, DPR 1 and emulated touch. Tests explicitly remove Playwright's permissive autoplay default and use the browser's user-activation policy. Local root is **http://127.0.0.1:5270/**, without `?cove=`. Production smoke used Vite preview. No physical-phone or native-GPU claim.

| Check | Actual result |
| --- | --- |
| `npm run build` | Passed; includes TypeScript. Existing >500kB bundle warning remains. |
| `npm run typecheck` | Passed separately. |
| `npm run test:unit` | 303/303 across 34 files in the isolated final run. An earlier concurrent run had one unchanged Bellwater clearance test exceed its 5s timeout; original failure retained, threshold unchanged. |
| `npm run check:assets` | Passed, 76 unique families, 75 existing IDs preserved. |
| Focused browser cases | Nine distinct cases passed across retained runs: corrected batch 6 passed/1 failed, portrait rerun passed, receipt rerun passed, then final release (2/2), handoff (3/3), and strict pre-activation touch/pointer/keyboard (1/1) batches. This is **not** a single-run 9/9 claim. See `BROWSER_CHECKS.md` and exact logs. |
| Actual rescues | Uninterrupted actual UI: Holding nine-action rescue, tide Undo, terminal Undo/redelivery, explicit Harbor continuation, Bellwater ten-action rescue and accepted available-content ending. No injected gameplay state. |
| Transfer risk/subsets | Last-safe single rabbit shows real loss; Cancel free; deliberate loss + terminal Undo; both rabbits board before rise. Mixed/partial home delivery, single Pip/Moss delivery, unchanged draft band, empty invalid selection, repeated-click protection and disappearing-control focus checked. First Crossing direct Board + Undo covered. |
| Home/progress | Fresh read-only Home, scene/cove/completed checkpoints, exact invalid bytes, unavailable storage, replacement Cancel, practice isolation, return-home Cancel/confirm, inert input and persistent renderer checked. |
| Phone/keyboard/fullscreen | Native 390×844 and 780×320 inspection; fit at 320×740, 844×390, 1440×900; real portrait rescue and full text-line/nested-overflow checks. Natural Tab/Space/Enter/Escape and touch used. Chromium actually entered `#app` fullscreen and exited with the same open native dialog. |
| Audio/lifecycle | First touch/pointer/keyboard Play, remembered mute, shared Enable/Retry/Mute, pending-resume gate and late completion after mute/hide passed. Hide tests are controlled visibility notifications. Existing unit cancellation/disposal checks pass. |

Commands and original failures are retained under `gates/`, with executed fixture copies/hashes. Use `npm ci`, then `npm run dev -- --port 5270 --strictPort`. For focused browser verification: set `PLAYWRIGHT_BROWSERS_PATH` to the installed Chromium cache, `LAST_FERRY_DEV_PORT=5270`, `LAST_FERRY_PRODUCTION_PORT=5274`, `LAST_FERRY_REVIEW_DIR=reviews/home-play-flow/recheck`, then run `npm run test:e2e -- home-play-flow.spec.ts`. The current machine uses `../.cache/ms-playwright`. Reusable local dev/preview servers avoid this Windows environment's child-server teardown hang. Historical full browser suites were not rerun indiscriminately.

## Music investigation and actual recording

The reported missing music **did not reproduce** in this software browser. Fresh Play creates one context and one score scheduler. A passive analyser taps the **score dry + reverb output after victory gain**, separately from effects/ambience; measured score RMS is nonzero and effective output includes the master gain. `cold-entry/strict-cold-entry.json` proves `navigator.userActivation.hasBeenActive === false` and no AudioContext before native touch/mouse or Tab/Enter, followed by one running score owner with nonzero output. Earlier runtime/remembered-mute evidence remains in `verified/` and `release/`. Ordinary locator inspection was found to grant automation user activation; the corrected strict fixture uses CDP `userGesture:false` throughout pre-input reads. The sequence video is actual UI/runtime audio; strict browser-policy proof comes from that separate fixture. No score/gain/composition change or duplicate Sound owner was introduced. These measurements and a real runtime recording do not establish what the user's phone speakers play.

`handoff/actual-journey.mp4`: **108.796 seconds, 780×320, 4,238,247 bytes**, uninterrupted actual Home → cold touch Play → opening → both rescues → ending. Native CDP timestamps are preserved with no cuts/speed changes. The real silent Home interval (3.744s before trusted audio activation) is retained; the existing `Sound.captureStream` output is unchanged in level, AAC encoded without normalization/boost/substitution. Full ffmpeg video/audio decode passed; measured exported peak −21.3dBFS, mean −36.6dBFS. See the encoding manifest and `gates/runtime-audio-handoff.txt`.

The final recording has **no recovery Resume**: opening shots advance automatically and the final picture waits for Take the helm. An earlier 85.063s sequence did require visible Resume after a measured 1016.7ms software-renderer RAF stall settled Lantern; that observation and prior >1s failures remain retained. The final CDP stream has sparse illustration intervals and preserves native timestamps rather than filling missing motion. It establishes sequence/ownership/audio provenance, not uniformly smooth native-phone performance. Separate strict pointer/keyboard checks also passed automatic progression.

## Native evidence

All are actual game/root-journey captures, not gallery specimens or the standalone approved reference:

- Home: `handoff/390x844-home-fit.png`, `handoff/780x320-home.png`; fit companions at 320×740, 844×390 and desktop.
- Story: `handoff/390x844-story-paused.png`, `handoff/390x844-lantern.png`, `handoff/390x844-recap.png`; `handoff/780x320-opening-{tide,lantern}.jpg` are unchanged native screencast frames (`extracted-frames.json`); `sequence-final/780x320-opening-held.png` shows the full held Ferry endpoint.
- Play/critical boundary: `handoff/780x320-gameplay-start.jpg`, `handoff/780x320-rabbit-chooser.png`, `handoff/780x320-after-rise.png`.
- Harbor preview before commitment: `handoff/780x320-bring-home.png`, `phone-final/390x844-final-chooser.png`, `phone-final/320x740-final-chooser.png`; full labels and future-state consequence inspected at native size.
- Receipt: `handoff/390x844-receipt-clear-labels.png` (final), `handoff/780x320-direct-receipt.png` (sequence source).
- Arrival/connection: `phone-final/390x844-arrival.png`, `handoff/780x320-arrival.png`, `handoff/780x320-harbor.png`.

`MEDIA.json` lists selected media hashes, native sizes and source manifests. Large raw frames/audio and disposable test videos remain local/ignored. The compact 4.24MB uninterrupted review MP4 is deliberately retained for accessible review. `sequence-final/opening-continuous.mp4` is a separately labelled 29.700s continuous leading excerpt, with unchanged runtime audio, showing the full opening and held endpoint at native 780×320. Its later denser-capture rescue attempt failed the Harbor portrait-load predicate; it is not presented as a successful rescue. The successful full journey uses the same final runtime files. See `sequence-final/opening-excerpt.json` and the original failure log.

## Remaining limits and next review

- Missing phone music remains unreproduced, **not declared fixed**. Physical Android, hardware speaker/headphone listening, other engines, native GPU, alternate platform fonts and screen-reader speech were not verified. Human pacing/art/mix approval is pending. Narration recordings remain absent optional slots; no TTS or substitute voice.
- The inherited constrained Bellwater East Buoy/card/dock overlap is not closed: the established Play-view/pan workaround was used, and this pass does not claim a fresh closure measurement after the bounded dock-placement change. Delivered-heading discontinuity (previously 1.425683rad/99.9ms against 0.85 threshold) and precise ≤180ms rapid-touch measurement remain open. Ordinary double-click/touch fences do not close that timing limit.
- The final denser capture attempt timed out at Harbor while two portraits had not loaded (full names/capacities remained usable, no page errors). Cause was not established; earlier same-source full delivery and portrait/fit checks passed. This is retained as a capture/load verification limitation, not silently reclassified as a pass.
- Original development failures, capture stalls, resize-fixture race, test fixture mistakes and server teardown interruptions are preserved. Review final evidence with its source scope rather than treating all historical runs as passing.

**Not deployed.** The existing owner-private Site remains version **12**, game `1a85874883af5caa59f6294a75495eccf2afebbc`, hosting `e87c5c5baa53a39001c5a89b07b59aab2ad150fc`. `review/deployment-confirmation.json`, its supplied copy and earlier publication history are unchanged. This GitHub implementation awaits ChatGPT review before any publication.
