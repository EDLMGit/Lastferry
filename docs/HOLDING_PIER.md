# The Holding Pier — playable experiment

This experiment tests whether the player discovers a useful temporary stop. It is separate from the unchanged First Crossing data. Start with `npm run dev` and open `/?cove=holding-pier`; the cove selector returns to the baseline. There is no progression or new mechanic.

## Contract

`data/holding-pier.level.json` owns the new topology and starting arrangement. `docs/GAMEPLAY_RULES.md` still owns the common atomic rules: validate current depth → transfer/move → advance one turn → tide rise → flood loss → success. The experiment overrides only layout, initial occupants and pier elevations from the original cove. Capacity 4, load/draft bands 0/1, 1–2/2, 3–4/3, action cost 1 and rises after 4/8 are unchanged. All basins are depth 3. Harbor–Stone is depth 3; Stone–Shallows–Rabbit consists of two depth-1 edges. Piers are dry only below their elevation: Stone/Harbor 3, Rabbit 1.

## Developer witness (not shown in the game)

| Action | Decision | State afterward |
| --- | --- | --- |
| 1 | Unload Moss at Stone Pier | Empty, draft 1; Moss safe ashore |
| 2 | Sail to Shallows | Tide 0, depth 1 |
| 3 | Sail to Rabbit Pier | Both rabbits waiting; last dry action available |
| 4 | Board Pip and Rue together | Tide 1 rises afterward; empty Rabbit Pier floods |
| 5 | Sail back to Shallows | Load 2/draft 2 equals channel depth 2 |
| 6 | Sail to Stone Pier | Moss still safe |
| 7 | Board Moss | Load 4/draft 3 |
| 8 | Sail to Harbor | Deep edge supports the boat before rise to tide 2 |
| 9 | Unload everyone | All three delivered; success |

Machine-readable witness: `data/experiments/holding-pier-solution.json`.

## Decisions to observe in a player session

The shortest-looking first task is delivering the sheep already aboard. That detour consumes the rabbits' dry boarding window. Waiting opens the channel at exactly the moment it floods their pier. The useful decision is treating the high Stone Pier as temporary storage: a passenger can be safe without already being home. On return, the deeper channel carries two rabbits but not the full boat; the sheep can join where the remaining passage is deep.

These are designer expectations, not measured enjoyment. Do not add an on-screen solution. Labels expose safe/low height, the deadline, current load/draft/depth, and the available non-delivery unload. They do not name a required first action.

## Interaction experiment

The baseline keeps its select/confirm navigation for comparison. In Holding Pier, one click, tap, Enter or Space on an available safe passage commits exactly one edge/turn. Its button already shows the cost, current depth/draft and any next-action rise. A separate Preview button is free and cancellable. Canvas waypoint activation has the same semantics. Invalid or immediately losing moves open the preview instead of committing; deliberately confirming a loss remains possible. Passenger transfers and Wait retain explicit preview/confirmation. All commits revalidate and share the existing presentation lock and complete Undo. No hover/focus changes the simulation.

## Verification

The focused unit search uses the actual reducer and legal-action enumeration, all passenger subsets, both directions of every edge, Wait and arbitrary detours. Turn counts are canonicalized only after the final tide rise, when all later turns have equivalent futures. This is a finite exhaustive reachability check, not a fixed action horizon. The search tracks whether Moss was ever unloaded at Stone and rejects any winning route without that event. Undo cannot add a state outside the reachable graph.

See `reviews/holding-pier/REVIEW.md` for executed results, real UI checks, source identity, screenshots, uninterrupted recording and limitations. Discovery satisfaction requires a first-time-player session after this implementation experiment.
