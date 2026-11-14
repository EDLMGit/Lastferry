# Last Ferry review — victory mix

## Disposition

**Ready for listening review; physical phone approval pending.** The visible final-unload trigger is verified, arrival has more definition, and both dry music and reverb reduce at that event and stay reduced while won. Build/typecheck, 139 unit tests and six focused browser cases pass. Actual before/after runtime mixes are retained without playback/export normalization. Perceptual recognition on Android remains unverified.

## Source and scope

- Repository: https://github.com/EDLMGit/Lastferry · [draft PR #1](https://github.com/EDLMGit/Lastferry/pull/1) · branch `m1-first-crossing`.
- Clean starting HEAD and explicit reviewed comparison: `c5f4ae110973aa352d15028ba9d8c857a4270f6b`. No reset or newer-work overwrite.
- Current task: [NEXT_TASK_VICTORY.md](../../NEXT_TASK_VICTORY.md), found beside the checkout and retained here. It supersedes earlier arrival/gain freezes while preserving the accepted UI, wood and base composition.
- Final precommit 111-file source/test/instruction snapshot: **`663bfedd9f03d6063b0544cfb134e533e6b2ea0754200969755cde19e38aca9e`**, [manifest](source-manifest.json). Tests and after capture use this base plus identified working tree; the final GitHub SHA is reported separately in PR/handoff.
- Before runtime is an exact isolated Git archive of c5f4ae1, hash `e622af75a2dce1400b263978ee985087da2269b0f31e64930157f4058396c1db`. After runtime is `21c67c9892fee01b2009c011125bef14d7402cc99e4444e40f103e79b71b2de8`. Both stayed unchanged during recording.
- Of 44 runtime/dependency/data files, only `src/audio/arrival.ts` and `src/audio/atmosphere.ts` change. The other 42 match exactly, including wood, score/accompaniment content, main callbacks, interface, scene/water, sailing, rules, levels and package/lock. [Comparison and manifests](capture-comparison.json).
- Main remains `386de54d20fdd4a513a06115471d70bf94738cc0`. Keep PR #1 draft. No dependency or code comments added.

## Trigger diagnosis and sound choices

`World.tick()` still triggers once when final won unloading passes visual progress 0.72. `main.onArrival` calls `delivery()` and `settleArrangement()`. This path is unchanged; no success-dialog listener or earlier reducer-state trigger was introduced.

The baseline real UI session plays all three tested arrivals at ordinary, dense and phrase-return positions: three cues, nine voices, no skips/reclaims and no dropped score tones. The first final commit becomes won at AudioContext 19.4907 s with music still 0.72. Visible cue starts at 20.1227 s; old music automation only begins at 20.6107 s, then ramps to 0.62 over 0.8 s. That is about 1.3 dB after a 0.488 s delay. No missed cue was reproduced here; masking is plausible, but this does not diagnose every physical Android session.

The revised cue retains immediate opening, answer at 0.48 s, settlement at 1.10 s and complete 3.35 s duration. It uses the same warm waves and harmony-aware pitches/lifetimes, including the preceding pad release and 75 s return. Arrival-only peaks become 0.110/0.150/0.072, about +5.3/+5.7/+4.3 dB relative to the previous envelopes. Rounded attacks are 60/35/140 ms. Opening/answer filters start at 1600/2400 Hz and soften to 700 Hz; the tail retains 1050→650 Hz. Effects gain and accepted wooden contacts are unchanged. These are authored signal choices, not an audible-quality measurement.

One new music output receives dry score/accompaniment and the existing wet return, then connects to master. At visible settlement it fades to **0.5 over 200 ms**. The modifier is −6.02 dB; with authored won gain 0.62 versus ordinary 0.72, effective music is **0.31, about −7.32 dB**. This also attenuates an already-ringing wet tail. Master 0.65, effects 0.34, ambience 0.11 and ordinary music remain unchanged. Arrival stays dry and independently cancellable.

Settled-win intent outlives the one-shot voices and action cleanup. There is no timed restoration. Success dismissal and Menu retain the reduced mix. Authoritative nonwon reconciliation cancels/holds prior automation and restores the modifier and appropriate gameplay target over **700 ms**. Rapid redelivery targets 0.5 afresh without multiplying current gain. Mute/hide/context interruption cancel action voices while retaining intent; resume initializes the correct output under the silent master and never replays a queued cue. Finishing muted before graph creation and hidden presentation recovery settle quietly. Partial delivery/loss do not duck.

## Environment and commands

Windows; Node **24.15.0**, npm **11.12.1**; Chromium **156.0.8078.4**, Playwright **1.64.1**, headless SwiftShader. Runtime comparisons use **844×390, DPR 1, emulated touch**. Existing dependencies/browser cache were reused; no fresh-install claim.

```sh
npm ci
npm run dev
```

Production: `npm run build`, then `npm run preview`. Use `/?cove=holding-pier`; all coves remain in Menu. Isolated servers: frozen baseline 5198, development 5199, rebuilt production 4186.

Focused command: `npx playwright test tests/e2e/victory-mix.spec.ts tests/e2e/transfer-audio.spec.ts tests/e2e/production.spec.ts --config=.cache/victory-mix-playwright.config.ts`. Environment uses `PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright`, dev 5199, production 4186 and `LAST_FERRY_REVIEW_DIR=reviews/victory-mix/browser-initial`. The [retained external-server config](browser-initial/external-server-config.txt) disables automatic server ownership to avoid the previously observed Windows teardown stall; assertions and timeouts are preserved.

