# Last Ferry — illustrated story production

**One current task · prepared 27 October 2026**

This package turns the approved **Words and Light** illustration and captions into the real journey. It supplies the actual working reference and editable artwork, not only a prose description.

## Put the folder in the repository

Extract this ZIP **inside the checked-out `Lastferry` repository**, alongside its existing `src`, `campaign`, `docs` and `package.json`. The resulting task must be at:

`Lastferry/LAST_FERRY_STORY_PRODUCTION_PACKAGE/NEXT_TASK_STORY_PRODUCTION.md`

The reference must be at:

`Lastferry/LAST_FERRY_STORY_PRODUCTION_PACKAGE/reference/approved-opening.html`

Use the project's **Node 24** environment for implementation and verification.

Avoid an extra nested `LAST_FERRY_STORY_PRODUCTION_PACKAGE` folder. Do not paste the package beside the repository or overwrite the repository's `campaign` folder with it. Open Codex in the **Lastferry repository root**, then paste `CODEX_PROMPT.txt`. That prompt names the full relative path and asks Codex to report the resolved task and reference paths before continuing.

## What this task ships

- The three approved illustrated opening shots, with readable captions and player-paced advancement.
- One short Harbor connection using the same scene player.
- Quiet, finite story sound cues using the accepted game audio system.
- A small reusable scene definition, ownership rules and inventory entries for the content actually implemented.

The task includes the narration script and a future voice workflow. **No narration recording is supplied, and voice generation is not a completion dependency.** New coves, Nell, the larger ferry, Orin and currents remain later tasks.

## Read and preview

1. Open `reference/approved-opening.html` in a browser to see the accepted opening. It is a silent reference, not the game and not a deployment.
2. Read `NEXT_TASK_STORY_PRODUCTION.md` for the complete assignment and acceptance boundaries.
3. Give Codex the exact text in `CODEX_PROMPT.txt`.
4. After implementation, test the local game at its **root URL without `?cove=`** and return Codex's handoff for review.

## Package map

| File | Purpose |
| --- | --- |
| `NEXT_TASK_STORY_PRODUCTION.md` | The only executable current task |
| `CODEX_PROMPT.txt` | Exact launch prompt |
| `direction/STORY_PRESENTATION.md` | Approved visual and caption direction |
| `direction/SCENE_SCRIPT.md` | Four authored shots, captions and handoffs |
| `direction/AUDIO_PLAN.md` | Sound now; optional narration later |
| `architecture/SCENE_CONTRACT.md` | Reusable player and lifecycle boundaries |
| `direction/FUTURE_CHAPTERS.md` | Campaign extension plan, not current implementation scope |
| `assets/STORY_ASSET_PLAN.md` | Existing catalog integration and provenance |
| `audio/narration-script.json` | Recording-ready lines with absent assets explicitly marked |
| `reference/` | Approved browser reference, exact fragment and editable painter |
| `verification/ACCEPTANCE.md` | Focused technical, visual and audio checks |
| `review/BASELINE.md` | Reviewed source and deployment boundaries |
| `review/deployment-confirmation.json` | Existing publication receipt, unchanged |
| `review/source-audit.json` | Source and reference identities |
| `package-manifest.json` | File hashes for the package |

## Source and publication boundaries

Reviewed branch: `m1-first-crossing`, commit `6fc5a09dd4ef876ad96ad12d623532f0d13deb10`, [draft PR #1](https://github.com/EDLMGit/Lastferry/pull/1). Preserve newer or unrelated work; do not reset to this SHA.

The last confirmed publication receipt is Site version **12**, game `1a85874883af5caa59f6294a75495eccf2afebbc`. This package neither publishes nor updates the private Site. Codex should implement, verify, commit and push to the existing branch, keep PR #1 draft and leave `main` unchanged. Publication follows review.
