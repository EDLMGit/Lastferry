# Focused browser verification

Environment: Node 24.15.0; Playwright Chromium 156.0.8078.4, Windows, SwiftShader, DPR 1. Phone sizes are touch/mobile emulation, not a physical Android device. Tests remove Playwright's permissive autoplay default and request native gesture-required audio policy.

Commands, from the repository root:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='../.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT='5270'
$env:LAST_FERRY_PRODUCTION_PORT='5271'
$env:LAST_FERRY_REVIEW_DIR='reviews/story-production/dev3'
npx playwright test tests/e2e/story-production.spec.ts --output=.cache/story-production-dev3

$env:LAST_FERRY_REVIEW_DIR='reviews/story-production/follow-up'
npx playwright test tests/e2e/story-production.spec.ts --grep 'navigation,|controlled pending|native fullscreen' --output=.cache/story-production-follow-up

node tools/encode-story-production.mjs reviews/story-production/dev3
node tools/encode-story-phone-inspections.mjs reviews/story-production/dev3

$env:LAST_FERRY_REVIEW_DIR='reviews/story-production/follow-up-recap'
npx playwright test tests/e2e/story-production.spec.ts --grep 'navigation,|native fullscreen' --output=.cache/story-production-follow-up-recap

$env:LAST_FERRY_REVIEW_DIR='reviews/story-production/final-checks'
npx playwright test tests/e2e/story-production.spec.ts --grep 'navigation,|native fullscreen|narrow Harbor' --output=.cache/story-production-final-checks
```

## Actual results

Seven distinct browser cases pass across the retained runs. The initial complete six-case run has **4 passed / 2 failed** in 4.5 minutes. The affected follow-up has **3 passed / 0 failed** in 19.0 seconds. A recap contrast follow-up has **2 passed / 0 failed** in 14.9 seconds. The final bounded-correction run has **3 passed / 0 failed** in 26.2 seconds, including a new narrow-Harbor case and stronger final-button/held-key assertions. Cases are intentionally repeated where affected; this is not a fresh seven-of-seven single-run claim.

| Case | Observed coverage | Result |
| --- | --- | --- |
| Actual audible journey | All three normal opening actions and held endpoints; canonical Holding start; real nine-action rescue, tide Undo/replay and terminal Undo/redelivery; explicit rescue acceptance; Harbor action; Bellwater entry, actual ten-action rescue and existing ending | Passed in dev3, 1.7m |
| Native compositions | 320×740, 390×844, 780×320, 844×390, 1440×900; all opening shots and Harbor endpoints; 390×844/780×320 actual begin/intermediate/end captures; full-label/nested overflow/44px controls; transcript/back focus; untouched Holding start | Passed in dev3, 2.0m |
| Navigation and checkpoints | Native Tab/Shift+Tab/Enter/Escape; Read story and Settings; Reduced→normal without replay; Replay; background settlement; Skip recap; pending restore/Replay scene; repeated Next/final touches; all three direct practices preserve campaign bytes | Original focus failure; corrected application follow-up passed, 8.3s |
| Cold audio and cancellation | Fresh trusted touch, no prior activation/context; prior mute; early Next, Replay, Read story cancellation; mute/unmute with no late cue; bounded sources and one context/scheduler | Passed in dev3, 23.8s |
| Controlled pending resume | A held first resume/state fixture around one real native context; a scheduled story event is safely invalidated; explicit Mute; late promise resolution produces no story voice or backlog | Original counter expectation failure; corrected fixture assertion follow-up passed, 4.0s |
| Native fullscreen / production | Actual app-root fullscreen entry and exit; same dialog/focus; ordinary viewport rotation after exit; production root without DEV hook/prototype/iframe/voice UI; immediate Skip/handoff and one real Moss unload | Passed in dev3, 5.1s; strengthened follow-up passed, 5.3s |
| Final boundary and narrow Harbor | Held Enter cannot repeat Next; double click from the second shot cannot acknowledge the new final shot; fresh final tap is immediately available; narrow-only Moss placement keeps his face inside the art, with restored/replayed Harbor remaining pending | Stronger navigation passed 8.7s; final production/fullscreen 4.7s; new native Harbor case 11.8s |

The Harbor phone-fit fixtures restore a valid pending cove-boundary checkpoint, then Replay the actual production illustration for detailed movement captures. They do not manufacture gameplay rescue state. The separate uninterrupted sequence earns Harbor by actual UI play and captures both complete rescues.

## Original failures and their provenance

1. **dev1 harness:** source collection assumed optional `public/` existed. ENOENT happened before a browser case. The helper now checks existence. Its error context and interrupted teardown are retained under `dev1/`; no app defect or browser pass is claimed.
2. **dev2 temporal omission:** the original geometry test passed, but independent inspection found portrait Tide already settled at its purported beginning after a covered-World warmup stall. Original mislabeled files remain untouched and are expressly not movement proof. The app now suspends the covered World loop and gives the finite illustration one separate cancellable clock. The test now rejects a settled beginning or an out-of-range midpoint. See `dev2/OBSERVATION.md`. Redundant superseded PNG/JSON files were moved intact into ignored `dev2/raw/superseded`; its archive map retains their hashes, while the original bad portrait Tide frames remain public.
3. **dev3 focus defect:** repeated native Escape from story Settings produced a noncancelable native dialog cancellation; the new scene content was present but the dialog had closed and trigger focus was lost. The app now handles Escape on the story-owned layer before native close, preserving the same layer-dismiss semantics. Original context and the root diagnostic remain retained. Follow-up verifies settings/read focus, held shot and checkpoint state.
4. **dev3 pending counter expectation:** the native context's initial state-change event invalidated the story run token before the visual cue. The cue was rejected safely, not counted as `storySkipped`. The corrected assertion requires an actual attempted event to be either consumed unavailable or safely rejected, plus zero story playback and zero late revival after mute/resume. Follow-up records **rejected 1, skipped 0, played 0**, null token, and **late played 0 / owned 0 / muted true**. No audio implementation change was required for this harness expectation.
5. **Visual recap contrast:** the complete short-landscape Skip recap crossed the ferry bow and mixed background colors. A bounded recap-only dark teal plate and cream text improve readability; normal approved captions and layout geometry are unchanged. Fresh native recap/focus/production checks pass.
6. **Final-button repeat:** independent review reproduced a double click on the second shot advancing to the ferry and acknowledging it with the second click. The app rejects native repeated-click detail and held Enter/Space repeats without introducing a delay or minimum viewing time. The final regression begins on the second shot, proves the scene remains pending, and then explicitly activates the final action. Original reproduction is retained under `harbor-fit/next-boundary-review.json`.
7. **320px Harbor art clipping:** native inspection found part of Moss's black face beyond the right art edge, which the canvas/text geometry checks could not establish. A Harbor-only anchor clamp below 360px preserves his complete face. Final 320px native beginning/held images are inspected, while the original remains retained. Painter parity confirms the opening and unaffected Harbor sizes remain unchanged.

## Source identities and finite motion

The dev3 runtime/source manifest is unchanged across its run: `9307f8bf176bf61e3b0dcf141c49cdb35e010daf63a0fd5af5694bf7c8d18f14`. Its executed test module is archived locally under raw and identified by SHA-256 `b25720a74973cf013a9241f74bd1a357cb48a6ca2046aa531bbf0e3d683822d0`.

The first follow-up runtime/source manifest is unchanged across its run: `e687357dab2e78f1051b0f803ab3655ab46942d279e61c7dad9b36cba5b0b5be`. The final run is also unchanged across execution: `5f605bc63299eba5e8532b499f1fd04a1f9ad42bfd8410963f357f971ee1947e`. The application differences from dev3 are the bounded Escape/repeated-input guards, recap-only CSS plate, and Harbor-only narrow Moss anchor. Sound, clocks, rules and normal reference shots are unchanged; the recorded 390px/780px/844px Harbor artwork is unaffected by the below-360px clamp. Exact executed test hashes are in each run's `executed-fixture.json`; the root source-reuse audit records the narrow differences. These working-tree evidence identities precede the final commit and must not be relabelled as captures executed from that commit.

The actual sequence observes finite 6000/6000/7000/5000ms endpoints. Caption fade begins at 1058–1066ms and is fully visible at 1292–1299ms. The held illustration draw count and World frame count remain fixed; both owned frame requests are absent while held. Next preserves the same gameplay canvas; gameplay resumes at the handoff. All four story cue events play; the opening emits no gameplay transfer, travel or arrival event. Harbor leaves prior arrival/delivery counts and sustained victory music target unchanged.

One captured Lantern RAF interval is 679.9ms, between elapsed 5298 and 5964ms near its settling endpoint. Other observed per-shot maxima are below 21ms. This software-rendered capture is not evidence of native-GPU or physical-phone performance, and no uniformly smooth performance claim is made.

## Media and inspection

`dev3/actual-journey.mp4` is an uninterrupted **89.863072s** actual full-interface sequence, 844×390, **4,177,937 bytes**, SHA-256 `91bfb91882bb12b9736f04c9341fca95fa4e22a37954a16d8b80927d7f72fb21`. It contains 546 native screencast frames and actual `Sound.captureStream()` master audio. Recording begins as Settings closes after an ordinary activation gesture: its first cached raster still shows Settings, then the title and Begin journey. All subsequent play is through real UI inputs, ending on Both coves are safe. The separate cold-touch test establishes first-gesture startup.

The encoder aligns native browser timestamps and trims only 40.122ms of audio preceding the first captured frame. It preserves variable frame durations and the original runtime gain: no internal cuts, speed changes, normalization, boost, replacement audio or generated narration. The entire encoded audio/video decodes without errors. Audio peak analysis reports −19.7dBFS; that is an observation, not a perceptual loudness approval. Raw native JPEG frames and original Opus remain local/ignored with encoding provenance.

The 24 detailed opening/Harbor begin/intermediate/end images at 390×844 and 780×320 were opened at native resolution. They show the lower steps becoming covered while the rabbits stay high; the deliberate lantern lift; ferry entry/approach with Moss; and safe Harbor lantern placement with an empty waiting ferry. Captions and controls are legible, and held frames preserve each composition. Other native phone/desktop fit frames, corrected 320px Harbor images and Skip recap images were also inspected. `native-inspection.json` identifies all 46 opened images with their original dimensions/hashes, including six decoded video endpoint images. The new Harbor drawing and the mix still await human review; screenshot inspection is not that approval.

`dev3/390x844-scene-inspection-silent.mp4` (37.16s, 517,361 bytes) and `dev3/780x320-scene-inspection-silent.mp4` (38.96s, 438,988 bytes) retain the complete native phone inspection recordings without trim, resizing or speed changes. They are silent and include the explicitly checkpoint-fixtured Harbor replay. The portrait recording starts with a brief white initial navigation raster; both end at the held Harbor composition. Full decodes and original/output hashes are retained in `phone-inspection-encoding.json`. They complement the actual earned-rescue sequence with runtime sound rather than replacing it.

## Remaining limitations

No physical Android, native GPU, other-engine, screen-reader or hardware-speaker listening approval is claimed. Actual runtime audio is supplied for listening; narration files are absent. The controlled resume fixture is not a reproduced Android/browser-policy failure. Native fullscreen entry/exit is verified on Chromium; rotation inside physical Android fullscreen is not. Existing card/dock overlap, delivered-heading and precise ≤180ms rapid-touch limitations remain open. General rapid repeated inputs in this pass do not close that inherited timing requirement. Invalid/unavailable-storage behavior remains covered by the preserved strict progress-unit tests; no save schema or mid-puzzle resume was added.
