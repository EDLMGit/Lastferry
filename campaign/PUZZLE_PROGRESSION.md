# Puzzle progression — selected campaign direction

## Implemented six-cove progression

[JOURNEY_SIX_COVES_01](../NEXT_TASK_JOURNEY_SIX_COVES.md) connects Holding → Bellwater → Driftwood → Two Shelters → launch → Wide → Reef. The first four use the small ferry; the last two use the accepted larger ferry. Preserve all existing level data, rules and witnesses. No new difficulty design is required in this pass. Optional Tips is already implemented and published at game `f23e9b087e80316c3884ed5fa83cce25cf6508a0`, private Site version 17.

Two Shelters is the fourth Journey cove, Wide Berth the fifth and Reef Return the sixth. All seven Practice entries remain available. Explicit continuation from an old save resumes the first missing rescue by identity. The already-seen launch and any earlier Wide rescue keep their credit. The roadmap below records earlier planning for the twelve-cove target.

## Existing coves accepted · 7 November 2026

The prepared ferry's working variant serves Wide and Reef. It supports the same rule bands for every legal subset while preserving individual animal scale. Six-space seats, docks, launch art and gallery now depict the repaired family.

The former Wide puzzle started empty at Harbor. Its 13- and 14-action deliveries and its safe-quay waiting loop were valid under the rejected contract. The first Reef puzzle had a three-edge layout and two nine-action witnesses with the same route. Those records explain the 4 November correction. The accepted decision and witness sets are listed below.
The four-cove Journey runs Holding → Bellwater → Driftwood → Wide. First Crossing, Two Shelters and Reef Return are also available through Practice. Two Shelters received positive player feedback. The earlier six-space puzzles and their presentation were rejected; both existing coves have since been reworked at their original IDs. On 7 November the player accepted the repaired ferry/docks and increasing puzzle complexity. Accepted game `8fc0d35f772af73adf06a9dff112b749cbad233a` is published as private Site version 16. Preserve these puzzles. The subsequent Tips task implemented default-Off predictive help; it is reviewed and published in version 17. The current assignment connects these accepted coves into the Journey. [Current task](../NEXT_TASK_JOURNEY_SIX_COVES.md) · [Project state](../docs/PROJECT_STATE.md)

| Existing encounter | Planning decision | Why waiting or shuttling cannot remove it |
| --- | --- | --- |
| **Wide Berth**, Journey chapter 5 and Practice | Split eight spaces across two homeward opportunities. Decide which two spaces go first and whether to approach the second landing inshore or by Outer Buoy. | High Quay is safe. Beacon Reef reverses and the final trip holds six. |
| **Reef Return**, Journey chapter 6 and Practice | Decide at the first unloading whether to gather both rabbits through the shoal or deliver the heavier group first. | The four neighbors fit on the boat. That loaded boat cannot use the shallow alternative at high tide, and the outer landings flood. |

These puzzles share the larger ferry, existing movement rules and visible tide schedule. Wide asks how many spaces to reserve for each crossing. Reef asks which landing to approach from which side *after* an earlier loading choice. Both decisions use automatic seats and full in-session Undo. The production witnesses and alternative-plan checks belong in the developer reviews. [Wide decision](../reviews/existing-coves-repair/WIDE_DESIGN.md) · [Reef decision](../reviews/existing-coves-repair/REEF_DESIGN.md)

## Roadmap history and proposed twelve-cove arc

The target is a calm, finite campaign with demanding choices. The following roadmap predates this repair. Future locations, the eventual order and any launch relocation still require separate design and playtesting. The current Journey does launch the larger boat after Driftwood and does teach the current in Wide.
## Historical correction — 4 November 2026 (completed and accepted)

The instructions in this historical section describe the completed repair. The current task and acceptance above take precedence; do not reopen the old rejection or roadmap automatically.

Follow [EXISTING_COVES_REPAIR_01](../NEXT_TASK_EXISTING_COVES_REPAIR.md). The user rejects Wide Berth and Reef Return's current looks/difficulty and directs us to **fix both existing IDs**, with Wide first and a shared cute six-space ferry/dock redesign. Stop adding levels or successor Practice entries. Use the current mechanic already implemented in Reef Return to repair Wide now.

Preserve current Journey IDs/order, save history and accepted earlier puzzles/Two Shelters; do not freeze rejected level data or geometry. The older independent-successor, larger-hull preservation, mandatory C4 replacement and C7/C8-only current-teaching constraints are superseded for this repair. Twelve demanding, readable coves remain the target; their final ordering is provisional. The following roadmap records earlier planning, not an instruction to defer the user's requested fix. No new cove, campaign reorder or automatic deployment is part of this task.

