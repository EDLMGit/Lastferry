# Puzzle progression — selected campaign direction

Original design baseline: `1a85874883af5caa59f6294a75495eccf2afebbc`, reviewed 2026-10-25. Current implementation slice: `DRIFTWOOD_YARD_01`, built forward from the reviewed Home/play game `da1f2686ce6aff8d754e13111447dabb6e1313f0`. **Holding Pier, Bellwater and Driftwood Yard are now authored playable campaign coves; First Crossing remains optional practice. Later encounters remain proposals.** Production witness/geometry checks and actual UI evidence are recorded in `reviews/driftwood-yard/`, separately from supplied design proof and human puzzle acceptance.

## Campaign sequence

The campaign targets twelve coves in four phases. Milestones follow C3, C6 and C9. This is a content target, not a measured playtime promise. First Crossing remains optional practice: placing it in the main sequence would repeat the rescue of Pip, Rue and Moss already completed in Holding.

| Phase / cove | Encounter | Intended decision and teaching role |
| --- | --- | --- |
| I · C1 | **Holding Pier** | Accepted introduction: trust a safe temporary landing, lighten the boat, rescue Pip/Rue and collect Moss. Preserve its puzzle. |
| I · C2 | **Bellwater** | Accepted route/deadline composition: consider the loaded return and two shore heights. Preserve its puzzle. |
| I · C3 | **Driftwood Yard** | Rescue **Nell, a beaver who uses 2 spaces**, using existing load, staging and tide rules. Her introduction adds character, not a special ability. Stage Nell at High Mooring to reach Fern and Oat before Reed Landing floods, then collect her through the newly deepened return. The larger spare boat is deferred to the next milestone. |
| II · C4 | **Wide Berth** | Enjoy the 6-space boat on forgiving deep water. Use familiar species with new named neighbors. Introduce only the boat and its load table. |
| II · C5 | **Orchard Landing** | Meet **Orin, a deer who uses 3 spaces** in a clear, generous encounter. Teach his space cost separately from current changes or a tight full-load bottleneck. |
| II · C6 | **Two Landings** | Combine known load choices, safe staging and the larger boat. A thoughtful subset or delivery order matters. No new rule. |
| III · C7 | **Tidal Gate** | Teach one clearly marked fixed one-way passage, with a legible ordinary return route and forgiving timing. |
| III · C8 | **Reed Narrows** | Forecast a direction reversal at a scheduled tide rise. The same current rule gains a temporal dependency. |
| III · C9 | **Drowned Orchard** | Revisit C5 geometry at changed water conditions with a **new waiting group**. Orin has already been rescued. Combine route memory, current and load. |
| IV · C10 | **Lantern Reach** | A quiet breather: a generous, readable plan and room to enjoy the journey. |
| IV · C11 | **Far Shore** | The strongest fair combination of established rules. No late mechanic, concealed exception or surprise deadline. |
| IV · C12 | **Last Ferry** | A short, gentle final rescue/return, followed by the communal ending. Difficulty has already peaked. |

Each encounter needs a distinct insight. More animals, nodes or actions do not establish greater difficulty. Keep maps small enough for phone orientation changes and cap simultaneous dependencies. A newcomer may matter through their story or familiar capacity rule; every species does not need a power.

Rescued characters remain rescued. Recurring helpers may appear at the refuge or take an explicitly framed later trip; do not silently strand them again. Additional named neighbors may reuse established species. Future appearances should use explicit stable character/appearance IDs: reordering a level's passenger list must not unexpectedly recolor a recurring character. Any extension preserves the current nine appearance mappings.

## The larger boat

After C3, the story makes a prepared **6-space spare boat** available. Its yellow-ferry identity remains familiar. This is one authored milestone, without purchases, currencies or a fleet-selection system. Replaying earlier coves retains their 4-space boat and original rules.

| Occupied spaces | Draft needed |
| ---: | ---: |
| 0 | 1 |
| 1–2 | 2 |
| 3–4 | 3 |
| 5–6 | 4 |

The benefit should be felt before its tradeoff. Wide Berth permits a satisfying larger delivery; later, loading 5–6 spaces can exclude a shallow shortcut that a lighter group can use. Empty and partial-load behavior stays familiar. Boat capacity is space cost, not the count of animal bodies.

This requires more than changing a number. Current production draft lookup has no band beyond 4, rejection/help copy includes fixed values, and world seating provides only three effective anchors: first rabbit, other rabbit and nonrabbit. Additional bodies would overlap. The larger-boat milestone must include:

- Complete, validated draft-band coverage and dynamic capacity/help/preview copy.
- A real hull/deck and deterministic automatic seating for every supported group. Seating remains presentation, not a new packing puzzle.
- Actual hull/passenger/transfer-path clearance in both travel directions and at every supported tide/load; required berths and passages must support draft 4.
- Correct deck attachment, embark/disembark paths, contact/wake origins and phone framing for that geometry.
- Preserved four-space behavior and evidence for **all three existing coves**, plus asset/inventory updates.

New species also require actual models, proportions, portraits, identity mapping and transfer/arrival behavior. The present animal factory renders any nonrabbit through its sheep branch; an unknown-species fallback is not a beaver or deer implementation. Their 2/3-space values reuse the existing load concept.

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

The first task creates the campaign opening, connective story scene and explicit progression/checkpoints around Holding/Bellwater. It does not implement this whole roadmap. Until further content exists, the playable slice ends honestly after Bellwater.

Campaign completion becomes durable on explicit **Continue** after a win; terminal Undo remains available before that boundary. Replaying/Undoing/redelivering must not duplicate milestones. Initial checkpoints may resume at the current cove's beginning, with that behavior stated clearly.

Before releasing the longer phone campaign, add full mid-puzzle restoration including gameplay state, complete Undo history and the corresponding presentation/boat-pose history. A restored position without heading history is not complete recovery. Test tab/background/reload and storage failure, and retain settings independently. Current cove-boundary checkpoints are implemented, including the narrowly recognized historical two-cove completion. Full mid-puzzle persistence remains deferred; this document does not claim it.

## Source grounding

- [Original finite-story brief](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/docs/PRODUCT_BRIEF.md)
- [Gameplay contract](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/docs/GAMEPLAY_RULES.md)
- [Production rules](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/src/game/rules.ts) and [session/Undo](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/src/game/session.ts)
- [Current world seating](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/src/scene/world.ts), [model factory](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/src/scene/models.ts) and [appearance resolver](https://github.com/EDLMGit/Lastferry/blob/1a85874883af5caa59f6294a75495eccf2afebbc/src/game/passenger-appearance.ts)
