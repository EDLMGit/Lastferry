# Last Ferry — repository guidance

## Objective

**Current task: [TERNHAVEN_JOURNEY_01](NEXT_TASK_TERNHAVEN_JOURNEY.md).** Continue the accepted campaign plan by adding Ternhaven as Journey cove eight after Orchard Landing, with one short illustrated encounter and safe explicit continuation for completed-seven saves. Read the named task, active [project state](docs/PROJECT_STATE.md), [story continuity](campaign/STORY_SCENES.md) and [mastery contract](docs/DIFFICULTY_AND_MASTERY.md).

ARRIVAL_BUBBLE_01 is implemented at `a2740e61ec5a782f558ea6caad4181466d04e9f7`, independently reviewed and published as **Site version 21**, hosting `ea3bed5c0aaf41e4ba516e4621da0f81119e652b`. [Review](reviews/arrival-bubble/INDEPENDENT_REVIEW.md) · [Receipt](reviews/arrival-bubble/deployment-confirmation.json). Preserve its centered mobile card, original lanterns, complete rescued cast, clear actions, safe bounds, native dialog/fullscreen, finite animation and exact provisional acceptance. Earlier arrival-task instructions prohibiting the Journey append described that completed task; this named task now authorizes the append.

Keep accepted **`ternhaven@1`, target 14**, all other targets and existing bests. Ternhaven's exact puzzle and 13/14/14-action witnesses remain unchanged. The published runtime still has seven Journey coves and nine Practice entrances; the new task produces eight Journey coves and retains nine Practice entrances. No C9, new rule, rebalance or final supper belongs to this pass.

The new scene settles at open-water Tern Buoy with Juniper, Sedge and tan Fennel already aboard the full six-space ferry; Willow waits at Reed Landing. Tern Buoy has no pier. Nobody boards or stages during the illustration. Preserve previously rescued neighbors, all old save compatibility and backups, Practice isolation and unrestricted complete Undo. A Practice best must not skip the scene or complete a Journey cove.

Local Codex implements and hands off; ChatGPT reviews and handles publication separately. Incorporate this task commit without discarding newer work. Do not deploy in the implementation pass. Preserve Site version 21's custom private audience and publication history; never copy recipient contact details into the public repository. Physical-phone, fresh listening and spoken screen-reader testing remain unverified. The user's deferred playtest is not a new gate on this contained task.

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
