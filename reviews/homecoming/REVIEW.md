# Last Ferry review — Harbor homecoming

## Disposition

**Ready for the focused homecoming review within exercised Chromium coverage.** Build/typecheck, 153 unit tests and 14 distinct focused browser cases pass. The 780×320 ending and Settings fit; camera/picking restore before play resumes. No confirmed outstanding blocker in these checks. Physical Android perception/performance and acoustic listening remain unverified. Publication is separate: the private Site still runs `c82ba89`.

## Source and scope

- Repository: https://github.com/EDLMGit/Lastferry; [draft PR #1](https://github.com/EDLMGit/Lastferry/pull/1); branch `m1-first-crossing`.
- Clean starting HEAD and user-selected comparison baseline: `c82ba896e690c82b731f63dc1fba0a6380ef61e1`. No newer or unrelated local work was present; no reset was used.
- Evidence was generated from that HEAD plus this task's uncommitted working tree, **not from a later commit**. [Source manifest](source-manifest.json), retained working-tree patch and [reuse comparison](source-reuse.json) identify it. Implementation commit `d3a7e3acfa2298bcaaa8e93622e81d62b367280e` was audited against the tested snapshot (Git line-ending normalization only). The final metadata/packaging SHA and remote equality are supplied in the PR handoff.
- Final 118-file source snapshot: `96c878bfee197ea3b08675119a99da15cf34ebeba356683dad4c496e59fde4d4`. README, STATUS, PROJECT_STATE and review metadata are outside this hash. Earlier run manifests remain attributed to their actual source. Only art guidance, evidence tooling and strengthened test coverage differ from the first frozen browser snapshot; all captured runtime/level files match. The two expanded cases were rerun.
- Task: `NEXT_TASK_HOMECOMING.md`, read with AGENTS, PROJECT_STATE, art direction, workflow and accepted victory lifecycle. The new task and continuity record were supplied beside the checkout and retained in the repository.
- [Protected-source comparison](protected-source-comparison.json): all 26 protected audio/rules/levels/model/water/timing/dependency files match the reviewed baseline in content, with only any Git line-ending normalization disclosed. No audio gain, cue, composition, wood contact, rule, topology or sailing change; no code comments added.

## Implemented behavior

One inexpensive translucent amber cone begins at the existing visible-arrival event and rotates while won. The lighthouse stays fixed. Its geometry is excluded from picking and framing, with no shadow spotlight, extra water pass or new animation loop. Reduced motion keeps it steady.

After final disembarkation reaches canonical anchors, rabbits make one small staggered hop and the sheep a gentler bob. The finite presentation ends in canonical transforms within 1.3 seconds. An actual orthographic Harbor push runs for roughly one second, preserving the viewing angle and updating both the projection and water view. It tries 9%, then smaller fit candidates against the full lighthouse, ferry, animals and actual ending bounds. Observed: **1.09 at 1440×900, 844×390 and 780×390; 1.00 at 780×320**. The short-phone fallback is intentional. Reduced motion uses normal framing; returning to normal does not replay the gesture.

The compact ending contains one supporting line and four 48px actions, plus Close: Holding has genuine Next cove → Bellwater; Bellwater and First Crossing have Choose a cove. Settings is directly available. Menu → Return to arrival reopens the ending without resetting effects or music. Map controls are hidden while won, then rebuilt/repositioned after synchronous camera restoration on Undo.

Shared Sound/Motion Settings switches content within the one native dialog. Sound reuses master state and persistence; its permanent HUD control remains. Motion defaults to Follow device, responds to OS changes, or persists a manual Reduced override. Invalid/unavailable storage falls back safely. One effective preference controls scene and CSS. Back, Close or Escape from Settings returns to its originating menu/ending and trigger focus; Escape/Close there dismisses the parent. Settings starts on Sound. Finite presentation imposes no extra busy period. Repeated action inputs and held Enter/Space do not queue commits or toggle a newly exposed control.

Undo, Restart, cove changes, reduced-motion activation and recovery clear finite offsets. Hiding after busy is already false is handled explicitly. The accepted audio hook still calls delivery and arrangement settlement once at the visible 72% unload event. Finite gestures, Settings and the ending add no cue. Dry/wet music remains persistently reduced while won.

## Environment

| Item | Actual value |
| --- | --- |
| OS | Windows 11 Pro 10.0.26200, x64 |
| Node / npm | 24.15.0 / 11.12.1 |
| Browser | Playwright 1.64.1 Chromium 156.0.8078.4, headless, SwiftShader |
| Viewports / DPR | 1440×900, 844×390, 780×390, 780×320 / 1 |
| Input | Mouse, natural Tab/Shift+Tab, Enter/Space/Escape; Chromium emulated touch |
| Servers | Development 5200; final production preview 4187 |
| Limits | No physical phone, native GPU, other engine or acoustic listening claim |

