# Lantern Reach asset verification

Verified against `5f28d71566463462b9407e34b0bf236bb05e20c6` in a separate local checkout on Node 24.22.3 and Vitest 5.0.5. Copied the 552 non-review files that matched their Git blob IDs and restored all 37 additional catalog evidence files directly from GitHub. The 37 files totaled 5,494,624 bytes. Each matched the exact commit tree’s byte count and Git blob ID before the tests ran. The checkout used a separate copy of the installed dependencies. The validation source and test file matched the commit.

| Command | Local result |
| --- | --- |
| `npm run test:unit -- tests/unit/asset-catalog.test.ts --maxWorkers=1` | 6/6 tests passed in one file. Exit 0. |
| `npm run check:assets` | Asset catalog valid, 83 unique families. Exit 0. |
