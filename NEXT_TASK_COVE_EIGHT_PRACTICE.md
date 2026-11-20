# COVE_EIGHT_PRACTICE_01 — preserve the later rescue

## Outcome and authority

Author, prove and implement **one compact independent Practice candidate for intended Journey cove eight**. Its defining question is:

> Where must I leave this group, and what must the ferry accomplish before I can safely return for them?

On 15 November 2026 the user said, “Ill test on the next pass, lets continue.” This authorizes moving on while deferring the seven-cove Android playtest. It supersedes the earlier instruction to wait for that feedback before commissioning C8. The playtest remains pending; do not record acceptance that has not happened.

Work on `m1-first-crossing` in `EDLMGit/Lastferry`. The verified continuity baseline is `a49e07e901be7eb009c3538a77da5c7a799c71c0`; its reviewed game is `9c7a05785a021538c996f5dcd4b03415d1a35080`. Safely incorporate this task commit and any newer user work. Never reset to the baseline or force-push.

The existing runtime has **seven Journey coves and eight Practice entrances**. This pass adds a ninth Practice entrance only; the Journey still ends after Orchard. Codex implements and provides the identifiable handoff. ChatGPT reviews the candidate and handles publication separately. Choose routine authoring and implementation details without another permission round.

Read `AGENTS.md`, active `docs/PROJECT_STATE.md`, `docs/GAMEPLAY_RULES.md`, `docs/DIFFICULTY_AND_MASTERY.md`, current `campaign/PUZZLE_PROGRESSION.md` and `campaign/CAMPAIGN_DIRECTION.md`. Use `campaign/STORY_SCENES.md` for continuity only. Inspect `src/game/rules.ts`, `src/levels/level.ts`, the current Practice registry and mastery fallback, plus `reviews/orchard-difficulty/DESIGN.md`, its production audit, and the accepted Wide/Reef designs. Historical launch placement, four-space Orin and first-current teaching proposals are superseded by the current accepted runtime.

## 1. A distinct linked planning problem

Orchard already requires an early Harbor delivery that makes a later mixed load fit its only outward crossing. Its 12-action quay staging and 13-action return-to-origin approaches remain accepted. C8 must add a meaningful **location/access decision alongside its load/order decision**.

Build a small network in which the player has to preserve a later retrieval opportunity while fulfilling another obligation. A useful starting hypothesis is to place a group at a temporary landing, complete an early delivery or pickup, and return from the right side with a suitable load before a forecast change removes that opportunity. This describes the reasoning to author; it is not a proved layout or a mandatory action script.

The candidate must demonstrate all of these:

- An early legal choice changes which later retrieval or crossing remains possible.
- Temporary placement matters to the successful plan. Show what happens when the placement or relevant subset changes while the other sound part of the plan is retained.
- A second connected load, delivery-order or approach decision must be anticipated. Solving only one of the two decisions must not automatically solve the other.
- The consequence is understandable from visible passenger costs, passage depth/direction, landing elevation and the tide forecast.
- A genuinely different deliberate winning approach remains available. Distinguish it from harmless waits, symmetric swaps, split final unloading or pickup orders that merge before the consequential choice.

Use this concrete contrast in the design report: **what must the player infer here that Orchard did not already require?** Identify the two linked choices and their consequences in actual states. More actions, passengers, routes, losing branches or a large search graph are not evidence of greater human difficulty.

Choose the candidate's title, stable ID, compact layout, new neighbor names, exact numbers and timings through authoring and proof. Prefer the smallest arrangement that expresses the interaction. Do not pick an action-count goal first and pad a puzzle to reach it. Keep the final maps legible on a phone; no new species or bespoke scene is needed.

Prove the mechanical candidate before spending time on detailed scenery. Iterate the candidate's own data if the dependencies collapse or a straightforward bypass wins. Do not change accepted rules or old coves to rescue a weak design. If no sound candidate emerges within the existing contract, report the concrete failed premise and strongest remaining option honestly instead of presenting an unproved level as complete.

## 2. Use the established rules

Use the accepted six-space ferry and existing draft bands: empty load needs depth 1; loads 1–2 need 2; loads 3–4 need 3; loads 5–6 need 4. Reuse established passenger species and indivisible space costs.

Retain action-based time, nonempty subset boarding/unloading, the existing action-before-tide event order, flooding, previews, complete Undo and normal rescue objective. Inspection and thinking spend no actions.

