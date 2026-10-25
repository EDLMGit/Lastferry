# Last Ferry — Project state

Updated: 2026-10-25. This is the compact continuity record for the current project, not a claim that every device or future release requirement has been verified.

Read this before choosing scope. Detailed implementation history belongs in `STATUS.md`; evidence belongs under `reviews/`. Update this record after each handoff and after a confirmed deployment. User feedback can revise an accepted decision.

## Product and working relationship

Last Ferry is a finite, authored coastal puzzle story: a small ferry brings animals home before rising water closes their rescue window. Think slowly, see the consequences, and enjoy a beautiful miniature world. One worthwhile playthrough is a valid product.

Android phone play in both portrait and landscape is the current playtest target, with desktop, touch and keyboard support. The user is the current human playtester. Do not require recruiting additional testers to continue these passes.

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
| Phone playability implementation | `0a9de631998ffb88b5608b17d80030b810db5b5c` — published for user phone testing as game `e78819974a0487440e439ef87d24ba4bb1c2f454`; three timing-check limitations remain. |
| Audio/fullscreen corrective implementation | `d45d47332e2b02643f77d0ecd18b8d7149fa0dd8` — published and user-accepted in game `8052cfcd67f2e56cf3258243618c4ce125d51c4b`; measured timing/device limits remain recorded. |
| Cove interface implementation | `f468a3272ed0a6d0a485860aea11320950425218`, reviewed packaging `a4325353cf11cd4edba8d5384b58fe138e4772e3` — the user likes the button/icon direction; panel and three-passenger preview refinement requested. Not deployed. |
| Reviewed game baseline | `8052cfcd67f2e56cf3258243618c4ce125d51c4b` |
| Private phone build | `8052cfcd67f2e56cf3258243618c4ce125d51c4b` — Sites version 10, publication confirmed by the current user task on 2026-10-25 |
| Stable phone URL | https://last-ferry-playtest.abumech.chatgpt.site |
| Site source commit | `f9ada70cbd093bf52c105f2287558381b3b7c83c` |
| Main | Unchanged by this workflow; no merge authorized |

The current task confirms that ChatGPT published game `8052cfcd67f2e56cf3258243618c4ce125d51c4b` to the existing private Site as version 10, with hosting source `f9ada70cbd093bf52c105f2287558381b3b7c83c`. These are separate game and hosting identities. The user reports that everything works well, accepting the current playtest build and its audio/fullscreen improvement. This report does not establish a complete device/browser matrix or replace the original measured timing limitations. No deployment is performed by the cove interface pass; its new GitHub source awaits ChatGPT review and subsequent publication.

The preceding version 9 publication remains historical evidence: hosting source `03720726f2d92cda0d5d66efb6749ccc755d22ee` contained game `e78819974a0487440e439ef87d24ba4bb1c2f454`. Its three production files matched the tested local build byte-for-byte; 51 of 52 runtime/data/build source entries matched after newline normalization, with only the preview Vite entry/formatting different. See `reviews/phone-playability/deployment-confirmation.json` and its source audit. Those measurements describe version 9, not a new source audit of version 10. Publication statements within the historical pass records below describe their handoff date; this table identifies the current live build.

After the next implementation, record the new GitHub SHA separately from the live Site's game SHA. Do not update the live field until deployment is confirmed.

## Current task: Readable passenger previews and painted panels

`NEXT_TASK_COVE_PANEL_REFINEMENT.md` starts clean at reviewed `a4325353cf11cd4edba8d5384b58fe138e4772e3`. The supplied `cove-panel-package/` and its independent review are retained. ChatGPT freshly verified that baseline's production/typecheck, 202 units, 71-family catalog, production assets, packaged source/media and 52 protected sources. Those are independent code/source checks, not new Android, browser or listening approval.

The user likes the buttons/icons and overall world. The requested correction concerns the actual three-passenger Harbor preview before Confirm: clipped full capacity text, horizontal overflow, present-tense success wording and scene silhouettes through the reading panel. Both stages are required: readable native choice tiles and unambiguous future-state text, then the original opaque painted material integrated across shared reading surfaces. Keep stable nearby sheets, focus recovery, controls, phone camera, all puzzles and accepted audio/world behavior. Update the existing five catalog families rather than adding per-menu assets.

Implementation and focused verification are complete in `reviews/cove-panel-refinement/`. Native responsive two-line passenger choices retain full 16px names/costs and 62px targets. Future preview wording and projected load/tide remain separate from committed state/effects. Shared ordinary/compact/arrival surfaces use the supplied opaque painted CSS and sparse original SVG with unchanged button relief. Exactly five existing families are updated; all 71 IDs and retirements remain. Human approval of the button direction does not blanket-approve this panel refinement.

