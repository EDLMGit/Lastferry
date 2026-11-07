# Last Ferry — compact controls and Driftwood Yard

**31 October 2026 · One current assignment · `DRIFTWOOD_YARD_01`**

Home, automatic story playback and direct transfers are implemented. This package is the next assignment: simplify the dock controls, then add **Driftwood Yard**, **Nell the boatwright** and the third canonical campaign rescue.

## Start Codex

1. Extract the complete `LAST_FERRY_DRIFTWOOD_YARD_PACKAGE` folder inside the existing `Lastferry` repository, beside `package.json`, `src` and `campaign`.
2. The current task must resolve to `Lastferry/LAST_FERRY_DRIFTWOOD_YARD_PACKAGE/NEXT_TASK_DRIFTWOOD_YARD.md`.
3. Open Codex in the actual repository root and paste `CODEX_PROMPT.txt`. Use Node 24.

There is one task and one prompt. Compact controls, content, continuity and verification are internal stages of that task. Complete the new playable cove before the final handoff; do not stop after the button cleanup.

The reviewed game is `da1f2686ce6aff8d754e13111447dabb6e1313f0`. The branch was subsequently observed at `879c9d1cfb6745ce8a294e4dbba4aa3d984ef4b3`, whose Git tree is exactly identical. Preserve the current branch/history and any newer or unrelated work; do not reset to the older reviewed commit. See `review/REVIEW.md` for exact evidence and limits.

## What this pass delivers

- Routine dock buttons contain the existing icon and short action label. Ordinary cost/depth/safe-boarding paragraphs leave the buttons; meaningful warnings, free inspection, group choice and Undo remain.
- One new five-stop puzzle uses the familiar four-space ferry. Its question is where to leave a rescued neighbor safely while reaching another low landing in time.
- Nell is a real, recognizable two-space beaver, with consistent model, portrait and story appearance. Fern and Oat are two new rabbit neighbors; the earlier rescued cast remains safe.
- A brief illustrated connection introduces Nell after Bellwater. Existing two-cove completion saves can continue into it without losing progress.
- The slice ends honestly after the third rescue. The larger ferry and **Wide Berth** follow together in the next task.

## Package map

| File | Purpose |
| --- | --- |
| `NEXT_TASK_DRIFTWOOD_YARD.md` | The only current implementation task |
| `CODEX_PROMPT.txt` | Exact launch prompt |
| `contracts/COMPACT_CONTROLS.md` | Smaller buttons and information placement |
| `contracts/CAMPAIGN_CONTINUITY.md` | Save compatibility, entry, Practice and progression |
| `direction/NELL_AND_YARD.md` | Character, environment and authored scene |
| `design/DRIFTWOOD_PUZZLE.md` | Selected mechanical proposal and interpretation of its evidence |
| `design/` supporting data/proof files | Candidate rules and reducer evidence; not a finished renderable level |
| `verification/ACCEPTANCE.md` | Focused puzzle, integration and phone requirements |
| `review/REVIEW.md` | Current handoff review and limitations |
| `package-manifest.json` | File identities and package provenance |

The mechanical proof is a design check, not implementation of the new game content. Codex must author the actual level geometry, asset integration, UI and verification. The supporting contracts are not separately queued tasks.

Commit/push to `m1-first-crossing`, keep PR #1 draft and `main` unchanged. Return the exact final SHA, native phone evidence and both the root journey URL and direct Driftwood practice URL. Do not deploy automatically. The supplied private-Site publication history remains intact.
