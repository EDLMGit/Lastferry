# Last Ferry review — illustrated story production

## Disposition

**Implementation and focused verification complete; ready for ChatGPT review.** The actual journey uses the approved opening painter and a new Harbor shot. This record separates automated success, native visual inspection and actual runtime evidence from human visual/listening approval and physical-device testing. No Site publication is part of this task.

## Source and scope

- Repository: https://github.com/EDLMGit/Lastferry; branch `m1-first-crossing`; existing draft PR https://github.com/EDLMGit/Lastferry/pull/1.
- Reviewed baseline and starting HEAD: `6fc5a09dd4ef876ad96ad12d623532f0d13deb10`, selected explicitly by the user. Initial tracked tree was clean; the supplied `LAST_FERRY_STORY_PRODUCTION_PACKAGE/` was untracked. No newer tracked work was reset.
- Exact task: `LAST_FERRY_STORY_PRODUCTION_PACKAGE/NEXT_TASK_STORY_PRODUCTION.md`, task `STORY_PRODUCTION_01`. Exact reference: `LAST_FERRY_STORY_PRODUCTION_PACKAGE/reference/approved-opening.html`.
- Implementation commit and final packaging identity are recorded at handoff and in `packaging-audit.json`. Evidence was captured from the baseline plus explicitly hashed working-tree changes, not from the later commit. `evidence-reuse-audit.json` identifies the bounded post-capture changes and their focused checks.
- Package/source provenance: [supplied-inputs.json](supplied-inputs.json). All supplied payload hashes match the package manifest. Its publication receipt is byte-identical to both the working receipt and baseline Git content, SHA-256 `4ae676bb0ebc024f1c01209b527bfec549a368fd13ce81124cdb8eb0f803b4c4`.
- Scope: three illustrated opening shots, one Harbor shot, shared finite player, finite effects through the existing Sound owner, optional narration slots/script, actual journey integration and focused verification. No new cove, animal, rule, hull, score, mid-puzzle save or deployment.

## What changed

The actual root journey now uses the supplied original Canvas2D Tide/Lantern/Ferry artwork, with finite 6 / 6 / 7-second motion and held player-paced endpoints. Rue stays tan on the left; Pip stays cream on the right. The exact caption groups appear together after a 1,050ms visual lead and brief fade. Next is immediately available and changes presentation only. Take the helm alone acknowledges `opening` and enters the original Holding state.

The same variable-length player presents a new five-second Harbor gathering: Rue places her lantern on the safe high landing, Pip turns toward the empty ferry, Moss settles nearby, and a small distant light suggests Bellwater. Continue to Bellwater alone acknowledges `another-bell`. It does not reboard the rescued group, change Bellwater's residents or replay victory.

Skip/Escape settle the final shot and complete recap without acknowledgment. Replay is explicit. Read story exposes all copy immediately; it and Settings settle only the current shot, with return focus to the trigger. Reduced Motion gives readable still shots. Restore uses the final static pending scene. The presentation does not save per-shot position, simulate puzzle actions or replace the checkpoint schema. Accepted puzzle data, independent practice and complete in-session Undo remain protected.

The existing persistent Sound owner adds finite tide wash, lantern contact and hull-water effects with separate run-token cancellation and consumed-cue/no-backlog behavior. It retains the accepted score, gameplay transfer/travel/arrival APIs and persistent won-state mix reduction. **Story effects integrated; narration script and asset slots prepared; voice recordings not yet supplied.** No live TTS, substitute voice, unavailable voice toggle or voice-service dependency is introduced. Human listening approval remains pending.

The covered gameplay World keeps its state and canvas but suspends its frame loop. One finite illustration clock advances the story and stops at a held endpoint, reading/Settings, hide or exit; gameplay rendering resumes at handoff. A reproduced native Escape cancellation defect was corrected in the story-owned dialog layer. Short-landscape Skip/restore recap now has a quiet teal backing so its complete text remains readable over the final ferry illustration; ordinary reference captions are unchanged.

## Environment and local play

The implementation uses Windows, Node 24.15.0, npm 11.12.1 and repository Playwright Chromium. Emulated phone viewports and software rendering are not physical Android/native-GPU evidence. Detailed browser/capture versions and source snapshots belong to the executed evidence manifests.

```sh
npm ci
npm run dev -- --port 5270 --strictPort
```

Open **http://127.0.0.1:5270/** without `?cove=` for the journey. Explicit cove links intentionally bypass campaign story and remain independent practice/review entrances.

## Executed checks

