# Last Ferry — Project state

Updated: 2026-10-23. This is the compact continuity record for the current project, not a claim that every device or future release requirement has been verified.

Read this before choosing scope. Detailed implementation history belongs in `STATUS.md`; evidence belongs under `reviews/`. Update this record after each handoff and after a confirmed deployment. User feedback can revise an accepted decision.

## Product and working relationship

Last Ferry is a finite, authored coastal puzzle story: a small ferry brings animals home before rising water closes their rescue window. Think slowly, see the consequences, and enjoy a beautiful miniature world. One worthwhile playthrough is a valid product.

Android phone landscape is the primary playtest target, with desktop, touch and keyboard support. The user is the current human playtester. Do not require recruiting additional testers to continue these passes.

Local Codex implements the current task. ChatGPT reviews the identifiable handoff, sets the next contained task and publishes reviewed builds to the existing private Site. There is no automatic review or deployment triggered by a GitHub push.

## Source and live version

| Item | Current confirmed value |
| --- | --- |
| Repository | https://github.com/EDLMGit/Lastferry |
| Working branch | `m1-first-crossing` |
| PR | https://github.com/EDLMGit/Lastferry/pull/1 — draft |
| Homecoming implementation | `d3a7e3acfa2298bcaaa8e93622e81d62b367280e` — locally verified; final packaging SHA in PR handoff |
| Lighthouse implementation | `040df0d6d2b8e094446b2bc3dc8ff3b78837fc78` — verified; awaiting review/publication; final metadata SHA in PR handoff |
| Reviewed game baseline | `dafb445b8d769ff92b4390d06bf3ca92bbbe8b8b` |
| Private phone build | `dafb445b8d769ff92b4390d06bf3ca92bbbe8b8b` — publication confirmed 2026-10-23 |
| Stable phone URL | https://last-ferry-playtest.abumech.chatgpt.site |
| Site source commit | `049c7998a8bd8afbd2e42c414c80ea0bad7d7e8d` |
| Main | Unchanged by this workflow; no merge authorized |

The Site source SHA differs because it includes hosting metadata. The lighthouse task carries the confirmed publication handoff for the reviewed homecoming build. The existing Site identity, stable URL and owner-private audience are unchanged. A new implementation SHA below is separate from that live game.

After the next implementation, record the new GitHub SHA separately from the live Site's game SHA. Do not update the live field until deployment is confirmed.

## Accepted direction and protected behavior

| Area | Decision to carry forward |
| --- | --- |
| Puzzles | Holding Pier is the default training cove. Holding Pier → Bellwater is implemented progression. First Crossing remains an optional baseline. All three remain playable. |
| Rules | Deterministic action-based time, load/draft and passage-depth consequences, tide deadlines, subset transfers, passenger conservation and complete Undo. Inspection is free; explicit confirmation spends an action. |
| Interface | Full-width cove, freestanding place names and selectable markers, local dock controls, compact dark teal translucent surfaces, ivory text and warm borders. The permanent right sidebar and white panels were rejected. |
| Environment | Rounded shared sailing courses, calmer crossing pace, luminous water, visible shallow ground, tide-aware contact, readable landmarks and Harbor identity. |
| Music | Original continuous 75-second score with restrained adaptive accompaniment. The user accepts the current sound for now. Do not reopen composition or mixing in the active visual pass. |
| Transfers | Fuller wooden contacts follow the visual transfer timeline, with bounded voices and cancellation. Preserve accepted timing. |
| Victory audio | One cue at visible arrival; persistent reduction of both dry music and reverb while won, about 7.32 dB below ordinary settled music. 200 ms duck and 700 ms restoration when leaving won. Menus do not end the reduction. |
| Style | Calm, warm resolution and a crafted coastal miniature. Responsive controls and phone readability take priority over decorative complexity. |
| Verification | Match claims and evidence to the actual source. Separate source review, executed checks, captured visuals, listening and physical-device testing. |

