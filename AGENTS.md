# Last Ferry — repository guidance

## Objective

**Current task: [ARRIVAL_BUBBLE_01](NEXT_TASK_ARRIVAL_BUBBLE.md).** The user positively received the latest two levels and lantern mechanic and requested a centered floating mobile result card with prominent lantern rewards, proper action icons and a rescued-animal showcase. Their third supplied reference guides hierarchy; preserve Last Ferry's original teal, ivory, sea-glass and warm brass style. Read the named task, [active state](docs/PROJECT_STATE.md), [art direction](docs/ART_DIRECTION.md) and [mastery contract](docs/DIFFICULTY_AND_MASTERY.md).

Reviewed implementation is `291d8f2a9570d833709e10815db12bd5c1fe75cc`. COVE_EIGHT_PRACTICE_01 is implemented: Ternhaven is the ninth independent Practice entrance. Fresh independent production-proof execution reproduced minimum 13 and both distinct 14-action strategies. No blocker was found in that scoped review. Accept **Ternhaven target 14 / revision 1** for registration in the new UI pass. [Independent review and evidence](reviews/cove-eight-practice/INDEPENDENT_REVIEW.md). Keep all earlier targets/bests and the exact puzzle/witness data.

Center the won-result card within the actual safe visible rectangle in both phone orientations. Make the three lanterns and every rescued identity readable, including passengers delivered before the final unloading. Reuse accepted portraits/icons, author a distinct Replay icon and preserve native dialog/fullscreen, focus, unrestricted Undo and provisional result acceptance. Keep stable card bounds and coherent Harbor framing. Scope the design to successful arrival; normal action previews and failure behavior retain their contracts.

The Journey remains seven coves: Holding → Bellwater → Driftwood → Two Shelters → Nell's launch → Wide → Reef → Orchard. The launch is a boundary, not another cove. No Ternhaven Journey append, scene, migration, C9 or puzzle rebalance is authorized by this task. Preserve original-byte backups, Practice isolation, accepted art/audio, water, ferry and sailing.

Local Codex implements and hands off; ChatGPT reviews and handles publication separately. Incorporate this task commit without discarding newer work. Do not deploy in the implementation pass. The recorded Site remains version 20, game `9c7a05785a021538c996f5dcd4b03415d1a35080`, hosting source `ffc5eebfd8520735b231ffe6fedf1b3a54757f9a`. Preserve its custom private audience and publication history. Never copy recipient contact details into this public repository. Positive user feedback is not a new instrumented Android, listening or spoken screen-reader test.

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
