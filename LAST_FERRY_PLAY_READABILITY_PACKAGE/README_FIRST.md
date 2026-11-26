# Last Ferry — play readability package

**Current task: PLAY_READABILITY_01**  
**Task file: NEXT_TASK_PLAY_READABILITY.md**

This package responds to the latest HUD, sailing, Harbor-story, shallow-water and campaign-difficulty feedback. It contains one implementation assignment and one revised campaign direction. Future coves are planning material, not extra implementation tasks.

## Where to put it

Extract the ZIP so this folder sits **inside the real Lastferry Git checkout, beside package.json**:

- Lastferry/package.json
- Lastferry/LAST_FERRY_PLAY_READABILITY_PACKAGE/README_FIRST.md
- Lastferry/LAST_FERRY_PLAY_READABILITY_PACKAGE/NEXT_TASK_PLAY_READABILITY.md
- Lastferry/LAST_FERRY_PLAY_READABILITY_PACKAGE/CODEX_PROMPT.txt

Keep the folder name. Do not scatter its files into the repository root or overwrite an older task with a similarly named file. Use the prompt in CODEX_PROMPT.txt; it names the complete relative task path.

## What Codex implements now

1. Replace the full-width HUD with separate controls and compact expandable information.
2. Make sailing one explicit local action, with optional details and visible inline consequences.
3. Make gameplay shallows visible through the water and seabed.
4. Recompose the Holding → Bellwater Harbor scene as one coherent group.
5. Update the campaign documents to record the revised direction and the user's negative Wide Berth difficulty feedback.

The implemented journey order, current level data, rules and saves stay intact during this pass. The proposed replacement C4 and delayed ferry launch are a later, separately scoped content change.

## Read in this order

- NEXT_TASK_PLAY_READABILITY.md — the implementation and acceptance contract.
- REVIEW_FINDINGS.md — what was actually found and why.
- CAMPAIGN_RECALIBRATION.md — the revised twelve-cove direction.
- baseline/REVIEW_BASELINE.json — identity, continuity and the pinned repository publication receipt.

## Current identity

- Reviewed runtime: 7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695.
- Later repository continuity HEAD observed: 52f72d6cdb1caa292425511394f4a11efa024a61.
- That later commit records publication; it does not change the reviewed runtime.
- Repository-recorded Site: private version 13, game 7ae1d8a, hosting c24aa6528675bc278de848e111ee73f9e22810ac.
- Continue from the current branch while preserving newer and unrelated work. Do not reset to the reviewed SHA.
- Commit/push to m1-first-crossing, keep PR #1 draft and main unchanged. This task does not deploy.

The review behind this package inspected exact source and the user's four screenshots. It did not run a fresh browser session, listen to audio or test a physical phone. Reported implementation checks remain reported checks.

## What happens next

After this readability pass, prototype one small four-space C4 with a distinct decision and let the user play it. Only integrate it into the campaign after that idea works. The larger ferry moves to the planned C5 → C6 threshold in the revised direction; the current runtime is not reordered by this package.
