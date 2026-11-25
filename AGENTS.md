# Last Ferry — repository guidance

## Objective

**Active task — [Moss’s invitation at Holding Pier](NEXT_TASK_MOSS_INVITATION.md).** Make the optional Holding Pier replay, Moss’s wish and the illustrated page legible together. Show the current lantern count on the reward card. [v0.1.5 phone evidence](reviews/journey-rewards/android-REVIEW.md)

The [private phone playtest](https://last-ferry-playtest.abumech.chatgpt.site/) serves **version 30**, the production web game shipped with Android v0.1.5 from `89a05f41a8f96a0c4f2f2b2045d9dca077de3269`. Journey opens twelve coves through play. The Harbor log offers earned revisits. [Verified package contents](reviews/journey-rewards/android-package.json).

Work from `m1-first-crossing` and incorporate newer work safely. Local Codex hands off development through draft PR #1. Game direction reviews the play experience. The owner controls the Play account, signing credentials, pricing and production release.

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
