# Current baseline and package revision

**Checked 30 October 2026 UTC.** This is a revised Codex assignment, not a report that its Home screen or direct actions have already been implemented.

## Repository identity

The GitHub connector returned these current PR identities during this package revision:

| Item | Observed value |
| --- | --- |
| Repository | `EDLMGit/Lastferry` |
| Pull request | [#1](https://github.com/EDLMGit/Lastferry/pull/1), open and draft |
| Head branch | `m1-first-crossing` |
| Head SHA | `d532c62f0f25854387869466572a1ed0cf35a0ac` |
| Base | `main` at `386de54d20fdd4a513a06115471d70bf94738cc0` |

The user's latest clarification says neither previously proposed flow task has been given to Codex. The unchanged PR head is consistent with that. `HOME_PLAY_FLOW_01` therefore replaces both unused tasks in `LAST_FERRY_FLOW_AND_FEEDBACK_PACKAGE`. No earlier Task 01 commit is a prerequisite, and the completed `STORY_PRODUCTION_01` integration is not the current assignment.

The only executable task in this package is `NEXT_TASK_HOME_PLAY_FLOW.md`. Its Home, story/audio, transfer and verification sections are internal stages to finish before the combined handoff. The `contracts/` files specify those stages; they are not separately queued assignments.

## What is already implemented

At the reviewed SHA, the root journey has a basic information dialog and working entry/checkpoint routing. The approved three-shot illustrated opening and Harbor connection are integrated, with manual shot advancement, explicit final acknowledgment and finite sound effects. All three existing puzzles and independent practice remain available. The contributor's recorded verification is documented in the [story-production review](https://github.com/EDLMGit/Lastferry/blob/d532c62f0f25854387869466572a1ed0cf35a0ac/reviews/story-production/REVIEW.md).

The new Home composition and automatic normal-motion progression are new requirements. The prior manual pacing followed the earlier brief. The simpler passenger actions are also new requirements, responding to the user's screenshot and request to remove the redundant one-passenger confirmation.

## Source findings that shape this assignment

| Area | Relevant existing ownership and implication |
| --- | --- |
| Home and checkpoints | `src/main.ts` already owns `showJourney`, `beginJourney`, `resumeJourney`, `returnToJourneyTitle` and `mountCove`. Extend these responsibilities rather than create a parallel journey. The current title return remounts a Session; preserve an honest warning before discarding in-session progress/Undo. |
| Input isolation | The current `blocked()` depends in part on `dialog.open`. A Home rendered outside that dialog needs its own active-screen input gate; hiding HUD elements alone is insufficient. |
| Background composition | `src/scene/world.ts` separates framing, covered rendering and navigation decoration. `setStoryFraming()` is not a complete Home mode, and `World.indicate()` may restore markers. Home visibility must be owned throughout updates and reversible on gameplay entry. |
| Fullscreen and secondary views | Keep the existing `#app` fullscreen surface and native dialog owner. Options must return to its actual opener without exposing covered gameplay. |
| Story advancement | `src/campaign/presentation.ts` settles at each shot endpoint; the app clock stops there. Introduce deliberate automatic advancement while retaining pause/cancellation, final acknowledgment and fresh input across changing button meanings. |
| Music intent | The persistent Sound owner schedules the accepted score independently. New Home/story Sound controls must join the existing explicit Enable/Retry/Mute binding; IDs are currently selected explicitly in `renderSound()` / `audioControl()`. |
| Transfer friction | The Board/Unload path opens a generic dialog even for one passenger, with up to 380px reserved height. Reuse `execute()`, Session commit and actual completion for direct actions and feedback. Several passengers still require deliberate subset choice. |
| Consequences | Valid actions may produce a losing preview. Preserve pre-action loss warnings, group cost, depth bands and transfer-before-tide ordering; a receipt after the event cannot replace information needed before it. |

Source anchors: [application](https://github.com/EDLMGit/Lastferry/blob/d532c62f0f25854387869466572a1ed0cf35a0ac/src/main.ts), [World](https://github.com/EDLMGit/Lastferry/blob/d532c62f0f25854387869466572a1ed0cf35a0ac/src/scene/world.ts), [progress](https://github.com/EDLMGit/Lastferry/blob/d532c62f0f25854387869466572a1ed0cf35a0ac/src/campaign/progress.ts), [story presentation](https://github.com/EDLMGit/Lastferry/blob/d532c62f0f25854387869466572a1ed0cf35a0ac/src/campaign/presentation.ts), [audio](https://github.com/EDLMGit/Lastferry/blob/d532c62f0f25854387869466572a1ed0cf35a0ac/src/audio/atmosphere.ts), [rules](https://github.com/EDLMGit/Lastferry/blob/d532c62f0f25854387869466572a1ed0cf35a0ac/src/game/rules.ts).

## What this review establishes, and what it does not

The preceding independent review materialized exact source/assets and inspected the screenshot, saved frames, browser-test source and retained audio diagnostics. Its application compilation and production bundle passed after missing review-snapshot test helpers were retrieved at the exact commit. It did not rerun the full 297-unit, asset or browser suites. Its fresh interactive browser attempt was unavailable because the environment had no browser and downloads returned invalid/unavailable content.

This revision reuses that exact source snapshot, checks the current PR identity and adds Home-specific source review. It does not claim a new browser playthrough, acoustic listening, physical Android approval or any new game test results. Package validation checks document consistency, paths and archive integrity only.

The missing-music report is unresolved. Retained logs show score activity in one prior unmuted run, while the main audible journey capture had already warmed sound through Settings. That does not establish what the user heard. The new first-input Home Play path is the principal reproduction, with music-specific route/output evidence and actual runtime capture required.

`PREVIOUS_REVIEW_D532.md` retains the preceding review and its original findings. Any old Task 01/02 or sequential handoff instructions in that historical document are superseded by the named combined task and current contracts. No old task file or launch prompt is included here.

## Publication boundary

`deployment-confirmation.json` is copied byte-for-byte from the earlier supplied receipt. It records the existing owner-private Site at version 12, game `1a85874883af5caa59f6294a75495eccf2afebbc`, hosting source `e87c5c5baa53a39001c5a89b07b59aab2ad150fc`. It is historical publication evidence, not a new live-Site check.

No production source, GitHub branch, PR or Site is changed by preparing this package. The future Codex task commits/pushes to the working branch and keeps PR #1 draft and `main` unchanged. Publication remains a separate step after review.
