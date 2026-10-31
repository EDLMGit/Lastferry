# Puzzle progression — selected campaign direction

Original design baseline: `1a85874883af5caa59f6294a75495eccf2afebbc`. Current milestone `WIDE_BERTH_01` builds from reviewed `7e324e88827857469bf348fca311548344d03da6`. **Holding Pier, Bellwater, Driftwood Yard and Wide Berth are authored playable campaign coves; First Crossing remains optional practice.** The user accepted Driftwood gameplay. Wide Berth deliberately revises the former gentle C4 introduction to a six-space benefit followed by a meaningful planning choice. Production proof, real geometry, actual UI evidence and human calibration remain separate in `reviews/wide-berth/`.

## Campaign sequence

The campaign targets twelve coves in four phases. Milestones follow C3, C6 and C9. This is a content target, not a measured playtime promise. First Crossing remains optional practice: placing it in the main sequence would repeat the rescue of Pip, Rue and Moss already completed in Holding.

| Phase / cove | Encounter | Intended decision and teaching role |
| --- | --- | --- |
| I · C1 | **Holding Pier** | Accepted introduction: trust a safe temporary landing, lighten the boat, rescue Pip/Rue and collect Moss. Preserve its puzzle. |
| I · C2 | **Bellwater** | Accepted route/deadline composition: consider the loaded return and two shore heights. Preserve its puzzle. |
| I · C3 | **Driftwood Yard** | Rescue **Nell, a beaver who uses 2 spaces**, using existing load, staging and tide rules. Her introduction adds character, not a special ability. Stage Nell at High Mooring to reach Fern and Oat before Reed Landing floods, then collect her through the newly deepened return. The following launch now introduces the prepared larger ferry. |
| II · C4 | **Wide Berth** | Carry six spaces, then compare full deep delivery before a late low-pair rescue against safe sheep staging and a lighter shortcut that rescues the pair earlier. Two occupied flood boundaries and draft four make route/load choice consequential. |
| II · C5 | **Orchard Landing** | Meet **Orin, a deer who uses 3 spaces** in a clear, generous encounter. Teach his space cost separately from current changes or a tight full-load bottleneck. |
| II · C6 | **Two Landings** | Combine known load choices, safe staging and the larger boat. A thoughtful subset or delivery order matters. No new rule. |
| III · C7 | **Tidal Gate** | Teach one clearly marked fixed one-way passage, with a legible ordinary return route and forgiving timing. |
| III · C8 | **Reed Narrows** | Forecast a direction reversal at a scheduled tide rise. The same current rule gains a temporal dependency. |
| III · C9 | **Drowned Orchard** | Revisit C5 geometry at changed water conditions with a **new waiting group**. Orin has already been rescued. Combine route memory, current and load. |
| IV · C10 | **Lantern Reach** | A quiet breather: a generous, readable plan and room to enjoy the journey. |
| IV · C11 | **Far Shore** | The strongest fair combination of established rules. No late mechanic, concealed exception or surprise deadline. |
| IV · C12 | **Last Ferry** | A short, gentle final rescue/return, followed by the communal ending. Difficulty has already peaked. |

Each encounter needs a distinct insight. More animals, nodes or actions do not establish greater difficulty. Keep maps small enough for phone orientation changes and cap simultaneous dependencies. A newcomer may matter through their story or familiar capacity rule; every species does not need a power.

Rescued characters remain rescued. Recurring helpers may appear at the refuge or take an explicitly framed later trip; do not silently strand them again. Additional named neighbors may reuse established species. Future appearances should use explicit stable character/appearance IDs: reordering a level's passenger list must not unexpectedly recolor a recurring character. Any extension preserves all existing appearance mappings. Wide Berth uses explicit sheep/rabbit appearances for six new neighbors.

## The larger boat

After C3, the story makes a prepared **6-space spare boat** available. Its yellow-ferry identity remains familiar. This is one authored milestone, without purchases, currencies or a fleet-selection system. Replaying earlier coves retains their 4-space boat and original rules.

| Occupied spaces | Draft needed |
| ---: | ---: |
| 0 | 1 |
| 1–2 | 2 |
| 3–4 | 3 |
| 5–6 | 4 |

The benefit is felt before its tradeoff. Wide Berth starts empty at Harbor; its first full pickup carries six spaces/four bodies. Draft four then excludes the shorter Harbor route even after the first rise. The full deep delivery and earlier staged rescue remain valid distinct critical plans. Empty and partial-load behavior stays familiar. Boat capacity is space cost, not the count of animal bodies.

The production profile is selected by active-level data: only Wide Berth uses the actual larger hull/deck, automatic identity-stable seating, transfer/berth/wake geometry and its four draft bands. Original coves and gallery default callers retain their smaller profile. Capacity is the entire loading rule; seating adds no packing interaction. The roster includes two sheep and four rabbits, eight total required spaces, with a reachable five-body/six-space load and six neighbors safely waiting at High Quay. Every capacity-legal subset needs valid presentation.