These are the current accepted baselines, not permanent prohibitions on future user-directed changes.

## Accepted baseline: Harbor homecoming

Implementation brief: `NEXT_TASK_HOMECOMING.md`.

Deliver in this pass:

1. A visibly sweeping amber lighthouse light, approximately one turn per 20 seconds while won; static under reduced motion.
2. One brief animal acknowledgment after disembarkation, with canonical transforms restored afterward.
3. A modest Harbor camera push-in where it fits; clamp or omit on short phone layouts. Restore normal framing before gameplay resumes.
4. A compact ending with the real Next cove/Choose a cove action, Settings, Undo, Restart and Close.
5. Shared Settings for Sound and Motion: Follow device / Reduced, with correct persistence, focus and lifecycle.

**Accepted overall, independently reviewed and published as `dafb445`. Lighthouse beam appearance remains the focused refinement below.** Final source hash `96c878bfee197ea3b08675119a99da15cf34ebeba356683dad4c496e59fde4d4` (118 files); evidence from reviewed HEAD plus the retained working-tree change. See `reviews/homecoming/REVIEW.md` and the final PR handoff for the committed GitHub identity, distinct from the live game. The private Site now runs the reviewed homecoming build `dafb445`.

Observed behavior: one 20-second sweep; one finite post-disembarkation gesture; 9% Harbor push at desktop and 390px landscape heights, normal framing at 780×320; static normal framing under Reduced. Settings shares existing Sound and persists Follow device / Reduced. Back/Escape returns to the origin; Menu can reopen arrival without replay. Accepted audio files, all puzzles, tide/action order, complete Undo, water and sailing timing remain unchanged.

Fresh gates: build/typecheck, **153/153 unit tests**, **14 distinct focused browser cases** pass, with three affected cases rerun after strengthening checks/final rebuilding. All three actual UI rescues, three phone sizes, normal/reduced preferences, subsets, tide/terminal Undo, camera/picking restore, Settings, simulated hide/context recovery and accepted audio regressions are covered. Native images and uninterrupted local actual-audio capture retained; original failures/inconclusive source-reload run are preserved. No confirmed blocker within this coverage. The reviewer independently reran build/typecheck and 153/153 unit tests and inspected committed captures; contributor browser results remain contributor results. No new independent WebGL or physical-phone result is claimed.

## Active task: Lighthouse light refinement

`NEXT_TASK_LIGHTHOUSE.md` is the only active implementation task. Refine the won-state cone proxy using soft view-facing silhouette attenuation appropriate to the orthographic camera, smooth distance falloff, restrained light blending and the existing lantern glow. Compare matched actual-game angles and a full natural rotation at native phone size. Preserve all accepted homecoming timing, audio, camera, Settings, water, puzzles and Undo. No new lighting framework, water pass, bloom or gameplay belongs here.

**Implementation and focused verification complete; awaiting visual review and publication.** Started clean at reviewed `dafb445b8d769ff92b4390d06bf3ca92bbbe8b8b`. Retained the clean `.22` cone treatment after native-phone comparison rejected the too-faint `.16` trial. Continuous view-space normals supply orthographic silhouette fading; smooth distance falloff dissolves before the rim; restrained additive front/back contributions and the existing additive won-state source glow replace the flat wedge appearance. Ordinary glow blending resets unchanged. No extra shell, texture, noise, water pass or global exposure change. Accepted timing and all protected behavior remain.

Fresh Node24 build/typecheck, **156/156 unit tests** and **12/12 focused browser cases** pass. Actual Holding UI rescue includes subset/tide Undo, visible arrival, Settings/Back, menu return, Reduced/Follow device, terminal Undo/redelivery and bounded warm resources. First Crossing and Bellwater UI rescues pass. Four native viewports inspected:1440×900,844×390,780×390,780×320. Sixteen matched before/after pairs share exact state/camera/angle. Full natural phone rotation takes20.169s; desktop dual recording takes39.859s under SwiftShader and its unchanged delta clamp. No native-GPU performance claim. Raw uninterrupted whole-interface video and paired canvas/runtime audio remain local/ignored.