## Executed checks

| Check | Result | Actual evidence |
| --- | --- | --- |
| `npm run build` (includes `npm run typecheck`) | **pass** | [Build output](build-results.txt); final JS 726.11 kB raw / 193.13 kB gzip. Existing >500kB advisory remains. |
| `npm run test:unit` | **pass**, 153/153, 19 files | [Unit output](unit-results.txt); 14 new targeted motion/scene cases. |
| New homecoming browser coverage | **pass**, 8/8 | [First frozen run](browser-rerun/browser-results.txt), [JSON](browser-rerun/automation-results.json); three actual UI rescues, subsets/tide Undo, all viewports, normal/manual/device motion, persisted settings, honest progression and loss. |
| Expanded desktop/recovery checks + final production rescue | **pass**, 3/3 | [Final output](browser-final/browser-results.txt), [JSON](browser-final/automation-results.json). Held Enter, finite and already-settled hide/resume, camera/picking restoration, resource equality; production has no debug API/external assets. |
| Accepted victory mix, transfer sound and production regressions | **pass**, 6/6 | [Output](regressions/browser-results.txt), [JSON](regressions/automation-results.json). The initial production case used the pre-reset-diagnostic-fix bundle; its replacement against the final rebuilt bundle passed in the three-case run above. Five development audio cases match current runtime. |
| Audio lifecycle | **pass** for automated ownership/timing | One cue, no early reducer-triggered cue/duck, persistent dry/wet reduction, Undo/redelivery, mute/lazy creation, Restart/cove change and hidden recovery; unchanged accepted audio files. Listening **not run**. |
| Layout, keyboard/touch, free selection after Undo | **pass** in stated emulation | Ending/Settings ≥44px targets (48px principal actions), essential text ≥14px, full in-viewport controls, protected Harbor figures, exact marker projections and actual ferry picking. Natural focus trap/Back/Escape; no `.focus()` per action shortcut. |
| Hide/context loss | **pass** for simulated lifecycle events | Explicit simulated `document.hidden` and contextlost/restored events, finite and already-won handling. Not an actual OS/GPU interruption test. |
| Resource behavior | **pass** for bounded observed cycles | One beam draw object, six textures. After lazy scene/shader warm-up, repeated win → Undo → win retained identical geometry/texture/program counts. Context recovery reinitializes renderer caches; subsequent counts stay equal. Ordinary and won draw counts vary with visibility (~622–624 in the recording); no hardware smoothness claim. |
| Media | **pass** | [Capture summary](recording/summary.json), [decode/stream validation](recording/media-validation.json); both files decode, zero browser page errors. |
| Physical Android / Safari / Firefox / speaker listening | **not run** | User playtest and later browser coverage remain. Full historical performance/browser campaigns were not rerun. |

These are **14 distinct browser cases**, with the two strengthened homecoming cases and final production case additionally rerun; do not count repeated executions as extra coverage.

Reproduce with Node 24:

```sh
npm ci
npm run build
npm run test:unit
npm run test:e2e -- homecoming.spec.ts victory-mix.spec.ts transfer-audio.spec.ts production.spec.ts
```

The recorded runs use `LAST_FERRY_DEV_PORT=5200`, `LAST_FERRY_PRODUCTION_PORT=4187`, `LAST_FERRY_REVIEW_DIR=reviews/homecoming/<run>`, and `PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright` for this workspace's installed browser. An ignored temporary configuration imports the normal config with `webServer: []`; [exact configuration](browser-final/external-server-config.txt) avoids the known Windows automatic-server teardown hang. Assertions/timeouts were not relaxed. JSON reports were initially emitted under `.cache/reviews/...` because the temporary config changes relative output resolution; they were copied verbatim to the linked report folders. Verbose per-case/capture traces remain local under ignored raw folders, with hashed selected derivatives in each observations-summary and the compact recording manifest. Failed/inconclusive original observations are retained in the repository.

## Captured gameplay and visual inspection

[Capture manifest](capture-manifest.json) records 25 primary PNGs with source, times, dimensions and hashes. Additional final-desktop images and seven recording-session captures retain their own case/capture provenance. These are actual WebGL gameplay, not concept art.

