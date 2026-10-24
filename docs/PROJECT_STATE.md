# Last Ferry — Project state

Updated: 2026-10-24. This is the compact continuity record for the current project, not a claim that every device or future release requirement has been verified.

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
| Lighthouse implementation | `040df0d6d2b8e094446b2bc3dc8ff3b78837fc78` — accepted; final reviewed packaging commit below |
| Previous water-motion pass | `8b874adccfc1d65af569b81fade548f0368645b0` — functionally verified, **not visually accepted**; corrected by the current task |
| Sailing direction/released-crests implementation | `7877c9d094e3ce66f8197df6c203b0c748603488` — published as game `80545cbabb0496b215cd56f25cfc0113b056da67`; GitHub continuity commits are separate. |
| Reviewed game baseline | `80545cbabb0496b215cd56f25cfc0113b056da67` |
| Private phone build | `80545cbabb0496b215cd56f25cfc0113b056da67` — Sites version8, publication confirmed 2026-10-24 |
| Stable phone URL | https://last-ferry-playtest.abumech.chatgpt.site |
| Site source commit | `382b2d358ddf9fb1cac6cebb7905ae9f25f9fdc6` |
| Main | Unchanged by this workflow; no merge authorized |

The Site source SHA differs because it includes hosting metadata and the existing preview-only terminal.local allowed-host setting. Native Sites status confirms version8 succeeded; its source identifies game80545cb. Runtime, data, dependencies and build inputs match, apart from that preview-only Vite entry and formatting. The existing Site identity, stable URL and owner-private audience are unchanged. See reviews/sailing-direction-wake/deployment-confirmation.json. This confirmation reused the already successful deployment and did not create a duplicate release.

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

## Accepted baseline: Lighthouse light refinement

`NEXT_TASK_LIGHTHOUSE.md` is completed and accepted. The won-state cone proxy uses soft view-facing silhouette attenuation appropriate to the orthographic camera, smooth distance falloff, restrained light blending and the existing lantern glow. Its matched actual-game angles and full natural rotation remain documented. Preserve this result alongside homecoming, audio, camera, Settings, puzzles and Undo.

**Accepted and published as `0ee7d685071179b82ec2a599fac2f818251d0e54` on 2026-10-23.** Started clean at reviewed `dafb445b8d769ff92b4390d06bf3ca92bbbe8b8b`. Retained the clean `.22` cone treatment after native-phone comparison rejected the too-faint `.16` trial. Continuous view-space normals supply orthographic silhouette fading; smooth distance falloff dissolves before the rim; restrained additive front/back contributions and the existing additive won-state source glow replace the flat wedge appearance. Ordinary glow blending resets unchanged. No extra shell, texture, noise, water pass or global exposure change. Accepted timing and all protected behavior remain.

Fresh Node24 build/typecheck, **156/156 unit tests** and **12/12 focused browser cases** pass. Actual Holding UI rescue includes subset/tide Undo, visible arrival, Settings/Back, menu return, Reduced/Follow device, terminal Undo/redelivery and bounded warm resources. First Crossing and Bellwater UI rescues pass. Four native viewports inspected:1440×900,844×390,780×390,780×320. Sixteen matched before/after pairs share exact state/camera/angle. Full natural phone rotation takes20.169s; desktop dual recording takes39.859s under SwiftShader and its unchanged delta clamp. No native-GPU performance claim. Raw uninterrupted whole-interface video and paired canvas/runtime audio remain local/ignored.

Evidence: `reviews/lighthouse-light/REVIEW.md`, comparison index and source/capture/packaging manifests. Tested121-file source hash `a858591704abb3adb2a78f4dae6d8f9facffef459d35caa00528306e840f81d9`; final runtime capture hash `d943620659412c6af9a5254cb69c7277da9cded6641eaebf4ed5a4031c717d5b`. Captures identify baseline HEAD plus working changes, not a future commit. Final implementation/Git identity is recorded in the packaging audit and handoff. PR#1 remains draft; main and the private Site remain unchanged. Physical Android, other engines, native GPU and acoustic listening are still unverified. Further ideas stay queued.

The water-motion task confirms independent production build/typecheck and **156/156 unit tests** passing for the published lighthouse build. Contributor browser results and committed images were audited; no physical Android/native-GPU approval is implied.

## Historical pass: Boat wake and water response — correction required

`NEXT_TASK_WATER_MOTION.md` is completed historical context. The user did not accept its universal stopping heading or hull-following accents. The following verification record establishes functional coverage, not visual acceptance. Its calmer sailing timing and bounded allocation approach carry into the correction; the bow crescent, stern ellipse and paired crest bands do not.