The loader and return checks support **at most one current passage per cove**, with an explicit phase for every reachable tide level. Other passages remain ordinary bidirectional routes. Use that existing contract. Do not add a second current, independent current clocks, switches, locks, inventory, fuel, a timer, a new ferry upgrade or a new failure rule.

Keep sufficient information available with Tips Off. Reuse the current forecast and existing inspection/preview surfaces. Tips remain optional and default Off; they must not be required to discover a fact needed for the solution. Do not turn the developer proof into instructions or arithmetic permanently covering the map.

A legal early action can remove every winning continuation before the runtime reports a terminal failure. Document that distinction. Do not add runtime exhaustive solvability detection merely to end such a state earlier. The actual UI must remain honest and Undo must recover it.

## 3. Production-rule proof and useful freedom

Add a concise `reviews/cove-eight-practice/DESIGN.md`, reproducible audit and machine-readable results. Reuse the established audit approach; execute the production `legalActions` and reducer. Replay committed witnesses through the real Session as well. A second approximate simulator cannot establish the shipped puzzle's result.

The proof must establish:

| Claim | Required evidence |
| --- | --- |
| The rescue is possible and the minimum is known | Exact minimum and a replayable winning witness. A witness gives an upper bound; establish minimality by exhausting every shorter legal path with breadth-first search or equivalent complete evidence. Exhaust all continuations when claiming an early branch is unwinnable. |
| Both intended decisions matter | Record actual decision states, the later constrained states and the dependency between them. Use isolated branch comparisons or developer-only counterfactuals for each claimed dependency. |
| A tempting legal choice really fails | Identify the first choice that loses all winning continuations, exhaust those continuations, and show the later visible depth/load/direction/deadline conflict. Do not infer impossibility from one failed script. |
| There is meaningful strategic freedom | A second witness with a distinct placement, retrieval, approach or delivery plan. Explain its consequential difference and where it converges with the first. |
| Simple play does not bypass the puzzle | Check early all-aboard collection where legal, immediate Harbor shuttling, safe parking/waiting until the last tide, and ordinary-route detours. Report actual outcomes, including legitimate alternatives. |
| The claimed constraint causes the result | Relax the relevant location/access constraint and load/timing constraint separately in developer copies. Explain which previously failing plan becomes feasible or how the required transition changes. Keep these copies out of shipped level data. |
| Undo restores the decision | Execute the tempting branch, Undo to its actual earlier decision, choose the other plan and complete the rescue; preserve tide, locations, identities, outcome and attempt Undo history. |

Enumerate every legal passenger subset. Keep exact action time through the last authored change. If the graph merges later plateau states, explain why all future production transitions are then equivalent; retain passenger identity/location, boat location, outcome and all other rule-relevant fields. Do not silently truncate long recoveries or treat raw state/branch counts as a difficulty score.

Record the **proved minimum and proposed efficient target separately**. Choose the proposal after considering both meaningful winning approaches. State which qualify and why; do not automatically use the strict optimum or manufacture bad play to create a one-lantern example. No exact number is prescribed by this brief.

## 4. Practice integration and protected progress

Make the candidate reachable from Home → Practice and a stable direct `?cove=<candidate-id>` entrance. Keep all eight accepted entrances, their order/identities where applicable, and their existing bests. Practice stays independent of Journey, including the current completed-seven checkpoint and older supported records.

Use fresh neighbor identities from established species/appearances. Previously rescued named neighbors, including Orin, Pomme and Medlar, remain safe. A brief neutral cove description can establish the new place; do not author its Journey introduction in this pass.

Keep C8's proposed target in the developer design report until the candidate and scoring revision are reviewed and accepted, as required by `docs/DIFFICULTY_AND_MASTERY.md`. Use the existing unscored fallback for an entry without an accepted target; do not add it to the accepted mastery table or fabricate/overwrite an earned best. The rescue, ordinary arrival, Undo, Restart and navigation still work. Verify this missing-target path and keep any necessary compatibility change narrowly scoped.

**Known integration work from source review:** the core already returns no mastery result/best for an unscored cove, but two UI paths assume every Practice entry has a target. The Crossing menu in `src/main.ts` dereferences `masteryTargets[level.id].target`, and the all-cove table in `src/ui/lanterns.ts` dereferences it for every `practiceCoves` entry. Guard the candidate menu and filter the all-cove table to accepted scored entries so registering C8 cannot break Practice. Do not pass `undefined` to `masteryCriteriaMarkup` as an omission: that requests its global-table mode. Use concise wording such as “Playtest · no lantern rating” for the candidate, and omit candidate-only claims that leaving or restarting saves a lantern result. Keep the existing guarded normal victory card, action count and no-write behavior. This is a narrow compatibility repair, not a new scoring system.