**4 November 2026.** Two Shelters received positive player feedback and is published as private Site version 15. Reef Return tests the six-space ferry, temporary staging and one tide-dependent return passage in independent Practice. Wide Berth still occupies the fourth Journey slot. Reef Return and the proposed twelve-cove sequence await playtest and separate campaign decisions. [Reef Return review](../reviews/reef-return/REVIEW.md)

Previous implementation update — `TWO_SHELTERS_PROTOTYPE_01`: one independent Practice candidate is available at `?cove=two-shelters`. The original four-space ferry starts at Low Landing carrying Hazel (2) and Bracken (2); Mica (1) waits at Reed Pier. Tides rise after actions 4 and 9. Low Landing floods at the second rise; High Refuge remains safe. Both staging choices win, but low staging requires taking Mica home before retrieving both larger neighbors. Greedy mixed retrieval works from High Refuge and loses from Low Landing. Actual production-rule witnesses and alternatives are in [DESIGN](../reviews/two-shelters-prototype/DESIGN.md). The subsequent human gameplay feedback was positive. Campaign placement remains open. The current Journey, launch, strict saves and five earlier level contracts remain unchanged; no migration or deployment.

Recalibrated 1 November 2026 for `PLAY_READABILITY_01`, from reviewed runtime `7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695` and continuity `52f72d6cdb1caa292425511394f4a11efa024a61`. **Holding Pier, Bellwater, Driftwood Yard and Wide Berth remain the authored runtime campaign; First Crossing remains optional practice.** Holding, Bellwater and Driftwood gameplay are accepted. The user reports Wide Berth is too easy and not fun, so its mandatory campaign role is under revision. Its valid witnesses and physical/interface checks remain useful evidence; they do not overturn that difficulty feedback. The earlier C4 assignment was followed and the direction is being corrected.

## Campaign sequence

The revised target has twelve coves in four phases; the larger-ferry launch is proposed after explicit C5 completion, before C6. This is a content target, not a runtime reorder or measured playtime promise. First Crossing remains optional practice: placing it in the main sequence would repeat the rescue of Pip, Rue and Moss already completed in Holding. The player liked Two Shelters as a Practice puzzle. C4 placement is open. C5–C12 remain campaign proposals. Current Wide stays in the unchanged runtime Journey.

| Phase / cove | Encounter | Intended decision and teaching role |
| --- | --- | --- |
| I · C1 | **Holding Pier** | Accepted introduction: trust a safe temporary landing, lighten the boat, rescue Pip/Rue and collect Moss. Preserve its puzzle. |
| I · C2 | **Bellwater** | Accepted route/deadline composition: consider the loaded return and two shore heights. Preserve its puzzle. |
| I · C3 | **Driftwood Yard** | Accepted gameplay: stage **Nell, the two-space beaver**, at High Mooring to reach Fern and Oat, then retrieve her through the deepened return. The current runtime still launches the larger boat afterward; revised planning delays that event. |
| II · C4 | **Two Shelters — working title** | Proposed four-space replacement: choose a temporary landing and retrieval order that preserve the later rescue. Placement must create a distinct dependency beyond Driftwood's sole safe staging point. |
| II · C5 | **Orchard Landing** | Proposed four-space encounter with **Orin, a three-space deer**. Fit his cost into a useful plan before increasing capacity. |
| II · C6 | **Two Landings, preceded by the launch** | Proposed six-space introduction/application: choose mixed loads and when a lighter return is worth an extra trip. No new current rule. |
| III · C7 | **Tidal Gate** | Teach one clearly marked fixed one-way passage, with a legible ordinary return route and forgiving timing. |
| III · C8 | **Reed Narrows** | Forecast a direction reversal at a scheduled tide rise. The same current rule gains a temporal dependency. |
| III · C9 | **Drowned Orchard** | Revisit C5 geometry at changed water conditions with a **new waiting group**. Orin has already been rescued. Combine route memory, current and load. |
| IV · C10 | **Lantern Reach** | A quiet breather: a generous, readable plan and room to enjoy the journey. |
| IV · C11 | **Far Shore** | The strongest fair combination of established rules. No late mechanic, concealed exception or surprise deadline. |
| IV · C12 | **Last Ferry** | A short, gentle final rescue/return, followed by the communal ending. Difficulty has already peaked. |

Each encounter needs a distinct insight. More animals, nodes or actions do not establish greater difficulty. Keep maps small enough for phone orientation changes and cap simultaneous dependencies. A newcomer may matter through their story or familiar capacity rule; every species does not need a power.

Rescued characters remain rescued. Recurring helpers may appear at the refuge or take an explicitly framed later trip; do not silently strand them again. Additional named neighbors may reuse established species. Future appearances should use explicit stable character/appearance IDs: reordering a level's passenger list must not unexpectedly recolor a recurring character. Any extension preserves all existing appearance mappings. Wide Berth uses explicit sheep/rabbit appearances for six new neighbors.

