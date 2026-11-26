> Historical review retained for source and evidence context. Its old Task 01/02 execution instructions are superseded by `NEXT_TASK_HOME_PLAY_FLOW.md` and the current contracts. Do not execute the old tasks.

# Review — story flow, music and transfer friction

**Reviewed 30 October 2026 · `d532c62f0f25854387869466572a1ed0cf35a0ac`**

## Decision

Keep the illustrated story integration and approved art. The next work is a pair of contained interaction refinements: automatic normal-motion story playback with clear sound state, followed by direct routine transfers with concise pre-action facts and floating result feedback.

The user accepts the overall direction but reports no audible music and finds the single-passenger transfer menu annoying. The missing music remains unresolved. Do not turn a retained technical pass into a claim that the player's experience is wrong.

## Source and review coverage

[PR #1](https://github.com/EDLMGit/Lastferry/pull/1) was checked directly through GitHub. Its head matches the handoff, the PR remains open/draft, and the observed main/base remains `386de54d20fdd4a513a06115471d70bf94738cc0`.

The independent review inspected the supplied screenshot, exact application/campaign/audio/action source, current PR and review report, the actual story browser test, retained audio diagnostics, and two committed native story frames: portrait Lantern and short-landscape Harbor. Runtime files/assets were materialized at the reviewed commit and matched their Git blob identities. The package lock matches the existing local dependency set.

Fresh application compilation and Vite production bundling passed from that exact runtime snapshot, including the retrieved story-test dependencies. The first TypeScript attempt lacked three test helper files in the review snapshot; fetching those exact files resolved the review-environment error without source edits. The historical 297-unit suite, full asset audit and complete browser suite were not rerun here.

A fresh interactive reproduction could not run: no local test browser was present and browser downloads returned unavailable/invalid archive content. The local dev server started, but no new browser playback or acoustic listening result is claimed. This review therefore distinguishes source findings, inspected saved frames and retained observations from a new device reproduction.

## 1. Story playback: deliberate old behavior, now revised

`StoryPresentation.update()` settles the active shot at its duration. The app's `scheduleStoryClock()` stops when settled. `continueStory()` changes shots only on explicit activation, acknowledging the scene when the final shot is active. The current manual behavior followed the earlier assignment; automatic playback is a new user-directed requirement.

The approved finite actions are still useful: 6 / 6 / 7 seconds for the opening, with each complete caption becoming fully visible at approximately 1.29 seconds. The next task lets the three shots flow automatically while retaining Pause/Resume and immediate manual navigation. The final picture waits for Take the helm. Harbor likewise waits for Continue to Bellwater. Timed story progress never writes a checkpoint.

The critical new input risk is a press that starts as Next and ends after an automatic transition has changed the same control to Take the helm. Existing repeated-click and held-key checks do not by themselves establish fresh intent across that timed boundary. Task 01 requires a fresh final activation without imposing a mandatory delay.

Sources: [presentation controller](https://github.com/EDLMGit/Lastferry/blob/d532c62f0f25854387869466572a1ed0cf35a0ac/src/campaign/presentation.ts), [application integration](https://github.com/EDLMGit/Lastferry/blob/d532c62f0f25854387869466572a1ed0cf35a0ac/src/main.ts), [scene registry](https://github.com/EDLMGit/Lastferry/blob/d532c62f0f25854387869466572a1ed0cf35a0ac/src/campaign/registry.ts).

## 2. Music: the complaint needs a targeted reproduction

The audio owner schedules music on its own 100ms interval. Covering the gameplay World does not inherently stop that scheduler. Story-effect cancellation targets story sources, and trusted non-audio clicks activate the shared Sound owner. Existing mute intent is remembered.

The audible journey recording starts after Settings has already activated sound. The separate cold test uses New journey, but its assertions focus on context state and story-source cancellation rather than proving score output. A running context or a nonzero master meter can be satisfied by effects or ambience.

The retained cold-test observations nevertheless show music activity in their unmuted case:

| Retained observation | Around 0.50s | Around 2.42s |
| --- | ---: | ---: |
| Music sources | 4 | 5 |
| Scheduled score events | 1 | 2 |
| Skipped score events | 0 | 0 |
| Master gain | 0.65 | 0.65 |
| Effective music target | 0.72 | 0.72 |
| Mixed RMS | 0.00474 | 0.01668 |

These are the contributor's recorded observations, inspected independently now. They are not a fresh measurement, a music-bus loudness measurement or proof of the user's current device state. The absent narration files do not explain missing music; the score is synthesized separately.

Task 01 must exercise New journey as the very first trusted input, verify the music route itself, preserve remembered mute, inspect pending/blocked resume, and expose the existing Enable/Retry/Mute control in the story. A possible first-resume scheduling delay is a hypothesis only; no epoch rewrite is prescribed without reproduction. If silence remains unreproduced, complete the supported improvements and carry the unresolved issue forward honestly with useful support details.

Sources: [audio owner](https://github.com/EDLMGit/Lastferry/blob/d532c62f0f25854387869466572a1ed0cf35a0ac/src/audio/atmosphere.ts), [story browser checks](https://github.com/EDLMGit/Lastferry/blob/d532c62f0f25854387869466572a1ed0cf35a0ac/tests/e2e/story-production.spec.ts), [retained cold audio observations](https://github.com/EDLMGit/Lastferry/blob/d532c62f0f25854387869466572a1ed0cf35a0ac/reviews/story-production/dev3/audio-lifecycle.json).

## 3. Transfer menu: confirmed unnecessary friction

Every Board/Unload activation currently opens the generic transfer dialog. It renders passenger selection, several preview paragraphs and a Confirm action even for one passenger. Its placement code reserves up to 380px height, explaining the large empty area in the supplied screenshot.

The screenshot's canonical case has one straightforward choice: let Moss ashore at safe Stone. A named direct action can do this in one tap. The cost and resulting boat requirement should be visible beforehand, followed by a small acknowledgment after the actual transfer settles.

Use **1 action used**, because the reducer increments actions completed rather than subtracting from a pool. Use **Needs depth 2 → 1**, because the changed value describes the ferry's requirement, not a reduction in the water's depth. Derive actual draft bands; some load changes do not change required depth.

Several passengers remain a real choice. Keep a compact nearby selector, full names/portraits and one named committing action for the selected group. A valid action can still produce loss, so retain a concise pre-action warning for those outcomes. Free inspection and useful tide/landing/passage information remain available.

Task 02 reuses the existing `execute()` and transition completion owners, keeps feedback tied to the accepted transaction, preserves group action cost, and explicitly handles disappearing-button focus and repeated input. It changes no puzzle rule or sailing/forecast interaction.

Sources: [dock/dialog/commit/placement code](https://github.com/EDLMGit/Lastferry/blob/d532c62f0f25854387869466572a1ed0cf35a0ac/src/main.ts), [preview copy](https://github.com/EDLMGit/Lastferry/blob/d532c62f0f25854387869466572a1ed0cf35a0ac/src/ui/presentation.ts), [location facts](https://github.com/EDLMGit/Lastferry/blob/d532c62f0f25854387869466572a1ed0cf35a0ac/src/ui/location.ts), [reducer](https://github.com/EDLMGit/Lastferry/blob/d532c62f0f25854387869466572a1ed0cf35a0ac/src/game/rules.ts).

## Evidence and scope boundaries

The contributor reports 297 unit checks, 75 asset families and seven distinct browser cases across retained runs. Their report explicitly preserves original failures and scoped corrections. This review does not reclassify those as a fresh single-run result.

The inspected native frames retain the approved close character art and readable story composition. They cannot establish motion smoothness or sound. Future acceptance should include a hands-off story sequence and a real direct-transfer sequence at portrait and constrained 780×320 landscape, with actual runtime audio and honest physical-device limits.

Preserve the inherited card/dock overlap, delivered-heading discontinuity, precise ≤180ms rapid-touch limitation and physical Android/fullscreen/native-GPU gaps unless the corresponding pass actually resolves and verifies them. No new cove, animal, narration, scene art, larger ferry, current rule or save migration is part of these tasks.

No game source, GitHub branch or Site was changed during this review. The copied existing publication receipt records version 12/game `1a85874883af5caa59f6294a75495eccf2afebbc`; it is not a fresh live-site audit. Both next tasks keep PR #1 draft and `main` unchanged, with separate publication after review.