Preserve the eight accepted targets/revisions, especially **`orchard-landing@1`, target 13**. Preserve provisional wins, actual result acceptance, successful-Undo tracking and storage-failure behavior for scored coves.

Do not append C8 to the Journey, change its save format/order or endpoint, write a migration, move Nell's launch, replay an already-rescued character's rescue, add the final supper or work on C9–C12. The intended twelve-cove arc remains unfinished.

## 5. Readable candidate in the actual game

Reuse the accepted ferry, docks, automatic seats, passenger models/portraits, warm arrival, lighthouse, water, released crests, sailing pace, audio and direct controls. Preserve portrait and landscape framing, Whole cove, pan, nearby previews and fullscreen behavior.

Fit the new layout to the existing presentation. Ensure routes clear land and supported docks; legal passenger groups fit visibly aboard and ashore; boarding/unloading paths meet the right landing. Inspect useful labels, current direction/forecast, tide heights and selection targets at native phone sizes. Important facts must remain readable when a transfer preview is open.

Reuse asset families first. If the candidate requires a new or modified family, update its catalog, gallery and provenance in the same change and run `npm run check:assets`. Do not broaden this into a global art, audio or layout pass.

## 6. Focused verification and evidence

Use Node 24. Run the production build, TypeScript, focused production-rule/witness/Undo checks and the affected Practice, mastery-fallback and layout checks. Reuse unchanged historical evidence; broaden testing only for a concrete shared regression.

Required coverage:

- Both winning witnesses; exact tide/direction boundaries; the two linked dependencies and tempting branch; preview/commit agreement, passenger conservation, tide Undo and terminal Undo/redelivery.
- One complete rescue through real controls in both **390×844 portrait** and **780×320 short landscape**. At least one complete route must use the minified production build. Exercise the second strategy through real controls in one of those runs.
- Actual recovery from the tempting mistake back to the early choice. Document whether the state is still playing or already terminal when recovered.
- Home and direct-URL Practice entrance, Restart and return navigation, candidate unscored arrival, and unchanged earned mastery for a representative accepted cove.
- Practice does not write or normalize representative in-progress/completed-seven Journey bytes; retain coverage of the existing completed-six continuation contract if a shared registry/progress edit affects it.
- A 320px portrait fit and desktop smoke view; one orientation/fullscreen or Settings interruption when the candidate exposes a concrete layout/lifecycle risk.

Retain representative native screenshots of the initial layout, consequential preview/staging choice, changed passage or retrieval problem, successful rescue and recovery. Use one uninterrupted actual-game recording with runtime audio through the existing capture pipeline, covering a meaningful decision and arrival. Keep evidence compact and source-identifiable; retain originals/failures and describe any edits or capture gaps honestly. A Windows-local path alone is not a remotely reviewable attachment.

Do not substitute injected victory state or a solver screenshot for real-interface play. If a tool/environment prevents a check, record exactly what remains unverified and give reproducible manual steps. Automated Chromium/emulation, source audits and signal measurements do not establish physical Android, human difficulty, listening or spoken screen-reader acceptance.

## 7. Handoff

Update `STATUS.md`, active `docs/PROJECT_STATE.md`, current campaign/progression status and the candidate review with what is actually implemented. Preserve prior tasks, reviews and publication receipts as history. Keep the distinction between **seven Journey coves** and **nine Practice entrances after this implementation** explicit.

Add `reviews/cove-eight-practice/REVIEW.md` with scope, design/proof links, exact source/build identity, commands and outcomes, native frames, actual-game recording, original failures and remaining limits. Include the minimum, proposed target, two strategy summaries and the specific reason the tempting branch fails. Human difficulty and Journey placement remain for the later playtest.

Commit and push normally to `m1-first-crossing`, verify the final remote SHA and update PR #1 while keeping it draft. Leave GitHub `main` unchanged. **Do not deploy or change Site access in the implementation handoff.** The reviewed Site remains version 20, game `9c7a05785a021538c996f5dcd4b03415d1a35080`, hosting source `ffc5eebfd8520735b231ffe6fedf1b3a54757f9a`, with its existing custom private audience.

Return the exact SHA and draft PR, concise design result, verification and limitations, review/evidence links, local root URL and candidate Practice URL. State whether any required proof or check is incomplete; do not call the candidate accepted or live merely because it was pushed.