## Proposed C4: Two Shelters

The planning question is **“Which temporary landing keeps the later rescue possible?”** Use the original four-space ferry and three or four bodies from established species, with familiar draft, route depth and local flooding. Introduce no new species, current rule, inventory or scoring system.

The staging location and subsequent retrieval order must interact. A convenient shelter can impose a later cost while another preserves a useful approach. Simply leaving the heavy passenger at the only safe pier repeats Driftwood. Show all waiting passengers and relevant shore/return-path differences through the world, inspection and forecast; no concealed later objective or unforecastable punishment.

The original brief specified no map, tide schedule or witness. The current candidate authors those values with existing finished assets and its own Practice entrance; see the implementation update and DESIGN above. Prove a rescue through the production reducer, inspect a plausible losing/blocked alternative and useful Undo recovery, and test whether routine earliest-group collection plus the obvious return bypasses the intended reasoning. If it does, revise or discard the candidate. Prove multiple strategies only when the design makes that claim. User playtest must establish clarity, distinctness and satisfaction before additional art or a chapter scene is commissioned.

## The larger boat: implemented capability, revised planned placement

The runtime currently makes the prepared **6-space spare boat** available after C3. Keep that trigger, hull, seating, transfers and launch intact for reuse. The revised plan delays launch until explicit C5 completion, before C6, while Nell and the safe neighbors prepare her already-built boat at home. No construction timer, purchases, currency or fleet-selection system is introduced. Orin fits the original ferry; three-, two- and one-space neighbors filling six spaces illustrates useful mixed capacity, not a proven C6 puzzle. Earlier coves retain their four-space boat and original rules.

| Occupied spaces | Draft needed |
| ---: | ---: |
| 0 | 1 |
| 1–2 | 2 |
| 3–4 | 3 |
| 5–6 | 4 |

Current Wide Berth starts empty at Harbor; its first full pickup carries six spaces/four bodies. Draft four excludes the shorter Harbor route even after the first rise. Full deep delivery and staged rescue are valid routes, but the simple collect/deep-return/deliver/repeat plan can bypass the intended insight. The user rejected its difficulty. More passengers and routes did not establish a stronger decision than Driftwood. Retain Wide in the current runtime until a separate integration task; the later direction is an optional development/Practice prototype, not a promised mandatory slot. Empty/partial-load behavior and the distinction between spaces and bodies remain unchanged.

Wide Berth and Reef Return select the larger hull, automatic passenger seats, transfer and wake geometry, and four draft bands through their level data. Original coves and gallery default callers retain their smaller profile. Capacity is the entire loading rule; seating adds no packing interaction. The roster includes two sheep and four rabbits, eight total required spaces, with a reachable five-body/six-space load and six neighbors safely waiting at High Quay. Every capacity-legal subset needs valid presentation.

Developer witnesses cover the full deep route (13 actions), staging both sheep and returning four rabbits by the depth-three shortcut (14), five bodies/six spaces with harmless waits after both endangered landings are clear (17), and two recoverable opening Waits (16). These are proof observations, not player targets, a global limit, measured playtime or an automatic difficulty claim. Preserve preview/current-water validation and action → increment → rise → loss → win ordering.

Current Nell has a real beaver model and portrait. Future Orin still requires his own actual deer model, proportions, portrait, stable identity and transfer/arrival coverage; a generic nonrabbit fallback is not completion.

## One bounded current rule

An ordinary passage is bidirectional. A current passage permits travel from one authored endpoint at each reachable tide stage. C7 repeats one direction across its stages; C8 changes it. There is no independent current clock.

Reef Return authors this passage in its level data. The omitted waypoints describe its physical course.

```json
{
  "id": "needle-reef",
  "nodes": ["quay", "harbor"],
  "baseDepth": 3,
  "bidirectional": false,
  "current": {
    "name": "Needle Reef",
    "phases": [
      { "tideLevel": 0, "from": "harbor", "to": "quay" },
      { "tideLevel": 1, "from": "quay", "to": "harbor" },
      { "tideLevel": 2, "from": "harbor", "to": "quay" }
    ]
  }
}
```

Author/validate all reachable stages, including the final plateau after the last rise; endpoint IDs must belong to that edge. Missing coverage must not silently grant bidirectional travel. Existing levels omit the field and retain current behavior. Undirected adjacency identifies the inspected passage even when its current prevents travel.

Keep topology lookup separate from permission so blocked passages remain inspectable. A shared passage-status calculation should supply validation, preview, route arrows, accessible copy and forecast.

1. Validate direction, edge depth and destination berth against the **current** state.
2. Save the complete Undo snapshot and apply one legal move across one edge.
3. Increment the turn, apply any scheduled tide rise, then derive the new current direction.
4. Check for stranded passengers at flooded piers, then check delivery for victory. If the rescue is still underway in a cove with a current, each remaining neighbor also needs a reachable trip home through the remaining directions.

