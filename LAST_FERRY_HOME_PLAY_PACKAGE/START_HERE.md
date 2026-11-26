# Last Ferry — Home, Play and direct actions

**Revised package · 30 October 2026 UTC · one current task**

This replaces the unused `LAST_FERRY_FLOW_AND_FEEDBACK_PACKAGE` assignment. The user has not started either of its two tasks. Do not run those old prompts or wait for a Task 01 commit that does not exist.

The new task brings the whole entry experience together:

**Home → Play → automatic illustrated opening → Take the helm → direct passenger actions.**

The current task is **`NEXT_TASK_HOME_PLAY_FLOW.md`**, task ID **`HOME_PLAY_FLOW_01`**. It includes Home, automatic story playback, music investigation and the easier Board / Let ashore / Bring home interaction. These are internal implementation stages of one assignment. Complete them all before the final handoff.

## Install the package

Extract this folder inside the existing `Lastferry` repository, next to `src`, `docs`, `campaign` and `package.json`. The task must resolve to:

`Lastferry/LAST_FERRY_HOME_PLAY_PACKAGE/NEXT_TASK_HOME_PLAY_FLOW.md`

Open Codex in the repository root and paste **`CODEX_PROMPT.txt`**. It names the full relative path and asks Codex to confirm which task it located in its first progress update, then continue independently.

Use Node 24. The reviewed baseline remains `d532c62f0f25854387869466572a1ed0cf35a0ac`; preserve any newer or unrelated work. GitHub PR #1 was checked again on 30 October UTC and still points to that commit on `m1-first-crossing`, open and draft.

## What the finished pass should feel like

- A proper full-screen Home composed around the existing luminous water, ferry, islands and warm lighthouse.
- A prominent **Play** for a fresh journey, or **Continue** for existing progress, with **Options**, **Practice** and clear Sound access.
- Play starts the illustrated story and the existing sound intent from one deliberate input. The opening flows automatically; the final picture waits for Take the helm.
- One passenger can board, go ashore or come home through one named action. Several passengers use a compact nearby chooser.
- A small themed receipt confirms the accepted action and actual change in required boat depth. Warnings and action cost stay available before commitment.

## Files

| File | Purpose |
| --- | --- |
| `NEXT_TASK_HOME_PLAY_FLOW.md` | The only executable current task |
| `CODEX_PROMPT.txt` | Exact launch prompt |
| `direction/HOME_SCREEN.md` | Home composition, visual language and background asset ownership |
| `contracts/ENTRY_AND_STATE.md` | Play, Continue, saves, Practice, Options, fullscreen and input ownership |
| `contracts/STORY_AND_SOUND.md` | Automatic story, pause/cancellation and the unresolved music investigation |
| `contracts/DIRECT_TRANSFERS.md` | Direct passenger actions, compact subset choice and result feedback |
| `verification/ACCEPTANCE.md` | Integrated real-game and phone checks |
| `review/BASELINE.md` | Current source, supersession and review boundaries |
| `review/PREVIOUS_REVIEW_D532.md` | The previous source/audio/UI review, retained with its original date and limits |
| `review/deployment-confirmation.json` | Existing publication receipt, copied without changes |
| `package-manifest.json` | File identities |

The contracts are supporting documents, not additional separately queued tasks. There is one prompt to run.

## Handoff and publication

Codex should complete the task, verify it, commit/push to `m1-first-crossing` and update draft PR #1. `main` stays unchanged. It must return an actual local root URL **without `?cove=`**, so the Home screen is visible.

No automatic deployment is included. The last confirmed receipt remains private Site version 12, game `1a85874883af5caa59f6294a75495eccf2afebbc`. A completed GitHub push is not a new publication.