Evidence: `reviews/lighthouse-light/REVIEW.md`, comparison index and source/capture/packaging manifests. Tested121-file source hash `a858591704abb3adb2a78f4dae6d8f9facffef459d35caa00528306e840f81d9`; final runtime capture hash `d943620659412c6af9a5254cb69c7277da9cded6641eaebf4ed5a4031c717d5b`. Captures identify baseline HEAD plus working changes, not a future commit. Final implementation/Git identity is recorded in the packaging audit and handoff. PR#1 remains draft; main and the private Site remain unchanged. Physical Android, other engines, native GPU and acoustic listening are still unverified. Further ideas stay queued.

## Queue and scope boundaries

- Further playtest feedback will arrive incrementally. Add it here with a brief status and concrete intent; do not implement it automatically during the active task.
- Homecoming is accepted overall. The light appearance is assigned to the active refinement only; additional ideas remain queued.
- More authored coves and increasing difficulty remain a later product direction. The active pass adds no puzzle or mechanic.
- Broader environment/art changes and further audio changes require a later active task or new user feedback.
- Extra volume sliders, graphics presets, rewards, accounts and progression systems are not requested deliverables.
- Unseen “more queued” ideas have not been specified. Do not invent their content.

For new feedback, use: **idea → accepted/current task, queued, or superseded**, plus a brief reason. Move completed items out of the active list only when the handoff/evidence supports completion; distinguish implementation completion from the user's later perceptual approval.

## Verification baseline and remaining limits

Historical audio publication checks for `c82ba89` (accepted homecoming and current lighthouse gates are recorded above):

- Contributor reported build/typecheck, 139 unit tests and six focused browser checks passing. The report records original failures and their fixes: `reviews/victory-mix/REVIEW.md`.
- Independent review found no blocking defect in the two changed runtime audio files and checked the visible-arrival, persistent duck, rapid Undo/redelivery and lazy/mute/hide lifecycle.
- A fresh independent Node 24 production build/typecheck and **139/139 unit tests passed** in the deployment checkout.
- The review environment's browser cannot create the required WebGL context, so no fresh independent in-browser playthrough or audio listening is claimed for this publication.
- User feedback accepts the sound for now. This is not a claim of physical Android approval.

Carry these limits honestly:

| Open check/issue | Next useful evidence |
| --- | --- |
| Physical Android touch, layout, speaker sound and sustained performance | User plays the exact live build on their phone; record model/browser and a concrete symptom if one appears. |
| New homecoming perception on Android | Local normal/reduced UI, cancellation and Settings checks pass; user judges the exact reviewed publication on the physical phone. |
| Existing software-renderer frame-tail regressions | Retain the known limitation; investigate a new regression if demonstrated. Do not claim hardware performance from emulation. |
| Bundle-size advisory | Still present; not itself evidence of broken play. Revisit against measured loading needs. |
| Other browser engines | Still unverified; assess before broader release rather than claiming universal support. |
| Raw runtime audio/video access | Recordings are local/ignored unless explicitly uploaded. A Windows path is not a reviewable web attachment. |

## Definition of ready for the next review

- The current task works in the actual game and has no confirmed blocker within exercised coverage.
- Build/typecheck, unit tests and the relevant focused browser/UI checks pass or identify a specific remaining gap.
- Phone-sized controls and composition are inspected; animation claims include moving evidence.
- Undo, cancellation, reduced motion, settings focus and accepted audio remain coherent.
- The final SHA, test/evidence identity and remote state are recorded accurately.
- The PR remains draft; main remains unchanged.
- The handoff states whether the live Site was updated. Deployment waits for review of that new build, not an assumed push-to-publish link.

Before a wider release, revisit the remaining device, accessibility, performance and browser coverage against the intended audience. This playtest workflow does not by itself certify release readiness.
