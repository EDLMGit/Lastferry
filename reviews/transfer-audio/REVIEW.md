# Last Ferry review — wooden transfer contacts

## Disposition

**Ready for focused playtest; speaker listening remains pending.** Wooden contacts follow the selected animals' visible transfer, with a separate, unchanged Harbor arrival phrase. The reproduced 780×320 forecast clipping is fixed. This is a scoped audio/layout pass; the accepted puzzles, music, water, selection behavior and sailing pace remain.

## Source and scope

- Repository: https://github.com/EDLMGit/Lastferry
- Draft PR: https://github.com/EDLMGit/Lastferry/pull/1
- Branch: `m1-first-crossing`; comparison/start HEAD `fa07368b803a992712a5126b85862c5b91dbcf3a`, selected by the task and confirmed as the clean checkout.
- Main remains `386de54d20fdd4a513a06115471d70bf94738cc0`.
- Evidence was captured before commit against that HEAD plus the recorded working-tree changes. Per-run source manifests/archive hashes retain their actual identity; they are not relabeled as later commits. The final handoff gives the pushed commit, and a content audit compares it with these files.
- Runtime changes: visual transfer timeline/callback, cached procedural wood contacts, distinct transfer ownership/cleanup/budget, and one landscape `min-height` rule. No new dependency or code comments.
- `source-manifest.json` identifies the complete 97-file final source/test/document snapshot: SHA-256 `a73d6b70de4b0a7352c7f515aaf050a29b7e61a252eb18f184ae6b4f5fa9ed87`. `capture-complete/source.json` identifies its smaller runtime set as `383ccdd71958e7668bf936a94ee3398ed38ee83c6f045091f3c2246899824ade`, unchanged throughout recording. `preservation-audit.json` records 36 unchanged contracts and the precise reuse of earlier phone evidence. Its initial-browser manifest's omitted `tsconfig.json` is disclosed and separately checked against the baseline.

## Behavior

Boarding makes a rounded contact at the bridge and a quieter settling tap towards the deck. Unloading uses one wooden departure contact. A proposed second unloading tap was removed because it would be over the stone surface at Stone Pier. Rabbit-only groups use the lighter cached buffer; a group containing the sheep uses the fuller one. Group level is bounded rather than multiplied per animal.

The actual presentation progress drives contacts after the passengers' positions are updated. A stale window is consumed silently. Muted contacts are also consumed; unmute, Undo synchronization, cancelled previews and recovered/hidden transitions never queue missed sounds. Reduced motion has one compact cue. Transfers own at most two short sources and yield to score notes. Delivery cannot erase transfer tails or mistake them for arrival.

All three cove data sets, action costs/event order, required Holding solution, full history/Undo, canonical courses, water, camera/selection logic, accepted score/accompaniment and movement durations are preserved. The only layout change lets the existing landscape game height fit shorter viewports.

## Environment and reproduction

Windows; Node 24.15.0/npm 11.12.1; Playwright 1.64.1, Chromium 156.0.8078.4, headless SwiftShader, DPR 1. Phone checks use emulated touch/mobile viewports **844×390 and 780×320**, plus natural Tab/Shift+Tab/Enter/Escape navigation. Production First Crossing uses 1440×900. No physical phone model/browser is claimed.

```sh
git clone --branch m1-first-crossing https://github.com/EDLMGit/Lastferry.git
cd Lastferry
npm ci
npm run dev
```

Production: `npm run build`, then `npm run preview`. This workspace reused installed lockfile dependencies. Verification servers were `npm run dev -- --port 5193 --strictPort` and `npm run preview -- --port 4183 --strictPort`. Set `LAST_FERRY_DEV_PORT=5193`, `LAST_FERRY_PRODUCTION_PORT=4183`, `PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright`, and a fresh `LAST_FERRY_REVIEW_DIR` before reproducing browser checks. A fresh clone can install Chromium into `.cache/ms-playwright` as documented in README.

## Executed checks

Detailed run results, original failures and contact/media observations are in [BROWSER_AUDIO_QA.md](BROWSER_AUDIO_QA.md); the short-viewport reproduction is in [PHONE_QA.md](PHONE_QA.md). Browser commands were `npx playwright test tests/e2e/transfer-audio.spec.ts tests/e2e/transfer-phone.spec.ts` for initial integration, `npx playwright test tests/e2e/transfer-audio.spec.ts tests/e2e/production.spec.ts` after the contact correction, and `npx playwright test tests/e2e/transfer-audio.spec.ts -g "real UI normal rescue"` for the corrected assertion. Recording used `node tools/capture-transfer-audio.mjs --base=http://127.0.0.1:5193 --output=reviews/transfer-audio/capture-complete`.

| Check | Actual result |
| --- | --- |
| `npm run build` including `npm run typecheck` | **Pass** on final runtime. Existing >500 kB bundle advisory remains. |
| `npm run test:unit` | **111/111 pass**, 14 files. Includes audio ownership/budget and visual-contact selection/stale/cancel/reduced cases. |
| New audio + phone specs, initial integrated source | **4/4 pass**. Final contact correction subsequently changes only the unloading cue policy. |
| Final runtime: audio specs + existing production spec | **2 pass / 1 fail**: production First Crossing and mute/hide/reduced pass; normal rescue's terminal redelivery encountered a deliberately stale cue but an assertion required every transfer to sound. Original result retained. |
| Corrected normal audio assertion | **1/1 pass**, 50.1 s, same final runtime. Selected IDs, at-most-once phases, played transfer contexts, no replay, source release and the music clock remain asserted. |
| Exact-baseline 780×320 regression | **Fail as expected**: game height 360 instead of 320; forecast only 39.3% visible. Corrected CSS-only comparisons and both phone tests pass. |
| Native screenshots and actual-runtime capture | **Pass for stated coverage:** final 844×390 start, critical boarding, after-rise and success inspected at native size; short-phone comparison inspected. Uninterrupted UI rescue with tide Undo/replay; eight contacts played, zero skipped audio calls/dropped music tones, peak two transfer sources/13 owned sources, one context/scheduler/arrival. |
| Media validation | **Pass on third capture:** actual runtime audio+canvas WebM decodes, stereo Opus 48 kHz, audio through 40.059 s; separate silent full-interface video 44.36 s decodes. Signal measured mean −36.5/max −22.1 dB, not a listening judgment. |
| Speaker/headphone listening, physical Android, real browser chrome/cutouts | **Not run:** no applicable device/listening capability. |

