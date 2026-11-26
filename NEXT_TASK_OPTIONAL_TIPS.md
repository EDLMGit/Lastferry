# OPTIONAL_TIPS_01 — let the player do the planning

> **Completed and reviewed, 10 November 2026.** Runtime `f23e9b087e80316c3884ed5fa83cce25cf6508a0` implements this task and is published privately as Sites version 17. The current assignment is [JOURNEY_SIX_COVES_01](NEXT_TASK_JOURNEY_SIX_COVES.md). Preserve the Tips implementation; the original brief below records the completed scope.


## Current assignment

The player accepted the repaired ferry, docks and increasing puzzle complexity on 7 November 2026. Accepted runtime: `8fc0d35f772af73adf06a9dff112b749cbad233a`, published to the existing private Site as **version 16**. Preserve newer/unrelated work. Read this task, `AGENTS.md` and the active `docs/PROJECT_STATE.md` before editing.

Make the game's existing predictive advice optional. **Tips are Off by default**, including for existing players without a saved preference. Preserve the accepted puzzles, art, direct controls and campaign. This is a small interface task, not another difficulty or content pass.

## Player experience

Add a compact **Tips: Off / On** preference to the existing shared Settings, available through the established Home/play access. A short explanation may say “Show predicted outcomes and extra guidance.” Remember it separately from Journey progress; storage failure should leave a working in-session preference. Do not add a permanent tips panel, mandatory tutorial, hint ladder, walkthrough or new solver.

With Tips **Off**, let the player infer future strategy. Suppress unsolicited pre-action conclusions about remaining-trip capacity, eventual route cutoff, a stranded future load or the action ending the rescue. Apply this consistently to consequence prose, warning styles, map risk markers, tooltips, accessible announcements and labels such as “Sail anyway.” Include proactive comparisons of the proposed load against other outgoing passages; preserve the actual depth and blocked-action explanation when the player inspects or attempts that passage. Do not reveal the same prediction by forcing an otherwise direct single-passenger transfer into a confirmation dialog only because it predicts loss. Keep subset selection when there is an actual passenger choice.

With Tips **On**, expose the existing predictive help coherently. Reuse the current calculations; do not invent stronger certainty or a solution guide.

**Always retain the information needed to reason fairly:** the objective, passenger identities/space costs, current and selected resulting load/draft, action cost, current route depth/direction, true illegal-action reasons, visible tide/current schedules and pier deadlines. Optional inspection and factual forecasts remain accessible. Actual transaction feedback remains. After a committed mistake, explain what actually happened and offer complete Undo regardless of the Tips preference. Shared copy helpers must not accidentally remove the actual loss explanation.

Keep the optional How to play material. Adjust any promise that every losing move is automatically warned so it accurately describes the setting. Avoid reintroducing long explanations on compact action buttons.

## State and verification

Toggling Tips consumes no action, mutates no puzzle state or Journey save, and creates no Undo entry. Undo must not revert the preference. Reopening Settings, reload, restart and cove changes retain the chosen preference. Toggling Off, changing a subset or restoring a state must clear stale predictive text, styles and assistive announcements.

Use focused checks and actual phone UI evidence at equivalent decisions in both repaired coves: Off versus On; a legal losing choice followed by its explanation and Undo; a genuinely blocked move; and a mixed subset. Verify preference persistence and storage failure, keyboard/accessibility and portrait/short-landscape fit. Replay the same committed actions under both settings to establish identical gameplay outcomes. Run the relevant build/typecheck and unit coverage; broaden only for a concrete remaining risk.

## Finish

Add no cove, animal, rule, save migration or art redesign. Keep all seven Practice entries and the current Journey order. Update continuity and only genuinely affected existing asset records. Record original failures honestly and distinguish human/device checks from emulation.

Commit and push to `m1-first-crossing`, keep PR #1 draft and GitHub `main` unchanged. Do not automatically deploy the tips pass. Return the exact final SHA, concise review, matched phone examples and verification. Publication of the accepted baseline is recorded in `reviews/existing-coves-repair/deployment-confirmation.json`; preserve earlier receipts.