Final Node 24 build/typecheck, 203/203 units, catalog validation, 272 contrast checks and five focused browser cases pass. Six actual Holding UI rescues at all required sizes plus 320×740 pass, including tide/terminal Undo and redelivery. All five exact baseline Harbor states reproduced clipping/overflow; final individual text-line and nested overflow checks pass. Native inspection covers 48 final images and five matched originals; ferry size and HUD height are unchanged. Full uninterrupted 38.8-second silent gameplay is retained. Original baseline failures and the inconclusive development reset remain recorded; frozen reruns pass. Existing card/dock overlap, delivered-heading and ≤180ms rapid-touch limits remain open. Physical Android, other engines, native GPU, different fonts and new acoustic approval remain unverified.

**Ready for ChatGPT review.** Source identities, exact commands, original failures and evidence are in `reviews/cove-panel-refinement/REVIEW.md`. No deployment: the private Site remains version 10/game8052cfc/sourcef9ada70 until confirmed publication after review. Main is unchanged and PR #1 remains draft.

## Previous handoff: Cove interface and asset inventory

`NEXT_TASK_COVE_UI_ASSETS.md` is implemented from clean accepted `8052cfcd67f2e56cf3258243618c4ce125d51c4b`. The supplied original package is retained. Shared matte seafoam actions, dark teal panels, inset passenger checks and warm Harbor/progression accents now cover the actual game. Clear Board / Let ashore / Bring home text and native controls remain; Harbor's lighthouse is distinct from the framed-ferry camera control. Dock glyphs stay upright. Sound/fullscreen/view renderers preserve their button nodes and update shared icon/label children.

`assets/catalog.json` is the canonical 71-family inventory: 38 existing runtime, 25 integrated, two retired, six reference-only. Retired `ui.dock-icons` and `ui.utility-icons` name replacements and historical sources. Human acceptance is separate and pending for the new appearance. The development-only `asset-gallery.html`, `docs/UI_STYLE_GUIDE.md`, provenance ledger and lightweight validator support future additions without a runtime asset manager.

Final build/typecheck, 202/202 unit tests and catalog validation pass. There are 24 distinct browser passes across documented runs. The original 23/1 batch reproduced a portrait keyboard cancellation failure; the focused fix restores a visible dock before returning keyboard focus. All three affected cases and three exact repeats pass without weakening the original assertion. Twenty matched native screenshots across five sizes and a full 27.8-second touch recording support the visual handoff. Initial boat size is unchanged. All three actual UI rescues, subsets, tide/terminal Undo, nested icons, audio intent and native fullscreen are covered. Composite contrast passes 169 checks; Reduced removes decorative transitions.

See `reviews/cove-ui-assets/REVIEW.md` for source identities, build, commands, original failures, media and packaging. The touch evidence precedes only the narrow keyboard-return guard; byte-level reuse is explicitly recorded and fresh keyboard evidence covers that guard. Accepted scene/audio/rules sources remain byte-exact. Existing card/dock overlap and secondary-detail scrolling are retained; ≤180ms rapid touch and the prior delivered-heading observation remain open. No physical Android, other-engine, native-GPU or new acoustic approval is claimed.

**Ready for ChatGPT review, not deployed or human accepted.** PR #1 remains draft; main and the private Site are unchanged. Final GitHub identity is recorded in the handoff and packaging audit, separately from the live version 10 game/source above.

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

`NEXT_TASK_SAILING_DIRECTION_AND_WAKE.md` is completed and user-accepted as `80545cbabb0496b215cd56f25cfc0113b056da67`. It started clean on `m1-first-crossing` at `8b874adccfc1d65af569b81fade548f0368645b0`. Preserve its sailing budget, puzzles, headings, released crests, audio, water palette/shader and lighthouse/homecoming. The rejected previous pass was superseded by this accepted correction.

The correction replaces universal endpoint alignment with an accepted-transaction presentation pose history. Free-water stops retain their incoming tangent; actual piers choose the closer safe broadside berth. A deterministic shortest-angle departure and required berth alignment stay within the existing movement budget. Undo restores the paired pre-action heading; all completion/recovery paths use the same precomputed target. Local mirrored deck entries support both berth headings without changing transfer/audio timing.

The water treatment uses a fixed pool of independently released open crests. Release data, age and stable variation determine their later world-space evolution; later hull movement cannot drag them. Finite tails finish after controls unlock, with no live ellipse, bow outline or peak-strength docking restart. Fresh Node24 build/typecheck,173/173unit tests and23 distinct browser cases pass (20 together,3 through preserved affected reruns). Native phone comparisons retain fewer broader soft crests; four animated excerpts and selected native frames are accessible in Git. Six final full-interface recordings and15 validated originals remain local/ignored. Source/runtime identity, original failures and exact results are in `reviews/sailing-direction-wake/REVIEW.md`. The warmed comparison retains equal active p95/resource counts; two instrumented desktop Bellwater gaps clear transients, while final phone runs have no gap above300ms. Physical Android/native GPU and new listening remain unverified. Implementation is complete. The existing private Site publishes game `80545cbabb0496b215cd56f25cfc0113b056da67` as version8; its successful deployment and source identity were confirmed on2026-10-24. Phone playtesting can use the stable URL. Remaining physical-device limitations still apply.