A move against today's current cannot anticipate the reversal after that action. Rejection changes no turn, history or position. Every permitted edge still costs one action. **No automatic movement, drift while thinking, multi-turn crossing or speed-based action cost.** Wait is the explicit way to reach a scheduled change. Undo restores tide and therefore direction, with presentation reconstructed consistently.

Show direction through stable arrows/text and restrained water streaks. It remains readable with motion reduced and sound muted. Forecast the post-action change before commitment; visual particles never determine legality.

## Pressure and encounter acceptance

An occupied pier can flood. A safe pier can also lose its last route home. In Reef Return the tide determines which direction the ferry can cross. Once everyone reaches the Harbor side, the player can wait and unload at leisure. A longer animation, caption, music phrase or thinking pause never consumes a turn.

Before accepting any future encounter:

1. **Name its decision.** Describe the intended insight and at least two readable choices whose consequences the player can inspect.
2. **Author the exact contract.** Graph, clearances, depths, boat, passenger costs/locations, pier elevations, tide/current schedule and required delivery IDs belong in level data.
3. **Prove a witness.** Replay a successful route through the production reducer. Where the design claims multiple meaningful plans, prove those specific claims; do not add strategies merely to increase the report. Distinguish witness length from proven minimum moves or difficulty.
4. **Explain the temptation.** Record an understandable losing/blocked alternative, its correct preview and recovery through Undo. Verify tide-boundary boarding, terminal Undo and conservation of passenger identity.
5. **Inspect the actual game.** Complete a real rescue, inspect loaded return choices and check phone portrait/landscape fit, animal separation, route clearance, warnings and reachable controls.
6. **Playtest the insight.** The user's comprehension and satisfaction decide whether the puzzle earns its place. Solver success and screenshots do not establish fun. Preserve failures and limitations honestly.

If using reachability search, document its bounds. After the last scheduled change, mechanically equivalent states may normalize the turn so endless harmless Wait does not inflate the search. Do not invent precise difficulty ratings or playtime from action counts.

## Implementation boundaries and saves

The foundation first implemented Holding/Bellwater. The current four-cove slice still ends honestly after Wide Berth with “Four coves are safe.” `PLAY_READABILITY_01` preserves every current level JSON, the reducer, registry, launch trigger and strict ordered checkpoint semantics. Two Shelters is now independent Practice only. Orin, revised campaign placement/launch and the remaining roadmap are future content.

After C4 earns its place through playtest, use a separately scoped route/save revision. Pending-launch, active-Wide and completed-four-cove version-1 records depend on the existing ordered prefixes. Preserve their original data and recognized C1–C3 completion; retain old Wide completion as history without pretending the new C4 was rescued. Previously seeing the launch cannot grant later completion. Explain the revised continuation point in a brief honest notice. Home, Options and Practice must not silently rewrite progress; unknown/malformed data remains recoverable. Define exact mappings once replacement content and route are settled, without implementing a migration framework here.

Campaign completion becomes durable on explicit **Continue** after a win; terminal Undo remains available before that boundary. Replaying/Undoing/redelivering must not duplicate milestones. Initial checkpoints may resume at the current cove's beginning, with that behavior stated clearly.

Before releasing the longer phone campaign, add full mid-puzzle restoration including gameplay state, complete Undo history and the corresponding presentation/boat-pose history. A restored position without heading history is not complete recovery. Test tab/background/reload and storage failure, and retain settings independently. Current cove-boundary checkpoints are implemented, including only the two exact historical two-cove/three-cove completions. Home/Options/Practice remain byte-preserving; deliberate Continue saves the correct pending scene and plays fresh, while later pending reloads use recap. Earlier boundaries never display a future Wide Berth rescue. Full mid-puzzle persistence remains deferred; this document does not claim it.

## Source grounding

- [Current recalibration and unproven C4 brief](../LAST_FERRY_PLAY_READABILITY_PACKAGE/CAMPAIGN_RECALIBRATION.md), [review findings](../LAST_FERRY_PLAY_READABILITY_PACKAGE/REVIEW_FINDINGS.md) and [task scope](../LAST_FERRY_PLAY_READABILITY_PACKAGE/NEXT_TASK_PLAY_READABILITY.md)

- [Original finite-story brief](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/docs/PRODUCT_BRIEF.md)
- [Gameplay contract](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/docs/GAMEPLAY_RULES.md)
- [Production rules](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/src/game/rules.ts) and [session/Undo](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/src/game/session.ts)
- [Current world seating](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/src/scene/world.ts), [model factory](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/src/scene/models.ts) and [appearance resolver](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/src/game/passenger-appearance.ts)
