## Why this change is needed

<Describe the player-facing problem or the M1 task.>

## What changes

<Describe the resulting behavior and any relevant implementation decision. Keep scope to the single playable 3D cove.>

## Review identity

- Head SHA reviewed or tested: <full SHA>
- Comparison base SHA: <full SHA>
- Working tree when evidence was captured: <clean / dirty; relevant diff or patch>
- Review report: <repository path or accessible authorized URL>

If evidence predates the final commit, identify the base HEAD and uncommitted changes it represents. Do not claim that earlier evidence was captured from a later commit.

If the evidence was captured before the repository's first commit, record **no commit yet** and link the source archive or file-hash manifest from that run. Identify the first commit and any relevant differences separately.

## Verification actually performed

List exact commands or playthrough steps and observed results. Use **not run** when unavailable. Check a box only after verifying the relevant behavior; explain untested or unaffected items below.

- [ ] The actual playable build launches and the intended rescue route reaches success.
- [ ] Preview leaves authoritative state unchanged and matches the committed result.
- [ ] Tide/deadline boundaries and channel-depth/load thresholds follow the agreed rules.
- [ ] Undo restores the complete prior state without losing or duplicating animals.
- [ ] Repeating an action sequence is deterministic; choosing a new action after undo works.
- [ ] A touch input commits once, including during transitions and rapid interaction.
- [ ] Desktop and touch-enabled narrow landscape views keep essential controls and game information usable.

Commands, results, actual environment, and coverage limits:

<Details. Reference-model checks do not replace tests of the implemented game. Performance numbers, if included, must identify their measurement environment and method.>

## Gameplay evidence

Link small captured images and the review report from `reviews/<review-id>/`. Include source identity, actual viewport/input mode, and capture method in the report or manifest.

- Normal play: <path or unavailable>
- Loading preview: <path or unavailable>
- After tide advances: <path or unavailable>
- Success: <path or unavailable>
- Narrow landscape control/HUD capture: <path or unavailable>
- Short gameplay recording, if tooling supports it: <local path or authorized attachment; unavailable is acceptable when explained>

Label concept art and design references separately. If the game could not be rendered or captured, state **visual verification pending** and the reason. Keep videos out of repository history by default; uploading them to a PR or release requires existing user authorization.

## Known defects and next step

<Confirmed defects with impact and reproduction, unverified risks clearly labeled, and the next action. Do not claim tests or visual approval that were not performed.>

<Send the repository, PR/branch, head SHA, latest task, and evidence paths in chat to request a review. This template does not configure automatic reviews or authorize a merge.>
