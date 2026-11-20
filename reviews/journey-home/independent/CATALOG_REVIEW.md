# Journey Home asset catalog

I tested commit `000a1d51bdd5655448471a48d4f88d57a8b7f7b3` using Node 24.22.3 and Vitest 5.0.5 in a separate checkout. All 614 distinct inputs matched the commit’s Git blob IDs. These include 572 non-review files, all 206 paths referenced by the catalog and 42 review files beyond the non-review set. Four review files were restored directly from this commit on GitHub.

| Command | Result |
| --- | --- |
| `npm run check:assets` | 83 unique asset families validated. Exit 0. |
| `npm run test:unit -- tests/unit/asset-catalog.test.ts --maxWorkers=1` | 6 of 6 tests passed. Exit 0. |
