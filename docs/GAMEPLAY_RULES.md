# Last Ferry: M1 gameplay rules

**Status: gameplay contract.** The playable application implements these rules independently of the reference validator. First Crossing's exact values remain below; later coves own their layouts and starting arrangements in separate level JSON files.

The first cove is a short, forgiving introduction to loading, route depth, and changing tides. Its three successful witness routes require seven, seven, and eight committed actions. These counts do not establish playtime, difficulty, or replay value.

## Start, win, and loss

Load `data/first-crossing.level.json`. Start at node `cut`, on turn **0**, at tide level **0**. `rabbit-1` and `rabbit-2` are aboard. `sheep-1` waits at `sheep-pier`. No one has been delivered.

Win when all three required passengers have been **unloaded at `harbor-pier`**. Reaching the harbor does not automatically unload them. A delivered passenger has left the puzzle and cannot be boarded again.

Lose when a tide rise reaches a pier where a required passenger is still waiting. Stop the puzzle and offer Undo and Restart. Show a clear, gentle explanation such as “The tide reached a waiting passenger. Undo a turn.” No drowning animation is needed.

There is no additional move limit, real-time countdown, fuel meter, score target, or automatic failure after turn 8. Once every passenger has left the low pier, waiting and taking a longer route remain legal. The tide stops rising at level 2. Boarding/unloading at a flooded pier is prohibited, but an afloat boat may leave its deep berth normally.

## Load and draft

The ferry has **four passenger slots**. A rabbit uses one slot; a sheep uses two. Occupied slots are the entire load calculation. There is no separate mass, cargo grid, animal mood, or inventory system.

| Occupied slots | Boat draft | Example                          |
| -------------- | ---------: | -------------------------------- |
| 0              |          1 | Empty ferry                      |
| 1–2            |          2 | One sheep, or two rabbits        |
| 3–4            |          3 | One sheep and one or two rabbits |

A route is usable when its current depth is **greater than or equal to** the boat's draft. Equality is safe. A maximum-load boat has draft 3; it is afloat at every authored stopping node even at the initial tide.

The rules use integer depth units. A renderer may group depths of 3 or more into the same “deep” visual band, but the actual depth remains `baseDepth + tideLevel`; it is not numerically capped.

## Actions

Every valid action below costs exactly **one turn**. A selection is a set of distinct passenger IDs, not a count or a species name.

| Action | Payload                                               | Preconditions                                                                                                                          | Immediate effect                                                                                        |
| ------ | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Move   | `{ "type": "move", "to": "node-id" }`                 | Destination is a different adjacent node; the connecting edge and destination basin support the current draft at the current tide.     | Move to that node along the edge's authored waypoints.                                                  |
| Board  | `{ "type": "board", "passengerIds": ["id", "..."] }`  | At a dry pier; selected nonempty subset waits at that exact pier; resulting load is at most 4; the berth supports the resulting draft. | Transfer the whole selection from the pier to the boat.                                                 |
| Unload | `{ "type": "unload", "passengerIds": ["id", "..."] }` | At a dry pier; selected nonempty subset is aboard.                                                                                     | At the harbor, mark selected passengers delivered. At another pier, make them waiting passengers there. |
| Wait   | `{ "type": "wait" }`                                  | Puzzle is playing.                                                                                                                     | Leave boat and passenger locations unchanged.                                                           |

Boarding three selected passengers together costs one turn, just as boarding one passenger does. Unloading a selected subset also costs one turn. Boarding and unloading cannot be combined into one action.

Moving consumes one turn **per graph edge**, regardless of the edge's visual length or animation duration. There is no free steering, diagonal movement, automatic boarding, automatic unloading, or automatic wait. Flooding scenery does not create edges beyond those in the level data.

## Tide and pier elevation

The same tide level controls both route depth and pier flooding:

```text
routeDepth = route.baseDepth + tideLevel
basinDepth = node.baseDepth + tideLevel
pierIsDry = tideLevel < pier.elevation
```

| Completed committed turns | Tide level | Shallow routes, base 2 | Deep routes/basins, base 3 | Sheep pier, elevation 2 | Harbor, elevation 3 |
| ------------------------- | ---------: | ---------------------: | -------------------------: | ----------------------- | ------------------- |
| 0–3                       |          0 |                      2 |                          3 | Dry                     | Dry                 |
| 4–7                       |          1 |                      3 |                          4 | Dry                     | Dry                 |
| 8 and later               |          2 |                      4 |                          5 | Flooded                 | Dry                 |

The rises happen **after committed turns 4 and 8**. A pier is flooded at equality with its elevation. The low island and its pier both have elevation 2; the lighthouse refuge and harbor pier both have elevation 3. No independent flood timer or visual water-height measurement decides whether an animal is safe.