Before capture: `node tools/capture-victory-mix.mjs --base=http://127.0.0.1:5198 --root=.cache/victory-baseline-c5f4ae1 --revision=c5f4ae110973aa352d15028ba9d8c857a4270f6b --output=reviews/victory-mix/before`. After: the same helper with `--base=http://127.0.0.1:5199 --output=reviews/victory-mix/after`. It uses actual controls and read-only native gain/routing observation; no state injection or score-clock adjustment.

## Executed checks

| Check | Result and evidence |
| --- | --- |
| Production build / TypeScript | **Pass**. [Output](build-results.txt). Existing >500kB chunk advisory remains. |
| Unit suite | **139/139 pass**, 17 files. [Output](unit-results.txt). Eleven added cases cover dry/wet routing, independent effects, no early duck, persistence, cancellation/hold paths, rapid redelivery, lazy muted wins, hidden/context recovery, state restoration and partial/loss. Harmony-lifetime/return and unchanged water checks also pass. |
| Focused browser suite | **6/6 pass, exit 0**, 2.2 minutes. [Output](browser-initial/browser-results.txt), [results](browser-initial/automation-results.json), [compact observations](browser-initial/focused-summary.json). Includes actual rescue/partial delivery, tide Undo/replay, production launch and accepted transfer lifecycle. |
| Persistent ending | **Pass**. Early committed win retains modifier 1; visible arrival starts 0.5 ramp. At 10.0267 s after arrival, with success open, effective music remains 0.31. Dismissal/Menu at 11.16 s retains it; terminal Undo restores1×0.72, redelivery renews0.5×0.62, Next cove starts fresh. |
| Muted / background recovery | **Pass in stated coverage**. Finish-muted has zero contexts/voices, retains target 0.5; unmute creates one graph and settles 0.31 with no cue. Hidden-before-event settles silently; resume remains reduced. Hide during a real cue clears its tail; resume does not replay. Restart/choice reset normally. Visibility is simulated; OS context interruption is unit coverage. |
| Actual before/after mixes | **Pass for trigger/mix behavior**, three arrivals each with eleven-plus-second won holds. Each session: three cues/nine voices, zero skip/reclaim/drop, seven wood contacts. After output ramp begins at exactly the arrival timestamp; holds at 0.5×0.62; Undo/Next restore 1×0.72. [Comparison](capture-comparison.json). |
| Media / screenshots | **Pass**. All four videos decode through ffmpeg, exit0; [validation](media-validation.json). Four fresh start/success 844×390 screenshots inspected at native size. Unchanged broader UI coverage is reused from the cove-interface review by exact source. |
| Acoustic listening / physical Android | **Not run — unavailable here**. No speaker/headphone output was listened to. Full runtime audio is retained for the player. |
| Historical broad browser/performance campaign | **Not run**, outside this audio scope. No Safari/Firefox, native-device performance or new independent-review 3D claim. |

The independent UI baseline report's build/typecheck and 128-unit result is distinct from contributor browser evidence; its WebGL-disabled environment did not establish a 3D playthrough. This pass's actual contributor recordings and six browser cases are identified above. Earlier independent water timeout and isolated pass remain historical; water code and timeouts were not changed.

## Original failure and resolution

A review added a focused test after the initial 138-test pass. It reproduced a real rapid Undo/redelivery defect: arrangement identity could remain `won` while upstream target restored to 0.72, so redelivery before the next beat left effective music 0.36 rather than 0.31. [Original failure](development/rapid-redelivery-before-fix.txt), [source identity](development/rapid-redelivery-before-fix-source.json) and [patch](development/rapid-redelivery-before-fix.patch) are preserved. The eligible accompaniment pump now reasserts its guarded fixed gain target even when arrangement identity is unchanged. The new regression and final 139-suite pass; no cumulative reduction or stale restoration remains in the tested sequence.

## Runtime recordings and listening

Both runs retain the same runtime master/export level; no normalization, substitute soundtrack, edit cuts or playback gain is applied. They are separate takes, not sample-aligned. Each uninterrupted actual UI session includes the nine-action rescue, terminal Undo/redelivery at a dense pad and at the phrase return, and at least 11 s of won music after every cue. The silent whole-interface video also includes Next cove.

| Media | Before | After |
| --- | --- | --- |
| Actual canvas + runtime master audio | `before/raw/holding-runtime-audio.webm`, audio through 86.065 s | `after/raw/holding-runtime-audio.webm`, audio through 85.793 s |
| Whole-interface video, silent | `before/raw/holding-full-interface-silent.webm`, 95.20 s | `after/raw/holding-full-interface-silent.webm`, 93.72 s |
| Fresh gameplay screenshots | `before/phone-start.png`, `before/phone-success.png` | `after/phone-start.png`, `after/phone-success.png` |

Suggested listening starts in the actual-audio files: before **20.091 /46.939 /74.648 s**; after **20.669 /46.968 /74.589 s**. Keep playback volume unchanged, hear the cue against the score, then continue into the held ending. [Before summary](before/summary.json) and [after summary](after/summary.json) retain precise phase, routing, gains and file hashes. Raw media, graph traces and verbose original captures stay local/ignored, unavailable in a fresh clone. Selected PNGs and compact results are committed.

No confirmed trigger/routing/lifecycle defect remains in the exercised checks. Recognizability, calmness, cancellation feel and phone-speaker balance remain the Android/headphone listening judgment; gain ratios and counters do not establish perceptual approval.

## Deployment handoff

**Not deployed.** The existing private Site is https://last-ferry-playtest.abumech.chatgpt.site and, per the user's baseline, contains game commit **c5f4ae1**. The new victory fix is the separately reported final GitHub SHA. Pushing this branch does not update the Site. After review, publish that exact SHA through the existing Sites project to the same URL/audience for Android listening. No new Site or audience change was made. Keep PR #1 draft and main unchanged.