| State | Primary evidence |
| --- | --- |
| Ordinary baseline | [Desktop](browser-rerun/desktop-holding-ordinary.png), [844×390](browser-rerun/phone-844x390-ordinary.png), [780×320](browser-rerun/phone-780x320-ordinary.png) |
| Visible arrival | [Desktop](browser-final/desktop-holding-visible-arrival.png), [844×390](browser-rerun/phone-844x390-visible-arrival.png), [780×390](browser-rerun/phone-780x390-visible-arrival.png) |
| Settled ending | [Desktop](browser-final/desktop-holding-settled-ending.png), [844×390](browser-rerun/phone-844x390-settled-ending.png), [780×320 fallback](browser-rerun/phone-780x320-settled-ending.png) |
| Settings | [Desktop](browser-final/desktop-holding-settings.png), [844×390](browser-rerun/phone-844x390-settings.png), [780×320](browser-rerun/phone-780x320-settings.png) |
| Restored play after Undo | [Desktop](browser-final/desktop-holding-restored-play.png), [780×390](browser-rerun/phone-780x390-restored-play.png) |
| Reduced-motion ending | [780×390](browser-rerun/phone-780x390-reduced-ending.png), [780×320](browser-rerun/phone-780x320-reduced-ending.png) |
| Other coves | [Bellwater short phone](browser-rerun/bellwater-ending.png), [First Crossing desktop](browser-rerun/first-crossing-ending.png) |

Native-size inspection covered desktop and all three phone sizes. The full lighthouse roof, ferry and rescued animals remain visible; ending/Settings controls are legible and unclipped. At 780×320 Settings covers a small inactive HUD region but leaves Harbor clear. Ordinary/restored map labels and dock controls remain aligned.

Temporal native-size video frames and sampled runtime trajectories were inspected, alongside the actual UI transition assertions. The push is modest with no orbit; rabbit hops are small and the sheep acknowledgment grounded. First cue occurs at recording wall 22.899s, finite visual movement is first sampled at 23.230s, and all offsets are settled by 24.497s. The held sweep measures about 17.65°/s, approximately **20.39s per revolution** under this software renderer. Its authored target is 20s, with capped frame delta preventing catch-up jumps. This supports timing/cancellation claims; subjective comfort on physical Android remains the playtest.

## Uninterrupted recording

Local/ignored paths (not included in a fresh Git clone or uploaded to a web host):

- `reviews/homecoming/recording/raw/holding-homecoming-runtime-audio.webm`: native 844×390 canvas with **actual unchanged runtime master audio**, VP9 + 48kHz stereo Opus, audio through 45.002s. Nine-action Holding rescue → Settings → Back → Undo → redelivery → 11-second won hold. No state injection, normalization, substitute soundtrack, cuts or time edits; export gain 1.
- `reviews/homecoming/recording/raw/holding-homecoming-full-interface-silent.webm`: **46.92s**, same uninterrupted session including all DOM controls, silent. Full DOM and runtime audio are supplied as this explicit pair rather than claiming the silent file has audio.
- Source/runtime hash: `111734aa6911467550ebd18ae25176937feaebae7792dbce4b2683f426a5a099`; all captured runtime files remain identical. [Recording manifest](recording/capture-manifest.json), [source](recording/source.json), [summary](recording/summary.json).

Listening was unavailable. No claim that speaker sound, Android cue recognition or camera comfort has human approval.

## Findings and preserved failures

No confirmed outstanding defect in the checks performed.

1. Initial scene unit assertion compared a Three Euler object with its clone, including private callback identity. Fixed the assertion to compare transform arrays; no runtime defect. [Original observed result](development/scene-unit-development.json).
2. The first full unit run was **152 pass / 1 fail**: ordinary reset retained a newly exposed sweep `reduced` diagnostic flag. `CrossingEffects.reset()` now clears the transient flag; current effective preference is reapplied by World. Targeted 7/7 and full 153/153 pass. [Original failure](development/unit-initial.json).
3. The first integration browser run was interrupted by a source/HMR reload between Undo and redelivery. It is **inconclusive**, not a stable-source failure or pass. The original observations, screenshots and output remain in [browser-initial](browser-initial/INTERRUPTED.md). A test's initial Settings-focus expectation was aligned with the useful Sound control; navigation coverage was retained. The frozen 8-case run and final 3-case run pass.
4. The original production case used the earlier build; the final rebuilt production case was rerun and passed. It is not silently relabeled as final-bundle evidence.

## Remaining uncertainty and handoff

Physical Android touch/browser chrome, fonts, speakers, sustained native-GPU performance, other engines, real context interruption and assistive-technology speech remain unverified. The pre-existing software-renderer frame-tail limitation and bundle advisory remain; no new benchmark campaign was added. No further feature or puzzle is queued into this implementation automatically.

Implementation committed as `d3a7e3acfa2298bcaaa8e93622e81d62b367280e`; complete the authorized normal push and update PR #1 while keeping it draft; main stays `386de54d20fdd4a513a06115471d70bf94738cc0`. Final remote equality and checkout status are recorded in the packaging audit/PR handoff. No merge, force push, audience change or deployment.

**Deployment: the owner-private Site https://last-ferry-playtest.abumech.chatgpt.site still contains game `c82ba89` (Site source `6b3e6e01b558b899c7ad3f6f9bed2daf1689837c`). This new homecoming pass awaits review and separate publication to that same Site. A GitHub push does not update the phone build.**
