# JOURNEY_SIX_COVES_01 — connect the accepted coast

> **Completed and reviewed, 11 November 2026.** Runtime `1b7b4f05e576614f061ca4949bf5aca705dc5e0e` implements this task and is published on the existing private Site as version 18. The brief below records completed scope. The next product check is the full six-cove Android Journey, its story/upgrade pacing and physical-device feel; no seventh-cove assignment is issued here. See [current project state](docs/PROJECT_STATE.md) and [publication receipt](reviews/journey-six-coves/deployment-confirmation.json).


## Goal and baseline

Turn the six accepted puzzles into the first connected half of the twelve-cove Journey. Use reviewed runtime `f23e9b087e80316c3884ed5fa83cce25cf6508a0`, now published privately as Sites version 17, preserving newer/unrelated work. The ferry, docks, difficulty and Tips Off behavior are the baseline.

Read this task, `AGENTS.md`, active `docs/PROJECT_STATE.md`, and the current sections of `campaign/CAMPAIGN_DIRECTION.md`, `campaign/PUZZLE_PROGRESSION.md` and `campaign/STORY_SCENES.md`. Inspect the actual registry and save validation before changing them. Older proposals to remove Wide, add a new C4, delay every current or launch after an unbuilt deer cove are historical.

## The Journey

Use this order with existing IDs:

**Holding Pier → Bellwater → Driftwood Yard → Two Shelters → existing A wider deck launch → Wide Berth → Reef Return.**

The first four coves use their original four-space ferry. Move the existing launch to after Two Shelters and before Wide; Wide and Reef retain the accepted six-space boat. Keep all seven Practice entries and independent `?cove=` entrances. First Crossing remains Practice.

Preserve every accepted level's data, rules and witnesses. Add no cove, species, mechanic, difficulty adjustment or ferry/dock redesign. Update Home/Continue/arrival copy and the available-content endpoint coherently. Completing these six is completion of the currently available coast, not the unimplemented twelve-cove story or final supper.

## Two compact story connections

Use the established illustrated story player, drawing vocabulary and shared audio owner. Author one brief entry for each newly connected cove; choose exact captions, composition and construction independently.

- **Two Shelters:** the small ferry carries Hazel and Bracken; Mica waits near the reeds. Establish this relationship with one clear approach or character acknowledgment and a readable settled picture. The two beavers are already aboard in the real starting state. Do not reveal which shelter or retrieval order to choose.
- **Reef Return:** the larger ferry carries Heather and Birch; Dot and Flick still wait beyond the reef. Show a composed approach and an answering light/acknowledgment. Avoid demonstrating a solution route or departure window.

Reuse the accepted launch art and timing. Previously rescued neighbors remain safe. Do not relabel the Pip/Rue/Moss Harbor shot as a different rescue, or substitute an idle timer with text for an authored visual beat. Preserve immediate navigation, explicit final handoffs, Pause/Resume, Skip settling without acknowledgment, Reduced Motion, readable phone captions, Sound intent and cancellation. Story consumes no puzzle actions. New music, voiceover and a cinematic framework are outside this pass.

## Honest continuation for existing saves

The current version-1 validator expects exact ordered prefixes. Inserting registry entries alone will break existing progress. Make the smallest explicit compatibility change needed; this is not a general migration framework.

Preserve exact original save bytes, earned cove identities and acknowledged scenes. Home, Options, Practice and direct cove links remain read-only. Only deliberate Journey Continue applies the new continuation. Show a brief route-update explanation where an added cove changes the resume point.

Use the **first genuinely uncompleted cove in the new order**:

| Existing record | Continuation |
| --- | --- |
| Early scene/cove or historical complete-two | Preserve the early place; complete Driftwood before Two Shelters. |
| Historical complete-three or pending launch | Two Shelters, then the unseen launch and Wide. |
| Active Wide with launch already seen | Two Shelters, then Wide; retain launch acknowledgment. |
| Complete-four with Wide already rescued | Two Shelters, skip the earned Wide rescue, then Reef. |

Do not credit Two/Reef from an old chapter number, a Practice visit or a seen launch. Never erase an earned Wide rescue or silently reset a valid record. Keep malformed/future records recoverable and unchanged. If backup/persistence fails, preserve old storage and offer honest in-session continuation. Retain cove-boundary checkpoint wording; mid-puzzle resume is not added. Winning remains undoable until explicit continuation accepts it.

## Verify and finish

Verify the fresh six-cove order, correct boat/launch boundary and truthful scene backgrounds; actual Journey rescues in Two Shelters and Reef, including tide/terminal Undo; the legacy cases above and reload; and read-only, malformed/future and storage-failure cases. Tips must remain independent and Off by default.

Inspect actual beginning, visible action and endpoint of both new scenes in phone portrait and short landscape. Check keyboard, Reduced Motion and shared audio lifecycle. Run the relevant build/typecheck, save/registry units and asset validation. Preserve old puzzle data byte-for-byte and report original failures honestly. Avoid repeating unrelated suites without a concrete risk.

Update active continuity and actually affected asset records. Commit/push to `m1-first-crossing`, keep PR #1 draft and GitHub `main` unchanged. Do not automatically deploy. Return exact SHA, concise review, native phone scene frames, an actual uninterrupted Journey connection/rescue recording and verification. The root URL without `?cove=` must expose the new Journey.
