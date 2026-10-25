# Next task — make the first story scenes visible

## Current assignment and review decision

Implement **NEXT_TASK_STORY_SCENES.md** as the current task. This is a correction to the presentation in the completed story-foundation pass. It supersedes conflicting scene-presentation wording in the older task and storyboard; the campaign direction and checkpoint semantics remain authoritative.

Repository: https://github.com/EDLMGit/Lastferry  
Branch: `m1-first-crossing`  
Reviewed baseline: `8cc43c794274fe64d5fb634961fbf79aaff251f8`  
PR #1 stays draft; main stays unchanged. Preserve any newer or unrelated work.

Read `AGENTS.md`, `docs/PROJECT_STATE.md`, this task, `campaign/STORY_SCENES.md`, and the current story sources before editing. The old M1-only implementation scope does not override this explicit task. Do not repeat the completed foundation assignment.

The independent review found that the original task and three campaign documents reached the repository byte-for-byte. Fresh Node 24 build/TypeScript, all 261 unit tests, and 73-family asset validation passed; all six production files reproduced the contributor's recorded hashes. No new blocking checkpoint/progression defect was found in that focused review. Existing browser results remain contributor evidence, not a new Android test.

Keep the working title, two-cove registry, explicit rescue acceptance, save validation/recovery, practice isolation and cove-boundary checkpoint behavior. The correction concerns the **experience of the opening and Holding → Bellwater connection**. The present controller waits eight seconds over existing idle motion, uses a static camera fit, disables Continue until settlement, and displays “Animation settled.” That is useful scaffolding, but it does not deliver the authored miniature story moments.

**Player-facing success:** the player recognizes their ferry and Moss, understands the lighthouse as home, then sees that the rescued trio is safe before the next crossing. The scene conveys these relationships through composition and a small visible action as well as readable captions.

The next content milestone after this correction is Driftwood Yard and Nell. This task completes the reusable story presentation through two actual scenes; it does not add that cove, the larger ferry, currents, or the twelve-cove campaign.

## 1. Opening — the first evening

Create a short authored sequence in the actual 3D world, using existing assets. Target roughly 6–9 seconds when watched, with no mandatory waiting. Do not satisfy this with an idle timer, a gallery specimen, or a prerecorded concept film.

| Beat | What the player sees | Story purpose |
| --- | --- | --- |
| The ferry | A clearly recognizable yellow hull, red cabin and Moss aboard at the actual Stone Pier start. A restrained head/body acknowledgment from Moss gives the shot a living subject. | This is your boat, and someone already trusts you. |
| The light | A deliberate change in framing reveals the warm lighthouse and luminous water connecting it to the ferry. Use a slow, bounded camera move or a composed cut that suits the viewport. | The lighthouse is the welcoming destination. |
| The crossing | Settle into a readable composition that hands cleanly to the existing Holding play framing when Continue is chosen. Keep the starting passenger arrangement intact. | The player is ready to take responsibility. |

Retain the exact opening copy:

1. “Your first evening alone at the helm.”
2. “The tide will be high tonight.”
3. “Bring everyone to the lighthouse.”

Make all three lines readable from the first frame, and retain them on the settled, skipped, restored and Reduced Motion frames. Timed emphasis may decorate already-readable text; it must not delay access to any line. Do not add a required Next click for each line.

Moss is already aboard in the real puzzle. No invented boarding, departure, passenger relocation or tide change may contradict that state. The acknowledgment is presentation-only, returns to a stable pose and uses the existing model. Keep the captain unseen.

## 2. Connection — another bell

Begin only after the player's existing explicit Continue story action accepts Holding's completed rescue. Preserve its accepted arrival and victory audio before this boundary.

Compose the safe Harbor around **Pip, Rue and Moss already ashore**. They are present in the current implementation; make them the visual subject of this beat. Give one small, recognizable acknowledgment—such as Pip turning toward the ferry and making a restrained hop—then settle. A subtle widening or composed cut toward the water provides the sense of another crossing ahead. Target about 3–5 seconds of optional authored motion.

Retain this caption exactly:

“Pip, Rue and Moss are safe. Across the water, Bellwater is still waiting.”

The three rescued animals stay home. Continue enters the untouched Bellwater initial state with its own residents. Do not stage a second rescue, re-board the trio, or replay the victory cue merely because the connection opens. A restored pending connection begins at the readable settled composition without replaying its acknowledgment.

## 3. Give the story its own quiet presentation

Use the existing painted cove material, type, palette and native dialog owner. Recompose the story surface as a restrained caption treatment around the scene's subject, rather than a standard large options menu with an animation-status label. Keep all necessary text readable; a smaller panel must not mean smaller type or concealed copy.

- Make **Continue** available from the first frame. It cancels any remaining finite scene motion and advances through the existing acknowledgement transaction exactly once. There is no minimum-duration gate.
- While authored motion is active, **Skip animation** settles that scene immediately and leaves all copy visible. It does not accept the scene or enter gameplay. Continue remains the only acknowledgement/departure control.
- When the motion ends or is skipped, remove the unnecessary Skip control. Do not show “Animation settled,” a countdown, or another implementation-status message. Move focus to Continue if the removed control owned focus.
- Ordinary calm water and permitted ambient movement may continue on the settled frame when the player's motion preference allows it. Settling the finite story motion must not force the whole world into Reduced Motion. Preserve the actual Sound/Motion preference.
- Reduced Motion uses authored still compositions and complete text immediately, without camera travel or character hops. Restore/background recovery also settles safely; no delayed callback may advance gameplay or replay a cue.
- Keep the same native fullscreen/dialog behavior, visible keyboard focus, touch fencing and audio intent. An explicit mute remains muted. Reuse the existing score/context; no new soundtrack or spoken dialogue.