Started clean on `m1-first-crossing` at reviewed `0ee7d685071179b82ec2a599fac2f818251d0e54`; no newer or unrelated work. Baseline phone recordings precede renderer changes. Retain a single preallocated wake/contact mesh with broken pearl crests, teal disturbance, distance-resampled world history (96points/1800ms/3.6units), small hull-anchored bow/stern contact and a finite normal-dock fade without extending the busy lock. New moves separate segments; discontinuity/Undo/Restart/cove/hide/recovery/Reduced clear transients. Water height moves existing geometry without false emission.

Actual short/long phone comparison chose clamp(1000+200×canonical length,1600,3000)ms:1874/2823ms representative plans, compared with1412/2076ms. Easing, rules/routes,30ms Reduced, transfers/final unloading, tide phase and recovery policy remain. The local water-normal experiment was rejected after native on/off comparison found no consistent benefit; the accepted water shader/fields/Harbor reflection remain byte-exact. Lighthouse and all accepted audio behavior remain.

**Implementation and focused verification complete; awaiting ChatGPT review/publication.** Build/typecheck and163/163unit checks pass.18 distinct focused browser cases pass via17passes in the full run and1/1affected rerun after correcting the new First Crossing test fixture; the original failure and earlier inconclusive assertion-heavy run are preserved. Test-only edits retain full-value coverage and identical runtime/build/unit inputs, with fresh TypeScript checks. All final natural844/780/1440crossing captures pass and preserve source;81native ordered frames and780×320ending/Settings confirm exercised presentation.15named originals decode and remain local/ignored. The matched low-overhead performance repeat shows equal33.4ms median/50.1ms p95 with unchanged draw/resources; no Android performance claim.

Final127-file hash `e84792307ccda2b3efea3b70f7846331a6c3cec9d6afce4cc0bccdca48d52804`; runtime `be1d42f21ba0b4f45687fda21c1db730254e5f68dfc7a0ccd7eba16956a8c62b`. See `reviews/water-motion/REVIEW.md`, source/capture/packaging audits and final handoff for committed Git identity. No confirmed blocker in exercised coverage. Physical Android/native GPU/other engines/listening remain unverified. PR#1 remains draft and main unchanged. The private Site still runs0ee7d685; this pass is not published. New ideas remain queued.

## Published correction: Sailing direction and released water crests

`NEXT_TASK_SAILING_DIRECTION_AND_WAKE.md` is the only active implementation scope. Started clean on `m1-first-crossing` at `8b874adccfc1d65af569b81fade548f0368645b0`. Preserve the current sailing budget, accepted puzzles, UI, audio, water palette/shader and lighthouse/homecoming. The previous pass remains unpublished.

The correction replaces universal endpoint alignment with an accepted-transaction presentation pose history. Free-water stops retain their incoming tangent; actual piers choose the closer safe broadside berth. A deterministic shortest-angle departure and required berth alignment stay within the existing movement budget. Undo restores the paired pre-action heading; all completion/recovery paths use the same precomputed target. Local mirrored deck entries support both berth headings without changing transfer/audio timing.

The water treatment uses a fixed pool of independently released open crests. Release data, age and stable variation determine their later world-space evolution; later hull movement cannot drag them. Finite tails finish after controls unlock, with no live ellipse, bow outline or peak-strength docking restart. Fresh Node24 build/typecheck,173/173unit tests and23 distinct browser cases pass (20 together,3 through preserved affected reruns). Native phone comparisons retain fewer broader soft crests; four animated excerpts and selected native frames are accessible in Git. Six final full-interface recordings and15 validated originals remain local/ignored. Source/runtime identity, original failures and exact results are in `reviews/sailing-direction-wake/REVIEW.md`. The warmed comparison retains equal active p95/resource counts; two instrumented desktop Bellwater gaps clear transients, while final phone runs have no gap above300ms. Physical Android/native GPU and new listening remain unverified. Implementation is complete. The existing private Site publishes game `80545cbabb0496b215cd56f25cfc0113b056da67` as version8; its successful deployment and source identity were confirmed on2026-10-24. Phone playtesting can use the stable URL. Remaining physical-device limitations still apply.

## Queue and scope boundaries

- Further playtest feedback will arrive incrementally. Add it here with a brief status and concrete intent; do not implement it automatically during the active task.
- Homecoming and lighthouse light are accepted. Sailing direction and released crests are the assigned correction; additional ideas remain queued.
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
