# Bellwater Cove — developer notes

Bellwater is the second authored puzzle after the accepted Holding Pier introduction. The task is `NEXT_TASK.md`; exact values and geometry are in `data/bellwater.level.json`. These notes contain solutions for development and review. They are not player instructions.

## Decision to test

The player chooses which route to take in each direction as the water changes, then decides whether to deliver the rabbits when passing Harbor or continue to the second pickup. Free inspection explains current depth and each action's immediate consequence. The two pickup deadlines remain visible. Difficulty and satisfaction require the user's playtest; solver counts and turn counts do not establish either.

Tansy and Lark are new rabbits at Low Pier; Bram is a new sheep at Bell Pier. Pip, Rue and Moss remain in the two earlier coves. Naming is small level-owned metadata; species and slot costs retain their existing models and rules.

## Exact network

All six basins have base depth 3. Harbor is elevation 3, Low Pier elevation 1, Bell Pier elevation 2. Shallows, West Buoy and East Buoy are stopping buoys without piers. Each edge below is bidirectional and costs one action:

| Connection          | Base depth |
| ------------------- | ---------: |
| Harbor–Shallows     |          1 |
| Shallows–Low Pier   |          1 |
| Harbor–West Buoy    |          3 |
| West Buoy–East Buoy |          3 |
| East Buoy–Low Pier  |          3 |
| Harbor–Bell Pier    |          2 |

Capacity 4, rabbit 1 slot, sheep 2 slots. Empty draft 1; load 1–2 draft 2; load 3–4 draft 3. Each accepted sailing, boarding, unloading or waiting action costs one. Tide rises after actions 4 and 8. Apply the action before the rise and flood check; validate movement at the current tide. Inspection and Undo cost no action. No mandatory Wait or upper action limit exists.

## Representative ten-action rescues

| Action | Shallow outward / deep return    | Deep outward / shallow return    |
| -----: | -------------------------------- | -------------------------------- |
|      1 | Harbor → Shallows                | Harbor → West Buoy               |
|      2 | Shallows → Low Pier              | West Buoy → East Buoy            |
|      3 | Board Tansy and Lark             | East Buoy → Low Pier             |
|      4 | Low Pier → East Buoy; tide rises | Board Tansy and Lark; tide rises |
|      5 | East Buoy → West Buoy            | Low Pier → Shallows              |
|      6 | West Buoy → Harbor               | Shallows → Harbor                |
|      7 | Harbor → Bell Pier               | Harbor → Bell Pier               |
|      8 | Board Bram; tide rises           | Board Bram; tide rises           |
|      9 | Bell Pier → Harbor               | Bell Pier → Harbor               |
|     10 | Deliver everyone                 | Deliver everyone                 |

The shallow route works both ways with one Wait at Harbor before departure, Shallows, or Low Pier before or after boarding both rabbits. Boarding Tansy and Lark separately on actions 3 and 4 also works, in either order. The eight shortest witnesses are retained in `data/bellwater/witnesses.json`. Tests replay them through the production reducer and preserve longer harmless play after the second pickup.

## Meaningful failed or blocked plans

- Bell Pier first misses the rabbits' first-rise pickup deadline.
- Deep outer route both ways reaches Harbor on action 7 and Bell Pier on action 8; arrival does not board Bram, who is still waiting when the pier floods.
- Delivering even one rabbit before boarding Bram consumes the remaining pickup window.
- After boarding both rabbits on action 3, shallow return is blocked: boat needs depth 2, current passage has depth 1. Inspection is free and cannot advance the tide.

The canonical search checks actual route and timing constraints. It does not gate UI on a particular visited-state count. A valid rescue must use the shallow route, cannot start toward Bell Pier and cannot deliver anyone before boarding Bram. At least one rescue requires no Wait.

## Authored place and clearance

The triangular inlet has a safe western lighthouse shore, a low sandy reed shore to the east, and a rocky bell shore behind the inner channel. The bell is a landmark. Shared water remains unchanged; its shallow treatment follows the authored edges. Route geometry, island footprints and piers are authored together in the level JSON, with only necessary scenery anchors and camera choices in `src/scene/layout.ts`.

Clearance checks sample the actual modeled ferry footprint and production journey transform in both directions along every edge, including endpoint turns and pier approaches. They supplement visual playthroughs; they do not claim continuous collision physics or native-device performance.

## Entry and review

No query starts Holding Pier. Its successful ending offers Next cove with a brief coast transition, then opens `/?cove=bellwater` at turn 0, empty at Harbor. Menu also selects Bellwater or either earlier cove. `/?cove=first-crossing` preserves the baseline. Undo and Restart remain available at endings; Bellwater's ending acknowledges its neighbors without claiming the whole story is finished.

See `reviews/bellwater/REVIEW.md` for executed checks, source identity, actual gameplay captures and remaining verification limits. The broader shared water/shore/lighting pass is a later milestone.