Developer witnesses cover the full deep route (13 actions), staging both sheep and returning four rabbits by the depth-three shortcut (14), five bodies/six spaces with harmless waits after both endangered landings are clear (17), and two recoverable opening Waits (16). These are proof observations, not player targets, a global limit, measured playtime or an automatic difficulty claim. Preserve preview/current-water validation and action → increment → rise → loss → win ordering.

Current Nell has a real beaver model and portrait. Future Orin still requires his own actual deer model, proportions, portrait, stable identity and transfer/arrival coverage; a generic nonrabbit fallback is not completion.

## One bounded current rule

An ordinary passage is bidirectional. A current passage permits travel from one authored endpoint at each reachable tide stage. C7 repeats one direction across its stages; C8 changes it. There is no independent current clock.

Illustrative future data contract:

```json
{
  "id": "tidal-channel",
  "nodes": ["mouth", "inner-buoy"],
  "travelByTide": [
    { "tideLevel": 0, "fromNodeId": "mouth" },
    { "tideLevel": 1, "fromNodeId": "inner-buoy" },
    { "tideLevel": 2, "fromNodeId": "inner-buoy" }
  ]
}
```

Author/validate all reachable stages, including the final plateau after the last rise; endpoint IDs must belong to that edge. Missing coverage must not silently grant bidirectional travel. Existing levels omit the field and retain current behavior. Today `edgeTo()` ignores the JSON bidirectional flag, so a data flag alone cannot implement this rule.

Keep topology lookup separate from permission so blocked passages remain inspectable. A shared passage-status calculation should supply validation, preview, route arrows, accessible copy and forecast.

1. Validate direction, edge depth and destination berth against the **current** state.
2. Save the complete Undo snapshot and apply one legal move across one edge.
3. Increment the turn, apply any scheduled tide rise, then derive the new current direction.
4. Check flooded waiting passengers, then victory, using existing event order.

A move against today's current cannot anticipate the reversal after that action. Rejection changes no turn, history or position. Every permitted edge still costs one action. **No automatic movement, drift while thinking, multi-turn crossing or speed-based action cost.** Wait is the explicit way to reach a scheduled change. Undo restores tide and therefore direction, with presentation reconstructed consistently.

Show direction through stable arrows/text and restrained water streaks. It remains readable with motion reduced and sound muted. Forecast the post-action change before commitment; visual particles never determine legality.

## Pressure and encounter acceptance

There is **no global action budget**, real-time countdown or musical deadline. Only a required passenger still waiting on an occupied pier is endangered by that pier's scheduled flooding. Once everyone is aboard or delivered, harmless longer play remains legal. A longer animation, caption, music phrase or thinking pause never consumes a turn.

Before accepting any future encounter:

1. **Name its decision.** Describe the intended insight and at least two readable choices whose consequences the player can inspect.
2. **Author the exact contract.** Graph, clearances, depths, boat, passenger costs/locations, pier elevations, tide/current schedule and required delivery IDs belong in level data.
3. **Prove a witness.** Replay a successful route through the production reducer; add a meaningfully different successful plan where feasible. Distinguish witness length from proven minimum moves or difficulty.
4. **Explain the temptation.** Record an understandable losing/blocked alternative, its correct preview and recovery through Undo. Verify tide-boundary boarding, terminal Undo and conservation of passenger identity.
5. **Inspect the actual game.** Complete a real rescue, inspect loaded return choices and check phone portrait/landscape fit, animal separation, route clearance, warnings and reachable controls.
6. **Playtest the insight.** The user's comprehension and satisfaction decide whether the puzzle earns its place. Solver success and screenshots do not establish fun. Preserve failures and limitations honestly.

If using reachability search, document its bounds. After the last scheduled change, mechanically equivalent states may normalize the turn so endless harmless Wait does not inflate the search. Do not invent precise difficulty ratings or playtime from action counts.

## Implementation boundaries and saves

The foundation first implemented Holding/Bellwater. The current four-cove slice now ends honestly after Wide Berth with “Four coves are safe.” The remaining campaign roadmap is still future content.

Campaign completion becomes durable on explicit **Continue** after a win; terminal Undo remains available before that boundary. Replaying/Undoing/redelivering must not duplicate milestones. Initial checkpoints may resume at the current cove's beginning, with that behavior stated clearly.

Before releasing the longer phone campaign, add full mid-puzzle restoration including gameplay state, complete Undo history and the corresponding presentation/boat-pose history. A restored position without heading history is not complete recovery. Test tab/background/reload and storage failure, and retain settings independently. Current cove-boundary checkpoints are implemented, including only the two exact historical two-cove/three-cove completions. Home/Options/Practice remain byte-preserving; deliberate Continue saves the correct pending scene and plays fresh, while later pending reloads use recap. Earlier boundaries never display a future Wide Berth rescue. Full mid-puzzle persistence remains deferred; this document does not claim it.

## Source grounding

- [Original finite-story brief](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/docs/PRODUCT_BRIEF.md)
- [Gameplay contract](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/docs/GAMEPLAY_RULES.md)
- [Production rules](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/src/game/rules.ts) and [session/Undo](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/src/game/session.ts)
- [Current world seating](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/src/scene/world.ts), [model factory](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/src/scene/models.ts) and [appearance resolver](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/src/game/passenger-appearance.ts)
