# Unit verification

Ran on Windows with Node 24.15.0 and Vitest 5.0.5. All runs used one worker and the repository's existing timeout settings.

| Run | Result | Duration |
| --- | --- | --- |
| `npm.cmd run test:unit -- --maxWorkers=1` | 740 of 743 passed. Two files reported three elapsed-time failures. | 255.38 s |
| `npm.cmd run test:unit -- tests/unit/two-shelters-geometry.test.ts tests/unit/clearance.test.ts --maxWorkers=1` | 18 of 18 passed across both original failure files. | 15.77 s |
| `node node_modules/vitest/vitest.mjs run tests/unit/next-water-change.test.ts tests/unit/depth-reading.test.ts tests/unit/optional-tips.test.ts tests/unit/direct-transfer.test.ts --maxWorkers=1` | 23 of 23 passed, including the final boarding wording for one or both rabbits. | 0.81 s |

After the final production captures, a second full run passed all 743 tests in 64 files at the original limits (61.72 seconds). [Final run and exact command](unit-final.json)

The original run exceeded the 5 s ferry-clearance limit at Driftwood Yard (10.487 s) and Two Shelters (47.227 s). The Two Shelters transfer-foot support test exceeded its 30 s limit (32.245 s). All three passed on the unchanged-threshold file retry. No collision or support assertion failed.

The water-change tests replay Holding's occupied-pier countdown across boarding and the completed tide rise. They also check simultaneous floods, an actual scheduled current reversal, a dry bridge winch and terminal-state behavior. The depth tests compare projected load against the water before the action, separate passage from arrival-basin depth, cover equality and over-capacity, and replay both Far Shore approaches to Rush Landing. The Tips and transfer tests cover optional forecasts, passenger subsets and the distinction between direct and confirmed actions.
