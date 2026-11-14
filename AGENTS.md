# Last Ferry — repository guidance

## Objective

**THREE_LANTERNS_01** is the current assignment: read root [NEXT_TASK_THREE_LANTERNS.md](NEXT_TASK_THREE_LANTERNS.md), [difficulty and mastery direction](docs/DIFFICULTY_AND_MASTERY.md), and [preparation review / verified targets](reviews/three-lanterns-preparation/REVIEW.md). The player has accepted the Orchard repair. Implement the existing optional three-lantern system while preserving all accepted puzzles.

Start from accepted runtime `9933303178da04cac93ddc820ef55e181286d983` plus this task/continuity update. Preserve newer/unrelated work. All eight current Practice coves are eligible; the six matching Journey coves share their results. Orchard remains Practice-only and First Crossing remains independent training. Do not add coves, integrate Orchard's story, rebalance data or change the strict Journey save schema in this task.

Keep unrestricted Undo. Use final-route actions and successful attempt-level Undos; a win stays provisional until the player actually continues, leaves or restarts. Opening the cove picker or Settings does not accept it. Store real accepted bests separately from Journey. Older rescues remain completed and unrated until a scored replay. The named task specifies the compact UI and verification; choose implementation details independently.

Read active `docs/PROJECT_STATE.md` and preserve the latest publication receipt. The Site remains version 19 with its custom private audience. Preserve that audience and all publication history; future publication uses the supported shared-Site flow. Do not copy recipient contact details into this public repository. **Do not deploy this task.**

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