The original normal-test failure is informative: after seven transfers played ten contacts, a 734.8 ms observation gap put the terminal-redelivery frame at progress 0.859222, beyond the unloading window ending at 0.37. The event was correctly consumed as stale, contact count stayed ten, and the second arrival phrase still occurred. The revised check accepts silence only when every phase is recorded stale beyond its window, verifies no later replay, and retains actual played board/holding-unload/final-delivery coverage. It does not make every silent transfer pass.

Development failures are retained: two audio mock/assertion corrections; an initial TypeScript property-type error; four new unit failures caused by using display names instead of authored passenger IDs; the deliberate original phone regression; and the normal browser assertion above. Recording attempt one exported only seven bytes because a codec comma confused the helper's data-URL split. Attempt two exported valid media but missed the required Stone contact during a delayed frame, so its coverage guard failed. The corrected helper verifies byte length and permits up to two actual UI Undo/replays when a required contact is stale; the final capture needed none beyond its planned tide Undo/replay. No game timing or audio was substituted. Their passing replacements are distinct records. Earlier selection timing/performance limitations remain attributed to the earlier report; no full-browser-suite rerun/pass is claimed.

## Gameplay and audio evidence

See the per-run manifests for UTC time, source hashes, viewport, input and screenshot hashes. The final capture is an uninterrupted actual UI rescue with holding unloading, boarding, a tide rise, Undo/replay, and Harbor delivery.

| Evidence | Path |
| --- | --- |
| Original short-phone clipping | `phone-before/780x320-current.png` |
| Small correction, same base source | `phone-after/780x320-current.png`, `phone-after/780x320-preview.png` |
| Integrated short-phone start/current/preview | `browser-initial/780x320-start.png`, `780x320-current.png`, `780x320-unload-preview.png` |
| Integrated short-phone critical boarding / after rise / success | `browser-initial/780x320-critical-boarding.png`, `780x320-after-rise.png`, `780x320-success.png` |
| Established phone size | Corresponding `browser-initial/844x390-*.png` |
| Final runtime start / critical boarding / after rise / success | `capture-complete/phone-start.png`, `phone-critical-boarding.png`, `phone-after-rise.png`, `phone-success.png` |
| Actual runtime audio + canvas gameplay | `capture-complete/raw/holding-transfer-runtime-audio.webm` |
| Same session, full interface, silent | `capture-complete/raw/holding-full-interface-silent.webm` |

The synchronous canvas/audio recording uses the game's existing Web Audio master stream and real rendered canvas in one MediaRecorder. It excludes DOM controls. A separate uninterrupted full-interface Playwright video covers the same session and is **silent**. These are actual procedural runtime music/effects, with no replacement audio, editing or state injection. Canvas capture averages about 12 frames/s on this software renderer; the silent UI stream is encoded at 25 frames/s. No device-performance claim follows. Raw media remain local/ignored and are unavailable in a fresh clone. `media-retention.json` and `capture-retention.json` map earlier unselected PNGs to their preserved local raw paths; original capture manifests retain their original paths/hashes. `capture-complete/media-analysis.json` contains decode/stream/level results.

**Actual listening outcome: unavailable, not a pass.** Audio source events, non-silence, encoding and levels can establish that runtime sound was captured; they cannot establish wooden character, comfortable phone-speaker balance, or subjective fit beneath the music. The restrained mix is a playtest proposal. Listen to the runtime clip or enable Sound while unloading at Stone, boarding both rabbits and delivering at Harbor; compare the short contacts with the preserved music/arrival phrase.

## Findings and remaining limits

- **Fixed:** 780×320's 360 px minimum game height clipped the lower forecast. The existing landscape media query now sets `.game { min-height: 0; }`; the forecast's 56 px target is fully visible at y=258–314. Established-size layout and 44 px/14 px assertions are preserved.
- **Fixed before final capture:** unloading's second wooden cue would occur over the stone pier. Unloading now stops its wooden contacts before that surface.
- At 780×320 an open location card can cover part of Harbor. It is dismissible and its action remains usable; this pass preserves accepted card placement. Real cutouts, browser bars, display density and safe-area behavior remain device gaps.
- Hidden-page recovery uses a controlled document-visibility event in the focused check, not a physical Android background interruption. Web Audio mock tests also cover teardown and source-budget pressure.
- No new broad visual/performance campaign, other browser engine, fresh dependency reinstall or audible-quality approval is claimed.
- The existing private playtest URL, https://last-ferry-playtest.abumech.chatgpt.site, still contains the separately managed selection snapshot. **This task does not deploy the new sounds.**

The next action is the user's sound/device playtest after review. Normal commit/push and draft-PR update are the authorized handoff; main is not merged or changed.
