# Last Ferry — repository guidance

## Objective

**Current checkpoint: Android playtest of the reviewed seven-cove Journey.** ORCHARD_JOURNEY_01 is implemented at `9c7a05785a021538c996f5dcd4b03415d1a35080`, independently reviewed and published to the existing private Site as **version 20**. Read [active project state](docs/PROJECT_STATE.md), [publication review](reviews/orchard-journey/PUBLICATION_REVIEW.md) and [receipt](reviews/orchard-journey/deployment-confirmation.json). The earlier named task is complete; do not repeat its implementation.

The Journey runs Holding Pier → Bellwater → Driftwood Yard → Two Shelters → Nell's launch → Wide Berth → Reef Return → Orchard Landing. All eight Practice entrances remain. Five later planned coves are not playable. Collect the user's Android feedback on continuation, the Orchard encounter and puzzle, lantern acceptance, readability and smoothness before commissioning C8. No new implementation task is authorized by this checkpoint alone.

Preserve all accepted puzzles, Orchard target 13 / mastery revision 1, Practice bests, unrestricted Undo, provisional victory acceptance, original-byte backups and Practice isolation. Preserve the established visual/audio style and mobile controls. Do not add C8, rebalance Orchard or claim the twelve-cove campaign is complete without a new scoped task.

The Site now serves game `9c7a05785a021538c996f5dcd4b03415d1a35080` from hosting source `ffc5eebfd8520735b231ffe6fedf1b3a54757f9a`. Its custom private audience is unchanged. Preserve publication history and the existing audience; future publication uses the supported shared-Site flow. Never copy recipient contact details into this public repository. Physical-phone, listening and spoken screen-reader acceptance remain open.

## Read and preserve the project decisions

- Read `FIRST_TASK.md`, `docs/GAMEPLAY_RULES.md`, `data/first-crossing.level.json`, and `docs/FIRST_COVE.md` before implementing gameplay.
- Inspect `references/first-crossing.png` visually; read `docs/ART_DIRECTION.md` and `docs/ASSET_PLAN.md` before building the scene.
- General mechanics belong in `docs/GAMEPLAY_RULES.md`; exact first-level values belong in the JSON level. Explanatory prose and generated art do not override them. Resolve a material contradiction explicitly rather than silently changing a rule.
- Use the TypeScript/Vite/Three.js architecture in `docs/TECHNICAL_PLAN.md`. Keep game state independent of rendering and animation.
- Preserve user changes and any applicable repository instructions. Make routine implementation choices without repeated confirmation. Follow the user's current Git workflow and authorization for remote actions; never force-push.
- Reuse existing asset families before adding near-duplicates. The same change that adds, replaces or retires an asset family must update `assets/catalog.json`, its gallery/evidence entry and provenance in `docs/ASSET_LEDGER.md`. Keep instances in level data, editable sources local, and human acceptance separate from integration. Run `npm run check:assets` after inventory changes.

## Implementation priorities

1. Clear and correct player interaction: action previews, one commitment per input, deterministic turns, and undo.
2. Recognizable 3D ferry, passengers, islands, and lighthouse; coherent camera, water, and lighting.
3. A complete rescue loop and a small satisfying arrival.
4. Focused tests and reviewable evidence tied to the actual implementation.

Code-built geometry is acceptable when it meets the art direction. Raw primitives are an intermediate checkpoint, not sufficient final art. Do not use a concept image as a background with clickable hotspots to stand in for the 3D game.

## Verification

The starter includes `node tools/verify-design.mjs` as an independent design check. It is not the game runtime. Build the actual reducer, controls, and renderer; test them independently and replay the supplied action sequences against them.

After creating the app, provide `npm run dev`, `npm run build`, `npm run typecheck`, `npm run test:unit`, and `npm run test:e2e` as specified in `docs/TECHNICAL_PLAN.md`. Run the checks relevant to the work. Once remaining concrete risks are covered, avoid redundant tests and speculative infrastructure.

Use the real interface for at least one complete rescue and one undo across a tide rise. Capture gameplay at desktop and phone landscape sizes. Screenshots support visual review; a state-only test cannot establish visual quality. If browser/device/video tooling is unavailable, record what is unverified and provide reproducible manual steps. Never fabricate a passed check or a gameplay capture.

## Code Review Rules

Flag preview code that mutates committed state; tide/flood event-order errors; passenger duplication/loss; partial undo; actions accidentally triggered twice; paths crossing land; inaccessible controls; misleading visual state; unsupported verification claims; and scope expansion beyond the task.

Prefer actionable findings with reproduction and consequences. Separate verified defects from visual preferences and untested risks. Follow `docs/REVIEW_WORKFLOW.md` and the review templates.

## Completion

For the next scoped task, maintain `STATUS.md`, the active project state and focused evidence. Keep PR #1 draft and GitHub `main` unchanged. Follow the user's current publication instruction, preserve the Site's custom named-viewer access, and retain all earlier tasks and publication receipts as history.