All six stopping basins have base depth 3. Boarding the sheep can close a shallow outgoing route; it cannot ground the boat in its berth. The four-edge outer detour has base depth 3 throughout and supports a full boat at every tide.

## Atomic action order

Resolve each committed action as one transaction:

1. Validate the action against the **current** state, including current tide, draft, pier dryness, passenger locations, and terminal status. If invalid, stop without changing anything.
2. Save the complete pre-action gameplay state for Undo.
3. Apply the complete movement, boarding, unloading, or wait action using that current state.
4. Increment the committed-action turn counter by one.
5. Apply a scheduled rise if the new turn has reached its threshold. Recompute route and basin depths and pier dryness from the new tide level.
6. If a required passenger is waiting at a flooded pier, mark the puzzle lost.
7. Otherwise, if every required passenger has been delivered to the harbor, mark it won. Otherwise keep playing.
8. Present the transaction and its resulting state. Animation duration does not advance time or trigger additional gameplay events.

**First-rise boundary:** a full boat at `sheep-pier` on turn 3 cannot move through the depth-2 cut by arguing that the action would reach turn 4. The action is invalid at the current tide. A valid Wait reaches turn 4, raises the water, and allows the next move through the now-depth-3 cut.

**Flood boundary:** from turn 7, a boat already at the dry sheep pier may board the sheep. Boarding happens first; then turn 8 raises the tide and floods the now-empty pier. That is safe. Moving to the sheep pier from elsewhere as the turn-8 action is too late: arrival does not include boarding. Unloading a rabbit onto that pier as the turn-8 action is legal initially but causes a loss when the rise reaches the newly waiting rabbit. A preview must reveal that result.

## Navigation and previews

An explicit navigation commit crosses **exactly one adjacent edge**. Node or passenger selection, hover, keyboard focus, route inspection, and projected load/tide outcomes are UI state and cost no turns. They create no Undo snapshots. A remote destination must never silently commit multiple edges or fast-forward across a rise.

The UI may preview a complete hypothetical action, including the next tide and any resulting loss. It must clearly distinguish the current state from the preview. Commit must revalidate against the current gameplay state, not trust a stale preview. A blocked action explains why it is blocked and does not become a paid Wait.

Show the current occupied slots and draft, the selected route's depth, the next tide threshold, the sheep pier's flood threshold, and the effect of the selected boarding/unloading subset. Use shape, labels, or symbols as well as color. These are commitments for the eventual UI, not capabilities of the reference script.

During the eventual game's short presentation transitions, lock **Commit, Undo, and Restart** to prevent overlapping transactions; release that lock on finish, cancellation, error, visibility handling, or a fallback completion path. There must be no stale input queue. Once unlocked, Undo works on either side of a tide transition and from a win or loss. The pure reference rules have no animation state and therefore do not simulate this input lock; real input/animation integration needs independent tests.

## Invalid actions

Invalid attempts change no passenger locations, turn, tide, outcome, or Undo history. They are distinguishable from a valid action that subsequently produces a flood loss.

| Rejection                      | Condition                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `TERMINAL_STATE`               | Attempting a gameplay action after win or loss. Undo and Restart are separate commands.                                                    |
| `MALFORMED_ACTION`             | Missing/wrong payload shape or unexpected payload fields.                                                                                  |
| `UNKNOWN_ACTION`               | Action type is absent or not Move, Board, Unload, or Wait.                                                                                 |
| `UNKNOWN_NODE`                 | Move destination does not exist.                                                                                                           |
| `SAME_NODE`                    | Move destination is the current node.                                                                                                      |
| `NOT_ADJACENT`                 | No authored edge connects current and destination nodes.                                                                                   |
| `INSUFFICIENT_DEPTH`           | Edge depth at the current tide is below current draft.                                                                                     |
| `UNSAFE_BERTH`                 | Destination basin is too shallow, or proposed boarding would exceed berth depth. Shipped basins prevent these cases, but retain the guard. |
| `EMPTY_OR_MALFORMED_SELECTION` | Passenger selection is absent, empty, not an array, or contains non-string IDs.                                                            |
| `DUPLICATE_PASSENGER`          | A selection contains the same passenger more than once.                                                                                    |
| `UNKNOWN_PASSENGER`            | A selected passenger ID does not exist.                                                                                                    |
| `NO_PIER`                      | Boarding or unloading is attempted at a node without a pier.                                                                               |
| `PIER_FLOODED`                 | Boarding or unloading is attempted at an already-flooded pier.                                                                             |
| `NOT_WAITING_HERE`             | A selected boarding passenger is aboard, delivered, or waiting elsewhere.                                                                  |
| `NOT_ABOARD`                   | A selected unloading passenger is not on the boat.                                                                                         |
| `CAPACITY_EXCEEDED`            | Proposed boarding would exceed four occupied slots.                                                                                        |

