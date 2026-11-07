# REEF_RETURN_01 — make the way home matter

## Starting point

Reviewed game: `b64583dd295b488de013fb2d6db32e63ba79427e`, branch `m1-first-crossing`. Preserve newer or unrelated work; do not reset the checkout. Read this task, `AGENTS.md`, `docs/PROJECT_STATE.md`, `docs/GAMEPLAY_RULES.md` and `campaign/PUZZLE_PROGRESSION.md`, then inspect Wide Berth and Two Shelters.

The user likes Two Shelters. Preserve it. Wide Berth still feels visually disconnected and mechanically weak: all six passengers can reach High Quay by action 9, after which arbitrary waiting/shuttling remains harmless. This was reproduced through the production reducer. A static shallow reef alone does not fix that: rising tide increases clearance, and the deep detour remains open.

## Assignment

Develop a compact, attractive **successor to Wide Berth** where staging, loading and the return home form one satisfying planning problem. Expose it as an independent Practice candidate at `?cove=reef-return` for this pass. Keep the current Journey, chapter order, historical saves and existing level contracts intact. This candidate can earn a later campaign role; it is not automatically the next chapter.

Use a **readable tidal reef passage**. Prefer the campaign's already-planned current rule: a passage's permitted direction can change at an authored tide phase. High ground can remain safe while the opportunity to reach Harbor changes. Choose the topology, timing, passenger placement and solution yourself. The new constraint must create a real decision and survive attempts to bypass it through waiting, small repeat loads or an always-open deep detour.

Keep the game calm and fair. Thinking and animation consume no actions. No real-time race, separate current clock or arbitrary global turn cap. Show the reef, current direction and upcoming change before commitment, including with Motion reduced and Sound off. Movement, preview and forecast must agree. Preserve action-before-tide ordering and complete Undo. If a bad plan makes the return impossible, explain the consequence and provide useful Undo recovery rather than leaving an unexplained endless Wait state.

Bring back familiar animal variety with a compact **sheep–beaver–rabbit mix**. Replace passengers where useful instead of automatically increasing the crowd. Reuse existing species and stable appearances; use distinct neighbors rather than silently rescuing already-safe story characters again. The future deer is not part of this task.

Use Two Shelters and Holding as the visual standard. Make the larger ferry, animals, irregular islands, supported landings and readable reef feel like one cove. Keep the animals identifiable and the boat convincing in ordinary phone Play framing. Avoid oversized empty decks, broad platform strips or distant Overview shots as the main evidence. Preserve the accepted water, music, direct controls and arrival language.

## Finish

Make routine design and implementation decisions independently. No prescribed map, exact numbers, shader recipe or winning sequence is supplied. Rework the puzzle if the obvious collect-and-shuttle plan still removes its intended decision.

Verify the mechanic with the production rules: a successful plan, an attractive wrong plan, the last permitted/first blocked crossing, and Undo across the change. Exercise an actual rescue and recovery through the phone interface in portrait and short landscape, including mixed transfers and readable route feedback. Run relevant build, unit and asset checks; report remaining limits honestly. Tests establish correctness; the user's next playtest decides enjoyment.

Update project continuity, the implemented asset inventory and the publication history using the supplied receipt. Record Two Shelters' positive human gameplay feedback without claiming physical-device or final campaign approval.

Commit and push to `m1-first-crossing`, keep PR #1 draft and GitHub `main` unchanged. Do not deploy this new candidate automatically. Return its exact SHA, direct local Practice URL, concise design/review, representative native phone frames and one uninterrupted rescue with runtime audio.