| Check | Current result | Evidence / boundary |
| --- | --- | --- |
| Supplied package and receipt identity | Pass | All declared payloads match; receipt is byte-exact to baseline and working tree in `supplied-inputs.json`. |
| Approved reference inspection | Pass for stated reference coverage | All three finite actions/endpoints opened and inspected natively at 390×844 and 780×320; `reference/inspection.json`. Reference captures are not gameplay evidence. |
| Opening painter preservation | Pass | 27 comparisons: three shots × beginning/midpoint/endpoint × matched portrait/short-landscape/desktop drawing sizes; zero differing RGBA channels in `reference/painter-parity.json`. |
| New Harbor and actual phone artwork | Inspected; human approval pending | All 24 detailed 390×844 / 780×320 beginning/intermediate/endpoint frames inspected natively; additional 320×740 / 844×390 / 1440×900 fit coverage and final recaps. |
| Production build / standalone TypeScript | Passed | Final `gates/build-final-corrections.txt` and `gates/typecheck-final-corrections.txt`. The existing >500kB bundle advisory remains. |
| Unit suite | 297/297 passed, 33 files | `gates/unit-final.txt`, 10.36s. Covers controller/progression, 60 audio checks including 17 added story cases, rules and unchanged puzzles. Later main input guards, recap CSS and narrow Harbor bound have focused browser/visual checks; unchanged unit dependencies justify reuse. |
| Asset validation | Passed, 75 families | All 73 prior IDs preserved; final `gates/assets-final.txt` and `catalog-change.json`. |
| Focused browser cases | Seven distinct cases passed across retained runs | Original complete dev3: **4 passed / 2 failed**. Affected follow-up: **3/3 passed**. Recap follow-up: **2/2 passed**. Final input/narrow-Harbor corrections: **3/3 passed**. These are not a fresh single-run seven-of-seven claim. See [BROWSER_CHECKS.md](BROWSER_CHECKS.md). |
| Actual rescues / Undo | Passed through real controls | Opening → canonical Holding → nine-action rescue, tide Undo and terminal Undo/redelivery → explicit Harbor → Bellwater ten-action rescue → ending. No gameplay-state injection in the uninterrupted sequence. |
| Audio/video decoding | Passed | Entire 89.863s recording decodes; 546 native frames, actual master audio, no gain changes. Four story cue events observed. No human listening approval claimed. |

The browser cases also cover immediate Next/final actions, Skip without acknowledgment, Replay, full transcript, normal keyboard navigation, touch, Reduced Motion, background settlement, pending restore, practice isolation, cold gesture-required audio, mute and late pending-resume rejection, and actual native app-root fullscreen entry/exit. Production entry has no DEV hook, prototype wrapper, iframe or unavailable narration UI. The constrained pending-resume and visibility fixtures are labelled simulations, not physical Android reproductions.

## Evidence and assets

- [Reference inspection and original failures](reference/README.md), including six native design-reference frames. These do not count as actual-game captures.
- `development/harbor-390x350-*.png` and `development/harbor-780x230-*.png` are standalone drawing fixtures. They are explicitly not journey evidence.
- [Uninterrupted actual journey with runtime audio](dev3/actual-journey.mp4): 844×390, 89.863072s, 4,177,937 bytes, SHA-256 `91bfb91882bb12b9736f04c9341fca95fa4e22a37954a16d8b80927d7f72fb21`. Native timestamps preserved; only 40.122ms of preceding audio trimmed for alignment. No internal cuts, normalization, boost or replacement sound. Peak −19.7dBFS is measured, not perceptual approval.
- Native detailed inspection clips: [390×844 portrait](dev3/390x844-scene-inspection-silent.mp4), [780×320 landscape](dev3/780x320-scene-inspection-silent.mp4). These are silent, full natural-speed inspection recordings; their later Harbor replay uses a valid pending checkpoint fixture. The audible sequence separately earns Harbor through real play.
- Representative actual frames: [portrait tide beginning](dev3/390x844-shot-0-begin.png), [portrait lantern intermediate](dev3/390x844-shot-1-intermediate.png), [portrait ferry endpoint](dev3/390x844-shot-2-end.png), [portrait Harbor endpoint](dev3/390x844-harbor-end.png), [short-landscape lantern](dev3/780x320-shot-1-intermediate.png), [short-landscape Harbor](dev3/780x320-harbor-end.png), [readable recap](final-checks/780x320-skip-recap.png), [corrected narrow Harbor](harbor-fit/320x740-harbor-after.png). The remaining native beginning/intermediate/end frames and geometry are under `dev3/`. Its original 320px Harbor crop is superseded, retained as the discovered failure.
- `dev3/temporal-summary.json` records caption fade beginning at 1058–1066ms and full visibility at 1292–1299ms, finite 6000/6000/7000/5000ms actions and all four cues. Held World/illustration counts stay fixed. One Lantern capture interval reaches 679.9ms near its endpoint; other per-shot maxima are below 21ms. This software-rendered recording does not prove uniformly smooth native-phone performance.
- Canonical inventory preserves all 73 previous IDs, updates `ui.story-presentation`, and adds only `story.illustrations` and `audio.story-effects` for 75 families. The gallery identifies its specimens as design/development views, not gameplay proof. Narration is pending text/slots, not a claimed recorded-audio family.
- Original supplied fragment: SHA-256 `ff437f9e70675c8b532f2f774e9b9c766eb30e2cf9da73072d5b7e872fd22ce1`. The port's actual hash is recorded in the parity report. Future canonical scenes remain unchanged in [storyboard-scope-audit.json](storyboard-scope-audit.json).