The three shipped passengers occupy exactly four slots in total, so capacity overflow is unreachable in this cove. The reference guard test explicitly adds a synthetic extra rabbit; it is not shipped level content. The unsafe-berth guard likewise uses a deliberately altered synthetic berth.

## State contract

Use stable IDs from the level data and preserve each passenger in exactly one location. Do not infer occupancy or success from meshes, animation callbacks, or array indexes used to display passengers.

| State field     | Meaning                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `turn`          | Number of successfully committed gameplay actions; starts at 0.                                    |
| `tideLevel`     | Tide determined by the authored schedule and `turn`; starts at 0.                                  |
| `boatNodeId`    | Current stopping node. A transition may animate between nodes, but the rule transaction is atomic. |
| `aboard`        | Distinct passenger IDs currently on the ferry.                                                     |
| `waitingByPier` | Object mapping every pier ID to distinct waiting passenger IDs.                                    |
| `delivered`     | Distinct IDs unloaded at the harbor; these passengers cannot return.                               |
| `status`        | `playing`, `won`, or `lost`.                                                                       |
| `lossReason`    | `null`, or `PASSENGER_STRANDED` with the affected pier and passenger IDs.                          |

Load, draft, route depth, and pier dryness are derived values. If an implementation caches them, invalidate/recompute those caches from the restored state during Undo.

## Undo and restart

For each valid committed action, store its complete pre-action gameplay state. Invalid attempts and previews add nothing. Undo restores the most recent snapshot exactly and removes it from history; it costs no turn. Restore passenger locations, delivered passengers, boat position, turn, tide, outcome, and loss reason together. Clear selection/preview and reconstruct the visual state from that snapshot.

Undo remains available after a win or a flood loss when the presentation lock has released. Undoing turn 4 restores tide 0 at turn 3. Undoing turn 8 restores tide 1 at turn 7. Undoing a successful unloading puts those passengers back aboard and clears the win. At the initial state, Undo is unavailable and changes nothing.

Restart reconstructs the authored starting state, clears history and UI selection/preview, and returns to turn 0. There is no random seed to preserve. This reference design has no Redo command.

## Verification boundary

Run `node tools/verify-design.mjs --write-report` from the repository root. It checks the authored reference reducer, replays, geometry exclusions, and bounded reachability, then writes `docs/validation/design-validation.json`.

The script is **not** a production engine or a test of a playable implementation. Do not import it as the game's reducer. Implement and independently test the actual game against these rules, especially event order, input locking, previews, snapshot restoration, terminal states, and the real rendered water paths.

## Holding Pier experiment

The accepted introduction uses `data/holding-pier.level.json` and is documented in `HOLDING_PIER.md`. It retains the common action, load/draft, depth, tide-order and Undo rules above; its different layout, starting occupants and low pier elevation are intentional. Original First Crossing values and witness files remain unchanged.

## Full-width contextual interface

The contextual interface unifies safe sailing across coves: one deliberate activation commits one adjacent safe passage. Each adjacent map destination has a separate free Inspect control. Invalid or immediately losing passages open a consequence card; a losing action still requires explicit confirmation. Transfers and Wait retain preview and confirmation. This replaces the original baseline mandatory travel-confirmation policy above; it does not change validation, action cost, event order, readonly preview behavior or Undo.

## Bellwater Cove

`data/bellwater.level.json` owns Bellwater's six-stop loop and branch, three islands, names and starting state. The ferry starts empty at Harbor; Tansy and Lark wait at elevation-1 Low Pier, Bram at elevation-2 Bell Pier. All basins have base depth 3. Harbor–Shallows–Low Pier uses two base-depth-1 edges. Harbor–West Buoy–East Buoy–Low Pier uses three base-depth-3 edges. Harbor–Bell Pier is one base-depth-2 edge. Every edge is bidirectional; no other connections exist.

Capacity, passenger costs, draft bands, action costs, tide rises after actions 4 and 8, action-before-rise order and complete Undo are unchanged. Low Pier floods at the first rise; Bell Pier at the second. Boarding on actions 4 and 8 resolves before those rises. Current depth validates travel: a loaded boat at Low Pier on action 3 cannot sail into the depth-1 shallow channel, even though a future rise will deepen it. Arrival does not include boarding or unloading.

Bellwater has no mandatory Wait, action cap or score requirement. Both asymmetric route families, shallow travel both ways with a well-timed Wait, and separate rabbit boarding remain valid. Once everyone is aboard, harmless longer play stays legal. Developer witnesses and unsuccessful alternatives are documented in `BELLWATER.md` and `data/bellwater/witnesses.json`; the player interface provides rules and consequences without prescribing a plan.

The normal entry is Holding Pier. Its success offers Next cove into a fresh Bellwater state. Both coves and the explicit First Crossing baseline remain available in Menu and query routes. This small sequence adds no persistence, unlocks or new rules.