At 320px portrait and 780×320 landscape, protect the ferry, relevant animal silhouettes and lighthouse from captions/controls. Portrait and landscape may use different shot compositions. On short landscape, use a restrained cut instead of an unsuitable pan or zoom. Do not shrink the whole world solely to fit a wide menu. Do not turn the caption into a scroll-dependent story with essential text offscreen.

If gameplay route dots or markers visibly compete with the cinematic composition, hide their presentation only while the scene owns the view, then restore them exactly on gameplay entry. Do not change route geometry or interaction behavior.

## 4. Implementation boundaries

Extend the existing bounded scene controller with the smallest authored shot/action recipe required. Scene duration, composition and finite action should drive what is visible. Avoid a general cinematic framework, another renderer, another audio owner or a save-system rewrite.

Keep story presentation separate from committed game state and Undo history. Watching, skipping, backgrounding, resizing or changing motion settings spends no turn and cannot change passengers, tides, capacities, delivery, route legality or checkpoint acceptance. Continue/Continue story retain their explicit, idempotent progression roles. Ordinary terminal Undo remains available before departure.

On settlement, finish or cancel finite scene jobs at the authored endpoint and hold that composition. On navigation or disposal, cancel pending callbacks and restore any temporary camera/animal transforms to the intended gameplay presentation. Repeated input, orientation changes and fullscreen changes must not leave a temporary pose in gameplay or double-enter a cove. Hand off to the original authored puzzle state without a contradictory visual reset.

Preserve all three existing puzzles and accepted portraits, controls, nearby previews, audio intent/mix, water/wake, ferry headings, sailing pace, lighthouse and phone panning. Existing overlap, delivered-heading and rapid-touch limitations remain open unless a concrete correction is separately evidenced. Full mid-puzzle resume remains outside this correction; keep the existing honest cove-start notice.

Update the existing `ui.story-presentation` family, its gallery/evidence and asset-ledger entry. Add a family only if a genuinely new reusable asset is introduced. Preserve all 73 current IDs. Update `docs/PROJECT_STATE.md` and `STATUS.md` to distinguish implemented scenes, verification and pending human acceptance. Keep future campaign content labeled as future.

## 5. Verify the visual result as well as the state machine

Inspect the actual opening before writing a completion claim. A timer expiring, a heading changing, or a screenshot of the same scene at two times does not demonstrate authored storytelling.

Required evidence is compact:

1. An uninterrupted real opening showing its initial shot, meaningful intermediate reveal/action and settled endpoint, then Continue into Holding. Record native phone portrait and short landscape versions. Include a separate concise capture of the Harbor connection with the safe trio and visible acknowledgment. Mark silent footage honestly; retain actual source identity.
2. Inspect the subject silhouettes, full copy, controls and gameplay handoff at 320×740, 390×844, 780×320 and 844×390; check one desktop composition. Use a small set of meaningful beginning/middle/end frames instead of an inflated screenshot inventory.
3. Check watched, immediate Continue, Skip then Continue, Reduced Motion and restored pending scenes. They must reach identical intended puzzle/checkpoint states, with no extra action or lost caption. Check double activation, background recovery, orientation change and cancellation for stale transforms/callbacks.
4. Complete the existing two-cove story through actual UI rescues, including a terminal Undo before departure. Reuse unchanged checkpoint coverage where justified; run affected native keyboard/touch/audio/fullscreen paths. Do not turn this into another full historical browser-suite campaign.
5. Run Node 24 production build/TypeScript, the current unit suite and asset validation once the final source is stable. Add only meaningful tests for the new timeline/cancellation and preserved state boundaries. Report exact passes, original failures and unverified physical-device behavior.

If the result still reads as a caption card over an unchanged idle view, refine it within this task before calling it complete. The visible authored beats and understandable relationship between ferry, animals and home are the creative acceptance criteria.

## Handoff and publication

Write `reviews/story-scenes/REVIEW.md` with the actual shot/action choices, short native recordings, representative frames, commands/results, source identity and limits. Commit and push to `m1-first-crossing`, update PR #1 while keeping it draft, verify remote equality and checkout status, and leave main unchanged. Never force-push.

As of the reviewed handoff, the owner-private Site remains version 12, game `1a85874883af5caa59f6294a75495eccf2afebbc`, hosting source `e87c5c5baa53a39001c5a89b07b59aab2ad150fc`. Neither the story foundation nor this correction has been published. Preserve any subsequently confirmed publication record. A Git push is not deployment.

Return the exact final SHA and the concise evidence above for ChatGPT review. Do not automatically publish this pass. When describing how to test it locally, give the **root URL without `?cove=`**: explicit cove links intentionally bypass the journey and remain independent practice/review entrances.