## Published pass: Phone playability

`NEXT_TASK_PHONE_PLAYABILITY.md` is the completed phone-layout scope. Started clean at `a93bed3897586fbfa66ed06e54ee2d9685c87be0`; its newer continuity documentation is preserved and its game matches accepted/published80545cb. The package-root task was retained in this repository. The confirmed private publication is Sites version8, hosting source382b2d358ddf9fb1cac6cebb7905ae9f25f9fdc6, with the same URL and owner-private audience.

Implemented a closer stable Play view in both phone orientations, deliberate Whole cove and Back to boat, bounded water dragging, measured visible-viewport/safe-area layout, nearby action previews and optional fullscreen on the common app root. The fixed isometric angle and horizontal sailing follow keep the ferry readable; Whole cove retains every stop. Transfer subsets keep a stable panel with internal scrolling and reachable confirmation. Portrait uses a bottom sheet; short landscape a nearby same-edge sheet. Camera/water revisions update picking, map names/targets, dock controls, anchors and water together. A real tide-height marker offset was corrected. Batched label measurements reduce repeated layout work. Accepted puzzle, heading, released-crest, timing, audio, water and lighthouse sources remain protected.

Final Node24 build/typecheck and **188/188 unit tests** pass,27files with bounded workers. **17/17 final focused browser cases pass in one completed run**, covering five phone sizes, both actual Holding rescues, subsets/tide and terminal Undo, pan/picking, resize, fullscreen actual API and labeled fallbacks, safe viewport offsets, desktop and other coves. A separate final four-case timing run has one pass (victory mix) and three failures: delivered heading step1.425683rad versus0.85 over99.9ms and trusted-input sequences230.2/377.6ms versus180ms. Those checks remain failed verification limits; thresholds and original evidence are preserved in the [phone review](../reviews/phone-playability/REVIEW.md). Native comparisons, source/packaging identity and accessible moving evidence belong there. Physical Android, other engines, native-GPU performance and new listening remain unverified. On the user’s subsequent explicit request, game `e78819974a0487440e439ef87d24ba4bb1c2f454` was published to the same private Site as version9 for phone testing. New visual acceptance and physical-device behavior remain for that playtest; no new independent review is claimed.

## Published and accepted correction: Phone audio and fullscreen

`NEXT_TASK_PHONE_AUDIO_FULLSCREEN.md` started from `291fb4fa24d02dbab84dfe6eca2abc5c29b6d411`. Its handoff left game e788199 / Sites version 9 / source 03720726 unchanged. ChatGPT subsequently published the reviewed correction as game `8052cfcd67f2e56cf3258243618c4ce125d51c4b`, Sites version 10, hosting source `f9ada70cbd093bf52c105f2287558381b3b7c83c`, as confirmed in the current task. The user now reports that everything works well. Preserve phone framing, nearby previews, puzzles, headings, wake, pace, accepted audio composition/mix, corrected audio intent/fullscreen behavior and lighthouse.

The confirmed audio defect memoized a native resume that could remain pending after premature touch activation. Fresh valid gesture retry, request/generation protection and explicit Enable/Retry/Mute intent are corrected, including late mute/hide/disposal and held-key intent. Both native cold coves and the first free pan start sustained output under interaction-required policy with one context/scheduler. The supported signed-in hosted IAB reproduced fullscreen entry with an existing modal visually covered; corrective native promotion preserves its DOM/subset/focus/scroll and restores visible UI on actual entry. Final local production on the same IAB surface shows the menu and working Exit. This is a demonstrated rendering fix, not a claim that every Android API rejection is reproduced or solved. Bounded support details retain native capability/policy/activation/error and viewport facts without telemetry.

Build/typecheck and **200/200 units** pass. **20 distinct browser passes across runs** comprise18new, strict existing fullscreen and a112.6ms trusted mouse fence. Actual landscape/portrait rescues include tide and terminal Undo/redelivery. Original failures remain intact. The delivered-heading1.425683rad/99.9ms failure remains open; the rapid touch window is still unverified after a correct622.5ms sequence and a native-gesture experiment delivering no clicks. Old mouse/touch misses remain archived; only the current mouse path now verifies180ms. No threshold or accepted camera/steering design changed.

[Review](../reviews/phone-audio-fullscreen/REVIEW.md), exact source and selected screenshots/runtime audio retain their original provenance and handoff status. The subsequent user playtest accepts the published result; no new instrumented Android Chrome, hardware speaker, native GPU or other-engine evidence is claimed. The correction is now live on the same private Site. The next cove interface/style pass remains unpublished until review.

## Queue and scope boundaries

- Further playtest feedback will arrive incrementally. Add it here with a brief status and concrete intent; do not implement it automatically during the active task.
- Homecoming, lighthouse light, sailing direction, released crests and phone playability with the audio/fullscreen correction are accepted and published. The cove interface and asset inventory is the current implementation task; additional ideas remain queued.
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
