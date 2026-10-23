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
| Reviewed game baseline | `c82ba896e690c82b731f63dc1fba0a6380ef61e1` |
| Private phone build | Same game commit, `c82ba89` — publication succeeded |
| Stable phone URL | https://last-ferry-playtest.abumech.chatgpt.site |
| Site source commit | `6b3e6e01b558b899c7ad3f6f9bed2daf1689837c` |
| Main | Unchanged by this workflow; no merge authorized |

The Site source SHA differs because it includes hosting metadata. The 130 tracked non-review GitHub files other than Vite configuration were compared byte-for-byte for this publication. The existing Vite preview-only `terminal.local` allowed-host entry and formatting are retained. Site identity and owner-private audience are unchanged.

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

## Current implementation: Harbor homecoming

Implementation brief: `NEXT_TASK_HOMECOMING.md`.

Deliver in this pass:

1. A visibly sweeping amber lighthouse light, approximately one turn per 20 seconds while won; static under reduced motion.
2. One brief animal acknowledgment after disembarkation, with canonical transforms restored afterward.
3. A modest Harbor camera push-in where it fits; clamp or omit on short phone layouts. Restore normal framing before gameplay resumes.
4. A compact ending with the real Next cove/Choose a cove action, Settings, Undo, Restart and Close.
5. Shared Settings for Sound and Motion: Follow device / Reduced, with correct persistence, focus and lifecycle.

**Implemented and verified locally; awaiting independent review and publication.** Final source hash `96c878bfee197ea3b08675119a99da15cf34ebeba356683dad4c496e59fde4d4` (118 files); evidence from reviewed HEAD plus the retained working-tree change. See `reviews/homecoming/REVIEW.md` and the final PR handoff for the committed GitHub identity, distinct from the live game. The private Site still runs `c82ba89`.

Observed behavior: one 20-second sweep; one finite post-disembarkation gesture; 9% Harbor push at desktop and 390px landscape heights, normal framing at 780×320; static normal framing under Reduced. Settings shares existing Sound and persists Follow device / Reduced. Back/Escape returns to the origin; Menu can reopen arrival without replay. Accepted audio files, all puzzles, tide/action order, complete Undo, water and sailing timing remain unchanged.

Fresh gates: build/typecheck, **153/153 unit tests**, **14 distinct focused browser cases** pass, with three affected cases rerun after strengthening checks/final rebuilding. All three actual UI rescues, three phone sizes, normal/reduced preferences, subsets, tide/terminal Undo, camera/picking restore, Settings, simulated hide/context recovery and accepted audio regressions are covered. Native images and uninterrupted local actual-audio capture retained; original failures/inconclusive source-reload run are preserved. No confirmed blocker within this coverage. Human Android perception is not yet approved.

## Queue and scope boundaries

- Further playtest feedback will arrive incrementally. Add it here with a brief status and concrete intent; do not implement it automatically during the active task.
- Lighthouse/celebration/zoom/animal/settings implementation is completed for review above; perceptual approval is pending. Additional ideas remain queued.
- More authored coves and increasing difficulty remain a later product direction. The active pass adds no puzzle or mechanic.
- Broader environment/art changes and further audio changes require a later active task or new user feedback.
- Extra volume sliders, graphics presets, rewards, accounts and progression systems are not requested deliverables.
- Unseen “more queued” ideas have not been specified. Do not invent their content.

For new feedback, use: **idea → accepted/current task, queued, or superseded**, plus a brief reason. Move completed items out of the active list only when the handoff/evidence supports completion; distinguish implementation completion from the user's later perceptual approval.

## Verification baseline and remaining limits

For `c82ba89`:

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