## Original failures and corrections

1. The first reference harness looked for Play story in the wrapper document and timed out. The supplied inspection wrapper contains an iframe; corrected reference-only targeting found its real controls. Production does not ship an iframe.
2. The first pure-drawing parity import encountered the supplied wrapper's restrictive document. A local empty drawing fixture allowed the same direct comparison; no reference source was changed.
3. Initial Harbor portrait art let the pier cover the ferry bow. `development/original/harbor-portrait-ferry-occlusion.png` retains it. The ferry was moved left with width-bounded scale, then inspected again; the empty deck and bow remain visible.
4. Early controller/registry checks retained in `gates/story-original.txt` report six failures against the obsolete single-duration/old-caption contract. Corrected checks must assert the new authored shot contracts and unchanged progression ownership, not weaken unrelated requirements.
5. In-flight gallery integration produced TypeScript syntax errors retained in `gates/typecheck-development.txt`. Subsequent checks/results must remain distinguishable from that original failure.
6. The first whole-unit log `gates/unit-original.txt` records 296 passes and one asset-validation failure because this new review file had not yet been created while inventory integration was running. The file now exists and `npm run check:assets` validates all 75 families; keep the original unit log intact and record the full-suite rerun separately.

7. `dev1` source-manifest collection assumed optional `public/` existed and failed before browser execution. Existence is now checked; its original context/interrupted teardown is retained.
8. `dev2` geometry passed, but independent temporal inspection found the portrait Tide already settled in its purported beginning capture after covered WebGL startup work stalled it. Original files remain labelled invalid as movement proof. Covered World suspension plus a separate finite story clock fixes the demonstrated cause; stricter beginning/midpoint guards and complete observed actions pass in dev3.
9. `dev3` native navigation failed when a second Escape from Settings emitted a noncancelable native dialog cancellation. Original screenshots and diagnostics remain. Handling Escape on the story-owned layer keeps the dialog open with trigger focus; the focused follow-ups pass.
10. `dev3` pending-audio fixture expected a skipped cue, but the native context state-change had already invalidated the token: the actual event was safely rejected. The corrected meaningful assertion requires an attempted cue, zero playback and no late source after mute/resume. Follow-up observes rejected 1, skipped 0, played 0; no audio implementation fix was needed.
11. Native final review found short-landscape recap text crossing the ferry with mixed contrast. The original `follow-up/780x320-skip-recap.png` is retained. A recap-only teal backing keeps its dimensions and essential text size; final `follow-up-recap` fit/focus/fullscreen checks pass.
12. Independent final review found double-clicking Next from Lantern could advance to Ferry and then acknowledge the opening without a fresh deliberate final action. `harbor-fit/next-boundary-review.json` retains the original observation and corrected replay. The native repeated-click and held-Enter/Space guard imposes no minimum wait; strengthened keyboard/pointer checks preserve the pending scene until a fresh final activation. The precise inherited touch-timing limit remains open.
13. Native 320×740 Harbor inspection found Moss's muzzle clipped beyond the canvas, despite text/DOM bounds passing. The new Harbor-only bound applies below a 360px canvas width. Native before/after evidence and 20 zero-difference comparisons at unaffected sizes are under `harbor-fit/`; the final narrow view is freshly checked. All 27 opening parity comparisons still match. Wider captured scenes remain applicable.

## Remaining limits and next action

The production port, new Harbor art and actual runtime mix need human review. Narration recordings are absent; voice production and approval are later work. Physical Android layout/touch/fullscreen rotation/speakers, native-GPU performance, other engines and screen-reader listening remain unverified unless fresh evidence explicitly records them.

Preserve inherited constrained card/dock overlap (including Bellwater East Buoy at 780×320 with the existing Play-view/pan workaround), delivered-heading discontinuity, and the precise ≤180ms rapid-touch verification limit. A normal touch sequence or software-renderer pass does not close those issues. Adding a third cove later requires an explicit migration for completed two-cove saves; no speculative save change is included.

The next action is ChatGPT review of this identifiable implementation and human review of the new Harbor drawing, pacing and runtime mix. PR #1 stays draft; main stays `386de54d20fdd4a513a06115471d70bf94738cc0`. The last confirmed owner-private Site remains **version 12**, game `1a85874883af5caa59f6294a75495eccf2afebbc`, hosting `e87c5c5baa53a39001c5a89b07b59aab2ad150fc`, published 25 October 2026 at 17:28:58 Europe/Madrid. This is preserved supplied receipt evidence, not a fresh live-site audit or new publication. A push does not update that Site.
